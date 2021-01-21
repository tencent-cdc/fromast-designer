import React from 'react'
import ReactDOM from 'react-dom'
import Input from '../components/input'

export const materials = {
  components: [
    {
      // 左侧列出来时的信息
      title: '单行文本输入框',
      icon: 'input',

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
          type: 'text', // type为配置区域输入框的类型
        },
        onChange: {
          type: 'text',
          fn: true, // 代表该配置为一个函数
        },
        placeholder: {
          type: 'text',
        },
        label: {
          title: '显示名',
          type: 'text',
        },
        hidden: {
          title: '是否隐藏',
          type: 'text',
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