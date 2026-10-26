# ‏שלב 57 — `100 Practical Tips for a Personal Algo Builder`: מאה הרגלים קטנים שבונים מערכת מקצועית

> ‏מטרת הפרק: לרכז מאה טיפים מעשיים לבונה רובוט Algo אישי — Research, Market Data, Scanner, Execution, Risk, Testing, Performance ו־Operations — כך שכל טיפ יהיה קטן מספיק ליישום, אבל בעל פוטנציאל למנוע טעות יקרה או לשפר משמעותית את איכות המערכת.
>
> ‏העיקרון המרכזי: **מערכת מקצועית נבנית מהרבה הרגלים קטנים שמקטינים ambiguity: פחות state סמוי, פחות assumptions לא מתועדות, פחות retry עיוור, ופחות metrics שמספרים רק חצי מהסיפור.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏איך להשתמש בפרק

‏לא מנסים ליישם את כל 100 הטיפים בבת אחת.

‏לכל טיפ שואלים:

1. ‏האם הוא פותר failure mode שכבר קיים אצלנו?
2. ‏האם הוא מגדיל observability או reproducibility?
3. ‏האם הוא משפר net edge או רק מוסיף complexity?
4. ‏האם הוא מתאים ל־signal horizon שלנו — מילישניות עד שניות?

---

# ‏A — Research ו־Hypotheses

## ‏1. כתוב את ה־hypothesis לפני שאתה מריץ את הניסוי

‏אל תיתן לתוצאה להמציא בדיעבד את הסיפור.

## ‏2. קבע מראש metric ראשי אחד

‏אפשר למדוד הרבה דברים, אבל צריך לדעת מראש מה יכריע אם הרעיון הצליח.

## ‏3. שמור גם ניסויים שנכשלו

‏Negative Results מונעים ממך לחזור בעוד חודש לאותו רעיון בתחפושת חדשה.

## ‏4. אל תשנה יותר ממשתנה מהותי אחד בניסוי

‏אם שינית feature, threshold ו־execution model יחד — לא למדת מה גרם לשינוי.

## ‏5. תן לכל Experiment מזהה קבוע

‏`ExperimentId` צריך לקשר code, data, config, metrics והמסקנה.

## ‏6. קבע Baseline משעמם

‏בלי Baseline פשוט אין דרך לדעת אם complexity חדשה באמת מוסיפה ערך.

## ‏7. הרץ Ablation לפני שאתה מתלהב מ־Feature חדש

‏בדוק מה קורה כשמסירים אותו מהמודל במקום רק כשהוא קיים.

## ‏8. חפש failure cases ידנית

‏כמה דוגמאות מפורקות לעומק יכולות לחשוף בעיה ש־aggregate metric מסתיר.

## ‏9. הפרד Research Question מ־Implementation Question

‏קודם שאל “האם האפקט קיים?”, ורק אחר כך “איך לממש אותו מהר?”.

## ‏10. כתוב מראש מה יגרום לך לוותר על רעיון

‏כך אתה מונע Endless Tuning.

---

# ‏B — Labels, Metrics ו־Validation

## ‏11. למדוד תמיד `Net`, לא רק `Gross`

‏Spread, fees, slippage, fill risk ו־latency יכולים להפוך signal חיובי ל־negative edge.

## ‏12. שמור כמה horizons במקביל

‏לרובוט שלנו חשוב למשל 250ms, 500ms, 1s, 2s, 5s, 10s — אם איכות הנתונים מאפשרת זאת.

## ‏13. שמור `time_to_first_profit`

‏לא רק כמה המחיר עלה, אלא כמה מהר נוצרה בכלל הזדמנות למימוש.

## ‏14. שמור `time_to_target`

‏כך אפשר לבדוק אם target קטן ומהיר הוא מציאותי או רק תוצאה ממוצעת יפה.

## ‏15. שמור גם `MFE` וגם `MAE`

‏המסלול חשוב לא פחות מהתוצאה הסופית.

## ‏16. מדוד Giveback

‏אם רווח קטן מופיע ואז נעלם מהר, זו תכונה חשובה ל־Exit design.

