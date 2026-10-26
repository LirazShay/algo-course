# ‏33 — Recommendation Sheet: Production State Machine

> ‏מקור לימודי עיקרי: `../33-PRODUCTION-STATE-MACHINE.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline ארכיטקטוני למכונת המצבים של הרובוט כך שכל פעולה תלויה ב־State מוכח, כל מעבר מוסבר ומבוקר, `UNKNOWN` מטופל כמצב אמיתי, ו־Recovery/Resume אינם מדלגים על reconciliation.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה עם כסף אמיתי.

---

## ‏1. Decision

‏לא נבנה `boolean soup`, ולא נבנה `enum` מפלצתי שמערבב את כל העולם.

‏ה־Baseline הוא מספר State Machines אורתוגונליות, עם Composition Policy יחידה שמחשבת מה מותר כרגע.

```text
SystemState
+
TradingLifecycleState
+
BrokerState
+
MarketDataState
+
RiskState
+
StrategyState
+
Session / Instrument Tradability
→ Capability Evaluation
→ CanScan / CanEnter / CanExit / CanCancel / CanReconcile / CanResume
```

‏העיקרון המרכזי:

```text
State = what is true now
Policy = what we allow because of that state
Config = thresholds / versions / limits used by the policy
```

‏אסור לערבב בין שלושת אלה.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: `READY` הוא Contract, לא Label

‏`READY` מותר רק כאשר Preconditions מפורשים עוברים.

```text
BrokerState == READY
MarketDataState == HEALTHY
RiskState is ready
StrategyState is ready
ReconciliationClean == true
ClockHealthy == true
UniverseContextReady == true
NoCriticalUnknownState == true
```

‏`process alive` אינו `READY`.

‏`connected` אינו `READY`.

‏`UI green` אינו `READY`.

---

### ‏`P0 — Required`: Orthogonal State Machines

‏Baseline:

```text
SystemState:
  STARTING
  SYNCING
  READY
  DEGRADED
  PAUSED
  RECOVERING
  EXIT_ONLY
  FAULTED
  STOPPING
  STOPPED

TradingLifecycleState:
  FLAT
  ENTRY_INTENT
  ENTRY_PENDING
  PARTIALLY_FILLED
  POSITION_OPEN
  EXIT_INTENT
  EXIT_PENDING
  PARTIALLY_EXITED
  RECONCILING

BrokerState:
  DISCONNECTED
  CONNECTING
  CONNECTED_UNSYNCED
  SYNCING
  READY
  DEGRADED
  UNKNOWN

MarketDataState:
  DISCONNECTED
  CONNECTING
  WARMING_UP
  HEALTHY
  STALE
  PARTIAL
  DEGRADED
  FAILED

StrategyState:
  WARMING_UP
  ACTIVE
  ABSTAINING
  DISABLED
```

‏`RiskState` נשאר הרכיב שנקבע במקטע 19 וניתן לחברו כציר נוסף:

```text
NORMAL
REDUCED_SIZE
PAUSED
EXIT_ONLY
LOCKED
```

---

### ‏`P0 — Required`: Capability Composition במקום `if` מפוזר

‏פונקציה אחת קנונית מחשבת Capabilities.

```text
Capabilities = Evaluate(
    SystemState,
    TradingLifecycleState,
    BrokerState,
    MarketDataState,
    RiskState,
    StrategyState,
    SessionState,
    InstrumentTradability,
    unresolved_uncertainty)
