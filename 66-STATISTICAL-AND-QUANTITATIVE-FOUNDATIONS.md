# ‏שלב 66 — `Statistical and Quantitative Foundations`: הבסיס הסטטיסטי למחקר Algo מקצועי

> ‏מטרת הפרק: לבנות את הבסיס הסטטיסטי והכמותי הדרוש כדי לחקור Signal, Features, Ranking, Vetoes, Execution ו־Live Results בלי לבלבל Noise עם Edge. נלמד איך למדוד מרכז, פיזור, התפלגות, הסתברות מותנית, תלות, אי־ודאות, מובהקות, Effect Size, Multiple Testing, Non-Stationarity ו־Sampling — ונחבר כל כלי ישירות ל־Short-Horizon Momentum ול־Scanner שלנו.
>
> ‏העיקרון המרכזי: **Quantitative Research אינו “לחשב הרבה מספרים”. הוא לדעת מה בדיוק נמדד, מה האוכלוסייה שאליה מותר להכליל, כמה אי־ודאות יש באומדן, ואיזו טעות סטטיסטית יכולה לגרום לנו לחשוב שיש Edge כשבעצם מדדנו Noise.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. למה סטטיסטיקה היא שכבת הגנה מפני Self-Deception

‏ב־Algo Research כמעט תמיד אפשר למצוא משהו שנראה מעניין.

‏אם נבדוק מספיק:

- ‏Symbols.
- ‏Horizons.
- ‏Features.
- ‏Thresholds.
- ‏Time windows.
- ‏Regimes.
- ‏Entry rules.
- ‏Exit rules.

‏בסוף נמצא גם תוצאה יפה במקרה.

‏לכן השאלה המקצועית אינה:

```text
Did I find a good result?
```

‏אלא:

```text
How likely is this result to survive new data,
realistic execution,
and a different market regime?
```

---

# ‏2. Population מול Sample

‏`Population` היא התופעה האמיתית שאותה אנחנו רוצים להבין.

‏למשל:

```text
All future short-horizon momentum opportunities
under conditions similar to the intended production system
```

‏אבל יש לנו רק `Sample`:

```text
historical observations
from specific dates
specific symbols
specific regimes
specific data provider
specific execution assumptions
```

‏כל מסקנה היא ניסיון ללמוד על Population מתוך Sample מוגבל.

‏זו הסיבה שכל metric חייב להגיע עם שאלה:

```text
How representative is this sample?
```

---

# ‏3. Observation אינו בהכרח Trade

‏צריך להחליט מהי יחידת המדגם.

‏אפשר למדוד:

- ‏Tick.
- ‏Quote update.
- ‏Trade print.
- ‏Scanner decision.
- ‏Candidate episode.
- ‏Entry attempt.
- ‏Fill.
- ‏Completed round trip.

‏הבחירה משנה את הסטטיסטיקה.

‏לדוגמה, מיליון ticks מאותה Episode אינם מיליון דוגמאות עצמאיות.

---

# ‏4. Independence היא הנחה חזקה מאוד

‏הרבה נוסחאות סטטיסטיות בסיסיות מניחות שהדוגמאות בלתי תלויות.

‏ב־Market Data זה כמעט אף פעם לא נכון לחלוטין.

‏יש:

- ‏Autocorrelation.
- ‏Volatility clustering.
- ‏Repeated observations מאותה מניה.
- ‏Repeated observations מאותו Market Event.
- ‏Overlapping forward horizons.
- ‏Common market factor.

‏לכן `N = 100,000` אינו בהכרח `100,000 independent samples`.

---

# ‏5. Effective Sample Size

‏כאשר observations תלויות זו בזו, המדגם האפקטיבי קטן מהמספר הגולמי.

‏רעיונית:

```text
Raw N = 100,000
Effective N << 100,000
```

‏במחקר שלנו כדאי לחשוב גם ברמת:

- ‏Independent days.
- ‏Independent episodes.
- ‏Independent symbols.
- ‏Independent regimes.

‏ולא רק במספר rows.

---

# ‏6. Mean

‏הממוצע:

```text
mean = sum(x_i) / N
```

‏שימושי כאשר רוצים Expected Value.

‏אבל הוא רגיש מאוד ל־outliers.

‏במסחר קצר, מספר קטן של מהלכים גדולים יכול להזיז Mean בצורה דרמטית.

---

# ‏7. Median

‏`Median` היא התצפית האמצעית.

‏היא פחות רגישה לזנבות קיצוניים.

‏לכן תמיד כדאי להסתכל לפחות על:

```text
Mean
Median
Quantiles
```

‏ולא רק על Mean.

---

# ‏8. Quantiles

‏Quantiles אומרים לנו איך ההתפלגות נראית מעבר לממוצע.

‏לדוגמה:

```text
P10
P25
P50
P75
P90
P95
P99
```

‏במערכת קצרה חשוב במיוחד לבדוק גם tails של:

- ‏Return.
- ‏Slippage.
- ‏Latency.
- ‏Time-to-Fill.
- ‏Time-to-Flat.
- ‏MAE.

---

# ‏9. Variance ו־Standard Deviation

‏Variance מודדת פיזור סביב Mean.

```text
Var(X) = E[(X - E[X])^2]
```

‏`Standard Deviation` היא השורש של Variance.

‏היא באותן יחידות של X ולכן קלה יותר לפרשנות.

---

# ‏10. Variance אינה Risk מלא

‏שתי אסטרטגיות יכולות לקבל אותה Standard Deviation אבל tails שונים מאוד.

‏לכן Risk Analysis צריך לכלול גם:

- ‏Quantiles.
- ‏Worst cases.
- ‏Drawdowns.
- ‏Tail frequency.
- ‏MAE.
- ‏Time-to-Recovery.

---

# ‏11. Skewness

‏Skewness מודדת אסימטריה.

‏אפשר לקבל Distribution שבו:

```text
many small wins
few large losses
```

‏או ההפך.

‏Mean לבדו לא מספר את הסיפור הזה.

---

# ‏12. Kurtosis ו־Fat Tails

‏Financial returns נוטים להציג tails כבדים יותר מ־Normal idealized model.

‏המשמעות:

- ‏Extreme events נפוצים יותר ממה ש־Gaussian intuition מציעה.
- ‏Thresholds המבוססים רק על Standard Deviation עלולים לתת ביטחון שווא.

---

# ‏13. Histogram

‏Histogram הוא כלי פשוט אבל חשוב.

‏במקום לשאול רק:

```text
Average forward return = ?
```

‏נשאל גם:

```text
What does the full distribution look like?
```

---

# ‏14. Empirical Distribution

‏במחקר Algo לעיתים עדיף להשתמש בהתפלגות אמפירית במקום להניח Normality.

‏כלומר:

```text
use observed quantiles
instead of assuming Gaussian tails
```

---

# ‏15. Expected Value

‏Expected Value הוא ממוצע משוקלל הסתברותית.

```text
EV = Σ probability(outcome) × payoff(outcome)
```

‏במסחר אפשר לחשוב רעיונית:

```text
Expected Net Outcome
= P(win) × AvgWin
- P(loss) × AvgLoss
- costs
```

‏אבל זה עדיין פישוט כי outcomes אינם בהכרח binary.

---

# ‏16. Hit Rate אינו מספיק

‏מערכת יכולה להיות נכונה ב־70% מהפעמים ולהפסיד אם ההפסדים גדולים יותר.

‏ומערכת יכולה להיות נכונה בפחות מ־50% ולהיות חיובית אם payoff asymmetry טובה.

‏לכן:

```text
Accuracy != Edge
```

---

# ‏17. Conditional Expectation

‏אחת השאלות החשובות ביותר במחקר שלנו היא:

```text
E[FutureReturn | CurrentConditions]
```

‏כלומר:

‏מה Expected Outcome **בהינתן** מצב מסוים.

‏לדוגמה:

```text
E[5s return | high momentum, high activity, tight spread]
```

---

# ‏18. Conditional Probability

‏במקום:

```text
P(price rises)
```

‏נרצה:

```text
P(price rises | signal state)
```

‏או:

```text
P(target reached before stop | signal state)
```

---

# ‏19. Base Rate

‏לפני שמתרשמים מ־Signal צריך לדעת מה קורה בלי Signal.

‏אם 58% מהמקרים עולים גם ללא Feature מסוים, תוצאה של 60% אינה בהכרח מרשימה.

‏צריך להשוות מול Baseline.

---

# ‏20. Bayes — הרעיון החשוב

‏Bayesian thinking אומר:

```text
Posterior belief
= Prior belief updated by new evidence
```

‏לא חייבים לבנות Bayesian model מלא כדי להשתמש ברעיון.

‏המסר הוא:

‏Evidence חדש צריך לעדכן אמונה קיימת, לא למחוק את כל מה שידענו קודם.

---

# ‏21. Rare Events ו־Base-Rate Fallacy

‏אם אירוע טוב נדיר מאוד, classifier שנראה “מדויק” יכול להיות חסר ערך.

‏לדוגמה:

```text
99.5% = no exceptional move
0.5%  = exceptional move
```

‏מודל שאומר תמיד “לא” יקבל Accuracy של 99.5%.

‏לכן Accuracy אינה metric טוב לבדה.

---

# ‏22. Precision ו־Recall

‏כאשר אנחנו מחפשים Candidates נדירים:

```text
Precision = among selected candidates, how many were actually good?
Recall    = among all good opportunities, how many did we capture?
```

‏במערכת שלנו Precision עשוי להיות חשוב יותר מ־Recall אם `NO TRADE` הוא outcome תקין.

---

# ‏23. False Positive מול False Negative

‏`False Positive`:

‏נכנסנו למועמד שנראה טוב אבל לא היה.

‏`False Negative`:

‏פסלנו הזדמנות שהייתה טובה.

‏העלות הכלכלית של שתי הטעויות אינה סימטרית.

---

# ‏24. Cost-Sensitive Evaluation

‏במקום לספור טעויות באותה משקל, אפשר לחשוב:

```text
Expected Decision Cost
= FP × Cost_FP
+ FN × Cost_FN
```

‏זה מתאים במיוחד ל־Veto Engine שלנו.

---

# ‏25. Covariance

‏Covariance מודדת האם שני משתנים נוטים לזוז יחד.

‏אבל היא תלויה בסקאלה.

‏לכן לעיתים קרובות משתמשים ב־Correlation.

---

# ‏26. Correlation

‏Correlation מנרמלת את Covariance.

```text
-1 <= corr(X,Y) <= 1
```

‏אבל:

```text
Correlation != Causation
```

‏וגם:

```text
Zero linear correlation != no relationship
```

---

# ‏27. Pearson מול Spearman

‏`Pearson` מודד בעיקר תלות ליניארית.

‏`Spearman` בודק monotonic rank relationship.

‏ב־Ranking research, Spearman יכול להיות שימושי במיוחד כאשר Scale פחות חשובה מהסדר.

---

# ‏28. Correlation Matrix

‏כאשר Features רבים מאוד מתואמים, אנחנו עלולים לחשוב שיש לנו כמה מקורות Evidence כאשר למעשה יש מקור אחד משוכפל.

‏לכן Feature Review צריך לבדוק:

```text
Correlation
Redundancy
Incremental Value
```

---

# ‏29. Partial Correlation — הרעיון

‏לפעמים X ו־Y נראים קשורים רק בגלל Z.

‏לדוגמה:

```text
Momentum ↔ FutureReturn
```

‏אבל הקשר אולי משתנה לחלוטין אחרי שליטה ב־Liquidity או Market Regime.

---

# ‏30. Regression — מה אנחנו מנסים לעשות

‏Regression מנסה לקשור Outcome למשתנים מסבירים.

```text
Y = β0 + β1 X1 + β2 X2 + ... + ε
```

‏המטרה אינה רק Prediction.

‏אפשר להשתמש בה גם כדי להבין:

- ‏Direction.
- ‏Magnitude.
- ‏Conditional relationships.
- ‏Residual behavior.

---

# ‏31. Coefficient אינו אמת אוניברסלית

‏`β1 = 0.4` תלוי:

- ‏Scale.
- ‏Sample.
- ‏Regime.
- ‏Other features.
- ‏Model assumptions.

‏אסור לפרש coefficient בלי ההקשר הזה.

---

# ‏32. Residual

‏Residual הוא:

```text
Actual - Predicted
```

‏Residual Analysis עוזר להבין איפה המודל נכשל.

‏אפשר לבדוק Residual לפי:

- ‏Volatility.
- ‏Liquidity.
- ‏Spread.
- ‏Time-of-day.
- ‏Market regime.

---

# ‏33. Heteroskedasticity

‏לעיתים Variance של error משתנה עם מצב השוק.

‏לדוגמה:

‏ב־high volatility גם prediction error יכול לגדול.

‏לכן constant-error assumptions עלולות להיות שגויות.

---

# ‏34. Non-Linearity

‏Feature יכול להיות טוב רק בטווח מסוים.

‏לדוגמה:

```text
medium activity increase = positive
extreme activity spike   = unstable/toxic
```

‏לכן כדאי לבדוק bins, quantiles ו־response curves ולא רק coefficient ליניארי.

---

# ‏35. Interaction Effects

‏לפעמים Feature A טוב רק כאשר Feature B נמצא במצב מסוים.

```text
Momentum × Liquidity
Momentum × Spread
Flow × PriceResponse
```

