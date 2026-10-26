# ‏שלב 79 — `Personal Trading Playbook`: להפוך את כל הידע לדוקטרינת הפעלה אחת

> ‏מטרת הפרק: לרכז את הידע שנבנה לאורך הקורס ל־`Operating Playbook` אישי, ברור, versioned וניתן לביקורת. ה־Playbook מגדיר מה המערכת מנסה לעשות, מה היא מסרבת לעשות, אילו evidence gates שולטים בהחלטה, איך נראים `TRADE / NO TRADE`, מה עושים בזמן uncertainty או failure, ואיך מונעים מהמערכת ומהמפעיל לשנות כיוון בגלל תוצאה בודדת.
>
> ‏העיקרון המרכזי: **Playbook מקצועי אינו אוסף טיפים ואינו קובץ config. הוא חוזה תפעולי שמפריד בין `Fact`, ‏`Judgment` ו־`Hypothesis`, מגדיר Invariants שאסור לשבור, ומחייב Evidence לפני שינוי משמעותי.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח. כל שימוש בכסף אמיתי מחייב זכאות והרשאה מתאימות, עמידה בכללים העדכניים של החשבון וה־Broker, ואישור של בעל החשבון המורשה. אין לעקוף מגבלות גיל, חשבון, Broker או רגולציה.

---

## ‏1. מהו `Personal Trading Playbook`

‏ה־Playbook הוא התשובה הכתובה לשאלה:

```text
Given what we currently know,
how is this system supposed to behave?
```

‏הוא אינו אומר שה־Strategy טובה לנצח.

‏הוא אומר מה נחשב כרגע להתנהגות המאושרת, על בסיס ה־Evidence הקיים.

---

## ‏2. למה צריך Playbook אם כבר יש קוד

‏קוד עונה על:

```text
What does the system do?
```

‏Playbook עונה על:

```text
Why is it allowed to do that?
What must remain true?
When must it stop?
What evidence would justify changing it?
```

---

## ‏3. Playbook אינו `README`

‏`README` יכול להסביר איך להריץ.

‏Playbook מגדיר דוקטרינת החלטה.

---

## ‏4. Playbook אינו `Config`

‏Config יכול להכיל:

```text
threshold = 0.42
maxCandidateAgeMs = 800
```

‏Playbook צריך להסביר:

```text
Why does such a threshold exist?
What evidence supports it?
What metric invalidates it?
```

---

## ‏5. Playbook אינו `StrategyVersion`

‏`StrategyVersion` מזהה Artifact.

‏Playbook מסביר את מדיניות ההפעלה של אותו Artifact.

---

## ‏6. Playbook חייב להיות Versioned

‏שינוי בדוקטרינה הוא שינוי מהותי.

‏לכן גם ל־Playbook צריך להיות:

```text
PlaybookVersion
EffectiveFrom
RelatedStrategyVersions
AuthoritativeStatus
ChangeReason
EvidenceLinks
```

---

## ‏7. שלוש קטגוריות ידע

‏כל כלל משמעותי ב־Playbook צריך להיות מסווג כאחת משלוש:

```text
FACT
JUDGMENT
HYPOTHESIS
```

---

## ‏8. `FACT`

‏עובדה שניתנת לאימות ישיר.

‏למשל:

```text
The feed timestamp is 900 ms old.
The order is still working.
The broker reports position = 100.
```

---

## ‏9. `JUDGMENT`

‏בחירה הנדסית או מקצועית על בסיס evidence קיים.

‏למשל:

```text
Prefer NO TRADE when broker state is uncertain.
```

---

## ‏10. `HYPOTHESIS`

‏טענה שעדיין דורשת מחקר.

‏למשל:

```text
A fast rising symbol with high activity may have positive 5-second continuation.
```

---

# ‏חלק א — Mission ו־Non-Goals

## ‏11. Mission

‏המערכת חוקרת ומנסה לזהות יתרון קצר־טווח בר־ביצוע במניות אמריקאיות, בסדר גודל של מילישניות עד עשרות שניות ולעיתים עד בערך דקה, בלי להעמיד פנים שהיא מערכת HFT של microseconds.

---

## ‏12. ה־Mission אינו “למצוא מניה שעולה”

‏ה־Mission הוא:

```text
Find a candidate
whose expected executable net outcome
is better than the alternatives
under current conditions.
```

---

## ‏13. `Prediction != Trade`

‏גם תחזית נכונה אינה מספיקה.

‏צריך לעבור:

```text
Prediction
→ Ranking
→ Eligibility
→ Veto
→ Execution Feasibility
→ Cost Check
→ Risk Check
→ TRADE / NO TRADE
```

---

## ‏14. `Rank #1 != Must Trade`

‏Rank #1 הוא רק המועמד הטוב ביותר לפי מנגנון הדירוג הנוכחי.

‏הוא אינו הוכחה שיש Edge מספיק.

---

## ‏15. `NO TRADE` הוא Output תקין