## ‏17. אל תסתפק ב־Hit Rate

‏Hit Rate גבוה עם הפסדים גדולים עדיין יכול להיות Strategy גרועה.

## ‏18. בדוק Distribution, לא רק Mean

‏P50/P90/P99, tails ו־outliers חשובים במיוחד בטווחים קצרים.

## ‏19. נתח לפי Regime

‏פתיחה, אמצע יום, fast market, quiet market ו־high-volatility יכולים להיות עולמות שונים.

## ‏20. שמור Holdout שאינך נוגע בו

‏אם הסתכלת שוב ושוב על ה־test set — הוא כבר validation set.

---

# ‏C — Market Data

## ‏21. שמור `EventTime` ו־`ReceiveTime` בנפרד

‏בלי זה אי אפשר לדעת אם signal היה מוקדם או שה־feed הגיע מאוחר.

## ‏22. שמור `Sequence` כאשר הספק נותן אותו

‏Sequence gap יכול להסביר feature “מוזר” הרבה יותר טוב מאשר Strategy RCA.

## ‏23. אל תמחק Raw Events מוקדם מדי

‏Canonical state יכול להשתנות בעתיד; Raw מאפשר rebuild אמיתי.

## ‏24. שמור `ProviderId` בכל record

‏Data provenance צריך לשרוד גם אחרי normalization.

## ‏25. שמור `SchemaVersion`

‏Parser חדש יכול לשנות היסטוריה בלי שתשים לב אם אין versioning.

## ‏26. התייחס ל־stale field כמידע שונה, לא כערך רגיל

‏`Bid=100` בן 2 שניות אינו אותו דבר כמו `Bid=100` בן 10ms.

## ‏27. השתמש ב־quality state מפורש

‏למשל `GOOD`, ‏`DEGRADED`, ‏`STALE`, ‏`GAPPED`, ‏`UNKNOWN`.

## ‏28. השווה feeds מדי פעם

‏Cross-provider comparison יכול לחשוף latency drift או semantics שונים.

## ‏29. אל תניח ש־no update פירושו no market activity

‏זה יכול להיות quiet symbol, stale connection או gap.

## ‏30. שמור מספיק מידע כדי לעשות deterministic replay

‏אם לא ניתן לשחזר את אותו state sequence — המחקר וה־production חיים בשני עולמות שונים.

---

# ‏D — Scanner ו־Ranking

## ‏31. חשב incrementally

‏Rolling state עדיף על recompute מלא של כל ההיסטוריה בכל tick.

## ‏32. השתמש ב־Fast Path לכל ה־Universe

‏Features זולים קודם; features יקרים רק למועמדים.

## ‏33. שמור Top-N, לא רק Top-1

‏Top-1 ללא context לא אומר אם המנצח באמת מוביל או ניצח בפער זניח.

## ‏34. שמור `RankGap`

‏הפער בין מקום 1 ל־2 הוא signal בפני עצמו.

## ‏35. שמור `RankAge`

‏Winner יציב במשך 2 שניות שונה מ־winner שקפץ למקום ראשון לפני 20ms.

## ‏36. שמור `RankChurn`

‏Scanner שמחליף winner עשרות פעמים בשנייה דורש מדיניות שונה מ־ranking יציב.

## ‏37. קבע tie-breakers דטרמיניסטיים

‏אותו input צריך לייצר אותו ranking גם ב־Replay.

## ‏38. אל תדרג Symbols stale יחד עם fresh

‏Freshness חייב להיות חלק מה־eligibility.

## ‏39. שמור rejection reasons

‏“למה XYZ לא היה candidate?” צריכה להיות שאלה שקל לענות עליה.

## ‏40. שמור `NO TRADE` כ־decision מלא

‏גם אי־ביצוע צריך reason code, snapshot ו־metrics.

---

# ‏E — Momentum ו־Microstructure

## ‏41. אל תסתכל רק על `Last`

‏בשלב execution צריך לבדוק לפחות את economics של `Bid/Ask` הרלוונטיים.

## ‏42. השווה price movement ל־activity

‏אותו return עם 3 trades ועם 300 trades אינו אותו evidence.

