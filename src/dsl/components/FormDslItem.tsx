import { defineComponent, type PropType, h, resolveComponent, computed } from 'vue'
import { IFormCombItem, IJudgePlaceholderType, IJudgeType, IJudgeRulesType, IJudgeTypeOption } from '../types/dsl'
import { get, set } from 'lodash'
import { checkBoolean, getJudgeValue, judgeRulesHandle } from '../hooks/useRenderDsl'
import { useRemoteConfig } from '../hooks/useRemoteConfig'

const FormDslItem: any = defineComponent({
  name: 'FormDslItem',
  props: {
    item: {
      type: Object as PropType<IFormCombItem>,
      required: true,
    },
    formState: {
      type: Object as PropType<any>,
      required: true,
    },
    customComponents: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
  },
  setup(props, { slots }) {
    // 性能优化核心：将全局重算下沉到原子组件，利用 Vue 的依赖追踪实现精准更新
    const runtimeItem = computed(() => {
      const { item, formState } = props
      
      const _show = typeof item.show === 'boolean' ? item.show : checkBoolean(item.show as any[], formState, true)
      const _disabled = typeof item.disabled === 'boolean' ? item.disabled : checkBoolean(item.disabled as any[], formState, false)
      
      let _placeholder = item.placeholder as string
      if (Array.isArray(item.placeholder)) {
        // 注意：这里需要传入完整的 config，但目前 getJudgeValue 仅在 _placeholder 时用到 formConfig 查找
        // 简化处理，暂时传空数组或从 context/props 获取
        _placeholder = getJudgeValue(item.placeholder as IJudgePlaceholderType[], formState, '_placeholder', [])
      }

      let _rules: any[] = []
      if (Array.isArray(item.rules)) {
        _rules = item.rules.map(rule => {
          if (typeof rule === 'object' && 'judgeType' in rule) {
            return {
              validator: (r: any, value: any, callback: any) => {
                const isError = judgeRulesHandle(rule as IJudgeType, formState)
                if (isError) {
                  callback(new Error((rule as IJudgeRulesType)._message || '验证失败'))
                } else {
                  callback()
                }
              },
              trigger: (rule as IJudgeRulesType)._trigger || 'blur'
            }
          }
          return rule
        })
      }

      let _options = item.options as any[]
      if (typeof item.options === 'string') {
        _options = useRemoteConfig(item.options)
      } else if (Array.isArray(item.options)) {
        const dynamicOptions = getJudgeValue(item.options as IJudgeTypeOption[], formState, '_options', [], false)
        if (dynamicOptions) {
          _options = dynamicOptions
        }
      }

      return {
        ...item,
        _show,
        _disabled,
        _placeholder,
        _rules,
        _options,
      }
    })

    const renderComponent = (): any => {
      const item = runtimeItem.value
      const { is, itemKey, _placeholder, _disabled, _options, show, disabled, placeholder, rules, options, ...rest } = item
      
      const commonProps: any = {
        modelValue: get(props.formState, itemKey),
        'onUpdate:modelValue': (val: any) => {
          set(props.formState, itemKey, val)
        },
        placeholder: _placeholder,
        disabled: _disabled,
        ...rest,
      }

      // 1. 优先从传入的 customComponents 中寻找
      // 2. 否则使用 resolveComponent 寻找全局注册组件
      const component = props.customComponents[is] || (resolveComponent(is) as any)

      if (is === 'el-select') {
        return h(component, { ...commonProps, style: { width: '100%' } }, {
          default: () => _options?.map((opt: any) => h(resolveComponent('el-option'), {
            key: opt.value,
            label: opt.label,
            value: opt.value
          }))
        })
      }

      if (is === 'el-button') {
        return h(component, commonProps, {
          default: () => (item as any).text || item.label
        })
      }

      if (is === 'el-radio-group') {
        return h(component, commonProps, {
          default: () => _options?.map((opt: any) => h(resolveComponent('el-radio'), {
            key: opt.value,
            label: opt.value
          }, { default: () => opt.label }))
        })
      }

      if (is === 'el-checkbox-group') {
        return h(component, commonProps, {
          default: () => _options?.map((opt: any) => h(resolveComponent('el-checkbox'), {
            key: opt.value,
            label: opt.value
          }, { default: () => opt.label }))
        })
      }

      return h(component, commonProps)
    }

    const renderItem = (): any => {
      const item = runtimeItem.value
      if (!item._show) return null

      if (item.children && item.children.length > 0) {
        return h('div', { class: 'dsl-item-group', key: item.itemKey }, [
          item.label ? h('div', { class: 'dsl-group-title' }, item.label) : null,
          h('div', { class: 'dsl-group-content' }, 
            item.children.map((child: any) => h(FormDslItem, {
              item: child,
              formState: props.formState,
              customComponents: props.customComponents,
              key: child.itemKey
            }))
          )
        ])
      }

      return h(resolveComponent('el-form-item'), {
        label: item.label,
        prop: item.itemKey,
        rules: item._rules,
        key: item.itemKey
      }, {
        default: () => slots[item.itemKey] 
          ? slots[item.itemKey]!({ item, formState: props.formState }) 
          : renderComponent()
      })
    }

    return () => renderItem()
  },
})

export default FormDslItem
