import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './styles';

@customElement('me-loader')
export default class MeLoader extends LitElement {
  static styles = [styles];

  @property({ type: Boolean, reflect: true })
  loading: boolean = false;

  render() {
    return html`<div class="ellipsis"><div></div><div></div><div></div><div></div></div>`;
  }
}
