# ‏שלב 46 — `Adverse Selection` לעומק: כשה־Fill עצמו הוא חדשות רעות

> ‏מטרת הפרק: להבין למה Fill במחיר שנראה טוב עלול להיות Execution גרוע, איך לזהות `Adverse Selection`, כיצד מודדים `post-fill markout`, איך מפרידים בין Fill טוב ל־toxic fill, ואיך משלבים את הסיכון הזה בתוך Entry, Routing, Queue, Backtest ו־RCA.
>
> ‏העיקרון המרכזי: **מחיר ביצוע טוב אינו מספיק. צריך לשאול מה קרה מיד אחרי הביצוע ולמה דווקא אנחנו התמלאנו באותו רגע.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. מהו `Adverse Selection`

‏`Adverse Selection` הוא מצב שבו הצד שמולנו בעסקה נוטה להיות טוב מאיתנו מבחינת מידע, timing או urgency.

‏במילים פשוטות:

```text
You get filled,
and immediately the market moves against you.
```

‏זה לא אומר שכל Fill שלילי הוא adverse selection.

‏אבל אם התופעה חוזרת בצורה עקבית, יש כאן signal חשוב על איכות ה־execution.

---

# ‏2. למה זה קריטי במיוחד ב־Limit Orders

‏ב־passive `Limit Order` אנחנו אומרים לשוק:

```text
I am willing to wait here.
```

‏הבעיה היא שהצד האגרסיבי בוחר מתי לתקוף אותנו.

‏לכן Fill אינו sample אקראי של הזמן.

‏הוא conditional event.

‏אנחנו מתמלאים דווקא כאשר מישהו בחר לבצע מול המחיר שלנו.

---

# ‏3. Fill אינו אירוע ניטרלי

‏אם ה־Bid הוא `100.00` ואנחנו Buy Limit ב־`100.00`, Fill יכול להישמע מצוין.

‏אבל מיד אחריו השוק יכול להפוך ל־:

```text
99.96 x 99.98
```

‏כלומר קיבלנו מחיר טוב יחסית ל־Ask הקודם, אבל גרוע יחסית למה שהשוק ידע מילישניות אחר כך.

---

# ‏4. ההבדל בין `Slippage` ל־`Adverse Selection`

‏`Slippage` שואל:

```text
At what price did we execute relative to a benchmark?
```

‏`Adverse Selection` שואל:

```text
What happened after we executed?
```

‏אלה מדדים קשורים אך שונים.

---

# ‏5. אפשר לקבל Slippage טוב ו־Adverse Selection רע

‏לדוגמה:

```text
Decision mid: 100.01
Buy fill:     100.00
Mid +1s:       99.94
```

‏קיבלנו price improvement מול ה־mid בזמן ההחלטה.

‏אבל התוצאה מיד לאחר Fill גרועה.

---

# ‏6. ואפשר גם להפך

‏אפשר לשלם מעט יותר באמצעות `marketable limit`, לקבל Fill ב־`100.02`, ואז לראות:

```text
Mid +1s: 100.10
```

‏המחיר הראשוני נראה פחות טוב, אבל ה־execution שמר טוב יותר על ה־edge.

---

# ‏7. `Markout`

‏המדד הקלאסי לניתוח adverse selection הוא `Markout`.

‏ל־Buy Fill אפשר לחשוב בפשטות על:

```text
Markout(h) = FutureReferencePrice(h) - FillPrice
```

‏ל־Sell הופכים את הסימן.

---

# ‏8. Markout מנורמל לפי Side

‏נוח להגדיר:

```text
Side = +1 for Buy
Side = -1 for Sell

SignedMarkout(h) = Side * (FuturePrice(h) - FillPrice)
```

‏אז ערך חיובי טוב לנו בשני הצדדים.

---

# ‏9. איזה `Future Price` להשתמש

‏אפשר להשתמש ב־:

- ‏`Mid`.
- ‏`Microprice`.
- ‏`Bid/Ask` side-aware.
- ‏`Last`.
- ‏Executable benchmark.

‏הבחירה צריכה להתאים לשאלה.

---

# ‏10. למה `Last` לבדו בעייתי

‏`Last` יכול להיות:

- ‏ישן.
- ‏ב־venue אחר.
- ‏בצד הלא נכון של ה־spread.
- ‏לא מייצג מחיר שניתן לבצע בו כרגע.

‏לכן לניתוח execution קצר־טווח בדרך כלל צריך לפחות benchmark מבוסס quotes.

---

# ‏11. Markout Curve

‏אין horizon יחיד נכון.

‏נרצה למדוד למשל:

```text
+10ms
+50ms
+100ms
+250ms
+500ms
+1s
+2s
+5s
+10s
+30s
```

‏החלונות צריכים להתאים ל־signal horizon ולרזולוציית הנתונים.

---

# ‏12. למה Curve טובה יותר מנקודה אחת

‏Fill יכול להיראות רע אחרי `100ms` וטוב אחרי `5s`.

‏או להפך.

‏ה־curve מלמדת האם הבעיה היא:

- ‏microstructure shock קצר.
- ‏signal decay.
- ‏מהלך מתמשך נגדנו.
- ‏mean reversion לאחר adverse tick.

---

# ‏13. `Immediate Markout`

‏ה־markout הקצר ביותר עוזר לזהות toxicity מיידית.

‏אם Passive Fills נוטים לקבל move שלילי כמעט מיידי, ייתכן שהצד האגרסיבי בוחר אותנו ברגעים גרועים.

---

# ‏14. `Short-Horizon Markout`

‏במערכת שלנו horizons של שניות קריטיים.

‏אם ה־edge אמור להופיע תוך שניות, markout שלילי ב־1–5 שניות הוא warning משמעותי.

---

# ‏15. Fill-Conditioned Outcome

‏השאלה הנכונה אינה רק:

```text
What happens after a signal?
```

‏אלא גם:

```text
What happens after the same signal, conditional on getting filled?
```

---

# ‏16. `Selection Bias` של Fills

‏אם Passive Orders מתמלאים רק בחלק מה־signals, העסקאות שבוצעו אינן sample אקראי.

‏לכן:

```text
Outcome | Filled
```

‏יכול להיות שונה מאוד מ־:

```text
Outcome | Signal
```

---

# ‏17. `Fill Bias`

‏Backtest שמניח שכל touch יוצר Fill עלול להחמיץ adverse selection בשתי דרכים:

1. ‏הוא נותן Fills שלא היינו מקבלים.
2. ‏הוא לא מדמה את העובדה ש־Fills אמיתיים מגיעים בתנאים מסוימים.

---

# ‏18. `Fill Probability × Markout`

‏טקטיקת Execution צריכה להיבחן לפחות בשני ממדים:

```text
P(Fill)
Expected Markout | Fill
```

‏Fill Rate גבוה לבדו אינו יעד.

---

# ‏19. דוגמה לשתי טקטיקות

```text
Tactic A:
Fill rate = 80%
1s markout = -8 bps

Tactic B:
Fill rate = 45%
1s markout = +3 bps
```

‏אי אפשר לבחור בלי לכלול גם missed opportunity, fees, spread ו־signal edge.

---

# ‏20. `Expected Execution Value`

‏אפשר לחשוב קונספטואלית על:

```text
Expected Execution Value
≈ Fill Benefit
- Adverse Selection
- Fees
- Slippage
- Missed Opportunity
- Latency Cost
```

---

# ‏21. Adverse Selection אינו רק Passive

‏גם aggressive execution יכול להיות selected badly.

‏לדוגמה, אם אנחנו חוצים Spread לאחר שהמחיר כבר ברח וה־signal דועך, אנחנו עלולים להיות הצד ה־toxic לעצמנו.

---

# ‏22. `Self-Adverse Selection`

‏זהו anti-pattern שימושי לחשוב עליו.

‏לא תמיד “מישהו חכם יותר מאיתנו”.

‏לפעמים המערכת שלנו פשוט נכנסת מאוחר מדי.

---

# ‏23. Passive Adverse Selection

