# ‏שלב 42 — `Opening/Closing Auctions` ו־Auction Order Types

> ‏מטרת הפרק: להבין כיצד Auctions בפתיחה ובסגירה שונים מהותית מהמסחר הרציף, איך נקבע מחיר Cross, מה המשמעות של imbalance, אילו פקודות משתתפות, ואיך משלבים Auction Logic בתוך מערכת Algo בלי להניח שכל Exchange פועל באותו אופן.
>
> ‏העיקרון המרכזי: **Auction אינו עוד Snapshot של ה־Order Book. זהו מנגנון Price Discovery נפרד, עם מאגר פקודות, כללי התאמה, cutoffs, imbalance data ומחיר Clearing משלו.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.
>
> ‏הערת עדכניות: שעות, freeze periods, cutoffs וסוגי Orders הם Exchange-specific ועלולים להשתנות. הדוגמאות העדכניות בפרק נבדקו מול מסמכי Nasdaq ו־NYSE באוקטובר 2026, אבל ב־Production יש לבצע capability/config validation מול המקור הרשמי בכל גרסה.

---

# ‏1. מהו Auction

‏במסחר רציף Orders נפגשים לאורך הזמן.

‏ב־Auction אוספים interest לאורך חלון מסוים ואז מחפשים מחיר אחד שבו ניתן להתאים כמות גדולה של קונים ומוכרים.

```text
Continuous market:
order -> match -> order -> match -> order -> match

Auction:
collect orders
collect orders
collect orders
        ↓
calculate clearing price
        ↓
execute cross
```

‏זה שינוי מהותי במבנה השוק.

---

# ‏2. למה בכלל קיימים Auctions

‏המטרות העיקריות:

- ‏Price Discovery.
- ‏ריכוז Liquidity.
- ‏יצירת Official Open/Close Price.
- ‏התמודדות עם כמות גדולה של Orders בנקודת זמן מרכזית.
- ‏צמצום fragmentation ברגעי פתיחה וסגירה.

---

# ‏3. Opening Auction

‏Opening Auction מרכז interest שהצטבר לפני פתיחת המסחר הרציף.

‏הוא מנסה לענות על השאלה:

> ‏באיזה מחיר ניתן לפתוח את המסחר תוך התאמת כמות גדולה ככל האפשר תחת כללי הבורסה?

---

# ‏4. Closing Auction

‏Closing Auction מרכז interest לקראת סוף המסחר.

‏הוא חשוב במיוחד משום שה־Official Closing Price משמש Benchmark למערכות רבות, Valuation, Funds, Index Tracking ו־Performance Measurement.

---

# ‏5. Auction Price אינו פשוט Last Price

‏המחיר נקבע לפי מנגנון התאמה.

‏ב־Nasdaq, לדוגמה, הלוגיקה מתמקדת בין היתר ב־:

1. ‏מקסום מספר המניות הניתנות להתאמה.
2. ‏מזעור imbalance.
3. ‏מזעור המרחק מנקודת reference מתאימה.

‏לכן:

```text
last trade != guaranteed auction price
```

---

# ‏6. Clearing Price

‏`Clearing Price` הוא המחיר שבו מנגנון ה־Auction יכול לבצע את ה־Cross לפי כללי הבורסה.

‏הוא אינו בהכרח:

- ‏ה־Bid.
- ‏ה־Ask.
- ‏ה־Mid.
- ‏ה־Last.
- ‏המחיר של העסקה האחרונה לפני ה־Auction.

---

# ‏7. Paired Quantity

‏`Paired Quantity` היא הכמות שניתן להתאים בין Buy Interest ל־Sell Interest במחיר האינדיקטיבי.

‏כמות paired גדולה יכולה להעיד על Auction עמוק יחסית.

‏אבל היא אינה מבטיחה שהמחיר לא ישתנה לפני ה־Cross.

---

# ‏8. Imbalance

‏`Imbalance` הוא עודף interest בצד אחד.

```text
Buy interest > Sell interest
=> Buy imbalance
```

‏או להפך.

---

# ‏9. Imbalance אינו Signal בפני עצמו

‏טעות נפוצה:

```text
large buy imbalance => price must go up
```

‏זו מסקנה חזקה מדי.

‏הסיבות:

- ‏Orders חדשים יכולים להגיע.
- ‏Orders יכולים להשתנות לפי כללי החלון.
- ‏ה־reference price יכול להשתנות.
- ‏Liquidity offsetting יכולה להופיע.
- ‏Imbalance גדול יכול כבר להיות צפוי ומתומחר.

---

# ‏10. Indicative Match Price

‏זהו מחיר משוער שבו Auction היה מתבצע אילו נסגר באותו רגע.

‏הוא יכול להשתנות במהירות ככל שנכנס interest חדש.

---

# ‏11. Auction Data היא Stream

‏אסור להתייחס ל־imbalance snapshot יחיד כאמת סופית.

‏מעניין יותר למדוד:

```text
imbalance_t
imbalance_t-1
indicative_price_t
indicative_price_t-1
paired_qty_t
paired_qty_t-1
```

‏כלומר גם את הדינמיקה.

---

# ‏12. Imbalance Velocity

‏Feature אפשרי למחקר:

```text
imbalance_velocity =
    (imbalance_now - imbalance_prev) / elapsed_time
```

‏אבל הוא דורש בדיקה אמפירית ואינו edge מובטח.

---

# ‏13. Paired-Quantity Growth

‏עוד Feature מחקרי:

```text
paired_growth = paired_now / paired_prev - 1
```

‏הוא עשוי לתת מידע על קצב כניסת liquidity.

---

# ‏14. Indicative Price Drift

```text
indicative_drift =
    indicative_price_now / indicative_price_prev - 1
```

‏יכול לשמש להבנת כיוון price discovery.

---

# ‏15. MOO — Market On Open

‏`MOO` מבקש להשתתף ב־Opening Auction במחיר ה־Cross.

‏היתרון:

- ‏עדיפות לביצוע ביחס לפקודה מוגבלת מדי.

‏החיסרון:

- ‏אין Price Limit רגיל שמגן על המחיר.

---

# ‏16. LOO — Limit On Open

‏`LOO` משתתפת ב־Opening Auction רק אם מחיר ה־Cross עומד במגבלת ה־Limit.

‏לכן:

```text
MOO => execution priority / price uncertainty
LOO => price protection / fill uncertainty
```

---

# ‏17. MOC — Market On Close

‏`MOC` מבקש לבצע ב־Closing Auction במחיר הסגירה שנקבע.

‏גם כאן:

```text
execution certainty ↑
price control ↓
```

‏יחסית ל־LOC.

---

# ‏18. LOC — Limit On Close

‏`LOC` משתתפת בסגירה רק אם מחיר ה־Auction עומד בתנאי ה־Limit.

‏היא נותנת Price Protection אבל יכולה לא להתבצע.

---

# ‏19. Imbalance-Only Orders

‏בחלק מהבורסות קיימות פקודות שמטרתן לספק liquidity כנגד imbalance.

‏הן אינן פשוט Limit Order רגיל.

‏יש להן כללי eligibility ו־repricing משלהן.

---

# ‏20. Cutoff

‏ל־Auction Orders קיימים deadlines.

‏אחרי cutoff מסוים ייתכן ש־:

- ‏פקודה חדשה תידחה.
- ‏Modification תיחסם.
- ‏Cancellation תיחסם.
- ‏רק Orders שמקטינים imbalance יורשו.

---

# ‏21. אין Cutoff אוניברסלי

‏זה אחד הכללים החשובים בפרק.

```text
wrong:
closingCutoff = 15:50 ET

better:
closingCutoff = exchangeCapabilities.GetCutoff(...)
```

---

# ‏22. דוגמת NYSE עדכנית

‏נכון לבדיקה באוקטובר 2026, NYSE מפרסמת cutoff מרכזי של `3:50 p.m. ET` ל־`MOC/LOC` רגילים.

‏אחרי הזמן הזה קיימים כללים מוגבלים יותר, כולל אפשרות ל־offsetting interest בתנאים מסוימים.

‏ב־`4:00 p.m. ET` מתחיל תהליך Closing Auction.

---

# ‏23. דוגמת Nasdaq עדכנית

‏Nasdaq מתחילה לפרסם Closing imbalance information ב־`3:50 p.m. ET`.

‏ה־Closing Cross מתבצע סביב סיום המסחר הרגיל ב־`4:00 p.m. ET`.

‏ל־MOC/LOC קיימים deadlines וכללי late entry נפרדים.

---

# ‏24. Opening Nasdaq

‏נכון למסמכי Nasdaq שנבדקו:

- ‏Opening imbalance dissemination מתחילה ב־`9:25 a.m. ET`.
- ‏Opening Cross מתרחש סביב `9:30 a.m. ET`.
- ‏ל־MOO ול־LOO יש cutoffs שונים.

‏אסור להסיק מכך שכל venue משתמש באותם זמנים.

---

# ‏25. Opening NYSE

‏NYSE מתחילה לפרסם Opening Auction imbalance data מוקדם יותר, וה־Opening Auction יכול להתרחש לאחר `9:30` בהתאם לפתיחת המניה.

‏זה מדגים שוב שהמושג “market opens at 9:30” אינו מספיק כדי לתאר mechanics של כל listing venue.

---

# ‏26. Official Opening Price

‏ב־Nasdaq ה־Opening Cross יכול לקבוע את `Nasdaq Official Opening Price`.

‏אם אין Cross תקף, קיימים כללים חלופיים לקביעת official open.

---

# ‏27. Official Closing Price

‏Closing Cross יכול לקבוע את Official Closing Price.

‏זו אחת הסיבות שה־Close הוא אירוע Microstructure משמעותי ולא רק “הטרייד האחרון בשעה 16:00”.

---

# ‏28. Why Close Volume Can Explode

‏לקראת הסגירה מצטברים Orders בגלל:

- ‏Benchmarking.
- ‏Index funds.
- ‏ETF/index rebalance.
- ‏End-of-day portfolio adjustments.
- ‏Institutional execution schedules.

‏לכן volume profile של הדקות האחרונות שונה מאוד מהאמצע היום.

---

# ‏29. Opening Regime שונה

‏בפתיחה מתקבצים:

- ‏Overnight news.
- ‏Pre-market movement.
- ‏Orders שהמתינו לפתיחה.
- ‏פערי valuation מאז הסגירה הקודמת.

‏לכן spread, volatility ו־price discovery יכולים להיות שונים מאוד ממסחר רציף מאוחר יותר.

---

# ‏30. Auction אינו Continuous Market With Bigger Volume

‏זו טעות מושגית.

‏יש לו:

- ‏Order pool שונה.
- ‏matching logic שונה.
- ‏timing שונה.
- ‏data fields שונים.
- ‏cancellation rules שונים.
- ‏reference-price logic שונה.

---

# ‏31. Auction State Machine

```text
PRE_AUCTION
    ↓
IMBALANCE_PUBLISHING
    ↓
FREEZE_OR_RESTRICTED_WINDOW
    ↓
CROSS_PENDING
    ↓
CROSS_EXECUTED
    ↓
POST_AUCTION_RECONCILIATION
```

‏ה־states המדויקים תלויים ב־exchange.

---

# ‏32. Auction Capability Model

```text
AuctionCapabilities
- SupportsOpenAuction
- SupportsCloseAuction
- SupportsMOO
- SupportsLOO
- SupportsMOC
- SupportsLOC
- SupportsImbalanceOnly
- OpeningCutoffs
- ClosingCutoffs
- CancelRules
- ModifyRules
- ImbalanceFeedAvailable
```

---

# ‏33. Capability Discovery

‏אלגוריתם לא צריך להניח שפיצ'ר קיים רק משום שהוא קיים ב־exchange אחר.

‏ב־startup יש לבדוק:

- ‏instrument.
- ‏listing venue.
- ‏broker support.
- ‏account permissions.
- ‏order-type availability.

---

# ‏34. Listing Venue Matters

‏אותו ticker יכול להיסחר במקומות רבים, אבל ה־primary auction משויך ל־listing venue המתאים.

‏לכן symbol string בלבד אינו מספיק.

---

# ‏35. Instrument Master

‏נרצה לדעת:

```text
CanonicalInstrumentId
PrimaryListingVenue
BrokerContractId
DataProviderSymbol
AuctionEligibility
```

---

# ‏36. Auction Data Provider

‏Imbalance data לא בהכרח מגיעה מאותו feed שמשמש אותנו ל־Top-of-Book.

‏ייתכן שנצטרך entitlement נפרד.

---

# ‏37. Missing Auction Data

‏אם imbalance feed חסר:

```text
auction_data_status = UNAVAILABLE
```

‏לא:

```text
imbalance = 0
```

---

# ‏38. Stale Auction Data

‏בחלון של שניות, imbalance snapshot ישן יכול להיות חסר ערך.

‏לכן יש למדוד:

```text
auction_data_age_ms
```

---

# ‏39. Sequence Integrity

‏אם איבדנו messages ב־imbalance feed, אסור בהכרח להמשיך כאילו הסדרה רציפה.

‏צריך:

- ‏gap detection.
- ‏snapshot recovery.
- ‏quality flag.

---

# ‏40. Auction Snapshot

‏Snapshot שימושי למחקר יכול לכלול:

```text
instrument
exchange
auction_type
received_time
reference_price
indicative_match_price
paired_quantity
imbalance_quantity
imbalance_side
near_price
far_price
auction_status
```

‏השדות המדויקים תלויים ב־feed.

---

# ‏41. Normalize Carefully

‏אסור להמציא semantic אחידה כשהבורסות מגדירות fields אחרת.

‏אפשר ליצור Canonical Layer, אבל צריך לשמור גם:

```text
raw_exchange_fields
raw_message_type
raw_sequence
```

---

# ‏42. Observed vs Derived

‏יש להפריד:

```text
Observed:
paired_quantity
imbalance_quantity
reference_price

Derived:
imbalance_ratio
imbalance_velocity
price_drift
```

---

# ‏43. Imbalance Ratio

‏דוגמה למחקר:

```text
imbalance_ratio =
    abs(imbalance_quantity) /
    max(paired_quantity, 1)
```

‏אין להניח שיחס גבוה הוא בהכרח Predictive.

---

# ‏44. Signed Imbalance

```text
signed_imbalance =
    buy_imbalance ? +qty : -qty
```

