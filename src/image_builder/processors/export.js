const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'export',
  run: async (ctx, data, step) => {
    const ref = ctx.ref(step._ref);
    if (!ref || (ref && !ref.data)) {
      ctx.logger.warn(`Card with no data [${data.name}]`);
      return;
    }

    const file = ctx.evaluate(step.file);

    const fromData = step.from_data || 'binary';
    if (!file) {
      ctx.logger.warn(
        `Card with no file [${data.name}]. Define the file attribute.`,
      );
      return;
    }
    ctx.logger.debug(`Exporting card: [${data.name}] to [${file}]`);
    const dirname = path.dirname(file);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
    fs.writeFileSync(file, ref.data, fromData);
    ctx.logger.info(`Created card: [${data.name}] into [${file}]`);
  },
};