‏המערכת אינה חייבת להיות מושקעת.

‏אין `Forced Trade`.

---

## ‏16. Non-Goal: ‏Microsecond HFT

‏אין הנחה של:

- ‏Co-location.
- ‏FPGA.
- ‏Nanosecond timing.
- ‏Exchange membership edge.

---

## ‏17. Non-Goal: לנבא כל Tick

‏אין צורך להסביר או לנבא כל תנועה.

‏מספיק לזהות subset קטן של מצבים עם expected value טוב יותר מהאלטרנטיבה.

---

## ‏18. Non-Goal: להגדיל Complexity לשם Complexity

‏כל שכבה חדשה צריכה להצדיק:

```text
Incremental Decision Value > Complexity Tax
```

---

## ‏19. Non-Goal: רווחיות בכל Regime

‏מותר ל־Strategy להיות פעילה רק בתנאים מסוימים.

---

## ‏20. Non-Goal: להיות תמיד צודקת

‏המטרה אינה Win Rate מושלם.

‏המטרה היא outcome נטו סביר תחת uncertainty.

---

# ‏חלק ב — Core Invariants

## ‏21. Invariant: אין Entry על State לא ידוע

‏כאשר state קריטי הוא `UNKNOWN`, ברירת המחדל היא חסימת Entry חדש.

---

## ‏22. Invariant: Exit יכול להישאר פעיל במצב Degraded

‏המערכת צריכה להיות מסוגלת לצמצם Exposure גם כאשר Entry נחסם.

---

## ‏23. Invariant: Broker Truth גובר על Local Assumption

‏במקרה של mismatch:

```text
Broker-reconciled state > local belief
```

---

## ‏24. Invariant: אין Retry לפני בירור Effect

‏אם Order נמצא ב־`UNKNOWN_EFFECT`, לא שולחים duplicate רק מפני שלא התקבל Ack.

---

## ‏25. Invariant: Data Freshness היא תנאי החלטה

‏Data stale אינה רק warning.

‏היא יכולה לשנות Eligibility.

---

## ‏26. Invariant: Decision חייב להיות ניתן לשחזור

‏לכל החלטה נשמרים:

```text
StrategyVersion
ConfigFingerprint
DataGeneration
DecisionEpoch
CandidateSnapshot
FeatureSnapshot
RankSnapshot
VetoSnapshot
AccountState
ExecutionState
```

---

## ‏27. Invariant: אין שינוי Production ללא Version

‏Hot change ללא identity חדש אסור.

---

## ‏28. Invariant: Safety Rule לא נעקף על ידי Score

‏Score גבוה אינו יכול לעקוף Hard Veto.

---

## ‏29. Invariant: Cost אינו Afterthought

‏Trade נבחן לפי:

```text
ExpectedGrossEdge
- ExpectedExecutionCost
- Fees
- Impact
- AdverseSelection
- OtherExpectedCosts
= RemainingNetEdge
```

---

## ‏30. Invariant: Unknown Critical Cost = NO TRADE

‏אם אי־אפשר לאמוד עלות קריטית בצורה סבירה, אין להניח שהיא אפס.

---

## ‏31. Invariant: Position State מקבל עדיפות על Scanner

‏כאשר יש Exposure פתוח, ניטור Position ו־Exit מקבלים קדימות תפעולית.

---

## ‏32. Invariant: Kill Switch עצמאי מה־Strategy

‏Strategy לא צריכה להיות מסוגלת לבטל בעצמה Safety Control מרכזי.

---

## ‏33. Invariant: Recovery לפני Resume

‏אחרי Restart/Reconnect:

```text
Reconcile
→ Validate state
→ Resolve unknown effects
→ Resume
```

‏לא להפך.

---

## ‏34. Invariant: Missing Telemetry אינה Neutral

‏אם Metric קריטי חסר, אין להסיק שהכול תקין.

---

## ‏35. Invariant: Evidence גובר על Narrative

‏הסבר שנשמע טוב אינו מספיק.

---

# ‏חלק ג — Universe Doctrine

## ‏36. Universe הוא Point-in-Time Artifact

‏אין להשתמש ברשימת מניות נוכחית כדי להסיק על העבר בלי טיפול ב־survivorship.

---

## ‏37. Universe אינו רק “כל המניות”

‏יש להבחין בין:

```text
Observed Universe
Eligible Universe
Fresh Universe
Executable Universe
```

---

## ‏38. Symbol חייב להיות Security Identity

‏Ticker לבדו אינו identity מספק כאשר יש symbol changes או corporate actions.

---

## ‏39. Universe Exclusion צריך ReasonCode

‏כל exclusion משמעותי צריך להיות מוסבר.

---

## ‏40. Eligibility משתנה בזמן

‏Symbol יכול להיות Eligible עכשיו ולא Eligible בעוד שנייה.

---

# ‏חלק ד — Market Data Doctrine

## ‏41. Market Data Provider מופרד מ־Execution Broker

