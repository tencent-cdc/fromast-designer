import { React } from 'nautil'
import { unmount, render } from 'nautil/dom'
import { VALUE_TYPES, COMPONENT_TYPES } from './constants.js'
import { Input, Textarea, FormItem, FormGroup, Radio, Select, Checkbox } from '@tencent/formast/react-components'

export const InputConfig = {
  id: 'Input',
  type: COMPONENT_TYPES.ATOM,

  title: '输入框',
  icon: 'BsPhoneLandscape',

  tag: 'atom',
  needs: ['FormItem'],

  props: [
    {
      key: 'type',
      types: [VALUE_TYPES.ENUM],
      value: 'text',
      options: [
        { text: '文本', value: 'text' },
        { text: '数字', value: 'number' },
        { text: 'URL', value: 'url' },
        { text: 'EMail', value: 'email' },
        { text: 'Range', value: 'range' },
        { text: '日期', value: 'date' },
        { text: '时间', value: 'time' },
        { text: '周', value: 'week' },
        { text: '月份', value: 'month' },
        { text: '电话', value: 'tel' },
        { text: '文件', value: 'file' },
        { text: '密码', value: 'password' },
        { text: '搜索', value: 'search' },
      ],
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
    {
      key: 'after',
      title: '末尾',
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
    render(el, <Input type={type} placeholder={placeholder} />)
  },
  update(el, monitor) {
    InputConfig.mount(el, monitor)
  },
  unmount(el) {
    unmount(el)
  },
}

export const TextareaConfig = {
  id: 'Textarea',
  type: COMPONENT_TYPES.ATOM,

  title: '多行文本',
  icon: 'BsCardText',

  tag: 'atom',
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
    render(el, <Textarea placeholder={placeholder} />)
  },
  update(el, monitor) {
    TextareaConfig.mount(el, monitor)
  },
  unmount(el) {
    unmount(el)
  },
}

export const SelectConfig = {
  id: 'Select',
  type: COMPONENT_TYPES.ATOM,

  title: '下拉',
  icon: 'BsListCheck',

  tag: 'atom',
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
    render(el, <Select options={options} placeholder={placeholder} />)
  },
  update(el, monitor) {
    SelectConfig.mount(el, monitor)
  },
  unmount(el) {
    unmount(el)
  },
}

export const RadioConfig = {
  id: 'Radio',
  type: COMPONENT_TYPES.ATOM,

  title: '单选组',
  icon: 'BsCheckCircle',

  tag: 'atom',
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
    const options = props.options && props.options.length ? props.options : defaultOptions
    render(el, <Radio options={options} />)
  },
  update(el, monitor) {
    RadioConfig.mount(el, monitor)
  },
  unmount(el) {
    unmount(el)
  },
}

export const CheckboxConfig = {
  id: 'Checkbox',
  type: COMPONENT_TYPES.ATOM,

  title: '多选组',
  icon: 'BsCheckBox',

  tag: 'atom',
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
    const options = props.options && props.options.length ? props.options : defaultOptions
    render(el, <Checkbox options={options} />)
  },
  update(el, monitor) {
    CheckboxConfig.mount(el, monitor)
  },
  unmount(el) {
    unmount(el)
  },
}

export const FormGroupConfig = {
  id: 'FormGroup',
  type: COMPONENT_TYPES.VIEW,

  title: '组',
  icon: 'BsLayers',

  allows: ['FormItem', 'FormGroup'], // 组可以再嵌套组

  props: [
    {
      key: 'title',
      title: '标题',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
      value: '组名',
    },
    {
      key: 'hidden',
      title: '是否隐藏',
      types: [VALUE_TYPES.BOOL, VALUE_TYPES.EXP],
      value: false,
    },
  ],

  mount(el, monitor) {
    const { DropBox } = monitor
    const props = monitor.getComputedProps()
    const { title, hidden } = props
    render(el, <FormGroup title={title} hidden={hidden}><DropBox /></FormGroup>)
  },
  update(el, monitor) {
    FormGroupConfig.mount(el, monitor)
  },
  unmount(el) {
    unmount(el)
  },
}

export const FormItemConfig = {
  id: 'FormItem',
  type: COMPONENT_TYPES.VIEW,

  title: '项',
  icon: 'BsTable',
  direction: 'h',

  allows: ['tag:atom'],

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
      types: [VALUE_TYPES.BOOL, VALUE_TYPES.EXP],
      value: false,
    },
  ],

  mount(el, monitor) {
    const { DropBox } = monitor
    const props = monitor.getComputedProps()
    const { label, hidden } = props
    render(el, <FormItem label={label} hidden={hidden}><DropBox /></FormItem>)
  },
  update(el, monitor) {
    FormItemConfig.mount(el, monitor)
  },
  unmount(el) {
    unmount(el)
  },
}