```

‏Baseline conceptual result:

```text
CanScan
CanRank
CanCreateIntent
CanEnter
CanManagePosition
CanExit
CanCancel
CanReplace
CanReconcile
CanResume
CanStop
```

‏Strategy לא בודקת בעצמה עשרה booleans כדי לנחש אם מותר לשלוח Intent.

---

### ‏`P0 — Required`: `UNKNOWN` חוסם הגדלת Risk

‏כאשר אין לנו הוכחה לגבי Order/Position/Execution effect:

```text
UNKNOWN
→ block risk increase
→ query authoritative source
→ reconcile
→ validate invariants
→ resolve or escalate
```

‏אין blind retry.

‏אין `UNKNOWN = probably cancelled`.

‏אין `UNKNOWN = probably flat`.

---

### ‏`P0 — Required`: Startup הוא Recovery workflow

‏Baseline startup:

```text
STARTING
→ load durable config/state
→ connect broker/data boundaries
→ SYNCING
→ fetch broker orders/fills/positions/account state
→ reconcile
→ warm market-data state
→ warm strategy features
→ validate clock/session/universe
→ evaluate invariants
→ READY / EXIT_ONLY / FAULTED
```

‏אין New Entry לפני reconciliation.

---

### ‏`P0 — Required`: Position Management שורד Strategy/Data degradation

‏אם Position אמיתי קיים, הוא ממשיך לקבל Risk/Exit management גם אם:

```text
StrategyState != ACTIVE
MarketDataState != HEALTHY
SystemState != READY
```

‏ה־Policy המדויק תלוי ביכולת התפעולית, אך אין מצב שבו Scanner failure גורם למערכת “לשכוח” Position.

---

### ‏`P0 — Required`: `PAUSED` אינו Shutdown

‏Baseline `PAUSED`:

```text
new entries = blocked
new strategy-to-order conversions = blocked
broker callbacks = active
reconciliation = active
position management = active
risk monitoring = active
market data may remain active
```

‏`Resume` אינו `paused=false`.

‏הוא Mini-Reconciliation:

```text
ResumeRequested
→ verify broker state
→ verify working orders / positions
→ verify market-data freshness
→ verify risk/session/strategy readiness
→ invariants
→ READY / EXIT_ONLY / RECOVERING / FAULTED
```

---

### ‏`P0 — Required`: `EXIT_ONLY` הוא State מפורש

‏`EXIT_ONLY` נועד למצב שבו פעולות שמגדילות Exposure חסומות אך פעולות שמקטינות Exposure יכולות להמשיך.

```text
new entry = no
risk increase = no
risk-reducing exit = yes when feasible
cancel/replace for exit = yes when policy permits
reconciliation = yes
```

‏ההבחנה היא לפי `Risk Delta`, לא רק לפי Buy/Sell.

---

### ‏`P0 — Required`: Trading Lifecycle ו־Order Lifecycle נפרדים

‏Order State אינו Trading State.

```text
CanonicalOrderState:
  CREATED
  SUBMITTING
  SUBMITTED
  ACKNOWLEDGED
  PARTIALLY_FILLED
  FILLED
  CANCEL_REQUESTED
  CANCELLED
  REJECTED
  UNKNOWN
