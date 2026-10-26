# ‏שלב 38 — `Queue Position` ו־Limit Order Subtleties: למה Touch אינו Fill

> ‏מטרת הפרק: להבין לעומק איך פקודת `Limit` פסיבית באמת מתנהגת בתוך ספר הפקודות, מה קובע את סדר הקדימות, למה מחיר שנגע ב־limit שלנו עדיין לא מוכיח שקיבלנו Fill, איך `cancel/replace` משנה את המיקום שלנו בתור, ואיך בונים מודל Fill סביר בלי להעמיד פנים שיש לנו מידע שאין לנו.
>
> ‏העיקרון המרכזי: **Limit Order הוא לא רק מחיר. הוא מקום בתור, זמן, venue, liquidity regime וסיכון ל־adverse selection.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. למה `Queue Position` חשוב בכלל

‏נניח שה־Bid הוא:

```text
100.00 x 8,000
```

‏ואנחנו שולחים Buy Limit על `100.00`.

‏מבחינת מחיר, אנחנו ב־best bid.

‏אבל אנחנו לא בהכרח הראשונים.

‏אם כבר עומדות לפנינו אלפי מניות, ייתכן שהשוק ייגע שוב ושוב ב־`100.00` ואנחנו עדיין לא נקבל Fill.

---

# ‏2. מחיר זה רק ממד אחד

‏לפקודת Limit יש לפחות ארבעה ממדים חשובים:

```text
Price
Priority
Size
Time
```

‏ובפועל גם:

```text
Venue
Order attributes
Matching rules
Hidden liquidity
Market state
```

---

# ‏3. מהו `Queue Position`

‏`Queue Position` הוא המיקום היחסי שלנו בין Orders אחרים שמתחרים על אותו מחיר.

‏בפישוט:

```text
Volume Ahead
Our Order
Volume Behind
```

‏ככל שיש יותר volume לפנינו, נדרש יותר flow נגדי לפני שנוכל להתמלא.

---

# ‏4. `Price-Time Priority`

‏במודל נפוץ של התאמת Orders, הקדימות נקבעת קודם לפי מחיר ואז לפי זמן.

‏כלומר:

1. ‏מחיר טוב יותר קודם.
2. ‏באותו מחיר — Order ותיק יותר קודם.

‏זה נקרא לעיתים `FIFO` או `Price-Time Priority`.

---

# ‏5. למה לא להניח שכל venue עובד אותו דבר

‏לא כל זירת מסחר חייבת להשתמש בדיוק באותו matching algorithm.

‏יכולים להיות מנגנונים שונים כגון:

- ‏Price-Time.
- ‏Pro-Rata.
- ‏Size-based priorities.
- ‏Special order attributes.
- ‏Retail/participant priority rules.

‏לכן ה־Execution Engine צריך להתייחס לכל venue לפי capability/rules שלו.

---

# ‏6. `NBBO` אינו Queue אחת

‏כאשר אנחנו רואים:

```text
Bid = 100.00
Ask = 100.01
```

‏זה יכול להיות צירוף של כמה venues.

‏כל venue מחזיק Queue נפרדת.

‏לכן אין דבר כזה בהכרח “התור של ה־NBBO”.

---

# ‏7. Aggregated Size

‏ב־consolidated quote אנחנו עשויים לראות:

```text
100.00 x 12,000
```

‏אבל ה־12,000 יכולים להיות מפוזרים בין venues שונים.

‏אם הפקודה שלנו נמצאת ב־venue אחד, volume ב־venue אחר אינו בהכרח לפנינו.

---

# ‏8. המשמעות ל־Queue Modeling

‏כדי להעריך Queue בצורה טובה צריך לדעת לפחות:

- ‏איפה ה־Order שלנו resting.
- ‏מה היה displayed size באותו venue.
- ‏מה היה לפנינו בזמן ACK/booking.
- ‏איזה trades/cancels/update events התרחשו מאז.

---

# ‏9. `Touch != Fill`

‏אחת הטעויות הנפוצות ב־Backtest:

```text
Low <= BuyLimit
=> Filled
```

‏זה מודל אופטימי מדי.

‏המחיר יכול להגיע ל־limit בלי להגיע בכלל ל־Order שלנו בתור.

---

# ‏10. גם Trade במחיר שלנו אינו בהכרח Fill

‏נניח שנרשמה עסקה ב־`100.00`.

‏זה עדיין לא מוכיח שה־Order שלנו התמלא.

‏ייתכן שהיו לפנינו:

```text
20,000 shares
```

‏והעסקה הייתה רק:

```text
500 shares
```

---

# ‏11. `Volume Ahead`

‏המשתנה החשוב הראשון במודל Queue הוא:

```text
volume_ahead
```

‏כלומר אומדן לכמות שהשוק צריך לצרוך לפני שה־Order שלנו מגיע לקדמת התור.

---

# ‏12. Queue Estimate ולא Queue Truth

‏ברוב מערכות retail/personal algo אין לנו מידע מושלם על מיקום התור.

‏לכן נכון יותר לדבר על:

```text
estimated_volume_ahead
queue_confidence
```

‏ולא על מספר מדויק שאנחנו לא באמת יודעים.

---

# ‏13. למה `L1` מוגבל

‏`L1` נותן בדרך כלל best bid/ask וגדלים.

‏הוא לא מספר לנו:

- ‏מי עומד בתור.
- ‏מתי כל Order נכנס.
- ‏כמה hidden liquidity קיימת.
- ‏איזה cancellation הסיר volume מלפנינו לעומת מאחורינו.

---

# ‏14. למה `L2` עדיין לא תמיד מספיק

‏גם depth ברמת price levels אינו בהכרח market-by-order.

‏לדוגמה:

```text
100.00 -> 5,000
99.99  -> 8,500
```

‏אנחנו יודעים aggregate size לכל price level, אבל לא בהכרח את סדר כל ה־Orders בתוך הרמה.

---

# ‏15. `Market-by-Order`

‏Data עשיר יותר עשוי לחשוף Orders או events פרטניים יותר.

‏זה יכול לאפשר queue reconstruction טוב יותר.

‏אבל גם אז קיימים:

- ‏hidden orders.
- ‏icebergs.
- ‏venue-specific semantics.
- ‏feed latency.
- ‏data-loss risk.

---

# ‏16. למה Queue Reconstruction קשה

‏כדי לשחזר Queue צריך לעקוב אחרי sequence של:

```text
Add
Modify
Cancel
Trade
Replace
Refresh
```

‏אם אפילו event אחד חסר, מצב הספר המשוחזר עלול לסטות מהמציאות.

---

# ‏17. Sequence Numbers

‏כאשר feed מספק sequence numbers, הם קריטיים לגילוי gaps.

‏אם ראינו:

```text
1001
1002
1004
```

‏אנחנו יודעים שמשהו חסר.

‏Queue model צריך להפוך ל־degraded או invalid עד recovery.

---

# ‏18. Snapshot + Incremental Updates

‏מבנה נפוץ:

```text
Snapshot
+ incremental events
= current reconstructed book
```

‏אם incremental stream נשבר, snapshot חדש נדרש לעיתים כדי לבנות state מחדש.

---

# ‏19. Queue Invariant

