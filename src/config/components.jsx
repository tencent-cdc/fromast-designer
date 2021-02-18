import { React } from 'nautil'
import { unmount, render } from 'nautil/dom'
import { FormastComponents } from '@tencent/formast/react'
import { EditOutlined, FormOutlined, GroupOutlined, AppstoreOutlined, BlockOutlined, FieldBinaryOutlined } from '@ant-design/icons'
import { VALUE_TYPES } from './constants.js'

const { Input, Textarea, FormGroup, FormItem, FormCell } = FormastComponents

const InputTextLayout = {
  id: 'InputText',

  title: '单行文本',
  icon: EditOutlined,

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
  ],

  mount(el, monitor) {
    const props = monitor.getComputedProps()
    const { placeholder, type } = props
    render(el, <Input type={type} placeholder={placeholder} />)
  },
  update(el, monitor) {
    const props = monitor.getComputedProps()
    const { placeholder, type } = props
    render(el, <Input type={type} placeholder={placeholder} />)
  },
  unmount(el) {
    unmount(el)
  },
}

const InputNumberLayout = {
  id: 'InputNumber',

  title: '数字',
  icon: FieldBinaryOutlined,

  props: [
    {
      key: 'type',
      value: 'number',
    },
    {
      key: 'value',
      title: '值',
      types: [VALUE_TYPES.EXP],
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
  ],

  mount(el, monitor) {
    const props = monitor.getComputedProps()
    const { placeholder, type } = props
    render(el, <Input type={type} placeholder={placeholder} />)
  },
  update(el, monitor) {
    const props = monitor.getComputedProps()
    const { placeholder, type } = props
    render(el, <Input type={type} placeholder={placeholder} />)
  },
  unmount(el) {
    unmount(el)
  },
}

const TextareaLayout = {
  id: 'Textarea',

  title: '多行文本',
  icon: FormOutlined,

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
  ],

  mount(el, monitor) {
    const props = monitor.getComputedProps()
    const { placeholder } = props
    render(el, <Textarea placeholder={placeholder} />)
  },
  update(el, monitor) {
    const props = monitor.getComputedProps()
    const { placeholder } = props
    render(el, <Textarea placeholder={placeholder} />)
  },
  unmount(el) {
    unmount(el)
  },
}

const FormGroupLayout = {
  id: 'FormGroup',

  title: '组',
  icon: GroupOutlined,

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
  icon: AppstoreOutlined,
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
  icon: BlockOutlined,

  needs: ['FormItem'],
  allows: ['InputText', 'Textarea', 'InputNumber'],

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
        InputTextLayout,
        TextareaLayout,
        InputNumberLayout,
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
