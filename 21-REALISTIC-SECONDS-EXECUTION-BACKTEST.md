# ‏שלב 21 — `Backtest` ריאליסטי למסחר של שניות: מ־Signal ל־Fill שאפשר להאמין לו

> ‏מטרת הפרק: להפוך `Backtest` לוגי למודל ביצוע שמנסה לענות על השאלה הקשה באמת: **אילו עסקאות היו יכולות להתבצע בפועל, באיזה מחיר, באיזה זמן ובאיזו כמות?**
>
> ‏העיקרון המרכזי: במסחר של שניות, טעות של כמה עשרות או מאות מילישניות, שימוש ב־`Last` במקום ב־`Bid/Ask`, או הנחה שפקודת `Limit` התמלאה רק משום שהמחיר נגע בה — יכולים להפוך אסטרטגיה מפסידה לאסטרטגיה שנראית רווחית.
>
> ‏כמו בכל הקורס: קודם נלמד את הידע המקצועי הכללי, אחר כך את ה־Best Practices ורזי המקצוע, ולבסוף נתאים אותו לרובוט שלך — סריקה של כל השוק והחזקה של שניות בודדות ועד בערך דקה.

---

# ‏1. מה השתנה מאז שלב 20?

‏בשלב 20 שאלנו:

> ‏האם המחקר מכבד את הזמן ולא משתמש במידע מהעתיד?

‏עכשיו אנחנו שואלים:

> ‏גם אם ההחלטה הייתה חוקית בזמן — האם באמת היה אפשר לבצע אותה?

‏אלה שתי בעיות שונות.

---

# ‏2. `Signal Backtest` לעומת `Execution Backtest`

‏`Signal Backtest` בודק בעיקר:

```text
Signal at T
Future return after T
```

‏`Execution Backtest` צריך לדמות לפחות:

```text
Signal
Decision delay
Order construction
Submit delay
Market state at arrival
Fill / no fill / partial fill
Position
Exit decision
Exit order
Exit fill
Costs
Net PnL
```

‏לכן הוא קשה יותר — אבל גם קרוב יותר למציאות.

---

# ‏3. למה זה קריטי במיוחד לטווח של שניות

‏אם ה־Edge שלך נמשך שעות, סטייה של 200ms בדרך כלל פחות חשובה.

‏אם ה־Edge שלך אמור להופיע בתוך:

```text
2s
5s
10s
```

‏אז 200ms יכולים להיות חלק משמעותי מחיי הסיגנל.

‏לכן:

> ‏ככל ש־`Signal Half-Life` קצר יותר, איכות סימולציית הביצוע חשובה יותר.

---

# ‏4. הטעות המסוכנת ביותר: לקנות לפי `Last`

‏נניח בזמן הסיגנל:

```text
Last = 100.00
Bid  = 99.99
Ask  = 100.03
```

‏Backtest נאיבי אומר:

```text
Entry = 100.00
```

‏אבל קנייה מיידית כנראה דורשת התייחסות ל־`Ask`, לא ל־`Last`.

‏כבר נוצר פער:

```text
+0.03 per share
```

‏עוד לפני עמלות ו־slippage.

---

# ‏5. `Last` אינו מחיר ביצוע

‏`Last` מספר באיזה מחיר התבצעה עסקה קודמת.

‏הוא אינו מבטיח שאתה יכול:

- ‏לקנות שם.
- ‏למכור שם.
- ‏לקנות את הכמות שלך שם.
- ‏לקבל אותו מחיר כמה מילישניות אחר כך.

‏לכן `Last` הוא Market Data חשוב, אבל אינו `Fill Model`.

---

# ‏6. בסיס מינימלי: Side-aware pricing

‏ב־Backtest בסיסי אך יותר מציאותי:

```text
Buy aggressive  -> use Ask side
Sell aggressive -> use Bid side
```

‏זה עדיין פשטני.

‏אבל הוא כבר עדיף משמעותית על:

```text
Buy = Last
Sell = Last
```

---

# ‏7. שלוש רמות בסיסיות של מחיר

‏נוח להפריד בין:

```text
Reference Price
Executable Price
Actual Simulated Fill Price
```

‏לדוגמה:

```text
Reference = Mid
Executable = Ask
Fill = Ask + modeled slippage
```

‏ההפרדה הזאת חשובה ל־RCA.

---

# ‏8. `Mid` גם אינו Fill

‏`Mid` שימושי למדידת שווי רגעי:

```text
Mid = (Bid + Ask) / 2
```

‏אבל בדרך כלל אי אפשר להניח שכל פקודה תתמלא בדיוק ב־Mid.

‏אם Backtest קונה תמיד ב־Mid ומוכר תמיד ב־Mid, הוא עלול להיות אופטימי מאוד.

---

# ‏9. `Quote` חייב להיות נכון לזמן ההגעה

‏טעות נוספת:

```text
Signal at 10:00:00.000
Use Ask from 10:00:00.000
Fill immediately
```

‏בפועל יש זמן בין:

```text
Signal
Decision
Order submit
Broker processing
Routing
Venue arrival
```

‏לכן צריך להסתכל על מצב השוק בזמן שבו הפקודה **יכלה להגיע**, לא רק בזמן הסיגנל.

---

# ‏10. `Latency Budget`

‏אפשר לפרק Latency לרכיבים:

```text
Market data latency
Processing latency
Scanner latency
Decision latency
Application latency
Network latency
Broker latency
Routing latency
Venue latency
```

‏לא תמיד נדע כל רכיב בדיוק.

‏אבל כדאי שהמודל יאפשר לייצג אותם.

---

# ‏11. `Signal-to-Order` לעומת `Order-to-Fill`

‏שני מדדים שונים:

```text
Signal-to-Order = זמן מהסיגנל עד שליחת הפקודה
Order-to-Fill   = זמן מהשליחה עד הביצוע
```

‏והכול יחד:

```text
Signal-to-Fill
```

‏זה מדד קריטי במיוחד אצלך.

---

# ‏12. אל תשתמש במספר Latency יחיד בלבד

‏Latency אמיתי אינו תמיד:

```text
100ms
100ms
100ms
100ms
```

‏יש `Jitter`.

‏לכן במחקר מתקדם כדאי לבדוק התפלגות:

```text
P50
P90
P95
P99
```

‏ולא רק ממוצע.

---

# ‏13. למה `P99` מעניין

‏אסטרטגיה יכולה להרוויח ברוב העסקאות אבל להיפגע מאוד כאשר מערכת מאטה מדי פעם.

‏לדוגמה:

```text
95% orders: 120ms
5% orders: 900ms
```

‏אותם 5% עלולים להיות בדיוק הרגעים שבהם השוק עמוס ומהיר.

---

# ‏14. Latency יכול להיות תלוי Regime

‏זו נקודה מתקדמת.

‏לא בטוח ש־Latency בלתי תלוי בשוק.

‏בזמן עומס:

- ‏יש יותר Market Data.
- ‏יש יותר Events.
- ‏המערכת שלך עסוקה יותר.
- ‏הברוקר עשוי להיות עמוס יותר.
- ‏המחיר עצמו זז מהר יותר.

‏כלומר דווקא כשהסיגנל הכי מעניין — הביצוע יכול להיות קשה יותר.

---

# ‏15. `Slippage`

‏`Slippage` הוא ההבדל בין מחיר הייחוס לבין מחיר הביצוע בפועל.

‏לדוגמה:

```text
Expected Ask = 50.00
Fill         = 50.02
```

‏אז יש:

```text
$0.02 adverse slippage per share
```

---

# ‏16. Slippage אינו קבוע

‏מודל כמו:

```text
slippage = $0.01 always
```

‏יכול להיות שימושי כ־Baseline.

‏אבל הוא אינו מתאר עולם אמיתי.

‏Slippage עשוי להשתנות לפי:

- ‏Spread.
- ‏Depth.
- ‏Order size.
- ‏Volatility.
- ‏Momentum speed.
- ‏Time of day.
- ‏Execution mode.
- ‏Market regime.

---

# ‏17. מודל Slippage מדורג

‏אפשר לבנות כמה רמות:

```text
Level 0: no slippage
Level 1: fixed slippage
Level 2: spread-based slippage
Level 3: size/depth-aware slippage
Level 4: event/replay-based execution
```

‏זו דרך טובה להתקדם בלי לנסות לבנות Exchange Simulator ביום הראשון.

---

# ‏18. `Best / Base / Stress`

‏לכל Backtest ביצוע כדאי להריץ לפחות שלושה תרחישים:

```text
Best case
Base case
Stress case
```

‏לדוגמה:

```text
Best:   100ms latency, little slippage
Base:   250ms latency, normal slippage
Stress: 750ms latency, wider slippage
```

‏המספרים עצמם חייבים להיקבע מנתונים ולא מהדוגמה.

---

# ‏19. למה Stress חשוב

‏אם האסטרטגיה רווחית רק תחת:

```text
perfect fills
zero latency
zero slippage
```

‏אין לנו הרבה מרווח ביטחון.

‏Edge חזק יותר הוא Edge ששורד הידרדרות סבירה בהנחות הביצוע.

---

# ‏20. `Market Order` בסימולציה

‏פקודת Market אינה אומרת:

```text
Fill at best Ask
```

‏אלא:

> ‏בצע נגד הנזילות הזמינה עד שהכמות מתמלאת.

‏אם הכמות גדולה מה־Top of Book, ייתכן שנצרוך כמה רמות.

---

# ‏21. דוגמת Sweep פשוטה

‏ספר פקודות:

```text
Ask 100.01 x 100
Ask 100.02 x 150
Ask 100.04 x 500
```

‏אנחנו רוצים לקנות:

```text
200 shares
```

‏Fill משוער:

```text
100 @ 100.01
100 @ 100.02
```

‏Average Fill:

```text
100.015
```

‏לא 100.01.

---

# ‏22. `VWAP` של ה־Fill

‏מחיר Fill ממוצע משוקלל:

```text
fill_vwap = Σ(price_i * qty_i) / Σ(qty_i)
```

‏זה המחיר הנכון יותר לפוזיציה שנבנתה בכמה Fills.

---

# ‏23. `Top of Book` אינו מספיק תמיד

‏אם יש לנו רק Level 1:

```text
Bid
Ask
BidSize
AskSize
```

‏אפשר לבנות מודל מוגבל.

‏אבל אי אפשר לדעת בדיוק מה היה קורה אחרי שמסיימים את הכמות ברמה הראשונה.

‏לכן צריך לסמן את מגבלת ה־Fidelity.

---

# ‏24. Backtest חייב להודות במה שהוא לא יודע

‏עיקרון מקצועי חשוב:

