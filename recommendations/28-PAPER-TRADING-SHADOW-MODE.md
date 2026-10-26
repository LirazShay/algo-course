# ‏28 — Recommendation Sheet: Paper Trading / Shadow Mode

> ‏מקור לימודי עיקרי: `../28-PAPER-TRADING-AND-SHADOW-MODE.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline בטוח ומדיד למעבר ממחקר היסטורי אל שוק חי **ללא סיכון כספי**: קודם `Live Shadow`, אחר כך `Execution Shadow`, ורק לאחר שהמערכת מוכיחה Data/Timing/State parity מוסיפים `Paper Broker` לבדיקת lifecycle של Orders, Positions ו־Reconciliation.
>
> ‏המקטע ממשיך את 20–27: ‏20–23 הגדירו timeline/validation; ‏24–26 הגדירו ניסוי ו־RCA; ‏27 הגדיר Replay דטרמיניסטי. ‏28 מוסיף Forward Validation על נתונים חיים, אבל אינו הופך Paper או Shadow להוכחת Live economics.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
Did paper PnL look good?
```

‏אלא:

```text
Can the frozen strategy process live market data,
produce timely and reproducible decisions,
maintain correct risk/order/position state,
recover from operational failures,
and explain every divergence between expected and observed behavior?
```

‏ה־Baseline שנבחר:

```text
Historical Validation
→ Deterministic Replay
→ Signal-Only Shadow
→ Execution Shadow
→ Paper Broker Lifecycle
→ Replay the same live-recorded sessions
→ First-Divergence / RCA
→ Continue / Block / Rework
```

‏במקטע הזה קו הסיום הוא `Shadow/Paper` יציבים ומאומתים. כל שלב עתידי של כסף אמיתי הוא מחוץ ל־scope של Sheet זה.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Environment Explicit and Fail-Closed

‏בכל process/session נשמור environment מפורש:

```text
SHADOW
PAPER
```

‏וה־default הוא מצב שאינו יכול ליצור Order אמיתי.

‏נדרש separation מבני בין:

```text
SimulatedBroker
PaperBroker
```

‏לבין כל adapter עתידי לסביבה אחרת.

‏ה־Strategy אינה מחליטה Environment; היא מייצרת Intent. ה־Environment adapter מחליט אם Intent נשאר Shadow, נשלח ל־Paper, או נחסם.

### ‏`P0 — Required`: Forward Validation עם Version Freeze

‏לפני חלון Validation משמעותי מקפיאים:

```text
code_commit
strategy_version
feature_version
score_version
filter_version
risk_version
execution_policy_version
config_hash
```

‏אם משנים Logic/Threshold/Weight/Config:

```text
old validation window ends
new version begins
```

‏אין tuning שקט בתוך אותו Forward Test.

### ‏`P1 — Preferred Default`: Signal-Only Shadow first

‏שלב Shadow הראשון:

```text
Live Market Data
→ same MarketState
→ same Features
→ same Filters
→ same Score / Rank
→ same Decision Engine
→ same Risk Engine
→ simulated intent only
→ no broker interaction
```

‏הוא בודק:

- ‏Data freshness.
- ‏Universe completeness.
- ‏Feature latency.
- ‏Ranking latency.
- ‏Top-1 churn.
- ‏Decision latency.
- ‏`TRADE / NO_TRADE` logic.
- ‏Risk gate behavior.
- ‏Regime/context availability.
- ‏Training/serving parity.

### ‏`P1 — Preferred Default`: Execution Shadow second

‏רק לאחר Signal Shadow יציב מוסיפים:

```text
Decision
→ hypothetical Order Intent
→ conservative execution model
→ hypothetical fills
→ hypothetical position
→ hypothetical exit
```

‏כל simulated fill חייב לשאת provenance:

```text
fill_source = SIMULATED
```

‏Execution Shadow נועד למדוד Executability, לא לחקות Broker כאילו הוא אמת.

### ‏`P1 — Preferred Default`: Paper Broker third

‏Paper נכנס רק אחרי שה־Signal/Execution Shadow ברורים.

‏Paper path:

```text
Live Market Data
→ same Strategy Core
→ same Risk Engine
→ same Order Intent
→ PaperBroker Adapter
→ Ack / Reject / Partial / Fill / Cancel
→ Position Truth
→ Exit lifecycle
→ Reconciliation
```

