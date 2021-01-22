import React, { Component, useState, useRef } from 'react'
import styled from 'styled-components'
import { getObjectHash, isEmpty } from 'ts-fns'
import { Loader } from 'tyshemo'
import { Button, PrimaryButton, SecondaryButton } from './components/button/button.jsx'
import { Modal } from './components/modal/modal.jsx'
import { Form, FormItem, Label, Input, Select, Textarea, FormLoopItem } from './components/form/form.jsx'
import produce from 'immer'

// -------------------------------------

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
  width: 400px;
`

const Line = styled.div`
  display: block;
  border-bottom: #f1f1f1 solid 1px;
  margin: 10px 0;
`

// -------------------------------------

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

// -------------------------------------

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
    const { config, onSave, onReset, onDowload, json, onJSONChange, onImport } = this.props
    const { activeTopTab } = this.state
    const setActiveTopTab = (activeTopTab) => this.setState({ activeTopTab })
    const { model: modelJSON } = json || {}

    const handleModelJSONChange = (modelJSON) => {
      const { model, ...others } = json || {}
      const next = { model: modelJSON, ...others }
      onJSONChange(next)
    }

    return (
      <Container>
        <TopBar>
          <TopTab active={activeTopTab === 0} onClick={() => setActiveTopTab(0)}>模型设计</TopTab>
          <TopTab active={activeTopTab === 1} onClick={() => setActiveTopTab(1)}>组件设计</TopTab>
          <TopTab active={activeTopTab === 2} onClick={() => setActiveTopTab(2)}>表单设计</TopTab>
          <TopButtons>
            <PrimaryButton onClick={() => onSave()}>保存</PrimaryButton>
            <SecondaryButton onClick={() => onReset()}>重置</SecondaryButton>
            <SecondaryButton onClick={() => onImport()}>导入</SecondaryButton>
            <SecondaryButton onClick={() => onDowload()}>下载</SecondaryButton>
          </TopButtons>
        </TopBar>
        {activeTopTab === 0 ? <ModelDesigner config={config} modelJSON={modelJSON} onModelJSONChange={handleModelJSONChange} /> : null}
      </Container>
    )
  }
}

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
    const { modelJSON = {}, onModelJSONChange } = this.props
    const { CatItem } = ModelDesigner
    const { activeCatItem } = this.state
    const setActiveCatItem = (activeCatItem) => this.setState({ activeCatItem })

    const { schema, state, methods } = modelJSON

    const handleModelJSONChange = (modelJSON) => {
      onModelJSONChange(modelJSON)
      setModelInstance(modelJSON)
    }

    return (
      <Content>
        <LeftSidebar>
          <CatItem active={activeCatItem === 0} onClick={() => setActiveCatItem(0)}>Schema（字段）</CatItem>
          <CatItem active={activeCatItem === 1} onClick={() => setActiveCatItem(1)}>State（属性）</CatItem>
          <CatItem active={activeCatItem === 2} onClick={() => setActiveCatItem(2)}>Methods（方法）</CatItem>
        </LeftSidebar>
        <SchemaDesigner
          schemaJSON={schema}
          onSchemaJSONChange={(schema) => {
            const nextModelJSON = { ...modelJSON, schema }
            handleModelJSONChange(nextModelJSON)
          }}
        />
      </Content>
    )
  }
}

class SchemaDesigner extends Component {
  static Field = styled.div`
    border-bottom: #f1f1f1 solid 1px;
    border-radius: 5px;
    padding: 15px 20px;
    margin-left: 20px;
    display: flex;
    align-items: center;
  `

  static FieldLabel = styled.div`
    font-size: 1.2em;
    flex: 1;
  `

  static Section = styled.section`
    padding: 20px;
  `

  state = {
    isShow: false,
    edit: '',
  }

  handleAddField = () => {
    this.setState({ isShow: true })
  }

  parseMetaToJSON(meta) {}

  parseSchemaJSONToMetas(json) {}

  render() {
    const { Field, FieldLabel, Section } = SchemaDesigner
    const { schemaJSON = {}, onSchemaJSONChange } = this.props
    const fields = Object.keys(schemaJSON)

    const handleSubmitSchema = (meta) => {
      console.log(meta)

      // const { field, label } = this.state
      // const next = {
      //   ...schemaJSON,
      //   [field]: { label },
      // }
      // onSchemaJSONChange(next)
      // this.setState({
      //   isShow: false,
      //   field: '',
      //   label: '',
      // })
    }

    return (
      <>
        <MainSection>
          {fields.map((field) => {
            return (
              <Field key={field}>
                <FieldLabel>{field + '（' + schemaJSON[field].label + '）'}</FieldLabel>
                <PrimaryButton onClick={() => this.setState({ edit: field })}>编辑</PrimaryButton>
                <SecondaryButton>删除</SecondaryButton>
              </Field>
            )
          })}

          <Section>
            <PrimaryButton onClick={this.handleAddField}>添加新字段</PrimaryButton>
          </Section>
        </MainSection>
        {this.state.edit ? <RightSidebar><MetaForm aside /></RightSidebar> : null}

        <Modal width="900" title="新建字段" isShow={this.state.isShow} onClose={() => this.setState({ isShow: false })}  onCancel={() => this.setState({ isShow: false })} onSubmit={() => this.setState({ isShow: false })}>
          {(stream$) => <MetaForm modal$={stream$} onSubmit={handleSubmitSchema} />}
        </Modal>
      </>
    )
  }
}

class MetaForm extends Component {
  static attrTypes = [
    { value: 0, text: '纯文本' },
    { value: 1, text: '表达式' },
    { value: 2, text: '函数式' },
  ]

  static RichPropEditor(props) {
    const { label, data, onChange, options } = props
    const items = MetaForm.attrTypes.filter(item => options ? options.includes(item.value) : true)
    return (
      <>
        <Label>{label}</Label>
        <Select width="60" options={items} value={data.type} onChange={(e) => onChange(produce(data, data => { data.type = +e.target.value }))} />
        {data.type === 2 ? <Input width="60" placeholder="参数" value={data.params} onChange={(e) => onChange(produce(data, data => { data.params = e.target.value }))} /> : null}
        <Input value={data.value} onChange={(e) => onChange(produce(data, data => { data.value = e.target.value }))} />
      </>
    )
  }

  static CustomField(props) {
    const { onSubmit } = props
    const [field, setField] = useState('')
    const el = useRef()
    return (
      <>
        <Label style={{ width: 'auto' }}><Input sm value={field} onChange={e => setField(e.target.value)} ref={el} /></Label>
        <SecondaryButton onClick={() => {
          if (!field) {
            el.current.focus()
            return
          }
          onSubmit(field)
          setField('')
        }}>添加自定义属性</SecondaryButton>
      </>
    )
  }

  state = {
    field: {
      value: '',
    },
    label: {
      value: '',
    },
    default: {
      type: 0,
      params: '',
      value: '',
    },
    type: {
      value: '',
    },
    required: {
      type: 1,
      params: '',
      value: '',
    },
    hidden: {
      type: 1,
      params: '',
      value: '',
    },
    disabled: {
      type: 1,
      params: '',
      value: '',
    },
    validators: [],
  }

  componentDidMount() {
    const { data, modal$, onSubmit } = this.props

    if (data) {
      this.setState(data)
    }

    if (modal$) {
      modal$.subscribe((type) => {
        if (type === 'submit') {
          const state = this.state
          onSubmit(state)
        }
      })
    }
  }

  render() {
    const { RichPropEditor, CustomField } = MetaForm
    const { aside } = this.props

    const handleChangeState = (fn) => {
      const next = produce(this.state, state => {
        fn(state)
      })
      this.setState(next)
    }

    const handleAddValidator = (index) => {
      handleChangeState(state => {
        state.validators.splice(isEmpty(index) ? 0 : index + 1, 0, {
          determine: {
            type: 1,
            params: '',
            value: '',
          },
          validate: {
            type: 2,
            params: 'value',
            value: '',
          },
          message: {
            value: '',
          },
        })
      })
    }

    const handleDelValidator = (index) => {
      handleChangeState(state => {
        state.validators.splice(index, 1)
      })
    }

    const handleAddCustomField = (field) => {
      if (this.state[field]) {
        throw new Error('不允许添加已经存在的属性')
      }
      handleChangeState(state => {
        state[field] = {
          type: 0,
          params: '',
          value: '',
        }
      })
    }

    const { field, default: defaultValue, label, type, required, disabled, hidden, validators, ...customs } = this.state
    const customKeys = Object.keys(customs)

    return (
      <Form aside={aside}>
        <FormItem>
          <Label>字段 Key</Label>
          <Input value={field.value} onChange={(e) => handleChangeState(state => state.field.value = e.target.value)} />
        </FormItem>
        <FormItem>
          <Label>显示名（label）</Label>
          <Input value={label.value} onChange={(e) => handleChangeState(state => state.label.value = e.target.value)} />
        </FormItem>
        <FormItem>
          <RichPropEditor label="默认值（default）" data={defaultValue} onChange={data => this.setState({ default: data })} />
        </FormItem>
        <FormItem>
          <Label>类型（type）</Label>
          <Textarea value={type.value} onChange={(e) => handleChangeState(state => state.type.value = e.target.value)} />
        </FormItem>
        <FormItem>
          <RichPropEditor label="是否必填（required）" options={[1, 2]} data={required} onChange={data => this.setState({ required: data })} />
        </FormItem>
        <FormItem>
          <RichPropEditor label="是否隐藏（hidden）" options={[1, 2]} data={hidden} onChange={data => this.setState({ hidden: data })} />
        </FormItem>
        <FormItem>
          <RichPropEditor label="是否禁用（disabled）" options={[1, 2]} data={disabled} onChange={data => this.setState({ disabled: data })} />
        </FormItem>
        <FormItem>
          <Label>校验器（validators）</Label>
          <FormLoopItem
            items={validators}
            onAdd={handleAddValidator}
            onDel={handleDelValidator}
            onChange={validators => this.setState({ validators })}
            render={(i, validator, onChange) => {
              return (
                <>
                  <FormItem>
                    <RichPropEditor label="是否校验（determine）" options={[1, 2]} data={validator.determine} onChange={determine => onChange({ determine })} />
                  </FormItem>
                  <FormItem>
                    <RichPropEditor label="校验函数（validate）" options={[2]} data={validator.validate} onChange={validate => onChange({ validate })} />
                  </FormItem>
                  <FormItem>
                    <Label>消息（message）</Label>
                    <Input value={validator.message.value} onChange={e => onChange({
                      message: { value: e.target.value },
                    })} />
                  </FormItem>
                  {i !== validators.length - 1 ? <Line /> : null}
                </>
              )
            }}
          />
        </FormItem>
        {
          customKeys.map((key) => {
            const custom = customs[key]
            const { key: _, ...data } = custom
            return (
              <FormItem key={key}>
                <RichPropEditor label={key} data={data} onChange={data => {
                  handleChangeState(state => {
                    state[key] = { key, ...data }
                  })
                }} />
              </FormItem>
            )
          })
        }
        <FormItem>
          <CustomField onSubmit={handleAddCustomField} />
        </FormItem>
      </Form>
    )
  }
}