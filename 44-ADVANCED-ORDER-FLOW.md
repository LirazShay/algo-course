# ‏שלב 44 — `Advanced Order Flow`: מי תוקף, מי סופג, ומה המחיר עושה בתגובה

> ‏מטרת הפרק: לעבור ממדדים פשוטים כמו מספר עסקאות ו־Volume להבנה של `Order Flow` — איזה צד יוזם את העסקאות, באיזה קצב, באיזה גודל, באיזה רצף, ומה קורה ל־price ול־liquidity בתגובה. נלמד להבדיל בין activity לבין directional pressure, בין aggression לבין continuation, ובין pressure אמיתי לבין noise.
>
> ‏העיקרון המרכזי: **Order Flow אינו רק כמה קנו וכמה מכרו. המידע נמצא ביחס בין Aggression, Liquidity ו־Price Response.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. איפה `Order Flow` יושב במערכת שלנו

‏בשלבים קודמים בנינו שכבות:

```text
Market Data
    ↓
Canonical Events
    ↓
Features
    ↓
Score / Rank
    ↓
Decision
    ↓
Execution
```

‏`Order Flow` הוא משפחת Features שנמצאת בעיקר בין `Canonical Events` לבין `Score`.

‏הוא אינו Strategy בפני עצמו.

‏הוא גם אינו Execution.

‏הוא ניסיון לתמצת את ההתנהגות המיידית של המשתתפים בשוק למידע מדיד.

---

# ‏2. למה `Trade Count` לבדו אינו מספיק

‏נניח שבשתי מניות היו 500 עסקאות בעשר שניות.

‏זה אומר ששתיהן פעילות.

‏אבל זה לא אומר שהן מתנהגות אותו דבר.

‏במניה A:

- ‏רוב העסקאות פוגעות ב־Ask.
- ‏ה־Ask מתרוקן.
- ‏המחיר עולה level אחרי level.

‏במניה B:

- ‏רוב העסקאות גם פוגעות ב־Ask.
- ‏אבל ה־Ask מתמלא שוב ושוב.
- ‏המחיר כמעט לא מתקדם.

‏אותו Trade Count.

‏Order Flow שונה לחלוטין.

---

# ‏3. `Activity` מול `Pressure`

‏`Activity` מודדת כמה קורה.

‏`Pressure` מנסה למדוד לאיזה צד מופעל כוח.

‏דוגמאות ל־Activity:

- ‏מספר Trades.
- ‏Volume.
- ‏Quote Updates.
- ‏Book Updates.
- ‏Notional Traded.

‏דוגמאות ל־Pressure:

- ‏Aggressive Buy Volume.
- ‏Aggressive Sell Volume.
- ‏Signed Trade Imbalance.
- ‏Ask depletion לעומת Bid depletion.
- ‏Upward price response אחרי buy aggression.

---

# ‏4. מי הוא `Aggressor`

‏בכל עסקה יש קונה ומוכר.

‏לכן אי אפשר לומר פשוט:

```text
100 shares were bought
```

‏כי באותה עסקה 100 מניות גם נמכרו.

‏השאלה המעניינת היא מי **יזם** את העסקה.

‏אם קונה שולח הוראה אגרסיבית ולוקח liquidity מה־Ask, נחשוב עליו כ־Buy Aggressor.

‏אם מוכר לוקח liquidity מה־Bid, נחשוב עליו כ־Sell Aggressor.

---

# ‏5. `Buyer Initiated` ו־`Seller Initiated`

‏באופן רעיוני:

```text
Trade at/near Ask → buyer initiated
Trade at/near Bid → seller initiated
```

‏אבל בפועל זה אינו תמיד חד־משמעי.

‏ה־quote שאנו רואים יכול להיות:

- ‏ישן מעט.
- ‏ממקור אחר.
- ‏מגיע אחרי ה־trade בגלל ordering.
- ‏חלקי.
- ‏לא consolidated.

‏לכן aggressor classification הוא לעיתים inference ולא ground truth.

---

# ‏6. `Trade Signing`

‏`Trade Signing` הוא תהליך שיוצר לכל Trade סימן:

```text
+1 = buyer initiated
-1 = seller initiated
 0 = unknown / ambiguous
```

‏לעיתים שומרים גם confidence.

```text
side = BUY_AGGRESSOR
confidence = 0.82
```

‏זה עדיף על forced classification כאשר הנתונים אינם חד־משמעיים.

---

# ‏7. `Quote Rule`

‏דרך פשוטה:

- ‏Trade ליד Ask → Buy.
- ‏Trade ליד Bid → Sell.
- ‏Trade באמצע → Unknown או heuristic נוסף.

‏זו שיטה שימושית אך לא מושלמת.

---

# ‏8. `Tick Rule`

‏אם אין Quote אמין, אפשר להשוות Trade למחיר ה־Trade הקודם.

```text
price > previous_trade → positive
price < previous_trade → negative
```

‏במחיר זהה ניתן לעיתים להמשיך את הסימן האחרון.

‏גם זו heuristic.

---

# ‏9. למה אין להעמיד פנים שה־sign מושלם

‏טעות classification יוצרת Feature מטעה.

‏אם 15% מה־Trades מסווגים לצד הלא נכון, `Buy/Sell Imbalance` יכול להיראות שונה מהמציאות.

‏לכן כדאי לשמור:

```text
signed_volume
unknown_volume
classification_confidence
```

---

# ‏10. `Signed Volume`

‏נגדיר למשל:

```text
signed_volume = buy_aggressive_volume - sell_aggressive_volume
```

‏ערך חיובי אומר יותר volume אגרסיבי בצד הקנייה.

‏ערך שלילי אומר יותר volume אגרסיבי בצד המכירה.

---

# ‏11. `Volume Imbalance`

‏Normalization פשוט:

```text
imbalance = (buy_volume - sell_volume) / (buy_volume + sell_volume)
```

‏הטווח בקירוב:

```text
-1 ... +1
```

‏אבל חשוב לטפל במקרה של denominator אפס או קטן מאוד.

---

# ‏12. למה Imbalance לבד אינו Edge

‏Imbalance גבוה יכול להופיע:

- ‏לפני continuation.
- ‏בסוף move שכבר מותש.
- ‏מול liquidity גדולה שסופגת הכול.
- ‏בזמן spread רחב ולא סחיר.
- ‏בסביבה עם מעט trades ולכן מדגם קטן.

‏לכן הוא Feature, לא החלטה.

---

# ‏13. `Count Imbalance`

‏אפשר למדוד גם:

```text
buy_trade_count - sell_trade_count
```

‏אבל Trade Count ו־Volume עונים על שאלות שונות.

‏100 עסקאות קטנות אינן בהכרח שקולות לעסקה אחת גדולה.

---

# ‏14. `Notional Flow`

‏במקום shares בלבד:

```text
notional = price * quantity
```

‏ואז:

```text
signed_notional = buy_notional - sell_notional
```

‏זה מועיל בהשוואה בין מניות במחירים שונים.

---

# ‏15. `Flow Rate`

‏במערכת שלנו הזמן חשוב מאוד.

‏לכן לא מספיק כמה volume היה.

‏מעניין גם כמה מהר הוא הגיע.

```text
buy_volume_per_second
sell_volume_per_second
trades_per_second
notional_per_second
```

---

# ‏16. `Flow Acceleration`

‏אפשר למדוד שינוי בקצב:

```text
recent_flow_rate - previous_flow_rate
```

‏או יחס:

```text
flow_rate_2s / flow_rate_10s
```

‏כך מזהים acceleration של activity או aggression.

---

# ‏17. `Burstiness`

‏Order Flow לא תמיד מגיע בצורה חלקה.

‏לעיתים יש burst קצר מאוד של aggressive trades.

