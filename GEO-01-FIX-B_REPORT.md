# GEO-01-FIX-B — повторная сверка пространственной модели этажа 2

Дата завершения: **9 октября 2026, Europe/Chisinau**. Рабочая ветка: `codex/geo-01-fix-b`.

## 1. Final verdict — итог

**BLOCKED — insufficient or conflicting evidence.**

Пересмотр доказательств и оценка A/B/C выполнены. Исправление production-геометрии не прошло обязательный evidence gate: при неподвижных конструктивных опорах нельзя устранить избыток ширины восточных пар одной перегородкой. Рассмотренная локальная нормализация переносит ошибку в холл либо ухудшает ранее правдоподобную соседнюю комнату. Непосредственное следование фотографии требует неподтверждённого перемещения лестниц, шахт и выемки фасада.

**Геометрия, двери, renderer и все исходные tracked-файлы оставлены прежними. GEO-001 остаётся открытым.** Созданы отчёт, машинный манифест с пустым списком изменений и две focused suites. Полные приватные before/after, overlays, диагностические варианты, воспроизводимые скрипты и результаты тестов подготовлены. Это завершённый результат диагностического gate, а не заявление об исправлении пропорций.

Основание остановки — §6 задания: «If Strategies A and B cannot materially improve the problem without creating other serious errors, stop the affected edits and report the conflict», а также запрет §5 переносить ошибку в соседа. Выбор сохранённой базы не означает, что старые координаты физически верны.

## 2. Baseline and Git — исходная база

Перед изменениями выполнены `git status --short --branch`, `git branch -vv`, `git log -6 --oneline`, `git fetch`, `git rev-parse HEAD main origin/main`.

| Параметр | Проверенный результат |
|---|---|
| Стартовая ветка | `main` |
| HEAD / local main | `53e0d069f846dacca6a7be24442e5120ba49a6f7` |
| origin/main после fetch | `8636c4aa6c0f49a4b5a49bdfa04e656634e93db5` |
| Разница | local main впереди на один FIX-A commit; remote не содержит его |
| FIX-A | Есть: F3 S02/S03 исправлены, F7 STW содержит `visualStair` |
| Рабочее дерево до задачи | tracked чистое; `GEO-01_FINDINGS.json`, `GEO-01_REPORT.md` untracked |
| Baseline suites | Реально выполнены: **161 PASS / 0 FAIL** |
| Ветка задачи | `codex/geo-01-fix-b`, создана от проверенной FIX-A базы |
| Commit / push / PR / merge | Не выполнялись |

До работы сохранена отдельная приватная копия исходников и tests (`baseline/`). В `baseline-gate.json` записаны исходные ветка, SHA, status, хэши всех 20 tracked-файлов и двух исходных untracked-отчётов. Оба пользовательских отчёта сохранены без изменений. В публичный change manifest включены точные baseline working-tree hashes, чтобы проверять и исходные Windows line endings.

| Файл | SHA-256 до = после, actual working-tree bytes |
|---|---|
| `map-data.js` | `61083b778dd7fe5ee891357b845efe8c69b3841b3152906ca8d345c24e40983d` |
| `index.html` | `c91338d75b514dd6257d533a284ca4e806a9942afc9c72f904ea51ef65834614` |

Эти хэши отличаются от опубликованных в FIX-A pre-commit хэшей из-за CRLF checkout. Нормализованный LF-текст соответствует фиксированному commit, а отдельные SHA проверяют точные неизменённые bytes текущего workspace. Никакая геометрическая разница этим объяснением не маскируется: весь объект модели также строго deepEqual с FIX-A HEAD.

Прочитаны README, map-data, index renderer/storage/interactions, map-semantics, GEO-01 report/findings, FIX-A report, MAP-01 report и TIMETABLE_CONTRACT; изучены существующие suites и GEO-01 scripts/data. `AGENTS.md` в проекте и применимых родительских каталогах не обнаружен.

## 3. Evidence reassessment — доказательства

Приватный каталог текущей проверки:

`C:/Users/user/.codex/visualizations/2026/10/08/01a11d4b-e610-7653-8a2c-f9aa786fdc6f/GEO-01-FIX-B`

Исходный GEO-01 каталог:

`C:/Users/user/.codex/visualizations/2026/10/08/01a11d0e-8cc7-72f1-8011-6ee2f75d27ae/GEO-01`

### Фото и регистрация

Указанный в задании `GEO-01/floor2.jpg` **отсутствует**. Действительные файлы — `GEO-01/sources/floor2.jpg` и `C:/Users/user/Downloads/Telegram Desktop/floor2.jpg`. Оба проверены по actual bytes:

`868F8D010D5D6F20FFA84ACF4C50DD926064E229C9AEDFCE98B6A266774E708D`.

Также проверены исходные и приватные фотографии этажей 3–7: каждый SHA совпал с `photo-manifest.json`. Просмотрены оригинальный снимок F2, crop, east detail и независимые зарегистрированные фотографии всех шести этажей. Файл соответствует пользовательской атрибуции этажа 2; номер этажа в заголовке обрезан/закрыт. Связь bytes с историческим `photo_1_...jpg` остаётся UNKNOWN.

F2 crop исходного фото: `[98,765,1755,1277]`. Углы exterior wall centerlines в crop: `[[26,120],[1557,130],[1547,398],[43,398]]`. Отображение: `[[0,0],[1000,0],[1000,175],[0,175]]`. Независимо решена линейная система homography; матрица совпала с GEO-01. Crop из проверенного JPEG и заново rectified PNG **пиксельно совпали** с сохранёнными GEO-01 артефактами на всех этажах. Результат сохранён в `source-verification.json`, `floor{2..7}-recreated.png`.

В fit входят **только четыре внешних угла**. Лестницы, шахты, выемка и внутренние перегородки не использованы для refit. Повторены прежние просмотренные corner selections; это воспроизведение метода с самостоятельной проверкой изображения, а не новая независимая архитектурная съёмка. Нулевой corner residual обеспечен четырёхточечной моделью и не подтверждает внутреннюю точность.

Дополнительно выполнено повторное определение центров чёрных перегородок восточного блока в других полосах пикселей: север Y180–220, юг Y400–432 registered image. Десять оценок отличаются от GEO-01 на **−0.55…+0.91 условной единицы X**. Порядок стен и близкие ширины N11/N12 в фотографии подтверждаются. Это проверка того же снимка; толщина стен, наклон и эвакуационные символы ограничивают точность (`black-core-recheck.json`).

### Uncertainty и held-outs

Повторены 17 сценариев: исходный fit плюс независимый сдвиг каждой координаты каждого exterior corner на ±4 исходных пикселя. Перегородки остаются fixed source marks и заново трансформируются. Это **не доверительные интервалы**, не совместная вариация всех углов и не оценка paper warp/lens distortion. Дополнительно ручной выбор линии ±3 registered pixels соответствует ±1.67 единицы X; консервативная погрешность отдельной ширины или суммы двух соседних ширин — ±3.33 (у суммы общая внутренняя перегородка сокращается).

| Наблюдение F2 | Исходный fit | Диапазон 17 corner-сценариев |
|---|---:|---:|
| Медиана abs partition residual | 27.278 | 23.497–31.008 |
| Максимум abs partition residual | 40.056 | 38.061–42.149 |
| Source N12/N11 | 1.0086 | 1.0048–1.0126 |
| Source N12/N13 | 0.7647 | 0.7629–0.7664 |
| Source S16/S17 | 0.7573 | 0.7555–0.7590 |
| Source N12+N13 | 150.000 | 148.095–151.954 |
| Source S16+S17 | 150.833 | 148.914–152.803 |

Разница между digital sum 192 и source sum сохраняется и при этой ограниченной чувствительности, даже с ручной поправкой. Это устойчивое расхождение двух интерпретаций **схемы**, не доказательство смещения физических шахт. Локальная кривизна плаката, lens distortion, ошибки самой эвакуационной схемы и imposed aspect ratio не устранены.

### Межэтажные опоры

