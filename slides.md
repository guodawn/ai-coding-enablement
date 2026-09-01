---
doc_type: presentation_source
status: draft
owner: platform
last_verified: 2026-09-01
---

# 从工程事实到可验证交付：docs-for-ai 与 Skill 实践

本文是演示的唯一内容源，基于 `docs-for-ai-skill-high-quality-coding.md`。

---

## 01. AI 高质量编码，不只是写出代码

### 屏幕内容

```visual
quality-system
```

> 容易出错的往往不是代码生成，而是：读到了什么、相信了什么、改了谁负责的代码，以及凭什么宣布完成。

### 讲者备注

docs-for-ai 管理工程事实，Skill 管理任务过程；二者共同把“能写”变成“可验证地交付”。

### 过渡

先明确两套机制分别解决什么问题。

### 依据

- `docs-for-ai-skill-high-quality-coding.md`：引言

---

## 02. 两套机制，各自负责一半问题

### 屏幕内容

| 机制 | 它管理什么 | 它不替代什么 |
|---|---|---|
| docs-for-ai | 事实在哪里、由谁维护、冲突时相信谁 | 代码阅读与调试 |
| Skill | 从哪里调查、何时扩大、如何验证、何时交给人 | 工程判断与产品决策 |

**目标：** 让调查处在正确责任边界内，避免用不充分证据过早关闭任务。

### 讲者备注

文档不是让 Agent 多读背景；Skill 也不是固定命令。它们共同约束信息来源、行动顺序和完成标准。

### 过渡

第一步是摆脱“代码优先就够了”的单一规则。

### 依据

- 参考文档：引言、第一章

---

## 03. 先问：这条结论属于哪一类事实？

### 屏幕内容

| 要回答的问题 | 主要事实源 |
|---|---|
| 当前后端如何运行 | source、tests、composition root |
| HTTP API 从哪里产生 | Go types 与 Huma operation |
| 对外 HTTP 快照是什么 | `backend/openapi.yaml` |
| 当前数据库结构 | sqlc schema |
| 产品希望实现什么 | accepted BRIEF 与 SPEC |
| 长期设计为何如此 | accepted ADR |
| 用户路径是否可用 | E2E、contract test、运行验收 |

### 讲者备注

“代码优先”不是完整规则。代码与 SPEC 冲突，可能是实现缺陷；OpenAPI 与 operation 冲突，更可能是生成链问题。

### 过渡

事实有 owner，冲突也必须回到 owner 解决。

### 依据

- 参考文档：一、1

---

## 04. 修正 owner，而不是同步所有副本

### 屏幕内容

```text
确定事实类型 → 找到 owner → 修正 owner + 直接派生物
                                  ↓
                   易复发漂移：补 test / generator / CI gate
```

> 同一条规则，只应有一个 owner。

### 讲者备注

能从 source、schema 或 manifest 推导的清单应生成并由 CI 检查差异，不应手工复制维护。

### 过渡

ownership 也决定了文档目录该如何组织。

### 依据

- 参考文档：一、1–2

---

## 05. 文档目录表达 ownership，不表达阅读顺序

### 屏幕内容

| 目录 | 负责的内容 |
|---|---|
| `product` / `specifications` | 产品目标、行为设计、不变量、验收 |
| `architecture/current` / `target` | 已验证现状 / 尚未落地的方向 |
| `domains` / `contracts` | 领域 owner、代码入口与公开边界 |
| `decisions` / `delivery` | ADR、PLAN、TEST、DEFECT、Delivery Log |
| `guides` / `operations` / `reference/generated` | 方法、运行事实、生成地图 |

### 讲者备注

目录是责任地图，而非推荐阅读顺序。每类信息都有稳定位置和 owner，Agent 才能按问题取用。

### 过渡

其中有三条边界尤其重要。

### 依据

- 参考文档：一、2

---

## 06. 三条不能混淆的边界

### 屏幕内容

| 不要混淆 | 正确边界 |
|---|---|
| `current` 与 `target` | target 不能证明今天已经具备能力 |
| SPEC 与 PLAN | SPEC 定义行为与验收；PLAN 记录文件级实施与进度 |
| 运行事实与操作步骤 | operations 记录事实；guides/runbook 记录怎么做 |

**target 落地后，要以当前代码、配置与测试重新写出已验证结果。**

### 讲者备注

不要把目标设计、实施计划或操作手册误当作当前系统事实。

### 过渡

人和 Agent 可以有不同入口，但不能拥有不同正文。

### 依据

- 参考文档：一、2

---

## 07. 不同入口，共享同一份工程事实

