# MAP-02B — реальная интеграция расписания между двумя репозиториями

Дата проверки: **2026-10-09, Europe/Chisinau**.

## 1. Executive verdict

**LOCAL IMPLEMENTATION COMPLETE — DEPLOYMENT PENDING.**

Карта безопасно потребляет public JSON producer, показывает Anul I/II, real groups,
My Group/All Classes и квалифицированную подсветку F1 по опубликованному недельному
плану. Прямая browser HTTPS/HTTP архитектура реализована без нового integration
endpoint, proxy, snapshot publishing, parser rewrite или build pipeline карты.

Production public GET прочитаны; production cross-origin integration не принята:
при запросе с тестовым Origin allow-header отсутствовал. Production map origin не
выбран; deployment не разрешён и не выполнялся. Local producer был проверен с
изолированным cache, импортированным из recorded real API JSON. Это **local replay**,
а не доказательство production deployment или фактического проведения занятий.

Никаких commit, push, PR, merge, deployment, DB migration, admin refresh, нового
scraping или изменений broker/publisher не выполнялось.

## 2. Точный baseline

| Репозиторий | До задачи | HEAD | Рабочее дерево |
|---|---|---|---|
| Consumer `C:/Users/user/Documents/fcim-indoor-map` | `codex/map-02a-timetable-recon` | `e14273370cc419e5acd21b78cd2ea51a3d6d4127` | Четыре untracked MAP-02A документа; production source не изменён |
| Producer `C:/Users/user/Documents/automated-student-schedule-system` | `main` | `735b64f28e78eb1de98c36bb68ddf4dc3ecc0426` | Чистое дерево |

Созданы ровно запрошенные task branches без reset/merge. Локальный producer remote
— `barbalatv/utm-curs-i-orar-2027`; checkout UI-01-FIX-B consumer использован напрямую,
GitHub main не подменялся. Production deployed Git SHA: **UNKNOWN**.

Прочитаны `MAP-02A_REPORT.md`, `MAP-02A_API_CONTRACT.md`, `MAP-02A_DECISION_PACKET.md`
и room coverage. Их прежние blocked/recommended решения superseded только явными
D1–D7 пользователя. Все четыре документа сохранены побайтово.

Baseline повторён: producer **722 PASS**; consumer **398 PASS / 0 FAIL**, 22 suites.
Для старого strict file-list gate четыре pre-existing research additions были
изолированы через внешний baseline preload; содержимое каждого проверено hash.
App исходники в этом baseline не проецировались и не менялись.
Доказательства: [consumer-baseline.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/consumer-baseline.json), [baseline-suites.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/baseline-suites.json), [producer-baseline.log](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/producer-baseline.log).

## 3. Применённые решения пользователя

- D1: direct public JSON API; live требует HTTP(S), offline demo остаётся file://.
- D2: только необходимый CORS producer; существующие API/JSON схемы сохранены.
- D3: bare single room code обычного FCIM timetable получает Building 3;
  explicit другой корпус и сложный venue не переопределяются.
- D4: published weekly pattern с persistent qualification, без вымышленных dates/exclusions.
- D5: ровно Anul I и Anul II; course datasets и ошибки изолированы.
- D6: F1 catalog остаётся `user-confirmed`, on-site verification unknown.
- D7: producer владеет lessons/provenance/calendar config; map владеет spatial identities.

## 4. Producer changes и обоснование

`src/lib/public-cors.ts`: exact environment allowlist `SCHEDULE_MAP_ORIGINS`.
Пустой allowlist по умолчанию; wildcard, null origin, malformed URL, path/trailing
slash и credentials в entries не принимаются. `GET /api/schedule` и `/api/status`
получают wrapper, `Vary: Origin`, allow-origin только для exact match, включая
JSON errors. Нет allow-credentials. OPTIONS разрешает GET без custom headers;
unsupported/denied preflight возвращает 403. Public denied GET остаётся public
read для прежних клиентов; браузер не получает разрешение читать cross-origin body.

Остальные public и admin routes не получают CORS. `requireSchedule`, storage,
parser, source acceptance, auth и refresh logic не менялись. Новых API полей нет:
существующая metadata достаточна. Groups derive-ятся из full schedule.
Focused tests проверяют реальный экспорт handlers, selectors 1/2 и invalid forms,
CORS на errors и отсутствие его на admin response.

Configuration/runbook: `docs/map-02b-integration.md`, `.env.example`, README.
Итого producer: **4 modified + 4 added files**. Новых dependencies нет.

