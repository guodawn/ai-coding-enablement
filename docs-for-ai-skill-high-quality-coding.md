# 从工程事实到可验证交付：docs-for-ai 与 Skill 实践

现在的编码 Agent 已经很会写代码。实际使用中，更容易出问题的往往不是代码生成，而是前面的工程判断：它读到了什么、相信了什么、修改了谁负责的代码，又用什么证据宣布任务完成。

我目前使用两套相互配合的机制：

- docs-for-ai 管理工程事实：事实在哪里、由谁维护、发生冲突时相信谁。
- Skill 管理任务过程：从哪里开始调查、什么时候扩大范围、需要做哪些验证、什么决定必须交给人。

它们都不会替代代码阅读和调试。它们的作用，是让调查在正确的责任边界内进行，并避免用不充分的证据过早关闭任务。

## 一、docs-for-ai 不是给 AI 另写一套文档

我最早对 docs-for-ai 的理解比较简单：把项目背景整理得更完整，让 Agent 多读一些。实际效果并不好。文档越多，Agent 越容易同时读到当前实现、目标设计、历史方案和实施计划，然后把它们混成一个结论。

后来我把问题改成：**当前要判断的这件事，究竟由哪一种事实负责？**

### 1. 先识别事实类型

在 UnicAgent Studio 中，不同问题有不同的权威来源。

| 要回答的问题 | 主要事实源 |
|---|---|
| 当前后端如何运行 | Go source、tests、composition root |
| HTTP API 从哪里产生 | Go types 与 Huma operation |
| 对外 HTTP 快照是什么 | backend/openapi.yaml |
| 当前数据库结构是什么 | sqlc schema |
| 数据库如何演进 | Atlas migrations、checksum、seed |
| 产品希望实现什么 | accepted BRIEF 与 SPEC |
| 为什么采用某项长期设计 | accepted ADR |
| 当前复杂工作进行到哪里 | owner 的 active PLAN |
| 某个用户路径是否真的可用 | executable E2E、contract test、运行验收 |

这意味着“代码优先”不是一条完整规则。

如果代码与 accepted SPEC 冲突，可能是实现缺陷；如果一篇说明文档与代码冲突，可能是文档漂移；如果 OpenAPI 与 Huma operation 冲突，问题更可能出在生成链。三种冲突的处理方式完全不同。

因此我的处理顺序是：

1. 先确定当前结论属于哪种信息；
2. 找到这类信息的 owner；
3. 修正 owner 和它的直接派生物；
4. 如果同类漂移容易复发，再补测试、生成检查或 CI gate。

### 2. 文档目录表达 ownership，不表达阅读顺序

UnicAgent Studio 的 docs 目录按信息职责划分：

| 目录 | 负责的内容 |
|---|---|
| product | 产品目标、场景、BRIEF、需求 |
| specifications | 行为设计、不变量、验收要求 |
| architecture/current | 已实现且有证据的架构 |
| architecture/target | 尚未完全落地的方向、缺口和进入条件 |
| domains | 领域 owner、代码入口和 contract 入口 |
| contracts | HTTP、SSE、事件、模块和数据契约 |
| decisions | 单项、长期、难逆转的 ADR |
| delivery | PLAN、TEST、DEFECT 和 Delivery Log |
| guides | 可重复执行的标准、how-to 和 runbook |
| operations | 部署、配置、观测、SLO 和 DR 事实 |
| reference/generated | 从 source、schema 或 manifest 生成的紧凑地图 |

这里有几个我认为很重要的边界。

**current 和 target 必须分开。** target 描述准备去哪里，不能拿来证明系统现在已经具备某项能力。一个 target 被实现后，也不能简单把状态改成 current，而要依据当前代码、配置和测试重新写出已验证的结果。

**SPEC 和 PLAN 必须分开。** SPEC 负责设计、权衡、不变量和验收；PLAN 负责文件级实施、进度、发现和恢复。如果 PLAN 开始重新定义产品行为，它就变成了第二份设计事实源。

**运行事实和操作步骤必须分开。** operations 记录系统采用什么部署形态、配置政策和运行目标；guides/operations 记录具体怎么执行。事实变化和操作步骤变化不一定同时发生。

**可推导清单不要手工维护。** package、路由、表、依赖、配置和 OpenAPI 等完整清单，应当由权威输入生成，并由 CI 检查差异。手工复制一份清单，短期方便，长期一定漂移。

### 3. 人和 Agent 使用不同入口，但共享正文

人的常用入口是 README 和 docs index；Agent 的入口是根目录及路径级 AGENTS，以及任务 Skill。

入口不同，正文不能不同。

    人：README / docs index
                 \
                  domain / contract / SPEC / ADR
                 /
    Agent：AGENTS / Skill route

AGENTS 只保留稳定、路径相关、需要常驻的规则，例如目录边界、开始前必须检查的状态和高影响操作限制。长篇背景不放在 AGENTS，一次性任务结论也不放在 AGENTS。

