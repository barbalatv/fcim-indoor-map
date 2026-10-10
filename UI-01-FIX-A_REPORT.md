# UI-01-FIX-A — нормализация горизонтальной сетки первого этажа

## 1. Итоговый вердикт

**PASS — локальные критерии UI-01-FIX-A выполнены.** Основные блоки верхнего ряда имеют Y=0…75, нижнего — Y=105…175; между ними непрерывная полоса коридора Y=75…105. Ступеньки у лифтов, основной лестницы и вахты устранены. Исполнено **367 PASS / 0 FAIL** в 20 активных наборах. Это локальная проверка, без публикации или проверки здания на месте.

## 2. Baseline и ветка

Исходная ветка: `codex/ui-01-minimalist-floorplan`; HEAD: `8b0a24aec70d51178291a0fd14d1860467e5b607`. Рабочая ветка: `codex/ui-01-fix-a-horizontal-grid`. HEAD не изменён; коммит, push, PR и merge не выполнялись.

Старт — завершённая незакоммиченная UI-01: 50 отслеживаемых и 7 новых файлов, всего 57. До редактирования сохранены точные байты, SHA-256 и git status. До изменений повторно выполнены все 18 активных тогда наборов: **339 PASS / 0 FAIL**.

Baseline: [baseline.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/baseline.json); копия файлов: `C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/baseline`. Результаты: [baseline-suites.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/baseline-suites.json). Все предыдущие изменения UI-01 сохранены; перечень ниже рассчитан относительно этого локального baseline, а не старого Git HEAD.

## 3. Исправленная проблема

Лифты образовывали блок Y=0…60, тогда как аудитории и кафе заканчивались на Y=75. STM, HE и общий блок вахты начинались на Y=100 вместо Y=105. Границы справа образовывали локальные ступеньки. Западный вложенный лифт имел отдельные произвольные границы Y=127…153.

Кафе и наружный верхний правый блок уже занимали правильный диапазон. Исправлены соседние блоки и внутренние деления; перенос кафе не понадобился.

## 4. Определённая горизонтальная сетка

| Основная линия | Y в условных единицах |
|---|---:|
| Наружная верхняя граница | 0 |
| Низ верхней полосы | 75 |
| Верх нижней полосы / низ коридора | 105 |
| Наружная нижняя граница | 175 |

Все Y-границы прямоугольников вычисляются через `firstFloorRails`. Верхняя и нижняя полосы покрывают X=0…1000 без зазоров, наложений и выступов. Открытые холлы сохраняют нейтральную заливку без добавленных стен.

Дополнительные линии имеют явное назначение: Y=37,5 делит два квадратных лифта и скрытые компоненты верхнего служебного блока; Y=140 делит компоненты вахты. У служебного блока и вахты внутренние швы не рисуются. Y=122,5 и 157,5 задают центрированный квадрат западного лифта внутри лестницы. Это намеренная вложенная ячейка, не выступ основного ряда; только её вложение является разрешённым наложением.

## 5. Изменённые элементы

| Элемент | До | После |
|---|---|---|
| SH1 + SH2 | Два квадрата 30×30; блок Y=0…60 | Два квадрата 37,5×37,5; блок Y=0…75 |
| Верхний холл LH | X=780…816 | X=787,5…816; Y=0…75 |
| STM — основная лестница | Y=100…175 | Y=105…175 |
| HE — нижний правый холл | Y=100…175 | Y=105…175 |
| Вахта S14 + STES | Y=100…175; внутренний стык 137 | Y=105…175; внутренний стык 140 |
| Правый блок STEN + N10 | Y=0…75; внутренний стык 38 | Y=0…75; внутренний стык 37,5 |
| Западный вложенный лифт | X=210…234, Y=127…153 | Квадрат 35×35: X=199…234, Y=122,5…157,5 |
| Подпись и выделение вахты | Отдельные константы | Вычисляются из общего enclosure; центр (965;140) |