‏ב־Passive Fill הסיכון הקלאסי הוא:

```text
Market moves toward us
→ we get filled
→ market keeps moving through us
```

---

# ‏24. Aggressive Adverse Selection

‏ב־Aggressive Fill הסיכון הוא:

```text
Market already moved
→ we chase
→ we cross spread
→ move exhausts
```

---

# ‏25. Adverse Selection מול `Chasing`

‏Chasing הוא לרוב execution behavior.

‏Adverse selection הוא outcome pattern.

‏Chasing יכול ליצור adverse selection, אבל הם לא אותו דבר.

---

# ‏26. `Toxic Flow`

‏`Toxic Flow` הוא flow שנוטה לחזות תנועה נגד passive liquidity provider לאחר execution.

‏איננו צריכים לדעת מי המשתתף.

‏אנחנו צריכים למדוד outcome.

---

# ‏27. Toxicity היא הסתברותית

‏אין trade אחד שמוכיח toxicity.

‏צריך distribution של outcomes.

---

# ‏28. `Toxicity Score`

‏אפשר לבנות feature מחקרי שמשלב למשל:

- ‏Signed flow.
- ‏Flow acceleration.
- ‏Book depletion.
- ‏Microprice displacement.
- ‏Spread dynamics.
- ‏Recent markout behavior.

‏אבל score כזה חייב לעבור validation נפרד.

---

# ‏29. `Order Flow` לפני Fill

‏נרצה לשמור context לפני Fill:

```text
signed_volume_1s
signed_volume_5s
flow_acceleration
sweep_count
bid_depletion
ask_depletion
microprice_offset
spread_ticks
book_churn
```

---

# ‏30. `Order Flow` אחרי Fill

‏לאחר Fill נרצה לשמור:

```text
markout_100ms
markout_500ms
markout_1s
markout_2s
markout_5s
markout_10s
```

‏כך ניתן לחבר pre-fill state ל־post-fill outcome.

---

# ‏31. `Fill Context`

‏כל Fill צריך לשמור context מלא מספיק ל־RCA.

‏לדוגמה:

```text
fill_id
order_id
intent_id
decision_id
symbol
side
fill_price
fill_qty
venue
route
order_type
passive_or_aggressive
signal_age
queue_age
spread
microprice
flow_state
book_state
regime
```

---

# ‏32. `Passive / Aggressive Classification`

‏חשוב לסווג Fill לפי האם הוספנו liquidity או לקחנו liquidity.

‏בלי ההבחנה הזו Markout aggregation עלול לערבב שני מנגנונים שונים.

---

# ‏33. `Venue` matters

‏אותה טקטיקה יכולה לקבל markout שונה בין venues.

‏לכן ניתוח מתקדם יכול להתפלח לפי:

```text
venue
route
liquidity_flag
order_type
```

---

# ‏34. אבל להיזהר מ־Overfitting

‏יותר dimensions יוצרים יותר buckets קטנים.

‏אסור להסיק מסקנות מ־10 Fills מקריים ב־venue מסוים.

---

# ‏35. `Markout by Venue`

‏המדד שימושי כאשר יש sample סביר.

‏לדוגמה:

```text
Venue A passive fills:
1s median markout = -2.1 bps

Venue B passive fills:
1s median markout = +0.7 bps
```

‏זה יכול להצדיק hypothesis, לא מיד routing rule.

---

# ‏36. `Markout by Order Type`

‏נרצה להשוות:

- ‏Passive Limit.
- ‏Marketable Limit.
- ‏IOC.
- ‏Midpoint.
- ‏Pegged.
- ‏Broker Algo.

---

# ‏37. `Markout by Queue Age`

‏Order שמחכה זמן רב יכול להפוך ל־stale.

‏ייתכן ש־fills אחרי queue age גבוה יהיו רעילים יותר.

---

# ‏38. `Markout by Signal Age`

‏זה קריטי לרובוט שלנו.

‏אם Fill מתקבל כשה־signal כבר בן `2.5s`, התוצאה יכולה להיות שונה מאוד מ־Fill ב־`150ms`.

---

# ‏39. `Signal TTL`

‏אם ה־signal קצר, Order TTL צריך להיות קשור אליו.

‏אחרת אנחנו עלולים לקבל Fill “מוצלח” של order שכבר לא רצינו.

---

# ‏40. `Stale Fill`

‏`Stale Fill` הוא Fill שהגיע לאחר שה־decision context השתנה מהותית.

‏לדוגמה:

- ‏Rank #1 התחלף.
- ‏Score ירד.
- ‏Book imbalance התהפך.
- ‏Flow הפך צד.
- ‏Spread התרחב.
- ‏Regime השתנה.

---

# ‏41. Fill יכול להגיע אחרי Cancel Request

‏Cancel אינו מיידי.

‏לכן:

```text
CancelRequested != Cancelled
```

‏וה־Fill שמגיע בחלון הזה צריך להיכנס לניתוח adverse selection.

---

# ‏42. `Cancel/Fill Race`

‏זהו מקרה קלאסי:

```text
Signal deteriorates
→ cancel sent
→ aggressor hits order before cancel reaches venue
→ fill occurs
```

‏זה בדיוק סוג Fill שעלול להיות רעיל.

---

# ‏43. `Cancel Latency` כחלק מהבעיה

‏לא מספיק למדוד submit latency.

‏צריך למדוד:

```text
cancel_request → broker_ack
cancel_request → venue_effective_cancel
```

‏כאשר המידע זמין.

---

# ‏44. `Cancel Too Late`

‏RCA צריך להבדיל בין:

- ‏Decision היה מאוחר.
- ‏Cancel command היה מאוחר.
- ‏Broker/route latency היה גבוה.
- ‏Fill היה בלתי נמנע אחרי שה־cancel נשלח.

---

# ‏45. Queue Position ו־Adverse Selection

‏מיקום טוב בתור אינו תמיד יתרון.

‏אם אנחנו ראשונים ב־Bid שמתחיל להישבר, נוכל להיות הראשונים לקבל toxic sell flow.

---

# ‏46. `Queue Priority Paradox`

‏Queue priority טובה מגדילה Fill Probability.

‏אבל Fill Probability גבוהה יותר יכולה להגדיל exposure ל־adverse selection.

---

# ‏47. לכן Queue Value אינו רק Fill Rate

‏נרצה משהו כמו:

```text
QueueValue
≈ ExpectedFillBenefit
- ExpectedAdverseSelection
- OpportunityCost
```

---

# ‏48. `Touch` מול Toxic Touch

‏לא כל touch שווה.

‏Touch שמגיע עם depletion חד ו־aggressive flow חד־צדדי שונה מ־touch רגוע עם balanced flow.

---

# ‏49. `Spread` ו־Adverse Selection

‏Spread רחב נותן לכאורה יותר compensation ל־passive liquidity.

‏אבל לעיתים spread רחב משקף uncertainty גבוהה יותר.

---

# ‏50. `Spread Capture` אינו Free Money

‏הנוסחה הפשוטה:

```text
Buy Bid → Sell Ask
```

‏נראית כמו spread capture.

‏אבל אם Bid Fill מגיע בדיוק לפני ירידה, ה־spread לא מפצה בהכרח על adverse movement.

---

# ‏51. Effective Spread מול Markout

‏ניתוח מקצועי מפריד:

- ‏Effective Spread.
- ‏Realized Spread.
- ‏Markout.

‏כך רואים כמה מה־spread נשמר לאחר תנועת המחיר.

---

# ‏52. `Realized Spread`

‏קונספטואלית, realized spread מודד כמה מה־spread נשאר אצל ה־liquidity provider לאחר horizon מסוים.

‏אם markout רע מאוד, realized spread יכול להתכווץ או להפוך שלילי.

---

# ‏53. `Price Improvement` יכול להטעות

‏אם קיבלנו fill בתוך ה־spread אבל השוק זז מיד נגדנו, price improvement לבדו לא מתאר איכות execution.

---

# ‏54. `Fill Quality` רב־ממדית

‏נרצה לפחות:

```text
price_vs_decision
price_vs_arrival
spread_capture
markout_curve
fill_probability
time_to_fill
partial_fill_ratio
missed_opportunity
```

---

# ‏55. `Markout Distribution`

‏ממוצע לבד אינו מספיק.

‏נמדוד:

- ‏Median.
- ‏P10/P25/P75/P90.
- ‏Tail loss.
- ‏Positive-rate.
- ‏Mean.

---

# ‏56. למה Median חשובה

‏כמה adverse events קיצוניים יכולים לעוות ממוצע.

‏Median עוזרת להבין fill “טיפוסי”.

---

# ‏57. אבל Tail חשוב אפילו יותר ל־Risk

‏גם אם median סביר, P1/P5 של markout יכול להיות מסוכן מאוד.

---

# ‏58. `Conditional Tail Markout`

‏אפשר לבדוק:

```text
Expected markout among worst 5% fills
```

‏זה עוזר להבין tail toxicity.

---

# ‏59. `Time to Adverse Move`

‏לא רק כמה המחיר ירד.

‏גם כמה מהר.

```text
fill → first -5bps move
```

‏יכול להיות feature execution חשוב.

---

# ‏60. `Time to Recovery`

‏אם move שלילי מיידי חוזר מהר, המשמעות שונה מ־persistent adverse move.

---

# ‏61. `MAE after Fill`

‏אפשר למדוד Maximum Adverse Excursion החל מה־Fill.

‏זה מחבר adverse selection ל־exit/risk.

---

# ‏62. `MFE after Fill`

‏גם Maximum Favorable Excursion חשוב.

‏נרצה להבין האם fill toxic early אבל signal eventually עובד.

---

# ‏63. Markout ≠ Trade PnL

‏Markout הוא diagnostic execution metric.

‏PnL כולל exit logic, costs, sizing ועוד.

---

# ‏64. Prediction Quality מול Execution Quality

‏אסטרטגיה יכולה לחזות נכון direction אבל לבצע רע.

‏ולהפך: execution יכול להיות מצוין על signal גרוע.

---

# ‏65. ארבע שכבות שצריך להפריד

```text
Prediction
Selection
Execution
Exit
```

‏Adverse selection בעיקר יושב בשכבת Execution, אבל יכול לחשוף בעיות upstream.

---

# ‏66. `Signal Selection Bias`

‏אם אנחנו בוחרים מניות עם momentum קיצוני, עצם ה־selection יכול להגדיל toxicity של passive orders.

---

# ‏67. למה

‏Momentum חזק עלול למשוך aggressive flow בכיוון אחד.

‏אם נעמוד פסיבית בצד הלא נכון, נבחר שוב ושוב לרעה.

---

# ‏68. `Momentum + Passive Entry`

‏זה pairing שצריך לבדוק אמפירית.

‏ייתכן שה־signal טוב, אבל passive entry אינו execution policy מתאים לו.

---

# ‏69. `Mean Reversion + Passive Entry`

‏במצבים מסוימים passive execution יכול להתאים יותר, אבל גם כאן אין כלל אוניברסלי.

---

# ‏70. Match בין Signal ל־Execution

‏השאלה היא:

```text
What execution policy preserves this signal's edge?
```

‏לא:

```text
Which order type is generally best?
```

---

# ‏71. `Execution Policy by Signal Strength`

‏Signal חזק ומהיר יכול להצדיק aggression גבוהה יותר.

‏Signal חלש יכול להצדיק passive attempt או `NO TRADE`.

---

# ‏72. `Execution Policy by Signal Half-Life`

‏אם half-life קצר מאוד, waiting cost גבוה.

‏אבל אם passive fills toxic, waiting יכול להיות מסוכן משתי סיבות בו־זמנית.

---

# ‏73. `Adverse Selection Budget`

‏אפשר לחשוב על budget:

```text
Expected Alpha
- Explicit Costs
- Spread/Slippage
- Expected Adverse Selection
- Safety Margin
```

‏אם נשאר <= 0, העסקה אינה כלכלית.

---

# ‏74. `Expected Markout Cost`

‏אפשר לבנות מודל מחקרי של expected markout לפי context.

‏הוא אינו חייב להיות ML מורכב.

‏Bucketed empirical averages יכולים להיות baseline מצוין.

---

# ‏75. דוגמה ל־bucket פשוט

```text
spread_ticks = 1
flow_imbalance > 0.7
microprice_offset > 0.2 spread
signal_age < 500ms
passive_buy = true
```

‏ואז למדוד distribution של markout.

---

# ‏76. `Adverse Selection Feature`

‏ניתן ליצור feature כמו:

```text
expected_markout_1s
```

‏אך הוא חייב להיבנות רק ממידע שהיה זמין בזמן ההחלטה.

---

# ‏77. Leakage Warning

‏אסור להשתמש ב־future fills או future markouts כ־feature live.

‏הם labels למחקר.

---

# ‏78. `Point-in-Time` חשוב במיוחד

‏כל pre-fill feature חייב להיות מחושב `as_of` הזמן שבו היינו יכולים לדעת אותו.

---

# ‏79. Exchange Time מול Receive Time

‏אם אנחנו משתמשים ב־exchange timestamps במחקר אבל live decision מתבסס על receive time, יכול להיווצר timing mismatch.

---

# ‏80. `Markout Clock`

‏צריך להגדיר מאיזה זמן מודדים horizon:

- ‏Fill exchange time.
- ‏Fill receive time.
- ‏Broker callback time.

‏לכל אחד שימוש אחר.

---

# ‏81. Execution Truth

‏לניתוח כלכלי לרוב נרצה להתחיל מ־actual fill event.

‏לניתוח system latency נרצה גם callback/processing times.

---

# ‏82. `Partial Fills`

‏Partial fills מסבכים markout.

‏אפשר לנתח כל execution בנפרד וגם ליצור aggregate per parent order.

---

# ‏83. `Fill-Weighted Markout`

‏ל־Parent Order אפשר לחשב markout משוקלל לפי quantity.

---

# ‏84. `First Fill Markout`

‏לפעמים ה־first fill הוא diagnostic חשוב כי הוא אומר מתי התחלנו להיבחר.

---

# ‏85. `Last Fill Markout`

‏ה־last fill יכול ללמד אם continued waiting החמיר toxicity.

---

# ‏86. `Fill Sequence`

‏נרצה לשמור:

```text
fill_index
fill_qty
fill_price
fill_time
remaining_qty
queue_age
signal_age
```

---

# ‏87. `Partial Fill Toxicity`

‏אם fill ראשון רעיל, השאלה היא האם לבטל remainder.

‏זו hypothesis שניתן לבדוק.

---

# ‏88. `Dynamic Cancel after Toxic Fill`

‏רעיון אפשרי:

```text
first partial fill
→ markout / flow deteriorates
→ cancel remaining quantity
```

‏אבל חייבים לבדוק latency והאם החלטה כזו באמת משפרת outcome.

---

# ‏89. `Fill as Information`

‏ה־Fill עצמו יכול להפוך ל־event שמעדכן את state של האסטרטגיה.

‏לא רק bookkeeping.

---

# ‏90. `Fill Surprise`

‏אם Order עם estimated fill probability נמוכה התמלא מהר מאוד, זה יכול להיות מידע.

‏ייתכן שהספר השתנה מהר.

---

# ‏91. `Fast Fill` אינו תמיד טוב

‏Passive Order שהתמלא כמעט מייד עשוי להיות סימן שהשוק חצה אליו בעוצמה.

---

# ‏92. `Slow Fill` אינו תמיד טוב

‏Order שחיכה זמן רב עלול להתמלא אחרי שה־signal התיישן.

---

# ‏93. לכן Time-to-Fill צריך Conditioning

‏נמדוד:

```text
markout by time_to_fill bucket
```

---

# ‏94. `Fill Hazard`

‏באופן מתקדם אפשר לחשוב על hazard rate:

```text
P(fill in next dt | not filled yet)
```

‏ולחבר אותו ל־expected post-fill outcome.

---

