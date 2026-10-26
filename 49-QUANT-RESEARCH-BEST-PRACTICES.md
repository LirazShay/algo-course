# ‏שלב 49 — `Quant Research Best Practices`: לבנות מחקר שלא מרמה אותנו

> ‏מטרת הפרק: לבנות תהליך מחקר כמותי מקצועי, ניתן לשחזור וניתן לביקורת, שבו כל hypothesis, dataset, feature, experiment, result ו־decision נשמרים בצורה שמאפשרת להבין בדיוק מה נבדק, למה נבדק, ומה באמת למדנו.
>
> ‏העיקרון המרכזי: **מחקר טוב הוא מערכת למניעת הונאה עצמית. אם אי אפשר לשחזר בדיוק איך נוצרה תוצאה — היא אינה Evidence חזקה מספיק כדי לשנות Strategy או להכניס כסף אמיתי.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. למה `Research Process` חשוב לא פחות מה־Strategy

‏קל מאוד לבנות Backtest שנראה טוב.

‏קשה הרבה יותר להוכיח שה־Edge אמיתי.

‏הסכנה המרכזית היא לא רק bug בקוד.

‏הסכנה היא תהליך שמאפשר לנו לבצע מספיק ניסויים עד שמשהו במקרה נראה מוצלח.

```text
Try many ideas
→ keep the winners
→ forget the losers
→ tell a convincing story
→ deploy false edge
```

‏זהו אחד המסלולים הנפוצים ביותר מ־research ל־live failure.

‏לכן Research Engineering הוא חלק ממערכת המסחר, לא notebook צדדי.

---

# ‏2. ארבעה סוגי אמת שצריך להפריד

‏בכל מחקר נפריד בין:

```text
Observation
Hypothesis
Experiment
Conclusion
```

‏`Observation` הוא מה שראינו בנתונים.

‏`Hypothesis` הוא ההסבר האפשרי שלנו.

‏`Experiment` הוא המבחן שנועד לנסות להפריך או לחזק אותו.

‏`Conclusion` הוא מה שהנתונים מאפשרים לנו לומר לאחר המבחן.

‏אסור להפוך את הסדר.

‏לדוגמה:

```text
Observation:
Top-ranked symbols often move 15–30 bps in the next 5 seconds.

Hypothesis:
Short-term flow persistence may explain the continuation.

Experiment:
Add flow-persistence feature and compare against frozen baseline.

Conclusion:
Only if out-of-sample net metrics improve consistently.
```

---

# ‏3. `Hypothesis First`

‏לפני Experiment משמעותי כותבים מראש:

- ‏מה אנחנו חושבים שקורה.
- ‏למה זה עשוי לקרות.
- ‏מה המדד שאמור להשתפר.
- ‏מה המדד שעלול להיפגע.
- ‏מה יהיה baseline.
- ‏מה יהיה challenger.
- ‏באיזה horizons נמדוד.
- ‏מה נחשב הצלחה.
- ‏מה נחשב כישלון.
- ‏אילו subgroups נבדוק.

‏כך מונעים מצב שבו אחרי התוצאה אנחנו משנים את שאלת המחקר כדי שתיראה מוצלחת.

---

# ‏4. `Research Question` צריך להיות צר

‏שאלה חלשה:

```text
Can we improve the strategy?
```

‏שאלה טובה יותר:

```text
Does adding 2-second signed-flow persistence
improve 5-second executable forward return
for the existing Top-10 candidate set,
after round-trip costs,
without materially reducing coverage?
```

‏ככל שהשאלה מדויקת יותר, כך קל יותר לדעת אם באמת למדנו משהו.

---

# ‏5. לכל Experiment יש `Experiment ID`

‏כל Experiment משמעותי יקבל מזהה יציב.

```text
EXP-2026-0042
```

‏המזהה יופיע ב:

- ‏config.
- ‏results.
- ‏charts.
- ‏logs.
- ‏commit/branch reference.
- ‏dataset manifest.
- ‏research notes.
- ‏decision record.

‏כך אפשר לחזור מהגרף אל הקוד והנתונים שיצרו אותו.

---

# ‏6. `Experiment Manifest`

‏לכל ניסוי נשמור Manifest.

‏דוגמה רעיונית:

```text
experiment_id
created_at
hypothesis
baseline_version
challenger_version
code_commit
feature_set_version
universe_version
dataset_version
start_time
end_time
train_window
validation_window
test_window
cost_model_version
latency_model_version
fill_model_version
parameters
primary_metrics
secondary_metrics
acceptance_criteria
known_limitations
```

‏אם אחד מהדברים האלה משתנה, זה כבר לא בדיוק אותו Experiment.

---

# ‏7. Versioning של Data הוא חובה

‏אותו קוד על Dataset אחר יכול לתת תוצאה אחרת לחלוטין.

‏לכן צריך לזהות:

```text
data source
capture version
schema version
normalization version
correction version
symbol mapping version
corporate-action handling
market-calendar version
```

‏Data הוא dependency בדיוק כמו ספריית תוכנה.

---

# ‏8. `Raw Data` מול `Derived Data`

‏רצוי להפריד:

```text
Raw Events
→ Canonical Events
→ Features
→ Candidate Snapshots
→ Labels
→ Experiment Results
```

‏כל שכבה צריכה להיות ניתנת לשחזור מהשכבה הקודמת.

‏אסור ש־research notebook ישנה בשקט raw data או יתקן values בלי provenance.

---

# ‏9. `Point-in-Time Correctness`

‏כל feature חייב להשתמש רק במידע שהיה זמין בזמן ההחלטה.

‏צריך לשאול:

```text
Was the event already known?
Was it already received by us?
Was it already processed?
Was it already part of the decision state?
```

‏הבדל של milliseconds יכול ליצור leakage במחקר של seconds.

---

# ‏10. ארבעה Timestamps לפחות

‏כאשר אפשר, נפריד:

```text
exchange_event_time
provider_time
received_time
processed_time
```

‏ולפעמים גם:

```text
decision_time
order_sent_time
broker_ack_time
fill_time
```

‏כך אפשר להבדיל בין Market History לבין מה שהמערכת שלנו באמת הייתה יכולה לדעת בזמן אמת.

---

# ‏11. `Look-Ahead Bias`

‏דוגמאות קלאסיות:

- ‏שימוש ב־future high כדי להחליט entry.
- ‏שימוש בסגירת bar לפני שה־bar נסגר.
- ‏שימוש ב־trade שהגיע אחרי decision timestamp.
- ‏שימוש ב־corrected data שלא היה זמין live.
- ‏שימוש ב־future universe membership.
- ‏שימוש ב־future halt/news outcome.

‏ב־short horizon leakage קטן מאוד בזמן יכול להיות גדול מאוד בתוצאה.

---

# ‏12. `Survivorship Bias`

‏אם אנחנו בודקים רק symbols שנמצאים היום בשוק, אנחנו עלולים למחוק מהעבר:

- ‏delistings.
- ‏mergers.
- ‏bankruptcies.
- ‏symbol changes.
- ‏securities שנעלמו.

‏Universe צריך להיות point-in-time ולא “רשימת היום על ההיסטוריה”.

---

# ‏13. `Selection Bias`

‏אם שומרים רק ימים שבהם המערכת הייתה מעניינת, נוצר bias.

‏צריך לשמור גם:

- ‏ימים שקטים.
- ‏ימים גרועים.
- ‏ימים עם מעט candidates.
- ‏ימים עם data issues.
- ‏ימים עם halts.
- ‏ימים עם fast markets.

‏המציאות כוללת את כולם.

---

# ‏14. `Winner's Curse`

‏אם בדקנו 1,000 Features ובחרנו את הטוב ביותר, ה־winner כנראה נהנה גם ממזל.

‏לכן:

```text
best observed feature
!=
best true feature
```

‏ככל שחיפשנו יותר, צריך להיות חשדניים יותר כלפי התוצאה הטובה ביותר.

---

# ‏15. `Multiple Testing`

‏אם מריצים מספיק ניסויים, חלק ייראו טוב במקרה.

‏לכן צריך לפחות לעקוב אחרי:

```text
number_of_experiments
number_of_parameter_variants
number_of_feature_variants
number_of_horizons
number_of_subgroups
```

‏גם אם איננו משתמשים תמיד בתיקון סטטיסטי פורמלי, עצם ספירת ה־trials חשובה.

---

# ‏16. `Research Budget`

‏אפשר להגדיר לכל רעיון Budget.

‏לדוגמה:

```text
maximum variants
maximum parameter sweeps
maximum manual retries
maximum subgroup splits
```

‏אם חרגנו ממנו, צריך לתעד זאת במפורש.

‏זה עוזר למנוע אינסוף tuning עד שמתקבלת תשובה רצויה.

---

# ‏17. `Frozen Baseline`

‏בכל ניסוי צריך Baseline קפוא.

‏אסור לשנות במקביל:

- ‏Feature A.
- ‏Filter B.
- ‏Exit C.
- ‏Cost Model D.
- ‏Universe E.

‏ואז לטעון ש־A גרם לשיפור.

‏בדרך כלל:

