# ‏שלב 39 — `Smart Routing` מול `Direct Routing`: מי מחליט לאן הפקודה נשלחת

> ‏מטרת הפרק: להבין כיצד פקודה עוברת מה־Execution Engine אל venue מסוים, מה ההבדל בין `Smart Order Routing` לבין `Direct Routing`, אילו trade-offs נוצרים סביב מחיר, latency, queue position, fill probability, fees/rebates ו־execution transparency, ואיך להחליט מה נכון למערכת קצרה מאוד בלי להניח שיותר שליטה תמיד טובה יותר.
>
> ‏העיקרון המרכזי: **Routing הוא חלק מה־Execution Policy. המטרה אינה לבחור venue “זול” או “מהיר” באופן מבודד, אלא למקסם את ה־expected net execution quality תחת האילוצים של האסטרטגיה.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. מהו `Routing`

‏כאשר אנחנו שולחים פקודת קנייה או מכירה, צריך להחליט **לאן** היא תישלח.

‏בשוק האמריקאי אותה מניה יכולה להיסחר ביותר מ־venue אחד.

‏לכן השאלה אינה רק:

```text
Buy 100 XYZ @ 25.10
```

‏אלא גם:

```text
Where should this order go?
```

---

# ‏2. מהו `Venue`

‏`Venue` הוא מקום מסחר שבו פקודות יכולות להיפגש.

‏קטגוריות אפשריות כוללות:

- ‏Exchange.
- ‏ECN או electronic venue.
- ‏ATS.
- ‏Dark / non-displayed venue.
- ‏Internalization destination אצל גורם ביצוע מסוים.

‏הפרטים המדויקים משתנים לפי ברוקר, חשבון, הרשאות ורגולציה.

---

# ‏3. למה יש בכלל כמה Venues

‏שוק המניות האמריקאי מפוצל.

‏אותו Symbol יכול להציג liquidity בכמה מקומות במקביל.

‏לכן ביצוע הוא בעיית routing.

---

# ‏4. `Smart Routing`

‏ב־`Smart Routing` אנחנו נותנים לברוקר או ל־router שלו להחליט לאן לשלוח את הפקודה.

‏ה־router עשוי להתחשב ב־:

- ‏מחיר.
- ‏Displayed liquidity.
- ‏Hidden liquidity.
- ‏Expected fill probability.
- ‏Fees.
- ‏Rebates.
- ‏Latency.
- ‏Historical execution quality.
- ‏Order type.
- ‏Order size.
- ‏Venue availability.

---

# ‏5. `Direct Routing`

‏ב־`Direct Routing` אנחנו מציינים במפורש יעד מסוים או routing instruction מסוים.

‏במקום:

```text
route = SMART
```

‏אנחנו מבקשים משהו בסגנון:

```text
route = VENUE_A
```

‏השמות והיכולות בפועל תלויים בברוקר.

---

# ‏6. ההבדל העקרוני

```text
Smart Routing:
Strategy -> Broker Router -> Venue(s)

Direct Routing:
Strategy -> Chosen Venue
```

‏ההבדל הוא מי מקבל את החלטת ה־venue.

---

# ‏7. `Smart` אינו אומר קסם

‏המילה `Smart` אינה מבטיחה שה־router ממקסם בדיוק את פונקציית המטרה שלנו.

‏הוא משתמש במדיניות של הברוקר.

‏ייתכן שהמדיניות טובה מאוד.

‏ייתכן גם שהיא אופטימלית ללקוח ממוצע ולא דווקא לאסטרטגיה של 5–30 שניות.

---

# ‏8. `Direct` אינו אומר טוב יותר

‏שליטה ישירה על venue נשמעת מקצועית יותר.

‏אבל אם אין לנו:

- ‏נתוני venue איכותיים.
- ‏מודל queue טוב.
- ‏latency מתאים.
- ‏הבנה של fee schedule.
- ‏monitoring.
- ‏routing logic.

‏אנחנו עלולים לבחור יעד גרוע יותר מ־Smart Router.

---

# ‏9. פונקציית המטרה האמיתית

‏Routing מקצועי צריך לנסות למקסם משהו כמו:

```text
Expected Net Execution Value
= Expected Signal Value
- Spread Cost
- Slippage
- Fees
- Market Impact
- Missed Opportunity
- Adverse Selection Cost
```

---

# ‏10. מחיר לבדו אינו מספיק

‏נניח שיש שני venues.

```text
Venue A ask = 10.01
Venue B ask = 10.01
```

‏המחיר נראה זהה.

‏אבל ייתכן שב־A יש 100 shares זמינות וב־B יש 10,000.

‏או שב־A latency נמוך יותר.

‏או שב־B יש hidden liquidity.

‏לכן displayed price אינו כל הסיפור.

---

# ‏11. `NBBO`

‏בארה״ב מקובל לדבר על `National Best Bid and Offer`.

‏הרעיון הוא best displayed bid/offer משוק מאוחד.

‏אבל אפילו אם אנחנו יודעים את ה־NBBO, עדיין איננו יודעים בהכרח:

- ‏איפה בדיוק נמצא כל ה־size.
- ‏איזו liquidity hidden.
- ‏כמה זמן היא תישאר.
- ‏איזה venue יתן fill בפועל.

---

# ‏12. Price Improvement

‏Router טוב עשוי למצוא ביצוע טוב יותר מהמחיר שהיינו מקבלים אילו היינו שולחים ישירות ליעד אחד.

‏זה נקרא לעיתים `Price Improvement`.

---

# ‏13. Fill Probability

‏ה־venue עם המחיר הטוב ביותר ברגע נתון אינו בהכרח ה־venue עם הסתברות ה־fill הטובה ביותר.

‏במערכת קצרה זה יכול להיות הבדל משמעותי.

---

# ‏14. Time to Fill

‏אנחנו צריכים למדוד:

```text
submit_time
ack_time
first_fill_time
full_fill_time
```

‏ומכאן:

```text
time_to_first_fill

time_to_full_fill
```

---

# ‏15. למה `Time to Fill` חשוב לרובוט שלנו

‏אם ה־Edge צפוי להתקיים רק 10 שניות, Order שקיבל Fill אחרי 8 שניות הוא עסקה אחרת לגמרי מ־Order שקיבל Fill אחרי 200ms.

---

# ‏16. Queue Position תלוי Venue

‏אם אנחנו שולחים Limit Order פסיבי, אנחנו נכנסים לתור **ב־venue מסוים**.

‏אין “queue position גלובלי”.

---

# ‏17. Smart Router ו־Queue Position

‏Router עשוי:

- ‏לשלוח venue אחד.
- ‏לנסות venue אחר.
- ‏לפצל quantity.
- ‏לבטל ולהעביר.
- ‏להשתמש ב־hidden destination.

