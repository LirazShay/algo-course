# ‏שלב 41 — `Advanced Broker Algos`: להבין מה הברוקר מנסה לאופטם עבורך

> ‏מטרת הפרק: להבין אלגוריתמי ביצוע מתקדמים של ברוקרים — כגון `Adaptive`, ‏`Arrival Price`, ‏`VWAP`, ‏`TWAP`, ‏`POV` ו־`Accumulate/Distribute` — לא כרשימת כפתורים, אלא כמנועי Execution עם objective, assumptions, trade-offs ומגבלות. המטרה היא לדעת מתי הם רלוונטיים, מתי הם מיותרים, ומתי הם עלולים לפעול נגד ה־Edge של אסטרטגיה קצרה מאוד.
>
> ‏העיקרון המרכזי: **Broker Algo אינו מייצר Alpha. הוא מנסה לבצע Order נתון בצורה טובה יותר לפי objective מסוים. אם ה־objective שלו אינו תואם ל־signal horizon שלנו, הוא יכול לבצע “יפה” ובכל זאת להרוס את העסקה.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. קודם כל: מהו `Broker Algo`

‏`Broker Algo` הוא מנגנון ביצוע שמקבל Parent Order ומחליט כיצד לפרוס, לתזמן, לתמחר או לנתב את הביצוע.

‏הוא נמצא **אחרי** החלטת האסטרטגיה.

```text
Market Data
   ↓
Strategy / Scanner
   ↓
Decision
   ↓
Risk Engine
   ↓
Order Intent
   ↓
Execution Policy
   ↓
Broker Algo / Direct Tactic
   ↓
Venues
```

‏כלומר:

- ‏ה־Scanner מחליט *מה* מעניין.
- ‏ה־Risk Engine מחליט *כמה* מותר.
- ‏ה־Execution Policy מחליטה *איך* לבצע.
- ‏Broker Algo הוא אחת מאפשרויות הביצוע.

# ‏2. `Broker Algo` אינו Strategy

‏אם המניה קיבלה Signal גרוע, `VWAP` לא יהפוך אותה לעסקה טובה.

‏אם Rank #1 כבר איבד מומנטום, `Adaptive` לא מחזיר את ה־Edge.

‏אם ה־signal horizon הוא 10 שניות, אלגוריתם שמפזר Order לאורך דקות או שעות עלול להיות לא מתאים מעצם ההגדרה.

# ‏3. השאלה הראשונה: מהו ה־Objective?

‏לפני בחירת Algo שואלים:

```text
What are we optimizing?
```

‏אפשרויות נפוצות:

- ‏הקטנת Market Impact.
- ‏שיפור מחיר ביחס ל־arrival price.
- ‏מעקב אחרי `VWAP`.
- ‏ביצוע אחיד בזמן (`TWAP`).
- ‏השתתפות באחוז מסוים מה־market volume (`POV`).
- ‏הסתרת footprint.
- ‏איזון בין urgency לבין price improvement.

# ‏4. אין Objective אחד שנכון תמיד

‏אלגוריתם יכול להיות מצוין לפי Benchmark אחד וגרוע לפי Benchmark אחר.

‏לדוגמה:

- ‏טוב מול `VWAP`.
- ‏אבל איטי מדי מול signal של 15 שניות.
- ‏עם slippage נמוך.
- ‏אבל עם missed opportunity גבוה.

# ‏5. `Execution Quality` היא פונקציה רב־ממדית

```text
ExecutionQuality = f(
    price,
    fill_probability,
    time_to_fill,
    market_impact,
    fees,
    adverse_selection,
    opportunity_cost,
    signal_decay
)
```

# ‏6. האלגוריתם של הברוקר לא מכיר בהכרח את ה־Alpha שלנו

‏הוא מכיר Order parameters.

‏הוא לא בהכרח יודע:

- ‏שה־signal נוצר לפני 900ms.
- ‏שה־edge צפוי להיעלם בעוד 4 שניות.
- ‏ש־Rank #2 כבר עקף את Rank #1.
- ‏ש־Score ירד ב־40% מאז ההחלטה.
- ‏ש־NO TRADE עדיף על Fill מאוחר.

# ‏7. לכן צריך `Execution Contract`

‏לפני שימוש ב־Broker Algo מגדירים:

- ‏מה המטרה.
- ‏מהו maximum execution time.
- ‏מהו price cap.
- ‏מתי signal נחשב stale.
- ‏מה עושים עם partial fill.
- ‏האם מותר להמשיך אחרי deadline.
- ‏מה קורה אם האלגוריתם אינו נתמך.

# ‏8. משפחות מרכזיות של Broker Algos

‏נחלק אותן רעיונית ל־6 משפחות:

1. ‏Adaptive / opportunistic.
2. ‏Implementation-shortfall / Arrival Price.
3. ‏Schedule-based כמו `TWAP`.
4. ‏Benchmark-based כמו `VWAP`.
5. ‏Participation-based כמו `POV`.
6. ‏Accumulation / distribution / footprint reduction.

# ‏9. `Adaptive`

‏הרעיון הכללי של `Adaptive` הוא לאזן בין מהירות לבין price improvement.

‏במקום לקבע מראש:

```text
Passive OR Aggressive
```

‏האלגוריתם מנסה להתאים את רמת האגרסיביות לתנאי השוק ול־urgency שנבחרה.

# ‏10. מה IBKR מתעדת כיום לגבי `Adaptive`

‏נכון לבדיקה באוקטובר 2026, IBKR מתעדת `Adaptive` כ־IB Algo שמשלב Smart Routing עם priority/urgency כגון `Patient`, ‏`Normal`, ‏`Urgent`.

‏הזמינות תלויה במכשיר ובממשק, ולכן אין להניח שכל contract תומך בו.

# ‏11. `Patient`

‏מטרתו לתת יותר זמן לחיפוש price improvement.

‏המחיר האפשרי:

- ‏זמן Fill ארוך יותר.
- ‏missed opportunity.
- ‏signal decay.

# ‏12. `Urgent`

‏מעדיף Fill מהיר יותר.

‏המחיר האפשרי:

