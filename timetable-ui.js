/* Live timetable DOM and loading state. External strings enter through textContent only. */
(function (global) {
  "use strict";
  var disclaimer = "Данные из опубликованного расписания FCIM. Возможны изменения в отдельные даты. Подсветка показывает запланированные занятия, а не фактическое присутствие.";
  function node(tag, text, className, parent) {
    var el = document.createElement(tag); if (text != null) el.textContent = text;
    if (className) el.className = className; if (parent) parent.appendChild(el); return el;
  }
  function createController(hooks) {
    var selection = hooks.schedule, datasets = new Map(), states = new Map(), generation = 0, client = null;
    var base = (global.FCIM_TIMETABLE_CONFIG || {}).apiBaseUrl || "https://utm-curs-i-orar-2027.onrender.com";
    var sourceSelect = document.getElementById("sourceSelect"), courseSelect = document.getElementById("courseSelect");
    var groups = document.getElementById("groupSelect"), subgroups = document.getElementById("subgroupSelect");
    document.getElementById("apiBaseInput").value = base;
    function real() { return selection.source === "real"; }
    function newClient() {
      client = global.FCIM_TIMETABLE_API.createClient(base, function (schedule, status, course, fetchedAt) {
        return global.FCIM_TIMETABLE_ADAPTER.normalize(schedule, status, course, hooks.policy, fetchedAt);
      });
    }
    function option(select, value, text) { var el = node("option", text, null, select); el.value = value; }
    function fillGroups() {
      if (!real()) return;
      var data = datasets.get(selection.courseYear);
      groups.replaceChildren(); groups.disabled = !data;
      if (!data) { selection.group = ""; selection.subgroup = ""; subgroups.replaceChildren(); subgroups.disabled = true; return; }
      data.groups.forEach(function (group) { option(groups, group, group); });
      if (!data.groups.includes(selection.group)) { selection.group = data.groups[0]; selection.subgroup = ""; }
      groups.value = selection.group; fillSubgroups();
    }
    function fillSubgroups() {
      var data = datasets.get(selection.courseYear), values = data ? Array.from(new Set(data.events.filter(function (l) { return l.groups.includes(selection.group); }).map(function (l) { return l.subgroup; }).filter(Boolean))).sort() : [];
      subgroups.replaceChildren(); option(subgroups, "", "Все подгруппы");
      values.forEach(function (value) { option(subgroups, value, value + (/0[.,]5\s*gr/i.test(value) ? " · половина не идентифицирована" : "")); });
      if (!values.includes(selection.subgroup)) selection.subgroup = "";
      subgroups.value = selection.subgroup; subgroups.disabled = !values.length;
    }
    function scope() { return selection.mode === "all" ? [1, 2] : [selection.courseYear]; }
    function changed() { fillGroups(); hooks.update(true); }
    async function load(force) {
      if (!real()) return;
      var id = ++generation; if (client) client.cancel();
      var courses = scope();
      if (location.protocol === "file:") {
        courses.forEach(function (course) { states.set(course, { state: "unavailable", error: "Реальный режим требует HTTP(S) origin с разрешённым CORS. Демо доступно без сети." }); });
        changed(); return;
      }
      try { if (!client) newClient(); } catch (e) {
        courses.forEach(function (course) { states.set(course, { state: "unavailable", error: e.message }); }); changed(); return;
      }
      courses.forEach(function (course) { states.set(course, { state: datasets.has(course) ? "refreshing" : "loading", error: null }); });
      changed();
      await Promise.all(courses.map(async function (course) {
        try {
          var result = await client.load(course, { force: !!force });
          if (id !== generation || !real()) return;
          datasets.set(course, result.dataset); states.set(course, { state: result.state, error: result.error });
        } catch (e) {
          if (id !== generation || !real()) return;
          states.set(course, { state: "unavailable", error: e.message });
        }
        if (id === generation && real()) changed();
      }));
    }
    function syncVisibility() {
      sourceSelect.value = selection.source;
      document.getElementById("appSubtitle").textContent = real() ? "Академическая карта · опубликованный недельный план" : "Академическая карта · синтетическое расписание";
      document.getElementById("demoQualification").hidden = real();
      document.getElementById("demoDescription").hidden = real();
      document.getElementById("liveQualification").hidden = !real();
      document.getElementById("liveSourceControls").hidden = !real();
      document.getElementById("sourceDetails").hidden = !real();
      document.getElementById("periodSelect").closest("label").hidden = real();
      document.getElementById("liveQualification").textContent = disclaimer;
    }
    function lesson(event, reason) {
      var location = hooks.policy.locate(event, hooks.bindings()), card = node("div", null, "lesson");
      card.dataset.lessonId = event.id;
      node("b", event.subject, null, card);
      node("p", "Anul " + (event.courseYear === 1 ? "I" : "II") + " · " + event.groups.join(", ") + (event.subgroup ? " · подгруппа " + event.subgroup : " · вся группа"), null, card);
      node("p", selection.date + " · " + event.startTime + "–" + event.endTime, null, card);
      node("p", event.teacher || "Преподаватель не указан", null, card);
      node("p", "Аудитория: " + (event.rawRoom || "не указана") + (location.roomCode && location.roomCode !== event.rawRoom ? " → " + location.roomCode : ""), null, card);
      var parity = { odd: "нечётная", even: "чётная", both: "обе недели", unknown: "чётность неизвестна" };
      node("p", "Неделя: " + parity[event.weekParity] + " · опубликованный недельный план" + (reason ? " · применимость неизвестна: " + reason : " · по настроенной чётности"), "small muted", card);
      if (reason) node("p", "Подсветка не назначается при неизвестной применимости.", "msg warn", card);
      else if (location.spaceId) {
        var button = node("button", "Показать · " + location.floorLevel + " этаж", "btn small", card);
        button.type = "button"; button.onclick = function () { hooks.selectSpace(location.spaceId, { flash: true }); };
      }
      if (!location.spaceId) node("p", location.status === "outside-building" ? "Другой корпус или внешняя площадка; на карте корпуса 3 не отображается" :
        location.status === "ambiguous-binding" ? "Конфликт привязок; расположение не выбирается" : "Аудитория пока не сопоставлена с картой", "msg warn", card);
      if (location.spaceId) node("p", "Расположение: user-confirmed; осмотр на месте неизвестен.", "small muted", card);
      node("p", location.interpretation === "default-building-3" ? "Корпус 3 по принятой пользовательской конвенции FCIM." :
        location.interpretation === "explicit-building" ? "Корпус явно указан в источнике." : "Местоположение не разрешено.", "small muted", card);
      if (event.sourceKind !== "live") node("p", "Вид источника: " + event.sourceKind + " · опубликованный резервный/восстановленный PDF", "small muted", card);
      return card;
    }
    function render() {
      var summary = document.getElementById("scheduleSummary"), card = node("div", null, "card"); summary.replaceChildren(card);
      node("h3", selection.mode === "my" ? "Моя группа · " + (selection.group || "расписание недоступно") : "Все занятия · Anul I + Anul II", null, card);
      var covered = scope().filter(function (course) { return datasets.has(course); });
      if (!covered.length) node("p", "Расписание недоступно. Можно явно выбрать демо.", "msg warn", card);
      else if (covered.length !== scope().length) node("p", "Частичное покрытие: доступен курс " + covered.join(", ") + ". Второй курс не подменяется.", "msg warn", card);
      scope().forEach(function (course) {
        var state = states.get(course);
        if (!state || state.state === "loading") node("p", "Anul " + (course === 1 ? "I" : "II") + ": загрузка…", "small muted", card);
        else if (state.state === "stale") node("p", "Anul " + (course === 1 ? "I" : "II") + ": последний проверенный снимок, данные устарели. " + state.error, "msg warn", card);
        else if (state.state === "refreshing") node("p", "Anul " + (course === 1 ? "I" : "II") + ": обновление; показан предыдущий проверенный снимок.", "small muted", card);
        else if (state.error) node("p", "Anul " + (course === 1 ? "I" : "II") + ": " + state.error, "msg warn", card);
        var data = datasets.get(course);
        if (data && Date.now() - Date.parse(data.fetchedAt) >= 300000 && state?.state !== "stale") node("p", "Курс " + course + ": проверенный снимок загружен более 5 минут назад. Нажмите «Обновить расписание» для новой проверки API.", "small muted", card);
      });
      var e = selection.evaluation, active = selection.mode === "my" ? e.groupActive : e.active, unknown = selection.mode === "my" ? e.groupUnknown : e.unknown;
      if (e.contextStatus === "invalid") node("p", "Выберите корректные дату и время.", "msg warn", card);
      else if (covered.length && !active.length && !unknown.length) node("p", "Нет запланированного занятия на выбранное время по доступным данным. Это не подтверждает, что аудитории свободны.", "small muted", card);
      active.forEach(function (event) { card.appendChild(lesson(event)); });
      unknown.forEach(function (entry) { card.appendChild(lesson(entry.lesson, entry.reason)); });
      var details = document.getElementById("sourceStatus"); details.replaceChildren();
      node("p", "Покрытие: " + (covered.join(", ") || "нет доступных курсов") + ". Чётность — настроенный producer anchor; независимое подтверждение отсутствует. Официальные даты семестра, праздники и исключения неизвестны.", "small muted", details);
      scope().forEach(function (course) {
        var data = datasets.get(course); if (!data) return;
        node("p", "Курс " + course + " · последняя проверенная загрузка: " + data.fetchedAt + " · обновление источника: " + (data.sourceStatus.lastSuccessAt || "неизвестно") + " · PDF: " + data.metadata.source_kind + " · " + (data.metadata.academic_year || "учебный год неизвестен") + " / " + (data.metadata.semester || "семестр неизвестен"), "small", details);
        node("p", "Опорная нечётная неделя: " + data.calendar.oddWeekAnchor + " (configured-unverified). PDF hash: " + data.metadata.source_pdf_hash + "; parser: " + data.metadata.parser_version + "; transport: " + data.metadata.source_transport + "; snapshot: " + (data.metadata.source_snapshot_id || "не указан"), "small muted", details);
        if (data.warnings.length) node("p", "Замечания парсера: " + data.warnings.join("; "), "small muted", details);
      });
      document.getElementById("scheduleContext").textContent = selection.date + " " + selection.time + " · Europe/Chisinau · опубликованный недельный план" + (e.week ? " · " + (e.week.parity === "odd" ? "нечётная" : "чётная") + " неделя по настроенной опорной дате" : " · чётность неизвестна");
    }
    function evaluate() { return global.FCIM_TIMETABLE_ADAPTER.evaluate(scope().map(function (course) { return datasets.get(course); }).filter(Boolean), selection); }
    function roomPanel(panel, id) {
      if (!id) return;
      var card = node("div", null, "card schedule-room", panel); node("b", "План занятий на выбранное время", null, card);
      var events = selection.occupancy.filter(function (room) { return (room.spaceIds || [room.spaceId]).includes(id); }).flatMap(function (room) { return room.lessons; });
      if (!events.length) node("p", "Нет известного занятия. Фактическая доступность помещения неизвестна.", "small muted", card);
      if (events.length > 1) node("p", "Несколько исходных событий в одной аудитории: общий слот или возможный конфликт; все события сохранены.", "msg warn", card);
      events.forEach(function (event) { card.appendChild(lesson(event)); });
    }
    sourceSelect.onchange = function () {
      generation++; if (client) client.cancel();
      selection.source = sourceSelect.value; selection.subgroup = "";
      syncVisibility();
      if (real()) {
        var local = global.FCIM_SCHEDULE.localTime(Date.now(), "Europe/Chisinau"); selection.date = local.date; selection.time = local.time; load(false);
      } else { hooks.initDemo(); hooks.update(true); }
    };
    courseSelect.onchange = function () { selection.courseYear = Number(courseSelect.value); selection.group = ""; selection.subgroup = ""; load(false); };
    document.getElementById("refreshTimetable").onclick = function () { load(true); };
    document.getElementById("applyApiBase").onclick = function () {
      try {
        var value = global.FCIM_TIMETABLE_API.baseUrl(document.getElementById("apiBaseInput").value.trim());
        generation++; if (client) client.cancel(); base = value; client = null; datasets.clear(); states.clear(); load(true);
      } catch (e) { document.getElementById("apiConfigError").textContent = e.message; return; }
      document.getElementById("apiConfigError").textContent = "";
    };
    syncVisibility();
    return { real: real, load: load, render: render, evaluate: evaluate, fillSubgroups: fillSubgroups, roomPanel: roomPanel, syncVisibility: syncVisibility };
  }
  global.FCIM_TIMETABLE_UI = { createController: createController };
})(typeof window !== "undefined" ? window : globalThis);
