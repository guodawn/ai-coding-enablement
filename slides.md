---
doc_type: presentation_source
status: draft
owner: platform
last_verified: 2026-09-01
---

# 从工程事实到可验证交付：docs-for-ai 与 Skill 实践

本文是演示的唯一内容源，基于 `docs-for-ai-skill-high-quality-coding.md`。

---

## 01. AI 写得快，为什么项目还是会改错？

### 屏幕内容

```visual
quality-system
```

> 真正容易出错的，不是“怎么写代码”，而是“该看什么、该信什么、改完算不算真的好了”。

### 讲者备注

高质量不是“模型写得对”这一件事，而是四个条件同时成立。接下来的问题是：怎样把这四个抽象条件落到每天的工程工作里？

### 过渡

先把四项条件与工程机制一一对应。

### 依据

- `docs-for-ai-skill-high-quality-coding.md`：引言

---

## 02. 两套机制，补齐四项质量条件

### 屏幕内容

我目前使用两套相互配合的机制：

| 机制 | 它负责回答的问题 |
|---|---|
| **docs-for-ai 管理工程事实** | 事实在哪里？由谁维护？发生冲突时相信谁？ |
| **Skill 管理任务过程** | 从哪里开始调查？何时扩大范围？需要哪些验证？什么决定必须交给人？ |

**docs-for-ai 让 AI 找对并相信正确的资料；Skill 让 AI 用这些资料推进一次可验证的交付。**

> 两者相互配合，但不替人定义目标，也不替人做高影响取舍。

### 讲者备注

这是整场分享的总主张：两者不是替代关系。docs-for-ai 管“事实”，Skill 管“行动”；任务边界和高影响决策仍由人保有。这样四项不是口号，而能落到仓库、路由、测试和验收中。

### 过渡

先看可信上下文如何建立：不同问题不能一律只看代码。

### 依据

- 参考文档：引言、第一章

---

## 03. 第一章总览：先建立可信上下文

### 屏幕内容

```visual
artifact-chain
```

**先建立一张能用的工程事实地图。**

**docs-for-ai 只管理工程事实：它不规定这次任务先做什么，而是保证需要事实时，找得到 owner。**

本章建立一张工程事实地图：

1. 先区分事实类型，再回到对应的唯一 owner；
2. 文档目录表达职责边界，不表达阅读顺序；
3. 人与 AI 共享同一份正文，并按问题渐进加载上下文。

> 目标不是让 AI 多读文档，而是让它在需要时读到正确的事实。

### 讲者备注

docs-for-ai 不是让团队多写文档，而是让资料打架时有办法判断。后面的做法很简单：先找最该负责的地方，改那里，再检查它带出来的结果。

### 过渡

先从第一条结论开始：遇到不同说法，先判断它属于哪类事实。

### 依据

- 参考文档：一、docs-for-ai 不是给 AI 另写一套文档

---

## 04. 先分清问题：不同事实由不同来源负责

### 屏幕内容

> 不要先问“该听谁的”，先问“我现在要回答什么问题”。

| 要回答的问题 | 对应的主要事实源 |
|---|---|
| 后端现在到底怎么跑 | 代码、测试、程序启动入口 |
| API 是怎么定义出来的 | Go 类型和 Huma operation |
| 对外 API 现在长什么样 | `backend/openapi.yaml` |
| 数据库现在是什么结构 | sqlc schema |
| 产品原本想让用户做什么 | 已确认的 BRIEF 与 SPEC |
| 当初为什么这么设计 | 已确认的 ADR |
| 用户这条路径到底能不能用 | E2E、契约测试、真实运行验收 |

### 讲者备注

代码、文档、测试不是天然互相冲突，而是各自负责不同类型的事实。代码与 SPEC 不一样，可能是功能还没做到；OpenAPI 与 operation 不一样，更可能是生成流程出了问题。

### 过渡

代码优先不是完整规则。发生冲突时，先回到这类事实的 owner，再修正 owner 与直接派生物。

### 依据

- 参考文档：一、1

---

## 05. 资料不一致时，先修正事实源

### 屏幕内容

```text
先弄清问题属于哪类资料 → 找到负责它的源头 → 改源头和直接生成的结果
                                             ↓
                          容易反复出错：补测试、生成检查或 CI
```

> 一条规则只留一个“最终说了算”的地方。

### 讲者备注

路由、表、依赖、配置这类能从代码或 schema 算出来的清单，不要手工复制。让工具生成，并在 CI 里检查有没有不一致。

