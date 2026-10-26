# ‏שלב 61 — `Backtest Subtleties`: איך Backtest משכנע יכול עדיין לשקר

> ‏מטרת הפרק: להבין לעומק את המקומות שבהם Backtest של אסטרטגיה קצרה נראה מדויק, עקבי ורווחי — אבל בפועל נשען על הנחות שלא היו ניתנות למימוש בזמן אמת. נלמד לזהות hidden look-ahead, fill fantasy, path dependence, latency coupling, queue bias, selection effects, regime leakage ו־backtest-to-live gap.
>
> ‏העיקרון המרכזי: **Backtest מקצועי אינו מחשבון PnL על מחירים היסטוריים. הוא סימולטור של מה היה ידוע, מה היה ניתן להחליט, מה היה ניתן לשלוח, מה היה ניתן להתמלא, ובאיזו אי־ודאות — בדיוק בזמן שבו ההחלטה הייתה צריכה להתקבל.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. למה Backtest קצר־טווח קשה במיוחד

‏ככל שה־holding horizon קצר יותר, חלק גדול יותר מה־PnL נובע מ־microstructure ולא רק מכיוון המחיר.

‏ב־trade של שניות, ההבדל בין:

```text
signal at 10.000
submit at 10.080
fill at 10.140
exit trigger at 12.400
exit fill at 12.520
```

‏לבין מודל שמניח fill מיידי ב־10.000 יכול להיות כל ה־Edge.

‏לכן אסטרטגיה קצרה רגישה במיוחד ל:

- ‏latency.
- ‏spread.
- ‏slippage.
- ‏queue position.
- ‏partial fills.
- ‏quote freshness.
- ‏trade conditions.
- ‏routing.
- ‏data batching.
- ‏execution feasibility.
- ‏adverse selection.
- ‏exit delay.

---

# ‏2. ארבעת העולמות של Backtest

‏נפריד בין ארבע שכבות:

```text
Historical Market Reality
→ What was observable
→ What the strategy would decide
→ What execution could realistically achieve
```

‏טעות בכל אחת מהשכבות יכולה ליצור fake alpha.

---

# ‏3. `Historical Truth` לעומת `As-Known-At`

‏Database היסטורי יכול להכיל מידע מתוקן בדיעבד.

‏אבל בזמן אמת ייתכן שהמידע המקורי היה:

- ‏חסר.
- ‏מאוחר.
- ‏שגוי.
- ‏לא מסונכרן.
- ‏עם correction שהגיע רק אחר כך.

‏Backtest צריך לדעת האם הוא משתמש ב:

```text
AsOriginallyObserved
```

‏או:

```text
AsLaterCorrected
```

‏אסור לערבב ביניהם בלי לדעת.

---

# ‏4. `Point-in-Time Correctness`

‏כל feature חייב להשתמש רק במידע שהיה זמין באותו רגע.

‏לא מספיק לשאול:

```text
EventTime <= DecisionTime
```

‏לעיתים צריך לשאול גם:

```text
ReceiveTime <= DecisionTime
```

‏אם event התרחש ב־10:00:00.100 אבל הגיע למערכת רק ב־10:00:00.180, אסור ל־Backtest להשתמש בו בהחלטה ב־10:00:00.150.

---

# ‏5. `Look-Ahead` יכול להסתתר במקומות לא צפויים

‏Leakage אינו רק שימוש במחיר עתידי.

‏הוא יכול להגיע גם מ:

- ‏Universe שבנוי מרשימת מניות עתידית.
- ‏corporate-action data שנוקתה בדיעבד.
- ‏trade corrections שהגיעו אחרי ההחלטה.
- ‏bars שנבנו עם מידע מסוף החלון.
- ‏normalization על statistics של כל היום.
- ‏feature scaling שחושב על Dataset עתידי.
- ‏labels שדלפו לתהליך בחירת features.
- ‏cache ששומר state מהעתיד בהרצת replay.

---

# ‏6. `Bar Backtest` יכול להיות מסוכן לאסטרטגיה של שניות

‏OHLC של שנייה או דקה אינו מספר לנו את מסלול המחיר בתוך החלון.

‏אם bar הוא:

```text
Open  = 100.00
High  = 100.20
Low   = 99.90
Close = 100.15
```

‏אנחנו לא יודעים אם הסדר היה:

```text
100.00 → 100.20 → 99.90 → 100.15
```

‏או:

```text
100.00 → 99.90 → 100.20 → 100.15
```

‏עבור Stop/Target/Exit logic זה הבדל מהותי.

---

# ‏7. `Path Dependence`

‏במערכת שלנו התוצאה תלויה במסלול, לא רק בנקודת התחלה וסוף.

‏לדוגמה:

```text
entry
→ +8bp
→ -12bp
→ +15bp
```

‏יכול להוביל לתוצאה שונה לחלוטין לפי:

- ‏take-profit policy.
- ‏stop policy.
- ‏signal-decay exit.
- ‏giveback rule.
- ‏partial fills.

