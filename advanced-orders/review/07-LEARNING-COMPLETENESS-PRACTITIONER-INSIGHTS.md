# ‏Review 7 — Learning Completeness and Practitioner Insights

> ‏סקירה שביעית מתוך סדרת Reviews לקורס `Advanced Order Mastery`.
>
> ‏מטרת השלב הזה אינה לתקן עדיין את הקורס, אלא לבדוק האם הקורא מקבל לא רק semantics נכונים, אלא גם את שכבת ה־judgment שאיש Execution מנוסה לומד אחרי הרבה Orders: מה נראה אינטואיטיבי אבל מטעה, מה באמת צריך למדוד, אילו trade-offs נוטים להסתתר מאחורי שם יפה של Order Type, ואילו מסקנות אסור להסיק מהגדרה רשמית בלבד.
>
> ‏Scope: Advanced Orders וה־Execution שלהן בלבד.
>
> ‏זהו ה־Review האחרון לפני `Final Gap List`. אחרי ה־Gap List התיקונים עצמם יתבצעו בשלבים נפרדים, לאחר פיצול הקורס לקבצי פרקים עצמאיים.

---

# ‏1. מסקנה ראשית

‏הקורס כבר חזק מאוד ברמת `What` ו־`How`, ובחלקים רבים גם ברמת `Why`.

‏השכבה שעוד חסרה בצורה לא אחידה היא:

```text
What looks obvious but is wrong?
What does an experienced execution engineer watch first?
What hidden cost is easy to miss?
What does a good-looking fill fail to prove?
What does a broker feature NOT guarantee?
When does a more sophisticated order become worse than a simple one?
```

‏כלומר ה־Gap האחרון אינו עוד “Order Type שחסר”.

‏ה־Gap הוא **מקצוענות בהסקת מסקנות**.

‏לכן בתיקונים הסופיים כדאי להוסיף שכבת `Practitioner Insight` ממוקדת — לא בכל סעיף, אלא בכל משפחת Orders שבה קיימת אינטואיציה מסוכנת או trade-off שקל לפספס.

---

# ‏2. `P0` — Order Name אינו Behavior Guarantee

‏אחת התובנות החשובות ביותר בקורס צריכה להופיע באופן מפורש:

```text
Order label
!=
complete execution semantics
```

‏לדוגמה:

```text
LIMIT
```

‏לא אומר אם היא:

```text
passive
marketable
IOC
DAY
SMART
directed
hidden
post-only
part of a bracket
```

‏וגם שם מתקדם כגון:

```text
MidPrice
Adaptive
Relative
Pegged-to-Midpoint
Bracket
```

‏אינו מספיק כדי לדעת:

```text
who reprices
where state lives
what survives disconnect
whether partial fills are allowed
what happens to remainder
which route is used
what local TTL still applies
```

### ‏Practitioner Insight

> ‏אנשי Execution מנוסים לא שואלים רק “איזה Order Type שלחנו?”. הם שואלים “איזו התנהגות בפועל אישרנו, מי מנהל אותה, ומה עדיין יכול לקרות עכשיו?”.

### ‏תיקון עתידי

‏להוסיף בתחילת הקורס box קצר בשם:

```text
Never reason from the order name alone.
```

---

# ‏3. `P0` — Order מתוחכמת אינה יוצרת Edge

‏Advanced Order יכולה:

```text
preserve edge
reduce execution cost
improve fill probability
reduce stale exposure
move responsibility to broker/venue
```

‏אבל היא אינה יכולה ליצור Alpha שלא קיים.

‏זו הבחנה קריטית במיוחד כאשר לומדים הרבה Order Types ברצף, כי קל להתחיל לחשוב שיש “פקודה חכמה” שתפתור Signal חלש.

### ‏Practitioner Insight

```text
bad signal + sophisticated order
=
still a bad trade candidate
```

‏ולפעמים:

```text
simple bounded order
>
complex broker behavior
```

‏אם המורכבות מקשה עלינו להבין Fill, TTL, recovery או attribution.