‏Interaction יכול להיות חשוב יותר מכל Feature בנפרד.

---

# ‏36. Confounding

‏Confounder הוא משתנה שמשפיע גם על Feature וגם על Outcome.

‏לדוגמה:

‏Market-wide move יכול לגרום גם ל־stock momentum וגם ל־future return.

‏אם לא ננטרל context, נחשוב שמצאנו stock-specific edge.

---

# ‏37. Statistical Significance מול Economic Significance

‏Result יכול להיות statistically significant אבל economically useless.

‏למשל:

```text
Average edge = +0.3 bps
Round-trip friction = 4 bps
```

‏מבחינתנו:

```text
Economic Significance > p-value alone
```

---

# ‏38. Effect Size

‏Effect Size שואל:

```text
How large is the effect?
```

‏ולא רק:

```text
Is it distinguishable from zero?
```

‏במערכת מסחר זה קריטי.

---

# ‏39. Standard Error

‏Standard Error מודדת אי־ודאות באומדן.

‏Mean שנמדד על Sample קטן מגיע עם uncertainty גבוהה יותר.

‏ככל שהדוגמאות פחות עצמאיות, uncertainty האמיתית גדולה יותר.

---

# ‏40. Confidence Interval

‏במקום:

```text
Mean = 5 bps
```

‏עדיף לחשוב:

```text
Estimated mean = 5 bps
with uncertainty interval
```

‏הטווח מזכיר לנו שהאומדן אינו מספר מדויק מהטבע.

---

# ‏41. Hypothesis Testing

‏מבנה בסיסי:

```text
H0 = no effect
H1 = effect exists
```

‏אבל המבחן תלוי בהנחות.

‏אם ההנחות שגויות, גם p-value יכול להטעות.

---

# ‏42. p-value

‏p-value אינו:

```text
Probability that H0 is true
```

‏הוא קשור להסתברות לראות תוצאה לפחות קיצונית תחת H0 והנחות המבחן.

‏זו הבחנה חשובה.

---

# ‏43. p-hacking

‏אם מנסים מספיק:

```text
features
thresholds
horizons
subsets
```

‏נמצא תוצאה “מובהקת” גם במקרה.

‏לכן יש לתעד Experiment Search Space.

---

# ‏44. Multiple Testing

‏אם בדקנו 1,000 רעיונות, ה־best result צריך להיבחן בחשדנות גבוהה יותר מאשר רעיון יחיד שהוגדר מראש.

‏זה בדיוק Winner's Curse של Quant Research.

---

# ‏45. Family-Wise Error ו־False Discovery

‏יש כמה דרכים סטטיסטיות לטפל במספר רב של Tests.

‏אבל בפרויקט אישי, לעיתים ההגנה החשובה ביותר היא תהליכית:

- ‏Hypothesis מראש.
- ‏Frozen baseline.
- ‏Holdout untouched.
- ‏Experiment registry.
- ‏OOS replication.

---

# ‏46. Train / Validation / Test

‏תפקידים שונים:

```text
Train      -> fit / discover
Validation -> choose / tune
Test       -> final unbiased check
```

‏אם משתמשים ב־Test שוב ושוב לבחירת מודל, הוא כבר Validation.

---

# ‏47. Holdout Exhaustion

‏כל פעם שאנחנו מסתכלים על Holdout ומחליטים משהו לפי התוצאה, אנחנו לומדים ממנו.

‏אחרי מספיק iterations הוא מפסיק להיות truly unseen.

---

# ‏48. Walk-Forward Validation

‏ב־time series חשוב לשמור על סדר הזמן.

```text
Past -> Future
```

‏ולא לבצע random shuffle רגיל שמערבב עתיד ועבר.

---

# ‏49. Purging ו־Embargo — הרעיון

‏כאשר Labels חופפים בזמן, train ו־validation יכולים לחלוק מידע בצורה עקיפה.

‏לכן לעיתים צריך buffer בין windows.

‏זה חשוב במיוחד ב־forward returns של כמה horizons.

---

# ‏50. Overlapping Labels

‏אם בכל 100ms מחשבים return ל־5s קדימה, labels סמוכים חופפים כמעט לחלוטין.

‏לכן הם אינם independent observations.

‏זו אחת הסיבות ש־Raw N יכול להיות מטעה מאוד.

---

# ‏51. Bootstrap

‏Bootstrap מאפשר לאמוד uncertainty באמצעות resampling.

‏אבל bootstrap רגיל מניח independence בצורה שעלולה לא להתאים ל־time series.

---

# ‏52. Block Bootstrap

‏ב־time series אפשר לדגום blocks כדי לשמר חלק מהתלות המקומית.

‏למשל:

- ‏Time blocks.
- ‏Episode blocks.
- ‏Day blocks.

---

# ‏53. Permutation Test

‏Permutation test בודק מה קורה אם שוברים את הקשר בין signal ל־outcome.

‏זה יכול להיות Null Model חזק כאשר עושים אותו בלי leakage.

---

# ‏54. Time-Shift Test

‏אם מזיזים Signal בזמן והוא עדיין “עובד”, זה סימן חשוד.

‏ייתכן שמדדנו:

- ‏Regime effect.
- ‏Market drift.
- ‏Leakage.
- ‏Broad correlation.

‏ולא causal timing אמיתי.

---

# ‏55. Shuffle Test

‏אם shuffle של labels עדיין נותן performance משמעותי, משהו בתהליך המחקר שבור.

‏זה canary מצוין ל־Leakage.

---

# ‏56. Null Model

‏כל Strategy Candidate צריכה יריב פשוט.

‏לדוגמה:

```text
random among eligible candidates
rank by one simple feature
always choose current highest raw momentum
```

‏המטרה היא להוכיח שהמורכבות באמת מוסיפה.

---

# ‏57. Baseline

‏Baseline טוב צריך להיות:

- ‏פשוט.
- ‏קפוא.
- ‏קל לשחזור.
- ‏קשה “להזיז” אחרי שראינו תוצאה.

‏בלעדיו קשה לדעת אם Experiment באמת שיפר משהו.

---

# ‏58. Stationarity

‏Stationarity בערך שואלת האם ההתפלגות נשארת יציבה לאורך זמן.

‏שווקים אינם stationary במובן חזק.

‏לכן מודל חייב לצפות לשינוי.

---

# ‏59. Non-Stationarity

‏יכולים להשתנות:

- ‏Mean.
- ‏Variance.
- ‏Feature relationships.
- ‏Liquidity.
- ‏Spread.
- ‏Participant behavior.
- ‏Data-feed behavior.

‏Edge יכול להיעלם בלי bug.

---

# ‏60. Regime Conditioning

‏במקום להניח Relationship אחד לכל הזמן:

```text
E[Y | X]
```