### 过渡

所以文档目录也应该按“谁负责什么”来放。

### 依据

- 参考文档：一、1–2

---

## 06. 目录不是阅读顺序，而是责任地图

### 屏幕内容

| 目录 | 这里主要放什么 |
|---|---|
| `product` / `specifications` | 产品目标、行为设计、不变量、验收 |
| `architecture/current` / `target` | 已验证现状 / 尚未落地的方向 |
| `domains` / `contracts` | 领域 owner、代码入口与公开边界 |
| `decisions` / `delivery` | ADR、PLAN、TEST、DEFECT、Delivery Log |
| `guides` / `operations` / `reference/generated` | 方法、运行事实、生成地图 |

### 讲者备注

这不是阅读顺序，而是一张“资料放哪、谁负责”的地图。需要哪类信息，就去对应目录找，不必从头读完整个 docs。

### 过渡

有三组内容最容易被放混，也最容易误导 AI。

### 依据

- 参考文档：一、2

---

## 07. 三类资料，千万别混着看

### 屏幕内容

| 容易混在一起 | 实际上应该这样理解 |
|---|---|
| `current` 与 `target` | target 说“准备做什么”，不能证明“今天已经有了” |
| SPEC 与 PLAN | SPEC 说“最后要做成什么”；PLAN 说“这次准备怎么改” |
| 运行事实与操作步骤 | operations 说“系统现在怎样运行”；guide/runbook 说“操作时怎么做” |

**功能落地后，应该根据当前代码、配置和测试重新写 current，不能只把 target 改个状态。**

### 讲者备注

目标设计、实施计划和操作手册都很有用，但它们不能直接证明系统现在就是这样。

### 过渡

接下来再看：人和 AI 怎么从不同入口读到同一份事实。

### 依据

- 参考文档：一、2

---

## 08. 人和 AI 可以从不同入口进来，但要看同一份资料

### 屏幕内容

```visual
shared-facts
```

- `AGENTS`：某个目录下长期有效、必须遵守的规则；
- Skill：这类任务通常怎么做，哪些情况要多看一步；
- docs：产品、架构、契约、运行方式等大家共用的资料；
- test / generator / CI：机器能直接判断对错的规则。

### 讲者备注

入口可以不同，正文不能不同。AGENTS 只放短小、长期有效的规则；不要把大段背景或一次性的结论塞进去。

### 过渡

资料放对地方后，也不用一次全读完。

### 依据

- 参考文档：一、3

---

## 09. 不要一上来读全仓：缺什么，再补什么

### 屏幕内容

```visual
context-layers
```

一个任务刚开始，通常只要：**要改的代码 + 附近的测试 + 相关配置/生成文件 + 一份真正需要的说明文档。**

### 讲者备注

代码和产品意图冲突时才读 SPEC；要做长期取舍时才读 ADR；局部测试证明不了真实副作用时才做 E2E。少读不是为了省 token，而是避免无关资料把判断带偏。

### 过渡

现在已经知道资料怎么找；下一章看 Skill 怎么把这些资料变成行动。

### 依据

- 参考文档：一、4

---

## 10. 第二章总览：把“该查什么”变成清楚的行动清单

### 屏幕内容

**再把这张事实地图变成一次任务的行动路径。**

**Skill 不重写工程事实：它把 docs、代码和测试组织成这一次任务的调查、验证与升级路径。**

这一章把一次任务分成两件事：

- **Route：** 根据改动类型、业务归属和风险情况，列出这次该看的资料和该做的检查；
- **Execute / Review：** 回到代码找原因，实际跑检查，再判断证据够不够。

Route 帮你别漏掉入口、边界和检查项；它**不会**替 AI 猜根因，也不会替人做高影响决定。验证责任由 Route 声明，是否足以关闭任务仍由 Review 判断。

```text
人识别任务事实 → lane + domain + condition
                    ↓
工具确定性展开 → 最小行动包 → Explore / Implement / Verify / Close
```

### 讲者备注

最容易误解的是把 Route 当成“自动解决问题”。它只是保证同类任务不会因为换了一个 Agent，就少看一份规则、少跑一次检查；真正的原因还是要由代码和运行结果来证明。

### 过渡

先看一次任务如何从路由开始，逐步走到可复盘的交付。

### 依据

- 参考文档：二、Skill 负责把事实组织成行动

---

## 11. 从路由到复盘：一次任务如何推进