‏Feature אפשרי:

```text
max_trades_in_250ms
max_signed_volume_in_500ms
```

‏Burst יכול להיות משמעותי יותר מהממוצע של 10 שניות.

---

# ‏18. `Persistence`

‏לחץ עקבי שונה מ־burst חד־פעמי.

‏אפשר למדוד כמה חלונות רצופים היו באותו כיוון.

```text
buy_imbalance_positive_windows = 4
```

‏Persistence עשוי להעיד על pressure מתמשך.

---

# ‏19. `Alternation`

‏אם הסימן מתחלף כל הזמן:

```text
BUY, SELL, BUY, SELL, BUY, SELL
```

‏ייתכן שהשוק פעיל מאוד אבל ללא directional dominance.

‏אפשר למדוד `sign_flip_rate`.

---

# ‏20. `Run Length`

‏רצף:

```text
BUY BUY BUY BUY BUY
```

‏שונה מ:

```text
BUY SELL BUY SELL BUY
```

‏גם אם סך ה־buy volume זהה.

---

# ‏21. `Trade Size Distribution`

‏ממוצע לבדו מסתיר מבנה.

‏כדאי לשקול:

- ‏Median trade size.
- ‏P90/P95.
- ‏Max.
- ‏Share of volume from large trades.
- ‏Share of trades from tiny prints.

---

# ‏22. Large Trades אינם בהכרח Institutional Signal

‏אסור להסיק אוטומטית ש־Trade גדול הוא “מוסדי”.

‏Trades יכולים לנבוע מ־routing, aggregation, reporting conventions ועוד.

‏אנחנו מתארים observable behavior, לא זהות של המשתתף.

---

# ‏23. `Trade Clustering`

‏Series של trades קרובים מאוד בזמן ובמחיר עשוי להיות execution של parent order אחד או פעילות משותפת.

‏אבל אין לנו בדרך כלל ודאות.

‏לכן עדיף Feature כמו:

```text
clustered_aggressive_volume
```

‏ולא טענה על “מי עומד מאחוריו”.

---

# ‏24. `Sweep`

‏במובן כללי, sweep הוא burst אגרסיבי שלוקח liquidity במספר price levels או venues בזמן קצר.

‏התוצאה יכולה להיות:

```text
Ask1 consumed
Ask2 consumed
Ask3 consumed
price jumps upward
```

‏זהו סימן pressure חזק יותר מאשר Trade יחיד קטן.

---

# ‏25. Sweep Detection

‏Feature אפשרי עשוי לשלב:

- ‏מספר levels שנחצו.
- ‏Volume כולל.
- ‏זמן כולל.
- ‏Price displacement.
- ‏מספר venues.

‏בלי Level 2/venue data, detection יהיה חלקי בלבד.

---

# ‏26. `Price Response`

‏זה אולי החלק החשוב ביותר.

‏לא שואלים רק:

```text
How much aggressive buying occurred?
```

‏אלא:

```text
How much did price move in response?
```

---

# ‏27. `Flow-to-Price Efficiency`

‏רעיון פשוט:

```text
price_change / aggressive_notional
```

‏אם מעט aggressive buying מעלה מחיר הרבה, ייתכן שה־offer side דק.

‏אם הרבה aggressive buying כמעט לא מזיז מחיר, ייתכן שיש absorption.

---

# ‏28. `Absorption`

‏Absorption מתאר מצב שבו צד אחד תוקף שוב ושוב, אך המחיר מתקשה להתקדם.

‏לדוגמה:

```text
large aggressive buy flow
+ little upward movement
```

‏ייתכן שמוכרים פסיביים סופגים את הקניות.

---

# ‏29. Absorption אינו ודאות

‏אותו pattern יכול להיווצר גם בגלל:

- ‏Hidden liquidity.
- ‏Quotes שאיננו רואים.
- ‏Venue fragmentation.
- ‏Trade-signing errors.
- ‏Short observation window.

‏לכן נשתמש במונח `absorption_candidate` ולא “יש פה מוכר מוסדי”.

---

# ‏30. `Buy Absorption`

‏תבנית אפשרית:

```text
buy_aggression ↑
ask_consumption ↑
price_progress ↓
ask_replenishment ↑
```

‏כלומר, קונים תוקפים אך העלייה נבלמת.

---

# ‏31. `Sell Absorption`

‏תבנית הפוכה:

```text
sell_aggression ↑
bid_consumption ↑
price_decline ↓
bid_replenishment ↑
```

---

# ‏32. `Replenishment`

‏אם liquidity נצרכת ואז חוזרת שוב ושוב לאותו level, ייתכן שיש replenishment.

‏זה יכול להיות:

- ‏Reserve/Iceberg.
- ‏משתתפים חדשים.
- ‏Routing behavior.

‏אין להסיק מנגנון מדויק בלי evidence מתאים.

---

# ‏33. `Exhaustion`

‏Exhaustion הוא מצב שבו pressure שהיה חזק נחלש.

‏לדוגמה:

```text
buy flow rate ↓
buy trade count ↓
price stops advancing
spread widens
```

‏זה שונה מ־Absorption.

---

# ‏34. Absorption מול Exhaustion

‏Absorption:

```text
strong aggression + weak price response
```

‏Exhaustion:

```text
aggression itself is fading
```

‏ההבחנה חשובה מאוד.

---

# ‏35. `Continuation`

‏Flow bullish משכנע יותר כאשר:

```text
buy aggression ↑
price ↑
ask levels consumed
new bids step higher
```

‏כלומר aggression מקבלת confirmation מהמחיר וה־book.

---

# ‏36. `Divergence`

‏דוגמה:

```text
buy aggression ↑
price flat/down
```

‏זו divergence בין flow לבין response.

‏Divergence היא signal candidate למחקר, לא conclusion.

---

# ‏37. `Trade Flow` מול `Quote Flow`

‏Trades מספרים מה בוצע.

‏Quotes מספרים איך liquidity מוצעת משתנה.

‏שילוב שניהם עשיר יותר מכל אחד בנפרד.

---

# ‏38. `Quote Additions`

‏אפשר למדוד הוספת size ל־Bid או Ask.

```text
bid_added_size
ask_added_size
```

‏אבל snapshot data לבד מקשה להבחין בין add, cancel ו־replace.

---

# ‏39. `Quote Cancellations`

‏ירידה ב־displayed size יכולה לנבוע מ־:

- ‏Trade.
- ‏Cancel.
- ‏Replace.
- ‏Feed aggregation behavior.

‏לכן צריך event-level data כדי לנתח בצורה טובה יותר.

---

# ‏40. `Book Depletion`

‏כאשר ask size הולך ונעלם ומחיר עולה, זה שונה ממצב שבו ask מתרוקן ומיד מתמלא מחדש.

‏Feature צריך למדוד גם depletion וגם replenishment.

---

# ‏41. `Bid Support`

‏Bid גדול לבדו אינו “תמיכה”.

‏הוא משמעותי יותר אם:

- ‏Sell aggression מגיע אליו.
- ‏ה־Bid שורד.
- ‏המחיר לא יורד.
- ‏size מתחדש.

---

# ‏42. `Ask Resistance`

‏אותו רעיון בצד השני.

‏Ask גדול שלא נבדק אינו אומר הרבה.

‏Ask שסופג repeated aggressive buying הוא evidence אחר.

---

# ‏43. Displayed Size יכול להטעות

‏Size גדול יכול להיעלם לפני execution.

‏Size קטן יכול להסתיר reserve liquidity.

‏לכן `book size` הוא state observable, לא promise.

---

# ‏44. `Order Book Imbalance`

‏אפשר למדוד:

```text
(bid_size - ask_size) / (bid_size + ask_size)
```

