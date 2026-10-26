# ‏20 — Recommendation Sheet: Backtest Fundamentals / Timeline Integrity

> ‏מקור לימודי עיקרי: `../20-BACKTEST-FUNDAMENTALS-AND-TIMELINE-INTEGRITY.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי הוגן ודטרמיניסטי ל־`Backtest`, כך שבכל רגע היסטורי המערכת יודעת רק מה שהיה מותר לה לדעת באותו רגע, משחזרת את כל ה־Universe וה־Decision Pipeline, מפרידה בין Prediction ל־Execution, ושומרת Run שניתן לשחזר, להסביר ולהשוות.
>
> ‏המקטע אינו מנסה עדיין לבנות Exchange Simulator מלא. מודל מפורט של `Bid/Ask`, ‏queue, partial fills, cancel/replace ו־microstructure execution שייך בעיקר למקטע 21.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
How much money would this strategy have made?
```

‏אלא:

```text
Given only information that was actually available at historical time T,
what would the system have known,
what would it have ranked,
what would it have decided,
and what evidence followed afterward?
```

‏לכן ה־Backtest שלנו חייב לשחזר שרשרת מלאה:

```text
Historical Events
→ Canonical Market State
→ Feature Engine
→ Eligibility / Filters
→ Ranking
→ TRADE / NO TRADE Decision
→ Optional Execution Simulation
→ Position / Exit
→ Costs
→ Outcomes
→ Diagnostics / RCA
```

‏והוא חייב לעשות זאת בלי להדליף Future Information לתוך שום שלב שקודם ל־Decision.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Point-in-Time Correctness הוא חוק יסוד

‏בכל `as_of_time = T`:

```text
all feature inputs timestamp <= T
all universe membership facts valid at T
all eligibility facts valid at T
all session / halt state valid at T
all ranking inputs known by T
```

‏אסור ש־Event עתידי ישפיע על:

```text
feature
filter
score
rank
decision
```

‏אם המנוע אינו יכול להוכיח זאת — ה־Run אינו Evidence אמין.

### ‏`P0 — Required`: `as_of_time` מפורש לכל Decision Snapshot

‏כל Snapshot מחקרי יקבל לפחות:

```text
as_of_time
market_state_cutoff
ranking_time
strategy_version
universe_version
```

‏המשמעות של `as_of_time`:

> ‏כל State ו־Feature שמשמשים את ההחלטה נגזרו רק מנתונים שהיו מותרים עד אותו Cutoff.

### ‏`P0 — Required`: הפרדת זמני Market, Processing ו־Decision

‏כאשר הנתונים זמינים, נשמור במפורש:

```text
exchange_event_time
provider_time
receive_time
process_time
feature_ready_time
ranking_time
decision_time
order_time
fill_time
```

‏אם Dataset אינו מכיל חלק מהשדות, אין להמציא אותם.

‏במקום זאת נשמור:

```text
available_time_semantics
missing_time_semantics
assumed_delay_model
```

‏כדי שה־Run לא יציג Precision שאינה קיימת.

### ‏`P0 — Required`: Event Ordering דטרמיניסטי

‏כאשר כמה Events חולקים Timestamp זהה או בלתי־מספיק להכריע סדר, חייב להיות Tie-Break מפורש וגרסאי.

‏לדוגמה:

```text
primary: authoritative event_time
secondary: provider sequence when available
tertiary: stable source order / deterministic sequence
```

‏אותם Inputs חייבים להפיק תמיד אותו סדר.

### ‏`P0 — Required`: Deterministic Run

```text
same dataset
+ same code
+ same config
+ same versions
+ same seed
→ same decisions and same results
```

‏אי־דטרמיניזם שאינו חלק מפורש מהניסוי הוא Failure של תשתית המחקר.

### ‏`P0 — Required`: Point-in-Time Universe

‏אסור להשתמש ב־Universe של היום עבור תקופה היסטורית.

‏Baseline:

```text
Universe(as_of_time)
```

‏צריך לשקף ככל שהמידע מאפשר:

```text
symbol existence
listing state
security type
tradability
halt / pause state
identifier / symbol valid at that time
```

‏זה מונע `Survivorship Bias` בסיסי.

### ‏`P0 — Required`: Historical Identity ו־Corporate Actions מפורשים

‏יש להבדיל בין:

```text
raw prices
split-adjusted prices
fully-adjusted series
```

