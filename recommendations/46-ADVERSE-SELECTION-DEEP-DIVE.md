# ‏46 — Recommendation Sheet: Adverse Selection Deep Dive

> ‏מקור לימודי עיקרי: `../46-ADVERSE-SELECTION-DEEP-DIVE.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי, ארכיטקטוני ומתודולוגי ל־`Adverse Selection` עבור רובוט `Short-Horizon Momentum`, כך שהמערכת לא תמדוד Execution לפי Fill Rate או מחיר Fill בלבד, אלא לפי `Signal → Order → Queue → Fill → Markout → Net Edge Retained`, ותשווה Fills ל־No-Fills, Passive ל־Aggressive, Fresh ל־Stale ו־Good Fills ל־Toxic Fills באופן point-in-time, confidence-aware ו־execution-aware.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי.

---

## ‏1. Decision

‏`Fill` יוגדר אצלנו כאירוע מידע, לא כראיה אוטומטית ל־Execution מוצלח.

‏ה־Baseline:

```text
Signal / Candidate
→ Execution Intent
→ Queue / Route / Order State
→ Fill / Partial / No Fill / Cancel
→ Post-Fill Markout Curve
→ Missed Opportunity / Selection Gap
→ Net Execution Value
→ RCA / Calibration
→ Policy Promotion / Rejection
```

‏העיקרון המחייב:

```text
Good Fill Price != Good Execution.
High Fill Rate != High Execution Quality.
Fill is conditional evidence.
```

‏לכל Execution Policy נפריד לפחות שתי שאלות:

```text
Layer 1: P(Fill)
Layer 2: Expected Outcome | Fill
```

‏Execution Model שאופטימלי רק בשכבה הראשונה אינו מספיק.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Multi-Horizon side-aware Markout לכל Fill

‏לכל Fill אמיתי נשמור Markout במספר horizons.

‏Baseline:

```text
markout_100ms
markout_500ms
markout_1s
markout_2s
markout_5s
markout_10s
```

‏אם data fidelity תומכת גם horizons קצרים/ארוכים יותר, הם יתווספו בגרסה מפורשת.

‏נשתמש ב־side-normalized convention:

```text
Side = +1 for Buy
Side = -1 for Sell

SignedMarkout(h)
=
Side * (FutureReferencePrice(h) - FillPrice)
```

‏כך Markout חיובי הוא favorable לשני הצדדים.

### ‏`P0 — Required`: ‏Benchmark מבוסס Quote, לא `Last` בלבד

‏`Last` אינו benchmark יחיד קביל לניתוח microstructure קצר־טווח.

‏נשמור לפחות:

```text
future_mid
future_bid
future_ask
```

‏ובמחקר נבחר benchmark בהתאם לשאלה:

```text
Mid Markout          -> microstructure movement
Executable Markout   -> side-aware executability
Microprice Markout   -> optional diagnostic
```

‏הבחירה והגרסה חייבות להיות מפורשות.

### ‏`P0 — Required`: ‏Passive ו־Aggressive אינם אותה Population

‏כל Fill יסווג לפחות:

```text
PASSIVE
AGGRESSIVE
MIDPOINT_OR_OTHER
UNKNOWN
```

‏כאשר ניתן, נשמור גם:

```text
liquidity_flag
venue
route
order_type
execution_policy_version
```

‏אסור לאגד Markout של Passive/Aggressive ללא dimension ברור.

### ‏`P0 — Required`: ‏Filled / Partial / Cancelled / Unfilled נשמרים כולם

‏Dataset מחקרי חייב לכלול:

```text
FILLED
PARTIALLY_FILLED
CANCELLED_UNFILLED
CANCELLED_AFTER_PARTIAL
EXPIRED_UNFILLED
REJECTED
UNKNOWN_EFFECT
```

‏בלי `Unfilled Attempts` אי אפשר למדוד היטב:

```text
missed opportunity
selection bias
fill/no-fill selection gap
cancel policy value
```

### ‏`P0 — Required`: ‏Fill Truth נשאר Broker/Execution Truth

‏Markout לעולם לא משנה מהו Fill אמיתי.

```text
Broker / Venue Execution Event
→ Fill Truth

