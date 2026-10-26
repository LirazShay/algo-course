# ‏שלב 69 — `News, Events and Corporate Actions`: כשהמחיר זז בגלל מידע חדש, Event Risk או Adjustment מכני

> ‏מטרת הפרק: להבין כיצד חדשות, אירועים מתוזמנים ולא־מתוזמנים ו־Corporate Actions משנים את משמעות המחיר, ה־volume, ה־spread וה־liquidity. נלמד להבחין בין Momentum רגיל לבין Event-Driven Move, בין תנועה כלכלית לבין Adjustment מכני, ואיך למנוע מ־Scanner קצר־טווח לפרש Event Risk כאילו הוא Signal רגיל.
>
> ‏העיקרון המרכזי: **Price Move ו־Catalyst הם שני דברים שונים. לפני שמפרשים שינוי מחיר כ־Momentum, צריך להבין אם המהלך נובע ממידע חדש, מצב מסחר חריג, שינוי מכני במניה או Context שמחייב מודל אחר.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. ארבע משפחות של אירועים

‏נחלק את עולם האירועים לארבע משפחות:

```text
Scheduled Information Events
Unscheduled Information Events
Corporate Actions
Trading-State Events
```

‏החלוקה חשובה משום שכל משפחה משפיעה אחרת על:

- ‏Price discovery.
- ‏Spread.
- ‏Depth.
- ‏Trade rate.
- ‏Volatility.
- ‏Latency sensitivity.
- ‏Fill probability.
- ‏Adverse selection.
- ‏Exit feasibility.

---

# ‏2. `Scheduled Information Events`

‏אירועים שהשוק יודע מראש שהם אמורים להתרחש בזמן מסוים או בטווח זמן צפוי.

‏דוגמאות:

- ‏Earnings release.
- ‏Guidance update.
- ‏Investor presentation.
- ‏Shareholder meeting.
- ‏Index rebalance/reconstitution.
- ‏Macro release שמשפיע על השוק הרחב.

‏הנקודה המקצועית:

> ‏גם אם תוכן האירוע אינו ידוע מראש, **עצם הסיכון** ידוע מראש.

‏לכן אפשר לבנות `EventProximity` גם בלי לדעת את התוצאה.

---

# ‏3. `Unscheduled Information Events`

‏אירועים שלא ניתן לתזמן מראש במדויק:

- ‏Material company announcement.
- ‏Management update.
- ‏Unexpected financing announcement.
- ‏Regulatory/company disclosure.
- ‏Unexpected operational update.
- ‏M&A announcement.

‏מבחינת הרובוט:

```text
Normal State
→ Information Shock
→ Price Discovery
→ Stabilization or Secondary Move
```

‏אלה states שונים.

---

# ‏4. `Corporate Actions`

‏Corporate Action הוא שינוי במבנה הכלכלי או הטכני של נייר הערך.

‏דוגמאות:

- ‏Stock split.
- ‏Reverse split.
- ‏Cash dividend.
- ‏Stock dividend.
- ‏Special dividend.
- ‏Rights-related action.
- ‏Spin-off.
- ‏Merger/reorganization.
- ‏Ticker/symbol change.
- ‏Share-class change.
- ‏Delisting/relisting-related transition.

‏חלק מהאירועים משנים את המחיר בלי שנוצר “Momentum” כלכלי במובן שאנחנו מחפשים.

---

# ‏5. למה `Raw Price Change` יכול להיות שקרי

‏נניח:

```text
YesterdayClose = 100
TodayOpen = 50
```

‏בלי metadata זה נראה כמו:

```text
Return = -50%
```

‏אבל אם היה `2-for-1 split`, זו אינה ירידה כלכלית של 50%.

‏מכאן:

```text
RawPriceReturn != EconomicReturn
```

‏עד שלא יודעים אם נדרש adjustment.

---

# ‏6. Raw מול Adjusted Data

‏צריך להבדיל בין:

```text
Raw Market Price
Adjusted Historical Price
```

‏Raw חשוב ל־execution replay משום שזה המחיר שהיה באמת במסחר.

‏Adjusted חשוב בחלק מסוגי המחקר ההיסטורי כדי לשמור continuity כלכלי.

‏אסור לערבב ביניהם בלי contract ברור.

---

# ‏7. `Adjustment Factor`

‏כאשר יש Corporate Action ייתכן שנצטרך transformation היסטורי.

‏אבל חשוב לשמור:

```text
RawValue
AdjustedValue
AdjustmentVersion
EffectiveTime
Source
```

‏ולא לדרוס את ה־raw truth.

---

# ‏8. Corporate Action Leakage

‏טעות מסוכנת:

‏להשתמש ב־adjusted history שנבנה בדיעבד כאילו אותה התאמה הייתה ידועה במדויק בכל timestamp היסטורי.

‏צריך לשאול:

```text
What was known at decision time?
```

‏ולא רק:

```text
What is known now about that day?
```

---

# ‏9. Earnings הם Regime מיוחד

‏סביב Earnings לעיתים משתנים יחד:

- ‏Volatility.
- ‏Spread.
- ‏Depth.
- ‏Trade rate.
- ‏Gap behavior.
- ‏Adverse selection.
- ‏Fill quality.

‏לכן Earnings proximity יכול להיות Context בפני עצמו.

---

# ‏10. `Event Proximity`

‏Feature פשוט:

```text
TimeUntilKnownEvent
TimeSinceKnownEvent
```

‏לא חייבים מיד לפרש תוכן.

‏אפשר קודם לבדוק האם proximity לבדו משנה:

- ‏Prediction quality.
- ‏Execution quality.
- ‏Cost.
- ‏Failure rate.

---

# ‏11. Event Window

‏אירוע אינו רק timestamp אחד.

‏אפשר לחשוב על:

```text
PreEvent
ImmediateReaction
PriceDiscovery
Stabilization
PostEvent
```

‏הגבולות צריכים להיות אמפיריים, לא שרירותיים.

---

# ‏12. Event Clock מול Wall Clock

‏לעיתים עדיף להגדיר זמן יחסית לאירוע:

```text
T = -300s
T = -30s
T = 0
T = +5s
T = +60s
```

‏במקום רק שעה ביום.

---

# ‏13. `CatalystKnown` מול `CatalystUnknown`

‏אפשר לתייג decision state:

```text
KNOWN_CATALYST
UNKNOWN_CATALYST
NO_KNOWN_CATALYST
```

‏אבל חשוב לזכור:

‏`UNKNOWN_CATALYST` אינו אומר שאין Catalyst.

‏הוא אומר שאין לנו Evidence אמין כרגע.

---

# ‏14. `KNOWN / INFERRED / UNKNOWN`

‏זה pattern שימושי גם כאן:

```text
KNOWN     = source verified
INFERRED  = behavior strongly suggests event-like state
UNKNOWN   = insufficient evidence
```

‏אין להציג inference כעובדה.

---

# ‏15. News Latency

‏Event-driven system רגיש לשרשרת:

```text
Source Publication
→ Provider Ingestion
→ Distribution
→ Our Receive
→ Parse
→ Classify
→ Decision
```

‏לכן `NewsTimestamp` אחד אינו מספיק.

---

# ‏16. Publication Time מול Receive Time

‏כמו Market Data:

```text
EventPublishedAt
ProviderReceivedAt
OurReceivedAt
ProcessedAt
DecisionAt
```

‏הפער ביניהם הוא חלק מה־Edge feasibility.

---

# ‏17. Stale News

‏כותרת יכולה להיות חדשה לנו אבל ישנה לשוק.

‏לכן צריך:

```text
InformationAgeAtDecision
```

‏ולא רק ingestion timestamp.

---

# ‏18. Duplicate News

‏אותו אירוע יכול להגיע:

- ‏מכמה providers.
- ‏בכמה headlines.
- ‏כעדכון לכותרת קודמת.
- ‏כ־summary מאוחר.

‏בלי deduplication הרובוט עלול לפרש אירוע אחד ככמה shocks.

---

# ‏19. Event Identity

‏כדאי לייצר:

```text
EventId
EventType
PrimarySymbol
RelatedSymbols
PublishedAt
Source
Confidence
Revision
```

‏כדי לשמור causal lineage.

---

# ‏20. Revisions ו־Corrections

‏מידע יכול להשתנות לאחר הפרסום הראשוני.

‏יש לשמור:

```text
Revision 1
Revision 2
...
```

‏ולא למחוק את מה שהיה ידוע קודם.

---

# ‏21. Primary מול Secondary Reaction

‏לא כל Momentum אחרי אירוע הוא התגובה הראשונית.

‏יכולים להיות:

```text
Initial Jump
Pullback
Second Leg
Failed Continuation
Giveback
```

‏לרובוט שלנו חשוב במיוחד לזהות אם הוא מגיע מאוחר ל־first leg.

---

# ‏22. `EventAge`

‏Feature מרכזי:

```text
EventAge = DecisionTime - EventPublishedAt
```

‏אבל יש לבדוק גם:

```text
MarketReactionAge
```

‏מפני שהמחיר עשוי להגיב לפני שאנו מקבלים source מסוים.

---

# ‏23. News Chase Risk

‏אם:

```text
EventAge >> SignalHalfLife
```

‏ייתכן שה־edge כבר עבר.

‏ככל שהתגובה מהירה יותר, chase risk גדל.

---

# ‏24. Event-Driven Adverse Selection

‏בזמן information shock:

- ‏הצד שמולנו עשוי להיות מהיר יותר.
- ‏Quotes יכולים להתבטל.
- ‏Displayed depth יכולה להיעלם.
- ‏Fill שמגיע “בקלות” יכול להיות toxic.

‏לכן Event State צריך להזין execution logic.

---

# ‏25. Spread Shock

‏אחד מסימני האירוע:

```text
SpreadNow / NormalSpread
```

‏אם ratio קופץ, אפילו signal חזק עלול להפוך ל־non-executable.

---

# ‏26. Depth Withdrawal

‏Price move בזמן שה־book מתרוקן שונה מ־price move עם liquidity יציבה.

‏לכן Event Context יכול להיכנס ל־60A כ־Liquidity/Execution Veto.

---

# ‏27. Trade-Rate Shock

‏אפשר למדוד:

```text
TradesPerSecondNow / BaselineTradesPerSecond
```

‏כדי לזהות event-like burst גם לפני שיש classification מלא.

---

# ‏28. Volatility Shock

‏אירוע יכול להעלות realized volatility בבת אחת.

‏המשמעות:

- ‏Targets משתנים.
- ‏Stops/Exit behavior משתנים.
- ‏Cost distribution משתנה.
- ‏Latency becomes more expensive.

