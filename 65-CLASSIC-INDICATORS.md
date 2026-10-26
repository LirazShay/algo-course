# ‏שלב 65 — `Classic Indicators`: להבין מה הם באמת, מה הם מודדים ומתי הם מוסיפים מידע

> ‏מטרת הפרק: ללמוד לעומק את האינדיקטורים הקלאסיים של Technical Analysis — לא כרשימת “איתותים”, אלא כטרנספורמציות מתמטיות של מחיר, נפח וטווח. נבין מה כל אינדיקטור מחשב, מה הוא מנסה לייצג, איזה lag הוא מוסיף, אילו הנחות הוא מסתיר, מתי הוא עשוי להיות שימושי, ומתי הוא רק ממחזר מידע שכבר נמצא ב־raw market data.
>
> ‏העיקרון המרכזי: **Indicator אינו Edge בפני עצמו. הוא Feature Candidate. הערך שלו נקבע רק לפי מידע אינקרמנטלי, יציבות מחוץ למדגם, התאמה ל־horizon, עלויות ביצוע ויכולת לשפר החלטה אמיתית.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. מהו Indicator בכלל

‏Indicator הוא פונקציה של נתוני שוק:

```text
Indicator_t = f(PriceHistory, VolumeHistory, RangeHistory, Time, ...)
```

‏ברוב המקרים הוא אינו מוסיף “מידע חדש מהשוק”.

‏הוא עושה אחד או יותר מהדברים הבאים:

- ‏Smoothing.
- ‏Normalization.
- ‏Differencing.
- ‏Scaling.
- ‏Aggregation.
- ‏Comparison בין חלונות זמן.
- ‏מיפוי לערך שקל יותר להשוות בין נכסים או תקופות.

‏לכן צריך לשאול תמיד:

```text
What raw information is this indicator compressing?
What does it discard?
How much lag does it add?
Does it add predictive information beyond simpler features?
```

---

# ‏2. Indicator אינו Signal ואינו Trade Decision

‏לדוגמה:

```text
RSI = 78
```

‏אינו אומר אוטומטית:

```text
SELL
```

‏ו־:

```text
MACD crossed upward
```

‏אינו אומר אוטומטית:

```text
BUY
```

‏הפרדה מקצועית:

```text
Raw Data
→ Indicator / Feature
→ Evidence
→ Model / Rule
→ Candidate
→ Execution Feasibility
→ Risk Gate
→ TRADE / NO TRADE
```

---

# ‏3. שלוש שאלות שחייבים לשאול על כל Indicator

1. ‏**Calculation** — מה בדיוק הנוסחה מחשבת?
2. ‏**Interpretation** — איזה phenomenon היא מנסה לייצג?
3. ‏**Incremental Value** — האם היא מוסיפה משהו מעבר ל־features שכבר קיימים?

‏אם אין תשובה טובה לשאלה השלישית, אין סיבה להוסיף complexity.

---

# ‏4. המחיר של Smoothing: Lag

‏רוב האינדיקטורים הקלאסיים עושים smoothing.

‏Smoothing מפחית noise, אבל במחיר:

```text
less noise
↔
more lag
```

‏באופק של ימים, lag של כמה bars אולי נסבל.

‏באופק של שניות, lag קטן יכול להיות כל חיי ה־signal.

‏לכן אצלנו:

```text
Indicator Lag / Signal Half-Life
```

‏הוא יחס חשוב יותר מאשר “האם האינדיקטור פופולרי”.

---

# ‏5. SMA — `Simple Moving Average`

‏ממוצע נע פשוט:

```text
SMA_N(t) = (P_t + P_{t-1} + ... + P_{t-N+1}) / N
```

‏הוא נותן משקל שווה לכל observation בחלון.

‏הוא יכול לייצג:

- ‏מיקום המחיר ביחס לרמה ממוצעת.
- ‏כיוון איטי של trend.
- ‏baseline מקומי להשוואה.

‏אבל הוא סובל מ־lag משמעותי.

---

# ‏6. מה באמת קורה כש־SMA “מסתובב”

‏ה־SMA משתנה משום ש:

```text
new value enters window
old value leaves window
```

‏לכן שינוי בשיפוע אינו בהכרח “אירוע חדש” עכשיו.

‏לפעמים הוא פשוט תוצאה של ערך ישן מאוד שיצא מהחלון.

‏זו subtelty חשובה מאוד ב־rolling features.

---

# ‏7. Price vs SMA

‏Feature פשוט:

```text
DistanceFromSMA = (Price - SMA) / SMA
```

‏אבל גם כאן צריך normalization מתאים.

‏מרחק של 0.2% יכול להיות חריג במניה שקטה ולא משמעותי במניה תנודתית.

‏לכן אפשר לשקול normalization לפי:

- ‏recent volatility.
- ‏spread.
- ‏ATR-like range.
- ‏cross-sectional distribution.

---

# ‏8. Moving Average Crossover

‏Cross קלאסי:

```text
FastMA > SlowMA
```

‏מנסה לזהות שהמגמה הקצרה חזקה מהמגמה הארוכה.

‏אבל בפועל זה שילוב של:

- ‏momentum.
- ‏smoothing.
- ‏lag.

‏אצלנו כדאי לשאול אם features ישירים של multi-horizon return ו־acceleration נותנים אותו מידע מוקדם יותר.

---

# ‏9. EMA — `Exponential Moving Average`

‏EMA נותן משקל גדול יותר לערכים חדשים.

‏נוסחה רקורסיבית:

```text
EMA_t = α * Price_t + (1 - α) * EMA_{t-1}
```

‏כאשר:

```text
α = 2 / (N + 1)
```

‏בגרסה נפוצה.

---

# ‏10. למה EMA מהיר יותר מ־SMA

‏EMA מגיב מהר יותר משום שהמשקל של observation חדש גדול יותר.

‏אבל “מהיר יותר” אינו “ללא lag”.

‏הוא עדיין filter low-pass שמחליק תנועה.

---

# ‏11. Half-Life של EMA

‏אפשר לחשוב על EMA גם דרך decay.

‏זה שימושי לנו כי אפשר להתאים smoothing ל־signal half-life במקום לבחור period שרירותי.

‏כלומר במקום:

```text
EMA(14) because everyone uses 14
```

‏עדיף לשאול:

```text
What decay horizon matches the phenomenon we are measuring?
```

---

# ‏12. WMA — `Weighted Moving Average`

‏WMA נותן weights מפורשים לערכים שונים בחלון.

‏לדוגמה:

```text
WMA = Σ(w_i * P_i) / Σ(w_i)
```