```

‏לדוגמה, `PARTIALLY_FILLED` יכול ליצור Position אמיתי כאשר Entry Order עדיין Working.

‏לכן:

```text
order state
!=
position state
!=
trade lifecycle state
```

---

### ‏`P0 — Required`: Events משנים State; Commands רק מבקשים

```text
Command: CancelOrder
Event: OrderCancelled
```

‏שליחת Command אינה הוכחה שה־State החיצוני השתנה.

‏כל Side Effect חיצוני מקבל lifecycle מפורש ו־correlation.

---

### ‏`P0 — Required`: Deterministic Reducer

‏Baseline processing:

```text
Event
→ Normalize
→ Validate
→ Reduce State
→ Evaluate Invariants
→ Derive Capabilities
→ Produce Commands
→ Execute Side Effects
```

‏ה־Reducer עצמו לא עושה network I/O.

```text
same old_state + same event
→ same new_state
```

‏זה מאפשר Replay אמיתי.

---

### ‏`P0 — Required`: Single Logical Writer ל־Critical Aggregates

‏Order/Position/Trade Lifecycle צריכים serialization לוגי.

‏לא ננהל transition של אותו Aggregate משני handlers מתחרים בלי version/serialization policy.

‏Baseline:

```text
single logical writer
+
state_version
+
idempotent event handling
```

‏Optimistic concurrency נשאר כלי משלים במקום שבו אין single writer.

---

### ‏`P0 — Required`: State Transition Audit

‏כל מעבר משמעותי נשמר:

```text
event_id
trace_id
entity_id
old_state
new_state
reason_code
source
event_time
processed_time
state_version
system_epoch
```

‏Operator commands נשמרים גם עם:

```text
actor
action
requested_at
reason
result
```

---

## ‏3. Why

### ‏3.1 State Bugs הם Production Bugs אמיתיים

‏מערכת יכולה לבחור Candidate נכון ועדיין להיכשל בגלל:

- ‏Fill כפול שנספר פעמיים.
- ‏Callback ישן שהגיע מאוחר.
- ‏Cancel acknowledgement אחרי Fill.
- ‏Restart באמצע `ENTRY_PENDING`.
- ‏Partial Fill שלא הפך ל־Position management.
- ‏Pause שהפסיק בטעות Exit logic.
- ‏Reconnect שהחזיר `READY` לפני reconciliation.
- ‏Timer שפעל אחרי שה־Trade כבר עבר State.

‏לכן State correctness הוא Safety infrastructure, לא קוסמטיקה.

### ‏3.2 Full-Market Ranking מוסיף Global Dependency

‏הרובוט שלנו בוחר Winner Cross-Sectional.

‏לכן readiness ל־Entry תלויה גם ב־Universe completeness/freshness, לא רק ב־Quote של Candidate.

```text
Top-1 fresh
+
Universe stale
≠
Trusted Rank
```

### ‏3.3 Recovery אינו Edge Case

‏במערכת ארוכת־חיים, disconnect/reconnect, restart, timeout ו־partial state הם חלק מה־happy path התפעולי.

---

## ‏4. Use When

‏Baseline זה מתאים במיוחד כאשר קיימים אחד או יותר מהתנאים הבאים:

- ‏Market Data ו־Execution הם boundaries נפרדים.
- ‏Orders asynchronous.
- ‏Partial fills אפשריים.
- ‏Process יכול ליפול ולהתחיל מחדש.
- ‏יש Pause/Resume תפעולי.
- ‏יש Whole-Market scanner עם Ranking.
- ‏יש `Shadow/Paper/Replay` שצריכים אותו lifecycle.
- ‏יש צורך ב־RCA מדויק.
- ‏יש state חיצוני שה־Broker authoritative לגביו.

---

## ‏5. Do Not Use When

‏לא צריך framework כבד של Statecharts/HSM רק כי המילה `State Machine` נשמעת מקצועית.

‏ל־POC קטן מספיק לעיתים:

```text
enums
+ explicit transition table
+ guards
+ deterministic reducer
+ durable audit
+ tests
```

‏אין צורך ב־distributed consensus, full Event Sourcing או formal verification בשלב הראשון.

---

## ‏6. Alternatives

### ‏Alternative A — Boolean Soup

```text
isConnected
isReady
isPaused
hasPosition
hasWorkingOrder
isRecovering
```

‏**Recommendation:** `Avoid`.

‏הבעיה: מאפשר combinations בלתי חוקיים ומפזר policy בכל הקוד.

### ‏Alternative B — Enum ענק אחד

```text
READY_FLAT
READY_ENTRY_PENDING
PAUSED_POSITION_OPEN
DEGRADED_EXIT_PENDING
...
```

‏**Recommendation:** `Avoid`.

‏הבעיה: combinatorial state explosion.

### ‏Alternative C — Orthogonal FSMs + Composition

‏**Recommendation:** `Preferred Default`.

### ‏Alternative D — Hierarchical State Machine framework

‏**Recommendation:** `P3 Challenger`.

‏רק אם transition complexity בפועל מצדיקה framework.

### ‏Alternative E — Full Event Sourcing

‏**Recommendation:** `P4 Specialist`.

‏יכול לתת reconstruction חזק, אך מגדיל משמעותית complexity. לא נדרש ל־Baseline.

---

## ‏7. Trade-offs

| החלטה | יתרון | מחיר |
|---|---|---|
| ‏Orthogonal FSMs | מונע state explosion | דורש Composition Policy טובה |
| ‏Fail-closed ל־Entries | מונע הגדלת Risk תחת uncertainty | יוצר missed opportunities |
| ‏Durable transition log | RCA/replay חזקים | storage/implementation burden |
| ‏Single logical writer | consistency פשוטה יותר | throughput/partitioning design |
| ‏Mini-reconciliation ב־Resume | correctness | Resume איטי יותר |
| ‏Hysteresis ל־health | פחות flapping | recovery-to-ready מעט איטי יותר |
| ‏Version pinning per Trade | reproducibility | config lifecycle מורכב יותר |

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏Full Event Sourcing לכל המערכת.
- ‏HSM framework כבד.
- ‏State אחד לכל שלב Scanner קטן.
- ‏Dynamic config hot-reload באמצע Position.
- ‏Automatic failover מורכב בין Providers.
- ‏Automatic fault acknowledgement.
- ‏Infinite auto-recovery loops.
- ‏Global `ERROR` state אחד.
- ‏`catch(Exception) => READY`.
- ‏UI שמעדכן State ישירות.
- ‏Timers מבוססי `Task.Delay` שמפוזרים בקוד העסקי.

---

## ‏9. What to Add Later

### ‏`P2` — State Hysteresis / Debounce

‏כניסה ל־degraded יכולה להיות מהירה, אך חזרה ל־ready דורשת healthy window יציב.

### ‏`P2` — Durable Timer Scheduler

‏Timer records עם expiry time מפורש, כך ש־restart אינו מאפס TTL.

### ‏`P2` — State Hash / Golden Traces

‏Hash של state אחרי checkpoints מרכזיים ו־golden event sequences.

### ‏`P2` — Auto-generated State Diagrams

‏Mermaid/Graphviz מתוך transition definitions.

### ‏`P3` — Model-based Testing

‏Generate random legal/illegal event sequences מול invariants.

### ‏`P3` — Hierarchical State Machine

‏רק אם complexity אמיתית מצדיקה.

### ‏`P4` — Formal Verification / Full Event Sourcing

‏רק אם Risk/scale/complexity בעתיד מצדיקים.

---

## ‏10. Required Data / Evidence

‏כדי שה־State Machine תהיה יותר מתרשים, נדרש לשמור Evidence.

### ‏10.1 Transition Definition

```text
transition_id
aggregate_type
current_state
event_type
guard
next_state
commands
timeout_policy
reason_code
version
```

### ‏10.2 Decision State Snapshot

‏לפני כל `ENTRY_INTENT` / Submit נשמור:

```text
system_state
trading_lifecycle_state
broker_state
market_data_state
risk_state
strategy_state
session_state
instrument_tradability
fresh_coverage_ratio
candidate_age
last_reconciliation_age
system_epoch
config_version
strategy_version
risk_version
```

### ‏10.3 Recovery Evidence

```text
recovery_id
recovery_reason
started_at
phase
attempt
broker_orders_snapshot
broker_positions_snapshot
local_snapshot
mismatches
invariants_result
completed_at
outcome
```

### ‏10.4 Orphan / Mismatch Evidence

```text
orphan_order
orphan_position
local_ghost
quantity_mismatch
status_mismatch
unknown_effect
```

---

## ‏11. Promotion Criteria

‏State model מתקדם מ־design ל־Shadow/Paper baseline רק אם:

1. ‏כל Critical State ו־Transition מוגדרים בטבלה.
2. ‏`READY` gate machine-readable.
3. ‏`CanEnter` ו־`CanExit` נובעים מפונקציה קנונית אחת.
4. ‏Startup לעולם אינו מדלג reconciliation.
5. ‏Restart ב־`ENTRY_PENDING` אינו יוצר Entry כפול.
6. ‏Partial Fill משוחזר כ־Exposure אמיתי.
7. ‏Duplicate Fill אינו מכפיל Position.
8. ‏Cancel/Fill race מסתיים ב־Position נכון.
9. ‏`UNKNOWN` חוסם הגדלת Risk.
10. ‏Pause אינו עוצר callbacks/reconciliation/position management.
11. ‏Resume מחייב mini-reconciliation.
12. ‏Data stale חוסם Entry חדש.
13. ‏Broker disconnect עם Position אינו מייצר `FLAT`.
14. ‏אותו Event Stream יוצר אותו State Trace ב־Replay.
15. ‏Operator commands audited.
16. ‏Critical invariants fail the run/test.

---

## ‏12. Rejection Criteria

‏ה־State architecture נדחית/דורשת Rework אם אחד מהבאים מתקיים:

- ‏אפשר להגיע ל־`READY` עם Broker unreconciled.
- ‏`UNKNOWN` מאפשר Entry חדש.
- ‏Pause מבטל Position management.
- ‏Local cache מנצח Broker truth ב־Position/Fill disagreement.
- ‏Duplicate event משנה state פעמיים.
- ‏Out-of-order event יכול להחזיר state אחורה ללא version semantics.
- ‏Working Order יכול להיות orphan בלי alert/recovery.
- ‏State transition אינו queryable עם reason.
- ‏Replay של אותו stream מייצר trace שונה.
- ‏Config hot reload משנה exit semantics באמצע Trade ללא pinning/policy.
- ‏Recovery יכול להישאר אינסופי ללא escalation.

---

## ‏13. Metrics

### ‏13.1 State Metrics

```text
state_transition_total{machine,from,to,reason}
state_duration_seconds{machine,state}
unexpected_transition_total
illegal_transition_total
state_flap_rate
```

### ‏13.2 Recovery Metrics

```text
recovery_total{reason,outcome}
recovery_duration_ms
recovery_attempts
reconciliation_age_ms
reconciliation_mismatch_total{type}
recovery_timeout_total
```

### ‏13.3 Order/Lifecycle Safety Metrics

```text
unknown_order_state_total
orphan_order_total
orphan_position_total
local_ghost_total
duplicate_fill_detected_total
cancel_fill_race_total
pending_exposure_count
```

### ‏13.4 Entry Readiness Metrics

```text
entry_block_total{reason}
ready_gate_failure_total{reason}
fresh_coverage_ratio
candidate_age_ms
last_full_fresh_coverage_age_ms
```

### ‏13.5 Operational Metrics

```text
paused_duration_seconds
exit_only_duration_seconds
degraded_duration_seconds
faulted_duration_seconds
last_transition_age
last_reconciliation_age
```

---

## ‏14. Failure Modes

### ‏14.1 Boolean Contradiction

```text
isReady = true
isRecovering = true
```

‏פתרון: mutually-exclusive state + derived capabilities.

### ‏14.2 State Explosion

‏פתרון: orthogonal machines, לא enum קרוס־פרודקט.

### ‏14.3 Command Treated as Fact

```text
CancelOrder sent
→ assume CANCELLED
```

‏פתרון: event/reconciliation determines truth.

### ‏14.4 Duplicate / Out-of-order Events

‏פתרון: event identity, state version, idempotency, serialization.

### ‏14.5 Restart During External Side Effect

‏פתרון: durable intent/correlation + broker reconciliation + unknown-effect state.

### ‏14.6 Pause Removes Safety

‏פתרון: pause blocks new Strategy activity, not Risk/Position management.

### ‏14.7 Reconnect Declared Ready Too Early

‏פתרון: reconnect → sync/reconcile → invariants → readiness.

### ‏14.8 Data Coverage Failure Hidden by Fresh Top-1

‏פתרון: market-wide rank trust gate.

### ‏14.9 Infinite Recovery

‏פתרון: recovery budget + escalation to `FAULTED`.

### ‏14.10 State Flapping

‏פתרון: hysteresis/debounce for non-critical health transitions.

### ‏14.11 Timer Fires in Wrong State

‏פתרון: timers as events carrying aggregate/state version/epoch; stale timer is ignored safely.

### ‏14.12 Hot Config Drift Mid-Trade

‏פתרון: version pinning per lifecycle or explicit migration policy.

---

## ‏15. User-Specific Application

‏לרובוט `Short-Horizon Momentum` שלנו יש כמה מאפיינים שהופכים את State Machine לקריטית במיוחד:

1. ‏`Top-1` הוא Cross-Sectional, ולכן `fresh_coverage_ratio` הוא חלק מ־Entry readiness.
2. ‏Signal עשוי לחיות שניות בלבד, ולכן Candidate יכול לפוג בזמן `ENTRY_INTENT`/validation.
3. ‏Market Data מגיע מספק רחב וה־Broker עשוי להיות IBKR, ולכן Data/Broker state אינם אותו דבר.
4. ‏Partial Fill הוא Position אמיתי מיד.
5. ‏Position אחד בכל פעם נשאר Baseline מחקרי, ולכן `CanEnter` פשוט יחסית ומחייב `FLAT` + no pending exposure.
6. ‏Fast Entry אינו מצדיק bypass של reconciliation או unknown-state policy.
7. ‏Exit path צריך להישאר זמין גם כאשר Scanner/Data layer degraded.
8. ‏Replay/Shadow/Paper צריכים להשתמש באותו reducer/lifecycle ככל האפשר.

‏Baseline conceptual entry gate:

```text
CanEnter =
    SystemState == READY
    && TradingLifecycleState == FLAT
    && BrokerState == READY
    && MarketDataState == HEALTHY
    && RiskAllowsEntry
    && StrategyState == ACTIVE
    && UniverseRankTrust == VALID
    && InstrumentTradability == TRADABLE
    && CandidateTTLValid
    && NoUnknownExposure
