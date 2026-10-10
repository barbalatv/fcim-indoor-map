# MAP-01 — контракт расписания и разрешения аудитории

MAP-01 demo остаётся `schemaVersion: 1`; `schedule-fixture.js` полностью синтетический.
MAP-02B использует отдельный внешний `schemaVersion: 2` для проверенных JSON API ответов.
V2 не передаётся в v1 evaluate и не получает вымышленные границы семестра.

## Границы модулей

| Слой | Файл / интерфейс |
|---|---|
| Исходная геометрия и стабильные ID | `map-data.js`, `FCIM_MAP_DATA` |
| Ручные привязки | FIX-01 store в `index.html`; прежний формат и ключ localStorage |
| Канонизация и независимое разрешение помещения | `room-contract.js`: `createParser(map, "3")`, `createResolver(map, parser)` |
| Данные адаптера / fixture | `schedule-fixture.js`; будущий адаптер должен выдавать этот контракт |
| Календарная оценка | `schedule-engine.js`: `evaluate(dataset, selection)` |
| Группировка по аудитории | `aggregate(lessons, resolveRoom)` |
| Объекты с квалификацией доказательств | `map-semantics.js`: `facilities(map)` |
| UI state, SVG-подсветка, события | `index.html`: `schedule`, `scheduleClasses`, `updateSchedule` |

Модули MAP-01 подключаются классическими script-тегами и работают в демо по `file://` без fetch,
сервера, сборки или CDN. MAP-02B использует fetch только в реальном HTTP(S) режиме. Engine, parser,
resolver, semantic layer и чистые модули MAP-02B также доступны через CommonJS для тестов.

## Вход

```ts
type Lesson = {
  id: string;                 // ID исходной записи, не ID помещения
  group: string;
  subgroup?: string | null;   // null/отсутствие = занятие всей группы
  courseYear?: number;        // положительное целое
  academicYear?: string;      // если есть, должен совпасть с context
  subject: string;
  teacher?: string | null;
  source: "mock" | "timetable";
  buildingId?: string | null;
  room: string | null;
  weekday: number;            // ISO: понедельник 1, воскресенье 7
  startTime: string;          // HH:mm в context.timeZone
  endTime: string;            // HH:mm; начало < конец, ночные занятия не поддержаны
  weekParity?: "odd" | "even" | "both";
  weekNumbers?: number[];     // явные положительные номера учебных недель
  validFrom?: string;         // YYYY-MM-DD, включительно
  validUntil?: string;        // YYYY-MM-DD, включительно
  specificDates?: string[];   // только эти даты, с учётом прочих ограничений
  excludedDates?: string[];
};
type Context = {
  academicYear: string;
  startDate: string; endDate: string; // явные границы покрытия, максимум два года
  timeZone: string;                  // сейчас Europe/Chisinau
  weekAnchorDate?: string;
  weekAnchorNumber?: number;
  parityDefinition?: "anchor-number-modulo-2";
};
type Dataset = {
  schemaVersion: 1;
  source: "mock" | "timetable";
  coverage: string;                  // например synthetic-partial; полнота не подразумевается
  context: Context;
  lessons: Lesson[];
};
type Selection = {
  date: string; time: string;
  group?: string; subgroup?: string; courseYear?: number;
};
```

`source: "timetable"` — метка доверенного будущего адаптера, не доказательство подлинности сама по себе.
Внешний адаптер должен проверять версию, источник, границы покрытия и provenance до передачи данных.
Учебный календарь, период пары и чётность должны приходить из подтверждённого контекста;
fixture не определяет официальные правила UTM. В демо неделя 1 начинается 2026-09-07, период покрывает
2026-09-07…2027-06-27 и имеет название `DEMO-2026-2027`: все эти значения вымышлены.

## Оценка времени

`localTime(UTC instant, "Europe/Chisinau")` переводит момент через `Intl.DateTimeFormat` и возвращает местные
`date` и `time`. Выбранные пользователем дата и время уже являются местными календарными значениями;
системная зона Windows на их оценку не влияет. Смена даты использует арифметику календарных дней, а не
добавление 24 часов к местному timestamp. Это избегает дрейфа на DST и смене календарного года.

