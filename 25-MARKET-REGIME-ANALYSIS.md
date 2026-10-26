# ‏שלב 25 — `Regime Analysis`: להבין מתי ה־Scanner עובד ומתי ה־Edge משתנה

> ‏מטרת הפרק: להבין כיצד ביצועי אסטרטגיה משתנים בין מצבי שוק שונים, ואיך להבדיל בין `Edge` אמיתי ויציב לבין יתרון שעובד רק בסביבה מסוימת.
>
> ‏העיקרון המרכזי: **אין “שוק אחד”. פתיחה, אמצע יום, סגירה, שוק רגוע, שוק סוער, רוחב שוק חיובי, אירוע חד ונזילות מתכווצת — כל אלה יכולים לשנות גם את איכות ה־Signal וגם את איכות הביצוע.**
>
> ‏כמו בכל הקורס: קודם נלמד את הידע המקצועי הכללי, אחר כך את ה־Best Practices ורזי המקצוע, ולבסוף נתאים אותו לרובוט שלך — סריקה של כל השוק והחזקה של שניות בודדות ועד בערך דקה.

---

# ‏1. מה זה `Market Regime`?

‏`Market Regime` הוא שם למצב שוק בעל מאפיינים שונים מספיק כדי להצדיק ניתוח נפרד.

‏לדוגמה:

```text
Quiet market
Fast market
Opening session
Midday lull
Closing session
Broad risk-on
Broad risk-off
High volatility
Low liquidity
News-driven burst
```

‏המילה `Regime` לא אומרת בהכרח שאנחנו יכולים לחזות אותו מראש.

‏היא אומרת שאנחנו מזהים שההתפלגות של המחירים, הפעילות, הנזילות או התוצאות השתנתה.

---

# ‏2. למה Regime חשוב בכלל?

‏אותו `Feature` יכול לעבוד אחרת במצבי שוק שונים.

‏לדוגמה:

- ‏מומנטום של 5 שניות יכול להיות איכותי בשוק פעיל.
- ‏אותו מהלך בדיוק יכול להיות רעש בשוק דליל.
- ‏`Spread` של 4 bps יכול להיות סביר במצב אחד ויקר מאוד במצב אחר.
- ‏`Rank #1` יכול להיות משמעותי כשיש Separation גדול, אך חלש כשכל השוק זז יחד.

‏לכן ממוצע יחיד על כל היום עלול להסתיר את התמונה האמיתית.

---

# ‏3. הממוצע יכול לשקר

‏נניח:

```text
Morning EV  = +8 bps
Midday EV   = -5 bps
Close EV    = +3 bps
Overall EV  = +1 bps
```

‏אם נסתכל רק על `Overall EV`, נראה אסטרטגיה חלשה אך חיובית.

‏אבל בפועל יכול להיות שיש כאן:

- ‏Edge חזק בבוקר.
- ‏Edge שלילי באמצע היום.
- ‏Edge בינוני בסגירה.

‏זו כבר החלטה מחקרית אחרת לגמרי.

---

# ‏4. Regime Analysis אינו תירוץ ל־Overfitting

‏קל מאוד לחלק את הנתונים שוב ושוב עד שנמצא תת־קבוצה רווחית.

‏לדוגמה:

```text
Only Monday
Only 10:12-10:27
Only stocks $18-$27
Only high-volume days
Only when market is green
```

‏אם החיתוכים נבחרו אחרי שראינו את התוצאות, זו יכולה להיות פשוט התאמה לרעש.

‏לכן Regime Analysis חייב להישאר תחת כללי שלב 23 ו־24:

- ‏Hypothesis מראש.
- ‏Out-of-Sample.
- ‏מספר ניסויים מתועד.
- ‏Robustness.
- ‏לא לחפש “פינה קסומה”.

---

# ‏5. שני שימושים שונים ל־Regime

‏יש להפריד בין:

## ‏א. `Regime for Analysis`

‏תיוג בדיעבד כדי להבין איפה המערכת עבדה.

## ‏ב. `Regime for Live Decision`

‏מצב שהרובוט מזהה בזמן אמת ומשנה לפיו התנהגות.

‏הראשון יכול להיות כלי מחקרי בלבד.

‏השני הוא Feature/State אמיתי של המערכת ולכן חייב להיות `Point-in-Time` וללא מידע עתידי.

---

# ‏6. כלל ברזל: Live Regime חייב להיות ידוע אז

‏אסור להגדיר Regime כך:

```text
High-volatility day = day whose full-day realized volatility was high
```

‏ולהשתמש בתווית הזאת בשעה 10:00.

‏ב־10:00 עדיין לא ידענו איך ייראה כל היום.

‏במקום זאת, אפשר להשתמש במדדים שהיו זמינים אז:

```text
realized_volatility_so_far
recent_market_range
recent_trade_rate
recent_spread_percentile
```

---

# ‏7. Regime הוא Context, לא Label עתידי

‏`Regime` צריך לתאר את ההקשר הנוכחי.

‏הוא אינו אמור לומר:

```text
future_winner
future_crash
future_trend_day
```

‏אם התווית מכילה מידע על מה שיקרה אחר כך — זה `Leakage`.

---

# ‏8. משפחת Regime ראשונה: זמן ביום

‏החלוקה הפשוטה ביותר היא לפי `Time of Day`.

‏לדוגמה:

```text
Open
Early session
Midday
Late session
Close
```

‏אבל לא חייבים לקבוע חלונות שרירותיים.

‏אפשר לבדוק את ההתנהגות לפי דקות מאז הפתיחה ולראות האם קיימים אזורים טבעיים.

---

# ‏9. למה פתיחת המסחר מיוחדת?

‏בפתיחה לעיתים יש שילוב של:

- ‏מידע שהצטבר מחוץ לשעות המסחר.
- ‏פערים גדולים יחסית.
- ‏פעילות גבוהה.
- ‏תנודתיות גבוהה.
- ‏Spread שיכול להיות רחב ואז להתכווץ.
- ‏שינויים מהירים בדירוג.

