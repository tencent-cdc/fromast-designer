import { React, Component, Section } from 'nautil'
import { Button } from '../components/button/button.jsx'
import { classnames, globalModelScope } from '../utils'
import { ModelDesigner } from './model-designer.jsx'

// -------------------------------------

export default class App extends Component {
  state = {
    activeTopTab: 0,
  }

  constructor(props) {
    super(props)

    // 进来以后实例化，在render中好用
    const { json } = props
    const { model = {} } = json || {}
    globalModelScope.set(model)
  }

  render() {
    const { config, onSave, onReset, onDownload, json, onJSONChange, onImport } = this.props
    const { activeTopTab } = this.state
    const setActiveTopTab = (activeTopTab) => this.setState({ activeTopTab })
    const { model: modelJSON } = json || {}

    const handleModelJSONChange = (modelJSON) => {
      const { model, ...others } = json || {}
      const next = { model: modelJSON, ...others }
      onJSONChange(next)
    }

    return (
      <Section stylesheet={[classnames('app')]}>
        <Section stylesheet={[classnames('app__top-bar')]}>
          <Section stylesheet={[classnames('app__top-tab', activeTopTab === 0 ? 'app__top-tab--active' : null)]} onHit={() => setActiveTopTab(0)}>模型设计</Section>
          <Section stylesheet={[classnames('app__top-tab', activeTopTab === 1 ? 'app__top-tab--active' : null)]} onHit={() => setActiveTopTab(1)}>素材设计</Section>
          <Section stylesheet={[classnames('app__top-tab', activeTopTab === 2 ? 'app__top-tab--active' : null)]} onHit={() => setActiveTopTab(2)}>表单设计</Section>
          <Section stylesheet={classnames('app__top-buttons')}>
            {!config.disableSave ? <Button primary onHit={() => onSave()}>保存</Button> : null}
            {!config.disableReset ? <Button secondary onHit={() => onReset()}>重置</Button> : null}
            {!config.disableImport ? <Button secondary onHit={() => onImport()}>导入</Button> : null}
            {!config.disableDownload ? <Button secondary onHit={() => onDownload()}>下载</Button> : null}
          </Section>
        </Section>
        {activeTopTab === 0 ? <ModelDesigner config={config} modelJSON={modelJSON} onModelJSONChange={handleModelJSONChange} /> : null}
      </Section>
    )
  }
}