‏אבל זה Feature של displayed liquidity, לא של executed flow.

---

# ‏45. `Flow Imbalance` מול `Book Imbalance`

‏`Flow Imbalance`:

‏מי לוקח liquidity בפועל.

‏`Book Imbalance`:

‏כמה liquidity גלויה מחכה בכל צד.

‏השילוב ביניהם לעיתים חזק יותר.

---

# ‏46. ארבעה מצבים בסיסיים

```text
1. Buy flow + bid-heavy book
2. Buy flow + ask-heavy book
3. Sell flow + bid-heavy book
4. Sell flow + ask-heavy book
```

‏כל אחד עשוי להתנהג אחרת.

---

# ‏47. `Flow × Book Interaction`

‏דוגמה:

‏Buy flow חזק מול ask דק עשוי להזיז מחיר מהר.

‏Buy flow חזק מול ask עבה ומתחדש עשוי להיתקע.

‏זו interaction feature טבעית.

---

# ‏48. `Microprice` יגיע בשלב הבא

‏בשלב 45 נעמיק ב־`Book Imbalance` ו־`Microprice`.

‏כאן חשוב רק להבין ש־Order Flow ו־Book State הם שני מקורות מידע משלימים.

---

# ‏49. `Aggression Ratio`

‏אפשר להגדיר:

```text
aggression_ratio = buy_aggressive_volume / total_signed_volume
```

‏או גרסה symmetric בטווח `-1..1`.

---

# ‏50. `Unknown Share`

‏אם הרבה trades לא ניתנים לסיווג, confidence של Feature צריך לרדת.

```text
unknown_share = unknown_volume / total_volume
```

---

# ‏51. Confidence-aware Features

‏במקום:

```text
imbalance = 0.80
```

‏אפשר לשמור:

```text
imbalance = 0.80
confidence = 0.55
```

‏כך Score יכול להתייחס אחרת ל־signal עם evidence חלש.

---

# ‏52. `Windowing`

‏במערכת שלנו נרצה מספר חלונות:

```text
250ms
500ms
1s
2s
5s
10s
30s
```

‏לא כל provider/data resolution יתמוך בכולם.

---

# ‏53. Multi-Horizon Flow

‏אותו symbol יכול להיות:

```text
250ms: strongly positive
2s: positive
10s: neutral
30s: negative
```

‏זו תמונה עשירה יותר מאשר ערך יחיד.

---

# ‏54. `Flow Shape`

‏אפשר לחשוב על flow כ־curve בזמן.

‏מעניינים אותנו:

- ‏Direction.
- ‏Slope.
- ‏Acceleration.
- ‏Persistence.
- ‏Reversal.
- ‏Burstiness.

---

# ‏55. `Flow Reversal`

‏לדוגמה:

```text
10s sell pressure
→ 2s neutral
→ 500ms strong buy pressure
```

‏זה עשוי לסמן transition.

‏אבל חייבים לבדוק empirically.

---

# ‏56. `Flow Confirmation`

‏ל־momentum signal אפשר לדרוש:

```text
price momentum positive
AND aggressive flow positive
```

‏אבל זה Filter/Feature candidate בלבד.

‏צריך לבדוק אם הוא באמת מוסיף predictive value.

---

# ‏57. `Flow Disagreement`

‏אם price עולה אבל sell aggression דומיננטי, יש disagreement.

‏ייתכן שזה noise.

‏ייתכן שיש passive buyer חזק.

‏ייתכן שה־trade signing שגוי.

‏ה־RCA צריך לדעת להבחין.

---

# ‏58. `Response Lag`

‏לא כל price response מיידית.

‏אפשר למדוד:

```text
flow at t
→ price response at t + 100ms
→ t + 500ms
→ t + 1s
```

‏כך מגלים באיזה horizon ה־flow informative.

---

# ‏59. `Forward Return Conditional on Flow`

‏במחקר:

```text
E[forward_return_1s | imbalance_bucket]
E[forward_return_5s | imbalance_bucket]
```

‏כך בודקים האם imbalance באמת predictive.

---

# ‏60. Conditional on Executability

‏עדיף אפילו:

```text
E[net_executable_return | flow_state]
```

‏כי Raw Return בלי spread/slippage אינו מספיק לרובוט שלנו.

---

# ‏61. `Flow Buckets`

‏במקום threshold אחד שרירותי:

```text
[-1,-0.8)
[-0.8,-0.4)
...
[0.8,1.0]
```

‏ונבדוק monotonicity.

---

# ‏62. `Flow Percentile`

‏Cross-sectionally אפשר למדוד איפה symbol נמצא ביחס לכל השוק.

```text
flow_percentile = 99.4
```

‏זה שימושי ל־whole-market ranking.

---

# ‏63. Cross-Sectional Flow

‏ברובוט שלנו לא מספיק לדעת ש־XYZ חיובי.

‏נרצה לדעת:

```text
Is XYZ among the strongest flow states in the entire current universe?
```

---

# ‏64. `Relative Flow Strength`

‏Feature אפשרי:

```text
symbol_flow_zscore_vs_market
```

‏או percentile.

‏Normalization חשוב בגלל שונות עצומה בין symbols.

---

# ‏65. Normalize by Own Baseline

‏אפשר להשוות symbol לעצמו:

```text
current_trades_per_sec / median_trades_per_sec_same_time_of_day
```

‏כך לא מענישים מניה שבאופן טבעי נסחרת פחות.

---

# ‏66. Time-of-Day Baseline

‏Open שונה מ־Midday.

‏לכן baseline של activity/flow צריך לעיתים להיות time-of-day aware.

---

# ‏67. Regime-aware Flow

‏Flow של symbol בזמן broad market surge שונה מ־flow idiosyncratic.

‏אפשר להשוות:

```text
symbol_flow - market_flow_context
```

---

# ‏68. Sector Context

‏אם כל sector מקבל buy aggression, candidate אחד אינו בהכרח ייחודי.

‏Relative-to-sector flow יכול לעזור.

---

# ‏69. `Flow Concentration`

‏האם volume מפוזר או מרוכז בכמה bursts/trades?

‏אפשר למדוד entropy או share of top-N trades.

---

# ‏70. `Participation Shock`

‏נרצה לזהות כאשר activity הנוכחית חריגה משמעותית מה־baseline של אותה מניה.

```text
current_notional_rate / expected_notional_rate
```

---

# ‏71. `Flow Surprise`

‏Conceptually:

```text
observed_flow - expected_flow
```

‏ה־expected יכול להיות לפי:

- ‏Time of day.
- ‏Recent history.
- ‏Volatility regime.
- ‏Symbol baseline.

---

# ‏72. Absolute Flow מול Surprise

‏מניה גדולה יכולה לקבל enormous flow וזה רגיל עבורה.

‏מניה קטנה עם flow קטן יותר אבסולוטית יכולה להיות ב־extreme anomaly.

‏לכן שניהם מעניינים.

---

# ‏73. `Trade Intensity`

‏Trade intensity הוא arrival rate של trades.

‏אפשר למדוד events per second.

‏Acceleration ב־intensity עשויה להיות meaningful.

---

# ‏74. `Inter-Trade Time`

‏במקום count בחלון, נמדוד זמן בין trades.

```text
median_inter_trade_ms
p10_inter_trade_ms
```

‏ירידה חדה בזמן בין trades מצביעה על acceleration בפעילות.

---

# ‏75. `Signed Inter-Trade Time`

‏אפשר למדוד בנפרד מרווח בין buy aggressors לבין sell aggressors.

‏כך מקבלים insight על dominance בזמן.

---

# ‏76. `Arrival Clustering`

‏אם aggressive buys מגיעים בקבוצות צפופות, ייתכן שה־pressure יותר concentrated.

