# ‏24 — Recommendation Sheet: Controlled Experiments / Score Improvement

> ‏מקור לימודי עיקרי: `../24-CONTROLLED-EXPERIMENTS-AND-SCORE-IMPROVEMENT.md`.
>
> ‏מטרת הקובץ: לקבוע תהליך מחקר שבו כל שינוי ב־`Features`, ‏`Filters`, ‏`Score`, ‏Entry או Exit הופך לניסוי מבוקר שניתן להפריך, לשחזר ולהשוות ל־Champion קבוע — במקום לבצע tuning עד שה־Backtest נראה טוב.
>
> ‏המקטע ממשיך את 22–23: ‏22 הגדיר כיצד מודדים Predictive Quality; ‏23 הגדיר כיצד מגינים מפני `Overfitting` ו־`Leakage`; ‏24 מגדיר כיצד מנסים לשפר את המערכת **בלי לשבור את משטר ה־Evidence**.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
Did the new backtest look better?
```

‏אלא:

```text
Keeping the research conditions controlled,
did the specific change produce incremental predictive/economic value
above the current champion,
on new data,
without creating unacceptable execution, latency, tail or complexity regressions?
```

‏לכן מסלול ההחלטה הוא:

```text
Observation / RCA
→ Hypothesis
→ Experiment Spec
→ Frozen Control + Treatment
→ Same-data paired comparison
→ Predictive evidence
→ Execution evidence
→ Net economic evidence
→ OOS / Walk-Forward
→ Robustness / Complexity review
→ KEEP / REJECT / REWORK / NEEDS_MORE_DATA
→ Shadow before promotion when warranted
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Champion קפוא לכל Experiment

‏לכל Experiment יש `Control` מוגדר במפורש:

```text
champion_version
feature_version
filter_version
score_version
universe_version
cost_model_version
execution_model_version
dataset_version
```

‏`Treatment` מתחיל מאותו Control ומשנה רק את מה שהוגדר בניסוי.

‏אין להשוות:

```text
old code + old data
vs
new code + new data + new costs
```

‏כאילו זה ניסוי על Feature יחיד.

### ‏`P0 — Required`: Experiment אחד = שאלה מרכזית אחת

‏ברירת המחדל:

```text
one hypothesis
one planned change
one primary metric
one fixed comparison
```

‏כאשר שינוי אחד מחייב package טכני קטן, למשל Feature + normalization תואם, מגדירים אותו במפורש כ־`Treatment Package`.

‏אין להציג package של חמישה שינויים כאילו רק Feature אחד השתנה.

### ‏`P0 — Required`: Hypothesis לפני Results

‏לפני Run כותבים:

```text
hypothesis
mechanism / rationale
expected direction
relevant horizons
primary_metric
guardrails
acceptance_rule
rejection_rule
```

‏לדוגמה מבני:

```text
Hypothesis:
activity acceleration adds incremental short-horizon continuation signal
beyond current momentum/activity features.
```

‏השערה שנולדה **אחרי** שראינו תוצאה היא Hypothesis חדשה לניסוי הבא, לא Evidence של הניסוי הנוכחי.

### ‏`P0 — Required`: Primary Metric מוגדר מראש

‏לכל Experiment יש Primary Metric אחד או מספר קטן מאוד.

‏לשיטה שלנו Baseline אפשרי למחקר Prediction:

```text
Top1 median executable/net forward outcome @ relevant short horizon
```

‏ה־Primary המדויק נבחר לפי שאלת הניסוי, אך אינו משתנה אחרי שראינו איזה Metric נראה טוב.

### ‏`P0 — Required`: Guardrails

‏Experiment אינו `KEEP` אם הוא משפר Metric אחד ובמקביל פוגע מהותית במדד קריטי אחר.

‏Guardrails אפשריים:

```text
tail outcome / P95-MAE
fill rate
slippage
signal-to-fill latency
candidate churn
trade / opportunity frequency
no-trade frequency
compute latency
data freshness
missing / invalid rate
```

‏ה־Guardrails עצמם חייבים להיות מוגדרים לפני ההחלטה.

### ‏`P0 — Required`: Config Diff לפני Run

‏לפני Experiment מציגים diff בין Control ל־Treatment.

‏המטרה:

```text
planned_changes == actual_changes
```

‏אם השתנו dependency, default, preprocessing, costs, dataset או execution semantics שלא תוכננו — עוצרים ומסווגים את הניסוי מחדש.

### ‏`P0 — Required`: Freeze של סביבת הניסוי

‏לפני Run משמעותי נועלים לפחות:

```text
experiment_id
code_commit
config_hash
dataset_version
universe_version
feature_version
filter_version
score_version
cost_model_version
execution_model_version
runtime/environment when material
random_seed when applicable
```

