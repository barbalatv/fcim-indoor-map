# MAP-01 — Schedule-Driven Indoor Map & Spatial Fidelity Preservation

Дата: **8 октября 2026, Europe/Chisinau**. Workspace: `C:\Users\user\Documents\fcim-indoor-map`.

**Реализован standalone прототип академической карты: 140/140 финальных проверок PASS.**
Этажи 2–7 и все **194 исходных space ID** сохранены. Роутинг удалён из UI/runtime; архивный граф не изменён.
Расписание и четыре временные ассоциации полностью синтетические, отдельно подписаны и не сохраняются в bindings.
Физическая точность, реальные номера и доступность объектов остаются **не проверенными**.

## Проверенная исходная база

Прочитаны задание MAP-01, `README.md`, `FIX-01_REPORT.md`, оба существующих теста и предыдущий
`fcim-audit/AUDIT_RU.md` с воспроизведением FIM-08/10. `AGENTS.md` в проекте и проверенных родительских
каталогах отсутствует; workspace не является Git-репозиторием. Поэтому commit/branch/PR не создавались.
Memory registry проверен по FCIM/MAP-01: относящихся к проекту записей нет.

До изменений все три хэша совпали с зафиксированным FIX-01:

| Файл | Pre-MAP-01 SHA-256 |
|---|---|
| index.html | `850587A9BD46CF2B5D633AA6B12B56D4D07EBFE4A70061D5BCB347052C961EC7` |
| map-data.js | `9D52B845C0FFADCA6DF68562ADBC0BA8EEE54EFC03C11C1631294D3968D55E20` |
| README.md | `D7CD5E671875389E67D59DE6FCD19C6D438F2E3907424493A4D5E5581D1AFF7E` |

Baseline FIX-01: **54 PASS, 0 FAIL, exit 0, pageErrors: []**.
Исторический `tests/preserve-map.cjs` до изменений также завершился PASS относительно pre-FIX-01 копии.
Исходные файлы и tests скопированы в evidence `original` до первой записи.

## Изменённые и добавленные файлы

| Файл | Изменение |
|---|---|
| `index.html` | Два режима, группа/подгруппа, местные день/время, «Сейчас», демо-интервалы, подсветка, карточки всех записей, неизвестные комнаты; удалён роутинг; mobile sheet занимает отдельную область и выбранный полигон центрируется с учётом controls. |
| `map-data.js` | Ровно четыре удаления подряд повторённой точки `[504.0,0]`; JSON не регенерировался. |
| `README.md` | Новое направление, запуск и демо, границы утверждений, архивный граф, способы проверки. Неподтверждённая оценка ±1–2% больше не заявлена как установленная точность. |
| `tests/fix01.cjs` | Static-server allowlist дополнен четырьмя JS-модулями; только устаревшее ожидание работающего routing UI заменено ожиданием отсутствия routing UI. Все integrity/assertions остальных сценариев сохранены. |
| `room-contract.js` — новый | Точное выделение тела FIX-01 parser; независимый resolver, который не выбирает полигон по номеру этажа и не смешивает demo с реальными bindings. |
| `schedule-engine.js` — новый | Чистая оценка календаря, recurrence, parity, групп, подгрупп, курса и границ покрытия; диагностика неполных/повторённых записей; aggregation без перезаписи. |
| `schedule-fixture.js` — новый | Две вымышленные группы, четыре периода, девять занятий, явный демо-календарь и четыре временные ассоциации. |
| `map-semantics.js` — новый | Семантика corridor/staircase/elevator-shaft/unknown facilities; доказательства отдельно от operation/access. |
| `tests/map01-data.cjs` — новый | 41 независимая проверка фиксированных входов, времени, данных, нормализации и разрешения помещений. |
| `tests/map01-browser.cjs` — новый | 36 Playwright сценариев, реальные computed fills/hit tests, screenshots, file://, graph-free startup и пиксельное сравнение четырёх исправленных shapes. |
| `tests/map01-preserve.cjs` — новый | 9 строгих сравнений с pre-MAP-01 копией, структурная геометрия и сохранность кода/проверок FIX-01. |
| `TIMETABLE_CONTRACT.md` — новый | Контракт будущего адаптера и epistemic/source boundaries. |
| `MAP-01_REPORT.md` — новый | Этот отчёт, spatial fidelity, результаты и ограничения. |

