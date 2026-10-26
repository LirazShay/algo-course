# ‏שלב 58 — `Order and Execution Subtleties`: רזי ההתנהגות של פקודות וביצועים

> ‏מטרת הפרק: לרדת שכבה עמוקה יותר מההגדרות של `Market`, ‏`Limit`, ‏`IOC`, ‏`Pegged` ושאר סוגי הפקודות, ולהבין כיצד Order מתנהג בפועל כאשר הוא פוגש Queue, ‏Routing, ‏Hidden Liquidity, ‏Partial Fills, ‏Cancel/Replace, ‏Price Improvement, ‏Adverse Selection ו־Latency.
>
> ‏העיקרון המרכזי: **Order Type הוא רק syntax. התוצאה הכלכלית נקבעת על ידי state, queue, venue, timing, hidden liquidity, routing ומה שהשוק עושה בזמן שהפקודה חיה.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. שלוש שכבות שחייבים להפריד

‏בכל Order נפריד בין:

```text
Intent
→ Broker/Venue Semantics
→ Observed Outcome
```

‏`Intent` הוא מה רצינו כלכלית.

‏`Semantics` הוא מה הברוקר/venue באמת עושים עם ההוראה.

‏`Observed Outcome` הוא מה קרה בפועל: ACK, routing, queueing, partial fill, price improvement, cancellation, rejection או no fill.

‏אם שלושת הדברים האלה מעורבבים יחד, קשה מאוד להבין למה Execution הצליח או נכשל.

---

# ‏2. `Market Order` אינו “מלא מיד במחיר הנוכחי”

‏`Market Order` אומר בדרך כלל urgency גבוהה יותר, לא מחיר מובטח.

‏המחיר בפועל תלוי בין היתר ב־:

- ‏Displayed liquidity.
- ‏Hidden liquidity.
- ‏Depth מעבר ל־top of book.
- ‏Routing.
- ‏Latency.
- ‏Price movement בזמן ההגעה.
- ‏Order size ביחס לעומק.

‏לכן:

```text
Last Price != Guaranteed Market Fill Price
```

‏במערכת קצרה, ההפרש הזה יכול להיות כל ה־Edge.

---

# ‏3. `Marketable Limit` הוא כלי חשוב במיוחד

‏`Marketable Limit` הוא Limit שחוצה את ה־spread אך שומר hard price bound.

‏לדוגמה רעיונית:

```text
Ask = 100.02
Buy Limit = 100.04
```

‏הפקודה יכולה להתבצע מיד מול liquidity זמין עד המחיר המותר, אך אינה נותנת הרשאה בלתי מוגבלת לשלם כל מחיר.

‏זה יוצר trade-off:

```text
Urgency
vs
Price Protection
```

‏לרובוט קצר־טווח, ה־limit עצמו צריך להיגזר מ־execution budget ולא ממספר שרירותי.

---

# ‏4. `Limit Price` הוא גבול, לא יעד

‏טעות נפוצה:

```text
Buy Limit = 100.05
→ I expect to pay 100.05
```

‏לא נכון.

‏המשמעות היא:

```text
Do not pay above 100.05
```

‏אם קיימת liquidity טובה יותר, ייתכן Fill במחיר טוב יותר.

‏לכן חשוב לשמור בנפרד:

- ‏Requested limit.
- ‏Execution price.
- ‏Reference market state at submit.
- ‏Reference market state at fill.

---

# ‏5. `Price Improvement`

‏כאשר Fill מתקבל במחיר טוב יותר מהגבול שלנו או מה־reference המתאים, זה נקרא לעיתים `Price Improvement`.

‏אבל צריך להיזהר מהסיפור הפשוט:

```text
Better fill price = better execution
```

‏אם מיד אחרי ה־Fill השוק זז חזק נגדנו, ייתכן שה־price improvement לא פיצה על adverse selection.

‏לכן מודדים יחד:

```text
Execution Price
+ Effective Spread
+ Post-Fill Markout
+ Net Outcome
```

---

# ‏6. `Passive` אינו מילה נרדפת ל־“זול”

‏פקודה passive יכולה לחסוך spread או אפילו לקבל rebate במקומות מסוימים.

‏אבל היא גם עלולה:

- ‏לא להתמלא.
- ‏להתמלא חלקית.
- ‏לאבד את המהלך.
- ‏להתמלא דווקא כשהשוק עומד לזוז נגדנו.

‏לכן העלות האמיתית של passive execution כוללת גם:

```text
Missed Opportunity
+ Queue Delay
+ Adverse Selection
```

---

# ‏7. `Aggressive` אינו מילה נרדפת ל־“רע”

‏פקודה aggressive משלמת בדרך כלל יותר מיידית על execution.

‏אבל אם ה־signal קצר מאוד, תשלום spread יכול להיות עדיף על המתנה שגורמת ל־edge להיעלם.

‏השאלה הנכונה אינה:

```text
Maker or Taker?
```

‏אלא:

```text
Which execution policy preserves the most expected net edge now?
```

---

# ‏8. Queue Position היא נכס

‏כאשר אנחנו מציבים Limit באותו מחיר כמו אחרים, המיקום היחסי בתור משפיע על Fill Probability.

‏אם יש לפנינו הרבה size:

```text
Displayed liquidity at our price
!=
Immediately available fill probability
```

‏לכן צריך להבחין בין:

- ‏Liquidity at price.
- ‏Volume ahead.
- ‏Expected depletion rate.
- ‏Our queue position uncertainty.

---

# ‏9. `Cancel/Replace` יכול להיות יקר

‏שינוי קטן במחיר יכול לשפר aggressiveness, אבל במבני priority רבים הוא גם עלול לגרום לנו לאבד קדימות.

‏לכן כל replace צריך לשקול:

```text
Expected gain from repricing
-
Expected queue-value loss
-
Latency/race risk
```

‏זה חשוב במיוחד כאשר ה־price move זז קדימה ואחורה סביב אותו level.

---

# ‏10. `CancelRequested != Canceled`

‏ברגע שנשלחה בקשת Cancel, Order עדיין עלול להתמלא.

‏בין:

```text
Cancel Send
→ Broker Receive
→ Venue Cancel
→ Cancel Confirmation
```

‏קיים חלון race.

‏Fill בתוך החלון הזה הוא התנהגות תקינה של מערכת אסינכרונית, לא בהכרח bug.

---

# ‏11. `ReplaceRequested != Replaced`

‏אותו עיקרון חל על modify/replace.

‏ייתכן שה־old order:

- ‏התמלא לפני ההחלפה.
- ‏התמלא חלקית.
- ‏בוטל.
- ‏נשאר פתוח לזמן קצר.
- ‏נדחה.

