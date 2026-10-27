# ‏00D — Prerequisites, Cross-References & Ownership Map

> ‏מטרת הפרק: לתת לקורא מפה אחת פשוטה של **מה צריך לדעת לפני כל חלק**, **לאן ממשיכים אחריו**, ו־**מי באמת מחזיק ומנהל את הפקודה לאחר Submit**. זהו פרק ניווט והבהרה; הוא אינו מוסיף Order Type חדשה.

---

# ‏00D.1 איך להשתמש בפרק הזה

‏אם אתה קורא את הקורס ברצף, אפשר להשתמש בפרק הזה כ־Checklist קצר לפני כל חלק.

‏אם קפצת ישר מ־`00B` לבעיה מסוימת, השתמש בטבלאות כדי לראות מה כדאי לקרוא קודם ומהו ה־follow-up המקצועי הנכון.

‏הכלל הוא:

```text
בעיה
→ prerequisite מינימלי
→ family chapter
→ comparison / failure chapter
→ engine mapping
```

‏אין צורך לקרוא את כל הקורס מחדש בכל פעם.

---

# ‏00D.2 Prerequisites לפי חלק

| חלק | מה צריך להבין קודם | אם חסר — קרא קודם | אחר כך כדאי להמשיך אל |
|---|---|---|---|
| `01` Order Language | ‏רק `Bid / Ask / Spread / Fill` בסיסיים | `00B` | `02`, `03` |
| `02` Core Execution | ‏Market מול Limit, Fill בסיסי | `01` | `02A`, `02B`, `03` |
| `02A/02B` Aggressive / Sweep / MTL | ‏Limit, marketability, partial fill | `02` | `09C`, `10F` |
| `03` Time / Fill Policy | ‏Order primitive בסיסית | `01`, `02` | `08`, `09C` |
| `04/04A/04B` Liquidity / Display | ‏Passive מול aggressive, queue בסיסית | `02` | `08A`, `10G`, `10H` |
| `05/05A` Pegged / Midpoint / Snap | ‏Limit, reference price, price bound | `02`, `04` | `07`, `08B`, `10F` |
| `06/06A/06B/06C` Trigger / Protection / Composite | ‏Position, trigger, partial fill | `01`, `02`, `03` | `08C`, `10C` |
| `07/07A` Routing / Broker Algos | ‏Primitive מול attribute מול route | `00A`, `02` | `09`, `09B` |
| `08/08A` Cancel / Replace | ‏Order lifecycle ו־working state | `01`, `03` | `08B`, `09C` |
| `08B/08C/08D` Safety / Recovery | ‏Cancel state, ownership, Position truth | `08`, `00D.4` | `09C`, `10C`, `10D` |
| `09/09B` Capability / Materialization | ‏Mode, Candidate, Primitive, Route | `00A`, `00C` | `10A`, `10B`, `10C` |
| `09C` Outcome Contracts | ‏Fill / Partial / Reject / Unknown | `08`, `00C` | `10E`, `10G` |
| `10A` Decision Gates | ‏כל שכבות ה־context | `00A`, `09B` | `10B`, `10C` |
| `10B` Entry | ‏Candidates + Capability | `09B`, `10A` | `10E`, `10F` |
| `10C` Exit / Protection | ‏Position truth + ownership | `08C`, `08D`, `10A` | `10E`, `10D` |
| `10D` Full Engine | ‏Entry, Exit, Recovery, Outcome | `10A`, `10B`, `10C`, `09C` | `10G–10I` |
| `10G–10I` Practitioner Judgment | ‏Semantics של המשפחה הרלוונטית | family chapter | חזרה ל־family עם judgment מקצועי |

---

# ‏00D.3 Cross-Reference Rules — איך מפנים בין פרקים

‏הקורס משתמש בארבעה סוגי הפניות. כדאי להבין מה כל אחת אומרת:

```text
PREREQUISITE
→ read this first if the concept is unfamiliar

SEE ALSO
→ related concept; useful but not required

FAILURE / SAFETY
→ read this before relying on the behavior in production

ENGINE MAPPING
→ how the concept becomes a Candidate / Plan / Capability requirement
```

‏דוגמה:

```text
MIDPRICE
PREREQUISITE → 02, 05
SEE ALSO → 05A, 07
FAILURE / SAFETY → 08B, 09C
ENGINE MAPPING → 09B, 10B
```

‏כך cross-reference אינה “עוד לינק”, אלא אומרת **למה** כדאי לעבור לפרק אחר.

---

# ‏00D.4 חמש מילים דומות — אבל הן עונות על שאלות שונות

‏זהו אחד המקומות שהכי קל למתחיל להתבלבל בהם:

```text
venue-native
broker-resident
broker-simulated
broker-managed
client-managed
```

‏במילים פשוטות, צריך לשאול **שלוש שאלות שונות**.

## ‏שאלה 1 — איפה ה־state ממשיך לחיות?

```text
client
broker
venue
```

‏זהו ציר ה־**residency**.

### ‏`broker-resident`

‏ה־Order/state נמצאים אצל הברוקר כך שהם יכולים להמשיך להתקיים בלי שה־process המקומי יהיה מחובר.

‏זה **לא** אומר שה־Venue מבינה את ה־semantics בעצמה.

### ‏`local-only / untransmitted`

‏ה־state קיימת רק מקומית או עדיין לא הועברה לבעלות remote execution path.

‏ולכן:

```text
UNTRANSMITTED != PROTECTED
```

---

## ‏שאלה 2 — מי מחשב את ההתנהגות?

‏למשל מי מחליט מתי Trigger מתקיים או לאיזה מחיר Reprice.

```text
client-managed
broker-managed
venue-managed
```

### ‏`client-managed`