Market Data after Fill
→ Outcome Measurement
```

‏Simulated Fill ו־Real Fill נשמרים כמקורות שונים.

### ‏`P0 — Required`: ‏Fill Conditioned Outcome

‏לכל Policy נשווה:

```text
Outcome | Signal
Outcome | Filled
Outcome | Not Filled
```

‏ולא נניח שה־Filled subset הוא sample אקראי.

### ‏`P0 — Required`: ‏Signal Age / Queue Age הם חלק מ־Fill Context

‏לכל Fill נשמור לפחות:

```text
signal_age_ms
intent_age_ms
order_age_ms
time_to_fill_ms
queue_age_ms_if_estimated
```

‏Fill שהגיע אחרי שה־signal התיישן אינו “Execution success” רק מפני שהתמלא.

### ‏`P0 — Required`: ‏Cancel/Fill Race הוא Outcome אמיתי

‏נשמור:

```text
cancel_requested_at
cancel_ack_at
cancel_effective_at_if_known
fill_time
```

‏ונסווג:

```text
FILL_BEFORE_CANCEL_REQUEST
FILL_AFTER_CANCEL_REQUEST_BEFORE_CONFIRM
NO_FILL_CANCELLED
UNKNOWN_CANCEL_EFFECT
```

‏`CancelRequested != Cancelled` נשאר invariant.

### ‏`P0 — Required`: ‏Partial Fill הוא Exposure + Information

‏כל execution חלקי:

```text
updates position truth
updates remaining quantity
gets its own markout
updates parent-order context
```

‏ל־Parent Order נוכל לחשב `fill-weighted markout`, אבל לא נמחוק את ה־sequence של fills.

### ‏`P0 — Required`: ‏Point-in-Time correctness

‏כל pre-fill feature שנכנס ל־toxicity analysis חייב להיות ידוע בזמן הרלוונטי:

```text
flow_at_decision
book_at_decision
flow_before_fill
book_before_fill
signal_age
rank_state
spread
volatility/regime
```

‏Future markout הוא Label, לא Feature Live.

### ‏`P0 — Required`: ‏Data Quality לפני Attribution

‏Adverse-selection conclusion אינו קביל אם:

```text
fill mapping unknown
timestamps inconsistent
market-data source stale
sequence gap unresolved
book invalid
symbol mapping ambiguous
clock domains unknown
```

‏במצבים כאלה classification יכול להיות:

```text
AS_DATA_QUALITY_UNKNOWN
```

‏ולא סיפור מומצא.

### ‏`P1 — Preferred Default`: ‏Start with Measurement, not Toxicity Model

‏השלב הראשון אינו model שמחליט.

‏הוא Measurement Contract:

```text
Fill Context
+ Multi-Horizon Markout
+ No-Fill Context
+ Cancel Context
+ Net Outcome
```

‏רק לאחר שיש corpus יציב נבנה Shadow Gate.

### ‏`P1 — Preferred Default`: ‏KPI ראשון — Median 1s Markout by Execution Mode

‏Baseline dashboard:

```text
median_markout_100ms
median_markout_1s
median_markout_5s
p10_markout_1s
toxic_fill_rate
fill_rate
missed_opportunity_after_no_fill
signal_age_at_fill
cancel_fill_race_rate
net_edge_retained
```

‏לא נשתמש ב־average אחד על כל השוק.

### ‏`P1 — Preferred Default`: ‏Simple Bucketed Toxicity Research

‏לפני ML:

```text
execution_mode
× signal_age_bucket
× spread_bucket
× flow_state
× book_state
× regime
→ markout distribution
```

‏נבחר hierarchy קטנה ולא combinatorial explosion.

### ‏`P1 — Preferred Default`: ‏Shadow Toxicity Gate בלבד

‏אחרי Measurement יציב:

```text
actual_policy_action
vs
shadow_toxicity_recommendation
```

‏נמדוד:

```text
decision_impact_rate
changed_decision_outcome
incremental_net_ev
missed_winner_rate
toxic_fill_avoided_rate
```

‏רק לאחר Evidence OOS נשקול Promotion.

---

## ‏3. למה זו ברירת המחדל

‏`Adverse Selection` הוא אזור מסוכן ל־post-hoc storytelling.

‏אחרי Fill רע קל לומר:

```text
flow was toxic
book collapsed
we were selected
```

‏אבל כדי שהטענה תהיה מקצועית צריך:

```text
pre-fill evidence
known timestamps
known order state
known execution mode
known benchmark
multi-horizon outcome
population comparison
```

‏לכן Measurement קודמת Prediction, ו־Prediction קודמת Policy.

---

## ‏4. Core Distinctions

### ‏Slippage

```text
Fill Price
vs
Decision / Arrival / Benchmark Price
```

### ‏Markout

```text
Market State after Fill
vs
Fill Price
```

### ‏Fill Probability

```text
How likely are we to execute?
```

### ‏Adverse Selection

```text
Conditional on execution,
how unfavorable is the subsequent market move?
```

### ‏Missed Opportunity

```text
What happened when we did not execute?
```

### ‏Net Execution Value

```text
Fill Benefit
- Adverse Selection
- Fees
- Slippage
- Missed Opportunity
- Latency Cost
```

‏אין metric יחיד שמחליף את כולם.

---

## ‏5. Markout Contract

‏לכל Markout נגדיר:

```text
fill_id
side
fill_time_basis
horizon
reference_price_type
reference_source
future_price_time
value_price
value_bps
value_ticks
quality
markout_version
```

### ‏Time Basis

‏נשמור לפחות:

```text
fill_exchange_time_if_available
fill_received_time
fill_processed_time
```

‏לניתוח execution economics ה־anchor הוא actual fill event.

‏לניתוח system latency נמדוד גם local receive/process delays.

### ‏Normalization

‏נשמור במידת האפשר:

```text
markout_price
markout_bps
markout_ticks
markout_as_fraction_of_spread
```

‏כך נוכל להשוות symbols בעלי tick/spread שונים.

---

## ‏6. Markout Curve, לא Horizon יחיד

‏Baseline curve:

```text
100ms
500ms
1s
2s
5s
10s
```

‏ה־curve עוזרת להפריד:

```text
immediate toxicity
short-lived microstructure shock
persistent adverse move
later strategy recovery
```

‏Markout שלילי ב־100ms וחיובי ב־5s אינו אותו Failure Mode כמו Markout שלילי בכל horizons.

---

## ‏7. Distribution, לא Average בלבד

‏לכל segment נשמור:

```text
count
mean
median
p10
p25
p75
p90
worst_tail_mean
positive_markout_rate
```

‏Tail metric יכול להיות:

```text
mean(markout | worst 5%)
```

‏ה־thresholds והאחוזים יהיו versioned research choices, לא Constants קדושים.

---

## ‏8. Fill Context Contract

```text
FillContext
- fill_id
- parent_order_id
- order_version
- intent_id
- decision_id
- instrument_id
- side
- fill_price
- fill_qty
- fill_time
- execution_mode
- passive_aggressive_class
- venue
- route
- liquidity_flag?
- order_type
- strategy_version
- execution_policy_version
- signal_age_ms
- order_age_ms
- time_to_fill_ms
- queue_age_ms?
- queue_confidence?
- spread_ticks
- spread_bps
- flow_snapshot_id
- book_snapshot_id
- flow_imbalance
- flow_confidence
- book_imbalance
- microprice_offset
- rank
- rank_age
- rank_gap
- regime
- market_data_quality
- provider_version
```

‏`?` מציין optional/unknown; Unknown אינו Zero.

---

## ‏9. Parent Order / Partial Fill Contract

‏לכל Parent Order:

```text
parent_order_id
requested_qty
filled_qty
remaining_qty
first_fill_time
last_fill_time
fill_count
weighted_avg_fill_price
fill_weighted_markout_1s
fill_weighted_markout_5s
cancel_state
terminal_state
```

‏לכל Child Fill נשמרת הרשומה המקורית.

‏לא מסתפקים ב־VWAP סופי שמסתיר fill sequence.

---

## ‏10. First Fill / Last Fill

‏נמדוד בנפרד:

```text
first_fill_markout
last_fill_markout
```

‏Hypothesis חשובה:

```text
Does continuing to wait after first fill
increase toxicity on later fills?
```

‏אם כן, זה יכול להצדיק Experiment על remainder cancellation — לא כלל Production אוטומטי.

---

## ‏11. Fill / No-Fill Selection Gap

‏Baseline Research Metric:

```text
SelectionGap(h)
=
E[forward_outcome_h | filled, context]
-
E[forward_outcome_h | not_filled, similar_context]
```

‏Context matching ראשוני:

```text
symbol group
time-of-day
signal score bucket
spread bucket
flow state
book state
volatility/regime
```

‏לא נשתמש בהשוואה נאיבית Filled vs Unfilled על כל הדאטה.

---

## ‏12. The Dangerous Pattern

‏Pattern שמחייב RCA עמוק:

```text
Unfilled Attempts
→ market moves favorably without us

