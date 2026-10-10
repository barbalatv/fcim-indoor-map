/* Source-specific location policy. Geometry and FIX-01 bindings remain authoritative. */
(function (global) {
  "use strict";
  function createPolicy(map, parse, resolve) {
    function normalize(raw, recognizedRegular, qualifier) {
      var result = { rawRoom: raw, roomCode: null, buildingId: null, interpretation: "unresolved", status: "unmapped" };
      if (raw === null || !String(raw).trim()) return Object.assign(result, { status: "missing-room" });
      var value = String(raw).trim().replace(/[–—]/g, "-");
      var qualified = value.match(/^(\d{3}[a-zа-я]?)\s+(?:building|corpul|corp\.?|корпус)\s*(\d{1,2})$/i) ||
        value.match(/^(\d{3}[a-zа-я]?)\s*\((?:building|corpul|corp\.?|корпус)\s*(\d{1,2})\)$/i);
      if (qualified) {
        if (qualifier != null && qualifier !== Number(qualified[2])) return result;
        qualifier = Number(qualified[2]); value = qualified[1];
      }
      // Accept a complete single code only. Do not fish digits out of venue text.
      var explicit = value.match(/^(\d{1,2})\s*-\s*(\d{3}[a-zа-я]?)$/i);
      var single = value.match(/^\d{3}[a-zа-я]?$/i);
      if (qualifier != null && (!Number.isInteger(qualifier) || qualifier < 1 || qualifier > 99)) return result;
      if (explicit && qualifier != null && Number(explicit[1]) !== qualifier) return result;
      var building = explicit ? Number(explicit[1]) : qualifier;
      if (building != null && building !== 3) return Object.assign(result, {
        buildingId: "utm-b" + building, roomCode: explicit ? building + "-" + explicit[2].toLowerCase() : single ? building + "-" + value.toLowerCase() : null,
        interpretation: "explicit-building", status: "outside-building",
      });
      if (!explicit && !single) return result;
      if (!explicit && building == null && !recognizedRegular) return Object.assign(result, { status: "unknown-building" });
      var parsed = parse(explicit ? "3-" + explicit[2] : value);
      if (!parsed.ok || parsed.basement) return result;
      return Object.assign(result, { roomCode: parsed.full, buildingId: map.id, status: "normalized",
        interpretation: explicit || qualifier != null ? "explicit-building" : "default-building-3" });
    }
    function locate(event, bindings) {
      var location = event.location;
      if (!location || location.status !== "normalized") return Object.assign({ spaceId: null, spaceIds: [], floorLevel: null, provenance: null }, location || {});
      // No demo associations; no writes; the original resolver keeps conflicts active.
      return Object.assign({}, resolve({ room: location.roomCode, buildingId: location.buildingId, source: "timetable" }, { bindings: bindings || [] }), {
        rawRoom: location.rawRoom, interpretation: location.interpretation,
      });
    }
    return { normalize: normalize, locate: locate };
  }
  var api = { createPolicy: createPolicy };
  global.FCIM_TIMETABLE_ROOM_POLICY = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
