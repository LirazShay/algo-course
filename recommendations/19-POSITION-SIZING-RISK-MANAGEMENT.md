# ‏19 — Recommendation Sheet: Position Sizing / Risk Management

> ‏מקור לימודי עיקרי: `../19-POSITION-SIZING-AND-RISK-MANAGEMENT.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי ודטרמיניסטי ל־`Position Sizing` ול־`Risk Management`, כך שה־Scanner רשאי להציע הזדמנות אך אינו רשאי לקבוע בעצמו כמה Exposure מותר ליצור. ה־Risk Engine צריך להגביל גודל, קצב, חשיפה ומצבי מערכת, לספור גם Pending/Unknown exposure, לשרוד Restart, ולהעדיף Survival ו־State Correctness על פני מקסום PnL.
>
> ‏המסמך אינו קובע אחוז סיכון, סכום כסף או מינוף למסחר חי. המספרים עצמם נשארים Configuration שניתן לקדם רק לאחר Research, Replay ו־Shadow validation ובהתאם למסגרת החשבון הרלוונטית.

---

## ‏1. Decision

‏השאלה אינה רק:

```text
How many shares should we request?
```

‏אלא:

```text
Is new exposure allowed at all?
If yes, what is the maximum defensible quantity now?
What happens when risk state deteriorates?
How do we prevent one bad trade, one bad regime,
one operational bug or one unknown state
from creating uncontrolled damage?
```

‏הארכיטקטורה הרצויה:

```text
Market Data
    ↓
Scanner
    ↓
Decision Engine
    ↓
Risk Engine
    ↓
Execution Engine
    ↓
Broker

Broker Positions / Orders / Executions / Account
    ↓
Risk Engine
```

‏העיקרון:

```text
Scanner proposes opportunity.
Risk Engine decides whether exposure is allowed,
and if so, how much.
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Risk Engine עצמאי מה־Scanner

‏ה־Scanner אינו רשאי לעקוף Hard Risk Limits.

‏גם Candidate עם:

```text
rank = 1
score = very_high
expected_net_edge > 0
```

‏יכול לקבל:

```text
RISK_REJECT
```

‏אם אחד מתנאי הבטיחות או החשיפה נכשל.

### ‏`P0 — Required`: Research/Replay/Shadow לפני כל Promotion של Sizing

‏בשלב הזה ברירת המחדל היא לבחון את המנגנון בסביבת:

```text
historical research
→ deterministic replay
→ paper / shadow
```

‏ולא לבחור סכום, אחוז חשבון או מינוף כ־live recommendation.

‏המטרה הראשונה היא להוכיח:

```text
state correctness
sizing correctness
risk invariants
reconciliation correctness
cost / liquidity realism
```

‏לפני שמגדילים Complexity או Exposure.

### ‏`P1 — Preferred Default`: Fixed Small Research Notional לפני Dynamic Sizing

‏במחקר הראשוני עדיף Size פשוט ואחיד יחסית, כדי לא לערבב:

```text
signal quality
+
sizing quality
```

‏באותו ניסוי.

‏המסלול המומלץ:

```text
Fixed research size
→ liquidity cap
→ explicit trade-risk cap
→ execution/cost cap
→ volatility adjustment only if proven
→ confidence adjustment only if calibrated
```

‏לא מתחילים מ־Dynamic Sizing מורכב.

### ‏`P1 — Preferred Default`: `Min of Constraints`

‏זהו ה־Sizing Contract המרכזי:

```text
final_quantity = min(
    quantity_by_capital,
    quantity_by_trade_risk,
    quantity_by_liquidity,
    quantity_by_execution_cost,
    quantity_by_strategy_limit,
    quantity_by_account_limit
)
```

‏כל שכבה רשאית:

```text
approve less
or
approve zero
```

‏אבל אינה רשאית להגדיל מעבר למגבלה של שכבה אחרת.

‏אם אחת המגבלות מחזירה:

```text
0
```

‏התוצאה היא:

```text
NO TRADE
```

### ‏`P0 — Required`: Planned Risk אינו Worst-Case Loss

‏נשמור בנפרד:

```text
planned_risk
stress_risk
execution_risk
tail_risk
operational_risk
```

‏מרחק Stop או Exit Boundary אינו הבטחה למחיר Fill.

‏לכן:

```text
quantity × stop_distance
```

‏אינו מספיק כמודל סיכון יחיד.

### ‏`P1 — Preferred Default`: Trade Risk מבוסס על Exit Realism

‏Baseline רעיוני:

```text
expected_trade_risk =
    approved_quantity
    × expected_adverse_move_per_share
    + expected_exit_friction
    + explicit_costs
    + operational_buffer_when_relevant
```

‏הערכים עצמם צריכים להגיע מ־measured distributions ולא ממספרים שרירותיים.

### ‏`P0 — Required`: Liquidity היא מגבלת Size

‏Position Size לעולם אינה מנותקת מיכולת היציאה.

‏השאלה:

```text
Can we get flat fast enough
for the quantity we are considering?
```

‏חשובה יותר מ־:

```text
Can we enter this quantity?
```

‏נשמור לכל Candidate לפחות:

```text
planned_qty
available_bid_size / executable_sell_size proxy
available_ask_size / executable_buy_size proxy
size_to_bid_liquidity
size_to_ask_liquidity
expected_entry_slippage
expected_exit_slippage
expected_time_to_flat
```

### ‏`P0 — Required`: Working Orders הם Exposure

‏Risk Engine צריך לחשב:

```text
filled exposure
+
working-order potential exposure
+
pending-submit exposure
+
cancel-pending exposure
+
unknown-state conservative exposure
```

‏ולא רק Positions שכבר התמלאו.

### ‏`P0 — Required`: `UNKNOWN != SAFE`

‏כאשר לא ידוע אם Order התקבלה, התמלאה או בוטלה:

```text
no new exposure
```

‏עד reconciliation.

‏במיוחד:

```text
cancel sent != canceled confirmed
```

### ‏`P0 — Required`: Broker/Authoritative State כחלק מה־Risk Truth

‏ב־Startup, Reconnect או mismatch:

```text
load durable local risk state
fetch authoritative broker positions
fetch open orders
fetch recent executions when needed
fetch account state
compare
resolve mismatches
only then enable new entries
```

‏Local memory לבדו אינו מקור סמכות מספיק.

### ‏`P0 — Required`: Hard Risk Limits פשוטים ומפורשים

‏Baseline צריך להכיל מעט Limits שקל להסביר ולבדוק:

```text
max_position_notional
max_quantity
max_total_exposure
max_open_positions
max_daily_loss / daily risk budget
max_order_rate
max_pending_exposure
max_stale_data_age
no_new_entry_on_unknown_state
```

‏אין כאן המלצה לערכים מספריים.

### ‏`P0 — Required`: Risk State Machine

‏Baseline:

```text
NORMAL
REDUCED_SIZE
PAUSED
EXIT_ONLY
LOCKED
```

‏משמעות:

```text
NORMAL
→ new entries may be evaluated

REDUCED_SIZE
→ research/shadow sizing is clamped lower by policy

PAUSED
→ no new entries; existing exposure still managed

EXIT_ONLY
→ no new entries; only reduce/close exposure

LOCKED
→ no automatic return to normal; explicit recovery process required
```

‏`EMERGENCY_FLATTEN` יכול להישמר כ־operational state נפרד כאשר סביבת הביצוע תומכת ומאומתת לכך, אך אינו תחליף ל־reconciliation.

### ‏`P0 — Required`: Risk State Durable

‏Restart אינו מוחק:

```text
daily realized pnl
risk state
kill-switch reason
peak equity / peak pnl
current drawdown
loss streak
orders sent
trades completed
```

‏Risk reset חייב להיות פעולה מפורשת ומבוקרת, לא side effect של process restart.

### ‏`P1 — Preferred Default`: One Position at a Time כ־Baseline מחקרי

‏בשלב הראשון, מודל של Position אחת בכל רגע הוא Baseline פשוט למחקר מפני שהוא מפחית:

```text
correlation ambiguity
capital allocation complexity
concurrent execution complexity
portfolio-level reconciliation complexity
```

‏אבל זו Hypothesis הנדסית/מחקרית בלבד.

‏בהמשך אפשר להשוות:

```text
Top 1
vs
Top 2
vs
Top N
```

‏על בסיס Net outcome + drawdown + operational complexity.

### ‏`P1 — Preferred Default`: Risk Budget בכמה שכבות

‏המודל הרעיוני:

```text
Account / Environment Budget
        ↓
Daily Budget
        ↓
Strategy-Version Budget
        ↓
Trade Budget
```

‏בנוסף נפריד:

```text
signal-loss budget
execution-cost budget
operational uncertainty buffer
```

‏כדי לבצע Attribution אמיתי.

### ‏`P1 — Preferred Default`: Daily Stop הוא Safety + Diagnostic Trigger

‏כאשר Budget יומי נשבר:

```text
no new entries
```

‏אבל זה אינו סוף התהליך.

‏האירוע צריך לפתוח:

```text
RCA
```

‏על:

```text
signal distribution
execution costs
slippage
feed health
broker state
regime
symbol concentration
risk invariant violations
```

### ‏`P2 — Challenger`: Loss Velocity

‏במערכת מהירה, Risk יכול להידרדר לפני שה־Daily Loss Limit נשבר.

‏Challenger חשוב:

```text
loss_amount_per_unit_time
loss_count_per_unit_time
```

‏אם ההתפלגות חריגה, המערכת יכולה לעבור ל־:

```text
PAUSED
```

‏או `REDUCED_SIZE` במחקר.

### ‏`P2 — Challenger`: Drawdown / Giveback Controls

‏נשמור:

```text
start_of_day_pnl
peak_intraday_pnl
current_pnl
intraday_drawdown
```

‏Giveback-based reduction/pausing נשאר Challenger עד שיש Evidence שהוא משפר Survival בלי לחתוך Edge תקין.

### ‏`P2 — Challenger`: Liquidity-Based Sizing

‏לאחר Baseline פשוט:

```text
quantity_by_liquidity
```

‏יכול להפוך ל־cap דינמי לפי executable depth/size, slippage ו־time-to-flat.

‏הוא צריך להיבדק יחד עם Cost Engine של מקטע 18.

### ‏`P2 — Challenger`: Short-Horizon Volatility Adjustment

‏אם נרצה התאמת Size לתנודתיות, נעדיף לבדוק מדדים שמתאימים ל־Signal Horizon:

```text
1s realized volatility
5s realized volatility
10s realized volatility
spread volatility
short-horizon price jump metrics
```

‏ולא להניח אוטומטית ש־daily `ATR` מתאים לעסקה של שניות.

### ‏`P3 — Advanced Challenger`: Signal-Quality / Confidence Sizing

‏אין להגדיל Size רק משום:

```text
score is high
```

‏לפני שימוש ב־confidence-based sizing נדרש Calibration שמקשר Score/Confidence ל־Outcome Distribution יציבה Out-of-Sample.

### ‏`P4 — Avoid Unless Strong Evidence`: Kelly / Fractional Kelly

‏`Kelly` רגיש מאוד לשגיאת Edge estimation.

‏כאשר:

```text
win probability uncertain
payoff distribution unstable
cost model still calibrating
regime dependence material
```

‏הוא אינו Baseline מתאים.

---

## ‏3. Why

### ‏Fact

‏`Position Size`, ‏`Capital` ו־`Risk per Trade` הם מושגים שונים.

### ‏Fact

‏Stop או Exit Trigger אינם מבטיחים Fill במחיר התיאורטי.

### ‏Fact

‏Partial Fill, ‏Cancel Pending ו־Unknown Order State יכולים ליצור Exposure גם כאשר Local workflow טרם הגיע ל־state צפוי.

### ‏Fact

‏Working Orders יכולים להפוך ל־Positions ולכן הם חלק מ־Pending Exposure.

### ‏Fact

‏גודל פוזיציה משפיע על Slippage, Fill probability ו־Market Impact; לכן Capacity אינה ליניארית.

### ‏Fact

‏Risk של Strategy אינו רק Market Risk; הוא כולל גם Data, Execution, Broker, State ו־Operational Risk.

### ‏Judgment

‏במערכת Short-Horizon צעירה עדיף להתחיל ב־Sizing פשוט ושמרני מבחינה מחקרית כדי למדוד Signal ו־Execution לפני התאמות דינמיות.

### ‏Judgment

‏Risk Engine צריך להיות deterministic, independent ו־fail-closed במצבי uncertainty קריטיים.

### ‏Judgment

‏State correctness ו־ability-to-flat חשובים יותר מאופטימיזציה של עוד כמה basis points ב־expected return.

