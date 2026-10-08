# GEO-02 — реконструкция и интеграция первого этажа

Дата: 09.10.2026, Europe/Chisinau. Локальная работа без публикации.

## 1. Итоговый вердикт

**ACCEPT WITH LIMITATIONS.** Первый этаж независимо снят с собственного фото и интегрирован в standalone SVG-приложение. Добавлены **28 пространств: 24 отсека неизвестного назначения и 4 холла/тамбура**. Всего **222**, прежние 194 и все этажи 2–7 сохранены структурно целиком. Подвал D pending. Новых реальных номеров и занятий нет.

Это узнаваемая академическая схема, а не архитектурный обмер, физическая навигация или аттестованный эвакуационный план. Пять малых отсеков и южный тамбур имеют low confidence. Их назначение и точные разрывы стен требуют осмотра. GEO-001 на F2 **не исправлен**. Финальные suite results: **203 PASS**; по каждой suite см. §10, физическая квалификация этим не подтверждается.

## 2. Происхождение источника и baseline

Фактический файл: **floor1.jpg**, [оригинал](<C:/Users/user/Downloads/Telegram Desktop/floor1.jpg>), **2560×1710**. SHA-256: `fa2e31d1d0fc14f554bddfef8a6226425e1f6d780f28689a7882beb646dbd5b9`. Приватная побайтовая копия: `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/sources/floor1.jpg`. Заголовки **«etajul 1»** и **«Blocul de studii nr.3»** целиком читаются; назначение этажа не выведено из сходства. Identity confidence high, геометрия medium.

Весь план, оба торца, северная выемка и южный выступ в кадре. Имеются небольшой наклон, перспектива и толстые линии; стрелки и красные пожарные знаки закрывают отдельные стеновые/дверные участки. Целого скрытого отсека не обнаружено. Направления N/S/W/E условные по рисунку; реальная географическая ориентация и масштаб UNKNOWN. JPEG не редактировался; геометрия верхних этажей не использовалась для построения F1.

Начальная ветка `codex/geo-01-fix-b`, точный HEAD `53e0d069f846dacca6a7be24442e5120ba49a6f7`; FIX-A присутствует в этом коммите. После `git fetch origin` local main **ahead 1 / behind 0** относительно origin/main (`8636c4aa6c0f49a4b5a49bdfa04e656634e93db5`). Remote не заменял локальную базу. Отслеживаемые файлы до работы чистые; существовали шесть untracked файлов: `GEO-01_REPORT.md`, `GEO-01_FINDINGS.json`, `GEO-01-FIX-B_REPORT.md`, `GEO-01-FIX-B_CHANGES.json`, `tests/geo01-fix-b-data.cjs`, `tests/geo01-fix-b-browser.cjs`. Всё сохранено в приватном `baseline/`; отчёты и findings оставлены побайтово. Два FIX-B теста адаптированы по явной allowlist.

Ветка работы **codex/geo-02-first-floor**, HEAD без новых коммитов. Точные начальные source hashes всех 26 файлов, включая tests/untracked evidence, также закреплены в `GEO-02_CHANGES.json`:

| Файл baseline | SHA-256 исходных working-tree bytes |
|---|---|
| FIX-01_REPORT.md | `882d8d9d9ce99193430e838e397f4b04dde65db4fa1991c32145f2e855c2648f` |
| GEO-01-FIX-A_REPORT.md | `40af402dd6161fe6b133fc9c1b7dc3d64ad7afc8800636f1750fe95c0b07f801` |
| GEO-01-FIX-B_CHANGES.json | `8018febdfe54905079e2f5ae7a44fc3de900e968773a4c98751732766a202ae9` |
| GEO-01-FIX-B_REPORT.md | `5783da6e4be119390c6e53423764e89b8b45db073c6110f6decec6144516853e` |
| GEO-01_FINDINGS.json | `1ccf4c56ac1adbef5dfc97a13f558b0ad8b96571e5304d29f1d6a870e9e968c1` |
| GEO-01_REPORT.md | `4fc5bba81ec6893017e1a38a9fe97780d82a43480f7d2bdddca338f6b87254bf` |
| index.html | `c91338d75b514dd6257d533a284ca4e806a9942afc9c72f904ea51ef65834614` |
| MAP-01_REPORT.md | `3a0212e39cdb54ef1b5206b251d31dc9f0b4d8648ea807cb9d5a770ae5d48387` |
| map-data.js | `61083b778dd7fe5ee891357b845efe8c69b3841b3152906ca8d345c24e40983d` |
| map-semantics.js | `4659d314cdfc943db2e0760708737f4cf8dc995156ea38844b7428b99f6d84a1` |
| README.md | `0a0611aae859794c4a3a95e2e1218fcb19de1240cb367da090bb8d62568e3cf6` |
| room-contract.js | `964bf15c918e9f62a0b121f520c2a5f01c0e52ff964f00b892abbf652875575d` |
| schedule-engine.js | `e2bf53f16d93aed906c3e545ce69c6ead09d22dd343bc1b40cae8e686998696f` |
| schedule-fixture.js | `6e6cc46215f6e51e638240481c711f5013544bc460faa048d30134b6ee410323` |
| TIMETABLE_CONTRACT.md | `36dd3f97b80dddfa0f749cacf79b60e7731d66fbe11cfb17ec8fd45e0762fd47` |
| tests/fix01.cjs | `1c71e498cceb695750dcf175de930fce51ce8ced9fb6ed41b7f1b0ef1474df90` |
| tests/geo01-browser.cjs | `073c097211d3143377a8bdf2ab52e50c085ff2a5384c5566bb678a57fc95bdac` |
| tests/geo01-changes.json | `34c5302ecc4ba62aeccc190360a35b1cde815ff2d46d2497b8708ede97ad6bf2` |
| tests/geo01-contract.cjs | `d1fd382ad47198ac8920f54f135872b61eee5960631a4d7ba295960ff4bf54df` |
| tests/geo01-data.cjs | `d0618350f5dc141993fad58436fffeca5d46aac66f7a4d80113a62daab36b879` |
| tests/geo01-fix-b-browser.cjs | `925648eff1afd943f675f88e0bdbe9cff42a03547a6f4f70c07bea5df54f0f98` |
| tests/geo01-fix-b-data.cjs | `15e460f7423a2fcf8d866e089747f6385b29231756b4c39d003fd0a98df30e91` |
| tests/map01-browser.cjs | `690e33b3c9bb6e23dc42eca4e05a361b5ab5c7fe8ace2fe59e58cbb7ba71a1c4` |
| tests/map01-data.cjs | `6538c96b010989e1ff4db2001ac6e09b2fce73f424216e1e485cf50242f51a13` |
| tests/map01-preserve.cjs | `c093878f3725c5d8fb0795ef96d37888716c8da94854f155c69e69f281f2ef29` |
| tests/preserve-map.cjs | `cb9563e29bedf5033ed4596518b943fe2e8425597c43ca15570c9c8785ab4812` |

## 3. Независимый фотографический анализ

До записи полигонов просмотрены оригинал, crop и rectified/detail views; предварительный инвентарь сохранён в `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/preliminary-inventory.json`. Отдельно различены чёрные стены и разрывы, ступени, X-квадраты, зелёные эвакуационные стрелки, EXIT, красные знаки оборудования и «вы здесь». Аннотации не стали архитектурными стенами/помещениями.

Север: три широких отсека; узкий отсек с выемкой фасада; два малых отсека с разрывом внутренней перегородки; широкий отсек с местным лестничным уступом; узкий отсек перед шахтами; открытый холл рядом с двумя X-квадратами; большой восточный отсек и малая ячейка между северными ступенями и коридором. Южнее коридора: два западных отсека, лестница с X-квадратом и отдельный открытый холл, три отсека, блок из трёх малых/нерегулярных ячеек, узкий южный выступ/тамбур со ступенями рядом, четыре узких отсека (виден внутренний разрыв перегородки), большой отсек, центрально-восточная лестница, широкий открытый восточный холл, малая восточная ячейка и южные восточные ступени.

Поддерживаются 24 room-компартмента, **не 24 доказанные аудитории**. В малом южном блоке S06/S08 сохранены угловые формы вокруг коротких перегородок; S07 неглубокий. Эти ограждения читаются хуже, поэтому confidence low и геометрия локально условная. Функции не назначены; WC-подписи нет. Никакого predetermined upper-floor room count не применялось.

## 4. Регистрация и проверки

`register.py`: NumPy решает 8 параметров H по четырём внешним углам средней линии стены, Pillow создаёт crop и projective rectification. Полный оригинал сохранён. Нативные пиксельные опоры:

```json
[[308.643006263048, 416.86847599164923], [2300.793319415449, 392.81837160751564], [2295.4488517745303, 744.2171189979123], [317.99582463465555, 752.2338204592902]]
```

Они переводятся в `(0,0),(1000,0),(1000,175),(0,175)`. **Отношение 1000:175 задано для схематического canvas; это не измеренное отношение физических размеров.** Южная часть до Y192 сохранена. Шахты, лестницы, notch и внутренние перегородки в fit не участвовали; piecewise normalization по F2 отсутствует. H, raster transform и source hash сохранены в `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/registration.json`; сама регистрация записана в `floor.source`.

Шесть вручную выбранных held-outs исключены из fit; после регистрации сопоставлены с trace. Это проверка по тому же фото, не слепой тест и не независимый натурный обмер. H не оптимизировалась по ним:

| Held-out | Фото после H | Модель | Residual, условные единицы |
|---|---|---|---:|
| west-south-partition-foot | [64.23, 173.86] | [62, 175] | 2.51 |
| west-shaft-nw | [205.6, 129.3] | [210, 127] | 4.97 |
| north-notch-left | [486.46, 1.05] | [483, 0] | 3.61 |
| shaft1-nw | [755.24, 13.66] | [753, 10] | 4.29 |
| central-stair-ne | [812.04, 99.37] | [815, 100] | 3.03 |
| east-north-cell-junction | [928.5, 38.27] | [930, 38] | 1.53 |

Mean held-out residual **3.32**, max **4.97**. Для десяти крупных северных перегородок mean absolute X residual **1.08**, max **1.76**. Ширины первых трёх северных отсеков по фото: 155.16, 153.01, 154.28; модель 154/153/154. Отношения к N02: фото **1.014/1.000/1.008**, модель **1.007/1.000/1.007**. Эти три похожие ширины наблюдаются на источнике; остальные комнаты не приведены к ним.

Глубина коридора / условная глубина фасада: запад фото **0.181**, модель **0.171**; восток фото **0.199**, модель **0.189**. Небольшое отличие связано с толщиной линий, ручным выбором и сглаживанием длинных стен. Нельзя выдавать эти числа за метрическую точность.

Sensitivity: **256** детерминированных угловых сценариев, каждый coordinate fit corner ±3 нативных пикселя. Максимальное смещение held-out **10.29** условных единиц. Это показывает чувствительность длинного узкого плана к выбору углов, а не заявляет accuracy percentage или доверительный интервал здания. Ни один sensitivity fit не выбран для уменьшения residual. Подробные значения и код: `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/photographic-validation.json`, `validate-photo.py`.

## 5. Инвентарь новых пространств

Стабильный порядок: N01–N10 с запада на восток северной стороны, S01–S14 с запада на восток южной стороны; затем HW/LH/HC/HE. ID — только модельные идентификаторы. Для каждого `roomNumber: null`, source `floor1.jpg`, verification `observed` = наблюдение на фото, а не проверка в здании. Pixel bbox получен обратной H и обозначает ориентировочную область исходника. Дополнительные source bounds и notes находятся в модели; компактный инвентарь без копии полигонов — `GEO-02_SPACES.json`.

