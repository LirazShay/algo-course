# ‏שלב 11 — נזילות ויכולת ביצוע אמיתית: האם אפשר באמת להיכנס ולצאת מהר

> ‏מטרת הפרק: להבין מהי `Liquidity` באופן כללי, איך מודדים אותה, למה היא אינה אותו דבר כמו Volume או פעילות, ואיך לבדוק האם פקודה בסכום שלך יכולה להיכנס ולצאת בתוך שניות בלי שה־`Spread`, ה־`Slippage` או עומק חלש ימחקו את כל הרווח.
>
> ‏כמו בשאר הקורס: קודם נלמד את הידע המקצועי הכללי, ואז נתרגם אותו במפורש לאופי המסחר הקצר מאוד שלך.

---

# ‏1. מה זה בכלל `Liquidity`?

‏`Liquidity` = נזילות.

‏בפשטות:

> ‏כמה קל לקנות או למכור נכס, בכמות שרוצים, מהר, ובמחיר קרוב למחיר שרואים בשוק.

‏מניה נזילה היא מניה שבה בדרך כלל אפשר לבצע עסקה בלי לגרום למחיר לזוז הרבה נגדך.

‏מניה לא נזילה יכולה להציג מחיר יפה במסך — אבל כאשר מנסים לקנות או למכור בפועל, המחיר בורח.

---

# ‏2. למה נזילות חשובה לכל סוחר

‏נזילות משפיעה על:

- ‏מהירות ביצוע.
- ‏מחיר ביצוע.
- ‏`Spread`.
- ‏`Slippage`.
- ‏סיכוי ל־`Partial Fill`.
- ‏יכולת לצאת כאשר השוק משתנה.
- ‏הסיכון של פקודת `Market`.
- ‏איכות ה־Backtest.

‏ככל שהעסקה קצרה יותר והרווח הרצוי קטן יותר, נזילות נעשית חשובה עוד יותר.

---

# ‏3. `Volume` אינו `Liquidity`

‏זו טעות בסיסית שחשוב להימנע ממנה.

‏מניה יכולה להיות בעלת Volume יומי גבוה ועדיין להיות קשה לביצוע ברגע מסוים.

‏לדוגמה:

```text
Daily Volume = 5,000,000 shares
```

‏נשמע מצוין.

‏אבל עכשיו:

```text
Bid = 20.00 × 100
Ask = 20.08 × 100
```

‏ה־Spread גדול והכמות ברמה הראשונה קטנה.

‏לעומת זאת מניה אחרת:

```text
Daily Volume = 2,000,000 shares
Bid = 20.00 × 4,000
Ask = 20.01 × 3,500
```

‏עשויה להיות קלה יותר לביצוע כרגע.

‏לכן:

> ‏`Volume` הוא סימן לפעילות. `Liquidity` היא היכולת לבצע.

---

# ‏4. ארבעה ממדים בסיסיים של נזילות

‏אפשר לחשוב על נזילות דרך ארבע שאלות:

## ‏א. כמה צר ה־`Spread`?

‏פער קטן בין `Bid` ל־`Ask` בדרך כלל טוב יותר.

## ‏ב. כמה כמות זמינה במחירים הטובים?

‏כלומר `Bid Size` ו־`Ask Size`.

## ‏ג. מה יש מעבר לרמה הראשונה?

‏זהו `Depth` — עומק.

## ‏ד. כמה מהר הספר מתמלא מחדש?

‏זה נקרא לעיתים `Resiliency`.

‏אם כמות נאכלת ומיד מופיעה כמות חדשה, השוק יכול להיות עמוק יותר ממה שנראה בצילום בודד.

---

# ‏5. `Quoted Spread`

‏ה־`Quoted Spread` הוא פשוט:

```text
Spread = Ask - Bid
```

‏לדוגמה:

```text
Bid = 50.00
Ask = 50.02
Spread = 0.02
```

‏באחוזים:

```text
Spread % ≈ Spread / Mid
```

‏אם `Mid ≈ 50.01`:

```text
0.02 / 50.01 ≈ 0.04%
```

‏זה מאפשר להשוות מניה של $10 למניה של $200 בצורה הוגנת יותר.

---

# ‏6. למה Spread הוא עלות אמיתית

‏נניח שאתה קונה מיד ב־Ask:

```text
Buy = 50.02
```

‏ומיד רוצה לצאת לצד השני:

```text
Sell = 50.00
```

‏עוד לפני עמלות:

```text
Loss = $0.02 per share
```

‏כלומר כדי להרוויח, המחיר צריך קודם להתגבר על החיכוך הזה.

‏למערכת שמחפשת רווח קטן מאוד, זה קריטי.

---

# ‏7. `Effective Spread`

‏ה־Spread שמופיע על המסך אינו תמיד העלות האמיתית שקיבלת.

‏יכול להיות שביצוע קיבל מחיר בתוך ה־Spread.

‏יכול להיות גם שקיבלת מחיר גרוע יותר בגלל תנועה מהירה.

‏לכן קיימת מדידה שנקראת:

`Effective Spread`

‏בפשטות:

> ‏כמה רחוק מחיר הביצוע שלך היה מה־Mid שהיה בזמן שהפקודה הגיעה.

‏זה מדד חשוב למחקר איכות ביצוע.

---

# ‏8. `Top of Book`

‏`Top of Book` הוא הרמה הטובה ביותר בכל צד:

```text
Best Bid
Best Ask
```

‏לדוגמה:

```text
Bid = 100.00 × 300
Ask = 100.01 × 200
```

‏אם אתה רוצה לקנות 50 מניות, ה־Ask Size של 200 נראה מספיק.

