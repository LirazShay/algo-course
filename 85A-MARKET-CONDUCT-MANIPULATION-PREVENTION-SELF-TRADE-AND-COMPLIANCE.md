# ‏שלב 85A — `Market Conduct, Manipulation Prevention, Self-Trade Controls and Automated-Trading Compliance`

> ‏מטרת הפרק: להשלים את החור האחרון שנמצא ב־`Final Course Gap Review` — לא כיצד “לנצל” Market Conduct, אלא כיצד לבנות רובוט שמונע התנהגות בעייתית, מזהה conflicts לפני שליחת Order, שומר Evidence מלא, ויכול להיכנס ל־`COMPLIANCE_BLOCK` כאשר הכוונה, ה־state או האינטראקציה בין פקודות אינם מספיק ברורים.
>
> ‏העיקרון המרכזי: **מערכת Trading מקצועית אינה אחראית רק לכך שה־Order חוקי טכנית וניתן לביצוע; היא חייבת גם למנוע patterns שבהם ההתנהגות שלה עלולה ליצור false market signal, self-interaction, non-bona-fide activity או פעילות שאינה ניתנת להסבר ולהצדקה בדיעבד.**
>
> ‏הפרק עוסק ב־prevention, governance, detection ו־auditability בלבד. הוא אינו מדריך לביצוע מניפולציה ואינו מספק “מתכונים”, thresholds או טכניקות שמטרתן לעקוף surveillance. כל כלל רגולטורי/בורסאי/ברוקר ספציפי חייב להיבדק מול מקור רשמי ועדכני לפני שימוש מעשי.

---

## ‏1. למה Market Conduct הוא שכבה עצמאית

‏אפשר לבנות מערכת שהיא:

```text
Fast
Reliable
Profitable in backtest
Technically correct
```

‏ועדיין חסרה בה שכבה קריטית:

```text
Is the behavior itself legitimate,
explainable,
and controlled?
```

‏Execution Engine טוב אינו מספיק אם כמה Strategies של אותו בעל חשבון עלולות לשלוח פקודות סותרות ולהיפגש זו עם זו.

---

## ‏2. ארבעת ממדי ה־Conduct

1. ‏`Intent Legitimacy` — האם הפקודה נועדה באמת להתבצע אם השוק יגיע אליה.
2. ‏`Interaction Legitimacy` — האם היא עלולה לפגוש Order קשור שלנו.
3. ‏`Market-Signal Integrity` — האם ההתנהגות עלולה ליצור תמונת ביקוש/היצע מטעה.
4. ‏`Auditability` — האם ניתן להסביר לאחר מעשה למה Order נוצר, השתנה ובוטל.

---

## ‏3. `Bona Fide Order Intent`

‏לכל Order צריך להיות Intent כלכלי אמיתי.

‏כלומר, בזמן יצירתו צריך להתקיים:

```text
If this order becomes executable,
we are genuinely willing for it to execute
subject to the explicit order policy.
```

‏זו נקודת מוצא חשובה יותר מכל heuristic של cancel rate.

---

## ‏4. Order שמבוטל מהר אינו אוטומטית בעייתי

‏Short-Horizon system יכול לבטל Order מסיבות לגיטימיות:

- ‏Signal expired.
- ‏Rank changed.
- ‏Spread widened.
- ‏Data became stale.
- ‏Risk state changed.
- ‏Position changed.
- ‏Order became economically unattractive.

‏לכן `Fast Cancel != Manipulation`.

---

## ‏5. אבל Intent שאינו אמיתי הוא Red Flag

‏מערכת לא צריכה לייצר Orders שכל מטרתם להיראות בספר מבלי כוונה אמיתית לביצוע.

‏ה־control שלנו צריך להתבסס על:

- ‏documented intent.
- ‏economic reason.
- ‏decision snapshot.
- ‏cancel reason.
- ‏timing.
- ‏interaction עם orders אחרים.

---

## ‏6. `Spoofing` / `Layering` — רמת הבנה בטוחה

‏ברמה העקרונית בלבד, רשויות אכיפה מתארות conduct מסוג זה כיצירת Orders לא־אמיתיים שמטרתם ליצור false appearance של interest ולהשפיע על אחרים.

‏מבחינתנו המסקנה אינה “איך pattern כזה עובד”, אלא:

```text
Never create an order whose purpose is
market appearance rather than bona-fide execution.
```

---

## ‏7. `Wash Trading`

‏ברמה מקצועית, Wash Trading מתייחס לפעילות שאינה משקפת שינוי כלכלי אמיתי ומייצרת מראית עין של פעילות או volume.

‏במערכת שלנו:

```text
Self-interaction risk
→ pre-trade control
→ block / cancel one side
→ log reason
```

---

## ‏8. `Self-Trade` אינו תמיד אותו דבר כמו Manipulation

‏צריך להפריד:

- ‏accidental self-match.
- ‏interaction בין strategies בלתי תלויות.
- ‏bug שיוצר שתי פקודות סותרות.
- ‏recovery race.
- ‏intentional non-economic activity.

‏המערכת לא מסיקה intent פלילי; היא מונעת conflict ודורשת review כשיש pattern חשוד.

---

## ‏9. למה Self-Trade Prevention חשוב במיוחד באוטומציה

‏במערכת ידנית, trader אחד רואה לעיתים את כל ההוראות שלו.

‏במערכת אוטומטית יכולים לפעול במקביל:

- ‏Scanner Strategy.
- ‏Exit Manager.
- ‏Recovery Worker.
- ‏Manual Order.
- ‏Challenger.
- ‏Second process instance.

‏בלי coordination הם עלולים ליצור interaction לא רצוי.

---

## ‏10. `Global Order Ownership`

‏כל Order צריך לשאת לפחות:

```text
OrderIntentId
StrategyInstanceId
StrategyVersion
AccountId
Symbol
Side
Purpose
PositionId
DecisionId
CreatedAt
```

‏המטרה היא לדעת מי יצר אותו ולמה.

---

## ‏11. `Purpose` הוא שדה חשוב

‏דוגמאות:

```text
ENTRY
EXIT
REDUCE_RISK
RECOVERY
MANUAL
TEST_SHADOW_ONLY
```

‏אסור ש־Order חי יהיה ללא Purpose ברור.

---

## ‏12. Entry מול Exit conflict

‏אם Entry BUY חדש מופיע בזמן ש־Exit SELL של אותה Strategy עדיין Working:

```text
Conflict detected
→ do not submit blindly
→ reconcile state
```

‏אותו עיקרון בכיוון ההפוך.

---

## ‏13. Replace מול New Order

