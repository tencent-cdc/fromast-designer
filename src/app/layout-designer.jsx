import { React, Component, Section, Text, If, Else, Switch, Case, ifexist } from 'nautil'
import { render, unmount } from 'nautil/dom'
import { classnames, getConfig } from '../utils'
import { Form, FormItem, Label, Input, Textarea, Select } from '../components/form/form.jsx'
import { RichPropEditor } from '../components/rich-prop-editor/rich-prop-editor.jsx'
import { Popup } from '../libs/popup.js'
import { find, compute_, debounce, decideby } from 'ts-fns'
import { Designer } from '../components/designer/designer.jsx'
import ScopeX from 'scopex'
import { AutoModal } from '../components/modal/modal.jsx'
import { Tabs } from '../components/tabs/tabs.jsx'
import { Prompt } from '../components/prompt/prompt.jsx'
import { COMPONENT_TYPES } from '../config/constants.js'
import { globalModelScope } from '../utils'
import { store, useStore } from '../components/drag-drop/store.js'

export class LayoutDesigner extends Component {
  static props = {
    config: Object,
    json: Object,
    onLayoutChange: true,
  }

  state = {
    bindField: '',
    aliasFields: [],
    aliasProps: [],
    activeSetting: 0,
    // 保存配置时使用
    top: null,
  }

  data = {
    settingTabs: [
      {
        text: '数据配置',
        value: 0,
      },
      {
        text: 'UI配置',
        value: 1,
      },
    ]
  }

  handleSaveSettings = debounce(() => {
    const { top } = this.state
    const { onLayoutChange } = this.props
    onLayoutChange(top.getHyperJSON())
  }, 500)

  handleChange = (top) => {
    this.setState({ top })
    this.handleSaveSettings()
  }

  handleRemove = (item) => {
    const selectedMonitor = store.getState()
    if (selectedMonitor && selectedMonitor === item) {
      this.setState({ activeSetting: 0 })
      store.resetState()
    }
  }
  handleSelect = (selectedMonitor) => {
    const { bindField } = selectedMonitor
    this.setState({ activeSetting: 0, bindField })
    store.dispatch(selectedMonitor)
  }

  parseExp = (monitor) => (exp, locals) => {
    const { bindField } = monitor

    const scope = {}
    const model = globalModelScope.get()

    if (bindField) {
      scope[bindField] = model.$views[bindField]
    }

    // TODO 其他类型

    if (locals) {
      Object.assign(scope, locals)
    }

    const scopex = new ScopeX(scope)
    return scopex.parse(exp)
  }

  getComponentsConfig = compute_(function(componentsJSON) {
    if (!componentsJSON) {
      return {}
    }

    const names = Object.keys(componentsJSON)
    if (!names.length) {
      return {}
    }

    const config = {
      groups: [
        {
          id: 'components',
          title: '组件素材',
          sort: 0,
          items: names.map((name) => {
            const item = {
              id: name,
              title: name,
              tag: 'builtin-component',
              mount(el) {
                render(el, <BuiltinItem name={name} data={componentsJSON[name]} />)
              },
              update(el) {
                item.mount(el)
              },
              unmount(el) {
                unmount(el)
              },
            }
            return item
          }),
        },
      ]
    }
    return config
  })

  handleBindField = (value) => {
    this.setState({ bindField: value }, () => {
      const selectedMonitor = store.getState()
      const { fromMetaToProps } = selectedMonitor.source
      const schema = this.props.json?.model?.schema || {}
      const meta = schema[value]

      const props = fromMetaToProps(value, meta, selectedMonitor)
      if (props) {
        selectedMonitor.setExpProps(props)
      }
      selectedMonitor.bindField = value
      this.update()

      this.handleSaveSettings()
    })
  }

  Render() {
    const { activeSetting, bindField, aliasFields, aliasProps } = this.state
    const { state: selectedMonitor } = useStore()
    const { settingTabs } = this.data
    const { json = {}, config } = this.props
    const { model = {}, components = {}, layout = {} } = json

    const fields = decideby(() => {
      if (!model.schema) {
        return []
      }
      const keys = Object.keys(model.schema)
      return keys.map((key) => ({ text: model.schema[key].label, value: key }))
    })

    const componentsConfig = this.getComponentsConfig(components)
    const sourceConfig = getConfig(componentsConfig, getConfig(config))

    const jsx = layout && find(layout, (_, key) => /^render!$/.test(key))
    const elements = jsx && [jsx]

    return (
      <Section stylesheet={[classnames('content layout-designer')]}>
        <Designer
          settings={
            <If is={!!selectedMonitor} render={() =>
              <Section stylesheet={[classnames('layout-designer__settings')]}>
                <Section stylesheet={[classnames('layout-designer__settings-menus')]}>
                  <Tabs items={settingTabs} active={activeSetting} onSelect={(item) => this.setState({ activeSetting: item.value })} />
                </Section>
                <Section stylesheet={[classnames('layout-designer__settings-content')]}>
                  <Switch of={activeSetting}>
                    <Case is={0} render={() =>
                      <Form aside>
                        <If is={selectedMonitor.source.type === COMPONENT_TYPES.ATOM} render={() =>
                          <FormItem>
                            <Label>绑定字段</Label>
                            <Select options={fields} value={bindField} onChange={(e) => this.handleBindField(e.target.value)} placeholder="请选择字段"></Select>
                          </FormItem>
                        }>
                        </If>
                      </Form>
                    } />
                    <Case is={1} render={() =>
                      <Form aside>
                        {selectedMonitor.source.props.map((item) => {
                          return (
                            <FormItem key={item.key} stylesheet={[classnames('form-item--rich')]}>
                              <RichPropEditor
                                label={item.title || item.key}
                                data={selectedMonitor.props[item.key]}
                                types={item.types}
                                onChange={data => {
                                  selectedMonitor.props[item.key] = data
                                  this.update()
                                }}
                              />
                            </FormItem>
                          )
                        })}
                      </Form>
                    } />
                  </Switch>
                </Section>
              </Section>
            } />
          }
          elements={elements}
          config={sourceConfig}
          onRemove={this.handleRemove}
          onSelect={this.handleSelect}
          onChange={this.handleChange}
          expParser={this.parseExp}
        />
      </Section>
    )
  }
}
export default LayoutDesigner

class BuiltinItem extends Component {
  render() {
    const { name, data } = this.props
    return (
      <div className={classnames('builtin-item')}>
        <span>{`<${name} />`}</span>
        <AutoModal trigger={(show) => <button type="button" className={classnames('builtin-item__button')} onClick={show}>详情</button>} title="组件配置信息" disableCancel>
          <pre className={classnames('builtin-item__preview')}>{JSON.stringify(data, null, 4)}</pre>
        </AutoModal>
      </div>
    )
  }
}
