import { React, Component, Section, Text, If, Else, Each, Switch, Case, produce } from 'nautil'
import { classnames } from '../utils'
import { DragDesigner, DropDesigner } from '../components/drag-drop/designer.jsx'
import { Form, FormItem, Label, Input } from '../components/form/form.jsx'
import { RichPropEditor } from '../components/rich-prop-editor/rich-prop-editor.jsx'
import { Button } from '../components/button/button.jsx'
import { AutoModal } from '../components/modal/modal.jsx'
import { Popup } from '../libs/popup.js'
import { Confirm } from '../components/confirm/confirm.jsx'
import { map, each, find } from 'ts-fns'
import { globalModelScope, parseKey } from '../utils'
import ScopeX from 'scopex'

const defaultState = {
  // 添加组件时使用
  form: {
    name: '',
    fields: '',
    alias: '',
  },
  selectedComponent: null,
  activeSetting: 0,
  // 组件的配置
  componentSetting: {
    fields: '',
    alias: '',
  },
  selectedMonitor: null,
  // 保存配置时使用
  monitors: null,
}

export class ComponentsDesigner extends Component {
  state = defaultState

  handleAddComponent = () => {
    const { form } = this.state
    const { json, onChange } = this.props
    const { name, fields, alias } = form

    if (name in json) {
      Popup.toast('组件已经存在，请使用其他组件名')
      return false
    }

    if (!/^[a-zA-Z0-9]+$/.test(name)) {
      Popup.toast('组件名必须全部为英文字母（可含数字）')
      return false
    }

    if (!/^[A-Z]/.test(name)) {
      Popup.toast('组件名必须以大写字母开头')
      return false
    }

    const items = {
      ...json,
      [name]: {
        fields: fields.split(','),
        [`render(${alias})!`]: [],
      },
    }

    onChange(items)

    this.setState({ form: { name: '', fields: '', alias: '' } })

    return true
  }
  handleSelectComponent = (selectedComponent) => {
    const data = this.props.json[selectedComponent] || {}
    const { fields = [] } = data
    const componentSetting = {
      fields: fields.join(','),
      alias: '',
    }

    each(data, (_, key) => {
      const [name, params] = parseKey(key)
      if (name === 'render') {
        componentSetting.alias = params.join(',')
      }
    })

    this.setState({ ...defaultState, selectedComponent, componentSetting })
  }
  handleRemoveComponent = () => {
    const { selectedComponent } = this.state
    const { json, onChange } = this.props
    const items = produce(json, items => { delete items[selectedComponent] })
    onChange(items)
    this.setState(defaultState)
  }
  handleSaveSettings = () => {
    const { monitors, selectedComponent, componentSetting } = this.state
    const { json, onChange } = this.props

    if (!monitors) {
      return Popup.toast('请完成组件设计！')
    }

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
    const jsx = extract(monitors[0])

    const { fields, alias } = componentSetting
    const renderKey = `render(${alias})!`

    const items = {
      ...json,
      [selectedComponent]: {
        fields: fields.split(',').filter(item => !!item),
        [renderKey]: jsx,
      },
    }

    onChange(items)

    Popup.toast('保存配置成功')
  }

  handleRemove = (item) => {
    if (this.state.selectedMonitor && this.state.selectedMonitor === item) {
      this.setState({ activeSetting: 0, selectedMonitor: null })
    }
  }
  handleChange = (monitors) => {
    this.setState({ monitors })
  }
  handleSelect = (selectedMonitor) => {
    this.setState({ selectedMonitor, activeSetting: 1 })
  }

  parseExp = (exp, locals) => {
    const { componentSetting } = this.state
    const { fields, alias } = componentSetting
    const scope = {}
    const model = globalModelScope.get()

    const fieldItems = fields.split(',')
    alias.split(',').forEach((item, i) => {
      if (!item) {
        return
      }
      const field = fieldItems[i]
      if (!field) {
        return
      }
      const view = model.$views[field]
      scope[item] = view
    })

    if (locals) {
      Object.assign(scope, locals)
    }

    const scopex = new ScopeX(scope)
    return scopex.parse(exp)
  }

