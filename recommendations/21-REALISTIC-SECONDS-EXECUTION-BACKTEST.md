# ‏21 — Recommendation Sheet: Realistic Seconds Execution Backtest

> ‏מקור לימודי עיקרי: `../21-REALISTIC-SECONDS-EXECUTION-BACKTEST.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline ריאליסטי אך עדיין פשוט ל־`Execution Backtest` של אסטרטגיית `Short-Horizon Momentum`, כך שהמחקר לא מניח מחירי קסם, Fill מיידי, Cancel מיידי או נזילות שלא הייתה קיימת; ובו בזמן לא בונים מוקדם מדי Exchange Simulator מלא שאין עדיין Evidence שהוא נחוץ.
>
> ‏המקטע ממשיך את 20: ‏20 הוכיח שה־Timeline וה־Research חוקיים; ‏21 בודק האם ה־Signal וה־Trade Decision היו **Executable בפועל תחת מודל סביר**.

---

## ‏1. Decision

‏השאלה המרכזית היא:

```text
Given a valid signal at T0,
what order could actually have been sent,
when could it have reached the market,
what liquidity was available then,
what quantity could have filled,
at what price,
how long did exposure remain,
and what net result was economically executable?
```

‏לכן השרשרת המחייבת היא:

```text
Signal
→ Decision
→ Signal-to-Order Delay
→ Pre-Submit Recheck
→ Order Intent
→ Submit / Arrival
→ Market State at Arrival
→ Fill / Partial Fill / No Fill
→ Position State
→ Exit Decision
→ Exit Execution
→ Costs
→ Net Result
→ Execution Attribution
```

‏ה־Backtest אינו רשאי לדלג ישירות מ־`Signal` ל־`Entry Price`.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: `Last` אינו Fill Model

‏אין להשתמש ב־`Last` כברירת המחדל למחיר קנייה או מכירה.

‏ל־Long aggressive execution:

```text
buy side  → Ask / available sell liquidity
sell side → Bid / available buy liquidity
```

‏נשמור שלוש שכבות מחיר נפרדות:

```text
reference_price
executable_price
simulated_fill_price
```

‏לדוגמה:

```text
reference = mid
executable = ask
simulated_fill = ask + modeled_slippage
```

‏כך ניתן לפרק ב־RCA איפה נוצר הפער.

### ‏`P0 — Required`: מחיר נבדק בזמן Arrival, לא בזמן Signal בלבד

‏ה־Signal יכול להיווצר ב־`T0`, אבל Order יכולה להגיע רק ב־`T1`.

‏לכן:

```text
market_state_used_for_execution = state_at_or_before(order_arrival_time)
```

‏לא:

```text
state_at_signal_time
```

‏אם ה־Quote השתנה לפני Arrival — ה־Execution Backtest חייב לראות זאת.

### ‏`P0 — Required`: Timing Contract מלא לביצוע

‏נשמור לפחות:

```text
signal_time
decision_time
order_created_time
submit_time
arrival_time
ack_time
first_fill_time
last_fill_time
cancel_requested_time
cancel_confirmed_time
exit_decision_time
exit_submit_time
exit_arrival_time
flat_time
```

‏אם Dataset אינו מסוגל לתמוך ברזולוציה מסוימת, מסמנים את המגבלה ולא ממציאים Precision.

### ‏`P1 — Preferred Default`: Baseline Fidelity Ladder

‏ה־Baseline יתפתח בסדר הזה:

```text
F0 — Signal only
F1 — Quote aware
F2 — Latency aware
F3 — Slippage aware
F4 — Depth aware
F5 — Partial-fill aware
F6 — Queue aware
F7 — Live calibrated
```

‏המלצה למערכת שלנו:

```text
Research baseline for execution = F3/F5 range
```

‏כלומר כבר לכלול:

- ‏`Bid/Ask`.
- ‏Signal-to-order latency.
- ‏Order-to-fill latency.
- ‏Slippage model.
- ‏Order TTL.
- ‏Max chase.
- ‏Partial fills כאשר הנתונים מאפשרים.
- ‏Basic top-of-book size constraints כאשר זמינים.
- ‏Entry/Exit Costs.
- ‏Pre-submit / pre-fill recheck.

‏Queue מלא אינו תנאי לפתיחת מחקר execution.

### ‏`P1 — Preferred Default`: `Marketable Limit` כ־Aggressive Baseline

‏למחקר aggressive entry, ברירת המחדל המועדפת היא:

```text
marketable limit
+
explicit max price
```

‏ולא `Market` ללא תקרה.

‏הסימולטור חייב לבדוק:

```text
arrival price
available liquidity
limit cap
filled quantity
remaining quantity
```

‏כך גם המודל aggressive מכבד `max_entry_price`.

### ‏`P0 — Required`: Pre-Submit / Arrival Recheck

‏ב־`T1`, ממש לפני execution, בודקים מחדש:

```text
signal still valid?
signal age <= TTL?
rank / score still acceptable?
quote fresh?
spread acceptable?
price within max-entry drift?
liquidity sufficient enough?
expected executable net edge still positive enough?
risk gate still open?
```

‏אם לא:

```text
ABORT / NO ORDER
```

‏ה־Backtest אינו רשאי לקנות Candidate רק משום שהייתה טובה ב־`T0`.

### ‏`P0 — Required`: `Touch != Fill` לפקודת Passive Limit

‏Baseline מחקרי לפקודה Passive אינו רשאי לומר:

```text
price touched my limit → filled
```

‏זה מודל `Q0` אופטימי בלבד.

‏מדרג אפשרי:

```text
Q0 — touch = fill                    [optimistic diagnostic only]
Q1 — trade-through requirement       [conservative simple model]
Q2 — volume-ahead approximation
Q3 — L2 queue approximation
Q4 — order-level replay if available
```

‏ברירת המחדל הראשונית עבור Passive research צריכה להיות לפחות `Q1` או מודל שמרני שקול, עד שיש Data שמצדיק `Q2+`.

### ‏`P0 — Required`: Partial Fill הוא Position אמיתי

‏אם:

```text
requested_qty = 100
filled_qty = 37
```

‏המערכת נמצאת עם:

```text
position_qty = 37
```

‏ולא עם 0 ולא עם 100.

‏מכאן כל Risk/Exit/Cost/Capital logic משתמש ב־Actual Filled Quantity.

### ‏`P0 — Required`: Fill Ledger הוא מקור האמת לפוזיציה

‏לכל Fill נשמור:

```text
order_id
fill_id
fill_time
fill_price
fill_qty
side
venue_if_known
fee_if_known
liquidity_flag_if_known
execution_confidence
position_after_fill
```

‏ה־Position מחושבת מ־Confirmed/Simulated Fill Events בלבד.

### ‏`P0 — Required`: Cancel אינו מיידי

‏נייצג לפחות:

```text
ACTIVE
CANCEL_REQUESTED
CANCEL_CONFIRMED
```

‏בחלון שבין בקשת הביטול לאישור הביטול עדיין יכול להגיע Fill.

‏לכן:

```text
cancel_requested != order_dead
```

### ‏`P0 — Required`: Cancel Race נתמך במפורש

‏הסימולטור חייב לתמוך ב־:

```text
partial fill
→ cancel request
→ another fill
→ cancel confirmed
```

‏ולעדכן Position לפי האירועים בפועל, לא לפי Intent.

### ‏`P1 — Preferred Default`: Order Lifetime / TTL מפורש

‏לכל Order:

```text
created_at
active_from
expires_at
cancel_policy
max_reprices
max_entry_drift
```

‏Order ישנה אינה נשארת פעילה לנצח רק כדי להשיג Fill בדיעבד.

### ‏`P1 — Preferred Default`: `Max Chase` קשיח

‏נגדיר גבולות כגון:

```text
max_entry_drift
max_number_of_reprices
max_order_age
```

‏הערכים עצמם נקבעים רק ממחקר.

‏כאשר הגבול נפרץ:

```text
cancel / abort
```

‏ולא “לרדוף עוד קצת כי בדיעבד המחיר המשיך”.

### ‏`P1 — Preferred Default`: Entry ו־Exit מקבלים אותה רמת Fidelity

‏אסור לבצע:

```text
realistic entry + convenient exit
```

‏או להפך.

‏אותם עקרונות של:

```text
arrival time
fresh quote
side-aware price
slippage
partial fills
cancel latency
fees
```

‏חלים גם ביציאה.

### ‏`P0 — Required`: `Time-to-Flat` הוא Result ראשון במעלה

‏Exit Decision אינו סוף החשיפה.

‏נמדוד:

```text
exit_decision_time → final_flat_time
```

‏ובמקביל:

```text
remaining_position_over_time
```

‏במיוחד ב־Partial Exit.

### ‏`P1 — Preferred Default`: `Executable MFE / MAE`

‏בנוסף ל־price-path MFE/MAE נשמור:

```text
executable_mfe
executable_mae
```

‏לפי מחיר יציאה צד־נכון וסביר תחת מודל ה־Execution.

‏כך לא נמדוד “רווח” שאי אפשר היה לנעול.

### ‏`P1 — Preferred Default`: `Time to First Executable Net Profit`

‏מדד מרכזי עבור השיטה שלנו:

```text
time_to_first_executable_net_profit
```

‏כלומר הזמן הראשון שבו יציאה סבירה לפי המודל הייתה מכסה:

```text
entry friction
+
exit friction
+
explicit costs
```

‏זה עדיף על `time_to_positive_last_return`.

### ‏`P1 — Preferred Default`: Whole-Market Portfolio Event Loop

‏אין להריץ 4,000 Symbols כמערכות עצמאיות ואז לחבר תוצאות.

‏ה־Backtest צריך לנהל Event Loop אחד:

```text
Market Events
→ Canonical State
→ Incremental Features
→ Global Ranking
→ Decision
→ Orders
→ Fills
→ Positions
→ Risk / Buying Power
→ Exit
```

‏כך Capital, working orders ו־Rank אמיתי נשמרים עקביים.

### ‏`P0 — Required`: Working Orders ו־Reserved Capacity הם State

‏נשמור:

```text
cash
reserved_cash
working_orders
pending_orders
positions
available_capital
```

‏אסור שכל Signal יראה כאילו כל ההון פנוי.

### ‏`P1 — Preferred Default`: Execution Model כ־Adapter/Plugin

‏ה־Strategy Core לא צריך לדעת כיצד הסימולטור “ממלא” Orders.

‏ארכיטקטורה:

```text
Strategy / Decision Core
        ↓
