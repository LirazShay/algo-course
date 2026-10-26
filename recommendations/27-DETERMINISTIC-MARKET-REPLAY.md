# ‏27 — Recommendation Sheet: Deterministic Market Replay

> ‏מקור לימודי עיקרי: `../27-DETERMINISTIC-MARKET-REPLAY.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline ל־`Replay` שבו ניתן לקחת Market Tape מוקלט, להזרים אותו מחדש Event-by-Event דרך אותו Core של המערכת, לקבל שוב את אותו State / Features / Rank / Decision, ולהשתמש בכך ל־RCA, regression, comparison ו־controlled experiments — בלי לערבב בין עובדות מוקלטות לבין סימולציה היפותטית ובלי לאפשר ל־wall clock, thread scheduling או hidden randomness לשנות את התוצאה.
>
> ‏המקטע ממשיך במיוחד את 20, 21 ו־26: ‏20 הגדיר Timeline Integrity; ‏21 הגדיר Execution Simulation ריאליסטי; ‏26 הגדיר First-Divergence RCA. ‏27 מחבר אותם לתשתית זמן־מכונה שמאפשרת לשחזר כל רגע ולשאול מה המערכת ידעה, למה בחרה, ומה גרסה אחרת הייתה עושה על אותו Tape.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
Can historical data be played back?
```

‏אלא:

```text
Given the same recorded tape,
the same code/version/config,
and the same deterministic simulation assumptions,
can the system rebuild the same state
and produce the same decisions every time?
```

‏ה־Baseline שנבחר:

```text
Immutable Recorded Events
→ Canonical Event Reader
→ Deterministic Ordering
→ ReplayClock / Virtual Time
→ Same Market-State Core
→ Same Feature / Filter / Score / Rank Core
→ Same Risk Engine
→ SimulatedBroker
→ Decision / Order / Fill Ledgers
→ Deterministic Hashes + Run Diff
→ RCA / Regression / Controlled Experiments
```

‏`Replay` אינו Backtest נוסף עם קוד מיוחד; הוא דרך אחרת להזין את אותו Core.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: אותו Decision Core ב־Replay וב־Live

‏ב־Live:

```text
LiveFeed
→ CanonicalEventBus
→ Strategy Core
```

‏ב־Replay:

```text
ReplayReader
→ CanonicalEventBus
→ Strategy Core
```

‏כל מה שאחרי `CanonicalEventBus` צריך להיות משותף ככל האפשר:

```text
MarketState
Features
Filters
Score
Rank
Trade / No Trade
Risk
Order Intent
```

‏אסור ליצור:

```text
if (replay)
    use easier strategy logic
```

‏אלא אם מדובר ב־adapter תפעולי מפורש שאינו משנה semantics.

### ‏`P0 — Required`: `ReplayClock` בלבד בתוך Strategy Semantics

‏כל logic תלוי זמן משתמש ב־clock abstraction:

```text
IClock
├─ SystemClock
└─ ReplayClock
```

‏זה חל על:

```text
feature age
quote age
signal TTL
order TTL
position timeout
cooldown
heartbeat timeout
session boundaries
```

‏Strategy logic אינה קוראת ישירות:

```text
DateTime.UtcNow
Task.Delay
Thread.Sleep
system local time
```

‏כמקור זמן סמנטי.

### ‏`P0 — Required`: Canonical deterministic ordering

‏לכל Event נשמור לפחות:

```text
event_id
event_type
symbol / instrument_id
event_time
received_time when available
provider_sequence when available
ingest_sequence
provider
payload
```

‏Baseline ordering:

```text
1. event_time
2. provider_sequence when meaningful
3. received_time
4. stable ingest_sequence
```

‏אם semantics של Provider דורשים ordering אחר — הוא חייב להיות versioned ומתועד.

‏אותם Events חייבים להיכנס תמיד באותו סדר.

### ‏`P0 — Required`: `Replay != Simulation`

‏נפריד:

```text
Recorded Facts
vs
Hypothetical Consequences
```

‏לדוגמה:

```text
Recorded quote/trade = fact
Would our order fill? = simulation
```

‏לכן:

```text
Recorded Market Events
→ Replay
→ Versioned Execution Simulation
```

‏Execution Model אינו רשאי להיטמע בשקט בתוך ה־Tape.

### ‏`P0 — Required`: Dataset ו־Run immutable/versioned

‏Dataset מקבל:

```text
dataset_id
schema_version
trading_date
provider / source_profile
coverage_profile
created_at
checksum
cleaning_profile
calendar/session metadata
```

‏אם מתקנים Raw Data:

```text
new dataset version
```

‏ולא mutation שקט.

‏כל Run מקבל:

```text
replay_run_id
code_commit
strategy_version
feature_version
filter_version
score_version
risk_version
execution_model_version
config_hash
dataset_id
random_seed
replay_mode
start_time
end_time
```

### ‏`P1 — Preferred Default`: `FUNCTIONAL_DETERMINISTIC` לפני Performance Replay

‏שני סוגי Run שונים:

```text
FUNCTIONAL_DETERMINISTIC
```

‏בודק:

```text
Is logic/state correct?
```

‏Event הבא מתקדם רק לאחר שהמערכת סיימה לעבד את הקודם/ה־boundary הנדרש.

‏לעומתו:

```text
PERFORMANCE_STRESS
```

‏בודק:

```text
Can the system keep up with recorded arrival pressure?
```

‏ושומר queue/backpressure אמיתיים.

‏אסור לערבב בין שתי המטרות.

### ‏`P1 — Preferred Default`: Replay speed אינו משנה decisions

‏ב־Functional Replay:

```text
1x
10x
100x
MAX_SPEED
```

‏צריכים לייצר את אותו:

```text
Decision Ledger
Order Intent sequence
Simulated Fill Ledger
Final logical state
```

‏כאשר execution assumptions זהים.

‏אם speed משנה Strategy outcome — יש hidden wall-clock dependency או race/nondeterminism שדורש RCA.

### ‏`P1 — Preferred Default`: Whole-market Replay עבור Scanner Cross-Sectional

‏לרובוט שבוחר Top Candidate מכל השוק, Replay של Symbol אחד אינו מספיק כדי לשחזר Rank.

‏נדרש לשמר:

```text
eligible universe
coverage by symbol
whole-market candidate set
cross-sectional normalization inputs
ranking population
```

‏אם coverage אינה מספקת:

```text
ranking_validity = INVALID / DEGRADED
```

‏ולא Rank שנראה מדויק אך מבוסס על Universe חלקי.

### ‏`P1 — Preferred Default`: Ledgers מפורשים

‏לפחות:

```text
Decision Ledger
Order Ledger
Fill Ledger
Position/Risk Ledger
Data-Quality Ledger
```

‏כך ניתן לבצע First-Divergence Diff בלי להסתמך על Log טקסטואלי בלבד.

### ‏`P1 — Preferred Default`: Deterministic output fingerprints

‏ל־Run יישמרו hashes של outputs יציבים, למשל:

```text
decision_ledger_hash
order_ledger_hash
fill_ledger_hash
final_state_hash
```

‏אותו Contract:

```text
Dataset D
+ Commit C
+ Config K
+ Seed S
+ Simulation Version E
= Output Hash H
```

‏שבירה לא צפויה של החוזה היא Failure מחקרי/תפעולי.

---

## ‏3. Why

### ‏Fact

‏מערכת Event-driven יכולה להגיע לתוצאה שונה כאשר אותו מידע מעובד בסדר שונה.

‏Timers, TTL, rank updates, partial fills ו־cancel/fill races תלויים בזמן ובסדר.

‏לכן snapshot סופי בלבד אינו מספיק כדי להבין מה קרה.

### ‏Fact

‏`Replay` ו־`Simulation` אינם אותו דבר:

- ‏Replay מחזיר Facts מוקלטים.
- ‏Simulation מייצרת consequences שלא נצפו בפועל עבור פעולה היפותטית שלנו.

### ‏Fact

‏Whole-market Rank אינו ניתן לשחזור נאמן אם חסרים חלקים מה־Universe שהיו יכולים להתחרות על אותו Rank.

### ‏Judgment

‏עבור רובוט short-horizon שלנו, Replay דטרמיניסטי הוא תשתית `P0/P1` למחקר מקצועי, משום ש־RCA, regression ו־comparison מאבדים משמעות כאשר אותה הרצה אינה ניתנת לשחזור.

### ‏Judgment

‏נעדיף architecture שבה Strategy אינה יודעת אם היא ב־Live או Replay. ההבדל צריך להיות ב־Data Source, Clock ו־Broker adapter.

### ‏Hypothesis

‏Golden Replay Suite טובה תקטין משמעותית regressions ותאיץ RCA/learning loop. את גודל השיפור בפועל נמדוד בהמשך דרך defect recurrence, mean-time-to-first-divergence ו־experiment throughput.

---

## ‏4. Use When

‏`Replay` ישמש לפחות עבור:

1. ‏שחזור Trade/Decision מסוים.
2. ‏RCA ל־Rank #1 שנכשל.
3. ‏RCA ל־`NO_TRADE` או Missed Opportunity.
4. ‏השוואת שתי Strategy Versions על אותו Tape.
5. ‏Golden regression scenarios.
6. ‏בדיקת Restart/Reconciliation State Machine.
7. ‏בדיקת Risk Engine לאורך יום שלם.
8. ‏בדיקת signal/rank decay מ־signal→submit→fill.
9. ‏בדיקת entry/exit challengers על market path קבוע.
10. ‏Performance replay של open/burst periods.
11. ‏Fault injection של feed/broker/system failures.
12. ‏Shadow-vs-replay parity analysis בעתיד.

---

## ‏5. Do Not Use When

‏Replay לבדו אינו מספיק כדי להוכיח:

- ‏שה־Edge ימשיך בעתיד.
- ‏שה־Execution Simulator מדמה Venue/Broker באופן מושלם.
- ‏שה־Strategy robust ל־regime shift.
- ‏ש־live queue position ידועה.
- ‏ש־hidden liquidity משוחזרת.
- ‏ש־network/broker routing אמיתי משוחזר במדויק.
- ‏ש־Paper/Shadow/Live validation מיותר.

‏לכן Replay הוא גשר, לא Production proof סופי.

---

## ‏6. Concrete Baseline Contract

### ‏6.1 Canonical Event Envelope

```text
event_id
event_type
instrument_id
symbol_at_event_time
event_time
received_time
provider_sequence
ingest_sequence
provider
session_state
payload_schema_version
payload
quality_flags
```

