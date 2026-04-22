export enum IJudgeOperate {
  equal = '=',
  notequal = '!=',
  regExp = 'regExp',
  notregExp = 'notregExp',
  gt = '>',
  gte = '>=',
  lt = '<',
  lte = '<=',
  in = 'in',
  notIn = 'notIn',
  between = 'between',
  notBetween = 'notBetween',
  lengthGt = 'lengthGt',
  lengthLt = 'lengthLt',
  lengthNotEqual = 'lengthNotEqual',
  lengthEqual = 'lengthEqual',
  has = 'has',
  notHas = 'notHas',
  exist = 'exist',
}

export enum IRulesType {
  every = 'every',
  some = 'some',
}

export interface IJudgeType {
  judgeFrom: string;
  judgeType: IJudgeOperate;
  judgeValue: any;
}

export interface IJudgePlaceholderType extends IJudgeType {
  _placeholder: string;
}

export interface IJudgeRulesType extends IJudgeType {
  _message: string;
  _trigger?: string;
}

export interface IJudgeTypeOption extends IJudgeType {
  _options: any[];
}

export interface IObj {
  [key: string]: any;
}

export interface IOption {
  label: string;
  value: any;
  [key: string]: any;
}

export interface IFormCombItem {
  label: string;
  itemKey: string;
  is: string;
  show?: boolean | IJudgeType[];
  disabled?: boolean | IJudgeType[];
  placeholder?: string | IJudgePlaceholderType[];
  rules?: any[] | IJudgeRulesType[];
  options?: any[] | IJudgeTypeOption[] | string;
  remoteKey?: string;
  linkValidateKey?: string[];
  children?: IFormCombItem[];
  [key: string]: any;
}

export interface IDslFormItemRuntime extends IFormCombItem {
  _show: boolean;
  _disabled: boolean;
  _placeholder: string;
  _rules: any[];
  _options: any[];
}