Изменены 10 из 34 отображаемых прямоугольников. Аудитории, два WC, западная лестница и остальные холлы уже были в нужных полосах. Orange Cafe сохраняет Y=0…75 и центр (873;37,5). Идентичности и исходные координаты не менялись.

## 6. Пояснение до / после

На верхнем правом снимке низ лифтов теперь совпадает с низом 102, Orange Cafe и правого нейтрального блока. На нижнем правом снимке верх основной лестницы и вахты совпадает с верхом 101 и остальных нижних блоков. Выделение вахты охватывает весь общий блок, её единственная подпись центрирована по этому контуру.

WC на паре снимков совпадают: их диапазон Y=105…175 уже был правильным. Номера не дублируются; показаны ровно 15 номеров аудиторий, два WC, одна подпись кафе и одна подпись вахты. Технические ID не добавлены.

## 7. Файлы этой доработки

Изменены относительно завершённой UI-01:

- [schematic-layout.js](C:/Users/user/Documents/fcim-indoor-map/schematic-layout.js) — rails, полосы, внутренние ячейки, enclosures.
- [index.html](C:/Users/user/Documents/fcim-indoor-map/index.html) — только два места F1: центр подписи и контур вахты.
- [tests/ui01-data.cjs](C:/Users/user/Documents/fcim-indoor-map/tests/ui01-data.cjs) — прежняя проверка лифтов проверяет новые точные размеры; квадратность и смежность сохранены.
- [tests/ui01-browser.cjs](C:/Users/user/Documents/fcim-indoor-map/tests/ui01-browser.cjs) — проверка внутренних швов через rails и кадр расширенного лифтового блока.
- [tests/ui01-contract.cjs](C:/Users/user/Documents/fcim-indoor-map/tests/ui01-contract.cjs) — точное обратное восстановление FIX-A перед прежним UI-01 gate.

Добавлены:

- [tests/ui01-fix-a-contract.cjs](C:/Users/user/Documents/fcim-indoor-map/tests/ui01-fix-a-contract.cjs) — строгий allowlist и реконструкция 57 файлов локального baseline.
- [tests/ui01-fix-a-data.cjs](C:/Users/user/Documents/fcim-indoor-map/tests/ui01-fix-a-data.cjs) — 14 новых проверок геометрии, сетки и сохранности.
- [tests/ui01-fix-a-browser.cjs](C:/Users/user/Documents/fcim-indoor-map/tests/ui01-fix-a-browser.cjs) — 14 новых браузерных проверок и снимки.
- [UI-01-FIX-A_CHANGES.json](C:/Users/user/Documents/fcim-indoor-map/UI-01-FIX-A_CHANGES.json) — исходные SHA-256, окончания строк, 10 обратимых hunks и хэши итоговых программных файлов.
- [UI-01-FIX-A_REPORT.md](C:/Users/user/Documents/fcim-indoor-map/UI-01-FIX-A_REPORT.md) — этот отчёт.

52 остальных файла baseline совпадают непосредственно. UI-01_REPORT.md и UI-01_CHANGES.json не переписаны; новых изменений README.md в FIX-A нет. Снимки, runner, журналы и галерея находятся вне репозитория: `C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A`.

## 8. Сохранность ID, mappings и source geometry

Все **222 стабильных ID** сохранены: 28 F1 и 194 на этажах 2–7. Все **15/15 mappings** 101–115 разрешаются прежним каталогом. Составные 101, 103 и 106 выделяют полные наборы компонентов; отсутствие перегородки у 101 и сохранённые перегородки 103/106 проверены. Display-слой не назначает идентичности.

Защищённые файлы непосредственно совпадают с baseline:

| Файл | SHA-256 |
|---|---|
| [map-data.js](C:/Users/user/Documents/fcim-indoor-map/map-data.js) | `50a004532a920f1ae6336a871f04c860ad162de876221b2346bcf606b9d77193` |
| [room-identification.js](C:/Users/user/Documents/fcim-indoor-map/room-identification.js) | `f3c05bb5772b05d2e1bead774d6d809598d2b367d6dd6f202fe23af7a2d9b8a9` |
| [map-semantics.js](C:/Users/user/Documents/fcim-indoor-map/map-semantics.js) | `ac9f112e858df48fc52cf8d24c2b73f18dc45f937dab8618f040ae4fcedb5abb` |
| [room-contract.js](C:/Users/user/Documents/fcim-indoor-map/room-contract.js) | `762a5370520dad858b9911cea2dc358f94fc205488926d2fa3475793cca7a6a6` |
| [schedule-engine.js](C:/Users/user/Documents/fcim-indoor-map/schedule-engine.js) | `5a9844201990925f42b6c97bd0c831386857f4352dedd669b430807a79865eb4` |
| [schedule-fixture.js](C:/Users/user/Documents/fcim-indoor-map/schedule-fixture.js) | `6e6cc46215f6e51e638240481c711f5013544bc460faa048d30134b6ee410323` |

5 изменённых файлов baseline восстанавливаются точными обратными hunks и исходными окончаниями строк. Затем прежний UI-01 gate проверяет неизменный исторический Git-источник; цепочка ROOM/GEO/FIX сохранена. Негативные проверки отклоняют произвольные изменения содержимого, лишнюю строку и изменения защищённых данных. Исторические assertions не удалены и не ослаблены.

Schedule, хранение, import/export, parser/resolver и ручные записи не изменены. Двери скрыты; S07/N10/STEN не доступны как публичные аудитории. Сообщённый статус западного лифта и `unknown` остальных сохранены без подтверждения эксплуатации.

## 9. Результаты регрессии

Chrome 154.0.8037.98, headless; изолированные профили и хранилища. Мобильные проверки — эмуляция viewport/touch. Node.js v22.23.1.

| Активный набор | PASS | FAIL |
|---|---:|---:|
| fix01 | 54 | 0 |
| map01-data | 41 | 0 |
| map01-browser | 36 | 0 |
| map01-preserve | 10 | 0 |
| geo01-data | 11 | 0 |
| geo01-browser | 9 | 0 |
| geo01-fix-b-data | 12 | 0 |
| geo01-fix-b-browser | 6 | 0 |
| geo02-data | 12 | 0 |
| geo02-browser | 12 | 0 |
| room01-data | 15 | 0 |
| room01-browser | 17 | 0 |
| room01b-data | 21 | 0 |
| room01b-browser | 21 | 0 |
| room01c-data | 13 | 0 |
| room01c-browser | 12 | 0 |
| ui01-data | 19 | 0 |
| ui01-browser | 18 | 0 |
| ui01-fix-a-data | 14 | 0 |
| ui01-fix-a-browser | 14 | 0 |
| **Всего** | **367** | **0** |

Полный финальный запуск: [verified-suites.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/verified-suites.json); рядом находятся `verified-<name>.log` и JSON/каталоги результатов. Новые результаты: [verified-ui01-fix-a-data.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/verified-ui01-fix-a-data.json), [browser-results.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/verified-ui01-fix-a-browser/browser-results.json).

Первый прогон обнаружил несовместимый текст сообщения gate с историческим негативным тестом. Исправлена только формулировка диагностики; исторический тест оставлен прежним. После этого повторно выполнены все 20 наборов. Таблица относится к последнему полному запуску; первичный журнал сохранён в `final-suites.json`.

Дополнительно выполнены 4 мобильных сценария чтения после трёх нажатий «+»: кафе, вахта, WC и 102. Экранная высота текста 30…37 px; подписи целиком внутри viewport. Эти дополнительные сценарии не включены в сумму 367. Доказательство: [mobile-label-evidence.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/mobile-label-evidence.json) и `mobile-zoom-*.png`.

