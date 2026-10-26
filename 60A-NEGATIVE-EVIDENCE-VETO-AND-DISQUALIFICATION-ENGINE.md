# ‏שלב 60A — `Negative Evidence, Veto and Disqualification Engine`: למה Candidate טוב צריך גם לעבור מבחן שלילי

> ‏מטרת הפרק: לבנות מנגנון החלטה שלילי עצמאי שפועל במקביל ל־Score/Ranking ומחפש Evidence שמצדיק פסילה, הפחתת אטרקטיביות או Cooldown — בלי להחביא הכול בתוך Score יחיד ובלי ליצור Veto Overfitting.
>
> ‏העיקרון המרכזי: **מועמד טוב אינו רק מי שקיבל הרבה Evidence חיובי. הוא גם מי שלא מציג Evidence שלילי מהותי שמרמז שה־Edge כבר נשחק, שהביצוע מסוכן, שה־Data אינו אמין או שההקשר האחרון של המניה הופך את העסקה ללא כדאית.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. למה Ranking חיובי לבדו אינו מספיק

‏נניח שמניה קיבלה Score גבוה בגלל:

```text
strong 1s momentum
high trade rate
positive 5s acceleration
large buy imbalance
```

‏אבל במקביל:

```text
spread just doubled
quote is stale
price already spiked and gave back twice
last aggressive fills had negative markout
symbol entered a halt-like abnormal state
position exit liquidity deteriorated
```

‏Score חיובי אחד עלול להסתיר את כל זה.

‏לכן נפריד בין:

```text
Positive Evidence
Negative Evidence
Execution Feasibility
Decision Aggregation
```

---

# ‏2. הארכיטקטורה הרעיונית

```text
Market Data
   ↓
Canonical State
   ├── Positive Evidence Engine
   │      → Features
   │      → Score
   │      → Rank
   │
   ├── Negative Evidence Engine
   │      → Hard Vetoes
   │      → Soft Penalties
   │      → Cooldowns
   │      → Negative Memory
   │
   └── Execution Feasibility
          → Entry feasibility
          → Exit feasibility
          → Costs
          → Fill probability
          → Latency

                 ↓
          Decision Aggregator
                 ↓
          TRADE / NO TRADE
```

‏המטרה היא לא להחליף Ranking אלא להשלים אותו.

---

# ‏3. שלוש משפחות של Evidence שלילי

## ‏3.1 `Hard Veto`

‏פסילה מלאה של Candidate כרגע.

‏דוגמאות עקרוניות:

- ‏Trading status לא תקין.
- ‏Data quality לא מספקת.
- ‏Spread/Depth חורגים מסף בטיחותי.
- ‏אין יכולת Exit סבירה.
- ‏Signal כבר expired.
- ‏Broker/Execution state אינו מאפשר risk חדש.

‏`Hard Veto` צריך להיות נדיר יחסית ומנומק מאוד.

## ‏3.2 `Soft Penalty`

‏Evidence שלילי שמפחית אטרקטיביות אך לא בהכרח פוסל.

‏דוגמאות:

- ‏Rank churn גבוה.
- ‏Momentum נחלש.
- ‏Spread מעט רחב יחסית.
- ‏recent giveback pattern.
- ‏liquidity deterioration מתון.

## ‏3.3 `Cooldown`

‏אירוע שלילי יוצר תקופת המתנה זמנית.

‏לדוגמה:

```text
recent failed breakout
→ cooldown 15s
```

‏לא משום שהמניה “רעה”, אלא משום שה־state האחרון דורש זמן להתנקות או Evidence חדש.

---

# ‏4. למה לא להפוך הכול ל־Score אחד

‏נניח:

```text
PositiveScore = 92
NegativePenalty = -35
FinalScore = 57
```

‏איבדנו מידע חשוב.

‏האם ה־35- הגיע בגלל:

```text
stale quote?
recent halt?
terrible exit liquidity?
failed breakout?
```

‏אלו דברים שונים לחלוטין.

‏לכן נשמור גם:

```text
Score
VetoState
PenaltyBreakdown
CooldownState
ReasonCodes
EvidenceAge
```

---

# ‏5. `ReasonCode` הוא חובה

‏לא מספיק:

```text
isRejected = true
```

‏נעדיף:

```text
VETO_DATA_STALE
VETO_TRADING_STATUS
VETO_EXIT_LIQUIDITY
VETO_SIGNAL_EXPIRED
PENALTY_RECENT_GIVEBACK
PENALTY_RANK_CHURN
COOLDOWN_FAILED_BREAKOUT
```

‏כך אפשר לבצע:

- ‏RCA.
- ‏Ablation.
- ‏Decision Impact Analysis.
- ‏OOS validation לפי rule.
- ‏השוואת frequency מול economic impact.

---

# ‏6. Evidence שלילי אינו בהכרח Safety Rule

‏חשוב להפריד:

```text
Safety Veto
Trading Veto
Research Penalty
```

‏`Safety Veto` יכול להיות דטרמיניסטי וחזק.

‏`Trading Veto` הוא hypothesis כלכלי שצריך validation.

‏`Research Penalty` יכול להתחיל ב־Shadow Mode בלבד.

---

# ‏7. Taxonomy של Vetoes

‏נרצה לפחות את הקטגוריות הבאות:

```text
DATA
TRADING_STATUS
LIQUIDITY
EXECUTION
SIGNAL
RECENT_BEHAVIOR
MICROSTRUCTURE
COST
LATENCY
RISK
BROKER
REGIME
CONTEXT
```

---

# ‏8. `DATA` vetoes

‏אפשרויות:

- ‏quote stale.
- ‏trade stream gap.
- ‏sequence uncertainty.
- ‏cross-provider conflict.
- ‏torn snapshot.
- ‏feature not ready.
- ‏fresh coverage נמוך.

‏במקרים כאלה המניה אולי טובה — אבל אנחנו לא יודעים מספיק כדי להחליט.

‏זה הבדל מהותי:

```text
Bad Candidate
!=
Unknown Candidate
```

---

# ‏9. `TRADING_STATUS` vetoes

