# MAP-02A — исследование API и готовности интеграции

Дата исследования: 9 октября 2026. **Вердикт: CONDITIONAL GO.**

## 1. Резюме и вердикт

Реальный публичный API доступен для Anul I и Anul II. Получены полные недельные шаблоны: **454 + 291 = 745 исходных записей**, 67 групп и 1236 членств занятий в группах. Это не 1236 физических занятий. В данных **95 различных непустых строк аудитории**. Текущий resolver не разрешает ни одну из 745 записей в допустимый полигон: нет подтверждённого корпуса у обычных числовых кодов, а явно обозначенные аудитории корпуса 3 используют неподдерживаемую нотацию. [E3, E6]

Можно реализовать загрузку, валидацию, provenance и информационный список реального опубликованного недельного шаблона. Активация достоверной подсветки занятий на конкретную дату требует календарного основания, доказательства корпуса для bare-кодов и принятой политики room identity. Успешный HTTP 200 этих решений не заменяет. Решения и последовательность отдельных контрактов находятся в [MAP-02A_DECISION_PACKET.md](MAP-02A_DECISION_PACKET.md).

**Рекомендация:** Option C — валидированный статический snapshot, экспортируемый отдельным процессом на стороне consumer; JSON и генерируемый локальный classic-script asset для сохранения `file://`. Резерв — Option B, same-origin proxy после отдельного решения о хостинге. Прямой browser fetch сейчас блокируется CORS. [E4, E9]

Все четыре deliverables — исследовательские документы. MAP-02B не реализован.

## 2. Baseline и точные ревизии

| Репозиторий | Наблюдение |
|---|---|
| A: `C:\Users\user\Documents\fcim-indoor-map` | Исходная ветка `Vladimir/ui-01-fix-b-final-cleanup`, HEAD `e14273370cc419e5acd21b78cd2ea51a3d6d4127`; tracked changes и untracked files отсутствовали |
| A: baseline UI | `UI-01-FIX-B_REPORT.md`, `UI-01-FIX-B_CHANGES.json`, schematic layout и тесты присутствуют; реально проверены 222 уникальных исторических ID и 15 catalog mappings |
| A: локальный `main` | `53e0d069f846dacca6a7be24442e5120ba49a6f7`; `git rev-list --left-right --count main...HEAD` → `0 3`, merge-base равен локальному main |
| A: cached `origin/main` | `8636c4a`; это устаревший локальный ref, не live main |
| A: live GitHub main | `git ls-remote` → `9f1e6a5926ee8579f39bbf641369d0e7857f3004`; GitHub compare baseline…main → `diverged`, ahead 1 / behind 1; merge-base `8b0a24aec70d51178291a0fd14d1860467e5b607`. UI-01-FIX-B не является предком этого main |
| A: исследование | Чистый baseline позволил создать `codex/map-02a-timetable-recon` от e142733; без reset, merge, commit или fetch изменения remote refs |
| B: `C:\Users\user\Documents\automated-student-schedule-system` | Remote `https://github.com/barbalatv/utm-curs-i-orar-2027.git`; ветка `main`, HEAD `735b64f28e78eb1de98c36bb68ddf4dc3ecc0426`; чистый рабочий каталог |
| B: live GitHub main | `git ls-remote` подтвердил тот же SHA. B читался локально; его Git history, source/config/cache/DB не изменялись |
| Production SHA | API не сообщает deployed Git revision. Совпадение наблюдаемых структур с исходниками не доказывает deployed SHA; значение остаётся `UNKNOWN` |

Исторические **398 PASS / 0 FAIL** прочитаны как прежний результат. Все 398 проверок в MAP-02A не повторялись. До добавления документов выполнены 41 MAP-01 data checks и 14 UI-01-FIX-B data/preservation checks — обе команды завершились кодом 0. [E1, E5]

## 3. Публичный API

Ограниченная серия: 16 публичных GET, не более двух одновременно, timeout 30 s, предел body 2 MiB, без повторного polling. Время основной серии: **2026-10-09T18:59:46.454667Z…18:59:49.945467Z**. Полные расписания скачаны по одному разу на курс. Ещё три небольших GET `/api/status?course=1` использованы в изолированной браузерной CORS-проверке. [E3, E4]

