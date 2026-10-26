# ‏Recommendation Playbook Mandate — שכבת ההמלצות המעשית של הקורס

> ‏מסמך זה מוסיף דרישת־על קבועה לקורס: מעבר ללימוד הנייטרלי והמקצועי של כל נושא, בסיום הקורס ייבנה מיני־פרויקט נפרד שמתרגם את הידע להמלצות מעשיות ומנומקות עבור הרובוט הקצר שלנו.

---

# ‏1. זה לא פרויקט על Orders בלבד

‏פקודות קנייה ומכירה הן **רק דוגמה אחת**.

‏ה־`Recommendation Playbook` צריך לכסות **כל תחום מהותי שבו הקורס נגע**, כולל נושאים שנוספו תוך כדי כ־`Discovered Topics`.

‏בין היתר:

- ‏Market Data.
- ‏Universe selection.
- ‏Sampling ו־event processing.
- ‏Latency.
- ‏Momentum definitions.
- ‏Features.
- ‏Filters.
- ‏Score ו־Ranking.
- ‏Candidate selection.
- ‏`TRADE / NO TRADE`.
- ‏Entry.
- ‏Exit.
- ‏Order types.
- ‏Execution tactics.
- ‏Routing.
- ‏Queue behavior.
- ‏Liquidity.
- ‏Adverse selection.
- ‏Market impact.
- ‏Costs.
- ‏Position sizing.
- ‏Risk.
- ‏Backtesting.
- ‏Replay.
- ‏Paper/Shadow.
- ‏Research process.
- ‏Data engineering.
- ‏Scanner architecture.
- ‏Execution engine architecture.
- ‏Testing.
- ‏Performance.
- ‏Monitoring/Observability.
- ‏Failure recovery.
- ‏Kill switches.
- ‏Security/Operations.
- ‏Broker/Data-provider architecture.
- ‏Deployment/runtime choices.
- ‏Learning loop.
- ‏Strategy versioning.
- ‏Champion/Challenger.
- ‏כל נושא נוסף שיופיע בהמשך הקורס.

---

# ‏2. מטרת שכבת ההמלצות

‏הקורס הראשי מלמד קודם כל **מה קיים, איך זה עובד, מהם ה־trade-offs ומה הסיכונים**.

‏ה־Playbook צריך לענות על שאלה אחרת:

> ‏**בהינתן המטרות הספציפיות של הרובוט שלנו — מה אני ממליץ לעשות בפועל, למה, מתי, ומה צריך לגרום לנו לשנות את ההמלצה?**

‏המטרה אינה ליצור רשימת דעות שרירותית, אלא Decision Guide מבוסס Evidence.

---

# ‏3. ההקשר האישי שחייב להנחות את ההמלצות

‏המלצה צריכה להיות מותאמת ליעד שלנו:

```text
Short-Horizon Momentum
milliseconds → seconds → tens of seconds → roughly one minute when justified
whole-market / broad-universe scanning
small executable edge
fast entry when edge is still alive
fast exit when edge decays
net outcome after all costs
NO TRADE when execution economics are not good enough
```

‏לא מניחים שהרעיון רווחי. ההמלצות הן נקודת פתיחה הנדסית/מחקרית שצריכה לעבור validation.

---

# ‏4. לכל שיעור יהיה Recommendation Sheet

‏בסיום הקורס ייווצר מבנה נפרד, לדוגמה:

```text
recommendations/
  00-INDEX.md
  01-PERSONAL-ALGO-SYSTEM.md
  02-US-MARKET-STRUCTURE.md
  03-BID-ASK-SPREAD-ORDER-BOOK.md
  ...
```

‏המספור ימופה לשיעורי הקורס ככל האפשר.

‏אם שיעור אחד כולל כמה החלטות מעשיות שונות, מותר לפצל אותו למספר קובצי המלצה.

‏אם המלצה חוצה מספר שיעורים, מוסיפים קובץ Cross-Cutting ייעודי במקום לדחוס אותה בכוח לשיעור אחד.

---

# ‏5. מבנה חובה לכל Recommendation Sheet

‏כל קובץ המלצה ינסה לכלול, כאשר רלוונטי:

1. ‏**Decision** — מה ההחלטה שאנחנו צריכים לקבל.
2. ‏**Recommended Default** — ברירת המחדל שאני ממליץ להתחיל ממנה.
3. ‏**Why** — למה זו ברירת המחדל.
4. ‏**Use When** — באילו תנאים היא מתאימה.
5. ‏**Do Not Use When** — באילו תנאים היא אינה מתאימה.
6. ‏**Alternatives** — החלופות הרציניות.
7. ‏**Trade-offs** — מה מרוויחים ומה מפסידים בכל חלופה.
8. ‏**What I Would Avoid Initially** — מה לא הייתי מכניס לגרסה הראשונה ולמה.
9. ‏**What to Add Later** — מה כדאי לשקול רק אחרי Evidence.
10. ‏**Required Data/Evidence** — מה חייבים למדוד כדי להצדיק את ההחלטה.
11. ‏**Promotion Criteria** — מתי אפשר לקדם Challenger לברירת מחדל.
12. ‏**Rejection Criteria** — מתי זונחים רעיון.
13. ‏**Metrics** — אילו metrics יכריעו.
14. ‏**Failure Modes** — איפה ההמלצה עלולה להיכשל.
15. ‏**User-Specific Application** — המשמעות המדויקת לרובוט שלנו.
16. ‏**Confidence** — High / Medium / Low, עם הסבר.
17. ‏**Time-Sensitive Facts** — מה דורש אימות עדכני לפני שימוש בפועל.