‏לדוגמה:

- ‏halt.
- ‏reopening transition.
- ‏auction state שאינו תואם Strategy.
- ‏abnormal market-state uncertainty.

‏ה־rule צריך לעבוד לפי state מפורש ולא לפי ניחוש ממחיר.

---

# ‏10. `LIQUIDITY` vetoes

‏דוגמאות:

- ‏Spread גדול מדי ביחס ל־target edge.
- ‏Depth לא מספיק ל־size.
- ‏Exit side דל מדי.
- ‏Depth collapse.
- ‏refill חלש לאחר consumption.

‏הדגש הוא לא רק האם אפשר לקנות — אלא האם אפשר גם לצאת.

---

# ‏11. `EXECUTION` vetoes

‏דוגמאות:

- ‏fill probability נמוכה מדי.
- ‏expected adverse selection גבוהה מדי.
- ‏queue too deep.
- ‏required aggression מוחקת את ה־edge.
- ‏marketable limit protection רחוקה מדי.

---

# ‏12. `SIGNAL` vetoes

‏דוגמאות:

- ‏Signal expired.
- ‏Signal age קרוב מדי ל־half-life.
- ‏Momentum direction flipped.
- ‏Acceleration collapsed.
- ‏Price response no longer confirms flow.

---

# ‏13. `RECENT_BEHAVIOR` — הרעיון שהעלה את הפרק

‏כאן נכנס הזיכרון ההיסטורי הקצר.

‏לדוגמה, המניה כרגע נראית חזקה, אבל ב־30 השניות האחרונות:

```text
spike
→ fail
→ spike again
→ fail again
```

‏או בשתי הדקות האחרונות:

```text
multiple top-rank appearances
→ no useful continuation
```

‏או בשעה האחרונה:

```text
repeated abnormal volatility bursts
→ poor follow-through
```

‏זה לא אומר שהמניה אסורה לנצח.

‏זה אומר שה־recent context עשוי להיות Evidence שלילי זמני.

---

# ‏14. `Negative Memory`

‏נשמור אירועים שליליים עם:

```text
Symbol
ReasonCode
DetectedAt
SourceEventTime
Severity
InitialWeight
TTL
DecayFunction
EvidenceVersion
```

---

# ‏15. חלונות זמן שונים

‏אין סיבה שכל Negative Memory יחיה אותו זמן.

‏אפשר לבדוק אמפירית חלונות כגון:

```text
100ms
500ms
1s
3s
10s
30s
2m
5m
15m
60m
```

‏אלו דוגמאות למחקר, לא thresholds קבועים.

---

# ‏16. `TTL` ו־Decay

‏אירוע שלילי יכול להיחלש לאורך זמן.

‏לדוגמה:

```text
weight(t) = initialWeight × decay(t)
```

‏אפשר להשתמש ב:

```text
step TTL
linear decay
exponential decay
state-based reset
```

‏אבל רק אם המחקר מצדיק זאת.

---

# ‏17. Event-Based Reset עדיף לפעמים על Time-Based Reset

‏למשל:

```text
failed breakout
```

‏אולי לא צריך “לחכות 20 שניות”.

‏ייתכן שעדיף לחכות עד שמופיע:

```text
fresh base
new high-quality liquidity
new flow regime
new local high with confirmation
```

‏כלומר:

```text
CooldownUntilEvent
```

‏יכול להיות חכם יותר מ־`CooldownUntilTime`.

---

# ‏18. `Hard Veto` מול `Penalty`

‏החלטה קריטית:

‏מתי Evidence צריך לפסול לחלוטין ומתי רק להפחית אטרקטיביות?

‏כלל טוב למחקר:

```text
Safety/Validity failure
→ likely Hard Veto

Economic deterioration
→ usually start as Penalty/Shadow
```

‏לא הופכים hypothesis חלש ל־Hard Veto מהר מדי.

---

# ‏19. Veto Overfitting

‏אפשר להרוס Strategy בעזרת יותר מדי rules.

‏התהליך המסוכן:

```text
find losing trade
→ invent veto
→ backtest improves
→ repeat 30 times
```

‏זה בדיוק Parameter Hunting בגרסה בינארית.

---

# ‏20. כל Veto הוא Hypothesis

‏לדוגמה:

```text
Hypothesis:
Candidates with two failed 10s momentum bursts in the prior 2m
have worse forward net outcome.
```

‏צריך לבדוק:

- ‏In-sample.
- ‏Validation.
- ‏OOS.
- ‏Regimes.
- ‏Execution realism.
- ‏Decision impact.

---

# ‏21. `Decision Impact Rate`

‏Rule שלא משנה החלטות כמעט אף פעם אינו חשוב תפעולית.

```text
DecisionImpactRate
=
DecisionsChangedByRule / EligibleDecisions
```

‏אבל frequency לבדה אינה מספיקה.

‏צריך גם:

```text
NetOutcomeDelta
AvoidedLosses
MissedWinners
FalseVetoRate
```

---

# ‏22. `False Veto`

‏פסילה יכולה למנוע הפסד — אבל גם לחסום Winner.

‏לכן לכל Rule נמדוד:

```text
avoided_bad_trades
blocked_good_trades
net_value_of_veto
```

---

# ‏23. `Veto Precision`

‏אפשר להגדיר רעיונית:

```text
VetoPrecision
=
BadOutcomesAmongVetoed / AllVetoed
```

‏אבל “Bad Outcome” חייב להיות מוגדר כלכלית, לא לפי מחיר בלבד.

---

# ‏24. `Opportunity Cost of Veto`

‏Rule יכול לשפר Win Rate אבל להוריד total edge.

‏לכן נשווה:

```text
NetEdgeWithoutVeto
vs
NetEdgeWithVeto
```

‏ולא רק:

```text
WinRate
```

---

# ‏25. Veto Frequency by Regime

‏Rule יכול להיות מצוין בשוק כאוטי ומזיק בשוק יציב.

‏נמדוד לפי:

- ‏volatility regime.
- ‏time of day.
- ‏liquidity regime.
- ‏market-wide stress.
- ‏symbol class.

