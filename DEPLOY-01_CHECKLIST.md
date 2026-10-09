# DEPLOY-01 — checklist

10 октября 2026, Europe/Chisinau. **PRE-DEPLOYMENT**.
PASS ограничен указанной средой; production PENDING не заменяется replay.

| Группа | Проверка | Статус | Evidence / следующее действие |
|---|---|---|---|
| 1. Source readiness | Git inventory/fetch/current ancestry | PASS | Safe merge main без source changes; accepted UI history включена |
| 1 | 222 ID / 15 mappings / critical files / storage | PASS | Raw-byte local + frozen portable checks |
| 1 | Static artifact/base path/runtime dependencies | PASS | 13 allowlisted files; project path browser |
| 1 | Fresh-clone reproducibility | PENDING | Final clone verification в report |
| 2. Producer CI | npm ci / 743 tests / 21 included CORS | PASS | LOCAL, 34 test files |
| 2 | App/Worker/publisher typechecks | PASS | LOCAL |
| 2 | lint/build/Worker dry-run/publisher build | PASS | LOCAL; dry-run не deployment |
| 2 | Chromium E2E | PASS | LOCAL 4, fixture APIs |
| 2 | Postgres suite/full hosted CI на release head | PENDING | После Gate A; локальный DB suite не запускался |
| 3. Consumer CI | API/data 66; portable total 69 | PASS | LOCAL; 3 added protection checks |
| 3 | Recorded browser suite | PASS | 24, replay/synthetic failures |
| 3 | Project/failure/recovery browser | PASS | 17, LOCAL; synthetic timeout только в harness |
| 3 | Historical gates | PASS | 398/22 suites до DEPLOY additions, real external prerequisites |
| 3 | Direct local producer boundary | PASS | Local handlers + recorded cache, no route mocks |
| 3 | GitHub-hosted new workflow | PENDING | Source ещё не pushed |
| 4. PR review | Staged diff/file classification/PR bodies | PASS | LOCAL source review |
| 4 | Gate A/push/Draft PRs/independent acceptance | PENDING | Explicit authorization; PRs нет |
| 5. Render | Service/main/auto-deploy/live SHA | PASS | READ-ONLY connector; `735b64f...` live |
| 5 | Live env baseline and exact rollback UI capability | PENDING | Operator private inspection before Gate B |
| 5 | Gate B/producer deployment/new deployed SHA | PENDING | Не разрешено, не выполнялось |
| 6. Pages | Manual immutable-SHA workflow/permissions/package | PASS | LOCAL reviewed config, official action refs verified |
| 6 | Settings/environment/actual URL/Gate C/publication | PENDING | has_pages=false; API/site 404 |
| 6 | Previous production map SHA | NOT APPLICABLE | Initial publication отсутствует |
| 7. Live integration | Existing producer Anul I/II UI | PASS | PRODUCTION LIVE before release |
| 7 | Current API schema/course/revision consistency | PASS | PRODUCTION LIVE before release, 4 HTTP 200 |
| 7 | Current production CORS map access | FAIL | Нет ACAO; deployed producer до MAP-02B |
| 7 | Approved-origin post-deploy GET/OPTIONS/browser | PENDING | После Gate B/C |
| 7 | My Group/All Classes/F1/unmapped/disclaimer/recovery | PASS | LOCAL/replay; public map сценарии PENDING |
| 7 | Cold-start 15-second budget | PENDING | Read samples 69–356 ms; cold start не измерен |
| 8. Mobile | 390×844/320×740/touch/overflow/controls | PASS | Browser emulation; desktop 1440×900 тоже PASS |
| 8 | Actual physical device | PENDING | Не использовался |
| 9. Security | Public GET only/admin isolation/credentials omit | PASS | LOCAL code/tests + pre-release headers |
| 9 | XSS/invalid candidate/LKG/cancel/manual store | PASS | LOCAL unit/browser faults |
| 9 | Runtime no env/photos/cache/evidence | PASS | Explicit allowlist/asset inspection |
| 9 | Inherited dependency audit | FAIL | 14 findings; runtime-only 2 high; lock unchanged |
| 9 | New dependency/auth/admin/pipeline delta | PASS | Ноль изменений; no new app dependencies |
| 9 | Exploitability/remediation decision + hosted security | PENDING | Separate review before Gate B; clean audit не заявляется |
| 10. Final acceptance | 22 production criteria / Gate D | PENDING | Сейчас готовность к Gate A |

[Команды, gates и rollback](DEPLOY-01_RELEASE_PLAN.md).
[Evidence и ограничения](DEPLOY-01_ACCEPTANCE_REPORT.md).