Filled Attempts
→ market moves adversely after us
```

‏זה יכול להצביע שה־Passive Policy מקבלת דווקא states גרועים.

‏אבל causal conclusion דורשת controls ו־Replay fidelity.

---

## ‏13. Queue Position Relationship

‏מקטע 38 נשאר Source of Truth ל־Fill Probability/Queue uncertainty.

‏מקטע 46 מוסיף:

```text
Queue Position / Fill Probability
+
Conditional Markout
```

‏העיקרון:

```text
Good Queue Priority
!=
Good Economic Outcome
```

‏Priority גבוהה יכולה להגדיל P(Fill) ובמקביל להגדיל exposure ל־toxic flow.

---

## ‏14. Queue Value

‏Conceptual objective:

```text
QueueValue
≈ ExpectedFillBenefit
- ExpectedAdverseSelection
- OpportunityCost
```

‏לא:

```text
QueueValue = P(Fill)
```

---

## ‏15. Cancel / Fill Race

‏Golden timeline:

```text
Signal deteriorates
→ Cancel requested
→ Aggressor reaches our order
→ Fill occurs
→ Cancel confirmed
→ Negative markout
```

‏נשמור:

```text
cancel_decision_time
cancel_send_time
cancel_ack_time
cancel_effective_time_if_known
fill_time
```

‏ונפריד:

```text
Decision latency
Command latency
Broker/route latency
Unknown venue latency
```

---

## ‏16. Stale Fill

‏נגדיר `stale_fill_candidate` כאשר Fill מגיע לאחר שינוי מהותי ב־Decision Context.

‏Examples:

```text
signal_expired
rank_changed materially
flow reversed
book deteriorated
spread widened
regime changed
market_generation changed
```

‏זה classification מחקרי; הוא לא מוחק Fill Truth.

---

## ‏17. Stale Fill Rate

```text
stale_fill_rate
=
stale_fill_count / total_fills
```

‏ננתח לפי:

```text
execution_mode
order_age
signal_age
cancel_state
```

---

## ‏18. Passive Adverse Selection

‏Classic pattern:

```text
Market moves toward our resting order
→ we fill
→ market continues through us
```

‏אבל לא כל negative markout מוכיח informed counterparty.

‏הסיבות האפשריות כוללות:

```text
market information
liquidity withdrawal
stale signal
queue wait
system latency
broad market move
random variance
```

‏לכן Failure Attribution נשאר probabilistic.

---

## ‏19. Aggressive Adverse Selection / Self-Adverse Selection

‏גם aggressive execution יכולה להיות רעילה:

```text
Signal appears
→ pipeline delays
→ price moves
→ we chase
→ cross spread
→ move exhausts / reverses
```

‏זהו `self_adverse_selection_candidate`.

‏המטרה אינה להאשים counterparty אלא למדוד האם Execution Timing שלנו מחק את ה־edge.

---

## ‏20. Signal Age at Fill

‏זה KPI מרכזי לרובוט קצר־טווח.

‏נבנה surface:

```text
signal_age_ms
→ fill_rate
→ markout curve
→ net outcome
```

‏ה־Signal TTL צריך להיות Evidence-driven לפי survival curve, לא מספר אינטואיטיבי.

---

## ‏21. Time-to-Fill Conditioning

‏Fast Fill אינו תמיד טוב.

‏Slow Fill אינו תמיד טוב.

‏נבדוק:

```text
time_to_fill_bucket
→ markout distribution
→ missed opportunity
→ net execution value
```

‏Fast Passive Fill יכול להיות toxic אם השוק חוצה אלינו בעוצמה.

‏Slow Fill יכול להיות stale אם ה־thesis כבר דועכת.

---

## ‏22. Order Flow Context

‏מקטע 44 מספק את ה־pre-fill Flow Contract.

‏ל־Adverse Selection נשתמש תחילה ב־subset קטן:

```text
flow_imbalance
flow_rate
flow_acceleration
flow_persistence
flow_confidence
price_response
```

‏לא נבנה toxicity model על Flow Feature שלא עבר data-quality contract.

---

## ‏23. Book Context

‏מקטע 45 מספק את Book Contract.

‏ל־Adverse Selection נשתמש תחילה ב־:

```text
top_imbalance
microprice_offset
book_age
book_churn
book_quality
spread
basic depletion/replenishment when reliable
```

‏`Microprice` נשאר Feature הסתברותי, לא Truth.

---

## ‏24. Flow × Book Interaction

‏Hypothesis examples:

```text
seller aggression high
+ bid depletion high
→ higher passive-buy toxicity
```

‏לעומת:

```text
seller aggression high
+ bid replenishment high
+ price holds
→ absorption_candidate
→ potentially lower passive-buy toxicity
```

‏אלה ניסויים, לא rules מוקדמים.

---

## ‏25. Price Response remains mandatory

‏Flow/Book בלי Response אינם מספיקים.

‏נמדוד:

```text
pre_fill_price_velocity
flow_to_price_efficiency
microprice_drift
mid_return_before_fill
```

‏כדי להבין אם liquidity pressure כבר מתורגם למחיר.

---

## ‏26. Effective Spread / Realized Spread / Markout

‏נשמור concepts נפרדים:

```text
Effective Spread
→ price paid vs contemporaneous midpoint

Realized Spread
→ residual spread compensation after horizon

Markout
→ post-fill market movement from our perspective
```

‏`Price Improvement` אינו Execution Quality בפני עצמו.

---

## ‏27. Fill Quality Scorecard

```text
price_vs_decision
price_vs_arrival
spread_paid_or_captured
fill_probability
time_to_fill
partial_fill_ratio
markout_curve
missed_opportunity
cancel_fill_race
stale_fill
fees
net_edge_retained
```

‏Fill Rate הוא שורה אחת בלבד.

---

## ‏28. Net Edge Retained

‏ה־economic chain:

```text
Predicted Edge at Decision
- Signal Decay to Submit
- Spread / Slippage / Fees
- Expected or Realized Adverse Selection
- Other Execution Costs
→ Net Edge Retained
```

‏ה־objective אינו “capture spread”.

‏ה־objective הוא לשמר Edge שניתן לבצע.

---

## ‏29. Adverse Selection Budget

‏Conceptual research contract:

```text
RemainingEdge
=
ExpectedAlpha
- ExplicitCosts
- SpreadAndSlippage
- ExpectedAdverseSelection
- SafetyMargin
```

‏אם RemainingEdge אינו חיובי עם confidence מתאים:

```text
NO_TRADE
```

‏יכול להיות outcome תקף במחקר/Shadow.

---

## ‏30. Expected Markout Model — Baseline

‏לא מתחילים ב־ML.

‏Baseline:

```text
Empirical Buckets
→ Median / Quantiles
→ Confidence
```

‏לדוגמה:

```text
execution_mode = PASSIVE
signal_age_bucket
spread_bucket
flow_bucket
book_bucket
regime
```

‏נמנע מ־bucket explosion.

---

## ‏31. Confidence Contract

‏כל estimate עתידי כמו:

```text
expected_markout_1s
```

‏יקבל לפחות:

```text
estimate
sample_count
confidence
regime_similarity
quality
model_version
```

‏`UNKNOWN` או low confidence אינם מומרצים לדיוק מדומה.

---

## ‏32. Do Not Use False Precision

‏נעדיף:

```text
expected_markout_bucket = HIGH_RISK
confidence = MEDIUM
```

‏או range:

```text
[-6 bps, -2 bps]
```

‏על פני מספר כמו:

```text
-3.7421 bps
```

‏כאשר הנתונים אינם מצדיקים רזולוציה כזו.

---

## ‏33. Execution Assessment Contract

```text
ExecutionAssessment
- decision_id
- intent_id
- expected_fill_probability
- expected_time_to_fill
- expected_markout_100ms
- expected_markout_1s
- expected_markout_5s
- expected_slippage
- expected_missed_opportunity
- expected_net_execution_value
- confidence
- recommended_mode
- block_reason
- assessment_version
- as_of
```

‏`recommended_mode` יכול להיות:

```text
PASSIVE
BALANCED
AGGRESSIVE
WAIT
NO_TRADE
```

‏במקטע 46 זה Contract מחקרי/Shadow, לא authorization למסחר חי.

---

## ‏34. Prediction Rank != Executable Rank

‏נוכל לחקור:

```text
ExecutableEdge
=
PredictedEdge
- ExpectedCosts
- ExpectedAdverseSelection
```

‏אבל Rank #2 replacement לא נכנס ל־Baseline אוטומטית.

‏הוא Challenger נפרד שדורש:

```text
candidate comparison
switching cost
hysteresis
latency
OOS evidence
```

---

## ‏35. Top1 vs Top2 RCA

‏לאחר כישלון נשאל:

```text
Was #1 predictively superior but execution-toxic?
Was #2 slightly weaker but economically more executable?
```

‏זה diagnostic לפני שהוא policy.

---

## ‏36. Execution Mode Matrix

‏נבנה matrix מחקרית בלבד:

| Context | Passive | Balanced | Aggressive | No Trade |
|---|---:|---:|---:|---:|
| Fresh strong continuation | measure | measure | measure | measure |
| Weak signal | measure | measure | measure | measure |
| Flow reversal | measure | measure | measure | measure |
| Book deterioration | measure | measure | measure | measure |
| Wide spread | measure | measure | measure | measure |
| High toxicity estimate | measure | measure | measure | measure |

‏לא ממלאים תאים מאינטואיציה.

---

## ‏37. Counterfactual Ladder

‏לכל signal נוכל להשוות ב־Replay:

```text
Cross immediately
Rest passively
Wait briefly
Abort / No Trade
```

‏אבל confidence שונה:

```text
Aggressive counterfactual
→ often easier with L1/L2