### ‏Hypothesis

‏`One position at a time` עשוי להיות Baseline טוב למערכת האישית בגלל simplicity ו־capital focus, אך יש להשוות אותו ל־Top-N allocation לאחר שה־single-position baseline יציב.

### ‏Hypothesis

‏Loss Velocity ו־short-horizon liquidity/volatility sizing עשויים לשפר tail behavior יותר מאשר confidence sizing.

---

## ‏4. Use When

‏ה־Baseline מתאים כאשר:

- ‏המערכת עדיין בשלב Research/Replay/Shadow.
- ‏ה־Signal וה־Cost Model עדיין עוברים Calibration.
- ‏ה־Holding Horizon הוא milliseconds/seconds/tens of seconds.
- ‏Partial fills, stale state ו־reconnect הם תרחישים אפשריים.
- ‏רוצים Explainability מלאה של כל Quantity.
- ‏רוצים להפריד Signal improvement מ־Sizing improvement.
- ‏Operational correctness חשובה לפחות כמו prediction quality.

---

## ‏5. Do Not Use When

‏אין להעתיק את ה־Baseline כפי שהוא כאשר:

- ‏מפעילים Portfolio רב־נכסי מורכב עם hedge/correlation optimization מוכח.
- ‏האסטרטגיה היא market-neutral או derivatives-based ודורשת Greeks/margin modeling.
- ‏ה־Holding Horizon שונה מהותית ולכן short-horizon liquidity metrics אינם מייצגים Risk.
- ‏מנסים להסיק Live limits מתוך דוגמאות מחקריות במקום מתוך account/market constraints מאומתים.
- ‏Broker/account rules אינם ידועים; אז קודם מאמתים אותם ולא מנחשים.

---

## ‏6. Alternatives

### ‏Alternative A — Fixed Notional בלבד

‏יתרון:

```text
simple
reproducible
low parameter count
```

‏חיסרון:

```text
ignores heterogeneous liquidity / volatility / exit capacity
```

### ‏Alternative B — Fixed Fractional Risk

‏יכול להתאים לאחר שיש Loss Distribution ו־Exit model אמינים.

‏אין לבחור אחוז בלי Evidence.

### ‏Alternative C — Liquidity-Adjusted Size

‏מקטין Size כאשר top-of-book/depth/executable exit חלשים.

‏דורש data quality ו־execution calibration.

### ‏Alternative D — Volatility-Adjusted Size

‏מכוון ל־risk normalization לפי short-horizon volatility.

‏עלול להיות noisy מאוד באופק קצר.

### ‏Alternative E — Confidence-Adjusted Size

‏מגדיל/מקטין Size לפי confidence calibrated.

‏דורש הרבה יותר Evidence ומועד ל־overfitting.

### ‏Alternative F — Portfolio Optimization

‏רלוונטי רק לאחר שתהיה הצדקה אמפירית להחזיק כמה Positions במקביל.

---

## ‏7. Trade-offs

### ‏Fixed Size

```text
+ simple attribution
+ deterministic
+ easy replay
- heterogeneous risk across symbols
```

### ‏Risk-Based Size

```text
+ closer risk normalization
+ adapts to adverse-loss estimate
- depends on quality of loss model
```

### ‏Liquidity-Based Size

```text
+ better execution realism
+ protects exit capacity
- requires richer data and calibration
```

### ‏Dynamic Size by Signal Quality

```text
+ potential capital efficiency
- large model-risk / calibration burden
- easy to overfit
```

### ‏Single Position Baseline

```text
+ simple state and attribution
+ easier reconciliation
- may miss simultaneous opportunities
```

### ‏Multiple Positions

```text
+ opportunity diversification
- correlation / exposure / operational complexity
```

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל מ־:

- ‏`Kelly` או Fractional Kelly.
- ‏Sizing לפי Score לא־calibrated.
- ‏30+ Dynamic Risk rules.
- ‏Regime-specific sizing לפני Baseline יציב.
- ‏Portfolio optimization לפני single-position evidence.
- ‏Sizing לפי daily `ATR` בלי הוכחה שהוא רלוונטי ל־seconds horizon.
- ‏הנחה ש־Stop distance הוא worst-case loss.
- ‏הנחה ש־Broker Buying Power הוא Risk Budget.
- ‏הנחה ש־Cancel Pending כבר אינו Exposure.
- ‏Risk state שנמצא רק ב־UI או memory.
- ‏Reset שמוחק Daily Risk state אחרי Restart.
- ‏Dynamic size increase אחרי win streak.
- ‏Martingale / size increase כדי “להחזיר” הפסד.
- ‏AI improvisation של Hard Risk Limits בזמן אמת.

