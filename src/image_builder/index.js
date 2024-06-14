const path = require('path');
const { Transform } = require('stream');
const { createProcessorManager } = require('../processor');

async function builder({
  pipelineDefinition,
  rootPath,
  logger,
  options,
  data,
  processorManager,
}) {
  let output;
  logger.debug(`Generating image: [${data.name}]`);

  const ctx = {
    path: (dir) =>
      path.resolve(rootPath, ...[options.root, dir].filter((v) => v)),
    pipelineDefinition,
    logger,
    setOutput(dataOutput) {
      output = dataOutput;
    },
  };

  logger.debug('Start run pipeline');
  await processorManager.processPipeline({ ...ctx }, data, options.processors);
  logger.debug('End run pipeline');

  return output;
}

module.exports.builder = builder;
module.exports.createImageBuilder = function createImageBuilder() {
  const processorManager = createProcessorManager();
  processorManager.registerDir(path.join(__dirname, 'processors'));

  return {
    processorManager,
    builder(options) {
      return builder({ ...options, processorManager });
    },
  };
};