---

# ‏26. Cross-Sectional Effect

‏כאשר Candidate #1 נפסל, השאלה אינה רק:

```text
Should we skip?
```

‏אלא גם:

```text
Should Rank #2 become actionable?
```

‏זה חשוב מאוד לרובוט שסורק שוק רחב.

---

# ‏27. `Fallback Candidate`

‏אם #1 נפסל:

```text
Rank #2
→ revalidate
→ check vetoes
→ check executability
```

‏אסור פשוט לקדם אותו אוטומטית.

---

# ‏28. Vetoes יכולים להיות Candidate-Specific או Market-Wide

‏Candidate-Specific:

```text
XYZ spread exploded
```

‏Market-Wide:

```text
fresh coverage collapsed across universe
```

‏במקרה השני ייתכן:

```text
BLOCK_NEW_ENTRIES
```

‏ולא רק פסילת Symbol יחיד.

---

# ‏29. `Context Veto`

‏לפעמים המניה עצמה נראית טוב, אבל ההקשר לא.

‏לדוגמה:

```text
sector collapsing
market-wide spread expansion
abnormal feed degradation
```

‏זה דורש Evidence נפרד מ־symbol score.

---

# ‏30. `Recent Rank Failure Memory`

‏רעיון שימושי למחקר:

```text
symbol ranked top recently
→ entry would have failed
→ temporary negative memory
```

‏אבל צריך להיזהר מ־self-referential bias.

‏ה־memory חייב להיות מבוסס על אירוע מוגדר היטב ולא על “לא אהבתי את התוצאה”.

---

# ‏31. `Failed Breakout Memory`

‏אפשר להגדיר episode:

```text
breakout trigger
→ no continuation
→ retrace
```

‏ואז לבדוק האם episodes כאלה מנבאים follow-through גרוע בחלון הבא.

---

# ‏32. `Giveback Memory`

‏למטרה שלנו חשוב במיוחד:

```text
small fast gain
→ immediate giveback
```

‏אם Symbol מציג שוב ושוב giveback מהיר, ייתכן שזה Negative Evidence רלוונטי.

‏אבל צריך למדוד point-in-time ולא בדיעבד.

---

# ‏33. `Toxic Fill Memory`

‏אם fills אחרונים באותו Symbol הציגו:

```text
negative 100ms/500ms/1s markout
```

‏אפשר לבדוק האם זה מספק Evidence זמני לגבי adverse selection.

---

# ‏34. `Spread Shock Memory`

‏Spread expansion פתאומי יכול להצדיק:

```text
penalty
or
short cooldown
```

‏גם אם spread כבר חזר חלקית.

---

# ‏35. `Liquidity Withdrawal Memory`

‏Depth שנעלם במהירות יכול להיות מידע שעדיין רלוונטי כמה רגעים אחרי שה־book “נראה” תקין שוב.

---

# ‏36. `Rank Churn Memory`

‏Candidate שקופץ:

```text
#1 → #14 → #2 → #20 → #1
```

‏אולי פחות אמין ממועמד שנשאר Top-3 באופן יציב.

‏זה יכול להיות penalty ולא Hard Veto.

---

# ‏37. `Score Compression`

‏אם:

```text
#1 = 91.2
#2 = 91.1
#3 = 91.0
```

‏אין באמת winner ברור.

‏אפשר להוסיף:

```text
low_rank_separation penalty
```

‏או `NO TRADE` אם המחקר תומך.

---

# ‏38. Veto בגלל `Freshness Mismatch`

‏Candidate לא אמור לנצח אם הוא fresh אבל שאר universe ישן מאוד, או להפך.

‏צריך לדעת אם ההשוואה cross-sectional הוגנת.

---

# ‏39. Veto בגלל `Signal-to-Execution Gap`

‏גם signal מצוין יכול להפוך ללא רלוונטי אם:

```text
signal_age + expected_execution_latency
```

‏קרובים מדי ל־signal half-life.

---

# ‏40. `Remaining Edge Gate`

‏אפשר לחשב:

```text
RemainingNetEdge
=
PredictedEdgeAfterDecay
- ExpectedCosts
- ExpectedAdverseSelection
- ExpectedImpact
```

‏אם:

```text
RemainingNetEdge <= 0
```

‏זה candidate ל־Hard Economic Veto.

---

# ‏41. Vetoes לפני Score או אחרי Score?

‏שניהם.

‏אפשר לחלק:

```text
Pre-Rank Eligibility Vetoes
Post-Rank Candidate Vetoes
Pre-Submit Revalidation Vetoes
```

---

# ‏42. Pre-Rank Vetoes

‏זולים ודטרמיניסטיים יחסית:

- ‏invalid data.
- ‏trading status.
- ‏minimum liquidity.
- ‏unsupported symbol state.

‏מטרתם לא לבזבז compute על Candidate שלא יכול להיות actionable.

---

# ‏43. Post-Rank Vetoes

‏עמוקים יותר:

- ‏recent negative memory.
- ‏rank instability.
- ‏execution toxicity.
- ‏context mismatch.
- ‏edge decay.

---

# ‏44. Pre-Submit Vetoes

‏חייבים להיות מהירים מאוד.

‏בודקים שוב:

```text
freshness
trading status
spread/depth
signal age
rank drift
remaining edge
risk/exposure
```

---

# ‏45. Veto State Machine

‏אפשר להחזיק:

```text
CLEAR
PENALIZED
COOLDOWN
HARD_VETO
UNKNOWN
```

‏`UNKNOWN` חשוב במיוחד כאשר Data אינה מספקת.

---

# ‏46. Severity

‏לכל Evidence:

```text
INFO
LOW
MEDIUM
HIGH
CRITICAL
```

‏אבל Severity אינה בהכרח Action.

‏Action נקבעת לפי Policy.

---

# ‏47. Policy נפרדת מ־Detection

‏Detection:

```text
spread_shock_detected = true
```

‏Policy:

```text
if regime=X and severity=HIGH
→ cooldown
```

‏הפרדה זו מאפשרת מחקר טוב יותר.

---

# ‏48. `EvidenceRecord`