可复用的任务流程进入 Skill；只有特定 lane 命中时才需要的细节进入 Skill references；产品、架构、契约和运行事实留在共享 docs；可以机械判断的不变量进入 test、generator、linter 或 CI。

这样做的目的不是让结构看起来整齐，而是让同一条规则只有一个 owner。

### 4. 文档不是一次全部加载

即使文档放对了位置，一次把它们全部读进上下文也没有必要。我使用四层上下文：

    L0：任务目标、不变项、适用指令和 Route
     ↓
    L1：目标 source、邻近 tests、直接调用方和配置
     ↓
    L2：为解决当前问题所需的一个 owner 文档或契约
     ↓
    L3：安全、数据、跨服务、部署或 E2E 证据

每次扩展都要回答一个具体问题。例如：

- 代码和产品意图冲突，才读取对应 SPEC；
- 出现长期、跨边界取舍，才读取 ADR；
- 涉及 schema 或迁移，才扩展到 data owner 和生成链；
- focused test 无法证明集成副作用，才考虑真实浏览器或 E2E。

一个典型的最小证据包通常只有：目标 source、一个邻近 test、相关 manifest 或 generator config，再加一个真正需要的 owner 文档。

这里的“最小”不是少用 token，而是少引入无关歧义。

## 二、Skill 负责把事实组织成行动

docs-for-ai 能告诉我事实在哪里，但不会自动回答这次任务应该先读什么、先跑什么测试、何时扩大范围。

Skill 负责这部分。

### 1. Route 只确定起点，不判断根因

UnicAgent Studio 的任务路由由三个维度组成：

- Lane 表示工程影响面，例如 backend、contract、data、security、docs。
- Domain 表示业务 owner，例如 studio.workflow。
- Condition 表示本次确实成立的风险事实，例如 schema_change 或 observable_behavior_change。

路由工具根据这三个输入，确定性地合并：

    instructions
    owner docs
    code roots
    contract roots
    verification
    human gates

这六类输出共同组成一次任务的**最小行动包**。它们不是六份需要全文加载的资料，而是六种不同用途的边界。

| 输出 | 它回答的问题 | 主要来源 | Agent 接下来怎么用 |
|---|---|---|---|
| instructions | 在目标路径下必须遵守哪些操作规则 | 根目录到目标路径的 AGENTS 指令链，以及 lane 对应的固定指令 | 编辑前按顺序读取；下级规则补充或收紧上级规则 |
| owner docs | 哪些文档拥有本次任务需要的产品、领域或工程事实 | lane 的 required docs、condition 触发的 docs、Domain Registry 指向的领域文档 | 作为稳定入口按需读取；它们不是根因答案，也不要求一次读完 |
| code roots | 应从哪些源码目录开始搜索当前实现 | Domain Registry 的 code_path，以及 lane 的搜索边界 | 在目录内定位 owning source、邻近 tests、composition root 和直接调用方 |
| contract roots | 哪些公开边界可能约束实现 | Domain Registry 的 contract_path，以及 contract lane 的固定入口 | 检查跨模块请求、公开类型、生成关系和消费者；不能把内部实现当公开契约 |
| verification | 什么证据是本次任务至少需要考虑的 | lane、condition 和 domain 命中的 verification ID，经验证矩阵解释 | 先跑最小相关检查，再按失败或影响面扩大；未运行项必须如实报告 |
| human gates | 哪些决定不能由 Agent 静默做出 | 只有已声明 condition 命中的 gate | 在修改前整理事实、选项和影响，请人作出取舍或授权 |

### instructions：约束“怎么工作”

instructions 通常是从仓库根目录到目标路径的 AGENTS 链。例如修改 Workflow 后端代码时，可能得到：

    AGENTS.md
    backend/AGENTS.md
    backend/modules/AGENTS.md

根规则负责仓库级边界，backend 规则负责 Go 工具链和后端约束，modules 规则负责模块边界。路由只返回需要读取的指令入口，不把指令正文复制到输出中。

### owner docs：定位“谁拥有事实”

owner docs 是文档入口，不是固定上下文包。例如 backend × studio.workflow 可能得到：

    docs/start-here/task-routing.md
    docs/guides/development/standards/backend.md
    docs/specifications/index.md
    docs/domains/studio/workflow.md

Workflow domain 文档用于确认 owner、代码入口和 contract 边界；SPEC index 只有在需要判断用户行为或验收要求时才继续向下选择具体 SPEC。返回 index 不等于要预读整个 specifications 目录。

### code roots：限定“从哪里搜索当前实现”

code roots 通常来自 Domain Registry。例如 studio.workflow 映射到：

    backend/modules/studio/internal/core/workflow

它只限定第一批搜索范围。具体 handler、service、节点、调用方和测试由当次 rg 搜索发现，不写死在路由 YAML 中，否则代码移动后路由配置会迅速漂移。

### contract roots：提醒“不能只看内部实现”

studio.workflow 的 contract root 是：

    backend/modules/studio/contract/workflow