| ID | Kind | Model bounds [x0,y0,x1,y1] | Source region, native pixels | Confidence | Геометрия | Дверная evidence | Функция/вопросы |
|---|---|---|---|---|---|---|---|
| B3-F1-N01 | room | [0, 0, 154, 75] | [309, 413, 607, 561] | medium | снята с фото | (32,75) horizontal → corridor; medium; (112,75) horizontal → corridor; medium | Назначение и номер неизвестны. |
| B3-F1-N02 | room | [154, 0, 307, 75] | [604, 410, 903, 559] | medium | снята с фото | (170,75) horizontal → corridor; medium; (265,75) horizontal → corridor; medium | Назначение и номер неизвестны. |
| B3-F1-N03 | room | [307, 0, 461, 75] | [901, 406, 1205, 556] | medium | снята с фото | (333,75) horizontal → corridor; medium; (418,75) horizontal → corridor; medium | Назначение и номер неизвестны. |
| B3-F1-N04 | room | [461, 0, 510, 75] | [1204, 405, 1302, 553] | medium | снята с фото | (480,75) horizontal → corridor; medium | Назначение и номер неизвестны. |
| B3-F1-N05 | room | [510, 0, 540, 75] | [1301, 404, 1362, 553] | medium | снята с фото | (540,57) vertical → B3-F1-N06; medium | Назначение и номер неизвестны. |
| B3-F1-N06 | room | [540, 0, 570, 75] | [1361, 403, 1422, 552] | medium | снята с фото | (550,75) horizontal → corridor; medium | Назначение и номер неизвестны. |
| B3-F1-N07 | room | [570, 0, 720, 75] | [1421, 400, 1724, 552] | medium | снята с фото | (700,75) horizontal → corridor; medium | Назначение и номер неизвестны. |
| B3-F1-N08 | room | [720, 0, 750, 75] | [1724, 399, 1785, 549] | medium | снята с фото | (734,75) horizontal → corridor; medium | Назначение и номер неизвестны. |
| B3-F1-N09 | room | [816, 0, 930, 67] | [1919, 395, 2155, 531] | medium | снята с фото | (851,67) horizontal → corridor; medium | Назначение и номер неизвестны. |
| B3-F1-N10 | room | [930, 38, 1000, 67] | [2154, 470, 2300, 529] | low | локально условная | (946,67) horizontal → corridor; low | Пожарные пиктограммы закрывают часть нижней стены; функция неизвестна. |
| B3-F1-S01 | room | [0, 105, 62, 175] | [314, 618, 435, 752] | medium | снята с фото | (44,105) horizontal → corridor; medium | Назначение и номер неизвестны. |
| B3-F1-S02 | room | [62, 105, 186, 175] | [432, 616, 672, 752] | medium | снята с фото | (116,105) horizontal → corridor; medium | Назначение и номер неизвестны. |
| B3-F1-S03 | room | [307, 105, 340, 175] | [904, 614, 970, 750] | medium | снята с фото | (328,105) horizontal → corridor; medium | Назначение и номер неизвестны. |
| B3-F1-S04 | room | [340, 105, 368, 175] | [968, 614, 1025, 750] | medium | снята с фото | (351,105) horizontal → corridor; medium | Назначение и номер неизвестны. |
| B3-F1-S05 | room | [368, 105, 427, 175] | [1023, 613, 1140, 749] | medium | снята с фото | (391,105) horizontal → corridor; medium | Назначение и номер неизвестны. |
| B3-F1-S06 | room | [427, 105, 459, 175] | [1139, 612, 1203, 749] | low | локально условная | (434,105) horizontal → corridor; low | Наблюдаемый боковой отсек с верхней нишей. Концы коротких стен и проёмы частично закрыты стрелками. Функция неизвестна; не WC. |
| B3-F1-S07 | room | [440, 105, 472, 133] | [1164, 612, 1228, 667] | low | локально условная | (449,105) horizontal → corridor; low; (465,105) horizontal → corridor; low | Мелкий средний отсек; короткие перегородки видны, функция неизвестна; не WC. |
| B3-F1-S08 | room | [459, 105, 490, 175] | [1202, 612, 1264, 749] | low | локально условная | (480,105) horizontal → corridor; low | Второй боковой отсек с верхней нишей; назначение и доступ неизвестны. |
| B3-F1-S09 | room | [511, 105, 540, 175] | [1305, 611, 1363, 748] | medium | снята с фото | (524,105) horizontal → corridor; medium | Назначение и номер неизвестны. |
| B3-F1-S10 | room | [540, 105, 570, 175] | [1362, 611, 1423, 748] | medium | снята с фото | (550,105) horizontal → corridor; medium | Назначение и номер неизвестны. |
| B3-F1-S11 | room | [570, 105, 600, 175] | [1422, 610, 1482, 748] | medium | снята с фото | (581,105) horizontal → corridor; medium; (600,156) vertical → B3-F1-S12; medium | Назначение и номер неизвестны. |
| B3-F1-S12 | room | [600, 105, 631, 175] | [1482, 610, 1544, 748] | medium | снята с фото | Открытый холл; отдельная дверь не назначена | Назначение и номер неизвестны. |
| B3-F1-S13 | room | [631, 105, 750, 175] | [1544, 608, 1784, 747] | medium | снята с фото | (657,105) horizontal → corridor; medium | Назначение и номер неизвестны. |
| B3-F1-S14 | room | [930, 100, 1000, 137] | [2152, 594, 2298, 669] | low | локально условная | (946,100) horizontal → corridor; low | Часть стены закрыта пожарным знаком; функция неизвестна. |
| B3-F1-HW | hall | [247, 105, 307, 175] | [787, 614, 906, 750] | medium | снята с фото | Открытый холл; отдельная дверь не назначена | Назначение и номер неизвестны. |
| B3-F1-LH | hall | [750, 0, 816, 75] | [1785, 397, 1920, 549] | medium | снята с фото | Открытый холл; отдельная дверь не назначена | Назначение и номер неизвестны. |
| B3-F1-HC | hall | [490, 105, 511, 192] | [1263, 611, 1306, 781] | low | локально условная | Открытый холл; отдельная дверь не назначена | Южный выступ/тамбур со ступенями рядом. Это не подтверждённый вход. |
| B3-F1-HE | hall | [815, 100, 930, 175] | [1916, 595, 2153, 746] | medium | снята с фото | Открытый холл; отдельная дверь не назначена | Назначение и номер неизвестны. |