‏Replace אינו תמיד “עוד Order”.

‏אבל אם Broker semantics יוצרים cancel/new sequence, המערכת חייבת לדעת מה עדיין חי ומה כבר בוטל לפני שליחת Intent נוסף.

---

## ‏14. Retry הוא Conduct Risk אם effect אינו ידוע

‏זה מתחבר ל־`UNKNOWN_EFFECT`:

```text
Timeout
!=
Order did not reach broker
```

‏Retry עיוור עלול ליצור duplicate exposure וגם self-interaction.

---

## ‏15. כלל בסיסי

```text
Unknown effect
→ reconcile first
→ retry only after state is known
```

---

## ‏16. `Compliance Pre-Trade Gate`

‏לפני Submit נוסיף שכבה עצמאית:

```text
Decision
→ Risk Gate
→ Execution Feasibility
→ Compliance Gate
→ OrderIntent
→ Broker
```

---

## ‏17. Compliance Gate אינו Score

‏חלק מהכללים הם Hard Veto.

‏לדוגמה:

- ‏known opposing related order conflict.
- ‏duplicate live intent.
- ‏unknown ownership of working order.
- ‏ambiguous broker state.
- ‏forbidden environment mismatch.

---

## ‏18. `ComplianceDecision`

```text
ALLOW
BLOCK
REVIEW_REQUIRED
EXIT_ONLY
```

‏לא נשתמש רק ב־Boolean.

---

## ‏19. `ReasonCode`

‏דוגמאות:

```text
RELATED_OPPOSING_ORDER_EXISTS
DUPLICATE_INTENT
UNKNOWN_BROKER_STATE
SELF_MATCH_RISK
MANUAL_ORDER_CONFLICT
RECOVERY_IN_PROGRESS
ENVIRONMENT_MISMATCH
COMPLIANCE_REFERENCE_STALE
```

---

## ‏20. Manual Order Conflict

‏אם אדם שולח Order ידני בזמן שהרובוט פעיל:

‏המערכת חייבת לדעת לפחות שיש External/Manual activity.

‏ברירת מחדל בטוחה:

```text
Manual activity detected
→ pause new automated exposure
→ reconcile
```

---

## ‏21. Second Instance Problem

‏שתי instances של אותה Strategy עלולות כל אחת לחשוב שהיא בעלת הסמכות לשלוח Order.

‏זו גם בעיית Risk וגם Conduct.

---

## ‏22. `Single Writer`

‏לחשבון/Strategy active צריך להיות writer authoritatively elected אחד כאשר הארכיטקטורה שלנו דורשת זאת.

---

## ‏23. `Fencing Token`

‏אם יש failover בין instances, צריך generation/token שמונע מ־instance ישנה להמשיך לשלוח Orders לאחר שאיבדה בעלות.

---

## ‏24. `Order Conflict Matrix`

‏נגדיר מראש interaction בין מטרות:

| Existing | New | Default |
|---|---|---|
| `ENTRY BUY` | `ENTRY BUY` | dedupe/review |
| `ENTRY BUY` | `EXIT SELL` | reconcile position/order state |
| `EXIT SELL` | `ENTRY BUY` | block new risk |
| `RECOVERY` | `ENTRY` | block |
| `MANUAL` | `AUTO ENTRY` | review/reconcile |

---

## ‏25. Compliance אינו מונע יציאה מסיכון

‏אם יש Position, `ComplianceMode` לא אמור בהכרח לחסום פעולות שמקטינות Exposure.

‏הפרדה:

```text
Block new risk
Preserve ability to reduce existing risk
```

---

## ‏26. `COMPLIANCE_BLOCK`

‏State אפשרי:

```text
SCANNING
CANDIDATE
COMPLIANCE_BLOCK
ENTERING
POSITION
EXITING
RECOVERY
```

---

## ‏27. `EXIT_ONLY`

‏במצב conduct uncertainty:

```text
New Entry = blocked
Risk reduction = permitted under explicit exit policy
```

---

## ‏28. Self-Trade Prevention ברמת Venue/Broker

‏חלק מה־venues וה־brokers מספקים מנגנוני `Self-Match Prevention`.

‏זה control שימושי, אבל הוא שכבת הגנה נוספת — לא תחליף ל־internal coordination.

---

## ‏29. דוגמה עדכנית — Nasdaq

‏נכון ל־26 באוקטובר 2026, Nasdaq פרסמה והפעילה `Order-by-Order Self Match Prevention` עבור Nasdaq, Nasdaq Texas ו־PSX, עם יכולת לקבוע behavior ברמת Order בנוסף להגדרות ברמת participant/organization.

‏היכולת המדויקת תלויה בפרוטוקול, venue, broker ו־account setup ולכן חייבת להיבדק מול documentation עדכני בזמן deployment.

---

## ‏30. למה STP של Venue אינו מספיק

‏כי conflict יכול להתרחש:

- ‏ב־venues שונים.
- ‏דרך routing שונה.
- ‏בחשבונות קשורים.
- ‏לפני שה־venue בכלל רואה את שתי הפקודות.

---

## ‏31. Internal Prevention First

```text
Internal conflict check
→ Broker/venue STP
→ Post-trade surveillance
```

‏Defense in depth.

---

## ‏32. `SelfMatchRiskKey`

‏אפשר לזהות conflict לפי combination כגון:

```text
Account
BeneficialOwnerScope
Symbol
Side
StrategyGroup
WorkingOrderState
```

‏ה־exact scope צריך להיות configurable ולא hard-coded.

---

## ‏33. Cross-Account Awareness

‏אם אותו authorized owner מפעיל כמה accounts, compliance requirements יכולים להיות רחבים יותר מחשבון יחיד.

‏אין להניח שה־AccountId לבדו מגדיר independence.

---

## ‏34. Cross-Strategy Awareness

‏שתי Strategies שונות לא בהכרח בלתי תלויות.

‏אם הן חולקות:

- ‏same owner.
- ‏same decision source.
- ‏same economic objective.
- ‏same orchestration.

‏צריך governance מפורש.

---

## ‏35. Strategy Independence הוא Fact שצריך להוכיח

‏לא label נוח.

---

## ‏36. `RelatedStrategyGroup`

‏אפשר לשייך Strategies לקבוצת control אחת לצורך conflict prevention.

---

## ‏37. `IntentCollision`

‏כאשר שתי Intentions קשורות מנסות לפעול באותו Symbol ובכיוונים שעלולים ליצור self-interaction:

```text
Collision
→ block
→ reconcile
→ choose authoritative objective
```

---