### 屏幕内容

```visual
delivery-loop
```

| 阶段 | 这一步要说清什么 |
|---|---|
| Route | lane、domain、condition 命中什么，最小行动包与证据责任是什么？ |
| Explore | 现在有哪些可能原因？什么结果能推翻它？ |
| Implement | 真正该改哪里？哪些边界绝不能动？ |
| Verify | 每个检查证明了什么，又没证明什么？ |
| Close | 已经做完什么？没跑什么？还可能有什么风险？ |

### 讲者备注

Route 只决定从哪里开始、不能漏什么；它不猜根因，也不替人做高影响决定。Explore、Implement、Verify 和 Close 则分别把事实转化为实现、证据和可复盘的结论。

### 过渡

先拆 Route 的第一个输入：Lane 决定本次要按哪种工程边界查、改、验。

### 依据

- 参考文档：二、1

---

## 12. Lane：按影响面决定该怎样查、改、验

### 屏幕内容

**Lane 不是代码目录，也不是互斥标签；它标出这次改动会触及哪一种工程边界。**

| Lane | 它表示什么 | Route 因此会重点补什么 |
|---|---|---|
| `backend` | 服务端行为、模块实现或运行逻辑变化 | owning source、邻近测试、build / vet 与后端回归证据 |
| `contract` | API、事件、公开类型或跨模块调用的约定变化 | contract root、兼容性与已知消费者验证 |
| `data` | schema、迁移、数据语义或生成链变化 | schema owner、migration、codegen 与数据影响检查 |
| `security` | 身份、授权、凭证、审计或安全策略变化 | 安全边界、负向验证，必要时 human gate |

一次任务可以同时命中多个 lane：例如改一个带鉴权的新接口，通常同时是 `backend` + `contract` + `security`。

### 讲者备注

Lane 解决“按什么工程方式查和验”。另外两个输入各有职责：Domain 决定主要 owner（如 `studio.workflow`）；Condition 声明已确认的风险事实（如 `schema_change`），并在此基础上追加检查或 gate。三者共同决定 Route 的最小行动包。

### 过渡

接下来看看这份清单里具体会有什么。

### 依据

- 参考文档：二、1

---

## 13. Domain：确定哪一块拥有事实与入口

### 屏幕内容

**Domain 不是团队名称或目录路径；它说明这次行为主要归哪个业务边界负责。**

| Domain 带来的信息 | 它让 Route 知道什么 |
|---|---|
| 领域 owner | 哪个模块对这项行为和边界负责 |
| owner docs | 到哪份领域文档确认产品、设计或约束事实 |
| code roots | 第一轮从哪些源码与邻近测试开始搜索 |
| contract roots | 哪些公开边界和跨模块调用不能漏看 |

```text
本案例：domain = studio.workflow
owner = studio-workflow
code root = internal/core/workflow
contract root = contract/workflow
```

> Lane 说明“怎样查和验”；Domain 说明“到哪里找 owner”；Condition 才说明“还要追加什么风险约束”。

### 讲者备注

Domain Registry 把稳定的领域知识集中起来：owner、文档入口、代码根与 contract 根。它只限定第一批搜索范围，不会把具体要改的 handler 或测试写死在路由配置中；这些仍需要 Explore 用当前代码发现。

### 过渡

最后一个输入是 Condition：只有已确认的风险事实，才会追加验证或人类 gate。

### 依据

- 参考文档：二、1，Domain、owner docs、code roots、contract roots

---

## 14. Condition：只为已经确认的风险追加约束

### 屏幕内容

**Condition 不是“可能有风险”的猜测，而是当前任务已经成立的风险事实。**

| Condition | 表示什么 | Route 会追加什么 |
|---|---|---|
| `observable_behavior_change` | 用户可观察到的行为发生变化 | acceptance evidence：要能证明用户路径恢复或符合预期 |
| `schema_change` | 数据结构或演进路径发生变化 | schema / migration / codegen 检查；必要时确认数据影响 |
| `breaking_contract` | 现有消费者可能无法继续使用公开边界 | 兼容性验证与由人确认的取舍 |
| `security_policy_change` | 授权或安全策略本身发生变化 | 负向验证，并请人确认预期的授权边界 |

**没有命中 Condition，就不凭“任务看起来复杂”自动加审批或扩大验证。**

### 讲者备注