‏לכן event-level replay עדיף כאשר המחקר תלוי במסלול.

---

# ‏8. `Trade Price` אינו בהכרח מחיר שניתן היה לקבל

‏אם trade הודפס ב־100.10, זה לא אומר שהיינו יכולים לקנות 500 shares ב־100.10.

‏צריך לבדוק:

- ‏Bid/Ask באותו רגע.
- ‏size available.
- ‏venue.
- ‏trade condition.
- ‏whether the trade was eligible.
- ‏whether our order would have arrived in time.

---

# ‏9. `Touch = Fill` הוא אחת ההנחות המסוכנות ביותר

‏אם ה־Ask הגיע למחיר ה־Limit שלנו, אין פירוש שהיינו מתמלאים.

‏ייתכן:

- ‏שהיינו מאחורי queue גדול.
- ‏שהנגיעה הייתה קצרה מדי.
- ‏שה־visible size היה קטן.
- ‏שה־trade בוצע ב־venue אחר.
- ‏שהייתה hidden liquidity לפנינו.

‏מודל שמניח fill בכל touch נוטה להפריז ב־passive alpha.

---

# ‏10. `Fill Probability Model`

‏לפקודה פסיבית כדאי לחשוב על:

```text
P(fill | price, queue, flow, time, venue, regime)
```

‏ולא רק:

```text
Did market touch my price?
```

‏גם מודל גס עדיף על הנחת fill ודאי.

---

# ‏11. Queue Position היא latent variable

‏אם אין `MBO`, לרוב אין לנו queue position מדויק.

‏אפשר להשתמש ב:

- ‏volume ahead estimate.
- ‏displayed depth.
- ‏executed volume at price.
- ‏depletion/replenishment.
- ‏cancel assumptions.

‏אבל צריך לסמן במפורש confidence.

---

# ‏12. Partial Fills חייבים להיות חלק מהסימולציה

‏פקודה של 300 shares יכולה להתמלא:

```text
80
→ 40
→ 0
→ 110
→ remainder canceled
```

‏זה משפיע על:

- ‏average price.
- ‏position exposure.
- ‏exit size.
- ‏commissions.
- ‏remaining edge.
- ‏risk.

---

# ‏13. `Market Order` אינו Fill מיידי במחיר Ask יחיד

‏צריך לדמות לפחות:

```text
available liquidity
→ walk through levels
→ fill VWAP
```

‏כאשר size משמעותי יחסית ל־depth.

---

# ‏14. `Marketable Limit` חייב לכבד Limit Price

‏Backtest חייב לעצור consumption כאשר המחיר מגיע ל־limit.

‏אחרת הוא הופך בטעות Marketable Limit ל־Market Order.

---

# ‏15. `IOC` ו־`FOK` דורשים semantics נפרדים

‏`IOC` יכול לבצע חלק ולהרוג remainder.

‏`FOK` דורש fill מלא בתנאים הספציפיים של venue/broker.

‏אסור למדל את שניהם כ־Limit רגיל עם timeout.

---

# ‏16. Native מול Synthetic Orders

‏Stop, Bracket, OCO/OCA, Pegged או algo יכולים להיות:

```text
native at venue
broker-native
client-simulated
```

‏לכל אחד יש latency/failure semantics אחרים.

---

# ‏17. Cancel אינו מיידי

‏בין:

```text
CancelRequested
```

‏לבין:

```text
Canceled
```

‏הפקודה עדיין יכולה להתמלא.

‏Backtest צריך לאפשר `Cancel/Fill Race`.

---

# ‏18. Replace יכול לאבד Queue Priority

‏אם אסטרטגיה מזיזה Limit כל כמה milliseconds, backtest שחושב שה־queue position נשמר יכול להציג fill rate לא מציאותי.

---

# ‏19. Order Aging

‏Order ישן אינו רק order באותו מחיר.

‏ייתכן שה־signal כבר נחלש.

‏צריך לשמור:

```text
order_age
signal_age
remaining_edge
```

---

# ‏20. `Signal TTL`

‏אם signal חי 500ms והפקודה התמלאה אחרי 900ms, fill יכול להיות technically valid אבל economically stale.

‏Backtest צריך למדוד:

```text
signal_age_at_fill
```

---

# ‏21. Latency אינו מספר קבוע

‏מודל:

```text
latency = 50ms
```

‏יכול להיות טוב כ־baseline, אבל מסוכן כמודל סופי.

‏בפועל latency הוא distribution.

---

# ‏22. `Latency Distribution`

‏נרצה למדל לפחות:

```text
p50
p90
p95
p99
```

‏ולא רק average.

---

# ‏23. Latency תלוי Regime

‏בדיוק כאשר השוק מהיר:

- ‏feed burst גדל.
- ‏queues מתמלאים.
- ‏broker path יכול להתעכב.
- ‏fills יכולים להשתנות.

‏לכן latency ו־volatility אינם בהכרח independent.

---

# ‏24. Correlated Latency

‏אם Backtest דוגם latency אקראי independent לכל trade, הוא עלול לפספס מצב שבו כל המערכת נעשית איטית יחד בזמן market burst.

