# ‏שלב 83 — `Know by Heart vs Reference`: מה חייב להיות בראש ומה מספיק לדעת איפה למצוא

> ‏מטרת הפרק: לבנות מפת ידע מעשית שמפרידה בין עקרונות, Invariants ושאלות שחייבים להיות זמינים מיידית בזמן תכנון, פיתוח ותגובה לתקלה — לבין פרטים שמספיק לשמור כ־Reference מדויק, versioned ועדכני. המטרה אינה לזכור יותר; המטרה היא לזכור נכון.
>
> ‏העיקרון המרכזי: **ידע שחייב להיות בעל־פה הוא ידע שמונע החלטה מסוכנת או שגיאה מושגית בזמן אמת. מידע שמשתנה, תלוי Provider או דורש דיוק מספרי צריך להיות Reference עם מקור, גרסה ו־`VerifiedAt` — לא זיכרון אנושי.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח. פרטים רגולטוריים, Broker-specific, מס, עמלות והרשאות חייבים להיבדק מול מקור רשמי ועדכני לפני שימוש מעשי.

---

## ‏1. הבעיה שאנחנו פותרים

‏אחרי עשרות פרקים קל ליפול לאחת משתי טעויות:

```text
Too little internalized
→ dependency on documentation for basic reasoning

Too much memorized
→ stale details remembered with false confidence
```

‏מטרת הפרק היא ליצור שכבת ידע בשלוש רמות:

```text
L1 — KNOW BY HEART
L2 — KNOW HOW TO DERIVE
L3 — KNOW WHERE TO LOOK
```

---

# ‏חלק א — שלוש רמות הידע

## ‏2. `L1 — Know by Heart`

‏ידע שחייב להיות זמין בלי חיפוש:

- ‏Mental models.
- ‏Core invariants.
- ‏Safety semantics.
- ‏Failure-state meanings.
- ‏Economic chain.
- ‏Questions שחייבים לשאול לפני החלטה.

## ‏3. `L2 — Know How to Derive`

‏לא חייבים לזכור את כל הנוסחה, אבל חייבים לדעת:

- ‏מה רוצים לחשב.
- ‏אילו inputs דרושים.
- ‏אילו assumptions קיימים.
- ‏מה יכול להפוך את התוצאה למטעה.

## ‏4. `L3 — Know Where to Look`

‏דברים שמשתנים או דורשים precision:

- ‏Broker fee schedule.
- ‏API limits.
- ‏Market-data entitlements.
- ‏Settlement/regulatory rules.
- ‏Tax rules.
- ‏Exchange calendars.
- ‏Exact order-type support.

## ‏5. כלל הזהב

```text
Stable concept → internalize
Changing detail → reference
Dangerous ambiguity → verify before action
```

---

# ‏חלק ב — Mental Models שחייבים לדעת בעל־פה

## ‏6. `Signal != Edge`

‏Signal הוא אינדיקציה סטטיסטית אפשרית.

‏Edge הוא יתרון כלכלי שנשאר אחרי כל השרשרת.

## ‏7. השרשרת שחייבים לזכור

```text
Prediction
→ Ranking
→ Entry Feasibility
→ Fill
→ Adverse Selection
→ Exit Feasibility
→ Costs
→ Net Outcome
```

## ‏8. `Gross Edge != Net Edge`

‏רווח חזוי לפני spread, slippage, fees, latency ו־impact אינו הרווח שניתן ללכוד.

## ‏9. `Rank #1 != Best Trade`

‏המניה המדורגת ראשונה יכולה להיות:

- ‏stale.
- ‏untradeable.
- ‏expensive to enter.
- ‏expensive to exit.
- ‏vetoed.
- ‏statistical winner's curse.

## ‏10. `TRADE` אינו ברירת המחדל

‏`NO_TRADE` הוא output תקין לחלוטין.

## ‏11. `UNKNOWN` שונה מ־`NO_TRADE`

‏`NO_TRADE` אומר שהמערכת יודעת מספיק והחליטה לא לפעול.

‏`UNKNOWN` אומר שאין לה מספיק אמת כדי להחליט בבטחה.

## ‏12. `UNKNOWN` קריטי צריך לחסום סיכון חדש

‏כשאין ודאות לגבי Broker state, Position state או Market Data freshness — לא ממציאים תשובה.

## ‏13. `Local Truth != Broker Truth`

‏Local state הוא cache/interpretation.

‏Broker הוא authoritative לגבי orders/fills/positions שבאחריותו.

## ‏14. `Sent != Accepted != Working != Filled`

‏Order שעזב את התהליך המקומי אינו בהכרח קיים אצל Broker.

## ‏15. `Cancel Sent != Cancelled`

‏Cancel request אינו הוכחה שה־Order כבר אינו יכול להתמלא.

## ‏16. `No Ack != No Order`

‏אובדן acknowledgement אינו הוכחה שה־Order לא התקבל.

## ‏17. `Touch != Fill`

‏מחיר שנגע ב־Limit אינו מוכיח שהיינו מקבלים Fill.

## ‏18. `Backtest Fill != Live Fill`

‏Simulator הוא model, לא אמת.

## ‏19. `Paper Fill != Live Fill`

