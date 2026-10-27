# ‏חלק 10F — Comparison Closeout Decision Checklist: מה משנה את התשובה

> ‏הפרק הזה סוגר את שכבת `R4 — Why / When / Why Not + Direct Comparisons`. הוא אינו מוסיף Order Types או Broker facts חדשים. מטרתו היא להוסיף לכל comparison family את השאלה שחייבת להגיע אחרי `Decision Example` ו־`Counterexample`: **מה ישתנה ב־state כך שהבחירה המקצועית תתהפך?**

---

## ‏10F.1 כלל העל

‏Advanced Order אינה "טובה יותר" באופן גלובלי.

```text
same candidate
+ different state
= potentially different correct decision
```

‏לכן בכל השוואה נשמור ארבעה דברים:

```text
Why this candidate wins here
Why the closest alternative loses here
What state variable would reverse the preference
What must be re-evaluated before acting
```

> ‏`ENGINE RULE` — שינוי בתשובה מחייב fresh Decision. הוא אינו authorization ל־fallback או escalation אוטומטיים.

---

## ‏10F.2 `MARKETABLE_LIMIT_IOC` מול `SWEEP_TO_FILL_LIMIT` מול `ADAPTIVE_LIMIT_URGENT`

### ‏למה Candidate אחת מנצחת כאן

```text
very short remaining signal life
+ useful quantity visible/executable now
+ stale remainder is undesirable
→ MARKETABLE_LIMIT_IOC can dominate
```

```text
size exceeds immediately available single-path liquidity
+ multi-venue aggressive consumption has measured value
→ SWEEP_TO_FILL_LIMIT may survive
```

```text
some execution time remains
+ broker-managed scheduling/repricing has validated value
→ ADAPTIVE_LIMIT_URGENT may survive
```

### ‏למה האלטרנטיבה מפסידה כאן

‏האלטרנטיבה מפסידה כאשר היא מוסיפה waiting, delegation או complexity שאינה יכולה להחזיר בתוך remaining signal life.

### ‏מה ישנה את התשובה

```text
remaining_signal_life changes
top-of-book / executable depth changes
order size changes
Economic Price Bound changes
remainder policy changes
broker-algo evidence changes
route/capability changes
```

---

## ‏10F.3 `MARKET_TO_LIMIT` מול Marketable Limit מול `IOC`

### ‏למה Candidate אחת מנצחת כאן

‏`MARKET_TO_LIMIT` מעניינת כאשר initial market-style execution רצויה, אבל remainder רשאית להפוך ל־resting Limit לפי semantics של ה־Order.

‏Marketable Limit ללא `IOC` מתאימה כאשר רוצים explicit Limit boundary ו־remainder רשאית להישאר Working.

‏`MARKETABLE_LIMIT_IOC` מתאימה כאשר remainder stale אינה רצויה ולכן היא צריכה להיעלם מיד לאחר immediate attempt.

### ‏למה האלטרנטיבה מפסידה כאן

```text
MTL loses
if transformed remainder is operationally undesirable

plain marketable Limit loses
if resting remainder may outlive the signal

IOC loses
if useful remainder persistence is part of the intended execution
```

### ‏מה ישנה את התשובה

```text
whether remainder may remain executable
remaining signal life
need for explicit client-defined execution bound
partial-fill usefulness
ability to observe/reconcile transformed remainder
```

---

## ‏10F.4 `RELATIVE_PRIMARY` מול `MIDPRICE` מול `PEGGED_MIDPOINT_DIRECT` מול `SNAP_MIDPOINT`

### ‏למה Candidate אחת מנצחת כאן

‏הכרעה תלויה קודם כול ב־reference וב־ownership של repricing:

```text
follow same-side quote continuously
→ RELATIVE_PRIMARY

seek midpoint through SMART broker-managed behavior
→ MIDPRICE

need destination-specific continuous midpoint peg
→ PEGGED_MIDPOINT_DIRECT

need one-shot midpoint-derived fixed Limit
→ SNAP_MIDPOINT
```

