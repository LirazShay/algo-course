# ‏51 — Recommendation Sheet: Execution Engine Best Practices

> ‏מקור לימודי עיקרי: `../51-EXECUTION-ENGINE-BEST-PRACTICES.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline ארכיטקטוני ותפעולי ל־`Execution Engine` של רובוט `Short-Horizon Momentum`, כך ש־`Order Intent` יתורגם לפעולות Broker בצורה idempotent, auditable, recoverable ושמרנית תחת uncertainty; תוך ניהול נכון של partial fills, pending exposure, cancel/replace races, unknown effects, reconciliation, parent/child orders, risk reservations ו־restart/reconnect.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי ואינו מבטיח רווח.

---

## ‏1. Decision

‏ה־Execution Engine לא יוגדר כ־wrapper ששולח Order ומחכה לתשובה.

‏הוא יוגדר כ־**durable state machine סביב side effects חיצוניים שאינם exactly-once**.

‏ה־Baseline:

```text
Strategy Decision
→ Immutable Order Intent
→ Risk Reservation
→ Pre-Submit Revalidation
→ Execution Policy
→ Durable Attempt Record
→ Broker Command
→ Broker Events / Executions
→ Canonical Execution State
→ Position / Pending Exposure
→ Reconciliation
→ Exit / Flat
```

‏העיקרון המחייב:

```text
Intent != Order
Sent != Accepted
Accepted != Working
Working != Filled
Timeout != Reject
CancelRequested != Canceled
Local expectation != Broker truth
```

‏כאשר לא ניתן להוכיח אם side effect חיצוני התרחש:

```text
UNKNOWN_EFFECT
```

‏הוא state עסקי אמיתי — לא Exception טכני שנפתר ב־retry אוטומטי.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Intent semantic ונפרד מ־Broker Order

‏ה־Strategy מגדירה **מה היא רוצה להשיג**, לא את כל פרטי ה־Broker API.

‏`OrderIntent` יכלול לפחות:

```text
intent_id
decision_id
instrument_id
side_or_target_position_semantics
target_qty_or_target_position
max_price_or_min_price
max_slippage
urgency
signal_time
signal_ttl
execution_deadline
strategy_version
execution_policy_version
risk_snapshot_id
market_generation
execution_epoch
reason_code
```

‏Broker Order הוא implementation detail שנגזר מה־Intent ומה־Execution Policy.

### ‏`P0 — Required`: ‏`IntentId` הוא business idempotency anchor

‏אותו Intent אינו רשאי ליצור exposure כפול בגלל:

```text
retry
timeout
reconnect
process restart
duplicate message
```

‏נשמור correlation:

```text
IntentId
→ AttemptId
→ ClientOrderId
→ BrokerOrderId
→ ExecutionIds
```

‏אותו business intent יכול להכיל Attempts שונים, אך כל Attempt מזוהה בנפרד.

### ‏`P0 — Required`: ‏Exactly-once אינו assumption

‏Scenario בסיסי:

```text
send order
→ broker receives
→ ACK lost
→ client timeout
```

‏במצב כזה אין לנו Evidence שהפקודה נכשלה.

‏לכן:

```text
Timeout after state-changing command
=> UNKNOWN_EFFECT
=> reconcile before retry
```

### ‏`P0 — Required`: Durable Journal לפני Side Effect משמעותי

‏לפני Submit/Cancel/Replace משמעותי נשמור record durable מספיק שמאפשר Recovery.

‏Baseline event journal:

```text
IntentCreated
RiskReserved
AttemptCreated
SubmitAttempted
SubmitAcknowledged
BrokerOrderObserved
PartialFillObserved
CancelRequested
CancelConfirmed
ReplaceRequested
FillObserved
ReconciliationStarted
ReconciliationCompleted
IntentTerminal
```

‏דפוס ברירת המחדל:

```text
persist intent / attempt / command intent
→ commit
→ invoke broker side effect
```

‏`Outbox`-style pattern הוא `P2` אפשרי כאשר הוא מפשט consistency, אך אינו פותר unknown external effects לבדו.

### ‏`P0 — Required`: Canonical Order State Machine

‏Broker statuses ממופים ל־canonical semantics משלנו.

‏Baseline אפשרי:

```text
CREATED
RISK_RESERVED
SUBMITTING
ACKNOWLEDGED
WORKING
PARTIALLY_FILLED
CANCEL_REQUESTED
REPLACE_PENDING
CANCELED
FILLED
REJECTED
EXPIRED_LOCAL
UNKNOWN_EFFECT
RECONCILING
TERMINAL
```

‏השמות יכולים להשתנות; transitions חייבים להיות explicit, versioned וניתנים לבדיקה.

### ‏`P0 — Required`: Execution facts גוברים על local expectation

‏כאשר יש conflict:

```text
Authoritative execution / fill facts
> broker order summaries where semantically weaker
> local expected state
```

‏ה־mapping המדויק תלוי ב־Broker capability, אך Local State אינו רשאי למחוק Fill מוכח בגלל callback ישן.

### ‏`P0 — Required`: Duplicate / Out-of-Order Event Handling

‏אותו execution callback יכול להגיע פעמיים או לפני status callback.

‏כל ingestion path חייב להיות idempotent.

‏נשתמש, לפי capability, ב־:

```text
broker_execution_id
broker_order_id + fill identity
stable event identity
```

‏Invariant:

```text
same authoritative execution event
can change position exactly once
```

### ‏`P0 — Required`: Partial Fill הוא state רגיל

```text
Requested = 100
Filled = 37
Remaining = 63
```

‏מכאן:

```text
Actual Exposure = 37
Potentially Live Exposure = up to 63 more
```

‏ה־Strategy אינה רשאית להמשיך להתנהג כאילו exposure הוא 0 או 100 בלבד.

### ‏`P0 — Required`: Pending Exposure הוא חלק מ־Risk

‏נחשב לפחות:

```text
working orders
cancel-pending orders
replace overlap
unknown-effect orders
active child orders
```

‏Risk Reservation חייב לכסות worst plausible case.

‏Invariant מרכזי:

```text
FilledQty + PotentiallyLiveQty
<= MaximumAuthorizedExposure
```

‏אלא אם policy מפורשת ומאומתת מגדירה אחרת.

### ‏`P0 — Required`: ‏`CancelRequested != Canceled`

‏עד confirmation/reconciliation אמינים, Order ששלחנו לו Cancel עדיין potentially live.

‏`Cancel/Fill Race` הוא Scenario בסיסי ולא edge case.

### ‏`P0 — Required`: Replace אינו assumed atomic

‏Semantics של Replace משתנים לפי Broker/Venue/API.

‏לכן המודל המקומי מתייחס ל־old generation ול־new generation באופן שמרני עד שניתן להוכיח מה עדיין live.

‏אין:

```text
cancel old
→ immediately forget it
→ submit full new qty
```

‏כאשר cancel state עדיין ambiguous.

### ‏`P1 — Preferred Default`: Target-Position semantics עבור Position Controller

‏במקום לחשוב רק על raw commands:

```text
BUY +63
```

‏נעדיף במקרים המתאימים לחשוב:

```text
Desired Position = +100
Actual Position = +37
Potential Live Buy = +20
New Safe Delta = +43
```

‏כך retries/reprices/reconnects אינם מתורגמים בטעות ל־duplicate exposure.

### ‏`P0 — Required`: Reconciliation כחלק מה־Runtime

‏Reconciliation אינו רק Startup feature.

‏מפעילים אותו לפחות לאחר:

```text
startup
reconnect
UNKNOWN_EFFECT
ambiguous timeout
orphan order
position mismatch
unexpected broker state
safety incident before resume
```

‏הוא משווה:

```text
open orders
recent executions/fills
positions
account/exposure state when relevant
local journal
stable identifiers
```

### ‏`P0 — Required`: Restart/Reconnect אינם מוחקים Broker Reality

‏אחרי Restart:

```text
load durable journal
→ connect/authenticate broker
→ verify environment/account
→ fetch orders/executions/positions
→ reconcile
→ resolve unknowns/orphans/mismatches
→ validate readiness
→ allow new entries last
```

‏אין `READY` לפני reconciliation.

### ‏`P0 — Required`: Unknown Position / Orphan / Mismatch חוסמים New Risk

```text
unknown actual exposure
or orphan order
or unresolved position mismatch
=> BLOCK_NEW_ENTRIES
```

‏Risk-reducing actions נשמרות כאשר הן אפשריות ובטוחות.

### ‏`P0 — Required`: Execution Epoch / stale-intent protection

‏לאחר Restart, Recovery, Kill event או ownership transition ניתן לקדם:

```text
execution_epoch
```

‏Intent ישן אינו מורשה לחצות epoch בלי revalidation מפורש.

### ‏`P0 — Required`: Last-Mile Pre-Submit Revalidation

‏מיד לפני Side Effect שמגדיל Risk בודקים מחדש:

```text
intent still valid
signal TTL alive
market tradable
price protection valid
risk reservation valid
actual position known
pending exposure known
no conflicting live order
execution epoch current
safety permits entry
required capability supported
```

‏אם אחד מ־P0 facts אינו ידוע:

```text
NO_TRADE / RECONCILE
```

### ‏`P0 — Required`: Hard Price Protection

‏Execution Policy אינה רשאית chase ללא גבול.

‏לכל tactic שמגדיל Exposure נדרש boundary מפורש כגון:

```text
max buy price
min sell price
max slippage
max chase distance
order TTL
```

‏`Marketable Limit` נשאר Reference safety primitive מהשלבים הקודמים, אך אינו מבטיח Fill ואינו מבטל Partial-Fill semantics.

### ‏`P1 — Preferred Default`: Execution Policy נפרדת מה־Core

‏Execution Policy רשאית לבחור:

```text
passive / aggressive
price
TTL
reprice threshold
max attempts
fallback
route intent
broker algo
```

‏אבל אינה רשאית לעקוף:

```text
Risk
Safety
Pending Exposure
Hard Price Bound
Execution Epoch
Capability Contract
```

### ‏`P0 — Required`: Capability Contract — no silent semantic fallback

‏לפני שימוש ב־:

```text
IOC
Pegged
Midpoint
Post-Only
Native Bracket/OCA
Client-defined IDs
Fractional quantity
specific routing
```

‏ה־Adapter מאמת capability בפועל.

‏Unsupported semantic:

```text
explicit reject
or
explicit pre-approved fallback with different policy/version
```

‏לעולם לא Silent Downgrade.

### ‏`P0 — Required`: Parent / Child aggregation

‏כאשר Intent מיושם באמצעות כמה Child Orders:

```text
Parent Intent
→ Child A
→ Child B
→ Child C
```

‏Risk, FilledQty, PendingExposure ו־Reconciliation מחושבים ברמת business intent, לא כאילו כל Child הוא Strategy עצמאית.

### ‏`P0 — Required`: Exit / Flatten הם semantic targets

‏`Flatten` מוגדר:

```text
Desired Position = 0
```

‏לא:

```text
Sell remembered quantity
```

‏אם Position משתנה בזמן התהליך בגלל Late Fill, target remains 0 וה־controller מחשב מחדש את required delta.

### ‏`P0 — Required`: Exit / Risk Reduction מקבלים Priority

‏ב־backpressure:

```text
Safety / Flatten
→ Cancel stale risk
→ Exit
→ Reconcile unknown
→ Entry
→ Background diagnostics
```

‏Entry יכול להיות `NO_TRADE`; Exposure קיים דורש טיפול.

### ‏`P0 — Required`: Single Logical Execution Owner

‏ל־KISS, ה־Baseline הוא writer לוגי יחיד ל־critical account/order state.

‏Locks מקומיים אינם Ownership proof.

‏אם בעתיד יש active/passive/multi-instance:

```text
lease + fencing / durable ownership
```

‏הם `P3/P4` עד שיש צורך מוכח.

### ‏`P0 — Required`: Split-Brain הוא hard safety failure

‏שני executors שחושבים שהם רשאים ליצור side effects הוא מצב `BLOCK_NEW_ENTRIES / MANUAL_REQUIRED` לפי severity.

‏Heartbeat לבדו אינו fencing.

### ‏`P0 — Required`: Environment / Account Guard

‏Execution Readiness כולל:

```text
expected environment
expected account identity
broker endpoint/session identity
paper/live isolation
strategy/config version
```

‏Critical mismatch נכשל closed.

---

## ‏3. Why

‏Execution הוא המקום שבו Intent פנימי הופך ל־side effect חיצוני שאי אפשר להחזיר ב־transaction מקומי פשוט.

‏Failure surface אופייני:

```text
submit + timeout
cancel + fill
replace + overlap
partial fill + signal death
restart + working order
reconnect + late fill
manual broker action + local stale state
```

‏לכן correctness נבנה סביב:

```text
stable identity
explicit uncertainty
durable evidence
pending exposure
reconciliation
conservative capabilities
```

‏ולא סביב Happy Path בלבד.

---

## ‏4. Ownership Boundaries

### ‏Strategy / Decision owns

```text
whether opportunity is desired
target semantic intent
signal evidence
absolute TRADE / NO_TRADE decision
```

### ‏Risk owns

```text
exposure limits
capital/risk reservation
permission to create/increase risk
```

### ‏Safety owns

```text
system modes
kill / exit-only / block-new-entry authority
hard invariants
```

### ‏Execution Policy owns

```text
order tactic
price tactic
TTL / repricing
routing intent
fallback policy
```

### ‏Execution Core owns

```text
intent lifecycle
attempt lifecycle
idempotency
broker command orchestration
canonical order state
pending exposure
fill application
parent/child aggregation
reconciliation
execution readiness
```

### ‏Broker Adapter owns

```text
provider-specific API translation
raw codes/status mapping
capability discovery
transport/session behavior
```

### ‏Position Controller owns

```text
desired position
actual position
potential position
safe delta to target
```

‏Implementation יכול לאחד רכיבים פיזית, אבל semantic ownership נשאר מפורש.

---

## ‏5. Canonical Contracts

### ‏5.1 `OrderIntent`

```text
intent_id
decision_id
instrument_id
intent_kind: ENTER | ADD | REDUCE | EXIT | FLATTEN
position_target?
requested_qty?
max_authorized_qty
price_protection
max_slippage
urgency
signal_time
signal_valid_until
execution_deadline
market_generation
execution_epoch
strategy_version
risk_snapshot_id
risk_reservation_id
execution_policy_version
created_at
```

### ‏5.2 `ExecutionAttempt`

```text
attempt_id
intent_id
attempt_number
command_kind
client_order_id
broker_order_id?
parent_order_id?
replacement_generation
requested_qty
requested_price
order_type
route_intent
created_at
sent_at?
ack_at?
state
retry_class
idempotency_key
```

### ‏5.3 `CanonicalOrderState`

```text
attempt_id
canonical_status
broker_status_raw
requested_qty
filled_qty
remaining_qty
potentially_live_qty
avg_fill_price?
last_broker_event_time
last_local_receive_time
unknown_effect
cancel_pending
replace_pending
state_version
```

### ‏5.4 `ExecutionFact`

```text
execution_id
attempt_id
intent_id
broker_order_id
side
qty
price
venue?
liquidity_flag?
broker_event_time?
received_at
commission?
fee_status
correction_status
```

### ‏5.5 `PendingExposure`

```text
actual_position_qty
working_entry_qty
cancel_pending_qty
replace_overlap_qty
unknown_effect_qty
working_exit_qty
worst_case_position_if_all_live_orders_fill
```

### ‏5.6 `RiskReservation`

```text
reservation_id
intent_id
reserved_qty
reserved_notional
reserved_risk
created_at
released_qty
state
```

### ‏5.7 `ExecutionReadiness`

```text
broker_connected
broker_authenticated
account_verified
environment_verified
orders_reconciled
positions_reconciled
unknown_effect_count
orphan_order_count
position_mismatch_count
persistence_healthy
risk_ready
safety_allows_entries
market_status_known
execution_epoch
ready_for_entry
reason_codes
verified_at
```

### ‏5.8 `ExecutionDecisionRecord`

```text
intent_id
attempt_id?
action: SUBMIT | CANCEL | REPLACE | WAIT | RECONCILE | NO_TRADE
reason_codes
pre_submit_snapshot_id
risk_reservation_id
pending_exposure_before
pending_exposure_after_expected
price_bound
policy_version
capability_snapshot_id
execution_epoch
decided_at
```

---

## ‏6. Retry / Unknown-Effect Taxonomy

‏Operations מסווגות מראש:

```text
SAFE_TO_RETRY
RETRY_WITH_IDEMPOTENCY
RECONCILE_BEFORE_RETRY
NEVER_AUTO_RETRY
```

### ‏Typical query

```text
FetchOpenOrders
FetchPositions
FetchExecutions
```

‏לרוב קרובה יותר ל־`SAFE_TO_RETRY`, בכפוף ל־provider semantics.

### ‏State-changing command

```text
Submit
Cancel
Replace
Flatten child command
```

‏Timeout או disconnect באמצע בדרך כלל דורשים:

```text
RECONCILE_BEFORE_RETRY
```

‏ולא resend blind.

### ‏Retry guard

‏לפני Retry state-changing:

```text
same intent?
same execution epoch?
original effect resolved?
no conflicting live order?
pending exposure still within limit?
signal/exit objective still valid?
```

---

## ‏7. Partial Fill / Cancel / Replace

### ‏7.1 Partial Fill

‏כל Partial Fill:

```text
updates actual position
reduces remaining intent quantity
updates pending exposure
can arm exit/risk logic
can invalidate remaining entry if signal died
```

### ‏7.2 Signal dies after Partial Fill

‏Baseline:

```text
stop increasing exposure
→ request cancel of remaining entry
→ treat filled quantity as real position
→ execute exit/risk policy
```

### ‏7.3 Cancel/Fill Race

‏State remains potentially live until facts prove otherwise.

‏Late fill after Cancel Request is valid execution evidence.

### ‏7.4 Replace Generation

```text
intent_id
replacement_generation = 0..N
old attempt state
new attempt state
worst-case overlap
```

‏Risk Reservation covers overlap until old generation is definitively resolved.

### ‏7.5 Repricing budget

```text
max_reprices
min_price_move
min_time_between_reprices
max_chase_distance
order_ttl
execution_deadline
```

‏המספרים נקבעים מחקרית.

---

## ‏8. Position Controller

‏ה־Position Controller פותר:

```text
Desired Position
vs
Actual Position
vs
Potential Position
```

‏Baseline example:

```text
Desired = +100
Actual = +37
Potential additional live buy = +20
Maximum safe new buy = +43
```

‏`Buy additional 63` אינו שקול אוטומטית ל־`Target +100`.

### ‏Flatten

```text
Desired Position = 0
```

‏כל Late Fill מחושב מחדש מול Target 0.

### ‏Position mismatch

```text
Local != Broker
=> freeze new risk
=> broker/account truth drives reconciliation
=> rebuild local state
```

---

## ‏9. Reconciliation Contract

‏Pipeline:

```text
Fetch authoritative open orders
→ Fetch executions/fills
→ Fetch positions
→ Fetch account/exposure state if needed
→ Map stable IDs
→ Detect orphan/missing orders
→ Rebuild canonical lifecycle
→ Recalculate actual/pending exposure
→ Validate invariants
→ Emit reconciliation result
```

### ‏Outcomes

```text
RECONCILED
RECONCILED_WITH_CORRECTIONS
BLOCKED_UNKNOWN_ORDER
BLOCKED_ORPHAN_ORDER
BLOCKED_POSITION_MISMATCH
BLOCKED_ACCOUNT_MISMATCH
MANUAL_REQUIRED
```

### ‏Missing local order

```text
Local says WORKING
Broker lookup says not present
```

‏אינו אוטומטית `CANCELED`.

‏נבדקים executions/history/correlation לפני conclusion.

### ‏Orphan order

‏Broker order ללא local legal Intent הוא safety incident.

‏אין adopt אוטומטי.

---

## ‏10. External / Manual Broker Activity

‏המערכת צריכה policy ל־:

```text
manual broker order
external order
manual position change
external position in same symbol/account
```

‏Baseline:

```text
observe
→ detect divergence
→ block conflicting automation
→ require explicit reconciliation/adoption policy
```

‏אין ownership assumption על Order שלא נוצר אצלנו.

---

## ‏11. Backpressure / Pacing

### ‏11.1 Execution queues are safety-relevant

‏נמדוד:

```text
command_queue_depth
oldest_command_age
callback_queue_depth
oldest_callback_age
processing_lag
```

### ‏11.2 Priority

```text
Safety / risk reduction
→ cancel stale risk
→ exits
→ reconcile unknown
→ entries
→ diagnostics
```

### ‏11.3 Pacing

‏Broker/API limits הם time-sensitive capability.

‏לכן נשמור:

```text
broker_pacing_profile_version
message_budget
current_usage
throttle_state
```

‏ולא hard-code universal number במסמך זה.

### ‏11.4 Overload response

‏כאשר execution command/callback processing אינו בתוך budget:

```text
block new entries
preserve risk-reducing path
```

‏לא queue infinite stale entries.

---

## ‏12. Observability / Evidence

### ‏12.1 Stable Correlation

```text
run_id
decision_id
intent_id
attempt_id
client_order_id
broker_order_id
execution_id
position_id
recovery_id
incident_id
```

### ‏12.2 Order timeline

```text
Decision
→ Intent
→ Reservation
→ Submit Attempt
→ ACK
→ Working
→ Fill(s)
→ Cancel/Replace
→ Terminal order state
→ Position
→ Exit
→ Flat
```

### ‏12.3 Timestamp domains

```text
market_event_time
local_receive_time
decision_time
intent_time
submit_time
broker_ack_time
execution_time
local_fill_receive_time
cancel_request_time
cancel_confirm_time
flat_time
```

### ‏12.4 Core latency metrics

```text
decision_to_submit
submit_to_ack
submit_to_first_fill
first_to_last_fill
cancel_to_confirmation
exit_intent_to_flat
```

‏נמדוד distributions, במיוחד `P95/P99`, ולא Average בלבד.

### ‏12.5 Reliability metrics

```text
unknown_effect_rate
reconciliation_count
reconciliation_duration
reconciliation_mismatch_rate
orphan_order_rate
position_mismatch_rate
duplicate_submit_prevented_count
duplicate_fill_prevented_count
cancel_fill_race_rate
```

### ‏12.6 Execution quality

```text
fill_rate
partial_fill_rate
time_to_first_fill
time_to_full_fill
time_to_flat
slippage
effective_spread
markout
missed_opportunity
reprice_count
cancel_rate
```

‏נחתוך לפחות לפי liquidity/spread/regime/order type/policy/signal age/size, ובהמשך route כאשר attribution אמין.

### ‏12.7 Near misses

‏נשמור גם:

```text
duplicate submit blocked
stale intent blocked
price cap prevented bad chase
orphan found before entry
unknown effect contained
```

‏Safety success הוא Evidence.

---

## ‏13. Execution RCA

‏RCA מתחיל ב־timeline עובדתי.

‏שאלת מפתח:

```text
What was the first divergence from the expected execution path?
```

‏Failure codes:

```text
EX_DUPLICATE_INTENT
EX_DUPLICATE_SUBMIT_BLOCKED
EX_UNKNOWN_EFFECT
EX_BROKER_REJECT
EX_STALE_SIGNAL
EX_PRICE_BOUND_FAILED
EX_CANCEL_FILL_RACE
EX_PARTIAL_FILL_ABORT
EX_ORPHAN_ORDER
EX_POSITION_MISMATCH
EX_RECONCILIATION_REQUIRED
EX_CAPABILITY_MISMATCH
EX_PENDING_EXPOSURE_LIMIT
EX_TIMEOUT_AMBIGUOUS
EX_REPLACE_OVERLAP
EX_EXIT_DELAYED
EX_SPLIT_BRAIN
EX_ACCOUNT_MISMATCH
EX_PACING_BACKPRESSURE
```

‏Incident packet יכלול:

```text
intent / attempt records
raw broker codes/payload snippets when safe
open-order snapshot
execution ledger
position snapshot
risk reservation
pending exposure
pre-submit market snapshot
post-fill markouts
queue/pacing state
versions / environment / account fingerprint
```

---

## ‏14. Testing Strategy

### ‏`P0`: Happy Path

```text
Intent
→ Risk reserve
→ Submit
→ ACK
→ Fill
→ Position
→ Exit
→ Flat
```

### ‏`P0`: Boundary Matrix

```text
Duplicate Intent
ACK lost after broker accepted
Partial Fill then Cancel
Fill during Cancel
Replace overlap
Duplicate Fill callback
Out-of-order Fill before status
Restart with Working Order
Restart with Fill while down
Orphan Order
Position Mismatch
Disconnect during Entry
Disconnect during Exit
Permanent Reject
Unsupported Capability
Stale Intent
Price runs away
Kill during Partial Fill
Late Fill after Strategy abandoned entry
Manual broker order
Split Brain
Persistence failure before/after command boundary
```

### ‏`P0`: Property Tests

```text
same execution fact is applied once
position equals authoritative execution-derived state after reconciliation
filled + potentially_live <= authorized exposure
UNKNOWN_EFFECT never becomes CANCELED silently
CancelRequested never means order forgotten
new risk blocked when safety/risk forbids
restart cannot turn unknown exposure into flat
same state + same event + same versions => same reducer result
terminal state cannot regress without explicit correction semantics
```

### ‏Replay

‏אותו ordered semantic event sequence חייב להחזיר אותו canonical execution state.

### ‏Fault Injection

```text
network delay
ACK drop
duplicate callback
out-of-order callback
process crash
storage write failure
broker disconnect
slow callback consumer
reconnect during partial fill
```

### ‏Soak

‏אין:

```text
unbounded queue growth
memory leak
state drift
duplicate effects
unresolved reservation leak
```

---

## ‏15. Deterministic Core

‏Preferred design:

```text
Current Execution State
+
Execution Event
→
New State
+
Commands / Effects to perform
```

‏Broker/network/storage/clock side effects נשמרים בשולי המודל ככל האפשר.

‏`Command` אינו `Event`:

```text
Command: CancelOrder
Event: CancelRequested
Event: CancelConfirmed
```

‏כך ניתן לבדוק reducer/state transitions ללא Broker חי.

---

## ‏16. Broker Adapter Conformance

‏לכל Adapter חדש נדרשת Suite לפחות ל־:

```text
Submit
Cancel
Replace / amend semantics
Partial Fill
Duplicate callbacks
Out-of-order callbacks
Reconnect
Order lookup
Execution lookup
Position reconciliation
Unsupported capability
Client ID semantics
Order corrections/busts when applicable
```

‏Broker behavior ו־API semantics יכולים להשתנות; לכן conformance tests וה־capability registry הם boundary חי.

---

## ‏17. Entry vs Exit

‏Entry ו־Exit אינם symmetric.

### ‏Entry

```text
may decline
may wait
may return NO_TRADE
```

### ‏Exit

‏כאשר Position קיים:

```text
risk reduction priority
```

‏גם אם expected execution cost worsened.

‏Execution quality עדיין נמדדת, אך risk-reducing action אינה נחסמת רק משום שה־trade כבר אינו אטרקטיבי כלכלית.

---

## ‏18. Research / Experiment Ladder

```text
E0 — deterministic simulated broker core
E1 — happy-path paper adapter
E2 — partial-fill / cancel-race scenarios
E3 — reconnect / reconciliation
E4 — unknown-effect fault injection
E5 — simple protected aggressive baseline
E6 — passive challenger
E7 — bounded adaptive reprice
E8 — route / broker-algo challengers
E9 — advanced parent/child execution
```

‏ה־Safety Model (`E0–E4`) קודם ל־clever tactics.

---

## ‏19. Alternatives / Trade-offs

### ‏Thin Strategy-to-Broker wrapper

‏יתרון:

```text
simple demo
```

‏חסרונות:

```text
no durable lifecycle
no ambiguity model
poor recovery
duplicate risk
```

‏לא מתאים ל־Production baseline.

### ‏Full Event Sourcing

‏יכול לספק audit/rebuild חזק.

‏אבל אינו נדרש כברירת מחדל.

‏Baseline פשוט יותר:

```text
append-only critical journal
+
canonical state snapshots / derived state
```

### ‏Distributed HA Execution Cluster

‏מספק resilience אפשרי, אך מוסיף ownership/fencing/split-brain complexity.

‏`P4` עד שיש requirement אמיתי.

### ‏Single-process single-owner execution

‏`P1 Preferred Default` לרובוט אישי, כל עוד reliability/throughput מספיקים.

---

## ‏20. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏Multi-writer execution.
- ‏Distributed consensus סביב כל Order.
- ‏Complex broker algos כ־default.
- ‏Custom multi-venue routing.
- ‏Blind command retries.
- ‏Assumption ש־timeout הוא reject.
- ‏Assumption ש־disconnect מבטל orders.
- ‏Silent capability fallbacks.
- ‏Five overlapping exit orders ללא parent/child invariant.
- ‏Live parameter changes ללא version boundary.
- ‏Relying on Broker UI כ־Source of Truth לארכיטקטורה.

---

## ‏21. What to Add Later

‏רק לאחר Evidence:

```text
outbox/inbox formalization
advanced target-position controller
native linked-order optimization
adaptive execution policies
advanced route selection
broker-algo selection
HA active/passive executor
fencing tokens
advanced reconciliation automation
multi-account execution
```

---

## ‏22. Promotion Criteria

‏Execution Engine יכול להתקדם רק אם:

- ‏Duplicate Intent אינו מייצר duplicate business effect.
- ‏Partial Fills ו־Late Fills מעדכנים Exposure נכון.
- ‏Cancel/Fill ו־Replace overlap נבדקו.
- ‏Unknown Effect חוסם blind retry.
- ‏Pending Exposure נכלל ב־Risk.
- ‏Reconciliation מוכח ב־Restart/Reconnect.
- ‏Orphan/Mismatch חוסמים new risk.
- ‏Capabilities נבדקות explicit.
- ‏Price/quantity bounds נאכפים.
- ‏Execution state ניתן לשחזור מה־evidence.
- ‏Split-brain אינו יכול לייצר legal concurrent writers.
- ‏P95/P99 operational latency בתוך budget המחקרי.
- ‏No critical event loss תחת burst/fault tests.
- ‏Exit/risk reduction נשמרים תחת degraded mode.

---

## ‏23. Rejection Criteria

‏נReject architecture/change כאשר:

```text
blind retry can duplicate exposure
cancel request removes pending exposure before confirmation
partial fill is treated as 0/100 only
restart assumes flat
unknown broker state permits new entry
replace can exceed authorized exposure
manual/external broker activity is ignored
capability fallback changes semantics silently
critical journal can be lost silently
execution depends on callback ordering that broker does not guarantee
local lock is treated as distributed ownership proof
```

---

## ‏24. Metrics

### ‏Correctness / Safety

```text
unknown_effect_rate
orphan_order_rate
position_mismatch_rate
reconciliation_drift_rate
duplicate_submit_prevented
duplicate_fill_prevented
pending_exposure_limit_blocks
split_brain_blocks
stale_intent_blocks
price_bound_blocks
```

### ‏Lifecycle

```text
submit_count
ack_rate
reject_rate
fill_rate
partial_fill_rate
cancel_confirm_rate
replace_count
attempts_per_intent
intent_terminal_rate
```

### ‏Latency

```text
decision_to_submit p50/p95/p99
submit_to_ack p50/p95/p99
submit_to_first_fill p50/p95/p99
first_to_last_fill p50/p95/p99
cancel_to_confirm p50/p95/p99
exit_intent_to_flat p50/p95/p99
```

### ‏Execution Quality

```text
slippage
effective_spread
markout
missed_opportunity
stale_fill_rate
execution_conversion
remaining_edge_at_fill
```

### ‏Operations

```text
command_queue_age
callback_queue_age
reconciliation_duration
recovery_to_execution_ready
pacing_throttle_count
adapter_error_rate
persistence_error_rate
```

---

## ‏25. User-Specific Application

‏למערכת שלנו יש:

```text
whole-market scanner
short signal lifetime
Top-N candidate handoff
separate market-data and broker domains
single-position / simple-position research baseline
seconds-oriented entry/exit
```

‏לכן ה־Implementation baseline יהיה:

```text
1. Scanner/Decision emits immutable candidate evidence.
2. Strategy creates one semantic Intent.
3. Risk reserves worst-case exposure.
4. Execution revalidates signal/price/state.
5. One logical executor creates a durable Attempt.
6. Protected simple order tactic is submitted.
7. Broker events update canonical reducer state.
8. Every Fill updates Position exactly once.
9. Pending exposure remains reserved until definitive resolution.
10. Unknowns trigger reconciliation, not blind retry.
11. Exit/Flatten targets desired position, not remembered quantity.
12. Restart/Reconnect reconciles before new entries.
```

‏Advanced execution tactics אינם prerequisite.

‏ה־first production-quality value הוא correctness under failure boundaries.

---

## ‏26. Fact / Judgment / Hypothesis

### ‏Fact / Established Engineering Principle

- ‏Network timeout אינו מוכיח ש־external side effect לא קרה.
- ‏Partial Fill משנה Exposure בפועל.
- ‏Cancel Request אינו confirmation שה־Order אינו יכול להתמלא.
- ‏Duplicate callbacks ו־out-of-order events חייבים להיות אפשריים במודל כללי.
- ‏Restart של Client אינו מוחק Order/Position אצל מערכת חיצונית.
- ‏Pending potentially-live commands חייבים להילקח בחשבון כדי למנוע over-exposure.

### ‏Judgment — Recommended Baseline

- ‏Immutable semantic Intent.
- ‏Stable Intent/Attempt IDs.
- ‏Durable write-before-send journal.
- ‏Single logical execution owner.
- ‏Target-position semantics ל־Flatten/Position Controller.
- ‏Explicit `UNKNOWN_EFFECT`.
- ‏Runtime reconciliation.
- ‏Simple protected order policy לפני advanced tactics.

### ‏Hypothesis — Requires Experiment

- ‏ה־Execution Policy הטובה ביותר.
- ‏Passive vs aggressive mix.
- ‏TTL / repricing thresholds.
- ‏Whether Target-position control should own all entry semantics.
- ‏Whether outbox formalization improves reliability enough to justify complexity.
- ‏Whether advanced parent/child or Broker Algo adds net value.
- ‏Whether HA executor is needed at all.

---

## ‏27. Confidence

### ‏High Confidence

- ‏Intent/Order separation.
- ‏Stable IDs / idempotency.
- ‏Timeout ambiguity / UNKNOWN_EFFECT.
- ‏Pending Exposure.
- ‏Partial Fill correctness.
- ‏Cancel/Fill race handling.
- ‏Reconciliation before new risk after uncertainty.
- ‏Single execution owner baseline.
- ‏Exit priority over Entry.
- ‏Canonical reducer + durable evidence.

### ‏Medium Confidence

- ‏Exact canonical state enum.
- ‏Target-position controller shape.
- ‏Outbox/inbox architecture.
- ‏Reservation granularity.
- ‏Exact periodic reconciliation cadence.

### ‏Evidence-Only

- ‏Distributed HA execution.
- ‏Multi-account concurrent execution.
- ‏Complex auto-adoption of external orders.
- ‏Advanced broker-specific automation.

---

## ‏28. Time-Sensitive Facts

‏מקטע 51 אינו מקבע מספרי pacing, broker-specific status strings או order capability כ־Truth אוניברסלי.

‏לפני Implementation מול Broker מסוים יש לאמת מחדש:

```text
client-order-id semantics
submit/cancel/replace guarantees
order lookup scope
execution history scope
reconnect/session behavior
callback ordering guarantees, if any
partial-fill semantics
correction/bust events
native vs simulated order behavior
pacing/message limits
supported order types / TIF / routing
fractional quantity rules
paper-vs-live differences
```

‏כל אלה נכנסים ל־`Capability Registry` / Adapter conformance ולא ללוגיקת Strategy.

---

## ‏29. Relationship to Earlier / Later Sheets

### ‏Earlier

- ‏`16` — Entry/Execution: Signal→Intent→Fill וה־pre-submit recheck.
- ‏`17` — Exit Logic: exits ו־Time-to-Flat.
- ‏`19` — Risk: reservations, exposure limits ו־unknown state.
- ‏`21` — Execution Backtest: fill realism ו־partial fills.
- ‏`29` — Broker API Architecture: Adapter contracts, IDs, reconciliation.
- ‏`32` — Market Data vs Execution truth domains.
- ‏`33` — Production State Machine / capabilities.
- ‏`34` — Failure Recovery / Safe Resume.
- ‏`35` — Observability / durable evidence.
- ‏`36` — Kill Switch / Safety authority.
- ‏`37–41` — Order tactics, routing and Broker Algos.
- ‏`46` — Adverse Selection / markout.
- ‏`48` — Latency / queue-age priorities.
- ‏`50` — Scanner handoff / immutable candidate evidence.

### ‏Later

‏`52 — Data Engineering Best Practices` יגדיר כיצד Market Data הופכת ל־point-in-time, replayable, auditable evidence בלי gaps/duplicates/schema drift שקטים.

---

## ‏30. Recommendation Summary

### ‏Priority Map

```text
P0
- Intent / Order separation
- stable IDs / idempotency
- durable journal before side effects
- explicit UNKNOWN_EFFECT
- canonical order state
- duplicate fill protection
- partial-fill accounting
- pending exposure in risk
- cancel/fill race handling
- no-overfill invariant
- reconciliation
- restart/reconnect safety
- orphan/mismatch blocking
- stale-intent / epoch check
- pre-submit revalidation
- hard price protection
- capability fail-closed
- exit/risk-reduction priority
- environment/account guard

P1
- single logical executor
- simple execution policy
- target-position controller
- immutable attempt/evidence records
- execution reducer
- position/execution ledgers
- broker adapter conformance suite

P2
- outbox-style formalization
- bounded adaptive repricing
- richer parent/child execution
- periodic automated reconciliation

P3
- advanced routing / broker algo integration
- HA active/passive executor with fencing
- advanced external-order adoption

P4
- distributed multi-writer execution
- complex multi-account orchestration
```

### ‏Final Baseline

```text
Immutable Intent
→ Risk Reservation
→ Last-Mile Revalidation
→ Durable Attempt
→ Simple Protected Broker Command
→ Idempotent Canonical Event Reduction
→ Actual + Pending Exposure
→ Reconciliation on Ambiguity
→ Position Target / Exit Priority
→ Explicit Ready / Not Ready
```

‏Execution Engine טוב צריך להיות **predictable, conservative under uncertainty, fully reconstructable and boring enough that failures become state transitions rather than surprises**.
