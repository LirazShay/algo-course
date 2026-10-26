# ‏47 — Recommendation Sheet: Price Impact / Capacity

> ‏מקור לימודי עיקרי: `../47-PRICE-IMPACT-AND-CAPACITY.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי, ארכיטקטוני ומתודולוגי ל־`Price Impact` ול־`Capacity` עבור רובוט `Short-Horizon Momentum`, כך ש־Position Size יהיה תוצאה של Risk, Liquidity, Impact ו־Time Budget — ולא תוצאה אוטומטית של כמה Capital זמין — וכך שנמדוד Scalable Edge במקום להניח ש־Edge בגודל קטן נשמר לינארית כאשר מגדילים Size.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו המלצה על סכום, אחוז חשבון, מינוף או הגדלת Exposure בכסף אמיתי.

---

## ‏1. Decision

‏`Capacity` תוגדר אצלנו כ־**גבול executable וכלכלי דינמי**, לא כ־Buying Power ולא כ־מספר קבוע לכל Strategy.

‏ה־Baseline:

```text
Predicted Edge
→ Requested Research Size
→ Risk Limit
→ Liquidity / Relative-Size Limit
→ Impact Limit
→ Execution-Time / Signal-TTL Limit
→ Recalculate Expected Net Edge
→ Approved Size or NO TRADE
→ Execution
→ Realized Cost / Markout / Impact Evidence
→ Calibration
```

‏העיקרון המחייב:

```text
More Capital != More Scalable Edge