Занятие активно на полуинтервале `[startTime, endTime)`. `active` содержит все подходящие записи,
`groupActive` — выбранную группу/подгруппу/курс. При отсутствии активного занятия `next` содержит все
записи с ближайшим началом в явных границах покрытия, включая одновременные записи разных подгрупп.
Пустое значение subgroup выбирает все подгруппы; занятие всей группы подходит каждой подгруппе.

`academicWeek` считает недели от явно переданного anchor и anchor number. Без распознанного правила
чётность остаётся неизвестной; занятия с ограничением parity/weekNumbers не оцениваются и получают issue.
Отсутствующие/неправильные поля диагностируются в `issues`, корректные записи остаются доступными.
Повторы ID не перезаписываются: все валидные записи сохраняются и диагностируются. Несколько записей в
аудитории показываются как общий слот или возможный конфликт; автоматически выбрать победителя нельзя.

В повторяющийся час DST оценка относится к опубликованному местному времени, не к длительности занятия
в абсолютных секундах. Ночные интервалы не угадываются. UI режима «Сейчас» проверяет часы каждые 15 секунд
и пересчитывает состояние при смене минуты.

## Разрешение аудитории

```ts
type RoomLocation = {
  roomCode: string | null; spaceId: string | null; floorLevel: number | null;
  status: string; provenance: "temporary-demo" | "verified-binding" | null;
};
type RoomOccupancy = RoomLocation & { lessons: Lesson[]; locations: RoomLocation[] };
```

Resolver использует **тот же parser FIX-01**, что форма, поиск, storage и импорт. `405A`, `3-405a` и
`3 — 405A` дают `3-405a`; кириллица и латиница не отождествляются. Это временный совместимый контракт,
официальный статус буквенных суффиксов неизвестен.

- Явный `buildingId` должен быть `utm-b3`; код другого корпуса не допускается даже при этом buildingId.
- При отсутствии buildingId полный код `3-405a` однозначно задаёт корпус. Bare `405a` без корпуса остаётся `unknown-building`.
- Подвал распознаётся, но остаётся `pending-floor`. Первая цифра номера никогда не выбирает полигон.
- `null` room возвращает `missing-room` и не создаёт подсветку.
- Неизвестные номера возвращают `unmapped`, включая существующий legacy `knownButUnlocated: 3-609`.
- Для `source: "mock"` resolver читает только явно переданные `demoAssociations`; реальные bindings не заимствуются.
- Для `source: "timetable"` прежний F1 catalog разрешает `user-confirmed` соответствия с on-site unknown.
  Другие ручные bindings требуют `verification: "verified"`; FIX-01 записи не получают этот статус
  автоматически. Схема их storage не расширялась.
- Неизвестный ID, hall или неоднозначная каноническая привязка не создаёт ассоциацию.
- Aggregation сохраняет все lessons; при несовместимых spatial resolutions одного кода spaceId сбрасывается,
  status становится `ambiguous-binding`, исходные resolutions остаются в `locations`.

Демо-ассоциации: `3-405a → B3-F4-N05`, `3-601 → B3-F6-N01`, `3-201 → B3-F2-S03`,
`3-701 → B3-F7-N01`. Это **вымышленные соответствия**, не реальные номера этих помещений.
Они существуют только в fixture/памяти страницы и не входят в экспорт или localStorage ручного редактора.

## Историческая граница MAP-01 и расширение MAP-02B

В MAP-01 API, аккаунты и backend/database не добавлялись. MAP-02B ниже добавляет проверенный
внешний v2 и отдельно одобренную provisional weekly policy, сохраняя геометрию, space IDs,
FIX-01 storage, пользовательский каталог и demo v1 evaluator без изменений.


## MAP-02B: внешний v2 и прямой JSON API

Основной источник — producer `barbalatv/utm-curs-i-orar-2027`, два public GET на
каждый явно запрошенный курс: `/api/schedule?course=1|2` и `/api/status?course=1|2`.
`/api/groups` не требуется: real group names уже присутствуют в full schedule.
Внешние данные сначала валидируются; API строки передаются в DOM через textContent.

