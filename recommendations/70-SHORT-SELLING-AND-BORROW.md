# ‏70 — Recommendation Sheet: Short Selling and Borrow

> ‏מקור לימודי עיקרי: `../70-SHORT-SELLING-AND-BORROW.md`.
>
> ‏מטרת הקובץ: להכריע כיצד לחקור צד Short בלי להתייחס אליו כ־Long עם סימן הפוך. ‏Borrow, shortability, restrictions, recalls, forced exits, squeeze risk, cover execution ו־historical borrow availability הם חלק מה־problem definition עצמו — לא פרטי backend שמוסיפים בסוף.
>
> ‏המקטע מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture. הוא אינו הוראה לבצע Short בכסף אמיתי, ואינו מניח ש־Short strategy מייצרת Edge.

---

## ‏1. Decision

‏השאלה אינה:

```text
Can we invert the long signal and sell instead of buy?
```

‏אלא:

```text
Is there a distinct short-side predictive effect,
and was the opportunity actually borrow-eligible,
operationally feasible, executable, coverable and economically positive
under point-in-time borrow, restriction, cost and tail-risk assumptions?
```

‏שרשרת המחקר המומלצת:

```text
Observed Candidate
→ Short-Side Predictive Signal
→ Short Eligibility
→ Point-in-Time Borrow Feasibility
→ Restriction / Capability State
→ Execution Feasibility
→ Short-Specific Cost Model
→ Tail / Squeeze Stress
→ Cover Feasibility
→ Net Research Outcome
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Short הוא Problem נפרד

‏אין להניח:

```text
ShortModel(x) = -LongModel(x)
```

‏Long ו־Short עשויים להיות שונים ב־prediction, microstructure, execution, event sensitivity, borrow constraints, costs, latency ו־tail risk.

‏לכן ברירת המחדל המחקרית היא:

```text
Long research
!=
Short research
```

### ‏`P0 — Required`: ‏`CannotTrade` ו־`ShouldNotTrade` הם States שונים

```text
CannotTrade
= feasibility / permission / borrow / broker / market-state failure

