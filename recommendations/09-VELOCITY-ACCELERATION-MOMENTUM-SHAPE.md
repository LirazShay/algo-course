# ‏09 — Recommendation Sheet: Velocity / Acceleration / Momentum Shape

> ‏מקור לימודי עיקרי: `../09-VELOCITY-ACCELERATION-MOMENTUM-SHAPE.md`.
>
> ‏מטרת הקובץ: לקבוע אילו Features של קצב, שינוי בקצב ואיכות מסלול ראויים להיות Baseline למחקר של `Short-Horizon Momentum`, אילו הם רק תיאורים שימושיים, ומה חייב להוכיח ערך מעבר ל־Returns הפשוטים שכבר הוגדרו במקטע 08.

---

## ‏1. Decision

‏איך לתאר את **צורת התנועה עכשיו** — לא רק כמה המחיר עלה — כך שנוכל להבחין בין:

```text
large old move
fresh strengthening move
burst
sustained move
plateau
deceleration
pullback
re-acceleration
whipsaw
```

‏בלי להפוך כל תיאור אינטואיטיבי ל־BUY rule ובלי להעמיס Features כפולים שלא מוסיפים מידע חדש.

---

## ‏2. Recommended Default

### ‏`P1 — Preferred Default`: Recent-vs-Previous equal-length segments

‏ה־Baseline המרכזי למדידת שינוי בקצב יהיה השוואת שני מקטעים סמוכים באותו אורך.

‏לדוגמה עבור 5 שניות:

```text
previous_5s_return = price(T-5) / price(T-10) - 1
recent_5s_return   = price(NOW) / price(T-5) - 1

momentum_delta_5s  = recent_5s_return - previous_5s_return
```

‏פירוש בסיסי:

```text
momentum_delta > 0  => recent segment stronger
momentum_delta = 0  => similar pace
momentum_delta < 0  => recent segment weaker
```

‏ה־Feature אינו הוראת מסחר; הוא מתאר שינוי בקצב בלבד.

### ‏`P1 — Preferred Default`: Direction + Change-in-Rate נשמרים בנפרד

‏אין לפרש `momentum_delta > 0` כ־bullish בפני עצמו.

‏דוגמה:

```text
previous_5s = -1.00%
recent_5s   = -0.20%
```

‏אמנם:

```text
momentum_delta = +0.80%
```

‏אבל התנועה עדיין שלילית.

‏לכן נשמור תמיד לפחות:

```text
recent_return
previous_return
momentum_delta
```

‏ולא רק את הדלתא.

### ‏`P1 — Preferred Default`: Difference לפני Ratio

‏ברירת המחדל למחקר תהיה:

```text
recent_return - previous_return
```

‏ולא:

```text
recent_return / previous_return
```

‏הסיבה: `ratio` נעשה לא יציב כאשר המכנה קרוב לאפס, מתפוצץ על ערכים קטנים ועלול ליצור outliers חסרי משמעות.

‏`ratio` נשאר Challenger בלבד, עם denominator floor מפורש אם נבדוק אותו.

### ‏`P1 — Preferred Default`: לא לשכפל Return קבוע כ־Velocity Feature

‏כאשר החלון קבוע:

```text
velocity_5s = return_5s / 5
```

‏הדירוג בין מניות לפי `velocity_5s` זהה לדירוג לפי `return_5s`.

‏לכן אין ערך להחזיק את שניהם רק משום שהשם `velocity` נשמע מקצועי יותר.

‏נשתמש במושג Velocity כאשר הוא באמת מוסיף הקשר:

- ‏השוואה בין מקטעים באורכים שונים.
- ‏Intervals שאינם אחידים בזמן.
- ‏ניתוח recent מול previous.
- ‏מודל שמנרמל במפורש לפי duration האמיתי.

### ‏`P1 — Preferred Default`: Real timestamps, לא הנחת Sampling אחיד

‏אם תת־חלון אחד ארך 1.2 שניות ואחר 4.7 שניות, אין להתייחס אליהם כאילו שניהם בני 5 שניות.

‏לכל Segment נדרש לפחות:

```text
segment_start_time
segment_end_time
duration_ms
start_price
end_price
return
```

‏כאשר מחשבים rate:

```text
rate = return / actual_duration
```

### ‏`P0 — Required for Valid Research`: אותם כללי Anchor של מקטע 08

‏כל Anchor חייב להגיע מהעבר:

```text
anchor = latest observation where event_time <= target_anchor_time
```

