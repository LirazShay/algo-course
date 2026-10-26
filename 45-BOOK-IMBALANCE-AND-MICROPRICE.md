# ‏שלב 45 — `Book Imbalance` ו־`Microprice`: לקרוא לחץ פסיבי בספר בלי להתאהב ב־Snapshot

> ‏מטרת הפרק: להבין כיצד ניתן להפיק מידע קצר־טווח מהצד הפסיבי של ספר הפקודות — `Bid/Ask Size`, עומק בכמה Levels, ‏Queue Pressure, ‏Depth Dynamics ו־`Microprice` — תוך הבנה עמוקה של המגבלות: displayed liquidity יכולה להיעלם, להופיע מחדש, להיות חלקית, להיות מפוצלת בין venues, ולהגיב מהר יותר מקצב הדגימה שלנו.
>
> ‏העיקרון המרכזי: **Book Imbalance הוא Evidence הסתברותית, לא הבטחה לכיוון המחיר. הערך האמיתי נמצא בדרך כלל בשילוב של imbalance, persistence, depletion/replenishment, order flow ו־price response.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. איפה `Book Imbalance` יושב במערכת שלנו

‏בשלב 44 למדנו על הצד האגרסיבי:

```text
Who is crossing the spread?
Who is taking liquidity?
How much signed flow exists?
```

‏בשלב הזה עוברים לצד הפסיבי:

```text
Who is waiting in the book?
How much displayed liquidity is available?
Which side is thicker?
Which side is being depleted?
Which side is replenishing?
```

‏שני העולמות משלימים זה את זה.

---

# ‏2. `Order Flow` מול `Book State`

‏`Order Flow` הוא בעיקר זרם האירועים.

‏`Book State` הוא מצב הספר ברגע נתון.

‏לדוגמה:

```text
Bid  100.00 x 12,000
Ask  100.01 x  2,000
```

‏זה Snapshot.

‏אם רגע אחר כך הוא הופך ל־:

```text
Bid  100.00 x  3,000
Ask  100.01 x 11,000
```

‏ה־dynamic change עשוי להיות מעניין יותר מה־snapshot המקורי.

---

# ‏3. `Top-of-Book Imbalance`

‏הגרסה הפשוטה ביותר:

```text
imbalance = bid_size / (bid_size + ask_size)
```

‏אם:

```text
bid_size = 8,000
ask_size = 2,000
```

‏נקבל:

```text
imbalance = 0.80
```

‏אפשר גם למפות לטווח `[-1, +1]`:

```text
normalized_imbalance = (bid_size - ask_size) / (bid_size + ask_size)
```

‏בדוגמה:

```text
(8000 - 2000) / 10000 = 0.60
```

---

# ‏4. מה באמת אומר ערך גבוה

‏ערך חיובי גבוה אומר רק:

> ‏כרגע יש יותר displayed size בצד ה־Bid מאשר בצד ה־Ask לפי הנתונים שאנחנו רואים.

‏הוא **לא** אומר:

- ‏שהמחיר חייב לעלות.
- ‏שה־Bid לא ייעלם.
- ‏שה־Ask לא יתמלא מחדש.
- ‏שה־displayed size מייצג את כל ה־liquidity.
- ‏שה־orders שראינו עדיין שם בזמן שנפעל.

---

# ‏5. `Imbalance` אינו `Demand`

‏טעות נפוצה:

```text
Large Bid = strong demand
```

‏לא בהכרח.

‏Displayed Bid הוא interest פסיבי.

‏כדי להפוך אותו ל־evidence חזק יותר צריך לבדוק:

- ‏האם sellers מצליחים לפגוע בו.
- ‏האם הוא מתחדש.
- ‏האם המחיר מחזיק.
- ‏האם buyers גם תוקפים Ask.
- ‏האם ה־Bid נשאר כאשר השוק מתקרב אליו.

---

# ‏6. `Displayed Size` יכול להיות זמני

‏Order יכול:

1. ‏להופיע.
2. ‏להישאר מספר milliseconds.
3. ‏להיעלם לפני שנעשה בו שימוש.

‏לכן Snapshot בודד עלול להיות noisy מאוד.

---

# ‏7. `Persistence`

‏במקום לשאול רק:

```text
Is imbalance positive now?
```

‏אפשר לשאול:

```text
How long has it remained positive?
```

‏לדוגמה:

```text
imbalance_positive_duration_ms
```

‏או:

```text
fraction_of_last_2s_positive
```

---

# ‏8. `Imbalance Velocity`

‏אפשר למדוד שינוי:

```text
imbalance_velocity = imbalance_now - imbalance_500ms_ago
```

‏Imbalance שעובר מהר מ־`0.50` ל־`0.85` שונה מ־imbalance יציב של `0.85` כבר עשר שניות.

---

# ‏9. `Imbalance Acceleration`

‏אפשר להמשיך:

```text
velocity_now - velocity_previous
```

‏אבל חשוב לא לייצר עשרות derivatives בלי evidence.

‏ככל שהנגזרת גבוהה יותר, הרעש גדל.

---

# ‏10. `Level 1` בלבד

‏ב־L1 אנחנו רואים בדרך כלל:

```text
best_bid_price
best_bid_size
best_ask_price
best_ask_size
```

‏זו תמונה צרה מאוד.

---

# ‏11. למה L1 עלול להטעות

‏ייתכן:

```text
Bid1 size = 1,000
Ask1 size = 4,000
```

‏אבל Level שני ושלישי נראים כך:

```text
Bid2 = 20,000
Bid3 = 18,000
Ask2 = 1,200
Ask3 =   900
```

‏Top level לבדו לא מספר את כל מבנה העומק.

---

# ‏12. `Multi-Level Imbalance`

‏אפשר לחשב עומק מצטבר:

```text
bid_depth_N = Σ bid_size[i]
ask_depth_N = Σ ask_size[i]
```

‏ואז:

```text
imbalance_N = (bid_depth_N - ask_depth_N) /
              (bid_depth_N + ask_depth_N)
```

---

# ‏13. לא כל Level שווה בחשיבותו

‏Level קרוב ל־mid בדרך כלל רלוונטי יותר ל־horizon של שניות.

‏לכן אפשר להשתמש במשקולות:

```text
weighted_bid = Σ w[i] * bid_size[i]
weighted_ask = Σ w[i] * ask_size[i]
```

‏כאשר `w[i]` יורד ככל שה־level רחוק יותר.

---

# ‏14. `Distance-Weighted Depth`

‏אפשר לשקלל לפי מרחק מה־best price.

‏למשל:

```text
weight = exp(-lambda * distance_ticks)
```

‏הרעיון:

‏Liquidity במרחק tick אחד עשויה להשפיע יותר מ־liquidity במרחק עשרה ticks.

---

# ‏15. למה לא להניח decay קבוע

‏`lambda` אינו אמת אוניברסלית.

‏הוא תלוי ב־:

- ‏spread.
- ‏volatility.
- ‏tick size.
- ‏liquidity.
- ‏price level.
- ‏regime.
- ‏holding horizon.

---

