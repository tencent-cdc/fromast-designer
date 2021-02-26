import { React, Component, useState, useRef, Section, useCallback, produce, useEffect, If, Validator } from 'nautil'
import { isEmpty, each } from 'ts-fns'
import { Button } from '../components/button/button.jsx'
import { Modal, AutoModal } from '../components/modal/modal.jsx'
import { Form, FormItem, Label, Input, FormLoop } from '../components/form/form.jsx'
import { classnames, parseKey } from '../utils'
import { usePopup } from '../hooks/popup.js'
import { Close } from '../components/close/close.jsx'
import { Confirm } from '../components/confirm/confirm.jsx'
import { RichPropEditor } from '../components/rich-prop-editor/rich-prop-editor.jsx'
import { VALUE_TYPES } from '../config/constants.js'
import { Popup } from '../libs/popup.js'

export class SchemaDesigner extends Component {
  state = {
    isShow: false,
    editData: null,
  }

  handleAddField = () => {
    this.setState({ isShow: true, editData: null })
  }

  handleEditField = (field) => {
    if (/^<.*?>$/.test(field)) {
      const { EditSubmodel } = this.props
      EditSubmodel(field)
      return
    }

    const { schemaJSON = {} } = this.props
    const meta = schemaJSON[field]
    if (meta) {
      this.setState({ editData: [field, meta], isShow: true })
    }
  }

  handleRemoveField = (field) => {
    const { schemaJSON = {}, onSchemaJSONChange } = this.props
    const json = { ...schemaJSON }

    delete json[field]

    onSchemaJSONChange(json)
  }

  Render() {
    const { schemaJSON = {}, CreateSubmodel } = this.props
    const fields = Object.keys(schemaJSON)

    const popup = usePopup()

    const handleSubmitMeta = useCallback(([field, meta]) => {
      if (!field) {
        return popup.toast('字段Key必须填写')
      }

      const { type, validators, ...attrs } = meta

      if (!type) {
        return popup.toast('字段类型type必须填写')
      }

      if (validators && validators.length) {
        for (let i = 0, len = validators.length; i < len; i ++) {
          const validator = validators[i]
          const keys = Object.keys(validator)
          for (let key of keys) {
            if (!validator[key]) {
              return popup.toast(`第${i + 1}个校验器validator必须填写`)
            }
          }
        }
      }

      const keys = Object.keys(attrs)
      for (let i = 0, len = keys.length; i < len; i ++) {
        const key = keys[i]
        // default 字段可以为空
        if (key === 'default') {
          continue
        }
        if (attrs[key] === '') {
          return popup.toast(`${key}必须填写`)
        }
      }

      const { schemaJSON = {}, onSchemaJSONChange } = this.props

      const next = {
        ...schemaJSON,
        [field]: meta,
      }

      if (!next.validators.length) {
        delete next.validators
      }

      if (this.state.editData && this.state.editData[0] !== field) {
        delete next[this.state.editData[0]]
      }

      onSchemaJSONChange(next)

      this.setState({ isShow: false, editData: null })
    }, [])

    return (
      <>
        <Section stylesheet={[classnames('main')]}>
          {fields.map((field) => {
            return (
              <Section stylesheet={[classnames('schema-designer__field')]} key={field}>
                <Section stylesheet={[classnames('schema-designer__field-label')]}>{field + (schemaJSON[field].label ? '(' + schemaJSON[field].label + ')' : '')}</Section>
                <Button primary onHit={() => this.handleEditField(field)}>编辑</Button>
                <Confirm
                  content="确定要删除该字段吗？"
                  onSubmit={() => this.handleRemoveField(field)}
                  trigger={show => <Button secondary onHit={show}>删除</Button>}
                />
              </Section>
            )
          })}

          <Section stylesheet={classnames('schema-designer__buttons')}>
            <Button primary onHit={this.handleAddField}>添加新字段</Button>
            {CreateSubmodel(
              show => <Button primary onHit={show}>添加子模型</Button>,
            )}
          </Section>
        </Section>

        <MetaForm
          width="900px"
          title="新建字段"
          isShow={this.state.isShow}
          onSubmit={handleSubmitMeta}
          onClose={() => this.setState({ isShow: false })}
          onCancel={() => this.setState({ isShow: false })}
          data={this.state.editData}
        />
      </>
    )
  }
}

