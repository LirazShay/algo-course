# ‏04 — Recommendation Sheet: Order Types and Execution Tactics

> ‏מקור לימודי עיקרי: `../04-ORDER-TYPES-FOR-PERSONAL-ALGO.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מעשי לבחירת Order Type וטקטיקת Execution עבור רובוט `Short-Horizon Momentum` אישי, בלי להניח שפקודה אחת נכונה לכל Signal ובלי להפוך capability של Broker/Venue לעובדה קבועה.

---

## ‏1. Decision

‏איזו משפחת פקודות צריכה להיות ברירת המחדל בגרסה הראשונה, מתי להיות פסיביים, מתי אגרסיביים, מתי להשתמש ב־`IOC`, ואילו סוגים מתקדמים נשארים Challengers עד שיש Evidence?

---

## ‏2. Recommended Default

### ‏`P0 — Required Before Live Risk`: אין Order בלי Price/Time/State Contract

‏לפני שליחת כל Order חייבים לדעת במפורש:

```text
side
requested_qty
order_type
limit/stop price when relevant
time_in_force
session
routing mode
signal expiry / order lifetime
cancel policy
partial-fill policy
exit policy
```

‏אסור לשלוח Order כאשר חלק מה־contract אינו ידוע ולהשלים אותו בדיעבד.

### ‏`P1 — Preferred Default`: Price-capped execution כבסיס

‏בגרסה הראשונה, רוב כניסות/יציאות רגילות צריכות להיות מבוססות `Limit` ולא `Market` לא־מוגבלת.

‏הסיבה:

```text
small target edge
+ fast-moving price
+ spread/slippage sensitivity
=> explicit worst acceptable price is valuable
```

‏זה אינו אומר שכל Limit פסיבית. ה־Limit יכולה להיות Passive או Marketable לפי המחיר ביחס ל־book.

### ‏`P1 — Preferred Default`: `Marketable Limit` היא ברירת המחדל האגרסיבית

‏כאשר ה־Signal קצר וחשוב להיכנס עכשיו, אני ממליץ להתחיל מ־`Marketable Limit` עם cap מחושב ולא מ־`Market` טהורה.

‏ה־cap צריך להיגזר מ־execution feasibility:

```text
max_buy_price
or
min_sell_price
```

‏ולא להיות Offset שרירותי קבוע לכל symbol/regime.

### ‏`P1 — Preferred Default`: Passive Limit היא Challenger בסיסי, לא הנחת Fill

‏כאשר urgency נמוכה יותר, אפשר להצטרף ל־`Bid` בקנייה או ל־`Ask` במכירה לזמן קצר מאוד.

‏אבל:

```text
posted == true
price touched == true
```

‏אינם אומרים:

```text
filled == true
```

‏ה־baseline research חייב לטפל ב־queue uncertainty, missed opportunity ו־adverse selection.

### ‏`P1 — Preferred Default`: `IOC` כאשר ההזדמנות תקפה רק עכשיו

‏כאשר ה־Signal lifetime קצר והמערכת אינה רוצה resting order לאחר שה־edge התיישן:

```text
Marketable Limit + IOC
```

‏הוא Baseline רציני למחקר.

‏ההתנהגות הרצויה:

```text
fill what is executable now
cancel the remainder
re-evaluate from fresh state
```

‏לא:

```text
leave stale remainder working
```

### ‏`P1 — Preferred Default`: Expiry קצר מנוהל באפליקציה

‏לכניסות קצרות, `GTC` אינה ברירת המחדל.

‏המערכת עצמה צריכה לנהל TTL קצר:

```text
order_lifetime_ms / order_lifetime_s
```

‏ולבטל/להחליף רק לפי policy מפורשת.

### ‏`P0 — Required Before Live Risk`: Partial Fill הוא מצב רגיל

‏כל Policy חייב להגדיר מראש:

```text
minimum useful fill
whether partial position is accepted
when remainder is canceled
whether chase is allowed
how exit quantity is derived
```

‏Position size נגזר מ־fills בפועל בלבד.

### ‏`P0 — Required Before Live Risk`: Cancel אינו State סופי עד אישור

‏לאחר `cancel request`:

```text
order still may fill
```

‏לכן אסור לשלוח Order חלופית שמניחה שהקודמת נעלמה לפני reconciliation/confirmed terminal state.

### ‏`P1 — Preferred Default`: `Bracket/OCA` לבטיחות רק כשהסמנטיקה מאומתת

‏ל־Live baseline חשוב למנוע orphan exits ו־double exits.

‏אבל אין להניח ש־OCA/OCO מבטיחים ביטול אטומי בכל Venue/Broker path.

‏המערכת המקומית עדיין חייבת להיות נכונה גם אם Fill ו־Cancel חוצים זה את זה.

---

## ‏3. Why

### ‏Fact

‏`Market` נותנת עדיפות ל־execution certainty יחסית, לא ל־price certainty.

### ‏Fact

‏`Limit` מגדירה מחיר גרוע ביותר מקובל, אך אינה מבטיחה Fill.

### ‏Fact

‏`IOC` מאפשר Partial Fill מיידי וביטול היתרה; `FOK` דורשת בדרך כלל Full Fill מיידי או אפס, בכפוף ל־Venue/Broker implementation.

### ‏Fact

‏`Post Only`, ‏`Pegged`, ‏`Midpoint`, ‏`Reserve/Hidden`, ‏`Bracket/OCA` ו־Broker Algos תלויים מאוד ב־Venue/Broker/API ולעיתים הם `native`, לעיתים `simulated`, ולעיתים זמינים רק ב־routing mode מסוים.

### ‏Fact — verified 2026-10-26

‏`IBKR MidPrice` למניות/ETF אמריקאיים מוצג כיום כ־Smart-routed Algo שמנסה לבצע ב־NBBO midpoint או טוב יותר, עם optional price cap.

### ‏Fact — verified 2026-10-26

‏`IBKR Pegged-to-Midpoint` למניות אמריקאיות מתועד בנפרד כפקודה הדורשת Direct Routing; לכן `MidPrice` ו־`Pegged-to-Midpoint` אינם synonym תפעולי.

### ‏Fact — verified 2026-10-26

‏`IBKR OCA` מתועד כך שאין הבטחה ש־cancel/modify יגיע ל־Exchange לפני Order שכבר מתבצעת.

### ‏Fact — verified 2026-10-26

‏IBKR מציינת שבמקרים מסוימים היא מטפלת ב־Market Orders באמצעות simulated marketable-limit behavior לצורכי price-risk protection. לכן גם השם `Market` לבדו אינו מספיק כדי להבין את implementation path בפועל.

### ‏Judgment

‏במטרה שלנו — Edge קטן והחזקה של שניות — price cap מפורש עדיף כ־baseline על execution פתוח במחיר, אלא אם emergency/exit evidence מוכיח אחרת.

### ‏Hypothesis

‏`Marketable Limit + IOC` ייתן אצלנו trade-off טוב בין Fill probability לבין protection מפני price runaway עבור Signals קצרים.

‏זו Hypothesis בלבד ויש להשוות אותה ל־Passive, ‏MidPrice, ‏Adaptive ו־Marketable Limit ללא IOC.

---

## ‏4. Use When

‏ה־Baseline מתאים במיוחד כאשר:

- ‏Signal lifetime הוא milliseconds/seconds/tens of seconds.
- ‏Gross target קטן יחסית ל־spread/slippage.
- ‏ה־order size קטן יחסית לנזילות הזמינה.
- ‏המערכת צריכה להחליט מהר אך לשמור price bound.
- ‏עדיין אין telemetry שמצדיק Venue-specific execution.
- ‏רוצים baseline פשוט שניתן ל־replay ול־backtest בצורה עקבית.

---

## ‏5. Do Not Use When

‏אין להעתיק את ה־Baseline כמו שהוא כאשר:

- ‏ה־use case הוא emergency liquidation שבו certainty of exit חשובה יותר מ־price cap.
- ‏האסטרטגיה היא auction-specific.
- ‏ה־Venue/Order capability דורש semantics שונים.
- ‏ה־order size גדול מספיק כדי לדרוש execution algo ארוך/impact-aware.
- ‏המחקר הוכיח שהמתנה פסיבית/אמצע Spread משפרת Net Edge בצורה עקבית.
- ‏הברוקר/חשבון/API בפועל אינם תומכים ב־Order Type או ב־TIF שנבחרו.

---

## ‏6. Recommendation Matrix — Core Orders

| Order / Tactic | What it does | Main advantage | Main hidden cost / risk | Baseline recommendation |
|---|---|---|---|---|
| `Market` | ‏מבקש ביצוע מיידי ללא Limit מפורש מצד המשתמש | ‏Fill probability/urgency | ‏מחיר לא ודאי, slippage, broker simulation/venue protections | `Avoid initially` לכניסה רגילה; לשקול emergency exit בלבד עם Evidence |
| `Limit` | ‏מגדיר worst acceptable price | ‏Price protection | ‏No fill / queue / stale resting order | `Preferred Default` |
| `Marketable Limit` | ‏Limit שחוצה/נוגע בצד השני ולכן יכולה לבצע מיד | ‏מהירות + price cap | ‏משלם spread/consumes depth; cap יכול להיות רחב מדי | `Preferred Default` אגרסיבי |
| Passive `Limit` | ‏מצטרף לצד שלך וממתין | ‏חיסכון spread / maker economics אפשריים | ‏Missed move, queue uncertainty, adverse selection | `Challenger / baseline passive mode` |
| `IOC` | ‏מבצע מיד מה שאפשר ומבטל remainder | ‏מונע stale remainder | ‏Partial fill / missed quantity | `Preferred Default` ל־short-lived opportunity כאשר מתאים |
| `FOK` | ‏Full fill מיד או אפס | ‏אין partial position | ‏Reject/no-fill גבוה; implementation-specific | `Avoid initially` אלא אם full-size atomicity נדרשת |
| `AON` | ‏מנסה למנוע partial fill | ‏Position atomicity | ‏Support/simulation complexity ו־fill probability נמוך | `Avoid initially` |
| `GTC` | ‏Order נשארת לאורך זמן | ‏Persistence | ‏Signal הופך stale; hidden state | `Avoid initially` לכניסות קצרות |
| `GTD` | ‏Order פגה בזמן מוגדר | ‏Explicit expiry | ‏עדיין גס לעומת TTL של milliseconds/seconds | `Specialist` |

---

## ‏7. Recommendation Matrix — Advanced Price/Liquidity Orders

| Order / Tactic | Problem it solves | Queue / fill implication | Main risk | Recommendation |
|---|---|---|---|---|
| `Post Only` | ‏מונע/מצמצם לקיחת liquidity לפי Venue semantics | ‏נכנס כ־maker אם מתקבל | ‏reprice/cancel behavior שונה לפי Venue; missed move | `P3 Challenger` |
| `Pegged to Primary / Relative` | ‏עוקב אחרי same-side reference | ‏יכול לשמור competitiveness בלי manual replace | ‏repricing rules, queue priority, venue/provider quirks | `P3 Challenger` |
| `Midpoint Peg` | ‏מנסה midpoint execution | ‏לרוב non-displayed/venue-specific | ‏low fill probability / direct-route requirements | `P3 Challenger` |
| `IBKR MidPrice` | ‏Smart-routed attempt ל־midpoint or better עם optional cap | ‏broker chooses execution path | ‏waiting cost / signal decay / provider-specific | `P2 Challenger` |
| `Hidden` | ‏מסתיר displayed intent | ‏פחות displayed priority במקומות מסוימים | ‏פחות queue priority; complexity | `P4 Specialist` |
| `Reserve / Iceberg` | ‏מציג חלק מהכמות | ‏מקטין displayed size | ‏לא רלוונטי לרוב order size קטן; implementation-specific | `P4 Specialist` |
| `Minimum Quantity` | ‏מונע fills זעירים | ‏מפחית fragments | ‏מוריד fill probability; support-specific | `P3 Challenger` |
| `Market-to-Limit` | ‏מתחיל אגרסיבי ואז remainder הופך Limit | ‏שומר remainder במחיר fill הראשון | ‏semantics/provider-specific; queue reset | `P3 Challenger` |
| Sweep-style execution | ‏לוקח liquidity בכמה levels | ‏Fill מהיר יותר | ‏depth slippage / edge destruction | `Avoid initially` |

---

## ‏8. Recommendation Matrix — Stops and Exit Orders

| Type | Main advantage | Main hidden cost | Recommendation |
|---|---|---|---|
| `Stop Market` | ‏עדיפות ליציאה לאחר trigger | ‏fill price יכול להיות גרוע משמעותית | `P2 Safety Challenger`; לא להניח stop price = fill price |
| `Stop Limit` | ‏price protection לאחר trigger | ‏יכול לא לצאת בזמן מהלך מהיר | `P3 Specialist`; מסוכן אם certainty of exit קריטית |
| `Trailing Stop` | ‏עוקב אחרי favorable move | ‏רעש קצר יכול להפעיל אותו | `P3 Challenger` בלבד לאחר replay/OOS |
| `Trailing Stop Limit` | ‏trail + price cap | ‏שילוב של trigger noise ו־no-fill risk | `P4 Specialist` |
| `Bracket` | ‏מגדיר exits סביב position | ‏race/transmit/partial-fill complexity | `P1/P2 Safety mechanism` לאחר אימות API semantics |
| `OCA/OCO` | ‏מנסה לבטל sibling exits | ‏cancel race אינו אטומי בהכרח | `P1/P2 Safety mechanism` עם local reconciliation |

‏ל־Baseline המיידי איני ממליץ לבנות exit logic רק על Broker Stop/Bracket.

‏המערכת צריכה גם local position/risk state אמין, כי Strategy Exit יכול להיות signal/time-based ולא רק price trigger.

---

## ‏9. Recommendation Matrix — Routing and Broker Algos

| Tactic | Advantage | Risk / mismatch | Recommendation |
|---|---|---|---|
| `SMART` routing | ‏פשטות וניצול router של הברוקר | ‏פחות control/visibility | `P1 Preferred Default` |
| Direct Routing | ‏שליטה ב־Venue/order semantics | ‏venue complexity / queue / fees / failures | `P3 Challenger` |
| `Adaptive` | ‏broker algo לאיזון price/fill | ‏latency/decision process עלול להיות איטי מדי ל־signal | `P3 Challenger` |
| `TWAP/VWAP/POV` | ‏impact-aware execution לאורך זמן | ‏אופק ביצוע ארוך מה־holding horizon שלנו | `Avoid initially` |
| Arrival-price style | ‏מאזן urgency ו־impact | ‏מיועד יותר execution block גדול | `P4 Specialist` |
| Accumulate/Distribute / Dark Ice | ‏מסתיר/מפצל size גדול | ‏מורכבות לא מוצדקת לסכום קטן | `Avoid initially` |

---

## ‏10. Execution Modes מומלצים למחקר

‏במקום לחפש “Order Type מנצח”, להגדיר שלושה Modes מדידים:

### ‏Mode A — Passive

```text
passive_limit
short TTL
cancel if no fill
never infer fill from price touch
```

### ‏Mode B — Balanced

```text
midpoint / improved limit / MidPrice challenger
very short wait
cancel or escalate according to explicit policy
```

### ‏Mode C — Aggressive

```text
marketable_limit
optional IOC
strict price cap
```

‏ה־Signal/Regime יכול בעתיד לבחור Mode, אבל רק אחרי Evidence.

---

## ‏11. What I Would Avoid Initially

### ‏`Avoid initially`: Unbounded Market Entry

‏לא להשתמש ב־`Market` רגילה לכניסה רק משום שה־Score גבוה.

### ‏`Avoid initially`: 100 Order Types

‏הגרסה הראשונה צריכה להישאר עם surface קטן:

```text
Limit
Marketable Limit
Passive Limit
IOC
Cancel
Replace only when justified
Bracket/OCA safety
```

### ‏`Avoid initially`: Continuous Cancel/Replace Chase

‏Policy שמזיזה מחיר בכל market update יכולה:

- ‏לאבד queue priority.
- ‏ליצור cancel races.
- ‏להגדיל rejects/rate limits.
- ‏לרדוף אחרי signal שכבר נגמר.

### ‏`Avoid initially`: Direct Routing Optimization

‏אין לבחור Venue על בסיס fee/rebate בלבד.

### ‏`Avoid initially`: Long-horizon broker algos

‏`TWAP/VWAP/POV/Accumulate-Distribute` אינם מותאמים ל־seconds-level holding horizon שלנו כ־default.

### ‏`Avoid entirely`: Assuming Order Name Defines Behavior

‏Order Type חייב להיבדק יחד עם:

```text
broker
API
routing mode
venue
session
native/simulated behavior
```

---

## ‏12. What to Add Later

‏לאחר Baseline מדוד:

1. ‏`MidPrice` מול aggressive/passive baseline.
2. ‏`Post Only` במקומות שבהם semantics מאומתים.
3. ‏Pegged/Relative orders.
4. ‏Direct Routing per Venue.
5. ‏Adaptive Algo.
6. ‏Minimum Quantity.
7. ‏Market-to-Limit.
8. ‏Session-specific order policies.
9. ‏Auction orders (`MOO/LOO/MOC/LOC`) אם מחקר ייעודי מצדיק.
10. ‏Stop/trailing variants לפי exit research.
11. ‏Dynamic urgency policy.

---

## ‏13. Required Data / Evidence

‏לכל Order attempt יש לשמור לפחות:

```text
internal_order_id
broker_order_id
symbol
side
signal_id / strategy_version
urgency_mode
requested_qty
order_type
limit_price
stop_price
time_in_force
session
routing mode
venue when known
native/simulated when known
quote at decision
quote at submit
quote timestamps
created_at
sent_at
acknowledged_at
first_fill_at
last_fill_at
completed_at
cancel_requested_at
cancel_confirmed_at
requested_qty
filled_qty
remaining_qty
fill prices
average_fill_price
status transitions
reject reason
fees
reference mid
post-fill markout 1s/5s/10s
no-fill future move
```

‏בלי `no-fill future move` מחקר Passive מוטה לטובת העסקאות שכן התמלאו.

---

## ‏14. Promotion Criteria

### ‏לקידום `MidPrice` / Midpoint / Pegged

‏נדרוש:

- ‏שיפור ב־realized net execution cost.
- ‏Fill probability מספקת.
- ‏Signal decay בזמן ההמתנה אינו מוחק את השיפור במחיר.
- ‏markout אינו מחמיר.
- ‏התוצאה שורדת OOS ו־forward validation.

### ‏לקידום Passive Mode כברירת מחדל

‏נדרוש:

- ‏Net result על כל opportunities, לא רק fills.
- ‏missed-move cost נמוך מה־spread savings.
- ‏adverse selection נשלט.
- ‏queue/fill model ריאליסטי.

### ‏לקידום Direct Routing

‏נדרוש שיפור עקבי מעבר ל־SMART לאחר:

```text
fees
rebates
fill probability
latency
slippage
markout
operational failures
```

### ‏לקידום Broker Algo

‏נדרוש שה־algo מסיים את הביצוע בתוך horizon שמתאים ל־Signal ושומר/משפר `Net Edge`.

---

## ‏15. Rejection Criteria

‏נזנח Order/Tactic אם:

- ‏היא משפרת fill price אך מורידה Net outcome בגלל missed moves.
- ‏היא משפרת Fill Rate אך משלמת spread/slippage מעבר ל־edge.
- ‏השיפור נעלם OOS.
- ‏היא תלויה ב־fills לא־ריאליסטיים ב־backtest.
- ‏היא מגדילה cancel/reject/race incidents באופן לא סביר.
- ‏היא דורשת Broker/Venue assumptions שאין לנו דרך לאמת.
- ‏היא מוסיפה complexity ללא improvement מהותי.

---

## ‏16. Metrics

### ‏Primary

- ‏`Realized net edge per opportunity`.
- ‏`Net PnL after all execution costs`.
- ‏`Fill probability`.
- ‏`Opportunity capture rate`.

### ‏Execution

- ‏Time to first fill.
- ‏Time to full fill.
- ‏Partial-fill rate.
- ‏Cancel rate.
- ‏Reject rate.
- ‏Slippage vs decision mid / ask / bid.
- ‏Effective spread paid/captured.
- ‏Price improvement.
- ‏Post-fill markout.
- ‏No-fill future move.
- ‏Adverse-selection rate.

### ‏Operational

- ‏Cancel-race incidents.
- ‏Duplicate/order-state reconciliation incidents.
- ‏Order stuck beyond TTL.
- ‏Unexpected native/simulated behavior.
- ‏Unsupported order/session errors.

---

## ‏17. Failure Modes

### ‏Market order consumes unexpected depth

‏ה־Signal היה נכון אך הכניסה מחקה את ה־edge.

### ‏Limit rests after signal expiry

‏Fill מאוחר יוצר trade שאין לו עוד research justification.

### ‏Passive fill assumed from price touch

‏Backtest מנפח ביצועים שלא היו מתקבלים בגלל queue.

### ‏Cancel/replace race

‏ה־old order מתמלא בזמן שהמערכת כבר מתנהגת כאילו הוחלפה.

### ‏Partial fill mishandled

‏ה־risk/exit quantity אינה תואמת position בפועל.

### ‏OCA sibling executes before cancel reaches venue

‏נוצר oversell/reversal אם local state אינו מגן.

### ‏Price cap too wide

‏`Marketable Limit` הופכת מעשית ל־market-like execution ומוחקת edge.

### ‏Price cap too tight

‏Fill probability נופלת והמערכת מפספסת רוב ההזדמנויות.

### ‏Advanced order waits too long

‏Midpoint/Adaptive משפר price אך ה־Signal מתיישן לפני Fill.

### ‏Provider capability silently changes

‏Order שהיה supported/simulated בצורה מסוימת משנה semantics והקוד ממשיך ללא revalidation.

---

## ‏18. User-Specific Application

‏עבור הרובוט שלנו:

```text
Signal
→ urgency classification
→ fresh execution recheck
→ choose execution mode
→ compute price cap
→ submit
→ observe real state/fills
→ cancel/stop/escalate only by policy
→ manage actual filled position
→ measure net result
```

‏Baseline מוצע למחקר ראשון:

```text
LOW urgency
→ Passive Limit, very short TTL

