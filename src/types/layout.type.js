import { ifexist, List, Dict, Enum } from 'nautil'
import { VALUE_TYPES, COMPONENT_TYPES } from '../config/constants.js'

export const LayoutConfigType = new Dict({
  groups: [
    {
      id: String,
      title: String,
      items: [
        {
          id: String,
          type: new Enum(Object.values(COMPONENT_TYPES)),
          sort: ifexist(Number),
          title: String,
          icon: ifexist(String),
          direction: ifexist('h'),
          props: ifexist([
            {
              key: String,
              types: new List(Object.values(VALUE_TYPES)),
              title: ifexist(String),
              defender: ifexist(Function),
            }
          ]),

          tag: ifexist(String),
          // 组件只能放在needs的组件中，可以传入tag，例如 tag:atom，其中 atom 为 tag 值
          needs: ifexist([String]),
          // 组件只允许allows中的组件作为子组件拖入，可以传 tag
          allows: ifexist([String]),

          // 在绑定字段的时候被调用
          // 将接收到的JSON的一个meta，转化为UI配置里面的props配置具体值
          // (field, meta, monitor)
          fromMetaToProps: ifexist(Function),

          // 在生成布局信息时调用
          // 有些情况下，组件的内容是通过 render={() => <Content />} 这种形式渲染，通过 fromJSONToRuntime 可以把JSON生成这种运行时需要的逻辑
          fromJSONToRuntime: ifexist(Function),
          // 和fromJSONToRuntime是反向的，在生成JSON时被调用
          fromRuntimeToJSON: ifexist(Function),

          mount: Function,
          update: Function,
          unmount: Function,
        }
      ]
    }
  ]
})