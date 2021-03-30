import { React, Component, Section, Text, createRef, Each, nonable, ifexist, List, Dict, Enum, Store } from 'nautil'
import { DropBox, DragBox } from './drag-drop.jsx'
import { classnames, parseKey } from '../../utils'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { createRandomString, each } from 'ts-fns'
import { Confirm } from '../confirm/confirm.jsx'
import { VALUE_TYPES, COMPONENT_TYPES } from '../../config/constants.js'
import { isFunction, find, isArray } from 'ts-fns'
import * as icons from '../icon'
import { BsTrash, BsArrowsMove } from '../icon'

export const ConfigType = new Dict({
  groups: [
    {
      id: String,
      title: String,
      items: [
        {
          id: String,
          type: new Enum(Object.values(COMPONENT_TYPES)),
          sort: ifexist(Number),
          title: String,
          icon: ifexist(String),
          direction: ifexist('h'),
          props: ifexist([
            {
              key: String,
              types: new List(Object.values(VALUE_TYPES)),
              title: ifexist(String),
              defender: ifexist(Function),
            }
          ]),
          tag: ifexist(String),
          needs: ifexist([String]),
          allows: ifexist([String]),
          mount: Function,
          update: Function,
          unmount: Function,
        }
      ]
    }
  ]
})

export class DragDesigner extends Component {
  static props = {
    config: ConfigType,
  }
  static propsCheckAsync = true

  render() {
    const { groups } = this.props.config
    return (
      <Section stylesheet={[classnames('drag-designer')]}>
        <Each of={groups} render={(group) => {
          return (
            <Section key={group.id} stylesheet={[classnames('drag-designer__source-group')]}>
              <Section stylesheet={[classnames('drag-designer__source-group__title')]}><Text>{group.title}</Text></Section>
              <Each of={group.items} render={(item) => {
                const { icon, title, id } = item
                const Icon = icons[icon]
                return (
                  <DragBox key={title} source={item}>
                    <Section stylesheet={[classnames('drag-designer__source-item')]}>
                      {Icon ? <Icon /> : null}
                      <Text stylesheet={[classnames('drag-designer__source-item__text')]}>{title}</Text>
                    </Section>
                  </DragBox>
                )
              }} />
            </Section>
          )
        }} />
      </Section>
    )
  }
}

const isExp = (str) => {
  return str[0] === '{' && str[str.length - 1] === '}'
}
const getExp = (str) => {
  return str.substring(1, str.length - 1).trim()
}

