# Open Typeless Harness

<p align="center">
  <img src="docs/assets/open-typeless-harness-cover.png" alt="Open Typeless Harness cover" width="780">
</p>

<p align="center">
  <strong>会从插入后改动里学习的自适应语音输入 Harness。</strong>
</p>

<p align="center">
  • 聚焦输入框口述 • LLM 润色 • 本地 Speech Skills •
</p>

<p align="center">
  <a href="README.md">English</a> •
  <a href="#-功能">功能</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#runtime-switches">Runtime Switches</a> •
  <a href="#安全模型">安全模型</a>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue">
  <img alt="Status" src="https://img.shields.io/badge/status-technical%20preview-0F766E">
  <img alt="Tauri" src="https://img.shields.io/badge/Tauri-Rust%20%2B%20React-24C8DB">
  <img alt="macOS" src="https://img.shields.io/badge/macOS-focused%20field%20monitor-111827">
  <img alt="LLM" src="https://img.shields.io/badge/LLM-polish-2563EB">
</p>

> [!IMPORTANT]
> **从 speech-to-text，到 correction-native dictation。**
>
> 我反复遇到同一个语音输入问题：ASR 能听到文字，LLM 也能润色，但系统记不住我在插入后马上做的修改。
>
> 项目名、产品名、中英混排术语和个人表达习惯，不是一次性错误，而是重复出现的纠错信号。
>
> **所以我做了 Open Typeless Harness。**
>
> 它的前提很简单：如果用户在文本落到输入框后又手动改了，那次改动就是最好的学习信号。Harness 会在本地记录纠错证据，把稳定模式沉淀成 speech skills，并在下一次 LLM 润色前检索注入。

## 快速导航

> [!TIP]
> **我是人类用户** -> 继续阅读本 README，了解启动方式、安全边界和 smoke test。
>
> **我是 agent** -> 修改运行时行为前，先读 [`OPENTYPELESS_FUSION.md`](OPENTYPELESS_FUSION.md)、[`FUSION_SMOKE_TEST.md`](FUSION_SMOKE_TEST.md) 和 [`USAGE.md`](USAGE.md)。

- **本地使用**：运行 Tauri App，授予麦克风和辅助功能权限，然后在真实输入框里口述。
- **学习实验**：开启 edit monitor，并检查本地 JSONL 证据。
- **集成开发**：从 `edit_monitor.rs`、`learning_probe.rs` 和可选的 `vih_bridge.rs` 开始看。
- **状态：** `technical-preview`

> 本项目与 Typeless、Wispr Flow、OpenAI、Anthropic 或上游 OpenLess 项目没有官方从属关系。它是基于 OpenLess MIT 代码底座的 OpenClaudex 实验性 fork/fusion。

## ⚡ 快速开始

```bash
cd openless-all/app
npm ci
OPENTYPELESS_EDIT_MONITOR_ENABLED=1 OPENTYPELESS_VIH_ENABLED=0 npm run tauri dev
```

首次启动时，因为 fork 使用了新的 app identity，macOS 可能会重新要求麦克风和辅助功能权限。授权后如果权限页没有刷新，需要完全退出 App 再重新打开。

## ✨ 功能

Open Typeless Harness 聚焦一个工作流：

- 用全局快捷键录音，并把润色后的文本插入当前聚焦输入框。
- 监控插入后的文本，发现用户实际改了什么。
- 把纠错证据本地保存为 JSONL。
- 将重复出现的纠错证据沉淀成本地 speech skills。
- 后续 LLM 润色前，检索相关 speech skills 注入 prompt。
- 歧义纠错保持语境化，避免变成危险的全局替换。

## 工作流

```text
快捷键录音
  -> ASR 转写
  -> 检索本地 speech skills
  -> LLM 润色
  -> 插入当前聚焦输入框
  -> 监控插入后的人工改动
  -> 记录纠错证据
  -> 把稳定模式沉淀成本地 speech skills
```

示例：

```text
inserted: 我想对表说 cold 或者 cold
user edit: 我想对标说 Claude Code 或 Codex
learned: cold 或者 cold -> Claude Code 或 Codex
```

## Runtime Switches

| Switch | 作用 |
|---|---|
| `OPENTYPELESS_EDIT_MONITOR_ENABLED=0` | 关闭插入后监控。 |
| `OPENTYPELESS_EDIT_MONITOR_JSONL=0` | 关闭 monitor JSONL 日志。 |
| `OPENTYPELESS_LEARNING_CANDIDATES=0` | 关闭学习候选记录。 |
| `OPENTYPELESS_SPEECH_SKILLS_PATH=/path/to/skills.json` | 覆盖本地 speech skill memory 路径。 |
| `OPENTYPELESS_VIH_ENABLED=1` | 启用可选 OpenTypeless VIH rewrite bridge。 |

## 本地文件

```text
~/Library/Application Support/OpenTypelessHarness
~/Library/Logs/OpenTypelessHarness/open-typeless-harness.log
~/.openless/opentypeless-edit-monitor.jsonl
~/.openless/opentypeless-learning-candidates.jsonl
~/.openless/opentypeless-speech-skills.json
```

## 手动 Smoke Test

```bash
open tools/fusion-edit-monitor-target.html
./scripts/fusion-smoke-watch.sh 120
```

然后聚焦 textarea，口述一句短句，等待文本插入，并在 30 秒内手动修改这段文本。Watcher 应能看到 monitor event 或 learning candidate。

## 验证命令

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

## 安全模型

Open Typeless Harness 是输入层，不是自主执行任务的 agent。

- 它向当前聚焦输入框插入文本，不应该主动替用户执行任务。
- 学到的 speech skills 默认保存在本机，除非显式导出或同步。
- Monitor 记录的是插入后的文本变化证据，不是完整桌面活动。
- 歧义改动应该进入语境化短语 skill，而不是危险的全局替换。
- 云端 API 可用于实时转写或润色，但本仓库不保留录音。

## 文档

- [使用指南](USAGE.md)
- [Fusion Notes](OPENTYPELESS_FUSION.md)
- [Smoke Test Plan](FUSION_SMOKE_TEST.md)
- [Completion Audit](FUSION_COMPLETION_AUDIT.md)

## 路线图

- 稳定 macOS focused-field monitor 在更多编辑器和聊天应用里的表现。
- 增加轻量诊断面板，展示 monitor 事件和已学习 speech skills。
- 优化 skill 检索排序和过期 skill 清理。
- 等基础 fusion 路径稳定后，再重新评估可选 OpenTypeless VIH bridge。
- 以 Open Typeless Harness 身份打包签名版 macOS preview。

## 致谢

Open Typeless Harness 基于 OpenLess 桌面运行时构建。当前 fork 保留上游归属与 MIT license，同时探索 OpenTypeless 风格的本地学习层。

## License

[MIT](LICENSE)

---

如果这个项目让你的语音输入记住了正确修正，欢迎给一个 ⭐ Star。

[Report Issues](https://github.com/OpenClaudex/open-typeless-harness/issues) · [Feature Requests](https://github.com/OpenClaudex/open-typeless-harness/issues/new)