‏אסור למודל להניח:

```text
book_state_is_valid = true
```

‏אם ידוע שהיה gap שלא תוקן.

---

# ‏20. `Queue Confidence`

‏כדאי להחזיק מדד כמו:

```text
HIGH
MEDIUM
LOW
UNKNOWN
```

‏הוא משפיע על כמה אגרסיבי מותר למודל להיות בהנחות Fill.

---

# ‏21. Initial Queue Estimate

‏כאשר Order נכנס במחיר שכבר קיים בספר, baseline שמרני הוא להניח שה־displayed volume שכבר נמצא ברמה עומד לפנינו.

‏לדוגמה:

```text
Displayed Bid Size = 4,000
Our New Buy Limit = 300
```

‏baseline:

```text
estimated_volume_ahead ≈ 4,000
```

---

# ‏22. למה זה עדיין רק Approximation

‏ה־4,000 יכולים להשתנות בין רגע של observation לרגע שבו Order שלנו באמת נקלט ב־venue.

‏בזמן latency יכול לקרות:

- ‏trade.
- ‏cancel.
- ‏new order.
- ‏price move.

---

# ‏23. `Observation Time` מול `Booking Time`

‏צריך להבחין בין:

```text
quote_received_time
order_submit_time
broker_ack_time
venue_booked_time
```

‏האחרון לעיתים אינו ידוע לנו בדיוק.

---

# ‏24. Latency יוצרת Queue Uncertainty

‏ככל שהזמן בין quote observation לבין booking גדול יותר, ההערכה הראשונית פחות אמינה.

---

# ‏25. Trades Against Our Level

‏אם אנחנו Buy Limit ב־bid, aggressive sellers יכולים לצרוך את ה־bid.

‏בפישוט:

```text
volume_ahead -= qualifying_sell_volume
```

‏אבל רק אם אנחנו בטוחים שהעסקה באמת צרכה את אותו queue/venue.

---

# ‏26. `Qualifying Volume`

‏לא כל trade צריך להפחית volume ahead.

‏צריך להתחשב ב־:

- ‏מחיר.
- ‏venue.
- ‏trade condition.
- ‏timestamp/order.
- ‏האם trade באמת aggressed against displayed liquidity.

---

# ‏27. Trade Direction

‏לעיתים צריך להסיק האם trade היה buyer-initiated או seller-initiated.

‏הסקה שגויה יכולה לגרום למודל Queue שגוי.

---

# ‏28. Quote Changes ללא Trade

‏Displayed size יכול לרדת גם בגלל cancel.

‏אם ה־size ברמה ירד מ־5,000 ל־3,000 ללא trade ברור, ייתכן ש־2,000 בוטלו.

‏אבל האם הם היו לפנינו?

‏לא בהכרח.

---

# ‏29. Cancel Ahead vs Cancel Behind

‏אם Order לפנינו בוטל, המצב שלנו משתפר.

‏אם Order מאחורינו בוטל, המצב שלנו לא משתנה.

‏עם aggregate book בדרך כלל אי אפשר לדעת מי משניהם קרה.

---

# ‏30. Queue Model Conservative

‏מודל שמרני יכול להניח שרק חלק מירידת displayed size עוזר לנו.

‏לדוגמה:

```text
queue_cancel_credit = 0.0 .. 1.0
```

‏זה parameter למחקר, לא עובדה.

---

# ‏31. Optimistic Model

‏מודל אופטימי עשוי לתת credit גבוה ל־cancellations.

‏הוא יפיק Fill Rate גבוה יותר.

‏צריך להציג אותו כתרחיש optimistic — לא truth.

---

# ‏32. Stress Model

‏מודל stress יכול להניח שחלק גדול מה־cancels היו מאחורינו.

‏כך נבדוק האם האסטרטגיה עדיין עובדת תחת queue assumptions קשים יותר.

---

# ‏33. שלושה Queue Scenarios

‏שימושי להחזיק:

```text
Optimistic
Base
Conservative
```

‏ולא תוצאה יחידה.

---

# ‏34. `Touch Fill Model`

‏המודל הפשוט ביותר:

```text
price touches limit => fill
```

‏טוב רק כ־upper bound גס מאוד.

‏לא כמודל production-grade.

---

# ‏35. `Trade-Through Model`

‏מודל קצת שמרני יותר:

```text
price trades through limit => fill
```

‏לדוגמה Buy Limit ב־100:

```text
trade <= 99.99
```

‏יכול להוות Evidence חזק יותר ש־100 נצרך.

---

# ‏36. גם Trade-Through אינו תמיד הוכחה מוחלטת

‏הסיבות כוללות:

- ‏venues שונים.
- ‏hidden liquidity.
- ‏feed ordering.
- ‏locked/crossed market.
- ‏trade conditions.

---

# ‏37. `Volume Depletion Model`

‏מודל מתקדם יותר עוקב אחרי estimated volume ahead.

```text
if consumed_volume >= estimated_volume_ahead:
    fill becomes possible
```

---

# ‏38. Fill Becomes Possible ≠ Certain

‏גם אחרי depletion משוער יכולות להיות אי־ודאויות.

‏לכן אפשר להחזיק:

```text
fill_probability
```

‏ולא רק boolean.

---

# ‏39. Partial Fill

‏כאשר flow הגיע אלינו, הוא לא חייב למלא את כל הכמות.

‏לדוגמה:

```text
Our size = 1,000
Remaining aggressor volume = 250
```

‏ייתכן שנקבל רק:

```text
250 filled
750 working
```

---

# ‏40. Partial Fill משנה את העסקה

‏אחרי partial fill משתנים:

- ‏Exposure.
- ‏Remaining order size.
- ‏Risk.
- ‏Exit obligations.
- ‏Queue state של היתרה.

---

# ‏41. Queue of Remaining Quantity

‏בדרך כלל היתרה של אותו Order שומרת priority בהתאם לחוקי venue, אבל modify/replace יכול לשנות זאת.

‏אסור להניח semantics אחידים בין venues/brokers.

---

# ‏42. `Cancel/Replace`

‏כאשר מבטלים Order ושולחים חדש, לרוב מאבדים את ה־time priority שהיה לישן.

‏כלומר:

```text
better price / refreshed intent
```

‏יכול לבוא במחיר של:

```text
worse queue position
```

---

# ‏43. Modify אינו תמיד Replace סמנטי זהה

‏ברוקר יכול להציג לנו `modify`, אבל מה שקורה venue-side עשוי להיות:

- ‏amend ששומר priority בתנאים מסוימים.
- ‏cancel + new.
- ‏שינוי שמאבד priority.

‏צריך לדעת מה semantics של המסלול בפועל.

---

# ‏44. Quantity Reduction

‏בחלק ממערכות matching, הקטנת quantity עשויה להתנהג אחרת מהגדלה.

‏זה venue-specific.

‏אין להכליל בלי אימות.

---

# ‏45. Price Change כמעט תמיד משמעותי ל־Priority

‏כאשר משנים price level, אנחנו עוברים Queue.

‏גם אם המחיר החדש הוא “טוב יותר”, איבדנו את המקום הישן.

---

# ‏46. Repricing Cost

‏לכל cancel/replace יש לפחות שלוש עלויות:

```text
message latency
queue reset risk
decision churn
```

---

# ‏47. `Queue Jumping` באמצעות מחיר

‏אפשר לשפר priority על־ידי מעבר למחיר אגרסיבי יותר.

‏אבל אז משלמים יותר spread או price impact.

---

# ‏48. Join vs Improve vs Cross

‏ל־Buy Order:

```text
Join bid
Improve bid
Cross ask
```

‏אלה שלוש רמות urgency שונות.

---

# ‏49. Join

‏יתרון:

- ‏שומר על passive price.

‏חיסרון:

- ‏יכול להיות queue ארוך.

---

# ‏50. Improve

‏אם tick structure מאפשר, אפשר להציג מחיר טוב יותר מה־bid הקיים בלי לחצות את ask.

‏זה עשוי לתת priority גבוה יותר במחיר החדש.

---

# ‏51. Cross

‏כאשר limit חוצה את ה־ask, הוא הופך marketable.

‏זה מעלה fill probability אך משלם spread ויכול להגדיל adverse selection/impact.

---

# ‏52. Queue Position מול Signal Decay

‏אם signal half-life הוא 3 שניות, Queue מצוין שאולי יתמלא בעוד 20 שניות אינו בהכרח בעל ערך.

---

# ‏53. `Expected Queue Wait`

‏אפשר לאמוד:

```text
expected_wait ≈ volume_ahead / expected_aggressive_flow_rate
```

‏זה approximation בלבד.

---

# ‏54. Flow Rate אינו קבוע

‏Aggressive flow יכול להשתנות במהירות.

‏לכן צריך להשתמש ב־recent flow ולא בממוצע יומי פשוט.

---

# ‏55. Queue Pressure

‏שימושי למדוד:

```text
volume_ahead
recent_opposite_aggressive_volume
cancel_rate_at_level
spread_state
microprice
```

---

# ‏56. `Time-to-Fill Distribution`

‏במקום מספר יחיד:

```text
Expected fill time = 4.2s
```

‏עדיף לחשוב על distribution:

```text
P(fill < 1s)
P(fill < 3s)
P(fill < 5s)
```

---

# ‏57. Fill Probability by Deadline

‏לרובוט קצר מאוד, השאלה החשובה אינה:

```text
Will it fill eventually?
```

‏אלא:

```text
Will it fill before the signal expires?
```

---

# ‏58. `Signal Deadline`

‏אפשר להגדיר:

```text
signal_deadline = signal_time + signal_ttl
```

‏אם expected queue wait חורג ממנו, passive entry עלול להיות לא רלוונטי.

---

# ‏59. Opportunity Cost

‏אם לא קיבלנו Fill והמניה עלתה מיד, הפסדנו opportunity.

‏זו עלות אמיתית של passive execution.

---

# ‏60. Adverse Selection

‏הבעיה ההפוכה:

‏לפעמים דווקא כאשר קיבלנו Fill, זה קרה כי השוק ידע משהו רע יותר מאיתנו.

---

# ‏61. `Filled Because Wrong`

‏ב־Buy Limit פסיבי, ייתכן שהמוכר האגרסיבי מגיע כי המחיר עומד לרדת.

‏לכן:

```text
high fill rate
```

‏אינו בהכרח סימן טוב.

---

# ‏62. Markout

‏אחרי Fill מודדים את המחיר לאחר:

```text
100ms
500ms
1s
2s
5s
10s
```

‏בהתאם ל־horizon של האסטרטגיה.

---

# ‏63. Passive Fill Markout

‏אם passive Buy fills ואחריו המחיר יורד שוב ושוב, יש evidence ל־adverse selection.

---

# ‏64. Queue Quality

‏לכן Queue טוב אינו רק:

```text
short wait
```

‏אלא שילוב של:

```text
fill probability
fill time
post-fill markout
```

---

# ‏65. Queue Position Feature

‏אפשר להכניס ל־Execution Policy features כמו:

```text
estimated_volume_ahead
queue_age
level_depletion_rate
cancel_rate
trade_rate
spread_ticks
signal_age
```

---

# ‏66. לא להכניס Queue Feature ל־Scanner אוטומטית

‏Prediction ו־Execution הם domains שונים.

‏אפשר להשתמש ב־Queue info כדי להחליט איך להיכנס, בלי לשנות את ה־Score של המניה עצמה.

---

# ‏67. `Execution Feasibility`

‏עם זאת, אפשר להחזיק שכבה שמעריכה:

```text
Can we realistically enter before edge decays?
```

‏זו החלטת tradability/execution readiness.

---

# ‏68. Queue-Aware `NO TRADE`

‏Candidate יכול להיות #1 ועדיין לקבל:

```text
NO TRADE
```

‏אם הדרך היחידה להיכנס בזמן דורשת מחיר שמוחק את ה־edge.

---

# ‏69. `Expected Net Edge After Queue`

‏אפשר לחשוב על:

```text
Expected Net Edge
= Signal Edge
- Expected Spread Cost
- Expected Slippage
- Queue Delay Cost
- Miss Probability Cost
- Adverse Selection Cost
```

---

# ‏70. Queue Delay Cost

‏אם edge דועך עם הזמן, כל שנייה בתור יכולה להקטין את הערך הצפוי.

---

# ‏71. `Queue Age`

‏Order שיושב זמן רב אינו בהכרח טוב יותר רק כי הוא “קרוב יותר”.

‏צריך לבדוק האם signal עדיין תקף.

---

# ‏72. Sunk Cost Fallacy

‏טעות:

> ‏“כבר חיכינו 8 שניות, חבל לבטל.”

‏החלטה נכונה צריכה להתבסס על expected value מכאן והלאה.

---

# ‏73. Queue Position אינו נכס אם ה־Signal מת

‏מקום ראשון בתור ל־trade שכבר לא רוצים לבצע שווה אפס.

---

# ‏74. Cancel Decision

‏שאלה נכונה:

```text
EV(keep waiting) vs EV(cancel/reprice/cross/abandon)
```

---

# ‏75. Cancel Latency

‏גם Cancel אינו מיידי.

‏בין בקשת ביטול לבין ACK יכול להגיע Fill.

---

# ‏76. `Cancel/Fill Race`

‏מצב מסוכן:

```text
send cancel
assume order gone
send replacement
old order fills
new order fills
```

‏וכעת exposure כפול.

---

# ‏77. לכן Cancel Pending הוא State

‏צריך מצב מפורש:

```text
CANCEL_PENDING
```

‏ולא boolean `cancelSent=true`.

---

# ‏78. Replacement Intent

‏אפשר להכין replacement intent, אבל לא תמיד מותר לשלוח אותו לפני שמצב ה־Order הקודם ברור.

---

# ‏79. Overfill Protection

‏Execution Engine צריך לחשב exposure כולל:

```text
filled_qty
+ potentially_fillable_working_qty
```

‏ולא רק confirmed position.

---

# ‏80. Working Orders הם Risk

‏Order שעדיין פתוח הוא pending exposure.

---

# ‏81. Queue Position אחרי Reconnect

‏אחרי reconnect בדרך כלל אין לנו זכות להניח שה־queue estimate הישן עדיין תקף.

---

# ‏82. Queue State Recovery

