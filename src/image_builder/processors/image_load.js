const jimp = require('jimp');

module.exports = {
  name: 'image_load',
  async run(ctx, _, step) {
    const file = ctx.evaluate(step.file);
    const asset = await jimp.read(file);
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