- ‏פחות price improvement.
- ‏יותר spread capture על ידי הצד השני.
- ‏יותר adverse selection אם נכנסים מאוחר.

# ‏13. `Normal`

‏נקודת אמצע.

‏אבל “אמצע” של הברוקר אינו בהכרח האמצע הנכון ל־Strategy שלנו.

# ‏14. `Adaptive` אינו קסם

‏אין ודאות שהאלגוריתם ישיג מחיר טוב יותר בכל Order.

‏צריך למדוד:

- ‏Fill Rate.
- ‏Time to Fill.
- ‏Slippage.
- ‏Markout.
- ‏Opportunity Cost.
- ‏Net PnL impact.

# ‏15. מתי `Adaptive` יכול להיות רלוונטי

‏בעיקר כאשר:

- ‏ה־spread אינו זניח.
- ‏יש מעט זמן לנסות price improvement.
- ‏ה־order קטן יחסית ל־liquidity.
- ‏אין צורך בשליטה מדויקת בכל child action.

# ‏16. מתי `Adaptive` עלול להיות לא מתאים

‏כאשר:

- ‏ה־signal TTL קצר מאוד.
- ‏אנחנו דורשים deterministic timing.
- ‏אנחנו רוצים queue-aware behavior ספציפי.
- ‏אנחנו צריכים להבין בדיוק למה המחיר השתנה.

# ‏17. `Arrival Price`

‏`Arrival Price` מתייחס למחיר בשוק כאשר ה־Order “הגיע” או נוצר כ־benchmark.

‏הרעיון:

```text
Minimize implementation shortfall
relative to arrival price
```

# ‏18. `Implementation Shortfall`

‏באופן רעיוני:

```text
ImplementationShortfall = ActualExecutionOutcome - DecisionBenchmark
```

‏הסימן המדויק תלוי אם מדובר Buy או Sell.

# ‏19. למה Arrival Price שימושי

‏הוא שואל:

> ‏כמה מהערך שהיה לנו ברגע ההחלטה אבד בגלל execution?

# ‏20. אבל Arrival Price אינו Signal Price

‏צריך להבדיל בין:

- ‏Feature calculation time.
- ‏Decision time.
- ‏Intent creation time.
- ‏Broker submission time.
- ‏Broker arrival time.

# ‏21. `Decision Price` מול `Arrival Price`

‏אם עברו 300ms בין Decision לברוקר, ייתכן שכבר איבדנו Edge לפני שה־Algo התחיל.

# ‏22. Arrival Algo מתאים יותר ל־Orders גדולים יחסית

‏בדרך כלל הוא נועד לאזן:

- ‏market impact.
- ‏timing risk.

‏ככל שמבצעים מהר יותר — impact עלול לגדול.

‏ככל שמחכים יותר — price risk גדל.

# ‏23. זהו Trade-off קלאסי

```text
Too Fast  → Market Impact
Too Slow  → Timing / Opportunity Risk
```

# ‏24. עבור רובוט קצר־טווח

‏אם כל העסקה צפויה להחזיק 10–60 שניות, Algo שמיועד לפריסה ארוכה עשוי להיות mismatch.

# ‏25. `TWAP`

‏`TWAP` = `Time-Weighted Average Price`.

‏הרעיון הבסיסי:

‏לפזר ביצוע לאורך זמן באופן יחסית אחיד.

# ‏26. דוגמה רעיונית ל־TWAP

‏Parent Order:

```text
Buy 1,000 shares over 10 minutes
```

‏אפשר לחשוב על schedule דמיוני:

```text
100 shares each minute
```

‏האלגוריתם האמיתי עשוי להיות מורכב יותר.

# ‏27. TWAP אינו תלוי ישירות ב־market volume

‏זה ההבדל החשוב מול `VWAP` ו־`POV`.

# ‏28. יתרון TWAP

‏פשטות רעיונית.

‏הוא לא צריך לנחש במדויק את פרופיל ה־volume העתידי כדי ליצור schedule.

# ‏29. חסרון TWAP

‏השוק אינו אחיד בזמן.

‏יכול להיות:

- ‏volume גבוה מאוד עכשיו.
- ‏volume נמוך מאוד בעוד דקה.
- ‏spread שמשתנה.
- ‏volatility burst.

# ‏30. TWAP עלול להתעלם מהזדמנות רגעית

‏אם liquidity מצוינת זמינה עכשיו, schedule קשיח מדי עלול לא לנצל אותה.

# ‏31. TWAP עלול להיות צפוי

‏Schedule פשוט מדי יכול ליצור execution pattern שניתן לזהות.

# ‏32. Randomization

‏מערכות execution רבות מוסיפות variation בגודל ובזמן כדי להימנע מדפוס מכני מדי.

# ‏33. TWAP ו־Signal Decay

‏לרובוט שלנו זו נקודה קריטית.

‏אם ה־signal half-life הוא 8 שניות, TWAP של 5 דקות אינו “ביצוע זהיר”.

‏הוא פשוט מבצע signal שכבר אינו קיים.

# ‏34. `VWAP`

‏`VWAP` = `Volume-Weighted Average Price`.

‏הרעיון:

‏להתאים את קצב הביצוע לפרופיל volume בשוק ולנסות להשיג execution ביחס ל־VWAP benchmark.

# ‏35. נוסחת VWAP בסיסית

```text
VWAP = Σ(Price_i × Volume_i) / Σ(Volume_i)
```

# ‏36. Broker VWAP Algo אינו רק חישוב VWAP

‏הוא execution strategy.

‏הוא מנסה להחליט **מתי וכמה** לבצע כדי להתאים לפרופיל ה־volume.

# ‏37. הבעיה: Volume Profile אינו ידוע מראש

‏העתיד אינו ידוע.

‏לכן אלגוריתם VWAP משתמש בהערכות, פרופילים היסטוריים ועדכונים בזמן אמת.

# ‏38. Forecast Error

‏אם היום אינו דומה ליום טיפוסי:

- ‏News.
- ‏market shock.
- ‏halt/reopen.
- ‏unusual volume.

‏פרופיל ה־volume יכול לסטות מאוד.