‏כך ניתן לשחזר את Control ואת Treatment בדיוק.

---

## ‏3. Experiment Contract מומלץ

‏כל ניסוי יקבל Spec קצר וברור:

```text
experiment_id
parent_experiment_id
question
hypothesis
control_version
treatment_version
planned_config_diff
dataset_version
train_period
validation_period
locked_test_period_if_any
primary_metric
secondary_metrics
guardrails
relevant_horizons
execution_model
cost_model
minimum_useful_effect
acceptance_rule
rejection_rule
known_risks
```

‏בסיום נשמר Decision Record:

```text
experiment_id
result
why
primary_metric_delta
guardrail_deltas
decision_impact_rate
important_segments
robustness_summary
known_limitations
next_action
```

---

## ‏4. Experiment Registry הוא חלק ממנגנון ה־Safety המחקרי

‏כל Experiment נרשם — גם אם נכשל.

‏המטרות:

- ‏לדעת כמה Hypotheses באמת נבדקו.
- ‏לשמור `multiple-testing` context.
- ‏לא לחזור שוב על כיוון שנפסל בלי Evidence חדש.
- ‏לזהות Winner's Curse.
- ‏לשמור Lineage בין Champion ל־Challengers.
- ‏ליצור `Negative Result Library`.

‏ניסוי שלא הצליח הוא ידע, לא קובץ למחיקה.

---

## ‏5. הדרך הנכונה למדוד Improvement

### ‏`P1 — Preferred`: Delta מעל Control

‏המספר החשוב הוא:

```text
Treatment metric - Control metric
```

‏ולא רק:

```text
Treatment metric
```

‏לכן כל Report יציג Side-by-Side:

```text
Metric                 Control   Treatment   Delta
Top1 outcome              ...        ...       ...
Top1 premium              ...        ...       ...
Rank monotonicity         ...        ...       ...
P95 MAE                   ...        ...       ...
Fill rate                 ...        ...       ...
Slippage                  ...        ...       ...
Decision latency          ...        ...       ...
Opportunity frequency     ...        ...       ...
```

### ‏`P1 — Preferred`: Paired Comparison

‏כאשר אפשר, Control ו־Treatment רצים על אותם:

```text
timestamps
candidate episodes
market states
universe snapshots
labels
execution assumptions
```

‏כך ה־Delta פחות רועש מאשר השוואת שתי תקופות שונות.

### ‏`P1 — Preferred`: Changed-Decision Analysis

‏לרובוט שלנו זה ניתוח מרכזי.

‏שומרים:

```text
control_top1
treatment_top1
control_score_decomposition
treatment_score_decomposition
future_outcome_control_candidate
future_outcome_treatment_candidate
```

‏ומחלקים את כל ההחלטות ל־:

```text
SAME_DECISION
CHANGED_WINNER
ADDED_OPPORTUNITY
REMOVED_OPPORTUNITY
TRADE_TO_NO_TRADE
NO_TRADE_TO_TRADE
```

### ‏`P1 — Preferred`: Decision Impact Rate

```text
decision_impact_rate =
  changed_decision_timestamps / total_decision_timestamps
```

‏Feature שמשנה רק `0.1%` מההחלטות דורש שיפור גדול או ערך חשוב אחר כדי להצדיק מורכבות.

### ‏`P1 — Preferred`: Incremental EV per Changed Decision

‏כאשר Treatment באמת משנה החלטה, בודקים:

```text
outcome_treatment_choice - outcome_control_choice
```

‏זה לעיתים מדד אבחוני חשוב יותר מ־aggregate PnL.

---

## ‏6. Prediction קודם, End-to-End אחר כך

‏Baseline ה־Evidence הוא שכבות:

```text
Feature evidence
→ Ranking evidence
→ Selection evidence
→ Execution evidence
→ Net economic evidence
```

‏לא מתחילים ישר מ־Full System PnL.

‏אם Prediction לא השתפר — אין סיבה לייחס שיפור PnL מקרי ל־Feature.

‏אם Prediction השתפר אבל Net לא — חוקרים Execution/Costs לפני שינוי נוסף של ה־Score.

---

## ‏7. Scorecard קבוע לכל Experiment

### ‏Prediction

```text
Top1 forward outcome by horizon
Top1 premium
Rank monotonicity
Lift vs baseline
Hit rate / target-before-stop
MFE / MAE
time_to_first_profit
time_to_target
selection regret
```

### ‏Execution

```text
fill rate
partial-fill rate
slippage
signal_to_fill
missed opportunity
candidate churn
cancel / replace pressure
```

### ‏Economics

```text
Gross edge
Executable edge
Net edge
Cost-to-edge
Opportunity frequency
Tail outcome
```

### ‏Robustness

```text
OOS delta
Walk-forward delta
Parameter sensitivity
Regime stability
Leave-one-group-out
Stress execution
```

