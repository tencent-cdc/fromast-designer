import { React, Component, Section, Textarea } from 'nautil'
import { Button } from '../components/button/button.jsx'
import { Popup } from '../libs/popup.js'
import { classnames } from '../utils'

export class StateDesigner extends Component {
  state = {
    json: '',
  }

  onMounted() {
    const { stateJSON = {} } = this.props
    const json = JSON.stringify(stateJSON, null, 4)
    this.setState({ json })
  }

  handleStateJSONChange = (e) => {
    const value = e.target.value
    this.setState({ json: value })

    try {
      JSON.parse(value)
      Popup.hide()
    }
    catch (e) {
      Popup.toast('JSON格式不对：' + e)
    }
  }

  handleSubmit = () => {
    const { onStateJSONChange } = this.props
    const { json } = this.state

    try {
      const state = JSON.parse(json)
      onStateJSONChange(state)
      Popup.toast('更新成功')
    }
    catch (e) {
      Popup.toast('JSON格式不对：' + e)
    }
  }

  render() {
    const { json } = this.state

    return (
      <Section stylesheet={[classnames('state-designer')]}>
        <Textarea stylesheet={[classnames('state-designer__editor')]} value={json} onChange={this.handleStateJSONChange} />
        <Section stylesheet={[classnames('state-designer__buttons')]}>
          <Button primary onHit={this.handleSubmit}>提交</Button>
        </Section>
      </Section>
    )
  }
}
