import './styles/index.less'

import { React } from 'nautil'
import { unmount, update } from 'nautil/dom'
import { isString } from 'ts-fns'

import App from './app.jsx'

export class FormastEditor {
  constructor(config) {
    this.emitters = []
    this.config = config
    this.el = null
    this.json = null
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

    update(this.el, <App
      config={this.config}
      onSave={(json) => this.emit('save', json)}
      onReset={() => {
        this.emit('reset')
        this.reset()
      }}
      onDownload={() => this.emit('download')}
      json={this.json}
      onJSONChange={(json) => {
        this.json = json
        this.emit('change', json)
        this.update()
      }}
    />)

    return this
  }
  unmount() {
    if (this.el) {
      unmount(this.el)
    }
    return this
  }
  reset() {
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
    this.reset()
  }
  getJSON() {
    return this.json
  }
}

export function createFormastEditor(config, el) {
  const editor = new FormastEditor(config)

  if (el) {
    editor.mount(el)
  }

  return editor
}
