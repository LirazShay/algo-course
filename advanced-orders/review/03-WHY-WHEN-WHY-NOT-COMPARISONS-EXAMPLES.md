# ‏Review 3 — Why / When / Why Not, Comparisons and Decision Examples

> ‏סקירה שלישית מתוך סדרת Reviews לקורס `Advanced Order Mastery`.
>
> ‏מטרת השלב הזה אינה לתקן עדיין את הקורס, אלא לבדוק האם כל משפחת Advanced Orders מלמדת לא רק `What`, אלא גם `Why`, ‏`When`, ‏`Why Not`, ‏האלטרנטיבה הקרובה והדוגמה שמכריעה ביניהן.
>
> ‏Scope: פקודות מתקדמות ו־Execution שלהן בלבד. לא מרחיבים לנושאי Market Data, ‏Scanner או Microstructure כללית אלא כאשר הם נדרשים ישירות להבנת בחירת הפקודה.

---

# ‏1. מסקנה ראשית

‏הבעיה אינה שהקורס חסר עומק טכני. להפך — בחלקים רבים יש עומק גבוה מאוד.

‏הפער הוא **אי־אחידות פדגוגית**:

```text
Family A:
semantics + failure modes + example + comparison + engine relevance

Family B:
semantics + many details
but reader must infer the decision rule alone
```

‏לכן התיקון העתידי לא צריך להיות "להוסיף עוד טקסט בכל מקום".

‏הוא צריך ליצור שכבת Decision קבועה לכל משפחה מרכזית:

```text
WHAT
WHY
WHEN
WHY NOT
CLOSEST ALTERNATIVE
MAIN FAILURE MODE
FOR OUR ENGINE
MINI EXAMPLE
```

‏כך הקורס יהפוך מאנציקלופדיית semantics למדריך החלטה מקצועי.

---

# ‏2. ממצא `P0` — חסרה תבנית Decision אחידה לכל משפחת Order

‏היום חלק מהפרקים כבר עונים יפה על:

```text
what it does
what can go wrong
how it maps to IBKR
```

‏אבל לא תמיד הקורא מקבל תשובה מפורשת:

```text
Why would I choose this instead of the nearest alternative?
```

‏זה קריטי במיוחד כאשר שתי פקודות נראות דומות בשם אבל שונות ב־ownership של repricing, ‏trigger semantics, ‏remainder behavior או routing.

### ‏תיקון עתידי

‏לכל משפחה משמעותית להוסיף mini-card אחיד:

```text
What:
ה־semantics בקצרה.

Why:
איזו בעיית Execution הפקודה פותרת.

When:
באיזה regime/intent היא Candidate טובה.

Why Not:
מה הסיבה המרכזית לא לבחור בה.

Closest Alternative:
מה המתחרה הישירה ולמה היא שונה.

Main Failure Mode:
איך הבחירה יכולה להיכשל.

For Our Engine:
Core / Challenger / Specialist / Out-of-Scope.
```

---

# ‏3. ממצא `P0` — חייבת להיות השוואה מפורשת: `Marketable Limit + IOC` מול `Sweep-to-Fill` מול `Adaptive Urgent`

‏אלה שלושה כלים שעשויים להיראות לקורא כמו וריאציות של:

```text
fill me quickly
```

‏אבל האחריות שונה.

### ‏`Marketable Limit + IOC`

```text
Why:
לקחת מה שניתן עכשיו עד hard cap,
ולא להשאיר remainder stale.

When:
signal lifetime קצר מאוד,
immediate attempt חשוב,
remainder לא צריך להישאר working.

Why Not:
יכול לקבל partial/no-fill ולהפסיד המשך liquidity שמגיע רגע אחר כך.
```

### ‏`Sweep-to-Fill`

```text
Why:
לנסות לצרוך liquidity על פני destinations/levels במהירות תחת Limit.

When:
urgency גבוהה והכמות/נזילות מצדיקות multi-venue aggressive behavior.

Why Not:
מורכבות fill/venue telemetry גבוהה יותר;
לא בהכרח דרושה ל-order קטן מאוד.
```

### ‏`Adaptive Urgent`

```text
Why:
להאציל חלק מה־execution scheduling/repricing לברוקר.

When:
רוצים aggressive broker-managed execution
אבל לא בהכרח immediate-or-cancel semantics.

Why Not:
behavior פחות deterministic למנוע המקומי,
וה־broker אינו מכיר את private signal half-life שלנו.
```

### ‏דוגמה שחסרה

‏אותו Signal ואותה כמות צריכים להיות מוצגים בשלושה תרחישים:

```text
A. remaining signal life = 300ms
B. remaining signal life = 2s
C. order size > top-of-book depth
```

‏ואז להסביר למה Candidate שונה יכולה לשרוד את ה־Elimination בכל תרחיש.

---

# ‏4. ממצא `P0` — חייבת להיות השוואה משפחתית אחת ל־`Relative`, ‏`MidPrice`, ‏`Pegged-to-Midpoint` ו־`Snap Midpoint`

‏זה אחד המקומות שבהם הקורס טכנית חזק מאוד, אבל הקורא עדיין עלול לשאול:

> ‏"כולם מזיזים או גוזרים מחיר מהשוק — אז למה לבחור אחד ולא אחר?"

‏ההשוואה צריכה להיות סביב **מי מחזיק את שינוי המחיר**.

| Family | מחיר משתנה אחרי submit? | Reference עיקרי | מי מנהל את השינוי? | שימוש רעיוני |
|---|---:|---|---|---|
| `Relative / Pegged-to-Primary` | ‏כן | ‏same-side best | ‏Broker/Venue לפי semantics | ‏להישאר תחרותי בלי client chase רציף |
| `MidPrice` | ‏כן/managed | ‏midpoint / broker route logic | ‏IBKR/SMART | ‏לחפש price improvement סביב midpoint |
| Directed `Pegged-to-Midpoint` | ‏כן | ‏midpoint | ‏Venue/Broker לפי direct route | ‏midpoint peg עם destination semantics מפורשות |
| `Snap to Midpoint` | ‏לא לאחר החישוב הראשוני | ‏midpoint בזמן submit | ‏מחושב פעם אחת ואז Limit | ‏לקבע מחיר נגזר בלי continuous repricing |

### ‏ה־Why/When שחייב להיות מפורש

```text
Need continuous repricing?
→ Snap פחות מתאים.

Need deterministic fixed price after submit?
→ Snap יכול להתאים יותר מ-Peg.

Need SMART broker-managed midpoint behavior?
→ MidPrice.

Need destination-specific midpoint peg?
→ Directed Pegged-to-Midpoint.

Need same-side quote following rather than midpoint?
→ Relative/Pegged-to-Primary.
```

### ‏דוגמה שחסרה

‏להראות Quote משתנה לאורך ארבע נקודות זמן ולצייר מה קורה למחיר של כל אחת מארבע הפקודות.

‏זו תהיה אחת הדוגמאות הלימודיות החשובות ביותר במסמך.

---

# ‏5. ממצא `P0` — `Passive Limit` מול `Post Only` צריך לקבל decision distinction קצר וברור

‏הקורס מסביר את Post Only היטב, אבל בסוף הקורא צריך לזכור משפט אחד:

```text
Passive Limit expresses current passive intent.
Post Only enforces a passive-only constraint at order handling time.
```

### ‏`Passive Limit`

```text
Why:
פשוטה, שקופה, queue-visible.

When:
כשהמחיר הנבחר passive כרגע והמערכת מוכנה להתמודד עם race.

Why Not:
השוק יכול לזוז לפני arrival והפקודה עלולה להפוך marketable.
```

### ‏`Post Only`

```text
Why:
להגן על assumption שאסור לקחת liquidity.

When:
העסקה כדאית רק אם maker/passive economics נשמרים.

Why Not:
במומנטום מהיר refusal to cross יכול להפוך missed move ליקר יותר מה-spread שנחסך.
```

### ‏דוגמה שחסרה

‏Bid/Ask משתנים בין decision timestamp ל־arrival timestamp, ולהראות כיצד שתי הפקודות יכולות להתנהג אחרת.

---

# ‏6. ממצא `P0/P1` — `Hidden`, ‏`Iceberg/Reserve` ו־`Discretionary` צריכים להופיע יחד

‏שלושתם "מסתירים משהו", אבל לא את אותו דבר.

```text
Hidden       -> hides displayed presence/quantity
Iceberg      -> hides part of total quantity
Discretionary-> hides executable price discretion beyond displayed price
```

‏ללא השוואה כזאת, קל מאוד לזכור את שלושתן כ־"orders that hide information" ולפספס את ההבדל המרכזי.

### ‏Decision שאלות

```text
What am I trying not to reveal?
- existence?
- full size?
- willingness to pay/sell farther?

Is hidden behavior worth reduced transparency/priority certainty?

Is our order size even large enough for hiding to matter?
```

### ‏For Our Engine

‏חשוב להדגיש שהבחירה הראשונית יכולה להיות בכלל:

```text
NO SPECIAL HIDING
```

‏אם הכמות שלנו קטנה ביחס לנזילות.

---

# ‏7. ממצא `P1` — חסרה מטריצת Trigger אחת: `Stop`, ‏`Stop Limit`, ‏`MIT`, ‏`LIT`

‏במקום ללמד אותן רק כארבעה שמות, כדאי להציג אותן כשני axes:

```text
Axis 1: trigger direction / condition
Axis 2: post-trigger execution behavior
```

### ‏מודל לימודי

```text
STOP family:
trigger when price moves through adverse/breakout side

TOUCHED family:
trigger when price reaches favorable/pullback side

After trigger:
Market-style -> Stop / MIT
Limit-style  -> Stop Limit / LIT
```

### ‏Why

‏כך הקורא לומד לבנות semantics, במקום לזכור שמות בעל פה.

### ‏Why Not

‏לא להפוך זאת לפרק גדול על strategy triggers; המטרה היא להבין את מבנה ה־Order.

---

# ‏8. ממצא `P1` — `Trailing Stop`, ‏`Adjustable Stop` ו־client-managed dynamic exit צריכים השוואה ישירה

‏שלושתם יכולים לייצר "הגנה שמשתנה", אבל ownership שונה:

```text
Trailing Stop
→ broker/order rule ratchets trigger continuously לפי semantics.

Adjustable Stop
→ trigger מסוים משנה order parameters / order type פעם אחת לפי configuration.

Client-managed dynamic exit
→ המנוע המקומי מחשב ומחליט מחדש.
```

### ‏Decision questions

```text
Must protection survive local-process failure?
Do we need signal-aware logic unavailable to broker order semantics?
Can we tolerate broker-managed behavior we do not recompute ourselves?
What happens during disconnect?
```

### ‏דוגמה שחסרה

‏אותו Long position עם price path עולה ואז מסתובב:

```text
100.00
100.30
100.55
100.42
100.10
```

‏ולהראות מי משנה מה בכל architecture.

---

# ‏9. ממצא `P0` — `Bracket`, ‏`OCA/OCO`, ‏`Conditional` חייבות comparison לפי סוג היחסים

‏חלק 6 עמוק מאוד, אבל כדאי להוסיף mental model קצר מאוד בתחילתו או בסופו:

```text
Bracket
= parent/child dependency + exits around a position

OCA/OCO
= mutual exclusion / sibling relationship

Conditional
= predicate controlling activation/cancellation
```

### ‏Why

‏הקורא צריך לדעת שלא מדובר בשלוש דרכים שונות לעשות "take profit + stop loss".

### ‏When

```text
Need parent-linked protection
→ Bracket

Need unrelated sibling alternatives where one invalidates/reduces others
→ OCA/OCO

Need activation based on external condition
→ Conditional
```

### ‏Why Not

‏אסור להציג אף אחת מהן כ־atomic transaction guarantee.

### ‏דוגמה שחסרה

‏אותה מטרה עסקית — protect 100-share position — בשלוש architectures:

```text
A. Broker Bracket
B. Local exit + OCA protection
C. Hybrid broker stop + local dynamic exit
```

‏ולהראות ownership ו־failure-domain בכל אחת.

---

# ‏10. ממצא `P1` — `Market-to-Limit` צריכה השוואה מפורשת ל־Marketable Limit ו־IOC

‏הערך הלימודי של `MTL` הוא remainder semantics.

```text
Marketable Limit
→ Limit מההתחלה; עשויה לבצע מיד ולנוח אם נשאר remainder לפי TIF.

Marketable Limit + IOC
→ immediate attempt; remainder מתבטלת.

Market-to-Limit
→ aggressive first execution; remainder יכולה להפוך ל-Limit הנגזרת מה-fill.
```

### ‏דוגמה שחסרה

```text
BUY 500
Ask:
100 @ 50.00
200 @ 50.01
500 @ 50.04
```

‏להראות מה יכולה להיות המשמעות של כל family מבחינת first fill, remainder, stale-order risk ו־application TTL.

---

# ‏11. ממצא `P1` — `SMART` מול Direct צריך להילמד כבחירת Responsibility, לא רק Route

‏כיום הקורס מסביר Routing לעומק, אבל כדאי לחזק mini-card:

### ‏`SMART`

```text
Why:
להאציל venue selection/re-routing ל-IBKR.

When:
אין hypothesis מוכחת ש-destination מסוים עדיף,
או שה-order family מיועדת ל-SMART.

Why Not:
פחות שליטה/שקיפות על exact path,
ויכול להיות mismatch עם מחקר venue-specific.
```