# ‏95. `Good Fill Hazard`

‏היעד אינו רק לחזות Fill.

‏אפשר להגדיר:

```text
P(fill AND positive markout)
```

---

# ‏96. `Bad Fill Hazard`

‏באופן דומה:

```text
P(fill AND negative markout)
```

---

# ‏97. `Fill Probability Model` לבדו חלקי

‏מודל Fill מעולה יכול להמליץ בדיוק על המקומות שבהם אנחנו צפויים להיבחר לרעה.

---

# ‏98. לכן Execution Model צריך שתי שכבות

```text
Layer 1: Will we fill?
Layer 2: What is expected outcome conditional on fill?
```

---

# ‏99. `Queue Depletion` לפני Fill

‏אם volume ahead נעלם מהר, זה יכול להיות:

- ‏Trades.
- ‏Cancellations.
- ‏Repricing.

‏המשמעות שונה.

---

# ‏100. Trade-Driven Depletion

‏אם queue ahead נצרך על ידי aggressive flow, toxicity יכולה לעלות.

---

# ‏101. Cancel-Driven Depletion

‏אם liquidity לפנינו בורחת, זה יכול להיות אפילו signal חזק יותר של deteriorating state.

---

# ‏102. `Liquidity Flight`

‏מצב שבו צד אחד של הספר מתרוקן בעיקר בגלל cancellations/repricing.

‏זה שונה מ־normal consumption.

---

# ‏103. `Book Pulling`

‏אם Bid liquidity נמשכת בזמן שאנחנו ממתינים ל־Buy Fill, ייתכן שההגנה מתחתינו נחלשת.

---

# ‏104. `Replenishment`

‏לעומת זאת, Bid שמתחדש בזמן sell aggression יכול להעיד על absorption.

---

# ‏105. Adverse Selection ו־Absorption

‏Passive Buy בתוך absorption חזק יכול להתנהג שונה מאוד מ־Passive Buy מול collapsing bid.

---

# ‏106. `Microprice` לפני Fill

‏אם microprice כבר מתחת ל־mid בזמן Buy Limit, ייתכן שה־book מאותת downside pressure.

---

# ‏107. Microprice אינו Truth

‏הוא feature הסתברותי בלבד.

‏צריך calibration מול markout.

---

# ‏108. `Microprice → Markout` Calibration

‏נוכל לבדוק:

```text
microprice_offset bucket
→ passive fill markout distribution
```

---

# ‏109. `Book Imbalance → Markout`

‏אותו רעיון:

```text
book_imbalance before fill
→ expected markout after fill
```

---

# ‏110. `Flow + Book` Interaction

‏האות החזק יותר יכול להיות interaction:

```text
seller aggression high
AND bid depletion high
```

‏ולא כל feature בנפרד.

---

# ‏111. `Flow + Replenishment`

‏seller aggression גבוה + bid replenishment גבוה יכול להיות absorption ולא breakdown.

---

# ‏112. `Price Response`

‏תמיד צריך לשאול:

```text
How much did price move per unit of aggressive flow?
```

---

# ‏113. `Flow-to-Price Efficiency`

‏Flow גדול שמייצר movement גדול שונה מ־flow גדול שנבלם.

---

# ‏114. `Pre-Fill Momentum`

‏Markout צריך להתפלח לפי momentum לפני Fill.

---

# ‏115. `Pre-Fill Acceleration`

‏האצה חדה נגד side שלנו יכולה להיות warning.

---

# ‏116. `Spread Widening`

‏Spread שמתרחב לפני Fill יכול להעיד על uncertainty או liquidity withdrawal.

---

# ‏117. `Spread Collapse`

‏לעיתים spread מצטמצם לאחר liquidity arrival.

‏המשמעות ל־fill toxicity יכולה להיות שונה.

---

# ‏118. `Quote Age`

‏אסור לבנות toxicity model על quotes ישנים.

---

# ‏119. `Freshness Gate`

‏אם pre-fill market state אינו fresh, markout attribution צריך לקבל quality flag.

---

# ‏120. `Data Quality` לפני Research

‏לפני מסקנה על adverse selection צריך לוודא:

- ‏timestamps תקינים.
- ‏אין sequence gaps מהותיים.
- ‏quotes לא stale.
- ‏fills משויכים נכון.
- ‏symbol mapping נכון.

---

# ‏121. `Cross-Provider` Risk

‏אם fill מגיע מברוקר אבל benchmark מגיע מ־provider אחר, ייתכנו timestamp/feed differences.

---

# ‏122. `Feed Alignment`

‏צריך לתעד:

```text
fill_source
market_data_source
clock_domain
latency_estimate
```

---

# ‏123. `Markout Noise`

‏בח horizons קצרים מאוד noise יכול להיות גדול.

‏לכן נדרשים samples רבים והתפלגויות.

---

# ‏124. `Tick Size` matters

‏במניה של spread טיק אחד, שינוי של טיק בודד יכול להיות משמעותי מאוד באחוזים מה־spread.

---

# ‏125. Normalize by Ticks

‏בנוסף ל־bps אפשר למדוד:

```text
markout_ticks
```

---

# ‏126. Normalize by Spread

‏אפשר גם:

```text
markout / spread_at_fill
```

‏כדי להשוות בין symbols שונים.

---

# ‏127. Normalize by Volatility

‏במחקר מתקדם אפשר לנרמל לפי short-horizon volatility.

---

# ‏128. `Symbol Effects`

‏יש מניות עם microstructure שונה מאוד.

‏לא לערבב הכול בלי לבדוק heterogeneity.

---

# ‏129. `Time-of-Day Effects`

‏Open, midday ו־close יכולים להציג toxicity שונה.

---

# ‏130. `Regime Effects`

‏Fast market, high volatility, low liquidity ו־normal regime צריכים segmentation.

---

# ‏131. `Event Risk`

‏סביב news/events market behavior יכול להשתנות חדות.

‏המערכת יכולה לבחור `NO TRADE` אם uncertainty גבוהה מדי.

---

# ‏132. `LULD / Halt Proximity`

‏קרבה ל־limit state או reopening משנה microstructure ומחייבת safety rules נפרדים.

---

# ‏133. `Adverse Selection by Size`

‏Quantity גדולה יותר יכולה ליצור impact שונה וגם fill composition שונה.

---

# ‏134. `Capacity`

‏טקטיקה שנראית טובה בכמות קטנה יכולה להפוך לרעה כשמגדילים size.

---

# ‏135. `Own Impact`

‏Markout לאחר aggressive order יכול לכלול גם impact שאנחנו עצמנו יצרנו.

---

# ‏136. `Temporary Impact`

‏חלק מה־movement יכול לחזור מהר.

---

# ‏137. `Permanent / Persistent Impact`

‏חלק יכול להישאר לאורך horizon ארוך יותר.

---

# ‏138. Passive Fill ו־Own Impact

‏ב־passive fill impact עצמי בדרך כלל קטן יותר, אבל עדיין אפשר להשפיע אם size משמעותי או routing מורכב.

---

# ‏139. `Fill vs No-Fill Counterfactual`

‏נרצה להשוות:

```text
What happened after filled attempts?
What happened after unfilled attempts?
```

---

# ‏140. `Unfilled Winner`

‏אם unfilled orders נוטים להמשיך בכיוון שלנו בלעדינו, יש missed opportunity.

---

# ‏141. `Filled Loser`

‏אם filled orders נוטים מיד ללכת נגדנו, יש adverse selection.

---

# ‏142. השילוב המסוכן

```text
Unfilled signals → move favorably
Filled signals   → move adversely
```

‏זהו סימן חזק שה־passive execution policy בוחר outcomes גרועים.

---

# ‏143. `Fill / No-Fill Selection Gap`

‏אפשר למדוד:

```text
E[forward_return | filled]
-
E[forward_return | not_filled]
```

‏עם controls מתאימים.

---

# ‏144. אבל לא להשוות נאיבית

‏Filled ו־unfilled events יכולים להיות שונים מראש.

‏צריך conditioning לפי context.