`timetable-api.js.createClient(apiOrigin, normalize, options)` ограничивает JSON
body 4 MiB, всю пару запросов 15 секундами, credentials=omit и redirect=error.
HTTPS origin должен быть без paths/query/credentials; HTTP допускается только
для loopback разработки. Cache TTL 300000 ms, force refresh обходит его, pending
запросы объединяются по курсу. AbortController и поколения запрещают поздним
ответам перезаписывать новый снимок; UI отдельно проверяет поколение выбора курса.
При ошибке хороший cache возвращается как stale, никогда не заменяется invalid JSON.

Consistency tuple: course, academic_year, semester, source_kind, source_pdf_url,
source_pdf_hash, parser_version, downloaded_at, parsed_at должны совпадать между
schedule.metadata и status.schedule. Несовпадение отклоняет весь candidate курса.
Два курса принимаются независимо; различие их PDF/semester/revision нормально.
last_success_at — отдельная диагностика source state, не revision identity.

```ts
type ExternalDatasetV2 = {
  schemaVersion: 2; source: 'timetable'; courseYear: 1|2;
  revision: string; regularFcim: boolean;
  groups: string[]; events: SourceEvent[];
  memberships: {id:string,eventId:string,group:string,subgroup:string|null}[];
  metadata: ProducerMetadata;
  sourceStatus: {lastSuccessAt:string|null,lastCheckAt:string|null,parityNote:string|null};
  calendar: {timeZone:'Europe/Chisinau',oddWeekAnchor:string,
             authority:'configured-unverified',validity:'published-weekly-pattern'};
  fetchedAt: string; warnings: string[];
};
```

SourceEvent содержит исходный ID, courseYear, academicYear/semester (nullable),
groups[], subgroup, weekday ISO 1–5, startTime/endTime, subject/teacher, rawRoom,
weekParity `odd|even|both|unknown`, parser uncertain/confidence/notes/rawText,
sourceLesson и отдельно нормализованную location. V2 не создаёт validFrom/validUntil,
specificDates/excludedDates. Неизвестный учебный год не заменяется demo/system year.

Revision — JSON tuple курса, PDF hash, parser version, downloaded_at и parsed_at;
event identity — tuple repository, revision, source lesson ID. Membership identity
дополнительно включает exact group/subgroup. Повтор source ID отклоняет candidate;
distinct IDs сохраняются даже при одинаковом времени/предмете. All Classes передаёт
aggregate один event со всеми memberships, поэтому общий урок не размножается.

`timetable-adapter.evaluate(datasets, selection)` оценивает недельный pattern на
выбранной местной дате. Monday anchor проверяется как civil date; нет weekend
look-ahead или fallback к вымышленной неделе. Unknown parity, parser uncertain,
anonymous `0.5 gr.` и ограниченная parity с invalid anchor попадают в unknown
панель без highlight. Прочие события квалифицируются как план по configured parity,
никогда как подтверждённое проведение/занятость. Официальные даты и исключения неизвестны.

`timetable-room-policy.createPolicy(map, parse, resolve)` использует неизменный
FIX-01 parser/resolver. Bare single 3-digit code (+ допустимая FIX-01 suffix) получает
Building 3 только у распознанного `fcim.utm.md` обычного `anul_i|ii_semestrul_*.pdf`
и официального FCIM source page. Exams/unrelated sources не наследуют default.
Полные explicit codes и строго разобранные qualifiers `corp./corpul/building/корпус`
имеют приоритет. Противоречие, multi-room и сложный venue остаются unresolved.
Raw и canonical code хранятся раздельно. Номер этажа не назначает polygon.

Location сохраняет interpretation `default-building-3|explicit-building|unresolved`,
roomCode/buildingId/status и rawRoom. Resolver сохраняет `user-confirmed` F1,
`onSiteVerification: unknown`, conflict handling и существующее требование verified
для иных ручных real bindings. Demo associations не передаются в real resolver.
Никакой JSON producer не меняет каталог, геометрию или FIX-01 localStorage.

Live status различает unavailable, loading, partial, cached/fresh, validated stale,
no planned lesson, unknown applicability и valid lesson with unmapped room.
Статус fetch не является доказательством календарной или физической актуальности.
Полная qualification постоянно показана в real controls; detailed provenance раскрывается.
`file://` остаётся offline demo; при явном выборе real объясняет HTTP(S)+CORS gate.