## ‏38. Position Manager הוא סמכות גבוהה מ־Entry Scanner בזמן Exposure

‏כאשר יש Position פתוח, אסור ל־Scanner “להילחם” ב־Exit Manager.

---

## ‏39. Recovery Manager הוא סמכות גבוהה מ־New Entry

‏בזמן Recovery:

```text
No new exposure
until broker truth is reconciled
```

---

## ‏40. Cancel Storm

‏מספר ביטולים גדול יכול להיות bug, market reaction לגיטימי או conduct concern.

‏ה־system צריך למדוד, לא להניח.

---

## ‏41. Cancel Metrics

‏נרצה לפחות:

```text
cancel_count
cancel_rate
cancel_reason_distribution
order_age_at_cancel
replace_rate
cancel_to_fill_ratio
```

---

## ‏42. אין Threshold אוניברסלי

‏לא נקבע:

```text
cancel rate > X = manipulation
```

‏Threshold תלוי product, venue, strategy, market state ו־supervisory context.

---

## ‏43. `CancelReason` חייב להיות קנוני

‏דוגמאות:

```text
SIGNAL_DECAY
RANK_LOSS
PRICE_MOVED
SPREAD_SHOCK
RISK_BLOCK
DATA_STALE
EXIT_STARTED
RECOVERY
MANUAL_OVERRIDE
UNKNOWN
```

---

## ‏44. `UNKNOWN` הוא Red Flag תפעולי

‏CancelReason `UNKNOWN` אחד אינו אומר conduct issue.

‏אבל שיעור גבוה שלו אומר שאיננו יכולים להסביר את המערכת.

---

## ‏45. Order Aging

‏Order שנותר Working הרבה מעבר ל־Intent TTL יכול להפוך מ־legitimate intent ל־stale behavior.

---

## ‏46. `IntentTTL`

‏לכל Order Intent צריך להיות horizon ברור.

‏אם ה־Signal מת:

```text
Cancel because intent expired
```

‏לא משאירים Book footprint ללא הצדקה.

---

## ‏47. Replace Loop

‏לולאת replace מהירה מדי יכולה להעיד על policy גרועה, timing mismatch או bug.

‏נרצה guardrails:

```text
max_replace_rate
max_active_intents
minimum_reason_quality
```

‏הערכים עצמם evidence-driven.

---

## ‏48. `Order Churn Budget`

‏לא רק latency/cost budget.

‏נמדוד כמה order lifecycle events strategy מייצרת ביחס לערך הכלכלי.

---

## ‏49. Low Economic Purpose

‏אם שינוי Order אינו משפר:

- ‏execution probability.
- ‏price protection.
- ‏risk reduction.
- ‏freshness alignment.

‏צריך לשאול למה הוא קורה בכלל.

---

## ‏50. `EconomicPurpose` field

‏לשינוי מהותי אפשר לשמור reason כלכלי:

```text
IMPROVE_FILL_PROBABILITY
REDUCE_ADVERSE_SELECTION
PROTECT_PRICE
EXIT_RISK
SIGNAL_INVALIDATED
```

---

## ‏51. Volume אינו יעד בפני עצמו

‏אסור לבנות מערכת שמטרתה “לייצר activity” רק כדי להראות Volume או liquidity.

---

## ‏52. Maker Rebate אינו מצדיק self-interaction

‏Rebate הוא component של execution economics — לא מטרה שמכשירה non-economic activity.

---

## ‏53. `Market Conduct != Profitability`

‏Trade רווחי יכול עדיין להיות בעייתי מבחינת conduct.

‏Trade מפסיד יכול להיות לגיטימי לחלוטין.

---

## ‏54. `Compliance != Risk`

‏Risk שואל:

```text
Can this hurt our account?
```

‏Compliance שואל גם:

```text
Is this behavior legitimate and appropriately controlled?
```

---

## ‏55. `Compliance != Execution Quality`

‏Fill טוב אינו evidence שה־conduct תקין.

---

## ‏56. `Compliance != Broker Acceptance`

‏Broker שקיבל Order אינו אומר שה־Order עבר את כל האחריות שלנו.

---

## ‏57. `Broker Rejected` גם אינו verdict משפטי

‏Reject יכול להיות technical/account/price/session reason.

---

## ‏58. Post-Trade Surveillance

‏אחרי המסחר נרצה לחפש patterns ולא רק individual trades.

---

## ‏59. `SelfTradeCount`

‏מדד בסיסי:

```text
count of executions
where related orders interact
```

‏בהתאם ליכולת הזיהוי שלנו.

---

## ‏60. `SelfTradeNotional`

‏נמדוד גם magnitude, לא רק count.

---

## ‏61. `OpposingOrderOverlapTime`

‏כמה זמן Orders קשורים מנוגדים היו simultaneously live.

---

## ‏62. `PreventedSelfMatchCount`

‏חשוב למדוד גם Successes של control.

---

## ‏63. `ComplianceBlockRate`

‏כמה decisions נחסמו על ידי Compliance Gate.

---

## ‏64. False Positive Cost

‏אם control חוסם יותר מדי פעילות לגיטימית, הוא דורש calibration.

---

## ‏65. False Negative Risk

‏אם כמעט אין Blocks למרות conflicts ידועים, control כנראה חלש מדי.

---

## ‏66. Compliance Calibration אינו PnL Optimization

‏לא “מרככים” control רק כי PnL ירד.

---

## ‏67. `First Compliance Divergence`

‏ב־RCA נשאל:

```text
At what first point did behavior deviate
from approved conduct policy?
```

---

## ‏68. Intent → Order → Execution lineage

‏צריך להיות trace מלא:

```text
DecisionId
→ ComplianceDecisionId
→ OrderIntentId
→ BrokerOrderId
→ ExecutionId
```

---

## ‏69. Immutable Audit Trail

‏Compliance event לא נמחק בשקט.

‏Correction נעשית כ־new record.

---

## ‏70. Clock Integrity

‏ל־surveillance צריך סדר אירועים אמין.

‏Clock mismatch יכול לגרום לנו לחשוב ש־cancel קדם ל־fill או להפך.

---

## ‏71. Multi-Clock Storage

‏נשמור לפי הצורך:

```text
Exchange/Event time
Provider receive time
Local receive time
Decision time
Submit time
Broker callback time
```

---

## ‏72. `AsObserved` מול `AsCorrected`

‏Compliance RCA צריך לדעת מה המערכת ראתה בזמן אמת וגם מה התברר לאחר correction.

---

## ‏73. Data Quality יכולה ליצור false conduct alert

‏Duplicate events, late prints או reconnect replay יכולים להיראות כמו activity כפולה.

