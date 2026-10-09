# UI-01-FIX-B — финальная очистка первого этажа

## 1. Вердикт и baseline

**PASS: 398 PASS / 0 FAIL во всех 22 активных наборах.** 103 и 106 показаны без внутренних перегородок; западный лифт выровнен справа; все 15 номеров имеют единый стиль и положение в левом верхнем углу общего прямоугольника аудитории.

До редактирования повторно выполнен принятый FIX-A baseline: **367 PASS / 0 FAIL**, 20 наборов. Точные байты всех 62 файлов сохранены в `C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/baseline`; [baseline.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/baseline.json) содержит SHA-256, HEAD и исходный git status. Baseline-результаты: [baseline-suites.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/baseline-suites.json).

Ветка: `Vladimir/ui-01-fix-b-final-cleanup`; исходная ветка — `codex/ui-01-fix-a-horizontal-grid`. HEAD остаётся `8b0a24aec70d51178291a0fd14d1860467e5b607`. Коммит, push, PR и merge не выполнялись.

## 2. Точные файлы изменений

Относительно завершённой FIX-A изменены только 7 файлов:

- [schematic-layout.js](C:/Users/user/Documents/fcim-indoor-map/schematic-layout.js) — открытые display-контуры 101/103/106, общий inset номера, положение западного лифта из bounds лестницы.
- [index.html](C:/Users/user/Documents/fcim-indoor-map/index.html) — единый F1 стиль номеров, их позиции и неинтерактивная подложка составных аудиторий для устранения сглаженного шва.
- [tests/ui01-data.cjs](C:/Users/user/Documents/fcim-indoor-map/tests/ui01-data.cjs) — прежняя проверка видимых перегородок теперь проверяет их отсутствие по новому заданию.
- [tests/ui01-browser.cjs](C:/Users/user/Documents/fcim-indoor-map/tests/ui01-browser.cjs) — экспорт SVG сохраняет computed dominant-baseline подписей.
- [tests/ui01-fix-a-data.cjs](C:/Users/user/Documents/fcim-indoor-map/tests/ui01-fix-a-data.cjs) — новые ожидаемые координаты/выравнивание лифта и открытые composite-контуры.
- [tests/ui01-fix-a-browser.cjs](C:/Users/user/Documents/fcim-indoor-map/tests/ui01-fix-a-browser.cjs) — проверка номера по общему контуру; hit-прямоугольники отделены от подложки; точный экспорт baseline текста.
- [tests/ui01-fix-a-contract.cjs](C:/Users/user/Documents/fcim-indoor-map/tests/ui01-fix-a-contract.cjs) — точное обратное восстановление FIX-B перед неизменными историческими byte gates.

Добавлены 5 файлов:

- [tests/ui01-fix-b-contract.cjs](C:/Users/user/Documents/fcim-indoor-map/tests/ui01-fix-b-contract.cjs)
- [tests/ui01-fix-b-data.cjs](C:/Users/user/Documents/fcim-indoor-map/tests/ui01-fix-b-data.cjs)
- [tests/ui01-fix-b-browser.cjs](C:/Users/user/Documents/fcim-indoor-map/tests/ui01-fix-b-browser.cjs)
- [UI-01-FIX-B_CHANGES.json](C:/Users/user/Documents/fcim-indoor-map/UI-01-FIX-B_CHANGES.json)
- [UI-01-FIX-B_REPORT.md](C:/Users/user/Documents/fcim-indoor-map/UI-01-FIX-B_REPORT.md)

55 других файлов совпадают с исходными байтами. UI-01/FIX-A отчёты и manifests сохранены. Снимки, runner, gallery, журналы и ограниченный diff находятся вне репозитория: `C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B`. Новый manifest содержит 17 обратимых hunks; gate восстанавливает 62 файла FIX-A, после чего прежняя цепочка UI/ROOM/GEO/FIX остаётся строгой. Проверки источников, security, persistence и import/export не ослаблены; заменены только устаревшие ожидания display-геометрии.

## 3. Перегородки до / после

| Аудитория | Сохранённые компоненты | До FIX-B | После FIX-B |
|---|---|---|---|
| 101 | S12 + S13 | Без стены | Без стены; одна общая подложка |
| 103 | S10 + S11 | Видимая стена X=570, Y=105…175 | Стена не рисуется; внешний контур X=540…600, Y=105…175 сохранён |
| 106 | N05 + N06 | Видимая стена X=540, Y=0…75 | Стена не рисуется; внешний контур X=510…570, Y=0…75 сохранён |

Это правило display-слоя по логическим roomCode. Исторические polygon, partition и door metadata не изменены. Одна неинтерактивная подложка на каждый composite заполняет общий контур теми же цветами selection/schedule; два исходных hit region остаются сверху. Подложка устраняет светлый шов от сглаживания соседних прямоугольников на дробном масштабе, обнаруженный растровым тестом. В финальных снимках на месте обоих прежних швов измерен обычный цвет аудитории.

## 4. Западный лифт до / после

| Объект | До [x,y,w,h] | После [x,y,w,h] |
|---|---|---|
| STW — лестница | [186,105,61,70] | [186,105,61,70] |
| STW-INNER — лифт | [199,122.5,35,35] | [212,122.5,35,35] |

X лифта вычисляется как `stair.x + stair.width - lift.width`, Y — `stair.y + (stair.height - lift.height)/2`, из фактического `firstFloorRects.STW`. Размер остаётся 35×35; правые края совпадают на X=247. Сеть стен объединяет совпавшие отрезки: общая правая стенка нарисована один раз, растровая толщина — **2 px**.