‏לכן state machine חייבת לייצג intermediate states ולא לקפוץ ישר מ־`OLD` ל־`NEW`.

---

# ‏12. Partial Fill הוא מצב רגיל

‏אין להתייחס ל־partial fill כאירוע נדיר.

‏אם ביקשנו 500 וקיבלנו 180, יש לנו עכשיו:

```text
Filled = 180
Remaining = 320
Exposure = 180
```

‏מכאן כל החלטה חדשה חייבת לדעת שה־risk כבר השתנה.

---

# ‏13. Partial Fill משנה את הכלכלה

‏אחרי Fill חלקי:

- ‏ה־remaining signal age עלה.
- ‏ה־price אולי השתנה.
- ‏ה־queue השתנה.
- ‏ה־position כבר קיים.
- ‏ה־exit problem כבר התחיל.

‏לכן אסור לחשוב רק:

```text
Keep trying until target quantity fills
```

‏אלא לבצע re-evaluation.

---

# ‏14. `Fill Probability` ללא `Fill Quality` הוא metric מסוכן

‏שתי tactics יכולות להיראות כך:

```text
A: 80% fill rate
B: 55% fill rate
```

‏אבל אם A מתמלא בעיקר במצבים רעילים, B יכולה להיות עדיפה כלכלית.

‏צריך למדוד:

```text
Fill Probability
×
Post-Fill Expected Outcome
```

---

# ‏15. `Fill Conditionality`

‏Fill אינו sample אקראי מכל המצבים שבהם שלחנו Order.

‏הוא sample מותנה בכך שהשוק הגיע אלינו או שמישהו בחר לסחור מולנו.

‏לכן:

```text
Outcome | Filled
```

‏יכול להיות שונה מאוד מ־:

```text
Outcome | Order Submitted
```

‏זו אחת הסיבות ש־paper simulation פשוטה מדי עלולה להטעות.

---

# ‏16. Hidden Liquidity משנה את מה שאנחנו רואים

‏Displayed depth אינו בהכרח total executable liquidity.

‏יכולים להיות:

- ‏Hidden orders.
- ‏Reserve/Iceberg behavior.
- ‏Midpoint liquidity.
- ‏Off-exchange liquidity.
- ‏Liquidity שנחשפת רק בתנאים מסוימים.

‏לכן book קטן אינו מבטיח market impact גדול, ו־book גדול אינו מבטיח שכל הכמות באמת זמינה לאורך זמן.

---

# ‏17. Replenishment הוא מידע

‏אם size ברמה מסוימת נצרך שוב ושוב וחוזר, זו תופעה שונה מ־size חד־פעמי.

‏אבל אסור להסיק אוטומטית “iceberg”.

‏נשמור:

```text
Observed replenishment
Confidence
Alternative explanations
```

‏ולא נהפוך inference לעובדה.

---

# ‏18. Liquidity יכולה להיעלם לפני שנגיע אליה

‏ב־short horizon, displayed size יכול להשתנות מהר יותר מזמן התגובה שלנו.

‏לכן snapshot טוב בזמן `DecisionTime` אינו מבטיח שהוא עדיין רלוונטי בזמן `VenueArrivalTime`.

‏נמדוד:

```text
Decision Book
Submit Book
Arrival Book
Fill Book
```

‏כאשר הנתונים מאפשרים זאת.

---

# ‏19. `Book Half-Life`

‏רעיון שימושי:

‏כמה זמן לוקח ל־book state להפוך לשונה מהותית מה־snapshot שבו החלטנו?

‏אם:

```text
Book Half-Life << Decision-to-Arrival Latency
```

‏ה־book feature אולי אינו שימושי לביצוע למרות שהיה predictive ברמת המחקר.

---

# ‏20. `Order Aging`

‏Order שחי 20ms ו־Order שחי 2s אינם אותו דבר.

‏ככל ש־Order מזדקן:

- ‏ה־signal עלול לדעוך.
- ‏ה־market state משתנה.
- ‏queue context משתנה.
- ‏adverse selection risk יכול לעלות.

‏לכן נשמור:

```text
OrderAge
SignalAge
TimeSinceLastRevalidation
```

---

# ‏21. `Order TTL` אינו רק timeout טכני

‏`Order TTL` צריך להיות קשור ל־economic validity.

‏אם ה־signal כבר אינו תקף, אין טעם להשאיר Order פתוח רק משום שה־timeout הטכני טרם הסתיים.

‏כלל:

```text
Order lifetime <= economic lifetime of the intent
```

---

# ‏22. Stale Order יכול להפוך ל־toxic order

‏Order שהיה טוב בזמן יצירתו יכול להפוך לרע בזמן שהוא ממתין.

‏לדוגמה:

```text
Signal positive
→ order rests
→ momentum reverses
→ order still fills
```

‏ה־Fill האחרון יכול להיות בדיוק ה־Fill שאיננו רוצים.

---

# ‏23. `Post Only`

‏`Post Only` נועד עקרונית למנוע Order שמיד לוקח liquidity.

‏אבל semantics מדויקים יכולים להשתנות בין venue/broker:

- ‏Reject.
- ‏Reprice.
- ‏Cancel.
- ‏Behavior אחר.

‏לכן capabilities חייבות להיות explicit ולא מבוססות על assumptions.

---

# ‏24. `IOC`

‏`Immediate-Or-Cancel` אומר לבצע עכשיו את מה שניתן, ולבטל את השאר.

‏זה מתאים לרעיון של:

```text
Take available liquidity now
Do not leave stale remainder resting
```

‏אבל צריך להבין מה “now” אומר אצל הברוקר/venue בפועל ומה קורה ל־partial fill.

---

# ‏25. `FOK`

‏`Fill-Or-Kill` דורש semantics של all-or-none בזמן מיידי לפי התמיכה הרלוונטית.

‏הבעיה המעשית:

‏במערכת מפוצלת בין venues, מה שנראה אפשרי על consolidated book לא בהכרח ניתן לביצוע כיחידה אחת תחת אותם תנאים.

‏לכן אין להניח ש־FOK הוא קסם שמבטיח “כל הכמות במחיר הזה”.

---

# ‏26. `All-or-None` מול `FOK`

‏אין לערבב בין concepts.

‏אחד יכול לעסוק באי־קבלת partial fill, והשני גם בדרישת immediacy.

‏ה־support והמשמעות יכולים להשתנות לפי broker/venue/instrument.

---

# ‏27. Pegged Orders

‏Pegged order עוקב אחרי reference מסוים.

‏אבל השאלות החשובות הן:

- ‏מהו reference?
- ‏באיזו תדירות מתבצע repricing?
- ‏מהם cap/floor?
- ‏האם repricing מאבד priority?
- ‏מה קורה ב־locked/crossed market?

‏השם `Pegged` לבדו אינו מספיק.

---

# ‏28. `Midpoint` אינו `Microprice`

‏אלה שני דברים שונים:

```text
Midpoint = geometric quote midpoint
Microprice = liquidity-weighted estimator
```

‏Order שמכוון ל־midpoint אינו “Order במיקרופרייס”.

‏ערבוב בין שני המונחים יכול לגרום ל־research assumption שגוי.

---

# ‏29. `Reserve` / `Iceberg`

‏הרעיון הוא להציג רק חלק מהכמות ולהשאיר חלק לא־מוצג.

‏אבל questions של priority, replenishment, minimum display ו־venue semantics אינם אוניברסליים.

‏לכן כאשר capability כזו נכנסת למערכת:

```text
Capability Detection
→ Explicit Semantics
→ Replay Model
→ Live Validation
```

---

# ‏30. `Stop` הוא trigger logic, לא Fill guarantee

‏ברגע ש־stop מופעל, מה שקורה אחר כך תלוי בסוג ההוראה שאליה הוא הופך ובתנאי השוק.

‏בשוק מהיר:

```text
Trigger price
!=
Execution price
```

‏חשוב במיוחד להבין זאת כאשר target holding קצר והרווח הצפוי קטן.

---

# ‏31. `Stop Limit`

‏`Stop Limit` מוסיף price bound לאחר trigger.

‏זה מגן ממחיר גרוע מדי, אבל יוצר סיכון אחר:

```text
Triggered
but
Not Filled
```

‏כלומר price protection ו־exit certainty נמצאים במתח.

---

# ‏32. OCO/OCA/Bracket אינם בהכרח atomic בכל שכבה

‏גם כאשר ברוקר מציע abstraction נוח, צריך לדעת:

- ‏מי מחזיק את הקשר בין legs?
- ‏הברוקר?
- ‏השרת?
- ‏האפליקציה שלנו?
- ‏מה קורה ב־disconnect?

‏אסור להניח atomicity שלא הוגדרה במפורש.

---

# ‏33. Parent/Child Orders

‏כאשר child orders תלויים ב־parent:

‏צריך להגדיר:

```text
Activation Condition
Quantity Derivation
Partial-Fill Behavior
Cancellation Propagation
Recovery Behavior
```

‏אחרת partial fill אחד יכול ליצור child quantity שגויה.

---

# ‏34. `Synthetic Order` מול Native Order

‏פקודה יכולה להיות:

- ‏Native בבורסה.
- ‏מנוהלת על ידי broker.
- ‏מסומלצת בצד הלקוח.

‏לכל אחת failure modes שונים.

‏לדוגמה, synthetic stop בצד הלקוח תלוי בכך שהתהליך שלנו חי ומקבל data.

---

# ‏35. Broker Simulation אינה Exchange Semantics

‏אם broker מסמלץ feature שאינו native, צריך לדעת:

```text
Where is the state held?
What happens on disconnect?
What feed triggers it?
What happens after restart?
```

‏אין להסתפק בשם ה־order type בממשק.

---

# ‏36. Smart Routing הוא policy, לא הבטחה

‏`SMART` או router דומה הוא אלגוריתם בחירה.

‏הוא יכול לשקלל:

- ‏Price.
- ‏Liquidity.
- ‏Fees/rebates.
- ‏Historical fill quality.
- ‏Latency.
- ‏Internal routing rules.

‏אבל אין להסיק שהמסלול שנבחר הוא בהכרח האופטימלי עבור ה־objective הספציפי שלנו.

---

# ‏37. Direct Routing מוסיף control וגם אחריות

‏Direct routing מאפשר לבחור venue מסוים, אבל אז אנחנו לוקחים על עצמנו חלק מההחלטה שה־router היה עושה.

‏זה דורש להבין:

```text
Venue Liquidity
Queue
Fees
Reject Rules
Order Support
Latency
Adverse Selection
```

‏בלי evidence, control נוסף יכול להיות complexity נוספת בלבד.

---

# ‏38. `Best Price` אינו תמיד `Best Expected Execution`

‏שני venues יכולים להציג אותו מחיר.

‏אבל להיות שונים ב־:

- ‏Queue depth.
- ‏Fill probability.
- ‏Latency.
- ‏Fees.
- ‏Hidden liquidity.
- ‏Post-fill markout.

‏לכן routing objective צריך להיות economic, לא רק nominal price.

---

# ‏39. Queue Value

‏למיקום טוב בתור יש ערך.

‏אפשר לחשוב רעיונית:

```text
Queue Value
≈
Fill Probability Benefit
×
Expected Edge If Filled
```

‏Replace שמוחק position טוב בתור אינו “חינם”.

---

# ‏40. Queue Position אינה נצפית תמיד במדויק

‏ב־L2 aggregate book ייתכן שנראה size כולל ברמה, אבל לא את סדר כל ההוראות.

‏לכן Queue Position לעיתים היא estimate ולא fact.

‏שומרים confidence ולא false precision.

---

# ‏41. Trade-through ו־apparent non-fill

‏לפעמים נראה trade במחיר שלנו אבל Order שלנו לא התמלא.

‏זה לא בהכרח bug.

‏אפשרויות כוללות:

- ‏ה־trade היה venue אחר.
- ‏התור לפנינו לא נגמר.
- ‏הדפסה מאוחרת.
- ‏trade condition שונה.
- ‏hidden priority.
- ‏data/feed mismatch.

‏לכן `Trade At My Price => I Should Fill` היא הנחה שגויה.

---

# ‏42. Printed Volume אינו בהכרח Queue Depletion נקי

‏לא כל volume שנדפס ברמה יכול לשמש subtraction ישיר מ־volume ahead.

‏צריך להביא בחשבון:

- ‏venue scope.
- ‏hidden executions.
- ‏cancels/adds.
- ‏trade conditions.
- ‏feed ordering.

---

# ‏43. `Last` יכול להיות רחוק מה־Executable State

‏לרובוט שלנו:

```text
Last = useful signal input
```

‏אבל:

```text
Bid/Ask/Depth = execution reality
```

‏לכן signal שמבוסס `Last` חייב לעבור execution recheck לפני Order.

---

# ‏44. Quote Movement ללא Trade

‏ה־book יכול להשתנות גם בלי print חדש.

‏Cancellations ו־repricing יכולים להזיז `Bid/Ask` לפני שה־Last משתנה.

‏זו סיבה נוספת לא להסתמך רק על trade stream לצורך execution.

---

