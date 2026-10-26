# ‏שלב 37 — `Advanced Order Tactics`: להפוך Order Type לטקטיקת ביצוע

> ‏מטרת הפרק: להבין איך בוחרים ומנהלים טקטיקת ביצוע בפועל — לא רק איזה `Order Type` קיים, אלא מתי להיות passive, מתי לחצות את ה־spread, מתי להשתמש ב־marketable limit, מתי לבטל ולהחליף, ואיך לאזן בין מחיר, מהירות, סיכוי לביצוע, adverse selection ו־missed opportunity.
>
> ‏העיקרון המרכזי: **Execution הוא בעיית אופטימיזציה רב־ממדית. המטרה אינה “לקבל Fill” וגם לא “לקבל מחיר יפה”, אלא למקסם את ה־expected net outcome של האסטרטגיה לאחר spread, slippage, latency, fill risk ו־signal decay.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. למה `Order Type` לבדו לא מספיק

‏שתי מערכות יכולות להשתמש בדיוק באותו `Limit Order` ולקבל תוצאות שונות לגמרי.

‏ההבדל יכול להיות ב־:

- ‏איפה ה־limit ממוקם ביחס ל־Bid/Ask.
- ‏כמה זמן מחכים.
- ‏מתי מבטלים.
- ‏מתי מחליפים מחיר.
- ‏כמה פעמים עושים cancel/replace.
- ‏מה קורה כשה־signal נחלש.
- ‏מה קורה אם מתקבל partial fill.
- ‏מה קורה אם Rank #1 מתחלף.
- ‏מה רמת הדחיפות.

‏כל אלה הם **Order Tactics**.

---

# ‏2. שלושת היעדים שמתנגשים זה בזה

‏בדרך כלל Execution מנסה לשפר שלושה דברים במקביל:

```text
Better Price
Higher Fill Probability
Lower Time-to-Fill
```

‏אי אפשר תמיד למקסם את שלושתם.

‏ככל שאנחנו פסיביים יותר:

- ‏המחיר הפוטנציאלי טוב יותר.
- ‏הסיכוי לאי־ביצוע גדל.
- ‏זמן ההמתנה גדל.

‏ככל שאנחנו אגרסיביים יותר:

- ‏ה־fill probability עולה.
- ‏הזמן לביצוע מתקצר.
- ‏המחיר עלול להיות גרוע יותר.

---

# ‏3. ארבעת מחירי הייחוס

‏לפני כל tactic חשוב להבחין בין:

```text
Signal Price
Decision Price
Order Price
Fill Price
```

‏אם ה־signal נוצר ב־100.00 אבל ה־fill ב־100.14, ה־Strategy לא באמת קיבלה את אותו trade שהמחקר ראה.

---

# ‏4. `Passive Execution`

‏ב־passive execution אנחנו מנסים לקבל fill בלי לחצות את ה־spread.

‏בקנייה זה יכול להיות:

```text
Buy Limit @ Bid
```

‏או מחיר בתוך ה־spread.

‏היתרון האפשרי:

- ‏מחיר טוב יותר.
- ‏פחות spread cost.
- ‏לפעמים price improvement.

‏החסרון:

- ‏לא בטוח שנקבל fill.
- ‏ייתכן שנקבל fill דווקא כשהשוק מתחיל לזוז נגדנו.

---

# ‏5. `Aggressive Execution`

‏ב־aggressive execution אנחנו מוכנים לקחת liquidity.

‏לדוגמה בקנייה:

```text
Buy at or through Ask
```

‏המטרה היא להגדיל את probability of fill ולהקטין את הזמן.

‏אבל המחיר לכך הוא spread/slippage ולעיתים adverse selection.

---

# ‏6. `Balanced Execution`

‏בין passive ל־aggressive יש אזור ביניים.

‏לדוגמה:

```text
Bid = 100.00
Ask = 100.10
Mid = 100.05
```

‏אפשר להציב:

```text
Buy Limit @ 100.05
```

‏או:

```text
Buy Limit @ 100.07
```

‏זו אינה רק שאלה של “מחיר”. זו שאלה של הסתברות לביצוע מול signal decay.

---

# ‏7. `Marketable Limit`

‏`Marketable Limit` הוא Limit Order שמוכן לחצות את ה־spread עד גבול מחיר מוגדר.

‏לדוגמה:

```text
Ask = 100.10
Buy Limit = 100.12
```

‏הפקודה יכולה להתבצע מיד מול liquidity זמינה, אבל אינה אמורה לשלם מעל 100.12.

---

# ‏8. למה `Marketable Limit` שימושי לרובוט קצר־טווח

‏הוא נותן שילוב בין:

- ‏מהירות.
- ‏Price Protection.
- ‏יכולת לקבוע maximum acceptable slippage.

‏לכן הוא יכול להיות baseline טוב למחקר execution.

---

# ‏9. `Market Order` מול `Marketable Limit`

‏`Market Order` נותן עדיפות גבוהה לביצוע.

‏אבל אין לו price ceiling מפורש.

‏`Marketable Limit` נותן ceiling/floor.

‏במניות עם ספר פקודות דליל, ההבדל יכול להיות חשוב מאוד.

---

# ‏10. `Limit Too Tight`

‏Limit הדוק מדי עלול ליצור false economy.

‏לדוגמה:

```text
Expected gross edge = 12 bps
Saved spread = 4 bps
Missed trade opportunity = 20 bps
```

‏חיסכון של 4 bps אינו טוב אם בגללו איבדנו move של 20 bps.

---

# ‏11. `Limit Too Loose`

‏הקצה השני מסוכן גם הוא.

‏Limit רחב מדי יכול להפוך כמעט ל־Market Order בלי הגנה משמעותית.

‏לכן הגבול צריך להיות קשור ל־edge budget.

---

# ‏12. `Execution Budget`

‏נגדיר:

```text
expected_gross_edge
- expected_costs
- required_safety_margin
= maximum_execution_budget
```

‏ה־execution לא אמור לצרוך יותר מה־edge שאותו הוא מנסה לממש.

---

# ‏13. `Urgency`

‏דחיפות היא משתנה מרכזי.

‏אפשר לחשוב עליה כעל פונקציה של:

```text
signal_strength
signal_decay
rank_gap
expected_holding_time
market_speed
spread
liquidity
position_risk
```

---

# ‏14. `Urgency Score`

‏אפשר לייצר משתנה פנימי:

```text
urgency ∈ [0, 1]
```

‏כאשר:

```text
0 = very passive
1 = very aggressive
```

‏זו לא המלצה לנוסחה ספציפית; זו abstraction שימושית.

---

# ‏15. `Signal Decay` משנה את הטקטיקה

‏אם ה־edge צפוי לחיות 30 דקות, המתנה של 500ms כמעט אינה רלוונטית.

‏אם ה־edge צפוי לחיות 3 שניות, 500ms יכולים להיות מהותיים.

---

# ‏16. `Signal Half-Life`

‏אפשר למדוד היסטורית:

```text
signal_age → expected_forward_edge
```

‏ואז לבדוק באיזה גיל ה־signal כבר מאבד חלק גדול מהערך.

---

# ‏17. `Order TTL`

‏כל Order צריך לקבל `TTL` — זמן חיים.

‏לא נכון להשאיר order עובד רק כי הוא עדיין חוקי אצל הברוקר.

‏הוא צריך להישאר רק כל עוד ה־intent עדיין תקף.

---

# ‏18. `Signal TTL` מול `Order TTL`

‏אלה שני דברים שונים.

```text
Signal TTL = כמה זמן הרעיון תקף
Order TTL = כמה זמן הפקודה המסוימת תקפה
```

‏אפשר להחליף Order ועדיין לשמור Signal.

---

# ‏19. `Cancel/Replace`

‏טקטיקה נפוצה:

```text
Place
Wait
Re-evaluate
Cancel
Replace
```

‏אבל כל replace יכול לעלות לנו queue position ולייצר latency נוסף.

---

# ‏20. `Cancel/Replace` אינו חינם

‏העלות יכולה לכלול:

- ‏אובדן priority.
- ‏latency.
- ‏rate limits.
- ‏cancel/fill race.
- ‏זמן שבו אין order תקף.
- ‏הסתבכות state machine.

---

# ‏21. `Reprice Threshold`

‏לא כדאי לשנות order על כל tick קטן.

‏אפשר לדרוש שינוי מהותי:

```text
price_distance >= threshold
```

‏או:

```text
expected_value_change >= threshold
```

---

# ‏22. `Reprice Cooldown`

‏אפשר להגדיר זמן מינימלי בין reprices.

‏המטרה:

- ‏למנוע thrashing.
- ‏להקטין rate-limit pressure.
- ‏לשמור על queue position כשאפשר.

---

# ‏23. `Hysteresis` ב־Execution

‏אותו רעיון שלמדנו ב־State Machines.

‏אם עברנו מ־passive ל־aggressive, לא בהכרח כדאי לחזור מיד אחורה בגלל שינוי זעיר.

---

# ‏24. `Queue Position`

‏ב־Limit Order פסיבי, מחיר זה רק חצי מהסיפור.

‏צריך לשאול:

```text
How much volume is ahead of me?
```

‏אם אנחנו מאחורי queue גדולה, fill probability יכול להיות נמוך גם אם המחיר נוגע ב־limit.

---

# ‏25. `Touch != Fill`

‏אחת הטעויות הקלאסיות ב־Backtest:

```text
market touched my limit
=> assume filled
```

‏זו הנחה אופטימית מדי בהרבה מצבים.

---

# ‏26. `Trade Through`

‏Evidence חזק יותר ל־fill הוא לעיתים שהשוק נסחר דרך המחיר שלנו.

‏גם זה עדיין לא תמיד מוכיח fill מלא בגלל priority ו־available liquidity.

---

# ‏27. `Volume Ahead`

‏מודל execution מתקדם יכול לעקוב אחר volume שנמצא לפני order משוער.

‏לדוגמה:

```text
queue_ahead = displayed_size_before_order
```

‏ואז להקטין אותו לפי executions רלוונטיים.

---

# ‏28. `Queue Uncertainty`

‏בפועל לא תמיד נדע את מיקומנו המדויק.

‏לכן כדאי לחשוב בטווחים:

```text
optimistic queue
base queue
pessimistic queue
```

---

# ‏29. `Fill Probability`

‏במקום לחשוב `fill / no fill`, אפשר להעריך:

```text
P(fill within 100ms)
P(fill within 500ms)
P(fill within 1s)
```

---

# ‏30. `Expected Fill Value`

‏טקטיקה יכולה להיות מוערכת כך:

```text
P(fill) * expected_edge_if_filled
- execution_cost
- missed_opportunity_cost
```

---

# ‏31. `Missed Opportunity Cost`

‏אם order לא התמלא והמניה עלתה מיד, זה cost אמיתי של הטקטיקה.

‏לא PnL realized, אבל opportunity cost.

---

# ‏32. `No Fill` הוא Outcome

‏במחקר execution צריך לשמור גם trades שלא קרו.

‏אחרת passive strategy יכולה להיראות מעולה כי אנחנו מודדים רק את ה־fills המוצלחים.

---

# ‏33. `Adverse Selection`

‏אחת התופעות החשובות ביותר:

‏אנחנו מקבלים fill, אבל בדיוק ברגע שבו השוק עומד לזוז נגדנו.

---

# ‏34. `Passive Fill` יכול להיות Bad News

‏נניח שאנחנו קונים ב־Bid.

‏אם מוכר אגרסיבי מגיע ומכה ב־Bid שלנו, ייתכן שזה סימן ללחץ מכירה.

‏כלומר:

```text
cheap fill != good fill
```

---

# ‏35. `Markout`

‏אחרי כל fill אפשר למדוד:

```text
price(t + 100ms)
price(t + 500ms)
price(t + 1s)
price(t + 5s)
```

‏ולהשוות למחיר ה־fill.

---

# ‏36. `Positive Markout`

‏בקנייה, אם המחיר עולה אחרי fill — execution היה בכיוון טוב.

---

# ‏37. `Negative Markout`

‏אם המחיר יורד מיד לאחר fill, ייתכן שקיבלנו adverse selection.

---

# ‏38. `Aggressive Markout`

‏גם aggressive fills צריכים markout.

‏לפעמים אנחנו רודפים אחרי move, מקבלים fill ואז המחיר מתהפך.

---

# ‏39. `Chasing`

‏Chasing קורה כאשר order price נע שוב ושוב בעקבות השוק.

‏לדוגמה:

```text
100.10
100.12
100.15
100.18
```

‏לפעמים זה מוצדק; לפעמים אנחנו קונים את סוף המהלך.

---

# ‏40. `Maximum Chase Distance`

‏אפשר להגדיר גבול:

```text
max_chase_bps_from_signal
```

‏אם עברנו אותו:

```text
NO TRADE
```

‏יכול להיות עדיף.

---

# ‏41. `Signal Price Anchor`

‏צריך לזכור איפה היה השוק כשה־signal נוצר.

‏אם מחיר הכניסה התרחק יותר מדי, זה כבר trade שונה.

---

# ‏42. `Entry Drift`

‏נגדיר:

```text
entry_drift = executable_price_now - signal_reference_price
```

‏לקנייה, drift חיובי אוכל מה־edge.

---

# ‏43. `Edge Remaining`

‏לפני כל reprice אפשר לחשב מחדש:

```text
expected_remaining_edge
```

‏אם הוא קטן מהעלות הצפויה:

```text
ABORT ENTRY
```

---

# ‏44. `Pre-Trade Recheck`

‏לפני submit וגם לפני replace אפשר לבדוק:

- ‏ה־candidate עדיין Rank גבוה?
- ‏ה־signal עדיין חי?
- ‏ה־spread עדיין סביר?
- ‏ה־data טרי?
- ‏ה־risk עדיין מאשר?
- ‏המחיר לא התרחק יותר מדי?

