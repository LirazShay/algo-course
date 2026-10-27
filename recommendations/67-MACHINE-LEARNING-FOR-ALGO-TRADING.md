# ‏67 — Recommendation Sheet: Machine Learning for Algo Trading

> ‏מקור לימודי עיקרי: `../67-MACHINE-LEARNING-FOR-ALGO-TRADING.md`.
>
> ‏מטרת הקובץ: להכריע היכן `Machine Learning` יכול להוסיף ערך למחקר של מערכת `Short-Horizon Momentum` שלנו, ומה חייב להיות נכון לפני שמודל מקבל השפעה על החלטה. ברירת המחדל היא ש־`ML` אינו Edge ואינו Safety Authority; הוא Challenger שצריך להוכיח Decision Value אינקרמנטלי מול Baseline פשוט, תחת Point-in-Time Correctness, ‏time-aware validation, ‏latency, ‏execution ועלויות.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה לבצע מסחר בכסף אמיתי ואינו מניח שמודל כלשהו מייצר רווח.

---

## ‏1. Decision

‏ההחלטה אינה:

```text
Which ML algorithm should we use?
```

‏אלא:

```text
Which specific decision is currently limited by a relationship
that a simple deterministic baseline cannot represent well enough,
and can an ML challenger improve that decision OOS
without losing correctness, timeliness, explainability or net economics?
```

‏שרשרת ההכרעה:

```text
Problem Definition
→ Point-in-Time Dataset
→ Frozen Simple Baseline
→ Small Interpretable Model
→ Time-Aware Validation
→ Economic Evaluation
→ Latency / Execution Stress
→ Decision-Impact Analysis
→ Shadow Challenger
→ Promote / Reject
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏`ML != Edge`

‏מודל הוא mapping:

```text
Inputs → Prediction / Score / Probability / Rank
```

‏Edge קיים רק אם output הזה משפר החלטה כלכלית אמיתית אחרי:

```text
freshness
ranking
vetoes
execution feasibility
fills
latency
costs
exit
```

### ‏`P0 — Required`: Problem Definition לפני Model Selection

‏לפני בחירת algorithm נכתוב:

```text
Decision to improve
Inputs available at time t
Feature cutoff
Target after t
Economic objective
Primary metric
Simple baseline
Failure condition
```

‏אם אין תשובה ברורה לאחד מהם — אין עדיין הצדקה ל־ML.

### ‏`P0 — Required`: Baseline פשוט נשאר Champion בהתחלה

‏Baseline מחקרי מועדף:

```text
hand-engineered causal features
→ deterministic filters
→ simple linear / logistic model or explainable score
```

‏Challenger ראשון:

```text
gradient-boosted trees
```

‏רק אם הוא מוסיף ערך יציב.

### ‏`P0 — Required`: ML אינו מחליף Safety / Risk / Hard Veto

‏מחוץ למודל נשאיר Gates מפורשים כגון:

```text
stale / broken data
halt / invalid state
unknown exposure
unreconciled broker state
unverified exit feasibility
safety controls
eligibility / permissions
```

‏Prediction גבוה לעולם אינו עוקף Gate כזה.

### ‏`P0 — Required`: ‏`NO TRADE / ABSTAIN` הוא output תקין

‏המודל אינו חייב לבחור winner כאשר evidence חלש, prediction stale, data מחוץ ל־distribution המוכר או economics אינם מספיקים.

---

## ‏3. Why This Default

‏במערכת קצרה ה־model יכול להיות מדויק סטטיסטית ועדיין חסר ערך משום שההחלטה מגיעה מאוחר מדי, משתמשת ב־feature stale, בוחרת extreme noisy winner מתוך אלפי symbols, או מנבאת תנועה שאינה executable.

‏לכן אנחנו מעדיפים:

```text
better problem definition
> bigger model

better target
> prettier leaderboard

better point-in-time data
> more features

