const { createProcessorManager, evalReturn } = require('./manager');

const noop = () => {};
const logger = {
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
};

describe('ProcessManager', () => {
  it('Register plugin', () => {
    const pm = createProcessorManager();
    pm.register({ name: 'test' });
    expect(pm.find(({ name }) => name === 'test')).toBeTruthy();
  });

  it('Register plugin - Error plugin already registered', () => {
    const pm = createProcessorManager();
    pm.register({ name: 'test' });

    expect(() => pm.register({ name: 'test' })).toThrow(
      'Plugin already registered [test]',
    );
  });

  it.each`
    title                                                | processors                                                               | pipeline                                                     | haveBeenCalled
    ${'Process pipeline - Run processor'}                | ${[{ name: 'test', run: jest.fn() }]}                                    | ${{ pipeline: [{ test: {} }] }}                              | ${1}
    ${'Process pipeline - No run processor'}             | ${[{ name: 'test', run: jest.fn() }, { name: 'test2', run: jest.fn() }]} | ${{ pipeline: [{ test2: {} }] }}                             | ${0}
    ${'Process pipeline - Run processor multiple times'} | ${[{ name: 'test', run: jest.fn() }, { name: 'test2', run: jest.fn() }]} | ${{ pipeline: [{ test: {} }, { test2: {} }, { test: {} }] }} | ${2}
    ${'Process pipeline - No run processor with if'}     | ${[{ name: 'test', run: jest.fn() }, { name: 'test2', run: jest.fn() }]} | ${{ pipeline: [{ test: { if: false } }] }}                   | ${1}
  `('$title', async ({ processors, pipeline, haveBeenCalled }) => {
    const pm = createProcessorManager();
    processors.forEach((p) => pm.register(p));

    await pm.processPipeline(
      {
        logger,
        evaluate(str, extra) {
          return evalReturn(str)({ ...(extra || {}) }, '');
        },
      },
      {},
      pipeline,
    );

    expect(processors[0].run).toHaveBeenCalledTimes(haveBeenCalled);
  });
});