### ‏Operations

```text
feature_compute_latency
ranking_latency
decision_latency
CPU / memory impact
data dependency count
missing / invalid rate
monitoring burden
```

---

## ‏8. Horizon Profile הוא חובה

‏לכל Experiment רלוונטי נבדוק לפחות:

```text
1s
2s
5s
10s
30s
60s
```

‏המטרה היא לראות:

```text
where lift appears
when it peaks
when it decays
whether it remains before realistic fill
```

‏שיפור שמופיע רק אחרי 60 שניות אינו בהכרח שיפור לרובוט שמחפש continuation כמעט מיידי.

---

## ‏9. Ablation

### ‏`P1 — Preferred`: Feature Ablation

‏למודל מלא בודקים:

```text
full
minus feature_x
```

‏אם ההסרה אינה פוגעת ב־OOS outcomes, ה־Feature אינו מוכיח incremental value.

### ‏`P1 — Preferred`: Family-level Ablation

‏משפחות אפשריות:

```text
Momentum
Activity
Liquidity / Execution
Timing / Freshness
Market Context
Data Quality
```

‏Family-level Ablation עוזר להבין איזה סוג מידע באמת מוסיף ערך.

### ‏`P2 — Challenger`: Permutation-like diagnostic

‏אפשר לשבור בזהירות את הקשר של Feature ולבדוק אם Pipeline עדיין “מוצא Edge”.

‏זה Diagnostic בלבד ודורש שמירה על time-series semantics; shuffle נאיבי יכול לייצר בדיקה חסרת משמעות.

---

## ‏10. Rank Movement ו־Rank Flip

‏לכל Candidate אפשר לשמור:

```text
rank_control
rank_treatment
rank_delta
```

‏אבל `rank_delta` אינו הצלחה בפני עצמו.

‏השאלה היא:

```text
rank movement
→ did future selection quality improve?
```

‏במיוחד נשמור `Rank Flip`:

```text
Control Top1   = AAA
Treatment Top1 = BBB
```

‏ואז נבחן את future outcomes של שתיהן באותו Episode.

---

## ‏11. Score Architecture עצמה היא Hypothesis

‏לא רק Weight values דורשים Evidence.

‏אפשר להשוות:

```text
weighted sum
rank aggregation
gated score
separate prediction score + execution gate
nonlinear combination
```

‏ה־Baseline נשאר מהחלטות 14–15:

```text
Hard eligibility / execution gates
→ Prediction / Opportunity Ranking
→ Absolute Trade Gate
```

‏כל הצעה להחזיר Execution Quality לתוך Score compensating יחיד צריכה להוכיח שהיא טובה יותר ולא מאפשרת Signal חזק לפצות על מצב execution לא קביל.

---

## ‏12. Weight Tuning

### ‏`P1 — Baseline`: Coarse Before Fine

‏במקום לחפש מיד:

```text
0.4137
```

‏נבדוק קודם אזורים:

```text
low
medium
high
```

‏או grid גס.

### ‏`P1 — Preferred`: Robust Plateau

‏מעדיפים:

```text
0.35 good
0.40 good
0.45 good
```

‏על פני:

```text
0.4137 amazing
0.41 weak
0.42 bad
```

### ‏`P0`: Best Point אינו Promotion Evidence

‏ה־Winner של Search רחב נושא `Winner's Curse`.

‏כל ערך שנבחר ב־Train/Validation חייב להוכיח את עצמו על OOS שלא שימש לבחירתו.

---

## ‏13. Threshold Experiments

‏לכל Threshold חשוב נבנה Curve, לא נקודה יחידה:

```text
threshold
→ candidate count
→ trade/no-trade frequency
→ predictive quality
→ executable/net quality
→ tail risk
```

‏נחפש `Robust Region`.

‏`Threshold Cliff` חד הוא נורת אזהרה ל־Noise/Overfit.

---

## ‏14. Filter Experiments

‏Filter נבדק באמצעות:

```text
accepted set
rejected set
added set
removed set
```

‏נשאל:

- ‏כמה Losers הוא מנע?
- ‏כמה Winners הוא חסם?
- ‏האם Precision עלתה?
- ‏מה קרה ל־Recall?
- ‏האם Opportunity Frequency קרסה?
- ‏האם הוא מוסיף אמת בטיחותית או רק data-mined threshold?

‏Hard Filter חדש עובר גם את כל כללי מקטע 12: Boundary אמיתי לפני Promotion ל־Hard.

---

## ‏15. Interaction Experiments

‏Interaction היא Hypothesis עצמאית.

‏לדוגמה:

```text
momentum × activity
```

‏אפשר לבדוק קבוצות:

```text
low / low
low / high
high / low
high / high
```