> ‏חוסר מידע אינו רישיון להמציא Fill נוח.

‏אם אין Depth, אפשר:

- ‏להשתמש במודל שמרני.
- ‏להגביל Order Size.
- ‏לפסול את התצפית.
- ‏להריץ Range של הנחות.

‏אבל לא להעמיד פנים שיש לנו Level 2 שלא קיים.

---

# ‏25. `Limit Order` קשה יותר לסימולציה

‏נניח:

```text
Buy Limit = 100.00
```

‏ואחר כך Trade הודפס ב־100.00.

‏האם אנחנו התמלאנו?

‏לא בהכרח.

---

# ‏26. למה Touch אינו Fill

‏ייתכן שהיו לפנינו בתור:

```text
50,000 shares
```

‏והעסקה שהתבצעה הייתה רק:

```text
1,000 shares
```

‏המחיר נגע ב־Limit שלנו — אבל לא הגיע אלינו.

---

# ‏27. הטעות הקלאסית

‏Backtest נאיבי:

```text
if market_price <= buy_limit:
    filled = true
```

‏ל־Limit Order זה לעיתים אופטימי מאוד.

---

# ‏28. `Queue Position`

‏בפקודה Passive צריך לחשוב על:

```text
queue_ahead
```

‏כלומר כמה כמות נמצאת לפנינו באותו מחיר.

‏אם הכמות לפנינו לא נסחרה/בוטלה מספיק — אנחנו לא מתמלאים.

---

# ‏29. למה Queue Position קשה לדעת

‏גם עם Level 2 לא תמיד יודעים הכול בצורה מושלמת:

- ‏Hidden liquidity.
- ‏Reserve orders.
- ‏Order cancellations.
- ‏Venue-specific behavior.
- ‏אין תמיד Order-level identity.

‏לכן Queue Simulation היא בדרך כלל approximation.

---

# ‏30. רמות Queue Modeling

‏אפשר לחשוב על:

```text
Q0: Touch = Fill        (optimistic)
Q1: Trade-through only
Q2: Volume-ahead model
Q3: Level-2 queue approximation
Q4: Order-level replay, if available
```

‏ככל שעולים ברמה, הדרישות לנתונים ולמורכבות עולות.

---

# ‏31. `Trade-through` כמודל שמרני יותר

‏במקום למלא כאשר השוק רק נוגע במחיר שלנו, אפשר לדרוש שהמחיר באמת יעבור דרכו.

‏לדוגמה:

```text
Buy Limit = 100.00
```

‏Touch:

```text
Low = 100.00
```

‏אינו מספיק.

‏אבל אם עסקאות מתבצעות מתחת:

```text
99.99
```

‏יש בסיס חזק יותר להניח שהיה סיכוי ל־Fill.

‏עדיין זו approximation.

---

# ‏32. `Volume Ahead Model`

‏מודל טוב יותר יכול לשמור:

```text
estimated_queue_ahead = displayed_size_at_join
```

‏ולאחר מכן להפחית:

```text
executed_volume_at_price
estimated_cancellations_ahead
```

‏רק כשהתור המשוער מגיע אלינו — לאפשר Fill.

---

# ‏33. אל תניח שכל Cancellation עוזר לך

‏אם כמות נעלמה מהספר, לא תמיד יודעים אם היא הייתה:

- ‏לפניך.
- ‏מאחוריך.
- ‏Hidden/Reserve.

‏לכן צריך מודל עם הנחות מפורשות.

---

# ‏34. Queue Uncertainty

‏במקום תשובה בינארית:

```text
filled / not filled
```

‏אפשר במחקר מתקדם לייצר:

```text
optimistic queue model
base queue model
pessimistic queue model
```

‏ולבדוק האם התוצאה שורדת את שלושתם.

---

# ‏35. `Partial Fill`

‏Fill אינו תמיד הכל או כלום.

‏יכול להיות:

```text
Requested = 200
Filled    = 73
Remaining = 127
```

‏ומאותו רגע יש לנו כבר Position אמיתי של 73 מניות.

---

# ‏36. למה Partial Fill משנה את האסטרטגיה

‏הוא משפיע על:

- ‏PnL.
- ‏Risk.
- ‏Average Fill Price.
- ‏Exit quantity.
- ‏Fees.
- ‏Order state.
- ‏החלטה אם להמשיך לחכות.

---

# ‏37. אל תמחק Partial Fill

‏Backtest שאומר:

```text
if not fully_filled:
    ignore_trade
```

‏יכול להיות שגוי.

‏אם 40% מהכמות התמלאה, זו עסקה אמיתית שצריך לנהל.

---

# ‏38. `Fill Ledger`

‏כדאי לשמור כל Fill בנפרד:

```text
order_id
fill_id
timestamp
price
quantity
venue
fee
liquidity_flag
```

‏אם חלק מהשדות אינם זמינים במחקר, מסמנים זאת במפורש.

---

# ‏39. `Order Lifetime`

‏פקודה קיימת בזמן.

‏צריך להגדיר:

```text
created_at
submitted_at
active_from
expires_at
cancel_requested_at
cancel_confirmed_at
```

‏בלי זה, אי אפשר לסמלץ נכון Order חי.

---

# ‏40. `TTL` לפקודה

‏למשל:

```text
Order TTL = 500ms
```

‏אם לא התמלאה בזמן הזה, ייתכן שהאלגוריתם מבטל.

‏אבל חשוב:

> ‏בקשת ביטול אינה ביטול מיידי.

---

# ‏41. `Cancel Latency`

‏יש זמן בין:

```text
Cancel Request
```

‏לבין:

```text
Cancel Confirmed
```

‏בחלון הזה עדיין עלול להגיע Fill.

---

# ‏42. Race Condition קלאסי

```text
T0: cancel requested
T1: fill occurs
T2: cancel acknowledgement arrives
```

‏אם הסימולטור מוחק את הפקודה ב־T0, הוא מפספס Fill אפשרי.

---

# ‏43. `Cancel/Replace`

‏Replace אינו רק שינוי מספר בשדה.

‏בפועל יכול להיות רצף:

```text
cancel old
submit new
```

‏או מנגנון Broker/Venue אחר.

‏למחקר חשוב לייצג לפחות:

```text
old order active until confirmed otherwise
new order has its own arrival time
```

---

# ‏44. מחיר השינוי: Queue Priority

‏כאשר משנים מחיר או פרמטרים מסוימים, ייתכן שנאבד קדימות.

‏לכן אסטרטגיית:

```text
always chase best bid
```

‏אינה בחינם.

‏היא יכולה להשאיר אותנו שוב ושוב בסוף תור חדש.

---

# ‏45. `Order Chasing`

‏נניח:

```text
Bid: 100.00
We join 100.00
Bid moves to 100.01
We replace to 100.01
Bid moves to 100.02
We replace again
```

‏Backtest שלא מדמה Queue/latency עלול לחשוב שאנחנו תמיד במקום טוב.

‏במציאות אנחנו אולי תמיד מאחרים.

---

# ‏46. `Max Chase`

‏ב־Execution Model צריך להגדיר מגבלה:

```text
max_entry_drift
max_number_of_reprices
max_order_age
```

‏אחרת המודל יכול “להשיג” כל מחיר בדיעבד.

---

# ‏47. `Marketable Limit`

‏במקום Market לא מוגבל, אפשר לסמלץ:

```text
Buy Limit >= current Ask
```

‏הפקודה יכולה לבצע מיד עד מחיר ה־Limit.

‏זה נותן תקרת מחיר — אבל עדיין דורש Depth/Fills נכונים.

---

# ‏48. `IOC`

‏לוגיקה אפשרית:

```text
execute what is immediately available
cancel remainder
```

‏זה חשוב כאשר איננו רוצים להמתין בתור עם Signal קצר־חיים.

---

# ‏49. Backtest של `IOC`

‏צריך לדעת מה היה זמין **בזמן ההגעה**.

‏לא מה היה זמין בזמן יצירת הסיגנל.

‏ולא מה הופיע 300ms אחר כך.

---

# ‏50. `Post Only`

‏ב־Backtest מתקדם אפשר לייצג כוונה:

> ‏אל תיקח נזילות מיד; אם הפקודה הייתה חוצה, דחה/התאם לפי חוקי ה־Venue/Broker.

‏ההתנהגות המדויקת יכולה להשתנות בין מערכות, ולכן צריך Adapter/Model ספציפי כשנגיע ל־Live fidelity.

---

# ‏51. `Pegged Orders`

‏פקודה Pegged יכולה לזוז עם Reference כמו Bid/Mid/Ask.

‏לכן היא אינה Limit סטטי.

‏Backtest צריך לייצג:

```text
reference update
new effective price
queue implications
execution opportunity
```

---

# ‏52. אל תסמלץ Order Type שהנתונים שלך לא יכולים לתמוך בו

‏אם אין לך מספיק מידע כדי לדעת איך Peg/Hidden/Midpoint Order היה מתנהג, עדיף:

- ‏להשתמש במודל שמרני.
- ‏להשאיר אותו למחקר מתקדם יותר.
- ‏לבדוק ב־Paper/Shadow.

‏לא להמציא ודאות.

---

# ‏53. `Execution Model` צריך להיות Plugin

‏ארכיטקטורה טובה:

```text
Strategy
  -> OrderIntent
  -> ExecutionModel
  -> SimulatedBroker
  -> FillEvents
```

‏כך אפשר להחליף:

```text
SimpleQuoteModel
DepthAwareModel
QueueAwareModel
LiveBrokerAdapter
```

‏בלי לשנות את ה־Strategy.

---

# ‏54. למה ההפרדה הזאת חשובה

‏אם Strategy יודעת בעצמה “איך Fill עובד”, נוצר ערבוב בין:

```text
Alpha Logic
```

‏לבין:

```text
Execution Assumption
```

‏ואז קשה לדעת מי מהם יצר את הרווח.

---

# ‏55. אותו Signal, כמה Execution Models

‏זה ניסוי מצוין:

```text
Model A: optimistic
Model B: base
Model C: pessimistic
```

‏אותם Signals בדיוק.

‏אם PnL משתנה דרמטית — האסטרטגיה רגישה מאוד לביצוע.

---

# ‏56. `Execution Sensitivity`

‏אפשר למדוד:

```text
PnL(latency=100ms)
PnL(latency=250ms)
PnL(latency=500ms)
PnL(latency=1000ms)
```

‏ולראות את עקומת דעיכת ה־Edge.

---

# ‏57. `Latency Break-Even`

‏שאלה שימושית:

> ‏באיזה Latency צפוי ה־Net Edge לרדת לאפס?