‏שוב: זה observable pattern, לא זיהוי actor.

---

# ‏77. `Volume Clock`

‏במקום זמן קיר אפשר לנתח events לפי accumulated volume.

‏זה שימושי להשוואת market regimes עם activity שונה.

---

# ‏78. `Trade Clock`

‏אפשר גם להשתמש במספר trades כ־clock.

‏לדוגמה:

```text
last 50 trades
```

‏במניה פעילה זה יכול להיות 200ms.

‏במניה איטית זה יכול להיות דקות.

---

# ‏79. Event Time מול Wall Time

‏שני views יכולים להיות שימושיים.

‏לרובוט קצר טווח כדאי לשמור גם windows לפי זמן וגם לפי event count.

---

# ‏80. `Flow Toxicity`

‏המונח מתאר באופן כללי מצב שבו liquidity provider מקבל fills ולאחריהם המחיר נע נגדו.

‏לנו זה רלוונטי דרך Markout.

---

# ‏81. Post-Trade Markout

‏אחרי buy aggressor:

```text
mid(t+500ms) - trade_price
```

‏אחרי sell aggressor:

```text
trade_price - mid(t+500ms)
```

‏אפשר לבנות distribution של continuation אחרי aggression.

---

# ‏82. `Adverse Selection` מהצד הפסיבי

‏אם אנחנו passive buyer וקיבלנו Fill בדיוק לפני ירידה, זה adverse selection עבורנו.

‏Order Flow עשוי לעזור לזהות מתי passive fill מסוכן.

---

# ‏83. `Flow Toxicity` אינו Label קסם

‏לא צריך לנסות לבנות Feature אקזוטי לפני שיש data איכותי.

‏בשלב ראשון מספיק:

```text
aggression
price response
markout
fill outcome
```

---

# ‏84. `Signed Trade Count`

‏Feature פשוט:

```text
buy_count - sell_count
```

‏יכול להיות useful לצד signed volume.

---

# ‏85. Trade Count מול Volume Divergence

‏למשל:

```text
many small buys
few large sells
```

‏Count אומר Buy dominance.

‏Volume אומר Sell dominance.

‏זו אינפורמציה מעניינת.

---

# ‏86. `Average Aggressor Size`

‏נמדוד:

```text
avg_buy_aggressor_size
avg_sell_aggressor_size
```

‏אבל חשוב גם median וה־tails.

---

# ‏87. `Large-Trade Share`

```text
large_buy_volume / total_buy_volume
```

‏threshold ל־large צריך להיות normalized, לא מספר מניות קשיח לכל השוק.

---

# ‏88. Normalization לפי Dollar Notional

‏1000 shares במניה של `$3` שונים מ־1000 shares במניה של `$300`.

‏לכן notional לעיתים יותר מתאים.

---

# ‏89. Normalize by ADV

‏אפשר להשוות flow ל־Average Daily Volume או intraday expected volume.

‏אבל עבור horizon של שניות, baseline מקומי עשוי להיות רלוונטי יותר.

---

# ‏90. `Flow-to-ADV` אינו מספיק

‏Daily baseline יכול להיות גס מדי לאירוע של 2 שניות.

‏לכן נרצה גם short-term baseline.

---

# ‏91. `Impact per Unit Flow`

‏נמדוד כמה price moved לכל יחידת aggressive notional.

‏זה proxy ל־liquidity sensitivity.

---

# ‏92. High Impact

‏מעט flow, הרבה movement.

‏יכול להעיד על book דק או liquidity withdrawal.

---

# ‏93. Low Impact

‏הרבה flow, מעט movement.

‏יכול להתאים ל־absorption.

---

# ‏94. Impact אינו ליניארי

‏פי שניים volume לא בהכרח יוצר פי שניים price move.

‏לכן לא נניח relationship ליניארי בלי בדיקה.

---

# ‏95. `Response Curve`

‏אפשר לחקור:

```text
flow_bucket → median_forward_move
```

‏ולראות אם הקשר saturates או משתנה regime.

---

# ‏96. `Impact Decay`

‏השפעה של burst יכולה להיעלם מהר.

‏נמדוד:

```text
response_250ms
response_1s
response_5s
response_30s
```

---

# ‏97. `Flow Half-Life`

‏אפשר להגדיר בקירוב כמה זמן predictive value של Flow state נשאר שימושי.

‏זה ישפיע על Signal TTL.

---

# ‏98. Order Flow ו־Latency

‏Feature בן 300ms יכול להיות משמעותי.

‏Feature בן 3 שניות באותה Strategy אולי כבר היסטורי.

‏לכן timestamp discipline קריטי.

---

# ‏99. `Event Time`

‏מועד האירוע בשוק.

# ‏100. `Receive Time`

‏מתי האירוע הגיע אלינו.

# ‏101. `Feature Ready Time`

‏מתי feature חושב.

# ‏102. `Decision Time`

‏מתי ה־Strategy השתמשה בו.

‏צריך להבדיל בין כולם.

---

# ‏103. Flow Feature חייב להיות Point-in-Time Correct

‏אסור לחשב feature בעזרת Trade שקרה אחרי `DecisionTime`.

‏גם סטייה של מילישניות יכולה ליצור leakage במערכות קצרות.

---

# ‏104. Provider Ordering

‏Provider יכול לשלוח Trades ו־Quotes בסדר שאינו זהה לסדר exchange.

‏צריך להבין מה משמעות ה־timestamps וה־sequence numbers שלו.

---

# ‏105. Late Events

‏Event שמגיע מאוחר יכול לשנות reconstruction של חלון שכבר נסגר.

‏צריך policy מפורש:

- ‏Ignore for live decision.
- ‏Record for audit.
- ‏Possibly correct historical reconstruction.

---

# ‏106. Duplicate Events

‏Duplicates יכולים לנפח volume ו־trade count.

‏Deduplication הוא חלק מ־Data Quality, לא cosmetic cleanup.

---

# ‏107. Missing Events

‏Gap ב־sequence יכול להפוך imbalance לבלתי אמין.

‏Feature צריך לשאת quality flag.

---

# ‏108. `FlowQuality`

‏אפשר לייצג:

```text
GOOD
DEGRADED
STALE
GAPPED
UNKNOWN
```

---

# ‏109. `FlowConfidence`

‏Confidence יכול להתחשב ב־:

- ‏Unknown trade share.
- ‏Sequence gaps.
- ‏Quote age.
- ‏Coverage quality.
- ‏Provider health.

---

# ‏110. Feature בלי Quality הוא מסוכן

‏מספר יפה ללא metadata יכול להטעות את ה־Score.

‏לכן כל flow feature משמעותי צריך context.

---

# ‏111. `Event Aggregation`

‏יש שתי גישות עיקריות:

- ‏Store raw events ואז aggregate.
- ‏Aggregate בזמן אמת ולשמור summaries.

‏למחקר רציני, raw או replayable canonical events נותנים יותר גמישות.

---

# ‏112. Memory/Throughput Trade-off

‏Whole-market tick data יכול להיות כבד מאוד.

‏לכן architecture יכולה להשתמש ב־:

```text
raw hot buffer
+ rolling aggregates
+ selective durable capture
```

---

# ‏113. `Fast Path`

‏ב־Fast Path נחשב features זולים:

```text
trade_count
signed_volume
flow_rate
imbalance
price_response
```

---

# ‏114. `Deep Path`

‏ל־Top candidates בלבד אפשר להוסיף:

```text
book depletion
replenishment
multi-level sweep
venue flow
advanced markout context
```

---

# ‏115. זה מתאים לרובוט שלנו

‏אין צורך לחשב analytics כבדים ל־4,000 מניות בכל tick.

‏אפשר:

```text
Broad Flow Scan → Top N → Deep Flow Analysis
```