```text
Baseline = frozen
Challenger = one intentional change
```

---

# ‏18. `One Change at a Time`

‏זו לא דרישה מוחלטת לכל מחקר, אבל היא ברירת מחדל מצוינת.

‏אם צריך לשנות כמה דברים יחד, צריך להכיר בכך שה־causal attribution חלש יותר.

---

# ‏19. `Ablation Tests`

‏אם מודל כולל:

```text
momentum
flow
book
liquidity
regime
```

‏נבדוק גם מה קורה כשמסירים כל רכיב.

```text
Full model
Full - flow
Full - book
Full - regime
```

‏כך רואים האם feature באמת מוסיף ערך או רק “נמצא שם”.

---

# ‏20. `Train / Validation / Test`

‏במחקר time-series אין shuffle אקראי פשוט כמו בבעיות IID רגילות.

‏ברירת מחדל:

```text
Past → Train
Later → Validation
Latest untouched → Test
```

‏ה־Test Set צריך להישאר בלתי נגוע עד כמה שאפשר.

---

# ‏21. `Walk-Forward Validation`

‏במקום Split אחד בלבד:

```text
Train A → Test B
Train A+B → Test C
Train A+B+C → Test D
```

‏כך בודקים האם ה־Edge חוזר בתקופות שונות.

---

# ‏22. `Rolling` מול `Expanding Window`

‏`Rolling Window` שומר היסטוריה באורך קבוע.

‏`Expanding Window` מוסיף עוד היסטוריה עם הזמן.

‏הבחירה תלויה בשאלה האם מידע ישן עדיין רלוונטי.

‏ב־microstructure behavior ייתכן שדפוסים ישתנו, ולכן צריך לבדוק decay של relevance.

---

# ‏23. `Regime Holdout`

‏לא מספיק שהמודל עובד בממוצע.

‏צריך לבדוק:

- ‏open.
- ‏midday.
- ‏close.
- ‏high volatility.
- ‏low volatility.
- ‏wide spreads.
- ‏tight spreads.
- ‏fast markets.
- ‏high activity.
- ‏low activity.

‏מודל שמרוויח רק ב־regime אחד צריך להיות מזוהה ככזה.

---

# ‏24. `Universe Holdout`

‏אפשר לבדוק generalization גם בין קבוצות symbols.

‏לדוגמה:

```text
large-cap
mid-cap
small-cap
high-price
low-price
high-liquidity
low-liquidity
```

‏לא כדי להכריח universality, אלא כדי לדעת איפה המודל עובד ואיפה לא.

---

# ‏25. `Temporal Stability`

‏Edge מקצועי אינו חייב להיות קבוע, אבל צריך להבין את היציבות שלו.

‏נמדוד:

```text
metric by day
metric by week
metric by month
metric by regime
```

‏ונחפש:

- ‏drift.
- ‏decay.
- ‏sudden breaks.
- ‏period dependence.

---

# ‏26. לא להסתפק ב־Average

‏Average יכול להסתיר distribution גרוע.

‏צריך לבדוק גם:

```text
median
P10
P25
P75
P90
P95
P99
worst cases
```

‏במיוחד עבור:

- ‏returns.
- ‏slippage.
- ‏latency.
- ‏time-to-fill.
- ‏MAE.
- ‏drawdown.

---

# ‏27. `Confidence Intervals`

‏Metric יחיד אינו אומר כמה uncertainty יש סביבו.

‏רצוי להציג Interval או לפחות variability across days/blocks.

‏לדוגמה:

```text
mean net edge = 7 bps
```

‏בלי dispersion, sample size ו־stability זו אינה תמונה מלאה.

---

# ‏28. `Bootstrap` בזהירות

‏Bootstrap יכול לעזור להעריך uncertainty.

‏אבל time-series observations אינם תמיד independent.

‏לכן block bootstrap או resampling ברמת episode/day עשוי להיות מתאים יותר מאשר ערבוב trades בודדים.

---

# ‏29. `Effective Sample Size`

‏10,000 trades אינם בהכרח 10,000 observations עצמאיות.

‏אם כולם הגיעו מאותו burst או מאותו regime, effective sample size קטן יותר.

‏צריך לחשוב על clustering לפי:

```text
symbol
time window
market event
regime
day
```

---

# ‏30. `Episode` כיחידת מחקר

‏ב־short-term momentum לפעמים עדיף להגדיר episode:

```text
start of opportunity
→ candidate evolution
→ entry opportunity
→ peak/decay
→ end of event
```

‏כך מונעים ספירה של 40 snapshots מאותו אירוע כאילו היו 40 opportunities עצמאיות.

---

# ‏31. `Event Deduplication`

‏צריך להחליט מה נחשב הזדמנות חדשה.

‏לדוגמה:

```text
same symbol
same momentum burst
same direction
within 3 seconds
```

‏עשוי להיות episode אחד ולא ארבעה signals.

---

# ‏32. `Primary Metric`

‏לכל Experiment צריך Metric ראשי אחד או מעט מאוד Metrics ראשיים.

‏לדוגמה:

```text
net executable return at 5s
```

‏Metrics נוספים הם diagnostics.

‏אם בכל פעם בוחרים לאחר מעשה metric אחר שבו הניסוי ניצח, זה cherry-picking.

---

# ‏33. Metrics לרובוט שלנו

‏Metrics חשובים עשויים לכלול:

```text
time_to_first_profit
time_to_target
forward_return_1s
forward_return_2s
forward_return_5s
forward_return_10s
MFE
MAE
net_executable_return
fill_probability
adverse_markout
missed_opportunity
```

‏אבל כל Experiment צריך להגדיר מראש מה באמת מכריע.

---

# ‏34. `Gross` מול `Net`

‏כל Result משמעותי צריך להציג לפחות:

```text
Gross Alpha
Spread Cost
Commission/Fees
Slippage
Expected Adverse Selection
Latency Effect
Impact Estimate
Net Edge
```

‏שיפור Gross שמגדיל Costs יותר ממנו אינו שיפור.

---

# ‏35. `Executable Labels`

‏אם ה־Strategy נכנסת ב־Ask, label שמבוסס רק על Last או Mid יכול להיות אופטימי.

‏לכן צריך להבחין בין:

```text
market movement
predictive movement
executable movement
realized execution
```

‏אלה ארבעה דברים שונים.

---

# ‏36. `Counterfactual` אינו עובדה

‏אם לא שלחנו Order, איננו יודעים בוודאות שהיה מתמלא.

‏אם התמלאנו, איננו יודעים בוודאות מה היה קורה במסלול execution אחר.

‏Counterfactual results צריכים לשאת confidence/fidelity.

---

# ‏37. `Model Fidelity`

‏כל Backtest יציין איזה execution model שימש:

```text
L1 optimistic
L1 conservative
L2 queue approximation
replay with partial fills
live-calibrated model
```

‏כך לא משווים שני ניסויים כאילו הם זהים כאשר execution assumptions שונים.

---

# ‏38. `Sensitivity Analysis`

‏Edge טוב לא אמור להתקיים רק בנקודה קסומה אחת.

‏אם parameter עובד רק ב:

```text
threshold = 0.1734
```

‏אבל נכשל ב־0.16 וב־0.18, זה חשוד.

‏נרצה לראות plateau סביר סביב הפרמטר.

---

# ‏39. `Parameter Surface`

‏במקום להציג רק best parameter:

```text
parameter → result
```

‏מציגים surface או curve של כל האזור.

‏כך רואים האם יש:

- ‏plateau.
- ‏sharp peak.
- ‏unstable ridge.
- ‏multiple regimes.

---

# ‏40. `Robustness` חשוב יותר מ־Peak Result

‏לעיתים Strategy שמרוויחה פחות ב־Backtest אבל יציבה יותר בין periods עדיפה למחקר נוסף.

‏Peak result הוא לא בהכרח best candidate ל־production.

---

# ‏41. `Holdout Discipline`

‏אם הסתכלנו על Test Set ושינינו את המודל בעקבותיו, ה־Test Set כבר אינו באמת untouched.

‏צריך לסמן אותו כ־used ולהכין holdout חדש בעת הצורך.

---

# ‏42. `Research Memory`

‏צריך לשמור גם Experiments שנכשלו.

‏למה?

- ‏כדי לא לחזור על אותו רעיון בעוד חודש.
- ‏כדי לדעת אילו assumptions כבר נבדקו.
- ‏כדי להבין evolution של המודל.
- ‏כדי למדוד כמה trials באמת בוצעו.

---

# ‏43. `Negative Results` הם נכס

‏Experiment שנכשל היטב יכול ללמד יותר מ־Experiment שהצליח במקרה.

‏לדוגמה:

```text
Book imbalance added no predictive value after flow was already included.
```

‏זו תוצאה שימושית.

---

# ‏44. `Decision Record`

‏אחרי Experiment נכתוב:

```text
PROMOTE
REJECT
RESEARCH_MORE
SHADOW_ONLY
INSUFFICIENT_EVIDENCE
```

‏עם Reason Codes.

‏לא משאירים Result בלי החלטה או interpretation.

---

# ‏45. `Promotion Criteria`

