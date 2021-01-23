import {
  React,
  Input as NInput,
  Textarea as NTextarea,
  Select as NSelect,
  Text,
  Section,
  Form as NForm,
} from 'nautil'
import { Button } from '../button/button.jsx'
import { useSeedKeys } from '../../hooks/seed-keys.js'
import { classnames } from '../../utils'

export const Input = NInput.extend(props => {
  return {
    stylesheet: [
      classnames('input'),
      props.width ? { width: props.width + 'px', flexGrow: 'unset' } : null,
      props.sm ? { padding: '5px', borderTop: 0, borderLeft: 0, borderRight: 0 } : null,
    ],
  }
})

export const Textarea = NTextarea.extend(props => {
  return {
    stylesheet: [
      classnames('textarea'),
      props.width ? { width: props.width + 'px', flexGrow: 'unset' } : null,
    ],
  }
})

export const Select = NSelect.extend(props => {
  return {
    stylesheet: [
      classnames('select'),
      props.width ? { width: props.width + 'px', flexGrow: 'unset' } : null,
    ],
  }
})

export const Label = Text.extend({
  stylesheet: [classnames('label')],
})

export const Form = NForm.extend({
  stylesheet: [classnames('form')]
})

export const FormItem = Section.extend({
  stylesheet: [classnames('form-item')],
})


export const Form = styled.form`
  width: 100%;

  ${props => {
    if (props.aside) {
      return css`
        ${FormItem} {
          flex-wrap: wrap;
        }
        ${Label} {
          width: 100%;
          text-align: left;
          padding-left: 0;
        }
      `
    }
    else {
      return ''
    }
  }}
`

const LoopItem = styled.div`
  display: flex;
  align-items: center;
`
const LoopItemContent = styled.div`
  flex: 1;
`
const LoopItemButtons = styled.div`
`

const LoopRender = (props) => {
  const { items, render, className, onAdd, onDel, onChange } = props
  const handleAdd = (index) => {
    onAdd(index)
  }
  const handleDel = (index) => {
    onDel(index)
  }
  const keys = useSeedKeys(items.length)

  return (
    <div className={className}>
      {items.map((item, i) => {
        const handleChange = (item) => {
          const next = produce(items, items => {
            Object.assign(items[i], item)
          })
          onChange(next)
        }
        return (
          <LoopItem key={keys[i]}>
            <LoopItemContent>
              {render(i, item, handleChange)}
            </LoopItemContent>
            <LoopItemButtons>
              <PrimaryButton onClick={() => handleAdd(i)}>+</PrimaryButton>
              <SecondaryButton onClick={() => handleDel(i)}>-</SecondaryButton>
            </LoopItemButtons>
          </LoopItem>
        )
      })}
      {items.length ? null : <PrimaryButton onClick={() => handleAdd()}>+</PrimaryButton>}
    </div>
  )
}
export const FormLoopItem = styled(LoopRender)`
  flex: 1;
`

// export function FormItem(props) {
//   const { label, type, value, onChange, options } = props
//   return (
//     <Item>
//       <Label>{label}</Label>
//       {
//         type === 'options' ? <Select options={options} value={value} onChange={onChange} />
//         : <Input type={type} value={value} onChange={onChange} />
//       }
//     </Item>
//   )
// }