‏Paper Trading בודק plumbing ו־decision flow טוב יותר משהוא מוכיח execution economics.

## ‏20. `Freshness` היא חלק מה־Feature

‏Value ללא age אינו מידע שלם.

## ‏21. `Price` אינו מושג יחיד

‏צריך לדעת להבחין בין:

```text
Last
Bid
Ask
Mid
Microprice
Arrival Price
Fill Price
VWAP
Reference Price
```

## ‏22. `Spread` הוא cost וגם state variable

‏Spread משפיע גם על economics וגם על האינפורמציה לגבי liquidity/regime.

## ‏23. `Latency` היא economic variable

‏לא שואלים רק “כמה ms”.

‏שואלים:

```text
Latency Pressure = EndToEndLatency / SignalHalfLife
```

## ‏24. `Signal Half-Life`

‏Signal קצר שחי שניות אינו יכול לסבול pipeline איטי כאילו הוא signal של שעות.

## ‏25. `Entry` ו־`Exit` אינם סימטריים

‏Entry הוא אופציונלי.

‏Exit יכול להיות חובה כי כבר קיימת חשיפה.

## ‏26. `Fail Closed for Entry`

‏כשיש ספק קריטי — לא מוסיפים exposure.

## ‏27. `Preserve Exit Capability`

‏מצב degraded צריך לנסות לשמור יכולת לנהל או לסגור exposure קיים.

## ‏28. `Position First`

‏ברגע שיש Position, היא מקבלת עדיפות תפעולית על פני חיפוש הזדמנות חדשה.

## ‏29. `Pending Exposure` הוא Exposure

‏Order פתוח או מצב לא ידוע יכול לייצר exposure גם אם עדיין אין Position מקומי מאומת.

## ‏30. `RemainingNetEdge`

‏לפני Submit צריך לחשוב על מה שנותר מה־Edge עכשיו, לא על מה שהיה כשה־Signal זוהה.

---

# ‏חלק ג — Data שחייבים להבין בעל־פה

## ‏31. `Event Time` מול `Receive Time`

‏מתי השוק יצר את האירוע אינו בהכרח מתי קיבלנו אותו.

## ‏32. `Process Time` מול `Decision Time`

‏גם אחרי שהמידע הגיע, הוא יכול לחכות בתור.

## ‏33. כל Timestamp עונה על שאלה אחרת

‏אסור להחליף Clock semantics בלי להבין את המשמעות.

## ‏34. `Out-of-Order` אינו חריג תאורטי

‏מערכת stream אמיתית חייבת להניח שהוא אפשרי.

## ‏35. `Duplicate` אינו בהכרח bug של Provider

‏Delivery semantics יכולים לייצר duplicate events.

## ‏36. `Gap` חייב להיות observable

‏אי אפשר להתייחס לחוסר מידע כאילו לא קרה דבר.

## ‏37. Corrected data שונה מ־As-Known-At data

‏Backtest חייב לדעת מה באמת היה ידוע בזמן ההחלטה.

## ‏38. Historical data יכולה להיות “נקייה מדי”

‏תיקונים מאוחרים יכולים להעלים בעיות שהיו קיימות ב־Live.

## ‏39. `Canonical State`

‏Components אינם צריכים לפרש raw provider semantics כל אחד מחדש.

## ‏40. Provider-specific quirks שייכים ל־Adapter

‏לא ללוגיקה העסקית.

## ‏41. Data quality היא state

‏לא רק log message.

## ‏42. `FreshCoverage`

‏Scanner טוב צריך לדעת כמה מה־Universe באמת מכוסה בנתונים טריים.

## ‏43. `Stale Winner`

‏מועמד יכול “לנצח” רק משום שהנתון שלו ישן יותר או עוד לא עודכן לרעה.

## ‏44. `Cross-Sectional Fairness`

‏השוואת Symbols דורשת בסיס זמן/טריות מספיק הוגן.

## ‏45. `DataGeneration`

‏Reconnect או provider switch צריכים לבטל assumptions שנבנו על generation ישן.

## ‏46. Data Failover אינו transparent בהכרח

‏מקורות שונים יכולים להחזיק semantics שונים.

## ‏47. Raw data חשוב ל־RCA

‏Derived features בלבד אינם מספיקים תמיד כדי להסביר failure.

## ‏48. Corporate Actions יכולים לשבור continuity

‏Split, symbol change או adjustment מכני יכולים להיראות כמו signal אם identity/adjustment שגויים.

## ‏49. Trading State הוא Data

‏Halt, auction, session transition או reopen משנים interpretation.

## ‏50. `Missing != Zero`

‏ערך חסר אינו ערך אפס.

---

# ‏חלק ד — Feature Engineering שחייבים לדעת בעל־פה

## ‏51. Feature הוא Hypothesis ממומש

‏הוא אינו “עוד column”.

## ‏52. לכל Feature יש Horizon

‏Feature טוב באופק אחד יכול להיות חסר ערך באחר.

## ‏53. Normalization משנה משמעות

‏Raw change, percent change, z-score ו־cross-sectional rank אינם אותו דבר.

## ‏54. Feature צריך Point-in-Time Correctness