### ‏למה האלטרנטיבה מפסידה כאן

‏Candidate מפסידה כאשר ה־reference שלה, ה־repricing ownership שלה או ה־routing constraint שלה אינם תואמים את ה־Intent.

### ‏מה ישנה את התשובה

```text
continuous repricing required or not
same-side vs midpoint reference
need for deterministic fixed price after submit
SMART vs Direct capability
stale-signal risk under continuous repricing
remaining application_order_ttl
```

---

## ‏10F.5 `PASSIVE_JOIN` מול `PASSIVE_POST_ONLY`

### ‏למה Candidate אחת מנצחת כאן

‏`PASSIVE_JOIN` מנצחת כאשר passive intent מספיקה ואין requirement שה־Order לעולם לא תיקח liquidity בזמן handling.

‏`PASSIVE_POST_ONLY` מנצחת כאשר maker/passive-only economics היא constraint אמיתית ולא preference.

### ‏למה האלטרנטיבה מפסידה כאן

‏Post Only מפסידה כאשר missed-move cost גדול יותר מן הערך של passive-only constraint.

‏Plain passive Limit מפסידה כאשר arrival race יכולה להפוך אותה marketable וה־taking outcome אינו מותר.

### ‏מה ישנה את התשובה

```text
maker-only requirement
spread / fee economics
arrival-race probability
remaining signal life
missed-move cost
Post Only capability semantics
```

---

## ‏10F.6 `Hidden` מול `Reserve/Iceberg` מול `Discretionary`

### ‏למה Candidate אחת מנצחת כאן

```text
hide displayed presence / visibility
→ Hidden

hide part of total quantity
→ Reserve / Iceberg

hide executable price willingness beyond displayed price
→ Discretionary
```

### ‏למה האלטרנטיבה מפסידה כאן

‏היא מפסידה כאשר היא מסתירה dimension שאינו הבעיה שלנו.

### ‏מה ישנה את התשובה

```text
what information we actually need to conceal
order size relative to market liquidity
fill probability impact
queue / venue semantics
whether hidden executable range remains inside Economic Price Bound
combination capability evidence
```

> ‏`ENGINE RULE` — `NO_SPECIAL_HIDING` תמיד נשארת alternative חוקית כאשר concealment אינה מוסיפה ערך מדיד.

---

## ‏10F.7 `Stop` מול `Stop Limit` מול `MIT` מול `LIT`

### ‏למה Candidate אחת מנצחת כאן

‏הבחירה היא מכפלה של:

```text
trigger direction
×
post-trigger execution
```

‏Market-style post-trigger behavior מעדיפה execution certainty; Limit-style מעדיפה price protection ומקבלת triggered-but-unfilled risk.

### ‏למה האלטרנטיבה מפסידה כאן

‏היא מפסידה אם ה־trigger intent שלה שגוי או אם post-trigger risk trade-off אינו מתאים.

### ‏מה ישנה את התשובה

```text
adverse vs if-touched trigger intent
execution certainty requirement
price-protection requirement
ability to tolerate triggered-but-unfilled exposure
slippage tolerance
protection purpose vs entry purpose
```

---

## ‏10F.8 `Trailing Stop` מול `Adjustable Stop` מול local dynamic exit

### ‏למה Candidate אחת מנצחת כאן

```text
simple path-dependent ratchet + survivability
→ Trailing Stop

predefined broker-side transformation rule
→ Adjustable Stop

context-rich fresh decisions using local state
→ local dynamic exit
```

### ‏למה האלטרנטיבה מפסידה כאן

‏Broker-managed rule מפסידה כאשר current Signal/Risk context חשוב יותר מכלל קבוע; local logic מפסידה כאשר survivability בזמן disconnect היא requirement שאין לה backstop.

