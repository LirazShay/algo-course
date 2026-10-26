# ‏29 — Recommendation Sheet: Broker API Architecture

> ‏מקור לימודי עיקרי: `../29-BROKER-API-ARCHITECTURE.md`.
>
> ‏מטרת הקובץ: לקבוע Architecture Baseline לשכבת Broker אמינה, ניתנת לבדיקה וניתנת להחלפה, בלי לזהם את `Strategy`, ‏`Risk` ו־`Execution` בפרטי SDK חיצוני. המוקד הוא correctness של state, ‏idempotency, ‏reconciliation, ‏recovery ו־observability — לא בחירת Broker ספציפי ולא הפעלה בכסף אמיתי.
>
> ‏המקטע ממשיך במיוחד את 16, 19, 21, 27 ו־28: ‏16 הגדיר `Order Intent` ו־fill-driven position truth; ‏19 הגדיר Risk authority; ‏21 הגדיר execution realism; ‏27–28 הגדירו Replay/Shadow/Paper. ‏29 מגדיר את boundary שמחבר Intent פנימי למערכת חיצונית אסינכרונית מבלי לאבד שליטה על אמת, ambiguity ו־recovery.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
How do we call a broker API?
```

‏אלא:

```text
How do we preserve a correct, explainable and recoverable
execution state when an external asynchronous system
can timeout, duplicate, reorder, reject, partially fill,
disconnect and recover independently of our process?
```

‏ה־Baseline שנבחר:

```text
Strategy Decision
→ Risk Approval
→ Execution Intent
→ Canonical Order Request
→ Broker Adapter
→ External Broker Boundary

External Broker Events
→ Broker Adapter
→ Canonical Broker Events
→ Order State Machine
→ Fill Ledger
→ Position Truth
→ Risk / Execution State
→ Reconciliation
```

‏העיקרון המרכזי:

```text
Application Intent Truth
!=
Broker Execution Truth
```

‏והחיבור ביניהם נעשה באמצעות:

```text
stable identifiers
state machines
idempotency
immutable ledgers
reconciliation
health/readiness states
observability
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: הפרדה לארבע שכבות

```text
Strategy
↓
Risk Engine
↓
Execution Engine
↓
Broker Adapter
```

‏אחריות:

- ‏`Strategy` מחליטה Signal / Rank / Entry / Exit logic.
- ‏`Risk Engine` מחליט אם Intent מותר ומה הכמות המרבית המאושרת.
- ‏`Execution Engine` מחליט כיצד לנסות לבצע Intent מאושר.
- ‏`Broker Adapter` מתרגם contract קנוני ל־API חיצוני ובחזרה.

‏ה־`Strategy` אינה מכירה:

```text
broker SDK objects
broker callbacks
broker order IDs
session reconnect semantics
rate-limit error codes
```

‏וה־Adapter אינו מחליט:

```text
whether signal is good
how much strategy wants to risk
whether a weak candidate deserves a trade
```

### ‏`P0 — Required`: שני סוגי אמת

‏נחזיק במפורש:

```text
Application Truth
- signal
- decision
- rank / score
- risk approval
- execution policy
- intent reason

Broker Truth
- accepted orders
- broker order IDs
- executions / fills
- open orders
- positions
- account/exposure state reported externally
```

‏כאשר קיימת סתירה לגבי מה **בוצע בפועל**, ה־Broker/Execution evidence הוא authority שדורש convergence של ה־state המקומי.

‏כאשר נשאלת השאלה **למה רצינו לבצע**, האפליקציה היא authority.

### ‏`P0 — Required`: `Intent != Order != Fill != Position`

‏ארבע ישויות נפרדות:

```text
Decision
→ Intent
→ Broker Order
→ Fill(s)
→ Position
```

‏אסור לקצר ל:

```text
BUY sent → position exists
```

‏ה־Position משתנה רק לפי:

```text
processed fills
+
authoritative reconciliation
```

### ‏`P0 — Required`: `ACK != Fill`

‏נעקוב בנפרד אחרי:

```text
requested_qty
submitted_qty
acknowledged_qty
filled_qty
remaining_qty
```

‏`ACK` מוכיח לכל היותר שה־Order התקבל/נרשם לפי semantics של ה־Provider; הוא אינו Position.

### ‏`P0 — Required`: `Timeout != Reject`

‏Timeout אומר:

```text
confirmation not observed within deadline
```

‏לא:

```text
external side effect definitely did not occur
```

‏לכן כל Error/Timeout מסווג גם לפי effect certainty:

```text
NO_EFFECT_CONFIRMED
EFFECT_CONFIRMED
UNKNOWN_EFFECT
```

‏ב־`UNKNOWN_EFFECT`:

```text
block conflicting action
→ reconcile
→ resolve state
→ only then decide whether any retry is safe
```

### ‏`P0 — Required`: `UNKNOWN` הוא state אמיתי

‏דוגמה:

```text
submit sent
→ connection lost
→ no authoritative acknowledgement
→ UNKNOWN
```

‏במצב זה:

- ‏לא מניחים שה־Order קיים.
- ‏לא מניחים שה־Order אינו קיים.
- ‏לא שולחים duplicate submit.
- ‏לא מגדילים Exposure על אותו workflow.
- ‏פותחים reconciliation.

### ‏`P0 — Required`: Reconciliation הוא Core Feature

‏לא patch לאחר תקלה.

‏ארבעת domains הראשוניים:

```text
Orders
Executions / Fills
Positions
Account / Available Exposure State
```

‏Triggers:

```text
startup
reconnect
UNKNOWN_EFFECT
sequence/event gap
invariant breach
external/manual state change
periodic safety check
```

### ‏`P0 — Required`: Reconnect אינו `READY`

‏Connection state:

```text
DISCONNECTED
→ CONNECTING
→ AUTHENTICATING
→ SYNCING
→ READY
```

‏אחרי reconnect:

```text
RECONNECTING
→ SYNCING
→ reconciliation complete
→ invariants pass
→ READY
```

‏Socket פתוח לבדו אינו readiness.

### ‏`P0 — Required`: Fail Closed ל־new exposure

‏אם Broker/Order/Position state אינו מספיק ברור:

```text
new entries = blocked
```

‏מצב Safety נפרד:

```text
EXIT_ONLY
```

‏מאפשר למערכת להמשיך לנהל Exposure קיים לפי policy, בלי ליצור Exposure חדש.

---

## ‏3. Canonical Internal Contract

### ‏`P1 — Preferred Default`

‏המערכת מגדירה מודלים פנימיים שאינם תלויים ב־SDK:

```text
InstrumentIdentity
OrderIntent
CanonicalOrderRequest
BrokerOrderState
CanonicalBrokerEvent
ExecutionReport
Fill
CanonicalPosition
AccountSnapshot
BrokerCapabilities
BrokerHealth
CanonicalBrokerError
```

### ‏`OrderIntent`

‏מתאר את המטרה העסקית/מחקרית:

```text
intent_id
trade_workflow_id
decision_id
instrument_id
side
target_qty
max_price / price_budget
urgency
valid_until
partial_fill_policy
cancel_policy
replace_policy
reason
risk_approval_id
execution_policy_version
```

### ‏`CanonicalOrderRequest`

‏מתאר מה שה־Execution Engine מבקש מה־Adapter:

```text
client_order_id
intent_id
instrument_id
side
quantity
order_type
limit_price
stop_price if applicable
time_in_force
session_policy
routing_intent if applicable
```

### ‏`BrokerOrderState`

```text
client_order_id
broker_order_id
state
requested_qty
filled_qty
remaining_qty
avg_fill_price if available
last_event_at
state_confidence
connection_session_id
```

### ‏`CanonicalBrokerEvent`

```text
event_id
event_type
client_order_id
broker_order_id
broker_execution_id if any
broker_time if any
received_time
raw_code
raw_message_reference
canonical_payload
schema_version
```

---

## ‏4. Identifier Strategy

### ‏`P0`: `Client Order ID`

‏כל submit workflow מקבל מזהה פנימי יציב לפני external call.

‏הוא חייב לשרוד:

```text
retry investigation
restart
reconnect
replay
RCA
```

### ‏`P0`: mapping מפורש

```text
client_order_id
↔
broker_order_id
```

‏Broker ID אינו תחליף ל־Client ID משום שייתכן שיתקבל רק מאוחר יותר.

### ‏`P1`: `trade_workflow_id`

‏Order אחד אינו בהכרח Trade שלם.

```text
trade_workflow_id
├─ entry order A
├─ entry replace B
├─ exit order C
└─ exit replace D
```

### ‏`P1`: Trace ID

‏Trace אחד קושר:

```text
Signal
→ Decision
→ Risk
→ Intent
→ Submit
→ ACK
→ Fill
→ Position
→ Exit
→ Flat
```

---

## ‏5. Order State Machine

### ‏`P0 — Required`

‏Baseline state model:

```text
CREATED
SUBMITTING
ACKNOWLEDGED
WORKING
PARTIALLY_FILLED
FILLED
CANCEL_REQUESTED
CANCELLED
REJECTED
EXPIRED
UNKNOWN
```

‏לא כל Provider ישתמש באותם labels; ה־Adapter ממפה ל־canonical semantics.

### ‏Terminal states

```text
FILLED
CANCELLED
REJECTED
EXPIRED
```

‏`UNKNOWN` אינו terminal.

### ‏Command אינו Event

```text
CancelOrder(command)
```

‏אינו:

```text
ORDER_CANCELLED(event)
```

‏כך גם:

```text
Submit request accepted by transport
!=
order accepted by broker
```

### ‏Cancel/Fill race

‏Baseline חייב לתמוך ב:

```text
CANCEL_REQUESTED
→ late/competing fill
→ position changes
→ cancel outcome arrives later
```

‏כל Fill מאומת משפיע על Position גם אם intent המקומי כבר ניסה לבטל.

---

## ‏6. Fill Ledger ו־Position Truth

### ‏`P0 — Required`: Fill Ledger append-style

‏לכל Fill נשמור לפחות:

```text
fill_id
client_order_id
broker_order_id
broker_execution_id if available
instrument_id
side
quantity
price
execution_time
received_time
fee_state
fee_amount if known
source_environment
```

### ‏Deduplication

‏אותו execution event אינו רשאי להגדיל Position פעמיים.

‏עדיפות dedupe key:

```text
provider execution identifier
```

‏אם אינו זמין, צריך policy קנונית מפורשת; אין dedupe heuristic נסתר.

### ‏Partial Fill הוא state רגיל

```text
requested = 500
filled = 130
position = 130
```

‏Risk, Exit ו־PnL עובדים לפי 130.

### ‏One Canonical Position Model