| Этаж | W source X | M source X | Notch source X | Model EL shaft X | Corridor model Y |
|---|---|---|---|---|---|
| 2 | 194.72–257.78 | 783.89–845.83 | 507.78–535.00 | 750–777.5 | 76–104 |
| 3 | 183.06–243.06 | 749.44–809.44 | 483.89–508.33 | 750–775.5 | 77–108 |
| 4 | 189.44–250.83 | 756.11–815.00 | 490.56–515.00 | 748.5–776 | 75–108 |
| 5 | 186.94–247.50 | 753.61–812.78 | 488.89–513.33 | 748.5–774.5 | 76–108 |
| 6 | 189.44–250.28 | 755.00–813.61 | 490.56–515.00 | 749–776.5 | 75–108 |
| 7 | 188.11–248.33 | 755.28–814.72 | 487.78–514.44 | Нет X-символов/EL | 76–108 |

Source X — контрольные отметки после самостоятельной exterior registration каждого фото. Model EL — координаты модели, **не измеренные по фото размеры шахт**. В независимых фотографиях F2–6 видны две X-ячейки на северной стороне напротив M, на F7 их нет; положение узла относительно соседей и коридора узнаваемо. Точные границы шахт не добавлялись в набор количественных held-outs, чтобы не выдать повторное использование соседней перегородки за отдельное измерение.

**Структурное свидетельство:** повторяются последовательность W/коридор/выемка/M, примерно 60 единиц ширины лестниц на F3–7, лифтовой блок напротив M. **Согласованность source diagrams:** F3–7 после corner registration близки между собой; F2 даёт заметно иной внутренний масштаб. **Нормализационное предположение:** абсолютно одинаковые W183–243, M746–806, notch479–504 во всех моделях заданы прежней кусочной нормализацией, а не шестью физическими обмерами. **Физическая вертикальная соосность:** UNVERIFIED; фотографии эвакуационных схем её не аттестуют. Ни общий canonical template, ни единственное F2 фото не имеют безусловного приоритета.

## 4. Strategy comparison — варианты и решение

Объективная функция задана последовательностью ограничений: сначала сохраняются конструктивные опоры, стабильные ID/топология, shared boundaries и отсутствие новых gaps/overlaps; затем оцениваются отклонения width ratios, относительные width errors и абсолютные partition residuals. Перенос существенной ошибки в ранее разумного соседа недопустим. Единого взвешенного numerical score нет: отсутствуют физические допуски и статистическая модель источника.

### A — fixed envelopes

Оценено minimax-распределение ширины каждой восточной пары пропорционально source widths. Это явно заданная математическая диагностическая цель, не физический оптимум. Северная общая перегородка X894.5 → **891.2**, южная X887 → **888.7403**. Ширины N12/N13: 83.2/108.8; S16/S17: 82.7403/109.2597.

Парные N12/N13 и S16/S17 ratios совпадут с source. Но errors N13 растут **24.12% → 28.00%**, S16 **24.62% → 27.29%**. N12/N11 остаётся **1.375** вместо 1.009; медиана/максимум общих residuals не улучшаются. Ошибка N12/S17 передана соседям, общий избыток остался. Величины перемещения всего 3.3 и 1.74 сопоставимы с ручной uncertainty границ/ширин. Этот вариант не принят как существенное исправление GEO-001.

### B — локальное monotone отображение

Оценено северное отображение X750→750, 808→850, 894.5→915, 1000→1000. Порядок перегородок сохранён, shaft polygons остаются fixed. N12/N13 становятся 65/85, но facade envelope LH расширяется 58→100: error **−6.37% → +61.43%**. Ранее правдоподобное соотношение холла и соседей существенно искажается. Южная пара по-прежнему требует устранения ≈41 единицы, её fixed M/east envelope не даёт места для такого изменения без нового неподтверждённого пространства.

Отдельный stress-test B: привести только N12/N11 к 1.009, расширив N11 в сторону N10. Общая граница X689.5→664.2393; N11=85.7607, N10=98.7393. N10 error **−1.02% → −21.18%**, N11 **−6.12% → +33.08%**, N11/N10 **0.488 → 0.869** при source 0.514. Maximum partition residual растёт 40.06→57.43. Это не локальное улучшение без ущерба соседям.

Ни smooth transform, ни кусочно-монотонный transform не отменяют conservation: при fixed ends сумма widths постоянна. Обход этого ограничения taper/L-формой, новой нишей или пустой полосой требует дополнительной source evidence и меняет узнаваемую форму/топологию; таких изменений здесь не обосновано. Не заявляется доказательство невозможности всех мыслимых геометрий — доказано ограничение fixed compartment envelopes и отсутствие достаточного основания для расширения scope.

