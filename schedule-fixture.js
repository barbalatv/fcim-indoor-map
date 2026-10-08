/* Entirely fictional timetable AND room associations. No actual UTM timetable data. */
(function (global) {
  "use strict";
  var fixture = {
    schemaVersion: 1,
    source: "mock",
    coverage: "synthetic-partial",
    label: "Синтетическое демо · не расписание UTM",
    initialSelection: { date: "2026-10-08", time: "08:30" },
    context: { academicYear: "DEMO-2026-2027", startDate: "2026-09-07", endDate: "2027-06-27", timeZone: "Europe/Chisinau", weekAnchorDate: "2026-09-07", weekAnchorNumber: 1, parityDefinition: "anchor-number-modulo-2", note: "Все даты, интервалы и правило чётности заданы только для вымышленного демо; правила UTM неизвестны." },
    groups: [{ id: "TI-DEMO-1", courseYear: 1, subgroups: ["1", "2"] }, { id: "SI-DEMO-2", courseYear: 2, subgroups: [] }],
    periods: [{ startTime: "08:00", endTime: "09:30" }, { startTime: "09:50", endTime: "11:20" }, { startTime: "11:40", endTime: "13:10" }, { startTime: "13:30", endTime: "15:00" }],
    demoAssociations: [
      { fullNumber: "3-405a", spaceId: "B3-F4-N05" },
      { fullNumber: "3-601", spaceId: "B3-F6-N01" },
      { fullNumber: "3-201", spaceId: "B3-F2-S03" },
      { fullNumber: "3-701", spaceId: "B3-F7-N01" }
    ],
    lessons: [
      { id: "demo-shared-a", group: "TI-DEMO-1", subject: "Алгоритмы · демо", teacher: "Демо-преподаватель A", room: "3-405A", weekday: 4, startTime: "08:00", endTime: "09:30" },
      { id: "demo-shared-b", group: "SI-DEMO-2", subject: "Семинар · демо", teacher: "Демо-преподаватель B", room: "405a", weekday: 4, startTime: "08:00", endTime: "09:30" },
      { id: "demo-next-floor", group: "TI-DEMO-1", subject: "Сети · демо", teacher: null, room: "3-601", weekday: 4, startTime: "09:50", endTime: "11:20" },
      { id: "demo-missing-room", group: "SI-DEMO-2", subject: "Проект · демо", room: null, weekday: 4, startTime: "09:50", endTime: "11:20" },
      { id: "demo-unmapped", group: "SI-DEMO-2", subject: "Математика · демо", room: "3-609", weekday: 4, startTime: "11:40", endTime: "13:10" },
      { id: "demo-subgroup", group: "TI-DEMO-1", subgroup: "1", subject: "Лаборатория · демо", room: "3-201", weekday: 4, startTime: "11:40", endTime: "13:10" },
      { id: "demo-outside", group: "TI-DEMO-1", subgroup: "2", subject: "Практика · демо", buildingId: "utm-b2", room: "2-405", weekday: 4, startTime: "11:40", endTime: "13:10" },
      { id: "demo-odd", group: "TI-DEMO-1", subject: "Нечётная неделя · демо", room: "3-601", weekday: 4, startTime: "13:30", endTime: "15:00", weekParity: "odd" },
      { id: "demo-even", group: "TI-DEMO-1", subject: "Чётная неделя · демо", room: "3-701", weekday: 4, startTime: "13:30", endTime: "15:00", weekParity: "even" }
    ]
  };
  fixture.lessons = fixture.lessons.map(function (l) { return Object.assign({ buildingId: "utm-b3", source: "mock", academicYear: fixture.context.academicYear, courseYear: l.group === "TI-DEMO-1" ? 1 : 2, weekParity: "both" }, l); });
  global.FCIM_SCHEDULE_FIXTURE = fixture;
  if (typeof module !== "undefined" && module.exports) module.exports = fixture;
})(typeof window !== "undefined" ? window : globalThis);