‏נבדוק לעיתים:

```text
E[Y | X, Regime]
```

‏אבל אסור ליצור מאות Regimes עד שנמצא משהו יפה.

---

# ‏61. Autocorrelation

‏Autocorrelation בודקת קשר בין Series לערכים קודמים שלה.

‏במחקר שלנו היא רלוונטית ל:

- ‏Returns.
- ‏Trade rate.
- ‏Spread.
- ‏Volatility.
- ‏Signal state.

---

# ‏62. ACF

‏`Autocorrelation Function` מציגה את הקשר לפי Lag.

‏אפשר להשתמש בה כדי להבין Persistence ו־Decay.

---

# ‏63. Cross-Correlation

‏Cross-correlation יכולה לעזור לבדוק lead/lag בין שתי סדרות.

‏אבל timing alignment חייב להיות מדויק מאוד.

‏אחרת אפשר “לגלות” lead שלא קיים.

---

# ‏64. Signal Half-Life כבעיה סטטיסטית

‏אפשר להעריך כמה מהר Predictive Effect דועך לפי horizon.

‏לדוגמה:

```text
100ms
250ms
500ms
1s
2s
5s
10s
```

‏העקומה חשובה יותר מנקודה יחידה.

---

# ‏65. Horizon Curve

‏לכל Signal כדאי למדוד:

```text
Expected outcome vs forward horizon
```

‏כך רואים:

- ‏Onset.
- ‏Peak.
- ‏Decay.
- ‏Reversal.

---

# ‏66. MFE/MAE Distributions

‏`MFE` ו־`MAE` אינם רק averages.

‏צריך להסתכל על distributions ו־conditional distributions.

‏למשל:

```text
MFE | high score
MAE | high score
```

---

# ‏67. Time-to-Event Analysis

‏במערכת שלנו זמן חשוב כמו גודל התנועה.

‏לכן מודדים:

```text
time_to_first_profit
time_to_target
time_to_stop
time_to_flat
```

‏Distribution של time-to-event יכולה להיות חשובה יותר מ־average return.

---

# ‏68. Survival Thinking

‏אפשר לחשוב על שאלה כמו:

```text
What fraction of opportunities have not yet hit target by time t?
```

‏זו דרך טבעית לנתח time-to-target.

---

# ‏69. Calibration

‏אם Score אמור לייצג probability או confidence, צריך לבדוק calibration.

‏לדוגמה:

```text
Predicted probability ~ 0.70
Observed frequency   ~ ?
```

---

# ‏70. Ranking Metrics

‏כאשר המטרה היא לבחור Top Candidate, metrics של ranking חשובים יותר מ־global accuracy.

‏למשל:

- ‏Outcome by rank bucket.
- ‏Top-1 vs Top-5.
- ‏Rank correlation.
- ‏Lift over eligible universe.

---

# ‏71. Lift

‏`Lift` שואל כמה טוב selection ביחס ל־baseline.

```text
Lift = selected outcome / baseline outcome
```

‏יש להגדיר בדיוק מהו baseline.

---

# ‏72. Top-K Analysis

‏לא כדאי למדוד רק Rank #1.

‏נבדוק:

```text
Top1
Top3
Top5
Top10
```

‏אם Top1 אינו טוב יותר מ־Top5, ranking precision אולי חלשה.

---

# ‏73. Rank Gap

‏הפער בין Rank #1 ל־Rank #2 יכול להיות מידע חשוב.

‏אבל צריך לבדוק אמפירית האם Gap גדול באמת מנבא quality גבוהה יותר.

---

# ‏74. Rank Stability

‏אפשר למדוד:

- ‏Time in Top-K.
- ‏Number of rank flips.
- ‏Rank velocity.
- ‏Rank persistence.

‏ולבדוק מה מהם קשור ל־future outcome.

---

# ‏75. Cross-Sectional Z-Score

‏Z-score:

```text
z = (x - mean) / std
```

‏יכול לעזור להשוות Symbols.

‏אבל אם Distribution heavy-tailed, mean/std עלולים להיות לא יציבים.

---

# ‏76. Robust Z-Score

‏אפשר להשתמש ב־Median ו־MAD כחלופה robust יותר.

‏אבל גם זה צריך להיבדק OOS.

---

# ‏77. Rank Transform

‏במקום Scale אפשר להשתמש percentile/rank.

‏יתרון:

‏פחות רגיש ל־outliers.

‏חיסרון:

‏מאבד מידע על גודל הפער.

---

# ‏78. Standardization Leakage

‏אסור לנרמל Observation באמצעות מידע עתידי.

‏כל normalization חייב להיות:

```text
point-in-time correct
```

---

# ‏79. Winsorization

‏אפשר להגביל ערכים קיצוניים.

‏אבל אם tails עצמם מכילים מידע, winsorization יכולה למחוק Edge.

‏לכן זו החלטה מחקרית, לא preprocessing אוטומטי.

---

# ‏80. Missing Data

‏Missing אינו Zero.

‏Missing יכול להיות מידע בפני עצמו:

- ‏Feed gap.
- ‏No trades.
- ‏No quote.
- ‏Feature not warmed.

‏צריך state מפורש.

---

# ‏81. Imputation

‏מילוי ערכים חסרים עלול ליצור מידע שלא היה קיים.

‏במערכת realtime לעיתים עדיף:

```text
NOT_READY
UNKNOWN
DEGRADED
```

‏על פני imputation אגרסיבי.

---

# ‏82. Outliers

‏Outlier יכול להיות:

- ‏Bad data.
- ‏Real market event.
- ‏Rare but critical regime.

‏אסור להסיר אוטומטית בלי classification.

---

# ‏83. Robust Statistics

‏כלים robust שימושיים כאשר tails/outliers חזקים.

‏לדוגמה:

- ‏Median.
- ‏MAD.
- ‏Trimmed mean.
- ‏Quantiles.

‏אבל אין כלי robust אחד שנכון תמיד.

---

# ‏84. Ratio Metrics

‏Ratios יכולים להיות מסוכנים כאשר denominator קטן.

‏לדוגמה:

```text
momentum / spread
```

‏אם spread כמעט אפס, ratio יכול להתפוצץ.

‏צריך guards ו־interpretation.

---

# ‏85. Log Transform

‏Log transforms יכולים לעזור ל־positive skewed variables.

‏למשל activity/volume.

‏אבל transformation משנה interpretation.

---

# ‏86. Return Definitions

‏אפשר למדוד:

```text
simple return
log return
bps move
spread-normalized move
volatility-normalized move
```

‏כל אחת עונה על שאלה אחרת.

---

# ‏87. Percentage Return אינו תמיד comparable

‏ב־short horizon, tick size ו־spread יכולים לגרום לאותו percentage move להיות בעל executability שונה לחלוטין בין מניות.

