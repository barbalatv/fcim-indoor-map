/* Pure civil-time schedule evaluation. No SVG, room binding, DOM or storage access. */
(function (global) {
  "use strict";
  var DAY = 86400000;
  function dateDay(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    var stamp = Date.parse(value + "T00:00:00Z");
    return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0, 10) === value ? stamp / DAY : null;
  }
  function dayDate(day) { return new Date(day * DAY).toISOString().slice(0, 10); }
  function timeMinute(value) {
    if (typeof value !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
    return Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
  }
  function localTime(instant, timeZone) {
    var d = new Date(instant);
    if (!Number.isFinite(d.getTime())) throw new Error("Invalid timestamp");
    var parts = new Intl.DateTimeFormat("en-GB", { timeZone: timeZone, calendar: "gregory", numberingSystem: "latn", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d);
    var p = Object.fromEntries(parts.map(function (v) { return [v.type, v.value]; }));
    return { date: p.year + "-" + p.month + "-" + p.day, time: p.hour + ":" + p.minute, timeZone: timeZone };
  }
  function academicWeek(date, context) {
    var day = dateDay(date), anchor = dateDay(context.weekAnchorDate);
    if (day === null || anchor === null || !Number.isInteger(context.weekAnchorNumber) || context.weekAnchorNumber < 1 || context.parityDefinition !== "anchor-number-modulo-2") return null;
    var n = context.weekAnchorNumber + Math.floor((day - anchor) / 7);
    return n > 0 ? { number: n, parity: n % 2 ? "odd" : "even" } : null;
  }
  function validateLesson(l) {
    if (!l || typeof l !== "object" || Array.isArray(l)) return "Not a lesson record";
    if (typeof l.id !== "string" || !l.id.trim() || typeof l.group !== "string" || !l.group.trim() || typeof l.subject !== "string" || !l.subject.trim()) return "Missing id, group or subject";
    if (!Number.isInteger(l.weekday) || l.weekday < 1 || l.weekday > 7) return "weekday must be ISO 1..7";
    var start = timeMinute(l.startTime), end = timeMinute(l.endTime);
    if (start === null || end === null || start >= end) return "Invalid or overnight lesson times";
    if (l.weekParity != null && !["odd", "even", "both"].includes(l.weekParity)) return "Unknown week parity";
    if (l.room != null && typeof l.room !== "string") return "room must be a string or null";
    if (l.buildingId != null && typeof l.buildingId !== "string") return "Invalid buildingId";
    if (l.subgroup != null && (typeof l.subgroup !== "string" || !l.subgroup.trim())) return "Invalid subgroup";
    if (l.teacher != null && typeof l.teacher !== "string") return "Invalid teacher";
    if (l.courseYear != null && (!Number.isInteger(l.courseYear) || l.courseYear < 1)) return "Invalid course year";
    if (l.academicYear != null && typeof l.academicYear !== "string") return "Invalid academic year";
    if (!["mock", "timetable"].includes(l.source)) return "Missing or unknown source";
    for (var field of ["validFrom", "validUntil"]) if (l[field] != null && dateDay(l[field]) === null) return "Invalid " + field;
    if (l.validFrom && l.validUntil && l.validFrom > l.validUntil) return "Reversed validity range";
    for (var dates of ["specificDates", "excludedDates"]) if (l[dates] != null && (!Array.isArray(l[dates]) || l[dates].some(function (d) { return dateDay(d) === null; }))) return "Invalid " + dates;
    if (l.weekNumbers != null && (!Array.isArray(l.weekNumbers) || l.weekNumbers.some(function (n) { return !Number.isInteger(n) || n < 1; }))) return "Invalid weekNumbers";
    return null;
  }
  function occurs(l, date, context) {
    var day = dateDay(date), weekday = ((day + 3) % 7 + 7) % 7 + 1;
    if (weekday !== l.weekday || (l.academicYear && l.academicYear !== context.academicYear)) return false;
    if ((l.validFrom && date < l.validFrom) || (l.validUntil && date > l.validUntil)) return false;
    if (l.specificDates && !l.specificDates.includes(date)) return false;
    if (l.excludedDates && l.excludedDates.includes(date)) return false;
    var week = academicWeek(date, context);
    if (l.weekParity && l.weekParity !== "both" && (!week || week.parity !== l.weekParity)) return false;
    if (l.weekNumbers && (!week || !l.weekNumbers.includes(week.number))) return false;
    return true;
  }
  function evaluate(dataset, selection) {
    var c = dataset.context || {}, date = selection.date, minute = timeMinute(selection.time), day = dateDay(date);
    var result = { date: date, time: selection.time, timeZone: c.timeZone, week: null, active: [], groupActive: [], next: [], issues: [], coverage: dataset.coverage || "unknown", contextStatus: "valid" };
    var first = dateDay(c.startDate), last = dateDay(c.endDate);
    if (day === null || minute === null || first === null || last === null || first > last || last - first > 730 || !c.academicYear || !c.timeZone) {
      result.contextStatus = "invalid"; result.issues.push({ id: null, message: "Missing or invalid date/time/academic context (maximum two years)" }); return result;
    }
    try { localTime(0, c.timeZone); } catch (_) { result.contextStatus = "invalid"; result.issues.push({ id: null, message: "Invalid time zone" }); return result; }
    if (day < first || day > last) { result.contextStatus = "outside-coverage"; return result; }
    result.week = academicWeek(date, c);
    var valid = [];
    if (!Array.isArray(dataset.lessons)) { result.contextStatus = "invalid"; result.issues.push({ id: null, message: "lessons must be an array" }); return result; }
    var counts = new Map();
    dataset.lessons.forEach(function (l) { if (l && typeof l.id === "string") counts.set(l.id, (counts.get(l.id) || 0) + 1); });
    dataset.lessons.forEach(function (l, index) {
      var error = validateLesson(l);
      if (error) { result.issues.push({ id: l && l.id || null, index: index, message: error, record: l }); return; }
      if (counts.get(l.id) > 1) result.issues.push({ id: l.id, index: index, message: "Duplicate lesson id; records retained", record: l });
      if ((l.weekParity && l.weekParity !== "both" || l.weekNumbers) && !academicWeek(date, c)) {
        result.issues.push({ id: l.id, index: index, message: "Week context unavailable; restricted record not evaluated", record: l }); return;
      }
      valid.push(l);
    });
    function groupMatch(l) { return l.group === selection.group && (!selection.subgroup || !l.subgroup || l.subgroup === selection.subgroup) && (!selection.courseYear || !l.courseYear || l.courseYear === selection.courseYear); }
    result.active = valid.filter(function (l) { return occurs(l, date, c) && minute >= timeMinute(l.startTime) && minute < timeMinute(l.endTime); });
    result.groupActive = result.active.filter(groupMatch);
    if (selection.group && !result.groupActive.length) {
      // Search the explicit fixture/adapter coverage, never invent a semester anchor.
      for (var nextDay = day; nextDay <= last; nextDay++) {
        var nextDate = dayDate(nextDay);
        var upcoming = valid.filter(function (l) { return groupMatch(l) && occurs(l, nextDate, c) && (nextDay > day || timeMinute(l.startTime) > minute); });
        if (upcoming.length) {
          var earliest = Math.min.apply(null, upcoming.map(function (l) { return timeMinute(l.startTime); }));
          result.next = upcoming.filter(function (l) { return timeMinute(l.startTime) === earliest; }).map(function (l) { return { date: nextDate, lesson: l }; });
          break;
        }
      }
    }
    return result;
  }
  function aggregate(lessons, resolve) {
    var rooms = new Map(), unresolved = [];
    lessons.forEach(function (lesson) {
      var location = resolve(lesson);
      if (location.status === "outside-building") return; // not part of Building 3 coverage
      var key = location.roomCode;
      if (!key) { unresolved.push({ lesson: lesson, location: location }); return; }
      if (!rooms.has(key)) rooms.set(key, { roomCode: key, spaceId: location.spaceId, floorLevel: location.floorLevel, status: location.status, provenance: location.provenance, lessons: [], locations: [] });
      var occupancy = rooms.get(key);
      if (!occupancy.locations.length && location.spaceIds) { occupancy.spaceIds=location.spaceIds.slice().sort(); occupancy.primarySpaceId=location.primarySpaceId; }
      var componentKey=function (x) { return JSON.stringify((x.spaceIds || (x.spaceId ? [x.spaceId] : [])).slice().sort()); };
      if (componentKey(occupancy) !== componentKey(location) || occupancy.floorLevel !== location.floorLevel || occupancy.status !== location.status) {
        occupancy.spaceId = null; occupancy.floorLevel = null; occupancy.status = "ambiguous-binding";
        if (occupancy.spaceIds) { occupancy.spaceIds=[]; occupancy.primarySpaceId=null; }
      }
      occupancy.lessons.push(lesson); // no last-write-wins, including duplicate records
      occupancy.locations.push(location);
    });
    return { rooms: Array.from(rooms.values()), unresolved: unresolved };
  }
  var api = { evaluate: evaluate, aggregate: aggregate, localTime: localTime, academicWeek: academicWeek, dateDay: dateDay, validateLesson: validateLesson };
  global.FCIM_SCHEDULE = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