OrderIntent
        ↓
ExecutionModel
        ↓
SimulatedBroker
        ↓
Order / Fill Events
```

‏כך אפשר להחליף:

```text
SimpleQuoteModel
DepthAwareModel
QueueAwareModel
LiveBrokerAdapter
```

‏בלי לשכתב את Alpha Logic.

### ‏`P1 — Preferred Default`: `SimulationClock`

‏Strategy אינה משתמשת ישירות ב־system wall clock.

‏נדרש Clock abstraction:

```text
IClock.Now
```

‏שב־Replay נשלט דטרמיניסטית על ידי Historical Event Stream.

### ‏`P0 — Required`: Data Fidelity Gate

‏Execution Fidelity חייבת להתאים ל־Data Resolution.

‏לדוגמה:

```text
10-second snapshots
```

‏אינם בסיס אמין לטעון:

```text
100ms fill precision
```

‏לכל Run נשמור:

```text
data_resolution
timestamp_resolution
quote_coverage
trade_coverage
depth_coverage
feed_scope
```

‏וטענת המחקר תוגבל בהתאם.

### ‏`P0 — Required`: Missing / Stale / Gap Data אינם Fill Opportunity

‏לפני Fill simulation נדרש Data Integrity Gate:

```text
quote exists
quote fresh enough
spread valid
sizes valid if model needs them
sequence continuity acceptable if available
no unresolved feed gap
market state tradable
```

‏אם אי אפשר לדעת:

```text
AMBIGUOUS / INVALID
```

‏ולא Fill נוח.

### ‏`P0 — Required`: Feed Scope מפורש

‏אם Quote מגיע מ־Feed חלקי או Venue יחיד:

```text
feed_scope != guaranteed full-market executable state
```

‏ה־Run חייב לתעד את מגבלת ה־Coverage.

### ‏`P1 — Preferred Default`: Best / Base / Stress בכל גרסת Execution

‏לכל Fidelity משמעותית נריץ לפחות:

```text
BEST
BASE
STRESS
```

‏המספרים אינם מומצאים; הם אמורים להגיע בהמשך מ־Paper/Shadow/Live measurements.

‏אם ה־Strategy עובדת רק ב־BEST:

```text
confidence = low
```

### ‏`P1 — Preferred Default`: Empirical Latency Distribution במקום Constant יחיד

‏Baseline ראשון יכול להתחיל ב־Fixed latency מפורש.

‏אבל Promotion צריך לעבור ל־Distribution:

```text
P50
P90
P95
P99
```

‏ולכל הפחות להפריד:

```text
signal_to_order
order_to_fill
exit_decision_to_flat
```

### ‏`P2 — Challenger`: Regime-dependent Latency

‏Latency עשויה להחמיר דווקא בזמן Market Burst.

‏לכן Challenger עתידי:

```text
latency_distribution(conditioned_on_regime)
```

‏למשל לפי:

```text
quote update rate
trade rate
market volatility
system load
```

### ‏`P1 — Preferred Default`: Slippage Ladder

‏נשתמש במדרג מפורש:

```text
S0 — zero slippage          [diagnostic only]
S1 — fixed slippage
S2 — spread-aware
S3 — size/depth-aware
S4 — empirical/live-calibrated
```

‏השוואה בין הרמות עוזרת לזהות היכן ה־Edge נשחק.

### ‏`P2 — Challenger`: Depth-aware Sweep

‏כאשר `L2`/depth אמין זמין, aggressive execution יכול לצרוך כמה רמות:

```text
fill_vwap = sum(price_i * qty_i) / sum(qty_i)
```

‏אם אין Depth מעבר ל־L1, אסור להמציא את הרמות הבאות.

‏אפשר במקום זאת:

- ‏להגביל Quantity.
- ‏להפעיל conservative slippage.
- ‏לסמן low-confidence.
- ‏להריץ range של assumptions.

### ‏`P2 — Challenger`: Volume-Ahead Passive Model

‏כאשר Passive execution הופכת חשובה, אפשר לשמור:

```text
estimated_queue_ahead
executed_volume_at_price
estimated_cancellations_ahead
```

‏אבל כל cancellation assumption חייב להיות מפורש; איננו יודעים בהכרח אם liquidity שנעלמה הייתה לפנינו או מאחורינו.

### ‏`P3 — Advanced`: Queue-aware / L2 Replay

‏Queue-aware replay מוצדק רק אם:

1. ‏ה־Signal שורד `Bid/Ask + latency + costs`.
2. ‏ה־Strategy תלויה משמעותית ב־Passive fills.
3. ‏יש Data שמספיק כדי לשפר את המודל באמת.
4. ‏מודל Queue מורכב משנה את החלטת המחקר לעומת מודל פשוט שמרני.

‏אחרת זו מורכבות יקרה ללא ערך מוכח.

### ‏`P3 — Advanced`: Probabilistic Fill Model

‏אם Queue/Fill מודל הסתברותי:

```text
random_seed
```

‏נשמר בכל Run.

‏נריץ מספר Seeds וננתח Distribution של:

```text
net pnl
fill rate
drawdown
time to flat
```

‏Randomness אינה תחליף להבנת המנגנון.

### ‏`P2 — Challenger`: Execution Mode comparison

‏אותם Signals יורצו מול:

```text
PASSIVE
BALANCED
AGGRESSIVE
```

‏ונשווה לפחות:

```text
fill_rate
net_ev
entry_slippage
exit_slippage
markout
missed_opportunity
time_to_flat
```

‏המטרה אינה Fill Rate מרבי אלא `Executable Net Edge`.

### ‏`P2 — Challenger`: Counterfactual Execution

‏לאותו `signal_id` אפשר להריץ מספר Policies:

```text
Passive Limit
Marketable Limit
IOC-like immediate-only model
Aggressive capped model
```

‏כך משפרים Execution בלי לשנות Scanner באותו ניסוי.

### ‏`P1 — Preferred Default`: Markout אחרי Fill

‏נשמור Markout ב־horizons קצרים, למשל:

```text
100ms
500ms
1s
5s
```

‏ל־Long אפשר להשתמש בהגדרה עקבית כגון:

```text
future_mid - fill_price
```

‏או normalized bps equivalent.

‏Fill Rate גבוה עם Markout רע עשוי להעיד על `Adverse Selection`.

### ‏`P1 — Preferred Default`: Missed Trade נשמר

‏`No Fill` אינו Event שנמחק.

‏נשמור:

```text
signal_id
order_intent
no_fill_reason
future_path
counterfactual_aggressive_outcome
```

‏כך ניתן להשוות:

```text
passive price improvement
vs
missed opportunity
```

### ‏`P0 — Required`: Position Birth Time לפי Fills

‏נשמור:

```text
first_fill_time
full_fill_time
quantity_weighted_fill_time
```

‏ולא נניח שה־Position נולדה בזמן ה־Signal.

### ‏`P0 — Required`: Exit Quantity נגזרת מה־Actual Position

‏אם Entry התמלאה ב־63 מתוך 100:

```text
exit_target_qty = 63
```

‏לא 100.

‏כל Cost Basis ו־Break-Even מתעדכנים לפי Fill Ledger.

### ‏`P1 — Preferred Default`: Rank / Score / Edge Decay עד Fill

‏מדדים מרכזיים לשיטה שלנו:

```text
rank_at_signal
rank_at_submit
rank_at_fill

