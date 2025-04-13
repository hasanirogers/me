import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import Swiper from 'swiper';
import { register, type SwiperContainer } from 'swiper/element/bundle';
import type { HeroSlide } from '../me-hero/content';

import { stylesSlider } from './styles';
import 'swiper/css?inline';


@customElement('me-hero-slider')
export class MeHeroSlider extends LitElement {
  static styles = [stylesSlider];

  @property()
  slides: HeroSlide[] = [];

  @state()
  isDesktop: boolean = window.matchMedia("(min-width: 1024px)").matches;

  @state()
  swiperInstance?: Swiper;

  @query('swiper-container')
  swiperContainer!: SwiperContainer;

  constructor() {
    super();

    document.addEventListener('me-wheel-change', (event: Event) => {
      if (event instanceof CustomEvent) {
        this.handleWheelChange(event.detail);
      }
    });

    document.addEventListener('me-wheel-click', (event: Event) => {
      if (event instanceof CustomEvent) {
        this.handleWheelClick(event);
      }
    });
  }

  firstUpdated() {
    register();
  }

  render() {
    return html`
      <swiper-container
        effect="fade"
        loop="true"
        initial-slide="2"
        slides-per-view="1"
        @swiperinit=${(event: CustomEvent) => this.handleSwiperInit(event)}>
        ${this.slides.map(slide => html`
          <swiper-slide>
            <img src="${slide.image}" alt="${slide.heading}" />
          </swiper-slide>
        `)}
      </swiper-container>
    `;
  }

  handleSwiperInit(event: CustomEvent) {
    this.swiperInstance = event.detail[0];
  }

  handleWheelChange(swiper: Swiper) {
    this.swiperInstance?.slideTo(swiper.activeIndex);
  }

  handleWheelClick(event: CustomEvent) {
    const activeIndex = event.detail.slide.index;
    this.swiperInstance?.slideTo(activeIndex);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'me-hero-slider': MeHeroSlider;
  }
}