# ‏16. `Book Imbalance` כמפה ולא מספר

‏במקום scalar יחיד אפשר לשמור vector:

```text
L1 imbalance
L2 cumulative imbalance
L3 cumulative imbalance
L5 cumulative imbalance
L10 cumulative imbalance
```

‏כך אפשר ללמוד איפה הלחץ ממוקם.

---

# ‏17. Shape של הספר

‏שני books יכולים לקבל אותו imbalance כולל אבל shape שונה.

‏לדוגמה:

```text
Book A:
Bid size concentrated at L1

Book B:
Bid size concentrated at L5-L10
```

‏ל־horizon קצר מאוד ייתכן שהמשמעות שונה.

---

# ‏18. `Near-Touch Depth`

‏Feature שימושי:

```text
near_touch_bid_depth
near_touch_ask_depth
```

‏מוגדר כעומק בתוך מספר ticks קטן מה־best prices.

---

# ‏19. `Depth Slope`

‏אפשר לשאול כיצד depth גדל ככל שמתרחקים מה־touch.

‏למשל:

```text
bid_depth_slope
ask_depth_slope
```

‏זה נותן מידע על shape, לא רק total size.

---

# ‏20. `Depth Concentration`

‏אפשר למדוד כמה מהעומק נמצא ב־L1 לעומת levels עמוקים יותר.

```text
bid_l1_share = bid_size_1 / bid_depth_5
```

---

# ‏21. `Bid Wall` אינו מושג קסם

‏Displayed size גדול מאוד בצד ה־Bid נקרא לעיתים “wall”.

‏אבל מקצועית צריך לשאול:

- ‏האם הוא persistent?
- ‏האם הוא מתחדש?
- ‏האם הוא נעלם כשהמחיר מתקרב?
- ‏האם trades באמת מתבצעים מולו?
- ‏האם יש price response?

---

# ‏22. `Ask Wall`

‏אותו עיקרון בצד ה־Ask.

‏Large displayed Ask אינו בהכרח resistance אמיתי.

---

# ‏23. Cancellation Dynamics

‏Book changes נוצרים מ־:

- ‏new limit orders.
- ‏cancellations.
- ‏executions.
- ‏repricing.

‏בלי event-level data קשה לדעת במדויק מה גרם לכל שינוי.

---

# ‏24. `Depletion`

‏Depletion היא ירידה ב־available depth.

‏לדוגמה:

```text
Ask1: 10,000 → 7,000 → 3,000 → 500
```

‏אם במקביל buyer-initiated trades מגיעים בקצב גבוה, זה עשוי להיות evidence ללחץ קנייה.

---

# ‏25. `Replenishment`

‏Replenishment היא הופעה חוזרת של liquidity.

```text
Ask1: 3,000 → trade 2,000 → Ask1 returns to 3,200
```

‏זה עשוי לרמוז שיש supply נוסף שלא היה גלוי קודם.

---

# ‏26. `Depletion + Price Response`

‏Ask שמתדלדל והמחיר עולה הוא pattern אחר מ־Ask שמתדלדל אך המחיר אינו מתקדם.

‏השילוב חשוב יותר מה־depth לבדו.

---

# ‏27. `Replenishment + Absorption`

‏אם buyers תוקפים את ה־Ask שוב ושוב, ה־Ask מתחדש, והמחיר לא עולה:

```text
Aggressive Buy Flow ↑
Ask Replenishment ↑
Price Response ≈ 0
```

‏זה pattern אפשרי של absorption.

---

# ‏28. `Book Pressure`

‏אפשר לחשוב על `Book Pressure` כמשפחה של features:

```text
imbalance
imbalance_velocity
near_touch_depth_ratio
depletion_rate
replenishment_rate
spread
microprice_offset
```

---

# ‏29. מהו `Mid Price`

```text
mid = (best_bid + best_ask) / 2
```

‏לדוגמה:

```text
Bid = 100.00
Ask = 100.02
Mid = 100.01
```

---

# ‏30. מגבלת ה־Mid

‏Mid מתעלם לחלוטין מגודל התורים.

‏אם:

```text
Bid = 100.00 x 20,000
Ask = 100.02 x 500
```

‏ה־mid עדיין `100.01`.

---

# ‏31. מהו `Microprice`

‏Microprice מנסה להזיז את ההערכה בתוך ה־spread בהתאם ל־imbalance ב־best bid/ask.

‏צורה נפוצה:

```text
microprice =
    ask_price * bid_size / (bid_size + ask_size)
  + bid_price * ask_size / (bid_size + ask_size)
```

---

# ‏32. למה המשקולות “הפוכות”

‏אם ה־Bid גדול מאוד יחסית ל־Ask, ה־microprice ינוע לכיוון ה־Ask.

‏האינטואיציה:

‏אם יש הרבה יותר displayed demand ב־Bid ופחות supply ב־Ask, הסיכוי הקצר־טווח ל־upward pressure עשוי להיות גבוה יותר.

---

# ‏33. דוגמה בסיסית

```text
Bid = 100.00 x 8,000
Ask = 100.02 x 2,000
```

```text
microprice =
100.02 * 8000 / 10000
+ 100.00 * 2000 / 10000
= 100.016
```

‏ה־mid הוא:

```text
100.01
```

‏ה־microprice נמצא מעליו.

---

# ‏34. `Microprice Offset`

‏Feature נוח:

```text
microprice_offset = microprice - mid
```

‏אפשר לנרמל ב־spread:

```text
microprice_offset_spread =
    (microprice - mid) / spread
```

---

# ‏35. למה Normalize ב־Spread

‏Offset של `0.005` דולר שונה מאוד כאשר:

```text
spread = 0.01
```

‏לעומת:

```text
spread = 0.50
```

---

# ‏36. `Microprice` אינו “Fair Value”

‏זה חשוב מאוד.

‏Microprice אינו valuation model.

‏הוא feature microstructure קצר־טווח.

---

# ‏37. `Microprice` אינו Target Price

‏אסור לומר:

```text
microprice = 100.016
therefore price should trade at 100.016
```

‏זה לא מה שהמדד אומר.

---

# ‏38. מה כן לבדוק

‏צריך לבדוק אמפירית:

```text
microprice_offset at t
→ future mid movement at t + horizon
```

‏למשל:

```text
100ms
500ms
1s
2s
5s
10s
```

‏לפי resolution הנתונים הזמין לנו.

---

# ‏39. `Microprice Predictive Horizon`

‏ייתכן שה־signal שימושי ל־200ms ונעלם אחרי 5 שניות.

‏ייתכן גם שאין לנו infrastructure שמסוגל לנצל signal כזה.

‏Edge תיאורטי שאינו בר־ביצוע אינו Edge שימושי.

---

# ‏40. `Signal Half-Life`

‏נמדוד:

```text
predictive_power(horizon)
```

‏ולא רק correlation בנקודה אחת.

---

# ‏41. `Top-of-Book Microprice` הוא התחלה

‏אפשר לבנות variants עמוקים יותר שמשתמשים במספר levels.

‏אבל אין נוסחה יחידה “נכונה”.

