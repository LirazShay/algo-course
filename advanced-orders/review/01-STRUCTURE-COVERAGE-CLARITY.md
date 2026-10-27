# ‏Review 1 — Structure, Coverage and Baseline Clarity

> ‏סקירה ראשונה מתוך סדרת Reviews לקורס `Advanced Order Mastery`.
>
> ‏מטרת השלב הזה אינה לתקן את הקורס, אלא לזהות בעיות מבנה, כיסוי ובהירות בסיסית. התיקונים יבוצעו רק לאחר השלמת כל ה־Reviews ו־`Final Gap List`, וגם הם יחולקו למקטעים נפרדים.

---

# ‏1. מסקנה ראשית

‏לקורס כבר יש כיסוי מקצועי רחב מאוד ועומק יוצא דופן ביחס למסמך Order Types רגיל. המבנה הכללי נכון:

```text
Order semantics
→ Core execution
→ Time / fill policy
→ Liquidity control
→ Pegged / midpoint families
→ Stops / protection / dependencies
→ Routing / broker algos
→ Lifecycle / state machine
→ Capability matrix
→ Decision engine
```

‏כלומר אין בעיית יסוד של "אוסף פקודות אקראי". יש progression אמיתי מהשפה המקצועית ועד מנוע החלטה.

‏עם זאת, דווקא בגלל שהמסמך גדל מאוד, נוצרה בעיית לימוד חדשה: **הקורא עלול להבין כל סעיף בנפרד אבל לא תמיד לדעת היכן הוא נמצא בתוך התמונה הגדולה, אילו מושגים הם foundational ואילו הם special cases, ומה עליו לזכור בסוף כל משפחת פקודות.**

---

# ‏2. ממצא `P0` — ה־Front Matter וה־Roadmap כבר אינם מקור אמת

‏בתחילת הקובץ הראשי עדיין מופיעים בין היתר:

```text
שלב נוכחי = 10B
חלק 11 = Print Optimization Pass
חלק 12 = Final Gap Review
```

‏אבל בפועל:

```text
10C = קובץ עצמאי
10D = קובץ עצמאי
Review = מפוצל למספר שלבים
Final Gap List מגיע לפני תיקונים
התיקונים עצמם יהיו מדורגים
Print Viewer מגיע רק לאחר התיקונים והאיחוד
```

‏זו כרגע בעיית clarity ממשית משום שקורא שפותח את הקורס מקבל roadmap שאינו תואם לתהליך בפועל.

### ‏תיקון עתידי

‏לא לתקן בשלב Review 1, אלא לרשום ל־Gap List:

```text
P0 — Replace stale roadmap and status with final lifecycle map.
```

---

# ‏3. ממצא `P0` — חסרה שכבת ניווט בין "קורס" לבין מאות סעיפים קטנים

‏המסמך בנוי מעשרות רבות של סעיפי משנה בכל חלק. זה מצוין לעומק, אבל יוצר cognitive load.

‏חסרה שכבת ביניים כגון:

```text
Chapter Goal
Core Mental Model
Must-Know Concepts
Advanced Concepts
Decision Questions
Common Failure Modes
For Our Engine
Chapter Takeaways
```

‏ללא שכבה כזאת, הקורא עלול להיתקע ברמת הפרטים.

### ‏תיקון עתידי מוצע

‏לכל חלק מרכזי להוסיף בתחילתו block קצר:

```text
What this chapter teaches
What you must know before reading it
What decisions you should be able to make after it
```

‏ובסופו:

```text
What to remember
What not to conclude
What we will test empirically
```

---

# ‏4. ממצא `P0` — חסרה היררכיה מפורשת של מושגים חוזרים

‏כמה מושגים מרכזיים חוזרים לאורך חלקים רבים:

```text
signal lifetime
application TTL
hard economic cap
partial fill
cancel race
broker truth
reconciliation
capability gate
exit feasibility
queue priority
adverse selection
```

‏החזרה עצמה אינה בעיה; חלק מהמושגים באמת נדרשים שוב בהקשרים שונים.

‏הבעיה היא שאין כיום distinction עקבי בין:

```text
DEFINE ONCE
APPLY AGAIN
EXTEND / OVERRIDE
```

‏ולכן לפעמים הקורא עלול לחשוב שמושג מוגדר מחדש או שיש שתי גרסאות שלו.

### ‏תיקון עתידי

‏ליצור Convention:

```text
Definition
Cross-reference
Extension
Engine Rule
```

‏לדוגמה:

```text
TTL — definition: Part 3
TTL for passive liquidity: Part 4
TTL for pegged orders: Part 5
TTL inside entry selection: Part 10B
```

---

# ‏5. ממצא `P1` — יש עומק רב, אבל לא לכל משפחה יש אותו `Why / When / Why Not`

‏בחלקים מסוימים המבנה כבר כמעט מושלם. למשל ב־Liquidity Control קיימים הסברים ברורים של:

```text
what it does
why it helps
when it hurts
why it may not fit short momentum
```

‏לעומת זאת במשפחות אחרות העומק הטכני גדול אבל הקורא צריך להסיק בעצמו את תשובת:

```text
Why would I ever choose this?
When is it clearly inferior?
What is its nearest alternative?
```

### ‏תיקון עתידי

‏להוסיף לכל משפחה חשובה mini-card אחיד:

```text
What
Why
When
Why Not
Closest Alternative
Main Failure Mode
For Our Engine
```

‏אין צורך לעשות זאת לכל סעיף קטן; רק לכל capability / family משמעותית.

---

# ‏6. ממצא `P1` — חסרה שכבת "Prerequisites"

‏הקורס מתחיל טוב מהיסודות, אבל בחלקים המאוחרים כבר מניח ידע רב:

```text
NBBO
maker/taker
queue priority
markout
adverse selection
broker simulation
route semantics
parent/child lifecycle
OCA
reconciliation
```

‏לקורא שלומד ברצף זה סביר, אבל בחיפוש נקודתי בתוך מסמך מודפס הוא עלול להיכנס באמצע לחלק 6 או 7 ולא להבין את התלות בחלקים קודמים.

### ‏תיקון עתידי

‏בתחילת כל חלק מתקדם להוסיף:

```text
Prerequisites:
- Part X.Y
- concept Z
```

‏זה גם יאפשר ל־Print Viewer בעתיד להציג references בצורה קומפקטית.

---

# ‏7. ממצא `P1` — חסרות יותר "Decision Questions"

‏המטרה של הקורס אינה רק לדעת הגדרות, אלא לקבל החלטות Execution.

‏לכן כדאי שבסוף כל משפחה הקורא יוכל לענות על 3–7 שאלות כגון:

```text
Is my priority fill certainty or price protection?
Can the signal survive waiting?
Can a partial fill still create useful exposure?
Who owns repricing?
What happens after a cancel race?
Can this order remain live after the local process dies?
```

‏היום השאלות האלה קיימות בתוך הפרוזה, אך אינן תמיד מרוכזות במקום אחד.

---

# ‏8. ממצא `P1` — חסר distinction חזותי עקבי בין Fact, Recommendation ו־Hypothesis

‏במסמך יש שלושה סוגי משפטים שונים:

```text
BROKER FACT
ENGINE DESIGN RULE
RESEARCH HYPOTHESIS
```

‏לדוגמה:

```text
IBKR supports field X
```

‏שונה מהותית מ־:

```text
our engine should prefer behavior Y
```

‏ושניהם שונים מ־:

```text
we should test whether Y beats Z
```

‏המסמך לרוב מסביר את ההבדל, אבל אין notation אחיד.

### ‏תיקון עתידי

‏להוסיף labels קומפקטיים, למשל:

```text
FACT
ENGINE RULE
RESEARCH HYPOTHESIS
ACCEPTANCE TEST REQUIRED
```

‏זה חשוב במיוחד בפרקים 5–10.

---

# ‏9. ממצא `P1` — חסר Glossary מרכזי

‏יש הרבה terms שמשתמשים בהם פעמים רבות:

```text
Marketable Limit
Application TTL
Signal TTL
Hard Cap
Exit Ownership
Broker Truth
Shadow Evaluation
Capability Gate
Reconciliation
Pending Exposure
```

‏הגדרות מפוזרות במסמך.

### ‏תיקון עתידי

‏להוסיף Glossary קצר בסוף הקורס או בתחילת ה־Print Viewer.

‏ה־Glossary אינו צריך לחזור על הפרקים; כל ערך צריך להיות 1–3 שורות + reference לחלק המלא.

---

# ‏10. ממצא `P1` — חסר Index השוואתי לפי הבעיה שהקורא מנסה לפתור

‏כרגע המבנה הוא בעיקר לפי Order Family.

‏אבל קורא יכול להגיע עם שאלה אחרת:

```text
I need immediate fill
I need passive-only behavior
I need midpoint price improvement
I need broker-resident protection
I need to avoid stale remainder
I need hidden size
I need automatic repricing
I need atomic-like sibling behavior
```