Capacity
=
how much size the market can absorb
before execution destroys the edge
or makes exit risk unacceptable.
```

‏`Position Size` נשאר Output של Constraints:

```text
FinalSize = min(
    RiskSize,
    LiquiditySize,
    ImpactSize,
    ExposureSize,
    CapitalSize,
    StrategySize,
    AccountSize
)
```

‏מקטע 19 נשאר Source of Truth ל־Risk ownership. מקטע 47 מוסיף את ה־Liquidity/Impact/Capacity evidence שמזין את מגבלת הגודל.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏להפריד Spread, Slippage, Impact, Latency Move ו־Adverse Selection

‏אין להכניס כל פער בין Decision ל־Fill לתיבה אחת בשם `slippage`.

‏נשמור attribution מפורש ככל האפשר:

```text
Explicit Fees
Spread Cost
Latency Move
Sweep / Depth Cost
Temporary Impact Estimate
Persistent Move Estimate
Adverse Selection / Markout
Opportunity Cost
Unknown Residual
```

‏כאשר attribution אינו ידוע, נשמור `UNKNOWN` או Estimate עם Confidence — לא certainty מומצאת.

### ‏`P0 — Required`: ‏Size נמדד יחסית ל־Liquidity, לא רק אבסולוטית

‏נשמור לפחות כמה יחסי Size:

```text
qty_to_top_depth
qty_to_n_level_depth
notional_to_recent_dollar_volume
qty_to_recent_share_volume
estimated_participation
```

‏אותו Quantity יכול להיות זניח ב־Symbol אחד ומשמעותי מאוד באחר.

### ‏`P0 — Required`: ‏Recent Liquidity חייבת להתאים ל־Signal Horizon

‏ל־Strategy של שניות, `ADV` או Daily Volume לבדם אינם Capacity evidence מספיק.

‏נעדיף Inputs point-in-time כגון:

```text
dollar_volume_1s
dollar_volume_5s
dollar_volume_10s
dollar_volume_30s
dollar_volume_60s
trade_rate
spread
near_touch_depth
book_churn
```

‏Daily statistics יכולים להיות Context, לא תחליף למצב הנוכחי.

### ‏`P0 — Required`: ‏`ExecutableCapacity != EventuallyFillableCapacity`

‏Size שניתן אולי להשלים לאחר זמן רב אינו Capacity אמיתית כאשר ה־Signal קצר.

‏ה־Capacity Contract חייב לכלול:

```text
signal_ttl
expected_time_to_fill
order_ttl
execution_deadline
```

‏אם completion horizon ארוך מה־Signal horizon, זו Failure של Capacity גם אם eventual fill אפשרי.

### ‏`P0 — Required`: ‏Entry Capacity ו־Exit Capacity הן בעיות שונות

‏ב־Entry אפשר לבחור:

```text
REDUCE_SIZE
WAIT
CHOOSE_DIFFERENT_CANDIDATE
NO_TRADE
```

‏ב־Exit המטרה יכולה להיות Risk Reduction גם במחיר execution cost גבוה יותר.

‏לכן נשמור שני Contracts:

```text
EntryCapacityAssessment
ExitCapacityAssessment
```

‏אין להשתמש ב־Entry comfort כראיה שה־Position יהיה קל ל־flatten תחת stress.

### ‏`P0 — Required`: ‏Working / Partial / Unknown Exposure נספרים

‏Capacity פנויה ברמת Symbol/Account חייבת לקחת בחשבון:

```text
confirmed_position
working_orders
partial_fills
cancel_pending
unknown_effect_quantity
```

‏Pending Orders אינם Capacity חופשית.

### ‏`P0 — Required`: ‏`UNKNOWN Capacity` לעולם אינה Unlimited Capacity

‏אם data חסרה, stale, gapped או degraded:

```text
capacity_confidence = LOW | UNKNOWN
```

‏ולא:

```text
impact = 0
capacity = infinite
```

‏Reason Code אפשרי:

```text
NO_TRADE_CAPACITY_UNKNOWN
```

### ‏`P0 — Required`: ‏Resize מחייב Revalidation מלאה

‏Pipeline:

```text
Requested Size
→ Capacity Limit
→ Approved Size
→ Recalculate Costs / Net Edge
→ Re-run Risk / Safety / Min Economic Size
→ TRADE or NO TRADE
```

‏Size קטן יותר יכול לשפר Impact אך להפוך Fixed Costs למשמעותיים מדי. לכן Resize אינו “אישור אוטומטי”.

### ‏`P0 — Required`: ‏אין Entry מעל Approved Size

‏Invariant:

```text
submitted_entry_qty <= approved_capacity_qty
```

‏גם Operator, Strategy או Execution component אינם רשאים לעקוף את ה־Capacity Decision ללא Safety/Audit contract מפורש.

### ‏`P0 — Required`: ‏Exit Path חייב להיות plausible לפני Entry

‏לא נכנסים ל־Position כאשר Capacity analysis מראה שאין דרך סבירה לנהל/להקטין Exposure תחת assumptions שמרניים.

‏זה אינו אומר שאפשר להבטיח Exit; הוא אומר שאסור להתעלם מראש מ־Time-to-Flat ו־Stress Liquidity.

### ‏`P1 — Preferred Default`: ‏Fixed Small Research Size הוא ה־Champion

‏ה־Champion הראשוני נשאר:

```text
Fixed Small Research Size
+ Hard Maximum
+ Spread Gate
+ Recent Activity Gate
+ L1 / Short-Depth Sanity
+ Marketable-Limit Price Protection
+ Full Execution Logging
```

‏זה מאפשר למדוד קודם Signal/Execution בלי לערבב adaptive sizing מורכב.

### ‏`P1 — Preferred Default`: ‏Capacity Fast Path לכל ה־Universe

‏לכל Symbol נחשב רק features זולים:

```text
spread_ticks
spread_bps
recent_trade_rate
recent_dollar_volume
best_bid_size
best_ask_size
basic_relative_size
market_data_quality
```

‏מטרתו Screening, לא Impact prediction מדויק.

### ‏`P1 — Preferred Default`: ‏Deep Capacity Check רק ל־Top-N

‏ל־Top candidates בלבד אפשר להוסיף:

```text
multi_level_depth
expected_sweep_vwap
levels_consumed_estimate
short_window_participation
book_resilience
book_churn
liquidity_half_life
route / broker capability
capacity_confidence
```

‏Heavy simulation לכל ~4,000 symbols בכל event אינה Baseline.

### ‏`P1 — Preferred Default`: ‏Capacity היא Range / Region, לא נקודה קסומה

‏נשתמש בשפה:

```text
COMFORTABLE
DEGRADING
MARGINAL
UNPROFITABLE
UNSAFE_OR_UNKNOWN
```

‏ולא נציג `capacity = $X.XX` כ־Truth מדויקת כאשר המודל וה־market state אינם תומכים בדיוק כזה.

### ‏`P1 — Preferred Default`: ‏Capacity Confidence הוא חלק מה־Decision

‏Baseline:

```text
HIGH
MEDIUM
LOW
UNKNOWN
```

‏Confidence יושפע מ־:

```text
book freshness
coverage
sequence integrity
relative-size evidence
sample support
regime similarity
latency-to-liquidity-half-life
model calibration
```

### ‏`P1 — Preferred Default`: ‏Sizing הוא `min()` של Constraints

‏נרחיב את Contract משלב 19:

```text
final_quantity = min(
    quantity_by_capital,
    quantity_by_trade_risk,
    quantity_by_liquidity,
    quantity_by_impact_budget,
    quantity_by_execution_time,
    quantity_by_strategy_limit,
    quantity_by_account_limit
)
```

‏`BindingConstraint` נשמר במפורש.

---

## ‏3. Why

‏ה־Strategy שלנו מחפשת Edge קצר יחסית.

‏כאשר Expected Move קטן:

```text
1 bp extra spread/slippage/impact
```

‏יכול להיות חלק משמעותי מה־Edge כולו.

‏לכן Size אינו רק Risk knob.

‏הוא משפיע על:

```text
fill path
price paid
partial-fill rate
time to fill
signal age at completion
adverse selection
exit difficulty
```

‏Scaling יכול לשנות את ה־Strategy עצמה.

---

## ‏4. Core Economic Model

‏נשתמש ב־chain:

```text
PredictedGrossEdge
- ExplicitCosts
- SpreadCost
- ExpectedSlippage
- ExpectedImpact
- ExpectedAdverseSelection
- OpportunityCost
- SafetyMargin
=
ExpectedNetEdge(size)
```

‏Capacity economic frontier מתקרבת כאשר:

```text
ExpectedNetEdge(size) -> 0
```

‏אבל ה־Production/Research operating region צריך להיות שמרני יותר מה־theoretical break-even.

---

## ‏5. Spread / Slippage / Impact / Adverse Selection

### ‏Spread Cost

‏Cost שהיה קיים גם ל־tiny order תחת אותה urgency.

### ‏Slippage

‏Difference מול Benchmark מוגדר מראש.

### ‏Market Impact

‏Price/Execution degradation שנגרם לפחות חלקית מהאינטראקציה של Order שלנו עם ה־Market.

### ‏Adverse Selection

‏Outcome לאחר Fill conditional on being filled.

### ‏Latency Move

‏Market move שהתרחש בזמן שהמערכת/ברוקר/route פעלו, גם אם Size שלנו היה זניח.

‏ב־RCA לא נכריח attribution אם אין Evidence.

---

## ‏6. Relative Size Baseline

‏נחשב Inputs נפרדים ולא Composite יחיד בהתחלה:

```text
qty_to_top_depth
qty_to_l3_depth
qty_to_l5_depth
notional_to_recent_5s_dollar_volume
notional_to_recent_30s_dollar_volume
participation_estimate
levels_needed_estimate
```

‏הם `Features`, לא Universal Rules.

---

## ‏7. Participation Rate

‏Concept:

```text
ParticipationRate
=
OurExecutedVolume / MarketVolumeDuringExecutionWindow
```

‏אבל Participation ללא Context חלשה.

‏נשמור לצדה:

```text
spread
volatility
depth
trade_rate
book_churn
regime
time_of_day
```

‏אין threshold אוניברסלי כמו “10% תמיד בטוח”.

---

## ‏8. Aggressive Capacity

‏ל־Marketable execution השאלה היא:

```text
How much liquidity can we consume
within the price / edge budget
before the signal becomes uneconomic?
```

‏Baseline pre-trade estimate:

```text
Displayed N-Level Depth
→ Expected Sweep VWAP(size)
→ Price Protection
→ Impact Budget
→ Net Edge Recheck
```

‏ה־N-Level Sweep הוא estimate אופטימי יחסית כי Book יכול להשתנות לפני arrival/fill.

---

## ‏9. Passive Capacity

‏Passive capacity אינה “כמה shares אפשר להניח ב־Bid”.

‏היא תלויה ב־:

```text
queue_ahead
fill_probability
time_to_fill
signal_ttl
partial_fill risk
adverse_selection
missed_opportunity
```

‏מקטע 38 נשאר Source of Truth ל־Queue uncertainty; מקטע 46 ל־Outcome conditional on Fill.

‏Passive Capacity therefore requires both:

```text
Can we fill enough?
AND
Are those fills economically good enough?
```

---

## ‏10. Queue / Capacity Interaction

‏Priority טובה יכולה להגדיל:

```text
P(Fill)
```

‏אך גם להגדיל exposure ל־toxic flow.

‏לכן:

```text
PassiveCapacityValue
≈
ExpectedFillBenefit
- ExpectedAdverseSelection
- MissedOpportunity
- SignalDecayCost
```

---

## ‏11. Multi-Level Sweep Estimate

‏ל־Top-N ניתן לחשב:

```text
ExpectedSweepVWAP(size)
ExpectedLevelsConsumed(size)
WorstDisplayedPriceNeeded(size)
DisplayedDepthCoverageRatio(size)
```

‏נשמור Metadata:

```text
book_snapshot_id
as_of_time
book_age
book_fidelity
levels_used
provider
formula_version
```

‏Displayed depth אינו Guarantee.

---

## ‏12. Marketable Limit as Price Guard

‏`Protected Marketable Limit` משלב 37 נשאר Control מתאים למחקר aggressive capacity.

‏הוא יכול להגביל:

```text
max_execution_price
max_sweep_distance
```

‏אבל אינו מבטל:

```text
partial fill risk
missed opportunity
book drift
impact inside the permitted range
```

---

## ‏13. Impact Budget

‏נגדיר Concept:

```text
ExpectedImpact(size) <= ImpactBudget
```

‏`ImpactBudget` חייב להיגזר מ־Expected Edge/Cost model ולא מ־magic number.

‏לדוגמה מתודולוגית:

```text
ImpactBudget
<
remaining edge after spread + fees + other costs
```

‏לא נקבע כאן מספר Live.

---

## ‏14. Capacity Curve

‏לכל Strategy/Context נרצה למדוד:

```text
Size
→ Fill Rate
→ Time to Fill
→ Execution Cost
→ Impact Proxy
→ Markout
→ Net Edge Retained
```

‏Capacity אינה Linearity assumption.

‏Book depth בדיד, ולכן Curve יכולה לכלול jumps כאשר Size חוצה Price Level נוסף.

---

## ‏15. Marginal Edge

‏לא מספיק למדוד Average PnL של כל Position.

‏נרצה:

```text
MarginalEdge(size)
=
ExpectedNetPnL(size + Δ)
-
ExpectedNetPnL(size)
```

‏כאשר unit נוספת מפסיקה להוסיף Economic Value, אנחנו באזור Capacity frontier גם אם Average Trade עדיין חיובי.

---

## ‏16. Capacity Regions

‏נגדיר:

```text
COMFORTABLE
DEGRADING
MARGINAL
UNPROFITABLE
UNSAFE_OR_UNKNOWN
```

‏Promotion policy אמורה לבחור Safe Operating Region עם Headroom, לא לעבוד בקצה ה־break-even התיאורטי.

---

## ‏17. Capacity Under Uncertainty

‏לכל context נוכל לשמור:

```text
expected_capacity
conservative_capacity
stress_capacity
capacity_confidence
```

‏Stress scenarios כוללים:

```text
spread expansion
depth reduction
latency spike
fill-probability decline
higher impact
volatility spike
provider degradation
```

---

## ‏18. Tails

‏Average impact/slippage אינו מספיק.

‏נמדוד לכל Size bucket:

```text
median
p75
p90
p95
p99 when sample supports it
worst / stress estimate
```

‏Tail cost הוא חלק מ־Capacity Risk.

---

## ‏19. Normalization

‏Impact יוצג בכמה Units:

```text
absolute price
bps
ticks
spread units
short-horizon volatility units
```

‏זה מאפשר השוואה בין Symbols שונים בלי להניח שכל unit מייצגת אותו Economic meaning.

---

## ‏20. Temporary vs Persistent Impact

‏לא נטען שנוכל לזהות causality מושלמת.

‏נשתמש ב־Post-Execution path כ־estimate:

```text
execution completes
→ immediate post-execution displacement
→ partial decay
→ longer-horizon residual
```

‏נשמור:

```text
impact_estimate
impact_confidence
attribution_method
```

‏ולא `impact_truth` כאשר אין Counterfactual אמיתי.

---

## ‏21. Impact vs Markout

‏מקטע 46 מודד:

```text
Outcome | Fill
```

‏מקטע 47 מודד:

```text
How execution economics changes as size changes
```

‏שניהם נדרשים.

‏Trade יכול לקבל negative markout מסיבות שאינן own impact; Trade גדול יכול ליצור own impact גם אם markout מאוחר חיובי.

---

## ‏22. Book Resilience

‏שני Symbols עם אותו Snapshot depth יכולים לקבל Capacity שונה בגלל Refill/Resilience.

‏Challenger features:

```text
refill_rate
book_churn
liquidity_half_life
post_depletion_recovery_time
```

‏הם `P2/P3`; לא Baseline לפני שה־static inputs עצמם מוכיחים value.

---

## ‏23. Latency-to-Liquidity-Half-Life

‏Diagnostic:

```text
latency_to_liquidity_half_life
=
execution_latency / liquidity_half_life
```

‏כאשר Ratio גבוה, Snapshot-based capacity estimate נעשית פחות אמינה.

‏המדד יקשר למקטע 48.

---

## ‏24. Book Drift

‏נפריד:

```text
DecisionBook
PreSubmitBook
Arrival / Ack Context
Fill Context
```

‏Capacity estimate ב־Decision time אינו evidence שה־same liquidity עדיין קיימת ב־Submit/Fill.

‏לפני Entry Submit נבצע recheck מהיר כאשר policy דורשת.

---

## ‏25. Minimum Economic Size

‏יש גם Floor כלכלי.

```text
MinimumEconomicSize
<=
ApprovedSize
<=
MaximumExecutableSize
```

‏אם אין overlap:

```text
NO_TRADE
```

‏Capacity אינה רק Maximum Size.

---

## ‏26. Resize Loop

‏ה־Baseline:

```text
Proposed Size
→ Capacity Bound
→ Resize
→ Recompute Net Edge
→ Recompute Fixed-Cost Burden
→ Re-run Risk / Safety
→ TRADE or NO_TRADE
```

‏אין “resize and send” ללא Economics recheck.

---

## ‏27. Binding Constraint

‏כל Capacity Decision ישמור:

```text
RISK
LIQUIDITY
IMPACT
EXECUTION_TIME
CAPITAL
EXPOSURE
STRATEGY
ACCOUNT
MIN_ECONOMIC_SIZE
UNKNOWN_DATA
```

‏המערכת חייבת לענות:

```text
Why size 183?
Why not 300?
```

---

## ‏28. Capacity Decision Record

```text
capacity_decision_id
instrument_id
decision_id
intent_id
as_of_time
requested_qty
approved_qty
risk_limit_qty
liquidity_limit_qty
impact_limit_qty
execution_time_limit_qty
capital_limit_qty
exposure_limit_qty
hard_cap_qty
minimum_economic_qty
binding_constraint
expected_impact
expected_net_edge
capacity_region
capacity_confidence
capacity_model_version
cost_model_version
book_snapshot_id
market_data_mode
reason_codes
```

---

## ‏29. Size Feasibility Contract

```text
SizeFeasible =
    CapacityDataValid
    AND ApprovedQty > 0
    AND ExpectedNetEdge > RequiredHeadroom
    AND ExpectedImpact <= ImpactBudget
    AND ExpectedTimeToFill <= SignalTTL
    AND ExitCapacityAcceptable
    AND RiskAllowed
    AND SafetyAllowed
