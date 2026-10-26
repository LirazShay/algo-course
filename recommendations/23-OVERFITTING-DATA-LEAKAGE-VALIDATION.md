# ‏23 — Recommendation Sheet: Overfitting / Data Leakage / Validation

> ‏מקור לימודי עיקרי: `../23-OVERFITTING-DATA-LEAKAGE-AND-VALIDATION.md`.
>
> ‏מטרת הקובץ: לקבוע תהליך מחקר שבו קשה ככל האפשר לייצר Edge מזויף באמצעות `look-ahead`, ‏`survivorship bias`, ‏`test contamination`, ‏`parameter hunting`, ‏`metric shopping`, ‏`multiple testing`, ‏`execution overfitting` או התאמה אנושית חוזרת לאותם נתונים.
>
> ‏המסמך ממשיך את 20–22: ‏20 קבע Timeline Integrity, ‏21 קבע Execution Realism, ‏22 קבע כיצד למדוד Predictive Quality. ‏23 קובע **מתי בכלל מותר לנו להאמין לתוצאה**.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
Did we find a profitable backtest?
```

‏אלא:

```text
Would the same research process still produce credible evidence
if we had not already seen the future data?
```

‏לכן כל Strategy/Scanner Version חייב לעבור מסלול Evidence שבו:

```text
Discovery
→ Validation
→ Locked Test
→ Walk-Forward
→ Shadow Forward Test
→ only then further promotion
```

‏כל שלב חייב לשמור Separation ברור בין מידע ששימש לפיתוח לבין מידע ששימש לאימות.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Past-only contract לכל Feature, Join ו־Snapshot

‏בכל `decision_time = T`:

```text
feature_source_time <= T
joined_time <= T
universe_fact_time <= T
normalization_fit_time <= T
```

‏אין:

```text
future nearest-neighbor
backfill from future
centered feature window
full-day statistic used intraday
future-aware cleaning
```

‏Historical API צריך להיות `past-only` כברירת מחדל.

### ‏`P0 — Required`: `as_of_time` הוא Contract, לא Convention

‏כל Feature Snapshot, Universe Snapshot ו־Decision Snapshot חייבים לקבל `as_of_time` מפורש.

‏פונקציה כמו:

```text
GetNearestSnapshot(t)
```

‏אינה Baseline בטוח.

‏ברירת המחדל צריכה להיות בסגנון:

```text
GetLatestKnownAtOrBefore(t, max_age)
```

‏כאשר `max_age` מונע שימוש בנתון ישן מדי.

### ‏`P0 — Required`: Fail on future join

‏אם Historical Join מחזיר:

```text
joined_time > target_time
```

‏ה־Run נכשל.

‏אין תיקון שקט ואין fallback נוח.

### ‏`P0 — Required`: `Train → Validation → Test` לפי זמן

‏ב־Time Series אין Baseline של Random Split בין עבר לעתיד.

‏ברירת המחדל:

```text
Train      = earlier period
Validation = later period
Test       = latest untouched period
```

‏כאשר:

- ‏`Train` משמש Discovery, Feature/Rule creation ו־parameter tuning.
- ‏`Validation` משמש בחירה בין גרסאות שנוצרו ב־Train.
- ‏`Test` משמש הערכה כמעט חד־פעמית לאחר Research Lock.

### ‏`P0 — Required`: Test Set אינו Sandbox

‏ברגע שתוצאת `Test` משפיעה על:

```text
feature choice
threshold
weight
filter
horizon
cost assumption
entry/exit rule
```

‏ה־Test מזוהם.

‏מכאן ואילך יש להתייחס אליו כ־Validation Data, לא כ־Final Holdout.

### ‏`P0 — Required`: Human-in-the-loop contamination נחשב Leakage של תהליך המחקר

‏אין צורך שקוד יקרא את Test כדי לזהם אותו.

‏גם רצף כזה מזהם:

```text
look at Test result
→ invent a change
→ rerun same Test
```

‏לכן Experiment Registry חייב לשמור גם את היסטוריית ההחלטות האנושיות.

### ‏`P0 — Required`: Final/Fresh Holdout

‏לפני Promotion משמעותי נשמור חלון זמן שלא שימש לבחירת המודל.

‏אם הוא נפתח לצורך Tuning:

```text
holdout_status = contaminated
```

‏ונדרש Holdout חדש.

### ‏`P1 — Baseline`: Walk-Forward לאחר Holdout בסיסי

‏לאחר Validation/Test בסיסיים, נעדיף גם Walk-Forward כרונולוגי:

```text
train on past
validate/test on next period
roll forward
repeat
```

‏נבחן לפחות שתי אפשרויות מחקריות:

```text
expanding window
rolling window
```

‏הבחירה ביניהן אינה Truth; היא Hypothesis שצריכה להיבדק.

### ‏`P0 — Required`: Discovery ו־Confirmation נפרדים

‏ב־Discovery מותר:

```text
explore
visualize
try features
form hypotheses
```

‏אבל כל Pattern שנולד שם מקבל סטטוס:

```text
DISCOVERED_NOT_CONFIRMED
```

‏רק Data אחר יכול להפוך אותו ל־Evidence של Confirmation.

### ‏`P0 — Required`: Research Lock לפני Confirmation/Test

‏לפני Locked Test מקפיאים לפחות:

```text
strategy_hypothesis_version
feature_set
filter_set
score_formula
weights
thresholds
entry_policy
exit_policy
cost_assumptions
execution_assumptions
primary_metric
acceptance_criteria
```

‏שינוי לאחר Lock יוצר Version חדש שצריך Validation מחדש.

### ‏`P0 — Required`: Experiment Registry מלא

‏כל Experiment, כולל כישלון, נשמר:

```text
experiment_id
hypothesis
research_phase
parent_version
code_commit
data_version
universe_version
feature_version
filter_version
score_version
execution_model_version
cost_model_version
train_period
validation_period
test_period
parameters_varied
primary_metric
secondary_metrics
acceptance_criteria
result
conclusion
promotion_decision
rejection_reason
```

‏אסור למחוק Failed Experiments כי הם חלק מ־Multiple Testing context.

### ‏`P0 — Required`: Predefine Primary Metric

‏לפני הרצת Experiment מגדירים Metric ראשי אחד או מעט מאוד.

‏למשל:

```text
Top1 NetMFE_10s
Top1Premium_10s
TargetBeforeStop_10s
```

‏Secondary Metrics עוזרים להסביר, אבל לא מחליפים בדיעבד את היעד הראשי כי הוא נכשל.

### ‏`P0 — Required`: אין Metric Shopping

‏אסור לוגיקה מסוג:

```text
PnL failed
→ report HitRate
HitRate failed
→ report MFE
MFE failed
→ report one winning regime
```

‏Metric change אחרי ראיית תוצאה הוא Experiment חדש.

### ‏`P0 — Required`: Feature/Label isolation

‏`Label Builder` ו־`Feature Builder` יישארו מופרדים לוגית, ועדיף גם ארכיטקטונית.

```text
Raw Events
→ Point-in-Time State
→ Feature Snapshot (freeze)
→ Filter / Score / Rank
→ Decision Snapshot
→ Future Label Builder
```

‏Label לעולם אינו Input ל־Feature Pipeline.

### ‏`P0 — Required`: Train-only fitting

‏כל Transform שיש בו `fit` לומד מ־Train בלבד.

‏דוגמאות:

```text
scaler
normalizer
historical percentile model
outlier bounds
feature selector
threshold optimizer
```

‏אחר כך רק `transform/apply` על Validation/Test.

### ‏`P0 — Required`: Cross-sectional normalization מותרת רק בתוך אותו `as_of_time`

‏Ranking של Symbols זמינים באותו Snapshot הוא שימוש לגיטימי ב־Cross-Section.

‏אבל אסור ללמוד Normalization מ־future timestamps.

### ‏`P0 — Required`: Point-in-Time Universe

‏בכל Historical Time צריך Universe היסטורי אמיתי ככל האפשר:

```text
listed then
eligible then
tradable then
identifier mapping valid then
```

‏מניות שנמחקו, Symbols שהשתנו ו־IPOs אינם נמחקים מהעבר רק מפני שהיום הם שונים.

### ‏`P0 — Required`: Current Universe אינו Historical Universe

‏Backtest ל־2024 אינו רשאי להשתמש ברשימת Survivors של 2026 כאילו הייתה Universe של 2024.

‏זה `survivorship bias`.

### ‏`P0 — Required`: Timestamp semantics מפורשים

‏כאשר זמינים:

```text
exchange_event_time
provider_time
receive_time
processed_time
feature_ready_time
decision_time
```

‏Backtest חייב לדעת איזה זמן קובע Availability.

‏Live Strategy יודעת רק מה שהגיע אליה בזמן, לא בהכרח מה שקרה בבורסה תאורטית קודם.

### ‏`P0 — Required`: no false precision

‏אם Dataset מספק Resolution של שנייה:

‏אין Research claim ברזולוציה של 100ms כאילו היא נצפתה בפועל.

‏Timestamp precision היא חלק מה־Data Contract.

### ‏`P0 — Required`: deterministic tie policy

‏כאשר כמה Events חולקים Timestamp ואין סדר אמין:

```text
use deterministic conservative ordering
or mark ambiguous
```

‏לעולם לא מסדרים לפי הסדר שמיטיב עם PnL.

### ‏`P0 — Required`: Batch boundary audit

‏ב־whole-market scanner קיים סיכון מיוחד:

```text
symbol A state from start of batch
symbol B state from end of batch
```

‏ואז שניהם מדורגים כאילו הם “עכשיו”.

‏לכן כל Cross-Sectional Snapshot חייב לענות:

```text
What exactly was known for every symbol at this as_of_time?
```

‏Freshness של כל Symbol נשמרת כחלק מה־Feature State.

### ‏`P0 — Required`: No future interpolation/backfill

‏Missing Data לא מתוקן באמצעות עתיד.

‏מדיניות מותרת צריכה להיות ניתנת להפעלה גם Live:

```text
forward-fill only while still semantically valid
mark missing
reject candidate
lower confidence
```

‏לא:

```text
use future record to reconstruct a perfect past
```

### ‏`P0 — Required`: Daily features הם `so_far`

‏Intraday Feature יכול להשתמש למשל ב־:

```text
high_so_far
low_so_far
vwap_so_far
volume_so_far
```

‏לא ב־final daily high/low/VWAP/volume של יום שעדיין לא הסתיים.

### ‏`P0 — Required`: Label overlap מוכרז ומטופל

‏אם:

```text
label_horizon = 60s
sample every 1s
```

‏אז Observations סמוכים אינם Independent.

‏לכן:

- ‏נשתמש ב־Candidate Episodes כאשר זה מתאים.
- ‏נציג Sample Count וגם Episode Count.
- ‏נשקול Evaluation ברמת Day/Event, לא רק Row.
- ‏נשתמש ב־Block/Day bootstrap כאשר בונים uncertainty estimates.

### ‏`P1 — Baseline`: Purging סביב Split Boundaries

‏כאשר Label של Train Sample חוצה לתוך Validation/Test, נסיר Samples שחלון התוצאה שלהם חוצה את הגבול.

‏Purge width נגזר מ־Label Horizon ו־actual overlap, לא ממספר שרירותי.

### ‏`P2 — Challenger`: Embargo

‏כאשר תלות חזקה נשארת סביב גבולות Splits, אפשר להוסיף מרווח זמן בין Train ל־Validation/Test.

‏Embargo אינו Default Magic Number; הוא נמדד לפי dependence structure.

### ‏`P1 — Baseline`: Baseline פשוט קבוע

‏נשמור Reference Model שלא נעלם כאשר מופיעה גרסה מורכבת.

‏Baseline אפשרי למחקר:

```text
tradable + fresh + executable filters
simple short-horizon momentum rank
minimal interactions
```

‏Challenger חייב להוכיח incremental value מול Baseline, לא רק PnL חיובי בפני עצמו.

### ‏`P1 — Baseline`: Random Eligible Baseline

‏בנוסף נשווה ל־random survivor שעבר אותם Eligibility Filters.

‏כך אפשר למדוד אם Ranking באמת מוסיף Selection Value.

### ‏`P1 — Baseline`: One Change at a Time כאשר אפשר

‏בשלב מוקדם נעדיף:

```text
Champion
→ change one feature/filter/weight family
→ compare
```

‏Bundle של 12 שינויים הוא קשה ל־RCA.

### ‏`P1 — Baseline`: Parameter Plateau > Sharp Optimum

‏אנחנו מעדיפים Region סביר:

```text
threshold 0.10..0.14 -> similar behavior
```

‏על פני:

```text
0.119 bad
0.120 amazing
0.121 bad
```

‏Sharp Optimum הוא Warning ל־noise/overfit.

### ‏`P1 — Baseline`: Sensitivity Surface

‏לכל Parameter משמעותי נבדוק Neighborhood:

```text
threshold
weight
holding horizon
entry delay
spread filter
liquidity filter
rank threshold
```

‏בהמשך, כאשר Interaction משמעותי, נבדוק גם 2D surfaces.

### ‏`P1 — Baseline`: Complexity Budget

‏כל Feature/Rule/Parameter חדש צריך להצדיק:

```text
incremental OOS value
robustness
operational feasibility
maintenance cost
```

‏אם שני מודלים דומים ב־OOS, הפשוט יותר הוא Preferred Default.

### ‏`P1 — Baseline`: Rounded parameters when equivalent

‏אם:

```text
0.37 ~= 0.40 in evidence
```

‏נעדיף מספר פשוט יותר.

‏Precision מספרית שאינה מגובה Stability היא False Precision.

### ‏`P0 — Required`: Multiple Testing context נשמר

‏Grid Search של 10,000 combinations הוא 10,000 ניסיונות, לא “Experiment אחד”.

‏Experiment Registry צריך לאפשר לדעת:

```text
how many hypotheses / configurations were examined
before this winner was selected
```

### ‏`P0 — Required`: Winner's Curse assumption

‏הגרסה הטובה ביותר מתוך אלפי ניסויים נחשבת חשודה יותר, לא אמינה יותר אוטומטית.

‏Promotion דורש Evidence חדש מחוץ לנתונים ששימשו לבחירה.

### ‏`P1 — Baseline`: Rank-wide robustness

‏כיוון שהרובוט בוחר Top-1 מתוך אלפי Symbols, חייבים לבדוק:

```text
Top1
Top2-5
Top6-20
random eligible
simple momentum winner
```

‏אם רק Winner יחיד נראה טוב ואין Monotonicity או Top1 Premium, יש חשד ל־cross-sectional Winner's Curse.

### ‏`P1 — Baseline`: Leave-One-Group-Out

‏נבדוק Robustness כאשר מסירים:

```text
best day
best week
best symbol
symbol group
regime
```

‏לא כדי לדרוש שכל תוצאה תישאר זהה, אלא כדי למדוד Edge Concentration.

### ‏`P1 — Baseline`: Effective Sample Size > Row Count

‏Dashboard יציג לפחות:

```text
row_count
episode_count
day_count
symbol_count
```

‏כאשר רלוונטי גם Market Event/cluster count.

‏מיליוני ticks מאותו אירוע אינם מיליוני Evidence units עצמאיים.

### ‏`P2 — Challenger`: Block / Day Bootstrap

‏כאשר נדרשת הערכת uncertainty, נעדיף Sampling ששומר תלות בזמן על פני bootstrap נאיבי של Rows בודדים.

### ‏`P0 — Required`: Statistical significance אינה Promotion בפני עצמה

‏Promotion דורש שילוב:

```text
statistically credible
AND economically meaningful
AND executable
AND robust
```

‏Edge קטן ממגבלת friction/uncertainty אינו שימושי רק מפני ש־p-value נראה טוב.

### ‏`P1 — Baseline`: Stress the assumptions

‏לכל Candidate Version נריץ Sensitivity/Stress על:

```text
spread
slippage
latency
fill rate
thresholds
weights
feature removal
horizon
```

‏ונחפש Robust Region, לא נקודת הנחות מושלמת.

### ‏`P1 — Baseline`: Best / Base / Stress נשמרים נפרדים

‏אין average קסום שמסתיר fragility.

‏כל Version תציג לפחות:

```text
best_case
base_case
stress_case
```

‏כאשר numbers עצמם מגיעים ממדידה/assumption registry, לא מתחושת בטן.

### ‏`P2 — Challenger`: Fragility Score

‏אפשר לבנות מדד שמרכז כמה מהר Metrics מתדרדרים תחת perturbations קטנים.

‏זה Diagnostic, לא יעד Optimization יחיד.

### ‏`P1 — Baseline`: Model Selection Rule אינה `max PnL`

‏Version נבחר לפי שילוב של:

```text
OOS net edge
rank quality
stability
simplicity
execution realism
capacity
risk/tails
```

‏Highest historical PnL לבדו אינו Selection Rule.

### ‏`P0 — Required`: Promotion/No-Go criteria לפני Run

‏דוגמאות `NO_GO`:

```text
known leakage
negative untouched test
edge only in train
single-day domination
extreme parameter sensitivity
unrealistic execution dependence
unresolved data lineage issue
```

‏דוגמאות `PROMOTION_CANDIDATE`:

```text
no known leakage
point-in-time universe verified
positive OOS evidence
reasonable rank monotonicity
Top1 premium not isolated accident
net edge survives realistic friction
acceptable sensitivity
no single-period domination
reproducible result
```

### ‏`P0 — Required`: Leakage invalidates dependent evidence

‏אם מתגלה Leakage:

```text
status = EVIDENCE_INVALIDATED
```

‏כל Run שתלוי ב־Pipeline הפגום מסומן affected.

‏אחרי תיקון:

```text
recompute from raw / trusted source
compare old vs fixed
log incident
```

‏אין “לתקן PnL” ידנית.

### ‏`P0 — Required`: Leakage Incident Log

‏לכל אירוע נשמור:

```text
incident_id
root_cause
affected_datasets
affected_runs
affected_versions
first_bad_commit / version
fixed_version
recompute_status
old_vs_fixed_diff
preventive_test_added
```

### ‏`P0 — Required`: automated leakage tests

‏לפחות:

```text
Future Event Invisible
Historical Join <= target_time
Train-only Fit
Point-in-Time Universe
Label Isolation
Reproducible Run
```

### ‏`P0 — Required`: Future Event Invisible test

‏מחשבים Feature ב־`t`.

‏מוסיפים Event ב־`t+1`.

‏Feature של `t` חייב להישאר זהה.

### ‏`P0 — Required`: Golden Dataset + Manual Timeline Audit

‏נחזיק Dataset קטן שבו אפשר לחשב ידנית:

```text
all known events before t
feature values
filters
score
rank
decision
future labels only after freeze
```

‏אם אי אפשר להסביר Candidate אחד end-to-end, אין בסיס לאמון במיליוני Rows.

### ‏`P0 — Required`: Lineage

‏לכל Feature חשוב להיות מסוגלים להגיע ל־:

```text
source rows
source timestamps
formula
feature_version
```

‏ולכל Decision:

```text
Filter → Feature → Score → Rank → Decision
```

### ‏`P0 — Required`: Raw data immutable / Derived data versioned

‏אין mutate שקט להיסטוריה ששימשה Experiment קיים.

‏תיקון נתונים יוצר:

```text
new data_version
```

‏כדי שניתן יהיה לשחזר גם תוצאה ישנה וגם מתוקנת.

### ‏`P0 — Required`: Backtest/Replay/Shadow/Live parity

‏Preferred Default הוא Shared Feature/Decision Core ככל האפשר:

```text
Backtest
Replay
Shadow
Live
```

‏כאשר משתנים Adapters של Clock/Data/Broker, לא semantics של Feature.

### ‏`P0 — Required`: Training/Serving skew הוא Failure Mode נפרד

‏אותו Feature Name על Feed אחר אינו בהכרח אותו Feature.

‏נשמור:

```text
source
coverage
freshness
timestamp_semantics
missing_policy
normalization
version
```

### ‏`P0 — Required`: Reproducibility manifest

‏כל Run ישמור לפחות:

```text
code_commit
config_version
dataset_version
universe_version
feature_version
filter_version
score_version
cost_model_version
execution_model_version
random_seed
research_phase
```

### ‏`P1 — Baseline`: Multiple seeds למודל סטוכסטי

‏אם Execution/Model כולל randomness, Seed יחיד אינו Evidence מספיק.

‏נציג Distribution על כמה Seeds ונבדוק `stability_across_seeds`.

### ‏`P1 — Baseline`: Research phases מפורשות

```text
DISCOVERY
VALIDATION
LOCKED_TEST
WALK_FORWARD
SHADOW
PAPER
CANARY
LIVE
```

‏Version לא עוברת Phase ללא Evidence מפורש.

### ‏`P0 — Required`: Forward test נשאר קפוא

‏במהלך Shadow/Forward Test:

- ‏Safety/Data Quality monitoring מותר.
- ‏Model tuning אסור בלי לפתוח Experiment/Version חדש.

‏שינוי יומי של Threshold הופך את Forward Test ל־Discovery נוסף.

### ‏`P1 — Baseline`: Fixed evaluation window

‏מגדירים מראש:

```text
minimum calendar duration
or minimum independent opportunity count
```

‏לפני Conclusion, אלא אם Safety Failure מחייב עצירה.

### ‏`P1 — Baseline`: Overfit vs Drift מופרדים

‏שאלה מחייבת כאשר performance נשחק:

```text
Did it never generalize?
OR
Did it generalize and later decay?
```

‏הראשון מצביע יותר על Overfit/Research Failure.

‏השני יכול להיות `data drift` / `concept drift` / market change.

### ‏`P1 — Baseline`: Continuous validation לאחר Promotion

‏Production/Shadow ממשיכים למדוד:

```text
feature drift
score drift
rank drift
outcome drift
net edge drift
sim-to-live gap
```

‏אבל Production אינה Research Playground; שינוי Logic עובר Versioning ו־Promotion מחדש.

---

## ‏3. למה זה מתאים לרובוט שלנו

‏הרובוט בוחר Winner מתוך אלפי מניות בתדירות גבוהה.

‏זה יוצר שלושה סיכוני Overfit חריפים במיוחד:

```text
many symbols
× many timestamps
× many parameter combinations
```

‏גם כאשר אין Edge אמיתי, משהו כמעט תמיד ייראה “הכי טוב”.

‏בנוסף, Horizon של שניות הופך גם Leakage קטן מאוד למהותי:

```text
500ms future access
```

‏יכול להיות חלק גדול מחיי ה־Signal.

‏לכן Confidence ברובוט לא יכולה להגיע ממספר Rows גדול בלבד; היא צריכה להגיע מ־Time Integrity, independent episodes, OOS, Walk-Forward ו־Forward Shadow Evidence.

---

## ‏4. Use When

‏המסגרת הזו מחייבת כאשר:

- ‏מפתחים Feature/Filter/Score חדש.
- ‏משנים Threshold, Weight, Horizon או Holding Time.
- ‏משווים Champion ל־Challenger.
- ‏בודקים Feed/Data preparation חדש.
- ‏משנים Cost/Execution Model.
- ‏מוצאים “שיפור גדול” ב־Backtest.
- ‏מבצעים Retuning אחרי תקופה חלשה.
- ‏מתכננים Promotion ל־Shadow/Paper/Live.

---

## ‏5. Do Not Use When

‏אין לפרש את המסגרת כדרישה:

- ‏שכל Strategy תעבוד בכל Regime.
- ‏שכל Cell ב־Robustness Matrix יהיה חיובי.
- ‏שכל Parameter יהיה חסר השפעה.
- ‏שאסור Discovery יצירתי.
- ‏שאסור להשתמש ב־Visualization/Data Mining כדי ליצור Hypothesis.

‏מותר Specialized Strategy אם:

```text
regime definition known ex ante
regime observable live
validation OOS confirms it
```

‏מה שאסור הוא Post-Hoc Story שנולד רק אחרי כישלון.

---

## ‏6. Alternatives

### ‏Alternative A — Random split

‏קל ליישום אך Baseline חלש ל־Time Series.

‏סיכון: אותו יום/Regime מופיע גם ב־Train וגם ב־Test.

### ‏Alternative B — Single chronological holdout בלבד

‏טוב יותר מ־Random Split, אבל רגיש לבחירה מקרית של תקופה.

### ‏Alternative C — Walk-Forward

‏Preferred אחרי Baseline Holdout כאשר רוצים להבין stability לאורך זמן.

### ‏Alternative D — Nested time-series validation

‏מתאים כאשר יש הרבה Hyperparameters והבחירה עצמה מורכבת.

‏לא Baseline ראשון אם המודל עדיין פשוט.

### ‏Alternative E — Purged/Embargoed splits

‏מתאים כאשר Labels חופפים חזק סביב גבולות Train/Test.

### ‏Alternative F — Shadow Forward Test

‏Evidence חזק נגד Backtest-only overfit, אך עדיין אינו Live Fill truth.

---

## ‏7. Trade-offs

### ‏More holdout purity vs less development data

‏Holdout גדול מגן יותר על Confirmation אך משאיר פחות Data ל־Discovery.

### ‏Walk-forward realism vs compute cost

‏יותר folds משפרים תמונת Generalization אך מגדילים זמן/מורכבות Research.

### ‏Purging/Embargo vs sample size

‏מקטינים dependence/leakage אך גם מצמצמים Observations.

### ‏Simple model vs predictive richness

‏פשטות מצמצמת degrees of freedom אך יכולה לפספס Interaction אמיתי.

### ‏Strict lock vs iteration speed

‏Research Lock מאט tuning ספונטני, אבל הופך Evidence לאמין יותר.

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

```text
huge hyperparameter optimizer
thousands of arbitrary feature interactions
random train/test split
repeated peeking at final test
full-dataset normalization
post-hoc regime filters
perfect historical fills
ML model before a stable simple baseline
```

‏הסיבה אינה שמודלים מתקדמים תמיד גרועים; אלא שהם מגדילים Research Degrees of Freedom לפני שיש Evidence Process חזק.

---

## ‏9. What to Add Later

‏לאחר Baseline יציב אפשר להוסיף:

- ‏nested time-series validation.
- ‏block/day bootstrap scorecards.
- ‏formal multiple-testing controls כאשר נפח הניסויים מצדיק.
- ‏automatic fragility surfaces.
- ‏automated purge/embargo planner based on label windows.
- ‏drift detection dashboards.
- ‏experiment lineage graph.
- ‏automatic contamination tracking.
- ‏formal model governance / champion-challenger automation.

---

## ‏10. Required Data / Evidence

‏כדי שה־Validation יהיה אמין נדרש לפחות:

```text
immutable raw market data or versioned trusted source
point-in-time universe history
symbol lifecycle / identifier mapping
source/event/receive timestamps when available
feature snapshots with as_of_time
label tables separated from features
candidate episode ids
scanner version metadata
execution/cost model versions
experiment registry
train/validation/test boundaries
```

‏בנוסף חשוב לשמור Rejected/No-Trade observations כדי ש־Filters עצמם יוכלו להיבדק OOS.

---

## ‏11. Promotion Criteria

‏Challenger יכול לעבור משלב Research לשלב Evidence מתקדם רק אם מתקיימים יחד, לפי הרלוונטיות:

```text
no known leakage
point-in-time universe verified
feature/label isolation verified
past-only joins verified
reproducible run
predefined primary metric
OOS evidence positive enough
no obvious single-day/symbol dependence
parameter neighborhood reasonably stable
simple baseline beaten materially
Top1/Rank evidence not isolated winner effect
cost/execution stress does not instantly destroy conclusion
research lock respected
```

‏Promotion ל־Shadow דורש בנוסף:

```text
locked strategy version
fixed evaluation plan
observability sufficient to compare research vs live-like data
```

---

## ‏12. Rejection Criteria

‏Version נדחית או חוזרת ל־Discovery כאשר:

```text
leakage discovered
untouched test contradicts hypothesis materially
edge exists only in train
result depends on one symbol/day/event
sharp parameter optimum without plateau
complex model does not beat simple baseline OOS
result requires unrealistic fills/costs
feature fit used validation/test
final test repeatedly tuned against
cross-symbol snapshot timing is inconsistent
```

‏`INCONCLUSIVE` הוא Result לגיטימי כאשר Evidence עדיין קטן/תלוי מדי.

---

## ‏13. Metrics

### ‏Integrity Metrics

```text
future_join_violation_count
feature_changed_after_future_event_count
train_fit_contamination_count
point_in_time_universe_violation_count
label_feature_overlap_count
reproducibility_diff_count
```

‏Baseline expectation ל־P0 violations:

```text
0
```

### ‏Research Process Metrics

```text
experiments_attempted
failed_experiments_retained
configs_evaluated
hypotheses_evaluated
holdout_peek_count
contaminated_holdouts
```

### ‏Generalization Metrics

```text
train_metric
validation_metric
test_metric
walk_forward_distribution
OOS_degradation
shadow_metric
```

### ‏Robustness Metrics

```text
parameter_plateau_width
sensitivity_slope
leave_one_day_out_range
leave_one_symbol_out_range
best_day_contribution
best_symbol_contribution
stress_case_degradation
seed_variance
```

### ‏Complexity Metrics

```text
feature_count
rule_count
free_parameter_count
interaction_count
```

‏הם אינם יעדי minimization מוחלטים; הם Context ל־Complexity Budget.

---

## ‏14. Failure Modes

### ‏Future Join Leakage

‏Nearest record נבחר אחרי Target Time.

### ‏Normalization Leakage

‏Scaler/percentile/outlier bounds למדו גם Test.

### ‏Survivorship Bias

‏Universe היסטורי נבנה מ־current survivors.

### ‏Test Contamination

‏Repeated tuning על אותו Final Test.

### ‏Human Leakage

‏החלטה חדשה נולדה מתוצאת Holdout שכבר נפתחה.

### ‏Metric Shopping

‏Primary Metric הוחלף אחרי failure.

### ‏Parameter Hunting

‏אלפי שילובים יצרו Lucky Winner.

### ‏Feature Explosion

‏כל Failure מוסיף עוד Feature/Rule.

### ‏Batch Leakage

‏whole-market snapshot מערבב timestamps שונים בלי freshness contract.

### ‏Overlap Illusion

‏מיליוני Rows חופפים מוצגים כמיליוני Samples עצמאיים.

### ‏Execution Overfitting

‏Fill/latency/cost assumptions מכוונים עד שה־Strategy “עובדת”.

### ‏Post-hoc Regime Story

‏Regime rule נולד רק אחרי כישלון ולא היה identifiable ex ante.

### ‏Research/Live Skew

‏Feature היסטורי נבנה מ־Data עשיר יותר ממה ש־Live מקבל.

### ‏Silent Historical Mutation

‏Provider correction משנה Backtest ישן ללא Data Version חדש.

---

## ‏15. User-Specific Application

‏עבור המערכת שלנו, ה־Research Unit המועדף אינו רק Trade.

‏נשמור ארבע שכבות:

```text
scanner snapshot
candidate episode
trade decision
executed/simulated trade
```

‏ה־Validation הראשוני צריך להתרכז ב־:

```text
Top1 vs TopN
1/2/5/10/30/60s outcomes
rank monotonicity
Top1 premium
signal age / decay
candidate episodes
Gross → Executable → Net
```

‏אבל כל אלה נחשבים Evidence רק אם:

```text
same-time state
past-only features
point-in-time universe
untouched OOS
research lock
```

‏בגלל Universe של אלפי מניות, Cross-sectional Winner's Curse הוא סיכון מהותי במיוחד: תמיד תהיה מניה קיצונית. לכן מקום #1 חייב להוכיח Premium אמיתי מעבר לעצם היותו extreme observation.

---

## ‏16. Concrete Baseline Contract

```text
ResearchPhase = DISCOVERY | VALIDATION | LOCKED_TEST | WALK_FORWARD | SHADOW