‏מודל אפשרי:

```text
EvidenceId
Symbol
ReasonCode
Category
DetectedAt
SourceEventTime
Severity
Confidence
Value
Threshold
TTL
ExpiresAt
Version
Source
```

---

# ‏49. Confidence

‏Evidence יכול להיות:

```text
KNOWN
INFERRED
WEAK_INFERENCE
UNKNOWN
```

‏לדוגמה hidden liquidity inference אינו זהה ל־Trading Halt status רשמי.

---

# ‏50. לא כל Evidence צריך TTL

‏יש Evidence שתקף עד שינוי state.

‏לדוגמה:

```text
TRADING_HALTED
```

‏פג רק כאשר מגיע Transition אמין.

---

# ‏51. Point-in-Time Correctness

‏ב־Backtest חייבים להשתמש רק ב־Evidence שהיה ידוע באותו רגע.

‏אסור:

```text
future correction
future outcome
final session classification
```

‏להיכנס ל־veto שהיה אמור להחליט קודם.

---

# ‏52. Negative Memory ו־Leakage

‏אם נגדיר:

```text
failed breakout
```

‏באמצעות מידע של 10 שניות אחרי ההחלטה — נוצר leakage.

‏צריך להגדיר את האירוע רק כאשר הוא באמת observable.

---

# ‏53. Episode Boundaries

‏Negative memory צריך episodes ברורים.

‏לדוגמה:

```text
EpisodeStart
EpisodeConfirmedAt
EpisodeEnd
```

‏לא רק retrospective label.

---

# ‏54. Shadow First

‏Trading veto חדש רצוי להתחיל ב:

```text
ShadowVeto = true
ActualDecisionUnchanged
```

‏ואז למדוד:

```text
what would it have blocked?
what would it have saved?
what winners would it have missed?
```

---

# ‏55. Champion / Challenger

‏`Champion`:

```text
current decision policy
```

‏`Challenger`:

```text
same policy + new veto
```

‏השוואה צריכה להיות על אותם market episodes.

---

# ‏56. Ablation

‏אם יש 8 vetoes, נריץ:

```text
all vetoes
minus V1
minus V2
...
```

‏כדי לראות מי באמת מוסיף ערך.

---

# ‏57. Interaction Effects

‏שני vetoes יחד יכולים להיות redundant.

‏לדוגמה:

```text
spread shock
liquidity withdrawal
```

‏אולי כמעט תמיד מתרחשים יחד.

‏לא נסיק ששניהם independently useful.

---

# ‏58. Rule Explosion

‏סימן אזהרה:

```text
200 veto rules
```

‏למערכת קצרה ופשוטה יחסית.

‏יותר rules = יותר parameters, יותר interactions, יותר hidden state.

---

# ‏59. Complexity Budget

‏לכל Veto חדש נשאל:

```text
Does it materially improve net decision quality?
Is it interpretable?
Can we validate it?
Can we monitor it live?
Can we remove it safely?
```

---

# ‏60. Veto Coverage

‏נמדוד:

```text
% candidates hard-vetoed
% candidates penalized
% candidates cooled down
% final decisions changed
```

---

# ‏61. Veto Concentration

‏אם Rule אחד פוסל 80% מה־universe, צריך להבין למה.

‏אולי:

- ‏Threshold גרוע.
- ‏Data bug.
- ‏Regime change.
- ‏Rule באמת fundamental.

‏לא מניחים אוטומטית שזה טוב.

---

# ‏62. Symbol Concentration

‏אם Veto כמעט תמיד פוגע באותם Symbols, ייתכן שזה בעצם Universe Rule.

---

# ‏63. `NO TRADE` הוא Output לגיטימי

‏אם:

```text
Top candidates all vetoed
```

‏המערכת לא חייבת “למצוא משהו אחר”.

‏היא יכולה להחליט:

```text
NO TRADE
```

---

# ‏64. Veto Aggregation

‏אפשר להחזיק:

```text
HardVetoes[]
SoftPenalties[]
Cooldowns[]
Warnings[]
```

‏ולא Boolean אחד.

---

# ‏65. Priority בין Vetoes

‏Safety/Data validity גוברים על Economic Ranking.

‏לדוגמה:

```text
DataUnknown
```

‏לא “מתקזז” עם Score גבוה.

---

# ‏66. `Non-Compensable Evidence`

‏יש Evidence שאסור ל־Score לפצות עליו.

‏למשל:

```text
trading_halted
```

‏Score 100 לא משנה זאת.

---

# ‏67. `Compensable Evidence`

‏Evidence כלכלי מתון עשוי להיות compensable.

‏לדוגמה:

```text
slightly wider spread
```

‏אולי Edge גדול מספיק עדיין מצדיק פעולה.

---

# ‏68. Veto versus Penalty via Economics

‏אפשר לשאול:

```text
Does this condition make expected net edge structurally non-positive?
```

‏אם כן, Hard Veto הגיוני יותר.

‏אם לא, Penalty עשוי להתאים.

---

# ‏69. Recent-History Features מול Veto Memory

‏אותו מידע יכול להיכנס כ־Feature או כ־Veto.

‏ההבדל:

```text
Feature
→ contributes gradually to score

Veto
→ imposes policy constraint
```

‏הבחירה חייבת להיות מחקרית.

---

# ‏70. מתי Recent Behavior עדיף כ־Feature

‏כאשר הקשר עם outcome:

```text
smooth / monotonic / probabilistic
```

‏ולא threshold חד.

---

# ‏71. מתי Recent Behavior עשוי להצדיק Veto

‏כאשר:

```text
condition strongly destroys executability
or
creates known-invalid state
```

‏ועדיין צריך Evidence.

---

# ‏72. `Cooldown` כפשרה

‏כאשר Hard Veto חזק מדי ו־Penalty חלש מדי:

```text
Cooldown
```

‏יכול להיות כלי טוב.

---

# ‏73. Cooldown Thrashing

‏צריך למנוע מצב:

```text
clear
veto
clear
veto
clear
```

‏בכל 100ms.

‏אפשר להשתמש ב־hysteresis או reset conditions.