# ‏45. Trade Movement ללא Stable Quote Context

‏גם trade stream יכול להראות momentum כאשר quotes כבר זזו מהר מדי.

‏לכן:

```text
Signal from trades
+
Execution context from quotes
```

‏הוא baseline טוב יותר מאחד מהם בלבד.

---

# ‏46. `Spread Capture` הוא לא רווח חינם

‏Passive strategy שנראית כאילו “קונה Bid ומוכרת Ask” מתעלמת לעיתים מ־:

- ‏No fills.
- ‏Adverse selection.
- ‏Queue position.
- ‏Price movement.
- ‏Inventory risk.
- ‏Fees.

‏ה־spread הוא compensation על risk, לא מתנה.

---

# ‏47. Maker Rebate אינו Alpha

‏Rebate יכול לשפר economics, אבל אסור לבנות strategy שה־edge היחיד שלה הוא rebate בלי למדוד adverse selection ו־fill selection.

‏Net model:

```text
Price Edge
+ Rebates
- Fees
- Adverse Selection
- Missed Opportunity
```

---

# ‏48. Taker Fee אינו בהכרח סיבה להימנע מ־Taker

‏אם signal דועך מהר, cost קטן ומוגדר יכול להיות עדיף על no fill.

‏ההשוואה היא:

```text
Certain/likely immediate cost
vs
Expected cost of waiting
```

---

# ‏49. `Effective Spread`

‏מדד execution useful משווה את Fill ל־reference כגון mid בזמן רלוונטי.

‏אבל גם הוא אינו מספיק לבדו.

‏צריך לצרף `Realized Spread` או markout מאוחר יותר כדי להבין אם המחיר הטוב החזיק.

---

# ‏50. Markout צריך להיות side-aware

‏אחרי Buy, עלייה היא חיובית.

‏אחרי Sell, ירידה היא חיובית.

‏לכן normalized markout צריך להשתמש ב־side convention עקבי.

‏בלי זה dashboard יכול לערבב סימנים.

---

# ‏51. Multi-Horizon Markout

‏Markout ב־50ms, ‏250ms, ‏1s, ‏5s ו־10s יכול לספר סיפורים שונים.

‏למשל:

```text
good at 100ms
bad at 5s
```

‏או להפך.

‏לכן horizon צריך להתאים ל־holding horizon של ה־strategy.

---

# ‏52. Arrival Price

‏אחד ה־benchmarks החשובים הוא market state כאשר execution intent נעשה actionable.

‏זה עוזר להפריד בין:

```text
Prediction quality
and
Execution slippage
```

---

# ‏53. Decision Price מול Arrival Price

‏אם המחיר השתנה כבר בין decision ל־arrival, זו עלות latency.

‏אם הוא השתנה בין arrival ל־fill, זו execution/queue/market evolution.

‏הפרדה זו חשובה ל־RCA.

---

# ‏54. `Opportunity Cost` של No Fill

‏No fill אינו בהכרח אפס P&L.

‏במחקר צריך לשאול:

```text
What happened after we failed to fill?
```

‏אם candidate המשיך חזק, היה cost של missed opportunity.

‏אם הוא התהפך, no fill אולי הציל אותנו.

---

# ‏55. Missed Opportunity חייב להיות conditioned

‏אי אפשר להגיד:

```text
Every missed fill = lost profit
```

‏כי צריך למדוד outcome אמיתי לאחר no-fill.

‏זה מאפשר להשוות passive/aggressive tactics בצורה הוגנת יותר.

---

# ‏56. `Chasing`

‏כאשר Order לא מתמלא והמחיר עולה, tempting לבצע repricing שוב ושוב.

‏אבל כל chase:

- ‏מגדיל מחיר כניסה.
- ‏מגדיל signal age.
- ‏יכול להיכנס מאוחר יותר במהלך.
- ‏יכול להפוך continuation entry ל־exhaustion entry.

‏לכן chase חייב להיות bounded.

---

# ‏57. Chase Budget

‏אפשר להגדיר:

```text
Initial Expected Edge
- Costs
- Price Deterioration
- Latency Decay
= Remaining Edge
```

‏כל repricing מותר רק כל עוד remaining edge נשאר מעל threshold.

---

# ‏58. `Price Ladder`

‏במקום jump חד מ־passive ל־aggressive, אפשר לייצג policy בשלבים.

‏אבל כל ladder מוסיף state ו־race conditions.

‏הוא צריך להיות קטן, deterministic ומגובה במדידה.

---

# ‏59. Reprice Frequency

‏יותר repricing אינו בהכרח טוב יותר.

‏תדירות גבוהה מדי יכולה לגרום ל־:

- ‏Queue loss.
- ‏API pressure.
- ‏Order churn.
- ‏Race complexity.
- ‏Poor explainability.

---

# ‏60. `Hysteresis`

‏אם policy מחליפה כל millisecond בין passive/aggressive בגלל threshold קטן, נקבל thrashing.

‏Hysteresis יכול לדרוש שינוי משמעותי יותר לפני מעבר state.

‏זה useful גם ב־routing וגם ב־execution aggressiveness.

---

# ‏61. `Execution State` אינו `Strategy State`

‏Strategy יכולה להגיד:

```text
BUY CANDIDATE
```

‏Execution יכולה להיות:

```text
WAITING_ACK
PARTIAL
CANCEL_PENDING
UNKNOWN_EFFECT
```

‏אסור לתת ל־strategy למחוק את state של execution.

---

# ‏62. Intent Versioning

‏אם signal השתנה בזמן ש־Order חי, אפשר ליצור Intent version חדש.

‏לדוגמה:

```text
Intent v17 = buy 300
Intent v18 = buy only 120
```

‏ה־Execution Engine צריך לדעת איזה fills שייכים לאיזו גרסה ואיך מחשבים target residual.

---

# ‏63. Target Position עדיף לעיתים על “שלח עוד Order”

‏במקום לחשוב:

```text
Send Buy 100
Send Buy 100
```

‏אפשר לחשוב:

```text
Target Position = 200
Current + Pending = 140
Residual Need = 60
```

‏זה מפחית duplicate exposure.

---

# ‏64. `Pending Exposure` חייב להיחשב

‏Order פתוח הוא risk פוטנציאלי.

‏אם risk engine סופר רק filled positions, הוא יכול לאשר Order נוסף בזמן שכבר יש pending order בדרך.

---

# ‏65. Unknown Orders

‏אם connection נפל אחרי submit ולפני ACK:

‏אסור להחליט אוטומטית שה־Order לא קיים.

‏המצב הוא:

```text
UNKNOWN_EFFECT
```

‏הפעולה הראשונה היא reconciliation.

