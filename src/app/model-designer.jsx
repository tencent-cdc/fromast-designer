import { React, Component, Section, Switch, Case, nonable, produce } from 'nautil'
import { classnames, globalModelScope } from '../utils'
import { SchemaDesigner } from './schema-designer.jsx'
import { StateDesigner } from './state-designer.jsx'
import { MethodsDesigner } from './methods-designer.jsx'
import { Modal } from '../components/modal/modal.jsx'
import { Form, FormItem, Label, Input } from '../components/form/form.jsx'

const defaultState = {
  showSubmodelModal: false,
  submodel: {
    field: '',
    json: {},
  },
  activeSubmodelStep: 0,
  editingSubmodel: '',
}

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
    const json = this.props.modelJSON.schema[field]
    this.setState({
      showSubmodelModal: true,
      submodel: { field: field.substring(1, field.length - 1), json },
      editingSubmodel: field,
    })
  }

  handleSubmitSubmodel = () => {
    const { activeSubmodelStep, submodel, editingSubmodel } = this.state
    const { onModelJSONChange, modelJSON = {} } = this.props
    if (!activeSubmodelStep) {
      this.update(state => state.activeSubmodelStep ++)
    }
    else {
      const { field, json } = submodel
      const fieldKey = `<${field}>`
      const next = produce(modelJSON, model => {
        model.schema = model.schema || {}
        model.schema[fieldKey] = json
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
    const { modelJSON = {}, onModelJSONChange } = this.props
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
          title={activeSubmodelStep ? submodel.field : ''}
        >
          <Switch of={activeSubmodelStep}>
            <Case is={0}>
              <Form>
                <FormItem>
                  <Label>字段名</Label>
                  <Input value={submodel.field} onChange={e => this.update(state => state.submodel.field = e.target.value)} />
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
