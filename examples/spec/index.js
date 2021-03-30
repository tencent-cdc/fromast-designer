import './styles/formast.less'

import { createFormastDesigner } from '../../src/index.js'
import { InputConfig, TextareaConfig, SelectConfig, FormGroupConfig, FormItemConfig } from '../../src/config/components.jsx' // 内置的例子
import { Popup } from '../../src/libs/popup.js'

const layout = {
  groups: [
    {
      id: 'layout',
      title: '布局素材',
      items: [
        FormGroupConfig,
        FormItemConfig,
      ],
    },
    {
      id: 'atom',
      title: '原子素材',
      items: [
        InputConfig,
        TextareaConfig,
        SelectConfig,
      ],
    },
  ],
}

const cacheJson = sessionStorage.getItem('__JSON__')
const json = cacheJson ? JSON.parse(cacheJson) : {}
const editor = createFormastDesigner('#form-editor', {
  json,
  layout,
})

editor.on('save', (json) => {
  console.log(json)
  const formJSON = JSON.stringify(json)
  sessionStorage.setItem('__JSON__', formJSON)
  Popup.toast('保存成功')
})

editor.on('reset', () => {
  editor.setJSON({})
})

// editor.mount('#form-editor')
// editor.unmount()

// 使用已经存在的备份，可以从服务端拉取后异步set，整个编辑区会重新刷新
// editor.setJSON(json)
// 之后必须自己调用refresh刷新界面
// editor.refresh()

// // 获取当前的json
// editor.getJSON()

// editor.on('download', (json) => {
//   // ...
// })