## 5. Consumer changes

| Модуль | Ответственность |
|---|---|
| `timetable-api.js` | Safe URL, public reads, bounded body/timeout, cancel, cache/LKG |
| `timetable-adapter.js` | External v2 validation, source-scoped events/memberships, weekly evaluation |
| `timetable-room-policy.js` | Qualified Building 3 policy поверх неизменного FIX-01 parser/resolver |
| `timetable-ui.js` | Safe text DOM, course/group/source state, failure/provenance/qualification |
| `index.html` | Небольшие guards для real vs demo, controls, controller hooks |

Старые `schedule-engine.js`, fixture, room catalog, map semantics и display geometry
не изменены. README и TIMETABLE_CONTRACT теперь описывают два разных контракта.
Fixture files в `tests/fixtures/map02b` — **test replay only**; runtime их не читает.
Переключение demo не создаёт повторных clock timers. Header отражает выбранный источник.

## 6. Архитектура и consistency

```text
Existing FCIM PDF producer
    -> /api/schedule?course=N + /api/status?course=N
    -> exact CORS / public GET / credentials omit
    -> validate course + full response + matching revision metadata
    -> external v2 source events and memberships
    -> provisional weekly evaluation + room policy
    -> safe DOM panels and original SVG classes
```

В двух ответах должны совпасть course, academic_year, semester, source_kind,
PDF URL/hash, parser version, downloaded_at и parsed_at. Candidate при mismatch
не принимается, хороший snapshot остаётся. `last_success_at` отдельно отражает
source state, не выдаётся за consistency identity. Broker snapshot/transport из
schedule metadata сохраняются, хотя status их отдельно не экспортирует.
Отдельный integration endpoint не нужен. PDF revision может меняться между GET;
проверка существующих полей предотвращает их случайное смешивание.

## 7. Courses/groups и multi-group events

Public GET capture: **2026-10-09 23:03:21 Europe/Chisinau** (20:03:21 UTC), четыре
ответа HTTP 200. Exact URL/time/hash: `tests/fixtures/map02b/capture.json`.

| Курс | Группы | Source events | Memberships | Potential mapped F1 events | Unmapped | Missing room |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 41 | 454 | 790 | 49 | 368 | 37 |
| 2 | 26 | 291 | 446 | 32 | 259 | 0 |
| Итого, course-scoped | 67 | 745 | 1236 | 81 | 627 | 37 |

Это число **исходных weekly records**, не независимо доказанных физических занятий.
Memberships сохраняются для каждого source group; All Classes передаёт aggregate
один event, показывая все группы общего урока. Разные IDs и курсы не склеиваются
по похожим subject/room/time. Event ID scoped repository+course/revision/source ID;
revision включает PDF hash/parser/downloaded/parsed timestamps. Duplicate source ID
отклоняет candidate, без last-write-wins. My Group фильтруется по выбранному курсу,
точной группе и distinguishable subgroup; anonymous half-group не получает ложной
персональной применимости. Details: [normalization-coverage.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/normalization-coverage.json).

## 8. Calendar/parity

Timezone ровно `Europe/Chisinau`. ISO weekdays 1–5, half-open times [start,end).
Producer anchor `2026-08-31` сохранён как **configured-unverified**, без claims
официального календаря. Selected civil date использует Monday week; producer
weekend look-ahead не применяется к выбранной пользователем дате.

`odd`, `even`, `both`, `unknown` различаются. Unknown parity, parser uncertainty,
anonymous `0.5 gr.` и restricted parity при invalid/non-Monday anchor остаются
видимыми в unknown panel, без confidently date-specific highlight. В текущем capture
unknown parity/parser uncertain = 0; соответствующие failure cases проверены
synthetic mutations, а не выданы за real data. Unknown academic year остаётся null.

Нет `validFrom`, `validUntil`, fictitious semester exclusions/holidays или future
look-ahead за придуманную границу семестра. V2 — самостоятельный qualified pattern,
v1 demo evaluator не ослаблен. Дата preview не доказывает проведение занятия.

## 9. Building 3 interpretation

Bare single code получает default только при распознанной regular FCIM metadata:
официальные source page и `anul_i|ii_semestrul_*.pdf` на fcim.utm.md. Source kind,
raw room и canonical code сохраняются. Explicit codes и строго complete qualifiers
`corp./corpul/building/корпус` имеют приоритет. Противоречия, multi-room strings,
off-campus/unfamiliar venue, malformed и missing room не получают guessed polygon.
Examination/unrelated filenames не наследуют default. Canonical suffix semantics
переданы старому FIX-01 parser, loose substring matching не используется.

