import { React, Component, Section } from 'nautil'
import { Button } from '../components/button/button.jsx'
import { classnames, globalModelScope } from '../utils'
import { ModelDesigner } from './model-designer.jsx'
import { ComponentsDesigner } from './components-designer.jsx'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { LayoutDesigner } from './layout-designer.jsx'

class App extends Component {
  state = {
    activeTopTab: 0,
  }

  onInit() {
    // 进来以后实例化，在render中好用
    const { json } = this.props
    const { model = {} } = json || {}
    globalModelScope.set(model)
  }

  handleModelJSONChange = (model) => {
    const { json = {}, onJSONChange } = this.props
    const next = { ...json, model }
    onJSONChange(next)
  }

  handleItemsChange = (items) => {
    const { json = {}, onJSONChange } = this.props
    const next = { ...json, items }
    onJSONChange(next)
  }

  handleLayoutChange = (layout) => {
    const { json = {}, onJSONChange } = this.props
    const next = { ...json, layout }
    onJSONChange(next)
  }

  render() {
    const { config, onSave, onReset, onDownload, json, onImport } = this.props
    const { activeTopTab } = this.state
    const setActiveTopTab = (activeTopTab) => this.setState({ activeTopTab })
    const { model: modelJSON, items = {}, layout = {} } = json || {}

    return (
      <DndProvider backend={HTML5Backend}>
        <Section stylesheet={[classnames('app')]}>
          <Section stylesheet={[classnames('app__top-bar')]}>
            <Section stylesheet={[classnames('app__top-tab', activeTopTab === 0 ? 'app__top-tab--active' : null)]} onHit={() => setActiveTopTab(0)}>模型设计</Section>
            <Section stylesheet={[classnames('app__top-tab', activeTopTab === 1 ? 'app__top-tab--active' : null)]} onHit={() => setActiveTopTab(1)}>组件设计</Section>
            <Section stylesheet={[classnames('app__top-tab', activeTopTab === 2 ? 'app__top-tab--active' : null)]} onHit={() => setActiveTopTab(2)}>表单设计</Section>
            <Section stylesheet={classnames('app__top-buttons')}>
              {!config.disableSave ? <Button primary onHit={() => onSave()}>保存</Button> : null}
              {!config.disableReset ? <Button secondary onHit={() => onReset()}>重置</Button> : null}
              {!config.disableImport ? <Button secondary onHit={() => onImport()}>导入</Button> : null}
              {!config.disableDownload ? <Button secondary onHit={() => onDownload()}>导出</Button> : null}
            </Section>
          </Section>
          {activeTopTab === 0 ? <ModelDesigner config={config} modelJSON={modelJSON} onModelJSONChange={this.handleModelJSONChange} /> : null}
          {activeTopTab === 1 ? <ComponentsDesigner config={config} json={items} onChange={this.handleItemsChange} /> : null}
          {activeTopTab === 2 ? <LayoutDesigner config={config} layoutJSON={layout} itemsJSON={items} onChange={this.handleLayoutChange} /> : null}
        </Section>
      </DndProvider>
    )
  }
}

export default App