---

# ‏42. `Multi-Level Microprice`

‏אפשר להגדיר effective bid/ask pressure על כמה levels ואז להמיר אותה להטיה סביב ה־mid.

‏זו כבר Feature Engineering.

---

# ‏43. אל תמציא נוסחה ואז תקרא לה אמת

‏אם בנינו:

```text
microprice_v2
```

‏עם משקולות משלנו, זו hypothesis.

‏צריך validation מחוץ לנתונים שעליהם בחרנו את המשקולות.

---

# ‏44. `Book Imbalance` תלוי ב־Tick Size

‏במניה שבה spread כמעט תמיד tick אחד, dynamics שונים ממניה עם spread של כמה ticks.

---

# ‏45. `Tick-Constrained Stocks`

‏כאשר tick size גדול יחסית למחיר ולתנודתיות, queue dynamics נעשים חשובים במיוחד.

---

# ‏46. `Large-Tick` מול `Small-Tick`

‏התנהגות imbalance אינה בהכרח transferable בין שתי הקבוצות.

‏לכן צריך segment analysis.

---

# ‏47. Spread Regime

‏נמדוד imbalance יחד עם:

```text
spread_ticks
spread_bps
```

‏אותו imbalance בתוך spread של tick אחד שונה מ־spread של עשרה ticks.

---

# ‏48. Depth Regime

‏גם absolute depth חשוב.

```text
Bid 100 x 100
Ask 101 x 20
```

‏יכול לתת imbalance דומה ל־:

```text
Bid 100 x 100,000
Ask 101 x 20,000
```

‏אבל executability שונה לחלוטין.

---

# ‏49. Relative Depth

‏אפשר לנרמל depth ביחס להיסטוריה של אותו symbol:

```text
current_bid_depth / median_bid_depth_recent
```

---

# ‏50. Cross-Sectional Depth

‏אפשר גם להשוות למניות אחרות באותו רגע.

‏זה מתאים במיוחד ל־whole-market scanner שלנו.

---

# ‏51. `Book Imbalance Percentile`

‏במקום raw value:

```text
imbalance_percentile_within_symbol
```

‏או:

```text
imbalance_percentile_cross_section
```

---

# ‏52. למה Percentile יכול לעזור

‏Raw imbalance distribution שונה בין symbols.

‏Percentile יכול להפוך את feature ליותר comparable.

---

# ‏53. אבל Percentile יכול להדליף Future

‏אם מחשבים percentile בעזרת כל היום בדיעבד, קיבלנו leakage.

‏צריך point-in-time normalization בלבד.

---

# ‏54. `Book Imbalance` ו־Order Flow

‏הקומבינציה מעניינת יותר:

```text
Positive Book Imbalance
+ Positive Aggressor Flow
+ Upward Price Response
```

‏עשויה להיות חזקה יותר מכל רכיב בנפרד.

---

# ‏55. Pattern: Pressure Agreement

```text
Book says buyers stronger
Flow says buyers aggressive
Price moves up
```

‏זה agreement.

---

# ‏56. Pattern: Book/Flow Conflict

```text
Book strongly bid-heavy
Aggressor flow strongly sell-heavy
```

‏כאן צריך להבין מי משתנה ראשון.

---

# ‏57. Conflict אינו בהכרח רע

‏לפעמים conflict הוא signal מעניין יותר מ־agreement.

‏לדוגמה:

‏seller aggression חזק אך Bid ממשיך להתחדש והמחיר לא יורד.

‏זו יכולה להיות absorption hypothesis.

---

# ‏58. `Book Response to Flow`

‏Feature אפשרי:

```text
bid_replenishment_after_sell_flow
ask_replenishment_after_buy_flow
```

---

# ‏59. `Price Response to Book Pressure`

‏אפשר לבדוק:

```text
future_mid_return conditioned on imbalance bucket
```

---

# ‏60. Bucket Validation

‏לדוגמה:

```text
[-1.0,-0.8)
[-0.8,-0.6)
...
[0.8,1.0]
```

‏ולבדוק אם future return משתנה בצורה monotonic.

---

# ‏61. Monotonicity חשובה

‏אם imbalance גבוה יותר אינו מראה שיפור עקבי כלשהו בתוצאה, אולי feature חלש או regime-dependent.

---

# ‏62. אל תכריח Monotonicity

‏ייתכן שהקשר אינו ליניארי.

‏למשל extreme imbalance יכול להיות דווקא unstable בגלל cancellation risk.

---

# ‏63. `Extreme Imbalance`

‏ערך כמעט `+1` או `-1` דורש בדיקה מיוחדת.

‏הוא יכול לייצג:

- ‏לחץ אמיתי.
- ‏ספר דליל מאוד.
- ‏quote זמני.
- ‏data issue.
- ‏cancel-prone liquidity.

---

# ‏64. `Denominator Problem`

‏אם:

```text
bid_size + ask_size
```

‏קטן מאוד, ratio קיצוני יכול להיווצר מכמות זניחה.

---

# ‏65. Minimum Depth Gate

‏לכן feature טוב עשוי לכלול gate:

```text
total_top_depth >= minimum_required
```

---

# ‏66. `Imbalance Confidence`

‏במקום value בלבד:

```text
imbalance_value
imbalance_confidence
```

‏ה־confidence יכול לקחת בחשבון:

- ‏total depth.
- ‏freshness.
- ‏persistence.
- ‏data completeness.
- ‏venue coverage.

---

# ‏67. Freshness

‏Book feature ישן אפילו בשנייה אחת יכול להיות חסר ערך במניה מהירה.

---

# ‏68. `Book Age`

‏נשמור:

```text
book_age_ms
```

‏בזמן decision.

---

# ‏69. `Level Age`

‏אם אפשר, אפשר לשמור גם age לכל level/side.

‏לא תמיד כל ה־book מתעדכן יחד.

---

# ‏70. Snapshot Atomicity

‏שאלה חשובה:

> ‏האם Bid ו־Ask ב־snapshot שלנו באמת מייצגים אותו logical instant?

‏אם ingestion updates מגיעים בנפרד, אפשר ליצור מצב מעורב.

---

# ‏71. Torn Book Snapshot

‏לדוגמה:

```text
new bid
old ask
```

‏יכול לייצר imbalance מזויף.

---

# ‏72. Book Version

‏כדאי שכל canonical book יקבל:

```text
book_version
as_of_time
received_at
```

---

# ‏73. Event Ordering

‏ב־event-level feed חשוב לשמור sequence ככל שהספק נותן אותו.

---

# ‏74. Sequence Gap

‏אם חסר event:

```text
expected 10542
received 10544
```

‏הספר המקומי כבר אינו בהכרח אמין.

---

# ‏75. Gap Policy

‏במקרה כזה:

```text
book_state = INVALID
```

‏עד rebuild/resnapshot.

---

# ‏76. Never silently continue

‏אסור להמשיך לחשב sophisticated imbalance על book שאנו יודעים שהוא corrupted.

---

# ‏77. `L1` Feed מול Consolidated Book