‏כל אחד מהמהלכים משנה את queue dynamics.

---

# ‏18. `Cancel/Replace` בין Venues

‏מעבר מ־venue אחד לאחר כמעט תמיד משנה priority.

‏גם אם המחיר נשאר זהה.

---

# ‏19. Queue Reset Cost

‏צריך לחשוב על cancel/re-route כעל עלות.

```text
Re-route Cost
= lost queue priority
+ extra latency
+ message cost
+ stale decision risk
```

---

# ‏20. `Maker/Taker`

‏חלק מה־venues משתמשים במבני תמחור שבהם liquidity provider עשוי לקבל rebate ו־liquidity taker עשוי לשלם fee.

‏יש גם מודלים הפוכים ומבנים אחרים.

---

# ‏21. למה Rebates אינם Edge בפני עצמם

‏Rebate קטן אינו שווה הרבה אם:

- ‏ה־fill probability נמוך.
- ‏ה־queue ארוך.
- ‏אנחנו נבחרים דווקא כשהמחיר עומד לזוז נגדנו.
- ‏אנחנו מפספסים תנועה רווחית.

---

# ‏22. `Net Routing Economics`

‏צריך למדוד:

```text
Price Outcome
+ Rebate
- Fee
- Slippage
- Adverse Selection
- Opportunity Cost
```

‏ולא רק fee schedule.

---

# ‏23. Adverse Selection לפי Venue

‏ייתכן שב־venue מסוים נקבל fills בתדירות גבוהה דווקא כאשר informed flow מגיע מולנו.

‏לכן Fill Rate גבוה לבדו אינו מדד איכות.

---

# ‏24. `Post-Fill Markout`

‏נרצה למדוד אחרי fill:

```text
markout_100ms
markout_500ms
markout_1s
markout_5s
markout_10s
```

‏בהתאם לטווח האסטרטגיה.

---

# ‏25. Fill Quality

‏דוגמה למדד:

```text
ExecutionQuality =
PriceImprovement
- Fees
- AdverseMarkout
- OpportunityCost
```

‏זה conceptual, לא נוסחה אוניברסלית.

---

# ‏26. Aggressive Routing

‏כאשר הפקודה marketable, המטרה יכולה להיות למצוא liquidity זמינה במהירות תוך שמירה על price protection.

---

# ‏27. Passive Routing

‏כאשר אנחנו מוסיפים liquidity, השאלה היא איפה כדאי לעמוד.

‏השיקולים שונים לגמרי.

---

# ‏28. Passive Routing Objective

‏ב־passive execution נרצה לאזן:

```text
Queue Quality
Fill Probability
Rebate/Fee
Adverse Selection
Signal TTL
```

---

# ‏29. Aggressive Routing Objective

‏ב־aggressive execution נרצה לאזן:

```text
Immediate Liquidity
Price Protection
Latency
Market Impact
Residual Quantity
```

---

# ‏30. Split Routing

‏Order גדול יחסית עשוי להתחלק לכמה venues.

‏הרעיון:

```text
OrderQty = 500

Venue A -> 200
Venue B -> 150
Venue C -> 150
```

‏אבל זה מוסיף complexity.

---

# ‏31. למה Split אינו תמיד טוב

‏פיצול יוצר:

- ‏יותר child orders.
- ‏יותר callbacks.
- ‏יותר partial states.
- ‏יותר cancel races.
- ‏יותר reconciliation.

---

# ‏32. Parent Order ו־Child Orders

‏ארכיטקטורה טובה מפרידה בין:

```text
ExecutionIntent
ParentOrder
ChildOrder[]
BrokerOrder[]
Fill[]
```

---

# ‏33. Routing Decision הוא Event

‏צריך לשמור:

```text
routing_decision_id
parent_order_id
chosen_route
reason_code
decision_time
market_snapshot_id
policy_version
```

---

# ‏34. למה לשמור Reason Code

‏אחרי הפסד נרצה לדעת:

```text
Why did we route there?
```

‏תשובה טובה אינה:

```text
because SMART chose it
```

‏אלא metadata אמין ככל שהברוקר מאפשר.

---

# ‏35. Execution Transparency

‏Direct routing בדרך כלל נותן לנו יותר שליטה על היעד המבוקש.

‏Smart routing עשוי לתת פחות שקיפות על החלטת הביניים.

‏אבל יותר שקיפות אינה בהכרח ביצוע טוב יותר.

---

# ‏36. Routing Policy

‏נגדיר רכיב:

```text
IRoutingPolicy
```

‏הוא אינו חייב לבחור venue בפועל.

‏הוא יכול לבחור:

```text
SMART
DIRECT
PASSIVE_SMART
AGGRESSIVE_SMART
DIRECT_IF_CAPABLE
```

---

# ‏37. Broker Capability

‏לא כל broker מאפשר כל route או כל order type בכל venue.

‏לכן routing חייב לעבור Capability Check.

---

# ‏38. Capability Matrix

‏לדוגמה:

```text
RoutePolicy | Limit | IOC | PostOnly | Midpoint | Direct
--------------------------------------------------------
SMART       | yes   | ?   | ?        | ?        | no
VENUE_A     | yes   | yes | yes      | no       | yes
```

‏הטבלה האמיתית היא broker/version/account specific.

---

# ‏39. `RoutingIntent`

‏במקום לקשור Strategy לשם venue:

```text
RouteTo("XYZ")
```

‏עדיף לייצג intent:

```text
RoutingIntent
{
    urgency,
    passive_or_aggressive,
    max_price,
    ttl,
    allow_split,
    route_policy
}
```

---

# ‏40. Strategy אינה צריכה לדעת Venue Names

‏ה־Strategy צריכה לומר:

```text
I need aggressive entry with price protection.
```

‏לא:

```text
Send to venue X.
```

‏אלא אם routing עצמו הוא חלק מפורש מה־strategy research.

---

# ‏41. Execution Engine מתרגם Intent

```text
Strategy
  ↓
Execution Intent
  ↓
Routing Policy
  ↓
Broker Adapter
  ↓
Broker / Venue
```

---

# ‏42. Direct Routing כ־Optimization Layer

‏רק אחרי שיש evidence ש־direct route מסוים מוסיף value, יש סיבה להפוך אותו ל־policy.

---

# ‏43. Smart Routing כ־Baseline

‏למחקר ראשון, Smart Routing יכול להיות baseline שימושי כי הוא מפחית complexity.

‏אבל צריך למדוד אותו.

---

# ‏44. `Baseline First`

‏גישה בריאה:

```text
Baseline = Smart Router
Challenger = Direct/Custom Policy
```

‏ואז להשוות.

---

# ‏45. מה להשוות

‏לכל route policy:

- ‏Fill Rate.
- ‏Partial Fill Rate.
- ‏Time to First Fill.
- ‏Time to Full Fill.
- ‏Effective Spread.
- ‏Slippage.
- ‏Fees/Rebates.
- ‏Post-Fill Markout.
- ‏Missed Opportunity.
- ‏Net PnL contribution.

---

# ‏46. `Effective Spread`

‏אפשר למדוד את המחיר שבוצע ביחס ל־mid או benchmark אחר בזמן ההחלטה.

‏ההגדרה צריכה להיות עקבית במחקר.

---

# ‏47. Benchmark Consistency

‏אם משווים routes, צריך להשתמש באותו benchmark.

‏אחרת ההשוואה אינה הוגנת.

---

# ‏48. Arrival Price

‏Benchmark אפשרי:

```text
mid at routing decision time
```

‏או benchmark אחר שהוגדר מראש.

---

# ‏49. Decision Time מול Submit Time

‏במערכת קצרה חשוב להפריד:

```text
signal_time
routing_decision_time
submit_time
ack_time
fill_time
```

---

# ‏50. Router Latency

‏גם ה־router עצמו מוסיף זמן.

‏צריך למדוד end-to-end ולא להניח שהוא אפס.

---

# ‏51. Venue Latency

‏המסלול עד venue מסוים יכול להיות שונה.

‏אבל מה שאנחנו באמת מודדים הוא התוצאה שקיבלנו דרך הברוקר.

---

# ‏52. Client Perspective

‏לרובוט אישי, latency שאינו observable מהצד שלנו אינו צריך להפוך לסיפור תיאורטי.

‏נמדוד את מה שניתן למדוד:

```text
submit -> ack
submit -> first fill
submit -> full fill
```

---

# ‏53. Routing and Signal Decay

‏אם route מסוים איטי יותר, ייתכן שה־signal כבר נחלש בזמן fill.

---

# ‏54. Score at Fill

‏נשמור:

```text
score_at_signal
score_at_submit
score_at_first_fill
score_at_full_fill
```

---

# ‏55. Rank at Fill

‏כנ״ל:

```text
rank_at_signal
rank_at_submit
rank_at_fill
```

‏אם Rank #1 הפך ל־Rank #80 עד fill, routing quality חייב להיבחן בהקשר הזה.

---

# ‏56. Venue Fragmentation

‏Displayed liquidity יכולה להיות מפוצלת בין venues.

‏Direct routing ליעד יחיד עלול להתעלם מחלק מהשוק.

---

# ‏57. Smart Router יכול לאסוף Liquidity

‏אחד היתרונות האפשריים של router חכם הוא גישה לכמה destinations לפי מדיניותו.

---

# ‏58. אבל Smart Router אינו Observable במלואו

‏ייתכן שלא נקבל את כל הלוגיקה הפנימית שלו.

‏לכן נמדוד outputs.

---

# ‏59. Outcome-Based Evaluation

‏במקום לשאול:

```text
Was the router clever?
```

‏נשאל:

```text
Did this routing policy improve net execution quality?
```

---

# ‏60. Venue-Specific Fill Model

‏אם יש לנו מספיק data, ניתן לבנות estimates שונים לפי venue.

‏לדוגמה:

```text
P(fill within 1s | venue, spread, depth, imbalance, queue_estimate)
```

---

# ‏61. לא לבנות מודל מוקדם מדי

‏בלי מספיק samples, venue-specific optimization יכולה להיות Overfitting.

---

# ‏62. Sample Fragmentation

‏אם יש 12 venues ומעט עסקאות, כל venue מקבל מעט observations.

‏התוצאה יכולה להיות noisy מאוד.

---

# ‏63. Routing Overfitting

‏דוגמה:

```text
Venue X looked best last month
```

‏זה לא מספיק.

‏ייתכן שזה noise, regime או sample composition.

---

# ‏64. Controlled Experiment

‏נחבר לשלב 24:

```text
Control = SMART
Treatment = Direct Policy A
```

‏ונקפיא את שאר הפרמטרים.

---

# ‏65. Shadow Routing Experiment

‏אפשר לחשב routing challenger ב־Shadow בלי לשלוח אליו פקודות אמיתיות.

‏כך נוכל לראות מה הוא היה בוחר.

---

# ‏66. Counterfactual Limitation

‏אבל חשוב:

‏אי אפשר תמיד לדעת בדיוק מה היה ה־fill אילו שלחנו venue אחר.

‏עצם נוכחות הפקודה שלנו הייתה יכולה לשנות את התוצאה.

---

# ‏67. Market Impact

‏בכמויות קטנות יחסית impact יכול להיות קטן, אבל אסור להניח שהוא תמיד אפס.

---

# ‏68. Routing לפי Size

‏Policy יכולה להשתנות לפי quantity.

‏Order קטן ו־Order גדול אינם אותו execution problem.

---

# ‏69. Routing לפי Liquidity

‏במניה עמוקה מאוד אפשר להרשות tactics שונות ממניה דקה.

---

# ‏70. Routing לפי Spread

‏Spread של tick אחד לעומת spread רחב משנה את economics.

---

# ‏71. Routing לפי Signal Strength

‏Signal חזק וקצר־חיים עשוי להצדיק יותר urgency.

‏Signal חלש יותר יכול להצדיק passive attempt.

---

# ‏72. Routing לפי Holding Horizon

‏אם היעד הוא 5 שניות, 2 שניות של המתנה הן משמעותיות מאוד.

‏אם היעד הוא שעה, הן כמעט זניחות.

---

# ‏73. Routing לפי Regime

‏Opening burst, midday ו־closing activity יכולים לדרוש execution behavior שונה.

---

# ‏74. Fast Market

‏ב־fast market displayed quotes יכולים להשתנות במהירות.

‏Direct route שנבחר לפי snapshot ישן עלול כבר לא להיות רלוונטי כשהפקודה מגיעה.

---

# ‏75. Stale Routing Decision

‏נגדיר:

```text
routing_decision_age
```

‏אם הוא חורג מ־TTL, עושים re-evaluation לפני submit.

---

# ‏76. Route TTL

‏גם routing decision צריך TTL.

‏לא רק signal.

---

# ‏77. Pre-Submit Recheck

‏לפני שליחה:

- ‏ה־symbol עדיין tradable?
- ‏ה־quote fresh?
- ‏המחיר עדיין בתוך protection?
- ‏ה־signal עדיין alive?
- ‏ה־route עדיין supported?

---

# ‏78. Re-route Budget

‏נגדיר מגבלה למספר re-routes.

‏אחרת המערכת יכולה לרדוף אחרי liquidity בלי סוף.

---

# ‏79. Message Budget

‏Cancel/replace/reroute צורכים messages ועלולים לפגוש pacing/rate limits.