## ‏43. חפש acceleration ולא רק velocity

‏לעיתים מה שחשוב הוא שהקצב עצמו משתנה.

## ‏44. שמור persistence

‏Burst קצר של 100ms ו־pressure יציב של 2s צריכים להיראות אחרת.

## ‏45. מדוד price response ל־flow

‏Aggressive buying בלי progress יכול לספר סיפור אחר מ־buy flow שמזיז price ביעילות.

## ‏46. הפרד `TradeFlowImbalance` מ־`BookImbalance`

‏אל תשתמש בשם `imbalance` לשני concepts שונים.

## ‏47. נרמל book sizes

‏Raw depth של 20,000 shares לא בר־השוואה בין symbols שונים.

## ‏48. השתמש ב־microprice כ־feature, לא כ־truth

‏הוא estimator קצר־טווח, לא fair value מוחלט.

## ‏49. מדוד signal half-life

‏Feature טוב שנעלם לפני שה־order מגיע אינו feature שימושי למסחר שלנו.

## ‏50. חפש agreement בין signal, flow, book ו־price response

‏Alignment יכול להיות מועמד למחקר — אבל צריך להוכיח incremental value.

---

# ‏F — Entry ו־Orders

## ‏51. בנה `OrderIntent` לפני Broker Order

‏ה־intent צריך לתאר למה אנחנו רוצים לפעול, לא איך API מסוים דורש את הבקשה.

## ‏52. שמור `SignalTime` בתוך ה־Intent

‏כך אפשר למדוד signal age עד submit ועד fill.

## ‏53. שמור `SignalTTL`

‏Order צריך לדעת מתי הסיבה המקורית לשליחתו כבר פגה.

## ‏54. בצע revalidation ממש לפני submit

‏Winner מלפני 500ms לא בהכרח winner עכשיו.

## ‏55. השתמש ב־hard price bounds

‏גם Strategy טובה לא צריכה לרדוף אחרי מחיר ללא גבול.

## ‏56. הפרד urgency מ־order type

‏`Limit` יכול להיות passive או marketable; אל תערבב semantic intent עם primitive broker order.

## ‏57. מדוד Fill Probability יחד עם Opportunity Cost

‏Order שלא מתמלא אינו “חינם”.

## ‏58. בדוק cancel/replace cost

‏שינוי מחיר יכול לאבד queue priority.

## ‏59. שמור partial fills כ־state ראשון במעלה

‏אל תתייחס אליהם כ־exception.

## ‏60. אל תשתמש בפקודה מתקדמת רק כי היא קיימת

‏היא צריכה להוכיח יתרון מול baseline פשוט.

---

# ‏G — Execution ו־Broker Integration

## ‏61. לכל Order חייב להיות stable client identity

‏בלי `ClientOrderId` עקבי קשה למנוע duplicates ולבצע reconciliation.

## ‏62. כתוב intent ליומן לפני side effect

‏כך restart יכול להבין מה ניסינו לעשות.

## ‏63. אל תעשה blind retry אחרי timeout

‏Timeout לא אומר שהברוקר לא קיבל את הבקשה.

## ‏64. השתמש ב־`UNKNOWN_EFFECT`

‏אי־ודאות היא state; אל תכריח אותה ל־success/failure מזויף.

## ‏65. Broker truth גובר על local assumptions

‏אחרי reconnect צריך למשוך open orders, fills ו־positions ולהשוות.

## ‏66. חשב `PendingExposure`

‏Risk כולל גם orders שעדיין לא ברור אם יתמלאו.

## ‏67. תן Exit/Cancel עדיפות על Entry חדש

‏כאשר המערכת עמוסה, הורדת risk קודמת ליצירת risk.

## ‏68. מדוד `TimeToFlat`

‏לרובוט קצר זה KPI חשוב יותר מהרבה metrics טכניים.

## ‏69. שמור כל broker event raw לפני normalization

‏זה קריטי ל־RCA של races ו־provider quirks.

## ‏70. בנה adapter conformance suite

‏כל Broker Adapter חדש צריך להוכיח אותם semantics בסיסיים.

