# ‏37 — Recommendation Sheet: Advanced Order Tactics

> ‏מקור לימודי עיקרי: `../37-ADVANCED-ORDER-TACTICS.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי ל־Execution Tactics כך שהמערכת לא תבחר Order Type לפי אינטואיציה, אלא תבחר ותנהל `ExecutionPlan` שמנסה לשמר כמה שיותר מה־edge עד ל־fill, תחת price protection, latency, fill probability, adverse selection, missed opportunity, partial fills ו־signal decay.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה לבצע מסחר בכסף אמיתי.

---

## ‏1. Decision

‏לא נבחר “Order Type הכי טוב”.

‏ה־Baseline הוא מודל מפורש:

```text
TradeIntent
→ Risk Approval
→ Safety Approval
→ Fresh Executable Market State
→ Remaining Edge Estimate
→ ExecutionPolicy
→ ExecutionPlan
→ Broker Adapter
→ Order / Fill Events
→ Execution Analytics
→ RCA / Experiment
```

‏שאלת ההחלטה אינה:

```text
Which order type is best?
```

‏אלא:

```text
Given this signal,
market state,
signal age,
urgency,
remaining edge,
liquidity,
spread,
execution capacity,
and safety state,
which tactic maximizes expected net outcome?
```

‏העיקרון המחייב:

```text
Signal edge is not execution edge.
Execution is successful only if enough edge survives to the fill.
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Execution Policy הוא מודול נפרד מה־Strategy

‏ה־Scanner/Strategy מחליטים **מה** רצוי לעשות.

‏`ExecutionPolicy` מחליטה **איך**, **כמה זמן**, **באיזה גבולות**, ומתי לוותר.

‏ה־Strategy אינה אמורה להכיל לוגיקה כמו:

```text
if spread < X:
    buy at ask
```

‏אלא ליצור Intent קנוני ולהעביר אותו ל־Execution.

### ‏`P0 — Required`: ארבעה מחירי ייחוס נפרדים

‏לכל ניסיון ביצוע נשמור לפחות:

```text
signal_reference_price
decision_reference_price
order_price
fill_price
```

‏לא נשווה Backtest על `signal_reference_price` לתוצאה אמיתית ב־`fill_price` כאילו מדובר באותו Trade.

### ‏`P0 — Required`: Execution Budget נגזר מה־Edge

```text
expected_gross_edge
- unavoidable_costs
- required_margin
= maximum_execution_budget
```

‏Price protection, chase ו־slippage אינם מספרים עצמאיים; הם מוגבלים על ידי ה־edge שנותר.

### ‏`P0 — Required`: Remaining Edge נבדק שוב לפני כל Risk-Increasing Action

‏נדרש recheck לפחות לפני:

```text
initial submit
more-aggressive replace
partial-fill completion attempt
candidate switch that creates new risk
```

‏אם ה־edge שנותר אינו מצדיק את העלות והסיכון:

```text
ABORT_ENTRY
```

‏הוא Outcome תקין.

### ‏`P0 — Required`: `NO_TRADE / ABORT` הם Execution Outcomes לגיטימיים

‏Execution Engine אינו חייב להמיר כל Signal ל־Position.

‏אם אי אפשר לבצע בתוך price/latency/liquidity/safety budget, שמירת ה־edge באמצעות ויתור היא התנהגות נכונה.

### ‏`P0 — Required`: כל Order ו־Intent מקבלים TTL

```text
signal_ttl
intent_expiry
order_ttl
```

‏אלה מושגים שונים.

‏Order יכול לפוג כאשר ה־Signal עדיין חי, ו־Signal יכול למות כאשר Order עדיין חוקי אצל הברוקר.

### ‏`P0 — Required`: Hard Price Boundary

‏לכל tactic יש גבול מחיר קשיח שאינו נפרץ על ידי adaptive logic.

‏הגבול חייב להיות:

```text
side-aware
tick-normalized
instrument-valid
within remaining edge budget
within risk/safety policy
```

### ‏`P0 — Required`: Pre-submit / Pre-replace Recheck

‏לפני פעולה שמגדילה Risk:

```text
candidate still valid?
signal still alive?
data fresh?
market-wide rank trusted?
spread/liquidity acceptable?
price drift within budget?
remaining edge positive?
broker ready?
risk still approved?
safety allows increase?
intent epoch current?
```

### ‏`P0 — Required`: Cancel הוא Intent, לא Fact

```text
CancelRequested != CancelConfirmed
```

‏`Cancel/Fill Race` הוא state רגיל שיש לתמוך בו.

‏גם לאחר בקשת Cancel יכול להגיע Fill.

### ‏`P0 — Required`: Partial Fill יוצר Position אמיתי

‏ברגע שהתקבל Fill חלקי:

```text
actual filled quantity = real exposure
```

‏Execution Plan חייב להגדיר מראש:

```text
keep_partial
complete_partial
cancel_remainder
reduce_or_exit_partial_when_signal_dies
```

### ‏`P0 — Required`: Same Execution Core ב־Replay / Shadow / Paper

‏ה־policy, state machine, TTL, reprice, abort ו־partial-fill logic נשארים אותם רכיבים.

‏רק Adapter / Fill Model משתנים.

---

## ‏3. Preferred Baseline — שלוש משפחות בלבד בתחילת המחקר

### ‏`P1 — Reference Baseline`: Protected `Marketable Limit`

‏זהו baseline ראשון שימושי משום שהוא:

- ‏פשוט יחסית להסבר.
- ‏מאפשר execution מהיר.
- ‏כולל price ceiling/floor מפורש.
- ‏קל להשוואה ב־Replay.
- ‏מכריח אותנו להגדיר execution budget אמיתי.

‏הוא **אינו** “הטקטיקה הטובה ביותר”.

‏הוא Benchmark ברור.

### ‏`P1 — Comparison Baseline`: Simple Passive Limit

‏נשתמש ב־passive limit פשוט כדי למדוד:

```text
spread saved
fill probability
waiting time
missed opportunity
adverse-selection markout
queue sensitivity
```

‏Passive fill זול לכאורה אינו בהכרח fill טוב.

### ‏`P2 — Primary Challenger`: Simple Adaptive Escalation

‏רק לאחר שיש Reference baselines.

‏ה־Challenger יכול לנוע בין רמות aggression מוגדרות מראש:

```text
PASSIVE
→ IMPROVED / MID-LIKE
→ MARKETABLE_LIMIT
→ ABORT
```

‏כל מעבר חייב להיות דטרמיניסטי, מוסבר ו־versioned.

‏אין להתחיל עם policy רציפה/ML שמחשבת aggression בצורה בלתי־ניתנת להסבר.

---

## ‏4. למה זה ה־Default

‏לרובוט short-horizon, execution יכול למחוק את ה־alpha בשלוש דרכים שונות:

```text
too passive
→ no fill / missed opportunity

too aggressive
→ spread + slippage + adverse selection

too slow / stale
→ fill after the original signal has decayed
```

‏לכן metric יחיד כמו `fill_rate` או `slippage` אינו מספיק.

‏צריך למדוד יחד:

```text
Fill Probability
Time to Fill
Price Cost
Markout
Missed Opportunity
Signal Age at Fill
Remaining Edge at Fill
Tail Risk
Net Outcome
```

---

## ‏5. Passive / Balanced / Aggressive הם Policy States, לא שמות Orders

‏`Passive` פירושו ניסיון לספק Liquidity או לפחות לא לחצות מיד את ה־spread.

‏`Aggressive` פירושו נכונות לקחת Liquidity בתוך price protection.

‏`Balanced` הוא אזור ביניים.

‏אין להניח שהשם של Order Type לבדו מגדיר את ה־economic behavior.

‏אותו `Limit` יכול להיות:

```text
passive
marketable
or effectively very aggressive
```

‏לפי מחירו ביחס ל־Book.

---

## ‏6. Urgency Contract

‏`Urgency` הוא state מפורש של Execution.

‏Inputs אפשריים:

```text
signal_strength
signal_age
signal_half_life
rank_gap
rank_persistence
expected_holding_time
remaining_edge
spread
available_size
market_speed
regime
position_risk
broker_health
```

‏ב־Baseline לא ננסה לייצר “נוסחה אופטימלית”.

‏נשתמש במספר קטן של buckets או states שניתן להסביר.

‏דוגמה מבנית:

```text
LOW
MEDIUM
HIGH
EMERGENCY_EXIT
```

---

## ‏7. Signal Half-Life ו־Execution Half-Life

‏נמדוד היסטורית:

```text
signal_age
→ expected_forward_edge
```

‏ולאחר מכן:

```text
signal_age_at_submit
signal_age_at_ack
signal_age_at_fill
```

‏המטרה היא להבין כמה מה־edge נשחק עוד לפני מחיר ה־fill.

### ‏Metric מרכזי

```text
edge_preserved_at_fill
```

‏או רעיונית:

```text
execution_conversion =
net_edge_at_fill / expected_edge_at_signal
```

‏אין להשתמש ביחס כאשר denominator קטן/לא יציב בלי guardrails.

---

## ‏8. Order TTL / Intent Expiration

‏כל Entry Intent מקבל expiration.

‏אם הוא המתין בתור, ב־backpressure או ב־broker queue מעבר לתוקף:

```text
REJECT_EXECUTION_INTENT_EXPIRED
```

‏לא שולחים אותו “כי כבר השקענו זמן בחישוב”.

‏Order Working מקבל `order_age` ו־TTL משלו.

‏Order ישן הוא Exposure פוטנציאלי חדש.

---

## ‏9. Price Drift / Maximum Chase

‏נשמור Anchor מה־Signal/Decision:

```text
signal_reference_price
```

‏ונחשב:

```text
entry_drift
chase_distance
remaining_edge_after_drift
```

‏Reprice אינו רשאי לעבור:

```text
hard_price_boundary
max_chase_budget
remaining_edge_floor
```

‏`max_chase` אינו magic number; הוא נגזר ממחקר edge/cost.

---

## ‏10. Repricing Baseline

‏לא נבצע Reprice על כל Tick.

‏Baseline:

```text
meaningful market/edge change
AND
minimum reprice interval satisfied
AND
signal still valid
AND
remaining edge still positive
AND
request capacity available
```

‏נשמור:

```text
reprice_count
reprice_reason
price_before
price_after
queue_assumption_before
queue_assumption_after
```

### ‏`P1`: Reprice Threshold + Cooldown

‏שני מנגנונים פשוטים עדיפים על thrashing.

### ‏`P2`: Hysteresis

‏אם policy הסלימה ל־Aggressive, היא לא חוזרת מיד ל־Passive בגלל שינוי זעיר.

### ‏`P3`: Fully adaptive continuous repricing

‏רק לאחר Evidence.

---

