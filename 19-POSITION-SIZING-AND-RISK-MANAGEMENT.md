# ‏שלב 19 — `Position Sizing` וניהול סיכון: כמה להקצות, כמה לסכן ומתי לעצור

> ‏מטרת הפרק: להבין את ההבדל בין גודל העסקה לבין הסיכון האמיתי שלה, לבנות `Risk Engine` שאינו תלוי בהתלהבות של ה־Scanner, ולהגדיר מגבלות ברורות לעסקה בודדת, לרצף עסקאות וליום שלם.
>
> ‏כמו בכל הקורס: קודם נלמד את העקרונות המקצועיים הכלליים, אחר כך את ה־Best Practices ורזי המקצוע, ולבסוף נתאים אותם לרובוט שלך — סריקה של כל השוק, החזקה של שניות בודדות ועד בערך דקה, ושאיפה ל־Net Edge קטן שחוזר הרבה פעמים.

---

# ‏1. למה בכלל צריך `Risk Management` אם העסקאות קצרות מאוד?

‏קל לחשוב:

> ‏"אם אני מחזיק רק כמה שניות, הסיכון קטן."

‏אבל משך קצר אינו מבטל סיכון.

‏בתוך שניות יכולים לקרות:

- ‏תנועה חדה נגדך.
- ‏התרחבות פתאומית של `Spread`.
- ‏נזילות שנעלמת.
- ‏`Partial Fill`.
- ‏`Halt`.
- ‏תקלה בברוקר.
- ‏ניתוק רשת.
- ‏נתון שוק שגוי או ישן.
- ‏כשל לוגי שגורם לפקודות כפולות.
- ‏רצף של הרבה עסקאות קטנות מפסידות.

‏לכן:

> ‏מסחר קצר דורש Risk Management מהיר יותר — לא פחות Risk Management.

---

# ‏2. שלושה מושגים שחייבים להפריד

## ‏`Capital`

‏כמה כסף יש בחשבון.

## ‏`Position Size`

‏כמה כסף הוקצה כרגע לעסקה.

## ‏`Risk per Trade`

‏כמה כסף אנחנו מוכנים להפסיד בתרחיש המתוכנן של העסקה.

‏אלה שלושה דברים שונים.

---

# ‏3. דוגמה פשוטה

‏נניח:

```text
Account Equity = $5,000
Position Size   = $2,000
Entry           = $20.00
Exit Threshold  = $19.95
Shares          = 100
```

‏הפוזיציה היא:

```text
100 × $20 = $2,000
```

‏אבל הסיכון התיאורטי עד נקודת היציאה הוא:

```text
100 × $0.05 = $5
```

‏כלומר:

```text
Position Size = $2,000
Planned Price Risk = $5
```

‏לא $2,000.

‏כמובן שבמציאות ייתכן הפסד גדול יותר בגלל Slippage, Gap, Halt או בעיית ביצוע.

---

# ‏4. `Planned Risk` אינו `Worst Possible Loss`

‏חשוב מאוד.

‏אם Stop נמצא 5 סנט מתחת לכניסה, זה לא אומר שהפסד מקסימלי באמת מוגבל ל־5 סנט.

‏פקודת יציאה יכולה להתבצע במחיר גרוע יותר.

‏לכן צריך להפריד:

```text
Planned Risk
```

‏מול:

```text
Execution Risk
Tail Risk
Operational Risk
```

---

# ‏5. נוסחה בסיסית ל־Risk per Trade

‏בקירוב:

```text
Risk per Trade = Quantity × Expected Loss per Share
```

‏לדוגמה:

```text
Quantity = 150
Expected Loss per Share = $0.04
```

‏אז:

```text
Risk ≈ $6
```

‏אבל במערכת אמיתית נרצה להוסיף גם Buffer ל־Slippage ועלויות.

---

# ‏6. נוסחה יותר מציאותית

```text
Expected Trade Risk =
    quantity ×
    (planned adverse move
     + expected exit slippage
     + spread component)
    + explicit costs
```

‏וה־Stress Risk יכול להשתמש בהנחות מחמירות יותר.

---

# ‏7. `Position Sizing by Risk`

‏במקום להחליט תמיד:

```text
Buy $2,000
```

‏אפשר להתחיל מכמות הסיכון:

```text
Max Risk = $5
Expected Loss per Share = $0.05
```

‏אז:

```text
Quantity = $5 / $0.05 = 100 shares
```

‏אם מחיר המניה $25:

```text
Position Size = 100 × $25 = $2,500
```

---

# ‏8. אבל למסחר שלך יש טוויסט

‏באסטרטגיה שלך ההחזקה קצרה מאוד.

‏לעיתים ה־Exit אינו Stop רחוק אלא:

- ‏אין המשך תוך כמה שניות.
- ‏Score נשבר.
- ‏Rank יורד.
- ‏מניה אחרת הופכת עדיפה.
- ‏Spread מתרחב.
- ‏Liquidity נעלמת.

‏לכן הסיכון אינו רק:

```text
entry - stop_price
```

‏אלא גם:

> ‏כמה זמן וכמה כסף ייקח להפוך שוב ל־Flat אם ה־Thesis נכשל עכשיו.

---

# ‏9. `Time Risk`

‏במערכת מהירה זמן עצמו הוא סיכון.

‏אם העסקה אמורה לעבוד תוך 5–15 שניות אבל נשארנו 45 שניות:

- ‏ה־Signal כבר ישן.
- ‏ה־Market Regime אולי השתנה.
- ‏הזדמנות אחרת נחסמה.
- ‏ה־Expected Edge המקורי כבר לא רלוונטי.

‏לכן `Maximum Holding Time` הוא גם מנגנון Risk.

---

# ‏10. `Liquidity Risk`

‏גם אם כמות העסקה נראית קטנה, צריך לשאול:

```text
Can I get flat quickly?
```

‏ולא רק:

```text
Can I enter?
```

‏יכול להיות קל לקנות אבל קשה למכור ברגע של לחץ.

---

# ‏11. `Exit Capacity`

‏נרצה למדוד, בקירוב:

```text
required_exit_quantity / available_liquidity
```

‏אם אנחנו צריכים למכור 500 מניות ויש כרגע רק 100 מניות בכל רמה קרובה, הסיכון שונה לחלוטין מעסקה של 50 מניות.

---

# ‏12. `Size-to-Depth Ratio`

‏Feature שימושי:

```text
size_to_ask_depth = buy_quantity / ask_depth_near_market
size_to_bid_depth = sell_quantity / bid_depth_near_market
```

‏ככל שהיחס גדול יותר, הסיכוי ל־Market Impact ו־Slippage עולה.

---

# ‏13. Position Size צריך להתחשב ב־Liquidity

‏כלל מקצועי חשוב:

> ‏אין Position Size נכון בלי קשר למניה.

‏אותו סכום יכול להיות זניח במניה אחת ומשמעותי במניה אחרת.

---

# ‏14. `Fixed Dollar Size`

‏השיטה הפשוטה:

```text
Every trade = $X
```

‏יתרונות:

- ‏פשוטה.
- ‏קלה למחקר.
- ‏קל להשוות עסקאות.
- ‏פחות פרמטרים.

‏חסרונות:

- ‏לא מתחשבת ב־Volatility.
- ‏לא מתחשבת ב־Liquidity.
- ‏לא מתחשבת באיכות Signal.
- ‏לא מתחשבת במרחק ה־Exit.

---

# ‏15. `Fixed Fractional Risk`

‏שיטה כללית נפוצה:

```text
Risk per Trade = X% of account equity
```

‏למשל:

```text
Account = $10,000
Risk = 0.25%
Max planned risk = $25
```

‏האחוז עצמו אינו המלצה.

‏העיקר הוא המבנה:

> ‏הסיכון גדל וקטן יחד עם ההון.

---

# ‏16. למה אחוז קטן עדיין יכול להיות מסוכן

‏אם יש 100 עסקאות ביום, גם סיכון קטן לעסקה יכול להצטבר.

‏לכן לא מספיק:

```text
risk_per_trade
```

‏צריך גם:

```text
risk_per_day
risk_per_hour
risk_per_strategy
risk_per_symbol
risk_per_regime
```

---

# ‏17. `Daily Loss Limit`

‏מגבלת הפסד יומית אומרת:

> ‏מעל הפסד מצטבר מסוים — מפסיקים לפתוח עסקאות חדשות.

‏זו לא תחזית שוק.

‏זו חגורת בטיחות.

---

# ‏18. למה Daily Stop חשוב במיוחד לאלגוריתם

‏אלגוריתם יכול לבצע טעויות מהר מאוד.

‏אם יש Bug או Regime שבו המודל נשבר, הוא יכול לחזור על אותה טעות עשרות פעמים.

‏לכן:

```text
if daily_loss >= limit:
    disable_new_entries
```

‏צריך להיות מנגנון עצמאי מה־Scanner.

---

# ‏19. `Consecutive Loss Limit`

‏נניח:

```text
5 losses in a row
```

‏זה לא בהכרח אומר שהאסטרטגיה נשברה.

‏אבל זה כן יכול להצדיק מעבר למצב:

```text
PAUSED
```

‏או:

```text
REDUCED_SIZE
```

‏עד לבדיקה.

---

# ‏20. למה רצף הפסדים חשוב יותר ממספר בודד

‏הסתברותית, רצפים קורים גם באסטרטגיה טובה.

‏אבל במערכת חיה רצף יכול גם לרמוז על:

- ‏שינוי Regime.
- ‏Feed לא תקין.
- ‏Broker issue.
- ‏Slippage חריג.
- ‏Bug חדש.
- ‏Score drift.

‏כלומר רצף הפסדים הוא גם Signal תפעולי.

---

# ‏21. `Loss Velocity`

‏למסחר מהיר יש מדד נוסף:

```text
loss_dollars_per_minute
```

‏או:

```text
losses_per_10_minutes
```

‏אם המערכת מפסידה מהר מהרגיל, זה יכול להיות מסוכן גם לפני שהגענו ל־Daily Loss Limit.

---

# ‏22. `Drawdown`

‏`Drawdown` הוא הירידה משיא ההון האחרון.

‏לדוגמה:

```text
Peak Equity = $10,000
Current Equity = $9,700
Drawdown = $300 = 3%
```

---

# ‏23. `Intraday Drawdown`

‏אפשר למדוד גם בתוך אותו יום:

```text
Best intraday equity = $10,150
Current equity = $9,980
Intraday drawdown = $170
```

‏זה שונה מ־P&L מתחילת היום.

---

# ‏24. `Maximum Drawdown`

‏במחקר היסטורי נמדוד את הירידה הגדולה ביותר משיא לשפל.

‏אבל אסור להסתפק רק במספר הזה.

‏צריך לדעת:

- ‏כמה זמן נמשך Drawdown.
- ‏כמה עסקאות היו בו.
- ‏באילו Regimes.
- ‏האם הוא הגיע מ־Signal או Execution.

---

# ‏25. `Risk of Ruin`

‏זה מושג כללי שמתאר את הסיכוי להגיע להפסד שממנו אי אפשר להמשיך בצורה סבירה.

‏הוא מושפע מ:

- ‏Expected Value.
- ‏Variance.
- ‏Win Rate.
- ‏Average Win/Loss.
- ‏Position Size.
- ‏Correlation בין עסקאות.

‏ככל שמסכנים חלק גדול יותר מההון בכל עסקה, הסיכון גדל במהירות.

---

# ‏26. למה “יש לי Edge” עדיין לא מספיק

‏אסטרטגיה יכולה להיות חיובית בתוחלת ועדיין להיכשל בגלל Position Sizing אגרסיבי מדי.

‏לדוגמה:

```text
Expected Value > 0
```

‏אבל אם הפסד נדיר גדול מוחק 50 עסקאות טובות — התוצאה יכולה להיות גרועה.

---

# ‏27. `Variance` ו־`Volatility of Returns`

‏שתי אסטרטגיות יכולות להרוויח אותו ממוצע אבל להיות שונות מאוד בסיכון.

‏למשל:

```text
Strategy A: +1, +1, +1, -1
Strategy B: +10, -8, +10, -8
```

‏הממוצע לבדו לא מספר את כל הסיפור.

---

# ‏28. `Tail Risk`

‏`Tail Risk` הוא הסיכון לאירוע נדיר וקיצוני.

‏למשל:

- ‏Halt מיד אחרי כניסה.
- ‏News shock.
- ‏Gap.
- ‏נפילת ברוקר בזמן Position.
- ‏Feed freeze.

‏אי אפשר להעריך אותו רק לפי תנודתיות רגילה של השניות האחרונות.

---

# ‏29. `Gap Risk`

‏גם בתוך היום יכול להיות מעבר מהיר בין מחירים בלי Fill בכל רמה.

‏לכן:

```text
Stop Price != Guaranteed Exit Price
```

‏זו סיבה לא להגדיר Risk אך ורק לפי מרחק Stop.

---

# ‏30. `Halt Risk`

‏אם המניה נעצרת בזמן שיש Position:

- ‏אי אפשר בהכרח לצאת.
- ‏ה־Spread לאחר החידוש יכול להיות רחב.
- ‏המחיר יכול להיפתח במקום שונה.

‏לכן מניות עם סיכון Halt גבוה יכולות לדרוש Position Size קטן יותר או פסילה מוחלטת, בהתאם למחקר.

---

# ‏31. `Operational Risk`

‏מערכת מסחר כוללת גם סיכונים שאינם שוק:

- ‏Bug.
- ‏Double order.
- ‏Wrong quantity.
- ‏Wrong symbol.
- ‏Stale position state.
- ‏Reconnect שגוי.
- ‏Clock drift.
- ‏Duplicate callback.

‏אלה יכולים להיות מסוכנים יותר מ־Signal גרוע.

---

# ‏32. לכן צריך `Risk Engine` עצמאי

‏ארכיטקטורה טובה:

```text
Scanner
  ↓
Decision Engine
  ↓
Risk Engine
  ↓
Execution Engine
  ↓
Broker
```

‏ה־Scanner יכול לומר:

```text
BUY XYZ
```

‏וה־Risk Engine עדיין יכול לומר:

```text
REJECT
```

---

# ‏33. למה ה־Risk Engine צריך להיות עצמאי

‏כי הוא מגן מפני כמה סוגי כשל:

- ‏Signal שגוי.
- ‏Bug ב־Score.
- ‏שינוי Regime.
- ‏חשיפה שכבר גדולה מדי.
- ‏חשבון שאינו במצב תקין.
- ‏Broker mismatch.

‏אסור שמודל חזק יעקוף את חגורת הבטיחות.

---

# ‏34. `Pre-Trade Risk Check`

‏לפני כל Order:

```text
Is trading enabled?
Is account state valid?
Is position size allowed?
Is symbol exposure allowed?
Is daily loss below limit?
Are there conflicting open orders?
Is data fresh?
Is broker synchronized?
```

‏רק אם הכול עובר:

```text
ALLOW ORDER
```

---

# ‏35. `Max Position Size`

‏מגבלה בסיסית:

```text
position_notional <= max_position_notional
```

‏אפשר להגדיר:

- ‏מגבלה גלובלית.
- ‏מגבלה לפי Symbol.
- ‏מגבלה לפי Liquidity.
- ‏מגבלה לפי Price Band.

---

# ‏36. `Max Quantity`

‏לפעמים חשוב להגביל גם מספר מניות, לא רק Dollar Notional.

‏למשל מניה זולה מאוד יכולה ליצור Quantity גדול מאוד.

---

# ‏37. `Max Exposure`

‏אם יש כמה Positions במקביל:

```text
Total Gross Exposure = sum(abs(position_notional))
```

‏צריך להגביל גם אותו.

---

# ‏38. `Net Exposure`

‏במערכת Long/Short:

```text
Net Exposure = Long Exposure - Short Exposure
```

‏גם Gross וגם Net חשובים.

‏אם המערכת שלך Long-only בשלב מסוים, עדיין כדאי להבין את המושג.

---

# ‏39. `Concurrent Positions`

‏אפשר להגביל:

```text
max_open_positions
```

‏לא רק בגלל הון.

‏גם בגלל:

- ‏יכולת ניטור.
- ‏מורכבות Execution.
- ‏סיכוני Correlation.
- ‏Load על API.

---

# ‏40. האם בכלל כדאי כמה Positions בו־זמנית?

‏זו החלטת אסטרטגיה שצריך לבדוק.

‏אם המטרה שלך היא תמיד:

> ‏הכסף נמצא במניה הטובה ביותר כרגע

‏אז ייתכן שמודל של Position אחד מתאים יותר.

‏אבל זו Hypothesis, לא אמת.

‏אפשר לבדוק גם:

```text
Top 1
Top 2
Top 3
```

‏ולמדוד Net results וסיכון.

---

# ‏41. `Duplicate Exposure`

‏מערכת צריכה למנוע מצב שבו כמה Signals יוצרים בטעות אותה חשיפה שוב ושוב.

‏לדוגמה:

```text
Position XYZ = 100 shares
Open Buy Order XYZ = 100 shares
New Signal XYZ = BUY 100
```

‏אם לא מנהלים Intent נכון, אפשר להגיע ל־300 במקום 100.

---

# ‏42. `Reserved Capital`

‏פקודה פתוחה יכולה לצרוך Buying Power גם לפני Fill.

‏לכן Risk Engine צריך להסתכל על:

```text
filled_positions
+
working_orders
+
pending_order_intents
```

‏ולא רק על Positions שכבר Filled.

---

# ‏43. `Pending Risk`

‏זו חשיפה שעוד לא קיימת במלואה אבל עלולה להפוך לחשיפה.

‏למשל Order שנשלח ועדיין אין עליו State סופי.

‏צריך לספור אותה.

---

# ‏44. `Unknown State` הוא Risk State

‏אם איננו יודעים האם Order Filled:

```text
UNKNOWN != SAFE
```

‏המערכת לא צריכה לפתוח עסקה נוספת כאילו אין Position.

---

# ‏45. `Fail Closed`

‏במצבי אי־ודאות מסוכנים:

```text
No new entries
```

‏עד reconciliation.

‏זה נקרא גישה של `Fail Closed`.

---

# ‏46. `Buying Power` אינו תקציב סיכון

‏אם הברוקר מאפשר לקנות $20,000, זה לא אומר שהאסטרטגיה צריכה להשתמש בכולו.

‏`Buying Power` הוא גבול חשבון.

‏`Risk Budget` הוא החלטת מערכת.

---

# ‏47. `Risk Budget`

‏אפשר לחשוב על תקציב סיכון בכמה שכבות:

```text
Account Risk Budget
  ↓
Daily Risk Budget
  ↓
Strategy Risk Budget
  ↓
Trade Risk Budget
```

---

# ‏48. `Loss Budget` ו־`Execution Budget`

‏במסחר קצר כדאי להפריד בין:

```text
Signal Loss Budget
Execution Cost Budget
Operational Buffer
```

‏כך אפשר להבין אם הפסד הגיע מהמודל או מהביצוע.

---

# ‏49. `Volatility-Based Sizing`

‏רעיון כללי:

> ‏כאשר המניה תנודתית יותר, אפשר להקטין Quantity כדי לשמור Risk דומה.

‏לדוגמה:

```text
risk_per_share = volatility_measure × multiplier
quantity = risk_budget / risk_per_share
```

‏אבל צריך לבדוק האם מדד התנודתיות בכלל רלוונטי לאופק של שניות.

---

# ‏50. לא להשתמש אוטומטית ב־ATR יומי

‏`ATR` הוא כלי מוכר.

‏אבל ATR יומי יכול להיות רחוק מאוד מהבעיה שלך אם העסקה נמשכת 10 שניות.

‏לרובוט שלך אפשר לחקור:

```text
1s realized volatility
5s realized volatility
10s realized volatility
spread volatility
microprice volatility
```

‏ולראות מה באמת מסביר Execution Risk.

---

# ‏51. `Liquidity-Based Sizing`

‏דוגמה כללית:

```text
max_quantity = min(
    capital_limit_quantity,
    risk_limit_quantity,
    liquidity_limit_quantity
)
```

‏כך גודל העסקה אינו נקבע לפי גורם יחיד.

---

# ‏52. `Signal-Quality-Based Sizing`

‏אפשר תאורטית לתת Size גדול יותר ל־Signal איכותי יותר.

‏למשל:

```text
High Confidence  → 1.0x
Medium Confidence → 0.5x
Low Confidence   → NO TRADE
```

‏אבל זה מסוכן למחקר כי קל לבצע Overfitting.

‏לכן מתחילים בדרך כלל מ־Sizing פשוט ורק אחר כך בודקים אם Dynamic Sizing באמת מוסיף Net Edge.

---

# ‏53. לא להכפיל Size רק כי Score גבוה

‏Score אינו כסף.

‏אם:

```text
score = 95
```

‏זה לא אומר:

```text
risk = 95%
```

‏צריך Calibration אמיתי בין Score לבין Expected Distribution של תוצאות.

---

# ‏54. `Confidence` גם אינו ודאות

‏גם אם המודל מעריך Confidence גבוה, תמיד קיימים:

- ‏Model error.
- ‏Data error.
- ‏Execution error.
- ‏Tail event.

‏לכן Max Risk נשאר קיים גם ב־best setup.

---

# ‏55. `Kelly Criterion` — ידע כללי

‏`Kelly Criterion` הוא רעיון מתמטי לקביעת גודל הימור כאשר יודעים את יתרון ההסתברות והתשלום.

‏בצורה פשוטה מאוד הוא מנסה למקסם צמיחת הון ארוכת טווח.

‏אבל הוא רגיש מאוד לשגיאות בהערכת Edge.

---

# ‏56. למה Kelly מסוכן כאשר Edge לא ידוע היטב

‏אם אנחנו מעריכים יתר על המידה את:

- ‏Win probability.
- ‏Average win.
- ‏Average loss.

‏אז Kelly עלול להמליץ על Size אגרסיבי מדי.

‏במערכת צעירה עם הרבה Model Uncertainty, אין סיבה לקפוץ לשם מוקדם.

---

# ‏57. `Fractional Kelly`

‏ידע מקצועי כללי שכדאי להכיר:

‏במקום Kelly מלא, משתמשים לפעמים בחלק ממנו כדי להקטין תנודתיות וסיכון Model Error.

‏אבל גם זה רלוונטי רק לאחר שיש הערכות יציבות מאוד.

---

# ‏58. `Risk-Adjusted Return`

‏לא מספיק לשאול:

```text
Which strategy made more money?
```

‏צריך גם:

```text
How much risk was required to make it?
```

---

# ‏59. Sharpe — ידע כללי

‏`Sharpe Ratio` משווה עודף תשואה לתנודתיות של התשואות.

‏הוא שימושי בהקשרים רבים, אבל למסחר מהיר עם הרבה עסקאות ו־non-normal returns הוא אינו מדד יחיד מספיק.

---

# ‏60. Sortino — ידע כללי

‏`Sortino Ratio` מתמקד יותר ב־Downside volatility.

‏גם הוא יכול להיות שימושי ברמת Portfolio/Strategy, אבל לא מחליף ניתוח Trade-level מפורט.

---

# ‏61. למסחר שלך חשוב יותר לראות Distribution מלאה

‏למשל:

```text
PnL per trade distribution
MAE distribution
MFE distribution
time-to-loss
time-to-profit
worst 1%
worst 0.1%
```

‏ממוצע בלבד מסתיר Tail Risk.

---

# ‏62. `Expected Shortfall`

‏מושג מתקדם:

> ‏מהו ההפסד הממוצע בתוך קבוצת התרחישים הגרועים ביותר?

‏לדוגמה:

```text
Worst 1% of trades
```

‏מה היה ההפסד הממוצע שם?

‏זה יכול להיות רלוונטי יותר מ־Max Loss בודד.

---

# ‏63. `Value at Risk` — ידע כללי

‏`VaR` מנסה לענות על שאלה כמו:

> ‏באיזה הפסד לא צפוי לעבור ברמת הסתברות מסוימת ובאופק מסוים?

‏אבל VaR אינו מספר לנו כמה גרועים יכולים להיות המקרים שמעבר לסף.

‏לכן לא משתמשים בו לבדו.

---

# ‏64. `Correlation Risk`

‏אם מחזיקים כמה מניות במקביל, הן לא בהכרח עצמאיות.

‏לדוגמה, כמה מניות מאותו Sector יכולות לזוז יחד.

‏לכן:

```text
5 positions != 5 independent risks
```

---

# ‏65. `Common Factor Risk`

‏מניות יכולות להיות תלויות ב:

- ‏Market Index.
- ‏Sector.
- ‏ETF.
- ‏News theme.
- ‏Macro event.

‏אם כולן חשופות לאותו Factor, Diversification לכאורה יכולה להיות מזויפת.

---

# ‏66. `Regime Risk`

‏אסטרטגיה יכולה לעבוד מצוין בשוק פעיל ולהישבר בשוק שקט.

‏לכן אפשר לשנות:

- ‏Position Size.
- ‏Trade frequency.
- ‏Thresholds.
- ‏או לעצור לחלוטין.

‏לפי Regime — אבל רק אם זה הוכח במחקר.

---

# ‏67. `Open` אינו `Midday`

‏פתיחת המסחר יכולה לכלול:

- ‏Volume גבוה.
- ‏Volatility גבוהה.
- ‏Spreads משתנים מהר.
- ‏יותר Gaps.

‏Sizing שמתאים לאמצע היום לא בהכרח מתאים לפתיחה.

---

# ‏68. `News Risk`

‏אירוע חדשותי יכול לשנות את Distribution של התוצאות.

‏מערכת יכולה לבחור:

- ‏לא לסחור במצב כזה.
- ‏להקטין Size.
- ‏להשתמש Thresholds שונים.

‏אבל שוב — זו Hypothesis למחקר, לא כלל אוניברסלי.

---

# ‏69. `Event Risk Calendar`

‏ידע כללי שכדאי להכיר:

- ‏דוחות כספיים.
- ‏הודעות חברה.
- ‏מאקרו.
- ‏החלטות ריבית.

‏אירועים כאלה יכולים לשנות Volatility ונזילות בצורה משמעותית.

---

# ‏70. `Max Orders per Minute`

‏Risk אינו רק כסף.

‏אפשר להגביל:

```text
max_orders_per_minute
max_cancels_per_minute
max_replaces_per_minute
```

‏כדי לעצור runaway loop או bug.

---

# ‏71. `Max Turnover`

‏אם האלגוריתם קונה ומוכר שוב ושוב, Turnover גבוה יכול לייצר עלויות גם אם PnL לפני עלויות נראה טוב.

‏לכן אפשר למדוד:

```text
notional_traded_per_day
```

---

# ‏72. `Cost Risk`

‏אם Spread/Slippage עולים פתאום, Risk Engine יכול:

```text
reduce_size
```

‏או:

```text
reject_trade
```

‏גם אם Signal עצמו חזק.

---

# ‏73. `Data Risk`

‏אם Market Data ישן או חלקי:

```text
no_new_entries
```

‏כי אי אפשר לחשב Risk אמיתי מנתונים שאינם אמינים.

---

# ‏74. `Model Risk`

‏גם מודל שנבדק היטב יכול לטעות.

‏לכן Risk Management אינו אמור להניח:

```text
scanner_is_correct = true
```

‏אלא:

```text
scanner_can_be_wrong = always
```

---

# ‏75. `Parameter Risk`

‏אם שינוי קטן בפרמטר גורם לתוצאה להשתנות לחלוטין, המודל שביר.

‏זה רלוונטי גם ל־Sizing.

‏נרצה אזור פרמטרים יציב, לא נקודת קסם.

---

# ‏76. `Sizing Surface`

‏במחקר אפשר להשוות:

```text
$250
$500
$1,000
$2,000
$5,000
```

‏ולראות:

- ‏Net PnL.
- ‏Slippage.
- ‏Fill Rate.
- ‏Drawdown.
- ‏Tail losses.

‏כך רואים מתי Capacity מתחילה להישחק.

---

# ‏77. `Capacity`

‏`Capacity` היא השאלה:

> ‏כמה הון אפשר להפעיל לפני שהאסטרטגיה מתחילה להרוס את עצמה דרך Market Impact, נזילות ועלויות?

‏לסוחר קטן יכולה להיות כאן נקודת יתרון משמעותית.

---

# ‏78. יתרון של הון קטן

‏אסטרטגיה שיכולה לעבוד רק עם $2,000–$10,000 לעסקה עשויה להיות לא מעניינת לקרן גדולה.

‏אבל היא יכולה להיות רלוונטית לסוחר אישי.

‏זה אינו מבטיח Edge — אבל Capacity קטנה אינה בהכרח חיסרון עבורך.

---

# ‏79. `Scaling` אינו ליניארי

‏אם $1,000 לעסקה עובד:

```text
$10,000 != 10 × same result
```

‏כי:

- ‏Slippage גדל.
- ‏Fill Rate משתנה.
- ‏Queue impact משתנה.
- ‏Universe אפשרי מצטמצם.

---

# ‏80. `Trade Frequency Risk`

‏גם אם Risk לעסקה נמוך, תדירות גבוהה יכולה להגדיל:

- ‏עלות מצטברת.
- ‏חשיפה ל־bugs.
- ‏חשיפה ל־bad regime.
- ‏Execution errors.

---

# ‏81. `Risk per Unit Time`

‏לרובוט מהיר אפשר למדוד:

```text
risk_taken_per_minute
risk_taken_per_hour
```

‏לא רק Risk per Trade.

---

# ‏82. `Exposure Time`

‏אפשר למדוד:

```text
percent_of_session_in_market
```

‏מערכת שעושה 500 Trades אבל מחזיקה Position רק 10% מהזמן שונה מאוד ממערכת שנמצאת בשוק 90% מהיום.

---

# ‏83. `Time at Risk`

‏מדד שימושי:

```text
sum(position_duration)
```

‏או באחוזים מזמן המסחר.

‏כך אפשר להעריך כמה זמן ההון חשוף לאירועי שוק.

---

# ‏84. `Risk-adjusted Opportunity Selection`

‏המניה עם Expected Gross Return הכי גבוה אינה בהכרח הבחירה הטובה ביותר.

‏אפשר לחשוב על:

```text
Expected Net Edge / Expected Risk
```

‏אבל צריך להיזהר מיחסים שיכולים להתפוצץ כאשר המכנה קטן.

---

# ‏85. עדיף לעיתים שני ציונים נפרדים

‏למשל:

```text
OpportunityScore
RiskScore
```

‏ולא לערבב הכול לתוך מספר אחד.

‏אחר כך Decision Engine יכול לדרוש:

```text
OpportunityScore >= threshold
RiskScore <= threshold
```

---

# ‏86. `RiskScore` אפשרי

‏הוא יכול לכלול:

```text
spread risk
liquidity risk
volatility risk
halt risk
data risk
execution risk
```

‏אבל כל רכיב צריך להיות מדיד ומוסבר.

---

# ‏87. `Risk Gate` עדיף לעיתים על Penalty

‏אם Data stale, אולי לא נכון רק להוריד 5 נקודות Score.

‏אולי נכון:

```text
REJECT
```

‏זו הבחנה בין:

```text
Risk Penalty
```

‏לבין:

```text
Risk Gate
```

---

# ‏88. `Hard Risk Limits`

‏דוגמאות:

```text
max_position_notional
max_daily_loss
max_open_positions
max_orders_per_minute
max_symbol_exposure
max_total_exposure
max_stale_data_age
```

‏אלה צריכים להיות ברורים, versioned ומתועדים.

---

# ‏89. `Soft Risk Controls`

‏דוגמאות:

```text
reduce size when spread widens
reduce size when volatility rises
reduce size after unusual slippage
```

‏אלה גמישים יותר ודורשים מחקר.

---

# ‏90. `Kill Switch`

‏`Kill Switch` הוא מנגנון שאומר:

```text
STOP OPENING NEW TRADES
```

‏או במקרה חמור יותר:

```text
CANCEL WORKING ORDERS
FLATTEN POSITIONS
DISABLE STRATEGY
```

‏ההתנהגות המדויקת צריכה להיות מתוכננת מראש.

---

# ‏91. מתי Kill Switch יכול להידלק

‏למשל:

- ‏Daily Loss Limit.
- ‏Broker mismatch.
- ‏Position mismatch.
- ‏Data feed stale.
- ‏Unexpected duplicate fills.
- ‏Order rate abnormal.
- ‏PnL abnormal.
- ‏Repeated rejects.
- ‏Unknown state.

---

# ‏92. `Manual Kill Switch`

‏גם מערכת אוטומטית צריכה דרך ברורה לעצירה ידנית.

‏אסור שהדרך לעצור תהיה:

> ‏"אני אסגור את התהליך ואקווה שהכול בסדר."

‏צריך להבין מה יקרה ל־Orders ול־Positions שכבר קיימים.

---

# ‏93. `Flatten` הוא פעולה בפני עצמה

‏במצב חירום צריך לדעת:

```text
What positions exist?
What open orders exist?
What quantity must be closed?
What is the safest executable exit?
```

‏לא שולחים פקודות עיוורות.

---

# ‏94. `Risk State Machine`

‏אפשר להגדיר:

```text
NORMAL
REDUCED_SIZE
PAUSED
EXIT_ONLY
EMERGENCY_FLATTEN
LOCKED
```

‏כך הסיכון מנוהל כ־State ברור ולא כאוסף `if` מפוזר.

---

# ‏95. `NORMAL`

‏המערכת רשאית:

- ‏לסרוק.
- ‏לפתוח Position.
- ‏לנהל Position.

---

# ‏96. `REDUCED_SIZE`

‏המערכת עדיין סוחרת, אבל עם Size קטן יותר.

‏אפשר להגיע אליו בגלל:

- ‏Slippage חריג.
- ‏Loss streak.
- ‏Regime לא יציב.

---

# ‏97. `PAUSED`

‏אין כניסות חדשות.

‏אבל Positions קיימים עדיין מנוהלים כרגיל.

---

# ‏98. `EXIT_ONLY`

‏אין כניסות חדשות.

‏המטרה היחידה היא:

```text
reduce exposure to zero
```

---

# ‏99. `LOCKED`

‏לא חוזרים למסחר אוטומטית.

‏נדרשת בדיקה או פעולה מפורשת כדי להפעיל מחדש.

‏מצב כזה מתאים לכשל חמור.

---

# ‏100. Risk Limits לא צריכים להיעלם אחרי Restart

‏אם המערכת עצרה בגלל Daily Loss Limit ואז המחשב הופעל מחדש:

‏אסור שהמונה יתאפס בטעות.

‏Risk State צריך להיות Durable.

---

# ‏101. `Persisted Risk State`

‏אפשר לשמור:

```text
trading_date
realized_pnl
unrealized_pnl
peak_equity
current_drawdown
loss_streak
orders_sent
trades_completed
risk_state
kill_switch_reason
```

---

# ‏102. `Risk Reconciliation` בהפעלה

‏ב־Startup:

```text
Load persisted state
Fetch broker positions
Fetch broker open orders
Fetch account balances
Compare
Resolve mismatches
Only then enable new entries
```

---

# ‏103. `Broker Truth` מול `Local Truth`

‏המערכת המקומית יכולה לחשוב שאין Position.

‏הברוקר יכול לדעת שיש.

‏במצב כזה:

> ‏לא פותחים עסקה חדשה עד reconciliation.

---

# ‏104. `PnL Truth`

‏גם PnL יכול להיות מחושב בכמה דרכים:

- ‏Local execution ledger.
- ‏Broker-reported PnL.
- ‏Mark-to-market.

‏כדאי להגדיר מקור סמכות לכל החלטת Risk.

---

# ‏105. Realized מול Unrealized

‏`Realized PnL` = רווח/הפסד שכבר נסגר.

‏`Unrealized PnL` = רווח/הפסד על Position פתוח.

‏Daily Risk צריך להגדיר במפורש אם הוא משתמש באחד מהם או בשניהם.

---

# ‏106. `High Water Mark`

‏אפשר לשמור את שיא ההון/ה־PnL של היום ולמדוד Drawdown ממנו.

‏זה מונע מצב שבו:

```text
+100
then -90
```

‏ייראה כאילו היום עדיין `+10` בלבד בלי להבין שהוחזר רוב הרווח.

---

# ‏107. `Giveback Limit`

‏מנגנון אפשרי:

> ‏אם הרווח היומי הגיע לשיא מסוים ואז איבדנו חלק גדול ממנו — הקטן Size או עצור.

‏גם זה דורש מחקר ולא צריך להפוך אוטומטית לכלל.

---

# ‏108. `Dynamic Risk` מול `Static Risk`

## ‏Static

```text
same limits all day
```

## ‏Dynamic

```text
limits adapt to regime/performance/liquidity
```

‏מתחילים בדרך כלל פשוט יותר.

---

# ‏109. אל תיתן ל־Dynamic Risk להפוך ל־Overfitting

‏אם יש לנו 30 כללי התאמה:

```text
if open and VIX high and spread low and loss streak 2...
```

‏קשה מאוד לדעת מה באמת עובד.

‏KISS חשוב גם ב־Risk.

---

# ‏110. `Risk Budget` לפי Strategy Version

‏אם מפעילים כמה גרסאות:

```text
strategy_A
strategy_B
```

‏אפשר לתת לכל אחת Risk Budget נפרד.

‏כך גרסה חדשה לא יכולה לסכן את כל החשבון מיד.

---

# ‏111. `Canary Capital`

‏רעיון מקצועי:

‏גרסה חדשה מתחילה עם Size קטן מאוד.

‏רק לאחר שהיא מוכיחה ביצוע Live תקין:

```text
increase size gradually
```

‏זה דומה Canary Deployment בתוכנה.

---

# ‏112. `Capital Ramp`

‏דוגמה רעיונית:

```text
Stage 1: paper
Stage 2: tiny live size
Stage 3: small size
Stage 4: normal size
```

‏מעבר בין שלבים צריך להיות לפי Metrics, לא לפי תחושה.

---

# ‏113. מה בודקים לפני הגדלת Size

‏למשל:

- ‏Net expectancy.
- ‏Fill quality.
- ‏Slippage stability.
- ‏Drawdown.
- ‏Tail losses.
- ‏System reliability.
- ‏Broker reconciliation.

---

# ‏114. `Risk Calibration`

‏אם Backtest מניח:

```text
average slippage = 1 cent
```

‏אבל Live מראה:

```text
average slippage = 3 cents
```

‏Position Sizing ו־Expected Risk צריכים להתעדכן.

---

# ‏115. Risk חייב להשתמש ב־Live Execution Data

‏לא מספיק לבנות Risk לפי Historical Prices.

‏צריך להשתמש גם ב:

```text
actual fills
actual slippage
actual rejects
actual partial fills
actual time-to-flat
```

---

# ‏116. `Risk Attribution`

‏אחרי הפסד נשאל:

```text
Signal loss?
Execution loss?
Liquidity loss?
Latency loss?
Operational loss?
Unexpected event?
```

‏זו הדרך לשפר מערכת ולא רק להקטין Size בצורה עיוורת.

---

# ‏117. `Loss Classification`

‏אפשר לשמור לכל Trade:

```text
loss_reason_primary
loss_reason_secondary
```

‏למשל:

```text
MODEL_WRONG
ENTRY_SLIPPAGE
EXIT_SLIPPAGE
NO_CONTINUATION
HALT
DATA_STALE
BROKER_DELAY
```

---

# ‏118. הפסד אינו בהכרח Risk Failure

‏אם המודל צפוי להפסיד בחלק מהעסקאות, הפסד רגיל אינו תקלה.

‏Risk Failure הוא למשל:

- ‏הפסד מעבר לגבול שתוכנן.
- ‏Size שגוי.
- ‏יציאה שלא בוצעה.
- ‏Order כפול.

