module.exports = {
  name: 'image_brightness',
  async run(ctx, _, step) {
    ctx.ref(step._ref).data.image.brightness(step.value);
  },
};