‏Fields שאינם זמינים נשמרים כ־missing/unknown באופן מפורש — לא מומצאים.

### ‏6.2 Event types baseline

```text
TRADE
QUOTE
MARKET_STATUS
HALT
RESUME
SESSION_CHANGE
DATA_QUALITY
```

‏ל־System/Execution Replay נוסיף:

```text
ORDER_INTENT
ORDER_ACK
ORDER_REJECT
PARTIAL_FILL
FILL
CANCEL_REQUEST
CANCEL_ACK
BROKER_STATUS
RECONCILIATION_EVENT
```

### ‏6.3 Replay modes baseline

```text
FUNCTIONAL_DETERMINISTIC
REALTIME_1X
ACCELERATED
PERFORMANCE_STRESS
INCIDENT_DEBUG
```

‏כל Run חייב להצהיר mode מפורש.

### ‏6.4 Replay lifecycle

```text
CREATED
→ LOADING
→ WARMING_UP
→ RUNNING
↔ PAUSED
→ COMPLETED
```

‏עם branches תפעוליים:

```text
SEEKING
FAILED
CANCELLED
```

### ‏6.5 Warm-up contract

‏Feature שלא מחזיק מספיק history הוא:

```text
WARMING_UP
```

‏ולא:

```text
0
```

‏Entry חדשה אינה מותרת עד שכל Feature/Gate מחייב הגיע למצב usable.

### ‏6.6 Strategy parity contract

```text
same event semantics
same feature definitions
same filter definitions
same score/ranking semantics
same candidate gate
same risk engine
same position accounting
```

‏הבדלים בין Replay ל־Live חייבים להיות adapters, לא Strategy logic סמוי.

---

## ‏7. Event Ordering Policy

### ‏Baseline

‏נבחר ordering מפורש, versioned ו־stable.

‏כאשר `event_time` זהה:

```text
provider sequence
→ receive time
→ ingest sequence
```

‏לפי זמינות והגדרת Provider.

### ‏Out-of-order events

‏ה־Dataset preprocessing יכול:

```text
preserve raw arrival order
and/or
produce canonical market-time ordering
```

‏אבל שני ה־profiles חייבים לקבל שמות/versions שונים.

‏אין “תיקון ordering” שקט.

### ‏Duplicates

‏Duplicate handling חייב להיות deterministic:

```text
KEEP
DROP_BY_EVENT_ID
DROP_BY_PROVIDER_SEQUENCE
FLAG_ONLY
```

‏והמדיניות versioned.

### ‏Gaps

‏Sequence gap נשמר כחלק מה־Tape/quality ledger.

‏למחקר קריטי אפשר:

```text
FAIL
```

‏ולמחקר robustness:

```text
MARK_UNRELIABLE
WARN_AND_CONTINUE
```

‏אבל policy חייבת להיות חלק מה־Run Manifest.

---

## ‏8. Replay Clock / Virtual Time

### ‏Baseline

‏Virtual clock מתקדם אל:

```text
next event time
next scheduled timer boundary
next strategy cadence boundary
next broker-simulation event
```

‏לפי event scheduler דטרמיניסטי.

### ‏Timers

‏ה־scheduler חייב לטפל ב:

```text
scanner cadence
order TTL
signal TTL
position max-hold
cooldown
heartbeat/data timeout
risk reset boundaries
session boundaries
```

### ‏Invariant

```text
wall-clock speed must not alter logical timestamps
```

### ‏Pause

‏`PAUSED` אינו משנה replay state ולא מקדם virtual time.

### ‏Step

‏Baseline debug commands:

```text
NEXT_EVENT
NEXT_DECISION
NEXT_ORDER
NEXT_FILL
NEXT_100MS
NEXT_1S
```

‏הם debug controls בלבד ואינם משנים semantics.

---

## ‏9. Replay vs Simulation Boundary

‏נשמור שלוש שכבות מובחנות:

```text
1. RECORDED_FACT
2. DERIVED_STATE
3. SIMULATED_CONSEQUENCE
```

### ‏Recorded Facts

‏לדוגמה:

```text
market trade
bid/ask update
halt
recorded broker ack from incident tape
```

### ‏Derived State

```text
feature value
rank
candidate count
regime context
```

### ‏Simulated Consequences

```text
hypothetical order fill
hypothetical slippage
hypothetical cancel race
hypothetical exit
```

‏כל result/report צריך להיות מסוגל לציין מה Observed ומה Simulated.

---

## ‏10. Execution Replay Contract

‏מקטע 21 נשאר authority ל־Execution Fidelity.

‏ב־Replay נדרוש:

```text
execution_model_version
latency_model_version
slippage_model_version
fill_model_version
cost_model_version
random_seed when stochastic
```

‏Position Truth נגזרת מ־fills processed עד הזמן הנוכחי בלבד.

‏Working Order state חייב לכבד lifecycle:

```text
intent
→ submitted
→ acknowledged
→ partial fill / fill / reject
→ cancel pending
→ cancelled / filled
```

‏`Cancel Request` אינו terminal state.

---

## ‏11. Whole-Market Integrity

### ‏Baseline

‏לכל run נשמור:

```text
universe_version
expected_symbol_count
observed_symbol_count
coverage_ratio
missing_symbols
late_symbols
session eligibility
```

### ‏Cross-sectional validity

‏אם Ranking דורש whole-market comparison וה־coverage מתחת לסף מחייב:

```text
ranking_state = INVALID
```

‏או:

```text
run_fidelity = DEGRADED
```

‏בהתאם למטרת run.

### ‏Do not replay selected symbols only

‏Incident Replay קטן יכול להתמקד ב־Top-N/target symbol רק אם:

- ‏יש checkpoint שמכיל את cross-sectional state הנחוץ, או
- ‏המטרה אינה לשחזר מחדש whole-market ranking.

‏אחרת נייצר selection bias.

---

## ‏12. Dataset Manifest

‏Dataset baseline:

```text
dataset_id
schema_version
trading_date
calendar_version
session_schedule
provider/source_profile
coverage_profile
universe_version
start_time
end_time
trade_count
quote_count
status_event_count
broker_event_count when present
sequence_gap_count
duplicate_count
out_of_order_count
cleaning_profile
checksum
created_at
```

### ‏Raw vs cleaned

‏נשמור במפורש:

```text
RAW_OPERATIONAL
RESEARCH_CLEANED
```

‏ולא נערבב ביניהם תחת אותו `dataset_id`.

### ‏Corporate actions

‏Raw quotes/trades אינם מוחלפים בשקט במחירים adjusted בדיעבד.

‏אם נדרש normalized research view — זו derived layer/version נפרדת.

---

## ‏13. Checkpoints / Seek

### ‏Baseline

‏לא נבנה Checkpoint subsystem מלא לפני שיש צורך ביצועים אמיתי.

‏בשלב ראשון:

```text
session start
→ replay forward
```

‏הוא source-of-truth path.

### ‏Add Later

‏כאשר Incident/Seek latency נהיה bottleneck:

```text
load nearest compatible checkpoint
→ replay forward to target
```

### ‏Checkpoint content

‏לפי הצורך:

```text
market state
feature rolling windows
ranking state
position state
working orders
risk state
clock
scheduler/timers
sequence cursor
```

### ‏Checkpoint versioning

```text
snapshot_schema_version
strategy_compatibility
state_model_version
```

‏Checkpoint incompatible אינו נטען בכוח.

---

## ‏14. Ledgers

### ‏Decision Ledger

```text
decision_time
instrument_id
rank
score
feature_snapshot_id
filter_state
candidate_gate_state
regime_snapshot_id
risk_state
decision
reason_codes
strategy_version
```

### ‏Order Ledger

```text
order_intent_id
intent_time
submit_time
broker_order_id_simulated
order_type
limit_price
qty
state_transitions
cancel_state
execution_model_version
```

### ‏Fill Ledger

```text
fill_id
fill_time
fill_price
fill_qty
remaining_qty
reference_quote
slippage_bps
```

### ‏Position/Risk Ledger

```text
position_qty
cost_basis
reserved_capital
realized_pnl
unrealized_pnl
risk_state
kill_switch_state
```

### ‏Data Quality Ledger

```text
feed_state
coverage_state
sequence_gap
stale_state
latency_state
provider_mismatch
```

---

## ‏15. Determinism Contract

‏Run נחשב deterministic רק אם rerun זהה מחזיר לפחות:

```text
same normalized event sequence
same feature snapshots
same filter outcomes
same rank sequence
same trade/no-trade decisions
same order intents
same simulated fills given same seed/model
same final state
```

### ‏Randomness

‏אם latency/fill/slippage model stochastic:

```text
random_seed = explicit
```

‏ואפשר להריץ Seed Sweep כניסוי נפרד.

### ‏Concurrency

‏Parallel compute מותר, אבל merge/publication order חייב להיות deterministic.

‏לדוגמה:

```text
parallel feature compute
→ barrier at ranking_as_of_time
→ stable deterministic publish
```

### ‏Stable tie-breaks

‏ל־equal score:

```text
secondary deterministic metric
→ canonical instrument id
```

‏לא `unordered collection iteration order`.

---

## ‏16. Run Diff / First Divergence

‏השוואת גרסאות אינה מתחילה ב־PnL.

‏נמצא:

```text
first_event_state_divergence
first_feature_divergence
first_filter_divergence
first_rank_divergence
first_decision_divergence
first_order_divergence
first_fill_divergence
```

‏לאחר מכן נמשיך downstream.

### ‏Why

‏אם Final PnL שונה ב־$X, זה אומר שהמערכות התנהגו אחרת.

‏First Divergence מסביר **מתי ולמה** הן התחילו לסטות.

### ‏Run Diff baseline

```text
baseline_run_id
candidate_run_id
first_divergence_time
first_divergence_layer
changed_decision_count
changed_trade_count
changed_top1_count
metric_deltas
```

---

## ‏17. RCA Integration

‏מקטע 26 דורש `immutable RCA packet`.

‏Replay הופך אותו executable:

```text
RCA packet
→ incident dataset/checkpoint
→ exact replay
→ reproduce
→ first divergence
→ counterfactual branch
→ population experiment
```

### ‏Incident Window

‏Baseline:

```text
sufficient pre-roll
+ incident interval
+ sufficient post-roll
```

‏ולא מספר שניות קבוע לכל אירוע.