‏במיוחד עבור Execution Research, מחיר שנצפה בזמן אמת אינו בהכרח זהה לסדרה Adjusted בדיעבד.

‏כל Dataset צריך לתעד:

```text
price_adjustment_policy
corporate_action_source
symbol_mapping_version
```

### ‏`P0 — Required`: Historical Anchor לעולם אינו מגיע מהעתיד

‏כאשר Feature דורש Anchor ב־`T-H`:

```text
target_anchor_time = T - H
anchor = latest valid observation with timestamp <= target_anchor_time
```

‏אסור לבחור:

```text
nearest observation from both sides
```

‏אם הקרוב ביותר נמצא אחרי `target_anchor_time`.

### ‏`P0 — Required`: Missing Anchor נשאר Missing

‏אם אין Observation תקינה:

```text
feature_value = null
feature_valid = false
```

‏ולא:

```text
invented interpolation
future nearest point
silent fallback to another horizon
```

‏Interpolation, אם נחקרת, חייבת להיות Mode מפורש וגרסאי — לא התנהגות נסתרת.

### ‏`P0 — Required`: Features ו־Labels מופרדים ברמת Architecture

‏מומלץ להחזיק מודולים נפרדים:

```text
Feature Engine
→ may read data up to T only

Label / Outcome Engine
→ may inspect data after T
```

‏לדוגמה:

```text
feature: last_return_10s at T
label: forward_return_5s from T to T+5s
```

‏Label לעולם אינו חוזר לשנות Feature או Decision של אותה נקודת זמן.

### ‏`P1 — Preferred Default`: קודם `Signal Backtest`, אחר כך `Execution Backtest`

‏שלב ראשון צריך לענות:

```text
Does the scanner / ranking predict useful short-horizon outcomes?
```

‏רק לאחר שיש Evidence חיובי עוברים לשאלה:

```text
Can the predicted opportunity be executed after latency, spread, fills and costs?
```

‏כך מפרידים:

```text
Selection failure
from
Execution failure
```

‏ומונעים השקעה מוקדמת בסימולטור Execution מורכב עבור Signal שאין לו Edge.

### ‏`P1 — Preferred Default`: Baseline מחקרי ראשון — Signal-Only Cross-Sectional

‏Baseline ראשוני עבור המערכת שלנו:

```text
Historical canonical market data
→ deterministic market state
→ 1-second research decision snapshots
→ point-in-time eligible universe
→ current feature set
→ current filters
→ rank every eligible symbol
→ save Top 20
→ save TRADE / NO TRADE outcome
→ save forward outcomes at 1/2/5/10/30/60s
```

‏בלי להניח עדיין Fill מפורט.

‏`1 second` כאן הוא Baseline מחקרי לבחינה, לא החלטה סופית על cadence.

### ‏`P1 — Preferred Default`: Ranking חייב להיות Cross-Sectional אמיתי

‏בכל Decision Time:

```text
compute eligible state for the whole historical universe
→ rank all eligible symbols
→ only then select candidate
```

‏אסור להריץ בדיעבד רק את המניה שהתגלתה כמנצחת.

### ‏`P1 — Preferred Default`: לשמור Top-N ולא רק Winner

‏לפחות:

```text
Top 20
```

‏או ערך קטן/גדול יותר לפי Cost/Research needs.

‏נשמור:

```text
rank
score
score_gap
feature snapshot
future labels
eligibility state
```

‏כדי לבדוק:

```text
#1 vs #2
#1 vs Top-5
rank bucket monotonicity
ranking stability
regret / missed selection
```

### ‏`P0 — Required`: `NO TRADE` הוא Result אמיתי

‏Backtest אינו רשאי להכריח עסקה בכל Cycle.

‏אם Production Policy הייתה מחזירה:

```text
NO_TRADE
```

‏גם ה־Backtest חייב לשמור את אותה Decision ואת סיבתה.

‏נרצה למדוד:

```text
no_trade_rate
future outcomes after no-trade
reason-code distribution
false-negative opportunity rate
```

### ‏`P1 — Preferred Default`: Decision Snapshot מלא

‏לכל Decision:

```text
decision_id
as_of_time
universe_version
data_version
feature_version
filter_version
score_version
decision_version
ranked_candidates
selected_candidate
decision
reason_codes
risk_state_if_applicable
```

‏ה־Snapshot צריך לאפשר לשחזר למה המערכת בחרה או לא בחרה.

