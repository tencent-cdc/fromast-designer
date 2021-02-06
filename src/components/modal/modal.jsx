import { React, useEffect, useCallback, useMemo, Stream, Section } from 'nautil'
import { Button } from '../button/button.jsx'
import { classnames } from '../../utils'
import { Close } from '../close/close.jsx'

export const Modal = React.memo((props) => {
  const { isShow, onClose, title, children, onCancel, onSubmit, disableCancel, disableClose, keepAlive, width } = props

  const stream$ = useMemo(() => new Stream(), [isShow])

  const handleSubmit = useCallback(() => {
    stream$.next('submit')
  }, [isShow])

  const handleCancel = useCallback(() => {
    stream$.next('cancel')
  }, [isShow])

  const handleClose = useCallback(() => {
    stream$.next('close')
  }, [isShow])

  useEffect(() => {
    stream$.subscribe((type) => {
      if (type === 'submit' && onSubmit) {
        onSubmit()
      }
      else if (type === 'cancel' && onCancel) {
        onCancel()
      }
      else if (type === 'close' && onClose) {
        onClose()
      }
    })
    return () => stream$.complete()
  }, [isShow])

  return (
    <Section stylesheet={[classnames('modal', isShow ? 'modal--show' : 'modal--hidden')]}>
      <Section stylesheet={[classnames('modal-container'), width ? { width } : null]}>
        {!disableClose ? <Close stylesheet={[classnames('modal-close')]} onHit={handleClose} /> : null}
        {title ? <Section stylesheet={[classnames('modal-title')]}>{title}</Section> : null}
        <Section stylesheet={[classnames('modal-content')]}>{isShow || keepAlive ? typeof children === 'function' ? children(stream$) : children : null}</Section>
        <Section stylesheet={[classnames('modal-footer')]}>
          {!disableCancel ? <Button secondary large onHit={handleCancel}>取消</Button> : null}
          <Button primary large onHit={handleSubmit}>确定</Button>
        </Section>
      </Section>
    </Section>
  )
})
export default Modal
