/* Evidence-qualified facilities overlay; never alters the reconstructed model. */
(function (global) {
  "use strict";
  function facilities(map, catalog) {
    var result = [];
    map.floors.forEach(function (f) {
      result.push({ id: f.id + "-CORRIDOR", floorId: f.id, kind: "corridor", evidence: "observed", operational: "unknown", source: f.source.photo, polygon: f.geometry.corridor });
      f.geometry.verticals.forEach(function (v) {
        result.push({ id: v.id, floorId: f.id, kind: v.type === "shaft" ? "unknown-shaft" : v.type === "elevator" ? "elevator-shaft" : "staircase", evidence: v.verification === "verified" ? "verified" : "observed", identityEvidence: v.identityEvidence || "unknown", operational: "unknown", source: v.source, polygon: v.polygon, notes: v.notes });
        if (v.innerShaft) result.push({ id: v.id + "-INNER", floorId: f.id, kind: "unknown-shaft", evidence: f.level === 1 ? "observed" : "inferred", identityEvidence: "unknown", operational: "unknown", source: v.source, polygon: v.innerShaft, notes: "Символ шахты; назначение и работа не подтверждены." });
      });
      f.spaces.filter(function (s) { return s.type === "service"; }).forEach(function (s) {
        result.push({ id: s.id, floorId: f.id, kind: "unknown-facility", evidence: "unknown", geometryEvidence: s.verification, operational: "unknown", source: s.source, polygon: s.polygon, notes: "Назначение не подтверждено. Это не проверенный туалет." });
      });
      f.geometry.features.forEach(function (ft) { result.push({ id: ft.id, floorId: f.id, kind: ft.type === "opening" ? "opening" : "structural-landmark", evidence: "observed", identityEvidence: "unknown", entranceStatus: ft.entranceStatus || null, operational: "unknown", access: "unknown", source: ft.source || f.source.photo, polygon: ft.polygon || null, line: ft.line || null, notes: ft.notes }); });
    });
    result.push({ id: "B3-TOILETS-UNKNOWN", floorId: null, kind: "toilet", evidence: "unknown", polygon: null, notes: "Подтверждённые расположения отсутствуют; маркеры туалетов не рисуются." });
    result.push({ id: "B3-ENTRANCES-UNKNOWN", floorId: null, kind: "entrance", evidence: "unknown", polygon: null, notes: "На 1 этаже нанесены наблюдаемые проёмы и возможный южный вход. Подтверждённых входов, их назначения и публичного доступа нет." });
    if (catalog) catalog.identities.concat(catalog.structural).forEach(function (identity) {
      var floor = map.floors.find(function (f) { return f.id === "B3-F1"; });
      var entity = floor.spaces.concat(floor.geometry.verticals, floor.geometry.features).find(function (x) { return x.id === identity.id; });
      if (identity.parentId) { var parent=floor.geometry.verticals.find(function (v) { return v.id === identity.parentId; }); entity=Object.assign({},parent,{polygon:parent.innerShaft}); }
      var old = result.findIndex(function (x) { return x.id === identity.id; });
      var facility = Object.assign({}, identity, { floorId: floor.id, evidence: "user-confirmed", identityEvidence: "user-confirmed",
        identitySource: identity.evidenceSource || (identity.id === "B3-F1-OPEN-E" ? "user-statement-east" : catalog.source.file),
        geometryEvidence: entity.verification, geometrySource: floor.source.photo, operational: identity.operational || "unknown", access: "unknown",
        onSiteVerification: "unknown", source: identity.evidenceSource || catalog.source.file, polygon: entity.polygon || null, line: entity.line || null });
      if (old >= 0) result[old] = facility; else result.push(facility);
    });
    if (catalog) {
      if (catalog.presentation) {
        result.filter(function (x) { return catalog.presentation.storageOpenings.some(function (o) { return o.id === x.id; }); }).forEach(function (x) { x.display="hidden-storage-access"; x.displaySource=catalog.presentation.source; });
        var backWc=result.find(function (x) { return x.id === catalog.presentation.backWcFeatureId; });
        backWc.presentationFill="neutral-circulation-style"; backWc.presentationSource=catalog.presentation.source;
      }
      result.filter(function (x) { return ["B3-F1-SOUTH-STEPS","B3-F1-MID-STEPS","B3-F1-NORTH-STEPS"].includes(x.id); }).forEach(function (x) { x.display="hidden-user-request"; x.displaySource="ROOM-01B user contract"; });
      result.find(function (x) { return x.id === "B3-TOILETS-UNKNOWN"; }).notes = "Кроме двух WC первого этажа, определённых пользователем, расположения и функции WC на других этажах неизвестны; натурного осмотра нет.";
      result.find(function (x) { return x.id === "B3-ENTRANCES-UNKNOWN"; }).notes = "Главный вход первого этажа определён пользователем у восточного OPEN-E. Назначение остальных проёмов и доступ неизвестны.";
    }
    return result;
  }
  var api = { facilities: facilities };
  global.FCIM_MAP_SEMANTICS = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