---

# ‏80. Routing Backpressure

‏כאשר המערכת עמוסה, routing decisions ישנים עלולים להגיע מאוחר מדי.

‏צריך למדוד queue age.

---

# ‏81. Routing Queue

‏Metric חשוב:

```text
routing_queue_depth
routing_queue_oldest_age_ms
```

---

# ‏82. Venue Availability

‏יעד יכול להיות זמנית unavailable או unsupported.

‏צריך fallback policy.

---

# ‏83. Fallback Routing

‏דוגמה:

```text
DIRECT_A
  ↓ unavailable
SMART
```

‏אבל fallback חייב לשמר price protection.

---

# ‏84. Fallback אינו Retry עיוור

‏לפני fallback צריך לשאול:

```text
Is the original intent still valid?
```

---

# ‏85. Route Capability Failure

‏אם route לא תומך ב־order type, לא “נאלתר” בשקט.

‏נחזיר reason code.

---

# ‏86. `ROUTE_UNSUPPORTED`

‏Reason codes אפשריים:

```text
ROUTE_UNSUPPORTED
VENUE_UNAVAILABLE
ROUTING_DECISION_STALE
PRICE_PROTECTION_FAILED
NO_EXECUTABLE_LIQUIDITY
ROUTING_BUDGET_EXHAUSTED
```

---

# ‏87. `NO TRADE` גם כאן

‏אם אין route שעומד ב־constraints שלנו, התוצאה יכולה להיות:

```text
NO TRADE
```

‏זו החלטה לגיטימית.

---

# ‏88. Routing ולא Chasing

‏אין חובה לעבור venue רק כי ה־fill לא הגיע מיד.

‏צריך להבחין בין intelligent re-routing לבין chasing.

---

# ‏89. Queue Preservation

‏לפעמים עדיף להישאר בתור טוב מאשר לעבור למקום שנראה כרגע מעט טוב יותר.

---

# ‏90. Queue Opportunity Cost

‏מצד שני, תור טוב במחיר שכבר אינו רלוונטי אינו נכס.

---

# ‏91. Passive Routing Decision

‏אפשר לחשוב על:

```text
StayValue
vs
ReRouteValue
vs
CrossValue
vs
CancelValue
```

---

# ‏92. Dynamic Routing

‏Routing policy יכולה להשתנות בזמן שה־order עובד.

‏אבל כל שינוי חייב להיות מוגבל ומדיד.

---

# ‏93. Smart Router as Black Box

‏אם משתמשים ב־SMART, נתייחס אליו כאל component חיצוני.

‏נמדוד:

- ‏inputs.
- ‏instructions.
- ‏broker events.
- ‏fills.
- ‏costs.
- ‏markouts.

---

# ‏94. Direct Router as Our Responsibility

‏ברגע שאנחנו בוחרים venue בעצמנו, אנחנו לוקחים אחריות נוספת על:

- ‏venue selection.
- ‏fallbacks.
- ‏queue behavior.
- ‏capabilities.
- ‏monitoring.
- ‏RCA.

---

# ‏95. Complexity Tax

‏Direct routing צריך להצדיק את המורכבות שהוא מוסיף.

---

# ‏96. Complexity-Adjusted Edge

‏אפשר לחשוב:

```text
Net Benefit
= Execution Improvement
- Operational Complexity Cost
- Failure Risk
- Maintenance Cost
```

---

# ‏97. Routing and Reliability

‏Policy מעט פחות אופטימלית אך אמינה יכולה להיות עדיפה על custom router מורכב ושביר.

---

# ‏98. Routing and Replay

‏Replay צריך לשמור routing decisions.

‏אם router שלנו דטרמיניסטי, אותם inputs צריכים לתת אותה החלטה.

---

# ‏99. External Smart Router Replay

‏לא תמיד נוכל לשחזר את האלגוריתם הפנימי של הברוקר.

‏לכן Replay שלו יתמקד ב־observed outputs.

---

# ‏100. Routing Decision Ledger

```text
RoutingDecision
{
  decision_id,
  parent_order_id,
  decision_time,
  symbol,
  side,
  quantity,
  policy,
  selected_destination,
  urgency,
  market_snapshot_id,
  quote_age_ms,
  score,
  rank,
  signal_age_ms,
  reason_code,
  policy_version
}
```

---

# ‏101. Fill Ledger

‏נחבר Fill ל־routing decision.

```text
routing_decision_id -> broker_order_id -> execution_id
```

---

# ‏102. Route Attribution

‏בסוף העסקה נרצה attribution:

```text
Signal Edge
Execution Delay
Routing Delay
Price Cost
Fee/Rebate
Adverse Markout
Missed Quantity
```

---

# ‏103. `Venue Markout`

‏נשווה markout לפי destination.

‏אבל רק עם sample size סביר.

---

# ‏104. `Venue Fill Rate`

‏נמדוד:

```text
fill_rate_by_venue
partial_fill_rate_by_venue
```

---

# ‏105. `Venue Time to Fill`

```text
p50_time_to_fill
p95_time_to_fill
p99_time_to_fill
```

---

# ‏106. Tail Matters

‏במערכת של שניות, p99 יכול להיות חשוב יותר מהממוצע.

---

# ‏107. Routing by Symbol

‏ייתכן ש־venue אחד עובד טוב יותר לקבוצה מסוימת של securities.

‏אבל צריך להיזהר מ־overfitting לפי symbol.

---

# ‏108. Routing by Price Bucket

‏Stocks במחירים שונים יכולים להציג tick economics שונים.

---

# ‏109. Routing by Spread Bucket

‏ננתח למשל:

```text
1 tick
2 ticks
3+ ticks
```

‏אם זה מתאים לנתונים.

---

# ‏110. Routing by Liquidity Bucket

‏נבדיל בין liquid, medium ו־thin לפי metrics שלנו, לא לפי תחושה.

---

# ‏111. Routing by Time of Day

‏פתיחה וסגירה יכולות להיראות שונה מאוד מ־midday.

---

# ‏112. Routing by Regime

‏נחבר לשלב 25.

‏אבל regime routing חייב להיבדק out-of-sample.

---

# ‏113. Routing Policy Versioning

‏כל שינוי במדיניות מקבל version.

```text
routing_policy_version = 7
```

---

# ‏114. Why Versioning Matters

‏אחרת לא נדע אם שינוי ב־fill quality נגרם מהשוק או מהקוד.

---

# ‏115. Config Hash

‏נשמור גם hash של config רלוונטי.

---

# ‏116. Feature Flags

‏Routing challenger חדש יכול להתחיל ב־Shadow.

---

# ‏117. Canary Routing

‏במערכת production עתידית, אפשר להקצות fraction קטן של eligible intents למדיניות challenger לצורכי מדידה מבוקרת.

