/* Canonical FIX-01 parser, extracted unchanged. No DOM or storage dependency. */
(function (global) {
  "use strict";
  function createParser(DATA, BUILDING_PREFIX) {
    // Same provisional suffix policy as FIX-01; not an institutional numbering rule.
    return function parseRoomInput(raw) {
      var v = String(raw || "").trim().replace(/\s+/g, "").replace(/[–—]/g, "-");
      if (!v) return { ok: false, error: "Введите номер аудитории, например 405." };
      if (new RegExp(DATA.roomNumbering.basementPattern, "i").test(v)) return { ok: true, basement: true, number: v.toUpperCase(), full: v.toUpperCase(), floorGuess: -1 };
      var m = v.match(/^(\d{1,2})-(\d{3}[a-zа-я]?)$/i);
      if (m) {
        if (m[1] !== BUILDING_PREFIX) return { ok: false, error: "Номер " + v + " относится к корпусу " + m[1] + ", а карта — только корпуса 3." };
        v = m[2];
      }
      if (/^[a-zа-яё]{1,5}-?\d{2,4}/i.test(v)) return { ok: false, error: "«" + raw + "» похоже на название студенческой группы, а не на номер аудитории." };
      if (!new RegExp(DATA.roomNumbering.pattern, "i").test(BUILDING_PREFIX + "-" + v)) return { ok: false, error: "Ожидается номер вида 405 или 3-405; допускается одна латинская/кириллическая буква (временная политика прототипа)." };
      v = v.toLowerCase();
      return { ok: true, number: v, full: BUILDING_PREFIX + "-" + v, floorGuess: parseInt(v.charAt(0), 10) };
    };
  }

  // Resolving a room is separate from evaluating whether its lesson is active.
  // Demo associations are passed explicitly and NEVER merged with real bindings.
  function createResolver(map, parse, catalog) {
    var spaces = new Map();
    map.floors.forEach(function (f) { f.spaces.forEach(function (s) { spaces.set(s.id, { space: s, level: f.level }); }); });
    return function resolveRoom(lesson, options) {
      options = options || {};
      var result = { roomCode: lesson.room || null, spaceId: null, floorLevel: null, status: "unmapped", provenance: null };
      if (!lesson.room) return Object.assign(result, { status: "missing-room" });
      if (lesson.buildingId && lesson.buildingId !== map.id) return Object.assign(result, { status: "outside-building" });
      var raw = String(lesson.room).trim().replace(/\s+/g, "").replace(/[–—]/g, "-");
      var building = raw.match(/^(\d{1,2})-/);
      if (building && building[1] !== "3") return Object.assign(result, { status: "outside-building" });
      if (!lesson.buildingId && !building) return Object.assign(result, { status: "unknown-building" });
      var p = parse(lesson.room);
      if (!p.ok) return Object.assign(result, { status: "invalid-room" });
      result.roomCode = p.full;
      if (p.basement) return Object.assign(result, { status: "pending-floor" });
      var mock = lesson.source === "mock";
      // An explicit source catalog resolves real codes, with user evidence kept
      // distinct from independent verification and from fictional demo data.
      if (!mock && catalog) {
        if (catalog.conflicts(options.bindings || []).some(function (c) { return c.roomCode === p.full || c.sourceRoomCode === p.full; })) return Object.assign(result, { status: "ambiguous-binding" });
        var source = catalog.mappings.find(function (r) { return r.roomCode === p.full; });
        if (source) return Object.assign(result, { spaceId: source.primarySpaceId, primarySpaceId: source.primarySpaceId, spaceIds: source.spaceIds.slice(), floorLevel: spaces.get(source.primarySpaceId).level, status: "mapped", provenance: "user-confirmed", onSiteVerification: "unknown" });
      }
      // The synthetic dataset cannot borrow a user's real room annotation.
      var candidates = mock ? (options.demoAssociations || []) : (options.bindings || []);
      var matches = candidates.filter(function (b) {
        var number = parse(b.fullNumber || b.roomNumber);
        return number.ok && number.full === p.full;
      });
      if (matches.length > 1) return Object.assign(result, { status: "ambiguous-binding" });
      if (!matches.length) return result; // floorGuess is deliberately never used for association.
      var binding=matches[0], expanded=Object.prototype.hasOwnProperty.call(binding,"spaceIds");
      var ids=expanded ? binding.spaceIds : [binding.spaceId];
      if (!Array.isArray(ids) || !ids.length || new Set(ids).size !== ids.length || ids.some(function (id) { return typeof id !== "string" || !spaces.has(id) || spaces.get(id).space.kind !== "room"; })) return Object.assign(result, { status: "invalid-binding" });
      var primary=expanded ? ids.slice().sort()[0] : binding.spaceId, entry = spaces.get(primary);
      if (!entry || entry.space.kind !== "room") return Object.assign(result, { status: "invalid-binding" });
      if (ids.some(function (id) { return spaces.get(id).level !== entry.level; }) || expanded && (binding.primarySpaceId && binding.primarySpaceId !== primary || binding.spaceId && binding.spaceId !== primary)) return Object.assign(result, { status: "invalid-binding" });
      // A real adapter must supply verified evidence. Manual FIX-01 records retain
      // their existing provenance; they are not silently promoted to verified.
      if (!mock && matches[0].verification !== "verified") return Object.assign(result, { status: "unverified-binding" });
      if (expanded) Object.assign(result,{spaceIds:ids.slice().sort(),primarySpaceId:primary});
      return Object.assign(result, { spaceId: entry.space.id, floorLevel: entry.level, status: "mapped", provenance: mock ? "temporary-demo" : "verified-binding" });
    };
  }
  var api = { createParser: createParser, createResolver: createResolver };
  global.FCIM_ROOM_CONTRACT = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