На старом левом участке X=199/205 измеряется цвет лестницы; справа X=240 — цвет лифта. DOM содержит одну fill/hit фигуру STW-INNER по новым координатам. Клик/touch внутри лифта и на освободившейся части лестницы проверены на всех трёх viewport. Статус остаётся `reported-out-of-service`; SH1/SH2 сохраняют `unknown`. Декоративные линии, символы, подписи лифтов и дверей не добавлены.

## 5. Номера, selection и schedule

Для всех 15 номеров F1: **10 px**, один наследуемый шрифт интерфейса, **weight 600**, цвет `var(--ink)` — RGB(29,39,51); `text-anchor:start`, `dominant-baseline:hanging`. Положение: **x=logicalRect.x+6**, **y=logicalRect.y+8**. Это последнее единое правило пользователя применяется и к 103/106. Для 101/103/106 показывается ровно одна подпись по общему контуру: (606,113), (546,113), (516,8). WC, Orange Cafe и Вахта сохраняют отдельные прежние правила.

В браузере проверены одинаковые computed styles, одинаковые координатные отступы, отсутствие пересечений подписей и запас до стен для всех 15 номеров. Клик по каждому компоненту, по бывшему шву, keyboard и search выбирают весь composite; общий outline и fill покрывают весь кабинет. В изолированном синтетическом schedule — 4 occupancy и 8 уникальных lessons, без дубликатов.

Все **222 ID** и **15 mappings** сохранены. `map-data.js` byte-identical, SHA-256: `50a004532a920f1ae6336a871f04c860ad162de876221b2346bcf606b9d77193`. Также байт-в-байт защищены room-identification.js, room-contract.js, map-semantics.js, schedule-engine.js и schedule-fixture.js. Рельсы Y=0/75/105/175 сохранены; все прочие display-прямоугольники FIX-A неизменны. Storage остаётся непубличным, двери скрыты.

## 6. Регрессия

| Группа | PASS | FAIL |
|---|---:|---:|
| Исторические FIX/MAP/GEO/ROOM: 16 наборов | 302 | 0 |
| UI-01: data + browser | 37 | 0 |
| UI-01-FIX-A: data + browser | 28 | 0 |
| UI-01-FIX-B: data | 14 | 0 |
| UI-01-FIX-B: browser | 17 | 0 |
| **Всего: 22 набора** | **398** | **0** |

Полный финальный запуск: [final-suites.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-suites.json). Новые результаты: [final-ui01-fix-b-data.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-ui01-fix-b-data.json) и [browser-results.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-ui01-fix-b-browser/browser-results.json). Перед финальным полным запуском прошли focused preflight; результат первой растровой проверки, обнаружившей сглаженный шов, сохранён в `preflight-browser/browser-results.json`.

Chrome 154.0.8037.98, headless; отдельные профили и localStorage. Проверены desktop **1440×900**, mobile **390×844** и **320×740** с touch emulation. На каждом из этажей 2–7 сравнение с принятым локальным FIX-A baseline показало **0 изменённых пикселей** (RGBA 2080×440); geometry и wall network также совпадают. **0 JS/console errors**. `git diff --check` завершился с кодом 0.

Воспроизведение:

```powershell
& 'C:\Users\user\AppData\Local\hermes\node\node.exe' 'C:\Users\user\.codex\visualizations\2026\10\09\01a1213c-746b-70c0-bd48-c199f4861af2\UI-01-FIX-B\run-suites.cjs' 'C:\Users\user\Documents\fcim-indoor-map' final
```

Runner использует сохранённые локальные baseline прежних GEO/ROOM проверок; их абсолютные пути записаны в нём.

## 7. Скриншоты

[Галерея до / после](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/gallery.html).

| Область | До: принятая FIX-A | После FIX-B |
|---|---|---|
| Аудитория 103 | [До](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-ui01-fix-b-browser/before-room103.png) | [После](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-ui01-fix-b-browser/after-room103.png) |
| Аудитория 106 | [До](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-ui01-fix-b-browser/before-room106.png) | [После](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-ui01-fix-b-browser/after-room106.png) |
| Западная лестница и лифт | [До](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-ui01-fix-b-browser/before-west-stair-elevator.png) | [После](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-ui01-fix-b-browser/after-west-stair-elevator.png) |
| Первый этаж целиком | [До](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-ui01-fix-b-browser/before-floor1.png) | [После](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-ui01-fix-b-browser/after-floor1.png) |
| Desktop 1440×900 | [До](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-ui01-fix-b-browser/before-1440x900-overview.png) | [После](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-ui01-fix-b-browser/after-1440x900-overview.png) |
| Mobile 390×844 | [До](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-ui01-fix-b-browser/before-390x844-overview.png) | [После](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-ui01-fix-b-browser/after-390x844-overview.png) |
| Mobile 320×740 | [До](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-ui01-fix-b-browser/before-320x740-overview.png) | [После](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-ui01-fix-b-browser/after-320x740-overview.png) |

Детальные PNG экспортированы из фактически отрисованного SVG с computed styles, включая text baseline; SVG сохранены рядом. Overview viewport — снимки интерфейса. Обязательные пары просмотрены визуально после финального запуска. Для этажей 2–7 сохранены `before-floorN.png` и `after-floorN.png` в `C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-B/final-ui01-fix-b-browser`.

## 8. Ограничения

Это локальная схема в условных единицах, без подтверждения физических размеров или работы лифтов на месте. Исторические перегородки сохраняются в источниках даже при упрощённом отображении. Полный мобильный обзор содержит мелкие номера; для подробного чтения остаётся существующий зум. Touch проверен эмуляцией Chrome, без отдельного реального устройства. Изменения зависят от сохранённой незакоммиченной UI-01/FIX-A базы; публикация и серверная приёмка не выполнялись.