‏לאחר gap/reconnect:

```text
queue_confidence = UNKNOWN
```

‏עד reconstruction מחדש או policy שמרני.

---

# ‏83. Hidden Liquidity

‏Displayed size אינו כל liquidity שקיימת.

‏יש Orders שאינם מוצגים במלואם.

---

# ‏84. Iceberg / Reserve Concept

‏Order גדול יכול להציג רק חלק מהכמות.

‏כאשר החלק המוצג נצרך, quantity נוספת יכולה להופיע.

---

# ‏85. המשמעות ל־Queue Model

‏Book level שנראה כמעט depleted יכול להתמלא מחדש.

‏לכן:

```text
visible_size == true_remaining_size
```

‏אינה הנחה בטוחה.

---

# ‏86. Replenishment Signal

‏Repeated replenishment באותו price level יכול להיות Evidence ל־hidden/reserve liquidity.

---

# ‏87. אבל לא להסיק יותר מדי

‏Replenishment יכול לנבוע גם מ־new orders חדשים.

‏צריך להבדיל בין pattern לבין certainty.

---

# ‏88. Displayed Liquidity Mirage

‏Displayed size גדול יכול להיעלם מהר מאוד דרך cancels.

‏לכן depth snapshot יחיד אינו guarantee.

---

# ‏89. `Spoofing-like` Patterns

‏לא כל ביטול גדול הוא manipulation.

‏במחקר execution נכון למדוד behavior, לא לייחס כוונה ללא evidence.

---

# ‏90. Cancel Rate כFeature

‏אפשר למדוד:

```text
cancel_rate_at_best_bid
cancel_rate_at_best_ask
```

‏כחלק מ־queue stability.

---

# ‏91. Queue Stability

‏Level שבו size קופץ כל הזמן עשוי להיות פחות predictable מ־level יציב.

---

# ‏92. `Book Churn`

‏אפשר למדוד:

```text
adds + cancels + modifies per second
```

‏ברמת מחיר או צד.

---

# ‏93. High Churn

‏High churn מקטין confidence ב־queue estimate שנבנה על snapshot ישן.

---

# ‏94. Spread Regime

‏Queue tactics שונות כאשר spread הוא:

```text
1 tick
2 ticks
5 ticks
```

---

# ‏95. One-Tick Spread

‏כאשר spread הוא tick אחד, אין לעיתים מקום לבצע price improvement בלי לחצות.

---

# ‏96. Multi-Tick Spread

‏כאשר spread רחב יותר, קיימות יותר אפשרויות:

```text
join
improve by 1 tick
improve near midpoint
cross
```

---

# ‏97. Tick Size Matters

‏אסור לחשוב רק באחוזים.

‏במניות זולות, tick אחד יכול להיות משמעותי מאוד יחסית ל־edge.

---

# ‏98. Relative Tick Size

‏מדד שימושי:

```text
tick_size / price
```

‏או spread בטיקים.

---

# ‏99. Queue Competition

‏כאשר יש הרבה size ברמה, queue competition גבוהה יותר.

‏אבל לא תמיד volume גדול אומר wait ארוך אם aggressive flow גם גדול.

---

# ‏100. `Queue Turnover`

‏מדד שימושי:

```text
aggressive_volume_rate / displayed_volume
```

‏יכול לספק אינדיקציה לקצב depletion.

---

# ‏101. Bid Queue vs Ask Queue

‏Entry Buy פסיבי ו־Exit Sell פסיבי נמצאים בצדדים שונים של הספר.

‏ה־flow הרלוונטי שונה.

---

# ‏102. Queue Asymmetry

‏אפשר לראות מצב שבו:

```text
Bid queue huge
Ask queue thin
```

‏אבל המשמעות אינה אוטומטית bullish.

---

# ‏103. Book Imbalance אינו Queue Guarantee

‏Book imbalance יכול להשתנות במהירות ולהיות מושפע מ־cancels/hidden liquidity.

---

# ‏104. Microprice

‏Microprice הוא כלי אפשרי להערכת לחץ קצר טווח.

‏הוא לא אומר אם אנחנו נקבל Fill.

---

# ‏105. Fill Probability Model

‏מודל מחקר יכול להעריך:

```text
P(fill before T | state)
```

‏כאשר `state` כולל queue/flow/spread/volatility/signal age.

---

# ‏106. Classification Target

‏לדוגמה:

```text
filled_within_1s
filled_within_3s
filled_within_5s
```

---

# ‏107. Survival View

‏אפשר להתייחס ל־Time-to-Fill כבעיית survival/time-to-event.

‏זה טבעי יותר מ־binary fill/no-fill בלבד.

---

# ‏108. Censoring

‏אם ביטלנו Order אחרי 3 שניות, איננו יודעים אם הוא היה מתמלא בשנייה 4.

‏זו דוגמה ל־censored observation.

---

# ‏109. Cancellation Policy Bias

‏היסטוריית fills שלנו תלויה ב־policy שבחרה מתי לבטל.

‏לכן dataset של orders אינו sample ניטרלי.

---

# ‏110. Policy-Induced Selection Bias

‏אם אנחנו משאירים רק Orders “טובים” זמן רב יותר, נוצר bias כאשר מנתחים fill probability.

---

# ‏111. Counterfactual Difficulty

‏לא תמיד אפשר לדעת מה היה קורה אילו השארנו את ה־Order עוד 2 שניות.

---

# ‏112. Replay יכול לעזור — אך לא לפתור הכול

‏Replay טוב יכול לבדוק market evolution.

‏אבל בלי queue-level truth הוא עדיין צריך fill model.

---

# ‏113. Fill Model Versioning

‏כל Backtest צריך לשמור:

```text
fill_model_version
queue_model_version
```

---

# ‏114. למה Versioning קריטי

‏שינוי קטן בהנחות Queue יכול לשנות Fill Rate, PnL ו־trade count בצורה דרמטית.

---

# ‏115. Compare Across Fill Models

‏אותה Strategy צריכה לעבור:

```text
optimistic fill model
base fill model
conservative fill model
```

---

# ‏116. Fragility Warning

‏אם האסטרטגיה רווחית רק במודל optimistic, זה סימן אזהרה.

---

# ‏117. Execution Robustness

‏Edge איכותי יותר הוא כזה ששורד גם הנחות fill פחות נוחות.

---

# ‏118. Historical Data Resolution

‏אי אפשר לבנות Queue model מדויק מנתוני bars של שנייה או דקה.

---

# ‏119. אפילו Trade + Quote Aggregates מוגבלים

‏אם events aggregated, event ordering ו־volume attribution יכולים ללכת לאיבוד.

---

# ‏120. Data Fidelity Ladder

‏אפשר לחשוב על:

```text
Bars
L1 snapshots
L1 event stream
L2 price levels
Market-by-order
Venue direct feed
```

‏ככל שעולים ברמה, אפשר לבנות model עשיר יותר — אבל גם complexity/data cost עולים.

---

# ‏121. Fidelity לפי צורך

‏לא כל אסטרטגיה צריכה L3.

‏אם ה־edge גדול מספיק והכניסה בדרך כלל marketable, Queue modeling מפורט עשוי להיות פחות קריטי.

---

# ‏122. לרובוט שלנו Queue כן חשוב