‏לכן Strategy שעובדת היטב ב־11:30 לא בהכרח תתנהג אותו דבר בדקות הראשונות.

---

# ‏10. למה אמצע היום מיוחד?

‏אמצע היום יכול להיות שקט יותר מבחינת פעילות בחלק מהימים.

‏לרובוט שלך חשוב לבדוק האם:

- ‏יש פחות Candidates.
- ‏ה־Rank פחות יציב.
- ‏`time_to_target` מתארך.
- ‏Spread נהיה משמעותי יותר ביחס ל־Edge.
- ‏המערכת מבצעת יותר עסקאות “סתם כי צריך לבחור #1”.

---

# ‏11. למה הסגירה מיוחדת?

‏לקראת הסגירה יכולים להשתנות:

- ‏פעילות.
- ‏נזילות.
- ‏Volatility.
- ‏Flows מוסדיים.
- ‏התנהגות של Orders.
- ‏לחץ לסגור Position לפני סוף המסחר.

‏לכן ניתוח נפרד חשוב גם אם הרובוט מחזיק רק שניות.

---

# ‏12. Pre-Market ו־After-Hours הם Regime נפרד

‏מסחר מחוץ לשעות הרגילות יכול להציג:

- ‏פחות נזילות.
- ‏Spread רחב יותר.
- ‏Depth נמוך יותר.
- ‏פחות Participants.
- ‏Execution שונה.

‏לא נכון להניח שמודל שנלמד על Regular Session מתאים אוטומטית גם לשעות האלה.

---

# ‏13. Regime לפי Volatility

‏אפשר לסווג את השוק לפי רמת תנודתיות.

‏לדוגמה:

```text
Low
Normal
High
Extreme
```

‏אבל עדיף ככל האפשר להשתמש ב־Percentiles או במדד יחסי להיסטוריה הרלוונטית, ולא במספר קשיח שנבחר במקרה.

---

# ‏14. Volatility של מה?

‏חשוב להגדיר במדויק.

‏אפשר למדוד:

- ‏Volatility של מדד רחב.
- ‏Volatility של Universe כולו.
- ‏Median stock volatility.
- ‏Cross-sectional dispersion.
- ‏Volatility של Candidate ספציפית.
- ‏Realized volatility בחלון קצר.

‏אלה דברים שונים.

---

# ‏15. `Cross-Sectional Dispersion`

‏זהו הפיזור בין התשואות של מניות שונות באותו זמן.

‏לרובוט שבוחר “הכי חזקה מכל השוק”, זה חשוב במיוחד.

‏אם כל המניות זזות כמעט אותו דבר, ייתכן שאין הרבה משמעות ל־Rank #1.

‏אם יש פיזור גדול, הבחירה היחסית יכולה להיות יותר אינפורמטיבית.

---

# ‏16. `Market Breadth`

‏`Breadth` מתאר כמה רחב המהלך בשוק.

‏דוגמאות:

```text
% of universe positive over 30s
% above short rolling reference
advancers / decliners
median short-horizon return
```

‏זה יכול לעזור להבין האם Candidate עולה לבד או כחלק מגל רחב.

---

# ‏17. Relative Strength מול Market Beta קצר

‏אם כל השוק עולה מהר, מניה שעלתה 0.15% אינה בהכרח מיוחדת.

‏אפשר לשאול:

```text
stock_return - market_return
```

‏או להשוות ל־Sector/Peer group.

‏זה מאפשר להפריד בין:

```text
Market move
```

‏לבין:

```text
Idiosyncratic move
```

---

# ‏18. Regime לפי Direction

‏אפשר לנתח בנפרד:

- ‏שוק עולה.
- ‏שוק יורד.
- ‏שוק שטוח.

‏אבל הכיוון צריך להימדד בזמן אמת מחלון עבר, לא מהתוצאה היומית הסופית.

---

# ‏19. Regime לפי Trend Strength

‏לא מספיק לומר Up/Down.

‏אפשר למדוד:

- ‏Slope.
- ‏Persistence.
- ‏Breadth.
- ‏Pullback frequency.
- ‏Directional consistency.

‏כך מקבלים Context עשיר יותר.

---

# ‏20. Regime לפי Activity

‏השוק יכול להיות:

```text
quiet
normal
busy
extremely active
```

‏אפשר למדוד למשל:

- ‏Trades per second.
- ‏Dollar volume per second.
- ‏Quote updates per second.
- ‏מספר מניות שעוברות ספי Momentum.

---

# ‏21. Candidate Density

‏מדד חשוב לרובוט שלך:

```text
candidate_count
```

‏כלומר כמה מניות בכלל עוברות את שלב ה־Filters כרגע.

‏מצב שבו יש 3 Candidates שונה ממצב שבו יש 300.

---

# ‏22. Rank Competition

‏לא רק מספר המועמדות חשוב.

‏חשוב גם כמה צפוף הדירוג.

‏לדוגמה:

```text
score_rank_1 = 0.91
score_rank_2 = 0.90
score_rank_3 = 0.89
```

‏מול:

```text
score_rank_1 = 0.91
score_rank_2 = 0.72
score_rank_3 = 0.65
```

‏אלה שני Contexts שונים מאוד.

---

# ‏23. Regime לפי Liquidity

‏אפשר למדוד את מצב הנזילות הכולל דרך:

- ‏Median spread.
- ‏Spread percentiles.
- ‏Depth.
- ‏Quote freshness.
- ‏Fill rate היסטורי בזמן דומה.

‏בשוק שבו הנזילות נחלשת, Edge חיזויי יכול להישאר זהה אבל ה־Executable Edge להיעלם.

---

# ‏24. Liquidity Regime של השוק מול המניה

‏יש שתי רמות:

```text
Market liquidity regime
Symbol liquidity state
```

‏הן לא תמיד זהות.

‏מניה אחת יכולה להיות נזילה מאוד בתוך שוק שבאופן כללי נעשה דליל.

---

# ‏25. Spread Regime

‏אפשר למדוד את ה־Spread הנוכחי יחסית להיסטוריה קצרה של אותה מניה:

```text
current_spread_bps / median_spread_bps_recent
```

‏או לפי Percentile.

‏כך נזהה אם Execution כרגע יקר באופן חריג.

---

# ‏26. Depth Regime

‏אותו רעיון חל על עומק:

```text
current_top_depth
relative_depth
order_size / visible_depth
```

‏אם הכמות שלנו גדולה יחסית ל־Depth הנוכחי, מצב הביצוע השתנה.

---

# ‏27. Regime לפי Data Quality

‏גם איכות הנתונים היא Context.

‏לדוגמה:

- ‏Feed תקין.
- ‏Feed עם latency חריג.
- ‏Quote gaps.
- ‏Sequence gaps.
- ‏Provider mismatch.

‏אסטרטגיה לא צריכה להמשיך כאילו זה “שוק רגיל” כאשר מקור הנתונים מתדרדר.

---

# ‏28. Regime לפי Latency

‏אפשר לחשוב גם על:

```text
Normal latency
Elevated latency
Critical latency
```

‏אם `signal-to-order` מתארך, Holding Horizon של 10 שניות מקבל משמעות אחרת.

---

# ‏29. Regime לפי Market-Wide Momentum

‏אפשר למדוד למשל:

```text
median_return_10s
median_return_30s
pct_positive_10s
pct_positive_30s
```

‏כך אפשר להבין האם ה־Scanner נהנה מגל שוק כללי או מזהה Outliers אמיתיים.

---

# ‏30. Regime לפי Correlation

‏כאשר מניות רבות נעות יחד, ה־Cross-Section יכול להיות פחות מגוון.

‏כאשר Correlation נמוך יותר, בחירת מניה ספציפית יכולה לקבל משמעות גדולה יותר.

‏אין צורך לחשב Matrix ענק בכל Tick בשלב ראשון; אפשר להתחיל במדדים פשוטים יותר של Co-Movement.

---

# ‏31. Regime לפי Sector Leadership

‏לפעמים תנועה מרוכזת בסקטור אחד.

‏אפשר למדוד:

```text
sector breadth
sector median return
sector activity acceleration
```

‏ואז לשאול האם Candidate חזקה בפני עצמה או פשוט נסחפת עם הקבוצה.

---

# ‏32. Regime לפי Event/News Context

‏יש ימים או דקות שבהם השוק מגיב לאירוע משמעותי.

‏הקורס יעסוק ב־News/Event Data לעומק בפרק 69.

‏כאן העיקרון הוא רק:

> ‏אם אירועים משנים משמעותית Volatility, Liquidity או Correlation, יש לבדוק את ביצועי האסטרטגיה בנפרד.

---

# ‏33. Regime לפי Halt/LULD Density

‏אם הרבה מניות נמצאות ב־halts או במצבי תנודתיות חריגים, זה יכול להעיד על Context שונה.

‏אפשר למדוד:

```text
halt_count
luld_event_rate
```

‏ולנתח האם המערכת מתפקדת אחרת בזמנים כאלה.

---

# ‏34. Regime לפי Gap Activity בפתיחה

‏בפתיחה אפשר לבדוק כמה מניות פתחו בפער משמעותי לעומת המחיר הקודם.

‏ריבוי Gaps יכול לשנות את מבנה ה־Universe ואת כמות ההזדמנויות.

---

# ‏35. Regime לפי Market Shock

‏`Shock` אינו חייב להיות מוגדר כחדשות.

‏אפשר לזהות אותו דרך:

```text
rapid index move
spread expansion
volume surge
correlation spike
candidate explosion
```

‏כל אלה זמינים בזמן אמת אם מחשבים אותם נכון.

---

# ‏36. Regime אינו חייב להיות קטגוריה

‏אפשר להשתמש ב־Context רציף:

```text
volatility_percentile = 0.87
breadth = 0.71
spread_stress = 0.62
activity_percentile = 0.93
```

‏ולא להכריח כל רגע לתוך Label אחד.

---

# ‏37. Continuous Context יכול להיות טוב יותר

‏במקום:

```text
LOW_VOL
HIGH_VOL
```

‏אפשר להשתמש ב:

```text
volatility_percentile
```

‏זה מפחית Threshold artifacts ושומר יותר מידע.

---

# ‏38. אז למה בכל זאת להשתמש ב־Buckets?

‏Buckets נוחים מאוד לניתוח ולהסבר.

‏לדוגמה:

```text
Volatility P0-P20
P20-P40
P40-P60
P60-P80
P80-P100
```

‏ואז אפשר להשוות EV, Hit Rate ו־Execution Cost בכל Bucket.

---

# ‏39. Regime Matrix

‏לעיתים Regime אחד אינו מספיק.

‏אפשר לבנות Matrix:

```text
TimeOfDay × Volatility
TimeOfDay × Liquidity
Breadth × Volatility
Activity × Spread
```

‏אבל כאן הסיכון ל־Overfitting גדל מהר.

---

# ‏40. Curse of Dimensionality

‏אם נחתוך את הנתונים ליותר מדי Regimes, נקבל מעט Samples בכל תא.

‏לדוגמה:

```text
5 time buckets
× 5 volatility buckets
× 5 liquidity buckets
× 4 breadth buckets
= 500 cells
```

‏רוב התאים יהיו דלים מדי כדי להסיק מסקנות.

---

# ‏41. Minimum Sample Size

‏לכל Regime צריך להציג לפחות:

```text
candidate_count
trade_count
unique_days
unique_symbols
```

‏תוצאה יפה על 12 Trades אינה שקולה לתוצאה דומה על אלפי Observations.

---

# ‏42. Effective Sample Size

‏גם 10,000 Signals אינם בהכרח 10,000 דוגמאות עצמאיות.

‏אם רבים מהם הגיעו מאותו Symbol באותו Burst, הם מתואמים.

‏לכן חשוב לנתח גם לפי:

- ‏Candidate Episodes.
- ‏Unique days.
- ‏Unique symbols.
- ‏Distinct market events.

---

# ‏43. Regime Performance Table