### ‏תיקון עתידי

‏בכל חלק מתקדם להפריד:

```text
Execution advantage
vs
Trading edge
```

---

# ‏4. `P0` — `Best Fill` אינו בהכרח `Best Trade`

‏קורס Order Types עלול לעודד אופטימיזציה של:

```text
price improvement
spread saved
maker economics
```

‏בלי לשאול אם העסקה בכלל התבצעה בזמן שבו ה־Signal עדיין היה רלוונטי.

‏למנוע שלנו, למשל:

```text
saved 1 tick
but entered 800 ms too late
```

‏יכול להיות גרוע יותר מ־:

```text
paid the spread
but entered while the edge was alive
```

### ‏Practitioner Insight

‏צריך להפריד לפחות בין:

```text
Execution Quality
Trade Outcome
Signal Timing Quality
```

‏Order יכולה לקבל Fill “יפה” ועדיין להיות execution גרועה ביחס ל־intent.

### ‏מה למדוד

```text
arrival_price
fill_price
signal_age_at_submit
signal_age_at_first_fill
signal_age_at_last_fill
time_to_useful_fill
markout after fill
missed-move cost
```

---

# ‏5. `P0` — Fill Probability לבדה היא Objective מסוכן

‏אפשר לשפר Fill Rate על ידי הפיכת Orders ליותר אגרסיביות.

‏אבל:

```text
higher fill probability
```

‏יכולה להגיע עם:

```text
worse price
more adverse selection
more stale fills
more spread crossing
more price concession
```

‏ולכן אין למקסם `fill_rate` לבדה.

### ‏Practitioner Insight

> ‏No Fill הוא לפעמים תוצאה נכונה של Execution Policy — לא תקלה.

‏לדוגמה, אם ה־hard cap נשמר והמחיר ברח מעבר ל־Edge, No Fill הוא evidence שה־guardrail עבד.

### ‏תיקון עתידי

‏בכל משפחת Entry להראות:

```text
fill rate
+
execution cost
+
missed opportunity
+
post-fill markout
```

‏ולא Metric יחיד.

---

# ‏6. `P0` — Passive Fill אינו “Fill זול” באופן אוטומטי

‏Passive Order נראית אטרקטיבית משום שהיא עשויה:

```text
avoid crossing spread
potentially receive better price
```

‏אבל Fill פסיבי אינו random sample.

‏לעיתים Fill מגיע דווקא כאשר הצד השני שמח לבצע מולנו משום שהשוק עומד לזוז נגדנו.

### ‏Practitioner Insight

```text
passive fill
can be conditional on adverse selection
```

‏כלומר:

> ‏העובדה שקיבלנו מחיר טוב יותר אינה מוכיחה שקיבלנו Execution טובה יותר.

### ‏מה למדוד

```text
fill vs no-fill cohorts
post-fill markout
queue wait
signal decay while waiting
price move after passive fill
price move after missed passive fill
```

---

# ‏7. `P0` — Queue Position היא Asset שמתיישנת ויכולה להיהרס

‏כאשר Passive Order כבר ממתינה, היא צברה משהו שלא רואים בשדה price:

```text
queue age / queue position value
```

‏שינוי מחיר, cancel/new או broker-side resubmission יכולים לאבד את היתרון הזה.

### ‏Practitioner Insight

> ‏Modify אינו “רק לשנות מספר”. הוא יכול לשנות את הסיכוי העתידי ל־Fill גם אם המחיר החדש נראה טוב יותר.

‏מצד שני, אסור להיאחז בתור רק משום שכבר חיכינו בו.

```text
queue sunk-cost fallacy
```

‏הוא failure mode אמיתי:

> ‏“כבר חיכיתי 600 ms, אז נשאיר אותה עוד קצת” — למרות שה־Signal מת.

### ‏תיקון עתידי

‏להוסיף distinction:

```text
queue value
vs
signal freshness
```

‏וה־Signal תמיד יכול לבטל את הערך של queue ישנה.

---