---

# ‏45. `Rank Drift`

‏אם Rank #1 הפך ל־Rank #47 בזמן שהorder עדיין עובד, צריך מדיניות ברורה.

---

# ‏46. `Score Drift`

‏לא רק rank חשוב.

‏המניה יכולה להישאר #1 אבל score שלה לקרוס כי כל השוק נחלש.

---

# ‏47. `Candidate Replacement`

‏אם Candidate חדש נהיה חזק משמעותית, אפשר לשקול לבטל entry ישן.

‏אבל צריך להיזהר מ־churn.

---

# ‏48. `Switching Cost`

‏מעבר Candidate עולה:

- ‏cancel latency.
- ‏lost queue position.
- ‏new spread crossing.
- ‏decision instability.

---

# ‏49. `Replacement Threshold`

‏לא כדאי להחליף בגלל הפרש Score זעיר.

‏אפשר לדרוש:

```text
new_candidate_edge - old_candidate_edge > switching_cost + margin
```

---

# ‏50. `IOC`

‏`Immediate-Or-Cancel` אומר בדרך כלל:

‏בצע מיד את הכמות שניתן לפי התנאים, ובטל את השאר.

‏הוא שימושי כאשר איננו רוצים להשאיר order ישן resting בספר.

---

# ‏51. מתי `IOC` רעיונית מתאים

‏לדוגמה כאשר:

- ‏ה־signal קצר מאוד.
- ‏רוצים snapshot של liquidity זמינה עכשיו.
- ‏לא רוצים stale resting order.

---

# ‏52. `FOK`

‏`Fill-Or-Kill` דורש בדרך כלל ביצוע מיידי של כל הכמות או ביטול.

‏זה מתאים רק במקרים מסוימים; הוא עלול להקטין מאוד fill rate.

---

# ‏53. Partial Fill לעיתים עדיף על `FOK`

‏ברוב מערכות short-horizon אין סיבה אוטומטית להניח ש־partial fill הוא כישלון.

‏צריך למדוד אם position קטן עדיין בעל EV חיובי.

---

# ‏54. `Post-Only`

‏בזירות שתומכות בכך, `Post-Only` מנסה לוודא שהפקודה תתווסף כספקת liquidity ולא תבצע מיד כ־taker.

‏אבל semantics משתנים בין venues/brokers ולכן חייבים capability check.

---

# ‏55. `Midpoint`

‏Midpoint execution יכול לחסוך חלק מה־spread.

‏אבל:

- ‏לא תמיד זמין.
- ‏fill probability משתנה.
- ‏venue/routing semantics שונים.

---

# ‏56. `Pegged Orders`

‏Pegged order קושר את המחיר ל־reference כמו Bid, Ask או Mid.

‏זה יכול להפחית צורך ב־manual repricing.

‏אבל צריך להבין בדיוק:

- ‏offset.
- ‏cap/floor.
- ‏venue behavior.
- ‏broker implementation.

---

# ‏57. `Primary Peg`

‏רעיון כללי:

‏עקוב אחרי best bid/ask עם offset מוגדר.

---

# ‏58. `Mid Peg`

‏רעיון כללי:

‏עקוב אחרי midpoint.

---

# ‏59. `Pegged-to-Market`

‏רעיון כללי:

‏מחיר נגזר מהצד הנגדי או מאינדיקציה אחרת לפי semantics של venue/broker.

---

# ‏60. לא מניחים Semantics

‏אותו שם Order יכול להתנהג מעט אחרת לפי broker/venue.

‏לכן:

```text
CapabilityContract
```

‏חייב לתאר semantics בפועל.

---

# ‏61. `Price Protection`

‏כל tactic אגרסיבי צריך לחשוב על מחיר מקסימלי/מינימלי מתקבל.

---

# ‏62. `Maximum Slippage`

‏אפשר להגדיר:

```text
max_entry_slippage_bps
max_exit_slippage_bps
```

‏אבל אין לבחור ערכים שרירותיים.

‏הם צריכים להיגזר מה־edge וה־risk.

---

# ‏63. `Spread Budget`

‏אם spread עצמו גדול מחלק משמעותי מה־edge הצפוי, אולי אין trade.

---

# ‏64. `Spread Expansion`

‏אם spread מתרחב בזמן order working:

‏ייתכן שה־market conditions השתנו.

‏לא נכון בהכרח לרדוף.

---

# ‏65. `Liquidity Withdrawal`

‏אם displayed liquidity נעלמת, execution assumptions השתנו.

---

# ‏66. `Depth Shock`

‏ירידה חדה ב־depth יכולה להעלות expected slippage.

---

# ‏67. `Trade Burst`

‏Burst של trades יכול להעלות urgency — או דווקא להזהיר שהמהלך כבר crowded.

‏צריך לבדוק אמפירית.

---

# ‏68. `Microprice`

‏נלמד לעומק בשלב 45.

‏כאן מספיק להבין שהוא יכול לשמש input ל־execution urgency ולא רק ל־alpha.

---

# ‏69. `Order Book Imbalance`

‏גם imbalance יכול להשפיע על בחירת tactic.

‏אבל אסור להניח שכל imbalance מנבא כיוון.

---

# ‏70. `Passive First, Aggressive Later`

‏טקטיקה אפשרית:

```text
Phase 1: passive
Phase 2: midpoint/improved
Phase 3: marketable limit
Phase 4: abort
```

‏המעבר בין השלבים צריך להיות rule-based.

---

# ‏71. `Aggressive First`

‏ב־signal מהיר במיוחד ייתכן ש־passive phase אינו הגיוני.

‏זו שאלה למחקר, לא כלל.

---

# ‏72. `Adaptive Aggression`

‏אפשר לשנות urgency בזמן אמת לפי:

- ‏signal decay.
- ‏rank persistence.
- ‏spread.
- ‏queue.
- ‏volatility.
- ‏remaining edge.

---

# ‏73. `Time-Based Escalation`

‏דוגמה רעיונית:

```text
0–200ms: passive
200–500ms: improve price
500–800ms: marketable limit
>800ms: abort
```

‏המספרים כאן רק דוגמה מבנית, לא recommendation.

---

# ‏74. `Signal-Based Escalation`

‏במקום זמן קבוע:

```text
if edge strengthens:
    increase urgency
if edge weakens:
    reduce urgency or abort
```

---

# ‏75. `Liquidity-Based Escalation`

‏אם available ask size קטן וה־signal חזק, ייתכן שצריך לבצע מוקדם יותר.

‏אבל אם spread מתרחב, אולי דווקא לעצור.

---

# ‏76. `Partial Fill Policy`

‏לכל entry צריך להיות policy:

```text
keep_partial
complete_partial
cancel_remainder
exit_partial
```

---

# ‏77. `Minimum Useful Position`

‏אם partial fill קטן מדי, ייתכן שהעסקה כבר לא שווה את המורכבות והעמלות.

---

# ‏78. `Partial Fill + Signal Death`

‏תרחיש חשוב:

```text
wanted: 100 shares
filled: 30
signal dies
remaining: 70
```

‏צריך להחליט:

- ‏לבטל remainder.
- ‏להחזיק 30.
- ‏לצאת מ־30.

---

# ‏79. `Entry Completion Risk`

‏ניסיון “להשלים” את הכמות עלול להפוך trade סביר ל־chasing.

---

# ‏80. `Order Aging`

‏Order ישן הוא לא בהכרח order טוב.

‏צריך למדוד:

```text
order_age_ms
```

‏ולהצליב מול current signal quality.

---

# ‏81. `Stale Order`

‏Order יכול להיות חוקי ב־broker אבל stale עסקית.

---

# ‏82. `Stale Intent Guard`

‏לפני submit/replace צריך לבדוק:

```text
intent.created_at
intent.version
signal_version
safety_epoch
```

---

# ‏83. `Safety Epoch`

‏אם התרחש Kill Switch או Resume cycle, Intent ישן לא אמור “להתעורר” מחדש.

---

# ‏84. `Cancel Acknowledgement` אינו סוף הסיפור

‏גם אחרי cancel request עדיין יכול להגיע fill.

---

# ‏85. `Cancel/Fill Race`

‏ה־state machine צריך להיות מסוגל לקבל:

```text
CancelRequested
Fill
CancelConfirmed
```

‏בלי ליצור position שגוי.

---

# ‏86. `Replace` עשוי להיות Cancel + New

‏בהתאם ל־broker/venue semantics.

‏לכן לא מניחים continuity של queue position.

---

# ‏87. `Atomic Replace` אינו Assumption בטוח

‏צריך לדעת מה הברוקר באמת עושה.

---

# ‏88. `Price Ladder`

‏במקום קפיצה אקראית במחיר, אפשר להגדיר ladder:

```text
Level 0: Bid
Level 1: Bid + 1 tick
Level 2: Mid
Level 3: Ask
Level 4: Ask + protected offset
```

---

# ‏89. `Tick Size`

‏כל tactic צריך להיות tick-aware.

‏אי אפשר לבקש מחיר שאינו חוקי.

---

# ‏90. `Minimum Price Increment`

‏ה־instrument metadata חייב להגדיר אותו.

---

# ‏91. `Round-to-Tick`

‏כל calculated price חייב לעבור normalization.

---

# ‏92. `Price Bands`

‏יש מצבים שבהם venue/broker/exchange מגבילים מחירים קבילים.

‏המערכת צריכה לקבל reject reason ברור ולא לנסות retry עיוור.

---

# ‏93. `Market State`

‏טקטיקה שמתאימה לשוק רגיל לא בהכרח מתאימה ל־fast market, opening או halt recovery.

---

# ‏94. `Opening` אינו Midday

‏בפתיחה:

- ‏spread יכול להיות שונה.
- ‏depth יכולה להשתנות במהירות.
- ‏price discovery מהיר.

‏לכן execution policy יכולה להיות regime-aware.

---

# ‏95. `Closing` אינו Midday

‏גם לקראת סגירה dynamics משתנים.

---

# ‏96. `Extended Hours`

‏נזילות, spreads ו־order support יכולים להיות שונים.

‏אין להעתיק policy רגיל בלי validation.

---

# ‏97. `Halt Recovery`

‏אחרי חידוש מסחר, quotes ראשוניים יכולים להיות חריגים.

‏נלמד לעומק בשלב 43.

---

# ‏98. `Exit Urgency` שונה מ־Entry Urgency

‏ב־Entry אפשר לבחור `NO TRADE`.

‏ב־Exit כבר יש exposure.

‏לכן פונקציית העלות אינה זהה.

---

# ‏99. `Risk-Reducing Priority`

‏במצבי Safety, exit יכול לקבל priority גבוהה יותר מ־entry.

---

# ‏100. `Emergency Exit`

‏Emergency execution צריך להיות מדיניות נפרדת מטקטיקת exit רגילה.

---

# ‏101. `Do Not Optimize Only Entry`

‏מערכת יכולה לקבל entry מצוין ולהפסיד ביציאה.

‏צריך לחקור round trip.

---

# ‏102. `Round-Trip Execution Cost`

```text
entry_cost
+ exit_cost
+ commissions
+ fees
+ opportunity_cost
```

‏זה המספר שמעניין את ה־strategy.

---

# ‏103. `Implementation Shortfall`

‏מדד חשוב:

```text
actual_execution_outcome - decision_reference_outcome
```

‏בצורה מותאמת לכיוון.

---

# ‏104. `Execution Attribution`

‏נפריד:

```text
Signal Delay
Decision Delay
Submit Delay
Broker Ack Delay
Fill Delay
Price Slippage
Missed Fill
Exit Slippage
```

---

# ‏105. `Tactic ID`

‏כל order intent צריך לשמור:

```text
tactic_id
tactic_version
```

---

# ‏106. `Why This Tactic?`

‏Decision record צריך לכלול:

```text
urgency
signal_age
spread
remaining_edge
queue_estimate
rank_gap
regime
```

---

# ‏107. `Execution Policy` כמודול

‏ה־Strategy אינה אמורה לכתוב:

```text
if spread < X:
    buy at ask
```

‏עדיף:

```text
ExecutionPolicy.CreatePlan(intent, marketState)
```

---

# ‏108. `ExecutionPlan`

‏Plan יכול להכיל:

```text
initial_order_type
initial_price
order_ttl
reprice_policy
max_chase
partial_fill_policy
abort_conditions
```

---

# ‏109. `ExecutionPlan` הוא Snapshot

‏הוא נוצר על בסיס מידע בזמן מסוים.

‏אם השוק משתנה מהותית, צריך re-evaluation ולא “להמשיך אוטומטית”.

---

# ‏110. `Execution Policy Versioning`

‏כל שינוי tactic צריך version.

‏כך אפשר להשוות:

```text
v12 vs v13
```

‏על אותם signals.

---

# ‏111. `Counterfactual Execution`

‏לכל signal אפשר להריץ כמה tactics ב־Replay:

```text
Passive
Midpoint
MarketableLimit
Aggressive
```

‏ולהשוות outcomes.

---

# ‏112. `Same Signal, Different Execution`

‏כך מפרידים Alpha מ־Execution.

---

# ‏113. `Execution A/B` ב־Shadow

‏אפשר להריץ שני execution plans shadow side-by-side בלי לשלוח כסף אמיתי.

---

# ‏114. `Fill Rate` לבדו מטעה

‏100% fill rate יכול להגיע מטקטיקה אגרסיבית מדי.

---

# ‏115. `Average Price Improvement` לבדו מטעה

‏מחיר טוב מאוד על מעט fills יכול להסתיר opportunity loss גדול.

---

# ‏116. `Composite Evaluation`

‏צריך להסתכל יחד על:

- ‏Fill Rate.
- ‏Time to Fill.
- ‏Slippage.
- ‏Markout.
- ‏Missed Opportunity.
- ‏Net PnL.
- ‏Tail Risk.