---

## ‏9. What to Add Later

‏רק לאחר Baseline יציב:

1. ‏Short-horizon volatility sizing.
2. ‏Liquidity/depth-aware sizing מתקדם.
3. ‏Loss Velocity based state transitions.
4. ‏Drawdown / Giveback hysteresis.
5. ‏Correlation and common-factor exposure.
6. ‏Multi-position portfolio budget.
7. ‏Regime-aware risk budgets.
8. ‏Event/news-aware risk states.
9. ‏Expected Shortfall / tail modeling.
10. ‏Monte Carlo sequence-risk studies.
11. ‏Confidence-calibrated sizing.
12. ‏Capital ramp / canary promotion framework.
13. ‏Capacity curve by notional and symbol class.
14. ‏Learned risk model — רק אם הוא נשאר explainable ומעל Hard Limits דטרמיניסטיים.

---

## ‏10. Required Data / Evidence

‏לכל Trade/Intent נדרוש:

```text
intent_id
signal_id
decision_id
symbol / canonical instrument id
requested_quantity
approved_quantity
requested_notional
approved_notional
reference_price
account_equity_snapshot
buying_power_snapshot if applicable
filled_exposure
working_order_exposure
pending_exposure
unknown_state_exposure
current_total_exposure
current_symbol_exposure
risk_state
daily_realized_pnl
daily_unrealized_pnl when used
peak_intraday_pnl / equity
current_drawdown
loss_streak
order_rate
spread
quote_age
liquidity metrics
expected_entry_cost
expected_exit_cost
expected_time_to_flat
planned_risk
stress_risk
risk_model_version
risk_config_version
risk_reason_codes
```

‏לאחר Close:

```text
actual_entry_slippage
actual_exit_slippage
actual_cost
realized_net_pnl
MAE
MFE
time_to_first_loss
time_to_first_profit
time_to_flat
loss classification
risk invariant violations
near misses
```

---

## ‏11. Promotion Criteria

### ‏Fixed Research Sizing → Risk-Aware Sizing

‏נקדם רק אם:

- ‏Risk Engine deterministic ב־Replay.
- ‏State reconstruction נכון אחרי restart/reconnect.
- ‏Pending/Unknown exposure נספר בצורה שמרנית.
- ‏Cost Model ו־Liquidity metrics מספיק יציבים.
- ‏Sizing החדש משפר Net outcome או tail behavior Out-of-Sample.
- ‏אין עלייה בלתי מוסברת ב־Operational incidents.
- ‏Sensitivity מראה אזור יציב ולא נקודת קסם.

### ‏Single Position → Multi-Position

‏נקדם רק אם:

- ‏יש incremental opportunity value.
- ‏Correlation/common-factor risk נמדד.
- ‏Portfolio exposure reconciliation אמין.
- ‏Execution latency לא נפגע בצורה מהותית.
- ‏Tail losses אינם גדלים בצורה לא־סבירה.

### ‏Static Risk → Dynamic Risk

‏נקדם רק אם:

- ‏ה־state variable המפעיל שינוי Risk מוכח predictive/risk-relevant.
- ‏השיפור נשמר OOS ובכמה Regimes.
- ‏הכלל פשוט מספיק להסבר ול־test.
- ‏יש Recovery/Hysteresis policy מוגדרת.

### ‏Shadow → Any Later Operational Promotion

‏דורש לפחות:

```text
zero unexplained duplicate exposure
deterministic risk decisions
reliable reconciliation
stable cost/slippage estimates
controlled tail behavior
verified account/broker constraints
explicit recovery procedure
```

---

## ‏12. Rejection Criteria

‏נבטל או נחזיר Challenger למחקר אם:

- ‏Sizing מגדיל PnL אבל גם מגדיל tail loss בצורה לא־סבירה.
- ‏השיפור נעלם לאחר costs/slippage.
- ‏המודל תלוי בפרמטר צר מדי.
- ‏Dynamic sizing אינו יציב בין Regimes.
- ‏Risk Engine אינו reproducible ב־Replay.
- ‏Unknown/cancel-pending exposure לא נספר נכון.
- ‏Restart יכול לאפס Safety State.
- ‏Risk החלטות אינן explainable.
- ‏Size גדול יותר פוגע ב־fill rate/time-to-flat.
- ‏Risk rule מגיב מאוחר יותר מה־failure mode שהוא אמור לעצור.
- ‏Hard Limit יכול להיעקף דרך code path אחר.

---

## ‏13. Metrics

### ‏Trade-level

```text
requested_qty
approved_qty
requested_notional
approved_notional
planned_risk
stress_risk
actual_net_loss_if_loss
MAE
MFE
entry_slippage
exit_slippage
time_to_flat
size_to_liquidity
risk_reject_reason
risk_state_at_decision
```

### ‏Session/day-level

```text
trade_count
win_count
loss_count
net_pnl
peak_pnl
current_drawdown
max_drawdown
loss_streak
loss_velocity
gross_exposure_peak
pending_exposure_peak
time_at_risk
orders_sent
cancels_sent
replaces_sent
risk_rejects
kill_switch_events
near_miss_count
state_mismatch_count
```

### ‏Tail metrics

```text
P90 / P95 / P99 loss
worst 1% average loss
worst 0.1% when sample size supports it
expected shortfall style diagnostics
max time-to-flat
P95 / P99 time-to-flat
```

### ‏Sizing diagnostics

```text
pnl_by_size_bucket
slippage_by_size_bucket
fill_rate_by_size_bucket
time_to_flat_by_size_bucket
drawdown_by_size_policy
net_edge_retained_by_size
```

---

## ‏14. Failure Modes

### ‏Failure Mode 1 — Stop-distance illusion

‏המערכת מניחה שהפסד מקסימלי שווה Stop distance.

‏תיקון:

```text
planned risk + execution risk + tail scenarios
```

### ‏Failure Mode 2 — Buying Power as Risk Budget

‏תיקון:

```text
broker allowance != strategy risk allowance
```

### ‏Failure Mode 3 — Pending exposure ignored

‏תיקון:

```text
working + pending + cancel-pending + unknown count conservatively
```

### ‏Failure Mode 4 — Restart resets risk

‏תיקון:

```text
durable risk state + startup reconciliation
```

### ‏Failure Mode 5 — Duplicate exposure

‏תיקון:

```text
intent/order idempotency + symbol exposure check + broker reconciliation
```

### ‏Failure Mode 6 — Liquidity blind sizing

‏תיקון:

```text
size relative to executable liquidity + time-to-flat
```

### ‏Failure Mode 7 — Confidence over-sizing

‏תיקון:

```text
no confidence sizing without calibrated outcome distribution
```

### ‏Failure Mode 8 — Risk rule spaghetti

‏תיקון:

```text
few hard invariants + small number of evidence-backed soft controls
```

### ‏Failure Mode 9 — Loss limit without RCA

‏תיקון:

```text
safety stop triggers diagnostics before recovery
```

### ‏Failure Mode 10 — No recovery contract

‏תיקון:

```text
state transition + explicit recovery criteria + hysteresis
```

### ‏Failure Mode 11 — Model win hides Risk failure

‏Trade מרוויח למרות Size כפול בטעות.

‏תיקון:

```text
process correctness is measured independently of PnL
```

### ‏Failure Mode 12 — Near misses discarded

‏תיקון:

```text
blocked duplicate / stale-data reject / mismatch detection are logged as safety evidence
```

---

## ‏15. User-Specific Application

‏למערכת שלנו — broad U.S. universe, short-horizon momentum, small expected edge, fast capital recycling — ההמלצה המחקרית היא:

```text
broad scanner
→ Trade Candidate
→ Cost / Executability check
→ Risk Engine
→ simple research quantity
→ clamp by liquidity / risk / strategy / account limits
→ approved quantity or zero
→ Entry Execution
→ immediate position-priority monitoring
→ Exit / Flat
→ realized risk + cost attribution
```

‏הדגש אצלנו:

1. ‏לא להגדיל Size כדי לפצות על Edge קטן.
2. ‏לא לתת ל־Rank #1 לקבוע Exposure.
3. ‏לשמור One-position baseline עד שיש Evidence ל־Top-N.
4. ‏למדוד Size ביחס ליכולת לצאת, לא רק ליכולת להיכנס.
5. ‏לספור Pending/Unknown Orders כ־Exposure.
6. ‏לתת Position/Order monitoring עדיפות על global scanning תחת עומס.
7. ‏לעבוד עם Risk State durable ו־reconciliation לפני Entry חדש.
8. ‏להשתמש ב־Actual Fills, Slippage ו־Time-to-Flat כדי לכייל את ה־Risk model.
9. ‏לא לבחור מספרי Live מתוך Backtest בלבד.
10. ‏לשמור Hard Limits דטרמיניסטיים גם אם בעתיד נוספים models מתקדמים.

---

## ‏16. Concrete Baseline Contract

### ‏Risk Input

```text
RiskIntentInput
---------------
intent_id
symbol_id
requested_qty
requested_notional
reference_price
expected_net_edge
expected_entry_cost
expected_exit_cost
expected_adverse_move
expected_time_to_flat
quote_age
liquidity_state
account_state
broker_state
filled_positions
working_orders
pending_orders
unknown_orders
risk_state
risk_config_version
```

### ‏Risk Output

```text
RiskDecision
------------
approved: true/false
approved_qty
approved_notional
planned_risk
stress_risk
limiting_constraint
reason_codes
risk_state
risk_snapshot_id
risk_model_version
decision_time
```

### ‏Sizing

```text
quantity_by_capital
quantity_by_trade_risk
quantity_by_liquidity
quantity_by_execution_cost
quantity_by_strategy_limit
quantity_by_account_limit

final_quantity = min(all quantities)
```

### ‏Hard Pre-Trade Conditions

```text
risk_state allows new entries
broker/account state known
position/open-order state known
market data sufficiently fresh
no unresolved duplicate intent
no unresolved unknown order
symbol exposure within limits
pending + filled exposure within limits
order rate within limits
approved_qty > 0
```

‏אחרת:

```text
RISK_REJECT
```

### ‏Risk State Transition Skeleton

```text
NORMAL
  → REDUCED_SIZE
  → PAUSED
  → EXIT_ONLY
  → LOCKED
```

‏Transitions חייבות להיות:

```text
explicit
versioned
auditable
tested
recoverable by policy
```

### ‏Startup Contract

```text
load durable risk state
→ fetch broker truth
→ reconcile positions/orders/executions/account
→ resolve mismatch
→ verify data/system health
→ restore risk state
→ only then allow new entries
```

---

## ‏17. Confidence

| Recommendation | Confidence |
|---|---:|
| ‏Risk Engine עצמאי מה־Scanner | High |
| ‏Fail closed על unknown/stale critical state | High |
| ‏Working/Pending exposure נספר ב־Risk | High |
| ‏Durable Risk State + startup reconciliation | High |
| ‏Min-of-constraints sizing pattern | High |
| ‏Fixed/simple research size לפני Dynamic Sizing | High |
| ‏Liquidity cap / exit-capacity awareness | High |
| ‏One-position research baseline | Medium |
| ‏Loss Velocity control | Medium |
| ‏Short-horizon volatility sizing | Medium/Low until tested |
| ‏Confidence-based sizing | Low until calibrated |
| ‏Kelly/Fractional Kelly for this system now | Very Low / Avoid |

---

## ‏18. Time-Sensitive Facts

‏המקטע הזה אינו מקבע מספרי Margin, Buying Power, Minimum Order, Fractional Share support, account eligibility או broker-specific risk capability.

‏כל פרט כזה תלוי ב־:

```text
broker
account entity
account type
permissions
product
jurisdiction
API
pricing / margin schedule
current rules
```

‏ולכן חייב re-verification בזמן implementation.

‏Hard Risk Architecture עצמה אינה צריכה להיות תלויה ב־מספר זמני מסוים.

---

## ‏19. Current Verification Snapshot

‏לא נדרש Web verification חדש כדי לקבע את ה־Baseline של מקטע 19, מפני שההמלצות המרכזיות הן ארכיטקטוניות ומתודולוגיות ואינן תלויות ב־Broker capability עכשווית.

‏לפני כל שימוש תפעולי עתידי יש לאמת בנפרד:

```text
account eligibility
buying-power semantics
margin/cash restrictions
fractional-share support
minimum order constraints
broker risk/order controls
reconnect / order-state behavior
```

‏אין להסיק מהמסמך מספרי Live limits או הרשאות חשבון.

---

## ‏20. Relationship to Later Sheets

- ‏`20` — Backtest מהיסוד: Risk/Sizing חייבים להיות חלק מה־timeline ולא post-processing.
- ‏`21` — realistic seconds backtest: slippage, partial fills ו־latency משנים risk בפועל.
- ‏`22` — predictive validation: מפרידים Signal quality מ־Risk outcome.
- ‏`23` — overfitting/leakage: Sizing parameters הם Hyperparameters מסוכנים.
- ‏`24` — experiments: כל שינוי Sizing עובר one-change-at-a-time/Ablation.
- ‏`25` — Regime: dynamic risk רק לאחר Evidence.
- ‏`26` — RCA: attribution של Model/Execution/Risk/Operational loss.
- ‏`27/28` — Replay/Shadow: promotion gates ל־Risk Engine.
- ‏`33/34/36` — Production state, recovery, kill switches: הרחבה ישירה של ה־Risk State Machine.
- ‏`43` — Halts/Fast Markets: tail-risk states.
- ‏`47` — Price Impact/Capacity: capacity curve ו־size degradation.
- ‏`64` — checklist before real-money: final risk-readiness gate.

---

## ‏21. Acceptance Tests

### ‏A. Hard size cap

```text
requested_qty > hard allowed qty
=> approved_qty <= hard allowed qty
```

### ‏B. Zero is valid

```text
one limiting constraint returns zero
=> approved_qty = 0
=> RISK_REJECT
```

### ‏C. Stale data

```text
critical market state stale
=> no new exposure
```

### ‏D. Unknown order

```text
existing order state = UNKNOWN
=> new entry rejected until reconciliation
```

### ‏E. Cancel pending

```text
cancel requested but not confirmed
=> potential exposure still counted
```

### ‏F. Partial fill

```text
partial fill occurs
=> actual exposure updated immediately
=> remaining requested exposure re-evaluated
```

### ‏G. Duplicate intent

```text
same intent submitted twice
=> second exposure blocked/idempotent
```

### ‏H. Restart

```text
risk state PAUSED before restart
=> restart does not silently restore NORMAL
```

### ‏I. Daily risk trigger

```text
hard daily budget exceeded
=> no new entries
=> diagnostic event persisted
```

### ‏J. Risk monotonicity

```text
all else equal,
increasing requested quantity
must not reduce calculated risk
```

### ‏K. Locked invariant

```text
risk_state = LOCKED
=> no new entry can be approved
```

### ‏L. Exposure truth

```text
filled position + working order + pending order
=> total potential exposure includes all three
```

### ‏M. Replay determinism

```text
same state + same intent + same risk config
=> same risk decision
```

---

## ‏22. Recommendation Summary

### ‏Baseline

```text
Research / Replay / Shadow
→ simple fixed research size
→ independent deterministic Risk Engine
→ min-of-constraints sizing
→ liquidity / exit-capacity awareness
→ hard exposure/order/data/state limits
→ durable Risk State
→ broker reconciliation
→ full risk decision logging
```

### ‏Preferred Default

```text
Risk Engine may only reduce or reject exposure.
Rank/Score cannot override risk.
Unknown critical state fails closed.
Working and pending orders count as exposure.
```

### ‏Challengers

```text
Loss Velocity
Liquidity-based sizing
Short-horizon volatility adjustment
Drawdown/giveback controls
Multi-position allocation
```

### ‏Advanced / Evidence Only

```text
confidence sizing
regime-specific sizing
portfolio optimization
Kelly / Fractional Kelly
learned risk models
```

### ‏Core Principle

```text
Good opportunity
AND
acceptable, known, controllable exposure
=> eligible to continue

otherwise
=> NO TRADE / PAUSE / EXIT-ONLY according to risk state
```

‏היעד של Risk Management אינו למנוע כל הפסד. היעד הוא לוודא ש־Signal שגוי, רצף רע, Execution חריג, state mismatch או Bug אינם מקבלים הרשאה להפוך לנזק בלתי מבוקר — ושכל החלטת Size ניתנת לשחזור ולהסבר.