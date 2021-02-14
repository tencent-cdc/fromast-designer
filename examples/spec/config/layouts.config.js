import React from 'react'
import ReactDOM from 'react-dom'

import CatList from '../components/cat-list'

export default {
  // 必须的布局配置，不传会使用系统的
  form: {
    // 左侧列出来时的信息
    title: '表单',
    icon: 'form',

    // 右侧用于配置该组件的信息
    props: {},

    // 预览区预览的效果
    mount(el, props, views) {},
  },
  view: {
    title: '页',
    props: {},
    mount(el, props, groups) {},
  },
  group: {
    title: '组',
    props: {},
    mount(el, props, rows) {},
  },
  row: {
    title: '排',
    props: {},
    mount(el, props, columns) {},
  },
  column: {
    title: '栏',
    props: {},
    mount(el, props, items) {},
  },

  // 自定义布局组件
  items: [
    {
      name: 'cat-list', // 唯一标识名，在 needs 中可以被使用

      title: '栅格',
      icon: 'cat-list',

      // 只能放在 'view' 中，不能放在 form, group 等中
      // view 会自动在 allows 中加多 cat-list
      needs: ['view'],

      // 只允许 'group' 放在 cat-list 中，不允许其他直接放在 cat-list 中
      // group 会自动在 needs 中加多 cat-list
      allows: ['group'],

      props: {
        h: {
          title: '横向',
          type: 'number',
        },
        v: {
          title: '纵向',
          type: 'number',
        },
      },

      mount(el, props, children) {
        ReactDOM.reander(<CatList {...props}>{children}</CatList>, el)
      },
      update(el, props) {
        ReactDOM.reander(<CatList {...props}>{children}</CatList>, el)
      },
      unmount(el) {
        ReactDOM.unmountComponentAtNode(el)
      },
    },
  ],
}