# ‏8. `P0` — `IOC` היא גם כלי ניסוי, לא רק Time-in-Force

‏`IOC` נתפסת לעיתים כ־“תנסה עכשיו ותבטל שארית”.

‏אבל מבחינת Research היא מייצרת boundary נקי:

```text
what was executable immediately within this price bound?
```

‏במקום להשאיר Order חיה ולערבב:

```text
market movement
queue waiting
signal decay
later liquidity
```

### ‏Practitioner Insight

‏`Marketable Limit + IOC` יכולה להיות baseline מחקרי מצוין משום שהיא הופכת attempt ל־event מוגדר היטב.

‏היא אינה בהכרח ה־winner, אבל היא קלה יותר ל־attribution.

### ‏תיקון עתידי

‏להוסיף:

```text
IOC as an execution primitive
and
IOC as an experimental-control primitive
```

---

# ‏9. `P1` — `FOK`, `AON` ו־`MinQty`: פחות Partial אינו בהכרח טוב יותר

‏הפיתוי ברור:

```text
partial fills are annoying
→ prevent them
```

‏אבל constraints על minimum/full quantity יכולים להוריד משמעותית Fill Probability.

### ‏Practitioner Insight

> ‏Partial Fill היא בעיית state שצריך לדעת לנהל; לא תמיד נכון לנסות להעלים אותה דרך Order constraint.

‏אם 40 מתוך 100 מניות עדיין יוצרות Exposure שימושית, AON/FOK עלולות להפסיד הזדמנות שהמנוע דווקא היה יכול לנצל בבטחה.

### ‏שאלת Decision נכונה

```text
Is partial exposure economically useful?
```

‏ולא:

```text
Do I dislike partial fills?
```

---

# ‏10. `P0` — `Post Only` היא Constraint, לא “Passive Plus”

‏קל להציג `Post Only` כגרסה משופרת של Limit פסיבית.

‏אבל בפועל היא אוכפת:

```text
DO NOT TAKE LIQUIDITY
```

‏וזו החלטה כלכלית חזקה.

### ‏Practitioner Insight

‏אם העסקה כדאית רק כל עוד לא משלמים Spread — `Post Only` יכולה להיות guardrail מצוין.

‏אבל אם:

```text
missed move cost >> spread cost
```

‏היא יכולה להפוך את המנוע לעקבי מאוד בלהחמיץ עסקאות.

### ‏Common Wrong Conclusion

```text
maker = good
taker = bad
```

‏זו מסקנה שגויה.

‏המדד הוא `net executable edge`, לא label של maker/taker.

---

# ‏11. `P1` — Hidden, Iceberg ו־Discretionary פותרות Problems שונים

‏שלושתן נראות “פקודות שמסתירות משהו”, אבל הן מסתירות דברים שונים:

```text
Hidden
→ hide displayed presence/size

Iceberg / Reserve
→ reveal only a slice of quantity

Discretionary
→ displayed price can understate hidden execution willingness
```

### ‏Practitioner Insight

> ‏לפני שבוחרים mechanism של concealment צריך לשאול איזה מידע בכלל מנסים להסתיר.

‏ועוד יותר חשוב:

> ‏אם הכמות שלנו קטנה ביחס לנזילות, לעיתים אין שום footprint ששווה את המורכבות.

### ‏Common Wrong Conclusion

```text
more hidden = more sophisticated = better
```

‏לא נכון.

‏Concealment יכולה לעלות ב־priority, fill transparency, debugging ו־implementation complexity.

---

# ‏12. `P0` — Midpoint אינו “Half Spread בחינם”

‏`MidPrice` / midpoint execution נשמעות כמו פתרון קסם:

```text
buy below ask
sell above bid
```

‏אבל אין ודאות שנקבל Fill.

### ‏Practitioner Insight

‏המחיר הטוב יותר נקנה באמצעות:

```text
waiting risk
no-fill risk
signal decay
conditional liquidity
routing / implementation dependence
```

‏לכן השאלה אינה:

```text
Can I save half the spread?
```

‏אלא:

```text
Is the expected price improvement worth the expected delay and no-fill cost?
```

### ‏מה למדוד

```text
midpoint fill rate
median time to fill
signal age at fill
midpoint no-fill missed move
post-fill markout
```

---

# ‏13. `P0` — Pegged / Relative מעבירות Repricing Responsibility, לא מבטלות אותה

‏בפקודה Pegged המנוע אינו חייב לשלוח cancel/replace על כל שינוי Quote.

‏אבל זה לא אומר שבעיית repricing נעלמה.

‏היא עברה ל־Broker/Venue לפי formula מסוים.

### ‏Practitioner Insight

```text
less local repricing logic
!=
less repricing risk
```

‏המנוע עדיין חייב להבין:

```text
reference price
offset
cap
one-way vs two-way behavior
route semantics
signal TTL
when the peg must die
```

‏במיוחד:

> ‏Order יכולה להמשיך לעקוב אחרי השוק באופן “נכון” לפי ה־Peg בזמן שה־Signal שלנו כבר מת.

‏לכן local watchdog נשאר חובה.

---

# ‏14. `P1` — Snap היא One-Shot Decision, לא Peg איטית

‏`Snap` יכולה להיראות דומה ל־Peg משום שמחירה נגזר מ־market reference.

‏אבל ה־mental model שונה:

```text
Peg
→ ongoing relationship to reference

Snap
→ derive once, then become fixed Limit
```

### ‏Practitioner Insight

‏זה אומר שהסיכון המרכזי ב־Snap הוא לא broker repricing מתמשך אלא:

```text
stale derived price
```

‏אחרי ה־snapshot הראשוני.

‏לכן application TTL ו־fresh-decision logic חשובים במיוחד.

---

# ‏15. `P0` — Broker Algo אינו מכיר את ה־Alpha הפרטי שלנו

‏`Adaptive` או Broker Algo אחר יכול להיות מצוין בביצוע Order לפי objective שהוגדר לו.

‏אבל הוא אינו יודע בהכרח:

```text
our signal is decaying
another symbol became better
our opportunity ranking changed
our private exit model reversed
```

### ‏Practitioner Insight

> ‏Delegating execution is not delegating strategy judgment.

‏לכן תמיד נשארת שכבה מקומית של:

```text
intent validity
application TTL
cancel authority
risk limits
cap
reconciliation
```

### ‏Common Wrong Conclusion

```text
Adaptive = broker will figure out the best thing to do
```

‏לא.

‏ה־Broker מנהל את ה־execution objective שקיבל, לא את כל ה־Strategy שלנו.

---

# ‏16. `P1` — Sweep-to-Fill: מהירות יכולה להיות גם Information

‏`Sweep-to-Fill` רלוונטית כאשר urgency גבוהה ורוצים לצרוך נזילות בכמה destinations/levels בתוך cap.

‏אבל “ביצוע מהר יותר” אינו free option.

### ‏Practitioner Insight

‏Aggressive multi-venue consumption יכולה לשנות:

```text
fees
split-fill pattern
visible footprint
price impact
subsequent liquidity
```

‏ולכן צריך למדוד אותה מול:

```text
Marketable Limit + IOC
plain SMART marketable Limit
Adaptive Urgent
```

‏באותו Market State.

‏אין להכריז עליה Winner בגלל fill speed בלבד.

---

# ‏17. `P1` — Market-to-Limit יכולה להשאיר אחריה Order שכבר אינה מייצגת את ה־Intent

‏ה־hybrid behavior שלה מושך:

```text
get immediate execution
then rest remainder as Limit
```

‏אבל החלק השני קורה אחרי שה־Market כבר השתנה.

### ‏Practitioner Insight

‏ה־remainder אינה “המשך אוטומטי בטוח” של העסקה.

‏היא צריכה להיבחן כמו כל Order חיה אחרת:

```text
is signal still valid?
is remaining size still useful?
is fill price still economically valid?
has a better opportunity appeared?
```

‏לכן application TTL עדיין קריטית.

