# ‏שלב 40 — `Hidden`, ‏`Reserve`, ‏`Midpoint`, ‏`Pegged` ו־`ATS`: להבין את מה שלא רואים בספר

> ‏מטרת הפרק: להבין liquidity שאינה מוצגת במלואה ב־order book, איך פועלים hidden/reserve/iceberg orders, מהו midpoint execution, כיצד pegged orders משנים מחיר אוטומטית, מהי המשמעות של ATS/dark liquidity, ואיך כל זה משנה את assumptions שלנו לגבי Fill, Queue, Routing ו־Backtest.
>
> ‏העיקרון המרכזי: **Displayed Liquidity היא evidence חלקית, לא תמונה מלאה של כל ה־liquidity הזמינה לביצוע.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. למה בכלל צריך את הפרק הזה

‏בשלב 38 ראינו ש־Queue Position כבר קשה למדידה.

‏בשלב 39 ראינו שהפקודה יכולה לעבור בין venues.

‏עכשיו מוסיפים שכבה נוספת:

```text
Not all executable liquidity is displayed.
Not all displayed liquidity is equally executable.
Not all executions happen on lit exchanges.
```

‏כלומר:

- ‏יש liquidity גלויה.
- ‏יש liquidity שמוצגת רק חלקית.
- ‏יש liquidity שאינה מוצגת כלל.
- ‏יש liquidity שקיימת רק בתנאים מסוימים.
- ‏יש liquidity שתלויה ב־reference price.
- ‏יש liquidity שקיימת ב־ATS או במנגנון midpoint.

---

# ‏2. `Displayed Liquidity`

‏`Displayed Liquidity` היא הכמות שמופיעה בפועל ב־book או ב־quote feed.

‏לדוגמה:

```text
Bid 100.00 x 2,000
Ask 100.01 x 1,500
```

‏הפירוש הוא רק:

- ‏כרגע מוצגות 2,000 מניות בצד הקנייה במחיר הזה.
- ‏כרגע מוצגות 1,500 מניות בצד המכירה במחיר הזה.

‏זה **לא** אומר שאין עוד liquidity.

---

# ‏3. `Hidden Liquidity`

‏`Hidden Liquidity` היא liquidity שאינה מוצגת לציבור ב־book הרגיל.

‏פקודה יכולה להיות executable גם אם לא ראינו אותה מראש.

‏מבחינת מודל:

```text
Visible Book != Full Executable Interest
```

---

# ‏4. למה משתתף ירצה להסתיר כמות

‏סיבות אפשריות:

- ‏להקטין market impact.
- ‏לא לחשוף גודל אמיתי.
- ‏לא לאותת לשוק על urgency.
- ‏להימנע ממשיכת adverse flow.
- ‏לנסות לקבל execution בלי לפרסם interest מלא.

---

# ‏5. `Reserve Order`

‏ב־Reserve Order רק חלק מהכמות מוצג.

‏לדוגמה:

```text
Total quantity: 10,000
Displayed quantity: 1,000
Reserve quantity: 9,000
```

‏מבחוץ ייתכן שנראה רק:

```text
1,000 @ 100.00
```

‏אבל אחרי שחלק מהכמות מבוצע, עוד כמות יכולה להופיע.

---

# ‏6. `Iceberg Order`

‏המונח Iceberg משמש בדרך כלל לתיאור order שבו החלק הגלוי קטן מהכמות הכוללת.

‏הרעיון:

```text
small visible tip
large hidden body
```

‏ה־tip הוא מה שהשוק רואה.

---

# ‏7. Reserve אינו בהכרח Hidden מוחלט

‏יש הבדל עקרוני בין:

```text
Fully Hidden
```

‏לבין:

```text
Partially Displayed / Reserve
```

‏בשני המקרים displayed book אינו מייצג את מלוא הכמות.

---

# ‏8. Replenishment

‏כאשר החלק הגלוי של Reserve Order מתבצע, venue יכול להציג slice נוסף.

‏לדוגמה:

```text
Visible = 500
Reserve = 4,500
```

‏אחרי execution של 500:

```text
Visible = 500 again
Reserve = 4,000
```

‏מבחוץ זה עלול להיראות כאילו liquidity “נולדת מחדש”.

---

# ‏9. למה Replenishment חשוב ל־Queue Analysis

‏אם אנחנו רואים שוב ושוב אותה כמות במחיר מסוים, ייתכן שקיימת reserve liquidity.

‏אבל:

```text
Repeated replenishment != proof of iceberg
```

‏יכולות להיות גם פקודות חדשות ממשתתפים אחרים.

---

# ‏10. `Iceberg Detection`

‏אפשר לחקור patterns כמו:

- ‏executed volume גדול מה־displayed size שנצפה.
- ‏repeated replenishment.
- ‏book size שחוזר לרמה דומה.
- ‏large traded volume בלי depletion צפוי.

‏אבל detection כזה הוא probabilistic.

---

# ‏11. אסור להפוך inference לעובדה

‏נכון לשמור:

```text
possible_hidden_liquidity = true
confidence = 0.63
```

‏ולא:

```text
hidden_size = 8,500
```

‏כאילו אנחנו יודעים.

---

# ‏12. Hidden Liquidity משנה Fill Probability

‏מודל שמתבסס רק על displayed depth עלול להעריך Fill נמוך מדי או גבוה מדי.

‏למשל:

- ‏hidden opposite-side liquidity יכולה לשפר execution אגרסיבי.
- ‏hidden same-side liquidity יכולה להוסיף competition לפני order שלנו.

---

# ‏13. Hidden Liquidity משנה Queue Assumptions

‏אם order חבוי מקבל priority שונה לפי venue/order type, לא תמיד ניתן להסיק queue position מה־book.

‏לכן:

```text
Displayed Queue != Complete Queue
```

---

# ‏14. `Midpoint`

‏Midpoint הוא המחיר באמצע בין best bid ל־best ask.

```text
mid = (bid + ask) / 2
```

‏לדוגמה:

```text
Bid = 100.00
Ask = 100.02
Mid = 100.01
```

---

# ‏15. למה Midpoint מעניין

‏קונה שמבצע ב־midpoint יכול לשלם פחות מה־ask.

‏מוכר שמבצע ב־midpoint יכול לקבל יותר מה־bid.

‏שני הצדדים למעשה חולקים חלק מה־spread.

---

# ‏16. `Midpoint Execution`

‏Execution ב־midpoint אינו מחייב שהמחיר הזה היה displayed quote רגיל.

‏לכן:

```text
Trade price inside spread
```

‏יכול להיות execution לגיטימי.

---

# ‏17. Midpoint אינו Fill מובטח

‏העובדה שה־spread קיים אינה אומרת שיש contra-side liquidity ב־midpoint.

‏לכן:

```text
Midpoint available price != midpoint available liquidity
```

---

# ‏18. Midpoint Fill Model

‏Backtest לא צריך להניח:

```text
if mid exists => fill at mid
```

‏זו הנחה אופטימית מדי.

‏במקום זאת צריך לפחות:

- ‏Fill probability.
- ‏minimum resting time.
- ‏contra flow evidence.
- ‏latency.
- ‏signal TTL.

---

# ‏19. Midpoint Opportunity Cost

‏המתנה ל־midpoint יכולה לתת מחיר טוב יותר.

‏אבל אם ה־signal קצר:

```text
wait for better price
        ↓
miss the move
```

‏לכן שוב יש trade-off בין price improvement ל־missed opportunity.

---

# ‏20. `Pegged Order`

‏Pegged Order משנה את המחיר שלה ביחס ל־reference price.

‏למשל reference יכול להיות:

- ‏best bid.
- ‏best ask.
- ‏midpoint.
- ‏primary quote.
- ‏market reference אחר לפי venue/broker.

---

# ‏21. `Primary Peg`

‏בצורה מושגית:

```text
Buy price = reference bid + offset
Sell price = reference ask - offset
```

‏הפקודה זזה כאשר reference price משתנה.

---

# ‏22. `Midpoint Peg`

‏פקודה יכולה לעקוב אחרי midpoint.

```text
order_price = midpoint + offset
```

‏או:

```text
order_price = midpoint - offset
```

‏בהתאם לצד ולמנגנון.

---

# ‏23. למה Pegged Order שימושית

‏במקום לנהל cancel/replace ידני בכל tick:

```text
market moves
→ order reprices automatically
```

‏זה יכול לצמצם message churn.

---

# ‏24. Pegged אינה “set and forget”

‏עדיין יש שאלות:

- ‏מה reference price.
- ‏מה offset.
- ‏מה cap/floor.
- ‏מה קורה כשה־spread קופץ.
- ‏מה קורה כשה־reference feed stale.
- ‏האם repricing מאבד priority.
- ‏מה ה־broker/venue באמת עושה.

---

# ‏25. `Price Cap`

‏במערכת קצרה חשוב להצמיד pegged order ל־limit protection.

‏לדוגמה:

```text
Follow midpoint
but never pay above 100.15
```

‏אחרת order דינמי יכול להתרחק מעבר ל־edge budget.

---

# ‏26. `Reference Price Risk`

‏Pegged order תלויה ב־reference.

‏אם reference:

- ‏stale.
- ‏volatile.
- ‏נעלם.
- ‏משתנה מהר.

‏גם order behavior משתנה.

---

# ‏27. `Pegging Risk`

‏סיכון טיפוסי:

```text
signal weakens
but pegged order keeps following market
```

‏לכן עדיין צריך:

```text
Signal TTL
Order TTL
Max Chase Distance
Edge Budget
```

---

# ‏28. Pegged מול Manual Repricing

‏שתי אפשרויות:

```text
Manual cancel/replace policy
```

‏או:

```text
Venue/Broker-native pegging
```

‏ההשוואה צריכה להיות אמפירית.

---

# ‏29. יתרון אפשרי של Native Pegging

‏ייתכן שה־venue/broker יודע לבצע repricing מהר יותר מ־client-side loop.

‏אבל זה capability-specific.

---

# ‏30. חסרון אפשרי של Native Pegging

‏פחות transparency.

‏לפעמים קשה יותר להסביר בדיוק:

```text
why did price move here?
```

‏לכן צריך telemetry טוב.

---

# ‏31. `ATS`

‏`ATS` הוא Alternative Trading System.

‏מבחינת ארכיטקטורה, אפשר לחשוב עליו כ־execution venue שאינו בהכרח exchange lit book רגיל.

---

# ‏32. Dark Liquidity

‏חלק מה־ATS liquidity יכולה להיות non-displayed.

‏מכאן מגיע המונח הרחב:

```text
Dark Liquidity
```

‏אבל לא כל ATS זהה ולא כל ATS הוא “dark pool” במובן הפשוט.

---

# ‏33. למה Dark Liquidity קיימת

‏מטרות אפשריות:

- ‏להקטין information leakage.
- ‏להקטין market impact.
- ‏לא לחשוף גודל.
- ‏לנסות להשיג midpoint/price improvement.

---

# ‏34. ATS אינו קסם

‏יש trade-offs:

- ‏fill uncertainty.
- ‏latency.
- ‏limited visibility.
- ‏different matching rules.
- ‏different minimum sizes.
- ‏different interaction conditions.

---

# ‏35. `Lit` מול `Dark`

‏Lit venue:

```text
displayed quotes/order book
```

‏Dark/Non-displayed venue:

```text
execution interest not fully visible before trade
```

---

# ‏36. למה Strategy לא צריכה לדעת venue internals

‏Strategy צריכה להוציא Intent.

```text
buy X
urgency medium
max price Y
TTL Z
```

‏Execution Policy מחליטה:

```text
lit / midpoint / smart route / dark candidate
```

---

# ‏37. `ExecutionPolicy` מול `VenuePolicy`

‏אפשר להפריד:

```text
ExecutionPolicy
  ├─ urgency
  ├─ price protection
  ├─ TTL
  └─ fill target

VenuePolicy
  ├─ lit
  ├─ midpoint
  ├─ reserve
  └─ ATS eligibility
```

---

# ‏38. `Liquidity Type` כמאפיין Execution

‏כל fill צריך לשמור לפחות:

```text
liquidity_type
venue
order_type
route_type
passive_aggressive
```

‏כאשר המידע זמין.

---

# ‏39. למה זה חשוב ל־RCA

‏אחרת לא נוכל לדעת:

```text
Was the strategy wrong?
Was routing wrong?
Was midpoint too slow?
Was lit execution too expensive?
```

---

# ‏40. `Displayed Size` אינו Capacity

‏אם book מראה:

```text
Ask size = 2,000
```

‏זה לא אומר שאפשר לקנות רק 2,000.

‏ייתכן שיש:

- ‏reserve.
- ‏hidden.
- ‏other venues.
- ‏replenishment.
- ‏ATS liquidity.

---

# ‏41. אבל גם ההפך נכון

‏Displayed size גם אינו מבטיח שנוכל לקבל את כולו.

‏כי עד שהפקודה שלנו מגיעה:

- ‏liquidity יכולה להיעלם.
- ‏אחרים יכולים לקחת אותה.
- ‏routing יכול לבחור venue אחר.
- ‏latency יכולה לשנות את התמונה.

---

# ‏42. לכן Depth הוא Signal, לא Guarantee

‏הכלל:

```text
Depth = evidence about executability
not a fill guarantee
```

---

# ‏43. Hidden Liquidity ו־Backtest Bias

