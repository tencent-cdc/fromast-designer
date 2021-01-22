import React, { useRef, useEffect, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { PrimaryButton, SecondaryButton } from '../button/button.jsx'
import { Subject } from 'rxjs'

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99;
  background-color: rgba(0, 0, 0, .2);
  display: ${props => props.isShow ? 'block' : 'none'};
`

const ModalBox = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: ${props => props.width ? props.width + 'px' : '600px'};
  background-color: #fff;
`

const ModalClose = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: #ccc solid 1px;
  color: #999;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color .2s;

  &:hover {
    background-color: #f1f1f1;
  }
`

const ModalTitle = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border-bottom: #f1f1f1 solid 1px;
`

const ModalContent = styled.div`
  padding: 40px 20px;
  max-height: 70vh;
  overflow: auto;
`

const ModalFooter = styled(ModalTitle)`
  padding: 5px 0;
  font-weight: normal;
  border-bottom: 0;
  border-top: #f1f1f1 solid 1px;
`

export function Modal(props) {
  const { isShow, onClose, title, children, onCancel, onSubmit, disabelCancel, keepAlive, width } = props

  const stream$ = useMemo(() => new Subject(), [isShow])

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
      if (type === 'submit') {
        onSubmit()
      }
      else if (type === 'cancel') {
        onCancel()
      }
      else if (type === 'close') {
        onClose()
      }
    })
    return () => stream$.complete()
  }, [isShow])

  return (
    <ModalContainer isShow={isShow}>
      <ModalBox width={width}>
        <ModalClose onClick={handleClose}>&times;</ModalClose>
        {title ? <ModalTitle>{title}</ModalTitle> : null}
        <ModalContent>{isShow || keepAlive ? typeof children === 'function' ? children(stream$) : children : null}</ModalContent>
        <ModalFooter>
          {!disabelCancel ? <SecondaryButton lg onClick={handleCancel}>取消</SecondaryButton> : null}
          <PrimaryButton lg onClick={handleSubmit}>确定</PrimaryButton>
        </ModalFooter>
      </ModalBox>
    </ModalContainer>
  )
}
export default Modal