‏ה־best bid/ask שאנחנו רואים תלוי במקור הנתונים.

‏Venue-specific feed אינו בהכרח NBBO.

---

# ‏78. Venue Fragmentation

‏Book pressure ב־venue אחד יכול להיות שונה מאוד מהשוק המאוחד.

---

# ‏79. `Venue Imbalance`

‏אם יש direct feeds, אפשר לחשב:

```text
imbalance_by_venue
```

‏אבל זה מוסיף מורכבות גדולה.

---

# ‏80. `Consolidated Imbalance`

‏איחוד venues נשמע פשוט אך דורש:

- ‏timestamp alignment.
- ‏deduplication.
- ‏price-level merging.
- ‏venue state quality.

---

# ‏81. Cross-Feed Divergence

‏אם Market Data Provider A ו־Broker B מציגים best quotes שונים, צריך לתעד זאת.

---

# ‏82. Do not mix silently

‏אין לחשב Bid size מספק אחד ו־Ask size מספק אחר בלי contract ברור.

---

# ‏83. `Microprice Source`

‏נשמור metadata:

```text
source_feed
book_scope
levels_used
formula_version
```

---

# ‏84. Formula Versioning

‏אם microprice formula משתנה:

```text
microprice_v1
microprice_v2
```

‏צריך version מפורש.

---

# ‏85. Feature Registry

‏נכניס Book features ל־Feature Registry שכבר בנינו בשלב 13.

---

# ‏86. Example Feature Set

```text
top_imbalance
imbalance_l3
imbalance_l5
microprice_offset_spread
bid_depletion_rate_1s
ask_depletion_rate_1s
bid_replenishment_rate_1s
ask_replenishment_rate_1s
imbalance_persistence_2s
```

---

# ‏87. Avoid Feature Explosion

‏קל מאוד לייצר:

```text
5 levels × 8 windows × 4 transforms
```

‏ולקבל מאות features correlated.

---

# ‏88. Feature Families

‏עדיף לחשוב בקבוצות:

```text
Static Imbalance
Dynamic Imbalance
Depth Shape
Depletion/Replenishment
Microprice
Book/Flow Interaction
```

---

# ‏89. Ablation

‏נבדוק אם family מוסיפה incremental value.

---

# ‏90. Redundancy

‏אם `imbalance_l3`, ‏`imbalance_l4`, ‏`imbalance_l5` כמעט זהים, אין בהכרח צורך בכולם.

---

# ‏91. `Microprice` מול `Imbalance`

‏Microprice הוא למעשה transform של price + top-level imbalance.

‏לכן אסור לספור אותם כאילו הם evidence בלתי־תלויים לחלוטין.

---

# ‏92. Multicollinearity

‏ב־linear score, features correlated מאוד יכולים לגרום weights לא יציבים.

---

# ‏93. Rank-Based Features

‏ב־whole-market scanner אפשר להשתמש ב־rank:

```text
microprice_offset_rank
imbalance_persistence_rank
```

---

# ‏94. Cross-Sectional Context

‏אם כמעט כל השוק bid-heavy באותו רגע, symbol עם imbalance חיובי אינו בהכרח יוצא דופן.

---

# ‏95. Relative Imbalance

```text
symbol_imbalance - market_median_imbalance
```

‏יכול להיות feature מחקרי.

---

# ‏96. Sector Context

‏אפשר להשוות גם לקבוצת peers.

‏אבל יש להיזהר מהגדלת complexity לפני שהוכחנו ערך.

---

# ‏97. `Book Breadth`

‏אפשר למדוד כמה symbols בשוק הם bid-heavy מול ask-heavy.

---

# ‏98. Market Regime

‏Book features יכולים להתנהג אחרת ב־:

- ‏open.
- ‏midday.
- ‏close.
- ‏high volatility.
- ‏low liquidity.
- ‏fast market.

---

# ‏99. Regime Conditioning

‏נבדוק:

```text
P(next_move | imbalance, regime)
```

‏ולא רק:

```text
P(next_move | imbalance)
```

---

# ‏100. אבל לא לפצל מוקדם מדי

‏יותר מדי regime buckets יוצרים sample starvation.

---

# ‏101. `Book Churn`

‏מדד לכמה מהר sizes/levels משתנים.

```text
updates_per_second
```

---

# ‏102. Churn Context

‏Imbalance של `0.8` בספר יציב שונה מ־`0.8` בספר שמשתנה 100 פעמים בשנייה.

---

# ‏103. `Book Half-Life`

‏אפשר למדוד כמה מהר snapshot מאבד דמיון למצב הבא.

---

# ‏104. למה Half-Life חשוב לרובוט שלנו

‏אם Book half-life קצר יותר מ־decision latency שלנו, feature מפורט מדי אולי לא שימושי.

---

# ‏105. Feature Cost

‏כל feature מוסיף:

- ‏CPU.
- ‏memory.
- ‏latency.
- ‏data requirements.
- ‏testing complexity.

---

# ‏106. `Useful Edge per Cost`

‏Feature מתקדם צריך להצדיק את העלות שלו.

---

# ‏107. `Fast Path`

‏לכל ~4,000 symbols אפשר לחשב features זולים:

```text
spread
top imbalance
microprice offset
freshness
basic depth
```

---

# ‏108. `Deep Path`

‏רק ל־Top candidates:

```text
multi-level depth dynamics
replenishment
book-flow interaction
venue checks
```

---

# ‏109. למה Funnel עדיף

‏הוא מאפשר לשמור latency נמוך בלי לוותר על analysis עמוק במקום שבו הוא שווה משהו.

---

# ‏110. `Book Imbalance` כ־Filter

‏אפשר להשתמש בו כ־gate:

```text
reject if strong opposing pressure
```

‏אבל זה hypothesis שצריך validation.

---

# ‏111. `Book Imbalance` כ־Score Feature

‏אפשר לשלב אותו בתוך score במקום hard threshold.

---

# ‏112. `Book Imbalance` כ־Execution Feature

‏ייתכן שהוא שימושי יותר לבחירת passive/aggressive execution מאשר לבחירת המניה עצמה.

---

# ‏113. זה distinction חשוב

‏Feature יכול להיות חלש ל־Alpha אבל חזק ל־Execution.

---

# ‏114. Alpha Feature

‏שואל:

```text
Will price move favorably?
```

---

# ‏115. Execution Feature

‏שואל:

```text
Given that we want to trade, how should we execute?
```

---

# ‏116. Example

‏Strong bid imbalance יכול להגדיל confidence ב־passive buy fill?

‏לא בהכרח.

‏אם Bid עמוס מאוד, queue ahead יכול דווקא להקטין fill probability.

---

# ‏117. אותו Feature, שתי השפעות

‏Bid depth גדול יכול להיות:

- ‏bullish pressure signal.
- ‏bad passive queue position.

‏לכן Prediction ו־Execution חייבים להיות מודלים נפרדים.

---

# ‏118. `Queue-Aware Imbalance`

‏אפשר לנסות להפריד:

```text
market_pressure
our_queue_feasibility
```

---

# ‏119. `Microprice` ו־Execution