‏לכל Regime כדאי לחשב לפחות:

```text
sample_count
hit_rate
mean_forward_return
median_forward_return
expected_value
time_to_first_profit
time_to_target
mfe
mae
fill_rate
slippage
net_edge
```

---

# ‏44. Prediction ו־Execution בנפרד

‏ייתכן שב־High Volatility:

```text
Prediction edge ↑
Execution cost ↑↑
```

‏לכן:

```text
Gross edge positive
Net edge negative
```

‏חייבים להציג את שתי השכבות בנפרד.

---

# ‏45. Regime יכול להשפיע על Scanner ולא על Execution

‏לדוגמה:

- ‏המומנטום מנבא טוב יותר בבוקר.
- ‏אבל Fill quality דומה כל היום.

‏זה אומר שהשינוי נמצא בשכבת Prediction.

---

# ‏46. Regime יכול להשפיע על Execution ולא על Scanner

‏לדוגמה:

- ‏Forward return של Rank #1 דומה.
- ‏אבל Spread ו־Slippage גרועים יותר ב־Regime מסוים.

‏אז ייתכן שהפתרון הוא Execution policy ולא שינוי Score.

---

# ‏47. Regime יכול להשפיע על שניהם

‏זה המקרה המורכב ביותר.

‏לדוגמה:

```text
signal quality ↓
spread ↑
fill rate ↓
```

‏במצב כזה ייתכן ש־`NO TRADE` הוא הבחירה הנכונה.

---

# ‏48. `Trade / No Trade` לפי Regime

‏Regime Analysis אינו מחייב ליצור אסטרטגיה שונה לכל מצב.

‏לפעמים המסקנה הפשוטה ביותר היא:

```text
Regime X → normal trading
Regime Y → stricter threshold
Regime Z → NO TRADE
```

‏אבל רק אם הנתונים תומכים בכך מחוץ ל־Sample שבו גילינו את הכלל.

---

# ‏49. Dynamic Thresholds

‏במקום Threshold אחיד:

```text
min_score = 80
```

‏ייתכן מחקרית שעדיף:

```text
quiet_market    → min_score = higher
normal_market   → baseline
active_market   → different threshold
```

‏אבל זו Hypothesis שצריך להוכיח, לא הנחה.

---

# ‏50. Dynamic Position Sizing

‏Regime יכול להשפיע גם על Size.

‏לדוגמה, כאשר Execution uncertainty גבוהה:

```text
position_size ↓
```

‏גם אם ה־Signal עצמו עדיין טוב.

---

# ‏51. Dynamic Execution Policy

‏אפשר לבדוק האם Regime מצדיק שינוי ב:

```text
passive vs aggressive
order TTL
max chase
acceptable spread
partial-fill tolerance
```

‏זו שכבת Execution, לא Score.

---

# ‏52. Dynamic Holding Time

‏ייתכן שב־Regime מסוים המהלך ממשיך תוך 3 שניות, ובאחר תוך 20 שניות.

‏לכן כדאי להשוות:

```text
time_to_first_profit
time_to_target
time_to_mfe
```

‏לפי Regime.

---

# ‏53. Dynamic Exit Policy

‏גם `Time Stop` יכול להיות תלוי Context.

‏לדוגמה:

```text
fast regime → thesis should prove itself quickly
slow regime → perhaps slightly longer allowance
```

‏שוב: רק אם הנתונים מוכיחים זאת.

---

# ‏54. Regime-conditioned Score

‏אפשר תאורטית להשתמש ב:

```text
Score = f(features, regime)
```

‏או להחזיק Scores שונים לכל Regime.

‏אבל זה מוסיף Complexity ו־Overfitting risk משמעותי.

---

# ‏55. עדיפות ל־Context Feature לפני Multiple Models

‏בשלב מוקדם עדיף לעיתים להכניס:

```text
market_volatility_percentile
market_breadth
market_activity_percentile
```

‏כ־Features למודל אחיד, במקום לבנות מיד מודל נפרד לכל מצב.

---

# ‏56. מתי Separate Models יכולים להיות מוצדקים?

‏רק כאשר יש Evidence יציב לכך שהקשר בין Features לבין Outcomes משתנה מהותית.

‏לדוגמה:

```text
feature A positive in Regime 1
feature A neutral in Regime 2
feature A negative in Regime 3
```

‏וגם זה צריך לשרוד Out-of-Sample.

---

# ‏57. Regime Detection Latency

‏גם אם Regime השתנה, הרובוט לא תמיד מזהה זאת מיד.

‏לכן צריך למדוד:

```text
regime_change_time
regime_detected_time
regime_detection_latency
```

---

# ‏58. Regime Churn

‏אם Regime מתחלף כל שנייה:

```text
LOW → HIGH → LOW → HIGH
```

‏המערכת עלולה להתנדנד בין Policies.

‏זה דומה ל־Candidate Churn.

---

# ‏59. Hysteresis ל־Regime

‏אפשר להשתמש ב־Hysteresis:

```text
enter_high_vol at percentile > 85
exit_high_vol at percentile < 75
```

‏כדי למנוע Flicker.

‏המספרים הם דוגמה בלבד וצריכים להילמד מהנתונים.

---

# ‏60. Minimum Dwell Time

‏אפשר לדרוש ש־Regime יהיה תקף כמה זמן לפני שמשנים Policy.

‏אבל זה יוצר Trade-off:

```text
stability vs responsiveness
```

---

# ‏61. Regime Confidence

‏במקום Label קשיח אפשר לשמור:

```text
regime = HIGH_VOL
confidence = 0.68
```

‏או אפילו כמה Scores מקבילים.

---

# ‏62. Unknown Regime

‏`UNKNOWN` הוא מצב לגיטימי.

‏אם אין מספיק Data או שהמדדים סותרים זה את זה, עדיף לא להעמיד פנים שהמערכת יודעת.

---

# ‏63. Fail Safe תחת Unknown

‏אפשר להגדיר Policy שמרנית יותר כאשר Regime אינו ברור.

‏לדוגמה:

```text
smaller size
higher trade threshold
NO TRADE under poor data quality
```

---

# ‏64. Regime Versioning

‏כל הגדרת Regime צריכה Version.

‏לדוגמה:

```text
regime_model_version = r3
```

‏כי שינוי Threshold אחד יכול לשנות את כל תוצאות המחקר.

---

# ‏65. Regime Definition Snapshot

‏בכל Decision כדאי לדעת:

```text
regime_version
regime_values
regime_label
regime_confidence
```

‏כך אפשר להסביר Trade בדיעבד.

---

# ‏66. Regime Leakage דרך Full-Day Features

‏זו מלכודת קלאסית.

‏אסור להשתמש בזמן 10:15 ב:

```text
full_day_volume
full_day_high
full_day_low
full_day_volatility
closing_return
```

‏אם הערכים האלה כוללים מידע שעדיין לא קרה.

---

# ‏67. Regime Leakage דרך Daily Classification

‏גם Label כמו:

```text
Trend Day
Mean Reversion Day
```

‏יכול להכיל Future Information אם נקבע לפי כל היום.

‏אפשר להשתמש בו למחקר Post-Hoc, אבל לא כ־Live Input באותו יום.

---

# ‏68. Post-Hoc Analysis עדיין שימושי

‏אפשר בהחלט לשאול בדיעבד:

> ‏באילו סוגי ימים האסטרטגיה הצליחה?

‏המטרה אז היא להבין התנהגות ולייצר Hypothesis חדשה.

‏השלב הבא הוא לתרגם את ה־Hypothesis למדד שהיה ידוע בזמן אמת.

---

# ‏69. למשל: “Trend Day” → Real-Time Proxy

‏נניח שמצאנו שהמערכת טובה ב־Trend Days.

‏במקום להשתמש בתווית עתידית, נחפש Proxy בזמן אמת:

```text
breadth persistence
market return persistence
low reversal rate
high directional consistency
```

---

# ‏70. Regime Stability Across Days

‏לא מספיק לבדוק ממוצע על כל התקופה.

‏צריך לראות האם Regime advantage חוזר על עצמו:

- ‏בשבועות שונים.
- ‏בחודשים שונים.
- ‏בימים שונים.
- ‏על Symbols שונים.

---

# ‏71. Leave-One-Day-Out

‏בדיקה פשוטה:

> ‏האם התוצאה נשארת כאשר מוציאים יום חזק במיוחד?

‏אם Edge נעלם בלי יום אחד, יש Concentration Risk.

---

# ‏72. Leave-One-Symbol-Out

‏אותו רעיון על Symbols.

‏אם Regime “עובד” רק כי מניה אחת נתנה הרבה Winners, זו בעיה.

---

# ‏73. Regime Contribution

‏אפשר לפרק Total PnL:

```text
PnL by regime
trade count by regime
net EV by regime
```

‏כדי לראות מאיפה באמת מגיעה התוצאה.

---

# ‏74. Regime Exposure

‏אם Regime מסוים קורה רק 5% מהזמן אבל מספק 80% מהרווח, זו תגלית חשובה.

‏היא יכולה להיות Edge אמיתי — או סימן ל־Fragility.

---

# ‏75. Regime Transition Analysis

‏לא רק המצב עצמו מעניין.

‏גם המעבר:

```text
quiet → active
normal → stressed
low vol → high vol
```

‏יכול להיות בעל התנהגות ייחודית.

---

# ‏76. Transition Feature

‏אפשר למדוד:

```text
volatility_delta
spread_delta
activity_delta
breadth_delta
```

‏ולבדוק האם שינוי מהיר ב־Context משפיע על ה־Scanner.

---

# ‏77. Shock Detection מול Stable High Regime

‏`High Volatility` יציבה אינה בהכרח זהה ל־Volatility שקפצה עכשיו.

‏לכן כדאי להבדיל בין:

```text
level
change
acceleration
```

‏גם ברמת Context.

---

# ‏78. Context Features לרובוט שלנו

‏Baseline סביר למחקר יכול לכלול:

```text
seconds_since_open
market_return_10s
market_return_30s
market_breadth_10s
market_breadth_30s
market_activity_percentile
market_volatility_percentile
market_spread_percentile
candidate_count
rank1_rank2_gap
feed_latency_percentile
```

‏זו רשימת Hypotheses למחקר, לא המלצת מסחר מוכחת.

---

# ‏79. Regime-Aware Scanner Funnel

‏אפשר לנתח:

```text
Base Universe
→ Data Valid
→ Tradable
→ Active
→ Momentum Candidate
→ Ranked
→ Trade Eligible
```

‏לפי Regime.

‏כך נראה איפה בדיוק ה־Funnel משתנה.

---

# ‏80. Regime-Aware Rejection Reasons

‏לדוגמה:

```text
HIGH_VOL:
  spread_too_wide = 28%

NORMAL:
  spread_too_wide = 7%
```

‏זה יכול להסביר למה Trade Frequency משתנה.

---

# ‏81. Regime-Aware Top-1 Diagnostics

‏לכל Regime נרצה לפחות:

```text
Top1 hit rate
Top1 EV
Top1 net EV
Top1 separation gap
Top1 time_to_first_profit
Top1 time_to_target
Top1 MFE
Top1 MAE
Top1 fill rate
```

---

# ‏82. Compare Rank Curves by Regime

‏נבדוק האם:

```text
Rank 1 > Rank 2 > Rank 3 > ...
```

‏נשמר בכל Regime.

‏ייתכן שבמצב אחד יש Monotonicity ברורה ובמצב אחר כל Top-20 דומים.

---

# ‏83. Compare Horizon Curves by Regime

‏נבדוק:

```text
EV@1s
EV@2s
EV@5s
EV@10s
EV@30s
EV@60s
```

‏לפי Regime.

‏זה עוזר להבין האם ה־Edge מהיר יותר או איטי יותר בהתאם ל־Context.

---

# ‏84. Regime יכול לשנות את Meaning של Feature

‏לדוגמה:

```text
momentum_5s = +20 bps
```

