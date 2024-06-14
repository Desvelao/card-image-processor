const jimp = require('jimp');

module.exports = {
  name: 'image_resize',
  setup(ctx) {
    ctx.registerEval('resize', {
      auto: jimp.AUTO,
    });
  },
  async run(ctx, _, step) {
    const ref = ctx.references.get(step._ref);

    const width = step.w ? ctx.evaluate(step.w) : jimp.AUTO;
    const height = step.h ? ctx.evaluate(step.h) : jimp.AUTO;
    ref.data.image.resize(width, height);
  },
};
