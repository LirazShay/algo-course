# ‏שלב 84 — `Glossary`: מילון המונחים הקנוני של הקורס

> ‏מטרת הפרק: ליצור שפה אחידה לכל הקורס ולכל המערכת. כל מונח כאן מקבל משמעות קנונית שאפשר להשתמש בה במחקר, בקוד, ב־logs, ב־dashboards, ב־RCA ובשיחות תכנון בלי שכל רכיב יתכוון למשהו אחר.
>
> ‏העיקרון המרכזי: **Terminology הוא חלק מ־Correctness. כאשר `Last`, ‏`Fresh`, ‏`Accepted`, ‏`Working`, ‏`Position`, ‏`Edge`, ‏`Rank` או `NO_TRADE` מקבלים משמעות שונה בשני רכיבים — נוצרת תקלה גם אם הקוד בכל רכיב “נכון” בפני עצמו.**
>
> ‏המילון הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח. מונחים רגולטוריים, Broker-specific, עמלות, מס והרשאות יכולים להשתנות ודורשים Reference עדכני.

---

## ‏איך להשתמש במילון

‏לכל מונח יש שלוש שאלות:

1. ‏מה המשמעות הקנונית שלו אצלנו?
2. ‏עם איזה מונח אסור לבלבל אותו?
3. ‏איפה הוא נמצא בשרשרת `Data → Decision → Execution → Position → Evidence`?

‏כאשר קוד, metric או מסמך משתמשים במונח בצורה אחרת — צריך או ליישר אותו להגדרה הקנונית או לבחור שם אחר.

---

# ‏A — Market Basics ו־Price Language

## ‏1. `Symbol`

‏מזהה מסחרי של נייר ערך בשוק מסוים. אינו בהכרח מזהה נצחי של החברה או הנכס.

## ‏2. `Security Identity`

‏הזהות הכלכלית/משפטית של נייר הערך מעבר ל־ticker הנוכחי. חשובה בשינויי symbol, mergers, spin-offs ו־corporate actions.

## ‏3. `Last`

‏מחיר העסקה האחרונה שנצפתה לפי feed מסוים. `Last` אינו בהכרח מחיר שניתן לקנות או למכור בו עכשיו.

## ‏4. `Bid`

‏המחיר הגבוה ביותר המוצג כרגע שבו קונה מוכן לקנות, לפי ה־book/feed הזמין.

## ‏5. `Ask`

‏המחיר הנמוך ביותר המוצג כרגע שבו מוכר מוכן למכור, לפי ה־book/feed הזמין.

## ‏6. `NBBO`

‏`National Best Bid and Offer` — ה־best displayed bid/ask המאוחד לפי כללי השוק הרלוונטיים. Feed חלקי אינו בהכרח מציג NBBO מלא.

## ‏7. `Spread`

‏הפער בין `Ask` ל־`Bid`.

```text
Spread = Ask - Bid
```

## ‏8. `Relative Spread`

‏Spread מנורמל למחיר, לדוגמה ביחס ל־Mid.

## ‏9. `Mid`

‏אמצע ה־Bid/Ask.

```text
Mid = (Bid + Ask) / 2
```

## ‏10. `Microprice`

‏אומדן קצר־טווח למחיר מאוזן המשתמש גם ב־Bid/Ask sizes ולא רק במחירים. אינו “מחיר אמיתי” אלא Feature/Estimator.

## ‏11. `Trade Price`

‏המחיר שבו בוצעה עסקה מסוימת בפועל.

## ‏12. `Arrival Price`

‏מחיר benchmark ברגע שבו החלטה או Order התחילו את תהליך הביצוע. משמש למדידת execution quality.

## ‏13. `Decision Price`

‏מחיר הייחוס בזמן שבו Decision Engine קיבל החלטה. יכול להיות `Mid`, ‏`Last`, ‏`Microprice` או benchmark אחר, אבל חייב להיות מוגדר.

## ‏14. `Fill Price`

‏המחיר שבו חלק מה־Order או כולו בוצע בפועל.

## ‏15. `Exit Price`

‏מחיר הביצוע בפועל בעת הקטנת/סגירת Position.

## ‏16. `VWAP`

‏`Volume Weighted Average Price` — ממוצע מחירים משוקלל לפי volume בתקופה מוגדרת.

## ‏17. `TWAP`

‏`Time Weighted Average Price` — benchmark המבוסס על משקל זמן ולא על volume.

## ‏18. `Reference Price`

‏שם כללי למחיר benchmark שמשמש להשוואה. אין להשתמש בו בלי לציין איזה reference בדיוק.

## ‏19. `Tick Size`

‏הצעד המינימלי המותר במחיר לפי כללי venue/security.

## ‏20. `Round Lot`

‏יחידת כמות סטנדרטית מסוימת בשוק. משמעותה המדויקת יכולה להיות security/rule dependent.

## ‏21. `Odd Lot`

‏כמות שאינה round lot לפי ההגדרה הרלוונטית.

## ‏22. `Quote`

‏תצפית של bid/ask ולעיתים size ושדות נוספים בזמן מסוים.

## ‏23. `Trade Print`

‏רשומת עסקה שפורסמה ב־market data.

## ‏24. `Top of Book`

‏רמת ה־Bid הטובה ביותר וה־Ask הטובה ביותר שנצפות במקור הנתונים.

## ‏25. `Depth`

‏הכמות/הנזילות המוצגת ברמות מחיר מעבר ל־top of book.

---

# ‏B — Order Book, Liquidity ו־Microstructure

## ‏26. `Order Book`

‏מצב ה־orders/quotes הנגישים לפי רמות מחיר ב־venue או feed מסוים.

## ‏27. `Displayed Liquidity`

‏Liquidity שמופיעה ב־book הגלוי.

## ‏28. `Hidden Liquidity`

‏Liquidity שאינה מוצגת במלואה ב־book הציבורי.

## ‏29. `Reserve Order`

‏Order שחלק מהכמות שלו מוצג וחלק נשמר מוסתר לפי כללי venue/broker.

## ‏30. `Iceberg`

‏כינוי נפוץ ל־order שמציג רק חלק מהכמות הכוללת בכל פעם.

## ‏31. `Queue`

‏סדר ההמתנה של orders ברמת מחיר מסוימת.

## ‏32. `Queue Position`

‏מיקומו המשוער/המעשי של order בתוך התור. לעיתים אינו ניתן לדעת במדויק.

## ‏33. `Queue Priority`

‏כללי הקדימות לפיהם venue מחליט איזה order מתמלא קודם.

## ‏34. `Price-Time Priority`

‏מנגנון שבו מחיר טוב יותר קודם, ובאותו מחיר זמן מוקדם יותר קודם.

## ‏35. `Liquidity Taking`

‏שליחת order שחוצה את ה־spread ופוגע ב־resting liquidity.

## ‏36. `Liquidity Providing`

‏הצבת order שאינו חוצה את ה־spread וממתין שמישהו אחר יפגע בו.

## ‏37. `Passive Order`

‏Order שמטרתו לספק liquidity ולא לבצע מיד.

## ‏38. `Aggressive Order`

‏Order שמתוכנן לבצע מול liquidity קיימת באופן מיידי או כמעט מיידי.

## ‏39. `Marketable Limit`

‏Limit order שמחירו מאפשר ביצוע מיידי מול צד נגדי קיים, תוך שמירה על price bound.

## ‏40. `Maker`

‏צד שמוסיף liquidity ל־book לפי כללי venue.

## ‏41. `Taker`

‏צד שמסיר liquidity מה־book.

## ‏42. `Liquidity`

‏היכולת לבצע כמות במחיר סביר ובזמן סביר בלי להזיז את השוק יתר על המידה.

## ‏43. `Executability`

‏המידה שבה opportunity ניתנת לביצוע בפועל בהתחשב ב־spread, depth, latency, fills, costs ו־constraints.

## ‏44. `Fill Probability`

‏ההסתברות שה־order יתמלא במסגרת זמן ותנאים מוגדרים.

## ‏45. `Useful Fill Probability`

‏הסתברות ל־fill שעדיין מגיע בזמן ובמחיר שבו ה־edge לא נשחק מדי.

## ‏46. `Adverse Selection`

‏מצב שבו עצם קבלת ה־fill נוטה להתרחש דווקא כאשר המחיר עומד לזוז נגדך.

## ‏47. `Price Impact`

‏השינוי במחיר הקשור ללחץ המסחר של order/strategy עצמו.

## ‏48. `Market Impact`

‏מונח רחב יותר להשפעת המסחר שלך על מצב השוק והמחיר.

## ‏49. `Capacity`

‏כמה capital/notional אפשר להעביר דרך strategy לפני שהעלויות, impact או scarcity פוגעים מהותית ב־edge.