```

‏אם אחד מה־required states הוא `UNKNOWN`, Entry fail-closed לפי policy.

---

## ‏30. Fast Capacity Assessment

```text
FastCapacityAssessment
- spread_ok
- recent_activity_ok
- top_depth_ok
- relative_size
- data_quality
- rough_capacity_region
```

‏הוא Screening בלבד.

---

## ‏31. Deep Capacity Assessment

```text
DeepCapacityAssessment
- expected_sweep_vwap
- levels_consumed
- n_level_depth_ratio
- short_window_participation
- book_churn
- resilience_estimate
- expected_time_to_fill
- expected_impact_distribution
- expected_adverse_selection
- exit_capacity_estimate
- confidence
```

‏Deep Assessment רק ל־Top-N / candidate shortlist.

---

## ‏32. Entry Capacity

‏Entry היא optional Risk Creation.

‏לכן Capacity failure יכול להחזיר:

```text
REDUCE_SIZE
WAIT
RESELECT
NO_TRADE
```

‏אין חובה deploy capital.

---

## ‏33. Exit Capacity

‏Exit assessment שואל:

```text
How much can we reduce,
how fast,
under current and stressed liquidity?
```

‏Metrics:

```text
estimated_time_to_flat
stress_time_to_flat
expected_exit_sweep_cost
exit_depth_ratio
exit_capacity_confidence
```

‏Risk Reduction יכולה לקבל urgency גבוהה יותר גם כאשר execution economics פחות נוחים.

---

## ‏34. Stress Exit Capacity

‏Stress assumptions לפחות:

```text
spread wider
depth lower
volatility higher
latency worse
partial fills higher
```

‏Capacity אינה Safety-worthy אם היא נראית טובה רק תחת normal-market snapshot.

---

## ‏35. Position Size as Output

‏Sizing future architecture:

```text
RiskSize
LiquiditySize
ImpactSize
ExecutionTimeSize
ExposureSize
CapitalSize
StrategySize
AccountSize
→ MIN
→ ApprovedSize
```

‏לא:

```text
Capital available
→ spend it all
```

---

## ‏36. Cross-Strategy / Account Capacity

‏אם בעתיד יש יותר מ־Strategy אחת:

```text
capacity_by_symbol
```

‏חייבת להיות Account-aware.

‏Working orders של Strategy A משפיעים על Capacity של Strategy B.

‏לא נבנה זאת ב־MVP אם יש Strategy אחת, אבל ה־Contract לא ימנע זאת בעתיד.

---

## ‏37. Aggregate Intent

‏לפני execution, העתיד יכול לכלול:

```text
net_intent_by_symbol
pending_exposure
approved_remaining_capacity
```

‏כדי להימנע מ־self-competition ו־double allocation.

---

## ‏38. Order Slicing

‏Slicing אינו יוצר Liquidity.

‏הוא רק משנה trade-off:

```text
smaller instantaneous footprint
vs
longer execution time
vs
higher signal-decay risk
vs
more message/order-state complexity
```

‏לכן Slicing הוא Execution Challenger, לא Capacity fix אוטומטי.

---

## ‏39. Broker Algos

‏`TWAP`, ‏`VWAP`, ‏`POV` ו־`Accumulate/Distribute` משלב 41 אינם פתרון Capacity אוטומטי.

‏הם רלוונטיים רק כאשר:

```text
execution objective
+
signal horizon
+
size problem
```

‏מתאימים.

‏ל־seconds signal, schedule ארוך יכול למחוק את ה־Edge.

---

## ‏40. Urgency vs Impact

```text
Higher urgency
→ shorter time-to-fill
→ potentially higher spread / sweep / impact

