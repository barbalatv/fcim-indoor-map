/* UI-01 display coordinates. Source geometry and room ownership live elsewhere. */
(function (global) {
  "use strict";
  var revision = "2026-10-09.UI-01-FIX-B.1";
  var firstFloorOpenRoomCodes=["3-101","3-103","3-106"];
  var firstFloorRoomLabelInset={left:6,top:8};
  // Diagram units only. Every Y edge derives from these shared display rails.
  var firstFloorRails = {outerTop:0, upperBottom:75, lowerTop:105, outerBottom:175};
  firstFloorRails.upperSplit = (firstFloorRails.outerTop + firstFloorRails.upperBottom) / 2;
  firstFloorRails.lowerSplit = (firstFloorRails.lowerTop + firstFloorRails.outerBottom) / 2;
  firstFloorRails.lowerInsetTop = firstFloorRails.lowerTop + (firstFloorRails.outerBottom-firstFloorRails.lowerTop) / 4;
  firstFloorRails.lowerInsetBottom = firstFloorRails.outerBottom - (firstFloorRails.outerBottom-firstFloorRails.lowerTop) / 4;
  var rails=firstFloorRails, liftSize=rails.upperSplit-rails.outerTop, westLiftSize=rails.lowerInsetBottom-rails.lowerInsetTop;
  function band(x,width,top,bottom) { return [x,top,width,bottom-top]; }
  function upper(x,width) { return band(x,width,rails.outerTop,rails.upperBottom); }
  function lower(x,width) { return band(x,width,rails.lowerTop,rails.outerBottom); }
  var firstFloorRects = {
    N01:upper(0,154), N02:upper(154,153), N03:upper(307,154), N04:upper(461,49),
    N05:upper(510,30), N06:upper(540,30), N07:upper(570,150), N08:upper(720,30),
    N09:upper(816,114), N10:band(930,70,rails.upperSplit,rails.upperBottom),
    S01:lower(0,62), S02:lower(62,124), S03:lower(307,33), S04:lower(340,28),
    S05:lower(368,59), S06:lower(427,31.5), S08:lower(458.5,31.5),
    S09:lower(511,29), S10:lower(540,30), S11:lower(570,30),
    S12:lower(600,31), S13:lower(631,119), S14:band(930,70,rails.lowerTop,rails.lowerSplit),
    HW:lower(247,60), LH:upper(750+liftSize,816-750-liftSize), HC:lower(490,21), HE:lower(815,115),
    STW:lower(186,61), STM:lower(750,65),
    STEN:band(930,70,rails.outerTop,rails.upperSplit), STES:band(930,70,rails.lowerSplit,rails.outerBottom),
    SH1:band(750,liftSize,rails.outerTop,rails.upperSplit), SH2:band(750,liftSize,rails.upperSplit,rails.upperBottom)
  };
  var westStair=firstFloorRects.STW;
  firstFloorRects["STW-INNER"]=[westStair[0]+westStair[2]-westLiftSize,westStair[1]+(westStair[3]-westLiftSize)/2,westLiftSize,westLiftSize];
  // These component IDs retain their source ownership but paint one aligned block.
  var firstFloorEnclosures={elevators:["SH1","SH2"],service:["STEN","N10"],reception:["S14","STES"]};
  function enclosure(name) {
    var ids=firstFloorEnclosures[name];if(!ids)return null;
    var rects=ids.map(function(id){return firstFloorRects[id];});
    var left=Math.min.apply(null,rects.map(function(r){return r[0];})),top=Math.min.apply(null,rects.map(function(r){return r[1];}));
    var right=Math.max.apply(null,rects.map(function(r){return r[0]+r[2];})),bottom=Math.max.apply(null,rects.map(function(r){return r[1]+r[3];}));
    return rectPolygon([left,top,right-left,bottom-top]);
  }
  function rectPolygon(r) { return [[r[0],r[1]],[r[0]+r[2],r[1]],[r[0]+r[2],r[1]+r[3]],[r[0],r[1]+r[3]]]; }
  function edges(p) { return p.map(function(a,i){return [a,p[(i+1)%p.length]];}); }
  // Union collinear spans, including diagonal boundaries on historical floors.
  // A single SVG path paints the resulting wall network once at intersections.
  function deduplicate(lines) {
    var groups=new Map(),eps=1e-6,round=function(n){return Math.round(n/eps)*eps;};
    lines.forEach(function(line){
      var a=line[0],b=line[1],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
      if(length<eps)return;
      dx/=length;dy/=length;if(dx < -eps || Math.abs(dx)<eps && dy<0){dx=-dx;dy=-dy;}
      var normal=-dy*a[0]+dx*a[1],key=[dx,dy,normal].map(round).join(','),group=groups.get(key);
      if(!group){group={dx:dx,dy:dy,normal:normal,spans:[]};groups.set(key,group);}
      var t1=dx*a[0]+dy*a[1],t2=dx*b[0]+dy*b[1];group.spans.push([Math.min(t1,t2),Math.max(t1,t2)]);
    });
    var result=[];
    groups.forEach(function(g){var merged=[];g.spans.sort(function(a,b){return a[0]-b[0];}).forEach(function(s){var last=merged[merged.length-1];if(last && s[0]<=last[1]+eps)last[1]=Math.max(last[1],s[1]);else merged.push(s.slice());});
      merged.forEach(function(s){result.push(s.map(function(t){return [round(g.dx*t-g.dy*g.normal),round(g.dy*t+g.dx*g.normal)];}));});
    });return result;
  }
  function createFloor(floor,catalog) {
    var schematic=floor.level===1,polygons=Object.create(null),walls=[],outline=schematic?rectPolygon([0,rails.outerTop,1000,rails.outerBottom-rails.outerTop]):floor.geometry.outline;
    floor.spaces.concat(floor.geometry.verticals).forEach(function(s){
      if(schematic){var r=firstFloorRects[s.id.replace('B3-F1-','')];if(r)polygons[s.id]=rectPolygon(r);}
      else polygons[s.id]=s.polygon;
    });
    if(schematic)polygons['B3-F1-STW-INNER']=rectPolygon(firstFloorRects['STW-INNER']);
    walls=edges(outline);
    floor.spaces.filter(function(s){return s.kind==='room'&&polygons[s.id];}).forEach(function(s){
      edges(polygons[s.id]).forEach(function(line){
        var logical=schematic&&catalog.roomForSpace(s.id);
        // Display-only seam removal; historical partition evidence is untouched.
        if(logical&&firstFloorOpenRoomCodes.includes(logical.roomCode)&&logical.spaceIds.some(function(id){return id!==s.id&&edges(polygons[id]).some(function(other){return JSON.stringify(other)===JSON.stringify(line)||JSON.stringify(other.slice().reverse())===JSON.stringify(line);});}))return;
        walls.push(line);
      });
    });
    floor.geometry.verticals.forEach(function(v){
      if(!polygons[v.id])return;
      edges(polygons[v.id]).forEach(function(line){
        var identity=schematic&&catalog.identity(v.id),parent=identity&&identity.displayParentId;
        if(parent&&polygons[parent]&&edges(polygons[parent]).some(function(other){return JSON.stringify(other)===JSON.stringify(line)||JSON.stringify(other.slice().reverse())===JSON.stringify(line);}))return;
        // Reception is one enclosure; remove the coincident space-side edge below.
        walls.push(line);
      });
      if(v.innerShaft)walls=walls.concat(edges(schematic?polygons[v.id+'-INNER']:v.innerShaft));
    });
    if(schematic){
      // S14/STES share their public reception presentation; no interior seam.
      walls=walls.filter(function(l){return !([rails.upperSplit,rails.lowerSplit].includes(l[0][1])&&l[1][1]===l[0][1]&&Math.min(l[0][0],l[1][0])===930&&Math.max(l[0][0],l[1][0])===1000);});
    }else floor.geometry.features.forEach(function(ft){
      if(ft.type==='wallLine')walls=walls.concat(ft.line.slice(1).map(function(b,i){return [ft.line[i],b];}));
      if(ft.type==='gallery'){walls=walls.concat(edges(ft.polygon));(ft.flights||[]).forEach(function(p){walls=walls.concat(edges(p));});}
    });
    var api={floorId:floor.id,displayMode:schematic?'rectangular-schematic':'source-layout',revision:revision,outline:outline,polygons:polygons,walls:deduplicate(walls),
      polygon:function(id){return polygons[id]||null;},
      rails:schematic?firstFloorRails:null, corridor:schematic?rectPolygon([0,rails.upperBottom,1000,rails.lowerTop-rails.upperBottom]):null,
      enclosure:function(name){return schematic?enclosure(name):null;},
      roomLabelPoint:function(room){var p=api.roomOutline(room);return p?[p[0][0]+firstFloorRoomLabelInset.left,p[0][1]+firstFloorRoomLabelInset.top]:null;},
      labelPoint:function(id){var p=polygons[id];if(!p)return null;var xs=p.map(function(a){return a[0];}),ys=p.map(function(a){return a[1];});return [(Math.min.apply(null,xs)+Math.max.apply(null,xs))/2,(Math.min.apply(null,ys)+Math.max.apply(null,ys))/2];},
      roomOutline:function(room){return schematic?rectPolygon([Math.min.apply(null,room.spaceIds.map(function(id){return polygons[id][0][0];})),polygons[room.primarySpaceId][0][1],room.spaceIds.reduce(function(w,id){return w+firstFloorRects[id.replace('B3-F1-','')][2];},0),firstFloorRects[room.primarySpaceId.replace('B3-F1-','')][3]]):null;}
    };return api;
  }
  var api={revision:revision,firstFloorRects:firstFloorRects,firstFloorRails:firstFloorRails,firstFloorRoomLabelInset:firstFloorRoomLabelInset,rectPolygon:rectPolygon,deduplicate:deduplicate,createFloor:createFloor};
  global.FCIM_SCHEMATIC_LAYOUT=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
