# ‏38 — Recommendation Sheet: Queue Position / Limit Order Subtleties

> ‏מקור לימודי עיקרי: `../38-QUEUE-POSITION-AND-LIMIT-ORDER-SUBTLETIES.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי ל־Queue Modeling ול־Passive Limit Execution כך שהמערכת לא תניח ש־`Touch == Fill`, לא תמציא Queue Position שאינה יודעת, ותמדוד בצורה מפורשת את הקשר בין `volume ahead`, ‏flow, ‏cancels, ‏signal age, ‏fill probability, ‏partial fills, ‏markout ו־missed opportunity.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה לביצוע מסחר בכסף אמיתי.

---

## ‏1. Decision

‏לא נייצג Queue כעובדה מדויקת כאשר אין לנו `market-by-order` ו־venue-level truth שמוכיחים אותה.

‏ה־Baseline הוא מודל uncertainty מפורש:

```text
Observed Market State
→ Venue / Feed Provenance
→ Initial Volume-Ahead Estimate
→ Queue Confidence
→ Market Events / Flow / Cancels
→ Fill-Probability Through Time
→ Partial / Full / No-Fill Outcome
→ Post-Fill Markout / Missed Opportunity
→ Net Execution Outcome
```

‏העיקרון המחייב:

```text
Touch is evidence.
Trade at our price is stronger evidence.
Trade-through is stronger evidence.
Queue depletion is modeled evidence.
Only broker/exchange execution report is real fill truth.
```

‏לכן `Queue Model` אינו Broker Truth.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏`Touch != Fill`

‏אסור ל־Backtest/Replay production-grade לקבוע Fill רק מפני שהמחיר נגע ב־Limit.

‏המודל:

```text
Low <= BuyLimit
=> Filled
```

‏יישמר לכל היותר כ־`OPTIMISTIC_UPPER_BOUND`.

‏הוא אינו Baseline כלכלי אמין ל־passive execution.

### ‏`P0 — Required`: Queue היא Estimate עם Confidence

‏לכל passive order נשמור לפחות:

```text
estimated_volume_ahead
queue_confidence
queue_model_version
queue_model_reason
queue_estimated_at
feed_id
venue_if_known
```

‏`queue_confidence` יהיה לפחות:

```text
HIGH
MEDIUM
LOW
UNKNOWN
```

‏אין להשתמש ב־`0` כדי לייצג Unknown.

### ‏`P0 — Required`: Broker Fill Truth נפרד מ־Simulated Fill

‏נחזיק מקור מפורש:

```text
REAL_BROKER_FILL
SIMULATED_TOUCH_FILL
SIMULATED_TRADE_THROUGH_FILL
SIMULATED_QUEUE_DEPLETION_FILL
SIMULATED_PARTIAL_QUEUE_FILL
```

‏אסור לערבב metrics של fills אמיתיים עם simulated fills בלי dimension ברור.

### ‏`P0 — Required`: Queue Confidence נופל אחרי Gap / Reconnect

‏אם חסר event, sequence gap לא תוקן, feed הוחלף או reconnect שבר continuity:

```text
queue_confidence = UNKNOWN
```

‏עד reconstruction חדש או מעבר ל־policy שמרני.

‏אסור לשחזר confidence ישן רק מפני שה־socket שוב מחובר.

### ‏`P0 — Required`: Working Order הוא Pending Exposure

‏Risk ו־Safety מחשבים:

```text
confirmed_position
+ potentially_fillable_working_quantity
```

‏ולא רק Position מאושרת.

### ‏`P0 — Required`: Cancel הוא Intent, לא Fact

‏מצב מפורש:

```text
CANCEL_PENDING
```

‏חייב להתקיים בין cancel request לבין terminal broker confirmation/reconciliation.

‏Replacement חדש אינו רשאי ליצור overfill רק מפני שה־cancel נשלח.

### ‏`P0 — Required`: Partial Fill הוא Exposure אמיתי

‏Partial Fill משנה מיד:

```text
position
remaining_order_qty
pending_exposure
risk
exit_obligation
execution_plan
```

‏המערכת אינה רשאית להתייחס ל־Entry כ־“לא התמלא” עד Full Fill.

### ‏`P0 — Required`: No Future Queue Knowledge

‏Queue decisions ב־Replay משתמשים רק במידע שהיה זמין עד ה־decision/event הנוכחי.

‏אסור להשתמש ב־future cancels, future trades או future queue depletion כדי להחליט בדיעבד שה־Order היה צריך להישאר.

### ‏`P0 — Required`: Prefix Invariance

‏אם שני Replays זהים עד זמן `T`, החלטת Fill/No-Fill עד `T` חייבת להיות זהה גם אם העתיד אחרי `T` שונה.

‏זה Invariant נגד leakage.

### ‏`P1 — Preferred Default`: שלושה Fill Models מקבילים

‏במחקר הראשוני נריץ את אותה Strategy תחת:

```text
Model A: Touch — optimistic upper bound
Model B: Trade-Through — simple conservative control
Model C: Conservative Volume-Ahead — preferred passive baseline
```

‏ולא נבחר מראש model יחיד כאמת.

### ‏`P1 — Preferred Default`: שלושה Queue Scenarios

‏ל־Volume-Ahead model נריץ:

```text
Optimistic
Base
Conservative
```

‏עם assumptions versioned על cancellation credit, venue attribution ו־hidden-liquidity uncertainty.

### ‏`P1 — Preferred Default`: Initial Volume-Ahead שמרני

‏כאשר Order מצטרף לרמת מחיר קיימת ואיננו יודעים MBO truth:

```text
initial_estimated_volume_ahead
≈ displayed_size_already_present_at_relevant_level
```

‏אך נשמור במפורש שה־observation נעשתה לפני booking בפועל ולכן היא Approximation.

### ‏`P1 — Preferred Default`: ‏`Trade-Through` כ־Simple Control

‏ל־Buy Limit ב־price `P`, trade מתחת ל־`P` הוא Evidence חזק יותר מ־Touch בלבד שהרמה נצרכה.

‏אבל גם הוא אינו מוכיח Fill מוחלט בגלל:

```text
venue fragmentation
feed ordering
hidden liquidity
locked/crossed states
trade conditions
```

### ‏`P1 — Preferred Default`: Conservative Cancellation Credit

‏עם aggregate L1/L2 איננו יודעים אם volume שבוטל היה Ahead או Behind.

‏לכן נשתמש ב־parameter מפורש:

```text
queue_cancel_credit ∈ [0, 1]
```

‏כ־Assumption מחקרי, לא כעובדה.

‏ה־Baseline לא ייתן full credit אוטומטי לכל ירידת displayed size.

### ‏`P1 — Preferred Default`: Fill Probability by Deadline

‏השאלה המרכזית אינה:

```text
Will this order fill eventually?
```

‏אלא:

```text
Will this order fill before the signal becomes economically irrelevant?
```

‏לכן נמדוד לפחות:

```text
P(fill within 100ms)
P(fill within 500ms)
P(fill within 1s)
P(fill before signal_expiry)
```

‏החלונות המדויקים נגזרים מה־signal horizon ולא נקבעים כ־magic numbers.

### ‏`P1 — Preferred Default`: Queue Wait הוא חלק מתקציב Latency

‏ה־latency chain היא:

```text
signal
→ decision
→ submit
→ ack / booking uncertainty
→ queue wait
→ first executable fill
```

‏Queue wait אינו “זמן חינם”.

### ‏`P1 — Preferred Default`: Queue Quality היא Outcome משולב

‏לא נמדוד Queue רק לפי Fill Rate.

‏נמדוד יחד:

```text
fill_probability
fill_time
partial_fill_rate
post_fill_markout
missed_opportunity
queue_delay_cost
net_execution_outcome
```

### ‏`P1 — Preferred Default`: Marketable Limit נשאר Control

‏מקטע 37 קבע `Protected Marketable Limit` כ־Reference Execution baseline.

‏Queue research חייב להשוות passive tactics מול control שאינו תלוי באותה הנחת Queue.

‏כך ניתן לזהות האם “חיסכון ב־spread” באמת משפר Net Outcome או רק מייצר No-Fill ו־Adverse Selection.

### ‏`P2 — Challenger`: Queue Turnover / Flow-Aware Model

‏לאחר Baseline אפשר להוסיף:

```text
queue_turnover
recent_opposite_aggressive_flow
cancel_rate
book_churn
spread_ticks
signal_age
```

‏כדי לאמוד distribution של Time-to-Fill.

### ‏`P2 — Challenger`: Survival / Time-to-Event Model

‏במקום binary Fill/No-Fill ניתן לבנות:

```text
P(T_fill <= t | state)
```

‏עם treatment נכון ל־censoring כאשר Order בוטל לפני שידוע אם היה מתמלא מאוחר יותר.

### ‏`P2 — Challenger`: Execution Feasibility Layer

‏נפריד:

```text
prediction_score
execution_feasibility
```

‏ולא נערבב Queue features אוטומטית בתוך Alpha Score.

‏Candidate חזק Prediction-wise יכול לקבל `NO_TRADE` אם אין דרך סבירה להיכנס לפני Edge decay בלי לצרוך את רוב ה־edge.

### ‏`P3 — Advanced Option`: L2 Price-Level Volume-Ahead

‏אם L2 אמין וזמין, ניתן להעשיר את model ברמת price level/venue.

‏גם אז Aggregate Depth אינו Market-by-Order truth.

### ‏`P3 — Advanced Option`: Venue-Specific Queue Calibration

‏רק לאחר Routing evidence מספיק נוכל לשמור calibration לפי venue.

‏נדרשים samples מספיקים כדי למנוע Data Sparsity.

### ‏`P4 — Specialist`: Market-by-Order / Direct-Feed Reconstruction

‏MBO/L3 יכול לאפשר reconstruction עשיר יותר, אך מוסיף:

```text
data cost
sequence handling
recovery complexity
venue-specific semantics
storage
validation burden
```

‏לא ייכנס ל־MVP לפני שה־Edge מראה sensitivity מהותית ל־Queue assumptions.

### ‏`Avoid Unless Evidence`: ML Queue Prediction מוקדם

‏לא נתחיל ממודל ML שחוזה Fill probability כאשר:

- ‏ה־labels עצמם נבנו ממודל Fill חלש.
- ‏אין calibration data אמיתי.
- ‏אין treatment ל־censoring.
- ‏אין versioned queue assumptions.
- ‏אין simple baseline לנצח.

---

## ‏3. Why

‏ברובוט קצר־טווח, ההפרש בין:

```text
selected candidate
```

‏לבין:

```text
filled candidate in time at acceptable cost
```

‏יכול להיות כל ה־Edge.

‏Passive order יכול להיראות מצוין ב־Backtest אם המודל מניח `Touch == Fill`, ובאותו זמן להיות בלתי־ישים ב־forward execution בגלל:

- ‏volume ahead.
- ‏venue fragmentation.
- ‏queue reset.
- ‏partial fills.
- ‏cancel latency.
- ‏signal decay.
- ‏adverse selection.

‏לכן Queue הוא חלק מ־Execution Edge, לא פרט implementation שולי.

---

## ‏4. Facts / Judgments / Hypotheses

### ‏Facts

- ‏NBBO אינו Queue יחידה; venues מחזיקים books נפרדים.
- ‏Aggregated displayed size אינו מגלה בהכרח את ה־time priority של כל Order.
- ‏L1 אינו מספק individual order ordering.
- ‏L2 price-level depth עדיין אינו בהכרח MBO.
- ‏Touch של מחיר אינו מוכיח Fill.
- ‏Trade במחיר Limit אינו מוכיח בהכרח Fill אם volume ahead לא נצרך.
- ‏Partial Fill יוצר Exposure אמיתי.
- ‏Cancel request אינו terminal state.
- ‏Reconnect/Gaps יכולים לשבור Queue reconstruction.
- ‏Hidden/Reserve liquidity יכולה לגרום ל־visible depth להתחדש.
- ‏Broker/exchange execution report הוא מקור האמת ל־Real Fill.

### ‏Judgments

- ‏`Touch` ישמש רק optimistic bound.
- ‏`Trade-Through` ישמש simple control.
- ‏`Conservative Volume-Ahead` יהיה ה־preferred passive research baseline.
- ‏נריץ `Optimistic/Base/Conservative` ולא single deterministic truth.
- ‏Queue confidence יהיה first-class state.
- ‏Gap/reconnect מאפס confidence.
- ‏Marketable Limit יישאר control חשוב מול passive tactics.
- ‏L3/MBO יידחו עד sensitivity evidence.

### ‏Hypotheses

‏הטענות הבאות חייבות בדיקה:

- ‏Passive entry משפר Net Outcome ב־queue buckets מסוימים.
- ‏Trade-Through model מקרב יותר ל־real fill behavior מ־Touch model.
- ‏Volume-Ahead מוסיף predictive value מעבר ל־spread/liquidity/activity בלבד.
- ‏Passive fills סובלים adverse selection חזק יותר בחלק מה־regimes.
- ‏Top-2 עם execution feasibility טובה יכול לנצח Top-1 שקשה לבצע.
- ‏Queue turnover ו־recent aggressive flow משפרים Time-to-Fill calibration.
- ‏L2/MBO מוסיף מספיק value כדי להצדיק complexity/cost.

---

## ‏5. Queue Truth Domains

‏נפריד בין ארבע שכבות:

```text
Market Observation
Queue Estimate
Simulated Fill
Broker Fill Truth
```

‏הן אינן ניתנות להחלפה.

### ‏Market Observation

‏מה שראינו בפועל מה־feed:

```text
bid
ask
sizes
depth
trades
venue_if_known
sequence
provider timestamps
receive timestamps
```

### ‏Queue Estimate

‏הסקה:

```text
estimated_volume_ahead
confidence
estimated_turnover
fill_probability_by_deadline
```

### ‏Simulated Fill

‏תוצאה שמודל Replay/Backtest הפיק לפי assumptions versioned.

### ‏Broker Fill Truth

‏Fill אמיתי שמתקבל מה־execution/broker reconciliation.

---

## ‏6. Queue Position — What We Know vs What We Infer

### ‏Known

‏כאשר feed אמין:

```text
observed price level
observed displayed size
observed trades
observed quote updates
observed sequence continuity
receive time
```

### ‏Inferred

```text
volume ahead
which cancellation was ahead
which trade consumed our venue
hidden liquidity
actual venue booking time
exact queue position
```

‏Inference חייב להיות מסומן כ־Inference.

---

## ‏7. Venue Fragmentation

‏ה־Queue model חייב להיות venue-aware כאשר המידע קיים.

‏לדוגמה:

```text
NBBO bid size = 12,000
```

‏אינו אומר:

```text
12,000 shares ahead of our order
```

‏ייתכן שה־size מפוצל בין מספר venues וה־Order שלנו resting רק באחד מהם.

‏אם venue אינו ידוע בגלל Smart Routing:

```text
venue = UNKNOWN_OR_ROUTER_CONTROLLED
```

‏וה־confidence יורד בהתאם.

---

## ‏8. Initial Queue Estimate

‏ה־Baseline השמרני:

```text
observed_displayed_size_at_level
→ candidate_volume_ahead
```

‏עם metadata:

```text
quote_received_time
submit_time
ack_time
booking_time_if_known
observation_to_ack_latency
```

‏ככל שהפער בין observation לבין booking גדל, confidence יורד.

---

## ‏9. Queue Event Processing

‏המודל יכול לקבל events:

```text
QUOTE_ADD_OR_INCREASE
QUOTE_DECREASE
TRADE_AT_LEVEL
TRADE_THROUGH_LEVEL
SEQUENCE_GAP
SNAPSHOT_RESET
ORDER_ACK
PARTIAL_FILL
FULL_FILL
CANCEL_REQUESTED
CANCEL_CONFIRMED
REPLACE
RECONNECT
```

‏כל event מעדכן State באופן דטרמיניסטי לפי `queue_model_version`.

---

## ‏10. Qualifying Trade Volume

‏לא כל Trade מפחית Volume Ahead.

‏לפני decrement נדרש לבדוק ככל שה־data מאפשר:

```text
price relation
venue relation
trade condition
side / aggressor inference
ordering relative to quote update
feed quality
```

‏אם attribution אינו אמין:

```text
qualifying_volume_confidence = LOW
```

‏ולא משתמשים ב־volume כאילו הוא truth.

---

## ‏11. Cancellation Ambiguity

‏כאשר displayed size קטן ללא qualifying trade, ייתכן שהיה cancel.

‏אבל Aggregate Book אינו אומר האם ה־cancel היה:

```text
AHEAD_OF_US
BEHIND_US
MIXED
UNKNOWN
```

‏לכן cancellation credit הוא Scenario parameter.

### ‏Optimistic

‏חלק גדול מהירידה מקטין Volume Ahead.

### ‏Base

‏חלק שמרני מהירידה מקבל credit.

### ‏Conservative

‏מעט/אפס cancellation credit עד Evidence נוסף.

---

## ‏12. Hidden / Reserve Liquidity

‏Visible depletion אינו מבטיח שהרמה באמת התרוקנה.

‏Repeated replenishment יכול לסמן:

```text
reserve / iceberg-like behavior
or
new orders arriving
```

‏לכן נרשום pattern, לא intention.

‏לא נקבע “spoofing” או manipulation ללא Evidence מתאים.

---

## ‏13. Queue Confidence Contract

### ‏`HIGH`

‏רק כאשר:

- ‏sequence continuity אמינה.
- ‏venue attribution מתאים.
- ‏data freshness תקינה.
- ‏אין reconnect/gap מאז reconstruction.
- ‏booking uncertainty מוגבלת.

### ‏`MEDIUM`

‏כאשר book תקין אך יש uncertainty משמעותית לגבי cancels/booking.

### ‏`LOW`

‏כאשר model נשען בעיקר על aggregated data או event attribution חלש.

### ‏`UNKNOWN`

‏כאשר:

- ‏sequence gap unresolved.
- ‏reconnect ללא reconstruction.
- ‏feed state לא ברור.
- ‏venue/routing changed materially.
- ‏book snapshot stale.

‏`UNKNOWN` אינו “LOW עם קצת פחות confidence”; הוא State שמחייב Policy שמרני.

---

## ‏14. Fill Model Ladder

### ‏Model 0 — `TOUCH`

```text
price touches limit
=> fill
```

‏שימוש:

- ‏Optimistic upper bound.
- ‏Sanity comparison.

‏לא לשימוש כ־production-grade baseline.

### ‏Model 1 — `TRADE_THROUGH`

```text
market trades through our level
=> fill candidate
```

‏שימוש:

- ‏Simple conservative control.
- ‏Backtest כאשר אין depth fidelity מספקת.

### ‏Model 2 — `VOLUME_AHEAD`

```text
estimated_volume_ahead
- qualifying_consumption
- allowed_cancel_credit
=> remaining_ahead
```

‏כאשר queue נצרכת, Fill הופך אפשרי.

### ‏Model 3 — `PROBABILISTIC_QUEUE`

‏מוסיף:

```text
P(fill by deadline | state)
```

‏רק אחרי Calibration.

### ‏Model 4 — `MBO / VENUE-SPECIFIC`

‏Specialist research בלבד.

---

## ‏15. Fill Becomes Possible ≠ Fill Certain

‏כאשר estimated volume ahead מגיע לאפס, לא נטען אוטומטית Full Fill.

‏נדרש להתמודד עם:

- ‏remaining aggressor quantity.
- ‏hidden liquidity.
- ‏routing uncertainty.
- ‏partial fills.
- ‏event ordering.

‏Simulated Fill חייב Reason Code.

---

## ‏16. Simulated Fill Reason Codes

‏Baseline:

```text
TOUCH_ASSUMPTION
TRADE_THROUGH_EVIDENCE
QUEUE_DEPLETED
PARTIAL_QUEUE_DEPLETION
HIDDEN_LIQUIDITY_UNCERTAINTY
QUEUE_CONFIDENCE_TOO_LOW
```

‏אין `MAGICAL_FILL` ללא Market Evidence.

---

## ‏17. Partial Fill Contract

‏כאשר model/broker יוצר Partial Fill:

```text
filled_qty > 0
remaining_qty > 0
```

‏המערכת חייבת:

1. ‏לעדכן Position.
2. ‏לעדכן Pending Exposure.
3. ‏לרשום Fill Ledger.
4. ‏לחשב מחדש Risk.
5. ‏להחליט על remainder policy.
6. ‏להבטיח Exit path לכמות שכבר התמלאה.

‏Signal death אינו מוחק Position קיימת.

---

## ‏18. Cancel / Replace Contract

‏לכל working order נשמור:

```text
order_id
order_version
queue_estimate
queue_confidence
cancel_state
replacement_intent_id
```

‏המעבר:

```text
WORKING
→ CANCEL_REQUESTED
→ CANCEL_PENDING
→ CANCEL_CONFIRMED / FILLED / PARTIAL / UNKNOWN
```

‏Replacement אינו נשלח blind אם הוא יכול להכפיל Exposure.

---

## ‏19. Queue Reset Policy

‏ברירת המחדל המחקרית:

- ‏Price change => Queue reset.
- ‏Cancel + New => Queue reset.
- ‏Broker “Modify” => semantics unknown עד capability evidence.
- ‏Quantity increase => לא מניחים priority retention.
- ‏Quantity decrease => לא מניחים priority retention בלי venue/broker evidence.

‏אם semantics לא אומתו:

```text
assume_queue_priority_not_preserved
```

‏זו הנחה שמרנית.

---

## ‏20. Join / Improve / Cross

‏נפריד שלוש פעולות:

```text
JOIN
IMPROVE
CROSS
```

### ‏Join

‏מחיר פסיבי, Queue קיימת.

### ‏Improve

‏Price level חדש בתוך ה־spread אם tick structure מאפשר.

‏יכול לשפר price priority אך עדיין להיות passive.

### ‏Cross

‏Marketable execution עם price protection.

‏Queue wait קטן יותר, cost גבוה יותר.

‏הבחירה היא Expected Net Outcome problem — לא preference קבוע.

---

## ‏21. Queue Wait vs Signal Decay

‏נגדיר:

```text
signal_deadline = signal_time + signal_ttl
```

‏ונשווה:

```text
fill_probability_before_deadline
expected_queue_wait
remaining_edge_at_expected_fill
```

‏Passive queue מצוינת שמגיעה אחרי Signal death אינה נכס.

---

## ‏22. Expected Queue Wait

‏אומדן פשוט:

```text
expected_wait
≈ estimated_volume_ahead / recent_qualifying_flow_rate
```

‏אך נציג אותו כ־Estimate distribution, לא מספר ודאי.

‏Flow Rate משתנה ולכן נעדיף:

```text
P(fill < T)
```

‏על פני `expected_wait = 4.2s` בלבד.

---

## ‏23. Queue Turnover

‏Feature מחקרי אפשרי:

```text
queue_turnover
= recent_opposite_aggressive_volume_rate
  / displayed_volume_at_level