# ‏39. VWAP מתאים בעיקר ל־Execution Benchmarking

‏הוא נפוץ כאשר רוצים לבצע Position משמעותי תוך ניסיון לא לסטות בצורה חריגה מזרימת השוק.

# ‏40. VWAP פחות טבעי ל־ultra-short signal

‏אם המטרה היא לתפוס movement של 20 שניות, benchmark של session volume אינו בהכרח רלוונטי.

# ‏41. `POV`

‏`POV` = `Percentage of Volume`.

‏נקרא גם `Participation Rate` strategy.

# ‏42. הרעיון

‏לבצע בקצב שמייצג אחוז מסוים מה־volume בשוק.

```text
TargetParticipation = OurExecutedVolume / MarketVolume
```

# ‏43. דוגמה

‏אם target participation הוא 5%:

‏ועל פני חלון מסוים נסחרו 20,000 מניות בשוק,

‏האלגוריתם עשוי לכוון לכ־1,000 מניות שלנו באותה תקופה.

# ‏44. POV הוא Reactive

‏כאשר השוק פעיל יותר — הקצב עולה.

‏כאשר השוק שקט — הקצב יורד.

# ‏45. יתרון POV

‏הוא מתאים את עצמו לפעילות אמיתית יותר מאשר schedule זמן קשיח.

# ‏46. חסרון POV

‏ב־volume spike הוא עלול להאיץ בדיוק בזמן שבו השוק תנודתי מאוד.

# ‏47. POV ו־Impact

‏Participation גבוה מדי עלול להפוך אותנו לחלק משמעותי מהזרימה.

‏אז אנחנו כבר לא “רוכבים על השוק”.

‏אנחנו משפיעים עליו.

# ‏48. POV ו־Capacity

‏כאן מופיע מושג חשוב:

```text
Strategy Capacity
```

‏כמה Capital אפשר להפעיל לפני שהביצוע עצמו משנה מהותית את התוצאה.

# ‏49. `Accumulate/Distribute`

‏הרעיון:

‏לבנות או לפרק Position גדול באמצעות סדרה של Orders קטנים יותר.

# ‏50. מטרות אופייניות

- ‏להקטין footprint גלוי.
- ‏להקטין market impact.
- ‏לפרוס execution לאורך זמן.
- ‏להימנע מחשיפת הכמות הכוללת.

# ‏51. Random Size

‏במקום:

```text
100, 100, 100, 100
```

‏ייתכן שימוש בגודלי child orders משתנים.

# ‏52. Random Time

‏במקום interval קשיח, אפשר לשנות גם timing.

# ‏53. למה זה רלוונטי בעיקר ל־Orders גדולים

‏כאשר Order קטן מאוד ביחס ל־liquidity, אין בהכרח footprint משמעותי להסתיר.

# ‏54. Overengineering

‏אסור להשתמש ב־Algo מתוחכם רק כי הוא קיים.

‏כל שכבת intelligence נוספת יוצרת:

- ‏יותר parameters.
- ‏יותר failure modes.
- ‏יותר attribution ambiguity.
- ‏יותר קושי ב־backtest.

# ‏55. Parent Order מול Child Orders

‏Broker Algo בדרך כלל מקבל Parent Intent.

‏הוא עשוי ליצור או לנהל Child executions מתחתיו.

# ‏56. המשמעות ל־State Machine

‏המערכת שלנו לא יכולה להניח:

```text
One Intent = One Exchange Order
```

# ‏57. Parent State

‏צריך לעקוב אחרי:

- ‏requested quantity.
- ‏filled quantity.
- ‏remaining quantity.
- ‏average fill price.
- ‏algo status.
- ‏deadline.

# ‏58. Child Visibility

‏לא כל ברוקר חושף באותה רמה את הפעולות הפנימיות של ה־Algo.

# ‏59. Black Box Risk

‏ככל שה־Algo פחות שקוף, קשה יותר לענות:

> ‏למה קיבלנו Fill דווקא עכשיו ובמחיר הזה?

# ‏60. ולכן שומרים Raw Broker Evidence

‏כל callback/status/error שניתן לשמור — נשמר יחד עם normalized event.

# ‏61. Algo Parameters הם חלק מ־Strategy Versioning

‏אם שינינו:

```text
Adaptive: Normal → Urgent
```

‏זו אינה “הגדרת UI”.

‏זו גרסת Execution Policy חדשה.

# ‏62. `ExecutionPolicyVersion`

‏כל trade צריך לדעת באיזו גרסה בוצע.

# ‏63. Capability Discovery

‏אסור להניח שכל Algo נתמך בכל instrument.

# ‏64. Capability Matrix

‏לדוגמה:

| Capability | Supported? |
|---|---:|
| `Adaptive` | runtime discovery |
| `ArrivalPx` | runtime discovery |
| `VWAP` | runtime discovery |
| `TWAP` | runtime discovery |
| `POV` | runtime discovery |
| `Accumulate/Distribute` | interface-specific |

# ‏65. כלל

‏**Capability היא Fact בזמן נתון, לא assumption בקוד.**

# ‏66. IBKR Web API כדוגמה

‏נכון לאוקטובר 2026, IBKR מתעדת endpoint שמחזיר את ה־algos הנתמכים ל־contract מסוים.

‏הוא כולל בדוגמה שמות כגון:

- ‏`Adaptive`.
- ‏`Arrival Price`.
- ‏`DarkIce`.
- ‏`Percentage of Volume`.
- ‏`TWAP`.
- ‏`VWAP`.

# ‏67. המשמעות הארכיטקטונית

‏ב־startup או instrument-resolution אפשר לבנות:

```text
BrokerAlgoCapabilities
```

# ‏68. Preflight

‏לפני Order:

```text
Requested Algo
    ↓
Capability Check
    ↓
Parameter Validation
    ↓
Risk Recheck
    ↓
Submit
```

# ‏69. Fallback אסור להיות שקט

‏אם `VWAP` אינו נתמך, אסור פשוט להפוך את ה־Order ל־Market.

# ‏70. Fallback חייב להיות Explicit

