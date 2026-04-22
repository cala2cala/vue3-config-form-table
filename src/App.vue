<template>
  <div class="demo-container">
    <h1>DSL V2 配置化表单 (Vue 3 + Element Plus)</h1>
    <div class="demo-layout">
      <div class="demo-section">
        <FormDsl
          ref="formDslRef"
          :form-config="formConfig"
          :form-state="formState"
          :custom-components="customComponents"
          label-width="120px"
        />
        
        <div class="actions">
          <el-button type="primary" @click="handleValidate">校验表单</el-button>
          <el-button @click="handleReset">重置表单</el-button>
        </div>
      </div>

      <div class="data-section">
        <div class="state-display">
          <h3>1. 表单配置 (Form Config):</h3>
          <p class="desc">修改此配置即可改变左侧表单的渲染逻辑</p>
          <pre>{{ JSON.stringify(formConfig, null, 2) }}</pre>
        </div>

        <div class="state-display">
          <h3>2. 当前数据 (Form State):</h3>
          <p class="desc">输入左侧表单，此处数据会实时响应（包含嵌套绑定）</p>
          <pre>{{ JSON.stringify(formState, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import FormDsl from './dsl/components/FormDsl.vue'
import { IFormCombItem, IJudgeOperate } from './dsl/types/dsl'
import { ElMessage } from 'element-plus'
import { discoverComponents } from './dsl/utils/components'

// 不传入时，FormDsl 内部会自动从 components 目录发现组件
// 如需手动控制，可传入: const customComponents = { CommonLink: defineComponent(...) }
const customComponents = discoverComponents()

const formState = reactive<any>({
  username: '',
  role: 'user',
  age: 20,
  hobbies: [],
  dynamic_input: '',
  permission: false,
  password: '',
  confirm_password: '',
  nested: {
    level2: ''
  }
})

const formConfig: IFormCombItem[] = [
  {
    label: '基础信息',
    itemKey: 'group1',
    is: 'div', // 容器类型
    children: [
      {
        label: '用户名',
        itemKey: 'username',
        is: 'el-input',
        placeholder: '请输入用户名',
        rules: [{ required: true, message: '用户名不能为空', trigger: 'blur' }]
      },
      {
        label: '角色',
        itemKey: 'role',
        is: 'el-select',
        options: [
          { label: '管理员', value: 'admin' },
          { label: '开发者', value: 'developer' },
          { label: '普通用户', value: 'user' }
        ]
      },
      {
        label: '外部链接',
        itemKey: 'link',
        is: 'CommonLink',
        text: '访问 Vue.js 官网',
        href: 'https://vuejs.org',
        target: '_blank'
      }
    ]
  },
  {
    label: '动态设置',
    itemKey: 'group2',
    is: 'div',
    children: [
      {
        label: '年龄',
        itemKey: 'age',
        is: 'el-input-number',
        min: 0,
        max: 100
      },
      {
        label: '特殊权限',
        itemKey: 'permission',
        is: 'el-switch',
        // 只有管理员能看到这个开关
        show: [
          {
            judgeFrom: 'role',
            judgeType: IJudgeOperate.equal,
            judgeValue: 'admin'
          }
        ]
      },
      {
        label: '动态提示',
        itemKey: 'dynamic_input',
        is: 'el-input',
        // 根据年龄动态改变 placeholder
        placeholder: [
          {
            judgeFrom: 'age',
            judgeType: IJudgeOperate.gte,
            judgeValue: 18,
            _placeholder: '你已成年，请输入成年人专属内容'
          },
          {
            judgeFrom: 'age',
            judgeType: IJudgeOperate.lt,
            judgeValue: 18,
            _placeholder: '未成年人请在监护人陪同下输入'
          }
        ]
      }
    ]
  },
  {
    label: '嵌套数据测试',
    itemKey: 'nested_group',
    is: 'div',
    children: [
      {
        label: '二级字段',
        itemKey: 'nested.level2', // 支持点语法
        is: 'el-input',
        placeholder: '测试嵌套字段绑定'
      }
    ]
  },
  {
    label: '关联验证测试',
    itemKey: 'link_group',
    is: 'div',
    children: [
      {
        label: '密码',
        itemKey: 'password',
        is: 'el-input',
        type: 'password',
        placeholder: '修改我会触发确认密码的验证',
        linkValidateKey: ['confirm_password']
      },
      {
        label: '确认密码',
        itemKey: 'confirm_password',
        is: 'el-input',
        type: 'password',
        placeholder: '我会根据密码的变化自动校验',
        rules: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          {
            judgeFrom: 'confirm_password',
            judgeType: IJudgeOperate.notequal,
            judgeValue: '${password}',
            _message: '两次输入密码不一致',
            _trigger: 'blur'
          }
        ]
      }
    ]
  }
]

const formDslRef = ref()

const handleValidate = async () => {
  try {
    await formDslRef.value.validate()
    ElMessage.success('校验通过！')
    console.log('Final State:', toRaw(formState))
  } catch (error) {
    ElMessage.error('校验失败，请检查输入')
  }
}

const handleReset = () => {
  formDslRef.value.resetFields()
}

import { toRaw } from 'vue'
</script>

<style scoped>
.demo-container {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: sans-serif;
}
.demo-layout {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}
.demo-section {
  flex: 1;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  position: sticky;
  top: 40px;
}
.data-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.actions {
  margin-top: 24px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}
.state-display {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}
.state-display h3 {
  margin-top: 0;
  color: #333;
}
.desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
}
pre {
  background: #272822;
  color: #f8f8f2;
  padding: 15px;
  border-radius: 4px;
  overflow: auto;
  max-height: 500px;
  font-size: 12px;
  line-height: 1.5;
}
</style>
