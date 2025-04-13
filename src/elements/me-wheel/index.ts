import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HeroSlide } from '../me-hero/content';
import { emitEvent } from '../../utilities/events';
import styles from './styles';


@customElement('me-wheel')
export class MeWheel extends LitElement {
  static styles = [styles];

  @property()
  radius: number = window.matchMedia("(min-width: 768px)").matches ? 320 : 240;

  @property()
  slides: HeroSlide[] = [];

  @state()
  isDesktop: boolean = window.matchMedia("(min-width: 1024px)").matches;

  @state()
  rotationAngle: number = 0;

  firstUpdated() {

    this.initWheel();
  }

  render() {
    return html`
      <nav style="transform: rotate(-${this.rotationAngle}deg);">
        ${this.slides.map((slide, index) => html`
          <button @click=${() => {
            this.rotateWheel(index);
            emitEvent(this, 'me-wheel-click', { slide: { ...slide, index } });
          }}>
            <img src="${slide.image}" alt="${slide.heading}" />
          </button>
        `)}
      </nav>
    `
  }


  initWheel() {
    const nav = this.shadowRoot?.querySelector('nav') as HTMLDivElement;
    const items = this.shadowRoot?.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const centerX = nav.clientWidth / 2;
    const centerY = nav.clientHeight / 2;

    items.forEach((item, index) => {
      const angle = (2 * Math.PI / items.length) * index;
      const x = centerX + this.radius * Math.cos(angle);
      const y = centerY + this.radius * Math.sin(angle);
      item.style.left = `${x}px`;
      item.style.top = `${y}px`;
    });
  }

  rotateWheel(index: number) {
    this.rotationAngle = (((360 / this.slides.length) * index) - 90 + 360) % 360;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'me-wheel': MeWheel;
  }
}