‏אפשרויות:

- ‏Reject Intent.
- ‏Use configured fallback.
- ‏Switch to simpler tactic.
- ‏Return `NO_TRADE`.

# ‏71. Broker Algo Failure Modes

‏ה־Algo יכול:

- ‏להידחות.
- ‏להיתקע ללא Fill.
- ‏להתמלא חלקית.
- ‏להיות cancelled.
- ‏להגיע ל־end time.
- ‏להפוך stale ביחס ל־signal.

# ‏72. `End Time` אינו TIF רגיל בלבד

‏בחלק מה־algos יש schedule משל עצמם.

‏צריך לדעת מי גובר:

- ‏TIF.
- ‏Algo end time.
- ‏strategy deadline.

# ‏73. Strategy Deadline הוא שלנו

‏גם אם הברוקר מוכן להמשיך, ה־Strategy יכולה להחליט שה־Edge מת.

# ‏74. `Algo Deadline`

‏אנחנו צריכים לתעד:

```text
decision_deadline
execution_deadline
broker_algo_end_time
```

# ‏75. Deadline Conflict

‏אם הברוקר מתכנן לסיים בעוד 5 דקות וה־signal expires בעוד 8 שניות — זו אי־התאמה.

# ‏76. Canceling Broker Algo

‏Cancel הוא asynchronous.

‏גם כאן:

```text
Cancel requested != Cancelled
```

# ‏77. Late Fill

‏Fill יכול להגיע אחרי ששלחנו Cancel.

# ‏78. Partial Fill בזמן Cancel

‏זה תרחיש חובה בבדיקות.

# ‏79. Modify Algo

‏שינוי parameter קיים עשוי:

- ‏להיות modification.
- ‏להיות cancel/replace.
- ‏לא להיות נתמך בכלל.

‏המשמעות תלויה בברוקר.

# ‏80. Modification Semantics

‏לעולם לא מניחים ששינוי parameter שומר priority או state פנימי.

# ‏81. Broker Algo ו־Queue Position

‏אם האלגוריתם מבטל ומחליף Orders פנימיים, queue position עשוי להשתנות.

# ‏82. Broker Algo ו־Routing

‏חלק מה־algos משולבים ב־Smart Routing.

‏לכן אי אפשר לנתח Algo בלי לנתח גם routing behavior.

# ‏83. Broker Algo ו־Hidden Liquidity

‏Algo יכול לנסות venues או liquidity שלא נראים לנו ב־L1.

# ‏84. Backtest Problem

‏איך מדמים Algo proprietary?

‏בדרך כלל — לא באמת יודעים.

# ‏85. לכן לא ממציאים Simulator “מדויק”

‏במקום זאת בונים מודל Empirical.

# ‏86. Empirical Algo Model

‏לומדים מ־live/paper observations:

- ‏time-to-fill distribution.
- ‏slippage distribution.
- ‏fill probability.
- ‏partial-fill behavior.
- ‏markout.

# ‏87. Model by Context

‏מפלחים לפי:

- ‏symbol liquidity.
- ‏spread.
- ‏volatility.
- ‏time of day.
- ‏order size.
- ‏urgency.

# ‏88. Replay Fidelity

‏ב־Replay אפשר להגדיר:

```text
BrokerAlgoModel = ConservativeEmpiricalModel
```

# ‏89. לא צריך להעמיד פנים שאנחנו משחזרים Proprietary Logic

‏מספיק למדוד Input→Outcome בצורה שמרנית.

# ‏90. `Paper` אינו Calibration מושלם

‏Paper execution עשוי להיות שונה מ־Live.

# ‏91. לכן Calibration Ladder

```text
Historical Model
→ Replay
→ Paper
→ Shadow
→ Small Live Evidence
```

# ‏92. `Adaptive` לעומת Manual Marketable Limit

‏זו השוואה חשובה במיוחד לרובוט שלנו.

# ‏93. Baseline פשוט

‏למשל:

```text
Marketable Limit with explicit price cap
```

# ‏94. Challenger

```text
Adaptive Normal
```

# ‏95. Primary Metric

‏לא “מי קיבל מחיר יותר טוב”.

‏אלא:

```text
Net Outcome after fill probability and timing
```

# ‏96. Decision Impact

‏צריך לבדוק רק trades שבהם שתי הטקטיקות היו מתנהגות אחרת.

# ‏97. `Fill Rate` לבדו מטעה

‏100% fills יכולים להיות גרועים אם תמיד רדפנו אחרי המחיר.

# ‏98. `Price Improvement` לבדו מטעה

‏מחיר יפה על 20% מה־signals, כאשר 80% מפוספסים, יכול להיות גרוע.

# ‏99. `Time to Fill`

‏במערכת קצרה זה metric מרכזי.

# ‏100. `Time to First Fill`

‏חשוב במיוחד ב־partial execution.

# ‏101. `Time to Complete Fill`

‏יכול להיות פחות רלוונטי אם ה־Strategy מוכנה לעבוד עם partial position.

# ‏102. `Fill Ratio`

```text
FillRatio = FilledQty / RequestedQty
```

# ‏103. `Opportunity Cost`

‏מה קרה למחיר אחרי Order שלא התמלא?

# ‏104. `Adverse Selection`

‏מה קרה למחיר מיד אחרי שכן התמלאנו?

# ‏105. `Markout`

‏מודדים לאחר:

- ‏1s.
- ‏2s.
- ‏5s.
- ‏10s.
- ‏30s.
- ‏60s.

# ‏106. Algo Scorecard

‏לכל Execution Algo:

```text
fill_rate
partial_fill_rate
time_to_first_fill
time_to_full_fill
slippage
price_improvement
markout
missed_opportunity
net_edge_retained
```

# ‏107. `Net Edge Retained`

‏רעיון שימושי:

```text
NetEdgeRetained = NetOutcome / ExpectedEdgeAtDecision
```

# ‏108. Signal Decay Attribution

‏אם ה־signal מת לפני Fill, צריך להפריד:

- ‏Prediction failure.
- ‏Execution too slow.

# ‏109. `Arrival Price` ו־Implementation Shortfall