```

‏נבדוק Incremental Value בלבד.

---

## ‏24. Book Churn

‏נמדוד:

```text
adds_per_second
cancels_per_second
modifies_per_second
size_change_rate
```

‏High churn מוריד confidence בהערכה שנבנתה על Snapshot ישן.

---

## ‏25. Spread / Tick Regime

‏Queue tactics משתנות לפי:

```text
spread_ticks
relative_tick_size
```

‏ב־one-tick spread לעיתים אין Improve passive אפשרי.

‏ב־multi-tick spread יש יותר tactical states.

‏לכן Queue analysis נחתך גם לפי Spread Regime.

---

## ‏26. Queue Features vs Prediction Features

‏ברירת המחדל:

```text
Prediction Layer:
  predicts opportunity

Execution Layer:
  estimates executability / queue feasibility
```

‏לא נוסיף `estimated_volume_ahead` ל־Alpha Score רק מפני שהוא זמין.

‏אם בעתיד execution feasibility משפיעה על Candidate choice, היא תופיע ב־Decision layer באופן Explainable.

---

## ‏27. Queue-Aware NO_TRADE

‏`NO_TRADE` הוא Outcome נכון כאשר:

```text
expected_queue_wait > useful_signal_horizon
```

‏או:

```text
required_crossing_cost > remaining_edge_budget
```

‏או:

```text
queue_confidence == UNKNOWN
and passive execution is required for economics
```

‏אין חובה “לרדוף” כדי להפוך Signal ל־Trade.

---

## ‏28. Expected Net Edge After Queue

‏Conceptual decomposition:

```text
Expected Net Edge
= Signal Edge
- Expected Spread Cost
- Expected Slippage
- Queue Delay Cost
- Miss Probability Cost
- Adverse Selection Cost
- Fees / Commissions
```

‏כל term נמדד/מוערך בנפרד ככל האפשר.

---

## ‏29. Queue Delay Cost

‏נמדוד:

```text
edge_at_submit
edge_at_expected_fill
edge_at_actual_fill
```

‏כדי לאמוד כמה Edge נאכל בזמן המתנה.

---

## ‏30. Opportunity Cost of No-Fill

‏לכל No-Fill נשמור Forward Path לאחר expiry/cancel:

```text
missed_markout_100ms
missed_markout_500ms
missed_markout_1s
missed_markout_horizon
```

‏No-Fill אינו “אפס PnL”; הוא outcome עם opportunity consequences.

---

## ‏31. Adverse Selection

‏לכל Fill נשמור Post-Fill Markout.

‏ל־Buy:

```text
future_executable_price - fill_price
```

‏בצורה side-aware.

‏אם passive fills מציגים באופן עקבי markout שלילי יותר מה־control, זה Evidence שה־price improvement אינו free alpha.

---

## ‏32. Queue Quality Scorecard

‏לא ניצור Score יחיד בשלב הראשון.

‏נציג dimensions:

```text
fill_rate
fill_before_signal_expiry_rate
partial_fill_rate
time_to_fill_p50
time_to_fill_p95
time_to_fill_p99
post_fill_markout
missed_opportunity
queue_delay_cost
execution_shortfall
net_outcome
```

---

## ‏33. Censoring

‏Order שבוטל ב־3 שניות יוצר observation censored.

‏איננו יודעים מה היה קורה בשנייה 4.

‏לכן Fill Probability research לא יתייחס אוטומטית לכל Cancel כ־“לעולם לא היה מתמלא”.

---

## ‏34. Cancellation-Policy Bias

‏Dataset ההיסטורי מושפע מה־policy שבחרה אילו Orders להשאיר זמן רב יותר.

‏לכן:

```text
observed_fill_rate
```

‏אינו estimate ניטרלי של natural Fill Probability.

‏הוא outcome של Market + Policy.

---

## ‏35. Time-to-Fill as Survival Problem

‏לאחר שיש מספיק Evidence ניתן להשתמש ב־time-to-event methodology.

‏Targets אפשריים:

```text
filled_within_1s
filled_within_3s
filled_before_signal_expiry
```

‏עם treatment ל־censoring.

‏זה `P2/P3`, לא MVP.

---

## ‏36. Data Fidelity Ladder

```text
Bars
→ L1 Snapshots
→ L1 Event Stream
→ L2 Price Levels
→ Market-by-Order
→ Venue Direct Feed
```

‏יותר Fidelity מאפשר model עשיר יותר אך אינו מבטיח Value.

‏Promotion ב־data fidelity דורש Sensitivity evidence.

---

## ‏37. Minimum Data Requirements

‏ל־Baseline רציני נרצה לפחות:

```text
quote event/receive timestamps
trade event/receive timestamps
bid / ask / sizes
trade price / size / conditions if available
sequence/gap signals if available
order submit / ack / cancel / fill times
partial fill quantities
provider provenance
venue / route metadata when available
```

‏Second/minute bars לבדם אינם מספיקים ל־Queue research רציני.

---

## ‏38. L1 Baseline

‏עם L1 event stream ניתן:

- ‏ליצור Touch/Trade-Through controls.
- ‏לעקוב אחרי displayed size at best level.
- ‏להעריך churn מוגבל.
- ‏למדוד markout / missed opportunity.

‏לא ניתן לטעון exact Queue Position.

---

## ‏39. L2 Challenger

‏L2 price levels יכולים לשפר:

- ‏depth context.
- ‏available liquidity.
- ‏level depletion estimates.

‏אבל אינם בהכרח individual-order priority.

---

## ‏40. Market-by-Order Specialist

‏MBO יכול לשפר reconstruction כאשר:

- ‏sequence semantics ברורות.
- ‏snapshot recovery קיים.
- ‏venue identity ידועה.
- ‏hidden/reserve limitations מוכרות.

‏גם אז Broker Routing יכול לגרום לכך שה־Order בפועל אינו resting במקום שהמודל מניח.

---

## ‏41. Replay Contract

‏אותו:

```text
dataset
queue_model_version
fill_model_version
config
seed_if_any
```

‏חייב להפיק אותן simulated fills.

‏Queue model הוא חלק מ־Deterministic Replay manifest.

---

## ‏42. Replay State

‏לכל passive Order נשמור לפחות:

```text
queue_state_version
estimated_volume_ahead
queue_confidence
last_processed_market_event_id
last_processed_sequence
partial_filled_qty
remaining_qty
cancel_state
```

---

## ‏43. Gap Handling

‏כאשר מוזרק או מזוהה Gap:

```text
queue_confidence -> UNKNOWN
```

‏ואין להמשיך לייצר “precise” simulated fills על state פגום.

‏אפשר:

- ‏להמתין ל־snapshot rebuild.
- ‏לעבור למודל שמרני יותר.
- ‏לפסול passive-fill evaluation בחלון הפגום.

---

## ‏44. Restart Contract

‏אחרי Restart:

- ‏Broker orders/fills/positions משוחזרים authoritative.
- ‏Queue Estimate היסטורי אינו משוחזר כביטחון מזויף.
- ‏אם אין event continuity, confidence חוזר ל־`UNKNOWN`.
- ‏Working order אמיתי נשאר Risk גם אם Queue position לא ידועה.

---

## ‏45. Queue Telemetry

‏לכל passive attempt:

```text
initial_displayed_size
estimated_volume_ahead
queue_confidence
queue_model_version
fill_model_version
queue_age_ms
signal_age_ms
trade_volume_at_level
qualifying_trade_volume
cancel_volume_observed
cancel_credit_applied
partial_fill_count
filled_qty
remaining_qty
post_fill_markout
missed_opportunity
```

---

## ‏46. Market / Signal Telemetry at Transitions

‏בכל transition משמעותי נשמור:

```text
bid
ask
spread
bid_size
ask_size
depth_summary_if_available
rank
score
signal_age
remaining_edge
execution_tactic
```

‏עבור:

```text
submit
ack
partial_fill
cancel_request
cancel_confirm
replace
fill
expiry
```

---

## ‏47. Queue Buckets

‏לא נקבע buckets קשיחים כ־truth, אך research view יכול לכלול:

```text
volume_ahead_percentile
queue_turnover_percentile
order_age_bucket
signal_age_bucket
spread_ticks
```

‏Percentiles עדיפים לעיתים על absolute share counts בין Symbols שונים.

---

## ‏48. Segmentation

‏ננתח Queue לפחות לפי:

- ‏time of day.
- ‏spread regime.
- ‏liquidity percentile.
- ‏activity percentile.
- ‏volatility regime.
- ‏signal strength.
- ‏rank separation.
- ‏entry vs exit.
- ‏Buy vs Sell.

‏Cross-segmentation עמוק מדי יחכה ל־sample size מספק.

---

## ‏49. Entry vs Exit

‏Queue policy אינה סימטרית בהכרח.

‏ב־Entry קיימת אפשרות:

```text
NO_TRADE
```

‏ב־Exit כבר קיימת Exposure.

‏לכן Exit urgency / TTL / escalation יכולים להיות שונים.

‏אין להסיק מזה Order tactic קבוע; זה Policy research נפרד.

---

## ‏50. Safety / Risk Interaction

‏Queue אינה הרשאת Risk.

‏`Execution Feasibility` לעולם אינה עוקפת:

```text
Risk Approval
Safety Approval
Broker Readiness
Price Protection
```

‏אם Queue confidence נמוכה:

- ‏ניתן לחסום passive entry.
- ‏ניתן לעבור ל־control tactic אם עדיין בתוך Edge budget.
- ‏ניתן לבחור `NO_TRADE`.

‏לא מבצעים blind escalation.

---

## ‏51. Overfill Protection

‏לפני Replacement / Completion נחשב:

```text
current_position
+ working_fillable_qty
+ proposed_new_qty
```

‏ונבדוק Risk/Safety מחדש.

‏זה קריטי במיוחד ב־Cancel/Fill Race.

---

## ‏52. Queue-Aware Repricing

‏לא נשתמש בכלל:

```text
wait N ms
then cross automatically
```

‏במקום זאת re-evaluation כולל:

```text
signal still valid?
remaining edge?
queue estimate?
queue confidence?
spread?
rank persistence?
data fresh?
broker ready?
risk/safety still allow?
```

---

## ‏53. Sunk-Cost Protection

‏Order שחיכה זמן רב אינו מקבל “זכות” להישאר רק כי השקענו בו זמן.

‏החלטה:

```text
EV(keep waiting)
vs
EV(reprice)
vs
EV(cross)
vs
EV(abandon)
```

‏מבוססת על forward value מכאן והלאה.

---

## ‏54. Execution-Aware Candidate Selection

‏זה אינו Baseline ראשון.

‏לאחר שהמודל calibrated ניתן לבדוק:

```text
Top1 predictive score
vs
Top2 predictive score + much better executability
```

‏אך Candidate switch דורש:

- ‏explainability.
- ‏switching-cost accounting.
- ‏same-time counterfactual.
- ‏out-of-sample evidence.

---

## ‏55. Queue-Rank Counterfactual

‏Counterfactual אפשרי:

```text
chosen_top1_net_outcome
vs
top2_net_outcome_under_same_execution_model
```

‏אסור להשתמש ב־perfect-hindsight fills.

---

## ‏56. Calibration

‏כאשר מתקבלים Paper/forward broker outcomes, נשווה:

```text
predicted_fill_probability
actual_fill_frequency
```

‏ו־:

```text
predicted_time_to_fill
actual_time_to_fill
```

### ‏Reliability View

```text
predicted 0-20%
predicted 20-40%
predicted 40-60%
predicted 60-80%
predicted 80-100%
```

‏מול actual fill frequency.

---

## ‏57. Paper Limitations

‏Paper fills יכולים להיות פשוטים יותר מ־real venue queue behavior.

‏לכן Paper מתאים ל־:

- ‏order lifecycle.
- ‏partial-state handling אם הסביבה מייצרת זאת.
- ‏cancel/reconcile workflow.
- ‏telemetry.

‏הוא אינו calibration truth סופי ל־real Queue behavior.

---

## ‏58. Shadow Queue Measurement

‏ב־Shadow ניתן ליצור Hypothetical passive order ולמדוד:

```text
model fill outcome
model time to fill
model markout
model missed opportunity
```

‏מבלי לשלוח פעולה חיצונית.

‏זה useful research stage לפני כל operational promotion.

---

## ‏59. Queue Model Registry

‏לכל model נשמור:

```text
queue_model_id
queue_model_version
fill_model_version
assumptions
data_requirements
venue_scope
cancel_credit_policy
hidden_liquidity_policy
calibration_period
known_limitations
owner
status
```

---

## ‏60. Versioning

‏כל שינוי ב־:

- ‏cancel credit.
- ‏trade attribution.
- ‏initial volume-ahead.
- ‏partial-fill logic.
- ‏gap behavior.
- ‏confidence mapping.

‏מעלה `queue_model_version`.

‏אסור להשוות PnL בין גרסאות כאילו Fill semantics נשארו זהות.

---

## ‏61. Data Provenance

‏לכל Queue Estimate נשמור:

```text
provider
feed type
subscription / dataset version if applicable
venue metadata availability
exchange_timestamp_precision
receive_timestamp_precision
sequence availability
```

‏Cross-provider combination חייב time/semantics alignment.

---

## ‏62. Clock Integrity

‏Queue reconstruction רגישה במיוחד ל־event ordering.

‏לכן:

- ‏exchange/provider timestamps נשמרים.
- ‏receive timestamps נשמרים.
- ‏monotonic processing order נשמר.
- ‏clock skew health נמדד.

‏Second-level timestamps אינם מספיקים למחקר microstructure רציני.

---

## ‏63. Event Ordering

‏ה־Replay חייב להגדיר stable ordering כאשר timestamps זהים.

‏אפשר להשתמש ב־:

```text
provider_sequence
venue_sequence
ingest_sequence
event_id
```

‏לפי Availability.

‏Ambiguity חייב להיות מתועד ולא מוסתר.

---

## ‏64. Queue Model Tests

### ‏Unit Tests

- ‏Initial volume-ahead.
- ‏Trade-through recognition.
- ‏Cancellation credit.
- ‏Confidence transitions.
- ‏Partial-fill arithmetic.
- ‏Queue reset.

### ‏State-Machine Tests

- ‏Cancel request + Fill + Cancel confirmation.
- ‏Partial fill + signal death.
- ‏Replace after confirmed cancel.
- ‏Unknown state after disconnect.

### ‏Property Tests

```text
filled_qty <= submitted_qty unless broker correction is explicitly represented
```

```text
queue_confidence cannot remain HIGH across an unresolved sequence gap
```

```text
future events cannot change a historical fill decision
```

```text
cancel request alone cannot make pending exposure disappear
```

### ‏Replay Tests

‏אותו dataset/version/config => אותם simulated fills.

---

## ‏65. Golden Scenarios

‏Baseline suite:

```text
TOUCH_WITHOUT_FILL
TRADE_THROUGH_FILL
QUEUE_DEPLETION_PARTIAL_FILL
QUEUE_DEPLETION_FULL_FILL
CANCEL_FILL_RACE
QUEUE_RESET_AFTER_REPRICE
SEQUENCE_GAP_WHILE_RESTING
RECONNECT_WITH_WORKING_ORDER
HIDDEN_LIQUIDITY_LIKE_REPLENISHMENT
NO_FILL_PRICE_RUNS_AWAY
NO_FILL_PRICE_REVERSES
PASSIVE_FILL_NEGATIVE_MARKOUT
```

---

## ‏66. Failure Taxonomy

```text
Q01 TOUCH_ASSUMED_AS_FILL
Q02 QUEUE_AHEAD_UNDERESTIMATED
Q03 QUEUE_AHEAD_OVERESTIMATED
Q04 CANCEL_CREDIT_TOO_OPTIMISTIC
Q05 TRADE_ATTRIBUTION_ERROR
Q06 VENUE_ATTRIBUTION_ERROR
Q07 SEQUENCE_GAP_IGNORED
Q08 QUEUE_CONFIDENCE_FALSELY_HIGH
Q09 REPLACE_PRIORITY_ASSUMPTION_WRONG
Q10 CANCEL_FILL_RACE_MISMANAGED
Q11 PARTIAL_FILL_MISMANAGED
Q12 HIDDEN_LIQUIDITY_UNMODELED
Q13 SIGNAL_EXPIRED_IN_QUEUE
Q14 PASSIVE_ADVERSE_SELECTION
Q15 MISSED_OPPORTUNITY
Q16 PAPER_MODEL_MISMATCH
Q17 ROUTING_QUEUE_ASSUMPTION_WRONG
Q18 QUEUE_MODEL_DRIFT
```

---

## ‏67. Success Taxonomy

```text
QS01 GOOD_PASSIVE_PRICE_IMPROVEMENT
QS02 GOOD_NO_FILL_AVOIDED_BAD_MOVE
QS03 QUEUE_ESTIMATE_WELL_CALIBRATED
QS04 PARTIAL_FILL_HANDLED_CORRECTLY
QS05 CANCEL_AVOIDED_STALE_FILL
QS06 ABANDON_PRESERVED_EDGE
QS07 MARKETABLE_CONTROL_OUTPERFORMED_PASSIVE
QS08 PASSIVE_OUTPERFORMED_MARKETABLE_CONTROL
```

---

## ‏68. RCA for No-Fill

‏לכל No-Fill נשאל:

```text
What was the queue estimate?
What was confidence?
Did market touch / trade at / trade through?
How much qualifying volume appeared?
How much cancellation credit was assumed?
How old was signal at expiry?
Did price run away or reverse?
Was cancellation policy responsible?
Was the model too pessimistic?
```

‏Reason candidates:

```text
QUEUE_TOO_LONG
SIGNAL_EXPIRED
PRICE_MOVED_AWAY
CANCELED_BY_POLICY
DATA_CONFIDENCE_LOW
SPREAD_CHANGED
BROKER_STATE_UNCERTAIN
```

---

## ‏69. RCA for Bad Fill

```text
ADVERSE_SELECTION
SIGNAL_DECAYED_DURING_WAIT
LATE_FILL_AFTER_CANCEL_REQUEST
QUEUE_MODEL_TOO_OPTIMISTIC
EXECUTION_TOO_PASSIVE
PRICE_PROTECTION_TOO_LOOSE
PARTIAL_FILL_COMPLETION_CHASE
```

‏RCA מחזירה Hypothesis; היא אינה משנה Queue assumptions ישירות.

---

## ‏70. Success RCA

‏גם Fill מוצלח ייבדק:

- ‏האם Queue estimate היה calibrated?
- ‏האם outcome היה repeatable?
- ‏האם price improvement הצדיק wait?
- ‏האם Marketable Control היה טוב/גרוע יותר?

‏זה מגן מפני survivorship bias.

---

## ‏71. Queue Model Drift

‏ננטר:

```text
predicted_vs_actual_fill_rate
predicted_vs_actual_time_to_fill
queue_model_error
post_fill_markout_shift
partial_fill_rate_shift
cancel_fill_race_shift
```

‏Drift מוביל ל־RCA לפני recalibration.

---

## ‏72. Sensitivity Before Data Spend

‏לפני רכישת MBO/L3 יקר יותר, נמדוד:

```text
How much does net outcome move
when fill assumptions move
from optimistic to base to conservative?
```

### ‏אם התוצאה יציבה

‏Queue precision אינה bottleneck מרכזי כרגע.

### ‏אם התוצאה קורסת

‏Execution/Queue fidelity הופכת research priority.

---

## ‏73. Execution Robustness Gate

‏Strategy שמייצרת edge רק תחת `TOUCH` model אינה מוכנה לקידום.

‏נרצה לראות שה־economic conclusion אינה תלויה לחלוטין ב־optimistic fills.

---

## ‏74. Size Sensitivity

‏נמדוד:

```text
fill_rate(size)
time_to_fill(size)
partial_fill_rate(size)
slippage(size)
```

‏Small size יכול להקל על capacity אך אינו מעניק Time Priority.

---

## ‏75. Entry / Exit Symmetry

‏אסור:

```text
entry = conservative passive queue
exit = free perfect fill
```

‏Backtest חייב להשתמש assumptions עקביים או להסביר במפורש את הבדל ה־urgency.

---

## ‏76. Queue Dashboard

‏Research/operations view יכול להציג:

```text
working_passive_orders
queue_confidence
estimated_volume_ahead
queue_age
signal_age
fill_probability_by_deadline
partial_filled_qty
cancel_pending_count
live_vs_model_fill_divergence
```

‏אין צורך להציג exact queue number אם אין Truth.

---

## ‏77. Alerts / Safety Signals

‏Alert-worthy examples:

```text
QUEUE_CONFIDENCE_UNKNOWN_WHILE_PASSIVE_ENTRIES_CONTINUE
SEQUENCE_GAP_WITH_WORKING_ORDER
CANCEL_LATENCY_TAIL_SHIFT
PARTIAL_FILL_RATE_SHIFT
LIVE_FILL_RATE_DIVERGES_FROM_MODEL
QUEUE_MODEL_HEALTH_DEGRADED
```

‏Alerts אינם Recovery logic; State/Safety layer מבצע containment.

---

## ‏78. Required Data / Evidence

‏כדי להעריך Queue policy נדרש לפחות:

- ‏Raw/reconstructable quote + trade stream.
- ‏Event + receive timestamps.
- ‏Order submit/ack/cancel/fill lifecycle.
- ‏Partial fill quantities.
- ‏Signal/Rank/Score snapshots בזמן Submit/Fill.
- ‏Market state בזמן Order transitions.
- ‏Fill/no-fill forward labels.
- ‏Provider/venue provenance.
- ‏Gap/reconnect markers.
- ‏Fill-model and queue-model versions.

---

## ‏79. Metrics

### ‏Prediction / Calibration

```text
fill_probability_calibration
fill_before_deadline_calibration
time_to_fill_error
queue_confidence_accuracy_proxy
```

### ‏Execution

```text
fill_rate
partial_fill_rate
time_to_fill_p50/p95/p99
cancel_latency_p50/p95/p99
cancel_fill_race_rate
order_churn
```

### ‏Economics

```text
spread_saved
queue_delay_cost
missed_opportunity
post_fill_markout
implementation_shortfall
net_outcome
```

### ‏Robustness

```text
optimistic_vs_base_gap
base_vs_conservative_gap
venue_concentration
regime_concentration
size_sensitivity
```

### ‏Operations

```text
sequence_gap_count
queue_unknown_duration
queue_rebuild_count
queue_model_divergence
```

---

## ‏80. Promotion Criteria

‏Queue model/tactic עולה שלב רק אם:

1. ‏Assumptions כתובות ו־versioned.
2. ‏אין future leakage.
3. ‏Gap/reconnect behavior conservative.
4. ‏Partial fills ו־cancel races נתמכים.
5. ‏Replay deterministic.
6. ‏No-Fill נשמר ונותח.
7. ‏Markout נמדד, לא Fill Rate בלבד.
8. ‏התוצאה שורדת optimistic/base/conservative comparison.
9. ‏Calibration סבירה ב־forward/Paper evidence הזמין.
10. ‏Incremental net value קיים מול simpler execution baseline.
11. ‏Complexity/Data cost מוצדקים.
12. ‏אין guardrail regression ב־Risk/Safety/Latency.

---

## ‏81. Rejection Criteria

‏נדחה Queue model/tactic אם:

- ‏הוא מניח Touch=Fill כאמת.
- ‏הוא מציג exact position ללא supporting data.
- ‏הוא שומר confidence גבוה אחרי unresolved gap.
- ‏הוא מתעלם מ־No-Fill.
- ‏הוא מתעלם מ־adverse selection.
- ‏הוא דורש future information.
- ‏הוא משפר Fill Rate אך פוגע Net Outcome.
- ‏הוא רווחי רק בתרחיש optimistic.
- ‏הוא overfit ל־symbol/venue/time bucket קטן.
- ‏הוא מוסיף L3/MBO complexity בלי sensitivity evidence.

---

## ‏82. Failure Modes

- ‏Touch-fill optimism.
- ‏Venue fragmentation ignored.
- ‏Displayed size treated as exact volume ahead.
- ‏Cancel decreases credited entirely as ahead.
- ‏Wrong aggressor-side inference.
- ‏Hidden liquidity ignored.
- ‏Sequence gaps ignored.
- ‏Queue estimate survives reconnect falsely.
- ‏Replace incorrectly preserves priority.
- ‏Partial fill ignored.
- ‏Cancel pending treated as cancelled.
- ‏Replacement creates duplicate exposure.
- ‏Paper fills treated as real queue calibration.
- ‏No-fill sample bias.
- ‏Cancellation policy censoring ignored.
- ‏Per-symbol overfitting.
- ‏Perfect-fill hindsight counterfactuals.

---

## ‏83. What I Would Avoid Initially

- ‏Perfect L3 reconstruction.
- ‏Independent venue router.
- ‏ML Fill model.
- ‏Hundreds of queue parameters.
- ‏Per-symbol queue exceptions.
- ‏Exact queue-position UI.
- ‏Venue-specific logic לפני Routing evidence.
- ‏Automatic Candidate replacement לפי Queue בלבד.
- ‏Dynamic policies שלא ניתן להסביר.

---

## ‏84. What to Add Later

‏רק אם Evidence מצדיק:

- ‏L2 venue-aware depletion.
- ‏MBO/L3 reconstruction.
- ‏Survival/time-to-fill models.
- ‏Venue-specific calibration.
- ‏Queue-aware candidate arbitration.
- ‏Microprice/imbalance execution features.
- ‏Champion/Challenger Queue Models.
- ‏Advanced hidden-liquidity/replenishment features.

---

## ‏85. Research Program

### ‏Experiment Q1 — Touch vs Trade-Through vs Volume-Ahead

‏אותם signals, אותו exit model, אותם costs.

‏Compare:

```text
trade_count
fill_rate
net_outcome
markout
missed_opportunity
```

### ‏Experiment Q2 — Passive vs Marketable Control

‏מטרת המחקר:

```text
Does spread saving survive
missed fills + delay + adverse selection?
```

### ‏Experiment Q3 — Queue Wait Sensitivity

‏Surface:

```text
max_wait × volume_ahead_percentile × net_outcome
```

### ‏Experiment Q4 — Cancel/Replace Value

‏Compare:

```text
keep queue
vs
reprice/reset queue
```

‏כולל request cost ו־cancel/fill race.

### ‏Experiment Q5 — Partial Fill Policy

‏Compare:

```text
keep_partial
cancel_remainder
attempt_completion
```

‏ב־Replay/Shadow בלבד עד evidence.

### ‏Experiment Q6 — Queue Feasibility vs Candidate Rank

‏האם Execution Feasibility מוסיפה value מעל Prediction Rank בלי selection overfit?

### ‏Experiment Q7 — Data Fidelity Value

‏L1 vs L2 vs richer data על אותו Research Question.

‏Promotion רק אם higher fidelity משנה Decision quality באופן חומרי.

---

## ‏86. Robustness Requirements

‏נחפש Plateaus ולא Magic Thresholds.

‏למשל:

```text
max_wait
cancel_credit
volume_ahead_limit
```

‏צריכים להציג robust region across days/regimes ולא spike צר.

‏Out-of-sample chronology מחייבת כמו במקטע 23.

---

## ‏87. Concentration Checks

‏כל שיפור Queue חייב להיבדק מול:

```text
unique_days
unique_symbols
time_of_day
spread_regime
liquidity_regime
venue_if_known
```

‏שיפור שמגיע מכמה episodes בודדים אינו מספיק.

---

## ‏88. Relationship to Segment 21

‏מקטע 21 קבע:

```text
Last != Fill
Touch != Fill
L1 execution fidelity baseline
```

‏מקטע 38 מעמיק במיוחד את passive-limit side של אותו contract:

- ‏Queue uncertainty.
- ‏volume ahead.
- ‏partial fills.
- ‏cancel/replace priority.
- ‏fill-model sensitivity.

---

## ‏89. Relationship to Segment 37

‏מקטע 37 קבע `ExecutionPlan` ו־Protected Marketable Limit control.

‏מקטע 38 נותן ל־Passive/Adaptive tactics את המודל הנדרש כדי לענות:

```text
Is waiting actually worth it?
```

‏בלי Queue model, Adaptive Escalation אינה ניתנת להערכה אמינה.

---

## ‏90. Relationship to Segments 27–28

‏Replay מספק deterministic market evolution.

‏Shadow/Paper מספקים forward lifecycle evidence.

‏Queue model הוא bridge ביניהם:

```text
Replay market events
→ simulated queue outcome
→ forward broker lifecycle evidence
→ calibration / RCA
```

---

## ‏91. Relationship to Segments 33–36

‏Production State, Recovery, Observability ו־Safety מחייבים:

- ‏Working orders כ־Risk.
- ‏Cancel pending כ־State.
- ‏Unknown Queue confidence visible.
- ‏Reconnect בלי false certainty.
- ‏No new risk תחת unknown broker state.

‏Queue logic אינה עוקפת אף אחד מהם.

---

## ‏92. Relationship to Segment 39

‏מקטע 38 מניח שחשוב לדעת באיזו Queue אנחנו.

‏מקטע 39 ישאל מי בכלל בוחר את ה־venue:

```text
Smart Routing
vs
Direct Routing
```

‏Routing semantics יכולים לשנות את כל ההנחות של venue-level Queue model.

---

## ‏93. Confidence

### ‏High Confidence

- ‏`Touch != Fill`.
- ‏Queue estimate חייב uncertainty.
- ‏Cancel pending / partial fills חייבים state מפורש.
- ‏No-Fill ו־Markout חייבים להיכלל בהערכה.
- ‏Gap/reconnect מורידים confidence.
- ‏Broker fill הוא Real Truth.

### ‏Medium Confidence

- ‏Trade-Through כ־simple conservative control מתאים ל־Baseline research.
- ‏Conservative Volume-Ahead הוא השלב הבא הנכון לפני MBO complexity.
- ‏Three-scenario sensitivity מספקת evidence שימושי לפני data spend.

### ‏Low / Hypothesis

- ‏איזה queue threshold עדיף.
- ‏איזה wait time עדיף.
- ‏איזה cancel credit calibrated נכון.
- ‏באילו regimes Passive מנצח Marketable.
- ‏האם Queue-aware candidate selection מוסיף value.

---

## ‏94. Time-Sensitive Facts

‏המקטע אינו מקבע כאן Broker/Venue-specific matching rules, amend semantics, routing behavior או data entitlements כמספרים נצחיים.

‏אם בעתיד נשענים תפעולית על:

- ‏Priority retention after modify.
- ‏MBO feed semantics.
- ‏venue matching algorithm.
- ‏broker route metadata.
- ‏direct-routing capability.

‏נדרש אימות עדכני מול המקור הרשמי של אותו Venue/Broker לפני שימוש.

‏לא נדרש Web verification חדש למקטע 38 עצמו משום שה־Baseline נכתב במכוון capability-agnostic ואינו מניח semantics ספציפיים לספק/venue.

---

## ‏95. User-Specific Application

‏עבור Scanner קצר־טווח שסורק אלפי מניות ומנסה לבחור מעט candidates, סדר הבדיקה המומלץ במחקר הוא:

```text
1. Is the signal still valid?
2. Is whole-market ranking trustworthy?
3. Is fresh executable price available?
4. Is passive execution economically relevant at all?
5. What is the queue-confidence level?
6. What is the estimated volume ahead / turnover?
7. What is P(fill before signal expiry)?
8. What is the missed-opportunity cost if not filled?
9. What is the adverse-selection markout if filled?
10. Does passive beat protected marketable control net of all costs?
11. Is the result robust across fill models?
12. If not executable, is NO_TRADE better than chasing?
```

‏הנקודה החשובה במיוחד לשיטה קצרה:

```text
A good prediction that cannot be entered in time
is not an executable opportunity.
```

---

## ‏96. Concrete Baseline Contract

```text
ON passive execution attempt:
    persist signal / decision / tactic context
    capture fresh market state
    create versioned queue estimate
    assign explicit queue confidence
    start signal + order clocks

