import {
  state,
  style,
  animate,
  animation,
  keyframes,
} from '@angular/animations';

// =========================
// blur
// =========================

export const blurIn = animation(
  [
    animate(
      '{{time}} 0ms cubic-bezier(0.785, 0.135, 0.15, 0.86)',
      style({
        backgroundColor: '#f00', //'rgba(#ccc, .8)',
        //    backdropFilter: 'blur(4px)'
      }),
    ),
  ],
  {
    params: {
      time: '400ms',
    },
  },
);

export const blurOut = animation(
  [
    animate(
      '{{time}} 0ms cubic-bezier(0.785, 0.135, 0.15, 0.86)',
      style({
        backgroundColor: '#0f0', //rgba(#ccc, 0)',
        //    backdropFilter: 'blur(0px)'
      }),
    ),
  ],
  {
    params: {
      time: '400ms',
    },
  },
);

// =========================
// bounce
// =========================

export const bounceIn = animation(
  [
    style({
      transform: 'scale(.5)',
      opacity: 0,
    }),
    animate(
      '{{time}} cubic-bezier(0.785, 0.135, 0.15, 0.86)',
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
  ],
  {
    params: {
      time: '400ms',
    },
  },
);

export const bounceOut = animation(
  [
    style({
      transform: 'scale(1)',
      opacity: 1,
    }),
    animate(
      '{{time}} cubic-bezier(0.785, 0.135, 0.15, 0.86)',
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
  ],
  {
    params: {
      time: '400ms',
    },
  },
);

// =========================
// slide
// =========================

export const slideIn = animation(
  [
    style({
      transform: 'translateX(100%)',
      opacity: 0,
    }),
    animate(
      '{{time}} cubic-bezier(0.785, 0.135, 0.15, 0.86)',
      style({
        transform: 'translateX(0%)',
        opacity: 1,
      }),
    ),
  ],
  {
    params: {
      time: '400ms',
    },
  },
);

export const slideInReverse = animation(
  [
    style({
      transform: 'translateX(-100%)',
      opacity: 0,
    }),
    animate(
      '{{time}} cubic-bezier(0.785, 0.135, 0.15, 0.86)',
      style({
        transform: 'translateX(0%)',
        opacity: 1,
      }),
    ),
  ],
  {
    params: {
      time: '400ms',
    },
  },
);

export const slideOut = animation(
  [
    animate(
      '{{time}} cubic-bezier(0.785, 0.135, 0.15, 0.86)',
      style({
        transform: 'translateX(-100%)',
        opacity: 0,
      }),
    ),
  ],
  {
    params: {
      time: '400ms',
    },
  },
);

export const slideOutReverse = animation(
  [
    animate(
      '{{time}} cubic-bezier(0.785, 0.135, 0.15, 0.86)',
      style({
        transform: 'translateX(100%)',
        opacity: 0,
      }),
    ),
  ],
  {
    params: {
      time: '400ms',
    },
  },
);
