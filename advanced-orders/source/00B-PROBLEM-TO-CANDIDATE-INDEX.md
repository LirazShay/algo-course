# ‏Problem → Candidate Index — מתחילים מהבעיה, לא מהשם של הפקודה

> ‏המטרה של האינדקס הזה היא לא לבחור עבורך פקודה אוטומטית. הוא עוזר למתחיל לשאול קודם **איזו בעיית Execution אני מנסה לפתור?**, ורק אחר כך להגיע למשפחת הפקודות המתאימה להשוואה.

---

## ‏איך להשתמש באינדקס

‏הסדר הוא:

```text
בעיה מעשית
→ משפחת Candidates רלוונטית
→ הפרק שמסביר את ה־semantics
→ Decision Guide שמשווה חלופות
→ Capability / Safety checks
→ החלטה חדשה לפי ה־state בפועל
```

‏האינדקס אינו Ranking ואינו recommendation אוטומטית.

> ‏`ENGINE RULE` — מעבר מבעיה ל־Candidate הוא רק יצירת shortlist. הבחירה הסופית עדיין חייבת לעבור Signal, Risk, Price Bound, Timing, Capability ו־current-state gates.

---

## ‏1. “אני רוצה לנסות לבצע עכשיו, אבל לא רוצה שהשארית תישאר חיה”

### ‏במילים פשוטות

‏אנחנו רוצים ניסיון מיידי: מה שאפשר לבצע עכשיו — יתבצע; מה שלא — לא יישאר בתור ויהפוך ל־stale Order.

### ‏Candidates לבדיקה

```text
MARKETABLE_LIMIT_IOC
```

‏ובהשוואה מחקרית:

```text
SWEEP_TO_FILL_LIMIT
Adaptive Urgent
plain marketable Limit
```

### ‏איפה ללמוד

- ‏Part `2B` — Aggressive Execution Decision Guide.
- ‏Part `3` — `IOC` ו־Time/Fill Policies.
- ‏Part `9B` — materialization של `MARKETABLE_LIMIT_IOC`.

---

## ‏2. “אני רוצה להישאר פסיבי ולא לקחת נזילות בטעות”

### ‏במילים פשוטות

‏אנחנו רוצים להצטרף לצד שלנו בספר ולהימנע ממצב שבו Order שהייתה פסיבית בזמן ההחלטה מגיעה לשוק אחרי שינוי והופכת ל־liquidity-taking.

### ‏Candidates לבדיקה

```text
PASSIVE_JOIN
PASSIVE_POST_ONLY
```

### ‏השאלה שמכריעה

```text
Is avoiding accidental taking worth the extra reject/reprice/no-fill risk?
```

### ‏איפה ללמוד

- ‏Part `4` — Liquidity Control.
- ‏Part `4B` — Liquidity and Display Decision Guide.
- ‏Part `10H` — למה `Post Only` אינה “Passive טובה יותר”.

---

## ‏3. “אני רוצה לשפר מחיר קצת בלי לקפוץ ישר לצד השני”

### ‏Candidates לבדיקה

```text
IMPROVE_ONE_TICK
RELATIVE_PRIMARY
SNAP_MIDPOINT
```

‏לפי השאלה האם רוצים מחיר קבוע, repricing מתמשך, או derivation חד־פעמי מהשוק.

### ‏איפה ללמוד

- ‏Part `5` — Pegged / Relative / Midpoint / Snap.
- ‏Part `5A` — Dynamic Pricing Decision Guide.

---

## ‏4. “אני רוצה לנסות לקבל מחיר סביב האמצע של ה־Spread”

### ‏Candidates לבדיקה

```text
MIDPRICE
PEGGED_MIDPOINT_DIRECT
SNAP_MIDPOINT
```

### ‏שאלות שמכריעות

```text
Do I want broker-managed search?
Do I need explicit destination control?
Do I want continuous repricing or a one-shot derived Limit?
How costly is no-fill / delay for this signal?
```

### ‏איפה ללמוד

- ‏Part `5A` — השוואת Dynamic Pricing.
- ‏Part `10H` — למה midpoint אינו “חצי Spread בחינם”.
- ‏Part `7` — Routing / Broker Algos.

---

## ‏5. “אני רוצה שהברוקר ינהל חלק מטקטיקת הביצוע”

### ‏Candidates לבדיקה

```text
ADAPTIVE_LIMIT_NORMAL
ADAPTIVE_LIMIT_URGENT
MIDPRICE
```

