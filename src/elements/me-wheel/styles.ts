import { css } from 'lit';

export default css`
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;
    transform-origin: 0 0;
    animation: spin 160s linear infinite;
  }


  nav {
    position: relative;
    width: 340px;
    height: 340px;
    margin: 50px auto;
    border: 2px solid white;
    border-radius: 50%;
    transition: transform 1s ease-in-out;
  }

  @media (min-width: 768px) {
    nav {
      width: 420px;
      height: 420px;
    }
  }

  button {
    cursor: pointer;
    position: absolute;
    width: 5vw;
    height: 5vw;
    min-width: 64px;
    min-height: 64px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    transform-origin: center;
    outline: 2px solid white;
    outline-offset: 4px;
  }

  img {
    display: flex;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @keyframes spin {
    from { transform: rotate(0deg) translate(-50%, -50%); }
    to { transform: rotate(360deg) translate(-50%, -50%); }
  }
`;