---

# ‏116. `Flow Candidate Funnel`

‏דוגמה:

```text
4,000 symbols
→ 300 active
→ 50 unusual flow
→ 10 strong directional flow
→ 3 executable
→ 1 candidate
```

---

# ‏117. Flow אינו מחליף Liquidity Filter

‏מניה יכולה להראות flow קיצוני ועדיין להיות לא executable בגלל:

- ‏Spread.
- ‏Depth.
- ‏Volatility.
- ‏Halt proximity.
- ‏Stale data.

---

# ‏118. Flow אינו מחליף Price Momentum

‏הוא יכול לאשר, לסתור או להוסיף context.

‏צריך לבדוק incremental value.

---

# ‏119. Flow אינו מחליף Risk Engine

‏גם signal flow מעולה אינו נותן הרשאה לעבור limits.

---

# ‏120. Flow אינו מחליף Execution Model

‏Predictive flow יכול להיעלם לפני Fill.

‏לכן נבדוק `signal → order → fill` delay.

---

# ‏121. `Signal Survival`

‏נרצה לדעת:

```text
Did the flow state still exist at order submission?
Did it still exist at fill?
```

---

# ‏122. `Flow Decay at Fill`

‏Feature חשוב למחקר:

```text
flow_at_fill - flow_at_decision
```

‏או ratio.

---

# ‏123. Flow Flip Before Fill

‏אם Buy Flow הופך ל־Sell Flow לפני Fill, ייתכן שה־order צריך להתבטל.

‏זה candidate ל־Execution Policy experiment.

---

# ‏124. `Stale Flow Guard`

‏Order חדש לא צריך להתבסס על Flow state שעבר את TTL שלו.

---

# ‏125. `Flow Gate`

‏אפשר לנסות Gate:

```text
trade only if flow_confidence >= threshold
```

‏אבל יש לבדוק אם הוא מוסיף net EV ולא רק משפר hit rate.

---

# ‏126. `Flow Score`

‏אפשר לבנות sub-score:

```text
FlowScore = f(
  signed_volume,
  flow_rate,
  persistence,
  price_response,
  confidence
)
```

‏לא חייבים להתחיל עם נוסחה מורכבת.

---

# ‏127. Prefer Simple Features First

‏למשל:

```text
imbalance_2s
trades_per_sec_2s
price_response_2s
```

‏לפני עשרות transformations.

---

# ‏128. Ablation

‏נבדוק:

```text
Score baseline
Score + imbalance
Score + flow rate
Score + absorption feature
```

‏כל תוספת צריכה להצדיק את עצמה.

---

# ‏129. Redundancy

‏`buy_volume`, ‏`imbalance`, ‏`buy_ratio` יכולים להיות כמעט אותו מידע.

‏לא צריך לספור אותו שלוש פעמים במשקל.

---

# ‏130. Feature Correlation

‏נמדוד correlation ו־incremental predictive value.

‏Feature חדש לא טוב רק כי “נשמע מקצועי”.

---

# ‏131. `Order Flow Regime`

‏אפשר להגדיר states כמו:

```text
QUIET
BALANCED_ACTIVE
BUY_PRESSURE
SELL_PRESSURE
BUY_ABSORPTION
SELL_ABSORPTION
FLOW_REVERSAL
UNKNOWN
```

‏אבל עדיף קודם לשמור continuous features.

---

# ‏132. Continuous Before Buckets

‏Buckets נוחים להסבר.

‏Continuous values שומרים יותר מידע.

‏אפשר לגזור buckets לצורכי UI ו־RCA.

---

# ‏133. `Flow State Persistence`

‏מצב שנמשך 50ms אינו זהה למצב שנמשך 5 שניות.

‏Duration הוא feature חשוב.

---

# ‏134. State Churn

‏אם Flow State מתחלף כל 100ms, ייתכן שה־signal unstable.

‏נמדוד churn.

---

# ‏135. `Flow Stability Score`

‏אפשר לשלב:

- ‏Sign persistence.
- ‏Magnitude stability.
- ‏Low flip rate.
- ‏Consistent price response.

---

# ‏136. `Absorption Score`

‏Feature candidate:

```text
high_aggression
+ low_price_progress
+ repeated_replenishment
```

‏אבל נבדוק כל רכיב בנפרד קודם.

---

# ‏137. `Exhaustion Score`

‏Feature candidate:

```text
flow_rate_decline
+ trade_intensity_decline
+ failure_to_make_new_high
```

---

# ‏138. `Sweep Score`

‏Feature candidate:

```text
levels_crossed
* notional_rate
* price_displacement
```

‏זה רק מבנה מחקרי, לא נוסחה מוסכמת.

---

# ‏139. `Flow Pressure vs Spread`

‏Pressure חזק בתוך spread רחב יכול להיות expensive to trade.

‏לכן Execution Cost צריך להישאר חלק מה־decision.

---

# ‏140. `Flow Pressure vs Depth`

‏Pressure חזק עם depth קטן יכול להוביל לתנועה מהירה אך גם slippage גבוה.

---

# ‏141. `Flow Pressure vs Volatility`

‏ב־volatility גבוהה, אותו imbalance יכול להיות פחות informative.

‏צריך לבדוק regime conditioning.

---

# ‏142. `Flow Pressure vs Market Breadth`

‏אם רוב השוק עולה, buy aggression במניה בודדת פחות ייחודית.

---

# ‏143. `Flow Pressure vs Rank Separation`

‏Top1 עם FlowScore גבוה משמעותית מ־Top2 שונה ממצב שבו כל Top10 דומים.

---

# ‏144. `Winner's Curse`

‏המניה עם ה־flow הכי קיצוני בכל השוק עלולה להיות extreme noise.

‏לכן צריך OOS validation ולא התלהבות מה־Top1.

---

# ‏145. `Flow Extremeness`

‏נמדוד percentile, z-score ו־distance from #2.

‏אבל extreme אינו בהכרח predictive.

---

# ‏146. `Flow Surprise × Price Response`

‏Interaction אפשרית:

```text
unexpected buy flow
AND efficient upward response
```

‏עשויה להיות מעניינת יותר מכל רכיב לבד.

---

# ‏147. `Flow Surprise × Absorption`

‏Flow קיצוני בלי price progress יכול להיות signal שונה לחלוטין.

---

# ‏148. `Flow Entropy`

‏אפשר למדוד עד כמה flow מפוזר על פני צדדים, venues או trade sizes.

‏זה advanced feature, לא baseline.

---

# ‏149. Venue-level Flow

‏אם יש לנו data מתאימה:

```text
buy_flow_by_venue
sell_flow_by_venue
```

‏זה עשוי לגלות fragmentation.

---

# ‏150. אבל Venue Flow מורכב

‏צריך להבין:

- ‏Reporting venue.
- ‏Execution venue.
- ‏TRF/off-exchange reports.
- ‏Delayed reporting semantics.

‏לכן לא כדאי להוסיף אותו מוקדם מדי.

---

# ‏151. `Off-Exchange` Activity

‏Print שאינו מגיע מ־lit venue לא בהכרח משפיע על book באותה דרך.

‏צריך לשמור venue/source metadata.

---

# ‏152. Odd Lots

‏Odd lots יכולים להיות חלק משמעותי מה־flow במניות מסוימות.

‏אסור להניח שכל Trade קטן הוא noise.

---

# ‏153. Trade Conditions

‏Trades יכולים להגיע עם conditions שמשפיעים על השאלה האם הם רלוונטיים ל־real-time price formation.

‏Provider adapter צריך לשמר אותם כשאפשר.

---

# ‏154. Filtering Trade Conditions

‏אין “רשימת תנאים אוניברסלית” שנכון למחוק תמיד.

