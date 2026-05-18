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
  <a href="README.zh.md">中文</a> •
  <a href="#quick-navigation">Quick Navigation</a> •
  <a href="#features">Features</a> •
  <a href="#how-it-learns-your-habits">Learning Model</a> •
  <a href="#safety-model">Safety Model</a>
</p>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-technical%20preview-0F766E">
  <img alt="Tauri" src="https://img.shields.io/badge/Tauri-Rust%20%2B%20React-24C8DB">
  <img alt="Learning" src="https://img.shields.io/badge/learning-local%20speech%20skills-111827">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue">
</p>

> [!IMPORTANT]
> **From one-off dictation to a voice input loop that improves.**
>
> Plain speech-to-text keeps making the same mistakes: product names, project names, mixed Chinese/English terms, and the phrases you always fix right after insertion.
>
> Open Typeless Harness treats those edits as signal. It transcribes, polishes, inserts into the focused field, then learns from your post-insertion corrections so future dictation better matches your vocabulary.
>
> The premise is simple: **every correction after the text lands should make the next insertion better.**

## Quick Navigation

> [!TIP]
> **I'm a user** -> Open the app, put the cursor in any text field, dictate, and correct the text normally. The correction trail is the learning signal.
>
> **I'm an agent** -> The product loop is `ASR transcript -> LLM polish -> focused-field insertion -> post-insertion edit monitor -> local speech skills`.

<p align="center">
  <a href="docs/assets/open-typeless-harness-demo.mp4">
    <img src="docs/assets/open-typeless-harness-demo.gif" alt="Open Typeless Harness live app walkthrough" width="780">
  </a>
</p>

<p align="center">
  <sub>Live app walkthrough. Click the preview to open the MP4.</sub>
</p>

## Features

- **Focused-field insertion**: dictate into the app you are already using instead of switching into a separate editor.
- **LLM-polished output**: clean up spoken text before it lands in the target field.
- **Post-insertion edit monitoring**: watch what the user actually changes after insertion.
- **Local speech skills**: promote repeated corrections into local memory for future polish.
- **Mixed-language vocabulary**: handle terms such as `type script -> TypeScript` and `知呼 -> 知乎`.

## How It Learns Your Habits

1. You dictate into the current focused field.
2. Open Typeless Harness inserts polished text.
3. For a short window after insertion, the edit monitor compares the inserted text with your manual edits.
4. Stable repeated corrections become local speech skills.
5. On later dictation, relevant speech skills are retrieved before the LLM polish step, so the model sees your vocabulary before it writes.

This is not global autocorrect. It is a correction-native memory loop built from your actual post-insertion edits.

## Safety Model

Open Typeless Harness is an input layer, not an autonomous agent. It writes into the field you are already using, and it should not execute tasks for you.

Correction evidence and speech skills stay on the machine by default. Ambiguous corrections should become contextual skills, not unsafe global find-and-replace rules.

## Status

Open Typeless Harness is a technical preview built as an experimental OpenClaudex fork/fusion on top of the OpenLess desktop runtime.

Current focus:

- focused-field dictation
- LLM-polished insertion
- post-insertion edit monitoring
- local speech-skill learning

## Acknowledgements

Built on top of the OpenLess desktop runtime and released under inherited MIT license terms.

## License

[MIT](LICENSE)