`FIX-01_REPORT.md` и исторический `tests/preserve-map.cjs` **не изменены**. Дополнительная infrastructure,
backend/database, React/Expo, реальные accounts/API, этаж 1 и подвал не создавались. Репозиторий расписания
не открывался, не изменялся и не интегрировался. Проверено отсутствие внешних runtime requests.

## Spatial fidelity preservation и предварительные расхождения

Исходных фотографий (`jpg/jpeg/png/webp`) в workspace **нет**. Имена шести фото сохранены в provenance,
но сами изображения недоступны. Поэтому фото не инспектировались и независимая физическая квалификация
контура, порядка комнат, дверей и пропорций **невозможна**. Сохранение исходной реконструкции доказано;
сходство с реальным зданием без источника заново не подтверждалось.

| Этаж | Сохранено spaces | Rooms | Doors |
|---|---:|---:|---:|
| 2 | 32 | 30 | 33 |
| 3 | 33 | 31 | 41 |
| 4 | 33 | 31 | 38 |
| 5 | 30 | 28 | 35 |
| 6 | 36 | 34 | 47 |
| 7 | 30 | 29 | 32 |
| Всего | **194** | **183** | **226** |

Все stable ID, порядок и различия этажей, outlines, коридоры и corridorBand, labelPoints, partitions,
doors, лестницы W/M, шахты EL1/EL2, innerShaft, galleries/markers/glyphs, confidence и source metadata
сохранены. Rooms не нормализовались и не переставлялись; геометрия **не регенерировалась**.
Схемы и версии карт сохранены для совместимости FIX-01: удалённые нулевые сегменты не меняют форму или ID.
Все исходные `roomNumber: null`, `confirmedRoomNumbers: []` и `knownButUnlocated` неизменны.

FIM-10: удалена только вторая из двух одинаковых подряд точек `(504,0)`:

| ID | До | После | Проверка |
|---|---|---|---|
| B3-F2-N08 | 8 вершин | 7 вершин | Численная площадь модели и pixels идентичны |
| B3-F3-N08 | 8 вершин | 7 вершин | Численная площадь модели и pixels идентичны |
| B3-F4-N08 | 8 вершин | 7 вершин | Численная площадь модели и pixels идентичны |
| B3-F5-N07 | 8 вершин | 7 вершин | Численная площадь модели и pixels идентичны |

Byte comparison доказал, что `map-data.js` отличается от baseline **только четырьмя удалениями**.
Все **238 проверенных полигонов** имеют конечные координаты, ненулевую площадь, без соседних одинаковых
вершин и proper self-intersections. Браузер отдельно отрисовал old/new четыре формы одинаковым SVG style:
buffers screenshots совпали пиксель в пиксель. Площадь в координатах модели **не является площадью в m²**.

Архивный граф: **672 nodes, 714 внутрипоэтажных edges + 14 verticalLinks = 728 edges**, весь deep-equal baseline.
Его существующие замечания о stair landing/shaft/access и service transit не исправлялись.
FIM-03/06/07 больше не блокируют MVP с недоступной routing feature; это **не исправление физической проходимости**.

| Предварительное расхождение / неизвестность | Статус |
|---|---|
| Четыре нулевых ребра пространства | Устранены, без изменения формы |
| Повторная сверка с шестью исходными фото | BLOCKED: сами фото отсутствуют |
| Оценка ±1–2%, размеры, площадь и масштаб в метрах | UNVERIFIED / UNKNOWN; измерений и calibration нет |
| Принятая общая глубина комнат, малые подразделения и внутренние двери | Унаследованы без дополнительных геометрических «исправлений»; требуется сверка источника |
| Реальные room bindings / назначение помещений | Не подтверждены этой задачей; демо не является доказательством |
| Граф и доступность лестниц/лифтов | Архив сохранён, прежние физические замечания остаются |

## Непроверенные facilities и geometry

`observed` в этом отчёте означает унаследованное наблюдение автора реконструкции по плану, **не новый обход**.
Ни один новый объект в MAP-01 не объявлен verified. Semantic layer не меняет исходные типы/полигоны.