‏Pre-roll חייב לכסות לפחות את history הדרוש ל־features/risk/session state, או להתחיל מ־checkpoint מתאים.

### ‏Golden failure case

‏Operational bug משמעותי:

```text
incident
→ RCA
→ fix
→ replay scenario
→ permanent regression expectation
```

---

## ‏18. Golden Replay Suite

‏Baseline suite צריכה לכלול גם ימים רגילים וגם קצוות.

‏למשל:

```text
G01 normal session
G02 quiet midday
G03 opening burst
G04 rank churn
G05 spread expansion
G06 partial fill
G07 cancel/fill race
G08 feed gap
G09 halt/resume
G10 restart/reconcile
```

‏לא נבחר רק “ימים מעניינים” שבהם Strategy נראית טוב.

### ‏Expected assertions

‏Golden scenario יכול לבדוק:

```text
expected decision sequence
expected reason codes
expected invariant outcomes
expected final state
expected no-duplicate-order behavior
```

‏לא בהכרח `PnL` exact אם execution model deliberately stochastic; במקרה כזה seed/model חייבים להיות קבועים או assertion distributional נפרד.

---

## ‏19. Replay Invariants

### ‏`P0`

```text
same inputs + same versions + same seed = same outputs
```

### ‏`P0`

```text
no future event may affect current state
```

### ‏`P0`

```text
market state at T uses events <= T under the declared ordering policy
```

### ‏`P0`

```text
position state = processed fills
```

### ‏`P0`

```text
working-order state follows lifecycle transitions
```

### ‏`P0`

```text
replay mode can never send a live order
```

### ‏`P1`

```text
replay speed does not change functional decisions
```

### ‏`P1`

```text
run manifest is sufficient to reproduce the run
```

---

## ‏20. Side-Effect Safety

‏Replay חייב להיות structurally incapable of Live execution.

‏Baseline:

```text
execution_mode = SIMULATION
```

‏ו־dependency injection:

```text
IExecutionBroker
├─ LiveBroker
└─ SimulatedBroker
```

‏Replay process/config אינו מקבל live trading credentials כאשר אפשר להימנע מכך ארכיטקטונית.

‏Safety check failure:

```text
FAIL FAST
```

‏לא Warning.

---

## ‏21. Performance Replay

‏לאחר correctness נמדוד load behavior.

### ‏Metrics

```text
events_per_second
processing_rate
queue_depth
oldest_event_age
processing_lag
feature_compute_duration
scan_duration
ranking_duration
decision_duration
cpu
memory
```

### ‏Burst scenarios

‏במיוחד:

```text
market open
high-vol burst
candidate explosion
quote storm
reconnect burst
```

### ‏Performance invariant

‏אין להסיק Strategy behavior מ־Functional max-speed כאשר המטרה היא capacity.

‏Performance Stress run הוא experiment נפרד.

---

## ‏22. Fault Injection

‏`P2` Challenger לאחר deterministic baseline:

```text
feed disconnect
sequence gap
duplicate event
out-of-order event
stale quote
latency spike
broker timeout
ack delay
partial fill
cancel/fill race
process restart
```

‏Fault Injection חייבת להיות declared synthetic input, לא mutation סמויה של Tape.

‏מטרות:

- ‏Safety gates.
- ‏Kill switches.
- ‏Reconciliation.
- ‏Restart correctness.
- ‏Near-miss prevention.

---

## ‏23. Portfolio / Risk State Replay

‏גם אם ה־Strategy מחזיקה Position אחת בלבד, Replay day-state צריך לכלול:

```text
cash / available research capital
position
reserved capital
working orders
realized pnl
unrealized pnl
daily loss state
cooldowns
kill-switch state
```

‏אם Daily Risk Budget הופעל ב־T:

```text
all later candidate decisions must see that state
```

‏אין להריץ כל signal כאילו ההון תמיד פנוי.

---

## ‏24. Restart / Reconciliation Replay

‏`P2` high-value operational challenger:

```text
running
→ crash
→ restart
→ load persisted state
→ broker reconciliation
→ resume
```

‏נבדוק:

```text
no duplicate order
no lost position
no reset risk state
no stale working-order assumption
no strategy entry before reconciliation complete
```

‏זהו bridge חשוב ל־Production Safety.

---

## ‏25. Data Retention Policy

‏Replay עתידי תלוי במה ששמרנו בזמן אמת.

### ‏Baseline retention priorities

```text
raw/canonical market events
received timestamps
sequence metadata
data-quality events
decision snapshots
order lifecycle
fills
version/config ids
```

### ‏Tiering

```text
HOT: recent high-resolution raw data
WARM: compressed replayable history
PERMANENT: selected incidents/golden scenarios
LONG-TERM: aggregate metrics
```

‏Exact retention duration היא החלטת cost/operations עתידית, לא recommendation קשיחה כאן.

### ‏Secrets

‏API credentials/secrets אינם חלק מ־Replay Artifact.

---

## ‏26. Replay Reports

### ‏Run Summary

```text
dataset_id
run_id
strategy_version
config_hash
mode
fidelity
coverage
warnings
rank1_event_count
trade_count
no_trade_count
fill_rate
net_pnl_simulated
avg_slippage
signal_to_fill distribution
final risk/position state
output hashes
```

### ‏Comparison Summary