‏הוא שימושי כאשר רוצים control מפורש על memory profile.

---

# ‏13. Moving Average אינו “Support” באופן אוטומטי

‏כאשר מחיר נוגע ב־MA ואז עולה, קל לספר סיפור של support.

‏אבל צריך לבדוק:

- ‏base rate.
- ‏selection bias.
- ‏כמה פעמים המחיר חצה בלי תגובה.
- ‏אם האפקט נשאר OOS.
- ‏אם הוא קיים אחרי עלויות.

---

# ‏14. MACD — מבנה בסיסי

‏`MACD` מבוסס בדרך כלל על הפרש בין שני EMA:

```text
MACD = EMA_fast - EMA_slow
SignalLine = EMA(MACD)
Histogram = MACD - SignalLine
```

‏כלומר הוא למעשה משפחה של filtered momentum features.

---

# ‏15. MACD Histogram

‏ה־Histogram מודד את המרחק בין MACD לבין Signal Line.

‏אפשר לפרש אותו בקירוב כ:

- ‏momentum acceleration/deceleration מסונן.
- ‏שינוי בכוח היחסי בין שני horizons.

‏אבל הוא מכיל smoothing כפול ולכן lag מצטבר.

---

# ‏16. MACD Cross אינו אירוע קסום

‏Cross נוצר כאשר שתי סדרות חלקות חוצות זו את זו.

‏הוא אינו “מידע שוק חדש”.

‏צריך להשוות אותו ל־features ישירים יותר:

```text
return_100ms
return_1s
return_5s
velocity
acceleration
```

‏ולבדוק אם MACD מוסיף incremental value.

---

# ‏17. RSI — רעיון בסיסי

‏`RSI` משווה גודל ממוצע של עליות לגודל ממוצע של ירידות.

‏בגרסה הקלאסית:

```text
RS = AverageGain / AverageLoss
RSI = 100 - 100 / (1 + RS)
```

---

# ‏18. RSI הוא Normalized Momentum

‏RSI אינו “מדד קניות/מכירות” ישיר.

‏הוא דרך לנרמל את היחס בין תנועות חיוביות לשליליות לטווח 0–100.

---

# ‏19. “Overbought” אינו בהכרח bearish

‏RSI גבוה יכול להופיע דווקא במהלך momentum חזק ומתמשך.

‏לכן:

```text
RSI > 70
```

‏אינו הוכחה לירידה קרובה.

‏זה יכול להיות:

- ‏trend persistence.
- ‏short-term exhaustion.
- ‏שום דבר שימושי.

‏רק data יכול להכריע.

---

# ‏20. RSI Divergence

‏Divergence קלאסי:

```text
Price makes higher high
RSI makes lower high
```

‏הפרשנות היא weakening momentum.

‏אבל divergence חשוף מאוד ל־subjectivity אם אינו מוגדר אלגוריתמית.

‏לכן ב־Algo צריך להגדיר במדויק:

- ‏pivot detection.
- ‏lookback.
- ‏minimum separation.
- ‏noise tolerance.
- ‏point-in-time availability.

---

# ‏21. Stochastic Oscillator

‏ממקם את המחיר ביחס לטווח recent high-low:

```text
%K = 100 * (Close - LowestLow) / (HighestHigh - LowestLow)
```

‏הוא מנסה לענות:

```text
Where is price inside its recent range?
```

---

# ‏22. Stochastic הוא Position-in-Range Feature

‏במקום לחשוב עליו כ־“overbought/oversold”, אפשר לראות אותו פשוט כ־normalized range location.

‏זה הופך אותו ליותר ברור מחקרית.

---

# ‏23. Williams %R

‏`Williams %R` דומה מאוד ל־Stochastic, רק scaling/sign שונים.

‏זה מלמד עיקרון חשוב:

> ‏שני indicators עם שמות שונים יכולים להיות כמעט אותו Feature מתמטי.

‏אסור לספור אותם כשתי Evidence עצמאיות.

---

# ‏24. Indicator Redundancy

‏אם מוסיפים:

```text
RSI
Stochastic
Williams %R
ROC
MACD
```

‏יכול להיראות שיש “חמישה signals”.

‏בפועל כולם יכולים להיות transformations שונים של אותו price momentum.

‏זה יוצר false confidence.

---

# ‏25. ROC — `Rate of Change`

‏Feature ישיר:

```text
ROC_N = (P_t / P_{t-N}) - 1
```

‏זה כמעט בדיוק מה שאנחנו כבר עושים ב־multi-horizon returns.

‏לרוב הוא interpretable ופשוט יותר מאינדיקטורים מורכבים.

---

# ‏26. Momentum Indicator

‏גרסה פשוטה:

```text
Momentum_N = P_t - P_{t-N}
```

‏אבל absolute price difference אינו cross-symbol comparable.

‏לכן בדרך כלל אחוז/return עדיף כאשר משווים מניות שונות.

---

# ‏27. Bollinger Bands

‏בגרסה נפוצה:

```text
Middle = SMA_N
Upper = SMA_N + k * StdDev_N
Lower = SMA_N - k * StdDev_N
```

‏הם משלבים:

- ‏local level.
- ‏local volatility.
- ‏distance from mean.

---

# ‏28. Bollinger Width

```text
BandWidth = (Upper - Lower) / Middle
```

‏יכול לשמש proxy ל־recent volatility/compression.

‏אבל חשוב להבין שה־StdDev עצמו תלוי sampling horizon ובמבנה הנתונים.

---

# ‏29. Band Breakout אינו בהכרח Signal

‏מחיר מעל Upper Band יכול להיות:

- ‏continuation.
- ‏temporary overshoot.
- ‏volatility expansion.
- ‏data artifact.

‏ה־Band אומר שהמחיר רחוק יחסית מה־recent distribution; הוא לא אומר מה יקרה אחר כך.

---

# ‏30. Bollinger Squeeze

‏Band Width נמוך מתפרש לעיתים כ־compression לפני expansion.

‏זו hypothesis לגיטימית לבדיקה.

‏אבל יש להגדיר:

- ‏compression percentile.
- ‏minimum duration.
- ‏breakout definition.
- ‏direction.
- ‏post-breakout execution feasibility.

---

# ‏31. Standard Deviation אינה Volatility מלאה

‏Rolling standard deviation הוא estimator אחד.

‏הוא לא מתאר בהכרח:

- ‏jump risk.
- ‏tail behavior.
- ‏microstructure noise.
- ‏spread changes.
- ‏liquidity collapse.

---

# ‏32. ATR — `Average True Range`

‏`True Range` קלאסי לוקח maximum של:

```text
High - Low
abs(High - PreviousClose)
abs(Low - PreviousClose)
```

‏ו־ATR מחליק אותו לאורך זמן.

---

# ‏33. ATR אינו Directional

‏ATR מודד גודל תנועה/טווח, לא כיוון.

‏לכן ATR גבוה אינו bullish או bearish.

---

# ‏34. ATR ל־Normalization

‏ATR יכול לשמש denominator:

```text
MoveInATRUnits = PriceMove / ATR
```

‏אבל באופק שלנו, bar-based ATR קלאסי עלול להיות איטי מדי.

‏אפשר להשתמש ברעיון הכללי של recent range/volatility normalization עם horizons מותאמים.

---

# ‏35. Donchian Channels

‏מבוססים על rolling high/low:

```text
Upper = HighestHigh_N
Lower = LowestLow_N
```

‏הם מייצגים breakout boundary פשוט.

---

# ‏36. Breakout Distance

‏Feature שימושי יותר מה־name:

```text
DistanceToRecentHigh
DistanceToRecentLow
```

‏אפשר לנרמל לפי spread/volatility.

---

# ‏37. Breakout Quality

‏עצם חציית recent high אינה מספיקה.

‏אפשר למדוד:

- ‏speed into breakout.
- ‏trade rate.
- ‏volume acceleration.
- ‏order-flow support.
- ‏spread behavior.
- ‏follow-through.
- ‏giveback after breakout.

---

# ‏38. False Breakout

‏זה מתחבר ישירות ל־60A.

‏אם מניה פורצת repeatedly ואז חוזרת מיד, אפשר לבנות `Negative Memory` של failed breakout.

‏לא חייבים להכניס את זה לציון החיובי.

---

# ‏39. ADX — `Average Directional Index`

‏ADX נועד למדוד strength של trend, לא direction.

‏הוא נגזר מ־Directional Movement ו־smoothed ranges.

---

# ‏40. +DI / -DI

‏המערכת של Wilder כוללת:

```text
+DI
-DI
ADX
```

‏כאשר +DI/-DI מנסים למדוד directional movement relative to range.

---

# ‏41. ADX מוסיף Lag רב

‏יש בו כמה שכבות smoothing.

‏לכן הוא עשוי להיות שימושי יותר כ־regime/context feature מאשר trigger קצר מאוד.

---

# ‏42. CCI — `Commodity Channel Index`

‏CCI מודד מרחק של typical price מממוצע, normalized לפי mean deviation.

‏למרות השם, משתמשים בו גם במניות.

---

# ‏43. Typical Price

‏אינדיקטורים שונים משתמשים ב:

```text
(H + L + C) / 3
```

‏או וריאציות דומות.

‏צריך לזכור: ברים מאגדים path שלם לנקודות summary ומאבדים event ordering.

---

# ‏44. VWAP — `Volume Weighted Average Price`

‏לסדרה של trades:

```text
VWAP = Σ(Price_i * Volume_i) / Σ(Volume_i)
```

‏זה benchmark חשוב, אבל semantics תלויים בחלון ובמקור הנתונים.

---

# ‏45. Session VWAP מול Rolling VWAP

‏אלה שני דברים שונים:

```text
Session VWAP
Rolling VWAP
Anchored VWAP
```

‏אסור להשתמש בשם `VWAP` בלי להגדיר anchor/window.

---

# ‏46. VWAP אינו “מחיר הוגן” אוטומטי

‏VWAP אומר איפה נסחר notional משוקלל בנפח.

‏הוא אינו מבטיח שהמחיר יחזור אליו.

---

# ‏47. VWAP as Context

‏שימוש אפשרי:

```text
DistanceFromVWAP
VWAPSlope
CrossingFrequency
TimeAboveVWAP
```

‏אבל כל אחד מהם צריך validation עצמאי.

---

# ‏48. Anchored VWAP

‏אפשר לעגן VWAP לאירוע:

- ‏session open.
- ‏breakout.
- ‏news event.
- ‏local pivot.

‏אבל anchor שנבחר בדיעבד יוצר look-ahead/selection bias.

---

# ‏49. OBV — `On-Balance Volume`

‏OBV מוסיף volume כאשר price close עולה ומחסיר כאשר הוא יורד.

‏הרעיון: cumulative signed volume proxy.

---

# ‏50. הבעיה ב־OBV

‏כל volume של bar מקבל אותו sign לפי close-to-close direction.

‏זה coarse מאוד ביחס ל־trade-level flow.

‏אצלנו trade signing/order-flow features עשויים להיות אינפורמטיביים יותר.

---

# ‏51. Volume Moving Average

‏Moving average של volume יכול לתת baseline לפעילות.

‏אבל volume intraday אינו stationary.

‏ההשוואה הנכונה יכולה לדרוש time-of-day normalization.

---

# ‏52. Relative Volume — `RVOL`

‏רעיון שימושי:

```text
CurrentActivity / ExpectedActivityForComparableContext
```

‏אבל denominator חייב להיות מוגדר היטב.

---

# ‏53. RVOL לפי Time-of-Day

‏השוואת volume ב־09:35 לממוצע יומי מלא היא חסרת משמעות.

‏עדיף context דומה:

```text
same minute-of-session
same horizon
similar regime
```

---

# ‏54. MFI — `Money Flow Index`

‏MFI משלב price ו־volume ומכונה לעיתים “volume-weighted RSI”.

‏גם כאן צריך לבדוק אם הוא מוסיף מידע מעבר ל־price momentum + volume features ישירים.

---

# ‏55. Accumulation/Distribution Line

‏מנסה להעריך אם volume נוטה להצטבר קרוב ל־high או low של bar.

‏אך שוב, bar path אבוד.

‏ב־short horizon trade-level data עשוי להיות עדיף משמעותית.

---

# ‏56. Chaikin Money Flow

‏נגזר מ־position of close בתוך high-low range ומשקל volume.

‏אפשר לפרש אותו כ־bar-level pressure proxy.

‏לא כ־true order flow.

---

# ‏57. Volume Profile

‏Volume Profile מחלק traded volume לפי price levels.

‏הוא יכול לזהות:

- ‏high-volume nodes.
- ‏low-volume nodes.
- ‏value areas.

‏אבל הוא summary של היסטוריה, לא guarantee of future liquidity.

---

# ‏58. Volume-at-Price מול Displayed Depth

‏אלה שני מושגים שונים:

```text
Historical traded volume at price
!=
Current resting liquidity at price
```

‏אסור לבלבל ביניהם.

---

# ‏59. Pivot Points

