# ‏63 — Recommendation Sheet: How Professionals Think About Edge

> ‏מקור לימודי עיקרי: `../63-HOW-PROFESSIONALS-THINK-ABOUT-EDGE.md`.
>
> ‏מטרת הקובץ: להגדיר איך מערכת `Short-Horizon Momentum` שלנו תחליט אם יש לה `Edge` אמיתי, בר־ביצוע ובר־הפרכה — ולא להסתפק ב־Signal, Score, Rank, Backtest או PnL חיובי. המקטע מתרגם את פרק 63 ל־Edge Thesis, ‏Edge Contract, ‏Evidence Ladder, ‏Kill Criteria, ‏Attribution ו־Governance מעשיים.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה לבצע מסחר אמיתי, אינו מבטיח רווח ואינו קובע Exposure אמיתי.

---

## ‏1. Decision

‏ההחלטה המרכזית אינה:

```text
Did we find a strong signal?
```

‏אלא:

```text
Do we have a robust, executable, net-positive, falsifiable edge
that fits our actual capabilities and remains observable over time?
```

‏נשתמש בהפרדה הבאה:

```text
Signal != Edge
Score != Edge
Rank #1 != Edge
Backtest Profit != Edge
Fill != Good Fill
PnL != Explanation
```

‏ה־Baseline:

