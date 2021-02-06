import { React, produce } from 'nautil'
import { Label, Select, Input, Textarea } from '../form/form.jsx'

const attrTypes = [
  { value: 0, text: '纯文本' },
  { value: 1, text: '表达式' },
  { value: 2, text: '函数式' },
]

export function RichPropEditor(props) {
  const { label, data, onChange, options } = props
  const items = attrTypes.filter(item => options ? options.includes(item.value) : true)
  return (
    <>
      <Label>{label}</Label>
      <Select width="80px" options={items} value={data.type} onChange={(e) => onChange(produce(data, data => {
        data.type = +e.target.value
        if (data.type !== 2) {
          data.params = ''
        }
      }))} />
      {data.type === 2 ? <Input width="80px" placeholder="参数" value={data.params} onChange={(e) => onChange(produce(data, data => { data.params = e.target.value }))} /> : null}
      {data.type === 0 ? <Input value={data.value} onChange={(e) => onChange(produce(data, data => { data.value = e.target.value }))} /> : null}
      {data.type > 0 ? <Textarea value={data.value} onChange={(e) => onChange(produce(data, data => { data.value = e.target.value }))} /> : null}
    </>
  )
}
export default RichPropEditor