### ‏`P0 — Required`: Position / Capital State בתוך Backtest

‏Backtest של Strategy אינו אוסף עצמאי של Signals.

‏אם ה־Policy אומר Position אחת בכל רגע, צריך State:

```text
FLAT
ENTERING
POSITION
EXITING
```

‏כאשר Position קיימת, Signal חדש מטופל לפי Policy מפורשת:

```text
ignore
compare
replace
queue
```

‏אין לפתוח היסטורית יותר Positions ממה שהמערכת האמיתית הייתה מאפשרת.

### ‏`P0 — Required`: Entry/Exit לא יכולים להתרחש לפני Decision

‏Invariant בסיסי:

```text
feature_time <= decision_time
order_time >= decision_time
fill_time >= order_time
exit_decision_time >= entry_fill_time
exit_fill_time >= exit_order_time
```

‏Fill באותו Event שכבר שימש לקבלת Decision אסור, אלא אם מודל הזמן מוכיח במפורש שהדבר אפשרי.

### ‏`P1 — Preferred Default`: Simple Execution Mode מסומן במפורש

‏כאשר מוסיפים שלב Execution פשוט, נשתמש ב־Mode ברור:

```text
SIGNAL_ONLY
SIMPLE_EXECUTION
MICROSTRUCTURE_EXECUTION
REPLAY
```

‏`SIMPLE_EXECUTION` יכול לכלול:

```text
explicit assumed latency
simple executable quote reference
explicit round-trip cost model
simple exit policy
```

‏אבל אינו מוצג כאילו הוא Exchange Simulator מלא.

### ‏`P0 — Required`: Forward Return אינו PnL

‏נשמור בנפרד:

```text
forward_return_*
executable_gross_pnl
executable_net_pnl
```

‏`forward_return` הוא Label ל־Prediction Quality.

‏הוא אינו מוכיח שהיה Fill או שנשאר Net Edge.

### ‏`P1 — Preferred Default`: Multiple Horizons + Path Metrics

‏ל־Signal קצר נרצה לפחות:

```text
1s
2s
5s
10s
30s
60s
```

‏ולמדוד:

```text
forward return
MFE
MAE
time_to_first_positive_outcome
time_to_target
```

‏כך נזהה `Edge Decay` במקום להסתפק בנקודת סוף אחת.

### ‏`P0 — Required`: MFE/MAE הם Labels, לא מחירי Exit בדיעבד

‏אסור לבצע:

```text
sell at future max
```

‏`MFE` ו־`MAE` משמשים Diagnositics למחקר בלבד אלא אם Exit Policy אמיתית, שיכולה לפעול בזמן אמת, הגדירה Trigger שניתן לשחזר היסטורית.

### ‏`P1 — Preferred Default`: Signal Identity / Opportunity Episodes

‏Signals סמוכים מאוד של אותה מניה אינם בהכרח Samples עצמאיים.

‏נשמור:

```text
signal_id
opportunity_episode_id
first_seen_time
last_seen_time
peak_rank
peak_score
```

‏כדי למדוד persistence ולמנוע ניפוח מדגם דרך אותו Episode שוב ושוב.

### ‏`P0 — Required`: Data Quality State הוא חלק מה־Timeline

‏צריך להבחין בין:

```text
NO_EVENT
NO_CHANGE
MISSING_DATA
STALE_DATA
FEED_GAP
OUT_OF_ORDER
DUPLICATE
CORRECTED
```

‏`No Change != No Data` גם ב־Historical Data.

### ‏`P0 — Required`: Data Cleaning עצמו חייב להיות Point-in-Time Safe

‏אסור לנקות Record באמצעות Future Knowledge אם פעולה כזאת משנה Decision היסטורי כאילו המידע היה ידוע אז.

‏כל Cleaning Pipeline יקבל:

```text
cleaning_version
rule_id
input provenance
correction policy
```

### ‏`P1 — Preferred Default`: Historical/Live Parity

‏ככל האפשר:

```text
same canonical event schema
same feature code
same filter code
same score code
same decision code
```

‏בין:

```text
Historical
Replay
Paper/Shadow
Live
```

‏המטרה היא לצמצם `Research/Serving Skew`.

### ‏`P1 — Preferred Default`: Backtest Engine Provider-Agnostic

‏ה־Engine יקבל Canonical Events ולא Objects ספציפיים של Provider.

‏Baseline Event metadata:

```text
instrument_id
symbol
event_time
receive_time_if_available
event_type
price
size
bid
ask
bid_size
ask_size
source
quality_flags
```

### ‏`P0 — Required`: Immutable Run Artifact

‏כל Run מקבל:

```text
backtest_run_id
data_fingerprint
code_commit
config_hash
strategy_version
feature_version
filter_version
score_version
decision_version
cost_model_version
execution_model_version
risk_model_version
environment_version
random_seed
started_at
```

‏אחרי שה־Run הושלם:

```text
never mutate the historical result
```

‏שינוי Config או Code יוצר Run חדש.

### ‏`P0 — Required`: Dataset Immutable/Fingerprinted

‏Backtest לא ירוץ מול Database שמשתנה מתחתיו בלי Snapshot/Version.

‏נשמור לפחות:

```text
dataset_id
source
coverage_period
fingerprint
normalization_version
cleaning_version
```

### ‏`P1 — Preferred Default`: Assumption Registry

‏כל Run עם Execution Assumptions ישמור:

```text
backtest_mode
assumed_latency
fill_model
quote_selection_rule
spread_model
slippage_model
partial_fill_model
cost_model
session_policy
calendar_version
```

‏Report שאינו מציג Assumptions אינו מספיק לבחינת Reliability.

### ‏`P0 — Required`: Session Calendar אמיתי

‏Backtest צריך לזהות:

```text
trading days
holidays
early closes
market timezone
DST transitions
session boundaries
```

‏לא משתמשים בשעות Hardcoded בלי Calendar Version.

### ‏`P1 — Preferred Default`: Warm-Up מפורש

‏Feature של 60s אינו תקף בתחילת Session עד שנצבר מספיק History, אלא אם Policy מפורשת משתמשת ב־previous-session context.

‏נשמור:

```text
feature_valid
warmup_reason
history_available_ms
```

‏אין “להשלים” Warm-Up באמצעות Future Data.

### ‏`P1 — Preferred Default`: Funnel Diagnostics

‏בכל Snapshot נשמור Counts:

```text
base_universe_count
tradable_count
data_valid_count
fresh_count
eligible_count
ranked_count
```

‏וכן Rejection Reasons לפי Filter.

‏כך Collapse במשפך אינו מוסתר בתוך PnL aggregate.

### ‏`P1 — Preferred Default`: Rejected Opportunity Analysis

‏נשמור לפחות Sample או Aggregates של Candidates שנפסלו, עם Future Labels.

‏כך נוכל לשאול:

```text
Did filter X remove useful opportunities?
```

‏ולמדוד False Exclusions.

### ‏`P1 — Preferred Default`: Trade, Signal ו־Decision Ledgers נפרדים

‏Baseline artifacts:

```text
Decision Ledger
Signal / Candidate Ledger
Trade Ledger
Rejected Candidate Sample/Ledger
Run Summary
```

‏אין להסתפק ב־Equity Curve.

### ‏`P1 — Preferred Default`: Run Diff / Differential Testing

‏כאשר משנים Engine או Strategy:

```text
old run
vs
new run
```

‏נרצה לדעת איפה הופיע ה־First Divergence:

```text
changed market state
changed feature
changed filter
changed rank
changed decision
changed fill
changed pnl
```

‏זה חשוב יותר מהשוואת Net PnL בלבד.

### ‏`P0 — Required`: Backtest Invariants שנכשלים Hard

‏דוגמאות:

```text
feature_input_time <= as_of_time
anchor_time <= target_anchor_time
order_time >= decision_time
fill_time >= order_time
exit_fill_time >= entry_fill_time
no future data in feature module
no trade during invalid halt state
no duplicate exposure outside policy
same input/config => same decision trace
```

‏שבירת Invariant גורמת ל־Run להיכשל, לא רק Warning.

### ‏`P1 — Preferred Default`: Golden Dataset קטן

‏נחזיק Dataset ידני קטן, לדוגמה:

```text
3 symbols
60 seconds
known event ordering
known rank changes
known no-trade cases
known expected labels
```

‏עליו נבנה `Golden Backtest` שמוודא שהמנוע לא שינה Semantics.

### ‏`P1 — Preferred Default`: Property Tests

‏דוגמאות:

```text
adding future data cannot change an earlier decision
future event cannot alter earlier feature value
same input produces same output
removing an unrelated future event cannot change past ranking
```