class MetaForm extends Component {
  static CustomField(props) {
    const { onSubmit } = props
    const [field, setField] = useState('')
    const el = useRef()
    return (
      <>
        <Label><span ref={el}><Input small value={field} onChange={e => setField(e.target.value)} placeholder="Key" /></span></Label>
        <Button type="button" secondary onHit={() => {
          if (!field) {
            el.current.querySelector('input').focus()
            return
          }
          onSubmit(field)
          setField('')
        }}>添加自定义属性</Button>
      </>
    )
  }

  state = {
    field: '',
    label: {
      type: VALUE_TYPES.STR,
      params: '',
      value: '',
    },
    default: {
      type: VALUE_TYPES.EXP,
      params: '',
      value: '',
    },
    type: {
      type: VALUE_TYPES.STR,
      params: '',
      value: '',
    },
    required: {
      type: VALUE_TYPES.EXP,
      params: '',
      value: '',
    },
    hidden: {
      type: VALUE_TYPES.EXP,
      params: '',
      value: '',
    },
    disabled: {
      type: VALUE_TYPES.EXP,
      params: '',
      value: '',
    },
    validators: [],
  }

  parseMetaToJSON(state) {
    const { field, ...data } = state
    const parse = ({ type, params, value }, key) => {
      if (type === VALUE_TYPES.STR) {
        return ['', value]
      }
      else if (type === VALUE_TYPES.EXP) {
        try {
          return ['', value ? JSON.parse(value) : value]
        }
        catch (e) {
          throw new Error(`${key} 必须是一个合法的表达式`)
        }
      }
      else if (type === VALUE_TYPES.FN) {
        return [`(${params})`, value]
      }
    }
    const meta = {}
    each(data, (v, key) => {
      if (key === 'validators') {
        meta.validators = v.map((item, i) => {
          const { message, validate, determine } = item

          // 非函数形式
          // tyshemo.Loader 支持形式如 validators: [ "required('some is required!')" ] 的校验器
          if (validate.type === VALUE_TYPES.EXP) {
            const [key, params] = validate.value ? parseKey(validate.value) : []
            if (Validator[key] && params) {
              const validator = validate.value
              return validator
            }
            else {
              throw new Error(`validators[${i}].validate 填写的表达式不符合内置校验器写法`)
            }
          }

          const [dp, dv] = parse(determine, `validators[${i}].determine`)
          const [vp, vv] = parse(validate, `validators[${i}].validate`)
          const [mp, mv] = parse(message, `validators[${i}].message`)
          const validator = {
            [`determine${dp}`]: dv,
            [`validate${vp}`]: vv,
            [`message${mp}`]: mv,
          }
          return validator
        })
      }
      else {
        const [params, exp] = parse(v, key)
        meta[key + params] = exp
      }
    })
    return [field, meta]
  }

  parseSchemaToEdit(field, meta) {
    const { validators: _validators = [], ...attrs } = meta

    const parse = (attrs) => {
      const info = {}
      each(attrs, (value, attr) => {
        const [key, params] = parseKey(attr)
        if (params) {
          info[key] = {
            type: 2,
            params: params.join(','),
            value,
          }
        }
        else if (typeof value !== 'string') {
          info[key] = {
            type: 1,
            params: '',
            value: value && typeof value === 'object' ? JSON.stringify(value, null, 4) : value + '',
          }
        }
        else {
          info[key] = {
            type: 0,
            params: '',
            value: value,
          }
        }
      })
      return info
    }

    const validators = _validators.map((item) => {
      return parse(item)
    })

    return {
      field,
      validators,
      ...parse(attrs),
    }
  }

  resetData() {
    const { data } = this.props
    if (data) {
      const [field, meta] = data
      const next = this.parseSchemaToEdit(field, meta)
      this.setState(next)
    }
  }

  handleSubmit = () => {
    const state = this.state
    try {
      const json = this.parseMetaToJSON(state)
      this.props.onSubmit(json)
    }
    catch (e) {
      Popup.toast(e)
    }
  }