‏לכן בסוף כדאי ליצור Problem → Candidate map.

### ‏דוגמה

```text
Need immediate attempt, no stale remainder
→ Marketable Limit + IOC

Need dynamic same-side repricing
→ Relative / Pegged-to-Primary

Need broker-resident downside protection
→ Stop / Bracket / Hybrid Protection
```

‏הדבר הזה יחזק מאוד את usability של המסמך המודפס.

---

# ‏11. ממצא `P1` — חלקים 8–10 הופכים מארגון לפי Order Type לארגון לפי מערכת, וצריך Transition מפורש

‏חלקים 1–7 עוסקים בעיקר ב־execution mechanisms.

‏חלקים 8–10 עוברים ל־:

```text
state
lifecycle
capability
orchestration
decision
```

‏זו קפיצה נכונה, אבל כדאי להסביר לקורא שהקורס החליף רמת abstraction.

### ‏תיקון עתידי

‏לפני חלק 8 להוסיף Section קצר:

```text
From Order Types to Execution System
```

‏ולהסביר:

```text
knowing every order type is insufficient
because production correctness depends on state, races and recovery
```

---

# ‏12. ממצא `P1` — חסרה "Minimal Path" לקורא שרוצה קודם להבין את ה־Core

‏הקורס עמוק מאוד, אבל לא כל קורא צריך לקרוא כל Advanced capability לפני שהוא מבין את ה־baseline.

‏אפשר להגדיר שני מסלולים:

```text
CORE PATH
1 → 2 → 3 → selected 4 → selected 6 → 8 → 10

ADVANCED PATH
all sections including 5 / advanced 6 / 7 / 9
```

‏זה לא אומר למחוק ידע; רק לתת navigation.

---

# ‏13. ממצא `P2` — יותר מדי Checkpoints פנימיים יהפכו לרעש אחרי איחוד סופי

‏במהלך העבודה `Checkpoint — סוף חלק N` היה שימושי מאוד.

‏בגרסת לימוד סופית, חלק מה־checkpoint text מכיל roadmap היסטורי כגון:

```text
החלק הבא יהיה...
```

‏לאחר סיום הקורס זה כבר meta-workflow, לא חומר לימוד.

### ‏תיקון עתידי

‏בעת האיחוד:

```text
remove workflow/history language
preserve only useful chapter summary
```

---

# ‏14. ממצא `P2` — רשימות המקורות צריכות פורמט אחיד

‏בחלקים יש רשימות מקורות רשמיים, אך המבנה יכול להיות אחיד יותר:

```text
Official Broker Docs
API Reference
Product / Venue Caveats
Verified At
```

‏כך קל להבין איזה claim תלוי בזמן ומהו background conceptual material.

---

# ‏15. ממצא `P2` — דוגמאות מספריות טובות קיימות, אך אפשר להפוך אותן לשפה אחידה

‏יש דוגמאות רבות כגון:

```text
BUY 100
LMT 50.03
IOC
```

‏וכמויות/מחירים אחרים.

‏כדאי שבגרסה הסופית דוגמאות ישתמשו ב־template קבוע:

```text
Market State
Intent
Order
What can happen
Why chosen
Failure case
```

‏כך הדוגמה מלמדת Decision ולא רק syntax.

---

# ‏16. ממצא `P2` — חסר סימון של "Important but not baseline"

‏הקורס כולל בצדק capabilities מתקדמות:

```text
Hidden
Iceberg
ATS pegged
Pegged-to-Benchmark
AON
MinQty
long-horizon broker algos
```

‏כדי שקורא מתחיל לא ייתן להן משקל זהה ל־Limit/IOC/Stop/Bracket, כדאי להשתמש ב־maturity labels:

```text
CORE
HIGH-VALUE CHALLENGER
ADVANCED
NICHE / CONTEXT-DEPENDENT
NOT CURRENT BASELINE
```

‏חלק 9 כבר מכיל בסיס טוב לזה; צריך להפוך אותו למנגנון ניווט גלובלי.

---

# ‏17. Coverage Review ראשוני לפי פרקים