## ‏50. `Toxic Flow`

‏Flow שבו counterparty נוטה להיות בעל מידע/תזמון עדיף ולכן fills מולו מלווים ב־markout שלילי.

## ‏51. `Order Flow`

‏רצף והיקף פעולות קנייה/מכירה וה־pressure שהן משקפות.

## ‏52. `Order Flow Imbalance`

‏אי־איזון בין לחץ/כמות בצד הקנייה לצד המכירה לפי הגדרה מסוימת.

## ‏53. `Book Imbalance`

‏אי־איזון בין size/levels בצד bid לצד ask.

## ‏54. `Liquidity Withdrawal`

‏היעלמות מהירה של resting liquidity, לעיתים לפני move מהיר או תחת stress.

## ‏55. `Spread Shock`

‏התרחבות חריגה ומהירה של spread ביחס ל־baseline.

---

# ‏C — Orders ו־Execution

## ‏56. `Market Order`

‏Order שמבקש ביצוע מיידי במחירים הזמינים, ללא limit price שמגן על המחיר.

## ‏57. `Limit Order`

‏Order שמגדיר price bound לביצוע.

## ‏58. `Stop Order`

‏Order שמופעל לאחר trigger price לפי כללי broker/venue.

## ‏59. `Stop-Limit`

‏Order שנעשה limit order לאחר trigger.

## ‏60. `IOC`

‏`Immediate-Or-Cancel` — מבצע מיידית את הכמות הזמינה ומבטל את השאר.

## ‏61. `FOK`

‏`Fill-Or-Kill` — דורש ביצוע מלא מיידי או ביטול, בכפוף לתמיכת venue/broker.

## ‏62. `Post Only`

‏הוראה שמנסה להבטיח שה־order יוסיף liquidity ולא יחצה מיד, לפי semantics של venue/broker.

## ‏63. `Pegged Order`

‏Order שמחירו מוצמד ל־reference דינמי כמו bid/ask/mid, בכפוף לכללים.

## ‏64. `Midpoint Order`

‏Order שמנסה לבצע סביב midpoint לפי venue/routing rules.

## ‏65. `Hidden Order`

‏Order שאינו מוצג לציבור לפי venue rules.

## ‏66. `Bracket Order`

‏מבנה orders מקושר שבו entry קשור ל־protective/target exits לפי broker semantics.

## ‏67. `OCO / OCA`

‏`One Cancels Other/All` — קבוצה שבה ביצוע/הפעלה של order אחד מבטל אחרים לפי semantics מוגדרים.

## ‏68. `Order Intent`

‏הרשומה המקומית הדורבילית שמתארת מה המערכת התכוונה לשלוח לפני side effect חיצוני.

## ‏69. `Client Order ID`

‏מזהה יציב שהלקוח משתמש בו לצורך correlation/idempotency/reconciliation.

## ‏70. `Broker Order ID`

‏מזהה שה־broker מקצה ל־order.

## ‏71. `Submitted`

‏המערכת המקומית שלחה בקשה. אינו אומר שה־broker קיבל אותה.

## ‏72. `Accepted`

‏ה־broker אישר שקיבל/קיבל לעיבוד את ה־order. אינו בהכרח אומר שהוא `Working` ב־venue.

## ‏73. `Working`

‏ה־order פעיל וזמין לביצוע לפי broker/venue truth.

## ‏74. `Partially Filled`

‏חלק מהכמות בוצע וחלק עדיין פתוח/מבוטל/לא ידוע.

## ‏75. `Filled`

‏כל הכמות המבוקשת שבמסגרת ה־order בוצעה.

## ‏76. `Cancelled`

‏ה־order בוטל לפי broker truth. צריך להיזהר מ־fill שהתרחש סמוך לביטול.

## ‏77. `Rejected`

‏ה־broker/venue סירב לקבל או לבצע את ה־order.

## ‏78. `Pending Cancel`

‏בקשת ביטול נשלחה אך טרם אושרה.

## ‏79. `Cancel/Fill Race`

‏מצב שבו fill וביטול מתחרים בזמן; אסור להניח שבקשת cancel מבטיחה שאין עוד fill.

## ‏80. `Cancel/Replace`

‏שינוי order באמצעות ביטול/החלפה או semantics שקולים. עלול להשפיע על queue priority.

## ‏81. `Order Aging`

‏משך הזמן שה־order קיים מאז submit/accept/working, לפי clock מוגדר.

## ‏82. `Order TTL`

‏הזמן המקסימלי שבו order עדיין נחשב רלוונטי לאותה hypothesis/decision.

## ‏83. `Chase Budget`

‏מגבלה על כמה פעמים/כמה מחיר מותר לשנות כדי להשיג fill לפני שה־edge כבר אינו מצדיק זאת.

## ‏84. `Execution Policy`

‏הכללים שמחליטים order type, aggressiveness, price, TTL, replace/cancel behavior ו־routing.

## ‏85. `Execution Feasibility`

‏בדיקה אם ניתן לבצע את ה־decision באופן שעוד משאיר economics סבירים.

## ‏86. `Execution Quality`

‏איכות הביצוע בפועל ביחס ל־benchmark רלוונטי ולעלות הצפויה.

## ‏87. `Smart Routing`

‏Routing שבו broker/router בוחר venue לפי אלגוריתם פנימי.

## ‏88. `Direct Routing`

‏Routing ל־venue מסוים שנבחר מפורשות.

## ‏89. `Venue`

‏זירת מסחר/מערכת execution מסוימת.

## ‏90. `Broker Algo`

‏אלגוריתם ביצוע של broker שמנסה להשיג objective מסוים לאורך זמן/venues.

---

# ‏D — Position, Exposure ו־Exit

## ‏91. `Position`

‏החשיפה הכלכלית בפועל בנייר לפי broker/ledger truth, לא רק state מקומי.

## ‏92. `Flat`

‏אין position נטו באותו instrument לפי truth שנבחר.

## ‏93. `Long Position`

‏Position שמרוויח מעליית מחיר ומפסיד מירידה, לפני costs.

## ‏94. `Short Position`

‏Position שנוצר ממכירה בחסר ומרוויח מירידת מחיר, לפני costs ו־borrow effects.

## ‏95. `Exposure`

‏מידת החשיפה הכלכלית לסיכון; יכולה להיות gross, net, symbol-specific או aggregate.

## ‏96. `Pending Exposure`

‏חשיפה אפשרית שנובעת מ־orders או effects שעדיין לא הוכרעו סופית.

## ‏97. `Gross Exposure`

‏סך החשיפות בערך מוחלט בלי לקזז long מול short.

## ‏98. `Net Exposure`

‏חשיפה לאחר קיזוז כיוונים מנוגדים לפי הגדרה.

## ‏99. `Entry`

‏המעבר ממצב ללא החשיפה הרצויה למצב שבו מתחילים ליצור אותה.

## ‏100. `Exit`

‏הקטנה או סגירה של exposure קיימת.

## ‏101. `Flatten`

‏פעולה שמטרתה להגיע ל־zero target position.

## ‏102. `TimeToFill`

‏הזמן בין event מוגדר של order לבין fill מוגדר.

## ‏103. `TimeToFlat`

‏הזמן מתחילת החלטת exit/flatten עד שה־position באמת flat לפי broker truth.

## ‏104. `Exit Urgency`

‏רמת הדחיפות לסגור exposure בהתחשב ב־edge decay, risk, market state ו־unknowns.

## ‏105. `Exit Feasibility`

‏היכולת לסגור exposure במחיר/זמן סבירים תחת liquidity ו־execution conditions הנוכחיים.

## ‏106. `Giveback`

‏החלק מרווח/advantage שהיה קיים במהלך ה־position אך אבד לפני ה־exit.

## ‏107. `MFE`

‏`Maximum Favorable Excursion` — התנועה הטובה ביותר לטובת ה־trade בזמן שהוא היה פתוח.

## ‏108. `MAE`

‏`Maximum Adverse Excursion` — התנועה הגרועה ביותר נגד ה־trade בזמן שהוא היה פתוח.

## ‏109. `TimeToFirstProfit`

‏הזמן מה־entry reference עד שה־position הגיע לראשונה ל־profit threshold מוגדר.

## ‏110. `TimeToTarget`

‏הזמן עד השגת target מוגדר.

---

# ‏E — Market Data ו־Time

## ‏111. `Market Data Provider`

‏מקור/שירות שמספק market data. אצלנו הוא contract נפרד מ־Execution Broker.

## ‏112. `Execution Broker`

‏מערכת/מתווך שדרכו orders נשלחים ומתקבלים broker/account state.

## ‏113. `Feed`

‏זרם נתונים מסוים עם scope, latency, coverage ו־semantics מוגדרים.