‏ושומרים:

```text
anchor_gap_ms
```

‏אם הפער גדול מה־quality budget:

```text
feature = missing
```

‏אין interpolation כברירת מחדל ואין בחירת נקודה עתידית רק משום שהיא קרובה יותר.

### ‏`P1 — Preferred Default`: משפחת Shape ראשונית קטנה

‏בשלב הראשון הייתי שומר רק משפחות פשוטות וברורות:

```text
A. level / recent return
B. recent-vs-previous delta
C. positive-segment consistency
D. direction-change count
E. path efficiency
```

‏ולא עשרות נוסחאות שונות של acceleration/curvature/slope.

### ‏`P2 — Challenger`: Positive Segment Consistency

‏לדוגמה, חלון 10 שניות מחולק ל־5 מקטעים בני 2 שניות:

```text
segment_1
segment_2
segment_3
segment_4
segment_5
```

‏נוכל לשמור:

```text
positive_segment_count
positive_segment_ratio
trailing_positive_streak
```

‏מטרת המדד: להבדיל בין תנועה מתמשכת לבין מהלך נטו שנוצר מזיגזגים.

‏Promotion רק אם הוא מוסיף predictive value מעבר ל־multi-horizon returns.

### ‏`P2 — Challenger`: Direction Changes / Whipsaw

‏נוכל לשמור:

```text
direction_changes_10s
direction_changes_30s
last_direction_change_age_ms
```

‏מדד כזה יכול לזהות זיגזג מהיר.

‏אבל הוא רגיש ל־micro-noise ול־flat threshold, ולכן אינו Baseline קשיח לפני Validation.

### ‏`P2 — Challenger`: Path Efficiency

‏הגדרה רעיונית:

```text
path_efficiency = abs(net_move) / total_absolute_path_movement
```

‏בטווח תאורטי:

```text
~1 => movement mostly one-directional
~0 => large path movement but little net progress
```

‏המדד עשוי להיות שימושי לרווחים קטנים ומהירים, משום ששתי מניות עם אותו Return יכולות להיות שונות מאוד באיכות המסלול.

‏אבל הוא דורש sampling מספיק עקבי כדי להיות בר־השוואה.

### ‏`P2 — Challenger`: Current-vs-Peak Momentum

‏אפשר לבדוק:

```text
peak_short_return
current_short_return
time_since_peak_velocity_ms
current_to_peak_ratio
```

‏המטרה: להבדיל בין Momentum טרי לבין מהלך שבו השיא בקצב כבר מאחורינו.

‏`current_to_peak_ratio` חייב טיפול מפורש באפס/near-zero.

### ‏`P3 — Advanced Challenger`: Regression Slope

‏אפשר לאמוד שיפוע על כמה נקודות בחלון במקום להשתמש רק ב־start/end.

‏Promotion רק אם הוא נותן incremental OOS value מעל:

```text
returns
recent-vs-previous
path consistency
```

‏אחרת הוא מורכבות מיותרת.

### ‏`P3 — Advanced Challenger`: Smoothing / EMA

‏Smoothing יכול להפחית Noise, אבל מוסיף Lag.

‏לכן לכל גרסה מוחלקת צריך להשוות לפחות:

```text
raw signal lead time
smoothed signal lead time
false-positive rate
forward executable edge
```

‏אין להניח ש־EMA טוב יותר רק משום שהוא יציב יותר לעין.

### ‏`P3 — Advanced Challenger`: Named Shape States

‏מצבים כגון:

```text
BURST
SUSTAINED
PLATEAU
PULLBACK
RE_ACCELERATION
EXHAUSTION_CANDIDATE
WHIPSAW
```

‏יכולים להיות שימושיים ל־analysis/UI/logging.

‏אבל הם צריכים להיות **Derived Labels from raw Features**, לא תחליף ל־raw numbers ולא rules סופיים.

---

## ‏3. Why

### ‏Fact

‏Return בחלון קבוע כבר מייצג שינוי ביחס למשך ידוע; חלוקה בקבוע אינה משנה Ranking.

### ‏Fact

‏שני ניירות יכולים לקבל אותו Return כולל אך להגיע אליו במסלולים שונים לחלוטין.

### ‏Fact

‏השוואת `recent` ו־`previous` באותו אורך מבודדת טוב יותר שינוי בקצב מאשר השוואת חלונות מקוננים באורכים שונים.

### ‏Fact

‏Ratio עם denominator קטן או אפס אינו יציב ללא guardrails.

### ‏Fact