score_at_signal
score_at_submit
score_at_fill

edge_at_signal
edge_at_submit
edge_at_fill
```

‏אם Candidate היא #1 בסריקה אך כבר #50 בזמן Fill, זו עדות חזקה ל־Execution Delay / Signal Decay.

### ‏`P1 — Preferred Default`: Abort Working Order כאשר Signal מת

‏אם Order עדיין לא התמלאה וה־Signal הפך לא תקף:

```text
cancel remaining quantity
```

‏אם כבר יש Partial Fill:

```text
cancel remaining
manage actual position
```

‏ה־Backtest חייב להפריד בין Remaining Intent לבין Existing Exposure.

### ‏`P1 — Preferred Default`: `Execution Tax`

‏נחשב:

```text
execution_tax = theoretical_signal_edge - executable_edge
```

‏ונפרק אותו ככל האפשר ל־:

```text
decision_to_submit_drift
submit_to_fill_drift
spread
slippage
market_impact
fees
missed_quantity
```

‏זה מאפשר לדעת האם הבעיה היא Signal או Implementation.

### ‏`P1 — Preferred Default`: Break-even Sensitivity

‏נמדוד:

```text
latency_break_even
slippage_break_even
fill_rate_break_even
```

‏וכן Surface כגון:

```text
latency × slippage × fill_rate
```

‏המטרה היא למצוא `Robust Region`, לא נקודת assumptions מושלמת אחת.

### ‏`P2 — Challenger`: Capacity Curve

‏נריץ את אותו מודל במספר גדלי Position מחקריים ונמדוד:

```text
order_size
→ fill_rate
→ slippage
→ time_to_flat
→ executable_net_edge
```

‏כך `Capacity` נמדדת ולא מונחת.

### ‏`P1 — Preferred Default`: Wide Replay + Deep Execution

‏למערכת של אלפי Symbols:

```text
Wide replay
→ all symbols, lightweight state sufficient for ranking