当调查跨模块调用、公开类型或消费者行为时，Agent 需要同时检查 contract，而不能只修改 internal 下最容易改到的代码。如果探索过程中发现新的跨域依赖，例如 Workflow 调用 Knowledge contract，再以这个明确问题扩展上下文。

### verification：定义“什么证据才能支持完成”

verification 是这次任务的**证据责任清单**：任务结束前，至少需要取得哪些证据，才能支持“已经完成”这个结论。

它输出的是稳定 ID，而不是一串永远不变的命令。例如：

    backend_tests
    acceptance_tests

ID 只声明“欠哪类证据”，验证矩阵再根据改动位置和影响面，把它解释成实际检查。`backend_tests` 通常从受影响的 Go tests 开始；如果改到了共享 wiring，再扩大到 build、vet 和更完整的测试。`acceptance_tests` 则要求把用户可观察行为追溯到 accepted SPEC criteria 或真实验收结果。

这里要区分五个常见的证据层级：

| 证据层级 | 它回答的问题 | 常见证据 | 证明边界 |
|---|---|---|---|
| focused | 被修改的局部机制是否正确 | 单元测试、针对缺陷的回归测试 | 只证明被直接覆盖的函数、状态变化或错误分支 |
| contract | 对外边界是否仍然一致 | 路由、OpenAPI、公开类型、Schema、事件格式的检查 | 证明生产者没有破坏约定，不证明消费者真的可用 |
| consumer | 使用这个边界的调用方是否仍能工作 | 下游模块测试、生成客户端检查、前端调用测试 | 证明已检查的消费者能适配，不证明完整运行链路成立 |
| integration | 多个真实组件连接后是否正常 | 真实数据库、队列、服务装配或跨模块集成测试 | 证明组件协作与副作用，不一定覆盖最终用户场景 |
| acceptance | 用户原来失败的行为是否已经恢复 | 对照 SPEC 的验收、稳定复现回放、必要时的真实浏览器或 E2E | 直接支持用户目标是否完成 |

这不是要求每个任务机械地跑满五层。验证从能够直接证明改动的最小证据开始；只有当改动触及共享 contract、consumer、wiring 或真实副作用时，才继续扩大。反过来，低层证据也不能代替高层结论：函数测试通过，只能证明局部机制成立，不能自动推出用户流程已经恢复。

仍以 Workflow 知识库检索故障为例，Route 得到：

    verification:
      backend_tests
      acceptance_tests

`backend_tests` 要证明两项修复机制：跨域调用使用了正确的身份，以及每次运行前清除了旧的 session cache。对应的 focused regression tests 通过后，可以说这两个代码机制已经被固定下来。

但用户遇到的是“工作流试运行失败”。只有重新执行这条真实流程，确认知识库检索成功，才能取得 acceptance evidence。第一层通过、最后一层未运行时，准确结论应是“局部修复已验证，用户场景尚未验收”，而不是“问题已解决”。真实浏览器或 E2E 也不会因为出现 `acceptance_tests` 就自动获得授权；只有用户明确要求，或者该集成副作用无法由更小证据证明时，才进入这一层。

同一个任务命中多个 lane 或 condition 时，verification 会合并去重。例如 backend + contract + data 会同时带来局部测试、契约一致性、消费者验证以及 schema/codegen 检查，而不会因为数组中重复出现 backend_tests 就执行多份相同要求。

因此，Route 产生 verification，只是确定“还欠哪些证据”；Execute 负责真正取得证据；Review 再判断这些证据是否足以支持完成。verification 本身不表示检查已经执行，更不表示任务已经通过。

### human gates：暴露“需要谁决定”

human gate 不是验证步骤，而是决策边界。例如：

- schema_change 可能要求确认 migration apply 和数据影响；
- security policy change 需要确认预期授权边界；
- production deployment 需要确认目标环境、时机和回滚；
- breaking contract 需要确认兼容性取舍。

gate 只在相应 condition 确实成立时出现。普通后端缺陷如果没有契约、数据或策略变化，human gates 可以为空；不能因为任务看起来复杂就自动增加审批。

### “确定性合并”具体是什么意思

这里的“确定性”有一个明确边界：Agent 仍要根据用户目标和当前事实，显式选择 `lane`、`domain` 和已经成立的 `condition`；一旦这三个输入确定，后续不再由模型临场发挥，而是由工具按配置查表、合并和去重。

    人负责识别任务事实
            ↓
    lane + domain + condition
            ↓
    工具按配置机械展开
            ↓
    最小行动包

因此，它解决的不是“自动理解所有任务”，而是“相同任务分类不要因为 Agent 不同而读取不同资料、遗漏不同验证”。

#### task-routing.yaml 管什么

`task-routing.yaml` 把交付规则拆成五类配置。下面只保留本案例相关的内容：