‏אם backtest מתעלם לחלוטין מ־hidden liquidity, הוא יכול להיות pessimistic בחלק מהתרחישים.

‏אם הוא מניח hidden liquidity נדיבה תמיד, הוא הופך optimistic.

---

# ‏44. הדרך הנכונה: Fidelity Levels

‏לדוגמה:

```text
F0: Last-only
F1: Bid/Ask
F2: Displayed depth
F3: Queue approximation
F4: Hidden-liquidity sensitivity scenarios
F5: Live-calibrated execution model
```

---

# ‏45. Hidden Liquidity כ־Scenario, לא Fact

‏ב־backtest אפשר לבדוק:

```text
No hidden liquidity
Moderate hidden liquidity
High hidden liquidity
```

‏ולראות עד כמה התוצאות רגישות.

---

# ‏46. `Sensitivity Analysis`

‏אם edge קיים רק תחת הנחה של הרבה hidden liquidity:

```text
strategy is fragile
```

---

# ‏47. Midpoint Backtest Scenario

‏אפשר להשוות:

```text
No midpoint fills
10% eligible midpoint fill probability
30%
50%
```

‏לפי evidence live/paper/shadow.

---

# ‏48. `Fill Attribution`

‏כל fill צריך להיות מסווג:

```text
LIT_PASSIVE
LIT_AGGRESSIVE
MIDPOINT
HIDDEN
RESERVE_INTERACTION
ATS
UNKNOWN
```

‏לפי המידע הזמין.

---

# ‏49. `UNKNOWN` הוא ערך תקין

‏לא תמיד נדע בדיוק איזה liquidity type השתתף.

‏עדיף:

```text
UNKNOWN
```

‏מאשר inference שגוי.

---

# ‏50. `Price Improvement`

‏אם קנייה מתבצעת במחיר טוב מה־ask שהיה benchmark בזמן ההחלטה:

```text
price improvement > 0
```

‏אבל צריך benchmark עקבי.

---

# ‏51. Midpoint Improvement

‏לדוגמה:

```text
Bid = 100.00
Ask = 100.04
Mid = 100.02
```

‏קנייה ב־100.02 חוסכת:

```text
2 cents vs crossing ask
```

‏לפני fees ולפני opportunity cost.

---

# ‏52. Price Improvement לבדו מטעה

‏אם חיכינו ל־midpoint 700ms והמחיר עלה אחר כך חזק:

```text
better fill price
but worse total opportunity outcome
```

---

# ‏53. לכן צריך `Net Execution Value`

‏מושג שימושי:

```text
Net Execution Value
= price improvement
- delay cost
- missed opportunity
- adverse selection
- fees
```

---

# ‏54. Hidden Liquidity ו־Adverse Selection

‏Fill לא תמיד חדשות טובות.

‏אם hidden order שלנו מתמלא בדיוק לפני move נגדנו:

```text
good price
bad selection
```

---

# ‏55. Markout חשוב במיוחד

‏לכן מודדים:

```text
markout_100ms
markout_500ms
markout_1s
markout_5s
```

‏לפי horizon של האסטרטגיה.

---

# ‏56. `ATS Fill Rate`

‏אם משתמשים ב־ATS routing צריך למדוד:

- ‏fill rate.
- ‏time-to-fill.
- ‏price improvement.
- ‏markout.
- ‏cancel latency.
- ‏opportunity cost.

---

# ‏57. `Lit Fill Rate`

‏אותם metrics בדיוק.

‏רק כך משווים apples-to-apples.

---

# ‏58. `Fill Quality Matrix`

| ‏Route | ‏Fill Rate | ‏Time-to-Fill | ‏Price Improvement | ‏Markout | ‏Opportunity Cost |
|---|---:|---:|---:|---:|---:|
| ‏Lit Passive | ... | ... | ... | ... | ... |
| ‏Lit Aggressive | ... | ... | ... | ... | ... |
| ‏Midpoint | ... | ... | ... | ... | ... |
| ‏ATS | ... | ... | ... | ... | ... |

---

# ‏59. Segment לפי Regime

‏אין להניח שאותה tactic טובה תמיד.

‏צריך לפלח לפחות לפי:

- ‏spread.
- ‏volatility.
- ‏liquidity.
- ‏time of day.
- ‏signal strength.
- ‏urgency.

---

# ‏60. Hidden Liquidity בזמן Spread צר

‏כאשר spread הוא tick אחד בלבד, midpoint advantage יכול להיות מוגבל או לא קיים בהתאם למחיר/tick rules.

‏לכן value של midpoint תלוי גם ב־spread geometry.

---

# ‏61. Hidden Liquidity בזמן Spread רחב

‏כאשר spread רחב יותר, potential price improvement גדול יותר.

‏אבל גם execution uncertainty יכולה להיות גבוהה יותר.

---

# ‏62. `Midpoint Eligibility`

‏Execution Engine צריך לחשב:

```text
is_midpoint_eligible
```

‏ולא להניח שכל symbol/session/order תומכים באותה התנהגות.

---

# ‏63. Capability Check

‏לפני שימוש ב־order tactic:

```text
broker supports?
venue supports?
symbol eligible?
session eligible?
```

---

# ‏64. `BrokerCapabilities`

‏כדאי להחזיק capabilities כמו:

```text
SupportsHidden
SupportsReserve
SupportsMidpointPeg
SupportsPrimaryPeg
SupportsATSAccess
SupportsNativePriceCap
```

---

# ‏65. Capability Drift

‏capability יכול להשתנות.

‏לכן הוא versioned ומאומת ב־startup.

---

# ‏66. אין Silent Fallback

‏אם strategy ביקשה midpoint אבל broker אינו תומך:

‏לא נכון לשנות בשקט ל־market order.

‏צריך:

```text
REJECT_UNSUPPORTED_EXECUTION_POLICY
```

‏או fallback מפורש ומוגדר מראש.

---

# ‏67. `Synthetic` מול `Native`

‏חלק מההתנהגויות יכולות להיות:

```text
native at venue/broker
```

‏או:

```text
synthetic client-side
```

‏הבדל זה קריטי ל־latency ול־failure recovery.

---

# ‏68. Native Reserve

‏אם venue מנהל reserve:

‏ה־client לא צריך לשלוח כל replenishment בעצמו.

---

# ‏69. Synthetic Reserve

‏אם אנחנו מממשים בעצמנו:

```text
send slice
wait fill
send next slice
```

‏נוספים:

- ‏latency.
- ‏state.
- ‏crash risk.
- ‏duplicate risk.
- ‏signal decay.

---

# ‏70. Hidden Orders ו־Queue Priority

‏ה־priority של hidden orders יכולה להיות שונה מ־displayed orders לפי venue rules.

‏לכן אי אפשר להניח כלל אוניברסלי.

---

# ‏71. `Displayed Priority Advantage`