Lower urgency
→ potentially lower instantaneous impact
→ higher signal-decay / no-fill / opportunity cost
```

‏אין צד “נכון” אוניברסלית; זו frontier מחקרית.

---

## ‏41. Capacity by Candidate

‏נפריד:

```text
Prediction Rank
!=
Executable Rank
!=
Scalable Rank
```

‏Candidate #1 יכול להיות Predictively חזק אך Capacity-poor.

‏Candidate #2 יכול להיות מעט חלש יותר Predictively אך לשמור יותר Net Edge בגודל המחקרי המבוקש.

‏Candidate replacement נשאר ניסוי נפרד; לא יופעל ad hoc.

---

## ‏42. Scalable Alpha

‏נגדיר:

```text
ScalableAlpha(size)
=
PredictedEdge
- SizeDependentExecutionTax
```

‏ולא נניח:

```text
GrossAlpha(size=small)
=
GrossAlpha(size=large)
```

---

## ‏43. Capacity Frontier

‏Research graph:

```text
Size
→ ExpectedNetEdge
→ TailExecutionCost
→ TimeToFill
→ ExitCapacity
```

‏היעד אינו maximum nominal PnL בלבד.

‏היעד הוא Safe Operating Region עם positive net edge + headroom + manageable exit risk.

---

## ‏44. Capital Scaling is a New Experiment

‏כל שינוי משמעותי ב־Size Policy יירשם כניסוי חדש.

‏Scaling משנה:

```text
fill path
participation
partial fills
time to fill
impact
holding behavior
exit behavior
```

‏ולכן אינו “אותה Strategy עם multiplier”.

---

## ‏45. Research Scaling Ladder

‏ה־Playbook המחקרי משתמש ב־sizes יחסיים, לדוגמה:

```text
0.5x baseline
1.0x baseline
2.0x baseline
4.0x baseline
```

‏אלו Experiment Multipliers, לא המלצה לכמות כסף או Exposure אמיתי.

‏בכל Size נמדוד:

```text
expected net return
fill probability
time to fill
partial fill rate
slippage
impact proxy
markout
MAE / MFE
missed opportunity
exit feasibility
```

---

## ‏46. Historical Capacity Limits

‏Historical Backtest יכול להעריך Scaling רק לפי data שהייתה ידועה point-in-time.

‏אסור להשתמש ב־full-day volume כדי להחליט Capacity בשעה מוקדמת באותו יום.

‏Allowed:

```text
volume already observed
book state already observed
PIT historical baseline
PIT forecast trained correctly
```

‏Forbidden:

```text
future day volume
future depth
future fills
future cancellations
```

---

## ‏47. Replay Limitations

‏Replay יכול לשחזר:

```text
inputs
capacity decision
order policy
simulated fill model
```

‏אבל אינו יכול לדעת בוודאות איך השוק היה מגיב ל־hypothetical larger order שלא נשלח.

‏לכן Capacity counterfactuals חייבים Confidence/Fidelity tag.

---

## ‏48. Capacity Fidelity Ladder

```text
C0 — No size-dependent execution model
C1 — L1 relative-size / spread / activity
C2 — L1 + empirical size buckets
C3 — Multi-level displayed sweep model
C4 — Flow / resilience / regime-conditioned model
C5 — Route / venue-calibrated execution model
```

‏אין לקפוץ ל־`C5` לפני ש־`C1/C2` מראים שהמשפחה מוסיפה value.

---

## ‏49. Shadow Capacity

‏אפשר לחשב hypothetical larger/smaller sizes ב־Shadow לצורכי Screening.

‏אבל:

```text
shadow larger order
!=
proof of real impact
```

‏כי השוק לא ראה את ה־hypothetical order.

---

## ‏50. Paper Limitations

‏Paper שימושי ל־:

```text
state machine
sizing contracts
partial-fill handling
risk / safety integration
logging / replay
```

‏הוא אינו Evidence מלא ל־Market Impact אמיתי.

---

## ‏51. Research Promotion Path

‏בשלב הנוכחי:

```text
Historical estimation
→ Deterministic Replay
→ Shadow capacity decisions
→ Paper lifecycle validation
→ Future production calibration only under applicable authorization and controls
```

‏מקטע זה אינו נותן הוראות להגדלת Exposure אמיתי.

---

## ‏52. Capacity Model Champion / Challenger

### ‏Champion

```text
Fixed Small Research Size
+ simple gates
```

### ‏Challenger 1

```text
Relative Size Buckets
+ Recent Dollar Volume
```

### ‏Challenger 2

```text
+ Multi-Level Sweep Estimate
```

### ‏Challenger 3

```text
+ Resilience / Regime / Route Context
```

‏כל שכבה חייבת להראות incremental net value.

---

## ‏53. Empirical Buckets First

‏לפני model מתמטי מורכב נתחיל ב־buckets כגון:

```text
relative_size_bucket
participation_bucket
spread_bucket
liquidity_bucket
```

‏הגבולות עצמם ייבחרו במסגרת Experiment Registry ולא כ־magic constants.

---

## ‏54. Confounding

‏Size אינו מוקצה אקראית בדרך כלל.

‏למשל:

```text
stronger signal
→ larger requested size
```

‏יכול לגרום לנו לייחס Market Move ל־Size במקום ל־Signal.

‏לכן analysis של Impact צריך Matched Context / controlled research design.

---

## ‏55. Matched Comparison

‏נשווה ככל האפשר לפי:

```text
symbol / liquidity group
time of day
regime
spread
volatility
signal strength
execution mode
```

‏ואז נבדוק Size effect.

---

## ‏56. Impact Elasticity

‏Diagnostic:

```text
DeltaImpact / DeltaSize
```

‏אין assumption שהקשר לינארי.

‏עלייה חדה ב־marginal impact מצביעה על Capacity degradation.

---

## ‏57. Impact Stress Multipliers

‏ב־Replay/Research נבדוק לפחות sensitivity:

```text
0.5x modeled impact
1.0x
1.5x
2.0x
```

‏מטרת הבדיקה היא Fragility, לא Forecast מדויק.

---

## ‏58. Impact Headroom

‏נשמור:

```text
impact_headroom
=
net_edge_before_modeled_impact
-
modeled_impact
```

‏Trade עם Headroom קטן מאוד הוא execution-fragile גם אם Expected Net Edge עדיין מעט חיובי.

---

## ‏59. Capacity Headroom

‏Production-style architecture לא אמורה לפעול תמיד בגבול Capacity התיאורטי.

‏נרצה מרווח מול:

```text
model error
liquidity drift
latency tails
spread shock
stress exit
```

---

## ‏60. Capacity Confidence Decay

‏Capacity cache חייב timestamp:

```text
capacity_computed_at
capacity_age_ms
capacity_ttl
```

‏ב־fast regime Confidence יכולה לרדת מהר יותר.

‏Estimate stale אינו “האחרון ולכן תקף”.

---

## ‏61. Feature Availability Contract

```text
capacity_inputs_status:
  spread: KNOWN | UNKNOWN
  recent_volume: KNOWN | UNKNOWN
  l1_depth: KNOWN | UNKNOWN
  l2_depth: KNOWN | UNKNOWN
  volatility: KNOWN | UNKNOWN
  broker_capabilities: KNOWN | UNKNOWN
