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
                    05 — Market Data
                    06 — Time / Sampling / Latency
                    07 — Trading Universe
                    08 — Short-Term Momentum
                    09 — Velocity / Acceleration / Momentum Shape
                    10 — Trade Activity / Volume / Flow
                    11 — Liquidity / Executability
                    12 — Filters Before Ranking
                    13 — Feature Engineering
                    14 — Score / Market Ranking
                    15 — Top Candidate / Trade No Trade
                    16 — Trade Entry / Execution
                    17 — Trade Exit Logic
                    18 — True Trading Costs / Net Edge
                    19 — Position Sizing / Risk Management
                    20 — Backtest Fundamentals / Timeline Integrity
                    21 — Realistic Seconds Execution Backtest
                    22 — Scanner Predictive Validation
                    23 — Overfitting / Data Leakage / Validation
                    24 — Controlled Experiments / Score Improvement
                    25 — Market Regime Analysis
                    26 — RCA for Failed Top-Ranked Candidates
                    27 — Deterministic Market Replay
                    28 — Paper Trading / Shadow Mode
                    29 — Broker API Architecture
                    30 — IBKR / IBKR Israel Deep Dive
                    31 — Market Data Providers / Alternatives
                    32 — Separating Market Data from Execution
                    33 — Production State Machine
                    34 — Failure Recovery / Safe Resume
                    35 — Monitoring / Logging / Observability
                    36 — Kill Switches / Safety Controls
                    37 — Advanced Order Tactics
                    38 — Queue Position / Limit Order Subtleties
                    39 — Smart Routing / Direct Routing
                    40 — Hidden / Reserve / Midpoint / Pegged / ATS
                    41 — Advanced Broker Algos
                    42 — Opening/Closing Auctions / Auction Order Types
                    43 — Halts / LULD / Fast Markets
                    44 — Advanced Order Flow
                    45 — Book Imbalance / Microprice
                    46 — Adverse Selection Deep Dive
                    47 — Price Impact / Capacity
                    48 — Latency Edge without pretending to be HFT
                    49 — Quant Research Best Practices
                    50 — Scanner Best Practices
                    51 — Execution Engine Best Practices
                    52 — Data Engineering Best Practices
                    53 — Testing Best Practices
                    54 — Performance Best Practices
                    55 — Security and Operations Best Practices
                    56 — 100 Common Mistakes in Short Algo Trading
                    57 — 100 Practical Tips for a Personal Algo Builder
                    58 — Order and Execution Subtleties
                    59 — Market Data Subtleties
                    60 — Scanner and Ranking Subtleties
                    60A — Negative Evidence, Veto and Disqualification Engine
                    61 — Backtest Subtleties
                    62 — Live Trading Subtleties
                    63 — How Professionals Think About Edge