### ‏`P1 — Preferred Default`: Accuracy לפני Performance

‏מותר להשתמש ב־:

```text
incremental state
precomputed anchors
feature caches
partitioning
parallel day runs
```

‏רק אם הם אינם משנים Semantics.

‏Optimization שמחליף Result הוא Bug עד שיוכח אחרת.

### ‏`P1 — Preferred Default`: Baseline / Benchmark קבועים

‏כל שיפור יושווה לפחות ל־Baseline פשוט, למשל:

```text
simple short-horizon momentum rank
```

‏וכן לפי הצורך:

```text
random eligible candidate
previous strategy version
single-feature rank
```

‏כך לא מזיזים Goalpost בכל ניסוי.

### ‏`P1 — Preferred Default`: Experiment Registry

‏לכל Experiment:

```text
experiment_id
parent_run_id
hypothesis
single intended change
expected effect
metrics
result
interpretation
```

‏Negative Result נשמר כידע ולא נמחק.

### ‏`P1 — Preferred Default`: Time-Ordered Validation

‏אין לעשות Shuffle אקראי נאיבי של Market Samples.

‏Baseline מחקרי:

```text
develop on past
freeze
validate on later period
```

‏`Walk-Forward`, ‏multiple testing ו־Overfitting מקבלים טיפול עמוק יותר במקטע 23.

### ‏`P1 — Preferred Default`: Stress / Sensitivity סביב Assumptions

‏לאחר שמוסיפים Execution Model:

```text
base case
conservative case
stress case
```

‏נבדוק למשל Sensitivity ל־:

```text
latency
spread
slippage
fees
```

‏Strategy שחיה רק תחת הנחה אופטימית אחת אינה מקבלת Promotion.

---

## ‏3. Why

‏Backtest יכול להיות משכנע מאוד גם כאשר הוא שגוי.

‏Timeline leak קטן, Universe של היום, Fill בלתי־אפשרי או מחיר Future Anchor יכולים ליצור “Edge” שאין לו שום משמעות תפעולית.

‏עבור מערכת שמחפשת Edge של שניות, אפילו טעות של מאות מילישניות יכולה לשנות:

```text
rank
candidate
entry feasibility
forward outcome
```

‏לכן Correctness של הזמן וה־State חשובה יותר בשלב הראשון מדיוק של Execution Simulator.

‏ה־Backtest צריך להיות קודם כול מערכת הוכחה:

```text
What was knowable?
What did the algorithm decide?
Can we reproduce that decision?
What happened afterward?
```

---

## ‏4. Use When

‏ה־Baseline מתאים כאשר רוצים:

- ‏לבדוק האם Momentum Features בכלל מנבאים continuation קצר.
- ‏להשוות Ranking חדש ל־Baseline.
- ‏לחקור Rank #1 מול Top-N.
- ‏לבדוק Thresholds/Filters בלי Future Leakage.
- ‏למדוד Edge Decay לפי Horizon.
- ‏לבצע RCA למועמדת שנבחרה או נפסלה.
- ‏להשוות Strategy Versions על אותו Dataset.
- ‏לבנות בסיס אמין למקטע 21, שבו יתווסף Execution Realism עמוק יותר.

---

## ‏5. Do Not Use When

‏אין להציג `SIGNAL_ONLY` Backtest כתחזית PnL למסחר אמיתי.

‏אין לסמוך על Run כאשר:

```text
historical universe is unknown
critical timestamps are ambiguous and undocumented
future data may enter features
fill assumptions are implicit
costs are silently zero
run input is mutable
results cannot be reproduced
```

‏במצבים האלה ה־Result הוא לכל היותר Exploratory.

---

## ‏6. Alternatives

### ‏A. Snapshot-Only Backtest

‏יתרון:

```text
simple
fast
cheap to implement
```

‏חיסרון:

```text
loses intra-snapshot path
may hide event ordering
weak for fill realism
```

### ‏B. Event-Driven Backtest

‏יתרון:

```text
natural timeline
better state reconstruction
stronger replay parity
```

‏חיסרון:

```text
more data
more engineering
higher compute cost
```

### ‏C. Hybrid — Recommended Path

```text
events update canonical state continuously
ranking/decision runs on controlled cadence or material trigger
```

‏זה מתאים במיוחד למערכת שלנו.

### ‏D. Full Microstructure Simulator

‏מועיל רק כאשר Signal Baseline כבר מצדיק את המורכבות.