‏Smoothing מפחית variation קצר אבל מוסיף delay ויכול להסתיר שינוי מהיר.

### ‏Fact

‏Feature של acceleration אינו אומר דבר על executability, spread, fills או net outcome.

### ‏Judgment

‏לרובוט שלנו עדיף להתחיל ממספר קטן של Features שקל להסביר, לשחזר ולבדוק, ולהוסיף Shape complexity רק כאשר היא מוכיחה incremental value.

### ‏Hypothesis

‏מומנטום חיובי שבו `recent_return > previous_return` עשוי לתת forward edge טוב יותר ממומנטום שבו רוב המהלך כבר נמצא בקטע הקודם.

### ‏Hypothesis

‏Path efficiency / consistency עשויים לעזור להבדיל בין continuation שניתן לבצע לבין spike/whipsaw.

### ‏Hypothesis

‏Re-acceleration לאחר pause קצר עשויה להיות Pattern בעל ערך, אך ייתכן גם שהיא פשוט מייצרת false breakouts.

---

## ‏4. Baseline Feature Contract

‏Baseline ראשוני מומלץ:

```text
as_of_time
feature_set_version
price_source

recent_return_1s
previous_return_1s
momentum_delta_1s

recent_return_2s
previous_return_2s
momentum_delta_2s

recent_return_5s
previous_return_5s
momentum_delta_5s

recent_return_10s
previous_return_10s
momentum_delta_10s

quote_age_ms
last_age_ms
anchor_quality_flags
```

‏לא כל Horizon חייב להישאר בגרסה הסופית.

‏הם Baseline למחקר אבחוני.

---

## ‏5. Extended Research Feature Set

‏רק לאחר שה־Baseline עובד ומשתחזר:

```text
positive_segments_10s
positive_segments_30s
trailing_positive_streak

direction_changes_10s
direction_changes_30s
last_direction_change_age_ms

path_efficiency_10s
path_efficiency_30s

peak_short_return_10s
time_since_peak_velocity_ms
current_to_peak_ratio

regression_slope_10s
regression_slope_30s

smoothed_short_rate
```

‏כל אחד חייב להיבדק מול Baseline ולא רק בפני עצמו.

---

## ‏6. Shape Taxonomy — שימוש נכון

| Shape | תיאור Feature-level | פירוש אפשרי | סטטוס |
|---|---|---|---|
| `ACCELERATING_UP` | `recent > previous > 0` | עלייה מתחזקת | Research state |
| `DECELERATING_UP` | `recent > 0`, `recent < previous` | עדיין עולה אך נחלשת | Research state |
| `BURST` | רוב ה־return הגיע במקטע קצר מאוד | התפרצות טרייה או spike | Challenger |
| `SUSTAINED` | כמה מקטעים חיוביים עם efficiency סבירה | תנועה מתמשכת | Challenger |
| `PLATEAU` | return ארוך חיובי, recent קרוב לאפס | המהלך נעצר | Challenger |
| `PULLBACK` | long positive, recent negative | נסיגה בתוך מהלך רחב | Challenger |
| `RE_ACCELERATION` | strong → weak → strong | התחזקות מחדש | Challenger |
| `WHIPSAW` | direction changes גבוהים | Noise / zigzag | Challenger |
| `EXHAUSTION_CANDIDATE` | long strong, recent weakening | אולי תשישות | Hypothesis only |

‏המילה `candidate` חשובה במיוחד ב־Exhaustion: אין להסיק שהמהלך נגמר רק מהצורה.

---

## ‏7. Use When

‏ה־Baseline מתאים כאשר:

- ‏כבר קיימים multi-horizon returns תקינים ממקטע 08.
- ‏אנחנו רוצים למדוד אם התנועה מתחזקת או נחלשת עכשיו.
- ‏אנחנו מבצעים מחקר של forward returns / MFE / MAE.
- ‏יש timestamps אמינים ו־anchor quality סבירה.
- ‏המטרה היא short-horizon continuation ולא השקעה ארוכת טווח.

---

## ‏8. Do Not Use When

‏אין להשתמש ב־Shape Features כתחליף ל־:

- ‏Data freshness.
- ‏Liquidity.
- ‏Spread.
- ‏Execution feasibility.
- ‏Activity / trade count.
- ‏Risk controls.
- ‏Forward validation.

‏אין להשתמש בהם כאשר:

```text
anchors stale
sampling structure changed silently
feature version unknown
market state invalid
```

---

## ‏9. Alternatives

