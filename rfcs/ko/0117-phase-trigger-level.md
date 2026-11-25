# RFC 0117: Phase 2 → 3 구현 수에 레벨을 못 박는다

> **번역본이다.** 정본은 영문 [`rfcs/0117-phase-trigger-level.md`](../0117-phase-trigger-level.md)이며,
> 이 번역과 원문이 어긋나면 **원문이 이긴다**. 규범 효력을 갖는 것은 원문뿐이고,
> [`GOVERNANCE.md`](../../GOVERNANCE.md) §4의 결정도 원문을 대상으로 이루어진다.
> 어긋난 곳을 발견하면 그것은 이 파일의 결함이므로
> [이슈로 알려달라](https://github.com/mindmapmarkdown/spec/issues).
>
> MUST · MUST NOT · SHOULD 등의 요구 키워드는 대문자 영문 그대로 두었다.

| | |
|---|---|
| **상태(Status)** | Draft |
| **등급(Class)** | Normative |
| **작성자** | 정제영 `<ok@baro.pro>` |
| **작성일** | 2026-11-24 |
| **코멘트 기간 종료** | 2026-12-08 |
| **논의** | <https://github.com/mindmapmarkdown/spec/pull/117> |
| **대체하는 RFC** | — |
| **대체된 RFC** | — |

## 요약

[`GOVERNANCE.md` §5](../../GOVERNANCE.md#5-phase-transitions)의 Phase 2 → 3
방아쇠는 *"≥ 3 independent conformant implementations"* — 독립 적합 구현 3개
이상 — 을 세면서 적합성 레벨을 명시하지 않는다. §1.2.4는 가장 낮은 레벨을 공짜로
만든다. L0의 요구를 소프트웨어가 아니라 **문서**에 두기 때문이다. 그래서 이 수는
이 사양이 쓰이기 전에 이미 충족되어 있었고, 지금도 이 사양을 들어 본 적 없는
소프트웨어들로 충족된다. 이 RFC는 그 수를 **L1 이상**으로 못 박고, L0가 그
자리를 대신할 수 없는 이유를 같은 자리에 적고, **"independent"(독립)** 의 뜻을
[`VERSIONING.md` §5](../../VERSIONING.md#5-what-10-would-mean) 조건 3이 이미
담고 있는 정의를 가리켜 고정한다. 그리고 세어지는 선언이 어떤 릴리스를 밝힐 수
있는지를 함께 정한다 — 선언이 밝힌 릴리스 뒤로 Breaking 변경이 나가지 않은 동안
그 선언은 세어진다.

[`spec.md`](../../spec.md)는 한 글자도 바뀌지 않는다. 적합성 요구가 움직이지
않고, 어떤 구현도 동작을 바꾸지 않으며, 생성되는 시험 묶음은 바이트 동일하다.
이것이 RFC인 이유는 [§9](../../GOVERNANCE.md#9-amending-this-document)가
`GOVERNANCE.md`에 대한 모든 변경을 선언으로 Normative로 만들기 때문이고,
적합성이 움직여서가 아니다.

## 동기

§5는 그 숫자들이 무엇을 위한 것인지 밝히며 시작한다.

> The point of stating these as numbers is that no one — including the current
> maintainer — gets to decide later that the conditions have not been met.
>
> (이것을 숫자로 적어 두는 이유는, 나중에 누구도 — 지금 메인테이너를 포함해 —
> 조건이 충족되지 않았다고 마음대로 정하지 못하게 하려는 것이다.)

그리고 Phase 2 → 3 칸은 이렇게 되어 있다.

> ≥ 3 independent conformant implementations **and** ≥ 2 organizations depending
> on the specification in production

**"conformant"는 레벨을 말하지 않고, 가장 낮은 레벨은 아무 비용도 들지 않는다.**
§1.2.4:

> L0 places its requirement on documents, not on software. … Every existing
> Markdown reader, editor, renderer, and diff tool is therefore an L0
> implementation **without modification**.
>
> (L0는 소프트웨어가 아니라 문서에 요구를 둔다. … 그래서 기존의 모든 마크다운
> 리더·편집기· 렌더러·diff 도구가 **수정 없이** 이미 L0 구현이다.)

그러므로 첫 번째 항은 이미 충족되어 있고, 처음부터 그랬다. 지금 글자대로라면
"독립 적합 구현 3개"는 아무 마크다운 편집기 세 개다. 그것들을 만든 사람 누구도
이 사양을 읽지 않았다 — 그것이 바로 L0의 **목적**이고, 레벨의 결함이 아니라
미덕이다. 결함은 그것을 **세는 것**이다.

**그래서 구현을 센다고 적힌 방아쇠가 실제로 세는 것은 조직 수뿐이다.** 두 항은
**and**로 묶여 있어서 오늘 전환이 열릴 의무는 없다. 두 번째 항 — 프로덕션에서
사양에 의존하는 조직 2곳 이상 — 이 충족되지 않았기 때문이다. §5의 *"방아쇠가
당겨지면 30일 안에 이슈로 전환을 연다"* 가 이미 의무가 되어 있지 않은 이유는
그것 하나뿐이다. 두 항 중 하나가 영구히 참인 논리곱은 항이 하나인 논리곱이고,
남은 항이 재는 것은 **의존**이지 **독립 구현**이 아니다. 둘은 서로 다른
증거이며, 재단 이전 문제가 걸려 있는 쪽은 두 번째다.

**반대 방향의 오독도 똑같이 가능한데, 이쪽이 더 나쁘다.** 평가를 열고 싶지 않은
메인테이너는 "conformant"를 사양이 정의하는 가장 높은 레벨 — L2 — 로 읽을 수
있고, L2는 아직 쓰이지 않았다. `spec.md` 자신의 머리말이 그렇게 적는다: *"The
operations of §1.2.4 L2 — diff, merge, and subtree exchange — are not written."*
그 독법에서는 누군가 그 글을 쓰기로 할 때까지 방아쇠에 닿을 수 없고, §5의 숫자는
**쓰지 않음으로써** 메인테이너가 내리는 결정이 된다.

표 한 칸 안에 두 독법이 함께 산다. "영원히 충족됨"으로도 "영원히 충족 불가"로도
읽히는 조건은 숫자가 아니며, §5는 첫 문장에서 숫자인 것이 일의 전부라고 말한다.

**아무것도 하지 않으면.** 두 번째 항이 언젠가 충족되고, 누군가 전환 이슈를 열고,
바로 그 순간에 프로젝트는 첫 번째 항의 뜻을 한 번도 합의한 적이 없다는 사실을
발견한다 — 프로젝트가 가진 가장 무거운 거버넌스 결정인 재단 문제가 그 불일치
위에 놓인 채로. 문턱을 둘러싼 다툼을 정리할 시점은 아직 아무도 그 결과에
이해관계가 없을 때다.

**왜 지금, 왜 따로.**
[`VERSIONING.md` §5](../../VERSIONING.md#5-what-10-would-mean) 조건 3의 쌍둥이
결함 — *"at the level each claims"*, 바닥선 없음 — 이 먼저 발견되었고
<https://github.com/mindmapmarkdown/spec/pull/116>에서
[§3](../../GOVERNANCE.md#3-classes-of-change)의 **Clarifying**으로 고쳐진다.
이쪽은 거기에 얹어 보낼 수 없었다. §9가 `GOVERNANCE.md` 변경을 Normative로
만들고 RFC를 요구하므로, RFC를 받는다. 둘은 두 문서에 난 같은 실수이고 같은
답으로 착지해야 한다 — 이것은 이 RFC에 반대하는 근거가 아니라 찬성하는 근거다.
이 저장소의 상시 경고가 바로 "같은 것이 두 곳에 적혀 있으면 반드시 어긋난다"이기
때문이다.

## 상세 설계

[`GOVERNANCE.md` §5](../../GOVERNANCE.md#5-phase-transitions)에 두 군데를
고친다. 저장소의 다른 어떤 파일도 건드리지 않는다.

### 표의 행

Phase 2 → 3 행은 이렇게 된다 — 안에 든 링크가 이 파일이 아니라 `GOVERNANCE.md`
기준으로 적혀 있으므로 원본 그대로 보인다:

```markdown
| **Phase 2 → 3** | ≥ 3 independent implementations conformant at **L1 or above**, **and** ≥ 2 organizations depending on the specification in production | Transfer to a neutral foundation is formally evaluated and the evaluation is published, whatever its outcome. |
```

수는 그대로 3이다. 두 번째 항은 건드리지 않는다. 일어나는 일(재단 이전 평가)도
건드리지 않는다.

### 표 아래의 주석

§5는 이미 표 아래에 Phase 0 → 1 방아쇠의 `"External"`의 뜻을 고정하는 문단을
두고 있다. 같은 역할의 세 문단이 그 옆에 붙는다 — 표가 쓰는 말을, 표를 읽는 바로
그 자리에서 고정한다:

```markdown
"Independent" has the sense [`VERSIONING.md`
§5](VERSIONING.md#5-what-10-would-mean) condition 3 gives it: written by people
who did not write the specification. An implementation counted here must also
state the level and the release it claims, which §1.2.4 and [`VERSIONING.md`
§4](VERSIONING.md#4-what-a-conformance-claim-cites) already require of any
conformance claim. A count of implementations that have claimed nothing is not a
number, and the first sentence of this section says why that matters.

**L1 or above**, because §1.2.4 places L0's requirement on documents rather than
on software, and says what follows from that: every existing Markdown reader,
editor, renderer, and diff tool is an L0 implementation *without modification*. A
count that admitted L0 was met before this specification was written.

A claim counts **while it is still true of the current release** — while no
Breaking change has been released since the release the claim names. From 1.0
onward that is readable from the number, because [`VERSIONING.md`
§2](VERSIONING.md#2-the-number) gives a Breaking change a MAJOR bump, so a claim
counts within its own MAJOR. During 0.x it is readable from
[`CHANGELOG.md`](CHANGELOG.md), because [`VERSIONING.md`
§3](VERSIONING.md#3-before-10) gives a Breaking change a MINOR bump there while
§2 gives MINOR to Normative changes as well, so the number alone cannot tell the
two apart. A PATCH release, and a MINOR release from 1.0 onward, never un-count a
claim: §2 defines both as changes nothing that conformed stops conforming to.
```

옮기면: **"Independent"** 는 `VERSIONING.md` §5 조건 3이 주는 뜻 — 사양을 쓴
사람이 아닌 사람들이 만든 것 — 을 그대로 갖는다. 여기서 세어지는 구현은 §1.2.4와
`VERSIONING.md` §4가 이미 모든 적합성 선언에 요구하는 대로 **주장하는 레벨과
릴리스**를 밝혀야 한다. 아무것도 선언한 바 없는 구현의 수는 숫자가 아니고, 왜
그것이 문제인지는 이 절의 첫 문장이 말한다. **L1 이상**인 이유는, §1.2.4가 L0의
요구를 소프트웨어가 아니라 문서에 두고 거기서 따라오는 결과를 함께 적기 때문이다
— 기존의 모든 마크다운 리더·편집기·렌더러·diff 도구가 *수정 없이* L0 구현이다.
L0를 세는 수는 이 사양이 쓰이기 전에 이미 충족되어 있었다.
선언이 세어지는 것은 **그것이 현재 릴리스에 대해서도 여전히
참인 동안**이다 — 선언이 밝힌 릴리스 뒤로 Breaking 변경이 나가지 않은 동안이다.
1.0 이후에는 번호로 읽을 수 있다. `VERSIONING.md` §2가 Breaking 변경에 MAJOR
올림을 주므로 선언은 자기 MAJOR 안에서 세어진다. 0.x 동안에는 `CHANGELOG.md`로
읽는다. `VERSIONING.md` §3이 그 구간에서 Breaking 변경에 MINOR 올림을 주고 §2는
MINOR를 Normative 변경에도 주므로, 번호만으로는 둘을 가릴 수 없다. PATCH
릴리스와 1.0 이후의 MINOR 릴리스는 선언을 무효로 만들지 않는다. §2가 그 둘을
적합했던 것이 적합하지 않게 되지는 않는 변경으로 정의하기 때문이다.

### 선언이 밝힐 수 있는 릴리스

[`VERSIONING.md` §4](../../VERSIONING.md#4-what-a-conformance-claim-cites)는
선언이 **레벨과 릴리스**를 밝히도록 요구하고, Phase 2 → 3의 수는 어느 한 시점에
세어진다. 둘은 몇 해 떨어져 있을 수 있다. 위의 세 번째 문단이 그 시점에 어떤
선언이 아직 살아 있는지를 정하고, 그 근거가 이것이다.

이 수가 재는 것은 하나다 — 이 사양이 그 자신의 글만으로, 독립적으로 구현될 수
있다는 것. 선언은 그것을 자기가 밝힌 릴리스에 대해 말하고 다른 어떤 릴리스에
대해서도 말하지 않는다. 그러므로 그 선언이 지금 프로젝트가 펴내는 글에 대해서도
여전히 그 말을 하는지를 가르는 것은 선언의 나이가 아니라, 그 뒤에 그것을 깨뜨린
일이 있었는지다. 그리고 [`VERSIONING.md`
§2](../../VERSIONING.md#2-the-number)에는 이미 그 말이 있다 — Breaking 변경을
*"적합했던 문서나 구현이 더는 적합하지 않게 되는"* 변경으로 정의한다. 그러니 이
규칙은 새로운 판단이 아니고, §2가 가진 정의를 수에 적용한 것이다.

이것은 일부러 러닝머신이 아니다. PATCH 릴리스는 선언을 무효로 만들지 않고, 1.0
이후의 MINOR 릴리스도 그렇다. §2가 그 둘을 적합했던 것이 적합하지 않게 되지는
않는 변경으로 정의하기 때문이다. 수가 초기화되는 때는 그 수가 딛고 선 선언들이
참이기를 그쳤을 때이고, 그때뿐이다. 바로 그 순간부터 구현의 수는 프로젝트가 가진
것을 과장하기 시작한다.

세는 시점에 판단이 들어갈 자리는 없다. 1.0 이후에는 MAJOR 번호가 가른다. 0.x
동안에는 [`CHANGELOG.md`](../../CHANGELOG.md)가 가른다. [`VERSIONING.md`
§6](../../VERSIONING.md#6-release-procedure)이 날짜 붙은 항목을 릴리스의 조건으로
삼고 항목들은 [`GOVERNANCE.md`
§3](../../GOVERNANCE.md#3-classes-of-change)의 등급을 밝히므로, 두 릴리스 사이에
Breaking 변경이 나갔는지는 세는 사람에게 묻는 질문이 아니라 공개된 사실이다.
[`VERSIONING.md` §7](../../VERSIONING.md#7-yanking)은 선언이 밝힌 릴리스를
영원히 읽을 수 있게 남겨 두고, 그래서 오래된 선언도 확인이 된다.

0.x의 경우는 가정이 아니다. §5의 표에서 Phase 2 → 3을 1.0에 묶어 두는 것은
아무것도 없으므로 이 사양에 1.0이 생기기 전에도 원리상 방아쇠는 당겨질 수 있고,
§3은 그 아래에서 Breaking 변경을 MINOR 올림으로 만든다. MAJOR만으로 적힌 규칙은
사양이 가장 많이 움직이는 바로 그 구간에서 할 말이 없었을 것이다.

### 요구 키워드

이 변경은 구현에도 문서에도 아무 요구를 두지 않으므로 RFC 2119 키워드를 담지
않는다. 템플릿은 *"규범 요구를 RFC 2119 언어로, spec.md에 들어갈 모양 그대로"*
적으라고 하는데, 정직한 답은 그런 것이 없다는 것이다. 고치는 글은 사양의 규칙이
아니라 거버넌스 문서의 Phase 방아쇠다. §9가 말하는 Normative는 *"이 문서에 대한
변경"* 이고, 그것은 절차에 관한 규정이며 적합성에 관한 규정이 아니다.

### 왕복에 미치는 영향

없다. lift, 정규 투영, §1.2.4 L1의 상호 역함수 요구 모두 그대로이고, 2장의 모든
규칙도 그대로다.

### 어떻게 시험하는가

`tools/check-links.mjs`가 새 문단이 더하는 상대 링크를 검사하고 앵커가 깨지면
실패한다 — 여기서 기계로 검사할 수 있는 것은 그것이 전부다. 조건 자체는
**평가됨으로써** 시험된다. 두 번째 항이 충족되는 날, 수는 레벨과 릴리스를 각각
밝힌 공개된 선언들을 상대로 세어지고, 그런 선언 세 개가 있거나 없거나 둘 중
하나다. 이 RFC가 사는 것이 그 성질이고, 지금 글에 없는 것이 그 성질이다.

`node tools/extract-examples.mjs --check`는 드리프트를 보고하지 않는다.
`spec.md`를 건드리지 않고, 시험 묶음은 거기서 생성되기 때문이다.

### 기존 글과의 상호작용

- **§1.2.4** 는 인용되며 바뀌지 않는다. 레벨, 각 레벨의 요구, 누적 순서 모두
  그대로다.
- **`VERSIONING.md` §5 조건 3** 은
  <https://github.com/mindmapmarkdown/spec/pull/116>에서 같은 바닥선을 받는다.
  그 풀 리퀘스트가 기각되어도 이 RFC는 자기 근거로 선다. 다만 그때는 두 문서가
  L0를 세는지에 대해 서로 어긋나게 되므로, 둘을 함께 결정할 이유가 되고, 이
  RFC가 그 의존을 가정하지 않고 적어 두는 이유가 된다.
- **`VERSIONING.md` §5 조건 3에는 이 RFC의 릴리스 규칙이 들어가지 않고**, 더
  엄격한 규칙이 <https://github.com/mindmapmarkdown/spec/pull/118>에서 들어간다.
  두 수가 재는 것이 다르다. 이 수가 재는 것은 생태계의 사실 — 이 사양이
  독립적으로 구현된 적이 **있다**는 것 — 이고, 뒤에 오는 Normative 릴리스가
  이미 일어난 증명을 되돌리지는 않으므로, 여기서 선언은 Breaking 변경이 아닌
  모든 것을 넘어 살아남는다. 조건 3이 재는 것은 1.0으로 얼려질 글이
  통과하는지이고, 조건 1과 2가 규칙 집합을 닫고 모든 규칙에 예제를 요구하므로,
  거기서 더 이른 시험 묶음에 대한 통과는 더 적은 예제에 대한 통과다. 그래서
  그쪽 규칙은 Breaking 선이 아니라 시험 묶음 전체다 —
  `examples/examples.json`이 같아야 하고, 아니면 그 선언은 세어지지 않는다. 같은
  질문에 답이 둘인 이유는, 그 답들이 서로 다른 질문의 것이기 때문이다.
- **`VERSIONING.md` §4** 는 적합성 선언이 무엇을 밝혀야 하는지에 대해 인용된다.
  여기에 다시 적지 않는다. 두 파일에 적힌 절차는 결국 자기 자신과 어긋나는
  절차다.
- **§5의 30일 조항** 은 건드리지 않으며, 이 변경이 중요한 이유다. 방아쇠가
  당기는 것이 바로 그것이다.

## 대안

**아무것도 하지 않는다.** 가장 강한 근거는 두 번째 항이 막고 있으니 오늘은
무해하다는 것이다. 그것이 정확히 문제다 — **작동하지 않기 때문에** 무해하다. 두
번째 항이 충족되는 날 첫 번째 항은 처음으로 읽히는데, 읽는 사람들은 그 답에
이해관계가 있고, 두 독법이 모두 그들 앞에 놓여 있다. §5의 첫 문장은 프로젝트를
그 자리에 두지 않겠다는 약속이다. 그리고 아무것도 하지 않으면 PR #116이 착지한
뒤 이 문서는 `VERSIONING.md`와 어긋난 채로 남는다.

**L1이 아니라 L2를 요구한다.** 두 가지 이유로 기각한다. §1.2.4 L2는 쓰이지
않았으므로 방아쇠가 존재하지 않는 글에 의존하게 되고, 쓰지 않음으로써 무한히
닫아 둘 수 있다 — "가장 높은 레벨" 오독을 공식화하는 것과 같은 실패다. 그리고 L2
구현 셋은 1.0이 요구하는 L1 둘보다 훨씬 높은 문턱인데, 왜 그렇게 뛰어야 하는지는
§5도 `VERSIONING.md`도 말하지 않는다. Phase 사다리가 그것이 딛고 선 버전보다
오르기 어려워서는 안 된다.

**"사양이 정의하는 가장 높은 레벨에서 적합"이라고 쓴다.** 스스로 갱신되는
공식이고, 바로 그 점이 매력이다. 기각하는 이유는 장이 하나 착지할 때마다 공개된
방아쇠의 뜻이 **조용히** 바뀌기 때문이다. 어떤 릴리스에서 방아쇠를 충족했던
구현이 다음 릴리스에서, 누구도 아무 결정을 내리지 않은 채로 미달이 될 수 있다.
§5의 숫자가 존재하는 이유는 읽는 사람 아래에서 조건이 움직이지 않게 하는 것이고,
스스로 움직이는 공식은 틀린 숫자보다 나쁘다. 아무도 알아차릴 필요가 없기
때문이다.

**구현 항을 지우고 조직 항만 남긴다.** 첫 번째 항이 오늘 아무 기여도 하지
않는다는 사실에 정직하고, 가능한 가장 작은 diff다. 기각하는 이유는 두 항이 서로
다른 것을 재고 재단 문제는 둘 다 필요로 하기 때문이다. 프로덕션 의존은 사양이
**무게를 지고 있다**는 말이고, 독립 구현은 사양이 **그 글만으로 구현
가능하다**는 말이다. 두 조직이 똑같은 하나의 구현에 의존할 수도 있는데, 그러면
남은 항은 충족되면서 사양에 대해 아무것도 증명되지 않는다 — `VERSIONING.md` §5가
맺음 줄에서 말하는 그 실패, *"구현이 하나뿐인 사양은 그 구현의 설명서일 뿐이다"*
가 1.0이 아니라 재단 단계에 도착하는 것이다.

**레벨을 적는 대신 수를 올린다** — 3 이상이 아니라 5 이상으로. 기각: 아무것도
아닌 것 다섯 개는 여전히 아무것도 아니다. 결함은 양이 아니라 **단위**다.

**`"independent"`를 여기에 온전히 정의하고, `VERSIONING.md`가 `GOVERNANCE.md`를
가리키게 한다** — 참조 방향을 뒤집는 것. 변호할 만하다. 절차가 사는 곳은 이
문서이고, 역할과 변경 등급은 이미 그렇게 되어 있다. 이 RFC에서 기각하는 이유는
그 정의가 `VERSIONING.md` §5 조건 3에서 무게를 지고 있고 거기서는 읽는 사람이
문맥 안에서 만나는 산문으로 적혀 있는데, 옮기면 이 RFC가 그 밖에는 손대지 않는
문서를 편집하게 되기 때문이다. 어느 방향이든 중복은 사라지고, 중요한 것은 그
부분이다. 뒤에 어떤 RFC가 두 문서의 소유를 재배치한다면 이 참조도 함께 움직인다.

**어느 릴리스든 세어진다.** 가장 간단한 규칙이고 더 쓸 것이 없다. `0.3.0`에서
증명된 상호 운용성은 여전히 증명된 것이다. 기각하는 이유는 [`VERSIONING.md`
§2](../../VERSIONING.md#2-the-number)가 Breaking 변경을 *"적합했던 문서나 구현이
더는 적합하지 않게 되는"* 변경으로 정의하기 때문이다. 그런 변경이 한 번 나가면
그 앞 릴리스에 대한 선언은 프로젝트가 더는 펴내지 않는 글에 대한 선언이 된다.
그러면 그 수는 사양이 그 글만으로 구현될 수 있다는 것을, 아무도 구현하라고
요구받지 않는 글에 대해 계속 증명하게 된다.

**현재 MAJOR 안의 릴리스를 밝혀야 한다.** 질문을 봉쇄로 열었을 때 작성자가
기울었던 답이고, 그 질문 자체가 제공한 이유로 틀렸다. §3은 1.0 아래에서 Breaking
변경에 MINOR 올림을 주고, §5의 표에서 Phase 2 → 3을 1.0에 묶어 두는 것은
아무것도 없다. 그러므로 0.x 동안 "현재 MAJOR"는 지금까지 있었던 모든 릴리스이고,
`0.1.0`에 대한 선언이 Breaking 릴리스 여덟 개를 건너 `0.9.0`에서도 세어진다.
이것은 이 RFC가 고치려는 결함을 한 단계 아래에서 되풀이하는 것이다 — 아무것도
증명하지 않는 것으로 조건의 글자가 충족되는 결함. 조용히 버리지 않고 여기에 적어
두는 이유는, 작성자의 답 가운데 무엇을 버렸는지 감추는 RFC는 반대하기가 더
어렵기 때문이다.

**선행 사례.** OPML에는 적합성 레벨도 Phase 사다리도 없으므로 여기에 줄 것이
없다. 구현을 근거로 단계를 올리는 표준 단체들은 모두 "conformant"를 한정 없이
쓰지 않고 **독립적이고 서로 통신하는(interoperating)** 구현을 센다. IETF는
Internet Standard로 올라갈 때 독립적으로 상호 동작하는 구현 둘 이상과 운용
경험을 요구하고, W3C의 Candidate Recommendation 종료 기준은 사양 기능들에 대한
구현 경험으로 서술된다. 둘 중 어느 쪽도 소프트웨어가 아니라 문서에 놓인 레벨을
충족하는 구현을 셀 수 없다. 그런 레벨이 없기 때문이다. 이 사양에는 그런 레벨이
**일부러** 있고(§1.4.1), 그것이 바로 이 사양의 숫자들이 바닥선을 명시해야 하는
이유다.

## 미해결 질문

**봉쇄는 없다.** 세어지는 선언이 어떤 릴리스를 밝힐 수 있는지는 이 RFC의 첫
판에서 봉쇄로 열렸고, 위의 *선언이 밝힐 수 있는 릴리스*에서 답했다 — 같은 날,
아직 그에 대한 어떤 코멘트도 달리지 않은 때다. 거기서 변호 가능하다고 적었던 두
답은 둘 다 *대안*에서 기각했고, 그 자리에 들어온 규칙은 그 둘 중 어느 것도
아니다. 1.0 아래에서 Breaking 변경을 MINOR 올림으로 만드는 §3을 읽다가 나온
규칙이고, 바로 그 §3이 작성자 자신의 기울기를 가라앉혔다. 이제 열나흘은 뜻이
정해진 글을 상대로 흐르며, [`GOVERNANCE.md`
§4](../../GOVERNANCE.md#4-decision-making)의 게으른 합의가 침묵을 세는 대상에게
요구하는 것이 바로 그것이다. 아래의 빈 *결정과 근거*는 템플릿의 것이고, 기간이
끝날 때까지 비워 둔다.

**봉쇄가 아닌 것.**

**L2가 시험 가능해지면 바닥선을 다시 볼 것인가.** [RFC
0110](0110-subtree-exchange.md)은 3장과 L2의 세 항목 중 하나를 착지시킨다.
diff와 merge는 각각 RFC가 필요하다. 셋이 모두 쓰이고 시험 묶음이 그것들을
판정할 수 있게 되면, 뒤에 오는 RFC가 "재단 이전은 어려운 부분에 관한 것이니
Phase 2 → 3의 수는 L2를 원해야 한다"고 주장할 수 있다. 존재하지 않는 글을
상대로는 그 주장을 할 수 없으므로 여기서는 하지 않는다 — 그리고 `L1 이상`은
이미 L2 구현을 세어 준다.

**프로젝트가 세는 적합성 선언의 등록부를 둘 것인가.** 오늘 그것을 기록하는 곳은
없다. [`README.md`](../../README.md)가 `mindmapmd`를 산문으로 언급하는 것이
전부다. 등록부 없이도 방아쇠는 평가할 수 있다. 공개된 선언은 공적 사실이기
때문이다. 다만 등록부가 있으면 메인테이너가 아닌 사람도 그 수를 다시 세어 볼 수
있고, 그것은 §5 첫 문장과 같은 논지를 한 단계 아래에서 다시 말하는 것이다. 뒤에
올 풀 리퀘스트로 넘긴다. 사실을 기록하는 일은 어떤 조건도 바꾸지 않으므로 RFC가
필요하지 않다.

## 결정과 근거