```text
MarketDataProvider
ExecutionBroker
```

‏הם contracts נפרדים.

---

## ‏42. Feed אחד אינו “האמת” ללא Context

‏צריך לדעת:

- ‏Coverage.
- ‏Venue composition.
- ‏Timestamp semantics.
- ‏Corrections.
- ‏Conditions.
- ‏Known gaps.

---

## ‏43. LAST אינו Market State מלא

‏LAST יכול להיות Feature, אבל Bid/Ask/Mid/Spread/Depth ו־trade context עשויים לשנות executability.

---

## ‏44. Freshness נמדדת Per Symbol

‏Global feed heartbeat אינו מספיק.

---

## ‏45. Freshness נמדדת גם Per Layer

```text
QuoteAge
TradeAge
FeatureAge
ScoreAge
RankAge
DecisionAge
```

---

## ‏46. Corrections לא משכתבות Live Truth

‏שומרים:

```text
AsObserved
AsLaterCorrected
```

---

## ‏47. Data Quality State הוא First-Class

```text
GOOD
DEGRADED
STALE
UNKNOWN
```

---

## ‏48. Data Generation מונעת שימוש ב־stale callbacks

‏אחרי reconnect/failover, אירועים מדור קודם אינם מעדכנים state חדש.

---

# ‏חלק ה — Feature Doctrine

## ‏49. Feature הוא Hypothesis ממומש

‏אין Feature “קדוש”.

---

## ‏50. Feature חייב להיות Point-in-Time Correct

‏אסור להשתמש במידע שלא היה ידוע בזמן ההחלטה.

---

## ‏51. Feature חייב להגדיר `NOT_READY`

‏Warm-up חסר אינו אפס.

---

## ‏52. Feature חייב להגדיר Freshness

‏Value בלי age עלול להיות מסוכן.

---

## ‏53. Feature חדש מתחיל כ־Challenger

‏לא מכניסים אותו ישירות ל־Production decision path ללא validation.

---

## ‏54. Feature צריך להוכיח Incremental Value

‏לא מספיק שהוא correlated עם outcome.

---

## ‏55. Feature Redundancy נמדדת Decision-wise

‏שני Features יכולים להיות שונים מתמטית אך כמעט זהים בהחלטות שהם משנים.

---

## ‏56. Feature עם Cost גבוה צריך רף Evidence גבוה יותר

‏Cost כולל:

- ‏CPU.
- ‏Memory.
- ‏Latency.
- ‏Provider dependency.
- ‏Testing.
- ‏Monitoring.
- ‏Maintenance.

---

## ‏57. Feature Lifecycle מחייב Retirement

‏Feature שנחלש, מתייתר או נהיה brittle יכול לעבור ל־`WATCH`, ‏`DEPRECATED` או `RETIRED`.

---

# ‏חלק ו — Ranking Doctrine

## ‏58. Score אינו Probability אלא אם עבר Calibration

‏אין לפרש arbitrary score כ־70% הצלחה.

---

## ‏59. Rank הוא Relative

‏Rank #1 יכול להיות גרוע אבסולוטית.

---

## ‏60. Absolute Gate לפני Trade

‏גם winner צריך לעבור threshold של quality/executability/economics.

---

## ‏61. Top-K נשמר לצורכי Counterfactual

‏לא שומרים רק winner.

---

## ‏62. Rank Gap חשוב

‏הבדל קטן בין #1 ל־#2 משמעו confidence שונה מהבדל גדול.

---

## ‏63. Rank Churn חשוב

‏Winner שמתחלף במהירות יכול להצביע על unstable selection.

---

## ‏64. Rank Persistence הוא Feature תפעולי אפשרי

‏אבל חייב validation.

---

## ‏65. Tie Break חייב להיות Deterministic

‏אותם inputs צריכים להחזיר אותה החלטה.

---

## ‏66. Ranking Fairness דורש Fresh Coverage

‏אסור להשוות candidate fresh ל־candidate stale כאילו הם נמדדו באותו רגע.

---

## ‏67. Winner's Curse נלקח ברצינות

‏בחירה מתוך אלפי symbols מגדילה סיכוי לבחור extreme noise.

---

# ‏חלק ז — Negative Evidence Doctrine

## ‏68. Positive Evidence ו־Negative Evidence מופרדים

```text
Positive Evidence Engine → Score / Rank
Negative Evidence Engine → Veto / Penalty / Cooldown
```

---

## ‏69. Hard Veto חייב ReasonCode

‏אין rejection לא מוסבר.

---

## ‏70. Soft Penalty חייב להיות מדיד

‏Penalty שלא משנה החלטות או economics הוא complexity מיותר.

---

## ‏71. Cooldown הוא State, לא Hack

‏יש לו:

```text
Reason
Start
TTL
Decay
ResetCondition
```

---

## ‏72. Negative Memory אינו נצחי

‏Evidence ישן צריך decay או reset הגיוני.

---

## ‏73. False Veto נמדד