---

# ‏145. Matched Samples

‏אפשר להשוות events דומים לפי:

- ‏symbol.
- ‏time-of-day.
- ‏spread.
- ‏signal score.
- ‏flow state.
- ‏volatility.

---

# ‏146. `Propensity` Concept

‏במחקר מתקדם ניתן לחשוב על probability of fill כ־propensity ולנסות להפריד selection effect.

‏אבל KISS קודם.

---

# ‏147. Baseline טוב

‏התחל ב־bucketed analysis פשוט וברור.

‏רק אם יש evidence חזק צריך מודלים מתקדמים.

---

# ‏148. `Passive Fill Toxicity Dashboard`

‏Dashboard שימושי יכול להציג:

```text
fill_rate
median_markout_100ms
median_markout_1s
median_markout_5s
p10_markout_1s
cancel_fill_race_rate
stale_fill_rate
```

---

# ‏149. `Aggressive Fill Dashboard`

‏נרצה:

```text
slippage_vs_arrival
markout_100ms
markout_1s
markout_5s
chase_distance
signal_age
spread_paid
```

---

# ‏150. `Execution Quality Score`

‏אפשר לבנות score diagnostic, אבל אסור שיטשטש metrics בסיסיים.

‏תמיד צריך drill-down.

---

# ‏151. RCA: Fill רע אחד

‏שאלות:

1. ‏האם signal עדיין היה תקף?
2. ‏האם Fill היה passive או aggressive?
3. ‏מה היה spread?
4. ‏מה היה flow?
5. ‏מה היה book state?
6. ‏האם cancel היה pending?
7. ‏מה היה signal age?
8. ‏מה היה markout curve?

---

# ‏152. `Primary Cause` מול `Contributing Causes`

‏לדוגמה:

```text
Primary: stale passive order
Contributing: cancel latency
Contributing: seller flow acceleration
```

---

# ‏153. Failure Codes

‏אפשר להגדיר:

```text
AS_PASSIVE_TOXIC_FILL
AS_STALE_SIGNAL_FILL
AS_CANCEL_TOO_LATE
AS_FLOW_REVERSAL
AS_BOOK_COLLAPSE
AS_CHASE_EXHAUSTION
AS_SPREAD_WIDENING
AS_DATA_STALE
AS_UNKNOWN
```

---

# ‏154. `UNKNOWN` הוא תקין

‏לא כל fill רע ניתן להסביר.

‏עדיף `UNKNOWN` על סיפור מומצא.

---

# ‏155. Success RCA

‏גם fills טובים צריכים analysis מדגמי.

‏אחרת אנחנו חוקרים רק failures ומקבלים picture מוטה.

---

# ‏156. `Good Passive Fill`

‏דוגמה:

```text
Buy at bid
→ seller flow absorbed
→ bid replenishes
→ microprice recovers
→ positive 1s/5s markout
```

---

# ‏157. `Bad Passive Fill`

```text
Buy at bid
→ bid depletes
→ cancellations increase
→ seller aggression continues
→ negative markout
```

---

# ‏158. `Bad Aggressive Fill`

```text
Signal spikes
→ strategy chases
→ pays ask
→ flow exhausts
→ price mean-reverts
```

---

# ‏159. `Good Aggressive Fill`

```text
Strong fresh signal
→ cross spread quickly
→ continuation persists
→ spread cost small relative to move
```

---

# ‏160. `Execution Policy Matrix`

‏אפשר למחקר לבנות matrix:

| ‏Context | ‏Passive | ‏Balanced | ‏Aggressive |
|---|---:|---:|---:|
| ‏Fresh strong continuation | ? | ? | ? |
| ‏Weak signal | ? | ? | ? |
| ‏High toxicity | ? | ? | ? |
| ‏Wide spread | ? | ? | ? |

‏את התאים ממלאים ב־evidence, לא באינטואיציה.

---

# ‏161. `Markout by Execution Mode`

‏זו השוואה בסיסית לכל tactic.

---

# ‏162. `Net Outcome by Execution Mode`

‏אבל markout לבדו אינו מספיק.

‏צריך גם:

- ‏fees.
- ‏spread.
- ‏slippage.
- ‏fill rate.
- ‏missed opportunity.

---

# ‏163. `Passive vs Aggressive Counterfactual`

‏לכל signal אפשר לשאול מחקרית:

```text
What if we had crossed immediately?
What if we had rested?
What if we had waited 200ms?
```

---

# ‏164. Counterfactual Confidence

‏ככל שאין לנו queue-level data, confidence של passive counterfactual נמוך יותר.

---

# ‏165. `Execution Replay`

‏Replay טוב מאפשר לבדוק policies שונות על אותו event stream.

---

# ‏166. אבל Replay אינו Oracle

‏כאשר אין MBO/queue truth, fill assumptions נשארות model-based.

---

# ‏167. `Fidelity Ladder`

‏נרצה להריץ לפחות:

```text
Optimistic
Base
Conservative
```

‏ולבדוק אם conclusion נשאר.

---

# ‏168. Robustness

‏אם tactic “מנצחת” רק במודל Fill אופטימי, אין לנו evidence חזק.

---

# ‏169. `Markout Calibration Live`

‏Live fills הם מקור calibration קריטי.

‏צריך להשוות predicted toxicity מול actual markout.

---

# ‏170. `Calibration Curve`

‏אם model חוזה toxicity `0.8`, נבדוק האם bucket כזה באמת גרוע משמעותית מ־`0.2`.

---

# ‏171. `Drift`

‏Relationship בין context ל־markout יכול להשתנות עם הזמן.

---

# ‏172. Toxicity Drift

‏נמדוד rolling distributions לפי:

- ‏time-of-day.
- ‏symbol group.
- ‏regime.
- ‏execution mode.

---

# ‏173. `Alerting`

‏אם passive markout מתדרדר משמעותית מול baseline, אפשר ליצור alert למחקר/ops.

‏לא בהכרח auto-retune.

---

# ‏174. Why not Auto-Retune

‏Auto-retuning על noise יכול ליצור feedback loop מסוכן.

---

# ‏175. Champion/Challenger

‏טקטיקה חדשה צריכה לרוץ ב־shadow/challenger לפני promotion.

---

# ‏176. `Decision Impact Rate`

‏נרצה לדעת כמה פעמים toxicity model באמת משנה execution decision.

---

# ‏177. Model טוב שלא משנה החלטות

‏יכול להיות מעניין מחקרית אך חסר ערך production.

---

# ‏178. `Incremental EV`

‏כאשר model משנה החלטה, צריך למדוד האם outcome השתפר.

---

# ‏179. `NO TRADE` הוא tactic תקף

‏אם expected adverse-selection cost מוחק את ה־edge, התוצאה הנכונה יכולה להיות `NO TRADE`.

---

# ‏180. `Skip Passive` אינו בהכרח `Cross`

‏אפשר לבחור:

- ‏Cross.
- ‏Wait.
- ‏Reduce size.
- ‏Choose different candidate.
- ‏NO TRADE.

---

# ‏181. Cross-Sectional Opportunity Cost

‏ברובוט שלנו יש אלפי candidates.

‏אם Rank #1 קשה לביצוע בלי toxicity, Rank #2 יכול להיות כלכלי יותר.

---

# ‏182. `Executable Rank`

‏אפשר לחשוב על:

```text
ExecutableEdge
= PredictedEdge
- ExpectedCosts
- ExpectedAdverseSelection
```

---

# ‏183. Prediction Rank ≠ Executable Rank

‏מניה עם signal חזק ביותר יכולה לרדת בדירוג לאחר execution feasibility.

---

# ‏184. `Top1 vs Top2` RCA

‏לאחר כישלון אפשר לשאול:

```text
Was #1 predictively better but execution-toxic?
Was #2 slightly weaker but more executable?
```

---

# ‏185. `Winner's Execution Problem`

‏ה־symbol הכי “חזק” לעיתים גם הכי crowded, הכי מהיר והכי קשה לביצוע.

---

# ‏186. `Selection Regret`

