/* eslint no-param-reassign: 0 */
const movementModes = {
  lx: (r, c, m) => {
    c.x = r.x + (m.x || 0);
  },
  rx: (r, c, m) => {
    c.x = r.x + r.w + (m.x || 0);
  },
  cx: (r, c, m) => {
    c.x = r.x + (r.w - c.w) / 2 + (m.x || 0);
  },
  csx: (r, c, m) => {
    c.x = r.x - c.w / 2 + (m.x || 0);
  },
  glx: (r, c, m) => {
    c.x = r.x + (m.x || 0);
  },
  gxr: (r, c, m) => {
    c.x = r.x + r.w - c.w - (m.x || 0);
  },
  ty: (r, c, m) => {
    c.y = r.y + (m.y || 0);
  },
  by: (r, c, m) => {
    c.y = r.y + r.h + (m.y || 0);
  },
  cy: (r, c, m) => {
    c.y = r.y + (r.h - c.h) / 2 + (m.y || 0);
  },
  gyt: (r, c, m) => {
    c.y = r.y + (m.y || 0);
  },
  gyb: (r, c, m) => {
    c.y = r.y + r.h - c.h - (m.y || 0);
  },
};
/* eslint no-param-reassign: 2 */

module.exports = {
  name: 'move',
  setup(ctx) {
    ctx.registerEval('calcPos', (refName, current, movement) => {
      const ref = ctx.ref(refName).data;
      ctx.logger.debug(
        `calcPos [before]: ${JSON.stringify({
          movement,
          refName,
          ref: {
            x: ref.x,
            y: ref.y,
            w: ref.w,
            h: ref.h,
          },
          cur: {
            x: current.x,
            y: current.y,
            w: current.w,
            h: current.h,
          },
        })}`,
      );
      Object.entries(movement).forEach(([key, value]) => {
        if (movementModes[key]) {
          movementModes[key](ref, current, value);
        }
      });

      ctx.logger.debug(
        `calcPos [after]: ${JSON.stringify({
          movement,
          refName,
          ref: {
            x: ref.x,
            y: ref.y,
            w: ref.w,
            h: ref.h,
          },
          cur: {
            x: current.x,
            y: current.y,
            w: current.w,
            h: current.h,
          },
        })}`,
      );
      return current;
    });
  },
  async run(ctx, _, step) {
    const ref = ctx.references.get(step._ref);

    if (step.x) {
      ref.data.x = ctx.evaluate(step.x, { _self: ref });
    }

    if (step.y) {
      ref.data.y = ctx.evaluate(step.y, { _self: ref });
    }

    ctx.setRef(step._ref, ref);
  },
};