‏אבל אם אתה רוצה לקנות 1,000 מניות — לא.

---

# ‏9. נזילות היא תמיד יחסית לגודל הפקודה שלך

‏זו נקודה מרכזית.

‏אין דבר כזה רק:

> ‏"המניה נזילה."

‏השאלה האמיתית היא:

> ‏האם היא נזילה **לגודל העסקה שלי**?

‏לדוגמה:

```text
Ask = 25.00 × 5,000 shares
```

‏אם אתה רוצה לקנות:

```text
100 shares
```

‏אתה צורך רק חלק קטן מהכמות.

‏אם גוף מוסדי רוצה לקנות:

```text
500,000 shares
```

‏זו בעיה אחרת לחלוטין.

---

# ‏10. כאן יכול להיות יתרון לסוחר קטן

‏אם ההון שלך קטן יחסית, ייתכן שאתה צריך רק:

```text
$5,000 / $50 = 100 shares
```

‏במניה נזילה, 100 מניות הן כמות קטנה מאוד.

‏לכן יכול להיות שקל לך יותר מגוף מוסדי:

- ‏להיכנס בלי להזיז את השוק.
- ‏לצאת בלי להזיז את השוק.
- ‏להשתמש במניות שבהן אין מספיק Capacity לקרן גדולה.

‏אבל זה יתרון אפשרי — לא הבטחה.

‏אם המניה עצמה דלילה, גם $5,000 יכולים להיות כמות גדולה יחסית.

---

# ‏11. `Depth of Book`

‏נניח ספר מכירה כזה:

```text
ASK
$20.00   100 shares
$20.01   200 shares
$20.02   300 shares
$20.03   800 shares
```

‏אם קונים 100 מניות, אולי הכול מתבצע ב־$20.00.

‏אם קונים 600 מניות מיד, צריך לצרוך כמה רמות.

‏זה נקרא:

`Walking the book`

‏כלומר הפקודה עוברת מחיר אחרי מחיר בספר.

---

# ‏12. דוגמה ל־`Walking the Book`

‏אנחנו רוצים לקנות 600 מניות.

```text
100 × 20.00 = 2,000
200 × 20.01 = 4,002
300 × 20.02 = 6,006
```

‏סה"כ:

```text
12,008 / 600 = $20.0133 average
```

‏למרות שה־Ask הראשון היה:

```text
$20.00
```

‏המחיר הממוצע בפועל היה:

```text
$20.0133
```

‏זה חלק מ־`Slippage` / `Market Impact`.

---

# ‏13. `Slippage`

‏`Slippage` = ההבדל בין המחיר שציפינו לקבל לבין המחיר שקיבלנו בפועל.

‏לדוגמה:

```text
Expected Buy = 30.00
Actual Buy   = 30.03
```

‏החלקנו שלושה סנטים לרעה.

‏אם יעד הרווח היה ארבעה סנטים — רוב היתרון נמחק.

---

# ‏14. `Market Impact`

‏`Market Impact` הוא מצב שבו **הפקודה שלך עצמה** תורמת להזזת המחיר.

‏אם קונים כמות גדולה יחסית לכמות המוצעת, מתחילים לצרוך את הספר.

‏אצל סוחר קטן ההשפעה יכולה להיות זניחה במניות נזילות.

‏אבל אסור להניח זאת מראש.

---

# ‏15. `Order Size / Available Liquidity`

‏Feature פשוט ושימושי יכול להיות:

```text
size_ratio = my_order_size / ask_size
```

‏לדוגמה:

```text
My order = 100 shares
Ask Size = 5,000 shares
ratio = 2%
```

‏לעומת:

```text
My order = 100 shares
Ask Size = 120 shares
ratio = 83%
```

‏אלה שני מצבים שונים מאוד.

---

# ‏16. אבל `Ask Size` אחד אינו כל הסיפור

‏הכמות ברמה הראשונה יכולה:

- ‏להיעלם.
- ‏להתמלא מחדש.
- ‏להיות רק חלק מהנזילות האמיתית.
- ‏להיות שונה בין Venues.

‏לכן לא נבנה כלל עיוור כמו:

```text
Ask Size > 1000 = good
```

‏אלא נבדוק אותו אמפירית.

---

# ‏17. `Hidden Liquidity`

‏לא כל הכמות בשוק מוצגת.

‏יכולות להיות פקודות Hidden או Reserve.

‏לכן:

> ‏מה שרואים בספר הוא לא בהכרח כל מה שקיים.

‏מצד שני, אסור גם להניח שקיימת נזילות נסתרת שתציל אותנו.

‏ה־Backtest צריך להיות שמרני.

---

# ‏18. `Displayed Liquidity` מול `Executable Liquidity`

‏אפשר לחשוב על שתי שכבות:

## ‏Displayed Liquidity

‏מה שה־Feed מציג.

## ‏Executable Liquidity

‏מה שבאמת הצלחת לבצע במחיר ובזמן שרצית.

‏המדד השני הוא בסוף מה שמעניין אותנו.

---

# ‏19. `Fill Probability`

‏אם אתה מניח פקודת Limit ב־Bid, היא אינה מבוצעת אוטומטית.

‏יש קונים נוספים לפניך.

‏צריך שמוכרים יגיעו אל המחיר שלך ובכמות מספיקה.

‏לכן אפשר לחשוב על:

`Fill Probability`

‏כלומר:

> ‏מה הסיכוי שהפקודה שלי באמת תתמלא בזמן שהאות עדיין רלוונטי?

---

# ‏20. תור חשוב מאוד למסחר קצר

‏נניח:

```text
Bid = 10.00
```

‏יש כבר:

```text
50,000 shares
```

‏בתור לפני הפקודה שלך.

‏אם אתה מצטרף עכשיו עם 100 מניות, ייתכן שתמתין זמן רב יחסית.

‏אם האות שלך חי רק 5 שניות, אולי לא תקבל Fill בכלל.

‏לכן `limit at bid` יכול לחסוך Spread — אבל יש לו מחיר:

```text
lower fill certainty
```

---

# ‏21. `Time-to-Fill`

‏מדד חשוב נוסף:

```text
time_to_fill_ms
```

‏או:

```text
time_to_fill_seconds
```

‏במערכת שלך זה קריטי.

‏אם Strategy מצפה לרווח תוך 8 שניות אבל הקנייה מתמלאת אחרי 6 שניות — כמעט כל חלון ההזדמנות נעלם.

---

# ‏22. `Partial Fill`

‏שלחת:

```text
BUY 100
```

‏וקיבלת:

```text
Filled = 37
Remaining = 63
```

‏עכשיו הרובוט חייב להחליט:

- ‏האם להמשיך לחכות?
- ‏האם לבטל את השאר?
- ‏האם להתחיל כבר לנהל יציאה על 37?
- ‏מה קורה אם בזמן הזה האות נעלם?

‏לכן נזילות אינה רק שאלה של מחיר.

‏היא גם שאלה של State Management.

---

# ‏23. `Adverse Selection`

‏מושג חשוב מאוד.

‏`Adverse Selection` בפשטות:

> ‏קיבלת Fill דווקא ברגע שבו הצד השני ידע או הגיב למשהו שהפך את המחיר לפחות טוב עבורך.

‏לדוגמה:

‏אתה שם Buy Limit ב־Bid.

‏פתאום מישהו מוכר לך.

‏רגע אחר כך המחיר ממשיך לרדת.

‏קיבלת Fill — אבל זה היה Fill גרוע.

‏לכן:

> ‏`Fill Rate` גבוה לבדו אינו הוכחה לאיכות.

---

# ‏24. `Markout`

‏אחת הדרכים למדוד איכות Fill היא לבדוק מה קרה למחיר אחרי הביצוע.

‏לדוגמה:

```text
Fill price = 100.00
Mid after 1s  = 99.99
Mid after 5s  = 99.96
Mid after 10s = 99.94
```

‏עבור קנייה זה סימן שה־Fill היה בעייתי.

‏אפשר למדוד:

```text
markout_1s
markout_5s
markout_10s
```

‏אצלך זה מתחבר ישירות ליעד המסחר הקצר.

---

# ‏25. `Resiliency`

‏נניח שה־Ask Size הוא רק 200.

‏אכלו אותו.

‏אבל מיד מופיעים עוד 300 באותו מחיר.

‏זה אומר שהשוק התגלה כעמוק יותר מהצילום הראשוני.

‏היכולת הזאת של הספר להתמלא מחדש היא חלק מנזילות.

---

# ‏26. `Liquidity Regime`

‏נזילות משתנה במהלך היום.

‏אותה מניה יכולה להיות:

```text
09:31 — מאוד פעילה
12:30 — שקטה
15:58 — מאוד פעילה שוב
```

‏לכן אין דבר כזה רק:

```text
AAPL is liquid
```

‏יותר נכון לחשוב:

```text
AAPL is liquid now, for this size, in this session
```

---

# ‏27. פתיחה וסגירה שונות מאמצע היום

‏סביב הפתיחה והסגירה יש בדרך כלל הרבה יותר פעילות, אבל גם:

- ‏תנודתיות גבוהה.
- ‏שינויים מהירים ב־quotes.
- ‏אירועי auction.
- ‏Slippage אפשרי.

‏לכן לא מספיק לראות Volume גבוה.

‏צריך לבדוק את איכות הביצוע בפועל בכל `session regime`.

---

# ‏28. Extended Hours

‏ב־Pre-market וב־After-hours ייתכנו:

- ‏Spread רחב יותר.
- ‏פחות עומק.
- ‏פחות עסקאות.
- ‏קפיצות מחיר גדולות יותר.

‏לכן מערכת יכולה להחליט:

```text
RTH strategy != PRE/POST strategy
```

‏או אפילו:

```text
NO TRADING outside RTH
```

‏אבל זו החלטה לבדיקה, לא הנחה אוטומטית.

---

# ‏29. שוק אמריקאי מפוצל בין Venues

‏מניה אמריקאית יכולה להיסחר בכמה מקומות.

‏לכן `Liquidity` קיימת על פני שוק מפוצל.

‏ה־`NBBO` נותן את ה־Bid וה־Ask הטובים ברמה הארצית הרלוונטית.

‏אבל Depth ב־Venue אחד אינו בהכרח כל העומק בכל השוק.

---

# ‏30. למה Routing משפיע על נזילות בפועל

‏שני ברוקרים יכולים לראות שוק דומה אבל לנתב פקודות בצורה שונה.

‏פקודה יכולה להגיע ל:

- ‏Exchange.
- ‏Market Maker.
- ‏ECN.
- ‏ATS.
- ‏מסלול Smart Routing.

‏לכן ביצוע בפועל הוא שילוב של:

```text
Market liquidity
+
Broker routing
+
Order type
+
Latency
```

---

# ‏31. `Market Order` ונזילות

‏`Market Order` נותנת עדיפות גבוהה לביצוע מיידי.

‏אבל היא לא מבטיחה מחיר.

‏במניה נזילה מאוד ובכמות קטנה זה יכול להיות סביר יותר.

‏במניה דלילה או בזמן תנועה מהירה, המחיר יכול להיות גרוע יותר מהצפוי.

