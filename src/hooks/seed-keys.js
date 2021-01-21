/**
 * 创建一组用于列表渲染的key，避免直接使用列表索引作为key带来的问题
 */

import { useMemo } from 'react'
import { createArray, createRandomString } from 'ts-fns'

export function useSeedKeys(count) {
  const keys = useMemo(() => {
    const arr = createArray('', count)
    const keys = arr.map(() => createRandomString(8))
    return keys
  }, [count])

  return keys
}
export default useSeedKeys