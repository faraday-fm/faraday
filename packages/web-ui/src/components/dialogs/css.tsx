import { css } from "@css";

const glob = css`@keyframes dialog-animation {
  0% {
    opacity: 0;
    /* transform: translate(-0%, -5%); */
    transform: scale(0.97, 0.97);
  }

  100% {
    opacity: 1;
    /* transform: translate(0%, 0%); */
    transform: scale(1, 1);
  }
}`;

export const dialogTitle = css`color: var(--dialog-foreground);`;
export const dialogContent = css`
  color: var(--dialog-foreground);
    box-shadow: var(--dialog-shadow);
    padding: 0.5rem;

    & p {
      margin: 0;
      padding: 1px;
    }

    & input:focus {
      outline: auto;
    }`;
export const dialogButton = css`
  margin: 0 0.25em;
    background-color: transparent;
    border: none;

    &:before {
      content: "[ ";
    }

    &:after {
      content: " ]";
    }

    &:focus {
      background-color: var(--color-11);
      /* outline: none; */
    }`;

export const dialogBackdrop = css`
animation-name: dialog-animation;
animation-duration: 0.2s;
padding: 0;
border-width: 1px;
background-color: var(--dialog-background);
box-shadow: 0.5rem 0.5rem #0004;
`;