---

## ‏74. Deduplication לפני Surveillance

‏לא נרצה alert בגלל אותו event שקיבלנו פעמיים.

---

## ‏75. Broker correction

‏Execution corrected/busted חייב לעדכן את ה־surveillance ledger בלי למחוק original history.

---

## ‏76. Auction Context

‏Opening/Closing Auction דורשות context שונה מ־continuous market.

---

## ‏77. `Marking Open/Close` — רמת מניעה

‏נכיר את הקטגוריה כ־conduct risk: פעילות שמטרתה להשפיע באופן מלאכותי על benchmark/open/close אינה policy תקינה.

‏המערכת לא תנסה “לנצל” את הרעיון; היא תתעד event context ותדרוש intent כלכלי אמיתי.

---

## ‏78. Auction Intent

‏אם Strategy משתתפת ב־Auction:

```text
auction-specific economic reason
+ order type
+ timestamp
+ expected exposure effect
```

‏נשמרים ב־Intent.

---

## ‏79. `Momentum Ignition` — רמת prevention בלבד

‏נכיר את הקטגוריה כמצב שבו conduct נועד לעורר movement מלאכותי כדי למשוך משתתפים אחרים.

‏ה־control שלנו הוא עקרוני:

```text
Do not submit activity whose objective is
creating artificial market reaction.
```

---

## ‏80. Strategy שמגיבה ל־Momentum אינה Momentum Ignition

‏עצם זה שהרובוט מגיב לתנועה קיימת אינו אומר שהוא יצר אותה.

‏נפריד בין detection לבין market-impact intent.

---

## ‏81. Impact Awareness

‏אם size שלנו משמעותי יחסית לנזילות, צריך למדוד impact כדי לדעת האם אנחנו observers או כבר participants שמשנים state.

---

## ‏82. `ParticipationRate`

‏יכול להיות surveillance/context metric.

‏לא threshold משפטי אוניברסלי.

---

## ‏83. Thin Market Risk

‏במניה דקה גם Order קטן יחסית יכול להשפיע יותר.

‏לכן Conduct controls צריכים להיות context-aware.

---

## ‏84. Cross-Venue Behavior

‏Strategy יכולה לשלוח Orders לכמה Venues דרך Smart Router.

‏Surveillance צריכה לחשוב ברמת economic intent, לא רק Venue בודד.

---

## ‏85. Cross-Instrument Behavior

‏אם בעתיד Strategy תפעל במכשירים קשורים, correlation בין פעולות יכול להיות רלוונטי ל־conduct review.

‏ב־v1 האישי שלנו זה `Know Exists`.

---

## ‏86. `StrategyGroupId`

‏מזהה שמאפשר post-trade aggregation של כמה processes/strategies הקשורים לאותו objective.

---

## ‏87. Test/Paper/Live Isolation

‏Order מ־Paper לעולם לא אמור להגיע לחשבון Live.

---

## ‏88. Environment Identity

‏כל OrderIntent כולל:

```text
Environment = REPLAY | SHADOW | PAPER | LIVE
```

---

## ‏89. Fail Closed on Environment Ambiguity

‏אם Environment לא חד־משמעי:

```text
No new live order
```

---

## ‏90. Replay אינו שולח Orders אמיתיים

‏Adapter contract צריך לאכוף זאת, לא רק UI label.

---

## ‏91. Shadow אינו שולח Orders

‏Shadow יכול לייצר `WouldHaveOrdered`, אבל לא `BrokerSubmit`.

---

## ‏92. Paper Credentials נפרדים

‏הפרדת credentials מצמצמת blast radius.

---

## ‏93. Manual Emergency Action

‏Manual action בזמן incident חייבת להיות logged עם:

```text
actor
reason
time
affected orders/positions
```

---

## ‏94. Manual Cancel יכול לשנות Strategy state

‏אין להתייחס אליו כמשהו חיצוני שלא משפיע על State Machine.

---

## ‏95. Manual Entry בזמן Auto

‏ברירת מחדל למחקר שלנו: conflict שמחייב pause/reconcile.

---

## ‏96. `HumanOverrideGeneration`

‏אפשר לייצר generation שמבטל decisions ישנים לאחר manual intervention.

---

## ‏97. Compliance Reference Versioning

‏נשמור:

```text
PolicyVersion
BrokerRuleReferenceVersion
VenueCapabilityVersion
VerifiedAt
```

---

## ‏98. Current Rules are External State

‏רגולציה, broker behavior ו־venue capabilities יכולים להשתנות.

‏לא נקודד אותם כ־eternal constants.

---

## ‏99. Official Source First

‏לפרטים מחייבים נעדיף:

- ‏regulator.
- ‏exchange/venue.
- ‏broker official documentation.

‏לא blog משני.

---

## ‏100. `VerifiedAt`

‏כל fact תפעולי שמשתנה בזמן חייב timestamp של אימות.

---

## ‏101. Stale Compliance Reference

‏אם כלל קריטי לא אומת זמן רב או שה־provider הודיע על שינוי:

```text
REVIEW_REQUIRED
```

---

## ‏102. Change Management

‏שינוי ב־routing/order type/STP/account structure יכול לשנות conduct controls גם אם Strategy signal לא השתנה.

---

## ‏103. Release Gate

‏לפני Production release נבדוק:

```text
Any new order path?
Any new account?
Any new venue?
Any new retry behavior?
Any changed ownership semantics?
```

---

## ‏104. Compliance Regression Tests

‏שינוי performance optimization לא יכול לעקוף את ה־Compliance Gate.

---

## ‏105. Unit Test — Duplicate Intent

‏שני Intent IDs זהים אינם יוצרים שני Orders.

---

## ‏106. Unit Test — Opposing Related Order

‏Order חדש נחסם כאשר policy מזהה conflicting related Working Order.

---

## ‏107. Integration Test — Timeout

‏Broker timeout אינו מוביל ל־blind retry.

---

## ‏108. Integration Test — Partial Fill

‏לא נוצר Entry מנוגד בזמן Position/remaining working quantity אינם ידועים.

---

## ‏109. Integration Test — Manual Order

‏Manual live activity גורמת ל־pause/reconcile לפי policy.

---

## ‏110. Fault Test — Duplicate Instance

‏instance שנייה אינה מקבלת writer authority בלי fencing.

---

## ‏111. Fault Test — Stale Callback

‏callback מ־BrokerGeneration ישן אינו מחזיר Order ישן לחיים.

---

## ‏112. Fault Test — Reconnect Replay

‏replayed broker events אינם מייצרים duplicate conduct alerts או duplicate Orders.

