import { css } from 'lit';

export default css`
  :host {
    display: block;
    position: relative;
    z-index: 3;
  }

  svg {
    position:relative;
    width: 100%;
    height: 40px;
    margin-bottom: -7px;
    min-height: 40px;
    max-height: 150px;
  }

  @media (min-width: 768px) {
    svg {
      height: 15vh;
      min-height: 100px;
    }
  }

  g > use {
    animation: move 25s cubic-bezier(.55,.5,.45,.5) infinite;
  }

  g > use:nth-child(1) {
    animation-delay: -2s;
    animation-duration: 7s;
  }

  g > use:nth-child(2) {
    animation-delay: -3s;
    animation-duration: 10s;
  }

  g > use:nth-child(3) {
    animation-delay: -4s;
    animation-duration: 13s;
  }

  g > use:nth-child(4) {
    animation-delay: -5s;
    animation-duration: 20s;
  }

  @keyframes move {
    0% {
    transform: translate3d(-90px,0,0);
    }
    100% {
      transform: translate3d(85px,0,0);
    }
  }
`;