## 6. Конструктивные элементы

**Коридор:** одна непрерывная нерегулярная область, западная полоса Y75–105, восточная Y67–100, локальные уступы у малых ступеней. Модель не проводит прямоугольный коридор через комнаты. Открытые HW/LH/HE выделены своими polygons; HC — отдельный южный тамбур. `corridorBand` для F1 отсутствует.

**Лестницы:** STW X186–247/Y105–175, STM X750–815/Y100–175, STEN X930–1000/Y0–38, STES X930–1000/Y137–175. В `stairDrawing` отдельно заданы видимые полосы маршей, площадки и ось штриховки. Это рисунки без elevation graph connections. Наружные южные ступени X459–490/Y175–192 и два малых знака NORTH-STEPS/MID-STEPS — features с неизвестным перепадом/назначением. Выбор лестниц не расширен на соседние комнаты; artwork pointer-events none.

**Шахтоподобные символы:** SH1/SH2 рядом с LH и квадрат внутри STW. Их geometry evidence observed, identity/operation/access unknown. Новые SH1/SH2 имеют `type: "shaft"`, а не доказанную идентификацию рабочего лифта. Ограждение двух северных символов — отдельная wallLine, без выдуманного room ID.

**Проёмы/входы:** OPEN-W/OPEN-E наблюдаемые торцевые разрывы; OPEN-S возможный южный вход по стенам выступа/ступеням. Ни один не назван главным или публичным. Остальные opening features отражают лестничные боковые разрывы и не создают связность. Все 28 door references лежат на общих границах, `connectionVerification: unverified`, `access: unknown`. Стрелка не является доказательством двери; координаты/ширины маленьких разрывов приблизительны. Три боковые отметки возле южного тамбура не объявлены дверями: нельзя надёжно отличить разрыв от короткого стенового выступа; отдельные door IDs/targets для них отсутствуют.

**Возможные facilities:** подтверждённых WC нет. Малые комнаты `type: unknown`; service/toilet по размеру не присваивается. `B3-ENTRANCES-UNKNOWN` сохранён, но его текст отражает нанесённые проёмы и отсутствие подтверждённых входов. Шесть low spaces: B3-F1-N10, B3-F1-S06, B3-F1-S07, B3-F1-S08, B3-F1-S14, B3-F1-HC. Целого отсутствующего или скрытого отсека не обнаружено; это не доказательство читаемости каждой двери.

## 7. Сравнение с верхними этажами и GEO-001

Исследованы отдельно зарегистрированные фотографии F2–F7 предыдущего аудита, повторно прочитанные из приватного GEO-01 каталога. Их artifact hashes записаны в `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/cross-floor-artifact-provenance.json`. Составное source comparison сохраняет независимую exterior registration каждой фотографии, без принудительного internal anchor fit.

F1 непосредственно показывает те же общие ориентиры, которые поддерживаются фото 3–6: западная лестница/квадрат, коридор, северная выемка, северные X-квадраты и центрально-восточная лестница. На F7 отсутствуют северные X-квадраты, западный рисунок иной; FIX-A рисунок оставлен целиком. Северные широкие отсеки F1 отличаются от мелкого разбиения F3–7. Южный выступ и две восточные лестничные зоны F1 не заменены upper-floor прямоугольником.

