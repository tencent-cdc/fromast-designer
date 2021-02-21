import './styles/formast.less'

import { createFormastEditor } from '../../src/index.js'
import config from './config'
import { Popup } from '../../src/libs/popup.js'

const editor = createFormastEditor(config, '#form-editor')

const json = sessionStorage.getItem('__JSON__')
if (json) {
  const formJSON = JSON.parse(json)
  editor.setJSON(formJSON)
  editor.refresh()
}

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