## ‏11. Queue Position — מה נכנס עכשיו ומה נדחה ל־38

‏במקטע 37 אנו מקבעים רק את הכללים:

```text
Touch != Fill
Price alone != Queue Position
Cancel/Replace may lose priority
No-fill must remain in dataset
```

‏מודל Queue מפורט, volume-ahead, priority semantics ו־L2/L3 fidelity הם נושא 38.

‏עד אז:

- ‏Passive backtest לא מניח Fill רק בגלל Touch.
- ‏נשתמש `Best / Base / Stress` assumptions.
- ‏נשמור uncertainty מפורשת.

---

## ‏12. No-Fill הוא Outcome ראשון במעלה

‏Dataset של Execution חייב לשמור:

```text
FILLED
PARTIALLY_FILLED
CANCELLED
ABORTED
EXPIRED
REJECTED
NO_FILL
UNKNOWN
```

‏לכל No-Fill נחשב forward outcome סביר:

```text
missed_trade_markout
missed_opportunity_bps
```

‏בלי זה Passive strategy נראית טוב מדי כי רק fills מוצלחים נשארים במדגם.

---

## ‏13. Adverse Selection / Markout

‏לכל Fill נמדוד Markout side-aware.

‏חלונות ראשוניים למחקר יכולים לכלול:

```text
100ms
500ms
1s
5s
10s
```

‏החלונות עצמם מותאמים ל־signal horizon ואינם Recommendation קבועה.

‏נפריד:

```text
passive_fill_markout
aggressive_fill_markout
partial_fill_markout
```

‏מטרת Markout אינה לנבא PnL מלא, אלא להבין את איכות נקודת הביצוע ואת adverse selection.

---

## ‏14. Missed Opportunity Cost

‏טקטיקה אינה נמדדת רק לפי Orders שבוצעו.

‏נמדוד גם:

```text
what happened after a valid opportunity that did not fill?
```

‏כך אפשר לזהות:

```text
price-improvement benefit
vs
opportunity-capture loss
```

---

## ‏15. IOC

### ‏`P2 — Challenger`

‏`IOC` מתאים רעיונית כאשר:

- ‏ה־signal קצר.
- ‏רוצים לבצע רק Liquidity זמינה עכשיו.
- ‏לא רוצים להשאיר stale resting remainder.

‏אבל הוא אינו Baseline לפני Capability + empirical validation.

‏נדרש למדוד:

```text
fill_rate
partial_fill_rate
missed_opportunity
re-request pressure
net outcome
```

‏Capability חייב להיות instrument/routing/account-aware.

---

## ‏16. FOK

### ‏`P4 — Specialist / Avoid Unless Evidence`

‏`FOK` מוותר על partial fills ולכן עלול לפגוע משמעותית ב־fill probability.

‏אין סיבה להתחיל ממנו ברובוט שלנו.

‏הוא ייבחן רק אם Evidence מראה ש־partial position מתחת לכמות מסוימת חסרת ערך כלכלי/תפעולי וש־all-or-nothing באמת משפר Net outcome.

---

## ‏17. Midpoint / MidPrice

### ‏`P2 — Challenger`

‏Midpoint-like tactics מעניינות כי הן יכולות לחסוך חלק מה־spread.

‏אבל נדרש למדוד:

```text
fill probability
fill age
adverse selection
missed opportunity
routing semantics
```

‏אין להניח ש־“midpoint” פירושו אותו behavior בכל venue/broker.

---

## ‏18. Pegged Orders

### ‏`P3 — Advanced Challenger`

‏Pegged/Relative orders יכולים להפחית manual repricing, אבל הם מוסיפים semantics תלויות Broker/Venue.

‏לפני קידום:

```text
reference price known
side semantics known
offset semantics known
cap/floor known
routing known
marketability behavior known
modify/cancel semantics known
replay model exists
```

‏אם איננו יכולים להסביר בדיוק מה Broker יעשה, ה־tactic אינו Production candidate.

---

## ‏19. Post-Only

### ‏`P4 — Specialist`

‏Post-only יכול להיות שימושי רק כאשר venue/broker semantics ברורים והמחקר דורש Maker-only behavior.

‏הוא אינו דרישת MVP.

‏ה־Capability אינה נחשבת קיימת בגלל שהמושג קיים בשוק; נדרש verification ספציפי למסלול execution.

---

## ‏20. Price Ladder

### ‏`P2 — Useful abstraction`

‏במקום offsets אקראיים נגדיר מספר קטן של levels semantic:

```text
L0 = passive reference
L1 = improved passive
L2 = midpoint-like
L3 = marketable at touch
L4 = protected aggressive offset
```

‏המחירים בפועל נגזרים בזמן אמת מ־Book + tick rules + price protection.

‏אין לקודד penny offsets אוניברסליים.

---

## ‏21. Tick / Market Rule Awareness

‏כל מחיר מחושב עובר:

```text
instrument market rule
→ allowed increment
→ side-aware rounding
→ broker validation
```

‏אין להניח `0.01` כ־tick אוניברסלי.

‏מקטע `02A` הוא ה־override הרגולטורי הנוכחי לפרטי Reg NMS תלויי־זמן.

---

## ‏22. Opening / Midday / Closing / Extended-Hours

‏Execution Policy יכולה להיות Regime-aware, אך לא תתחיל עם policies נפרדות לכל חלון.

‏Baseline:

```text
same simple policy
+ regime/context telemetry
```