‏כל input חייב להיות זמין בזמן שבו ה־Feature כביכול חושב.

## ‏55. `Warmup` הוא state אמיתי

‏Feature שלא צבר history מספיק הוא `NOT_READY`, לא אפס.

## ‏56. `Feature Age`

‏Feature מחושב יכול להיות מיושן גם אם raw data חדש יותר כבר הגיע.

## ‏57. Redundant Features לא בהכרח מוסיפים Evidence

‏חמישה derivatives של אותו price move אינם חמישה Signals עצמאיים.

## ‏58. Correlation אינה redundancy מלאה

‏אבל היא סימן שצריך לבדוק incremental value.

## ‏59. Feature Importance אינה Causality

‏מודל יכול להסתמך על Feature בלי שה־Feature “גורם” לתוצאה.

## ‏60. Feature חייב להצדיק Maintenance Cost

‏חישוב, latency, data dependency, testing ו־monitoring הם עלויות.

## ‏61. Feature Retirement הוא חלק מהמערכת

‏לא רק Feature Addition.

## ‏62. Feature שאין לו usage observable הופך לחוב

‏צריך לדעת מי צורך אותו ולמה.

## ‏63. `Online / Offline Parity`

‏Feature definition במחקר וב־Production חייבת להיות שקולה.

## ‏64. שינוי קטן ב־Window יכול להיות Strategy Change

‏לא “tweak חסר משמעות”.

## ‏65. Feature חייב Version

‏כדי לשחזר החלטה היסטורית.

---

# ‏חלק ה — Ranking ו־Decision

## ‏66. Ranking הוא בעיה Cross-Sectional

‏השאלה אינה רק “האם Symbol עולה”.

‏אלא “איך הוא עומד ביחס לאחרים באותה נקודת זמן”.

## ‏67. Rank ללא Absolute Quality Gate מסוכן

‏מישהו תמיד יהיה Rank #1 גם ביום שבו כולם גרועים.

## ‏68. `RankGap`

‏פער קטן בין מקום ראשון לשני אומר שהבחירה פחות יציבה.

## ‏69. `RankChurn`

‏Top1 שמתחלף מהר יכול להעיד על signal unstable או score compression.

## ‏70. `RankPersistence`

‏חשוב להבין כמה זמן Candidate נשאר איכותי.

## ‏71. Deterministic Tie-Breaking

‏אותם inputs צריכים להוביל לאותו ranking.

## ‏72. Top-K חשוב יותר מ־Top1 בלבד למחקר

‏בלי Top-K מאבדים Counterfactuals.

## ‏73. Selection Bias

‏Rank #1 מתוך אלפי candidates צפוי להיראות קיצוני גם בגלל Noise.

## ‏74. Winner's Curse

‏הטוב ביותר In-Sample נוטה להיראות פחות טוב מחוץ למדגם.

## ‏75. Positive Evidence ו־Negative Evidence הם מנגנונים שונים

‏Score גבוה אינו אמור למחוק Hard Veto.

## ‏76. `Hard Veto`

‏מצב שבו Candidate אינו כשיר לפעולה.

## ‏77. `Soft Penalty`

‏Evidence שלילי שאינו מספיק לבדו כדי לפסול.

## ‏78. `Cooldown`

‏Negative memory לזמן מוגבל לאחר אירוע רלוונטי.

## ‏79. `ReasonCode`

‏כל veto משמעותי צריך להיות מוסבר בצורה machine-readable.

## ‏80. `NO_TRADE` צריך להיות explainable

‏לא “לא מצאנו משהו”.

---

# ‏חלק ו — Execution שחייבים לדעת בעל־פה

## ‏81. Order Type הוא Trade-off

‏אין Order Type “הכי טוב”.

## ‏82. Market Order קונה certainty of action במחיר של price uncertainty

## ‏83. Limit Order קונה price protection במחיר של fill uncertainty

## ‏84. Marketable Limit

‏יכול להגביל worst acceptable price תוך שמירה על aggressiveness מסוימת.

## ‏85. Passive Fill יכול להיות Toxic

‏Fill אינו תמיד הצלחה; לפעמים קיבלנו Fill כי השוק עומד לזוז נגדנו.

## ‏86. Adverse Selection

‏צריך למדוד מה קרה אחרי Fill, לא רק אם התמלאנו.

## ‏87. Queue Position

‏מחיר Limit זהה אינו מבטיח probability of fill זהה.

## ‏88. Cancel/Replace יכול לאבד Priority

‏זה execution decision, לא UI פעולה תמימה.

## ‏89. Partial Fill יוצר State חדש

‏לא “Order כמעט הושלם”.

## ‏90. `Order Aging`

‏Order יכול להפוך ללא רלוונטי גם אם עדיין valid אצל Broker.

## ‏91. Decision TTL ו־Order TTL שונים

‏אפשר שהחלטה תפוג לפני Order או להפך.

## ‏92. `Arrival Price`

‏Benchmark חשוב להבנת execution quality.

## ‏93. Slippage צריך Attribution

‏Signal decay, spread, latency, impact ו־routing הם גורמים שונים.

## ‏94. Fill Probability היא חלק מה־Economics

‏לא רק metric תפעולי.

