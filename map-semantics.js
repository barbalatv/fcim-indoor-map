/* Evidence-qualified facilities overlay; never alters the reconstructed model. */
(function (global) {
  "use strict";
  function facilities(map) {
    var result = [];
    map.floors.forEach(function (f) {
      result.push({ id: f.id + "-CORRIDOR", floorId: f.id, kind: "corridor", evidence: "observed", operational: "unknown", source: f.source.photo, polygon: f.geometry.corridor });
      f.geometry.verticals.forEach(function (v) {
        result.push({ id: v.id, floorId: f.id, kind: v.type === "elevator" ? "elevator-shaft" : "staircase", evidence: v.verification === "verified" ? "verified" : "observed", operational: "unknown", source: v.source, polygon: v.polygon, notes: v.notes });
        if (v.innerShaft) result.push({ id: v.id + "-INNER", floorId: f.id, kind: "unknown-shaft", evidence: "inferred", operational: "unknown", source: v.source, polygon: v.innerShaft, notes: "Символ виден на прежней реконструкции; назначение шахты не подтверждено." });
      });
      f.spaces.filter(function (s) { return s.type === "service"; }).forEach(function (s) {
        result.push({ id: s.id, floorId: f.id, kind: "unknown-facility", evidence: "unknown", geometryEvidence: s.verification, operational: "unknown", source: s.source, polygon: s.polygon, notes: "Назначение не подтверждено. Это не проверенный туалет." });
      });
      f.geometry.features.forEach(function (ft) { result.push({ id: ft.id, floorId: f.id, kind: "structural-landmark", evidence: "observed", identityEvidence: "unknown", operational: "unknown", source: ft.source || f.source.photo, notes: ft.notes }); });
    });
    result.push({ id: "B3-TOILETS-UNKNOWN", floorId: null, kind: "toilet", evidence: "unknown", polygon: null, notes: "Подтверждённые расположения отсутствуют; маркеры туалетов не рисуются." });
    result.push({ id: "B3-ENTRANCES-UNKNOWN", floorId: null, kind: "entrance", evidence: "unknown", polygon: null, notes: "1 этаж pending; подтверждённые входы не нанесены." });
    return result;
  }
  var api = { facilities: facilities };
  global.FCIM_MAP_SEMANTICS = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