‏`UI`, ‏`Risk` ו־`Execution` אינם מחשבים Position עצמאית.

‏כולם קוראים state קנוני אחד שנבנה מ:

```text
Fill Ledger
+
Reconciliation corrections / authoritative snapshots
```

### ‏Oversell Protection

‏לפני Exit workflow:

```text
confirmed_position_qty
working_exit_qty
unknown_exit_orders
```

‏חייבים להיות ידועים/מוגנים כך ששני triggers לא יוצרים double-close.

---

## ‏7. Idempotency ו־Retry

### ‏`P0 — Required`: אין Blind Retry ל־write command

‏Retry של read query ו־retry של external side effect אינם אותו דבר.

‏Error taxonomy ראשוני:

```text
TRANSIENT
PERMANENT
RATE_LIMITED
AUTH_FAILURE
INVALID_REQUEST
UNKNOWN_EFFECT
```

### ‏Retry policy לפי category

‏כל category מגדיר:

```text
may_retry
requires_reconciliation_first
backoff_policy
max_attempts
blocks_symbol
blocks_entries_global
```

### ‏Outbox Concept — `P2`

‏Intent/Command critical יכול להיכתב durable לפני delivery.

‏המטרה:

```text
recover intent after crash
```

‏לא להבטיח Exactly Once מול external broker.

### ‏Inbox Deduplication — `P2`

‏Canonical incoming events נשמרים עם stable identifiers ככל האפשר כדי לאפשר:

```text
detect duplicate
→ no duplicate side effect
```

### ‏Exactly Once

‏לא נבנה Architecture על ההנחה שקיים exactly-once מקצה לקצה.

‏ה־Baseline הוא:

```text
at-least/at-most-once realities
+ idempotency
+ deduplication
+ reconciliation
```

---

## ‏8. Broker Health ו־Trading Readiness

### ‏`P0`: `isConnected` אינו Health

‏נפריד:

```text
transport_connected
broker_session_authenticated
orders_channel_healthy
account_state_fresh
position_state_fresh
reconciliation_status
broker_ready_for_new_intents
```

### ‏Health states

```text
HEALTHY
DEGRADED
RECONNECTING
STALE
UNAVAILABLE
```

### ‏Readiness states

```text
NOT_READY
SYNCING
READY
EXIT_ONLY
LOCKED
```

### ‏Heartbeats / Freshness

‏נמדוד:

```text
last_message_received_at
last_order_event_at
last_account_refresh_at
last_position_refresh_at
last_successful_reconciliation_at
```

‏`READY` דורש policy מפורשת, לא boolean יחיד.

---

## ‏9. Reconciliation Contract

### ‏Startup

```text
connect
→ authenticate
→ fetch open orders
→ fetch executions/fills needed for recovery
→ fetch positions
→ fetch account state
→ compare local durable state
→ resolve mismatches
→ validate invariants
→ READY
```

### ‏Reconnect

‏אותו עיקרון; אין resume מה־cache בלבד.

### ‏Periodic

‏`P1` לבצע reconciliation תקופתי/מבוסס-events בתדירות שמצדיקה reliability בלי לבזבז API budget.

‏המספר המדויק תלוי Provider ויימדד/יאומת במקטע הספציפי.

### ‏Convergence rule

‏ל־actual external execution:

```text
local state must converge to authoritative external evidence
```

‏אבל כל discrepancy נשמרת כ־Incident/Audit evidence; לא “מתקנים ומוחקים עקבות”.

### ‏Reconciliation Log

```text
reconciliation_id
trigger
started_at
completed_at
orders_compared
fills_compared
positions_compared
account_state_compared
mismatches
resolutions
final_readiness
```

---

## ‏10. Capability Model

### ‏`P1 — Preferred Default`

‏Adapter מפרסם `BrokerCapabilities` versioned.

‏קטגוריות כלליות:

```text
supported_order_types
supported_time_in_force
modify/replace semantics
session support
quantity constraints
native protective-order features
routing capabilities
identifier semantics
paper/simulation capabilities
```

### ‏No Silent Downgrade

‏אם Execution Policy דורשת capability שאינה ממופה בבטחה:

```text
REJECT_INTENT_UNSUPPORTED_CAPABILITY
```

‏ולא:

```text
silently use something approximately similar
```

### ‏Capability Drift

‏Capability map הוא input versioned ותלוי זמן.

‏לפני כל חיבור Provider ממשי יש לאמת מול documentation עדכני.

---

## ‏11. Rate Limits ו־Backpressure

### ‏`P0`: Rate Limit הוא חלק מה־Architecture

‏ננהל budgets נפרדים לפי capability כאשר ה־Provider מחייב זאת, למשל:

```text
write commands
cancel/replace
state queries
reconciliation
market/account refresh
```

‏אין כאן מספרים קשיחים; הם Provider-specific ותלויי זמן.

### ‏Priority under pressure

‏Baseline conceptual priority:

```text
risk-reducing / state-recovery work
> exposure-management work
> reconciliation
> new opportunity work
> diagnostics
```

‏המדיניות המדויקת חייבת להיות versioned.

### ‏Bounded Queues

‏אין queue בלתי מוגבל של Intents.

‏כל Intent קצר טווח נושא:

```text
created_at
expires_at
max_age
```

‏Intent שפג:

```text
DROP_STALE_INTENT
```

‏ולא submit מאוחר.

### ‏Metrics

