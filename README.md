# Open Typeless Harness

<p align="center">
  <img src="docs/assets/open-typeless-harness-cover.png" alt="Open Typeless Harness cover" width="780">
</p>

<p align="center">
  <strong>Correction-native voice input that learns the words you actually use.</strong>
</p>

<p align="center">
  • Focused-Field Dictation • LLM Polish • Local Speech Skills •
</p>

<p align="center">
  <a href="README.zh.md">中文文档</a> •
  <a href="#quick-navigation">Quick Navigation</a> •
  <a href="#features">Features</a> •
  <a href="#workflow">Workflow</a> •
  <a href="#roadmap">Roadmap</a>
</p>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-technical%20preview-0F766E">
  <img alt="Tauri" src="https://img.shields.io/badge/Tauri-Rust%20%2B%20React-24C8DB">
  <img alt="Learning" src="https://img.shields.io/badge/learning-local%20speech%20skills-111827">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue">
</p>

> [!IMPORTANT]
> **Voice input should get better after you correct it.**
>
> Plain speech-to-text keeps failing on the same personal vocabulary: product names, paper terms, project names, mixed Chinese/English phrases, and tiny edits you make right after the text lands.
>
> Open Typeless Harness turns those corrections into local learning signal. It listens, polishes, inserts into the focused field, watches the post-insertion edit trail, and converts stable patterns into speech skills for the next dictation.
>
> The goal is not another dictation box. The goal is a voice input loop that adapts to how you actually write.

## Quick Navigation

> [!TIP]
> **For users** -> Dictate where you already type. Correct the inserted text normally. The correction trail becomes the learning signal.
>
> **For builders** -> The product loop is `ASR transcript -> LLM polish -> focused-field insertion -> edit monitor -> local speech skills`.

<p align="center">
  <a href="docs/assets/open-typeless-harness-demo.mp4">
    <img src="docs/assets/open-typeless-harness-demo.gif" alt="Open Typeless Harness live app walkthrough" width="780">
  </a>
</p>

<p align="center">
  <sub>Live app walkthrough. Click the preview to open the MP4.</sub>
</p>

## Features

- **Focused-field dictation**: speak into the app you are already using instead of switching to a separate editor.
- **LLM-polished insertion**: clean up spoken fragments before they land in the target field.
- **Correction-native learning**: observe what the user changes after insertion, not just what the ASR provider guessed.
- **Local speech skills**: promote stable corrections into local memory for future polish.
- **Mixed-language vocabulary**: handle terms such as `type script -> TypeScript` and `知呼 -> 知乎`.

## Workflow

| Stage | What happens | Why it matters |
| --- | --- | --- |
| Listen | Capture speech and produce an ASR transcript. | The user stays in the current writing context. |
| Polish | Retrieve relevant speech skills and ask the model to clean the transcript. | Personal vocabulary is injected before text is written. |
| Insert | Paste the polished text into the focused field. | The app behaves like an input layer, not a separate writing workspace. |
| Learn | Watch short-window edits after insertion. | Real corrections become product feedback. |
| Adapt | Promote repeated, stable corrections into local speech skills. | The next dictation can improve without manual prompt engineering. |

## Learning Model

Open Typeless Harness separates learning into two tracks:

- **High-confidence corrections**: repeated post-insertion edits can be promoted automatically.
- **Low-confidence candidates**: ambiguous edits stay visible for review before they affect later input.

This is not global autocorrect. It is a correction-native memory loop built from the edits you actually make after text lands.

## Safety Model

Open Typeless Harness is an input layer, not an autonomous agent. It writes into the field you are already using and should not execute tasks for you.

Correction evidence and speech skills stay on the machine by default. Ambiguous corrections should become contextual skills, not unsafe global find-and-replace rules.

## Roadmap

- More stable ASR and polish provider fallback.
- Better learning confidence scoring and candidate review.
- Richer daily learning dashboard for habit formation.
- Cleaner packaging for non-developer installation.

## Related

- Built on top of the OpenLess desktop runtime.
- Designed as an OpenCodexLabs experiment around adaptive input and local speech skills.

## License

[MIT](LICENSE)