### ‏A. Returns only

‏הגישה הפשוטה ביותר.

‏יתרון: KISS, יציבות, latency נמוך.

‏חיסרון: אינה מתארת אם המהלך מתחזק או נחלש.

### ‏B. Recent-vs-Previous differences

‏Baseline המומלץ.

‏יתרון: פשוט, מפורש, direction-aware כאשר שומרים גם את שני הצדדים.

### ‏C. Ratios

‏יכול להמחיש amplification.

‏חיסרון: unstable near zero.

### ‏D. Regression / slope / curvature

‏משתמש ביותר נקודות.

‏חיסרון: יותר מורכבות, sensitivity ל־sampling ול־outliers.

### ‏E. Smoothed momentum

‏פחות noisy.

‏חיסרון: lag.

### ‏F. Learned shape model

‏אפשר בעתיד לתת למודל ללמוד Pattern רב־ממדי.

‏אינו מתאים ל־Baseline לפני שיש Dataset, labels, leakage controls ו־simple baselines חזקים.

---

## ‏10. Trade-offs

| החלטה | יתרון | חיסרון |
|---|---|---|
| short segments | מזהים שינוי מוקדם | noise גבוה |
| longer segments | יציבים יותר | מאחרים |
| difference | יציב ליד אפס | פחות scale-invariant |
| ratio | intuitive amplification | explosions near zero |
| no smoothing | low lag | יותר noise |
| smoothing | פחות noise | delay |
| many shape features | יותר תיאור | redundancy / overfitting |
| few simple features | קל לשחזור | אולי מפספס structure |

---

## ‏11. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏`acceleration_score` יחיד שמערבב הכול.
- ‏Curvature מסובכת.
- ‏EMA chain על כל Horizon.
- ‏עשרות named patterns.
- ‏Ratios בלי denominator floor.
- ‏Feature explosion של 1s,2s,3s,... לכל window אפשרי.
- ‏Hard BUY rule כגון `momentum_delta_5s > X`.
- ‏Thresholds שנבחרו לפי כמה דוגמאות ידניות.

---

## ‏12. What to Add Later

‏רק אם המחקר מצדיק:

1. ‏Quote-based shape (`mid/bid/ask`).
2. ‏Activity-adjusted acceleration.
3. ‏Liquidity-adjusted shape.
4. ‏Session-normalized shape.
5. ‏Relative cross-sectional acceleration percentile.
6. ‏Adaptive window selection.
7. ‏Regression slope/curvature.
8. ‏Smoothing variants.
9. ‏Learned representation / ML.

---

## ‏13. Required Data / Evidence

‏לכל Observation מחקרי נדרש לפחות:

```text
symbol
as_of_time
price_source
raw/normalized price points or reproducible anchors
actual timestamps
anchor gaps
recent segment returns
previous segment returns
shape features
feature_set_version
universe_version
data quality flags
```

‏Labels נשמרים בנפרד:

```text
forward_1s
forward_2s
forward_5s
forward_10s
forward_30s
forward_60s
MFE_h
MAE_h
time_to_MFE
time_to_first_profit
```

‏בהמשך נדרש executable labeling על Bid/Ask + costs, לא Last בלבד.

---

## ‏14. Promotion Criteria

‏Feature Shape מקודם מ־Challenger ל־Baseline רק אם:

1. ‏הוא מוסיף predictive information מעבר ל־returns של 08.
2. ‏השיפור מופיע ב־Out-of-Sample / forward validation.
3. ‏הוא יציב במספר ימים / regimes / time-of-day buckets.
4. ‏השיפור נשאר לאחר spread, slippage, latency ו־fees.
5. ‏הוא לא נשען על few extreme outliers.
6. ‏הוא ניתן לחישוב live ללא latency משמעותי מדי.
7. ‏הוא ניתן לשחזור מ־raw/anchor data.
8. ‏הוא אינו רגיש באופן קיצוני ל־sampling artifacts.

---

## ‏15. Rejection Criteria

‏Feature נדחה או נשאר Diagnostic בלבד אם:

- ‏אין incremental value מעל returns.
- ‏הוא מועיל רק in-sample.
- ‏השיפור נעלם לאחר costs/execution modeling.
- ‏הוא נשבר ליד אפס או ב־missing data.
- ‏הוא תלוי באופן חריג ב־window אחד שנבחר בדיעבד.
- ‏הוא דורש smoothing שמאחר את האות מעבר לחיי ה־edge.
- ‏הוא יקר לחישוב ביחס לתועלת.
- ‏הוא highly correlated עם Feature פשוט יותר בלי שיפור תוצאה.

