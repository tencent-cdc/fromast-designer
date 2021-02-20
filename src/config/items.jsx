import { React } from 'nautil'
import { unmount, render } from 'nautil/dom'
import { FormastComponents } from '@tencent/formast/react'
import { VALUE_TYPES } from './constants.js'

const { Input, Textarea, FormGroup, FormItem, FormCell, Select } = FormastComponents

const InputLayout = {
  id: 'Input',

  title: '输入框',
  icon: 'BsPhoneLandscape',

  props: [
    {
      key: 'type',
      types: [VALUE_TYPES.STR],
      value: 'text',
    },
    {
      key: 'label',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
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
      key: 'hidden',
      title: '是否隐藏',
      types: [VALUE_TYPES.EXP],
    },
    {
      key: 'required',
      title: '是否必填',
      types: [VALUE_TYPES.EXP],
    },
    {
      key: 'disabled',
      title: '是否禁用',
      types: [VALUE_TYPES.EXP],
    },
    {
      key: 'suffix',
      title: '修饰',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
  ],

  mount(el, monitor) {
    const props = monitor.getComputedProps()
    const { placeholder, type, label, suffix } = props
    render(el, <Input type={type} label={label} suffix={suffix} placeholder={placeholder} />)
  },
  update(el, monitor) {
    InputLayout.mount(el, monitor)
  },
  unmount(el) {
    unmount(el)
  },
}

const TextareaLayout = {
  id: 'Textarea',

  title: '多行文本',
  icon: 'BsCardText',

  props: [
    {
      key: 'label',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
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
      key: 'hidden',
      title: '是否隐藏',
      types: [VALUE_TYPES.EXP],
    },
    {
      key: 'required',
      title: '是否必填',
      types: [VALUE_TYPES.EXP],
    },
    {
      key: 'disabled',
      title: '是否禁用',
      types: [VALUE_TYPES.EXP],
    },
    {
      key: 'suffix',
      title: '修饰',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
  ],

  mount(el, monitor) {
    const props = monitor.getComputedProps()
    const { placeholder, label, suffix } = props
    render(el, <Textarea label={label} suffix={suffix} placeholder={placeholder} />)
  },
  update(el, monitor) {
    TextareaLayout.mount(el, monitor)
  },
  unmount(el) {
    unmount(el)
  },
}

const SelectLayout = {
  id: 'Select',

  title: '下拉',
  icon: 'BsListCheck',

  props: [
    {
      key: 'label',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
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
    {
      key: 'placeholder',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
    {
      key: 'hidden',
      title: '是否隐藏',
      types: [VALUE_TYPES.EXP],
    },
    {
      key: 'required',
      title: '是否必填',
      types: [VALUE_TYPES.EXP],
    },
    {
      key: 'disabled',
      title: '是否禁用',
      types: [VALUE_TYPES.EXP],
    },
    {
      key: 'suffix',
      title: '修饰',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
  ],

  mount(el, monitor) {
    const props = monitor.getComputedProps()
    const { placeholder, options, label, suffix } = props
    render(el, <Select options={options} label={label} suffix={suffix} placeholder={placeholder} />)
  },
  update(el, monitor) {
    SelectLayout.mount(el, monitor)
  },
  unmount(el) {
    unmount(el)
  },
}

const FormGroupLayout = {
  id: 'FormGroup',

  title: '组',
  icon: 'BsLayoutTextWindowReverse',

  allows: ['FormItem'],

  mount(el, monitor) {
    const { DropBox } = monitor
    render(el, <FormGroup><DropBox /></FormGroup>)
  },
  update(el, monitor) {
    const { DropBox } = monitor
    render(el, <FormGroup><DropBox /></FormGroup>)
  },
  unmount(el) {
    unmount(el)
  },
}

const FormItemLayout = {
  id: 'FormItem',

  title: '项',
  icon: 'BsLayoutThreeColumns',
  direction: 'h',

  needs: ['FormGroup'],
  allows: ['FormCell'],

  mount(el, monitor) {
    const { DropBox } = monitor
    render(el, <FormItem><DropBox /></FormItem>)
  },
  update(el, monitor) {
    const { DropBox } = monitor
    render(el, <FormItem><DropBox /></FormItem>)
  },
  unmount(el) {
    unmount(el)
  },
}

const FormCellLayout = {
  id: 'FormCell',

  title: '单元',
  icon: 'BsApp',

  needs: ['FormItem'],
  allows: ['Input', 'Textarea', 'Select'],

  mount(el, monitor) {
    const { DropBox } = monitor
    render(el, <FormCell><DropBox /></FormCell>)
  },
  update(el, monitor) {
    const { DropBox } = monitor
    render(el, <FormCell><DropBox /></FormCell>)
  },
  unmount(el) {
    unmount(el)
  },
}

export default {
  groups: [
    {
      id: 'atom',
      title: '原子素材',
      items: [
        InputLayout,
        TextareaLayout,
        SelectLayout,
      ],
    },
    {
      id: 'layout',
      title: '布局素材',
      items: [
        FormGroupLayout,
        FormItemLayout,
        FormCellLayout,
      ],
    },
  ],
}