---

# ‏H — Risk ו־Economics

## ‏71. קבע Risk Gate לפני כל Entry

‏לא רק בתחילת trade, אלא ממש לפני submit.

## ‏72. חשב position size מתוך כמה caps

‏Risk, liquidity, capacity, exposure ו־capital — וקח את המגביל ביותר.

## ‏73. שמור `ExpectedNetEdge` בזמן decision

‏כך אפשר לבדוק בדיעבד אם trade היה מוצדק לפי המידע שהיה אז.

## ‏74. קבע minimum edge מעל uncertainty

‏Edge שקרוב מדי ל־zero אינו margin of safety.

## ‏75. הפרד Entry Capacity מ־Exit Capacity

‏קל להיכנס לא אומר שקל לצאת.

## ‏76. בדוק Capacity לפני scaling capital

‏Backtest קטן לא מוכיח scaling לינארי.

## ‏77. שמור daily risk budget

‏רצף כישלונות צריך להקטין או לעצור יצירת risk חדש.

## ‏78. בנה `NO TRADE` reasons כלכליים

‏למשל spread, slippage, impact או expected adverse selection גבוהים מדי.

## ‏79. מדוד `NetEdgeRetained`

‏כמה מה־gross alpha שרד עד fill ועד exit.

## ‏80. הפרד Strategy Loss מ־Execution Loss

‏אותה P&L יכולה לנבוע משני failure modes שונים לגמרי.

---

# ‏I — Testing, Performance ו־Observability

## ‏81. השתמש ב־Fake Clock בבדיקות

‏כך timeout, TTL ו־recovery tests נשארים מהירים ודטרמיניסטיים.

## ‏82. כל Incident משמעותי צריך להפוך ל־Regression Test

‏אחרת הארגון שוכח והבאג יכול לחזור.

## ‏83. בדוק invariants, לא רק examples

‏למשל `NoOverfill`, ‏`NoDuplicateEntry`, ‏`FlatMeansFlat`.

## ‏84. שמור golden replays

‏ימים/חלונות ידועים צריכים לייצר אותן החלטות אחרי refactor.

## ‏85. פרופיל production-like load

‏Microbenchmark בלבד לא מגלה queueing, backpressure או GC bursts.

## ‏86. עקוב אחרי P99, לא רק average

‏Tail latency הוא המקום שבו trades קצרים נשברים.

## ‏87. מדוד queue age

‏Queue length לבדו לא אומר כמה stale העבודה שממתינה.

## ‏88. שמור traces סביב החלטות חשובות

‏Candidate → Intent → Submit → ACK → Fill → Exit צריך להיות traceable.

## ‏89. שמור reason codes, לא רק logs חופשיים

‏Structured reasons הופכים RCA ו־analytics לקלים בהרבה.

## ‏90. אל תאפשר observability לפגוע ב־hot path

‏Telemetry חייבת להיות שימושית אבל bounded וזולה.

---

# ‏J — Operations, Workflow ו־Learning Loop

## ‏91. הפרד לחלוטין PAPER ו־LIVE

‏חשבונות, credentials, config ו־UI cues צריכים להיות שונים בבירור.

## ‏92. לפני Live Session הרץ startup checklist אוטומטי

‏Data, broker, account, clocks, risk config ו־ownership צריכים להיות מוכחים.

## ‏93. שמור build/config IDs בכל decision

‏אחרת אי אפשר לדעת איזו גרסה יצרה trade מסוים.

## ‏94. עשה deploy reversible

‏Rollback/forward recovery צריכים להיות מתוכננים לפני התקלה.

## ‏95. אל תסמוך על זיכרון אנושי בזמן Incident

‏Runbooks קצרים וברורים עדיפים על “אני זוכר מה עושים”.

## ‏96. נתח Near Misses, לא רק הפסדים

‏כמעט-duplicate, כמעט-overfill וכמעט-stale trade הם data חשובים.

## ‏97. בצע Daily Review אוטומטי

‏Top candidates, trades, NO TRADE, latency, data quality ו־execution anomalies צריכים סיכום קבוע.