## ‏114. `Consolidated Feed`

‏Feed שמאגד מידע ממספר venues לפי כללי consolidation.

## ‏115. `Venue Feed`

‏Feed ממקור venue מסוים בלבד.

## ‏116. `Canonical Market State`

‏הייצוג המקומי האחיד שהמערכת בונה לאחר normalization, validation ו־ordering של input data.

## ‏117. `Raw Event`

‏אירוע כפי שהתקבל מה־provider לפני normalization או interpretation.

## ‏118. `Normalized Event`

‏Raw event לאחר מיפוי ל־schema הקנוני.

## ‏119. `Event Time`

‏הזמן שבו האירוע התרחש לפי המקור/venue.

## ‏120. `Receive Time`

‏הזמן שבו המערכת המקומית קיבלה את האירוע.

## ‏121. `Process Time`

‏הזמן שבו המערכת עיבדה את האירוע.

## ‏122. `Decision Time`

‏הזמן שבו התקבלה החלטה על בסיס state מסוים.

## ‏123. `Submit Time`

‏הזמן שבו ה־order request נשלח כלפי broker.

## ‏124. `Ack Time`

‏הזמן שבו התקבל acknowledgment מה־broker.

## ‏125. `Fill Time`

‏הזמן המיוחס ל־fill לפי מקור מוגדר.

## ‏126. `Clock Domain`

‏מערכת הזמן שבה timestamp מסוים נמדד. אין להשוות clocks שונים בלי normalization/offset awareness.

## ‏127. `Clock Skew`

‏פער בין clocks שאמורים לייצג אותו זמן.

## ‏128. `Freshness`

‏מידת העדכניות של datum ביחס ל־clock ול־TTL הרלוונטיים. `Fresh` אינו אומר רק “הודעה התקבלה עכשיו”.

## ‏129. `Stale`

‏מידע שעבר את מגבלת העדכניות שמאפשרת להשתמש בו בהחלטה הנוכחית.

## ‏130. `Age`

‏משך הזמן מאז ה־reference timestamp של datum/feature/decision/order.

## ‏131. `Latency`

‏הזמן שעובר בין שתי נקודות מוגדרות בשרשרת. המונח חסר משמעות ללא start/end מפורשים.

## ‏132. `End-to-End Latency`

‏הזמן מקבלת input רלוונטי ועד event הסופי שנבחר, למשל submit או useful fill.

## ‏133. `Latency Budget`

‏הזמן המקסימלי המוקצה לשלב/שרשרת לפני שה־decision הופך מאוחר מדי.

## ‏134. `Latency Pressure`

‏יחס בין latency end-to-end לבין signal half-life.

```text
LatencyPressure = EndToEndLatency / SignalHalfLife
```

## ‏135. `Tail Latency`

‏Latency בקצוות ההתפלגות, כגון p95/p99, שלרוב חשובה יותר מהממוצע בתקלות וב־bursts.

## ‏136. `Data Gap`

‏קטע שבו events צפויים חסרים או coverage נפגע.

## ‏137. `Duplicate Event`

‏אירוע שהתקבל יותר מפעם אחת מבחינה לוגית.

## ‏138. `Out-of-Order Event`

‏אירוע שהגיע/עובד שלא לפי הסדר הכרונולוגי הלוגי שלו.

## ‏139. `Correction`

‏עדכון/תיקון מאוחר לנתון שפורסם קודם.

## ‏140. `DataGeneration`

‏מזהה epoch/version של stream/state שמאפשר לפסול callbacks או computations מהדור הישן.

---

# ‏F — Sampling, Windows ו־Short-Horizon Dynamics

## ‏141. `Sampling Interval`

‏התדירות שבה state נצפה/נשמר/מעובד.

## ‏142. `Lookback Window`

‏התקופה בעבר שממנה Feature משתמש בנתונים.

## ‏143. `Horizon`

‏מרחק הזמן קדימה או אורך התקופה שאליה prediction/label/decision מתייחס.

## ‏144. `Anchor`

‏נקודת זמן/חלון קבוע להשוואת מחיר או metric, למשל 10s, 30s, 60s.

## ‏145. `Signal Half-Life`

‏פרק הזמן שבו strength/expected value של signal נשחק באופן מהותי לפי evidence.

## ‏146. `Edge Decay`

‏הירידה ב־expected net advantage ככל שעובר זמן מה־signal.

## ‏147. `Momentum`

‏נטייה אמפירית להמשך תנועה בכיוון מסוים על horizon מוגדר; אינה חוק טבע ואינה מספיקה בפני עצמה כ־edge.

## ‏148. `Short-Horizon Momentum`

‏Momentum שנחקר בטווחים של milliseconds/seconds עד בערך minute-scale אצלנו, לא HFT microsecond race.

## ‏149. `Velocity`

‏קצב שינוי של price/feature לאורך זמן לפי הגדרה.

## ‏150. `Acceleration`

‏שינוי בקצב התנועה לאורך זמן.

## ‏151. `Shape`

‏מבנה התנועה לאורך מספר windows ולא רק endpoint return אחד.

## ‏152. `Trade Rate`

‏מספר עסקאות ליחידת זמן.

## ‏153. `Volume Rate`

‏כמות volume ליחידת זמן.

## ‏154. `Relative Activity`

‏Activity ביחס ל־baseline היסטורי/עונתי רלוונטי.

## ‏155. `Burst`

‏עלייה חדה וקצרה ב־activity, volatility או event rate.

---

# ‏G — Features ו־Indicators

## ‏156. `Feature`

‏טרנספורמציה מדידה של input data שמשמשת prediction, ranking, filtering, veto, execution או diagnostics.

## ‏157. `Raw Feature`

‏Feature קרוב לנתון המקורי, עם מעט transformation.

## ‏158. `Derived Feature`

‏Feature שמחושב משילוב/טרנספורמציה של נתונים אחרים.

## ‏159. `Feature Age`

‏גיל המידע שעליו feature מבוסס בזמן ההחלטה.

## ‏160. `Feature Freshness`

‏האם feature עדיין תקף בהתאם ל־TTL ול־input freshness שלו.

## ‏161. `Feature Readiness`

‏האם כל הנתונים וה־warmup הדרושים קיימים כדי לחשב feature בצורה תקינה.

## ‏162. `NOT_READY`

‏מצב מפורש שבו feature/decision אינו מוכן לחישוב; אינו שקול ל־0.

## ‏163. `Missing`

‏ערך שאינו קיים. אין להניח אוטומטית ש־missing = neutral.

## ‏164. `Warm-up`

‏תקופה שבה עדיין אין מספיק history/state לחישוב feature/indicator אמין.

## ‏165. `Normalization`

‏שינוי scale/representation כדי להשוות features או symbols.

## ‏166. `Cross-Sectional Normalization`

‏Normalization ביחס למצב כל ה־universe בזמן נתון.

## ‏167. `Robust Scaling`

‏Normalization שמקטין תלות ב־outliers, למשל median/IQR.

## ‏168. `Rank Transform`

‏המרת ערך למיקום יחסי בתוך population.

## ‏169. `Feature Redundancy`

‏שני features או יותר שמייצגים מידע דומה במידה שאין כמעט incremental decision value.

## ‏170. `Incremental Feature Value`

‏הערך שנוסף כאשר feature נכלל מעבר ל־baseline הקיים.

## ‏171. `Ablation`

‏ניסוי שבו מסירים רכיב כדי למדוד את התרומה האינקרמנטלית שלו.

## ‏172. `Feature Drift`

‏שינוי בהתפלגות, semantics, predictive relation או operational behavior של feature לאורך זמן.

## ‏173. `Feature Retirement`

‏תהליך מבוקר להוצאת feature שאינו מצדיק עוד את עלותו/מורכבותו/סיכונו.

## ‏174. `Indicator`

‏Feature קלאסי שמבוסס בדרך כלל על price/volume history. אינו edge בפני עצמו.

## ‏175. `SMA`

‏Simple Moving Average.

## ‏176. `EMA`

‏Exponential Moving Average עם משקל גבוה יותר לתצפיות חדשות.

## ‏177. `RSI`

‏Oscillator קלאסי המבוסס על יחס בין gains ל־losses בחלון מסוים.

## ‏178. `MACD`

‏Indicator המבוסס על הפרש בין moving averages בקצבים שונים.

## ‏179. `ATR`

‏Average True Range — מדד range/volatility קלאסי.

## ‏180. `Bollinger Bands`

‏Bands סביב moving average המבוססים בדרך כלל על volatility estimate.

---

# ‏H — Scanner, Score ו־Ranking

## ‏181. `Universe`

‏קבוצת securities שהמערכת עשויה לשקול בזמן/גרסה מסוימים.

