import { React } from 'nautil'
import { unmount, render } from 'nautil/dom'
import { VALUE_TYPES, COMPONENT_TYPES } from './constants.js'
import { FormItem as Item } from '@tencent/formast/react-components.js'

export const Input = {
  id: 'Input',
  type: COMPONENT_TYPES.ATOM,

  title: '单行文本',
  icon: 'BsPhoneLandscape',

  needs: ['FormItem'],

  props: [
    {
      key: 'type',
      types: [VALUE_TYPES.STR],
      value: 'text',
      disabled: true,
    },
    {
      key: 'value',
      title: '值',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
    {
      key: 'onChange',
      types: [VALUE_TYPES.FN],
    },
    {
      key: 'placeholder',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
  ],

  fromMetaToProps(field, meta, monitor) {
    return {
      value: `{ ${field}.value }`,
      'onChange(e)': `{ ${field}.value = e.target.value }`,
      placeholder: `{ ${field}.placeholder }`,
    }
  },

  mount(el, monitor) {
    const props = monitor.getComputedProps()
    const { placeholder, type } = props
    render(el, <input type={type} placeholder={placeholder} />)
  },
  update(el, monitor) {
    Input.mount(el, monitor)
  },
  unmount(el) {
    unmount(el)
  },
}

export const Textarea = {
  id: 'Textarea',
  type: COMPONENT_TYPES.ATOM,

  title: '多行文本',
  icon: 'BsCardText',

  needs: ['FormItem'],

  props: [
    {
      key: 'value',
      title: '值',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
    {
      key: 'onChange',
      types: [VALUE_TYPES.FN],
    },
    {
      key: 'placeholder',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
  ],

  mount(el, monitor) {
    const props = monitor.getComputedProps()
    const { placeholder } = props
    render(el, <textarea placeholder={placeholder} />)
  },
  update(el, monitor) {
    Textarea.mount(el, monitor)
  },
  unmount(el) {
    unmount(el)
  },
}

export const Select = {
  id: 'Select',
  type: COMPONENT_TYPES.ATOM,

  title: '下拉',
  icon: 'BsListCheck',

  needs: ['FormItem'],

  props: [
    {
      key: 'options',
      title: '选项列表',
      types: [VALUE_TYPES.EXP],
      defender: value => Array.isArray(value) && !value.some(item => !('text' in item && 'value' in item)) ? value : [],
    },
    {
      key: 'value',
      title: '值',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
    {
      key: 'onChange',
      types: [VALUE_TYPES.FN],
    },
  ],

  mount(el, monitor) {
    const props = monitor.getComputedProps()
    const defaultOptions = [
      { text: '选项一', value: 1 },
      { text: '选项二', value: 2 },
      { text: '选项三', value: 3 },
    ]
    const { placeholder } = props
    const options = props.options && props.options.length ? props.options : defaultOptions
    render(el,
      <select placeholder={placeholder}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.text}</option>)}
      </select>
    )
  },
  update(el, monitor) {
    Select.mount(el, monitor)
  },
  unmount(el) {
    unmount(el)
  },
}

export const FormGroup = {
  id: 'FormGroup',
  type: COMPONENT_TYPES.VIEW,

  title: '组',
  icon: 'BsLayers',

  allows: ['FormItem'],

  mount(el, monitor) {
    const { DropBox } = monitor
    render(el, <div><DropBox /></div>)
  },
  update(el, monitor) {
    const { DropBox } = monitor
    render(el, <div><DropBox /></div>)
  },
  unmount(el) {
    unmount(el)
  },
}

export const FormItem = {
  id: 'FormItem',
  type: COMPONENT_TYPES.VIEW,

  title: '项',
  icon: 'BsTable',
  direction: 'h',

  allows: ['Input', 'Textarea', 'Select'],

  props: [
    {
      key: 'label',
      title: '名称',
      types: [VALUE_TYPES.STR],
      value: '字段名',
    },
    {
      key: 'hidden',
      title: '是否隐藏',
      types: [VALUE_TYPES.EXP],
      value: 'false',
    }
  ],

  mount(el, monitor) {
    const { DropBox } = monitor
    const props = monitor.getComputedProps()
    const { label, hidden } = props
    render(el, <Item label={label} hidden={hidden}><DropBox /></Item>)
  },
  update(el, monitor) {
    FormItem.mount(el, monitor)
  },
  unmount(el) {
    unmount(el)
  },
}
