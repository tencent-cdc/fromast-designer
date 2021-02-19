import { React, Component, Section, Text, createRef, Each, nonable, ifexist, If } from 'nautil'
import { DropBox, DragBox } from './drag-drop.jsx'
import { classnames, parseKey } from '../../utils'
import DefaultComponentsConfig from '../../config/components.jsx'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DeleteOutlined, SettingOutlined, MenuOutlined } from '@ant-design/icons'
import { createRandomString, each } from 'ts-fns'
import { Confirm } from '../confirm/confirm.jsx'
import { VALUE_TYPES } from '../../config/constants.js'
import { isFunction, debounce } from 'ts-fns'

function getConfig(config) {
  const groupSet = {}
  const groups = []

  DefaultComponentsConfig.groups.forEach((group) => {
    const { id } = group
    groupSet[id] = group
    groups.push(id)
  })

  if (config.groups) {
    config.groups.forEach((group) => {
      const { id } = group

      if (groupSet[id]) {
        const itemSet = {}
        const itemIds = []

        groupSet[id].items.forEach((item) => {
          itemIds.push(item.id)
          itemSet[item.id] = item
        })

        if (group.items) {
          group.items.forEach((item) => {
            if (!itemSet[item.id]) {
              itemIds.push(item.id)
            }
            itemSet[item.id] = item
          })
        }

        groupSet[id] = {
          ...groupSet[id],
          ...group,
          items,
        }
      }
      else {
        groupSet[id] = group
        groups.push(id)
      }
    })
  }

  return {
    ...DefaultComponentsConfig,
    ...config,
    groups: groups.map((id) => groupSet[id]),
  }
}