## ‏182. `Observed Universe`

‏הקבוצה שעבורה התקבלו בפועל נתונים.

## ‏183. `Eligible Universe`

‏הקבוצה שעברה כללי eligibility בסיסיים ונכנסת לשלב scoring/ranking.

## ‏184. `Fresh Coverage`

‏האחוז/מספר של symbols שעבורם state מספיק fresh להחלטה הוגנת.

## ‏185. `Scanner`

‏הרכיב שמחשב מצב/features/eligibility/score/rank עבור universe רחב.

## ‏186. `Filter`

‏כלל שמוציא candidates לפני או במהלך ranking לפי תנאי מוגדר.

## ‏187. `Eligibility`

‏האם candidate רשאי בכלל להשתתף בתחרות הנוכחית.

## ‏188. `Score`

‏ערך מספרי שמרכז evidence לפי model/formula. אינו בהכרח expected PnL או probability.

## ‏189. `Rank`

‏המיקום היחסי של candidate מול אחרים לפי criterion/score מוגדר.

## ‏190. `Rank #1`

‏candidate שקיבל את המקום הראשון באותו snapshot. אינו “המניה הטובה בעולם” ואינו בהכרח tradeable.

## ‏191. `Top-K`

‏קבוצת K המועמדים המובילים במקום לשמור רק את Rank #1.

## ‏192. `Rank Gap`

‏הפער בין score/quality של Rank #1 לבין המתחרים הקרובים.

## ‏193. `Rank Churn`

‏קצב השינוי בזהות/סדר המועמדים המובילים.

## ‏194. `Rank Persistence`

‏משך הזמן שבו candidate נשאר בדירוג גבוה.

## ‏195. `Rank Velocity`

‏קצב השינוי במיקום של candidate לאורך זמן.

## ‏196. `Score Compression`

‏מצב שבו scores של candidates רבים קרובים מאוד ולכן rank order אינו חזק.

## ‏197. `Stale Winner`

‏candidate שמדורג גבוה בגלל feature/state ישן יחסית לאחרים.

## ‏198. `Tie-Breaker`

‏כלל דטרמיניסטי להכרעה כאשר candidates שקולים לפי metric ראשי.

## ‏199. `Cross-Sectional Fairness`

‏הדרישה שה־scanner ישווה candidates על בסיס state בעל freshness/semantics הוגנים ככל האפשר.

## ‏200. `Candidate TTL`

‏משך הזמן שבו candidate/decision עדיין תקף לפני re-evaluation.

---

# ‏I — Positive Evidence, Negative Evidence ו־Decision

## ‏201. `Positive Evidence`

‏מידע שתומך ב־candidate או מגדיל את score/expected edge שלו.

## ‏202. `Negative Evidence`

‏מידע שמחליש, מסייג או פוסל candidate גם אם positive score גבוה.

## ‏203. `Hard Veto`

‏כלל שמונע trade/entry לחלוטין במצב מסוים.

## ‏204. `Soft Penalty`

‏הפחתת score/priority/expected value בלי פסילה מוחלטת.

## ‏205. `Cooldown`

‏מצב זמני שבו candidate/symbol/action מוגבלים לאחר event או failure מסוים.

## ‏206. `Negative Memory`

‏state שמחזיק negative evidence מעבר לרגע שבו הוא נצפה, עם TTL/decay/reset מוגדרים.

## ‏207. `ReasonCode`

‏מזהה קנוני שמסביר למה פעולה, veto, rejection או state transition קרו.

## ‏208. `Decision Aggregator`

‏רכיב שמאחד score, vetoes, feasibility, risk, costs ו־context ל־decision סופי.

## ‏209. `TRADE`

‏החלטה שהמערכת מצאה candidate שעבר את כל ה־gates הרלוונטיים.

## ‏210. `NO_TRADE`

‏החלטה תקינה שלא לבצע עסקה משום שאין candidate שמצדיק פעולה תחת התנאים הנוכחיים.

## ‏211. `UNKNOWN`

‏מצב שבו חסר truth קריטי ולכן המערכת אינה יכולה להסיק בבטחה `TRADE` או `NO_TRADE` רגיל.

## ‏212. `Healthy NO_TRADE`

‏`NO_TRADE` שנובע משוק/edge לא מספיק טוב כאשר המערכת עצמה בריאה.

## ‏213. `Broken NO_TRADE`

‏מצב שנראה כמו `NO_TRADE` אך למעשה נגרם מכשל data/compute/coverage/decision readiness.

## ‏214. `Decision Readiness`

‏האם כל התנאים המקדימים קיימים כדי שה־Decision Engine יוכל לקבל החלטה תקינה.

## ‏215. `Pre-Submit Revalidation`

‏בדיקה מחודשת ממש לפני side effect חיצוני שה־candidate, data, risk ו־economics עדיין תקפים.

## ‏216. `Decision TTL`

‏משך הזמן שבו decision עדיין תקף לפני שחובה לחשב מחדש.

## ‏217. `Decision Snapshot`

‏התמונה המלאה של state/features/rank/veto/economics/version שעל בסיסם התקבלה החלטה.

## ‏218. `Decision Epoch`

‏מזהה generation/sequence של cycle החלטה מסוים.

## ‏219. `Decision Impact Rate`

‏כמה פעמים רכיב מסוים באמת שינה את ההחלטה, ולא רק השתנה מספרית.

## ‏220. `First Divergence`

‏הנקודה הראשונה בשרשרת שבה Actual behavior או גרסה אחת סטו מה־Expected/baseline.

---

# ‏J — Edge, Costs ו־Economics

## ‏221. `Signal`

‏מדידה/תבנית שמנבאת או מצביעה על outcome אפשרי. אינה edge בפני עצמה.

## ‏222. `Alpha`

‏יתרון חיזויי/כלכלי ביחס ל־baseline, לפי הגדרה מחקרית מסוימת.

## ‏223. `Edge`

‏יתרון כלכלי robust שניתן לבצע בפועל לאחר constraints ועלויות רלוונטיות.

## ‏224. `Gross Edge`

‏היתרון לפני execution costs ועלויות אחרות.

## ‏225. `Net Edge`

‏היתרון לאחר העלויות הרלוונטיות שהוגדרו.

## ‏226. `Executable Edge`

‏החלק מה־edge שניתן עדיין לממש בהתחשב ב־freshness, latency, liquidity, fill probability ו־costs.

## ‏227. `RemainingNetEdge`

‏הערכה בזמן decision/pre-submit לכמה edge נטו עוד נשאר לאחר העלויות והזמן שכבר חלפו.

## ‏228. `Edge Retention`

‏כמה מה־edge הצפוי/התחלתי נשמר עד fill/exit.

## ‏229. `Capture Ratio`

‏יחס בין value שנתפס בפועל לבין opportunity/edge reference שהוגדר.

## ‏230. `Latency Tax`

‏החלק מה־edge שנשחק בגלל latency.

## ‏231. `Spread Cost`

‏העלות הנובעת מחציית spread או מהפער בין benchmark ל־execution.

## ‏232. `Slippage`

‏פער בין מחיר benchmark צפוי למחיר execution בפועל.

## ‏233. `Commission`

‏עמלת broker/execution מפורשת.

## ‏234. `Regulatory Fee`

‏fee שנובע מדרישות רגולטוריות/בורסאיות ויכול להשתנות לאורך זמן.

## ‏235. `Borrow Cost`

‏עלות הקשורה להשאלת מניות לצורך short.

## ‏236. `All-In Cost`

‏סך העלויות המפורשות והמשוערות הרלוונטיות ל־trade/round trip.

## ‏237. `Round-Trip Cost`

‏עלות entry + exit יחד, כולל components מוגדרים.

## ‏238. `Cost Ratio`

‏יחס בין עלויות לבין gross expected edge או benchmark כלכלי אחר.

## ‏239. `Break-Even Cost`

‏רמת העלות שבה expected net edge מגיע לאפס.

## ‏240. `Opportunity Cost`

‏הערך שאבד בגלל בחירה, no-fill, veto או capital occupancy לעומת alternative.

## ‏241. `Missed Opportunity`

‏opportunity שלא מומשה למרות שבדיעבד הייתה רווחית; אינה בהכרח טעות אם decision היה נכון בזמן אמת.

## ‏242. `False Veto`

‏veto שחסם opportunity שהיה עומד ביעדים לפי evaluation framework.

## ‏243. `False Allow`

‏מצב שבו veto engine אפשר candidate שהיה צריך להיחסם לפי truth/evidence שנקבע.

## ‏244. `Economic Significance`

‏האם effect גדול מספיק להיות בעל ערך כספי לאחר costs, לא רק statistically detectable.

---