| Объекты / ID | Evidence | Что остаётся неизвестным |
|---|---|---|
| Коридоры `B3-F2-CORRIDOR`…`B3-F7-CORRIDOR` | observed | Физические ширины, фактический проход и препятствия |
| W/M: `B3-F{2…7}-STW`, `B3-F{2…7}-STM` | observed | Access, фактическое продолжение, особенно W 6→7; doors/landing geometry |
| EL1/EL2: `B3-F{2…6}-EL1`, `B3-F{2…6}-EL2` | observed shaft | Работа, остановки, доступ для студентов; лифт на 7 этаже не назначен |
| `B3-F{2…6}-STW-INNER` | inferred identity | Назначение квадрата/шахты, operation unknown |
| Туалеты `B3-TOILETS-UNKNOWN` | unknown, без polygon | Подтверждённых расположений/назначений нет; markers не созданы |
| Входы `B3-ENTRANCES-UNKNOWN` | unknown, без polygon | Нет геометрии этажа 1; проверенный вход не нанесён |
| `B3-F2-GAL` | observed shape, identity unknown | Направление и доступность восточного перехода |
| `B3-F4-CM1`, `B3-F5-CD1`, `B3-F7-SG1`, `B3-F7-SG2` | observed shape, identity unknown | Назначение corridor markers/перегородки/лестничных символов |
| Все реальные room numbers, стороны света, partitions/openings и metric dimensions | Не квалифицированы MAP-01 | Требуются фотографии, реальные наблюдения и calibration |

Полный список малых/служебных полигонов с **unknown назначением**, без объявления туалетами:

- Этаж 2: `B3-F2-S05`, `B3-F2-S06`, `B3-F2-S07`, `B3-F2-S08`.
- Этаж 3: `B3-F3-S01`, `B3-F3-S02`, `B3-F3-S03`, `B3-F3-S10`, `B3-F3-S11`, `B3-F3-S12`, `B3-F3-S13`.
- Этаж 4: `B3-F4-S08`, `B3-F4-S09`, `B3-F4-S10`, `B3-F4-S11`.
- Этаж 5: `B3-F5-S06`, `B3-F5-S07`, `B3-F5-S08`, `B3-F5-S09`.
- Этаж 6: `B3-F6-S07`, `B3-F6-S08`, `B3-F6-S09`, `B3-F6-S10`.
- Этаж 7: `B3-F7-S05`, `B3-F7-S06`, `B3-F7-S07`, `B3-F7-S08`.

## Удалённый routing UI

Удалены toolbar «Маршрут», кнопки «Маршрут отсюда/сюда», выбор start/end, elevator option,
swap/reset маршрута, staircase steps/floor hits, route success/failure cards, conditional cost,
SVG route layer/polylines/endpoints, routing state, node indexing, Dijkstra/buildGraph и их event handlers.
Ручной редактор, поиск, zoom/pan, touch/pinch, pending floor feedback, import/export/recovery остаются рабочими.
Startup, выбор room и shaft и расписание отдельно проверены в браузере **при удалённых navigation/verticalLinks**.

## Продемонстрированные сценарии

Все примеры ниже — **fixture**, не настоящие занятия или реальные номера помещений.

| День/время Chisinau | Сценарий |
|---|---|
| 08.10.2026 08:30 | My Group `TI-DEMO-1`: `3-405a → B3-F4-N05`; All Classes сохраняет также `SI-DEMO-2`, другой предмет и преподавателя того же слота. |
| 08.10.2026 10:00 | TI: `3-601 → B3-F6-N01`, автоматический этаж; SI: активное занятие с room null, без false highlight. |
| 08.10.2026 12:00 | SI: `3-609`, «Location not mapped yet», без полигона; TI subgroup 1: F2; subgroup 2: `2-405`, другой корпус, без ассоциации. |
| 08.10.2026 14:00 | Нечётная демо-неделя 5: F6. |
| 15.10.2026 14:00 | Чётная демо-неделя 6: F7. |
| 08.10.2026 09:40 / 11.10.2026 | Нет активного занятия; ближайшее занятие и его дата показаны с пунктирной будущей подсветкой. |
| 27.06.2027 20:00 / 28.06.2027 | Нет следующих занятий в coverage / явное сообщение о дате вне coverage. |
| Фиксированный UTC `2026-10-08T05:30Z` | «Сейчас» = 08:30 Chisinau; после перехода минуты/периода пересчёт. |

Дополнительно: injected test fixture с duplicate IDs/конфликтующим предметом и неполной записью;
все корректные конфликтующие записи сохранены, missing поля диагностированы. Это browser fault injection,
не live API. Другие данные остаются без подсветки; отсутствие занятия не объявляет room «свободной».

## Тесты и фактическое выполнение

Среда: Windows, Node **v22.23.1**, Playwright из bundled runtime, установленный **Chrome 154.0.8037.98**, headless.
Зависимости не устанавливались. Серверы тестов ephemeral, закрыты после завершения.