---

# ‏6. המלצות הן היררכיות, לא בינאריות

‏במקום רק:

```text
USE X
DON'T USE Y
```

‏נעדיף מבנה מקצועי יותר:

```text
Baseline
→ Preferred Default
→ Challenger
→ Advanced Option
→ Specialist Option
→ Avoid Unless Evidence
```

‏כך אפשר להבדיל בין:

- ‏מה נכון לגרסה הראשונה.
- ‏מה נכון אחרי שיש מספיק data.
- ‏מה מתקדם אבל עשוי להיות מוצדק.
- ‏מה קיים מקצועית אך אינו מתאים לנו כרגע.

---

# ‏7. Orders ו־Execution יקבלו Recommendation Matrix עמוק במיוחד

‏זהו תחום חשוב, אבל הוא רק אחד מהתחומים.

‏בסוף הקורס צריך להיות Matrix שמכסה לפחות:

- ‏`Market`.
- ‏`Limit`.
- ‏`Marketable Limit`.
- ‏`IOC`.
- ‏`FOK`.
- ‏`Post Only`.
- ‏`Pegged` variants.
- ‏`Midpoint`.
- ‏`Reserve/Iceberg`.
- ‏`Hidden`.
- ‏Stop families כאשר רלוונטי.
- ‏Bracket/OCO/OCA.
- ‏Smart Routing.
- ‏Direct Routing.
- ‏Broker algos.
- ‏Passive entry.
- ‏Aggressive entry.
- ‏Hybrid tactics.
- ‏Cancel/replace policies.
- ‏Chase policies.
- ‏Exit tactics.
- ‏Emergency exit behavior.

‏לכל אחד יוסבר:

```text
What it does
What problem it solves
Main advantage
Main hidden cost
Fill behavior
Queue implications
Adverse-selection implications
Latency implications
Best use case
Bad use case
What I recommend for our baseline
What evidence could change that recommendation
```

‏כל capability ספציפי של Broker/Venue שמשתנה בזמן חייב להיבדק מול מקור עדכני לפני המלצה תפעולית.

---

# ‏8. המלצות גם לנושאים מחקריים

‏ה־Playbook לא יהיה רק “איזה Order לבחור”.

‏לדוגמה, בתחום Research הוא צריך לענות גם על שאלות כגון:

- ‏איזה labels הייתי מתחיל למדוד.
- ‏איזה horizons הייתי בודק קודם.
- ‏איך הייתי מחלק Train/Validation/Test.
- ‏באיזה סדר הייתי מוסיף Features.
- ‏מתי הייתי משתמש Score ומתי Filters בלבד.
- ‏איזה experiment design הייתי מעדיף.
- ‏איזה metric יהיה Primary ואיזה Diagnostic בלבד.
- ‏איזה evidence מספיק כדי לקדם רעיון.
- ‏איזה result נראה טוב אבל לא מספיק משכנע.

---

# ‏9. המלצות גם לארכיטקטורה והנדסה

‏לכל שכבה הנדסית יהיו המלצות מעשיות, למשל:

- ‏Event-driven מול polling.
- ‏Incremental features מול full recomputation.
- ‏Fast Path מול Deep Path.
- ‏Bounded queues.
- ‏Partitioning strategy.
- ‏State ownership.
- ‏Persistence strategy.
- ‏Replay architecture.
- ‏Broker adapter boundaries.
- ‏Market data provider boundaries.
- ‏Observability baseline.
- ‏CI/test split.
- ‏Deployment topology.
- ‏Local vs cloud trade-offs.
- ‏Performance optimization priorities.

‏גם כאן תהיה הבחנה בין baseline פשוט לבין optimization מאוחר שמוצדק רק אחרי measurement.

---

# ‏10. המלצות גם על “מה לא לעשות”

‏בכל תחום יופיע גם:

```text
Avoid initially
Avoid unless measured
Avoid entirely for our use case
```

‏לא משום שהכלי “רע”, אלא משום שהוא עלול להיות:

- ‏מורכב מדי.
- ‏לא רלוונטי ל־signal horizon.
- ‏יקר מדי ביחס לערך.
- ‏קשה מדי למדידה.
- ‏רגיש מדי ל־provider/broker quirks.
- ‏מוסיף hidden state.
- ‏מגדיל failure surface.
- ‏מוחק יותר Edge ממה שהוא שומר.