---

# ‏32. `Limit Order` ונזילות

‏`Limit Order` מגינה על מחיר מקסימלי בקנייה או מינימלי במכירה.

‏אבל אינה מבטיחה Fill.

‏לכן קיימת פשרה:

```text
Price control
vs
Execution certainty
```

‏אצלך זאת אחת הפשרות החשובות ביותר בכל המערכת.

---

# ‏33. `Maker` מול `Taker` בהקשר של נזילות

## ‏Maker

‏מוסיף נזילות לספר וממתין שמישהו יבצע נגדו.

## ‏Taker

‏לוקח נזילות קיימת ומבצע מיד.

‏`Maker` יכול לחסוך Spread או אפילו לקבל Rebate במסלולים מסוימים.

‏אבל הוא עלול לא לקבל Fill.

‏`Taker` מהיר יותר, אבל משלם יותר חיכוך.

---

# ‏34. למה האסטרטגיה שלך הופכת את הפשרה הזאת לקיצונית יותר

‏אם אתה מחזיק מניה שעות, המתנה של שנייה ל־Fill יכולה להיות זניחה.

‏אם אתה מחזיק 5–20 שניות:

> ‏שנייה היא חלק גדול מאוד מהעסקה.

‏לכן `Maker vs Taker` אצלך אינו רק נושא של עמלה.

‏הוא נושא של:

```text
Will the signal still exist when I get filled?
```

---

# ‏35. אצלך צריך למדוד `Executable Edge`

‏לא מספיק לחשב:

```text
Expected price move = +0.08%
```

‏צריך לחשב משהו קרוב יותר ל:

```text
Expected price move
- entry cost
- exit cost
- commission
- expected slippage
- adverse selection cost
```

‏התוצאה היא:

`Executable Edge`

‏בפשטות:

> ‏כמה יתרון נשאר אחרי שהופכים את התחזית לעסקה אמיתית.

---

# ‏36. דוגמה לרווח שנעלם בגלל נזילות

‏הרובוט חושב שהמניה צפויה לעלות:

```text
+0.10%
```

‏במחיר $50:

```text
Expected move = $0.05/share
```

‏אבל:

```text
Entry spread/slippage = $0.015
Exit spread/slippage  = $0.020
Commission/fees       = $0.005
```

‏נשאר:

```text
$0.05 - $0.04 = $0.01/share
```

‏ה־Edge האמיתי קטן בהרבה מהתחזית.

---

# ‏37. `Round-Trip Cost`

‏`Round Trip` = כניסה + יציאה.

‏במערכת שלך צריך לחשוב על העלות הכוללת:

```text
Entry friction
+
Exit friction
+
Fees
```

‏לא רק על מחיר הקנייה.

‏כי אתה מתכנן לצאת כמעט מיד.

---

# ‏38. מדד חשוב: `Expected Round-Trip Cost`

‏אפשר להחזיק Feature רעיוני:

```text
expected_round_trip_cost_pct
```

‏ואז להשוות ל־Edge הצפוי:

```text
expected_forward_move_pct
>
expected_round_trip_cost_pct
```

‏עם מרווח ביטחון.

---

# ‏39. `Liquidity Gate`

‏לפני שמניה מקבלת בכלל אפשרות להפוך ל־Top Candidate אפשר לבנות Gate.

‏לדוגמה רעיונית:

```text
spread <= threshold
fresh quote == true
ask_size sufficient
bid_size sufficient
recent trades >= threshold
```

‏אבל:

> ‏הספים אינם אמת אוניברסלית.

‏הם צריכים להימדד מהנתונים שלנו.

---

# ‏40. Hard Filter או Feature?

‏חלק ממדדי הנזילות יכולים להיות:

## ‏Hard Filter

```text
spread absurdly wide → reject
```

## ‏Feature

```text
slightly wider spread → lower score
```

‏זו הבחנה חשובה.

‏לא כל חיסרון חייב לפסול מניה.

---

# ‏41. נזילות צריכה להיות מותאמת ל־Position Size

‏אם מחר תגדיל את גודל העסקה מ־$5,000 ל־$50,000, אותה מניה יכולה לעבור מ:

```text
easy to execute
```

‏ל:

```text
market-impact problem
```

‏לכן Position Size חייב להיות Input למדידת נזילות.

---

# ‏42. `Capacity`

‏`Capacity` = כמה כסף אסטרטגיה יכולה להפעיל לפני שהביצוע מתחיל להרוס אותה.

‏אסטרטגיה יכולה להיות מצוינת ל־$5,000 ולא לעבוד ל־$5,000,000.

‏זה אחד המקומות שבהם אסטרטגיה קטנה יכולה להיות מעניינת גם אם אינה מעניינת מוסד גדול.

---

# ‏43. אצלך השאלה צריכה להיות מאוד פרקטית

‏בכל Candidate נשאל:

```text
Can I enter my planned size quickly?
Can I exit the same size quickly?
What is the expected round-trip friction?
```

‏לא:

```text
Is this generally a liquid stock?
```

---

# ‏44. `Buy Liquidity` ו־`Sell Liquidity`

‏נזילות אינה בהכרח סימטרית.

‏לפני קנייה חשוב לנו:

```text
Ask side
```

‏אבל מיד אחרי הקנייה, ליציאה חשוב:

```text
Bid side
```

‏לכן לרובוט שלך אסור לבדוק רק את ה־Ask.

‏הוא צריך לחשוב על Round Trip כבר לפני הכניסה.

---

# ‏45. מה קורה אם אתה רוצה להציב מכירה מיד אחרי הקנייה

‏אצלך ייתכן תכנון שבו:

```text
BUY fills
↓
SELL order is submitted immediately
```

‏או מבנה מותנה כמו Bracket/OTO/OCA בהתאם לברוקר ולפקודה.

‏זה יכול לצמצם זמן תגובה.

‏אבל עדיין צריך לדעת:

- ‏באיזה מחיר המכירה תוצב.
- ‏האם היא תתמלא.
- ‏מה קורה ב־Partial Fill.
- ‏מה קורה אם השוק נופל לפני שהמכירה מתמלאת.
- ‏מי מנהל את ה־Timeout.

‏נלמד את לוגיקת הכניסה והיציאה לעומק בפרקים הייעודיים.

---

# ‏46. `Time-to-Exit`

‏מדד שמתאים במיוחד לאסטרטגיה שלך:

```text
time_to_exit
```

‏לא רק:

```text
profit
```

‏אלא:

> ‏כמה זמן לקח להיפטר מהפוזיציה במחיר הרצוי או במחיר סביר.

---

# ‏47. `Time-to-First-Profitable-Exit`

‏מדד חזק למחקר שלך:

```text
time_to_first_profitable_exit
```

‏לדוגמה:

```text
Candidate A → profitable exit possible after 2.1s
Candidate B → after 18.4s
Candidate C → never within 60s
```

‏זה מתאים הרבה יותר למטרה שלך מאשר רק לבדוק Closing Price אחרי דקה.

---

# ‏48. למה `Last` לא מספיק לבדיקת Exit

‏נניח:

```text
Last = 50.10
```

‏אבל:

```text
Bid = 50.04
Ask = 50.10
```

‏אם אתה כבר מחזיק מניה ורוצה לצאת מיד, המחיר הרלוונטי יותר הוא ה־Bid.

‏לכן Backtest של אסטרטגיה קצרה על `Last` בלבד יכול להמציא רווח שלא היה ניתן למימוש.

---

# ‏49. `Executable PnL`

‏במקום לחשב:

```text
future_last - entry_last
```

‏נרצה במחקר מתקדם יותר לחשב משהו כמו:

```text
realistic_sell_price - realistic_buy_price - costs
```

‏זהו PnL קרוב יותר למציאות.

---

# ‏50. Liquidity Snapshot בזמן הבחירה

‏לכל החלטת Candidate כדאי לשמור:

```text
bid
bid_size
ask
ask_size
spread
spread_pct
mid
quote_age_ms
recent_trade_rate
recent_volume
```

‏אם יש Depth:

```text
depth_bid_1..N
depth_ask_1..N
```

‏כך אפשר לחקור בדיעבד למה Candidate הצליחה או נכשלה.

---

# ‏51. Liquidity Snapshot בזמן ה־Fill

‏כדאי לשמור שוב את מצב השוק בזמן שהפקודה באמת בוצעה.

‏כך אפשר להשוות:

```text
Decision market state
vs
Fill market state
```

‏ולראות כמה השתנה השוק בזמן ה־Latency.

---

# ‏52. `Decision-to-Fill Drift`

‏Feature מחקרי שימושי:

```text
decision_to_fill_price_drift
```

‏אם המניה כבר עלתה הרבה בין החלטה ל־Fill:

> ‏ייתכן שאנחנו קונים מאוחר מדי.

‏זה יכול להוביל לשיפור הסורק, המהירות או פקודת הכניסה.

---

# ‏53. `Spread Expansion`

‏מניה יכולה להיראות טובה ברגע הבחירה:

```text
Spread = 0.01
```

‏ואז תוך חצי שנייה:

```text
Spread = 0.08
```

‏לכן אפשר למדוד:

```text
spread_change
spread_expansion_rate
```

‏במיוחד לפני כניסה.

---

# ‏54. נזילות יכולה להיעלם בדיוק כשצריך אותה

‏זו אחת הסכנות המרכזיות.

‏במצב רגוע הספר נראה עמוק.

‏מגיעה תנועה חדה.

‏פקודות מתבטלות.

‏ה־Spread נפתח.

‏העומק נעלם.

‏ולכן:

> ‏נזילות היסטורית אינה הבטחה לנזילות בזמן לחץ.

---

# ‏55. `Liquidity Shock`

‏אפשר לכנות מצב כזה:

`Liquidity Shock`

‏למשל:

```text
Spread jumps
Depth collapses
Quotes become stale
Price gaps
```

‏מערכת יכולה להחליט שלא לפתוח עסקה חדשה בזמן כזה.

---

# ‏56. `Quote Age` הוא חלק מנזילות

‏Bid/Ask ישנים אינם באמת נזילות אמינה.

‏אם:

```text
quote_age = 4 seconds
```

‏באסטרטגיה של 5–10 שניות, זו בעיה רצינית.

‏לכן `Freshness Gate` צריך להשתלב גם כאן.

---

# ‏57. `Quote Stability`

‏אפשר למדוד כמה ה־Bid/Ask קופצים.

‏לדוגמה:

```text
spread stable for 5s
```

‏לעומת:

```text
spread changes 20 times in 1s
```

‏השני יכול להעיד על שוק מהיר או לא יציב.

‏זה לא בהכרח רע — אבל הביצוע שונה.

---

# ‏58. `Depth Imbalance`

‏אם יש לנו Level 2, אפשר לחשב יחס בין עומק הקנייה לעומק המכירה.

‏למשל:

```text
Bid depth = 10,000 shares
Ask depth = 3,000 shares
```

‏נוצר Imbalance.

‏אבל חשוב:

> ‏עומק יכול להתבטל מהר, ולכן לא נתייחס אליו כאל אמת קשיחה.