---

## ‏113. Golden Scenario — Entry then Exit

‏Entry Working → fill → Position → Exit צריך להיות linear, explainable וללא overlap לא מאושר.

---

## ‏114. Golden Scenario — Cancel/Fill Race

‏Fill שמגיע בזמן Cancel מטופל קודם כ־exposure truth, לא כ־“cancel succeeded”.

---

## ‏115. Golden Scenario — Self-Match Prevention

‏שני Orders קשורים מנוגדים מזוהים לפני submission או מטופלים באמצעות defense-in-depth control.

---

## ‏116. Golden Scenario — Compliance Block

‏Block מייצר:

```text
Decision
ReasonCode
Evidence
Affected intents
Next safe action
```

---

## ‏117. `Compliance Incident Packet`

‏נשמור לפחות:

```text
IncidentId
StrategyVersion
ConfigFingerprint
Account
Symbol
OrderIntents
BrokerOrders
Executions
MarketSnapshot
ComplianceDecisions
ReasonCodes
Timeline
HumanActions
Resolution
```

---

## ‏118. Severity

‏נבדיל למשל:

```text
P0 = unknown live conduct/exposure state
P1 = prevented serious conflict / suspected policy breach
P2 = anomalous but contained behavior
P3 = diagnostic quality issue
```

‏ההגדרה המדויקת שייכת ל־operations policy.

---

## ‏119. Unknown Live State הוא P0 candidate

‏אם לא יודעים אילו Orders שלנו חיים ואיך הם קשורים, new risk נעצר.

---

## ‏120. Missing Audit Trail הוא Failure

‏אם Order חי ללא trace back ל־Intent, זו אינה “חוסר telemetry קטן”.

---

## ‏121. `Compliance SLO`

‏דוגמאות למדדי איכות:

```text
100% live orders have intent lineage
100% compliance blocks have reason code
0 blind retries after unknown effect
0 unauthorized environment crossings
```

---

## ‏122. Alert Fatigue

‏אם כל cancel יוצר alert, שום alert אינו שימושי.

---

## ‏123. Alert on Pattern + Impact

‏נעדיף severity לפי:

- ‏economic exposure.
- ‏repeat pattern.
- ‏unknown state.
- ‏control failure.
- ‏cross-strategy conflict.

---

## ‏124. Surveillance Window

‏Pattern detection יכול להשתמש בכמה horizons, אבל windows צריכים להיות evidence-driven ולא “מספר קסם”.

---

## ‏125. Episode-Based Review

‏נרכז activity סביב Incident/Position/Decision Episode במקום לספור events מנותקים.

---

## ‏126. `RelatedOrderEpisode`

‏אשכול Orders שנובעים מאותו economic objective.

---

## ‏127. Why This Order Exists

‏לכל Order חי המערכת צריכה לענות תוך שניות:

```text
Who created it?
Why?
What decision supports it?
What exposure does it change?
What cancels it?
```

---

## ‏128. If We Cannot Answer — Freeze New Risk

‏כלל תפעולי חשוב.

---

## ‏129. Intent Drift

‏Order התחיל לגיטימי, אבל state השתנה וה־economic purpose נעלם.

‏זה בדיוק למה קיימים TTL ו־revalidation.

---

## ‏130. Pre-Submit Revalidation

‏Compliance recheck קורה קרוב ל־Submit ככל שנדרש:

```text
still no related conflict?
still correct environment?
still correct account?
still correct owner?
```

---

## ‏131. Post-Submit Monitoring

‏לא מספיק שה־Order עבר Gate פעם אחת.

‏State חדש יכול ליצור conflict לאחר מכן.

---

## ‏132. Continuous Working-Order Reconciliation

‏Broker working orders משווים ל־local intents.

---

## ‏133. Orphan Order

‏Broker Order ללא local authoritative owner.

‏פעולה ראשונה: containment/reconciliation — לא “להניח שהוא בסדר”.

---

## ‏134. Ghost Local Order

‏Local state חושב ש־Order Working אבל broker לא מכיר אותו.

‏גם כאן אין Retry לפני בירור.

---

## ‏135. Orphan Position

‏Position לא צפויה היא קודם כול Exposure Incident.

‏Conduct review מגיע כחלק מה־RCA.

---

## ‏136. `Beneficial Ownership` הוא Reference-sensitive

‏הגדרה משפטית והחלה ספציפית אינן משהו שהרובוט ממציא בעצמו.

‏המערכת משתמשת ב־configured ownership/compliance scope שאושר מראש.

---

## ‏137. Account Alias אינו Ownership Model

‏שני account numbers שונים יכולים עדיין להיות קשורים מבחינת governance.

---

## ‏138. Broker STP Setting הוא Versioned Configuration

‏אם קיימת יכולת venue/broker STP, נשמור מה הוגדר בפועל ובאיזו גרסה.

---

## ‏139. STP Failure Telemetry

‏אם venue/broker מדווח Self-Match Prevention event, נרצה לדעת:

```text
which intents collided
why internal gate did not prevent it
```

---

## ‏140. STP Event אינו “הצלחה שקטה”

‏הוא defense-in-depth success אבל גם signal לבדוק internal coordination.

---

## ‏141. Strategy Backtest לא מוכיח Conduct Safety

‏Backtest יכול להתעלם לחלוטין מ־Order interactions.

---

## ‏142. Replay צריך לכלול Order Lifecycle

‏כדי לבדוק conflicts צריך Replay של:

- ‏Intent.
- ‏Submit.
- ‏Ack.
- ‏Working.
- ‏Fill.
- ‏Cancel.
- ‏Replace.

---

## ‏143. Shadow Mode מצוין לבדיקת Conduct Logic

‏אפשר לייצר Intended Orders בלי לשלוח אותם ולבדוק conflict engine.

---

## ‏144. Paper אינו הוכחת Venue STP

‏Paper broker יכול לדמות באופן שונה מה־venue האמיתי.

---

## ‏145. Live Capability Verification

‏לפני הסתמכות על STP/venue behavior צריך official documentation + controlled authorized testing כאשר מותר ומתאים.

---

## ‏146. `ComplianceMode`

‏States אפשריים:

```text
NORMAL
REVIEW_REQUIRED
ENTRY_BLOCKED
EXIT_ONLY
FULL_STOP
```

---

## ‏147. `FULL_STOP` אינו בהכרח Flatten

‏Flatten הוא action מסוכן בפני עצמו.

‏Policy חייבת להגדיר בנפרד:

```text
stop new decisions
cancel working entry orders
manage existing exposure
```

---

## ‏148. Compliance Kill Switch