‏אפשר להרחיב selection regret כך שיכלול execution quality.

---

# ‏187. `Adverse Selection Attribution`

‏נרצה לפרק adverse cost לפי:

```text
signal staleness
queue wait
flow shift
book shift
routing
latency
size
regime
```

---

# ‏188. `First Divergence`

‏ב־RCA נחפש את הנקודה הראשונה שבה context החל להתדרדר.

---

# ‏189. דוגמה ל־Timeline

```text
12:00:00.000 signal selected
12:00:00.080 order sent
12:00:00.130 resting at bid
12:00:00.310 seller flow accelerates
12:00:00.360 bid depth falls 45%
12:00:00.390 cancel requested
12:00:00.420 partial fill
12:00:00.470 cancel confirmed
12:00:01.420 markout = -9 bps
```

---

# ‏190. Timeline טובה יותר מ־single metric

‏היא מאפשרת להבין causal sequence אפשרי בלי להמציא certainty.

---

# ‏191. `Latency Attribution`

‏צריך לפרק:

```text
market event → strategy
strategy → decision
decision → send
send → ack
cancel decision → cancel send
cancel send → cancel effective
```

---

# ‏192. `Latency-to-Signal-Half-Life`

‏אם latency גדול ביחס ל־signal half-life, adverse selection risk עולה.

---

# ‏193. `Latency-to-Book-Half-Life`

‏אם book משתנה מהר יותר מאשר pipeline שלנו, queue/book features עלולים להיות stale בזמן execution.

---

# ‏194. `Hot Path`

‏Toxicity protection ב־hot path חייב להיות פשוט ומהיר.

‏מודל כבד מדי יכול להוסיף latency שמבטל את היתרון שלו.

---

# ‏195. Fast Model + Deep Model

‏אפשר:

```text
Fast toxicity gate for all candidates
Deep execution analysis for Top-N
```

---

# ‏196. `Safety Gate`

‏דוגמה קונספטואלית:

```text
if data_stale:
    NO_TRADE

if expected_markout_cost > remaining_edge:
    NO_TRADE
```

---

# ‏197. Avoid False Precision

‏`expected_markout = -3.7421 bps` אינו בהכרח meaningful.

‏עדיף uncertainty range.

---

# ‏198. `Confidence`

‏Toxicity estimate צריך לכלול confidence לפי sample size, regime similarity ו־data quality.

---

# ‏199. `Unknown` Context

‏אם book/flow data חסרים, model לא צריך להמציא confidence.

---

# ‏200. `Fail Closed` מול Execution

‏אם missing data קריטי להחלטה, אפשר לחסום Entry חדש.

---

# ‏201. אבל Exit שונה

‏ב־Exit ייתכן שנעדיף לבצע גם תחת uncertainty כדי להקטין risk.

---

# ‏202. Entry Adverse Selection מול Exit Adverse Selection

‏ב־Entry השאלה היא האם ליצור exposure.

‏ב־Exit השאלה היא איך להקטין exposure קיים.

---

# ‏203. `Exit Toxicity`

‏גם Exit יכול להתרחש בזמן flow רע.

‏אבל risk constraints יכולים להצדיק aggression למרות cost.

---

# ‏204. `Risk-Reducing Actions` מקבלות קדימות

‏זה מתחבר לשלבי Safety הקודמים.

---

# ‏205. `Position Management`

‏אם fill כניסה מראה adverse markout חריג, אפשר לבדוק hypothesis של early thesis revalidation.

---

# ‏206. לא להפוך Markout ל־Stop אוטומטי בלי בדיקה

‏Markout diagnostic אינו בהכרח exit signal.

‏צריך ניסוי נפרד.

---

# ‏207. `Post-Fill Recheck`

‏רעיון מחקרי:

```text
fill occurs
→ re-evaluate signal / flow / book
→ decide hold / reduce / exit
```

---

# ‏208. `Fill Event` כחלק מ־State Machine

‏לא רק transition טכני.

‏הוא יכול להפעיל analytics/recheck.

---

# ‏209. `Stale Intent Protection`

‏אם decision version השתנה לפני Fill, צריך לדעת לאיזה intent ה־Fill שייך.

---

# ‏210. `Decision ID` ו־`Intent ID`

‏כל Fill חייב להיות traceable חזרה ל־decision המקורי.

---

# ‏211. `Order Version`

‏ב־cancel/replace חשוב לדעת איזה version התמלא.

---

# ‏212. `Route Version`

‏ב־smart/direct routing צריך לדעת איזה route יצר את Fill.

---

# ‏213. `Provider Version`

‏אם market data pipeline משתנה, markout research צריך להיות versioned.

---

# ‏214. `Execution Policy Version`

‏כל experiment חייב לשמור policy version.

---

# ‏215. `Cost Model Version`

‏Net analysis חייב לדעת איזה cost assumptions היו בתוקף.

---

# ‏216. `Research Dataset`

‏טבלת בסיס יכולה לכלול:

```text
fill_id
session_date
symbol
side
strategy_version
execution_policy_version
provider_version
fill_time
fill_price
qty
passive_flag
venue
signal_age_ms
time_to_fill_ms
spread_ticks
book_imbalance
microprice_offset
flow_imbalance
flow_acceleration
markout_100ms
markout_500ms
markout_1s
markout_5s
markout_10s
```

---

# ‏217. `Unfilled Attempt Dataset`

‏צריך טבלה מקבילה לניסיונות שלא התמלאו.

---

# ‏218. למה Unfilled Data קריטיים

‏בלי זה אי אפשר למדוד missed opportunity ו־selection bias בצורה טובה.

---

# ‏219. `Cancelled Attempt Dataset`

‏גם cancelled orders צריכים להישמר.

---

# ‏220. `Cancel Reason`

‏לדוגמה:

```text
SIGNAL_EXPIRED
RANK_CHANGED
FLOW_REVERSED
BOOK_DETERIORATED
PRICE_MOVED
RISK_BLOCK
MANUAL
```

---

# ‏221. Cancel Success Analysis

‏נרצה לדעת אם cancels מנעו adverse fills או ביטלו winners.

---

# ‏222. `Would-Have-Filled` אינו תמיד ידוע

‏Counterfactual כזה תלוי במודל queue.

‏צריך confidence flag.

---

# ‏223. `Missed Toxic Fill`

‏Cancel שהציל אותנו מ־negative markout הוא outcome חשוב.

---

# ‏224. `Missed Winner`

‏Cancel מוקדם מדי שפספס move טוב הוא cost.

---

# ‏225. `Cancel Policy Optimization`

‏הבעיה היא trade-off בין:

```text
Avoid toxic fills
vs
Avoid cancelling good fills
```

---

# ‏226. `Cancel Threshold Surface`

‏לא לבחור threshold בודד לפי best backtest.

‏לחפש plateau robust.

---

# ‏227. `Signal Age Surface`

‏למדוד net outcome לפי order age / signal age.

---

# ‏228. `Flow Reversal Surface`

‏למדוד outcome כאשר flow משתנה בגדלים שונים.

---

# ‏229. `Book Deterioration Surface`

‏אותו דבר ל־depth loss/microprice shift.

---

# ‏230. `Interaction Effects`

‏ייתכן שכל feature לבד חלש, אבל יחד הם חזקים.

---

# ‏231. `Ablation`

‏נבדוק האם flow, book, age וכל feature מוסיפים incremental value.

---

# ‏232. `Redundancy`

‏Microprice ו־book imbalance יכולים להיות correlated.

‏לא לשלם complexity פעמיים ללא value.

---

# ‏233. `Multiple Testing`

‏אם ננסה מאות thresholds, נמצא “edge” במקרה.

---

# ‏234. Experiment Registry

‏כל experiment adverse-selection צריך להירשם עם hypothesis ו־primary metric.

---

# ‏235. Primary Metrics אפשריים

- ‏Net markout improvement.
- ‏Net PnL improvement.
- ‏Reduction in toxic-fill rate.
- ‏Incremental EV on changed decisions.

---

# ‏236. Guardrails