---

# ‏88. Signal-to-Noise Ratio

‏באופן רעיוני:

```text
signal magnitude / uncertainty
```

‏אבל חשוב שה־noise estimate יתאים ל־horizon ול־regime.

---

# ‏89. Sharpe-Like Thinking

‏Risk-adjusted metrics יכולים לעזור להשוות strategies.

‏אבל ב־short horizon עם dependence ו־non-normal tails, annualized Sharpe פשוט עלול להטעות.

---

# ‏90. Sample Frequency Inflation

‏אם strategy מקבלת אלפי decisions ביום, אין פירוש הדבר שיש אלפי independent opportunities.

‏High frequency of observations יכולה ליצור confidence מזויף.

---

# ‏91. Clustered Outcomes

‏Trades/episodes מאותו burst יכולים להיות correlated.

‏לכן כדאי לנתח גם לפי clusters/events ולא רק rows.

---

# ‏92. Day-Level Aggregation

‏בנוסף ל־trade-level metrics, כדאי לבדוק:

- ‏Daily outcome.
- ‏Daily hit rate.
- ‏Daily edge retention.
- ‏Daily tail loss.

‏זה עוזר לזהות dependence.

---

# ‏93. Symbol-Level Generalization

‏Signal שעובד רק במספר קטן של Symbols אולי אינו generalizable.

‏צריך לבדוק:

```text
performance across symbols
```

‏ולא רק pooled aggregate.

---

# ‏94. Leave-One-Group-Out Thinking

‏אפשר לבדוק robustness על ידי השארת:

- ‏Day.
- ‏Week.
- ‏Symbol group.
- ‏Regime.

‏מחוץ ל־fit ולראות אם effect נשמר.

---

# ‏95. Simpson's Paradox

‏Aggregate relationship יכול להתהפך בתוך subgroups.

‏לכן תמיד כדאי לבדוק אם pooled result מסתיר regime/sector/liquidity effect.

---

# ‏96. Selection Bias

‏אם אנחנו מנתחים רק trades שבוצעו, איבדנו מידע על candidates שלא התמלאו או שנפסלו.

‏זה קריטי במיוחד ל־Execution Research.

---

# ‏97. Survivorship Bias

‏אם historical universe כולל רק symbols שקיימים היום, אנחנו מסירים failures מהעבר.

‏זו הטיה חמורה.

---

# ‏98. Winner's Curse

‏ה־best feature, best threshold או Rank #1 מתוך אלפי candidates נוטה להיות overestimated.

‏Selection עצמה יוצרת bias.

---

# ‏99. Regression to the Mean

‏Extreme observation נוטה לעיתים להיות פחות extreme במדידה הבאה.

‏זה יכול להיראות כמו reversal גם בלי Edge אמיתי.

---

# ‏100. Look-Ahead Bias

‏כל שימוש ב־future information, גם עקיף, שובר Backtest.

‏כולל:

- ‏Future-adjusted data.
- ‏Final bar values.
- ‏Future universe membership.
- ‏Post-event classifications.

---

# ‏101. Data Snooping

‏גם בלי leakage טכני, repeated exploration של אותו dataset גורמת לנו להתאים את החשיבה ל־Noise שלו.

---

# ‏102. Effect Decay

‏Effect אמיתי יכול להיחלש לאורך זמן.

‏לכן צריך למדוד:

```text
effect by calendar period
```

‏ולא רק pooled history.

---

# ‏103. Parameter Stability

‏טוב יותר לראות plateau רחב מאשר peak צר.

```text
robust region > perfect single parameter
```

---

# ‏104. Sensitivity Analysis

‏נבדוק מה קורה כאשר משנים:

- ‏Threshold.
- ‏Latency.
- ‏Spread.
- ‏Slippage.
- ‏Fill probability.
- ‏Holding horizon.

‏Edge טוב לא אמור להיעלם משינוי זעיר בכל פרמטר.

---

# ‏105. Confidence vs Conviction

‏אפשר להיות בעל hypothesis חזק אבל statistical confidence נמוך בגלל מעט data.

‏ולהפך.

‏צריך להפריד בין:

```text
mechanistic conviction
statistical confidence
```

---

# ‏106. Prediction Interval

‏Confidence interval מתייחס לאומדן parameter.

‏Prediction interval מתייחס לאי־ודאות של observation עתידי.

‏האחרון בדרך כלל רחב יותר.

---

# ‏107. Calibration Drift

‏Model שהיה calibrated בתקופה אחת יכול לאבד calibration.

‏לכן צריך למדוד calibration גם ב־Live/Shadow.

---

# ‏108. Distribution Shift

‏Production data יכולה להשתנות ביחס למחקר.

‏למשל:

- ‏Feature distribution.
- ‏Spread distribution.
- ‏Symbol mix.
- ‏Activity.

‏זה נקרא בצורה כללית Distribution Shift.

---

# ‏109. Covariate Shift

‏Input distribution משתנה, גם אם relationship ל־target אולי נשאר דומה.

---

# ‏110. Concept Drift

‏הקשר בין Features ל־Outcome עצמו משתנה.

‏זה מסוכן יותר.

---

# ‏111. Population Stability

‏אפשר לעקוב אחרי שינוי distributions לאורך זמן.

‏אבל metric יחיד אינו מספיק; צריך גם inspection כלכלי של המשמעות.

---

# ‏112. Conditional Performance Tables

‏אחד הכלים הפשוטים והחזקים:

```text
Outcome by:
ScoreBucket
SpreadBucket
LiquidityBucket
VolatilityBucket
TimeOfDay
Regime
```

‏כך רואים איפה Edge באמת חי.

---

# ‏113. Two-Dimensional Binning

‏לפעמים Feature עובד רק בשילוב Feature אחר.

‏טבלת:

```text
MomentumBucket × LiquidityBucket
```

‏יכולה לחשוף זאת במהירות.

---

# ‏114. Beware Sparse Cells

‏כאשר מחלקים ליותר מדי bins, כל תא מקבל מעט observations.

‏ואז Noise נראה כמו structure.

---

# ‏115. Smoothing

‏Smoothing יכול לעזור לזהות shape.

‏אבל smoothing חזק מדי יכול להסתיר discontinuities אמיתיים.

---

# ‏116. Monotonicity

‏אם Score אמור להיות טוב יותר כשהוא גבוה, נרצה לראות:

```text
higher score bucket -> better expected outcome
```

‏לא חובה להיות מושלם, אבל chaos מוחלט הוא סימן אזהרה.

---

# ‏117. Threshold Discovery

‏Threshold שנבחר אחרי inspection של data הוא חלק מה־model fitting.

‏אסור להתייחס אליו כאילו היה נתון מראש.

---

# ‏118. Break-Even Threshold