‏Pivot Points משתמשים בדרך כלל ב־previous period high/low/close ליצירת levels.

‏זה rule-based level generation.

‏הערך שלו צריך להיבדק empirically, לא משום שהוא “מוכר”.

---

# ‏60. Support/Resistance כ־Feature Engineering

‏במקום ציור ידני, אפשר להגדיר:

- ‏distance to recent high/low.
- ‏touch count.
- ‏rejection count.
- ‏time since level formed.
- ‏volume near level.
- ‏break/reclaim behavior.

---

# ‏61. Ichimoku

‏Ichimoku משלב כמה midpoint/range transformations עם forward/backward shifts.

‏הוא עשיר ויזואלית, אבל מכיל כמה features correlated.

---

# ‏62. Forward Plotting אינו Future Information

‏בחלק מה־Ichimoku lines הערך מחושב מהעבר אך מצויר קדימה.

‏ב־Backtest צריך להשתמש ב־information availability, לא במיקום הוויזואלי על chart.

---

# ‏63. Parabolic SAR

‏אינדיקטור trend-following שמייצר trailing reference level המשתנה לפי acceleration factor.

‏הוא יכול לשמש inspiration ל־dynamic trailing logic, אבל אינו בהכרח מתאים ל־short horizon שלנו.

---

# ‏64. Supertrend

‏בדרך כלל משלב ATR עם trailing bands ומצב trend.

‏זה בעצם state machine מעל volatility-adjusted bands.

---

# ‏65. Indicators as State Machines

‏חלק מהאינדיקטורים אינם רק number.

‏הם עוברים state:

```text
bullish
bearish
neutral
```

‏ב־Algo צריך להגדיר transition semantics במפורש.

---

# ‏66. Stateful Indicator Restart Problem

‏אם indicator דורש history, restart יכול לתת ערך שגוי עד warm-up.

‏צריך לדעת:

- ‏minimum history.
- ‏warm-up length.
- ‏readiness state.
- ‏whether restored state equals recomputed state.

---

# ‏67. Indicator Warm-Up

‏אסור להשתמש ב־indicator לפני שיש מספיק observations.

‏Missing history אינו zero.

‏מצב נכון:

```text
NOT_READY
```

---

# ‏68. Bar-Based Indicator על Event Data

‏אם בונים bars מ־ticks, תוצאת indicator תלויה ב־bar construction:

- ‏time bars.
- ‏tick bars.
- ‏volume bars.
- ‏dollar bars.

‏אותו market יכול להיראות שונה.

---

# ‏69. Time Bars

‏פשוטים ונוחים, אבל מספר events בכל bar משתנה מאוד.

‏בשוק מהיר bar אחד יכול להכיל מאות trades ובשוק שקט כמעט כלום.

---

# ‏70. Tick Bars

‏כל bar מכיל מספר קבוע של trades/events.

‏הזמן הקלנדרי של כל bar משתנה.

---

# ‏71. Volume Bars

‏כל bar מכיל target volume.

‏זה מתאים activity normalization מסוים, אבל משנה את semantics של time.

---

# ‏72. Event-Time Indicators

‏למערכת שלנו, לעיתים עדיף לחשב feature ישירות ב־event time ולא לכפות bars.

‏לדוגמה:

```text
EWMA return
trade-rate acceleration
signed-flow EWMA
quote imbalance decay
```

---

# ‏73. Indicator Period אינו יחידת זמן

```text
RSI(14)
```

‏אינו אומר דבר עד שמגדירים מהו bar.

‏14 שניות, 14 trades ו־14 דקות הם phenomena שונים לחלוטין.

---

# ‏74. Sampling Aliasing

‏אם תנועה מתרחשת בתוך interval ונעלמת לפני sample הבא, indicator על samples יכול לא לראות אותה כלל.

‏זה קריטי באופק קצר.

---

# ‏75. Classic Indicator Parameters הם Conventions

‏מספרים כמו:

```text
14
20
50
200
12/26/9
```

‏הם conventions היסטוריים, לא חוקי טבע.

‏אין סיבה להניח שהם מתאימים ל־micro/short-horizon system.

---

# ‏76. Parameter Mining

‏אם בודקים 200 combinations של RSI period/threshold ובוחרים את הטוב ביותר, נוצר multiple-testing risk.

‏אותו כלל חל על indicators כמו על כל feature אחר.

---

# ‏77. Prefer Parameter Plateaus

‏עדיף אזור שבו תוצאה טובה במספר settings קרובים מאשר optimum חד:

```text
13 works
14 great
15 terrible
```

‏זו fragility warning.

---

# ‏78. Indicator Normalization Cross-Sectionally

‏ב־scanner של אלפי מניות, raw indicator value לא תמיד comparable.

‏אפשר לשקול:

- ‏percentile rank.
- ‏z-score robust.
- ‏volatility normalization.
- ‏spread normalization.
- ‏liquidity bucket normalization.

---

# ‏79. Cross-Sectional RSI

‏במקום threshold קבוע:

```text
RSI > 70
```

‏אפשר לחקור:

```text
RSI percentile among fresh eligible symbols
```

‏אבל זו hypothesis אחרת וצריכה validation נפרד.

---

# ‏80. Indicator Age

‏לכל indicator צריך לדעת:

```text
UnderlyingDataAge
ComputedAt
DecisionAge
```

‏ערך טוב על data stale הוא לא ערך טוב.

---

# ‏81. Torn Indicator State

‏אם price updated אבל volume/quote fields עדיין מ־generation קודם, feature composite יכול להיות לא קוהרנטי.

‏צריך consistency semantics.

---

# ‏82. Indicator Confidence

‏אפשר להפריד:

```text
Value
Confidence
Freshness
Readiness
```

‏במקום מספר בודד.

---

# ‏83. Missing אינו Neutral

‏אם ATR/RSI/volume baseline חסרים, אסור להפוך אותם ל־0 ולתת למודל לפרש אותם כאות אמיתי.

---

# ‏84. Indicator Correlation Matrix

‏לפני שמכניסים הרבה indicators, בודקים redundancy.

‏לא רק Pearson correlation, אלא גם:

- ‏rank correlation.
- ‏conditional correlation.
- ‏decision overlap.
- ‏feature importance stability.

---

# ‏85. Decision Overlap

‏שאלה שימושית:

```text
How often do two indicators change the same decision?
```

‏אם כמעט תמיד, אולי אחד מיותר.

---

# ‏86. Feature Ablation

‏מסירים indicator אחד ובודקים:

- ‏OOS performance.
- ‏candidate set.
- ‏trade/no-trade decisions.
- ‏execution quality.
- ‏stability.

