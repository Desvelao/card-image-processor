const jimp = require('jimp');

module.exports = {
  name: 'image_to_buffer',
  run: async (ctx, _, step) => {
    const [, baseRef] = [...ctx.references.entries()].find(
      ([key]) => key === step._ref,
    ) || [null, null];

    if (!baseRef) {
      ctx.logger.error(`Reference not found [${step._ref}]`);
    }

    const format = step.format || 'jpg';

    return new Promise((res, rej) => {
      baseRef.data.image.getBuffer(
        format === 'png' ? jimp.MIME_PNG : jimp.MIME_JPEG,
        (err, buffer) => {
          if (err) {
            rej(err);
          }
          ctx.setRef(step._ref_output, { data: buffer });
          res(buffer);
        },
      );
    });
  },
};
