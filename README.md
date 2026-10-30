# AI 讨论室（DSH 插件）

> 状态：**Linux 上已验证的试用版**。Windows / macOS 与干净环境实装尚未验收，见文末「已知限制」。

让三个 AI 参与者围绕同一个问题**独立分析 → 相互审查 → 汇总结论**，并把共识、分歧、未知项、行动项整理成带来源引用的决策台账。

- **DSH**：主持讨论并做最终汇总
- **Claude Code CLI**：独立分析、交叉审查
- **Codex CLI**：独立分析、交叉审查

三个成员默认互不可见对方的回答（第一轮），第二轮才开始互审；汇总只采纳有引用的成功回答，失败或未参与的成员会被明确标注。

## 功能

- 四种场景模板：进度审查、明确需求、方案选型、代码审查（每项附适用说明）
- 实时流式输出、成员状态、耗时与提供方实测用量
- 证据台账：共识 / 分歧 / 未知项 / 行动项，引用可跳回原消息
- 讨论分支与对比、定向重试、补充消息（运行中排队）
- 附件：图片（可粘贴）、PDF、文本/代码，提取容量与截断状态可见
- 导出 Markdown / DOCX / 打印为 PDF
- 工作模式：纯讨论（只分析）或本地协作（成员可读写工作区、跑许可的命令）

## 怎么选讨论模板

| 模板 | 什么时候用 | 主要输出 |
| --- | --- | --- |
| 进度审查 | 其他 AI 助手正在排障或开发，想确认进展与方向 | 进展证据、目标偏离、方向判断、更快的路线与下一步 |
| 明确需求 | 还没想清楚要做什么、范围与验收不明确 | 目标、边界、约束、可测试的验收标准 |
| 方案选型 | 已有方案或多个选项，想比较设计、成本和风险 | 架构取舍、关键风险、推荐方案和最小验证 |
| 代码审查 | 已有代码或改动，想找具体问题 | 有依据的缺陷、触发条件、修复优先级和回归检查 |

原「设计评审」「架构设计」「风险评估」合并为「方案选型」；已有房间保留历史，旧模板 ID 仍可读取、总结。每种模板都按独立分析 → 相互审查、取长补短 → 汇总推进。切换模板不会覆盖手动填写的问题。

### 审查其他 AI 助手的会话进度

1. 选「进度审查」，填写原始目标与验收标准，以及你担心的问题。
2. 给出会话来源：优先提供文件路径或附加导出片段；按标题定位时还要提供助手名称、大致时间，避免读错会话。
3. 需要读取本地会话时选「本地协作」并确认访问权限；选「纯讨论」时只能依据粘贴或上传的材料，不能自动读取本机历史。仅位于另一台机器或网页中的会话，应先导出可访问片段。
4. 成员核对原目标、最新要求、已有操作和验证结果，检查修复是否有根因证据、是否跑偏或反复做无效工作，并比较更快或更简单的方案。
5. 汇总给出「继续 / 调整 / 先补证据」判断，区分声称完成与已经验证，列出按顺序的下一步及每步验收标准。没有证据时不会编造完成比例或节省时间。

此模板的任务是只读审查，不接着执行被审会话中的修复或远端操作；本地协作模式仍按既有权限运行，不是新增的操作系统沙箱。会话无法访问、匹配不唯一或验证记录不足时，结果会列明缺口。

## 环境要求

- DSH Desktop（插件通过 `DSH_RUNTIME_DIR` 复用宿主运行时，无需单独安装依赖）
- 需要参与的 CLI 已安装并登录：
  - `claude`（Claude Code CLI，版本横幅需为 `2.x.y (Claude Code)`）
  - `codex`（Codex CLI，`codex-cli x.y.z`）
- 未安装的 CLI 会在面板里显示为「未检查」，不影响其余成员

## 安装

```bash
git clone https://gitee.com/dxcdsb/ai-discussion-room.git ~/plugins/dsh-agent-discussion
```


