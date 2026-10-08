# MAP-01 — контракт расписания и разрешения аудитории

Версия адаптера: `schemaVersion: 1`. Реальный API не подключён и его payload не изучался.
Текущая реализация использует только `schedule-fixture.js`; это полностью синтетические данные.

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

Все дополнительные файлы подключаются классическими script-тегами и работают по `file://`, без fetch,
сервера, сборки или CDN. Engine, parser, resolver и semantic layer также доступны через CommonJS для тестов.

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
- Для будущего `source: "timetable"` нужен отдельный список проверенных bindings с `verification: "verified"`.
  Ручные FIX-01 записи не получают этот статус автоматически. Схема их storage в MAP-01 не расширялась.
- Неизвестный ID, hall или неоднозначная каноническая привязка не создаёт ассоциацию.
- Aggregation сохраняет все lessons; при несовместимых spatial resolutions одного кода spaceId сбрасывается,
  status становится `ambiguous-binding`, исходные resolutions остаются в `locations`.

Демо-ассоциации: `3-405a → B3-F4-N05`, `3-601 → B3-F6-N01`, `3-201 → B3-F2-S03`,
`3-701 → B3-F7-N01`. Это **вымышленные соответствия**, не реальные номера этих помещений.
Они существуют только в fixture/памяти страницы и не входят в экспорт или localStorage ручного редактора.

## Следующий отдельный контракт

Получить фактический payload и provenance API, согласовать календарь и coverage, квалифицировать room bindings
по источникам/табличкам и написать адаптер в этот вход. Геометрию, space IDs, FIX-01 storage и вычислитель
расписания для этого менять не требуется. Ни API, ни аккаунты, ни backend/database в MAP-01 не добавлены.
