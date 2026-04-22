import { computed, toRaw, isProxy } from 'vue'
import { get, cloneDeep } from 'lodash'
import { checkBoolean, getJudgeValue, replaceData, judgeRulesHandle } from './useRenderDsl'
import { useRemoteConfig } from './useRemoteConfig'
import {
  IFormCombItem,
  IDslFormItemRuntime,
  IJudgeRulesType,
  IJudgeTypeOption,
  IJudgePlaceholderType,
  IJudgeType,
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

        let _rules: any[] = []
        if (Array.isArray(item.rules)) {
          _rules = item.rules.map(rule => {
            // 如果规则中包含 judgeType，说明是一个声明式的校验规则
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
            // 否则视为普通的 Element Plus 校验规则（如 { required: true }）
            return rule
          })
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
