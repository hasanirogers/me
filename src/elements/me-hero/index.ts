import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type HeroSlide } from './content';
import 'kemet-ui/dist/components/kemet-button/kemet-button';
import '../me-wheel';
import './slider';
import styles from './styles';


@customElement('me-hero')
export class MeHero extends LitElement {
  static styles = [styles];

  @property()
  project!: HeroSlide;

  @property()
  projects!: HeroSlide[];

  constructor() {
    super();

    document.addEventListener('me-wheel-click', (event: Event) => {
      if (event instanceof CustomEvent) {
        this.handleWheelClick(event);
      }
    });
  }

  firstUpdated() {
    this.getProjects();
  }

  render() {
    if (this.project) {
      return html`
        <div>
          <me-wheel .slides=${this.projects}></me-wheel>
          <div class="project">
            <span>${this.project.heading}</span>
            <a href="/projects/${this.project.slug}" aria-label="Projects">
              <kemet-icon icon="arrow-return-right" size="24"></kemet-icon>
            </a>
          </div>
        </div>
        <me-hero-slider .slides=${this.projects}></me-hero-slider>
      `;
    }

    return html`<me-loader loading></me-loader>`;
  }

  async getProjects() {
    const response = await fetch('/api/projects');
    const data = await response.json();
    this.projects = data;
    this.project = data[0];
  }

  handleWheelClick(event: CustomEvent) {
    this.project = event.detail.slide;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'me-hero': MeHero;
  }
}
