import { useDrag, useDrop } from 'react-dnd'
import { React } from 'nautil'
import { classnames } from '../../utils'

const DND_TYPES = {
  BASIC: 'basic',
}

export function DragBox(props) {
  const { type = DND_TYPES.BASIC, children, data, canDrag, beginDrag, className, render } = props
  const [, drag, preview] = useDrag({
    item: { type, data },
    canDrag(monitor) {
      const cursor = monitor.getClientOffset()
      return canDrag ? canDrag(data, cursor) : true
    },
    begin(monitor) {
      const cursor = monitor.getClientOffset()
      beginDrag && beginDrag(data, cursor)
    },
  })

  if (render) {
    return <div ref={preview} className={classnames('drag-box--outer') + (className ? ' ' + className : '')}>{render(drag)}</div>
  }

  return <div ref={drag} className={classnames('drag-box') + (className ? ' ' + className : '')}>{children}</div>
}

export function DropBox(props) {
  const { type, className, children, canDrop, onHover, onDrop } = props
  const [{ isOver, canDrop: canDropCursor }, drop] = useDrop({
    accept: type ? [DND_TYPES.BASIC, type] : DND_TYPES.BASIC,
    canDrop(item, monitor) {
      const cursor = monitor.getClientOffset()
      return canDrop ? canDrop(item.data, cursor) : true
    },
    hover(item, monitor) {
      const cursor = monitor.getClientOffset() // 鼠标位置
      onHover && onHover(item.data, cursor)
    },
    drop(item, monitor) {
      const cursor = monitor.getClientOffset()
      onDrop(item.data, cursor)
    },
    collect(monitor) {
      return {
        isOver: !!monitor.isOver(),
        cursor: monitor.getClientOffset(),
        canDrop: monitor.canDrop(),
      }
    },
  })

  return <div ref={drop} className={classnames('drop-box', isOver && canDropCursor ? 'drop-box--over' : null) + (className ? ' ' + className : '')}>{children}</div>
}
