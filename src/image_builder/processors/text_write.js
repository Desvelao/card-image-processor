const jimp = require('jimp');

const align = {
  horizontal_align_left: jimp.HORIZONTAL_ALIGN_LEFT,
  horizontal_align_center: jimp.HORIZONTAL_ALIGN_CENTER,
  horizontal_align_right: jimp.HORIZONTAL_ALIGN_RIGHT,
  vertical_align_top: jimp.VERTICAL_ALIGN_TOP,
  vertical_align_middle: jimp.VERTICAL_ALIGN_MIDDLE,
  vertical_align_center: jimp.VERTICAL_ALIGN_CENTER,
  vertical_align_bottom: jimp.VERTICAL_ALIGN_BOTTOM,
};

function calculateWidth(font, text) {
  const chars = text.split('');
  let size = 0;
  chars.forEach((c) => {
    size += font.chars[c] ? font.chars[c].xadvance : 0;
  });
  return size;
}

module.exports = {
  name: 'text_write',
  setup(ctx) {
    ctx.registerEval('write', {
      align,
    });
  },
  async run(ctx, _, step) {
    const data = {};
    data.font = ctx.references.get(step._ref_font).data.font;
    data.text = ctx.evaluate(step.text).replace(/\\n/g, '\n');
    if (step.replace) {
      data.text = step.replace.reduce(
        (accum, cur) =>
          accum.replace(ctx.evaluate(cur.from), ctx.evaluate(cur.to)),
        data.text,
      );
    }
    data.w = calculateWidth(data.font, data.text);
    data.h = data.font.info.size;
    data.x = ctx.evaluate(step.x, { _self: data }) || 0;
    data.y = ctx.evaluate(step.y, { _self: data }) || 0;
    data.xm = ctx.evaluate(step.xm, { _self: data }) || undefined;
    data.ym = ctx.evaluate(step.ym, { _self: data }) || undefined;
    data.align_x = ctx.evaluate(step.align_x, { _self: data }) || undefined;
    data.align_y = ctx.evaluate(step.align_y, { _self: data }) || undefined;

    ctx.setRef(step._ref, { data });
  },
};