---

# ‏25. Entry ו־Exit Latency אינם אותו distribution

‏Exit יכול להיות מהיר יותר בגלל priority גבוהה במערכת.

‏או איטי יותר בגלל liquidity deterioration.

‏צריך למדוד ולמדל בנפרד.

---

# ‏26. `Latency Sensitivity Curve`

‏במקום לבדוק רק latency אחד, נריץ לדוגמה:

```text
10ms
25ms
50ms
100ms
250ms
500ms
1000ms
```

‏המספרים הם grid למחקר, לא threshold אוניברסלי.

‏המטרה היא למצוא:

```text
Where does edge decay sharply?
```

---

# ‏27. `SignalHalfLife` מול Latency

‏נמדוד:

```text
LatencyPressure = EndToEndLatency / SignalHalfLife
```

‏אם Backtest טוב רק ב־LatencyPressure לא מציאותי, ה־Edge אינו שימושי לנו.

---

# ‏28. Spread חייב להיות Point-in-Time

‏אסור להשתמש ב־average spread יומי כדי לתמחר trade ספציפי.

‏ה־spread בזמן הכניסה והיציאה הוא מה שחשוב.

---

# ‏29. Slippage אינו Constant Bps

‏Slippage תלוי:

- ‏size.
- ‏spread.
- ‏depth.
- ‏volatility.
- ‏urgency.
- ‏venue.
- ‏market state.

---

# ‏30. Adverse Selection הוא חלק מה־Execution Model

‏Fill פסיבי יכול להתרחש דווקא כי מישהו “יודע” יותר והמחיר עומד לזוז נגדנו.

‏Backtest צריך למדוד post-fill markout.

---

# ‏31. Fill Rate גבוה אינו תמיד טוב

‏אם fill rate עולה יחד עם negative markout, ייתכן שהאסטרטגיה מקבלת בעיקר toxic fills.

---

# ‏32. `Filled vs Unfilled Bias`

‏צריך להשוות:

```text
what happened after filled orders
vs
what happened after unfilled attempts
```

‏אחרת לא מבינים את selection mechanism של fills.

---

# ‏33. Missed Opportunity הוא Cost

‏Passive order שלא התמלא בזמן שהמחיר ברח הוא outcome כלכלי.

‏לא מספיק לספור אותו כ־“no trade”.

---

# ‏34. `Opportunity Cost` צריך להיות מוגדר בזהירות

‏לא כל move שלא תפסנו הוא הפסד.

‏אבל אם execution tactic אחת מפספסת systematically profitable signals לעומת tactic אחרת, זה מידע חשוב.

---

# ‏35. Exit Modeling חשוב לפחות כמו Entry Modeling

‏אסטרטגיה יכולה להיכנס מצוין ולהפסיד ב־Exit.

‏צריך למדל:

- ‏trigger delay.
- ‏decision delay.
- ‏submit delay.
- ‏fill delay.
- ‏partial exit.
- ‏slippage.
- ‏liquidity deterioration.

---

# ‏36. `TimeToFlat`

‏לרובוט קצר נמדוד:

```text
exit_trigger → fully_flat
```

‏ולא רק:

```text
exit_trigger → first_fill
```

---

# ‏37. Giveback צריך להימדד מה־MFE

‏אם trade הגיע ל־+20bp ויצא ב־+4bp, ה־PnL לבד מסתיר מידע.

‏נמדוד:

```text
MFE
exit_return
giveback = MFE - exit_return
```

---

# ‏38. Target Hit אינו בהכרח Executable Target

‏אם price print עבר target, זה לא אומר שיכולנו לצאת בכמות שלנו במחיר הזה.

---

# ‏39. Stop Trigger אינו Stop Fill

‏צריך להפריד:

```text
triggered
submitted/activated
filled
```

---

# ‏40. Position Size משנה את Backtest

‏אסור להניח ש־PnL scales linearly עם capital.

‏ככל שה־size גדל:

- ‏impact גדל.
- ‏depth consumption גדל.
- ‏fill probability משתנה.
- ‏exit risk משתנה.

---

# ‏41. Capacity Curve

‏נרצה לבדוק:

```text
NetEdge(size)
```

‏ולא רק NetEdge בגודל יחיד.

---

# ‏42. `Marginal Edge`

‏ייתכן ש־100 shares רווחיים ו־500 פחות.

‏ה־share האחרון צריך להצדיק את העלות השולית שלו.

---

# ‏43. Universe חייב להיות Historical Point-in-Time

‏אסור לקחת את רשימת המניות של היום ולהחזיר אותה שנים אחורה.

‏זה יוצר survivorship bias.

---

# ‏44. Symbol Lifecycle

‏צריך לטפל ב:

- ‏listings.
- ‏delistings.
- ‏ticker changes.
- ‏mergers.
- ‏splits.

---

# ‏45. Corporate Actions

‏מחיר adjusted למחקר ארוך יכול להיות שימושי.