---

# ‏29. `Event-Like State` ללא News Feed

‏גם בלי source חדשות אפשר לזהות state חריג דרך market behavior:

```text
Volume Shock
Spread Shock
Volatility Shock
Gap
Trade-Rate Burst
Depth Withdrawal
Halt/Resume
```

‏אבל זה `INFERRED`, לא Catalyst ידוע.

---

# ‏30. Scheduled Event Veto

‏גישה שמרנית אפשרית למחקר:

```text
if TimeUntilKnownEvent < X:
    NO_NEW_ENTRY
```

‏אבל `X` אינו אמת כללית.

‏צריך לבדוק אם veto כזה משפר `net outcome` או פשוט מפספס הזדמנויות.

---

# ‏31. Event Penalty במקום Hard Veto

‏לעיתים עדיף:

```text
EventRiskPenalty
```

‏במקום פסילה מוחלטת.

‏כך אפשר להשוות אמפירית:

```text
No Event Logic
Hard Veto
Soft Penalty
Separate Event Model
```

---

# ‏32. Separate Event Model

‏אפשר להגיע למסקנה ש־Event State דורש model נפרד.

```text
NormalMomentumModel
EventMomentumModel
```

‏אבל זו complexity שצריכה Evidence.

---

# ‏33. Event Class Explosion

‏סכנה:

```text
EarningsUp
EarningsDown
Offering
Guidance
Merger
Split
...
```

‏עם מעט samples לכל bucket.

‏עדיף להתחיל מקבוצות רחבות ורק לפצל אם יש sample מספיק.

---

# ‏34. Earnings Surprise אינו רק Price Gap

‏Gap הוא outcome חלקי.

‏לא כדאי להסיק מה־gap בלבד מה היה “טוב” או “רע” באירוע.

‏המטרה שלנו אינה לבצע fundamental interpretation מלא אלא להבין execution/context.

---

# ‏35. Guidance ו־Forward-Looking Information

‏אירוע יכול לשנות את ציפיות השוק גם אם נתוני העבר נראים חזקים.

‏לכן reaction אינו תמיד ניתן להסבר ממספר אחד.

‏מבחינת scanner:

‏אנחנו מודדים outcome, לא מניחים story.

---

# ‏36. Offerings / Financing Events

‏הודעות על גיוס הון או שינוי במבנה ההון יכולות לשנות:

- ‏Price level.
- ‏Supply expectations.
- ‏Liquidity.
- ‏Volatility.

‏לכן הן Context חשוב למחקר, גם בלי rule מסחרי קשיח.

---

# ‏37. Buybacks

‏Buyback announcement אינו מבטיח immediate buying pressure.

‏צריך להבדיל בין:

```text
Announcement
Authorization
Actual Execution
```

‏אלו דברים שונים.

---

# ‏38. Dividends

‏Dividend יכול לייצר שינוי מכני סביב ex-date.

‏לכן returns סביב event כזה דורשים התאמה והבנה של price mechanics.

---

# ‏39. Special Dividends

‏Special dividend יכול לייצר discontinuity גדול יותר מהרגיל.

‏מערכת שמבוססת על raw gap בלבד עלולה לטעות קשות.

---

# ‏40. Stock Splits

‏Split משנה:

- ‏Price per share.
- ‏Share count.
- ‏לעיתים tick/spread behavior בפועל.
- ‏Historical comparability.

‏Feature שמבוסס על absolute price/size צריך להיות split-aware.

---

# ‏41. Reverse Splits

‏Reverse split יכול לשנות מאוד את price scale ואת liquidity profile.

‏אין להניח שה־post-event regime דומה ל־pre-event regime.

---

# ‏42. Symbol Changes

‏Ticker הוא identifier נוח, לא identity קבועה.

‏עדיף durable security identity פנימית.

```text
SecurityId != Symbol
```

---

# ‏43. Mergers / Reorganizations

‏אירועים כאלה יכולים לשבור continuity של:

- ‏Symbol.
- ‏Price history.
- ‏Share count.
- ‏Universe membership.
- ‏Economic meaning.

‏Backtest חייב להיות corporate-action aware.

---

# ‏44. Spin-Offs

‏Spin-off יכול לגרום לכך שה־economic value מתחלק בין שני securities.

‏raw price comparison לפני/אחרי אינו מספיק.

---

# ‏45. Delisting / Relisting States

‏Universe membership אינו רק:

```text
Symbol exists today
```

‏צריך point-in-time lifecycle.

---

# ‏46. Trading Halts כאירוע

‏Halt הוא גם `Trading-State Event`.

‏הוא צריך ליצור:

```text
New MarketGeneration
```

‏או מנגנון equivalent שמבטל assumptions ישנות.

---

# ‏47. Resume אינו Normal State

‏לאחר resume:

- ‏Spread עשוי להיות רחב.
- ‏Volatility גבוהה.
- ‏Queue state חדש.
- ‏Old signal stale.

‏לכן צריך warm-up/revalidation.

---

# ‏48. Auction Context

‏Opening/Closing auction יכולה להיות event state בפני עצמה.

‏אין להשוות auction prints אוטומטית ל־continuous trading prints.

---

# ‏49. Index Rebalance

‏Index-related flows יכולים ליצור volume ו־price pressure שאינם momentum “רגיל”.

‏לכן known rebalance context עשוי להיות useful tag במחקר.

