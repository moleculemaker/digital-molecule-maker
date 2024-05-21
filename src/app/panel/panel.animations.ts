import { style, animate, animation, keyframes } from '@angular/animations';

// =========================
// bounce
// =========================

export const bounceIn = animation([
  style({
    transform: 'scale(.5)',
    opacity: 0,
  }),
  animate(
    '400ms cubic-bezier(0.785, 0.135, 0.15, 0.86)',
    keyframes([
      style({
        offset: 0.8,
        transform: 'scale(1.2)',
      }),
      style({
        offset: 1,
        transform: 'scale(1)',
        opacity: 1,
      }),
    ]),
  ),
]);

export const bounceOut = animation([
  style({
    transform: 'scale(1)',
    opacity: 1,
  }),
  animate(
    '400ms cubic-bezier(0.785, 0.135, 0.15, 0.86)',
    keyframes([
      style({
        offset: 0.2,
        transform: 'scale(1.2)',
      }),
      style({
        offset: 1,
        transform: 'scale(.5)',
        opacity: 0,
      }),
    ]),
  ),
]);

// =========================
// slide
// =========================

export const slideIn = animation([
  style({
    transform: 'translateX(100%)',
    opacity: 0,
  }),
  animate(
    '400ms cubic-bezier(0.785, 0.135, 0.15, 0.86)',
    style({
      transform: 'translateX(0%)',
      opacity: 1,
    }),
  ),
]);

export const slideOut = animation([
  animate(
    '400ms cubic-bezier(0.785, 0.135, 0.15, 0.86)',
    style({
      transform: 'translateX(100%)',
      opacity: 0,
    }),
  ),
]);