В real capture 548 bare regular records получили canonical Building 3 identity;
81 разрешились в пользовательский F1 catalog. Explicit foreign-building behavior
проверен synthetic cases, текущие captured responses не содержат таких mapped
exceptions. Default — принятая source-specific конвенция пользователя, не field survey.

## 10. Room mapping и F1 highlight

Все 15 прежних F1 mappings используются без записи в source/store. 101 = S12+S13,
103 = S10+S11, 106 = N05+N06 подсвечиваются целиком. `user-confirmed` и
`onSiteVerification: unknown` не повышаются до verified. Catalog conflict handling
сохранён; upper-floor code 405 не угадывает polygon. Иные ручные real bindings
по-прежнему требуют прежнего verified evidence path.

Real captured records с подходящей 101 действительно присутствуют: My Group
IA-261, Monday pattern 2026-10-05 10:00, source lesson 09:45–11:15; и FAF-251,
Anul II, 13:30–15:00 pattern. Эти записи проверены в browser replay и через
**actual local producer routes**. Геометрия не подгонялась под timetable.

## 11. Unknown/unmapped behavior

Lesson остаётся в panel с subject/teacher/time/groups/raw room и qualification.
Сообщение: **«Аудитория пока не сопоставлена с картой»**. Foreign building имеет
отдельное сообщение, conflict — отдельную причину. Неизвестная применимость не
получает кнопку уверенного calendar highlight. White room не называется свободной.
No planned lesson, unavailable timetable, valid unmapped record, unknown applicability
и validated stale snapshot различаются. Real никогда не заимствует demo associations.

## 12. Cache/refresh/failure policy

Cache per course в памяти: 5 минут; это срок повторной проверки API, не validity
расписания. Две public requests/course объединяются при simultaneous load.
Request timeout 15 сек, JSON body limit 4 MiB/request (Content-Length и streaming
bytes), content-type/JSON/schema errors обрабатываются. URL содержит только explicit
course; credentials omit, redirects reject. Controller cancellation и поколения
защищают cache и course selection от поздних ответов.

Force refresh повторяет public GET без scraping/admin calls. Invalid response не
перезаписывает accepted dataset. При error показывается last-known-good с stale
qualification; когда good данных нет, остаётся real unavailable и явный выбор demo.
Latest validated fetch, source update/kind, course coverage, parity limitation и
revision/provenance доступны в source details. Старый снимок старше TTL отмечается
как нуждающийся в повторной API проверке. Refresh не доказывает calendar actuality.

## 13. CORS и hosting

Local tested origin: `http://127.0.0.1:8765`; actual local API: `http://127.0.0.1:3001`.
Producer env allowlist был задан ровно этому origin. Allowed GET/OPTIONS, denied
origin и direct browser fetch проверены без browser route mocks.

Production capture с этим Origin не получил Access-Control-Allow-Origin.
Production origin карты **UNKNOWN**, wildcard/null не включались. Открытие file://
выбирает offline demo; явный real сообщает необходимость HTTP(S)+allowed CORS.
Публичных proxies, JSONP, remote executable JS, browser security bypass и credentials нет.

Локальные команды для пользователя — в обоих README и producer runbook. Для local
replay использовался отдельный cache вне repositories; scheduler выключен, DB URL пуст.
Existing cold-bootstrap producer не изменён; для offline проверки нужен accepted cache,
иначе штатный producer read может ожидать штатного bootstrap.

## 14. Исполненные проверки