### ‏מה לא מועבר לברוקר

```text
private signal validity
application_order_ttl
Economic Price Bound
risk authority
cancel authority
```

### ‏איפה ללמוד

- ‏Part `7` — Routing and Broker Algos.
- ‏Part `7A` — Routing Policy Decision Guide.
- ‏Part `10H` — Broker Algo אינה מכירה את ה־private Signal שלנו.

---

## ‏6. “אני רוצה להסתיר משהו מהשוק”

‏קודם צריך להחליט **מה** רוצים להסתיר.

| הבעיה | Family לבדיקה |
|---|---|
| ‏לא להציג את כל הנוכחות/הכמות | `Hidden` |
| ‏להציג רק חלק מהכמות | `Reserve / Iceberg` |
| ‏להציג מחיר פחות אגרסיבי אך לאפשר execution רחב יותר | `Discretionary` |

### ‏איפה ללמוד

- ‏Part `4` — Liquidity Control.
- ‏Part `4A` — Discretionary and Executable Willingness.
- ‏Part `10I` — ההבדל האינטואיטיבי בין Hidden / Reserve / Discretionary.

---

## ‏7. “אני רוצה שכל הכמות תתבצע, או לפחות מינימום מסוים”

### ‏Policies לבדיקה

```text
FOK
AON
Minimum Quantity
```

### ‏הזהרה

‏הבעיה אינה “Partial Fill מעצבנת”. השאלה היא האם Partial Position עדיין שימושית ובטוחה.

### ‏איפה ללמוד

- ‏Part `3` — Time / Fill Policies.
- ‏Part `10I` — Partial Fill מול FOK/AON/MinQty.

---

## ‏8. “אני רוצה שהפקודה תופעל רק כשמחיר מסוים יקרה”

### ‏Families לבדיקה

```text
Stop Market
Stop Limit
MIT
LIT
Trailing Stop
Trailing Stop Limit
Trailing MIT / LIT where supported
```

### ‏השאלה הראשונה

```text
WHEN should activation happen?
```

‏ורק אחר כך:

```text
WHAT execution behavior should happen after activation?
```

### ‏איפה ללמוד

- ‏Part `6` — Stops / Trailing.
- ‏Part `6A` — MIT/LIT Trigger Taxonomy.
- ‏Part `6B` — Trigger and Dynamic Exit Decision Guide.

---

## ‏9. “אני רוצה Entry ובמקביל Profit Taker + Protection”

### ‏Structure לבדיקה

```text
Bracket
```

### ‏אבל צריך להבין גם

```text
parent / child activation
Transmit sequencing
partial parent fill
protected quantity
UNTRANSMITTED != PROTECTED
```

### ‏איפה ללמוד

- ‏Part `6C` — Composite Coordination Decision Guide.
- ‏Part `8C` — Bracket/OCA/Protection Deep Safety.

---

## ‏10. “יש לי כמה Orders חלופיות ואני רוצה שאחת תשפיע על האחרות”

### ‏Structures לבדיקה

```text
OCA / OCO
Conditional Orders
```

### ‏הזהרה

```text
coordination intent
!=
atomic transaction
```

### ‏איפה ללמוד

- ‏Part `6C` — OCA/OCO/Conditional.
- ‏Part `8C` — races, sibling cancel ו־worst-case executable exposure.

---

## ‏11. “אני רוצה שהמחיר יעקוב אחרי השוק אוטומטית”

### ‏Candidates לבדיקה

```text
RELATIVE_PRIMARY
PEGGED_MIDPOINT_DIRECT
MIDPRICE
```

### ‏אם רוצים רק sample חד־פעמי

```text
SNAP_MIDPOINT
```

### ‏איפה ללמוד

- ‏Part `5A` — מי מחזיק את ה־repricing.
- ‏Part `10I` — Pegged מול Snap במילים פשוטות.

---

## ‏12. “אני רוצה ביצוע אגרסיבי בכמה מקומות/רמות, אבל עם גבול מחיר”

### ‏Candidates לבדיקה

```text
SWEEP_TO_FILL_LIMIT
MARKETABLE_LIMIT_IOC
ADAPTIVE_LIMIT_URGENT
```

### ‏מה חייבים להשוות

```text
fill speed
price concession
split fills
fees
market impact
missed move
post-fill markout
```

### ‏איפה ללמוד

- ‏Part `2A` — Sweep-to-Fill / Market-to-Limit.
- ‏Part `2B` — Aggressive Execution Decision Guide.
- ‏Part `10I` — למה speed לבדה אינה metric מספיקה.