```

‏Model יודע איזה Fidelity זמין כרגע.

---

## ‏62. No Silent Degradation

‏אם Model נבנה ל־L2 וה־Feed ירד ל־L1:

```text
CAPACITY_MODE = L1_DEGRADED
```

‏לא משתמשים באותו score/model כאילו Feature set מלא.

---

## ‏63. Capacity Model Versioning

‏כל Decision ישמור:

```text
capacity_model_version
feature_version
provider_version
book_builder_version
cost_model_version
execution_policy_version
```

‏שינוי Formula או Input semantics יוצר Experiment boundary חדש.

---

## ‏64. Broker / Routing Capabilities

‏Capacity Engine מקבל capabilities מה־Adapter.

‏אין hard-code של:

```text
route supports X
broker accepts Y
algo always available
```

‏אם שימוש עתידי יהיה תלוי ב־Broker/Venue-specific size/routing/algo limits, נדרש Current Verification באותו זמן.

---

## ‏65. Market Data Provider ≠ Execution Broker

‏אפשר להשתמש ב־Data Provider עשיר וב־Broker אחר לביצוע.

‏אבל Capacity אמתית היא של כל ה־path:

```text
Data
→ Decision
→ Broker
→ Router
→ Venue
→ Fill
```

‏Cross-provider divergence חייב Observability.

---

## ‏66. Observability

‏Dashboard בסיסי:

```text
requested_qty
approved_qty
resize_ratio
binding_constraint
capacity_region
capacity_confidence
expected_impact
realized_slippage
participation
levels_consumed
time_to_fill
partial_fill_rate
exit_time_to_flat
```

---

## ‏67. Calibration

‏נמדוד:

```text
expected_impact
vs
realized_execution_cost_proxy
```

‏Residual:

```text
impact_residual
=
realized_proxy - expected_impact
```

‏נעקוב אחר Distribution, לא רק Mean.

---

## ‏68. Impact Drift

‏Possible drift indicators:

```text
expected vs realized impact
expected vs realized time to fill
expected vs realized participation
slippage residual
capacity rejection rate
resize ratio distribution
```

‏Drift משמעותי מפעיל RCA/Shadow disable/return to Fixed Small Size according to policy — לא auto-retune בלתי מבוקר.

---

## ‏69. Capacity Rejection Rate

```text
capacity_rejected
/
eligible_candidate_decisions
```

‏אם Rate עולה משמעותית, ייתכן:

```text
market regime deterioration
scanner choosing unscalable names
capital / size mismatch
model drift
```

---

## ‏70. Resize Ratio

```text
resize_ratio
=
approved_qty / requested_qty
```

‏Distribution של Resize Ratio היא diagnostic על התאמה בין Opportunity Set ל־Size request.

---

## ‏71. Capacity Opportunity Cost

‏ל־Rejected/Resized candidate נשמור:

```text
what happened to candidate #1?
what happened to #2 / next candidate?
what was unused capital / capacity?
```

‏Candidate fallback אינו Baseline עד experiment נפרד.

---

## ‏72. Idle Capital

‏Idle Capital אינה Failure אוטומטית.

‏אם אין Opportunity שמסוגלת לקלוט Size בלי למחוק Edge:

```text
NO_TRADE
```

‏עדיף על Forced Deployment.

---

## ‏73. Portfolio / Market-Wide Stress

‏בעתיד, Capacity stress צריך לקחת בחשבון ש־Liquidity יכולה להידרדר Cross-Sectionally יחד:

```text
spreads widen together
depth falls together
latency rises
rejects rise
```

‏אין assumption של independent liquidity בזמן stress.

---

## ‏74. Capacity / Safety Interaction

‏Hard absolute Size Cap נשאר Safety ceiling.

‏Adaptive Capacity הוא Soft dynamic ceiling.

```text
approved_qty
<= soft_capacity_cap
<= hard_safety_cap
```

‏Hard Cap אינו Impact Model.

---

## ‏75. Manual Override

‏Override מעל Capacity recommendation הוא Risk/Safety event.

‏הוא חייב לפחות:

```text
override_actor
override_reason
previous_limit
new_limit
timestamp
incident / approval context
```

‏Baseline המחקרי אינו מסתמך על Manual Overrides.

---

## ‏76. Invariants

```text
ApprovedQty <= RequestedQty
ApprovedQty <= HardCap
ApprovedQty <= RiskSize
ApprovedQty <= LiquiditySize
ApprovedQty <= ImpactSize
UnknownLiquidity never increases ApprovedQty
WorkingExposure counts against capacity
Resize requires NetEdge revalidation
Entry requires plausible Exit capacity
Same inputs + same versions => same CapacityDecision
```

---

## ‏77. Unit Tests

‏נבדוק לפחות:

```text
relative-size calculations
participation calculations
sweep-vwap calculation
minimum-economic-size intersection
impact budget
binding constraint selection
resize loop
confidence decay
```

---

## ‏78. Property Tests

```text
Increasing a hard limit downward cannot increase ApprovedQty
Removing known liquidity cannot increase ApprovedQty
UNKNOWN cannot improve Capacity state
ApprovedQty cannot exceed any binding hard constraint
Zero approved qty cannot produce Entry Intent
```

‏אין Property שאומר Impact חייב להיות לינארי.

---

## ‏79. Golden Scenarios

1. ‏Deep stable book — small requested size.
2. ‏Thin book — same requested size.
3. ‏Wide spread.
4. ‏Fast disappearing depth.
5. ‏High recent volume but low current depth.
6. ‏Deep L1 but poor deeper levels.
7. ‏Partial Fill.
8. ‏High Participation.
9. ‏Sequence/Data gap.
10. ‏Capacity estimate becomes stale before submit.
11. ‏Resize below minimum economic size.
12. ‏Existing working order consumes remaining capacity.
13. ‏Stress exit depth collapses.
14. ‏Book improves but signal TTL becomes too short.
15. ‏Impact model unavailable while Exit is required.

---

## ‏80. Replay Tests

‏אותו Event Stream + same configs/versions חייב להפיק:

```text
same CapacityDecision
same approved quantity
same binding constraint
same reason codes
```

‏Hypothetical larger-order market reaction נשאר model-based, לא deterministic truth.

---

## ‏81. Differential Tests

‏נריץ:

```text
Champion: Fixed Small Size
Challenger: Capacity-aware Size
```

‏על אותם Decision inputs.

‏נשמור:

```text
changed_decision
size_delta
expected_net_edge_delta
simulated_execution_delta
confidence
```

---

## ‏82. Stress Tests

‏לפחות:

```text
spread x2
depth -50%
latency spike
provider degraded
impact x1.5 / x2
partial-fill probability higher
volatility spike
```

‏Promotion צריך לשרוד Reasonable Stress, לא רק Median Market.

---

## ‏83. Performance Tests

‏Capacity logic אינה רשאית להפוך את Scanner bottleneck.

‏נמדוד:

```text
capacity_fast_path_p50/p95/p99
deep_capacity_p50/p95/p99
queue_age introduced by capacity work
candidate_ttl consumed by capacity work
```

---

## ‏84. Failure Modes

```text
CAPACITY_DEPTH_TOO_LOW
CAPACITY_SPREAD_TOO_WIDE
CAPACITY_IMPACT_BUDGET_EXCEEDED
CAPACITY_TTL_TOO_SHORT
CAPACITY_CONFIDENCE_LOW
CAPACITY_PARTIAL_FILL_RISK
CAPACITY_STRESS_FAILED
CAPACITY_DATA_STALE
CAPACITY_DATA_GAPPED
CAPACITY_EXIT_TOO_WEAK
CAPACITY_MIN_ECONOMIC_SIZE_FAILED
CAPACITY_HARD_CAP
CAPACITY_PENDING_EXPOSURE
CAPACITY_MODEL_UNAVAILABLE
CAPACITY_MODEL_DRIFT
CAPACITY_UNKNOWN
```

---

## ‏85. RCA

‏ב־Capacity failure נשאל:

1. ‏מה היה Requested vs Approved Size?
2. ‏מה היה Binding Constraint?
3. ‏מה היה spread/depth/recent volume?
4. ‏מה היה Capacity age/confidence?
5. ‏מה היה Expected vs Realized execution cost?
6. ‏כמה levels נצרכו?
7. ‏האם Book drifted בין Decision ל־Submit/Fill?
8. ‏האם latency עלתה?
9. ‏האם partial fills האריכו את execution?
10. ‏האם adverse selection נראתה כמו impact?
11. ‏האם #2 היה יותר scalable?
12. ‏האם Exit capacity הייתה חלשה יותר ממה שהנחנו?

‏נחפש First Divergence, לא רק “slippage גבוה”.

---

## ‏86. Success RCA

‏גם Execution גדול שנראה טוב אינו הוכחת Capacity.

‏נבדוק האם הצלחה נבעה מ־:

```text
stable displayed depth
fast replenishment
hidden liquidity coincidence
favorable market move
low participation
better-than-normal regime
```

‏Success שאינו repeatable אינו Promotion evidence חזק.

---

## ‏87. Metrics

### ‏Core

```text
requested_qty
approved_qty
resize_ratio
binding_constraint
capacity_region
capacity_confidence
```

### ‏Liquidity

```text
qty_to_top_depth
qty_to_n_level_depth
notional_to_recent_dollar_volume
participation_rate
levels_consumed
```

### ‏Execution

```text
fill_rate
partial_fill_rate
time_to_first_fill
time_to_full_fill
implementation_shortfall
slippage
markout
```

### ‏Impact

```text
expected_impact
realized_impact_proxy
impact_residual
impact_spread_units
impact_bps
```

### ‏Risk / Exit

```text
estimated_time_to_flat
stress_time_to_flat
exit_capacity_confidence
pending_exposure
```

### ‏Economics

```text
expected_net_edge
net_edge_retained
execution_tax
impact_headroom
minimum_economic_size_pass_rate
```

---

## ‏88. Primary KPI

‏ה־Primary economic KPI:

```text
Net Edge Retained by Size Bucket
```

‏ולצדו:

```text
Tail Execution Cost
Exit Capacity
Capacity Confidence
```

‏PnL Nominal לבדו אינו Primary capacity metric.

---

## ‏89. Promotion Criteria

‏Capacity-aware sizing מתקדם מעבר ל־Shadow רק אם:

1. ‏ה־Decision Contract דטרמיניסטי ו־Replayable.
2. ‏No leakage ב־volume/depth/features.
3. ‏Impact/Cost relationship מראה direction סביר ו־calibration שימושית.
4. ‏Net Edge Retained משתפר OOS מול Fixed Small Size.
5. ‏Improvement מופיע גם על changed decisions, לא רק aggregate PnL.
6. ‏Tail slippage/impact אינם מחמירים באופן לא מקובל.
7. ‏Partial fill / time-to-fill נשארים בשליטה.
8. ‏Exit capacity אינה נפגעת.
9. ‏Latency tax של המודל אינו מוחק את השיפור.
10. ‏Model drift/UNKNOWN handling fail-closed.
11. ‏Stress tests עוברים.
12. ‏Complexity tax מוצדקת.

---

## ‏90. Rejection Criteria

‏נדחה/נפשט Capacity model אם:

```text
Fixed Small Size performs equally or better
impact relationship is unstable
benefit exists only in-sample
benefit exists only under optimistic fill assumptions
latency cost offsets benefit
tails worsen materially
exit capacity degrades
model relies on unavailable data
unknown/degraded states become frequent
complexity makes RCA unreliable
```

---

## ‏91. Alternatives

### ‏Alternative A — Fixed Small Size

‏ה־Champion.

‏יתרונות:

```text
simple
replayable
low degrees of freedom
clean research attribution
```

‏חסרון:

```text
may underuse strong liquidity opportunities
```

### ‏Alternative B — Simple Relative-Size Cap

‏למשל model מבוסס depth/recent volume בלבד.

‏זה ה־first Challenger.

### ‏Alternative C — Empirical Impact Buckets

‏`P2` כאשר יש sample מספיק.

### ‏Alternative D — Regime / Route-aware Capacity

‏`P3` אחרי Evidence.

### ‏Alternative E — Complex statistical / learned impact model

‏`P4`, רק אם simpler models plateau וה־data/latency מצדיקים.

---

## ‏92. Trade-offs

### ‏Fixed Size

‏פחות utilization, יותר simplicity.

### ‏Adaptive Size

‏פוטנציאל utilization טוב יותר, אבל יותר:

```text
model risk
latency
feature dependencies
failure modes
overfitting
```

### ‏Aggressive execution

‏מהיר יותר, אך impact/sweep גבוהים יותר.

### ‏Passive execution

‏פחות immediate impact, אך queue/no-fill/adverse-selection/time cost גבוהים יותר.

---

## ‏93. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏Complex nonlinear impact model.
- ‏Per-symbol tuned capacity rules.
- ‏Hidden-liquidity assumptions.
- ‏MBO requirement לכל Universe.
- ‏Venue-specific capacity optimization.
- ‏POV/TWAP/VWAP כפתרון אוטומטי.
- ‏Capital deployment target של 100%.
- ‏Impact threshold “מקצועי” שנלקח ממישהו אחר.
- ‏Sizing proportional ישירות ל־Score.
- ‏Scaling בלי experiment/version boundary.
- ‏Paper fills כהוכחה ל־real impact.

---

## ‏94. What to Add Later

‏רק אם Evidence מצדיק:

```text
multi-level empirical impact curves
resilience features
route-conditioned capacity
execution-mode-specific capacity
market-level capacity stress
cross-strategy capacity coordinator
capacity-aware candidate selection
advanced matched-sample / causal analysis
learned impact model
```

---

## ‏95. Required Data / Evidence

‏לפחות:

```text
decision timestamp
requested / approved quantity
bid / ask / spread
recent trades / dollar volume
book depth when available
execution intent
order / fill timestamps
fill quantities / prices
partial-fill sequence
route / venue when known
markout curve
cost model
risk / safety state
provider / feature versions
```

‏ל־deep impact research:

```text
multi-level book
book updates / churn
sequence integrity
own-trade markers
execution episode grouping
```

---

## ‏96. Fact / Judgment / Hypothesis

### ‏Facts / Engineering truths

‏Within our model:

```text
Capital availability does not guarantee executability.
Working orders consume exposure/capacity.
Displayed depth is not guaranteed future liquidity.
Paper cannot prove true market impact.
Scaling changes execution conditions.
Missing capacity data is not zero impact.
```

### ‏Judgments

‏המלצת ה־Playbook:

```text
Fixed Small Research Size first.
Simple relative-size capacity next.
Multi-level impact only after L1 evidence.
Safe Operating Region over theoretical frontier.
Exit capacity is required before Entry promotion.
```

### ‏Hypotheses

‏דורשות בדיקה:

```text
relative-size predicts execution degradation
multi-level sweep estimate improves sizing
capacity-aware resizing improves net edge
candidate #2 can beat #1 after scalability adjustment
resilience improves impact prediction
```

---

## ‏97. Confidence

### ‏High Confidence

- ‏Capacity אינה Buying Power.
- ‏Size חייב להיכנס ל־execution economics.
- ‏Risk + Liquidity + Impact constraints צריכים לעבוד יחד.
- ‏Working/Pending exposure חייב להיספר.
- ‏Resize דורש Net Edge recheck.
- ‏Historical Capacity חייבת להיות point-in-time.
- ‏Paper אינו מוכיח true Impact.
- ‏Entry/Exit Capacity שונות.
- ‏UNKNOWN חייב להיות שמרני.

### ‏Medium Confidence

- ‏Relative-size buckets כ־first adaptive challenger.
- ‏Multi-level displayed sweep כ־useful estimate.
- ‏Capacity regions/headroom כ־policy representation.
- ‏Resilience/liquidity-half-life כ־next-stage features.

### ‏Low / Evidence-dependent

- ‏Exact break-even size.
- ‏Exact impact function.
- ‏Venue-specific capacity advantage.
- ‏Learned impact model.
- ‏Score-driven dynamic sizing.
- ‏Cross-sectional executable-rank replacement policy.

---

## ‏98. Time-Sensitive Facts

‏מקטע 47 אינו מקבע כרגע Broker/Venue fee, routing limit, order-size limit או regulation משתנים בזמן.

‏לכן לא נדרש Web verification חדש לצורך ה־Recommendation המתודולוגי הזה.

‏לפני implementation שתלוי ב־Broker/Venue ספציפיים יש לאמת בזמן אמת:

```text
order size constraints
route / algo capabilities
market-data depth entitlement
venue-specific order semantics
fees / rebates
session / product eligibility
```

---

## ‏99. Relationship to Earlier Sheets

### ‏18 — True Trading Costs / Net Edge

‏47 הופך `impact` ו־size-dependent execution tax לרכיב מפורש ב־Net Edge chain.

### ‏19 — Position Sizing / Risk

‏19 מחזיק ownership על final sizing/risk. ‏47 מספק `LiquiditySize`, ‏`ImpactSize` ו־Capacity Confidence.

### ‏21 — Realistic Execution Backtest

‏Capacity simulation חייב להשתמש fill/depth assumptions שמרניים ולא Touch=Fill.

### ‏37 — Advanced Order Tactics

‏Price protection ו־ExecutionPlan חייבים לכבד Capacity/Impact Budget.

### ‏38 — Queue Position

‏Passive Capacity משתמשת ב־Fill probability ו־queue uncertainty.

### ‏39 — Routing

‏Route הוא חלק מ־Executable Capacity, אך routing optimization נשאר Challenger.

### ‏40 — Hidden / Reserve / ATS

‏Hidden liquidity אינה Quantity מובטחת במודל Capacity.

### ‏41 — Broker Algos

‏Capacity problem יכול בעתיד להצדיק Algos מסוימים, אבל רק אם Signal Horizon מתאים.

### ‏43 — Halts / Fast Markets

‏Stress liquidity ו־Reopen capacity שונות מ־normal state.

### ‏44–45 — Flow / Book

‏Flow, Depth, Churn ו־Resilience הם Inputs אפשריים ל־Capacity, עם quality/provenance.

### ‏46 — Adverse Selection

‏Capacity אינה רק Impact. Size/Execution Policy חייבים לשקלל גם Outcome conditional on Fill.

---

## ‏100. User-Specific Application

‏למערכת שלנו יש מאפיינים:

```text
whole-market scanner
short signal lifetime
Top-N candidate handoff
seconds-oriented momentum
separate market data / broker
single-position research baseline
```

‏לכן:

1. ‏לא צריך institutional-style impact infrastructure בגרסה הראשונה.
2. ‏Whole-market Fast Path נשאר זול; deep capacity רק ל־Top-N.
3. ‏Fixed Small Research Size הוא Benchmark חיוני.
4. ‏ה־Capacity question היא קודם כל: האם Candidate ניתן לביצוע לפני שה־Signal מת?
5. ‏#1 Predictive אינו אוטומטית #1 Scalable.
6. ‏`Always Invested` אינו יעד אם Liquidity/Capacity אינה תומכת בו.
7. ‏Exit feasibility חשובה במיוחד משום שה־Strategy מחפשת holding horizons קצרים.
8. ‏Any adaptive sizing חייב להוכיח incremental value מעבר ל־simple fixed baseline.

---

## ‏101. Recommended Research Baseline

```text
Whole-Market Scanner
→ Fixed Small Research Size Proposal
→ Fast Capacity Screen
→ Top-N
→ Deep Capacity Check
→ Risk / Safety
→ Resize if needed
→ Recalculate Net Edge
→ Execution Intent
→ Replay / Paper Execution
→ Markout / Impact / Fill Analysis
→ Capacity Calibration
```

---

## ‏102. Recommended Hierarchy

```text
Baseline
→ Fixed Small Research Size