ShouldNotTrade
= strategy / economics / uncertainty / risk judgment
```

‏ההפרדה מחייבת ב־logs, Backtest, Replay ו־RCA.

‏Candidate שאי אפשר היה לבצע אינו "missed winner" רשמי גם אם המחיר זז אחר כך בכיוון הרצוי.

### ‏`P0 — Required`: ‏`ShortEligibility` לפני כל תוצאת Short רשמית

‏חוזה מחקרי מינימלי:

```text
ShortEligibility
- account_capability_state
- symbol_shortability_state
- borrow_state
- borrow_known_at
- borrow_age
- borrow_generation
- restriction_state
- market_data_state
- trading_state
- execution_feasibility_state
```

‏`UNKNOWN` אינו מתורגם אוטומטית ל־`AVAILABLE`.

### ‏`P0 — Required`: Borrow חייב להיות Point-in-Time

‏לכל Candidate Short נשמור מה היה ידוע באותו רגע, לא מה ידוע היום:

```text
BorrowState
BorrowKnownAt
BorrowTimestamp
BorrowAge
BorrowSource
BorrowQuantityEstimate
BorrowFeeEstimate
BorrowGenerationId
```

‏שימוש ב־current shortability או current borrow fee עבור עבר הוא leakage.

### ‏`P0 — Required`: Borrow state הוא Temporal State

‏Borrow שהיה תקף בזמן Scanner אינו בהכרח תקף בזמן evaluation מאוחר יותר.

‏לכן Research/Replay צריכים לאפשר:

```text
BORROW_AVAILABLE
BORROW_LIMITED
HARD_TO_BORROW
BORROW_UNAVAILABLE
BORROW_UNKNOWN
BORROW_STALE
```

‏ולמדוד transition בין states.

### ‏`P0 — Required`: Exit/Cover אינו תלוי ב־Entry Permission

‏גם במודל המחקרי נשמור הבחנה:

```text
NoNewShorts
!=
NoCover
```

‏כל state שמונע פתיחת exposure חדש אינו רשאי להסתיר או "לבטל" את הצורך לצמצם exposure קיים בסימולציה/replay.

### ‏`P0 — Required`: Forced Exit הוא Outcome נפרד

‏ב־dataset נבדיל:

```text
StrategyExit
RiskExit
BorrowRecallExit
ForcedBuyInExit
OperationalExit
```

‏אחרת אי אפשר לבצע attribution אמין של Net Outcome.

### ‏`P1 — Preferred Default`: Universe נפרד ל־Short

‏נחזיק:

```text
ObservedUniverse
EligibleLongUniverse
PredictiveShortUniverse
BorrowEligibleShortUniverse
ExecutableShortUniverse
```

‏אין להציג את כל ה־Observed Universe כאילו הוא Shortable.

### ‏`P1 — Preferred Default`: Ranking מפוצל Prediction → Feasibility → Economics

```text
PredictiveShortRank
→ BorrowFeasibility
→ Restriction / Capability Check
→ ExecutionFeasibility
→ NetShortUtility
```

‏כך Candidate יכול להיות predictive #1 אך executable #0.

### ‏`P1 — Preferred Default`: Cost Model נפרד לצד Short

‏במחקר נפריד לפחות:

```text
spread
slippage
commission
borrow_cost
impact
adverse_selection
latency_decay
forced_exit_cost
```

‏אין להשתמש אוטומטית ב־Long cost curve.

### ‏`P1 — Preferred Default`: Sign Convention אחת

‏בכל dataset:

```text
EconomicOutcomePositive = favorable
```

‏גם Long וגם Short.

‏ולעומת זאת Features שמייצגים Price Direction צריכים semantics מפורשים:

```text
price_up
price_down
favorable_to_side
```

‏כדי למנוע sign bugs.

### ‏`P1 — Preferred Default`: Borrow-aware Backtest Layers

```text
Predictive Backtest
→ Short Eligibility Backtest
→ Borrow-Aware Backtest
→ Execution Backtest
→ Stress / Tail Backtest
```

‏כל שכבה מדווחת גם כמה Opportunities נפסלו ולמה.

### ‏`P1 — Preferred Default`: Paper אינו הוכחת Borrow Reality

‏`Paper` יכול לבחון state machine ו־decision logic, אבל אין להניח שהוא משחזר shortability, borrow scarcity, locate semantics, recalls או forced actions באופן נאמן.

‏לכן:

```text
Paper success
!=
Borrow feasibility evidence
```

### ‏`P2 — Challenger`: Shadow Borrow Dataset

‏כאשר קיימת גישה חוקית/מורשית לנתוני Borrow במערכת מחקר, ניתן לשמור Shadow observations ללא פתיחת Position:

```text
CandidateTime
BorrowState
BorrowAge
BorrowLookupLatency
BorrowFeeEstimate
RestrictionState
WouldQualify
SubsequentOutcome
```

‏המטרה היא למדוד feasibility gap בין Backtest לבין data אמיתי — לא לבצע Short.

### ‏`P2 — Challenger`: Squeeze / Tail Context

‏נבחן כ־Context, לא כ־story:

```text
borrow_scarcity
borrow_fee_level
recent_upside_acceleration
spread_expansion
liquidity_withdrawal
volume_shock
crowding_proxy
```

‏כל Feature חייב incremental OOS evidence.

### ‏`P3/P4 — Advanced`: Fee-aware ranking, specialized models, multi-source borrow

‏רק לאחר Baseline תקין אפשר לבדוק:

- ‏Short-specific model.
- ‏Unified side-aware model כ־Challenger.
- ‏Fee-aware reranking.
- ‏Borrow-scarcity model.
- ‏Separate models by liquidity/borrow state.
- ‏Advanced multi-source borrow comparison.

‏Complexity אינה Default.

---

## ‏3. Why

‏Short מוסיף state שאינו קיים באותה צורה ב־Long:

```text
Prediction
+
Borrow Market
+
Broker Capability
+
Restriction State
+
Cover Execution
+
Forced-Action Risk
```

‏לכן Backtest שמנבא ירידה נכון אך מתעלם מ־Borrow יכול להיות כלכלית בלתי־ישים.

‏בנוסף, distribution של adverse outcomes אינו סימטרי: sharp upside reversals, gaps, event shocks ו־squeeze-like episodes יכולים לשנות מאוד את tail behavior ואת cover feasibility.

---

## ‏4. Use When

‏המקטע רלוונטי כאשר רוצים לבדוק:

- ‏האם downside signal שונה סטטיסטית מ־upside signal.
- ‏כמה מה־predictive short candidates בכלל Borrow-eligible.
- ‏האם Borrow availability יוצרת selection bias.
- ‏האם Short cost curve שונה מהותית מ־Long.
- ‏האם Borrow lookup latency צורכת חלק משמעותי מ־signal half-life.
- ‏האם squeeze/event states משנים MAE, fill quality או cover time.
- ‏האם simulated Short edge נשאר אחרי eligibility/execution/tail assumptions.
- ‏האם complexity של Short מוצדקת יחסית למחקר Long פשוט יותר.

---

## ‏5. Do Not Use When

‏אין להשתמש ב־Short research כדי:

- ‏להניח שכל מניה יורדת הייתה Shortable.
- ‏להציג unavailable candidate כרווח חסר.
- ‏להעתיק Long model עם sign הפוך ולקרוא לו Validation.
- ‏להשתמש ב־current borrow state עבור historical replay.
- ‏להתייחס ל־HTB או short interest proxy כ־Alpha בפני עצמו.
- ‏להתעלם מ־forced exits או recalls ב־RCA.
- ‏להניח ש־Paper environment מוכיח Borrow feasibility.
- ‏להשתמש ב־rule רגולטורי/ברוקר שהתקבל בעבר בלי אימות עדכני.
- ‏להכניס complexity של Short לפני שקיים evidence של Short-side predictive value.

---

## ‏6. Preferred Architecture Boundary

‏ה־Strategy לא צריכה להכיר payload ספציפי של Broker.

```text
MarketDataProvider
BorrowCapabilityAdapter
BrokerCapabilityAdapter
RestrictionStateProvider
Risk / Safety Layer
Research Strategy
```

‏חוזה קנוני למחקר:

```text
ShortCapabilitySnapshot
- symbol
- security_id
- as_of_time
- shortable_state
- borrow_state
- borrow_age
- borrow_quantity_estimate
- borrow_fee_estimate
- restriction_state
- account_capability_state
- source
- generation_id
- status
```

---

## ‏7. Borrow Semantics Contract

‏אסור לדחוס את הכול ל־`shortable=true/false`.

‏יש להבדיל בין:

```text
CanResearchShort(symbol)
ShortabilityKnown(symbol)
BorrowState(symbol)
BorrowFreshness(symbol)
BorrowFeeKnown(symbol)
RestrictionStateKnown(symbol)
```

‏אם Provider/Broker משתמש במונחים אחרים, Adapter ממפה אותם ל־contract הקנוני עם documentation מפורש.

---

## ‏8. Freshness / Generation

‏Borrow הוא stream עם freshness משלו.

‏נשמור:

```text
BorrowKnownAt
BorrowAge
BorrowGenerationId
BorrowSourceHealth
```

‏אחרי reconnect/resync:

```text
old borrow snapshot
→ INVALIDATED / STALE
```

‏עד evidence חדש.

---

## ‏9. Short Opportunity Funnel

‏Report בסיסי:

```text
Observed
→ PredictiveShortCandidate
→ BorrowEligible
→ RestrictionEligible
→ ExecutionEligible
→ ResearchQualified
```

‏לכל transition נשמור:

```text
count
rate
reason_code
unique_days
unique_symbols
episodes
```

‏כך אפשר לראות האם הבעיה היא Prediction או feasibility.

---

## ‏10. Borrow-aware Selection Bias

‏אחת הסכנות הגדולות היא:

> ‏דווקא המניות עם הירידה החזקה ביותר עשויות להיות קשות יותר להשאלה.

‏לכן dataset שמאפשר אותן בדיעבד באופן חופשי עלול להפריז באיכות האסטרטגיה.

‏נמדוד בנפרד:

```text
PredictiveShortOpportunityRate
BorrowEligibilityRate
ExecutableShortOpportunityRate
```

---

## ‏11. Short-Side Labels

‏Labels צריכים להיות side-aware ומוגדרים היטב:

```text
forward_downside_move
short_favorable_mfe
short_adverse_mae
short_time_to_target
short_time_to_flat
post_target_giveback
cover_slippage
```

‏אין להשתמש בשמות דו־משמעיים שבהם sign משתנה בין Long ל־Short.

---

## ‏12. Prediction vs Executability

‏נציג שני dashboards שונים:

### ‏Predictive

```text
rank_monotonicity
forward_downside_distribution
MFE / MAE
time_to_target
signal_half_life
```

### ‏Feasibility / Execution

```text
borrow_eligible_rate
borrow_unknown_rate
borrow_age
restriction_state
entry_fill_quality
cover_fill_quality
time_to_flat
forced_exit_rate
```

‏לא נשנה Model כאשר failure נמצא בשכבת Borrow/Execution.

---

## ‏13. Cost Attribution

‏לכל Outcome Research נשמור decomposition:

```text
gross_predictive_move
spread_cost
entry_slippage
cover_slippage
commission
borrow_cost_estimate
impact_estimate
adverse_selection
latency_decay
forced_action_cost
net_research_outcome
```

‏אם Borrow cost semantics אינם ידועים, נשמור `UNKNOWN` ולא נבחר נוסחה שרירותית.

---

## ‏14. Borrow Fee Handling

‏Fee שמוצג כ־annualized rate אינו מתורגם אוטומטית לעלות position.

‏המרה תלויה ב־Broker/lending semantics, timing, settlement והגדרות חיוב.

‏לכן ב־Research Manifest יופיע:

```text
BorrowFeeSource
BorrowFeeSemanticsStatus
BorrowFeeAssumptionVersion
```

‏אם semantics לא אומתו — אין להציג `NetShortEdge` מדויק כאילו הוא Fact.

---

## ‏15. Tail / Squeeze Analysis

‏ממוצע אינו מספיק.

‏נציג לפחות:

```text
median_adverse_excursion
p90_adverse_excursion
p99_adverse_excursion
worst_observed_adverse_excursion
gap_like_episode_count
sharp_reversal_episode_count
time_to_flat_distribution
```

‏Rare events ינותחו לפי:

```text
frequency × severity
```

‏ולא על סמך אירוע יחיד ולא בהתעלמות ממנו.

---

## ‏16. Cover Feasibility

‏בצד Short, exit הוא פעולה כלכלית שונה מ־entry.

```text
EntryShort = sell-side execution
Cover = buy-side execution
```

‏לכן Backtest/Replay צריכים להעריך cover דרך ask/liquidity/latency המתאימים ל־timestamp, ולא פשוט להפוך sign של entry simulation.

---

## ‏17. Partial Cover / Pending Exposure

‏ב־Replay נחזיק:

```text
ShortExposureOpen
CoverPending
PartiallyCovered
Flat
UnknownEffect
```

‏`Cancel` של cover intent אינו `Flat`.

‏Truth מגיע מ־position/order state שנשמר בסימולציה/replay contract.

---

## ‏18. Borrow-aware Backtest

‏ברירת המחדל:

```text
Stage A: prediction only
Stage B: point-in-time short eligibility
Stage C: point-in-time borrow assumptions/data
Stage D: short-specific execution simulation
Stage E: costs
Stage F: tail / halt / event / disconnect stress
```

‏אם Historical Borrow Data חסר, הדוח חייב לומר:

```text
BORROW_REALISM_LIMITED
```

‏והתוצאה אינה מקודמת כאילו היא execution-ready.

---

## ‏19. Best / Base / Stress Scenarios

‏למחקר robustness, לא לתחזית:

```text
Best
= permissive feasible assumptions within observed evidence