# ‏K — Risk, Safety ו־Account State

## ‏245. `Risk Limit`

‏מגבלה קשיחה על exposure/action בהתאם למדיניות.

## ‏246. `Risk Budget`

‏כמות הסיכון המורשית למסגרת מסוימת.

## ‏247. `Kill Switch`

‏מנגנון שמפסיק סוג מסוים של פעילות מסוכנת, בדרך כלל new entries או trading כולו.

## ‏248. `Entry Disabled`

‏מצב שבו אסור לפתוח exposure חדשה אך אפשר לנהל/לסגור exposure קיימת.

## ‏249. `Exit Only`

‏מצב תפעולי שמאפשר רק פעולות שמקטינות exposure.

## ‏250. `Safe Mode`

‏מצב שמצמצם functionality כדי לשמור safety תחת uncertainty/failure.

## ‏251. `Fail Closed`

‏כאשר truth קריטי חסר, ברירת המחדל היא לא ליצור risk חדש.

## ‏252. `Fail Safe`

‏התנהגות failure שנועדה לשמור יכולת לצמצם exposure ולהימנע מהחמרה.

## ‏253. `Account State`

‏cash, positions, orders, buying power, permissions ונתוני חשבון רלוונטיים בזמן נתון.

## ‏254. `Buying Power`

‏מדד broker/account של capacity לרכישות/positions, שאינו שקול בהכרח ל־cash.

## ‏255. `Settled Cash`

‏מזומן שהגיע למצב settlement לפי כללי החשבון/שוק.

## ‏256. `Margin`

‏מסגרת שבה broker מאפשר exposure מעבר למזומן פנוי בכפוף לדרישות.

## ‏257. `Maintenance Margin`

‏רמת equity/margin נדרשת כדי להמשיך להחזיק exposure מסוימת.

## ‏258. `Account Eligibility`

‏האם פעולה מותרת מבחינת account type, permissions, jurisdiction, broker rules ו־current state.

## ‏259. `Borrow Feasibility`

‏האם short candidate ניתן להשאלה ולביצוע בתנאים רלוונטיים.

## ‏260. `Hard-to-Borrow`

‏security שבו borrow מוגבל/יקר/לא יציב יחסית.

## ‏261. `Recall`

‏דרישה להחזיר borrowed shares, שיכולה להשפיע על short position.

## ‏262. `Buy-In`

‏סגירה כפויה/נדרשת של short לפי broker/market mechanics.

---

# ‏L — Research, Statistics ו־Validation

## ‏263. `Hypothesis`

‏טענה ניתנת להפרכה שמחקר מנסה לבדוק.

## ‏264. `Baseline`

‏השיטה הפשוטה/הקיימת שאליה משווים improvement.

## ‏265. `Train Set`

‏נתונים שמשמשים ללמידה/fit של model/parameters.

## ‏266. `Validation Set`

‏נתונים שמשמשים לבחירת model/parameters בלי לגעת ב־final holdout.

## ‏267. `Test Set`

‏Holdout שנועד להערכת generalization לאחר תהליך הבחירה.

## ‏268. `Out-of-Sample`

‏נתונים שלא שימשו לבניית/בחירת model באותו experiment.

## ‏269. `Walk-Forward`

‏מסגרת evaluation שבה מאמנים/מכוונים בעבר ובודקים בחלונות עתידיים רציפים.

## ‏270. `Leakage`

‏חדירת מידע שלא היה זמין בזמן אמת אל feature, label, model או evaluation.

## ‏271. `Look-Ahead Bias`

‏שימוש במידע עתידי כאילו היה ידוע בזמן ההחלטה.

## ‏272. `Survivorship Bias`

‏הטיה שנוצרת כאשר dataset כולל רק entities ששרדו עד ההווה.

## ‏273. `Selection Bias`

‏הטיה שנובעת מתהליך בחירת samples/candidates/experiments.

## ‏274. `Winner's Curse`

‏הנטייה של “הטוב ביותר” מתוך הרבה ניסויים להיות מוגזם בגלל noise/selection.

## ‏275. `Multiple Testing`

‏הבעיה שנוצרת כאשר בודקים הרבה hypotheses והסיכוי ל־false discoveries עולה.

## ‏276. `Overfitting`

‏התאמה לרעש/פרטים של sample במקום relation יציבה שמכלילה.

## ‏277. `Effect Size`

‏גודל האפקט, בנפרד מהמובהקות הסטטיסטית שלו.

## ‏278. `Confidence Interval`

‏טווח אומדן לאי־ודאות סביב parameter/metric לפי method מוגדר.

## ‏279. `p-value`

‏מדד תחת null hypothesis מסוים; אינו probability שה־hypothesis נכונה.

## ‏280. `Effective Sample Size`

‏מספר התצפיות העצמאיות האפקטיבי לאחר התחשבות בתלות/overlap/clustering.

## ‏281. `Bootstrap`

‏שיטת resampling להערכת uncertainty.

## ‏282. `Block Bootstrap`

‏Bootstrap ששומר blocks כדי להתמודד עם dependence סדרתי.

## ‏283. `Permutation Test`

‏בדיקה שמערבבת labels/relationships לפי null construction כדי לאמוד מה ניתן לקבל במקרה.

## ‏284. `Null Model`

‏baseline שמייצג מצב ללא edge/structure מסוים ומשמש sanity check.

## ‏285. `Ablation Study`

‏השוואה שיטתית עם ובלי רכיב כדי למדוד contribution.

## ‏286. `Sensitivity Analysis`

‏בדיקה כיצד results משתנים כאשר assumptions/parameters משתנים.

## ‏287. `Parameter Surface`

‏מפה של performance על פני range של parameter values, חשובה לזיהוי plateau לעומת spike שביר.

## ‏288. `Robustness`

‏המידה שבה result נשאר סביר תחת samples, regimes, costs ו־assumptions שונים.

## ‏289. `Statistical Power`

‏היכולת של experiment לזהות effect אמיתי בגודל מסוים.

## ‏290. `Minimum Detectable Effect`

‏גודל האפקט המינימלי שהניסוי מסוגל לזהות בסבירות/עוצמה שהוגדרה.

---

# ‏M — Backtest, Replay, Shadow ו־Live

## ‏291. `Backtest`

‏סימולציה היסטורית של decision/execution תחת assumptions מפורשים.

## ‏292. `As-Known-At`

‏ה־state כפי שהיה ידוע בזמן ההיסטורי, לפני corrections/knowledge עתידי.

## ‏293. `Historical Truth`

‏מה שנודע בסופו של דבר אחרי corrections והשלמת נתונים. אינו תמיד מה שהיה זמין בזמן אמת.

## ‏294. `Execution Simulation`

‏model שמעריך fills, partial fills, slippage, latency, queue uncertainty ו־costs.

## ‏295. `Touch != Fill`

‏העובדה שמחיר “נגע” ב־limit אינה הוכחה שה־order היה מתמלא.

## ‏296. `Deterministic Replay`

‏שחזור events באותו סדר/semantics כדי שהמערכת תייצר behavior חוזר.

## ‏297. `Stochastic Execution Simulation`

‏סימולציה שמכניסה uncertainty אקראית מבוקרת ל־fill/latency/queue outcomes.

## ‏298. `Simulation Error`

‏הפער בין behavior simulated לבין behavior observed בעולם אמיתי/קרוב לאמיתי.

## ‏299. `Shadow Mode`

‏הרצת decision logic על data live בלי side effects אמיתיים של orders.

## ‏300. `Paper Trading`

‏סביבה שבה broker/simulator מדמה orders/fills. אינה הוכחה מלאה ל־live execution quality.

## ‏301. `Live`

‏סביבה שבה decisions יכולים ליצור side effects אמיתיים בחשבון מורשה.

## ‏302. `Decision Twin`

‏הרצת שתי גרסאות על אותו context ככל האפשר כדי להשוות decisions.

## ‏303. `Counterfactual`

‏מה היה קורה תחת החלטה/גרסה אחרת, ככל שניתן לאמוד בלי לטעון certainty שאינה קיימת.

## ‏304. `Golden Episode`

‏תרחיש היסטורי/מוקלט שמייצג behavior חשוב ומשמש regression/replay testing.

## ‏305. `Golden Failure`

‏אירוע כשל חשוב שנשמר כדי לוודא שהמערכת לא חוזרת על אותה תקלה.

---

# ‏N — Live Truth, Recovery ו־State

## ‏306. `Local Truth`

‏ה־state שהמערכת המקומית חושבת שקיים.

## ‏307. `Broker Truth`

‏ה־state שה־broker מדווח לגבי orders, fills, positions ו־account.

## ‏308. `UNKNOWN_EFFECT`