Snapshot:
  as_of_time
  universe_version
  data_version
  scanner_version
  feature_version
  filter_version
  score_version
  symbol_state_age

FeatureBuilder:
  past_only = true
  future_join = forbidden
  backfill_future = forbidden
  centered_window = forbidden
  fit_scope = TRAIN_ONLY

LabelBuilder:
  runs only after FeatureSnapshot freeze
  separated from feature namespace
  horizon metadata explicit

Split:
  chronological = true
  purge_if_label_crosses_boundary = true
  embargo = evidence_gated

Experiment:
  hypothesis frozen before run
  primary_metric frozen before run
  parameters_to_vary declared
  acceptance_criteria declared
  all attempts retained

Test:
  untouched_until_lock = true
  repeated_tuning => contaminated

Promotion:
  leakage_free
  reproducible
  positive OOS evidence
  stable neighborhood
  simple baseline beaten
  realistic economics survives
```

---

## ‏17. Validation Test Suite

### ‏Test 1 — Future Event Invisible

```text
compute feature at T
append event at T+1
recompute feature at T
expected: identical
```

### ‏Test 2 — Historical Join Guard

```text
for every joined record:
  assert joined_time <= target_time
```

### ‏Test 3 — Fit Scope

```text
fit rows ∩ validation/test rows = empty
```

### ‏Test 4 — Universe Lifecycle

```text
symbol cannot appear before eligibility/listing date
```

### ‏Test 5 — Label Isolation

```text
feature dependency graph must not reach label fields
```

### ‏Test 6 — Reproducibility

```text
same data + code + config + seed
=> same decisions + same metrics
```

### ‏Test 7 — Batch Boundary

‏שני Symbols עם update times שונים לא מקבלים Freshness זהה אוטומטית.

### ‏Test 8 — Purge Boundary

‏Sample ש־label שלו חוצה לתוך Test אינו נשאר ב־Train.

### ‏Test 9 — Contaminated Test State

‏כאשר Test result שימש לשינוי Model:

```text
test_status = CONTAMINATED
```

### ‏Test 10 — Parameter Plateau

‏Promotion report חייב לכלול Neighborhood ולא רק Best Point.

### ‏Test 11 — Failed Experiments Retained

‏Experiment Registry count כולל Winners ו־Losers.

### ‏Test 12 — Leakage Incident Recovery

‏לאחר תיקון Leakage:

```text
all affected runs marked invalidated
rerun created with new data/code version
old-vs-fixed diff stored
preventive test added
```

---

## ‏18. Confidence

| המלצה | Confidence |
|---|---|
| ‏Past-only / no look-ahead | `High` |
| ‏Chronological split | `High` |
| ‏Locked final test | `High` |
| ‏Point-in-time universe | `High` |
| ‏Train-only fitting | `High` |
| ‏Keep failed experiments | `High` |
| ‏Parameter plateau over sharp optimum | `High` |
| ‏Purging for overlapping labels | `High` conceptually; exact width data-dependent |
| ‏Embargo | `Medium`; dependence-dependent |
| ‏Walk-forward as core robustness tool | `High` |
| ‏Block/day bootstrap | `Medium`; exact implementation depends on dependence structure |
| ‏Fragility Score | `Medium`; useful diagnostic, no canonical formula assumed |
| ‏Shadow forward testing | `High` as evidence stage, not as fill truth |

---

## ‏19. Time-Sensitive Facts

‏המסמך מתודולוגי ואינו תלוי ב־Broker/API capability משתנה כדי לקבוע את ה־Baseline.

‏כן יש Facts תפעוליים שיש לאמת מחדש כאשר נגיע ל־Implementation ספציפי:

- ‏איזה timestamp semantics מספק כל Feed.
- ‏האם קיימים historical delisted/universe records באיכות מספקת.
- ‏האם historical corrections משנות datasets קיימים.
- ‏איזה fields זמינים ב־Live לעומת Historical.
- ‏Paper/Live fill semantics של Broker ספציפי.

‏אין לקודד הנחות אלה כ־Truth קבועה מתוך הפרק הזה.

---

## ‏20. Current Verification Snapshot

‏לא נדרש Web verification חדש למקטע זה, משום שההמלצות הן Research Methodology ולא טענה עדכנית על Provider/Broker מסוים.

‏כאשר ייבחר Data Provider או Broker לצורך implementation, Data/Execution parity יקבל אימות ייעודי לפני Promotion.

---

## ‏21. Relationship to Later Sheets

‏מקטע 23 יוצר את המסגרת שבתוכה מותר לבצע את 24.

```text
23 Validation Integrity
→ 24 Controlled Experiments / Score Improvement
→ 25 Regime Analysis
→ 26 RCA
→ later Replay / Shadow / Production governance
```

‏מקטע 24 אינו רשאי “לשפר Score” על ידי פתיחת Test וחיפוש Winner חוזר.

‏מקטע 25 אינו רשאי להמציא Regime אחרי התוצאה ואז להציג אותו כ־ex-ante filter ללא Validation חדש.

‏מקטעי Production עתידיים יישענו על Research Phase / Version / Promotion metadata שנקבעו כאן.

---

## ‏22. Recommendation Summary

### ‏Baseline

```text
Point-in-time data
→ Train-only discovery
→ freeze hypothesis + metric
→ later Validation
→ Research Lock
→ untouched Test
→ Walk-Forward
→ Shadow Forward Test
```

### ‏Required

```text
past-only joins
no future backfill
feature/label isolation
point-in-time universe
chronological splits
experiment registry
failed experiment retention
reproducibility
leakage tests
promotion/no-go gates
```

### ‏Preferred Default

```text
simple champion
one-change-at-a-time early research
parameter plateaus
candidate episodes
leave-one-group-out
Best/Base/Stress
```

### ‏Challengers

```text
nested time-series validation
embargo
block/day bootstrap
fragility score
formal multiple-testing controls
```

### ‏Avoid Unless Evidence

```text
random time-series split
repeated final-test tuning
full-dataset fit/normalization
post-hoc regime stories
sharp magic parameters
feature/rule explosion
perfect historical fills
max-PnL model selection
```

‏המסקנה המרכזית:

> ‏Edge אינו “תוצאה יפה”. ‏Edge הוא Hypothesis ששרדה תהליך שבו העתיד לא דלף פנימה, ה־Test לא שימש כ־Sandbox, ה־Winner לא נבחר רק מתוך אלפי ניסיונות, וההצלחה נמשכה גם על Data שלא שימש לפיתוח.