‏נבדוק אם הוא מוסיף כוח ניבוי.

---

# ‏59. `Microprice`

‏`Microprice` הוא ניסיון להעריך מחיר קצר־טווח בעזרת:

- ‏Best Bid.
- ‏Best Ask.
- ‏הכמויות בשני הצדדים.

‏זה נושא Microstructure שימושי למחקר מתקדם.

‏אין צורך להפוך אותו לחובה בשלב הראשון.

‏אבל חשוב שתכיר שהוא קיים ושאפשר לבדוק אותו כ־Feature.

---

# ‏60. `Liquidity Score`

‏אפשר בעתיד לבנות ציון נזילות נפרד.

‏לדוגמה רעיונית:

```text
LiquidityScore =
    spread quality
  + top-of-book depth
  + recent fillability
  + quote freshness
  + depth stability
```

‏אבל לא נמהר לערבב הכול ל־Score אחד.

‏קודם נבדוק כל Feature בנפרד.

---

# ‏61. למה `Liquidity Score` נפרד יכול להיות עדיף

‏נניח מניה עם:

```text
MomentumScore  = 95
LiquidityScore = 20
```

‏לעומת:

```text
MomentumScore  = 87
LiquidityScore = 94
```

‏ייתכן שהשנייה ניתנת לביצוע בצורה טובה בהרבה.

‏לכן לפעמים עדיף לחשוב בכמה צירים ולא במספר קסם אחד.

---

# ‏62. `Tradeability`

‏מושג שימושי למערכת שלך:

`Tradeability`

‏בפשטות:

> ‏עד כמה ההזדמנות שאיתרנו באמת ניתנת למסחר בגודל שלנו ובזמן שלנו.

‏אפשר לחשוב:

```text
Good signal
+
Good liquidity
+
Low execution friction
=
Tradeable opportunity
```

---

# ‏63. אצלך "הכי מבטיחה" חייבת לכלול יכולת ביצוע

‏אם מניה עולה הכי מהר אבל:

```text
Spread = 0.6%
```

‏והמניה השנייה עולה קצת פחות אבל:

```text
Spread = 0.02%
```

‏ייתכן מאוד שהשנייה היא הזדמנות טובה יותר למסחר אמיתי.

‏לכן Ranking אמיתי צריך להבחין בין:

```text
Best predicted move
```

‏לבין:

```text
Best executable opportunity
```

---

# ‏64. איך נבדוק האם נזילות באמת משפרת את הסורק

‏לא ננחש.

‏נחלק Candidates לקבוצות לפי:

```text
spread percentile
bid/ask size percentile
trade rate
quote age
```

‏ונבדוק:

```text
forward return 1s
forward return 5s
forward return 10s
forward return 30s
forward return 60s
```

‏אבל בנוסף:

```text
realistic executable return
fill probability
fill time
```

---

# ‏65. בדיקת `Time-to-Target` לפי נזילות

‏אפשר לשאול:

> ‏האם מניות עם Spread קטן מגיעות ליעד הרווח מהר יותר אחרי האות?

‏או:

> ‏האם עומק גדול משפר את הסיכוי לצאת תוך 10 שניות?

‏אלה שאלות שמתאימות ישירות לאופי המסחר שלך.

---

# ‏66. RCA למועמדת #1 שלא עבדה

‏נניח שה־Scanner בחר:

```text
Rank #1 = XYZ
```

‏והיא לא נתנה רווח מהיר.

‏ב־RCA נבדוק לפחות:

```text
Was momentum already decelerating?
Was spread too large?
Did spread expand after selection?
Was ask size too small?
Was bid support weak?
Did entry fill late?
Did decision-to-fill drift consume the edge?
Was quote stale?
Was activity collapsing?
Did liquidity vanish after entry?
```

‏כך שיפור Scanner לא יהיה ניחוש.

---

# ‏67. דוגמה — שתי מניות עם אותו Momentum

```text
AAA
change_10s = +0.30%
spread = 0.01%
ask_size = 4000
bid_size = 5000
quote_age = 30ms

BBB
change_10s = +0.30%
spread = 0.25%
ask_size = 100
bid_size = 80
quote_age = 900ms
```

‏לפי Momentum בלבד הן שוות.

‏לפי יכולת ביצוע — הן אינן קרובות בכלל.

---

# ‏68. דוגמה שמתאימה לסכום קטן

‏נניח:

```text
Capital per trade = $5,000
Stock price = $50
Order size ≈ 100 shares
```

‏מצב א':

```text
Ask Size = 8,000
Bid Size = 10,000
Spread = $0.01
```

‏100 מניות הן קטנות יחסית לשוק המוצג.

‏מצב ב':

```text
Ask Size = 120
Bid Size = 90
Spread = $0.10
```

‏אותן 100 מניות הן כמעט כל הנזילות ברמה הראשונה.

‏לכן אותו הון מתנהג אחרת לגמרי במניות שונות.

---

# ‏69. `Execution Budget`

‏אפשר להגדיר רעיון שימושי:

`Execution Budget`

‏כלומר:

> ‏כמה עלות ביצוע מקסימלית האסטרטגיה יכולה לסבול ועדיין להישאר רווחית.

‏לדוגמה:

```text
Expected gross edge = 0.12%
Required net edge   = 0.04%
```

‏אז כל החיכוך יחד חייב להישאר מתחת בערך:

```text
0.08%
```

‏זו מסגרת חשיבה, לא מספר קבוע.

---

# ‏70. `Liquidity Budget`

‏מתוך Execution Budget אפשר להקצות חלק ל:

```text
spread
slippage
fees
```