‏או `2×2` factorial קטן כאשר זה מוצדק.

‏לא פותחים Full Factorial גדול רק כי המחשב מסוגל.

‏מספר האינטראקציות גדל מהר ומגדיל מאוד את multiple-testing risk.

---

## ‏16. Discovery Funnel מומלץ

```text
IDEA
→ CHEAP SCREENING
→ CONTROLLED EXPERIMENT
→ ROBUSTNESS
→ OOS / WALK-FORWARD
→ SHADOW
→ PRODUCTION CANDIDATE
```

‏`Cheap Screening` מיועד להרוג רעיונות חלשים בזול — לא לאשר Production.

‏ככל שרעיון מתקדם, רמת Fidelity והעלות של הבדיקה עולות.

---

## ‏17. Minimum Useful Effect

‏לפני Experiment משמעותי כדאי להגדיר:

> ‏מהו שיפור קטן מדי מכדי להצדיק את המחיר שהוא מוסיף?

‏השיקולים:

```text
predictive lift
execution lift / regression
compute latency
data cost
licensing dependency
monitoring burden
debugging burden
failure modes
```

‏שינוי עם lift זעיר ו־complexity tax גדול יכול לקבל `REJECT` גם אם Metric השתפר מעט.

---

## ‏18. Complexity Budget

‏לכל Feature/Rule חדש נשאל:

```text
What does it know that the current system does not?
```

‏ולאחר מכן:

```text
Is the incremental value large enough to pay for:
data + CPU + memory + latency + testing + monitoring + RCA complexity?
```

‏כאשר שתי גרסאות כמעט שקולות, Baseline הוא להעדיף את הפשוטה יותר.

---

## ‏19. Performance הוא Metric מחקרי

‏במסחר קצר Feature חזק שמוסיף latency יכול למחוק את ה־Edge שהוא מוסיף.

‏לכן Experiment חשוב מודד:

```text
feature_compute_latency
ranking_latency
decision_latency
feature_age_at_decision
score_age_at_decision
```

‏נרצה Attribution:

```text
predictive_gain_bps
vs
edge_lost_to_added_latency_bps
```

‏הנוסחה המדויקת יכולה להיות model-dependent, אך אסור להתעלם מה־trade-off.

---

## ‏20. Data Dependency Gate

‏Feature שדורש מקור נתונים חדש אינו “רק Feature”.

‏הוא מוסיף:

```text
coverage dependency
entitlement / licensing dependency
latency dependency
provider reliability dependency
historical availability requirement
live/backtest parity risk
```

‏Promotion דורש שה־incremental value יצדיק גם את התלות הזו.

---

## ‏21. Same Code Path / Training-Serving Parity

‏ככל האפשר:

```text
Research
Replay
Shadow
Live
```

‏משתמשים באותו Feature/Filter/Score semantics.

‏אם Treatment נבדק על Feature מושלם היסטורית שאינו זמין באותה צורה Live — הניסוי אינו Production Evidence.

---

## ‏22. Robustness

### ‏Time Segmentation

‏נציג תוצאה לפי periods רלוונטיים, למשל:

```text
open
morning
midday
afternoon
close
```

### ‏Regime Segmentation

‏רק Segments שהוגדרו מראש או שמסומנים Discovery:

```text
high / low volatility
high / low activity
broad market up / down / flat
```

### ‏Leave-One-Group-Out

‏נבדוק:

```text
leave-one-day-out
leave-one-symbol-group-out
leave-one-regime-out
```

### ‏Edge Concentration

‏נמדוד כמה מה־Delta מגיע מ־:

```text
top day
top week
top symbol
top episode
```

‏Treatment שהשיפור שלו נעלם כשמסירים אירוע בודד הוא Fragile.

---

## ‏23. Uncertainty ו־Effect Size

‏לא מספיק:

```text
p-value / significance
```

‏השאלה היא גם:

```text
How large is the effect?
How uncertain is it?
Is it economically useful?
```

‏אפשר להשתמש ב־confidence intervals וב־block/day bootstrap כאשר המתודולוגיה מתאימה לתלות בזמן.

‏אין להתייחס ל־rows חופפים כ־independent samples.

---

## ‏24. Independent Opportunities

‏Sample Size למחקר הזה ייחשב גם ברמת:

```text
candidate episodes
distinct days
distinct market events
distinct regimes
```

‏ולא רק:

```text
database rows
```

‏Scanner שמחשב כל `100ms` אינו מקבל אוטומטית פי 10 Evidence לעומת Scanner שמחשב כל שנייה.

---

## ‏25. Null Tests

‏`P2 — Challenger`:

‏נשתמש בבדיקות שמוודאות שה־Pipeline אינו מסוגל “למצוא Edge” כאשר הקשר בין Feature ל־Outcome נשבר באופן מבוקר.