### ‏מה ישנה את התשובה

```text
client connectivity assumptions
need for broker-resident survivability
complexity of desired rule
need for current signal / spread / risk context
availability of hybrid protection
ability to reconstruct broker-side path state
```

---

## ‏10F.9 `Bracket` מול `OCA/OCO` מול `Conditional`

### ‏למה Candidate אחת מנצחת כאן

```text
parent-child dependency / protection graph
→ Bracket

peer mutual exclusion / quantity coordination
→ OCA/OCO

predicate-controlled eligibility
→ Conditional
```

### ‏למה האלטרנטיבה מפסידה כאן

‏היא מפסידה כאשר היא פותרת relationship אחר מן הבעיה האמיתית.

### ‏מה ישנה את התשובה

```text
whether relationship is dependency, peer coordination, or predicate
partial-fill behavior
worst-case concurrent executable exposure
broker-side survivability need
acceptance evidence for child/group semantics
whether the client must own the predicate decision
```

---

## ‏10F.10 `SMART` מול Direct Routing

### ‏למה Candidate אחת מנצחת כאן

‏`SMART` מנצחת כאשר broker venue-selection intelligence רצויה והמנוע המקומי אינו צריך destination determinism.

‏Direct מנצחת כאשר Destination עצמה היא requirement של ה־Behavior או חלק מה־research hypothesis, ויש לנו venue-specific evidence מספקת.

### ‏למה האלטרנטיבה מפסידה כאן

‏SMART מפסידה כאשר route determinism/feature support דורשים destination מפורש.

‏Direct מפסידה כאשר local venue model stale, חלקי או לא מצדיק את האחריות הנוספת.

### ‏מה ישנה את התשובה

```text
behavior route requirement
venue-specific capability
freshness of local venue model
fees / liquidity / reject evidence
need for destination determinism
availability of broker routing intelligence
```

---

## ‏10F.11 `MODIFY_IN_PLACE` מול `CANCEL_THEN_NEW` מול `OVERLAPPED_REPLACEMENT` מול Broker-Managed Repricing

### ‏למה Candidate אחת מנצחת כאן

```text
same semantic intent + supported in-place change
→ MODIFY_IN_PLACE may win

strong old/new separation required
→ CANCEL_THEN_NEW may win

transition gap is unacceptable and bounded double-execution risk is explicitly accepted
→ OVERLAPPED_REPLACEMENT may be research candidate

pricing rule itself should follow an external reference without client command churn
→ BROKER_MANAGED_REPRICE may win
```

### ‏למה האלטרנטיבה מפסידה כאן

‏היא מפסידה כאשר היא מחזיקה את ה־wrong risk: excessive cancel gap, modify uncertainty, intentional overlap או stale externally managed repricing.

### ‏מה ישנה את התשובה

```text
intent changed or only materialization changed
current order certainty
queue value / queue uncertainty
remaining signal life
cancel acknowledgement latency
worst-case double-execution budget
broker-managed repricing capability
```

---

## ‏10F.12 אותה Candidate ב־Entry מול Exit

### ‏למה התשובה יכולה להתהפך

```text
Entry no-fill
may leave us safely flat.

Exit no-fill
may leave reconciled_position exposed.
```

‏לכן Candidate פסיבית שעדיפה ב־Entry יכולה להיות גרועה יותר ב־Exit תחת אותו Market Snapshot אם cost of continued exposure גבוה.

### ‏מה ישנה את התשובה

```text
purpose = ENTRY | EXIT
reconciled_position
protection state
remaining signal life
position risk
missed-entry vs missed-exit cost
potentially executable entry/exit/protection orders
```

---

## ‏10F.13 Decision Questions — checklist אחיד לכל Advanced Order comparison

‏לפני בחירה סופית נשאל:

```text
1. What exact execution problem are we solving?
2. What state already exists if this order does nothing?
3. Do we need fill certainty or price protection more?
4. Can the signal / position safely survive waiting?
5. Is partial fill useful, harmful, or a new decision state?
6. What happens to unfilled remainder?
7. Who owns repricing / trigger / routing / coordination after submit?
8. Can the order remain executable after local intent expires?
9. What is the current Economic Price Bound?
10. Which capability evidence is required for this exact product/route/session/path?
11. What is the worst-case concurrently executable quantity?
12. What event would make the current winner lose to its closest alternative?
13. What failure destination is used if the order rejects, does not fill, or becomes UNKNOWN?
14. What broker facts must be reconciled before another risk-increasing side effect?
```

> ‏`ENGINE RULE` — אם אין תשובה ברורה לשאלה 12, ההשוואה עדיין אינה Decision Guide; היא רק תיאור של Order Types.

---

## ‏10F.14 R4 Coverage Index

| Required comparison | Primary source |
|---|---|
| Marketable Limit + IOC vs Sweep-to-Fill vs Adaptive Urgent | `02B-AGGRESSIVE-EXECUTION-DECISION-GUIDE.md` |
| Market-to-Limit vs Marketable Limit vs IOC | `02A-SWEEP-TO-FILL-AND-MARKET-TO-LIMIT.md` + `02B-AGGRESSIVE-EXECUTION-DECISION-GUIDE.md` |
| Passive Limit vs Post Only | `04B-LIQUIDITY-AND-DISPLAY-DECISION-GUIDE.md` |
| Hidden vs Reserve/Iceberg vs Discretionary | `04B-LIQUIDITY-AND-DISPLAY-DECISION-GUIDE.md` |
| Relative vs MidPrice vs Pegged-to-Midpoint vs Snap Midpoint | `05A-DYNAMIC-PRICING-DECISION-GUIDE.md` |
| Stop vs Stop Limit vs MIT vs LIT | `06B-TRIGGER-AND-DYNAMIC-EXIT-DECISION-GUIDE.md` |
| Trailing Stop vs Adjustable Stop vs local dynamic exit | `06B-TRIGGER-AND-DYNAMIC-EXIT-DECISION-GUIDE.md` |
| Bracket vs OCA/OCO vs Conditional | `06C-COMPOSITE-COORDINATION-CONDITIONAL-DECISION-GUIDE.md` |
| SMART vs Direct | `07A-ROUTING-POLICY-DECISION-GUIDE.md` |
| Modify vs Cancel+New vs broker-managed repricing | `08A-MODIFY-REPLACE-AND-REPRICING-DECISION-GUIDE.md` |
| Same primitive / behavior in Entry vs Exit | `10E-ENTRY-VS-EXIT-ASYMMETRY-DECISION-GUIDE.md` |

---

## ‏10F.15 Acceptance Tests — R4 learning contract

```text
1. Every required direct comparison has a canonical source location.
2. Each major comparison states why a candidate can win under one state.
3. Each major comparison states why the closest alternative can lose under that state.
4. Each major comparison lists state changes that can reverse the answer.
5. Decision Questions are expressed as state/risk/ownership questions, not UI order-name questions.
6. No comparison creates a universal best order.
7. No answer-change condition bypasses Economic Price Bound, capability, position truth or system-health gates.
8. Fallback and escalation still require fresh decision.
9. Partial fill remains a new decision state.
10. Entry and Exit remain purpose-asymmetric even when they share the same Broker Primitive.
```

---

# ‏Checkpoint — סוף חלק 10F

‏`R4` נסגרת עם learning contract אחיד: `What / Why / When / Why Not / Closest Alternative / Main Failure Mode`, ‏Decision Example ו־Counterexample בפרקי המשפחה, ובפרק הזה answer-changing conditions ו־Decision Questions אחידות. השאלה המסכמת לכל comparison היא: **איזה שינוי ב־state היה גורם ל־Candidate שבחרנו להפסיד לאלטרנטיבה הקרובה?**