‏נוח לניתוח, אבל חייב לשמור גם את הסמנטיקה המקורית.

---

# ‏45. Relative Imbalance

‏כמות של מיליון מניות יכולה להיות עצומה במניה אחת ונורמלית באחרת.

‏לכן כדאי לבדוק normalization לפי:

- ‏ADV.
- ‏recent auction volume.
- ‏current paired quantity.
- ‏float/liquidity class.

---

# ‏46. Auction Volume Share

```text
auction_share_of_day =
    auction_volume / total_day_volume
```

‏Metric זה חשוב להבנת significance של ה־Close.

---

# ‏47. Auction Price Impact

```text
auction_gap =
    auction_price / pre_auction_reference - 1
```

‏צריך להגדיר היטב מהו reference.

---

# ‏48. Close-to-Close אינו מספיק

‏אם רוצים להבין מה קרה בסגירה, עדיף לשמור:

- ‏last continuous trade.
- ‏pre-close bid/ask.
- ‏indicative auction price.
- ‏official close.

---

# ‏49. Open Gap Decomposition

‏Opening gap יכול להיות מפורק ל־:

```text
previous_close
pre_market_price
indicative_open
official_open
first_continuous_trade
```

‏כך אפשר להבין איפה נוצר השינוי.

---

# ‏50. Auction Participation Risk

‏פקודה שנכנסת ל־Auction יכולה להיות מחויבת לכללי חלון שבהם cancellation כבר אינה אפשרית.

‏לכן החלטה להשתתף חייבת להתרחש לפני cutoff מתאים.

---

# ‏51. Cancelability Is a Capability

‏לא מניחים:

```text
Cancel() always works
```

‏אלא:

```text
CanCancel(order, now, auctionState)
```

---

# ‏52. Modifyability Is a Capability

‏גם שינוי מחיר/כמות יכול להיות מוגבל בזמן.

‏ה־Execution Engine חייב לדעת זאת מראש.

---

# ‏53. Freeze Window

‏בחלק מהבורסות יש חלון שבו cancellation או שינוי מוגבלים כדי לשפר יציבות של ה־Auction.

‏מבחינת Risk:

```text
before freeze != after freeze
```

---

# ‏54. Pre-Freeze Decision Deadline

‏ה־Strategy אינה צריכה לחשוב עד הרגע האחרון.

‏אפשר להגדיר:

```text
internal_decision_deadline
    < exchange_cutoff
```

‏ולהשאיר Safety Margin ל־latency.

---

# ‏55. Submission Safety Margin

```text
latest_safe_submit =
    exchange_cutoff
    - p99_network_latency
    - p99_broker_latency
    - safety_buffer
```

---

# ‏56. Clock Discipline

‏Auction logic רגישה במיוחד לזמן.

‏צריך לעקוב אחר:

- ‏UTC wall clock.
- ‏exchange-local time.
- ‏monotonic durations.
- ‏clock skew.

---

# ‏57. DST

‏אסור לקודד שעה ישראלית קבועה לפתיחת/סגירת ארה"ב.

‏משתמשים ב־exchange timezone/calendar.

---

# ‏58. Early Close Days

‏ימים מקוצרים משנים את schedule.

‏לכן:

```text
closeTime = marketCalendar.GetClose(sessionDate)
```

‏ולא constant.

---

# ‏59. Holidays

‏גם Auction scheduling תלוי ב־market calendar.

---

# ‏60. Halts

‏מניה halted יכולה לעבור Auction נפרד לחזרה למסחר.

‏זה לא אותו Opening/Closing Auction רגיל.

‏נעמיק בכך בשלב 43.

---

# ‏61. IPO Cross

‏גם IPO יכול להשתמש בתהליך Cross ייחודי.

‏אין לערבב אותו עם Opening Auction רגיל.

---

# ‏62. Auction Collars

‏בורסות יכולות להגביל Auction price לטווחים מסוימים.

‏לכן indicative price אינו חופשי לחלוטין.

---

# ‏63. Price Validation

‏ייתכנו מנגנוני validation שמונעים Cross במחיר שאינו עומד בתנאים.

‏ה־Backtest חייב להכיר את העובדה שקיימים כללים כאלה.

---

# ‏64. Market Order Risk

‏`MOO/MOC` נותנים מעט מאוד price protection.

‏בסביבה שבה imbalance משתנה במהירות, המחיר הסופי יכול להיות שונה מהאינדיקציה מוקדם יותר.

---

# ‏65. Limit Order Risk

‏`LOO/LOC` מגינים על המחיר אבל מעלים `No Fill Risk`.

---

# ‏66. Limit Too Tight

‏Limit שמרני מדי יכול לגרום:

```text
good thesis
+ auction moved
+ no fill
= missed opportunity
```

---

# ‏67. Limit Too Loose

‏Limit רחב מדי עלול להפוך בפועל להגנה כמעט חסרת משמעות.

---

# ‏68. Expected Auction Outcome

‏מודל מחקרי צריך לשקול:

```text
expected_alpha
- expected_auction_cost
- adverse_selection
- no_fill_cost
```

---

# ‏69. Auction Spread

‏אין להשתמש ב־continuous spread כאילו הוא מגדיר במדויק את execution cost ב־Auction.

‏המנגנון שונה.

---

# ‏70. Price Improvement

‏Auction יכול לעיתים להתבצע במחיר טוב יותר מהציפייה לפי continuous book.

‏אבל זה outcome אמפירי, לא הבטחה.

---

# ‏71. Benchmark Choice

‏אפשר להשוות Auction execution מול:

- ‏last pre-auction mid.
- ‏last continuous trade.
- ‏arrival price.
- ‏indicative match price בזמן ההחלטה.
- ‏official auction price.

‏כל Benchmark עונה על שאלה אחרת.

---

# ‏72. Decision Benchmark

‏אם ההחלטה התקבלה ב־`15:58:20`, benchmark הוגן הוא market state שהיה זמין אז — לא official close שעדיין לא היה ידוע.

---

# ‏73. Auction Slippage

```text
auction_slippage =
    signed(auction_fill - decision_reference)
```

‏צריך לחשב side-aware.

---

# ‏74. Auction Markout

‏אחרי ה־Cross אפשר למדוד:

```text
markout_1s
markout_5s
markout_30s
markout_60s
```

‏כדי להבין adverse selection לאחר ה־Auction.

---

# ‏75. Opening Markout

‏חשוב במיוחד לרובוט קצר־הטווח שלנו אם אי פעם נבחן כניסה סביב הפתיחה.

---

# ‏76. Closing Markout

‏בסגירה אין אותו continuous future מיד לאחר `4:00` במסחר הרגיל, ולכן בחירת horizon דורשת הגדרה ברורה של after-hours או next-session behavior.

---

# ‏77. Auction Signal vs Auction Execution

‏אל תערבב:

```text
AuctionSignal
AuctionDecision
AuctionOrderIntent
AuctionExecution
```

---

# ‏78. `AuctionOrderIntent`

```text
AuctionOrderIntent
- InstrumentId
- Side
- Quantity
- AuctionType
- PriceConstraint
- DecisionTime
- Deadline
- StrategyVersion
- RiskApprovalId
```

---

# ‏79. Broker Mapping

‏ה־Broker Adapter ממפה Intent כזה לסוג Order שהברוקר וה־venue תומכים בו.