‏שייך בעיקר ל־21 ומאוחר יותר.

---

## ‏7. Trade-offs

| החלטה | יתרון | מחיר |
|---|---|---|
| ‏Signal-first | ‏מבודד predictive value | ‏עדיין לא מוכיח PnL |
| ‏Point-in-time universe | ‏מונע survivorship bias | ‏דורש reference history |
| ‏Immutable datasets | ‏Reproducibility | ‏Storage/versioning |
| ‏Top-N logging | ‏RCA ו־counterfactual | ‏יותר נתונים |
| ‏Event-driven state | ‏timeline fidelity | ‏יותר complexity |
| ‏Simple execution first | ‏KISS | ‏פחות realism |
| ‏Hard invariants | ‏מונע silent corruption | ‏Runs עלולים להיכשל מוקדם |
| ‏Shared live/backtest code | ‏parity | ‏דורש architecture נקייה |

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏Exchange Simulator מלא לפני הוכחת Signal Edge.
- ‏Queue Position מדויק לכאורה בלי נתוני Queue אמיתיים.
- ‏Thousands of parameter combinations.
- ‏Fill at `Last` או `Mid` ללא הצהרת Assumption.
- ‏Universe של היום.
- ‏Nearest anchor שיכול להגיע מהעתיד.
- ‏Interpolation שקט.
- ‏Backtest שומר רק Trades שבוצעו ולא `NO TRADE`/rejections.
- ‏Equity Curve בלי Decision Trace.
- ‏Feature code נפרד ל־Historical ול־Live.
- ‏Data cleaning בדיעבד ללא version/provenance.
- ‏Optimization שמחליף Semantics בשם Performance.

---

## ‏9. What to Add Later

‏לאחר Baseline נקי:

```text
21 → realistic seconds execution
22 → predictive validation / rank diagnostics
23 → overfitting, leakage, walk-forward discipline
24 → structured experiments / score improvement
25 → regime analysis
26 → deep RCA
27 → deterministic replay
28 → paper / shadow
```

‏אפשר להוסיף גם:

```text
advanced oracle bounds
regret decomposition
opportunity episode clustering
provider cross-validation
distributed research execution
```

‏רק כאשר הם פותרים שאלה מחקרית ממשית.

---

## ‏10. Required Data / Evidence

### ‏Dataset

```text
point-in-time instrument identity
historical universe membership
trading/session state
trades and/or quotes with timestamps
source/feed metadata
quality flags
corporate-action metadata
calendar/session version
```

### ‏Run Metadata

```text
run_id
data fingerprint
code commit
config hash
strategy versions
assumption registry
random seed
environment version
```

### ‏Decision Evidence

```text
as_of_time
feature snapshot
filter results
ranked Top-N
decision
reason codes
position state
```

### ‏Outcome Evidence

```text
forward outcomes by horizon
MFE / MAE
time-to-profit
time-to-target
execution results when that mode is enabled
cost decomposition when that mode is enabled
```

---

## ‏11. Promotion Criteria

‏Backtest Infrastructure יכולה להתקדם ל־Foundation עבור שאר המחקר רק אם:

1. ‏כל Timeline Invariants עוברים.
2. ‏Future-data property tests עוברים.
3. ‏Golden Dataset מפיק בדיוק את Expected Decisions.
4. ‏אותו Run ניתן לשחזור bit-for-bit או semantic-equivalent לפי המדדים שהוגדרו.
5. ‏Historical Universe הוא point-in-time או שמגבלת coverage מתועדת במפורש.
6. ‏Dataset fingerprint ו־code/config versions נשמרים.
7. ‏`NO TRADE`, ‏Top-N ו־Rejected reasons נשמרים.
8. ‏Signal Backtest אינו מתויג כ־Execution PnL.
9. ‏Run Diff יכול לזהות First Divergence בין גרסאות.
10. ‏Data Quality Report קיים לפני Run משמעותי.

---

## ‏12. Rejection Criteria

‏אין לסמוך על Run אם נמצא אחד מהבאים:

```text
future event changed past decision
future anchor used
current universe used for historical period
symbol existed outside valid lifecycle
halt ignored
mutable dataset changed during run
same inputs produced different decisions
feature and label code share future state
position/capital policy violated
fill occurred before allowed order time
implicit zero cost in execution result
unversioned data cleaning changed results
```

‏במקרים כאלה מתקנים את Infrastructure לפני שמפרשים את PnL.

