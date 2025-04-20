import { css } from 'lit';

export default css`
  :host {
    color: rgb(var(--color-tertiary));
    display: block;
    position: relative;
    background-color: white;
    padding-top: 2rem;
    border-top: 1px solid rgb(var(--color-tertiary) / 25%);
  }

  fieldset {
    width: 80vw;
    border: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-align: left;
    margin: 0 auto;
  }

  @media screen and (min-width: 768px) {
    fieldset {
      width: 64vw;
      display: grid;
      gap: 2rem;
      grid-template-columns: 1fr 1.5fr;
    }
  }

  kemet-field:has(kemet-textarea) {
    display: flex;
    flex-direction: column;
    grid-row: 1 / 4;
    grid-column: 2;
  }

  kemet-textarea {
    height: calc(100% - 2rem);
  }

  kemet-textarea::part(textarea) {
    height: 100%;
  }

  kemet-field::part(label) {
    flex: 1;
  }

  kemet-input::part(input),
  kemet-textarea::part(textarea) {
    color: rgb(var(--color-tertiary));
  }

  p,
  kemet-button {
    position: relative;
    top: -1rem;
  }
`;