- ‏Fill rate.
- ‏Missed opportunity.
- ‏Latency.
- ‏Rejects.
- ‏Order churn.
- ‏Risk exposure.

---

# ‏237. `Toxic Fill Rate`

‏צריך להגדיר threshold מראש.

‏לדוגמה מחקרית:

```text
1s markout < -X bps
```

‏אבל `X` חייב להיות context-aware ולא מספר קדוש.

---

# ‏238. `Severe Toxic Fill Rate`

‏אפשר להגדיר tail threshold נפרד לצורכי risk/ops.

---

# ‏239. `Markout Stability`

‏נבדוק האם markout improvement מופיע:

- ‏בימים שונים.
- ‏בסמלים שונים.
- ‏ברג'ימים שונים.
- ‏מחוץ ל־train period.

---

# ‏240. `Walk-Forward`

‏מודל toxicity צריך לעבור walk-forward כמו כל model אחר.

---

# ‏241. `Live Shadow`

‏לפני שמשנים execution, אפשר לחשב toxicity decision ב־shadow.

---

# ‏242. Shadow Comparison

‏נשווה:

```text
actual execution
vs
shadow policy recommendation
```

---

# ‏243. `Paper` Limitations

‏Paper fills יכולים להיות אופטימיים ולא לשחזר queue/adverse selection אמיתי.

---

# ‏244. Live Small-Size Calibration

‏רק fills אמיתיים נותנים evidence מלא על execution בפועל, ולכן העלאה ל־live צריכה להיות מבוקרת וזהירה.

---

# ‏245. `Canary Execution`

‏אפשר לבדוק policy חדשה על fraction קטן של eligible opportunities.

---

# ‏246. `Rollback`

‏אם markout deteriorates, צריך יכולת לחזור policy version קודמת.

---

# ‏247. `Kill Switch` Interaction

‏Deterioration קיצוני ב־execution metrics יכול להפוך trigger ל־block new entries, בהתאם ל־policy מוגדרת מראש.

---

# ‏248. אבל לא לעצור על sample קטן

‏Real-time alerting צריך מינימום sample/confidence.

---

# ‏249. `Near Miss`

‏Cancel מילישניות לפני toxic sweep הוא near miss חשוב ללמידה.

---

# ‏250. Near-Miss Capture

‏Incident packet יכול לשמור timeline מלא גם אם לא נגרם הפסד.

---

# ‏251. `Observability`

‏Dashboard חי צריך להציג לפחות:

```text
passive_fill_rate
passive_markout_1s
aggressive_markout_1s
stale_fill_rate
cancel_fill_race_rate
signal_age_at_fill
```

---

# ‏252. `Markout Heatmap`

‏למחקר אפשר להציג:

```text
signal_age × flow_imbalance
```

‏או:

```text
spread_ticks × execution_mode
```

---

# ‏253. `Do Not Average Everything`

‏Aggregate אחד על כל השוק יכול להסתיר failure regime.

---

# ‏254. `Do Not Slice Everything`

‏יותר מדי buckets יוצרים noise.

‏צריך hierarchy של analysis.

---

# ‏255. Hierarchy מומלצת

```text
Global
→ Execution Mode
→ Regime
→ Symbol Group
→ Specific RCA
```

---

# ‏256. `Operational Adverse Selection`

‏לפעמים הבעיה אינה שוק אלא system:

- ‏stale data.
- ‏slow processing.
- ‏broker lag.
- ‏cancel lag.
- ‏queue backlog.

---

# ‏257. `Operational Markout Attribution`

‏אם latency עולה, נבדוק האם markout deteriorates יחד איתה.

---

# ‏258. `Latency Bucket Analysis`

```text
0–50ms
50–100ms
100–250ms
250–500ms
500ms+
```

‏הטווחים עצמם צריכים להיות מותאמים למערכת.

---

# ‏259. `Data Age Bucket Analysis`

‏אותו רעיון ל־quote age/feature age.

---

# ‏260. `Scanner Cycle Age`

‏אם ranking נוצר ממחזור scan ישן, fill toxicity יכולה לעלות.

---

# ‏261. `Whole-Market Coverage`

‏Candidate יכול להיות Rank #1 רק בגלל שחלק מה־universe stale.

‏זה upstream adverse-selection risk.

---

# ‏262. `Coverage Bias`

‏לכן Fresh Coverage Ratio הוא גם execution safety metric, לא רק data metric.

---

# ‏263. `Top1 Churn`

‏אם Rank #1 מתחלף מהר, resting order על winner קודם עלול להפוך ל־stale.

---

# ‏264. `Rank Persistence`

‏Persistence יכולה לשמש context ל־execution urgency.

---

# ‏265. `Rank Gap`

‏אם #1 בקושי מעל #2, אולי לא שווה לשלם adverse-selection cost גבוה כדי לרדוף דווקא אחריו.

---

# ‏266. `Candidate Replacement`

‏אפשר hypothesis:

```text
if current top candidate becomes execution-toxic
→ consider next executable candidate
```

---

# ‏267. `Replacement Cost`

‏אבל switching candidates גם עולה latency ו־complexity.

---

# ‏268. `Hysteresis`

‏צריך להימנע מ־flip-flop בין symbols בגלל micro-noise.

---

# ‏269. `Cooldown`

‏לאחר toxic fill אפשר לבדוק cooldown per symbol/context.

---

# ‏270. Cooldown אינו Punishment

‏הוא צריך להיות מבוסס evidence של persistence, לא תגובה רגשית ל־loss.

---

# ‏271. `Re-entry`

‏אם חוזרים לאותו symbol, צריך signal חדש או revalidation מפורש.

---

# ‏272. `Adverse Selection Memory`

‏אפשר לשמור rolling toxicity state קצר־טווח לכל symbol.

---

# ‏273. אבל להיזהר מ־Stale Memory

‏Market state משתנה מהר.

‏Rolling state צריך decay/TTL.

---

# ‏274. `Toxicity Half-Life`

‏ניתן למדוד כמה זמן predictive power של recent toxic fills נשארת.

---

# ‏275. `Cross-Symbol Spillover`

‏במצבי market shock, toxicity יכולה לעלות רוחבית.

---

# ‏276. `Market-Level Toxicity`

‏אפשר להגדיר aggregate context:

- ‏spread expansion.
- ‏cross-sectional volatility.
- ‏flow imbalance breadth.
- ‏freshness deterioration.

---

# ‏277. `Regime Gate`

‏אם market-level toxicity גבוהה, אפשר להפחית aggression או לחסום entries לפי evidence.

---

# ‏278. `Execution Policy` כמודול

‏ה־Strategy לא צריכה לדעת פרטי markout implementation.

‏היא יכולה לקבל:

```text
ExecutionAssessment
```

---

# ‏279. דוגמה ל־Contract

```text
ExecutionAssessment
- expected_fill_probability
- expected_markout_cost
- expected_slippage
- expected_time_to_fill
- confidence
- recommended_mode
- block_reason
```

---

# ‏280. `Recommended Mode`

‏יכול להיות:

```text
PASSIVE
BALANCED
AGGRESSIVE
WAIT
NO_TRADE
```

---

# ‏281. Strategy עדיין מחזיקה Intent

‏Execution Engine מחליט איך לבצע, אבל לא משנה את thesis העסקי בלי contract ברור.

---

# ‏282. `Risk Engine` מעל Execution

‏גם execution טוב אינו עוקף risk limits.

---

# ‏283. `Safety` מעל הכול

‏אם state אינו ידוע, לא יוצרים risk חדש.

---

# ‏284. Anti-Pattern: “Passive תמיד זול יותר”

‏לא נכון.

‏צריך לכלול adverse selection ומissed opportunity.

---

# ‏285. Anti-Pattern: “Fill Rate גבוה = Execution טוב”

‏לא נכון.

‏Fill Rate יכול לעלות דווקא בגלל toxicity.

---

# ‏286. Anti-Pattern: “Market Order תמיד רע”

‏לא נכון באופן אוניברסלי.