‏זה מידע הרבה יותר שימושי מאשר רק:

```text
Backtest PnL = $X
```

---

# ‏58. `Slippage Break-Even`

‏אותה שאלה לגבי Slippage:

> ‏כמה adverse slippage העסקה יכולה לספוג לפני שה־EV נעשה אפס?

---

# ‏59. `Fill-Rate Break-Even`

‏אסטרטגיה Passive יכולה להיראות מצוינת כאשר מניחים:

```text
Fill Rate = 100%
```

‏אבל מה קורה ב־:

```text
80%
50%
30%
```

‏חשוב לבדוק.

---

# ‏60. Selection Bias של Fills

‏זה רז מקצוע חשוב.

‏עסקאות Passive שמתמלאות אינן מדגם אקראי.

‏לעיתים אתה מקבל Fill דווקא כאשר מישהו רוצה מאוד לסחור נגדך.

‏זה נקרא בהקשר רחב:

`Adverse Selection`

---

# ‏61. למה Fill Rate גבוה אינו בהכרח טוב

‏אם אתה תמיד מתמלא, אולי המחיר ממשיך מיד נגדך.

‏לכן צריך למדוד יחד:

```text
Fill Rate
Post-Fill Markout
Net PnL
```

---

# ‏62. `Markout`

‏אחרי Fill נמדוד למשל:

```text
markout_100ms
markout_500ms
markout_1s
markout_5s
```

‏עבור Buy:

```text
future_mid - fill_price
```

‏או הגדרה עקבית אחרת.

---

# ‏63. Markout עוזר להפריד שתי בעיות

‏אם Fill גרוע ואחר כך המחיר ממשיך לטובתנו:

‏ייתכן שה־Signal טוב וה־Execution יקר.

‏אם Fill מתקבל ומיד המחיר נע נגדנו:

‏ייתכן שיש `Adverse Selection` או Signal מאוחר.

---

# ‏64. `Missed Trade` הוא גם תוצאה

‏אם Limit לא התמלא — אל תמחק את האירוע.

‏שמור:

```text
signal
order
not_filled
future_path
```

‏כדי ללמוד מה החמצנו.

---

# ‏65. Opportunity Cost של אי־Fill

‏אפשר למדוד:

> ‏כמה היה מרוויח Signal אילו היינו נכנסים באופן אגרסיבי יותר?

‏זה מאפשר להשוות:

```text
Passive savings
vs
Missed opportunity
```

---

# ‏66. `Counterfactual Execution`

‏לאותו Signal אפשר להריץ:

```text
Passive Limit
Marketable Limit
IOC
Aggressive execution
```

‏ולראות מי נותן Net EV גבוה יותר.

‏זה מחקר Execution — לא שינוי Scanner.

---

# ‏67. Entry ו־Exit חייבים להשתמש באותו סטנדרט

‏אסור:

```text
Entry = realistic Ask + slippage
Exit  = convenient Last
```

‏או להפך.

‏שני הצדדים חייבים לקבל מודל עקבי.

---

# ‏68. Exit לעיתים קשה יותר מ־Entry

‏בכניסה אפשר לבחור:

```text
NO TRADE
```

‏כשכבר יש Position, לפעמים חייבים לצאת גם בתנאים גרועים.

‏לכן Exit Slippage יכול להיות שונה מ־Entry Slippage.

---

# ‏69. `Urgency` משנה Execution

‏אפשר להגדיר:

```text
NORMAL
URGENT
EMERGENCY
```

‏ולכל רמה Execution Model אחר.

‏למשל Emergency יכול להיות מוכן לשלם יותר כדי להגיע ל־Flat.

---

# ‏70. `Time-to-Flat`

‏מדד חשוב:

```text
exit_decision_time -> final_flat_time
```

‏לא רק מחיר היציאה.

‏אם לוקח זמן רב לסגור Position, זה סיכון בפני עצמו.

---

# ‏71. Position בזמן Partial Exit

‏אם היינו עם:

```text
100 shares
```

‏ומכרנו רק:

```text
40
```

‏עדיין נשאר:

```text
60 shares exposure
```

‏ה־Backtest חייב לשמור את זה במדויק.

---

# ‏72. Event Ordering

‏באותו Timestamp יכולים להיות:

- ‏Quote update.
- ‏Trade.
- ‏Order arrival.
- ‏Fill.
- ‏Cancel.

‏צריך Rule דטרמיניסטי לסדר האירועים.

---

# ‏73. אל תפתור Tie לפי מה שנוח ל־PnL

‏אם מקור הנתונים לא נותן סדר מדויק בתוך אותה יחידת זמן, צריך:

- ‏להגדיר Conservative ordering.
- ‏להריץ כמה הנחות.
- ‏או להודות שהאירוע Ambiguous.

---

# ‏74. Timestamp Resolution

‏אם הנתונים הם כל:

```text
1 second
```

‏אי אפשר להסיק בוודאות מה קרה בתוך אותה שנייה בסדר של מילישניות.

‏זה גבול מידע אמיתי.

---

# ‏75. Snapshot Data מול Event Data

‏Snapshot של 1 שנייה אומר:

```text
state at t0
state at t1
```

‏אבל אינו מספר את כל המסלול ביניהם.

‏Event Data יכול להכיל הרבה יותר פרטים.

---

# ‏76. למה Snapshot עלול להסתיר בעיה

‏נניח:

```text
10:00:00 Ask = 100.00
10:00:01 Ask = 100.00
```

‏בתוך השנייה הוא אולי היה:

```text
100.00 -> 100.20 -> 99.90 -> 100.00
```

‏Snapshot בלבד לא יספר לנו.

---

# ‏77. אל תעמיד פנים ש־10s Sampling מתאים לסימולציית 100ms

‏אם Data נמדד כל 10 שניות, אין לנו בסיס לדמות Fill ברמת 100ms בדיוק גבוה.

‏אפשר עדיין לעשות מחקר Momentum.

‏אבל Fidelity של Execution תהיה מוגבלת.

---

# ‏78. Data Fidelity חייב להתאים ל־Holding Horizon

‏כלל שימושי:

> ‏ככל שזמן ההחזקה קצר יותר, רזולוציית הנתונים הנדרשת למחקר ביצוע צריכה להיות גבוהה יותר.

---

# ‏79. `Trade Data` ו־`Quote Data` יחד

‏Trades עוזרים להבין:

- ‏מה באמת נסחר.
- ‏כמה נפח עבר.

‏Quotes עוזרים להבין:

- ‏מה היה ניתן לקנייה/מכירה.
- ‏Spread.
- ‏Depth.

‏ביצוע רציני נהנה משניהם.

---

# ‏80. Trade Conditions

‏לא כל Print בהכרח צריך להתפרש כאירוע רגיל שמספק Queue.

‏קיימים סוגים ותנאים שונים של עסקאות.

‏לכן Feed עשיר צריך לשמור גם metadata/conditions ולהגדיר מדיניות normalization.

---

# ‏81. Out-of-Order Events

‏אם אירוע מאוחר מגיע עם timestamp מוקדם יותר, Replay חייב לדעת מה לעשות.

‏אחרת אפשר לייצר:

- ‏Fill שקרי.
- ‏Signal שקרי.
- ‏Book state לא אפשרי.

---

# ‏82. Sequence Numbers

‏אם Feed מספק Sequence Number, הוא יכול לעזור מאוד בשחזור סדר האירועים וזיהוי gaps.

‏צריך לשמור אותו ב־Raw Data כאשר זמין.

---

# ‏83. Missing Events

‏אם יש Gap בנתונים:

```text
sequence 1001
sequence 1002
sequence 1010
```

‏ייתכן שחסרים אירועים.

‏אסור להתייחס ל־Book כאילו הוא ודאי נכון.

---

# ‏84. `Data Integrity Gate`

‏לפני Backtest execution אפשר לדרוש:

```text
no sequence gaps
acceptable timestamp monotonicity
valid spread
valid sizes
fresh quote
```

‏או לסמן את הקטע כ־low confidence.

---

# ‏85. `Locked` ו־`Crossed` Markets

‏לפעמים Data יכול להראות:

```text
Bid == Ask
```

‏או אפילו:

```text
Bid > Ask
```

‏צריך להבין אם זה:

- ‏מצב שוק אמיתי קצר.
- ‏שילוב Venues.
- ‏Latency בין feeds.
- ‏Data issue.

‏לא פשוט “לתקן” מספרים כדי שה־Backtest יעבוד.

---

# ‏86. `NBBO` מול Feed חלקי

‏אם Feed מכסה רק Venue מסוים, ה־Bid/Ask שרואים אינו בהכרח השוק הלאומי המלא.

‏לכן חייבים לתעד:

```text
feed_scope
```

‏ולא להשוות Backtest על Feed אחד כאילו הוא בהכרח זהה ל־Execution Broker.

---

# ‏87. Cross-provider mismatch

‏אם Scanner משתמש בספק A והביצוע בברוקר B, ייתכנו הבדלים ב־:

```text
timestamps
quotes
coverage
conditions
latency
```

‏Backtest מתקדם צריך להיות מודע לזה.

---

# ‏88. `Market Data Arrival Time`

‏יש הבדל בין:

```text
exchange/event timestamp
```

‏לבין:

```text
time our system received it
```

‏Live Strategy פועלת לפי מה שהגיע אליה — לא לפי זמן תיאורטי בלבד.

---

# ‏89. שני סוגי Replay

## ‏`Exchange-Time Replay`

‏מסדר אירועים לפי זמן המקור.

## ‏`Received-Time Replay`

‏מנסה לשחזר מה המערכת שלנו ידעה בפועל ומתי.

‏השני עשוי להיות רלוונטי במיוחד ל־Live parity.

---

# ‏90. `Processing Delay`

‏גם אחרי שהמידע הגיע, המערכת צריכה:

- ‏לעדכן state.
- ‏לחשב Features.
- ‏לסנן.
- ‏לדרג.
- ‏להחליט.

‏זה זמן.

‏Backtest אולטרה־מהיר לא צריך להניח שכל החישוב הוא 0ns.

---

# ‏91. Measure Before Guess

‏Best Practice:

‏ברגע שיש מערכת Prototype, למדוד בפועל:

```text
feature_compute_latency
ranking_latency
decision_latency
submit_latency
ack_latency
fill_latency
```

‏ואז להזין את ההתפלגויות חזרה ל־Backtest.

---

# ‏92. Live → Simulation Calibration

‏אחת הלולאות החשובות ביותר:

```text
Paper/Live measurements
        ↓
Execution model calibration
        ↓
More realistic backtest
        ↓
Better expectations
```

---

# ‏93. `Calibration Dataset`

