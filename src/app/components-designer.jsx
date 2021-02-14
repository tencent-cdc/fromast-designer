import { React, Component, Section } from 'nautil'
import { classnames } from '../utils'
import { DragDesigner, DropDesigner } from '../components/drag-drop/designer.jsx'

export class ComponentsDesigner extends Component {
  state = {
    props: {},
    selected: null,
  }
  handleChange = () => {}
  handleSelect = (selected) => {
    this.setState({ selected })
  }
  render() {
    return (
      <Section stylesheet={[classnames('content components-designer')]}>
        <Section stylesheet={[classnames('sidebar sidebar--left sidebar--small')]}>left</Section>
        <Section stylesheet={[classnames('main')]}>
          <DropDesigner
            className={classnames('components-designer__canvas')}
            onChange={this.handleChange}
            onSelect={this.handleSelect}
            selected={this.state.selected}
          />
          <Section stylesheet={[classnames('components-designer__settings')]}>xxx</Section>
        </Section>
        <Section stylesheet={[classnames('sidebar sidebar--right components-designer__sources dragable')]}>
          <DragDesigner config={this.props.config} />
        </Section>
      </Section>
    )
  }
}
