const jimp = require('jimp');

const fonts = {
  font_sans_8_black: jimp.FONT_SANS_8_BLACK,
  font_sans_16_black: jimp.FONT_SANS_16_BLACK,
  font_sans_32_black: jimp.FONT_SANS_32_BLACK,
  font_sans_64_black: jimp.FONT_SANS_64_BLACK,
  font_sans_128_black: jimp.FONT_SANS_128_BLACK,
  font_sans_8_white: jimp.FONT_SANS_8_WHITE,
  font_sans_16_white: jimp.FONT_SANS_16_WHITE,
  font_sans_32_white: jimp.FONT_SANS_32_WHITE,
  font_sans_64_white: jimp.FONT_SANS_64_WHITE,
  font_sans_128_white: jimp.FONT_SANS_128_WHITE,
};

module.exports = {
  name: 'font_load',
  setup(ctx) {
    ctx.registerEval('default_font', fonts);
  },
  async run(ctx, _, step) {
    const font = await jimp.loadFont(ctx.evaluate(step.file));

    const data = {
      font,
    };

    ctx.setRef(step._ref, { data });
  },
};