### C — непосредственно source-registered положения

Построен диагностический набор facade intervals и partition marks, а не готовая production reconstruction. Он даёт source ratios и нулевой partition residual **по построению**: те же измерения использованы для задания кандидата. Это не independent validation и не успешная qualification. Перенос W/M/notch нарушает cross-floor canonical alignment; южная правая стена M перемещается на +39.83, северный лифтовой узел также потребовал бы перемещения. Полная shaft/door topology и физические связи не квалифицированы. C не внедрён и не исполняется renderer.

| Criterion | A | B | C |
|---|---|---|---|
| Room proportion fidelity | Парные ratios лучше; N12/N11 остаётся сильно неверным; перераспределение errors | Северная пара совпадает; LH искажён; ratio-only версия портит N10/N11 | Source widths/ratios совпадают по построению |
| Internal partition residuals median/max | 27.28 / 40.06 | 26.61 / 39.83; ratio-only 27.28 / 57.43 | 0 / 0, fit-to-measurements, не независимая проверка |
| Cross-floor landmark alignment | Опоры прежние | Опоры прежние, холл меняется | W +11.72/+14.78; M +37.89/+39.83; notch +28.78/+31.00 |
| Source uncertainty sensitivity | Малые изменения рядом с ручной uncertainty | Избыток устойчив; enlargement LH намного больше uncertainty | Corner-сценарии не объясняют всё; physical cause неизвестна |
| Geometry continuity | Пары можно замкнуть без gaps; это ещё не принятие | Север можно замкнуть; юг без решения surplus | Контур/узлы/двери требуют дальнейшей реконструкции |
| Risk to stable room bindings | ID можно сохранить; changed boundary потребовал бы review | ID можно сохранить, существенное изменение узнаваемых соседей | ID формально сохраняемы, большой эффект положения и архивного графа |
| Implementation complexity | Низкая, но gate не пройден | Средняя, нет defensible geometry | Высокая; требуется новая независимая evidence |
| Remaining unresolved discrepancies | Основное растяжение и N12/N11 | Southern surplus, LH/N10 distortion | Межэтажная физическая соосность и достоверность evacuation diagram |

**Решение: production correction остановлена.** Для продолжения нужен независимый фронтальный план/снимок с непрерывным exterior outline и W/M/shaft/notch landmarks, либо архитектурный план/обмер, позволяющий разрешить inter-floor constraint. Явное согласование исключительно относительной парной коррекции A возможно как отдельное решение пользователя с принятием указанных ухудшений; в этом контракте такой компромисс не скрывается и не внедряется.

## 5. Exact geometry changes — точные изменения

**Список изменённых полигонов и дверей пуст.** Все old = new coordinates, включая исходные labelPoint и notes. Ни одна диагностическая координата не записана в `map-data.js`.

| Приоритетный ID | Polygon before = after | LabelPoint | Width before = after |
|---|---|---|---:|
| B3-F2-N11 | `[[689.5,0],[750,0],[750,76],[689.5,76]]` | `[720,38]` | 60.5 |
| B3-F2-N12 | `[[808,0],[894.5,0],[894.5,76],[808,76]]` | `[851,38]` | 86.5 |
| B3-F2-N13 | `[[894.5,0],[1000,0],[1000,76],[894.5,76]]` | `[947,38]` | 105.5 |
| B3-F2-LH | `[[750,57],[777.5,57],[777.5,0],[808,0],[808,76],[750,76]]` | `[779,66.5]` | 58 envelope |
| B3-F2-S15 | `[[683.5,104],[746,104],[746,175],[683.5,175]]` | `[715,139.5]` | 62.5 |
| B3-F2-S16 | `[[806,104],[887,104],[887,175],[806,175]]` | `[846.5,139.5]` | 81 |
| B3-F2-S17 | `[[887,104],[998,104],[998,175],[887,175]]` | `[942.5,139.5]` | 111 |

