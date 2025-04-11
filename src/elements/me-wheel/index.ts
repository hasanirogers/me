import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import Swiper from 'swiper';
import { register, type SwiperContainer } from 'swiper/element/bundle';
import type { HeroSlide } from '../me-hero/content';
import { emitEvent } from '../../utilities/events';
import styles from './styles';
import 'swiper/css?inline';




@customElement('me-wheel')
export class MeWheel extends LitElement {
  static styles = [styles];

  @property()
  radius: number = 320;

  @property()
  slides: HeroSlide[] = [];

  @state()
  isDesktop: boolean = window.matchMedia("(min-width: 1024px)").matches;

  @state()
  swiperInstance?: Swiper;

  @state()
  rotationAngle: number = 0;

  @query('swiper-container')
  swiperContainer!: SwiperContainer;

  firstUpdated() {
    register();
    this.initSwiper();
    this.initWheel();
  }

  render() {
    return this.makeTemplate();
  }

  makeTemplate() {
    if (this.isDesktop) {
      return html`
          <nav style="transform: rotate(-${this.rotationAngle}deg);">
            ${this.slides.map((slide, index) => html`
              <button @click=${() => {
                this.rotateWheel(index);
                emitEvent(this, 'me-wheel-click', { slideIndex: index });
              }}>
                <img src="${slide.image}" alt="${slide.heading}" />
              </button>
            `)}
          </nav>
      `
    }

    return html`
      <swiper-container
        loop="true"
        initial-slide="1"
        slides-per-view="1.75"
        centered-slides="true"
        @swiperslidechange=${(event: CustomEvent) => this.handleSwiperSlideChange(event)}>
        ${this.slides.map(slide => html`
          <swiper-slide slug="${slide.slug}">
            <img src="${slide.image}" alt="${slide.heading}" />
          </swiper-slide>
        `)}
      </swiper-container>
    `
  }

  initWheel() {
    if (this.isDesktop) {
      const nav = this.shadowRoot?.querySelector('nav') as HTMLDivElement;
      const items = this.shadowRoot?.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
      const centerX = nav.clientWidth / 2;
      const centerY = nav.clientHeight / 2;

      console.log(centerY);

      items.forEach((item, index) => {
        const angle = (2 * Math.PI / items.length) * index;
        const x = centerX + this.radius * Math.cos(angle);
        const y = centerY + this.radius * Math.sin(angle);
        item.style.left = `${x}px`;
        item.style.top = `${y}px`;
      });
    }
  }

  initSwiper() {
    if (!this.isDesktop) {
      this.swiperInstance = new Swiper(this.swiperContainer);
    }
  }

  handleSwiperSlideChange(event: CustomEvent) {
    const swiper = event.detail[0];
    const slideElements = this.swiperContainer.querySelectorAll('swiper-slide');
    const currentSlideElement = slideElements[swiper.activeIndex];
    emitEvent(this, 'me-wheel-change', { swiper: swiper, current: currentSlideElement });
  }

  rotateWheel(index: number) {
    this.rotationAngle = (((360 / this.slides.length) * index) - 90 + 360) % 360;
  }

  computeThumbnailTransform(index: number, total: number, distance: string) {
    const angle = (360 / total) * index;
    return `rotate(${angle}deg) translate(calc(0% - ${distance})) rotate(-${angle}deg)`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'me-wheel': MeWheel;
  }
}