```text
intent_queue_depth
oldest_intent_age
late_intent_drop_count
rate_limit_count
intent_to_submit_ms
```

---

## ‏12. Instrument Identity ו־Normalization

### ‏`P0`: Symbol לבדו אינו Identity

‏Canonical instrument:

```text
internal_instrument_id
symbol
exchange / venue context
currency
asset_type
provider_specific_ids
```

### ‏Cross-provider mapping

‏Market Data Provider ו־Execution Broker יכולים להיות שונים.

‏נדרש mapping מפורש:

```text
internal instrument
↔ market-data identifier
↔ execution-broker identifier
```

### ‏Order normalization

‏לפני external submit ה־Adapter/validation layer בודק metadata רלוונטי כגון:

```text
price precision / increments
quantity constraints
session constraints
supported fields
```

‏פרטים ספציפיים הם time-sensitive ולא hard-coded ב־Sheet זה.

---

## ‏13. Account / Exposure State

### ‏Timestamp everything

‏Cached external state נשמר כ:

```text
value
as_of
received_at
source
confidence/status
```

### ‏Stale is not Current

‏אם account/exposure state ישן מדי:

```text
UNKNOWN / STALE
```

‏ולא reuse שקט.

### ‏Pending Exposure

‏Risk אינו מסתכל רק על Position Filled.

‏הוא לוקח בחשבון:

```text
confirmed positions
working entry orders
working exit orders
cancel-pending orders
unknown-effect orders
reserved capital
```

‏הנוסחה המדויקת תהיה policy של Risk/Account layer, לא של ה־Adapter.

---

## ‏14. Concurrency Model

### ‏`P1`: Single Writer per Order Aggregate

‏לכל Order/Trade aggregate יש owner ברור שמיישם transitions בצורה סדרתית.

‏אפשר לממש באמצעות:

```text
actor per aggregate
partitioned event loop
single-writer state machine
serialized command queue
```

‏הטכנולוגיה משנית; invariant ראשון הוא שאין שני writers מתחרים שמייצרים state סותר.

### ‏Per-Symbol Single Flight — `P2`

‏יכול לעזור למנוע workflows מקבילים של entry/exit/retry באותו Symbol.

‏לא נבחר Global Lock כ־Baseline משום שהוא יוצר bottleneck וחוסם concurrency שאינה קשורה.

### ‏Close Intent Deduplication

‏אם:

```text
TIME_STOP
SIGNAL_DEATH
RISK_EXIT
```

‏מופעלים יחד, הם מתכנסים ל־Exit workflow אחד עם:

```text
first_trigger
highest_priority_reason
```

---

## ‏15. Durable State ו־Recovery

### ‏`P0 — Required`

‏המידע הבא חייב לשרוד process crash במידה הנדרשת לשחזור בטוח:

```text
active intents
client ↔ broker order mapping
order-event ledger
fill ledger
known positions / authoritative snapshots
UNKNOWN states
risk mode/state
connection/reconciliation metadata
```

### ‏Snapshot + Event Log — `P2`

‏כאשר scale מצדיק:

```text
snapshot
+
events after snapshot
```

### ‏Crash scenarios שחייבים בדיקה

```text
before submit
submit in-flight
working order
partial fill
cancel pending
open position
exit in-flight
reconciliation in-flight
```

### ‏Restart rule

```text
process restart
→ NOT_READY
→ load durable state
→ reconnect
→ authoritative reconciliation
→ invariants
→ explicit readiness
```

‏אין `ACTIVE` אוטומטי רק מפני שהאפליקציה עלתה.

---

## ‏16. Error Model

### ‏Canonical Broker Error

```text
error_id
category
canonical_code
retryable
unknown_effect
risk_impact
client_order_id
broker_order_id
raw_broker_code
raw_message
occurred_at
received_at
adapter_version
```

### ‏Stable categories

```text
TRANSIENT
PERMANENT
RATE_LIMITED
AUTH_FAILURE
INVALID_REQUEST
UNSUPPORTED_CAPABILITY
BROKER_REJECT
UNKNOWN_EFFECT
DATA/STATE_INCONSISTENCY
```

### ‏Raw evidence

‏Normalization אינה מוחקת את ה־raw provider code/message.

‏RCA צריך את שניהם:

```text
canonical category
+
raw external evidence
```

---

## ‏17. Observability Baseline

### ‏Structured lifecycle logging

‏בכל transition נשמור:

```text
trace_id
trade_workflow_id
intent_id
client_order_id
broker_order_id
instrument_id
state_before
state_after
command/event
connection_session_id
latency_ms
raw_code reference
code/config/adapter version
```

### ‏Core metrics

```text
submit_count
reject_count
cancel_count
replace_count
partial_fill_count
unknown_state_count
reconnect_count
reconciliation_count
reconciliation_mismatch_count
late_intent_drop_count
```

### ‏Latency distributions

```text
strategy_to_risk
risk_to_execution
execution_to_adapter
intent_to_submit
submit_to_ack
ack_to_first_fill
cancel_to_confirm
reconnect_to_ready
```

‏נמדוד לפחות:

```text
P50
P90
P95
P99
MAX
```

### ‏Reliability metrics

```text
order_ack_rate
unknown_effect_rate
duplicate_event_rate
position_mismatch_rate
api_error_rate
rate_limit_rate
reconciliation_failure_rate
```

### ‏Actionable alerts