export class Monitor {
  constructor({ el, store, source, getPassedProps, ...options }) {
    this.id = createRandomString(8)
    this.el = el
    this.source = source
    this.props = {}
    this.getPassedProps = getPassedProps
    this.options = options
    this.children = []
    this.elements = []
    this.store = store

    this.bindField = ''

    if (source.props && source.props.length) {
      this.setInitProps(source.props)
    }
  }
  DropBox = (props) => {
    const { store } = this
    const { config, onSelect, onRemove, onChange, expParser } = this.getPassedProps()
    const { index } = props
    const useGroup = typeof index === 'number'

    // 检查是否传入了必要的处理方法
    const { id, fromRuntimeToJSON, fromJSONToRuntime } = this.source
    if (useGroup) {
      if (!fromJSONToRuntime) {
        throw new Error(`${id} 必须传入 fromJSONToRuntime`)
      }
      if (!fromRuntimeToJSON) {
        throw new Error(`${id} 必须传入 fromRuntimeToJSON`)
      }
    }

    return (
      <DndProvider backend={HTML5Backend}>
        <DropDesigner
          config={config}
          source={this.source}
          type={this.id}
          expParser={expParser}
          elements={useGroup ? this.elements[index] : this.elements}
          onSelect={onSelect}
          onRemove={onRemove}
          onChange={(children) => {
            if (useGroup) {
              this.children[index] = children
            }
            else {
              this.children = children
            }
            onChange()
          }}
          store={store}
        />
      </DndProvider>
    )
  }
  getComputedProps() {
    const res = {}
    const { expParser } = this.getPassedProps()

    const parse = expParser(this)

    const props = this.props
    const keys = Object.keys(props)
    // 当表达式输入没有输入完时，可能会保持，这时通过一个try..catch保证正常渲染不报错
    const tryGet = (value, ...fns) => {
      let res = value

      fns.forEach((fn) => {
        try {
          res = isFunction(fn) ? fn(res) : res
        }
        catch (e) {
          // console.error(e)
        }
      })

      return res

    }
    keys.forEach((key) => {
      const { type, value, params, defender } = props[key]
      if (type === VALUE_TYPES.STR || type === VALUE_TYPES.ENUM) {
        res[key] = value
      }
      else if (type === VALUE_TYPES.EXP) {
        res[key] = tryGet(value, parse, defender)
      }
      else if (type === VALUE_TYPES.FN) {
        const items = params.split(',').filter(item => !!item)
        res[key] = (...args) => {
          const locals = {}
          args.forEach((arg, i) => {
            if (items[i])
            locals[items[i]] = arg
          })
          return tryGet(value, (value) => parse(value, locals), defender)
        }
      }
    })
    return res
  }
  setInitProps(props) {
    props.forEach((item) => {
      const { key, value = '', types, disabled, defender } = item
      const prop = {
        type: types ? types[0] : VALUE_TYPES.STR,
        value,
        params: '',
        disabled,
        defender,
      }
      this.props[key] = prop
    })
  }
  setExpProps(props) {
    const source = this.source

    each(props, (value, key) => {
      const [name, params] = parseKey(key)
      const sourceProp = source.props.find(item => item.key === name)
      if (!sourceProp) {
        return
      }

      if (params) {
        this.props[name] = {
          type: VALUE_TYPES.FN,
          value: isExp(value) ? getExp(value) : value,
          params: params.join(','),
          disabled: sourceProp.disabled,
          defender: sourceProp.defender,
        }
      }
      else if (isExp(value)) {
        this.props[name] = {
          type: VALUE_TYPES.EXP,
          value: getExp(value),
          params: '',
          disabled: sourceProp.disabled,
          defender: sourceProp.defender,
        }
      }
      else {
        this.props[name] = {
          type: VALUE_TYPES.STR,
          value,
          params: '',
          disabled: sourceProp.disabled,
          defender: sourceProp.defender,
        }
      }
    })
  }
  getHyperJSON() {
    const fields = []
    const props = []

    const extract = (monitor) => {
      const { source, props, children, bindField } = monitor

      if (bindField && !fields.includes(bindField)) {
        fields.push(bindField)
      }

      const { id, fromRuntimeToJSON } = source
      const attrs = {}
      each(props, (data, key) => {
        const { type, params, value } = data
        if (type === 0) {
          attrs[key] = value
        }
        else if (type === 1) {
          attrs[key] = `{ ${value} }`
        }
        else if (type === 2) {
          attrs[`${key}(${params})`] = `{ ${value} }`
        }
      })

      if (children.length && isArray(children[0]) && isArray(children[0][0])) {
        if (!fromRuntimeToJSON) {
          throw new Error(`${id} 必须传入 fromRuntimeToJSON`)
        }
      }

      if (fromRuntimeToJSON) {
        const items = children.map(items => items.map(extract))
        const [_attrs, _children] = fromRuntimeToJSON.call(monitor, attrs, items)
        return [id, _attrs, ..._children]
      }

      return [id, attrs, ...children.map(extract)]
    }
    const jsx = extract(this)

    return {
      fields,
      props, // TODO
      'render!': jsx,
    }
  }
}

export class DropDesigner extends Component {
  static props = {
    config: ConfigType,
    elements: nonable(Array),
    source: ifexist(Object),
    type: ifexist(String),
    expParser: nonable(Function),
    max: nonable(Number),
    onSelect: true,
    onRemove: true,
    onChange: true,
    onUpdate: false,
    store: Store,
  }
  static propsCheckAsync = true
  static defaultProps = {
    store: new Store(null),
  }

  state = {
    move: null,
  }
  items = [null]

  onMounted() {
    const { elements, config, store } = this.props
    if (!elements || !elements.length) {
      return
    }

    const { groups } = config

    const sources = []
    groups.forEach(({ items }) => {
      items.forEach((item) => sources.push(item))
    })

    elements.forEach((element) => {
      const [id, _props, ..._children] = element
      const source = sources.find(item => item.id === id)

      // 清除不存在的素材
      // TODO 版本升级时，是否需要做兼容性考虑
      if (!source) {
        return
      }

      const item = this.createAndPutItem(this.items.length - 1, source)

      const { fromJSONToRuntime } = source
      const [props, children] = fromJSONToRuntime ? fromJSONToRuntime.call(item, _props, _children) : [_props, _children]

      item.setExpProps(props)
      item.elements = children

      let bindField = ''
      let value = find(props, (_, key) => key === 'value')
      if (value && isExp(value)) {
        value = getExp(value)
      }
      if (/^[a-z0-9A-Z]+\.value$/.test(value)) {
        bindField = value.replace('.value', '')
      }
      item.bindField = bindField
    })
    this.forceUpdate()

    setTimeout(() => {
      this.handleChange()
      this.items.forEach((item) => {
        if (!item) {
          return
        }
        this.mountItem(item)
      })
    }, 16)

    store.subscribe(this.forceUpdate)
  }

