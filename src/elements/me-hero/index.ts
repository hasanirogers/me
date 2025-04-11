import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { heroSlides } from './content';
import 'kemet-ui/dist/components/kemet-button/kemet-button';
import '../me-wheel';
import './slider';
import styles from './styles';


@customElement('me-hero')
export class MeHero extends LitElement {
  static styles = [styles];

  @property()
  currentProject: string = '';

  constructor() {
    super();

    document.addEventListener('me-wheel-change', (event: Event) => {
      if (event instanceof CustomEvent) {
        this.handleWheelChange(event);
      }
    });
  }

  render() {
    return html`
      <div>
        <me-wheel .slides=${heroSlides}></me-wheel>
        <div class="project">Project Name</div>
        <a href="/projects/${this.currentProject}" aria-label="Projects">
          <kemet-icon icon="arrow-return-right" size="32"></kemet-icon>
        </a>
      </div>
      <me-hero-slider .slides=${heroSlides}></me-hero-slider>
    `;
  }

  handleWheelChange(event: CustomEvent) {
    this.currentProject = event.detail.current.getAttribute('slug');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'me-hero': MeHero;
  }
}