better decision economics
> higher accuracy
```

---

## ‏4. Use ML When

‏ML הוא Candidate טוב כאשר קיימת לפחות אחת מהסיבות הבאות:

- ‏יש interactions לא־ליניאריים שחוזרים OOS וקשה לבטא היטב ב־rules פשוטים.
- ‏Ranking פשוט משאיר פער מדיד שאפשר לשפר ב־Top-K / Top-1 selection.
- ‏נדרש אומדן רציף כמו `FillProbability`, ‏`ExpectedPostFillMarkout`, ‏`GivebackRisk` או `ExpectedCost`.
- ‏יש מספיק data נקייה ומגוונת כדי להעריך generalization אמיתי.
- ‏החלטה מפורשת תשתנה בפועל בזכות המודל, ולא רק metric פנימי.
- ‏runtime latency ו־operational cost נכנסים בתקציב.

---

## ‏5. Do Not Use ML When

‏לא נכניס ML כאשר:

- ‏לא הוגדרה החלטה ספציפית שהמודל אמור לשפר.
- ‏אין Baseline פשוט ובר־שחזור.
- ‏Dataset אינו Point-in-Time Correct.
- ‏ה־Target אינו execution-aware מספיק לשאלה הכלכלית.
- ‏השיפור קיים רק In-Sample או על parameter/seed צר.
- ‏המודל משפר `Accuracy/AUC` אבל לא Net Decision Value.
- ‏Inference מוסיף delay שמוחק את Signal Half-Life.
- ‏המודל תלוי ב־features שאין להם Online/Offline parity.
- ‏השיפור אינו יציב across time, symbols או regimes.
- ‏אי אפשר להפעיל fallback בטוח ופשוט.

---

## ‏6. Recommended Problem Order

‏סדר מחקר מועדף אצלנו:

### ‏`P1` — Ranking / Reranking

```text
Eligible candidates
→ simple baseline rank
→ ML challenger rerank
→ Top-K / Top-1 evaluation
```

‏זה תואם ישירות לבעיה cross-sectional.

### ‏`P1/P2` — Meta-Filter

```text
Rule-based candidate
→ ML estimate of quality / toxicity
→ explicit Veto / Execution gates
→ TRADE / NO TRADE research outcome
```

### ‏`P2` — Execution-Support Models

‏למשל מחקר של:

```text
FillProbability
ExpectedSlippage
PostFillMarkout
ExitFeasibility
```

‏כמודלים נפרדים מה־price prediction.

### ‏`P2/P3` — Regime / Anomaly Models

‏אפשר להשתמש ב־ML לזיהוי context או חריגות, במיוחד כ־Shadow diagnostic.

### ‏`P4` — Raw Sequence / Deep Models

‏רק אם Baselines פשוטים plateaued ויש dataset ונימוק שמצדיק complexity.

---

## ‏7. Target Policy

### ‏`P0`: Target חייב להתאים להחלטה

‏לא נסתפק אוטומטית ב־:

```text
FutureLast > CurrentLast
```

‏נעדיף Targets שמקושרים לשאלה האמיתית, למשל:

```text
NetForwardOutcome
Top-K relative outcome
TimeToTarget
MFE / MAE
FillProbability
PostFillMarkout
ExpectedCost
GivebackRisk
```

### ‏`P1`: Multi-Horizon Evidence

‏ל־short horizon נעדיף curve על point יחיד:

```text
Outcome at 1s / 2s / 5s / 10s / 30s / 60s
```

‏או horizons המתאימים ל־dataset בפועל.

‏המטרה היא לראות onset, peak, decay ו־reversal ולא לבחור horizon מנצח בדיעבד.

---

## ‏8. Dataset Contract

‏לכל sample נשמור לפחות:

```text
DecisionTime
FeatureCutoff
LabelStart
LabelEnd
Symbol
Episode / Group identity
Universe state
Feature schema version
Data generation / provider version
Target version
```

‏וכל Feature חייב להיות causally available עד `FeatureCutoff`.

---

## ‏9. Validation Policy

### ‏`P0`: Time-Aware Validation

‏ברירת המחדל:

```text
Past → Future
```

‏לא random shuffle של time series.

### ‏`P0`: Purge / Embargo כאשר Labels חופפים

‏כאשר forward labels חופפים, דגימות סמוכות אינן עצמאיות. Split חייב למנוע information sharing עקיף.

### ‏`P0`: Frozen Final Holdout

‏כל שימוש ב־final holdout לצורך model/feature/threshold selection מפחית את עצמאותו וצריך להירשם.

### ‏`P1`: Grouped Validation

‏כאשר נדרש נבדוק generalization גם לפי:

```text
Day
Session
Episode
Symbol-day
Symbol group
Regime
```

---

## ‏10. Scanner-Specific Winner's Curse

‏בחירה של Rank #1 מתוך אלפי symbols היא Extreme Selection.

‏לכן מודל Scanner חייב להיבדק תחת exact selection process ולא רק ברמת row prediction.

‏נמדוד:

```text
Predicted vs realized outcome by rank
Top-1 vs Top-3 / Top-5 / Top-10
Top-1 lift over eligible universe
RankGap
Rank persistence
Winner churn
Prediction error of selected maximum
```

‏אם Top-1 אינו משפר באופן יציב את Top-K הרחב יותר, אין הצדקה להניח שהמודל יודע לבחור winner מדויק.

---

## ‏11. Baseline Model Ladder

### ‏Baseline A — Deterministic / Rule-Based

‏הכי קל ל־RCA ולשחזור.

### ‏Baseline B — Linear / Logistic

‏ברירת המחדל הראשונה ל־ML:

- ‏מהיר.
- ‏פרשני.
- ‏קל ל־calibration.
- ‏קל להשוות מול features קיימים.

### ‏Challenger C — Shallow Tree / Gradient Boosting

‏מוצדק כאשר interactions/nonlinearity מוסיפים OOS value.

### ‏Advanced D — Ensembles / Specialized Models

‏רק לאחר שה־single-model baseline הוכיח מגבלה אמיתית.

### ‏Specialist E — Neural / Sequence Models

‏רק עם dataset מתאים, latency budget והוכחת incremental value.

---

## ‏12. Models I Would Avoid Initially

‏לא נתחיל מ־:

```text
Deep Transformer
RL
AutoML over hundreds of features
continuous online self-training
automatic retrain + automatic promotion
large stacking graph
mixture of experts
```

‏לא משום שהם “רעים”, אלא משום שהם מגדילים degrees of freedom, operational risk ו־RCA cost לפני שהוכח צורך.

---

## ‏13. Feature Policy

### ‏`P0`: Feature Contract

‏לכל Feature:

```text
Name
Definition
Unit
Time semantics
Warmup
Missing behavior
Freshness rule
Version
```

### ‏`P0`: Online / Offline Parity

‏Replay/Training ו־Online חייבים לייצר אותה משמעות עבור אותו event stream.

### ‏`P1`: Small Stable Feature Set

‏נעדיף features causal ומובנים:

```text
multi-horizon returns
activity / trade rate
flow
spread / liquidity
book / microprice where reliable
freshness / age
rank persistence
```

‏על מאות transformations דומים.

---

## ‏14. Missing / Stale / NotReady Policy

‏לא נמחץ states שונים ל־zero.

```text
0 != Missing != NotReady != Stale != Unavailable
```

‏Model יכול ללמוד missingness, אבל רק אם ברור שהיא Market/Operational signal ולא artifact של provider או pipeline.

---

## ‏15. Scaling and Normalization

‏כל scaling חייב להיות Point-in-Time Correct.

‏Cross-sectional normalization דורש גם Fresh Coverage הוגן; symbol stale אינו צריך לקבל rank “טוב” בגלל השוואה לא קוהרנטית.

‏Normalization עצמה היא חלק מ־Feature Version.

---

## ‏16. Economic Metric Policy

‏Classification metrics אינם Gate מספיק.

‏לכל Model נמדוד גם:

```text
Net outcome after realistic costs
Decision delta vs baseline
Marginal outcome when decision changed
Top-K lift
Latency tax
Execution-aware edge retained
Avoided-loss value of abstention
Missed-opportunity cost
```

‏`Accuracy`, ‏`ROC-AUC`, ‏`PR-AUC` ו־`Brier Score` הם diagnostics, לא יעד כלכלי סופי.

---

## ‏17. Calibration Policy

‏כאשר output מתפרש כ־probability, נדרוש calibration analysis:

```text
predicted probability bucket
vs
observed frequency
```

‏אבל גם probability calibrated אינה Safety signal אם sample מחוץ ל־training distribution.

---

## ‏18. Abstention and Uncertainty

‏ברירת המחדל צריכה לאפשר:

```text
MODEL_OK
MODEL_UNCERTAIN
MODEL_OOD
MODEL_STALE
MODEL_UNAVAILABLE
```

‏כאשר uncertainty גבוהה:

```text
new ML-driven decision influence → blocked
```

‏אפשר לחקור:

- ‏Ensemble disagreement.
- ‏Bootstrap uncertainty.
- ‏Prediction intervals.
- ‏Conformal methods.

‏אך אין חובה להתחיל מכלי uncertainty מורכב.

---

## ‏19. Veto Architecture

‏המלצה:

```text
Fast deterministic eligibility
→ ML score / rank
→ Hard Negative-Evidence / Safety Vetoes
→ Execution Feasibility
→ Economic Gate
→ TRADE / NO TRADE research decision
```

‏ML יכול להציע Soft Penalty, אבל Hard Veto בטיחותי אינו “feature weight”.

---

## ‏20. Separate Prediction from Execution Models

‏לא נכריח Model אחד לפתור הכול.

‏אפשר להפריד רעיונית:

```text
Movement Model
Fill Model
Adverse Selection Model
Cost Model
Exit Feasibility Model
```

‏ולשלב outputs ב־Decision Aggregator ברור.

‏זה גם משפר attribution.

---

## ‏21. Inference Performance Policy

### ‏`P0`: Prediction TTL

‏Prediction שפג תוקפו אינו usable רק משום שהוא הגיע.

### ‏`P0`: Deadline / Timeout

‏Inference חייב deadline שמתאים ל־Signal Half-Life.

### ‏`P0`: Queue Age

‏נמדוד age של העבודה ולא רק queue length.

### ‏`P1`: Bounded Work

‏עדיף לדחות stale inference מאשר לעבד backlog היסטורי שכבר אינו רלוונטי.

### ‏`P1`: Two-Stage Inference

‏אם full-universe inference יקר:

```text
Fast deterministic filter
→ bounded candidate set
→ deeper ML rerank
```

‏אבל נמדוד את miss-rate של Stage 1.

---

## ‏22. Training Process Is Part of the Backtest

‏Backtest תקין של ML חייב לשחזר גם:

```text
training cutoff
model vintage
retraining schedule
feature availability
inference delay
prediction TTL
```

‏אסור לאמן על כל ההיסטוריה ואז להעמיד פנים שהמודל היה זמין בעבר.

---

## ‏23. Reproducibility and Versioning

‏כל Prediction משמעותי צריך להיות traceable ל־:

```text
ModelVersion
FeatureSchemaVersion
TrainingDatasetVersion
TargetVersion
CodeCommit
ConfigFingerprint
```

‏Training Dataset Manifest יכלול:

```text
Date range
Universe
Provider / data version
Feature version
Label version
Exclusions
```

---

## ‏24. Model Registry

‏ל־Challenger/Champion נשמור:

```text
Version
Training date
Dataset manifest
Validation report
Economic report
Latency report
Shadow report
Approval status
Rollback target
```

---

## ‏25. Champion / Challenger Policy

‏ה־Champion נשאר פשוט כל עוד Challenger לא מוכיח יתרון.

‏Challenger חדש:

```text
runs in Shadow
produces counterfactual decisions
cannot override Champion
logs decision delta
```

‏Promotion אינו נקבע לפי leaderboard אלא לפי Decision Value.

---

## ‏26. Required Shadow Evidence

‏ב־Shadow נמדוד לפחות:

```text
Prediction distribution
Calibration
Rank / Top-K performance
Decision delta
Feature freshness
Inference latency
Prediction age
Drift
Counterfactual outcome
Net outcome after modeled execution/costs
```

---

## ‏27. Drift Monitoring

‏נפריד:

```text
Data drift
Feature drift
Label / base-rate drift
Prediction drift
Calibration drift
Decision drift
Execution drift
Strategy drift
```

‏לא כל Feature drift מצדיק retraining.

‏השאלה המרכזית:

```text
Did it materially alter decisions or outcomes?
```

---

## ‏28. Retraining Policy

‏ברירת המחדל:

```text
Controlled retraining
!=
automatic promotion
```

‏Retraining trigger יכול להיות time/drift/performance, אבל כל Model חדש חוזר דרך Validation ו־Shadow Gate.

---

## ‏29. Model Failure Policy

‏כשלי Model אפשריים:

```text
schema mismatch
NaN storm
stale feature cache
wrong normalization
model/runtime mismatch
corrupt model
inference timeout
queue overload
```

‏Fallback חייב להיות מוגדר מראש:

```text
ML unavailable → disable ML influence
```

‏או:

```text
ML unavailable → validated simple baseline
```

‏לעולם לא default score מומצא.

---

## ‏30. RCA Policy

‏כאשר תוצאה שונה מהצפוי:

```text
Data
→ Feature generation
→ Feature freshness
→ Model input
→ Prediction
→ Rank
→ Decision delta
→ Veto / feasibility
→ Execution
→ Outcome
```

‏לא מתחילים אוטומטית ב־“צריך retrain”.

---

## ‏31. Feature Importance / Explainability

‏נשתמש ב־importance, ‏permutation importance או `SHAP` כ־diagnostics בלבד.

‏הם אינם מוכיחים causality ואינם מחליפים:

- ‏Ablation.
- ‏OOS stability.
- ‏Mechanism review.
- ‏Decision-impact analysis.

---

## ‏32. Model Search Discipline

‏כל model variant / hyperparameter family / feature set שנבדק הוא חלק מ־Search Space.

‏נשמור:

```text
Number of variants tried
Validation periods touched
Feature sets tried
Target variants tried
Seeds tried
```

‏Winner מתוך search גדול מקבל burden of proof גבוה יותר.

---

## ‏33. Stability Matrix

‏Challenger רציני ייבדק לפחות across:

```text
Time periods
Regimes
Symbols / symbol groups
Liquidity buckets
Volatility buckets
Seeds where relevant
Latency stress
Cost stress
```

‏Peak יחיד אינו מספיק.

---

## ‏34. Promotion Criteria

‏Model מתקדם מ־Research ל־Shadow רק אם:

1. ‏Problem/Target מוגדרים מראש.
2. ‏Dataset Point-in-Time Correct.
3. ‏לא נמצא Leakage מהותי.
4. ‏יש Baseline קפוא.
5. ‏יש OOS improvement מול baseline.
6. ‏השיפור קיים גם ב־economic metric.
7. ‏השיפור שורד latency/cost/execution stress.
8. ‏המודל יציב across relevant periods/regimes.
9. ‏Inference נכנס בתקציב.
10. ‏Feature serving parity מאומת.
11. ‏Failure/fallback behavior מוגדר.
12. ‏Decision Impact מספיק כדי להצדיק complexity.

---

## ‏35. Promotion from Shadow

‏גם אחרי Shadow, השאלה אינה “האם המודל היה טוב”.

‏נדרוש:

```text
Decision delta understood
Counterfactual benefit persistent
Calibration/ranking acceptable
No operational instability
Prediction freshness acceptable
Execution-aware advantage retained
No safety regression
```

‏במסמך זה Promotion משמעותו readiness לשלב המחקרי/מבוקר הבא בלבד, לא אישור לכסף אמיתי.

---

## ‏36. Rejection Criteria

‏נדחה או נשהה Model אם:

- ‏OOS advantage נעלם.
- ‏השיפור תלוי ב־narrow period, few symbols או seed יחיד.
- ‏Economic gain קטן מה־complexity/latency tax.
- ‏המודל אינו משנה decisions מספיק.
- ‏Decision changes אינם משפרים outcome נטו.
- ‏Feature-serving skew קיים.
- ‏Calibration / rank quality נשחקים מהותית.
- ‏Model fails under realistic latency/cost assumptions.
- ‏Fallback/recovery אינם ברורים.
- ‏Baseline פשוט נותן תוצאה דומה עם פחות סיכון תפעולי.

---

## ‏37. Metrics

### ‏Predictive / Ranking

```text
Top-K lift
Rank correlation
Top-1 vs Top-K outcome
RankGap behavior
Calibration
Brier score where relevant
PR-AUC / ROC-AUC as diagnostics
```

### ‏Economic

```text
Expected net outcome
Decision-delta net outcome
Marginal Decision Value
Execution-aware edge retained
Abstention value
Cost / latency sensitivity
```

### ‏Operational

```text
Inference P50 / P95 / P99
Prediction age
Queue age
Timeout rate
Feature stale rate
Schema / NaN failures
Fallback rate
```

### ‏Stability

```text
Performance by period
Performance by regime
Performance by symbol group
Performance by liquidity / volatility
Seed variance
Drift metrics
```

---

## ‏38. Failure Modes

### ‏Failure A — Leakage Winner

‏Model נראה מצוין כי Features/labels/splits ראו עתיד.

### ‏Failure B — Leaderboard Winner, Economic Loser

‏`AUC` משתפר אך העלויות או latency מוחקות את השיפור.

### ‏Failure C — Extreme-Selection Winner's Curse

‏Top-1 prediction מופרז בגלל בחירת maximum מתוך אלפים.

### ‏Failure D — Training-Serving Skew

‏Online features שונים ממשמעות training.

### ‏Failure E — Model Too Slow

‏Inference quality גבוהה, אבל prediction מגיע אחרי שה־edge דעך.

### ‏Failure F — Regime Memorization

‏Model למד period/context ספציפי ולא relationship generalizable.

### ‏Failure G — Symbol Memorization

‏Model למד tickers/identity במקום behavior.

### ‏Failure H — Auto-Retrain Spiral

‏Drift קטן מפעיל retraining ושינוי policy ללא evidence מספיק.

### ‏Failure I — Safety Absorption

‏Rules בטיחותיים נטמעים בתוך score ונהיים ניתנים לעקיפה.

### ‏Failure J — Explanation Theater

‏`SHAP` יפה משמש תחליף ל־OOS/ablation/economic validation.

---

## ‏39. What I Would Avoid Initially

- ‏Deep sequence models לפני Baseline tabular ברור.
- ‏`RL` למסלול decision ראשי.
- ‏Hundreds of features ללא Feature Contracts/Ablation.
- ‏`AutoML` רחב על אותו validation set.
- ‏Synthetic time-series oversampling כברירת מחדל.
- ‏Continuous online self-training.
- ‏Automatic retrain + automatic deployment.
- ‏Model stack שקשה לשחזר או לייחס לו החלטה.
- ‏Embedding של Hard Safety rules בתוך ML score.
- ‏שימוש ב־Ticker identity בלי hypothesis מפורש ו־generalization test.

---

## ‏40. What to Add Later

‏לאחר Baseline מוכח אפשר לחקור:

- ‏Pairwise / Listwise ranking.
- ‏Specialized fill/adverse-selection models.
- ‏OOD detection.
- ‏Conformal uncertainty.
- ‏Ensembles עם diversity אמיתי.
- ‏Multi-task learning.
- ‏Sequence models ל־raw event/book data.
- ‏Regime specialists.
- ‏Learned representations.

‏כל תוספת נכנסת כ־Challenger נפרד עם burden of proof משלה.

---

## ‏41. Alternatives

### ‏Alternative A — No ML

‏Filters + interpretable ranking בלבד.

‏זו חלופה מלאה ולגיטימית אם אין incremental benefit.

### ‏Alternative B — Simple Statistical Model

‏Linear/Logistic model עם Feature Engineering טוב.

‏זו ברירת המחדל המועדפת לבדיקת צורך אמיתי ב־ML.

### ‏Alternative C — Gradient Boosting

‏Challenger מועדף ל־tabular nonlinearities לאחר Baseline.

### ‏Alternative D — Deep/Sequence Model

‏Specialist option בלבד כאשר raw sequence information באמת נדרשת.

---

## ‏42. Trade-offs

| בחירה | יתרון | מחיר |
|---|---|---|
| ‏Rule/Linear baseline | ‏מהיר, ברור, RCA קל | ‏פחות nonlinear capacity |
| ‏Boosted trees | ‏interactions חזקים ב־tabular | ‏יותר tuning ו־overfit risk |
| ‏Ensemble | ‏variance/robustness פוטנציאליים | ‏latency, complexity, attribution |
| ‏Deep sequence | ‏יכול ללמוד raw temporal structure | ‏data/compute/deployment/interpretability |
| ‏Online learning | ‏adaptation מהירה | ‏reproducibility ו־feedback risk |
| ‏Abstention | ‏מפחית forced decisions | ‏מפספס opportunities מסוימות |

---

## ‏43. Required Data / Evidence

‏לפני טענה ש־ML “עובד” נדרוש:

```text
Point-in-time dataset
Feature/target contracts
Baseline result
Search-space record
Time-aware OOS result
Effective-sample / grouping context
Ranking / selection report
Economic report after costs
Latency report
Execution-stress report
Stability report
Shadow counterfactual report
Decision-impact report
Failure/fallback tests
```

---

## ‏44. User-Specific Application

‏למערכת שלנו, ברירת המחדל המחקרית היא:

```text
Broad universe
→ deterministic freshness / eligibility filters
→ simple causal feature set
→ simple interpretable Champion rank
→ optional ML Challenger rerank on bounded candidates
→ negative-evidence / safety vetoes
→ execution-feasibility estimate
→ economic gate
→ TRADE / NO TRADE research outcome
```

‏בשלב הראשון `ML` צריך לענות על שאלה אחת בלבד:

> ‏האם הוא משפר את בחירת המועמד או את ההחלטה `TRADE / NO TRADE` ביחס ל־Baseline הפשוט, לאחר latency, costs ו־selection bias?

‏אם לא — נשארים עם Baseline.

---

## ‏45. Fact / Judgment / Hypothesis

### ‏Fact

- ‏ML מנצל relationships ב־data שהוא מקבל; הוא אינו יוצר information שלא קיים ב־inputs.
- ‏Random split יכול לשבור time-order וליצור validation לא מתאים ל־time series.
- ‏Training-serving skew יכול לגרום ל־Production input להיות שונה מה־Training input.
- ‏בחירת maximum מתוך קבוצה גדולה מגדילה חשיפה ל־extreme noise.

### ‏Judgment

- ‏להתחיל ב־simple linear/logistic Champion.
- ‏להשתמש ב־boosted trees כ־Challenger ראשון ל־tabular nonlinearities.
- ‏להשאיר Hard Safety/Veto/Risk מחוץ למודל.
- ‏להעדיף Shadow + counterfactual logging לפני כל השפעה החלטתית.
- ‏לא לבצע automatic model promotion.

### ‏Hypothesis

- ‏ML reranking עשוי להוסיף incremental Top-1/Top-K value מעבר ל־simple ranking.
- ‏מודלים נפרדים ל־fill/adverse selection עשויים להעלות Expected Executable Edge.
- ‏Abstention/OOD signals עשויים לשפר `NO TRADE` decisions.

‏כל Hypothesis דורשת OOS ו־Shadow Evidence.

---

## ‏46. Confidence

‏**Confidence: High** לגבי הארכיטקטורה והמשמעת המחקרית: Baseline first, point-in-time dataset, time-aware validation, Shadow, versioning, safety separation ו־economic evaluation.

‏**Confidence: Medium** לגבי משפחת המודל שתהיה הטובה ביותר בפועל. הבחירה בין Logistic, Boosted Trees, Ranking models או sequence models היא שאלה אמפירית שתלויה ב־data וב־decision target.

‏**Confidence: Low until tested** לגבי כל טענה שמודל מסוים יוסיף Net Edge לרובוט שלנו.

---

## ‏47. Time-Sensitive Facts

‏Frameworks, runtimes, hardware, library behavior, model-serving capabilities ועלויות compute משתנים בזמן. אם בעתיד נבחר implementation ספציפי, נדרש אימות עדכני של:

- ‏גרסת library/runtime.
- ‏Determinism semantics.
- ‏Model export/runtime parity.
- ‏Latency על החומרה בפועל.
- ‏Compatibility ו־security status.

‏עקרונות ה־validation וה־economic evaluation במסמך אינם תלויים בגרסה מסוימת של framework.

---

## ‏48. Recommendation Summary

‏ברירת המחדל שלנו היא:

```text
ML is optional.
Baseline is mandatory.
Point-in-time correctness is mandatory.
Time-aware OOS validation is mandatory.
Hard safety gates stay deterministic.
Decision impact matters more than leaderboard metrics.
Execution economics matter more than prediction accuracy.
Shadow before promotion.
Complexity must earn its place.
```

‏לכן ה־MVP המחקרי אינו “לבנות AI למסחר”. הוא לבנות Baseline פשוט שאפשר לנצח בצורה הוגנת. רק לאחר מכן ML מקבל הזדמנות להוכיח שהוא מוסיף ערך אמיתי.