‏יכול להיות חריג מאוד בשוק שקט, אבל רגיל לגמרי בשוק סוער.

‏לכן Normalization יחסית ל־Context יכולה להיות חשובה.

---

# ‏85. Context-Normalized Feature

‏אפשר לבדוק:

```text
stock_momentum_5s - market_median_momentum_5s
```

‏או:

```text
stock_activity_percentile_within_current_market_state
```

‏זו דרך להפריד Raw Move מהחריגות שלו ביחס לסביבה.

---

# ‏86. Regime-Aware Threshold אינו בהכרח טוב יותר

‏מורכבות נוספת צריכה להצדיק את עצמה.

‏אם Threshold אחיד נותן תוצאה כמעט זהה, הוא בדרך כלל עדיף בגלל:

- ‏פשטות.
- ‏פחות Overfitting.
- ‏פחות מצבי קצה.
- ‏קל יותר לנטר ולהסביר.

---

# ‏87. Regime Feature Ablation

‏ניסוי חשוב:

```text
Baseline model
vs
Baseline + regime context
```

‏ואז לבדוק:

```text
Incremental EV
Rank quality
Net EV
Stability
Complexity cost
```

---

# ‏88. Regime Policy Ablation

‏אם בנינו Policy מיוחדת:

```text
HIGH_VOL → stricter threshold
```

‏נבדוק:

```text
with policy
vs
without policy
```

‏באותם ימים ובאותו Execution Model.

---

# ‏89. Shadow Regime Engine

‏לפני שינוי מסחר אמיתי אפשר להריץ Regime Engine ב־Shadow:

```text
regime detected
policy recommendation
actual system behavior unchanged
```

‏ואז לבדוק אם ההמלצות היו משפרות תוצאה.

---

# ‏90. Regime Drift

‏גם ההגדרה עצמה יכולה להזדקן.

‏Percentile או Threshold שנלמדו בתקופה אחת עלולים להשתנות עם מבנה השוק.

‏לכן צריך לנטר:

```text
regime frequency
feature distribution
transition rate
performance by regime
```

---

# ‏91. Regime Frequency Drift

‏אם בעבר:

```text
HIGH_VOL = 10% of time
```

‏וכעת:

```text
HIGH_VOL = 45% of time
```

‏צריך לבדוק האם:

- ‏השוק באמת השתנה.
- ‏ה־Threshold התיישן.
- ‏ה־Data pipeline השתנה.

---

# ‏92. Regime as Monitoring Tool

‏גם אם לא משתמשים בו למסחר, Regime Analysis מצוין ל־Observability.

‏לדוגמה:

> ‏היום ה־Scanner חלש כי 70% מהזמן היה Regime שבו היסטורית אין לו Edge.

‏זה הרבה יותר שימושי מ־“היום היה יום גרוע”.

---

# ‏93. Regime as RCA Dimension

‏בכל Trade אפשר לשמור:

```text
regime_snapshot
```

‏ואז ב־RCA לשאול:

- ‏האם ה־Trade נכשל כי ה־Signal היה רע?
- ‏או כי היה Context שבו האסטרטגיה חלשה?
- ‏או כי Execution התדרדר באותו Regime?

---

# ‏94. Regime אינו תחליף ל־RCA פרטני

‏אסור לומר:

> ‏“העסקה הפסידה כי זה היה High Vol.”

‏בלי Evidence.

‏Regime הוא Dimension לניתוח, לא תשובה אוטומטית.

---

# ‏95. Best Practice — Start With Few Regimes

‏התחלה טובה:

```text
Time of day
Market volatility
Market activity
Market liquidity
Market breadth
```

‏רק אחרי שמוצאים Evidence יציב מוסיפים Dimensions נוספים.

---

# ‏96. Best Practice — Continuous First, Buckets Second

‏שמור את הערך הרציף המקורי:

```text
market_volatility_percentile = 0.83
```

‏וגזור ממנו Buckets לניתוח.

‏כך לא מאבדים מידע ולא ננעלים על Threshold ישן.

---

# ‏97. Best Practice — Store Both Raw and Derived

‏לדוגמה:

```text
market_volatility_raw
market_volatility_percentile
regime_vol_bucket
```

‏זה מאפשר לשנות הגדרות בלי לאבד את הנתון המקורי.

---

# ‏98. Best Practice — Point-in-Time Percentiles

‏גם Percentile יכול לדלוף עתיד אם חושב על כל Dataset.

‏ב־Live-like Research צריך לחשב אותו ביחס להיסטוריה שהייתה זמינה אז.

---

# ‏99. Best Practice — Do Not Tune Every Regime Independently

‏אם לכל Regime יהיו:

```text
its own filters
its own score weights
its own entry
its own exit
its own size
```

‏מספר הפרמטרים מתפוצץ.

‏זה מתכון קלאסי ל־Overfitting.

---

# ‏100. Best Practice — Complexity Budget

‏כל Rule תלוי-Regime צריך לשלם “מס מורכבות”.

‏הוא צריך להראות שיפור מספיק גדול כדי להצדיק:

- ‏עוד קוד.
- ‏עוד בדיקות.
- ‏עוד Monitoring.
- ‏עוד Failure Modes.
- ‏עוד סיכון ל־Overfitting.

---

# ‏101. Best Practice — Regime Must Be Explainable

‏כאשר Trade נפתח, נרצה להיות מסוגלים לומר:

```text
market_volatility_percentile = 91
market_breadth = 74%
market_activity_percentile = 88
market_spread_percentile = 43
regime = ACTIVE_HIGH_VOL
```

‏ולא רק לקבל Label מסתורי.

---

# ‏102. Anti-Pattern — “Strategy works only in this tiny bucket”

‏אם כל ה־Edge מופיע רק בתא קטן שנמצא אחרי חיפושים רבים, החשד הראשון צריך להיות Overfitting.

---

# ‏103. Anti-Pattern — Future Regime Label

‏לדוגמה:

```text
use full-day return to label 10:00
```

‏זו דליפת עתיד.

---

# ‏104. Anti-Pattern — One Threshold Forever