На каждом из этажей 2–7 RGBA PNG 2080×440 совпали с завершённой локальной UI-01: **0 изменённых пикселей**. Также совпадают исходные контуры, полигоны и сеть стен. В новых браузерных проверках **0 JS/console errors**.

Полный запуск для воспроизведения:

```powershell
& 'C:\Users\user\AppData\Local\hermes\node\node.exe' 'C:\Users\user\.codex\visualizations\2026\10\09\01a1213c-746b-70c0-bd48-c199f4861af2\UI-01-FIX-A\run-suites.cjs' 'C:\Users\user\Documents\fcim-indoor-map' verified
```

Runner использует существующие сохранённые baseline предыдущих GEO/ROOM проверок; абсолютные пути записаны в нём. Дополнительный мобильный сценарий: `mobile-label-evidence.cjs` в каталоге доказательств, с корнем репозитория первым аргументом.

## 10. Скриншоты

[Галерея до / после](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/gallery.html).

| Область | До FIX-A | После FIX-A |
|---|---|---|
| Первый этаж целиком | [До](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/verified-ui01-fix-a-browser/before-floor1.png) | [После](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/verified-ui01-fix-a-browser/after-floor1.png) |
| 102 / лифты / Orange Cafe / правый блок | [До](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/verified-ui01-fix-a-browser/before-top-right.png) | [После](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/verified-ui01-fix-a-browser/after-top-right.png) |
| Лестница / холл / Вахта | [До](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/verified-ui01-fix-a-browser/before-bottom-right.png) | [После](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/verified-ui01-fix-a-browser/after-bottom-right.png) |
| WC и соседние аудитории | [До](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/verified-ui01-fix-a-browser/before-wc.png) | [После](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/verified-ui01-fix-a-browser/after-wc.png) |
| Mobile overview 390×844 | [До](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/verified-ui01-fix-a-browser/before-390x844-overview.png) | [После](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/verified-ui01-fix-a-browser/after-390x844-overview.png) |
| Полный desktop UI 1440×900 | [До](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/verified-ui01-fix-a-browser/before-1440x900-overview.png) | [После](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/verified-ui01-fix-a-browser/after-1440x900-overview.png) |

«До» — завершённая локальная UI-01 перед FIX-A. Крупные планы и общий план экспортированы из фактически отрисованного SVG; desktop/mobile overview — снимки интерфейса. SVG сохранены рядом с PNG. Обязательные пары просмотрены визуально после финального запуска.

Для этажей 2–7 сохранены `before-floorN.png` и `after-floorN.png` в `C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/verified-ui01-fix-a-browser`. Дополнительные мобильные крупные планы: [Cafe](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/mobile-zoom-cafe.png), [Вахта](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/mobile-zoom-reception.png), [WC](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/mobile-zoom-wc.png), [102](C:/Users/user/.codex/visualizations/2026/10/09/01a1213c-746b-70c0-bd48-c199f4861af2/UI-01-FIX-A/mobile-zoom-102.png).

## 11. Ограничения

Сетка — схема в условных единицах без масштаба и физической точности. Более крупные лифтовые квадраты и укороченные нижние блоки относятся только к отображению. Source geometry не подгоняется под схему.

В полном мобильном обзоре номера малы; для чтения предусмотрен существующий зум. Чтение проверено после увеличения; реальный телефон отдельно не проверялся. Проверки не подтверждают текущую доступность помещений, работу лифтов, физическую навигацию, реальное расписание или эксплуатационную приёмку здания. Подвал D остаётся в прежнем запланированном состоянии.

## 12. Рекомендация по merge

Локально доработка готова к рассмотрению. Она зависит от незакоммиченной UI-01 и должна переноситься вместе с этой базой либо после неё. Перед ручным merge следует просмотреть галерею и ограниченный diff относительно завершённой UI-01. Коммит, push, PR, merge и публикация не выполнялись.
