import { css } from 'lit';

export default css`
  :host {
    display: inline-block;
    visibility: hidden;
  }

  :host([loading]) {
    visibility: visible;
  }

  .loader {
    width: 50px;
    --b: 8px;
    aspect-ratio: 1;
    border-radius: 50%;
    background: rgb(var(--color-primary));
    -webkit-mask:
      repeating-conic-gradient(#0000 0deg,#000 1deg 70deg,#0000 71deg 90deg),
      radial-gradient(farthest-side,#0000 calc(100% - var(--b) - 1px),#000 calc(100% - var(--b)));
    -webkit-mask-composite: destination-in;
            mask-composite: intersect;
    animation: l5 1s infinite;
  }

  @keyframes l5 {to{transform: rotate(.5turn)}}
`