---

# ‏66. Retry של side effect אינו כמו retry של GET

‏Retry עיוור על place-order יכול ליצור duplicate order.

‏לכן צריך identity יציבה ו־idempotency strategy.

---

# ‏67. Duplicate Fill Notifications

‏גם event delivery יכול להיות at-least-once.

‏Fill handler צריך להיות idempotent:

```text
Same Fill Event Twice
→ Position Changes Once
```

---

# ‏68. Out-of-Order Broker Events

‏ייתכן ש־events יגיעו בסדר לא אינטואיטיבי.

‏לכן model צריך להסתמך על stable identifiers, sequence/time/version כאשר קיימים, ולא על assumption שכל callback מגיע בסדר מושלם.

---

# ‏69. `ACK` אינו Fill

‏`Accepted`, ‏`Working`, ‏`PartiallyFilled`, ‏`Filled`, ‏`Canceled`, ‏`Rejected` הם states שונים.

‏UI שמציג “Order Sent” כ־“Position Open” מסתיר סיכון.

---

# ‏70. Rejection הוא חלק מה־model

‏Rejections יכולים להגיע בגלל:

- ‏Invalid price increment.
- ‏Unsupported order feature.
- ‏Buying power.
- ‏Session restrictions.
- ‏Risk limits.
- ‏Instrument state.

‏יש לשמור rejection taxonomy וללמוד ממנו.

---

# ‏71. Tick Size Matters

‏מחיר limit חייב להיות חוקי ביחס ל־tick/minimum increment הרלוונטי.

‏Round-to-nearest אינו תמיד behavior רצוי.

‏עדיף explicit policy:

```text
RoundTowardSafety
or
RejectIntent
```

‏בהתאם ל־side ול־objective.

---

# ‏72. Precision Bugs הם Execution Bugs

‏Float rounding קטן יכול להפוך מחיר חוקי ל־reject או לשנות tick.

‏לכן price representation צריך להיות deterministic ומתאים ל־instrument rules.

---

# ‏73. Quantity Rounding

‏גם quantity יכולה להיות כפופה ל־lot/increment rules.

‏אין להניח שכל symbol מקבל כל fractional/integer quantity באותה צורה.

---

# ‏74. Session Semantics

‏אותה Order יכולה להתנהג אחרת ב־regular, pre-market ו־after-hours.

‏Support, liquidity, routing ו־allowed order types יכולים להשתנות.

‏לכן session הוא חלק מה־Order Intent.

---

# ‏75. Halt / Pause

‏Order שנשלח רגע לפני halt יכול להישאר במצב לא אינטואיטיבי.

‏אחרי resume/reopening צריך revalidate:

- ‏Signal.
- ‏Price bounds.
- ‏Position.
- ‏Working orders.
- ‏Market generation.

---

# ‏76. `Market Generation`

‏כאשר מתרחש אירוע מהותי כגון halt/resume או book resync, אפשר להעלות generation.

‏Intent ישן מ־generation קודם אינו בהכרח תקף.

‏זה מונע stale order logic לחצות regime boundary.

---

# ‏77. Fast Market

‏בשוק מהיר:

- ‏Quotes מזדקנים מהר.
- ‏Depth נעלם.
- ‏Spreads מתרחבים.
- ‏Queue estimates נשברים.
- ‏Latency Pressure עולה.

‏לכן tactic שיציבה בשוק רגיל אינה בהכרח יציבה בזמן burst.

---

# ‏78. `Entry` ו־`Exit` אינם סימטריים

‏בכניסה אפשר לעיתים לבחור `NO TRADE`.

‏ביציאה, כאשר כבר יש position, objective יכול להיות שונה לחלוטין.

‏לכן:

```text
Entry Policy != Exit Policy
```

‏לעיתים Exit צריך urgency גבוהה יותר.

---

# ‏79. Exit Liquidity הוא constraint נפרד

‏אסור למדוד רק אם קל להיכנס.

‏צריך לשאול:

```text
Can we get flat quickly under stress?
```

‏זה חלק מ־capacity וגם מ־order-policy design.

---

# ‏80. `Time To Flat`

‏לרובוט שלנו זה metric מרכזי.

‏לא מספיק למדוד:

```text
Exit order submitted
```

‏צריך למדוד:

```text
Exit intent
→ first submit
→ first fill
→ final fill
→ confirmed flat
```

---

# ‏81. Exit Giveback

‏אם ה־signal הגיע ל־target קטן ואז ה־exit התעכב, profit יכול להיעלם.

‏לכן נמדוד:

```text
Peak Unrealized Profit
-
Realized Profit
```

‏ונקשר אותו ל־execution latency ול־order tactic.

---

# ‏82. “לקחת רווח קטן מהר” חייב להיבדק בנתונים

‏נבדוק:

- ‏כמה מהר target קטן מושג.
- ‏מה probability של giveback.
- ‏כמה עולה round trip.
- ‏האם liquidity קיימת ביציאה.
- ‏האם exit עצמו יוצר slippage.

‏אין להניח שהרעיון יציב בכל symbol/regime.

---

# ‏83. `Execution Budget`

‏לפני Order נגדיר כמה edge מותר לבזבז על execution.

‏דוגמה מושגית:

```text
Predicted Edge
- Minimum Required Net Edge
= Maximum Execution Budget
```

‏התקציב כולל spread, slippage, impact, fees ו־adverse-selection allowance.

---

# ‏84. `Remaining Edge`

‏בכל שינוי state:

```text
Remaining Edge
=
Updated Expected Move
-
Updated Costs
-
Updated Risks
```

‏אם הוא נופל מתחת לסף, אין סיבה להמשיך chase רק משום שכבר התחלנו.

---

# ‏85. Sunk-Cost Fallacy ב־Execution

‏עובדה שכבר חיכינו 700ms או שלחנו שתי replacements אינה סיבה להמשיך.

‏כל decision חדש צריך להישען על current expected value.

---

# ‏86. `Execution Policy` צריכה להיות Explainable

‏לכל Order נרצה reason codes כגון:

```text
ENTER_AGGRESSIVE_SIGNAL_SHORT_TTL
REPRICE_QUEUE_LOST
CANCEL_EDGE_DECAY
EXIT_URGENT_SIGNAL_REVERSAL
NO_TRADE_COST_TOO_HIGH
```

‏כך אפשר לבצע RCA אמיתי.

---

# ‏87. Decision Snapshot

‏בעת יצירת Intent נשמור לפחות:

- ‏Signal score/rank.
- ‏Bid/Ask.
- ‏Spread.
- ‏Depth summary.
- ‏Signal age.
- ‏Expected edge.
- ‏Expected costs.
- ‏Chosen tactic.