‏אם microprice זז לכיוון ה־Ask, passive buy ב־Bid עלול להפוך פחות סביר לביצוע לפני שהמחיר בורח.

---

# ‏120. `Microprice` ו־Marketable Limit

‏אפשר לבדוק האם extreme microprice offset מצדיק יותר urgency.

‏שוב: זו hypothesis, לא כלל.

---

# ‏121. Signal Decay

‏אם microprice signal מתחלף מהר, צריך למדוד:

```text
signal_age_at_submit
signal_age_at_ack
signal_age_at_fill
```

---

# ‏122. Decision Lag

‏Feature מעולה בזמן `t` יכול להיות חסר ערך ב־`t+300ms`.

---

# ‏123. End-to-End Validation

‏נבדוק:

```text
Book Feature
→ Decision
→ Order
→ Fill
→ Net Outcome
```

‏ולא רק feature → next tick.

---

# ‏124. `Next Tick` Trap

‏חיזוי next tick אינו בהכרח רווחי לאחר spread ו־execution costs.

---

# ‏125. Label Alignment

‏אם feature נבנה מ־Bid/Ask, label צריך להיות ברור:

```text
future_mid_return
future_bid_return
future_ask_return
executable_return
```

---

# ‏126. Mid Return יכול להיות אופטימי

‏ל־buy strategy, רווח ב־mid אינו בהכרח executable.

---

# ‏127. `Executable Label`

‏אפשר למדוד:

```text
future_executable_sell_bid - entry_executable_buy_ask
```

‏בהתאם למדיניות execution.

---

# ‏128. Multi-Horizon Labels

‏לרובוט שלנו:

```text
1s
2s
5s
10s
30s
60s
```

‏או resolutions מתאימים לפי data fidelity.

---

# ‏129. Microprice Calibration Curve

‏נבנה buckets של offset ונבדוק future outcomes.

---

# ‏130. Calibration צריך להיות OOS

‏לא לבחור bins ו־thresholds על אותו dataset שעליו מציגים performance.

---

# ‏131. `Conditional Calibration`

‏אפשר לבדוק microprice לפי:

```text
spread bucket
liquidity bucket
volatility bucket
time-of-day
```

---

# ‏132. Minimum Sample Size

‏Bucket עם 40 observations אינו evidence חזק רק כי הגרף נראה יפה.

---

# ‏133. Confidence Intervals

‏נרצה uncertainty סביב effect estimate.

---

# ‏134. Clustered Dependence

‏אלפי observations מאותה מניה באותה דקה אינם בהכרח 100% independent.

---

# ‏135. Episode-Based Analysis

‏אפשר לאגד contiguous periods של imbalance קיצוני ל־episodes.

---

# ‏136. `Imbalance Episode`

‏למשל:

```text
start_time
end_time
max_imbalance
mean_imbalance
persistence
price_move_during
future_move_after
```

---

# ‏137. Episode avoids overcounting

‏אם imbalance נשאר `0.9` במשך 5 שניות עם 500 updates, זה לא בהכרח 500 independent signals.

---

# ‏138. Entry Timing within Episode

‏Early imbalance יכול להיות שונה מ־late imbalance.

---

# ‏139. `Fresh Signal` מול `Stale Extreme`

‏Extreme שנוצר עכשיו עשוי להיות שונה מ־Extreme שנמשך זמן רב ללא price response.

---

# ‏140. `Failure to Move`

‏אם pressure חזק אך המחיר לא זז:

‏זו אינפורמציה.

---

# ‏141. `Book Absorption`

‏לדוגמה:

```text
positive imbalance
positive buy flow
price flat
ask replenishment high
```

‏יכול להצביע שהלחץ הנראה אינו מתורגם למחיר.

---

# ‏142. `Exhaustion`

‏אם imbalance קיצוני נחלש, flow נחלש והמחיר מפסיק להתקדם, ייתכן שהמהלך מאבד כוח.

---

# ‏143. `Flip`

‏מעבר מהיר:

```text
+0.8 → -0.7
```

‏עשוי להיות feature חזק יותר מהערך המוחלט.

---

# ‏144. `Flip Count`

‏אפשר למדוד כמה פעמים imbalance החליף sign בתוך חלון.

---

# ‏145. High Flip Count

‏עשוי להעיד על noisy/choppy book.

---

# ‏146. `Stable Pressure`

‏אפשר להגדיר:

```text
high magnitude
low flip count
high persistence
```

---

# ‏147. `Book Stability Score`

‏Feature composite אפשרי, אך יש להיזהר מ־hand-tuning.

---

# ‏148. Order Book Spoof-Like Patterns

‏לפעמים liquidity גדולה מופיעה ונעלמת ללא execution משמעותי.

‏המערכת שלנו אינה צריכה להכריז למה זה קרה או מי התכוון למה.

‏אנחנו מתארים behavior observable בלבד.

---

# ‏149. Intent Attribution מסוכן

‏אל נכתוב:

```text
someone is manipulating the book
```

‏אם אין evidence משפטי/שוקי שמאפשר זאת.

‏למערכת מספיק לומר:

```text
large displayed liquidity appeared and cancelled rapidly
```

---

# ‏150. `Cancel-to-Trade Ratio`

‏אם data מאפשרת:

```text
cancel_volume / executed_volume
```

‏יכול להיות context מעניין.

---

# ‏151. Data Requirements

‏ל־true cancel metrics צריך event data טוב.

‏Snapshots בלבד אינם מספיקים להבחין בוודאות בין cancellation, execution ו־book replacement.

---

# ‏152. Snapshot Approximation

‏עם snapshots אפשר לכל היותר להסיק changes:

```text
size decreased
size increased
price level disappeared
```

‏לא תמיד את הסיבה.

---

# ‏153. `Observed` מול `Inferred`

‏נשמור במודל:

```text
observed_event
inferred_feature
confidence
```

---

# ‏154. Data Provenance

‏כל feature צריך לדעת:

```text
provider
feed_type
schema_version
book_depth
sampling_mode
```

---

# ‏155. Historical/Live Parity

‏אם Live משתמש ב־L2 אבל Backtest משתמש רק ב־L1, אסור להעמיד פנים שזה אותו strategy.

---

# ‏156. Fidelity Tag

```text
BOOK_FIDELITY=L1
BOOK_FIDELITY=L2_5
BOOK_FIDELITY=L2_10
BOOK_FIDELITY=MBO
```

---

# ‏157. `MBO`

‏Market-by-Order data מאפשרת פירוט עשיר יותר של individual orders כאשר venue/feed מספקים זאת.

---

# ‏158. `MBP`

‏Market-by-Price מאגד orders לאותה price level.

---

# ‏159. Queue Modeling Difference

‏MBO יכול לאפשר queue estimate מדויק יותר מ־MBP.

‏אבל גם אז יש venue rules ו־hidden liquidity.

---

# ‏160. Never claim perfect queue truth

‏גם עם נתונים עשירים צריך להכיר במגבלות.

---

# ‏161. `Book Imbalance` During Fast Markets