‏רק אם Evidence מראה interaction יציב:

```text
regime-conditioned policy challenger
```

‏Extended-hours support, liquidity ו־Order support הם capabilities תלויי Broker/Venue ויש לאמתם בזמן שימוש.

---

## ‏23. Entry Urgency != Exit Urgency

‏Entry יכול להסתיים ב־`NO_TRADE`.

‏Exit כבר מנהל Exposure אמיתי.

‏לכן:

```text
Entry objective:
maximize expected net capture while preserving option to abort

Exit objective:
reduce/manage existing risk subject to execution cost
```

‏ב־Safety degradation, risk-reducing actions מקבלות priority גבוהה יותר.

---

## ‏24. Partial Fill Policy

‏`ExecutionPlan` חייב להגדיר:

```text
minimum_useful_position
completion_policy
remainder_ttl
signal-death behavior
exit_partial behavior
```

‏אין “להשלים” אוטומטית Quantity רק כדי להגיע ל־target המקורי.

‏Completion attempt הוא risk-increasing action ודורש recheck.

---

## ‏25. Candidate Replacement

### ‏`P2 — Challenger`

‏אם Candidate חדש נהיה טוב יותר בזמן ש־Entry ישן עובד, לא מחליפים אוטומטית.

‏נדרש:

```text
expected_incremental_value_of_new_candidate
>
switching_cost
+ cancellation uncertainty
+ new execution cost
+ safety margin
```

‏אחרת Rank churn ייהפך ל־Order churn.

---

## ‏26. Switching Cost

‏נמדוד:

```text
cancel latency
cancel/fill race probability
lost queue position
new spread crossing
new signal age
new execution latency
request pressure
```

‏`Top1 changed` לבדו אינו reason מספיק.

---

## ‏27. Broker/API Capacity הוא חלק מ־Execution

‏Execution Engine שומר budget נפרד לבקשות קריטיות.

‏Priority baseline:

```text
1. Risk-reducing / emergency action
2. Cancel risk-increasing working order
3. Reconciliation
4. Exit management
5. Entry action
6. Noncritical query
```

‏Backpressure אינו רשאי לגרום ל־Entry Intent ישן להתבצע מאוחר.

---

## ‏28. Execution Admission Control

‏לפני שה־Execution Engine מתחיל lifecycle חדש הוא רשאי להחזיר:

```text
REJECT_EXECUTION_CAPACITY
REJECT_INTENT_EXPIRED
REJECT_DATA_STALE
REJECT_BROKER_DEGRADED
REJECT_EDGE_INSUFFICIENT
REJECT_SAFETY
```

‏זה חלק מה־strategy economics, לא failure פנימי.

---

## ‏29. ExecutionPlan Contract

‏Baseline:

```text
execution_plan_id
tactic_id
tactic_version
intent_id
decision_id
instrument_id
side
target_quantity
created_at
expires_at
signal_reference_price
decision_reference_price
initial_urgency
initial_order_type
initial_price_rule
hard_price_boundary
max_chase_budget
order_ttl
reprice_policy
reprice_cooldown
partial_fill_policy
abort_conditions
required_market_fields
required_capabilities
risk_version
safety_epoch
execution_policy_version
```

---

## ‏30. Tactic Registry

‏לא נשתמש בשמות אד־הוק בקוד.

‏Registry ראשוני:

```text
TACTIC-ML-001  ProtectedMarketableLimit
TACTIC-PAS-001 SimplePassive
TACTIC-AE-001  SimpleAdaptiveEscalation
```

‏Challengers עתידיים:

```text
TACTIC-IOC-xxx
TACTIC-MID-xxx
TACTIC-PEG-xxx
```

‏לכל tactic:

```text
purpose
inputs
required_capabilities
parameters
hard_bounds
state transitions
expected failure modes
metrics
version
retirement condition
```

---

## ‏31. Execution Lifecycle Dataset

‏נשמור lifecycle מלא:

```text
IntentCreated
ExecutionAdmitted
PlanCreated
OrderSubmitted
OrderAcknowledged
OrderModified
CancelRequested
PartialFill
Fill
CancelConfirmed
Rejected
Expired
Aborted
PositionOpened
PositionReduced
PositionClosed
```

‏כל transition מקבל Market Snapshot רלוונטי.

---

## ‏32. Market Snapshot at Transitions

‏לכל נקודה מהותית נשמור לפי זמינות:

```text
bid
ask
bid_size
ask_size
spread
last
quote_age
trade_age
market_state
score
rank
rank_gap
signal_age
remaining_edge
urgency
broker_health
safety_mode
```

‏Depth/queue fields יתווספו ב־38 כאשר fidelity מאפשרת.

---

## ‏33. Execution Trace

‏Trace צריך להסביר:

```text
why this tactic?
why this price?
why wait?
why reprice?
why cancel?
why abort?
why complete / not complete partial fill?
```

‏ללא trace כזה Adaptive policy אינה באמת debuggable.

---

## ‏34. Execution Attribution

‏נפריד לפחות:

```text
Signal Age Before Decision
Decision Delay
Risk/Safety Delay
Execution Planning Delay
Submit Delay
Broker Ack Delay
Fill Delay
Price Slippage
Missed Fill
Exit Slippage
```

‏כך לא מאשימים את Order tactic בבעיה שמקורה Scanner/Data/Broker.

---

## ‏35. Primary Evaluation Scorecard

### ‏Fill