Deep execution
→ Top candidates / working orders / positions only
```

‏אבל Global Ranking נשאר Whole-Market; אסור לצמצם את השוק לפני שהדירוג שדורש את כל השוק הושלם.

---

## ‏3. Why

‏במסחר של שניות, Gross edge קטן יכול להימחק בגלל:

```text
spread
latency
entry drift
slippage
partial fill
queue delay
exit friction
fees
```

‏Signal Backtest יכול להוכיח ש־#1 נוטה לעלות לאחר הבחירה, ועדיין Strategy אמיתית יכולה להיות לא ישימה אם רוב התנועה מתרחשת לפני Fill.

‏לכן נדרשת הפרדה בין:

```text
Prediction Truth
Execution Truth
Economic Truth
```

‏ה־Execution Backtest אינו מנסה לנחש כל Fill היסטורי במושלמות; הוא מנסה למנוע מסקנות מחקר שתלויות בהנחות בלתי־אפשריות.

---

## ‏4. Use When

‏ה־Baseline הזה מתאים כאשר:

- ‏כבר קיים `Signal Backtest` point-in-time תקין.
- ‏אנחנו רוצים לדעת אם ה־Signal יכול להפוך לעסקה ברת ביצוע.
- ‏ה־Holding Horizon הוא שניות עד עשרות שניות.
- ‏Spread/latency/fill timing הם חלק מהותי מה־Edge.
- ‏יש לפחות `Bid/Ask` היסטוריים ברזולוציה סבירה.
- ‏רוצים להשוות Passive/Aggressive policies בלי לשנות את ה־Scanner.
- ‏רוצים לכייל Backtest מול Paper/Shadow/Live observations בהמשך.

---

## ‏5. Do Not Use When

‏אין לפרש את המודל כ־Live-equivalent כאשר:

- ‏Data הוא 10-second snapshots אך המחקר טוען ל־100ms execution.
- ‏אין Quote data ובכל זאת מדמים spread/fills מדויקים.
- ‏Feed scope חלקי אך מוצג כ־NBBO מלא.
- ‏Limit fills מבוססים רק על touch.
- ‏אין distinction בין cancel-requested ל־cancel-confirmed.
- ‏Partial fills נמחקים.
- ‏Entry מציאותית אך Exit משתמשת ב־Last נוח.
- ‏Latency/Slippage נבחרו אחרי צפייה בתוצאות כדי “להציל” Strategy.

---

## ‏6. Alternatives

### ‏Alternative A — Signal-only

‏טוב לבדיקת Prediction לפני השקעה ב־Execution.

‏לא מספיק להסקת Live executability.

### ‏Alternative B — Quote-aware simple execution

‏`Bid/Ask + fixed latency + fixed/slight slippage`.

‏זהו Baseline טוב כאשר אין Depth עשיר.

### ‏Alternative C — Depth-aware execution

‏משתמש בכמויות ורמות מחיר כדי לדמות Sweep/partial fills.

‏דורש Data מתאים.

### ‏Alternative D — Queue-aware passive replay

‏מתאים כאשר Passive Fill הוא מרכז האסטרטגיה.

‏יקר, רגיש להנחות ודורש validation קפדני.

### ‏Alternative E — Live-calibrated stochastic execution

‏מודל הסתברותי שמכויל מ־Paper/Shadow/Live observations.

‏מתאים רק לאחר שיש Dataset calibration אמיתי.

---

## ‏7. Trade-offs

| בחירה | יתרון | חיסרון |
|---|---|---|
| `Quote-aware simple` | ‏קל, שקוף, מהיר | ‏אינו מכיר Queue/Depth מלא |
| Fixed latency | ‏Reproducible ופשוט | ‏מתעלם מ־Jitter/Regime |
| Empirical latency | ‏מציאותי יותר | ‏דורש measurements |
| Marketable limit baseline | ‏ברור ומוגבל במחיר | ‏עדיין תלוי Depth/arrival state |
| Conservative passive | ‏פחות optimistic bias | ‏יכול להמעיט Fills אמיתיים |
| Queue-aware | ‏Fidelity גבוהה יותר | ‏Data/complexity/model-risk גבוהים |
| Deterministic fills | ‏RCA קל | ‏לא מייצג uncertainty מלאה |
| Probabilistic fills | ‏מייצג uncertainty | ‏דורש Calibration ומספר Seeds |

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל מ־:

- ‏Exchange matching engine מלא.
- ‏Venue-by-venue routing simulation לכל 4,000 Symbols.
- ‏Microsecond timing כאשר התשתית וה־Data אינם תומכים בו.
- ‏Hidden-liquidity inference.
- ‏מודל Queue מורכב ללא Paper/Live calibration.
- ‏Dynamic execution policy עם עשרות Parameters.
- ‏`Touch = Fill` כ־Base Case.
- ‏`Mid = Fill` כ־Base Case.
- ‏Zero latency.
- ‏Zero costs.
- ‏Infinite chase.
- ‏Instant cancel.
- ‏Full fill או no-trade בלבד תוך מחיקת partial fills.

---

## ‏9. What to Add Later

‏לאחר שה־Baseline שורד:

1. ‏Empirical latency distributions.
2. ‏Depth-aware sweeps.
3. ‏Regime-specific slippage.
4. ‏Passive fill probability.
5. ‏Volume-ahead queue model.
6. ‏L2 replay.
7. ‏Venue-aware behavior כאשר Evidence מצדיק.
8. ‏Paper/Shadow calibration.
9. ‏Execution drift monitoring.
10. ‏Probabilistic/Monte-Carlo execution uncertainty.
11. ‏Dynamic urgency policy.
12. ‏Capacity curves לפי Position size.

---

## ‏10. Required Data / Evidence

‏Baseline צריך ככל האפשר:

```text
bid
ask
bid_size
ask_size
quote timestamp
trade timestamp
last / trade price
trade size
market/session status
feed/source metadata
```

‏ולמודלים מתקדמים:

```text
L2 depth
sequence numbers
trade conditions
quote conditions
venue metadata
received_time
live order/fill telemetry
```

‏בנוסף נדרש:

```text
strategy version
execution policy version
execution model version
cost model version
risk model version
config hash
data fingerprint
random seed when applicable
```

---

## ‏11. Promotion Criteria

### ‏מ־F1/F2 ל־F3/F5

‏נעלה Fidelity אם:

- ‏Signal edge עדיין קיים אחרי side-aware pricing.
- ‏תוצאות רגישות באופן מהותי ל־latency/slippage.
- ‏Partial fills או Top-of-Book size יכולים לשנות Net result.
- ‏Data הקיים מסוגל לתמוך בשכבה הבאה.

### ‏מ־simple conservative ל־Depth-aware

‏רק אם:

- ‏Order Size לעיתים משמעותי ביחס ל־Top-of-Book.
- ‏החלטת Strategy משתנה לפי Size/Depth.
- ‏L2/Depth history אמין זמין.
- ‏מודל פשוט מציג uncertainty שלא ניתן לפתור אחרת.

### ‏מ־Depth-aware ל־Queue-aware

‏רק אם:

- ‏Passive execution מהותי ל־Net EV.
- ‏Fill uncertainty היא driver מרכזי של המסקנה.
- ‏יש Data טוב מספיק.
- ‏Queue model מוסיף predictive/calibration value מעבר למודל הפשוט.

### ‏מ־Simulation ל־Live-calibrated

‏רק לאחר שיש:

```text
observed fills
observed slippage
observed latency
observed partial fills
observed cancel races
observed markouts
```

‏מ־Paper/Shadow/Live environment רלוונטי.

---

## ‏12. Rejection Criteria

‏לא נקדם Strategy/Execution Policy אם:

- ‏ה־Edge נעלם כבר ב־`Bid/Ask + basic latency + costs`.
- ‏Profitability תלויה ב־`Touch = Fill`.
- ‏Profitability תלויה ב־zero latency או perfect fills.
- ‏Net EV שלילי ברוב assumptions הסבירות.
- ‏Break-even latency/slippage קטן מהתנודות הטבעיות שנמדדות.
- ‏רוב הרווח מגיע מ־fills שהמודל מסווג `AMBIGUOUS`.
- ‏Execution Model אינו deterministic/reproducible כאשר הוא אמור להיות כזה.
- ‏Accounting/Fills אינם reconcile.
- ‏Data resolution נמוכה מדי כדי לתמוך בטענת ה־Fidelity.
- ‏Sim-to-Live/Paper gap גדול ואינו מוסבר.

---

## ‏13. Metrics

### ‏Core execution metrics

```text
signal_count
trade_decisions
orders_submitted
orders_filled
partial_fill_count
no_fill_count
fill_rate
fill_ratio_by_quantity
cancel_rate
replace_rate
```

### ‏Latency

```text
signal_to_order_ms
order_to_first_fill_ms
order_to_full_or_terminal_ms
exit_decision_to_flat_ms
P50 / P90 / P95 / P99
```

### ‏Price / Cost

```text
entry_drift_bps
entry_slippage_bps
exit_slippage_bps
spread_paid_bps
implementation_shortfall_bps
explicit_cost_bps
execution_tax_bps
```

### ‏Post-fill quality

```text
markout_100ms
markout_500ms
markout_1s
markout_5s
```

### ‏Opportunity / Selection

```text
missed_opportunity_bps
rank_at_signal
rank_at_submit
rank_at_fill
score_at_signal
score_at_submit
score_at_fill
edge_at_signal
edge_at_submit
edge_at_fill
```

### ‏Executable outcome

```text
executable_mfe
executable_mae
time_to_first_executable_net_profit
time_to_executable_target
time_to_flat
net_pnl
net_ev
```

### ‏Robustness

```text
latency_break_even
slippage_break_even
fill_rate_break_even
best/base/stress spread
capacity_curve
sim_to_live_gap
```

---

## ‏14. Failure Modes

### ‏1. Last-to-Last illusion

‏Signal נראה רווחי רק מפני שהמחקר משתמש ב־Last במקום בצד executable.

### ‏2. Signal-time price theft

‏ה־Order מקבלת Quote שהיה קיים לפני שהיא בכלל יכלה להגיע.

### ‏3. Touch-to-Fill bias

‏כל Passive Limit שנגעה במחיר נחשבת Filled.

### ‏4. Queue fantasy

‏המודל מניח Queue position מדויק שאין ב־Data.

### ‏5. Partial-fill deletion

‏עסקה חלקית נמחקת כאילו לא הייתה Position.

### ‏6. Instant cancel

‏Cancel request מוחק Order לפני confirmation ומפספס race fills.

### ‏7. Infinite chase

‏ה־Backtest תמיד “משיג” את השוק בדיעבד.

### ‏8. Exit asymmetry

‏Entry מדומה בצורה מציאותית אך Exit מקבלת מחיר נוח יותר.

### ‏9. Data-resolution overclaim

‏Snapshot איטי משמש לטענות execution ברזולוציה מהירה ממנו בהרבה.

### ‏10. Stale quote fill

‏Quote ישן ממשיך ליצור Fills.

### ‏11. Partial feed presented as full market

‏Venue/feed scope חלקי מוצג כאילו הוא כל הנזילות הזמינה.

### ‏12. Fill-rate optimization trap

‏מעלים Fill Rate במחיר של adverse selection/slippage ומכריזים “שיפור”.

### ‏13. Price-improvement trap

‏מודדים מחיר Fill בלבד ומתעלמים מכך שהזדמנויות רבות הוחמצו.

### ‏14. Execution overfitting

‏TTL/chase/latency assumptions מכוונים לנקודת Dataset ספציפית.

### ‏15. Accounting mismatch

‏Position/PnL/fees אינם נובעים מאותו Fill Ledger.

### ‏16. Signal/Execution blame confusion

‏משנים Score בגלל Fill גרוע, או Execution בגלל Signal שלא ניבא מלכתחילה.

### ‏17. Winner execution problem

‏Rank #1 היא דווקא המניה שנעה כל כך מהר שהמחיר שראינו כבר אינו בר־השגה.

### ‏18. Simulated certainty

‏הסימולטור מוצג כאמת במקום כמודל עם Error ו־Confidence.

---

## ‏15. User-Specific Application

‏למערכת שמחפשת כל הזמן את המניה שעולה הכי מהר מתוך אלפים, השרשרת החשובה היא:

```text
Rank #1 at signal
↓
How long until order can arrive?
↓
What is rank/score/edge then?
↓
What Ask/Bid and quantity exist then?
↓
What can actually fill within price cap?
↓
How much of the move is still left?
↓
Can exit remain executable after costs?
↓
What remains net?
```

‏ארבעת המדדים שהייתי שם בראש המחקר:

```text
edge_at_signal → edge_at_submit → edge_at_fill
rank_at_signal → rank_at_submit → rank_at_fill
time_to_first_executable_net_profit
execution_tax
```

‏אם ה־Scanner מנבא טוב אבל `edge_at_fill` כמעט אפס — הבעיה היא כנראה timing/execution, לא בהכרח Prediction.

‏אם גם Outcome מיד אחרי Signal חלש — אין הצדקה “לתקן” execution לפני שבודקים את Alpha.

---

## ‏16. Concrete Baseline Contract

‏ה־Baseline המחקרי המומלץ למקטע הזה:

```text
Whole-market historical canonical state
→ point-in-time ranking
→ selected candidate / NO TRADE
→ explicit signal-to-order latency
→ arrival-time execution recheck
→ fresh Bid/Ask
→ capped marketable-limit entry baseline
→ top-of-book quantity constraint when available
→ partial-fill capable state machine
→ short order TTL
→ max chase
→ cancel latency / cancel-pending state
→ position from fills only
→ same-fidelity exit simulation
→ explicit round-trip costs
→ net PnL
→ Best / Base / Stress
→ execution attribution
```

‏וה־Run מסומן לפחות:

```text
fidelity_level
execution_model_version
execution_policy_version
latency_model_version
slippage_model_version
cost_model_version
data_version
config_hash
```

---

## ‏17. State Machine

‏מומלץ ליישר את המחקר עם Production semantics:

```text
SCANNING
CANDIDATE
ENTERING
PARTIALLY_FILLED
POSITION
EXITING
PARTIALLY_EXITED
FLAT
RECOVERY
```

‏Order states נפרדים:

```text
CREATED
SUBMITTED
ACTIVE
PARTIALLY_FILLED
CANCEL_REQUESTED
CANCELED
FILLED
REJECTED
EXPIRED
UNKNOWN
```

‏המעברים נגזרים מאירועים, לא מ־wishful state.

---

## ‏18. Invariants

‏ה־Run נכשל אם אחד מאלה נשבר:

```text
fill_time >= order_arrival_time
filled_qty <= ordered_qty
position_qty == signed sum of fills
no position exists without fills
cancel-confirmed order cannot fill afterward
cancel-requested order may still fill until confirmation
remaining_qty >= 0
exit_qty cannot exceed current long position unless shorting explicitly enabled
fees reconcile to modeled fills
cash/exposure reconcile to fill ledger
no fill on invalid/stale market state under the selected model
no event from the future changes an earlier decision
```

‏Warnings אינם מספיקים ל־Invariant violation.

---

## ‏19. Golden Scenario Tests

### ‏Scenario A — Side-aware aggressive buy

```text
Bid = 99.99
Ask = 100.03
Buy marketable-limit cap = 100.04
Expected baseline fill reference = Ask side, not Last/Mid
```

### ‏Scenario B — Price moved before arrival

```text
Signal Ask = 50.01
Arrival Ask = 50.05
Max entry price = 50.03
Expected = ABORT / NO FILL
```

### ‏Scenario C — Passive touch

```text
Buy Limit = 100.00
Market touches 100.00 but does not satisfy conservative fill rule
Expected = NO FILL
```

### ‏Scenario D — Partial fill

```text
Requested 100
Executable quantity 40
Expected position after fill = 40
Remaining = 60
```

### ‏Scenario E — Cancel race

```text
partial fill
cancel request
second fill
cancel confirm
```

‏Expected Position כולל את שני ה־Fills.

### ‏Scenario F — Stale quote

```text
quote_age > allowed execution freshness
Expected = no new fill
```

### ‏Scenario G — Forced exit

```text
max hold reached
exit decision generated
flat occurs only after modeled exit latency/fills
```

### ‏Scenario H — Signal dies during partial entry

```text
100 requested
30 filled
signal invalidated
Expected: cancel remaining 70 + manage/exit 30
```

---

## ‏20. Calibration Loop

‏המסלול העתידי:

```text
Paper / Shadow / small-scale observed execution data
        ↓