‏ב־fast market snapshot יכול להיות stale כמעט מיד.

---

# ‏162. Update Rate as Feature

‏לכן:

```text
book_updates_per_second
```

‏יכול להיות חלק מה־confidence.

---

# ‏163. Processing Lag

‏נמדוד:

```text
now - book_received_at
```

‏וגם:

```text
book_received_at - exchange_event_time
```

‏אם זמין.

---

# ‏164. `Staleness Gate`

‏אם book ישן מדי:

```text
book_features_valid = false
```

---

# ‏165. No silent fallback

‏אם L2 נפל, אין לעבור ל־L1 ולשמור אותו score כאילו כלום לא השתנה.

---

# ‏166. Capability Degradation

‏אפשר להגדיר:

```text
BOOK_MODE=L2
BOOK_MODE=L1_DEGRADED
BOOK_MODE=UNAVAILABLE
```

---

# ‏167. Score Compatibility

‏כל model/score צריך לדעת באיזה data mode הוא הוכשר ונבדק.

---

# ‏168. `Feature Availability Contract`

‏ה־Strategy צריכה לדעת אילו Book features תקינים כרגע.

---

# ‏169. `Missing` אינו Zero

‏אם אין לנו Ask size, imbalance אינו `+1`.

‏הוא Missing.

---

# ‏170. Missingness as Signal

‏לפעמים data missing קשור ל־market stress.

‏אבל אסור להשתמש בזה בלי validation.

---

# ‏171. `Microprice` בזמן Locked/Crossed Market

‏אם:

```text
bid >= ask
```

‏נוסחת microprice רגילה דורשת טיפול מפורש.

---

# ‏172. `Locked Market`

```text
bid == ask
```

‏אין spread חיובי.

---

# ‏173. `Crossed Market`

```text
bid > ask
```

‏יכול להופיע עקב fragmentation, timing, bad data או market state מיוחד.

---

# ‏174. Validation Gate

‏במצב חריג:

```text
microprice_valid = false
```

‏אלא אם יש לנו model מפורש לכך.

---

# ‏175. Zero Size

‏גם zero/negative/invalid size חייבים validation.

---

# ‏176. Precision

‏Price ו־Size צריכים data types מתאימים.

‏אין להסתמך על floating-point comparison רופף כש־tick precision חשובה.

---

# ‏177. Tick Normalization

‏מרחקי מחיר עדיף לעיתים למדוד ב־ticks:

```text
spread_ticks
microprice_offset_ticks
```

---

# ‏178. BPS Normalization

‏אפשר גם:

```text
spread_bps
microprice_offset_bps
```

---

# ‏179. למה צריך כמה Normalizations

‏Ticks מתארים market mechanics.

‏BPS מתארים magnitude כלכלי יחסית למחיר.

---

# ‏180. `Book Pressure` מול Trade Size

‏אם הפוזיציה שלנו גדולה יחסית ל־visible depth, feature prediction טוב יכול להיות irrelevant.

---

# ‏181. Executability Gate

```text
our_order_size / near_touch_depth
```

‏צריך להישאר סביר לפי policy.

---

# ‏182. Capacity

‏Book features יכולים לעזור להבין מתי strategy אינה scalable.

---

# ‏183. Small Account Advantage

‏פוזיציה קטנה יכולה לעיתים להיות זניחה יחסית ל־book.

‏אבל אסור להניח זאת; מודדים.

---

# ‏184. `Book Impact Estimate`

‏אפשר להעריך:

```text
expected_levels_consumed
```

‏לפקודה אגרסיבית.

---

# ‏185. Depth Weighted Average Price

‏ל־marketable execution אפשר לחשב expected sweep price מתוך displayed depth.

---

# ‏186. אבל displayed depth אינו guarantee

‏Latency ו־cancellations יכולים לשנות אותו לפני ה־fill.

---

# ‏187. Pre-Trade Recheck

‏לפני submit:

```text
book still fresh?
spread still acceptable?
pressure still valid?
execution price still within budget?
```

---

# ‏188. `Book Snapshot ID`

‏כדאי לקשור את order intent ל־snapshot שעליו התבסס.

---

# ‏189. Decision Evidence

‏נשמור:

```text
book_snapshot_id
feature_snapshot_id
decision_id
order_intent_id
```

---

# ‏190. First Divergence

‏ב־RCA נוכל לשאול:

```text
Did the book change before decision?
Before submit?
Before ack?
Before fill?
```

---

# ‏191. `Signal-to-Submit Book Drift`

‏נמדוד שינוי ב־imbalance/microprice בין signal ל־submit.

---

# ‏192. `Submit-to-Fill Book Drift`

‏נמדוד שינוי נוסף עד fill.

---

# ‏193. Why this matters

‏Strategy יכולה להיות נכונה ב־decision time אך execution מאוחר מדי.

---

# ‏194. `Book Drift` כ־Execution RCA

‏זה עוזר להפריד:

```text
bad prediction
vs
slow execution
```

---

# ‏195. `Book Imbalance` ב־NO TRADE

‏Strong signal אחר עם book מתנגד מאוד יכול להיות reason ל־NO TRADE אם validation מוכיחה שזה משפר net outcome.

---

# ‏196. Avoid hand rules

‏לא לקבוע:

```text
if imbalance < 0.6 reject
```

‏רק כי זה נשמע הגיוני.

---

# ‏197. Threshold Curve

‏בודקים performance לאורך threshold range.

---

# ‏198. Robust Region

‏עדיף region יציב על “מספר קסם” יחיד.

---

# ‏199. Interaction with Momentum

‏נבדוק למשל:

```text
short_momentum high
book_imbalance high
```

‏מול:

```text
short_momentum high
book_imbalance low
```

---

# ‏200. Interaction with Flow

‏גם:

```text
book pressure
× aggressor flow
```

---

# ‏201. Interaction with Spread

‏Microprice signal בזמן spread רחב יכול להתנהג אחרת.

---

# ‏202. Interaction with Liquidity

‏Extreme imbalance בספר דליל אינו בהכרח איכותי.

---

# ‏203. Interaction with Volatility

‏ב־high volatility book יכול להיות פחות persistent.

---

# ‏204. Interaction with Rank Stability

‏Candidate שמדורג ראשון וגם book שלו יציב שונה מ־candidate שקופץ ל־#1 בגלל snapshot רגעי.

---

# ‏205. `Book Confirmation`

‏Book יכול לשמש confirmation layer ל־Top candidate.

---

# ‏206. But confirmation has latency cost

‏כל deep check מאוחר יותר עלול לשרוף signal TTL.

---

# ‏207. Fast vs Deep Trade-Off

‏צריך למדוד:

```text
quality_gain_from_book_check
vs
latency_cost_of_book_check
```

---

# ‏208. Precompute Where Possible

‏Whole-market features זולים כדאי לחשב continuously, לא רק אחרי שהמניה הפכה ל־#1.

---

# ‏209. Top-N Enrichment

‏Features כבדים יותר אפשר לחשב רק ל־Top-N.

---

# ‏210. `Book Feature Cache`

‏Cache צריך לכלול:

```text
value
as_of
source
quality
version
```

---

# ‏211. `Book Feature TTL`

‏לכל feature צריך להיות TTL משלו.

---

# ‏212. Static TTL is not always enough

‏ב־fast regime ה־TTL יכול להיות קצר יותר.

---

# ‏213. Dynamic TTL

‏אפשר לחקור TTL תלוי:

```text
book churn
volatility
update rate
```

---

# ‏214. Replay Requirements

‏כדי לשחזר Book features צריך event ordering deterministically.

---

# ‏215. Same Reducer

‏Live ו־Replay צריכים להשתמש באותו book reducer ככל האפשר.

---

# ‏216. `BookBuilder`

‏ארכיטקטורה אפשרית:

```text
Raw Market Events
      ↓
Canonical Book Events
      ↓
BookBuilder
      ↓
Immutable Book Snapshot
      ↓
Book Feature Engine
```

---

# ‏217. Immutable Snapshot

‏ה־Strategy מקבלת snapshot שאינו משתנה מתחת לרגליים בזמן חישוב.

---

# ‏218. Single Writer

‏Book state per symbol עדיף לעדכן דרך owner יחיד או partitioned event loop.

---

# ‏219. C# Architecture

```csharp
public interface IOrderBookStore
{
    OrderBookSnapshot? Get(string instrumentId);
}

public interface IBookFeatureEngine
{
    BookFeatures Compute(OrderBookSnapshot book, DateTimeOffset asOf);
}
```

---

# ‏220. Canonical Snapshot

```csharp
public sealed record OrderBookSnapshot(
    string InstrumentId,
    long Version,
    DateTimeOffset AsOf,
    IReadOnlyList<BookLevel> Bids,
    IReadOnlyList<BookLevel> Asks,
    BookQuality Quality);
```

---

# ‏221. Book Level

```csharp
public sealed record BookLevel(
    decimal Price,
    decimal Size,
    int Level);
```

---

# ‏222. Feature Output

```csharp
public sealed record BookFeatures(
    decimal? TopImbalance,
    decimal? ImbalanceL5,
    decimal? Microprice,
    decimal? MicropriceOffsetBps,
    double? BidDepletionRate,
    double? AskDepletionRate,
    bool IsValid,
    string? InvalidReason);
```

---

# ‏223. Nullability matters

‏Feature שלא ניתן לחשב אינו zero.

---

# ‏224. `InvalidReason`

‏למשל:

```text
STALE_BOOK
MISSING_BID
MISSING_ASK
CROSSED_BOOK
SEQUENCE_GAP
INSUFFICIENT_DEPTH
```

---

# ‏225. Observability

‏Metrics בסיסיים:

```text
book_snapshot_age_ms
book_update_rate
invalid_book_ratio
imbalance_distribution
microprice_offset_distribution
```

---

# ‏226. Scanner Metrics

```text
rank1_imbalance
rank1_microprice_offset
rank1_book_age
rank1_book_mode
```

---

# ‏227. Decision Metrics

```text
trades_rejected_by_book_gate
book_confirmation_pass_rate
```

---

# ‏228. Outcome Metrics

```text
future_return_by_imbalance_bucket
net_return_by_microprice_bucket
fill_rate_by_book_state
```

---

# ‏229. `Book Model Drift`

‏נעקוב האם הקשר בין feature לתוצאה משתנה לאורך זמן.

---

# ‏230. Drift can come from data too

‏שינוי בספק, schema או aggregation יכול להיראות כמו market drift.

---

# ‏231. Version Everything

```text
provider_version
schema_version
book_builder_version
feature_version
score_version
```

---

# ‏232. Controlled Experiment

‏לדוגמה:

```text
Champion: no book feature
Challenger: add top imbalance
```

---

# ‏233. Next experiment

```text
Challenger 2: add microprice offset
```

‏לא להוסיף עשר features יחד ואז לנסות להבין מה עזר.

---

# ‏234. Shadow Evaluation

‏אפשר לחשב Book features Live בלי לתת להם להשפיע על Orders.

---

# ‏235. Decision Diff

‏נשמור:

```text
would_book_model_change_candidate?
would_book_model_change_trade_no_trade?
would_book_model_change_execution_mode?
```

---

# ‏236. Decision Impact Rate

‏אם feature כמעט אף פעם לא משנה החלטה, ייתכן שהמורכבות שלו אינה מוצדקת.

---

# ‏237. Economic Impact

‏גם אם הוא משנה החלטות, צריך לבדוק אם השינוי משפר net outcome.

---

# ‏238. `Microprice Edge` after costs

‏Signal של fractions of a spread עלול להיעלם לאחר fees/slippage.

---

# ‏239. Cost-to-Signal Ratio

```text
expected_execution_cost / expected_microstructure_edge
```

‏אם היחס גבוה מדי, אין טעם.

---

# ‏240. Latency-to-Half-Life Ratio

```text
end_to_end_latency / signal_half_life
```

‏זה metric קריטי ל־microstructure signals.

---

# ‏241. If ratio is too high

‏אנחנו רואים signal שאינו באמת בר־ניצול אצלנו.

---

# ‏242. Do not imitate HFT blindly

‏חלק מ־book signals חיים בטווחים קצרים מדי למערכת retail/API רגילה.

‏זה לא אומר שהם “לא אמיתיים”.

‏זה אומר שהם אולי לא executable עבור הארכיטקטורה שלנו.

---

# ‏243. Personal Algo Advantage

‏הרובוט שלנו לא צריך לנצח מערכות co-located במיקרו־שניות.

‏הוא צריך לזהות features שמחזיקים מספיק זמן כדי לשרוד:

```text
feed latency
processing
ranking
decision
broker submit
fill
```

---

# ‏244. `Tradable Microstructure Edge`

‏זה המונח החשוב:

```text
Predictive Edge
minus
Latency Decay
minus
Execution Cost
minus
Fill Risk
```

---

# ‏245. Backtest Baseline

‏נרצה לפחות שלושה modes:

```text
No Book Model
L1 Book Model
Deep Book Model
```

---

# ‏246. Compare Incrementally

‏השאלה:

```text
What did deeper book data add?
```

‏ולא:

```text
Does deep book look sophisticated?
```

---

# ‏247. Golden Scenario 1 — Strong Bid Pressure

```text
Bid depth grows
Ask depth shrinks
Buy flow increases
Mid rises
```

‏המערכת צריכה לזהות agreement.

---

# ‏248. Golden Scenario 2 — Absorption

```text
Buy flow strong
Ask replenishes
Price flat
```

‏המערכת צריכה לא להתייחס ל־buy flow לבדו כ־continuation certainty.

---

# ‏249. Golden Scenario 3 — Fake-Looking Snapshot Without Intent Claim

```text
Huge bid appears
Huge bid disappears
No meaningful executions
Price unchanged
```

‏המערכת מתעדת cancellation dynamics — לא מנחשת intent.

---

# ‏250. Golden Scenario 4 — Sequence Gap

```text
book update gap detected
```

‏Expected:

```text
book invalidated
no new book-dependent trade
resnapshot required
```

---

# ‏251. Golden Scenario 5 — Book Flip During Submit

```text
Signal: strongly positive book
Before submit: strongly negative book
```

‏Expected:

```text
pre-submit recheck decides according to policy
```

---

# ‏252. Golden Scenario 6 — Strong Signal but Tiny Depth

‏Expected:

```text
prediction may remain positive
execution feasibility may fail
```

---

# ‏253. Property Test: Bounds

‏Standard normalized imbalance צריך להישאר ב־:

```text
[-1, +1]
```

‏כאשר denominator תקין.

---

# ‏254. Property Test: Symmetry

‏אם מחליפים Bid ו־Ask, sign של normalized imbalance צריך להתהפך.

---

# ‏255. Property Test: Equal Sizes

```text
bid_size == ask_size
```

‏צריך לתת imbalance של `0` בנוסחה הסימטרית.

---

# ‏256. Property Test: Microprice Bounds

‏ב־normal unlocked market:

```text
bid <= microprice <= ask
```

---

# ‏257. Property Test: Equal Size Microprice

‏אם sizes שווים:

```text
microprice == mid
```

---

# ‏258. Property Test: More Bid Size

‏בהינתן מחירים קבועים, הגדלת Bid size צריכה להזיז microprice לכיוון Ask בנוסחה הבסיסית.

---

# ‏259. Replay Determinism

‏אותו stream חייב לייצר אותו book ואת אותם features.

---

# ‏260. Production Invariant: No Negative Size

‏Book state canonical אינו מכיל size שלילי.

---

# ‏261. Production Invariant: Sorted Levels

‏Bids descending.

‏Asks ascending.

---

# ‏262. Production Invariant: Freshness Known

‏אין Book feature בלי `as_of` ידוע.

---

# ‏263. Production Invariant: Provenance Known

‏אין Book feature בלי source/feed identity.

---

# ‏264. Production Invariant: Invalid Means No Decision Dependency

‏אם feature invalid, ה־Strategy אינה משתמשת בערך ישן כאילו הוא תקף.

---

# ‏265. Production Invariant: Formula Version Known

‏כל score שיוצר Order ניתן לשחזור עם גרסת microprice/imbalance המתאימה.

---

# ‏266. RCA Packet

‏עבור trade חשוב נשמור:

```text
book before decision
book at decision
book before submit
book at ack
book at fill
book after fill
```

---

# ‏267. `Book Movie`, לא רק Screenshot

‏ל־RCA איכותי נרצה sequence קצר סביב האירוע.

---

# ‏268. Near-Miss Analysis

‏נשמור גם candidates שלא נבחרו.

‏אולי #2 היה עם book איכותי יותר מ־#1.

---

# ‏269. Selection Regret

‏אפשר לשאול:

```text
Did book information predict that #2 was more executable than #1?
```

---

# ‏270. Future Winner Recall

‏אפשר לבדוק האם Book features עוזרים לשפר recall של candidates שבאמת המשיכו לעלות.

---

# ‏271. But Prediction Is Not Enough

‏גם אם recall משתפר, צריך לבדוק net executable outcome.

---

# ‏272. Candidate Ranking Architecture

```text
Whole Market
   ↓
Fast Features
   ↓
Top N
   ↓
Deep Book Features
   ↓
Trade Readiness
   ↓
Risk
   ↓
Execution
```

---

# ‏273. Recommended Baseline for Our Robot

‏בגרסה ראשונה של Book-aware scanner:

```text
1. Fresh L1 only
2. Spread validation
3. Top imbalance
4. Microprice offset
5. Short persistence
6. No complex spoof/iceberg inference
7. Shadow evaluation first
```

---

# ‏274. Next Layer

‏אם L1 מוכיח incremental value:

```text
L3/L5 depth
Depletion/Replenishment
Book/Flow interactions
```

---

# ‏275. Only Then Consider Richer Data

‏MBO/direct feeds הם שדרוג מחקרי, לא prerequisite אוטומטי.

---

# ‏276. Why This Order Matters

‏אחרת אפשר להוציא זמן וכסף על data sophistication לפני שהוכחנו שהמשפחה עצמה מוסיפה Edge.

---

# ‏277. שאלות שחייבים לדעת לענות עליהן

- ‏מה ההבדל בין `Book Imbalance` לבין `Order Flow`?
- ‏למה Bid גדול אינו בהכרח bullish?
- ‏מה ההבדל בין snapshot imbalance ל־dynamic imbalance?
- ‏מהו `Microprice`?
- ‏למה Microprice אינו Fair Value?
- ‏למה Microprice צריך להיבדק לפי horizon?
- ‏למה L1 עלול להטעות לגבי עומק?
- ‏מהם depletion ו־replenishment?
- ‏מהו `Book Churn`?
- ‏למה `Missing != Zero`?
- ‏איך sequence gap משפיע על Book state?
- ‏למה feature יכול להיות טוב ל־Execution אך חלש ל־Alpha?
- ‏מהו latency-to-half-life ratio?
- ‏למה צריך להפריד `Observed`, ‏`Inferred` ו־`Unknown`?

---

# ‏278. Checklist לפני שימוש ב־Book Feature

- [ ] ‏ה־Book fresh.
- [ ] ‏אין sequence gap ידוע.
- [ ] ‏Bid ו־Ask קיימים ותקינים.
- [ ] ‏הספר אינו locked/crossed ללא handling מתאים.
- [ ] ‏ידוע איזה feed/venue scope יצר את הנתונים.
- [ ] ‏ידועה גרסת נוסחת ה־feature.
- [ ] ‏אין שימוש ב־future data.
- [ ] ‏ה־feature הוכיח incremental value מחוץ ל־sample.
- [ ] ‏נבדק גם net executable outcome.
- [ ] ‏נמדד signal half-life.
- [ ] ‏נמדד latency-to-half-life ratio.
- [ ] ‏יש handling ל־missing/degraded data.
- [ ] ‏יש decision trace ו־RCA evidence.

---

# ‏279. המשפט החשוב ביותר בפרק

> ‏**ספר הפקודות אינו מספר לנו מה “השוק רוצה”. הוא נותן לנו מצב חלקי ומשתנה של liquidity מוצגת. היתרון נוצר רק אם אנו מודדים כיצד המבנה הזה משתנה, כיצד flow פוגש אותו, וכיצד המחיר מגיב — ואז מוכיחים שהמידע שורד latency ועלויות ביצוע.**

---

# ‏280. מעבר לשלב הבא

‏בשלב הבא נעבור ל־**`Adverse Selection` לעומק**.

‏שם נענה על שאלה שמחברת ישירות בין Book, Queue, Order Flow ו־Execution:

> ‏למה דווקא כאשר Limit Order שלנו מתמלא, לפעמים זו אינפורמציה רעה?

‏נלמד על:

- ‏post-fill markout.
- ‏toxic flow.
- ‏fill-conditioned outcomes.
- ‏maker edge מול adverse selection.
- ‏why getting filled can be bad news.
- ‏how to separate cheap execution from bad selection.