```text
Mechanism / Thesis
→ Point-in-Time Predictive Evidence
→ Cross-Sectional Selection
→ Negative Evidence / Veto
→ Executability
→ Realistic Costs
→ Latency / Decay
→ Entry + Fill Quality
→ Exit Feasibility
→ Risk / Capacity
→ Net Executable Edge
→ Robustness / OOS
→ Replay / Shadow / Paper
→ External Calibration when authorized
→ Ongoing Drift / Kill Monitoring
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏`Signal` לעולם אינו מספיק לבדו

‏Trade eligibility לא תיגזר ישירות מ־Feature או Score יחיד.

‏לפני כל החלטה נדרוש שרשרת מינימלית:

```text
Positive Predictive Evidence
+ No Material Hard Veto
+ Fresh Enough Data
+ Stable Enough Candidate State
+ Executable Entry
+ Executable Exit
+ Realistic Costs
+ Positive Remaining Net Edge
+ Known Risk State
```

‏אם אחד מרכיבי החובה אינו ידוע:

```text
UNKNOWN
```

‏אינו מומר אוטומטית ל־pass.

### ‏`P0 — Required`: ‏`Edge Thesis` כתוב ומופרך מראש

‏לכל Strategy Version יהיה Thesis קצר שמענה על:

```text
Why should the opportunity exist?
Why has competition not removed it?
Why can our system capture it?
What conditions are required?
What evidence would falsify it?
```

‏תזה לדוגמה עבור המערכת שלנו:

```text
When broad-universe short-horizon momentum,
activity/flow confirmation and executable liquidity align,
while material negative evidence is absent,
continuation may persist long enough to leave positive net executable edge
before the signal decays.
```

‏זו `Hypothesis`, לא Fact.

### ‏`P0 — Required`: ‏`Net Executable Edge` הוא היעד

‏לא נשתמש ב־Gross move כיעד הסופי.

```text
GrossPredictiveEdge
- SpreadCost
- Slippage
- Fees
- ExpectedImpact
- ExpectedAdverseSelection
- ExitCost
- OtherMaterialCosts
= ExpectedNetEdge
```

‏ולאחר מכן:

```text
ExpectedNetEdge
× UsefulExecutionProbability
× ConfidenceAdjustment
= Decision-Usable Edge Estimate
```

‏הנוסחה האחרונה היא conceptual framework, לא זהות מתמטית אוניברסלית.

### ‏`P0 — Required`: Edge חייב להתאים ל־Horizon ול־Infrastructure

‏Opportunity שאינה ניתנת לצפייה ולביצוע בזמן שלנו אינה Edge שלנו.

‏נבדוק:

```text
Can our data observe it in time?
Can our scanner compare it in time?
Can our decision path act before decay?
Can the broker/execution path reach it?
Can we exit before the economics disappear?
```

‏אם ה־Edge חי מהר יותר באופן מהותי מהמערכת:

```text
NOT_ACCESSIBLE
```

### ‏`P0 — Required`: ‏`NO_TRADE` הוא Edge decision לגיטימי

‏ה־winner היחסי אינו בהכרח Trade.

```text
BestCandidate
!=
TradeEligibleCandidate
```

‏ברירת המחדל:

```text
No candidate has sufficient net executable edge
→ NO_TRADE
```

### ‏`P0 — Required`: Kill Criteria לפני Promotion

‏לפני ש־Strategy/Capability מקודמת, יוגדר מראש מה מעביר אותה ל־:

```text
DEGRADED
SUSPENDED
RETIRED
```

‏ולא משנים את הכללים לאחר שרואים הפסד.

---

## ‏3. Preferred Edge Model

‏נחזיק Edge כ־system-level stack:

```text
Data Edge
+ Selection Edge
+ Veto Edge
+ Timing Edge
+ Execution Edge
+ Exit Edge
+ Cost Edge
+ Operational Edge
= Usable System Edge
```

‏אין חובה שכל שכבה תהיה חיובית בפני עצמה.

‏אבל שכבה חלשה יכולה למחוק את כל המערכת.

‏לכן נשאל באופן קבוע:

```text
What is the current Edge Bottleneck?
```

---

## ‏4. Edge Sources — מה מותר לנו לטעון

‏מקורות אפשריים ל־Edge:

```text
Structural
Behavioral
Information / Processing
Selection
Execution
Operational
Research Process
Cost / Scale
```

‏אבל לכל מקור נדרוש Evidence נפרד.

‏לדוגמה:

```text
"Momentum exists"
```

‏אינו מוכיח:

```text
our scanner has selection edge
```

‏ו־:

```text
our scanner selects well
```

‏אינו מוכיח:

```text
our execution preserves the edge
```

---

## ‏5. Edge Contract

‏לכל Strategy Version נגדיר חוזה מפורש.

‏Schema רעיוני:

```text
EdgeContract {
  thesis
  mechanism
  expected_horizon
  required_market_regime
  required_data_quality
  max_signal_age
  max_rank_age
  max_spread_or_cost_pressure
  minimum_liquidity_or_executability
  required_veto_state
  minimum_expected_net_edge
  minimum_edge_headroom
  capacity_envelope
  latency_envelope
  exit_feasibility
  kill_criteria
  confidence_state
  evidence_version
}
```

‏Thresholds אינם נקבעים אינטואיטיבית; הם מגיעים מ־Evidence.

---

## ‏6. Edge Clock

‏Opportunity קצרה מקבלת state:

```text
DETECTED
→ VALID
→ WEAKENING
→ EXPIRED
```

‏נמדוד לפחות:

```text
EdgeAtDetection
EdgeAtDecision
EdgeAtSubmit
EdgeAtFill
EdgeAtExitTrigger
EdgeAtFlat
```

‏Intent טכנית תקינה יכולה להיות כלכלית מאוחרת.

---

## ‏7. Signal Half-Life

‏Signal half-life הוא Research metric מרכזי עבורנו.

‏נשתמש בו כדי לכייל:

```text
scan cadence
rank refresh
candidate TTL
pre-submit revalidation
latency budget
entry TTL
exit urgency
```

‏אין לקבוע `TTL` מתוך תחושת מהירות בלבד.

---

## ‏8. Latency Tax

‏נעדיף מדד כלכלי:

```text
LatencyTax
=
ExpectedEdgeAtDetection
-
ExpectedEdgeAtExecutionPoint
```

‏מטרת Performance work היא להפחית economic loss, לא לרדוף latency נמוכה שאינה משנה decisions או economics.

---

## ‏9. Edge Budget

‏נחשוב על opportunity כתקציב נשחק:

```text
GrossEdgeBudget
- DataDelayTax
- DecisionDelayTax
- Spread
- Slippage
- Impact
- AdverseSelection
- ExitCost
- OtherCosts
= RemainingEdge
```

‏Pre-submit gate משתמש ב־`RemainingEdge`, לא ב־edge המקורי בזמן detection.

---

## ‏10. Edge Headroom

‏לא נרצה Strategy שחיה בדיוק על break-even.

‏Concept:

```text
EdgeHeadroom
=
ExpectedNetEdge
-
BreakEvenRequirement
```

‏כאשר uncertainty גדולה יותר, נדרוש headroom גדול יותר.

‏Threshold מדויק הוא Empirical.

---

## ‏11. Distribution, לא Average בלבד

‏לכל estimate מהותי נשמור כאשר אפשר:

```text
mean
median
percentiles
left tail
right tail
skew
confidence interval / uncertainty estimate
```

‏Average positive יכול להסתיר:

```text
one profitable regime
+
one losing regime
```

---

## ‏12. Conditional Edge

‏נחתוך Evidence לפחות לפי:

```text
market regime
session phase
liquidity bucket
spread bucket
volatility bucket
activity bucket
signal-strength bucket
symbol class
holding / horizon bucket
execution tactic
```

‏המטרה אינה ליצור אלפי תנאים, אלא לזהות הטרוגניות אמיתית.

---

## ‏13. Edge Concentration

‏נמדוד כמה מהתוצאה מגיע מ־:

```text
few symbols
few days
few bursts
a few outliers
one regime
one session phase
one parameter island
```

‏Concentration גבוהה מורידה Confidence עד שניתן להראות Mechanism מתאים ו־repeatability.

---

## ‏14. Breadth ו־Effective Sample Size

‏מספר Trades אינו מספר experiments עצמאים.

‏נעדיף Evidence ברמת:

```text
episodes
days
symbols
regimes
independent-ish market events
```

‏Burst של מאות events correlated אינו נספר כאילו הוא מאות הוכחות בלתי תלויות.

---

## ‏15. Robustness > Parameter Spike

‏נעדיף:

```text
broad stable plateau
```

‏על:

```text
single magic threshold
```

‏נבדוק Edge Surface סביב parameter choices.

‏אם שינוי קטן וסביר מוחק את התוצאה:

```text
FRAGILE
```

---

## ‏16. Mechanism ו־Falsifiability

‏Mechanism לא חייב להיות causal proof מלא.

‏אבל הוא צריך לעזור לענות:

```text
When should this edge exist?
When should it weaken?
What competing explanation exists?
What observation would contradict the thesis?
```

‏Pattern בלי mechanism אפשרי למחקר, אבל דורש validation חזק יותר.

‏Story בלי Evidence אינו מקודם.

---

## ‏17. Evidence Ladder

‏נשתמש ב־ladder הבא:

```text
Observation
→ Written Hypothesis
→ Point-in-Time In-Sample Pattern
→ Protected OOS Survival
→ Stress / Sensitivity Survival
→ Deterministic Replay Survival
→ Shadow Survival
→ Paper Lifecycle Survival
→ External Calibration under authorized controls
→ Repeated calibrated evidence
```

‏אין לדלג על שלבים רק משום ש־Backtest נראה חזק.

---

## ‏18. Backtest Edge הוא Candidate בלבד

‏Backtest טוב מוכיח לכל היותר:

```text
under the modeled timeline/data/execution assumptions,
this candidate deserves further testing
```

‏הוא אינו מוכיח fill economics, broker behavior או future persistence.

---

## ‏19. Paper / Shadow Role

‏`Shadow` בודק בעיקר:

```text
live detection
feature parity
ranking
vetoes
decision timing
```

‏`Paper` מוסיף lifecycle useful, אך עדיין לא בהכרח external fill truth.

‏לכן:

```text
Paper Success != Final Edge Proof
```

---

## ‏20. Prediction Edge vs Capture Edge

‏נפריד שתי שאלות:

```text
Did the candidate move as predicted?
```

‏ו־:

```text
Did our system capture enough of that move after all frictions?
```

‏הפער הוא אחד ממקורות ה־RCA המרכזיים.

---

## ‏21. Edge Retention Funnel

```text
GrossPredictiveEdge
→ ExecutablePrediction
→ EdgeAfterSelectionDelay
→ EdgeAfterDecisionDelay
→ EdgeAfterSubmitDelay
→ EdgeAfterEntryExecution
→ EdgeAfterAdverseSelection
→ EdgeAtExitTrigger
→ EdgeAfterExitExecution
→ NetRealizedOutcome
```

‏נרצה לזהות את השלב עם ה־largest recurring loss.

---

## ‏22. Capture Metrics

‏נשתמש בזהירות במדדים כמו:

```text
CaptureRatio
NetEdgeRetained
FillAdjustedEdge
LatencyTax
CostRatio
ExitGiveback
```

‏אין להסתמך על ratio כאשר denominator קטן, לא יציב או בעל uncertainty גבוהה.

---

## ‏23. Negative Evidence כחלק מה־Edge

‏Edge מקצועי אינו רק accumulation של positives.

‏ה־decision contract:

```text
Positive Evidence
+ No Material Negative Evidence
+ Executable Economics
```

‏`Veto Edge` הוא האפשרות לשפר outcome על ידי הימנעות systematic מ־bad trades.

---

## ‏24. `NO_TRADE Edge`

‏נמדוד גם את הערך של החלטות שלא יצרו Trade.

‏Counterfactual research יכול לבדוק:

```text
What happened after hard veto?
What happened after low-headroom rejection?
What happened after stale-rank rejection?
```

‏אבל counterfactual מסומן ככזה ולא כ־Fact.

---

## ‏25. Cross-Sectional Edge

‏השאלה שלנו אינה:

```text
Is symbol X positive?
```

‏אלא:

```text
Is X the best sufficiently executable opportunity
relative to alternatives at the same as_of state?
```

‏לכן נמדוד:

```text
Rank #1 vs #2/#3 future outcome
rank gap
rank persistence
winner churn
trade/no-trade gap
```

---

## ‏26. Candidate Persistence

‏Candidate שמתחלף מהר יותר מהיכולת שלנו לקבל החלטה ולבצע עלול להיות research-interesting אך operationally useless.

‏נמדוד:

```text
time_at_top
rank survival
rank reversals before submit
rank reversals before fill
```

---

## ‏27. Entry Edge

‏Prediction נכון אינו מבטיח entry טוב.

‏נמדוד:

```text
arrival benchmark
submit benchmark
entry slippage
fill probability
partial fill behavior
post-fill markout
```

‏Entry tactic היא component של Edge, לא תיקון קוסמטי לאחר מכן.

---

## ‏28. Fill Selection Bias

‏Filled trades אינם sample אקראי מכל intents.

‏לכן נשווה:

```text
filled
no-fill
partial-fill
canceled
rejected
```

‏כדי להבין אם fills מגיעים דווקא בסיטואציות adverse.

---

## ‏29. Exit Edge

‏ב־short horizon, Exit הוא חלק מה־thesis.

‏נמדוד:

```text
exit trigger quality
exit trigger age
exit latency
exit slippage
exit giveback
partial exit behavior
time to flat
```

‏אסטרטגיה שצופה continuation אך לא מצליחה לשמר את המהלך ביציאה אינה בעלת usable edge מלא.

---

## ‏30. Capacity

‏נמדוד:

```text
NetEdge(size)
MarginalEdge(size)
FillProbability(size)
Impact(size)
TimeToFlat(size)
```

‏אין להסיק מתוצאה בגודל קטן ש־Edge scalable.

---

## ‏31. Small-Size Advantage

‏למערכת אישית יכול להיות יתרון בגמישות וביכולת לדלג על opportunities שאינן טובות מספיק.

‏אבל זה `Hypothesis / structural consideration`, לא הבטחה.

‏נעדיף arena שבו:

```text
our size is executable
our latency is adequate
our data can observe the pattern
our operational complexity remains manageable
```

---

## ‏32. Competition Boundary

‏אנחנו לא מנסים להתחרות ב־microsecond HFT.

‏Preferred arena:

```text
milliseconds → seconds → tens of seconds
```

‏כאשר Evidence מראה שה־opportunity עדיין חיה מספיק זמן.

‏אם measured half-life קצר באופן עקבי מיכולת התגובה שלנו — הרעיון נדחה או משתנה.

---

## ‏33. Complexity Tax

‏כל רכיב חדש משלם:

```text
code complexity
latency
state complexity
failure surface
research degrees of freedom
debug cost
operational burden
```

‏השאלה:

```text
IncrementalNetEdge > ComplexityTax ?
```

‏לכן Baseline פשוט הוא default עד Evidence נגדי.

---

## ‏34. Challenger Policy

‏כל Challenger חייב לענות:

```text
What exact component changed?
What decisions changed?
What incremental net edge is expected?
What new complexity/risk was introduced?
What evidence would reject it?
```

‏לא מקדמים Challenger רק בגלל total PnL גבוה יותר.

---

## ‏35. Decision Impact Rate

‏Feature/Filter חדש צריך להראות שהוא משנה decisions באופן שימושי.

‏נמדוד:

```text
DecisionImpactRate
```

‏אם component כמעט לא משנה Candidate, Veto, Entry, Exit או Risk — הערך המעשי שלו נמוך גם אם הוא מתואם סטטיסטית עם outcome.

---

## ‏36. Ablation

‏לכל component מהותי נרצה, כאשר אפשר:

```text
full system
vs
system without component
```

‏כך מבדילים בין correlation לבין contribution מעשי.

---

## ‏37. Edge Bottleneck

‏בכל Iteration נבחר bottleneck אחד מרכזי:

```text
prediction
selection
freshness
veto quality
latency
entry execution
fill quality
exit quality
costs
operations
```

‏ונעדיף לשפר אותו לפני הוספת complexity שאינה מטפלת בחוליה המגבילה.

---

## ‏38. Primary Metric

‏Primary economic metric מומלץ למחקר:

```text
Net executable outcome after realistic round-trip costs
```

‏הגדרה מדויקת ו־horizon יהיו versioned.

‏PnL aggregate אינו מחליף metric ברמת Episode/Decision.

---

## ‏39. Primary Edge Health Metrics

```text
predicted_gross_edge
expected_net_edge
remaining_edge_at_submit
remaining_edge_at_fill
realized_net_outcome
net_edge_retained
capture_ratio
edge_headroom
latency_tax
cost_ratio
fill_adjusted_edge
post_fill_markout
exit_giveback
signal_half_life
rank_persistence
```

---

## ‏40. Robustness Metrics

```text
OOS stability
regime coverage
symbol breadth
day breadth
effective sample size
parameter-neighborhood stability
cost sensitivity
latency sensitivity
fill-model sensitivity
universe sensitivity
capacity sensitivity
```

---

## ‏41. Leading Edge Indicators

‏נעדיף לזהות decay לפני PnL aggregate כאשר אפשר.

‏Leading indicators אפשריים:

```text
post_fill_markout worsening
spread / cost pressure rising
capture ratio falling
latency tax rising
fill probability falling
signal half-life shrinking
rank churn rising
no-trade/veto counterfactuals changing
data freshness degrading
```

‏כל indicator דורש calibration; אין universal threshold.

---

## ‏42. Edge Attribution

‏כל Episode משמעותי ימופה ל־:

```text
Prediction
Selection
Negative Evidence
Decision
Entry
Fill
Exit
Costs
Risk
Operations
```

‏כאשר outcome גרוע, מחפשים first divergence ולא מאשימים אוטומטית את Strategy.

---

## ‏43. First-Divergence RCA

```text
Point-in-Time Data
→ Features
→ Rank
→ Veto
→ Decision
→ Edge Estimate
→ Entry Intent
→ Execution
→ Fill
→ Position
→ Exit
→ Costs
→ Net Outcome
```

‏המקום הראשון שבו expected contract נשבר הוא נקודת החקירה הראשונה.

---

## ‏44. Edge States

‏Preferred lifecycle:

```text
RESEARCH
SHADOW
PAPER
CALIBRATION_READY
PROMOTED
DEGRADED
SUSPENDED
RETIRED
```

‏אין auto-promotion לפי זמן בלבד.

---

## ‏45. Promotion Criteria

‏Promotion דורש Evidence כגון:

- ‏Thesis ו־mechanism מתועדים.
- ‏Point-in-time correctness נשמרת.
- ‏OOS שורד בלי retuning ל־holdout.
- ‏Robustness סביב parameters סבירים.
- ‏Edge אינו מרוכז כולו במספר חריגים קטן.
- ‏Net edge נשאר חי תחת costs ריאליים.
- ‏Latency envelope מתאים ל־signal half-life.
- ‏Fill assumptions סבירים ו־no-fill sample נשמר.
- ‏Post-fill markout אינו מצביע על toxicity מהותית לא מוסברת.
- ‏Exit economics נשמרים.
- ‏Stress על costs/latency/fill/capacity אינו מוחק מיד את התזה.
- ‏Replay/Shadow/Paper parity מספקת.
- ‏Kill criteria ו־monitoring קיימים.
- ‏Evidence מכסה יותר מ־episode/regime יחיד.

---

## ‏46. Demotion / Suspension Criteria

‏עוברים ל־`DEGRADED` או `SUSPENDED` כאשר יש Evidence משמעותי ל־:

```text
prediction mapping deterioration
signal half-life collapse
capture ratio collapse
cost gap expansion
latency outside validated envelope
fill-quality deterioration
post-fill toxicity increase
exit giveback increase
rank persistence collapse
unexpected regime dependence
major data/provider semantic change
execution model mismatch
unknown first divergence
```

‏ב־uncertainty משמעותית ברירת המחדל היא research/shadow, לא parameter chasing.

---

## ‏47. Retirement Criteria

‏`RETIRED` נשקל כאשר:

- ‏Mechanism שהחזיק את התזה אינו קיים עוד או אינו סביר.
- ‏Net executable economics שליליים לאורך Evidence מספק.
- ‏Robustness/OOS נכשלים שוב ושוב.
- ‏Edge קיים רק תחת assumptions שאינם ניתנים לביצוע.
- ‏Capacity הנדרשת אינה נגישה.
- ‏Competition/decay קיצרו את opportunity מעבר ליכולת שלנו.
- ‏Challenger/alternative dominates באופן עקבי לאחר costs.

‏Resurrection דורשת Evidence חדש, לא זיכרון של old PnL.

---

## ‏48. Rejection Criteria לרעיון חדש

‏נפסיק מוקדם כאשר:

```text
no plausible thesis and no unusually strong robust evidence
point-in-time correctness fails
OOS disappears
parameter spike only
edge exists only before realistic costs
edge exists only with fantasy fills
edge requires inaccessible latency
edge is concentrated in a tiny accidental sample
negative evidence overwhelms positives
exit feasibility invalidates economics
```

‏כישלון מוקדם הוא תוצאה מחקרית טובה.

---

## ‏49. Failure Modes

### ‏Edge Illusion

```text
overfitting
data leakage
survivorship bias
selection bias
winner's curse
metric switching
execution fantasy
cost omission
```

### ‏Operational Illusion

```text
stale data
wrong timestamps
wrong universe
provider semantics drift
broker behavior mismatch
partial/no-fill omission
```

### ‏Narrative Illusion

```text
post-hoc story
story without falsifiable metric
one winning period treated as mechanism proof
```

### ‏Scale Illusion

```text
small-size result extrapolated linearly
capacity ignored
impact ignored
exit liquidity ignored
```

---

## ‏50. Edge Journal

‏לכל Strategy Version נשמור:

```text
strategy_version
thesis
mechanism
expected_horizon
expected_signal_half_life
required_regimes
key assumptions
primary metric
secondary metrics
cost model
latency model
fill model
capacity envelope
known failure modes
kill criteria
promotion criteria
rejection criteria
evidence links
negative results
open questions
```

‏זהו Research Artifact, לא Dashboard field בלבד.

---

## ‏51. Research Memory

‏Negative results נשמרים.

‏לא מוחקים ניסוי שנכשל כדי “לנקות” את הסיפור.

‏כך מצמצמים:

```text
publication bias
repeat experiments
selective memory
post-hoc narrative
```

---

## ‏52. Edge Versioning

‏שינוי מהותי ב־:

```text
signal
features
filters
ranking
vetoes
entry
execution
exit
cost model
risk assumptions
universe
```

‏יוצר Strategy/Edge Version חדש כאשר הוא משנה את החוזה הכלכלי.

‏תוצאות היסטוריות אינן נדרסות.

---

## ‏53. Confidence Model

‏נחזיק Confidence בנפרד מ־estimated edge.

‏גורמים שמעלים Confidence:

```text
protected OOS
broad regime coverage
independent-ish episodes
robust parameter neighborhood
realistic execution modeling
replay parity
shadow/paper parity
external calibration when available
stable attribution
```

‏Confidence נמוך מגדיל את דרישת ה־headroom או משאיר את הרעיון במחקר.

---

## ‏54. `UNKNOWN` הוא State תקין

‏כאשר אין מספיק Evidence:

```text
UNKNOWN
```

‏לא:

```text
probably fine
```

‏Unknown יכול לחול על:

```text
edge size
capacity
fill quality
regime dependence
latency tolerance
cost sensitivity
```

---

## ‏55. User-Specific Application

‏לרובוט שלנו ברירת המחדל אינה:

```text
pick the stock rising fastest
```

‏אלא:

```text
broad-universe candidates
→ positive short-horizon evidence
→ activity / flow confirmation
→ liquidity / executability
→ hard-veto removal
→ freshness / persistence revalidation
→ expected net executable edge
→ sufficient headroom
→ TRADE or NO_TRADE
```

‏ה־research question המרכזית:

> ‏האם ניתן לזהות בזמן ובעלות סבירה candidates שבהם short-horizon momentum נשאר חי מספיק זמן כדי להשאיר `Net Executable Edge` לאחר entry, fill, exit וכל העלויות?

---

## ‏56. What I Would Avoid Initially

‏לא הייתי מתחיל ב־:

- ‏“Secret indicator” hunting.
- ‏עשרות Features בלי ablation.
- ‏parameter optimization צפוף.
- ‏ML complexity לפני baseline חזק.
- ‏trade-every-winner policy.
- ‏edge estimate שמסתמך על Last Price בלבד בלי executability.
- ‏PnL-only promotion.
- ‏automatic retuning אחרי bad day.
- ‏capacity extrapolation מגודל קטן.
- ‏strategy שמצליחה רק תחת fill model יחיד ואופטימי.
- ‏live threshold changes ללא versioning.
- ‏assumption שה־best rank חייב להפוך ל־Trade.

---

## ‏57. What to Add Later

‏רק לאחר Baseline ו־Evidence:

- ‏Regime-conditioned edge models.
- ‏Learned execution-risk models.
- ‏Contextual fill probability.
- ‏Dynamic edge-decay estimation.
- ‏Formal uncertainty calibration.
- ‏Bayesian/online updating כאשר governance ברור.
- ‏More advanced capacity curves.
- ‏Adaptive routing/execution policies.
- ‏Automated edge-health control charts.
- ‏Portfolio of multiple independent edge theses.

---

## ‏58. Alternatives

### ‏Alternative A — Pure Predictive Ranking

```text
rank by expected future return
```

‏יתרון: פשוט למחקר.

‏חיסרון: מתעלם מחלק מה־execution economics.

‏שימוש: Research diagnostic בלבד.

### ‏Alternative B — End-to-End Economic Ranking

```text
rank by expected net executable value
```

‏יתרון: קרוב יותר למטרה הכלכלית.

‏חיסרון: דורש models רבים ועלול להכניס model error.

‏שימוש: Preferred direction לאחר calibration.

### ‏Alternative C — Filters + Simple Ranking

```text
hard eligibility filters
→ simple relative ranking
```

‏יתרון: explainable, robust יותר בתחילת הדרך.

‏חיסרון: עלול לפספס interactions.

‏שימוש: Preferred Baseline עבורנו.

---

## ‏59. Recommended Baseline Architecture

```text
Point-in-Time Market State
→ Eligibility Filters
→ Positive Evidence
→ Hard Negative-Evidence Vetoes
→ Simple Explainable Ranking
→ Rank Gap / Persistence Check
→ Executability Estimate
→ Cost Estimate
→ Remaining Net Edge Estimate
→ Headroom / Confidence Gate
→ TRADE / NO_TRADE
→ Edge-Retention Measurement
→ Attribution / RCA
```

‏זהו baseline מחקרי; כל threshold חייב validation.

---

## ‏60. Evidence Required Before Changing the Baseline

‏כדי להוסיף complexity, נרצה להראות:

```text
repeatable decision impact
incremental net edge after costs
robust OOS improvement
no material deterioration in tails
no unacceptable complexity/latency tax
replayable attribution
```

‏שיפור על metric משני בלבד אינו מספיק.

---

## ‏61. Stress Tests

‏נריץ לפחות:

```text
higher spread
higher slippage
higher fees
latency increase
lower fill probability
worse adverse selection
later exit
reduced liquidity
universe perturbation
regime shift
parameter perturbation
```

‏המטרה היא להבין fragility map, לא להוכיח שה־Strategy “שורדת הכול”.

---

## ‏62. Fragility Map

‏לכל Strategy נשמור:

```text
What kills prediction?
What kills capture?
What kills exit economics?
What kills capacity?
What kills operational reliability?
```

‏וזה מתחבר ישירות ל־alerts ול־kill criteria.

---

## ‏63. Edge Health Dashboard

‏נרצה להציג לפחות:

```text
Strategy / Edge Version
Edge State
Predicted Edge Distribution
Expected Net Edge
Edge Headroom
Signal Half-Life
Rank Persistence
Capture Ratio
NetEdgeRetained
Latency Tax
Cost Ratio
Fill Quality / Markout
Exit Giveback
Current Regime
Current Evidence Confidence
Kill-Criteria Status
```

‏Dashboard הוא projection; Evidence store הוא source of truth.

---

## ‏64. Alerting

‏Alert מועיל מצביע על precursor:

```text
WHAT changed
WHERE in the edge stack
HOW much
WHICH evidence window
WHICH capability is affected
```

‏לדוגמה:

```text
Prediction mapping stable
but Capture Ratio deteriorated
because entry slippage + exit giveback rose
```

‏זה שימושי יותר מ־`PnL down` בלבד.

---

## ‏65. Fact / Judgment / Hypothesis

### ‏Fact / engineering semantics

- ‏Signal או Score לבדם אינם כוללים בהכרח execution, costs, fill probability או exit economics.
- ‏Filled trades יכולים להיות subset לא־אקראי של intents.
- ‏Costs, latency ו־capacity יכולים לשנות את economics של opportunity.
- ‏Backtest result תלוי בהנחות data/execution/model.
- ‏Sample correlation יכולה להפחית את effective evidence לעומת raw trade count.

### ‏Judgment

- ‏למערכת שלנו נכון להתחיל ב־filters + vetoes + explainable ranking + net executable gate, ולא ב־end-to-end model מורכב.
- ‏`NO_TRADE` צריך להיות outcome מרכזי ולא failure.
- ‏Edge Thesis, Edge Contract, Kill Criteria ו־Edge Journal צריכים להיות first-class artifacts.
- ‏שיפור הבא צריך להתמקד ב־Edge Bottleneck המדוד, לא ברכיב החדש והמעניין ביותר.

### ‏Hypothesis

- ‏שילוב broad-universe momentum, activity confirmation, liquidity/executability ו־negative evidence יוצר selection edge בר־ביצוע.
- ‏ה־horizon המתאים לתשתית שלנו הוא milliseconds-to-seconds/tens-of-seconds, אך הוא חייב להימדד בפועל.
- ‏Veto/NO_TRADE discipline עשוי לתרום יותר מ־Feature חיובי נוסף.
- ‏ה־Edge, אם קיים, עשוי להיות regime-dependent ובעל capacity מוגבלת.

---

## ‏66. Confidence

### ‏High Confidence

‏ב־:

```text
Signal != complete economic edge
realistic costs/execution matter
robustness/OOS matter
capacity and latency can change realized economics
NO_TRADE is a valid decision
falsifiability and kill criteria improve research discipline
```

### ‏Medium Confidence

‏ב־Baseline architecture המומלצת של:

```text
filters
+ vetoes
+ explainable ranking
+ executable economics gate
+ edge-retention attribution
```

### ‏Empirical / Must Validate

‏כל threshold או magnitude על:

```text
minimum net edge
headroom
signal half-life
rank persistence
latency tolerance
fill probability
cost tolerance
capacity
promotion sample size
kill threshold
```

---

## ‏67. Time-Sensitive Facts

‏המקטע אינו מקבע:

```text
current broker fees
current routing behavior
current order capabilities
current market-data semantics
current venue behavior
current regulatory rules
current session structure
```

‏לפני שימוש תפעולי בנתון תלוי Broker/Venue/Provider/Regulation יש לאמת אותו מול מקור עדכני.

‏ה־Edge Thesis עצמה אינה הופכת Fact בגלל persistence היסטורי.

---

## ‏68. Relationship to Earlier Sheets

### ‏14–15 — Ranking / Trade-No-Trade

‏63 מבהיר ש־Rank הוא רק input ל־economic eligibility.

### ‏18 — True Costs / Net Edge

‏18 הוא Source of Truth ל־cost accounting.

‏63 הופך את Net Edge לחלק מהגדרת ה־Edge עצמו.

### ‏22–24 — Validation / Experiments

‏63 משתמש ב־OOS, controlled experiments, challenger policy ו־ablation כדי לבדוק אם Edge אמיתי.

### ‏25 — Regime

‏63 דורש conditional edge ו־regime-aware evidence בלי להניח שה־Strategy חייבת לעבוד בכל regime.

### ‏46 — Adverse Selection

‏Fill Quality ו־post-fill markout הם חלק מ־capture edge.

### ‏47 — Capacity

‏Capacity אינה הערת שוליים; היא חלק מהגדרת usable edge.

### ‏48 — Latency

‏63 מתרגם latency ל־`LatencyTax` ו־Horizon Fit.

### ‏60A — Negative Evidence

‏63 הופך vetoes ו־`NO_TRADE` לרכיב אפשרי ב־Edge Stack.

### ‏61 — Backtest Subtleties

‏61 מגדיר למה simulated edge יכול להיות illusion.

‏63 מגדיר מה צריך לשרוד כדי לקרוא לו Edge candidate רציני.

### ‏62 — Live Trading Subtleties

‏62 מודד כמה מה־modeled edge נשמר מול external truth.

‏63 משתמש ב־calibration הזה כדי לעדכן Confidence, Edge State ו־Kill Criteria.

---

## ‏69. Relationship to 64

‏63 שואל:

```text
Do we have a sufficiently evidenced and executable edge thesis?
```

‏64 ישאל:

```text
Is the entire system professionally ready
for any authorized transition beyond Paper / Shadow?
```

‏לכן Edge evidence הוא תנאי הכרחי אך אינו מספיק ל־operational readiness.

---

## ‏70. Recommended Hierarchy

```text
Baseline
→ Written Edge Thesis + Filters/Vetoes + Simple Ranking + Net Executable Gate

