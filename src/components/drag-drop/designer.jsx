import { React, Component, Section, Text, createRef, Each } from 'nautil'
import { DropBox, DragBox } from './drag-drop.jsx'
import { classnames } from '../../utils'
import DefaultComponentsConfig from '../../config/components.jsx'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DeleteOutlined, SettingOutlined, MenuOutlined } from '@ant-design/icons'
import { createRandomString } from 'ts-fns'

export class DragDesigner extends Component {
  getConfig() {
    const { config } = this.props
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
  render() {
    const { groups } = this.getConfig()
    return (
      <Section stylesheet={[classnames('drag-designer')]}>
        <Each of={groups} render={(group) => {
          return (
            <Section key={group.id} stylesheet={[classnames('drag-designer__source-group')]}>
              <Section stylesheet={[classnames('drag-designer__source-group__title')]}><Text>{group.title}</Text></Section>
              <Each of={group.items} render={(item) => {
                const { icon: Icon, title } = item
                return (
                  <DragBox key={title} data={item}>
                    <Section stylesheet={[classnames('drag-designer__source-item')]}>
                      <Icon />
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

export class DropDesigner extends Component {
  state = {
    move: null,
  }
  items = [null]

  handleDragDrop = (i, data) => {
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

    const el = createRef()
    const monitor = {
      DropBox: (props) => {
        const { config, selected, onSelect } = this.props
        return (
          <DndProvider backend={HTML5Backend}>
            <DropDesigner {...props} config={config} item={item.data} type={item.id} onSelect={onSelect} selected={selected} />
          </DndProvider>
        )
      },
    }
    const item = { id: createRandomString(8), el, data, props: {}, monitor }
    this.items.splice(i + 1, 0, item, null)
    this.update()
    setTimeout(() => {
      this.mountItem(item)
    }, 32)
  }
  canDrop = (source) => {
    const { item, max } = this.props
    if (item && item.allows) {
      return item.allows.includes(source.id)
    }
    else if (source.needs) {
      return item ? source.needs.includes(item.id) : false
    }
    else if (max && !this.state.move) {
      return this.items.filter(item => !!item).length < max
    }
    else {
      return true
    }
  }
  mountItem(item) {
    item.data.mount(item.el.current, item.props, item.monitor)
  }
  updateItem(item) {
    item.data.update(item.el.current, item.props, item.monitor)
  }
  handleRemove = (i) => {
    const item = this.items[i]
    if (!item) {
      return
    }

    // 卸载DOM
    item.data.unmount(item.el.current)
    this.items.splice(i, 2)
    this.update()
  }
  handleEdit = (selected) => {
    const { onSelect } = this.props
    onSelect && onSelect(selected)
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
              data={item.data}
              beginDrag={() => this.setState({ move: i })}
              endDrag={() => this.setState({ move: null })}
              className={classnames('drop-designer__row drop-designer__content')}
              render={(drag) => {
                return (
                  <Section stylesheet={[classnames('drop-designer__item', selected && selected.id === item.id ? 'drop-designer__item--selected' : '')]}>
                    <Section stylesheet={[classnames('drop-designer__item__actions')]}>
                      <Text stylesheet={[classnames('drop-designer__item__name')]}>{item.data.title}</Text>
                      <span className={classnames('drop-designer__item__move')} ref={drag}><MenuOutlined /></span>
                      <SettingOutlined onClick={() => this.handleEdit(item)} />
                      <DeleteOutlined onClick={() => this.handleRemove(i)} />
                    </Section>
                    <div ref={item.el}></div>
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
