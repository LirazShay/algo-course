# ‏00B — Beginner Navigation & Problem → Candidate Index

> ‏מטרת הפרק: לאפשר לקורא חדש להתחיל מהבעיה שהוא מנסה לפתור, להבין קודם את השאלה בשפה פשוטה, ורק אחר כך להגיע לשם המקצועי של ה־Candidate או משפחת הפקודות.
>
> ‏זהו **Index ללמידה**, לא מנגנון שבוחר Order אוטומטית ולא המלצת מסחר. כל Candidate חייבת לעבור את ה־Decision Gates, ה־Capability checks וה־fresh decision המתאימים בזמן אמת.

---

## ‏00B.1 אם אתה חדש — אל תנסה לזכור הכול מראש

‏אין צורך לשנן לפני תחילת הקורס את כל המילים:

```text
Behavior Candidate
Broker Primitive
Routing Policy
Broker Algo
residency
reconciliation
markout
atomicity
```

‏המסלול הלימודי הוא:

```text
בעיה אמיתית
→ דוגמה פשוטה
→ משפחת פתרונות
→ השם המקצועי
→ trade-offs
→ failure modes
→ engine mapping
```

‏כאשר מופיע מונח שאתה עדיין לא מכיר, אפשר להמשיך לקרוא את ההסבר הפשוט ולחזור ל־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md` כמקור taxonomy או ל־`00C-CANONICAL-GLOSSARY.md` כהסבר קצר beginner-first.

> ‏כלל לימודי: `00A` הוא מקור האמת של המונחים, אבל הוא **לא מבחן כניסה לקורס**.

---

## ‏00B.2 מה כן צריך לדעת לפני שמתחילים

‏מספיק להבין ברמה בסיסית מאוד:

- ‏`Bid` — המחיר הגבוה ביותר שקונה גלוי מציע כרגע.
- ‏`Ask` — המחיר הנמוך ביותר שמוכר גלוי מבקש כרגע.
- ‏`Spread` — המרחק בין `Bid` ל־`Ask`.
- ‏`Market Order` — בקשה לבצע מול המחירים הזמינים, בלי Limit שמגדירה מחיר מקסימלי/מינימלי משלנו.
- ‏`Limit Order` — Order שמגדירה גבול מחיר שמעבר לו איננו מוכנים לבצע.
- ‏`Fill` — הכמות שבוצעה בפועל.
- ‏`Partial Fill` — רק חלק מן הכמות בוצע.
- ‏`Position` — הכמות שכבר מוחזקת בפועל לאחר executions.

‏שאר המושגים נבנים בתוך הקורס.

---

# ‏00B.3 Problem → Candidate Index — Entry / Execution

| ‏מה אני מנסה להשיג? | ‏Candidate / Family שכדאי ללמוד קודם | ‏האלטרנטיבה הקרובה | ‏איפה ללמוד |
|---|---|---|---|
| ‏לנסות להתבצע **עכשיו**, אבל לא להשאיר remainder ישנה בשוק | `MARKETABLE_LIMIT_IOC` | Marketable Limit רגילה, `SWEEP_TO_FILL_LIMIT`, `ADAPTIVE_LIMIT_URGENT` | `02`, `02B`, `03`, `10F` |
| ‏להמתין ב־Bid/Ask ולהימנע ככל האפשר מחציית Spread | `PASSIVE_JOIN` | `PASSIVE_POST_ONLY`, `IMPROVE_ONE_TICK` | `02`, `04`, `04B` |
| ‏להבטיח שה־Order לא תהפוך liquidity-taking בזמן הגעה | `PASSIVE_POST_ONLY` | `PASSIVE_JOIN` | `04`, `04B`, `10H` |
| ‏לשפר מעט את המחיר לעומת passive join, בלי לקפוץ ישר לביצוע אגרסיבי | `IMPROVE_ONE_TICK` | `PASSIVE_JOIN`, `RELATIVE_PRIMARY` | `04B`, `10B` |
| ‏שהמחיר שלנו יזוז אוטומטית עם same-side quote | `RELATIVE_PRIMARY` | static Limit, `SNAP_MIDPOINT` | `05`, `05A`, `10I` |
| ‏לחפש execution סביב midpoint דרך broker-managed SMART behavior | `MIDPRICE` | `PEGGED_MIDPOINT_DIRECT`, `SNAP_MIDPOINT` | `05`, `05A`, `07`, `10H` |
| ‏לעקוב אחרי midpoint באופן מתמשך ב־destination מפורש | `PEGGED_MIDPOINT_DIRECT` | `MIDPRICE` | `05`, `05A`, `07A` |
| ‏לחשב מחיר מתוך midpoint פעם אחת ואז להשאיר Limit קבועה | `SNAP_MIDPOINT` | continuous midpoint peg | `05`, `05A`, `10I` |
| ‏להאציל לברוקר execution tactics עם urgency גבוהה | `ADAPTIVE_LIMIT_URGENT` | `MARKETABLE_LIMIT_IOC`, `SWEEP_TO_FILL_LIMIT` | `07`, `07A`, `10F` |
| ‏להאציל execution tactics אבל לא באותה urgency | `ADAPTIVE_LIMIT_NORMAL` | `ADAPTIVE_LIMIT_URGENT`, passive/dynamic candidates | `07`, `07A` |
| ‏לצרוך liquidity בכמה levels/destinations בתוך price bound | `SWEEP_TO_FILL_LIMIT` | `MARKETABLE_LIMIT_IOC`, Adaptive Urgent | `02A`, `02B`, `10F` |
| ‏להתחיל בסגנון market execution ואז להשאיר remainder כ־Limit | `MARKET_TO_LIMIT` | Marketable Limit, `MARKETABLE_LIMIT_IOC` | `02A`, `10F`, `10I` |

> ‏הטבלה עונה על “איפה להתחיל ללמוד”, לא על “איזו Order תנצח עכשיו”.

---

# ‏00B.4 Problem → Candidate Index — Liquidity / Visibility

| ‏מה הבעיה? | ‏Family שכדאי ללמוד | ‏הבדל מרכזי | ‏איפה ללמוד |
|---|---|---|---|
| ‏אני לא רוצה להציג את כל הנוכחות/הכמות שלי | `Hidden` | נראות מצומצמת/מוסתרת | `04`, `04B`, `10I` |
| ‏אני רוצה להציג רק Slice מתוך quantity גדולה יותר | `Reserve / Iceberg` | חלק גלוי + reserve quantity | `04`, `04B`, `10I` |
| ‏אני רוצה להציג מחיר אחד אבל להיות מוכן לבצע בטווח נוסף שאינו מוצג | `Discretionary` | hidden executable willingness, לא hidden quantity | `04A`, `04B`, `10F` |
| ‏אני רוצה למנוע accidental taking | `Post Only` | constraint על liquidity-taking | `04`, `04B`, `10H` |

‏לפני שימוש במנגנון concealment שואלים קודם:

```text
What information am I actually trying to hide?
```

‏אם אין footprint משמעותי, complexity נוספת יכולה להיות מיותרת.

---

# ‏00B.5 Problem → Candidate Index — Trigger / Exit / Protection

| ‏מה אני רוצה שיקרה? | ‏Family שכדאי ללמוד | ‏מה חשוב להבין קודם | ‏איפה ללמוד |
|---|---|---|---|
| ‏להתחיל exit כשהמחיר נע נגדי | `Stop` / `Stop Market` | Trigger price אינה guaranteed fill price | `06`, `06B`, `10H` |
| ‏להפעיל exit אבל לשמור Limit אחרי trigger | `Stop Limit` | יותר price protection, פחות exit certainty | `06`, `06B` |
| ‏להפעיל execution כאשר המחיר “נוגע” בכיוון ההפוך מ־Stop רגילה | `MIT` / `LIT` | להפריד trigger direction מ־post-trigger execution | `06A`, `06B` |
| ‏להזיז protection בעקבות מהלך חיובי | `Trailing Stop` / `Trailing Stop Limit` | ה־state תלויה ב־path, לא רק במחיר הנוכחי | `06`, `06B`, `10H` |
| ‏לקשור Entry עם Profit Taker ו־Protective Stop | `Bracket` | Parent/Child, partial fills ו־protection verification | `06`, `06C`, `08C` |
| ‏לתאם כמה Orders כך שביצוע של אחת ישפיע על האחרות | `OCA / OCO` | coordination אינה atomic guarantee | `06`, `06C`, `08C`, `10H` |
| ‏להפעיל Order רק אם predicate נוסף מתקיים | `Conditional Order` | מי מחזיק ומעריך את התנאי | `06`, `06C` |
| ‏לקבל exit החלטתי מקומי לפי state עשיר ועדכני | local dynamic exit | survivability ו־broker protection fallback | `06B`, `10C`, `10F` |

---

# ‏00B.6 Problem → Candidate Index — Routing / Control

| ‏מה אני מנסה לשלוט בו? | ‏נושא | ‏איפה ללמוד |
|---|---|---|
| ‏לתת לברוקר לבחור destination | `SMART Routing` | `07`, `07A` |
| ‏לבחור destination מפורש | Direct Routing | `07`, `07A` |
| ‏להבין אם Broker Algo מחליפה Strategy decision | Broker Algo ownership | `07`, `10H` |
| ‏להבין מי ממשיך לנהל Peg/Trigger/Algo אחרי disconnect | implementation owner / residency | `00A`, `00D`, `08B` |
| ‏לבדוק אם feature נתמך **בדיוק במסלול שלנו** | Capability tuple | `09`, `09B`, `10I` |

---

# ‏00B.7 Problem → Chapter Index — כשכבר קיימת Order

| ‏מה קרה? | ‏מה ללמוד | ‏איפה |
|---|---|---|
| ‏אני רוצה לשנות מחיר/כמות | Modify vs Cancel+New | `08`, `08A`, `10H` |
| ‏שלחתי Cancel — האם הפקודה כבר נעלמה? | Cancel lifecycle | `08`, `09C`, `10H` |
| ‏קיבלתי Partial Fill | fresh position decision | `08`, `09C`, `10E` |
| ‏לא קיבלתי Fill | `NO_FILL` outcome + fresh decision | `09C`, `10G` |
| ‏הברוקר דחה את ה־Order | `REJECT` classification | `09C` |
| ‏אני לא יודע אם Submit/Cancel הצליח | `UNKNOWN` + reconciliation | `08`, `08B`, `08D`, `10I` |
| ‏ה־Signal פג אבל Order עדיין Working | stale intent vs executable order | `08B`, `09C` |
| ‏התוכנה התחברה מחדש | Recovery / earned `READY` | `08D` |
| ‏המשתמש שינה Order ידנית | Ownership reclassification | `08C`, `08D` |

---

# ‏00B.8 שתי דרכי קריאה חוקיות

## ‏מסלול א — מתחיל שרוצה ללמוד מההתחלה

```text
00 Front Matter
→ 00B Beginner Navigation
→ Part 1
→ Part 2
→ Part 3
→ Parts 4–7
→ Part 8
→ Part 9
→ Part 10
```

‏במסלול הזה `00A` משמש Reference קנוני ו־`00C` משמש Glossary מהיר. אין צורך לשנן אותם לפני Part 1.

## ‏מסלול ב — קורא שמחפש לפתור בעיה מסוימת

```text
00B Problem Index
→ family chapter
→ decision/comparison chapter
→ failure/safety chapter if relevant
→ Part 9 capability check
→ Part 10 engine mapping if implementing
```

‏אם אינך בטוח מהו prerequisite או מי מנהל את ה־behavior לאחר Submit, השתמש ב־`00D-PREREQUISITES-CROSS-REFERENCES-AND-OWNERSHIP-MAP.md`.

---

# ‏00B.9 Cross-Reference Rule

‏בכל family משמעותית, התוצר הסופי מאפשר לעבור בין ארבע שכבות:

```text
Learn the semantics
→ Compare alternatives
→ Understand failure/survivability
→ Map to engine/capability
```

‏דוגמה:

```text
MidPrice
→ 05 / 05A
→ 10F / 10H
→ 08B
→ 07 / 09B / 10B
```

‏ודוגמה נוספת:

```text
Bracket
→ 06 / 06C
→ 10F / 10H
→ 08C / 08D
→ 10C
```

‏למפה מרוכזת של prerequisites, סוגי cross-reference ו־ownership ראו `00D`.

---

# ‏00B.10 שלושה כללים לפני שבוחרים Candidate

```text
1. Problem first, order name second.
2. Capability can eliminate a candidate; it does not choose the winner.
3. A changed state requires a fresh decision; never treat this index as automatic fallback logic.
```

‏אם שום Candidate אינה עומדת יחד בדרישות Signal, Risk, timing, price bound ו־Capability, התוצאה החוקית יכולה להיות:

```text
NO_TRADE
NO_ACTION
REDUCE_SIZE
CANCEL_EXISTING
DEFER
EXIT_ONLY
```

---

## ‏00B.11 מה ה־Index מבטיח — ומה לא

‏ה־Index מבטיח שלמתחיל תהיה נקודת כניסה לפי הבעיה שהוא מזהה, בלי צורך להכיר מראש את כל שמות הפקודות.

‏הוא אינו מחליף:

```text
family semantics
comparison / trade-off analysis
failure / survivability analysis
capability validation
fresh Decision Engine evaluation
```

‏לכן כל מסלול שמתחיל כאן ממשיך לפרקי המקור המתאימים לפני implementation או Production use.