‏ואז Candidate שאינה עומדת בתקציב נפסלת גם אם ה־Momentum שלה מדהים.

---

# ‏71. אל תסנן לפי כלל שרירותי לפני בדיקה

‏לדוגמה:

```text
spread <= $0.01
```

‏נשמע פשוט.

‏אבל במניה של $5 זה 0.20%.

‏במניה של $500 זה 0.002%.

‏לכן לעיתים `spread_pct` או spread ביחס ל־target עדיפים.

---

# ‏72. Spread ביחס ל־Target

‏Feature שמותאם למטרה שלך:

```text
spread_to_target_ratio
```

‏לדוגמה:

```text
Target move = $0.05
Spread      = $0.01
Ratio       = 20%
```

‏לעומת:

```text
Target move = $0.02
Spread      = $0.01
Ratio       = 50%
```

‏אותו Spread — משמעות שונה מאוד.

---

# ‏73. `Round-Trip Spread Ratio`

‏אם צפוי שתשלם Spread גם בכניסה וגם ביציאה, אפשר לחשוב רעיונית על:

```text
expected_round_trip_friction / expected_target
```

‏ככל שהיחס גבוה יותר, העסקה שברירית יותר.

---

# ‏74. `Liquidity-adjusted momentum`

‏בהמשך אפשר לבדוק Feature משולב כמו:

```text
momentum / execution_cost
```

‏או להשאיר את שני הצירים נפרדים.

‏לא נחליט עכשיו.

‏הנתונים יכריעו.

---

# ‏75. למה לא להאמין לכל עצה כללית מהאינטרנט

‏עצה כמו:

> ‏"מניה עם מיליון מניות Volume היא נזילה"

‏יכולה להתאים להקשר מסוים ולהיות חסרת משמעות אצלך.

‏אתה צריך לדעת:

```text
my order size
my holding time
my target profit
my execution style
```

‏ואז לבדוק את הנזילות ביחס אליהם.

---

# ‏76. כלל ההתאמה לקורס שלנו

‏נלמד תמיד שני דברים:

## ‏הידע הכללי

‏איך אנשי שוק מגדירים ומודדים נזילות.

## ‏היישום אצלך

‏האם $5,000 יכולים להיכנס ולצאת תוך שניות, ובאיזו עלות צפויה.

‏כך נקבל גם ידע מקצועי רחב וגם מערכת מותאמת.

---

# ‏77. נתונים שכדאי לשמור למחקר נזילות

```text
symbol
as_of_time
bid
bid_size
ask
ask_size
mid
spread_abs
spread_pct
quote_age_ms

order_size_shares
order_notional

recent_trade_count
recent_volume

entry_decision_time
entry_submit_time
entry_fill_time
entry_fill_price
entry_filled_qty

exit_submit_time
exit_fill_time
exit_fill_price
exit_filled_qty
```

‏אם יש Depth:

```text
bid_depth_levels
ask_depth_levels
```

---

# ‏78. Features שאפשר לגזור

```text
spread_to_target_ratio
order_to_ask_size_ratio
order_to_bid_size_ratio
entry_slippage
exit_slippage
round_trip_slippage
entry_time_to_fill
exit_time_to_fill
fill_ratio
markout_1s
markout_5s
markout_10s
decision_to_fill_drift
spread_expansion
```

---

# ‏79. מדדי הצלחה למסחר הקצר שלך

‏במקום רק:

```text
Win Rate
```

‏נרצה גם:

```text
Median entry fill time
Median exit fill time
P95 exit fill time
Average round-trip friction
% fully filled
% partial fills
% profitable within 5s
% profitable within 10s
% profitable within 30s
% exited within 60s
```

‏אלה מדדים הרבה יותר מחוברים לאסטרטגיה שלך.

---

# ‏80. P95 חשוב במיוחד

‏נניח:

```text
Median exit time = 1.2s
```

‏נשמע מצוין.

‏אבל:

```text
P95 exit time = 45s
```

‏זה אומר שיש זנב בעייתי.

‏במערכת שרוצה להיפטר מפוזיציה מהר, הזנב הזה חשוב מאוד.

---

# ‏81. Worst Case חשוב יותר ממה שנראה

‏אם 99 עסקאות מרוויחות שקל ואחת נתקעת במניה לא נזילה ומפסידה הרבה, היא יכולה למחוק את כולן.

‏לכן נזילות היא גם ניהול סיכון.

---

# ‏82. Liquidity Kill Switch

‏מערכת יכולה להחזיק כללים כמו:

```text
spread exploded → no new trade
quote stale → no new trade
market data disconnected → no new trade
liquidity below emergency threshold → block entry
```

‏בפוזיציה קיימת צריך כלל יציאה נפרד — נדון בו בפרקי הסיכון וה־Execution.

---

# ‏83. Feed רחב מול Feed עמוק

‏כמו שלמדנו קודם:

```text
All stocks
↓
Wide feed
↓
Top candidates
↓
Deep liquidity check
↓
Trade / No Trade
```

‏לשלב נזילות עמוק אפשר להשתמש במקור שונה מה־Wide Scanner אם צריך.

‏אנחנו מתכננים לפי הדרישה, לא לפי ספק יחיד.

---

# ‏84. מה אם אתר בנק, `Alpaca`, `IBKR` או ספק אחר נותנים נתונים שונים?

‏לא מניחים שאחד תמיד צודק.

‏שומרים:

```text
provider
feed type
coverage
timestamp
```

‏ומשווים אמפירית:

- ‏טריות.
- ‏כיסוי.
- ‏Bid/Ask.
- ‏Sizes.
- ‏יציבות.
- ‏התאמה לביצועים שהברוקר נתן בפועל.