‏דוגמאות conceptually:

```text
UNKNOWN state persists
position mismatch
reconciliation failed
broker health degraded
account/position state stale
unexpected environment
```

---

## ‏18. State Invariants

### ‏`P0 — Hard Invariants`

```text
position changes only from fills/reconciliation
same fill cannot apply twice
UNKNOWN blocks conflicting new entry
new exposure requires broker readiness
no silent capability downgrade
cancel request does not imply cancelled
acknowledgement does not imply fill
exit quantity cannot exceed safe available position after working/unknown exits
restart cannot bypass reconciliation
```

### ‏Invariant breach workflow

```text
breach detected
→ alert
→ freeze affected workflow/symbol or broader scope as policy requires
→ capture incident package
→ reconcile
→ classify RCA
→ regression scenario
```

---

## ‏19. Incident Package

‏לכל Broker incident משמעותי נשמור:

```text
trace / workflow IDs
intent snapshot
risk approval snapshot
execution policy snapshot
canonical order events
raw broker evidence references
fills
position before/after
working orders
connection state
broker health
market snapshot
clock/timestamps
adapter version
code/config version
reconciliation results
```

‏כך מקטע 26 `RCA` ומקטע 27 `Replay` יכולים לשחזר את First Divergence.

---

## ‏20. Testing Strategy for the Boundary

### ‏`P0`: Adapter Conformance Suite

‏כל Adapter, גם Fake/Paper, חייב לעבור contract משותף.

‏Minimum scenarios:

```text
submit → acknowledge
submit → reject
partial fill
multiple fills
cancel
cancel/fill race
timeout with UNKNOWN_EFFECT
duplicate callback
out-of-order callback
disconnect after submit
reconnect with open order
restart with open position
reconciliation mismatch
rate-limited response
external/manual state change
```

### ‏`P1`: Stateful Fake Broker

‏לא רק Mock methods.

‏ה־Fake צריך להיות מסוגל לייצר:

```text
ack delay
partial fills
rejects
duplicates
out-of-order events
disconnects
unknown-effect timeout
```

### ‏`P1`: Golden Broker Scenarios

‏כל incident משמעותי יכול להפוך ל־permanent regression scenario.

### ‏`P2`: Property Tests

‏דוגמאות:

```text
same fill twice does not double position
UNKNOWN blocks duplicate exposure
reconciliation converges local actual-state to authoritative evidence
restart cannot become READY before sync
```

### ‏`P2`: Fault Injection

```text
lose ack
delay cancel result
repeat fill
reorder events
drop connection after submit
rate-limit bursts
stale account snapshot
```

---

## ‏21. Environment Model

### ‏Baseline environments

```text
REPLAY
SHADOW
PAPER
```

‏כל Environment מופיע במפורש ב־Run/Order/Fill metadata.

‏Adapter contract משותף מאפשר parity בלי לאפשר ל־Strategy להחליף behavior לפי environment.

### ‏Future external environment

‏כל adapter עתידי שמסוגל ליצור exposure כספי הוא מחוץ ל־Baseline התפעולי של Sheet זה ודורש gates/controls/authorization מתאימים בפרקים מאוחרים יותר.

### ‏No default escalation

‏Environment בעל side effects חזקים יותר לעולם אינו נבחר בגלל default/fallback.

---

## ‏22. Security Boundary

### ‏`P0`

‏Broker credentials/secrets:

- ‏אינם בקוד.
- ‏אינם בלוגים.
- ‏אינם ב־Replay artifacts.
- ‏אינם ב־Incident packages.

### ‏Least privilege

‏כאשר Provider מאפשר, permissions מצומצמות למה שנדרש לאותה Environment.

### ‏Rotation

‏Credential rotation אינו דורש שינוי ב־Strategy code.

### ‏Audit Trail

‏Execution-critical configuration changes נשמרים עם:

```text
who/what
when
old value
new value
version
```

---

## ‏23. Broker-Specific Optimizations

### ‏`P1`: Core path קודם

‏לפני extensions מתקדמים:

```text
canonical limit / capped-aggressive request
cancel
replace where safely supported
fills
reconciliation
recovery
```

### ‏`P3`: Provider-specific extension points

‏יכולות מתקדמות יכולות להיכנס רק דרך:

```text
explicit capability
feature flag
versioned adapter mapping
paper/shadow conformance
```

### ‏No Universal Framework Overbuild

‏למערכת האישית שלנו:

```text
one execution provider adapter
one canonical model
one event pipeline
one reconciliation engine
```

‏הוא Baseline עד שיש Evidence עסקי/טכני לצורך נוסף.

---

## ‏24. KISS Baseline Architecture

```text
Scanner
  ↓
Decision Engine
  ↓
Risk Engine
  ↓
Execution Engine
  ↓
Canonical Broker Interface
  ↓
Broker Adapter
  ↓
External Boundary
```

‏Event path:

```text
External Event
  ↓
Broker Adapter
  ↓
Canonical Broker Event
  ↓
Order State Machine
  ↓
Fill Ledger / Position Truth
  ↓
Risk + Execution State
  ↓
Reconciliation / Observability
```

‏Persistent baseline:

```text
Intent Store
Order Event Ledger
Fill Ledger
Position Snapshot
Reconciliation Log
Risk State
```

---

## ‏25. Short-Horizon Application

‏ל־Scanner קצר־טווח שלנו, Broker Architecture נמדדת גם לפי כמה זמן Edge נשחק לאורך pipeline.