### 屏幕内容

```visual
shared-facts
```

- `AGENTS`：稳定、路径相关、需要常驻的规则；
- Skill：可复用的任务流程与按 lane 触发的细节；
- docs：产品、架构、契约、运行等共享事实；
- test / generator / CI：可机械判断的不变量。

### 讲者备注

入口不同，正文必须相同。AGENTS 不应塞进长篇背景或一次性结论。

### 过渡

正确放置并不意味着一次读完全部文档。

### 依据

- 参考文档：一、3

---

## 08. 上下文按问题逐层展开

### 屏幕内容

```visual
context-layers
```

最小证据包通常是：**目标 source + 邻近 test + manifest/generator config + 一个真正需要的 owner 文档。**

### 讲者备注

代码与产品意图冲突才读 SPEC；涉及长期取舍才读 ADR；focused test 无法证明真实副作用才考虑 E2E。最小不是省 token，而是少引入歧义。

### 过渡

docs 告诉我们事实在哪；Skill 决定这次如何把事实组织成行动。

### 依据

- 参考文档：一、4

---

## 09. Route 只确定起点，不判断根因

### 屏幕内容

```visual
docs-route
```

Route 输入：`lane + domain + condition`  
Route 输出：`instructions + owner docs + code roots + contract roots + verification + human gates`

### 讲者备注

Route 不从错误字符串推导根因，也不决定改哪个函数。它把容易遗漏的入口、边界与证据责任变成确定性约束。

### 过渡

这三个输入各自承担不同职责。

### 依据

- 参考文档：二、1

---

## 10. Lane、Domain、Condition：三个互补维度

### 屏幕内容

```visual
route-matrix
```

| 维度 | 回答的问题 | 示例 |
|---|---|---|
| Lane | 按哪种工程方式调查与交付 | backend、contract、data、security |
| Domain | 谁拥有业务事实与代码入口 | `studio.workflow` |
| Condition | 哪些风险事实已确认成立 | `schema_change`、`observable_behavior_change` |

### 讲者备注

人先识别任务事实；一旦三个输入确定，工具按配置机械展开并去重。

### 过渡

行动包的六类输出，各自回答一个不同问题。

### 依据

- 参考文档：二、1

---

## 11. 最小行动包：六种边界，不是六份全文

### 屏幕内容

| 输出 | 它回答的问题 |
|---|---|
| instructions | 目标路径下必须遵守哪些操作规则？ |
| owner docs | 哪些文档拥有本次所需事实？ |
| code roots | 从哪里搜索当前实现？ |
| contract roots | 哪些公开边界约束实现？ |
| verification | 还欠哪些证据责任？ |
| human gates | 哪些决定不能静默做出？ |

### 讲者备注

这些是稳定入口，不是要求一次读取的资料包。返回 SPEC index，是需要时从入口继续选择具体 SPEC。

### 过渡

前三项收窄调查范围，后两项控制如何宣称完成。

### 依据

- 参考文档：二、1

---

## 12. 工作流任务：路由的确定性展开

### 屏幕内容

```text
输入：backend + studio.workflow + observable_behavior_change

instructions: AGENTS.md → backend/AGENTS.md → backend/modules/AGENTS.md
documents: routing.md + backend standard + SPEC index + workflow domain
roots: workflow internal + workflow contract
verification: backend_tests + acceptance_tests
human gates: none
```

### 讲者备注

相同输入、相同配置版本和目录结构，必然产生相同行动包。每一项都能反查来源。

### 过渡

配置负责缩小空间；Agent 负责在空间内探索根因。

### 依据

- 参考文档：二、1，“工具如何一步步合并”

---

## 13. Route、Execute、Review 各司其职

### 屏幕内容

```visual
delivery-loop
```

| 阶段 | 必须回答的问题 |
|---|---|
| Explore | 当前事实支持哪些假设？什么能推翻它？ |
| Implement | 真正的 owner 在哪里？哪些边界不变？ |
| Verify | 每层证据证明什么、没有证明什么？ |
| Close | 哪些已完成、哪些未运行、还剩什么风险？ |

### 讲者备注

verification 只是证据责任清单，不代表检查已运行。Execute 取得证据，Review 才判断是否足以支持完成。

### 过渡

验证尤其不能用一层证据替代另一层结论。

### 依据

- 参考文档：二、1–2

---

## 14. 验证有层级，结论也必须有层级

### 屏幕内容

```visual
verification-layers
```

| 层级 | 能证明什么 |
|---|---|
| focused | 被修改的局部机制正确 |
| contract / consumer | 边界一致；已检查调用方可适配 |
| integration | 真实组件协作与副作用正常 |
| acceptance | 用户原来失败的行为已经恢复 |