---

## ‏13. Metrics

### ‏Integrity

```text
invariant_failures
future_access_attempts
anchor_gap_distribution
missing_feature_rate
stale_state_rate
data_gap_rate
duplicate_event_rate
out_of_order_rate
```

### ‏Scanner / Prediction

```text
sample_count
opportunity_episode_count
hit_rate by horizon
mean / median forward return
rank buckets
Top-1 vs Top-N separation
MFE / MAE
time_to_first_profit
time_to_target
edge decay
```

### ‏Decision Funnel

```text
signals_per_hour
decisions_per_hour
no_trade_rate
rejection_reason_counts
eligible_count distribution
ranked_count distribution
```

### ‏Trading Mode, כאשר קיים

```text
trade_count
gross_pnl
net_pnl
expected_value
fill_rate
turnover
max_drawdown
costs
hold_time distribution
```

### ‏Robustness

```text
period stability
parameter sensitivity
assumption sensitivity
PnL concentration
symbol concentration
hour/session concentration
outlier dependence
```

---

## ‏14. Failure Modes

### ‏`LOOK_AHEAD_FEATURE`
‏Feature קרא Event אחרי `as_of_time`.

### ‏`FUTURE_ANCHOR`
‏Anchor נבחר לפי nearest במקום latest-before.

### ‏`SURVIVORSHIP_BIAS`
‏Universe מודרני הוחל על עבר.

### ‏`SYMBOL_LIFECYCLE_ERROR`
‏Instrument הופיע לפני Listing או תחת Mapping לא נכון.

### ‏`CORPORATE_ACTION_MIXUP`
‏Raw ו־Adjusted Prices התערבבו.

### ‏`LABEL_LEAKAGE`
‏Future Outcome חדר ל־Feature/Filter/Score.

### ‏`IMPOSSIBLE_FILL`
‏Fill קדם ל־Decision/Order או השתמש במחיר לא זמין.

### ‏`NO_TRADE_ERASURE`
‏Backtest הכריח Trades למרות שה־Policy הייתה נמנעת.

### ‏`STATELESS_SIGNAL_TEST`
‏כל Signal נבחן כאילו אין Position/Capital state.

### ‏`DUPLICATE_SAMPLE_INFLATION`
‏אותו Opportunity Episode נספר שוב ושוב כ־Samples עצמאיים.

### ‏`DATA_GAP_AS_FLAT_PRICE`
‏חוסר נתונים פורש כ־No Change.

### ‏`MUTABLE_RUN_INPUT`
‏DB השתנה במהלך Run.

### ‏`NONDETERMINISTIC_ORDERING`
‏Events באותו Timestamp נותנים Result שונה בין Runs.

### ‏`UNEXPLAINABLE_RESULT`
‏אי אפשר לשחזר למה Candidate נבחרה.

### ‏`PARAMETER_MINING`
‏נבחר Config אחרי אלפי ניסיונות על אותו Data.

### ‏`BEST_CASE_ONLY`
‏ה־Strategy עובדת רק תחת Assumptions אופטימיות.

---

## ‏15. User-Specific Application

‏למערכת שלנו סדר המחקר המומלץ הוא:

```text
Can the scanner find short-horizon continuation?
↓
Does Rank #1 outperform lower ranks?
↓
How quickly does the edge appear and decay?
↓
How many NO TRADE decisions are correct?
↓
Only then: can realistic execution capture it?
↓
Only then: does it survive round-trip costs?
↓
Only then: is it stable out-of-sample / replay / shadow?
```

‏זה מתאים במיוחד למטרה שלנו מפני שהמוצר המחקרי הראשון אינו “רובוט שקונה”, אלא מנגנון שמוכיח או מפריך:

```text
which stock was best at T
using only information known at T
```

‏לכן Baseline של Top-N + Forward Labels חשוב יותר כרגע מ־Execution Simulator מורכב.

---

## ‏16. Concrete Baseline Contract

```text
BacktestMode = SIGNAL_ONLY

Input:
  immutable canonical historical dataset
  point-in-time universe
  versioned trading calendar

Decision cadence:
  1-second research baseline

At each decision time T:
  apply all events allowed by T
  build canonical state as of T
  mark stale/missing state explicitly
  compute point-in-time features
  apply filters
  rank all eligible symbols
  save Top 20
  evaluate TRADE / NO TRADE policy
  save full decision trace

Labels after T:
  1s / 2s / 5s / 10s / 30s / 60s
  forward returns by explicit price basis
  MFE / MAE
  time to first positive outcome
  time to target

Artifacts:
  run manifest
  data-quality report
  decision ledger
  Top-N candidate ledger
  rejection/funnel diagnostics
  aggregate report
```