‏נפרד מ־PnL kill switch.

---

## ‏149. Conduct Drift

‏גם בלי code change behavior יכול להשתנות בגלל:

- ‏market regime.
- ‏latency.
- ‏provider batching.
- ‏broker routing.
- ‏load.

---

## ‏150. Monitor Behavior Distribution

‏נמדוד rolling distributions של:

```text
order age
cancel rate
replace rate
opposing overlap
STP events
compliance blocks
unknown reasons
```

---

## ‏151. Version-to-Version Comparison

‏Challenger לא נבחן רק על PnL.

‏נשווה גם conduct metrics.

---

## ‏152. Promotion Guardrail

‏Challenger עם PnL טוב יותר אבל conduct behavior גרוע משמעותית אינו candidate promotion טוב.

---

## ‏153. Feature שינוי יכול לשנות Order Churn

‏Feature “רגיש” יותר יכול לגרום ל־rank churn ול־cancel/replace explosion.

---

## ‏154. Scanner Diagnostics מתחבר ל־Compliance

‏Rank churn גבוה יכול להיות root cause ל־order churn.

---

## ‏155. Fix Root Cause, Not Threshold

‏אם cancel rate עולה בגלל unstable rank, לא בהכרח נכון רק “להעלות את limit”.

---

## ‏156. `Decision Stability`

‏Metric חשוב גם ל־conduct engineering.

---

## ‏157. Cooldown יכול לצמצם Thrashing

‏אבל צריך לבדוק missed opportunity ו־edge decay.

---

## ‏158. Debounce יכול להיות Control

‏אם decision flips בגלל micro-noise, controlled debounce/hysteresis יכול להפחית churn.

‏לא מוסיפים אותו בלי validation.

---

## ‏159. Conduct Control אינו תירוץ להאט Exit

‏Exit path צריך להישאר מסוגל להקטין risk במהירות.

---

## ‏160. Entry ו־Exit צריכים policies שונות

‏Entry fail-closed יותר.

‏Exit חייב להיות risk-aware.

---

## ‏161. `SelfTradePrevention` ב־Exit

‏אם Exit עלולה לפגוש Working Entry ישנה:

```text
cancel/reconcile stale entry
before creating conflicting state
```

---

## ‏162. Parent/Child Orders

‏Bracket/OCO/OCA relationships צריכים להיות ידועים ל־conflict engine כדי לא לסמן intended linked orders בטעות.

---

## ‏163. Native Broker Algo

‏כאשר broker algo מנהל child orders, internal surveillance רואה לעיתים רק חלק מהפרטים.

‏צריך לתעד את boundary הזה.

---

## ‏164. Observability Gap = Confidence Reduction

‏אם child-order behavior אינו גלוי, אסור להעמיד פנים שיש לנו full conduct visibility.

---

## ‏165. Smart Router Opacity

‏גם Smart Routing יכול להסתיר venue-level path.

‏נשמור מה ידוע ומה אינו ידוע.

---

## ‏166. Provider-Agnostic, Compliance-Aware

‏`ExecutionBroker` abstraction צריך לחשוף capability metadata:

```text
supportsSelfMatchPrevention
supportsOrderGroupId
supportsNativeOCO
supportsCancelReplace
supportsVenueDetails
```

---

## ‏167. Capability Unknown

‏`Unknown != False`.

‏אבל capability critical לא ננחש.

---

## ‏168. `ComplianceCapabilitySnapshot`

‏נשמור snapshot בזמן deployment/release.

---

## ‏169. Current Nasdaq Example אינו Universal Rule

‏Nasdaq order-level SMP capability היא דוגמה ל־venue control, לא הנחה לגבי NYSE, Cboe, IBKR או broker אחר.

---

## ‏170. Broker Abstraction לא מוחק Regulatory Reality

‏Provider-agnostic architecture אינה אומרת שכל provider behaves אותו דבר.

---

## ‏171. Compliance Data Retention

‏צריך לשמור מספיק history ל־RCA ולדרישות governance החלות על הסביבה שלנו.

‏Retention period ספציפי הוא external rule ולכן Reference.

---

## ‏172. Privacy / Access Control

‏Audit data עשוי לכלול account identifiers ו־operational metadata.

‏גישה לפי least privilege.

---

## ‏173. Tamper Evidence

‏Audit logs קריטיים לא אמורים להיות ניתנים לעריכה שקטה על ידי Strategy process.

---

## ‏174. Separation of Duties

‏גם בפרויקט אישי כדאי להפריד רעיונית:

```text
Strategy decides
Execution sends
Compliance gates
Audit records
```

---

## ‏175. Configuration Review

‏Compliance config שינוי מהותי צריך להיכנס ל־Strategy/Release evidence.

---

## ‏176. No Hidden Overrides

‏אין `debug=true` שמנטרל compliance ב־Live בשקט.

---

## ‏177. Emergency Override

‏אם קיים override, הוא צריך להיות:

- ‏explicit.
- ‏authorized.
- ‏time-bounded.
- ‏logged.
- ‏limited to safe objective.

---

## ‏178. Compliance Incident RCA

‏RCA שואל:

```text
What happened?
What was intended?
What control should have prevented it?
Why did that control fail?
What similar paths exist?
How do we prove the fix?
```

---

## ‏179. Search Similar Failure Paths

‏אם bug נמצא ב־Entry retry, בודקים גם:

- ‏Exit retry.
- ‏Recovery retry.
- ‏Manual reconciliation.
- ‏Replace path.

---

## ‏180. `First Divergence` שוב קריטי

‏לא מתחילים מה־Fill הסופי.

‏מחפשים את האירוע הראשון שבו approved intent וה־actual behavior נפרדו.

---

## ‏181. Compliance Test Matrix

‏לפחות dimensions:

```text
single instance / duplicate instance
normal / reconnect
entry / exit
partial fill / no fill
manual intervention / none
provider healthy / stale
authoritative / unknown broker state
```

---

## ‏182. Property — No Unowned Live Order

```text
Every live order
must map to exactly one authoritative intent lineage.
```

---

## ‏183. Property — No New Risk Under Unknown Effect

```text
UNKNOWN_EFFECT
→ no additional exposure-increasing retry
```

---

## ‏184. Property — Related Opposing Intents Cannot Both Be Freely Active

‏אלא אם policy מפורשת ומאושרת מגדירה אחרת.

---

## ‏185. Property — Environment Cannot Escalate Silently

```text
PAPER intent
cannot become LIVE submit
```

---

## ‏186. Property — Compliance Block Is Explainable

‏כל Block כולל ReasonCode + evidence pointer.