---

# ‏50. Macro Context

‏Market-wide event יכול לגרום לאלפי מניות לזוז יחד.

‏אז stock momentum עשוי להיות:

```text
Idiosyncratic
or
Market Beta
```

‏כדאי למדוד residual move מול market/sector.

---

# ‏51. Event Breadth

‏אפשר למדוד:

```text
How many symbols move simultaneously?
```

‏אם breadth קיצוני, ייתכן שה־candidate אינו מיוחד.

---

# ‏52. Cross-Sectional Rank בזמן Event

‏Rank #1 בזמן market-wide shock יכול להיות winner מקרי מתוך distribution קיצוני.

‏לכן Rank צריך Context.

---

# ‏53. Event Correlation Shock

‏קורלציה בין symbols יכולה לקפוץ בזמן אירוע רחב.

‏זה משנה:

- ‏Diversification assumptions.
- ‏Ranking uniqueness.
- ‏Risk aggregation.

---

# ‏54. Event Risk ו־Position Sizing

‏Context יכול להשפיע על maximum allowed size במחקר/מערכת.

‏הסיבה אינה “פחד”, אלא uncertainty גבוהה יותר ב־execution/exit.

---

# ‏55. Event Risk ו־Exit

‏אם position כבר קיים, Event State לא תמיד אומר “חסום הכול”.

‏צריך להבדיל:

```text
Entry Permission
Exit Permission
Exit Urgency
```

‏בדומה לעקרונות של Safety Engine.

---

# ‏56. Event Risk ו־NO TRADE

‏`NO TRADE` הוא outcome תקין כאשר:

- ‏ה־catalyst לא ברור.
- ‏spread abnormal.
- ‏data conflicted.
- ‏execution uncertainty גבוהה.
- ‏signal הגיע מאוחר מדי.

---

# ‏57. Event Context בתוך 60A

‏Reason Codes אפשריים:

```text
EVENT_PROXIMITY_HIGH
EVENT_STATE_UNKNOWN
CORPORATE_ACTION_UNRESOLVED
POST_HALT_WARMUP
SPREAD_SHOCK
NEWS_AGE_TOO_HIGH
DATA_CONFLICT_EVENT
```

‏כל אחד צריך semantics ו־TTL ברורים.

---

# ‏58. `CorporateActionResolved`

‏לפני חישוב Features סביב אירוע מכני אפשר לדרוש:

```text
CorporateActionState = RESOLVED
```

‏ולא להשתמש במידע חלקי.

---

# ‏59. Unknown Event State

‏אם providers מתנגשים:

```text
UNKNOWN
```

‏עדיף מ־guess.

---

# ‏60. Point-in-Time Event Dataset

‏לכל event history רציני צריך:

```text
EventKnownAt
EffectiveAt
PublishedAt
RevisionAt
Source
```

‏כדי למנוע leakage.

---

# ‏61. Event Backtest

‏Backtest צריך לדעת איזה event metadata היה זמין באותו רגע.

‏אסור להשתמש ב־final normalized event record אם הוא כולל corrections עתידיים.

---

# ‏62. Event Replay

‏Replay טוב צריך לשחזר:

```text
Market events
+ Event metadata arrival
+ Revisions
+ Trading-state changes
```

‏באותו causal order.

---

# ‏63. News Feed ≠ Market Feed

‏אלה שני streams שונים עם clocks שונים.

‏צריך join סיבתי:

```text
AsOfDecisionTime
```

‏ולא join לפי timestamp שנוח בדיעבד.

---

# ‏64. Source Confidence

‏אפשר לשמור:

```text
SourceConfidence
```

‏אבל confidence עצמו צריך calibration.

‏אין להפוך vendor reputation ל־probability בלי Evidence.

---

# ‏65. Multi-Source Confirmation

‏כמה מקורות יכולים להעלות confidence, אבל גם להיות העתקים של אותו מקור ראשוני.

‏לכן:

```text
SourceCount != IndependentSourceCount
```

---

# ‏66. Provider Dependency

‏אם strategy תלויה ב־event data provider מסוים, זה חלק מה־strategy contract.

‏שינוי provider יכול לשנות:

- ‏Coverage.
- ‏Latency.
- ‏Taxonomy.
- ‏Deduplication.
- ‏Timestamp semantics.

---

# ‏67. Taxonomy Drift

‏Event categories יכולות להשתנות לאורך זמן.

‏יש versioning ל־parser/classifier.

---

# ‏68. NLP הוא לא baseline חובה

‏אפשר להשתמש ב־NLP לסיווג event content, אבל לרובוט שלנו עדיף להתחיל ב:

```text
Known Event Metadata
+ Market Reaction
+ Execution Context
```

‏ורק אחר כך לבדוק אם NLP מוסיף Decision Value.

---

# ‏69. Headline Sentiment Trap

‏Positive/Negative sentiment פשוט אינו בהכרח קשור ל־short-horizon return.

‏שוק מגיב ל־surprise relative to expectation, לא רק לטון של הטקסט.

---

# ‏70. Sentiment ≠ Surprise

‏אירוע יכול להישמע חיובי אך להיות פחות טוב מהציפיות.

‏לכן sentiment classifier לבדו אינו מספיק.

---

# ‏71. Event Surprise

‏מושג שימושי:

```text
Surprise = Actual Information - Market Expectation
```

