import { React, Component, Section, If, Switch, Case, Textarea } from 'nautil'
import { classnames, globalModelScope } from '../utils'
import { SchemaDesigner } from './schema-designer.jsx'
import { StateDesigner } from './state-designer.jsx'
import { MethodsDesigner } from './methods-designer.jsx'

export class ModelDesigner extends Component {
  state = {
    activeCatItem: 0,
  }

  render() {
    const { modelJSON = {}, onModelJSONChange } = this.props
    const { activeCatItem } = this.state
    const setActiveCatItem = (activeCatItem) => this.setState({ activeCatItem })

    const { schema, state = {}, methods = {} } = modelJSON

    const handleModelJSONChange = (modelJSON) => {
      onModelJSONChange(modelJSON)
      globalModelScope.set(modelJSON)
    }

    return (
      <Section stylesheet={[classnames('content', 'model-designer')]}>
        <Section stylesheet={[classnames('sidebar sidebar--left')]}>
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
      </Section>
    )
  }
}
