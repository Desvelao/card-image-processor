module.exports = {
  build: {
    import: {
      file: 'cards.csv', // define the dataset file
      options: {
        delimiter: ';', // delimiter of CSV file
        columns: true,
      },
    },
    pipeline: {
      processors: [
        {
          image_create: {
            width: 500,
            height: 700,
            color: 0x0,
            _ref: 'base',
          }, // Create a transparent image of 500x700 px and store as reference called "base"
        },
        {
          font_load: {
            // load a custom font from the fonts directory
            file: 'path("fonts/open-sans-32-brown/open-sans-32-black.fnt")',
            _ref: 'font', // store the reference as "font"
          },
        },
        {
          font_load: {
            // load a custom font from the fonts directory
            file: 'path("fonts/open-sans-16-brown/open-sans-16-black.fnt")',
            _ref: 'font16', // store the reference as "font16"
          },
        },
        {
          image_load: {
            /* load an image from "images/{ctx.image}". ctx represents the context of the card entry
              on the dataset
            */
            file: 'path("images/" + ctx.image)',
            _ref: 'image', // store the reference as "image"
          },
        },
        { image_resize: { w: 430, h: 380, _ref: 'image' } }, // resize the image with reference called as "image" to 430x380px
        { move: { x: 36, y: 70, _ref: 'image' } }, // move the image with reference called as "image" x:36 y:70 coordinates
        {
          image_load: {
            /* load an image from "frames/{ctx.rarity}". ctx represents the context of the card
            entry on the dataset */
            file: 'path("frames/"+ ctx.rarity) + ".png"',
            _ref: 'frame', // store the reference as "frame"
          },
        },
        {
          image_load: {
            if: 'ctx.cost > 0', // run the processor conditionally when the cost of the card is bigger than 0
            file: 'path("props/cost.png")', // load an image from "props/cost.png"
            _ref: 'cost_img', // store the reference as "cost_img"
          },
        },
        {
          move: {
            if: 'ctx.cost > 0', // run the processor conditionally when the cost of the card is bigger than 0
            _ref: 'cost_img',
            x: -5,
            y: -5,
          }, // move the image reference
        },
        {
          text_write: {
            // write text
            if: 'ctx.cost > 0', // run the processor conditionally when the cost of the card is bigger than 0
            text: 'ctx.cost', // text to write
            _ref: 'text_cost', // text reference
            _ref_font: 'font', // font reference
            x: 'calcPos("cost_img", _self, {cx: {}}).x', // x coordinates
            y: 'calcPos("cost_img", _self, {cy: {}}).y', // y coordinates
          },
        },
        {
          image_load: {
            if: 'ctx.weight > 0', // run the processor conditionally when the weight of the card is bigger than 0
            file: 'path("props/weight.png")',
            _ref: 'weight_img',
          },
        },
        {
          move: {
            if: 'ctx.weight > 0', //  run the processor conditionally when the weight of the card is bigger than 0
            _ref: 'weight_img',
            x: 380,
            y: -5,
          },
        },
        {
          text_write: {
            if: 'ctx.weight > 0', //  run the processor conditionally when the weight of the card is bigger than 0
            text: 'ctx.weight',
            _ref: 'text_weight',
            _ref_font: 'font',
            x: 'calcPos("weight_img", _self, {cx: {}}).x',
            y: 'calcPos("weight_img", _self, {cy: {}}).y',
          },
        },
        {
          image_load: {
            if: 'ctx.damage', // run the processor conditionally when the damage of the card is bigger than 0
            file: 'path("props/damage.png")',
            _ref: 'damage_img',
          },
        },
        {
          move: {
            if: 'ctx.damage', // run the processor conditionally when the damage of the card is bigger than 0
            _ref: 'damage_img',
            x: 380,
            y: 585,
          },
        },
        {
          text_write: {
            if: 'ctx.damage', // run the processor conditionally when the damage of the card is defined
            text: 'ctx.damage',
            _ref: 'text_damage',
            _ref_font: 'font',
            x: 'calcPos("damage_img", _self, {cx: {}}).x',
            y: 'calcPos("damage_img", _self, {cy: {}}).y',
          },
        },
        {
          text_write: {
            text: 'ctx.name',
            _ref: 'text_name',
            _ref_font: 'font',
            x: 'calcPos("base", _self, {cx: {}}).x',
            y: 36,
          },
        },
        {
          text_write: {
            text: 'ctx.type',
            _ref: 'text_type',
            _ref_font: 'font',
            x: 50,
            y: 447,
          },
        },
        {
          text_write: {
            text: 'ctx.description',
            _ref: 'text_description',
            _ref_font: 'font16',
            x: 'ref("base").data.w*0.1',
            y: 500,
            xm: 'ref("base").data.w*0.8',
            ym: 650,
            align_x: 'write.align.horizontal_align_center',
          },
        },
        {
          compose: {
            // compose the image
            _ref_output: 'card', // reference to store the output
            _ref_base: 'base', // base reference to compose the image
            _ref_compose: [
              // references to compose the image
              'image',
              'frame',
              'cost_img',
              'text_cost',
              'weight_img',
              'damage_img',
              'text_cost',
              'text_weight',
              'text_damage',
              'text_name',
              'text_type',
              'text_description',
            ],
          },
        },
        {
          image_to_buffer: {
            format: 'png',
            _ref_output: 'buffer',
            _ref: 'card',
          },
        },
        {
          export: {
            // export to file
            format: 'png', // format
            _ref: 'buffer', // reference
            file: 'path("output/"+ctx.id+".png")', // path to file
            from_data: 'binary',
          },
        },
      ],
    },
  },
  print: {
    page: {
      size: 'A4',
      margin: 24,
      images_per_row: 3,
      images_per_column: 3,
      gutter_size: 1,
    },
    file: 'output.pdf',
    // content [[path to card image file, copies]]
    content: [
      ['output/dagger_common.png', 1],
      ['output/dagger_uncommon.png', 1],
      ['output/dagger_rare.png', 1],
      ['output/dagger_epic.png', 1],
      ['output/dagger_legendary.png', 1],
      ['output/dagger_common_no_weight.png', 1],
      ['output/dagger_common_no_weight_no_cost.png', 1],
      ['output/dagger_common_no_weight_no_cost_no_damage.png', 1],
    ],
  },
};
