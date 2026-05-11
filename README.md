# Open Typeless Harness

<p align="center">
  <img src="docs/assets/open-typeless-harness-cover.png" alt="Open Typeless Harness cover" width="780">
</p>

<p align="center">
  <strong>Voice input that learns from the corrections you actually make.</strong>
</p>

<p align="center">
  • Speak • Polish • Insert • Learn Locally •
</p>

<p align="center">
  <a href="README.zh.md">中文</a> •
  <a href="#why-it-exists">Why</a> •
  <a href="#product-preview">Preview</a> •
  <a href="#learning-loop">Learning Loop</a>
</p>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-technical%20preview-0F766E">
  <img alt="Tauri" src="https://img.shields.io/badge/Tauri-Rust%20%2B%20React-24C8DB">
  <img alt="Learning" src="https://img.shields.io/badge/learning-local%20speech%20skills-111827">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue">
</p>

## Why It Exists

Plain speech-to-text keeps making the same mistakes: product names, project names, mixed Chinese/English terms, and the phrases you always fix right after insertion.

Open Typeless Harness treats those edits as signal. It transcribes, polishes, inserts into the focused field, then learns from your post-insertion corrections so future dictation better matches your vocabulary.

> Every correction after the text lands should make the next insertion better.

## Product Preview

<p align="center">
  <img src="docs/assets/open-typeless-harness-product.png" alt="Open Typeless Harness product preview" width="780">
</p>

<p align="center">
  <img src="docs/assets/open-typeless-harness-demo.gif" alt="Open Typeless Harness focused-field insertion demo" width="780">
</p>

<p align="center">
  <a href="docs/assets/open-typeless-harness-demo.mp4">Watch MP4 demo</a>
</p>

| Before insertion | After insertion |
| --- | --- |
| <img src="docs/assets/open-typeless-harness-real-before.png" alt="Before focused-field insertion" width="390"> | <img src="docs/assets/open-typeless-harness-real-after.png" alt="After focused-field insertion" width="390"> |

## What It Should Remember

| You say or receive | You correct to |
| --- | --- |
| `type script` | `TypeScript` |
| `知呼` | `知乎` |
| `cold 或者 cold` | `Claude Code 或 Codex` |

The goal is not just prettier transcription. The goal is a voice input layer that adapts to the words you actually use.

## Learning Loop

<p align="center">
  <img src="docs/assets/open-typeless-harness-learning-loop.png" alt="Open Typeless Harness learning loop" width="780">
</p>

```text
Speak
  -> ASR transcript
  -> LLM polish with retrieved speech skills
  -> Insert into the focused text field
  -> Observe post-insertion edits
  -> Save stable local speech skills
```

## Local By Default

Correction evidence and speech skills stay on the machine by default. The app is an input layer, not an autonomous agent: it writes into the field you are already using instead of taking actions for you.

## Status

Open Typeless Harness is a technical preview built as an experimental OpenClaudex fork/fusion on top of the OpenLess desktop runtime.

The current focus is focused-field dictation, LLM-polished insertion, post-insertion edit monitoring, and local speech-skill learning.

## Acknowledgements

Built on top of the OpenLess desktop runtime and released under inherited MIT license terms.

## License

[MIT](LICENSE)