---

# ‏18. `P0` — Stop היא Trigger Policy, לא Loss Guarantee

‏אחת הטעויות הנפוצות ביותר בלמידת Stops היא לקרוא Stop Price כאילו היא worst exit price.

### ‏Practitioner Insight

```text
Stop Market
→ stronger position-exit intent
→ weaker price certainty

Stop Limit
→ stronger price constraint
→ weaker exit certainty
```

‏אין כאן “גרסה טובה יותר”.

‏יש trade-off בין:

```text
price certainty
and
position certainty
```

### ‏Common Wrong Conclusion

```text
stop at 50.00
=> loss is capped at 50.00
```

‏זו מסקנה שאסור לקורס להשאיר אפשרות להסיק.

---

# ‏19. `P1` — Trailing Orders הן Path-Dependent

‏שני trades יכולים להגיע לאותו מחיר סופי אבל לייצר trigger שונה אם הדרך לשם הייתה שונה.

### ‏Practitioner Insight

‏Trailing Stop אינה פונקציה רק של:

```text
current_price
```

‏אלא של:

```text
best favorable price reached so far
+
trail rule
+
trigger semantics
```

‏לכן Backtest, replay ו־recovery חייבים לשחזר את path/state הנכון ולא רק snapshot אחרון.

---

# ‏20. `P0` — Bracket אינה Transaction

‏Bracket נראית ב־UI כמו מבנה יחיד:

```text
entry
+ target
+ stop
```

‏אבל במימוש מדובר בכמה Orders וביחסי parent/child/transmit.

### ‏Practitioner Insight

> ‏ה־UI מציגה “אסטרטגיה אחת”; ה־Broker מטפל במספר ישויות שיכולות להיכנס למצבים שונים.

‏לכן צריך לחשוב על:

```text
partial parent fill
child activation
child reject
sibling cancel pending
late fill
manual intervention
reconnect
```

‏ולא רק על שלושת המחירים.

### ‏Common Wrong Conclusion

```text
Bracket exists
=> position is protected atomically
```

‏אסור להסיק זאת.

---

# ‏21. `P0` — OCA/OCO היא Coordination Primitive, לא Database Transaction

‏כאשר אחת מתבצעת והאחרת אמורה להתבטל, עדיין קיימת מערכת מבוזרת עם latency ואירועים אסינכרוניים.

### ‏Practitioner Insight

‏המנוע צריך לחשוב תמיד במונחי:

```text
potentially executable sibling quantity
```

‏ולא רק:

```text
which sibling should theoretically survive
```

‏Cancel pending נשאר Exposure אפשרית עד evidence אחר.

---

# ‏22. `P0` — הדבר החשוב ביותר ב־Exit הוא “מי עוד יכול לצאת?”

‏זו אחת התובנות המקצועיות החזקות ביותר בחלק 10C וראוי להבליט אותה מוקדם יותר.

‏כאשר Position קיימת, ייתכן שעדיין יכולים לבצע:

```text
old entry remainder
profit-taking child
stop child
local client exit
OCA sibling
manual broker order
another API client
```

### ‏Practitioner Insight

> ‏לפני ששולחים Exit חדשה, לא מספיק לדעת מה ה־Position. צריך לדעת את גרף כל ה־Orders שעדיין מסוגלות לשנות אותה.

‏זו הסיבה ש־`Exit Ownership` היא concept מרכזי ולא implementation detail.

---

# ‏23. `P0` — Cancel אינו Erase

‏הקורס כבר אומר זאת, אבל זה מספיק חשוב כדי להפוך ל־Practitioner Rule מרכזי.

```text
cancel requested
!=
cancelled
```

### ‏Practitioner Insight

‏במערכת אמיתית, הזמן המסוכן ביותר יכול להיות דווקא בין:

```text
CANCEL_SENT
and
CANCEL_CONFIRMED
```

‏כי המנוע כבר “רוצה” שה־Order תיעלם, אבל ה־Broker/Venue עדיין יכול לבצע אותה.