‏אבל ל־execution replay קצר צריך להיזהר שלא להשתמש ב־adjustment שיוצר מחירים שמעולם לא נסחרו כך בזמן אמת.

---

# ‏46. Session Boundaries

‏Premarket, regular, after-hours, auction ו־halts אינם אותו regime.

‏אסור לערבב בלי סימון מפורש.

---

# ‏47. DST ו־Trading Calendar

‏טעות timezone קטנה יכולה לשייך signal לחלון שגוי או להכניס data שלא היה באותה session.

---

# ‏48. Auction Prints

‏Opening/Closing prints יכולים להיראות כמו momentum קיצוני אם לא מזהים אותם נכון.

---

# ‏49. Halts ו־LULD

‏Backtest חייב לדעת מתי trading לא היה זמין או היה מוגבל.

---

# ‏50. Feed Gaps

‏Gap ב־data יכול ליצור jump מלאכותי.

‏אם snapshot קודם ישן, return גדול אינו בהכרח move אמיתי בזמן החלון.

---

# ‏51. Provider Batching

‏כמה events שהגיעו יחד יכולים להיראות כמו acceleration למרות שהתרחשו לאורך זמן ארוך יותר.

---

# ‏52. Replay צריך לשמור Ordering Semantics

‏אם live pipeline משתמש sequence numbers, replay צריך לכבד אותם.

---

# ‏53. Deterministic Replay ו־Realistic Replay הם מטרות שונות

‏`Deterministic Replay` צריך לתת אותה החלטה בכל פעם.

‏`Realistic Execution Replay` יכול להוסיף distributions ואי־ודאות.

‏כדאי להפריד ביניהם.

---

# ‏54. Seeded Randomness

‏אם fill/latency models stochastic, שמור seed כדי שאפשר יהיה לשחזר experiment.

---

# ‏55. Monte Carlo Execution Paths

‏במקום Simulation יחיד אפשר להריץ מספר execution paths ולראות distribution של outcomes.

---

# ‏56. `Best Case / Base Case / Stress Case`

‏כדאי לשמור לפחות שלושה מצבי execution:

```text
optimistic
realistic baseline
stress
```

‏אסטרטגיה שנשברת מיד ב־stress קרוב למציאות אינה robust.

---

# ‏57. `Parameter Surface` חשוב יותר מ־Best Parameter

‏אם parameter אחד בודד נותן תוצאה נהדרת ושכניו גרועים, זה warning.

‏נעדיף plateau יציב על peak חד.

---

# ‏58. `Parameter Hunting`

‏כל ניסיון נוסף הוא עוד הזדמנות למצוא false positive.

‏צריך לעקוב אחרי number of experiments.

---

# ‏59. Multiple Testing

‏אם בודקים 500 combinations, ה־winner עלול להיות lucky.

‏לכן OOS ו־holdouts קריטיים.

---

# ‏60. `Winner's Curse`

‏ה־configuration הטוב ביותר ב־sample נוטה להיות overestimated.

---

# ‏61. Rank #1 Selection Bias

‏גם אם scores unbiased, בחירת maximum מתוך אלפי symbols יוצרת selection pressure.

‏צריך למדוד ביצועים של Top-K ולא רק Top-1.

---

# ‏62. Score Compression

‏אם Top-1 = 0.812 ו־Top-2 = 0.811, ה־winner אינו בהכרח meaningful.

‏Backtest צריך לשמור `RankGap`.

---

# ‏63. Rank Churn

‏מועמד שמחליף מקום ראשון 20 פעמים בשנייה יכול להיות fragile.

‏נמדוד candidate persistence.

---

# ‏64. Candidate Age

‏כמה זמן עבר מאז שהמניה נכנסה ל־Top-N?

‏Winner חדש לגמרי שונה מ־winner יציב.

---

# ‏65. Freshness Fairness

‏אם Symbol A עודכן לפני 5ms ו־B לפני 800ms, ההשוואה יכולה להיות לא הוגנת.

---

# ‏66. Watermarks / Decision Cutoffs

‏Backtest cross-sectional צריך להגדיר איזה events נחשבים זמינים ל־ranking snapshot.

---

# ‏67. Negative Evidence חייב להיות Point-in-Time

‏ב־60A הוספנו Veto Engine.

‏ב־Backtest אסור להשתמש ב־negative evidence שהתגלה רק אחרי ההחלטה.

---

# ‏68. Cooldown Simulation

‏Cooldown משפיע על opportunity set עתידי.

‏אי אפשר לנתח אותו רק trade-by-trade בצורה עצמאית.

---

# ‏69. Veto Overfitting

‏אם מוסיפים מספיק vetoes, אפשר “להסביר” כל loser היסטורי.

‏לכן צריך OOS, ablation ו־decision-impact analysis.

---

# ‏70. Strategy State חייב להיכלל ב־Replay

‏אם strategy זוכרת:

- ‏recent failed breakout.
- ‏cooldown.
- ‏last fill toxicity.
- ‏position state.

‏Backtest חייב לשחזר את state הזה בדיוק.