```yaml
common:
  required_docs: [docs/start-here/task-routing.md]
  discovery:
    [inventory_target_paths, read_nearest_agents,
     locate_owning_source, locate_neighbor_tests]
  verification: []
  human_gates: []

lanes:
  backend:
    required_docs: [docs/guides/development/standards/backend.md]
    discovery: [go_module, composition_root, owning_package, neighbor_tests]
    verification: [backend_tests]
    human_gates: []

conditions:
  observable_behavior_change:
    docs: [docs/specifications/index.md]
    verification: [acceptance_tests]

verifications:
  backend_tests: Run affected Go tests with repository flags; expand to build/vet for shared wiring.
  acceptance_tests: Trace changed observable behavior to accepted SPEC criteria and tests.
```

- `common` 是所有任务共享的起点，例如路由说明和最基本的探索动作。
- `lanes` 按改动类型提供工程规则。选择 `backend`，不是在说根因一定在后端，而是在声明这次需要以后端交付方式调查和验证。
- `conditions` 表示本次已经确认成立的风险事实。它们只追加要求，不取代 lane。用户可观察行为发生变化，就追加 SPEC 入口和 acceptance evidence。
- `verifications` 是稳定 ID 的解释表。lane 和 condition 只引用 ID，具体含义集中维护，避免每个分支重复写一遍。
- `human_gates` 与 verifications 类似，集中定义必须由人确认的决策。只有 lane 或 condition 引用了某个 gate，它才进入本次行动包。

文件顶部的 `schema_version`、`owner`、`project` 用于配置治理；`log` 和 `delivery_log` 定义路由事件及交付摘要写到哪里。它们不参与“该读什么、该验证什么”的计算。

#### domain 为什么不写在 task-routing.yaml 中

lane 回答“按哪种工程方式工作”，domain 回答“谁拥有这块业务事实和代码”。这两类信息的变化节奏不同，所以 domain 来自独立的 `docs/domains/registry.yaml`：

```yaml
- id: studio.workflow
  code_path: backend/modules/studio/internal/core/workflow
  contract_path: backend/modules/studio/contract/workflow
  document: docs/domains/studio/workflow.md
  owner: studio-workflow
```

这条记录提供三个稳定入口：领域文档、当前源码根目录和公开 contract 根目录。路由工具不会在全仓库里猜 Workflow 可能在哪，也不会把 `internal` 下最先搜到的文件误当成完整边界。

#### 工具如何一步步合并

本案例显式输入：

```text
lane:      backend
domain:    studio.workflow
condition: observable_behavior_change
```

工具内部先创建几个空列表：

```text
documents / code_roots / contract_roots / discovery
verification / human_gates
```

然后按固定顺序处理：

1. **校验输入。** `backend` 必须存在于 `lanes`，`studio.workflow` 必须存在于 Domain Registry，condition 也必须是已声明名称。拼错或引用不存在的项会直接失败，而不是悄悄忽略。
2. **合并 common。** 加入所有任务都要读取的 `docs/start-here/task-routing.md`，以及 inventory、读取邻近 AGENTS、定位 owner 和测试等基础探索动作。
3. **合并 lane。** `backend` 追加后端开发标准、Go module、composition root、owning package、neighbor tests，以及 `backend_tests`。
4. **合并 condition。** `observable_behavior_change` 追加 SPEC 索引和 `acceptance_tests`。它没有声明 human gate，因此不会凭空产生审批。
5. **合并 domain。** `studio.workflow` 从 Domain Registry 追加 Workflow owner 文档、code root 和 contract root。
6. **计算 instructions。** 工具沿 code root 和 contract root 从仓库根目录向下寻找真实存在的 `AGENTS.md`，得到根、backend、modules 三级指令链。这一步基于文件层级计算，不是在 YAML 里手工复制路径。
7. **补全解释。** 工具用 `verifications` 和 `human_gates` 字典，把稳定 ID 展开成可读说明。

所有数组都使用“保留第一次出现顺序的去重合并”。例如选择 `data` lane 并同时命中 `schema_change` condition 时，两处都会提供 `schema_and_codegen`，最终只保留一项证据责任。

这个过程可以写成一组简单的集合关系：

```text
documents
  = common.required_docs
  + lanes.backend.required_docs
  + conditions.observable_behavior_change.docs
  + domains.studio.workflow.document

verification
  = common.verification
  + lanes.backend.verification
  + conditions.observable_behavior_change.verification

code_roots / contract_roots
  = domains.studio.workflow.code_path / contract_path
```

最终得到的核心输出是：

```text
instructions:
  AGENTS.md
  backend/AGENTS.md
  backend/modules/AGENTS.md

documents:
  docs/start-here/task-routing.md
  docs/guides/development/standards/backend.md
  docs/specifications/index.md
  docs/domains/studio/workflow.md

code_roots:
  backend/modules/studio/internal/core/workflow

contract_roots:
  backend/modules/studio/contract/workflow

verification:
  backend_tests
  acceptance_tests

human_gates: none
```

