import { unmount, update } from 'nautil/dom'
import { isString, clone } from 'ts-fns'
import { Popup } from './libs/popup.js'
import { React } from 'nautil'
import { FormastComponents } from '@tencent/formast/react'

import App from './app/app.jsx'

// 导出内部接口，方便开发者进行修改
export { React, FormastComponents }

export class FormastDesigner {
  constructor(config = {}) {
    this.emitters = []
    this.config = config
    this.json = config.json
    this.el = null
  }

  mount(el) {
    if (isString(el)) {
      el = document.querySelector(el)
    }

    this.el = el
    this.update()

    return this
  }
  update() {
    if (!this.el) {
      return this
    }

    update(this.el, App, {
      config: this.config,
      onSave: () => this.emit('save', this.getJSON()),
      onReset: () => {
        this.emit('reset')
        this.refresh()
      },
      onExport: () => {
        const json = clone(this.getJSON())
        this.emit('export', json)
        const content = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json, null, 4))
        const a = document.createElement('a')
        a.href = content
        a.download = 'formast.json'
        a.click()
      },
      onImport: () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.click()
        input.onchange = (e) => {
          const file = e.target.files[0]
          const reader = new FileReader()
          reader.readAsText(file)
          reader.onload = (e) => {
            const text = e.target.result
            const json = JSON.parse(text)
            this.emit('import', json)
            this.setJSON(json)
            this.refresh()
            Popup.toast('导入成功！')
          }
        }
      },
      json: this.json,
      onJSONChange: (json) => {
        this.json = json
        this.emit('change', json)
        this.update()
      },
    })

    return this
  }
  unmount() {
    if (this.el) {
      unmount(this.el)
    }
    return this
  }
  refresh() {
    if (this.el) {
      this.unmount()
      this.mount(this.el)
    }
    return this
  }

  on(event, fn) {
    this.emitters.push({ event, fn })
  }
  emit(event, data) {
    this.emitters.forEach((item) => {
      if (item.event === event) {
        item.fn(data)
      }
    })
  }

  setJSON(json) {
    this.json = json
  }
  getJSON() {
    return this.json
  }
}

export function createFormastDesigner(el, config = {}) {
  const editor = new FormastDesigner(config)

  if (el) {
    editor.mount(el)
  }

  return editor
}