‏אבל expectation קשה למדידה.

‏לכן לא נניח שיש לנו אותו אם אין source/model אמין.

---

# ‏72. Price Reaction as Information

‏במקום לנסות להבין כל טקסט, אפשר למדוד:

- ‏Gap.
- ‏Velocity.
- ‏Acceleration.
- ‏Volume shock.
- ‏Spread shock.
- ‏Depth response.
- ‏Continuation/giveback.

‏כלומר, לתת לשוק לספר חלק מהסיפור.

---

# ‏73. אבל Price Reaction לבדו אינו Catalyst

‏תנועה חריגה יכולה להגיע גם בלי event ידוע.

‏לכן נשמור distinction בין:

```text
EventKnown
EventInferred
NoEventEvidence
```

---

# ‏74. Event Classification Uncertainty

‏אם classifier נותן:

```text
Earnings 55%
Financing 35%
Other 10%
```

‏אין חובה להפוך זאת ל־hard label.

‏אפשר לשמור probability vector.

---

# ‏75. Event Half-Life

‏גם ל־event יש חיי מידע.

‏צריך למדוד:

```text
How quickly does incremental predictive value decay after publication?
```

---

# ‏76. Reaction Half-Life מול Signal Half-Life

‏אלה אינם תמיד אותו דבר.

‏אירוע יכול להיות חשוב שעות, אבל short-term continuation edge אולי חי רק שניות.

---

# ‏77. `TimeToFirstStableQuote`

‏לאחר shock אפשר למדוד מתי quotes חוזרים לרמת stability סבירה.

‏זה metric שימושי ל־execution readiness.

---

# ‏78. `TimeToNormalSpread`

‏אפשר למדוד כמה זמן spread נשאר abnormal אחרי event.

‏לא חייבים להגדיר “normal” גלובלית; אפשר relative baseline.

---

# ‏79. `TimeToLiquidityRecovery`

‏Depth/turnover יכולים להתאושש בקצב שונה מהמחיר.

‏זה חשוב ל־exit feasibility.

---

# ‏80. Event Continuation vs Giveback

‏למטרה שלנו חשוב למדוד:

```text
P(continue | event state)
P(giveback | event state)
time_to_first_profit
time_to_target
post_target_giveback
```

---

# ‏81. Event-Type Conditional Labels

‏אפשר לחלק labels לפי event state במחקר.

‏אבל רק אם sample מספיק ולא נוצר bucket overfitting.

---

# ‏82. Event Stratification

‏במקום model נפרד לכל event, אפשר להתחיל בדוח:

```text
Outcome by EventState
```

‏זה זול יותר ומונע premature complexity.

---

# ‏83. Event Ablation

‏השווה:

```text
Baseline
Baseline + EventProximity
Baseline + EventState
Baseline + EventVeto
```

‏כדי למדוד incremental value.

---

# ‏84. Decision Impact

‏Event feature שמנבא מעט אבל כמעט לא משנה החלטות אולי לא שווה complexity.

‏לכן נמדוד:

```text
DecisionImpactRate
```

---

# ‏85. False Veto Cost

‏אם Event Veto חוסם הרבה winners, הוא עלול להיות יקר יותר מהסיכון שהוא מונע.

‏צריך:

```text
AvoidedBadTrades
vs
MissedGoodTrades
```

---

# ‏86. Event Model Calibration

‏אם model אומר 80% risk, צריך לבדוק האם bucket של 80% באמת מתנהג בהתאם.

---

# ‏87. Event Drift

‏התנהגות סביב סוג אירוע יכולה להשתנות לאורך זמן.

‏לכן צריך rolling monitoring.

---

# ‏88. New Event Type

‏Taxonomy לא מוכר צריך להיות:

```text
UNKNOWN_EVENT_TYPE
```

‏ולא mapped בכוח לקטגוריה קיימת.

---

# ‏89. Corporate Action QA

‏בדיקות חשובות:

- ‏Split continuity.
- ‏Dividend adjustment consistency.
- ‏Symbol mapping.
- ‏Effective-date correctness.
- ‏No duplicate action.
- ‏Versioned source.

---

# ‏90. Price Scale Features

‏Corporate actions יכולים לשבור Features שתלויים ב־absolute scale.

‏דוגמאות:

- ‏absolute spread.
- ‏price thresholds.
- ‏share quantity thresholds.

‏יש להעדיף normalization מתאים כשאפשר.

---

# ‏91. Volume Scale Features

‏Split יכול לשנות share count/volume scale.

‏לכן raw volume comparison לאורך event boundary דורש זהירות.

---

# ‏92. Dollar Volume

‏לעיתים `DollarVolume` יציב יותר מ־share volume להשוואה, אבל גם הוא אינו פותר כל corporate-action issue.

---

# ‏93. Float / Shares Outstanding Context

‏שינויים מבניים יכולים להשפיע על interpretation של volume/activity.

‏אם משתמשים בנתונים כאלה, הם חייבים point-in-time.

---

# ‏94. Event-aware Universe

‏Symbol יכול להיות זמנית:

```text
ELIGIBLE
EVENT_RESTRICTED
TRADING_HALTED
CORPORATE_ACTION_PENDING
UNKNOWN
```

‏ולא רק IN/OUT.

---

# ‏95. Event State Machine

‏אפשר להחזיק:

```text
NORMAL
PRE_EVENT
EVENT_DETECTED
PRICE_DISCOVERY
STABILIZING
NORMALIZED
UNKNOWN
```

‏אבל לא חייבים להתחיל בכל המצבים.

---

# ‏96. State Transition Evidence

‏Transition צריך להתבסס על observable conditions.

‏לא על hindsight.

---

# ‏97. Event Generation

‏כאשר event משמעותי מתקבל, אפשר להגדיל:

```text
EventGeneration
```

‏כדי למנוע שימוש ב־decisions ישנות שנבנו לפניו.

---

# ‏98. Revalidate Candidate אחרי Event

‏אם Candidate היה Rank #1 ואז event חדש הגיע:

```text
OldDecision invalid
→ recompute/revalidate
```

---

# ‏99. Event + Rank Interaction

‏Candidate יכול להישאר Rank #1 אבל להפוך ל־NO TRADE עקב Event Risk.

‏זה בדיוק למה Ranking ו־Decision אינם אותו דבר.

---

# ‏100. Event + Execution Interaction

‏Event Context צריך להזין:

- ‏Order aggressiveness.
- ‏Price protection.
- ‏TTL.
- ‏Max size.
- ‏Exit urgency.

‏רק אם המחקר מראה שזה מועיל.

---

# ‏101. Event + Latency Interaction

‏כאשר `SignalHalfLife` מתקצר בזמן shock, אותה latency נהיית יקרה יותר.

```text
LatencyPressure = Latency / SignalHalfLife
```

---

# ‏102. Event + Capacity Interaction

‏ב־fast market capacity יכולה לרדת גם כשה־volume עולה, משום שה־depth האפקטיבי נעלם מהר.

---

# ‏103. Event + Adverse Selection

‏Fill rate גבוה בזמן event יכול להיות warning.

‏נבדוק markout אחרי fill.

---

# ‏104. Event + Exit Capacity

‏Entry capacity ו־Exit capacity יכולים להתנהג אחרת בזמן shock.

‏ה־exit הוא הקריטי יותר מבחינת safety.

---

# ‏105. Event-specific Cost Model

‏Cost model יכול להיות conditionally dependent on:

```text
EventState
SpreadState
VolatilityState
LiquidityState
```

---

# ‏106. Event-specific Fill Model

‏אסור להניח fill probability רגילה בזמן event burst.

---

# ‏107. Event-specific Backtest Stress

‏אפשר לבדוק:

```text
+ extra latency
+ wider spread
+ lower fill probability
+ higher adverse selection
```

‏ב־event windows.

---

# ‏108. Event Replay Scenarios

‏Golden scenarios:

- ‏Scheduled event begins.
- ‏Unexpected event arrives while candidate is Rank #1.
- ‏Event arrives during pending order.
- ‏Event arrives during partial fill.
- ‏Halt after entry.
- ‏Corporate action boundary.
- ‏Conflicting provider metadata.

---

# ‏109. Pending Order + New Event

‏כאשר event מגיע אחרי submit ולפני fill:

‏צריך policy מפורשת.

‏אין להניח שה־original intent עדיין תקף.

---

# ‏110. Position + New Event

‏אם position קיים:

‏המערכת צריכה להעריך מחדש:

```text
RemainingEdge
ExitFeasibility
RiskState
```

---

# ‏111. Event Risk Budget

‏אפשר למדוד exposure נפרד ל־event-like states.

‏המטרה היא observability וריסון, לא כלל אוניברסלי.

---

# ‏112. Scheduled Event Calendar Quality

‏Calendar חסר או stale הוא Data Quality issue.

‏צריך freshness/coverage metrics.

---

# ‏113. Event Coverage

‏נמדוד:

```text
KnownUpcomingEventsCoverage
ConfirmedEventCoverage
EventMetadataFreshness
```

---

# ‏114. Event Source Outage

‏אם source האירועים נופל:

‏המערכת צריכה לדעת שהיא blind.

‏זה יכול להיות:

```text
DEGRADED_EVENT_AWARENESS
```

---

# ‏115. Fail-Open מול Fail-Closed

‏לא כל Event Data outage מחייב אותו behavior.

‏אבל ההחלטה חייבת להיות מפורשת ומבוססת risk.

---

# ‏116. Event Data ≠ Safety Truth

‏גם feed אירועים טוב יכול לפספס מידע.

‏לכן אסור לבנות assumption:

```text
No Event Record = No Event Exists
```

---

# ‏117. Market Behavior as Secondary Detector

‏אפשר להשתמש ב־market anomalies כדי לזהות שהעולם השתנה גם אם event feed לא יודע למה.

---

# ‏118. Event Unknown + Abnormal Market

‏שילוב כזה עשוי להצדיק confidence נמוך יותר או veto מחקרי.

---

# ‏119. Event-aware Observability

‏לכל decision נשמור:

```text
EventState
EventAge
EventType
EventConfidence
EventSource
CorporateActionState
EventGeneration
```

‏כאשר רלוונטי.

---

# ‏120. Event RCA

‏כאשר Trade נכשל סביב event, נשאל:

1. ‏האם ידענו שיש event?
2. ‏מתי ידענו?
3. ‏האם ה־candidate השתנה לפני submit?
4. ‏האם spread/liquidity השתנו?
5. ‏האם execution model היה מתאים?
6. ‏האם event logic שינה decision?
7. ‏מה היה ה־First Divergence?

---

