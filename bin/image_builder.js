#!/usr/bin/env node
const path = require('path');
const glob = require('glob');
const { program } = require('commander');
const { readableStream } = require('../src/csv');
const { createImageBuilder } = require('../src');

program
  .name('image-builder')
  .description('CLI to build images from configuration files')
  .version('0.0.1')
  .requiredOption(
    '-c, --config <config>',
    'Configuration file in JavaScript or JSON. Accept globs.',
  )
  .option('-d, --debug', 'Verbose mode')
  .parse();

const filenames = glob.sync(program.opts().config);
const logger = require('../src/lib/logger')([], {
  level: program.opts().debug ? 0 : 1,
});

if (!filenames.length) {
  logger.error('No configuration files found');
  process.exit(0);
}

// eslint-disable-next-line no-restricted-syntax
for (const filename of filenames) {
  logger.debug(`Processing [${filename}]`);
  const rootPath = path.resolve(path.dirname(filename));
  const configfile = path.resolve(filename);
  let pipelineDefinition;
  try {
    logger.debug(`Loading pipeline definition [${configfile}]`);
    // eslint-disable-next-line global-require, import/no-dynamic-require
    pipelineDefinition = require(configfile);
    logger.debug(`Loaded pipeline definition [${configfile}]`);
  } catch (error) {
    throw new Error(
      `Error parsing the root path: [${rootPath}]: ${error.message}: ${error.stack}`,
    );
  }

  const imageBuilder = createImageBuilder();

  const services = {
    path: (dir) =>
      path.resolve(
        rootPath,
        ...[pipelineDefinition.root_path, dir].filter((v) => v),
      ),
  };
  const ctx = {
    ...services,
    logger,
    rootPath,
    pipelineDefinition,
  };

  const streamEach = readableStream(ctx, {
    ...pipelineDefinition.build.import,
    file: path.join(rootPath, pipelineDefinition.build.import.file),
  });

  streamEach.on('data', (data) => {
    imageBuilder
      .builder({
        ...ctx,
        logger: logger.get({
          tags: [data.id],
          level: program.opts().debug ? 0 : 1,
        }),
        options: pipelineDefinition.build.pipeline,
        data,
      })
      .catch((error) => {
        logger.error(`${error.message}: ${error.stack}`);
      });
  });
}