```

‏זה Gate תפעולי. הוא אינו מחליף את שאלת ה־Strategy האם Candidate ראוי בכלל.

---

## ‏16. Concrete Baseline Contract

### ‏16.1 System State

```text
STARTING
SYNCING
READY
DEGRADED
PAUSED
RECOVERING
EXIT_ONLY
FAULTED
STOPPING
STOPPED
```

### ‏16.2 Baseline Startup

```text
STARTING
→ LoadConfig
→ LoadDurableIntentAndAuditState
→ ConnectBroker
→ ConnectMarketData
→ SYNCING
→ FetchBrokerOrders
→ FetchBrokerExecutions
→ FetchBrokerPositions
→ Reconcile
→ WarmMarketData
→ WarmStrategy
→ ValidateClockSessionUniverse
→ EvaluateInvariants
→ READY / EXIT_ONLY / FAULTED
```

### ‏16.3 Baseline Entry

```text
READY + FLAT
→ CandidateSelected
→ ENTRY_INTENT
→ Persist immutable intent
→ Recheck candidate/data/rank/price budget
→ Risk approval
→ Verify broker readiness
→ Submit command
→ ENTRY_PENDING
→ Broker events
→ PARTIALLY_FILLED / POSITION_OPEN / REJECTED / UNKNOWN
```

### ‏16.4 Baseline Exit

```text
POSITION_OPEN / PARTIALLY_FILLED
→ ExitTrigger
→ EXIT_INTENT
→ Persist reason + urgency + reference
→ Submit/modify exit command
→ EXIT_PENDING
→ Broker fills
→ PARTIALLY_EXITED
→ broker-reconciled zero exposure
→ FLAT
```

### ‏16.5 Baseline Broker Disconnect

```text
READY/POSITION_OPEN
→ BrokerDisconnected
→ freeze risk-increasing actions
→ RECOVERING or EXIT_ONLY
→ reconnect
→ authoritative broker snapshot
→ reconcile
→ validate invariants
→ READY / EXIT_ONLY / FAULTED
```

### ‏16.6 Baseline Data Failure

```text
READY
→ MarketDataStale / FreshCoverageBelowThreshold
→ DEGRADED
→ block new entries
→ keep broker/risk/position lifecycle active
→ rebuild/warm state
→ stable healthy window
→ readiness evaluation
→ READY
```

### ‏16.7 Baseline Pause

```text
READY/DEGRADED
→ PauseRequested
→ block creation of new entry intents
→ PAUSED
→ callbacks/reconciliation/position management continue
→ ResumeRequested
→ mini-reconciliation
→ readiness checks
→ READY / RECOVERING / EXIT_ONLY / FAULTED
```

### ‏16.8 Baseline Unknown Effect

```text
Order request outcome uncertain
→ CanonicalOrderState.UNKNOWN
→ no risk increase
→ query broker
→ reconcile fills/orders/position
→ resolve to known state
→ otherwise escalate
```

### ‏16.9 State Owner Contract

```text
System coordinator      → SystemState
Lifecycle engine        → TradingLifecycleState
Broker adapter/events   → BrokerState / CanonicalOrder events
Market data layer       → MarketDataState
Risk engine             → RiskState
Strategy engine         → StrategyState
Operator commands       → request transitions, never direct state mutation
```

### ‏16.10 Minimum Durable Trade Record

```text
intent
order correlation IDs
fills
position transitions
exit reason
system-state transitions
strategy/config/risk versions
system epoch
```

---

## ‏17. Hard Invariants

‏ה־Baseline יכשיל Test/Replay כאשר אחד מהבאים נשבר:

```text
1. No new entry unless SystemState == READY.
2. No risk increase while Broker/Order state is UNKNOWN.
3. No entry while broker reconciliation is unresolved.
4. No entry with stale/untrusted full-market context.
5. No entry without risk approval.
6. Every non-zero broker position is represented as exposure locally after reconciliation.
7. Every non-zero position has active position/risk management.
8. Every broker order maps to a known intent or is explicitly flagged orphan.
9. Duplicate fill cannot change position twice.
10. Confirmed cancel does not erase a fill that already occurred.
11. FLAT requires broker-reconciled zero exposure.
12. Resume cannot bypass reconciliation/readiness checks.
13. Restart cannot skip authoritative broker sync.
14. Same event stream + same versions => same state transition trace.
15. Stale timer/event from an old epoch cannot mutate current lifecycle.
```

---

## ‏18. Testing Strategy

### ‏18.1 Transition Tests

```text
Given state
When event
Then next state
And commands
And invariant result
```

### ‏18.2 Invalid Transition Tests

‏לדוגמה:

```text
SystemState READY
Event FILLED
```

‏אם event שייך ל־Order/Lifecycle aggregate ולא ל־System aggregate, הוא לא אמור ליצור transition גלובלי מקרי.

### ‏18.3 Golden State Traces

‏נשמור לפחות:

- ‏Clean startup.
- ‏Entry → partial → full.
- ‏Entry reject.
- ‏Entry unknown effect.
- ‏Pause during `ENTRY_PENDING`.
- ‏Partial fill + pause.
- ‏Partial fill + crash + restart.
- ‏Cancel request + fill + cancel ack.
- ‏Broker disconnect with Position.
- ‏Data stale with Position.
- ‏Fresh-coverage collapse while Flat.
- ‏Resume with existing Position.
- ‏Orphan broker order.
- ‏Orphan position.
- ‏Duplicate Fill.
- ‏Out-of-order broker events.
- ‏Recovery timeout → `FAULTED`.

### ‏18.4 Property Tests

‏Properties לדוגמה:

```text
never submit entry when SystemState != READY
never increase exposure while unresolved UNKNOWN exists
never become FLAT only because an exit command was sent
never lose a broker fill because an operator pause happened first
```

### ‏18.5 Replay Determinism

‏אותו canonical event stream חייב לייצר אותו:

```text
transition trace
command ledger
final state
state hash
```

---

## ‏19. Observability Contract

‏Minimum dashboard:

```text
SystemState + age + reason
TradingLifecycleState + age
BrokerState + age
MarketDataState + age
RiskState
StrategyState
current position
working orders
pending exposure
fresh coverage
candidate age
last reconciliation age
recovery phase
last transition reason
system epoch
```

‏Minimum alerts:

```text
unexpected/illegal transition
state stuck too long
position mismatch
orphan order
orphan position
unknown order state
broker disconnected with exposure
data stale with exposure
recovery timeout
state flapping
reconciliation age too high
```

---

## ‏20. Recovery / State Priorities

‏כאשר Events מתחרים באותו זמן, ה־processing policy חייב להיות deterministic.

‏Baseline priority class:

```text
1. Broker truth / fill / position events
2. Risk-critical events
3. Recovery / reconciliation events
4. Operator safety commands
5. Market-data health events
6. Strategy/candidate events
```

‏זו `Judgment` התחלתית, לא חוק אוניברסלי. ההכרעה המעשית היא ש־Safety/Execution truth לא יידחו מאחורי Candidate חדש.

‏State transitions של אותו Aggregate עוברים serialization.

---

## ‏21. Epoch / Generation Contract

‏נשתמש ב־`system_epoch` או generation דומה כאשר transition משמעותי הופך Intents ישנים לחשודים.

‏דוגמאות ל־epoch boundary:

- ‏Process restart.
- ‏Broker reconnect + reconciliation cycle.
- ‏Provider feed rotation.
- ‏Critical config activation.
- ‏Manual transition ל־`EXIT_ONLY`/`FAULTED` כאשר policy קובעת invalidation.

‏Intent/Event/Timer ישנים שאינם שייכים ל־epoch הנוכחי חייבים revalidation או discard מפורש.

---

## ‏22. Config / Version Policy

‏Decision/Intent שומר:

```text
strategy_version
config_version
risk_version
feature_version
score_version
execution_policy_version
state_machine_version
```

‏Baseline:

- ‏Strategy config רגישה מתחלפת כשהמערכת `FLAT`, אלא אם קיימת migration policy מפורשת.
- ‏Trade שכבר פתוח שומר Version Pinning למה שנדרש כדי למנוע Exit semantics מפתיעות.
- ‏State Machine definition עצמה versioned.

---

## ‏23. Readiness vs Liveness

‏אם בעתיד יש service probes:

```text
Liveness:
  process alive and capable of participating in recovery