‏בחלק מהמבנים displayed liquidity יכולה לקבל priority על non-displayed interest באותו מחיר.

‏זו עוד סיבה לא להניח hidden queue פשוט.

---

# ‏72. Reserve Replenishment Priority

‏גם השאלה האם replenished slice שומרת priority או מקבלת priority חדשה היא venue-specific.

---

# ‏73. כלל תכנוני

‏לכן:

```text
QueueModel must be venue-aware
```

‏כאשר הנתונים מאפשרים זאת.

---

# ‏74. ואם אין Venue-Level Data

‏המודל צריך להיות צנוע יותר:

```text
queue_confidence = LOW
```

---

# ‏75. `Liquidity Uncertainty`

‏אפשר להכניס feature/diagnostic:

```text
liquidity_uncertainty_score
```

‏שמייצג כמה מעט אנחנו באמת יודעים על executability.

---

# ‏76. למה זה חשוב לרובוט שלנו

‏הרובוט מחזיק לשניות.

‏לכן אפילו:

```text
200-500ms extra waiting
```

‏יכול להיות משמעותי אם ה־edge קצר.

---

# ‏77. Midpoint מתאים בעיקר אם

‏באופן עקרוני, midpoint tactic נעשית מעניינת כאשר:

- ‏spread משמעותי יחסית ל־edge.
- ‏signal TTL אינו זעיר מדי.
- ‏fill probability סבירה.
- ‏opportunity cost נשלט.

---

# ‏78. Midpoint פחות מתאים אם

‏כאשר:

- ‏signal decay מהיר מאוד.
- ‏spread קטן מאוד.
- ‏fill rate נמוך.
- ‏rank churn גבוה.
- ‏המחיר בורח במהירות.

---

# ‏79. Reserve מתאים יותר כאשר

‏באופן עקרוני:

- ‏size גדול יחסית ל־displayed depth.
- ‏יש חשש ל־market impact.
- ‏אין צורך מיידי ב־full fill.

---

# ‏80. אבל ברובוט קטן

‏אם size קטן יחסית לשוק:

```text
reserve complexity may add little value
```

‏וזה חשוב ל־KISS.

---

# ‏81. לא משתמשים ב־Order Type כי הוא “מתוחכם”

‏כל tactic צריכה לעבור ניסוי:

```text
Does it improve expected net outcome?
```

---

# ‏82. `Complexity Tax`

‏כל tactic מתקדמת מוסיפה:

- ‏implementation complexity.
- ‏testing burden.
- ‏state-machine complexity.
- ‏broker-specific behavior.
- ‏observability requirements.

---

# ‏83. לכן צריך hurdle

‏נוסיף tactic רק אם:

```text
expected benefit > complexity tax
```

---

# ‏84. `Execution Policy Registry`

‏לכל policy:

```text
policy_id
version
allowed_order_types
venue_constraints
price_protection
TTL
fallbacks
metrics
```

---

# ‏85. `MidpointPolicyV1`

‏לדוגמה רעיונית:

```text
Try midpoint for 300ms
If no fill and signal remains valid:
    switch to marketable limit
Else cancel
```

---

# ‏86. אבל לא hard-code זמן

‏ה־300ms הוא רק דוגמה.

‏במחקר אמיתי צריך לבדוק distribution ו־signal decay.

---

# ‏87. `ReservePolicyV1`

‏לדוגמה:

```text
TotalQty = 5,000
DisplayQty = 500
MaxExecutionTime = 5s
```

‏גם כאן parameters צריכים להיות empirical.

---

# ‏88. `PegPolicyV1`

‏לדוגמה:

```text
Reference = Mid
Offset = 0
Cap = DecisionPrice + MaxChase
TTL = SignalTTL
```

---

# ‏89. `ATSPolicyV1`

‏לדוגמה רעיונית:

```text
Use ATS only when:
spread >= threshold
signal urgency <= medium
expected midpoint value > threshold
```

---

# ‏90. אבל policy אינה truth

‏היא hypothesis.

‏צריך לבדוק אותה.

---

# ‏91. `A/B` או Champion/Challenger

‏אפשר להשוות:

```text
Champion: marketable limit
Challenger: midpoint first, then marketable limit
```

---

# ‏92. Metric ראשי

‏לא:

```text
average fill price
```

‏אלא משהו כמו:

```text
Net Outcome after execution effects
```

---

# ‏93. Metrics משניים

- ‏fill rate.
- ‏time-to-first-fill.
- ‏time-to-full-fill.
- ‏slippage.
- ‏price improvement.
- ‏markout.
- ‏opportunity cost.
- ‏cancel rate.

---

# ‏94. `No-Fill Outcome`

‏No-fill הוא observation חשוב.

‏לא למחוק אותו מהדאטה.

---

# ‏95. `Selection Bias`

‏אם מנתחים רק fills:

```text
we ignore orders that missed profitable moves
```

‏וזו הטיה קשה.

---

# ‏96. `Execution Counterfactual`

‏לכל order אפשר לשאול:

```text
What if we crossed immediately?
What if we waited at midpoint?
What if we posted passively?
```

‏אבל confidence תלוי בנתונים.

---

# ‏97. Counterfactual אינו Truth

‏במיוחד hidden/ATS liquidity אינה ניתנת לשחזור מושלם מ־public feed.

---

# ‏98. לכן Counterfactual Confidence

‏נשמור:

```text
HIGH
MEDIUM
LOW
```

---

# ‏99. `Backtest Conservatism`

‏כאשר אין evidence:

‏עדיף assumption שמרנית.

‏לא:

```text
assume best possible midpoint fill
```

---

# ‏100. `Live Calibration`

‏הדרך הטובה ביותר לשפר מודל היא למדוד live/shadow/paper:

- ‏איזה orders קיבלו midpoint fill.
- ‏כמה זמן לקח.
- ‏באיזה spread.
- ‏באיזה signal state.
- ‏איזה markout היה אחרי fill.

---

# ‏101. Paper Limitations

‏Paper system יכול לדמות hidden/midpoint בצורה שונה מאוד מהשוק האמיתי.

‏לכן:

```text
Paper evidence != Live execution proof
```

---

# ‏102. `Shadow Execution`

‏אפשר להריץ policy בלי כסף:

```text
Would send midpoint
Would wait 250ms
Would cross at X
```

‏ולשמור counterfactual trace.

---

# ‏103. Shadow אינו יודע Fill אמיתי

‏אבל הוא כן עוזר למדוד:

- ‏decision timing.
- ‏eligible opportunities.
- ‏price paths.
- ‏signal survival.

---

# ‏104. `Live Canary`

‏אם מגיעים ל־live בעתיד, tactic חדשה צריכה להתחיל ב־small controlled canary.

---

# ‏105. `Venue Drift`

‏התנהגות venue יכולה להשתנות עם הזמן.