| Ориентир | Независимый F1 trace X | Историческая schematic модель F3–7 X |
|---|---|---|
| Западная лестница | 186–247 | 183–243 |
| Северная выемка | 483–510 | 479–504 |
| Центрально-восточная лестница | 750–815 | 746–806 |
| Северные шахтоподобные символы | 753–776 | примерно 750–777.5, только F3–6 |

При независимой наружной регистрации F2 заметно смещает внутренние опоры относительно F3–7. Возможные решения «следовать exterior-photo X» и «совместить старые anchors» конкурируют; для F1 выбрана собственная фото-регистрация, **без движения внутренних опор ради вертикального совпадения**. Различия нескольких условных единиц на F1 и более крупный конфликт F2 остаются evidence-qualified. Schematic близость не доказывает физическую общую ось. GEO-001 unresolved; весь F2 и FIX-A F3/F7 сохранены.

## 8. Изменения кода и схемы

Изменены:

- `map-data.js`: один F1, pending entry убран, basement сохранён, additive `geometryRevision`, source hash/registration/regions, 28 spaces, 28 doors, 6 selectable structural symbols, 10 features; F1 graph disabled/empty.
- `index.html`: fallback compass coordinates для схем без band; явная door orientation; floor-specific stairDrawing, краткие map labels W/M/E-N/E-S; wallLine/opening без перехвата выбора; evidence-qualified card names. Рендер старых floors сохраняется.
- `map-semantics.js`: наблюдаемые shaft/opening features с неизвестными identity/operation/access; актуальный entrances placeholder.
- `README.md`: актуальные этажи и отдельное описание GEO-02, schema additions и совместимость storage.
- `tests/fix01.cjs`, `tests/map01-data.cjs`, `tests/map01-browser.cjs`: только прежние предположения pending F1 / 6 corridor overlays заменены новым контрактом; прежние integrity/schedule assertions сохранены.
- `tests/geo01-contract.cjs`, `tests/geo01-data.cjs`, `tests/map01-preserve.cjs`, `tests/geo01-fix-b-data.cjs`: сначала строгая GEO-02 source allowlist и полная неизменность шести floors, затем точная историческая проекция и прежние fixed-baseline assertions.
- `tests/geo01-fix-b-browser.cjs`: поиск F2 по level вместо индекса 0.

Добавлены `tests/geo02-contract.cjs`, `tests/geo02-geometry.cjs`, `tests/geo02-data.cjs`, `tests/geo02-browser.cjs`, `GEO-02_CHANGES.json`, этот report и два компактных inventory/uncertainty JSON. Никаких framework/backend, маршрутов, реального API, новых синтетических lessons или vertical links.

Авторитетные полигоны только `map-data.js`. Additive fields совместимы с существующим renderer/runtime. **`dataVersion: "2026-10-08.1"` и `schemaVersion: "1.0.0"` сохранены** как binding/import compatibility versions; геометрическая ревизия `2026-10-09.GEO-02` отделена. Это предотвращает отклонение старого валидного storage и архивных экспортов; автопереноса/перенумерации нет. В `room-contract.js`, `schedule-engine.js`, `schedule-fixture.js`, `TIMETABLE_CONTRACT.md` изменений нет. JS global/классические script-теги и file:// запуск сохранены.

## 9. Сохранность данных

Все шесть accepted floor objects deep-equal fixed commit, включая source, spaces order, polygons, labels, assignments, geometry, door IDs/targets и verification. Все прежние **194 IDs** и `floorId` сохранены. Исходные номера остаются null, confirmed/knownButUnlocated metadata неизменны. Старые **672 nodes / 714 внутриэтажных edges / 14 verticalLinks** сохранены; F1 добавляет 0/0/0. Четыре унаследованных polygon spurs остаются только точными baseline exceptions; новые touching/crossings запрещены.

`GEO-02_CHANGES.json` содержит контекстные old/new hunks только разрешённых source изменений и исходные working-tree/Git hashes. Gate обратимо снимает только эти точные hunks и сравнивает весь исходный content с immutable Git commit/хэшами local FIX-B файлов. Он не принимает новые baseline geometry snapshots вместо старых floors. Дополнительно сравниваются actual runtime SVG всех шести старых этажей: **0 изменённых пикселей** в изолированном экспорте одинакового viewport/style.

