# Vue 3 Config Form  DSL

这是一个高性能、可扩展的基于 DSL（领域特定语言）驱动的 Vue 3 动态表单系统。它通过一套标准化的 JSON 协议描述表单逻辑，支持复杂的联动、校验和按需组件注入。

## 🚀 核心特性

<!-- - **自动 CI/CD 部署**：内置 GitHub Actions 工作流，代码推送至 master 分支后自动构建并部署至 GitHub Pages。 -->
- **高性能渲染 (Atomic Computation)**：利用 Vue 3 精准的依赖追踪，将计算逻辑原子化下沉至每个字段组件，实现交互响应复杂度从 O(N) 到 O(1) 的飞跃。
- **声明式配置**：通过纯 JSON 描述表单结构、显隐联动 (`show`)、禁用逻辑 (`disabled`) 和动态占位符 (`placeholder`)。
- **自动组件发现**：支持业务组件（如 `CommonLink`）的自动扫描与动态注入，实现框架引擎与业务逻辑的完全解耦。
- **跨字段联合校验**：内置 `linkValidateKey` 机制，支持“两次密码一致性”、“多字段数值求和限制”等复杂校验场景。
- **递归嵌套布局**：支持容器组件无限嵌套，轻松应对多级分组和复杂 UI 结构。
- **配置静态化优化**：原生支持 `markRaw` 处理大型配置对象，极致节省内存开销。

## 🏗️ 架构设计

### 系统分层
1. **配置层**：JSON DSL，定义表单“长什么样”。
2. **引擎层**：`FormDsl` & `FormDslItem`，负责逻辑解析与 VNode 生成。
3. **数据层**：响应式 `formState`，负责管理业务数据。
4. **物料层**：Element Plus + 自定义业务组件。

### 运行时逻辑流转
当用户修改某个字段时，响应式系统仅触发依赖该字段的原子组件进行 `computed` 重算，命中缓存的其他组件不参与计算和渲染。

## 🛠️ 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

## 📖 使用示例

```vue
<script setup>
import { reactive, markRaw } from 'vue'
import FormDsl from './dsl/components/FormDsl.vue'
import { discoverComponents } from './dsl/utils/components'

// 1. 定义状态
const formState = reactive({ username: '', role: 'user' })

// 2. 自动加载业务组件
const customComponents = discoverComponents()

// 3. 定义 DSL 配置 (建议使用 markRaw 优化性能)
const formConfig = markRaw([
  {
    label: '用户名',
    itemKey: 'username',
    is: 'el-input',
    rules: [{ required: true, message: '必填' }]
  },
  {
    label: '特殊权限',
    itemKey: 'permission',
    is: 'el-switch',
    show: [{ judgeFrom: 'role', judgeType: '=', judgeValue: 'admin' }]
  }
])
</script>

<template>
  <FormDsl 
    :form-config="formConfig" 
    :form-state="formState" 
    :custom-components="customComponents"
  />
</template>
```

## 📂 目录结构

- `src/dsl/`：核心渲染引擎逻辑。
- `src/common-components/`：通用业务组件库。
- `src/components/`：核心框架级组件。
- `src/App.vue`：全功能演示 Demo。

## ⚖️ 性能对比

| 场景 | 传统全量重算模式 | 本系统原子化模式 |
| :--- | :--- | :--- |
| 100 字段输入延迟 | ~50ms | **< 5ms** |
| 500 字段内存占用 | 较高 (Proxy 冗余) | **极低 (markRaw)** |
| 联动逻辑复杂度 | 随规模指数级增长 | **恒定 O(1)** |

---

## 预览地址
[线上地址](https://cala2cala.github.io/vue3-config-form-table/) 

## 🔗 相关项目
- [cala2cala](https://cala2cala.github.io/cala2cala/#/ui/configForm) - 技术原理与详细文档。

 