---

## ‏16. Metrics

### ‏Predictive

```text
forward return by feature bucket
median forward return
positive forward rate
MFE
MAE
time-to-MFE
time-to-first-profit
```

### ‏Incremental Value

```text
baseline returns only
vs
baseline + acceleration
vs
baseline + path features
```

‏נמדוד uplift, לא רק absolute performance.

### ‏Robustness

```text
by day
by time of day
by volatility regime
by price bucket
by liquidity bucket
by activity bucket
```

### ‏Operational

```text
feature compute latency
missing feature rate
anchor-gap distribution
stale-feature rate
memory per symbol
CPU per update
```

---

## ‏17. Failure Modes

### ‏1. Old strength mistaken for fresh strength

‏`return_60s` חזק אך `recent_5s` כמעט אפס/שלילי.

### ‏2. Burst mistaken for sustainable move

‏רוב המהלך הגיע מאירוע בודד.

### ‏3. Improving negative trend mistaken for bullish acceleration

‏`delta > 0` אך `recent < 0`.

### ‏4. Ratio explosion

‏previous כמעט אפס.

### ‏5. Sampling inconsistency

‏segments אינם שווי־זמן בפועל.

### ‏6. Anchor look-ahead

‏נבחר observation אחרי target time.

### ‏7. Whipsaw classified as momentum

‏Net return חיובי אך path מלא בזיגזגים.

### ‏8. Over-smoothing

‏Noise ירד אך האות הגיע מאוחר מדי.

### ‏9. Feature duplication

‏Velocity קבוע-window משכפל Return.

### ‏10. Shape label becomes dogma

‏לדוגמה `PULLBACK` או `EXHAUSTION` מקבלים משמעות מסחרית שלא הוכחה.

---

## ‏18. Research Design

‏הניסוי הנכון אינו:

```text
Does momentum_delta look intuitive?
```

‏אלא:

```text
Given the same baseline momentum level,
does shape feature X improve future executable outcome?
```

‏דוגמה:

```text
Bucket symbols by return_10s
Within each bucket compare:
- accelerating
- flat-rate
- decelerating
```

‏כך מנסים לבודד את תרומת ה־Shape ולא רק את עוצמת המומנטום שכבר קיימת.

---

## ‏19. Ablation Policy

‏לכל Feature חדש:

```text
Baseline
→ + one feature family
→ measure uplift
→ remove it again
→ verify performance drops consistently
```

‏אין לקדם משפחה של 10 Features יחד בלי לדעת מי מהם תרם.

---

## ‏20. Correlation / Redundancy Policy

‏נבדוק:

```text
feature correlation
rank correlation
mutual information / predictive separation where appropriate
```

‏אבל המבחן הסופי אינו correlation בלבד.

‏Feature יכול להיות correlated ועדיין להוסיף מידע שימושי; מצד שני correlation נמוך אינו מבטיח ערך מסחרי.

---

## ‏21. Precompute / Runtime Architecture

‏Baseline:

```text
market update
→ update rolling anchor state for symbol
→ update recent/previous segment returns
→ update shape features
→ attach as_of_time + feature version
→ publish current feature state
```

‏Global scan/rank קורא Feature State מוכן.

‏אין לקרוא מחדש 60 שניות של היסטוריה לכל 4,000 symbols בכל cycle.

---

## ‏22. State Required Per Symbol

‏מינימום רעיוני:

```text
latest price + timestamp
anchor points / ring buffer
recent segment boundaries
previous segment boundaries
latest returns
latest momentum deltas
freshness metadata
feature version
```

‏Extended state רק כאשר Feature מצדיק אותו.

---

## ‏23. Missingness Rules

‏אם אחד מ־anchors הדרושים אינו תקין:

```text
recent_return = null
previous_return = null
momentum_delta = null
```

‏לא:

```text
missing => 0
```

‏Zero הוא ערך כלכלי אמיתי; Missing הוא מצב נתונים.

---

## ‏24. Flat / Direction Threshold

‏במקום להגדיר:

```text
return > 0 => up
return < 0 => down
```

‏אפשר בעתיד לבדוק neutral band:

```text
abs(return) <= flat_threshold => FLAT
```

‏אבל `flat_threshold` הוא Parameter מחקרי, לא חוק טבע.

‏הוא צריך להיות versioned ולהיבדק מול tick-size/price regime/noise.