## ‏95. Missed Opportunity היא Cost אפשרית

‏No-fill אינו חינם.

## ‏96. Exit Feasibility צריכה להיבדק לפני Entry

‏לא מספיק לדעת להיכנס.

## ‏97. `TimeToFlat`

‏אחד המדדים החשובים ביותר בעת exposure.

## ‏98. Broker API הוא Distributed System Boundary

‏timeouts, duplicates, reconnects ו־unknown outcomes הם נורמליים.

## ‏99. Stable Client Order ID

‏חיוני ל־idempotency ול־reconciliation.

## ‏100. אין Retry עיוור אחרי Unknown Effect

‏קודם מבררים מה קרה.

---

# ‏חלק ז — Risk ו־Safety

## ‏101. Risk מתחיל לפני Order

‏לא רק ב־Stop Loss.

## ‏102. Exposure הוא יותר מ־Filled Position

‏כולל pending/unknown orders.

## ‏103. Limit על Position אינו מספיק

‏צריך גם limit על pending exposure.

## ‏104. Risk Budget צריך להיות מפורש

‏לא נגזרת מקרית של Buying Power.

## ‏105. `Kill Switch`

‏צריך להיות מסוגל לעצור יצירת exposure חדש במהירות.

## ‏106. Kill Switch אינו בהכרח Flatten

‏עצירת Entries וסגירת Positions הן פעולות שונות.

## ‏107. `ENTRY_DISABLED`

‏מצב שימושי שבו לא נכנסים לחדש אך ממשיכים לנהל קיים.

## ‏108. `EXIT_ONLY`

‏מצב שבו כל המערכת מתעדפת ירידה בסיכון.

## ‏109. `SAFE_MODE`

‏צריך semantics מוגדרים מראש.

## ‏110. Safety Controls צריכים להיות פשוטים יותר מה־Strategy

‏מערכת הגנה מורכבת מדי עלולה להיכשל יחד עם המערכת שהיא מגינה עליה.

## ‏111. Independent Control Plane

‏בקרות קריטיות לא צריכות להיות תלויות לחלוטין ב־decision path.

## ‏112. Single Writer / Fencing

‏שני instances שמאמינים שהם active יכולים להיות failure חמור.

## ‏113. Unknown Position State הוא Risk State

## ‏114. Stale Market Data הוא Risk State

## ‏115. Broker Disconnect בזמן Exposure שונה מ־Disconnect כשהמערכת Flat

## ‏116. Exit Priority עולה בזמן degraded mode

## ‏117. Risk אינו רק PnL

‏כולל operational uncertainty ו־state uncertainty.

## ‏118. Limit Breach צריך Reason + Timestamp + Action

## ‏119. Manual Intervention חייב להיות auditable

## ‏120. Safety Success צריך להימדד

‏Trade שלא נשלח בגלל veto תקין יכול להיות הצלחה.

---

# ‏חלק ח — Research ו־Statistics

## ‏121. Backtest הוא Experiment

‏לא proof.

## ‏122. Point-in-Time correctness קודם ל־PnL

## ‏123. Overfitting הוא ברירת מחדל אפשרית

‏לא edge case.

## ‏124. Multiple Testing משנה את רמת האמון

## ‏125. Effect Size חשוב לצד Significance

## ‏126. Economic Significance שונה מ־Statistical Significance

## ‏127. Effective Sample Size קטן ממספר ה־rows כשיש תלות

## ‏128. Overlapping Labels אינם independent observations

## ‏129. OOS חייב להישאר באמת OOS

## ‏130. Repeated peeking שוחק Holdout

## ‏131. Walk-Forward מתאים יותר לעולם משתנה

## ‏132. Regime Conditioning יכול לחשוף instability

## ‏133. Null Test חשוב

‏צריך לבדוק מה קורה אם ה־Signal חסר משמעות.

## ‏134. Time Shift Test יכול לחשוף Leakage

## ‏135. Ablation שואל מה כל רכיב באמת מוסיף

## ‏136. Sensitivity Surface חשובה יותר מ־Best Parameter

## ‏137. Plateau עדיף על Peak צר

## ‏138. Negative Results צריכים להישמר

## ‏139. Hypothesis צריך להיכתב לפני Evaluation ככל האפשר

## ‏140. Evidence Ladder

```text
Observation
→ Backtest
→ Replay
→ Shadow
→ Paper
→ Controlled Live Evidence
```

---

# ‏חלק ט — Regime, Events ו־Context

## ‏141. Same Signal, Different Context

‏אותו score יכול לקבל economics שונים ב־regimes שונים.

## ‏142. Regime חייב להיות Point-in-Time

## ‏143. Regime Label בדיעבד יכול ליצור Leakage

## ‏144. Soft Context עדיף לעיתים על Bucket קשיח

## ‏145. Transition State הוא regime בפני עצמו לעיתים

## ‏146. Volatility ו־Liquidity אינם אותו דבר

## ‏147. Breadth מספקת Market Context

## ‏148. Correlation Shock משנה diversification assumptions

## ‏149. Event State יכול לשנות interpretation של Momentum

## ‏150. Price Move אינו Catalyst