---

## ‏187. Property — Safety Control Cannot Be Overridden by Score

‏Rank #1 גבוה אינו מנטרל conduct veto.

---

## ‏188. Property — Exit Capability Survives Entry Block

‏Entry blocked אינו משבית Position Manager.

---

## ‏189. Daily Review

‏נוסיף section:

```text
Conduct & Compliance Review
```

---

## ‏190. Daily Metrics

‏לפחות:

- ‏Compliance blocks.
- ‏STP events.
- ‏Unknown cancel reasons.
- ‏Orphan intents/orders.
- ‏Opposing overlap episodes.
- ‏Manual conflicts.
- ‏Blind retry attempts blocked.

---

## ‏191. Weekly Pattern Review

‏Daily sample קטן יכול להטעות.

‏נבחן rolling windows ו־regime context.

---

## ‏192. `Compliance Debt`

‏חוב מצטבר כאשר:

- ‏capabilities לא מתועדות.
- ‏ReasonCodes generic מדי.
- ‏manual flows מחוץ ל־audit.
- ‏references stale.
- ‏known control gaps נשארים פתוחים.

---

## ‏193. Compliance Debt הוא Release Risk

‏לא רק documentation debt.

---

## ‏194. Practitioner Secret — Bug יכול להיראות כמו Conduct

‏Duplicate process, stale retry או wrong account routing יכולים ליצור pattern חמור בלי intent פסול.

‏לכן prevention engineering חשוב גם ללא “trader bad intent”.

---

## ‏195. Practitioner Secret — Green PnL יכול להסתיר Control Failure

‏אם duplicate fills במקרה הרוויחו, זו עדיין תקלה.

---

## ‏196. Practitioner Secret — Venue STP שהציל אותנו הוא Warning

‏Defense-in-depth עבד, אבל צריך להבין למה internal gate לא עצר קודם.

---

## ‏197. Practitioner Secret — Missing Intent Is More Dangerous Than High Cancel Rate

‏High cancel rate יכול להיות לגיטימי.

‏Order בלי economic purpose מתועד הוא בעיית governance עמוקה יותר.

---

## ‏198. Practitioner Secret — Production Behavior הוא חלק מה־Strategy

‏Strategy אינה רק formula של Score.

‏Retry, replace, cancel, recovery ו־manual handling הם חלק מה־market behavior שלה.

---

## ‏199. Practitioner Secret — Compliance Must Observe the Whole System

‏בודק Order יחיד לא רואה:

- ‏second instance.
- ‏manual order.
- ‏related strategy.
- ‏recovery worker.

‏לכן צריך account-level view.

---

## ‏200. Practitioner Secret — “Technically Accepted” אינו “Approved Behavior”

‏Exchange/Broker acceptance הוא transport outcome.

‏ה־policy שלנו רחבה יותר.

---

## ‏201. Baseline עבור הרובוט שלנו — `Judgment`

‏לגרסה האישית הראשונית, baseline פשוט וסביר למחקר:

```text
One authoritative live writer
+ one active economic objective per symbol/account scope
+ explicit OrderIntent before submit
+ internal opposing-order conflict check
+ UNKNOWN_EFFECT reconciliation before retry
+ environment hard separation
+ full lineage and ReasonCodes
```

‏זה baseline הנדסי, לא המלצה משפטית סופית.

---

## ‏202. Baseline — `Shadow First`

‏Compliance Gate חדש נבדק קודם ב־Replay/Shadow עם logging מלא.

---

## ‏203. Baseline — Hard Controls First

‏בהתחלה נעדיף hard correctness controls:

- ‏duplicate intent.
- ‏unknown effect.
- ‏environment mismatch.
- ‏related opposing working order.
- ‏unknown ownership.

‏לפני heuristics התנהגותיים מורכבים.

---

## ‏204. Baseline — No Legal Threshold Guessing

‏לא נקודד “85% cancel = illegal” או threshold דומה מתוך דוגמה/מסמך חיצוני שאינו כלל מחייב למערכת שלנו.

---

## ‏205. Baseline — Official Facts Are Versioned

‏Venue/broker rule נכנס כ־Reference עם `VerifiedAt`.

---

## ‏206. Baseline — ReasonCode Before Machine Learning

‏Compliance אינו המקום להתחיל ב־black-box anomaly model.

‏קודם deterministic controls + explainable surveillance.

---

## ‏207. Advanced — Anomaly Detection

‏בהמשך אפשר Challenger שמזהה deviation ב־order behavior.

‏הוא אינו מחליט “illegal”; הוא מעלה `REVIEW_REQUIRED`.

---

## ‏208. Advanced — Sequence Analysis

‏אפשר לנתח sequences של submit/cancel/replace/fill כדי למצוא operational anomalies.

‏שוב: detection, לא exploitation.

---

## ‏209. Advanced — Cross-Strategy Graph

‏Graph של accounts/strategies/intents יכול לעזור לזהות conflicts מורכבים.

‏לא baseline למערכת אישית פשוטה.

---

## ‏210. Advanced — Independent Compliance Service

‏אם המערכת גדלה, Compliance Gate יכול להפוך לרכיב נפרד.

‏ב־Production v1 שלנו אפשר להישאר `Modular Monolith` עם module boundary חזק.

---

## ‏211. Interfaces מוצעים

```text
IComplianceGate
IOrderOwnershipRegistry
IRelatedIntentDetector
IComplianceReferenceStore
IComplianceAuditWriter
```

---

## ‏212. `ComplianceContext`

```text
DecisionId
AccountScope
Symbol
CandidateIntent
WorkingRelatedOrders
PositionState
BrokerState
Environment
StrategyVersion
PolicyVersion
```

---

## ‏213. `ComplianceResult`

```text
Decision
ReasonCodes[]
EvidenceRefs[]
PolicyVersion
EvaluatedAt
```

---

## ‏214. Keep Hot Path Small

‏Pre-trade Gate חייב להיות מהיר מספיק ל־signal half-life.

‏לכן:

```text
Fast deterministic hard checks
→ submit eligibility

Deep surveillance
→ async/post-trade review
```

---

## ‏215. Fast Checks אינם פחות חשובים

‏ב־Hot Path נרצה בעיקר state correctness, not complex analytics.

---

## ‏216. Deep Surveillance אינו יכול לעכב Exit קריטי

‏ה־Position safety path מקבל priority.

---

## ‏217. Compliance Latency Budget

‏נמדוד כמה זמן Gate מוסיף ל־EndToEndLatency.

---

## ‏218. `LatencyPressure` כולל Compliance