---

# ‏87. Incremental Information

‏הבדיקה החשובה אינה:

```text
Does RSI correlate with future return?
```

‏אלא:

```text
Does RSI add information after our existing momentum, activity, liquidity and order-flow features?
```

---

# ‏88. Indicators and Leakage

‏Indicator עצמו יכול להיות causally correct, אבל pipeline סביבו יכול לדלוף future data.

‏דוגמאות:

- ‏bar close known only after bar completes.
- ‏daily high used before session ends.
- ‏revised data.
- ‏future-normalized percentile.

---

# ‏89. Bar Close Availability

‏אם strategy “קונה ב־bar close” לפי indicator שחושב מאותו close, צריך להוסיף processing/submission delay.

‏אי אפשר לקבל את close ולבצע בו באותה נקודה בלי latency.

---

# ‏90. Indicator Repainting

‏חלק ממערכות chart משנות ערכים היסטוריים או משתמשות ב־incomplete current bar.

‏ב־Algo צריך להגדיר:

```text
finalized value
vs
live evolving value
```

---

# ‏91. Current-Bar Indicator

‏Indicator על bar פתוח יכול להשתנות עשרות פעמים לפני close.

‏אם משתמשים בו live, backtest חייב לשחזר את evolution ולא רק final bar value.

---

# ‏92. Multi-Timeframe Indicators

‏שילוב 1s + 10s + 1m יכול לתת context רב־אופקי.

‏אבל alignment חייב להיות point-in-time correct.

---

# ‏93. Multi-Timeframe Leakage

‏אם 1-minute bar מסתיים ב־10:31:00, ערכו המלא לא היה ידוע ב־10:30:25.

‏זו טעות נפוצה מאוד.

---

# ‏94. Indicator Confirmation

‏“שני indicators מאשרים” נשמע חזק, אבל אם שניהם נגזרים מאותו price path, הם לא בהכרח independent evidence.

---

# ‏95. Orthogonal Evidence

‏Evidence חזק יותר עשוי להגיע ממקורות שונים:

```text
Price momentum
+ trade activity
+ liquidity/executability
+ order flow
+ negative-veto absence
```

‏במקום חמישה oscillators על אותו close.

---

# ‏96. Trend Indicators מול Mean-Reversion Indicators

‏יש indicators שנוטים לשרת hypotheses שונות:

```text
trend persistence
vs
mean reversion
```

‏אותו RSI גבוה יכול להתפרש הפוך תחת שני models שונים.

---

# ‏97. Regime Dependency

‏Indicator יכול לעבוד ב־trend regime ולהיכשל ב־chop regime, או להפך.

‏לכן לא מודדים רק average result.

---

# ‏98. Volatility Regime

‏Threshold קבוע יכול לשנות משמעות בין low-vol ו־high-vol.

‏Normalization/regime conditioning עשויים להיות חשובים יותר מה־indicator עצמו.

---

# ‏99. Liquidity Regime

‏Indicator predictive על illiquid stock אינו בהכרח executable.

‏Prediction ו־Execution צריכים להישאר מופרדים.

---

# ‏100. Time-of-Day Effects

‏Indicator behavior ב־open, midday ו־close יכול להיות שונה מאוד.

‏אצלנו יש לבדוק context buckets ולא להניח stationarity.

---

# ‏101. Classic Indicators בשוק קצר מאוד

‏באופק מילישניות־עד־שניות, אינדיקטורים קלאסיים רבים סובלים מ:

- ‏too much smoothing.
- ‏bar construction delay.
- ‏sampling loss.
- ‏redundancy מול raw features.
- ‏poor execution awareness.

---

# ‏102. מה כן אפשר לקחת מהם

‏הערך הגדול הוא לעיתים **הרעיון**, לא היישום הקלאסי.

‏לדוגמה:

```text
RSI idea       → normalized directional persistence
MACD idea      → multi-horizon momentum difference
Bollinger idea → deviation normalized by recent variability
ATR idea       → local movement scale
VWAP idea      → volume-weighted benchmark
Donchian idea  → recent breakout boundary
```

---

# ‏103. Re-Express the Indicator

‏לפני שימוש באינדיקטור, נסה לכתוב אותו מחדש כ־plain features.

‏זה עוזר להבין מה באמת הוא מודד.

---

# ‏104. Example: MACD Re-Expression

‏במקום “MACD bullish”, אפשר לחשוב:

```text
fast smoothed price trend
minus
slow smoothed price trend
```

‏ואז לבדוק אם returns/velocity/acceleration נותנים signal נקי ומהיר יותר.

---

# ‏105. Example: RSI Re-Expression

‏במקום “RSI 80”, אפשר לחשוב:

```text
recent positive movement magnitude
relative to
recent negative movement magnitude
```

‏זה הרבה יותר ברור למחקר.

---

# ‏106. Example: Bollinger Re-Expression

```text
DistanceFromRecentMean / RecentDispersion
```

‏זה standardized deviation feature.

---

# ‏107. Example: Stochastic Re-Expression

```text
PositionWithinRecentRange
```

‏פשוט, interpretable וקל לבדיקה.

---

# ‏108. Indicator as Feature, Not Rule

‏Baseline מקצועי יותר:

```text
indicator_value
indicator_slope
indicator_age
indicator_percentile
indicator_regime
```

‏ולא:

```text
if RSI > 70 then sell
```

---

# ‏109. Indicator Slope

‏לפעמים derivative של indicator חשוב יותר מהרמה.

‏אבל derivative amplifies noise.

‏צריך smoothing/robustness מתאים.

---

# ‏110. Indicator Acceleration

‏שינוי בשיפוע יכול לזהות turning behavior מוקדם יותר, אבל גם מגדיל false positives.

---

# ‏111. Indicator Persistence

‏אפשר למדוד כמה זמן condition נשאר נכון:

```text
TimeAboveThreshold
ConsecutivePositiveUpdates
PersistenceScore
```

---

# ‏112. Threshold Crossing Hysteresis

‏בלי hysteresis, indicator סביב threshold יכול לייצר flip-flop:

```text
69.9
70.1
69.8
70.2
```

‏אפשר להשתמש ב־entry/exit thresholds שונים או persistence rule.

---

# ‏113. Debounce vs Real Signal

‏Debounce מפחית churn אבל מוסיף delay.

‏שוב trade-off:

```text
stability
↔
latency
```

---

# ‏114. Indicator-Based Veto

‏Indicator יכול לשמש לא רק score חיובי אלא Negative Evidence.

