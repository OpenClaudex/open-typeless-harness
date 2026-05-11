# Open Typeless Harness

<p align="center">
  <img src="docs/assets/open-typeless-harness-cover.png" alt="Open Typeless Harness cover" width="780">
</p>

<p align="center">
  <strong>Adaptive voice input that learns from post-insertion corrections.</strong>
</p>

<p align="center">
  • Focused-Field Dictation • LLM Polish • Local Speech Skills •
</p>

<p align="center">
  <a href="README.zh.md">中文文档</a> •
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#runtime-switches">Runtime Switches</a> •
  <a href="#safety-model">Safety Model</a>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue">
  <img alt="Status" src="https://img.shields.io/badge/status-technical%20preview-0F766E">
  <img alt="Tauri" src="https://img.shields.io/badge/Tauri-Rust%20%2B%20React-24C8DB">
  <img alt="macOS" src="https://img.shields.io/badge/macOS-focused%20field%20monitor-111827">
  <img alt="LLM" src="https://img.shields.io/badge/LLM-polish-2563EB">
</p>

> [!IMPORTANT]
> **From speech-to-text to correction-native dictation.**
>
> I kept running into the same voice-input failure mode: ASR could hear the words, and an LLM could polish them, but the system still forgot the edits I made right after insertion.
>
> Project names, product names, mixed Chinese/English terms, and personal phrasing are not one-off errors. They are repeated correction signals.
>
> **So I built Open Typeless Harness.**
>
> The premise is simple: if the user fixes text after it lands in the focused field, that edit is the best training signal. The harness records local correction evidence, distills stable patterns into speech skills, and retrieves those skills before the next LLM polish.

## Quick Navigation

> [!TIP]
> **I'm a human** -> Use this README for setup, safety boundaries, and smoke testing.
>
> **I'm an agent** -> Read [`OPENTYPELESS_FUSION.md`](OPENTYPELESS_FUSION.md), [`FUSION_SMOKE_TEST.md`](FUSION_SMOKE_TEST.md), and [`USAGE.md`](USAGE.md) before changing runtime behavior.

- **For local use**: run the Tauri app, grant microphone and Accessibility permissions, then dictate into a real focused text field.
- **For learning experiments**: enable the edit monitor and inspect local JSONL evidence.
- **For integration work**: start from `edit_monitor.rs`, `learning_probe.rs`, and the optional `vih_bridge.rs`.
- **Status:** `technical-preview`

> Not affiliated with Typeless, Wispr Flow, OpenAI, Anthropic, or the upstream OpenLess project. Built as an experimental OpenClaudex fork/fusion on top of OpenLess under the inherited MIT license.

## ⚡ Quick Start

```bash
cd openless-all/app
npm ci
OPENTYPELESS_EDIT_MONITOR_ENABLED=1 OPENTYPELESS_VIH_ENABLED=0 npm run tauri dev
```

On first launch, macOS may ask for microphone and Accessibility permissions again because this fork uses a new app identity. Grant both, fully quit the app, and relaunch if permission state does not refresh.

## ✨ Features

Open Typeless Harness focuses on one workflow:

- Record with a global hotkey and insert polished text into the current focused field.
- Monitor the text after insertion to detect what the user actually corrected.
- Store correction evidence locally as JSONL.
- Distill repeated correction evidence into local speech skills.
- Retrieve relevant speech skills before later LLM polish.
- Keep ambiguous corrections contextual instead of turning them into unsafe global replacements.

## Workflow

```text
hotkey + recording
  -> ASR transcript
  -> retrieve local speech skills
  -> LLM polish
  -> insert into focused text field
  -> monitor post-insertion user edits
  -> record correction evidence
  -> distill stable patterns into local speech skills
```

Example:

```text
inserted: 我想对表说 cold 或者 cold
user edit: 我想对标说 Claude Code 或 Codex
learned: cold 或者 cold -> Claude Code 或 Codex
```

## Runtime Switches

| Switch | Effect |
|---|---|
| `OPENTYPELESS_EDIT_MONITOR_ENABLED=0` | Disable post-insertion monitoring. |
| `OPENTYPELESS_EDIT_MONITOR_JSONL=0` | Disable monitor JSONL logging. |
| `OPENTYPELESS_LEARNING_CANDIDATES=0` | Disable learning candidate recording. |
| `OPENTYPELESS_SPEECH_SKILLS_PATH=/path/to/skills.json` | Override local speech skill memory. |
| `OPENTYPELESS_VIH_ENABLED=1` | Enable the optional OpenTypeless VIH rewrite bridge. |

## Local Files

```text
~/Library/Application Support/OpenTypelessHarness
~/Library/Logs/OpenTypelessHarness/open-typeless-harness.log
~/.openless/opentypeless-edit-monitor.jsonl
~/.openless/opentypeless-learning-candidates.jsonl
~/.openless/opentypeless-speech-skills.json
```

## Manual Smoke Test

```bash
open tools/fusion-edit-monitor-target.html
./scripts/fusion-smoke-watch.sh 120
```

Then focus the textarea, dictate a short sentence, wait for insertion, and edit the inserted text within 30 seconds. The watcher should show monitor events or learning candidates.

## Verification

```bash
cd openless-all/app
npm run build

cd src-tauri
cargo fmt --check
cargo test -q learning_probe -- --test-threads=1
cargo check -q --bin openless

cd ../../..
bash -n scripts/fusion-smoke-watch.sh scripts/fusion-open-smoke-target.sh
git diff --check
```

## Safety Model

Open Typeless Harness is an input layer, not an autonomous action agent.

- It inserts text into the focused field; it should not execute tasks by itself.
- Learned speech skills stay local unless explicitly exported or synced.
- The monitor records post-insertion text-change evidence, not full desktop activity.
- Ambiguous edits should become contextual phrase skills, not broad global replacements.
- Cloud APIs may be used for real-time transcription or polish, but this repository does not retain recordings.

## Docs

- [Usage Guide](USAGE.md)
- [Fusion Notes](OPENTYPELESS_FUSION.md)
- [Smoke Test Plan](FUSION_SMOKE_TEST.md)
- [Completion Audit](FUSION_COMPLETION_AUDIT.md)

## Roadmap

- Stabilize focused-field monitoring across more macOS editors and chat apps.
- Add a diagnostics panel for monitor events and learned speech skills.
- Improve skill retrieval ranking and stale-skill pruning.
- Revisit the optional OpenTypeless VIH bridge after the base fusion path is stable.
- Package a signed macOS preview build under the Open Typeless Harness identity.

## Acknowledgements

Open Typeless Harness is built on top of the OpenLess desktop runtime. The current fork keeps upstream attribution and MIT license terms while exploring an OpenTypeless-style local learning layer.

## License

[MIT](LICENSE)

---

If this project helps your voice input remember the right correction, please give it a ⭐ Star.

[Report Issues](https://github.com/OpenClaudex/open-typeless-harness/issues) · [Feature Requests](https://github.com/OpenClaudex/open-typeless-harness/issues/new)