‏אפשר לשמור כל Order אמיתי/נייר עם:

```text
market_state_at_signal
market_state_at_submit
market_state_at_fill
requested_qty
filled_qty
fill_price
latencies
spread
depth
```

‏וממנו לכייל מודלים.

---

# ‏94. `Simulation Error`

‏כאשר יש Paper/Live, אפשר להשוות:

```text
simulated_fill
vs
observed_fill
```

‏ולמדוד Error.

‏זה הופך את הסימולטור עצמו לרכיב שניתן לבדוק.

---

# ‏95. הסימולטור הוא מודל — לא אמת

‏זו נקודה חשובה מאוד.

‏גם Execution Simulator מצוין הוא:

> ‏מודל של העולם.

‏לכן צריך למדוד את הדיוק שלו, לא להאמין לו אוטומטית.

---

# ‏96. `Execution Model Version`

‏כל Backtest צריך לשמור:

```text
execution_model_version
```

‏כי שינוי קטן בחוק Fill יכול לשנות תוצאות בצורה משמעותית.

---

# ‏97. `Data Version` + `Execution Version`

‏Run צריך לכלול לפחות:

```text
data_version
strategy_version
feature_version
score_version
execution_model_version
cost_model_version
config_version
```

‏כך אפשר לשחזר בדיוק מה קרה.

---

# ‏98. `Fill Reason`

‏לכל Fill כדאי לשמור סיבה:

```text
crossed_ask
resting_limit_executed
trade_through
queue_depleted
modeled_depth_sweep
```

‏זה מצוין ל־RCA.

---

# ‏99. `No Fill Reason`

‏אותו דבר לאי־ביצוע:

```text
expired
queue_not_reached
price_moved_away
cancelled
insufficient_depth
signal_invalidated
risk_cancel
```

---

# ‏100. `Entry Decision` ו־`Execution Decision` אינם אותו דבר

‏Strategy יכולה לומר:

```text
TRADE XYZ
```

‏Execution Engine יכול לומר:

```text
DO NOT CHASE
```

‏או:

```text
PARTIAL ONLY
```

‏או:

```text
ABORT: executable edge disappeared
```

---

# ‏101. Execution Recheck בזמן Backtest

‏בדיוק כמו Live:

```text
Signal at T0
Order ready at T1
```

‏ב־T1 צריך לבדוק מחדש:

- ‏המועמדת עדיין תקפה?
- ‏Spread עדיין סביר?
- ‏Ask לא ברח?
- ‏Depth קיים?
- ‏Signal לא פג?

‏אם לא — אין Order.

---

# ‏102. למה זה מונע Backtest אופטימי

‏בלי Recheck, המחקר יכול לומר:

> ‏“בחרנו מניה מצוינת ב־T0, לכן נקנה אותה בכל מחיר ב־T1.”

‏אבל זו לא האסטרטגיה שאנחנו רוצים.

---

# ‏103. `Executable Edge at Arrival`

‏אפשר לחשב מחדש:

```text
expected_move
- expected_entry_cost
- expected_exit_cost
- fees
- safety_buffer
```

‏אם נשאר ≤ 0:

```text
ABORT
```

---

# ‏104. Entry Drift

‏נשמור:

```text
entry_drift = executable_entry_price - decision_reference_price
```

‏ונחקור את התפלגותו.

---

# ‏105. Drift אינו תמיד “Slippage” בלבד

‏המחיר יכול לעלות כי:

- ‏השוק זז באמת.
- ‏הנתונים הגיעו באיחור.
- ‏ה־Scanner היה איטי.
- ‏הברוקר היה איטי.
- ‏Depth נעלם.

‏RCA צריך להפריד ביניהם ככל האפשר.

---

# ‏106. `Implementation Shortfall`

‏זה רעיון רחב למדידת הפער בין החלטת המסחר לבין התוצאה הכלכלית של הביצוע.

‏במערכת שלנו אפשר לפרק אותו ל־:

```text
decision-to-submit drift
submit-to-fill drift
spread cost
market impact
fees
missed quantity
```

---

# ‏107. `Round Trip Simulation`

‏Backtest אמיתי לעסקה קצרה חייב לדמות את שני הצדדים:

```text
Entry execution
Position holding
Exit execution
```

‏לא רק:

```text
buy price vs future Last
```

---

# ‏108. `Net PnL` מה־Fills

‏בסוף:

```text
Gross PnL
- commissions
- fees
- rebates adjustment
= Net PnL
```

‏כאשר Gross עצמו מחושב מ־Fill Prices אמיתיים/מדומים — לא מ־Last.

---

# ‏109. `Executable MFE`

‏MFE רגיל יכול לומר:

> ‏המחיר עלה 10 סנט.

‏אבל Executable MFE שואל:

> ‏כמה רווח היה ניתן לנעול בהתחשב בצד הנכון של הספר ובמודל היציאה?

---

# ‏110. `Executable MAE`

‏גם הפסד פוטנציאלי צריך להימדד לפי מחיר יציאה אפשרי ולא רק לפי Last/Mid.

---

# ‏111. `Time to Net Profit`

‏במקום:

```text
Time to positive price return
```

‏נמדוד:

```text
Time until executable exit would cover all round-trip costs
```

‏זה מדד חזק במיוחד למערכת שלך.

---

# ‏112. `Time to Target` חייב להיות executable

‏אם יעד הוא:

```text
+$1 net
```

‏אין מספיק שה־Last יראה מחיר שהיה נותן +$1 תיאורטית.

‏צריך לבדוק אם יציאה אפשרית הייתה יכולה להשיג אותו לפי המודל.

---

# ‏113. `First Profit` מול `First Executable Profit`

‏זו הבחנה דומה:

```text
price crossed break-even
```

‏אינו תמיד:

```text
could actually exit above break-even
```

---

# ‏114. `Max Holding Time`

‏אם האסטרטגיה שלך אומרת:

```text
maximum 60 seconds
```

‏ה־Backtest צריך לסגור לפי **זמן החלטה + זמן ביצוע**, לא כאילו ב־60.000s בדיוק אנחנו כבר Flat.

---

# ‏115. Forced Exit at Timeout

‏ב־Timeout:

```text
ExitDecision at T
```

‏ואז עדיין יש:

```text
exit latency
market movement
fill process
```

‏כלומר Position יכול להישאר פתוח מעט מעבר ל־T.

---

# ‏116. `Exit Deadline` מול `Flat Deadline`

‏אפשר להגדיר שני מושגים:

```text
max_decision_hold_time
max_time_to_flat
```

‏שניהם חשובים.

---

# ‏117. Re-entry בזמן יציאה

‏אם Scanner מוצא מועמדת חדשה בזמן Position ישן עדיין יוצא, צריך Policy ברורה:

```text
single-position only
allow overlap
reserve capital
wait until flat
```

‏ה־Backtest חייב להשתמש באותה Policy כמו Live.

---

# ‏118. Buying Power חייב להיות Simulated State

‏אי אפשר בכל Signal להניח שכל ההון פנוי.

‏צריך לחשב:

```text
cash
reserved_cash
working_orders
positions
available_buying_power
```

‏לפי מודל החשבון שנבחר.

---

# ‏119. `Working Orders` צורכים Capacity

‏גם פקודה שלא התמלאה עדיין יכולה להגביל החלטות אחרות.

‏אם מתעלמים מזה, Backtest עלול לבצע יותר עסקאות ממה שהמערכת האמיתית יכולה.

---

# ‏120. סדר עדיפויות בין Signals

‏אם כמה Signals מגיעים כמעט יחד ויש הון רק לאחד:

‏צריך Rule:

```text
highest score at decision time
first valid signal
highest expected net edge
```

‏ולשחזר אותו באופן דטרמיניסטי.

---

# ‏121. Whole-market consistency

‏אצלך זה חשוב במיוחד.

‏בכל `Decision Time` צריך לדעת:

```text
what was the whole eligible market state?
who was Rank #1?
who was #2?
what capital was free?
what orders were already active?
```

‏לא לבדוק כל מניה כאילו היא היחידה בעולם.

---

# ‏122. `Portfolio Event Loop`

‏Backtest נכון יותר הוא Event Loop אחד לכל המערכת:

```text
Market events
→ feature updates
→ ranking
→ decisions
→ orders
→ fills
→ positions
→ exits
→ risk/account state
```

‏לא 4,000 Backtests נפרדים שמחוברים בסוף.

---

# ‏123. Determinism

‏אותם:

```text
data
config
code
seed
```

‏צריכים לתת אותה תוצאה.

‏אחרת קשה לבצע RCA.

---

# ‏124. Randomized Fill Model

‏אם משתמשים במודל הסתברותי ל־Queue/Fill, חייבים לשמור:

```text
random_seed
```

‏ולהריץ כמה Seeds.

---

# ‏125. Distribution, לא Run יחיד

‏אם Fill הוא probabilistic:

‏הרץ למשל הרבה סימולציות וקבל:

```text
PnL distribution
fill-rate distribution
drawdown distribution
```

‏לא רק מספר יחיד.

---

# ‏126. `Monte Carlo Execution`

‏אפשר לשנות בכל Run:

```text
latency sample
fill probability
slippage sample
queue cancellation assumptions
```

‏כדי להבין Execution Uncertainty.

---

# ‏127. אבל אל תשתמש ב־Monte Carlo כדי להסתיר חוסר ידע

‏Randomness אינה תחליף למודל.

‏צריך קודם לדעת:

> ‏מה אנחנו מנסים לייצג ולמה ההתפלגות נראית כך.

---

# ‏128. Baseline לפני Complex Queue Simulator

‏מסלול נכון:

```text
1. Signal-only
2. Bid/Ask-aware
3. Fixed latency
4. Empirical latency
5. Simple slippage
6. Depth-aware
7. Passive fill model
8. Queue-aware
9. Live-calibrated
```

‏בכל שלב שואלים אם התוצאה עדיין מעניינת.

---

# ‏129. מתי לעצור השקעה בסימולטור

‏אם כבר ב־:

```text
Bid/Ask + basic latency + basic costs
```

‏ה־Edge נעלם לחלוטין — אין הרבה ערך כרגע לבנות Queue Simulator מושלם.

‏קודם צריך לשפר Signal/Strategy.

---

# ‏130. `Fidelity Ladder`

‏נגדיר במפורש לכל Run:

```text
F0 Signal only
F1 Quote aware
F2 Latency aware
F3 Slippage aware
F4 Depth aware
F5 Partial-fill aware
F6 Queue aware
F7 Live calibrated
```

‏כך אי אפשר להשוות בטעות שני Backtests ברמות מציאותיות שונות.

---