‏חסימת הפסדים אינה מספיקה; מודדים גם winners שנחסמו.

---

## ‏74. Exit Urgency מופרדת מ־Entry Block

‏Rule שמונע Entry לא בהכרח צריך לעכב Exit.

---

# ‏חלק ח — Decision Doctrine

## ‏75. Decision State בסיסי

```text
TRADE
NO_TRADE
UNKNOWN
```

---

## ‏76. `UNKNOWN` אינו `NO_TRADE`

‏`NO_TRADE` יכול להיות החלטה עסקית תקינה.

‏`UNKNOWN` הוא מצב ידע לא מספיק.

---

## ‏77. Decision Packet נשמר

‏הוא צריך להכיל לפחות:

- ‏Top-K.
- ‏Feature snapshot.
- ‏Rank gap/churn.
- ‏Vetoes.
- ‏Costs.
- ‏Market context.
- ‏Account eligibility.
- ‏Execution feasibility.
- ‏Version identity.

---

## ‏78. Pre-Submit Revalidation

‏בין החלטה לשליחה בודקים מחדש state קריטי.

---

## ‏79. Decision TTL

‏החלטה ישנה מדי אינה decision תקף.

---

## ‏80. `RemainingNetEdge` הוא Gate

‏Prediction בלי headroom כלכלי אינו מספיק.

---

# ‏חלק ט — Entry Doctrine

## ‏81. Entry הוא Execution Problem

‏לא רק Signal Problem.

---

## ‏82. Entry Tactic אינה אוניברסלית

‏Marketable Limit, Passive Limit, Pegged ועוד הן choices שדורשות evidence.

---

## ‏83. Fill Probability נמדדת

‏Touch אינו Fill.

---

## ‏84. Partial Fill הוא State ראשון במעלה

‏לא אירוע חריג נדיר.

---

## ‏85. Order Aging נמדד

‏Order ישן יכול להיות מחובר ל־signal שכבר דעך.

---

## ‏86. Chase Budget מוגבל

‏אין אינסוף cancel/replace כדי “להשיג” עסקה.

---

## ‏87. Cancel/Replace יכול לשנות Queue Priority

‏לכן אינו free operation.

---

## ‏88. Entry חייב לראות Exit Feasibility

‏אין משמעות לכניסה שקל לבצע אם היציאה צפויה להיות בעייתית.

---

# ‏חלק י — Exit Doctrine

## ‏89. Exit הוא חלק מה־Edge

‏לא cleanup אחרי העסקה.

---

## ‏90. Exit צריך להגיב ל־Edge Decay

‏לא רק ל־PnL threshold.

---

## ‏91. `TimeToFlat` הוא Metric מרכזי

‏הזמן מ־Exit Decision עד Flat חשוב כמו fill price.

---

## ‏92. Exit Giveback נמדד

‏כמה מה־MFE אבד עד Flat.

---

## ‏93. Exit תחת Degraded Data דורש Policy

‏Exposure פתוח מקבל טיפול שונה מ־Entry חדש.

---

## ‏94. Exit אינו מחכה ל־Scanner מלא

‏Priority שונה.

---

# ‏חלק יא — Cost Doctrine

## ‏95. Gross PnL אינו Decision Metric מספיק

‏צריך Cost Attribution.

---

## ‏96. Spread Cost נמדד לפי Arrival Context

‏לא לפי average spread כללי בלבד.

---

## ‏97. Slippage תלויה ב־Regime

‏אין להניח מספר קבוע לכל השוק.

---

## ‏98. Adverse Selection נמדדת ב־Markout

‏Fill מהיר יכול להיות fill רע.

---

## ‏99. Missed Opportunity הוא Cost מחקרי

‏Unfilled order אינו פשוט outcome = 0.

---

## ‏100. Capacity נמדדת לפי Size

‏Edge קטן יכול להיעלם כשמגדילים notional.

---

# ‏חלק יב — Latency Doctrine

## ‏101. Latency נמדדת End-to-End

```text
Market event
→ Feed receive
→ State update
→ Feature
→ Rank
→ Decision
→ Submit
→ Broker ack
→ Fill
→ Exit
→ Flat
```

---

## ‏102. `Latency Pressure`

```text
LatencyPressure = EndToEndLatency / SignalHalfLife
```

---

## ‏103. Tail Latency חשובה

‏`p95/p99` יכולים להיות משמעותיים יותר מה־mean.

---

## ‏104. Faster אינו תמיד Better

‏Latency optimization מוצדק רק אם הוא שומר יותר Edge.

---

## ‏105. Backpressure הוא Trading Problem

‏לא רק infrastructure metric.

---

## ‏106. Exit workload מקבל קדימות

‏במצב עומס, פעולות שמקטינות exposure עדיפות על scan עמוק של candidate חדש.

---

# ‏חלק יג — Risk Doctrine

## ‏107. Risk מתחיל לפני Order

‏Risk אינו Stop Loss בלבד.