---

# ‏80. No Silent Fallback

‏אם ביקשנו `LOC` והברוקר לא תומך:

‏אסור בשקט להפוך ל־Market Order.

‏התגובה צריכה להיות:

```text
UNSUPPORTED_CAPABILITY
```

‏או fallback שהוגדר מראש במפורש.

---

# ‏81. Broker Cutoff Earlier Than Exchange

‏ברוקר יכול להחיל deadline מוקדם יותר מה־exchange.

‏לכן צריך להתייחס ל־effective cutoff:

```text
min(exchange_cutoff, broker_cutoff)
```

---

# ‏82. Operational Cutoff

‏אנחנו יכולים להגדיר cutoff פנימי מוקדם עוד יותר.

```text
internal_cutoff < effective_cutoff
```

---

# ‏83. Reason Codes

‏דוגמאות:

```text
AUCTION_TOO_LATE
AUCTION_DATA_STALE
AUCTION_CAPABILITY_MISSING
AUCTION_LIMIT_UNSAFE
AUCTION_IMBALANCE_UNSTABLE
AUCTION_BROKER_NOT_READY
```

---

# ‏84. Imbalance Stability

‏לא רק גודל imbalance מעניין.

‏גם stability:

```text
same_side_duration
sign_flips
quantity_volatility
indicative_price_volatility
```

---

# ‏85. Imbalance Flip

‏מעבר מ־Buy Imbalance ל־Sell Imbalance סמוך ל־Cross יכול להיות מידע משמעותי על חוסר יציבות.

‏אבל שוב — צריך לבדוק אמפירית.

---

# ‏86. Sign Flip Count

```text
imbalance_flip_count(window)
```

‏יכול לשמש כ־uncertainty feature.

---

# ‏87. Auction Confidence

‏אפשר לבנות confidence על בסיס:

- ‏data freshness.
- ‏paired quantity.
- ‏imbalance stability.
- ‏indicative price stability.
- ‏time remaining.

‏אך לא להפוך אותו ל־magic score ללא validation.

---

# ‏88. Auction `NO TRADE`

‏מצב תקין לחלוטין.

‏אם ה־Auction לא יציב או ה־data חסר, abstention יכולה להיות ההחלטה הנכונה.

---

# ‏89. Whole-Market Scanner Near Open

‏Scanner של אלפי מניות צריך להתמודד עם transition חד מ־pre-market ל־regular session.

‏אין להניח שכל symbols מוכנים בדיוק באותה millisecond.

---

# ‏90. Whole-Market Scanner Near Close

‏לקראת Close, volume/activity distributions משתנות לכל השוק.

‏Normalization שנלמד באמצע היום עלול להיות לא מתאים לדקות האחרונות.

---

# ‏91. Regime Separation

‏Opening Auction ו־Closing Auction צריכים להיות regimes נפרדים.

```text
PRE_OPEN
OPEN_AUCTION
OPEN_TRANSITION
CONTINUOUS
PRE_CLOSE
CLOSE_AUCTION
POST_CLOSE
```

---

# ‏92. Do Not Train Across Regimes Blindly

‏Feature שעובד ב־`10:30` אינו בהכרח תקף ב־`09:29:50`.

---

# ‏93. Auction Feature Leakage

‏אסור להשתמש ב־final auction price כ־Feature של החלטה שהתרחשה לפני ה־Cross.

---

# ‏94. Final Imbalance Leakage

‏גם final imbalance שלא היה ידוע בזמן ההחלטה הוא leakage.

---

# ‏95. Point-in-Time Auction Dataset

‏כל snapshot צריך לשמור:

```text
as_of_time
received_time
source_time
sequence
```

---

# ‏96. Historical Feed Granularity

‏אם historical dataset נותן רק final auction fields, הוא אינו מספיק למחקר של decision שנעשה 30 שניות לפני ה־Cross.

---

# ‏97. Backtest Fidelity Levels

```text
A0: official auction price only
A1: + final imbalance
A2: + periodic imbalance snapshots
A3: + order eligibility/cutoff logic
A4: + broker latency/rejection model
A5: + full live-like event replay
```

---

# ‏98. Official Price Only Backtest

‏שימוש ב־official auction price בלבד יכול למדוד outcome בסיסי, אבל לא להוכיח שניתן היה לקבל את ההחלטה בזמן.

---

# ‏99. Auction Fill Assumption

‏אם Order היה eligible ומשתתף ב־Cross, fill logic עדיין תלוי ב־order type, limit ו־matching result.

---

# ‏100. MOC/MOO Simulation

‏במודל פשוט אפשר להתייחס ל־market-on-auction כמשתתף ב־Cross אם הוגש בזמן והתקבל.

‏אבל יש לדמות גם reject/late submission.

---

# ‏101. LOC/LOO Simulation

‏Fill מתקבל רק אם מחיר ה־Cross עומד במגבלת ה־limit ובהתאם לכללי ה־venue.

---

# ‏102. Late Submission

‏Backtest שמגיש תמיד ב־`cutoff - 1ms` ללא latency הוא לא ריאלי.

---

# ‏103. Submit Latency

‏צריך לדמות:

```text
decision_ready
order_created
broker_send
broker_receive
exchange_receive
```

---

# ‏104. Auction Deadline Miss

‏זהו failure mode עצמאי.

```text
MISSED_AUCTION_CUTOFF
```

---

# ‏105. Cancellation Deadline Miss

‏גם Cancel יכול להגיע מאוחר מדי.

---

# ‏106. Unknown Auction Order State

‏אם נשלח Order סמוך ל־cutoff ולא ברור אם התקבל:

```text
UNKNOWN_ORDER_EFFECT
```

‏לא שולחים duplicate באופן עיוור.

---

# ‏107. Reconciliation

‏לאחר ה־Cross יש לבדוק:

- ‏order status.
- ‏fills.
- ‏position.
- ‏average fill price.
- ‏fees.

---

# ‏108. Partial Fill Possibility

‏לא כל Auction Order בהכרח מתמלא במלואו.

‏ה־state machine חייב לתמוך בכך.

---

# ‏109. Post-Auction Position Truth

‏אסור להתחיל logic חדש עד שיודעים מה position בפועל.

---

# ‏110. Opening Transition

‏מיד אחרי Opening Auction מתחיל continuous market.

‏המעבר יכול להיות אלים מבחינת price/volume.

---

# ‏111. Signal Decay After Open

‏אם thesis נבנתה ל־Auction עצמו, היא לא בהכרח נשארת תקפה 10 שניות אחרי הפתיחה.

---

# ‏112. Closing Transition

‏אחרי Closing Auction עוברים ל־post-market, שבו liquidity ו־rules שונים.

---

# ‏113. Exit Planning

‏אסטרטגיה שנכנסת ב־Opening Auction צריכה לדעת מראש כיצד תצא אם המחיר קופץ מיד נגד הכיוון.

---

# ‏114. Auction Orders Are Execution Tools

‏`MOC/MOO/LOC/LOO` אינם Alpha.

‏הם דרכי ביצוע.

---

# ‏115. Auction Edge Is Separate Research Question

‏צריך לבדוק בנפרד האם auction information מוסיף predictive value.

---

# ‏116. Auction Execution Edge Is Another Question