| URL path на production base | HTTP | Body bytes | Результат |
|---|---:|---:|---|
| `/api/health` | 200 | 167 | Оба `courses[].has_schedule=true` |
| `/api/status?course=1` | 200 | 1212 | Anul I, 41 группа, 454 lessons |
| `/api/status?course=2` | 200 | 1154 | Anul II, 26 групп, 291 lesson |
| `/api/groups?course=1` | 200 | 1967 | 41 group entry |
| `/api/groups?course=2` | 200 | 1281 | 26 group entries |
| `/api/schedule?course=1` | 200 | 207641 | Полный шаблон, count=454 |
| `/api/schedule?course=2` | 200 | 135255 | Полный шаблон, count=291 |
| `/api/source?course=1` | 200 | 650 | Принятый источник и update diagnostics |
| `/api/source?course=2` | 200 | 658 | Принятый источник и update diagnostics |
| `/api/status` | 200 | 1212 | Наблюдаемый configurable default = course 1 |
| `/api/status?course=3` | 400 | 83 | Invalid selector, supported_courses=[1,2] |
| `/api/status?course=1&course=2` | 400 | 111 | Repeated selector rejected |
| `/api/schedule/SI-261?course=1` | 200 | 19155 | 19 source lessons, by_day |
| `/api/schedule/SI-261/today?course=1` | 200 | 2686 | Vineri, 5 records; это weekday filter, не parity filter |
| `/api/schedule/TI-251?course=2` | 200 | 15455 | 15 source lessons, by_day |
| `/api/schedule/MAP02A-NO-SUCH-GROUP?course=1` | 404 | 66 | Unknown group; синтетический отрицательный selector |

