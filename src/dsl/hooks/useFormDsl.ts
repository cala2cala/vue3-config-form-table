import { computed, toRaw, isProxy } from 'vue'
import { get, cloneDeep } from 'lodash'
import { checkBoolean, getJudgeValue, replaceData } from './useRenderDsl'
import { useRemoteConfig } from './useRemoteConfig'
import {
  IFormCombItem,
  IDslFormItemRuntime,
  IJudgeRulesType,
  IJudgeTypeOption,
  IJudgePlaceholderType,
} from '../types/dsl'

export const useFormDsl = (formConfig: IFormCombItem[], formState: any) => {
  const dslForm = computed(() => {
    const renderDsl = (config: IFormCombItem[]): IDslFormItemRuntime[] => {
      return config.map((item) => {
        const _show = typeof item.show === 'boolean' ? item.show : checkBoolean(item.show as any[], formState, true)
        const _disabled = typeof item.disabled === 'boolean' ? item.disabled : checkBoolean(item.disabled as any[], formState, false)
        
        let _placeholder = item.placeholder as string
        if (Array.isArray(item.placeholder)) {
          _placeholder = getJudgeValue(item.placeholder as IJudgePlaceholderType[], formState, '_placeholder', formConfig)
        }

        let _rules = item.rules as any[]
        if (Array.isArray(item.rules)) {
          const dynamicRule = getJudgeValue(item.rules as IJudgeRulesType[], formState, '_message', formConfig)
          if (dynamicRule) {
            _rules = [{ required: true, message: dynamicRule, trigger: 'blur' }]
          }
        }

        let _options = item.options as any[]
        if (typeof item.options === 'string') {
          _options = useRemoteConfig(item.options)
        } else if (Array.isArray(item.options)) {
          const dynamicOptions = getJudgeValue(item.options as IJudgeTypeOption[], formState, '_options', formConfig, false)
          if (dynamicOptions) {
            _options = dynamicOptions
          }
        }

        const children = item.children ? renderDsl(item.children) : undefined

        return {
          ...item,
          _show,
          _disabled,
          _placeholder,
          _rules,
          _options,
          children,
        } as IDslFormItemRuntime
      })
    }
    return renderDsl(formConfig)
  })

  return {
    dslForm,
  }
}