# ‏131. `Research Claim` לפי Fidelity

‏דוגמה:

```text
F1 result:
"There appears to be signal edge after crossing spread."
```

‏לא:

```text
"The live strategy will make X dollars."
```

‏רמת הוודאות חייבת להתאים לרמת הסימולציה.

---

# ‏132. Validation Matrix

‏לכל Strategy Version אפשר לבנות מטריצה:

```text
                Best   Base   Stress
F1 Quote         ...    ...     ...
F2 Latency       ...    ...     ...
F3 Slippage      ...    ...     ...
F4 Depth         ...    ...     ...
```

‏זה נותן תמונה הרבה יותר חזקה מ־Backtest יחיד.

---

# ‏133. Metrics של Execution Backtest

‏לא להסתפק ב־PnL.

‏שמור לפחות:

```text
signal_count
trade_decisions
orders_submitted
orders_filled
partial_fills
fill_rate
avg_fill_latency
p95_fill_latency
entry_slippage
exit_slippage
missed_opportunity
cancel_rate
replace_rate
avg_time_to_flat
net_pnl
```

---

# ‏134. Metrics לפי Execution Mode

‏השווה:

```text
PASSIVE
BALANCED
AGGRESSIVE
```

‏לפי:

- ‏Fill Rate.
- ‏Net PnL.
- ‏Latency.
- ‏Adverse Selection.
- ‏Missed Trades.

---

# ‏135. Metrics לפי Score Bucket

‏שאלה חשובה:

> ‏האם Signals חזקים יותר יכולים להצדיק Execution אגרסיבי יותר?

‏אפשר לבדוק:

```text
score bucket
execution mode
net result
```

‏ולא להניח מראש שכן.

---

# ‏136. Metrics לפי Spread Bucket

‏לדוגמה:

```text
0-2 bps
2-5 bps
5-10 bps
10+ bps
```

‏ולראות איך Performance משתנה.

---

# ‏137. Metrics לפי Liquidity

‏אפשר לבצע Buckets של:

```text
depth / order_size
trade_rate
quote_update_rate
```

‏ולראות היכן Execution באמת עובד.

---

# ‏138. Metrics לפי Time of Day

‏פתיחה, אמצע יום וסגירה יכולים להתנהג שונה מאוד.

‏לכן Execution assumptions יכולים להיות Time-dependent.

---

# ‏139. Metrics לפי Volatility

‏אותו `Marketable Limit` יכול להתנהג אחרת בשוק שקט לעומת burst מהיר.

‏סגמנטציה חשובה.

---

# ‏140. Metrics לפי Symbol

‏אם כמה Symbols מייצרים רוב ה־Slippage, אולי:

- ‏צריך Filter.
- ‏צריך Execution Mode אחר.
- ‏יש Data issue.

‏לא לקפוץ מיד למסקנה.

---

# ‏141. `Execution Attribution`

‏לכל Trade אפשר לפרק:

```text
signal_edge
entry_cost
holding_move
exit_cost
fees
net_result
```

‏זו אחת הדרכים הטובות ביותר להבין איפה הכסף “נעלם”.

---

# ‏142. Trade טוב עם PnL שלילי

‏יכול לקרות:

- ‏Signal היה סביר.
- ‏Execution היה תקין.
- ‏השוק פשוט לא המשיך.

‏זה הפסד אסטרטגי רגיל.

---

# ‏143. Trade רע עם PnL חיובי

‏יכול לקרות:

- ‏נכנסנו במחיר שהיה צריך להיפסל.
- ‏חרגנו מ־Max Chase.
- ‏Signal היה stale.
- ‏במקרה המחיר המשיך.

‏PnL חיובי אינו הופך הפרת כלל לטובה.

---

# ‏144. `Rule Compliance` לצד PnL

‏Backtest צריך לבדוק גם:

```text
was_trade_valid?
was_entry_within_budget?
was_signal_fresh?
was_risk_gate_open?
was_exit_on_time?
```

‏כך לא “לומדים” מהצלחה מקרית של Trade לא חוקי.

---

# ‏145. `Execution Invariants`

‏דוגמאות:

```text
filled_qty <= ordered_qty
position_qty = sum(buy fills) - sum(sell fills)
no sell quantity > long position, unless shorting is explicitly enabled
cancelled order cannot fill after confirmed cancel
no order active before arrival time
```

‏כל Backtest צריך לבדוק אותם אוטומטית.

---

# ‏146. Accounting Invariants

```text
cash changes == fills + fees
realized pnl reconciles with fills
open position cost basis matches fill ledger
```

‏טעויות Accounting יכולות לייצר רווח מזויף.

---

# ‏147. `Golden Scenario Tests`

‏בנה תרחישים קטנים ידניים:

```text
one quote
one order
one fill
one exit
```

‏וחשב ידנית את התוצאה.

‏אם הסימולטור לא עובר אותם — אל תריץ מיליארדי אירועים.

---

# ‏148. תרחיש No Fill

‏בדיקה:

```text
Buy Limit = 100.00
Ask never reaches executable condition
Expected: no fill
```

---

# ‏149. תרחיש Partial Fill

```text
Requested = 100
Available = 40
Expected first fill = 40
Remaining = 60
```

‏אחר כך בודקים מה קורה ל־60 הנותרים.

---

# ‏150. תרחיש Cancel Race

```text
submit
partial fill
cancel request
another fill
cancel confirm
```

‏וודא שה־Position הסופי נכון.

---

# ‏151. תרחיש Price Gap

‏בדוק שהמודל אינו ממלא ב־Limit ישן במחיר דמיוני כאשר השוק קפץ מעליו ללא נזילות מתאימה.

---

# ‏152. תרחיש Stale Quote

‏Quote ישן לא צריך לייצר Fill חדש כאילו הוא עדיין executable.

---

# ‏153. `Staleness Threshold`

‏Execution Model צריך לדעת:

```text
quote_age
```

‏ולפסול/להוריד confidence כאשר הוא גבוה מדי.

---

# ‏154. `No Data` אינו `No Change`

‏אם לא קיבלנו Quote חדש:

‏זה יכול להיות:

```text
market unchanged
```

‏או:

```text
feed gap
```

‏Backtest טוב צריך לדעת להבדיל ככל האפשר.

---

# ‏155. `Heartbeat` ו־Feed Health

‏ב־Live יש Feed Health.

‏גם ב־Replay אפשר לשמור סימני בריאות היסטוריים/איכותיים ולהימנע מ־Fills בתקופות Data לא אמינות.

---

# ‏156. Halts

‏ב־Halt:

- ‏אין מסחר רגיל.
- ‏Orders יכולים להישאר במצב מסוים.
- ‏Restart יכול לפתוח במחיר רחוק.

‏סימולטור לא יכול להמשיך כאילו כל שנייה רגילה.

---

# ‏157. LULD / Fast Market Conditions

‏מצבי שוק מיוחדים יכולים לשנות משמעותית Execution.

‏גם אם לא מסמלצים אותם לעומק בשלב הראשון, צריך לפחות לזהות ולסמן אותם.

---

# ‏158. Corporate Actions

‏Split/Reverse Split יכולים לשבור:

```text
price
quantity
historical comparison
```

‏אם הנתונים אינם מותאמים בצורה עקבית.

---

# ‏159. Extended Hours

‏Pre-market / After-hours יכולים לכלול:

- ‏Spreads רחבים יותר.
- ‏פחות Depth.
- ‏התנהגות Order Types שונה.

‏לכן אל תאחד אותם אוטומטית עם Regular Session.

---

# ‏160. Session-specific Execution Models

‏אפשר להגדיר:

```text
PRE
RTH_OPEN
RTH_MID
RTH_CLOSE
POST
```

‏ולכייל Execution נפרד לכל Regime אם הנתונים מצדיקים זאת.

---

# ‏161. `Fill Probability` אינו Score של המניה

‏אלה שני מודלים שונים:

```text
Alpha probability
Execution probability
```

‏מניה יכולה להיות Signal מעולה אבל קשה מאוד למילוי Passive.

---

# ‏162. Joint Optimization

‏בסוף רוצים למקסם משהו כמו:

```text
Expected Net Value
= probability_of_fill
  × expected_profit_if_filled
  - expected_costs
  - missed_opportunity_cost
  - risk penalties
```

‏זו רק מסגרת חשיבה — לא נוסחת קסם.

---

# ‏163. אל תבנה את כל המערכת סביב Fill Rate

‏Fill Rate גבוה יכול לבוא במחיר של:

- ‏Adverse selection.
- ‏יותר Spread crossing.
- ‏יותר Slippage.

‏המטרה היא Net Edge, לא Fill Rate בפני עצמו.

---

# ‏164. אל תבנה את כל המערכת סביב מחיר Fill

‏Fill “יפה” שלא קיבלנו בזמן שהמניה ברחה למעלה אינו בהכרח טוב יותר מ־Fill אגרסיבי מעט יקר יותר שהשתתף במהלך.

---

# ‏165. `Execution Frontier`

‏אפשר לחשוב על Trade-off:

```text
better price <------> higher fill probability
```

‏המטרה היא למצוא את האזור שנותן EV טוב — לא קצה אחד באופן עיוור.

---

# ‏166. Execution Policy יכולה להיות Dynamic

‏למשל לפי:

```text
signal strength
signal age
spread
velocity
liquidity
expected edge
```

‏אבל כל Dynamic Rule חייב להיבדק ולא להיות תחושת בטן.

---

# ‏167. `Execution Policy Version`

‏שמור בנפרד:

```text
execution_policy_version
```

‏כי Strategy יכולה להישאר זהה כאשר רק אופן הביצוע משתנה.

---

# ‏168. A/B Execution Backtest

‏אותם Signals:

```text
Policy A
vs
Policy B
```

‏השווה:

- ‏Net EV.
- ‏Fill Rate.
- ‏Slippage.
- ‏Missed opportunity.
- ‏Drawdown.

---

# ‏169. `Ablation` של Execution Features

‏אם Execution Policy משתמשת ב־:

```text
spread
depth
velocity
signal_age
```

‏הסר כל אחד בתורו ובדוק אם הוא באמת משפר.

---

# ‏170. Avoid Backtest Overfitting גם בביצוע

‏אפשר לבצע Overfit לא רק ל־Signal.

‏לדוגמה:

```text
TTL = 437ms
max_chase = 3 cents
cancel_after = 281ms
```

‏שנבחרו כי הם ניצחו בדיוק Dataset אחד.

‏זו אותה בעיה בתחפושת אחרת.

---

# ‏171. חפש אזורים יציבים

‏עדיף תוצאה טובה באזור:

```text
TTL 300-700ms
```