## ‏151. Corporate Action אינו Alpha

## ‏152. Split/Adjustment שגוי יכול לייצר Signal פיקטיבי

## ‏153. Halt/Resume משנה execution assumptions

## ‏154. Event Age חשוב

## ‏155. Unknown Event Context אינו excuse להמציא causal story

---

# ‏חלק י — Performance ו־Operations

## ‏156. Average latency אינה מספיקה

‏צריך לפחות p50/p95/p99.

## ‏157. Tail Latency יכולה להרוס short-lived edge

## ‏158. Queue Age לעיתים חשוב יותר מ־Queue Depth

## ‏159. Backpressure חייב policy

## ‏160. Load Shedding חייב לשמור priority ל־open positions ו־exits

## ‏161. GC pause הוא business event אם הוא פוגע ב־decision freshness

## ‏162. Cold Start צריך semantics

## ‏163. Restart אינו “start רגיל”

‏צריך reconciliation.

## ‏164. Reconnect יוצר generation חדש במקומות המתאימים

## ‏165. Observability היא חלק מה־Product

## ‏166. Missing telemetry אינו Neutral

‏אם אי אפשר למדוד critical invariant, אי אפשר להוכיח שהוא נשמר.

## ‏167. Alert צריך פעולה צפויה

## ‏168. Alert Fatigue היא failure mode

## ‏169. Logs בלי Correlation IDs מקשים RCA

## ‏170. Incident Packet צריך להיות reproducible

---

# ‏חלק יא — Learning ו־Governance

## ‏171. Production אינו Research Notebook

## ‏172. Daily Review אינו Auto-Tuning

## ‏173. Drift הוא Trigger לחקירה

‏לא אוטומטית Trigger לשינוי.

## ‏174. Challenger אינו מחליף Champion בלי Promotion Evidence

## ‏175. PnL גבוה יותר לבדו אינו מספיק ל־Promotion

## ‏176. Disagreement Set הוא המקום המרכזי להשוואת גרסאות

## ‏177. Strategy Version היא Composite Artifact

## ‏178. Git commit לבדו אינו Strategy Version

## ‏179. שינוי Config משמעותי הוא Version Change

## ‏180. Rollback דורש state compatibility

## ‏181. Feature Retirement הוא שיפור אפשרי

## ‏182. Simplification יכולה להיות Promotion

## ‏183. Negative Evidence צריך lifecycle

## ‏184. Known Risks חייבים להיות כתובים

## ‏185. Unknowns צריכים להיות tracked

## ‏186. `Fact`, ‏`Judgment`, ‏`Hypothesis` צריכים להיות מובחנים

## ‏187. Evidence > Preference

## ‏188. Mechanism > Story

## ‏189. Reproducibility > Memory

## ‏190. Correctness > Throughput כאשר יש conflict עם exposure truth

---

# ‏חלק יב — מה חייבים לדעת להסיק, לא בהכרח לזכור נוסחתית

## ‏191. Return

‏צריך לדעת לבנות return נכון ל־horizon ול־reference price הנכון.

## ‏192. Volatility

‏צריך לדעת איזה estimator מתאים לשאלה ולא רק “לחשב std”.

## ‏193. Expected Value

‏צריך לדעת לשקלל outcomes והסתברויות, לא רק win rate.

## ‏194. Break-Even Cost

‏צריך לדעת לחשב כמה cost יכול לעלות לפני שה־edge נעלם.

## ‏195. Capture Ratio

‏צריך לדעת להשוות predicted opportunity למה שבאמת נתפס.

## ‏196. Adverse-Selection Markout

‏צריך לדעת למדוד מה קרה אחרי Fill ביחס ל־benchmark.

## ‏197. Confidence Interval

‏צריך להבין מהו טווח אי־הוודאות של estimate.

## ‏198. Correlation

‏צריך להבין מה היא אומרת ומה היא לא מוכיחה.

## ‏199. Regression

‏צריך להבין conditional relationship, residual ו־confounding.

## ‏200. Effective Sample Size

‏צריך לדעת לזהות מתי מיליון rows אינם מיליון observations עצמאיים.

---

# ‏חלק יג — מה *לא* צריך לזכור בעל־פה

## ‏201. Exact Broker Fees

‏לשמור Reference עדכני.

## ‏202. Exact Exchange Fees

‏לשמור schedule versioned.

## ‏203. Exact Regulatory Fee Rates

‏לא לקודד מזיכרון.

## ‏204. Exact API Rate Limits

‏לבדוק documentation עדכנית.

## ‏205. Exact Market-Data Entitlements

‏תלויי account/provider.

## ‏206. Exact Order-Type Availability

‏תלוי Broker, API, venue ו־instrument.

## ‏207. Exact Auction Cutoffs

‏Reference רשמי ועדכני.

## ‏208. Exact Halt/LULD Threshold Details

‏Reference רשמי ועדכני.

## ‏209. Exact Settlement Exceptions

‏Reference רגולטורי/Broker.

## ‏210. Exact Margin Formulas

‏תלויות account/product/broker/rules.

## ‏211. Exact Tax Rates

‏תלויי שנה, תושבות ומצב אישי.

## ‏212. Exact Tax Forms