# ‏121. Near Misses

‏גם Trade שנחסם ובדיעבד היה טוב הוא Evidence.

‏נשמור missed-good-trade analysis.

---

# ‏122. Event Counterfactuals

‏שמור:

```text
DecisionWithoutEventContext
DecisionWithEventContext
```

‏ב־Shadow כדי למדוד value אמיתי.

---

# ‏123. Corporate Action Counterfactual

‏בדיקה חשובה:

‏מה היה קורה אם adjustment לא היה מוחל?

‏אם התוצאה משתנה דרמטית — feature רגיש וצריך contract חזק יותר.

---

# ‏124. News NLP as Challenger

‏אם מוסיפים NLP:

- ‏Shadow first.
- ‏Point-in-time source.
- ‏Latency measured.
- ‏Calibration measured.
- ‏Ablation against metadata-only baseline.

---

# ‏125. Large Language Models

‏LLM יכול לשמש למחקר/סיווג/סיכום, אבל ל־hot path קצר מאוד יש שאלות קשות של:

- ‏Latency.
- ‏Determinism.
- ‏Cost.
- ‏Versioning.
- ‏Reproducibility.

‏לכן אינו baseline ל־entry loop שלנו.

---

# ‏126. Human-Readable Reason Codes

‏Event logic צריך להסביר:

```text
WHY NO TRADE?
```

‏ולא רק `false`.

---

# ‏127. Avoid Storytelling

‏אחרי מהלך מחיר קל להמציא narrative משכנע.

‏המחקר צריך להתחיל מ־timestamped evidence, לא מסיפור.

---

# ‏128. Event Selection Bias

‏אם מנתחים רק אירועים “גדולים ומעניינים”, נקבל sample מוטה.

‏צריך rule ברור מה נכלל dataset.

---

# ‏129. Survivorship סביב Corporate Actions

‏חברות שעברו אירועים קיצוניים עלולות להיעלם מה־current universe.

‏Historical research חייב לכלול point-in-time universe.

---

# ‏130. Event Frequency Bias

‏Symbols עם הרבה announcements עלולים לקבל ייצוג יתר ב־event dataset.

‏צריך להבין weighting.

---

# ‏131. Event Clustering

‏אירועים אינם תמיד independent.

‏למשל כמה announcements יכולים להיות חלק מאותו episode.

‏Effective sample size קטן מה־row count.

---

# ‏132. Market-Wide Event Clustering

‏אלפי symbol observations סביב macro shock אינם אלפי ניסויים עצמאיים.

---

# ‏133. Episode Unit

‏לעיתים יחידת המחקר הנכונה היא:

```text
EventEpisode
```

‏ולא כל symbol-second.

---

# ‏134. Event Outcome Metrics

‏מעבר ל־PnL:

- ‏Continuation probability.
- ‏Giveback probability.
- ‏Time to target.
- ‏MAE/MFE.
- ‏Spread normalization time.
- ‏Liquidity recovery time.
- ‏Fill markout.
- ‏Time to flat.

---

# ‏135. Event Context and `NO TRADE`

‏אחד ה־edges האפשריים הוא פשוט לא להשתתף בזמן שבו uncertainty גדולה מדי ביחס לרווח הקטן שאנחנו מחפשים.

‏זו Hypothesis למדידה, לא אמת מראש.

---

# ‏136. Practitioner Secret — News Speed Is Relative

‏לא צריך להיות הראשון בעולם.

‏השאלה היא:

```text
Is actionable edge still alive when our system knows enough?
```

‏אם לא — לא רודפים.

---

# ‏137. Practitioner Secret — “Fresh to Us” Is Not Fresh to Market

‏זו אחת הטעויות המסוכנות במערכות event-driven.

---

# ‏138. Practitioner Secret — Better Data Can Make Backtest Worse

‏כאשר מתקנים timestamps, corporate actions ו־event revisions, Backtest עשוי להיראות פחות טוב.

‏זה שיפור באמינות.

---

# ‏139. Practitioner Secret — Unknown Is a Valuable State

‏`UNKNOWN` מונע confidence מזויף.

---

# ‏140. Practitioner Secret — Corporate Actions Can Create Fake Alpha

‏אם adjustment שגוי, scanner יכול “לגלות” moves שאינם קיימים כלכלית.

---

# ‏141. Practitioner Secret — Event Risk Is Often an Execution Problem

‏גם אם direction prediction טוב, spread/latency/adverse selection יכולים למחוק את כל היתרון.

---

# ‏142. Practitioner Secret — Secondary Moves May Be More Tradable Than First Reaction

‏התגובה הראשונה יכולה להיות מהירה מדי עבורנו.

‏אבל continuation/secondary move היא Hypothesis נפרדת שצריך לבדוק.

---

# ‏143. Practitioner Secret — Scheduled Events Are Useful Even Without Predicting Outcome

‏עצם הידיעה שה־distribution עומד להשתנות יכולה להיות שימושית ל־risk/execution gating.

---

# ‏144. Practitioner Secret — Event Filters Can Overfit Fast

‏קל מאוד לבנות blacklist של “אירועים רעים” מתוך מעט samples.

‏לכן צריך OOS, ablation ו־false-veto accounting.

---

# ‏145. Practitioner Secret — Corporate Action Metadata Is Infrastructure

‏זה לא “nice to have analytics”.