---

## ‏108. Pending Exposure נספר

‏Orders working ו־partial fills הם risk state.

---

## ‏109. Duplicate Submission הוא Risk Event

‏Idempotency היא שכבת Risk.

---

## ‏110. Unknown Broker State הוא Risk State

‏לא state רגיל.

---

## ‏111. Risk Limits הם Hard Boundaries

‏Score לא עוקף אותם.

---

## ‏112. Position Count / Notional / Pending Exposure צריכים Limits

‏הערכים עצמם נקבעים במסגרת governance והרשאה, לא מתוך הקורס.

---

## ‏113. Kill Criteria נכתבים מראש

‏לא בזמן לחץ.

---

## ‏114. Symbol Quarantine שונה מ־Global Stop

‏לא כל failure דורש להשבית הכול.

---

## ‏115. Fail Closed ל־New Risk

‏כאשר state קריטי אינו אמין, חסימת Entry היא ברירת המחדל.

---

# ‏חלק יד — Account ו־Eligibility Doctrine

## ‏116. `Signal != Permission`

‏גם Strategy טובה חייבת לעבור account/broker eligibility.

---

## ‏117. `Buying Power != Settled Cash`

‏אלה states שונים.

---

## ‏118. Account Rules הם Versioned External Dependency

‏אין לקודד כלל רגולטורי משתנה כאילו הוא חוק טבע.

---

## ‏119. Short דורש Borrow Feasibility

‏Short candidate בלי borrow אינו executable candidate.

---

## ‏120. Eligibility נבדקת שוב סמוך ל־Submit

‏State יכול להשתנות.

---

# ‏חלק טו — Context Doctrine

## ‏121. Regime אינו Label בדיעבד

‏הוא חייב להיות Point-in-Time Observable.

---

## ‏122. Context יכול להיות Continuous

‏לא חייב buckets קשיחים.

---

## ‏123. Regime Confidence חשוב

‏`UNKNOWN` או transition state הם מצבים תקינים.

---

## ‏124. Context מוסיף ערך רק אם הוא משנה Decision Value

‏לא מספיק שהוא מסביר גרף יפה.

---

## ‏125. Event State נפרד מ־Normal State

‏News-like, halt/resume, corporate action או mechanical adjustment יכולים לשנות את פירוש ה־features.

---

# ‏חלק טז — Research Doctrine

## ‏126. כל שינוי מתחיל ב־Hypothesis

‏לא ב־parameter tweak אקראי.

---

## ‏127. Hypothesis חייב להיות Falsifiable

‏צריך לדעת מה יגרום לדחות אותו.

---

## ‏128. Holdout אינו Sandbox

‏אין לבדוק עליו שוב ושוב עד שמתקבלת תוצאה רצויה.

---

## ‏129. Multiple Testing נרשם

‏ריבוי ניסויים מגדיל false discoveries.

---

## ‏130. Negative Results נשמרים

‏כדי לא לחזור על אותו ניסוי שוב בעוד חודש.

---

## ‏131. Effect Size קודם ל־p-value

‏מובהקות זעירה בלי משמעות כלכלית אינה Edge.

---

## ‏132. OOS + Walk-Forward + Regime Slices

‏נדרשים כדי להבין robustness.

---

## ‏133. Null / Time-Shift / Ablation Tests

‏עוזרים לגלות alpha מזויף.

---

## ‏134. Backtest הוא Simulator

‏לא PnL calculator.

---

## ‏135. Touch אינו Fill

‏Execution realism הוא חובה.

---

## ‏136. Simulation Error נמדד

‏Paper/Live truth משמש לכיול simulator.

---

# ‏חלק יז — Learning Doctrine

## ‏137. Daily Review מייצר Evidence

‏לא auto-tuning.

---

## ‏138. Scanner Diagnostics מחפש First Broken Boundary

‏לא רק alert count.

---

## ‏139. RCA מתחיל ב־First Divergence

‏איפה בפעם הראשונה reality ו־expectation נפרדו.

---

## ‏140. Learning Queue מוגבלת

‏לא חוקרים מאה דברים במקביל.

---

## ‏141. Champion/Challenger היא ברירת מחדל לשינוי משמעותי

‏Production נשאר baseline עד ש־Challenger מוכיח ערך.

---

## ‏142. Promotion אינו Reward על PnL יפה

‏הוא evidence decision.

---

## ‏143. Demotion היא פעולה תקינה

‏גרסה יכולה לחזור ל־Shadow כאשר evidence נחלש.

---

## ‏144. Retirement הוא Improvement

‏הסרת complexity מיותר היא שיפור אמיתי.

---

# ‏חלק יח — Operational Doctrine

## ‏145. `DEV`, ‏`PAPER`, ‏`SHADOW`, ‏`LIVE` מופרדים בבירור

‏אין ambiguity סביב environment.

---

## ‏146. Live Credentials אינם Shared Config רגיל

‏Secrets מנוהלים בנפרד.

