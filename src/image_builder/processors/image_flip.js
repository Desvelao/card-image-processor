module.exports = {
  name: 'image_flip',
  async run(ctx, _, step) {
    ctx.ref(step._ref).data.image.flip(step.h, step.v);
  },
};
