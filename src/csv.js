const fs = require('fs');
const { parse } = require('csv');

module.exports.readableStream = function readableStream(
  ctx,
  { file, options },
) {
  if (!file) {
    ctx.logger.error('No file');
    return undefined;
  }

  const filePath = ctx.path(file);

  return fs.createReadStream(filePath).pipe(parse(options));
};