‏Threshold מעניין הוא לא רק זה שנותן Max PnL.

‏אפשר לשאול:

```text
At what threshold does expected net edge become positive?
```

---

# ‏119. Economic Margin

‏אם Expected Edge כמעט שווה ל־cost estimate, אין margin לטעות.

‏נרצה buffer מעל break-even.

---

# ‏120. Uncertainty Buffer

‏אפשר לחשוב:

```text
Tradable Edge
= Estimated Edge
- Expected Costs
- Uncertainty Buffer
```

‏ה־buffer הוא רעיון שמרני, לא קבוע אוניברסלי.

---

# ‏121. Quantile Regression — רעיון מתקדם

‏במקום לחזות Mean, אפשר לחקור Quantiles של Outcome.

‏למשל downside tail.

‏זה עשוי להיות שימושי יותר מ־average בלבד.

---

# ‏122. Logistic Regression

‏כאשר Target binary, logistic regression יכולה לתת baseline מצוין.

‏יתרונות:

- ‏פשוטה.
- ‏פרשנית.
- ‏מהירה.
- ‏קל לבדוק calibration.

---

# ‏123. Regularization

‏כאשר Features רבים, regularization יכולה להקטין overfitting.

‏אבל היא אינה תחליף ל־good experimental design.

---

# ‏124. L1 / L2 — רעיון

‏`L1` יכולה לדחוף coefficients מסוימים לאפס.

‏`L2` מקטינה coefficients בצורה חלקה יותר.

‏שניהם כלים, לא פתרון קסם.

---

# ‏125. Multicollinearity

‏Features מתואמים מאוד יכולים לגרום coefficients לא יציבים.

‏זה חשוב במיוחד אם רוצים interpretability.

---

# ‏126. Feature Importance

‏Feature Importance תלויה במודל ובשיטה.

‏אין להתייחס אליה כאמת causal.

---

# ‏127. Permutation Importance

‏אפשר למדוד כמה performance יורדת כאשר שוברים Feature.

‏אבל Features correlated יכולים לבלבל גם את השיטה הזו.

---

# ‏128. Ablation

‏אחת הבדיקות החשובות ביותר:

```text
full model
vs
model without feature X
```

‏אם אין הבדל יציב, Feature אולי מיותר.

---

# ‏129. Incremental Information

‏השאלה הנכונה אינה:

```text
Does X correlate with Y?
```

‏אלא:

```text
Does X add useful information beyond what we already know?
```

---

# ‏130. Feature Retirement

‏Feature שהפסיקה להוסיף incremental value צריכה להיות candidate לפרישה.

‏פחות Features יכול להיות יתרון.

---

# ‏131. Statistical Power

‏Power היא היכולת לזהות effect אמיתי כאשר הוא קיים.

‏Sample קטן מדי יכול לגרום לנו לפספס Edge אמיתי.

---

# ‏132. Minimum Detectable Effect

‏לפני Experiment כדאי לשאול:

```text
What effect size could this experiment realistically detect?
```

‏אם רק effect זעיר מעניין אותנו אבל אין מספיק data, המחקר לא יוכל לענות.

---

# ‏133. Sequential Peeking

‏אם עוצרים Experiment בדיוק כשהתוצאה נראית טובה, יוצרים bias.

‏צריך כלל עצירה מוגדר מראש או שיטה שמתאימה ל־sequential analysis.

---

# ‏134. Early Stopping במחקר

‏אפשר לעצור רעיון מוקדם כאשר הוא clearly bad.

‏אבל “לעצור כשהוא נהיה טוב” בלי protocol הוא מסוכן.

---

# ‏135. Bayesian Updating כהרגל מחקרי

‏גם בלי Bayesian model מלא:

- ‏Prior plausibility.
- ‏New evidence.
- ‏Posterior confidence.

‏זו דרך בריאה לחשוב על רעיונות.

---

# ‏136. Mechanism + Statistics

‏המחקר החזק ביותר משלב:

```text
plausible mechanism
+
statistical evidence
+
execution evidence
```

‏אחד בלי האחרים חלש יותר.

---

# ‏137. Causality

‏Prediction אינו Causality.

‏לא תמיד צריך causal model כדי לסחור, אבל צריך לדעת מה לא הוכחנו.

---

# ‏138. Intervention vs Observation

‏Market data היא observational.

‏אנחנו לא שולטים ברוב המשתנים.

‏לכן causal claims דורשים זהירות גבוהה.

---

# ‏139. Counterfactual Thinking

‏שאלה שימושית:

```text
What would likely have happened if we had not selected this candidate?
```

‏או:

```text
What if Rank #2 had been chosen instead?
```

‏זה חשוב ל־Ranking RCA.

---

# ‏140. Counterfactual Logging

‏כדאי לשמור outcomes של Top-N candidates גם אם בפועל רק אחד נבחר.

‏כך אפשר לחקור ranking בלי לבצע עסקאות נוספות.

---

# ‏141. Post-Selection Bias

‏ברגע שבחרנו Winner, ההתפלגות שלו conditional על כך שהוא Winner.

‏אי אפשר להשוות אותו נאיבית ל־random symbol.

---

# ‏142. Ranking Winner's Curse

‏מתוך 4,000 Symbols, ה־max של noisy scores יהיה קיצוני גם אם אין signal חזק.

‏זו בעיה מרכזית עבור Scanner רחב.

---

# ‏143. Extreme Value Thinking

‏כאשר בוחרים Maximum מתוך אלפים, distribution של Maximum שונה מהתפלגות של Symbol רגיל.

‏לכן Rank #1 דורש רף גבוה יותר.

---

# ‏144. Multiple Candidates per Episode

‏Candidates מאותו רגע חולקים market context.

‏הם אינם independent.

‏Cross-sectional analysis צריך לזכור זאת.

---

# ‏145. Market-Wide Factor

‏אפשר לפרק רעיונית:

```text
StockMove = MarketComponent + IdiosyncraticComponent
```

‏זה יכול לעזור להבין אם Scanner רק בוחר מניה שנגררת אחרי השוק כולו.

---

# ‏146. Residual Momentum — רעיון

‏אפשר לבדוק momentum אחרי הסרת market/sector component.

‏אבל זה Feature Candidate, לא המלצה אוטומטית.

---

# ‏147. Cross-Sectional Neutralization

‏Neutralization יכולה להסיר common factors.

‏אבל היא יכולה גם למחוק מידע אמיתי.

‏חייבים לבדוק incremental value.

---

# ‏148. Volatility Scaling

‏השוואת raw returns בין מניות יכולה להיות לא הוגנת.

‏אפשר לבדוק volatility-normalized signals.

‏אבל normalization אינה תמיד טובה ל־execution economics.

---

# ‏149. Spread Scaling

