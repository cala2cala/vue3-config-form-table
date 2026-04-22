import _, { get } from 'lodash'
import { isProxy, toRaw } from 'vue'
import { isObject } from '../utils/tools'
import {
  IJudgeOperate,
  IJudgeType,
  IJudgePlaceholderType,
  IJudgeTypeOption,
  IJudgeRulesType,
  IRulesType,
  IObj,
} from '../types/dsl'

export const replaceData = (origin: string, modalValue: any, tag = '', reg = /\$\{([^}]+)\}/g) => origin.replace(reg, (match, p1): string => {
  const newData = modalValue[p1] ?? ''
  return tag ? `<${tag} style="color: #3a64ff;">${newData}</${tag}>` : newData
})

export const existJudge = (fromValue: (string | number | IObj)[] | IObj, judgeValue: any[] = [null, undefined, '']): boolean => {
  if (Array.isArray(fromValue)) {
    if (fromValue.length === 0) {
      return true
    }
    return fromValue.some((item): boolean => {
      if (Array.isArray(item) || isObject(item)) {
        return existJudge(item as any[] | IObj, judgeValue)
      }
      if (judgeValue.indexOf(item) !== -1) {
        return true
      }
      return false
    })
  } if (isObject(fromValue)) {
    return Object.keys(fromValue).some((key): boolean => {
      const item = fromValue[key]
      if (judgeValue.indexOf(item) !== -1) {
        return true
      }
      return false
    })
  }
  return judgeValue.indexOf(fromValue) > -1
}

const judgeHandle = (fromValue: any, judgeType: IJudgeOperate, judgeValue: any): boolean => {
  let res = false
  switch (judgeType) {
    case IJudgeOperate.equal: {
      if (judgeValue === '' || judgeValue === null || judgeValue === undefined) {
        res = fromValue === false
      } else {
        res = fromValue === judgeValue
      }
      break
    }
    case IJudgeOperate.notequal:
      res = fromValue !== judgeValue
      break
    case IJudgeOperate.regExp: {
      if (Array.isArray(fromValue)) {
        fromValue.forEach(item => {
          if (res || item == null) return
          const re = new RegExp(String(judgeValue))
          res = re.test(item as string)
        })
      } else {
        const re = new RegExp(String(judgeValue))
        res = re.test(fromValue as string)
      }
      break
    }
    case IJudgeOperate.notregExp: {
      if (Array.isArray(fromValue)) {
        fromValue.forEach(item => {
          if (res || item == null) return
          const re = new RegExp(String(judgeValue))
          res = !re.test(item as string)
        })
      } else {
        const re = new RegExp(String(judgeValue))
        res = !re.test(fromValue as string)
      }
      break
    }
    case IJudgeOperate.gt:
      res = Array.isArray(fromValue) ? fromValue.some(item => parseFloat(item) > parseFloat(judgeValue)) : parseFloat(fromValue) > parseFloat(judgeValue)
      break
    case IJudgeOperate.gte:
      res = Array.isArray(fromValue) ? fromValue.some(item => parseFloat(item) >= parseFloat(judgeValue)) : parseFloat(fromValue) >= parseFloat(judgeValue)
      break
    case IJudgeOperate.lt:
      res = Array.isArray(fromValue) ? fromValue.some(item => parseFloat(item) < parseFloat(judgeValue)) : parseFloat(fromValue) < parseFloat(judgeValue)
      break
    case IJudgeOperate.lte:
      res = Array.isArray(fromValue) ? fromValue.some(item => parseFloat(item) <= parseFloat(judgeValue)) : parseFloat(fromValue) <= parseFloat(judgeValue)
      break
    case IJudgeOperate.in:
      res = Array.isArray(fromValue) ? fromValue.some(item => (judgeValue as any[]).indexOf(item) > -1) : (judgeValue as any[]).indexOf(fromValue) > -1
      break
    case IJudgeOperate.notIn:
      res = (judgeValue as any[]).indexOf(fromValue) === -1
      break
    case IJudgeOperate.between:
      res = Number(fromValue) >= judgeValue[0] && Number(fromValue) <= judgeValue[1]
      break
    case IJudgeOperate.notBetween:
      if (Array.isArray(fromValue)) {
        const [fromLeft = 0, fromRight = 0] = fromValue
        const left = fromLeft ? parseInt(fromLeft, 10) : -1
        const right = fromRight ? parseInt(fromRight, 10) : -1
        if (left !== -1 || right !== -1) {
          if (left < judgeValue[0] || left > judgeValue[1] || right > judgeValue[1] || right < judgeValue[0] || right < left) {
            res = true
          }
        }
      } else if (Number.isNaN(Number(fromValue)) || Number(fromValue) < judgeValue[0] || Number(fromValue) > judgeValue[1]) {
        res = true
      }
      break
    case IJudgeOperate.lengthGt:
      if (Array.isArray(fromValue)) res = fromValue.filter(item => !!item).length > judgeValue
      break
    case IJudgeOperate.lengthLt:
      if (Array.isArray(fromValue)) res = fromValue.filter(item => !!item).length < judgeValue
      break
    case IJudgeOperate.lengthNotEqual:
      if (Array.isArray(fromValue)) res = fromValue.filter(item => !!item).length !== judgeValue
      break
    case IJudgeOperate.lengthEqual:
      if (Array.isArray(fromValue)) res = fromValue.length === judgeValue
      break
    case IJudgeOperate.has:
      if (Array.isArray(fromValue)) res = fromValue.indexOf(judgeValue) > -1
      break
    case IJudgeOperate.notHas:
      if (Array.isArray(fromValue)) res = fromValue.indexOf(judgeValue) === -1
      break
    case IJudgeOperate.exist:
      res = existJudge(fromValue, judgeValue)
      break
    default:
      break
  }
  return !!res
}