Current Corrections: 02A — Reg NMS time-sensitive status correction
Next Segment: 64 — Professional Checklist Before Real Money
Source of Truth: GitHub main
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
| `05-MARKET-DATA-FOR-PERSONAL-ALGO.md` | `05-MARKET-DATA.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `06-TIME-SAMPLING-LATENCY.md` | `06-TIME-SAMPLING-LATENCY.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `07-BUILDING-THE-TRADING-UNIVERSE.md` | `07-TRADING-UNIVERSE.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `08-SHORT-TERM-MOMENTUM.md` | `08-SHORT-TERM-MOMENTUM.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `09-VELOCITY-ACCELERATION-MOMENTUM-SHAPE.md` | `09-VELOCITY-ACCELERATION-MOMENTUM-SHAPE.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `10-TRADE-ACTIVITY-VOLUME-AND-FLOW.md` | `10-TRADE-ACTIVITY-VOLUME-FLOW.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `11-LIQUIDITY-AND-EXECUTABILITY.md` | `11-LIQUIDITY-EXECUTABILITY.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `12-FILTERS-BEFORE-RANKING.md` | `12-FILTERS-BEFORE-RANKING.md` | `P0/P1/P2` | `COMPLETED` |
| `13-FEATURE-ENGINEERING-FOR-MARKET-SCANNER.md` | `13-FEATURE-ENGINEERING.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `14-SCORE-AND-MARKET-RANKING.md` | `14-SCORE-MARKET-RANKING.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `15-TOP-CANDIDATE-TRADE-NO-TRADE.md` | `15-TOP-CANDIDATE-TRADE-NO-TRADE.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `16-TRADE-ENTRY-EXECUTION.md` | `16-TRADE-ENTRY-EXECUTION.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `17-TRADE-EXIT-LOGIC.md` | `17-TRADE-EXIT-LOGIC.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `18-TRUE-TRADING-COSTS-AND-NET-EDGE.md` | `18-TRUE-TRADING-COSTS-NET-EDGE.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `19-POSITION-SIZING-AND-RISK-MANAGEMENT.md` | `19-POSITION-SIZING-RISK-MANAGEMENT.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `20-BACKTEST-FUNDAMENTALS-AND-TIMELINE-INTEGRITY.md` | `20-BACKTEST-FUNDAMENTALS.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `21-REALISTIC-SECONDS-EXECUTION-BACKTEST.md` | `21-REALISTIC-SECONDS-EXECUTION-BACKTEST.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `22-SCANNER-PREDICTIVE-VALIDATION.md` | `22-SCANNER-PREDICTIVE-VALIDATION.md` | `P0/P1/P2` | `COMPLETED` |
| `23-OVERFITTING-DATA-LEAKAGE-AND-VALIDATION.md` | `23-OVERFITTING-DATA-LEAKAGE-VALIDATION.md` | `P0/P1/P2` | `COMPLETED` |
| `24-CONTROLLED-EXPERIMENTS-AND-SCORE-IMPROVEMENT.md` | `24-CONTROLLED-EXPERIMENTS-SCORE-IMPROVEMENT.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `25-MARKET-REGIME-ANALYSIS.md` | `25-MARKET-REGIME-ANALYSIS.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `26-RCA-FOR-FAILED-TOP-RANKED-CANDIDATES.md` | `26-RCA-FAILED-TOP-RANKED-CANDIDATES.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `27-DETERMINISTIC-MARKET-REPLAY.md` | `27-DETERMINISTIC-MARKET-REPLAY.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `28-PAPER-TRADING-AND-SHADOW-MODE.md` | `28-PAPER-TRADING-SHADOW-MODE.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `29-BROKER-API-ARCHITECTURE.md` | `29-BROKER-API-ARCHITECTURE.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `30-IBKR-AND-IBKR-ISRAEL-DEEP-DIVE.md` | `30-IBKR-IBKR-ISRAEL-DEEP-DIVE.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `31-MARKET-DATA-PROVIDERS-AND-ALTERNATIVES.md` | `31-MARKET-DATA-PROVIDERS-ALTERNATIVES.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `32-SEPARATING-MARKET-DATA-FROM-EXECUTION.md` | `32-SEPARATING-MARKET-DATA-FROM-EXECUTION.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `33-PRODUCTION-STATE-MACHINE.md` | `33-PRODUCTION-STATE-MACHINE.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `34-FAILURE-RECOVERY-AND-SAFE-RESUME.md` | `34-FAILURE-RECOVERY-SAFE-RESUME.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `35-MONITORING-LOGGING-AND-OBSERVABILITY.md` | `35-MONITORING-LOGGING-OBSERVABILITY.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `36-KILL-SWITCHES-AND-SAFETY-CONTROLS.md` | `36-KILL-SWITCHES-SAFETY-CONTROLS.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `37-ADVANCED-ORDER-TACTICS.md` | `37-ADVANCED-ORDER-TACTICS.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `38-QUEUE-POSITION-AND-LIMIT-ORDER-SUBTLETIES.md` | `38-QUEUE-POSITION-LIMIT-ORDER-SUBTLETIES.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `39-SMART-ROUTING-VS-DIRECT-ROUTING.md` | `39-SMART-ROUTING-DIRECT-ROUTING.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `40-HIDDEN-RESERVE-MIDPOINT-PEGGED-AND-ATS.md` | `40-HIDDEN-RESERVE-MIDPOINT-PEGGED-ATS.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `41-ADVANCED-BROKER-ALGOS.md` | `41-ADVANCED-BROKER-ALGOS.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `42-OPENING-CLOSING-AUCTIONS-AND-AUCTION-ORDER-TYPES.md` | `42-OPENING-CLOSING-AUCTIONS-AUCTION-ORDER-TYPES.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `43-HALTS-LULD-AND-FAST-MARKETS.md` | `43-HALTS-LULD-FAST-MARKETS.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `44-ADVANCED-ORDER-FLOW.md` | `44-ADVANCED-ORDER-FLOW.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `45-BOOK-IMBALANCE-AND-MICROPRICE.md` | `45-BOOK-IMBALANCE-MICROPRICE.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `46-ADVERSE-SELECTION-DEEP-DIVE.md` | `46-ADVERSE-SELECTION-DEEP-DIVE.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `47-PRICE-IMPACT-AND-CAPACITY.md` | `47-PRICE-IMPACT-CAPACITY.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `48-LATENCY-EDGE-WITHOUT-PRETENDING-TO-BE-HFT.md` | `48-LATENCY-EDGE-WITHOUT-PRETENDING-TO-BE-HFT.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `49-QUANT-RESEARCH-BEST-PRACTICES.md` | `49-QUANT-RESEARCH-BEST-PRACTICES.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `50-SCANNER-BEST-PRACTICES.md` | `50-SCANNER-BEST-PRACTICES.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `51-EXECUTION-ENGINE-BEST-PRACTICES.md` | `51-EXECUTION-ENGINE-BEST-PRACTICES.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `52-DATA-ENGINEERING-BEST-PRACTICES.md` | `52-DATA-ENGINEERING-BEST-PRACTICES.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `53-TESTING-BEST-PRACTICES.md` | `53-TESTING-BEST-PRACTICES.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `54-PERFORMANCE-BEST-PRACTICES.md` | `54-PERFORMANCE-BEST-PRACTICES.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `55-SECURITY-AND-OPERATIONS-BEST-PRACTICES.md` | `55-SECURITY-AND-OPERATIONS-BEST-PRACTICES.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `56-100-COMMON-MISTAKES-IN-SHORT-ALGO-TRADING.md` | `56-100-COMMON-MISTAKES-IN-SHORT-ALGO-TRADING.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `57-100-PRACTICAL-TIPS-FOR-A-PERSONAL-ALGO-BUILDER.md` | `57-100-PRACTICAL-TIPS-FOR-A-PERSONAL-ALGO-BUILDER.md` | `P0/P1/P2/P3` | `COMPLETED` |
| `58-ORDER-AND-EXECUTION-SUBTLETIES.md` | `58-ORDER-AND-EXECUTION-SUBTLETIES.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `59-MARKET-DATA-SUBTLETIES.md` | `59-MARKET-DATA-SUBTLETIES.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `60-SCANNER-AND-RANKING-SUBTLETIES.md` | `60-SCANNER-AND-RANKING-SUBTLETIES.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `60A-NEGATIVE-EVIDENCE-VETO-AND-DISQUALIFICATION-ENGINE.md` | `60A-NEGATIVE-EVIDENCE-VETO-AND-DISQUALIFICATION-ENGINE.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `61-BACKTEST-SUBTLETIES.md` | `61-BACKTEST-SUBTLETIES.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `62-LIVE-TRADING-SUBTLETIES.md` | `62-LIVE-TRADING-SUBTLETIES.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `63-HOW-PROFESSIONALS-THINK-ABOUT-EDGE.md` | `63-HOW-PROFESSIONALS-THINK-ABOUT-EDGE.md` | `P0/P1/P2/P3/P4` | `COMPLETED` |
| `64-PROFESSIONAL-CHECKLIST-BEFORE-REAL-MONEY.md` | `64-PROFESSIONAL-CHECKLIST-BEFORE-REAL-MONEY.md` | TBD | `NOT STARTED` |

‏שאר שיעורי 65–85, ‏`85A` וה־Cross-Cutting packs יתווספו לאינדקס בהתקדמות מבוקרת; אין להסיק מחוסר שורה שהם מחוץ ל־scope.

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