‏Feature לא נכנס ל־Champion כי “הגרף יפה”.

‏אפשר להגדיר:

```text
must improve primary metric
must not worsen tail risk beyond limit
must survive out-of-sample
must survive regime checks
must have acceptable coverage
must pass execution realism
must pass data-quality tests
```

---

# ‏46. `Research → Shadow → Live`

‏מסלול מקצועי:

```text
Offline research
→ Replay
→ Shadow
→ Paper
→ Small live
→ Controlled scale-up
```

‏לא מדלגים ישר מ־notebook לכסף אמיתי.

---

# ‏47. `Shadow Features`

‏Feature חדש יכול להיחשב live בלי להשפיע על החלטות.

‏כך נמדוד:

```text
what it would have predicted
when it would have changed rank
what happened afterward
whether data was available in time
```

‏זה שלב חזק מאוד לפני promotion.

---

# ‏48. `Decision Impact Rate`

‏Feature יכול להיראות predictive אבל כמעט לעולם לא לשנות החלטה.

‏נמדוד:

```text
how often did the feature change:
rank
trade/no-trade
entry timing
execution mode
exit timing
```

‏אם Impact Rate כמעט אפס, ייתכן שאין הצדקה למורכבות.

---

# ‏49. `Complexity Tax`

‏כל Feature/Model חדש מוסיף:

- ‏CPU.
- ‏latency.
- ‏state.
- ‏failure modes.
- ‏debug complexity.
- ‏monitoring burden.
- ‏maintenance.

‏לכן השאלה אינה רק:

```text
Does it improve prediction?
```

‏אלא:

```text
Does it improve production net outcome enough to justify its complexity?
```

---

# ‏50. `KISS` הוא Research Principle

‏מודל פשוט עם Edge ברור ועדויות חזקות עדיף לעיתים על מודל מורכב שקשה להסביר ולשחזר.

‏במיוחד במערכת עם horizon קצר, כל מורכבות יכולה להגדיל latency ו־failure surface.

---

# ‏51. `Feature Provenance`

‏כל Feature צריך לדעת:

```text
source events
lookback
normalization
missing-value policy
update trigger
staleness rule
feature version
```

‏Feature בלי provenance הוא debt מחקרי.

---

# ‏52. `Feature Availability Time`

‏Feature צריך להיות timestamped לפי הרגע שבו ניתן היה לחשב אותו בפועל.

‏לא לפי timestamp של האירוע האחרון בלבד.

‏אם computation לקח 30ms, זה חלק מהמציאות.

---

# ‏53. `Missing Data` אינו תמיד אפס

‏אם אין Quote חדש:

```text
0
```

‏אינו בהכרח value נכון.

‏צריך להבדיל:

```text
ZERO
MISSING
STALE
NOT_APPLICABLE
UNKNOWN
```

---

# ‏54. `Imputation` עלולה ליצור Edge מזויף

‏במיוחד ב־market microstructure.

‏Forward-fill יכול לגרום ל־stale quote להיראות current.

‏כל imputation צריך להיות explicit ונבדק.

---

# ‏55. `Data Quality Gates`

‏לפני Experiment:

- ‏coverage.
- ‏sequence integrity.
- ‏duplicates.
- ‏out-of-order rate.
- ‏staleness.
- ‏timestamp sanity.
- ‏symbol mapping.
- ‏market-status consistency.

‏Experiment על data פגום אינו “עוד sample”.

---

# ‏56. `Bad Data` לא מתקנים בשקט

‏אם מסירים יום חריג כי “הוא נראה שבור”, צריך לתעד:

```text
which day
why removed
objective rule
whether rule existed before seeing result
```

‏אחרת קל למחוק losers במסווה של data cleaning.

---

# ‏57. `Research Reproducibility`

‏פקודה אחת צריכה להיות מסוגלת להריץ Experiment מחדש.

‏רצוי:

```text
run-experiment EXP-2026-0042
```

‏והמערכת יודעת את כל versions הדרושים.

---

# ‏58. Determinism

‏אותו Dataset + Code + Config צריכים להחזיר אותה תוצאה, למעט רכיבים stochastic שמוגדרים עם seed.

‏אם התוצאה משתנה בין runs ללא הסבר, יש בעיית מחקר.

---

# ‏59. `Random Seed`

‏אם משתמשים ב־sampling, ML או randomized search:

```text
seed
```

‏נשמר ב־Experiment Manifest.

‏ולעתים נבדוק כמה seeds כדי לוודא שהתוצאה אינה תלויה ב־seed אחד.

---

# ‏60. `Environment Reproducibility`

‏נשמור גם:

```text
runtime version
library versions
OS/container
CPU-relevant flags if needed
```

‏במיוחד אם performance/latency הוא חלק מה־Experiment.

---

# ‏61. `Code Commit` הוא חלק מהתוצאה

‏כל Result צריך להיות קשור ל־Git Commit מדויק.

‏“גרסה בערך מהשבוע שעבר” אינה reproducible.

---

# ‏62. `Config as Data`

‏Parameters צריכים להיות בקובץ versioned ולא מפוזרים בקוד.

‏לדוגמה:

```text
momentum_windows
flow_threshold
score_weights
entry_ttl
exit_ttl
cost_model
latency_profile
```

---

# ‏63. `No Manual Magic`

‏אם Analyst צריך לבצע חמישה צעדים ידניים כדי ליצור Dataset, זה מסוכן.

‏עדיף pipeline אוטומטי ומתועד.

---

# ‏64. `Notebook` אינו Source of Truth

‏Notebook טוב exploration.

‏אבל production research logic צריך לעבור לקוד/versioned pipeline אם הוא הופך משמעותי.

---

# ‏65. `Exploration` מול `Confirmation`

‏מותר exploration חופשי.

‏אבל צריך לסמן אותו ככזה.

‏לאחר discovery, hypothesis חדש צריך לעבור confirmatory test על data שלא שימש לגילוי.

---

# ‏66. `Exploratory Result` אינו Production Evidence

‏זו הבחנה חשובה מאוד.

```text
Exploration found pattern
!=
Pattern is validated
```

---

# ‏67. `Data Snooping Log`

‏אפשר לשמור אילו columns, horizons ו־filters כבר בדקנו.

‏כך מודדים את היקף החיפוש ולא שוכחים אותו.

---

# ‏68. `Pre-Registration Lite`

‏לא צריך בירוקרטיה אקדמית מלאה.

‏מספיק לפני Experiment חשוב לכתוב:

```text
hypothesis
primary metric
sample window
acceptance rule
planned variants
```

‏ואז להריץ.

---

# ‏69. `Economic Significance` מול `Statistical Significance`

‏גם אם effect אמיתי סטטיסטית, הוא יכול להיות קטן מדי כדי לכסות:

- ‏spread.
- ‏fees.
- ‏slippage.
- ‏latency.
- ‏impact.

‏לכן תמיד שואלים האם הוא economically tradable.

---

# ‏70. `Practical Materiality`

‏שיפור של 0.1 bps עשוי להיות חסר משמעות אם model error גדול ממנו.

‏צריך להגדיר minimum meaningful improvement.

---

# ‏71. `Effect Size`

‏מעבר ל־p-value או hit rate, צריך למדוד כמה גדול השיפור.

‏לדוגמה:

```text
+3.2 bps net
+4% fill probability
-12ms decision latency
-8% toxic fill rate
```

---

# ‏72. `Coverage`

‏Feature יכול לשפר מאוד את הממוצע אבל לפסול 95% מההזדמנויות.

‏לכן נמדוד:

```text
opportunity coverage
trade coverage
symbol coverage
regime coverage
```

---

# ‏73. `Trade-Off Matrix`

‏לכל שינוי אפשר להציג:

| Metric | Baseline | Challenger | Delta |
|---|---:|---:|---:|
| Net Edge | ... | ... | ... |
| Coverage | ... | ... | ... |
| Fill Rate | ... | ... | ... |
| P95 Latency | ... | ... | ... |
| MAE | ... | ... | ... |
| Complexity | ... | ... | ... |

‏כך לא מסתכלים על metric יחיד בבידוד.

---

# ‏74. `Tail Risk`

‏שיפור ממוצע לא מצדיק deterioration חמור בזנבות.

‏צריך לבדוק:

```text
worst 1%
worst episodes
max adverse excursion
worst slippage
largest stale-signal failures
```

---

# ‏75. `Failure Buckets`

‏נחלק כישלונות לקטגוריות:

```text
prediction failure
execution failure
stale signal
bad fill
spread expansion
halt/market status
latency spike
data issue
capacity issue
exit failure
```

‏כך Feature prediction לא “נענש” בטעות על execution bug ולהפך.

---

# ‏76. `First Divergence`

‏ב־RCA נשאל איפה בפעם הראשונה המציאות סטתה מהציפייה:

```text
candidate selection?
entry feasibility?
fill?
post-fill move?
exit?
```

‏זה הרבה יותר מועיל מאשר רק לסמן Trade כ־loss.

---

# ‏77. `Research Integrity Tests`

‏נכתוב tests גם לתהליך המחקר.

‏לדוגמה:

- ‏Feature לא קורא future events.
- ‏Label לא נכנס ל־Feature pipeline.
- ‏Train/Test אינם חופפים.
- ‏Universe membership הוא point-in-time.
- ‏Cost Model אכן מופעל.
- ‏Latency Model version נשמר.
- ‏Experiment manifest מלא.

---

# ‏78. `Golden Experiments`

‏נחזיק מספר Experiments קטנים עם expected outputs.

‏אם שינוי infrastructure משנה אותם ללא סיבה, זו התרעה.

---

# ‏79. `Data Lineage Tests`

‏עבור Sample נבחר נוכל לעקוב:

```text
raw event
→ canonical event
→ feature
→ score
→ rank
→ decision
→ label
→ metric
```

‏זה כלי debug ומחקר חזק מאוד.

---

# ‏80. `Leakage Canary`

‏אפשר להחזיק tests שנועדו במיוחד לגלות leakage.

‏לדוגמה Feature future-return מזויף אמור לייצר performance בלתי סביר.

‏אם pipeline אינו מבחין בינו לבין feature חוקי, חסר guardrail.

---

# ‏81. `Shuffle Sanity Test`

‏אם שוברים בכוונה את הקשר בין features ל־labels, performance צריך להיעלם.

‏אם הוא נשאר גבוה, ייתכן leakage או bug.

---

# ‏82. `Time Shift Test`

‏אפשר להזיז Feature קדימה/אחורה בזמן.

‏אם ביצועים משתפרים בצורה דרמטית כשה־feature מגיע “מוקדם מדי”, זה עשוי לחשוף leakage.

---

# ‏83. `Null Model`

‏נרצה baseline טיפש:

```text
random candidate
simple momentum
top last-return
no-flow model
```

‏אם המודל המתקדם בקושי מנצח baseline פשוט, צריך לשאול האם המורכבות מוצדקת.

---

# ‏84. `Naive Baseline` הוא חבר

‏Baseline פשוט מונע מאיתנו להתלהב ממודל מורכב שמפתר בעיה לא קיימת.

---

# ‏85. `Research Dashboard`

‏אפשר לבנות מסך שמציג:

```text
experiments run
promoted
rejected
pending
primary metric distribution
recent drift
feature count
parameter count
live-vs-backtest gap
```

‏כך גם תהליך המחקר עצמו הופך observable.

---

# ‏86. `Experiment Registry`

‏נרצה רשימה ניתנת לחיפוש:

```text
ID
hypothesis
status
commit
dataset
result summary
decision
owner/date
```

‏זה הזיכרון הארגוני של המחקר.

---

# ‏87. `Feature Registry`

‏לכל Feature:

```text
name
version
definition
source
latency
cost
status
last evaluation
live status
```

‏כך לא נוצרים עשרות features כפולים בשם שונה.

---

# ‏88. `Feature Retirement`

‏Feature שהפסיק לעבוד צריך להיות ניתן להסרה.

‏לא משאירים אותו רק כי “הוא תמיד היה שם”.

‏בהמשך נקדיש לזה פרק מלא.

---

# ‏89. `Champion / Challenger`

‏Production מחזיק Champion ברור.

‏Challenger נמדד מולו.

‏לא משנים Champion בכל פעם שגרף חדש נראה טוב.

---

# ‏90. `Promotion` היא Decision עסקית וטכנית

‏צריך לשקלל:

```text
expected improvement
confidence
complexity
latency
operational risk
monitoring readiness
rollback readiness
```

---

# ‏91. `Rollback Plan`

‏לפני Promotion צריך לדעת איך חוזרים ל־Champion הקודם.

‏מחקר מקצועי כולל גם plan לכישלון live.

---

# ‏92. `Live Calibration`

‏אחרי deployment נבדוק:

```text
predicted vs realized
backtest vs shadow
shadow vs live
fill model vs actual fills
latency model vs actual latency
```

‏Research אינו מסתיים ברגע ה־deploy.

---

# ‏93. `Backtest-to-Live Gap`

‏נמדוד Gap מפורש.

```text
BTL_Gap = LiveMetric - BacktestMetric
```

‏לפי:

- ‏symbol.
- ‏regime.
- ‏order type.
- ‏latency bucket.
- ‏spread bucket.

---

# ‏94. `Model Decay`

‏Edge יכול להיחלש.

‏נמדוד:

```text
current effect size
vs
historical expected effect size
```

‏ונזהה degradation מוקדם.

---

# ‏95. `Research Drift`

‏לא רק השוק משתנה.

‏גם תהליך המחקר יכול להשתנות:

- ‏יותר experiments.
- ‏יותר parameters.
- ‏יותר manual exceptions.
- ‏יותר feature count.

‏זה עצמו יכול להיות סימן ל־overfitting organizationally.

---

# ‏96. `Stop Rules`

‏צריך לדעת גם מתי להפסיק לחקור רעיון.

‏לדוגמה:

```text
3 independent OOS failures
no material effect
high complexity tax
unstable parameter surface
poor live calibration
```

‏אחרת אפשר לבזבז שבועות על רעיון מת.

---

# ‏97. `Research Queue`

‏רעיונות נכנסים ל־queue עם priority.

‏עדיפות גבוהה לרעיונות שמתקנים:

- ‏failure mode שכיח.
- ‏cost משמעותי.
- ‏execution weakness.
- ‏high-confidence missed opportunity.

‏ולא רק לרעיונות “מגניבים”.

---

# ‏98. `Expected Value of Research`

‏אפשר לחשוב:

```text
EV of experiment
≈ probability of meaningful learning
× value of learning
÷ cost of experiment
```

‏כך בוחרים במה לחקור קודם.

---

# ‏99. `Research Debt`

‏דוגמאות:

- ‏Experiments ללא manifest.
- ‏Results ללא code commit.
- ‏Features ללא definition.
- ‏Datasets ללא version.
- ‏Manual cleaning.
- ‏Metrics ללא primary/secondary distinction.

‏Research Debt מסוכן בדיוק כמו Technical Debt.

---

# ‏100. `Reproducibility Gate`

‏לפני Promotion:

```text
Can another clean run reproduce the result?
```

‏אם לא — לא מקדמים.

---

# ‏101. `Independent Re-run`

‏רצוי ש־promotion candidate ירוץ שוב מתהליך נקי:

```text
fresh process
fresh output directory
frozen code
frozen data
same config
```

‏ולא רק reuse של notebook state.

---

# ‏102. `Fresh-Chat / Fresh-Process` Mindset

‏גם מבחינה מחשבתית חשוב לנסות לשחזר את ההחלטה בלי להישען על narrative שנבנה תוך כדי.

‏השאלה:

```text
Would this result still convince us if we saw it for the first time today?
```

---

# ‏103. `Blind Review` Lite

‏לעיתים אפשר להסתיר זמנית את identity של variant A/B בזמן ניתוח metrics.

‏זה מקטין confirmation bias.

---

# ‏104. `Red Team` למחקר

‏לפני promotion נשאל:

- ‏איך התוצאה יכולה להיות מזויפת?
- ‏איפה leakage יכול להסתתר?
- ‏איזה assumption execution אופטימי מדי?
- ‏איזה regime גורם לכל הרווח?
- ‏מה קורה אם costs עולים?
- ‏מה קורה אם latency עולה?

---

# ‏105. `Stress the Assumptions`

‏נריץ sensitivity על:

```text
spread +25%
slippage +50%
latency +50ms
fill probability -20%
impact higher
signal half-life shorter
```

‏Edge שנעלם מיד תחת שינוי קטן הוא שביר.

---

# ‏106. `Conservative Case`

‏לכל Result טוב כדאי להחזיק לפחות:

```text
optimistic
base
conservative
```

‏במיוחד עבור execution assumptions.

---

# ‏107. `Break-Even Analysis`

‏במקום רק לשאול “כמה הרווחנו?”, נשאל:

```text
At what cost does edge become zero?
At what latency does edge become zero?
At what fill rate does edge become zero?
At what impact does edge become zero?
```

‏זה נותן Margin of Safety.

---

# ‏108. `Edge Headroom`

‏נגדיר רעיונית:

```text
EdgeHeadroom = ExpectedNetEdge - BreakEvenBuffer
```

‏ככל שה־headroom קטן, production risk גדול יותר.

---

# ‏109. `Research on Rankings`

‏אצלנו לא מספיק לנבא return של symbol בודד.

‏אנחנו בוחרים Top candidate מכל השוק.

‏לכן צריך לבדוק:

```text
rank correlation
Top1 quality
TopK quality
Top1 gap
rank churn
persistence
winner regret
```

---

# ‏110. `Top-1 Winner's Curse`

‏ה־Rank #1 הוא הקיצוני ביותר במדגם.

‏לכן הוא פגיע במיוחד ל־noise.

‏צריך לבדוק האם rank separation ו־confidence באמת מצדיקים את הבחירה.

---

# ‏111. `Selection Regret`

‏לאחר event אפשר להשוות:

```text
selected candidate outcome
vs
best alternative from valid candidates
```

‏זה עוזר להבין אם הבעיה הייתה market movement או ranking.

---