‏מאשר Peak חד ב־:

```text
TTL = 437ms
```

‏בלי היגיון יציב סביבו.

---

# ‏172. Walk-Forward ל־Execution

‏גם Execution Parameters צריכים להיבדק לאורך תקופות שונות ולא רק באותו Sample ששימש לכיול.

---

# ‏173. Live Drift

‏Execution יכול להשתנות לאורך זמן בגלל:

- ‏Broker changes.
- ‏Fee changes.
- ‏Market structure.
- ‏Data provider.
- ‏Network.
- ‏Your own software.

‏לכן Calibration אינה חד־פעמית.

---

# ‏174. `Execution Drift Monitoring`

‏ב־Live נרצה להשוות:

```text
expected fill rate vs actual
expected slippage vs actual
expected latency vs actual
expected markout vs actual
```

‏ולזהות שינוי.

---

# ‏175. `Sim-to-Live Gap`

‏זה אחד המדדים החשובים ביותר:

> ‏כמה תוצאות Live שונות ממה שהסימולטור היה מנבא לאותם Signals?

---

# ‏176. סוגי Sim-to-Live Gap

```text
signal gap
price gap
latency gap
fill-rate gap
cost gap
position-state gap
```

‏כל אחד דורש RCA אחר.

---

# ‏177. אל “לתקן” Backtest כדי שיתאים ל־Live בלי להבין למה

‏אם Live גרוע יותר:

‏לא פשוט מעלים Slippage Constant עד שהמספרים מתאימים.

‏צריך להבין:

- ‏באיזה מצב.
- ‏באיזה Symbol.
- ‏באיזה שלב.
- ‏באיזה Latency.
- ‏איזה Order Type.

---

# ‏178. `Execution Replay` לעסקה בודדת

‏יכולת חזקה מאוד:

> ‏לקחת Trade אמיתי ולשחזר את כל Market Events + Decisions + Orders + Fills סביבו.

‏כך אפשר לראות איפה בדיוק התחילה הסטייה.

---

# ‏179. Timeline Debug View

‏לכל Trade כדאי להציג:

```text
T0 market event
T1 feature update
T2 rank #1
T3 trade decision
T4 submit
T5 broker ack
T6 fill
T7 exit signal
T8 exit submit
T9 flat
```

‏ולצד כל נקודה Bid/Ask/Score/Spread/Position.

---

# ‏180. `Decision-to-Fill Movie`

‏לא חייב להיות וידאו.

‏אפשר טבלה/Replay UI שמאפשרת לעבור Event-by-Event.

‏זה כלי לימוד ו־RCA מצוין.

---

# ‏181. Best Practice — שמור Raw לפני Derived

‏אם שומרים רק Features/Score, אי אפשר תמיד לשחזר את Execution.

‏שמור Raw Events מספיקים למחקר עתידי, בכפוף לעלויות אחסון ורישוי.

---

# ‏182. Best Practice — Never mutate history

‏נתוני Replay צריכים להיות Immutable.

‏תיקון Data צריך ליצור:

```text
new data version
```

‏לא לשנות בשקט Dataset ישן שעליו כבר נבנו תוצאות.

---

# ‏183. Best Practice — Conservative by default

‏כאשר Fill אינו ודאי, עדיף Baseline שמרני יותר מאשר אופטימי.

‏אחר כך אפשר להוסיף Best Case.

---

# ‏184. Best Practice — Separate Truth Levels

‏סמן כל Fill:

```text
OBSERVED
HIGH_CONFIDENCE_SIM
MODELED
AMBIGUOUS
```

‏כדי לדעת מה איכות הראיה.

---

# ‏185. Best Practice — לא לערבב Paper ו־Real בלי סימון

‏Paper Fill של ברוקר יכול להשתמש במודל פנימי שאינו זהה למסחר אמיתי.

‏לכן:

```text
paper
live
simulated
```

‏הם datasets שונים.

---

# ‏186. Best Practice — Keep a Fill Assumption Registry

‏מסמך/Config שמגדיר:

```text
Market fill rule
Limit fill rule
Queue assumption
Latency model
Slippage model
Depth rule
Cancel rule
Partial fill rule
```

‏בלי “ידע נסתר” בקוד.

---

# ‏187. Best Practice — Validate Quantity Units

‏טעות של Shares מול Lots או Decimal conversion יכולה להרוס Sim.

‏בדוק Units בכל שכבה.

---

# ‏188. Best Practice — Validate Price Tick

‏מחיר Order/Fill צריך לעמוד ב־Tick rules הרלוונטיים.

‏אל תייצר Fill ב־:

```text
100.003741
```

‏אם אינו מחיר חוקי במצב הרלוונטי.

---

# ‏189. Best Practice — Explicit Rounding

‏Rounding של:

```text
price
quantity
fees
currency
```

‏צריך להיות מפורש ודטרמיניסטי.

---

# ‏190. Best Practice — Timezone discipline

‏שמור זמן פנימי ב־UTC כאשר אפשר, עם Market Session/Exchange Calendar נפרדים.

‏כך מצמצמים טעויות DST.

---

# ‏191. Best Practice — One source of position truth

‏ב־Simulation כמו ב־Live:

```text
Position = function of confirmed fills
```

‏לא של Orders ששלחנו ולא של מה שהתכוונו לבצע.

---

# ‏192. Best Practice — Orders are not Positions

‏`Submitted Buy 100` אינו:

```text
Position = 100
```

‏עד שאין Fill.

---

# ‏193. Best Practice — Exit quantity from actual position

‏אם התמלאנו 63 מתוך 100:

‏ה־Exit צריך להיות מבוסס על:

```text
63
```

‏לא 100.

---

# ‏194. Best Practice — Fees from actual fills

‏עמלות צריכות להיגזר מהעסקאות שבאמת דימינו, כולל Partial Fills לפי מודל התמחור המתאים.

---

# ‏195. Best Practice — Compare theoretical and executable curves

‏שמור שתי עקומות:

```text
theoretical signal return
simulated executable return
```

‏הפער ביניהן מלמד המון.

---

# ‏196. `Execution Tax`

‏אפשר לחשוב על:

```text
execution_tax = theoretical_edge - executable_edge
```

‏ולמדוד אותו לפי כל Segment.

---

# ‏197. Execution Tax גבוה במיוחד

‏אם הוא גבוה דווקא ב־Top Score Signals, ייתכן שה־Scanner בוחר מניות שכבר נעות מהר מדי בשבילך.

‏זו תובנה אסטרטגית חשובה.

---

# ‏198. Scanner ו־Execution משפיעים זה על זה

‏לאחר שנבנה Backtest מציאותי, יכול להתברר:

> ‏המניה “הכי חזקה” אינה המניה בעלת ה־Net Edge הגבוה ביותר לאחר ביצוע.

‏ואז Feature/Score צריכים להשתנות.

---

# ‏199. אבל אל תערבב שלבים בזמן RCA

‏כאשר Trade נכשל, שאל בסדר:

```text
1. Was signal predictive?
2. Was candidate selection correct?
3. Was decision still valid?
4. Was execution good?
5. Were costs expected?
6. Was exit good?
```

‏כך לא מתקנים Scanner בגלל תקלה ב־Execution.

---

# ‏200. `Failure Attribution`

‏קטגוריות אפשריות:

```text
SIGNAL_FAILURE
RANKING_FAILURE
DECISION_FAILURE
ENTRY_EXECUTION_FAILURE
EXIT_EXECUTION_FAILURE
COST_MODEL_ERROR
DATA_ERROR
SYSTEM_ERROR
NORMAL_MARKET_LOSS
```

---

# ‏201. Backtest של Seconds דורש הרבה דוגמאות

‏כאשר Edge קטן ורועש, מעט Trades יכולים להטעות.

‏צריך להסתכל על:

- ‏Sample size.
- ‏Confidence intervals.
- ‏Stability across days.
- ‏Stability across symbols.
- ‏Stability across regimes.

---

# ‏202. אל תתרגש מ־Win Rate בלבד

‏60% Wins יכול להיות גרוע אם:

```text
avg win = $0.20
avg loss = $1.00
```

‏ולהפך.

‏Execution Backtest חייב להשתמש ב־EV ו־Net PnL distribution.

---

# ‏203. Tail Losses

‏במסחר קצר הרבה עסקאות עשויות להיות קטנות, אבל אירוע נדיר יכול להיות גדול.

‏לכן בדוק:

```text
P95 loss
P99 loss
worst trade
worst minute
worst day
```

---

# ‏204. Gap between expected stop and actual exit

‏Stop מתוכנן אינו מבטיח מחיר.

‏ב־Stress Model צריך לאפשר:

```text
actual exit worse than stop reference
```

‏כאשר השוק מהיר/דליל.

---

# ‏205. Liquidity Shock Scenario

‏תרחיש Stress:

```text
spread widens
visible depth drops
latency rises
```

‏באותו זמן.

‏זה הרבה יותר מציאותי מאשר לשנות כל פרמטר בנפרד בלבד.

---

# ‏206. Correlated Stress

‏במצבי שוק קשים, הרבה הנחות יכולות להתדרדר יחד.

‏לכן צריך גם Scenario משולב, לא רק Independent shocks.

---

# ‏207. `Execution Safety Margin`

‏אם Base Case EV קטן מאוד, שאל:

> ‏כמה מעט צריך להשתבש כדי שה־EV יהפוך שלילי?

‏זה מדד שימושי יותר מאשר רק “חיובי/שלילי”.

---

# ‏208. Break-even Surface

‏אפשר ליצור משטח:

```text
latency × slippage × fill_rate
```

‏ולראות איפה האסטרטגיה עדיין חיובית.

---

# ‏209. Robust Region

‏אנחנו מחפשים אזור רחב שבו:

```text
Net EV > 0
```

‏ולא נקודה זעירה של הנחות מושלמות.

---

# ‏210. Execution Capacity

‏גם אם $5,000 עובדים, $50,000 אולי לא.

‏הרץ את אותו Backtest בגדלי Order שונים:

```text
$1k
$2.5k
$5k
$10k
$25k
```

‏כדי לראות מתי Depth/Impact מתחילים לשנות את התוצאה.

---

# ‏211. היתרון האפשרי של Size קטן

‏Position קטן יכול:

- ‏להיכנס ברמה הראשונה.
- ‏לצאת מהר יותר.
- ‏להשפיע פחות על השוק.

‏אבל צריך להוכיח זאת באמצעות נתוני Depth/Fills — לא להניח.

---

# ‏212. `Capacity Curve`

‏שמור:

```text
order_size -> expected_net_edge
```

‏ייתכן ש־Edge טוב עד גודל מסוים ואז נשחק במהירות.

