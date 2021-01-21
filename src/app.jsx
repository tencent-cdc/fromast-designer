import React, { Component } from 'react'
import styled from 'styled-components'
import { getObjectHash } from 'ts-fns'
import { Loader } from 'tyshemo'
import { Button, PrimaryButton, SecondaryButton } from './components/button/button.jsx'
import { Modal } from './components/modal/modal.jsx'
import { Form, FormItem, Label, Input, Select, Textarea, FormLoopItem } from './components/form/form.jsx'
import produce from 'immer'

const PRIMARY_COLOR = '#66b1ff'
const PRIMARY_COLOR_DARK = '#4e9cf0'
const SECONDARY_COLOR = '#eee'
const SECONDARY_COLOR_DARK = '#e3e0e0'

const Content = styled.div`
  display: flex;
  margin-top: 15px;
`

const Container = styled.div`
  color: #515151;
  flex: 1;
  height: 100%;

  display: flex;
  flex-direction: column;

  ${Content} {
    flex: 1;
  }

  ${Button} {
    margin-left: 5px;
  }
`


const globalModelScope = {}
function setModelInstance(modelJSON) {
  if (!modelJSON.schema) {
    return
  }

  const hash = getObjectHash(modelJSON)
  if (hash === globalModelScope.hash) {
    return
  }
  globalModelScope.hash = hash

  const Model = new Loader().parse(modelJSON)
  const model = new Model()
  globalModelScope.model = model
}

export default class App extends Component {
  static TopBar = styled.div`
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 2px 5px #ccc;
  `

  static TopButtons = styled.div`
    position: absolute;
    top: 10px;
    right: 10px;
  `

  static TopTab = styled.div`
    font-size: 1.05em;
    margin: 0 10px;
    line-height: 47px;
    cursor: pointer;
    color: ${props => props.active ? PRIMARY_COLOR : ''};
    border-bottom: transparent solid 3px;
    border-bottom-color: ${props => props.active ? PRIMARY_COLOR : ''};
  `

  state = {
    activeTopTab: 0,
  }


  constructor(props) {
    super(props)

    // 进来以后实例化，在render中好用
    const { json } = props
    const { model = {} } = json || {}
    setModelInstance(model)
  }

  render() {
    const { TopBar, TopButtons, TopTab } = App
    const { config, onSave, onReset, onDowload, json, onJSONChange } = this.props
    const { activeTopTab } = this.state
    const setActiveTopTab = (activeTopTab) => this.setState({ activeTopTab })
    const { model: modelJSON } = json || {}

    return (
      <Container>
        <TopBar>
          <TopTab active={activeTopTab === 0} onClick={() => setActiveTopTab(0)}>模型设计</TopTab>
          <TopTab active={activeTopTab === 1} onClick={() => setActiveTopTab(1)}>组件设计</TopTab>
          <TopTab active={activeTopTab === 2} onClick={() => setActiveTopTab(2)}>表单设计</TopTab>
          <TopButtons>
            <PrimaryButton onClick={onSave}>保存</PrimaryButton>
            <SecondaryButton onClick={onReset}>重置</SecondaryButton>
            <SecondaryButton onClick={onDowload}>下载</SecondaryButton>
          </TopButtons>
        </TopBar>
        {activeTopTab === 0 ? <ModelDesigner config={config} modelJSON={modelJSON} onJSONChange={onJSONChange} /> : null}
      </Container>
    )
  }
}

const Sidebar = styled.aside`
  width: 300px;
`

const LeftSidebar = styled(Sidebar)`
  border-right: #f1f1f1 solid 1px;
`

const MainSection = styled.main`
  flex: 1;
`

const RightSidebar = styled(Sidebar)`
  border-left: #f1f1f1 solid 1px;
`

class ModelDesigner extends Component {
  static CatItem = styled.div`
    margin: 5px 0 5px 5px;
    padding: 5px 10px;
    background-color: ${props => props.active ? '#d4ebfc' : '#f9f9f9'};
    color: ${props => props.active ? '#0d5e9b' : ''};
    cursor: pointer;
  `

  state = {
    activeCatItem: 0,
  }

  render() {
    const { modelJSON = {}, onJSONChange } = this.props
    const { CatItem } = ModelDesigner
    const { activeCatItem } = this.state
    const setActiveCatItem = (activeCatItem) => this.setState({ activeCatItem })

    const { schema, state, methods } = modelJSON

    const handleModelJSONChange = (modelJSON) => {
      const json = { model: nextModel, ...others }
      setModelInstance(modelJSON)
      onJSONChange(json)
    }

    return (
      <Content>
        <LeftSidebar>
          <CatItem active={activeCatItem === 0} onClick={() => setActiveCatItem(0)}>Schema</CatItem>
          <CatItem active={activeCatItem === 1} onClick={() => setActiveCatItem(1)}>State</CatItem>
          <CatItem active={activeCatItem === 2} onClick={() => setActiveCatItem(2)}>Methods</CatItem>
        </LeftSidebar>
        <MainSection>
          <SchemaDesigner
            schemaJSON={schema}
            onSchemaJSONChange={(schema) => {
              const modelJSON = { ...model, schema }
              handleModelJSONChange(modelJSON)
            }}
          />
        </MainSection>
        <RightSidebar>right</RightSidebar>
      </Content>
    )
  }
}