---

# ‏71. Restart Semantics

‏אם production מאתחל service, מה קורה ל־state?

‏Backtest צריך לבדוק גם restart path אם הוא משפיע על החלטות.

---

# ‏72. Cash / Buying Power Constraints

‏אסור ל־Backtest לפתוח trades כאילו capital בלתי מוגבל.

---

# ‏73. Concurrent Opportunities

‏אם שלוש מניות נותנות signal יחד אבל יש capital רק לאחת, הבחירה ביניהן היא חלק מה־Strategy.

---

# ‏74. Opportunity Ordering

‏הסדר שבו events מגיעים יכול לקבוע איזה candidate מקבל את capital.

---

# ‏75. Pending Orders צורכים Capacity

‏Capital/Exposure צריך להתחשב גם ב־orders שלא הושלמו עדיין.

---

# ‏76. `Pending Exposure`

‏Backtest Execution Engine צריך לחשב:

```text
filled exposure
+ working exposure
+ uncertain exposure
```

---

# ‏77. UNKNOWN_EFFECT בתרחישי Backtest

‏במודל fault injection אפשר לדמות timeout אחרי submit ולבדוק שהמערכת לא שולחת duplicate blindly.

---

# ‏78. Commission Model

‏עמלות צריכות להיות לפי structure רלוונטי למחקר.

‏אם pricing משתנה בזמן, יש versioning.

---

# ‏79. Regulatory/Exchange Fees

‏כאשר הם מהותיים, צריך לכלול אותם במודל העלות.

---

# ‏80. Rebates אינם Free Alpha

‏Maker rebate יכול להגיע עם adverse selection גבוה יותר.

---

# ‏81. Cost Attribution

‏נפריד:

```text
spread
slippage
impact
fees
commission
adverse_selection
missed_opportunity
latency_cost
```

---

# ‏82. `Gross Alpha` מול `Net Alpha`

‏Signal חזק על המסך יכול להפוך שלילי אחרי round-trip costs.

---

# ‏83. Edge Headroom

‏נרצה לדעת כמה margin נשאר:

```text
GrossEdge - ExpectedCosts - StressBuffer
```

---

# ‏84. `Break-Even Cost`

‏מדד שימושי:

```text
How much additional cost can strategy tolerate before NetEdge = 0?
```

---

# ‏85. Regime Analysis

‏Backtest ממוצע על כל התקופה יכול להסתיר:

- ‏regime רווחי מאוד.
- ‏regime מפסיד מאוד.

---

# ‏86. Regime Definition Leakage

‏אסור להגדיר regime באמצעות מידע מהעתיד.

---

# ‏87. Time-of-Day Effects

‏Open, midday, close יכולים להיות שונים מאוד.

---

# ‏88. Day-of-Week / Calendar Effects

‏בודקים רק אם יש hypothesis סביר ומספיק sample.

‏לא הופכים כל slicing ל־data mining.

---

# ‏89. Volatility Buckets

‏כדאי לבדוק האם strategy תלויה ב־volatility regime.

---

# ‏90. Liquidity Buckets

‏אותו score יכול להתנהג אחרת ב־liquid מול thin symbols.

---

# ‏91. Price Buckets

‏Tick size ו־spread percentage משתנים עם price level.

---

# ‏92. Sample Independence

‏1000 trades מאותו burst אינם בהכרח 1000 observations עצמאיים.

---

# ‏93. Episode-Based Analysis

‏אפשר לקבץ signals correlated לאותו market episode.

---

# ‏94. Clustered Outcomes

‏Risk ומובהקות צריכים להבין clustering לפי day/symbol/regime.

---

# ‏95. `Average Trade` הוא Metric חלש לבד

‏צריך גם distribution.

---

# ‏96. Median ו־Quantiles

‏נבדוק:

```text
median
p10
p25
p75
p90
```

‏לפי metric.

---

# ‏97. Tail Losses

‏אסטרטגיה עם mean חיובי יכולה להיות מסוכנת אם tail loss גדול.

---

# ‏98. Drawdown צריך להיות Chronological

‏אי אפשר לחשב drawdown אחרי shuffle של trades.

---

# ‏99. Sequence Risk

‏אותם trades בסדר שונה יכולים ליצור capital path שונה.

---

# ‏100. `PnL` אינו Primary Metric יחיד

‏לרובוט שלנו חשובים גם:

- ‏hit rate.
- ‏time_to_first_profit.
- ‏time_to_target.
- ‏MFE.
- ‏MAE.
- ‏giveback.
- ‏fill rate.
- ‏markout.
- ‏time_to_flat.
- ‏missed opportunity.
- ‏net edge retained.

---

# ‏101. Entry Label ו־Trade Outcome הם דברים שונים

‏Feature יכול לחזות price move אבל עדיין לא לייצר profitable execution.

---

# ‏102. Label Horizon Sensitivity

‏נבדוק מספר horizons:

```text
100ms
250ms
500ms
1s
2s
5s
10s
30s
60s
```