| חלק | Coverage | בהירות בסיסית | ממצא עיקרי להמשך |
|---|---|---|---|
| 1 — Order language | חזק מאוד | חזק | ‏להוסיף glossary/cross-reference conventions |
| 2 — Core execution | חזק מאוד | חזק | ‏להפוך examples ל־decision templates |
| 3 — TIF | חזק | טוב | ‏לחזק quick comparison בין IOC/FOK/AON/MinQty |
| 4 — Liquidity | חזק מאוד | חזק | ‏כבר קרוב למבנה Why/When/Why Not הרצוי |
| 5 — Pegged/Midpoint/Snap | עמוק מאוד | בינוני־גבוה | ‏נדרש comparison map כדי למנוע בלבול בין שמות דומים |
| 6 — Stops/Bracket/OCA | עמוק מאוד | בינוני־גבוה | ‏נדרש mental-model summary לפני production details |
| 7 — Routing/Algos | עמוק | בינוני | ‏נדרש visual separation בין routing, pricing behavior ו־broker algo |
| 8 — State Machine | עמוק מאוד | גבוה למפתח | ‏נדרש transition לקורא שאינו עדיין system designer |
| 9 — Capability Matrix | חזק מאוד | גבוה | ‏להפוך חלק מהמטריצה ל־reference appendix בעתיד |
| 10A/10B | חזק מאוד | גבוה | ‏לסכם input→gate→candidate בצורה ויזואלית |
| 10C | חזק מאוד | גבוה | ‏להוסיף quick ownership diagram בגרסה הסופית |
| 10D | חזק מאוד | גבוה למפתח | ‏להוסיף end-to-end worked scenario אחד לפחות |

---

# ‏18. בעיות מבנה שאינן בעיות תוכן

‏מצאנו כמה דברים שחשוב לא לבלבל עם חוסר מקצועי:

```text
stale roadmap
navigation density
cross-reference consistency
workflow checkpoints
lack of glossary
lack of problem-based index
lack of visual abstraction transitions
```

‏אלה אינן סיבות לכתוב מחדש את הקורס. הן סיבות לבצע editorial pass חכם אחרי שכל ה־Reviews יסתיימו.

---

# ‏19. מה לא מתקנים עדיין

‏בשלב הזה לא:

```text
rewrite chapters
merge 10C/10D
remove duplicated explanations
add new broker facts
change recommendations
build print viewer
```

‏כל הממצאים נשמרים ל־`Final Gap List`.

---

# ‏20. סדר ה־Review המעודכן

```text
Review 1 — Structure / Coverage / Baseline Clarity
Review 2 — Professional Depth / Missing Execution Concepts
Review 3 — Why / When / Why Not / Comparisons / Examples
Review 4 — Consistency / Duplication / Terminology / Cross-References
Review 5 — Fit to Our Momentum Engine / Research vs Production
Review 6 — Time-sensitive IBKR facts / Capability claims
Final Gap List — ranked and actionable
```

---

# ‏21. גם התיקונים יהיו מדורגים

‏לאחר `Final Gap List` לא נבצע Rewrite אחד גדול.

‏נחלק את התיקונים למקטעים, למשל:

```text
Fix 1 — Front matter / roadmap / navigation
Fix 2 — Foundational clarity / glossary / cross references
Fix 3 — Core order families
Fix 4 — Pegged / midpoint / liquidity comparisons
Fix 5 — Stops / Bracket / protection clarity
Fix 6 — Routing / Broker Algos
Fix 7 — State machine / capability / engine guide
Fix 8 — examples / decision scenarios / summary cards
Fix 9 — final consistency pass
```

‏החלוקה המדויקת תיקבע רק אחרי ה־Gap List כדי שלא נתקן לפני שאנחנו יודעים את התמונה המלאה.

---

# ‏Checkpoint — Review 1

‏ה־Review הראשון מצא שהבעיה המרכזית אינה חוסר כיסוי בסיסי אלא **ניהול המורכבות של מסמך שכבר נהיה גדול ועמוק מאוד**.

‏העדיפויות שהסתמנו הן:

```text
P0 — fix stale roadmap/status
P0 — add chapter-level navigation and mental models
P0 — normalize cross-reference rules for recurring concepts
P1 — normalize Why / When / Why Not at family level
P1 — distinguish FACT / ENGINE RULE / RESEARCH HYPOTHESIS
P1 — add glossary and problem-based index
P1 — explain abstraction transition before system chapters
P2 — remove workflow-history text from final learning artifact
P2 — standardize examples and source blocks
```

‏המקטע הבא הוא `Review 2 — Professional Depth and Missing Execution Concepts`. הוא יבדוק האם חסרים רעיונות מקצועיים, failure modes, execution concepts או distinctions שאיש מקצוע צריך לדעת — בלי לבצע עדיין את התיקונים.