### ‏Direct

```text
Why:
לקבע destination או לקבל semantics שדורשות direct route.

When:
order type מחייב זאת או שיש evidence venue-specific.

Why Not:
לא מקבלים אוטומטית את יתרון ה-router;
"Direct = faster" אינה הנחה חוקית.
```

### ‏דוגמה שחסרה

‏אותה Pegged order כאשר destination requirement משנה בכלל אם Candidate חוקית.

---

# ‏12. ממצא `P1` — `Modify` מול `Cancel + New` מול Broker-managed repricing

‏אלה שלוש דרכים שונות להתמודד עם מחיר שכבר אינו מתאים:

```text
MODIFY EXISTING ORDER
CANCEL + SUBMIT NEW
USE A PEG/BROKER ALGO THAT REPRICES FOR US
```

‏הקורס מכסה כל רכיב, אבל חסרה השוואה ישירה.

### ‏Decision dimensions

```text
queue-priority impact
cancel/fill race
latency
state-machine complexity
price-control determinism
signal lifetime
broker capability
```

### ‏Why this matters

‏זה מחבר את חלק 5 לחלק 8 ומונע מהקורא לחשוב ש־Peg היא רק "עוד Order Type" במקום חלופה לחלק מלולאת client-side reprice.

---

# ‏13. ממצא `P1` — אותה Order Family יכולה להיות החלטה שונה ב־Entry וב־Exit

‏הקורס אומר זאת במספר מקומות, אבל כדאי להפוך זאת ל־comparison card מפורש.

### ‏דוגמה

```text
Marketable Limit + IOC on Entry:
optional risk;
no-fill may be acceptable.

Marketable Limit + IOC on Exit:
position already exists;
partial/no-fill creates remaining exposure that must be decided again.
```

‏אותו Broker primitive, אך economics ו־failure consequence שונים.

‏זה חשוב במיוחד ל־:

```text
Passive Limit
IOC
Adaptive
Stop/Stop-Limit
```

---

# ‏14. ממצא `P1` — דוגמאות צריכות להיות Decision Examples, לא רק Syntax Examples

‏בחלקים רבים קיימות דוגמאות מצוינות של syntax או price behavior.

‏אבל עבור הקורס הסופי צריך להעדיף דוגמה שמתחילה בבעיה:

```text
Signal remaining life = 1.2s
spread = 2 ticks
size = 100
visible ask depth = 600
hard cap = 50.06
partial fill useful = yes
```

‏ואז:

```text
Candidate A eliminated because...
Candidate B survives because...
Candidate C is unavailable because...
Selected behavior = ...
```

‏כך הקורא רואה את הקשר בין Order semantics לבין decision engine.

---

# ‏15. ממצא `P1` — צריך להציג גם Counterexample לכל Family חשובה

‏דוגמה טובה מראה מתי פקודה עובדת.

‏Counterexample מראה מתי היא מפתה אבל שגויה.

### ‏דוגמאות רצויות

```text
Post Only
GOOD: signal can wait and spread cost matters.
BAD: 300ms signal; missed move dominates spread savings.

Stop Limit
GOOD: price protection is essential and temporary non-fill is tolerable.
BAD: emergency protection where remaining position is unacceptable.

MidPrice
GOOD: enough signal life to seek midpoint improvement.
BAD: signal expires before likely fill; opportunity cost dominates.

Iceberg
GOOD: size materially large relative to displayed liquidity.
BAD: tiny personal order where added complexity solves no real problem.
```

‏ה־Counterexample הוא הדרך הטובה ביותר ללמד `Why Not` בלי לכתוב עוד עמודי תאוריה.

---

# ‏16. ממצא `P2` — לא לכל Order Type צריך Mini-Card מלא

‏כדי לא לנפח את המסמך מחדש, נחלק:

```text
TIER A — Core / High Challenger
full Why/When/Why Not + comparison + example

TIER B — Specialist
short card + comparison

TIER C — Product-specific / Low relevance
one-line purpose + why out of scope
```

### ‏Tier A מוצע

```text
Marketable Limit
IOC
Post Only
Relative / Pegged-to-Primary
MidPrice
Pegged-to-Midpoint
Snap Midpoint
Adaptive
Stop
Stop Limit
Trailing Stop
Bracket
OCA/OCO
Sweep-to-Fill
```

### ‏Tier B מוצע

```text
Hidden
Iceberg/Reserve
Discretionary
Market-to-Limit
Conditional
Adjustable Stop
MIT/LIT
ATS-specific pegged families
```

