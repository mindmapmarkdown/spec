# Mindmap Markdown — spec

계층형 지식을 인간 뷰(마인드맵·아웃라인)와 기계 텍스트(마크다운) 사이에서
**무손실로 왕복**시키는 표준의 사양 저장소.

- 사이트: https://mindmapmarkdown.org
- 조직: https://github.com/mindmapmarkdown
- 상태: **Draft** (Phase 0, 단독 메인테이너 — `GOVERNANCE.md` 참조)

## 사양의 범위 — 반드시 지킬 것

- 사양이 규정하는 것은 **`md ↔ tree`**다. `md ↔ mindmap`이 아니다
- 마인드맵과 아웃라인은 트리의 **투영(view)**일 뿐이며, 사양은 이를 언급하지 않는다
- HTML은 포맷이 아니라 **뷰를 담아 나르는 컨테이너**다
- 뷰를 사양에 넣기 시작하면 범위가 폭발하고, 표준이 아니라 제품 명세가 된다

## 저장소 구조

| 경로 | 내용 |
|---|---|
| `spec.md` | 규범 사양 본문 + 내장 예제 (아직 없음) |
| `examples/` | `spec.md`에서 **생성**되는 테스트 케이스 |
| `rfcs/` | RFC 문서 |
| `tools/` | 예제 추출 등 스크립트 |

관련 저장소: `conformance` (적합성 스위트), `mindmapmd` (레퍼런스 구현), `adapters` — 모두 예정.
`easymindmap`은 레퍼런스 애플리케이션이며 **이 조직 밖**에 있다.

## 라이선스 — 파일 추가 시 확인

- 사양 텍스트·문서 (`spec.md`, `docs/**`, `rfcs/**`, 산문 문서): **CC-BY-4.0**
- 코드·예제·스크립트 (`tools/**`, `examples/**`, 워크플로): **Apache-2.0**

상세는 `LICENSE`. 새 파일이 어느 쪽인지 판단이 서지 않으면 물어볼 것.

## 규칙

- **모든 커밋은 DCO 사인오프 필수** (`git commit -s`).
  실명 신원이어야 하며, 익명·가명 사인오프는 받지 않는다 (`CONTRIBUTING.md`)
- `main` 직접 푸시 금지. 브랜치 → PR
- **normative 변경은 RFC 필요** — 변경 등급 판정은 `GOVERNANCE.md` §3
- 규범 예제는 `spec.md` 안에 쓰고 `examples/examples.json`은 스크립트로 생성한다.
  **`examples.json`을 직접 수정하지 말 것**
- 숫자·기간·절차는 `GOVERNANCE.md`를 **참조**하고 복제하지 않는다.
  두 곳에 같은 내용이 있으면 반드시 어긋난다

## 커밋 메시지

Conventional Commits — `docs:` `spec:` `feat:` `fix:` `chore:`

## 작업 전 읽을 것

`GOVERNANCE.md` — 역할, 변경 등급, RFC 절차, Phase 전환 조건, 승계 조항.
이 저장소의 거의 모든 절차적 판단이 여기에 근거한다.