Preferred Default
→ Fixed Size + Simple Liquidity / Impact Caps

Challenger
→ Relative-Size / Recent-Dollar-Volume Adaptive Cap

Advanced Option
→ Multi-Level / Regime-Aware Capacity

Specialist Option
→ Route/Venue/Learned Impact Model

Avoid Unless Evidence
→ Fully dynamic score-proportional sizing
```

---

## ‏103. Acceptance Tests

‏לפני שמקטע Capacity נחשב implementation-ready במחקר:

- [ ] ‏כל Capacity Decision point-in-time.
- [ ] ‏No future daily volume leakage.
- [ ] ‏Working/Pending exposure נספר.
- [ ] ‏`UNKNOWN` אינו משפר Approved Size.
- [ ] ‏Resize מפעיל Net Edge recheck.
- [ ] ‏Binding Constraint traceable.
- [ ] ‏Capacity cache freshness נאכפת.
- [ ] ‏L1/L2 mode known.
- [ ] ‏Exit capacity represented.
- [ ] ‏Hard Cap cannot be bypassed.
- [ ] ‏Replay deterministic for same inputs/version.
- [ ] ‏Fixed Small Size champion preserved.
- [ ] ‏Capacity-aware challenger evaluated OOS.
- [ ] ‏Tail execution cost measured.
- [ ] ‏Latency tax measured.

---

## ‏104. Recommendation Summary

```text
Do not scale Capital first.
Scale evidence first.

Fixed Small Size
→ Measure Execution
→ Build Relative-Size Evidence
→ Estimate Impact Conservatively
→ Add Capacity Confidence
→ Resize + Recalculate Net Edge
→ Validate Exit Capacity
→ Compare Champion / Challenger
→ Keep Headroom
→ Promote only if OOS Net Edge improves
```

‏המשפט המסכם:

> ‏**Capacity אינה כמה כסף אפשר להקצות לעסקה; היא כמה Exposure ניתן להעביר דרך השוק, בזמן שבו ה־Signal עדיין חי, כך שה־Risk נשאר נשלט וה־Execution אינו מוחק את ה־Edge.**