‏אם Null test ממשיך לייצר lift חזק, מבצעים RCA ל־Validation/Leakage/Pipeline לפני שמאמינים ל־Experiment רגיל.

---

## ‏26. Baselines שחייבים להישאר

‏גם לאחר שיפור Score, נשמור תמיד:

```text
Random eligible baseline
Naive momentum baseline
Current Champion
```

‏מודל מורכב שלא מנצח Baseline פשוט ב־OOS אינו מצדיק את המורכבות שלו.

---

## ‏27. Champion / Challenger

‏`Champion` אינו “ה־commit האחרון”.

‏הוא הגרסה האחרונה שעברה את ה־Promotion Gates.

‏`Challenger` יכול להיות חדש יותר ועדיין להישאר Research/Shadow בלבד.

‏Promotion:

```text
Challenger
→ historical controlled evidence
→ OOS / walk-forward
→ stress
→ shadow when warranted
→ promotion decision
```

‏Rollback path מוגדר לפני Promotion.

---

## ‏28. Shadow Comparison

‏Shadow Challenger רואה אותו Market Stream ומייצר Decisions ללא השפעה על החשבון.

‏נשווה:

```text
champion decision
challenger decision
rank diff
score diff
prediction outcome
execution opportunity
latency
missing data
```

‏זה עדיף על שני אלגוריתמים ששולחים Orders אמיתיות באותו חשבון ועלולים לזהם זה את זה.

---

## ‏29. Four-state Decision

‏כל Experiment מסתיים באחד מארבעה States:

```text
KEEP
REJECT
REWORK
NEEDS_MORE_DATA
```

### ‏`KEEP`

‏רק כאשר:

- ‏יש incremental lift אמיתי.
- ‏השיפור שורד OOS/Walk-Forward.
- ‏Guardrails אינם מדרדרים מהותית.
- ‏Net/Executable evidence נשאר חיובי כאשר רלוונטי.
- ‏ה־complexity tax מוצדק.
- ‏אין Data/Leakage/Implementation ambiguity פתוחה.

### ‏`REJECT`

‏כאשר:

- ‏אין incremental value.
- ‏ה־lift נעלם OOS.
- ‏השיפור תלוי בנקודת פרמטר חדה.
- ‏Costs/Execution מוחקים אותו.
- ‏הוא מגדיל Tail/Latency/Operational Risk מעבר לערך.

### ‏`REWORK`

‏כאשר ה־Hypothesis עדיין plausible אבל implementation/data/normalization/window אינם מספיק אמינים.

‏`REWORK` יוצר Experiment חדש; הוא אינו אישור שקט להמשיך tuning על אותו Result.

### ‏`NEEDS_MORE_DATA`

‏כאשר מספר ה־independent opportunities קטן מדי או uncertainty רחבה מדי.

‏חוסר ודאות אינו `KEEP`.

---

## ‏30. Failure Taxonomy

‏כל Experiment שנכשל יקבל Reason Code, למשל:

```text
NO_PREDICTIVE_LIFT
OVERFIT
EXECUTION_REGRESSION
DATA_QUALITY_FAILURE
LATENCY_REGRESSION
COST_REGRESSION
TAIL_REGRESSION
INSUFFICIENT_SAMPLE
IMPLEMENTATION_BUG
UNEXPECTED_CONFIG_DIFF
```

‏כך כישלון Infrastructure אינו מתועד בטעות כ־Strategy Failure.

---

## ‏31. RCA לפני Retuning

‏כאשר תוצאה מפתיעה:

```text
expected strong positive
→ observed negative
```

‏ה־Baseline הוא:

```text
Sanity checks
→ data integrity
→ time alignment
→ config diff
→ feature correctness
→ label correctness
→ execution/cost correctness
→ only then hypothesis reassessment
```

‏לא משנים Weight אקראי ומריצים שוב.

---

## ‏32. Sanity Checks לפני Run גדול

‏לפחות:

```text
candidate counts plausible
feature ranges plausible
missing / invalid rates plausible
no NaN explosion
rank ordering deterministic
timestamps monotonic under policy
costs enabled
execution model expected version
control reproduces golden baseline
```

‏אם Control אינו משחזר את Baseline, אין טעם לפרש Treatment delta.

---

## ‏33. Golden Baseline

‏נשמור Run קנוני קטן או Dataset קטן שבו Champion ידוע.

‏שינויים שאינם אמורים לשנות semantics צריכים להשאיר אותו זהה.

‏Regression בלתי־מוסבר חוסם Experiment.

---

## ‏34. Experiment Unit Tests

‏לפני Run משמעותי נבדוק אוטומטית:

```text
Control == frozen champion
Treatment diff == planned diff
Dataset == same dataset
Universe == same universe
Labels == same labels
Costs == same cost model unless cost is treatment
Execution == same execution model unless execution is treatment
No future feature access
```

