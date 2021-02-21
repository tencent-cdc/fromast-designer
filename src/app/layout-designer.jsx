import { React, Component, Section, Text, If, Switch, Case } from 'nautil'
import { render, unmount } from 'nautil/dom'
import { classnames, getConfig } from '../utils'
import { Form, FormItem, Label, Input } from '../components/form/form.jsx'
import { RichPropEditor } from '../components/rich-prop-editor/rich-prop-editor.jsx'
import { Button } from '../components/button/button.jsx'
import { Popup } from '../libs/popup.js'
import { find, compute_ } from 'ts-fns'
import { Designer } from '../components/designer/designer.jsx'
import ScopeX from 'scopex'
import DefaultLayoutConfig from '../config/layout.jsx'
import { AutoModal } from '../components/modal/modal.jsx'

export class LayoutDesigner extends Component {
  state = {
    layoutSetting: {
      props: '',
      alias: '',
    },
    selectedMonitor: null,
    // 保存配置时使用
    jsx: null,
    activeSetting: 0,
  }

  handleSaveSettings = () => {
    const { jsx, layoutSetting } = this.state
    const { onChange } = this.props

    if (!jsx) {
      return Popup.toast('请完成组件设计！')
    }

    const { props, alias } = layoutSetting
    const renderKey = `render(${alias})!`

    const layout = {
      props: props.split(',').filter(item => !!item),
      [renderKey]: jsx,
    }

    onChange(layout)

    Popup.toast('保存配置成功')
  }
  handleChange = (jsx) => {
    this.setState({ jsx })
  }

  handleRemove = (item) => {
    if (this.state.selectedMonitor && this.state.selectedMonitor === item) {
      this.setState({ activeSetting: 0, selectedMonitor: null })
    }
  }
  handleSelect = (selectedMonitor) => {
    this.setState({ selectedMonitor, activeSetting: 1 })
  }

  parseExp = (exp, locals) => {
    const scope = {}
    if (locals) {
      Object.assign(scope, locals)
    }
    const scopex = new ScopeX(scope)
    return scopex.parse(exp)
  }

  getItemsConfig = compute_(function(itemsJSON) {
    if (!itemsJSON) {
      return {}
    }

    const names = Object.keys(itemsJSON)
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
              mount(el) {
                render(el, <BuiltinItem name={name} data={itemsJSON[name]} />)
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

  render() {
    const { selectedMonitor } = this.state
    const { layoutJSON, itemsJSON, config } = this.props

    const itemsConfig = this.getItemsConfig(itemsJSON)
    const sourceConfig = getConfig(itemsConfig, getConfig(config, DefaultLayoutConfig))

    const jsx = find(layoutJSON, (_, key) => /^render\(.*?\)!$/.test(key))
    const elements = jsx && [jsx]

    return (
      <Section stylesheet={[classnames('content layout-designer')]}>
        <Designer
          buttons={<Button primary onHit={this.handleSaveSettings}>保存配置</Button>}
          settings={
            <Section stylesheet={[classnames('layout-designer__settings')]}>
              <Section stylesheet={[classnames('layout-designer__settings-menus')]}>
                <Section stylesheet={[classnames('layout-designer__settings-menu', this.state.activeSetting === 0 ? 'layout-designer__settings-menu--active' : '')]} onHit={() => this.setState({ activeSetting: 0 })}><Text>布局配置</Text></Section>
                <If is={!!selectedMonitor}><Section stylesheet={[classnames('layout-designer__settings-menu', this.state.activeSetting === 1 ? 'layout-designer__settings-menu--active' : '')]} onHit={() => this.setState({ activeSetting: 1 })}><Text>素材配置</Text></Section></If>
              </Section>
              <Switch of={this.state.activeSetting}>
                <Case is={0}>
                  <Section stylesheet={[classnames('layout-designer__setting')]}>
                    <Form>
                      <FormItem>
                        <Label>Props</Label>
                        <Input value={this.state.layoutSetting.props} onChange={(e) => this.update(state => { state.layoutSetting.props = e.target.value })} placeholder="Props上的属性，例如：a,b,c" />
                      </FormItem>
                      <FormItem>
                        <Label>别名</Label>
                        <Input value={this.state.layoutSetting.alias} onChange={(e) => this.update(state => { state.layoutSetting.alias = e.target.value })} placeholder="将Props映射到作用域中，例如将a,b,c映射为$a,$b,$c" />
                      </FormItem>
                    </Form>
                  </Section>
                </Case>
                <Case is={1}>
                  <Section stylesheet={[classnames('layout-designer__setting')]}>
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
        <AutoModal trigger={(show) => <button className={classnames('builtin-item__button')} onClick={show}>详情</button>} title="组件配置信息" disableCancel>
          <pre className={classnames('builtin-item__preview')}>{JSON.stringify(data, null, 4)}</pre>
        </AutoModal>
      </div>
    )
  }
}