> 插件依赖宿主运行时，必须在 DSH Desktop 已安装的机器上操作。下面命令里的
> `<DSH 运行时目录>` 指 Desktop 自带的运行时，Linux 通常是
> `~/.config/DSH Codex Desktop/dsh-runtime`，可以用
> `echo "$DSH_RUNTIME_DIR"` 在 DSH 会话里确认，或直接看 Desktop 安装目录。

1. 把本仓库放到任意目录，例如 `~/plugins/dsh-agent-discussion`。

2. 用 Desktop 自带的 CLI 安装（`dsh` 不一定在 `PATH` 里，所以直接调用运行时入口）：

   ```bash
   node "<DSH 运行时目录>/node_modules/@deepseek-ai/dsh/lib/bin.js" \
        plugin --profile web add link:/home/you/plugins/dsh-agent-discussion
   ```

   Windows 下把换行去掉写成一行，路径用
   `%APPDATA%\DSH Codex Desktop\dsh-runtime` 之类。

   若想手动配置，也可以编辑 `~/.dsh/profiles/web/package.json`：在 `dependencies` 里加
   `"@local/dsh-agent-discussion": "link:/home/you/plugins/dsh-agent-discussion"`，
   把该包加入 `dsh.profile.bundles`，然后执行
   `node "<DSH 运行时目录>/node_modules/@deepseek-ai/dsh/lib/bin.js" plugin --profile web install`。
   （用上面的 `add` 时，bundles 与启用条目会由插件管理器自动写入。）

3. 检查合成结果没有告警：

   ```bash
   node "<DSH 运行时目录>/node_modules/@deepseek-ai/dsh/lib/bin.js" \
        --profile web --dump-config | head -3
   ```

   正常时不应出现 `patch: entry "..." not found` 这类提示。

4. 重启 DSH Desktop。侧边栏「扩展管理」里会出现 **AI 讨论室**。

如果条目存在但没有出现在侧边栏，确认 `~/.dsh/profiles/web/cordis.patch.yml` 里有：

```yaml
- id: local-agent-discussion-v1
  disabled: false
```

## 配置

| 配置项 | 方式 | 说明 |
| --- | --- | --- |
| DSH 成员模型 | 默认跟随当前会话选择的模型 | 设 `DISCUSSION_DSH_PROVIDER` 与 `DISCUSSION_DSH_MODEL` 可固定 |
| Codex 成员模型 | 读取 `~/.codex/config.toml` 的 `model` | `DISCUSSION_CODEX_MODEL` 可覆盖 |
| Codex 网关 | 若 `~/.codex/config.toml` 有 `[model_providers.custom]`，自动复用其 `base_url` 与 `experimental_bearer_token` | 没有则走 Codex CLI 默认后端 |
| Claude 成员 | 使用本机 Claude Code CLI 自身配置 | 插件只固定 --safe-mode / 空 MCP / 禁用工具等隔离参数 |

所有成员模型都使用**你自己的**配置，插件不内置任何密钥。

## 权限与隐私

- **左侧「同意」复选框是发送前提**：开始讨论前必须勾选，未勾选时发送按钮不可用。勾选内容会明确写出：问题、材料与讨论内容将发送到三个模型服务。
- **补充消息**：讨论已开始时，沿用该房间开始时记录的同意，不需要重复勾选；但把工作模式切换到另一种（例如从「纯讨论」切到「本地协作」）时，需要重新勾选——因为权限范围变了。
- **纯讨论模式**：成员被限制为无工具。
- **本地协作模式**：成员可在工作区读写文件，命令限于内置白名单（`ls`、`cat`、`rg`、`sed`、`jq`、`python3`……以及测试命令）。这只是**命令级的权限规则，不是操作系统沙箱**：白名单内的命令仍以你的账号身份运行，请只在你自己信任的项目目录里使用；被拒绝的命令不会中断整轮，只记录在结果里。
- **讨论子会话**以 `origin: subagent` 创建，不会出现在侧边栏会话列表。
- 所有模型调用都使用**你自己**的 CLI 与账号，插件不内置任何密钥。