‏לאחר שה־Baseline מוכיח Predictive Value:

```text
Mode = SIMPLE_EXECUTION
add explicit latency
add executable quote rule
add cost engine
add entry / exit policy
```

‏ואז מקטע 21 מוסיף Fill Realism עמוק יותר.

---

## ‏17. Confidence

| Recommendation | Confidence |
|---|---|
| ‏Point-in-time correctness | `High` |
| ‏Strict feature/label separation | `High` |
| ‏Point-in-time universe | `High` |
| ‏Deterministic event ordering | `High` |
| ‏Immutable/fingerprinted runs | `High` |
| ‏Signal-first before complex execution | `High` |
| ‏Top-N + NO TRADE logging | `High` |
| ‏Hybrid event-state + controlled decision cadence | `Medium-High` |
| ‏1-second research cadence as best final cadence | `Low / Unproven` |
| ‏Specific forward horizons as optimal | `Low / Unproven` |
| ‏Opportunity episode clustering rule | `Low / Research` |

---

## ‏18. Time-Sensitive Facts

‏המקטע מתודולוגי בעיקרו ואינו נשען על תעריף, API או כלל Broker ספציפי כדי לקבוע את ה־Baseline.

‏כן קיימים Inputs תלויי־זמן שחייבים Versioning במחקר:

```text
trading calendar
listing / delisting state
symbol mapping
corporate actions
fee schedules when execution mode is enabled
market-structure rules that affect executability
provider data semantics
```

‏כאשר אחד מהם משמש Run היסטורי, צריך להשתמש בגרסה שהייתה רלוונטית לתקופה או לתעד במפורש את המגבלה.

---

## ‏19. Relationship to Later Sheets

```text
20 — timeline / research truth
↓
21 — realistic seconds execution backtest
↓
22 — prove scanner predictive value
↓
23 — overfitting / leakage / validation discipline
↓
24 — experiment design / score improvement
↓
25 — regime analysis
↓
26 — RCA
↓
27 — replay
↓
28 — paper / shadow
```

‏מקטע 20 קובע את ה־Truth Contract שעליו כל המחקר המאוחר יותר חייב להישען.

---

## ‏20. Recommendation Summary

### ‏`P0`

- ‏כל Feature ו־Decision הם Point-in-Time.
- ‏`Universe(as_of_time)` ולא Universe של היום.
- ‏Features ו־Labels מופרדים.
- ‏Anchors לעולם לא מגיעים מהעתיד.
- ‏Decision/Order/Fill obey deterministic timeline.
- ‏`NO TRADE` נשמר.
- ‏Position/Capital state נשמר.
- ‏Dataset ו־Run הם immutable/versioned.
- ‏Backtest Invariants נכשלים Hard.

### ‏`P1`

- ‏Signal Backtest לפני Execution Backtest מורכב.
- ‏Hybrid architecture: events update state, ranking בקצב מבוקר.
- ‏Top-N + Rejected Candidate diagnostics.
- ‏Immutable Run Manifest + Assumption Registry.
- ‏Decision/Signal/Trade Ledgers.
- ‏Golden Dataset, property tests ו־Run Diff.
- ‏Time-ordered OOS validation.

### ‏`P2/P3`

- ‏Opportunity episode clustering.
- ‏Advanced counterfactual/oracle diagnostics.
- ‏Provider cross-validation.
- ‏Distributed/accelerated research engine.
- ‏Microstructure execution simulation — רק לאחר Evidence, ובעיקר במקטע 21.

### ‏Bottom Line

‏ה־Backtest הראשון שאנחנו סומכים עליו אינו זה שמראה את ה־PnL הכי יפה.

‏הוא זה שיכול להוכיח:

```text
what the system knew at T
→ what it computed at T
→ what it ranked at T
→ what it decided at T
→ what happened only after T
```

‏ורק אחרי שהשרשרת הזאת נקייה, דטרמיניסטית וניתנת לשחזור, יש משמעות אמיתית להוסיף Execution Realism ולשאול כמה Edge ניתן להפוך לתוצאה כלכלית.