Condition 让验证与 gate 有明确触发条件。比如本案例命中 `observable_behavior_change`，所以 Route 要求 acceptance tests；但它没有改变 schema、公开 HTTP contract 或安全策略，因而不应平白增加 migration 或安全审批。它和 Lane、Domain 一起决定行动包：Lane 是工程影响面，Domain 是 owner，Condition 是已经确认的额外风险。

### 过渡

Lane、Domain 和 Condition 确定后，工具给出的只是最小行动包，而不是一大包必须预读的材料。

### 依据

- 参考文档：二、1，Condition、verification、human gates

---

## 15. Route 的作用：给出调查起点与证据责任

### 屏幕内容

| Route 的输入 | Route 的输出 |
|---|---|
| 改动类型、业务归属、已确认风险 | 规则、owner docs、代码/契约入口、证据责任、人类 gate |

它解决的是“从哪里开始、不能漏什么”，不是“根因一定在哪里”。

### 讲者备注

Route 不会从一条报错猜出根因，也不会指定“改第几个函数”。它把容易漏掉的入口、公开边界和检查要求固定下来；verification 只是“还欠哪些检查”的清单，不代表已经跑过。

### 过渡

接下来把这份最小行动包拆开：它给的是入口，不是一大包必须预读的材料。

### 依据

- 参考文档：二、1

---

## 16. 工具给的是“该从哪开始”，不是一大包必读材料

### 屏幕内容

| 工具给出的内容 | 它帮你回答什么 |
|---|---|
| instructions | 在这个目录里做事，有哪些必须遵守的规则？ |
| owner docs | 哪些文档最清楚这次需要的事实？ |
| code roots | 第一轮应该从哪里搜当前实现？ |
| contract roots | 哪些对外接口或跨模块约定不能忘？ |
| verification | 最后还必须拿到哪些检查结果？ |
| human gates | 哪些事不能让 AI 自己悄悄决定？ |

### 讲者备注

这些是入口，不是要求一次全部读完。比如返回 SPEC index，只表示需要时从这里继续找到对应需求，不是要把整个目录塞进上下文。

### 过渡

输入、配置版本和目录结构相同，工具每次都应该给出同一份可追溯的清单。

### 依据

- 参考文档：二、1，“工具如何一步步合并”

---

## 17. 同一个输入，每次都会得到同一份任务清单

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

只要输入、配置版本和目录结构相同，工具每次都会给出同一份清单；而且每一项都能追溯：是改动类型、风险条件、领域登记，还是目录里的 AGENTS 规则带来的。

### 过渡

清单负责把范围缩小；但不同层的验证不能互相替代。

### 依据

- 参考文档：二、1–2

---

## 18. 单元测试通过，不等于用户真的能用

### 屏幕内容

```visual
verification-layers
```

| 检查层级 | 它最多能说明什么 |
|---|---|
| focused | 你刚改的那块局部逻辑是对的 |
| contract / consumer | 接口没变坏；检查到的调用方还能接上 |
| integration | 真实组件连起来后，协作和副作用正常 |
| acceptance | 用户原来做不到的事，现在真的做到了 |

### 讲者备注

先跑能直接证明修改的最小检查。只有改到公共接口、调用方、装配代码或真实副作用时，才扩大范围。函数测试绿了，绝不自动等于用户流程恢复。

### 过渡

下面用一次真实故障，看这套方法怎样一步步避免误判。

### 依据

- 参考文档：二、1，verification

---

## 19. 第三章总览：一次报错，怎样一步步查到真正原因

### 屏幕内容

```visual
delivery-loop
```

这一章把开场四项质量条件放进一条真实交付链。案例会经历四个转折：

1. 把用户报错改成“要恢复什么、又不能破坏什么”的任务；
2. 第一次查到：跨服务请求漏带了真正执行人的身份；
3. 局部测试通过后，真实试运行仍然失败；
4. 第二个原因被写进回归测试、缺陷记录和交付日志。

> 重点不是“一次猜中”，而是新证据出现时，我们能及时改正判断。

### 讲者备注

这不是“AI 一次修好”的故事。它说明局部逻辑没问题，不代表真实用户就能用；所以查问题时必须允许结论被新证据推翻。

### 过渡

先从用户每次都会看到的报错开始。

### 依据

- 参考文档：三、案例：Skill + docs 如何完成一次工作流故障交付

---

## 20. 用户问题：一加知识库检索，试运行就失败

### 屏幕内容