‏גם אם signal טוב, צריך לבדוק האם אפשר לבצע אותו בצורה ששומרת Net Edge.

---

# ‏117. Selection Bias

‏אם מנתחים רק מניות עם Auction גדול, צריך להגדיר selection point-in-time ולא לפי outcome עתידי.

---

# ‏118. Survivorship

‏גם historical universe של auction research חייב להיות point-in-time.

---

# ‏119. Corporate Events

‏Earnings, index changes ואירועים אחרים יכולים להשפיע מאוד על auction behavior.

‏יש לתייג context.

---

# ‏120. Index Rebalance Days

‏ימים כאלה יכולים להיות regime נפרד בגלל Closing Auction volume חריג.

---

# ‏121. Triple-Witching / Expiry Context

‏ימי expiry מסוימים יכולים לשנות flow סביב Close.

‏אין להסיק מהם על יום רגיל.

---

# ‏122. Month-End / Quarter-End

‏גם calendar effects יכולים לשנות Closing Auction participation.

---

# ‏123. News Days

‏Opening Auction אחרי חדשות משמעותיות יכול להיות שונה מאוד מיום רגיל.

---

# ‏124. Thin Stocks

‏במניות דלות liquidity, indicative prices יכולים לזוז בחדות עם Order חדש יחסית קטן.

---

# ‏125. High-Liquidity Stocks

‏גם במניות גדולות יכול להיות imbalance עצום, אבל ביחס ל־auction volume הוא לא בהכרח חריג.

---

# ‏126. Relative Features

‏לכן עדיף להשוות:

```text
imbalance / typical_auction_volume
paired_qty / typical_auction_volume
```

---

# ‏127. Cross-Sectional Auction Ranking

‏אפשר למחקר לדרג מניות לפי auction features.

‏אבל יש להפריד בין:

```text
prediction ranking
execution feasibility
```

---

# ‏128. Top Candidate Near Auction

‏אם Rank #1 משתנה כל שנייה, signal stability נמוכה.

---

# ‏129. Freeze Before Action

‏אפשר לדרוש persistence מינימלית לפני שליחת Auction Order.

---

# ‏130. But Too Much Persistence Can Miss Cutoff

‏זו פשרה קלאסית בין certainty לבין time remaining.

---

# ‏131. Time-to-Cutoff Feature

```text
time_to_cutoff_ms
```

‏צריך להיות Feature/Guard מרכזי.

---

# ‏132. Time-to-Cross Feature

```text
time_to_cross_ms
```

‏נפרד מ־time-to-cutoff.

---

# ‏133. Decision Deadline vs Exchange Deadline

‏Decision Deadline שלנו מוקדם יותר.

---

# ‏134. Auction Risk Engine

‏Risk Engine צריך לדעת שה־Order אולי אינו cancelable אחרי נקודה מסוימת.

---

# ‏135. Pending Exposure

‏Order שנשלח ל־Auction אך טרם Cross צריך להיחשב exposure אפשרי.

---

# ‏136. Double-Entry Prevention

‏אסור לשלוח גם Auction Order וגם continuous-market entry שמייצרים יחד position כפול ללא תכנון.

---

# ‏137. Reservation

‏אפשר לבצע reservation לכמות/כסף לפני submit.

---

# ‏138. Position Sizing Near Auction

‏Sizing צריך לקחת בחשבון uncertainty גבוהה יותר אם מודל ה־Auction עדיין לא מכויל.

---

# ‏139. Risk-Reducing Auction Orders

‏יש מקרים שבהם Auction משמש לסגירת Position, אך גם כאן צריך להבין cancellation limitations ו־price uncertainty.

---

# ‏140. Kill Switch Interaction

‏אם Kill Switch מופעל לאחר Order שנכנס לחלון שאינו ניתן לביטול, צריך להכיר בכך שה־risk לא נעלם מייד.

---

# ‏141. Safety State

```text
AUCTION_ORDER_COMMITTED
```

‏יכול להיות מצב שבו אין עוד שליטה מלאה ב־Order לפני ה־Cross.

---

# ‏142. Recovery Around Auction

‏Crash שתי שניות לפני Cross הוא תרחיש שחייבים לבדוק.

---

# ‏143. Restart After Cross

‏לא מניחים שה־Order לא התמלא.

‏מבצעים reconciliation לפני כל entry חדש.

---

# ‏144. Broker Disconnect

‏אם connection נופל אחרי submit, Order יכול עדיין להיות חי אצל broker/exchange.

---

# ‏145. Market Data Disconnect

‏אם imbalance feed נופל לפני cutoff, אין להמשיך עם snapshot ישן בלי policy מפורשת.

---

# ‏146. Fail Closed for New Auction Entries

‏זה baseline בטיחותי סביר.

---

# ‏147. Existing Auction Orders

‏Entry block אינו בהכרח מבטל Order שכבר committed.

‏צריך state נפרד.

---

# ‏148. Auction Observability

‏Dashboard צריך להראות:

- ‏time to cutoff.
- ‏time to cross.
- ‏feed freshness.
- ‏paired quantity.
- ‏imbalance.
- ‏indicative price.
- ‏order state.
- ‏cancelability.

---

# ‏149. Decision Trace

‏לכל Auction Order צריך להיות trace:

```text
why entered
what data was known
which cutoff applied
what limit was selected
what broker accepted
what eventually filled
```

---

# ‏150. Auction RCA

‏Failure taxonomy לדוגמה:

```text
SIGNAL_WRONG
IMBALANCE_FLIPPED
PRICE_MOVED_BEFORE_CROSS
MISSED_CUTOFF
BROKER_REJECT
NO_FILL_LIMIT
DATA_STALE
CLOCK_ERROR
EXECUTION_LATE
POST_CROSS_ADVERSE_MOVE
```

---

# ‏151. Success RCA

‏גם עסקה מוצלחת צריכה להיבדק.

‏אולי הצליחה למרות מודל גרוע.

---

# ‏152. Auction Attribution

‏מפרידים:

```text
Signal Quality
Auction Selection
Submission Timing
Order Type Choice
Price Constraint
Broker Execution
Post-Auction Path
```

---

# ‏153. No-Fill Attribution

‏`NO_FILL` אינו תמיד כשל.

‏אם limit מנע מחיר גרוע, ייתכן שהוא מילא את מטרתו.

---

# ‏154. Counterfactual MOO vs LOO

‏אפשר לשאול:

```text
what if MOO?
what if LOO with wider limit?
what if no trade?
```

‏אבל confidence של counterfactual מוגבל.

---

# ‏155. Counterfactual Close

‏אותו רעיון ל־MOC/LOC.

---

# ‏156. Benchmark Net Outcome

‏לא מספיק לבדוק Fill Price.

‏צריך לבדוק:

```text
net outcome
= subsequent move
- fees
- slippage
- missed-opportunity cost
```

---

# ‏157. Auction Fee Model

‏Fee schedule יכול להיות שונה לפי venue/order type/broker.

‏יש versioned Cost Engine.

---

# ‏158. Do Not Hard-Code Fees

‏בדיוק כמו cutoffs.

---

# ‏159. Auction Capacity

‏לכמות גדולה יותר יכולה להיות השפעה שונה על likelihood/price outcome.

‏גם אם Auction עמוק, אין להניח infinite capacity.

---

# ‏160. Participation Rate