‏לדוגמה, pattern שנמצא OOS כמסוכן יכול להפוך `Soft Penalty` או `Cooldown` ב־60A.

---

# ‏115. Hard Veto דורש Evidence חזק יותר

‏לא הופכים indicator threshold ל־Hard Veto רק כי נראה אינטואיטיבי.

‏Hard Veto מבטל opportunities ולכן מחיר הטעות שלו גבוה.

---

# ‏116. Indicator and Execution State

‏Feature יכול להיראות bullish אבל:

```text
spread widened
book thinned
rank is stale
signal aged
```

‏ולכן ההחלטה עדיין `NO TRADE`.

---

# ‏117. Indicators לא יודעים על Fill Probability

‏רוב האינדיקטורים הקלאסיים אינם execution-aware.

‏זה חסרון מהותי לרובוט קצר.

---

# ‏118. Indicators לא יודעים על Adverse Selection

‏גם אם signal predictive, ייתכן שה־fills שתקבל הם דווקא subset רע.

‏צריך markout analysis נפרד.

---

# ‏119. Indicators לא יודעים על Queue

‏`RSI`, ‏`MACD` או `ADX` לא מספרים כמה volume לפניך ב־Bid.

‏לכן אינם תחליף ל־execution features.

---

# ‏120. Indicators לא יודעים על Hidden Liquidity

‏Classic TA ו־microstructure הם שכבות שונות.

‏אין לערבב אותן כאילו האחת מחליפה את השנייה.

---

# ‏121. Indicator-Based Backtest צריך Realistic Execution

‏גם אם indicator מחושב נכון, PnL יכול להיות מזויף אם:

- ‏entry at signal price.
- ‏zero latency.
- ‏touch = fill.
- ‏zero spread.
- ‏instant exit.

---

# ‏122. Signal Timestamp

‏לכל indicator event צריך:

```text
DataCutoffTime
IndicatorComputedAt
DecisionAt
OrderSubmittedAt
```

---

# ‏123. Feature Versioning

‏אם משנים formula/period/smoothing, זה feature חדש.

‏צריך versioning כדי לדעת איזה trades נוצרו מאיזו הגדרה.

---

# ‏124. Formula Semantics

‏Libraries שונות עשויות לחשב אותו indicator מעט אחרת:

- ‏initialization.
- ‏smoothing convention.
- ‏missing data handling.
- ‏warm-up.

‏אסור להניח ששני `RSI(14)` זהים.

---

# ‏125. Golden Vectors

‏כדאי לשמור input קטן עם expected outputs כדי לוודא implementation parity.

---

# ‏126. Online/Offline Parity

‏אותו indicator צריך לתת אותה תוצאה ב־Replay וב־Live עבור אותו event stream.

---

# ‏127. Incremental Calculation

‏ב־scanner של אלפי מניות, recalculation מלא על history בכל tick מיותר.

‏עדיף rolling/incremental state כאשר הנוסחה מאפשרת.

---

# ‏128. Numerical Stability

‏Rolling variance ו־long-running EMA יכולים לצבור numerical differences.

‏צריך tests ו־reset/recompute strategy לפי צורך.

---

# ‏129. Memory Cost

‏Indicators רבים × 4,000 symbols × הרבה horizons יכולים להפוך ל־state explosion.

‏כל feature צריך להצדיק את העלות שלו.

---

# ‏130. Computation Budget

‏Indicator איטי שגורם ל־decision age גדול יותר יכול למחוק את הערך שהוא מוסיף.

---

# ‏131. Feature ROI

‏אפשר לחשוב:

```text
Feature ROI = Decision Improvement / Complexity Cost
```

‏כאשר complexity כולל:

- ‏CPU.
- ‏memory.
- ‏latency.
- ‏testing.
- ‏debugging.
- ‏research degrees of freedom.

---

# ‏132. More Indicators Can Reduce Quality

‏יותר features יכולים לגרום ל:

- ‏overfitting.
- ‏correlation clutter.
- ‏unstable weights.
- ‏harder RCA.
- ‏slower hot path.

---

# ‏133. Start Simple

‏Baseline טוב למחקר יכול להתחיל מ:

```text
multi-horizon returns
activity
volatility/range
spread/liquidity
flow
freshness
```

‏ורק אחר כך לבדוק אם classic indicators מוסיפים incremental edge.

---

# ‏134. Classic Indicators as Challenger Features

‏גישה טובה אצלנו:

```text
Champion = simple interpretable raw-derived features
Challenger = classic indicator adaptation
```

‏ולא להפך.

---

# ‏135. Shadow Evaluation

‏Indicator חדש יכול לרוץ ב־Shadow:

- ‏לחשב value.
- ‏לשמור candidate impact.
- ‏לא להשפיע על live decision.

‏ואז להשוות.

---

# ‏136. Decision Impact Analysis

‏שאלות:

```text
How many decisions would change?
Which symbols change?
Do changed decisions improve net outcome?
Does it mainly add trades or remove trades?
```

---

# ‏137. Feature Promotion Criteria

‏לפני promotion:

- ‏incremental OOS value.
- ‏robustness.
- ‏realistic execution survival.
- ‏latency/cost stress.
- ‏reasonable complexity.
- ‏explainability.

---

# ‏138. Feature Rejection Criteria

‏דוחים אם:

- ‏value vanishes OOS.
- ‏only narrow parameter works.
- ‏redundant with simpler feature.
- ‏adds latency without decision benefit.
- ‏benefit disappears after costs.

---

# ‏139. Classic Indicator Library Is Not a Strategy

‏התקנת library עם 100 indicators אינה research progress.

‏התקדמות היא:

```text
hypothesis
→ feature
→ experiment
→ evidence
→ decision
```

---

# ‏140. Chart Familiarity Bias

‏Indicator שנראה “ברור” על chart לאחר מעשה יכול להיות חסר ערך בזמן אמת.

‏זו צורה של hindsight bias.

---

# ‏141. Visual Pattern Bias

‏עין אנושית מצוינת בלמצוא patterns, גם כשהם מקריים.

‏כל pattern chart צריך formalization ו־test.

---

# ‏142. Indicator Popularity Is Not Evidence

‏פופולריות יכולה להיות סיבה לבדוק רעיון, לא סיבה להשתמש בו.

---

# ‏143. Self-Fulfilling Hypothesis

‏לעיתים נטען ש־levels/indicators עובדים כי הרבה משתתפים מסתכלים עליהם.

‏זו hypothesis אפשרית, אך עדיין צריך evidence אמפירי ובהתאם לנכס/horizon.

---

# ‏144. Crowding Can Reverse the Benefit

