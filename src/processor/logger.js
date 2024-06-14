function createLogger(type, index, tags = []) {
  return function log(message) {
    if (index >= this._minLevel) {
      // eslint-disable-next-line no-console
      console.log(
        `[${type}]${tags.map((tag) => `[${tag}]`).join()}: ${message}`,
      );
    }
  };
}

module.exports = function Logger(options) {
  const logger = {
    _minLevel: (options || {}).level || 0,
    _tags: (options || {}).tags || [],
  };

  ['debug', 'info', 'warn', 'error'].forEach((level, index) => {
    logger[level] = createLogger(level, index, logger.tags).bind(logger);
  });

  logger.get = function get(opt) {
    return Logger({
      tags: [...this._tags, ...((opt || {}).tags || [])],
      level: (opt || {}).level || this._minLevel,
    });
  };

  return logger;
};