```text
fill_rate
partial_fill_rate
time_to_fill_p50
time_to_fill_p95
time_to_fill_p99
```

### ‏Price / Friction

```text
entry_slippage_bps
implementation_shortfall
spread_paid_or_saved
```

### ‏Adverse Selection

```text
markout_100ms
markout_500ms
markout_1s
markout_5s
```

### ‏Opportunity

```text
no_fill_forward_markout
missed_opportunity_bps
opportunity_capture_rate
```

### ‏Signal Preservation

```text
signal_age_at_submit
signal_age_at_fill
remaining_edge_at_fill
stale_fill_rate
execution_conversion
```

### ‏Operational

```text
cancel_rate
replace_rate
order_churn
cancel_to_fill_race_rate
broker_request_rate
execution_reject_rate
```

### ‏Economics

```text
gross_forward_outcome
executable_forward_outcome
net_forward_outcome
round_trip_execution_cost
```

---

## ‏36. Composite Evaluation — אין Metric יחיד

‏לא נקדם tactic לפי:

```text
Fill Rate only
Slippage only
Price Improvement only
PnL only
```

‏נדרש Pareto review של:

```text
Net Outcome
Fill / Capture
Latency
Tail Slippage
Adverse Selection
Missed Opportunity
Stale Fills
Operational Complexity
```

---

## ‏37. Conditional Analysis

‏נפרק מראש לפי dimensions בעלי rationale:

```text
spread bucket
liquidity bucket
signal strength
rank gap
time of day
market regime
signal age
execution urgency
```

‏לא נבנה מאות per-symbol exceptions מתוך Backtest.

---

## ‏38. Marginal Waiting Value

‏לכל Passive/Improved tactic נרצה לענות:

```text
What do we gain by waiting another Δt?
```

‏נמדוד:

```text
incremental fill probability
vs
incremental edge decay
vs
incremental adverse selection
```

‏כך TTL הופך ל־evidence-based parameter ולא Magic Number.

---

## ‏39. Fill Quality by Age

‏נבדוק האם:

```text
fast fills
medium-age fills
late fills
```

‏בעלי Markout ו־Net outcome שונים.

‏אם late fills גרועים באופן יציב, `stale-fill guard` יכול לקבל Evidence.

---

## ‏40. Execution Regret

‏אפשר לחשב counterfactual:

```text
best_reasonable_tactic_outcome
- actual_tactic_outcome
```

‏`reasonable` מחייב tactic שהיה אפשר לבחור באותו זמן עם אותו מידע.

‏Perfect hindsight fill אינו comparator תקין.

---

## ‏41. Best / Base / Stress

‏לכל tactic נריץ לפחות:

```text
Best
Base
Stress
```

‏Stress dimensions:

```text
latency
spread
liquidity
queue uncertainty
partial fills
broker delay
rate/request pressure
```

‏Tactic שנראה טוב רק תחת optimistic fill assumptions אינו Production candidate.

---

## ‏42. Same-Signal Counterfactual Experiment

‏הדרך המועדפת להפריד Alpha מ־Execution:

```text
same candidate
same decision time
same quantity
same risk state
same exit model
same market path
→ different execution tactic only
```

‏נשווה לפחות:

```text
Protected Marketable Limit
Simple Passive
Simple Adaptive Escalation
```

---

## ‏43. Shadow Champion / Challenger

‏לאחר Replay/OOS:

```text
Champion execution policy
vs
Challenger execution policy
```

‏שניהם מקבלים את אותו Intent Stream.

‏Challenger אינו שולח competing broker orders.

‏נמדוד `decision impact rate` ו־counterfactual outcomes.

---

## ‏44. Experiment Discipline

‏כל שינוי tactic עובר את משמעת מקטע 24.

‏Experiment Contract כולל:

```text
hypothesis
control tactic
treatment tactic
single intended diff
primary metric
guardrails
dataset / periods
execution model version
cost model version
minimum useful effect
acceptance rule
rejection rule
```

‏אין לשנות יחד:

```text
TTL + offset + reprice frequency + partial-fill policy
```

‏ולטעון שנלמד מה עזר.

---

## ‏45. Sensitivity / Robust Region

‏נעדיף plateau יציב על magic point.

‏לדוגמה:

```text
TTL × aggression level × reprice threshold
```

‏אם שינוי זעיר בפרמטר הורס את התוצאה, זו אזהרת overfit.

---

## ‏46. Safety / Recovery Integration

‏Execution Policy אינה יכולה לעקוף את מקטעים 33–36.

‏כל פעולה Risk-Increasing דורשת:

```text
System capability
Risk permission
Safety permission
current safety_epoch
Broker readiness
fresh market evidence
```

‏ב־`BLOCK_NEW_ENTRIES / EXIT_ONLY / RECOVERING / FULL_HALT` capabilities נגזרות מה־Safety layer, לא מה־Tactic.

---

## ‏47. Priority During Degradation

‏Execution queue אינה FIFO עיוורת.

‏Risk-reducing lifecycle מקבל קדימות.

‏Entry Intent שלא יכול להתבצע בזמן תקף — פג.

‏אין “להשלים backlog” של Entries אחרי Recovery.

---

## ‏48. Observability Contract

‏Dashboard/Telemetry צריכים להציג לפחות:

```text
working orders
order age
signal age
tactic id/version
current urgency
hard price boundary
current price level
fill latency
slippage
markout
cancel pending
partial quantity
remaining edge
execution health
```

‏Alerts אפשריים:

```text
STALE_WORKING_ENTRY
EXCESSIVE_REPRICING
FILL_LATENCY_SHIFT
NEGATIVE_MARKOUT_SHIFT
MISSED_OPPORTUNITY_SHIFT
SLIPPAGE_SHIFT
```

‏Thresholds אינם קבועים ללא Evidence.

---

## ‏49. Failure Taxonomy

```text
E01 STALE_SIGNAL_FILL
E02 EXCESSIVE_CHASE
E03 MISSED_FILL
E04 QUEUE_MISMODEL
E05 CANCEL_FILL_RACE
E06 PARTIAL_FILL_MISMANAGED
E07 BROKER_DELAY
E08 DATA_STALENESS
E09 PRICE_PROTECTION_TOO_TIGHT
E10 PRICE_PROTECTION_TOO_LOOSE
E11 REPRICE_THRASH
E12 INTENT_EXPIRED_IN_QUEUE
E13 CAPABILITY_MISMATCH
E14 TICK_OR_PRICE_RULE_REJECT
E15 SWITCHING_COST_EXCEEDED
E16 EXECUTION_CAPACITY_REJECT
```

---

## ‏50. Success Taxonomy

```text
S01 PASSIVE_PRICE_IMPROVEMENT
S02 FAST_PROTECTED_CAPTURE
S03 GOOD_ABORT
S04 PARTIAL_FILL_MANAGED_WELL
S05 REPRICE_ADDED_VALUE
S06 NO_TRADE_PRESERVED_EDGE
S07 ADAPTIVE_ESCALATION_ADDED_VALUE
```

‏Success אינו רק Fill.

---

## ‏51. RCA Loop

```text
Outcome
→ Execution Attribution
→ First Divergence
→ Failure / Success Classification
→ Population Evidence
→ Hypothesis
→ Controlled Experiment
→ KEEP / REJECT / REWORK / NEEDS_MORE_DATA
```

‏אין `bad trade → tweak offset`.

---

## ‏52. Required Data / Evidence

‏לפני קידום tactics מעבר ל־Baseline צריך:

```text
point-in-time L1 bid/ask + sizes
trade stream when used by model
accurate event/receive/decision/submit/ack/fill times
full order lifecycle
partial fills
cancel confirmations
rejections + reasons
signal/rank/score snapshots
signal age
market-data freshness
cost model
no-fill forward outcomes
markout after fills
broker health / recovery context
tactic version
```

‏ל־Queue-aware tactics יידרש מידע נוסף במקטע 38.

---

## ‏53. Promotion Criteria

‏Tactic Challenger מקודם רק אם:

- ‏ה־Control reproducible.
- ‏אותם Signals הושוו בצורה paired.
- ‏No-Fills ו־Partial Fills כלולים.
- ‏Fill model אינו מניח Touch=Fill ללא הצדקה.
- ‏Net outcome משתפר מעבר ל־minimum useful effect.
- ‏Tail slippage אינו מדרדר מהותית.
- ‏Stale-fill rate אינו מדרדר.
- ‏Cancel/fill race אינו הופך לבעיה תפעולית.
- ‏Order churn ו־request pressure נשארים קבילים.
- ‏Markout אינו מצביע על adverse selection חדש.
- ‏Missed opportunity אינו מחסל את price improvement.
- ‏OOS / walk-forward evidence קיים.
- ‏parameter neighborhood robust.
- ‏Replay deterministic.
- ‏Shadow comparison עקבי.
- ‏Broker capability/semantics אומתו.
- ‏Safety/Recovery invariants נשמרים.

---

## ‏54. Rejection Criteria

‏נדחה tactic כאשר:

- ‏הוא משפר Fill Rate אך מוריד Net outcome.
- ‏הוא משפר Slippage אך מגדיל Missed Opportunity יותר מהחיסכון.
- ‏הוא תלוי ב־Touch=Fill assumption אופטימי.
- ‏הוא מייצר stale fills רבים.
- ‏הוא דורש chase מעבר ל־remaining edge.
- ‏הוא רגיש מאוד לפרמטר יחיד.
- ‏הוא מייצר reprice thrashing.
- ‏הוא שורף Broker request budget.
- ‏הוא נשבר תחת latency/spread/liquidity stress.
- ‏הוא תלוי ב־broker semantics שאיננו יכולים לאמת.
- ‏הוא מוסיף complexity שאין לה incremental value ברור.
- ‏הוא עוקף Safety/Recovery contracts.

---

## ‏55. What I Would Avoid Initially

‏לא מתחילים עם:

- ‏Hundreds of per-symbol execution rules.
- ‏Continuous ML-based urgency.
- ‏Complex queue-position prediction לפני 38/validation.
- ‏Pegged-order matrix גדולה.
- ‏Direct routing optimization לכל Venue.
- ‏Post-only policy בלי maker-specific hypothesis.
- ‏FOK כברירת מחדל.
- ‏Aggressive chase-until-filled.
- ‏Reprice על כל Tick.
- ‏Broker-specific logic בתוך Strategy.
- ‏Auto-switch בין Candidates בכל Rank flip.
- ‏“Always Market”.
- ‏“Always Bid”.

---

## ‏56. What to Add Later

### ‏`P2`

- ‏Adaptive Escalation פשוט.
- ‏Midpoint/IOC experiments.
- ‏Regime-conditioned aggression אם Evidence מצדיק.
- ‏Candidate switching עם explicit switching-cost model.

### ‏`P3`

