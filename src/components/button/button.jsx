import styled from 'styled-components'

const PRIMARY_COLOR = '#66b1ff'
const PRIMARY_COLOR_DARK = '#4e9cf0'
const SECONDARY_COLOR = '#eee'
const SECONDARY_COLOR_DARK = '#e3e0e0'

export const Button = styled.button.attrs({ type: 'button' })`
  border: 0;
  border-radius: 3px;
  padding: ${props => props.lg ? '10px 35px' : '5px 15px'};
  outline: none;
  cursor: pointer;
  transition: background-color .2s;
`

export const PrimaryButton = styled(Button)`
  background: ${PRIMARY_COLOR};
  color: #fff;

  &:hover {
    background: ${PRIMARY_COLOR_DARK};
  }
`

export const SecondaryButton = styled(Button)`
  background: ${SECONDARY_COLOR};
  color: #515151;

  &:hover {
    background: ${SECONDARY_COLOR_DARK};
  }
`