‏בלי snapshot כזה קשה להבין בדיעבד למה Order נשלח.

---

# ‏88. Fill Snapshot

‏ב־Fill נשמור:

- ‏Execution price.
- ‏Quantity.
- ‏Order age.
- ‏Signal age.
- ‏Current bid/ask.
- ‏Current rank.
- ‏Remaining target.
- ‏Route/venue כאשר זמין.

‏זה מאפשר למדוד selection effects.

---

# ‏89. Cancel Snapshot

‏גם Cancel הוא decision שראוי להסביר.

‏נשמור:

```text
Why cancel?
What changed?
Was edge gone?
Was queue too slow?
Did risk state change?
```

---

# ‏90. Execution RCA Taxonomy

‏קטגוריות שימושיות:

```text
EX_STALE_SIGNAL
EX_PRICE_MOVED
EX_QUEUE_TOO_DEEP
EX_NO_FILL
EX_PARTIAL_ONLY
EX_CANCEL_FILL_RACE
EX_ROUTE_UNFAVORABLE
EX_PRICE_IMPACT
EX_ADVERSE_SELECTION
EX_ORDER_REJECTED
EX_BROKER_UNKNOWN
EX_EXIT_GIVEBACK
EX_LATENCY_TOO_HIGH
EX_DATA_STALE
```

---

# ‏91. Prediction Failure מול Execution Failure

‏אם candidate לא עלה אחרי decision — זו אולי Prediction failure.

‏אם הוא עלה אבל לא הצלחנו להיכנס — Execution failure.

‏אם נכנסנו טוב אבל יצאנו רע — Exit execution failure.

‏אסור לערבב את שלושת הסוגים.

---

# ‏92. Good Trade / Bad Execution

‏Strategy יכולה להיות נכונה אבל execution גרוע.

‏לדוגמה:

```text
Candidate moved +20 bps
Our realized result = -2 bps
```

‏זה מחייב RCA של path, latency, fill ו־exit — לא בהכרח שינוי ב־signal model.

---

# ‏93. Bad Trade / Good Execution

‏הפוך גם אפשרי.

‏Order יכול להתמלא בדיוק, מהר ובמחיר טוב — ועדיין ה־prediction שגוי.

‏Execution engine לא אמור “לתקן” alpha לא קיים.

---

# ‏94. No Fill יכול להיות Execution Success

‏אם hard bound מנע כניסה במחיר שכבר מחק את ה־edge, no-fill הוא הצלחה של risk/economics policy.

‏לכן KPI של fill rate לבדו יכול לעודד behavior גרוע.

---

# ‏95. `NO TRADE` הוא Order Decision לגיטימי

‏אם:

```text
Expected Edge <= Costs + Risk Margin
```

‏התוצאה הנכונה יכולה להיות לא לשלוח Order בכלל.

‏זו החלטת execution, לא “הזדמנות שהתפספסה”.

---

# ‏96. Champion / Challenger ל־Execution

‏נשמור policy פשוטה כ־Champion.

‏Tactics מורכבות כגון pegging, midpoint או dynamic ladder נכנסות קודם כ־Shadow/Challenger.

‏נמדוד:

- ‏Fill rate.
- ‏Net edge retained.
- ‏Post-fill markout.
- ‏Time to fill.
- ‏Missed opportunity.
- ‏Complexity cost.

---

# ‏97. Shadow Order Logic

‏אפשר לחשב “מה היינו שולחים” בלי לשלוח בפועל.

‏כך משווים policy חדשה ל־Champion על אותו market path בלי לסכן כסף.

‏אבל צריך לזכור ש־shadow אינו יכול לשחזר market impact אמיתי של order שלא נשלח.

---

# ‏98. Replay של Execution

‏Replay טוב צריך לשמר:

- ‏Market event order.
- ‏Observed latency model.
- ‏Order state transitions.
- ‏Partial fills.
- ‏Cancel races.
- ‏Capability semantics.

‏Replay שמניח instant fill במחיר touch אינו מספיק למערכת שלנו.

---

# ‏99. Golden Execution Scenarios

‏נבנה scenarios קבועים כגון:

1. ‏Immediate full fill.
2. ‏Partial then cancel.
3. ‏Cancel/fill race.
4. ‏Stale signal before ACK.
5. ‏Price moves through hard bound.
6. ‏Disconnect after submit.
7. ‏Duplicate fill notification.
8. ‏Order rejection.
9. ‏Fast-market spread expansion.
10. ‏Exit under thin liquidity.

‏כל שינוי ב־Execution Engine צריך לשמור על invariants בתרחישים האלה.

---

# ‏100. Invariants שצריך לזכור בעל־פה

```text
Never exceed intended exposure.
Never assume cancel before confirmation.
Never retry unknown side effects blindly.
Never use stale signal without revalidation.
Never ignore pending exposure.
Never confuse fill rate with fill quality.
Never let execution spend more edge than exists.
Never assume displayed liquidity is guaranteed liquidity.
Never treat broker abstraction as exchange truth.
Never open new risk when state is unknown.
```

---

# ‏101. Practitioner Secret — מחיר טוב יכול להיות Fill רע

‏זה אחד הלקחים החוזרים של microstructure.

‏אם קיבלנו מחיר “מצוין” אבל מיד השוק התרסק נגדנו, ייתכן שהצד השני בחר לבצע איתנו בדיוק ברגע שבו information השתנה.

‏לכן:

```text
Price Improvement
without
Markout Analysis
is incomplete
```

---

# ‏102. Practitioner Secret — no fill הוא מידע

‏אם tactic מסוימת לא מתמלאת כמעט אף פעם בזמן moves חזקים, זה מידע על Queue/urgency mismatch.

‏אם היא לא מתמלאת בעיקר לפני reversal, זה מידע מסוג אחר.

‏צריך לנתח no-fill distribution, לא למחוק אותו מהdataset.

---

# ‏103. Practitioner Secret — queue churn יכול להיות חשוב יותר מה־spread

‏Spread של cent אחד נראה מצוין.

‏אבל אם ה־queue לפנינו ענקי וה־signal חי 500ms, passive order יכול להיות practically useless.

‏לכן `spread` בלי `queue/time-to-fill` אינו execution metric שלם.

---

# ‏104. Practitioner Secret — fill rate יכול להשתפר כאשר strategy נעשית גרועה יותר

‏אם נרחיב price bounds, נהיה aggressive יותר או נחכה יותר זמן, fill rate יכול לעלות.

‏אבל net edge יכול לרדת.

‏לכן KPI יחיד יכול לגרום optimization בכיוון הלא נכון.

---