```text
baseline run
candidate run
first divergence
changed decisions
changed Top1
changed trades
execution deltas
net metric deltas
fidelity parity
```

### ‏Incident Summary

```text
what happened
what the system knew
first divergence
why selected / why rejected
signal/rank decay
order/fill timeline
exit/cost outcome
counterfactual branch
```

---

## ‏27. Metrics

### ‏Determinism

```text
rerun_match_rate
ledger_hash_match_rate
first_unexpected_divergence_count
nondeterminism_incidents
```

### ‏Coverage/Fidelity

```text
symbol_coverage_ratio
sequence_gap_rate
stale_event_rate
unreliable_period_duration
high/medium/low_fidelity_runs
```

### ‏Debuggability

```text
time_to_reproduce_incident
time_to_first_divergence
replay_scenario_coverage
unknown_rca_rate_after_replay
```

### ‏Research velocity

```text
median functional replay duration
experiments_per_day
multi-day suite duration
scenario startup/seek latency
```

### ‏Performance

```text
max sustainable event rate
p95/p99 processing lag
max queue depth
peak memory
```

### ‏Sim-to-Live calibration

```text
fill_price_error
fill_rate_error
latency_error
slippage_error
markout_error
```

---

## ‏28. Promotion Criteria

‏Replay infrastructure יכולה להיחשב Baseline production-research ready רק כאשר:

1. ‏אותו dataset/version/config/seed מייצר אותו Decision Ledger במספר reruns.
2. ‏Virtual Clock מכסה את כל timers שמשפיעים על Strategy semantics.
3. ‏Live ו־Replay חולקים Feature/Filter/Score/Decision/Risk core.
4. ‏Whole-market coverage/fidelity מדווחים במפורש.
5. ‏Run Manifest מספיק לשחזור.
6. ‏Execution Simulator versioned ומופרד מה־Recorded Tape.
7. ‏Position/Order invariants נשמרים.
8. ‏Replay side-effect safety מונע live execution.
9. ‏Golden scenarios מכסים לפחות normal + key operational edge cases.
10. ‏Run Diff מזהה First Divergence ברמת layer/time.
11. ‏Incident window ניתן לשחזור עם warm state מתאים.
12. ‏Performance suite אינה משנה semantics של functional suite.
13. ‏Output artifacts נשמרים בצורה שניתנת לביקורת.

---

## ‏29. Rejection Criteria

‏לא נסמוך על Replay Evidence כאשר:

- ‏event ordering אינו deterministic.
- ‏wall clock חודר ל־Strategy logic.
- ‏Replay speed משנה decisions ללא סיבה מוצהרת.
- ‏dataset content השתנה תחת אותו id/checksum.
- ‏randomness ללא seed משפיעה על conclusion.
- ‏Live ו־Replay משתמשים בחישוב Feature/Score שונה.
- ‏whole-market rank מחושב מ־Universe חלקי בלי flag.
- ‏execution simulation אינו versioned.
- ‏touch-to-fill optimistic assumption מוצגת כעובדה.
- ‏warm-up חסר אבל features נחשבים valid.
- ‏checkpoint משוחזר עם schema/state incompatible.
- ‏side-effect isolation אינו חזק מספיק.
- ‏Run אינו reproducible.
- ‏PnL נבדק בלי first-divergence/context.

---

## ‏30. Failure Modes

### ‏Hidden wall-clock dependency

‏סימפטום:

```text
100x replay differs from 1x
```

‏תגובה:

```text
find wall-clock/timer leak
→ regression test
```

### ‏Concurrency nondeterminism

‏סימפטום:

```text
same run produces different tie/rank sequence
```

‏תגובה:

```text
deterministic publication barrier / ordering
```

### ‏Dataset mutation

‏סימפטום:

```text
same dataset_id, different checksum
```

‏תגובה:

```text
invalidate evidence
→ new dataset version
```

### ‏Partial-universe false winner

‏סימפטום:

```text
Rank #1 appears strong only because competitors are missing
```

‏תגובה:

```text
fail/degrade ranking validity
```

### ‏Warm-up contamination

‏סימפטום:

```text
features default to zero at replay start
```

‏תגובה:

```text
WARMING_UP + NO_TRADE
```

### ‏Simulation mistaken for fact

‏סימפטום:

```text
hypothetical fill treated as recorded fill
```

‏תגובה:

```text
separate provenance classes
```

### ‏Side effect escape

‏סימפטום:

```text
replay path can reach live broker endpoint
```

‏תגובה:

```text
P0 architecture failure / fail fast
```

### ‏Checkpoint drift

‏סימפטום:

```text
seek result differs from full replay
```

‏תגובה:

```text
checkpoint compatibility + state-hash tests
```

---

## ‏31. Alternatives

### ‏Alternative A — Batch backtest only

‏יתרונות:

- ‏פשוט.
- ‏מהיר למחקר סטטיסטי.

‏חסרונות:

- ‏חלש ל־event-order/state-machine RCA.
- ‏קשה לשחזר cancel/fill/rank timing.

‏Decision:

‏נשאיר אותו למחקר population, לא כתחליף Replay.

### ‏Alternative B — Snapshot replay בלבד

‏יתרונות:

- ‏פשוט יותר מ־raw events.

‏חסרונות:

- ‏יכול לאבד ordering ו־transitions בתוך cadence.