Shared N12/N13 X894.5 и S16/S17 X887 остаются полными общими рёбрами. Северная пара заполняет baseline envelope X808–1000/Y0–76, южная X806–998/Y104–175. Унаследованная разница между X998 помещения S17 и X1000 outline не исправлялась и не скрывается проверкой envelope. Соседи N10/S14, холл, шахты и фасад не перемещены. Source evidence/rationale — §3–4; неопределённость причины остаётся.

## 6. Quantitative before/after — результаты измерений

| Space | Source width ≈ | Model before | Retained after | Relative error before = after |
|---|---:|---:|---:|---:|
| N10 | 125.278 | 124 | 124 | −1.02% |
| N11 | 64.444 | 60.5 | 60.5 | −6.12% |
| LH | 61.944 | 58 | 58 | −6.37% envelope |
| N12 | 65 | 86.5 | 86.5 | +33.08% |
| N13 | 85 | 105.5 | 105.5 | +24.12% |
| S14 | 31.389 | 29.5 | 29.5 | −6.02% |
| S15 | 65.556 | 62.5 | 62.5 | −4.66% |
| S16 | 65 | 81 | 81 | +24.62% |
| S17 | 85.833 | 111 | 111 | +29.32% |

| Ratio | Source ≈ | Before = after | Diagnostic A | Diagnostic B |
|---|---:|---:|---:|---:|
| N12/N11 | 1.0086 | 1.4298 | 1.3752 | 1.0744 |
| N12/N13 | 0.7647 | 0.8199 | 0.7647 | 0.7647 |
| N11/N10 | 0.5144 | 0.4879 | 0.4879 | 0.4879 |
| S16/S17 | 0.7573 | 0.7297 | 0.7573 | 0.7297 |
| S16/S15 | 0.9915 | 1.2960 | 1.3238 | 1.2960 |

B в таблице — LH-expansion candidate; ratio-only stress-test приведён отдельно в §4. Диагностические столбцы не являются implemented after.

| Acceptance metric | Before | After |
|---|---:|---:|
| Internal partition count | 31 | 31 |
| Median / max abs partition residual | 27.278 / 40.056 | 27.278 / 40.056 |
| Held-out W/M/notch count | 6 | 6 |
| Held-out median / max abs X residual | 29.889 / 39.833 | 29.889 / 39.833 |
| GEO-01 measured F2 width error median / max | ≈5.263% / 33.077% | Те же, геометрия неизменна |
| Corridor width / building depth | 28/175 = 0.1600 | 0.1600 |
| North depth / building depth | 76/175 = 0.4343 | 0.4343 |
| South depth / building depth | 71/175 = 0.4057 | 0.4057 |
| Newly introduced geometric issues | — | 0 |
| Materially changed spaces / doors | — | 0 / 0 |
| Change in cross-floor structural alignment | — | 0 |

Для сравнения source corridor fraction ≈0.1556–0.1810, среднее 0.1675; source north/south depth fractions ≈0.4302/0.4024. Y-normalization не менялась. Ширины — фасадные intervals (для LH envelope включает вычитаемые shaft regions), не метрические размеры/площади. Числа с несколькими знаками нужны для воспроизведения арифметики; физическая точность не заявляется. 31 partition и 6 structural marks частично перекрываются, не образуют 37 статистически независимых наблюдений.

## 7. Structural preservation — сохранность конструкций

На F2 полностью прежние: W X183–243, M X746–806, EL1/EL2 X750–777.5, notch X479–504, outline X0–1000, corridor Y76–104. Полигоны, metadata, `entry`/`entries` и innerShaft сохранены. В source-relative системе остаются residuals W −11.72/−14.78, M −37.89/−39.83, notch −28.78/−31.00. Это unresolved normalization conflict.

Для F3–7 model structural anchors не изменены. Все `floors.navigation`, nodes/edges/weights, connectivity и 14 verticalLinks строго прежние. Archived graph geometry не стала более устаревшей из-за этой задачи, поскольку visual geometry не менялась. Унаследованные graph/model/source несогласованности не исправлены. Не появилось routing UI/Dijkstra; elevator operational/access остаются UNKNOWN.

FIX-A F3 S02/S03 и F7 `visualStair` сохранены **точно**, включая protected metadata и selectable geometry. GEO-004 S06, GEO-005 S12/S13 и их двери не менялись и не получили статус физически проверенных.