```text
用户在工作流画布中试运行一个简单流程：

开始节点 → Dataset 知识库检索节点

开始节点成功，Dataset 节点稳定失败：
Workflow execution failure: identity reference is invalid

executeStatus = 3
Dataset nodeStatus = 4
```

错误看起来像登录失效、权限配置错误或 Dataset 配置错误；这些都只是初始猜测。

### 讲者备注

这是一个稳定可复现的故障，而不是偶发网络错误。先让观众看到真实症状，才容易理解：为什么后面不能凭错误文本直接改登录、权限或知识库配置。

### 过渡

Skill 的第一步不是立即找根因，而是先写清目标、不变项和最终需要的验收证据。

### 依据

- 参考文档：三、1

---

## 21. 定界：先把报错改写成工程任务

### 屏幕内容

```text
Goal        Dataset 节点以当前执行人的身份完成知识库检索
Non-goals   不放宽 Knowledge 身份校验；不冒充 creator；不改 HTTP contract
Route       backend + studio.workflow + observable_behavior_change
Evidence    focused tests + Workflow tests/build/vet + 真实 test_run 验收
```

- 开始节点成功，Dataset 节点稳定失败：`identity reference is invalid`；
- 登录失效、权限配置和 dataset 配置都只是初始猜测。

### 讲者备注

此时不读完整 IAM、数据库或部署文档，也不急着建立 PLAN。范围尚不清楚，最重要的是别把“让报错消失”写成目标。

### 过渡

Route 给出的最小入口是 AGENTS 指令链、Workflow domain、backend standards、code root 和 contract root；它也明确要求 backend 与 acceptance evidence。

### 依据

- 参考文档：三、1–3

---

## 22. Route：只读取解决当前问题的最小事实入口

### 屏幕内容

```text
lane       backend
domain     studio.workflow
condition  observable_behavior_change
```

| 类型 | 本次输出 |
|---|---|
| Instructions | 根 AGENTS、backend/AGENTS、modules/AGENTS |
| Owner docs | backend standards、Workflow domain、SPEC index |
| Roots | `internal/core/workflow` + `contract/workflow` |
| Verification | backend tests、acceptance tests |
| Human gate | none |

### 讲者备注

Route 此时没有预读 IAM、安全、数据库、部署或 E2E 文档：还没有证据说明问题发生在这些边界。它只给调查起点，不维护“可能要改的文件清单”。第一个判断是：即使错误来自 Knowledge，也必须先证明 Workflow 请求是否满足跨域 contract。

### 过渡

因此 Explore 先搜索错误字符串，沿当前代码与 contract 追踪，而不是继续阅读背景资料。

### 依据

- 参考文档：三、2

---

## 23. Explore 1：先证明安全契约没有错

### 屏幕内容

```text
identity reference is invalid
  → identityref.ErrInvalidIdentifier
  → knowledge contract Retrieve 解析 Tenant / Workspace
  → parseScope 收到空字符串：拒绝请求（正确的 fail-closed）
```

| 问题 | 结论 | 事实源 |
|---|---|---|
| 谁拥有修复 | Workflow 调用方 | Domain Registry |
| 哪个边界不能动 | Knowledge fail-closed contract | Knowledge contract |
| 当前要改哪里 | 4 个 Workflow 调用点 | 当前代码扫描 |

### 讲者备注

请求在真正的权限判断之前就因空身份被拒绝。这个证据推翻了“权限配置错”的假设；不该去 Knowledge 模块放宽校验。

### 过渡

新问题才触发新的上下文：Knowledge 为什么要求显式身份？答案来自 contract 和 Git history；当前扫描则确认遗漏范围。

### 依据

- 参考文档：三、3、5

---

## 24. 证据：Workflow 发出的请求，身份字段确实为空

### 屏幕内容

```go
RetrieveRequest{
  Query: "hi", KnowledgeIDs: []string{datasetID},
  ChatHistory: ..., Strategy: ...,

  TenantID: "", WorkspaceID: "", ActorPrincipalID: "",
}
```

这说明请求在真正的权限判断之前，就因身份引用为空被拒绝。

### 讲者备注

这段“修复前的请求”是第一层根因的直接代码证据，不是登录、权限或 Dataset 配置的猜测。`parseScope(TenantID, WorkspaceID)` 收到空字符串后 fail-closed；Knowledge 的拒绝行为本身正确。

### 过渡

接着才需要回答：为什么跨域请求不能只传 query 和 dataset ID，而必须补齐一整个身份信封？

### 依据

- 参考文档：三、3

