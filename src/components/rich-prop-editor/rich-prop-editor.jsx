import { React, produce } from 'nautil'
import { Label, Select, Input, Textarea } from '../form/form.jsx'
import { VALUE_TYPES } from '../../config/constants.js'

const attrTypes = [
  { value: VALUE_TYPES.STR, text: '纯文本' },
  { value: VALUE_TYPES.EXP, text: '表达式' },
  { value: VALUE_TYPES.FN, text: '函数式' },
]

export function RichPropEditor(props) {
  const { label, data, onChange, types } = props
  const items = attrTypes.filter(item => types ? types.includes(item.value) : true)

  return (
    <>
      <Label>{label}</Label>
      <Select width="90px" options={items} value={data.type} onChange={(e) => onChange(produce(data, data => {
        data.type = +e.target.value
      }))} disabled={data.disabled} />
      {data.type === VALUE_TYPES.FN ? <Input width="90px" placeholder="参数" value={data.params} onChange={(e) => onChange(produce(data, data => { data.params = e.target.value }))} disabled={data.disabled} /> : null}
      {data.type === VALUE_TYPES.STR ? <Input value={data.value} onChange={(e) => onChange(produce(data, data => { data.value = e.target.value }))} disabled={data.disabled} /> : null}
      {data.type > VALUE_TYPES.STR ? <Textarea value={data.value} onChange={(e) => onChange(produce(data, data => { data.value = e.target.value }))} disabled={data.disabled} /> : null}
    </>
  )
}
export default RichPropEditor