## 8. Identity and binding preservation — ID и привязки

Все **194 space IDs**, floorIds, порядок floors/spaces и полные исходные данные сохранены. Split/merge/reassignment/migration не выполнялись. Parser, storage/import/export, schedule engine/fixture/contract не изменены; реальные classroom numbers не назначены.

Изменённых ID для обязательной повторной проверки существующих bindings после **этого patch** нет. Все будущие реальные привязки восточных комнат N11/N12/N13/S15/S16/S17 и другие source-partial F2 пространства по-прежнему требуют проверки на месте из-за открытого GEO-001. Это унаследованная необходимость, не новая миграция.

В suites использованы изолированные browser profiles и синтетические manual bindings, проверены reload/search/export/import, bytes до export и сохранение ID после round trip. Существующий личный browser localStorage пользователя не читался и не изменялся; наличие реальных записей в нём **UNKNOWN**. Файловые/пользовательские annotations в репозитории не удалялись.

## 9. Browser and data tests — валидация и визуальные артефакты

Focused data suite проверяет всю F2 геометрию независимо от манифестных значений: конечные координаты, положительную signed area/сохранённую orientation, proper self-crossings, consecutive duplicates, nonadjacent touches, labels, doors, shared edges, orthogonal positive-area intersections между всеми парами rooms, corridor и verticals, tiling восточных envelopes, dangling graph/door references. Полный model и все baseline source bytes также проверяются отдельно.

Whitelist касается **только точного baseline polygon F2-N08 и точного набора его nonadjacent touch pairs**. F3-N08/F4-N08/F5-N07 строго сохранены; существующая FIX-A suite продолжает проверять все 241 polygons и четыре конкретных inherited spurs. Ни один тест не допускает произвольные новые touches, overlaps или изменения всего этажа.

| Suite | Baseline PASS / FAIL | Final PASS / FAIL |
|---|---:|---:|
| FIX-01 | 54 / 0 | 54 / 0 |
| MAP-01 data | 41 / 0 | 41 / 0 |
| MAP-01 browser | 36 / 0 | 36 / 0 |
| MAP-01 preservation | 10 / 0 | 10 / 0 |
| GEO-01-FIX-A data | 11 / 0 | 11 / 0 |
| GEO-01-FIX-A browser | 9 / 0 | 9 / 0 |
| GEO-01-FIX-B data | — | 12 / 0 |
| GEO-01-FIX-B browser | — | 6 / 0 |
| **Всего** | **161 / 0** | **179 / 0** |

Final цифры относятся к реально выполненным suites; JSON results хранятся в приватном каталоге. Браузер Chrome **154.0.8037.98**, Playwright headless, включая `file://` и localhost existing suites. Uncaught exceptions/console errors — 0. Mobile — CDP/touch emulation, не физическое устройство.

Existing suites повторно выполнены на финальном исходнике: floors 2–7, keyboard/pointer selection, search/bindings, transactional import/export и failed writes, My Group/All Classes, synthetic active/future highlights, unmapped/missing/other-building rooms, mobile panel/pinch/pan/zoom, отсутствие routing UI и browser errors. Focused F2 suite проверяет все семь приоритетных spaces, synthetic eastern bindings и F2 touch/pan/pinch; actual runtime SVG всех этажей 2–7 **пиксельно идентичен** baseline.

Разрешения на изменение исторических preservation assertions не понадобились: production geometry не менялась. Существующие suites и allowlists оставлены байт-в-байт. Новая suite строже сопоставляет все tracked-файлы с fixed baseline content и зафиксированными working-tree hashes.

Первый focused data run: **11 PASS / 1 FAIL** из-за сравнения CRLF checkout отчёта FIX-A с LF Git blob. Проверка уточнена: Git content сравнивается после нормализации только CRLF, actual bytes отдельно проверяются по исходным хэшам. Следующий run выявил ошибку нового манифеста: были перенесены исторические pre-commit hashes вместо actual baseline checkout hashes. Манифест исправлен по `baseline-gate.json`; production файлы не трогались. Финально **12/0**. Эти diagnostic failures не являются геометрическими проблемами и не скрыты итоговым PASS. Первый результат сохранён в `focused-data-first.json`.

Команды из repository root:

```powershell
$auditDir = 'C:/Users/user/.codex/visualizations/2026/10/08/01a11d4b-e610-7653-8a2c-f9aa786fdc6f/GEO-01-FIX-B'
$mapOriginal = 'C:/Users/user/.codex/visualizations/2026/10/08/01a11cd9-d3f1-7b23-af60-cf7e9fe00cac/fcim-map01/original'
$fixABaseline = 'C:/Users/user/.codex/visualizations/2026/10/08/01a11d33-186c-71f3-88d8-c16c59acea38/GEO-01-FIX-A/baseline'
node tests/fix01.cjs . "$auditDir/final-fix01.json"
node tests/map01-data.cjs "$auditDir/final-data.json"
node tests/map01-browser.cjs "$auditDir/final-browser" $mapOriginal
node tests/map01-preserve.cjs $mapOriginal "$auditDir/final-preserve.json"
node tests/geo01-data.cjs "$auditDir/final-geo-data.json"
node tests/geo01-browser.cjs "$auditDir/final-geo-browser" $fixABaseline
node tests/geo01-fix-b-data.cjs "$auditDir/final-focused-data.json"
node tests/geo01-fix-b-browser.cjs "$auditDir/focused-browser" "$auditDir/baseline"
python "$auditDir/reassess.py"
python "$auditDir/visualize.py"
node --check tests/geo01-fix-b-data.cjs
node --check tests/geo01-fix-b-browser.cjs
git diff --check
```

Baseline runs использовали те же шесть existing suites и отдельные `baseline-*` result paths. No new dependencies: использованы установленные Node/Playwright и Python/NumPy/Pillow. Аналитические скрипты находятся вне Git.

### Приватные визуальные доказательства

| Артефакт | Содержание |
|---|---|
| [floor2-before-after.png](C:/Users/user/.codex/visualizations/2026/10/08/01a11d4b-e610-7653-8a2c-f9aa786fdc6f/GEO-01-FIX-B/floor2-before-after.png) | Actual runtime SVG до/после; явно подписано BLOCKED, 0 moved borders |
| `focused-browser/floor2-before.svg/.png`, `floor2-after.svg/.png` | Полные действительные exports без runtime geometry substitutions |
| [floor2-before-source-overlay.png](C:/Users/user/.codex/visualizations/2026/10/08/01a11d4b-e610-7653-8a2c-f9aa786fdc6f/GEO-01-FIX-B/floor2-before-source-overlay.png) | Исходная модель красным на фото после exterior registration |
| [floor2-after-source-overlay.png](C:/Users/user/.codex/visualizations/2026/10/08/01a11d4b-e610-7653-8a2c-f9aa786fdc6f/GEO-01-FIX-B/floor2-after-source-overlay.png) | Сохранённая модель зелёным; нового улучшения не изображает |
| [east-block-diagnostic.png](C:/Users/user/.codex/visualizations/2026/10/08/01a11d4b-e610-7653-8a2c-f9aa786fdc6f/GEO-01-FIX-B/east-block-diagnostic.png) | Фото, old model и отклонённые A/B границы, разделённые цветом/штрихом |
| [room-width-ratios.png](C:/Users/user/.codex/visualizations/2026/10/08/01a11d4b-e610-7653-8a2c-f9aa786fdc6f/GEO-01-FIX-B/room-width-ratios.png) | Source ratios, corner scenario bands и неприменённые A/B/C |
| [structural-floor2-floor3.png](C:/Users/user/.codex/visualizations/2026/10/08/01a11d4b-e610-7653-8a2c-f9aa786fdc6f/GEO-01-FIX-B/structural-floor2-floor3.png) | F2/F3 независимые регистрации, canonical и source held-outs |
| [moved-borders-diagnostic.png](C:/Users/user/.codex/visualizations/2026/10/08/01a11d4b-e610-7653-8a2c-f9aa786fdc6f/GEO-01-FIX-B/moved-borders-diagnostic.png) | Конкретные proposed moved borders, явно DIAGNOSTIC ONLY |
| [floor2-mobile-after.png](C:/Users/user/.codex/visualizations/2026/10/08/01a11d4b-e610-7653-8a2c-f9aa786fdc6f/GEO-01-FIX-B/focused-browser/floor2-mobile-after.png) | Реальный mobile runtime screenshot сохранённой F2 карты |
| `focused-browser/floor2-{desktop,mobile}-{before,after}.png` | Desktop/mobile screenshots обоих actual source directories |
| `floor{2..7}-recreated.png` | Самостоятельно воспроизведённые фото после corner registration |

