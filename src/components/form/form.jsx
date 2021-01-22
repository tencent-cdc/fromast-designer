import React from 'react'
import styled, { css } from 'styled-components'
import { PrimaryButton, SecondaryButton } from '../button/button.jsx'
import { useSeedKeys } from '../../hooks/seed-keys.js'
import produce from 'immer'

export const Input = styled.input`
  padding: 10px;
  border: #f1f1f1 solid 1px;
  outline: none;
  width: ${props => props.width ? props.width + 'px' : 'auto'};
  flex-grow: ${props => props.width ? 'unset' : 1} !important;
  ${props => props.sm ? 'padding: 5px; border-top: 0; border-left: 0; border-right: 0;' : ''}
`

export const Textarea = styled.textarea`
  padding: 10px;
  border: #f1f1f1 solid 1px;
  outline: none;
  width: ${props => props.width ? props.width + 'px' : 'auto'};
  flex-grow: ${props => props.width ? 'unset' : 1} !important;
  height: 1em;
  min-height: calc(1em + 2px);
  resize: vertical;
`

const Selector = (props) => {
  const { options, value, onChange, placeholder, className } = props
  return (
    <select value={value} onChange={onChange} className={className}>
      <option value="" hidden>{placeholder}</option>
      {options.map(option => <option key={option.value} value={option.value}>{option.text}</option>)}
    </select>
  )
}
export const Select = styled(Selector)`
  padding: 9px 10px;
  border: #f1f1f1 solid 1px;
  outline: none;
  width: ${props => props.with ? props.width + 'px' : 'auto'};
  flex-grow: ${props => props.width ? 'unset' : 1} !important;
`

export const Label = styled.label`
  padding: 10px;
  text-align: right;
  width: 160px;
`

export const FormItem = styled.div`
  padding: 10px;
  display: flex;
  align-items: center;

  ${Input}, ${Textarea}, ${Select} {
    flex: 1;
  }
`

export const Form = styled.form`
  width: 100%;

  ${props => {
    if (props.nl) {
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