‏כאן metric טבעי הוא execution ביחס למחיר בזמן arrival/decision.

# ‏110. `VWAP` ו־Benchmark Error

‏כאן metric טבעי הוא deviation מ־VWAP benchmark.

# ‏111. `TWAP` ו־Schedule Adherence

‏בודקים:

- ‏כמה התקדמנו מול schedule.
- ‏כמה deviation נוצר.

# ‏112. `POV` ו־Participation Error

```text
ParticipationError = ActualParticipation - TargetParticipation
```

# ‏113. `Accumulate/Distribute` ו־Footprint

‏קשה למדוד footprint ישירות.

‏אפשר להשתמש בפרוקסים:

- ‏market impact.
- ‏price drift during execution.
- ‏visible size patterns.

# ‏114. Algo Parameters צריכים Guardrails

‏אסור לאפשר כל ערך רק כי ה־API מקבל אותו.

# ‏115. Parameter Schema

‏לכל Algo:

- ‏type.
- ‏range.
- ‏default.
- ‏required/optional.
- ‏compatibility.

# ‏116. Parameter Validation

‏עושים validation **לפני** broker submit.

# ‏117. Runtime Broker Validation עדיין נדרש

‏Local validation אינו מחליף broker validation.

# ‏118. Parameter Provenance

‏לכל Order שומרים:

```text
algo_name
algo_params
execution_policy_version
broker_capability_version
```

# ‏119. Default Parameters הם Decision

‏גם “לא שיניתי כלום” הוא config.

# ‏120. Defaults יכולים להשתנות

‏לכן Production config צריך להיות explicit ככל האפשר.

# ‏121. `AlgoIntent`

‏מודל אפשרי:

```text
AlgoIntent
├─ Objective
├─ Urgency
├─ Deadline
├─ MaxPriceImpact
├─ ParticipationTarget?
├─ Benchmark?
└─ FallbackPolicy
```

# ‏122. Provider-specific Mapping

‏ה־Domain לא צריך להחזיק string כמו:

```text
"ArrivalPx"
```

‏אלא semantic intent.

# ‏123. Adapter Translation

```text
ExecutionObjective.MinimizeImplementationShortfall
    ↓
IBKR ArrivalPx
```

# ‏124. למה זה עדיף

‏אם עוברים לברוקר אחר, ה־Strategy לא משתנה.

# ‏125. אבל לא כל Broker Algo שקול

‏אסור ליצור abstraction מזויף.

# ‏126. Semantic Capability

‏צריך לדעת:

```text
supports_arrival_price_style_execution
```

‏ולא רק שם מוצר.

# ‏127. `Native` מול `Synthetic`

‏אם הברוקר לא תומך Algo מסוים, אפשר לפעמים ליישם אותו אצלנו.

# ‏128. אבל Synthetic Algo מוסיף אחריות

‏אנחנו צריכים לנהל:

- ‏timers.
- ‏child orders.
- ‏cancel/replace.
- ‏recovery.
- ‏restart.
- ‏partial fills.

# ‏129. Native Algo יתרון

‏חלק מהלוגיקה רצה אצל הברוקר.

# ‏130. Native Algo חסרון

‏פחות שקיפות ושליטה.

# ‏131. Synthetic Algo יתרון

‏שליטה מלאה ו־replayability גבוהה יותר.

# ‏132. Synthetic Algo חסרון

‏יותר operational risk.

# ‏133. Question

‏מי צריך לנהל algo קצר־טווח שלנו?

‏ברוב המקרים נרצה baseline פשוט אצלנו ורק אחר כך broker algo כ־challenger.

# ‏134. למה?

‏כי האסטרטגיה שלנו רגישה מאוד לזמן.

# ‏135. Ultra-short Robot Objective

‏המטרה היא לא לבצע 100,000 shares “יפה” לאורך יום.

‏המטרה היא לשמר Edge שחי שניות.

# ‏136. לכן Time Horizon קודם ל־Algo Name

‏לפני בחירה:

```text
Signal Half-Life?
Execution Deadline?
Typical Spread?
Typical Size / Depth?
```

# ‏137. אם Position קטן מאוד

‏`VWAP`, ‏`TWAP`, ‏`POV` עלולים להיות overkill.

# ‏138. אם Capital גדל בעתיד

‏אותם Algos עשויים להפוך רלוונטיים יותר.

# ‏139. `Capacity Transition`

‏Execution policy צריכה להשתנות כאשר:

```text
OrderSize / AvailableLiquidity
```

‏גדל משמעותית.

# ‏140. `Participation Ratio`

‏Feature חשוב:

```text
RequestedQty / RecentMarketVolume
```

# ‏141. אם היחס זניח

‏impact-minimization מורכב פחות חשוב.

# ‏142. אם היחס גבוה

‏Broker Algo עשוי לקבל ערך גדול יותר.

# ‏143. `Order Size / Top Depth`

‏מדד נוסף.

# ‏144. `Order Size / 1m Volume`

‏מדד נוסף.

# ‏145. Decision Gate

‏אפשר להחליט:

```text
if size_is_small:
    simple_execution
else:
    consider_broker_algo
```

# ‏146. אבל לא Hardcode בלי Evidence

‏ה־threshold נמדד אמפירית.

# ‏147. Algo Selection Engine

‏בעתיד אפשר לבנות:

```text
ExecutionPolicySelector
```

# ‏148. Inputs

- ‏Signal strength.
- ‏Signal TTL.
- ‏Spread.
- ‏Depth.
- ‏Volatility.
- ‏Order size.
- ‏Market activity.
- ‏Regime.
- ‏Broker capabilities.

# ‏149. Output

```text
ExecutionTactic
```

# ‏150. KISS קודם

‏לא מתחילים ב־ML לבחירת Algo.

# ‏151. Baseline Rules קודם

‏למשל:

- ‏short TTL → simple aggressive protected tactic.
- ‏longer TTL + wider spread → Adaptive challenger.
- ‏large participation → investigate POV/VWAP.

# ‏152. `NO TRADE` נשאר אפשרות

‏אם execution cost צפוי למחוק את ה־Edge — לא מבצעים.