---

# ‏119. Win אינו בהכרח Success של Risk

‏אם Bug פתח Position פי 10 מהמתוכנן ובמקרה הרווחנו — זה עדיין אירוע Risk חמור.

‏הצלחה נמדדת גם לפי Process Correctness.

---

# ‏120. `Near Miss`

‏גם אירוע שלא גרם להפסד צריך להירשם.

‏לדוגמה:

```text
duplicate order blocked
stale data blocked
position mismatch detected before submit
```

‏אלה Near Misses חשובים.

---

# ‏121. למה Near Misses חשובים

‏כי הם מגלים חורים לפני שהם עולים כסף.

‏בעולם תפעולי מקצועי:

> ‏כשל שנחסם הוא עדיין מידע.

---

# ‏122. `Stress Test`

‏נרצה לשאול:

> ‏מה קורה אם המציאות גרועה יותר מההנחות?

‏למשל:

```text
Spread × 2
Slippage × 3
Fill delay +500ms
Exit delay +2s
Win rate lower
Loss size higher
```

---

# ‏123. `Scenario Testing`

‏תרחישים אפשריים:

```text
Normal market
Fast market
Open
News burst
Thin liquidity
Broker delay
Feed delay
```

‏נבדוק האם המערכת עדיין נשארת בתוך Risk Budget.

---

# ‏124. `Monte Carlo` — ידע כללי

‏אפשר לקחת Distribution של עסקאות ולערבב סדרים אפשריים כדי להבין טווחי Drawdown אפשריים.

‏זה עוזר לזכור:

> ‏סדר העסקאות משנה את הדרך, גם אם Average Trade זהה.

---

# ‏125. `Sequence Risk`

‏אם כמה הפסדים מגיעים בתחילת הדרך, מערכת עם Sizing אגרסיבי יכולה להיפגע הרבה יותר מאותה אסטרטגיה עם אותו ממוצע עסקאות בסדר אחר.

---

# ‏126. `Compounding`

‏אם Size מחושב כאחוז מההון, הוא גדל אחרי רווחים וקטן אחרי הפסדים.

‏זו Compounding.

‏צריך לבדוק אותה במפורש ב־Backtest ולא להניח שהיא תמיד טובה.

---

# ‏127. `Deleveraging`

‏אחרי Drawdown אפשר להקטין Size באופן מתוכנן.

‏למשל:

```text
Normal size
↓
Reduced size
↓
Pause
```

‏אבל התנאים צריכים להיות מוגדרים מראש.

---

# ‏128. `Recovery Rules`

‏אם הקטנו Size, צריך להגדיר גם איך חוזרים.

‏אחרת המערכת יכולה להישאר לנצח במצב reduced.

‏לדוגמה:

```text
N clean trades
system health stable
PnL recovered partially
manual approval
```

---

# ‏129. `Risk Hysteresis`

‏כדי למנוע קפיצות:

```text
NORMAL → REDUCED at threshold A
REDUCED → NORMAL only after threshold B
```

‏כאשר B מחמיר יותר.

‏כך נמנע oscillation.

---

# ‏130. `Risk Versioning`

‏כל שינוי ב־Risk Rules צריך Version.

‏למשל:

```text
risk_model_version = 3
```

‏כדי לדעת תחת אילו כללים כל Trade בוצע.

---

# ‏131. `Configuration as Data`

‏במקום לפזר constants בקוד:

```text
max_daily_loss
max_position
max_orders_per_minute
```

‏נשמור Configuration מסודר, versioned וניתן לביקורת.

---

# ‏132. `Risk Decision Log`

‏לכל Order Intent נשמור:

```text
requested_quantity
approved_quantity
risk_state
account_equity
current_exposure
daily_pnl
loss_streak
spread
liquidity_metrics
risk_rules_version
rejection_reason
```

---

# ‏133. `Why was size 80 shares?`

‏המערכת צריכה להיות מסוגלת לענות בדיעבד:

```text
Capital allowed 150
Risk budget allowed 100
Liquidity allowed 80
Final quantity = 80
```

‏זה Risk Explainability.

---

# ‏134. `Min of Constraints`

‏דפוס פשוט וחזק:

```text
final_quantity = min(
    quantity_by_capital,
    quantity_by_trade_risk,
    quantity_by_liquidity,
    quantity_by_account_limits,
    quantity_by_strategy_limit
)
```

‏כך כל שכבה יכולה רק להקטין Risk, לא להגדיל מעבר למגבלות האחרות.

---

# ‏135. `Zero` היא Quantity חוקית

‏אם אחת המגבלות אומרת:

```text
0
```

‏התוצאה היא:

```text
NO TRADE
```

‏לא מחפשים לעקוף את ה־Risk Gate.

---

# ‏136. `Round Lot` ו־Fractional Shares

‏היכולת לסחור ב־fractional shares תלויה בברוקר ובמכשיר.

‏מערכת צריכה לדעת מה מותר בפועל ולבצע rounding נכון.

‏גם rounding משנה מעט את Risk.

---

# ‏137. `Minimum Order Size`

‏אם אחרי Risk Sizing מתקבלת עסקה זעירה, ייתכן שהיא כבר לא כדאית בגלל מינימום עמלה או עלויות קבועות.

‏לכן:

```text
risk_valid != economically_valid
```

---

# ‏138. Risk ו־Cost Engine צריכים לדבר

‏Sizing צריך לדעת:

```text
expected_round_trip_cost
```

‏כי עסקה קטנה מדי יכולה להיות בטוחה אך לא כלכלית.

---

# ‏139. Risk ו־Execution Engine צריכים לדבר

‏אם Execution דורש להיות Aggressive יותר, Expected Slippage גדל.

‏אז Risk יכול להקטין Size או לפסול את העסקה.

---

# ‏140. Risk ו־Scanner צריכים להיות מופרדים אבל מחוברים

‏ה־Scanner מעריך Opportunity.

‏Risk Engine מעריך Exposure.

‏Decision Engine משלב:

```text
Good opportunity
AND
acceptable risk
```

---

# ‏141. `Expected PnL` אינו Risk Limit

‏גם אם Expected Profit הוא $10, אסור להסיק שמותר להפסיד $10.

‏Expected Value ו־Risk Budget הם מושגים נפרדים.

---

# ‏142. `Reward/Risk Ratio`

‏ידע כללי:

```text
expected_reward / expected_risk
```

‏יכול להיות שימושי.

‏אבל במסחר שלך עם Exit מהיר ו־dynamic behavior, Reward ו־Risk הם Distributions ולא מספרים קבועים.

---

# ‏143. Distribution עדיפה על יחס יחיד

‏במקום:

```text
Reward/Risk = 2
```

‏נרצה לראות:

```text
P(win)
P(loss)
win distribution
loss distribution
MFE distribution
MAE distribution
```

---

# ‏144. `Expected Loss Conditional on Failure`

‏מדד שימושי:

> ‏כאשר העסקה לא עבדה — כמה הפסדנו בממוצע?

‏זה יכול לעזור ל־Sizing יותר מ־Average Trade כולל.

---

# ‏145. `Time-to-Failure`

‏לרובוט שלך כדאי למדוד:

```text
how fast losing trades reveal themselves
```

‏אם עסקאות רעות נחשפות כמעט תמיד תוך 4 שניות, זה מידע Risk חשוב.

---

# ‏146. `Time-to-Recovery`

‏גם:

```text
when a trade goes negative, how often does it recover?
```

‏זה יכול להשפיע על Time Stop ו־Exit Logic.

---

# ‏147. `MAE before MFE`

‏שאלה מחקרית חשובה:

> ‏כמה Drawdown טיפוסי מופיע לפני שמגיע הרווח?

‏אם עסקאות טובות בדרך כלל יורדות 0.02% לפני עלייה, Stop צמוד מדי יכול לחסל Edge אמיתי.

---

# ‏148. Risk אינו “Stop הכי קטן שאפשר”

‏Stop קטן מדי יכול:

- ‏להקטין הפסד לעסקה.
- ‏אבל גם להרוס Win Rate.

‏צריך לאזן לפי Distribution אמיתי.

---