‏נשמור:

```text
rank_at_signal
rank_at_risk_approval
rank_at_submit
rank_at_first_fill
score_at_signal
score_at_submit
score_at_first_fill
```

‏וגם:

```text
intent_to_submit_ms
submit_to_ack_ms
ack_to_first_fill_ms
signal_to_first_fill_ms
late_intent_drop_count
unknown_state_count
```

### ‏Execution Deadline

‏Intent קצר־טווח חייב לפוג.

```text
broker path congested
+ opportunity expired
→ drop intent
```

‏ולא:

```text
execute late because it was once valid
```

### ‏Pre-submit Recheck

‏לפני submit בסביבת מחקר/סימולציה נבדוק את החוזה שהוגדר כבר ב־16:

```text
intent still valid
market data still fresh
risk approval still valid
price still inside budget
broker adapter ready
no conflicting/unknown workflow
```

### ‏Pre-fill Awareness

‏בזמן Order עובד ממשיכים למדוד Signal/Rank decay לצורכי policy research ו־RCA.

‏אין Infinite Queueing ואין Infinite Repricing.

---

## ‏26. Alternatives

### ‏Direct SDK Everywhere

‏**Priority:** `Avoid Unless Evidence`

‏יתרון:

- ‏מהיר מאוד ל־POC קטן.

‏חסרונות:

- ‏coupling גבוה.
- ‏קשה ל־Replay/Paper/Fake.
- ‏SDK types דולפים ל־Risk/Strategy/UI.
- ‏migration ו־testing קשים.

### ‏Thin Adapter + Canonical Core

‏**Priority:** `P1 — Preferred Default`

‏זה ה־Baseline שנבחר.

### ‏Heavy Universal Multi-Broker Framework

‏**Priority:** `P4 — Specialist`

‏לא מתאים להתחלה. ייבנה רק אם Multi-Broker אמיתי הופך לדרישה.

### ‏Full Event Sourcing from Day One

‏**Priority:** `P3`

‏Event ledger כן; Event-Sourced architecture מלאה רק אם complexity/recovery requirements מצדיקים.

---

## ‏27. Trade-offs

### ‏Canonical abstraction

‏מרוויחים:

- ‏testability.
- ‏replay parity.
- ‏provider isolation.
- ‏clean RCA.

‏משלמים:

- ‏mapping layer.
- ‏schema/version maintenance.
- ‏אין abstraction שיכול להבטיח identical behavior בין Providers.

### ‏Reconciliation

‏מרוויחים:

- ‏recoverability.
- ‏state correctness.
- ‏protection מפני lost callbacks.

‏משלמים:

- ‏API budget.
- ‏state complexity.
- ‏additional test matrix.

### ‏Durable ledgers

‏מרוויחים:

- ‏audit/replay/RCA/restart.

‏משלמים:

- ‏storage/write-path complexity.

‏לכן שומרים durable רק state/evidence שיש לו ערך recovery או research ברור.

---

## ‏28. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏Universal Broker framework גדול.
- ‏כמה Execution Providers במקביל.
- ‏Provider-specific advanced algos בתוך Core.
- ‏Automatic fallback בין Order semantics.
- ‏Blind retries.
- ‏Unbounded Intent queues.
- ‏Broker SDK objects בכל layers.
- ‏`isConnected` בתור readiness.
- ‏Position שמבוסס על requested quantity.
- ‏Retry לאחר timeout בלי effect classification.
- ‏Resume אוטומטי אחרי reconnect.
- ‏UI ידני בתור source of truth.
- ‏Complex distributed orchestration לפני state machine/ledgers בסיסיים.

---

## ‏29. What to Add Later

### ‏`P2`

- ‏periodic reconciliation tuning.
- ‏outbox/inbox durability patterns.
- ‏stateful fake with richer fault injection.
- ‏capability-driven adapter conformance.
- ‏broker-event replay fixtures.

### ‏`P3`

- ‏advanced provider-specific execution extensions.
- ‏native protective-order capability evaluation.
- ‏parallel provider shadow comparison.
- ‏more advanced event sourcing/snapshotting.
- ‏chaos/stress tests on full lifecycle.

### ‏`P4`

- ‏Multi-Broker routing.
- ‏automatic provider failover.
- ‏provider selection engine.

‏רק אם Evidence עסקי/תפעולי מצדיק complexity.

---

## ‏30. Required Data / Evidence

‏כדי להעריך את Architecture נצטרך לשמור:

```text
intent lifecycle
canonical order lifecycle
raw provider result references
fill ledger
position snapshots
account/exposure snapshots
connection sessions
health/readiness transitions
reconciliation runs
mismatches/resolutions
latency distributions
rate-limit events
UNKNOWN_EFFECT incidents
restart/reconnect outcomes
```

‏ל־short-horizon strategy נוסיף:

```text
rank/score at signal, submit, first fill
signal age at submit/fill
late intent drops
broker-path execution deterioration
```

---

## ‏31. Promotion Criteria

‏Adapter/Architecture change יכול להתקדם רק אם:

1. ‏Canonical contract נשאר יציב או השינוי versioned במפורש.
2. ‏Conformance suite עוברת.
3. ‏Duplicate events אינם יוצרים duplicate state change.
4. ‏`UNKNOWN_EFFECT` מתאושש דרך reconciliation ללא duplicate exposure.
5. ‏Restart/reconnect scenarios חוזרים ל־known state.
6. ‏Position truth מתכנסת ל־authoritative execution evidence.
7. ‏Partial fills ו־cancel/fill race מתנהגים נכון.
8. ‏No silent capability fallback.
9. ‏Latency/backpressure נשארים בתוך research budget שנבדק.
10. ‏אין critical invariant breach פתוח.
11. ‏Shadow/Paper replay parity מוסברת.
12. ‏Observability מספיקה ל־RCA של כל lifecycle.

---

## ‏32. Rejection Criteria

‏נפסול/נחזיר ל־rework אם:

- ‏timeout יכול ליצור duplicate order workflow.
- ‏Reconnect מחזיר `READY` לפני sync.
- ‏Position נבנית מ־requested quantity.
- ‏callback כפול משנה Position פעמיים.
- ‏`UNKNOWN` נעלם באמצעות default value.
- ‏Broker-specific SDK type דולף ל־Strategy/Risk.
- ‏unsupported capability מקבלת fallback שקט.
- ‏reconciliation אינה מצליחה להתכנס.
- ‏external/manual state change אינו מזוהה.
- ‏queue מאפשר Intent שפג להישלח.
- ‏state קריטי אינו survive restart.
- ‏אין דרך לשחזר Incident.

---

## ‏33. Metrics

### ‏Reliability

```text
unknown_state_count
unknown_effect_count
reconciliation_mismatch_rate
reconciliation_failure_rate
duplicate_event_rate
position_mismatch_rate
restart_recovery_success_rate
reconnect_recovery_success_rate
```

### ‏Lifecycle

```text
submit_count
ack_count
reject_count
cancel_count
replace_count
partial_fill_count
fill_count
expired_intent_count
late_intent_drop_count
```

### ‏Latency

```text
intent_to_submit
submit_to_ack
ack_to_first_fill
cancel_to_confirm
reconnect_to_ready
```

‏כל אחד ב־`P50/P90/P95/P99/MAX`.

### ‏Short-horizon quality

```text
rank_decay_signal_to_submit
rank_decay_signal_to_fill
score_decay_signal_to_submit
score_decay_signal_to_fill
signal_survival_to_submit
signal_survival_to_fill
```

### ‏Health

```text
broker_ready_ratio
degraded_duration
stale_account_state_duration
stale_position_state_duration
rate_limit_events
```

---

## ‏34. Failure Modes

- ‏Fire-and-forget submit.
- ‏ACK treated as Position.
- ‏Timeout treated as Reject.
- ‏Blind retry after ambiguous side effect.
- ‏Duplicate fill double-counting.
- ‏Cancel/fill race lost.
- ‏Reconnect resumes without sync.
- ‏Local cache wins over execution evidence.
- ‏Stale account/position state treated as current.
- ‏Unsupported capability silently remapped.
- ‏Order/Position SDK model leaks into Strategy.
- ‏Intent queue accumulates stale opportunities.
- ‏Working/unknown orders omitted from Exposure.
- ‏External/manual changes ignored.
- ‏One giant Broker service owns Strategy/Risk/PnL/UI.
- ‏Adapter API version/capability drift unobserved.
- ‏Missing durable mapping after restart.
- ‏No raw evidence for normalized error.
- ‏No first-divergence trace from Signal to Fill.

---

## ‏35. Fact / Judgment / Hypothesis

### ‏Fact / engineering principle

- ‏External broker integration is asynchronous and can exhibit partial failure/ambiguity.
- ‏Command completion and business outcome are distinct.
- ‏Partial fills require position state based on actual fills.
- ‏Distributed-system retries require idempotency/effect awareness.
- ‏Reconciliation is necessary whenever local and external states can diverge.

### ‏Judgment

‏למערכת שלנו, ה־Baseline הנכון הוא:

```text
one provider adapter
+ canonical contracts
+ explicit order state machine
+ fill ledger
+ durable critical state
+ reconciliation engine
+ fail-closed readiness
+ conformance tests
```

### ‏Hypothesis

- ‏Broker-path latency materially affects the usefulness of the short-horizon signal.
- ‏A thin canonical adapter is sufficient without a larger universal framework.
- ‏Periodic reconciliation frequency can be kept moderate if event delivery proves reliable.
- ‏Provider-specific advanced capabilities may improve execution enough to justify extensions later.

‏כל Hypothesis תיבדק בניסוי/Shadow/Paper ולא תיכנס כ־assumption קבוע.

---

## ‏36. Confidence

### ‏High

- ‏`Intent != Order != Fill != Position`.
- ‏`ACK != Fill`.
- ‏`Timeout != Reject`.
- ‏`UNKNOWN` must be explicit.
- ‏actual position must be fill/reconciliation driven.
- ‏reconnect requires state synchronization before readiness.
- ‏blind write retries are unsafe under ambiguous effect.
- ‏canonical boundary materially improves testability and isolation.

### ‏Medium

- ‏single canonical adapter + single-writer aggregate is the best KISS implementation for our first provider.
- ‏event ledgers plus snapshots provide enough recovery without full event sourcing.
- ‏periodic reconciliation should exist in addition to event-driven reconciliation.

### ‏Low / Evidence Required

- ‏optimal reconciliation cadence.
- ‏specific retry/backoff timings.
- ‏specific API budgets.
- ‏provider-specific capability semantics.
- ‏whether native protective/execution features outperform application-managed behavior.