---

## 25. 身份信封：请求属于哪里，谁正在执行

### 屏幕内容

```visual
identity-envelope
```

- `CanonicalScope`：`TenantID`、`WorkspaceID`，来自 WorkflowSchema；
- session facts：principal、active tenant、assurance、credential scope、capabilities，来自当前执行人；
- Knowledge 依据这组事实完成 Dataset 预授权；
- 当前代码扫描发现 4 个遗漏点：Retrieve、LLM recall、Dataset Write、Dataset Delete。

### 讲者备注

Query 只说明“要查什么”；身份信封说明“请求属于哪里、谁在执行、凭证受什么限制”。因此必须由 Workflow 显式传递，不能让 adapter 从 ctx 隐式猜测。

### 过渡

Git history 解释“为什么有这个安全要求”，当前代码扫描才证明“今天还影响哪些调用点”。

### 依据

- 参考文档：三、3、5

---

## 26. 范围判断：历史解释背景，当前代码证明遗漏范围

### 屏幕内容

```text
Git commit 9599f107
  RAG 数据集预授权要以真实人类主体执行
  已补齐 agent 调用方，遗漏 Workflow

当前代码扫描
  Dataset Retrieve / LLM recall / Dataset Write / Dataset Delete
  四个调用点仍缺完整身份
```

> Git history 解释“为什么”；当前代码才证明“今天还影响哪里”。

### 讲者备注

对照 agentflow 的同类调用，已经能看到完整身份传递。这里避免两种误判：只凭历史把过时影响面当事实，或只修最先报错的 Retrieve，把三处同类遗漏留在系统里。

### 过渡

第一层根因、影响范围和明确拒绝的捷径已经足够清楚；现在把这些当时的判断固定到 DEFECT。

### 依据

- 参考文档：三、3–4

---

## 27. 记录：在实施前建立 DEFECT 与 Resolution Plan

### 屏幕内容

```text
已确认根因   Workflow 构造跨域请求时身份字段为空
实现 owner   studio-workflow
最小修复     从执行会话派生身份，注入 4 个调用点

明确拒绝：不放宽 adapter；不在 adapter 读 session；
          不用 creator 替代执行人；不只修 Retrieve
```

> 不是根据最终 diff 倒推一篇完美故事，而是在实施前固定“准备相信什么、准备改什么、不接受什么”。

### 讲者备注

DEFECT 让跨域、授权边界且具有复发价值的问题有稳定 owner；PLAN 仍只记录文件级实施，不重新定义产品行为。

### 过渡

第一轮实现只改 Workflow 请求构造，不移动 Knowledge 的安全边界。

### 依据

- 参考文档：三、4

---

## 28. Implement 1：在真正 owner 层补齐身份

### 屏幕内容

```text
Build：WorkflowSchema → CanonicalScope(TenantID, WorkspaceID)
Invoke：request session → principal / active tenant / assurance / credential scope
                 ↓
RetrieveRequest：业务参数 + 完整身份信封
```

- 缺少 session 时仍 fail-closed，不发起跨域请求；
- 不从 `ctx` 隐式反查会话；
- 不使用 workflow creator 冒充当前执行人；
- 不修改 Workflow HTTP contract 与 Knowledge adapter。

### 讲者备注

最小 coherent change 不是少改一行，而是让请求构造重新满足既有 contract，同时保留安全边界。

### 过渡

实现后先取得 focused 证据；不要把“测试绿”提前翻译成“用户问题已解决”。

### 依据

- 参考文档：三、5

---

## 29. 为什么必须显式传递身份，而不是在 adapter 里隐式读取？

### 屏幕内容

```text
业务参数：Query / KnowledgeIDs        → 要查什么
CanonicalScope：Tenant / Workspace    → 请求属于哪里
Session facts：Principal / Assurance  → 谁在执行、凭证可信到什么程度
                                      ↓
Knowledge contract                  → 依据这些事实做 Dataset 预授权
```

| 不能采用的方案 | 原因 |
|---|---|
| adapter 从 context 隐式取 session | 调用方责任被藏起来，contract 无法说明信任哪些输入 |
| 用 workflow creator 代替执行人 | creator 和实际执行人可能不同，授权会绑定到错误主体 |
| 只修 Retrieve | 当前扫描已证明还有 3 个同类遗漏点 |

### 讲者备注

第一轮实现只修改 Workflow 的请求构造，不移动 Knowledge 的安全边界。这样“最小修复”不是少改一行，而是只在真正 owner 层补齐缺失的授权事实。

