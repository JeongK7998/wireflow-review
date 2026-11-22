# XU Wireflow Review

English · [한국어](README.ko.md)

This AI skill helps anyone planning an app review its **structure and user flow** before choosing a visual design. It turns your notes or existing screens into a clickable wireflow of simple mock screens connected by arrows. Click through a task to see where each choice leads and spot any missing steps.

- **See the whole app.** Screens are grouped by task. Pick a path to highlight the buttons and numbered arrows that take someone from start to finish.
- **Try the easy-to-miss steps.** Go back after entering information, cancel halfway through, or retry after an error. Check where you land and what the app remembers.
- **Give your AI a precise change request.** Copy a request from the screen you’re reviewing. It keeps what your brief requires separate from screens the AI suggests and questions you still need to answer.

## Use it in your project

1. Open your project in an AI coding tool. A few notes about your app, a brief, or existing screens are enough to get started.
2. Paste the message below into the project chat. While this repository is private, your AI tool needs GitHub access to read it.

```text
https://github.com/JeongK7998/wireflow-review
Apply this skill to my project.
```

3. Open the HTML file your AI creates in a browser. Choose one task your user needs to finish and follow the highlighted arrows. When a step feels wrong, select its screen and copy a change request back into the same chat.

## A closer look

**Mobile · Follow one path across the whole app.** The numbered arrows show which button leads to the next screen. Nearby screens show where empty results or failures fit into the same flow.

[![Mobile overview with screens grouped by task and a seven-step path connecting the selected buttons](release/media/booking-mobile-en.png)](release/media/booking-mobile-en.png)

**Tablet · Compare two outcomes.** Trace what happens when someone backs out of an action and when they confirm it. The review panel shows the step under inspection and decisions that still need an answer.

[![Tablet flow showing the return and confirmation paths alongside the review panel](release/media/booking-tablet-en.png)](release/media/booking-tablet-en.png)

To explore before using your own project, download the demo and open it in a browser. [Download the English demo](release/example/pottery-booking.en.html?raw=1)

For AI tools following a repository link, use the project setup guide. [Setup guide](release/APPLY.md) · [Download the skill ZIP](release/wireflow-review-v0.5.3.zip?raw=1)