# ‏112. `No-Trade Research`

‏גם `NO TRADE` הוא output שצריך לחקור.

‏נמדוד:

```text
how often we abstained
what would have happened
false abstention
correct abstention
```

‏אבל counterfactual נשאר uncertainty.

---

# ‏113. `Opportunity Cost`

‏Filter שמגן עלינו יכול גם לגרום לפספוס.

‏לכן כל safety/quality filter צריך להימדד בשני הצדדים:

```text
bad trades prevented
vs
good trades missed
```

---

# ‏114. `False Precision`

‏אם data fidelity הוא 100ms, אין משמעות אמיתית להציג result בדיוק של 1µs.

‏Precision בדוח צריכה להתאים ל־measurement quality.

---

# ‏115. `Known / Inferred / Unknown`

‏Research output צריך להפריד:

```text
KNOWN
INFERRED
UNKNOWN
```

‏לדוגמה hidden liquidity לעיתים inferred בלבד.

‏אסור להציג inference כאילו הוא observed fact.

---

# ‏116. `Uncertainty as Data`

‏אפשר לשמור confidence יחד עם feature/result.

```text
value
confidence
provenance
```

‏ולבדוק האם model performance משתנה לפי confidence bucket.

---

# ‏117. `Research Ethics` טכנית

‏גם בפרויקט אישי, לא משנים Result כדי שייראה טוב.

‏שומרים failures.

‏שומרים assumptions.

‏לא מוחקים inconvenient periods בלי rule.

‏זו משמעת הנדסית.

---

# ‏118. `Performance` של Research Pipeline

‏Pipeline איטי מדי מעודד shortcuts.

‏אבל Pipeline מהיר מדי יכול לעודד אלפי parameter trials.

‏המטרה היא:

```text
fast enough for iteration
controlled enough for discipline
```

---

# ‏119. Caching

‏אפשר cache לשכבות יקרות:

```text
canonical events
features
labels
```

‏אבל cache key חייב לכלול version/config רלוונטיים.

‏אחרת מקבלים stale research artifacts.

---

# ‏120. `Content-Addressed Artifacts`

‏אפשר לזהות artifact לפי hash של:

```text
data version
code version
config
```

‏כך קשה לערבב results מגרסאות שונות בטעות.

---

# ‏121. `Immutable Results`

‏Result קיים לא “מתעדכן”.

‏Experiment חדש יוצר Result חדש.

‏כך נשמר audit trail.

---

# ‏122. `Artifact Bundle`

‏כל Experiment יכול להפיק bundle:

```text
manifest.json
metrics.json
summary.md
charts/
logs/
samples/
failures/
```

‏כך אפשר לבדוק אותו גם חודשים מאוחר יותר.

---

# ‏123. `Sample Inspection`

‏Metrics אינם מספיקים.

‏צריך לפתוח ידנית samples:

- ‏best cases.
- ‏worst cases.
- ‏borderline cases.
- ‏random cases.
- ‏unexpected cases.

‏זה עוזר למצוא bugs ו־artifacts שהממוצע מסתיר.

---

# ‏124. `Case Study` הוא Diagnostic, לא Proof

‏Trade אחד יפה לא מוכיח Edge.

‏Trade אחד גרוע גם לא מפריך Edge.

‏Case studies עוזרים להבין מנגנון, לא להחליף statistics.

---

# ‏125. `Mechanism` חשוב

‏כאשר אפשר, נחפש הסבר מיקרו־מבני סביר:

```text
Why should this feature predict movement?
What participant behavior could create it?
Why should it persist long enough for us?
```

‏Edge ללא mechanism אפשרי אינו פסול, אבל דורש יותר חשדנות.

---

# ‏126. `Mechanism Drift`

‏גם אם mechanism אמיתי, הוא יכול להשתנות כאשר:

- ‏market structure משתנה.
- ‏fees משתנים.
- ‏routing משתנה.
- ‏participants משתנים.
- ‏data source משתנה.

‏לכן צריך monitoring.

---

# ‏127. `Causal Humility`

‏Correlation אינו בהכרח causation.

‏לרובוט לא תמיד צריך causality מלאה כדי להשתמש ב־predictive feature.

‏אבל אסור להמציא סיפור causal כאילו הוכח.

---

# ‏128. `Proxy Features`

‏Feature יכול לעבוד כי הוא proxy למשהו אחר.

‏לדוגמה activity feature אולי בעצם proxy ל־news burst.

‏Ablation/regime analysis יכולים לעזור להבין זאת.

---

# ‏129. `Feature Interaction`

‏Feature חלש לבד יכול להיות חזק בתנאי feature אחר.

‏לדוגמה:

```text
momentum + flow confirmation
book imbalance + low spread
velocity + fresh activity burst
```

‏אבל interactions מגדילים search space ולכן overfitting risk.

---

# ‏130. `Interaction Budget`

‏לא נבדוק כל pair/triple אפשרי ללא הגבלה.

‏נעדיף interactions שיש להן rationale מקצועי.

---

# ‏131. `Monotonicity Check`

‏אם Feature אמור לייצג strength, נבדוק האם outcome משתפר באופן סביר לאורך buckets.

‏לדוגמה:

```text
Q1 < Q2 < Q3 < Q4 < Q5
```

‏לא חייב להיות מושלם, אבל pattern כאוטי דורש הסבר.

---

# ‏132. `Bucket Analysis`

‏נציג Feature לפי deciles/quantiles ונמדוד forward outcomes.

‏זה לעיתים חושף nonlinear behavior טוב יותר מ־correlation יחיד.

---

# ‏133. `Calibration`

‏אם Score אומר confidence גבוה, נבדוק האם success rate באמת גבוה יותר.

‏Rank טוב אינו בהכרח calibrated probability.

---

# ‏134. `Rank Stability`

‏ל־whole-market scanner חשוב לבדוק כמה Rank משתנה בין cycles.

‏Churn גבוה יכול להפוך prediction יפה ל־execution בלתי אפשרי.

---

# ‏135. `Decision Stability`

‏נבדוק:

```text
how often Top1 changes
how long Top1 persists
how often selected symbol remains valid until submit
```

‏זה מחבר Research ל־Latency.

---

# ‏136. `Latency-Aware Research`

‏נריץ את ה־same strategy עם delays שונים:

```text
0ms
25ms
50ms
100ms
250ms
500ms
```

‏כדי להעריך signal decay.

---

# ‏137. `Execution-Aware Research`

‏נשווה:

```text
mid-entry fantasy
ask/bid realistic
marketable-limit simulation
passive fill model
```

‏אם Edge קיים רק ב־mid fantasy, זו אינה Strategy executable.

---

# ‏138. `Cost Shock Test`

‏נגדיל costs מלאכותית.

‏אם תוספת קטנה מוחקת הכל, ה־margin קטן מדי.

---

# ‏139. `Capacity-Aware Research`

‏נבדוק outcomes לפי size buckets ו־participation assumptions.

‏Strategy קטנה יכולה להיות טובה אבל לא scalable.

---

# ‏140. `Exit-Aware Research`

‏אסור לבדוק רק Entry signal.

‏צריך לבדוק אם אפשר לצאת בזמן.

‏במיוחד אצלנו:

```text
time_to_first_profit
peak timing
giveback probability
exit latency
spread at exit
```

---

# ‏141. `Giveback Analysis`

‏אם price הגיע ל־target ואז חזר מהר, זה חשוב מאוד למטרה שלנו.

‏נמדוד:

```text
probability of target reached
probability of keeping target after X ms/s
probability of giveback
```

---

# ‏142. `Stopping Rule Research`

‏נבדוק exits לפי:

- ‏time stop.
- ‏signal decay.
- ‏momentum reversal.
- ‏microstructure deterioration.
- ‏fixed target.
- ‏trailing logic.

‏אך עם אותו discipline נגד overfitting.

---

# ‏143. `Joint Entry/Exit Overfitting`

‏אם מחפשים בו זמנית perfect entry ו־perfect exit, search space מתפוצץ.

‏לכן כדאי לחקור בשלבים.

---

# ‏144. `Hierarchical Research`

‏סדר טוב:

```text
Does signal predict?
→ Is move executable?
→ Can entry capture it?
→ Can exit retain it?
→ Does net edge survive?
```

‏לא מתחילים מ־200 exit parameters לפני שה־signal עצמו הוכח.

---

# ‏145. `Falsification First`

‏בכל רעיון נשאל:

```text
What evidence would convince us this idea is wrong?
```

‏אם אין תשובה, hypothesis אינה מספיק מדעית.

---

# ‏146. `Disconfirming Evidence`

‏נחפש במכוון periods שבהם ה־idea נכשל.

‏מטרתנו להבין גבולות, לא להסתיר failures.

---

# ‏147. `RCA Feeds Research`

‏RCA של Rank #1 failures יכול לייצר hypotheses חדשים.

```text
failure cluster
→ hypothesis
→ controlled experiment
→ result
```

‏כך learning loop נסגר.

---

# ‏148. `Research Feeds Monitoring`

‏כל assumption חשוב במחקר צריך metric live אם אפשר.