| Финальный запуск | Результат | Exit |
|---|---:|---:|
| `tests/fix01.cjs` | **54 PASS / 0 FAIL**, pageErrors `[]` | 0 |
| `tests/map01-data.cjs` | **41 PASS / 0 FAIL** | 0 |
| `tests/map01-browser.cjs` | **36 PASS / 0 FAIL**, errors `[]`, consoleErrors `[]` | 0 |
| `tests/map01-preserve.cjs` | **9 PASS / 0 FAIL** | 0 |
| Всего финальных сценариев | **140 PASS / 0 FAIL** | — |

Браузерные проверки независимы от data tests: проверяют actual SVG classes **и computed fill**,
текст каждой lesson, export/download, localStorage bytes, actual hit target, viewport/panel bounds и screenshots.
Current-time mode, half-open границы, UTC rollover, DST spring/autumn, even/odd, смена года, даты/исключения,
weekNumbers, course years, отсутствие anchors и missing records проверены фиксированными ожидаемыми значениями.

На mobile после 350 ms settling весь выбранный полигон внутри map viewport, выше sheet/floor controls,
`elementFromPoint` достигает room, а карточка выбора раскрыта в sheet. Проверены **390×844, 320×740, 844×390**,
северная/южная room и schedule-driven смена этажа. Desktop wheel/pan/reset и mobile pinch/pan проходят.
Mobile gestures — **CDP touch simulation**, не тест на физическом Android/iPhone.
Чётность, годы, даты и интервалы fixture явно вымышлены; университетские anchors не предполагаются.

Исходный FIX-01 suite до изменений выполнен отдельно и прошёл 54/54. Его integrity assertions не ослаблены:
новый preservation test сравнивает текст всех допускаемых изменений suite и исходный storage/validator block.
Тело канонического parser выделено **без изменения** и также сравнено с baseline.
Исторический `tests/preserve-map.cjs` остаётся неизменным историческим gate FIX-01; его требование byte-identical
routing implementation заменено в MAP-01 отдельной проверкой сохранности **данных графа**, поскольку routing runtime удалён.

Первый MAP-01 browser run: 34 PASS / 1 FAIL на landscape layout 844×390. Во время visual QA также найден CSS
порядок, скрывавший fill невыбранного scheduled room. Исправлены breakpoint и порядок styles, добавлена computed-fill
регрессия; проверена автоматическая прокрутка selected card. Первичные результаты не считаются финальными и сохранены.

Команды финальных запусков (PowerShell, из root):

```powershell
$evidenceDir = 'C:\Users\user\.codex\visualizations\2026\10\08\01a11cd9-d3f1-7b23-af60-cf7e9fe00cac\fcim-map01'
node tests/fix01.cjs 'C:\Users\user\Documents\fcim-indoor-map' "$evidenceDir\fix01-results.json"
node tests/map01-data.cjs "$evidenceDir\data-results.json"
node tests/map01-browser.cjs $evidenceDir "$evidenceDir\original"
node tests/map01-preserve.cjs "$evidenceDir\original" "$evidenceDir\preservation-results.json"
```

Также `node --check` для pure modules, browser harness и выделенного inline runtime завершился exit 0.

## Evidence

Каталог: [fcim-map01](C:/Users/user/.codex/visualizations/2026/10/08/01a11cd9-d3f1-7b23-af60-cf7e9fe00cac/fcim-map01).

- [baseline-fix01-results.json](C:/Users/user/.codex/visualizations/2026/10/08/01a11cd9-d3f1-7b23-af60-cf7e9fe00cac/fcim-map01/baseline-fix01-results.json), `baseline-preservation.json`, `original/` — исходная база.
- [fix01-results.json](C:/Users/user/.codex/visualizations/2026/10/08/01a11cd9-d3f1-7b23-af60-cf7e9fe00cac/fcim-map01/fix01-results.json), [data-results.json](C:/Users/user/.codex/visualizations/2026/10/08/01a11cd9-d3f1-7b23-af60-cf7e9fe00cac/fcim-map01/data-results.json), [browser-results.json](C:/Users/user/.codex/visualizations/2026/10/08/01a11cd9-d3f1-7b23-af60-cf7e9fe00cac/fcim-map01/browser-results.json), [preservation-results.json](C:/Users/user/.codex/visualizations/2026/10/08/01a11cd9-d3f1-7b23-af60-cf7e9fe00cac/fcim-map01/preservation-results.json) — финальные результаты.
- `floor-2.png`…`floor-7.png`, `shared-room.png`, `mobile-390x844.png`, `mobile-320x740.png`, `mobile-844x390.png` — visually inspected screenshots и полноразмерные artifacts.
- `browser-first-results.json`, `browser-second-results.json` — предыдущие прогоны, без подмены final evidence.
- `source-hashes.json` — полные текущие hashes, включая сам финальный отчёт; `spatial-inventory.json` — полный semantic inventory с ID и источниками.