---

# ‏74. Hysteresis

‏לדוגמה:

```text
enter cooldown at spread > A
clear only when spread < B
```

‏כאשר:

```text
B < A
```

‏כדי למנוע flapping.

---

# ‏75. Veto Expiry Revalidation

‏כאשר Cooldown נגמר, לא הופכים Candidate אוטומטית ל־eligible.

‏עושים:

```text
full revalidation
```

---

# ‏76. Memory Reset on Regime Change

‏לפעמים Negative Memory מהקשר קודם כבר לא רלוונטי לאחר:

```text
halt/reopen
session boundary
major liquidity regime shift
```

‏צריך להחליט במפורש מה נשמר ומה מתאפס.

---

# ‏77. Restart Semantics

‏האם Negative Memory נשמרת אחרי process restart?

‏תלוי בסוג Evidence.

‏לכן לכל category נגדיר:

```text
Ephemeral
Recoverable
Durable
```

---

# ‏78. Durable Negative Memory

‏אם החלטה של 30 דקות תלויה באירוע מלפני 5 דקות, restart לא אמור למחוק אותו במקרה.

---

# ‏79. Event Journal

‏כל שינוי veto state צריך להיות observable:

```text
VetoActivated
PenaltyChanged
CooldownStarted
CooldownExpired
VetoCleared
```

---

# ‏80. Explainability

‏בכל `NO TRADE` נרצה לדעת:

```text
Top candidate = XYZ
Score = 94
Rejected because:
- VETO_EXIT_LIQUIDITY
- PENALTY_RECENT_GIVEBACK
```

---

# ‏81. Explainability גם ל־Trade

‏אם Trade עבר:

```text
No hard vetoes
Penalty total acceptable
Execution feasible
Remaining edge positive
```

‏צריך לשמור זאת.

---

# ‏82. Veto Metrics

‏נאסוף לפחות:

```text
veto_count_by_reason
penalty_count_by_reason
cooldown_count_by_reason
veto_duration
false_veto_estimate
decision_impact_rate
net_edge_delta
missed_winner_rate
avoided_bad_trade_rate
```

---

# ‏83. Tail Behavior

‏יכול להיות Rule שעובד יפה בממוצע אבל נכשל בדיוק ב־fast markets.

‏צריך conditional analysis.

---

# ‏84. Market Burst Behavior

‏ב־burst גדול, Negative Engine עצמו לא יכול להפוך לצוואר בקבוק.

‏נעדיף:

```text
cheap deterministic vetoes
→ whole universe

expensive behavioral vetoes
→ Top-N
```

---

# ‏85. Fast Path / Deep Path

‏`Fast Negative Path`:

- ‏freshness.
- ‏status.
- ‏basic liquidity.
- ‏signal age.

‏`Deep Negative Path`:

- ‏recent episode memory.
- ‏toxic fill history.
- ‏complex microstructure context.

---

# ‏86. Position-Specific Priority

‏Negative Evidence עבור Position פתוח חשוב אפילו יותר מ־candidate חדש.

‏למשל:

```text
exit liquidity collapse
```

‏צריך להגיע ל־Position Monitor מיד.

---

# ‏87. Entry Veto ו־Exit Signal אינם אותו דבר

‏מצב שאומר:

```text
do not enter
```

‏לא בהכרח אומר:

```text
exit immediately
```

‏המדיניות חייבת להפריד ביניהם.

---

# ‏88. `EntryBlocked` מול `ExitUrgency`

‏אפשר לייצג:

```text
EntryEligibility = BLOCKED
ExitUrgency = NORMAL
```

‏או להפך.

---

# ‏89. Risk Layer נשאר עצמאי

‏Veto Engine אינו תחליף ל־Risk Engine.

‏Risk יכול לחסום מסיבות כגון:

- ‏exposure.
- ‏capital.
- ‏position count.
- ‏safety state.

‏גם אם Candidate נקי לחלוטין.

---

# ‏90. Decision Aggregator

‏המבנה הסופי:

```text
Candidate
+ Positive Score
+ Rank
+ Negative Evidence
+ Execution Feasibility
+ Risk State
→ Decision
```

---

# ‏91. סדר Evaluation מומלץ למחקר

```text
1. Validity / Safety
2. Cheap Eligibility
3. Positive Rank
4. Deep Negative Evidence
5. Execution Feasibility
6. Risk
7. Final Revalidation
8. TRADE / NO TRADE
```

‏זה Baseline ארכיטקטוני, לא הבטחה שזה הסדר האופטימלי לכל מערכת.

---

# ‏92. `VetoBudget`

‏אפשר להגביל מורכבות:

```text
max active research vetoes
```

‏כדי למנוע rule explosion.

---

# ‏93. Promotion של Veto חדש

‏Rule עובר:

```text
idea
→ offline analysis
→ shadow
→ OOS
→ decision-impact review
→ limited promotion
→ monitored production
```

---

# ‏94. Rejection Criteria

‏נזרוק Rule אם:

- ‏אין OOS effect.
- ‏הוא חוסם יותר Winners ממה שהוא חוסך.
- ‏הוא redundant.
- ‏הוא רגיש מאוד ל־threshold קטן.
- ‏הוא יוצר complexity לא מוצדקת.

---

# ‏95. Sensitivity Surface

‏לא בודקים Threshold יחיד.

‏נבדוק טווח:

```text
threshold × TTL × regime
```

‏ונחפש אזור יציב, לא נקודת קסם.

---

# ‏96. Counterfactual Logging

‏כאשר Rule פעיל, נשמור גם:

```text
What would have happened without it?
```

‏ב־Shadow/Replay ניתן לחשב זאת בצורה נקייה יותר.

---

# ‏97. `Veto Attribution`

‏אם שלושה Rules פוסלים יחד, מי “קיבל קרדיט”?

‏נשמור את כולם.

‏אחר כך ננתח:

```text
first veto
all vetoes
unique contribution
```

---

# ‏98. `First Divergence`

‏ב־RCA נשאל:

```text
At what point did the candidate stop being actionable?
```