```text
EndToEndLatency
=
Data + Features + Rank + Risk + Compliance + Execution
```

---

## ‏219. Optimize Correctness Before Nanoseconds

‏אין טעם לחסוך 200µs אם זה מוחק ownership check קריטי.

---

## ‏220. Production Dashboard

‏נרצה tiles כגון:

```text
ComplianceMode
Live Orders Without Intent = 0
Unknown Effects = 0
STP Events
Opposing Overlap
Compliance Block Rate
Reference Freshness
```

---

## ‏221. Alert — Live Order Without Intent

‏P0 candidate.

---

## ‏222. Alert — Two Active Writers

‏P0 candidate.

---

## ‏223. Alert — Environment Crossing

‏P0 candidate.

---

## ‏224. Alert — STP Spike

‏P1/P2 לפי context.

---

## ‏225. Alert — Unknown Reason Spike

‏יכול להעיד על observability degradation.

---

## ‏226. Compliance Readiness Packet

```text
PolicyVersion
VerifiedReferences
AccountScopeModel
OrderOwnershipModel
ConflictMatrix
STPCapabilities
GoldenTests
FaultTests
OpenGaps
KnownUnknowns
ReleaseDecision
```

---

## ‏227. Promotion Gate

‏גרסה חדשה אינה Production-ready אם:

- ‏Order ownership לא חד־משמעי.
- ‏retry semantics לא idempotent.
- ‏manual conflicts לא מטופלים.
- ‏environment isolation לא מוכחת.
- ‏critical references stale.

---

## ‏228. `NO_GO` הוא תוצאה תקינה

‏אם conduct controls אינם בשלים, אין סיבה להכריח release.

---

## ‏229. קשר לשלב 60A

‏Compliance Hard Veto הוא sibling של Trading/Safety Vetoes.

‏לא דוחסים הכול ל־Score.

---

## ‏230. קשר לשלב 51

‏Execution Engine חייב לשמור Idempotency ו־Order Ownership.

---

## ‏231. קשר לשלב 62

‏Live Trading subtleties מספקים Broker Truth ו־reconciliation שעליהם Compliance נשען.

---

## ‏232. קשר לשלב 64

‏Live Readiness צריך לכלול conduct controls כחלק מ־P0 gates.

---

## ‏233. קשר לשלב 73

‏Daily Review מקבל Conduct section.

---

## ‏234. קשר לשלב 77

‏PolicyVersion ו־STP configuration הם חלק מה־Strategy composite identity.

---

## ‏235. קשר לשלב 78

‏Champion/Challenger comparison כולל conduct guardrails.

---

## ‏236. קשר לשלב 80

‏Compliance הוא cross-cutting control בין Decision Plane, Execution Plane ו־Control Plane.

---

## ‏237. קשר לשלב 82

‏Production v1 חייב לשרוד duplicate processes, reconnects ו־manual intervention בלי ליצור unowned orders.

---

## ‏238. קשר לשלב 85

‏Readiness אינה שלמה אם אין תשובה ל־“האם אנחנו שולטים בהתנהגות שהמערכת עצמה יוצרת בשוק?”.

---

## ‏239. Current Official Evidence Snapshot — 26 Oct 2026

‏העקרונות בפרק נתמכים על ידי מקורות רשמיים עדכניים, בין היתר:

- ‏SEC enforcement materials המתארים spoofing/layering כפעילות המבוססת על non-bona-fide orders שיוצרים false appearance of market interest.
- ‏FINRA supervisory guidance שמדגישה surveillance של manipulative patterns, self-trades, spoofing, layering, wash sales ו־momentum ignition והתאמת controls לסוג הפעילות.
- ‏Nasdaq `Equity Trader Alert 2026-45`, שבו Nasdaq הודיעה על `Order-by-Order Self Match Prevention` עבור Nasdaq/NTX/PSX, עם launch במהלך ספטמבר 2026.

‏ה־snapshot הזה אינו תחליף לבדיקה מחודשת לפני deployment.

---

## ‏240. Sources / References

- ‏SEC — `SEC Charges North Carolina Day Trader for Manipulative Trading` (2021): https://www.sec.gov/enforcement-litigation/administrative-proceedings/33-10989-s
- ‏SEC — `SEC Charges Firm and Owner With Manipulative Trading` (2015): https://www.sec.gov/newsroom/press-releases/2015-236
- ‏FINRA — Annual Regulatory Oversight Report, Manipulative Trading section: https://www.finra.org/sites/default/files/2024-01/2024-annual-regulatory-oversight-report.pdf
- ‏Nasdaq Trader — `Equity Trader Alert #2026-45`, Order-by-Order SMP: https://www.nasdaqtrader.com/TraderNews.aspx?id=ETA2026-45

---

## ‏241. `Definition of Done` ל־85A

‏הנושא נחשב מכוסה כאשר אנחנו יודעים:

1. ‏להסביר את ההבדל בין execution correctness לבין conduct correctness.
2. ‏להגדיר `Bona Fide Order Intent` בלי להסתמך על cancel-rate magic numbers.
3. ‏למנוע duplicate/related opposing intents לפני submit.
4. ‏לטפל ב־`UNKNOWN_EFFECT` בלי blind retry.
5. ‏להפריד Manual/Paper/Shadow/Live ולהגן מפני environment crossing.
6. ‏להשתמש ב־venue/broker STP כ־defense-in-depth, לא כתחליף ל־internal controls.
7. ‏לשמור Order ownership, ReasonCodes ו־audit lineage מלא.
8. ‏להפעיל `COMPLIANCE_BLOCK` / `EXIT_ONLY` בלי לפגוע ביכולת להקטין Exposure.
9. ‏למדוד conduct metrics ולבצע surveillance בלי להסיק intent משפטי מתוך metric בודד.
10. ‏לבדוק Golden/Fault scenarios שמוכיחים שהמערכת אינה מייצרת self-interaction או duplicate behavior בגלל תקלות.
11. ‏לנהל Regulatory/Broker/Venue facts כ־versioned references עם `VerifiedAt`.
12. ‏לבצע RCA מלא לכל conduct incident ולחפש failure paths דומים.

---

## ‏242. משפט הסגירה

> ‏**מערכת Algo מקצועית אינה רק מערכת שמקבלת החלטה טובה ושולחת אותה מהר. היא מערכת שיודעת להוכיח שלכל Order יש מטרה כלכלית אמיתית, בעלות ברורה, context תקין ושרשרת Evidence מלאה — ושכאשר היא אינה יודעת זאת, היא יודעת לעצור לפני שהיא מגדילה סיכון או יוצרת התנהגות שגויה בשוק.**