export const judgeRulesHandle = (judgeRule: IJudgeType, modelValue: any, isOptional = false): boolean => {
  if (!judgeRule || !judgeRule.judgeFrom) return false
  let { judgeType, judgeFrom, judgeValue } = judgeRule as IJudgeType
  let fromValue = judgeFrom.indexOf('.') > -1 ? _.get(modelValue, judgeFrom) : modelValue[judgeFrom]
  if (typeof (judgeValue) === 'string') {
    judgeValue = replaceData(judgeValue, modelValue)
  }
  let res = false
  if (isObject(fromValue)) {
    let fromValueRes = false
    Object.keys(fromValue).forEach(fromKey => {
      if (fromValueRes) return
      fromValueRes = judgeHandle(fromValue[fromKey], judgeType, judgeValue)
    })
    res = fromValueRes
  } else if (isOptional) {
    if (!existJudge(fromValue)) {
      res = judgeHandle(fromValue, judgeType, judgeValue)
    }
  } else {
    res = judgeHandle(fromValue, judgeType, judgeValue)
  }
  return res
}

export const checkBoolean = (rules: IJudgeType[], modelValue: any, defaultValue: boolean, rulesType = IRulesType.every): boolean => {
  if (Array.isArray(rules)) {
    return rules[rulesType](judgeItem => {
      if (Array.isArray(judgeItem)) {
        return checkBoolean(judgeItem, modelValue, defaultValue, IRulesType.every)
      }
      return judgeRulesHandle(judgeItem as IJudgeType, modelValue)
    })
  }
  return defaultValue
}

export const getJudgeValue = (
  rules: (IJudgePlaceholderType | IJudgeTypeOption | IJudgeRulesType)[],
  modelValue: any,
  targetKey: string,
  formConfig: any,
  needReplace = true,
  isOptional = false,
): any => {
  let res = ''
  if (Array.isArray(rules)) {
    rules.forEach(rule => {
      let { judgeValue } = rule as IJudgeType
      if (res) return
      const judgeValueMatch = `${judgeValue}`.match(/\$\{([^}]+)\}/)
      if (judgeValueMatch) {
        judgeValue = get(isProxy(modelValue) ? toRaw(modelValue) : modelValue, judgeValueMatch[1])
      }
      if (isProxy(judgeValue)) {
        judgeValue = toRaw(judgeValue)
      }
      rule.judgeValue = judgeValue
      const rulesValue = targetKey === '_default' ? targetKey : rule[targetKey as keyof typeof rule]
      res = judgeRulesHandle(rule as IJudgeType, modelValue, isOptional) ? (rulesValue as string) : ''
    })
  }
  if (typeof (res) === 'string' && res && needReplace) {
    res = res.replace(/\$\{([^}]+)\}/g, (match, p1): string => {
      const matched = formConfig?.filter((item: any) => item.itemKey === p1)
      if (matched && matched.length > 0) return matched[0].label
      const matchValue = get(isProxy(modelValue) ? toRaw(modelValue) : modelValue, p1)
      return matchValue || match
    })
  }
  return res
}
