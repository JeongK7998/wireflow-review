# XU Wireflow Review v0.5.1 · 내 프로젝트에 적용하기

사용자가 GitHub 저장소 주소 또는 이 안내 링크와 “이 스킬을 내 프로젝트에 적용해줘”를 보냈다면, 현재 작업 대상은 사용자가 열어 둔 프로젝트다. 저장소 주소로 시작했다면 README에서 이 안내를 연 뒤, 아래 스킬을 로드하고 그 프로젝트에서 첫 검토를 완성한다.

비공개 저장소에서는 사용자의 열람 권한이 있는 GitHub 연결을 사용한다. 웹에서 파일을 열 수 없다면 인증된 GitHub CLI로 저장소를 임시 폴더에 클론해 그 안의 설치 ZIP을 읽을 수 있다. 스킬과 결과물은 사용자의 원래 프로젝트에 둔다.

1. 이 문서와 같은 디렉터리의 [설치 ZIP](./wireflow-review-v0.5.1.zip)을 내려받는다. 웹 문서의 상대 링크는 이 문서의 URL을 기준으로 해석한다. 저장소의 파일 미리보기로 열렸다면 ZIP의 원본 다운로드를 사용한다. 첨부된 배포 키트로 시작했다면 내부의 같은 ZIP을 사용한다.
2. 프로젝트에 파일을 쓸 수 있으면 ZIP 안의 `wireflow-review/`를 프로젝트의 `.agents/skills/` 아래에 푼다. 기존 스킬이 있으면 버전과 사용자 변경을 먼저 비교한다. 해당 경로를 자동 탐색하지 않는 에이전트는 압축을 푼 위치의 `SKILL.md`를 직접 읽는다.
3. `SKILL.md`를 따라 사용자의 기획 메모, 화면, 라우트에서 실제 목표와 동작을 찾는다. 접근 가능한 기획이 없으면 프로젝트 폴더나 기획 메모를 요청한다. 예제의 전시 도면과 상태는 새 프로젝트에 복사할 필요가 없다.
4. 프로젝트 안에 편집용 `*.flow.json`과 클릭 가능한 HTML을 만든다. 원문 필수 동작과 AI 제안 화면을 구분하고, 화면을 결정해야 할 지점은 질문으로 남긴다. 사용자가 먼저 걸어볼 경로 하나와 그 과정에서 발견한 누락·미정 사항을 산출물 링크와 함께 전달한다.

기본 생성과 정적 검사에는 Node.js 18 이상이 필요하다. 다음 명령은 프로젝트 루트에서, AI가 작성한 흐름 파일의 실제 경로로 실행한다.

```sh
node .agents/skills/wireflow-review/scripts/wireflow.cjs check design/project.flow.json
node .agents/skills/wireflow-review/scripts/wireflow.cjs build design/project.flow.json design/project.html
```

`check`는 검수 항목이 있으면 1을 반환한다. 유효한 기획이면 HTML을 생성해 막힌 조작도 확인할 수 있다. 독립 브라우저 검증에는 Node.js 20 이상, 패키지 의존성, Chromium이 추가로 필요하다. 설치본의 `references/independent-verification.md`에 명령과 범위가 있다. 파일이나 명령을 사용할 수 없는 채팅에서는 사용자가 기획을 첨부하면 편집용 흐름 JSON을 제공하고, HTML 생성과 브라우저 검증에는 로컬 실행 환경이 필요하다고 알려 준다.

**For an English-language project.** Read the linked skill in the user's project, use the project's own brief, set the flow locale to English, and deliver the editable flow JSON, standalone HTML and verification results. All commands above work from the project root.