WHILE working:
    process only point-in-time events
    update volume-ahead conservatively
    track trade-through / depletion evidence
    track partial fills immediately
    keep pending exposure in risk
    re-evaluate signal / edge / safety before escalation

ON gap/reconnect:
    queue confidence -> UNKNOWN
    do not invent continuity

ON cancel:
    enter CANCEL_PENDING
    continue accepting fill events
    reconcile before risky replacement when needed

ON fill:
    broker fill = truth
    record signal age / queue estimate / markout

ON no-fill:
    persist forward missed-opportunity path

RESEARCH:
    compare Touch / Trade-Through / Volume-Ahead
    compare Optimistic / Base / Conservative
    compare Passive vs Protected Marketable Limit
    calibrate against forward evidence

PROMOTE complexity only when:
    simple model is materially insufficient
    and higher-fidelity data/model adds robust net value
```

---

## ‏97. Recommendation Summary

```text
P0
- Touch is not Fill
- Broker Fill Truth separate from simulated fills
- Queue is estimate + confidence
- Gap/reconnect => confidence UNKNOWN
- Working order = pending exposure
- Cancel pending is real state
- Partial fill = real exposure
- No future queue knowledge
- Prefix invariance

P1
- Touch only optimistic upper bound
- Trade-Through simple control
- Conservative Volume-Ahead preferred passive baseline
- Optimistic/Base/Conservative scenarios
- Fill probability before signal deadline
- Queue wait included in end-to-end latency
- No-Fill + Markout both measured
- Protected Marketable Limit remains execution control

P2
- Flow-aware / queue-turnover model
- Survival/time-to-fill modeling
- Execution feasibility layer

P3
- L2/venue-aware queue modeling
- Venue-specific calibration

P4
- MBO/L3/direct-feed reconstruction
- Advanced ML queue prediction only after calibrated baseline

AVOID
- Touch==Fill production backtests
- Exact queue claims without truth data
- Full cancellation credit by default
- Priority assumptions across replace/modify
- Paper fills as Live queue truth
- Optimizing Fill Rate alone
- L3 complexity before sensitivity evidence
```

‏המסר המסכם:

> ‏**Queue Position אינה מספר קסום שאנחנו “יודעים”. היא distribution של uncertainty שצריך לקשור ל־deadline, ל־signal decay ול־post-fill quality. אם ה־Edge לא שורד assumptions שמרניים על Fill, אין לנו Execution Edge מוכח.**
