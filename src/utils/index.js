import styles from '../styles/index.less'
import { isArray, getObjectHash, isUndefined } from 'ts-fns'
import { Loader } from 'tyshemo'

export function createClassNames(config = {}) {
  const { namespace, module: cssModule } = config
  const get = (item) => {
    const classname = namespace ? `${namespace}-${item}` : item
    if (cssModule && classname in cssModule) {
      return cssModule[classname]
    }
    return classname
  }
  return (...classnames) => {
    return classnames.filter(item => !!item).map((item) => {
      if (isArray(item)) {
        return item.filter(item => !!item).map(get).join(' ')
      }
      else {
        return item.split(' ').filter(item => !!item).map(get).join(' ')
      }
    }).join(' ')
  }
}

export function createGlobalModelScope() {
  const scope = {}

  function set(modelJSON) {
    if (!modelJSON.schema) {
      return
    }

    const hash = getObjectHash(modelJSON)
    if (hash === scope.hash) {
      return
    }
    scope.hash = hash

    const Model = new Loader().parse(modelJSON)
    const model = new Model()
    scope.model = model
  }
  function get() {
    return scope.model
  }

  return { set, get }
}

export const classnames = createClassNames({ namespace: 'formast-designer', module: styles })
export const globalModelScope = createGlobalModelScope()


export function parseAttr(str) {
  const matched = str.match(/([a-zA-Z0-9_$]+)(\((.*?)\))?/)
  if (!matched) {
    return [str]
  }

  const method = matched[1]
  if (!method) {
    return [str]
  }

  const m = matched[3]
  if (isUndefined(m)) {
    return [method]
  }

  // empty string, i.e. `required()`
  if (!m) {
    return [method, []]
  }

  const s = m || ''
  const none = void 0
  const params = s.split(',').map(item => item.trim() || none)

  return [method, params]
}