## ‏98. Retire features שלא מוסיפים ערך

‏Feature complexity היא debt אם אין לה תרומה מדידה.

## ‏99. שמור Champion פשוט ו־Challenger ניסיוני

‏כך אפשר להשתפר בלי להפוך כל experiment ל־production risk.

## ‏100. תמיד שאל: “מה הדבר הפשוט ביותר שיכול להוכיח או להפריך את הרעיון?”

‏זה כלל KISS של כל הקורס: לפני model מסובך, infrastructure חדשה או order tactic מתוחכם — חפש את הניסוי הקטן ביותר שמבדיל בין hypothesis טובה לבין סיפור יפה.

---

# ‏20 טיפים שהכי חשובים לרובוט שלנו

‏אם צריך לזכור רק קבוצה קטנה, אלה המועמדים הראשונים:

1. ‏מדוד `SignalHalfLife`.
2. ‏מדוד `LatencyPressure`.
3. ‏שמור `time_to_first_profit`.
4. ‏שמור `time_to_target`.
5. ‏מדוד Giveback.
6. ‏שמור Top-N ולא רק Top-1.
7. ‏מדוד `RankGap` ו־`RankAge`.
8. ‏אל תדרג stale data יחד עם fresh.
9. ‏בצע pre-submit revalidation.
10. ‏שמור `SignalTTL`.
11. ‏קבע hard price bounds.
12. ‏חשב spread/slippage/fees לפני Entry.
13. ‏מדוד Fill Probability וגם missed opportunity.
14. ‏חשב pending exposure.
15. ‏תן Exit/Cancel priority.
16. ‏מדוד `TimeToFlat`.
17. ‏מדוד `PostFillMarkout`.
18. ‏מדוד `NetEdgeRetained`.
19. ‏שמור `NO TRADE` כ־decision מלא.
20. ‏השתמש ב־Champion פשוט עד ש־Challenger מוכיח incremental value.

---

# ‏Checklist יומי קצר

‏לפני session:

```text
Data healthy?
Broker reconciled?
Clock healthy?
Correct account/environment?
Risk limits loaded?
No orphan orders?
Scanner fresh?
Execution ready?
```

‏אחרי session:

```text
Top candidates reviewed?
Trades and NO-TRADE reviewed?
Latency anomalies reviewed?
Data gaps reviewed?
Execution anomalies reviewed?
New RCA/tests needed?
Any feature ready for retirement?
Any discovered topic for research?
```

---

# ‏רזי מקצוע שחוזרים לאורך כל 100 הטיפים

- ‏Professionals preserve uncertainty instead of forcing false certainty.
- ‏They separate what happened from why they think it happened.
- ‏They record the state that existed at decision time, not only final outcome.
- ‏They care about opportunity cost, not only filled trades.
- ‏They measure tails, not only averages.
- ‏They distinguish prediction quality from execution quality.
- ‏They assume external systems can timeout after succeeding.
- ‏They treat freshness and data quality as features of the decision.
- ‏They prefer one explainable baseline over ten unproven clever ideas.
- ‏They convert incidents into tests and tests into durable knowledge.

---

# ‏סיכום

‏100 הטיפים אינם 100 “טריקים” שמבטיחים profit.

‏הם מערכת של הרגלים שמקטינה את הסיכוי שנרמה את עצמנו, שנפעיל signal שכבר מת, שנשתמש ב־data שאינו אמין, שנשלח order כפול, שנמדוד metric לא נכון או שנאבד שליטה בזמן failure.

‏עבור הרובוט שלנו, המטרה נשארת פשוטה להגדרה אך קשה לביצוע:

```text
Find a short-lived opportunity
→ prove it exists
→ detect it while fresh
→ rank it correctly
→ verify it is executable
→ enter without destroying the edge
→ exit before the edge decays
→ measure what actually happened
→ learn from every miss
```

‏השלב הבא בקורס הוא שלב 58 — `Order and Execution Subtleties`: שכבה נוספת של פרטי microstructure, order semantics, fills, queues ו־execution behavior שחשוב להכיר מעבר לתיעוד הבסיסי של סוגי הפקודות.