每一项都能反查来源：后端标准和 `backend_tests` 来自 backend lane；SPEC 索引和 `acceptance_tests` 来自 observable condition；Workflow 文档和两个代码入口来自 Domain Registry；AGENTS 链来自这些路径的真实目录层级。所谓“确定性”，就是同样的输入、同一版本的配置和目录结构，必然得到同样的行动包。每次运行生成的 `route_id` 和时间戳属于审计元数据，本来就会不同，不影响路由内容的确定性。

#### 配置与 Agent 各自负责什么

路由配置只负责**缩小正确的调查空间并声明证据责任**，不负责给出根因。它不会从 `identity reference is invalid` 推导出“session 被 ctx cache 遮蔽”，也不会决定具体修改哪个函数。

拿到行动包后，Agent 才进入 Explore：从 code root 搜索当前实现，遇到跨域调用时检查 contract root，围绕明确问题按需读取 owner docs，并用 verification 判断最后还欠哪层证据。这样既保留了复杂问题需要的推理空间，又把容易遗漏的入口、边界和验证变成了机械约束。

### 2. Skill 约束的是证据责任

我把交付过程分成四个阶段：

| 阶段 | 必须回答的问题 |
|---|---|
| Explore | 当前事实支持哪些假设，什么证据可以推翻它 |
| Implement | 真正的 owner 在哪里，哪些边界保持不变 |
| Verify | 每层验证证明了什么，还有什么没有证明 |
| Close | 哪些完成了、哪些未运行、还剩什么风险 |

验证通常从 focused test 开始，再根据缺口扩大到 contract、consumer、integration 或真实浏览器。

这不是要求每个任务都跑完整测试链，而是要求结论和证据处在同一层：单测通过只能证明局部逻辑，不能自动证明用户路径恢复。

Human gate 也只在真实的高影响事实成立时触发，例如公开契约破坏、schema apply、数据删除、安全策略变化或生产部署。如果这些事实没有发生，gate 可以是 none。

## 三、案例：Skill + docs 如何完成一次工作流故障交付

前两章分别说明了 docs 如何管理事实、Skill 如何管理执行。下面只重写案例：沿一次真实任务的完整生命周期，观察每个阶段读取了什么、记录了什么，以及什么证据推动任务进入下一步。

### 1. 定界：先把用户报错改写成工程任务

用户在工作流画布中试运行一个简单流程：

    开始节点 → Dataset 知识库检索节点

开始节点成功，Dataset 节点稳定失败：

    Workflow execution failure:
    identity reference is invalid

    executeStatus = 3
    Dataset nodeStatus = 4

错误看起来像登录失效、权限配置错误或 dataset 配置错误，但这些都只是初始猜测。

Skill 在开始阶段要求先写清目标、不变项和验收证据。

**目标**

让 Dataset 节点以当前执行人的身份完成知识库检索。

**不变项**

- 不放宽 Knowledge 的身份校验；
- 不用 workflow creator 冒充当前执行人；
- 不改变 Workflow HTTP contract；
- 不顺手修改与检索无关的节点。

**验收证据**

- focused tests 证明身份传递和 fail-closed；
- Workflow 相关测试、build 和 vet 通过；
- 真实试运行中 Dataset 节点成功，errorInfo 为空。

这一步没有读取大量设计文档，也没有立即建立 PLAN。问题范围还不够清楚，此时最重要的是避免把“让报错消失”误写成目标。

### 2. Route：用 Skill 找到最小事实入口

任务被路由为：

    lane       backend
    domain     studio.workflow
    condition  observable_behavior_change

Route 根据 Skill 的任务矩阵和 Domain Registry，组合出：

| 类型 | 本次输出 |
|---|---|
| Instructions | 根 AGENTS、backend/AGENTS、modules/AGENTS |
| Owner docs | backend standards、Workflow domain、SPEC index |
| Code root | internal/core/workflow |
| Contract root | contract/workflow |
| Verification | backend tests、acceptance tests |
| Human gate | none |

#### 这一步读取了哪些 docs

**AGENTS 指令链**

它规定工作树检查、模块边界、测试方式和高影响动作限制。这些是路径相关、需要常驻的规则。

**Domain Registry**

它说明 studio.workflow 的 owner 是 studio-workflow，并给出代码根、contract 根和领域文档入口。

**Workflow domain 文档**

它说明 Workflow 拥有节点定义、校验和执行服务；跨模块行为必须通过公开 contract。

**Backend standards**

它提供当前 Go 模块的实施和验证约束。

#### 这一步没有读取什么

没有预读整套 IAM、安全、数据库、部署和 E2E 文档，因为当时还没有证据表明问题发生在这些边界。

这就是渐进式上下文的实际用法：Route 只给出调查起点，不预测根因，也不维护一份“可能需要修改的文件清单”。

#### Route 带来的第一个判断

实现 owner 暂定为 Workflow。即使错误来自知识库检索，也不能直接去 Knowledge 模块放宽校验。需要先证明 Workflow 发出的请求是否满足跨域 contract。

### 3. Explore：沿错误证据找到第一层根因

Explore 先搜索错误字符串，而不是继续读取背景文档。

