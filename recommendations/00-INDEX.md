# ‏Recommendation Playbook — Index

> ‏מקור האמת למיני־פרויקט ההמלצות של הקורס. ה־Playbook מתרגם את הידע התאורטי והמקצועי להחלטות מעשיות עבור רובוט `Short-Horizon Momentum` אישי, בלי להניח שהאסטרטגיה רווחית ובלי להציג השערות כעובדות.

---

## ‏1. סטטוס הפרויקט

```text
Regular Course: COMPLETE
Recommendation Playbook: IN PROGRESS
Completed Segments: 01 — Foundations / Personal Algo System
                    02 — US Market Structure
                    03 — Bid / Ask / Last / Spread / Order Book
                    04 — Order Types and Execution Tactics
Current Corrections: 02A — Reg NMS time-sensitive status correction
Next Segment: 05 — Market Data
Source of Truth: GitHub main after merge
```

‏מסמכי החובה לפתיחת הפרויקט:

- ‏`../00-RECOMMENDATION-PLAYBOOK-MANDATE.md`
- ‏`../00-RECOMMENDATION-NEW-CHAT-HANDOFF.md`
- ‏`../00-REGULAR-COURSE-CLOSURE.md`
- ‏`../00-COURSE-ROADMAP.md`
- ‏`../00-DISCOVERED-TOPICS.md`

---

## ‏2. מטרת ה־Playbook

‏לכל תחום מהותי בקורס נתרגם את הידע לשאלת החלטה מעשית:

> ‏מה ברירת המחדל המומלצת לרובוט שלנו, למה, מתי היא נכונה, מתי לא, אילו חלופות רציניות קיימות, ומה Evidence צריך לגרום לנו לשנות את ההמלצה?

‏ה־Playbook אינו הבטחת רווח ואינו מחליף Validation. כל המלצה היא נקודת פתיחה הנדסית או מחקרית שניתנת להפרכה.

---

## ‏3. כללי Evidence מחייבים

‏כל Recommendation Sheet יבדיל בין:

- ‏**Fact** — התנהגות, מפרט או עיקרון שאומת או ידוע.
- ‏**Judgment** — המלצה הנדסית/מחקרית שלנו.
- ‏**Hypothesis** — טענה אמפירית שחייבת בדיקה.

‏בכל מקום שבו ההמלצה תלויה ב־Broker, Data Provider, Venue, עמלות, מגבלה רגולטורית, API או Capability שמשתנים בזמן — יש לבצע אימות עדכני לפני שימוש תפעולי.

---

## ‏4. היררכיית המלצות

```text
Baseline
→ Preferred Default
→ Challenger
→ Advanced Option
→ Specialist Option
→ Avoid Unless Evidence
```

‏המטרה היא להפריד בין מה שמתאים לגרסה הראשונה לבין מה שכדאי להוסיף רק לאחר Measurement ו־Evidence.

---

## ‏5. עדיפויות

| Priority | משמעות |
|---|---|
| `P0` | ‏חובה לפני כל סיכון חי |
| `P1` | ‏Baseline מומלץ |
| `P2` | ‏שיפור בעל ערך לאחר Baseline |
| `P3` | ‏Challenger מתקדם |
| `P4` | ‏Specialist / רק אם Evidence מצדיק |

---

## ‏6. סדר העבודה

‏העבודה תתקדם לפי מסמכי הקורס, תוך הוספת קובצי Cross-Cutting כאשר החלטה חוצה כמה פרקים:

1. ‏לקרוא את פרק הקורס הרלוונטי ואת ההקשר במפת הקורס.
2. ‏לחלץ את ההחלטות המעשיות, החלופות וה־Failure Modes.
3. ‏להפריד `Fact / Judgment / Hypothesis`.
4. ‏להגדיר `Recommended Default`, Evidence, Promotion ו־Rejection criteria.
5. ‏למפות Priority ו־Confidence.
6. ‏לסמן Facts תלויי זמן שדורשים אימות עדכני.
7. ‏לעדכן את האינדקס.
8. ‏בסיום כל הפרקים לבצע Recommendation Gap Review.
9. ‏לסנתז את הכול ל־`FINAL-RECOMMENDED-BASELINE.md`.

---

## ‏7. Recommendation Sheets

| מקור | Recommendation Sheet | Priority מרכזי | Status |
|---|---|---:|---|
| `01-FOUNDATIONS-PERSONAL-ALGO-SYSTEM.md` | `01-PERSONAL-ALGO-SYSTEM.md` | `P0/P1` | `COMPLETED` |
| `02-HOW-US-STOCK-MARKET-WORKS.md` | `02-US-MARKET-STRUCTURE.md` | `P0/P1` | `COMPLETED` |
| Time-sensitive correction to 02 | `02A-REG-NMS-TIME-SENSITIVE-CORRECTION.md` | `P0` | `CURRENT OVERRIDE` |
| `03-BID-ASK-LAST-SPREAD-ORDER-BOOK.md` | `03-BID-ASK-SPREAD-ORDER-BOOK.md` | `P0/P1` | `COMPLETED` |
| `04-ORDER-TYPES-FOR-PERSONAL-ALGO.md` | `04-ORDER-TYPES.md` | `P0/P1/P2` | `COMPLETED` |
| `05-MARKET-DATA-FOR-PERSONAL-ALGO.md` | `05-MARKET-DATA.md` | TBD | `NOT STARTED` |
| `06-TIME-SAMPLING-LATENCY.md` | `06-TIME-SAMPLING-LATENCY.md` | TBD | `NOT STARTED` |
| `07-BUILDING-THE-TRADING-UNIVERSE.md` | `07-TRADING-UNIVERSE.md` | TBD | `NOT STARTED` |

‏שאר שיעורי 08–85, ‏`60A`, ‏`85A` וה־Cross-Cutting packs יתווספו לאינדקס בהתקדמות מבוקרת; אין להסיק מחוסר שורה שהם מחוץ ל־scope.

---

## ‏8. Cross-Cutting Packs המחויבים ב־Mandate

‏לפני סיום הפרויקט חייבים להיווצר לפחות:

- ‏Recommended MVP.
- ‏Recommended Research Stack.
- ‏Recommended Market Data Stack.
- ‏Recommended Scanner Design.
- ‏Recommended Ranking Process.
- ‏Recommended Entry Policy.
- ‏Recommended Exit Policy.
- ‏Recommended Order Policy.
- ‏Recommended Execution Policy.
- ‏Recommended Risk Controls.
- ‏Recommended Backtest Policy.
- ‏Recommended Replay Policy.
- ‏Recommended Testing Strategy.
- ‏Recommended Observability Stack.
- ‏Recommended Production Safety.
- ‏Recommended Performance Priorities.
- ‏Recommended Learning Loop.
- ‏Recommended Path from Research to Live.

---

## ‏9. תוצר הסיום

‏התוצר המסכם יהיה:

`FINAL-RECOMMENDED-BASELINE.md`

‏הוא יחבר מקצה לקצה:

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

‏רק לאחר מעבר על כל שיעורי הקורס וביצוע Recommendation Gap Review ניתן יהיה לסמן את ה־Playbook כשלם.