---

## ‏147. Single Writer / Fencing

‏אסור לשתי instances לחשוב שהן ה־active executor בו־זמנית.

---

## ‏148. Restart הוא Workflow מתוכנן

‏לא “להפעיל מחדש ולקוות”.

---

## ‏149. Reconnect אינו Reset

‏Broker state ממשיך להתקיים גם אם process איבד connection.

---

## ‏150. Runbook קיים לפני Incident

‏לא כותבים אותו לראשונה בזמן failure.

---

## ‏151. Manual Intervention מתועד

‏מי עשה, מה עשה, מתי ולמה.

---

## ‏152. Incident Packet נשמר

‏עם timelines, generations, orders, positions, data health, versions ו־alerts.

---

# ‏חלק יט — Observability Doctrine

## ‏153. PnL אינו Health Metric יחיד

‏מערכת יכולה להרוויח בזמן שהיא שבורה.

---

## ‏154. Process Metrics חשובים

‏למשל:

- ‏Fresh coverage.
- ‏Decision latency.
- ‏Rank churn.
- ‏Veto rates.
- ‏Broker round-trip.
- ‏Fill latency.
- ‏TimeToFlat.

---

## ‏155. Edge Health חשוב

```text
PredictedEdge
RealizedEdge
CaptureRatio
NetEdgeRetained
CostRatio
Markout
```

---

## ‏156. Alerts צריכים Trading Impact

‏לא כל warning הוא P0.

---

## ‏157. Alert Fatigue הוא Failure Mode

‏יותר alerts אינם בהכרח יותר safety.

---

# ‏חלק כ — Personal Baseline: מה נחשב כרגע ל־Judgment/Hypothesis

> ‏הסעיפים הבאים הם **`Judgment` או `Hypothesis` לצורכי המחקר והארכיטקטורה**, לא Recommendation סופית. פרויקט ה־Recommendation Playbook הנפרד יכריע מאוחר יותר בין חלופות על בסיס כל ה־Evidence של הקורס.

## ‏158. `Judgment`: ‏`NO TRADE` עדיף על Forced Participation

‏כאשר אין candidate שעובר את כל ה־gates, נשארים בחוץ.

---

## ‏159. `Judgment`: Fast Whole-Market + Deep Top-N

‏ארכיטקטורה דו־שלבית היא baseline סביר למחקר:

```text
Fast broad scan
→ small Top-N
→ deeper validation
```

---

## ‏160. `Judgment`: Pre-Submit Revalidation חובה

‏ב־horizon קצר state יכול להשתנות בין rank ל־submit.

---

## ‏161. `Judgment`: Hard Data/Execution Vetoes לפני Behavioral Vetoes

‏Validity ו־safety constraints מקבלים קדימות.

---

## ‏162. `Judgment`: Behavioral Veto חדש מתחיל ב־Shadow

‏לפני חסימה אמיתית מודדים false-veto cost.

---

## ‏163. `Judgment`: Full Decision Snapshots

‏היכולת להסביר החלטה חשובה יותר מחיסכון קטן באחסון.

---

## ‏164. `Judgment`: Position/Exit path מקבל Priority

‏כאשר יש exposure, הוא קודם לחישוב candidate חדש.

---

## ‏165. `Judgment`: One Position Initially יכול לפשט Calibration

‏זהו baseline מחקרי אפשרי, לא חוק קבוע ולא קביעה לגבי כסף אמיתי.

‏היתרון: attribution פשוט יותר של fills, exits, failures ו־account state.

---

## ‏166. `Hypothesis`: Short-Horizon Momentum

‏הטענה המחקרית המרכזית נשארת:

```text
Certain cross-sectional short-horizon momentum states
may retain enough edge after latency, fills and costs
to justify selective execution.
```

‏היא אינה עובדה עד שה־Evidence תומך בה.

---

## ‏167. `Hypothesis`: Trade Activity יכול לעזור להבדיל Move חי מ־stale print

‏דורש validation.

---

## ‏168. `Hypothesis`: Rank Persistence / Rank Gap יכולים לשפר Candidate Quality

‏דורש ablation ו־OOS evidence.

---

## ‏169. `Hypothesis`: Negative Evidence Memory יכול למנוע re-entry רע

‏דורש מדידת false veto ו־opportunity cost.

---

## ‏170. `Hypothesis`: Classic Indicators הם Challengers, לא Baseline Required Features

‏הם צריכים להוכיח incremental value מול features ישירים יותר.

---

# ‏חלק כא — Daily Operating Questions

## ‏171. לפני Session

‏המערכת שואלת:

```text
Is data healthy?
Is broker/account state reconciled?
Is the correct strategy version loaded?
Are clocks healthy?
Are risk controls armed?
Are current rules/permissions known?
```

---

## ‏172. לפני Candidate Evaluation

```text
Is universe coverage sufficient?
Is this candidate fresh?
Are required features ready?
Is context known enough?
```

---