```text
our_qty / expected_auction_volume
```

‏Metric חשוב למחקר Capacity.

---

# ‏161. Small Personal Robot

‏ברוב המקרים הכמות שלנו קטנה מאוד יחסית ל־large-cap auction volume.

‏אבל במניה דקה זה לא בהכרח נכון.

---

# ‏162. Price Discontinuity

‏Auction יכול ליצור jump לעומת continuous market.

‏זו תכונה של המנגנון, לא בהכרח data error.

---

# ‏163. Cross Timestamp

‏צריך לשמור timestamp של execution כפי שהתקבל מה־broker/exchange, לא להמציא `16:00:00.000` לכל symbol.

---

# ‏164. Delayed Open

‏חלק מהמניות יכולות להיפתח מאוחר יותר.

‏Scanner חייב להתמודד עם instrument-specific state.

---

# ‏165. Per-Symbol Session State

```text
NOT_OPEN
AUCTION_PENDING
OPEN
HALTED
CLOSED
```

---

# ‏166. Global Market State Is Insufficient

‏`market_is_open = true` אינו אומר שכל symbol פתוח למסחר רגיל.

---

# ‏167. Auction Order Lifecycle

```text
CREATED
RISK_APPROVED
SUBMITTING
ACKNOWLEDGED
AUCTION_QUEUED
LOCKED_OR_RESTRICTED
CROSSED
PARTIALLY_FILLED
FILLED
CANCELLED
REJECTED
UNKNOWN
```

---

# ‏168. State Semantics Must Come From Broker Events

‏לא מטיימר מקומי בלבד.

---

# ‏169. Internal Deadline Timer

‏טיימר עדיין שימושי כדי לחסום submit חדש בזמן.

---

# ‏170. Auction Queue Is Not Continuous Queue

‏אין להשתמש אוטומטית במודל Queue Position של שלב 38 כאילו הוא חל באותה צורה.

---

# ‏171. Priority Rules Differ

‏Auction matching priority יכולה להיות שונה מ־continuous price-time priority.

---

# ‏172. Order Type Priority

‏חלק מה־Auction systems נותנים treatment שונה לסוגי interest שונים.

‏צריך ללמוד את venue rules.

---

# ‏173. Hidden/Reserve Interaction

‏גם Reserve/undisplayed interest יכול להשתתף לפי כללי venue מסוימים.

‏זה מתקשר לשלב 40.

---

# ‏174. Auction Routing

‏Order שרוצה להשתתף ב־primary auction חייב להגיע למסלול הנכון.

‏Smart routing רגיל לא בהכרח equivalent.

---

# ‏175. Primary Venue Awareness

‏Execution Policy צריכה לדעת מה primary listing venue.

---

# ‏176. Broker Smart Logic

‏אם broker מספק synthetic auction behavior, צריך להבין אם זו פקודת venue-native או abstraction שלו.

---

# ‏177. Native vs Synthetic

‏שומרים metadata:

```text
execution_mechanism = NATIVE_AUCTION | BROKER_SYNTHETIC
```

---

# ‏178. Reproducibility

‏כל backtest run צריך לשמור את גרסת auction rules ששימשה אותו.

---

# ‏179. Rule Version

```text
auction_rules_version
```

‏חשוב כי exchanges משנים cutoffs וכללים.

---

# ‏180. Market Calendar Version

‏גם schedule data צריך versioning.

---

# ‏181. Provider Version

‏אם imbalance schema משתנה, צריך לדעת באיזה decoder השתמשנו.

---

# ‏182. Decision Record

```text
AuctionDecisionRecord
- decision_id
- as_of_time
- symbol
- venue
- auction_type
- features
- imbalance_snapshot
- time_to_cutoff
- order_intent
- risk_result
- reason_codes
```

---

# ‏183. Replay

‏Auction replay צריך לשחזר את sequence של imbalance updates, deadlines ו־broker events.

---

# ‏184. Same Strategy Core

‏Replay/Shadow/Paper/Live צריכים להשתמש באותו Auction Decision Engine ככל האפשר.

---

# ‏185. Shadow Auction

‏לפני Orders אמיתיים אפשר להריץ decisions בזמן אמת בלי submit.

---

# ‏186. Shadow Metrics

‏לשמור:

- ‏hypothetical order type.
- ‏decision time.
- ‏indicative price.
- ‏official auction outcome.
- ‏post-auction path.

---

# ‏187. Paper Limitations

‏Paper broker יכול לדמות Auctions באופן שונה מהשוק האמיתי.

‏אסור להניח parity.

---

# ‏188. Live Canary

‏אם אי פעם בוחנים Auction execution אמיתי, מתחילים בגודל קטן ומוגבל לאחר validation מתאים.

---

# ‏189. Promotion Gate

‏Auction feature אינו נכנס ל־Live רק כי backtest נראה טוב.

‏נדרש:

```text
historical validation
replay
shadow
paper where meaningful
small controlled live
```

---

# ‏190. Research Baseline

‏Baseline טוב:

```text
NO AUCTION SPECIAL LOGIC
```

‏ואז לבדוק אם Auction-aware strategy מוסיפה ערך.

---

# ‏191. Simple Challenger

‏למשל:

```text
avoid first N seconds after open
```

‏מול:

```text
auction-aware entry
```

‏אבל כל hypothesis נבדקת בנפרד.

---

# ‏192. Do Not Optimize Everything At Once

‏לא מכוונים יחד:

- ‏imbalance threshold.
- ‏time window.
- ‏limit offset.
- ‏minimum paired quantity.
- ‏post-open hold time.

‏בלי experiment discipline.

---

# ‏193. Multiple Testing

‏Auction data עשיר מאוד ב־features ולכן מסוכן ל־overfitting.

---

# ‏194. Robust Regions

‏מחפשים אזור parameters יציב, לא נקודת קסם.

---

# ‏195. Walk-Forward

‏Auction behavior יכול להשתנות לאורך זמן, ולכן chronological validation חשובה.

---

# ‏196. Day Clustering

‏אותו יום מייצר הרבה symbols עם shared market context.

‏לא מתייחסים אליהם תמיד כ־IID samples.

---

# ‏197. Event Clustering

‏Index rebalance או macro event יכולים ליצור cluster של outcomes.

---

# ‏198. Cross-Sectional Leakage

‏Ranking בזמן Auction חייב להשתמש רק ב־snapshots זמינים באותו as-of time.

---

# ‏199. Whole-Market Snapshot Consistency

‏אם Symbol A נמדד ב־15:59:50 ו־Symbol B ב־15:59:56, comparison אינו באמת synchronous.

---

# ‏200. Snapshot Watermark

‏אפשר להשתמש ב־watermark כדי להגדיר אילו symbols טריים מספיק להשוואה.

---

# ‏201. Fresh Coverage Gate

```text
if freshAuctionCoverage < threshold:
    NO_TRADE
```

---

# ‏202. Top1 Freshness

‏גם אם coverage כללי טוב, candidate הסופי חייב להיות טרי.

---

# ‏203. Broker Readiness Gate

‏ה־broker צריך להיות `READY`, לא רק connected.

---

# ‏204. Auction Capability Gate

‏יש לאמת order type/cutoff/venue support לפני Risk Approval סופי.

---

# ‏205. Risk Recheck

‏מיד לפני submit:

- ‏position.
- ‏working orders.
- ‏buying power.
- ‏safety state.
- ‏time remaining.

---

# ‏206. Stale Intent

‏אם OrderIntent נוצר לפני 2 שניות אבל imbalance השתנה דרמטית, ייתכן שצריך לבטל את הכוונה לפני submit.

---

# ‏207. Signal TTL Near Auction

‏TTL צריך להיות מותאם לדינמיקה של ה־Auction.

---

# ‏208. Auction Intent Epoch

‏אפשר לקשור Intent ל־snapshot/version של auction state.

---

# ‏209. Pre-Submit Divergence Check

‏אם indicative price התרחק מעבר לסף, Intent נפסל.

---

# ‏210. Limit Recalculation

‏אם policy מאפשר, Limit יכול להיגזר מחדש — אבל רק לפני window שבו modification מותרת.

---

# ‏211. No Chase Rule

‏Auction אינו תירוץ להזיז Limit שוב ושוב בלי edge budget.

---

# ‏212. Edge Budget

```text
remaining_edge =
    expected_move
    - expected_costs
    - price_concession
    - uncertainty_buffer
```

---

# ‏213. Auction Uncertainty Buffer

‏בגלל שינוי indicative price ו־late order flow, אפשר להחזיק margin נוסף במחקר.

---

# ‏214. Auction `NO TRADE` Reasons

‏לשמור כל reason code כדי לנתח missed opportunities.

---

# ‏215. Rejected Candidate Ledger

‏גם candidates שלא נשלחו חשובים למחקר.

---

# ‏216. Missed Opportunity Analysis

‏בודקים מה קרה ל־symbols שנחסמו בגלל stale data, cutoff או limit protection.

---

# ‏217. False Safety Cost

‏Safety מחמיר מדי יכול לפספס הזדמנויות.

‏אבל זה נמדד, לא מבוטל אינטואיטיבית.

---

# ‏218. False Aggression Cost

‏Policy אגרסיבית מדי יכולה לקבל executions גרועים.

---

# ‏219. Auction Cost Attribution

‏להפריד:

- ‏broker fees.
- ‏venue fees.
- ‏slippage vs decision reference.
- ‏post-auction adverse move.
- ‏missed fill opportunity.

---

# ‏220. Net Auction Edge

```text
net_auction_edge =
    post_fill_outcome
    - explicit_costs
    - implicit_costs
```

---

# ‏221. Short-Horizon Labels

‏לרובוט שלנו אפשר למדוד אחרי Opening Auction:

```text
1s
2s
5s
10s
30s
60s
```

---

# ‏222. MFE / MAE

‏גם כאן שומרים path, לא רק end return.

---

# ‏223. Time to First Profit

‏רלוונטי במיוחד ל־opening signal קצר.

---

# ‏224. Time to Target

‏אותו דבר.

---

# ‏225. Opening Auction RCA

‏אם Rank #1 נכשל מיד אחרי open:

‏בודקים:

- ‏auction signal.
- ‏indicative evolution.
- ‏official open.
- ‏spread after open.
- ‏execution.
- ‏post-open reversal.

---

# ‏226. Closing Auction RCA

‏אם ה־goal היה exit ב־Close:

‏בודקים:

- ‏decision reference.
- ‏MOC/LOC choice.
- ‏cutoff timing.
- ‏auction price.
- ‏fees.
- ‏whether limit protected or harmed.

---

# ‏227. Imbalance Data Quality RCA

‏פערים ב־feed צריכים להיות failure class נפרד.

---

# ‏228. Clock RCA

‏Missed cutoff בגלל clock skew הוא operational bug, לא market bad luck.

---

# ‏229. Broker RCA

‏Reject בגלל unsupported order type הוא capability/config failure.

---

# ‏230. Human Override

‏Manual action ליד cutoff חייב להיות מתועד עם timestamp ו־operator reason.

---

# ‏231. Auditability

‏צריך להיות אפשר לענות:

> ‏למה שלחנו `LOC` למניה הזאת, במחיר הזה, בשעה הזאת?

---

# ‏232. Monitoring Metrics

```text
auction_feed_age_ms
time_to_cutoff_ms
time_to_cross_ms
paired_qty
imbalance_qty
indicative_price_drift
auction_orders_pending
auction_rejects
missed_cutoffs
```

---

# ‏233. Alerts

‏דוגמאות:

- ‏Auction feed stale.
- ‏Clock skew high.
- ‏Broker not ready near cutoff.
- ‏Pending order unknown.
- ‏Unexpected no-fill.

---

# ‏234. High Cardinality

‏לא שמים ticker כ־label בלתי מוגבל בכל metric אם זה יוצר cardinality explosion.

‏פרטי symbol נשמרים ב־logs/traces.

---

# ‏235. Auction Dashboard

‏Dashboard אופרטיבי יכול להראות:

- ‏system state.
- ‏exchange session state.
- ‏fresh coverage.
- ‏top candidates.
- ‏time remaining.
- ‏working auction orders.
- ‏positions.

---

# ‏236. Golden Scenario — Normal Open

‏Replay של יום רגיל עם Opening Auction תקין.

---

# ‏237. Golden Scenario — Imbalance Flip

‏Buy imbalance הופך ל־Sell imbalance סמוך ל־cutoff.

---

# ‏238. Golden Scenario — Stale Feed

‏Imbalance feed מפסיק להתעדכן 20 שניות לפני decision deadline.

---

# ‏239. Golden Scenario — Late Ack

‏Order נשלח בזמן אך ACK מגיע אחרי cutoff.

---

# ‏240. Golden Scenario — Disconnect

‏Broker disconnect לאחר submit ולפני Cross.

---

# ‏241. Golden Scenario — Partial Fill

‏Auction execution חלקי בלבד.

---

# ‏242. Golden Scenario — Rejected Limit

‏Order נדחה בגלל rule/capability mismatch.

---

# ‏243. Golden Scenario — Delayed Open

‏המניה לא נפתחת בדיוק ב־`09:30`.

---

# ‏244. Golden Scenario — Early Close

‏Market calendar מציג close מוקדם.

---

# ‏245. Golden Scenario — Restart After Cross

‏Process חוזר ומגלה Position שלא ידע עליו.

---

# ‏246. Invariant — No New Auction Order After Internal Cutoff

‏כל submit מאוחר נחסם.

---

# ‏247. Invariant — No Duplicate Auction Exposure

‏אותו Intent לא יוצר exposure כפול.

---

# ‏248. Invariant — Unknown Means No Blind Retry

‏אם state לא ידוע, reconcile.

---

# ‏249. Invariant — No Trading on Stale Auction Data

‏לפי policy מוגדרת מראש.

---

# ‏250. Invariant — Position Truth After Cross

‏לפני cycle חדש, position מאומת מול broker.

---

# ‏251. מה רלוונטי במיוחד לרובוט שלנו

‏הרובוט שלנו מחפש תנועה של שניות.

‏לכן Opening Auction עשוי להיות מעניין למחקר, אבל הוא גם regime מסוכן למודל שנלמד בעיקר על continuous trading.

---

# ‏252. Baseline לרובוט שלנו

‏בגרסה הראשונה:

```text
Auction participation = disabled
Opening transition = separate regime
Closing transition = separate regime
```

