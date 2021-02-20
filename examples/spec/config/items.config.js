import React from 'react'
import ReactDOM from 'react-dom'
import Input from '../components/input'
import { VALUE_TYPES } from '../../../src/config/constants.js'
import { EditOutlined } from '@ant-design/icons'

export default {
  items: [
    {
      // 左侧列出来时的信息
      title: '单行文本输入框',
      icon: EditOutlined,

      // 右侧用于配置该组件的信息
      /**
       * 最终生成JSON =>
       * Name: { // Name也是由用户定义的
       *   feilds: ['name'], // 由与模型相关的配置项决定
       *   render(name): [
       *     Input, // 系统字段生成一个输入框让用户填写的名称
       *     {
       *       value: 'name.value', // prop的值表达式由用户填写后生成到这里
       *       onChange(e): 'name.value = e.target.value',
       *       placeholder: 'name.placeholder',
       *       label: 'name.label',
       *       hidden: 'name.hidden',
       *     },
       *   ],
       * }
       */
      props: {
        value: {
          title: '值',
          types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
        },
        onChange: {
          types: [VALUE_TYPES.FN],
        },
        placeholder: {
          types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
        },
        label: {
          title: '显示名',
          types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
        },
        hidden: {
          title: '是否隐藏',
          types: [VALUE_TYPES.EXP],
        },
        required: {
          title: '是否必填',
          types: [VALUE_TYPES.EXP],
        },
        errors: {
          types: [VALUE_TYPES.EXP],
        },
      },

      // 预览区预览的效果
      // props为从模型上取出值后根据表达式生成的结果，系统自动实例化一个模型，在预览时就可以使用
      mount(el, props) {
        ReactDOM.reander(<Input {...props} />, el)
      },
      update(el, props) {
        ReactDOM.reander(<Input {...props} />, el)
      },
      unmount(el) {
        ReactDOM.unmountComponentAtNode(el)
      },
    },
  ]
}