MEDIUM urgency
→ Improved Limit / MidPrice challenger

HIGH urgency
→ Marketable Limit, optionally IOC

UNKNOWN / stale / invalid execution state
→ NO TRADE
```

‏זו אינה אסטרטגיית רווח מוכחת. זו מסגרת Experiment מסודרת לבדיקת price-versus-fill trade-off.

---

## ‏19. Confidence

### ‏High

‏ביחס ל־:

- ‏Limit כ־price protection.
- ‏Marketable Limit כדרך לקבל aggressiveness עם cap.
- ‏IOC כדרך למנוע stale remainder.
- ‏Partial Fill / Cancel race / Reject כמצבים רגילים שיש לנהל.
- ‏הצורך למדוד no-fill opportunity cost.
- ‏הצורך להפריד Signal quality מ־Execution quality.

### ‏Medium

‏ביחס ל־`Marketable Limit + IOC` כברירת המחדל האגרסיבית הטובה ביותר עבורנו.

‏היא צריכה לנצח בפועל חלופות Passive/MidPrice/Adaptive על `Net Edge`.

### ‏Low / Evidence Required

‏ביחס ל־:

- ‏Direct Routing superiority.
- ‏Post Only superiority.
- ‏Midpoint/Pegged superiority.
- ‏Adaptive superiority.
- ‏Trailing Stop superiority.

---

## ‏20. Time-Sensitive Facts

‏לפני יישום Live יש לאמת מחדש:

1. ‏אילו Order Types זמינים ב־`IBKR/IBKR Israel` בחשבון בפועל.
2. ‏אילו Orders זמינים דרך ה־API שבו נשתמש.
3. ‏איזה Order הוא `native` ואיזה `simulated`.
4. ‏איזה Routing נדרש (`SMART` / Direct / ATS).
5. ‏Order availability לפי Session.
6. ‏`Post Only` / `Pegged` / Midpoint semantics לפי Venue.
7. ‏Bracket/OCA transmission/cancel semantics.
8. ‏Stop trigger methods.
9. ‏Rate limits / pacing / modification behavior.
10. ‏Fees/rebates לפי route/order behavior.

---

## ‏21. Current Verification Snapshot — 2026-10-26

‏אימות נקודתי מול מקורות רשמיים הראה:

- ‏`IBKR Order Types and Algos`: קיימים יותר מ־100 Order Types/Algos/Tools, ולכן capability surface רחב בהרבה ממה שנכניס ל־baseline.
- ‏`IBKR MidPrice`: למניות/ETF אמריקאיים, Smart-routed, מיועד ל־NBBO midpoint או טוב יותר עם optional cap.
- ‏`IBKR Pegged-to-Midpoint`: למניות אמריקאיות מתועד כ־Direct-routed capability נפרד.
- ‏`IBKR Adaptive`: broker algo שמנסה לאזן fill speed ו־all-in price, ולכן נשאר Challenger עד Measurement על horizon שלנו.
- ‏`IBKR OCA`: אין guarantee שה־cancel/modify יגיע ל־exchange לפני order execution.
- ‏`IBKR TWS API`: תומך ב־Bracket construction וב־attached orders; transmission ordering דורש זהירות כדי למנוע accidental execution.
- ‏`IBKR Market Order Handling`: Market Orders מסוימות יכולות להיות simulated דרך סדרת marketable-limit orders/market-with-protection behavior.
- ‏`Nasdaq U.S. Equities`: מוצגים כיום `Minimum Quantity`, ‏`Mid-Point Peg`, ‏`Post Only`, routing strategies ו־price/time priority functionality.

‏ה־snapshot הזה הוא תיעוד ליום הכתיבה בלבד ואינו תחליף לבדיקה ביום deployment.

---

## ‏22. Relationship to Later Recommendation Sheets

‏מקטע 04 קובע את שפת ה־Order Policy ואת ה־baseline hierarchy בלבד.

‏החלטות מפורטות יותר יגיעו ב־:

- ‏`05` — Market Data required before order choice.
- ‏`06` — freshness/latency budgets ו־TTL.
- ‏`11` — liquidity/executability.
- ‏`16` — entry policy.
- ‏`17` — exit policy.
- ‏`18` — costs/net edge.
- ‏`21` — realistic execution simulation.
- ‏`29–30` — Broker/API ו־IBKR capabilities.

---

# ‏Recommendation Summary

```text
P0  Explicit order contract before submit
P0  Partial fills / cancel races / rejects handled as normal states
P0  Position and exit quantity derive from actual fills
P1  Limit-based, price-capped execution as baseline
P1  Marketable Limit as primary aggressive baseline
P1  IOC for short-lived execution attempts when appropriate
P1  Short application-managed order TTL
P1  SMART routing baseline
P1  Bracket/OCA as safety tools only with local reconciliation
P2  MidPrice as measured challenger
P3  Passive/Post-Only/Pegged/Adaptive/Direct Routing challengers
P4  Hidden/Reserve/large-order execution algos as specialist tools
Avoid initially: unbounded Market entry, stale resting orders, long-horizon execution algos
```

> ‏**המלצת ה־Baseline: אל תחפש “פקודה חכמה אחת”. בנה Execution Policy קטנה ומדידה: Limit כבסיס, Marketable Limit כאשר urgency גבוהה, IOC כאשר ההזדמנות קיימת רק עכשיו, Passive Limit כחלופה מדידה — וכל מעבר ל־Midpoint/Pegged/Post-Only/Adaptive/Direct Routing רק אם נתוני Fill, missed opportunities, markout ועלויות מוכיחים שהוא משפר Net Edge.**