‏כל שימוש בכסף אמיתי דורש בקרות סיכון מתאימות.

---

# ‏118. Champion/Challenger

```text
Champion = current routing policy
Challenger = new routing policy
```

---

# ‏119. Promotion Criteria

‏Challenger לא מקודם רק כי:

```text
PnL higher
```

‏הוא צריך לעבור scorecard רחב.

---

# ‏120. Routing Scorecard

‏נבדוק:

- ‏Net execution cost.
- ‏Fill probability.
- ‏Time to fill.
- ‏Slippage.
- ‏Markout.
- ‏Missed opportunity.
- ‏Operational failure rate.
- ‏Tail latency.
- ‏Stability across regimes.

---

# ‏121. Statistical Significance

‏פער קטן בין routes יכול להיות noise.

‏נשתמש בעקרונות משלב 24.

---

# ‏122. Economic Significance

‏גם אם הפער statistically significant, צריך לשאול אם הוא גדול מספיק כדי להצדיק complexity.

---

# ‏123. Routing and Sample Dependence

‏Executions רצופים באותו יום אינם בהכרח independent samples.

---

# ‏124. Block Analysis

‏נבחן stability לפי ימים/שבועות/regimes.

---

# ‏125. Leave-One-Group-Out

‏אפשר לבדוק אם superiority של route נעלמת כשמסירים קבוצת symbols או ימים מסוימים.

---

# ‏126. Best Venue Fallacy

‏אין בהכרח venue אחד שהוא “הכי טוב”.

‏יכול להיות best destination מותנה ב־context.

---

# ‏127. But Context Explosion Is Dangerous

‏אם נבנה rule לכל שילוב של:

```text
symbol x time x spread x regime x size x side
```

‏נקבל overfitting.

---

# ‏128. Start Simple

‏נעדיף policy פשוט עם evidence ברור.

---

# ‏129. Routing Policy Ladder

‏אפשר להתקדם:

```text
R0 = SMART baseline
R1 = SMART + urgency classes
R2 = simple direct challenger
R3 = context-aware routing
R4 = learned routing model
```

‏רק אם כל שלב מצדיק את הבא.

---

# ‏130. Learned Routing

‏ברמה מתקדמת ניתן לראות routing כבעיה של prediction/optimization.

‏אבל היא דורשת data איכותי מאוד.

---

# ‏131. Target Leakage ברouting Model

‏גם כאן אפשר ליפול ל־leakage.

‏אסור להשתמש במידע שהגיע אחרי routing decision כחלק מה־features.

---

# ‏132. Selection Bias

‏אנחנו רואים fills רק במסלולים שבחרנו בעבר.

‏לכן dataset של routing הוא counterfactual problem קשה.

---

# ‏133. Missing Counterfactual

‏אם שלחנו ל־A וקיבלנו Fill, איננו יודעים בוודאות מה היה קורה ב־B.

---

# ‏134. Exploration Problem

‏כדי ללמוד routes חדשים צריך exploration.

‏אבל exploration בכסף אמיתי הוא risk.

‏לכן מתחילים ב־simulation/shadow ככל האפשר.

---

# ‏135. Broker Smart Router Can Be a Strong Baseline

‏לפני שבונים custom routing, צריך להוכיח שהמערכת שלנו באמת משפרת משהו.

---

# ‏136. Direct Routing and Market Knowledge

‏Direct routing שימושי רק אם אנחנו מבינים:

- ‏market structure.
- ‏venue behavior.
- ‏order type semantics.
- ‏fees.
- ‏data limitations.

---

# ‏137. Direct Routing and Data Dependency

‏אם החלטת venue מסתמכת על book data שאין לנו בזמן אמת, היא אינה implementable.

---

# ‏138. Decision/Data Parity

‏אותם data fields ששימשו במחקר routing חייבים להיות זמינים live.

---

# ‏139. Venue-Specific Data Quality

‏אם feed חסר destination מסוים, אי אפשר לטעון שאנחנו עושים venue optimization מלא.

---

# ‏140. Consolidated vs Direct Feed

‏Consolidated data ו־direct feeds יכולים להציג תמונה שונה מבחינת latency ועומק.

‏Routing policy חייבת לדעת איזה מידע באמת יש לה.

---

# ‏141. Data Freshness Gate

‏אם routing input stale:

```text
DO NOT ROUTE
```

‏או fallback מוגדר מראש.

---

# ‏142. Broker Quote Validation

‏אם Market Data מגיע מספק חיצוני, אפשר לבצע final validation מול broker עבור candidate מצומצם.

---

# ‏143. Cross-Provider Divergence

‏אם quote חיצוני וה־broker quote שונים משמעותית, צריך reasoned policy.

---

# ‏144. Routing Under Divergence

‏אפשר:

- ‏לחסום Entry.
- ‏להקטין urgency.
- ‏לדרוש refresh.
- ‏לעבור ל־NO TRADE.

‏לא לנחש.

---

# ‏145. Routing and Trading Halts

‏במצבי halt/resume routing behavior יכול להשתנות.

‏נלמד על כך לעומק בשלב 43.

---

# ‏146. Routing and Auctions

‏Opening/Closing auctions הן execution environments שונים.

‏נלמד אותן בשלב 42.

---

# ‏147. Routing to Dark/Hidden Liquidity

‏קיימים venues שבהם liquidity אינה מוצגת באותה צורה כמו lit book.

‏נלמד אותם לעומק בשלב 40.

---

# ‏148. Midpoint Routing

‏Midpoint execution עשוי לשפר price במצבים מסוימים, אבל fill probability ו־availability שונים.

---

# ‏149. Routing and Information Leakage

‏עצם שליחת order יכולה לחשוף intent לשוק במידה מסוימת.

‏זה חלק מ־execution quality.

---

# ‏150. Child Order Footprint

‏יותר מדי child orders או cancel/replace יכולים לייצר footprint גדול יותר.

---

# ‏151. Over-Routing

‏אלגוריתם שמחליף venue בתדירות גבוהה עלול:

- ‏לאבד queue.
- ‏לצרוך message budget.
- ‏להגדיל latency.
- ‏להפוך noisy.

---

# ‏152. Under-Routing

‏מצד שני, להישאר venue אחד כשיש liquidity טובה יותר במקום אחר יכול להגדיל missed opportunity.

---

# ‏153. Re-route Trigger

‏Trigger אפשרי צריך להיות מבוסס על change משמעותי:

```text
price change
queue deterioration
signal urgency increase
liquidity disappearance
TTL nearing expiry
```

---

# ‏154. Re-route Hysteresis

‏נשתמש ב־hysteresis כדי למנוע ping-pong בין destinations.

---

# ‏155. Route Cooldown

‏ייתכן שנרצה minimum time בין routing changes.