完整追踪链是：

    identity reference is invalid
      ↓ 唯一定义
    identityref.ErrInvalidIdentifier
      ↓ 返回位置
    Knowledge contract adapter / Retrieve
      ↓ 触发条件
    parseScope(TenantID, WorkspaceID) 收到空字符串
      ↓ 上游请求
    Workflow 的 knowledge_retrieve.go

修复前的请求可以简化为：

    RetrieveRequest {
      Query:         "hi",
      KnowledgeIDs: [datasetID],
      ChatHistory:  ...,
      Strategy:     ...,

      TenantID:         "",
      WorkspaceID:      "",
      ActorPrincipalID: ""
    }

这个证据推翻了“权限配置错误”的初始猜测。请求还没有进入真正的权限判断，就因为身份引用为空被拒绝。

#### 新问题触发新的上下文

此时出现一个具体问题：

> Knowledge 为什么要求调用方显式传递这些身份字段？

为了回答它，调查才扩展到 Knowledge contract 和相关 Git history。

Knowledge contract 表明，RAG 检索必须按真实执行人做 dataset 预授权。跨域请求需要的不只是 user_id，而是一组授权事实：

| 字段 | 回答的问题 |
|---|---|
| TenantID | 数据属于哪个租户 |
| WorkspaceID | 请求发生在哪个工作空间 |
| ActorPrincipalID | 谁正在执行 |
| ActorActiveTenantID | 执行人当前使用哪个租户身份 |
| ActorAssurance | 本次登录的认证强度 |
| CredentialScopeMode | 凭证是否受限 |
| Capabilities | 受限凭证允许哪些能力 |

Git commit 9599f107 解释了这个安全要求的来源：RAG 数据集预授权需要以真实人类主体执行。该提交补齐了 agent 调用方，但遗漏了 Workflow。

Git history 只解释背景，不能证明当前影响范围。继续扫描当前代码后发现四个遗漏点：

- Dataset Retrieve；
- LLM 节点中的知识召回；
- Dataset Write；
- Dataset Delete。

作为对照，agentflow 的同类调用已经传递了完整身份。

#### Explore 阶段得到的结论

| 问题 | 结论 | 事实源 |
|---|---|---|
| 谁拥有修复 | Workflow 调用方 | Domain Registry |
| 哪个边界不能动 | Knowledge fail-closed contract | Knowledge contract |
| 为什么存在这个要求 | RAG 以人类主体预授权 | Git history |
| 当前需要修改哪里 | 四个 Workflow 调用点 | 当前代码扫描 |

第一层根因已经足够明确：安全 contract 加强后，Workflow 调用方没有同步传递身份。

### 4. 记录：在实施前建立 DEFECT 和 Resolution Plan

这个问题跨越 Workflow 与 Knowledge contract，也涉及 RAG 授权边界；同类遗漏已经出现在四个调用点，具有复发价值。因此它不只保存在聊天或提交说明中，而是建立 DEFECT-0007。

DEFECT 在实施前记录：

**用户现象**

Dataset 节点返回 identity reference is invalid。

**已确认根因**

Workflow 构造跨域请求时身份字段为空，被 Knowledge contract fail-closed 拒绝。

**实现 owner**

studio-workflow。

**最小修复**

从执行会话派生身份，并注入四个 Workflow Knowledge 调用点。

**明确拒绝的方案**

- 不放宽 Knowledge adapter 的身份校验；
- 不在 adapter 中隐式读取 session；
- 不使用 workflow creator 代替执行主体；
- 不把单个 Retrieve 修复误写成完整影响范围。

**计划验证**

身份正向传递、身份缺失负控、Workflow 测试、build、vet，以及后续 acceptance。

这一步体现了 docs 的“记录”作用：不是事后根据最终 diff 编写一个完美故事，而是在实施前固定当时准备相信什么、准备改什么、什么方案明确不接受。

### 5. Implement：在真正 owner 层补齐身份

第一轮修复增加一个统一的身份组装点。

#### Build 阶段：确定请求属于哪里

节点从 WorkflowSchema 捕获 CanonicalScope：

    CanonicalScope {
      TenantID,
      WorkspaceID
    }

CanonicalScope 表示本次 Workflow 执行所属的租户和工作空间。

#### Invoke 阶段：确定谁正在执行

节点从 request session 读取：

    PrincipalPublicID
    ActiveTenantID
    AuthAssurance
    CredentialScope.Mode
    CredentialScope.Capabilities

两部分合并后，跨域请求变为：

    RetrieveRequest {
      Query:         "hi",
      KnowledgeIDs: [datasetID],

      TenantID:                    scope.TenantID,
      WorkspaceID:                 scope.WorkspaceID,
      ActorPrincipalID:            session.PrincipalPublicID,
      ActorActiveTenantID:         session.ActiveTenantID,
      ActorAssurance:              session.AuthAssurance,
      ActorCredentialScopeMode:    session.CredentialScope.Mode,
      ActorCredentialCapabilities: session.CredentialScope.Capabilities
    }