‏מצב שבו פעולה נשלחה אך לא ידוע אם side effect קרה. אין לבצע retry עיוור עד reconciliation.

## ‏309. `Reconciliation`

‏תהליך השוואה ותיקון בין local state לבין external/broker truth.

## ‏310. `Idempotency`

‏היכולת לחזור על request/processing בלי ליצור side effect כפול כאשר זה תוכנן נכון.

## ‏311. `Single Writer`

‏עיקרון שבו רק instance מורשה אחד יכול לבצע state-changing actions מסוימות.

## ‏312. `Fencing Token`

‏מנגנון שמאפשר לדחות פעולות של instance ישן לאחר leadership/ownership change.

## ‏313. `Split Brain`

‏מצב שבו יותר מ־instance אחד מאמין שהוא בעל authority לפעול.

## ‏314. `Snapshot`

‏צילום durable של state בנקודת זמן לצורך recovery/replay.

## ‏315. `Event Journal`

‏רצף durable ואודיטבילי של events/decisions/side effects.

## ‏316. `Checkpoint`

‏נקודת state מאומתת שממנה ניתן להמשיך/recover.

## ‏317. `Resume`

‏חידוש פעולה לאחר pause/failure מתוך state ידוע ומאומת.

## ‏318. `Cold Start`

‏הפעלת מערכת ללא state runtime חם, הדורשת warmup/reconciliation לפני decision readiness.

## ‏319. `Recovery Point`

‏הנקודה הידועה האחרונה שממנה recovery יכול להתחיל.

## ‏320. `Recovery Invariant`

‏תנאי שחייב להיות נכון אחרי recovery, למשל שאין order effect לא ידוע לפני new entry.

---

# ‏O — Observability ו־Diagnostics

## ‏321. `Metric`

‏מדידה מספרית שנאספת לאורך זמן.

## ‏322. `Log`

‏רשומת event/diagnostic מובנית או טקסטואלית.

## ‏323. `Trace`

‏שרשרת correlated של פעולות שחוצה רכיבים/stages.

## ‏324. `Correlation ID`

‏מזהה שמקשר events הקשורים לאותו decision/order/incident.

## ‏325. `SLO`

‏`Service Level Objective` — יעד מדיד לאיכות/זמינות/latency/coverage.

## ‏326. `SLI`

‏`Service Level Indicator` — המדד שבאמצעותו בודקים SLO.

## ‏327. `Alert`

‏התראה אוטומטית על condition שמצריך תשומת לב.

## ‏328. `Alert Fatigue`

‏שחיקה כאשר יש יותר מדי alerts חסרי ערך, שגורמת להתעלמות גם מהחשובים.

## ‏329. `Leading Indicator`

‏metric שמאותת על הידרדרות לפני PnL/failure גלוי.

## ‏330. `Incident`

‏אירוע תפעולי/כלכלי/בטיחותי שמצריך investigation או response.

## ‏331. `Incident Packet`

‏חבילת evidence אוטומטית שמרכזת state, versions, events, orders, metrics ו־first divergence סביב incident.

## ‏332. `RCA`

‏`Root Cause Analysis` — חקירה שמזהה לא רק symptom אלא mechanism וגורם שורש.

## ‏333. `First Divergence RCA`

‏RCA שמתחיל בנקודה הראשונה שבה actual chain סטתה מה־expected chain.

## ‏334. `Diagnostic Coverage`

‏כמה מהשרשרת ניתן להסביר ולשחזר באמצעות telemetry הקיים.

## ‏335. `Decision Packet`

‏חבילת evidence מלאה סביב decision בודד.

---

# ‏P — Performance ו־Concurrency

## ‏336. `Hot Path`

‏השרשרת latency-sensitive שמשפיעה ישירות על freshness/decision/execution.

## ‏337. `Cold Path`

‏עיבוד שאינו חייב להיות ב־critical latency path, כגון analytics/reports עמוקים.

## ‏338. `Fast Path`

‏עיבוד מינימלי ומהיר לכל universe/candidate.

## ‏339. `Deep Path`

‏עיבוד יקר יותר שמופעל על subset קטן כמו Top-N.

## ‏340. `Backpressure`

‏מנגנון שבו consumer איטי גורם להגבלת/השהיית producer או לעיבוד מבוקר במקום queue אינסופית.

## ‏341. `Bounded Queue`

‏תור בעל capacity מוגבלת מראש.

## ‏342. `Queue Age`

‏גיל הפריט הישן ביותר/האופייני בתור; לעיתים חשוב יותר מ־queue length.

## ‏343. `Load Shedding`

‏הורדת עבודה פחות חשובה כדי לשמור על critical functions תחת עומס.

## ‏344. `Coalescing`

‏איחוד updates כך שרק state העדכני/הרלוונטי מעובד כאשר intermediate events אינם חיוניים.

## ‏345. `Burst Test`

‏בדיקה לעומס חד וקצר.

## ‏346. `Soak Test`

‏בדיקה לאורך זמן כדי למצוא leaks, drift או degradation מצטבר.

## ‏347. `p50 / p95 / p99`

‏אחוזונים של latency/metric; p99 מייצג tail behavior ולא “99% מהזמן בדיוק”.

## ‏348. `GC Pause`

‏השהיה הנובעת מ־garbage collection שעלולה לפגוע ב־tail latency.

## ‏349. `Throughput`

‏כמות העבודה שמערכת משלימה ליחידת זמן.

## ‏350. `Fair Scheduling`

‏תזמון שמונע starvation של symbols/work classes.

---

# ‏Q — Regimes, Events ו־Context

## ‏351. `Market Regime`

‏מצב שוק שבו relationships בין signals, liquidity, volatility, costs ו־outcomes שונים באופן משמעותי.

## ‏352. `Context`

‏state נוסף שמותנה בזמן ומשנה interpretation של signal/decision.

## ‏353. `Conditional Edge`

‏edge שקיים רק או בעיקר תחת context/regime מסוימים.

## ‏354. `Regime Leakage`

‏שימוש ב־regime label שנקבע בעזרת מידע עתידי כאילו היה ידוע בזמן אמת.

## ‏355. `Transition State`

‏מצב שבו השוק עובר בין regimes והסיווג אינו יציב.

## ‏356. `Hysteresis`

‏שימוש בספים שונים לכניסה/יציאה מ־state כדי למנוע flapping.

## ‏357. `Breadth`

‏מידה שבה move/condition משותף לחלק גדול מה־universe.

## ‏358. `Dispersion`

‏פיזור התשואות/ההתנהגות בין symbols באותו זמן.

## ‏359. `Correlation Shock`

‏שינוי חד בקורלציה בין נכסים/קבוצות.

## ‏360. `Event Context`

‏context שנובע מאירוע מידע, corporate action, halt או trading-state change.

## ‏361. `Catalyst`

‏אירוע/מידע שעשוי להסביר שינוי בביקוש, supply או expectations.

## ‏362. `Corporate Action`

‏אירוע רשמי שמשנה את security/economic terms, כגון split, dividend או reorganization.

## ‏363. `Adjusted Price`

‏מחיר היסטורי שעבר התאמות כדי לאפשר השוואה כלכלית לאורך corporate actions.

## ‏364. `Raw Price`

‏מחיר כפי שנרשם בזמן המסחר לפני התאמות היסטוריות.

## ‏365. `Event Age`

‏כמה זמן עבר מאז פרסום/קבלת event לפי clock מוגדר.

---

# ‏R — Machine Learning

## ‏366. `Target`

‏המשתנה שה־model מנסה לנבא/לדרג.

## ‏367. `Label`

‏הערך המחושב בדאטה שמשמש target באימון/evaluation.

## ‏368. `Classification`

‏חיזוי category/probability של class.

## ‏369. `Regression`

‏חיזוי ערך רציף.

## ‏370. `Learning-to-Rank`

‏מודל שמותאם ישירות ל־ordering/relative ranking של candidates.

## ‏371. `Calibration`

‏המידה שבה predicted probabilities מתאימות לתדירות outcomes בפועל.

## ‏372. `Class Imbalance`

‏מצב שבו classes אינם מופיעים בתדירות דומה.

## ‏373. `Training-Serving Skew`

‏פער בין הדרך שבה features/data מחושבים באימון לבין production inference.

## ‏374. `Concept Drift`

‏שינוי ב־relationship בין inputs ל־target.

## ‏375. `Covariate Drift`

‏שינוי בהתפלגות inputs גם אם conditional relationship לא בהכרח השתנה.

## ‏376. `Model Registry`

‏מאגר versioned של models, metadata, training evidence ו־promotion status.

## ‏377. `Champion Model`

‏ה־model המאושר כרגע כ־baseline/active.

## ‏378. `Challenger Model`