Passive counterfactual
→ depends strongly on queue model fidelity
```

‏מסקנה שאינה robust ב־Optimistic/Base/Conservative fill models לא תקודם.

---

## ‏38. Replay Fidelity

‏נשתמש לפחות:

```text
Optimistic
Base
Conservative
```

‏ונשמור:

```text
fill_model_version
queue_model_version
markout_version
```

‏Replay אינו Oracle.

---

## ‏39. Real Fill Calibration

‏Real Broker Fills הם calibration source חשוב ל־execution models.

‏נשווה:

```text
predicted_fill_probability
vs
actual fill outcome

predicted_markout_risk
vs
actual markout
```

‏Paper אינו מספיק להוכחת queue/adverse-selection realism.

---

## ‏40. Dataset — Filled Attempts

```text
fill_id
session_date
instrument_id
side
strategy_version
score_version
execution_policy_version
provider_version
fill_time
fill_price
fill_qty
execution_mode
passive_flag
venue
route
signal_age_ms
order_age_ms
time_to_fill_ms
queue_confidence
spread_ticks
spread_bps
flow_imbalance
flow_confidence
book_imbalance
microprice_offset
rank
rank_gap
regime
markout_100ms
markout_500ms
markout_1s
markout_2s
markout_5s
markout_10s
```

---

## ‏41. Dataset — Unfilled Attempts

```text
attempt_id
decision_id
intent_id
instrument_id
side
execution_mode
created_at
expired_or_cancelled_at
cancel_reason
signal_age_at_end
queue_estimate
queue_confidence
spread
flow_state
book_state
rank_state
forward_executable_outcomes
would_have_filled_confidence
```

‏`would_have_filled` יכול להיות `UNKNOWN`.

---

## ‏42. Dataset — Cancelled Attempts

‏נשמור:

```text
cancel_reason
cancel_decision_time
cancel_send_time
cancel_confirm_time
remaining_qty
fill_after_cancel_request
counterfactual_confidence
```

‏Reason Registry:

```text
SIGNAL_EXPIRED
RANK_CHANGED
FLOW_REVERSED
BOOK_DETERIORATED
PRICE_MOVED
RISK_BLOCK
SAFETY_BLOCK
MANUAL
RECOVERY
UNKNOWN
```

---

## ‏43. Cancel Value

‏Cancel success אינו רק:

```text
cancel confirmed
```

‏אלא מחקרית:

```text
Did cancel avoid a toxic fill?
Did cancel cause a missed winner?
```

‏לכן נמדוד:

```text
missed_toxic_fill_candidate
missed_winner_candidate
```

‏עם confidence שמכבד Queue uncertainty.

---

## ‏44. Partial Fill Toxicity

‏נחקור:

```text
first_fill_markout
remaining_order_context
subsequent_fill_markout
```

‏Hypothesis אפשרית:

```text
first partial fill becomes adverse
+ flow/book deteriorate
→ cancel remainder may improve outcome
```

‏זה Challenger בלבד.

---

## ‏45. Fill as State-Machine Event

‏`FILL` אינו רק bookkeeping.

‏הוא מפעיל:

```text
Position Update
→ Risk Update
→ Exit Readiness
→ Markout Tracking
→ Optional Post-Fill Revalidation
```

‏Post-Fill revalidation אינה Exit rule אוטומטי.

---

## ‏46. Entry vs Exit Asymmetry

‏ב־Entry:

```text
uncertainty
→ can justify NO_TRADE
```

‏ב־Exit:

```text
existing exposure
→ risk reduction may justify execution despite toxicity
```

‏Adverse-selection model אינו חוסם risk-reducing action רק בגלל cost estimate.

‏Safety/Risk precedence נשמרת.

---

## ‏47. Post-Fill Recheck

‏Challenger מחקרי:

```text
Fill
→ refresh signal / flow / book / risk
→ classify thesis health
```

‏Outcomes אפשריים במחקר:

```text
HOLD_UNCHANGED
REDUCE_CANDIDATE
EXIT_CANDIDATE
UNKNOWN
```

‏Promotion דורש ניסוי נפרד; Markout diagnostic אינו Stop אוטומטי.

---

## ‏48. Operational Adverse Selection

‏Toxic fills יכולים להגיע גם מבעיה מערכתית:

```text
stale market data
processing lag
ranking age
broker latency
cancel latency
queue backlog
coverage degradation
```

‏לכן markout analysis יתחבר ל־latency telemetry.

---

## ‏49. Latency Attribution

‏נשמור:

```text
market_event_to_receive
receive_to_feature
feature_to_rank
rank_to_decision
decision_to_send
send_to_ack
cancel_decision_to_send
cancel_send_to_confirm
```

‏ונבנה Markout surfaces לפי latency buckets.

---

## ‏50. Latency-to-Half-Life Ratios

‏נמדוד:

```text
end_to_end_latency / signal_half_life
end_to_end_latency / book_half_life
```

‏כאשר ratio גבוה, microstructure model יכול להיות אמיתי אך בלתי־ניצל בארכיטקטורה שלנו.

---

## ‏51. Whole-Market Upstream Risk

‏Adverse Selection יכול להתחיל עוד לפני ה־Order אם Rank #1 נבחר מתוך snapshot cross-sectional לא עקבי.

‏נשמור:

```text
fresh_coverage_ratio
rank_as_of
rank_age
rank_persistence
rank_gap
```

‏Coverage Bias הוא גם execution-quality risk.

---

## ‏52. Candidate Persistence

‏Resting Order על Candidate שכבר יצא מ־Top-N עלול להפוך stale.

‏נבדוק Markout לפי:

```text
rank_at_decision
rank_at_submit
rank_at_fill
```

‏אבל לא נבטל אוטומטית על כל Rank change קטן; נדרש hysteresis research.

---

## ‏53. Adverse Selection Memory

‏אפשר לשמור rolling diagnostic state:

```text
recent_markout_distribution
recent_toxic_fill_rate
recent_cancel_fill_races
```

‏לכל symbol/context.

‏אבל state כזה מקבל TTL/decay ואינו “punishment” אחרי loss יחיד.

---

## ‏54. Market-Level Toxicity

‏Cross-sectional context אפשרי:

```text
spread expansion breadth
volatility shock
flow imbalance breadth
coverage degradation
latency inflation
```

‏זה יכול להיות Regime input.

‏Hard Safety נשאר נפרד.

---

## ‏55. Fast Path / Deep Path

### ‏Fast Path

‏לכל eligible candidate:

```text
signal_age
spread
flow_imbalance
flow_confidence
top_book_imbalance
microprice_offset
book_age
rank_age
```

### ‏Deep Path

‏רק ל־Top-N / analysis:

```text
queue context
multi-level depletion
replenishment
cancel dynamics
venue/route history
matched-sample expected markout
```

‏Hot-path model חייב להיות זול מספיק שלא ייצור toxicity דרך latency שהוא עצמו מוסיף.

---

## ‏56. Simple Toxicity Gate — Shadow only

‏הגרסה הראשונה תהיה explainable rule candidate.

‏לדוגמה:

```text
PASSIVE BUY
+
SELL FLOW REVERSAL
+
BID DEPLETION
+
LOW BOOK CONFIDENCE
→ WOULD_BLOCK_PASSIVE
```

‏ה־Shadow Gate אינו שולח/מבטל Orders.

‏הוא רק שומר Counterfactual Decision.

---

## ‏57. Promotion Path

```text
Measure
→ Segment
→ Hypothesis
→ Shadow Gate
→ Decision Diff
→ Replay Counterfactual
→ OOS Validation
→ Paper Lifecycle Validation
→ Controlled Champion/Challenger
```

‏המקטע אינו מאשר מעבר למסחר אמיתי.

---

## ‏58. Promotion Criteria

‏Toxicity feature/policy מתקדם רק אם הוא מראה:

```text
better net edge retained
better changed-decision EV
lower toxic-fill rate
acceptable missed opportunity
stable OOS behavior
stable regime behavior
no material latency regression
no unsafe order churn
```

‏וכל זאת תחת fill-model sensitivity כאשר רלוונטי.

---

## ‏59. Rejection Criteria

‏נדחה/נשהה feature אם:

```text
improvement disappears OOS
only average improves but tails worsen materially
fill rate collapses without net benefit
missed opportunity rises more than toxicity falls
latency tax erases gain
only one symbol/day/regime drives result
results depend on optimistic queue assumptions
feature almost never changes decisions
confidence is too low
```

---

## ‏60. Primary Metrics

```text
median_markout_100ms
median_markout_1s
median_markout_5s
p10_markout_1s
worst_tail_mean_1s
toxic_fill_rate
severe_toxic_fill_rate
fill_rate
partial_fill_rate
stale_fill_rate
cancel_fill_race_rate
signal_age_at_fill
missed_opportunity_after_no_fill
net_edge_retained
```

---

## ‏61. Toxic Fill Definition

‏`toxic_fill` אינו semantic קבוע.

‏הוא חייב להיות versioned research label:

```text
toxic_fill_horizon
toxic_fill_threshold
toxic_fill_benchmark
normalization
label_version
```

‏לא נבחר `X bps` אינטואיטיבי ונקרא לו אמת.

---

## ‏62. Severe Tail

‏נשמור severe adverse tail בנפרד.

‏דוגמאות metrics:

```text
p05_markout
worst_1pct_mean
max_adverse_markout
```

‏ה־tail חשוב ל־Risk גם אם median משתפר.

---

## ‏63. MAE / MFE after Fill

‏Markout curve יושלם על ידי:

```text
mae_after_fill
mfe_after_fill
```

‏כך נזהה:

```text
early toxic but later recovers
vs
persistent adverse movement
```

‏Markout עדיין אינו Trade PnL.

---

## ‏64. Time-to-Adverse-Move

‏Metric מחקרי:

```text
time_to_first_adverse_threshold
```

‏זה עוזר להבדיל toxic selection מ־slow thesis failure.

---

## ‏65. Time-to-Recovery

```text
time_to_recover_from_initial_negative_markout
```

‏אם recovery מהיר ועקבי, policy implications שונות מ־persistent move.

---

## ‏66. Success RCA

‏גם Fills טובים נכנסים ל־RCA sample.

‏דוגמה:

```text
passive buy
→ sell aggression arrives
→ bid replenishes
→ price holds
→ positive markout
```

‏כך לא נבנה taxonomy רק מתוך failures.

---

## ‏67. Failure Taxonomy

```text
AS_PASSIVE_TOXIC_FILL
AS_STALE_SIGNAL_FILL
AS_CANCEL_TOO_LATE
AS_FLOW_REVERSAL
AS_BOOK_COLLAPSE
AS_CHASE_EXHAUSTION
AS_SPREAD_WIDENING
AS_QUEUE_SELECTION
AS_LATENCY
AS_COVERAGE_BIAS
AS_DATA_STALE
AS_ROUTE_CONTEXT
AS_UNKNOWN
```

‏`UNKNOWN` outcome תקין.

---

## ‏68. Primary vs Contributing Causes

‏RCA record:

```text
primary_cause
contributing_causes[]
confidence
first_divergence_time
supporting_evidence_ids[]
```

‏דוגמה:

```text
Primary: AS_STALE_SIGNAL_FILL
Contributing: AS_CANCEL_TOO_LATE
Contributing: AS_FLOW_REVERSAL
```

---

## ‏69. First Divergence Timeline

‏לכל Fill חריג נרצה reconstruct:

```text
signal
→ decision
→ submit
→ rest/route
→ flow/book deterioration
→ cancel decision?
→ fill
→ cancel confirmation?
→ markout curve
```

‏הנקודה הראשונה שבה context משתנה היא לרוב informative יותר מ־single final metric.

---

## ‏70. RCA Packet

```text
fill_id
incident_or_analysis_id
decision_packet
intent_packet
order_lifecycle
queue_estimate_history
flow_movie
book_movie
rank_history
latency_trace
cancel_trace
markout_curve
position_state
versions
```

---

## ‏71. Observability Dashboard — Passive

```text
passive_fill_rate
median_passive_markout_100ms
median_passive_markout_1s
median_passive_markout_5s
p10_passive_markout_1s
passive_stale_fill_rate
passive_cancel_fill_race_rate
passive_signal_age_at_fill
```

---

## ‏72. Observability Dashboard — Aggressive

```text
aggressive_fill_rate
slippage_vs_arrival
median_aggressive_markout_100ms
median_aggressive_markout_1s
median_aggressive_markout_5s
chase_distance
signal_age_at_fill
spread_paid
```

---

## ‏73. Alerting

‏Alerts יכולים להתבסס על sustained deterioration של:

```text
markout distribution
toxic fill rate
stale fill rate
cancel/fill race rate
latency buckets
```

‏לא עוצרים/משנים policy על Fill יחיד או sample קטן.

‏Alerting אינו Enforcement; Safety/Execution Policy מחזיקים rules מפורשים משלהם.

---

## ‏74. Drift

‏נעקוב אחרי Markout distributions לפי:

```text
execution_mode
regime
time_of_day
symbol_group
size_bucket
provider_version
policy_version
```

‏שינוי Provider יכול להיראות כמו Market Drift ולכן נשמר fingerprint.

---

## ‏75. Experiment Registry

‏כל Experiment adverse-selection יכלול:

```text
experiment_id
hypothesis
champion
challenger
primary_metric
guardrails
sample_window
train_validation_split
fill_model_versions
feature_versions
policy_versions
promotion_rule
rollback_rule
```

---

## ‏76. Example Experiment — Passive Toxicity Gate

```text
Hypothesis:
Blocking passive entry when
seller flow reverses + bid depletes
reduces negative 1s markout
without excessive missed opportunity.
```

‏Primary:

```text
incremental net execution value
```

‏Guardrails:

```text
fill rate
missed winner rate
latency
order churn
risk exposure
```

---

## ‏77. Example Experiment — Signal Age

‏נבנה surface:

```text
signal_age bucket
× execution mode
→ markout
→ fill rate
→ net outcome
```

‏המטרה היא למצוא robust region, לא threshold חד שנבחר על best backtest.

---

## ‏78. Example Experiment — Cancel Policy

```text
Champion:
current cancel policy