## 跨平台说明

作者在 Linux 上开发和验证，插件本身不含平台专属路径：

- 宿主动态库通过 `DSH_RUNTIME_DIR` 解析，Windows / macOS / Linux 都一样。
- CLI 以**命令名**在 `PATH` 中查找（`claude`、`codex`），额外附带 Linux 常见安装位置作为兜底。
- 用户配置文件按各平台家目录读取（`~/.codex/config.toml`）。
- 启动子进程时保留了 Windows 需要的 `SystemRoot`、`APPDATA`、`PATHEXT` 等变量。

但请注意以下**未在 Windows / macOS 实测**的部分：

- 若 CLI 是 `codex.cmd` 这类批处理入口，需要确保命令能在 `PATH` 中直接执行。
- 本地协作模式的只读命令白名单偏 Unix（`sed`、`awk`、`jq` 等）；Windows 下这些命令可能不存在，成员会收到拒绝并据此调整，不会中断整轮。
- 如遇问题，欢迎在 Issues 里附上系统版本与 CLI 版本。

## 适配你的代理与模型

插件不绑定任何模型，三个成员各自使用**你机器上的配置**：

| 成员 | 用的是什么 | 换模型的方式 |
| --- | --- | --- |
| DSH | 当前会话选中的模型（默认） | 直接在会话里切换模型；或用环境变量固定成员模型 |
| Claude | 你的 Claude Code CLI 与它的登录/网关配置 | 改 Claude Code 自身的配置 |
| Codex | 你的 Codex CLI，模型取自 `~/.codex/config.toml` 的 `model` | 改 Codex 配置，或设 `DISCUSSION_CODEX_MODEL` |

- 不一定三个都装：缺失的 CLI 在面板里显示「未检查」，其余成员照常讨论，汇总会注明谁没参与。
- 成员的实际模型名会显示在每条回答下，便于核对；同名入口不等于同一底层模型。
- Codex 若配置了 `[model_providers.custom]` 自定义网关，插件会自动复用其地址与令牌；没有则走 CLI 默认后端。

## 已知限制

- 单轮成员时限：纯讨论 240 秒、本地协作 600 秒；超时算该成员失败，可单独重试。
- 单轮输出上限由**模型/服务商**决定；被截断时 DSH 成员会保留已生成内容并标注，Claude/Codex 由其 CLI 报错。
- 房间总提示上限 600,000 字符，累计附件 24 个 / 400,000 提取字符；超限会在发送前拒绝。
- 长任务建议拆分支或分批：让成员自行检索几十 GB 目录可能长时间无输出。
- 侧边栏入口位置由 DSH Desktop 侧边栏实现决定（固定在「扩展管理」分组内）。
- **已验证**：Linux 上全新 profile 的合成与装载（条目出现、无 `patch` 告警、插件激活、快照接口应答）、两轮讨论与汇总、缺失 CLI 时降级为「未检查」、97 项测试通过。
- **未验证**：Windows / macOS 实装、干净物理机器的完整走查、GUI 认证下的端到端自动化、三成员完整协作模式的逐项验收。
- profile 请使用 `web`（本项目按 `web` 验证）；`desktop` profile 由 Electron 管控，未测试。
- 本插件按 MIT 提供，不承诺与其他 DSH 版本兼容；CLI 版本差异由 `--help` 特性探测兜底。

## 开发与测试

```bash
cd dsh-agent-discussion
node --test *.test.js
```

测试覆盖：三成员两轮与汇总、证据台账校验、流式与中止、定向重试、分支隔离、附件提取与上限、CLI 隔离参数、种子会话、路由跟随与超时分级。

验收记录（含本机路径与内部模型名）不随仓库发布，仅保留在作者本地。

## 许可

MIT，见 [LICENSE](LICENSE)。