‏לדוגמה אם strategy תלויה ב־spread <= X, Production צריך למדוד spread distribution.

---

# ‏149. `Assumption Registry`

‏נשמור assumptions מרכזיים:

```text
signal half-life
expected spread
fill probability
latency budget
impact range
regime dependence
```

‏ונעקוב האם הם עדיין נכונים live.

---

# ‏150. `Research Contract`

‏לכל Strategy version נגדיר:

```text
what it assumes
where it is valid
what invalidates it
what metrics monitor it
```

---

# ‏151. `Known Failure Envelope`

‏Strategy מקצועית יודעת גם איפה לא לסחור.

‏לדוגמה:

```text
spread too wide
freshness low
halt/reopen
latency pressure too high
book unstable
capacity too low
```

---

# ‏152. `Research Scope` לרובוט שלנו

‏אצלנו המחקר המרכזי אינו:

```text
Will this stock rise sometime today?
```

‏אלא:

```text
Among all currently valid symbols,
which candidate has the best executable short-horizon opportunity now,
and can we enter and exit before the edge decays?
```

---

# ‏153. Cross-Sectional Evaluation

‏נבדוק בכל decision time:

```text
Rank 1
Rank 2
Rank 3
...
```

‏ונמדוד outcome לפי rank bucket.

‏אם Rank אינו monotonic עם outcome, scoring דורש בדיקה.

---

# ‏154. `Top-K` Research

‏גם אם מבצעים רק Top1, Top-K נותן מידע.

‏אפשר לראות:

- ‏אם Top1 באמת מיוחד.
- ‏אם Top5 דומים.
- ‏אם separation קטן.
- ‏אם Rank noise גבוה.

---

# ‏155. `Separation Margin`

‏נמדוד:

```text
score1 - score2
score1 - median_top10
```

‏ולבדוק האם separation גדול באמת מנבא confidence גבוה יותר.

---

# ‏156. `Rank Churn Cost`

‏אם Top1 מתחלף כל 50ms, decision latency וה־execution יכולים להפוך את ranking ללא שימושי.

‏נמדוד churn כחלק מ־research.

---

# ‏157. `Persistence` של Candidate

‏נבדוק כמה זמן candidate נשאר:

```text
eligible
Top10
Top3
Top1
```

‏זה feature וגם feasibility metric.

---

# ‏158. `Signal-to-Fill Drift`

‏נשווה state בזמן signal ל־state בזמן fill.

‏אם score/flow/book כבר השתנו מאוד, fill יכול להיות stale.

---

# ‏159. `Latency Pressure` במחקר

‏נשתמש בקונספט משלב 48:

```text
LatencyPressure = EndToEndLatency / SignalHalfLife
```

‏ונבדוק performance לפי buckets של היחס הזה.

---

# ‏160. `Research on Milliseconds-to-Seconds`

‏למרות שאיננו HFT, מחקר horizon קצר צריך timestamp discipline ברמת milliseconds כאשר המקור מאפשר.

‏אבל לא נעמיד פנים שיש לנו precision שלא קיים בפיד.

---

# ‏161. `Microsecond Vanity` Anti-Pattern

‏אופטימיזציה ל־microseconds שאינה משנה realized net outcome היא waste.

‏במחקר נדרוש evidence לפני performance engineering עמוק.

---

# ‏162. `Latency ROI`

‏לכל optimization אפשר למדוד:

```text
latency saved
implementation cost
reliability impact
net edge gained
```

‏כך מחליטים אם שווה להשקיע.

---

# ‏163. `Research around NO TRADE`

‏מטרה מקצועית אינה למקסם מספר עסקאות.

‏אלא למקסם quality של opportunities שנלקחות.

‏לכן abstention quality היא metric אמיתי.

---

# ‏164. `False Positive` מול `False Negative`

‏ב־trade gate:

```text
False Positive = trade taken, no real edge
False Negative = good opportunity rejected
```

‏צריך להבין את העלות של שניהם.

---

# ‏165. `Threshold Curves`

‏במקום לבחור threshold אחד מיד, מציגים:

```text
threshold
→ coverage
→ net edge
→ hit rate
→ opportunity cost
```

‏ומחפשים trade-off יציב.

---

# ‏166. `Precision / Recall` בהקשר מסחר

‏אפשר לחשוב:

```text
precision = quality of taken signals
recall = fraction of good opportunities captured
```

‏אך צריך לתרגם תמיד לכסף/edge ולא להסתפק במונחים של classification.

---

# ‏167. `Utility Function`

‏לעיתים Strategy צריכה לאופטם utility רחבה:

```text
net return
- risk penalty
- latency penalty
- impact penalty
- operational complexity
```

‏לא metric בודד.

---

# ‏168. `Research Governance`

‏גם בפרויקט אישי כדאי לקבוע כללים:

- ‏Experiment naming.
- ‏Versioning.
- ‏Promotion.
- ‏Rollback.
- ‏Data retention.
- ‏Result immutability.

‏הם חוסכים בלבול בהמשך.

---

# ‏169. `Source of Truth`

‏Results מרכזיים צריכים להיות בריפו/registry ולא רק בצ׳אט או בזיכרון.

‏כך research נשאר durable.

---

# ‏170. `Research Review Checklist`

‏לפני שסומכים על Result:

- ‏האם hypothesis נכתב מראש?
- ‏האם baseline frozen?
- ‏האם data point-in-time?
- ‏האם costs realistic?
- ‏האם latency modeled?
- ‏האם execution assumptions documented?
- ‏האם Test untouched?
- ‏האם multiple trials counted?
- ‏האם result robust across periods?
- ‏האם tails acceptable?
- ‏האם reproducible?

---

# ‏171. `Promotion Checklist`

‏לפני production:

- ‏OOS evidence.
- ‏Replay pass.
- ‏Shadow pass.
- ‏Data quality pass.
- ‏Execution realism pass.
- ‏Latency budget pass.
- ‏Risk gates defined.
- ‏Monitoring ready.
- ‏Rollback ready.

---

# ‏172. `Kill Criteria`

‏Strategy/feature צריך לצאת מ־production אם:

```text
edge decays materially
live/backtest gap grows
latency pressure worsens
costs erase headroom
data quality degrades
failure modes exceed limits
```

---

# ‏173. `No Sacred Features`

‏אין Feature שחסין מבדיקה מחדש.

‏גם feature שהיה מצוין לפני חצי שנה יכול להפסיק לעבוד.

---

# ‏174. `No Sacred Parameters`

‏Parameter קיים אינו אמת טבעית.

‏הוא configuration שנבחר תחת evidence מסוים.

---

# ‏175. `No Sacred Narrative`

‏אם data סותר את הסיפור שלנו, מעדכנים את הסיפור.

‏לא את הנתונים.

---

# ‏176. Practitioner Secret — `Pretty Equity Curve` היא ראיה חלשה

‏Equity Curve יפה יכולה להיווצר מ:

- ‏leakage.
- ‏survivorship.
- ‏optimistic fills.
- ‏hidden parameter search.
- ‏one regime.
- ‏few lucky episodes.

‏תמיד יורדים לשכבות שמתחתיה.

---

# ‏177. Practitioner Secret — `Best Parameter` הוא בדרך כלל פחות מעניין מה־Neighborhood

‏מקצוען מסתכל אם סביבת הפרמטר עובדת.

‏Sharp optimum הוא warning.

---

# ‏178. Practitioner Secret — `No Fill` הוא Data

‏Order שלא התמלא אינו רק “עסקה שלא קרתה”.

‏הוא מלמד על:

- ‏queue.
- ‏adverse selection.
- ‏opportunity cost.
- ‏execution feasibility.

---

# ‏179. Practitioner Secret — Fills and Non-Fills חייבים להיבדק יחד

‏אחרת מתקבל selection bias חמור.

‏Passive fills עשויים לקרות דווקא במצבים רעילים.

---

# ‏180. Practitioner Secret — `Good Prediction` יכולה להיות `Bad Strategy`

‏אם movement צפוי קטן מה־round-trip friction, predictive model טוב עדיין אינו tradable.

---

# ‏181. Practitioner Secret — `Small Improvements` מצטברים רק אם אינם correlated failures

‏חמישה features חלשים מאותו מקור מידע אינם חמש Evidence בלתי תלויות.

---

# ‏182. Practitioner Secret — שינוי Data Provider הוא Research Event

‏Feed אחר יכול לשנות:

- ‏timestamps.
- ‏coverage.
- ‏trade classification.
- ‏quotes.
- ‏latency.

‏לא מחליפים provider ומניחים שהמודל זהה.

---

# ‏183. Practitioner Secret — שינוי Broker הוא Research Event

‏Fill behavior, routing, fees ו־latency יכולים להשתנות.

‏גם אם Strategy logic נשאר אותו דבר.

---

# ‏184. Practitioner Secret — Infrastructure Changes יכולים לשנות Alpha

‏אם pipeline נהיה איטי ב־80ms, short-horizon edge יכול להשתנות.

‏לכן performance regressions הם גם research regressions.

---

# ‏185. Practitioner Secret — `Operational Reliability` היא חלק מה־Expected Value