---

# ‏117. `Conditional Fill Rate`

‏כדאי למדוד fill rate לפי:

- ‏spread bucket.
- ‏liquidity bucket.
- ‏volatility.
- ‏time-of-day.
- ‏signal strength.

---

# ‏118. `Fill Rate by TTL`

‏שאלה חשובה:

```text
How much fill probability do we gain by waiting another 100ms?
```

---

# ‏119. `Marginal Waiting Value`

‏אם המתנה של עוד 100ms מוסיפה 1% fill probability אבל מאבדת 5 bps edge — היא לא בהכרח שווה.

---

# ‏120. `Time-to-Fill Distribution`

‏לא רק average.

‏צריך P50/P90/P95/P99.

---

# ‏121. `Tail Fill Latency`

‏fills איטיים במיוחד יכולים להיות שונים איכותית מהרגיל.

---

# ‏122. `Fill Quality by Age`

‏ייתכן ש־fills שמגיעים אחרי 2 שניות גרועים יותר מ־fills שמגיעים אחרי 100ms.

---

# ‏123. `No-Fill Quality`

‏צריך לבדוק מה קרה אחרי שלא קיבלנו fill.

‏אם המחיר חזר אחורה — אולי הפספוס היה טוב.

‏אם המחיר המשיך — אולי איבדנו opportunity.

---

# ‏124. `Missed Trade Markout`

‏גם no-fill צריך forward markout.

---

# ‏125. `Execution Selection Bias`

‏אם מנתחים רק filled trades, נוצר bias.

---

# ‏126. `Survivorship of Orders`

‏גם orders שבוטלו חייבים להישאר ב־dataset.

---

# ‏127. `Order Lifecycle Dataset`

‏רשומה טובה כוללת:

```text
intent_created
order_submitted
order_acknowledged
order_modified
order_cancel_requested
partial_fill
fill
cancel_confirmed
position_opened
position_closed
```

---

# ‏128. `Market Snapshot at Every Transition`

‏כדאי לשמור Bid/Ask/Spread/Depth/Score/Rank סביב כל transition.

---

# ‏129. `Decision vs Fill Snapshot`

‏זו אחת ההשוואות החשובות ביותר.

---

# ‏130. `Execution Regret`

‏אפשר להגדיר counterfactual regret:

```text
best_reasonable_tactic_outcome
- actual_tactic_outcome
```

---

# ‏131. `Reasonable` חשוב

‏אסור להשוות בדיעבד ל־perfect hindsight fill.

---

# ‏132. `Perfect Fill` הוא Benchmark לא מציאותי

‏הוא יכול לשמש upper bound בלבד.

---

# ‏133. `Best / Base / Stress`

‏לכל tactic simulation כדאי שלושה מודלים לפחות:

```text
Best
Base
Stress
```

---

# ‏134. `Latency Stress`

‏נבדוק מה קורה אם latency מוכפלת.

---

# ‏135. `Spread Stress`

‏נבדוק widening.

---

# ‏136. `Liquidity Stress`

‏נפח זמין קטן יותר.

---

# ‏137. `Queue Stress`

‏מיקום גרוע יותר בתור.

---

# ‏138. `Partial Fill Stress`

‏יותר partial fills ממה שראינו בבסיס.

---

# ‏139. `Rate-Limit Stress`

‏מה קורה אם cancel/replace לא יכול להישלח מיד?

---

# ‏140. `Broker Delay Stress`

‏מה קורה אם ACK או cancel confirmation מתעכבים?

---

# ‏141. `Execution Capacity`

‏טקטיקה שעובדת ל־20 מניות לא בהכרח עובדת ל־2,000 simultaneous candidates.

---

# ‏142. `Request Budget`

‏whole-market system צריך להקצות request capacity גם ל־execution ולא לשרוף אותה על market-data polling.

---

# ‏143. `Priority Queue`

‏בקשות יכולות לקבל priority:

```text
1. Emergency exit
2. Cancel risk-increasing order
3. Reconciliation
4. Exit modification
5. Entry
6. Noncritical query
```

---

# ‏144. `Backpressure`

‏אם broker/API queue מתארך, old entry intents צריכים להתבטל ולא לחכות לנצח.

---

# ‏145. `Intent Expiration`

‏כל entry intent צריך expiration.

---

# ‏146. `Execution Admission Control`

‏גם אם Strategy רוצה trade, Execution Engine יכול לומר:

```text
REJECT_EXECUTION_CAPACITY
```

---

# ‏147. `Broker Health` משפיע על Tactic

‏אם broker latency מתדרדרת, tactic אגרסיבי מבוסס millisecond precision יכול להיות לא אמין.

---

# ‏148. `Data Health` משפיע על Tactic

‏אם quote stale, אסור לחשב marketable limit כאילו המחיר עדיין עדכני.

---

# ‏149. `Cross-Provider Validation`

‏אם data provider וה־broker שונים, אפשר לבדוק top candidate מול broker quote לפני submit.

---

# ‏150. `Validation Latency`

‏אבל validation עצמה עולה זמן.

‏לכן צריך למדוד אם היא מוסיפה יותר ביטחון מאשר edge שהיא שוחקת.

---

# ‏151. `Fail Fast`

‏אם preconditions לא מתקיימים, עדיף reject מיידי מאשר retry ארוך.

---

# ‏152. `No Trade` הוא Execution Outcome לגיטימי

‏אם אין דרך לבצע במסגרת edge budget, אין חובה להיכנס.

---

# ‏153. `Abort Reason Codes`

‏לדוגמה:

```text
EDGE_DECAYED
PRICE_MOVED_TOO_FAR
SPREAD_TOO_WIDE
RANK_COLLAPSED
DATA_STALE
BROKER_DEGRADED
LIQUIDITY_INSUFFICIENT
TTL_EXPIRED
```

---

# ‏154. `Execution Funnel`

```text
Signal
→ Intent
→ Risk Approved
→ Execution Admitted
→ Order Submitted
→ Ack
→ Fill
→ Position
```

‏צריך למדוד כמה נופלים בכל שלב.

---

# ‏155. `Drop-Off Analysis`

‏אם הרבה signals נופלים ב־`Execution Admitted`, ייתכן שה־Scanner מייצר opportunities לא־סחירות.

---

# ‏156. `Scanner ↔ Execution Feedback`

‏Execution failures צריכים לחזור למחקר.

---

# ‏157. `Untradeable Alpha`

‏Signal יכול להיות predictive אבל לא executable.

---

# ‏158. `Executable Alpha`

‏מה שמעניין הוא edge ששורד עד fill ואחרי cost.

---

# ‏159. `Entry Quality Score`

‏אפשר לבנות metric שמסכם:

```text
remaining_edge_at_fill
slippage
fill_latency
markout
```

---

# ‏160. `Exit Quality Score`

‏כנ״ל ל־exit.

---

# ‏161. `Order Tactic Registry`

‏כדאי לנהל registry:

```text
TACTIC-001 PassiveBid
TACTIC-002 MidpointFirst
TACTIC-003 MarketableLimit
TACTIC-004 AdaptiveEscalation
```

---

# ‏162. `Tactic Versioning`

‏כל שינוי threshold או policy מקבל version.

---

# ‏163. `Experiment Contract`

‏לפני שינוי tactic:

- ‏Hypothesis.
- ‏Primary Metric.
- ‏Guardrails.
- ‏Baseline.
- ‏Dataset.
- ‏Expected failure mode.

---

# ‏164. `One Tactic Change at a Time`

‏לא לשנות יחד:

- ‏TTL.
- ‏limit offset.
- ‏reprice frequency.
- ‏partial-fill policy.

‏ואז לטעון שידענו מה עזר.

---

# ‏165. `Ablation`

‏אפשר להסיר שלב אחד מה־execution ladder ולראות מה משתנה.

---

# ‏166. `Sensitivity Surface`

‏במקום לחפש “TTL מושלם”, בודקים surface:

```text
TTL × Offset × Urgency
```

---

# ‏167. `Robust Region`

‏מחפשים אזור יציב, לא נקודה קסומה.

---

# ‏168. `Parameter Cliff`

‏אם 480ms עובד ו־500ms קורס, צריך להבין למה.

---

# ‏169. `Regime Interaction`

‏Tactic מסוים יכול לעבוד טוב בשוק נזיל ולא טוב בשוק מהיר.

---

# ‏170. `Symbol Interaction`

‏מניות שונות יכולות להיות בעלות microstructure שונה.

---

# ‏171. `Avoid Per-Symbol Overfitting`

‏אין לבנות מאות exceptions רק כדי לתקן Backtest.

---

# ‏172. `Adaptive Policy` צריך להיות פשוט להסבר

‏אם אי אפשר להסביר למה urgency השתנתה, קשה לדבג.

---

# ‏173. `Deterministic Policy`

‏ב־Replay, אותם inputs צריכים להחזיר אותו execution plan.

---

# ‏174. `Execution Trace`

‏נרצה trace כזה:

```text
12:00:00.100 signal
12:00:00.118 risk approved
12:00:00.123 tactic selected
12:00:00.128 submit
12:00:00.171 ack
12:00:00.231 partial fill
12:00:00.315 rank weakened
12:00:00.329 cancel remainder
12:00:00.356 cancel confirmed
```

---

# ‏175. `Replay of Execution Decisions`

‏ב־Replay צריך לראות לא רק fills אלא למה policy החליטה כל פעולה.

---

# ‏176. `Shadow Execution`

‏ב־Shadow אפשר להפיק Orders וירטואליים ולמדוד מה היה קורה.

---

# ‏177. `Paper Execution`

‏ב־Paper אפשר לבדוק broker lifecycle, אבל לא להתייחס ל־fill model שלו כאמת מושלמת על Live.

---

# ‏178. `Small-Live Calibration`

‏בהמשך, אם וכאשר מערכת מגיעה לשלב כזה, נתוני live קטנים יכולים לשמש כיול ל־simulation.

‏זה שלב נפרד שמחייב safety controls והחלטה מודעת.

---

# ‏179. `Sim-to-Live Gap`

‏נמדוד:

```text
expected_fill_rate vs actual_fill_rate
expected_slippage vs actual_slippage
expected_latency vs actual_latency
expected_markout vs actual_markout
```

---

# ‏180. `Execution Model Calibration`

‏Replay/Backtest צריך ללמוד מהתוצאות האמיתיות במקום להישאר עם assumptions קבועים.

---

# ‏181. רז מקצוע: `Cheap Fill` יכול להיות הכי יקר

‏Fill פסיבי שנראה “חסכוני” יכול להיות יקר אם הוא מגיע רק כשהשוק פונה נגדנו.

---

# ‏182. רז מקצוע: `Fast Fill` יכול להיות Late Fill

‏הברוקר מילא מהר — אבל ה־signal כבר היה בן 900ms.

‏לכן latency נמדדת מה־signal, לא רק מה־submit.

---

# ‏183. רז מקצוע: `Fill Rate` בלי No-Fill Counterfactual הוא מספר חלקי

‏צריך לדעת מה איבדנו כשלא התמלאנו.

---

# ‏184. רז מקצוע: `Reprice` תכוף מדי יכול להרוס Queue Position

‏לא כל “להיות תמיד ראשון במחיר” פירושו להיות ראשון בתור.

---

# ‏185. רז מקצוע: `Top of Book` אינו כל הספר

‏בכמות מסוימת צריך לחשוב על depth ו־VWAP.

---

# ‏186. רז מקצוע: `Spread` קטן אינו מבטיח Execution טוב

‏אם depth זעירה וה־market מהיר, slippage יכול להיות משמעותי.

---

# ‏187. רז מקצוע: `Spread` גדול אינו תמיד סיבה אוטומטית לוותר

‏אם edge גדול מספיק ו־liquidity טובה, ייתכן שה־trade עדיין חיובי.

‏צריך לחשב net edge.

---

# ‏188. רז מקצוע: Order ישן הוא Exposure חדש

‏גם אם הוא לא filled עדיין, הוא יכול להתמלא בעוד רגע.

‏לכן working orders הם חלק מ־risk.

---

# ‏189. רז מקצוע: Cancel הוא Intent, לא Fact

‏רק broker state/reconciliation מאשרים מה קרה בפועל.

---

# ‏190. רז מקצוע: `NO TRADE` יכול להיות execution alpha

‏מערכת שיודעת לא לרדוף אחרי מחיר יכולה לשמור על יותר edge ממערכת ש“תמיד נכנסת”.

---

# ‏191. Baseline ראשוני לרובוט שלנו

‏למחקר הראשוני אפשר להשוות ארבע משפחות tactics:

```text
A. Passive at/near Bid
B. Midpoint/price-improved
C. Marketable Limit
D. Adaptive Escalation
```

---

# ‏192. אותו Signal לכולם

‏כדי להשוות הוגן:

- ‏אותו Candidate.
- ‏אותו decision timestamp.
- ‏אותו risk approval.
- ‏אותו quantity.
- ‏אותו exit model.

---

# ‏193. Metrics ראשוניים

‏נמדוד לכל tactic:

```text
fill_rate
partial_fill_rate
median_time_to_fill
p95_time_to_fill
entry_slippage_bps
entry_markout_1s
entry_markout_5s
missed_opportunity_bps
net_forward_return
```

---

# ‏194. Segmentation

‏נפרק לפי:

- ‏spread percentile.
- ‏liquidity percentile.
- ‏signal strength.
- ‏rank gap.
- ‏time-of-day.
- ‏volatility regime.

---

# ‏195. `Top1` מול `TopN`

‏יכול להיות שטקטיקה אגרסיבית מתאימה רק ל־Top1 עם separation גבוה.

---

# ‏196. `Trade Readiness Contract`

‏לפני Execution:

```text
candidate_valid
risk_approved
market_data_fresh
spread_acceptable
edge_remaining_positive
broker_ready
safety_allows_entry
```