‏model חלופי שנבדק מול champion בלי לקבל authority אוטומטית.

## ‏379. `Feature Importance`

‏אומדן לתרומת feature לפי method מסוים; אינו הוכחה causal או decision value.

## ‏380. `SHAP`

‏משפחת שיטות attribution המבוססת על Shapley values; כלי פרשנות, לא oracle ל־edge.

---

# ‏S — Champion / Challenger ו־Improvement

## ‏381. `Champion`

‏הגרסה המאושרת כרגע להשוואה או production.

## ‏382. `Challenger`

‏גרסה חלופית שנבדקת מול champion תחת evidence gates.

## ‏383. `Disagreement Set`

‏המקרים שבהם champion ו־challenger קיבלו החלטה שונה באופן מהותי.

## ‏384. `Decision Delta`

‏התיאור של ההבדל בהחלטה בין שתי גרסאות.

## ‏385. `Incremental Decision Value`

‏הערך הכלכלי/תפעולי שנוסף עקב שינוי ההחלטות, לא רק שינוי metric פנימי.

## ‏386. `Guardrail`

‏metric/constraint שאסור לשיפור ראשי לפגוע בו מעבר לרף מוגדר.

## ‏387. `Promotion`

‏העברת challenger לשלב authority גבוה יותר לאחר evidence מספק.

## ‏388. `Demotion`

‏הורדת authority של version עקב failure, drift או evidence חדש.

## ‏389. `Rollback`

‏חזרה לגרסה קודמת ידועה, כולל state/config compatibility נדרשת.

## ‏390. `Promotion Packet`

‏חבילת evidence שמצדיקה קידום version.

## ‏391. `Continuous Improvement`

‏תהליך מבוקר של learning והחלפת components; אינו continuous change.

## ‏392. `Research Queue`

‏רשימת hypotheses/problems שממתינים למחקר, עם evidence ו־priority.

## ‏393. `Learning Debt`

‏פער בין דברים שהמערכת ראתה/חשדה בהם לבין מחקר מסודר שעדיין לא נעשה.

## ‏394. `Complexity Tax`

‏העלות הנוספת של complexity מבחינת latency, bugs, testing, operations והסבריות.

---

# ‏T — Architecture ו־Versioning

## ‏395. `Port`

‏interface/domain boundary שמאפשר להחליף provider/adapter בלי לערבב domain logic.

## ‏396. `Adapter`

‏מימוש שמתרגם API/provider חיצוני ל־contract פנימי.

## ‏397. `Data Plane`

‏האחריות על ingestion, normalization, canonical market state ו־freshness.

## ‏398. `Decision Plane`

‏Features, eligibility, ranking, vetoes ו־decision aggregation.

## ‏399. `Execution Plane`

‏Order intent, broker adapter, submit/cancel/replace ו־order reconciliation.

## ‏400. `Position/Exit Plane`

‏Position truth, monitoring, exit urgency ו־flattening.

## ‏401. `Control Plane`

‏Modes, kill switches, permissions, configs ו־operational authority.

## ‏402. `Evidence/Replay Plane`

‏Journal, snapshots, replay, diagnostics ו־RCA evidence.

## ‏403. `Learning Plane`

‏Daily Review, experiments, champion/challenger ו־continuous improvement.

## ‏404. `Modular Monolith`

‏תהליך/יישום אחד עם boundaries פנימיים ברורים במקום microservices מוקדמים.

## ‏405. `Strategy Version`

‏זהות קנונית של strategy כ־composite artifact, לא רק Git commit.

## ‏406. `Strategy Manifest`

‏מסמך/record שמרכז את כל versions/fingerprints שיוצרים behavior מסוים.

## ‏407. `Config Fingerprint`

‏hash/identity דטרמיניסטי של resolved configuration.

## ‏408. `Resolved Config`

‏ה־config בפועל לאחר defaults, overrides ו־environment resolution.

## ‏409. `Schema Version`

‏גרסה של מבנה הנתונים/contract.

## ‏410. `Build Artifact`

‏binary/container/package immutable שנפרס בפועל.

## ‏411. `Build Digest`

‏מזהה cryptographic של artifact.

## ‏412. `Version Lineage`

‏הקשר בין version, evidence, experiments, deployments ו־results.

---

# ‏U — Production Modes ו־Governance

## ‏413. `DEV`

‏סביבה לפיתוח; אינה אמורה להיות מסוגלת בטעות לייצר side effects של LIVE.

## ‏414. `REPLAY`

‏מצב שבו events היסטוריים/מוקלטים מוזרמים דרך אותה לוגיקה ככל האפשר.

## ‏415. `SHADOW`

‏מצב live-data ללא real execution authority.

## ‏416. `PAPER`

‏מצב broker/simulator שמדמה execution.

## ‏417. `LIVE`

‏מצב בעל authority ליצירת side effects אמיתיים בחשבון מורשה.

## ‏418. `Live Permission`

‏authorization זמני/מותנה שמאפשר entry אמיתי רק כאשר readiness gates תקפים.

## ‏419. `Live Readiness`

‏מצב evidence-based שבו research, execution, recovery, safety, operations ו־governance עברו gates מוגדרים.

## ‏420. `GO_SMALL`

‏החלטת readiness שמאפשרת controlled small-live review/phase במסגרת authorization מתאים; אינה טענה שהמערכת בטוחה או רווחית.

## ‏421. `NO_GO`

‏החלטה שלא לעבור לשלב live/next authority בגלל blocker או evidence חסר.

## ‏422. `P0 Blocker`

‏כשל קריטי שאסור לעקוף באמצעות average score או הצלחות אחרות.

## ‏423. `Evidence Gate`

‏תנאי מעבר שמחייב evidence מוגדר ולא checkbox סמלי.

## ‏424. `Residual Risk`

‏סיכון שנשאר לאחר controls וידוע במפורש למקבל ההחלטה המורשה.

## ‏425. `Known Unknown`

‏פער ידע מוכר ומתועד.

## ‏426. `Unknown Budget`

‏הגבלה על כמה unknowns קריטיים מותר להשאיר פתוחים בשלב מסוים.

---

# ‏V — Accounting ו־Ledger

## ‏427. `Ledger`

‏רישום durable ומובנה של events כלכליים/חשבונאיים.

## ‏428. `Execution Ledger`

‏רישום fills, commissions ו־execution details.

## ‏429. `Position Ledger`

‏רישום השינויים ב־position לאורך זמן.

## ‏430. `Cash Ledger`

‏רישום תנועות cash, fees, settlements ו־FX.

## ‏431. `Tax Lot`

‏יחידה חשבונאית של acquisition/disposition המשמשת cost basis ודיווח מס לפי הכללים הרלוונטיים.

## ‏432. `Cost Basis`

‏בסיס העלות החשבונאי/מיסויי של position/lot לפי jurisdiction/rules.

## ‏433. `Realized PnL`

‏רווח/הפסד שהתגבש בעקבות closing/disposition לפי ledger definition.

## ‏434. `Unrealized PnL`

‏רווח/הפסד mark-to-market על exposure שעדיין פתוחה.

## ‏435. `Economic PnL`

‏תוצאה כלכלית כפי שמוגדרת במחקר/strategy, שיכולה לכלול costs שונים.

## ‏436. `Accounting PnL`

‏תוצאה לפי ledger/accounting representation.

## ‏437. `Taxable PnL`

‏תוצאה כפי שהחוק הרלוונטי מסווג לצורכי מס; אינה בהכרח זהה ל־Economic או Accounting PnL.

## ‏438. `Withholding`

‏מס/סכום שנוכה במקור על ידי intermediary לפי כללים רלוונטיים.

## ‏439. `Reconciliation Break`

‏פער בין broker statement לבין ledger המקומי שעדיין אינו מוסבר.

---

# ‏W — Error Semantics ו־Failure Language

## ‏440. `Expected Failure`

‏failure mode מוכר שהמערכת מתוכננת להתמודד איתו.

## ‏441. `Unexpected Failure`

‏מצב שלא תאם failure contract/assumptions הקיימים.

## ‏442. `Transient Failure`

‏כשל זמני שעשוי להיעלם ללא שינוי configuration/domain state.

## ‏443. `Permanent Failure`

‏כשל שלא צפוי להיפתר על ידי retry בלבד.

## ‏444. `Retryable`

‏פעולה שמותר לנסות שוב תחת idempotency/effect knowledge מתאימים.

## ‏445. `Non-Retryable`

‏פעולה שאסור לנסות שוב אוטומטית בלי שינוי state/permission/inputs.

## ‏446. `Degraded Mode`

‏מצב שבו חלק מהיכולות מושבתות אך המערכת ממשיכה בתפקוד בטוח מוגבל.

## ‏447. `Quarantine`

