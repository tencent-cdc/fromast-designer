import { Button as NativeButton } from 'nautil'
import { classnames } from '../../utils'

export const Button = NativeButton.extend(props => {
  return {
    stylesheet: classnames(
      'button',
      props.primary ? 'button-primary' : props.secondary ? 'button-secondary' : null,
      props.lg ? 'button-large' : null,
    ),
  }
})