‏אם price history ו־security identity אינם נכונים, כל שכבת המחקר מעליהם יכולה להיות שגויה.

---

# ‏146. Baseline מומלץ למחקר שלנו

‏Baseline פשוט:

```text
1. Maintain point-in-time corporate-action state.
2. Maintain scheduled-event proximity when reliably known.
3. Tag halt/resume and abnormal trading states.
4. Detect event-like market shocks from market data.
5. Keep KNOWN / INFERRED / UNKNOWN separate.
6. Log EventState on every candidate decision.
7. Start event logic in Shadow.
8. Measure incremental decision value.
9. Promote only rules that survive OOS + realistic execution.
10. Keep NO TRADE available when uncertainty dominates expected edge.
```

---

# ‏147. מה לא הייתי עושה בגרסה הראשונה

‏לא הייתי מתחיל מ:

- ‏LLM on every headline in the hot path.
- ‏עשרות event categories.
- ‏Hard sentiment rules.
- ‏Complex event-specific models לכל category.
- ‏Vendor-specific assumptions בתוך Strategy core.

‏קודם נבנה correct event awareness.

---

# ‏148. Architecture Boundary

‏כדאי להפריד:

```text
EventDataProvider
CorporateActionProvider
MarketDataProvider
ExecutionBroker
```

‏גם אם בפועל ספק אחד מספק כמה מהשירותים.

---

# ‏149. Canonical Event Model

‏ה־Strategy לא צריכה להכיר payload של provider.

‏היא צריכה canonical fields.

---

# ‏150. Event Adapter Contract

‏Adapter אחראי ל:

- ‏Parsing.
- ‏Timestamp semantics.
- ‏Deduplication metadata.
- ‏Source identity.
- ‏Revision identity.
- ‏Unknown fields.

---

# ‏151. Provider Swap Test

‏בדיקה חשובה:

‏החלפת provider צריכה לשנות adapter, לא לשבור Strategy semantics.

---

# ‏152. Event Data Quality SLOs

‏דוגמאות metrics:

```text
coverage
freshness
duplicate rate
revision rate
unknown-type rate
provider divergence
calendar completeness
```

---

# ‏153. Event Health Dashboard

‏Dashboard קצר צריך לענות:

- ‏האם event feed healthy?
- ‏כמה upcoming events ידועים?
- ‏כמה symbols ב־event-restricted state?
- ‏כמה decisions השתנו בגלל event context?
- ‏כמה false vetoes זוהו?

---

# ‏154. Event Safety Gate

‏אם Corporate Action state לא פתור או trading state חריג:

‏אפשר להגדיר `P0` readiness failure עבור entry, בהתאם למדיניות שנבדקה.

---

# ‏155. Event Data in Replay Artifacts

‏Incident replay צריך לכלול גם את event stream שהיה זמין אז.

---

# ‏156. Configuration Fingerprint

‏לכל decision נשמור גם:

```text
EventPolicyVersion
EventParserVersion
EventTaxonomyVersion
```

---

# ‏157. Event Policy Champion/Challenger

‏אפשר להריץ:

```text
Champion = no event penalty
Challenger = event-aware policy
```

‏ב־Shadow.

---

# ‏158. Promotion Criteria

‏Event logic מתקדם רק אם:

- ‏משפר `net outcome`.
- ‏לא מוחק disproportionate winners.
- ‏נשאר יציב OOS.
- ‏עובד תחת realistic execution.
- ‏ניתן להסבר ולשחזור.

---

# ‏159. Rejection Criteria

‏נפסול Event Feature אם:

- ‏value נעלם OOS.
- ‏תלוי ב־few episodes.
- ‏דורש future information.
- ‏מוסיף complexity בלי Decision Impact.
- ‏רגיש מדי ל־provider quirks.

---

# ‏160. Definition of Done

‏לפני שנאמר ש־Event/Corporate Action awareness בשלה למחקר רציני, נרצה:

- ‏Point-in-time event model.
- ‏Raw + adjusted price contract.
- ‏Corporate action lineage.
- ‏Security identity מעבר ל־ticker.
- ‏Known/Unknown semantics.
- ‏Event timestamps מלאים.
- ‏Deduplication/revision handling.
- ‏Replay support.
- ‏Event-aware RCA.
- ‏Shadow measurements.
- ‏False-veto accounting.
- ‏OOS validation.

---

# ‏161. המשמעות לרובוט שלנו

‏הרובוט שלנו מחפש move מהיר מאוד.

‏לכן Event Context חשוב במיוחד משום שהוא יכול לייצר בדיוק את מה שה־Scanner אוהב לראות:

```text
large move
high acceleration
huge trade rate
volume burst
```

‏אבל יחד עם:

```text
wider spread
unstable depth
higher adverse selection
shorter signal half-life
harder exit
```

‏לכן “הכי חזק” ו־“הכי כדאי לבצע” יכולים להתפצל דווקא בזמן אירוע.

---

# ‏162. מסקנת הפרק

> ‏**Event-aware trading אינו מתחיל מניסיון לנחש חדשות. הוא מתחיל מהבנה מתי העולם השתנה, האם המחיר שאנחנו רואים בר־השוואה, איזה מידע באמת היה ידוע בזמן אמת, ואיך אותו אירוע משנה את ה־Prediction, ה־Execution וה־Risk. רק לאחר מכן בודקים אם קיימת הזדמנות נטו שניתן לממש.**