‏בידוד symbol/provider/component בעייתי במקום להשבית את כל המערכת.

## ‏448. `Failover`

‏מעבר ל־provider/component חלופי לאחר failure, עם semantics ברורים של generation ו־truth.

## ‏449. `Graceful Degradation`

‏ירידה מבוקרת ב־functionality תוך שמירה על invariants קריטיים.

## ‏450. `Invariant`

‏תנאי שחייב להישאר נכון בכל state transition חוקי.

---

# ‏X — Practitioner Terms שחייבים להבין בדיוק

## ‏451. `Edge Illusion`

‏תוצאה שנראית כמו edge אך נובעת מ־leakage, overfitting, unrealistic fills, costs חסרים או selection bias.

## ‏452. `Execution Fantasy`

‏backtest שמניח fills/latency/price שאינם סבירים בעולם אמיתי.

## ‏453. `Checkbox Theater`

‏סימון readiness items כ־done בלי evidence אמיתי.

## ‏454. `Config Drift`

‏פער בין configuration המאושרת לזו שרצה בפועל.

## ‏455. `Data Drift`

‏שינוי במבנה/התפלגות/semantics של input data.

## ‏456. `Operational Drift`

‏הידרדרות בתפעול/latency/recovery/alerts גם אם strategy logic לא השתנה.

## ‏457. `Silent Failure`

‏כשל שלא גורם crash/alert ברור אך משנה behavior או quality.

## ‏458. `Unknown State`

‏מצב שבו המערכת אינה יכולה להוכיח מה truth הנוכחי בתחום קריטי.

## ‏459. `State Explosion`

‏ריבוי states/rules/interactions עד שקשה להוכיח correctness.

## ‏460. `Rule Explosion`

‏הצטברות תנאים מיוחדים שמעלה overfitting ומורכבות תפעולית.

## ‏461. `Feature Debt`

‏Features ישנים/מיותרים שממשיכים לעלות latency, maintenance ו־cognitive load.

## ‏462. `Research Debt`

‏הנחות/תוצאות שלא נבדקו עד הסוף אך ממשיכות להשפיע על המערכת.

## ‏463. `Observability Debt`

‏אזורים שבהם אין מספיק telemetry כדי להסביר behavior/failure.

## ‏464. `Recovery Debt`

‏failure/restart paths שלא נבדקו או אינם deterministic.

## ‏465. `Evidence Debt`

‏שינוי/decision שנשען על אמונה חזקה יותר מה־evidence שתומך בו.

---

# ‏Y — Core Equations ו־Canonical Relationships

## ‏466. `Spread`

```text
Spread = Ask - Bid
```

## ‏467. `Mid`

```text
Mid = (Bid + Ask) / 2
```

## ‏468. `Latency Pressure`

```text
LatencyPressure = EndToEndLatency / SignalHalfLife
```

## ‏469. `Executable Decision Chain`

```text
Prediction
→ Ranking
→ Eligibility
→ Negative Evidence
→ Entry Feasibility
→ Fill Probability
→ Adverse Selection
→ Exit Feasibility
→ Costs
→ RemainingNetEdge
→ TRADE / NO_TRADE / UNKNOWN
```

## ‏470. `Economic Chain`

```text
Gross Edge
- Spread
- Slippage
- Commission
- Fees
- Impact
- Adverse Selection
- Latency Tax
- Other Applicable Costs
= Net Executable Edge
```

## ‏471. `Live Truth Chain`

```text
Intent
→ Submitted
→ Accepted
→ Working
→ Partial Fill / Fill / Cancel / Reject
→ Broker Reconciliation
→ Position Truth
```

## ‏472. `Learning Chain`

```text
Observation
→ Hypothesis
→ Experiment
→ Validation
→ Replay
→ Shadow
→ Challenger
→ Promotion / Reject / Keep Researching
→ Monitoring
→ Reassessment
```

## ‏473. `Safety Chain`

```text
Unknown Critical State
→ Block New Risk
→ Reconcile
→ Restore Truth
→ Re-evaluate
→ Resume Only When Invariants Hold
```

---

# ‏Z — עשרת המשפטים הקנוניים של הקורס

## ‏474. `Signal != Edge`

‏Signal הוא evidence. Edge הוא advantage executable נטו.

## ‏475. `Rank #1 != Trade`

‏המנצח היחסי עדיין יכול להיות candidate גרוע באופן מוחלט.

## ‏476. `Last != Executable Price`

‏עסקה אחרונה אינה התחייבות שמחיר זה זמין עכשיו.

## ‏477. `Touch != Fill`

‏נגיעה במחיר אינה הוכחת execution.

## ‏478. `Submitted != Accepted != Working != Filled`

‏כל transition הוא state אחר עם failure semantics משלו.

## ‏479. `Local Truth != Broker Truth`

‏במחלוקת על exposure/orders, צריך reconciliation ולא הנחה.

## ‏480. `NO_TRADE is a Valid Decision`

‏מערכת מקצועית אינה חייבת לבחור trade בכל cycle.

## ‏481. `Unknown Critical State → No New Risk`

‏כאשר truth קריטי חסר, לא מייצרים exposure חדשה.

## ‏482. `Backtest Profit != Live Readiness`

‏מחקר טוב הוא תנאי נדרש, לא תנאי מספיק ל־live.

## ‏483. `Continuous Improvement != Continuous Change`

‏שינוי מתקדם רק כאשר evidence מצדיק אותו.

---

# ‏נספח A — Naming Rules לקוד ול־Telemetry

## ‏484. אל תקרא `price` למשהו שאינו מוגדר

‏השתמש בשם מפורש:

```text
lastPrice
bidPrice
askPrice
midPrice
arrivalPrice
fillPrice
```

## ‏485. אל תקרא `latency` בלי גבולות

‏השתמש לדוגמה:

```text
receiveToDecisionLatency
submitToAckLatency
submitToFillLatency
decisionToUsefulFillLatency
```

## ‏486. אל תקרא `fresh` ללא threshold

‏שמור גם:

```text
ageMs
freshnessThresholdMs
freshnessState
```

## ‏487. אל תקרא `status=ok` למערכת מורכבת

‏הפרד:

```text
dataHealth
scannerHealth
brokerHealth
positionTruthHealth
executionHealth
readinessState
```

## ‏488. אל תקרא `position` ל־cached assumption

‏השתמש בשמות שמבהירים source:

```text
localPositionEstimate
brokerPosition
reconciledPosition
```

## ‏489. אל תקרא `score` ל־expected return אם הוא אינו כזה

‏אם metric הוא probability, expected net edge או rank score — שם אותו בהתאם.

## ‏490. אל תקרא `error` לכל rejection

‏הפרד בין:

```text
validationFailure
brokerReject
providerFailure
unknownEffect
safetyVeto
businessNoTrade
```

---

# ‏נספח B — `Definition of Done` למילון

## ‏491. לכל מונח קריטי יש משמעות אחת

‏אין שני רכיבים שמשתמשים באותו שם למשמעויות שונות.

## ‏492. כל state חיצוני מבחין בין Local ל־External Truth

‏במיוחד orders, fills, positions ו־account state.

## ‏493. כל metric זמן מציין start/end ו־clock domain

‏`Latency` לבד אינו שם מספיק טוב.

## ‏494. כל price metric מציין benchmark/source

‏`Price` לבד אינו מספיק טוב.

## ‏495. כל `NO_TRADE` ניתן לסיווג

‏Healthy, veto-driven, economic, account-driven, readiness failure או broken pipeline.

## ‏496. כל veto ניתן להסבר

‏באמצעות `ReasonCode`, evidence ו־version.

## ‏497. כל strategy result קשור לגרסה

‏`StrategyVersion + ConfigFingerprint + Data/Execution contracts`.

## ‏498. כל historical result מציין אם הוא `As-Known-At`

‏כדי למנוע leakage סמוי.

## ‏499. כל operational unknown מקבל semantics מפורשים

‏לא מחליפים unknown ב־false/zero/default בלי הצדקה.

## ‏500. המילון עצמו הוא contract חי

‏כאשר מונח חדש הופך מהותי — מוסיפים אותו כאן. כאשר definition משתנה, משנים באופן versioned ובודקים השפעה על docs, code, metrics ו־RCA.

---

# ‏סיכום

‏המילון הקנוני של הקורס נועד למנוע אחת התקלות המסוכנות ביותר במערכות מורכבות: שני אנשים או שני רכיבים שאומרים אותה מילה ומתכוונים לדברים שונים.

‏המשפט המסכם:

> ‏**Precision in language creates precision in state, metrics, decisions and failures. אם איננו מסוגלים להגדיר מונח במדויק — עדיין איננו מוכנים לקודד עליו invariant או החלטה.**
