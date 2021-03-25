import { React, Component, Section, ifexist, Any, nonable, Int } from 'nautil'
import { classnames } from '../../utils'
import { DragDesigner, DropDesigner, ConfigType } from '../drag-drop/drag-drop-designer.jsx'
import { each, isArray } from 'ts-fns'

export class Designer extends Component {
  static props = {
    elements: nonable(Array),
    config: ConfigType,
    buttons: ifexist(Any),
    settings: ifexist(Any),
    onRemove: true,
    onSelect: true,
    onChange: true,
    expParser: ifexist(Function),
    max: nonable(Int),
  }
  static propsCheckAsync = true

  handleRemove = (monitor) => {
    const { onRemove } = this.props
    onRemove(monitor)
  }
  handleSelect = (selected) => {
    const { onSelect } = this.props
    onSelect(selected)
  }
  handleChange = (monitors) => {
    const { onChange } = this.props

    const extract = (monitor) => {
      const { source, props, children } = monitor
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

    const jsx = monitors.length ? extract(monitors[0]) : null // 只需要顶层第一个
    onChange(jsx)
  }

  render() {
    const { elements, config, expParser, max, settings } = this.props

    return (
      <>
        <Section stylesheet={[classnames('sidebar sidebar--left designer__sidebar dragable')]}>
          <DragDesigner config={config} />
        </Section>
        <Section stylesheet={[classnames('main designer__main')]}>
          <Section stylesheet={classnames('designer__canvas')}>
            <DropDesigner
              onChange={this.handleChange}
              onSelect={this.handleSelect}
              onRemove={this.handleRemove}
              expParser={expParser}
              max={max}
              config={config}
              elements={elements}
            />
          </Section>
        </Section>
        {settings ? (
          <Section stylesheet={[classnames('sidebar sidebar--right designer__sidebar designer__settings')]}>
            {settings}
          </Section>
        ) : null}
      </>
    )
  }
}
export default Designer
