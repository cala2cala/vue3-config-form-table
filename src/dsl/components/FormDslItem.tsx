import { defineComponent, type PropType, h, resolveComponent } from 'vue'
import { IDslFormItemRuntime } from '../types/dsl'
import { get, set } from 'lodash'

const FormDslItem = defineComponent({
  name: 'FormDslItem',
  props: {
    item: {
      type: Object as PropType<IDslFormItemRuntime>,
      required: true,
    },
    formState: {
      type: Object as PropType<any>,
      required: true,
    },
  },
  setup(props, { slots }) {
    const renderComponent = (item: IDslFormItemRuntime) => {
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

      const component = resolveComponent(is) as any

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
          default: () => item.text || item.label
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

    const renderItem = (item: IDslFormItemRuntime): any => {
      if (!item._show) return null

      if (item.children && item.children.length > 0) {
        return h('div', { class: 'dsl-item-group', key: item.itemKey }, [
          item.label ? h('div', { class: 'dsl-group-title' }, item.label) : null,
          h('div', { class: 'dsl-group-content' }, 
            item.children.map((child: any) => h(FormDslItem, {
              item: child,
              formState: props.formState,
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
          : renderComponent(item)
      })
    }

    return () => renderItem(props.item)
  },
})

export default FormDslItem