---

# ‏213. `Liquidity-adjusted Position Size`

‏ב־Simulation אפשר להגביל כמות לפי:

```text
fraction_of_visible_depth
fraction_of_recent_volume
expected_slippage_budget
```

‏אבל כל כלל כזה דורש Validation.

---

# ‏214. אל תשתמש רק ב־Daily Volume ל־Capacity

‏מה שקובע לעסקה של שניות הוא הרבה יותר מקומי בזמן.

‏לדוגמה:

```text
current depth
recent trade rate
recent dollar volume
spread
```

---

# ‏215. `Order Size / Depth` Feature

‏יחס שימושי למחקר Execution:

```text
requested_qty / ask_depth
```

‏בכניסה Long.

‏ככל שהיחס גבוה יותר, ביצוע מלא ברמה הראשונה פחות סביר.

---

# ‏216. `Order Size / Recent Volume`

‏עוד מדד:

```text
requested_qty / volume_last_10s
```

‏הוא אינו מודל Impact מלא, אבל נותן הקשר.

---

# ‏217. `Quote Update Rate`

‏Book שמשתנה 100 פעמים בשנייה שונה מ־Book שיושב ללא שינוי שניות ארוכות.

‏Execution Model מתקדם יכול להשתמש בקצב העדכונים כ־Feature.

---

# ‏218. `Trade Rate`

‏Trade Rate גבוה עשוי להשפיע על:

- ‏Fill probability.
- ‏Queue depletion.
- ‏Signal decay.

‏אבל הכיוון אינו תמיד חיובי.

---

# ‏219. `Spread Dynamics`

‏לא מספיק Spread ברגע אחד.

‏בדוק:

```text
spread_now
spread_avg_1s
spread_avg_5s
spread_change
```

‏כי Spread מתרחב בזמן תנועה מהירה.

---

# ‏220. `Depth Dynamics`

‏גם Depth יכול:

```text
appear
disappear
refill
```

‏לכן Snapshot יחיד יכול להטעות.

---

# ‏221. Resiliency

‏אחרי שנזילות נאכלת, כמה מהר היא חוזרת?

‏זה מאפיין שוק שיכול להשפיע על Execution של כניסה ויציאה מהירה.

---

# ‏222. Hidden Liquidity

‏Visible Depth אינו תמיד כל הנזילות.

‏לכן Depth Model יכול להיות שמרני/לא שלם.

‏אל תסיק מכך אוטומטית שיש יותר Fill — רק תכיר במגבלה.

---

# ‏223. `Price Improvement`

‏לפעמים Fill יכול להיות טוב מהמחיר שציפינו.

‏Backtest שמרני יכול לא להניח זאת כברירת מחדל.

‏כאשר יש Live/Paper Data, אפשר למדוד empirical improvement ולכייל.

---

# ‏224. Asymmetric modeling

‏אל תניח:

```text
entry slippage == exit slippage
```

‏או:

```text
buy behavior == sell behavior
```

‏צריך לבדוק נתונים.

---

# ‏225. Winner's execution problem

‏המניה שדורגה #1 מכל 4,000 יכולה להיות בדיוק זו שעוברת תנועה חריגה ומהירה במיוחד.

‏כלומר:

> ‏בחירת ה־winner יכולה לבחור גם את המניה הכי קשה לתפוס במחיר שראינו.

‏זה אחד הדברים החשובים ביותר לבדוק אצלך.

---

# ‏226. `Rank-to-Fill Decay`

‏נמדוד:

```text
rank_at_signal
rank_at_submit
rank_at_fill
```

‏אם Rank #1 הופך #50 עד Fill, ייתכן שה־Execution מאוחר מדי.

---

# ‏227. `Score-to-Fill Decay`

‏אותו רעיון עם Score:

```text
score_at_signal
score_at_order
score_at_fill
```

‏כך אפשר ללמוד את Half-Life של ההזדמנות.

---

# ‏228. Abort before Fill

‏אם הפקודה עדיין לא התמלאה וה־Signal מת:

‏Execution Policy יכולה לבטל.

‏Backtest צריך לתמוך ב־:

```text
signal invalidation while order working
```

---

# ‏229. Partial Fill + Signal Death

‏מצב מורכב:

```text
100 requested
30 filled
signal invalidated
```

‏כעת צריך:

- ‏לבטל Remaining 70.
- ‏לנהל/לצאת מ־30 שכבר נקנו.

‏זה חייב להופיע בסימולציה.

---

# ‏230. `Position Birth Time`

‏Position לא בהכרח “נולד” בזמן הסיגנל.

‏אפשר להגדיר:

```text
first_fill_time
full_fill_time
```

‏ולמדוד Holding Time משניהם לפי הצורך.

---

# ‏231. Holding Time בפוזיציה שנבנתה בהדרגה

‏אם Fills הגיעו לאורך 800ms, כל Share נכנס בזמן מעט שונה.

‏לרוב אפשר להשתמש ב־first/full/weighted fill time בהתאם למדד — אבל צריך להיות עקבי.

---

# ‏232. `Quantity-weighted Fill Time`

‏אפשר לחשב ממוצע זמן משוקלל לפי Quantity כדי לקבל נקודת Reference לפוזיציה שנבנתה בהדרגה.

---

# ‏233. Exit target מה־Average Fill

‏אם Take Profit מוגדר ביחס למחיר הכניסה, צריך להשתמש ב־:

```text
actual average fill price
```

‏ולא Signal Price.

---

# ‏234. Cost basis אחרי Partial Fills

‏גם עלות העסקה מתעדכנת עם כל Fill.

‏לכן Break-even משתנה בזמן בניית הפוזיציה.

---

# ‏235. `Live-like State Machine`

‏Backtest צריך להשתמש באותם States רעיוניים כמו Production:

```text
SCANNING
CANDIDATE
ENTERING
PARTIALLY_FILLED
POSITION
EXITING
PARTIALLY_EXITED
FLAT
RECOVERY
```

‏כך מצמצמים Simulation/Live mismatch.

---

# ‏236. Same Strategy Core

‏Best Practice חזק:

> ‏אותו Core של Strategy/Decision צריך לרוץ גם ב־Backtest וגם ב־Live, כאשר מחליפים רק Adapters של Clock/Data/Broker.

---

# ‏237. `SimulationClock`

‏אל תשתמש ישירות ב־system clock בתוך Strategy.

‏העבר Clock abstraction:

```text
IClock.Now
```

‏שב־Backtest נשלט על ידי Replay.

---

# ‏238. `SimulatedBroker`

‏ממשק Broker אחיד יכול לאפשר:

```text
PlaceOrder
CancelOrder
GetPositions
GetOpenOrders
```

‏כאשר ב־Backtest implementation אחד וב־Live implementation אחר.

---

# ‏239. `MarketDataAdapter`

‏אותו עיקרון ל־Market Data.

‏Strategy לא צריכה לדעת אם הנתון הגיע מ־:

```text
Replay file
Alpaca
IBKR
another provider
```

‏אלא לקבל Canonical Event.

---

# ‏240. Canonical Event Schema

‏לדוגמה:

```text
symbol
event_time
received_time
event_type
bid
ask
bid_size
ask_size
last
last_size
sequence
source
```

‏לא כל Feed יספק הכול, ולכן גם Validity/Optional metadata חשובים.

---

# ‏241. `Execution Snapshot`

‏בכל Order כדאי לשמור Snapshot:

```text
bid
ask
sizes
spread
score
rank
signal_age
expected_edge
order_size
execution_mode
```

‏בזמן ההחלטה ובזמן השליחה.

---

# ‏242. `Fill Snapshot`

‏בכל Fill:

```text
fill_price
fill_qty
bid
ask
spread
rank
score
latency
position_after
```

‏כדי שאפשר יהיה להסביר אותו.

---

# ‏243. `Exit Snapshot`

‏אותו דבר ביציאה:

```text
exit_reason
position_before
bid
ask
spread
pnl_before_costs
estimated_net_pnl
```

---

# ‏244. RCA מלא של Trade

‏בסוף אפשר לשאול:

```text
Was the scanner right?
Was the candidate still best?
Was entry too late?
Was execution too passive?
Was spread too expensive?
Was exit too late?
Did data become stale?
```

---

# ‏245. רז מקצוע: Simpler pessimistic model can be more useful

‏מודל פשוט ושמרני שאתה מבין היטב יכול להיות שימושי יותר מסימולטור “מתוחכם” עם עשרות הנחות לא מוכחות.

---

# ‏246. רז מקצוע: Backtest אינו תחרות דיוק היסטורי

‏המטרה אינה לנחש כל Fill היסטורי בצורה מושלמת.

‏המטרה היא:

> ‏לקבל החלטות מחקר טובות תחת אי־ודאות סבירה.

---

# ‏247. רז מקצוע: Edge אמיתי צריך מרווח

‏אם התוצאה עוברת מחיובית לשלילית בגלל:

```text
+1 cent slippage
```

‏זה לא בהכרח אומר שהאסטרטגיה פסולה — אבל זה אומר שה־Margin of Safety קטן ודורש זהירות רבה.

---

# ‏248. רז מקצוע: אל תתקן Signal לפני שבודקים Execution

‏אם Rank #1 “לא הרוויח”, קודם בדוק:

```text
Did we enter at a realistic price?
How late was the fill?
Did the move happen before fill?
```

‏ייתכן שה־Scanner צדק והמימוש איחר.

---

# ‏249. רז מקצוע: אל תתקן Execution לפני שבודקים Signal

‏הכיוון ההפוך גם נכון.

‏אם המחיר פשוט לא המשיך גם מיד אחרי Signal, אין טעם להאשים רק Slippage.

---

# ‏250. רז מקצוע: Separate research questions

‏אל תשאל בבת אחת:

> ‏“איזו אסטרטגיה + Score + Entry + Exit + Routing + TTL הכי טובה?”

‏פצל:

```text
Is there predictive signal?
Can it survive costs?
Can it be executed?
Which execution policy is best?
Which exit policy is best?
```

---

# ‏251. רז מקצוע: Optimize last

‏קודם בנה מודל נכון ופשוט.

‏אחר כך שפר ביצועים חישוביים.

‏Backtest מהיר שמחשב משהו לא נכון הוא רק דרך מהירה לקבל מסקנה שגויה.

---

# ‏252. אבל Performance כן חשוב אצלנו

‏Whole-market event replay על אלפי מניות יכול להיות כבד מאוד.

‏לכן ארכיטקטורה טובה צריכה לאפשר:

- ‏Streaming.
- ‏Incremental features.
- ‏Precomputed indexes.
- ‏Candidate narrowing.
- ‏Efficient event ordering.

