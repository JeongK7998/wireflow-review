# XU Wireflow Review v0.5.1

바이브 코딩으로 앱을 기획할 때, 사용자 흐름을 따라가며 빠진 동작과 아직 정해야 할 일을 발견하는 스킬입니다. 캔버스 언어는 한국어와 영어를 지원한다.

[![Night Atlas 전체 흐름](media/01-canvas.png)](media/01-canvas.png)

## 시작하기

- GitHub에서 받는 사람은 저장소 주소를 프로젝트가 열린 AI 채팅에 붙여넣고 “이 스킬을 내 프로젝트에 적용해줘”라고 요청한다. 저장소 README는 [AI용 설치 안내](APPLY.md)로 연결된다.
- 파일로 받는 사람은 전체 배포 키트를 AI에 첨부하고 “첨부한 키트의 APPLY.md를 읽고 이 스킬을 내 프로젝트에 적용해줘”라고 요청한다. 스킬 ZIP만 첨부했다면 “이 ZIP을 풀고 SKILL.md를 따라 내 프로젝트의 와이어프레임을 만들어줘”라고 요청한다.
- 직접 설치할 때는 [설치 ZIP](wireflow-review-v0.5.1.zip) 안의 `wireflow-review/`를 프로젝트의 `.agents/skills/` 아래에 푼다. 결과 파일은 사용자의 프로젝트에 둔다. 기본 검수와 HTML 생성은 Node.js 18 이상, 독립 검증은 Node.js 20 이상과 Chromium을 사용한다. 독립 검증용 의존성은 최초 설치 시 내려받는다.

## 대표 예제

[Night Atlas 클릭 더미](example/night-atlas.html)는 설치 없이 브라우저에서 열린다. [원문 기획](example/brief.md)과 [편집용 흐름 JSON](example/night-atlas.flow.json)도 함께 제공한다. 도면 4종이 흐름 안에 포함되어 있다. 데스크톱 더미의 내부 크기는 1040×680 CSS px다.

1. 운영 데스크의 A실과 B실을 클릭해 입체 도면과 입면도를 대조한다. 데스크로 돌아와 작업표를 연다.
2. A실에서 점검 메모를 입력하고 확인란을 선택한다. 전송 직전 작성 화면으로 돌아가 메모를 수정해 본다.
3. 인계 후 **보낸 메모 다시 열기**에서 연결이 끊긴다. **Flow 검증 → 보낸 메모 재열람**에서 기획 필수 동작과 미확정 설계를 확인해 AI 수정 요청에 담는다.
4. 별도 기록 화면을 검토하려면 해당 항목에서 **인계 기록 화면으로 연결**을 선택한다. 다시 보낸 메모를 열어 입력값을 확인한다. 이 선택은 열려 있는 더미에 적용된다.

압축을 푼 배포 키트의 루트에서 아래 명령으로 같은 예제를 생성할 수 있다. 먼저 설치 ZIP을 현재 폴더에 풀어 `wireflow-review/`가 보이게 한다.

```sh
node wireflow-review/scripts/wireflow.cjs check example/night-atlas.flow.json
node wireflow-review/scripts/wireflow.cjs check example/night-atlas.flow.json --with open-record
node wireflow-review/scripts/wireflow.cjs build example/night-atlas.flow.json example/rebuilt.html
```

첫 검사는 재열람 누락과 여파를 보고하며 종료 코드 1을 반환한다. 두 번째 검사는 별도 기록 화면 제안을 적용한 경우를 확인한다. 세 번째는 기존 끊긴 연결이 보이는 원본을 빌드한다.

## 확인한 범위

설치 ZIP을 새 폴더에 풀어 회귀 시험 22개를 통과했다. 별도 Codex 세션에는 로컬 HTTP의 AI용 안내 링크와 인쇄소 기획만 주었다. 그 세션에서 ZIP 설치, 화면 3개 생성, 발주·취소 시나리오 2개와 Chromium 경로 14개 통과를 확인했다.

Night Atlas의 실제 브라우저 조작에서는 입력이 빠진 두 경우, 전송 전 메모 수정, 전송 뒤 재열람 실패와 요청 복사를 확인했다. 별도 기록 화면을 더미에서 선택한 뒤 수정한 메모가 그대로 보였다. 검수 패널의 관찰 요건 7개, 전체 여정 2개, 예외 여정 1개가 통과했다. 영상은 1600×1000 Chromium 창에서 녹화했다.

## 게시와 미디어

GitHub 저장소 첫 화면에 소개, 시연 영상과 예제를 담은 README를 둔다. 설치 ZIP은 저장소에서 내려받을 수 있고, 버전을 발행할 때 같은 ZIP과 전체 배포 키트를 GitHub Releases에 첨부할 수 있다. 클릭 더미는 HTML 원본을 내려받아 브라우저에서 연다. 전체 키트에는 [오프라인 미리보기](index.html)도 들어 있다.

| 용도 | 리소스 |
|---|---|
| 예제 화면 상세 | [설치 도면 PNG](media/installation-detail.png) |
| 원본 브라우저 캡처 | [전체 캔버스](media/01-canvas.png) · [평면도](media/02-floor-plan.png) · [입체 도면](media/03-installation.png) · [검증 패널](media/04-review.png) · [수정 요청](media/05-handoff.png) |
| 실제 조작 시연 | [무음 H.264 MP4](media/night-atlas.mp4) · [한국어 WebVTT 자막](media/night-atlas.ko.vtt) |
| 무결성 | [SHA-256 체크섬](SHA256SUMS) |

예제 도면과 영상은 가상 전시를 위해 제작한 그림과 실제 더미 조작 녹화다. 폰트는 Inter, Patrick Hand, Gaegu를 사용하며 각 OFL 고지는 설치 ZIP의 `assets/paper/fonts/`와 생성된 HTML의 스타일에 포함된다. 스킬 코드와 홍보물의 공개 재배포 라이선스는 제작자가 정할 항목이다.