‏מצד שני, גם להניח ש:

```text
spread < 5 bps
```

‏מתאים תמיד לכל שעה, Symbol ו־Volatility יכול להיות פשטני מדי.

‏צריך לבדוק, לא להניח.

---

# ‏105. Anti-Pattern — Regime as Excuse

‏אסור להשתמש ב־Regime כדי להסביר כל הפסד בדיעבד.

‏אם אין Hypothesis ומדידה מראש, זה Storytelling.

---

# ‏106. Anti-Pattern — Too Many Labels

‏עשרות Labels ידניים יוצרים מערכת שקשה להבין, לבדוק ולתחזק.

‏עדיף מעט Context signals איכותיים.

---

# ‏107. Anti-Pattern — Switching Too Fast

‏Policy שמחליפה מצב כל Tick יכולה להגדיל Churn ו־Execution noise.

‏לכן בודקים Hysteresis, confidence ו־dwell time.

---

# ‏108. Anti-Pattern — Optimize Gross by Regime

‏גם אם Regime מסוים מציג Gross Edge גבוה, חייבים לבדוק:

```text
spread
slippage
fill rate
latency
net edge
```

---

# ‏109. רז מקצוע — Regime עשוי להיות חשוב יותר ל־Cost מאשר ל־Prediction

‏לפעמים ה־Signal כמעט לא משתנה, אבל תנאי הביצוע כן.

‏לכן Regime Engine טוב יכול לשפר מערכת דרך Execution Policy בלבד.

---

# ‏110. רז מקצוע — Candidate Density הוא Context חזק

‏כאשר מאות מניות “חזקות” באותו רגע, Rank #1 נבחר מתוך תחרות שונה לגמרי מאשר כשיש שתי מועמדות בלבד.

‏לכן `candidate_count` ו־Score dispersion הם Context טבעי לסורק Cross-Sectional.

---

# ‏111. רז מקצוע — Rank Gap הוא סוג של Regime מקומי

‏פער גדול בין #1 ל־#2 יכול להעיד על Opportunity מבודדת.

‏פער קטן יכול להצביע על שוק שבו הבחירה המדויקת בין כמה מניות כמעט שרירותית.

---

# ‏112. רז מקצוע — Market-Wide Burst יכול ליצור Winners מזויפים

‏אם כל Universe מזנק יחד, Top-1 בהכרח קיים — גם אם אין לו Edge ייחודי.

‏לכן חשוב להשוות את Candidate ל־Market Context ולא רק לעצמה.

---

# ‏113. רז מקצוע — “שוק קשה” יכול להיות פשוט Cost Regime

‏לפעמים הרובוט עדיין מנבא נכון, אבל:

```text
spread wider
fill slower
slippage worse
```

‏ואז הבעיה היא Economics, לא Prediction.

---

# ‏114. רז מקצוע — Regime Change הוא עצמו Feature

‏לא רק המצב חשוב.

‏גם:

```text
quiet → suddenly active
narrow spreads → suddenly wide
breadth neutral → suddenly broad positive
```

‏עשויים לשנות את התנהגות האסטרטגיה.

---

# ‏115. רז מקצוע — Unknown הוא עדיף על False Precision

‏מערכת מקצועית יכולה לומר:

```text
regime = UNKNOWN
```

‏במקום לבחור Label בכוח על Data חלקי.

---

# ‏116. Baseline למחקר שלנו

‏בשלב ראשון נשמור לכל Snapshot לפחות:

```text
seconds_since_open
market_return_10s
market_return_30s
market_breadth_10s
market_breadth_30s
market_activity_percentile
market_volatility_percentile
market_spread_percentile
candidate_count
rank1_rank2_gap
```

---

# ‏117. לא משתמשים בכולם אוטומטית למסחר

‏קודם:

```text
observe
segment
validate
ablate
```

‏רק אחר כך שוקלים:

```text
change threshold
change score
change execution
change size
NO TRADE
```

---

# ‏118. דוח Regime יומי

‏דוח טוב יכול להציג:

```text
Time spent by regime
Candidates by regime
Trades by regime
Hit rate by regime
Gross EV by regime
Net EV by regime
Fill rate by regime
Slippage by regime
Top1 failure reasons by regime
```

---

# ‏119. דוח Regime חודשי

‏כדאי לבדוק:

- ‏Frequency drift.
- ‏Performance drift.
- ‏Threshold stability.
- ‏Regimes חדשים או נדירים.
- ‏האם ה־Champion עדיין עובד באותם Contexts.

---

# ‏120. מבחן מעבר ל־Regime-Aware Trading

‏לא נשנה Policy אמיתית לפני שיש:

1. ‏הגדרת Regime שניתנת לחישוב בזמן אמת.
2. ‏מספיק Samples.
3. ‏Evidence ב־Out-of-Sample.
4. ‏שיפור Net, לא רק Gross.
5. ‏Robustness סביב Thresholds.
6. ‏Shadow validation.
7. ‏Rollback ברור.

---

# ‏121. שאלות שחייבים לדעת לענות עליהן

‏לפני שנשתמש ב־Regime במסחר:

- ‏מה בדיוק מגדיר אותו?
- ‏האם ההגדרה הייתה ידועה בזמן אמת?
- ‏כמה Samples יש?
- ‏האם התוצאה חוזרת על עצמה בימים שונים?
- ‏האם היא תלויה בכמה Symbols?
- ‏האם Prediction השתפר או רק Execution השתנה?
- ‏האם Net Edge משתפר?
- ‏האם Policy פשוטה יותר עושה כמעט אותו דבר?

---

# ‏122. תרגיל מחשבתי לרובוט שלנו

‏נניח שבאותו רגע:

```text
candidate_count = 180
market_breadth_10s = 82%
market_volatility_percentile = 94
market_activity_percentile = 97
rank1_rank2_gap = very small
```

‏המניה #1 אולי נראית חזקה מאוד אבסולוטית.

‏אבל Context אומר:

- ‏כמעט כל השוק חזק.
- ‏יש הרבה Candidates.
- ‏#1 כמעט לא מובילה על #2.

