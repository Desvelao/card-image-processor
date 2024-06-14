const jimp = require('jimp');

module.exports = {
  name: 'script',
  async run(ctx, _, step) {
    ctx.evaluateScript(step.script, { jimp });
  },
};
