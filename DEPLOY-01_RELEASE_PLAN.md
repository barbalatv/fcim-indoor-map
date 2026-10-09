# DEPLOY-01 — план выпуска

10 октября 2026, Europe/Chisinau. **PRE-DEPLOYMENT**.
**READY FOR DEPLOYMENT — HUMAN APPROVAL REQUIRED**: готовность к Gate A, а не
разрешение пропустить hosted CI, Gate B/C или production acceptance.

## Источники, история и сохранность

| Роль | Ветка | Проверенный source/CI SHA | Remote main / PR base |
|---|---|---|---|
| Producer | `codex/map-02b-producer-integration` | `badad94fbf6e2a2caf87e028cda029f993eaadd8` | `735b64f28e78eb1de98c36bb68ddf4dc3ecc0426` |
| Consumer | `codex/map-02b-consumer-integration` | `e98ed51f5f1d763799291c91c2286cfc31397f1c` | `9f1e6a5926ee8579f39bbf641369d0e7857f3004` |

Четыре документа DEPLOY-01 добавляются финальным documentation-only commit.
Полные publication HEAD после него фиксируются в `decision-packet.json` и
`GATE-A.md` в локальном evidence и итоговом ответе. Перед push сравнить
`git rev-parse HEAD` с пакетом; иной HEAD требует нового просмотра diff.

Consumer ancestry: `53e0d06` GEO-FIX-A → `573d0e1` GEO-02 → `8b0a24a` ROOM-01A/B/C →
`e14273370cc419e5acd21b78cd2ea51a3d6d4127` UI-01/FIX-A/FIX-B → `e334a7d` MAP-02A/B →
`2d8a60f7345632cdcb58aea0958d3fd4ba889531` safe merge remote main → `aff2952` CI/Pages →
`e98ed51` browser recovery. Некоторые принятые этапы объединены в общих commits.
После fetch исходный merge base был `8b0a24a`, divergence 1/1. Дерево remote main
совпало с `8b0a24a`; merge изменил 0 файлов. Remote main и accepted UI-FIX-B являются
предками release. Producer до MAP-02B совпадал с актуальным remote main.

222 ID, 15 F1 mappings, geometry, graph, manual storage и семь критических JS
сохранены. Все 71 accepted/integration файла сравнили по raw hashes до/после
DEPLOY-01: 0 byte changes. MAP-02A research сохранён. Parser/updater/DB/auth/admin,
Worker/broker/publisher и lock не изменены.

## Последовательность и human gates

1. **Gate A PENDING:** push только двух подготовленных веток и два независимых
   Draft PR в main. Это не разрешает merge/deploy.
2. Просмотреть exact PR heads/diffs и hosted CI обоих repos. Producer использует
   существующий full CI; consumer — новый portable workflow.
3. Подтвердить окончательные Pages URL/origin и приватно сохранить прежнее значение
   или отсутствие `SCHEDULE_MAP_ORIGINS`. Ожидаемый URL не выдавать за published URL.
4. **Gate B PENDING:** отдельное разрешение на Render env и producer merge/deploy.
   Предоставить approved commit, review/CI, deployed revision, impact и rollback.
   Render auto-deploy включён: producer merge в main — production action.
5. Принять producer production: оба курса штатного UI; четыре полных API ответа;
   revision/schema/course consistency; exact GET/OPTIONS, denied origins и admin
   isolation; real browser CORS. При regression остановиться и выполнить только
   заранее разрешённый rollback.
6. **Gate C PENDING:** отдельное разрешение на consumer merge, Pages settings и
   manual dispatch approved SHA, только после producer production acceptance.
7. Записать page_url, source SHA, deployment/run ID и publication time; проверить
   public map, My Group обоих курсов, All Classes, shared events, F1, unmapped,
   disclaimer, errors/recovery, desktop/mobile и независимое demo.
8. **Gate D PENDING:** human acceptance всех mandatory production criteria.

## GitHub Pages

