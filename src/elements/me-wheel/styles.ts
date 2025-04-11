import { css } from 'lit';

export default css`
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }


  nav {
    position: relative;
    width: 420px;
    height: 420px;
    margin: 50px auto;
    border: 2px solid white;
    border-radius: 50%;
    transition: transform 0.5s ease-in-out;
    /*animation: spin 60s linear infinite; */
  }

  button {
    cursor: pointer;
    position: absolute;
    width: 5vw;
    height: 5vw;
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

  swiper-container {
    width: 100%;
    height: 100%;
    width: 75vw;
    height: 75vw;
    overflow: hidden;
    border-radius: 50%;
    border: 1rem solid white;
  }

  swiper-slide {
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  ::part(wrapper) {
    align-items: center;
  }

  @keyframes spin {
    from { transform: rotate(0deg) translate(-50%, -50%); }
    to { transform: rotate(360deg) translate(-50%, -50%); }
  }
`;