---

# ‏85. `Execution Truth`

‏בסוף, האמת החשובה ביותר היא:

```text
What did the broker actually fill?
```

‏Feed חיצוני יכול להגיד לנו מה חשבנו שקורה.

‏ה־Fill של הברוקר אומר מה קרה לחשבון שלנו.

‏לכן שני סוגי הנתונים צריכים להישמר.

---

# ‏86. Backtest של נזילות חייב להיות זהיר

‏אם ה־Backtest משתמש רק ב־OHLC:

```text
Open
High
Low
Close
```

‏אי אפשר לדעת באמת:

- ‏מה היה Spread.
- ‏כמה עומק היה.
- ‏מתי היית מקבל Fill.
- ‏מה היה Slippage.

‏לכן Backtest של שניות צריך שכבת ביצוע ריאליסטית יותר.

---

# ‏87. אפשר להתחיל פשוט ולהשתפר

‏שלב ראשון:

```text
Last + Bid + Ask
```

‏שלב שני:

```text
+ sizes
+ trade count
```

‏שלב שלישי אם הוכח צורך:

```text
+ depth
+ fill model
+ queue model
```

‏לא חייבים לבנות Microstructure Simulator מלא ביום הראשון.

---

# ‏88. למה זה תואם לגישת KISS

‏המטרה אינה לבנות את המודל הכי מתוחכם.

‏המטרה היא:

> ‏להוסיף מורכבות רק כאשר היא פותרת טעות מדידה אמיתית.

‏אם Bid/Ask פשוטים כבר מסבירים 95% מהבעיה, אין צורך להתחיל מ־Level 3.

---

# ‏89. מה צריך לזכור מהידע הכללי

1. ‏נזילות היא יכולת לבצע מהר ובמחיר סביר.
2. ‏Volume ונזילות אינם אותו דבר.
3. ‏Spread הוא רק חלק מהנזילות.
4. ‏Depth חשוב ביחס לגודל הפקודה.
5. ‏תור משפיע על Limit Order.
6. ‏Market Order מעדיפה ביצוע על שליטה במחיר.
7. ‏נזילות משתנה בזמן.
8. ‏Hidden Liquidity קיימת, אבל אי אפשר לסמוך עליה מראש.
9. ‏Routing ו־Venue משפיעים על הביצוע.
10. ‏ה־Fill בפועל הוא מקור האמת הסופי.

---

# ‏90. מה צריך לזכור במיוחד עבור הרובוט שלך

1. ‏אנחנו מתכננים Round Trip עוד לפני הקנייה.
2. ‏Candidate אינה טובה אם קשה לצאת ממנה מהר.
3. ‏הגודל הרלוונטי הוא גודל העסקה שלך, לא מדד נזילות כללי.
4. ‏Spread צריך להימדד ביחס לרווח שאתה מחפש.
5. ‏`Time-to-Fill` חשוב כמעט כמו מחיר.
6. ‏`Time-to-First-Profitable-Exit` הוא מדד מרכזי.
7. ‏`Decision-to-Fill Drift` יכול לחשוף כניסה מאוחרת.
8. ‏`Markout` יכול לחשוף Fill שנראה טוב אבל היה בעצם רע.
9. ‏מניה יכולה להיות #1 במומנטום ועדיין להיות בלתי ניתנת למסחר עבור האסטרטגיה שלך.
10. ‏המטרה היא לא "הכי עולה" אלא **ההזדמנות הכי טובה שניתנת לביצוע נטו**.

---

# ‏91. בדיקת הבנה עצמית

‏נסה לענות בלי לחזור למעלה:

1. ‏למה Volume גבוה לא מוכיח נזילות גבוהה?
2. ‏למה נזילות תלויה בגודל הפקודה שלך?
3. ‏מה זה Walking the Book?
4. ‏מה ההבדל בין Spread ל־Slippage?
5. ‏למה Limit Order יכולה להיות זולה יותר אבל מסוכנת לאות קצר?
6. ‏מה זה Adverse Selection?
7. ‏מהו Markout?
8. ‏למה צריך לבדוק גם Bid וגם Ask לפני BUY?
9. ‏מהו Expected Round-Trip Cost?
10. ‏למה Candidate עם Momentum מעט חלש יותר יכולה להיות עסקה טובה יותר בפועל?

---

# ‏92. מקורות רשמיים שנבדקו לפרק

‏הפרק נבדק מול מקורות רשמיים, ובפרט:

- ‏`SEC` — Spread, Trade Execution ודיונים על quoted/effective spread ונזילות.
- ‏`Nasdaq Trader` — מודל price/time priority, displayed/non-displayed liquidity ו־order book.
- ‏`Interactive Brokers` — Order Types, Smart Routing, Pegged orders והסברים על market impact ו־slippage.

‏פרטי ברוקר, תמחור, Routing ומוצרים משתנים עם הזמן, ולכן לפני Implementation חי בודקים שוב את התיעוד המעודכן.

---

# ‏Checkpoint

‏שלב 11 הגדיר את ההבדל בין פעילות לנזילות, הסביר איך Spread, Depth, Queue, Slippage, Market Impact ו־Fill Probability הופכים אות תיאורטי לעסקה אמיתית, וחיבר את כל זה ליעד שלך: כניסה ויציאה של סכום קטן בתוך שניות עם חיכוך קטן ככל האפשר.

‏בשלב הבא נבנה את שכבת ה־`Filters`: אילו תנאים פוסלים מניה מיד, אילו רק מורידים אותה בדירוג, ואיך בונים משפך שלא זורק מוקדם מדי את המניה שבאמת הייתה ההזדמנות הטובה ביותר.