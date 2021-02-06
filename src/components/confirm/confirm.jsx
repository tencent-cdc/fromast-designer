import { React, Section, useState, useCallback } from 'nautil'
import { Modal } from '../modal/modal.jsx'
import { classnames } from '../../utils'

export function Confirm(props) {
  const { title, content, onCancel, onSubmit, width, trigger } = props
  const [isShow, toggleShow] = useState(false)

  const handleCancel = useCallback(() => {
    toggleShow(false)
    onCancel && onCancel()
  }, [])

  const handleSubmit = useCallback(() => {
    toggleShow(false)
    onSubmit && onSubmit()
  }, [])

  const handleShow = useCallback(() => {
    toggleShow(true)
  }, [])

  return (
    <>
      {trigger(handleShow)}
      <Modal isShow={isShow} disableClose onCancel={handleCancel} onSubmit={handleSubmit} title={title} width={width}>
        <Section stylesheet={[classnames('confirm')]}>{content}</Section>
      </Modal>
    </>
  )
}
export default Confirm
