/* ROOM-01B: logical identities, historical geometry and display walls are separate. */
(function (global) {
  "use strict";
  var source = {
    file: "floor1кабинеты.png", sha256: "488159f6243075d6cd0a8a0cef2c0632ec4508f8554404de536beac483f7759a",
    identityEvidence: "user-confirmed", geometrySource: "floor1.jpg",
    geometrySha256: "fa2e31d1d0fc14f554bddfef8a6226425e1f6d780f28689a7882beb646dbd5b9",
    onSiteVerification: "unknown", proportions: "simplified-do-not-measure",
    correction: "ROOM-01B user contract", correctionSha256: "f5b594e1c70d5304081a22bfead32189c15b147a72d04016af576cd88f5e75f2"
  };
  var inventory = [
    ["114",["N01"],"north","Три широких северных отсека до выемки фасада: западный."],
    ["112",["N02"],"north","Средний из трёх широких северных отсеков."],
    ["110",["N03"],"north","Восточный из трёх широких северных отсеков перед выемкой."],
    ["108",["N04"],"north","Узкий отсек с выемкой северного фасада."],
    ["106",["N05","N06"],"north","Одна аудитория; перегородка и наблюдаемый проём N05-D1 сохранены.","wall-with-door",[525,36]],
    ["104",["N07"],"north","Широкое помещение с лестничным уступом, перед узким отсеком у шахт."],
    ["102",["N08"],"north","Узкий отсек непосредственно западнее ограждения двух шахт."],
    ["115",["S01"],"south","Узкое юго-западное помещение."],
    ["113",["S02"],"south","Широкое помещение непосредственно западнее западной лестницы."],
    ["111",["S03"],"south","Первый узкий отсек восточнее открытого западного холла."],
    ["109",["S04"],"south","Второй узкий отсек восточнее западного холла."],
    ["107",["S05"],"south","Широкий отсек перед блоком двух WC."],
    ["105",["S09"],"south","Одно помещение S09; S10 относится к 103."],
    ["103",["S10","S11"],"south","Одна аудитория с перегородкой и внутренней дверью по заявлению пользователя. Положение двери неизвестно; историческая S11-D2 ведёт к S12 и не считается этой дверью.","wall-with-door",[555,140]],
    ["101",["S12","S13"],"south","Одна аудитория без перегородки между S12 и S13; ложная линия исключена из визуальных стен.","none",[688,140]]
  ].map(function (r) {
    return { roomCode: "3-" + r[0], candidateSpaceIds: r[1].map(function (id) { return "B3-F1-" + id; }),
      spaceIds: r[1].map(function (id) { return "B3-F1-" + id; }), primarySpaceId: "B3-F1-" + r[1][0],
      spaceId: r[1].length === 1 ? "B3-F1-" + r[1][0] : null, status: "mapped", internalPartition: r[4] || "single",
      labelPoint: r[5] || null, side: r[2], notes: r[3], confidence: "user-confirmed",
      oneToOne: r[1].length === 1, cleanupRequired: false, evidence: source };
  });
  var identities = [
    ["S06","toilet","WC","Боковая западная ячейка блока между 107 и 105; контур с нишей условный. Пол WC не указан."],
    ["S08","toilet","WC","Боковая восточная ячейка того же блока. S07 между ними не объявляется третьим WC. Пол WC не указан."],
    ["N09","cafe","Orange Cafe","Большое северо-восточное помещение восточнее лифтового холла."],
    ["S14","reception","Вахта","Регион объединён в отображении с историческим STES по ROOM-01B."],
    ["N10","storage",null,"Непубличная служебная область, объединённая в отображении с историческим STEN."]
  ].map(function (r) { return { id: "B3-F1-" + r[0], kind: r[1], label: r[2], notes: r[3],
    public: r[1] !== "storage", identityEvidence: "user-confirmed", confidence: "medium", evidence: source }; });
  var presentation = { source:"ROOM-01C user contract",sha256:"431afa9788ea79ec9bd98631f074e4d9ed231dc242f94486da3ed93795c2d346",
    storageOpenings:[{id:"B3-F1-OPEN-STEN",spaceId:"B3-F1-STEN"}],backWcFeatureId:"B3-F1-SOUTH-STEPS",
    room103Source:{file:"user-room103-crop.png",sha256:"63b940b7fdfff2ba46e44e1cd7339e328d37413c7b0c7cb3bed0ba6971b7913c",identityEvidence:"user-confirmed",geometryEvidence:"observed-in-user-crop",coordinateAccuracy:"approximate",exactGeometry:"unknown"},
    suppressedDoors:["B3-F1-S11-D1","B3-F1-S11-D2"],
    qualifiedDoorways:[
      {id:"B3-F1-S10-D1",spaceId:"B3-F1-S10",to:"corridor",x:555,y:105,orientation:"horizontal",coordinateAccuracy:"approximate",notes:"Вход в левую часть 103 показан приблизительно по пользовательскому фрагменту; исходная запись двери сохранена."},
      {id:"B3-F1-S10-S11-INTERNAL",spaceId:"B3-F1-S10",to:"B3-F1-S11",x:570,y:153,orientation:"vertical",gapLength:14,coordinateAccuracy:"approximate",notes:"Проём между S10/S11 виден на пользовательском фрагменте ROOM-01C. Положение и длина условные; точная геометрия и доступ неизвестны."}
    ],
    room103Notes:"ROOM-01C: по пользовательскому фрагменту вход из коридора находится в левой части S10, а внутренняя дверь — в перегородке S10/S11. Положение показано приблизительно; точная геометрия неизвестна. Ошибочные рисунки входа в S11 и двери к соседней 101 скрыты, архив сохранён." };
  identities.push({id:"B3-F1-S07",kind:"storage",label:null,public:false,identityEvidence:"user-confirmed",
    evidenceSource:presentation.source,evidence:presentation,confidence:"user-confirmed",
    notes:"По ROOM-01C область над/между двумя WC — склад. Учебный номер, выбор и видимые двери скрыты; историческая геометрия сохранена."});
  var structural = [
    { id: "B3-F1-SH1", kind: "elevator-shaft", label: "Лифт", notes: "Первый из двух символов лифтов; работа и доступ неизвестны." },
    { id: "B3-F1-SH2", kind: "elevator-shaft", label: "Лифт", notes: "Второй символ лифта; работа и доступ неизвестны." },
    { id: "B3-F1-STW", kind: "staircase", label: "Западная лестница" },
    { id: "B3-F1-STM", kind: "staircase", label: "Главная лестница" },
    { id: "B3-F1-STW-INNER", parentId: "B3-F1-STW", kind: "elevator-shaft", label: "Западный лифт", operational: "reported-out-of-service", evidenceSource: "ROOM-01B user contract", notes: "По сообщению пользователя лифт не работает. Независимая проверка технического состояния не проводилась." },
    { id: "B3-F1-STEN", kind: "storage", label: null, public: false, displayParentId: "B3-F1-N10", display: "integrated-hidden", evidenceSource: "ROOM-01B user contract" },
    { id: "B3-F1-STES", kind: "reception", label: "Вахта", displayParentId: "B3-F1-S14", display: "integrated", evidenceSource: "ROOM-01B user contract" },
    { id: "B3-F1-OPEN-E", kind: "entrance", label: "Главный вход", side: "east", entranceStatus: "main-entrance",
      labelPoint: [1010,90], notes: "Восточная сторона подтверждена пользователем; координаты наблюдаемого OPEN-E взяты из GEO-02. Точная ширина, доступ и режим работы неизвестны." }
  ];
  function createCatalog(map, parse) {
    var spaces = new Map(map.floors.flatMap(function (f) { return f.spaces.map(function (s) { return [s.id,s]; }); }));
    var mapped = inventory.filter(function (r) { return r.status === "mapped"; });
    var facilityById = new Map(identities.concat(structural).map(function (x) { return [x.id,x]; }));
    mapped.forEach(function (r) {
      var p = parse(r.roomCode);
      if (!p.ok || p.full !== r.roomCode || !r.spaceIds.length || r.primarySpaceId !== r.spaceIds[0]) throw Error("Invalid ROOM-01B logical mapping");
      r.spaceIds.forEach(function (id) { var s=spaces.get(id); if (!s || s.kind !== "room" || s.floorId !== "B3-F1" || facilityById.has(id)) throw Error("Invalid classroom component"); });
    });
    var componentIds=mapped.flatMap(function (r) { return r.spaceIds; });
    if (new Set(mapped.map(function (r) { return r.roomCode; })).size !== mapped.length || new Set(componentIds).size !== componentIds.length) throw Error("Duplicate classroom ownership");
    function roomForSpace(id) { return mapped.find(function (r) { return r.spaceIds.includes(id); }) || null; }
    function conflicts(bindings) {
      var result=[];
      bindings.forEach(function (b) {
        var p=parse(b.fullNumber || b.roomNumber); if (!p.ok) return;
        var facility=facilityById.get(b.spaceId);
        if (facility) result.push({manualSpaceId:b.spaceId,roomCode:p.full,sourceSpaceId:null,reason:"Ручная запись относится к объекту «"+(facility.label || "служебная область")+"», исключённому из аудиторий."});
        mapped.forEach(function (r) {
          if ((r.spaceIds.includes(b.spaceId) && p.full !== r.roomCode) || (p.full === r.roomCode && !r.spaceIds.includes(b.spaceId)))
            result.push({manualSpaceId:b.spaceId,roomCode:p.full,sourceRoomCode:r.roomCode,sourceSpaceId:r.primarySpaceId,sourceSpaceIds:r.spaceIds.slice(),reason:"Ручная запись противоречит пользовательскому источнику "+r.roomCode+" → "+r.spaceIds.join(" + ")+"."});
        });
      });
      return result;
    }
    function effective(bindings) {
      var c=conflicts(bindings), excluded=new Set(c.flatMap(function (x) { return [x.manualSpaceId].concat(x.sourceSpaceIds || []); }));
      var result=bindings.filter(function (b) { return !excluded.has(b.spaceId) && !roomForSpace(b.spaceId) && parse(b.fullNumber || b.roomNumber).ok; }).map(function (b) { return {spaceId:b.spaceId,primarySpaceId:b.spaceId,spaceIds:[b.spaceId],roomCode:parse(b.fullNumber || b.roomNumber).full,provenance:"manual"}; });
      mapped.forEach(function (r) { if (!r.spaceIds.some(function (id) { return excluded.has(id); })) result.push(Object.assign({},r,{provenance:"user-confirmed",manualSpaceIds:bindings.filter(function (b) { return r.spaceIds.includes(b.spaceId); }).map(function (b) { return b.spaceId; })})); });
      return result;
    }
    function checkNewBinding(id, raw) {
      var p=parse(raw), facility=facilityById.get(id);
      if (!spaces.has(id) || spaces.get(id).kind !== "room") return "Недопустимый spaceId аудитории.";
      if (facility) return "Этот объект не является аудиторией и не получает учебного номера.";
      if (!p.ok) return p.error;
      var clash=mapped.find(function (r) { return (r.spaceIds.includes(id) && r.roomCode !== p.full) || (r.roomCode === p.full && !r.spaceIds.includes(id)); });
      return clash ? "Конфликт с источником: "+clash.roomCode+" → "+clash.spaceIds.join(" + ")+". Сначала требуется отдельная проверка соответствия; источник не перезаписывается." : null;
    }
    function storageOnly(id) { var identity=facilityById.get(id); return !!identity && identity.kind === "storage" && identity.public === false; }
    return { source:source, presentation:presentation, inventory:inventory, mappings:mapped, identities:identities, structural:structural,
      identity:function (id) { return facilityById.get(id) || null; },
      roomForSpace:roomForSpace,
      selectionIds:function (id) { var r=roomForSpace(id), facility=facilityById.get(id), parent=facility && facility.displayParentId || id; return r ? r.spaceIds.slice() : [parent].concat(structural.filter(function (x) { return x.displayParentId === parent; }).map(function (x) { return x.id; })); },
      classroomCandidate:function (id) { var s=spaces.get(id); return !!s && s.kind === "room" && !facilityById.has(id); },
      storageOnly:storageOnly,
      showDoor:function (door) { return !storageOnly(door.spaceId) && !storageOnly(door.to) && !presentation.suppressedDoors.includes(door.id); },
      displayDoors:function (floor) { if (floor.level !== 1) return floor.geometry.doors.slice(); return floor.geometry.doors.map(function (d) { return Object.assign({},d,presentation.qualifiedDoorways.find(function (q) { return q.id === d.id; }) || {}); }).concat(presentation.qualifiedDoorways.filter(function (q) { return !floor.geometry.doors.some(function (d) { return d.id === q.id; }); })); },
      showOpening:function (feature) { return !presentation.storageOpenings.some(function (x) { return x.id === feature.id && storageOnly(x.spaceId); }); },
      conflicts:conflicts, effective:effective, checkNewBinding:checkNewBinding };
  }
  // Physical walls, independent of space fills/hit regions. No geometric mask.
  function physicalWalls(floor) {
    var segments=[];
    function add(a,b,reason) { segments.push({a:a,b:b,reason:reason}); }
    function edges(p,reason) { p.forEach(function (a,i) { add(a,p[(i+1)%p.length],reason); }); }
    floor.spaces.filter(function (s) { return s.kind === "room"; }).forEach(function (s) { edges(s.polygon,"photo-room-partition"); });
    floor.geometry.verticals.filter(function (v) { return v.type === "stair"; }).forEach(function (v) {
      var p=v.polygon;
      p.forEach(function (a,i) { var b=p[(i+1)%p.length]; if (v.id === "B3-F1-STM" && a[1] === 100 && b[1] === 100) return; add(a,b,"photo-stair-enclosure"); });
    });
    floor.geometry.verticals.forEach(function (v) { if (v.type !== "stair") edges(v.polygon,"photo-shaft-enclosure"); if (v.innerShaft) edges(v.innerShaft,"photo-inner-shaft-enclosure"); });
    floor.geometry.features.filter(function (x) { return x.type === "wallLine"; }).forEach(function (x) { x.line.slice(1).forEach(function (b,i) { add(x.line[i],b,"photo-shaft-enclosure"); }); });
    // Merge coincident collinear spans; a shared physical wall is drawn once.
    var groups=new Map(),diagonals=[];
    segments.forEach(function (s) {
      if (s.a[0] !== s.b[0] && s.a[1] !== s.b[1]) { diagonals.push([s.a,s.b]); return; }
      var vertical=s.a[0] === s.b[0], axis=vertical?1:0, constant=s.a[1-axis];
      var key=(vertical?"v":"h")+constant, group=groups.get(key)||{vertical:vertical,constant:constant,spans:[]};
      group.spans.push([Math.min(s.a[axis],s.b[axis]),Math.max(s.a[axis],s.b[axis])]); groups.set(key,group);
    });
    var walls=diagonals;
    groups.forEach(function (group) {
      var spans=group.spans.sort(function (a,b) { return a[0]-b[0]; }),merged=[];
      spans.forEach(function (p) { var last=merged[merged.length-1]; if (last && p[0] <= last[1]) last[1]=Math.max(last[1],p[1]); else merged.push(p.slice()); });
      merged.forEach(function (span) {
        var cuts=[span];
        // Only explicitly confirmed false shared walls are removed; 103/106 stay.
        var removed=[[[631,105],[631,175]],[[930,38],[1000,38]],[[930,137],[1000,137]]];
        var cutLines=floor.geometry.outline.map(function (a,i) { return [a,floor.geometry.outline[(i+1)%floor.geometry.outline.length]]; }).concat(removed);
        cutLines.forEach(function (line) {
          var a=line[0],b=line[1],axis=group.vertical?1:0;
          if (a[1-axis] !== group.constant || b[1-axis] !== group.constant) return;
          var lo=Math.min(a[axis],b[axis]),hi=Math.max(a[axis],b[axis]);
          cuts=cuts.flatMap(function (p) { if (hi<=p[0] || lo>=p[1]) return [p]; var parts=[]; if (lo>p[0]) parts.push([p[0],lo]); if (hi<p[1]) parts.push([hi,p[1]]); return parts; });
        });
        cuts.forEach(function (p) { walls.push(group.vertical?[[group.constant,p[0]],[group.constant,p[1]]]:[[p[0],group.constant],[p[1],group.constant]]); });
      });
    });
    return walls;
  }
  // Reuse every exterior vertex; normalize only the three edges of the southern spur.
  function exteriorWallPaths(floor) {
    var paths=[];
    floor.geometry.outline.forEach(function (a,i) {
      var b=floor.geometry.outline[(i+1)%floor.geometry.outline.length];
      var normalized=floor.level === 1 && [a,b].every(function (p) { return p[0]>=459 && p[0]<=511 && p[1]>=175; });
      var kind=normalized ? "back-wc-wall" : "exterior-wall",last=paths[paths.length-1];
      if (last && last.kind===kind) last.points.push(b); else paths.push({kind:kind,points:[a,b]});
    });
    if (paths.length>1 && paths[0].kind===paths[paths.length-1].kind) { var first=paths.shift(); paths[paths.length-1].points=paths[paths.length-1].points.concat(first.points.slice(1)); }
    return paths;
  }
  // Trace union boundaries without changing or merging any stored polygon.
  function unionOutline(polygons) {
    var edges=new Map(), key=function (p) { return p.join(","); };
    polygons.forEach(function (p) { p.forEach(function (a,i) { var b=p[(i+1)%p.length],k=key(a)+"|"+key(b),reverse=key(b)+"|"+key(a); if (edges.has(reverse)) edges.delete(reverse); else edges.set(k,[a,b]); }); });
    var loops=[];
    while (edges.size) { var first=edges.values().next().value,loop=[first[0]],end=first[1]; edges.delete(key(first[0])+"|"+key(end));
      while (key(end)!==key(loop[0])) { loop.push(end); var next=Array.from(edges.values()).find(function (e) { return key(e[0])===key(end); }); if (!next) throw Error("Open logical outline"); edges.delete(key(next[0])+"|"+key(next[1])); end=next[1]; }
      loops.push(loop);
    }
    return loops;
  }
  var doorQualifications=[{id:"B3-F1-S10-S11-INTERNAL",roomCode:"3-103",geometry:null,identityEvidence:"user-confirmed",locationStatus:"unknown",notes:"Внутренняя дверь подтверждена пользователем, координаты не установлены."},
    {id:"B3-F1-S11-D2",geometryEvidence:"historical-observed",connectivityStatus:"qualification-required",notes:"Историческая связь S11→S12 сохранена; после ROOM-01B это граница 103/101, классификация требует проверки."}];
  var api={source:source,presentation:presentation,inventory:inventory,identities:identities,structural:structural,doorQualifications:doorQualifications,createCatalog:createCatalog,physicalWalls:physicalWalls,exteriorWallPaths:exteriorWallPaths,unionOutline:unionOutline};
  global.FCIM_ROOM_IDENTIFICATION=api;
  if (typeof module !== "undefined" && module.exports) module.exports=api;
})(typeof window !== "undefined" ? window : globalThis);
