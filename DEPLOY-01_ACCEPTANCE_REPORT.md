# DEPLOY-01 — PRE-DEPLOYMENT REPORT

10 октября 2026, Europe/Chisinau.
**READY FOR DEPLOYMENT — HUMAN APPROVAL REQUIRED.**
Подготовка к Gate A завершена. Production acceptance новой карты/CORS — PENDING.
Push, PR creation, GitHub merge/deploy, Render env и Pages settings не выполнялись.
Локальный consumer ancestry merge выполнен в разрешённом preparation scope.

## Deployment / Git / CI

| Система | Actual статус | URL | Source / deployed SHA |
|---|---|---|---|
| Producer production | Existing service live, до релиза | https://utm-curs-i-orar-2027.onrender.com | deployed `735b64f28e78eb1de98c36bb68ddf4dc3ecc0426` |
| Producer local | Commit, без push/PR | Новая revision не опубликована | `badad94fbf6e2a2caf87e028cda029f993eaadd8` |
| Consumer production | Публикации нет | Expected https://barbalatv.github.io/fcim-indoor-map/ — 404 | deployed SHA NOT APPLICABLE |
| Consumer local | Reconciled source/CI | Публичного map release нет | `e98ed51f5f1d763799291c91c2286cfc31397f1c`; docs отдельным commit |