‏כי horizon של שניות עד דקה הופך:

- ‏2 שניות wait.
- ‏1 tick spread.
- ‏partial fill.

‏לחלק משמעותי מה־edge.

---

# ‏123. אבל קודם למדוד Sensitivity

‏לפני רכישת data יקר מאוד, בודקים:

```text
How sensitive is expected net edge to fill assumptions?
```

---

# ‏124. אם Edge שורד בלי Queue Precision

‏ייתכן שאין צורך מיידי להשקיע במודל הכי מתקדם.

---

# ‏125. אם Edge נעלם תחת Fill Assumption קטן

‏אז Queue/Execution הוא research priority גבוה.

---

# ‏126. `Execution Frontier`

‏אפשר למפות:

```text
x = aggressiveness
fill rate
slippage
miss rate
markout
net outcome
```

---

# ‏127. Queue-Aware Execution Frontier

‏אותו analysis לפי buckets של:

```text
volume_ahead
queue turnover
spread
signal age
```

---

# ‏128. Small Order Advantage

‏Order קטן יחסית ל־available liquidity עשוי להיות קל יותר לביצוע.

‏זה אחד היתרונות האפשריים של רובוט אישי קטן.

---

# ‏129. אבל Queue עדיין קיים

‏Small size אינו נותן time priority.

‏אם אנחנו מאחור, עדיין צריך שה־flow יגיע אלינו.

---

# ‏130. Capacity

‏כאשר size גדל, גם אם החלק הראשון מתמלא, tail של ה־Order יכול להיתקע.

---

# ‏131. Fill Curve by Size

‏כדאי למדוד:

```text
fill_rate(size)
slippage(size)
time_to_fill(size)
```

---

# ‏132. Queue and Position Sizing

‏Sizing צריך להתחשב ב־executable capacity, לא רק risk budget.

---

# ‏133. Queue at Entry vs Exit

‏אסור לבנות Entry פסיבי מושלם ולדמות Exit אגרסיבי בחינם.

‏שני הצדדים צריכים assumptions עקביים.

---

# ‏134. Exit Can Be More Urgent

‏כאשר position כבר פתוחה, missed exit יכול להיות מסוכן יותר מ־missed entry.

---

# ‏135. לכן Exit Queue Policy יכולה להיות שונה

‏לדוגמה:

```text
Entry: allow passive wait
Exit: shorter TTL, faster escalation
```

---

# ‏136. Queue-aware Exit Escalation

‏אפשר להגדיר:

```text
join ask
wait
improve
cross bid
```

‏בהתאם ל־remaining edge/risk.

---

# ‏137. Stop Logic ו־Queue

‏במצב stop/risk reduction, priority של “מחיר יפה” יורדת לעומת “להקטין exposure”.

---

# ‏138. Emergency Exit

‏במצב חירום, Queue model יכול להפוך לפחות רלוונטי מהצורך להגיע ל־flat בצורה נשלטת.

---

# ‏139. Queue Telemetry

‏לכל passive Order כדאי לשמור:

```text
initial_displayed_size
estimated_volume_ahead
queue_confidence
trade_volume_at_level
cancel_volume_estimate
queue_age_ms
partial_fill_count
fill_qty
```

---

# ‏140. Signal Telemetry יחד עם Queue

‏צריך לשמור גם:

```text
signal_score_at_submit
signal_rank_at_submit
signal_age_at_submit
score_at_fill
rank_at_fill
```

---

# ‏141. למה

‏כדי לדעת אם הבעיה הייתה:

- ‏Queue איטי.
- ‏Signal שהתיישן.
- ‏מחיר שהתרחק.
- ‏adverse selection.

---

# ‏142. `Queue Slippage`

‏אפשר למדוד את העלות של wait לעומת benchmark בזמן signal.

---

# ‏143. `Queue Opportunity Loss`

‏אם Order לא התמלא והמחיר ברח, אפשר למדוד missed move.

---

# ‏144. `Queue Adverse Selection Loss`

‏אם התמלאנו ואז השוק זז נגדנו, אפשר למדוד markout שלילי.

---

# ‏145. Balance

‏Execution policy טובה מאזנת בין:

```text
missed opportunity
spread cost
slippage
adverse selection
```

---

# ‏146. Queue Bucket Report

‏דוח שימושי:

```text
0-500 ahead
500-2k
2k-10k
10k+
```

‏ולכל bucket:

```text
fill rate
median time-to-fill
p95 time-to-fill
markout
net outcome
```

---

# ‏147. Time-of-Day

‏Queue behavior בפתיחה יכול להיות שונה מאוד מאמצע היום.

---

# ‏148. Regime Conditioning

‏צריך לנתח Queue לפי:

- ‏time of day.
- ‏volatility.
- ‏spread.
- ‏activity.
- ‏liquidity.

---

# ‏149. Symbol Effects

‏מניות שונות יכולות להציג dynamics שונים.

‏אבל צריך להיזהר מ־overfitting per-symbol.

---

# ‏150. Cross-Sectional Queue Comparison

‏כאשר Top-1 ו־Top-2 דומים ב־signal, candidate עם execution feasibility טובה יותר עשוי להיות עדיף.

---

# ‏151. Prediction Rank ≠ Execution Rank

‏אפשר להחזיק:

```text
prediction_score
execution_feasibility
```

‏ולבצע decision layer מעל שניהם.

---

# ‏152. לא לערבב בלי Explainability

‏אם execution feasibility משנה את הבחירה, צריך לתעד זאת במפורש.

---

# ‏153. Queue-Rank Counterfactual

‏לכל trade אפשר לשאול:

```text
Would #2 have produced better net outcome because it was easier to execute?
```

---

# ‏154. Execution-Aware Candidate Selection

‏זה שלב מתקדם למחקר, לא baseline ראשון.

---

# ‏155. Queue Prediction Error

‏צריך למדוד:

```text
predicted_fill_probability
actual_fill_outcome
```

---

# ‏156. Calibration

‏אם Orders שחזינו להם `70%` fill rate מתמלאים רק `35%`, המודל אינו calibrated.

---

# ‏157. Reliability Curve

‏אפשר לבנות buckets:

```text
0-20%
20-40%
40-60%
60-80%
80-100%
```

‏ולבדוק actual fill frequency.

---

# ‏158. Fill Time Calibration

‏אותו רעיון ל־time-to-fill predictions.

---

# ‏159. Online Calibration

‏Live/Paper data חשוב במיוחד כי historical feed לא תמיד משחזר queue semantics באופן מושלם.

---

# ‏160. Paper Limitations

‏Paper broker יכול לדמות fills בצורה פשוטה מדי.

‏לכן Paper fill rate אינו בהכרח Live fill rate.

---

# ‏161. Shadow Queue Measurement

‏ב־Shadow אפשר “למקם” hypothetical Order ולבדוק מה היה קורה לפי model, בלי לשלוח Order אמיתי.

---

# ‏162. Shadow vs Live Comparison

‏כאשר בהמשך יש live fills, משווים:

```text
predicted queue outcome
actual broker fill outcome
```

---

# ‏163. Broker Routing Complicates Queue

‏אם שולחים דרך Smart Router, ייתכן שהברוקר יבחר venue.