‏גם אם הרבה משתתפים משתמשים באותו signal, התוצאה יכולה להיות:

- ‏faster reaction.
- ‏earlier exhaustion.
- ‏false breakouts.
- ‏adverse selection.

---

# ‏145. Leading vs Lagging Indicator

‏החלוקה הפופולרית “leading/lagging” לעיתים פשטנית מדי.

‏כל indicator מחושב מהעבר; השאלה האמיתית היא אם transformation שלו עוזר לחזות distribution עתידי.

---

# ‏146. Indicator Value Distribution

‏לא רק threshold.

‏צריך לבדוק:

- ‏histogram.
- ‏tails.
- ‏regime shifts.
- ‏missingness.
- ‏stability over time.

---

# ‏147. Calibration

‏אם RSI 80 נצפה, מה empirical distribution של future outcome?

‏זו שאלה טובה יותר מ־“80 זה overbought?”.

---

# ‏148. Monotonicity

‏האם higher indicator value באמת מוביל באופן monotonic לתוצאה חזקה יותר?

‏אם לא, threshold logic עלול להיות מטעה.

---

# ‏149. Nonlinear Relationship

‏ייתכן שה־edge נמצא רק באמצע הטווח או משתנה לפי regime.

‏לכן binning/conditional analysis חשובים.

---

# ‏150. Interaction Effects

‏Indicator יכול להיות חסר ערך לבדו אך שימושי בתנאים מסוימים:

```text
high momentum
AND high activity
AND tight spread
AND no veto
```

---

# ‏151. Don’t Turn Interaction into Rule Explosion

‏אם מוסיפים עשרות `if`, אפשר להתאים כל dataset.

‏צריך disciplined experiment design.

---

# ‏152. Classic Indicators and ML

‏אפשר לתת indicators כ־features למודל, אבל ML לא “מתקן” feature גרוע אוטומטית.

‏הוא גם יכול overfit redundancy.

---

# ‏153. Raw Features vs Handcrafted Indicators in ML

‏צריך לבדוק שתי חלופות:

```text
raw interpretable inputs
vs
handcrafted technical indicators
```

‏ולא להניח שהשנייה טובה יותר.

---

# ‏154. Feature Leakage via Normalization

‏אם z-score משתמש בסטטיסטיקה של כל dataset כולל העתיד, יש leakage.

‏Normalization חייב להיות point-in-time.

---

# ‏155. Cross-Sectional Percentile Leakage

‏Percentile בזמן t חייב להשתמש רק ב־symbols/data הזמינים בזמן t.

---

# ‏156. Universe Bias

‏Indicator study על stocks ששרדו עד היום יכול להיראות טוב מדי.

‏אותם כללי historical universe חלים גם כאן.

---

# ‏157. Corporate Actions

‏SMA/RSI/ATR על prices שאינם adjusted/normalized נכון סביב split יכולים להתפוצץ.

‏Data semantics קודמים ל־indicator semantics.

---

# ‏158. Halts and Gaps

‏Indicator אחרי halt/resume יכול להיות חסר משמעות זמנית אם history context אינו מתאים.

‏אפשר לדרוש warm-up/recovery state.

---

# ‏159. Feed Switch

‏אם Market Data Provider משתנה, distribution של indicator עלול להשתנות בגלל feed semantics ולא market behavior.

---

# ‏160. Provider Generation

‏אחרי reconnect/failover כדאי לשייך features ל־`DataGeneration` כדי לא לערבב state ישן וחדש בלי בדיקה.

---

# ‏161. Indicators for Exit

‏Indicator שנחקר ל־Entry אינו אוטומטית מתאים ל־Exit.

‏Exit objective שונה:

```text
preserve remaining edge
reduce giveback
control downside
flatten reliably
```

---

# ‏162. Exit Indicator Delay

‏ב־short horizon, waiting for slow MACD/RSI reversal כדי לצאת עלול להיות מאוחר מדי.

---

# ‏163. Faster Exit Evidence

‏ל־Exit ייתכן שערך גדול יותר מגיע מ:

- ‏price response failure.
- ‏flow reversal.
- ‏spread deterioration.
- ‏rank collapse.
- ‏veto trigger.
- ‏time-to-target failure.

---

# ‏164. Indicators for Regime Detection

‏אינדיקטורים איטיים יכולים להיות שימושיים יותר כ־context:

- ‏trend regime.
- ‏volatility regime.
- ‏compression/expansion.

‏ולא כ־entry trigger.

---

# ‏165. Long Horizon Context + Short Horizon Trigger

‏ארכיטקטורה אפשרית:

```text
slow context feature
+
fast event-driven trigger
```

‏אבל יש לבדוק אם context באמת משפר precision/net edge.

---

# ‏166. Indicator Families במקום Names

‏עדיף לחשוב לפי family:

```text
Trend
Momentum
Range/Volatility
Position-in-Range
Volume/Activity
Benchmark Distance
Breakout/Level
```

‏מאשר לזכור מאות שמות.

---

# ‏167. Family-Level Redundancy

‏אם כבר יש 4 momentum features, indicator חמישי מאותה family צריך justification חזק יותר.

---

# ‏168. Practitioner Secret — Indicators Are Often Feature Templates

‏מקצוען יכול להשתמש ב־RSI/MACD/Bollinger פחות כ“חוקים” ויותר כהשראה ל־feature design.

---

# ‏169. Practitioner Secret — Lag Is Often the Hidden Cost

‏Indicator יכול להיראות יציב יותר פשוט כי הוא איטי יותר.

‏אבל היציבות הזו יכולה להגיע אחרי שה־edge כבר נעלם.

---

# ‏170. Practitioner Secret — Same Data, Different Names

‏הרבה indicator stacks נותנים אשליה של diversity כאשר כולם נגזרים מאותו close series.

---

# ‏171. Practitioner Secret — Thresholds Create False Certainty

‏המספר 70 ב־RSI אינו גבול טבעי בשוק.

‏Threshold חייב להיות evidence-based.

---

# ‏172. Practitioner Secret — Indicator Failure Can Be Regime Information

‏אם feature שפעם עבד מפסיק להיות calibrated, זה יכול להיות signal ל־regime drift או data drift.

---

# ‏173. Practitioner Secret — Simpler Feature Is Often Better for RCA

‏אם `return_1s` נכשל, קל להבין.

‏אם composite indicator עם 5 smoothing layers נכשל, קשה יותר לייחס סיבה.

---

# ‏174. Practitioner Secret — Don’t Optimize the Chart

‏המטרה אינה ליצור chart שנראה “נקי”.

‏המטרה היא לשפר out-of-sample decision economics.