‏צריך לבדוק אמפירית.

---

# ‏156. Route Decision Confidence

‏אפשר לשמור:

```text
routing_confidence
```

‏אבל לא להפוך confidence מדומיין למספר מדויק ללא calibration.

---

# ‏157. Policy Rules מול Score

‏Routing יכול להיות rule-based או score-based.

‏לגרסה ראשונה rule-based לרוב קל יותר להסביר ולבדוק.

---

# ‏158. Venue Score Concept

‏דוגמה conceptual:

```text
VenueScore =
  w1 * fill_probability
- w2 * expected_slippage
- w3 * expected_adverse_markout
- w4 * expected_latency
- w5 * expected_fee
```

‏לא נוסחה מוכנה ל־Production.

---

# ‏159. Score Units Problem

‏אין לערבב metrics ביחידות שונות בלי normalization/calibration.

---

# ‏160. Expected Cost in Basis Points

‏אפשר לתרגם מרכיבים ל־bps כדי לקבל scale משותף, בזהירות.

---

# ‏161. Expected Opportunity Cost

‏גם no-fill צריך להיכנס ל־expected cost.

---

# ‏162. Fill Probability Calibration

‏נבדוק:

```text
predicted 70% fill probability
```

‏האם באמת מתמלא בערך 70% לאורך sample מתאים.

---

# ‏163. Route Stability

‏אם route “הכי טוב” מתחלף כל כמה מילישניות, ייתכן שהמודל noisy מדי לשימוש שלנו.

---

# ‏164. Decision Latency Budget

‏Routing intelligence שאורך יותר מדי זמן יכול לאכול את כל ה־edge.

---

# ‏165. KISS Rule

‏אם Smart Router נותן תוצאה טובה מספיק, לא מוסיפים custom router רק כדי להיות מתוחכמים.

---

# ‏166. Execution Edge vs Routing Edge

‏נפריד:

```text
Signal Edge
Execution Tactic Edge
Routing Edge
```

---

# ‏167. Routing Edge Must Be Incremental

‏Routing custom טוב רק אם הוא מוסיף value **מעל** execution policy הקיימת.

---

# ‏168. Full Pipeline Evaluation

```text
Signal
→ Entry Intent
→ Routing Decision
→ Order
→ Fill
→ Exit
→ Net Outcome
```

---

# ‏169. Entry Routing מול Exit Routing

‏לא בהכרח אותה policy.

---

# ‏170. Exit Can Be More Urgent

‏כאשר thesis נשבר, cost של no-fill יכול להיות גבוה יותר.

---

# ‏171. Emergency Exit Routing

‏Safety path צריך להיות פשוט יותר מה־normal optimization path.

---

# ‏172. Safety Overrides Routing

‏אם `EXIT_ONLY` פעיל, routing optimization לעולם לא יעקוף Safety constraints.

---

# ‏173. Kill Switch Integration

‏Kill switch יכול:

- ‏לחסום child orders חדשים.
- ‏לבטל passive entries.
- ‏לאפשר risk-reducing exits.

---

# ‏174. Broker Disconnect During Routing

‏אם disconnect מתרחש אחרי submit, יש `UNKNOWN_EFFECT` עד reconciliation.

---

# ‏175. Never Blindly Retry

‏לא שולחים שוב child order רק כי לא התקבל ACK.

---

# ‏176. Idempotent Routing Commands

‏Routing engine צריך correlation/idempotency keys.

---

# ‏177. Parent Order Invariant

‏סכום child fills לא יכול לחרוג מה־parent quantity המותרת.

---

# ‏178. Pending Exposure

‏כל child order working נחשב exposure אפשרי.

---

# ‏179. Duplicate Route Protection

‏לפני יצירת child חדש:

```text
reconcile outstanding children
```

---

# ‏180. Routing State Machine

‏דוגמה:

```text
PLANNED
ROUTING
SUBMITTED
WORKING
PARTIALLY_FILLED
REROUTING
FILLED
CANCELLED
REJECTED
UNKNOWN
```

---

# ‏181. State Explosion Warning

‏לא חייבים State Machine מפלצתית אחת.

‏אפשר להפריד Parent State ו־Child State.

---

# ‏182. Routing Observability

‏Dashboard צריך להראות:

- ‏route distribution.
- ‏fill rates.
- ‏latency.
- ‏slippage.
- ‏markout.
- ‏rejects.
- ‏fallbacks.
- ‏unknown states.

---

# ‏183. Route Distribution Drift

‏אם Smart Router פתאום שולח יותר אחוזים ליעד מסוים, כדאי לזהות זאת.

---

# ‏184. Fill Quality Drift

‏Venue שהיה טוב בעבר יכול להידרדר.

---

# ‏185. Fee Schedule Drift

‏Fees/Rebates יכולים להשתנות.

‏לא מקבעים אותם בקוד לנצח.

---

# ‏186. Capability Drift

‏ברוקר יכול לשנות order support או routing capabilities.

---

# ‏187. Routing Contract Tests

‏נבדוק:

- ‏supported routes.
- ‏supported order types.
- ‏error behavior.
- ‏fallback behavior.
- ‏reconnect behavior.

---

# ‏188. Simulation Tests

‏נבנה scenarios:

```text
best venue disappears before submit
partial fill then venue unavailable
cancel ack delayed
price protection violated
smart router rejects instruction
```

---

# ‏189. Property Test — No Overfill

```text
sum(child_fill_qty) <= authorized_parent_qty
```

‏תמיד.

---

# ‏190. Property Test — Price Protection

‏Fill לא אמור לחרוג מה־policy protection כפי שהוגדרה, אלא אם policy מפורשת מאפשרת אחרת.

---

# ‏191. Property Test — Safety Dominance

‏Safety state גובר על routing policy.

---

# ‏192. Property Test — Stale Intent

‏Order Intent שפג תוקפו לא מייצר child order חדש.

---

# ‏193. Golden Routing Scenarios

‏נחזיק dataset קטן עם expected routing decisions.

---

# ‏194. Deterministic Policy

‏אותם inputs + אותה policy version צריכים להחזיר אותה routing decision, כל עוד אין stochastic policy מכוונת.

---

# ‏195. Randomized Policy

‏אם בעתיד יש exploration, seed חייב להיות מתועד.

---

# ‏196. Replay

‏Replay יכול לבדוק custom routing logic שלנו.

‏הוא לא יכול לשחזר בוודאות router פנימי לא מתועד של broker.

---

# ‏197. Shadow Routing

‏אפשר להפעיל challenger במקביל:

```text
actual = SMART
shadow = DIRECT_POLICY_V2
```

‏ולשמור את ההחלטה האלטרנטיבית.

---

# ‏198. Counterfactual Fill Caveat