‏לכן:

```text
fill_rate by venue over time
```

‏צריך monitoring.

---

# ‏106. `Liquidity Regime Drift`

‏גם אם venue לא השתנה, market regime השתנה.

---

# ‏107. `Fill Model Drift`

‏נמדוד:

```text
predicted_fill_probability
vs
realized_fill_probability
```

---

# ‏108. Calibration Curve

‏אם model אמר 70% fill probability, לאורך זמן בערך 70% מהאירועים הדומים צריכים להתמלא.

---

# ‏109. Hidden Liquidity מגדילה Uncertainty

‏לכן prediction interval חשוב יותר מ־single number.

---

# ‏110. `Fill Probability Range`

‏לדוגמה:

```text
base = 0.55
range = 0.35-0.72
```

---

# ‏111. `Midpoint Queue`

‏גם midpoint יכול לכלול competing interest.

‏אין סיבה להניח שאנחנו ראשונים.

---

# ‏112. `ATS Queue`

‏כל ATS יכול להשתמש matching logic שונה.

‏לכן אין “ATS queue model” אוניברסלי.

---

# ‏113. `Conditional Orders`

‏בחלק מהמבנים קיימים mechanisms שבהם interest הופך firm רק אחרי trigger/interaction.

‏ברמה הארכיטקטונית חשוב להבין:

```text
not all displayed or indicated liquidity is immediately firm in the same way
```

---

# ‏114. `Indications of Interest`

‏לא כל indication שקול לפקודה executable מיידית.

‏לכן לא נכניס indications לאותו schema בלי distinction.

---

# ‏115. `LiquiditySource`

‏מודל domain יכול לכלול:

```text
LIT_DISPLAYED
LIT_HIDDEN
RESERVE
MIDPOINT
ATS
UNKNOWN
```

---

# ‏116. `OrderVisibility`

```text
DISPLAYED
PARTIAL
HIDDEN
```

---

# ‏117. `ReferencePriceType`

```text
NONE
BID
ASK
MID
PRIMARY
CUSTOM
```

---

# ‏118. `PegOffset`

‏צריך להיות explicit.

```text
reference + offset
```

---

# ‏119. Tick Rounding

‏Pegged price עדיין חייב לעמוד ב־valid tick rules.

---

# ‏120. `Price Protection`

‏כל peg חייב להשתלב עם:

```text
min_price
max_price
max_chase
```

---

# ‏121. Repricing Event

‏כדאי לכתוב log:

```text
old_price
new_price
reference_price
reason
```

---

# ‏122. `Peg Drift`

‏נמדוד כמה order זזה מה־decision price.

---

# ‏123. `Execution Drift`

```text
fill_price - decision_benchmark
```

‏לפי side.

---

# ‏124. `Midpoint Drift`

‏אפשר למדוד:

```text
fill_price - decision_mid
```

---

# ‏125. `Spread Capture`

‏ב־passive/midpoint tactics מעניין למדוד איזה fraction מה־spread נשמר.

---

# ‏126. אבל Spread Capture אינו Edge

‏אם price moves נגדנו מיד אחרי fill:

‏spread capture יכול להיות illusion.

---

# ‏127. לכן Markout שוב קריטי

‏במיוחד ב־hidden/midpoint interaction.

---

# ‏128. `Toxic Flow`

‏במיקרו־מבנה משתמשים במושג toxic flow כאשר contra-side information advantage מייצר adverse selection.

‏אין צורך להפוך את הרובוט שלנו ל־HFT כדי להבין את הסיכון.

---

# ‏129. `Fill Quality` מול `Fill Quantity`

‏יותר fills אינם בהכרח טובים יותר.

---

# ‏130. `Midpoint Toxicity`

‏גם midpoint fill יכול להיות adverse.

‏מחיר טוב יחסית ל־spread אינו מבטיח outcome טוב.

---

# ‏131. `Venue Toxicity`

‏אפשר למדוד markout לפי venue/route.

---

# ‏132. `Conditional Routing`

‏Execution Engine יכולה לבחור tactic לפי:

```text
spread
signal strength
TTL
volatility
liquidity
rank stability
```

---

# ‏133. `Execution Decision Table`

| ‏Condition | ‏Potential Tactic |
|---|---|
| ‏Spread narrow, urgency high | ‏Marketable limit |
| ‏Spread wide, urgency medium | ‏Midpoint attempt |
| ‏Large size, urgency low | ‏Reserve/controlled slicing |
| ‏High uncertainty | ‏No trade or aggressive protection |

‏זו המחשה בלבד; לא rule קבוע.

---

# ‏134. `NO TRADE`

‏אם execution assumptions חלשות מדי:

```text
NO_TRADE_EXECUTION_UNCERTAINTY
```

‏הוא outcome לגיטימי.

---

# ‏135. Data Requirement

‏כדי לחקור tactics מתקדמות צריך לשמור:

- ‏bid/ask בעת decision.
- ‏spread.
- ‏depth אם קיים.
- ‏route.
- ‏order type.
- ‏submit/ack/fill/cancel timestamps.
- ‏fill venue.
- ‏fill price.
- ‏fees.
- ‏markout.

---

# ‏136. `Execution Trace`

‏לכל order:

```text
Decision
→ ExecutionPolicy
→ RouteSelection
→ BrokerCommand
→ BrokerAck
→ Reprice Events
→ Fill/Cancel
→ Markout
```

---

# ‏137. `Why This Tactic?`

‏Decision trace צריך לענות:

```text
Why midpoint?
Why reserve?
Why pegged?
Why ATS?
```

---

# ‏138. Reason Codes

‏לדוגמה:

```text
MIDPOINT_WIDE_SPREAD
PEG_LOW_URGENCY
MARKETABLE_HIGH_DECAY
NO_TRADE_LOW_EXECUTION_CONFIDENCE
```

---

# ‏139. `Tactic Attribution`

‏PnL attribution יכול לכלול:

```text
signal contribution
execution contribution
routing contribution
cost contribution
```

---

# ‏140. `Hidden Liquidity Attribution`

‏לא תמיד ניתן לייחס במדויק.

‏אז נשמור confidence.

---

# ‏141. `Raw Broker Evidence`

‏כדאי לשמור raw broker fields הרלוונטיים, בלי secrets.

‏כך אפשר לנתח מחדש בעתיד.

---

# ‏142. Normalized + Raw

‏הכלל:

```text
normalized domain event
+
raw provider evidence
```

---

# ‏143. Replay

‏Replay צריך לשחזר:

- ‏policy decision.
- ‏route choice.
- ‏peg repricing logic.
- ‏timeouts.
- ‏fallback.

---

# ‏144. אבל Replay לא יכול להמציא Hidden Book

‏אם לא הקלטנו אותו — לא היה לנו אותו.

---