### ‏תיקון עתידי

‏להוסיף בכל משפחה שבה replacement אפשרי:

```text
What remains executable during cancel/replace?
```

---

# ‏24. `P0` — Modify אינו Free

‏Modify יכולה:

```text
change price
change size
change time policy
```

‏אבל השפעתה אינה רק field update.

### ‏Practitioner Insight

‏היא יכולה לשנות:

```text
queue priority
broker processing state
route behavior
race surface
```

‏ולכן:

```text
modify
vs
cancel + new
```

‏היא Decision execution אמיתית, לא preference של API syntax.

---

# ‏25. `P0` — `UNKNOWN` היא State מקצועית, לא Error שצריך להעלים

‏מערכת לא תמיד יודעת בוודאות אם:

```text
submit reached broker
cancel succeeded
child is active
stop triggered
fill happened before disconnect
```

### ‏Practitioner Insight

> ‏מערכת מקצועית אינה ממציאה certainty כדי להמשיך מהר.

‏היא אומרת:

```text
UNKNOWN
```

‏ומפעילה policy שמרנית בהתאם.

‏ב־Entry זה בדרך כלל אומר לא להוסיף Risk.

‏ב־Exit זה יכול לומר דווקא להעדיף reconciliation/risk reduction.

---

# ‏26. `P0` — Broker Truth מנצחת Intent בזמן Recovery

‏Intent מקומי אומר מה רצינו שיקרה.

‏Broker state ו־executions אומרים מה יכול להיות שקרה בפועל.

### ‏Practitioner Insight

```text
intent is evidence of desired behavior
broker/execution state is evidence of financial reality
```

‏אחרי reconnect אסור “לשחזר” Orders מתוך הזיכרון המקומי לפני reconciliation.

‏ראשית:

```text
positions
executions
working / unknown orders
protection graph
```

‏ורק אחר כך Strategy חוזרת לקבל authority.

---

# ‏27. `P1` — יותר Automation יכולה להקטין Explainability

‏Advanced Orders ו־Broker Algos חוסכות local logic.

‏זה יתרון.

‏אבל הן גם יכולות להפחית observability של:

```text
why repricing happened
which venue received which slice
why fill timing changed
why remainder behaved differently
```

### ‏Practitioner Insight

> ‏אל תמדוד complexity רק לפי כמה שורות קוד חסכנו במנוע.

‏צריך למדוד גם:

```text
debuggability
attribution quality
replay fidelity
acceptance-test burden
```

‏Order מתוחכמת שאיננו יכולים להסביר אחרי Fill בעייתית למחקר.

---

# ‏28. `P1` — Capability היא Property של Combination, לא Feature Flag גלובלי

‏הקורס כבר בונה Capability Matrix נכון.

‏השכבה המקצועית שצריך להבליט היא:

```text
supported somewhere
!=
supported here
```

‏Capability יכולה להיות תלויה ב־:

```text
product
contract
account
legal entity
route
venue
session
API
order combination
```

### ‏Practitioner Insight

‏Order Type שנראתה אתמול ב־TWS אינה Production proof עבור כל Symbol וכל route.

‏לכן `PRODUCTION_ENABLED` היא evidence state, לא documentation lookup בלבד.

---

# ‏29. `P1` — Entry ו־Exit לא צריכים סימטריה

‏אותה primitive יכולה להיות נכונה אחרת ב־Entry וב־Exit.

‏ב־Entry:

```text
NO_TRADE
```

‏היא תמיד אפשרות לגיטימית.

‏כאשר Position כבר קיימת:

```text
do nothing
```

‏יכולה להיות החלטה מסוכנת אם ה־Intent כבר דורש הפחתת Risk.

### ‏Practitioner Insight

‏לכן אין לבנות כלל:

```text
entry mode X
=> exit with mirror of X
```

‏Exit urgency, ownership ו־protection state משנים את הבעיה לחלוטין.

---

# ‏30. `P1` — Chase היא Market Order מוסווית אם אין Budget קשיח

