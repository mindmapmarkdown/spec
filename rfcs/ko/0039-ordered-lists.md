# RFC 0039: 번호 목록은 번호를 간직한다

> **번역본이다.** 정본은 영문 [`rfcs/0039-ordered-lists.md`](../0039-ordered-lists.md)이며,
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
| **작성일** | 2026-09-15 |
| **코멘트 기간 종료** | 2026-09-29 |
| **논의** | <https://github.com/mindmapmarkdown/spec/pull/39> |
| **대체하는 RFC** | — |
| **대체된 RFC** | — |

## 요약

지금은 번호 목록이 번호를 잃는다. `1. Install`은 레이블이 `Install`인 항목으로 lift
되어 `- Install`과 구별되지 않고, 정준 투영은 그것을 `- Install`로 되돌려 쓴다. 3부터
시작한 목록은 그 사실을 잊는다. 날짜로 시작할 뿐인 줄은 날짜를 잃는다.

RFC [0004](../0004-canonical-hierarchy.md)는 이 질문을 일부러 열어 두었다 — *"번호가
트리의 일부인지, 표기일 뿐인지"* — 그리고 3장 전에 정하라고 했다. 0.1.0 전에 정할
질문 목록에는 들어가지 않았는데, 들어갔어야 했다. 0.1.0이 번호를 버린다고 기록하는
순간, 번호를 간직하는 변경은 Breaking이 된다.

이 RFC는 번호를 간직한다. 번호 목록의 항목은 **ordinal**(CommonMark가 매기는 번호)과
**delimiter**(`.` 또는 `)`)를 기록한다. 불릿 항목은 바뀌지 않고, `kind`는 두 값을
유지한다. 투영은 번호를 되돌려 쓰고, 중첩된 내용을 그 위 표시 문자의 폭만큼 들여쓰며,
CommonMark가 합쳐 버릴 두 목록을 떼어 쓴다.

**기존 예제는 하나도 바뀌지 않는다** — 21개 중 번호 목록을 담은 것이 없다. 프로토타입이
스위트를 그대로, 여기서 제안하는 예제 여덟을, 그리고 사례 열셋을 더 통과한다.

## 동기

### 지금 잃는 것

각 행은 `mindmapmarkdown/mindmapmd@657da17`의 레퍼런스 구현으로 실행했다.

| 문서 | 지금의 트리 | 되돌려 쓴 결과 |
|---|---|---|
| `1. Install`, `2. Configure` | 항목 `Install`, `Configure` | `- Install`, `- Configure` — **번호 매긴 절차가 불릿 목록이 된다** |
| `3. Test`, `4. Ship` | 항목 `Test`, `Ship` | `- Test`, `- Ship` — **시작 번호가 사라진다** |
| `1) One`, `2) Two` | 항목 `One`, `Two` | `- One`, `- Two` |
| `- 2026. 1. 15. 10:00` | 빈 항목 안의 빈 항목 안의 빈 항목 안의 `10:00` | **`2026. 1. 15.`라는 글자가 트리 어디에도 없다** |

마지막 행은 특이한 문서가 아니다. CommonMark는 `2026.`, `1.`, `15.`를 세 겹의 번호
목록으로 읽고 — CommonMark 렌더러도 그렇게 보여준다 — 번호를 기록하지 않으니 날짜가
트리에서 통째로 사라진다. 번호를 버리는 것은 표기의 손실에 그치지 않는다. 여기서는
내용이 살아남는다고 약속하는 사양에서 **내용**이 사라진다.

### 번호가 표기가 아니라 뜻인 이유

렌더링된 문서를 읽는 사람은 번호를 본다. `3. Test`는 세 번째 단계로 보이고, 1부터
번호 매긴 절차는 불릿 모음이 말하지 않는 것을 말한다. 이 사양이 트리와 뷰를 가르는 기준
— *두 구현이 다르게 답해도 둘 다 틀리지 않을 수 있는가?* — 이 답을 준다. 같은 문서를
서로 다른 단계 번호로 보여준 두 도구가 둘 다 맞을 수는 없다.

