import { createFormastEditor } from 'formast-designer'
import * as config from './config'

const editor = createFormastEditor(config, '#form-editor')

const json = sessionStorage.getItem('__JSON__')
if (json) {
  const formJSON = JSON.parse(json)
  editor.setJSON(formJSON)
}
editor.on('save', () => {
  const json = editor.getJSON()
  const formJSON = JSON.stringify(json)
  sessionStorage.setItem('__JSON__', formJSON)
})


// editor.mount('#form-editor')
// editor.unmount()
// editor.reset() // 全部重置

// 使用已经存在的备份，可以从服务端拉取后异步set，整个编辑区会重新刷新
// editor.setJSON(json)

// // 获取当前的json
// editor.getJSON()


// editor.on('download', (json) => {
//   // ...
// })