‏לבדוק לשנת המס הרלוונטית.

## ‏213. Exact Holiday Calendar

‏לא לזכור; לצרוך calendar versioned.

## ‏214. Exact Symbol Universe

‏להפיק מ־reference/master data.

## ‏215. Exact Corporate-Action History

‏לשמור data source ולא זיכרון.

## ‏216. Exact Provider Field Semantics

‏לשמור adapter contract/documentation.

## ‏217. Exact Error Codes

‏לשמור mapping searchable.

## ‏218. Exact Deployment Commands

‏Runbook versioned עדיף על זיכרון.

## ‏219. Exact Recovery Commands

‏Runbook, tests ו־automation.

## ‏220. Exact Production Secrets/Identifiers

‏אינם חומר לשינון; הם מנוהלים במנגנון secrets מתאים.

---

# ‏חלק יד — `Reference System` מקצועי

## ‏221. כל Reference משתנה צריך Metadata

```text
Source
VerifiedAt
EffectiveFrom
AppliesTo
Version
Owner
NextReview
```

## ‏222. `VerifiedAt`

‏חשוב במיוחד ל־Broker/Regulatory/Tax information.

## ‏223. `AppliesTo`

‏צריך לציין אם הנתון חל על:

- ‏Account type.
- ‏Country/entity.
- ‏Instrument.
- ‏Session.
- ‏API version.

## ‏224. Reference בלי Scope יכול להיות מסוכן

## ‏225. Reference צריך Primary Source כאשר אפשר

## ‏226. Cached knowledge צריך Expiration

## ‏227. Rules that can change should be configurable

## ‏228. Configurable לא אומר ungoverned

‏שינוי עדיין דורש version/evidence.

## ‏229. Machine-readable Reference עדיף כשמערכת צורכת אותו

## ‏230. Human-readable explanation עדיין נחוצה ל־operations

---

# ‏חלק טו — Emergency Knowledge

## ‏231. בזמן Incident צריך לדעת מיד מי authoritative

## ‏232. צריך לדעת מיד איך לעצור Entries

## ‏233. צריך לדעת מיד איך לזהות Exposure

## ‏234. צריך לדעת מיד אם Broker state ידוע או `UNKNOWN`

## ‏235. צריך לדעת מיד איפה Position Truth נבדק

## ‏236. צריך לדעת מיד שלא עושים Blind Retry

## ‏237. צריך לדעת מיד ש־Cancel request אינו Cancel confirmation

## ‏238. צריך לדעת מיד ש־Partial Fill דורש ניהול Exposure

## ‏239. צריך לדעת מיד איך עוברים ל־`EXIT_ONLY`

## ‏240. צריך לדעת מיד מתי לא ממשיכים אוטומטית

---

# ‏חלק טז — שאלות שחייבות להפוך לרפלקס

## ‏241. `What exactly do we know right now?`

## ‏242. `How fresh is it?`

## ‏243. `Compared to what?`

## ‏244. `What changed since the signal was created?`

## ‏245. `Is the candidate still executable?`

## ‏246. `What is the remaining net edge?`

## ‏247. `What could make this observation misleading?`

## ‏248. `What is the broker's current truth?`

## ‏249. `What exposure already exists or may exist?`

## ‏250. `Can we exit if the environment degrades?`

## ‏251. `Is this evidence or a story?`

## ‏252. `Was this information available at decision time?`

## ‏253. `Is this improvement incremental over the baseline?`

## ‏254. `Did costs or latency consume the edge?`

## ‏255. `What is the first divergence from expected behavior?`

## ‏256. `Would this conclusion survive another regime?`

## ‏257. `Are we observing a process failure or a normal losing outcome?`

## ‏258. `What would falsify this hypothesis?`

## ‏259. `What do we not know?`

## ‏260. `Is NO_TRADE the correct answer?`

---

# ‏חלק יז — מה צריך להיות Muscle Memory אצל מפתח המערכת

## ‏261. Never mutate assumptions silently

## ‏262. Never change production config without version identity

## ‏263. Never replay corrected data as if it were live-known data

## ‏264. Never treat missing as zero

## ‏265. Never trust a single timestamp without clock semantics

## ‏266. Never retry an order with unknown effect blindly

## ‏267. Never infer flat from local state alone after disconnect

## ‏268. Never make new entries with critical stale inputs

## ‏269. Never let a research convenience bypass a production invariant

## ‏270. Never promote from one attractive chart

## ‏271. Never compare strategies on unequal data without documenting it

## ‏272. Never assume a fee/rule remains current because it was true last year

## ‏273. Never suppress a failure without preserving evidence

## ‏274. Never let observability block the hot path unnecessarily

## ‏275. Never let performance optimization change semantics silently

## ‏276. Never let a Challenger send real orders unintentionally

## ‏277. Never delete the ability to reproduce an old decision prematurely

## ‏278. Never treat PnL as the only health signal

## ‏279. Never confuse a profitable outcome with a correct process

## ‏280. Never confuse a losing outcome with a broken process

---

# ‏חלק יח — Knowledge Drills

## ‏281. `Explain the full trade chain in 60 seconds`

‏אם אי אפשר להסביר את השרשרת, המודל המנטלי עדיין לא מספיק חד.