Branches: `codex/map-02b-producer-integration`, `codex/map-02b-consumer-integration`.
Bases: producer `735b64f...`, consumer `9f1e6a5926ee8579f39bbf641369d0e7857f3004`.
Final publication HEAD после documentation commit находится в Gate A evidence
packet/итоговом ответе. Source/CI SHA выше фиксирует проверенный runtime.
Открытых PR обоих repos при проверке — 0; consumer Actions runs — 0.
Producer baseline hosted CI
[37865685674](https://github.com/barbalatv/utm-curs-i-orar-2027/actions/runs/37865685674)
PASS на `735b64f...`: это не CI нового head. New hosted CI/PR acceptance PENDING.

Producer: 8 файлов, 198 insertions/4 deletions; CORS existing schedule/status GET,
GET-only OPTIONS, focused tests/docs. Schemas/parser/updater/DB/auth/admin/pipeline
и lock неизменны. Consumer PR явно включает accepted UI-01/FIX-A/FIX-B, отсутствующий
в main; MAP-02A research, MAP-02B integration/tests сохранены. DEPLOY добавляет 7
CI/config/test/manifest files и 4 docs. Safe merge изменил 0 source files.
71 accepted/integration file raw hashes до/после release: 0 изменений. Сохранены
222 ID, 15 F1 identities, 7 protected JS, composites/geometry/graph/storage/demo.

## Production API и CORS, до deployment

Capture **2026-10-10 00:21:25 Europe/Chisinau**, `2026-10-09T21:21:25.557Z`.
Script public-check выполнил 11 bounded requests: 4 course reads, denied origin, invalid course, 2 public OPTIONS,
admin OPTIONS без записи, producer landing, expected Pages URL. Admin POST, PDF
scraping, source refresh и publication не выполнялись.
Отдельные read-only browser UI/CORS checks не входят в эти 11 script requests.

| Курс | schedule/status | Groups | Weekly events | Memberships | Potential mapped F1 |
|---|---|---:|---:|---:|---:|
| 1 | 200/200; full normalization PASS | 41 | 454 | 790 | 49 |
| 2 | 200/200; full normalization PASS | 26 | 291 | 446 | 32 |

Source live, parser 1.4.0, academic year 2026/2027, semesters I/III. Schedule/status
course, schema, metadata, PDF URL/hash, downloaded/parsed identity совпадают.
Это observed API, не повторный аудит PDF/parser correctness.

| Курс | PDF revision | SHA-256 |
|---|---|---|
| 1 | `2026/10/anul_i_semestrul_i-4.pdf` | `ea38a76a3800da5ee320cfd048f19af14cbfa81168c26626babcf25cca050d05` |
| 2 | `2026/10/anul_ii_semestrul_iii-1.pdf` | `d2f7bde17384ecd9a5033882f30e288aa917fe40e26964a4095a5dc5f7a8e737` |

Для expected Pages origin текущие GET 200 **без ACAO/Vary Origin**. Allowed/denied
public OPTIONS и admin OPTIONS — baseline 204 без CORS headers; это не acceptance
MAP-02B preflight. Denied-origin GET 200 без ACAO, invalid course 400.
Actual browser из LOCAL origin к production API подтвердил CORS failure, 0 groups,
без synthetic fallback. Public map origin ещё не существует.

Local producer с exact loopback allowlist прошёл direct browser CORS: оба курса,
GET/OPTIONS/denied origin, composite 101, All Classes; runtime/console errors 0.
Cache — recorded public fixtures. Test-only group-column x0/x1=0 удовлетворяют
existing producer schema, не используются как spatial bindings и не являются
upstream geometry. Это local replay, не producer pipeline/production acceptance.

API read latency 356/89/93/69 ms. Cold start не провоцировался: 15-second budget
при cold start UNKNOWN/PENDING. Timeout не увеличен. Synthetic browser harness
сокращает его до 50 ms и задерживает fixture 300 ms, проверяя cancellation/recovery;
production default остаётся 15 секунд. После deployment нужен actual cold-start check.

## Actual проверки

| Проверка | Result | Evidence boundary |
|---|---|---|
| Producer npm ci | PASS | LOCAL, lock unchanged |
| npm test | 743 PASS / 34 files | LOCAL; focused 21 включены |
| App/Worker/publisher typechecks | PASS | LOCAL |
| lint/build/Worker dry-run/publisher build | PASS | LOCAL, без remote deploy |
| Producer Chromium E2E | 4 PASS | LOCAL fixture APIs |
| Producer DB/new full hosted CI | PENDING | Локально DB не запускался; после Gate A |
| MAP-02B original protection | PASS | До DEPLOY additions и после safe merge |
| API/data | 66 PASS | LOCAL/replay/synthetic mutations |
| Portable protection+API/data | 69 PASS | LOCAL, 3+66 |
| Historical regression | 398 PASS / 0 FAIL, 22 suites | До DEPLOY-only additions, настоящие external prerequisites |
| MAP-02B browser | 24 PASS / 0 FAIL | RECORDED REPLAY / SYNTHETIC FAILURE TEST |
| Packaged project path/failure/recovery | 17 PASS / 0 FAIL | LOCAL/synthetic, desktop+mobile |
| Local producer→consumer boundary | PASS | Actual local handlers + replay cache, no route mocks |
| Existing producer UI Anul I/II | PASS | PRODUCTION LIVE before release; IA-261/FAF-251, 18/16 weekly articles |
| Current API schema/revisions | PASS | PRODUCTION LIVE before release |
| Public map/new CORS/live acceptance | PENDING | Pages нет, CORS до релиза |

**Fresh consumer clones / rollback artifact: PASS.** Два новых локальных Git clones
проверенного commit `e173d1cd9ff1357648b7975d1ba1fb6fd82fbd36`: checkout с LF и CRLF,
по 69/69 portable tests PASS. Browser из LF clone с явно заданным standalone
Playwright module: 24/24 replay и 17/17 package/failure/recovery PASS. External
Codex baseline directories для этих clone tests не используются. Это fresh local
Git clones, не GitHub-hosted/Linux CI. Final docs-only update не меняет source/CI.
Actual UI rollback source `e142733...`: 9-file artifact, standalone demo PASS,
0 runtime errors/remote requests. Operational rollback не выполнялся.
Fresh producer clone exact `badad94fbf6e2a2caf87e028cda029f993eaadd8`:
npm ci PASS, npm test 743/743 PASS (34 files). Логи в final evidence directory.
Local Node v22.23.1; Chrome 154.0.8037.98. Новый workflow предназначен для Node
22/Linux, hosted execution не заявляется. Historical source/assertions/preloads
не редактировались DEPLOY-01. Новый frozen gate не создаёт baseline directories;
old strict scope и external evidence зависимости документированы в release plan.

Replay runtime exceptions 0; 12 expected console diagnostics от injected
503/CORS/network failures. Production UI runtime exceptions 0; общий capture,
включая последующий Pages 404, содержит 2 HTTP 404 console diagnostics без
атрибуции каждого источника: zero console errors producer session не заявляется.
Desktop 1440×900, mobile 390×844/320×740, touch/keyboard/control/overflow checks PASS.
Mobile — browser emulation; physical device UNVERIFIED.

## Real map behavior

My Group обоих курсов, metadata, 1→2→1 switching, All Classes event-level dedup и
genuine simultaneous records — PASS в replay/local handlers. 101 выбирает S12+S13;
103/106 composites покрыты contracts/unit/UI. 81 potential F1 weekly records
используют прежний user-confirmed catalog; on-site verification unknown.
Counts не доказывают attendance/physical occupancy/calendar validity.

Current API имеет F1 lessons; published-map live highlight PENDING.
Current captured upper-floor record: TI-264/TI-265, Monday 09:45–11:15, raw 401,
lesson `4e9b5b0c7f4b`. Replay 2026-10-05 10:00 сохраняет subject/room, показывает
«Аудитория пока не сопоставлена с картой», 0 fabricated highlight.
Foreign building/multi-room/unknown venues не наследуют guessed polygon.
Unknown parity/subgroup не получает confident applicability. Persistent disclaimer
и configured-unverified parity сохраняются; даты/holidays/exclusions не выдуманы.

Demo работает без API из package и file://. Real/demo не смешиваются. 503, network,
CORS, timeout, invalid JSON/revision, LKG/stale, manual refresh/recovery и отсутствие
accepted data проверены synthetic/local. White room не называется свободной.

## Screenshots

Evidence: `C:/Users/user/.codex/visualizations/2026/10/10/DEPLOY-01/`.
Полный реестр новых PNG с category/hash — `screenshots.json`; Pages их не публикует.
Каждый снимок имеет одну primary category; local fixtures никогда не PRODUCTION LIVE.

| Сценарий | Evidence-relative file | Category |
|---|---|---|
| Existing producer landing | `production-browser/producer-landing.png` | PRODUCTION LIVE |
| Existing producer Anul I / II | `production-browser/producer-course1.png`, `producer-course2.png` | PRODUCTION LIVE |
| Expected public map — actual 404 | `production-browser/pages-not-published.png` | PRODUCTION LIVE; карта PENDING |
| Real mode/Anul I/F1 composite 101 | `browser-replay/replay-course1-mapped-1440.png` | RECORDED REPLAY |
| Anul II | `browser-replay/replay-course2-1440.png` | RECORDED REPLAY |
| All Classes | `browser-replay/replay-all-1440.png` | RECORDED REPLAY |
| Current captured unmapped upper-floor 401 | `extra-browser/replay-unmapped-upper-floor-401.png` | RECORDED REPLAY |
| Published weekly disclaimer mobile | `extra-browser/replay-mobile-disclaimer.png` | RECORDED REPLAY |
| Mobile 390/320 mapped | `browser-replay/replay-course1-mapped-390.png`, `replay-course1-mapped-320.png` | RECORDED REPLAY |
| Actual local handlers + recorded cache | `local-producer-browser/local-producer-course1.png`, `local-producer-course2.png` | RECORDED REPLAY |
| API/CORS/network/partial failure | `browser-replay/api-failure.png`, `cors-denied.png`, `network-unavailable.png`, `partial-coverage.png` | SYNTHETIC FAILURE TEST |
| Timeout/invalid revision | `project-path-final/synthetic-timeout.png`, `synthetic-invalid-revision.png` | SYNTHETIC FAILURE TEST |
| Manual recovery | `project-path-final/replay-recovered.png` | RECORDED REPLAY |
| Actual production API read blocked in local browser | `extra-browser/local-production-cors-denied.png` | LOCAL |
| Independent demo/file | `project-path-final/local-demo-1440.png`, `local-file-demo.png` | LOCAL |

Просмотрены mapped mobile 320, desktop unmapped, demo, actual producer Anul II,
mobile disclaimer и captured upper-floor 401; visual QA этих frames PASS. Скриншота работающей
public map нет: local/replay нельзя выдавать за этот production scenario.

## Security / rollback / outstanding facts

Новых app deps, auth/admin CORS, secrets, executable data/JSONP/proxy, HTML injection
или writes в accepted state не добавлено. TextContent, schema/revision fail closed,
credentials omit и manual-store preservation проверены. Artifact allowlist PASS.

Npm audit: **14 inherited findings (10 high, 4 moderate)**; omit-dev: **2 high** —
sharp 0.35.4 и source-map-js 1.2.1, transitive Next/PostCSS. Package/lock такие же,
как main: это не новая dependency regression и не clean security audit.
[Sharp advisory](https://github.com/advisories/GHSA-wq5f-xc86-pv6w): возможный RCE при
определённых Linux/runtime SVG decoding условиях.
[Source-map-js advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q): DoS при
враждебных indexed source maps. В app source не найден next/image/SVG decoder path,
но production exploitability не исследована; отсутствие вызова не доказывает защиту.
Remediation/risk decision — separate review перед Gate B. Npm audit fix не запускался.

Rollback source revisions и точные действия — [release plan](DEPLOY-01_RELEASE_PLAN.md).
Actual Render rollback/redeploy capability оператор подтверждает до Gate B.
DB/cache/broker restoration не нужен; operational rollback не выполнялся.

PENDING: actual Pages URL/origin/publication; new hosted CI/independent PR review;
production CORS/live map acceptance; live Render env baseline/rollback UI capability;
cold-start latency; inherited dependency risk decision; physical mobile device;
official calendar/parity/date authority и on-site room survey. Upper floors unmapped.

**Сейчас требуется Gate A:** push двух точных веток и два Draft PR.
Gate B — producer env/merge/deploy; Gate C — consumer merge/Pages publication;
Gate D — final live acceptance. Ни один public-changing action DEPLOY-01 не выполнен.