# ‏153. Broker Algo אינו פטור מ־Risk Engine

‏כל Parent Order עובר risk approval.

# ‏154. Pending Exposure

‏גם quantity שעדיין לא התמלאה היא התחייבות פוטנציאלית.

# ‏155. Child Orders ו־Risk

‏אם Broker Algo מפצל פנימית, אנחנו עדיין צריכים למנוע total exposure חריג.

# ‏156. Position Truth

‏נבנית מ־fills בפועל, לא מה־schedule המתוכנן.

# ‏157. Broker Algo ו־Kill Switch

‏`EXIT_ONLY` חייב לדעת כיצד לבטל Parent Algo פעיל.

# ‏158. `CANCEL_ALL`

‏צריך לוודא אם הוא מבטל גם algo parents וגם child orders.

# ‏159. Recovery אחרי Crash

‏ב־startup צריך לגלות:

- ‏Parent algo orders פעילים.
- ‏fills שהתרחשו בזמן שהיינו offline.
- ‏remaining quantity.

# ‏160. Reconciliation Mandatory

‏לא משחזרים Algo state מהזיכרון בלבד.

# ‏161. Unknown Algo State

‏אם איננו יודעים אם Parent Order עדיין פעיל:

```text
RECOVERING / EXIT_ONLY
```

# ‏162. Resume

‏רק אחרי broker reconciliation.

# ‏163. Algo Orders ו־Observability

‏לכל Algo צריך dashboard metrics.

# ‏164. Metrics בסיסיים

- ‏active algo parents.
- ‏remaining quantity.
- ‏age.
- ‏time to deadline.
- ‏fill ratio.
- ‏slippage.

# ‏165. Alert

‏Algo Order מעבר ל־expected duration.

# ‏166. Alert

‏No fill למרות market activity גבוהה.

# ‏167. Alert

‏Partial fill + signal expired.

# ‏168. Alert

‏Algo active בזמן system `EXIT_ONLY`.

# ‏169. Decision Trace

‏צריך לענות:

> ‏למה נבחר `Adaptive Normal` ולא marketable limit?

# ‏170. תשובה טובה כוללת

- ‏spread.
- ‏signal TTL.
- ‏order size.
- ‏expected edge.
- ‏capabilities.
- ‏policy version.

# ‏171. `AlgoRcaPacket`

‏לאירוע כושל שומרים:

```text
Decision Snapshot
Execution Intent
Algo Params
Broker Events
Fills
Market Context
Markout
Counterfactual Baseline
```

# ‏172. Failed Algo אינו בהכרח Algo גרוע

‏עסקה אחת היא Sample אחד.

# ‏173. Successful Algo אינו הוכחה

‏גם execution מוצלח יכול להיות luck.

# ‏174. Evaluate Distribution

‏מסתכלים על התפלגויות.

# ‏175. Segment by Spread

‏Adaptive יכול לעבוד אחרת ב־1 tick מול spread רחב.

# ‏176. Segment by Liquidity

‏Large cap מול thin stock.

# ‏177. Segment by Volatility

‏Market calm מול burst.

# ‏178. Segment by Time of Day

‏Open מול midday מול close.

# ‏179. Segment by Signal Horizon

‏5s signal שונה מ־60s signal.

# ‏180. `Broker Algo Drift`

‏התנהגות יכולה להשתנות עקב:

- ‏broker changes.
- ‏routing changes.
- ‏venue changes.
- ‏market structure changes.

# ‏181. לכן Version/Date Matters

‏לא מניחים שתוצאות 2026 זהות ל־2027.

# ‏182. Champion/Challenger

‏Baseline execution נשאר Champion.

‏Algo חדש נכנס כ־Challenger.

# ‏183. Shadow Comparison

‏כאשר אפשר, מתעדים מה האלטרנטיבה הייתה עושה בלי לשלוח capital נוסף.

# ‏184. Counterfactual Limit

‏אי אפשר לדעת בדיוק איך השוק היה מגיב אם היינו שולחים Order אחר.

# ‏185. לכן Counterfactual Confidence

‏מתעדים רמת confidence.

# ‏186. Controlled Experiment

‏משנים Algo אחד בלבד בכל ניסוי.

# ‏187. לא משנים יחד

‏לא:

```text
algo + size + universe + exit + score
```

‏באותו experiment.

# ‏188. Primary Metric מראש

‏למשל:

```text
Net Edge Retained @ 10s
```

# ‏189. Guardrails

- ‏Reject rate.
- ‏Unknown state rate.
- ‏P99 time-to-fill.
- ‏worst slippage.
- ‏partial-fill tail.

# ‏190. Promotion

‏Algo Challenger מתקדם רק אם:

- ‏התועלת עקבית.
- ‏אין tail-risk חדש משמעותי.
- ‏התפעול אמין.
- ‏התוצאה שורדת OOS.

# ‏191. Rollback

‏צריך להיות מיידי ופשוט.

# ‏192. Broker-specific Names אינם Domain Model

‏הקורס משתמש ב־IBKR כדוגמה, אך הארכיטקטורה נשארת provider-agnostic.

# ‏193. Interface אפשרי

```csharp
public interface IExecutionAlgorithmCapability
{
    string SemanticName { get; }
    bool IsSupported(Instrument instrument);
}
```

# ‏194. Intent אפשרי

```csharp
public sealed record ExecutionAlgoIntent(
    ExecutionObjective Objective,
    TimeSpan Deadline,
    decimal? MaxParticipation,
    ExecutionUrgency Urgency,
    decimal? LimitPrice);
```

# ‏195. אין provider strings ב־Strategy

‏ה־Strategy לא צריכה לדעת `ArrivalPx` או `PctVol`.

# ‏196. Mapping ב־Adapter

```text
Semantic Intent
      ↓
Broker Adapter
      ↓
Provider-specific Algo + Params
```

# ‏197. Capability Snapshot

‏נשמר יחד עם Run Manifest.

# ‏198. למה?

‏כדי שנוכל להסביר בעתיד למה Order מסוים קיבל fallback.

# ‏199. Algo Catalog