‏רק כאשר data fidelity מאפשר זאת.

---

# ‏103. Horizon Grid אינו Invitation ל־Overfit

‏המטרה היא להבין decay curve, לא לבחור בדיעבד horizon עם PnL הכי יפה.

---

# ‏104. `TimeToFirstProfit`

‏למטרה שלנו זה metric חשוב יותר מ־return בסוף חלון שרירותי.

---

# ‏105. `TimeToTarget`

‏מודד האם target קטן מגיע מספיק מהר כדי להיות רלוונטי.

---

# ‏106. Post-Target Giveback

‏נבדוק מה קורה אחרי שהמחיר מגיע ל־target קטן.

‏זה בוחן את hypothesis שלנו של יציאה מהירה לפני decay.

---

# ‏107. Counterfactual Exit Policies

‏על אותו entry replay אפשר להשוות:

- ‏fixed target.
- ‏time exit.
- ‏signal decay.
- ‏trailing/giveback logic.

‏אבל צריך לתקן multiple testing.

---

# ‏108. Entry Policy Counterfactuals

‏אפשר להשוות passive/aggressive/marketable-limit רק תחת execution models ריאליים.

---

# ‏109. Shadow Counterfactuals

‏ב־Live/Paper כדאי לשמור מה היה קורה לפי policies שלא נבחרו.

‏כך calibrate Backtest מול reality.

---

# ‏110. Backtest-to-Live Calibration

‏נשווה:

```text
predicted fill rate vs observed
predicted slippage vs observed
predicted latency vs observed
predicted markout vs observed
predicted no-trade rate vs observed
```

---

# ‏111. `Simulation Error` הוא Metric

‏הפער בין model ל־live צריך להיות מנוטר, לא רק PnL.

---

# ‏112. Calibration by Regime

‏Execution model יכול להיות מדויק ב־normal market ושגוי ב־fast market.

---

# ‏113. Calibration by Symbol Type

‏Large-cap ו־thin small-cap אינם אותו market.

---

# ‏114. Model Versioning

‏Fill model, latency model, cost model ו־queue model צריכים גרסאות.

---

# ‏115. Experiment Manifest

‏כל Backtest צריך לשמור לפחות:

```text
experiment_id
data_version
universe_version
code_version
config_version
feature_version
label_version
execution_model_version
cost_model_version
latency_model_version
random_seed
```

---

# ‏116. Reproducibility

‏אותו manifest צריך לשחזר אותו result, למעט stochastic ranges מוגדרים.

---

# ‏117. Immutable Results

‏לא דורסים experiment ישן.

‏יוצרים experiment חדש.

---

# ‏118. Negative Results נשמרים

‏מחקר שנכשל הוא Evidence.

‏אם מוחקים אותו, קל לבצע שוב את אותה טעות.

---

# ‏119. Primary Metric מוגדר מראש

‏לפני experiment קובעים מה מכריע.

‏אחרת קל לבחור metric שנראה טוב בדיעבד.

---

# ‏120. Diagnostic Metrics אינם Promotion Metrics

‏Metric יכול לעזור להבין failure בלי להצדיק promotion.

---

# ‏121. `Holdout` אמיתי

‏Holdout שלא נפתח שוב ושוב בזמן development שווה יותר.

---

# ‏122. Walk-Forward

‏למערכת משתנה בזמן, walk-forward validation עדיף לרוב על random split.

---

# ‏123. Purging / Embargo

‏כאשר samples overlapping בזמן, צריך למנוע leakage בין train/test windows.

---

# ‏124. Feature Leakage דרך Rolling Windows

‏Rolling feature חייב להסתיים בזמן ההחלטה, לא אחרי.

---

# ‏125. Label Leakage דרך Overlap

‏אם label של sample אחד חופף ל־feature period של test אחר, צריך להבין את התלות.

---

# ‏126. `Naive Baseline`

‏כל Strategy צריכה לנצח baseline פשוט.

‏לדוגמה:

```text
random eligible candidate
simple momentum
no-ranking baseline
```

---

# ‏127. Null Model

‏Shuffle או randomization יכולים לחשוף pipeline שמייצר Alpha מזויף.

---

# ‏128. Time-Shift Test

‏הזזת features בזמן יכולה לחשוף leakage.

---

# ‏129. Data Corruption Canary

‏אם strategy “משתפרת” כאשר data quality גרועה, זה warning גדול.

---

# ‏130. `Ablation`

‏מסירים feature/rule אחד ורואים מה באמת תרומתו.

---

# ‏131. Interaction Effects

‏Feature יכול להיות חלש לבד וחזק יחד עם אחר.

‏אבל interaction mining מגדיל overfitting risk.

---

# ‏132. Complexity Tax

‏Model מורכב צריך להצדיק את עצמו מול baseline פשוט.

---

# ‏133. Execution Complexity Tax

‏Tactic מתוחכם צריך להראות שיפור נטו אחרי operational complexity.

---

# ‏134. `NO TRADE` הוא Outcome

‏Backtest חייב למדוד גם מתי המערכת בוחרת לא לסחור.

