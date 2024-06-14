module.exports = {
  name: 'compose',
  run: async (ctx, _, step) => {
    const references = [...ctx.references.entries()];

    const [, baseRef] = references.find(([key]) => key === step._ref_base) || [
      null,
      null,
    ];

    if (!baseRef) {
      ctx.logger.error(`Base reference not found [${step._ref_base}]`);
    }

    step._ref_compose.forEach((composeKey) => {
      const composeRef = (references.find(([key]) => key === composeKey) || [
        null,
        null,
      ])[1];

      if (!composeRef) {
        return;
      }

      if (composeRef.data.image) {
        const { image, x, y } = composeRef.data;
        baseRef.data.image.composite(image, x, y);
      } else if (composeRef.data.text) {
        const {
          text,
          x,
          y,
          align_x: alignmentX,
          align_y: alignmentY,
          xm,
          ym,
          font,
        } = composeRef.data;
        baseRef.data.image.print(
          font,
          x,
          y,
          alignmentX || alignmentY
            ? {
                text,
                ...(alignmentX ? { alignmentX } : {}),
                ...(alignmentY ? { alignmentY } : {}),
              }
            : text,
          xm,
          ym,
        );
      }
    });

    ctx.setRef(step._ref_output, { ...baseRef });
  },
};