Readiness:
  dependencies/invariants satisfy the declared operating capability
```

‏אין להגדיר orchestrator policy שגורמת ל־restart blind בזמן שהמערכת מחזיקה Exposure לא reconciled.

---

## ‏24. Failure Handling Philosophy

‏State Machine לא מנסה “להמשיך תמיד”.

‏היא מנסה לדעת:

```text
what we know
what we do not know
what is allowed
what is forbidden
what evidence is required to proceed
```

‏זהו ה־Production contract החשוב ביותר של מקטע 33.

---

## ‏25. Confidence

### ‏High Confidence

- ‏`READY` כ־Contract ולא Label.
- ‏Orthogonal state machines.
- ‏Startup reconciliation לפני new entries.
- ‏Broker truth ל־orders/fills/positions.
- ‏`UNKNOWN` שחוסם risk increase.
- ‏Pause/Resume semantics עם continued position management.
- ‏Deterministic reducer + replay parity.
- ‏Explicit invariants ו־reason codes.

### ‏Medium-High Confidence

- ‏Single logical writer ל־critical aggregates.
- ‏State version + idempotency.
- ‏Epoch/generation לביטול stale intents/events.
- ‏Version pinning per lifecycle.

### ‏Medium / Evidence Required

- ‏ה־priority ordering המדויק בין classes של events.
- ‏Hysteresis/debounce windows.
- ‏Recovery attempt/duration budgets.
- ‏אילו degraded modes עדיין מאפשרים אילו capabilities.

### ‏Low / Not Yet Proven

- ‏Need for HSM framework.
- ‏Need for full Event Sourcing.
- ‏Need for formal verification.

---

## ‏26. Time-Sensitive Facts

‏המקטע עצמו כמעט כולו מתודולוגי.

‏אין כאן מספרי API, broker pacing, fee schedule או entitlement חדשים.

‏Facts תלויי Broker/Data Provider נשארים אלו שאומתו במקטעים 30–32 וצריכים re-verification לפני שימוש תפעולי.

---

## ‏27. Current Verification Snapshot

‏לא נדרש Web verification חדש למקטע 33.

‏ה־Recommendation נובעת מ־state/recovery architecture וממקור הקורס, ולא ממפרט חיצוני משתנה.

---

## ‏28. Relationship to Earlier Sheets

### ‏19 — Position Sizing / Risk

‏`RiskState` ו־pending exposure נכנסים ל־Capability composition.

### ‏21 — Realistic Execution Backtest

‏Partial fills, cancel races, TTL ו־actual fill truth הופכים ל־lifecycle transitions.

### ‏27 — Deterministic Replay

‏אותו event stream צריך ליצור אותו transition trace.

### ‏28 — Shadow / Paper

‏אותה lifecycle logic צריכה לפעול גם ב־Shadow/Paper עם adapters שונים.

### ‏29 — Broker API Architecture

‏Canonical Broker events מזינים את ה־State Machine; Broker SDK עצמו אינו State model.

### ‏30 — IBKR Deep Dive

‏Session/connectivity/reconciliation quirks נכנסים דרך Adapter/Capabilities, לא דרך Strategy.

### ‏31–32 — Market Data / Execution Separation

‏Data/Broker health וה־Source-of-Truth matrix הופכים לצירים מפורשים במודל.

---

## ‏29. Relationship to Later Sheets

### ‏34 — Failure Recovery

‏מקטע 34 יעמיק את `RECOVERING`: phases, authoritative rebuild, network partition, unknown effects, crash consistency, safe resume ו־escalation.

### ‏35 — Monitoring / Logging / Observability

‏State transitions, state age, reconciliation age ו־reason codes יהפכו ל־dashboards/alerts.

### ‏36 — Kill Switches / Safety Controls

‏Kill switch יפעל דרך State/Capability transitions, לא דרך `process.kill()` עיוור.

### ‏41 ואילך

‏Execution monitoring, operational controls ו־production hardening ישתמשו ב־State Machine כ־orchestration contract.

---

## ‏30. Recommendation Summary

### ‏Baseline

```text
Orthogonal FSMs
+ explicit transition table
+ deterministic reducer
+ canonical events
+ capability composition
+ broker reconciliation
+ durable transition audit
+ hard invariants
+ replay parity
```

### ‏Preferred Default

```text
SystemState
TradingLifecycleState
BrokerState
MarketDataState
RiskState
StrategyState
→ one capability evaluator
```

### ‏P0 Rules

```text
READY is proven, never assumed
UNKNOWN blocks risk increase
startup/restart require reconciliation
pause does not disable position management
FLAT requires broker-reconciled zero exposure
partial fill creates real exposure
commands are not facts
same events produce same state trace
```

### ‏Challengers Later

```text
hysteresis/debounce tuning
state hashes
auto-generated diagrams
model-based testing
hierarchical state machines
full event sourcing
formal verification
```

### ‏Final Recommendation

‏עבור הרובוט שלנו, State Machine אינה שכבת “Production polish”. היא החוזה שמונע מהמערכת לפעול על הנחות שקריות בזמן reconnect, partial fill, stale data, Pause או restart.

‏הגרסה הראשונה צריכה להיות פשוטה אך קשיחה:

```text
explicit states
→ explicit events
→ explicit guards
→ explicit commands
→ explicit invariants
→ explicit recovery evidence
```

‏הערך אינו במספר המצבים. הערך הוא שבכל רגע אפשר לענות באופן מכני:

```text
What do we know?
What is uncertain?
What may we do?
What is forbidden?
What evidence is required before proceeding?
```
