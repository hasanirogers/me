import { css } from 'lit';

export default css`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 100vh;
  }

  :host::before {
    display: block;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgb(var(--color-background) / 80%) 0%, rgb(var(--color-background)) 80%);
    z-index: 1;
  }

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1em;
  }

  kemet-button {
    position: relative;
    z-index: 1;
  }

  a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    position: relative;
    z-index: 1;
    color: white;
    border: 3px solid;
    padding-top: 2px;
    border-radius: 50%;
  }

  @media (min-width: 768px) {
    a {
      display: none;
    }
  }
  .project {
    position: absolute;
    z-index: 1;
    font-size: 2.5rem;
  }
`;

export const stylesSlider = css`
  :host {
    display: block;
    position: absolute;
    z-index: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
  }

  swiper-container {
    width: 100%;
    height: 100%;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