‏צריך להבין semantics של feed/provider.

---

# ‏155. `CanonicalTrade`

‏אפשר לייצג:

```text
CanonicalTrade
- InstrumentId
- Price
- Size
- EventTime
- ReceivedTime
- Venue
- Conditions
- AggressorSide
- AggressorConfidence
- Source
```

---

# ‏156. `CanonicalQuote`

```text
CanonicalQuote
- InstrumentId
- BidPrice
- BidSize
- AskPrice
- AskSize
- EventTime
- ReceivedTime
- Source
- Quality
```

---

# ‏157. Flow Engine Interface

```csharp
public interface IOrderFlowEngine
{
    OrderFlowSnapshot Update(MarketEvent marketEvent);
    OrderFlowSnapshot GetSnapshot(InstrumentId instrumentId, DateTimeOffset asOf);
}
```

---

# ‏158. Immutable Snapshot

‏ה־Strategy צריכה לקבל snapshot immutable של Flow state עבור `as_of_time` מסוים.

‏כך נמנע race conditions ו־look-ahead.

---

# ‏159. Feature Provenance

‏כל Flow Snapshot צריך לכלול:

```text
provider
window
as_of
last_event_time
quality
version
```

---

# ‏160. `FlowFeatureSetVersion`

‏כאשר משנים classification או normalization, זו גרסת Feature חדשה.

‏לא משווים Backtests כאילו feature נשאר זהה.

---

# ‏161. Backtest חייב להשתמש באותה Semantics

‏אם Live משתמש ב־Quote Rule עם received-time ordering, Backtest לא יכול להשתמש בעתיד ב־perfect exchange ordering בלי לציין fidelity difference.

---

# ‏162. Replay הוא כלי מרכזי

‏Order Flow מתאים מאוד ל־Replay כי אפשר לראות:

```text
trade
quote update
feature change
rank change
decision
```

‏באותו timeline.

---

# ‏163. `First Divergence`

‏כש־Live ו־Replay שונים, נחפש את האירוע הראשון שבו Flow Snapshot השתנה.

---

# ‏164. Golden Flow Scenarios

‏כדאי לשמור תרחישים כמו:

- ‏Strong continuation.
- ‏Buy absorption.
- ‏Sell absorption.
- ‏Exhaustion.
- ‏Flow reversal.
- ‏Sequence gap.
- ‏Duplicate burst.
- ‏Late trade.

---

# ‏165. Property Tests

‏דוגמאות:

```text
buy_volume >= 0
sell_volume >= 0
abs(imbalance) <= 1
classified + unknown <= total
no event after as_of enters snapshot
```

---

# ‏166. Differential Tests

‏אפשר להריץ אותו event stream דרך שתי גרסאות Flow Engine ולהשוות output.

---

# ‏167. `Flow Drift`

‏גם אם Feature היה predictive בעבר, market structure יכולה להשתנות.

‏ננטר distribution ו־performance לאורך זמן.

---

# ‏168. Data Provider Drift

‏שינוי provider או feed tier יכול לשנות:

- ‏Trade counts.
- ‏Quote timing.
- ‏Conditions.
- ‏Venue coverage.

‏ולכן Flow features עלולים להשתנות בלי שינוי ב־Strategy.

---

# ‏169. `Provider Fingerprint`

‏כדאי לשמור בכל run:

```text
provider
feed
schema_version
normalization_version
```

---

# ‏170. Flow Monitoring

‏Dashboard בסיסי יכול להציג:

- ‏Trades/sec.
- ‏Signed volume/sec.
- ‏Unknown share.
- ‏Top flow percentiles.
- ‏Flow state churn.
- ‏Data gaps.

---

# ‏171. Candidate Diagnostics

‏לכל Top Candidate נרצה לראות:

```text
price path
buy/sell flow
trade intensity
book response
spread
depth
rank
```

---

# ‏172. RCA: Prediction Failure

‏אם Rank #1 נכשל, נשאל:

- ‏האם flow היה אמיתי?
- ‏האם classification היה אמין?
- ‏האם הייתה absorption?
- ‏האם signal כבר היה exhausted?
- ‏האם price response התהפך?

---

# ‏173. RCA: Execution Failure

‏ייתכן שה־Flow prediction היה נכון אבל לא הצלחנו להיכנס בזמן.

‏אז הבעיה היא execution, לא feature.

---

# ‏174. RCA: Data Failure

‏אם sequence gap יצר imbalance מזויף, זו בעיית data.

‏לא “אסטרטגיה לא טובה”.

---

# ‏175. Success RCA

‏גם עסקה מוצלחת צריך לפרק:

- ‏מה היה flow state?
- ‏מה הייתה price response?
- ‏כמה signal נשאר עד fill?
- ‏האם result היה repeatable?

---

# ‏176. Avoid Storytelling

‏Order Flow מזמין סיפורים כמו:

> ‏“הקונים שולטים.”

‏במחקר אנחנו נעדיף:

```text
buy imbalance = 0.71
price response = +18 bps
persistence = 1.8s
confidence = 0.93
```

---

# ‏177. Avoid Anthropomorphism

‏לא צריך לתאר כל print כ“מלחמה בין שוורים לדובים”.

‏אנחנו מודדים event stream ומנסים לבדוק predictive relationship.

---

# ‏178. `Order Flow` אינו קסם של Tape Reading

‏אפשר להשתמש בו בצורה מדעית:

```text
hypothesis
→ feature
→ label
→ out-of-sample test
→ execution-aware validation
```

---

# ‏179. השערה טובה

‏דוגמה:

> ‏כאשר aggressive buy flow נמצא ב־Top 1% cross-sectionally, price response חיובי ו־ask depletion גבוה, Forward Net Return של 2–5 שניות יהיה גבוה מה־baseline.

‏זו השערה שניתן להפריך.

---

# ‏180. השערה חלשה

> ‏“נראה שיש הרבה קונים אז כנראה זה יעלה.”

‏אין כאן הגדרה מדידה.

---

# ‏181. Label מתאים

‏לרובוט שלנו נבדוק בין היתר:

```text
forward_return_1s
forward_return_2s
forward_return_5s
forward_return_10s
net_forward_return
MFE
MAE
time_to_first_profit
time_to_target
```

---

# ‏182. Flow Horizon חייב להתאים ל־Label Horizon

‏Feature של 30 שניות לא בהכרח מתאים לניבוי 500ms.

‏נחקור combinations מפורשים.

---

# ‏183. Overlapping Labels

‏Event-frequency data יוצר labels חופפים מאוד.

‏צריך להיזהר מ־sample-size illusion.

---

# ‏184. Candidate Episodes

‏אפשר לקבץ רצפים של Flow state לאותו episode במקום לספור כל tick כדוגמה עצמאית.

---

# ‏185. `Flow Episode`

‏דוגמה:

```text
start
peak
end
max_imbalance
max_rate
price_response
outcome
```

---

# ‏186. Episode-level Evaluation

‏זה יכול להיות יותר אינטואיטיבי עבור Scanner שקובע Top candidate לאורך זמן.

---

# ‏187. Cross-Sectional Leakage

‏בעת rank של כל השוק, כל feature חייב להיות מחושב באותו `as_of_time` לוגי.

‏אסור שלמניה אחת יהיו events עתידיים יחסית לאחרות.

---

# ‏188. Coverage Gate

‏אם רק חלק קטן מה־Universe מעודכן, Top Flow Rank אינו אמין.

‏נשתמש ב־Fresh Coverage threshold.

---

# ‏189. Rank Snapshot Consistency

‏כל candidate ranking צריך לציין:

```text
rank_as_of
universe_size
fresh_symbol_count
coverage_ratio
```

---

# ‏190. `Flow Rank Churn`

