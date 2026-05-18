# Open Typeless Harness

<p align="center">
  <img src="docs/assets/open-typeless-harness-cover.png" alt="Open Typeless Harness cover" width="780">
</p>

<p align="center">
  <strong>从真实修正中学习你常用词汇的语音输入。</strong>
</p>

<p align="center">
  • 聚焦输入框口述 • LLM 润色 • 本地 Speech Skills •
</p>

<p align="center">
  <a href="README.md">English</a> •
  <a href="#快速导航">快速导航</a> •
  <a href="#功能亮点">功能亮点</a> •
  <a href="#工作流">工作流</a> •
  <a href="#路线图">路线图</a>
</p>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-technical%20preview-0F766E">
  <img alt="Tauri" src="https://img.shields.io/badge/Tauri-Rust%20%2B%20React-24C8DB">
  <img alt="Learning" src="https://img.shields.io/badge/learning-local%20speech%20skills-111827">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue">
</p>

> [!IMPORTANT]
> **语音输入应该在你修正它之后变得更好。**
>
> 普通语音转文字会反复错在同一批个人词汇上：产品名、论文术语、项目名、中英混排短语，以及你每次文字落地后马上手动改掉的小错误。
>
> Open Typeless Harness 把这些修正变成本地学习信号。它先听写、润色、插入当前输入框，再观察插入后的编辑轨迹，把稳定模式沉淀成下次口述可用的 speech skills。
>
> 它不是另一个听写输入框。它想做的是一个会适应你写作习惯的语音输入闭环。

## 快速导航

> [!TIP]
> **给用户** -> 在你本来要输入的地方口述。正常修改插入后的文本。修正轨迹就是学习信号。
>
> **给构建者** -> 产品闭环是 `ASR transcript -> LLM polish -> focused-field insertion -> edit monitor -> local speech skills`。

<p align="center">
  <a href="docs/assets/open-typeless-harness-demo.mp4">
    <img src="docs/assets/open-typeless-harness-demo.gif" alt="Open Typeless Harness 真实 App 操作视频" width="780">
  </a>
</p>

<p align="center">
  <sub>真实 App 操作预览。点击动图打开 MP4。</sub>
</p>

## 功能亮点

- **聚焦输入框口述**：在你正在使用的 app 里直接说，不需要切到单独编辑器。
- **LLM 润色插入**：文本落地前先清理口语片段和混乱结构。
- **修正原生学习**：观察用户插入后真正改了什么，而不是只依赖 ASR 猜测。
- **本地 speech skills**：把稳定修正沉淀成本地记忆，供后续润色检索。
- **中英混排词汇**：处理 `type script -> TypeScript`、`知呼 -> 知乎` 这类常见纠错。

## 工作流

| 阶段 | 发生什么 | 为什么重要 |
| --- | --- | --- |
| Listen | 采集语音并生成 ASR 转写。 | 用户留在当前写作上下文里。 |
| Polish | 检索相关 speech skills，再让模型清理转写文本。 | 个人词汇会在写入前被注入。 |
| Insert | 把润色后的文本插入当前聚焦输入框。 | 应用表现为输入层，而不是独立写作空间。 |
| Learn | 在插入后的短窗口内观察人工修改。 | 真实修正变成产品反馈。 |
| Adapt | 把反复、稳定的修正提升成本地 speech skills。 | 下一次口述可以变好，而不需要手写 prompt。 |

## 学习模型

Open Typeless Harness 把学习分成两条轨道：

- **高置信修正**：反复出现的插入后修改，可以自动沉淀。
- **低置信候选**：有歧义的修改先留在看板里，确认后再影响后续输入。

这不是全局自动纠错，而是基于文字落地后的真实修正建立的 correction-native memory loop。

## 安全模型

Open Typeless Harness 是输入层，不是自主 agent。它把文字写进你正在使用的输入框，不应该主动替你执行任务。

纠错证据和 speech skills 默认留在本机。歧义修正应该成为 contextual skill，而不是危险的全局 find-and-replace。

## 路线图

- 更稳定的 ASR 与润色 provider fallback。
- 更好的学习置信度评分和候选确认。
- 更清晰的每日学习看板，让用户看到输入法正在变懂自己。
- 面向非开发者的安装包和使用路径。

## 相关

- 基于 OpenLess 桌面运行时构建。
- 作为 OpenCodexLabs 在自适应输入和本地 speech skills 方向的实验项目。

## License

[MIT](LICENSE)
