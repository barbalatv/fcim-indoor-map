# DEPLOY-01 — PR review packet

10 октября 2026. PRs не созданы; Gate A PENDING. Таблица фиксирует validated source/CI
commits; final publication HEAD после documentation-only commit — в отдельном
`GATE-A.md`/`decision-packet.json` evidence packet и итоговом ответе.

| Repository | Base SHA | Source head SHA | Changed files | Tests | Deployment risk |
|---|---|---|---:|---|---|
| Producer | `735b64f28e78eb1de98c36bb68ddf4dc3ecc0426` | `badad94fbf6e2a2caf87e028cda029f993eaadd8` | 8 | 743 + 4 E2E; typecheck/lint/build PASS | main auto-deploy; exact env; inherited audit findings |
| Consumer | `9f1e6a5926ee8579f39bbf641369d0e7857f3004` | `e98ed51f5f1d763799291c91c2286cfc31397f1c` | 57 + 4 release docs | 398 historical; 66 API/data; 69 portable total; 24 replay browser; 17 package browser; local boundary PASS | manual Pages; producer acceptance prerequisite |

Producer: 3 source (2 routes/helper), 2 tests, 3 config/docs (.env.example, README,
runbook); generated runtime assets/fixtures 0. Consumer includes accepted UI diff
отдельно от MAP-02B и release additions: schematic display, historical test
adjustments и UI reports/manifests не скрыты как новая integration работа.
MAP-02A coverage — generated research; 4 public response fixtures/capture — recorded
test data; CHANGES — generated audit data. Ни tests/research/docs, ни photos/logs/env
не входят в 13-file static runtime. Critical geometry/catalog files не менялись.

## Producer Draft PR

Title: `MAP-02B: enable controlled cross-origin timetable API access`

The indoor map cannot read the existing public timetable API across origins.
Add an exact-origin SCHEDULE_MAP_ORIGINS allowlist to schedule/status GET and
bounded GET-only OPTIONS, preserving JSON and existing clients. Empty by default;
no cross-origin credentials/custom headers. No new integration endpoint, parser,
updater, database migration, broker/publisher or authenticated-refresh changes.

Validation: 743 local unit tests (21 included CORS/routes), app/Worker/publisher
typechecks, lint/build, Worker dry-run, publisher build and 4 Chromium E2E PASS.
Hosted CI on this head is pending publication. Production API/UI inspected before
release; new CORS not deployed. Render main auto-deploy requires separate approval.
Inherited audit findings and rollback prerequisites are disclosed in DEPLOY-01 report.

## Consumer Draft PR

Title: `MAP-02B: integrate real FCIM timetable with indoor map`

Integrate both real FCIM courses through existing read-only API, with group/source
selection, revision validation, qualified weekly-plan highlights, safe failures
and event-level All Classes deduplication. Keep independent demo and manual bindings;
unknown rooms remain unmapped. This PR includes the previously accepted UI-01/FIX-A/
FIX-B history missing from main, reconciled through an explicit merge. Geometry,
222 IDs, 15 F1 identities, storage and protected source modules remain fixed.

Include MAP-02A research, recorded public fixtures, tests and portable CI. Manual
Pages workflow publishes an explicit 13-file artifact by immutable SHA; PR/push does
not publish the site. Validation: 398 local historical checks before release-only
additions; 66 API/data; 69 portable total; 24 replay browser; 17 package/recovery
browser; actual local producer browser boundary PASS. Mobile is browser emulation.
Fresh-clone/rollback checks are in final acceptance report. Hosted CI/live map/new
CORS acceptance pending; publish only after producer acceptance and separate Gate C.

## Только после Gate A

```powershell
# Producer checkout
git push -u origin codex/map-02b-producer-integration
gh pr create --draft --base main --head codex/map-02b-producer-integration --title 'MAP-02B: enable controlled cross-origin timetable API access' --body-file 'C:\Users\user\.codex\visualizations\2026\10\10\DEPLOY-01\producer-pr.md'
# Consumer checkout
git push -u origin codex/map-02b-consumer-integration
gh pr create --draft --base main --head codex/map-02b-consumer-integration --title 'MAP-02B: integrate real FCIM timetable with indoor map' --body-file 'C:\Users\user\.codex\visualizations\2026\10\10\DEPLOY-01\consumer-pr.md'
```

Перед push сверить final heads с decision packet. После создания каждого PR attach
actual URL к chat. Не merge автоматически; new hosted CI и independent review
обязательны. Render env и Pages settings сейчас не менять.
