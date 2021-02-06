import { React, Component, Section, If, Else } from 'nautil'
import { classnames } from '../../utils'
import { Button } from '../button/button.jsx'

export class Popover extends Component {
  render() {
    const { header, content, footer, trigger, isShow, onCancel, onSubmit } = this.attrs
    return (
      <>
        {trigger}
        <If is={!!isShow} render={() =>
          <Section stylesheet={[classnames('popover-container')]}>
            <If is={!!header} render={() => <Section stylesheet={[classnames('popover-header')]}>{header}</Section>} />
            <Section stylesheet={[classnames('popover-content')]}>{content}</Section>
            <If is={!!footer} render={() => <Section stylesheet={[classnames('popover-footer')]}>{footer}</Section>}>
              <Else render={() =>
                <Section stylesheet={[classnames('popover-footer')]}>
                  <Button secondary onHit={onCancel}>取消</Button>
                  <Button primary onHit={onSubmit}>确认</Button>
                </Section>
              } />
            </If>
          </Section>
        } />
      </>
    )
  }
}
export default Popover
