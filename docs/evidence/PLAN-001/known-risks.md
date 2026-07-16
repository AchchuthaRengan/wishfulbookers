# Known Risks — PLAN-001

## Unresolved

| Risk ID  | Severity | Risk                                                                                                  | User/system impact                     | Mitigation/owner                                                                       | Release blocking |
| -------- | -------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------- | ---------------- |
| RISK-001 | High     | Hosted run 29481673124 failed because the pnpm shim was unavailable; the focused repair is not rerun. | The full hosted lane has not executed. | Independently review the shim repair, publish it, and rerun the pull-request workflow. | Yes              |

## Accepted residual risk

| Risk ID | Approval | Rationale | Review trigger |
| ------- | -------- | --------- | -------------- |