# ‏145. לכן Replay Fidelity Metadata

```text
hidden_liquidity_model = NONE / SYNTHETIC / CALIBRATED
```

---

# ‏146. `Synthetic Hidden Model`

‏אם משתמשים בו, חייבים לסמן שהוא assumption.

---

# ‏147. `Calibrated Hidden Model`

‏אפשר לכייל לפי live fills ו־venue statistics.

‏עדיין זו approximation.

---

# ‏148. `Provider Mismatch`

‏Market Data Provider יכול לא לראות את אותה liquidity שה־broker מצליח לבצע מולה.

---

# ‏149. לכן Cross-Provider Explanation

‏Fill במחיר שלא נראה ב־feed אינו בהכרח data bug.

‏צריך לבדוק:

- ‏venue coverage.
- ‏ATS.
- ‏midpoint.
- ‏hidden liquidity.
- ‏timestamp alignment.

---

# ‏150. `First Divergence`

‏RCA טוב שואל:

```text
What is the first point where public feed assumptions diverged from execution reality?
```

---

# ‏151. `Market Data Truth` מול `Execution Truth`

‏זו בדיוק ההפרדה משלב 32.

‏Market Data מתארת מה צפינו.

‏Execution Broker מתאר מה קרה לנו בפועל.

---

# ‏152. `Hidden Liquidity` ו־Scanner

‏ה־Scanner לא צריך לנסות לנחש hidden size לכל 4,000 המניות כשלב ראשון.

‏זה overengineering.

---

# ‏153. Baseline נכון לרובוט שלנו

```text
Broad scanner
→ Top candidates
→ execution-quality enrichment
→ advanced tactic only for selected candidate
```

---

# ‏154. למה

‏כי hidden/midpoint/venue detail יקרה יותר מבחינת data/computation/complexity.

---

# ‏155. `Two-Stage Execution Analysis`

‏שלב 1:

```text
Can this candidate be traded at all?
```

‏שלב 2:

```text
Which tactic best preserves edge?
```

---

# ‏156. `Execution Readiness`

‏לפני tactic מתקדמת:

```text
market_data_fresh
broker_ready
instrument_resolved
capability_supported
signal_alive
risk_approved
```

---

# ‏157. `Tactic Readiness`

‏בנוסף:

```text
spread_valid
reference_price_valid
route_available
TTL_sufficient
```

---

# ‏158. `Peg Readiness`

```text
reference feed fresh
price cap valid
tick size known
```

---

# ‏159. `Midpoint Readiness`

```text
bid fresh
ask fresh
spread valid
mid calculable
```

---

# ‏160. `Reserve Readiness`

```text
size justification
broker capability
venue capability
execution horizon sufficient
```

---

# ‏161. `ATS Readiness`

```text
route capability
session eligibility
symbol eligibility
```

---

# ‏162. `Stale Reference Guard`

‏Pegged order לא צריכה להמשיך אם reference stale מעבר לסף.

---

# ‏163. `Spread Explosion Guard`

‏אם spread קופץ:

```text
midpoint policy may no longer be valid
```

---

# ‏164. `Signal Death Guard`

‏אם signal מת:

‏לא ממשיכים “כי order כבר שם”.

---

# ‏165. `Rank Replacement Guard`

‏אם Top1 השתנה, צריך policy מפורשת.

---

# ‏166. `Remaining Edge`

‏בכל repricing:

```text
remaining_edge = expected_gross_edge - current_execution_cost_estimate
```

---

# ‏167. Stop Chasing

‏אם remaining edge קטן מדי:

```text
cancel
```

---

# ‏168. `Execution Budget`

‏כל tactic צריכה לצרוך budget מוגדר של:

- ‏time.
- ‏price.
- ‏messages.
- ‏retries.

---

# ‏169. `Message Budget`

‏Pegging/cancel-replace יכולים לייצר churn.

‏לכן message budget הוא חלק מה־policy.

---

# ‏170. `State Machine`

‏טקטיקה מתקדמת צריכה state machine מפורשת.

```text
CREATED
WORKING
REPRICING
PARTIAL
CANCEL_PENDING
FALLBACK_PENDING
FILLED
CANCELLED
UNKNOWN
```

---

# ‏171. Midpoint Fallback

‏דוגמה:

```text
MIDPOINT_WORKING
→ TTL_EXPIRED
→ MARKETABLE_LIMIT_PENDING
```

---

# ‏172. Reserve Partial Fill

```text
RESERVE_WORKING
→ PARTIAL
→ REPLENISH / CONTINUE / CANCEL
```

---

# ‏173. Pegged Cancel Race

‏Repricing ו־cancel יכולים להתנגש עם fill.

‏אותם invariants משלב 29/33/34 חלים גם כאן.

---

# ‏174. `No Overfill`

```text
cum_fill <= target_qty
```

‏Invariant קריטי.

---

# ‏175. `No Duplicate Fallback`

‏אם fallback נשלח, צריך למנוע שליחה כפולה אחרי retry/reconnect.

---

# ‏176. `Unknown Effect`

‏Timeout על midpoint/ATS submit אינו rejection.

‏עוברים ל־reconcile.

---

# ‏177. `Recovery`

‏אחרי reconnect:

- ‏משחזרים orders.
- ‏בודקים fills.
- ‏בודקים remaining qty.
- ‏מחליטים אם tactic עדיין תקפה.

---

# ‏178. Restart בזמן Pegged Order

‏אין להניח שה־order נעלמה.

---

# ‏179. Restart בזמן Reserve Order

‏צריך להבין מה broker מנהל native ומה client מנהל.

---

# ‏180. `Native vs Synthetic Recovery`

‏Native order יכולה להמשיך לחיות אצל broker גם אם client נפל.

‏Synthetic policy יכולה להפסיק באמצע.

---

# ‏181. לכן Domain State חייב לשמור

```text
native_order_state
synthetic_policy_state
```

---

# ‏182. `Observability`

‏Metrics שימושיים:

- ‏midpoint_attempts.
- ‏midpoint_fill_rate.
- ‏midpoint_time_to_fill.
- ‏reserve_fill_rate.
- ‏peg_reprice_count.
- ‏peg_chase_distance.
- ‏ATS_fill_rate.
- ‏fallback_rate.

---

# ‏183. `Hidden Fill Surprise`

‏מדד מעניין:

```text
fills better than visible-book expectation
```

---

# ‏184. `Displayed Depth Error`

‏אפשר למדוד:

```text
predicted executable size
vs
realized executable size
```

---

# ‏185. `Execution Surprise`

‏הפרש בין model ל־reality.

---

# ‏186. Positive Surprise

‏קיבלנו execution טוב יותר מהצפוי.

---

# ‏187. Negative Surprise

‏קיבלנו execution גרוע יותר מהצפוי.

---

