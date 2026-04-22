<template>
  <el-form
    ref="formRef"
    :model="formState"
    v-bind="$attrs"
  >
    <template
      v-for="(item, index) in itemConfigs"
      :key="index"
    >
      <el-form-item
        v-if="itemShow(item)"
        v-bind="filterFormItemProps(item)"
        :prop="item.name"
      >
        <template #label v-if="item.label">
          {{ item.label }}
        </template>
        
        <!-- Button -->
        <template v-if="item.is === 'el-button'">
          <el-button
            v-bind="filterProps(item)"
            @click="handleClick(item)"
          >
            {{ item.text || item.label }}
          </el-button>
        </template>

        <!-- Select -->
        <template v-else-if="item.is === 'el-select'">
          <el-select
            v-model="formState[item.name]"
            v-bind="filterProps(item)"
            style="width: 100%"
          >
            <el-option
              v-for="option in item.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </template>

        <!-- Date Range -->
        <template v-else-if="item.is === 'el-date-picker' && item.type === 'daterange'">
          <el-date-picker
            v-model="formState[item.name]"
            v-bind="filterProps(item)"
            type="daterange"
          />
        </template>

        <!-- Radio -->
        <template v-else-if="item.is === 'el-radio-group'">
          <el-radio-group
            v-model="formState[item.name]"
            v-bind="filterProps(item)"
          >
            <el-radio
              v-for="option in item.options"
              :key="option.value"
              :label="option.value"
            >
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </template>

        <!-- Default Component (Input, etc.) -->
        <template v-else>
          <component
            :is="item.is"
            v-model="formState[item.name]"
            v-bind="filterProps(item)"
          >
            <slot
              :name="item.name"
              :item="item"
            />
          </component>
        </template>
      </el-form-item>
    </template>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref, onBeforeMount, watch, type PropType } from 'vue'
import type { FormInstance } from 'element-plus'
import type { CommonFormItemProps, CommonFormButtonProps } from '../types'

const props = defineProps({
  itemConfigs: {
    type: Array as PropType<CommonFormItemProps[]>,
    required: true,
  },
  reserveLastFormItemValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'submit-fail'])

const formRef = ref<FormInstance>()
const formState = reactive<Record<string, any>>({})

const itemShow = (item: CommonFormItemProps) => {
  if (typeof item.show === 'function') {
    return item.show(formState)
  }
  return item.show === undefined || item.show === true
}

const itemDefault = (item: CommonFormItemProps) => item.default ?? ''

// 初始化默认值
onBeforeMount(() => {
  props.itemConfigs.forEach(item => {
    if (item.name && itemShow(item)) {
      formState[item.name] = itemDefault(item)
    }
  })
})

// 监听配置变化
watch(
  () => props.itemConfigs,
  (configs, prevConfigs) => {
    configs.forEach(item => {
      if (item.name && itemShow(item)) {
        const prevConfig = prevConfigs?.find(config => config.name === item.name)
        const defaultVal = itemDefault(item)
        const prevDefaultVal = prevConfig ? itemDefault(prevConfig) : undefined
        
        if (JSON.stringify(defaultVal) !== JSON.stringify(prevDefaultVal)) {
          formState[item.name] = defaultVal
        }
      }
      
      if (item.name && !itemShow(item) && !props.reserveLastFormItemValue) {
        delete formState[item.name]
      }
    })
  },
  { deep: true }
)

const validate = async (itemConfig: CommonFormButtonProps) => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    // 只提交显示的字段
    const validateFormState: Record<string, any> = {}
    props.itemConfigs.forEach(item => {
      if (item.name && itemShow(item)) {
        validateFormState[item.name] = formState[item.name]
      }
    })
    
    if (itemConfig.onClick) {
      itemConfig.onClick(validateFormState)
    }
    emit('submit', validateFormState)
  } catch (error) {
    console.error('Validate error:', error)
    emit('submit-fail', error)
  }
}

const handleClick = (item: CommonFormButtonProps) => {
  if (item.action === 'validate') {
    validate(item)
  } else if (item.onClick) {
    item.onClick(formState)
  }
}

const filterFormItemProps = (item: CommonFormItemProps) => {
  const { is, show, default: def, options, rules, ...rest } = item
  return { ...rest, rules }
}

const filterProps = (item: CommonFormItemProps) => {
  const { is, show, default: def, options, rules, label, ...rest } = item
  return rest
}

defineExpose({
  formRef,
  formState,
  validate: (itemConfig: CommonFormButtonProps) => validate(itemConfig)
})
</script>
