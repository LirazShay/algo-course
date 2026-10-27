# ‏חלק 9C — Failure Destinations & Outcome Contracts: מ־Outcome ל־Fresh Decision

> ‏הפרק הזה משלים את `09B-ENGINE-MAPPING-AND-CANDIDATE-REGISTRY.md`. ‏`09B` מגדיר איך `Behavior Candidate` יכולה להפוך ל־Concrete Broker Order Plan; ‏`09C` מגדיר מה המנוע עושה כאשר הביצוע אינו מסתיים ב־clean full fill. המטרה היא למנוע Retry אוטומטי, fallback סמוי או ערבוב בין execution outcome, capability failure ו־state uncertainty.

---

## ‏9C.1 Outcome אינו Action

‏אירועים כגון:

```text
NO_FILL
PARTIAL
REJECT
UNKNOWN
STALE
```

‏אינם הוראות:

```text
retry
fallback
escalate
cancel
```

‏הם facts/observations שמייצרים **fresh Decision Context**.

> ‏`ENGINE RULE` — שום execution outcome אינו authorizes side effect חדש לבדו. כל side effect חדש חייב לעבור Decision חדשה עם state מעודכן.

---

## ‏9C.2 Outcome Contract קנוני

```text
ExecutionOutcome {
  outcome_class
  purpose                 // ENTRY | EXIT | PROTECTION | RECOVERY
  candidate_id
  execution_mode
  order_identity
  observed_at

  requested_qty
  filled_qty
  remaining_qty
  average_fill_price

  lifecycle_state
  epistemic_uncertainty
  broker_reason
  normalized_reason_code

  reconciled_position
  potentially_executable_qty
  signal_validity
  market_freshness

  failure_destination
  requires_fresh_decision
}
```

‏ה־Outcome Record מתאר מה קרה. ה־Decision Engine מחליטה מה לעשות בעקבותיו.

---

## ‏9C.3 חמש מחלקות Outcome מרכזיות

### ‏`NO_FILL`

```text
accepted / attempted
filled_qty = 0
no evidence of execution
```

‏`NO_FILL` אינה Capability failure כשלעצמה.

‏היא יכולה לנבוע למשל מ־:

```text
price not reached
liquidity disappeared
queue not reached
IOC found no acceptable executable liquidity
midpoint behavior did not match
application TTL expired before useful fill
```

### ‏`PARTIAL`

```text
0 < filled_qty < requested_qty
```

‏זו אינה "חצי הצלחה" בלבד. היא משנה Position Truth ולכן תמיד יוצרת Decision State חדשה.

### ‏`REJECT`

‏Broker/venue לא קיבלו את ה־Concrete Order Plan או חלק מה־materialization.

‏צריך לסווג את ה־reject, לא רק לשמור טקסט שגיאה.

### ‏`UNKNOWN`

‏אין לנו evidence מספיק לדעת מה executable כרגע או האם command מסוים נכנס לתוקף.

‏דוגמאות:

```text
SUBMIT_UNKNOWN
MODIFY_UNKNOWN
CANCEL_UNKNOWN
STATE_INCONSISTENT
```

### ‏`STALE`

‏ה־Order או ה־Intent עדיין עשויים להיות executable מבחינה טכנית, אבל ה־assumptions שהצדיקו אותם כבר אינן תקפות.

```text
signal expired
market snapshot stale
Economic Price Bound recomputed
application_order_ttl expired
candidate policy no longer valid
```

---

## ‏9C.4 Canonical Failure Destinations

‏נשתמש ב־destinations ברמת מנוע, לא ב־Broker-specific retry strings:

```text
REDECIDE_ENTRY
REDECIDE_EXIT
RECONCILE_ORDER
RECONCILE_POSITION
RECONCILE_ORDER_AND_POSITION
REFRESH_CAPABILITY
CANCEL_AND_RECONCILE
PROTECTION_REVIEW
RECOVERY_RECONCILIATION
NO_NEW_SIDE_EFFECT
```

‏ה־destination אינה אומרת מה ה־winner הבא. היא אומרת **איזה truth צריך לרכוש ואיזה decision domain צריך להפעיל מחדש**.

---

## ‏9C.5 `NO_FILL` Contract

### ‏Entry

```text
NO_FILL
→ verify order terminal / non-executable as required
→ refresh market + signal
→ REDECIDE_ENTRY
```

‏תוצאה אפשרית של ה־fresh decision:

```text
NO_TRADE
DEFER
NO_ACTION
select another surviving candidate
```

‏אין automatic aggression.

### ‏Exit

```text
NO_FILL
→ reconciled_position still exists
→ refresh market + risk + protection
→ REDECIDE_EXIT
```

‏`NO_FILL` ביציאה לעולם אינה `FLAT_CONFIRMED`.

### ‏Reason Codes אופייניים

```text
EXEC_NO_FILL_PRICE_NOT_REACHED
EXEC_NO_FILL_NO_ACCEPTABLE_LIQUIDITY
EXEC_NO_FILL_QUEUE_NOT_REACHED
EXEC_NO_FILL_IOC_ZERO
EXEC_NO_FILL_TTL_EXPIRED
```

---

## ‏9C.6 `PARTIAL` Contract

```text
PARTIAL
→ ingest executions
→ update execution_ledger_position
→ compare broker_reported_position
→ derive reconciled_position
→ recompute potentially executable exposure
→ verify protection
→ fresh decision
```

### ‏Entry Partial

```text
PARTIAL_ENTRY
→ position now exists
→ PROTECTION_REVIEW
→ REDECIDE_ENTRY for any remaining intent
```

‏אסור:

```text
remaining_qty
→ blindly resend old candidate
```

### ‏Exit Partial

```text
PARTIAL_EXIT
→ residual position remains
→ RECONCILE_POSITION
→ REDECIDE_EXIT
```

### ‏Reason Codes

```text
EXEC_PARTIAL_USEFUL
EXEC_PARTIAL_BELOW_MIN_USEFUL
EXEC_PARTIAL_REMAINDER_CANCELLED
EXEC_PARTIAL_REMAINDER_WORKING
EXEC_PARTIAL_POSITION_MISMATCH
```

> ‏`ENGINE RULE` — `PARTIAL` תמיד מחייבת quantity truth חדשה לפני Side Effect נוסף.

---

## ‏9C.7 `REJECT` Contract

‏Reject דורשת classification לפני החלטה על candidate אחרת.

```text
REJECT
→ classify reason
→ decide whether failure is:
   materialization-specific
   capability-specific
   parameter-specific
   account/session-specific
   transient infrastructure
   semantic/policy bug
→ update evidence
→ fresh decision
```

### ‏Capability-related reject

‏לדוגמה:

```text
CAPABILITY_ROUTE_UNAVAILABLE
CAPABILITY_PARAMETER_COMBINATION_REJECTED
CAPABILITY_ORDER_TYPE_UNAVAILABLE
CAPABILITY_SESSION_UNAVAILABLE
CAPABILITY_PERMISSION_UNAVAILABLE
```

‏יכולה להוריד/להשהות את capability tuple המתאימה, אך לא להשבית אוטומטית family שלמה בכל scope.

### ‏Materialization/policy reject

```text
MATERIALIZATION_INVALID_COMBINATION
MATERIALIZATION_BOUND_INVALID
MATERIALIZATION_TIF_INVALID
MATERIALIZATION_ATTRIBUTE_CONFLICT
```

‏עשויה להצביע על bug ב־adapter/registry ולא על Broker capability חסרה.

### ‏Infrastructure reject/failure

```text
BROKER_TRANSPORT_FAILURE
BROKER_RATE_OR_SESSION_FAILURE
BROKER_TEMPORARY_UNAVAILABLE
```

‏אינה evidence שה־Behavior עצמה גרועה.

> ‏`ENGINE RULE` — `REJECT` יכולה לשנות Capability Evidence; ‏`NO_FILL` בדרך כלל אינה עושה זאת.

---

## ‏9C.8 `UNKNOWN` Contract

‏כאשר outcome אינה ידועה, אסור לבחור fallback אגרסיבי כדי "לא להיתקע".

```text
UNKNOWN
→ preserve every non-terminal order as POTENTIALLY_EXECUTABLE
→ block risk-increasing side effects unless explicitly bounded by safety policy
→ acquire broker evidence
→ RECONCILE_ORDER_AND_POSITION
→ fresh decision
```

‏Reason Codes:

```text
STATE_SUBMIT_UNKNOWN
STATE_MODIFY_UNKNOWN
STATE_CANCEL_UNKNOWN
STATE_BROKER_LOCAL_MISMATCH
STATE_EXECUTION_RECONCILIATION_INCOMPLETE
STATE_POSITION_RECONCILIATION_INCOMPLETE
```