# ‏188. שני הסוגים חשובים

‏גם positive surprise אומר שהמודל אולי חסר.

---

# ‏189. `Model Error` מול `Variance`

‏אירוע יחיד אינו מספיק כדי לשנות policy.

---

# ‏190. Aggregation

‏נחפש pattern לפי:

- ‏symbol liquidity bucket.
- ‏spread bucket.
- ‏time-of-day.
- ‏venue.
- ‏route.
- ‏signal urgency.

---

# ‏191. `RCA Taxonomy`

```text
MIDPOINT_NO_FILL
MIDPOINT_LATE_FILL
PEG_OVERCHASE
PEG_REFERENCE_STALE
RESERVE_TOO_SLOW
ATS_LOW_FILL_RATE
ATS_ADVERSE_MARKOUT
CAPABILITY_MISMATCH
UNKNOWN_LIQUIDITY_SOURCE
```

---

# ‏192. `Success RCA`

‏גם executions מוצלחים צריך לנתח.

---

# ‏193. למה

‏אחרת לא יודעים אם הצלחה נבעה מ־policy או ממזל.

---

# ‏194. `Tactic Retention`

‏טקטיקה נשארת רק אם היא מוסיפה value לאורך זמן.

---

# ‏195. `Feature Retirement`

‏אם tactic מורכבת לא משפרת net outcome:

```text
remove it
```

---

# ‏196. `KISS`

‏זה אחד המקומות שבהם קל במיוחד להסתבך.

‏לכן baseline של הרובוט צריך להישאר פשוט.

---

# ‏197. Baseline מומלץ למחקר

```text
1. Marketable Limit baseline
2. Passive baseline
3. Midpoint challenger
4. Pegged challenger
5. Reserve only if size justifies it
6. ATS only if measurable evidence supports it
```

---

# ‏198. לא מתחילים עם הכול

‏נוסיף tactic אחת בכל פעם.

---

# ‏199. Controlled Experiment

‏לכל tactic:

```text
Hypothesis
Baseline
Treatment
Primary metric
Guardrails
Decision rule
```

---

# ‏200. Guardrails

‏לדוגמה:

- ‏max latency.
- ‏max chase.
- ‏max missed-opportunity rate.
- ‏max adverse markout.
- ‏max operational failures.

---

# ‏201. `Operational Failure Rate`

‏טקטיקה עם execution gain קטן אבל הרבה UNKNOWN/recovery incidents אינה בהכרח שיפור.

---

# ‏202. `Complexity-Adjusted Value`

‏אפשר לחשוב:

```text
net benefit
-
operational complexity cost
```

---

# ‏203. `Venue-Specific Logic`

‏לא להכניס venue rules לתוך Strategy.

---

# ‏204. Adapter Boundary

```text
Strategy
→ ExecutionIntent
→ ExecutionPolicy
→ BrokerAdapter
→ Venue/Broker Specific Details
```

---

# ‏205. `Capability Negotiation`

‏Execution Policy בוחרת רק tactics שה־adapter מצהיר עליהן.

---

# ‏206. `Fallback Contract`

‏לכל advanced tactic צריך fallback מפורש.

---

# ‏207. דוגמה

```text
Midpoint unavailable
→ fallback = marketable limit
```

‏או:

```text
Midpoint unavailable
→ fallback = NO TRADE
```

---

# ‏208. אין Implicit Fallback

‏זו דרישה בטיחותית.

---

# ‏209. `Session Awareness`

‏לא כל tactic בהכרח זמינה באותה צורה בכל session.

‏לכן session הוא חלק מה־capability check.

---

# ‏210. `Market State Awareness`

‏Halts, crossed/locked markets ו־abnormal conditions יכולים לשנות validity של reference prices.

---

# ‏211. `Locked Market`

‏כאשר bid == ask:

```text
mid == bid == ask
```

‏midpoint improvement יכול להיעלם.

---

# ‏212. `Crossed Market`

‏מצב חריג דורש טיפול ולא assumption רגיל.

---

# ‏213. `Data Quality Gate`

‏לא מחשבים midpoint על quotes stale או invalid.

---

# ‏214. `Reference Integrity`

```text
bid <= ask
```

‏במצב רגיל נצפה לכך, עם טיפול מפורש בחריגים.

---

# ‏215. `Timestamp Integrity`

‏Bid ו־Ask צריכים להיות מאותו context סביר.

---

# ‏216. `Synthetic Mid`

‏אם bid ו־ask הגיעו בזמנים שונים משמעותית, mid synthetic עלול להיות שקרי.

---

# ‏217. לכן Mid Quality

```text
mid_quality = GOOD / DEGRADED / INVALID
```

---

# ‏218. `Peg Reference Quality`

‏אותו רעיון.

---

# ‏219. `Venue Coverage`

‏אם data provider לא כולל venue מסוים, לא נניח שאין שם liquidity.

---

# ‏220. `Feed Bias`

‏זה יכול לגרום לנו להעדיף tactics לפי תמונה חלקית.

---

# ‏221. `Cross-Feed Validation`

‏ל־Top candidate אפשר להשוות feed מול broker snapshot לפני execution.

---

# ‏222. אבל לא ל־4,000 symbols

‏זה יקר ומיותר.

---

# ‏223. `Top-N Enrichment`

‏שוב:

```text
broad scan
→ shortlist
→ deep execution analysis
```

---

# ‏224. `Execution Feasibility Score`

‏אפשר להחזיק subscore נפרד מה־alpha score.

---

# ‏225. לא לערבב בלי שקיפות

‏עדיף:

```text
AlphaScore
ExecutionScore
NetTradeability
```

‏מאשר score שחור אחד.

---

# ‏226. `Midpoint Expected Value`

‏באופן מושגי:

```text
EV_mid
= P(fill) * expected_value_if_filled
- P(no_fill) * opportunity_cost
```

---

# ‏227. `Aggressive Expected Value`

```text
EV_cross
= expected_signal_value
- spread_cost
- slippage
- fees
```

---

# ‏228. לבחור לפי EV

‏לא לפי “מחיר יפה”.

---

# ‏229. `Pegged Expected Value`

‏מוסיף:

- ‏repricing behavior.
- ‏chase cost.
- ‏queue reset possibility.
- ‏latency.

---

# ‏230. `Reserve Expected Value`

‏מוסיף:

- ‏impact reduction potential.
- ‏slower completion risk.
- ‏partial-fill risk.

---

# ‏231. `ATS Expected Value`

‏מוסיף:

- ‏price improvement potential.
- ‏uncertain liquidity.
- ‏route latency.
- ‏venue-specific markout.

---

# ‏232. `Unknown Unknowns`

‏Market microstructure מכילה פרטים שלא תמיד נוכל לראות.

‏לכן מודל מקצועי לא מעמיד פנים שהוא יודע הכול.