---

# ‏135. No-Trade Rate

‏אם filters/vetoes משאירים 0.1% מההזדמנויות, צריך לוודא שה־sample עדיין מספיק.

---

# ‏136. Opportunity Set Drift

‏Rules חדשות יכולות לשנות איזה symbols בכלל מגיעים ל־ranking.

---

# ‏137. Survivorship של Trades

‏אם שומרים רק trades שבוצעו ולא attempts שנפסלו/לא התמלאו, מאבדים Evidence חשוב.

---

# ‏138. Decision Journal ב־Backtest

‏לכל decision נשמור:

```text
candidate set
rank
score
vetoes
freshness
expected costs
execution plan
final decision
```

---

# ‏139. `First Divergence` בין Versions

‏כאשר שתי strategy versions שונות, נחפש את האירוע הראשון שבו החלטתן נפרדה.

---

# ‏140. Backtest Diff

‏השוואת versions צריכה להראות:

- ‏same decisions.
- ‏new trades.
- ‏removed trades.
- ‏changed sizing.
- ‏changed execution.
- ‏changed exits.

---

# ‏141. Performance Attribution

‏שיפור PnL יכול להגיע מ:

```text
better prediction
better candidate selection
better fill
lower costs
better exit
less risk
```

‏צריך לדעת מאיפה.

---

# ‏142. Causal Story חייב להתאים למכניקה

‏אם feature supposedly predicts momentum אבל השיפור מגיע רק מ־fee rebate, הסיפור שגוי.

---

# ‏143. Backtest Speed מול Fidelity

‏לא כל experiment צריך full microstructure simulation.

‏אפשר לעבוד בשלבים:

```text
Fast Screening
→ Realistic Replay
→ Stress Simulation
```

---

# ‏144. Fast Screening

‏מיועד להשליך רעיונות חלשים מהר.

‏הוא לא מספיק ל־promotion.

---

# ‏145. Deep Replay

‏רק survivors עוברים ל־event-level execution model כבד יותר.

---

# ‏146. Stress Replay

‏נוסיף:

- ‏higher latency.
- ‏wider spread.
- ‏lower fill probability.
- ‏worse slippage.
- ‏market-data degradation.

---

# ‏147. Pessimism אינו מטרה בפני עצמה

‏Backtest “קשה” מדי יכול גם לפסול Edge אמיתי.

‏המטרה היא calibrated realism.

---

# ‏148. Confidence Bands

‏עדיף range סביר מאשר PnL יחיד עם false precision.

---

# ‏149. Scenario Envelopes

‏נציג:

```text
Base
Conservative
Stress
```

‏ולא רק מספר יחיד.

---

# ‏150. `Backtest Truth` אינו `Live Truth`

‏גם simulation מצוין הוא model.

‏השלב הבא תמיד צריך להיות replay/paper/shadow/small-live calibration בהתאם לרמת הסיכון והבשלות.

---

# ‏151. Practitioner Secret — אם Backtest נהיה טוב יותר ככל שהמודל נהיה פחות ריאלי, זה סימן

‏השוואה בין fidelity levels עצמה היא diagnostic.

---

# ‏152. Practitioner Secret — Passive Alpha נוטה להיות רגיש מאוד ל־fill assumptions

‏כל Strategy פסיבית צריכה survival test מול fill model מחמיר יותר.

---

# ‏153. Practitioner Secret — Winners מהירים במיוחד רגישים יותר ל־Latency Bias

‏אם רוב הרווח מגיע מה־100–300ms הראשונים, אפילו עיכוב קטן יכול לשנות הכול.

---

# ‏154. Practitioner Secret — Fast Markets הם בדיוק המקום שבו model error גדל

‏שם גם:

- ‏latency משתנה.
- ‏spread מתרחב.
- ‏depth נעלם.
- ‏ranking churn עולה.

---

# ‏155. Practitioner Secret — “No Fill” יכול להיות סימן טוב

‏אם passive order לא התמלא כי המחיר ברח לטובתנו, זו missed opportunity.

‏אם הוא התמלא רק לפני move נגדנו, fill rate גבוה הוא רע.

---

# ‏156. Practitioner Secret — Backtest יכול לשפר Strategy בטעות דרך Data Cleaning

‏ניקוי aggressive מדי יכול למחוק דווקא את האירועים הקשים ש־Live יצטרך להתמודד איתם.

---

# ‏157. Practitioner Secret — Average Cost Model מסתיר convexity

‏Cost עולה לעיתים לא־לינארית עם size ו־market stress.

---

# ‏158. Practitioner Secret — Replay מהיר מדי יכול להסתיר backpressure

‏אם simulation קורא events serially בלי מודל processing load, הוא לא בודק האם live consumer יעמוד בקצב.

---

# ‏159. Practitioner Secret — Backtest של Ranking חייב לשמור את כל Candidate Set

‏אחרת אי אפשר להסביר למה Rank #1 ניצח ומה היה Rank #2/3.

---