| Проверка | Результат |
|---|---|
| Producer baseline `npm test` | 32 files / 722 PASS |
| Producer final `npm test` | 34 files / 743 PASS |
| Producer boundary (existing smoke/multi-course + new routes/CORS) | 61 PASS |
| Producer final focused CORS/routes после исправления typing tests | 21 PASS |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run build` | exit 0 |
| `npm run test:e2e -- --project=chromium` | 4 PASS |
| Consumer baseline historical suites | 398 PASS / 0 FAIL |
| Consumer updated-app historical regressions | 398 PASS / 0 FAIL |
| `node --test tests/map02b-api.cjs tests/map02b-data.cjs` | 66 PASS / 0 FAIL |
| `node tests/map02b-browser.cjs ...` | 24 PASS / 0 FAIL |
| `node tests/map02b-local.cjs ...` | PASS direct local Next routes/browser CORS, courses 1/2 |
| `node tests/map02b-contract.cjs` | PASS strict file/byte/storage/222-ID protection |
| `git diff --check` в обоих repositories | exit 0 |

Browser: Chrome **154.0.8037.98**, headless; desktop **1440×900**, mobile
**390×844 / 320×740**, touch emulation, keyboard, composite selection, course/group,
both modes, API/CORS/network failure, partial, stale, rapid switching, XSS и live
storage preservation. Runtime errors = **0**. Positive local producer browser
console errors = **0**. Failure suite сохранил **12 expected console diagnostics**
(503/CORS/disconnected socket); они не скрыты и не выданы за zero console errors.
Real-device mobile: **UNVERIFIED**.

Первый typecheck нашёл inferred undefined в test header tables; поправлены только
явные типы таблиц. Первый browser run 20 PASS/2 FAIL: ожидание intermediate partial
state вместо завершённого 503 и favicon 404. Добавлены ожидание конечного error
state и data favicon. Финальные suites выше реально повторены; baseline failures нет.

Historical assertions/files **не редактировались**. `map02b-preload.cjs` сначала
проверяет строгий MAP-02B delta и byte hashes, затем обращает ровно manifest hunks
для historical source gates и фильтрует только перечисленные additions. Chrome при
этом открывает **актуальную изменённую карту**, включая новые scripts/controls.
Таким образом old source integrity assertions не удалены; новый allowlist отдельно
проверяет integration delta. Historical pixel checks этажей 2–7: 0 differing pixels.

22 исторических набора:

| Suite | PASS | FAIL |
|---|---:|---:|
| `fix01` | 54 | 0 |
| `map01-data` | 41 | 0 |
| `map01-browser` | 36 | 0 |
| `map01-preserve` | 10 | 0 |
| `geo01-data` | 11 | 0 |
| `geo01-browser` | 9 | 0 |
| `geo01-fix-b-data` | 12 | 0 |
| `geo01-fix-b-browser` | 6 | 0 |
| `geo02-data` | 12 | 0 |
| `geo02-browser` | 12 | 0 |
| `room01-data` | 15 | 0 |
| `room01-browser` | 17 | 0 |
| `room01b-data` | 21 | 0 |
| `room01b-browser` | 21 | 0 |
| `room01c-data` | 13 | 0 |
| `room01c-browser` | 12 | 0 |
| `ui01-data` | 19 | 0 |
| `ui01-browser` | 18 | 0 |
| `ui01-fix-a-data` | 14 | 0 |
| `ui01-fix-a-browser` | 14 | 0 |
| `ui01-fix-b-data` | 14 | 0 |
| `ui01-fix-b-browser` | 17 | 0 |
| Total | 398 | 0 |

Full evidence: [regression-suites.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/regression-suites.json), [producer-final.log](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/producer-final.log),
[producer-typecheck-final.log](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/producer-typecheck-final.log), [producer-lint.log](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/producer-lint.log), [producer-build.log](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/producer-build.log),
[producer-e2e.log](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/producer-e2e.log), [consumer-unit-final.log](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/consumer-unit-final.log),
[browser-accepted/browser-results.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/browser-results.json), [local-producer-browser/local-results.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/local-producer-browser/local-results.json).

Исторический runner: `C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/run-historical.cjs`; использует существующие
локальные Codex GEO/ROOM/UI evidence baseline directories. Они были доступны на
этой машине; это ограничение воспроизводимости на другом компьютере. Новые API
fixtures/hash/data tests находятся в repo; Playwright path можно задать env.

## 15. Before/after screenshot evidence

Все снимки — actual browser results. Badge REPLAY/LOCAL PRODUCER показывает basis.
Там, где показана real lesson, используется записанный реальный JSON, а не выдуманная
record. Synthetic unknown/error/XSS cases помечены отдельно. Source disclaimer
виден в real-mode desktop frames; mobile frames показывают scrollable controls.

| Сценарий | PNG |
|---|---|
| До MAP-02B: принятый demo UI | [browser-accepted/before-demo-desktop.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/before-demo-desktop.png) |
| Прямая связка local Next producer + HTTP map, Anul I, real API record 101 | [local-producer-browser/local-producer-course1.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/local-producer-browser/local-producer-course1.png) |
| Прямая связка local Next producer, Anul II | [local-producer-browser/local-producer-course2.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/local-producer-browser/local-producer-course2.png) |
| Real mode / Anul I / composite 101 / disclaimer, recorded API replay | [browser-accepted/replay-course1-mapped-1440.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/replay-course1-mapped-1440.png) |
| Anul II group selection | [browser-accepted/replay-course2-1440.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/replay-course2-1440.png) |
| Real lesson с unmapped room | [browser-accepted/replay-unmapped.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/replay-unmapped.png) |
| All Classes: явно оба курса | [browser-accepted/replay-all-1440.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/replay-all-1440.png) |
| Переключение 1→2→1 | [browser-accepted/replay-course-switching.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/replay-course-switching.png) |
| API 503 без accepted data | [browser-accepted/api-failure.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/api-failure.png) |
| Last-known-good после неуспешного refresh | [browser-accepted/stale-validated-snapshot.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/stale-validated-snapshot.png) |
| CORS denied | [browser-accepted/cors-denied.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/cors-denied.png) |
| Network unavailable | [browser-accepted/network-unavailable.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/network-unavailable.png) |
| Partial course coverage | [browser-accepted/partial-coverage.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/partial-coverage.png) |
| Mobile 390×844 | [browser-accepted/replay-course1-mapped-390.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/replay-course1-mapped-390.png) |
| Mobile 320×740 | [browser-accepted/replay-course1-mapped-320.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/replay-course1-mapped-320.png) |
| Mobile disclaimer / real source selection 320×740 | [browser-accepted/published-disclaimer-mobile-320.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/published-disclaimer-mobile-320.png) |
| Expandable source/provenance details | [browser-accepted/source-provenance-details.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/source-provenance-details.png) |
| Сохранённое file:// demo | [browser-accepted/file-demo-preserved.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/file-demo-preserved.png) |
| Synthetic unknown parity; подсветки нет | [browser-accepted/synthetic-unknown-parity.png](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/browser-accepted/synthetic-unknown-parity.png) |

Просмотрены desktop/mapped, fitted local producer, mobile 320×740 и основные
failure frames. Это browser viewport/touch emulation, не physical-device acceptance.

## 16. Protected source integrity

`MAP-02B_CHANGES.json` привязан к consumer HEAD e142733 и содержит baseline byte hashes
71 файлов, 17 строго перечисленных additions и reversible hunks ровно 3 файлов:
index.html (17), README (5), TIMETABLE_CONTRACT (4). **68 baseline files unchanged**,
включая четыре MAP-02A artifacts. В изменённом index FIX-01 storage/import/export
block дополнительно сравнен напрямую, без projection: exact bytes.

Сохранены 222 unique historical spatial IDs, map-data geometry, F1 display rectangles,
floors 2–7, routing graph, 15 F1 identities/provenance, FIX-01 keys/format/manual records,
transactional import/export, demo fixture/engine, search, floor navigation, zoom,
pan/touch and composite selection. Source catalog не записывается API в storage.
Live manual-store browser test проверяет raw localStorage bytes до/после real API,
course switching, All Classes и demo; verification не повышается.

Producer diff ограничен read CORS и docs/tests. Next dev автоматически создал
AGENTS.md/CLAUDE.md; точный generated-only content сохранён в evidence и удалён
после завершения server/build, поскольку этих файлов не было в initial clean tree.
Никакой user file не удалён. Protected parser/updater/broker/worker/publisher/DB/auth
файлы в task diff отсутствуют. Render/service configuration не менялась.

## 17. Remaining limitations

- Production map origin/deployment/CORS acceptance pending; deployed producer SHA UNKNOWN.
- Официальные semester dates, holidays/exams/exception dates и independent parity authority неизвестны.
- Actual attendance, physical availability и on-site room verification не доказаны.
- Только 81/745 captured source events имеют qualified F1 catalog resolution; это potential weekly coverage.
- Upper floors и ambiguous venues остаются unlocated; source parser/PDF accuracy не перепроверялась скачиванием PDF.
- Anonymous subgroup и uncertain applicability не получают уверенного highlight.
- Last-known-good хранится в памяти вкладки, без offline persistence real data.
- Real-device mobile и hosted CI/production acceptance в этой задаче не проверялись.
- Historical suites зависят от сохранённых локальных evidence directories.

Эти ограничения явно представлены и не превращены в invented authoritative facts.

## 18. Deployment prerequisites

1. Отдельно выбрать и авторизовать настоящий HTTPS origin карты.
2. После отдельного разрешения deploy только producer CORS changes; задать exact
   `SCHEDULE_MAP_ORIGINS` без wildcard/credentials. Pipeline/parser/calendar acceptance не менять.
3. Разместить статические map files вместе с четырьмя scripts; test fixtures не являются runtime source.
4. Проверить browser GET обоих курсов на выбранном origin, source revision consistency,
   actual 101 record, unmapped, partial/error states, qualification и current upstream metadata.
5. Проверить production existing timetable client; записать deployed SHA и реальные devices отдельно.

Эта задача не даёт авторизацию шагам deployment и не придумывает hostname.

## 19. Rollback

Full exact working patches, включая new files, сохранены отдельно: [producer-working.patch](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/producer-working.patch),
[consumer-working.patch](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/consumer-working.patch). Consumer patch **не включает** четыре pre-existing
MAP-02A additions. Перед rollback проверить reverse applicability; при последующих
user edits gate должен остановиться, без reset/clean.

```powershell
cd C:\Users\user\Documents\automated-student-schedule-system
git apply --reverse --check "C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/producer-working.patch"
# После проверки и явного решения выполнить тот же git apply --reverse без --check.
cd C:\Users\user\Documents\fcim-indoor-map
git apply --reverse --check "C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/consumer-working.patch"
```

Для byte-accurate local reconstruction consumer доступны reversible source hunks
и fixed hashes `MAP-02B_CHANGES.json`; удалить только additions из allowlist.
Не удалять ручной localStorage, source catalog, real accepted producer caches или
MAP-02A docs. Для future production rollback: вернуть прежний producer deployment
и убрать allowlist; вернуть прежние static map files. DB/R2 migrations не нужны.
Rollback здесь **не выполнялся**.

## 20. Exact Git status/diff

Git heads не изменились; commits/staging/publishing отсутствуют. Machine-readable
status: [git-status.json](C:/Users/user/.codex/visualizations/2026/10/09/01a1223b-65a9-7e93-a3b8-2c731b845ee2/MAP-02B/git-status.json). Full patches выше включают untracked additions.
Обычный `git diff --stat` учитывает только tracked edits:

Consumer branch `codex/map-02b-consumer-integration`, HEAD `e14273370cc419e5acd21b78cd2ea51a3d6d4127`:

```text
README.md             | 88 +++++++++++++++++++++++++++++++++++++++------
 TIMETABLE_CONTRACT.md | 98 +++++++++++++++++++++++++++++++++++++++++++++------
 index.html            | 45 +++++++++++++++++------
 3 files changed, 200 insertions(+), 31 deletions(-)