# ‏105. Practitioner Secret — לפעמים ה־best execution הוא לא להשתתף

‏אם book stale, spread התרחב, rank התהפך או remaining edge קטן מדי:

```text
NO TRADE
```

‏יכול להיות execution policy הטובה ביותר.

---

# ‏106. Practitioner Secret — Order Complexity יוצרת State Complexity

‏כל feature נוסף:

- ‏Bracket.
- ‏OCA.
- ‏Peg.
- ‏Dynamic replace.
- ‏Multi-route.

‏מוסיף עוד states, races ו־recovery paths.

‏לא מוסיפים complexity רק משום שהברוקר תומך בה.

---

# ‏107. Practitioner Secret — simple order policy היא benchmark חשוב

‏לפני policy חכמה צריך benchmark פשוט:

```text
Simple Marketable Limit
with hard bound
and short TTL
```

‏או baseline אחר שמתאים לניסוי.

‏רק אם tactic מורכבת משפרת `Net Edge Retained` באופן יציב היא מצדיקה complexity.

---

# ‏108. Practitioner Secret — ה־order עצמו משנה את המדגם

‏כאשר אנחנו live, ההוראות שלנו יכולות להשפיע על:

- ‏Queue.
- ‏Displayed size.
- ‏Market impact.
- ‏Observed fills.

‏לכן dataset של live execution אינו תמיד observational בלבד.

---

# ‏109. Practitioner Secret — route quality יכולה להיות regime-dependent

‏Route שהיה טוב בשוק רגיל יכול להיות גרוע בזמן burst, open, close או thin liquidity.

‏אין route “הכי טוב” אוניברסלי.

---

# ‏110. Practitioner Secret — התור וה־signal נמצאים בשעונים שונים

‏Queue יכול להתקדם לאט בזמן שה־signal דועך מהר.

‏החלטת passive execution היא בעצם race בין:

```text
Queue Depletion
vs
Signal Decay
```

‏זה framing שימושי במיוחד לרובוט שלנו.

---

# ‏111. מודל פשוט לרובוט שלנו

‏ל־candidate מוביל אפשר לחשוב:

```text
PredictedEdge
-
RoundTripCosts
-
ExpectedAdverseSelection
-
ExpectedMissedOpportunity
-
ExpectedImpact
=
ExecutableEdge
```

‏ואז לבחור tactic רק אם:

```text
ExecutableEdge > RequiredMargin
```

---

# ‏112. Entry Policy Baseline

‏Baseline פשוט למחקר יכול לכלול:

1. ‏Revalidate signal/rank.
2. ‏Validate quote freshness.
3. ‏Compute spread/depth/cost budget.
4. ‏Choose bounded execution tactic.
5. ‏Assign short TTL.
6. ‏Cancel if edge decays.
7. ‏Measure fill/no-fill outcome.

‏זה baseline למחקר, לא הוראת מסחר קבועה.

---

# ‏113. Exit Policy Baseline

‏לאחר position:

1. ‏Track signal decay.
2. ‏Track current executable exit price.
3. ‏Track giveback from peak.
4. ‏Respect hard risk constraints.
5. ‏Prioritize becoming flat when edge disappears.
6. ‏Measure `TimeToFlat`.

---

# ‏114. מה חשוב במיוחד למילי־שניות עד שניות

‏ב־horizon שלנו יש משקל גבוה במיוחד ל־:

- ‏Quote age.
- ‏Signal age.
- ‏Queue delay.
- ‏Cancel latency.
- ‏Fill latency.
- ‏Spread.
- ‏Immediate depth.
- ‏Post-fill markout.
- ‏Rank churn.
- ‏Time to flat.

‏פחות חשוב לנו לייעל mechanisms שמשרתים execution ארוך של דקות/שעות אם הם לא מוסיפים value לאופק שלנו.

---

# ‏115. Fast Path ו־Deep Path ל־Execution

‏לכל השוק:

```text
Cheap execution feasibility
```

‏ל־Top N:

```text
Deep quote/depth/queue/routing analysis
```

‏כך שומרים על latency בלי לוותר על איכות לפני submit.

---

# ‏116. Metrics שחייבים לשמור

- ‏`DecisionToSubmitMs`.
- ‏`SubmitToAckMs`.
- ‏`AckToFirstFillMs`.
- ‏`TimeToFullFillMs`.
- ‏`OrderAgeAtFillMs`.
- ‏`SignalAgeAtFillMs`.
- ‏`FillRate`.
- ‏`PartialFillRate`.
- ‏`CancelFillRaceRate`.
- ‏`EffectiveSpread`.
- ‏`PostFillMarkout`.
- ‏`MissedOpportunity`.
- ‏`NetEdgeRetained`.
- ‏`TimeToFlatMs`.

---

# ‏117. Segmentation חשוב יותר מממוצע אחד

‏כל metric נחתוך לפחות לפי:

- ‏Symbol liquidity bucket.
- ‏Spread bucket.
- ‏Time of day.
- ‏Volatility regime.
- ‏Order tactic.
- ‏Order age.
- ‏Signal strength.
- ‏Venue/route כאשר זמין.

‏ממוצע כולל יכול להסתיר failure mode.

---

# ‏118. RCA — `First Divergence`

‏במקום לשאול רק “למה העסקה הפסידה?”, נמצא את הנקודה הראשונה שבה reality סטתה מהתכנון:

```text
Prediction?
Freshness?
Routing?
Queue?
Fill?
Markout?
Exit?
Recovery?
```

‏זה בדרך כלל מקצר debugging משמעותית.

---

# ‏119. בדיקות Property חשובות

‏דוגמאות:

```text
FilledQty <= IntendedMaxQty
Position = Sum(EffectiveFills)
Cancel confirmation never creates fill
Duplicate event does not duplicate exposure
Unknown broker state blocks new risk
Hard price bound is never exceeded by our intent
```

---

# ‏120. Golden Tests ל־Price Logic

‏נבדוק:

- ‏Tick rounding.
- ‏Marketable vs non-marketable boundary.
- ‏Locked market.
- ‏Crossed market.
- ‏Wide spread.
- ‏Zero/missing quote side.
- ‏Stale quote.
- ‏Price moves during submit.

---

# ‏121. Golden Tests ל־Queue Logic

‏נבדוק:

- ‏Large volume ahead.
- ‏Queue depletion.
- ‏Cancel ahead.
- ‏Our replace resets estimate.
- ‏Trade at our price without fill.
- ‏Hidden/replenished liquidity scenario.

---

# ‏122. Golden Tests ל־Partial Fill

‏נבדוק:

- ‏One partial.
- ‏Multiple partials.
- ‏Partial then cancel.
- ‏Partial during cancel race.
- ‏Partial then signal reversal.
- ‏Partial then exit intent.

