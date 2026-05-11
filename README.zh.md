# Open Typeless Harness

<p align="center">
  <img src="docs/assets/open-typeless-harness-cover.png" alt="Open Typeless Harness cover" width="780">
</p>

<p align="center">
  <strong>会从你真实修正里学习的语音输入。</strong>
</p>

<p align="center">
  • Speak • Polish • Insert • Learn Locally •
</p>

<p align="center">
  <a href="README.md">English</a> •
  <a href="#为什么做它">为什么</a> •
  <a href="#产品预览">预览</a> •
  <a href="#学习闭环">学习闭环</a>
</p>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-technical%20preview-0F766E">
  <img alt="Tauri" src="https://img.shields.io/badge/Tauri-Rust%20%2B%20React-24C8DB">
  <img alt="Learning" src="https://img.shields.io/badge/learning-local%20speech%20skills-111827">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue">
</p>

## 为什么做它

普通语音转文字会反复错在同一批地方：产品名、项目名、中英混排术语，以及你每次插入后马上手动修掉的小错误。

Open Typeless Harness 把这些改动当成学习信号。它先转写、润色、插入当前输入框，再观察你如何修正这段文本，让后续口述越来越贴近你的词汇。

> 每一次文字落地后的修正，都应该让下一次输入更准。

## 产品预览

<p align="center">
  <img src="docs/assets/open-typeless-harness-product.png" alt="Open Typeless Harness product preview" width="780">
</p>

<p align="center">
  <img src="docs/assets/open-typeless-harness-demo.gif" alt="Open Typeless Harness focused-field insertion demo" width="780">
</p>

<p align="center">
  <a href="docs/assets/open-typeless-harness-demo.mp4">查看 MP4 演示</a>
</p>

| 插入前 | 插入后 |
| --- | --- |
| <img src="docs/assets/open-typeless-harness-real-before.png" alt="Before focused-field insertion" width="390"> | <img src="docs/assets/open-typeless-harness-real-after.png" alt="After focused-field insertion" width="390"> |

## 它应该记住什么

| 你说出或收到 | 你修正成 |
| --- | --- |
| `type script` | `TypeScript` |
| `知呼` | `知乎` |
| `cold 或者 cold` | `Claude Code 或 Codex` |

目标不是把语音转成更漂亮的文字，而是让输入层逐渐适应你真正使用的词。

## 学习闭环

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

## 默认本地

纠错证据和 speech skills 默认留在本机。它是输入层，不是自主 agent：它把文字写进你正在使用的输入框，而不是主动替你执行任务。

## 状态

Open Typeless Harness 目前是 technical preview，是基于 OpenLess 桌面运行时的 OpenClaudex 实验性 fork/fusion。

当前重点是聚焦输入框口述、LLM 润色插入、插入后的改动监控，以及本地 speech-skill 学习。

## 致谢

基于 OpenLess 桌面运行时构建，并继承 MIT license。

## License

[MIT](LICENSE)