class SchemaDesigner extends Component {
  static Field = styled.div`
    border: #f1f1f1 solid 1px;
    border-radius: 5px;
    padding: 15px 20px;
  `

  static Label = styled.div`
    font-size: 1.2em;
  `

  state = {
    isShow: false,
  }

  handleAddField = () => {
    this.setState({ isShow: true })
  }

  render() {
    const { Field, Label } = SchemaDesigner
    const { schema = {}, onSchemaJSONChange } = this.props
    const fields = Object.keys(schema)
    return (
      <>
        {fields.map((field) => {
          return (
            <Field key={field}>
              <Label>{schema[field].label}</Label>
            </Field>
          )
        })}
        <PrimaryButton onClick={this.handleAddField}>+</PrimaryButton>
        <SecondaryButton>-</SecondaryButton>

        <Modal isShow={this.state.isShow} onClose={() => this.setState({ isShow: false })}  onCancel={() => this.setState({ isShow: false })}>
          <SchemaForm />
        </Modal>
      </>
    )
  }
}

class SchemaForm extends Component {
  state = {
    field: '',
    label: '',
    default: {
      type: 0,
      params: '',
      value: '',
    },
    type: '',
    required: {
      params: '',
      value: '',
    },
    validators: []
  }

  expOptions = [
    { value: 0, text: '纯文本' },
    { value: 1, text: '表达式' },
    { value: 2, text: '函数式' },
  ]

  render() {
    return (
      <Form>
        <FormItem>
          <Label>字段</Label>
          <Input value={this.state.field} onChange={(e) => this.setState({ field: e.target.value })} />
        </FormItem>
        <FormItem>
          <Label>显示名（label）</Label>
          <Input value={this.state.label} onChange={(e) => this.setState({ label: e.target.value })} />
        </FormItem>
        <FormItem>
          <Label>默认值（default）</Label>
          <Select width="100" options={this.expOptions} value={this.state.default.type} onChange={(e) => this.setState(produce(this.state, state => { state.default.type = +e.target.value }))} />
          {this.state.default.type === 2 ? <Input width="100" placeholder="函数参数" value={this.state.default.params} onChange={(e) => this.setState(produce(this.state, state => { state.default.params = e.target.value }))} /> : null}
          <Input value={this.state.default.value} onChange={(e) => this.setState(produce(this.state, state => { state.default.value = e.target.value }))} />
        </FormItem>
        <FormItem>
          <Label>类型（type）</Label>
          <Textarea value={this.state.type} onChange={(e) => this.setState({ type: e.target.value })} />
        </FormItem>
        <FormItem>
          <Label>是否必填（required）</Label>
          <Select width="100" options={this.expOptions} placeholder="使用函数？" value={this.state.requiredType} onChange={(e) => this.setState({ requiredType: e.target.value })} />
          <Input value={this.state.required} onChange={(e) => this.setState({ required: e.target.value })} />
        </FormItem>
        <FormItem>
          <Label>是否隐藏（hidden）</Label>
          <Select width="100" options={this.expOptions} placeholder="使用函数？" value={this.state.hiddenType} onChange={(e) => this.setState({ hiddenType: e.target.value })} />
          <Input value={this.state.hidden} onChange={(e) => this.setState({ hidden: e.target.value })} />
        </FormItem>
        <FormItem>
          <Label>校验器（validators）</Label>
          <FormLoopItem items={this.state.validators} render={(validator, onChange) => {
            return (
              <>
                <FormItem>
                  <Label>是否校验（determine）</Label>
                  <Input value={validator.determine} />
                </FormItem>
                <FormItem>
                  <Label>校验函数（validate）</Label>
                  <Select width="100" options={this.expOptions} value={1} />
                  <Input value={validator.validate} />
                </FormItem>
                <FormItem>
                  <Label>失败信息（message）</Label>
                  <Select width="100" options={this.expOptions} placeholder="使用函数？" value={this.state.hiddenType} onChange={(e) => this.setState({ hiddenType: e.target.value })} />
                  <Input value={validator.message} />
                </FormItem>
              </>
            )
          }} />
        </FormItem>
      </Form>
    )
  }
}