‏לעיתים crossing spread שומר יותר edge מהמתנה רעילה.

---

# ‏287. Anti-Pattern: “Negative Markout = Strategy גרועה”

‏לא בהכרח.

‏צריך להפריד prediction מ־execution.

---

# ‏288. Anti-Pattern: “One Markout Horizon”

‏Horizon יחיד מסתיר dynamics.

---

# ‏289. Anti-Pattern: “Use Last Price”

‏לבד הוא benchmark חלש במיוחד ב־microstructure analysis.

---

# ‏290. Anti-Pattern: “Ignore No-Fills”

‏אז לא ניתן למדוד selection bias ומissed opportunity.

---

# ‏291. Anti-Pattern: “Touch Means Fill”

‏זה כבר הופרך בשלב 38.

‏כאן רואים שגם Fill עצמו אינו בהכרח outcome טוב.

---

# ‏292. Anti-Pattern: “Route by Fee Only”

‏rebate קטן לא מפצה על toxic fills עקב routing גרוע.

---

# ‏293. Anti-Pattern: “Average Across All Symbols”

‏זה יכול להסתיר heterogeneity גדולה.

---

# ‏294. Anti-Pattern: “Tune after Every Bad Trade”

‏זה recipe ל־overfitting.

---

# ‏295. Anti-Pattern: “Explain Every Failure”

‏לפעמים variance הוא ההסבר הנכון.

---

# ‏296. Practitioner Insight: `The Fill Is a Message`

‏ב־passive execution, עצם העובדה שקיבלנו Fill יכולה לשנות את posterior שלנו על state השוק.

---

# ‏297. Practitioner Insight: `Fast Fill Can Be Bad News`

‏Fill מיידי אינו תמיד achievement.

---

# ‏298. Practitioner Insight: `Queue Priority Has a Price`

‏Priority גבוהה קונה Fill probability, אבל גם exposure ל־toxic flow.

---

# ‏299. Practitioner Insight: `Good Price, Bad Timing`

‏זה אחד הכשלים הנפוצים ביותר בהסתכלות נאיבית על execution.

---

# ‏300. Practitioner Insight: `Execution Edge Can Be Negative`

‏Strategy יכולה לייצר alpha, אבל execution יכול למחוק אותו ואף להפוך אותו.

---

# ‏301. Practitioner Insight: `Avoid Being Selected`

‏לפעמים execution טוב הוא דווקא order שלא התמלא.

---

# ‏302. Practitioner Insight: `No Fill Needs Attribution`

‏אבל צריך לדעת אם לא התמלאנו בגלל discipline טוב או פשוט missed opportunity.

---

# ‏303. Practitioner Insight: `Markout Is a Microscope`

‏Markout אינו PnL replacement.

‏הוא כלי שמפרק איכות execution לטווחים קצרים.

---

# ‏304. Practitioner Insight: `Context Beats Global Average`

‏Toxicity תלויה ב־flow, book, regime, symbol, time, size ו־latency.

---

# ‏305. Practitioner Insight: `Simple Models First`

‏Bucketed empirical markouts לעיתים מועילים יותר ממודל ML מורכב שקשה להסביר.

---

# ‏306. Practitioner Insight: `Uncertainty Is a Feature`

‏Confidence נמוך צריך להשפיע על decision.

---

# ‏307. Practitioner Insight: `Protect the Edge, Not the Ego`

‏אין ערך בלהוכיח ש־passive execution “חכם” אם net outcome גרוע יותר.

---

# ‏308. Baseline לרובוט שלנו — שלב ראשון

‏להתחיל ללא toxicity model מורכב.

‏לשמור לכל Fill:

```text
signal_age
execution_mode
spread
flow_imbalance
book_imbalance
microprice_offset
markout_100ms
markout_1s
markout_5s
```

---

# ‏309. Baseline — שלב שני

‏להשוות:

```text
Passive vs Aggressive
Filled vs Unfilled
Fast Fill vs Slow Fill
Fresh Signal vs Stale Signal
```

---

# ‏310. Baseline — שלב שלישי

‏לזהות 2–3 contexts שבהם toxicity גבוהה באופן עקבי.

---

# ‏311. Baseline — שלב רביעי

‏לבנות `Shadow Gate` פשוט בלבד.

‏לדוגמה:

```text
Would block passive entry because:
FLOW_REVERSAL + BID_DEPLETION
```

---

# ‏312. Baseline — שלב חמישי

‏למדוד Decision Impact Rate ו־counterfactual outcomes.

---

# ‏313. Baseline — שלב שישי

‏רק אם יש evidence robust, לקדם rule קטן ל־Champion/Challenger.

---

# ‏314. KPI ראשון

```text
Median 1s Markout by Execution Mode
```

---

# ‏315. KPI שני

```text
Toxic Fill Rate
```

---

# ‏316. KPI שלישי

```text
Missed Opportunity after No-Fill
```

---

# ‏317. KPI רביעי

```text
Signal Age at Fill
```

---

# ‏318. KPI חמישי

```text
Cancel/Fill Race Rate
```

---

# ‏319. KPI שישי

```text
Net Edge Retained after Execution
```

---

# ‏320. Checklist לפני שימוש ב־Adverse Selection Model

- ‏יש timestamps אמינים.
- ‏יש fill provenance.
- ‏יש benchmark side-aware.
- ‏יש multi-horizon markouts.
- ‏יש unfilled attempts.
- ‏יש signal age.
- ‏יש execution mode.
- ‏יש data-quality flags.
- ‏יש OOS validation.
- ‏יש shadow evaluation.

---

# ‏321. Checklist ל־RCA של Fill רע

- ‏מה היה decision המקורי?
- ‏מה היה expected edge?
- ‏מה היה execution mode?
- ‏מה היה queue/signal age?
- ‏מה השתנה לפני Fill?
- ‏האם cancel נשלח?
- ‏מה היה flow?
- ‏מה היה book state?
- ‏מה הייתה markout curve?
- ‏האם #2 היה executable יותר?

---

# ‏322. שאלות ידע

1. ‏למה Fill Rate גבוה יכול להיות סימן שלילי?
2. ‏מה ההבדל בין Slippage ל־Markout?
3. ‏למה Filled Trades הם sample מוטה?
4. ‏מהו Cancel/Fill Race?
5. ‏למה Queue Priority יכולה להגדיל adverse selection?
6. ‏למה Markout Horizon יחיד אינו מספיק?
7. ‏למה צריך לשמור גם No-Fill attempts?
8. ‏מה ההבדל בין Prediction Quality ל־Execution Quality?
9. ‏מתי `NO TRADE` עדיף על passive או aggressive execution?
10. ‏למה uncertainty צריכה להיות חלק מה־decision?

---

# ‏323. סיכום

‏`Adverse Selection` מלמד אותנו שהשאלה “באיזה מחיר התמלאנו?” אינה מספיקה.

‏אנחנו צריכים לשאול גם:

```text
Why did we fill now?
What changed immediately before the fill?
What happened immediately after the fill?
Would not filling have been better?
Was the signal still alive?
Did execution preserve or destroy the edge?
```

‏במערכת קצרה מאוד, Fill הוא לא סוף שלב ה־Entry אלא אירוע מידע בפני עצמו.

‏המערכת צריכה למדוד את הקשר בין `Signal → Order → Queue → Fill → Markout`, להשוות fills ל־no-fills, להפריד passive מ־aggressive, ולשמור uncertainty במקום להמציא certainty.

> ‏**Execution איכותי אינו נמדד לפי כמה יפה נראה מחיר ה־Fill ברגע העסקה, אלא לפי כמה מה־Edge נשאר אחרי שהשוק קיבל הזדמנות להגיב.**

---

# ‏324. לאן ממשיכים

‏בשלב הבא נעבור ל־**`Price Impact` ו־`Capacity`**.

‏שם נלמד לא רק כיצד השוק בוחר אותנו, אלא כיצד **אנחנו עצמנו משנים את השוק** כאשר גודל הפקודה, urgency או liquidity consumption מתחילים להיות משמעותיים.