# ‏149. Risk אינו “Stop הכי רחוק שאפשר”

‏Stop רחב מדי יכול להפוך הפסד רגיל להפסד גדול.

‏הפתרון הוא מחקר, לא קיצוניות.

---

# ‏150. `Risk of Missing the Trade`

‏כאשר Size קטן או Entry פסיבי מדי, אפשר להחמיץ הזדמנות.

‏זו לא סכנת הון, אבל זו Opportunity Cost.

‏לא מערבבים אותה עם Capital Risk, אבל כן מודדים.

---

# ‏151. `Risk of Chasing`

‏אם מחמיצים Fill ואז רודפים אחרי המחיר:

- ‏Entry גרוע יותר.
- ‏Edge קטן יותר.
- ‏Risk/Reward משתנה.

‏Risk Engine יכול להגדיר:

```text
max_entry_drift
```

---

# ‏152. `Risk of Stale Intent`

‏Order Intent שהיה תקף לפני 2 שניות אולי כבר אינו תקף.

‏לכן Risk Check חייב להיות סמוך ל־Submit.

---

# ‏153. `Risk Recheck after Partial Fill`

‏אם Filled רק חלק מהכמות:

```text
recalculate remaining risk
```

‏לא מניחים אוטומטית שהכמות שנותרה עדיין רצויה.

---

# ‏154. `Risk Recheck before Replace`

‏לפני שמעלים Limit כדי לקבל Fill:

```text
Does the new price still fit risk and edge budgets?
```

‏אם לא — מבטלים.

---

# ‏155. `Exit Risk` יכול להיות גדול מ־Entry Risk

‏בכניסה אפשר לבחור לא להיכנס.

‏אחרי שיש Position כבר חייבים לנהל Exposure.

‏לכן בזמן Position עדיפות ה־Risk Engine משתנה.

---

# ‏156. Position Monitoring קודם לסריקה

‏במערכת עמוסה:

```text
Position / Order Events
```

‏צריכים לקבל עדיפות על:

```text
Global Scanner Refresh
```

‏כי Exposure קיים חשוב יותר מהזדמנות חדשה.

---

# ‏157. `Risk Latency`

‏צריך למדוד:

```text
risk_check_duration
```

‏אבל לא לעקוף בדיקות כדי לחסוך מילישניות בלי הצדקה.

---

# ‏158. Precompute כשאפשר

‏אפשר לחשב מראש:

- ‏Symbol limits.
- ‏Liquidity bands.
- ‏Static restrictions.

‏כך Pre-Trade Risk Check נשאר מהיר.

---

# ‏159. Risk צריך להיות Deterministic

‏בהינתן אותו:

```text
state + intent + config
```

‏רצוי לקבל אותה החלטה.

‏זה קריטי ל־Replay ול־Debugging.

---

# ‏160. `Risk Snapshot`

‏לכל החלטה נשמור Snapshot של הנתונים שעליהם היא התבססה.

‏כך Backtest/Replay יכולים לשחזר אותה.

---

# ‏161. Unit Tests ל־Risk Engine

‏דוגמאות:

```text
Daily loss exceeded → reject
Unknown order state → reject
Size above max → clamp/reject
Stale data → reject
Normal state → approve
```

---

# ‏162. Property Tests

‏אפשר לבדוק תכונות כלליות:

> ‏הגדלת Requested Size לעולם לא צריכה להקטין את Calculated Risk.

‏או:

> ‏אם Risk State = LOCKED, שום Entry אינו מאושר.

---

# ‏163. Simulation של תקלות

‏צריך לבדוק:

- ‏Disconnect בזמן Position.
- ‏Duplicate fill message.
- ‏Order reject.
- ‏Partial fill ואז timeout.
- ‏Restart.
- ‏Stale feed.

‏לא רק Happy Path.

---

# ‏164. `Risk Invariants`

‏דוגמאות:

```text
No position above hard max
No new entry while LOCKED
No duplicate exposure for same intent
No trading on stale market state
No unresolved unknown order before new exposure
```

---

# ‏165. `Risk Dashboard`

‏בזמן אמת כדאי לראות:

```text
Equity
Buying Power
Gross Exposure
Open Positions
Pending Exposure
Daily PnL
Current Drawdown
Loss Streak
Risk State
Orders/minute
Risk rejects
```

---

# ‏166. Alerts

‏התראות חשובות:

- ‏Risk state changed.
- ‏Daily limit near threshold.
- ‏Position mismatch.
- ‏Unexpected fill.
- ‏Slippage spike.
- ‏Loss velocity spike.

---

# ‏167. `Early Warning` מול `Hard Stop`

‏עדיף לעיתים שתי רמות:

```text
Warning threshold
Hard threshold
```

‏למשל:

```text
70% of daily risk → warning
100% → stop
```

---

# ‏168. Best Practice — מגבלות ברורות ופשוטות

‏עדיף:

```text
5 well-understood hard limits
```

‏על פני:

```text
40 interacting rules nobody can explain
```

---

# ‏169. Best Practice — Risk לפני Optimization

‏לפני שמנסים להעלות PnL:

‏צריך לוודא שהמערכת יודעת:

- ‏לא לפתוח Size שגוי.
- ‏לעצור.
- ‏להתאושש.
- ‏להגיע ל־Flat.

---

# ‏170. Best Practice — Size קטן בזמן גילוי

‏כאשר האסטרטגיה עדיין במחקר Live:

> ‏המטרה הראשונה היא ללמוד, לא למקסם רווח.

‏Size קטן מאפשר לאסוף Evidence בעל עלות נמוכה יותר.

---

# ‏171. Best Practice — הפרדת Limits עסקיים וטכניים

## ‏Business Risk

```text
max loss
max exposure
max position
```

## ‏Technical Safety

```text
max orders/sec
stale data
unknown state
broker mismatch
```

‏שני הסוגים חשובים.

---

# ‏172. Best Practice — Risk אינו מקום ל־"AI improvisation"

‏אפשר להשתמש ב־AI למחקר והמלצות.

‏אבל Hard Risk Limits צריכים להיות:

- ‏מפורשים.
- ‏דטרמיניסטיים.
- ‏בדוקים.
- ‏ניתנים להסבר.

---

# ‏173. Anti-pattern — להגדיל Size אחרי הפסד כדי “להחזיר”

‏זה דומה ל־Martingale.

‏הוא יכול להגדיל Risk מהר מאוד.

‏אסור להפוך אותו לברירת מחדל של מערכת מקצועית.

---

# ‏174. Anti-pattern — להגדיל Size אחרי כמה Wins בלי Calibration

‏גם רצף רווחים אינו הוכחה שה־Edge השתפר.

‏יכול להיות Noise.

---

# ‏175. Anti-pattern — Size לפי תחושת ביטחון

```text
This setup looks amazing → double size
```

‏בלי Calibration הוא פשוט Risk נוסף.

---

# ‏176. Anti-pattern — Daily Stop שנמצא רק ב־UI

‏אם ה־UI נסגר, המגבלה לא צריכה להיעלם.

‏Risk Engine עצמו צריך לאכוף אותה.

---

# ‏177. Anti-pattern — Reset ידני שמוחק היסטוריה

‏אם מפעילים מחדש את המערכת, ה־Risk State היומי צריך להישאר עקבי.

---

# ‏178. Anti-pattern — לסמוך על Broker Limit בלבד

‏ברוקר יכול למנוע חריגה מסוימת.

‏אבל הוא אינו יודע את ה־Strategy Risk שלך.

‏צריך שכבת Risk עצמאית.

---

# ‏179. Anti-pattern — לחשוב ש־Stop מבטיח מחיר

‏Stop הוא Trigger/Order behavior.

‏ה־Fill עדיין תלוי בשוק.

---

# ‏180. Anti-pattern — לבנות Risk על Average בלבד

‏צריך גם Tail metrics.

---

# ‏181. Anti-pattern — להשתמש ב־Backtest Size גדול יותר מה־Liquidity ההיסטורית

‏זה יוצר רווחים תאורטיים שלא ניתן היה לבצע.

---

# ‏182. Anti-pattern — לשכוח Partial Fills