```

```text
M README.md
 M TIMETABLE_CONTRACT.md
 M index.html
?? MAP-02A_API_CONTRACT.md
?? MAP-02A_DECISION_PACKET.md
?? MAP-02A_REPORT.md
?? MAP-02A_ROOM_COVERAGE.json
?? MAP-02B_CHANGES.json
?? MAP-02B_REPORT.md
?? tests/fixtures/map02b/capture.json
?? tests/fixtures/map02b/course1-schedule.json
?? tests/fixtures/map02b/course1-status.json
?? tests/fixtures/map02b/course2-schedule.json
?? tests/fixtures/map02b/course2-status.json
?? tests/map02b-api.cjs
?? tests/map02b-browser.cjs
?? tests/map02b-contract.cjs
?? tests/map02b-data.cjs
?? tests/map02b-local.cjs
?? tests/map02b-preload.cjs
?? timetable-adapter.js
?? timetable-api.js
?? timetable-room-policy.js
?? timetable-ui.js
```

Producer branch `codex/map-02b-producer-integration`, HEAD `735b64f28e78eb1de98c36bb68ddf4dc3ecc0426`:

```text
.env.example                  | 5 +++++
 README.md                     | 5 +++++
 src/app/api/schedule/route.ts | 6 ++++--
 src/app/api/status/route.ts   | 6 ++++--
 4 files changed, 18 insertions(+), 4 deletions(-)
```

```text
M .env.example
 M README.md
 M src/app/api/schedule/route.ts
 M src/app/api/status/route.ts
?? docs/map-02b-integration.md
?? src/lib/public-cors.ts
?? tests/map-integration-routes.test.ts
?? tests/public-cors.test.ts
```

## 21. Exact follow-up tasks

Обязательных local implementation blockers нет. Remaining delivery gate — выбор
production map origin, отдельная авторизация deploy, exact CORS configuration и
production browser acceptance обоих приложений. Дополнительная независимая работа:
official calendar/parity qualification, room survey upper floors и real-device QA.
До подтверждения эти факты остаются unknown, без изменения текущего qualified weekly mode.