---

## ‏35. Research Tree / Parent Experiment

‏נשמור:

```text
parent_experiment_id
```

‏כך כל Challenger מצביע לגרסה שממנה נולד.

‏הדבר מאפשר לראות:

- ‏איזה רעיון הוליד איזה שינוי.
- ‏איפה המחקר הסתעף.
- ‏כמה ניסיונות היו בכל ענף.
- ‏אילו כיוונים נכשלו.

---

## ‏36. Feature Rationale ו־Retirement

‏לכל Feature פעיל נשמור:

```text
purpose
definition
introduced_in_version
supporting_experiments
known_limitations
compute/data cost
retirement_condition
```

‏Feature שאינו מוסיף value אחרי revalidation נכנס ל־retirement review.

---

## ‏37. Research Freshness

‏Evidence אינו רישיון נצחי.

‏נעקוב אחרי:

```text
feature lift
rank monotonicity
Top1 premium
cost drift
execution drift
data drift
```

‏אם Evidence מתיישן או Drift מהותי, מבצעים Revalidation — לא auto-retune Production.

---

## ‏38. Freeze Window אחרי Promotion

‏לאחר Promotion רצוי לשמור גרסה יציבה לזמן/מספר Opportunities מוגדר כדי שניתן יהיה למדוד אותה.

‏אין טעם לשנות Score בכל יום ואז לטעון שאין מספיק Live evidence.

---

## ‏39. Post-Promotion Review

‏נשווה:

```text
expected_historical_lift
expected_shadow_lift
observed_forward_lift
```

‏אם השיפור לא מופיע, מפרקים:

```text
prediction gap
data gap
latency gap
fill gap
cost gap
regime gap
```

‏לפני שמחליטים שה־Hypothesis הייתה שגויה.

---

## ‏40. Pareto Thinking

‏לעיתים אין Winner יחיד בכל Metric.

‏לדוגמה:

```text
A: higher net EV, lower opportunity frequency
B: slightly lower EV, better fill rate and lower tail
```

‏נציג Trade-offs במפורש.

‏גרסה שנשלטת על ידי אחרת כמעט בכל ממד חשוב אינה מועמדת טובה ל־Promotion.

---

## ‏41. Selectivity Experiments

‏לשינויים ב־`TRADE / NO TRADE` Gate נבנה:

```text
threshold
→ eligible frequency
→ trade frequency
→ net EV
→ tail outcome
→ missed-winner rate
```

‏המטרה אינה למקסם מספר עסקאות ולא למקסם Win Rate.

‏המטרה היא למצוא Region שבו quality/frequency/cost/risk נשארים סבירים יחד.

---

## ‏42. Time-to-Benefit

‏כל Improvement מקבל:

```text
benefit_1s
benefit_2s
benefit_5s
benefit_10s
benefit_30s
benefit_60s
```

‏Feature שמוסיף Edge רק אחרי שה־Signal שלנו אמור כבר לדעוך אינו `KEEP` אוטומטי לרובוט הנוכחי.

---

## ‏43. User-Specific Application

‏למערכת שלנו, שמטרתה לבחור Candidate מוביל מתוך שוק רחב ולהחזיק זמן קצר מאוד, שלושת ניתוחי הליבה לכל Experiment הם:

```text
1. Did Top1 actually improve vs Top2..TopN?
2. When Treatment changed the winner, was the new winner better soon enough?
3. Did the lift survive execution latency, spread, slippage and cost?
```

‏לכן נעדיף Experiment שמראה:

- ‏Top1 premium טוב יותר.
- ‏Rank monotonicity נשמרת/משתפרת.
- ‏Changed-winner delta חיובי.
- ‏Time-to-benefit מהיר.
- ‏Edge-at-fill לא נשחק לחלוטין.
- ‏No material latency/tail/complexity regression.

---

## ‏44. Concrete Baseline Contract

‏Baseline ראשון ל־Research Loop:

```text
1. Freeze current Champion
2. Open EXP-ID
3. Write one falsifiable hypothesis
4. Define one planned config diff
5. Predefine primary metric + guardrails
6. Run Control and Treatment on identical historical opportunities
7. Compare predictive deltas
8. Inspect changed Top1 decisions
9. Compare execution / latency / costs
10. Run OOS / walk-forward
11. Run sensitivity / ablation / concentration checks
12. Decide KEEP / REJECT / REWORK / NEEDS_MORE_DATA
13. If KEEP, run Shadow before production promotion when warranted
14. Record result, including negative evidence
```

---

## ‏45. Promotion Criteria

‏Challenger יכול להתקדם רק אם כל הרלוונטי מתקיים:

- ‏Experiment Spec נכתב לפני results.
- ‏Control משחזר Champion.
- ‏Config diff תואם בדיוק לתכנון.
- ‏אין Leakage או Data ambiguity פתוחה.
- ‏Primary Metric משתפר מעבר ל־Minimum Useful Effect שהוגדר.
- ‏Guardrails אינם מדרדרים מהותית.
- ‏השיפור קיים גם ב־Median/Distribution ולא רק Outliers.
- ‏Changed decisions מראים incremental value.
- ‏השיפור שורד OOS / Walk-Forward.
- ‏אין תלות מהותית ביום/סמל/episode יחיד.
- ‏Parameter/threshold neighborhood אינו שביר.
- ‏Execution/Costs אינם מוחקים את השיפור כאשר רלוונטי.
- ‏Added latency/data/complexity מוצדקים.
- ‏יש reproducibility מלאה.
- ‏Shadow evidence תואם כאשר נדרש.

---

## ‏46. Rejection Criteria

‏נפסול או נחזיר למחקר אם אחד מהבאים מהותי:

- ‏No incremental lift מעל Champion/Baseline.
- ‏השיפור קיים רק In-Sample.
- ‏Control/Treatment אינם ניתנים להשוואה הוגנת.
- ‏Unexpected config/data diff.
- ‏Result תלוי Magic Number.
- ‏Feature משנה Rank אך לא Outcomes.
- ‏Decision impact זניח ביחס ל־complexity tax.
- ‏Tail/latency/execution regression גדול מהתועלת.
- ‏Net Edge נעלם אחרי friction.
- ‏השיפור מרוכז כמעט כולו באירוע/יום/סמל בודד.
- ‏Dataset/Feature אינו זמין בצורה שקולה Live.
- ‏Sample עצמאי קטן מדי — במקרה זה `NEEDS_MORE_DATA`, לא `KEEP`.

---

## ‏47. Metrics מרכזיים

### ‏Research Integrity

```text
experiment_count
failed_experiment_count
config_diff_count
unexpected_diff_count
reproducibility_pass_rate
```

### ‏Decision Impact

```text
decision_impact_rate
changed_winner_count
added_candidate_count
removed_candidate_count
trade_to_no_trade_count
no_trade_to_trade_count
```

### ‏Incremental Prediction

```text
ΔTop1 forward outcome by horizon
ΔTop1 premium
ΔRank monotonicity
ΔLift
ΔMFE
ΔMAE
Δtime_to_first_profit
Δtime_to_target
```

### ‏Execution / Operations

```text
Δfill_rate
Δslippage
Δsignal_to_fill
Δcandidate_churn
Δfeature_latency
Δranking_latency
Δdecision_latency
Δmissing_rate
```

### ‏Economics

```text
ΔGrossEdge
ΔExecutableEdge
ΔNetEdge
ΔCostToEdge
ΔOpportunityFrequency
ΔTailOutcome
```

### ‏Robustness

```text
OOS_delta
walk_forward_positive_fold_ratio
parameter_plateau_width
leave_one_group_out_delta
edge_concentration
```

---

## ‏48. Failure Modes

- ‏`latest is best` — Promotion לפי commit חדש במקום Evidence.
- ‏שינוי כמה דברים בבת אחת בלי package מוגדר.
- ‏Metric Shopping אחרי Results.
- ‏בחירת Best Weight בלי OOS.
- ‏מיליוני combinations לפני Hypothesis.
- ‏שימוש ב־PnL מלא כדי להסיק על Feature Prediction.
- ‏התעלמות מ־changed-decision set.
- ‏Feature שמוסיף 50ms ומודד רק prediction gain.
- ‏Filter שמשפר Precision ומסתיר Recall collapse.
- ‏התאהבות ב־Feature שנכשל.
- ‏מחיקת failed experiments.
- ‏post-hoc slice שהופך בטעות ל־proof.
- ‏Champion משתנה במהלך Experiment.
- ‏Treatment משתמש Dataset/Costs שונים.
- ‏Production auto-tuning לפי results אחרונים.

---

## ‏49. What I Would Avoid Initially

‏בגרסה הראשונה לא נשתמש ב־:

```text
AutoML search over huge spaces
thousands of hyperparameters
continuous online weight optimization
auto-promotion to production
reinforcement-learning policy search
large factorial experiments
complex nonlinear models before simple baseline is beaten
```

‏קודם נבנה Process שמייצר ידע אמין.

---

## ‏50. What to Add Later

### ‏`P2`

- ‏Small factorial experiments כאשר Interaction מוצדקת.
- ‏Block/day bootstrap ל־uncertainty.
- ‏Null tests מתקדמים.
- ‏Pareto dashboard.
- ‏Experiment lineage graph.
- ‏Automated Decision Diff reports.

### ‏`P3`