### 讲者备注

从最小直接证据开始，根据共享 contract、consumer、wiring 或真实副作用扩大。函数测试通过绝不自动等于用户流程恢复。

### 过渡

下面看一次真实工作流故障如何按这个机制推进。

### 依据

- 参考文档：二、1，verification

---

## 15. 案例起点：工作流知识库检索失败

### 屏幕内容

```text
场景：工作流画布 → 试运行 → 异步轮询结果
症状：Dataset（知识库检索）节点失败

Workflow execution failure: identity reference is invalid
executeStatus=3（失败）  nodeStatus=4（节点错误）
```

- 开始节点正常；带检索节点的试运行稳定失败；
- 会话、权限或重试都只是待验证假设。

### 讲者备注

先把报错改写为工程任务：恢复检索节点试运行，但不放宽身份校验，也不伪造执行主体。

### 过渡

Route 给出入口后，Explore 沿错误定义向上游收敛。

### 依据

- 参考文档：三、1–3

---

## 16. Explore：先证明安全契约没有错

### 屏幕内容

```text
identity reference is invalid
  → identityref.ErrInvalidIdentifier
  → knowledge contract Retrieve 解析 Tenant / Workspace
  → 身份字段为空：拒绝请求（正确的 fail-closed）
```

**第一层根因：** Workflow 的跨域检索请求没有携带契约要求的执行人身份。

### 讲者备注

修复不能放宽 Knowledge 校验；责任在调用方构造正确的跨域请求。全仓扫描再定义应覆盖的调用点。

### 过渡

在真正 owner 层补齐身份，不在安全边界打补丁。

### 依据

- 参考文档：三、3、5

---

## 17. Implement：只在真正 owner 层补齐身份

### 屏幕内容

```visual
field-chain
```

1. `Build` 从执行人会话捕获 `CanonicalScope`；
2. `Invoke` 显式将身份注入跨域请求；
3. 覆盖检索、文档写入、文档删除等调用点；
4. 缺少会话仍 fail-closed，不发起请求。

### 讲者备注

不从 ctx 隐式反查会话，不让 workflow creator 冒充执行主体，也不放宽 Knowledge 校验。最小改动，是只修错误的事实层。

### 过渡

focused test 证明局部机制，但还不能关闭用户任务。

### 依据

- 参考文档：三、5–6

---

## 18. 运行反馈推翻第一次 Close

### 屏幕内容

```text
Focused tests：身份已显式传递 ✓
真实试运行：仍然 identity reference is invalid ✗

新证据：运行前 reset session cache
        → 上层 ctx 仍有 session
        → 下游重新读取时却拿到空身份
```

> 新证据不是失败；它要求重新打开 Explore，并修正路线。

### 讲者备注

准确结论只能是“局部修复已验证，用户场景尚未验收”。第二层根因是 session 被 context cache 遮蔽。

### 过渡

第二轮先用红测定义修复，再让 session 穿过 cache reset。

### 依据

- 参考文档：三、7–10

---

## 19. Close：用证据描述结果，也描述边界

### 屏幕内容

```visual
routing-feedback
```

| 交付物 | 记录的内容 |
|---|---|
| DEFECT | 假设、被推翻的原因、正确根因与处理 |
| TEST | 局部修复与 cache-reset 回归证据 |
| Delivery Log | 实际运行验证、未运行项与残余风险 |
| Router feedback | 下一次应复用的入口、验证或 gate |

### 讲者备注

Close 不是一句“done”。它必须让下一位人或 Agent 看得出什么已被证明、什么没有、为什么选择此修复。

### 过渡

最后，把整套做法压缩成团队可复用的检查表。

### 依据

- 参考文档：三、12–13、结语

---

## 20. 下一次交给 AI 前，先问七个问题

### 屏幕内容

1. 我描述的是结果，还是只有动作？
2. 哪些行为与安全边界明确不变？
3. 这条结论属于哪类事实，由谁拥有？
4. 命中了哪些 lane、domain、condition？
5. 当前最小证据包是什么，何时需要扩展？
6. 哪个决定必须由人确认？
7. 哪些证据已运行，哪些仍未运行？

> 高质量 AI 编码，是定义边界、路由事实、验证影响面，并把决定权留给人。

### 讲者备注

docs-for-ai 让工程事实有 owner；Skill 让每次任务有可复用的行动与证据责任。两者都不替代判断，但能让判断基于正确事实、以正确边界交付。

### 依据

- 参考文档：结语