‏זה טוב יותר מלהסתכל רק על התוצאה הסופית.

---

# ‏99. Veto Drift

‏Rule שעבד לפני חודש עלול להפסיק לעבוד.

‏נמדוד:

```text
frequency drift
economic impact drift
false-veto drift
regime drift
```

---

# ‏100. Data Bug שמתחפש ל־Veto Success

‏אם stale-data bug גורם להרבה עסקאות רעות, `VETO_DATA_STALE` ייראה מדהים.

‏אבל צריך לתקן גם את מקור הבעיה.

‏Veto אינו תחליף ל־RCA של pipeline.

---

# ‏101. Veto שמסתיר Strategy חלשה

‏אם צריך עשרות exclusions כדי שה־Strategy תהיה חיובית, ייתכן שאין core edge חזק מספיק.

---

# ‏102. Veto שמקטין Sample Size

‏יותר פסילות = פחות trades.

‏פחות trades = פחות Evidence.

‏צריך לעקוב אחרי Effective Sample Size.

---

# ‏103. Winner's Curse של Veto Research

‏אם ננסה 100 Vetoes ונשמור את 3 הטובים, הם כנראה נראים טוב מדי.

‏צריך Multiple-Testing discipline.

---

# ‏104. Pre-Registration

‏ל־Veto חשוב נרשום מראש:

```text
hypothesis
metric
threshold family
validation plan
promotion criteria
```

‏לפני שמסתכלים על התוצאה הסופית.

---

# ‏105. Veto Family Tests

‏במקום 30 variants אקראיים:

```text
recent_failed_breakout family
```

‏נבדוק בצורה שיטתית.

---

# ‏106. Interaction עם Score Calibration

‏אם Veto Engine משתנה, distribution של candidates שמגיעים ל־Score final משתנה.

‏ייתכן שצריך recalibration.

---

# ‏107. Interaction עם Position Sizing

‏Penalty לא חייב להשפיע רק על `TRADE/NO TRADE`.

‏אפשר לחקור:

```text
reduce size
```

‏אבל זו החלטה נפרדת שצריכה validation.

---

# ‏108. Interaction עם Order Tactic

‏Negative Evidence מסוים אולי לא דורש פסילה אלא tactic אחר.

‏לדוגמה:

```text
moderate adverse-selection risk
→ less passive waiting
```

‏זו hypothesis לבדיקת Execution, לא כלל אוטומטי.

---

# ‏109. Interaction עם Exit Policy

‏Recent giveback evidence יכול להשפיע על:

```text
entry eligibility
and/or
exit urgency
```

‏צריך למדוד אותם בנפרד.

---

# ‏110. `Negative Context Vector`

‏במקום Boolean אפשר לשמור:

```text
dataRisk
liquidityRisk
executionRisk
signalDecayRisk
recentBehaviorRisk
contextRisk
```

‏ולשמור explainability מלאה.

---

# ‏111. למה זה מתאים במיוחד למטרה שלנו

‏ב־Short-Horizon Momentum:

- ‏ה־Edge קטן.
- ‏ה־Signal מתיישן מהר.
- ‏Spread/Slippage משמעותיים.
- ‏שינוי state קטן יכול להפוך Trade מחיובי לשלילי.

‏לכן מנגנון “למה לא” יכול להיות חשוב לא פחות ממנגנון “מי הכי חזק”.

---

# ‏112. אבל לא מניחים שהוא ישפר תוצאות

‏המנגנון עצמו הוא hypothesis.

‏צריך להוכיח:

```text
Does parallel negative evidence improve OOS net outcome?
```

---

# ‏113. Baseline פשוט למחקר ראשון

‏אפשר להתחיל רק עם קטגוריות ברורות:

```text
DATA_INVALID
TRADING_STATUS_INVALID
SIGNAL_EXPIRED
EXIT_NOT_FEASIBLE
REMAINING_EDGE_NON_POSITIVE
```

‏ואת ה־behavioral vetoes להפעיל ב־Shadow בלבד.

---

# ‏114. למה Baseline פשוט עדיף

‏כי הוא מאפשר למדוד האם המנגנון מוסיף ערך בלי להכניס מיד עשרות knobs.

---

# ‏115. שכבה שנייה

‏לאחר Evidence אפשר להוסיף:

```text
RANK_CHURN
RECENT_GIVEBACK
FAILED_BREAKOUT_MEMORY
SPREAD_SHOCK_MEMORY
TOXIC_FILL_MEMORY
```

---

# ‏116. שכבה שלישית

‏רק אם יש הצדקה:

```text
complex regime-conditioned vetoes
cross-symbol context vetoes
adaptive TTLs
learned veto probability
```

---

# ‏117. Learned Veto Models

‏אפשר בעתיד להשתמש במודל שמעריך:

```text
P(candidate becomes economically bad | current negative context)
```

‏אבל זה מתקדם ועלול להיות קשה להסבר.

‏לא baseline.

---

# ‏118. Rules לפני ML

‏למערכת אישית עדיף לרוב להתחיל ב־interpretable rules עם Evidence חזק.

‏אחר כך Challenger ML.

---

# ‏119. Testing — Deterministic Rules

‏כל Hard Veto צריך Unit Tests ו־Property Tests.

‏למשל:

```text
if data_status = INVALID
then candidate cannot become TRADE
```

---

# ‏120. Testing — TTL

‏בדיקות:

- ‏activation.
- ‏expiry.
- ‏decay.
- ‏event reset.
- ‏restart restoration.

---

# ‏121. Testing — Ordering

‏Out-of-order events לא צריכים להחזיר Veto שכבר בוטל בצורה שגויה.

---

# ‏122. Testing — Duplicate Events

‏אותו Event פעמיים לא צריך להכפיל penalty.

---

# ‏123. Testing — Replay

‏אותו Replay צריך לייצר:

```text
same veto transitions
same reason codes
same final decisions
```

---

# ‏124. Testing — Counterfactual

‏ב־Replay נריץ:

```text
with veto engine
without veto engine
```

‏ונשווה decision-by-decision.

---

# ‏125. Testing — Burst