‏מבלי לשנות לוגיקה.

---

# ‏253. `Wide Replay` ו־`Deep Execution`

‏אפשר לבצע:

```text
Wide replay: all symbols, lighter state
Deep simulation: only top candidates / active orders / positions
```

‏זה מתאים מאוד למבנה הסורק שלך.

---

# ‏254. אל תדלג על Whole Market בזמן Wide Replay

‏אם Rank תלוי בכל השוק, חייבים לשמר את Cross-sectional state הדרוש כדי לדעת מי באמת הייתה #1.

---

# ‏255. `Candidate Promotion`

‏כאשר Symbol נכנסת למשל ל־Top 20:

‏אפשר להתחיל לשמור/לעבד עבורה נתוני Execution עשירים יותר.

‏כך חוסכים משאבים.

---

# ‏256. `Candidate Demotion`

‏כאשר היא יוצאת מאזור העניין ואין Order/Position, אפשר לחזור לרמת State קלה יותר.

---

# ‏257. Data requirements must drive provider choice

‏אם המחקר מוכיח שצריך:

```text
tick quotes
trade conditions
L2 depth
```

‏אז בוחרים Feed שיכול לספק אותם.

‏לא משנים את השאלה המחקרית רק כי ספק מסוים נוח יותר.

---

# ‏258. אבל אל תקנה Data יקר לפני שאתה יודע למה אתה צריך אותו

‏אפשר להתחיל ברמת Fidelity נמוכה יותר ולבדוק:

> ‏איזו אי־ודאות נשארה שלא ניתן לפתור בלי Feed עשיר יותר?

‏אז העלות הופכת החלטה הנדסית מבוססת.

---

# ‏259. `Data Value Test`

‏השווה:

```text
Backtest with L1
vs
Backtest with richer data
```

‏אם החלטות/מסקנות כמעט לא משתנות, אולי L2 אינו נחוץ לשלב הזה.

---

# ‏260. `Model Value Test`

‏אותו דבר לגבי Queue Simulator:

```text
simple conservative model
vs
complex queue model
```

‏אם מסקנת המחקר זהה, הפשוט אולי מספיק כרגע.

---

# ‏261. Baseline מומלץ לרובוט שלנו

‏לשלב ראשון של Backtest ביצוע ריאליסטי:

```text
1. Whole-market historical state
2. Point-in-time features/ranking
3. Bid/Ask-aware prices
4. Explicit signal-to-order latency
5. Explicit order-to-fill latency
6. Marketable-limit baseline
7. Basic depth constraint if sizes exist
8. Partial fills
9. Entry/exit costs
10. Max chase
11. Order TTL
12. Pre-trade recheck
13. Time stop / max hold
14. Net PnL
15. Best/Base/Stress assumptions
```

‏זה כבר בסיס חזק בהרבה מ־Last-to-Last Backtest.

---

# ‏262. מה לא חייבים ב־Baseline הראשון

‏אפשר לדחות בהתחלה:

```text
perfect queue reconstruction
full exchange matching engine
hidden-liquidity inference
venue-by-venue routing simulation
microsecond-level timing
```

‏עד שנוכיח שהם באמת נחוצים.

---

# ‏263. שלב שני אפשרי

‏אם ה־Edge שורד Baseline:

```text
empirical latency distributions
depth-aware sweeps
passive fill probability
queue approximation
regime-specific slippage
live calibration
```

---

# ‏264. שלב שלישי אפשרי

‏אם Strategy תלויה מאוד ב־Passive Execution:

‏אז שווה להשקיע יותר ב־:

```text
L2 replay
queue dynamics
cancel/replace behavior
venue-level analysis
```

---

# ‏265. Checklist — Data

‏לפני Run רציני:

- ‏האם `Bid/Ask` קיימים?
- ‏האם timestamps מדויקים מספיק?
- ‏האם Data מסודר נכון?
- ‏האם gaps מזוהים?
- ‏האם Feed scope מתועד?
- ‏האם sessions/halts נכונים?

---

# ‏266. Checklist — Timing

- ‏האם יש `signal_time`?
- ‏`decision_time`?
- ‏`submit_time`?
- ‏`arrival_time`?
- ‏`fill_time`?
- ‏`exit_decision_time`?
- ‏`flat_time`?

‏אם הכול אותו Timestamp, כנראה המודל עדיין אופטימי מדי למסחר של שניות.

---

# ‏267. Checklist — Orders

- ‏Order Type.
- ‏Limit Price.
- ‏Quantity.
- ‏TTL.
- ‏Cancel state.
- ‏Replace state.
- ‏Partial fills.
- ‏Remaining quantity.

---

# ‏268. Checklist — Costs

- ‏Entry spread/slippage.
- ‏Exit spread/slippage.
- ‏Commission.
- ‏Exchange/regulatory fees לפי המודל.
- ‏Rebates אם רלוונטי.
- ‏Opportunity cost.

---

# ‏269. Checklist — Validation

‏הרץ לפחות:

```text
optimistic
base
pessimistic
```

‏והצג את שלושתם יחד.

---

# ‏270. Checklist — Explainability

‏לכל Trade חייבת להיות תשובה ל־:

```text
Why selected?
Why traded?
Why this order?
Why this price?
Why filled?
Why exited?
Why this net PnL?
```

---

# ‏271. תרגיל 1

‏נתון:

```text
Signal at 10:00:00.000
Bid = 49.99
Ask = 50.01
Latency = 300ms
```

‏ב־10:00:00.300:

```text
Bid = 50.03
Ask = 50.05
```

‏שאל:

1. ‏למה Entry ב־50.01 אינו חוקי אוטומטית?
2. ‏מהו מחיר הייחוס הנכון ל־Marketable Buy בזמן ההגעה?
3. ‏מה צריך לקרות אם Max Chase הוא 2 סנט?

---

# ‏272. תרגיל 2

‏נתון:

```text
Buy Limit = 20.00
Displayed Bid Size at join = 5,000
Your Qty = 100
Trades at 20.00 after join = 600 shares
```

‏שאל:

1. ‏האם Touch=Fill מודל ימלא אותך?
2. ‏האם Queue-aware model בהכרח ימלא אותך?
3. ‏איזה מידע חסר?

---

# ‏273. תרגיל 3

‏השווה שתי Policies:

```text
A: Passive, 40% fill rate, +$0.06 average net when filled
B: Aggressive, 95% fill rate, +$0.025 average net when filled
```

‏אל תבחר לפי Fill Rate בלבד.

‏חשב Expected Value כולל missed opportunities והנחות רלוונטיות.

---

# ‏274. תרגיל 4

‏אותו Scanner נותן:

```text
Signal-only EV  = +8 bps
Quote-aware EV  = +5 bps
Latency-aware EV = +2 bps
Full cost EV     = -1 bps
```

‏שאל:

> ‏באיזה שלב ה־Edge נשחק, ואיזה רכיב צריך לחקור לפני שינוי Score?

---

# ‏275. עשרת כללי הזהב של הפרק

1. ‏`Last` אינו Fill.
2. ‏מחיר ביצוע נבדק בזמן הגעת הפקודה, לא בזמן הסיגנל בלבד.
3. ‏Latency היא התפלגות, לא בהכרח מספר קבוע.
4. ‏Touch של Limit אינו מבטיח Fill.
5. ‏Partial Fill הוא Position אמיתי.
6. ‏Cancel אינו מיידי.
7. ‏Entry ו־Exit חייבים לקבל אותה רמת מציאותיות.
8. ‏אי־ודאות ב־Queue/Data צריכה להיות מפורשת.
9. ‏השווה כמה רמות Fidelity וכמה תרחישי Stress.
10. ‏כייל את הסימולטור מה־Paper/Live במקום להאמין לו לנצח.

---

# ‏276. מה חשוב במיוחד לרובוט שלך

‏המערכת שלך מחפשת מניה מובילה מכל השוק ורוצה מהלך מהיר מאוד.

‏לכן ארבע שאלות הופכות קריטיות:

```text
1. How much of the move already happened before our fill?
2. Is Rank #1 still strong when the order can actually arrive?
3. Can the expected tiny edge survive spread/slippage/fees?
4. If we use passive execution, are the fills we receive adversely selected?
```

---

# ‏277. מדד מרכזי שאני ממליץ שנחקור בהמשך

```text
edge_at_signal
edge_at_submit
edge_at_fill
```

‏אם נראה למשל:

```text
+8 bps
+4 bps
+1 bps
```

‏נדע שהבעיה אינה בהכרח בחיזוי אלא ב־Signal Decay / Execution Delay.

---

# ‏278. מדד מרכזי נוסף

```text
rank_at_signal
rank_at_submit
rank_at_fill
```

‏זה מתאים במיוחד לאסטרטגיה Cross-sectional שלך.

‏אולי מניה שהייתה #1 בזמן הסריקה כבר אינה הבחירה הטובה ביותר כשאפשר באמת לבצע.

---

# ‏279. המסקנה המקצועית

‏Backtest למסחר של שניות אינו רק:

```text
if future_price > entry_price:
    win
```

‏אלא מערכת Event-driven שמנסה לשחזר:

```text
what we knew
when we knew it
what we decided
when the order could arrive
what liquidity existed
whether we filled
at what price
in what quantity
how long we stayed exposed
how we exited
what remained net
```

---

# ‏280. Checkpoint ידע

‏אחרי הפרק אתה אמור לדעת להסביר:

- ‏למה `Last` אינו מחיר Entry/Exit תקין כברירת מחדל.
- ‏למה latency משנה את Signal עצמו.
- ‏למה Limit touched אינו Fill ודאי.
- ‏מהו Queue Position.
- ‏למה Partial Fills משנים Position State.
- ‏למה Cancel/Replace דורש זמן ומודל.
- ‏מה ההבדל בין Quote-aware, Depth-aware ו־Queue-aware simulation.
- ‏למה צריך Best/Base/Stress.
- ‏איך למדוד Sim-to-Live Gap.
- ‏למה `Executable Edge` חשוב יותר מתנועה תיאורטית במחיר.

---

# ‏השלב הבא

‏שלב 22 יעבור מהשאלה **“האם יכולנו לבצע?”** לשאלה **“האם ה־Scanner באמת מנבא?”**.

‏נלמד למדוד את איכות הדירוג עצמו באמצעות `Forward Returns`, ‏Hit Rate, ‏Expected Value, ‏`time_to_first_profit`, ‏`time_to_target`, ‏MFE/MAE, ‏Rank Buckets, ‏Top-1 diagnostics ו־Counterfactuals — תוך הפרדה ברורה בין איכות החיזוי לבין איכות הביצוע.