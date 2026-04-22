<template>
  <div class="demo-container">
    <h1>DSL V2 配置化表单 (Vue 3 + Element Plus)</h1>
    <div class="demo-section">
      <FormDsl
        ref="formDslRef"
        :form-config="formConfig"
        :form-state="formState"
        label-width="120px"
      />
      
      <div class="actions">
        <el-button type="primary" @click="handleValidate">校验表单</el-button>
        <el-button @click="handleReset">重置表单</el-button>
      </div>
    </div>

    <div class="state-display">
      <h3>当前表单数据 (Form State):</h3>
      <pre>{{ JSON.stringify(formState, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import FormDsl from './dsl/components/FormDsl.vue'
import { IFormCombItem, IJudgeOperate } from './dsl/types/dsl'
import { ElMessage } from 'element-plus'

const formState = reactive<any>({
  username: '',
  role: 'user',
  age: 20,
  hobbies: [],
  dynamic_input: '',
  permission: false,
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
  max-width: 800px;
  margin: 0 auto;
  font-family: sans-serif;
}
.demo-section {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
.actions {
  margin-top: 24px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}
.state-display {
  margin-top: 40px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}
pre {
  background: #272822;
  color: #f8f8f2;
  padding: 15px;
  border-radius: 4px;
  overflow: auto;
}
</style>
