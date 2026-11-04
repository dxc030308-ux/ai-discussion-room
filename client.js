window.__ModuleLoader__.load({
  id: '@local/dsh-agent-discussion',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'agent-discussion';
    const dictionaries = {
      en: {
        progressSourceHint: 'Local conversation: choose local collaboration and provide a path, or assistant + title + time. Pasted or attached excerpts work in discussion mode. This template reviews progress; it does not implement fixes.',
        progressHint: 'Review task progress, corrective direction and scope alignment.',
        codeHint: 'Have code or a diff? Find concrete bugs and regression risks.',
        requirementsHint: 'Not sure what to build? Define scope and acceptance first.',
        reviewHint: 'Have a proposal or several options? Compare design, cost and risks here.',
        progressFinal: 'Direction verdict and next steps',
        progressTwo: 'Review direction and alternatives',
        progressOne: 'Check goals and evidence',
        progressPrompt: 'Review another AI assistant task progress.\nOriginal goal and acceptance criteria: [goal]\nConversation source: [assistant, path or attached excerpt; if using a title, include approximate time]\nLatest progress / concern: [what it claims to have done; what seems wrong]\nScope: review only; do not modify files, resume the task or operate remote equipment.\nIf local records must be read, use local collaboration mode and confirm access; otherwise review only the supplied excerpts. Check recorded evidence, whether the repair targets the root cause, scope drift and repeated work. Compare faster or simpler alternatives, then recommend continue / adjust / pause for evidence, with ordered next steps and verification criteria.',
        progressTemplate: 'Review progress',
        exportDocx: 'Download DOCX', exportPdf: 'Print / save PDF', printFailed: 'The print dialog did not open. Use Download DOCX instead.',
        retry: 'Retry', branch: 'Branch from here', branches: 'Branches & comparison', branchHint: 'Branches preserve conversation history; local files remain shared (no file version isolation). Comparison uses frozen summaries from the selected branches.', decisionStale: 'New messages were added after this decision. Summarize again to refresh the ledger.', currentBranch: 'Current branch', compareBranches: 'Compare selected branches', selectTwo: 'Select two different branches', filterRound: 'Filter by round', allRounds: 'All rounds', thinking: 'Thinking', responding: 'Responding', tool: 'Using tools', elapsed: 'Elapsed', usage: 'Usage (provider values)', model: 'Model', stats: 'Call statistics', noUsage: 'Usage unavailable', ledger: 'Decision ledger', consensus: 'Consensus', disagreements: 'Disagreements', unknowns: 'Unknowns', noDecision: 'No structured decision data yet.', evidence: 'Source', sourceMissing: 'Source is not in this branch', actions: 'Action items', task: 'Task', owner: 'Owner', priority: 'Priority', acceptance: 'Acceptance criteria', copyActions: 'Copy action items', exportActions: 'Export action items', followups: 'Suggested follow-ups', prefill: 'Use in composer', warning: 'Heuristic warning · verify against sources', addFile: 'Add PDF / text / code', removeFile: 'Remove file', fileLimit: 'At most 8 documents per message.', fileTooLarge: 'PDF limit: 10 MiB; text/code limit: 1 MiB.', fileUnsupported: 'Choose a PDF, text or code file.', fileHint: '8 documents · PDF 10 MiB · text/code 1 MiB · extracted text up to 400,000 characters', truncated: 'Truncated', source: 'Source', extracted: 'extracted characters', reviewTemplate: 'Choose an approach', codeTemplate: 'Review code', requirementsTemplate: 'Clarify goals', codePrompt: 'Review this code or change: [paths or attached code].\nExpected behavior: [requirements]\nFocus: [correctness, security, performance]\nFind concrete defects, cross-check evidence, and produce prioritized fixes with acceptance checks.', requirementsPrompt: 'Clarify requirements for: [product or feature].\nUsers: [audience]\nGoal: [outcome]\nConstraints: [boundaries]\nIdentify ambiguities, challenge scope and assumptions, then produce testable requirements and open questions.', reviewOne: 'Compare approaches', reviewTwo: 'Check trade-offs and risks', reviewFinal: 'Recommendation and validation', codeOne: 'Inspect code', codeTwo: 'Verify findings', codeFinal: 'Prioritized fixes', requirementsOne: 'Discover requirements', requirementsTwo: 'Resolve ambiguity', requirementsFinal: 'Acceptance plan',
        access: 'Working mode', discussionMode: 'Discussion · analysis only, no file changes', workspaceMode: 'Local collaboration · read & edit files', workspaceHint: 'Uses the session working directory; members run in sequence.', workspaceConsent: 'I allow these members to read and modify local project files and run permitted checks. Relevant file content may be sent to their configured model services.', workspaceActive: 'Local collaboration · file tools enabled',
        templates: 'Start with a template', compare: 'Compare options', review: 'Review a design', brainstorm: 'Explore ideas', comparePrompt: 'Help me compare these options: [A] and [B].\nGoal: [desired outcome]\nConstraints: [time, cost, compatibility]\nCompare trade-offs, evidence, risks and the smallest validation step, then recommend an option.', reviewPrompt: 'Help choose an approach for: [problem or proposal].\nGoal and acceptance criteria: [outcome]\nConstraints: [time, cost, stack]\nCandidate approaches: [current plan / alternatives, if any]\nCompare architecture trade-offs, complexity and material risks, then recommend the smallest useful solution and validation.', brainstormPrompt: 'Explore solutions for: [problem].\nAudience: [who this serves]\nConstraints: [resources and boundaries]\nPropose different approaches, challenge their assumptions, and prioritize three actionable ideas.', search: 'Search messages…', filterSpeaker: 'Filter by speaker', allMessages: 'All messages', summaries: 'Synthesis only', noResults: 'No matching messages', noResultsHint: 'Try another keyword or clear the filters.', clearFilters: 'Clear filters', latest: 'Jump to latest', following: 'Following new messages', paused: 'Reading earlier messages', shortcut: 'Ctrl / ⌘ + Enter to send', messageCount: 'messages', phaseProgress: 'Discussion stages', draftHint: 'Templates fill in the brief; edit the placeholders before starting.',
        export: 'Export Markdown', copy: 'Copy message', copied: 'Copied', copyFailed: 'Clipboard unavailable. Select and copy the message manually.', eyebrow: 'COLLECTIVE INTELLIGENCE', subtitle: 'Independent perspectives. Better decisions.', setup: 'Discussion brief', setupHint: 'Define the question. Share only the context that matters.', timeline: 'Discussion', timelineHint: 'Independent analysis → peer review → synthesis', emptyTitle: 'One question. Three perspectives.', emptyDescription: 'Start with a clear question. Your agents will analyze independently, challenge assumptions, and bring the findings together.', questionPlaceholder: 'What would you like to work through?', materialsPlaceholder: 'Paste selected code, evidence or constraints…', messagePlaceholder: 'Add context, challenge a conclusion, or ask a specific agent…', hostRole: 'Facilitator & synthesis', agentRole: 'Independent perspective', callFailed: 'Last call failed', replied: 'Replied', ready: 'Configured', summary: 'Synthesis', roundOne: 'Independent analysis', roundTwo: 'Peer review', followup: 'Follow-up', safe: 'Discussion-only', brief: 'Current question', title: 'AI discussion room', expand: 'Expand discussion room', collapse: 'Collapse discussion room',
        question: 'Question', materials: 'Shared materials (optional)', start: 'Start discussion',
        consent: 'I agree to send this question, shared materials and discussion messages to the model services configured in DSH, Claude Code and Codex. Local CLI execution does not mean local-only processing.',
        mode: 'Discussion · analysis only, no file changes', target: 'Recipient', all: 'Everyone',
        message: 'Add a message', send: 'Send', stop: 'Stop', summarize: 'Summarize', reset: 'Clear',
        empty: 'No messages yet. Enter a question to begin.', loading: 'Loading…', pending: 'Queued',
        unavailable: 'Unavailable', available: 'CLI detected (request not verified)', unknown: 'Not checked', round: 'Round',
        idle: 'Idle', running: 'Running', stopping: 'Stopping', completed: 'Completed', interrupted: 'Interrupted',
        user: 'You', system: 'System', invalid: 'Invalid room response.', missing: 'Session is not available.',
        failed: 'Request failed.', unhandled: 'The /discuss command is unavailable.', working: 'Working…',
        resetHint: 'Clear is available when not running.', session: 'Discussion session', addImage: 'Add image', addAttach: 'Add image / file', attachHint: 'Images PNG, JPEG, WebP or GIF, paste works too. Documents: up to 8 files, PDF 10 MiB, text/code 1 MiB, 400,000 extracted characters in total.', removeImage: 'Remove image', image: 'Image', imageLimit: 'At most 4 images per message.', imageTooLarge: 'Each image must be 8 MB or smaller.', imageTotal: 'Images must total 12 MB or less.', imagePaste: 'Paste or add images (PNG, JPEG, WebP or GIF).', noSession: 'Open or create a DSH task first, then select it here.', opening: 'Opening session…',
      },
      zh: {
        progressSourceHint: '读取本地会话：选本地协作，提供路径，或助手名＋会话标题＋大致时间。也可粘贴/附加片段供纯讨论。此模板只做进度审查，不接着实施修复。',
        progressHint: '核查任务进展、修复方向与目标偏差。',
        codeHint: '已有代码或改动，检查具体缺陷和回归风险。',
        requirementsHint: '还没想清做什么，先明确范围和验收标准。',
        reviewHint: '已有方案或几个选项，想比较设计、成本和风险。',
        progressFinal: '方向判断与下一步',
        progressTwo: '互审方向与捷径',
        progressOne: '核对目标与进展',
        progressPrompt: '请审查另一个 AI 助手的任务进度。\n原始目标与验收标准：[要解决什么、怎样才算完成]\n会话来源：[助手名称、会话路径或附件片段；按标题定位时请补大致时间]\n最新进展 / 我的疑问：[对方声称做完了什么，哪里让我不放心]\n审查范围：只读取和评审，不修改项目、不接着实施、不操作远端设备。\n需读取本地会话时，请选择本地协作并确认权限；纯讨论仅依据提供的片段。\n请核对进展证据、修复方向与根因是否匹配、是否偏离主目标、是否反复做无效工作；比较更快或更简单的方案，最终给出继续 / 调整 / 先补证据的判断，以及按顺序的下一步和各自验收标准。',
        progressTemplate: '进度审查',
        exportDocx: '下载 DOCX', exportPdf: '打印 / 保存 PDF', printFailed: '打印窗口没有打开，请改用「下载 DOCX」。',
        retry: '重试', branch: '从此创建分支', branches: '讨论分支与对比', branchHint: '分支保留讨论历史；本地文件仍共享，不隔离文件版本。对比使用所选分支的冻结摘要。', decisionStale: '决策后有新增消息，请再次总结以刷新台账。', currentBranch: '当前分支', compareBranches: '对比所选分支', selectTwo: '请选择两个不同分支', filterRound: '按轮次筛选', allRounds: '全部轮次', thinking: '思考中', responding: '回复中', tool: '使用工具中', elapsed: '耗时', usage: '用量（提供方实测）', model: '模型', stats: '调用统计', noUsage: '暂无用量数据', ledger: '决策台账', consensus: '共识', disagreements: '分歧', unknowns: '未知项', noDecision: '暂无结构化决策数据。', evidence: '来源', sourceMissing: '当前分支没有该来源消息', actions: '行动项', task: '任务', owner: '负责人', priority: '优先级', acceptance: '验收标准', copyActions: '复制行动项', exportActions: '导出行动项', followups: '建议追问', prefill: '填入输入框', warning: '启发式提示 · 请核对原始依据', addFile: '添加 PDF / 文本 / 代码', removeFile: '移除文件', fileLimit: '每条消息最多 8 个文档。', fileTooLarge: 'PDF 上限 10 MiB；文本/代码上限 1 MiB。', fileUnsupported: '请选择 PDF、文本或代码文件。', fileHint: '最多 8 个文档 · PDF 10 MiB · 文本/代码 1 MiB · 累计提取文本最多 400,000 字符', truncated: '已截断', source: '来源', extracted: '个提取字符', reviewTemplate: '方案选型', codeTemplate: '代码审查', requirementsTemplate: '明确需求', codePrompt: '请审查以下代码或变更：[路径或附加代码]。\n预期行为：[需求]\n重点：[正确性、安全、性能]\n请定位具体缺陷，交叉核实依据，最终给出按优先级排序的修复与验收检查。', requirementsPrompt: '请澄清以下产品或功能的需求：[描述]。\n用户：[使用人群]\n目标：[期望结果]\n约束：[边界]\n请识别歧义，交叉检验范围与假设，最终整理可测试的需求、验收标准和待确认问题。', reviewOne: '比较方案', reviewTwo: '互审取舍与风险', reviewFinal: '推荐方案与验证', codeOne: '检查代码', codeTwo: '核实问题', codeFinal: '修复优先级', requirementsOne: '梳理需求', requirementsTwo: '澄清歧义', requirementsFinal: '验收计划',
        access: '工作模式', discussionMode: '纯讨论 · 只分析不修改文件', workspaceMode: '本地协作 · 读取与修改文件', workspaceHint: '使用关联会话的工作目录，成员依次执行。', workspaceConsent: '我允许这些成员读取、修改本地项目文件并运行获准的检查；相关文件内容可能发送至它们配置的模型服务。', workspaceActive: '本地协作 · 已开放文件工具',
        templates: '从一个讨论模板开始', compare: '方案对比', review: '设计评审', brainstorm: '创意探索', comparePrompt: '请帮我对比以下方案：[方案 A] 与 [方案 B]。\n目标：[期望达成的结果]\n约束：[时间、成本、兼容性等]\n请比较优缺点、依据与风险，提出最小验证步骤，并给出推荐。', reviewPrompt: '请帮我选择解决方案：[问题或当前方案]。\n目标与验收标准：[希望达到什么结果]\n约束：[时间、成本、技术条件]\n候选方案：[当前方案 / 其他想法，没有可不填]\n综合评审架构取舍、实现成本、复杂度和关键风险，给出最合适的方案与最小验证步骤。', brainstormPrompt: '请围绕这个问题探索解决思路：[问题描述]。\n面向用户：[使用对象]\n约束：[资源与边界]\n请提出不同方向，互相检验假设，并筛选三个可执行的想法。', search: '搜索讨论内容…', filterSpeaker: '按发言成员筛选', allMessages: '全部消息', summaries: '只看总结', noResults: '没有匹配的消息', noResultsHint: '试试其他关键词，或清除筛选条件。', clearFilters: '清除筛选', latest: '回到最新消息', following: '跟随新消息', paused: '正在阅读历史消息', shortcut: 'Ctrl / ⌘ + Enter 发送', messageCount: '条消息', phaseProgress: '讨论阶段', draftHint: '模板会填入问题简报，开始前请替换方括号中的内容。',
        export: '导出 Markdown', copy: '复制消息', copied: '已复制', copyFailed: '剪贴板不可用，请选中消息手动复制。', eyebrow: 'COLLECTIVE INTELLIGENCE', subtitle: '让独立观点交汇，让复杂决策更清晰。', setup: '讨论简报', setupHint: '提出清晰的问题，只共享必要的上下文。', timeline: '讨论现场', timelineHint: '独立分析 → 交叉审视 → 汇总结论', emptyTitle: '一个问题，三种视角。', emptyDescription: '从一个清晰的问题开始。成员将独立分析、检验假设，再汇聚成可行动的结论。', questionPlaceholder: '你想一起解决什么问题？', materialsPlaceholder: '粘贴选定的代码、证据或限制条件…', messagePlaceholder: '补充背景、质疑结论，或向某位成员追问…', hostRole: '主持讨论 · 汇总结论', agentRole: '独立分析 · 交叉审视', callFailed: '最近调用失败', replied: '已回复', ready: '接入已配置', summary: '汇总结论', roundOne: '独立分析', roundTwo: '交叉审视', followup: '补充讨论', safe: '仅讨论模式', brief: '本次问题', title: 'AI 讨论室', expand: '展开讨论室', collapse: '收起讨论室',
        question: '问题', materials: '共享材料（可选）', start: '开始讨论',
        consent: '我同意将本问题、共享材料及讨论消息发送到 DSH、Claude Code、Codex 配置的模型服务。本机运行 CLI 不代表数据仅在本地处理。',
        mode: '纯讨论 · 只分析不修改文件', target: '接收成员', all: '所有人',
        message: '补充消息', send: '发送', stop: '停止', summarize: '总结', reset: '清空',
        empty: '暂无消息，输入问题后开始讨论。', loading: '加载中…', pending: '待发送',
        unavailable: '不可用', available: '接入条件通过（以实际回复为准）', unknown: '未检查', round: '轮次',
        idle: '空闲', running: '讨论中', stopping: '停止中', completed: '已完成', interrupted: '已中断',
        user: '你', system: '系统', invalid: '讨论室响应格式无效。', missing: '当前会话不可用。',
        failed: '请求失败。', unhandled: '/discuss 命令不可用。', working: '处理中…',
        resetHint: '非运行状态可清空。', session: '关联讨论会话', addImage: '添加图片', addAttach: '添加图片 / 文件', attachHint: '图片支持 PNG/JPEG/WebP/GIF，可直接粘贴；文档最多 8 个，PDF 10 MiB、文本/代码 1 MiB，累计提取不超过 400,000 字符。', removeImage: '移除图片', image: '图片', imageLimit: '每条消息最多 4 张图片。', imageTooLarge: '单张图片不能超过 8 MB。', imageTotal: '图片总计不能超过 12 MB。', imagePaste: '可粘贴或添加图片（PNG、JPEG、WebP、GIF）。', noSession: '请先新建或打开一个 DSH 任务，再在此选择。', opening: '正在打开会话…',
      },
    };
    const css = `
      .ad-page .ad-template-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
      .ad-page .ad-template{grid-column:auto;align-items:flex-start;text-align:left;min-width:0;padding:10px;gap:8px;white-space:normal}
      .ad-page .ad-template .ad-template-copy{display:flex;flex-direction:column;gap:4px;min-width:0;font-size:12px;color:inherit;transform:none}
      .ad-template-copy strong{font-size:12px;font-weight:600}.ad-template-copy small{font-size:11px;font-weight:400;line-height:1.5;color:var(--dsw-alias-label-secondary)}
      .ad-progress-hint{margin:8px 0 0;line-height:1.6}
      .ad-page textarea.ad-question{min-height:240px;max-height:none}
      .ad-print-root{display:none!important}
      @media print{
        html.ad-printing,html.ad-printing body{background:#fff!important}
        html.ad-printing body>*:not(.ad-print-root){display:none!important}
        html.ad-printing .ad-print-root{display:block!important;max-width:800px;margin:0 auto;padding:0;color:#202124!important;background:#fff!important;font:16px/1.65 system-ui,sans-serif}
        html.ad-printing .ad-print-root h1{font-size:24px;border-bottom:1px solid #bbb;padding-bottom:12px;break-after:avoid}
        html.ad-printing .ad-print-root p{white-space:pre-wrap;overflow-wrap:anywhere;margin:0 0 1em;orphans:3;widows:3}
      }

      /* Layout contract, measured on the real host (desktop 1.0.92, host 0.2.2-alpha.2, 1373 px window):
         the page is mounted inside a ZERO-height wrapper, so height:100% collapses to auto and
         max-height:100dvh is the only bound that keeps content inside the window. The vertical chrome
         below is budgeted against that 1373 px; changing these numbers without re-measuring brings back
         the 56 px cut-off that hid the action row. Guards: layout.test.js, docs/VERIFICATION.md. */
      .ad-page{box-sizing:border-box;width:100%;height:100%;min-height:0;max-height:100dvh;overflow:auto;padding:32px max(24px,var(--dsh-frame-leading-clearance,0px));color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font-size:13px;line-height:1.6}
      .ad-page *{box-sizing:border-box}.ad-shell{max-width:1360px;margin:auto}.ad-page button,.ad-page textarea,.ad-page select{font:inherit;color:inherit}.ad-page button,.ad-page select{cursor:pointer}.ad-page button:disabled{opacity:.4;cursor:not-allowed}
      .ad-page button:focus-visible,.ad-page textarea:focus-visible,.ad-page select:focus-visible,.ad-page input:focus-visible,.ad-page summary:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:3px}
      .ad-hero{display:flex;justify-content:space-between;align-items:center;gap:24px;margin-bottom:26px}.ad-title-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.ad-title-row .ad-pill,.ad-title-row .ad-access-head select{height:30px;min-height:30px;box-sizing:border-box}.ad-title-row .ad-pill{padding:0 12px}.ad-title-row .ad-access{display:flex;align-items:center}.ad-access-title select{width:auto;min-width:11em;max-width:24em;padding:0 30px 0 12px;font-size:12px;border-radius:10px}.ad-eyebrow{font-size:10px;font-weight:700;letter-spacing:.2em;color:var(--dsw-alias-brand-primary);margin-bottom:8px}.ad-hero h1{font-size:28px;letter-spacing:-.035em;line-height:1.25;margin:0 0 8px;font-weight:650}.ad-subtitle,.ad-muted{color:var(--dsw-alias-label-secondary)}.ad-subtitle{margin:0;font-size:13px}.ad-eyebrow-row{display:flex;align-items:center;gap:14px;margin-bottom:6px;flex-wrap:wrap}.ad-eyebrow-row .ad-eyebrow{margin-bottom:0;line-height:20px}.ad-subtitle-inline{font-size:12px;color:var(--dsw-alias-label-secondary);line-height:20px;display:flex;align-items:center}.ad-session{display:grid;gap:6px;font-size:11px;color:var(--dsw-alias-label-secondary);min-width:200px;max-width:300px}.ad-session select{width:100%;text-overflow:ellipsis}
      .ad-page select,.ad-btn{border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-layer-1);padding:8px 12px;transition:background .15s,border-color .15s}.ad-btn{font-size:12px;font-weight:550;white-space:nowrap}.ad-btn:not(:disabled):hover{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}.ad-btn.ad-primary{color:var(--dsw-alias-brand-primary);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,var(--dsw-alias-bg-layer-1));border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 30%,var(--dsw-alias-border-l1))}.ad-btn.ad-primary:not(:disabled):hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 20%,var(--dsw-alias-bg-layer-1))}.ad-btn.ad-quiet{background:transparent;border-color:transparent;color:var(--dsw-alias-label-secondary)}
      .ad-room{min-width:0}.ad-topline{display:flex;justify-content:space-between;align-items:center;gap:14px;margin:0 0 16px}.ad-security{font-size:11px;color:var(--dsw-alias-label-secondary);display:flex;align-items:center;gap:7px}.ad-security:before{content:'◇';color:var(--dsw-alias-brand-primary)}.ad-pill{font-size:11px;display:inline-flex;align-items:center;gap:7px;border:1px solid var(--dsw-alias-border-l1);border-radius:100px;padding:5px 10px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1)}.ad-dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-label-secondary);flex-shrink:0}.ad-pill[data-state=running] .ad-dot{background:var(--dsw-alias-brand-primary)}.ad-pill[data-state=error] .ad-dot{background:var(--dsw-alias-state-error-primary)}
      .ad-members{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:24px}.ad-member{border:1px solid var(--dsw-alias-border-l1);border-radius:14px;padding:15px 16px;background:var(--dsw-alias-bg-layer-1);display:flex;gap:12px;align-items:flex-start;min-width:0}.ad-avatar{width:34px;height:34px;border-radius:10px;display:flex;justify-content:center;align-items:center;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);font-size:12px;font-weight:650;flex-shrink:0}.ad-member:first-child .ad-avatar{color:var(--dsw-alias-brand-primary);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 8%,var(--dsw-alias-bg-layer-1))}.ad-member-info{min-width:0}.ad-member-name{font-size:13px;font-weight:650}.ad-member-role{font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ad-member-state{font-size:10px;color:var(--dsw-alias-label-secondary);margin-top:5px;display:flex;align-items:center;gap:6px}.ad-member-state[data-state=error]{color:var(--dsw-alias-state-error-primary)}.ad-member-state[data-state=success] .ad-dot{background:var(--dsw-alias-state-success-primary)}.ad-member-state[data-state=error] .ad-dot{background:var(--dsw-alias-state-error-primary)}
      .ad-workspace{display:grid;grid-template-columns:300px minmax(0,1fr);gap:20px;align-items:stretch}.ad-workspace>.ad-card{height:100%;display:flex;flex-direction:column;min-height:0}.ad-workspace>.ad-conversation>.ad-history{flex:1 1 auto;max-height:none;min-height:360px}.ad-card{border:1px solid var(--dsw-alias-border-l1);border-radius:16px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}.ad-setup{padding:20px}.ad-section-title{font-size:14px;font-weight:650;margin:0}.ad-section-hint{font-size:11px;color:var(--dsw-alias-label-secondary);margin:5px 0 18px}.ad-setup label{display:grid;gap:8px;font-size:12px}.ad-page textarea{display:block;resize:vertical;width:100%;min-height:90px;max-height:260px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-base);padding:11px 12px;font-size:12px;line-height:1.7}.ad-page textarea::placeholder{color:var(--dsw-alias-label-secondary);opacity:.7}.ad-materials{margin:16px 0}.ad-page summary{cursor:pointer;color:var(--dsw-alias-label-secondary);font-size:12px;list-style-position:inside}.ad-materials textarea{margin-top:10px}.ad-page .ad-consent{display:flex;gap:9px;align-items:flex-start;font-size:10px;line-height:1.7;color:var(--dsw-alias-label-secondary);margin:18px 0}.ad-consent input{margin:3px 0 0;accent-color:var(--dsw-alias-brand-primary);flex-shrink:0}.ad-start{width:100%;padding:10px}.ad-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.ad-actions .ad-btn{flex:1;padding:7px 8px}.ad-setup-details>summary{font-size:14px;font-weight:650;color:var(--dsw-alias-label-primary)}.ad-setup-content{margin-top:18px}.ad-current-question{font-size:12px;color:var(--dsw-alias-label-secondary);border-left:2px solid var(--dsw-alias-brand-primary);padding-left:12px;margin:18px 0;overflow-wrap:anywhere}
      .ad-conversation{min-width:0}.ad-conversation-head{padding:18px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--dsw-alias-border-l1)}.ad-conversation-head .ad-section-hint{margin:3px 0 0}.ad-history{min-height:320px;max-height:60vh;overflow:auto;overscroll-behavior:contain;padding:20px;scrollbar-width:thin}.ad-empty{min-height:280px;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;padding:28px;color:var(--dsw-alias-label-secondary)}.ad-empty-icon{width:58px;height:58px;display:flex;align-items:center;justify-content:center;border:1px solid var(--dsw-alias-border-l1);border-radius:18px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-brand-primary);margin-bottom:20px}.ad-empty h3{font-size:18px;font-weight:550;color:var(--dsw-alias-label-primary);margin:0 0 8px;letter-spacing:-.02em}.ad-empty p{font-size:12px;max-width:320px;margin:0;line-height:1.8}.ad-round{display:flex;align-items:center;gap:10px;margin:20px 0 14px;color:var(--dsw-alias-label-secondary);font-size:10px;letter-spacing:.04em}.ad-round:first-child{margin-top:0}.ad-round:after{content:'';height:1px;background:var(--dsw-alias-border-l1);flex:1}.ad-msg{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:15px 16px;margin-bottom:12px;background:var(--dsw-alias-bg-base)}.ad-msg[data-speaker=user]{background:var(--dsw-alias-bg-layer-2)}.ad-msg[data-speaker=system]{border-style:dashed;color:var(--dsw-alias-label-secondary)}.ad-msg[data-summary=true]{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 35%,var(--dsw-alias-border-l1));background:color-mix(in srgb,var(--dsw-alias-brand-primary) 4%,var(--dsw-alias-bg-base))}.ad-msg[data-error=true]{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 28%,var(--dsw-alias-border-l1))}.ad-msg-head{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:10px}.ad-msg-head .ad-avatar{width:25px;height:25px;border-radius:7px;font-size:9px}.ad-msg-head strong{font-size:12px}.ad-msg-meta{font-size:10px;color:var(--dsw-alias-label-secondary);margin-left:auto}.ad-markdown{font-size:12px;line-height:1.85;overflow-wrap:anywhere}.ad-markdown p{white-space:pre-wrap;margin:8px 0}.ad-markdown p:first-child{margin-top:0}.ad-markdown p:last-child{margin-bottom:0}.ad-markdown ul{padding-left:19px;margin:8px 0}.ad-markdown li+li{margin-top:4px}.ad-markdown code{font:11px ui-monospace,SFMono-Regular,Consolas,monospace;border:1px solid var(--dsw-alias-border-l1);border-radius:4px;background:var(--dsw-alias-bg-layer-2);padding:1px 4px}.ad-error{font-size:12px;color:var(--dsw-alias-state-error-primary);padding:12px 16px;border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary) 25%,var(--dsw-alias-border-l1));border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 4%,var(--dsw-alias-bg-layer-1));white-space:pre-wrap;overflow-wrap:anywhere;margin-bottom:14px}.ad-pending{padding:10px 16px;font-size:11px;color:var(--dsw-alias-label-secondary);border-top:1px solid var(--dsw-alias-border-l1)}.ad-composer{padding:16px 20px;border-top:1px solid var(--dsw-alias-border-l1)}.ad-composer textarea{min-height:72px;border:0;background:var(--dsw-alias-bg-base);margin-bottom:10px}.ad-composer-footer{display:flex;justify-content:space-between;gap:12px;align-items:center}.ad-composer-footer select{font-size:11px;padding:6px 9px}.ad-composer-footer .ad-btn{padding:7px 18px}.ad-composer-label{font-size:11px;color:var(--dsw-alias-label-secondary);margin-bottom:8px}.ad-copy{font-size:10px;margin-top:8px;padding:2px 0}.ad-busy{font-size:10px;color:var(--dsw-alias-label-secondary)}
      .ad-image-tray{display:flex;flex-wrap:wrap;gap:8px;margin-top:9px}.ad-image-item{position:relative;width:64px;height:64px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;overflow:hidden;background:var(--dsw-alias-bg-layer-2)}.ad-image-item img{width:100%;height:100%;object-fit:cover;display:block}.ad-image-remove{position:absolute;top:2px;right:2px;width:20px;height:20px;padding:0;border-radius:50%;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);line-height:1;font-size:13px}.ad-attach-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px}.ad-attach{display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--dsw-alias-label-secondary);cursor:pointer;border:1px dashed var(--dsw-alias-border-l1);border-radius:8px;padding:5px 9px}.ad-attach:hover{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary)}.ad-attach input{display:none}.ad-image-hint{font-size:10px;color:var(--dsw-alias-label-secondary)}.ad-image-chip{display:inline-flex;align-items:center;gap:5px;font-size:10px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;padding:2px 8px;margin:8px 6px 0 0;color:var(--dsw-alias-label-secondary)}
      .ad-page{--ad-accent:var(--dsw-alias-brand-primary);background:radial-gradient(ellipse at 90% 0%,color-mix(in srgb,var(--ad-accent) 7%,transparent),transparent 48%),var(--dsw-alias-bg-base);padding-top:22px}.ad-shell{max-width:1440px}.ad-page input{font:inherit;color:inherit}.ad-hero{margin-bottom:18px}.ad-hero h1{font-size:32px;letter-spacing:-.045em}.ad-eyebrow{display:flex;align-items:center;gap:9px}.ad-eyebrow:before{content:'';width:19px;height:2px;background:currentColor}.ad-session{padding:12px 14px;border:1px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-layer-1);min-width:250px}.ad-session select{background:transparent;border:0;padding:2px 0;font-size:12px;color:var(--dsw-alias-label-primary)}.ad-topline{margin-bottom:14px}.ad-members{margin-bottom:16px;gap:14px}.ad-member{position:relative;overflow:hidden;padding:18px;--ad-member-color:var(--ad-accent);box-shadow:0 4px 18px #00000003}.ad-member[data-speaker=claude]{--ad-member-color:#c57953}.ad-member[data-speaker=codex]{--ad-member-color:#599b88}.ad-member:before{content:'';position:absolute;inset:0 auto 0 0;width:3px;background:var(--ad-member-color)}.ad-member .ad-avatar{color:var(--ad-member-color);background:color-mix(in srgb,var(--ad-member-color) 10%,var(--dsw-alias-bg-layer-1));border-color:color-mix(in srgb,var(--ad-member-color) 18%,var(--dsw-alias-border-l1));width:40px;height:40px;border-radius:13px}.ad-member-name{margin-bottom:2px}.ad-member-role{max-width:100%}.ad-card{box-shadow:0 8px 32px #00000004}.ad-workspace{grid-template-columns:320px minmax(0,1fr);gap:18px}.ad-setup{padding:22px}.ad-section-title{font-size:15px}.ad-setup textarea:focus,.ad-composer textarea:focus,.ad-search:focus{border-color:var(--ad-accent)}.ad-start{background:var(--ad-accent)!important;color:var(--dsw-alias-label-primary-foreground,#fff)!important;border-color:transparent!important;box-shadow:0 3px 10px color-mix(in srgb,var(--ad-accent) 15%,transparent)}.ad-start:not(:disabled):hover{filter:brightness(1.08)}.ad-page textarea{transition:border-color .15s}.ad-field-label{display:block;color:var(--dsw-alias-label-secondary);font-size:11px;margin-bottom:8px}.ad-templates{margin:0 0 20px}.ad-template-options{display:flex;gap:6px;flex-wrap:wrap}.ad-template{display:flex;gap:5px;align-items:center;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:6px 8px;font-size:11px!important}.ad-template span{font-size:15px;color:var(--ad-accent)}.ad-template:not(:disabled):hover{border-color:var(--ad-accent);background:color-mix(in srgb,var(--ad-accent) 5%,var(--dsw-alias-bg-base))}.ad-stages{display:flex;list-style:none;margin:0 0 16px;padding:10px 18px;gap:18px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 70%,transparent)}.ad-stages li{display:flex;flex:1;align-items:center;gap:10px;font-size:11px;color:var(--dsw-alias-label-secondary);min-width:0}.ad-stages li+li{border-left:1px solid var(--dsw-alias-border-l1);padding-left:18px}.ad-stage-number{font-size:10px;font-variant-numeric:tabular-nums;display:grid;place-items:center;width:25px;height:25px;flex-shrink:0;border-radius:8px;background:var(--dsw-alias-bg-layer-2)}.ad-stages [aria-current=step],.ad-stages [data-reached=true]{color:var(--dsw-alias-label-primary)}.ad-stages [aria-current=step] .ad-stage-number,.ad-stages [data-reached=true] .ad-stage-number{background:color-mix(in srgb,var(--ad-accent) 12%,var(--dsw-alias-bg-layer-1));color:var(--ad-accent)}.ad-stage-check{margin-left:auto;color:var(--ad-accent)}.ad-stage-warning{margin-left:auto;font-weight:700;color:var(--dsw-alias-state-error-primary)}.ad-stages [data-error=true] .ad-stage-number{color:var(--dsw-alias-state-error-primary)}.ad-conversation-head{padding:20px 22px}.ad-toolbar{display:flex;align-items:center;gap:8px;padding:12px 20px;border-bottom:1px solid var(--dsw-alias-border-l1);flex-wrap:wrap}.ad-search{flex:1;min-width:140px;width:100px;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:7px 10px;font-size:12px!important}.ad-toolbar select,.ad-toolbar .ad-btn{padding:7px 9px;font-size:11px}.ad-summary-toggle[aria-pressed=true]{color:var(--ad-accent);border-color:var(--ad-accent);background:color-mix(in srgb,var(--ad-accent) 8%,var(--dsw-alias-bg-layer-1))}.ad-result-count{font-size:10px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}.ad-history{min-height:360px;max-height:56vh;padding:22px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 55%,var(--dsw-alias-bg-layer-1));overflow-anchor:none}.ad-empty{min-height:330px}.ad-empty-icon{width:70px;height:70px;border-radius:24px;background:linear-gradient(140deg,color-mix(in srgb,var(--ad-accent) 10%,var(--dsw-alias-bg-layer-1)),var(--dsw-alias-bg-layer-1));box-shadow:0 8px 28px color-mix(in srgb,var(--ad-accent) 7%,transparent);transform:rotate(-5deg)}.ad-empty-icon svg{transform:rotate(5deg)}.ad-empty h3{font-size:21px}.ad-msg{border-radius:13px;background:var(--dsw-alias-bg-layer-1);padding:18px;border-left:3px solid var(--dsw-alias-border-l1)}.ad-msg[data-speaker=dsh]{border-left-color:var(--ad-accent)}.ad-msg[data-speaker=claude]{border-left-color:#c57953}.ad-msg[data-speaker=codex]{border-left-color:#599b88}.ad-msg[data-speaker=user]{background:var(--dsw-alias-bg-base);border-left-width:1px}.ad-msg[data-error=true]{border-left-color:var(--dsw-alias-state-error-primary)}.ad-markdown h3,.ad-markdown h4,.ad-markdown h5,.ad-markdown h6{font-size:13px;margin:16px 0 8px;line-height:1.5}.ad-markdown pre{overflow:auto;padding:14px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-base);white-space:pre;font-size:11px;line-height:1.7}.ad-markdown pre code{padding:0;background:none;white-space:pre;font-size:inherit}.ad-reading-bar{display:flex;justify-content:space-between;align-items:center;min-height:36px;padding:4px 20px;border-top:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:10px}.ad-reading-bar .ad-btn{padding:3px 8px;font-size:10px;color:var(--ad-accent)}.ad-composer{padding:18px 22px}.ad-composer textarea{min-height:90px}.ad-shortcut{font-size:10px;color:var(--dsw-alias-label-secondary);margin-left:auto}.ad-attach-row{align-items:flex-start}.ad-image-hint{max-width:60%;text-align:right}.ad-session,.ad-workspace,.ad-members,.ad-toolbar{min-width:0}@media(prefers-reduced-motion:reduce){.ad-page *{transition:none!important;scroll-behavior:auto!important}}@media(max-width:1100px){.ad-workspace{grid-template-columns:280px minmax(0,1fr)}.ad-setup{padding:18px}.ad-shortcut{display:none}}@media(max-width:760px){.ad-workspace{grid-template-columns:minmax(0,1fr)}.ad-session{min-width:0}.ad-stages{gap:8px;padding:10px}.ad-stages li{gap:6px;font-size:10px}.ad-stages li+li{padding-left:8px}.ad-stage-check{display:none}.ad-history{max-height:60vh;min-height:300px}.ad-toolbar{padding:12px}.ad-page .ad-hero h1{font-size:26px}.ad-member .ad-avatar{width:32px;height:32px}.ad-template-options{gap:8px}.ad-search{flex-basis:100%}}
      @media(max-width:1000px){.ad-page{padding:24px 20px}.ad-workspace{grid-template-columns:260px minmax(0,1fr)}.ad-member{padding:12px;gap:9px}.ad-member-role{font-size:10px}}@media(max-width:760px){.ad-hero{align-items:flex-start;flex-direction:column;gap:18px}.ad-session{max-width:none;width:100%}.ad-workspace{grid-template-columns:minmax(0,1fr)}.ad-members{gap:8px}.ad-member{flex-direction:column;gap:8px}.ad-member-state{font-size:9px}.ad-member-role{white-space:normal}.ad-history{max-height:65vh}.ad-hero h1{font-size:24px}.ad-page{padding:24px 14px}.ad-security{max-width:62%}.ad-conversation-head,.ad-composer{padding:16px}.ad-history{padding:14px}}
      /* Shared interaction motion: native controls, no animation dependency. */
      .ad-room{--ad-ease:cubic-bezier(.2,.8,.2,1)}
      .ad-room .ad-btn,.ad-template,.ad-attach,.ad-access select,.ad-consent{transition:transform .24s var(--ad-ease),box-shadow .24s var(--ad-ease),background .24s,border-color .24s,color .24s,opacity .24s}
      .ad-template,.ad-attach,.ad-start{position:relative;isolation:isolate;overflow:hidden}
      .ad-template:after,.ad-attach:after,.ad-start:after{content:'';position:absolute;inset:-50% -80%;z-index:-1;pointer-events:none;background:linear-gradient(110deg,transparent 40%,color-mix(in srgb,var(--ad-accent) 12%,transparent) 50%,transparent 60%);transform:translateX(-65%);transition:transform .65s var(--ad-ease)}
      .ad-start:after{background:linear-gradient(110deg,transparent 42%,#ffffff35 50%,transparent 58%)}
      .ad-template[aria-pressed=true]{color:var(--ad-accent);border-color:color-mix(in srgb,var(--ad-accent) 55%,var(--dsw-alias-border-l1));background:color-mix(in srgb,var(--ad-accent) 9%,var(--dsw-alias-bg-layer-1));box-shadow:0 0 0 3px color-mix(in srgb,var(--ad-accent) 7%,transparent)}
      .ad-template>span{display:inline-block;transition:transform .3s var(--ad-ease)}
      .ad-template[aria-pressed=true]>span{transform:rotate(-8deg) scale(1.12)}
      .ad-room .ad-btn:not(:disabled):active,.ad-template:not(:disabled):active,.ad-attach:active{transform:translateY(0) scale(.97);transition-duration:.1s}
      /* Disabled controls keep readable contrast instead of fading into the surface. */
      .ad-page button:disabled{opacity:1;color:var(--dsw-alias-label-secondary,#8a8f98)!important;background:color-mix(in srgb,var(--dsw-alias-label-secondary,#8a8f98) 9%,transparent)!important;border-color:color-mix(in srgb,var(--dsw-alias-label-secondary,#8a8f98) 18%,transparent)!important;cursor:not-allowed}
      .ad-page button:disabled .ad-start-arrow,.ad-page button:disabled>span{opacity:.7}
      .ad-access{margin-top:18px}.ad-access select{width:100%;min-width:0;box-shadow:0 2px 6px #00000004}
      .ad-access-head{margin-top:0;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
      .ad-access-head select{width:auto;min-width:11em;max-width:24em;padding:7px 30px 7px 12px;font-size:12px;border-radius:10px;height:34px}
      .ad-mode-live{font-size:11px;color:var(--dsw-alias-label-secondary)}
      .ad-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
      .ad-access:focus-within select{border-color:var(--ad-accent);box-shadow:0 0 0 4px color-mix(in srgb,var(--ad-accent) 10%,transparent)}
      .ad-mode-info{animation:ad-reveal .32s var(--ad-ease);padding:10px 12px;margin:10px 0 0;border-left:2px solid color-mix(in srgb,var(--ad-accent) 40%,transparent);background:color-mix(in srgb,var(--ad-accent) 4%,transparent);border-radius:0 8px 8px 0}
      .ad-page .ad-consent{padding:12px;border:1px solid transparent;border-radius:12px;cursor:pointer;background:var(--dsw-alias-bg-base)}
      .ad-page .ad-consent[data-checked=true]{border-color:color-mix(in srgb,var(--ad-accent) 24%,var(--dsw-alias-border-l1));background:color-mix(in srgb,var(--ad-accent) 5%,var(--dsw-alias-bg-layer-1))}
      .ad-consent input{appearance:none;width:16px;height:16px;border:1px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));border-radius:5px;background:var(--dsw-alias-bg-layer-1);display:grid;place-items:center;cursor:pointer;transition:background .2s,border-color .2s,box-shadow .2s}
      .ad-consent input:before{content:'';width:7px;height:4px;border-left:2px solid var(--dsw-alias-label-primary-foreground,#fff);border-bottom:2px solid var(--dsw-alias-label-primary-foreground,#fff);transform:rotate(-45deg) scale(0);transition:transform .22s var(--ad-ease)}
      .ad-consent input:checked{background:var(--ad-accent);border-color:var(--ad-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--ad-accent) 10%,transparent)}
      .ad-consent input:checked:before{transform:rotate(-45deg) scale(1)}
      .ad-start:not(:disabled){animation:ad-ready .45s var(--ad-ease)}.ad-start-arrow{display:inline-block;margin-left:8px;transition:transform .25s var(--ad-ease)}
      .ad-attach input{display:block;position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;clip-path:inset(50%)}
      .ad-attach:focus-within{outline:2px solid var(--ad-accent);outline-offset:3px}
      .ad-image-item{animation:ad-reveal .3s var(--ad-ease);transition:transform .25s var(--ad-ease),box-shadow .25s}.ad-image-item img{transition:transform .35s var(--ad-ease)}
      .ad-page textarea{transition:border-color .2s,box-shadow .2s}.ad-page textarea:focus{box-shadow:0 0 0 3px color-mix(in srgb,var(--ad-accent) 8%,transparent)}
      @media(hover:hover) and (pointer:fine){
        .ad-room .ad-btn:not(:disabled):hover,.ad-template:not(:disabled):hover,.ad-attach:hover{transform:translateY(-2px);box-shadow:0 6px 16px color-mix(in srgb,var(--ad-accent) 12%,transparent)}
        .ad-template:not(:disabled):hover:after,.ad-attach:hover:after,.ad-start:not(:disabled):hover:after{transform:translateX(65%)}
        .ad-start:not(:disabled):hover .ad-start-arrow{transform:translate(3px,-3px)}
        .ad-image-item:hover{transform:translateY(-2px);box-shadow:0 6px 14px #00000016}.ad-image-item:hover img{transform:scale(1.07)}
      }
      @keyframes ad-reveal{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      @keyframes ad-ready{from{box-shadow:0 0 0 5px color-mix(in srgb,var(--ad-accent) 18%,transparent)}to{box-shadow:0 3px 10px color-mix(in srgb,var(--ad-accent) 15%,transparent)}}
      /* Whole-room depth and activity, bounded motion while idle. */
      .ad-shell{position:relative;isolation:isolate;perspective:1200px}
      .ad-hero{position:relative;animation:ad-surface-in .65s var(--ad-ease,cubic-bezier(.2,.8,.2,1)) both}
      .ad-hero:after{content:'';position:absolute;pointer-events:none;z-index:-1;inset:-32px 15% -24px 25%;background:radial-gradient(ellipse,color-mix(in srgb,var(--ad-accent) 12%,transparent),transparent 70%);animation:ad-ambient-in 1.6s ease-out both}
      .ad-member,.ad-card{--ad-light-x:50%;--ad-light-y:30%;position:relative;isolation:isolate;transition:border-color .3s,box-shadow .35s,transform .3s cubic-bezier(.2,.8,.2,1)}
      .ad-member:after,.ad-card:after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:2;opacity:0;background:radial-gradient(280px circle at var(--ad-light-x) var(--ad-light-y),color-mix(in srgb,var(--ad-member-color,var(--ad-accent)) 9%,transparent),transparent 70%);transition:opacity .4s}
      .ad-members{perspective:1200px}.ad-member{animation:ad-surface-in .65s .06s both}.ad-member:nth-child(2){animation-delay:.14s}.ad-member:nth-child(3){animation-delay:.22s}
      .ad-stages{animation:ad-surface-in .65s .2s both}.ad-setup{animation:ad-surface-in .65s .26s both}.ad-conversation{animation:ad-surface-in .65s .34s both}
      .ad-card:focus-within{border-color:color-mix(in srgb,var(--ad-accent) 30%,var(--dsw-alias-border-l1));box-shadow:0 12px 38px color-mix(in srgb,var(--ad-accent) 7%,transparent)}
      .ad-member .ad-avatar{transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s}
      .ad-msg{animation:ad-surface-in .4s both;transition:border-color .25s,box-shadow .25s,background .25s}
      .ad-msg[data-summary=true]{box-shadow:inset 3px 0 color-mix(in srgb,var(--ad-accent) 45%,transparent)}
      .ad-stages li{position:relative;overflow:hidden;transition:background .3s,color .3s}.ad-stages li[aria-current=step]{background:color-mix(in srgb,var(--ad-accent) 6%,transparent);border-radius:10px}
      .ad-stages li[aria-current=step]:after{content:'';position:absolute;bottom:0;left:0;width:40%;height:2px;background:linear-gradient(90deg,transparent,var(--ad-accent),transparent);animation:ad-stage-flow 2.4s ease-in-out infinite}
      .ad-stage-number{transition:background .3s,color .3s,box-shadow .3s}.ad-stages li[aria-current=step] .ad-stage-number{box-shadow:0 0 0 4px color-mix(in srgb,var(--ad-accent) 7%,transparent)}
      .ad-room[data-running=true] .ad-pill .ad-dot{animation:ad-live 1.8s ease-in-out infinite}
      .ad-room[data-running=true] .ad-conversation{border-color:color-mix(in srgb,var(--ad-accent) 30%,var(--dsw-alias-border-l1))}
      .ad-empty-icon{animation:ad-icon-arrive .9s .35s both}.ad-pending,.ad-reading-bar{animation:ad-surface-in .3s both}
      @media(hover:hover) and (pointer:fine){
        .ad-member[data-lit=true]{transform:rotateX(var(--ad-tilt-x,0deg)) rotateY(var(--ad-tilt-y,0deg)) translateY(-4px);border-color:color-mix(in srgb,var(--ad-member-color) 38%,var(--dsw-alias-border-l1));box-shadow:0 16px 30px color-mix(in srgb,var(--ad-member-color) 12%,transparent)}
        .ad-member[data-lit=true]:after,.ad-card[data-lit=true]:after{opacity:1}
        .ad-member[data-lit=true] .ad-avatar{transform:translateY(-2px) rotate(-4deg);box-shadow:0 7px 18px color-mix(in srgb,var(--ad-member-color) 14%,transparent)}
        .ad-card[data-lit=true]{box-shadow:0 12px 40px color-mix(in srgb,var(--ad-accent) 8%,transparent)}
        .ad-msg:hover{border-color:color-mix(in srgb,var(--ad-accent) 22%,var(--dsw-alias-border-l1));box-shadow:0 4px 18px #00000006}
      }
      @keyframes ad-surface-in{from{opacity:0;translate:0 12px}to{opacity:1;translate:0 0}}
      @keyframes ad-ambient-in{from{opacity:0;scale:.85}to{opacity:1;scale:1}}
      @keyframes ad-icon-arrive{from{opacity:0;transform:translateY(8px) rotate(-12deg) scale(.9)}to{opacity:1;transform:translateY(0) rotate(0) scale(1)}}
      @keyframes ad-stage-flow{from{translate:-100% 0}to{translate:350% 0}}
      @keyframes ad-live{50%{opacity:.4;box-shadow:0 0 0 4px color-mix(in srgb,var(--ad-accent) 12%,transparent)}}
      @media(prefers-reduced-motion:reduce){.ad-page .ad-hero,.ad-page .ad-hero:after{animation:none!important}.ad-room *,.ad-room *:before,.ad-room *:after{animation:none!important;transition:none!important}.ad-room .ad-btn,.ad-template,.ad-attach,.ad-image-item,.ad-image-item img,.ad-start-arrow,.ad-member,.ad-member .ad-avatar{transform:none!important}.ad-member:after,.ad-card:after{display:none!important}}
      .ad-extra{padding:14px 18px;border-bottom:1px solid var(--dsw-alias-border-l1)}.ad-extra>summary{font-weight:600;color:var(--dsw-alias-label-primary)}.ad-branch-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px}.ad-branch-choice{display:flex;gap:6px;align-items:center}.ad-file-list{display:grid;gap:6px;margin-top:9px}.ad-file{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:7px 9px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;font-size:11px;overflow-wrap:anywhere}.ad-file button{flex-shrink:0}.ad-call-state{color:var(--ad-accent);font-size:11px;font-variant-numeric:tabular-nums}.ad-msg-controls{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.ad-msg-controls .ad-btn{padding:4px 8px;font-size:10px}.ad-msg:focus{outline:2px solid var(--ad-accent);outline-offset:2px}.ad-ledger{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:14px}.ad-ledger-column{min-width:0;padding:12px;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:10px}.ad-ledger h3{font-size:12px;margin:0 0 10px}.ad-ledger-item{font-size:12px;overflow-wrap:anywhere;padding:8px 0;border-top:1px solid var(--dsw-alias-border-l1)}.ad-ledger-item p{margin:0 0 6px}.ad-evidence{display:flex;gap:4px;flex-wrap:wrap}.ad-evidence .ad-btn{font-size:10px;padding:2px 6px}.ad-warning{margin:10px 0;padding:9px 12px;border-left:3px solid var(--dsw-alias-state-warning-primary,#ad7936);font-size:11px;background:var(--dsw-alias-bg-base)}.ad-table-wrap{overflow:auto;margin-top:12px}.ad-table{border-collapse:collapse;width:100%;font-size:11px;text-align:left}.ad-table th,.ad-table td{padding:8px;vertical-align:top;border-bottom:1px solid var(--dsw-alias-border-l1);overflow-wrap:anywhere;min-width:90px}.ad-table th{font-weight:600}.ad-stats-usage{min-width:180px!important}.ad-followup{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px 0;border-top:1px solid var(--dsw-alias-border-l1)}.ad-followup>span{flex:1;min-width:150px;overflow-wrap:anywhere}.ad-followup .ad-btn{font-size:10px;padding:4px 8px}.ad-metadata{font-size:10px;color:var(--dsw-alias-label-secondary);margin-top:6px;overflow-wrap:anywhere}.ad-toolbar{flex-wrap:wrap}.ad-toolbar select{max-width:180px}.ad-template-options{flex-wrap:wrap}.ad-template{flex:1 1 100px}.ad-file-picker{display:grid;gap:5px;margin-top:10px}.ad-file-picker .ad-image-hint{line-height:1.5}.ad-live-calls{padding:10px 18px;border-bottom:1px solid var(--dsw-alias-border-l1);display:flex;flex-wrap:wrap;gap:12px}.ad-round-plan{font-size:10px;color:var(--dsw-alias-label-secondary);margin-top:8px;overflow-wrap:anywhere}
      @media(max-width:1000px){.ad-ledger{grid-template-columns:minmax(0,1fr)}}
      @media(forced-colors:active){.ad-consent input{appearance:auto}.ad-consent input:before{display:none}}
      /* Native customizable selects keep OS keyboard/touch behavior and use the top layer. */
      .ad-page select{min-height:36px;border-radius:11px;padding:8px 12px;box-shadow:0 1px 2px #00000003;transition:border-color .18s,background .18s,box-shadow .18s}
      .ad-page select:not(:disabled):hover{border-color:color-mix(in srgb,var(--ad-accent) 30%,var(--dsw-alias-border-l1));background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 96%,var(--ad-accent))}
      .ad-page select:disabled{cursor:not-allowed;opacity:.45}
      @supports(appearance:base-select){
        .ad-page select,.ad-page select::picker(select){appearance:base-select}
        .ad-page select{display:inline-flex;align-items:center;justify-content:space-between;gap:16px;max-width:100%;white-space:nowrap}
        .ad-page select::picker-icon{content:'';width:7px;height:7px;flex-shrink:0;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;rotate:45deg;translate:0 -2px;color:var(--dsw-alias-label-secondary);transition:rotate .22s,translate .22s}
        .ad-page select:open{border-color:color-mix(in srgb,var(--ad-accent) 50%,var(--dsw-alias-border-l1));box-shadow:0 0 0 3px color-mix(in srgb,var(--ad-accent) 9%,transparent)}
        .ad-page select:open::picker-icon{rotate:225deg;translate:0 2px;color:var(--ad-accent)}
        .ad-page select::picker(select){padding:6px;margin-block:7px;border:1px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 16px 44px #00000016,0 3px 10px #00000008;font-family:inherit;font-size:12px;line-height:1.5;max-height:min(360px,60dvh);max-width:min(440px,calc(100vw - 24px));overflow:auto;scrollbar-width:thin;opacity:0;transform:translateY(-5px) scale(.985);transform-origin:top;transition:opacity .18s,transform .22s cubic-bezier(.2,.7,.2,1),display .22s allow-discrete,overlay .22s allow-discrete}
        .ad-page select::picker(select):popover-open{opacity:1;transform:translateY(0) scale(1)}
        @starting-style{.ad-page select::picker(select):popover-open{opacity:0;transform:translateY(-5px) scale(.985)}}
        .ad-page select option{display:flex;gap:10px;align-items:center;min-height:36px;padding:9px 12px;border-radius:8px;white-space:normal;overflow-wrap:anywhere;font-size:12px;font-weight:450;background:transparent;color:var(--dsw-alias-label-primary);transition:background .14s,color .14s}
        .ad-page select option:not(:last-child){margin-bottom:2px}
        .ad-page select option:hover,.ad-page select option:focus{outline:none;background:var(--dsw-alias-bg-layer-2)}
        .ad-page select option:checked{color:var(--ad-accent);background:color-mix(in srgb,var(--ad-accent) 9%,var(--dsw-alias-bg-layer-1));font-weight:600}
        .ad-page select option::checkmark{order:1;margin-left:auto;color:var(--ad-accent);font-size:12px}
        .ad-session select{padding:4px 0;min-height:26px;box-shadow:none}
      }
      .ad-page summary{display:flex;align-items:center;gap:9px;list-style:none;transition:color .18s}
      .ad-page summary::-webkit-details-marker{display:none}
      .ad-page summary::before{content:'';width:6px;height:6px;flex:0 0 6px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;rotate:-45deg;opacity:.6;transition:rotate .22s,opacity .22s}
      .ad-page details[open]>summary::before{rotate:45deg;opacity:1}
      .ad-page .ad-setup-details>summary::before{margin-left:2px}
      .ad-page summary:hover,.ad-page details[open]>summary{color:var(--ad-accent)}
      .ad-page .ad-extra{padding:16px 20px;transition:background .2s}
      .ad-page .ad-extra[open]{background:color-mix(in srgb,var(--ad-accent) 2%,var(--dsw-alias-bg-layer-1))}
      @supports(interpolate-size:allow-keywords){
        .ad-page details{interpolate-size:allow-keywords}
        .ad-page details::details-content{block-size:0;opacity:0;overflow:clip;transition:block-size .26s cubic-bezier(.2,.7,.2,1),opacity .2s,content-visibility .26s allow-discrete}
        .ad-page details[open]::details-content{block-size:auto;opacity:1}
      }
      @media(prefers-reduced-motion:reduce){.ad-page select,.ad-page select::picker-icon,.ad-page select::picker(select),.ad-page select option,.ad-page summary,.ad-page summary::before,.ad-page details::details-content{transition:none!important}}
      @media(forced-colors:active){.ad-page select::picker(select){border:1px solid CanvasText}.ad-page select option:checked{outline:1px solid Highlight}}
    `;
    function inlineMarkdown(text) {
      return String(text).split(/(\*\*[^*\n]+\*\*|`[^`\n]+`)/g).map((part, i) => part.startsWith('**') && part.endsWith('**') ? h('strong', { key: i }, part.slice(2, -2)) : part.startsWith('`') && part.endsWith('`') ? h('code', { key: i }, part.slice(1, -1)) : part);
    }
    function Markdown({ text }) {
      const blocks = []; let list = []; let paragraph = []; let fence = null; let code = [];
      const flush = () => { if (paragraph.length) { blocks.push(h('p', { key: blocks.length }, inlineMarkdown(paragraph.join('\n')))); paragraph = []; } if (list.length) { blocks.push(h('ul', { key: blocks.length }, list.map((line, i) => h('li', { key: i }, inlineMarkdown(line))))); list = []; } };
      const flushCode = () => { blocks.push(h('pre', { key: blocks.length }, h('code', null, code.join('\n')))); code = []; };
      for (const line of String(text).split('\n')) {
        if (fence) { if (new RegExp('^\\s*' + fence[0] + '{' + fence.length + ',}\\s*$').test(line)) { flushCode(); fence = null; } else code.push(line); continue; }
        const start = line.match(/^\s*(`{3,}|~{3,})/);
        if (start) { flush(); fence = start[1]; continue; }
        const heading = line.match(/^(#{1,6})\s+(.+)$/);
        const item = line.match(/^\s*(?:[-*]|\d+[.)])\s+(.+)$/);
        if (heading) { flush(); blocks.push(h('h' + Math.min(heading[1].length + 2, 6), { key: blocks.length }, inlineMarkdown(heading[2]))); }
        else if (!line.trim()) flush();
        else if (item) { if (paragraph.length) flush(); list.push(item[1]); }
        else { if (list.length) flush(); paragraph.push(line); }
      }
      if (fence) flushCode(); flush();
      return h('div', { className: 'ad-markdown' }, blocks);
    }
    function selectMessages(messages, speaker, query, summariesOnly, round = 'all') {
      const needle = query.trim().toLocaleLowerCase();
      return messages.filter(m => (speaker === 'all' || m.speaker === speaker)
        && (round === 'all' || String(m.round ?? 0) === String(round))
        && (!summariesOnly || (m.speaker === 'dsh' && m.round === 4))
        && (!needle || String(m.text || '').toLocaleLowerCase().includes(needle)));
    }
    // Local catalog: the server owns round prompts; these are localized briefs and stage labels.
    const TEMPLATES = {
      progress: ['progressPrompt', 'progressOne', 'progressTwo', 'progressFinal'],
      requirements: ['requirementsPrompt', 'requirementsOne', 'requirementsTwo', 'requirementsFinal'],
      review: ['reviewPrompt', 'reviewOne', 'reviewTwo', 'reviewFinal'],
      code: ['codePrompt', 'codeOne', 'codeTwo', 'codeFinal'],
    };
    const timestamp = value => typeof value === 'number' ? value : Date.parse(value);
    function elapsedMs(call, now) {
      if (Number.isFinite(call?.durationMs) && call.durationMs >= 0) return call.durationMs;
      const start = timestamp(call?.startedAt), end = call?.finishedAt ? timestamp(call.finishedAt) : now;
      return Number.isFinite(start) && Number.isFinite(end) ? Math.max(0, end - start) : null;
    }
    const formatElapsed = ms => ms === null ? '-' : (ms / 1000).toFixed(1) + 's';
    function usageText(usage) {
      if (!usage || typeof usage !== 'object') return '-';
      const entries = Object.entries(usage).filter(([, value]) => value !== null && value !== undefined);
      return entries.length ? entries.map(([key, value]) => key + ': ' + (typeof value === 'object' ? JSON.stringify(value) : String(value))).join(' · ') : '-';
    }
    function actionsMarkdown(actions, labels) {
      const cell = value => String(value ?? '-').replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ');
      return '| ' + labels.map(cell).join(' | ') + ' |\n|' + labels.map(() => ' --- ').join('|') + '|\n' + actions.map(item => '| ' + [item.task, item.owner, item.priority, item.acceptance, (item.evidence || []).join(', ')].map(cell).join(' | ') + ' |').join('\n');
    }
    const DOCUMENT_ACCEPT = '.pdf,.txt,.md,.markdown,.csv,.json,.jsonl,.yaml,.yml,.xml,.html,.css,.js,.jsx,.ts,.tsx,.py,.c,.h,.cpp,.hpp,.rs,.go,.java,.sh,.bash,.sql,.toml,.ini,.log,text/*,application/pdf';
    function documentMediaType(file) {
      if (/\.pdf$/i.test(file.name) || file.type === 'application/pdf') return 'application/pdf';
      if (file.type?.startsWith('text/') || /\.(?:txt|md|markdown|csv|jsonl?|ya?ml|xml|html|css|[cm]?jsx?|tsx?|py|[ch]|[ch]pp|rs|go|java|sh|bash|sql|toml|ini|log)$/i.test(file.name)) return file.type || 'text/plain';
      return null;
    }
    function documentError(files, currentCount) {
      if (files.length + currentCount > 8) return 'fileLimit';
      for (const file of files) {
        const type = documentMediaType(file);
        if (!type) return 'fileUnsupported';
        if (file.size > (type === 'application/pdf' ? 10 : 1) * 1024 * 1024) return 'fileTooLarge';
      }
      return null;
    }
    function ChatIcon({ size = 24 }) { return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, 'aria-hidden': true }, h('path', { d: 'M4 4h12v9H8l-4 3V4Z' }), h('path', { d: 'M16 8h4v12l-4-3h-6v-4' })); }
    // Browser export helpers mirrored from document-export.js; native loader cannot import ESM.
    const encoder = new TextEncoder();
    const xml = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    const crc32 = bytes => {
      let crc = 0xffffffff;
      for (const byte of bytes) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
      return (crc ^ 0xffffffff) >>> 0;
    };
    const u16 = value => [value & 255, (value >>> 8) & 255];
    const u32 = value => [...u16(value & 0xffff), ...u16(value >>> 16)];
    const concat = parts => {
      const length = parts.reduce((sum, part) => sum + part.length, 0);
      const out = new Uint8Array(length);
      let offset = 0;
      for (const part of parts) { out.set(part, offset); offset += part.length; }
      return out;
    };
    function zipStore(entries) {
      const local = [], central = [];
      let offset = 0;
      for (const [name, content] of entries) {
        const filename = encoder.encode(name), data = encoder.encode(content), crc = crc32(data);
        const header = new Uint8Array([...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(filename.length), ...u16(0)]);
        local.push(header, filename, data);
        central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(filename.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]), filename);
        offset += header.length + filename.length + data.length;
      }
      const centralBytes = concat(central);
      return concat([...local, centralBytes, new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(entries.length), ...u16(entries.length), ...u32(centralBytes.length), ...u32(offset), ...u16(0)])]);
    }
    
    function docxBytes(title, paragraphs = []) {
      if (!Array.isArray(paragraphs)) throw new TypeError('paragraphs must be an array');
      const body = [`<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t xml:space="preserve">${xml(title)}</w:t></w:r></w:p>`, ...paragraphs.map(value => `<w:p><w:r><w:t xml:space="preserve">${xml(value)}</w:t></w:r></w:p>`)].join('');
      return zipStore([
        ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'],
        ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
        ['word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`],
        ['word/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style></w:styles>'],
      ]);
    }
    
    function printHtml(title, paragraphs = []) {
      if (!Array.isArray(paragraphs)) throw new TypeError('paragraphs must be an array');
      return `<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${xml(title)}</title><style>body{font:16px/1.65 system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 24px;color:#202124}h1{font-size:24px;border-bottom:1px solid #bbb;padding-bottom:12px}p{white-space:pre-wrap;overflow-wrap:anywhere}@media print{body{max-width:none;margin:0;padding:0}h1{break-after:avoid}p{orphans:3;widows:3}}</style></head><body><h1>${xml(title)}</h1>${paragraphs.map(value => `<p>${xml(value)}</p>`).join('')}</body></html>`;
    }
    // End mirrored browser export helpers.
    const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
    const MAX_IMAGES = 4;
    const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
    function readImageFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = String(reader.result || '');
          const comma = dataUrl.indexOf(',');
          if (comma < 0) return reject(new Error('Invalid image'));
          resolve({ id: globalThis.crypto?.randomUUID?.() || String(Date.now()) + Math.random(), name: file.name || 'pasted-image', mediaType: file.type, size: file.size, data: dataUrl.slice(comma + 1), dataUrl });
        };
        reader.onerror = () => reject(new Error('Cannot read image'));
        reader.readAsDataURL(file);
      });
    }
    function asAttachments(images) { return images.map(({ mediaType, data, name }) => ({ type: 'image', mediaType, data, name })); }

    const cardMotion = {
      onPointerMove(event) {
        if (event.pointerType!=='mouse' || !window.matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)').matches) return;
        const card=event.currentTarget, rect=card.getBoundingClientRect();
        const x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)), y=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
        card.dataset.lit='true';
        card.style.setProperty('--ad-light-x',`${x*100}%`);card.style.setProperty('--ad-light-y',`${y*100}%`);
        if(card.classList.contains('ad-member')){card.style.setProperty('--ad-tilt-x',`${(0.5-y)*4}deg`);card.style.setProperty('--ad-tilt-y',`${(x-0.5)*4}deg`);}
      },
      onPointerLeave(event) { event.currentTarget.dataset.lit='false'; },
      onPointerCancel(event) { event.currentTarget.dataset.lit='false'; },
    };
    function Room({ ctx, sessionId, onChrome }) {
      React.useSyncExternalStore(
        React.useCallback(fn => ctx.locale.subscribe(fn), [ctx]),
        React.useCallback(() => ctx.locale.getSnapshot(), [ctx]),
      );
      const t = React.useMemo(() => ctx.locale.bind(NS), [ctx]);
      const [open, setOpen] = React.useState(true);
      const [room, setRoom] = React.useState(null);
      const [error, setError] = React.useState('');
      // A failed action must stay readable: the 2 s snapshot poll below clears read errors only,
      // otherwise "Invalid discussion template" would flash and vanish before anyone reads it.
      const stickyError = React.useRef(false);
      const clearError = React.useCallback(() => { stickyError.current = false; setError(''); }, []);
      const reportError = React.useCallback((message, sticky = false) => { stickyError.current = sticky; setError(String(message || t('failed'))); }, [t]);
      const [busy, setBusy] = React.useState(false);
      const [question, setQuestion] = React.useState('');
      const [selectedTemplate, setSelectedTemplate] = React.useState('review');
      const [roundFilter, setRoundFilter] = React.useState('all');
      const [comparisonBranches, setComparisonBranches] = React.useState([]);
      const [now, setNow] = React.useState(Date.now);
      const [files, setFiles] = React.useState([]);
      const [sendFiles, setSendFiles] = React.useState([]);
      const [readingFiles, setReadingFiles] = React.useState(false);
      const fileReadActive = React.useRef(false);
      const [jumpMessageId, setJumpMessageId] = React.useState(null);
      const messageRefs = React.useRef(new Map());
      const [materials, setMaterials] = React.useState('');
      const [text, setText] = React.useState('');
      const [target, setTarget] = React.useState('all');
      const [consent, setConsent] = React.useState(false);
      const [access, setAccess] = React.useState('workspace');
      const [search, setSearch] = React.useState('');
      const [speakerFilter, setSpeakerFilter] = React.useState('all');
      const [summariesOnly, setSummariesOnly] = React.useState(false);
      const [following, setFollowing] = React.useState(true);
      const historyRef = React.useRef(null);
      const [images, setImages] = React.useState([]);
      const [sendImages, setSendImages] = React.useState([]);
      const active = React.useRef(false);
      const mutating = React.useRef(false);
      const requests = React.useRef(new Set());
      const getRequest = React.useRef(null);
      const version = React.useRef(0);
      const restoredMode = React.useRef(null);
      const request = React.useCallback(async (payload, attachments = []) => {
        const read = payload.action === 'get';
        if (!active.current || (read && (getRequest.current || mutating.current))) return false;
        if (!read && mutating.current) return false;
        if (!read) {
          mutating.current = true;
          stickyError.current = false;
          setBusy(true);
          ++version.current;
          if (getRequest.current) getRequest.current.abort();
        }
        const epoch = version.current;
        const controller = new AbortController();
        requests.current.add(controller);
        if (read) getRequest.current = controller;
        try {
          // Reads use a local snapshot route so polling never appends command events to the conversation.
          let snapshot;
          if (read) {
            const response = await fetch('/local-discussion/state?session=' + encodeURIComponent(sessionId), { signal: controller.signal, headers: { accept: 'application/json' }, cache: 'no-store' });
            if (response.status === 404) snapshot = { status: 'idle', phase: '', messages: [], pending: [], images: [], sources: [], consent: false, access: 'discussion', question: '', materials: '', branchId: 'main', branches: [{ id: 'main', label: 'main', messageCount: 0 }], activeCalls: [] };
            else {
              if (!response.ok) throw new Error(t('failed'));
              try { snapshot = await response.json(); } catch { throw new Error(t('invalid')); }
            }
          } else {
            const scope = ctx.sessions.scope(sessionId);
            if (!scope) throw new Error(t('missing'));
            // Agent identity is injected by the session scope. RemoteResult wraps CommandExecution.
            const response = await scope.remote.commands.execute('/discuss ' + JSON.stringify(payload), attachments, controller.signal);
            if (controller.signal.aborted || !active.current || epoch !== version.current) return false;
            if (!response.ok) throw new Error(response.error.message || response.error.code || t('failed'));
            const execution = response.value;
            if (!execution) throw new Error(t('unhandled'));
            if (execution.result.kind === 'error') throw new Error(execution.result.text || t('failed'));
            try { snapshot = JSON.parse(execution.result.text); } catch { throw new Error(t('invalid')); }
          }
          if (!snapshot || !['idle', 'running', 'stopping', 'completed', 'interrupted'].includes(snapshot.status)
            || !Array.isArray(snapshot.messages) || !Array.isArray(snapshot.pending)
            || snapshot.messages.some(m => !m || typeof m.text !== 'string')
            || snapshot.pending.some(m => !m || typeof m.text !== 'string')) throw new Error(t('invalid'));
          // Restore saved mode once per room/branch change; polling preserves local draft choices.
          const modeKey = JSON.stringify([snapshot.branchId, snapshot.access, Boolean(snapshot.messages.length)]);
          if (modeKey !== restoredMode.current) {
            restoredMode.current = modeKey;
            if (snapshot.messages.length && ['discussion', 'workspace'].includes(snapshot.access)) {
              setAccess(snapshot.access);
              setConsent(false);
            }
          }
          setRoom(snapshot);
          if (!stickyError.current) setError('');
          return true;
        } catch (failure) {
          if (active.current && !controller.signal.aborted && epoch === version.current) reportError(failure.message, !read);
          return false;
        } finally {
          requests.current.delete(controller);
          if (getRequest.current === controller) getRequest.current = null;
          if (!read) {
            mutating.current = false;
            if (active.current) setBusy(false);
          }
        }
      }, [ctx, sessionId, t, reportError]);
      React.useEffect(() => {
        active.current = true;
        return () => {
          active.current = false;
          ++version.current;
          for (const controller of requests.current) controller.abort();
          requests.current.clear();
        };
      }, []);
      const status = room ? room.status : null;
      const running = status === 'running' || status === 'stopping';
      const activeCalls = Array.isArray(room?.activeCalls) ? room.activeCalls : [];
      React.useEffect(() => {
        if (!open) return;
        void request({ action: 'get' });
        // Room snapshots include live text. Never poll Agent status or invent text deltas.
        const timer = setInterval(() => { void request({ action: 'get' }); }, running ? 500 : 2000);
        return () => {
          clearInterval(timer);
          if (getRequest.current) getRequest.current.abort();
        };
      }, [open, running, request]);
      React.useEffect(() => {
        if (!open || !activeCalls.length) return;
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
      }, [open, activeCalls.length > 0]);
      const speakerName = speaker => ({ user: t('user'), system: t('system'), dsh: 'DSH', claude: 'Claude', codex: 'Codex', all: t('all') })[speaker] || String(speaker || '');
      const button = (label, action, disabled, extra) => h('button', { type: 'button', disabled, onClick: action, ...extra }, label);
      const messages = room?.messages || [];
      const visibleMessages = selectMessages(messages, speakerFilter, search, summariesOnly, roundFilter);
      const clearFilters = () => { setSearch(''); setSpeakerFilter('all'); setSummariesOnly(false); setRoundFilter('all'); };
      const jumpToLatest = () => { const node = historyRef.current; if (node) node.scrollTop = node.scrollHeight; setFollowing(true); };
      React.useEffect(() => { if (following && open) { const node = historyRef.current; if (node) node.scrollTop = node.scrollHeight; } }, [messages, search, speakerFilter, summariesOnly, roundFilter, following, open]);
      const jumpToMessage = id => { clearFilters(); setFollowing(false); setJumpMessageId(id); };
      React.useEffect(() => {
        if (!jumpMessageId || !open) return;
        const node = messageRefs.current.get(jumpMessageId);
        if (node) { node.scrollIntoView({ block: 'center' }); node.focus({ preventScroll: true }); setJumpMessageId(null); }
      }, [jumpMessageId, visibleMessages, open]);
      // The room already recorded consent when it started; the local checkbox only gates a mode change.
      // The status chip lives in the page header, so the room reports its state upward.
      React.useEffect(() => {
        onChrome?.({ status, open, error: room?.error, toggle: () => setOpen(value => !value), access, accessLocked: running || busy, chooseAccess: value => { setAccess(value); setConsent(false); } });
      }, [onChrome, status, open, room?.error, access, running, busy]);
      const allowSend = Boolean(room?.consent && !busy && !readingFiles && status !== 'stopping' && (access === (room?.access || 'discussion') || consent));
      const canSend = Boolean(allowSend && text.trim() && text.length <= 12000);
      const payloadFiles = list => list.map(({ name, mediaType, data }) => ({ name, mediaType, data }));
      const sendMessage = async () => { if (canSend && await request({ action: 'send', text: text.trim(), target, access, consent: true, files: payloadFiles(sendFiles) }, asAttachments(sendImages))) { setText(''); setSendImages([]); setSendFiles([]); } };
      const [copiedId, setCopiedId] = React.useState(null);
      const copyMessage = async m => { try { await navigator.clipboard.writeText(m.text); setCopiedId(m.id); } catch { reportError(t('copyFailed'), true); } };
      const downloadMarkdown = (body, name = 'ai-discussion') => {
        const url = URL.createObjectURL(new Blob([body], { type: 'text/markdown;charset=utf-8' }));
        const link = document.createElement('a'); link.href = url; link.download = name + '-' + new Date().toISOString().slice(0, 10) + '.md'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
      const exportMarkdown = () => downloadMarkdown('# ' + t('title') + '\n\n' + (room?.question || '') + '\n\n' + messages.map(m => '## ' + speakerName(m.speaker) + (m.round ? ' · ' + t('round') + ' ' + m.round : '') + '\n\n' + m.text).join('\n\n'));
      const exportParagraphs = () => [room?.question || '', ...messages.flatMap(message => [speakerName(message.speaker) + ' · ' + t('round') + ' ' + (message.round ?? 0), message.text])];
      const exportDocx = () => {
        const url = URL.createObjectURL(new Blob([docxBytes(t('title'), exportParagraphs())], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
        const link = document.createElement('a'); link.href = url; link.download = 'ai-discussion-' + new Date().toISOString().slice(0, 10) + '.docx'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
      const exportPdf = () => {
        // The desktop shell answers every window.open with {action:'deny'}, so a popup can never open.
        // Print this document instead: fill a print-only node and let the @media print rules hide the app.
        const root = document.createElement('div');
        root.className = 'ad-print-root';
        // printHtml escapes every value; parsing it back keeps that escaping without a second escaper.
        root.append(...new DOMParser().parseFromString(printHtml(t('title'), exportParagraphs()), 'text/html').body.childNodes);
        root.setAttribute('lang', ctx.locale.getLocale().active);
        document.body.appendChild(root);
        document.documentElement.classList.add('ad-printing');
        const done = () => { document.documentElement.classList.remove('ad-printing'); root.remove(); window.removeEventListener('afterprint', done); };
        window.addEventListener('afterprint', done);
        try { window.print(); } catch { done(); reportError(t('printFailed'), true); return; }
        // afterprint does not always fire in a desktop shell; drop the print-only state anyway.
        setTimeout(done, 300000);
      };
      const addImages = async (files, current, setter) => {
        const accepted = [...files].filter(file => IMAGE_TYPES.has(file.type));
        if (!accepted.length) return;
        if (current.length + accepted.length > MAX_IMAGES) { reportError(t('imageLimit'), true); return; }
        if (accepted.some(file => file.size > MAX_IMAGE_BYTES)) { reportError(t('imageTooLarge'), true); return; }
        if ([...current, ...accepted].reduce((total, item) => total + (item.size || 0), 0) > 12 * 1024 * 1024) { reportError(t('imageTotal'), true); return; }
        try { setter([...current, ...await Promise.all(accepted.map(readImageFile))]); clearError(); }
        catch { reportError(t('failed'), true); }
      };
      const pasteImages = (current, setter) => event => {
        const files = [...(event.clipboardData?.items || [])].filter(item => item.kind === 'file' && IMAGE_TYPES.has(item.type)).map(item => item.getAsFile()).filter(Boolean);
        if (files.length) { event.preventDefault(); void addImages(files, current, setter); }
      };
      const imageTray = (list, setter) => list.length ? h('div', { className: 'ad-image-tray' }, list.map(image => h('div', { className: 'ad-image-item', key: image.id },
        h('img', { src: image.dataUrl, alt: image.name }),
        h('button', { type: 'button', className: 'ad-image-remove', 'aria-label': t('removeImage'), onClick: () => setter(previous => previous.filter(item => item.id !== image.id)) }, '×')))) : null;

      const addFiles = async (incoming, current, setter) => {
        if (fileReadActive.current) return;
        const selected = [...incoming];
        const problem = documentError(selected, current.length);
        if (problem) { reportError(t(problem), true); return; }
        fileReadActive.current = true; setReadingFiles(true);
        try {
          const loaded = await Promise.all(selected.map(async file => ({ ...await readImageFile(file), mediaType: documentMediaType(file) })));
          if (active.current) { setter(previous => [...previous, ...loaded]); clearError(); }
        } catch { if (active.current) reportError(t('failed'), true); }
        finally { fileReadActive.current = false; if (active.current) setReadingFiles(false); }
      };
      // One picker: images and documents split by type, hints live in the button tooltip.
      const attachPicker = (images, setImages, files, setFiles, disabled) => h('div', { className: 'ad-file-picker' },
        h('label', { className: 'ad-attach', title: t('attachHint') }, t('addAttach'),
          h('input', { type: 'file', multiple: true, accept: 'image/png,image/jpeg,image/webp,image/gif,' + DOCUMENT_ACCEPT, disabled: disabled || readingFiles, onChange: event => {
            const incoming = [...event.target.files]; event.target.value = '';
            const pictures = incoming.filter(file => /^image\//.test(file.type) || /\.(png|jpe?g|webp|gif)$/i.test(file.name));
            const documents = incoming.filter(file => !pictures.includes(file));
            if (pictures.length) void addImages(pictures, images, setImages);
            if (documents.length) void addFiles(documents, files, setFiles);
          } })),
        files.length > 0 && h('div', { className: 'ad-file-list' }, files.map(file => h('div', { className: 'ad-file', key: file.id }, h('span', null, file.name + ' · ' + (file.size / 1024).toFixed(0) + ' KiB'), button('×', () => setFiles(previous => previous.filter(item => item.id !== file.id)), disabled, { className: 'ad-btn ad-quiet', 'aria-label': t('removeFile') + ': ' + file.name })))));
      const callState = call => h('span', { className: 'ad-call-state' }, t(['thinking', 'responding', 'tool'].includes(call.state) ? call.state : 'thinking'), ' · ', t('elapsed'), ' ', formatElapsed(elapsedMs(call, now)));
      const member = name => {
        const cap = room?.capabilities?.[name];
        const last = [...messages].reverse().find(m => m.speaker === name);
        const failed = last?.status === 'error';
        const interrupted = last?.status === 'interrupted';
        const live = activeCalls.find(call => call.speaker === name);
        const state = live ? 'running' : failed ? 'error' : interrupted ? 'unknown' : last ? 'success' : 'unknown';
        const label = live ? callState(live) : failed ? t('callFailed') : interrupted ? t('interrupted') : last ? t('replied') : cap?.available === false ? t('unavailable') : name === 'dsh' || cap?.available ? t('ready') : t('unknown');
        return h('div', { key: name, className: 'ad-member', ...cardMotion, 'data-speaker': name, title: cap?.reason || '' },
          h('div', { className: 'ad-avatar', 'aria-hidden': true }, name === 'dsh' ? 'D' : name === 'claude' ? 'C' : 'CX'),
          h('div', { className: 'ad-member-info' }, h('div', { className: 'ad-member-name' }, speakerName(name)),
            h('div', { className: 'ad-member-role' }, last?.model || cap?.model || t(name === 'dsh' ? 'hostRole' : 'agentRole')),
            h('div', { className: 'ad-member-state', 'data-state': state }, h('span', { className: 'ad-dot' }), label)));
      };
      const phaseName = round => {
        const id = room?.templateId || selectedTemplate;
        const template = TEMPLATES[({ architecture: 'review', risk: 'review' }[id] || id)];
        return template && [1, 2, 4].includes(round) ? t(template[round === 4 ? 3 : round]) : round === 1 ? t('roundOne') : round === 2 ? t('roundTwo') : round === 4 ? t('summary') : round === 3 ? t('followup') : t('brief');
      };
      const branches = room?.branches?.length ? room.branches : [{ id: 'main', label: 'main', messageCount: messages.length }];
      const idleAction = Boolean(room && !busy && !running);
      const evidenceButtons = ids => h('div', { className: 'ad-evidence' }, (Array.isArray(ids) ? ids : []).map((id, index) => {
        const found = messages.find(message => message.id === id);
        return button(t('evidence') + ' ' + (found ? messages.indexOf(found) + 1 : id), () => jumpToMessage(id), !found, { key: String(id) + index, className: 'ad-btn ad-quiet', title: found ? speakerName(found.speaker) + ': ' + found.text.slice(0, 100) : t('sourceMissing') });
      }));
      const decision = room?.decision;
      const actionItems = Array.isArray(decision?.actions) ? decision.actions : [];
      const actionLabels = [t('task'), t('owner'), t('priority'), t('acceptance'), t('evidence')];
      const actionMarkdown = () => '# ' + t('actions') + '\n\n' + actionsMarkdown(actionItems, actionLabels);
      const copyActions = async () => { try { await navigator.clipboard.writeText(actionMarkdown()); setCopiedId('actions'); } catch { reportError(t('copyFailed'), true); } };
      const branchesPanel = h('details', { className: 'ad-extra' }, h('summary', null, t('branches'), ' · ', branches.find(branch => branch.id === (room?.branchId || 'main'))?.label || room?.branchId || 'main'),
        h('p', { className: 'ad-section-hint' }, t('branchHint')),
        h('label', { className: 'ad-branch-tools' }, t('currentBranch'), h('select', { 'aria-label': t('currentBranch'), value: room?.branchId || 'main', disabled: !idleAction, onChange: async event => { if (await request({ action: 'switchBranch', branchId: event.target.value })) { clearFilters(); setFollowing(true); } } }, branches.map(branch => h('option', { key: branch.id, value: branch.id }, branch.label + ' (' + (branch.messageCount ?? '-') + ')')))),
        h('div', { className: 'ad-branch-tools' }, branches.map(branch => h('label', { key: branch.id, className: 'ad-branch-choice' }, h('input', { type: 'checkbox', checked: comparisonBranches.includes(branch.id), disabled: !idleAction || (!comparisonBranches.includes(branch.id) && comparisonBranches.length >= 2), onChange: event => setComparisonBranches(previous => event.target.checked ? [...previous, branch.id] : previous.filter(id => id !== branch.id)) }), branch.label)),
          button(t('compareBranches'), () => { void request({ action: 'compare', branchIds: comparisonBranches, consent: true }); }, !idleAction || !consent || comparisonBranches.length !== 2 || comparisonBranches.some(id => !branches.some(branch => branch.id === id)), { className: 'ad-btn', title: t('selectTwo') })));
      const decisionPanel = h('details', { className: 'ad-extra' }, h('summary', null, t('ledger')),
        room?.decisionStale && h('p', { className: 'ad-warning' }, t('decisionStale')),
        !decision ? h('p', { className: 'ad-muted' }, t('noDecision')) : h(React.Fragment, null,
          h('div', { className: 'ad-ledger' }, ['consensus', 'disagreements', 'unknowns'].map(kind => h('section', { key: kind, className: 'ad-ledger-column', 'aria-label': t(kind) }, h('h3', null, t(kind)),
            !(decision[kind]?.length) && h('p', { className: 'ad-muted' }, '-'), (Array.isArray(decision[kind]) ? decision[kind] : []).map((item, index) => h('div', { className: 'ad-ledger-item', key: index }, h('p', null, item.text),
              (Array.isArray(item.reasons) ? item.reasons : []).map((reason, i) => h('p', { key: i, className: 'ad-muted' }, speakerName(reason.speaker), ': ', reason.reason)), evidenceButtons(item.evidence)))))),
          h('h3', { className: 'ad-section-title', style: { marginTop: 18 } }, t('actions')),
          actionItems.length ? h(React.Fragment, null, h('div', { className: 'ad-table-wrap' }, h('table', { className: 'ad-table' }, h('thead', null, h('tr', null, actionLabels.map(label => h('th', { key: label, scope: 'col' }, label)))), h('tbody', null, actionItems.map((item, index) => h('tr', { key: index }, [item.task, item.owner, item.priority, item.acceptance].map((value, i) => h('td', { key: i }, value ?? '-')), h('td', null, evidenceButtons(item.evidence))))))),
            h('div', { className: 'ad-branch-tools' }, button(copiedId === 'actions' ? t('copied') : t('copyActions'), () => { void copyActions(); }, false, { className: 'ad-btn' }), button(t('exportActions'), () => downloadMarkdown(actionMarkdown(), 'discussion-actions'), false, { className: 'ad-btn' }))) : h('p', { className: 'ad-muted' }, '-'),
          (Array.isArray(decision.warnings) ? decision.warnings : []).map((warning, index) => h('div', { className: 'ad-warning', key: index }, h('strong', null, t('warning')), h('p', null, warning.text), evidenceButtons([warning.messageId]))),
          decision.followups?.length > 0 && h('h3', { className: 'ad-section-title', style: { marginTop: 16 } }, t('followups')),
          (Array.isArray(decision.followups) ? decision.followups : []).map((followup, index) => h('div', { className: 'ad-followup', key: index }, h('span', null, followup),
            button(t('prefill'), () => { setText(String(followup).slice(0, 12000)); }, busy, { className: 'ad-btn ad-quiet' }),
            button(t('send'), () => { if (allowSend) void request({ action: 'send', text: String(followup), target: 'all', access, consent: true }); }, !allowSend || !String(followup).trim() || String(followup).length > 12000, { className: 'ad-btn' })))));
      const statsPanel = h('details', { className: 'ad-extra' }, h('summary', null, t('stats')),
        h('div', { className: 'ad-table-wrap' }, h('table', { className: 'ad-table' }, h('thead', null, h('tr', null, [t('filterSpeaker'), t('round'), t('model'), t('elapsed'), t('usage')].map(label => h('th', { key: label, scope: 'col' }, label)))),
          h('tbody', null, messages.filter(message => !['user', 'system'].includes(message.speaker)).map((message, index) => h('tr', { key: message.id || index }, h('td', null, speakerName(message.speaker)), h('td', null, message.round ?? '-'), h('td', null, message.model || '-'), h('td', null, formatElapsed(elapsedMs(message, message.status === 'streaming' ? now : timestamp(message.finishedAt)))), h('td', { className: 'ad-stats-usage' }, usageText(message.usage))))))));
      const renderMessage = m => h('article', { className: 'ad-msg', tabIndex: -1, ref: node => { if (node) messageRefs.current.set(m.id, node); else messageRefs.current.delete(m.id); }, 'data-speaker': m.speaker, 'data-summary': m.speaker === 'dsh' && m.round === 4, 'data-error': m.status === 'error' || m.status === 'interrupted' },
        h('div', { className: 'ad-msg-head' }, h('span', { className: 'ad-avatar', 'aria-hidden': true }, m.speaker === 'user' ? 'U' : m.speaker === 'codex' ? 'CX' : speakerName(m.speaker).slice(0, 1)),
          h('strong', null, speakerName(m.speaker), m.speaker === 'dsh' && m.round === 4 ? ' · ' + t('summary') : ''),
          h('span', { className: 'ad-msg-meta' }, [m.model, m.status === 'error' ? t('callFailed') : m.status === 'interrupted' ? t('interrupted') : '', m.time ? new Date(m.time).toLocaleTimeString(ctx.locale.getLocale().active, { hour: '2-digit', minute: '2-digit' }) : ''].filter(Boolean).join(' · ')),
          m.status === 'streaming' && callState(m)),
        h(Markdown, { text: m.text }),
        m.error && h('p', { className: 'ad-warning', role: 'note' }, m.error),
        m.images?.length ? h('div', null, m.images.map((image, index) => h('span', { className: 'ad-image-chip', key: image.attachmentId || index }, t('image') + ' ' + (index + 1) + (image.name ? ' · ' + image.name : '')))) : null,
        m.files?.length ? h('div', { className: 'ad-file-list' }, m.files.map((file, index) => h('div', { className: 'ad-file', key: file.id || index }, h('span', null,
          t('source') + ': ' + (file.name || file.source || '-') + (file.source && file.source !== file.name ? ' · ' + file.source : ''),
          Number.isFinite(file.characters ?? file.characterCount ?? file.extractedCharacters) ? ' · ' + (file.characters ?? file.characterCount ?? file.extractedCharacters) + ' ' + t('extracted') : '', file.truncated ? ' · ' + t('truncated') : '')))) : null,
        !['user', 'system'].includes(m.speaker) && h('div', { className: 'ad-metadata' }, t('elapsed'), ': ', formatElapsed(elapsedMs(m, m.status === 'streaming' ? now : timestamp(m.finishedAt))), ' · ', t('usage'), ': ', usageText(m.usage)),
        h('div', { className: 'ad-msg-controls' }, button(copiedId === m.id ? t('copied') : t('copy'), () => { void copyMessage(m); }, false, { className: 'ad-btn ad-quiet', 'aria-label': t('copy') }),
          ['error', 'interrupted'].includes(m.status) && button(t('retry'), () => { void request({ action: 'retry', messageId: m.id, consent: true }); }, !idleAction || !consent, { className: 'ad-btn' }),
          button(t('branch'), async () => { if (await request({ action: 'branch', messageId: m.id, consent: true })) { clearFilters(); setFollowing(true); } }, !idleAction || !consent, { className: 'ad-btn ad-quiet' })));
      const setupContent = h(React.Fragment, null,
        h('p', { className: 'ad-section-hint' }, t('setupHint')),
        h('div', { className: 'ad-templates' }, h('span', { className: 'ad-field-label' }, t('templates')),
          h('div', { className: 'ad-template-options' }, Object.keys(TEMPLATES).map((name, i) => button(h(React.Fragment, null, h('span', { className: 'ad-template-icon', 'aria-hidden': true }, ['◷', '✓', '◎', '⌥'][i]), h('span', { className: 'ad-template-copy' }, h('strong', null, t(name + 'Template')), h('small', null, t(name + 'Hint')))), () => {
            setQuestion(previous => !previous.trim() || Object.values(TEMPLATES).some(keys => previous === t(keys[0])) ? t(TEMPLATES[name][0]) : previous);
            setSelectedTemplate(name);
          }, running || busy, { key: name, className: 'ad-template', title: t(name + 'Hint'), 'aria-pressed': selectedTemplate===name }))),
          h('p', { className: 'ad-round-plan' }, TEMPLATES[selectedTemplate].slice(1).map(key => t(key)).join(' → ')),
          selectedTemplate === 'progress' && h('p', { className: 'ad-section-hint ad-progress-hint' }, t('progressSourceHint'))),
        h('label', null, t('question'), h('textarea', { className: 'ad-question', value: question, placeholder: t('questionPlaceholder'), onChange: e => setQuestion(e.target.value), onPaste: pasteImages(images, setImages), disabled: running || busy, rows: 5, maxLength: 12000 }), imageTray(images, setImages)), attachPicker(images, setImages, files, setFiles, !room || running),
        h('details', { className: 'ad-materials' }, h('summary', null, t('materials')), h('textarea', { 'aria-label': t('materials'), value: materials, placeholder: t('materialsPlaceholder'), onChange: e => setMaterials(e.target.value), disabled: running || busy, rows: 4, maxLength: 40000 })),
        access==='workspace' && h('p', { className: 'ad-section-hint ad-mode-info', key: access }, t('workspaceHint'), room?.workspace && h('code', { style: { display: 'block', overflowWrap: 'anywhere', marginTop: 6 } }, room.workspace)),
        h('label', { className: 'ad-consent', 'data-checked': consent },  h('input', { type: 'checkbox', checked: consent, onChange: e => setConsent(e.target.checked) }), h('span', null, t('consent'), access==='workspace'?' '+t('workspaceConsent'):'')), 
        button(h(React.Fragment, null, t('start'), h('span', { className: 'ad-start-arrow', 'aria-hidden': true }, '↗')), async () => { if (await request({ action: 'start', question: question.trim(), materials, consent: true, access, templateId: selectedTemplate, files: payloadFiles(files) }, asAttachments(images))) { setImages([]); setFiles([]); clearFilters(); setFollowing(true); } }, !room || busy || readingFiles || running || !consent || !question.trim(), { className: 'ad-btn ad-primary ad-start' }),
        h('div', { className: 'ad-actions' },
          button(t('stop'), () => { void request({ action: 'stop' }); }, busy || status !== 'running', { className: 'ad-btn' }),
          button(t('summarize'), () => { void request({ action: 'summarize', access, consent: true }); }, !room || busy || running || !consent || !messages.length, { className: 'ad-btn' }),
          button(t('reset'), async () => { if (await request({ action: 'reset' })) { setQuestion(''); setSelectedTemplate('review'); setMaterials(''); setText(''); setImages([]); setSendImages([]); setFiles([]); setSendFiles([]); setComparisonBranches([]); setConsent(false); clearFilters(); setFollowing(true); } }, !room || busy || running, { className: 'ad-btn ad-quiet', title: t('resetHint') })),
        busy && h('span', { className: 'ad-busy', role: 'status' }, t('working')));
      return h('section', { className: 'ad-room', 'data-running': running, 'aria-label': t('title') },
        open && h(React.Fragment, null,
          h('div', { className: 'ad-members' }, member('dsh'), member('claude'), member('codex')),
          h('ol', { className: 'ad-stages', 'aria-label': t('phaseProgress') }, [1, 2, 4].map((round, index) => {
            const stageMessages = messages.filter(m => m.round === round);
            const reached = stageMessages.length > 0;
            const failed = stageMessages.some(m => m.status === 'error');
            const interrupted = stageMessages.some(m => m.status === 'interrupted');
            const current = running && (activeCalls.length ? activeCalls.some(call => call.round === round) : round === 1 ? /第 1 轮/.test(room?.phase) : round === 2 ? /第 2 轮/.test(room?.phase) : /汇总/.test(room?.phase));
            return h('li', { key: round, 'data-reached': reached, 'data-error': failed, 'aria-current': current ? 'step' : undefined }, h('span', { className: 'ad-stage-number' }, String(index + 1).padStart(2, '0')), h('span', null, phaseName(round)), failed && h('span', { className: 'ad-stage-warning', title: t('callFailed'), 'aria-label': t('callFailed') }, '!'), !failed && interrupted && h('span', { className: 'ad-stage-check', title: t('interrupted'), 'aria-label': t('interrupted') }, 'Ⅱ'), current && h('span', { className: 'ad-stage-check', 'aria-hidden': true }, '•••'));
          })),
          (error || room?.error) && h('div', { className: 'ad-error', role: 'alert' }, error || String(room.error)),
          h('div', { className: 'ad-workspace' },
            h('aside', { className: 'ad-card ad-setup', ...cardMotion },
              messages.length ? h('details', { className: 'ad-setup-details', open: true }, h('summary', null, t('setup')), room?.question && h('div', { className: 'ad-current-question' }, room.question), h('div', { className: 'ad-setup-content' }, setupContent)) : h(React.Fragment, null, h('h2', { className: 'ad-section-title' }, t('setup')), setupContent)),
            h('div', { className: 'ad-card ad-conversation', ...cardMotion },
              h('header', { className: 'ad-conversation-head' }, h('div', null, h('h2', { className: 'ad-section-title' }, t('timeline')), h('p', { className: 'ad-section-hint' }, room?.phase || t('timelineHint'))), h('div', { className: 'ad-actions', style: { marginTop: 0 } }, running && button(t('stop'), () => { void request({ action: 'stop' }); }, busy || status !== 'running', { className: 'ad-btn', 'aria-label': t('stop') }), h('details', null, h('summary', null, t('export')), h('div', { className: 'ad-branch-tools' }, button(t('export'), exportMarkdown, !messages.length, { className: 'ad-btn ad-quiet', 'aria-label': t('export') }), button(t('exportDocx'), exportDocx, !messages.length, { className: 'ad-btn ad-quiet' }), button(t('exportPdf'), exportPdf, !messages.length, { className: 'ad-btn ad-quiet' }))))),
              room && branchesPanel,
              messages.length > 0 && decisionPanel,
              messages.length > 0 && statsPanel,
              activeCalls.length > 0 && h('div', { className: 'ad-live-calls', role: 'status', 'aria-live': 'off' }, activeCalls.map(call => h('span', { key: call.id }, speakerName(call.speaker), ' · ', callState(call)))),
              messages.length > 0 && h('div', { className: 'ad-toolbar' },
                h('input', { type: 'search', className: 'ad-search', value: search, onChange: e => setSearch(e.target.value), placeholder: t('search'), 'aria-label': t('search') }),
                h('select', { value: speakerFilter, onChange: e => setSpeakerFilter(e.target.value), 'aria-label': t('filterSpeaker') }, ['all', 'user', 'dsh', 'claude', 'codex', 'system'].map(name => h('option', { key: name, value: name }, name === 'all' ? t('allMessages') : speakerName(name)))),
                h('select', { value: roundFilter, onChange: e => setRoundFilter(e.target.value), 'aria-label': t('filterRound') }, h('option', { value: 'all' }, t('allRounds')), [...new Set(messages.map(message => message.round ?? 0))].sort((a, b) => a - b).map(round => h('option', { key: round, value: String(round) }, t('round') + ' ' + round + ' · ' + phaseName(round)))),
                button(t('summaries'), () => setSummariesOnly(value => !value), false, { className: 'ad-btn ad-summary-toggle', 'aria-pressed': summariesOnly }),
                h('span', { className: 'ad-result-count', role: 'status' }, visibleMessages.length + ' / ' + messages.length + ' ' + t('messageCount'))),
              h('div', { className: 'ad-history', ref: historyRef, onScroll: event => { const node = event.currentTarget; setFollowing(node.scrollHeight - node.scrollTop - node.clientHeight < 60); }, role: 'region', 'aria-label': t('timeline'), tabIndex: 0 },
                !room || messages.length === 0 ? h('div', { className: 'ad-empty' }, h('div', { className: 'ad-empty-icon' }, h(ChatIcon, { size: 28 })), h('h3', null, !room ? t('loading') : t('emptyTitle')), h('p', null, t('emptyDescription'))) : !visibleMessages.length ? h('div', { className: 'ad-empty' }, h('h3', null, t('noResults')), h('p', null, t('noResultsHint')), button(t('clearFilters'), clearFilters, false, { className: 'ad-btn', style: { marginTop: 16 } })) : visibleMessages.map((m, i) => h(React.Fragment, { key: m.id || i },
                  (i === 0 || m.round !== visibleMessages[i - 1].round) && h('div', { className: 'ad-round' }, m.round ? String(m.round).padStart(2, '0') + ' / ' + phaseName(m.round) : phaseName(0)),
                  renderMessage(m)))), 
              messages.length > 0 && h('div', { className: 'ad-reading-bar' }, h('span', null, t(following ? 'following' : 'paused')), !following && button(t('latest') + ' ↓', jumpToLatest, false, { className: 'ad-btn ad-quiet' })),
              room?.pending.length > 0 && h('div', { className: 'ad-pending' }, room.pending.map((m, i) => h('div', { key: i }, t('pending'), ' → ', speakerName(m.target), ': ', m.text))),
              h('div', { className: 'ad-composer' }, h('div', { className: 'ad-composer-label' }, t('message')), h('textarea', { 'aria-label': t('message'), value: text, placeholder: t('messagePlaceholder'), onChange: e => setText(e.target.value), onPaste: pasteImages(sendImages, setSendImages), onKeyDown: event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !event.nativeEvent.isComposing && canSend) { event.preventDefault(); void sendMessage(); } }, maxLength: 12000, rows: 3, disabled: busy || !room?.consent || status === 'stopping' }), imageTray(sendImages, setSendImages), attachPicker(sendImages, setSendImages, sendFiles, setSendFiles, busy || !room?.consent || status === 'stopping'),
                h('div', { className: 'ad-composer-footer' }, h('select', { value: target, onChange: e => setTarget(e.target.value), 'aria-label': t('target'), disabled: busy }, ['all', 'dsh', 'claude', 'codex'].map(name => h('option', { key: name, value: name }, '@' + speakerName(name)))),
                  h('span', { className: 'ad-shortcut' }, t('shortcut')),
                  button(t('send') + ' ↑', () => { void sendMessage(); }, !canSend, { className: 'ad-btn ad-primary' })))))));
    }

    return {
      inject: ['slots', 'sessions', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'en', dictionaries.en));
        ctx.effect(() => ctx.locale.register(NS, 'zh', dictionaries.zh));
        const t = ctx.locale.bind(NS);
        // Keep the selected association across main-panel navigation, without changing DSH navigation.
        let selectedSession;
        function DiscussionPanel({ useSessions }) {
          const [chrome, setChrome] = React.useState(null);
          React.useSyncExternalStore(
            React.useCallback(fn => ctx.locale.subscribe(fn), []),
            React.useCallback(() => ctx.locale.getSnapshot(), []),
          );
          const catalog = useSessions(value => value);
          const ids = catalog.ids.filter(id => !catalog.byId[id]?.parentId);
          const [choice, setChoice] = React.useState(() => selectedSession);
          const sessionId = ids.includes(choice) ? choice : ids[0];
          const [ready, setReady] = React.useState(null);
          const [failure, setFailure] = React.useState('');
          React.useEffect(() => {
            if (!sessionId) return;
            selectedSession = sessionId;
            let live = true;
            const controller = new AbortController();
            let reference;
            setReady(null);
            setFailure('');
            try {
              reference = ctx.sessions.retain(sessionId, { source: 'controllerOperation', signal: controller.signal });
              reference.ready.then(() => { if (live) setReady(sessionId); }, error => {
                if (live) setFailure(error.message || t('failed'));
              });
            } catch (error) { setFailure(error.message || t('failed')); }
            return () => { live = false; controller.abort(); reference?.release(); };
          }, [sessionId]);
          return h('main', { className: 'ad-page' }, h('style', null, css),
            h('div', { className: 'ad-shell' },
              h('header', { className: 'ad-hero' },
                h('div', null,
                  h('div', { className: 'ad-eyebrow-row' },
                    h('div', { className: 'ad-eyebrow' }, t('eyebrow')),
                    h('p', { className: 'ad-subtitle ad-subtitle-inline' }, t('subtitle'))),
                  h('div', { className: 'ad-title-row' },
                    h('h1', null, t('title')),
                    chrome && h('button', { type: 'button', className: 'ad-pill', 'data-state': chrome.error ? 'error' : chrome.status, 'aria-expanded': chrome.open, 'aria-label': t(chrome.open ? 'collapse' : 'expand'), onClick: () => chrome.toggle() },
                      h('span', { className: 'ad-dot' }), chrome.status ? t(chrome.status) : t('loading'), chrome.open ? ' −' : ' +'),
                    chrome && h('label', { className: 'ad-access ad-access-head ad-access-title' }, h('span', { className: 'ad-sr' }, t('access')),
                      h('select', { 'aria-label': t('access'), value: chrome.access, disabled: chrome.accessLocked, onChange: event => chrome.chooseAccess(event.target.value) },
                        ['workspace', 'discussion'].map(value => h('option', { key: value, value }, t(value === 'workspace' ? 'workspaceMode' : 'discussionMode')))),
                    ))),
                h('label', { className: 'ad-session' }, t('session'), h('select', { value: sessionId || '', disabled: !ids.length, onChange: event => { selectedSession = event.target.value; setChoice(event.target.value); } },
                  !ids.length && h('option', { value: '' }, t('noSession')), ids.map(id => h('option', { key: id, value: id }, catalog.byId[id]?.displayTitle || id))))),
              failure ? h('div', { role: 'alert', className: 'ad-error' }, failure) :
                sessionId && ready === sessionId ? h(Room, { key: sessionId, ctx, sessionId, onChrome: setChrome }) : h('div', { className: 'ad-card ad-empty' }, h('div', { className: 'ad-empty-icon' }, h(ChatIcon, { size: 28 })), h('p', null, t(sessionId ? 'opening' : 'noSession')))));

        }
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: 'agent-discussion', order: 30, label: () => t('title'), locale: NS,
        }, ({ size }) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true },
          h('path', { d: 'M4 4h12v9H8l-4 3V4Z' }), h('path', { d: 'M16 8h4v12l-4-3h-6v-4' }))));
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: 'agent-discussion', id: 'agent-discussion-main', locale: NS,
        }, DiscussionPanel));
      },
    };
  },
});