‏`UNKNOWN` היא epistemic state, לא execution mode ולא reject.

---

## ‏9C.9 `STALE` Contract

‏Stale אומרת שה־Order יכולה להיות technically valid אבל business intent כבר אינו מספיק טרי.

```text
STALE
→ do not widen Economic Price Bound
→ do not continue automatic retry ladder
→ cancel when cancellation is required by policy
→ reconcile possible late effects
→ fresh decision
```

‏Reason Codes:

```text
STALE_SIGNAL_EXPIRED
STALE_APPLICATION_TTL_EXPIRED
STALE_MARKET_SNAPSHOT
STALE_ECONOMIC_BOUND_CHANGED
STALE_EXECUTION_INTENT_SUPERSEDED
STALE_PROTECTION_ASSUMPTION_CHANGED
```

‏Broker-managed repricing אינה פוטרת מ־stale handling: ה־Broker יכולה להמשיך לבצע rule תקפה מבחינתה בזמן שה־local intent כבר מתה.

---

## ‏9C.10 Failure Destination לפי `Application Execution Mode`

| Mode | `NO_FILL` | `PARTIAL` | `REJECT` | `UNKNOWN` | `STALE` |
|---|---|---|---|---|---|
| `PASSIVE` | ‏fresh Entry/Exit decision; waiting אינה automatic retry | ‏reconcile position + fresh decision | ‏classify capability/materialization | ‏reconcile order/position | ‏cancel/reconcile ואז fresh decision |
| `PRICE_IMPROVING` | ‏re-evaluate whether concession still justified | ‏reconcile + recompute remaining economics | ‏classify price/attribute/path failure | ‏freeze new risk + reconcile | ‏cancel/reconcile; old improvement thesis אינה authority |
| `MIDPOINT_SEEKING` | ‏re-evaluate time cost vs price improvement | ‏reconcile + fresh position decision | ‏classify SMART/direct midpoint capability | ‏reconcile external working state | ‏cancel/reconcile; midpoint rule אינה strategy authority |
| `BROKER_MANAGED` | ‏fresh decision; Broker Algo אינה auto-restart | ‏reconcile + fresh decision | ‏classify algo/path/parameter capability | ‏reconcile Broker-managed state | ‏cancel/reconcile local stale intent |
| `AGGRESSIVE_CAPPED` | ‏fresh decision; no automatic wider cap | ‏reconcile before next aggressive attempt | ‏classify route/TIF/price/materialization failure | ‏freeze/reconcile before new aggression | ‏cancel/reconcile; recompute bound |
| `NORMAL_EXIT` | ‏residual position risk review | ‏reconcile residual position | ‏classify then fresh exit decision | ‏position/order reconciliation | ‏fresh exit decision |
| `FAST_EXIT` | ‏fresh risk decision; may change mode only by policy | ‏reconcile residual exposure immediately | ‏classify quickly; protection remains relevant | ‏block blind retry; reconcile | ‏fresh fast/emergency decision |
| `EMERGENCY_REDUCE` | ‏fresh emergency decision from current risk facts | ‏recompute residual position immediately | ‏classify failure without assuming same path again | ‏safety/recovery reconciliation | ‏refresh risk facts; no stale emergency ladder |

> ‏`ENGINE RULE` — Failure Destination היא contract של Mode/Purpose; היא אינה hard-coded "next order type".

---

## ‏9C.11 Fallback ו־Escalation אינם Failure Destinations

‏נפריד:

```text
Failure Destination
= where control returns after an outcome

Fallback
= alternative materialization/candidate considered after fresh decision because a path is unavailable/invalid

Escalation
= fresh decision increases urgency/aggression because market/risk state changed
```

‏לכן אסור:

```text
REJECT MIDPRICE
→ submit MARKETABLE_LIMIT_IOC
```

‏בלי:

```text
classify reject
refresh capability/state
run fresh decision
```

---

## ‏9C.12 Canonical Reason-Code Namespaces

‏Reason code צריכה לתאר **למה**, בעוד disposition/destination מתארות **מה עושים עכשיו**.

```text
ELIM_*          candidate eliminated before materialization
CAPABILITY_*    capability/enablement/scope problem
MATERIALIZATION_* concrete plan construction/validation problem
EXEC_*          observed execution outcome
STATE_*         epistemic/reconciliation problem
STALE_*         intent/data/time freshness problem
RISK_*          position/protection/risk constraint
SYSTEM_*        operating-mode / infrastructure constraint
```