#### 为什么身份必须显式传递

可以把这些字段理解为随业务请求传递的“授权信封”：

- Query 和 KnowledgeIDs 说明要查什么；
- CanonicalScope 说明请求属于哪里；
- session facts 说明谁在执行、凭证可信到什么程度；
- Knowledge 根据这些事实过滤当前用户可见的 dataset。

如果 Knowledge adapter 自己从 context 查 session，调用方责任会被藏进被调用方，contract 也无法明确说明它信任哪些输入。

如果使用 workflow creator，创建者和当前执行人可能不是同一个人，授权会绑定到错误主体。

因此实现只修改 Workflow 请求构造，不移动 Knowledge 的安全边界。

### 6. Verify：第一轮测试证明了什么

第一轮 focused tests 验证：

**正向行为**

- tenant 和 workspace 来自 CanonicalScope；
- principal、active tenant、assurance 和 credential scope 来自执行人 session；
- Knowledge 收到的请求明确归属于当前执行人。

**负向行为**

- 没有 session 时失败；
- assurance 无效时失败；
- credential scope 无效时失败；
- tenant 或 workspace 为空时失败；
- 身份不完整时不发起跨域调用。

Workflow 全树测试、build 和 vet 也通过。

这些证据证明：

    节点能够读取 session
      ↓
    身份组装正确
      ↓
    Knowledge 请求完整

它们没有证明：

    浏览器请求中的 session
      ↓
    穿过异步 Workflow Runner
      ↓
    Dataset Invoke 时仍然可见

Route 一开始就要求 acceptance tests，但第一轮没有运行真实浏览器 E2E。因此 Delivery Log 记录：

- focused 和 Workflow tests 已完成；
- E2E 未运行；
- 四个请求构造点已补齐身份。

问题在于，任务仍然被过早写成 completed。记录本身保留了证据缺口，但 Close 结论超过了证据。

### 7. 运行反馈：用户复测推翻第一次 Close

用户重新试运行后，错误变成：

    knowledge identity is required

这条错误来自第一轮新增的身份组装逻辑，而不是 Knowledge adapter。

它说明：

- 节点还没有发出跨域请求；
- CanonicalScope 已存在；
- Dataset Invoke 时读不到 request session；
- 第一层修复正确，但用户目标尚未恢复。

#### docs 如何记录这次推翻

原 Delivery Log 不改写，追加：

- 事后修正：第一轮完成结论过早；
- 新运行证据：knowledge identity is required；
- 后续处理：重开 Explore，调查 session 生命周期。

DEFECT-0007 也追加第二层症状和待证伪假设。

这就是 append-only 记录的意义：第一轮判断不正确，但它基于哪些证据、遗漏了什么验证，都仍然可见。

#### Skill 如何处理这次推翻

新证据使任务回到 Explore，而不是继续在身份字段上打补丁。第二轮调查的问题变成：

> HTTP middleware 写入的 session，在哪一步对 Dataset 节点变得不可见？

### 8. Explore 重开：找到第二层根因

逐环检查 session 的执行路径：

    session middleware
      ↓
    context.WithoutCancel
      ↓
    safego.Go
      ↓
    ExeCtx
      ↓
    Dataset Invoke

最初怀疑的是异步 goroutine 或 WithoutCancel 丢失了 session。但代码证据显示，context value 在这条链上一直被保留。

真正的断点在 Dataset Invoke 前：

    Dataset meta: UseCtxCache = true
      ↓
    node_runner 调用 ctxcache.Init
      ↓
    新 cache 遮蔽旧 cache 中的 session

#### context 还在，session 为什么会消失

项目没有直接把 session 作为普通 value 放在 context 中，而是先放入一个 cache map，再把 session 存入 map：

    context
      └── cache map A
            ├── session
            └── scratch data

context.WithoutCancel 保留 value，因此 map A 一直存在。

ctxcache.Init 返回一个带新 map B 的 context：

    原 context                    freshCtx
      └── cache map A               └── cache map B
            ├── session                   └── empty
            └── scratch

父 context 和 map A 没有被删除。但节点从 freshCtx 查询 cache 时先命中 map B，所以 map A 中的 session 被遮蔽。

完整机制是：

    middleware 把 session 写入 map A
      ↓
    异步链保留 map A
      ↓
    ctxcache.Init 挂载 map B
      ↓
    GetUserSessionFromCtx 从 map B 查询
      ↓
    nil

这个证据解释了复测错误，也推翻了“异步 context 丢失 session”的次级猜测。

### 9. Verify 先行：用红测定义第二轮修复

不能简单删除 ctxcache.Init。

UseCtxCache 的目的，是为每次节点调用创建独立临时缓存。如果保留整个 map A，旧 scratch data 可能泄漏到新的 invocation。

因此红测同时定义两个不变量：

| 不变量 | 原因 |
|---|---|
| request session 在 reset 后可见 | 它属于整次请求的可信执行身份 |
| reset 前的 scratch data 不可见 | 它只属于一次节点调用 |