---

## ‏37. Time-Sensitive Facts

‏Sheet זה intentionally אינו מקבע:

```text
provider-specific API limits
session/auth behavior
specific order identifiers
supported order types
paper/live differences
pacing/rate limits
modify/cancel semantics
native protective-order semantics
```

‏כל אלה ייבדקו מול documentation רשמי ועדכני במקטע 30 ובכל integration ספציפי.

‏ה־Architecture כאן צריכה להישאר נכונה גם כאשר facts חיצוניים משתנים.

---

## ‏38. Current Verification Snapshot

‏לא בוצע Web verification חדש במקטע 29.

‏הסיבה: ההחלטות כאן הן Architecture/Distributed-Systems recommendations ואינן תלויות ב־Broker מסוים. הפרק עצמו דוחה בכוונה את ה־facts הספציפיים ל־IBKR/IBKR Israel למקטע 30, שבו נדרש אימות עדכני מול מקורות רשמיים.

---

## ‏39. Relationship to Earlier Sheets

### ‏16 — Entry / Execution

‏29 נותן boundary תפעולי ל־`Order Intent`, ‏TTL, price budget, partial-fill truth ו־reconciliation שהוגדרו שם.

### ‏18 — Costs / Net Edge

‏Broker path latency, rejects, fill quality ו־fees צריכים להזין את Cost/Net-Edge evidence.

### ‏19 — Risk

‏Risk authority נשאר מעל Adapter; Broker Reject אינו תחליף ל־Risk Engine.

### ‏21 — Execution Backtest

‏Canonical lifecycle מאפשר לסימולטור ול־Paper להשתמש באותו Contract.

### ‏27 — Replay

‏Broker events/ledgers צריכים להיות replayable, כולל First Divergence.

### ‏28 — Shadow / Paper

‏29 הופך Paper Adapter מ־integration חד־פעמי ל־conforming implementation של contract משותף.

---

## ‏40. Relationship to Later Sheets

### ‏30

‏יורד ל־facts וה־capabilities העדכניים של `IBKR / IBKR Israel` וממפה אותם ל־Architecture זו.

### ‏33–36

‏Production state machine, failure recovery, safety controls ו־kill switches ירחיבו את readiness/recovery model.

### ‏41

‏Advanced Broker Algos יהיו extension points מעל Core Path יציב — לא בסיס הארכיטקטורה.

### ‏Production Safety / Observability Packs

‏ה־metrics, invariants, reconciliation ו־incident evidence כאן יהפכו לחלק מה־Cross-Cutting packs הסופיים.

---

## ‏41. Concrete Baseline Contract

```text
1. Strategy creates Decision
2. Risk approves/reduces/rejects
3. Execution creates versioned Intent
4. Pre-submit contract rechecks freshness/state
5. Canonical OrderRequest gets stable ClientOrderId
6. Adapter validates capability/mapping
7. Command is sent asynchronously
8. Order remains non-final until canonical broker evidence arrives
9. Fills append to Fill Ledger and define position truth
10. UNKNOWN_EFFECT blocks conflicting writes
11. Reconciliation resolves ambiguity
12. Reconnect returns to SYNCING, not READY
13. Readiness resumes only after authoritative state + invariants
14. All state transitions are observable and replayable
```

### ‏Preferred Initial Architecture

```text
one execution provider
one Broker Adapter
one Canonical Broker Interface
one Order State Machine
one Fill Ledger
one Canonical Position model
one Reconciliation Engine
one Adapter Conformance Suite
```

### ‏Later Challengers

```text
outbox/inbox durability
richer event sourcing
advanced provider capabilities
parallel provider shadowing
multi-provider execution
```

---

## ‏42. Recommendation Summary

| תחום | המלצה | Priority |
|---|---|---:|
| Broker boundary | ‏Canonical Adapter | `P0/P1` |
| Truth model | ‏Intent truth separate from execution truth | `P0` |
| Order lifecycle | ‏Explicit state machine | `P0` |
| Position | ‏Fills + reconciliation only | `P0` |
| Timeout | ‏May be `UNKNOWN_EFFECT`; never assume reject | `P0` |
| Retry | ‏Effect-aware + idempotent | `P0` |
| Reconnect | ‏`SYNCING` before `READY` | `P0` |
| Reconciliation | ‏Startup/reconnect/incident + measured periodic | `P0/P1` |
| Capability mapping | ‏Explicit, versioned, no silent downgrade | `P0/P1` |
| Health | ‏multi-state readiness, not `isConnected` | `P0` |
| Queueing | ‏bounded + intent expiry | `P0/P1` |
| Persistence | ‏critical intent/order/fill/risk state durable | `P0/P1` |
| Testing | ‏conformance + stateful fake + golden scenarios | `P0/P1` |
| Observability | ‏full trace Signal→Fill + reconciliation metrics | `P0` |
| Multi-Broker | ‏defer until evidence | `P4` |
| Provider-specific facts | ‏verify in segment 30 | `P0 before integration` |

‏המסר המרכזי של מקטע 29:

> ‏**Broker API הוא distributed-system boundary, לא פונקציית `Buy/Sell`. ה־Strategy שומרת את ה־Intent, ה־Broker evidence שומר את מה שבוצע בפועל, ורק state machine, idempotency, ledgers ו־reconciliation מאפשרים לחבר ביניהם בבטחה ובצורה שניתנת לשחזור.**