  createAndPutItem(i, source) {
    const el = createRef()
    const { store } = this.props
    const item = new Monitor({
      el,
      source,
      store,
      getPassedProps: () => {
        return {
          ...this.props,
          onChange: () => {
            this.handleChange()
          },
        }
      },
    })

    this.items.splice(i + 1, 0, item, null)
    return item
  }

  handleDragDrop = (i, source) => {
    const { move } = this.state
    if (move !== null) {
      const reset = () => this.setState({ move: null })

      // 上下移动一格没有意义
      if (move - 1 === i || move + 1 === i) {
        reset()
        return
      }

      const item = this.items[move]
      this.items.splice(move, 2)
      this.items.splice(i + 1, 0, item, null)
      reset()
      return
    }

    const item = this.createAndPutItem(i, source)
    this.forceUpdate()

    setTimeout(() => {
      this.handleChange()
      this.mountItem(item)
      this.handleSelect({}, item)
    }, 16)
  }
  canDrop = (current) => {
    const { source, max, type } = this.props
    if (source && source.allows) {
      return source.allows.includes(current.id) || (current.tag && source.allows.includes(current.tag))
    }
    else if (current.needs && !type) {
      return current.needs.includes('!')
    }
    else if (current.needs) {
      return source ? current.needs.includes(source.id) || (source.tag && current.needs.includes(source.tag)) : false
    }
    else if (source && source.max&& !this.state.move) {
      return this.items.filter(item => !!item).length < source.max
    }
    else if (max && !this.state.move) {
      return this.items.filter(item => !!item).length < max
    }
    else {
      return true
    }
  }

  mountItem(item) {
    item.source.mount(item.el.current, item)
  }

  handleChange = () => {
    const { onChange } = this.props
    if (onChange) {
      onChange(this.items.filter(item => !!item))
    }
  }
  handleRemove = (e, item) => {
    e.stopPropagation && e.stopPropagation()

    // 卸载DOM
    item.source.unmount(item.el.current)

    const i = this.items.findIndex(one => one === item)
    this.items.splice(i, 2)
    this.forceUpdate()

    const { onRemove } = this.props
    onRemove && onRemove(item)
    this.handleChange()
  }
  handleSelect = (e, item) => {
    const { store } = this.props
    e.stopPropagation && e.stopPropagation()

    if (store.getState() === item) {
      return
    }

    const { onSelect } = this.props
    store.dispatch(item) // 触发更新
    onSelect && onSelect(item)
  }

  onUpdated() {
    this.items.forEach((item) => {
      if (!item) {
        return
      }
      item.source.update(item.el.current, item)
    })
  }

  render() {
    const selected = this.props.store.getState()
    const { className, type, source } = this.props
    const items = this.items
    return (
      <Section className={classnames('drop-designer', source && source.direction === 'h' ? 'drop-designer--horizontal' : 'drop-designer--vertical') + (className ? ' ' + className : '')}>
        {items.map((item, i) => {
          // 占位符
          if (!item) {
            return (
              <DropBox
                key={i}
                type={type}
                className={classnames('drop-designer__row drop-designer__dropbox', items.length === 1 ? 'drop-designer__dropbox--only' : '')}
                onDrop={(next) => this.handleDragDrop(i, next)}
                canDrop={this.canDrop}
              >
              </DropBox>
            )
          }
          // 已经渲染好的
          return (
            <DragBox
              key={item.id}
              type={type}
              source={item.source}
              beginDrag={() => this.setState({ move: i })}
              endDrag={() => this.setState({ move: null })}
              className={classnames('drop-designer__row drop-designer__content', 'drop-designer__content--' + item.source.id)}
              render={(drag) => {
                return (
                  <Section
                    stylesheet={[
                      classnames(
                        'drop-designer__item',
                        selected && selected.id === item.id ? 'drop-designer__item--selected' : '',
                        // 自定义纵横模式
                        item.source.direction === 'h' ? 'drop-designer__item--horizontal' : 'drop-designer__item--vertical',
                      ),
                      // 支持自定义背景色
                      item.source.color ? { backgroundColor: item.source.color } : null,
                    ]}
                    onHit={(e) => this.handleSelect(e, item)}
                  >
                    <div className={classnames('drop-designer__item__content')} ref={item.el}></div>
                    <Section stylesheet={[classnames('drop-designer__item__actions')]}>
                      <span className={classnames('drop-designer__item__move')} ref={drag}><BsArrowsMove /></span>
                      <Confirm trigger={(show) => <Text stylesheet={[classnames('drop-designer__item__operator')]}><BsTrash onClick={show} /></Text>} onSubmit={(e) => this.handleRemove(e, item)} content="确定删除吗？" />
                    </Section>
                  </Section>
                )
              }}
            />
          )
        })}
      </Section>
    )
  }
}