‏ב־4,000 Symbols בזמן burst, Fast Veto Path צריך להישאר fresh.

---

# ‏126. Testing — Failure Injection

‏נזריק:

```text
stale quotes
sequence gaps
spread explosion
liquidity disappearance
latency spike
rank churn
broker degradation
```

---

# ‏127. Monitoring Dashboard

‏נרצה לראות:

```text
Top veto reasons
Veto rate over time
Cooldown inventory
Decision impact
Missed winner estimate
Net edge delta
Rule drift
```

---

# ‏128. Alert על Veto Explosion

‏אם פתאום:

```text
90% candidates vetoed
```

‏זו יכולה להיות תקלה ולא “שוק גרוע”.

---

# ‏129. Alert על Veto Silence

‏אם Rule שבדרך כלל פעיל נעלם לגמרי:

‏אולי Data path שלו נשבר.

---

# ‏130. RCA taxonomy

```text
VETO_DATA_STALE
VETO_DATA_GAP
VETO_STATUS_INVALID
VETO_SIGNAL_EXPIRED
VETO_EXIT_NOT_FEASIBLE
VETO_REMAINING_EDGE_NEGATIVE
PENALTY_RANK_CHURN
PENALTY_SCORE_COMPRESSION
PENALTY_RECENT_GIVEBACK
PENALTY_SPREAD_SHOCK
PENALTY_TOXIC_MARKOUT
COOLDOWN_FAILED_BREAKOUT
COOLDOWN_LIQUIDITY_WITHDRAWAL
VETO_CONTEXT_INVALID
VETO_UNKNOWN_STATE
```

---

# ‏131. `Unknown` צריך להיות מפורש

‏אם אין מספיק Data לחשב Rule:

```text
UNKNOWN
```

‏ולא:

```text
false
```

---

# ‏132. Fail-Closed או Fail-Open?

‏ל־Safety/Data validity:

```text
usually fail-closed for new risk
```

‏ל־experimental behavioral veto:

```text
usually do not silently block live risk until validated
```

---

# ‏133. Separation of Concerns

‏ה־Veto Engine לא צריך לדעת איך לשלוח Order.

‏הוא מחזיר Decision Evidence.

---

# ‏134. Interface אפשרי

```text
Evaluate(candidate, marketState, executionContext)
→ NegativeDecisionContext
```

---

# ‏135. `NegativeDecisionContext`

‏יכול לכלול:

```text
HardVetoes
SoftPenalties
Cooldowns
Warnings
EffectiveUntil
EvidenceVersion
```

---

# ‏136. Versioning

‏כל שינוי ב־Veto Policy מקבל Version.

‏בלי זה לא נוכל להשוות historical decisions.

---

# ‏137. Config as Data

‏Thresholds/TTLs לא מפוזרים בקוד.

‏הם versioned configuration עם provenance.

---

# ‏138. Explainable Config

‏לכל Rule:

```text
why it exists
what hypothesis it represents
what metric validates it
```

---

# ‏139. Retirement

‏Rules שאינם מוסיפים ערך צריכים לצאת.

‏לא שומרים אותם “ליתר ביטחון”.

---

# ‏140. Feature Retirement ו־Veto Retirement דומים

‏שניהם צריכים:

```text
usage
impact
drift
redundancy
```

---

# ‏141. `Negative Evidence` כחלק מ־RCA של Rank #1

‏כאשר Rank #1 נכשל, נשאל:

```text
Was there negative evidence we already had but ignored?
```

‏זו דרך טובה לגלות candidate veto hypotheses.

---

# ‏142. אבל RCA אינו רישיון להוסיף Rule מיד

‏RCA מייצר hypothesis.

‏לא production rule.

---

# ‏143. `Missed Winner Review`

‏כל Veto חשוב צריך לעבור גם ביקורת הפוכה:

```text
Which strong winners did this rule block?
```

---

# ‏144. `Avoided Loser Review`

‏וגם:

```text
Which bad trades did this rule correctly block?
```

---

# ‏145. Balance

‏המטרה אינה:

```text
minimum losses
```

‏אלא:

```text
best risk-adjusted net executable outcome
```

---

# ‏146. Veto Engine ו־NO TRADE Frequency

‏אם NO TRADE עולה משמעותית, צריך להבין אם:

- ‏איכות ההחלטות השתפרה.
- ‏המערכת נהייתה פחדנית מדי.

---

# ‏147. Opportunity Rate

‏נמדוד גם:

```text
actionable_opportunities_per_hour
```

‏כדי לראות אם Rules מוחקים את כל opportunity set.

---

# ‏148. Vetoes לפי Symbol Type

‏Small-cap, highly liquid large-cap ו־ETFs יכולים לדרוש behavior שונה.

‏לא מניחים universality.

---

# ‏149. Vetoes לפי Time of Day

‏Opening, midday, close שונים מאוד.

‏Rule יכול להיות regime/time-aware רק אם Evidence תומך.

---

# ‏150. Vetoes לפי Signal Horizon

‏Rule שרלוונטי ל־100ms signal לא בהכרח רלוונטי ל־30s signal.

---

# ‏151. Multi-Horizon Negative Evidence

‏אפשר לשמור:

```text
negative_500ms
negative_5s
negative_30s
negative_5m
```

‏אבל לא חייבים להפוך כל Horizon ל־Rule נפרד.

---

# ‏152. Conflict Resolution

‏מה אם:

```text
500ms context negative
30s context strongly positive
```

‏זה בדיוק מקום למחקר ולא ל־if אקראי.

---

# ‏153. Evidence Hierarchy

‏אפשר לתעדף:

```text
Validity/Safety
> Execution Feasibility
> Strong Recent Negative Evidence
> Soft Context
```

‏אבל hierarchy עצמה היא Policy versioned.

---

# ‏154. Veto Engine אינו Strategy בפני עצמו

‏הוא שכבת החלטה משלימה.

‏בלי Positive Edge אין מה “להציל”.

---

# ‏155. Veto Engine אינו Guarantee

‏הוא יכול להפחית טעויות מסוימות אך גם לייצר פסילות שגויות.

