import { React, Component, Section, ifexist, Any, nonable, Int } from 'nautil'
import { classnames } from '../../utils'
import { DragDesigner, DropDesigner, Monitor } from '../drag-drop/drag-drop-designer.jsx'
import { each } from 'ts-fns'

export class Designer extends Component {
  static props = {
    elements: nonable(Array),
    config: Object,
    buttons: ifexist(Any),
    settings: ifexist(Any),
    onRemove: true,
    onSelect: true,
    onChange: true,
    expParser: ifexist(Function),
    selected: nonable(Monitor),
    max: nonable(Int),
  }

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
      const { id } = source
      const attrs = {}
      each(props, (data, key) => {
        const { type, params, value } = data
        if (type === 0) {
          attrs[key] = value
        }
        else if (type === 1) {
          attrs[key] = `{${value}}`
        }
        else if (type === 2) {
          attrs[`${key}(${params})`] = `{${value}}`
        }
      })
      return [id, attrs, ...children.map(extract)]
    }
    const jsx = monitors.length ? extract(monitors[0]) : null // 只需要顶层第一个

    onChange(jsx)
  }

  render() {
    const { elements, config, buttons, settings, selected, expParser, max } = this.props

    return (
      <>
        <Section stylesheet={[classnames('main designer__main')]}>
          {buttons ? <Section stylesheet={[classnames('designer__buttons')]}>{buttons}</Section> : null}
          <DropDesigner
            className={classnames('designer__canvas')}
            onChange={this.handleChange}
            onSelect={this.handleSelect}
            onRemove={this.handleRemove}
            expParser={expParser}
            selected={selected}
            max={max}
            config={config}
            elements={elements}
          />
          {settings ? <Section stylesheet={[classnames('designer__settings')]}>{settings}</Section> : null}
        </Section>
        <Section stylesheet={[classnames('sidebar sidebar--right designer__sidebar dragable')]}>
          <DragDesigner config={config} />
        </Section>
      </>
    )
  }
}
export default Designer