- ‏Pegged/Relative orders.
- ‏Queue-aware repricing.
- ‏Depth-aware size/execution.
- ‏Dynamic urgency surface.
- ‏Broker/venue-specific routing experiments.

### ‏`P4`

- ‏Post-only specialist policies.
- ‏FOK specialist use.
- ‏Advanced smart/direct venue tactics.
- ‏Nonlinear/ML execution policy רק אחרי Baseline חזק.

---

## ‏57. User-Specific Application

‏עבור ה־Scanner שלנו, ההיפותזה העסקית היא שה־edge קצר ולכן Execution חייב להתייחס לזמן כחלק מהמחיר.

‏שלוש שאלות יקבלו קדימות:

1. ‏כמה edge נשאר בזמן Fill ביחס ל־Signal?
2. ‏כאשר Passive לא התמלא, האם באמת איבדנו Opportunity או נמנענו מ־Bad Fill?
3. ‏האם Marketable Limit משמר יותר Net Edge למרות spread, או ש־Passive/Adaptive משפרים אותו בפועל?

‏Top1 אינו permission לרדוף.

‏Candidate יכול להישאר #1 אך לאבד את ה־absolute edge שלו.

‏לכן Execution בודק גם Rank וגם Score/remaining edge.

---

## ‏58. Concrete Baseline Contract

```text
1. Receive canonical TradeIntent.
2. Verify Risk + Safety + Broker/Data readiness.
3. Capture fresh executable Bid/Ask/sizes and timestamps.
4. Estimate remaining edge and hard execution budget.
5. Reject if the opportunity is no longer executable.
6. Select one versioned tactic.
7. Build immutable ExecutionPlan snapshot.
8. Normalize price to current instrument rules.
9. Submit protected order.
10. Record submit/ack/order-state transitions.
11. Re-evaluate on meaningful market/order events or controlled timer.
12. Never reprice beyond hard boundary.
13. Never reprice risk-up without fresh Risk/Safety/Edge recheck.
14. Treat partial fills as real exposure immediately.
15. Treat cancel as pending until authoritative confirmation/reconciliation.
16. Abort when signal/edge/TTL/readiness fails.
17. Record fills and no-fills equally.
18. Compute markout, missed opportunity and execution attribution.
19. Feed failures/successes into RCA and controlled experiments.
```

---

## ‏59. Baseline Research Matrix

```text
Control A: Protected Marketable Limit
Control B: Simple Passive
Challenger C: Simple Adaptive Escalation
```

‏אותם:

```text
candidate
decision_time
quantity
risk state
market path
exit model
cost model
```

‏משתנה:

```text
execution tactic only
```

---

## ‏60. Golden Scenarios

‏לפחות:

```text
strong signal + narrow spread + immediate marketable fill
strong signal + passive no-fill + price runs
passive fill + negative immediate markout
signal weakens before submit
signal weakens while order working
spread widens before submit
partial fill + signal death
cancel requested + late fill
reprice would exceed hard boundary
candidate changes but switching cost too high
broker ack slows and intent expires
safety epoch changes before submit
broker reconnect while cancel pending
```

---

## ‏61. Tests

### ‏Unit

```text
tick normalization
price boundary
TTL
signal expiry
max chase
urgency transition
abort rule
partial-fill rule
candidate-switch threshold
```

### ‏State Machine

```text
submit/ack/fill/cancel permutations
partial fill + cancel
late fill after cancel request
replace + fill race
unknown effect + reconciliation
```

### ‏Property

```text
never submit beyond hard price boundary
never increase risk with expired intent
never increase risk under disallowed safety capability
partial fill always changes exposure
same inputs => same tactical decision
```

### ‏Replay / Fault Injection

```text
slow ack
missing/late callback
data gap
spread jump
broker reconnect
request backpressure
partial fills
```

---

## ‏62. Metrics

### ‏Core

```text
fill_rate
partial_fill_rate
time_to_fill_p50/p95/p99
slippage_bps
implementation_shortfall
markout_by_horizon
missed_opportunity_bps
remaining_edge_at_fill
stale_fill_rate
execution_conversion
order_churn
cancel_fill_race_rate
execution_abort_rate
execution_reject_rate
```

### ‏Diagnostic

```text
reprice_count_by_tactic
signal_age_at_submit/ack/fill
rank_at_submit/fill
score_at_submit/fill
spread_at_submit/fill
broker_ack_latency
request_queue_age
execution_capacity_rejects
```

---

## ‏63. Current Verification Snapshot — 2026-10-27

‏ה־facts הבאים אומתו מול תיעוד רשמי של IBKR והם תלויי־זמן.

### ‏Fact — TWS API order throughput

‏IBKR מציינת כיום מגבלת קצב של `50 orders per second` ל־TWS API. לכן cancel/replace churn יכול להפוך גם ל־API pressure, ולא רק ל־queue/microstructure cost.

‏מקור רשמי:

`https://ibkrcampus.com/docs/third-party-integrations/general-third-party-frequently-asked-questions`

### ‏Fact — Contract capabilities אינן אוניברסליות

‏ב־Web API, contract-rules מחזיר בין היתר:

```text
orderTypes
tifTypes
incrementRules
algoEligible
```

‏כלומר capability discovery יכולה להיות contract-specific, ואין לקודד Order/TIF availability כעובדה גלובלית.

‏מקורות רשמיים:

`https://ibkrcampus.com/docs/web-api/api-reference/trading/trading-contracts/get-contract-rules`

