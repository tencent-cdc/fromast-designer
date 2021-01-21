import React from 'react'
import styled from 'styled-components'
import { PrimaryButton, SecondaryButton } from '../button/button.jsx'

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
  min-width: 900px;
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
  display: flex;
  align-items: center;
  justify-content: center;
`

const ModalFooter = styled(ModalTitle)`
  padding: 5px 0;
  font-weight: normal;
  border-bottom: 0;
  border-top: #f1f1f1 solid 1px;
`

export function Modal(props) {
  const { isShow, onClose, title, children, onCancel, onSubmit, disabelCancel, keepAlive } = props
  return (
    <ModalContainer isShow={isShow}>
      <ModalBox>
        <ModalClose onClick={onClose}>&times;</ModalClose>
        {title ? <ModalTitle>{title}</ModalTitle> : null}
        <ModalContent>{isShow || keepAlive ? children : null}</ModalContent>
        <ModalFooter>
          {!disabelCancel ? <SecondaryButton lg onClick={onCancel}>取消</SecondaryButton> : null}
          <PrimaryButton lg onClick={onSubmit}>确定</PrimaryButton>
        </ModalFooter>
      </ModalBox>
    </ModalContainer>
  )
}
export default Modal