## ‏282. `Explain why Rank #1 may be NO_TRADE`

## ‏283. `Explain UNKNOWN_EFFECT without notes`

## ‏284. `Explain why Touch != Fill`

## ‏285. `Explain Local Truth vs Broker Truth`

## ‏286. `Explain Signal Half-Life vs Latency`

## ‏287. `Explain Winner's Curse`

## ‏288. `Explain Point-in-Time Leakage`

## ‏289. `Explain why Paper is not execution proof`

## ‏290. `Explain why a Feature can be retired despite historical value`

## ‏291. `Explain why good PnL can hide a broken system`

## ‏292. `Explain why NO_TRADE can be the best decision`

## ‏293. `Explain why Short needs Borrow Feasibility`

## ‏294. `Explain why Corporate Action can fake Momentum`

## ‏295. `Explain why changing config changes Strategy identity`

## ‏296. `Explain why Daily Review must not auto-tune Production`

## ‏297. `Explain why a simpler model can be superior`

## ‏298. `Explain why an average latency number is insufficient`

## ‏299. `Explain why exit capability matters before entry`

## ‏300. `Explain what evidence would make you stop trusting the strategy`

---

# ‏חלק יט — Knowledge Map לפי תפקיד

## ‏301. `Researcher Must Know by Heart`

- ‏Leakage.
- ‏Selection bias.
- ‏Multiple testing.
- ‏OOS.
- ‏Effect size.
- ‏Execution realism.
- ‏Regime dependence.
- ‏Counterfactual thinking.

## ‏302. `Scanner Engineer Must Know by Heart`

- ‏Freshness.
- ‏Coverage.
- ‏Fair ranking.
- ‏Top-K.
- ‏Churn.
- ‏Backpressure.
- ‏Decision TTL.

## ‏303. `Execution Engineer Must Know by Heart`

- ‏Order state machine.
- ‏Partial fills.
- ‏Cancel/fill race.
- ‏Unknown effect.
- ‏Idempotency.
- ‏Broker reconciliation.
- ‏Exit priority.

## ‏304. `Operations Owner Must Know by Heart`

- ‏Safe modes.
- ‏Kill controls.
- ‏Recovery sequence.
- ‏Truth sources.
- ‏Incident evidence.
- ‏Rollback semantics.

## ‏305. `Strategy Owner Must Know by Heart`

- ‏Why the edge is expected to exist.
- ‏Where it should work.
- ‏Where it should fail.
- ‏What consumes it.
- ‏What would falsify it.

---

# ‏חלק כ — מה צריך להיות Cheat Sheet ולא Memory

## ‏306. Broker/API capability matrix

## ‏307. Current fee schedule

## ‏308. Current regulatory matrix

## ‏309. Current market-data entitlement matrix

## ‏310. Order type support matrix

## ‏311. Session/auction calendar

## ‏312. Corporate-action processing rules

## ‏313. Tax/reporting checklist

## ‏314. Provider error-code mapping

## ‏315. Recovery command/runbook

## ‏316. Release checklist

## ‏317. Live readiness checklist

## ‏318. Incident escalation matrix

## ‏319. Version compatibility matrix

## ‏320. Schema migration matrix

---

# ‏חלק כא — Personal Baseline לרובוט שלנו

> ‏החלק הבא הוא `Judgment / Hypothesis`, לא Recommendation סופית. ה־Recommendation Playbook יכריע מאוחר יותר על בסיס כל הקורס.

## ‏321. לדעת בעל־פה את השרשרת הכלכלית

```text
Detect
→ Rank
→ Veto
→ Revalidate
→ Execute
→ Fill
→ Manage
→ Exit
→ Measure Net
```

## ‏322. לדעת בעל־פה את השרשרת התפעולית

```text
Intent
→ Persist
→ Submit
→ Observe Broker
→ Reconcile
→ Maintain Position Truth
→ Exit
→ Confirm Flat
```

## ‏323. לדעת בעל־פה את השרשרת המחקרית

```text
Hypothesis
→ Point-in-Time Dataset
→ Backtest
→ Replay
→ Shadow
→ Evidence
→ Promotion or Rejection
```

## ‏324. לא לזכור Provider-specific thresholds

‏לשמור אותם ב־versioned reference.

## ‏325. לא לזכור Broker-specific behavior מתוך הרגל

‏לבדוק contract/doc עדכני.

## ‏326. לזכור שה־horizon שלנו קצר

‏לכן freshness, latency ו־execution אינם “פרטי implementation”.

## ‏327. לזכור שאנחנו לא HFT

‏אין צורך לבנות co-location/FPGA architecture כדי ללמוד ולבדוק edge של שניות.

## ‏328. לזכור ש־milliseconds עדיין יכולים להיות חשובים ביחס ל־signal half-life

## ‏329. לזכור ש־whole-market ranking יוצר selection bias חזק

## ‏330. לזכור ש־Top1 לבדו אינו מספיק למחקר

## ‏331. לזכור ש־NO_TRADE הוא חלק מה־Strategy

## ‏332. לזכור ש־negative evidence הוא parallel engine

