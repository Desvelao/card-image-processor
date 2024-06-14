module.exports = {
  name: 'image_contrast',
  async run(ctx, _, step) {
    ctx.ref(step._ref).data.image.contrast(step.value);
  },
};