‏אז queue modeling venue-level יכול להיות מורכב יותר.

---

# ‏164. Direct Routing

‏Direct routing נותן יותר שליטה על venue selection, אבל גם יותר אחריות ומורכבות.

---

# ‏165. Smart Routing vs Queue Modeling

‏זו תהיה הרחבה מרכזית בשלב הבא.

---

# ‏166. Broker Internalization / Routing Semantics

‏לא נכון להניח שכל Order בהכרח resting בדיוק במקום שאנחנו מדמיינים.

‏צריך להסתמך על broker/execution reports ו־route metadata כשזמין.

---

# ‏167. Venue Attribution

‏Fill report עשוי לכלול venue/exchange information.

‏זה חשוב למחקר execution.

---

# ‏168. Queue Model by Venue

‏בשלב מתקדם אפשר לשמור סטטיסטיקות שונות לכל venue.

---

# ‏169. אבל להיזהר מ־Data Sparsity

‏יותר segmentation = פחות samples בכל bucket.

---

# ‏170. Simple First

‏לרובוט אישי, baseline נכון יכול להתחיל ב־:

```text
Touch model as optimistic bound
Trade-through model as conservative/simple baseline
Volume-ahead model where data supports it
```

---

# ‏171. שלושת המודלים יחד

‏במקום להתווכח “מה נכון”, מריצים את האסטרטגיה בשלושה models ורואים sensitivity.

---

# ‏172. Queue Model Contract

‏ממשק רעיוני:

```text
QueueEstimate estimate(OrderIntent, MarketState)
FillOutcome onMarketEvent(MarketEvent event)
```

---

# ‏173. `QueueEstimate`

‏יכול לכלול:

```text
estimated_volume_ahead
confidence
fill_probability_1s
fill_probability_3s
fill_probability_5s
expected_time_to_fill
```

---

# ‏174. `FillOutcome`

‏יכול לכלול:

```text
none
partial
full
```

‏עם quantity ו־reason.

---

# ‏175. Explainability

‏כל simulated fill צריך reason:

```text
TOUCH_ASSUMPTION
TRADE_THROUGH
QUEUE_DEPLETED
PARTIAL_QUEUE_DEPLETION
```

---

# ‏176. Avoid Magical Fills

‏אסור ש־Backtest ייצר Fill בלי יכולת להסביר מאיזה market evidence הוא נבע.

---

# ‏177. Prefix Invariance

‏אירועים עתידיים לא יכולים לשנות Fill שכבר הוחלט בעבר.

‏זה invariant חשוב נגד leakage.

---

# ‏178. Event Ordering Tests

‏אותם events באותו order צריכים לייצר אותו queue state.

---

# ‏179. Gap Tests

‏אם sequence gap מוזרק, queue confidence חייב לרדת.

---

# ‏180. Cancel/Replace Tests

‏צריך לבדוק:

- ‏priority reset.
- ‏cancel pending.
- ‏late fill.
- ‏replacement suppression.
- ‏overfill protection.

---

# ‏181. Partial Fill Tests

‏צריך לבדוק:

```text
partial entry
signal dies
remaining qty canceled
existing filled qty still requires exit
```

---

# ‏182. Duplicate Event Tests

‏Duplicate trade/order event לא צריך להכפיל fill.

---

# ‏183. Restart Tests

‏אחרי restart:

- ‏broker truth נטען מחדש.
- ‏working orders משוחזרים.
- ‏queue estimate לא משוחזר בביטחון מזויף.

---

# ‏184. Replay Determinism

‏אותו dataset + אותו queue model version + אותו config חייבים להחזיר אותם fills simulated.

---

# ‏185. Golden Scenarios

‏כדאי לשמור תרחישים כמו:

```text
Touch without fill
Trade-through fill
Partial fill
Cancel-fill race
Queue reset after replace
Hidden-liquidity-like replenishment
Data gap while order rests
```

---

# ‏186. RCA ל־No Fill

‏כאשר Order לא התמלא, לא מספיק לרשום:

```text
NO_FILL
```

‏צריך reason candidate:

```text
QUEUE_TOO_LONG
SIGNAL_EXPIRED
PRICE_MOVED_AWAY
CANCELED_BY_POLICY
DATA_CONFIDENCE_LOW
```

---

# ‏187. RCA ל־Bad Fill

‏כאשר התמלאנו והעסקה הייתה רעה:

```text
ADVERSE_SELECTION
SIGNAL_DECAYED_DURING_WAIT
LATE_FILL_AFTER_CANCEL_REQUEST
EXECUTION_TOO_PASSIVE
```

---

# ‏188. Success RCA

‏גם Fill טוב צריך להיחקר:

```text
Was it repeatable?
Was queue estimate accurate?
Was price improvement worth the wait?
```

---

# ‏189. Queue Model Drift

‏אם live fill behavior משתנה לאורך זמן, ייתכן שה־market microstructure או routing behavior השתנו.

---

# ‏190. Monitor Drift

‏מדדים:

```text
predicted_vs_actual_fill_rate
predicted_vs_actual_time_to_fill
queue_model_error
post_fill_markout
```

---

# ‏191. Parameter Drift

‏לא למהר לכייל מחדש כל יום.

‏צריך להבדיל בין noise לבין שינוי מבני.

---

# ‏192. Champion/Challenger Queue Models

‏אפשר להריץ model חדש ב־Shadow מול model קיים לפני promotion.

---

# ‏193. Queue Model Registry

‏לכל model:

```text
version
assumptions
data requirements
calibration period
known limitations
```

---

# ‏194. Data Provenance

‏לכל estimate חשוב לדעת מאיזה feed הוא נבנה.

---

# ‏195. Cross-Provider Risk

‏אם signal הגיע מספק A ו־queue estimate מספק B, timestamps וסמנטיקה חייבים להיות מתואמים.

---

# ‏196. Clock Skew

‏פער שעון קטן יכול לשנות event ordering ולפגוע reconstruction.

---

# ‏197. Timestamp Precision

‏שניות אינן מספיקות למחקר Queue רציני.

‏בדרך כלל נדרשת precision עדינה בהרבה.

---

# ‏198. Received-Time Matters

‏גם אם exchange timestamp קיים, הרובוט חי לפי הזמן שבו המידע הגיע אליו.

---

# ‏199. Queue from Trader Perspective

‏למחקר execution חשוב לעיתים לשאול:

```text
What could our system have known before sending the order?
```

‏לא רק מה קרה ב־exchange בדיעבד.

---

# ‏200. No Future Queue Knowledge

‏אסור להשתמש ב־future cancels/trades כדי להחליט בדיעבד שה־Order “היה צריך” להישאר.

---

# ‏201. Queue Feature Leakage

‏Feature כמו:

```text
future_queue_depletion_3s
```

‏הוא Label, לא Feature.

---

# ‏202. Valid Queue Feature

‏לדוגמה:

```text
recent_trade_rate_1s
current_displayed_size
recent_cancel_rate
spread_ticks
```

‏אם כולם זמינים בזמן decision.

---

# ‏203. Queue Labels

‏למחקר אפשר לבנות:

```text
filled_within_1s
filled_within_3s
filled_before_signal_expiry
post_fill_markout_1s
```