‏לכן Evidence-first.

---

# ‏156. `Practitioner Secret`: מסלול שלילי נוטה להישכח

‏מערכות רבות משקיעות המון ב־“מי נראה הכי טוב” ומעט מדי ב־“למה דווקא לא עכשיו”.

‏בשוק קצר־טווח, state שלילי זמני יכול להיות חשוב מאוד.

---

# ‏157. `Practitioner Secret`: Rule בינארי מרגיש בטוח מדי

‏Boolean יוצר תחושת ודאות.

‏בפועל הרבה Evidence הוא probabilistic.

‏לכן `Confidence` ו־Penalty חשובים.

---

# ‏158. `Practitioner Secret`: Cooldown יכול להיות Data Structure מסוכן

‏אם הוא לא versioned/replayable/persisted נכון, Live ו־Backtest יתנהגו אחרת.

---

# ‏159. `Practitioner Secret`: פסילה מוצלחת יכולה להסתיר Feed Bug

‏אם Rule מציל אותנו שוב ושוב מאותו anomaly, צריך לבדוק האם anomaly עצמו הוא תקלה.

---

# ‏160. `Practitioner Secret`: Candidate #2 אחרי veto אינו בהכרח “הבא בתור”

‏הוא חייב לעבור evaluation מחדש בזמן החדש.

---

# ‏161. `Practitioner Secret`: Negative Memory יכולה ליצור self-lockout

‏אם כל failure יוצר cooldown ארוך, המערכת עלולה להפסיק לסחור Symbols טובים בדיוק אחרי noise טבעי.

---

# ‏162. `Practitioner Secret`: Reason Codes הם נכס מחקרי

‏אחרי חודשים הם מאפשרים לראות איזה סוגי failures חוזרים לפני הפסדים.

---

# ‏163. `Practitioner Secret`: Vetoes יכולים לשנות Distribution של Fills

‏אם חוסמים candidate מסוים, אנחנו מקבלים fills מסוג אחר.

‏צריך recalibrate adverse selection ו־costs.

---

# ‏164. `Practitioner Secret`: יותר Selectivity אינה בהכרח יותר Edge

‏אפשר לסנן עד שנשארו רק מעט trades שנראים נהדר היסטורית בגלל overfitting.

---

# ‏165. Baseline Architecture לרובוט שלנו

```text
Universe
→ Cheap Eligibility
→ Positive Rank
→ Top-N
→ Negative Evidence Deep Pass
→ Execution Feasibility
→ Risk
→ Final Revalidation
→ TRADE / NO TRADE
```

---

# ‏166. Baseline Hard Vetoes ראשוניים

‏למחקר/ארכיטקטורה הייתי מתחיל רק מ־validity/economics ברורים:

```text
DATA_NOT_TRUSTWORTHY
TRADING_STATUS_NOT_ACTIONABLE
SIGNAL_EXPIRED
EXIT_NOT_FEASIBLE
REMAINING_NET_EDGE_NOT_POSITIVE
```

‏זו המלצת baseline הנדסית בלבד, לא המלצת מסחר.

---

# ‏167. Behavioral Vetoes מתחילים ב־Shadow

‏לדוגמה:

```text
RECENT_GIVEBACK
FAILED_BREAKOUT
RANK_CHURN
TOXIC_MARKOUT
```

‏נמדוד לפני חסימה אמיתית.

---

# ‏168. Dashboard לכל Candidate Top-N

‏נציג:

```text
Rank
Score
Hard vetoes
Soft penalties
Cooldowns
Signal age
Freshness
Remaining edge
Execution feasibility
Final decision
```

---

# ‏169. Decision Snapshot

‏כל החלטה נשמרת עם:

```text
PositiveEvidenceVersion
NegativeEvidenceVersion
RiskVersion
ExecutionPolicyVersion
DataGeneration
Timestamp
```

---

# ‏170. Checklist לפני הוספת Veto חדש

- ‏האם יש Hypothesis ברורה?
- ‏האם האירוע observable בזמן אמת?
- ‏האם אין Leakage?
- ‏האם זה Hard Veto או Penalty?
- ‏האם TTL/Reset מוגדרים?
- ‏האם יש ReasonCode?
- ‏האם יש Shadow Mode?
- ‏האם יש OOS validation?
- ‏האם מדדנו Missed Winners?
- ‏האם מדדנו Decision Impact?
- ‏האם Rule redundant?
- ‏האם complexity מוצדקת?

---

# ‏171. Checklist לפני Trade

```text
Positive rank strong?
Winner fresh?
No non-compensable veto?
No active cooldown?
Negative penalties acceptable?
Execution feasible?
Exit feasible?
Remaining net edge positive?
Risk allows?
Final state still current?
```

---

# ‏172. מה חייבים לזכור בעל־פה

1. ‏`High Score != Actionable Candidate`.
2. ‏Hard Veto, Penalty ו־Cooldown הם כלים שונים.
3. ‏Negative Memory חייבת TTL/Reset/Versioning.
4. ‏כל Behavioral Veto הוא Hypothesis.
5. ‏`False Veto` חשוב כמו avoided loss.
6. ‏Candidate הבא אחרי פסילה חייב revalidation.
7. ‏Validity/Safety Evidence אינו מתקזז עם Score גבוה.
8. ‏יותר פסילות אינן בהכרח Strategy טובה יותר.
9. ‏Shadow + OOS + Ablation לפני promotion.
10. ‏היעד הוא `Net Executable Outcome`, לא Win Rate.

---

# ‏173. המשפט המסכם

> ‏**ה־Ranking Engine שואל “מי נראה הכי טוב?”. ה־Negative Evidence Engine שואל “מה אנחנו יודעים כרגע שעלול לגרום לכך שלא כדאי לפעול עליו?”. החלטה מקצועית צריכה לענות על שתי השאלות — ואז לבדוק אם עדיין נשאר Edge בר־ביצוע.**

---

# ‏המשך הקורס

‏הפרק הבא חוזר למסלול המקורי:

```text
61 — Backtest Subtleties
```

‏לא מתחילים אותו במסגרת שלב זה.
