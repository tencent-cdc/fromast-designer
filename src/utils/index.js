export function createClassNames(config = {}) {
  const { namespace } = config
  return (...classnames) => {
    if (namespace) {
      return classnames.filter(item => !!item).map(item => `${namespace}-${item}`).join(' ')
    }
    else {
      return classnames.filter(item => !!item).join(' ')
    }
  }
}

export const classnames = createClassNames({ namespace: 'formast-designer' })