---

# ‏197. `Execution Readiness` שונה מ־Signal Readiness

‏Signal יכול להיות טוב אך בלתי־ניתן לביצוע כרגע.

---

# ‏198. `Abort` אינו כישלון

‏אם conditions נשברו, abort הוא behavior נכון.

---

# ‏199. KPI חשוב: `Edge Preserved at Fill`

‏לא רק כמה edge היה ב־signal.

‏כמה נשאר בזמן fill?

---

# ‏200. KPI חשוב: `Execution Conversion`

```text
net_edge_at_fill / expected_edge_at_signal
```

‏רעיונית, זה מודד כמה מה־alpha הצלחנו לשמר עד הביצוע.

---

# ‏201. KPI חשוב: `Opportunity Capture`

‏כמה מההזדמנויות החיוביות באמת הפכו לפוזיציה בזמן?

---

# ‏202. KPI חשוב: `Bad Fill Avoidance`

‏כמה trades שהיו צפויים להידרדר נחסמו לפני fill?

---

# ‏203. KPI חשוב: `Order Churn`

```text
cancels + replaces per filled order
```

‏ערך גבוה יכול להעיד על policy עצבנית מדי.

---

# ‏204. KPI חשוב: `Stale Fill Rate`

‏כמה fills התקבלו אחרי שה־signal כבר לא היה תקף?

---

# ‏205. KPI חשוב: `Cancel-to-Fill Race Rate`

‏כמה פעמים fill הגיע בזמן cancel pending.

---

# ‏206. KPI חשוב: `Execution Reject Rate`

‏ולפי reason code.

---

# ‏207. KPI חשוב: `Execution-Induced NO TRADE`

‏כמה opportunities נדחו בגלל execution constraints.

---

# ‏208. `Execution RCA`

‏לכל trade גרוע נבדוק:

```text
Was the signal wrong?
Was the tactic wrong?
Was the timing wrong?
Was the broker slow?
Was the market too thin?
Did we chase?
Did we wait too long?
```

---

# ‏209. Failure Taxonomy

```text
E01 STALE_SIGNAL_FILL
E02 EXCESSIVE_CHASE
E03 MISSED_FILL
E04 QUEUE_MISMODEL
E05 CANCEL_FILL_RACE
E06 PARTIAL_FILL_MISMANAGED
E07 BROKER_DELAY
E08 DATA_STALENESS
E09 PRICE_PROTECTION_TOO_TIGHT
E10 PRICE_PROTECTION_TOO_LOOSE
```

---

# ‏210. Success Taxonomy

‏גם הצלחות צריך לסווג:

```text
S01 PASSIVE_PRICE_IMPROVEMENT
S02 FAST_AGGRESSIVE_CAPTURE
S03 GOOD_ABORT
S04 PARTIAL_FILL_MANAGED_WELL
S05 REPRICE_ADDED_VALUE
```

---

# ‏211. `Good Abort`

‏אם ביטלנו trade רגע לפני שהמחיר התהפך, זו הצלחה של Execution Policy.

---

# ‏212. `Bad Abort`

‏אם ביטלנו בגלל threshold קשיח והמחיר המשיך בעוצמה, זו הזדמנות למחקר.

---

# ‏213. `RCA → Hypothesis`

‏דוגמה:

```text
Observation:
Strong Top1 candidates with narrow spread often miss fills on passive tactic.

Hypothesis:
For high-separation Top1 events, midpoint-first improves net capture.
```

---

# ‏214. `Hypothesis → Controlled Experiment`

‏זה מחזיר אותנו לשלב 24.

---

# ‏215. Anti-Pattern: `Always Market`

‏פשוט, אבל עלול לשרוף edge.

---

# ‏216. Anti-Pattern: `Always Limit at Bid`

‏נראה חסכוני, אבל יכול לייצר missed opportunity/adverse selection.

---

# ‏217. Anti-Pattern: `Always Chase Until Filled`

‏הופך signal ישן ל־trade חדש בלי validation.

---

# ‏218. Anti-Pattern: `Touch Means Fill`

‏Backtest אופטימי.

---

# ‏219. Anti-Pattern: התעלמות מ־Partial Fills

‏ב־Production הם חלק טבעי מהחיים.

---

# ‏220. Anti-Pattern: Retry Blind

‏Order reject אינו סיבה לשלוח אותו שוב בלי להבין למה.

---

# ‏221. Anti-Pattern: Cancel Blind

‏Cancel request אינו proof.

---

# ‏222. Anti-Pattern: Reprice על כל Tick

‏יכול ליצור churn ו־queue loss.

---

# ‏223. Anti-Pattern: Optimize רק Fill Rate

‏יכול לייצר execution יקר מאוד.

---

# ‏224. Anti-Pattern: Optimize רק Slippage

‏יכול לייצר המון no-fills.

---

# ‏225. Anti-Pattern: Ignore Missed Opportunity

‏מסתיר את העלות של passive tactics.

---

# ‏226. Anti-Pattern: Ignore Signal Age

‏במערכת של שניות זו טעות קריטית.

---

# ‏227. Anti-Pattern: Use Live Parameters in Backtest Without Fidelity

‏אם queue/fill model לא מסוגל לייצג tactic מסוים, תוצאת backtest אינה מספיק אמינה.

---

# ‏228. Best Practice: Measure Before Complexity

‏מתחילים מ־baseline פשוט.

---

# ‏229. Best Practice: Add Complexity Only for Measured Problem

‏Pegged/adaptive/queue-aware logic רק אם יש evidence שהיא פותרת bottleneck אמיתי.

---

# ‏230. Best Practice: Execution Must Be Explainable

‏כל פעולה צריכה answer:

```text
Why did we place here?
Why did we wait?
Why did we reprice?
Why did we abort?
```

---

# ‏231. Best Practice: Keep a Hard Price Boundary

‏גם policy אדפטיבית צריכה hard safety bounds.

---

# ‏232. Best Practice: Separate Alpha From Execution

‏Scanner אומר מה רצוי לקנות.

‏Execution אומר איך לממש את ה־intent.

---

# ‏233. Best Practice: Same Execution Engine in Replay/Paper/Live

‏עם adapters שונים, לא logic שונה.

---

# ‏234. Best Practice: Record Every Order Transition

‏בלי זה אין RCA אמיתי.

---

# ‏235. Best Practice: Model No-Fill

‏No-fill הוא חלק מה־strategy economics.

---

# ‏236. Best Practice: Recheck Before Every Risk-Increasing Action

‏Submit, replace יותר אגרסיבי, completion של partial fill.

---

# ‏237. Best Practice: Risk-Reducing Actions Get Priority

‏במיוחד בזמן degradation.

---

# ‏238. Best Practice: Execution Policy Has Its Own Tests

‏לא רק Strategy tests.

---

# ‏239. Unit Tests

‏נבדוק:

- ‏price rounding.
- ‏TTL.
- ‏max chase.
- ‏urgency transitions.
- ‏abort conditions.
- ‏partial-fill behavior.

