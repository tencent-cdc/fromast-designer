import React from 'react'
import styled from 'styled-components'
import { PrimaryButton, SecondaryButton } from '../button/button.jsx'
import { useSeedKeys } from '../../hooks/seed-keys.js'
import produce from 'immer'

export const Input = styled.input`
  padding: 10px;
  border: #f1f1f1 solid 1px;
  outline: none;
  width: ${props => props.width ? props.width + 'px' : 'auto'};
  flex-grow: ${props => props.width ? 'unset' : 1} !important;
`

export const Textarea = styled.textarea`
  padding: 10px;
  border: #f1f1f1 solid 1px;
  outline: none;
  min-width: 400px;
  min-height: 60px;
  resize: vertical;
`

export const Label = styled.label`
  padding: 10px;
  text-align: right;
  width: 200px;
`

const Selector = (props) => {
  const { options, value, onChange, placeholder, className } = props
  return (
    <select value={value} onChange={onChange} className={className}>
      {placeholder ? <option value="" hidden>{placeholder}</option> : null}
      {options.map(option => <option key={option.value} value={option.value}>{option.text}</option>)}
    </select>
  )
}
export const Select = styled(Selector)`
  padding: 9px 10px;
  border: #f1f1f1 solid 1px;
  outline: none;
  width: 400px;
  width: ${props => props.with ? props.width + 'px' : 'auto'};
`

export const FormItem = styled.div`
  padding: 10px;
  display: flex;
  align-items: flex-start;

  ${Input}, ${Textarea} {
    flex: 1;
  }
`

export const Form = styled.form`
  width: 100%;
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
          <React.Fragment key={keys[i]}>
            {render(item, handleChange)}
            <PrimaryButton onClick={() => handleAdd(i)}>+</PrimaryButton>
            <SecondaryButton onClick={() => handleDel(i)}>-</SecondaryButton>
          </React.Fragment>
        )
      })}
      <PrimaryButton onClick={() => handleAdd()}>+</PrimaryButton>
    </div>
  )
}
export const FormLoopItem = styled(LoopRender)``

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