Challenger:
flow/book deterioration shadow cancel
```

‏נמדוד:

```text
toxic fills avoided
missed winners
cancel/fill races
order churn
net EV
```

---

## ‏79. Ablation

‏נבדוק incremental value של:

```text
signal age
flow reversal
book deterioration
microprice
spread widening
rank deterioration
latency
```

‏ולא נוסיף הכול יחד ואז ננחש מה עזר.

---

## ‏80. Redundancy

‏נזהר מ־double-counting:

```text
microprice
book imbalance
book pressure composite
```

‏או:

```text
flow imbalance
signed volume ratio
aggression ratio
```

‏Correlation + changed-decision analysis קודמים להוספת Feature.

---

## ‏81. Multiple Testing

‏Adverse-selection research מלא thresholds/horizons/buckets.

‏נדרשים:

```text
pre-registered primary metric
experiment registry
locked validation
OOS / walk-forward
```

‏אין לבחור את horizon/threshold רק לפי התוצאה היפה ביותר.

---

## ‏82. Walk-Forward

‏Expected markout/taxicity model עובר אותה משמעת כמו Prediction Model:

```text
discovery
→ validation
→ locked test
→ walk-forward
→ shadow
```

---

## ‏83. Decision Impact Rate

‏נמדוד:

```text
changed_decisions / eligible_decisions
```

‏Model מדויק שלא משנה שום החלטה אינו בהכרח שווה complexity production.

---

## ‏84. Incremental EV on Changed Decisions

‏זה metric מרכזי:

```text
E[outcome_challenger - outcome_champion | decision_changed]
```

‏כך נמנע מהתפארות ב־global average כאשר model כמעט לא פועל.

---

## ‏85. Opportunity Cost of Avoiding Toxicity

‏כל Gate שמונע Fills ישלם לעיתים missed winners.

‏נמדוד יחד:

```text
toxic fills avoided
missed winners
```

‏ולא optimize toxicity rate לבדו.

---

## ‏86. `NO_TRADE` as Execution Outcome

‏אם:

```text
Predicted Edge
-
Costs
-
Expected Adverse Selection
<= 0
```

‏התוצאה המחקרית הנכונה יכולה להיות:

```text
NO_TRADE
```

‏לא חייבים לבחור Passive או Aggressive.

---

## ‏87. Skip Passive != Cross

‏אם Passive נראה toxic, האפשרויות הן:

```text
WAIT
REDUCE_SIZE_CANDIDATE
USE_OTHER_EXECUTION_MODE_CANDIDATE
CHOOSE_OTHER_CANDIDATE
NO_TRADE
```

‏לא `CROSS` אוטומטי.

---

## ‏88. Size / Capacity Interaction

‏Markout ו־Fill composition יכולים להשתנות עם Quantity.

‏נשמור:

```text
order_qty
order_qty / near_touch_depth
order_qty / recent_volume
```

‏אבל Price Impact/Capacity עצמו שייך בעיקר למקטע 47.

---

## ‏89. Own Impact

‏ב־Aggressive fills, post-fill movement יכול לכלול impact שיצרנו בעצמנו.

‏לכן Markout אינו pure counterparty-information metric.

‏נשמור distinction:

```text
adverse_selection_candidate
own_impact_candidate
mixed_or_unknown
```

---

## ‏90. Venue / Route Analysis

‏נוכל להתפלח לפי:

```text
venue
route
liquidity_flag
order_type
```

‏רק לאחר sample מספק.

‏`10 fills on venue X` אינם routing evidence.

---

## ‏91. Fee/Rebate Relationship

‏Fee/Rebate אינם מספיקים.

‏Net route economics:

```text
Price Outcome
+ Rebate
- Fee
- Slippage
- Adverse Selection
- Missed Opportunity
```

‏Route זול עם toxic fills יכול להיות יקר כלכלית.

---

## ‏92. Relationship to Segment 37 — Advanced Order Tactics

‏מקטע 37 מגדיר:

```text
ExecutionPlan
TTL
price protection
adaptive escalation
```

‏מקטע 46 מוסיף objective נוסף:

```text
Do tactics preserve edge after Fill?
```

‏`Protected Marketable Limit`, Passive ו־Adaptive Challengers יושוו גם ב־markout distributions.

---

## ‏93. Relationship to Segment 38 — Queue

‏מקטע 38:

```text
Will passive order fill?
```

‏מקטע 46:

```text
If it fills, was that economically good?
```

‏שתי השכבות חייבות להתקיים יחד.

---

## ‏94. Relationship to Segment 44 — Flow

‏Flow מספק pre-fill pressure/quality.

‏Adverse Selection הופך post-fill Markout ל־Label שמאפשר לבדוק:

```text
Which Flow states predict toxic fills?
```

‏Flow itself אינו toxicity truth.

---

## ‏95. Relationship to Segment 45 — Book

‏Book מספק:

```text
imbalance
microprice
depletion/replenishment
freshness
```

‏Adverse Selection בודק אם states אלה באמת משנים Fill Quality.

‏כך Book Feature יכול להיות חלש ל־Alpha אך חזק ל־Execution.

---

## ‏96. Relationship to Segment 18 — True Costs

‏Adverse Selection הוא חלק מהעלות הכלכלית האמיתית, גם אם אינו עמלה מפורשת.

```text
Net Edge
=
Gross Edge
- Explicit Costs
- Spread / Slippage
- Adverse Selection
- Other Execution Frictions
```

---

## ‏97. Relationship to Segment 21 — Execution Backtest

‏Backtest realistic חייב לייצג:

```text
fill selection
partial fills
no fills
cancel/fill races
markout
```

‏`Touch == Fill` לא רק אופטימי ב־Fill probability; הוא גם עלול למחוק Selection Bias.

---

## ‏98. Relationship to Segment 26 — RCA

‏Adverse-selection packet מצטרף ל־first-divergence RCA:

```text
Prediction Failure?
Selection Failure?
Execution Failure?
Exit Failure?
Data Failure?
```

‏Negative Markout אינו מספיק כדי לקבוע שה־Strategy עצמה גרועה.

---

## ‏99. Relationship to Segment 35 — Observability

‏Markout metrics מצטרפים ל־Evidence Chain:

```text
Decision
→ Intent
→ Order
→ Fill
→ Markout
→ Position / Exit
```

‏לכל metric יש stable IDs ו־version metadata.

---

## ‏100. Relationship to Segment 36 — Safety

‏Toxicity estimate יכול בעתיד לתרום ל־Entry blocking, אבל:

```text
Safety > Execution Optimization
```

‏Risk-reducing actions אינם נחסמים רק מפני שה־expected execution cost גבוה.

---

## ‏101. Relationship to Segment 47 — Price Impact / Capacity

‏מקטע 46 שואל:

```text
How does the market move after we fill?
```

‏מקטע 47 יוסיף:

```text
How much of that movement did our own size/urgency create?
```

‏לכן own-impact attribution נשאר חלקי עד 47.

---

## ‏102. Failure Modes

```text
FILL_RATE_OPTIMIZATION
MARKOUT_HORIZON_CHERRY_PICKING
FILLED_ONLY_DATASET
NO_FILL_BLINDNESS
TOUCH_FILL_FANTASY
PASSIVE_AGGRESSIVE_MIXING
STALE_FILL_BLINDNESS
CANCEL_FILL_RACE_IGNORED
QUEUE_PRIORITY_IS_GOOD_ASSUMPTION
LAST_ONLY_MARKOUT
VENUE_OVERFIT
SYMBOL_OVERFIT
LATENCY_ATTRIBUTION_MISSING
DATA_ALIGNMENT_ERROR
MARKOUT_AS_PNL
MARKOUT_AS_STOP_RULE
TOXICITY_MODEL_LATENCY_TAX
AUTO_RETUNE_ON_NOISE
```

---

## ‏103. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏ML toxicity classifier.
- ‏Venue-specific routing rules.
- ‏Per-symbol toxicity thresholds.
- ‏Dynamic cancel/replace based on dozens of signals.
- ‏Automatic post-fill exit from Markout alone.
- ‏Propensity models לפני bucket baseline.
- ‏One-horizon Markout optimization.
- ‏Filled-only dataset.
- ‏Auto-retuning after bad trades.
- ‏Full causal attribution של every Fill.

---

## ‏104. What to Add Later

‏רק לאחר Evidence:

```text
expected_markout model
matched-sample selection analysis
fill propensity model
good-fill / bad-fill hazard
partial-fill remainder policy
candidate replacement policy
venue-aware toxicity model
market-level toxicity regime
capacity-aware adverse-selection model
```

---

## ‏105. Priority Map

### ‏`P0`

```text
Real fill truth
Markout contract
Filled + unfilled datasets
Passive/aggressive classification
Signal age
Cancel/fill race evidence
Data-quality flags
Versioning
Point-in-time correctness
```

### ‏`P1`

```text
Multi-horizon dashboards
Fill/no-fill selection gap
Simple bucket analysis
Execution-mode comparison
Shadow toxicity diagnostics
```

### ‏`P2`

```text
Simple shadow gates
matched samples
partial-fill toxicity analysis
candidate execution adjustment research
```

### ‏`P3`

```text
expected-markout model
venue/route conditioning
hazard models
market-level toxicity
```

### ‏`P4`

```text
high-dimensional learned execution policy
fine venue-specific routing optimization
causal propensity corrections
complex real-time adaptive toxicity control
```

---

## ‏106. Confidence

### ‏High Confidence

‏ביטחון גבוה ב־:

```text
Fill Rate alone is insufficient
Post-fill markout is essential diagnostic evidence
Filled subset is selected
No-fill attempts must be retained
Passive/aggressive fills must be separated
Signal age matters
CancelRequested != Cancelled
Multi-horizon markout is better than one horizon
Queue value must include markout/opportunity cost
```

### ‏Medium Confidence

‏ביטחון בינוני ב־:

```text
best bucket dimensions
best markout benchmark per use case
best toxicity threshold family
best matched-sample scheme
best post-fill recheck policy
```

### ‏Low / Evidence Required

‏לא נקבע מראש:

```text
exact toxicity thresholds
exact execution-mode mapping
exact signal TTL derived from toxicity
venue-specific policy
candidate replacement rule
ML model architecture
```

---

## ‏107. Time-Sensitive Facts

‏לא נדרש Web verification חדש למקטע 46.

‏ה־core recommendations הן מתודולוגיות ואינן תלויות ב־Broker/Exchange rule מספרי מסוים.

‏לפני implementation שמסתמך על Broker/Venue-specific fields יש לאמת מחדש:

```text
liquidity flags
fill timestamps
venue/route identifiers
cancel lifecycle semantics
paper/live differences
```

‏Capabilities כאלה נשארים ב־Capability Registry ולא assumptions גלובליים.

---

## ‏108. Golden Scenario — Passive Good Fill

```text
Fresh signal
→ passive buy rests
→ seller aggression arrives
→ bid replenishes
→ fill
→ price stabilizes/rises
→ positive markout
```

‏Expected:

```text
fill classified PASSIVE
context preserved
positive markout curve recorded
```

---

## ‏109. Golden Scenario — Passive Toxic Fill

```text
Passive buy rests
→ seller aggression accelerates
→ bid depletion
→ fill
→ continued downside
```

‏Expected:

```text
negative markout captured
failure attribution remains evidence-based
```

---

## ‏110. Golden Scenario — Fast Toxic Fill

```text
Low predicted fill probability
→ very fast passive fill
→ market continues through order
```

‏Expected:

```text
fast_fill recorded
negative markout captured
fast fill not labeled execution success
```

---

## ‏111. Golden Scenario — Slow Stale Fill

```text
Order waits
→ signal expires
→ cancel not yet effective
→ fill occurs
```

‏Expected:

```text
stale_fill_candidate = true
cancel/fill race preserved
markout measured
```

---

## ‏112. Golden Scenario — Cancel Saves Toxic Fill

```text
Book/flow deteriorate
→ cancel confirmed
→ market moves through old order price
```

‏Expected:

```text
no real fill
counterfactual saved with confidence
not counted as realized markout
```

---

## ‏113. Golden Scenario — Cancel Misses Winner

```text
Cancel confirmed
→ price resumes favorable movement
```

‏Expected:

```text
missed opportunity measured
policy not optimized only for toxic-fill avoidance
```

---

## ‏114. Golden Scenario — Partial Fill Then Deterioration

```text
first partial fill
→ negative immediate markout
→ flow deteriorates
→ remaining order still working
```

‏Expected:

```text
position truth updated
remaining exposure known
shadow remainder-cancel experiment can evaluate
```

---

## ‏115. Golden Scenario — Aggressive Chase Exhaustion

```text
Signal old
→ price already moved
→ aggressive fill
→ flow exhausts
→ negative markout
```

‏Expected:

```text
AS_CHASE_EXHAUSTION candidate
latency/signal-age attribution preserved
```

---

## ‏116. Golden Scenario — Prediction Good, Execution Bad

```text
Signal correctly predicts +20 bps over 5s
but passive fill occurs during -8 bps immediate move
and exit economics degrade
```

‏Expected:

```text
Prediction and Execution RCA remain separate
```

---

## ‏117. Golden Scenario — No-Fill Winner

```text
Passive order never fills
→ market moves favorably away
```

‏Expected:

```text
missed opportunity recorded
not silently discarded
```

---

## ‏118. Golden Scenario — Filled Loser vs Unfilled Winner Pattern

‏Across matched contexts:

```text
filled -> negative markout
unfilled -> favorable forward move
```

‏Expected:

```text
selection-gap investigation triggered
```

---

## ‏119. Golden Scenario — Data Misalignment

```text
fill timestamp source A
quote benchmark source B
clock skew suspected
```

‏Expected:

```text
markout_quality = DEGRADED/UNKNOWN
no confident toxicity conclusion
```

---

## ‏120. Property Tests

```text
same fill + same future market data + same version
=> same markout