### 过渡

接下来用 focused tests 固定身份传递与 fail-closed；同时明确它们还不能证明什么。

### 依据

- 参考文档：三、5–6

---

## 30. Verify 1：第一轮证据证明了什么，又遗漏了什么

### 屏幕内容

| 已证明 | 尚未证明 |
|---|---|
| CanonicalScope 与全部 session facts 组装正确 | 浏览器 session 穿过异步 Runner 后仍可见 |
| 无 session、无效 assurance / scope 时继续 fail-closed，且不发请求 | Dataset 节点真实完成 |
| 4 个请求构造点已补齐；Workflow tests、build、vet 通过 | acceptance / E2E 已运行；用户路径恢复 |

> focused test 通过，只能支持“局部修复已验证”；不能支持“问题已解决”。

### 讲者备注

Delivery Log 如实记录 E2E 尚未运行，但第一次 Close 仍然过早。这个证据缺口为下一次用户复测埋下了可解释的转折。

### 过渡

用户复测提供新的运行证据：任务不是继续在第一层补字段，而是回到 Explore。

### 依据

- 参考文档：三、6

---

## 31. 运行反馈：用户复测推翻第一次 Close

### 屏幕内容

```text
Focused tests：身份已显式传递 ✓
真实 test_run：knowledge identity is required ✗

含义：节点尚未发出跨域请求；
      CanonicalScope 存在，但 Dataset Invoke 读不到 request session。
```

> 新错误不是第一轮修复失败；它精确说明第一层修复正确，但用户目标仍未恢复。

### 讲者备注

原 Delivery Log 不改写，而是追加“第一轮完成结论过早”、新运行证据和重开 Explore 的决定。append-only 使当时依据与遗漏的验证仍然可见。

### 过渡

第二轮问题变成：HTTP middleware 写入的 session，到底在哪一步对 Dataset 节点不可见？

### 依据

- 参考文档：三、7

---

## 32. Explore 2：context 没丢，session 被新 cache 遮蔽

### 屏幕内容

```text
session middleware → context.WithoutCancel → safego.Go → ExeCtx → Dataset Invoke
                                  context value 一直保留 ✓

原 context / cache map A              freshCtx / cache map B
  session + scratch data    ctxcache.Init →    空 cache 优先命中
                                                ↓
                                  GetUserSessionFromCtx = nil
```

真正断点在 `UseCtxCache = true` 的节点调用前：`ctxcache.Init` 新建 map B，遮蔽 map A 中的 session。

### 讲者备注

这排除了“goroutine 或 WithoutCancel 丢失 context”的猜测。父 context 没被删除，只是下游查询先命中了新的空缓存。

### 过渡

不能删除 cache reset；先用红测把允许穿过与必须隔离的数据边界写清。

### 依据

- 参考文档：三、8

---

## 33. 红测：请求级身份可见，节点级 scratch 必须隔离

### 屏幕内容

| 不变量 | 为什么 |
|---|---|
| reset 后 request session 仍可见 | 它是整次请求可信的执行身份 |
| reset 前 scratch data 不可见 | 它只属于一次节点调用 |

`TestUseCtxCacheNodeStillSeesRequestSession` 在修复前失败：`session shadowed; seen = nil`。

### 讲者备注

红测把第二层根因从推断变成可重复证据，也避免“为修复 session 而保留全部旧 cache”导致临时数据泄漏。

### 过渡

实现只让 session 穿过 reset，不复制整个 cache map。

### 依据

- 参考文档：三、9

---

## 34. Implement 2：只让 session 穿过 cache reset

### 屏幕内容

```go
freshCtx := ctxcache.Init(ctx)
if session := GetUserSessionFromCtx(ctx); session != nil {
    Store(freshCtx, SessionDataKey, session)
}
return freshCtx
```

```text
map A: session + scratch  →  map B: session
                                   scratch ✕
```

### 讲者备注

保留 `ctxcache.Init` 的节点隔离目的；只重新注入请求级 session。红测转绿，原有 scratch 隔离断言保持绿色。

### 过渡

两轮 focused tests 都通过后，仍需要 Route 一开始要求的 acceptance evidence。

### 依据

- 参考文档：三、10

---

## 35. Acceptance 前：先确认环境运行的是第二轮修复

### 屏幕内容