TestUseCtxCacheNodeStillSeesRequestSession 在修复前失败：

    session shadowed
    seen = nil

这个红测把第二层根因从推断变成可重复证据。

### 10. Implement：只让 session 穿过 cache reset

第二轮修复没有保留整个旧 cache，也没有跳过 Init：

    freshCtx := ctxcache.Init(ctx)

    if session := GetUserSessionFromCtx(ctx); session != nil {
        Store(freshCtx, SessionDataKey, session)
    }

    return freshCtx

修复后的结构：

    原 context                    freshCtx
      └── cache map A               └── cache map B
            ├── session        →          └── session
            └── scratch        ✕

结果：

- request session 可以被 Dataset Invoke 读取；
- CanonicalScope 与 session facts 可以组装成身份信封；
- 旧 scratch data 仍然隔离。

红测转绿，同时负向隔离断言保持绿色。测试成为“请求级数据可以跨 reset、节点级临时数据不能跨 reset”的事实 owner。

### 11. Acceptance：补齐真实用户路径

两轮 focused tests 通过后，仍然不能直接关闭任务。还需要完成 Route 一开始要求的 acceptance evidence。

验收过程：

1. 对比后端进程启动时间与修复文件 mtime；
2. 确认运行实例尚未加载第二轮修复；
3. 重启后端；
4. 旧 Cookie 随原进程失效，通过 UI 重新登录；
5. 执行真实 test_run；
6. 轮询 Dataset 节点结果。

最终结果：

    Dataset nodeStatus = 3
    errorInfo = ""
    output = {"outputList":[]}

这条证据完整跨越：

    UI 登录
      ↓
    request session
      ↓
    Workflow 异步执行
      ↓
    cache reset 后恢复 session
      ↓
    CanonicalScope + actor facts
      ↓
    Knowledge Contract
      ↓
    RAG 预授权与检索

它证明 Dataset 节点能够以当前用户身份安全完成。

outputList 为空不是失败。它可能表示查询没有命中文档，也可能表示预授权过滤后没有可见结果。验收目标是节点安全完成，不是任何查询都必须返回非空数据。

同一次验收还暴露 End 节点处理空数组时的 arrayDrillDown 问题。它属于下游节点的独立语义，因此被记录为新问题，没有扩大当前修复范围。

### 12. Close：把结果写回 docs

最终关闭时，信息被写回三个不同 owner。

#### DEFECT-0007

保存完整因果：

- 用户现象；
- 两层根因；
- 两轮修复；
- 拒绝的捷径；
- focused、红测和浏览器证据；
- End 节点问题不在当前范围。

#### Delivery Log

按时间追加两条 route 结果：

- 第一轮做了什么、哪些验证通过、E2E 未运行；
- 事后更正为何发生；
- 第二轮红测、修复和 acceptance 结果。

Delivery Log 不复制完整根因，只保存摘要和 DEFECT 指针。

#### Test

identity tests 固定跨域身份 contract；node runner session test 固定 cache reset 的数据边界。以后相同缺陷不再依赖文档提醒，而由可执行 gate 阻止。

### 13. 回看完整流程

| 阶段 | Skill 的作用 | 读取的 docs / 事实 | 写回的记录 |
|---|---|---|---|
| 定界 | 明确目标、不变项、验收 | 用户症状、当前行为 | 暂无 |
| Route | 选择 lane、domain、verification | AGENTS、Domain Registry、Workflow domain | route start |
| Explore 1 | 从 owning source 搜索并按触发扩展 | Knowledge Contract、Git history、当前代码 | DEFECT Resolution Plan |
| Implement 1 | 修改真正 owner，拒绝捷径 | 当前 source、邻近 tests | 代码与 identity tests |
| Verify 1 | 区分 focused 与 acceptance | verification matrix | Delivery Log：E2E 未运行 |
| 运行反馈 | 新证据触发重开 | 用户复测结果 | append-only 更正 |
| Explore 2 | 调查 session 生命周期 | node runner、ctx cache | DEFECT 追加第二层根因 |
| Verify / Implement 2 | 红测定义修复边界 | 当前代码与测试 | session regression test |
| Acceptance | 补齐集成副作用证据 | 运行环境、真实浏览器 | DEFECT 验收记录 |
| Close | 分离根因、摘要和机械约束 | 全部已验证证据 | DEFECT、Log、Test |

这条流程里，docs 既不是任务开始时一次读完的背景材料，也不是任务结束后补写的总结。

它在任务中持续发生两种动作：

    读取 owner 和边界
      ↓
    Skill 推进下一阶段
      ↓
    代码、测试、运行产生新证据
      ↓
    将稳定结论写回正确 owner
      ↓
    下一轮任务从更好的事实起点开始

这就是我理解的 Skill + docs：Skill 管理执行节奏，docs 管理事实的读取和沉淀，测试与运行证据决定哪些结论能够成立。
