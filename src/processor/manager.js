const glob = require('glob');
const createLogger = require('./logger');

async function stepProcessor(ctx, data, step) {
  if (Array.isArray(step)) {
    ctx.logger.debug('Run pipeline from processor');
    // eslint-disable-next-line no-restricted-syntax
    for (const processorInPipeline of step) {
      // eslint-disable-next-line no-await-in-loop
      await stepProcessor(ctx, data, processorInPipeline);
    }
    return;
  }
  const [stepKey] = Object.keys(step);
  const processor = ctx.processorManager.get(stepKey);
  if (!processor) {
    ctx.logger.debug(`Processor not found: ${JSON.stringify({ step })}`);
  } else {
    ctx.logger.debug(`Execute processor: [${processor.name}]`);
    const stepConfig = step[stepKey];
    if (stepConfig.if && !ctx.evaluate(stepConfig.if)) {
      ctx.logger.debug('Skip processor');
      return;
    }
    try {
      await processor.run(ctx, data, stepConfig);
    } catch (error) {
      ctx.logger.error(
        `Error on processor [${processor.name}]: ${error.message} ${error.stack}`,
      );
      // Implement ignore_failure and on_failure props
    }
  }
}

function evalReturn(str) {
  return new Function('ctx', 'data', `return ${str}`); // eslint-disable-line no-new-func
}

module.exports.stepProcessor = stepProcessor;
module.exports.evalReturn = evalReturn;
module.exports.createProcessorManager = function createProcessorManager({
  loggerOptions,
} = {}) {
  const plugins = new Map();

  const logger = createLogger(loggerOptions);

  function pluginsToArray() {
    return [...plugins.values()];
  }

  return {
    register(plugin) {
      logger.debug(`Registering plugin ${plugin.name}`);
      if (plugins.has(plugin.name)) {
        logger.error(`${plugin.name} already registered`);
        throw new Error(`Plugin already registered [${plugin.name}]`);
      }
      plugins.set(plugin.name, plugin);
      logger.debug(`${plugin.name} was registered`);
    },
    registerDir(dirname) {
      let directory = dirname;
      if (!dirname.endsWith('/')) directory += '/';
      const pattern = `${directory}*.js`;
      const filenames = glob.sync(pattern);
      // eslint-disable-next-line global-require, import/no-dynamic-require
      filenames.forEach((filename) => this.register(require(filename)));
    },
    get(name) {
      if (!plugins.has(name)) {
        throw new Error(`Plugin was not registered [${name}]`);
      }
      return plugins.get(name);
    },
    list: () => [...plugins.keys()],
    forEach: (cb) => pluginsToArray().forEach(cb),
    find: (cb) => pluginsToArray().find(cb),
    filter: (cb) => pluginsToArray().filter(cb),
    async processPipeline(contextProcessPipeline, ctx, pipeline) {
      logger.debug('Processing pipeline');
      const references = new Map();
      const evaluatePublic = new Map();
      evaluatePublic.set('ctx', ctx);

      const context = {
        logger,
        references,
        setRef(key, value) {
          return references.set(key, value);
        },
        ref(name) {
          return references.get(name);
        },
        ...contextProcessPipeline,
        processorManager: this,
        evaluate(str, extra = {}) {
          const publicContext = {
            ...Object.fromEntries(evaluatePublic.entries()),
            ref: this.ref,
            path: this.path,
            ...extra,
          };

          const contextEval = Object.entries(publicContext).reduce(
            (accum, [key, value]) => {
              accum.keys.push(key);
              accum.values.push(value);
              return accum;
            },
            { keys: [], values: [] },
          );
          // eslint-disable-next-line no-new-func
          return new Function(...contextEval.keys, `return ${str}`)(
            ...contextEval.values,
          );
        },
        evaluateScript(str, extra = {}) {
          const publicContext = {
            ...Object.fromEntries(evaluatePublic.entries()),
            ref: this.ref,
            path: this.path,
            ...extra,
          };

          const contextEval = Object.entries(publicContext).reduce(
            (accum, [key, value]) => {
              accum.keys.push(key);
              accum.values.push(value);
              return accum;
            },
            { keys: [], values: [] },
          );
          // eslint-disable-next-line no-new-func
          return new Function(...contextEval.keys, str)(...contextEval.values);
        },
        registerEval(name, value) {
          if (evaluatePublic.has(name)) {
            throw new Error(`eval key already registered [${name}]`);
          }
          return evaluatePublic.set(name, value);
        },
      };

      this.setup(context);

      return stepProcessor(context, ctx, pipeline);
    },
    setup(context) {
      this.forEach((plugin) => plugin.setup && plugin.setup(context));
    },
  };
};