```text
1. 对比后端进程启动时间与修复文件 mtime
2. 确认运行实例尚未加载第二轮修复
3. 重启后端
4. 旧 Cookie 随原进程失效，通过 UI 重新登录
5. 执行真实 test_run，并轮询 Dataset 节点
```

> 验收不是“再跑一次测试”：先确保被验收的运行实例确实包含修复。

### 讲者备注

这一段解释为什么 acceptance 是独立证据层。若运行的仍是旧进程、浏览器持有旧 Cookie，后续成功或失败都无法可靠归因到当前修复。

### 过渡

环境与登录状态确认后，才能观察用户原来失败的完整路径是否恢复。

### 依据

- 参考文档：三、11

---

## 36. Acceptance：补齐真实用户路径的证据

### 屏幕内容

```text
UI 重新登录 → request session → Workflow 异步执行
  → cache reset 后恢复 session → CanonicalScope + actor facts
  → Knowledge contract → RAG 预授权与检索

Dataset nodeStatus = 3
errorInfo = ""
output = {"outputList":[]}
```

`outputList` 为空并不代表失败；验收目标是节点以当前用户身份安全完成，而不是任意查询都命中文档。

### 讲者备注

验收前需确认运行进程已加载第二轮修复；旧 Cookie 随重启失效后重新登录，再执行真实 `test_run` 并轮询 Dataset 节点结果。

### 过渡

最终把稳定结论写回各自的 owner，不让它只留在聊天和提交说明中。

### 依据

- 参考文档：三、11

---

## 37. Close：DEFECT、Log、Test 各自拥有不同事实

### 屏幕内容

| owner | 最终沉淀 |
|---|---|
| DEFECT-0007 | 用户现象、两层根因、两轮修复、拒绝方案、验收与范围外问题 |
| Delivery Log | 第一轮做了什么、为何过早关闭、第二轮与 acceptance 摘要 |
| Tests | 跨域身份 contract；cache reset 的 session / scratch 数据边界 |

> 文档保存因果和决策；测试保存可机械阻止复发的不变量。

### 讲者备注

Close 不是一句 done：它必须诚实地给出已运行、未运行和残余风险。End 节点对空数组的独立问题被记录，但不扩大当前修复范围。

### 过渡

用整条生命周期回看 docs、Skill、测试与运行证据如何共同推进任务。

### 依据

- 参考文档：三、12

---

## 38. 回看完整流程：每一步由证据推动，而非猜测推动

### 屏幕内容

```visual
delivery-loop
```

| 阶段 | 关键产出 |
|---|---|
| 定界 / Route | 目标、不变项、最小事实入口、证据责任 |
| Explore 1 / Implement 1 | 身份缺失根因、显式身份信封、focused tests |
| 运行反馈 / Explore 2 | 过早 Close 被推翻、cache 遮蔽根因、红测 |
| Implement 2 / Acceptance / Close | session 重注入、真实 test_run、DEFECT + Log + Tests |

**回到开场四项：** 定界守住任务边界；owner 与 contract 提供可信上下文；两轮测试与验收形成验证反馈；不放宽安全边界与明确拒绝方案保留人类决策。

### 讲者备注

docs 不在开始时一次读完，也不在结束时才补写。它持续提供 owner 和边界，并接收稳定结论；Skill 则在每个阶段推动下一步。

### 过渡

最后，将这套做法压缩成每次交给 AI 前都可使用的七个问题。

### 依据

- 参考文档：三、13

---

## 39. 把四项质量条件变成七个问题

### 屏幕内容

1. **[任务边界]** 我说清了想要的结果，还是只说了“帮我改一下”？
2. **[任务边界]** 哪些行为和安全边界绝对不能变？
3. **[可信上下文]** 代码、文档、测试不一致时，该去哪里找最终答案？
4. **[可信上下文]** 这次改动属于哪类工作，主要归哪个业务域？
5. **[可信上下文]** 一开始最少该看什么？什么情况下需要多查一步？
6. **[人类决策]** 哪个取舍必须由人来拍板？
7. **[验证反馈]** 哪些检查已经跑过，哪些还没跑？

> 高质量 AI 编码，就是先说清边界，找对资料，按影响范围验证，把该由人决定的事留给人。

### 讲者备注

这七个问题分别把任务边界、可信上下文、验证反馈和人类决策落回下一次具体任务。docs-for-ai 让我们找得到该信的资料；Skill 让每次任务知道该做什么、还缺什么证据。

### 依据

- 参考文档：结语
