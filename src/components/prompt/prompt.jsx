import { React, useRef, useEffect, useState, If, Each, useCallback } from 'nautil'
import { classnames } from '../../utils'

export function Prompt(props) {
  const { preload, children } = props
  const ref = useRef()
  const focused = useRef()
  const [style, setStyle] = useState(null)

  useEffect(() => {
    const el = ref.current

    let timer = null

    const handleFocus = (e) => {
      const input = e.target
      if (input.nodeName !== 'TEXTAREA') {
        return
      }

      clearTimeout(timer)
      const useStyle = () => {
        const { left, bottom, width } = input.getBoundingClientRect()
        // 监控textarea尺寸变化
        timer = setTimeout(() => {
          setStyle({ left, top: bottom, width })
          useStyle()
        }, 16)
      }
      useStyle()
      focused.current = input
    }
    const handleBlur = (e) => {
      setStyle(null)
      clearTimeout(timer)
      focused.current = null
    }

    el.addEventListener('focus', handleFocus, true)
    el.addEventListener('blur', handleBlur, true)

    return () => {
      clearTimeout(timer)
      el.removeEventListener('focus', handleFocus)
      el.removeEventListener('blur', handleBlur)
    }
  }, [])

  const handleSelect = useCallback((value) => {
    if (!focused.current) {
      return
    }

    const text = value + ''

    focused.current.setRangeText(text, focused.current.selectionStart, focused.current.selectionEnd, 'end')
  })

  return (
    <div ref={ref} className={classnames('prompt')}>
      {children}

      <If is={!!style && !!preload} render={() =>
        <div className={classnames('prompt__list')} style={style || {}}>
          <Each of={preload} render={(item) =>
            <div className={classnames('prompt__item')} key={item.value} onMouseDown={() => handleSelect(item.value)}>{item.text}</div>
          } />
        </div>
      } />
    </div>
  )
}