‏Risk צריך לעבוד גם ב־37%, 63% או 91% Filled.

---

# ‏183. Anti-pattern — לא לספור Working Orders

‏Order פתוח הוא Exposure פוטנציאלי.

---

# ‏184. Anti-pattern — לא לספור Cancel-in-flight

‏שלחנו Cancel אבל עוד אין אישור.

‏ה־Order עדיין עשוי להתבצע.

---

# ‏185. `Cancel Pending` הוא Exposure

‏עד שהברוקר מאשר שה־Order בוטל:

```text
assume it may still fill
```

---

# ‏186. רז מקצוע — הסיכון הכי מסוכן הוא לפעמים State שגוי

‏מחיר יכול לזוז 0.2% נגדך.

‏אבל אם המערכת חושבת שאין Position כאשר בפועל יש — כל ההחלטות הבאות יכולות להיות שגויות.

‏לכן State correctness הוא Risk Control.

---

# ‏187. רז מקצוע — קטן ומהיר לא אומר חסר Capacity Risk

‏גם $5,000 יכולים להיות גדולים במניה דלילה בזמן לא נכון.

‏תמיד מודדים Size ביחס לנזילות המקומית.

---

# ‏188. רז מקצוע — Loss Limit הוא גם Diagnostic Trigger

‏עצירה אינה רק מנגנון הגנה.

‏היא צריכה להפעיל:

```text
RCA
```

‏ולבדוק:

- ‏מה השתנה.
- ‏איזה Feature נכשל.
- ‏האם העלויות עלו.
- ‏האם Data השתבש.

---

# ‏189. רז מקצוע — Position Size הוא Hyperparameter מסוכן

‏אם בוחרים Size לפי Backtest PnL בלבד, קל לייצר תוצאה מטעה.

‏צריך לבדוק Stability, Slippage ו־Drawdown.

---

# ‏190. רז מקצוע — הסיכון של Strategy טובה יכול להיות Operational

‏אפילו Signal מושלם לא עוזר אם:

- ‏הפקודה נשלחה פעמיים.
- ‏הברוקר לא מסונכרן.
- ‏אי אפשר לצאת.

‏מערכת מקצועית מטפלת בזה באותה רצינות כמו במודל.

---

# ‏191. מה זה אומר עבור הרובוט שלך

‏Baseline סביר למחקר יכול להיות:

```text
1. Start with fixed small notional
2. One position at a time
3. Hard max position
4. Hard max daily loss
5. Max order rate
6. Fail closed on stale/unknown state
7. Always include working orders in exposure
8. Log every risk decision
9. Measure actual slippage and time-to-flat
10. Increase size only after evidence
```

‏זה Baseline למחקר — לא מספרי Size מומלצים.

---

# ‏192. למה להתחיל ב־Fixed Size יכול להיות חכם

‏בתחילת המחקר אנחנו רוצים לדעת:

> ‏האם ה־Signal עובד?

‏אם Size עצמו משתנה כל הזמן, קשה לדעת אם שינוי PnL הגיע מה־Signal או מה־Sizing.

‏לכן KISS:

```text
Simple size first
Dynamic sizing later
```

---

# ‏193. ואז מוסיפים Risk-aware Sizing

‏רק לאחר Baseline:

```text
Fixed Size
→ Liquidity Cap
→ Risk Cap
→ Volatility adjustment
→ maybe confidence adjustment
```

‏כל שכבה נבדקת בנפרד.

---

# ‏194. מדדים שצריך לשמור לכל Trade

```text
requested_notional
approved_notional
requested_quantity
approved_quantity
position_size
planned_risk
stress_risk
spread_at_entry
liquidity_at_entry
actual_entry_slippage
actual_exit_slippage
max_adverse_excursion
max_favorable_excursion
time_to_flat
realized_net_pnl
risk_state
risk_model_version
```

---

# ‏195. מדדי Risk יומיים

```text
trades
wins
losses
net_pnl
peak_pnl
drawdown
max_drawdown
loss_streak
max_loss_trade
p95_loss
p99_loss
gross_exposure_peak
orders_sent
risk_rejects
kill_switch_events
```

---

# ‏196. שאלות RCA אחרי הפסד חריג

1. ‏האם Position Size היה לפי הכללים?
2. ‏האם Liquidity השתנתה?
3. ‏האם Exit הופעל בזמן?
4. ‏האם Slippage היה חריג?
5. ‏האם היה Delay?
6. ‏האם Signal עצמו היה שגוי?
7. ‏האם היה State mismatch?
8. ‏האם אירוע דומה קרה בעבר?
9. ‏האם Risk Rule היה חסר?
10. ‏האם צריך לתקן מודל, Execution או Operations?

---

# ‏197. שאלות RCA אחרי יום הפסדי

‏לא שואלים רק:

> ‏"איזה Trade היה גרוע?"

‏שואלים:

```text
Did the distribution change?
Did execution costs change?
Did ranking quality degrade?
Did regime change?
Did one symbol dominate losses?
Did loss velocity spike?
Did the system violate any invariant?
```

---

# ‏198. Separation of Concerns

‏ארכיטקטורה מומלצת רעיונית:

```text
Market Data
    ↓
Scanner
    ↓
Decision Engine
    ↓
Risk Engine
    ↓
Execution Engine
    ↓
Broker
```

‏ובמקביל:

```text
Broker / Positions / Orders
    ↓
Risk Engine
```

‏כלומר Risk Engine מקבל אמת גם מהברוקר ולא רק מהמודל.

---

# ‏199. כלל זהב

> ‏ה־Scanner רשאי להציע עסקה. ה־Risk Engine מחליט כמה, ואם בכלל, מותר לסכן.

---

# ‏200. סיכום השלב

‏בשלב הזה למדנו:

- ‏`Position Size` אינו `Risk per Trade`.
- ‏Stop אינו מבטיח Maximum Loss.
- ‏Liquidity, Slippage ו־Operational Risk הם חלק מהסיכון.
- ‏צריך Risk Budget בכמה שכבות.
- ‏צריך מגבלות Trade, Day, Strategy ו־Account.
- ‏Working/Pending Orders הם Exposure.
- ‏Unknown State הוא Risk State.
- ‏Risk Engine צריך להיות עצמאי מה־Scanner.
- ‏Daily Loss, Loss Velocity ו־Drawdown הם מנגנוני הגנה וגם Signals דיאגנוסטיים.
- ‏Sizing צריך להיות מוגבל לפי Capital, Risk ו־Liquidity.
- ‏Dynamic Sizing מגיע רק אחרי Baseline פשוט.
- ‏Live execution data חייב לחזור למודל הסיכון.
- ‏Risk State צריך לשרוד Restart.
- ‏Kill Switch, Pause ו־Exit Only צריכים להיות States מפורשים.
- ‏המערכת צריכה להיות מסוגלת להסביר בדיעבד למה אושרה Quantity מסוימת.

‏והרעיון המרכזי ביותר:

> ‏המטרה של Risk Management אינה למנוע הפסדים. הפסדים הם חלק ממסחר. המטרה היא לוודא שטעות אחת, רצף רע, אירוע חריג או Bug אינם מקבלים רשות להפוך לנזק בלתי נשלט.

---

# ‏תרגיל מחשבתי

‏נניח שה־Scanner בחר את `XYZ` במקום הראשון.

```text
Price = $25
Requested Position = $5,000
Quantity = 200
Expected Edge = 0.12%
Spread = 0.03%
Expected Exit Slippage = 0.02%
Liquidity near market = 120 shares
Daily PnL = -$40
Loss streak = 4
```

‏אל תשאל רק:

> ‏"האם לקנות?"

‏פרק את ההחלטה:

```text
1. Is the opportunity still valid?
2. Is 200 shares executable?
3. What is expected net edge after costs?
4. What is the expected adverse loss?
5. What quantity does liquidity allow?
6. What quantity does risk budget allow?
7. Does the current loss streak change risk state?
8. Is daily loss close to a hard limit?
9. What is final approved quantity?
10. Is the correct answer actually NO TRADE?
```

‏זו החשיבה שאנו רוצים לבנות בתוך ה־Risk Engine.