---

## ‏25. Minimum Acceptance Tests

### ‏Accelerating positive path

```text
100.00
100.05
100.10
100.20
```

‏המערכת צריכה לזהות recent strength גבוה מה־previous.

### ‏Decelerating positive path

```text
100.00
100.20
100.25
100.26
```

‏המערכת צריכה לזהות האטה למרות Return כולל חיובי.

### ‏Flat path

```text
100.00
100.00
100.00
100.00
```

‏ה־returns וה־delta צריכים להיות אפס או neutral בהתאם להגדרה.

### ‏Improving negative path

```text
100.00
99.00
98.80
```

‏Feature של שינוי בקצב יכול להיות חיובי, אך state direction עדיין שלילי.

### ‏Whipsaw path

```text
100.00
100.10
99.95
100.12
100.02
100.15
```

‏direction-change/path-efficiency features צריכים לשקף מסלול פחות נקי מעלייה רציפה דומה.

### ‏Unequal timestamps

‏Duration חייב להגיע מהזמן בפועל ולא ממספר הרשומות.

### ‏Missing anchor

‏אין ליצור Feature פיקטיבי.

### ‏Future anchor candidate

‏Observation אחרי target time חייב להידחות כ־anchor.

---

## ‏26. User-Specific Application

‏עבור המטרה שלך — רווח קטן ומהיר על שניות עד עשרות שניות — המסקנה החשובה היא:

> ‏לא מספיק למצוא את מי שעלתה הכי הרבה; צריך למדוד אם **הכוח נמצא עכשיו** או כבר נמצא בעבר הקרוב.

‏לכן הייתי מעדיף למחקר הראשוני:

```text
return level
+
recent-vs-previous delta
+
very small set of path-quality diagnostics
```

‏לפני כל Score מורכב.

‏המערכת אינה מנסה microsecond HFT; היא מנסה למצוא Move שחי מספיק זמן כדי שמערכת ביתית מדודה תוכל להגיע אליו לפני decay.

---

## ‏27. Confidence

| Recommendation | Confidence |
|---|---|
| Recent-vs-previous equal segments | High |
| Difference before ratio | High |
| Do not duplicate fixed-window return as velocity | High |
| Keep direction separate from acceleration | High |
| Positive-segment consistency adds value | Medium / unproven |
| Path efficiency adds net edge | Medium-Low / unproven |
| Re-acceleration is useful entry signal | Low / hypothesis |
| Exhaustion shape predicts reversal | Low / hypothesis |
| Regression slope beats simple features | Low / unproven |
| Smoothing improves net results | Low / regime-dependent |

---

## ‏28. Time-Sensitive Facts

‏המקטע הזה מתודולוגי ברובו ואינו תלוי כרגע ב־Broker/Venue capability שמשתנה בזמן.

‏עם זאת, לפני Implementation חי עדיין יש לאמת מחדש כל הנחה על:

- ‏Data update cadence.
- ‏Timestamp semantics.
- ‏event ordering.
- ‏feed aggregation.
- ‏historical-data granularity.

‏כי אלה יכולים לשנות את המשמעות המעשית של Shape Features.

---

## ‏29. Decision Summary

```text
P0
- no look-ahead anchors
- actual timestamps
- explicit missingness
- feature freshness/versioning

P1
- recent vs previous equal-length returns
- momentum_delta as difference
- keep direction separate
- avoid duplicate fixed-window velocity
- incremental precompute

P2
- consistency
- direction changes
- path efficiency
- current-vs-peak

P3+
- ratios
- regression slope
- smoothing
- complex named patterns
- learned shape models
```

‏ה־Principle המרכזי:

> ‏Shape Feature מתקדם רק אם הוא מוכיח **incremental out-of-sample executable value** מעבר ל־Returns הפשוטים.

---

## ‏30. What Would Change This Recommendation

‏נשנה את ה־Baseline אם Evidence יראה באופן עקבי ש־:

- ‏Ratio guarded מנצח Difference.
- ‏Slope/curvature מוסיפים uplift משמעותי אחרי costs.
- ‏Smoothing משפר net outcome למרות lag.
- ‏Path-quality features אינם מוסיפים דבר ונכון להסירם.
- ‏Window family אחרת נותנת generalization טוב יותר.
- ‏Activity/volume (מקטע 10) מסבירים כמעט את כל הערך שיוחס קודם ל־Shape.

‏עד אז נעדיף מודל פשוט, מפורש וניתן להפרכה.