export class DragDesigner extends Component {
  getConfig() {
    const { config } = this.props
    return getConfig(config)
  }
  render() {
    const { groups } = this.getConfig()
    return (
      <Section stylesheet={[classnames('drag-designer')]}>
        <Each of={groups} render={(group) => {
          return (
            <Section key={group.id} stylesheet={[classnames('drag-designer__source-group')]}>
              <Section stylesheet={[classnames('drag-designer__source-group__title')]}><Text>{group.title}</Text></Section>
              <Each of={group.items} render={(item) => {
                const { icon: Icon, title, id } = item
                return (
                  <DragBox key={title} source={item}>
                    <Section stylesheet={[classnames('drag-designer__source-item')]}>
                      <Icon />
                      <Text stylesheet={[classnames('drag-designer__source-item__text')]}>{title}</Text>
                      <Text stylesheet={[classnames('drag-designer__source-item__id')]}>{id}</Text>
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

export class Monitor {
  constructor({ el, source, selected, ...options }) {
    this.id = createRandomString(8)
    this.el = el
    this.source = source
    this.props = {}
    this.options = options
    this.children = []
    this.elements = []

    if (source.props && source.props.length) {
      this.setInitProps(source.props)
    }
  }
  DropBox = (props) => {
    const { getPassedProps } = this.options
    const { selected, config, onSelect, onRemove, onChange, expParser } = getPassedProps()
    return (
      <DndProvider backend={HTML5Backend}>
        <DropDesigner
          {...props}
          config={config}
          source={this.source}
          type={this.id}
          selected={selected}
          expParser={expParser}
          elements={this.elements}
          onSelect={onSelect}
          onRemove={onRemove}
          onChange={(children) => {
            this.children = children
            onChange()
          }}
        />
      </DndProvider>
    )
  }
  getComputedProps() {
    const res = {}
    const { getPassedProps } = this.options
    const { expParser } = getPassedProps()

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
      if (type <= 0) {
        res[key] = value
      }
      else if (type === 1) {
        res[key] = tryGet(value, expParser, defender)
      }
      else if (type === 2) {
        const items = params.split(',').filter(item => !!item)
        res[key] = (...args) => {
          const locals = {}
          args.forEach((arg, i) => {
            if (items[i])
            locals[items[i]] = arg
          })
          return tryGet(value, (value) => expParser(value, locals), defender)
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
    const isExp = (str) => {
      return str[0] === '{' && str[str.length - 1] === '}'
    }
    const getExp = (str) => {
      return str.substring(1, str.length - 1)
    }

    each(props, (value, key) => {
      const sourceProp = source.props.find(item => item.key === key)
      if (!sourceProp) {
        return
      }

      const [name, params] = parseKey(key)
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
}

export class DropDesigner extends Component {
  static props = {
    config: Object,
    elements: nonable(Array),
    source: ifexist(Object),
    type: ifexist(String),
    selected: nonable(Monitor),
    expParser: nonable(Function),
    max: nonable(Number),
    onSelect: true,
    onRemove: true,
    onChange: true,
  }

  state = {
    move: null,
  }
  items = [null]

  onMounted() {
    const { elements, config } = this.props
    if (!elements || !elements.length) {
      return
    }

    const sourceConfig = getConfig(config)
    const { groups } = sourceConfig

    const sources = []
    groups.forEach(({ items }) => {
      items.forEach((item) => sources.push(item))
    })

    const createAndPutItems = (elements) => {
      return elements.map((element) => {
        const [id, props, ...children] = element
        const source = sources.find(item => item.id === id)

        // 清除不存在的素材
        // TODO 版本升级时，是否需要做兼容性考虑
        if (!source) {
          return
        }

        const item = this.createAndPutItem(this.items.length - 1, source)
        item.setExpProps(props)
        item.elements = children
        return item
      }).filter(item => !!item)
    }
    createAndPutItems(elements)
    this.update()

    setTimeout(() => {
      this.handleChange()
      this.items.forEach((item) => {
        if (!item) {
          return
        }
        this.mountItem(item)
      })
    }, 32)
  }

  createAndPutItem(i, source) {
    const el = createRef()
    const item = new Monitor({
      el,
      source,
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
    this.update()

    setTimeout(() => {
      this.handleChange()
      this.mountItem(item)
    }, 32)
  }
  canDrop = (current) => {
    const { source, max } = this.props
    if (source && source.allows) {
      return source.allows.includes(current.id)
    }
    else if (current.needs) {
      return source ? current.needs.includes(source.id) : false
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
  // 更新内容没有必要那么即时
  updateItem = debounce((item) => {
    item.source.mount(item.el.current, item)
  }, 100)
  handleChange = () => {
    const { onChange } = this.props
    if (onChange) {
      onChange(this.items.filter(item => !!item))
    }
  }
  handleRemove = (i) => {
    const item = this.items[i]
    if (!item) {
      return
    }

    // 卸载DOM
    item.source.unmount(item.el.current)
    this.items.splice(i, 2)
    this.update()

    const { onRemove } = this.props
    onRemove && onRemove(item)
    this.handleChange()
  }
  handleEdit = (item) => {
    const { onSelect } = this.props
    onSelect && onSelect(item)
  }
  onUpdated() {
    this.items.forEach((item) => {
      if (!item) {
        return
      }
      this.updateItem(item)
    })
  }
  render() {
    const { className, selected, type } = this.props
    const items = this.items
    return (
      <Section className={classnames('drop-designer') + (className ? ' ' + className : '')}>
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
              className={classnames('drop-designer__row drop-designer__content')}
              render={(drag) => {
                return (
                  <Section stylesheet={[classnames('drop-designer__item', selected && selected.id === item.id ? 'drop-designer__item--selected' : '', item.source.direction === 'h' ? 'drop-designer__item--horizontal' : 'drop-designer__item--vertical')]}>
                    <div ref={item.el}></div>
                    <Section stylesheet={[classnames('drop-designer__item__actions')]}>
                      <Text stylesheet={[classnames('drop-designer__item__name')]}>{item.source.title + ' ' + item.source.id}</Text>
                      <span className={classnames('drop-designer__item__move')} ref={drag}><MenuOutlined /></span>
                      <If is={!!item.source.props && item.source.props.length > 0} render={() => <SettingOutlined onClick={() => this.handleEdit(item)} />} />
                      <Confirm trigger={(show) => <DeleteOutlined onClick={show} />} onSubmit={() => this.handleRemove(i)} content="确定删除吗？" />
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