  Render() {
    const { aside, width, title, isShow, onClose, onCancel, data } = this.props

    useEffect(() => {
      this.resetData()
    }, [data])

    const { CustomField } = MetaForm

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
            type: VALUE_TYPES.EXP,
            params: '',
            value: '',
          },
          validate: {
            type: VALUE_TYPES.FN,
            params: 'value',
            value: '',
          },
          message: {
            type: VALUE_TYPES.STR,
            params: 'value',
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

    const handleRemoveCustomField = (field) => {
      const { [field]: _, ...state } = this.state
      delete this.state[field] // react无法通过setState删除一个属性
      this.setState(state)
    }

    const { field, default: defaultValue, label, type, required, disabled, hidden, validators = [], ...customs } = this.state
    const customKeys = Object.keys(customs)

    return (
      <Modal isShow={isShow} width={width} title={title} onSubmit={this.handleSubmit} onCancel={onCancel} onClose={onClose} className={classnames('schema-designer__modal')}>
        <Form aside={aside}>
          <FormItem>
            <Label>字段 Key</Label>
            <Input value={field} onChange={(e) => handleChangeState(state => state.field = e.target.value)} />
          </FormItem>
          <FormItem stylesheet={[classnames('form-item--rich')]}>
            <RichPropEditor label="显示名(label)" types={[VALUE_TYPES.STR, VALUE_TYPES.EXP]} data={label} onChange={data => this.setState({ label: data })} />
          </FormItem>
          <FormItem stylesheet={[classnames('form-item--rich')]}>
            <RichPropEditor label="类型(type)" types={[VALUE_TYPES.STR, VALUE_TYPES.EXP]} data={type} onChange={data => this.setState({ type: data })} />
          </FormItem>
          <FormItem stylesheet={[classnames('form-item--rich')]}>
            <RichPropEditor label="默认值(default)" types={[VALUE_TYPES.STR, VALUE_TYPES.EXP]} data={defaultValue} onChange={data => this.setState({ default: data })} />
          </FormItem>
          <FormItem stylesheet={[classnames('form-item--rich')]}>
            <RichPropEditor label="是否必填(required)" types={[VALUE_TYPES.EXP, VALUE_TYPES.FN]} data={required} onChange={data => this.setState({ required: data })} />
          </FormItem>
          <FormItem stylesheet={[classnames('form-item--rich')]}>
            <RichPropEditor label="是否隐藏(hidden)" types={[VALUE_TYPES.EXP, VALUE_TYPES.FN]} data={hidden} onChange={data => this.setState({ hidden: data })} />
          </FormItem>
          <FormItem stylesheet={[classnames('form-item--rich')]}>
            <RichPropEditor label="是否禁用(disabled)" types={[VALUE_TYPES.EXP, VALUE_TYPES.FN]} data={disabled} onChange={data => this.setState({ disabled: data })} />
          </FormItem>
          <FormItem>
            <Label>校验器(validators)</Label>
            <FormLoop
              items={validators}
              onAdd={handleAddValidator}
              onDel={handleDelValidator}
              onChange={validators => this.setState({ validators })}
              render={(i, validator, onChange) => {
                return (
                  <>
                    <FormItem stylesheet={[classnames('form-item--rich')]}>
                      <RichPropEditor label="校验函数(validate)" types={[VALUE_TYPES.EXP, VALUE_TYPES.FN]} data={validator.validate} onChange={validate => onChange({ validate })} />
                    </FormItem>
                    <If is={validator.validate.type === VALUE_TYPES.FN}>
                      <FormItem stylesheet={[classnames('form-item--rich')]}>
                        <RichPropEditor label="是否校验(determine)" types={[VALUE_TYPES.EXP, VALUE_TYPES.FN]} data={validator.determine} onChange={determine => onChange({ determine })} />
                      </FormItem>
                      <FormItem stylesheet={[classnames('form-item--rich')]}>
                        <RichPropEditor label="消息(message)" types={[VALUE_TYPES.STR ,VALUE_TYPES.EXP, VALUE_TYPES.FN]} data={validator.message} onChange={message => onChange({ message })} />
                      </FormItem>
                    </If>
                    {i !== validators.length - 1 ? <Section stylesheet={[classnames('line')]} /> : null}
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
                <FormItem key={key} stylesheet={[classnames('form-item--rich', 'schema-designer-custom-field')]}>
                  <RichPropEditor label={key} data={data} onChange={data => {
                    handleChangeState(state => {
                      state[key] = { key, ...data }
                    })
                  }} />
                  <Close onHit={() => handleRemoveCustomField(key)} />
                </FormItem>
              )
            })
          }
          <FormItem>
            <CustomField onSubmit={handleAddCustomField} />
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default SchemaDesigner