---

# ‏204. Joint Objective

‏בסוף איננו רוצים רק לחזות Fill.

‏אנחנו רוצים:

```text
expected net trading outcome
```

---

# ‏205. High Fill Probability יכול להיות רע

‏אם הוא מגיע יחד עם adverse selection קשה.

---

# ‏206. Low Fill Probability יכול להיות סביר

‏אם missed trades כמעט לא עולים לנו וה־fills שמתקבלים איכותיים מאוד.

---

# ‏207. Execution Utility

‏אפשר לחשוב על:

```text
Utility = expected net outcome - risk penalties
```

‏ולא על fill rate בלבד.

---

# ‏208. Queue Decision Table

‏דוגמה רעיונית:

| Signal urgency | Queue short | Queue long |
|---|---|---|
| Low | Passive | Passive/Abandon |
| Medium | Passive/Improve | Improve |
| High | Improve/Cross | Cross/Abandon |

‏הטבלה היא framework למחקר, לא כלל אוניברסלי.

---

# ‏209. Abandon הוא Action לגיטימי

‏אם execution נהיה יקר מדי:

```text
NO TRADE
```

‏יכול להיות טוב יותר מ־chasing.

---

# ‏210. `Do Not Chase` Rule

‏אפשר להגדיר:

```text
max_chase_ticks
max_chase_bps
max_edge_consumption
```

---

# ‏211. Edge Consumption

‏אם crossing consumes 80% מה־expected gross edge, יכול להיות שאין הצדקה למסחר.

---

# ‏212. Queue-Aware Pre-Trade Gate

‏לפני Submit:

```text
signal valid?
data fresh?
spread acceptable?
queue feasible?
expected net edge positive?
```

---

# ‏213. Queue-Aware Recheck

‏לפני reprice/cross, לחשב הכול מחדש.

---

# ‏214. Never Escalate Blindly

‏טעות:

```text
wait 2s
then automatically cross
```

‏בלי לבדוק אם signal עדיין קיים.

---

# ‏215. Dynamic Escalation

‏Escalation תלויה ב־:

```text
remaining edge
signal age
queue estimate
spread
volatility
rank persistence
```

---

# ‏216. Rank Change During Wait

‏אם candidate יורד מ־#1 ל־#17 בזמן שאנחנו בתור, צריך policy ברורה.

---

# ‏217. Persistence

‏אם ה־signal יציב לאורך זמן, passive wait יכול להיות מוצדק יותר.

---

# ‏218. Fresh Spike

‏Signal חדש וחזק אבל קצר־חיים עשוי להצדיק urgency גבוהה יותר.

---

# ‏219. Queue Aging vs Rank Aging

‏שני clocks שונים:

```text
order_age
signal_age
```

‏שניהם חייבים להופיע ב־decision.

---

# ‏220. Entry Budget

‏אפשר להקצות latency budget:

```text
signal_to_decision
Decision_to_submit
submit_to_ack
queue_wait
```

---

# ‏221. Queue Wait הוא חלק מתקציב latency

‏לא “זמן חינם”.

---

# ‏222. End-to-End Measurement

‏מה שמעניין הוא:

```text
signal_time -> first executable fill
```

---

# ‏223. Queue-aware Implementation Shortfall

‏benchmark אפשרי:

```text
mid/ask at decision time
```

‏מול average actual fill.

---

# ‏224. No-Fill Shortfall

‏גם no-fill צריך metric.

‏למשל missed move לאחר expiry.

---

# ‏225. Execution Attribution

‏פירוק:

```text
signal decay
queue delay
spread cost
slippage
missed opportunity
adverse selection
```

---

# ‏226. Queue Alpha אינו Strategy Alpha

‏שיפור execution אינו בהכרח שיפור prediction.

‏צריך למדוד אותם בנפרד.

---

# ‏227. Research Question 1

‏האם passive entry עדיף ל־net outcome לעומת immediate marketable limit?

---

# ‏228. Research Question 2

‏באילו queue buckets passive entry עובד?

---

# ‏229. Research Question 3

‏כמה זמן אפשר להמתין לפני signal decay?

---

# ‏230. Research Question 4

‏האם cancel/replace משפר fill rate מספיק כדי להצדיק queue reset?

---

# ‏231. Research Question 5

‏האם Top-2 עם execution feasibility גבוהה מנצח Top-1 שקשה להיכנס אליו?

---

# ‏232. Research Question 6

‏האם passive fills סובלים markout שלילי יותר?

---

# ‏233. Research Question 7

‏מה ההבדל בין open/midday/close?

---

# ‏234. Research Question 8

‏איזה volume-ahead threshold הופך wait ללא כדאי?

---

# ‏235. לא לחפש Magic Threshold

‏מחפשים robust region, לא מספר אחד מושלם.

---

# ‏236. Sensitivity Surface

‏למשל:

```text
x = max queue wait
 y = max volume ahead
 z = net outcome
```

---

# ‏237. Plateau עדיף על Spike

‏אם performance טוב רק ב־`1.7s`, זה חשוד.

‏אם הוא טוב בטווח `1.2–2.4s`, זה robust יותר.

---

# ‏238. Cross-Validation בזמן

‏Queue parameters צריכים להיבדק out-of-sample כמו כל parameter אחר.

---

# ‏239. Multiple Testing

‏ניסוי עשרות TTLs/thresholds על אותו history הוא parameter hunting.

---

# ‏240. Experiment Registry

‏כל queue experiment צריך לשמור:

```text
hypothesis
parameters
fill_model_version
dataset
metrics
result
```

---

# ‏241. Minimum Useful Metrics

‏לכל tactic:

```text
fill_rate
partial_fill_rate
median_time_to_fill
p95_time_to_fill
slippage
post_fill_markout
missed_opportunity
net_outcome
```

---

# ‏242. Separate by Side

‏Buy ו־Sell לא חייבים להתנהג סימטרית.

---

# ‏243. Separate Entry and Exit

‏Entry fill quality ו־Exit fill quality הם שני analyses שונים.

---

# ‏244. Queue Dashboard

‏Production dashboard יכול להציג:

```text
working passive orders
estimated volume ahead
queue confidence
order age
signal age
expected fill probability
```

---

# ‏245. Alert Conditions

‏לדוגמה:

```text
queue model confidence UNKNOWN while new entries continue
cancel latency p99 too high
partial-fill rate jumps
live fill rate diverges from model
```

---

# ‏246. Safety Interaction

‏אם queue/data confidence נמוך מאוד, המערכת יכולה:

```text
block passive entries
switch to safer execution mode
NO TRADE
```

‏בהתאם למדיניות.

---

# ‏247. Queue אינו תחליף ל־Risk Engine

‏Execution feasibility אינה הרשאת risk.

---

# ‏248. Queue אינו תחליף ל־Signal

‏Order שקל למלא אינו בהכרח trade טוב.

---

# ‏249. Queue אינו תחליף ל־Price Protection

‏גם urgency גבוהה חייבת לכבד price bounds.

---

# ‏250. Queue אינו תחליף ל־Broker Truth

‏ה־fill האמיתי מגיע מהברוקר/exchange report, לא מה־queue model.

---

# ‏251. `Simulated Fill` מול `Real Fill`