Storage старых manual records проверен на raw byte preservation при открытии F1; после новой ручной привязки старая запись проверяется deep-equal. Mixed F1/F4 export/import, перенос с подтверждением, отмена и prototype-key rejection проверены атомарно. Демо не использует эти записи и не пишет их в production store. Тестовые 101/102/405 — искусственные записи только isolated Chrome profiles. Существующий пользовательский профиль/localStorage **не читался и не менялся**; гарантия касается совместимости и выполненной изолированной регрессии.

## 10. Выполненные проверки

До изменения production: все восемь active suites **179 PASS / 0 FAIL**, сохранены `baseline-*` results. Текущие результаты:

| Suite | Baseline PASS / FAIL | Final PASS / FAIL |
|---|---:|---:|
| fix01 | 54 / 0 | 54 / 0 |
| map01-data | 41 / 0 | 41 / 0 |
| map01-browser | 36 / 0 | 36 / 0 |
| map01-preserve | 10 / 0 | 10 / 0 |
| geo01-data | 11 / 0 | 11 / 0 |
| geo01-browser | 9 / 0 | 9 / 0 |
| geo01-fix-b-data | 12 / 0 | 12 / 0 |
| geo01-fix-b-browser | 6 / 0 | 6 / 0 |
| geo02-data | — / — | 12 / 0 |
| geo02-browser | — / — | 12 / 0 |

Команды из корня репозитория (Node v22.23.1, установленный Chrome 154.0.8037.98, bundled Playwright; зависимости не устанавливались):

```powershell
$audit = 'C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02'
$mapOriginal = 'C:/Users/user/.codex/visualizations/2026/10/08/01a11cd9-d3f1-7b23-af60-cf7e9fe00cac/fcim-map01/original'
$fixABaseline = 'C:/Users/user/.codex/visualizations/2026/10/08/01a11d33-186c-71f3-88d8-c16c59acea38/GEO-01-FIX-A/baseline'
node tests/fix01.cjs . "$audit/final-fix01.json"
node tests/map01-data.cjs "$audit/final-map01-data.json"
node tests/map01-browser.cjs "$audit/final-map01-browser" $mapOriginal
node tests/map01-preserve.cjs $mapOriginal "$audit/final-map01-preserve.json"
node tests/geo01-data.cjs "$audit/final-geo01-data.json"
node tests/geo01-browser.cjs "$audit/final-geo01-browser" $fixABaseline
node tests/geo01-fix-b-data.cjs "$audit/final-geo01-fix-b-data.json"
node tests/geo01-fix-b-browser.cjs "$audit/final-geo01-fix-b-browser" "$audit/baseline"
node tests/geo02-data.cjs "$audit/final-geo02-data.json"
node tests/geo02-browser.cjs "$audit/final-geo02-browser" "$audit/baseline"
git diff --check
```

Photo pipeline: bundled Python `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/register.py`, `validate-photo.py`. Private `run-suites.cjs baseline/final` последовательно исполняет приведённые команды, сохраняет logs/exit codes. Final MAP-01 browser был отдельно повторён после адаптации pending assertion. Исходные результаты не удалялись.

Новые geometry tests: конечные координаты, площадь, duplicates/crossings/self-touches, strict contained labels, outline containment, независимые triangle-clipping positive-area overlaps, общие границы дверей/не dangling targets, uncertainty/source fields, stair drawing containment/no collisions, resolver fail-closed, version compatibility, archived graph preservation. Проверены также сами geometric predicates на заведомо пересекающихся/касающихся фигурах и треугольном overlap.

Browser: selector/deep link F1; все семь floors; pending D; keyboard/hover/реальный pointer hit северных, южных, малых и open hall polygons; shaft cards; отсутствие bind form для halls; no fabricated F1 highlights/unmapped 3-101; F1 manual assignment/reload/search; mixed old/new transactional export/import; cancel/prototype atomicity; desktop wheel/pan/reset; actual Chrome touch/pinch/pan в **390×844, 320×740, 844×390**; actual SVG exports/скриншоты. Предыдущие FIX/MAP suites покрывают mock group/time changes, missing/outside rooms, failed storage writes и защитные сценарии.

Финальные browser page/console errors **0**; результаты машинно зафиксированы в JSON. Mobile — CDP emulation, не реальное устройство.

