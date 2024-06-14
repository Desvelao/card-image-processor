const Jimp = require('jimp');

module.exports = {
  name: 'image_create',
  async run(ctx, _, step) {
    const asset = await new Jimp(
      ctx.evaluate(step.width),
      ctx.evaluate(step.height),
      ctx.evaluate(step.color),
    );

    const data = {
      image: asset,
      x: 0,
      y: 0,
      w: asset.bitmap.width,
      h: asset.bitmap.height,
    };

    ctx.setRef(step._ref, { data });
  },
};