‏Signal של 8 bps עם spread של 1 bp שונה מאוד מ־8 bps עם spread של 7 bps.

‏לכן economic normalization חשובה.

---

# ‏150. Cost Distribution

‏Costs אינם מספר קבוע.

‏צריך למדוד distribution של:

- ‏Spread cost.
- ‏Slippage.
- ‏Impact.
- ‏Fees.
- ‏Adverse selection.

---

# ‏151. Expected Cost Conditional on State

‏Costs יכולים לגדול בדיוק כאשר Signal חזק.

‏לכן:

```text
E[Cost | SignalState]
```

‏חשוב יותר מ־global average cost.

---

# ‏152. Latency Distribution

‏גם latency היא Distribution.

‏צריך לפחות:

```text
P50
P95
P99
```

‏ולא רק average.

---

# ‏153. Latency-Outcome Coupling

‏אם latency גבוהה דווקא בזמן bursts, היא אינה noise אקראי.

‏זו תלות שחייבת להיכנס ל־Backtest/Replay.

---

# ‏154. Missing Not At Random

‏Data missing יכולה להיות קשורה למצב שוק קשה.

‏אם מסירים missing rows, אפשר להסיר בדיוק את המצבים המסוכנים ביותר.

---

# ‏155. Censoring

‏לפעמים outcome אינו נצפה במלואו.

‏למשל Session נגמר לפני שהגענו ל־target/stop.

‏צריך להבחין בין true failure לבין censored observation.

---

# ‏156. Truncation

‏אם אנחנו אוספים רק events שעברו threshold מסוים, distribution כבר מותנית בסינון.

‏צריך לזכור זאת בפרשנות.

---

# ‏157. Selection Pipeline Statistics

‏אצלנו pipeline הוא:

```text
Universe
→ Eligible
→ Filtered
→ Ranked
→ Vetoed
→ Executable
→ Submitted
→ Filled
→ Closed
```

‏צריך metrics בכל transition.

---

# ‏158. Funnel Analysis

‏נרצה לדעת כמה candidates נעלמים בכל שלב ולמה.

‏כך מגלים rule שמסנן יותר מדי.

---

# ‏159. Decision Impact

‏לכל Rule/Feature אפשר למדוד:

```text
How often did it actually change the final decision?
```

‏Feature שלא משנה decisions אולי מוסיפה complexity בלבד.

---

# ‏160. Marginal Decision Value

‏נרצה למדוד לא רק contribution ל־Score אלא contribution ל־final economic outcome.

---

# ‏161. Error Bars on Metrics

‏כל Dashboard Research חשוב צריך, כאשר אפשר, להראות uncertainty ולא רק point estimate.

---

# ‏162. Small Sample Warning

‏Bucket עם 12 observations לא צריך להיראות באותה סמכות כמו Bucket עם 12,000.

‏UI יכול להציג Sample Size במפורש.

---

# ‏163. Confidence Coloring — בזהירות

‏אפשר להציג confidence level, אבל לא להפוך אותו לצבע “ירוק = בטוח”.

‏Uncertainty אף פעם אינה נעלמת לחלוטין.

---

# ‏164. Research Table טובה

‏טבלה שימושית יכולה לכלול:

```text
N
Mean
Median
P25/P75
P10/P90
WinRate
AvgWin
AvgLoss
MFE
MAE
TimeToTarget
NetAfterCosts
```

---

# ‏165. Always Show N

‏Metric בלי Sample Size הוא חצי Metric.

---

# ‏166. Always Show Time Range

‏Result בלי תקופת זמן יכול להיות מטעה.

---

# ‏167. Always Show Regime Mix

‏שתי תקופות עם אותו N יכולות להיות שונות מאוד אם אחת כוללת רק calm market והשנייה bursts.

---

# ‏168. Always Show Cost Assumption

‏Result של `+X bps` חסר משמעות בלי לדעת אם הוא gross או net ובאיזה execution model.

---

# ‏169. Always Show Selection Rule

‏אם table מבוססת רק על candidates שעברו filters, צריך לציין זאת.

---

# ‏170. Statistical RCA

‏כאשר Live שונה מ־Backtest נפרק:

```text
Feature distribution changed?
Conditional outcome changed?
Selection changed?
Fill distribution changed?
Costs changed?
Latency changed?
Regime mix changed?
```

---

# ‏171. Drift Detection אינו One Metric

‏Drift צריך להיבחן במספר שכבות:

- ‏Input.
- ‏Feature.
- ‏Rank.
- ‏Decision.
- ‏Execution.
- ‏Outcome.

---

# ‏172. Control Charts — רעיון

‏אפשר לעקוב אחרי metrics יחסית לטווח היסטורי ולהתריע על שינוי חריג.

‏אבל markets אינם stationary factory process, ולכן interpretation חייב להיות זהיר.

---

# ‏173. Sequential Monitoring

‏Live metrics נצפים שוב ושוב.

‏זה שונה מ־single offline hypothesis test.

‏צריך להימנע מ־overreacting לכל fluctuation קטן.

---

# ‏174. Shrinkage — רעיון מתקדם

‏כאשר יש groups עם מעט data, estimates קיצוניים יכולים להתכווץ לכיוון global mean.

‏זה רעיון שימושי כדי להפחית Winner's Curse בין Symbols/Buckets.

---

# ‏175. Hierarchical Thinking

‏אפשר לחשוב על structure:

```text
Global effect
→ Sector effect
→ Symbol effect
```

‏במקום להעריך כל Symbol כאילו הוא עולם נפרד לחלוטין.

---

# ‏176. Regularization Across Symbols

‏Small sample לכל Symbol יכול לייצר estimates לא יציבים.

‏Shared structure יכולה לעזור, אבל זה כבר model complexity שדורש validation.

---

# ‏177. Probability Calibration vs Ranking Quality

‏Model יכול לדרג מצוין אבל probabilities שלו להיות לא calibrated.

‏ולהפך.

‏צריך לדעת מה ה־decision layer באמת צריך.

---

# ‏178. Threshold on Probability

‏Threshold probability אינו אוניברסלי.

‏הוא תלוי:

- ‏Payoff.
- ‏Costs.
- ‏Risk.
- ‏Opportunity set.

---

# ‏179. Expected Utility — רעיון

‏במקום maximize raw return, decision יכול לקחת בחשבון גם downside/risk constraints.

‏בפרויקט שלנו זה מתורגם בעיקר ל־risk gates ול־NO TRADE, לא לחיפוש אגרסיבי של exposure.

---

# ‏180. Robustness Across Definitions

‏אם Edge קיים רק כאשר Target מוגדר בצורה אחת מאוד ספציפית, זה חשוד.

‏כדאי לבדוק definitions חלופיים סבירים.

---

# ‏181. Label Sensitivity

‏נבדוק:

```text
1s
2s
5s
10s
30s
60s
```

‏ולא נבחר horizon יחיד רק כי הוא נראה הכי טוב אחרי inspection.

---

# ‏182. Metric Sensitivity

‏נבדוק אם conclusion נשאר דומה תחת:

- ‏Mean.
- ‏Median.
- ‏Net outcome.
- ‏MFE/MAE.
- ‏Time-to-target.

‏אם כל הסיפור תלוי metric יחיד, צריך להבין למה.

---

# ‏183. Practitioner Secret — The Best Number Is Often a Curve

‏מקצוענים מעדיפים לעיתים curve על point estimate.

‏לדוגמה:

```text
Edge vs Horizon
Edge vs Score
Edge vs Spread
Edge vs Latency
Edge vs Position Size
```

‏Curve חושפת structure ו־fragility.

---

# ‏184. Practitioner Secret — Always Ask “Compared to What?”

‏כל result צריך benchmark.

‏בלי benchmark, מספר יפה יכול להיות חסר משמעות.

---

# ‏185. Practitioner Secret — Extreme Winners Deserve More Suspicion

‏ככל שתוצאה נבחרה מתוך Search Space גדול יותר, כך צריך יותר validation.

---

# ‏186. Practitioner Secret — Stable Mediocre Can Beat Fragile Brilliant

‏Effect קצת קטן יותר אבל יציב across periods/regimes עשוי להיות שימושי יותר מ־peak עצום שנעלם OOS.

---

# ‏187. Practitioner Secret — Distribution Before Optimization

‏לפני שמכוונים threshold, מסתכלים על shape של data.

‏אחרת optimization מתחילה לפני שהבנו מה בכלל נמדד.

---

# ‏188. Practitioner Secret — Statistical Confidence Does Not Repair Bad Data

‏מיליון observations corrupted לא הופכים למחקר טוב.

‏Data Quality קודמת ל־Inference.

---

# ‏189. Practitioner Secret — More Data Can Mean More Bias

‏אם data נוספת מגיעה מאותה הטיה, confidence המזויף רק גדל.

---

# ‏190. Practitioner Secret — Uncertainty Is a Feature of the System

‏מערכת מקצועית לא מנסה להעמיד פנים שאין uncertainty.

‏היא:

- ‏מודדת אותה.
- ‏מציגה אותה.
- ‏מקטינה exposure כאשר היא גבוהה.
- ‏משתמשת ב־`NO TRADE` כאשר evidence חלש.

---

# ‏191. יישום ישיר ל־Scanner שלנו

‏לכל Candidate נרצה לאורך זמן Evidence שמאפשר לשאול:

```text
How predictive is the score?
How stable is that relationship?
How much does Rank #1 beat Rank #2-5?
How much of the effect survives costs?
How much survives latency?
How much survives different regimes?
How often do vetoes improve expected net outcome?
```

---

# ‏192. Research Dataset מומלץ רעיונית

‏לכל Decision Snapshot נרצה לשמור לפחות:

```text
DecisionTime
Symbol
UniverseState
FeatureVector
Score
Rank
RankGap
VetoReasons
DataQuality
Spread
LiquidityState
PredictedEdge
ExecutionFeasibility
ForwardLabels
MFE
MAE
TimeToFirstProfit
TimeToTarget
CounterfactualTopN
```

---

# ‏193. Statistical Report לכל Experiment

‏Experiment רציני צריך לענות לפחות על:

```text
What was the hypothesis?
What was the sample?
What was N?
What was effective N likely to be?
What was the baseline?
What was the effect size?
What was uncertainty?
What was tested before this?
Did it survive OOS?
Did it survive execution stress?
```

---

# ‏194. What We Know vs What We Estimate

‏בכל result כדאי להפריד:

```text
Observed Fact
Estimated Quantity
Model Assumption
Unknown
```

‏זו שכבת משמעת חשובה מאוד.

---

# ‏195. `KNOWN / INFERRED / UNKNOWN`

‏אותו pattern שכבר השתמשנו בו ב־Market Data מתאים גם ל־Research conclusions.

‏לא כל מספר הוא Fact.

---

# ‏196. Baseline Quant Workflow

```text
Define hypothesis
→ Define population/sample
→ Define unit of observation
→ Freeze primary metric
→ Inspect distributions
→ Compare to baseline
→ Estimate effect + uncertainty
→ Check dependence / overlap
→ Validate OOS
→ Stress costs/latency
→ Inspect regimes
→ Run ablation/null tests
→ Shadow
→ Re-evaluate with live evidence
```

---

# ‏197. מה לא לעשות

‏לא:

- ‏להסתפק ב־Mean.
- ‏לספור rows כאילו כולם independent.
- ‏להאמין ל־p-value בלי להבין את Search Space.
- ‏לבחור threshold ואז לקרוא לאותו dataset “validation”.
- ‏להציג correlation כאילו היא causation.
- ‏להתעלם מ־missing/outliers.
- ‏להניח Normal Distribution אוטומטית.
- ‏להשתמש ב־random split על time series בלי הצדקה.
- ‏להסתיר Sample Size.
- ‏להציג Gross Edge בלי Costs.

---

# ‏198. מה כן לזכור בעל־פה

```text
N is not effective N.
Mean is not the distribution.
Correlation is not causation.
Statistical significance is not economic significance.
A selected winner is biased upward.
A reused holdout is no longer a holdout.
Overlapping labels reduce independence.
Curves are often more informative than point estimates.
Every estimate has uncertainty.
NO TRADE is valid when evidence is weak.
```

---

# ‏199. חיבור לשלב הבא

‏הבסיס הזה יאפשר לנו ללמוד Machine Learning בלי להפוך ML לקופסה שחורה.

‏נוכל לשאול:

```text
What exactly is the model learning?
What is the target?
How do we prevent leakage?
How do we measure generalization?
How do we calibrate confidence?
How do we prove incremental value over a simple baseline?
```

---

# ‏200. סיכום

‏היתרון של Quantitative Thinking אינו בכך שהוא הופך את השוק לוודאי.

‏הוא עושה את ההפך: הוא מכריח אותנו לייצג uncertainty במפורש.

‏במערכת שלנו התהליך המקצועי הוא:

```text
Observe
→ Define
→ Measure
→ Estimate uncertainty
→ Compare
→ Challenge
→ Validate out-of-sample
→ Stress execution assumptions
→ Shadow
→ Update belief
```

‏המטרה אינה למצוא מספר מרשים.

‏המטרה היא להגיע ל־Decision שאפשר להסביר למה הוא קיים, כמה Evidence עומד מאחוריו, מה יכול להפריך אותו, וכמה Edge אמיתי נשאר אחרי שה־Statistics, ה־Market Microstructure וה־Execution נפגשים.