---

## ‏13. “אני רוצה ביצוע מיידי חלקי ואז להשאיר remainder כ־Limit”

### ‏Primitive לבדיקה

```text
Market-to-Limit
```

### ‏הסיכון המרכזי

‏ה־remainder שנוצרה אחרי ה־Fill הראשון יכולה כבר לא להתאים ל־Signal החדש.

### ‏איפה ללמוד

- ‏Part `2A` — Market-to-Limit transformation.
- ‏Part `10I` — stale transformed remainder.

---

## ‏14. “אני רוצה לשנות Order שכבר עובדת”

‏זו אינה רק שאלת API.

### ‏אפשרויות סמנטיות

```text
MODIFY_IN_PLACE
CANCEL_THEN_NEW
OVERLAPPED_REPLACEMENT
```

### ‏מה צריך לשאול

```text
What remains executable?
What happens to queue value?
Did the Behavior Candidate itself change?
Can late fill arrive during the transition?
```

### ‏איפה ללמוד

- ‏Part `8` — Cancel/Replace State Machine.
- ‏Part `8A` — Modify/Replace/Repricing Decision Guide.
- ‏Part `10H` — Cancel אינו erase; Modify אינה free.

---

## ‏15. “המחשב/חיבור חזרו — איך אני ממשיך?”

‏לא מתחילים מ־“מה רציתי לעשות לפני הניתוק?”.

### ‏סדר נכון

```text
position truth
→ executions
→ working / unknown orders
→ ownership
→ protection
→ stale intent invalidation
→ READY gates
→ fresh decision
```

### ‏איפה ללמוד

- ‏Part `8B` — Survivability.
- ‏Part `8C` — Protection Graph Recovery.
- ‏Part `8D` — Recovery / Ownership / earned READY.

---

## ‏16. “הברוקר אומר שהפקודה קיימת — האם מותר לי להשתמש בה ב־Production?”

‏לא בהכרח.

### ‏צריך להפריד

```text
feature documented
capability runtime-confirmed
paper accepted
live-small accepted
PRODUCTION_ENABLED
```

### ‏איפה ללמוד

- ‏Part `9` — Capability Matrix.
- ‏Part `9B` — Capability Resolver / Candidate Registry.

---

## ‏17. “איך אני בוחר בין שתי Candidates שנראות שתיהן סבירות?”

‏אל תשאל רק “איזו פקודה יותר מתקדמת?”.

‏שאל:

```text
Why does A win in this state?
Why does B lose in this state?
What state variable would reverse the answer?
What must be re-evaluated before acting?
```

### ‏איפה ללמוד

- ‏Part `10F` — Comparison Closeout Decision Checklist.
- ‏Parts `10G–10I` — Practitioner Judgment.

---

## ‏18. “אף Candidate לא טובה מספיק”

‏זו תוצאה חוקית ומקצועית.

```text
NO_TRADE
NO_ACTION
REDUCE_SIZE
CANCEL_EXISTING
DEFER
EXIT_ONLY
```

> ‏`ENGINE RULE` — Advanced Orders הן toolkit. המנוע אינו חייב למצוא פקודה רק משום שקיימת הזדמנות לכאורה.

---

## ‏19. מסלול קריאה למתחיל

‏אם אתה חדש בתחום, אל תנסה לזכור את כל האינדקס לפני הלמידה.

‏המסלול המומלץ הוא:

```text
00A — מה הם סוגי המושגים השונים
→ 01–03 — בסיס של Order / Limit / Fill / TIF
→ 00B — חזרה לאינדקס הזה עם יותר הקשר
→ 04–07 — משפחות Advanced Orders
→ 08 — lifecycle / cancel / failure / recovery
→ 09 — מה באמת נתמך ומותר
→ 10 — איך מחליטים בין Candidates
→ 10G–10I — איך לא ליפול למסקנות אינטואיטיביות שגויות
```

‏בכל פעם שמופיע מונח חדש ולא ברור, צריך לעבור דרך ההסבר הפשוט וה־Glossary הקנוני במקום לנחש מהשם.

---

## ‏20. Checkpoint

‏האינדקס סוגר את:

```text
AO-GAP-P1-22 — Problem → Candidate Index
```

‏הוא אינו מחליף את הפרקים ואינו מנגנון recommendation. הוא שכבת ניווט שמתחילה מהבעיה המעשית ומפנה אל ההשוואה המקצועית הנכונה.