‏לא נרשום “shadow route would definitely fill”.

‏נרשום estimate.

---

# ‏199. Confidence Bands

‏Counterfactual execution יכול להחזיר טווח:

```text
optimistic
base
conservative
```

---

# ‏200. Routing RCA

‏כאשר execution נכשל, נבדוק:

1. ‏האם ה־route היה valid?
2. ‏האם data הייתה fresh?
3. ‏האם destination היה available?
4. ‏האם queue estimate היה סביר?
5. ‏האם signal decay הפך את ההחלטה ללא רלוונטית?
6. ‏האם fallback הופעל?
7. ‏האם cost היה גדול מהצפוי?

---

# ‏201. Routing Failure Taxonomy

```text
RF_DATA_STALE
RF_ROUTE_UNAVAILABLE
RF_CAPABILITY_MISMATCH
RF_QUEUE_MIS_ESTIMATE
RF_FILL_TOO_SLOW
RF_EXCESS_SLIPPAGE
RF_ADVERSE_MARKOUT
RF_REQUOTE_CHURN
RF_FALLBACK_FAILURE
RF_BROKER_REJECT
RF_UNKNOWN_EFFECT
```

---

# ‏202. Routing Success Taxonomy

‏גם הצלחות ננתח.

```text
RS_PRICE_IMPROVEMENT
RS_FAST_FILL
RS_LOW_MARKOUT
RS_QUEUE_CAPTURE
RS_LOW_NET_COST
```

---

# ‏203. למה Success RCA חשוב

‏אחרת לא נדע מה באמת עובד.

---

# ‏204. Route Contribution to Net PnL

‏נרצה להפריד עד כמה שאפשר:

```text
strategy selection
entry tactic
routing
exit tactic
costs
```

---

# ‏205. Routing and Capacity

‏Policy שטובה ל־50 shares לא בהכרח טובה ל־5,000.

---

# ‏206. Capacity Curve

‏נבחן execution quality כפונקציה של quantity relative to liquidity.

---

# ‏207. Participation Rate

‏גם routing יכול להיות מושפע מכמה מה־available flow אנחנו מנסים לקחת.

---

# ‏208. Personal Robot Reality

‏במערכת קטנה יחסית, היתרון שלנו אינו להיות HFT router.

‏היתרון יכול להיות:

- ‏ארכיטקטורה פשוטה.
- ‏מדידה נכונה.
- ‏price protection.
- ‏תגובה מהירה מספיק.
- ‏הימנעות מעסקאות שבהן execution quality גרועה.

---

# ‏209. אל תנסה לנצח HFT במגרש שלו

‏אם edge דורש microsecond venue arbitration, זה כנראה לא edge מתאים למערכת שלנו.

---

# ‏210. Latency Edge vs Decision Edge

‏הרובוט שלנו צריך לחפש edge שעדיין קיים אחרי latency מציאותי.

---

# ‏211. Research Question ראשון

‏לפני custom direct routing:

```text
Does SMART execution already preserve enough edge?
```

---

# ‏212. Research Question שני

```text
Where exactly does SMART lose value?
```

‏רק אז בונים challenger.

---

# ‏213. Research Question שלישי

```text
Can a simpler direct rule improve that specific failure mode?
```

---

# ‏214. לא לפתור בעיה שלא קיימת

‏אם routing אינו bottleneck, נשפר קודם משהו אחר.

---

# ‏215. Execution Bottleneck Analysis

‏נשווה:

```text
Signal Loss
Decision Latency Loss
Routing Loss
Fill Loss
Exit Loss
```

---

# ‏216. Baseline לרובוט שלנו

‏גרסה ראשונה סבירה למחקר:

```text
1. Use provider-agnostic market data.
2. Rank the whole market.
3. Revalidate the chosen candidate.
4. Create execution intent.
5. Use SMART as baseline routing where supported.
6. Enforce marketable-limit price protection when aggressive.
7. Measure full execution telemetry.
8. Build direct-routing challengers only from measured failure modes.
```

---

# ‏217. למה SMART כ־Baseline ולא כדת

‏כי הוא מפחית complexity בתחילת המחקר.

‏אם data מוכיחה ש־custom routing מוסיף value, נתקדם.

---

# ‏218. Direct Routing Candidate Use Cases

‏בעתיד ייתכנו מצבים שבהם נרצה לבדוק direct routing:

- ‏queue behavior עקבי ב־venue מסוים.
- ‏specific order capability.
- ‏measured fill-quality advantage.
- ‏operational requirement.

‏אבל כל אחד דורש evidence.

---

# ‏219. Anti-Pattern — Fee Chasing

‏לא לבחור venue רק בגלל rebate.

---

# ‏220. Anti-Pattern — Lowest Latency Wins

‏Latency נמוך בלי liquidity או price quality אינו בהכרח טוב.

---

# ‏221. Anti-Pattern — Biggest Displayed Size Wins

‏Displayed size יכול להשתנות או לא לשקף hidden dynamics.

---

# ‏222. Anti-Pattern — One Best Venue

‏אין להניח שיש destination אחד שתמיד עדיף.

---

# ‏223. Anti-Pattern — Touch Means Fill

‏כבר למדנו בשלב 38 שזה שגוי.

---

# ‏224. Anti-Pattern — Every No-Fill Means Re-route

‏לפעמים no-fill הוא התוצאה הנכונה.

---

# ‏225. Anti-Pattern — Re-route Forever

‏Signal יכול למות.

‏בשלב מסוים התוצאה הנכונה היא Cancel.

---

# ‏226. Anti-Pattern — Ignore Exit Routing

‏Exit execution חשוב לפחות כמו Entry execution.

---

# ‏227. Anti-Pattern — Ignore Broker Behavior

‏Order instruction תאורטי אינו מספיק.

‏צריך לבדוק איך הברוקר באמת מטפל בו.

---

# ‏228. Anti-Pattern — Hidden Manual Logic

‏אם operator בוחר venue ידנית, הפעולה צריכה להיכנס ל־audit trail.

---

# ‏229. Anti-Pattern — Unversioned Routing Rules

‏אחרת לא נוכל לעשות RCA או compare runs.

---

# ‏230. Best Practice — Separate Intent from Destination

‏ה־Strategy מגדירה urgency ו־constraints.

‏Routing policy בוחרת destination strategy.

---

# ‏231. Best Practice — Measure Net Outcome

‏לא רק fee.

‏לא רק fill rate.

‏לא רק latency.

‏אלא outcome משולב.

---

# ‏232. Best Practice — Preserve Price Protection

‏גם fallback וגם re-route חייבים לכבד את גבולות המחיר.

---

# ‏233. Best Practice — Treat Unknown Explicitly

‏אם איננו יודעים אם child order קיים, לא יוצרים חדש אוטומטית.