`https://ibkrcampus.com/docs/web-api/api-reference/trading/trading-contracts/get-info-and-rules`

### ‏Fact — `IOC` מופיע ב־Web API capability/TIF documentation

‏התיעוד הנוכחי כולל `IOC` ב־TIF capabilities עבור order types מסוימים, אך יש לבדוק את ה־contract/routing/account בפועל ולא להניח תמיכה אחידה.

### ‏Fact — `MidPrice` / Relative / Pegged variants קיימים ב־IBKR

‏IBKR מתעדת `MidPrice` ו־Relative/Pegged order families. זמינות ו־semantics בפועל תלויות ב־routing/order type/instrument ולכן הן נשארות Challengers.

‏מקורות רשמיים:

`https://ibkrcampus.com/campus/trading-course/introduction-to-tws-order-types/`

`https://ibkrcampus.com/docs/tws-api/ref/order`

### ‏Fact — TWS API capabilities עוקבות אחרי TWS

‏IBKR מציינת שככלל, אם capability אינה זמינה ב־TWS היא אינה זמינה דרך TWS API; לכן בדיקת TWS + API documentation + Paper behavior היא חלק מ־Capability Contract.

‏מקור רשמי:

`https://ibkrcampus.com/docs/tws-api/doc/notes-limitations/tws-api-limitations`

### ‏Fact — IBKR ATS Pegged-to-Midpoint הוא Specialist path

‏IBKR מתעדת `Pegged-to-Midpoint` ב־IBKR ATS עם venue-specific rules. הוא אינו שקול ל־generic midpoint policy ולכן אינו Baseline שלנו.

‏מקור רשמי:

`https://ibkrcampus.com/campus/trading-lessons/ibkr-ats-pegged-to-midpoint/`

---

## ‏64. Time-Sensitive Facts Policy

‏לפני שימוש תפעולי ב־:

```text
IOC
FOK
MidPrice
Pegged / Relative
Post-Only
Outside-RTH behavior
Direct routing
Modify/replace semantics
Price-management behavior
Broker order-rate limits
```

‏יש לבצע verification עדכני לפי:

```text
broker API
account
instrument
route / destination
session
current software/API version
```

‏אין להמיר את Snapshot של 2026-10-27 ל־hard-coded eternal assumptions.

---

## ‏65. Confidence

### ‏High

- ‏Execution חייב להימדד Net ולא לפי Fill Rate בלבד.
- ‏Signal/Decision/Order/Fill prices חייבים להיות נפרדים.
- ‏No-Fills ו־Partial Fills חייבים להישאר ב־dataset.
- ‏TTL, hard price boundary ו־pre-submit recheck הם baseline controls.
- ‏Cancel/Fill race ו־stale intent הם חלק מה־core state machine.
- ‏Same-signal counterfactual comparison הוא הדרך הנקייה להשוואת tactics.

### ‏Medium

- ‏Protected Marketable Limit הוא Reference baseline מתאים לרובוט שלנו.
- ‏Simple Passive הוא comparison baseline חשוב.
- ‏Simple Adaptive Escalation הוא Challenger ראשון הגיוני.

### ‏Hypothesis / Requires Evidence

- ‏Midpoint ישפר Net capture.
- ‏IOC ישפר short-lived signals.
- ‏Adaptive escalation ינצח baseline פשוט.
- ‏Regime-conditioned execution מוסיף value.
- ‏Pegged orders מצדיקים את המורכבות.

---

## ‏66. Relationship to Later Sheets

- ‏`38` — Queue Position / Limit Order Subtleties יעמיק ב־priority, volume ahead ו־passive fill fidelity.
- ‏`39+` — Routing/venue/order-flow topics יוסיפו routing-specific evidence במקום להעמיס אותו כאן.
- ‏`45` — Microprice / Order Book signals יכולים להפוך inputs ל־Execution, אך לא לפני predictive validation.
- ‏`47` — Capacity/Impact יבדוק איך Quantity ו־Depth משנים execution economics.
- ‏`58` — Order/Execution Subtleties יבצע consolidation של edge cases מתקדמים.
- ‏Cross-Cutting `Recommended Order Policy` ו־`Recommended Execution Policy` יסנתזו את ההכרעות לאחר השלמת כל הפרקים.

---

## ‏67. Recommendation Summary

```text
P0
ExecutionPolicy separate from Strategy
Edge budget + hard price boundary
TTL / expiry
Fresh pre-submit and pre-reprice checks
No blind chase
Partial fill = real exposure
Cancel != fact
No-fill retained
Full lifecycle evidence
Safety / Risk / Broker capability gates

P1
Protected Marketable Limit reference baseline
Simple Passive comparison baseline
Execution attribution + markout + missed opportunity
Paired same-signal experiments

P2
Simple Adaptive Escalation
IOC experiment
Midpoint experiment
Candidate-switching experiment with explicit cost

P3
Pegged / Relative tactics
Queue-aware adaptive execution
Depth-aware execution
Regime-conditioned execution

P4
FOK specialist usage
Post-only specialist usage
Complex venue-specific tactics
ML/nonlinear execution policy
```

‏השורה התחתונה:

> ‏**ה־Execution baseline שלנו אינו “להשיג Fill”. הוא להמיר Signal ל־Position רק כאשר מספיק Edge נשאר לאחר זמן, spread, slippage, fill risk ו־cost — ולדעת במפורש מתי עדיף לא לבצע כלל.**