Полные comparisons, ratios, closeups и mobile screenshot просмотрены визуально. Original photograph хранится в проверенном `GEO-01/sources`, отдельная новая photographic копия в public repository не добавлялась. Ни диаграмма вариантов, ни манифест не являются архитектурным source of truth.

## 10. Remaining GEO-01 findings — остатки

| Finding | Статус после этой задачи |
|---|---|
| GEO-001 | **BLOCKED correction / OPEN discrepancy**: source conflict воспроизведён, A/B/C оценены, geometry не исправлена |
| GEO-002 / FIX-A | Ранее выполненная частичная коррекция S02/S03 сохранена; S01/passages/назначение остаются нерешёнными |
| GEO-003 / FIX-A | F7 visual stair сохранён; физическая связь, operational/access и точный enclosure остаются UNKNOWN |
| GEO-004 | Out of scope, центральные cells/S06 не переклассифицированы |
| GEO-005 | Out of scope, S12/S13/vestibule/doors unverified и прежние |
| GEO-006/007 | Out of scope, глобальная нормализация и staircase drawing не переработаны |
| Четыре touching spurs | Exact inherited conditions сохранены; новая геометрическая задача не выполнена |

## 11. GEO-02 readiness — этаж 1

Canvas X0–1000/Y0–175 пригоден для следующей **схематической** оцифровки, но canonical X не квалифицированы как общие физические оси. Готовность условная. Не следует принудительно fitting floor 1 по W/M/notch и затем выдавать эти же marks за независимую проверку.

Нужен читаемый цельный источник этажа 1 с entrance node и внешними углами, отдельная corner registration, не участвовавшие в fit structural held-outs и явная политика разрешения несовпадений. Фотография/архитектурный план F2 с независимой проверкой M/shaft/east block позволит определить причину текущего конфликта. Этаж 1 и basement D не создавались; реальные размеры, номера, доступ и elevator operation неизвестны. GEO-02 может изучать новую evidence, но не должен наследовать неподтверждённые оси как physical truth.

## 12. Merge recommendation — review и дальнейшая доставка

**Безопасен для code review как диагностический отчёт и дополнительные проверки. Не считать merge закрытием GEO-001.** Production patch отсутствует; прежняя пространственная проблема остаётся. Четыре новых файла задачи: этот report, `GEO-01-FIX-B_CHANGES.json`, `tests/geo01-fix-b-data.cjs`, `tests/geo01-fix-b-browser.cjs`. Все 20 baseline tracked-файлов и два пользовательских untracked-отчёта защищены точными hashes; добавленных фотографий в Git нет.

Команды для последующей ручной подготовки (здесь **не выполнялись**):

```powershell
git switch codex/geo-01-fix-b
git diff --check
git add -- GEO-01-FIX-B_REPORT.md GEO-01-FIX-B_CHANGES.json tests/geo01-fix-b-data.cjs tests/geo01-fix-b-browser.cjs
git diff --cached --stat
git commit -m "docs: document floor 2 geometry evidence gate and focused validation"
```

Для отдельного PR этого gate сначала следует согласовать публикацию зависимого FIX-A commit `53e0d06`, который сейчас есть только в local main. После такой публикации и собственного commit отчёта пользователь может выполнить:

```powershell
git push -u origin codex/geo-01-fix-b
# Подготовьте PR_BODY.md вне staged files, используя фактический диагностический verdict.
gh pr create --draft --base main --head codex/geo-01-fix-b --title "GEO-01-FIX-B: floor 2 evidence conflict and validation" --body-file PR_BODY.md
```

Без публикации FIX-A такой PR к текущему remote main включит также FIX-A diff. Это следует явно решить перед отправкой; автоматически push/PR/merge не выполнялись. Приватные фото и audit artifacts оставляются вне Git. Следующий implementation contract должен разрешить источник/структурные ограничения, а не только потребовать меньшую цифру residual или больший PASS count.
