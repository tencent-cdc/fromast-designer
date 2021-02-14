import { React } from 'nautil'
import { unmount, render } from 'nautil/dom'
import { FormastComponents } from '@tencent/formast/react'
import { EditOutlined, FormOutlined, GroupOutlined, AppstoreOutlined, BlockOutlined } from '@ant-design/icons'
import { VALUE_TYPES } from './constants.js'

const { Input, Textarea, FormGroup, FormItem, FormCell } = FormastComponents

const InputTextLayout = {
  id: 'InputText',

  title: '单行文本',
  icon: EditOutlined,

  props: [
    {
      key: 'type',
      value: 'text',
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

  mount(el, props) {
    render(el, <Input {...props} />)
  },
  update(el, props) {
    render(el, <Input {...props} />)
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

  mount(el, props) {
    render(el, <Textarea {...props} />)
  },
  update(el, props) {
    render(el, <Textarea {...props} />)
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

  props: [],

  mount(el, props, monitor) {
    const { DropBox } = monitor
    render(el, <FormGroup {...props}><DropBox /></FormGroup>)
  },
  update(el, props, monitor) {
    const { DropBox } = monitor
    render(el, <FormGroup {...props}><DropBox /></FormGroup>)
  },
  unmount(el) {
    unmount(el)
  },
}

const FormItemLayout = {
  id: 'FormItem',

  title: '项',
  icon: AppstoreOutlined,

  needs: ['FormGroup'],
  allows: ['FormCell'],

  props: [],

  mount(el, props, monitor) {
    const { DropBox } = monitor
    render(el, <FormItem {...props}><DropBox /></FormItem>)
  },
  update(el, props, monitor) {
    const { DropBox } = monitor
    render(el, <FormItem {...props}><DropBox /></FormItem>)
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
  allows: ['InputText', 'Textarea'],

  props: [],

  mount(el, props, monitor) {
    const { DropBox } = monitor
    render(el, <FormCell {...props}><DropBox /></FormCell>)
  },
  update(el, props, monitor) {
    const { DropBox } = monitor
    render(el, <FormCell {...props}><DropBox /></FormCell>)
  },
  unmount(el) {
    unmount(el)
  },
}

export default {
  groups: [
    {
      id: 'atom',
      title: '原子组件',
      items: [
        InputTextLayout,
        TextareaLayout,
      ],
    },
    {
      id: 'advanced',
      title: '高级组件',
      items: [
        FormGroupLayout,
        FormItemLayout,
        FormCellLayout,
      ],
    },
  ],
}