Диагностика, сохранённая отдельно: первая адаптация GEO preservation отклонила текущую семантику из-за ещё не снятого old source comparison; исправлено точным historicalText после проверки полной allowlist. Первый итоговый MAP-01 browser run дал 35/1: исторический тест требовал pending F1. Он заменён требованием digitized F1 при сохранении pending D, остальные 35 assertions не ослаблены. После добавления этого hunk helper обнаружил mismatch исходного текста: `String.replace` интерпретировала `$'` из регулярного выражения в replacement string. Исправлена буквальная замена callback-функцией, без исключения из hash assertions; все четыре affected data/preservation suites повторно прошли. Это не скрытые runtime exceptions. Первый private edit script не нашёл CRLF-разделитель, прервался до записи; исправлена обработка line endings. Подробности: `geo01-adapt-first.json`, `map01-browser-first-final.json`, `final-summary.json`.

Исторический `tests/preserve-map.cjs` — архивный pre-FIX-01 контракт, который требует наличия старой routing implementation; он не является active post-MAP-01 gate и оставлен без изменений. Его замена `map01-preserve.cjs` реально выполнена, включая nested FIX-A/GEO-02 gates. `geo01-contract.cjs` — helper, а не отдельная suite.

## 11. Визуальные материалы и воспроизводимость

Все фото, derived overlays, screenshots и machine-specific scripts **вне публичного репозитория**, приватный каталог `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02`:

| Материал | Точный путь |
|---|---|
| Оригинал, неизменённая копия | `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/sources/floor1.jpg` |
| Crop плана | `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/floor1-crop.png` |
| Perspective rectified | `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/floor1-rectified.png` |
| Увеличение центрального блока | `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/center-detail.png` |
| Увеличение восточного блока | `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/east-detail.png` |
| Actual production SVG | `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/final-geo02-browser/floor1.svg` |
| Actual production transparent PNG | `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/final-geo02-browser/floor1.png` |
| Transparent trace layer | `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/floor1-model-transparent.png` |
| Source overlay | `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/floor1-source-overlay.png` |
| Annotated residual/uncertainty map | `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/floor1-discrepancy-map.png` |
| F1/F2/F3–7 independent photo comparison | `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/cross-floor-photo-comparison.png` |
| Desktop overview 1440×900 | `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/final-geo02-browser/desktop-overview.png` |
| Desktop selection | `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/final-geo02-browser/desktop-selected.png` |
| Mobile 390×844 | `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/final-geo02-browser/mobile-390x844.png` |
| Mobile 320×740 | `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/final-geo02-browser/mobile-320x740.png` |
| Mobile 844×390 | `C:/Users/user/.codex/visualizations/2026/10/08/01a11d64-d8a8-7352-b793-c36492c43834/GEO-02/final-geo02-browser/mobile-844x390.png` |

`registration.json`, `photographic-validation.json`, `baseline-hashes.json`, `preliminary-inventory.json`, `floor1-trace.json`, final suite JSON/logs и artifact hashes находятся в этом же каталоге. Private trace — воспроизводимый audit artifact, не дополнительный runtime source of truth. Ни оригинальные фотографии, ни overlays в Git не добавлены. Коммит, push, PR и merge не выполнялись.

## 12. Оставшиеся неопределённости

На месте нужно проверить: таблички/номера и функции всех отсеков; окончания малых центральных перегородок и проёмы S06/S07/S08; стеновые участки N10/S14 под пожарными знаками; стены/порог южного HC и фактическую связь с наружной лестницей; идентичность и доступ W/E/S проёмов; назначение всех трёх X-квадратов и отдельно работу/доступ лифтов; устройство и межэтажную связь каждого лестничного узла; настоящие WC; физические размеры/ориентацию; причину конфликта F2. Unknown/qualification records подробно перечислены в `GEO-02_UNCERTAINTIES.json`.

Схема не выводит площадь, длину пути, время ходьбы, физическую accessibility или пригодность для эвакуации. Идентификация по наблюдаемой диаграмме не становится physical verification.

## 13. Приёмка GEO-02

Первый этаж готов к **последующей ручной привязке номеров после осмотра табличек** и к студенческой beta академической карты с текущими явными ограничениями. В beta план должен оставаться schematic с unknown identities; low-confidence cells требуют отдельной сверки до уверенного физического размещения занятий. Реальное расписание и проверенные timetable bindings остаются задачей MAP-02. GEO-02 не закрывает GEO-001 и не квалифицирует объект как средство физической навигации.

Изменения доступны локально для review на `codex/geo-02-first-floor`; публикация не выполнена.