‏הקורס כבר מזהיר מ־chase, אבל כדאי להפוך זאת ל־rule שקל לזכור.

```text
Limit 50.01
→ 50.02
→ 50.03
→ 50.04
...
```

‏ללא recalculation של Edge ו־hard cap, אין באמת price control.

### ‏Practitioner Insight

‏כל concession צריכה להיות cumulative:

```text
how much price have we already conceded?
```

‏ולא רק:

```text
is the next tick acceptable?
```

‏אחרת series של “צעדים קטנים” יכולה לחרוג מאוד מה־economic intent המקורי.

---

# ‏31. `P1` — No-Fill, Partial Fill ו־Reject הם שלוש תוצאות שונות

‏קל לחבר את כולן תחת:

```text
order did not complete
```

‏אבל הן מספרות דברים אחרים:

```text
NO_FILL
→ market/order interaction outcome

PARTIAL_FILL
→ position changed; new financial state

REJECT
→ order never became valid execution path as intended
```

### ‏Practitioner Insight

‏Fallback אחרי Reject אינו צריך להיראות כמו escalation אחרי No-Fill.

‏Capability conflict, invalid field או route reject לא נותנים שום סיבה כלכלית להרחיב Price Cap.

---

# ‏32. `P1` — “יותר Smart” יכול להיות פחות מתאים ל־Short-Horizon Signal

‏Order או Algo sophisticated יכולה להיות מצוינת עבור institutional execution ארוך יותר, אבל לא מתאימה ל־signal שחי מאות milliseconds או שניות.

### ‏Practitioner Insight

‏צריך להשוות sophistication ל־decision horizon:

```text
if order behavior evolves more slowly than the signal lifetime
then sophistication may be irrelevant or harmful
```

‏לכן long-horizon algos נשארים Reference גם אם הם מקצועיים מאוד.

---

# ‏33. `P1` — Measurability היא חלק מאיכות Order Candidate

‏כאשר שתי Orders דומות ב־expected economics, עדיף לעיתים להתחיל במחקר עם זו שקל יותר למדוד ולשחזר.

### ‏Practitioner Insight

```text
slightly less clever
but measurable and replayable
```

‏יכול להיות Baseline טוב יותר מ־:

```text
opaque behavior with unclear attribution
```

‏זה חשוב במיוחד בשלבי Research / Shadow לפני Production.

---

# ‏34. `P1` — צריך ללמד גם “מתי לא להשתמש ב־Advanced Order בכלל”

‏בכמה מצבים הפתרון המקצועי הוא לא למצוא Order מתוחכמת יותר.

‏לדוגמה:

```text
liquidity too thin
signal almost expired
spread consumes edge
position size too large relative to depth
capability uncertain
state inconsistent
```

‏אז התשובה יכולה להיות:

```text
REDUCE SIZE
NO TRADE
CANCEL
EXIT ONLY
WAIT FOR RECONCILIATION
```

### ‏Practitioner Insight

> ‏Advanced Orders הן toolkit. הן אינן חובה להשתמש בהן.

---

# ‏35. `P0` — חסר Format אחיד ל־Practitioner Layer

‏במקום להוסיף עוד פסקאות אקראיות, מומלץ לכל משפחה חשובה להשתמש ב־mini-block קבוע:

```text
PRACTITIONER INSIGHT
The counter-intuitive truth.

COMMON WRONG CONCLUSION
What a smart beginner may incorrectly infer.

WHAT TO MEASURE
The evidence needed to decide whether this order helps us.

FAILURE TO WATCH
The failure mode that matters most in production.
```

‏לא כל Order צריכה את כל ארבעת הסעיפים.

‏אבל כאשר יש misconception מהותי — לפחות `Practitioner Insight` + `Common Wrong Conclusion` צריכים להופיע.

---

# ‏36. רשימת `Practitioner Insights` שחייבת להופיע בתוצר הסופי

‏לפחות התובנות הבאות צריכות להיות גלויות וברורות בקורס הסופי:

1. ‏Order name אינו execution semantics מלאים.
2. ‏Advanced Order אינה יוצרת Alpha.
3. ‏Best Fill אינו בהכרח Best Trade.
4. ‏No Fill יכולה להיות outcome נכונה.
5. ‏Passive Fill יכולה להיות adversely selected.
6. ‏Queue position היא asset אבל Signal freshness קודמת לה.
7. ‏IOC היא גם כלי attribution/research.
8. ‏Partial Fill אינה בהכרח דבר שצריך למנוע.
9. ‏Post Only היא constraint, לא “passive better”.
10. ‏Hidden, Iceberg ו־Discretionary מסתירות דברים שונים.
11. ‏Midpoint אינו half-spread free lunch.
12. ‏Pegged מעבירה repricing authority; היא לא מסירה את הצורך ב־watchdog.
13. ‏Snap היא one-shot derivation ולא continuous peg.
14. ‏Broker Algo אינו יודע את ה־private alpha שלנו.
15. ‏Sweep speed אינה metric יחידה.
16. ‏Market-to-Limit remainder יכולה להפוך stale.
17. ‏Stop Price אינה guaranteed exit price.
18. ‏Trailing logic היא path-dependent.
19. ‏Bracket אינה atomic transaction.
20. ‏OCA/OCO אינה transactional guarantee.
21. ‏ב־Exit השאלה היא מי עוד עדיין מסוגל לבצע.
22. ‏Cancel request אינו erase.
23. ‏Modify אינה free מבחינת queue/state.
24. ‏UNKNOWN היא state אמיתית.
25. ‏Broker truth קודמת ל־Intent בזמן recovery.
26. ‏Automation יכולה להקטין explainability.
27. ‏Capability היא combination-specific.
28. ‏Entry ו־Exit אינן מראה אחת של השנייה.
29. ‏Chase ללא cumulative budget היא Market מוסווית.
30. ‏Reject, No-Fill ו־Partial הם outcomes שונים.
31. ‏Order sophistication צריכה להתאים ל־signal horizon.
32. ‏Measurability היא שיקול בבחירת Research Candidate.
33. ‏לפעמים הפתרון המקצועי הוא לא להשתמש ב־Advanced Order בכלל.

---

# ‏37. מה לא צריך להוסיף

‏כדי לשמור Scope נכון, אין צורך להרחיב את המיני־קורס ל־:

```text
market-data engineering
scanner design
full microstructure course
portfolio construction
general production architecture
full broker tutorial
```

‏אלא רק להפנות אליהם כאשר הם משנים ישירות semantics של Order מתקדמת.

‏גם אין צורך ליצור “רז מקצוע” עבור כל subsection. עודף boxes יהפוך את המסמך לרועש.

‏המטרה היא לבחור את המקומות שבהם intuition שגויה עלולה להוביל ל־Execution decision שגויה.

---

# ‏38. מסקנת Review 7

‏מבחינת Learning Completeness, הקורס קרוב מאוד לשלמות מקצועית בתחום שהוגדר.

‏הפערים שנותרו אינם מצדיקים הרחבה אינסופית.

‏הם מתחלקים כעת לשלוש קבוצות ברורות:

```text
1. Missing advanced-order concepts
   identified in Review 2.

2. Structural / terminology / comparison / failure gaps
   identified in Reviews 1, 3, 4, 5 and 6.

3. Practitioner judgment layer
   identified in this Review 7.
```

‏לכן השלב הבא צריך להיות **`Final Gap List` אחד**, שבו נאחד את כל ה־Reviews, נסיר כפילויות, ניתן לכל Gap מזהה ו־priority, ונחלק מראש את שלבי התיקון.

‏לאחר ה־Gap List:

```text
split master safely into chapter files
→ repair in multiple stages
→ add missing advanced-order material
→ normalize terminology and practitioner blocks
→ cross-chapter consistency pass
→ manifest
→ deterministic local assembler
→ generated master
→ print viewer / compact print layout
→ final verification
```

‏עד אז אין לבצע תיקונים במסמך הראשי.