‏נמדוד כמה מהר Top candidates מתחלפים.

‏Churn גבוה מדי יכול להפוך execution ללא מעשי.

---

# ‏191. Candidate Persistence

‏Candidate שנשאר Top5 במשך 2 שניות שונה ממי שקפץ ל־#1 ל־50ms.

---

# ‏192. `Flow Rank Velocity`

‏אפשר למדוד:

```text
rank_change_per_second
```

‏כדי לזהות symbol שמטפס במהירות.

---

# ‏193. Rank Velocity אינו בהכרח Alpha

‏צריך לבדוק אם הוא מנבא forward outcome או רק noise.

---

# ‏194. `Flow Separation`

‏נבדוק distance בין #1 ל־#2:

```text
flow_score_gap
```

‏Top1 בקושי מעל כולם שונה מ־outlier ברור.

---

# ‏195. `Flow Breadth`

‏כמה symbols מציגים buy pressure בו־זמנית?

‏זה יכול להיות market context.

---

# ‏196. `Flow Dispersion`

‏כמה dispersion יש בין symbols.

‏High dispersion עשוי להקל על cross-sectional selection.

---

# ‏197. `Flow Density`

‏אם מאות מניות מציגות flow חזק, ה־Top1 פחות ייחודי.

---

# ‏198. `Market Flow Index`

‏אפשר ליצור aggregate של signed flow across universe.

‏לא כמדד אמת אוניברסלי, אלא Feature מחקרי.

---

# ‏199. Symbol-relative-to-Market Flow

```text
relative_flow = symbol_flow - market_flow
```

‏או percentile difference.

---

# ‏200. `Flow Beta`

‏במחקר advanced ניתן לבדוק עד כמה flow של symbol נוטה לנוע עם broad-market flow.

---

# ‏201. Idiosyncratic Flow

‏Flow חריג ביחס לשוק ול־sector עשוי להיות יותר מעניין מסתם broad move.

---

# ‏202. News Risk

‏Flow קיצוני יכול לנבוע מאירוע חדשותי.

‏זה לא בהכרח רע, אבל execution/risk regime יכול להשתנות מאוד.

---

# ‏203. Halt Proximity

‏Extreme flow + extreme movement יכול לקרב symbol ל־LULD.

‏Safety layer צריך להישאר פעיל.

---

# ‏204. `Flow` בזמן Fast Market

‏ב־Fast Market classification ו־book state מזדקנים מהר יותר.

‏Confidence thresholds צריכים אולי להיות מחמירים יותר.

---

# ‏205. Stale Quotes מעוותים Aggressor Inference

‏אם quote בן 500ms בשוק מהיר, trade signing לפי אותו quote עלול להיות שגוי.

---

# ‏206. Quote Age Feature

‏נשמור:

```text
quote_age_at_trade_ms
```

‏ונוכל לנתח accuracy כפונקציה של freshness.

---

# ‏207. Broker Feed מול Data Feed

‏אם Order Flow מגיע מספק A וה־execution דרך Broker B, צריך לזכור ש־market views יכולים להיות שונים.

---

# ‏208. Cross-Feed Validation

‏ל־Top candidate אפשר להשוות quote מרכזי מול broker quote לפני Entry.

‏לא כדי להחליף Feed, אלא כדי לזהות divergence מסוכן.

---

# ‏209. `Flow Snapshot` ל־Decision Record

‏כל Trade Decision צריך לשמור subset של features ששימשו בפועל.

‏כך ניתן להסביר בדיעבד למה candidate נבחר.

---

# ‏210. `Why This Symbol?`

‏תשובה טובה יכולה להיות:

```text
Rank #1
buy flow percentile 99.7
flow persistence 2.4s
positive price response
spread acceptable
fresh data
```

---

# ‏211. `Why Not #2?`

‏גם זה חשוב.

‏למשל:

```text
similar momentum
but weaker flow persistence
higher unknown-share
wider spread
```

---

# ‏212. `Why NO TRADE?`

‏דוגמאות:

- ‏Flow confidence נמוך.
- ‏Coverage חלקית.
- ‏Absorption risk גבוה.
- ‏Spread גדול מדי.
- ‏Signal decay מהיר מדי.
- ‏No candidate separation.

---

# ‏213. Flow Feature Registry

‏כדאי לשמור metadata לכל Feature:

```text
name
version
window
input_events
normalization
quality_rules
owner
status
```

---

# ‏214. Feature Retirement

‏אם Feature לא מוסיף value לאורך זמן, מסירים אותו.

‏לא משאירים כי “השקענו בו”.

---

# ‏215. Shadow Features

‏Feature חדש יכול לרוץ Live בלי להשפיע על החלטות.

‏כך נאסוף evidence אמיתי לפני promotion.

---

# ‏216. Champion/Challenger Flow

‏אפשר להשוות:

```text
Champion: simple imbalance
Challenger: imbalance + absorption + response
```

‏באותו market stream.

---

# ‏217. Promotion Gate

‏Feature חדש צריך להראות:

- ‏Predictive improvement.
- ‏Net economic improvement.
- ‏Operational stability.
- ‏No unacceptable latency increase.

---

# ‏218. Latency Tax

‏Flow model מורכב יותר יכול להיות predictive יותר אך מאוחר יותר.

‏אם signal horizon קצר, latency tax עלול למחוק את היתרון.

---

# ‏219. Complexity Tax

‏יותר Features = יותר failure modes, drift ו־debugging cost.

‏לכן נשמור KISS עד שה־evidence מצדיק מורכבות.

---

# ‏220. `Flow Engine` לא צריך לנחש Hidden Intent

‏הוא צריך למדוד observable events ולגזור features ברורים.

---

# ‏221. Practitioner Rule: Reaction Matters More Than Narrative

‏אם buy aggression גבוה אך price לא מתקדם, התגובה חשובה יותר מהסיפור “יש הרבה קונים”.

---

# ‏222. Practitioner Rule: One Print Is Weak Evidence

‏Signal טוב בדרך כלל נשען על pattern, context ו־persistence, לא Trade בודד.

---

# ‏223. Practitioner Rule: Flow Without Freshness Is Noise

‏Feature חזק שמבוסס על data stale אינו strong signal.

---

# ‏224. Practitioner Rule: Extreme Flow Can Mean Late Entry

‏כאשר כולם כבר תוקפים, ייתכן שהמחיר כבר עשה את רוב המהלך.

‏זו שאלה אמפירית של timing.

---

# ‏225. Practitioner Rule: Successful Aggression Is Different from Failed Aggression

‏הצלחה נמדדת בתגובה.

```text
aggression + price progress
```

‏שונה מ:

```text
aggression + no progress
```

---

# ‏226. Practitioner Rule: Flow and Execution Are Coupled

‏אותו flow שמנבא movement יכול גם להפוך את ה־Entry ליקר יותר.

‏Predictive Alpha ו־Execution Cost חייבים להימדד יחד.

---

# ‏227. Practitioner Rule: Best Signal Can Be Worst Fill

‏Top Flow candidate עלול להיות בדיוק הסמל שבו spread, queue ו־slippage הכי גרועים.

---

# ‏228. Practitioner Rule: Do Not Optimize Hit Rate Alone

‏Flow filter שמעלה hit rate אבל מוריד net EV אינו שיפור.

---

# ‏229. Practitioner Rule: Keep Unknown as Unknown

‏אם aggressor side אינו ידוע, אל תכריח classification רק כדי שה־dataset ייראה מלא.

---

# ‏230. Practitioner Rule: Preserve Raw Evidence

‏שמור את raw/canonical events שמאפשרים לחזור ולבדוק classification בעתיד.

---

# ‏231. Practitioner Rule: Separate Observation from Interpretation

‏Observation:

```text
8,200 shares traded at ask in 600ms
price advanced 2 ticks
```

‏Interpretation:

```text
strong buy pressure
```

‏שמור את שניהם בנפרד.

---

# ‏232. Practitioner Rule: Flow Is Conditional

‏אותו imbalance יכול להתנהג אחרת לפי:

- ‏Spread.
- ‏Liquidity.
- ‏Volatility.
- ‏Time of day.
- ‏Market regime.
- ‏Price location.

---

# ‏233. Practitioner Rule: Validate by Symbol Families

‏Microcaps, midcaps ו־large caps עשויים לדרוש normalizations שונים.

---

# ‏234. Practitioner Rule: Validate Tail Behavior

‏ממוצע טוב לא מספיק אם P99 של adverse outcome רע מאוד.

---

# ‏235. Practitioner Rule: Flow Needs a Clock

‏כל Flow signal חייב להיות קשור ל־`as_of_time` ברור.

---

# ‏236. Practitioner Rule: Entry Delay Changes the Experiment

‏Flow prediction at `t` אינו אותו experiment כמו fill at `t+1.5s`.

---

# ‏237. Practitioner Rule: Measure Decision-to-Fill Decay

‏זה אחד המדדים החשובים לרובוט קצר־טווח.

---

# ‏238. Practitioner Rule: Do Not Tune Every Symbol Separately Too Early

‏זה מתכון ל־overfitting.

‏התחל rules כלליים, ואז בדוק heterogeneity.

---

# ‏239. Practitioner Rule: Data Semantics First

‏לפני feature fancy, ודא שאתה יודע בדיוק מה feed שולח.

---

# ‏240. Practitioner Rule: Use Failure Examples as Tests

‏כל flow pattern שהפיל אותנו בצורה מעניינת יכול להפוך ל־golden replay scenario.

---

# ‏241. Baseline Flow Feature Set לרובוט שלנו

‏גרסה ראשונה יכולה להיות פשוטה:

```text
trade_count_1s
trade_count_5s
buy_volume_1s
sell_volume_1s
imbalance_1s
imbalance_5s
notional_rate_1s
flow_acceleration
price_response_1s
unknown_share
flow_confidence
```

---

# ‏242. Candidate Enrichment

‏ל־Top candidates בלבד:

```text
book_depletion
replenishment
sweep_score
absorption_candidate
flow_persistence
flow_rank_gap
```

---

# ‏243. Suggested Decision Snapshot

```text
DecisionId
AsOfTime
Symbol
PriceMomentum
FlowImbalance
FlowRate
FlowPersistence
PriceResponse
FlowConfidence
Spread
Depth
Rank
Decision
```

---

# ‏244. Suggested Research Table

```text
as_of
symbol
flow_features...
rank
forward_return_1s
forward_return_2s
forward_return_5s
net_forward_return
mfe
mae
```

---

# ‏245. Suggested Execution Join

```text
DecisionId
OrderIntentId
SubmitTime
FillTime
FlowAtDecision
FlowAtSubmit
FlowAtFill
FillPrice
Markout
```

---

# ‏246. Key Research Question #1

‏האם Flow מוסיף predictive value מעבר ל־price momentum בלבד?

---

# ‏247. Key Research Question #2

‏האם Flow עוזר יותר בסינון Candidates רעים מאשר בבחירת Winner?

---

# ‏248. Key Research Question #3

‏האם Absorption feature משפר Exit יותר מאשר Entry?

---

# ‏249. Key Research Question #4

‏באיזה horizon Flow עובד הכי טוב אצלנו?

---

# ‏250. Key Research Question #5

‏כמה predictive value נשאר אחרי latency ועלויות execution?

---

# ‏251. Key Research Question #6

‏האם extreme flow הוא continuation או late-stage exhaustion?

---

# ‏252. Key Research Question #7

‏האם Flow Rank יציב מספיק כדי לבצע Trade בפועל?

---

# ‏253. Key Research Question #8

‏האם unknown-share או data-quality צריכים להיות hard gates?

---

# ‏254. Key Research Question #9

‏האם Flow עוזר להחליט `NO TRADE`?

---

# ‏255. Key Research Question #10

‏האם Flow features עובדים באותה צורה ב־open, midday ו־close?

---

# ‏256. Acceptance Criterion למחקר

‏לא:

> ‏הגרף נראה משכנע.

‏אלא:

```text
Out-of-sample
execution-aware
cost-aware
stable across regimes
reproducible
```

---

# ‏257. מה לא נכניס עדיין

‏לא נמהר ל־deep learning על tick stream.

‏לא נבנה dozens of microstructure features בלי baseline.

‏לא נניח שיש לנו true aggressor side אם feed לא מספק אותו.

‏לא נבנה HFT architecture שאינה מתאימה ל־latency environment שלנו.

---

# ‏258. ה־KISS Baseline

```text
1. classify trades conservatively
2. compute signed flow
3. measure rate + persistence
4. measure price response
5. attach data confidence
6. rank cross-sectionally
7. validate net forward outcome
```

---

# ‏259. ה־KISS Baseline ל־Live

```text
Market Data
→ Flow Engine
→ Candidate Rank
→ Execution Readiness
→ Risk Gate
→ Order Intent
```

---

# ‏260. מה חייבים לדעת בעל פה

- ‏Trade יש תמיד גם קונה וגם מוכר; aggressor הוא הצד היוזם.
- ‏Signed Flow הוא inference אם feed לא נותן aggressor side אמיתי.
- ‏Activity אינה Directional Pressure.
- ‏Aggression בלי Price Response יכולה להיות Absorption.
- ‏Flow שנחלש הוא Exhaustion candidate.
- ‏Flow צריך להימדד במספר horizons.
- ‏Freshness ו־quality הן חלק מה־Feature.
- ‏Flow predictive אינו בהכרח executable.
- ‏Order Flow הוא Feature Family, לא הוכחה ל־Edge.

---

# ‏261. Checklist לפני שימוש ב־Order Flow ב־Score

- [ ] ‏האם Trade Signing מוגדר ומתועד?
- [ ] ‏האם יש `UNKNOWN` ולא forced classification?
- [ ] ‏האם quote freshness נמדד?
- [ ] ‏האם duplicates/gaps מטופלים?
- [ ] ‏האם `as_of_time` נשמר?
- [ ] ‏האם יש multi-horizon features?
- [ ] ‏האם Price Response נמדד יחד עם Aggression?
- [ ] ‏האם features normalized לפי symbol/context?
- [ ] ‏האם יש out-of-sample evidence?
- [ ] ‏האם validation הוא execution-aware ו־cost-aware?

---

# ‏262. המסקנה

‏`Order Flow` נותן לנו שכבה עמוקה יותר מ־Price ו־Volume בלבד.

‏אבל הערך שלו אינו במשפטים כמו “יש הרבה קונים”.

‏הערך הוא ביכולת למדוד באופן עקבי:

```text
Who is taking liquidity?
How fast?
How persistently?
How does the book react?
How does price react?
Does the effect survive long enough to execute?
```

‏עבור הרובוט שלנו, ה־Flow הטוב ביותר הוא לא בהכרח הכי קיצוני — אלא זה שמוסיף מידע **מעבר ל־Momentum**, נשאר תקף עד הביצוע, ועובר בדיקה מחוץ למדגם לאחר עלויות.

---

# ‏263. מעבר לשלב הבא

‏בשלב 45 נעבור ל־`Book Imbalance` ו־`Microprice`.

‏שם נעמיק בצד הפסיבי של המיקרו־מבנה: כיצד Bid/Ask sizes, מספר levels, imbalance ו־weighted fair-price estimates יכולים להשלים את מה שלמדנו כאן על flow אגרסיבי.