measure latency / slippage / fill / markout distributions
        ↓
compare observed vs simulated
        ↓
Simulation Error / Sim-to-Live Gap
        ↓
new execution-model version
        ↓
re-run historical evidence
```

‏לא משנים Assumptions בדיעבד בתוך Run קיים.

‏כל Calibration יוצר Version חדש.

---

## ‏21. Execution Attribution

‏לכל Trade נרצה לפרק:

```text
predicted_signal_edge
selection_quality
signal_decay_before_submit
signal_decay_before_fill
spread_cost
entry_slippage
market_impact
partial_fill_effect
holding_move
exit_slippage
fees
missed_quantity
net_result
```

‏Failure category ראשית:

```text
SIGNAL_FAILURE
RANKING_FAILURE
DECISION_FAILURE
ENTRY_EXECUTION_FAILURE
EXIT_EXECUTION_FAILURE
COST_MODEL_ERROR
DATA_ERROR
SYSTEM_ERROR
NORMAL_MARKET_LOSS
```

‏כך RCA נשאר בשכבה הנכונה.

---

## ‏22. Confidence

| Recommendation | Confidence |
|---|---|
| ‏`Last` אינו Fill | `High` |
| ‏Execution price חייב להיבדק בזמן Arrival | `High` |
| ‏Partial fills חייבים להפוך Position state | `High` |
| ‏Cancel request אינו cancel confirmation | `High` |
| ‏Entry/Exit חייבים אותה Fidelity | `High` |
| ‏Fidelity Ladder במקום simulator מלא מהיום הראשון | `High` |
| ‏Marketable-limit baseline מתאים למחקר aggressive | `Medium-High` |
| ‏Trade-through עדיף על Touch כ־Passive baseline שמרני | `Medium` |
| ‏Depth-aware model יוסיף ערך משמעותי | `Unknown / Evidence required` |
| ‏Queue-aware model ישנה את החלטת Strategy | `Unknown / Evidence required` |
| ‏Dynamic execution לפי Score/Velocity ישפר Net EV | `Low / Unproven` |
| ‏Small size ייתן יתרון execution מובהק | `Hypothesis / must measure` |

---

## ‏23. Time-Sensitive Facts

‏ה־Baseline כאן מתודולוגי ואינו תלוי ב־Broker/Venue/API מסוים.

‏לפני שימוש תפעולי יש לאמת מחדש כל פרט תלוי־זמן לגבי:

```text
broker order semantics
supported order types
IOC / post-only / pegged behavior
routing behavior
market-data feed coverage
fee/rebate schedules
tick/price-increment rules
session behavior
```

‏לא נקבעו כאן capabilities חיצוניים חדשים שדורשים Web verification למקטע עצמו.

---

## ‏24. Relationship to Earlier Sheets

- ‏`03` — Bid/Ask/Spread הם Reality של Execution.
- ‏`04` — Order types ו־Execution tactics נותנים את Intent semantics.
- ‏`05` — Market-data provenance/freshness קובעים אם Fill Model בכלל חוקי.
- ‏`06` — Timing/latency contract הוא בסיס ל־Arrival simulation.
- ‏`11` — Liquidity/Executability קובעים Capacity ו־size-aware execution.
- ‏`15` — Candidate Gate קובע אם בכלל מנסים Trade.
- ‏`16` — Entry policy נותנת price cap, TTL, max chase ו־partial-fill behavior.
- ‏`17` — Exit policy מגדירה מתי ולמה מנסים להגיע ל־Flat.
- ‏`18` — Cost Engine הופך fills ל־Executable Net Edge.
- ‏`19` — Risk Engine מגביל Quantity/Exposure/unknown state.
- ‏`20` — Timeline Integrity ו־Signal Backtest נשארים התשתית המחקרית.

---

## ‏25. Relationship to Later Sheets

- ‏`22` — בודק האם ה־Scanner באמת מנבא, בנפרד מאיכות execution.
- ‏`23` — בודק Overfitting/Data Leakage גם ב־Signal וגם ב־Execution assumptions.
- ‏`24` — יאפשר A/B ואבלציה מסודרת של Execution Policies.
- ‏`27` — Replay יקרב Historical Events ל־Live-like state machine.
- ‏`28` — Paper/Shadow יספקו Calibration data.
- ‏`29–32` — Broker/Data adapters ו־provider mismatch.
- ‏`33–36` — Production states, recovery, observability ו־safety.
- ‏`37–41` — Advanced order tactics/queue/routing/algo execution.
- ‏`47` — Capacity/impact מחקר עמוק יותר.
- ‏`61–62` — Backtest/Live subtleties.

---

## ‏26. Promotion Path

```text
Signal-only evidence
↓
F1 Quote-aware
↓
F2 Latency-aware
↓
F3 Slippage-aware
↓
F5 Partial-fill-aware baseline
↓
Best/Base/Stress robustness
↓
Paper/Shadow calibration
↓
Depth-aware only if needed
↓
Queue-aware only if needed
↓
Live-calibrated execution model
```

‏בכל מעבר נשאל:

> ‏האם Fidelity החדשה משנה את החלטת המחקר מספיק כדי להצדיק את העלות והמורכבות?

---

## ‏27. Recommendation Summary

### ‏`P0`

- ‏`Last` אינו Fill.
- ‏Execution משתמש ב־arrival-time market state.
- ‏Timing contract מלא.
- ‏Point-in-time correctness נשמר.
- ‏Partial Fill הוא Position.
- ‏Position נגזרת מ־Fill Ledger בלבד.
- ‏Cancel request אינו confirmation.
- ‏Entry/Exit משתמשים באותה Fidelity.
- ‏Working orders/capital state נכללים במערכת.
- ‏Stale/invalid/gap data אינם Fill opportunity.
- ‏Data fidelity מגבילה את Research Claim.
- ‏Execution/Accounting invariants מפילים Run במקרה הפרה.

### ‏`P1`

- ‏Fidelity Ladder הדרגתי.
- ‏Marketable-limit aggressive baseline עם price cap.
- ‏Pre-submit/arrival recheck.
- ‏Order TTL + Max Chase.
- ‏Best/Base/Stress.
- ‏Latency distribution אחרי Baseline.
- ‏Markout ו־Missed Trade analysis.
- ‏Executable MFE/MAE.
- ‏Time-to-first-executable-net-profit.
- ‏Rank/Score/Edge decay עד Fill.
- ‏Wide Replay + Deep Execution.
- ‏Execution Tax + break-even sensitivity.

### ‏`P2`

- ‏Depth-aware sweep.
- ‏Volume-ahead passive model.
- ‏Regime-dependent latency/slippage.
- ‏Counterfactual execution policies.
- ‏Capacity curves.
- ‏Dynamic urgency רק לאחר validation.

### ‏`P3+`

- ‏Queue-aware L2 replay.
- ‏Order-level reconstruction.
- ‏Venue-specific execution simulation.
- ‏Probabilistic/live-calibrated fill models.

‏המסקנה המרכזית:

> ‏למסחר של שניות, Backtest אמין אינו שואל רק “לאן המחיר הלך אחרי הסיגנל?”. הוא שואל מה נשאר מה־Edge **כאשר הפקודה באמת יכולה להגיע, להתמלא חלקית או לא להתמלא, להישאר חשופה בזמן ביטול, ולצאת במחיר בר־ביצוע אחרי כל העלויות**.