- ‏Bayesian / sequential experiment methods כאשר יש הצדקה.
- ‏More formal multiple-testing control.
- ‏Adaptive research-budget allocation.
- ‏Regime-conditioned challengers לאחר מקטע 25.
- ‏Model ensembles רק לאחר שה־single models מובנים.

### ‏`P4`

- ‏AutoML/large model search.
- ‏Online learning.
- ‏Automatic production retuning.

‏כל אלה דורשים Governance חזק יותר, לא פחות.

---

## ‏51. Fact / Judgment / Hypothesis

### ‏Fact / Methodological principle

- ‏שינוי Control ו־Treatment בכמה dimensions יחד מקשה על causal attribution.
- ‏Repeated parameter search מגדיל Winner's Curse / multiple-testing risk.
- ‏OOS/Walk-Forward נדרשים כדי לבדוק generalization.
- ‏Overlapping rows אינם בהכרח independent samples.
- ‏Added latency יכול לפגוע ב־short-horizon execution.

### ‏Judgment שלנו

- ‏Baseline המחקר יהיה one-change-at-a-time ככל האפשר.
- ‏Changed-winner analysis יהיה מדד ליבה לרובוט שלנו.
- ‏Robust Plateau עדיף על Best Point.
- ‏Complexity Tax הוא שיקול Promotion מפורש.
- ‏Champion אינו מתחלף עד Evidence מדורג.

### ‏Hypothesis שעדיין לא הוכחה

- ‏Feature מסוים יוסיף Edge.
- ‏Activity acceleration תוסיף continuation predictive value.
- ‏Score architecture מסוימת עדיפה.
- ‏Threshold/Weight מסוים עדיף.
- ‏שיפור predictive מסוים יצדיק latency/data cost נוסף.

---

## ‏52. Confidence

| טענה | Confidence |
|---|---|
| ‏Control/Treatment קבועים משפרים attribution | `HIGH` |
| ‏Predefined metric/guardrails מצמצמים post-hoc bias | `HIGH` |
| ‏OOS/Walk-Forward חיוניים לפני Promotion | `HIGH` |
| ‏Robust plateau עדיף על sharp optimum כ־default | `HIGH` |
| ‏Changed-winner analysis חשוב במיוחד ל־Top1 scanner | `HIGH` |
| ‏Complexity/latency tax צריך להיות חלק מההחלטה | `HIGH` |
| ‏Feature/Weight מסוים יוסיף Net Edge | `LOW / UNPROVEN` |
| ‏Interaction מסוימת אמיתית | `LOW / UNPROVEN` |
| ‏מודל מורכב ינצח Baseline פשוט | `LOW / UNPROVEN` |

---

## ‏53. Time-Sensitive Facts

‏המקטע מתודולוגי ברובו ואינו תלוי ב־Broker/API/Regulation משתנים.

‏עם זאת, Experiment שמוסיף Data Provider, Feed, entitlement, API field, routing capability, cost schedule או broker-specific execution semantics חייב לבצע current verification לפני שהוא נחשב Production Evidence.

‏אין להפוך תוצאה מחקרית שנבנתה על capability ישנה או coverage שונה להחלטת Production אוטומטית.

---

## ‏54. Relationship to Later Sheets

‏מקטע 25 ישתמש באותו Experimental Discipline כדי לבדוק `Market Regimes` בלי להפוך segmentation ל־data mining.

‏מקטעים מאוחרים יותר ישתמשו בתהליך הזה עבור:

```text
execution tactics
routing
order-flow features
L2 / depth
exit logic
risk controls
performance engineering
production safety
```

‏המסמך הזה הוא ה־Research Loop הקנוני שאליו הם חוזרים.

---

## ‏55. Recommendation Summary

```text
Baseline:
Frozen Champion
→ one falsifiable hypothesis
→ one planned treatment diff
→ predefined primary metric + guardrails
→ same-data paired Control/Treatment
→ prediction delta
→ changed-decision analysis
→ execution/net delta
→ OOS / walk-forward
→ robustness + complexity review
→ KEEP / REJECT / REWORK / NEEDS_MORE_DATA
```

‏ברירת המחדל שלנו היא **לא** “לשחק עם המשקלים עד שמקבלים Backtest יפה”.

‏שיפור אמיתי חייב להראות incremental value מעל Champion, בזמן שמתאים ל־Strategy, על נתונים שלא שימשו לבחירתו, לאחר friction, בלי Tail/Latency/Operational regression שמוחק את הערך.

‏אם השיפור קטן מדי כדי להצדיק את המורכבות — לא מקדמים אותו.

‏אם אין מספיק Evidence — לא הופכים uncertainty לאישור.

‏אם Experiment נכשל — שומרים את הידע וממשיכים מה־RCA, לא מנסים להציל את הרעיון בכל מחיר.
