#!/usr/bin/env node
/* eslint no-shadow: 0 */
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { program } = require('commander');

program
  .name('image-builder-compose-pdf')
  .description('CLI to build a PDF with a composition of cards')
  .version('0.0.1')
  .requiredOption(
    '-c, --config <config>',
    'Configuration file in JavaScript or JSON. Accept globs.',
  )
  .option('-d, --debug', 'Verbose mode')
  .parse();

const logger = require('../src/lib/logger')([], {
  level: program.opts().debug ? 0 : 1,
});

const pageSizes = {
  '4A0': [4767.87, 6740.79],
  '2A0': [3370.39, 4767.87],
  A0: [2383.94, 3370.39],
  A1: [1683.78, 2383.94],
  A2: [1190.55, 1683.78],
  A3: [841.89, 1190.55],
  A4: [595.28, 841.89],
  A5: [419.53, 595.28],
  A6: [297.64, 419.53],
  A7: [209.76, 297.64],
  A8: [147.4, 209.76],
  A9: [104.88, 147.4],
  A10: [73.7, 104.88],
  B0: [2834.65, 4008.19],
  B1: [2004.09, 2834.65],
  B2: [1417.32, 2004.09],
  B3: [1000.63, 1417.32],
  B4: [708.66, 1000.63],
  B5: [498.9, 708.66],
  B6: [354.33, 498.9],
  B7: [249.45, 354.33],
  B8: [175.75, 249.45],
  B9: [124.72, 175.75],
  B10: [87.87, 124.72],
  C0: [2599.37, 3676.54],
  C1: [1836.85, 2599.37],
  C2: [1298.27, 1836.85],
  C3: [918.43, 1298.27],
  C4: [649.13, 918.43],
  C5: [459.21, 649.13],
  C6: [323.15, 459.21],
  C7: [229.61, 323.15],
  C8: [161.57, 229.61],
  C9: [113.39, 161.57],
  C10: [79.37, 113.39],
  RA0: [2437.8, 3458.27],
  RA1: [1729.13, 2437.8],
  RA2: [1218.9, 1729.13],
  RA3: [864.57, 1218.9],
  RA4: [609.45, 864.57],
  SRA0: [2551.18, 3628.35],
  SRA1: [1814.17, 2551.18],
  SRA2: [1275.59, 1814.17],
  SRA3: [907.09, 1275.59],
  SRA4: [637.8, 907.09],
  EXECUTIVE: [521.86, 756.0],
  FOLIO: [612.0, 936.0],
  LEGAL: [612.0, 1008.0],
  LETTER: [612.0, 792.0],
  TABLOID: [792.0, 1224.0],
};

const filenames = glob.sync(program.opts().config);

if (!filenames.length) {
  logger.info('No configuration files found');
  process.exit(0);
}

function* chunks(arr, n) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

function createPDF(pages, options, { logger }) {
  const {
    images_per_row: pageRows,
    images_per_column: pageCols,
    gutter_size: gutterSize,
    ...documentOptions
  } = options;

  let pageSize = options.size;

  if (typeof options.size === 'string') {
    pageSize = pageSizes[options.size];
    if (!pageSize) {
      logger.error(`[${options.size}] not found`);
      process.exit(1);
    }
  }

  const doc = new PDFDocument({ ...documentOptions, size: pageSize });

  const imageWidth =
    (pageSize[0] - options.margin * 2 - (pageCols - 1) * gutterSize) / pageCols;
  const imageHeight =
    (pageSize[1] - options.margin * 2 - (pageRows - 1) * gutterSize) / pageRows;

  logger.debug(
    [
      ['imageWidth', imageWidth],
      ['imageHeight', imageHeight],
    ]
      .map(([label, value]) => `${label}: [${value}]`)
      .join(' '),
  );

  pages.forEach((page, indexPage) => {
    page.forEach((file, i) => {
      const row = Math.floor(i / pageCols);
      const col = i % pageCols;
      const x = options.margin + (imageWidth + gutterSize) * col;
      const y = options.margin + (imageHeight + gutterSize) * row;
      logger.debug(
        [
          ['page', indexPage],
          ['row', row],
          ['col', col],
          ['x', x],
          ['y', y],
        ]
          .map(([label, value]) => `${label}: [${value}]`)
          .join(' '),
      );
      doc.image(file, x, y, {
        fit: [imageWidth, imageHeight],
      });
    });

    if (pages.length !== indexPage + 1) doc.addPage();
  });

  doc.end();

  return doc;
}

function run(filename, { logger }) {
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
      `Error parsing the root path: [${configfile}]: ${error.message}`,
    );
  }

  if (!pipelineDefinition.print.file) {
    logger.error('Print file is not defined.');
    process.exit(1);
  }

  const outputFile = path.join(rootPath, pipelineDefinition.print.file);

  const services = {
    path: (dir) =>
      path.resolve(
        rootPath,
        ...[pipelineDefinition.root_path, dir].filter((v) => v),
      ),
  };

  const images = [];

  pipelineDefinition.print.content.forEach(([file, copies]) => {
    images.push(
      ...Array.from({ length: copies }).map(() => services.path(file)),
    );
  });

  logger.debug(`Images [${images.length}]`);
  const pages = [
    ...chunks(
      images,
      pipelineDefinition.print.page.images_per_row *
        pipelineDefinition.print.page.images_per_column,
    ),
  ];
  logger.debug(`Pages [${pages.length}]`);

  const outputDirname = path.dirname(outputFile);
  if (!fs.existsSync(outputDirname)) {
    fs.mkdirSync(outputDirname, { recursive: true });
  }

  const stream = createPDF(pages, pipelineDefinition.print.page, {
    logger,
  }).pipe(fs.createWriteStream(outputFile));

  stream.on('finish', () => {
    logger.info(`File created [${outputFile}]`);
  });
}

// eslint-disable-next-line no-restricted-syntax
for (const filename of filenames) {
  run(filename, { logger: logger.get({ tags: [filename] }) });
}