no future price before horizon
=> no markout value

unknown benchmark
=> markout is missing, not zero

partial fills sum
<= parent filled quantity

cancel request alone
=> order is not terminal

real fill
=> cannot be erased by later cancel confirmation
```

---

## ‏121. Symmetry Property

‏כאשר הופכים Side וכל המחירים בצורה סימטרית, side-normalized Markout צריך לשמור interpretation עקבית.

---

## ‏122. Prefix Invariance

‏Pre-fill toxicity features ב־Replay אינם רשאים להשתנות בגלל Events שאחרי ה־Fill/Decision timestamp.

```text
same event prefix
=> same pre-fill features
```

---

## ‏123. Determinism

```text
same events
+ same versions
+ same clocks
=> same fill context
+ same markout outputs
```

---

## ‏124. Data Quality Tests

‏נבדוק:

```text
duplicate fill event
late fill callback
out-of-order market data
sequence gap
missing quote benchmark
cross-provider timestamp skew
symbol mapping mismatch
```

‏Expected: fail visible, not silent contamination.

---

## ‏125. Replay Tests

‏חובה לכלול:

```text
passive toxic fill
passive good fill
no-fill winner
cancel/fill race
partial fill
stale signal fill
aggressive chase exhaustion
provider lag
queue-model sensitivity
```

---

## ‏126. Statistical Validation

‏נשתמש ב־:

```text
chronological splits
OOS
walk-forward
confidence intervals
cluster/episode awareness
regime segmentation
```

‏לא נציג אלפי fills מאותה burst כאילו כולם independent לחלוטין.

---

## ‏127. Episode-Level Analysis

‏ניתן לקבץ attempts מאותו candidate episode כדי למנוע sample inflation.

```text
episode_id
signal_start
signal_peak
signal_end
attempts
fills
markouts
outcome
```

---

## ‏128. Size Segmentation

‏נשמור Bucket לפי requested size relative to:

```text
near_touch_depth
recent traded volume
```

‏כדי לא לערבב micro orders עם orders שמתחילים להשפיע על השוק.

---

## ‏129. Regime Segmentation

‏מינימום:

```text
OPEN_TRANSITION
NORMAL_CONTINUOUS
FAST
POST_REOPEN
CLOSE_TRANSITION
```

‏כאשר Sample מספיק.

‏לא נפצל לעשרות buckets מוקדם מדי.

---

## ‏130. Time-of-Day

‏Open / Midday / Close יכולים להציג Markout שונה.

‏Time-of-day הוא context, לא Feature magic.

---

## ‏131. Symbol Families

‏נבדוק heterogeneity לפי liquidity/tick/price families, לא per-symbol tuning בשלב מוקדם.

---

## ‏132. Cost Model Integration

‏כל experiment יקשר ל־`cost_model_version`.

‏Markout improvement של `2 bps` אינו מספיק אם tactic מוסיפה `4 bps` spread/slippage/fees.

---

## ‏133. Observed vs Inferred vs Counterfactual

‏נשמור provenance:

```text
OBSERVED_FILL
OBSERVED_FUTURE_MARKET
INFERRED_TOXICITY
SIMULATED_COUNTERFACTUAL
UNKNOWN
```

‏לא מערבבים counterfactual result עם realized outcome.

---

## ‏134. Markout is Diagnostic, not PnL

‏Trade PnL כולל:

```text
entry
position path
exit
fees
risk
sizing
```

‏Markout מודד slice של Execution Quality בלבד.

---

## ‏135. Markout is not Exit Logic

‏Negative 100ms Markout אינו Stop אוטומטי.

‏אם רוצים להשתמש בו ל־Position Management, נפתח Experiment נפרד עם:

```text
entry state
post-fill state
exit cost
false exit rate
net outcome
```

---

## ‏136. Markout Heatmaps

‏Research UI יכול להציג:

```text
signal_age × execution_mode
flow_state × book_state
spread × time_to_fill
latency × markout
```

‏אבל Heatmap אינה promotion evidence ללא OOS.

---

## ‏137. Global → Specific Analysis Hierarchy

```text
Global
→ Execution Mode
→ Regime
→ Symbol Family
→ Context Bucket
→ Specific RCA
```

‏נמנע משתי קצוות:

```text
average everything
slice everything
```

---

## ‏138. User-Specific Application

‏הרובוט שלנו מכוון ל־:

```text
whole-market ranking
seconds-scale momentum
short signal lifetime
Top-N handoff
small research size
separate market data / broker
```

‏לכן ארבע המלצות חשובות במיוחד:

1. ‏`Signal Age at Fill` הוא P0 telemetry.
2. ‏Passive Fill אינו נחשב הצלחה עד שנמדד Markout.
3. ‏No-Fill / Cancelled attempts חייבים להישמר, כי selection bias הוא מרכזי.
4. ‏Execution policy צריכה להיבחן לפי `Net Edge Retained`, לא לפי Fill Rate.

---

## ‏139. Concrete Baseline Pipeline

```text
Candidate selected
→ create Decision/Intent IDs
→ capture signal/flow/book context
→ execution policy chooses research mode
→ track queue/order lifecycle
→ fill / partial / no-fill / cancel
→ capture fill context
→ compute markout curve
→ join final trade outcome
→ classify execution RCA
→ update research dataset
→ compare champion/challenger
```

---

## ‏140. Minimum Fill Record

```text
fill_id
order_id
intent_id
decision_id
instrument_id
side
fill_time
fill_price
fill_qty
execution_mode
signal_age_ms
time_to_fill_ms
spread
flow_snapshot_id
book_snapshot_id
rank
regime
provider_version
execution_policy_version
```

---

## ‏141. Minimum Markout Record

```text
fill_id
horizon
benchmark_type
future_reference_price
signed_markout_price
signed_markout_bps
signed_markout_ticks
quality
markout_version
```

---

## ‏142. Minimum Attempt Record

```text
attempt_id
decision_id
intent_id
created_at
terminal_at
terminal_state
cancel_reason
signal_age_at_terminal
execution_mode
queue_model_version
queue_confidence
forward_outcome_version
```

---

## ‏143. Minimum Execution Assessment Record

```text
assessment_id
decision_id
as_of
expected_fill_probability
expected_markout_cost
expected_slippage
expected_missed_opportunity
expected_net_execution_value
confidence
recommended_mode
block_reason
assessment_version
```

---

## ‏144. Invariants

```text
Fill Truth comes from execution reports.
No-Fill is preserved.
CancelRequested is not terminal.
Partial Fill is real exposure.
Future Markout cannot enter pre-fill features.
UNKNOWN is not zero.
Markout benchmark and version are known.
Passive and aggressive are not silently mixed.
Risk-reducing action is not blocked solely by toxicity cost.
```

---

## ‏145. Recommendation Hierarchy

```text
Baseline
→ Measure fills/no-fills + markout