‏דוגמאות:

```text
ELIM_SIGNAL_TOO_OLD
ELIM_ECONOMIC_BOUND_UNREACHABLE
ELIM_EXIT_FEASIBILITY_INSUFFICIENT

CAPABILITY_NOT_PRODUCTION_ENABLED
CAPABILITY_ROUTE_SCOPE_MISMATCH
CAPABILITY_SESSION_UNAVAILABLE

MATERIALIZATION_REQUIRED_ATTRIBUTE_UNAVAILABLE
MATERIALIZATION_INVALID_PARAMETER_COMBINATION

EXEC_NO_FILL_IOC_ZERO
EXEC_PARTIAL_USEFUL
EXEC_REJECTED_BY_BROKER

STATE_CANCEL_UNKNOWN
STATE_POSITION_MISMATCH

STALE_APPLICATION_TTL_EXPIRED
STALE_SIGNAL_EXPIRED

RISK_WORST_CASE_EXPOSURE_EXCEEDED
RISK_PROTECTION_INSUFFICIENT

SYSTEM_NOT_READY
SYSTEM_RECOVERING
```

---

## ‏9C.13 Selection Reason Codes נפרדים מ־Elimination Reason Codes

‏ל־winner נרשום reason שמסביר **למה survivor הזה נבחר**:

```text
SELECT_PASSIVE_PRICE_IMPROVEMENT_WORTH_WAIT
SELECT_POST_ONLY_PASSIVE_CONSTRAINT_REQUIRED
SELECT_MIDPOINT_SPREAD_SAVING_WORTH_TIME
SELECT_BROKER_MANAGED_REPRICING_PREFERRED
SELECT_AGGRESSIVE_SHORT_SIGNAL_LIFE
SELECT_FAST_EXIT_RISK_REDUCTION_PRIORITY
SELECT_EMERGENCY_REDUCE_HARD_RISK_STATE
```

‏ול־Candidate שנפסלה:

```text
ELIM_CAPABILITY_DISABLED
ELIM_ROLLOUT_NOT_LIVE
ELIM_TTL_TOO_SHORT
ELIM_BOUND_INCOMPATIBLE
ELIM_ROUTE_UNAVAILABLE
ELIM_PARTIAL_FILL_NOT_USEFUL
ELIM_EXIT_FEASIBILITY_INSUFFICIENT
```

> ‏`ENGINE RULE` — Reason code אינה score. היא audit explanation ל־elimination/selection שכבר בוצעה לפי Policy.

---

## ‏9C.14 Broker Error Code אינו Reason Code קנוני

‏נשמור את ה־raw Broker code/message בנפרד:

```text
broker_error_code
broker_error_message
```

‏ונמפה אותו ל־:

```text
normalized_reason_code
failure_destination
capability_evidence_effect
```

‏כך שינוי ב־Broker wording אינו משנה את semantic contract של המנוע.

---

## ‏9C.15 `CapabilityEvidenceEffect`

‏Outcome יכולה להשפיע על Capability Evidence בדרכים שונות:

```text
NONE
POSITIVE_RUNTIME_EVIDENCE
NEGATIVE_SCOPE_EVIDENCE
PARAMETER_COMBINATION_REJECTED
TEMPORARY_INFRASTRUCTURE_ONLY
REQUIRES_MANUAL_REVIEW
```

‏דוגמאות:

```text
NO_FILL
→ normally NONE

accepted working order
→ POSITIVE_RUNTIME_EVIDENCE

route-specific rejection
→ NEGATIVE_SCOPE_EVIDENCE or PARAMETER_COMBINATION_REJECTED

socket failure
→ TEMPORARY_INFRASTRUCTURE_ONLY
```

‏כך `Capability Resolver` אינה "לומדת" בטעות מ־market outcome.

---

## ‏9C.16 Candidate Rollout Failure Policy

### ‏`DISABLED`

‏אינה נוצרת כלל כ־live candidate.

### ‏`SHADOW_ONLY`

‏Outcome היא hypothetical/replay observation בלבד; אין Broker side effect שנוצר בשם Candidate זו.

### ‏`LIVE_ENABLED`

‏יכולה materialize רק אם capability requirements הן `PRODUCTION_ENABLED`.

‏לאחר repeated semantic rejection אפשר להעביר Candidate ל־:

```text
LIVE_ENABLED
→ SHADOW_ONLY
```

‏או:

```text
→ DISABLED
```

‏אבל transition כזה הוא governance/policy decision, לא callback יחיד אוטומטי.

---

## ‏9C.17 Purpose-Aware Destination

‏אותו Outcome מקבל destination שונה לפי Purpose.

### ‏`ENTRY + NO_FILL`

```text
REDECIDE_ENTRY
possibly NO_TRADE
```

### ‏`EXIT + NO_FILL`

```text
REDECIDE_EXIT
residual position still exists
```

### ‏`PROTECTION + REJECT`

```text
PROTECTION_REVIEW
risk severity elevated
```

### ‏`RECOVERY + UNKNOWN`

```text
RECOVERY_RECONCILIATION
READY prohibited until invariants pass
```

‏לכן key של policy צריך לכלול לפחות:

```text
purpose + outcome_class + uncertainty + position/protection state
```

---

## ‏9C.18 Retry Budget אינו Retry Loop

‏אפשר להגדיר budgets כגון:

```text
max_attempts_per_decision_window
max_cancel_replace_count
max_cumulative_price_concession
max_broker_algo_restarts
```

‏אבל כל attempt עדיין מחייב fresh facts.

```text
budget remaining
!=
authorization to repeat stale plan
```

‏Budget היא upper bound על side effects; היא אינה control loop בפני עצמה.

---

## ‏9C.19 Telemetry Contract

```text
outcome_class
purpose
execution_mode
candidate_id
order_internal_id
broker_order_id
perm_id
normalized_reason_code
broker_error_code
failure_destination
capability_evidence_effect
filled_qty
remaining_qty
reconciled_position_before
reconciled_position_after
potentially_executable_qty
signal_age_ms
application_order_age_ms
working_order_age_ms
market_snapshot_age_ms
capability_enablement_state
candidate_rollout_state
redecision_id
```

‏כך אפשר לשאול:

```text
Which candidates fail because of market no-fill?
Which fail because of capability/materialization?
Which outcomes create UNKNOWN states?
How often partial fills improve or worsen final execution?
How often fallback follows a true capability failure versus mere no-fill?
```

---

## ‏9C.20 Acceptance Tests

```text
1. NO_FILL never disables a capability by itself.
2. REJECT is classified before any fallback candidate is materialized.
3. PARTIAL always updates execution/position truth before the next side effect.
4. ENTRY + NO_FILL may end in NO_TRADE.
5. EXIT + NO_FILL never implies FLAT_CONFIRMED while reconciled_position != 0.
6. UNKNOWN never triggers blind retry or blind escalation.
7. Every non-terminal order remains in potentially executable exposure during UNKNOWN.
8. STALE never widens Economic Price Bound automatically.
9. Broker-managed repricing remains cancellable/reconcilable when local intent becomes stale.
10. Failure destination never names a specific next Broker Order Type.
11. Fallback requires a fresh decision after capability/materialization failure.
12. Escalation requires fresh market/risk facts, not merely elapsed time.
13. Raw broker error and normalized reason code are stored separately.
14. Capability evidence changes only when the outcome actually carries capability evidence.
15. SHADOW_ONLY never produces broker side effects.
16. LIVE_ENABLED alone is insufficient without PRODUCTION_ENABLED capabilities.
17. Same facts + same policy + same purpose yield the same normalized outcome and destination.
```

---

## ‏9C.21 Practitioner Rule

‏הדרך הקצרה לזכור:

```text
NO_FILL
= market/execution outcome

REJECT
= acceptance/materialization outcome

PARTIAL
= new position state

UNKNOWN
= missing truth

STALE
= old intent no longer authorized
```

‏ולכל אחד מהם:

```text
observe
→ normalize reason
→ reconcile what changed
→ return to the correct decision domain
```

‏לא:

```text
observe failure
→ send a more aggressive order
```

---

# ‏Checkpoint — סוף חלק 9C

‏הוגדר contract אחיד ל־`NO_FILL`, ‏`PARTIAL`, ‏`REJECT`, ‏`UNKNOWN` ו־`STALE`; נוספו Failure Destinations purpose-aware, ‏Reason-Code namespaces, ‏Capability Evidence effects ו־Acceptance Tests. ‏Outcome אינה Retry command, ‏Capability failure אינה Market no-fill, ו־fresh Decision נשארת השער היחיד לכל Side Effect חדש.