‏Decision:

‏מותר למחקרים שאינם תלויים ב־micro-ordering, אך fidelity חייב להיות מסומן.

### ‏Alternative C — Full exchange matching-engine simulator

‏יתרונות:

- ‏Potentially rich execution research.

‏חסרונות:

- ‏מורכבות עצומה.
- ‏דורש depth/queue data שלא תמיד קיימים.
- ‏false precision risk.

‏Decision:

‏`P4 — Specialist`, לא Baseline.

### ‏Alternative D — Replay UI/video only

‏יתרונות:

- ‏נוח לצפייה.

‏חסרונות:

- ‏לא מריץ מחדש logic.
- ‏לא מאפשר version comparison אמיתי.

‏Decision:

‏UI הוא visualization על engine, לא engine בפני עצמו.

---

## ‏32. Trade-offs

### ‏Correctness vs Speed

‏נעדיף correctness.

‏לאחר שה־hashes/invariants יציבים, נבצע optimization.

### ‏Raw Fidelity vs Storage Cost

‏Raw event retention יקר יותר אך מאפשר recomputation.

‏נשתמש tiers ולא נשמור derived-only כתחליף ל־raw source.

### ‏Checkpoint Speed vs Complexity

‏Checkpoints מאיצים Seek אך מוסיפים state serialization/versioning complexity.

‏לכן נוסיף רק לאחר measurement.

### ‏Single-thread determinism vs Parallel throughput

‏Single-thread פשוט יותר, אך parallelism עשוי להיות נדרש ל־whole-market scale.

‏נעדיף deterministic merge semantics ולא נוותר על parallelism אוטומטית.

### ‏Clean Research vs Production Realism

‏צריך את שניהם, תחת Dataset/Profile שונה.

---

## ‏33. What I Would Avoid Initially

‏לא נתחיל מ:

- ‏Matching engine מלא.
- ‏L3 queue simulator.
- ‏checkpoint כל שנייה.
- ‏distributed replay cluster לפני שיש bottleneck.
- ‏UI כבד לפני engine/test contracts.
- ‏automatic scenario generation מורכב.
- ‏AI RCA verdicts.
- ‏Replay של selected winners בלבד.
- ‏Replay שונה מהותית מה־Live core.
- ‏hidden defaults שאינם ב־manifest.

‏ה־MVP צריך להיות reproducible, inspectable ופשוט.

---

## ‏34. What to Add Later

### ‏`P2`

- ‏Checkpoint/Seek.
- ‏Incident package export.
- ‏Fault injection.
- ‏Restart/reconciliation scenarios.
- ‏Performance/burst suite.
- ‏Replay UI with pause/step/bookmarks.

### ‏`P3`

- ‏Branching counterfactual simulation orchestration.
- ‏automatic first-divergence visualization.
- ‏live-vs-replay session diff.
- ‏scenario catalog/coverage automation.
- ‏fidelity scoring model.

### ‏`P4`

- ‏Depth/queue specialized simulation.
- ‏large-scale distributed replay.
- ‏advanced impact models.

---

## ‏35. Required Data / Evidence

‏כדי לבנות Replay שימושי נצטרך לפחות:

```text
canonical market events
UTC/event timestamps
receive timestamps when available
sequence/ingest ordering metadata
universe/session metadata
data-quality state
strategy/config versions
order/fill events for incident/system replay
```

‏כדי לשפר execution fidelity:

```text
bid/ask at relevant times
sizes/depth where available
actual broker timings
actual fill/slippage observations
```

‏כדי לכייל Sim-to-Live:

```text
paper/shadow/live execution observations
```

---

## ‏36. User-Specific Application

‏לרובוט שלנו יש מאפיינים שמעלים במיוחד את ערך ה־Replay:

- ‏Universe רחב.
- ‏Ranking Cross-Sectional מתמשך.
- ‏Signal horizon קצר.
- ‏חשיבות גדולה ל־signal/rank decay.
- ‏Entry/Exit רגישים ל־spread/slippage/latency.
- ‏Top Candidate יכול להתחלף מהר.
- ‏`NO_TRADE` הוא Outcome אמיתי.

‏לכן Baseline מותאם:

```text
Record whole-market canonical L1/trade state at usable fidelity
→ rebuild same cross-sectional state
→ rerank on the same cadence as live
→ store Top-N each decision point
→ replay signal→submit→fill decay
→ feed the same risk engine
→ simulate execution with a versioned model
→ compare exact decision timelines between versions
```

‏השאלות שהמערכת צריכה לענות עליהן לאחר כל Incident משמעותי:

```text
What did we know at T?
Why was this symbol #1?
Was #1 still #1 at submit/fill?
When did the signal die?
Was execution or prediction the first divergence?
What did #2/#3 do?
What would NO_TRADE have done?
Would another strategy version behave differently on the same tape?
```

---

## ‏37. Tests

### ‏Unit tests

- ‏Canonical ordering.
- ‏Tie-break ordering.
- ‏ReplayClock advancement.
- ‏Timer firing at exact virtual boundary.
- ‏Warm-up transition.
- ‏duplicate/gap policy.
- ‏dataset checksum/manifest validation.

### ‏Determinism tests

```text
run same scenario N times
→ exact ledger hash equality
```

### ‏Speed-invariance test