Expected project URL: `https://barbalatv.github.io/fcim-indoor-map/`.
Expected origin: `https://barbalatv.github.io`. Сейчас URL и Pages API отвечают 404,
`has_pages=false`, environments отсутствуют. Actual published URL/origin — PENDING.
Подтвердить окончательный hostname/origin до Gate B; при отличии не применять
ожидаемый env value. После Gate C повторно сверить actual page_url/browser origin.
Custom domain требует нового exact allowlist и разрешения.

Выбран GitHub Actions: branch-root publication публиковал бы research/test/private
accidental files. Workflow имеет только `workflow_dispatch` из main, проверяет
40-character immutable SHA и ancestry, отдельно checkout approved source.
Push/PR/consumer merge сами Pages не публикуют. Нет bundler или app build.

После Gate C: Settings → Pages → Source: GitHub Actions. Environment `github-pages`:
только main; required reviewer, если поддерживается тарифом. Если feature недоступна,
human gate остаётся обязательной процедурой. До Gate C Pages не включать.
CI permission — contents: read. Только deploy job — pages: write/id-token: write.
Action refs проверены: configure-pages@v5, upload-pages-artifact@v4, deploy-pages@v4.
[Официальный workflow protocol](https://docs.github.com/en/enterprise-cloud%40latest/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Публикуются ровно 13 runtime files, с таким script order:

```text
index.html
map-data.js
room-contract.js
room-identification.js
schedule-engine.js
schedule-fixture.js
map-semantics.js
schematic-layout.js
timetable-room-policy.js
timetable-adapter.js
timetable-api.js
timetable-ui.js
.nojekyll
```

CSS/SVG встроены. Relative paths, case, fragment navigation, project path и file://
проверены. Runtime не использует local Windows paths, source maps, Codex evidence,
fixtures или внешние SVG libraries. Builder проверяет allowlist, case, symlinks,
unreviewed assets/credential patterns и не перезаписывает непустой output.
Docs/tests/research, .env, фото, cache, logs и DB в Pages package не входят.
Публичный GitHub source/PR diff проверяется отдельно от runtime artifact.

## Render preparation

Existing service `srv-dae2bq0n74is73c3p4cg`, workspace `tea-dae26cad0e5s73erp6p0`,
Frankfurt, Docker/free, producer repository, main. AutoDeploy yes / trigger commit;
not_suspended, maintenance disabled; custom healthCheckPath пуст.
Live deploy `dep-db43ebu0tbcc73ckr760` —
`735b64f28e78eb1de98c36bb68ddf4dc3ecc0426`.
[Существующий service](https://dashboard.render.com/web/srv-dae2bq0n74is73c3p4cg).
Новый service, migration или broker/publisher/Worker изменение не нужны.

Connector не предоставляет live env names/values — UNKNOWN. Оператор до Gate B
проверяет Environment и приватно фиксирует прежнее значение/отсутствие изменяемого
key; остальные settings сохраняет. Secrets не выводить. После подтверждения
окончательного default Pages origin кандидат:

```dotenv
SCHEDULE_MAP_ORIGINS=https://barbalatv.github.io
```

Сейчас value не применён. Нельзя wildcard, null, path, trailing slash или credentials.
Env update — merge отдельных keys, не replace всего набора. Env save тоже может
запустить deployment: выбрать approved save-only/deploy sequence по Dashboard UI;
не запускать duplicate deploy после автоматического merge deployment. Итоговый
deployed merge SHA может отличаться от PR head: записать и сравнить runtime diff.

## Воспроизведение и CI

Producer, fresh clone approved branch:

```powershell
npm ci
npm test
npm run typecheck
npm run typecheck:worker
npm run typecheck:publisher
npm run lint
npm run build
npm run check:worker
npm run build:publisher
npx playwright install chromium
npm run test:e2e -- --project=chromium
```

Hosted CI также запускает DB migrations/tests в изолированном Postgres 16.
Локальный DB suite DEPLOY-01 не запускался. Зелёный hosted baseline run `735b64f`
не доказывает новый release head; full CI на точном PR head обязателен после Gate A.

Consumer, fresh clone task branch после разрешённого push:

```powershell
node --test tests/deploy01-contract.cjs tests/map02b-api.cjs tests/map02b-data.cjs
$env:PLAYWRIGHT_MODULE='C:\path\to\producer\node_modules\@playwright\test'
# Prerequisite: Chrome installed; app dependencies карты не добавляются.
node tests/map02b-browser.cjs "$env:TEMP\fcim-map-replay-evidence"
node tests/deploy01-browser.cjs "$env:TEMP\fcim-map-project-evidence"
node scripts/prepare-pages.mjs . "$env:TEMP\fcim-map-new-empty-site"
```

Output paths новые/пустые, вне checkout; повторный run использует новое имя.
Linux CI устанавливает isolated @playwright/test@1.63.0 и Chrome, задаёт
PLAYWRIGHT_MODULE явно: Codex fallback не используется.
[Playwright CI](https://playwright.dev/docs/ci).
Portable gate замораживает LF-normalized content 71 accepted files, exact reversible
integration hunks, ID/mappings и storage block. Пять capture fixtures `-text`
сохраняют исходный SHA-256. Никакой baseline directory не выдуман.

Старые tests/preloads/manifests не редактировались. 398 historical checks выполнены
до DEPLOY-only additions с documented MAP-02B preload и настоящими external
evidence directories. Их old-scope strict file-list и local prerequisites не
являются fresh-clone command финальной ветки; для неё есть отдельный строгий
DEPLOY allowlist. Это дополнение к историческим проверкам, не ослабление assertions.

## Rollback до deployment

Producer working target `735b64f...`, deploy `dep-db43ebu0tbcc73ckr760`.
Gate B должен заранее разрешить rollback при mandatory regression.
Dashboard → service → Deploys → working deploy → Rollback, если доступно.
Если тариф/UI не поддерживает кнопку — approved deploy specific commit `735b64f...`
либо отдельная revert ветка/PR для release merge. Возможность exact rollback/redeploy
оператор подтверждает до Gate B: connector показывает deploy history, но кнопка
не проверена. Не reset/force-push. Повторно проверить deployed SHA, UI и оба API.
Приватно восстановить прежний env key: rollback code не восстанавливает env.
DB/R2/accepted cache/history не удалять.

Consumer UI rollback source `e14273370cc419e5acd21b78cd2ea51a3d6d4127`.
Controller остаётся на main, отдельный source checkout берётся по старому SHA.
Builder поддерживает seven original scripts: rollback package — 9 files, demo-only.
После отдельного разрешения:

```powershell
gh workflow run pages.yml --repo barbalatv/fcim-indoor-map --ref main -f source_sha=e14273370cc419e5acd21b78cd2ea51a3d6d4127
```

Первый release dispatch использует approved source SHA из Gate C вместо UI SHA.
Сохранить run/deployment IDs и проверить результат. При отсутствии usable artifact
approved оператор отключает Pages, не выдаёт broken real mode. Manual localStorage
и catalog сохраняются. Previous production map SHA — NOT APPLICABLE, поскольку
initial map publication ещё нет; UI SHA — кандидат rollback, не прошлый deployment.

Producer rollback может отключить CORS: карта остаётся usable для navigation/demo,
real показывает unavailable/qualified LKG. Consumer rollback не меняет producer UI.

## Maintenance

Существующие бесплатные Render/GitHub diagnostics + bounded manual smoke двух сайтов,
четырёх API reads, exact ACAO/Vary, schema/revisions, counts и source metadata.
Резкое изменение counts исследовать без выдуманного acceptance threshold.
При regression остановить приёмку, сохранить evidence, approved rollback и повторный
smoke. Не добавлять keep-awake polling, paid monitor, scheduler или admin refresh.