## ‏173. לפני Entry

```text
Is it eligible?
Any hard veto?
Is expected net edge positive enough?
Is entry executable?
Is exit feasible?
Is account state known?
Is decision still fresh?
```

---

## ‏174. אחרי Fill

```text
Do local and broker states agree?
What was arrival price?
What was fill quality?
Is exit monitoring active?
```

---

## ‏175. לפני Exit

‏השאלה אינה “האם אני רוצה למכור”.

‏השאלה היא:

```text
Has the original edge decayed?
Has risk changed?
Has market state changed?
What is the fastest safe path to flat if needed?
```

---

## ‏176. אחרי Flat

```text
What happened?
What was expected?
Where was first divergence?
What was net edge retained?
What should be logged for research?
```

---

# ‏חלק כב — Failure Playbook

## ‏177. Data Provider Disconnect

```text
Block new risk
Preserve position monitoring if alternate truth exists
Mark data generation invalid
Reconnect
Rebuild canonical state
Revalidate
Resume only when healthy
```

---

## ‏178. Broker Disconnect

```text
Assume external state may continue changing
Do not retry unknown orders blindly
Reconnect
Fetch broker truth
Reconcile orders/positions
Resolve UNKNOWN_EFFECT
Resume cautiously
```

---

## ‏179. Partial Fill + Disconnect

‏Pending exposure נחשב כאמיתי עד שה־Broker מוכיח אחרת.

---

## ‏180. Duplicate/Out-of-Order Events

‏Idempotency + sequencing + generations מונעים state corruption.

---

## ‏181. Stale Market Data

‏חוסמים Entry חדש לפי policy; לא מניחים last-known state כ־fresh.

---

## ‏182. Second Executor Starts

‏Fencing צריך למנוע שני writers פעילים.

---

## ‏183. Unknown Position

‏אין Entry נוסף עד reconciliation.

---

## ‏184. Logging Failure

‏אם telemetry קריטי נעלם, היכולת להמשיך תלויה בסיווג; ב־critical audit path ברירת המחדל שמרנית.

---

## ‏185. Clock Health Failure

‏כאשר timestamps לא אמינים, freshness ו־latency metrics אינם אמינים; Entry חדש צריך להיחסם לפי severity.

---

# ‏חלק כג — Change Playbook

## ‏186. כל Change משמעותי מקבל ID

```text
ChangeId
HypothesisId
ChampionVersion
ChallengerVersion
PrimaryMetric
Guardrails
PromotionCriteria
KillCriteria
```

---

## ‏187. שינוי אחד משמעותי בכל ניסוי כאשר אפשר

‏כדי לשמר attribution.

---

## ‏188. שינוי Data Provider הוא Strategy-Relevant Change

‏גם אם “הקוד העסקי” לא השתנה.

---

## ‏189. שינוי Execution Broker/Adapter הוא Strategy-Relevant Change

‏כי fills, latency ו־constraints משתנים.

---

## ‏190. שינוי Feature Set הוא Strategy Change

‏גם אם Score formula נשארה זהה.

---

## ‏191. שינוי Veto Policy הוא Strategy Change

‏כי הוא משנה candidate funnel.

---

## ‏192. שינוי Risk Policy הוא Behavior Change

‏לכן הוא versioned ונבדק.

---

## ‏193. Major Change יכול לפוג Evidence ישן

‏Readiness אינה certification נצחית.

---

# ‏חלק כד — Practitioner Secrets

## ‏194. Playbook טוב מקטין החלטות בזמן לחץ

‏המטרה היא להחליט מראש מה עושים כאשר הכול רגוע.

---

## ‏195. חריגה מה־Playbook היא Event

‏לא “רק הפעם”.

‏אם צריך לחרוג, מתעדים:

```text
Who
When
Why
What risk was accepted
What must be reviewed later
```

---

## ‏196. כלל שלא ניתן למדידה קשה לאכיפה

‏“Trade only when it looks strong” אינו Playbook rule מקצועי.

---

## ‏197. כלל שלא ניתן להסביר קשה לעשות לו RCA

‏Decision logic צריך להשאיר ReasonCodes ו־snapshots.

---

## ‏198. יותר Rules אינם בהכרח יותר Safety

‏Rule explosion יכול ליצור contradictions, hidden interactions ו־false confidence.

---

## ‏199. Playbook צריך להכיל גם `Do Not Do`

‏מערכות נכשלות לעיתים בגלל דברים שלא נאסרו במפורש.

---

## ‏200. מה לא עושים

- ‏לא עוקפים Hard Veto בגלל FOMO או Rank גבוה.
- ‏לא משנים production parameter אחרי יום רע בודד.
- ‏לא מכפילים exposure כדי “להחזיר הפסד”.
- ‏לא שולחים order חדש כש־broker effect לא ידוע.
- ‏לא מניחים stale data כ־current truth.
- ‏לא קוראים ל־paper fill הוכחה ל־live fill.
- ‏לא משתמשים ב־backtest result בלי execution realism.
- ‏לא מקדמים Challenger לפי PnL יחיד.
- ‏לא מוחקים negative results.
- ‏לא מבטלים observability כדי לחסוך מעט latency בלי evidence.
- ‏לא מערבבים Fact, Judgment ו־Hypothesis.
- ‏לא מבצעים שימוש בכסף אמיתי ללא זכאות והרשאה מתאימות.

