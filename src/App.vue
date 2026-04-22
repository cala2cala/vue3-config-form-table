<template>
  <div class="demo-container">
    <h1>配置化表单 (Vue 3 + Element Plus)</h1>
    <ConfigForm
      ref="configFormRef"
      :item-configs="formConfigs"
      label-width="120px"
      @submit="handleFormSubmit"
    />

    <hr />

    <h1>配置化表格</h1>
    <ConfigTable
      :columns="tableColumns"
      :data="tableData"
      border
      stripe
      @button-click="handleTableButtonClick"
    >
      <!-- Custom slot example -->
      <template #status="{ row }">
        <el-tag v-if="row?.status" :type="row.status === 'active' ? 'success' : 'info'">
          {{ row.status.toUpperCase() }}
        </el-tag>
      </template>
    </ConfigTable>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import ConfigForm from './components/ConfigForm.vue'
import ConfigTable from './components/ConfigTable.vue'
import type { CommonFormItemProps, CommonTableColumnProps } from './types'

// --- Form Configs ---
const formConfigs = reactive<CommonFormItemProps[]>([
  {
    label: '用户名',
    name: 'username',
    is: 'el-input',
    placeholder: '请输入用户名',
    rules: [{ required: true, message: '用户名必填', trigger: 'blur' }],
  },
  {
    label: '角色',
    name: 'role',
    is: 'el-select',
    options: [
      { label: '管理员', value: 'admin' },
      { label: '普通用户', value: 'user' },
    ],
    default: 'user',
  },
  {
    label: '备注',
    name: 'remark',
    is: 'el-input',
    type: 'textarea',
    show: (state: any) => state.role === 'admin', // 只有管理员才显示备注
  },
  {
    name: 'submit',
    is: 'el-button',
    type: 'primary',
    text: '提交表单',
    action: 'validate',
  },
])

const handleFormSubmit = (data: any) => {
  console.log('Form data:', data)
  alert('提交成功！请看控制台')
}

// --- Table Configs ---
const tableColumns = reactive<CommonTableColumnProps[]>([
  { label: 'ID', prop: 'id', width: 80 },
  { label: '名称', prop: 'name' },
  {
    label: '状态',
    prop: 'status',
    slots: { customRender: 'status' },
  },
  {
    label: '链接',
    prop: 'link',
    slots: {
      customRender: 'link',
      customConfig: {
        href: ({ record }: any) => `https://example.com/user/${record.id}`,
      },
    },
  },
  {
    label: '操作',
    prop: 'actions',
    width: 200,
    slots: {
      customRender: 'buttons',
      customConfig: {
        buttons: [
          { label: '编辑', value: 'edit', type: 'primary', size: 'small' },
          { label: '删除', value: 'delete', type: 'danger', size: 'small' },
        ],
      },
    },
  },
])

const tableData = ref([
  { id: 1, name: 'Alice', status: 'active', link: '主页' },
  { id: 2, name: 'Bob', status: 'inactive', link: '主页' },
  { id: 3, name: 'Charlie', status: 'active', link: '主页' },
])

const handleTableButtonClick = ({ button, record }: any) => {
  console.log(`Clicked ${button.value} on:`, record)
  alert(`你点击了 ${button.label}: ${record.name}`)
}
</script>

<style scoped>
.demo-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}
hr {
  margin: 40px 0;
}
</style>
