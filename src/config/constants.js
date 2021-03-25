export const VALUE_TYPES = {
  STR: 0, // 纯文本
  EXP: 1, // 表达式
  FN: 2, // 函数式
}

export const COMPONENT_TYPES = {
  ATOM: 'atom', // 原子组件，支持绑定单个模型字段，根据模型字段的元数据自动完成组件逻辑
  VIEW: 'view', // 布局组件，支持同时引入多个字段，并利用字段完成属性配置
}