‏Paper הוא בעיקר **Systems Test** של order lifecycle, state, recovery ו־broker integration.

---

## ‏3. Why

‏`Backtest` ו־`Replay` עובדים על נתונים שכבר נאספו. Shadow/Paper פוגשים:

- ‏real arrival timing.
- ‏burst load.
- ‏gaps/out-of-order/duplicates.
- ‏clock skew.
- ‏connection resets.
- ‏API errors.
- ‏broker acknowledgements.
- ‏reconnect/reconciliation.
- ‏live coverage mismatch.
- ‏training/serving skew.

‏לכן הם בודקים סוג אחר של אמת.

‏הפרדה בין Signal Shadow, Execution Shadow ו־Paper עוזרת לענות:

```text
Is prediction weak?
Is executability weak?
Or is the platform/state machine wrong?
```

‏בלי ההפרדה הזו PnL יחיד מערבב את כל השכבות.

---

## ‏4. Use When

‏Baseline זה מתאים כאשר:

- ‏ה־Strategy כבר עברה Historical Validation ו־Replay.
- ‏רוצים למדוד behavior על Market Data חי בלי סיכון כספי.
- ‏רוצים לזהות Training/Serving Skew.
- ‏רוצים למדוד latency tails בעומס אמיתי.
- ‏רוצים לבדוק Whole-Market freshness ו־Rank completeness.
- ‏רוצים לבדוק Paper Broker lifecycle, reconnect/restart ו־reconciliation.
- ‏רוצים לבנות Evidence אמיתי לפני כל החלטה עתידית על הרחבת סביבה.

---

## ‏5. Do Not Use When

‏אין להתייחס ל־Shadow/Paper כתחליף ל־Validation כאשר:

- ‏Timeline integrity עדיין לא הוכחה.
- ‏Replay אינו deterministic.
- ‏Feature/Score parity בין research ל־serving אינה נבדקת.
- ‏Dataset/Universe definitions אינם versioned.
- ‏Execution model עדיין מניח perfect fill.
- ‏Order/Position state אינו authoritative.
- ‏אין Reconciliation.
- ‏Critical operational incidents פתוחים.

‏ובפרט:

```text
Paper PnL > 0
```

‏אינו מספיק כדי להסיק readiness מעבר ל־Paper.

---

## ‏6. Core Environment Contract

‏לכל Session נשמור לפחות:

```text
environment
run_id
start_time
end_time
code_commit
config_hash
strategy_version
feature_version
score_version
filter_version
risk_version
execution_policy_version
data_provider
broker_mode
execution_source
```

‏לכל Decision:

```text
decision_id
symbol
as_of_time
rank
score
feature_snapshot_id
regime_snapshot_id
spread_bps
quote_age_ms
trade_age_ms
universe_coverage
risk_state
decision
reason_code
```

‏לכל Fill-like event:

```text
fill_source = SIMULATED | PAPER_BROKER
```

‏אסור לערבב אותם בדוחות כאילו הם שקולים.

---

## ‏7. Whole-Market Readiness

### ‏`P0`: Coverage לפני Rank

‏עבור Scanner Cross-Sectional:

```text
Rank #1 is meaningful only if enough of the intended universe is current.
```

‏נשמור:

```text
expected_universe_size
participating_symbols
fresh_symbols
stale_symbols
missing_symbols
coverage_ratio
quote_age_p50
quote_age_p95
quote_age_p99
```

‏`Coverage Gate` הוא Challenger מחקרי, אך Coverage עצמו הוא `P0` telemetry.

### ‏`P0`: Top Candidate Freshness

‏Top-1 עצמו חייב להיות fresh גם אם ה־Universe aggregate נראה תקין.

‏נמדוד:

```text
top1_quote_age_ms
top1_trade_age_ms
top1_feature_age_ms
```

### ‏`P1`: Snapshot Consistency

‏נשמור כיצד Rank נוצר:

```text
streaming_state
or
logical scan snapshot
```

‏המטרה היא להבין אם #1 נבחר מול peers מאותה נקודת זמן לוגית או מול mix של ages.

---

## ‏8. Latency Baseline

‏נמדוד לפחות:

```text
market_event_time
received_time
feature_ready_time
ranking_time
decision_time
intent_time
paper_submit_time
paper_ack_time
first_fill_time
terminal_time
```

‏ונגזור:

```text
market_to_receive
receive_to_features
features_to_rank
rank_to_decision
decision_to_intent
intent_to_submit
submit_to_ack
submit_to_first_fill
decision_to_first_fill
```

‏דוחות חייבים להראות:

```text
P50
P90
P95
P99
MAX
```

‏ולא Average בלבד.

### ‏Signal Survival

‏Metric מרכזי:

```text
signal_survival_to_order_time
signal_survival_to_fill_time
```

‏כלומר: איזה אחוז Signals עדיין עומדים בתנאי Trade אחרי latency אמיתי/מדומה.

‏זה חשוב במיוחד כש־Top-1 churn מהיר.

---

## ‏9. Training / Serving Parity

### ‏`P0`: Live Recording must be Replayable

‏כל Shadow/Paper Session משמעותי צריך להיות ניתן ל־Replay מאוחר יותר.

‏על אותו recording נריץ offline ונשווה:

```text
live-shadow feature
vs replay feature

live-shadow score
vs replay score

live-shadow rank
vs replay rank

live-shadow decision
vs replay decision
```

### ‏`P0`: First Divergence

‏כאשר קיימת אי־התאמה:

```text
Input
→ MarketState
→ Feature
→ Filter
→ Score
→ Rank
→ Decision
→ Risk
```

‏מחפשים divergence ראשון, לא רק outcome שונה בסוף.

### ‏`P1`: Parity Tolerance

‏Floating-point/clock-related tolerances חייבים להיות מפורשים ו־versioned.

---

## ‏10. Order Lifecycle Baseline for Paper

‏Paper Adapter חייב לתמוך ב־state machine מפורש:

```text
CREATED
SUBMITTED
ACKNOWLEDGED
PARTIALLY_FILLED
FILLED
CANCEL_REQUESTED
CANCELLED
REJECTED
UNKNOWN
```

‏עקרונות מחייבים:

- ‏Ack אינו Fill.
- ‏Fill הוא Position truth.
- ‏Partial Fill יוצר Position אמיתית בסביבת Paper.
- ‏Cancel Request אינו Terminal.
- ‏`UNKNOWN` אינו null ולא Failure מדומיין.
- ‏אין Retry blind כאשר state אינו ידוע.
- ‏Exit qty לעולם אינה גדולה מ־authoritative position qty.

---

## ‏11. Reconciliation Baseline

### ‏`P0`: Startup Reconciliation

‏לפני כל חזרה לפעילות Paper לאחר restart/reconnect:

```text
fetch broker orders
fetch broker executions/fills
fetch broker positions
compare with local state
resolve mismatches
then mark ready
```

### ‏`P0`: Crash During Order

‏תרחיש חובה:

```text
submit
→ process crash
→ paper broker changes state
→ restart
→ reconcile
→ restore known state
```

### ‏`P0`: Cancel / Fill Race

‏תרחיש חובה:

```text
cancel requested
→ fill arrives before cancel confirmation
→ position updated
→ no duplicate exit / oversell
```

### ‏`P0`: End-of-Session Audit

‏נפיק דוח מפורש:

```text
open_orders_expected_vs_broker
positions_expected_vs_broker
unknown_orders
orphan_orders
unreconciled_fills
risk_state
incidents
```

---

## ‏12. Operational Modes

‏Baseline State Machine:

```text
OFFLINE
SHADOW
PAPER
PAUSED
EXIT_ONLY
BLOCKED
```

‏פירוש:

- ‏`SHADOW` — compute/decide בלבד.
- ‏`PAPER` — Paper Broker lifecycle מותר.
- ‏`PAUSED` — צפייה ומדידה, אין intents חדשים.
- ‏`EXIT_ONLY` — אין Entries חדשים; מנהלים state קיים בלבד.
- ‏`BLOCKED` — incident קריטי או readiness contract לא מתקיים.

‏Mode transition חייב להיות logged/versioned.

---

## ‏13. Trading Readiness Contract for Paper

‏לפני Intent חדש בסביבת Paper:

```text
market_data_healthy
scanner_healthy
risk_healthy
clock_healthy
paper_broker_healthy
universe_coverage_acceptable
mode_allows_entry
no_unresolved_critical_incident
```

‏הבדל חשוב:

```text
process_alive != ready_for_paper_execution
```

‏Heartbeat ו־Readiness נמדדים בנפרד.

---

## ‏14. Operational Invariants

‏לפחות:

```text
no paper order without approved risk
no exit qty above position truth
no duplicate client order id
no blind retry from UNKNOWN
no new entry when BLOCKED or EXIT_ONLY
no environment cross-over
all state transitions auditable
```

‏כל invariant breach הוא Incident גם אם ה־Paper PnL חיובי.

---

## ‏15. Paper Acceptance Matrix

‏לפני שמכריזים שה־Paper integration יציבה, נדרש Matrix:

| Scenario | Required result |
|---|---|
| Happy path | `PASS` |
| Broker reject | `PASS` |
| No fill + TTL + cancel | `PASS` |
| Partial fill | `PASS` |
| Cancel/fill race | `PASS` |
| Disconnect/reconnect | `PASS` |
| Process restart | `PASS` |
| Startup reconciliation | `PASS` |
| Unknown order state | `PASS` |
| Kill/blocked mode | `PASS` |
| End-of-session audit | `PASS` |

‏States:

```text
PASS
FAIL
NOT_TESTED
```

‏`NOT_TESTED != PASS`.

‏לכל PASS נשמור Evidence:

```text
run_id
scenario_id
logs
order_ids
timestamps
assertions
result
```

---

## ‏16. Scorecards

### ‏Data / Operations

```text
uptime
feed_reconnects
broker_reconnects
data_gap_count
stale_symbol_rate
coverage_ratio
unknown_state_count
reconciliation_mismatch_count
invariant_breach_count
```

### ‏Prediction

```text
forward executable returns
rank monotonicity
top1 premium
MFE
MAE
time_to_first_executable_profit
time_to_target
```

### ‏Execution

```text
paper_fill_rate
partial_fill_rate
no_fill_rate
submit_to_ack
submit_to_first_fill
cancel_to_confirm
paper_slippage
```

### ‏Economics

```text
gross_edge
modeled_cost
paper_cost_proxy
net_edge_estimate
cost_to_edge_ratio
```

### ‏Risk

```text
blocked_intents
risk_rejections
exposure_peak
kill_or_block_events
unknown_exposure_time
```

‏אין Scorecard יחיד. Promotion בתוך סביבת המחקר תלוי בכל השכבות יחד.

---

## ‏17. Shadow / Paper Drift Analysis

‏נבדוק לפחות:

```text
Backtest → Replay drift
Replay → Shadow drift
Shadow Signal → Execution Shadow drift
Execution Shadow → Paper drift
```

‏סיבות אפשריות:

- ‏feed difference.
- ‏universe mismatch.
- ‏latency.
- ‏clock semantics.
- ‏missing/out-of-order events.
- ‏feature skew.
- ‏config/version drift.
- ‏paper fill assumptions.

‏כל divergence מקבל First-Divergence analysis.

---

## ‏18. Paper Limitations Registry

‏נשמור Artifact versioned:

```text
broker_or_paper_engine
verified_at
known_fill_limitations
known_order_type_differences
known_routing_differences
known_latency_differences
known_fee_differences
known_market_data_differences
source_refs
```

‏הכלל:

> ‏Paper behavior תלוי provider/broker ויכול להשתנות; לפני הסתמכות על capability ספציפית צריך לאמת Documentation עדכנית.

‏ב־Sheet זה **לא** נקבעים Claims ספציפיים על Broker מסוים.

---

## ‏19. Champion / Challenger Shadow

‏`P2` Challenger חזק:

```text
same live feed
→ champion shadow
→ challenger shadow
```

‏נשמור:

```text
champion_top1
challenger_top1
champion_score
challenger_score
champion_decision
challenger_decision
changed_winner
changed_decision
```

‏היתרון: שתי הגרסאות רואות אותו Market Context באותו זמן.

‏אבל אותו כלל משלב 24 נשמר:

```text
changed decision
→ incremental evidence
→ controlled validation
```

‏לא “Challenger הרוויח היום ולכן מחליפים”.

---

## ‏20. Live-Recorded Session as Research Asset

‏כל session משמעותי יפיק:

```text
raw/canonical market events
receive timestamps
sequence metadata
decision ledger
risk ledger
paper order ledger
paper fill ledger
position ledger
incidents
config/version manifest
```

‏כך ניתן:

```text
record
→ replay
→ reproduce
→ RCA
→ fix/experiment
→ replay again
→ regression scenario
```

---

## ‏21. Fault Injection

‏`P2` לאחר Baseline יציב:

```text
feed pause
out-of-order event
duplicate event
paper broker timeout
duplicate ack
late fill
partial fill
cancel/fill race
process restart
clock anomaly
```

‏Recovery success מוגדר רק כאשר:

```text
orders reconciled
positions reconciled
risk state reconciled
market data healthy
mode explicit
readiness restored intentionally
```

‏Socket שנפתח מחדש אינו Recovery מלא.

---

## ‏22. Coverage over Count

‏אין מספר קסם של Shadow/Paper days.

‏נדרש Coverage של מצבים שונים:

```text
open
midday
close
quiet
fast
burst
wide spread
high activity
low activity
high churn
low churn
feed reconnect
paper broker reconnect
```

‏נשמור `coverage_matrix` ו־`NOT_SEEN` במפורש.

‏Unseen condition אינו Fail, אך הוא מוריד Confidence.

---

## ‏23. Promotion within the Research Ladder

‏במקטע זה Promotion פירושו מעבר בין שכבות סימולציה/forward validation בלבד:

```text
SIGNAL_SHADOW
→ EXECUTION_SHADOW
→ PAPER
```

### ‏Shadow → Execution Shadow

‏דורש:

- ‏stable live data handling.
- ‏known freshness distribution.
- ‏replay parity.
- ‏acceptable decision latency.
- ‏no unexplained state drift.

### ‏Execution Shadow → Paper

‏דורש:

- ‏Intent contract stable.
- ‏execution model understood.
- ‏Risk Engine active.
- ‏environment guards active.
- ‏no critical unresolved incidents.

### ‏Paper remains blocked if

- ‏reconciliation broken.
- ‏unknown states unresolved.
- ‏restart/reconnect not tested.
- ‏critical invariant breach exists.
- ‏order lifecycle cannot be explained.

‏אין Promotion על בסיס PnL בלבד.

---

## ‏24. Rejection / Blocking Criteria

‏נעצור או נחזור שכבה כאשר:

- ‏Live vs Replay features diverge ללא הסבר.
- ‏Rank differs under identical input ללא סיבה.
- ‏Universe coverage חסר באופן שיכול לשנות #1.
- ‏P95/P99 latency מפרים את signal lifetime assumptions.
- ‏Paper order state אינו ניתן reconciliation.
- ‏Duplicate intent/order מופיע.
- ‏Partial fill אינו מייצר Position נכון.
- ‏Exit quantity אינה תואמת Position truth.
- ‏Restart מאבד exposure.
- ‏Data/Broker reconnect חוזר ל־ready בלי reconciliation.
- ‏Environment guard ניתן לעקיפה בטעות.
- ‏Critical Incident נשאר לא מסווג.

---

## ‏25. Metrics

### ‏Scanner / Market

```text
universe_size
fresh_symbols
stale_symbols
coverage_ratio
quote_age_p50/p95/p99
scan_cycle_p50/p95/p99
feature_compute_p50/p95/p99
ranking_p50/p95/p99
top1_changes_per_second
top1_persistence
candidate_replacement_rate
```

### ‏Signal Survival

```text
signal_survival_to_decision
signal_survival_to_intent
signal_survival_to_paper_submit
signal_survival_to_paper_fill
```

### ‏Parity

```text
feature_parity_error
score_parity_error
rank_parity_rate
decision_parity_rate
first_divergence_layer
```

### ‏Paper Lifecycle

```text
ack_success_rate
reject_rate
partial_fill_rate
no_fill_rate
cancel_success_rate
unknown_state_rate
reconciliation_mismatch_rate
restart_recovery_success_rate
```

### ‏Operational

```text
critical_incidents
warning_incidents
invariant_breaches
blocked_time
reconnect_count
mean_time_to_known_state
```

---

## ‏26. Failure Modes

### ‏Research / Prediction

- ‏Forward test tuned תוך כדי.
- ‏Training/serving skew.
- ‏Universe mismatch.
- ‏False confidence מ־Paper PnL.
- ‏Selection bias בתקופת Shadow.

### ‏Data / Timing

- ‏stale feed.
- ‏missing symbols.
- ‏out-of-order events.
- ‏clock skew.
- ‏burst backlog.
- ‏age distribution tails שלא נמדדים.

### ‏Execution / State