---

# ‏233. `Uncertainty Budget`

‏אפשר להגדיר:

```text
execution_uncertainty <= threshold
```

‏כתנאי למסחר.

---

# ‏234. `Confidence-Aware Execution`

‏ככל confidence נמוך יותר:

- ‏קטן size.
- ‏מוגבלת aggressiveness.
- ‏או מתקבל `NO TRADE`.

---

# ‏235. `Model Confidence` אינו Market Confidence

‏צריך להבדיל:

```text
signal confidence
execution confidence
```

---

# ‏236. `Trade Readiness`

‏העסקה מוכנה רק אם שניהם מספיקים.

---

# ‏237. `Hidden Liquidity` אינה Edge בפני עצמה

‏עצם זה שקיימת hidden liquidity לא יוצר רווח.

---

# ‏238. היא Execution Phenomenon

‏היא משפיעה על:

- ‏fill.
- ‏cost.
- ‏impact.
- ‏timing.

---

# ‏239. `Midpoint` אינו Alpha

‏Midpoint יכול לשפר execution, אבל לא מחליף signal טוב.

---

# ‏240. `Pegging` אינו Alpha

‏הוא כלי execution.

---

# ‏241. `ATS` אינו Alpha

‏גם הוא כלי execution environment.

---

# ‏242. Edge Stack

```text
Predictive Edge
+ Selection Quality
+ Execution Quality
- Costs
- Risk
= Net Outcome
```

---

# ‏243. סדר העבודה המקצועי

```text
First prove predictive edge
Then prove executable edge
Then optimize advanced execution
```

---

# ‏244. Anti-Pattern: להתחיל מ־Dark Pools

‏אם עדיין לא הוכחנו שה־Scanner בוחר נכון, optimizing ATS הוא premature optimization.

---

# ‏245. Anti-Pattern: Assume Hidden Fill

‏Backtest שמקבל hidden fill ללא evidence הוא fiction.

---

# ‏246. Anti-Pattern: Midpoint Always Better

‏מתעלם מ־fill risk ו־opportunity cost.

---

# ‏247. Anti-Pattern: Peg Forever

‏Order שעוקבת אחרי מחיר ללא max chase יכולה למחוק את ה־edge.

---

# ‏248. Anti-Pattern: Reserve by Default

‏אם size קטן, אין הצדקה אוטומטית למורכבות.

---

# ‏249. Anti-Pattern: Venue Magic

‏אין venue “טוב תמיד”.

---

# ‏250. Anti-Pattern: Ignore Unknown

‏אם לא יודעים liquidity source, רושמים `UNKNOWN`.

---

# ‏251. Practitioner Insight

‏במערכת short-horizon, execution quality יכולה להפוך signal חיובי לעסקה שלילית ולהפך.

---

# ‏252. Practitioner Insight

‏לפעמים execution tactic שממלא פחות Orders מייצרת Net PnL טוב יותר.

---

# ‏253. Practitioner Insight

‏Price improvement של cent אחד יכול להיות חסר ערך אם signal decays מהר יותר מזמן ההמתנה.

---

# ‏254. Practitioner Insight

‏Displayed depth יכולה להיות פחות חשובה מההתנהגות שלה לאורך זמן.

---

# ‏255. Practitioner Insight

‏Replenishment pattern יכול להיות אינפורמטיבי, אבל inference חייב להישאר probabilistic.

---

# ‏256. Practitioner Insight

‏Capability support אצל broker/venue הוא contract, לא assumption.

---

# ‏257. Practitioner Insight

‏Advanced execution צריך להיות versioned בדיוק כמו Strategy.

---

# ‏258. Practitioner Insight

‏שינוי execution policy יכול לשנות PnL גם בלי שינוי signal אחד.

---

# ‏259. Practitioner Insight

‏לכן Strategy Version ו־Execution Version נשמרים בנפרד.

---

# ‏260. Baseline לרובוט שלנו

‏בשלב ראשון:

```text
Broad MarketDataProvider
→ Scanner
→ Top Candidate
→ Execution Readiness
→ Simple Execution Baseline
```

---

# ‏261. Challenger ראשון

‏`Midpoint-first` מול `Marketable Limit` יכול להיות ניסוי סביר כאשר spread/TTL מצדיקים זאת.

---

# ‏262. Challenger שני

‏`Pegged` רק אחרי שיש לנו telemetry טובה על repricing ו־signal decay.

---

# ‏263. Reserve

‏רק אם position size נעשה מספיק גדול כדי ש־display size/impact באמת רלוונטיים.

---

# ‏264. ATS

‏רק כאשר יש broker capability, evidence ויכולת למדוד execution outcome.

---

# ‏265. Acceptance Checklist

‏לפני tactic מתקדמת:

- ‏Capability ידועה.
- ‏Fallback מוגדר.
- ‏Price protection מוגדרת.
- ‏TTL מוגדר.
- ‏State machine מוגדרת.
- ‏Recovery מוגדר.
- ‏Telemetry קיימת.
- ‏Backtest assumptions מסומנות.
- ‏Shadow/Paper validation בוצעה.
- ‏Success metric מוגדר.

---

# ‏266. שאלות ידע

‏בסיום הפרק צריך לדעת לענות:

1. ‏למה displayed depth אינה מלוא liquidity?
2. ‏מה ההבדל בין hidden ל־reserve?
3. ‏למה midpoint fill אינו מובטח?
4. ‏מה pegged order עושה?
5. ‏למה price cap חשוב ב־peg?
6. ‏מה ההבדל בין lit venue ל־ATS?
7. ‏למה hidden liquidity מקשה על backtest?
8. ‏למה no-fill חייב להיכלל בניתוח?
9. ‏למה price improvement לבדו אינו metric מספיק?
10. ‏למה advanced tactic צריכה capability/fallback/recovery מפורשים?

---

# ‏267. כלל הזהב

> ‏**מה שלא רואים בספר יכול להשפיע על הביצוע, אבל מה שלא רואים גם אסור להפוך לעובדה מדומה. מודל מקצועי מפריד בין Observed, Inferred ו־Unknown.**

---

# ‏268. מעבר לשלב הבא

‏אחרי שהבנו liquidity חבויה, midpoint, pegging ו־ATS, השלב הבא הוא לעבור מ־order tactics בודדות לאלגוריתמי Execution מתקדמים שמנהלים פקודה לאורך זמן.

‏בשלב 41 נלמד:

```text
Adaptive
Arrival Price
VWAP
TWAP
POV
Accumulate / Distribute
```

‏ונבין מתי הם מתאימים, מה הם מנסים לאופטם, ולמה רובם תוכננו בעיקר לניהול orders גדולים יותר — ולכן צריך לבדוק בזהירות מה בכלל רלוונטי לרובוט קצר-הטווח שלנו.