Production base: [публичный timetable API](https://utm-curs-i-orar-2027.onrender.com/api/health). Подробные UTC timestamp, headers и SHA-256 каждой загрузки сохранены в E3. Во всех 16 ответах `Content-Type: application/json`, `Cache-Control: no-store`, `Vary: Accept-Encoding`; HTTP ETag, Last-Modified, Content-Encoding и Access-Control-Allow-Origin не наблюдались. Redirect не наблюдался. Это свойства конкретной выборки, не SLA. [E3]

Парные full payload занимают **342896 bytes ≈ 334.86 KiB** без HTTP/TLS overhead. Вся серия 16 GET — 388753 body bytes. 1000 полных загрузок пары — около 342.9 MB body; это расчёт по несжатой выборке, не фактический биллинг. Размеры и компрессия будущих ревизий могут отличаться.

Pagination отсутствует в изученных routes. `course` строго валидируется; остальные фильтры — `params.get()`, повторные filter keys не имеют такого же reject-контракта. Группа не выбирает курс: требуется явный selector. Код предусматривает 503 при отсутствии расписания и JSON 500 без stack trace; эти сбои в production не вызваны. `health.ok` означает liveness, `status` и `source` могут вернуть 200 при отсутствии данных. [E2: api.ts, courses.ts, routes; E7]

## 4. Фактические структуры ответов и модель

Full schedule имеет `{course_year, metadata, groups:string[], days, time_slots, lessons, count, warnings}`. Group endpoint возвращает также `group` и `by_day`; today не содержит достаточного календаря или полной provenance для map adapter. `/api/groups` использует объекты `{name, program, lessons}`, а не массив строк. Точные структуры, полный LessonSchema и field mapping приведены в [API contract](MAP-02A_API_CONTRACT.md). [E2, E3]

`geometry` обязателен в producer LessonSchema и реально присутствует; в исходном иллюстративном описании задания он был опущен. Все 745 live lessons проходят настоящий LessonSchema в изолированном эксперименте. TimeString в producer проверяет форму `HH:mm`, но consumer должен дополнительно проверять диапазоны и порядок времени. [E2: models.ts:28–62; E6]

202/745 записей относятся к нескольким группам; 7/745 имеют slot_span>1, и их start/end уже охватывают span. 8 записей имеют `subgroup="0.5 gr."`: это анонимная половина группы, не подтверждённые подгруппы «1» и «2». Сопоставление пользовательской подгруппы остаётся отдельно квалифицированным. Значение null означает отсутствие subgroup marker, а не доказательство полноты исходного PDF. [E2: lesson-interpreter.ts, normalizer.ts; E6]

ID producer — первые 12 hex SHA-1 от `page:cell.key:segmentIndex:cell.lines`. cell.key зависит от геометрии. Стабильность между PDF revisions не гарантирована, course year в seed ID отсутствует; коллизия возможна. В выборке нет duplicate IDs внутри курса и пересечения IDs между курсами, что не является будущей гарантией. Нужны revision-scoped sourceEventKey и отдельные membership IDs; нельзя deduplicate по subject/teacher/room/time. [E2: lesson-interpreter.ts:312–315, cell-builder.ts:53, geometry.ts:156; E6]

`uncertain` в текущем parser прежде всего диагностирует неразобранный предмет. Все 745 имеют uncertain=false, но это не подтверждает корпуса/аудитории. Confidence: 705×1.00, 37×0.85, 1×0.80, 2×0.90. У course 1 есть warning о двух orphan text cells; count=454 не доказывает полноту официального расписания. [E2: lesson-interpreter.ts:235–246, index.ts:89–92; E3, E6]

## 5. Календарь и чётность

Live status обоих курсов: `timezone=Europe/Chisinau`, `source.odd_week_anchor=2026-08-31`, `refresh_interval_minutes=30`, `parity_note=null`. Metadata: `academic_year=2026/2027`, semester I для course 1 и III для course 2. Это номера семестров соответствующих курсов, не конфликт календарей. Status **не возвращает currentWeek**; его вычисляет producer UI. [E3; E2: schedule-service.ts:117, time.ts:63]

Официальная FCIM [страница расписания](https://fcim.utm.md/procesul-de-studii/orar/) сообщает, что первая неделя осеннего семестра нечётная. Она поддерживает правило начала чётности, но изученный текст не задаёт дату anchor, границы занятий или исключения. Проверенная [общая страница календаря UTM](https://utm.md/procesul-de-studii/calendar-universitar-utm/) на момент web-read имеет заголовок 2025/2026; переносить её даты на 2026/2027 нельзя. Ограниченный поиск не дал подтверждённого календаря нужного FCIM cohort. Это не утверждение, что такой документ нигде не существует. [E8]

Producer currentWeek считает civil date в Chisinau, приводит anchor к Monday и на Saturday/Sunday прибавляет неделю. MAP-01 academicWeek считает `1 + floor((selectedDate-anchor)/7)` без look-ahead. С корректным Monday anchor в будни результаты совпадают. Изолированно выполнено:

| Selected date | MAP-01 number/parity | Producer displayed week |
|---|---|---|
| 2026-08-31 | 1 / odd | 1 / odd |
| 2026-09-07 | 2 / even | 2 / even |
| 2026-10-09 | 6 / even | 6 / even |
| 2026-10-10 и 2026-10-11 | 6 / even | 7 / odd, lookingAhead=true |
| 2026-10-26 | 9 / odd | 9 / odd |
| 2027-01-01 | 18 / even | 18 / even |

Эти значения — алгоритмическая проверка заданного runtime anchor, **не подтверждённое наличие занятий в указанные даты**. Нельзя брать producer currentWeek или today как ответ для произвольной даты карты. До anchor MAP-01 возвращает null для неположительной недели; producer может вычислить неположительное число. Некорректный producer anchor fallback-ится к default; consumer должен сообщить calendar-unresolved вместо fallback. [E2; E6]

Live parity distribution: odd=187, even=175, both=383, unknown=0. Schema допускает unknown. Producer `lessonsThisWeek` оставляет unknown на обеих неделях для отображения; consumer не должен превращать это в доказательство both. MAP-01 отклоняет unknown; пропуск поля также опасен, поскольку отсутствие parity означает unrestricted. Нужно сохранить исходную запись в unresolved list и исключить из уверенной календарной подсветки. [E2: time.ts:81–88; E1: schedule-engine.js:28–56; E6]

Нет авторитетных start/end semester dates, validFrom/Until, holidays, non-teaching dates, examination intervals, special lesson dates, official week-number list или spring transition anchor. Все 745 records заблокированы для утверждения «запланировано именно на выбранную дату». Это календарный блокер, пересекающийся с room blocker; их нельзя складывать. Опубликованный weekly pattern можно показывать с явной квалификацией, без утверждений о занятости.

Civil-time/DST проверки прошли в Node 22.23.1: осенние UTC instants 2026-10-25T00:30Z и 01:30Z оба дают 03:30 Chisinau; весенние 2027-03-28T00:30Z/01:30Z дают 02:30/04:30; 2026-12-31T22:30Z переходит в 2027-01-01. Это текущие Intl/tzdata runtime results. Engine semantics локального `[start,end)` и ночной запрет сохраняются. [E6]

## 6. Инвентарь room codes

Полный инвентарь, частоты на курс/combined, parser output, authority, resolver status, source IDs и uncertainty distributions: [MAP-02A_ROOM_COVERAGE.json](MAP-02A_ROOM_COVERAGE.json). Каждая частота содержит знаменатель и evidence basis. Null — отдельная запись inventory, исключённая из 95 уникальных непустых строк. Никакие unfamiliar значения не отброшены. [E6]

| Класс raw room field | Records / 745 | Непустые distinct strings / 95 |
|---|---:|---:|
| Подтверждённая identity с допустимым регионом | 0 | 0 |
| Candidate catalog number, корпус не подтверждён | 81 | 7 |
| Valid полный B3 code, но unmapped | 0 | 0 |
| Unknown building | 485 | 55 |
| Ambiguous slash/comma/range-like notation | 82 | 27 |
| Missing room | 37 | 0 |
| Facility/service-only eligible rejection | 0 | 0 |
| Явная нотация другого корпуса | 33 | 4 |
| Явная B3 нотация, parser карты не поддерживает | 27 | 2 |

Range-like `301-304`, `D01-03`, `D-02-04` помечены ambiguous, а не автоматически развёрнуты в диапазон. Producer допускает room field с несколькими аудиториями; конкретное назначение одной группе/половине из этой строки не следует. Basement output parser не доказывает корпус и не означает доступную карту подвала. Коды `A02`, `A03`, `A-03`, `D-01`, `Sala sportivă` сохраняются с unknown identity. `Aula 6-2 Henri Coandă` распознаётся в аудите как явная venue-нотация другого корпуса; текущий map resolver эту форму не понимает. [E2: lesson-interpreter.ts:14–27, 159–170; E6]

В выборке нет обычных однобуквенных suffix room strings; синтетические `405A` / `405а` проверены отдельно. FIX-01 сохраняет отличие латиницы и кириллицы. Нет основания считать `3-405a` из fixture реальной аудиторией. [E1, E6]

## 7. Coverage и граница room trust

| Метрика | Anul I | Anul II | Combined |
|---|---:|---:|---:|
| Source lesson records | 454 | 291 | 745 |
| Group projections, не физические занятия | 790 | 446 | 1236 |
| Distinct непустые raw room strings | 83 | 59 | 95 (union) |
| Missing room | 37/454 | 0/291 | 37/745 |
| Ambiguous room expression | 73/454 | 9/291 | 82/745 |
| Missing ∪ ambiguous | 110/454 | 9/291 | 119/745 |
| Явное source-указание B3 | 21/454 | 6/291 | 27/745 |
| Полный единичный B3 code, принимаемый parser | 0/454 | 0/291 | 0/745 |
| Подтверждённая map identity у source lesson | 0/454 | 0/291 | 0/745 |
| Eligible immediate future highlighting | 0/454 | 0/291 | 0/745 |
| Blocked by location identity | 454/454 | 291/291 | 745/745 |
| Blocked by date-calendar authority | 454/454 | 291/291 | 745/745 |
| Candidate одиночный F1 code без корпуса | 49/454 | 32/291 | 81/745 |

Unique-room подтверждённое coverage: 0/83, 0/59, 0/95; среди явно B3 строк — 0/2 в каждом курсе и combined. Lesson-weighted coverage среди явно B3 records — 0/21, 0/6, 0/27. Цифра 27 — уверенное чтение явной нотации источника, **не независимая проверка physical building directory**. Полное coverage всего корпуса неизвестно. [E6]

Семь candidate bare strings: `101` (18 records), `104` (14), `107` (24), `110` (4), `112` (1), `113` (9), `114` (11). Их одиночные числовые identities покрывают 7/15 каталожных classrooms условно, только после подтверждения upstream building context. Сейчас location остаётся unknown-building. Восьмой номер нельзя добавлять из multi-room tail или выводить из сортировки. [E6]

Актуальный `createResolver(map, parse, catalog)` сначала проверяет building, потом catalog conflicts, потом catalog mapping. Для `3-101`, `3-103`, `3-106` возвращает оба component IDs с provenance `user-confirmed`, onSiteVerification `unknown`; далее отдельный bindings path требует `verification="verified"`. Старый TIMETABLE_CONTRACT описывает только второй путь и отстаёт от ROOM-01B source catalog implementation. [E1: room-contract.js:35–64, room-identification.js:65–114; E5, E6]

**D7 требует явного принятия** существующей user-confirmed identity policy для real timetable highlighting; нельзя переименовать её в verified-binding. **D13 требует building authority** для source bare codes. Один gate не заменяет другой. Нельзя добавлять `buildingId=utm-b3` только потому, что группа FCIM или номер начинается на 1–7. Конфликты с FIX-01 manual assignments должны приостанавливать mapping; пользовательский localStorage в исследовании не читался. Facility catalog запрещает WC, storage, reception, cafe/shaft как classrooms. Новые bindings не созданы.

## 8. Браузер и CORS

HTTP GET с Origin `https://example.org`, `http://localhost:8765`, `null` вернули JSON без ACAO. Отдельный Chrome 154.0.8037.98 без изменения browser security отказал в чтении status response из всех трёх origin: file/null, localhost HTTP и HTTPS. HTTP/HTTPS test documents обслужены interception изолированного Playwright context; API GET реальны, эти origin не являются deployed map sites. В каждой console — отсутствие Access-Control-Allow-Origin; fetch → TypeError. [E3, E4]

Простой GET с Accept: application/json и credentials: omit не нуждается в preflight по [Fetch Standard](https://fetch.spec.whatwg.org/#http-cors-protocol). Добавление JSON Content-Type, Authorization или custom headers потребует preflight и не исправит CORS. OPTIONS не вызывался: контракт разрешал публичные GET; custom preflight behavior в production unverified. В source json helper/next.config нет CORS headers; middleware/proxy с их добавлением не найден. `mode:no-cors` дал бы opaque unreadable response и не является решением. [E2, E9]

Cold start не наблюдался: основная серия около 0.25–0.61 s/request. Не выключали service и не имитировали production outage. При Free instance Render документирует idle sleep и cold-start delays, но текущий compute plan не установлен. Ошибочный HTML/loading page должен считаться invalid JSON/transport availability, не empty schedule. [E3; E9: Render]

## 9. Архитектура

| Вариант | Совместимость и hosting/CORS | Freshness, failure/offline | Безопасность, сопровождение, стоимость и тестирование |
|---|---|---|---|
| A — direct fetch | HTTP(S)/file сейчас blocked; нужен отдельно разрешённый CORS upstream | Live данные, но зависимость от network/cold start; LKG нужен отдельно | Мало consumer кода, но producer change не оправдан удобством; без secrets, runtime validation; browser tests необходимы |
| B — same-origin proxy | Требует HTTP(S) hosting и read-only fixed-route proxy; file не обращается к нему автоматически | Live/LKG возможны; proxy timeout/caching контролируются | Дополнительная эксплуатация; allowlist base+routes, запрет open URL proxy; compute и egress по выбранному host; возможен free-tier, без SLA |
| C — published snapshot | Сохраняет static map и file/offline через локальный classic script; HTTP(S) может читать same-origin JSON | Отставание до очередного принятого export; атомарно сохраняется предыдущий accepted snapshot | Exporter только GET API, validator+provenance; без нового room DB/backend; process/release operation требует владельца; легко replay-test и hash verify |
| D — hybrid | Snapshot + live refresh только через разрешённый same-origin endpoint; CORS A остаётся blocker | Хороший offline baseline, больше состояний stale/live/partial | Наибольшая сложность race/cache; нет нового смысла physical occupancy; подходит последующему этапу после C/B |

Primary C, fallback B. D — возможное развитие после получения рабочей live transport topology, не обязательная инфраструктура MAP-02B. Бесплатная статическая публикация технически возможна; Render [документирует free static sites и shared usage limits](https://render.com/docs/free). Нулевые расходы и capacity текущего аккаунта не проверены. Исследование не создало exporter, proxy, snapshot app asset, hosting или scheduler. [E9]

Минимальная архитектура: source reader → source validators → revision-scoped event/membership normalization → versioned provenance/calendar envelope → optional v1 engine projection **только при подтверждённом календаре** → source-event deduplication → existing room resolver + trust gates → UI status/panels. Existing engine/geometry/FIX-01 storage не требуют переписывания. Схема v1 достаточна лишь для календарно разрешённого evaluated subset; внешний v2 envelope необходим для unresolved weekly patterns, provenance, sourceEventKey и course coverage. Подробный diagram и совместимость — API contract/decision packet.

## 10. Freshness и provenance

| Course | PDF hash | Accepted metadata |
|---|---|---|
| 1 | `ea38a76a3800da5ee320cfd048f19af14cbfa81168c26626babcf25cca050d05` | October `anul_i_semestrul_i-4.pdf`; downloaded 2026-10-09T01:08:11.953Z; parsed 01:08:23.231Z |
| 2 | `d2f7bde17384ecd9a5033882f30e288aa917fe40e26964a4095a5dc5f7a8e737` | October `anul_ii_semestrul_iii-1.pdf`; downloaded 2026-10-09T01:08:23.977Z; parsed 01:08:30.435Z |

Оба `source_kind=live`, transport=broker, parser=1.4.0, snapshot=`2026-10-09T00-59-44-524Z-510e2df6`. Последние проверки: course1 18:46:50.000Z, course2 18:46:51.300Z; result=unchanged, error=null. Status и schedule согласованы по course/hash/parser/count в выборке. Это accepted state, не непосредственная загрузка PDF consumer-ом. [E3, E6]

`downloaded_at`, `parsed_at`, `last_check_at`, `last_success_at`, consumer fetchedAt и snapshot publishedAt имеют разные значения. Старый downloadedAt при recent successful unchanged check не обязательно означает stale source. Source kind live описывает discovery origin, manual — explicit accepted recovery, wayback — archival discovery, seed — bundled bootstrap. Hash подтверждает идентичность PDF bytes, parser version — lineage; ни один не подтверждает physical-room accuracy или полноту календаря. [E2: models.ts, updater.ts; docs/architecture.md, debugging.md]

Рекомендуемые, ещё не принятые thresholds: client accepted cache 5 min; refresh только page open/course data miss/manual, без fetch на каждый date/group/time change; snapshot export 30 min при отдельно принятом scheduling. Warning при last reliable upstream check или snapshot publication старше 2 h; hard stale/qualification при 24 h или missing check. Эти значения — UX/операционная политика D9, не official schedule validity. Полные failure states и race/revision handling — API contract.

## 11. Безопасность, команды и результаты

Основные исполненные команды: `git status --porcelain=v1`, `git branch -avv`, `git rev-parse HEAD`, `git log main..HEAD`, `git merge-base main HEAD`, `git rev-list --left-right --count main...HEAD`, `git ls-remote ... refs/heads/main`, `gh api .../compare/...`, `git switch -c codex/map-02a-timetable-recon`; read-only `rg` и Get-Content. API доступ проверен Python urllib, browser CORS — headless Chrome. Exact helper scripts/results находятся в E3–E7.

| Проверка | Результат / exit code |
|---|---|
| `python <E3>/probe.py` | 16 captured HTTP outcomes; exit 0; expected 400/404 являются отрицательными probes |
| `node tests/map01-data.cjs <E5>/map01-data.json` | 41 PASS / 0 FAIL; exit 0 |
| `node tests/ui01-fix-b-data.cjs <E5>/ui01-fix-b-data.json` | 14 PASS / 0 FAIL; exit 0; до добавления research docs |
| `node <E6>/audit.cjs` | 14 PASS / 0 FAIL; exit 0; actual schemas + real samples + явно синтетические edge cases |
| `node <E7>/failure-experiments.cjs` | 6 PASS / 0 FAIL; exit 0 после исправления только временного transpile harness |
| `node <E4>/browser-cors.cjs` | 3/3 expected CORS denials; exit 0; это результат невозможности direct fetch, не integration success |

Первый запуск failure harness завершился exit 1 из-за отсутствующего esModuleInterop в **временном** transpiler; исправлен external harness, source B не менялся. Несколько discovery reads предположили отсутствующие paths (`docs/api.md`, `storage.ts`, `client-time.test.ts`); использованы реальные docs/debugging.md, storage/index.ts и time.ts. Эти ошибки чтения не выданы за тесты producer. B test runner/server, npm install, DB, admin endpoints, scraping/parser updater не запускались. Existing tests не модифицировались. Старый strict UI-FIX-B file-list gate рассчитан на прежний task allowlist; после добавления research docs final preservation проверяется отдельно against baseline SHA-256 + ровно четырёх разрешённых additions.

JSON строковые значения остаются внешними недоверенными данными: будущий UI должен использовать textContent/escaping, maps с безопасными own keys, bounded body и обязательную runtime validation. Никаких API secrets browser-у не требуется. Fixed upstream URL не должен превращаться в generic proxy. Unvalidated data не записывается в accepted cache и не попадает в FIX-01 key `fcim-indoor-map/utm-b3/bindings`.

## 12. Нерешённые блокеры

1. D5/D6: authoritative calendar 2026/2027 cohort, date-validity, exceptions, semester transitions; либо явное разрешение только квалифицированного weekly-pattern режима.
2. D13: authoritative building context для bare room values; source названия группы/первой цифры недостаточно.
3. D7: допустимость user-confirmed catalog для real associations с сохранением честной provenance.
4. D14: `0.5 gr.` не адресует конкретную половину; subgroup-specific routing нельзя включать без основания.
5. D1/D9: владелец export/snapshot freshness и operational policy. Прямой fetch нерабочий без изменения транспортной топологии.
6. Mapping полного корпуса неизвестен; 15 подтверждённых F1 classrooms не доказывают coverage других этажей. Для `3-3`/venues нужна отдельная identity qualification, не новый случайный polygon.

## 13. Готовность MAP-02B

**CONDITIONAL GO:** независимые задачи schema/provenance/source reader и отображения квалифицированного weekly pattern технически готовы к отдельному разрешённому контракту. Confident date highlighting, bare-room binding и персонализация anonymous half-group остаются закрыты соответствующими решениями. Ни одна политика в этом отчёте не принята за пользователя.

Последовательность: **MAP-02B-00 → MAP-02B-01 → MAP-02B-02 → MAP-02B-03 → MAP-02B-04 и MAP-02B-05 → MAP-02B-06 → MAP-02B-07**. Calendar и room work после своих human/evidence gates могут идти независимо. Полные зависимости/files/acceptance/tests/risks — decision packet.

### Реестр доказательств

E1 — consumer source на [e142733](https://github.com/barbalatv/fcim-indoor-map/tree/e14273370cc419e5acd21b78cd2ea51a3d6d4127): `TIMETABLE_CONTRACT.md`; `schedule-engine.js` academicWeek:22, validateLesson:28, evaluate:59, aggregate:99; `room-contract.js` createResolver:24; `room-identification.js` source:4, createCatalog:65; `schedule-fixture.js`; `index.html` createResolver:240, demoResolve:1007, updateSchedule:1087. Связанные ROOM/UI/FIX/GEO отчёты служат историческим evidence; baseline перепроверен.

E2 — producer source на [735b64f](https://github.com/barbalatv/utm-curs-i-orar-2027/tree/735b64f28e78eb1de98c36bb68ddf4dc3ecc0426): `src/lib/models.ts` LessonSchema:39, Metadata:81; `src/lib/api.ts` json/resolveCourse; `src/lib/courses.ts` resolveCourseSelection/resolveCourseParam; API route.ts files; `src/lib/services/schedule-service.ts` requireSchedule/buildStatus; `src/lib/config.ts`; `src/lib/client/time.ts` currentWeek:63; `src/lib/client/course-load.ts`; parser lesson-interpreter/index/normalizer/cell-builder/geometry/validator; storage/index; README, docs/architecture.md, docs/debugging.md; tests/api-smoke, course-boundaries, multi-course, course-config, parser (inspected, не выполнялись).

E3–E7 — evidence directory: `C:\Users\user\.codex\visualizations\2026\10\09\01a12207-2080-7e12-a740-2c3511b96500\MAP-02A`. E3: `probes.json`, отдельные *.probe.json и public *.body, `probe.py`, `baseline.json`, `remote-main-comparison.json`; E4: `browser-cors.json`, browser-cors.cjs; E5: `map01-data.json`, `ui01-fix-b-data.json`; E6: `coverage.json`, `experiments.json`, audit.cjs; E7: `failure-experiments.json`, failure-experiments.cjs. Скрипты/полные выборки находятся вне обоих repositories; reproducibility не требует app changes. Final `verification.json` содержит actual file-preservation result.

E8 — bounded official web search/read 2026-10-09: [FCIM timetable page](https://fcim.utm.md/procesul-de-studii/orar/), [UTM calendar page](https://utm.md/procesul-de-studii/calendar-universitar-utm/). Только их изученные сведения; отсутствие найденного нужного календаря не доказывает отсутствие официального документа.

E9 — primary platform/protocol references, web-read 2026-10-09: [WHATWG Fetch CORS protocol](https://fetch.spec.whatwg.org/#http-cors-protocol), [Render Free service/static-site limits](https://render.com/docs/free). Это protocol/platform evidence, не проверка тарифа текущего producer deployment.