### ‏Tier C

‏Order Types שאינן רלוונטיות ישירות ל־US-stock short-horizon system או למודל הלימודי שלנו.

---

# ‏17. ממצא `P2` — יש להימנע מ־"Best Order" language

‏בכל mini-card חשוב לשמור ניסוח:

```text
candidate under these constraints
```

‏ולא:

```text
best order for momentum
```

‏אותה family יכולה להיות מצוינת או גרועה לפי:

```text
signal half-life
spread
size
available depth
partial-fill utility
exit feasibility
route capability
system state
```

‏ה־Decision Engine של חלק 10 צריך להישאר culmination של כל ההשוואות האלה.

---

# ‏18. תבנית Example אחידה מומלצת לתיקונים

‏כדי שהדוגמאות יהיו קצרות אך שימושיות:

```text
Scenario
--------
Side:
Position state:
Bid / Ask:
Visible depth:
Order size:
Signal life remaining:
Hard economic cap:
Partial-fill policy:
Capability constraints:

Candidates
----------
A:
B:
C:

Elimination
-----------
A eliminated because ...
B survives because ...
C eliminated because ...

Decision
--------
Chosen behavior:
Why:
What would make us choose differently:
```

‏אין צורך להשתמש בכל השדות בכל דוגמה.

---

# ‏19. `P0` — יש לבנות בסוף הקורס Comparison Index אחד

‏בנוסף ל־Problem → Candidate index שמצא Review 1, צריך גם:

```text
Compare X vs Y
```

‏לפחות עבור:

```text
Market vs Marketable Limit
Marketable Limit vs IOC
IOC vs FOK vs AON
Passive Limit vs Post Only
Hidden vs Iceberg vs Discretionary
Relative vs MidPrice vs Pegged-to-Midpoint vs Snap Midpoint
Marketable Limit + IOC vs Sweep-to-Fill vs Adaptive Urgent
Stop vs Stop Limit vs MIT vs LIT
Trailing Stop vs Adjustable Stop vs local dynamic exit
Bracket vs OCA/OCO vs Conditional
SMART vs Direct
Modify vs Cancel+New vs broker-managed repricing
```

‏זה יהפוך את המסמך המודפס לכלי Reference שימושי, לא רק חומר לקריאה רציפה.

---

# ‏20. מה לא לתקן עדיין

‏Review 3 אינו מבצע את השינויים עצמם.

‏לא:

- ‏מוסיף כעת mini-cards למסמך הראשי.
- ‏מוסיף את Sweep/Discretionary/MTL בפועל.
- ‏מפצל עדיין את master לפרקים.
- ‏מאחד את 10C/10D.
- ‏בונה את ה־assembler.
- ‏בונה Print Viewer.

‏הכול נשמר ל־`Final Gap List` ולשלבי התיקון המדורגים.

---

# ‏21. מפת תיקון שנגזרת מ־Review 3

```text
P0
- standard Why/When/Why Not card for Tier A families
- Relative/MidPrice/Pegged/Snap comparison
- Marketable IOC/Sweep/Adaptive comparison
- Bracket/OCA/Conditional relationship comparison
- Comparison Index

P1
- Passive Limit vs Post Only
- Hidden/Iceberg/Discretionary
- Stop/Stop-Limit/MIT/LIT trigger matrix
- Trailing/Adjustable/local dynamic exit
- Market-to-Limit remainder comparison
- SMART vs Direct responsibility card
- Modify vs Cancel+New vs broker-managed repricing
- Entry vs Exit same-primitive examples
- scenario-driven examples + counterexamples

P2
- tiered depth model so specialist orders do not bloat the course
- compact out-of-scope explanations
```

---

# ‏22. מסקנת Review 3

‏הקורס כבר מסביר היטב **איך** הרבה Orders עובדות.

‏השלב החסר כדי להפוך אותו למסמך Mastery אמיתי הוא להפוך את כל הידע הזה לרשת של contrasts:

```text
Why this?
Why now?
Why not the nearest alternative?
What assumption makes this choice valid?
What failure invalidates that assumption?
```

‏כלומר השיפור העתידי הוא פחות "עוד Order Types" ויותר **Decision Literacy**.

‏ה־Review הבא צריך לבדוק שכבה אחרת: **Consistency, terminology, duplication and contradictions** — האם אותו מושג נאמר באותה צורה בכל הפרקים, האם יש כפילויות שאפשר לצמצם, והאם חלק מאוחר סותר או מעדן כלל שנכתב מוקדם יותר.