  render() {
    const { selectedMonitor, selectedComponent } = this.state
    const { json, config } = this.props

    const components = Object.keys(json)
    const item = json[selectedComponent] || {}
    const jsx = find(item, (_, key) => /^render\(.*?\)!$/.test(key))
    const elements = jsx && [jsx]

    return (
      <Section stylesheet={[classnames('content components-designer')]}>
        <Section stylesheet={[classnames('sidebar sidebar--left sidebar--small')]}>
          <Each of={components} render={(component) =>
            <Section key={component} stylesheet={[classnames('components-designer__component-name', selectedComponent && component === selectedComponent ? 'components-designer__component-name--active' : '')]} onHit={() => this.handleSelectComponent(component)}>
              <Text>{component}</Text>
            </Section>
          } />
          <AutoModal
            title="添加组件"
            trigger={show => <Button primary onHit={show} stylesheet={[classnames('component-designer__component-add')]}>+ 添加组件</Button>}
            onCancel={() => this.setState({ form: { name: '', fields: '', alias: '' } })}
            onClose={() => this.setState({ form: { name: '', fields: '', alias: '' } })}
            onSubmit={this.handleAddComponent}
          >
            <Form>
              <FormItem>
                <Label>组件名</Label>
                <Input value={this.state.form.name} onChange={e => this.update(state => { state.form.name = e.target.value })} placeholder="全英文，首字母大写" />
              </FormItem>
              <FormItem>
                <Label>字段</Label>
                <Input value={this.state.form.fields} onChange={e => this.update(state => { state.form.fields = e.target.value })} placeholder="模型上的字段，例如：a,b,c" />
              </FormItem>
              <FormItem>
                <Label>别名</Label>
                <Input value={this.state.form.alias} onChange={e => this.update(state => { state.form.alias = e.target.value })} placeholder="将字段映射为别名在组件内使用" />
              </FormItem>
            </Form>
          </AutoModal>
        </Section>
        <If is={!!selectedComponent}>
          <Section stylesheet={[classnames('main')]}>
            <Section stylesheet={[classnames('components-designer__buttons')]}>
              <Button primary onHit={this.handleSaveSettings}>保存配置</Button>
              <Confirm
                trigger={show => <Button secondary onHit={show}>删除组件</Button>}
                title="提示"
                content="确认删除组件吗？"
                onSubmit={this.handleRemoveComponent}
              />
            </Section>
            <DropDesigner
              className={classnames('components-designer__canvas')}
              onChange={this.handleChange}
              onSelect={this.handleSelect}
              onRemove={this.handleRemove}
              expParser={this.parseExp}
              selected={selectedMonitor}
              max={1}
              config={config}
              elements={elements}
            />
            <Section stylesheet={[classnames('components-designer__settings')]}>
              <Section stylesheet={[classnames('components-designer__settings-menus')]}>
                <Section stylesheet={[classnames('components-designer__settings-menu', this.state.activeSetting === 0 ? 'components-designer__settings-menu--active' : '')]} onHit={() => this.setState({ activeSetting: 0 })}><Text>组件配置</Text></Section>
                <If is={!!selectedMonitor}><Section stylesheet={[classnames('components-designer__settings-menu', this.state.activeSetting === 1 ? 'components-designer__settings-menu--active' : '')]} onHit={() => this.setState({ activeSetting: 1 })}><Text>素材配置</Text></Section></If>
              </Section>
              <Switch of={this.state.activeSetting}>
                <Case is={0}>
                  <Section stylesheet={[classnames('components-designer__setting')]}>
                    <Form>
                      <FormItem>
                        <Label>字段</Label>
                        <Input value={this.state.componentSetting.fields} onChange={(e) => this.update(state => { state.componentSetting.fields = e.target.value })} placeholder="模型上的字段，例如：a,b,c" />
                      </FormItem>
                      <FormItem>
                        <Label>别名</Label>
                        <Input value={this.state.componentSetting.alias} onChange={(e) => this.update(state => { state.componentSetting.alias = e.target.value })} placeholder="将字段映射到作用域中，例如将a,b,c映射为$a,$b,$c" />
                      </FormItem>
                    </Form>
                  </Section>
                </Case>
                <Case is={1}>
                  <Section stylesheet={[classnames('components-designer__setting')]}>
                    <If is={!!selectedMonitor} render={() =>
                      <Form>
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
                  </Section>
                </Case>
              </Switch>
            </Section>
          </Section>
          <Section stylesheet={[classnames('sidebar sidebar--right components-designer__sources dragable')]}>
            <DragDesigner config={config} />
          </Section>
        <Else />
          <Section stylesheet={[classnames('components-designer__empty')]}>请添加或选中组件后再操作</Section>
        </If>
      </Section>
    )
  }
}