```text
1x vs 10x vs MAX
→ same functional decisions
```

### ‏Seek parity test

‏כאשר Checkpoints קיימים:

```text
full replay to T
==
checkpoint seek to T
```

### ‏Strategy parity tests

‏אותו canonical event fixture עובר דרך shared core ומפיק same feature/decision semantics ללא special replay branch.

### ‏Side-effect test

‏Replay configuration אינה יכולה resolve `LiveBroker`.

### ‏Whole-market coverage test

‏Missing critical symbol coverage חייבת לשנות validity state ולא להיעלם בשקט.

### ‏Restart test

```text
pre-crash state
→ persist
→ restart
→ reconcile
→ resume
```

‏ללא duplicate/lost exposure.

---

## ‏38. Confidence

### ‏High Confidence

- ‏Replay deterministic דורש clock/order/seed/tie-breaks מפורשים.
- ‏Recorded facts חייבים להיות מופרדים מ־simulated consequences.
- ‏אותו Strategy Core מפחית research/live drift.
- ‏Whole-market Ranking דורש coverage מספיק של המתחרים.
- ‏Immutable/versioned datasets ו־run manifests נדרשים ל־reproducibility.
- ‏First Divergence שימושי יותר מ־PnL final בלבד לדיבוג.

### ‏Medium Confidence

- ‏ה־MVP המדויק של ledgers/checkpoint cadence.
- ‏איזה set מינימלי של Golden Scenarios ייתן coverage מיטבי.
- ‏כמה Raw Data לשמור hot לעומת compressed.

### ‏Low / Unproven

- ‏ערך execution queue/depth models מתקדמים עבור השיטה שלנו.
- ‏היקף performance infrastructure שיידרש בפועל.
- ‏כמה Replay alone ישפר strategy economics; הוא בעיקר תשתית Evidence ולא מקור Edge בפני עצמו.

---

## ‏39. Time-Sensitive Facts

‏המקטע מתודולוגי ואינו מניח capability ספציפית של Broker/Data Provider.

‏לפני Implementation נצטרך לאמת בזמן אמת, לפי הספק שנבחר:

- ‏אילו timestamps/sequence fields זמינים.
- ‏איזו רזולוציית historical trades/quotes זמינה.
- ‏האם receive timestamps נשמרים אצלנו או ניתנים מהספק.
- ‏coverage של L1/L2.
- ‏session/status/halt semantics.
- ‏broker event/order/fill fields שניתן להקליט.
- ‏data licensing/retention restrictions אם רלוונטי.

‏הם אינם מקודדים כאן כעובדות קבועות.

---

## ‏40. Relationship to Later Sheets

### ‏28 — Paper Trading / Shadow Mode

‏ישווה behavior בזמן אמת מול Replay/Sim assumptions ויתחיל למדוד Sim-to-Live Gap.

### ‏29+ — Production / Operations topics

‏ישתמשו ב־Replay עבור incidents, restart, broker/data failures ו־regression.

### ‏Testing / Observability sheets

‏Golden Replay Suite ו־Decision Ledgers יהיו input מרכזי ל־integration/regression testing ול־observability.

### ‏Final Baseline

‏Replay יהיה חלק מהשרשרת:

```text
Raw Data
→ Research
→ Backtest
→ Deterministic Replay
→ Paper / Shadow
→ Limited Live
→ RCA
→ Replay Regression
→ Controlled Improvement
```

---

## ‏41. Recommendation Summary

### ‏Baseline

```text
Immutable canonical tape
→ deterministic ordering
→ ReplayClock
→ same strategy/risk core
→ SimulatedBroker
→ explicit ledgers
→ deterministic hashes
→ run diff / first divergence
```

### ‏Preferred Default

- ‏`FUNCTIONAL_DETERMINISTIC` הוא mode ראשון.
- ‏Replay speed לא משנה החלטות.
- ‏Whole-market coverage נדרש ל־cross-sectional rank.
- ‏Raw events הם source of truth; derived data הוא artifact/cache.
- ‏Run/Dataset/Execution Model versioned.
- ‏Replay אינו מסוגל להגיע ל־LiveBroker.
- ‏כל Incident חשוב יכול להפוך ל־Golden Scenario.

### ‏Challengers

- ‏Checkpoint/Seek.
- ‏Fault Injection.
- ‏Restart/Reconciliation Replay.
- ‏Performance Stress/Burst Replay.
- ‏Branching Counterfactuals.

### ‏Avoid Unless Evidence

- ‏L3/queue simulator מלא.
- ‏distributed replay מוקדם.
- ‏PnL-only comparison.
- ‏special Replay Strategy code path.
- ‏hidden wall-clock/randomness.
- ‏selected-symbol replay שמתחזה ל־whole-market truth.

### ‏Promotion principle

```text
Reproducibility first
→ fidelity second
→ speed third
```

‏Replay מהיר שאינו deterministic אינו כלי מחקר אמין.

‏Replay fidelity גבוה שאינו משתמש באותו Strategy Core כמו Live עדיין עלול לבדוק מערכת אחרת.

‏המטרה היא Time Machine אמינה: לחזור לרגע, לבנות מחדש את מה שהמערכת ידעה, לקבל את אותה החלטה, ולשנות רק גורם אחד כאשר אנחנו רוצים ללמוד.
