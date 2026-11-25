# How to use XU Wireflow Review

[English](#english) · [한국어](#한국어)

## English

### Where changes take effect

| Status in Wireflow | What it means |
| --- | --- |
| **Applied in Wireflow** | The AI updated the flow file and its clickable mockup. For example, the booking button may show a new label in the preview. |
| **Sent to development** | You sent the implementation request to the app's development chat and marked it as sent in Wireflow. The button in the real app gets the new label when the development AI edits the app code. |

### 1. Open a preview

Open your app project in your AI coding tool and send this request. Your notes, existing screens, or routes can serve as the starting point.

```text
https://github.com/JeongK7998/wireflow-review
Apply Wireflow Review v0.7.1 to this project and open a connected preview if Codex CLI is available.
```

A **connected preview** needs Node.js 18+ and a signed-in Codex CLI. The AI can run the command below from your project root. Use your actual flow and HTML paths, keep the command running, and open the local URL it prints. [AI setup guide](APPLY.md)

```sh
node .agents/skills/wireflow-review/scripts/wireflow.cjs serve design/project.flow.json design/project.html
```

To explore the controls without setting up a project, download and open the demo HTML in your browser. [Download the pottery booking demo](example/pottery-booking.en.html?raw=1)

### 2. Walk through a task and update it

- Use **Overview** to see the whole flow. Select a screen to zoom in, then click the buttons inside the mockup to follow the arrows. Use **⋯** to choose a path, a device size, or a preview font.
- Describe a change in the project chat or click **Request a change** beside a screen. In a connected preview, choose **Apply to Wireflow**. The open preview refreshes after the AI updates the flow, and **Applied in Wireflow** confirms the result.
- In a standalone HTML, save the screen request, then use **Copy waiting requests to chat** from the list. Paste it into the project chat so the AI can update the mockup.

### 3. Request implementation in your app

Open **AI change requests**. Each applied item shows what you asked for, what changed in the mockup, and whether the development request has been sent. Recheck the flow and select the changes you want implemented.

1. Select the changes to implement and choose **Copy development request prompt**.
2. Paste and send it in the chat that has your app project open. The development AI uses that request to edit your app code.
3. After sending the request, choose **Mark sent to development** in Wireflow. When implementation is complete, run the actual app and verify the affected flow there.

## 한국어

### 어디에 반영되는지 확인하기

| Wireflow에 표시되는 상태 | 의미 |
| --- | --- |
| **와이어플로우 반영 완료** | AI가 흐름 파일과 클릭 가능한 미리보기를 바꿨어요. 예를 들어, 예약 버튼의 새 이름을 더미 화면에서 확인할 수 있어요. |
| **개발 요청 전달 완료** | 실제 앱 프로젝트의 채팅에 구현 요청을 보내고 Wireflow에서 전달을 표시했어요. 실제 앱의 버튼 이름은 개발 AI가 앱 코드를 수정할 때 바뀝니다. |

### 1. 내 프로젝트에서 미리보기 열기

AI 코딩 도구에서 앱 프로젝트를 열고 아래 두 줄을 보내세요. 기획 메모, 기존 화면, 앱의 이동 경로를 바탕으로 시작할 수 있어요.

```text
https://github.com/JeongK7998/wireflow-review
이 프로젝트에 Wireflow Review v0.7.1을 적용해줘. Codex CLI를 쓸 수 있으면 연결 미리보기로 열어줘.
```

**연결 미리보기**에는 Node.js 18 이상과 로그인된 Codex CLI가 필요해요. AI가 프로젝트 루트에서 아래 명령을 실행할 수 있습니다. 실제 흐름 JSON과 HTML 경로를 넣고, 명령을 실행한 상태에서 출력된 로컬 주소를 여세요. [AI용 설치 안내](APPLY.md#한국어)

```sh
node .agents/skills/wireflow-review/scripts/wireflow.cjs serve design/project.flow.json design/project.html
```

설치 전에 조작을 둘러보려면 예제 HTML을 내려받아 브라우저에서 열어 보세요. [한국어 도예 예약 예제](example/pottery-booking.ko.html?raw=1)

### 2. 흐름을 눌러 보고 수정하기

- **전체 보기**에서 앱의 구조를 확인하고, 화면을 눌러 확대하세요. 더미 안의 버튼을 눌러 화살표를 따라갈 수 있어요. **⋯**에서 경로, 기기 크기, 미리보기 글꼴을 바꿀 수 있습니다.
- 프로젝트 채팅에 수정 내용을 적거나 화면 옆의 **수정 요청**을 여세요. 연결 미리보기에서는 **와이어플로우에 반영**을 누릅니다. AI가 더미를 바꾸면 열린 화면이 자동으로 갱신되고 **와이어플로우 반영 완료**가 표시돼요.
- 독립 HTML에서 화면 요청을 작성했다면 목록의 **대기 요청 채팅으로 복사**를 누르고 프로젝트 채팅에 붙여넣으세요. AI가 더미에 반영합니다.

### 3. 실제 앱 개발에 반영 요청하기

**수정 요청 목록**에는 요청 원문, 더미에서 바뀐 내용, 개발 요청 전달 상태가 함께 표시돼요. 바뀐 흐름을 눌러 보고 앱에 적용할 항목을 고르세요.

1. 앱에 적용할 항목을 고른 뒤 하단의 **개발 요청 프롬프트 복사**를 누르세요.
2. 실제 앱 프로젝트를 열어 둔 채팅에 붙여넣고 전송하세요. 개발 AI가 그 요청을 바탕으로 앱 코드를 수정합니다.
3. 전송했으면 Wireflow에서 **개발 채팅에 전달했어요**를 누르세요. 구현이 끝나면 실제 앱을 열어 바뀐 흐름을 확인하세요.