Preferred Default
→ Simple bucketed execution-quality analysis

Challenger
→ Shadow toxicity gate

Advanced Option
→ Expected markout model / matched samples

Specialist Option
→ Venue/route/hazard/propensity models

Avoid Unless Evidence
→ High-dimensional adaptive execution optimization
```

---

## ‏146. Recommendation Summary

‏המלצת מקטע 46 היא לא “להימנע מ־Passive” ולא “להיות Aggressive”.

‏ההמלצה היא לשנות את יחידת המדידה של Execution:

```text
Fill Rate
```

‏אינו מספיק.

‏במקומו נמדוד:

```text
P(Fill)
×
Quality of Outcome Conditional on Fill
+
No-Fill Opportunity Cost
+
Explicit Execution Costs
```

‏ה־Baseline הפרקטי:

```text
Store every Fill and No-Fill
→ Multi-Horizon Side-Aware Markout
→ Separate Passive/Aggressive
→ Track Signal/Queue Age
→ Capture Cancel/Fill Races
→ Join Flow + Book Context
→ Measure Selection Gap
→ Build Simple Buckets
→ Shadow Gate
→ Promote only on OOS Net Evidence
```

‏והעיקרון החשוב ביותר:

> ‏**Fill טוב אינו Fill שנראה זול ברגע הביצוע. Fill טוב הוא Fill ששומר מספיק מה־Edge גם אחרי שהשוק קיבל הזדמנות להגיב.**