CommonMark가 스스로 표기로 다루는 것은 이보다 좁고, 이 RFC는 그것을 따른다. 목록의
번호는 **시작 번호**와 **구분 기호**다. 첫 항목 뒤의 항목에 쓴 숫자는 읽지 않는다.
`1.`, `1.`, `1.`은 `1.`, `2.`, `3.`과 똑같이 1, 2, 3으로 렌더링되고, 이 RFC도 둘에 대해
같은 것을 기록한다.

### 왜 지금인가

[`CHANGELOG.md`](../../CHANGELOG.md)는 Normative 질문이 열린 채로는 릴리스를 내지
않는다고 적는다. 나중에 정하면 Breaking이 되기 때문이다. 이 질문은 열려 있었고 그
목록에 없었다. 0.1.0 전에 정하면 첫 판이 손실을 기록하지 않게 된다.

## 상세 설계

여기의 레이블은 RFC [0038](https://github.com/mindmapmarkdown/spec/pull/38)이 제안대로 채택되어 `L-11`을
더한다고 가정한다. 그렇지 않으면 아래의 `L-12`는 `L-11`이 된다.

### Lift

**`L-12` 신설.**

> **L-12.** 번호 목록의 항목은 **ordinal**과 **delimiter**를 가진다. ordinal은 그
> 목록의 시작 번호에 그 목록 안에서 항목의 0부터 센 위치를 더한 값이며, 둘 다
> CommonMark가 정하는 대로다. delimiter는 쓰인 대로 `.` 또는 `)`다. 불릿 목록의 항목은
> 둘 다 갖지 않는다. 목록 표시 문자는 레이블의 일부가 아니다(E-4).

*(Informative)* CommonMark는 목록의 시작 번호를 첫 항목에서만 읽으므로, 이후 항목에
쓴 번호는 기록하지 않는다. 새 목록은 CommonMark가 새 목록을 시작하는 곳에서 시작한다.
구분 기호가 바뀔 때, 불릿과 번호 사이가 바뀔 때, 목록을 끊는 블록이 올 때다. 빈 줄만으로는
시작하지 않는다.

*(Informative)* 이 RFC는 `L-3`의 문장 그대로에 기댄다. 목록 뒤에 오는 블록은 그 앞의
가장 가까운 노드, 즉 그 목록의 **가장 깊은 마지막 항목**에 붙는다. 레퍼런스 구현은
지금 그런 블록을 감싸는 섹션에 붙이는데, 이것은 사양의 한 읽기가 아니라 구현의 결함이며
프로토타입이 바로잡는다.

### 적격성

**`S-5` 신설 — 다시 시작하는 목록은 떼어 쓸 수 있어야 한다.**

> **S-5.** 연속된 형제 항목 사이에서, delimiter가 앞 항목과 같고 ordinal이 앞 항목보다
> 1 크지 않은 번호 항목은 목록을 **다시 시작한다**. 모든 다시 시작에 대해, 앞 항목의
> 가장 깊은 마지막 자손은 비어 있지 않은 내용을 가져야 한다(MUST).

CommonMark는 같은 종류·같은 구분 기호의 인접한 두 목록을, 둘 사이를 끊는 블록이 없으면
합친다. 어떤 문서에서든 그 블록은 — `L-3`에 따라 — 두 번째 목록 바로 앞 노드의 내용이다.
`S-5`는 문서가 이미 담고 있어야 했던 것을 트리에 명시해, 투영이 그것을 되돌려 쓸 수 있게
한다(`P-12`).

**`S-6` 신설 — 올바른 번호.**

> **S-6.** `ordinal`과 `delimiter`는 함께, 그리고 항목에만 나타나야 한다(MUST). ordinal은
> 음이 아닌 정수여야 하고, delimiter는 `.` 또는 `)`여야 한다(MUST). 목록을 시작하는
> 항목 — 앞 항목을 잇지 않는 항목 — 의 ordinal은 999999999 이하여야 한다(MUST).

CommonMark의 목록 표시 문자는 숫자를 아홉 자리까지만 담는다. `999999999.`는 목록을
시작하고, `1000000000.`은 문단이다. 목록을 잇는 항목은 이 한계를 넘을 수 있고 —
999999999에서 시작하는 목록의 둘째 항목은 1000000000번이다 — `S-6`은 그것을 허용한다.
그런 항목의 번호는 CommonMark가 읽도록 쓰이지 않기 때문이다(`P-3`).

적격의 정의는 이렇게 된다: S-1, S-2, S-4, S-5, S-6을 만족하는 트리.

### 투영

**`P-3` 수정.**

> **P-3.** 불릿 항목의 표시 문자는 `-`여야 한다(MUST). 번호 항목의 표시 문자는 ordinal
> 뒤에 delimiter를 붙인 것이어야 한다(MUST). 목록을 잇는 항목의 ordinal이 999999999를
> 넘으면 ordinal 대신 `999999999`를 써야 한다(MUST).

**`P-4` 수정.**

> **P-4.** 항목의 내용과 중첩 목록은 그 항목 표시 문자의 폭에 공백 하나를 더한 만큼
> 들여써야 한다(MUST). `-` 아래는 두 칸, `1.` 아래는 세 칸, `10.` 아래는 네 칸이다.

지금 문장은 모든 중첩 단계를 두 칸이라고 한다. 번호 항목 아래에서 그것은 다른 것이
아니라 틀린 것이다. `1.` 아래 두 칸 들여쓴 목록은 그 안에 중첩되지 않는다 — CommonMark는
첫 목록 뒤의 새 목록으로 읽는다. `10.` 아래는 네 칸이 필요하다.

**`P-12` 신설 — 연속된 항목과 다시 시작.**

> **P-12.** 연속된 형제 항목은 각 항목이 앞 항목을 잇는 동안 — 같은 종류이고, 번호
> 항목이면 같은 delimiter에 ordinal이 1 큰 동안 — 하나의 목록으로 써야 한다(MUST). 한
> 목록이 끝나고 다른 목록이 시작하는 곳에는 빈 줄 하나로 둘을 떼어야 한다(MUST). 다시
> 시작(`S-5`)에서는 앞 항목의 가장 깊은 마지막 자손의 내용을 두 목록 사이에, 들여쓰지
> 않고, 첫 목록 안이 아니게 써야 한다(MUST). 그러면 첫 목록이 느슨한지는 `P-7`이 첫
> 목록에 남은 내용으로 정한다.

서로 다른 목록 사이의 빈 줄은 모양이 아니라 필요다. 빈 줄이 없으면 번호가 1이 아닌 번호
항목이 위 항목의 게으른 연속 줄로 읽힌다. 그리고 다시 시작 규칙이 번호의 재시작을
살려 둔다. 끊는 문단을 들여쓰면 그것이 첫 목록 안에 들어가 두 번째 목록이 첫 목록에
합쳐지고, 1, 2가 3, 4로 바뀐다.

### 인코딩

**`E-2` 수정.**

> **E-2.** 노드는 멤버가 정확히 넷 — `kind`, `label`, `content`, `children` — 인 JSON
> 객체로 인코딩해야 한다(MUST). 단 ordinal을 가진 항목은 정확히 여섯 — `kind`, `label`,
> `ordinal`, `delimiter`, `content`, `children` — 이다. `content`나 `children`이 비어
> 있어도 모든 멤버가 있어야 한다(MUST).

**`E-9` 신설.**

> **E-9.** `ordinal`은 음이 아닌 정수인 JSON 수여야 하고, `delimiter`는 문자열 `.` 또는
> 문자열 `)`여야 한다(MUST).

**`E-8` 수정.** 멤버는 `kind`, `label`, `ordinal`, `delimiter`, `content`, `children`
순서로 나타나는 것이 좋다(SHOULD).

`E-3`은 바뀌지 않는다. `kind`는 여전히 `section` 또는 `item`이다.

### 예제

예제 여덟을 제안한다. 모두 프로토타입으로 확인했고, 정준 문서인지와 — 트리 동등성을
넘어 — CommonMark 렌더러가 투영 전후로 **모든 항목에 같은 번호**를 보여주는지도 확인했다.

`````markdown
An ordered item records its number and delimiter (L-12):

````example
# Setup

1. Install
2. Configure
.
{"content":[],"children":[
  {"kind":"section","label":"Setup","content":[],"children":[
    {"kind":"item","label":"Install","ordinal":1,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Configure","ordinal":2,"delimiter":".",
     "content":[],"children":[]}]}]}
````

A list that starts at 3 keeps its start:

````example
# Steps

3. Test
4. Ship
.
{"content":[],"children":[
  {"kind":"section","label":"Steps","content":[],"children":[
    {"kind":"item","label":"Test","ordinal":3,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Ship","ordinal":4,"delimiter":".",
     "content":[],"children":[]}]}]}
````

CommonMark does not read the numbers written on later items, and neither does lift.
Canonical form writes them in order, so this document is conforming and not
canonical:

````example
# Steps

1. One
1. Two
1. Three
.
{"content":[],"children":[
  {"kind":"section","label":"Steps","content":[],"children":[
    {"kind":"item","label":"One","ordinal":1,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Two","ordinal":2,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Three","ordinal":3,"delimiter":".",
     "content":[],"children":[]}]}]}
````

The delimiter is recorded:

````example
# Steps

1) One
2) Two
.
{"content":[],"children":[
  {"kind":"section","label":"Steps","content":[],"children":[
    {"kind":"item","label":"One","ordinal":1,"delimiter":")",
     "content":[],"children":[]},
    {"kind":"item","label":"Two","ordinal":2,"delimiter":")",
     "content":[],"children":[]}]}]}
````

A nested list is indented by the width of the marker it sits under (P-4):

````example
# Steps

9. Prepare
   - Back up
10. Deploy
    - Swap
.
{"content":[],"children":[
  {"kind":"section","label":"Steps","content":[],"children":[
    {"kind":"item","label":"Prepare","ordinal":9,"delimiter":".",
     "content":[],"children":[
       {"kind":"item","label":"Back up","content":[],"children":[]}]},
    {"kind":"item","label":"Deploy","ordinal":10,"delimiter":".",
     "content":[],"children":[
       {"kind":"item","label":"Swap","content":[],"children":[]}]}]}]}
````

A paragraph between two items interrupts the list in CommonMark, and the numbering
continues. The paragraph is content of the item before it (L-3), and canonical form
writes it inside that item, as one list:

````example
1. Overview

Overview text.

2. Detail
.
{"content":[],"children":[
  {"kind":"item","label":"Overview","ordinal":1,"delimiter":".",
   "content":[{"block":"paragraph","source":"Overview text."}],
   "children":[]},
  {"kind":"item","label":"Detail","ordinal":2,"delimiter":".",
   "content":[],"children":[]}]}
````

When the numbering restarts, canonical form keeps the interrupting paragraph
between the lists, unindented, so that the restart survives (P-12):

````example
# Rollout

1. Build
2. Verify

Then, on each server:

1. Stop
2. Swap
.
{"content":[],"children":[
  {"kind":"section","label":"Rollout","content":[],"children":[
    {"kind":"item","label":"Build","ordinal":1,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Verify","ordinal":2,"delimiter":".",
     "content":[{"block":"paragraph","source":"Then, on each server:"}],
     "children":[]},
    {"kind":"item","label":"Stop","ordinal":1,"delimiter":".",
     "content":[],"children":[]},
    {"kind":"item","label":"Swap","ordinal":2,"delimiter":".",
     "content":[],"children":[]}]}]}
````

A line that begins with a date is three nested ordered lists to CommonMark, and
every number is kept:

````example
# Log

- 2026. 1. 15. 10:00
.
{"content":[],"children":[
  {"kind":"section","label":"Log","content":[],"children":[
    {"kind":"item","label":"","content":[],"children":[
      {"kind":"item","label":"","ordinal":2026,"delimiter":".",
       "content":[],"children":[
         {"kind":"item","label":"","ordinal":1,"delimiter":".",
          "content":[],"children":[
            {"kind":"item","label":"10:00","ordinal":15,"delimiter":".",
             "content":[],"children":[]}]}]}]}]}]}
````
`````

사양 본문이 영문이므로 예제의 설명 문장도 원문 그대로 두었다. 첫째·둘째·넷째·다섯째·
일곱째는 정준 문서이고, 셋째·여섯째·여덟째는 아니다.

### 왕복에 미치는 결과

- **트리.** 번호 목록을 담은 모든 문서가 다른 트리로 lift된다. 항목에 `ordinal`과
  `delimiter`가 생긴다. 목록 뒤에 쓴 블록은 그 목록의 가장 깊은 마지막 항목에 붙는데,
  이것은 `L-3`이 이미 요구하던 것이다.
- **정준 문서.** 번호 목록은 `P-3`이 `-`를 요구했기 때문에 정준인 적이 없었다. 이 RFC
  아래에서는 정준일 수 있다. 시작부터 차례로 이어진 번호, 기록된 구분 기호, 표시 문자
  폭만큼 들여쓴 중첩이면 된다. 번호 항목 아래 두 칸 들여쓴 불릿 목록은 중첩이 아니게
  되는데 — 그것은 이미 CommonMark의 읽기였고, 그런 문서에서 lift한 트리는 원래부터 그
  목록을 중첩으로 갖지 않았다.
- **스위트.** 기존 예제 중 번호 목록이나 목록 뒤 블록을 담은 것이 없다. 프로토타입이
  21개를 모두 그대로 통과한다.
- **등급.** Breaking이 아니라 Normative다. 릴리스된 것이 없으니 어느 판에 대한 적합성도
  주장된 적이 없고, 적합성을 잃는 문서도 없다.

### 어떻게 시험하나

`spec.md`에 들어가면 예제 여덟으로. 그리고 레퍼런스 구현의 브랜치
[`rfc/ordered-list-prototype`](https://github.com/mindmapmarkdown/mindmapmd/tree/rfc/ordered-list-prototype)
의 프로토타입으로. 이 프로토타입은 기존 스위트, 예제 여덟을 정확히, 그리고 사례 열셋을
더 통과한다 — 나란히 놓인 불릿과 번호 목록, 구분 기호 변경, 최상위와 중첩 목록 안의 다시
시작, 자식을 가진 항목 뒤의 다시 시작, 다시 시작하지 않는 빈 줄, 0과 아홉 자리 시작 번호,
아홉 자리를 넘는 항목, 이스케이프한 번호, 목록 뒤 블록. 각 사례는 다음을 확인한다.

- 트리가 왕복에서 살아남는가
- 두 번째 투영이 첫 번째와 바이트까지 같은가
- **CommonMark 렌더러가 투영 전후로 모든 항목에 같은 번호를 보여주는가**
- 투영된 줄이 공백으로 끝나지 않는가

손으로 만든 트리로 `S-5`와 `S-6`이 거부해야 할 것을 거부하는지 확인한다.

### 한계

ordinal은 아홉 자리 시작 번호에 목록의 항목 수를 더한 것보다 크지 않은 정수다. 항목의
연속을 목록으로 나누는 것은 한 번의 선형 탐색이고, 가장 깊은 마지막 자손을 찾는 것도
그렇다.

## 대안

**아무것도 하지 않기.** 번호는 계속 버려지고, 절차는 내보낼 때 불릿 목록이 되며, 날짜로
시작하는 줄은 글자를 잃는다. RFC 0004는 3장 전에 답을 요구했다. 기각.

**표시 문자를 레이블에 두기** — `1. Install`을 레이블로. markmap과 easymindmap이
그렇게 하는데, 세 곳에서 실패한다. 표시 문자는 인라인 내용이 아니므로 `E-4`와
어긋난다. 항목을 옮기면 번호가 낡은 채 남는다. 그리고 되돌려 쓸 수 없다. `- 1. Install`은
번호 목록을 담은 불릿이고, `- 1\. Install`로 이스케이프하면 다른 레이블이 된다. 날짜 줄도
구하지 못한다. 레이블이 생기기 전에 CommonMark가 이미 목록으로 쪼갰기 때문이다. 기각.

**세 번째 kind, `ordered_item`.** `kind`는 노드가 헤딩으로 쓰였는지 목록 항목으로
쓰였는지를 기록한다 — RFC 0004가 트리의 일부로 만든 구별이다. 번호인지 아닌지는 항목이
속한 목록의 성질이고, 세 번째 kind도 시작 번호와 구분 기호를 어딘가에 담아야 한다. 기각.

**목록 노드.** 각 목록을 시작 번호를 가진 노드로 기록한다. 트리에는 목록 노드가 없다.
그것을 더하면 `L-7`에 따른 모든 항목의 깊이와 스위트의 모든 트리 모양이 바뀐다. 기각.

**시작 번호를 첫 항목에만 기록하기.** 이후 항목의 번호는 따라 나오므로 같은 정보를
담는다. 선택하지 않은 이유는, 다시 시작을 다른 방법으로 표시해야 하고, 항목마다 ordinal이
있으면 모든 예제가 독자가 보는 번호를 그대로 보여주기 때문이다. 선택한 설계의 대가를
분명히 적는다. 트리에서 항목 순서를 바꾸는 프로그램은 번호를 다시 매겨야 하며, 그러지
않으면 `S-5`가 거부할 수 있는 다시 시작을 만든다.

**항목마다 쓴 번호를 기록하기.** CommonMark는 그 숫자를 읽지 않고, 어떤 렌더러도 보여주지
않는다. 표기다. 기각.

**다시 시작하는 목록을 HTML 주석으로 떼기** — CommonMark 문서가 스스로 권하는 방법이다.
주석은 HTML 블록이고, `L-3`은 그것을 내용으로 기록한다. 투영이 문서에 없던 노드 내용을
더하게 된다. **구분 기호를 `.`에서 `)`로 바꾸기**도 기록된 데이터를 바꾼다. 끊는 내용을
들여쓰지 않고 쓰는 방법은 트리가 이미 가진 것을 쓴다. 기각.

**선행 사례.** 여기서 기록하는 정보를 CommonMark가 정확히 정의한다. 번호 목록은 시작
번호와 구분 기호를 가지며, 이후 번호는 무시된다. OPML에는 번호 목록이 없다. markmap은 번호
항목을 번호가 붙은 노드 글자로 렌더링하며, 위의 레이블 대안과 같다.

## 미해결 질문

**링크 참조 정의.** `[x]: https://example.com` 같은 정의는 CommonMark의 문서 트리에 블록을
만들지 않으므로, `L-3`이 붙일 것이 없고 어디에도 기록되지 않는다. 이 RFC를 준비하며 찾은
결과가 둘이다.

- 두 번호 목록 사이의 정의는 목록을 끊는다. 따라서 `1. a`, 정의, `1. b`는 떼어 쓸 것이 없는
  다시 시작으로 lift된다 — 적합한 문서에서 `S-5`가 거부하는 트리가 나온다.
- 더 넓게, **투영이 모든 링크 참조 정의를 버린다.** 그래서 `[the guide][g]` 같은 참조식
  링크는 한 번 왕복하면 링크가 아니게 된다. 번호 목록과 무관하게 어떤 문서에서든 내용이
  사라지는 것이다.

둘째는 이 RFC가 만든 문제가 아니고 이 RFC보다 크다. 이슈 [#40](https://github.com/mindmapmarkdown/spec/issues/40)으로 올렸다. 첫째는 둘째를
해결하는 것으로 해결된다.

**번호 항목 안의 여러 줄 내용**은 이후 줄에 항목의 들여쓰기를 간직한다 — RFC 0038 1부가
고치는 결함이다. 세 칸·네 칸 표시 문자는 그것을 더 잘 보이게 할 뿐 다른 문제로 만들지
않는다. 프로토타입은 그 사례를 0038을 기다리는 것으로 기록했다.

**빈 레이블과 내용.** CommonMark는 `-` 다음에 빈 줄과 들여쓴 글자가 오면 빈 항목과 그 뒤의
문단으로 읽는다. 따라서 레이블이 비고 내용이 있는 항목은 되돌려 쓸 수 없다. 지금의 불릿
항목에서도 그렇고, 여기서 바꾸지 않는다.

**작업 목록 항목.** RFC 0004의 다른 열린 질문 — `- [ ]`가 트리의 일부인가 — 은 다루지 않는다.

## 결정과 근거

<!-- 코멘트 기간이 끝날 때까지 비워 둔다. -->
