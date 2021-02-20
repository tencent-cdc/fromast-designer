import ItemsConfig from './items.jsx'
import { FormastComponents } from '@tencent/formast/react'
import { React } from 'nautil'
import { unmount, render } from 'nautil/dom'
import { VALUE_TYPES } from './constants.js'

const { Form, FormView, Button } = FormastComponents
const [Atom, Layout] = ItemsConfig.groups
const [FormGroupLayout, FormItemLayout, FormCellLayout] = Layout.items

const FormLayout = {
  id: 'Form',

  title: '表单',
  icon: 'BsLayoutWtf',
  direction: 'h',

  allows: ['FormView'],

  mount(el, monitor) {
    const { DropBox } = monitor
    render(el, <Form><DropBox /></Form>)
  },
  update(el, monitor) {
    FormLayout.mount(el, monitor)
  },
  unmount(el) {
    unmount(el)
  },
}

const FormViewLayout = {
  id: 'FormView',

  title: '页',
  icon: 'BsLayers',

  needs: ['Form'],
  allows: ['FormGroup'],

  mount(el, monitor) {
    const { DropBox } = monitor
    render(el, <FormView><DropBox /></FormView>)
  },
  update(el, monitor) {
    FormViewLayout.mount(el, monitor)
  },
  unmount(el) {
    unmount(el)
  },
}

const ButtonLayout = {
  id: 'Button',

  title: '按钮',
  icon: 'BsPip',

  props: [
    {
      key: 'text',
      title: '文案',
      types: [VALUE_TYPES.STR, VALUE_TYPES.EXP],
    },
  ],

  mount(el, monitor) {
    const props = monitor.getComputedProps()
    const { text } = props
    render(el, <Button>{text}</Button>)
  },
  update(el, monitor) {
    ButtonLayout.mount(el, monitor)
  },
  unmount(el) {
    unmount(el)
  },
}


export default {
  groups: [
    {
      ...Atom,
      items: [
        ...Atom.items,
        ButtonLayout,
      ]
    },
    {
      ...Layout,
      items: [
        FormLayout,
        FormViewLayout,
        { ...FormGroupLayout, needs: ['FormView'] },
        FormItemLayout,
        FormCellLayout,
      ],
    },
  ],
}