## ‏333. לזכור ש־execution quality יכולה להפוך predictive edge להפסד

## ‏334. לזכור ש־first live evidence, אם וכאשר מותר ומאושר, מיועד calibration ולא “הוכחת רווחיות”

## ‏335. לזכור שאין “certification קבוע” ל־Strategy

‏שינוי גרסה, Provider, Broker או market regime יכול לדרוש evidence חדש.

---

# ‏חלק כב — Knowledge Review Cadence

## ‏336. Weekly Concept Review

‏לעבור על invariants ו־failure semantics.

## ‏337. Monthly Reference Review

‏לעבור על references שמשתנים לעיתים קרובות.

## ‏338. Pre-Release Review

‏לבדוק assumptions הקשורים לגרסה החדשה.

## ‏339. Pre-Live Review

‏לבדוק current broker/account/regulatory facts.

## ‏340. Post-Incident Review

‏להחליט האם failure נבע מחוסר ידע, reference stale או implementation fault.

## ‏341. After Major Provider Change

‏לרענן semantics, fields, limits ו־error handling.

## ‏342. After Major Strategy Change

‏לרענן את ה־mental model עצמו.

## ‏343. Stale Reference Test

‏Reference שאין לו `VerifiedAt` צריך להיחשב suspect.

## ‏344. Unknown Knowledge Test

‏אם אדם לא יודע אם נתון הוא invariant או changing detail — בודקים לפני פעולה.

## ‏345. Retrieval Drill

‏גם Reference צריך להיות ניתן למציאה תוך זמן סביר.

---

# ‏חלק כג — `Practitioner Secrets`

## ‏346. מקצוענים לא מנסים לזכור הכול

‏הם זוכרים את המודל שמאפשר לזהות איזה פרט חסר.

## ‏347. זיכרון של מספר ישן מסוכן יותר מחוסר זיכרון

‏כי הוא מגיע עם confidence שגוי.

## ‏348. Incident טוב חושף Knowledge Gap

‏לא רק Code Bug.

## ‏349. Checklist אינו תחליף להבנה

‏הוא מגן על זיכרון תחת לחץ.

## ‏350. Understanding אינו תחליף ל־Checklist

‏גם מומחה שוכח שלבים בזמן Incident.

## ‏351. הכי חשוב לזכור את גבולות הוודאות

‏לדעת מה איננו יודעים הוא capability מקצועי.

## ‏352. השאלה “מה מקור האמת?” פותרת הרבה בלבול

## ‏353. השאלה “מה היה ידוע בזמן ההחלטה?” פותרת הרבה Backtest illusions

## ‏354. השאלה “מה נשאר נטו?” פותרת הרבה Alpha illusions

## ‏355. השאלה “האם אפשר לצאת?” פותרת הרבה Entry illusions

## ‏356. השאלה “מה השתנה?” פותרת הרבה Versioning confusion

## ‏357. השאלה “איפה היה ה־First Divergence?” מאיצה RCA

## ‏358. השאלה “האם זה היה observable?” מפרידה בין preventable לבין unknowable

## ‏359. השאלה “האם זה reproducible?” מפרידה Evidence מזיכרון

## ‏360. השאלה “האם זה עדיין נכון היום?” קריטית לכל rule חיצוני

---

# ‏חלק כד — `Definition of Knowledge Readiness`

‏אדם מוכן לעבוד באופן מקצועי עם המערכת כאשר הוא מסוגל בלי לפתוח מסמכים:

## ‏361. להסביר את ה־economic chain.

## ‏362. להסביר את ה־order lifecycle.

## ‏363. להסביר את ה־position lifecycle.

## ‏364. להסביר `UNKNOWN_EFFECT`.

## ‏365. להסביר `NO_TRADE` מול `UNKNOWN`.

## ‏366. להסביר `Signal != Edge`.

## ‏367. להסביר למה Rank #1 יכול להיות Candidate גרוע.

## ‏368. להסביר freshness ו־cross-sectional fairness.

## ‏369. להסביר Point-in-Time correctness.

## ‏370. להסביר Backtest/Paper/Live gap.

## ‏371. להסביר why execution economics matter.

## ‏372. להסביר adverse selection.

## ‏373. להסביר why exit capability dominates during exposure.

## ‏374. להסביר source-of-truth hierarchy.

## ‏375. להסביר safe/degraded modes.

## ‏376. להסביר why blind retry is dangerous.

## ‏377. להסביר what evidence is required before promotion.

## ‏378. להסביר why changing config changes version identity.

## ‏379. להסביר how daily review feeds research without auto-changing production.

## ‏380. להגיד “אני לא יודע — צריך לבדוק את ה־Reference העדכני” כאשר הפרט אינו invariant.

---

# ‏סיכום

‏היעד אינו מוח מלא בפרטים.

‏היעד הוא מערכת ידע נכונה:

```text
Know the invariant.
Know the mental model.
Know the failure semantics.
Know what question to ask.
Know what must be verified.
Know where the authoritative reference lives.
Never confuse memory with current truth.
```

‏זהו ההבדל בין מי שיודע הרבה מונחים לבין מי שיכול להפעיל, לחקור ולתחזק מערכת Algo מורכבת בצורה מקצועית.