- ‏Ack treated as Fill.
- ‏blind retry.
- ‏cancel/fill race.
- ‏partial-fill desync.
- ‏orphan order.
- ‏position mismatch.
- ‏restart without reconciliation.
- ‏Paper fill optimism.

### ‏Operations

- ‏environment confusion.
- ‏health mistaken for readiness.
- ‏silent monitoring failure.
- ‏critical alert ignored.
- ‏reconnect treated as recovery.

---

## ‏27. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏Paper לפני Signal Shadow יציב.
- ‏Paper PnL כ־primary metric.
- ‏Complex multi-broker abstraction לפני Adapter אחד נקי.
- ‏Auto-promotion.
- ‏Daily tuning תוך Forward Test.
- ‏Dozens of regime-specific policies.
- ‏Fancy Shadow diagnostics בתוך hot path אם הם מוסיפים latency.
- ‏Assuming Paper fills are realistic.
- ‏Testing only happy path.
- ‏Ignoring `UNKNOWN` because “זה רק Paper”.

---

## ‏28. What to Add Later

### ‏`P2`

- ‏Champion/Challenger Shadow.
- ‏Cross-feed comparison.
- ‏Fault injection suite.
- ‏Automated parity report.
- ‏Automated Paper Acceptance Matrix.
- ‏Live-recorded-session regression catalog.

### ‏`P3`

- ‏Continuous Shadow twin architecture.
- ‏More advanced fill-calibration framework.
- ‏Automatic anomaly clustering across sessions.
- ‏Automated First-Divergence diagnosis.

‏כל אלה אחרי Baseline observable ו־reproducible.

---

## ‏29. Required Data / Evidence

‏לפחות:

```text
canonical live market events
receive timestamps
provider timestamps if available
sequence metadata
universe version
feature/score/rank snapshots
Top-N snapshots
rejected candidate reasons
NO_TRADE reasons
risk decisions
shadow intents
paper order events
paper fills
position snapshots
reconciliation results
incidents
config/version manifest
```

‏בלי Raw/Canonical recording אי אפשר לעשות parity/replay אמין.

---

## ‏30. Promotion Criteria

‏Promotion בתוך Ladder של המקטע דורש:

1. ‏גרסה/config frozen בזמן measurement.
2. ‏Live-recorded session ניתנת Replay.
3. ‏Feature/Score/Rank/Decision parity מוסברים.
4. ‏Data freshness ו־Coverage ידועים.
5. ‏Latency tails תואמים את signal-lifetime assumptions.
6. ‏אין Critical incidents לא פתורים.
7. ‏Paper lifecycle scenarios הרלוונטיים הם `PASS`, לא `NOT_TESTED`.
8. ‏Reconciliation עובר Startup/Restart/Reconnect.
9. ‏Risk/Environment invariants לא נשברים.
10. ‏יש Coverage של תנאי שוק שונים.
11. ‏כל divergence משמעותי עבר RCA.
12. ‏Paper limitations registry קיים ומעודכן.

---

## ‏31. Rejection Criteria

‏נשארים בשכבה הנוכחית או חוזרים אחורה כאשר:

- ‏ה־Core אינו reproducible.
- ‏Forward results אינם ניתנים attribution.
- ‏Signal decay מהיר מה־operational path באופן עקבי.
- ‏Coverage חסר הופך Rank לא אמין.
- ‏Paper lifecycle אינו deterministic/observable מספיק.
- ‏State mismatches נשארים לאחר reconciliation.
- ‏Fault/restart paths משאירים exposure לא ידוע.
- ‏ה־Environment guard אינו fail-closed.
- ‏שינוי גרסה באמצע test מזהם את Evidence.

---

## ‏32. User-Specific Application

‏ל־Short-Horizon whole-market scanner שלנו, הנקודות החשובות ביותר הן:

```text
whole-market freshness
rank completeness
top1 churn
signal survival
replay parity
paper lifecycle correctness
```

‏סדר מחקר מומלץ:

```text
1. Live feed + full scanner
2. Signal-only Shadow
3. Save Top-N / rejected / NO_TRADE
4. Conservative Execution Shadow
5. Measure executable forward outcomes
6. Replay every important session
7. Fix unexplained parity divergence
8. Add PaperBroker lifecycle
9. Test restart/reconnect/reconciliation
10. Produce end-of-session audit
```

‏אין צורך לחקות HFT במיקרו־שניות; צריך למדוד האם הנתיב של מאות מילישניות/שניות מהיר ויציב מספיק ביחס ל־signal half-life בפועל.