# ‏160. Practitioner Secret — שיפור ב־Top-1 יכול להגיע מהחלשה של שאר ה־Universe

‏לכן בודקים cross-sectional calibration, לא רק winner outcome.

---

# ‏161. Practitioner Secret — כל Rule שמסיר losers בדיעבד חשוד

‏הוא חייב hypothesis ex-ante ו־OOS evidence.

---

# ‏162. Practitioner Secret — Better Backtest PnL לא תמיד Better Strategy

‏אם השיפור מגיע עם:

- ‏יותר fragility.
- ‏פחות sample.
- ‏יותר complexity.
- ‏יותר latency sensitivity.

‏ייתכן שהגרסה פחות טובה ל־production.

---

# ‏163. Practitioner Secret — `Live-Like Failure Modes` צריכים להיכנס גם לסימולציה

‏לדוגמה:

- ‏stale feed.
- ‏delayed ack.
- ‏partial fill.
- ‏disconnect.
- ‏restart.

---

# ‏164. Practitioner Secret — `Backtest PnL` צריך לבוא עם Error Bars רעיוניים

‏אנחנו אף פעם לא יודעים את fill/queue reality בדיוק.

---

# ‏165. Baseline לרובוט שלנו

‏לשלב המחקר הראשוני נרצה שלוש רמות:

```text
Level 1 — Fast causal screening
Level 2 — Event-level realistic execution replay
Level 3 — Stress / uncertainty envelope
```

---

# ‏166. Baseline — Fast Screening

‏מטרתו:

- ‏לפסול Features חלשים.
- ‏לבדוק labels/horizons.
- ‏לבדוק ranking behavior.

‏לא משתמשים בו כהוכחת profitability.

---

# ‏167. Baseline — Realistic Replay

‏יכלול לפחות:

- ‏point-in-time data.
- ‏Bid/Ask.
- ‏latency.
- ‏costs.
- ‏partial fills כאשר רלוונטי.
- ‏signal TTL.
- ‏entry/exit timing.
- ‏veto state.

---

# ‏168. Baseline — Stress Envelope

‏נעלה:

- ‏latency.
- ‏spread.
- ‏slippage.

‏ונוריד:

- ‏fill probability.
- ‏available depth.

‏ונבדוק אם עדיין נשאר `Net Edge`.

---

# ‏169. מה חייב להיות ב־Backtest Report

```text
Experiment ID
Dataset/Universe versions
Code/Config versions
Primary metric
Trade count
NO TRADE count
Fill assumptions
Latency assumptions
Cost model
Net result
MFE/MAE
TimeToFirstProfit
TimeToTarget
Giveback
Fill rate
Missed opportunity
Markout
TimeToFlat
Regime breakdown
Sensitivity results
Stress results
Known limitations
```

---

# ‏170. RCA כאשר Backtest ו־Live שונים

‏נבדוק לפי סדר:

```text
Data
→ Feature parity
→ Ranking
→ Vetoes
→ Decision timing
→ Order creation
→ Latency
→ Routing
→ Fill model
→ Costs
→ Exit behavior
```

‏מחפשים `First Divergence`.

---

# ‏171. Checklist לפני Promotion

- ‏האם ה־Dataset point-in-time correct?
- ‏האם Universe היסטורי נכון?
- ‏האם אין obvious leakage?
- ‏האם fill assumptions סבירים?
- ‏האם latency stress נבדק?
- ‏האם costs מלאים?
- ‏האם partial fills/NO TRADE קיימים?
- ‏האם Top-1 selection bias נבדק?
- ‏האם OOS עבר?
- ‏האם parameter surface יציב?
- ‏האם stress case לא מוחק לחלוטין את ה־Edge?
- ‏האם ניתן לשחזר את experiment?

---

# ‏172. מה צריך לזכור בעל־פה

1. ‏`Touch != Fill`.
2. ‏`Print != Executable Price`.
3. ‏`Trigger != Fill`.
4. ‏`CancelRequested != Canceled`.
5. ‏Latency הוא distribution, לא constant.
6. ‏Backtest צריך לשחזר `As-Known-At`.
7. ‏Top-1 מתוך אלפים סובל selection bias.
8. ‏Costs ו־adverse selection יכולים למחוק Gross Alpha.
9. ‏Exit modeling חשוב לפחות כמו Entry.
10. ‏Backtest הוא model — Live calibration היא חובה.

---

# ‏173. הכלל המסכם

> ‏**אל תשאל רק “כמה האסטרטגיה הרוויחה בעבר?”. שאל “איזו גרסה של המציאות הייתי צריך להניח כדי לקבל את הרווח הזה — והאם הגרסה הזו באמת הייתה ניתנת לצפייה ולביצוע בזמן אמת?”.**

---

# ‏174. הקשר לפרק הבא

‏אחרי שהבנו את מלכודות ה־Backtest, השלב הבא הוא `Live Trading Subtleties`: הפערים שנוצרים כאשר Strategy עוברת מסימולציה לסביבה אמיתית, גם כאשר המחקר עצמו היה טוב.