---

# ‏234. Best Practice — Reconcile Before Resume

‏במיוחד אחרי reconnect.

---

# ‏235. Best Practice — Route with Fresh Data

‏Routing על snapshot ישן הוא optimization של שוק שכבר איננו קיים.

---

# ‏236. Best Practice — Keep Policy Explainable

‏בכל החלטה נרצה Reason Code.

---

# ‏237. Best Practice — Shadow Before Promotion

‏Direct/custom routing מתחיל ב־Shadow ככל האפשר.

---

# ‏238. Best Practice — Stress Tail Scenarios

‏לא לבדוק רק יום רגיל.

‏נבדוק bursts, widening spreads, feed delay ו־broker degradation.

---

# ‏239. Best Practice — Keep an Escape Hatch

‏אם custom routing נכשל, fallback מוגדר היטב צריך להיות זמין אם הוא בטוח ורלוונטי.

---

# ‏240. Best Practice — Simplicity Wins Until Evidence Says Otherwise

‏Routing מורכב אינו יעד בפני עצמו.

---

# ‏241. Checklist — לפני Routing Decision

- ‏האם ה־signal עדיין valid?
- ‏האם quote fresh?
- ‏האם instrument mapping תקין?
- ‏האם broker ready?
- ‏האם risk authorization עדיין תקפה?
- ‏האם price protection תקף?
- ‏האם route supported?
- ‏האם routing budget זמין?

---

# ‏242. Checklist — בזמן Order Working

- ‏האם queue estimate הידרדר?
- ‏האם המחיר זז?
- ‏האם signal נחלש?
- ‏האם partial fill התקבל?
- ‏האם cancel/re-route באמת מוצדק?
- ‏האם working quantity עדיין ידועה?

---

# ‏243. Checklist — אחרי Fill

- ‏מה היה time to fill?
- ‏מה היה slippage?
- ‏מה היו fees/rebates?
- ‏מה היה post-fill markout?
- ‏האם candidate עדיין היה חזק בזמן fill?
- ‏כמה edge נשאר?

---

# ‏244. Checklist — אחרי No Fill

- ‏האם המחיר הגיע אלינו?
- ‏כמה volume נסחר?
- ‏האם ה־queue estimate היה סביר?
- ‏האם route היה נכון?
- ‏האם alternative route plausibly היה עדיף?
- ‏מה הייתה missed opportunity?

---

# ‏245. Checklist — לפני Promotion של Custom Routing

- ‏האם יש baseline ברור?
- ‏האם השיפור incremental?
- ‏האם הוא נשמר out-of-sample?
- ‏האם הוא נשמר across regimes?
- ‏האם sample size מספיק?
- ‏האם tail latency השתפר או לפחות לא הורע?
- ‏האם operational complexity מוצדקת?
- ‏האם rollback פשוט?

---

# ‏246. `Routing Readiness Contract`

‏Routing policy יכולה לפעול רק אם:

```text
market_data_fresh = true
broker_ready = true
risk_authorized = true
instrument_resolved = true
signal_alive = true
price_protection_valid = true
safety_allows_new_order = true
```

---

# ‏247. `Routing Outcome Record`

‏לכל parent order נשמור summary:

```text
policy
route(s)
submit latency
fill latency
filled quantity
average fill price
fees
rebates
slippage
markout
missed quantity
fallback count
reroute count
final status
```

---

# ‏248. `Execution Policy` כ־Umbrella

‏בסוף, routing הוא חלק מתוך:

```text
ExecutionPolicy
  ├─ urgency
  ├─ order type
  ├─ price protection
  ├─ routing
  ├─ TTL
  ├─ cancel/replace
  └─ partial-fill handling
```

---

# ‏249. מה צריך לזכור בעל פה

1. ‏`Smart Routing` נותן ל־router לבחור destination.
2. ‏`Direct Routing` נותן לנו יותר שליטה אבל גם יותר אחריות.
3. ‏Venue choice משפיע על queue, fill, latency, fees ו־markout.
4. ‏Fee נמוך אינו שווה execution טוב.
5. ‏Fill Rate גבוה אינו שווה execution טוב.
6. ‏Routing צריך להימדד לפי net execution quality.
7. ‏Smart הוא baseline סביר; custom routing צריך להוכיח incremental value.
8. ‏Routing decision עצמו מתיישן וצריך TTL.
9. ‏Safety ו־price protection גוברים על routing optimization.
10. ‏אם אין route שעומד ב־constraints, `NO TRADE` היא תשובה תקפה.

---

# ‏250. החיבור לרובוט שלנו

‏לרובוט שסורק אלפי מניות ומנסה לנצל תנועה קצרה מאוד, routing חשוב משום שכל עיכוב או no-fill יכולים למחוק signal קצר־חיים.

‏אבל זה לא אומר שאנחנו צריכים לבנות Smart Router משלנו מהיום הראשון.

‏המסלול הנכון הוא:

```text
Measure SMART baseline
→ Identify specific execution failure modes
→ Build simple challenger
→ Shadow / replay / controlled validation
→ Promote only if net value survives
```

---

# ‏251. השאלה המקצועית האמיתית

‏לא:

```text
Which venue is best?
```

‏אלא:

```text
For this order, at this moment, under this signal TTL and these constraints,
which routing policy maximizes expected net execution quality?
```

---

# ‏252. סיכום

‏Routing הוא שכבת החלטה בין Execution Intent לבין venue בפועל.

‏`Smart Routing` מפחית complexity ומנצל לוגיקה של הברוקר, אבל אינו בהכרח מותאם בדיוק לפונקציית המטרה שלנו.

‏`Direct Routing` נותן יותר שליטה ושקיפות, אבל דורש market data, queue modeling, capability handling, failover, observability ו־research discipline טובים יותר.

‏לכן לא נבחר לפי אינטואיציה, branding או fee table.

‏נמדוד:

```text
Fill Probability
Time to Fill
Price Quality
Fees/Rebates
Adverse Selection
Missed Opportunity
Operational Reliability
```

‏ונחליט לפי **Net Execution Quality**.

---

# ‏253. מעבר לשלב הבא

‏אחרי שהבנו מי בוחר את ה־venue ואיך מודדים routing, השלב הבא הוא להעמיק בסוגי liquidity והוראות שאינן מסתכמות ב־Bid/Ask המוצג.

‏בשלב 40 נלמד:

- ‏`Hidden Orders`.
- ‏`Reserve / Iceberg`.
- ‏`Midpoint`.
- ‏`Pegged Orders`.
- ‏`ATS / Dark Liquidity`.
- ‏מה אפשר לראות ומה נשאר מוסתר.
- ‏איך כל אלה משפיעים על Fill, Queue, Adverse Selection ו־Backtest realism.