‏חייבים להחזיק type/source נפרד כדי שלא לערבב ביניהם.

---

# ‏252. Baseline מוצע לרובוט שלך

‏שלב ראשון:

```text
1. Record L1/L2 data with timestamps.
2. Record every submitted/acked/filled/canceled order.
3. Start with simple trade-through + conservative volume-ahead models.
4. Measure fill rate, time-to-fill, markout, missed opportunity.
5. Compare passive vs marketable-limit tactics.
6. Keep queue assumptions versioned.
7. Use live/paper evidence to calibrate.
```

---

# ‏253. מה לא לעשות בשלב הראשון

‏לא להתחיל מ־:

- ‏L3 reconstruction מושלם.
- ‏ML מורכב לחיזוי queue.
- ‏venue router עצמאי.
- ‏עשרות parameters.

‏לפני שאנחנו יודעים שה־edge בכלל רגיש מספיק ל־queue כדי להצדיק זאת.

---

# ‏254. סדר המחקר המומלץ

```text
Signal edge
→ execution sensitivity
→ simple queue model
→ live/paper calibration
→ advanced queue modeling only if justified
```

---

# ‏255. רז מקצוע: Queue הוא Distribution

‏אנשי execution מנוסים אינם חושבים בדרך כלל:

```text
I am number 1,842 in line
```

‏כאשר אין להם data שמוכיח זאת.

‏הם חושבים:

```text
Given current book and flow,
what is the probability this order fills before my deadline,
and what usually happens after it fills?
```

---

# ‏256. רז מקצוע: Fill טוב יכול להיות Order רע

‏אם קיבלנו fill מיד אבל markout גרוע מאוד, העובדה שהתמלאנו מהר אינה הצלחה.

---

# ‏257. רז מקצוע: No Fill יכול להיות הצלחה

‏אם לא התמלאנו והמחיר מיד זז נגד direction שלנו, הפספוס חסך הפסד.

---

# ‏258. רז מקצוע: Queue Position הוא זמני

‏מקום טוב בתור יכול לאבד ערך כשה־market state משתנה.

---

# ‏259. רז מקצוע: Cancel הוא החלטת Trading

‏Cancel אינו פעולה טכנית.

‏הוא החלטה על expected future value של Order קיים.

---

# ‏260. רז מקצוע: Replace הוא Trade-off

‏Reprice יכול לשפר price relevance ולהרוס priority בו־זמנית.

---

# ‏261. רז מקצוע: Fill Models צריכים להיות Skeptical

‏אם אין לנו queue truth, עדיף model שמודה באי־ודאות מאשר model “מדויק” שהומצא.

---

# ‏262. רז מקצוע: Backtest יכול להרוויח מה־Queue יותר מה־Live

‏כל model שממלא Limit בקלות מדי מנפח במיוחד אסטרטגיות קצרות.

---

# ‏263. רז מקצוע: חשוב למדוד `Fill-to-Fill` ולא רק `Signal-to-Signal`

‏הרובוט מרוויח או מפסיד על fills אמיתיים.

---

# ‏264. רז מקצוע: Marketable Limit הוא Control חשוב

‏הוא יכול לשמש baseline פשוט להשוואה מול tactics פסיביים.

---

# ‏265. רז מקצוע: Execution Edge יכול להציל Signal בינוני

‏אבל אסור להשתמש בו כדי להצדיק Signal שאין לו edge בסיסי.

---

# ‏266. רז מקצוע: אל תמדוד רק Fill Rate

‏המדד הנכון הוא net outcome לאחר:

```text
fills
no-fills
spread
slippage
markout
missed opportunity
```

---

# ‏267. Checklist לפני Queue Research

- ‏האם יש timestamps ברזולוציה מתאימה?
- ‏האם ידוע source/venue כשצריך?
- ‏האם gaps מזוהים?
- ‏האם partial fills נשמרים?
- ‏האם cancel/replace lifecycle מלא נשמר?
- ‏האם signal state בזמן submit/fill נשמר?
- ‏האם model assumptions versioned?

---

# ‏268. Checklist ל־Backtest

- ‏`Touch` אינו Fill ודאי.
- ‏אין future knowledge.
- ‏partial fills נתמכים.
- ‏cancel latency נתמך.
- ‏cancel/fill race אפשרי.
- ‏queue reset ב־replace מטופל.
- ‏no-fill מקבל opportunity-cost analysis.
- ‏optimistic/base/conservative נבדקים.

---

# ‏269. Checklist ל־Live

- ‏Broker הוא truth ל־fill.
- ‏Queue estimate מסומן estimate.
- ‏confidence נרשם.
- ‏Order age ו־signal age נפרדים.
- ‏reconnect מאפס assumptions לא אמינים.
- ‏working orders נכללים ב־risk.
- ‏late fills מטופלים.

---

# ‏270. Checklist ל־RCA

‏לכל Fill/No-Fill:

```text
What was the queue estimate?
What was the confidence?
How much volume traded at/through the level?
How long did we wait?
Did the signal decay?
Did we cancel or reprice?
Was there a late fill?
What was the post-fill markout?
What was the missed opportunity if no fill?
```

---

# ‏271. המודל המנטלי הסופי

```text
Limit Price
    ↓
Queue Entry
    ↓
Volume Ahead + Flow + Cancels + Hidden Liquidity
    ↓
Fill Probability Through Time
    ↓
Partial / Full / No Fill
    ↓
Post-Fill Markout or Missed Opportunity
    ↓
Net Execution Outcome
```

---

# ‏272. המשפט שצריך לזכור

> ‏**פקודת Limit אינה “מחכה שהמחיר יגיע אליה”. היא מתחרה על קדימות בתוך מערכת דינמית, ולכן Touch, Trade ואפילו displayed depth הם רק evidence — לא הבטחת Fill.**

---

# ‏273. איך זה מתחבר לרובוט שלנו

‏ברובוט שמחזיק שניות עד בערך דקה, Queue אינו פרט תפעולי קטן.

‏הוא יכול לקבוע אם ה־Top Candidate:

```text
was selected
was actually entered
was entered in time
was entered at acceptable cost
```

‏לכן צריך למדוד אותו כחלק מה־Execution Edge ולא להחביא אותו בתוך assumption של Backtest.

---

# ‏274. Baseline Practical Policy

‏לשלב המחקר הראשוני:

```text
Prefer simple, observable tactics.
Use marketable limit as a control.
Test passive join only with explicit TTL.
Cancel when signal invalidates.
Never assume touch means fill.
Track partial fills and cancel/fill races.
Version fill assumptions.
Calibrate against paper/live evidence.
```

---

# ‏275. המעבר לשלב הבא

‏עד עכשיו התמקדנו בעיקר במיקום שלנו בתוך Queue ובשאלה האם Order פסיבי יכול להתמלא.

‏אבל יש שאלה נוספת:

```text
Where should the order be routed in the first place?
```

‏בשלב 39 נעבור ל־`Smart Routing` מול `Direct Routing`: מי בוחר את ה־venue, אילו מטרות router מנסה למקסם, מה המשמעות ל־latency, rebates, fill probability, price improvement ו־execution transparency, ומתי שליטה ידנית ב־route היא יתרון או דווקא מלכודת.