‏ייתכן שה־Relative Edge שלה קטן יותר ממה שה־Raw Momentum מרמז.

---

# ‏123. תרגיל הפוך

‏נניח:

```text
candidate_count = 4
market_breadth_10s = 43%
market_volatility_percentile = 48
rank1_rank2_gap = large
```

‏כאן #1 עשויה להיות חריגה יותר ביחס לשוק.

‏אבל עדיין צריך לבדוק Liquidity, Costs ו־Execution.

---

# ‏124. Regime אינו אומר “לקנות”

‏הוא רק מספק Context.

‏השרשרת נשארת:

```text
Market Context
→ Universe
→ Filters
→ Features
→ Score
→ Rank
→ Trade / No Trade
→ Execution
→ Risk
```

---

# ‏125. Regime אינו תחליף ל־Strategy

‏אין ערך בלהיות “מומחה Regimes” אם אין Signal שמנבא.

‏ה־Regime עוזר להבין מתי ה־Signal עובד, מתי הוא נחלש ואיך Execution משתנה.

---

# ‏126. Regime אינו תחליף ל־Risk Engine

‏גם אם Regime נחשב “טוב”, מגבלות Risk נשארות מחייבות.

```text
Risk Engine > Regime preference
```

---

# ‏127. Regime אינו תחליף ל־Data Quality Gate

‏אם Feed אינו אמין:

```text
NO TRADE
```

‏גם אם כל Context אחר נראה מצוין.

---

# ‏128. Regime אינו תחליף ל־Execution Recheck

‏Regime יכול להיות טוב בזמן Signal ולהשתנות לפני Order.

‏לכן לפני ביצוע עדיין בודקים:

```text
freshness
spread
depth
halt state
signal validity
```

---

# ‏129. מה אנחנו רוצים להוכיח בשלב הזה?

‏לא:

> ‏“מצאנו את מצב השוק המושלם.”

‏אלא:

> ‏“אנחנו יודעים למדוד Context בזמן אמת, לפלח ביצועים בצורה הוגנת, ולזהות האם Prediction, Execution או Net Economics משתנים באופן יציב בין מצבי שוק.”

---

# ‏130. Checklist — Data

- ‏כל Regime Feature הוא `Point-in-Time`.
- ‏אין Full-Day leakage.
- ‏אין Future labels בתוך Live features.
- ‏נשמרים Raw values וגם Derived labels.
- ‏יש Version להגדרת Regime.
- ‏יש Data Quality indicators.

---

# ‏131. Checklist — Research

- ‏Hypothesis מוגדרת מראש ככל האפשר.
- ‏Regime buckets אינם נבחרים רק כי התוצאה יפה.
- ‏יש Minimum sample size.
- ‏יש Unique-day ו־Unique-symbol counts.
- ‏יש Out-of-Sample.
- ‏יש Leave-one-day/symbol checks.
- ‏יש Sensitivity סביב Thresholds.

---

# ‏132. Checklist — Prediction

- ‏Forward Returns לפי Regime.
- ‏Rank Monotonicity לפי Regime.
- ‏Top1 Premium לפי Regime.
- ‏MFE/MAE לפי Regime.
- ‏Time-to-first-profit ו־Time-to-target לפי Regime.
- ‏Candidate density ו־Rank gap נמדדים.

---

# ‏133. Checklist — Execution

- ‏Spread לפי Regime.
- ‏Slippage לפי Regime.
- ‏Fill Rate לפי Regime.
- ‏Time-to-fill לפי Regime.
- ‏Partial fills לפי Regime.
- ‏Signal-to-fill decay לפי Regime.

---

# ‏134. Checklist — Economics

- ‏Gross EV לפי Regime.
- ‏Net EV לפי Regime.
- ‏Cost-to-edge ratio לפי Regime.
- ‏Trade frequency לפי Regime.
- ‏Contribution ל־Total PnL לפי Regime.
- ‏Tail losses לפי Regime.

---

# ‏135. Checklist — Live Readiness

- ‏Regime ניתן לזיהוי בזמן אמת.
- ‏Detection latency ידוע.
- ‏יש Hysteresis אם צריך.
- ‏יש `UNKNOWN` state.
- ‏יש Safe fallback.
- ‏יש Shadow validation.
- ‏יש Monitoring ל־frequency/performance drift.
- ‏יש Rollback.

---

# ‏136. סיכום

‏`Regime Analysis` מאפשר לנו להפסיק להתייחס לכל רגע בשוק כאילו הוא מגיע מאותה התפלגות.

‏הוא עוזר להפריד בין:

```text
Prediction regime
Execution regime
Liquidity regime
Volatility regime
Activity regime
Time-of-day regime
```

‏אבל הוא גם מסוכן: ככל שמוסיפים יותר חיתוכים ויותר Policies, גדל הסיכוי ל־Overfitting.

‏לכן ברובוט שלנו נתחיל ב־Context פשוט, רציף וניתן למדידה בזמן אמת; נשתמש בו קודם לניתוח, ורק לאחר Evidence יציב נשקול לשנות `Score`, ‏Thresholds, ‏Execution או Position Size לפיו.

‏המבחן האמיתי אינו האם אפשר לתת שם לכל מצב שוק, אלא האם הידיעה על המצב מוסיפה `Net Edge` שניתן לשחזר מחוץ לנתונים שעליהם גילינו אותו.

---

# ‏137. מה מגיע בשלב הבא?

‏בשלב 26 נעבור ל־`RCA` של Rank #1 שנכשל.

‏שם נלמד לחקור עסקה או Candidate מוביל בצורה שיטתית:

```text
Was the prediction wrong?
Was the rank wrong?
Was the regime unfavorable?
Did the edge decay before fill?
Was execution poor?
Were costs underestimated?
Was the exit wrong?
Was the data wrong?
```

‏המטרה תהיה להפוך כל כישלון ממקרה מתסכל ל־Evidence שאפשר ללמוד ממנו בלי לשנות את המערכת מתוך ניחוש.