---

# ‏240. State Machine Tests

‏נבדוק cancel/fill/replace permutations.

---

# ‏241. Property Tests

‏דוגמה:

```text
Execution must never submit a price beyond the configured protection boundary.
```

---

# ‏242. Replay Tests

‏אותו dataset + config צריך להחזיר אותן tactical decisions.

---

# ‏243. Fault Injection

‏נכניס:

- ‏slow ack.
- ‏missing fill callback.
- ‏late cancel.
- ‏data gap.
- ‏spread jump.
- ‏broker reconnect.

---

# ‏244. Golden Scenarios

‏למשל:

```text
Strong signal + narrow spread + immediate fill
Strong signal + no passive fill + price runs
Weakening signal + partial fill
Cancel requested + late fill
Broker delay + stale signal
Spread widens before submit
```

---

# ‏245. Acceptance Criterion

‏טקטיקה חדשה אינה מתקבלת רק כי PnL עלה.

‏היא צריכה לשפר את ה־target metric בלי לשבור guardrails.

---

# ‏246. Guardrails אפשריים

- ‏Tail slippage.
- ‏Stale fill rate.
- ‏Cancel/fill race rate.
- ‏Order churn.
- ‏Broker request pressure.
- ‏Worst-case loss from execution.

---

# ‏247. Production Dashboard ל־Execution

‏צריך לראות:

```text
Current working orders
Order age
Signal age
Fill latency
Slippage
Markout
Cancel pending
Partial positions
Execution health
```

---

# ‏248. Alert: Stale Working Entry

‏Entry order חי כאשר signal כבר invalid.

---

# ‏249. Alert: Excessive Repricing

‏יכול להעיד על churn.

---

# ‏250. Alert: Fill Latency Shift

‏P95/P99 מתדרדרים ביחס ל־baseline.

---

# ‏251. Alert: Negative Markout Shift

‏יכול להעיד על adverse selection גובר.

---

# ‏252. Alert: Missed Opportunity Shift

‏יכול להעיד שה־policy פסיבית מדי.

---

# ‏253. Alert: Slippage Shift

‏יכול להעיד שה־policy אגרסיבית מדי או שה־market regime השתנה.

---

# ‏254. Baseline ארכיטקטוני לרובוט שלנו

```text
Scanner
  ↓
TradeIntent
  ↓
Risk Engine
  ↓
ExecutionPolicy
  ↓
ExecutionPlan
  ↓
Broker Adapter
  ↓
Order/Fill Events
  ↓
Execution Analytics
  ↓
RCA + Research
```

---

# ‏255. Baseline Decision Flow

```text
1. Candidate selected
2. Risk approves
3. Read fresh executable market state
4. Estimate remaining edge
5. Select execution tactic
6. Submit protected order
7. Observe order + market state
8. Re-evaluate on timer/event
9. Fill / reprice / cancel / abort
10. Record full execution trace
```

---

# ‏256. Baseline ראשון למחקר

‏כדי לשמור על KISS:

```text
Start with:
Marketable Limit baseline
+
Simple Passive baseline
+
Simple Adaptive Escalation challenger
```

‏ורק אחר כך להוסיף sophistication.

---

# ‏257. למה `Marketable Limit` הוא Baseline שימושי

‏לא מפני שהוא תמיד הכי טוב, אלא כי הוא פשוט יחסית למדידה ונותן price protection ברורה.

---

# ‏258. למה Passive Baseline חשוב

‏כדי למדוד כמה spread באמת אפשר לחסוך ומה המחיר ב־missed opportunities.

---

# ‏259. למה Adaptive Challenger חשוב

‏כדי לבדוק האם שינוי urgency לפי signal age/edge באמת מוסיף value.

---

# ‏260. שאלת המחקר האמיתית

‏לא:

```text
Which order type is best?
```

‏אלא:

```text
Given this signal, market state, urgency and edge budget,
which execution tactic maximizes expected net outcome?
```

---

# ‏261. Checklist לפני Submit

- ‏ה־signal עדיין חי.
- ‏ה־candidate עדיין eligible.
- ‏ה־risk מאשר.
- ‏ה־market data טרי.
- ‏ה־spread וה־liquidity תקינים.
- ‏המחיר לא התרחק יותר מדי.
- ‏ה־broker מוכן.
- ‏ה־safety state מאפשר Entry.
- ‏ה־execution budget עדיין חיובי.

---

# ‏262. Checklist בזמן Order Working

- ‏מה גיל ה־Order?
- ‏מה גיל ה־Signal?
- ‏האם Rank השתנה?
- ‏האם Score נחלש?
- ‏האם spread השתנה?
- ‏האם queue assumption השתנה?
- ‏האם partial fill התקבל?
- ‏האם צריך reprice/cancel/abort?

---

# ‏263. Checklist אחרי Fill

- ‏Fill price.
- ‏Slippage.
- ‏Time to Fill.
- ‏Partial/Full.
- ‏Markout.
- ‏Signal age at fill.
- ‏Rank at fill.
- ‏Remaining edge.

---

# ‏264. Checklist אחרי No-Fill

- ‏מה קרה למחיר אחר כך?
- ‏האם missed opportunity הייתה חיובית?
- ‏האם abort הציל אותנו?
- ‏האם limit היה tight מדי?
- ‏האם TTL היה קצר מדי?

---

# ‏265. Checklist למחקר Tactic חדש

- ‏Hypothesis כתובה.
- ‏Baseline קבוע.
- ‏אותם signals.
- ‏אותו exit model.
- ‏No-fill נשמר.
- ‏Partial fills נשמרים.
- ‏Costs ריאליסטיים.
- ‏Latency ריאליסטית.
- ‏Out-of-sample.
- ‏Robustness.

---

# ‏266. Checklist ל־Production

- ‏Tactic version.
- ‏Price bounds.
- ‏TTL.
- ‏Abort conditions.
- ‏Partial fill policy.
- ‏Cancel/fill handling.
- ‏Idempotency.
- ‏Observability.
- ‏Kill-switch compatibility.
- ‏Replay parity.

---

# ‏267. משפט המפתח של הפרק

‏**Execution טוב אינו זה שמשיג הכי הרבה fills או את המחיר הכי יפה; הוא זה ששומר על כמה שיותר מה־edge של ה־signal עד שהעסקה הופכת למציאות.**

---

# ‏268. החיבור לשלב הבא

‏עד עכשיו דיברנו על tactics ברמת החלטת הביצוע.

‏אבל כדי להבין passive orders לעומק, חסר לנו רכיב קריטי:

```text
Queue Position
```

‏בשלב הבא נלמד:

- ‏איך priority נוצרת.
- ‏למה touch אינו fill.
- ‏מה קורה כשיש volume לפנינו.
- ‏מה cancel/replace עושה לתור.
- ‏איך מעריכים fill probability בלי להעמיד פנים שיש לנו מידע מושלם.

‏זהו **שלב 38 — `Queue Position` ו־Limit Order Subtleties**.