‏ורק לאחר איסוף evidence נבדוק participation ממשי.

---

# ‏253. למה Baseline שמרני

‏כי אנחנו עדיין רוצים להוכיח את ה־core edge של ה־Scanner.

‏אין טעם להוסיף Auction complexity לפני שיש evidence שהמידע הזה מוסיף ערך.

---

# ‏254. Opening Research Mode

‏ב־Shadow אפשר לשמור:

- ‏imbalance snapshots.
- ‏indicative prices.
- ‏official open.
- ‏post-open 1/2/5/10/30/60s returns.

---

# ‏255. Closing Research Mode

‏אפשר לשמור:

- ‏closing imbalance evolution.
- ‏indicative close.
- ‏official close.
- ‏pre-close spread/liquidity.

---

# ‏256. Future Challenger

‏רק אם הנתונים יראו value:

```text
AuctionAwareStrategy
```

‏תהפוך Challenger מול baseline שלא משתתף.

---

# ‏257. Do Not Mix With Main Score Prematurely

‏Auction features צריכים לעבור validation נפרד לפני שהם משפיעים על ranking הראשי.

---

# ‏258. Separate Feature Family

```text
AuctionFeatureFamily
```

‏עם version ו־ablation נפרדים.

---

# ‏259. Separate Execution Policy

```text
AuctionExecutionPolicy
```

‏נפרדת מ־continuous execution tactics של שלב 37.

---

# ‏260. Separate Cost Model

‏אם נשתתף בפועל, צריך למדוד Auction costs בנפרד.

---

# ‏261. Separate Regime Metrics

‏לא מערבבים Opening Auction performance עם Midday performance.

---

# ‏262. Practitioner Rule

> ‏אם אינך יודע מה ה־cutoff, אם הפקודה ניתנת לביטול, איזה venue מנהל את ה־Auction ומהו ה־source של imbalance — אינך מוכן לשלוח Auction Order אוטומטי.

---

# ‏263. עוד כלל מקצועי

> ‏`Imbalance` הוא מידע על matching pressure בתוך Auction, לא נבואה על הכיוון הבא של המחיר.

---

# ‏264. עוד כלל מקצועי

> ‏מחיר Official Open/Close הוא outcome של מנגנון Matching; הוא לא בהכרח המחיר שניתן היה לחזות רגע קודם.

---

# ‏265. עוד כלל מקצועי

> ‏Cutoff הוא חלק מ־Risk Management. Order שלא ניתן לבטל אחרי freeze הוא exposure מחויב יותר מ־Order רגיל.

---

# ‏266. עוד כלל מקצועי

> ‏Auction rules צריכים להיות Configuration/Capabilities עם version, לא constants בתוך Strategy.

---

# ‏267. Checklist לפני מחקר Auction

- ‏האם יש historical imbalance snapshots point-in-time?
- ‏האם timestamps אמינים?
- ‏האם venue/listing ידוע?
- ‏האם official open/close נשמר?
- ‏האם market calendar versioned?
- ‏האם cutoffs ידועים לפי venue?
- ‏האם ניתן לשחזר decision time אמיתי?

---

# ‏268. Checklist לפני Shadow

- ‏Auction feed live וטרי.
- ‏Clock sync תקין.
- ‏Capabilities נטענו.
- ‏No real orders.
- ‏Decision records נשמרים.
- ‏Post-auction labels מחושבים.

---

# ‏269. Checklist לפני Paper

- ‏ברור מה Paper broker באמת מדמה.
- ‏אין assumption ש־Paper fill שווה Live fill.
- ‏cutoff/reject behavior נבדק.
- ‏reconciliation נבדק.

---

# ‏270. Checklist לפני Live

- ‏Historical evidence.
- ‏Replay evidence.
- ‏Shadow evidence.
- ‏Capability validation.
- ‏Risk limits.
- ‏Kill switch.
- ‏Recovery tested.
- ‏Small controlled exposure.

---

# ‏271. ידע שחייבים לזכור

1. ‏Auction שונה מהמסחר הרציף.
2. ‏`MOO/MOC` נותנים execution-at-auction עם פחות price protection.
3. ‏`LOO/LOC` מוסיפים limit אבל יכולים לא להתבצע.
4. ‏Imbalance data משתנה בזמן.
5. ‏Cutoffs הם venue-specific.
6. ‏Cancellation יכולה להיחסם לפני Cross.
7. ‏Opening/Closing הם regimes נפרדים.
8. ‏Backtest חייב להיות point-in-time.
9. ‏Broker cutoff יכול להיות מוקדם מה־exchange cutoff.
10. ‏`NO TRADE` הוא outcome תקין.

---

# ‏272. מה חשוב להבין, גם אם לא זוכרים בעל פה

- ‏מנגנוני price determination מדויקים של כל venue.
- ‏כללי late order handling.
- ‏auction collars.
- ‏Imbalance-only order semantics.
- ‏D Orders / Closing Offset Orders ומבנים venue-specific אחרים.
- ‏Feed schemas ספציפיים.

---

# ‏273. Architecture Baseline

```text
Exchange Calendar
        ↓
Auction Capability Registry
        ↓
Auction Data Adapter
        ↓
Canonical Auction Snapshot
        ↓
Auction Feature Engine
        ↓
Auction Decision Engine
        ↓
Risk Engine
        ↓
Auction Order Intent
        ↓
Execution Broker
        ↓
Auction Order / Fill Events
        ↓
Reconciliation + RCA
```

---

# ‏274. Baseline Policy לרובוט שלנו

```text
if regime is auction-related:
    collect data
    calculate diagnostics
    do not submit auction order by default
```

‏רק Challenger מוכח יכול לשנות זאת בעתיד.

---

# ‏275. מסקנת הפרק

‏Opening ו־Closing Auctions הם שווקים קטנים בתוך השוק: יש להם זמן, Orders, Data, Priorities ו־Price Discovery משלהם.

‏מערכת מקצועית אינה מקודדת “9:30” ו־“16:00” ומניחה שסיימה.

‏היא יודעת:

```text
which venue
which auction
which rules version
which cutoff
which data snapshot
which order type
which risk state
which broker capability
```

‏ורק אז מחליטה אם בכלל מותר לה להשתתף.

---

# ‏מקורות רשמיים שנבדקו באוקטובר 2026

- ‏Nasdaq Trader — Opening and Closing Crosses: `https://www.nasdaqtrader.com/Trader.aspx?id=OpenClose`
- ‏Nasdaq Trader — Opening/Closing Cross FAQ: `https://www.nasdaqtrader.com/content/productsservices/trading/crosses/openclose_faqs.pdf`
- ‏NYSE — Auctions: `https://www.nyse.com/trade/auctions`
- ‏NYSE — Opening and Closing Auctions Fact Sheet: `https://www.nyse.com/publicdocs/nyse/markets/nyse/NYSE_Opening_and_Closing_Auctions_Fact_Sheet.pdf`

---

# ‏השלב הבא

‏שלב 43 יעסוק ב־`Halts`, ‏`LULD` ו־`Fast Markets`: מה קורה כאשר המסחר נעצר, איך חוזרים ממנו, כיצד volatility pauses משפיעים על orders ו־state, ואיך רובוט צריך להבדיל בין “אין מחיר חדש” לבין “המסחר כרגע אסור או מוגבל”.