‏שכבת metadata יכולה להכיל:

- ‏semantic objective.
- ‏provider name.
- ‏supported assets.
- ‏parameter schema.
- ‏known restrictions.
- ‏last verified date.

# ‏200. Current-Fact Boundary

‏כל פרט מסחרי/ברוקר־ספציפי מסומן כ־time-sensitive.

# ‏201. IBKR Note — אוקטובר 2026

‏התיעוד הרשמי הנוכחי מציג ב־Web API יכולת query ל־supported algos לפי `conid`, עם דוגמאות הכוללות `Adaptive`, ‏`ArrivalPx`, ‏`ClosePx`, ‏`DarkIce`, ‏`PctVol` variants, ‏`Twap` ו־`Vwap`.

# ‏202. TWS API Note

‏ב־Order reference של TWS API מתועדים `algoStrategy`/`algoParams`, עם אסטרטגיות כגון `ArrivalPx`, ‏`DarkIce`, ‏`PctVol`, ‏`Twap`, ‏`Vwap`.

# ‏203. `Accumulate/Distribute` Note

‏IBKR מציגה כיום `Accumulate/Distribute` בכלי TWS/Traders' Academy, אך אין להסיק מכך אוטומטית שכל interface/API חושף אותו באותה צורה.

# ‏204. מסקנה

‏**UI availability != API availability != instrument availability.**

# ‏205. Runtime Discovery עדיף

‏אם API מספק capability endpoint — משתמשים בו.

# ‏206. אם אין Discovery

‏שומרים capability matrix versioned ומאומתת.

# ‏207. אלגוריתם לא מוכר

‏אסור לשלוח “ולראות מה יקרה”.

# ‏208. Fail Explicitly

```text
UNSUPPORTED_EXECUTION_ALGO
```

# ‏209. Algo Reject הוא Evidence

‏שומרים raw code/message.

# ‏210. אבל Reject לא בהכרח Strategy Failure

‏זה execution/capability failure.

# ‏211. Attribution חשוב

‏אחרת Scanner מקבל blame על בעיית Broker.

# ‏212. Checklist לפני Broker Algo חדש

- ‏מה ה־objective?
- ‏מה ה־benchmark?
- ‏מה ה־deadline?
- ‏מה ה־fallback?
- ‏איזה capability נדרש?
- ‏איך מבטלים?
- ‏איך עושים recovery?
- ‏מה מודדים?

# ‏213. Checklist ל־Backtest

- ‏האם יש לנו מודל empirical?
- ‏האם אנחנו מסמנים uncertainty?
- ‏האם יש optimistic/base/conservative scenarios?
- ‏האם signal decay נכלל?

# ‏214. Checklist ל־Paper

- ‏Reject handling.
- ‏Partial fills.
- ‏Cancel.
- ‏Deadline.
- ‏Restart.
- ‏Reconciliation.

# ‏215. Checklist ל־Live Canary

- ‏Size קטן ומוגבל.
- ‏Observability מלאה.
- ‏Kill switch.
- ‏Baseline comparison.
- ‏Post-trade review.

# ‏216. מה לא לעשות

‏לא לבחור Algo לפי שם שנשמע “חכם”.

# ‏217. מה לא לעשות

‏לא להניח ש־VWAP תמיד טוב כי הוא מוסדי.

# ‏218. מה לא לעשות

‏לא להשתמש ב־POV בלי להבין participation ביחס לנזילות.

# ‏219. מה לא לעשות

‏לא להניח ש־Adaptive תמיד משפר מחיר.

# ‏220. מה לא לעשות

‏לא לפרוס signal קצר לאורך זמן רק כדי להקטין slippage.

# ‏221. מה לא לעשות

‏לא לערבב Broker Algo logic בתוך Scanner.

# ‏222. מה לא לעשות

‏לא להסתיר fallback אוטומטי.

# ‏223. מה לא לעשות

‏לא להשוות רק average fill price.

# ‏224. Tail Matters

‏P99 של time-to-fill יכול להרוס Strategy גם אם average מצוין.

# ‏225. Worst Cases

‏בודקים:

- ‏No Fill.
- ‏Late Fill.
- ‏Partial Fill.
- ‏Fill after cancel.
- ‏Algo reject.
- ‏Broker disconnect.

# ‏226. `Algo Execution Budget`

‏מגדירים budget:

```text
MaxExecutionTime
MaxSlippage
MaxSpreadCost
MaxOpportunityCostProxy
```

# ‏227. Budget Exhausted

‏אם budget נגמר:

- ‏Cancel.
- ‏Escalate tactic.
- ‏Accept partial.
- ‏NO TRADE / abort remainder.

# ‏228. Escalation אינו תמיד נכון

‏אם edge כבר מת — לא “מצילים” את ה־Order על ידי Chase.

# ‏229. Sunk Cost Fallacy

‏העובדה שחיכינו 4 שניות אינה סיבה להמשיך לחכות עוד 4.

# ‏230. Remaining Edge

‏ההחלטה תמיד לפי העתיד:

```text
ExpectedRemainingEdge
```

# ‏231. Parent Algo ו־Exit

‏אם Entry Algo עדיין עובד וה־Strategy כבר רוצה Exit, צריך policy מפורשת.

# ‏232. בדרך כלל

‏קודם מונעים exposure חדש.

# ‏233. ואז

‏מנהלים Position אמיתי לפי broker-confirmed fills.

# ‏234. Pending Entry בזמן Exit Signal

‏זה תרחיש acceptance test חובה.

# ‏235. Algo + Risk Reservation

‏Risk Engine שומר reservation לכמות שעדיין יכולה להתמלא.

# ‏236. Cancel Confirmation

‏רק אחרי cancel confirmed אפשר לשחרר reservation באופן מלא.

# ‏237. Recovery Reservation

‏אם order state `UNKNOWN`, reservation נשאר שמרני.

# ‏238. Broker Algo ו־Multi-Account

‏לא מניחים behavior זהה בכל account/config.

# ‏239. Environment Separation

‏`PAPER` ו־`LIVE` יכולים להציג יכולות או behavior שונים.