Preferred Default
→ Edge Contract + Headroom + Evidence Ladder + Attribution + Kill Criteria

Challenger
→ one controlled component change with incremental net-edge evidence

Advanced Option
→ contextual / regime-aware edge estimation and calibrated uncertainty

Specialist Option
→ learned execution/capacity models and multi-edge allocation

Avoid Unless Evidence
→ opaque complexity, live retuning, parameter chasing, PnL-only promotion
```

---

## ‏71. Recommendation Summary

‏ברירת המחדל המומלצת לרובוט שלנו היא להגדיר `Edge` כ־**יתרון מערכתי נטו ובר־ביצוע**, ולא כ־Feature, Momentum Score או מניה שמדורגת ראשונה.

‏החוזה:

```text
Plausible Thesis
+ Point-in-Time Evidence
+ Positive Predictive Signal
+ Negative-Evidence Discipline
+ Freshness / Persistence
+ Executability
+ Realistic Round-Trip Costs
+ Sufficient Headroom
+ Horizon / Capability Fit
+ Robustness / OOS
+ Capacity Awareness
+ Edge-Retention Measurement
+ Attribution
+ Kill Criteria
→ Evidence-backed Edge Candidate
```

‏ורק לאחר Validation מתמשך אפשר לקדם אותו בשלבי ה־lifecycle.

‏ה־success criterion אינו:

```text
the top-ranked stock went up
```

‏אלא:

```text
our system repeatedly identified opportunities
whose net executable economics survived realistic frictions,
whose behavior was robust enough to resist plausible alternative explanations,
and whose deterioration could be detected and acted on before blind continuation
```

‏מקטע 64 ייקח את Edge evidence הזה ויבדוק אם שאר המערכת עומדת ב־professional readiness gate.