---

# ‏175. Practitioner Secret — Indicator Accuracy Is Not Economic Value

‏גם אם indicator משפר directional accuracy, הוא יכול לפגוע אם:

- ‏trades become later.
- ‏spread larger at entry.
- ‏fill probability worse.
- ‏winners smaller.

---

# ‏176. Practitioner Secret — No Indicator Escapes Execution

‏כל signal צריך לעבור:

```text
Prediction
→ Ranking
→ Veto
→ Freshness
→ Executability
→ Fill
→ Exit
→ Costs
→ Net Outcome
```

---

# ‏177. מה הייתי בודק אצלנו ראשון

‏לא כ־המלצה סופית, אלא כ־research priority:

1. ‏למפות כל indicator קלאסי ל־simple mathematical concept.
2. ‏לבדוק אם כבר יש לנו feature מקביל.
3. ‏אם אין — להריץ אותו ב־Shadow.
4. ‏למדוד incremental OOS value.
5. ‏לבדוק decision impact, לא רק correlation.
6. ‏לבדוק latency/complexity cost.

---

# ‏178. Candidates מעניינים למחקר קצר־טווח

‏ברמת רעיון, לא threshold קבוע:

- ‏EMA/EWMA decay מותאם ל־signal half-life.
- ‏multi-horizon momentum spread בסגנון MACD אך ללא parameters מסורתיים.
- ‏normalized directional persistence בסגנון RSI.
- ‏distance-from-local-mean normalized by short-horizon variability בסגנון Bollinger.
- ‏position-within-recent-range בסגנון Stochastic.
- ‏short-horizon activity-relative-to-baseline בסגנון RVOL.
- ‏distance from recent high/low בסגנון Donchian.

---

# ‏179. מה פחות הייתי מכניס ל־Fast Path בהתחלה

‏כ־baseline research judgment בלבד:

- ‏stack גדול של oscillators correlated.
- ‏multi-layer indicators עם lag כבד.
- ‏chart-only patterns שקשה להגדיר causally.
- ‏features בלי incremental test.
- ‏complex indicators שיקרים לחישוב אך כמעט לא משנים החלטה.

‏ה־Recommendation Playbook בסוף הקורס יכריע זאת באופן מסודר יותר.

---

# ‏180. Feature Card לכל Indicator

‏כדאי לתעד:

```text
Name
Family
Formula
Inputs
Horizon
Warmup
UpdateMode
ExpectedMechanism
Lag
Normalization
Freshness
FailureModes
RedundantWith
PrimaryMetric
PromotionCriteria
```

---

# ‏181. Indicator Test Matrix

‏לכל candidate:

```text
Raw predictive value
Incremental value
OOS stability
Regime stability
Latency sensitivity
Cost sensitivity
Decision impact
Execution interaction
Complexity cost
```

---

# ‏182. Know by Heart — מה חשוב לזכור

- ‏Indicator הוא transformation, לא oracle.
- ‏Smoothing קונה stability במחיר lag.
- ‏Thresholds אינם חוקי טבע.
- ‏שמות שונים יכולים לייצג אותו מידע.
- ‏Incremental value חשוב יותר מ־standalone correlation.
- ‏Bar semantics משפיעים על כל תוצאה.
- ‏Current-bar values שונים מ־finalized values.
- ‏Warm-up ו־freshness הם חלק מה־correctness.
- ‏Execution יכול למחוק כל predictive benefit.
- ‏פשטות עוזרת גם ל־performance וגם ל־RCA.

---

# ‏183. Checklist לפני הוספת Indicator למערכת

- ‏האם אני מבין את הנוסחה?
- ‏האם אני יכול להסביר את mechanism?
- ‏האם הוא causal בזמן אמת?
- ‏האם יש לנו כבר feature דומה?
- ‏האם הוא מוסיף OOS value?
- ‏האם הוא משפר decisions ולא רק charts?
- ‏האם הוא שורד costs/latency?
- ‏האם הוא יציב בכמה regimes?
- ‏האם implementation online/offline זהה?
- ‏האם complexity justified?

---

# ‏184. Definition of Done למחקר Indicator

‏Indicator אינו “מאושר” משום שבנינו אותו.

‏הוא צריך לעבור לפחות:

```text
Formula verified
Point-in-time correct
Warm-up defined
Online/offline parity
Incremental OOS test
Ablation
Regime analysis
Execution-aware validation
Latency/cost stress
Decision-impact analysis
Shadow evaluation
Promotion/rejection decision
```

---

# ‏185. היישום לרובוט שלנו

‏במערכת `Short-Horizon Momentum` שלנו, classic indicators הם בעיקר **ספריית רעיונות ל־Feature Engineering**.

‏הם אינם תחליף ל:

- ‏fresh multi-horizon returns.
- ‏trade activity.
- ‏order flow.
- ‏liquidity.
- ‏spread.
- ‏quote freshness.
- ‏ranking.
- ‏negative evidence.
- ‏execution feasibility.

---

# ‏186. ארכיטקטורה מומלצת למחקר Indicators

```text
Raw Market Data
→ Canonical State
→ Simple Core Features
→ Classic-Indicator Challenger Features
→ Incremental Evaluation
→ Shadow Decision Impact
→ Promote / Reject
```

---

# ‏187. מה לא לעשות

```text
Install TA library
→ calculate 100 indicators
→ feed all into score/model
→ optimize until backtest looks good
```

‏זה מגדיל degrees of freedom ומזמין overfitting.

---

# ‏188. מה כן לעשות

```text
Question
→ Mechanism
→ Simplest representation
→ Test
→ Compare against baseline
→ Measure decision impact
→ Keep only what earns its complexity
```

---

# ‏189. הקשר ל־Recommendation Playbook העתידי

‏בסיום הקורס, שכבת ההמלצות תכריע לכל family:

- ‏מה כדאי לשמור כ־baseline.
- ‏מה כדאי להריץ כ־challenger.
- ‏מה מתאים רק ל־slow context.
- ‏מה מיותר אצלנו.
- ‏מה כדאי להימנע ממנו עד שיש Evidence.

‏כך נשמור כאן את הידע הכללי, ואת ההכרעה האישית נעשה במקום המיועד לה.

---

# ‏190. משפט הסיכום

> ‏**אינדיקטור טוב אינו זה שנראה חכם על Chart. הוא זה שמייצג מידע שימושי בצורה causal, מוסיף משהו מעבר ל־features שכבר קיימים, שורד OOS ועלויות, ומצליח לשנות החלטות בזמן שבו עדיין אפשר לממש את ה־Edge.**