# ‏240. Run Manifest

‏שומרים environment במפורש.

# ‏241. Baseline מומלץ למחקר שלנו

‏לרובוט קצר־הטווח:

1. ‏Simple protected marketable limit כ־baseline.
2. ‏Adaptive כ־challenger אפשרי.
3. ‏`TWAP/VWAP/POV` נשמרים בעיקר למחקר capacity/size עתידי.
4. ‏`Accumulate/Distribute` אינו baseline ל־small fast entries.

# ‏242. למה זה KISS

‏אנחנו לא מוסיפים complex execution לפני שיש בעיה אמיתית שהוא פותר.

# ‏243. Trigger להוסיף Algo מתקדם

‏צריך evidence כגון:

- ‏market impact עולה.
- ‏order size כבר משמעותי ביחס ל־volume.
- ‏simple execution מאבד edge באופן שיטתי.

# ‏244. Experimental Question טוב

> ‏האם `Adaptive Normal` משמר יותר Net Edge מ־marketable limit עבור signals עם spread של 2–5 ticks ו־TTL של לפחות 15 שניות?

# ‏245. Experimental Question גרוע

> ‏איזה Algo הכי טוב?

# ‏246. למה?

‏אין “הכי טוב” ללא context.

# ‏247. Algo Selection הוא Contextual

‏אותו Algo יכול להיות טוב בקבוצה אחת ורע באחרת.

# ‏248. Keep the Baseline

‏גם אחרי promotion, baseline נשמר למדידה.

# ‏249. Continuous Monitoring

‏אם היתרון נעלם — חוזרים אחורה.

# ‏250. Final Architecture

```text
Scanner
  ↓
Decision
  ↓
Risk Engine
  ↓
Execution Intent
  ↓
Execution Policy Selector
  ├─ Simple Passive
  ├─ Marketable Limit
  ├─ Adaptive
  ├─ Arrival-style
  ├─ TWAP
  ├─ VWAP
  ├─ POV
  └─ NO TRADE
  ↓
Broker Capability Check
  ↓
Broker Adapter
  ↓
Broker / Venues
```

# ‏251. Invariant

‏Broker Algo לעולם אינו עוקף Risk Engine.

# ‏252. Invariant

‏Broker Algo לעולם אינו מאריך signal מעבר ל־Strategy deadline בלי authorization מפורש.

# ‏253. Invariant

‏Fallback לעולם אינו שקט.

# ‏254. Invariant

‏Order state `UNKNOWN` לעולם אינו מטופל כ־cancelled.

# ‏255. Invariant

‏Partial Fill תמיד משפיע מיד על Position Truth ו־Risk.

# ‏256. Invariant

‏כל Algo execution ניתן לשייך ל־Decision, ‏Intent, ‏Policy Version ו־Broker Events.

# ‏257. Invariant

‏אין promotion ל־Live על סמך Paper בלבד.

# ‏258. שאלות ידע

1. ‏למה Broker Algo אינו Alpha?
2. ‏מה ההבדל בין `TWAP`, ‏`VWAP` ו־`POV`?
3. ‏מה Arrival Price מנסה למדוד?
4. ‏למה Adaptive עלול להיות איטי מדי ל־signal קצר?
5. ‏למה לא ניתן Backtest מדויק ל־Algo proprietary?
6. ‏מה ההבדל בין Native Algo ל־Synthetic Algo?
7. ‏למה capability discovery חשובה?
8. ‏למה fallback שקט מסוכן?
9. ‏איזה metrics נדרשים מעבר ל־fill price?
10. ‏מתי Broker Algo מתקדם הוא overengineering?

# ‏259. Checklist לזכור בעל פה

- ‏`Algo != Alpha`.
- ‏`Objective first`.
- ‏`Signal TTL before Algo sophistication`.
- ‏`Capability is runtime truth`.
- ‏`Fallback must be explicit`.
- ‏`Partial fill is real position`.
- ‏`Cancel requested != cancelled`.
- ‏`Paper != Live`.
- ‏`Measure net outcome, not pretty fills`.
- ‏`Simple baseline first`.

# ‏260. מסקנת הפרק

‏Broker Algos הם כלי Execution מתקדמים, לא קיצור דרך ל־Edge.

‏הם מועילים כאשר ה־objective שלהם תואם לבעיה האמיתית שלנו — למשל impact, participation, benchmark או urgency — ורק כאשר המדידה מוכיחה שהם משמרים יותר מה־Edge לאחר כל העלויות והזמן.

‏לרובוט קצר־הטווח שלנו, ברירת המחדל המחקרית צריכה להישאר פשוטה, מדידה ושקופה. `Adaptive` יכול להיות Challenger טבעי; `TWAP`, ‏`VWAP`, ‏`POV` ו־`Accumulate/Distribute` חשובים להבנה מקצועית ולשלבים שבהם size/capacity יהפכו לבעיה אמיתית.

---

## ‏מקורות עדכניים שנבדקו לפרק

‏פרטי IBKR הבאים נבדקו באוקטובר 2026 מול התיעוד הרשמי:

- ‏IBKR Web API — `Search Algos For An Instrument`: רשימת algos נתמכים לפי `conid`.
- ‏IBKR TWS API — `Order` reference: `algoStrategy` ו־`algoParams`.
- ‏IBKR Campus — `Adaptive`.
- ‏IBKR Campus — `Time-Weighted Average Price (TWAP)`.
- ‏IBKR Campus — `Percentage of Volume`.
- ‏IBKR Traders' Academy — `Accumulate/Distribute` ו־TWS Algos.

‏היכולות והפרמטרים הם facts תלויי זמן ו־instrument. לפני Production יש לבצע capability discovery או אימות מחודש מול התיעוד והחשבון הפעיל.

---

## ‏מעבר לשלב הבא

‏השלב הבא בקורס הוא **42 — `Opening/Closing Auctions` ו־Auction Order Types**: איך פועלים מכרזי פתיחה וסגירה, imbalance, ‏MOO/MOC/LOO/LOC, cutoff times, price discovery, ולמה התנהגות השוק סביב auction שונה מהמסחר הרציף.
