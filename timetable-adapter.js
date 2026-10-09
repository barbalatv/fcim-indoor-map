/* Validated external v2 events. No fictitious v1 semester date range. */
(function (global) {
  "use strict";
  var days = ["Luni", "Marți", "Miercuri", "Joi", "Vineri"];
  var kinds = ["lecture", "lab", "seminar", "practice", "physical_education", "language", "project", "individual_group_activity", "unknown"];
  function fail(message) { throw new Error("Invalid timetable: " + message); }
  function record(value, name) { if (!value || typeof value !== "object" || Array.isArray(value)) fail(name); return value; }
  function string(value, name, nullable, blank, max) {
    if (nullable && value === null) return value;
    if (typeof value !== "string" || value.length > (max || 4000) || !blank && !value.trim()) fail(name);
    return value;
  }
  function array(value, name, max) { if (!Array.isArray(value) || value.length > (max || 10000)) fail(name); return value; }
  function strings(value, name, max) { return array(value, name, max).map(function (v) { return string(v, name, false, false); }); }
  function minute(value) { return typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value) ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3)) : null; }
  function dateDay(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    var stamp = Date.parse(value + "T00:00:00Z");
    return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0, 10) === value ? stamp / 86400000 : null;
  }
  function timestamp(value, name, nullable) {
    string(value, name, nullable, false, 100);
    if (value !== null && (!/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value)))) fail(name);
    return value;
  }
  function httpUrl(value, name) {
    string(value, name, false, false, 4000);
    try { var url = new URL(value); if (url.protocol !== "https:" || url.username || url.password) fail(name); return url; } catch (_) { fail(name); }
  }
  function normalize(payload, status, expectedCourse, policy, fetchedAt) {
    if (![1, 2].includes(expectedCourse)) fail("requested course");
    record(payload, "schedule"); record(status, "status"); var m = record(payload.metadata, "metadata"), s = record(status.schedule, "status.schedule");
    if (payload.course_year !== expectedCourse || m.course_year !== expectedCourse || status.course_year !== expectedCourse || s.course_year !== expectedCourse || status.has_schedule !== true || status.ok !== true) fail("course/schedule mismatch");
    if (status.timezone !== "Europe/Chisinau") fail("timezone");
    var keys = ["academic_year", "semester", "source_kind", "source_pdf_url", "source_pdf_hash", "parser_version", "downloaded_at", "parsed_at"];
    keys.forEach(function (key) { if (m[key] !== s[key]) fail("revision mismatch: " + key); });
    string(m.academic_year, "academic year", true); string(m.semester, "semester", true);
    if (m.academic_year !== null && !/^\d{4}\/\d{4}$/.test(m.academic_year)) fail("academic year format");
    if (!["live", "wayback", "seed", "manual"].includes(m.source_kind)) fail("source kind");
    if (!["direct", "broker"].includes(m.source_transport)) fail("source transport");
    if (typeof m.source_pdf_hash !== "string" || !/^[a-f\d]{64}$/i.test(m.source_pdf_hash)) fail("PDF hash");
    string(m.parser_version, "parser version"); string(m.source_snapshot_id, "snapshot id", true);
    string(m.pdf_title, "PDF title", true, true); string(m.etag, "etag", true, true); string(m.last_modified, "last modified", true, true);
    timestamp(m.downloaded_at, "downloaded at"); timestamp(m.parsed_at, "parsed at");
    var pdf = httpUrl(m.source_pdf_url, "PDF URL"), page = httpUrl(m.source_page_url, "page URL");
    var regular = pdf.hostname === "fcim.utm.md" && page.hostname === "fcim.utm.md" &&
      new RegExp("/anul_" + (expectedCourse === 1 ? "i" : "ii") + "_semestrul_[ivx]+(?:-\\d+)?\\.pdf$", "i").test(pdf.pathname) &&
      (page.pathname.includes("/orar") || page.pathname === "/wp-json/wp/v2/pages");
    var groups = strings(payload.groups, "groups", 2000);
    if (!groups.length || new Set(groups).size !== groups.length) fail("empty/duplicate groups");
    strings(payload.days, "days", 5).forEach(function (day) { if (!days.includes(day)) fail("day"); });
    var slots = array(payload.time_slots, "time slots", 100).map(function (slot) {
      record(slot, "slot"); if (!Number.isInteger(slot.index) || slot.index < 0 || minute(slot.start_time) === null || minute(slot.end_time) === null || slot.start_time >= slot.end_time) fail("slot");
      string(slot.raw, "slot raw", false, true); return { startTime: slot.start_time, endTime: slot.end_time };
    });
    var source = record(status.source, "status.source");
    var anchor = string(source.odd_week_anchor, "odd week anchor", false, true, 100);
    timestamp(source.last_success_at, "last success", true); timestamp(source.last_check_at, "last check", true);
    string(source.parity_note, "parity note", true, true);
    var warnings = strings(payload.warnings, "warnings", 10000);
    var rawLessons = array(payload.lessons, "lessons", 10000);
    if (payload.count !== rawLessons.length || s.lessons !== rawLessons.length || s.groups !== groups.length) fail("incomplete full response");
    var revision = JSON.stringify([expectedCourse, m.source_pdf_hash, m.parser_version, m.downloaded_at, m.parsed_at]);
    var ids = new Set(), memberships = [];
    var events = rawLessons.map(function (l) {
      record(l, "lesson"); string(l.id, "lesson id", false, false, 300);
      if (ids.has(l.id)) fail("duplicate lesson id"); ids.add(l.id);
      if (!days.includes(l.day) || !Number.isInteger(l.slot_index) || l.slot_index < 0 || !Number.isInteger(l.slot_span) || l.slot_span < 1) fail("lesson day/slot");
      if (minute(l.start_time) === null || minute(l.end_time) === null || l.start_time >= l.end_time) fail("lesson time");
      var memberGroups = Array.from(new Set(strings(l.groups, "lesson groups", 2000)));
      if (!memberGroups.length || memberGroups.some(function (g) { return !groups.includes(g); })) fail("unknown group membership");
      string(l.subject, "subject"); string(l.teacher, "teacher", true, true); string(l.room, "room", true, true); string(l.subgroup, "subgroup", true, true);
      if (!["odd", "even", "both", "unknown"].includes(l.week_parity) || !kinds.includes(l.lesson_type)) fail("parity/type");
      if (typeof l.uncertain !== "boolean" || typeof l.confidence !== "number" || !Number.isFinite(l.confidence) || l.confidence < 0 || l.confidence > 1) fail("parser confidence");
      strings(l.notes, "notes", 100); string(l.raw_text, "raw text", false, true, 20000);
      var geometry = record(l.geometry, "PDF geometry");
      if (!Number.isInteger(geometry.page) || geometry.page < 1 || ["x0", "y0", "x1", "y1"].some(function (key) { return !Number.isFinite(geometry[key]); })) fail("PDF geometry");
      var eventKey = JSON.stringify(["barbalatv/utm-curs-i-orar-2027", revision, l.id]);
      var event = { id: eventKey, sourceLessonId: l.id, revision: revision, courseYear: expectedCourse, academicYear: m.academic_year,
        semester: m.semester, groups: memberGroups, group: memberGroups[0], subgroup: l.subgroup && l.subgroup.trim() || null,
        subject: l.subject, teacher: l.teacher, room: l.room, rawRoom: l.room, weekday: days.indexOf(l.day) + 1,
        startTime: l.start_time, endTime: l.end_time, weekParity: l.week_parity, source: "timetable", uncertain: l.uncertain,
        confidence: l.confidence, notes: l.notes.slice(), rawText: l.raw_text, sourceLesson: l,
        location: policy.normalize(l.room, regular), sourceKind: m.source_kind };
      memberGroups.forEach(function (group) { memberships.push({ id: JSON.stringify([eventKey, group, event.subgroup]), eventId: eventKey, group: group, subgroup: event.subgroup }); });
      return event;
    });
    var metadata = Object.fromEntries(["academic_year", "semester", "course_year", "source_page_url", "source_pdf_url", "source_pdf_hash", "source_kind", "source_transport", "source_snapshot_id", "downloaded_at", "parsed_at", "parser_version", "etag", "last_modified", "pdf_title"].map(function (key) { return [key, m[key]]; }));
    return { schemaVersion: 2, source: "timetable", courseYear: expectedCourse, revision: revision, regularFcim: regular,
      events: events, memberships: memberships, groups: groups, periods: slots, metadata: metadata, warnings: warnings,
      calendar: { timeZone: status.timezone, oddWeekAnchor: anchor, authority: "configured-unverified", validity: "published-weekly-pattern" },
      sourceStatus: { lastSuccessAt: source.last_success_at, lastCheckAt: source.last_check_at, parityNote: source.parity_note },
      fetchedAt: fetchedAt || new Date().toISOString() };
  }
  function week(date, anchor) {
    var day = dateDay(date), start = dateDay(anchor);
    // Selected civil date, never producer weekend look-ahead; no guessed anchor.
    if (day === null || start === null || ((start + 3) % 7 + 7) % 7 !== 0) return null;
    var number = 1 + Math.floor((day - start) / 7);
    return { number: number, parity: ((number % 2) + 2) % 2 === 1 ? "odd" : "even" };
  }
  function evaluate(datasets, selection) {
    var day = dateDay(selection.date), time = minute(selection.time);
    var result = { contextStatus: day === null || time === null ? "invalid" : "published-weekly-pattern", active: [], groupActive: [], unknown: [], groupUnknown: [], next: [], issues: [], week: null, weeks: {} };
    if (result.contextStatus === "invalid") return result;
    function mine(l) { return l.courseYear === selection.courseYear && l.groups.includes(selection.group) && (!selection.subgroup || !l.subgroup || l.subgroup === selection.subgroup); }
    datasets.forEach(function (dataset) {
      var info = week(selection.date, dataset.calendar.oddWeekAnchor); result.weeks[dataset.courseYear] = info;
      if (dataset.courseYear === selection.courseYear) result.week = info;
      dataset.events.forEach(function (event) {
        if (event.weekday !== ((day + 3) % 7 + 7) % 7 + 1 || time < minute(event.startTime) || time >= minute(event.endTime)) return;
        var reason = event.weekParity === "unknown" ? "Чётность занятия неизвестна" : event.uncertain ? "Парсер отметил неопределённость записи" :
          event.subgroup && /0[.,]5\s*gr\.?/i.test(event.subgroup) ? "Половина группы не идентифицирована" :
          event.weekParity !== "both" && !info ? "Опорная неделя некорректна или неизвестна" : null;
        if (reason) { var entry = { lesson: event, reason: reason }; result.unknown.push(entry); if (mine(event)) result.groupUnknown.push(entry); return; }
        if (event.weekParity !== "both" && event.weekParity !== info.parity) return;
        result.active.push(event); if (mine(event)) result.groupActive.push(event);
      });
    });
    return result;
  }
  var api = { normalize: normalize, evaluate: evaluate, week: week, dateDay: dateDay };
  global.FCIM_TIMETABLE_ADAPTER = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