Base
= central validated assumptions

Stress
= degraded borrow / execution / tail assumptions
```

‏המטרה היא לבדוק sensitivity, לא לבחור את התרחיש שמציג תוצאה יפה יותר.

---

## ‏20. Replay Scenarios

‏Golden scenarios מומלצים:

```text
borrow available → stale
borrow available → unavailable
borrow unknown during candidate selection
restriction state changes
halt while short exposure exists
resume with changed liquidity
new event during short episode
partial cover
broker/data disconnect during open simulated exposure
reconnect with state mismatch
forced-exit event in replay
```

‏כל scenario צריך deterministic expected state transitions.

---

## ‏21. Reason Codes

‏נפריד Hard feasibility reasons מ־Judgment reasons.

### ‏Feasibility

```text
SHORT_BORROW_UNKNOWN
SHORT_BORROW_STALE
SHORT_BORROW_UNAVAILABLE
SHORT_NOT_SHORTABLE
SHORT_RESTRICTION_UNKNOWN
SHORT_CAPABILITY_UNKNOWN
SHORT_EXECUTION_STATE_INVALID
```

### ‏Research judgment

```text
SHORT_NET_EDGE_INSUFFICIENT
SHORT_SQUEEZE_RISK_ELEVATED
SHORT_EXIT_FEASIBILITY_WEAK
SHORT_COST_UNCERTAINTY_HIGH
SHORT_TAIL_RISK_UNACCEPTABLE_FOR_EXPERIMENT
```

---

## ‏22. Monitoring / Health Metrics

‏גם ב־Shadow/Research נרצה:

```text
ShortableCoverage
BorrowFreshCoverage
BorrowUnknownRate
BorrowEligibleRate
BorrowLookupLatencyP50/P95
BorrowStateTransitionRate
RestrictionUnknownRate
BorrowFeeCoverage
ResearchNoTradeRate
ForcedExitScenarioCount
```

‏בנוסף, Side comparison:

```text
PredictiveQuality
Executability
NetResearchOutcome
FailureRate
TailRisk
OperationalComplexity
```

---

## ‏23. Drift

‏ננטר לאורך זמן:

```text
borrow_availability_distribution
borrow_fee_distribution
borrow_unknown_rate
shortable_coverage
restriction_state_frequency
short_opportunity_funnel
short_side_prediction_quality
short_side_execution_quality
```

‏שינוי ב־Borrow state אינו אוטומטית Strategy drift.

‏RCA צריך להפריד:

```text
Prediction drift
Borrow-market drift
Provider drift
Broker capability drift
Execution drift
```

---

## ‏24. Alternatives

### ‏Alternative A — Long-only research

‏ברירת המחדל הפשוטה ביותר אם Short complexity אינה מוסיפה value.

### ‏Alternative B — Short prediction research without execution claims

‏אפשר לחקור downside predictability אך לשמור תוצאות בנפרד כ־`PREDICTION_ONLY` ללא simulated trade PnL רשמי.

### ‏Alternative C — Borrow-aware Short research

‏המסלול המועדף אם יש point-in-time evidence מספיק.

### ‏Alternative D — Advanced Short infrastructure

‏Multi-source borrow, specialized short models, dynamic fee/risk modeling — רק לאחר evidence משמעותי.

---

## ‏25. Trade-offs

| בחירה | יתרון | עלות/סיכון |
|---|---|---|
| Long-only | ‏KISS, פחות failure modes | ‏לא חוקר downside opportunities |
| Prediction-only Short | ‏לומד signal בלי claims תפעוליים | ‏לא מוכיח feasibility |
| Borrow-aware Short | ‏מחקר מציאותי יותר | ‏Data/complexity משמעותיים |
| Specialized Short Models | ‏עשויים ללכוד asymmetry | ‏Overfit, sample fragmentation, ops cost |
| Strict Borrow Gates | ‏מפחיתים false opportunities | ‏עלולים לצמצם dataset/opportunity set |
| Soft risk context | ‏שומר יותר observations | ‏דורש calibration ו־attribution |

---

## ‏26. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏Live Short execution.
- ‏Complex locate optimization.
- ‏Multi-broker borrow routing.
- ‏Borrow-fee prediction ML.
- ‏Deep squeeze/crowding model.
- ‏Auto-recovery logic ל־forced actions.
- ‏Unified Long/Short model לפני separate baselines.
- ‏Hard-coded broker/regulatory rules בתוך Strategy core.
- ‏PnL רשמי מ־Short backtest שאין לו Borrow realism.

---

## ‏27. What to Add Later

‏רק לאחר Evidence:

- ‏Better historical borrow dataset.
- ‏Borrow fee calibration.
- ‏Short-specific execution model.
- ‏Short-specific calibration curves.
- ‏Squeeze-risk ablation.
- ‏Event-aware Short context.
- ‏Borrow-aware capacity model.
- ‏Provider comparison.
- ‏Short-specific Champion/Challenger.
- ‏Advanced capability/version management.

---

## ‏28. Required Data / Evidence

‏לכל Short claim רציני נדרש לפחות:

```text
point-in-time candidate snapshot
side-aware prediction
point-in-time shortability/borrow state or explicit limitation
borrow freshness
restriction/capability state
entry-side market snapshot
cover-side market snapshot
cost assumptions + versions
forward outcome labels
unique days
unique symbols
independent episodes
OOS / walk-forward evidence
stress results
```

‏אם אחד מהמרכיבים חסר, ה־claim מצטמצם בהתאם.

---

## ‏29. Promotion Criteria

‏Short research מתקדם שלב רק אם:

1. ‏יש downside predictive value OOS שאינו רק mirror של Long.
2. ‏`ShortEligibility` משוחזר point-in-time או שהמגבלה מסומנת במפורש.
3. ‏Borrow-aware opportunity funnel ידוע.
4. ‏Short-specific costs אינם מוחקים את האפקט.
5. ‏Cover feasibility נמדדה בנפרד מ־entry.
6. ‏Tail/stress behavior מובן ומדווח.
7. ‏אין dependence קיצונית בכמה Symbols/Episodes.
8. ‏Reason Codes מפרידים `CannotTrade` מ־`ShouldNotTrade`.
9. ‏Replay משחזר borrow/restriction state ככל שהנתונים מאפשרים.
10. ‏Shadow/Paper behavior אינו סותר באופן מהותי את assumptions.
11. ‏Complexity Tax מוצדק מול Long-only baseline.

‏המקטע אינו מגדיר Promotion למסחר אמיתי; הוא מגדיר Promotion בין שלבי מחקר בלבד.

---

## ‏30. Rejection Criteria

‏נפסול או נשאיר prediction-only כאשר:

- ‏Short effect נעלם OOS.
- ‏האפקט הוא פשוט sign inversion של Long ללא evidence עצמאי.
- ‏Historical borrow assumptions אינן סבירות או אינן ניתנות לאימות.
- ‏Borrow eligibility מוחקת את רוב ה־apparent opportunities.
- ‏Costs/latency/cover slippage מוחקים את האפקט.
- ‏Tail behavior קיצוני ביחס ל־expected value המחקרי.
- ‏Result תלוי ב־few symbols/episodes.
- ‏Restriction/Broker semantics לא ידועים.
- ‏Model דורש complexity גבוהה בלי Decision Impact ברור.
- ‏Paper result משמש בטעות כראיה ל־Borrow reality.

---

## ‏31. Metrics

### ‏Prediction

```text
short_rank_monotonicity
forward_downside_distribution
short_mfe
short_mae
time_to_downside_target
signal_half_life_short
```

### ‏Borrow / Eligibility

```text
shortable_coverage
borrow_eligible_rate
borrow_unknown_rate
borrow_stale_rate
borrow_state_transition_rate
borrow_fee_coverage
borrow_lookup_latency
```

### ‏Execution

```text
short_entry_fill_quality
cover_fill_quality
cover_slippage
time_to_flat
partial_cover_rate
latency_pressure_short
```

### ‏Economics

```text
gross_short_effect
short_cost_estimate
borrow_cost_contribution
net_short_research_outcome
unavailable_opportunity_rate
false_veto_rate
```

### ‏Tail / Robustness

```text
p99_adverse_excursion
worst_adverse_episode
gap_like_loss_proxy
squeeze_episode_sensitivity
unique_days
unique_symbols
episode_count
OOS_delta
```

---

## ‏32. Failure Modes

‏Failure modes מרכזיים:

- ‏Long/Short symmetry assumption.
- ‏Current borrow used for historical data.
- ‏`UNKNOWN` treated as available.
- ‏`Shortable` confused with actual Borrow state.
- ‏Borrow stale at decision time.
- ‏Borrow cost omitted or invented.
- ‏Entry realism but fake cover.
- ‏Forced exit attributed as Strategy exit.
- ‏Paper treated as Borrow proof.
- ‏Unavailable opportunities counted as missed profit.
- ‏Sign-convention bugs.
- ‏Broker/market/account rules mixed into one Boolean.
- ‏Provider semantics hard-coded into Strategy.
- ‏Tail risk hidden by averages.
- ‏One squeeze episode overfitted into policy.
- ‏Rare severe events ignored because frequency is low.
- ‏Restriction facts allowed to age without re-verification.

---

## ‏33. Testing Strategy

### ‏Unit

- ‏`UNKNOWN` Borrow never becomes `AVAILABLE` silently.
- ‏Borrow age increases deterministically.
- ‏Generation change invalidates stale state.
- ‏Sign convention yields favorable-positive outcomes on both sides.
- ‏Forced exit reason is distinct from Strategy exit.
- ‏Unavailable Candidate never enters official simulated trade PnL.

### ‏Replay

- ‏Borrow transition changes eligibility at the correct timestamp.
- ‏Future borrow update cannot modify past decision.
- ‏Restriction change is causal.
- ‏Partial cover leaves remaining exposure.
- ‏Reconnect mismatch requires reconciliation state.

### ‏Research

- ‏Prediction-only baseline compared with borrow-aware baseline.
- ‏Ablation of Borrow gate, fee model and squeeze context.
- ‏Long and Short results reported independently.
- ‏Cells with insufficient episodes remain `INSUFFICIENT_DATA`.

---

## ‏34. User-Specific Application

‏למערכת שסורקת Universe רחב ומחפשת תנועה קצרה מאוד, Short-side research מקבל Complexity נוספת בדיוק במקום שבו הזמן יקר:

```text
scanner decision
→ borrow evidence
→ capability / restriction state
→ execution estimate
```

‏לכן ברירת המחדל המומלצת לפרויקט היא **לא להכניס Short לתוך אותו Happy Path של Long**.

‏אם חוקרים Short, הוא יקבל pipeline עצמאי לפחות ברמת:

```text
Separate Short Eligibility
Separate Labels
Separate Cost Curves
Separate Feasibility Funnel
Separate RCA
```

‏ורק אחר כך בודקים האם יש ערך באיחוד שכבות.

---

## ‏35. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Short מוסיף תלות ב־borrow/shortability וב־cover execution שאינה זהה ל־Long.
- ‏Borrow state ו־Broker/market/account rules יכולים להשתנות בזמן.
- ‏Historical research שמסתמך על future/current availability עלול להיות מוטה.
- ‏Forced action אינו Strategy exit.

### ‏Judgment

- ‏להתחיל Long ו־Short כמחקרים נפרדים.
- ‏להחזיק `ShortEligibility` מפורש.
- ‏להפריד `CannotTrade` מ־`ShouldNotTrade`.
- ‏להעדיף prediction-only על PnL מדומה כאשר Borrow history חסר.
- ‏להכניס Borrow-aware complexity רק בהדרגה.

### ‏Hypothesis

- ‏קיים Short-side Edge אינקרמנטלי במערכת שלנו.
- ‏Borrow scarcity מנבאת deterioration ב־net short quality.
- ‏Squeeze context משפר veto/abstention.
- ‏Short-specific model עדיף על unified model.
- ‏ה־Complexity Tax של Short מוצדק מול Long-only system.

---

## ‏36. Confidence

### ‏High confidence

- ‏Short research דורש feasibility layer נפרד.
- ‏Point-in-time Borrow semantics קריטיים ל־Backtest אמין.
- ‏Long/Short symmetry אינה הנחת Default טובה.
- ‏Cover feasibility ו־forced actions חייבים attribution נפרד.
- ‏`UNKNOWN` צריך להישאר state מפורש.

### ‏Medium confidence

- ‏Separate Short model/labels/cost curves הם Baseline נכון למחקר שלנו.
- ‏Shadow Borrow observations יכולים לסגור חלק מהפער בין Backtest ל־reality.
- ‏Squeeze/tail Context כנראה שימושי יותר כ־Risk/Uncertainty input מאשר כ־Signal ראשי.

### ‏Low / Unproven

- ‏האם קיימת אצלנו בכלל Short-side Edge נטו.
- ‏אילו Borrow thresholds מועילים.
- ‏האם fee-aware reranking משפר Decision Value.
- ‏האם unified model או separate model עדיף.
- ‏האם advanced borrow infrastructure שווה את ה־complexity.

---

## ‏37. Time-Sensitive Facts

‏הפרטים הבאים אינם מקובעים במסמך זה ודורשים אימות עדכני מול המקור הרלוונטי לפני כל שימוש תפעולי עתידי:

- ‏Broker/account eligibility ל־Short.
- ‏Shortability semantics.
- ‏Borrow/Locate workflow.
- ‏Fee calculation semantics.
- ‏Recall/Buy-In behavior.
- ‏Short-sale restrictions.
- ‏API fields/capabilities.
- ‏Paper-vs-live differences.
- ‏Data entitlements.

‏ה־Recommendation כאן מגדירה Architecture ו־Research Discipline, לא snapshot רגולטורי או Broker-specific.

---

## ‏38. Definition of Done

‏מקטע Short Research נחשב בשל כאשר אפשר לענות, עם evidence מתועד:

```text
Was the downside signal predictive OOS?
Was the candidate actually eligible under point-in-time assumptions?
Was borrow state known and fresh?
Were short-specific costs represented honestly?
Was entry modeled separately from cover?
Were forced exits attributed correctly?
Were tail / squeeze / halt / event scenarios stressed?
Was unavailable opportunity separated from missed opportunity?
Did shadow/paper observations contradict the backtest assumptions?
Does the incremental value justify the complexity?
```

---

## ‏39. Recommendation Summary

```text
Baseline
→ keep Long and Short research separate
→ define ShortEligibility explicitly
→ preserve point-in-time Borrow state
→ UNKNOWN is not AVAILABLE
→ separate CannotTrade from ShouldNotTrade
→ separate prediction from feasibility
→ model Short costs separately
→ model cover separately from entry
→ keep forced exits distinct
→ use borrow-aware backtest when evidence exists
→ otherwise downgrade claims to prediction-only
→ stress tail / squeeze / halt / disconnect episodes
→ compare complexity against Long-only baseline
→ promote only within Research / Replay / Shadow / Paper
```

> ‏המסקנה: **Short אינו `Sell` במקום `Buy`. הוא Problem נפרד עם Borrow Market, Eligibility, Costs, Restrictions, Tail Risk ו־Cover mechanics משלו. אם אין Evidence point-in-time שמראה שההזדמנות הייתה ניתנת לביצוע, היא אינה Trade היסטורי — היא לכל היותר Counterfactual Research Observation.**