---

# ‏123. Golden Tests ל־Unknown State

‏נבדוק:

```text
Submit
→ connection loss
→ no ACK
→ restart
→ broker reconciliation
```

‏המטרה: אפס duplicate exposure.

---

# ‏124. Shadow Research Questions

‏לכל tactic חדשה נשאל:

- ‏האם היא משפרת net result או רק fill rate?
- ‏האם improvement נשאר אחרי fees?
- ‏האם היא טובה רק בסימבולים מסוימים?
- ‏האם היא רגישה ל־latency?
- ‏האם היא מגדילה complexity/recovery risk?
- ‏האם היא משפרת exit או רק entry?

---

# ‏125. התאמה לרובוט שלנו — מה יהיה Champion בהתחלה

‏אין צורך להתחיל מכל order type אפשרי.

‏Champion ראשון צריך להיות פשוט מספיק כדי להבין אותו ולמדוד אותו.

‏Tactics מתקדמות נכנסות רק אם הן מוכיחות incremental value.

‏ה־focus שלנו נשאר:

```text
Fast decision
Fresh data
Bounded price
Short TTL
Low ambiguity
Fast exit
Measured net edge
```

---

# ‏126. התאמה לרובוט שלנו — מה לחקור כ־Challenger

‏מועמדים טבעיים למחקר מאוחר יותר:

- ‏Passive touch.
- ‏Marketable limit.
- ‏Short price ladder.
- ‏Midpoint participation.
- ‏Pegged logic.
- ‏IOC variants.
- ‏Routing variants.
- ‏Queue-aware cancel/replace.

‏כל אחד צריך להיבדק מול baseline פשוט.

---

# ‏127. התאמה לרובוט שלנו — signal decay קודם לכל

‏אם signal נשחק לפני fill:

‏לא משנה עד כמה ה־order tactic “חכמה”.

‏לכן סדר העדיפויות הוא:

```text
Signal Validity
→ Execution Feasibility
→ Order Tactic
```

‏ולא להפך.

---

# ‏128. התאמה לרובוט שלנו — Exit הוא citizen ראשון

‏במערכת שמחפשת רווח קטן ומהיר, Entry מבריק בלי Exit מהיר הוא מערכת לא שלמה.

‏נחקור exit בדיוק באותה רצינות:

- ‏Price bound.
- ‏Urgency.
- ‏Liquidity.
- ‏Giveback.
- ‏Latency.
- ‏Partial exit.
- ‏Time to flat.

---

# ‏129. התאמה לרובוט שלנו — לא לרדוף אחרי “הפקודה הסודית”

‏אין Order Type קסום שיוצר Edge מעצמו.

‏פקודה יכולה:

- ‏לשמר Edge.
- ‏לבזבז Edge.
- ‏לשנות Fill Probability.
- ‏לשנות Risk.

‏אבל Alpha צריך להגיע מה־prediction/selection process.

---

# ‏130. Checklist לפני הוספת Tactic חדשה

- ‏מה הבעיה הקיימת שהיא פותרת?
- ‏מה metric ההצלחה?
- ‏מה failure modes החדשים?
- ‏מה semantics המדויקים אצל broker/venue?
- ‏איך מדמים אותה ב־Replay?
- ‏איך מתאוששים מ־disconnect?
- ‏מה ה־fallback?
- ‏איך היא משפיעה על Queue?
- ‏איך היא משפיעה על latency?
- ‏האם היא עדיין משפרת `Net Edge Retained`?

---

# ‏131. מה צריך לזכור בעל־פה

1. ‏Order Type אינו Execution Outcome.
2. ‏`CancelRequested != Canceled`.
3. ‏Partial fills הם מצב רגיל.
4. ‏Fill rate אינו Fill quality.
5. ‏Displayed liquidity אינה guaranteed liquidity.
6. ‏Queue value יכול להיות משמעותי.
7. ‏Replace יכול למחוק queue priority.
8. ‏Price improvement צריך markout context.
9. ‏No fill יכול להיות תוצאה טובה.
10. ‏Hard price bounds מגנים על economics.
11. ‏Signal age חייב להיכנס ל־execution.
12. ‏Pending exposure הוא risk אמיתי.
13. ‏Unknown side effect מחייב reconciliation.
14. ‏Entry ו־Exit אינם סימטריים.
15. ‏`NO TRADE` הוא execution decision תקין.
16. ‏Tactic מורכבת חייבת לנצח baseline פשוט.

---

# ‏132. שאלות מחקר לשלב המעשי

1. ‏באיזה spread passive עדיף על aggressive עבור ה־horizon שלנו?
2. ‏מה relationship בין queue depth לבין probability להגיע ל־target לפני fill?
3. ‏אחרי כמה milliseconds Order נהיה stale ביחס ל־signal?
4. ‏האם marketable limit שומר יותר net edge מ־passive touch?
5. ‏כמה chase cost אנחנו יכולים להרשות לפני break-even?
6. ‏אילו fills מראים markout רע במיוחד?
7. ‏האם no-fill events דווקא חוסכים trades רעים?
8. ‏מה `TimeToFlat` תחת liquidity stress?
9. ‏האם routing variant מסוים מוסיף value אחרי fees ו־latency?
10. ‏האם advanced order כלשהו משפר outcome מספיק כדי להצדיק complexity?

---

# ‏133. הגדרת Done לשכבת Execution Subtleties

‏הנושא נחשב מובן רק כאשר אפשר לענות על:

```text
What did we intend?
What did the broker/venue actually do?
Where were we in the queue?
Why did we fill or not fill?
What did the market do immediately after?
How much edge did execution preserve?
What state was uncertain?
How would we recover after failure?
```

‏אם אחת התשובות אינה ידועה, נרשום `UNKNOWN` ונשפר observability במקום להמציא הסבר.

---

# ‏134. סיכום

‏רזי Orders אינם רשימת שמות אקזוטיים.

‏הם היכולת להבין את המרחק בין:

```text
"I sent an order"
```

‏לבין:

```text
"I converted a short-lived prediction into controlled, explainable, net-positive execution under asynchronous market conditions"
```

‏זהו ההבדל בין שימוש בסיסי ב־broker API לבין Execution Engineering מקצועי.

---

# ‏מעבר לשלב הבא

‏הפרק הבא יעסוק ב־`Market Data Subtleties`: המקומות שבהם timestamps, conditions, consolidated feeds, odd lots, quote updates, corrections, feed gaps, normalization ו־provider semantics יכולים ליצור signal שנראה אמיתי אך נובע למעשה מאופן בניית הנתונים.