---

# ‏11. המלצה חייבת להפריד בין Fact, Judgment ו־Hypothesis

‏כל Playbook צריך לסמן רעיונית שלושה סוגי טענות:

```text
Fact        = behavior/specification that is known or verified
Judgment    = engineering/research recommendation
Hypothesis  = something we expect but must test empirically
```

‏אסור להציג Hypothesis כאילו היא Fact.

‏במיוחד אסור להפוך את מטרת “רווח קטן ומהיר” להנחת יסוד לא־בדוקה.

---

# ‏12. Evidence מעל Preference

‏גם כאשר יש Recommendation ברורה, ה־Playbook חייב להסביר מה יגרום לנו לשנות אותה.

‏לדוגמה:

```text
Recommended Default: A

Change to B only if:
- metric X improves materially
- metric Y does not deteriorate
- result survives OOS
- result survives realistic execution
- result survives latency/cost stress
```

‏המלצה שאין דרך להפריך אותה אינה המלצה מחקרית טובה.

---

# ‏13. המלצות צריכות להיות כלכליות, לא רק טכניות

‏כל המלצה משמעותית צריכה לחזור לשרשרת:

```text
Signal
→ Detection
→ Ranking
→ Entry feasibility
→ Fill
→ Exit feasibility
→ Costs
→ Risk
→ Net outcome
```

‏פתרון טכני מהיר יותר שאינו משפר `Net Edge` אינו בהכרח עדיף.

---

# ‏14. תיעדוף המלצות

‏בסיום ייווצר גם `00-INDEX.md` שמרכז את כל ההמלצות לפי עדיפות:

```text
P0 — required before any live risk
P1 — recommended baseline
P2 — high-value improvement after baseline
P3 — advanced challenger
P4 — specialist / only if evidence justifies
```

‏כך ה־Playbook יהיה גם תוכנית עבודה ולא רק אנציקלופדיה.

---

# ‏15. Cross-Cutting Recommendation Packs

‏בנוסף לקובץ לכל שיעור, המיני־פרויקט צריך לייצר חבילות המלצה חוצות־תחומים לפחות עבור:

```text
Recommended MVP
Recommended Research Stack
Recommended Market Data Stack
Recommended Scanner Design
Recommended Ranking Process
Recommended Entry Policy
Recommended Exit Policy
Recommended Order Policy
Recommended Execution Policy
Recommended Risk Controls
Recommended Backtest Policy
Recommended Replay Policy
Recommended Testing Strategy
Recommended Observability Stack
Recommended Production Safety
Recommended Performance Priorities
Recommended Learning Loop
Recommended Path from Research to Live
```

---

# ‏16. `My Recommended Baseline` לרובוט שלנו

‏בסוף כל המיני־פרויקט יהיה מסמך אחד שמחבר הכול:

```text
recommendations/FINAL-RECOMMENDED-BASELINE.md
```

‏הוא יתאר את ה־baseline שאני ממליץ להתחיל ממנו בפועל למחקר/בנייה, מקצה לקצה:

```text
Data
→ Universe
→ Sampling/Event Model
→ Features
→ Filters
→ Ranking
→ Candidate Gate
→ Entry
→ Order Tactic
→ Execution
→ Position Monitoring
→ Exit
→ Costs
→ Risk
→ Logging
→ Replay
→ Validation
→ Promotion to Live
```

‏המסמך לא יבטיח רווח. הוא יהיה synthesis של כל הידע וה־trade-offs שנלמדו.

---

# ‏17. Recommendation Gap Review לפני סיום

‏לפני שנכריז שהמיני־פרויקט הושלם, נעבור על כל שיעורי הקורס ונשאל:

- ‏האם לכל תחום משמעותי יש Recommendation מעשית?
- ‏האם הסברנו מה ברירת המחדל?
- ‏האם הסברנו מתי היא לא מתאימה?
- ‏האם הצגנו חלופות רציניות?
- ‏האם יש Evidence criteria?
- ‏האם יש Failure Modes?
- ‏האם ההמלצה מותאמת לרובוט שלנו?
- ‏האם עובדות תלויות Broker/Data Provider נבדקו עדכנית?
- ‏האם חסרה המלצה חוצת־פרקים?
- ‏האם נותר נושא שבו לימדנו Theory אך לא תרגמנו אותו ל־Decision?

‏רק לאחר Gap Review כזה אפשר לסמן את שכבת ההמלצות כשלמה.

---

# ‏18. משפט המחויבות

> ‏**בסיום הקורס לא יישאר לנו רק “מה אפשר לעשות”. תהיה לנו גם שכבה נפרדת, מסודרת ומנומקת של “מה אני ממליץ לנו לעשות, למה, מתי, מה לא, מה האלטרנטיבות, ומה הנתונים שיכולים לגרום לנו לשנות את ההמלצה”.**
