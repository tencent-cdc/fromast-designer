import { React, Component, Section, Text, If, Else, ElseIf, Switch, Case, ifexist, Store } from 'nautil'
import { render, unmount } from 'nautil/dom'
import { classnames, getConfig } from '../utils'
import { Form, FormItem, Label, Input, Textarea, Select, Switcher } from '../components/form/form.jsx'
import { RichPropEditor } from '../components/rich-prop-editor/rich-prop-editor.jsx'
import { find, compute_, debounce, decideby, makeKeyChain, isArray } from 'ts-fns'
import { Designer } from '../components/designer/designer.jsx'
import ScopeX from 'scopex'
import { AutoModal } from '../components/modal/modal.jsx'
import { Tabs } from '../components/tabs/tabs.jsx'
import { Prompt } from '../components/prompt/prompt.jsx'
import { COMPONENT_TYPES } from '../config/constants.js'
import { globalModelScope, genFieldsOptions } from '../utils'

export class LayoutDesigner extends Component {
  static props = {
    layoutConfig: Object,
    json: Object,
    onLayoutJSONChange: true,
    useComponents: ifexist(Boolean),
  }

  state = {
    bindField: '',
    importFields: '',
    importProps: '',
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

  store = new Store(null)

  onMounted() {
    this.store.subscribe(this.forceUpdate)
  }

  handleSaveSettings = debounce(() => {
    const { top } = this.state
    if (!top) {
      return
    }
    const { onLayoutJSONChange } = this.props
    onLayoutJSONChange(top.getHyperJSON())
  }, 500)

  handleChange = (top) => {
    this.setState({ top })
    this.handleSaveSettings()
  }

  handleRemove = (item) => {
    const selectedMonitor = this.store.getState()
    if (selectedMonitor && selectedMonitor === item) {
      this.setState({ activeSetting: 0 })
      this.store.resetState()
    }
  }
  handleSelect = (selectedMonitor) => {
    const { bindField = '', importFields = [], importProps = [] } = selectedMonitor
    this.setState({
      activeSetting: 0,
      bindField,
      importFields: importFields.join(','),
      importProps: importProps.join(','),
    })
    this.store.dispatch(selectedMonitor)
  }

  parseExp = (monitor) => (exp, locals) => {
    const { bindField, importFields } = monitor

    const scope = {}
    const model = globalModelScope.get()

    if (bindField) {
      scope[bindField] = model.$views[bindField]
    }
    if (importFields) {
      importFields.forEach((key) => {
        scope[key] = key in model.$views ? model.$views[key] : model[key]
      })
    }

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
      const selectedMonitor = this.store.getState()
      const { fromMetaToProps } = selectedMonitor.source

      const schema = this.props.json?.model?.schema || {}
      const chain = makeKeyChain(value)
      let meta = schema

      for (let i = 0, len = chain.length; i < len; i ++) {
        const key = chain[i]
        if (`<${key}>` in meta) {
          const sub = meta[`<${key}>`]
          const info = meta[`|${key}|`] || {}
          let subSchema = null

          if (chain[i + 1] === '*') {
            if (!isArray(sub)) {
              throw new Error(`无法从schema中读取${value}中的${key}，它不是一个子模型列表`)
            }
            subSchema = sub[0].schema
            i ++
          }
          else {
            if (isArray(sub)) {
              throw new Error(`从schema中读取${value}是不允许的，必须在末尾加[*]，即${value}[*]`)
            }
            subSchema = sub.schema
          }

          // 只使用该子模型
          if (i === len - 1) {
            meta = info
          }
          // 使用子模型内部
          else {
            meta = subSchema
          }
        }
        else if (key in meta) {
          meta = meta[key]
        }
        else {
          throw new Error(`无法从schema中读取${value}中的${key}，请检查选中字段是否正常`)
        }
      }

      if (fromMetaToProps) {
        const props = fromMetaToProps(value, meta, selectedMonitor)
        selectedMonitor.setExpProps(props)
      }
      selectedMonitor.bindField = value
      this.update()

      this.handleSaveSettings()
    })
  }

  handleChangeImport = (type, value) => {
    const key = 'import' + type[0].toUpperCase() + type.substr(1)
    this.setState({ [key]: value }, () => {
      const selectedMonitor = this.store.getState()
      selectedMonitor[key] = value.split(',').filter(item => !!item)
      this.update()

      this.handleSaveSettings()
    })
  }

  render() {
    const { activeSetting, bindField, importFields, importProps } = this.state
    const selectedMonitor = this.store.getState()
    const { settingTabs } = this.data
    const { json = {}, layoutConfig, useComponents } = this.props
    const { model = {}, components = {}, layout = {} } = json

    const fieldsOptions = genFieldsOptions(model)

    const componentsConfig = useComponents ? this.getComponentsConfig(components) : {}
    const sourceConfig = getConfig(componentsConfig, getConfig(layoutConfig))

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
                    <Case is={1} render={() =>
                      <Form aside>
                        {selectedMonitor.source.props.map((item) => {
                          return (
                            <FormItem key={item.key} stylesheet={[classnames('form-item--rich')]}>
                              <RichPropEditor
                                label={item.title || item.key}
                                data={selectedMonitor.props[item.key]}
                                types={item.types}
                                options={item.options}
                                onChange={data => {
                                  selectedMonitor.props[item.key] = data
                                  this.update()
                                }}
                                description={item.description}
                              />
                            </FormItem>
                          )
                        })}
                      </Form>
                    } />
                    <Case is={0} render={() =>
                      <Form aside>
                        <If is={selectedMonitor.source.type === COMPONENT_TYPES.ATOM} render={() =>
                          <FormItem>
                            <Label>绑定字段</Label>
                            <Select options={fieldsOptions} value={bindField} onChange={(e) => this.handleBindField(e.target.value)} placeholder="请选择字段"></Select>
                          </FormItem>
                        } />
                        <FormItem>
                          <Label>使用字段</Label>
                          <Prompt type="input" options={fieldsOptions} onSelect={(e, item, focused) => {
                            const items = importFields.split(',').filter(item => !!item)
                            const { value } = item

                            if (items.includes(value)) {
                              return
                            }

                            items.push(value)
                            this.handleChangeImport('fields', items.join(','))
                          }}>
                            <Input value={importFields} onChange={(e) => this.handleChangeImport('fields', e.target.value)} />
                          </Prompt>
                        </FormItem>
                        <FormItem>
                          <Label>使用Props</Label>
                          <Input value={importProps} onChange={(e) => this.handleChangeImport('props', e.target.value)} />
                        </FormItem>
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
