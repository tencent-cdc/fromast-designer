import { React, Component, Section, Switch, Case, nonable, produce } from 'nautil'
import { classnames, globalModelScope } from '../utils'
import { SchemaDesigner } from './schema-designer.jsx'
import { StateDesigner } from './state-designer.jsx'
import { MethodsDesigner } from './methods-designer.jsx'
import { Modal } from '../components/modal/modal.jsx'
import { Form, FormItem, Label, Input, Select } from '../components/form/form.jsx'
import { isArray } from 'ts-fns'
import { Popup } from '../libs/popup'

const defaultState = {
  showSubmodelModal: false,
  submodel: {
    field: '',
    isList: 0,
    json: {},
  },
  activeSubmodelStep: 0,
  editingSubmodel: '',
}

const isListOptions = [
  { text: '否', value: 0 },
  { text: '是', value: 1 },
]

export class ModelDesigner extends Component {
  static props = {
    modelJSON: nonable(Object),
    onModelJSONChange: true,
  }

  state = {
    activeCatItem: 0,
    ...defaultState,
  }

  CreateSubmodel = (trigger) => {
    const show = () => this.setState({ showSubmodelModal: true })
    return trigger(show)
  }

  EditSubmodel = (field) => {
    const submodel = this.props.modelJSON.schema[field]
    const isList = isArray(submodel) ? 1 : 0
    this.setState({
      showSubmodelModal: true,
      submodel: {
        field: field.substring(1, field.length - 1),
        json: isList ? submodel[0] : submodel,
        isList,
      },
      editingSubmodel: field,
    })
  }

  handleSubmitSubmodel = () => {
    const { activeSubmodelStep, submodel, editingSubmodel } = this.state
    const { onModelJSONChange, modelJSON = {} } = this.props
    if (!activeSubmodelStep) {
      if (!submodel.field) {
        return Popup.toast('必须填写字段名')
      }
      this.update(state => state.activeSubmodelStep ++)
    }
    else {
      const { field, json, isList } = submodel
      const fieldKey = `<${field}>`
      const next = produce(modelJSON, model => {
        model.schema = model.schema || {}
        model.schema[fieldKey] = isList ? [json] : json
        if (editingSubmodel && editingSubmodel !== fieldKey) {
          delete model.schema[editingSubmodel]
        }
      })
      onModelJSONChange(next)
      this.setState(defaultState)
    }
  }

  handleCancelSubmodel = () => {
    this.setState(defaultState)
  }

  Render() {
    const { modelJSON = {}, onModelJSONChange, modelConfig = {} } = this.props
    const { activeCatItem, showSubmodelModal, activeSubmodelStep, submodel } = this.state
    const setActiveCatItem = (activeCatItem) => this.setState({ activeCatItem })

    const { schema, state = {}, methods = {} } = modelJSON

    const handleModelJSONChange = (modelJSON) => {
      onModelJSONChange(modelJSON)
      globalModelScope.set(modelJSON)
    }

    return (
      <Section stylesheet={[classnames('content', 'model-designer')]}>
        <Section stylesheet={[classnames('sidebar sidebar--left sidebar--small')]}>
          <Section stylesheet={[classnames('model-designer__cat-item', activeCatItem === 0 ? 'model-designer__cat-item--active' : null)]} onHit={() => setActiveCatItem(0)}>Schema（字段）</Section>
          <Section stylesheet={[classnames('model-designer__cat-item', activeCatItem === 1 ? 'model-designer__cat-item--active' : null)]} onHit={() => setActiveCatItem(1)}>State（状态）</Section>
          <Section stylesheet={[classnames('model-designer__cat-item', activeCatItem === 2 ? 'model-designer__cat-item--active' : null)]} onHit={() => setActiveCatItem(2)}>Methods（方法）</Section>
        </Section>
        <Switch of={activeCatItem}>
          <Case is={0} break render={() =>
            <SchemaDesigner
              schemaJSON={schema}
              onSchemaJSONChange={(schema) => {
                const nextModelJSON = { ...modelJSON, schema }
                handleModelJSONChange(nextModelJSON)
              }}
              config={modelConfig.schema}
              CreateSubmodel={this.CreateSubmodel}
              EditSubmodel={this.EditSubmodel}
            />
          } />
          <Case is={1} break render={() =>
            <StateDesigner
              stateJSON={state}
              onStateJSONChange={(state) => {
                const nextModelJSON = { ...modelJSON, state }
                handleModelJSONChange(nextModelJSON)
              }}
            />
          } />
          <Case is={2} break render={() =>
            <MethodsDesigner
              methodsJSON={methods}
              onMethodsJSONChange={(methods) => {
                const nextModelJSON = { ...modelJSON, methods }
                handleModelJSONChange(nextModelJSON)
              }}
            />
          } />
        </Switch>
        <Modal
          isShow={showSubmodelModal}
          onSubmit={this.handleSubmitSubmodel}
          onCancel={this.handleCancelSubmodel}
          onClose={this.handleCancelSubmodel}
          className={classnames('model-designer__submodel-modal', 'model-designer__submodel-modal--step-' + activeSubmodelStep)}
          title={activeSubmodelStep ? submodel.field : '添加子模型'}
        >
          <Switch of={activeSubmodelStep}>
            <Case is={0}>
              <Form>
                <FormItem>
                  <Label>字段名</Label>
                  <Input value={submodel.field} onChange={e => this.update(state => state.submodel.field = e.target.value)} />
                </FormItem>
                <FormItem>
                  <Label>是否列表</Label>
                  <Select options={isListOptions} value={submodel.isList} onChange={e => this.update(state => state.submodel.isList = e.target.value)} />
                </FormItem>
              </Form>
            </Case>
            <Case is={1}>
              <ModelDesigner modelJSON={submodel.json} onModelJSONChange={json => this.update(state => state.submodel.json = json)} />
            </Case>
          </Switch>
        </Modal>
      </Section>
    )
  }
}
export default ModelDesigner