---

## ‏33. Concrete Baseline Contract

```text
Frozen Strategy Version
→ live canonical data
→ whole-market freshness telemetry
→ same production-like scanner core
→ Signal-Only Shadow
→ replay/parity check
→ conservative Execution Shadow
→ signal-survival measurement
→ PaperBroker adapter
→ full order/position state machine
→ reconciliation + restart/reconnect tests
→ end-of-session audit
→ RCA for every unexplained divergence
```

‏Preferred Default:

```text
SHADOW first
PAPER only after parity and operational readiness
PnL never sufficient by itself
UNKNOWN treated explicitly
Replay every material session
```

---

## ‏34. Confidence

### ‏High

- ‏Version freeze נדרש ל־Forward Validation נקי.
- ‏Shadow ו־Paper בודקים שכבות שונות.
- ‏Paper fill אינו הוכחת Live fill.
- ‏Reconciliation/UNKNOWN/Partial Fill חייבים להיות first-class.
- ‏Live-recorded sessions צריכים להיות replayable.
- ‏Environment provenance חייב להיות מפורש.
- ‏PnL לבדו אינו operational readiness metric.

### ‏Medium

- ‏הסדר `Signal Shadow → Execution Shadow → Paper` מתאים במיוחד למערכת שלנו.
- ‏Whole-market coverage/freshness צריך להיות Gate או לפחות strong diagnostic לפני החלטה.
- ‏Champion/Challenger Shadow יהיה בעל ערך לאחר Baseline.

### ‏Low / To Validate

- ‏Threshold מדויק ל־Coverage.
- ‏Threshold מדויק ל־freshness.
- ‏acceptable P95/P99 latency.
- ‏מספר sessions/ימים נדרש.
- ‏signal-survival threshold.
- ‏paper-to-simulation calibration numbers.

---

## ‏35. Time-Sensitive Facts

‏Broker/Data Provider behavior ב־Paper יכול להשתנות:

- ‏supported order types.
- ‏fill simulation semantics.
- ‏market-data entitlements.
- ‏routing differences.
- ‏session behavior.
- ‏API/order-state vocabulary.
- ‏rate limits.
- ‏fees shown/omitted in Paper.

‏לכן לפני שימוש ב־Paper integration ספציפי יש לבצע current verification מול documentation רשמית של אותו provider/broker ולשמור `verified_at`.

‏במקטע 28 לא נקבעה עובדה חדשה תלויה־Broker ולכן לא נדרש Web verification חדש.

---

## ‏36. Relationship to Later Sheets

‏28 מגדיר Forward Validation וה־Paper boundary.

‏29 יגדיר `Broker API Architecture` והפרדה בין Strategy / Risk / Execution / Adapter / API.

‏פרקים מאוחרים יותר יעמיקו ב־Production Safety, observability, recovery, promotion ו־operational controls.

‏החוזה שנשאר הלאה:

```text
Research Evidence
→ Replay Reproducibility
→ Shadow Real-Time Correctness
→ Paper Lifecycle Correctness
→ only then consider any later environment under separate safety gates
```

---

## ‏37. Recommendation Summary

### ‏Baseline

```text
Signal-Only Shadow
→ Execution Shadow
→ Paper
```

### ‏Preferred Default

```text
same strategy/risk core everywhere
+ frozen versions
+ live recording
+ replay parity
+ explicit environment
+ fail-closed readiness
+ full reconciliation
```

### ‏Challenger

```text
Champion / Challenger Shadow
Cross-feed comparison
Fault Injection
Automated parity diff
```

### ‏Advanced Option

```text
continuous shadow twin
paper-vs-simulation calibration framework
automated anomaly clustering
```

### ‏Avoid Unless Evidence

```text
Paper-first development
PnL-only promotion
perfect-fill assumptions
hidden environment switching
blind retry
NOT_TESTED treated as PASS
forward-test tuning
paper behavior treated as live truth
```

‏השורה החשובה ביותר:

> ‏`Shadow` מוכיח שהמערכת יודעת לחשוב בזמן אמת; `Paper` מוכיח שהמערכת יודעת לנהל lifecycle תפעולי ללא סיכון כספי. שניהם נדרשים כ־Evidence engineering, ואף אחד מהם אינו הוכחה מספקת לבדו לכלכלה של ביצוע אמיתי.