## Текущие SHA-256

| Файл | SHA-256 текущих bytes |
|---|---|
| `index.html` | `E4C2049CCA9AAF6438C4A29628806CFD1A5D39A44742EBA31D2E9E597427810E` |
| `map-data.js` | `88E6FC2D7A66A6B09FDA2BA3821CF18344CDA924870DBC90E4FB48A04E728D8D` |
| `room-contract.js` | `964BF15C918E9F62A0B121F520C2A5F01C0E52FF964F00B892ABBF652875575D` |
| `schedule-engine.js` | `E2BF53F16D93AED906C3E545CE69C6EAD09D22DD343BC1B40CAE8E686998696F` |
| `schedule-fixture.js` | `6E6CC46215F6E51E638240481C711F5013544BC460FAA048D30134B6EE410323` |
| `map-semantics.js` | `4659D314CDFC943DB2E0760708737F4CF8DC995156EA38844B7428B99F6D84A1` |
| `README.md` | `0A0611AAE859794C4A3A95E2E1218FCB19DE1240CB367DA090BB8D62568E3CF6` |
| `TIMETABLE_CONTRACT.md` | `36DD3F97B80DDDFA0F749CACF79B60E7731D66FBE11CFB17EC8FD45E0762FD47` |
| `tests/fix01.cjs` | `1C71E498CCEB695750DCF175DE930FCE51CE8CED9FB6ED41B7F1B0EF1474DF90` |
| `tests/map01-data.cjs` | `6538C96B010989E1FF4DB2001AC6E09B2FCE73F424216E1E485CF50242F51A13` |
| `tests/map01-browser.cjs` | `690E33B3C9BB6E23DC42ECA4E05A361B5AB5C7FE8ACE2FE59E58CBB7BA71A1C4` |
| `tests/map01-preserve.cjs` | `3D6424AE0C7A8A8FCEBA056F2B58AA9A978DFF5C374EFA42B58C5C96EB729755` |
| `FIX-01_REPORT.md` | `882D8D9D9CE99193430E838E397F4B04DDE65DB4FA1991C32145F2E855C2648F` |
| `tests/preserve-map.cjs` | `CB9563E29BEDF5033ED4596518B943FE2E8425597C43CA15570C9C8785AB4812` |

Hash самого отчёта вынесен в `source-hashes.json`, чтобы исключить self-reference.

## Ограничения и следующие отдельные шаги

1. **Физическая сверка отсутствует.** Получить шесть исходных фото, сопоставить partitions/openings/landmarks,
   задокументировать discrepancies и calibration. До этого не заявлять ±1–2%, точные m² или метры.
2. **Реальные назначения и facilities неизвестны.** Подтвердить таблички, туалеты, входы, access лестниц и работу лифтов.
   Manual annotations сохраняют прежний provenance и не получают verified автоматически.
3. **Расписание synthetic-partial.** Реальный API payload, официальные академические anchors/паритет и полнота coverage
   требуют отдельного договора. Контракт подготовлен в [TIMETABLE_CONTRACT.md](TIMETABLE_CONTRACT.md), интеграция не начата.
4. **Только Chrome на Windows и эмуляция mobile.** Проверить настоящие Android/iOS, браузеры, screen reader и клавиатуру отдельно.
   Landscape работает, но ограниченная высота уменьшает room до малого масштаба; pan/zoom и collapse доступны.
5. **Календарная оценка ограничена контрактом.** Только интервалы внутри одного дня; максимум два года явного coverage.
   Неизвестное правило чётности не угадывается. Engine не подтверждает полноту или подлинность источника — это задача адаптера.
6. **Этаж 1 и D pending; архивная навигация не квалифицирована.** MAP-02, их реконструкция и pruning графа не выполнялись.

Acceptance программного прототипа MAP-01 выполнен в проверенной среде. Сохранность реконструкции доказана,
но физическая узнаваемость/точность и достоверность будущего реального расписания требуют независимых источников.
