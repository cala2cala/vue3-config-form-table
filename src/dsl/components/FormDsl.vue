<template>
  <el-form
    ref="formRef"
    :model="formState"
    v-bind="$attrs"
  >
    <FormDslItem
      v-for="item in formConfig"
      :key="item.itemKey"
      :item="item"
      :form-state="formState"
      :custom-components="resolvedComponents"
      @link-validate="handleLinkValidate"
    >
      <template
        v-for="(_, name) in $slots"
        #[name]="scope"
      >
        <slot
          :name="name"
          v-bind="scope"
        />
      </template>
    </FormDslItem>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, watch, computed, type PropType } from 'vue'
import type { FormInstance } from 'element-plus'
import FormDslItem from './FormDslItem'
import { IFormCombItem } from '../types/dsl'
import { discoverComponents } from '../utils/components'

const props = defineProps({
  formConfig: {
    type: Array as PropType<IFormCombItem[]>,
    required: true,
  },
  formState: {
    type: Object as PropType<any>,
    required: true,
  },
  customComponents: {
    type: Object as PropType<Record<string, any> | undefined>,
    default: undefined,
  },
})

const formRef = ref<FormInstance>()

// 优先使用传入的组件，未传入时自动从 components 目录发现
const resolvedComponents = computed(() => {
  if (props.customComponents && Object.keys(props.customComponents).length > 0) {
    return props.customComponents
  }
  return discoverComponents()
})

// --- linkValidateKey 功能实现 ---
// 响应子组件触发的关联验证
const handleLinkValidate = (linkKeys: string[]) => {
  linkKeys.forEach(linkKey => {
    formRef.value?.validateField(linkKey).catch(() => {
      // 忽略验证失败，仅触发显示
    })
  })
}
// -----------------------------

const validate = async () => {
  if (!formRef.value) return
  return await formRef.value.validate()
}

const resetFields = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}

defineExpose({
  formRef,
  validate,
  resetFields,
})
</script>

<style scoped>
.dsl-item-group {
  margin-bottom: 20px;
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 4px;
}
.dsl-group-title {
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #f0f0f0;
}
</style>