‏המנוע המקומי מחשב ומחליט את הפעולה הבאה.

### ‏`broker-managed`

‏הברוקר מנהל tactic/algorithm/repricing מסוים לאחר שקיבל boundaries ו־parameters.

‏אבל:

```text
broker execution objective
!=
private strategy objective
```

‏Signal validity, ‏Risk, ‏TTL ו־economic boundaries נשארים אחריות המערכת שלנו אלא אם contract אחר הוגדר במפורש.

---

## ‏שאלה 3 — מי מכיר את ה־semantics המקוריים?

### ‏`venue-native`

‏ה־Venue עצמה מכירה ומבצעת את ה־semantics.

### ‏`broker-simulated`

‏הברוקר מדמה behavior שאינה בהכרח native אצל ה־Venue, למשל באמצעות monitoring/triggering/routing בצד הברוקר.

‏חשוב:

```text
broker-simulated
can also be
broker-resident
```

‏אין כאן סתירה: מונח אחד מתאר **מי מסמלץ את ההתנהגות**, והשני מתאר **איפה ה־state חיה**.

---

# ‏00D.5 Canonical Ownership Card

‏בכל Advanced Order משמעותית נרצה להיות מסוגלים למלא את הכרטיס הבא:

```text
Behavior / Family:

State residency:
  CLIENT | BROKER | VENUE | UNKNOWN

Behavior evaluator:
  CLIENT | BROKER | VENUE | MIXED | UNKNOWN

Native semantics:
  VENUE_NATIVE | BROKER_SIMULATED | CLIENT_SYNTHESIZED | UNKNOWN

Can remain executable after local disconnect?
  YES | NO | UNKNOWN

Can local intent expire while remote order remains executable?
  YES | NO | UNKNOWN

What must be reconciled before new side effects?
  orders / executions / position / protection / ownership
```

> ‏`ENGINE RULE` — אם אחד השדות המהותיים אינו מוכח ב־Capability scope הנוכחי, משתמשים ב־`UNKNOWN`; לא ממלאים אותו לפי שם ה־Order בלבד.

---

# ‏00D.6 Cross-Reference Map לפי משפחה

| Family | Learn First | Decision / Comparison | Failure / Safety | Engine Mapping |
|---|---|---|---|---|
| Marketable / IOC / Sweep / MTL | `02`, `03` | `02B`, `10F` | `09C` | `09B`, `10B` |
| Post Only / Hidden / Reserve / Discretionary | `04`, `04A` | `04B`, `10H`, `10I` | `08B` | `09B` |
| Relative / Pegged / Midpoint / Snap | `05` | `05A`, `10F` | `08B`, `09C` | `09B`, `10B` |
| Stops / MIT / LIT / Trailing | `06`, `06A` | `06B`, `10H` | `08B`, `08D` | `10C` |
| Bracket / OCA / Conditional | `06`, `06C` | `10F` | `08C`, `08D` | `10C` |
| SMART / Direct / Broker Algo | `07` | `07A`, `10H` | `08B`, `09` | `09B` |
| Modify / Cancel+New | `08` | `08A`, `10H` | `08B`, `09C` | `10D` |
| Recovery / Ownership | `08B`, `08C` | `08D` | `08D` | `10C`, `10D` |

---

# ‏00D.7 Beginner Check — האם אני מבין לפני שאני ממשיך?

‏לפני מעבר לפרקים המאוד מתקדמים, מספיק שתוכל לענות במילים שלך על חמש שאלות:

1. ‏מה ההבדל בין “מה אני רוצה להשיג” לבין “איזו פקודה הברוקר מקבל”?
2. ‏למה `IOC` יכולה להיות תכונה של Limit ולא Order Type מתחרה בה?
3. ‏למה `broker-resident` אינה אומרת בהכרח `venue-native`?
4. ‏למה Cancel שנשלח עדיין לא מוכיח שה־Order אינה יכולה לבצע?
5. ‏למה Order יכולה להמשיך להיות חוקית אצל Broker גם אחרי שה־Signal המקומי כבר פג?

‏אם אחת מהתשובות לא ברורה, חוזרים ל־`00B`, ‏`00C` או לפרק prerequisite המתאים. אין צורך לזכור terminology מושלם — המטרה היא להבין את הבעיה בעולם האמיתי.

---

# ‏00D.8 Define Once → Cross-reference → Extend Only When Needed

‏כדי לשמור את הקורס קצר יותר וברור יותר, Concepts שחוזרים בהרבה families אינם מקבלים הגדרה מלאה מחדש בכל פרק.

| Concept | מקור קנוני | איך להשתמש בהמשך |
|---|---|---|
| `signal_ttl / application_order_ttl / broker_tif / working_order_age` | `00A.13` | ‏להוסיף רק consequence ייחודי למשפחה |
| `Economic Price Boundary` / hard cap | `00A.14` | ‏להראות רק איך Candidate מסוימת materializes או נכשלת מול הגבול |
| Cancel / broker truth | `00A.15`, `08` | ‏להוסיף race/late-effect ייחודי בלבד |
| Partial Fill | `00A.16` | ‏להוסיף economics / protection / lifecycle ייחודיים בלבד |
| ownership / residency / native semantics | `00D.4–00D.5` | ‏למלא את ה־Ownership Card, לא להמציא synonym חדש |
| Capability / Production enablement | `00A.17`, `09`, `09B` | ‏להוסיף רק scope/evidence ספציפיים |

‏כלל העריכה הקנוני:

```text
DEFINE ONCE
→ CROSS-REFERENCE
→ EXTEND ONLY WHEN THE FAMILY CHANGES THE CONSEQUENCE
```

‏חזרה קצרה לצורך הוראה למתחיל מותרת; חזרה של contract שלם ללא consequence חדש אינה נדרשת.