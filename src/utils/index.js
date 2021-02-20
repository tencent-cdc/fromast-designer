import styles from '../styles/index.less'
import { isArray, getObjectHash, isString, compute_ } from 'ts-fns'
import { generateModel } from '@tencent/formast'

export function createClassNames(config = {}) {
  const { namespace, module: cssModule } = config
  const get = (item) => {
    const classname = namespace ? `${namespace}__${item}` : item
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

    const Model = generateModel(modelJSON)
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

export function parseKey(str) {
  const matched = str.match(/([a-zA-Z0-9_$]+)(\((.*?)\))?(!(.*))?/)
  const [_, name, _p, _params, _m, _macro] = matched
  const params = isString(_params) ? _params.split(',').map(item => item.trim()).filter(item => !!item) : void 0
  const macro = _m ? _macro || 'jsx' : void 0
  return [name, params, macro]
}

export const getConfig = compute_(function(config, defaultConfig = {}) {
  const groupSet = {}
  const groups = []

  if (defaultConfig.groups) {
    defaultConfig.groups.forEach((group) => {
      const { id } = group
      groupSet[id] = group
      groups.push(id)
    })
  }

  if (config.groups) {
    config.groups.forEach((group) => {
      const { id } = group

      if (groupSet[id]) {
        const itemSet = {}
        const itemIds = []

        groupSet[id].items.forEach((item) => {
          itemIds.push(item.id)
          itemSet[item.id] = item
        })

        if (group.items) {
          group.items.forEach((item) => {
            if (!itemSet[item.id]) {
              itemIds.push(item.id)
            }
            itemSet[item.id] = item
          })
        }

        groupSet[id] = {
          ...groupSet[id],
          ...group,
          items,
        }
      }
      else {
        groupSet[id] = group
        groups.push(id)
      }
    })
  }

  return {
    ...defaultConfig,
    ...config,
    groups: groups.map((id) => groupSet[id]),
  }
})