---

# ‏חלק כה — `Playbook Snapshot`

## ‏201. ה־Playbook בקיצור

```text
Observe broadly
→ Validate freshness
→ Compute point-in-time features
→ Rank comparatively
→ Require absolute quality
→ Apply negative evidence
→ Verify execution feasibility
→ Verify account eligibility
→ Estimate remaining net edge
→ TRADE or NO TRADE
→ Revalidate before submit
→ Reconcile broker truth
→ Monitor edge decay and risk
→ Exit deliberately
→ Review outcome
→ Learn through controlled research
```

---

## ‏202. Core Economic Chain

```text
Prediction
→ Ranking
→ Entry Feasibility
→ Fill Probability
→ Adverse Selection
→ Exit Feasibility
→ Costs
→ Net Outcome
```

---

## ‏203. Core Safety Chain

```text
Known State
→ Valid Data
→ Eligible Account
→ Bounded Risk
→ Idempotent Execution
→ Reconciliation
→ Exit Capability
→ Auditability
```

---

## ‏204. Core Learning Chain

```text
Observation
→ Hypothesis
→ Experiment
→ OOS Validation
→ Replay
→ Shadow
→ Challenger
→ Promotion or Rejection
→ Monitoring
→ Reassessment
```

---

# ‏חלק כו — `Definition of Playbook Compliance`

## ‏205. מערכת תואמת Playbook כאשר

```text
Every trade can be explained
Every rejection has a reason
Every order has an intent
Every fill can be reconciled
Every version can be reproduced
Every critical unknown blocks new risk
Every change has evidence
Every failure has a safe path
```

---

## ‏206. מערכת אינה תואמת כאשר

```text
PnL is green but state is unknown
orders cannot be explained
versions cannot be reproduced
critical telemetry is missing
manual overrides are invisible
stale inputs are treated as fresh
safety rules can be bypassed silently
```

---

# ‏חלק כז — Checklist שימושי לתחזוקת ה־Playbook

## ‏207. Review Trigger: Strategy Change

‏בדוק האם ה־Playbook עדיין מתאר את ההתנהגות בפועל.

---

## ‏208. Review Trigger: Provider/Broker Change

‏בדוק latency, semantics, permissions ו־failure modes מחדש.

---

## ‏209. Review Trigger: Major Incident

‏בדוק אם חסר invariant, runbook או observability requirement.

---

## ‏210. Review Trigger: Regime Drift

‏אל תשנה Playbook אוטומטית; פתח research item.

---

## ‏211. Review Trigger: Feature Retirement

‏הסר גם references דוקטרינריים ל־Feature שכבר אינו קיים.

---

## ‏212. Review Trigger: New Discovered Topic

‏אם במהלך הקורס או המחקר נמצא נושא מהותי חדש, רושמים אותו במפורש ולא נותנים לו “להיעלם בין הסעיפים”.

---

# ‏חלק כח — מה עדיין לא נקבע כאן

## ‏213. Exact Entry Tactic

‏לא נקבעת כאן כ־Recommendation סופית.

---

## ‏214. Exact Exit Thresholds

‏דורשים Evidence נפרד.

---

## ‏215. Exact Position Size

‏אינו נקבע כאן.

---

## ‏216. Exact Provider Choice

‏יישאר ל־Recommendation Playbook.

---

## ‏217. Exact Broker Routing Choice

‏גם הוא יוכרע לפי evidence, capabilities ו־current facts.

---

## ‏218. Exact Feature Set

‏יישאר subject ל־Champion/Challenger ולמחקר מתמשך.

---

## ‏219. Exact ML Role

‏ML נשאר optional challenger עד שיוכיח incremental value.

---

## ‏220. Exact Regime Logic

‏Context ייכנס רק היכן שהוא מוכיח Decision Value מחוץ למדגם.

---

# ‏סיכום

‏ה־`Personal Trading Playbook` הוא השכבה שמחברת Research, Data, Scanner, Ranking, Negative Evidence, Execution, Exit, Risk, Account State, Operations, Observability ו־Learning לדוקטרינה אחת.

‏המטרה שלו אינה להבטיח שהמערכת “תדע מה יקרה”.

‏המטרה היא להבטיח שהיא יודעת:

```text
What it currently believes
Why it believes it
What it is allowed to do
What it refuses to do
What must be measured
What invalidates the belief
How to fail safely
How to learn without overfitting
```

‏זה ההבדל בין אוסף רכיבים שעובדים לבין מערכת מחקרית־תפעולית שיש לה משמעת מקצועית.