‏Strategy שמרוויחה 10 bps בתיאוריה אך נכשלת 5% מהזמן במצב orders אינה טובה יותר בהכרח מ־Strategy פשוטה ויציבה.

---

# ‏186. Practitioner Secret — `Edge` הוא Distribution

‏לא מספר יחיד.

‏צריך להבין:

```text
when
where
how often
how large
how fragile
```

---

# ‏187. Practitioner Secret — Most Research Wins Should Be Boring

‏שיפור מקצועי לעיתים נראה כמו:

```text
slightly better net edge
slightly lower tail risk
more stable regimes
less latency
fewer unknown states
```

‏ולא הכפלת רווחים בגרף אחד.

---

# ‏188. Practitioner Secret — `Unknown` עדיף על Confidence מזויף

‏אם data fidelity לא מאפשר לדעת queue position, מסמנים unknown/estimated.

‏לא ממציאים certainty.

---

# ‏189. Practitioner Secret — `Research Speed` לא שווה `Learning Speed`

‏אלף ניסויים ביום יכולים לייצר פחות ידע מעשרה ניסויים מתוכננים היטב.

---

# ‏190. Practitioner Secret — `Best Backtest` אינו היעד

‏היעד הוא:

```text
best robust live net outcome
```

---

# ‏191. Anti-Pattern — `Parameter Hunting`

‏מריצים thresholds עד שמוצאים אחד יפה.

‏פתרון:

- ‏budget.
- ‏surface analysis.
- ‏holdout.
- ‏record all trials.

---

# ‏192. Anti-Pattern — `Metric Shopping`

‏אם hit rate לא השתפר, עוברים ל־MFE.

‏אם MFE לא השתפר, עוברים ל־Top1 accuracy.

‏כך תמיד מוצאים משהו.

‏פתרון: primary metric מראש.

---

# ‏193. Anti-Pattern — `Data Cleaning after Seeing PnL`

‏מסירים ימים שהורסים performance.

‏פתרון: objective data-quality rules לפני evaluation.

---

# ‏194. Anti-Pattern — `Changing Several Things at Once`

‏אז אי אפשר לדעת מה עזר.

---

# ‏195. Anti-Pattern — `Perfect Fill Backtest`

‏כל signal מתמלא בדיוק במחיר שרצינו.

‏זה כמעט תמיד אופטימי מדי.

---

# ‏196. Anti-Pattern — `Ignoring Latency`

‏Feature מצוין בזמן event אבל מגיע מאוחר מדי בפועל.

---

# ‏197. Anti-Pattern — `Ignoring No-Trade Days`

‏אם Strategy פועלת רק כשנוח לנו לבדוק, evaluation מוטה.

---

# ‏198. Anti-Pattern — `Using Today’s Universe for History`

‏זה survivorship bias.

---

# ‏199. Anti-Pattern — `Silent Model Changes`

‏שינוי feature definition בלי versioning שובר comparability.

---

# ‏200. Anti-Pattern — `One Beautiful Day`

‏יום אחד מוצלח אינו evidence.

---

# ‏201. Anti-Pattern — `Huge Sample from One Event`

‏אלפי snapshots מאותו burst אינם אלפי opportunities עצמאיות.

---

# ‏202. Anti-Pattern — `Ignoring Opportunity Cost`

‏Passive strategy יכולה להראות price improvement יפה רק על fills, תוך התעלמות מהמהלכים שפספסה.

---

# ‏203. Anti-Pattern — `Ignoring Complexity Cost`

‏Feature שמוסיף 2 bps ב־Backtest אבל 50ms latency ו־failure modes יכול להיות downgrade.

---

# ‏204. Anti-Pattern — `Backtest as Truth`

‏Backtest הוא model of reality.

‏לא המציאות עצמה.

---

# ‏205. תהליך המחקר המומלץ אצלנו

```text
Observation
→ Hypothesis
→ Pre-register experiment
→ Freeze baseline
→ Build point-in-time dataset
→ Run baseline/challenger
→ OOS validation
→ Robustness/stress tests
→ RCA
→ Decision record
→ Replay
→ Shadow
→ Small live
→ Calibration
```

---

# ‏206. Baseline ראשוני לרובוט שלנו

‏בכל רעיון חדש נרצה קודם לבדוק:

1. ‏האם הוא משפר prediction.
2. ‏האם הוא משפר cross-sectional ranking.
3. ‏האם הוא נשאר שימושי אחרי latency.
4. ‏האם movement executable.
5. ‏האם costs משאירים net edge.
6. ‏האם הוא יציב בין ימים/regimes.
7. ‏האם הוא משנה החלטות בפועל.

---

# ‏207. Experiment Template מומלץ

```text
Experiment ID:
Hypothesis:
Mechanism/Rationale:
Baseline:
Challenger:
Dataset Version:
Universe Version:
Code Commit:
Train Window:
Validation Window:
Test Window:
Primary Metric:
Secondary Metrics:
Cost Model:
Latency Model:
Fill Model:
Planned Variants:
Acceptance Criteria:
Failure Criteria:
Known Limitations:
Result:
Decision:
Follow-up:
```

---

# ‏208. Result Summary Template

```text
Primary metric delta:
Coverage delta:
Tail-risk delta:
Latency delta:
Execution-quality delta:
Robustness result:
OOS result:
Regime result:
Reproducibility status:
Decision:
```

---

# ‏209. `RCA Questions` לניסוי שנכשל

‏נשאל:

- ‏האם hypothesis עצמו היה שגוי?
- ‏האם feature implementation שגוי?
- ‏האם data fidelity לא מספקת?
- ‏האם signal קיים אבל decay מהיר מדי?
- ‏האם execution מוחק אותו?
- ‏האם effect קיים רק ב־regime מסוים?
- ‏האם sample קטן מדי?
- ‏האם result הראשון היה Winner's Curse?

---

# ‏210. `RCA Questions` לניסוי שהצליח

‏גם הצלחה צריך לתקוף:

- ‏האם leakage אפשרי?
- ‏כמה trials קדמו לזה?
- ‏האם Test באמת untouched?
- ‏האם performance מרוכז בכמה ימים?
- ‏האם parameter surface יציב?
- ‏האם costs conservative?
- ‏האם live feasibility סבירה?

---

# ‏211. `Promotion Reason Codes`

```text
PR_VALIDATED_OOS
PR_ROBUST_PARAMETERS
PR_EXECUTABLE_NET_EDGE
PR_STABLE_ACROSS_REGIMES
PR_LOW_COMPLEXITY_COST
```

---

# ‏212. `Rejection Reason Codes`

```text
RJ_NO_OOS_EDGE
RJ_LEAKAGE_RISK
RJ_UNSTABLE_PARAMETERS
RJ_COSTS_ERASE_EDGE
RJ_LATENCY_ERASES_EDGE
RJ_EXECUTION_UNREALISTIC
RJ_LOW_COVERAGE
RJ_COMPLEXITY_TOO_HIGH
RJ_INSUFFICIENT_SAMPLE
```

---

# ‏213. `Research More` Reason Codes

```text
RM_NEEDS_MORE_DAYS
RM_REGIME_DEPENDENT
RM_FILL_MODEL_UNCERTAIN
RM_DATA_QUALITY_UNCERTAIN
RM_LIVE_CALIBRATION_NEEDED
```

---

# ‏214. Monitoring של Assumptions אחרי Promotion

‏נרצה dashboards ל:

```text
signal effect size
coverage
latency pressure
spread distribution
fill rate
markout
costs
rank stability
live-vs-backtest gap
```

---

# ‏215. `Research → Production Contract`

‏Feature שעובר production צריך להגיע עם:

```text
definition
version
expected range
staleness rule
failure behavior
monitoring metrics
rollback behavior
```

---

# ‏216. `Data Contract`

‏כל input חשוב צריך להגדיר:

```text
schema
units
timestamps
ordering
missing semantics
freshness
source
```

‏כך Research ו־Production אינם מפרשים אותו Field אחרת.

---

# ‏217. `Label Contract`

‏כל label יגדיר:

```text
reference price
forward horizon
entry convention
exit convention
cost inclusion
halt handling
missing handling
```

---

# ‏218. `Metric Contract`

‏כל metric יגדיר במדויק:

```text
formula
sample unit
aggregation
inclusion rules
exclusion rules
units
```

‏אחרת שני charts יכולים לקרוא לאותו דבר בשם זהה אך לחשב אחרת.

---

# ‏219. `Research Clock`

‏נזהה איזה clock משמש לכל חישוב.

‏במערכת קצרה מאוד, ערבוב exchange time ו־received time יכול לשנות conclusion.

---

# ‏220. `Real-Time Feasibility Gate`

‏לפני Promotion צריך להוכיח:

```text
feature can be computed on time
ranking can finish on time
decision can be made on time
order can be submitted on time
signal remains valid
```

---

# ‏221. `Economic Feasibility Gate`

```text
predicted edge
> expected round-trip friction
+ safety buffer
```

‏אחרת אין טעם ב־prediction יפה.

---

# ‏222. `Operational Feasibility Gate`

‏נבדוק:

- ‏state recovery.
- ‏reconnect.
- ‏duplicate protection.
- ‏unknown order handling.
- ‏monitoring.
- ‏kill switches.

‏Research שלא ניתן להפעיל בבטחה אינו production-ready.

---

# ‏223. `Research Backlog` לפי שכבות

‏נארגן רעיונות לפי:

```text
Prediction
Ranking
Entry
Execution
Exit
Risk
Data
Latency
Operations
```

‏כך לא מתרכזים רק ב־signal features ומתעלמים מהיכן שהכסף באמת אובד.

---

# ‏224. לפעמים השיפור הטוב ביותר אינו Feature חדש

‏יכול להיות שהשיפור הגדול יותר יגיע מ:

- ‏פחות stale decisions.
- ‏better fill logic.
- ‏faster exit.
- ‏lower spread selection.
- ‏better no-trade gate.
- ‏better recovery.

‏Research צריך להיות end-to-end.

---

# ‏225. `Edge Decomposition`

‏ננסה לפרק:

```text
Prediction Edge
+ Ranking Edge
+ Timing Edge
+ Execution Edge
- Costs
- Adverse Selection
- Latency Loss
- Impact
= Realized Net Edge
```

‏כך רואים איפה באמת נוצר או אובד הערך.

---

# ‏226. `Research Priority` לפי Lost Edge

‏אם RCA מראה ש־80% מה־loss מגיע מ־exit latency, אין הגיון להשקיע חודש ב־Feature עשירי ל־ranking.

---

# ‏227. `Attribution` לפני Optimization

‏קודם מודדים איפה הבעיה.

‏אחר כך משפרים.

‏לא להפך.

---

# ‏228. `Reproducible RCA`

‏גם RCA צריך להיות ניתן לשחזור מה־event journal, market data ו־decision snapshot.

---

# ‏229. `Canonical Experiment Dataset`

‏למחקרים חשובים נרצה dataset canonical שממנו כל researcher/tool מייצר אותן features.

‏זה מפחית discrepancies.

---

# ‏230. `Research and Production Parity`

‏ככל האפשר, אותו feature code או אותה semantic implementation צריכים לשמש Research ו־Live.

‏שתי implementations שונות הן מקור ל־drift.

---

# ‏231. `Backtest Engine` אינו מקום להעתיק Strategy Logic

‏עדיף share components או contracts כך שה־logic אינו מתפצל לשתי גרסאות בלתי תלויות.

---

# ‏232. `Replay` הוא גשר

‏Replay מאפשר להריץ production-like code על historical event stream.

‏זה כלי מרכזי לצמצום Research/Live gap.

---

# ‏233. `Shadow` הוא Calibration Layer

‏Shadow מאפשר לבדוק timing/data availability בעולם אמיתי ללא execution risk.

---

# ‏234. `Small Live` הוא Measurement Tool

‏Small live אינו רק “להתחיל לסחור”.

‏הוא ניסוי למדידת:

- ‏fills.
- ‏latency.
- ‏routing.
- ‏markout.
- ‏broker behavior.

‏בגודל מבוקר.

---

# ‏235. `Live Data` חוזר למחקר

‏Realized fills ו־latency distributions צריכים לעדכן את Backtest models.

‏כך נוצר learning loop.

---

# ‏236. `Model of Reality` משתפר לאורך זמן

```text
Backtest assumptions
→ Shadow evidence
→ Live evidence
→ Calibration
→ Better backtest
```

---

# ‏237. `Evidence Ladder`

‏רמת confidence עולה כך:

```text
intuition
< exploratory correlation
< controlled backtest
< OOS validation
< replay
< shadow
< paper
< small live
< repeated live evidence
```

‏אין שלב יחיד שמוכיח הכל.

---

# ‏238. `Research Confidence` אינו בינארי

‏אפשר לסמן:

```text
LOW
MEDIUM
HIGH
```

‏לפי quality וכמות evidence.

---

# ‏239. `Evidence Decay`

‏Evidence ישן יכול לאבד relevance.

‏צריך לדעת מתי Experiment האחרון המאמת בוצע.

---

# ‏240. `Revalidation Schedule`

‏Features חשובים צריכים revalidation תקופתי או trigger-based כאשר יש drift.

---

# ‏241. `Drift Trigger`

‏Trigger אפשרי:

```text
feature distribution shifted
live markout worsened
spread regime changed
latency pressure increased
provider changed
broker changed
```

---

# ‏242. `No Silent Auto-Retuning`

‏מערכת לא צריכה לשנות parameters live בלי audit/versioning אלא אם תוכננה לכך במפורש ונבדקה לעומק.

---

# ‏243. `Automated Research` דורש Guardrails חזקים יותר

‏אם בעתיד AI/optimizer מריץ אלפי experiments, multiple-testing ו־data-snooping risk גדלים מאוד.

‏צריך budget, holdouts ו־promotion gates קשיחים.

---

# ‏244. `AI Research Assistant` לא מחליף Evidence

‏AI יכול:

- ‏להציע hypotheses.
- ‏לזהות anomalies.
- ‏לסכם RCA.
- ‏לכתוב experiments.

‏אבל result חייב לעבור אותם validation rules.

---

# ‏245. `Narrative Generation` אחרי Evidence

‏קודם Result.

‏אחר כך הסבר.

‏לא בונים narrative ואז מחפשים data שתומך בו.

---

# ‏246. `Research Documentation` קצרה אך מספקת

‏לא צריך מסמכים ענקיים לכל ניסוי.

‏צריך את המידע שמאפשר:

```text
reproduce
understand
compare
decide
```

---

# ‏247. `Definition of Done` לניסוי

‏Experiment אינו Done עד שיש:

- ‏Manifest.
- ‏Result.
- ‏Primary metric.
- ‏Baseline comparison.
- ‏OOS/robustness status.
- ‏Decision.
- ‏Known limitations.
- ‏Next action.

---

# ‏248. `Definition of Done` ל־Feature

‏Feature אינו Done כי הוא computed.

‏הוא צריך:

- ‏Definition.
- ‏Tests.
- ‏Point-in-time proof.
- ‏Predictive evaluation.
- ‏Decision impact.
- ‏Latency cost.
- ‏Monitoring.

---

# ‏249. `Definition of Done` ל־Strategy Change

‏צריך:

```text
validated evidence
execution feasibility
risk review
replay/shadow evidence
observability
rollback
```

---

# ‏250. Baseline מעשי שאנחנו נאמץ

‏בשלב ראשון למערכת שלנו:

1. ‏כל Experiment משמעותי מקבל ID.
2. ‏Baseline קפוא.
3. ‏שינוי מכוון אחד ככל האפשר.
4. ‏Dataset/Universe/Code/Config versioned.
5. ‏Primary metric מוגדר מראש.
6. ‏Net ולא Gross בלבד.
7. ‏Train/Validation/Test לפי זמן.
8. ‏Walk-forward למחקרים חשובים.
9. ‏Sensitivity ו־regime checks.
10. ‏Result נשמר גם אם נכשל.
11. ‏Promotion רק לאחר Replay/Shadow.
12. ‏Live evidence חוזר ל־calibration.

---

# ‏251. Checklist קצר לפני שאני מאמין ל־Backtest

- ‏האם הוא point-in-time?
- ‏האם universe היסטורי נכון?
- ‏האם test untouched?
- ‏האם counting של trials ידוע?
- ‏האם fills ריאליסטיים?
- ‏האם costs מלאים?
- ‏האם latency modeled?
- ‏האם sample עצמאי מספיק?
- ‏האם result יציב סביב parameters?
- ‏האם result חוזר בתקופות שונות?
- ‏האם ניתן לשחזר אותו?

---

# ‏252. מה צריך לזכור בעל פה

1. ‏`Backtest != Reality`.
2. ‏`Exploration != Validation`.
3. ‏`Best Result != True Edge`.
4. ‏`Gross Edge != Executable Net Edge`.
5. ‏`Large Sample != Independent Sample`.
6. ‏`Good Fill Rate != Good Execution`.
7. ‏`One Good Period != Robust Strategy`.
8. ‏`Reproducibility` היא תנאי לאמון.
9. ‏כל trial שניסינו הוא חלק מהסיפור.
10. ‏`NO TRADE` יכול להיות output נכון.

---

# ‏253. משפט הסיכום

> ‏**Quant Research מקצועי אינו תחרות למצוא את הגרף הכי יפה. הוא תהליך שמנסה להרוס את הרעיון שלנו שוב ושוב — ורק אם ה־Edge שורד Data נכון, זמן נכון, Costs, Latency, Execution, Holdout, Regimes ו־Reproduction, הוא מקבל זכות להתקדם שלב נוסף לכיוון Production.**

---

# ‏254. מעבר לשלב הבא

‏בשלב הבא נעבור ל־`Scanner Best Practices`.

‏שם נחבר את עקרונות המחקר אל מנוע שסורק אלפי symbols בזמן אמת: architecture, incremental computation, candidate funnels, Top-N deep analysis, freshness, deterministic ranking, backpressure, load shedding, diagnosability ו־failure isolation — בלי להתחיל עדיין את הפרק הזה כאן.
