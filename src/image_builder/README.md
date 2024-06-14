# Image builder

The image builder composes the image from a defined pipeline of processors.

The processor can load image, load font, write text, move images or text, resize images, compose the images and text and export to file.

> This is a wrapper of [jimp](https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://github.com/jimp-dev/jimp&ved=2ahUKEwiBkdGh8aGGAxXdVaQEHXdeCnMQFnoECBcQAQ&usg=AOvVaw3eixYcQlbToitWOjcbl3fC) library.

Example of pipeline:

```js
{
  processors: [
    {
      image_create: { width: 500, height: 700, color: 0x0, _ref: 'base' }, // Create a transparent image of 500x700 px and store as reference called "base"
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
        // load an image from "images/{ctx.image}". ctx represents the context of the card entry on the dataset
        file: 'path("images/" + ctx.image)',
        _ref: 'image', // store the reference as "image"
      },
    },
    { image_resize: { w: 430, h: 380, _ref: 'image' } }, // resize the image with reference called as "image" to 430x380px
    { move: { x: 36, y: 70, _ref: 'image' } }, // move the image with reference called as "image" x:36 y:70 coordinates
    {
      image_load: {
        // load an image from "frames/{ctx.rarity}". ctx represents the context of the card entry on the dataset
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
        if: 'ctx.damage > 0', // run the processor conditionally when the damage of the card is bigger than 0
        file: 'path("props/damage.png")',
        _ref: 'damage_img',
      },
    },
    {
      move: {
        if: 'ctx.damage > 0', // run the processor conditionally when the damage of the card is bigger than 0
        _ref: 'damage_img',
        x: 380,
        y: 585,
      },
    },
    {
      text_write: {
        if: 'ctx.damage > 0', // run the processor conditionally when the damage of the card is bigger than 0
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
        format: 'png', // format
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
      export: {
        // export to file
        format: 'png', // format
        _ref: 'card', // reference
        file: 'path("output/"+ctx.id+".png")', // path to file
        from_data: 'binary',
      },
    },
  ];
}
```

## Processors

### Image

- `image_create`

Create a basic image.

| property | description                        | values | eval |
| -------- | ---------------------------------- | ------ | ---- |
| width    | width of the image                 | number | yes  |
| height   | height of the image                | number | yes  |
| color    | color of the image                 | number | yes  |
| \_ref    | reference name of the loaded image | string | no   |

Example:

```js
{"image_create": {"width": 500, "height": 700, color: 0x0, "_ref": "new_image"}}
```

- `image_load`

Load an image from a file.

| property | description                        | values | eval |
| -------- | ---------------------------------- | ------ | ---- |
| file     | path to the image file to load     | string | yes  |
| \_ref    | reference name of the loaded image | string | no   |

Example:

```js
{"image_load": {"file": "data.file", "_ref": "loaded_image"}}
```

- `image_resize`

| property | description                                   | values | eval |
| -------- | --------------------------------------------- | ------ | ---- |
| w        | width resize value                            | number | yes  |
| h        | height resize value                           | number | yes  |
| \_ref    | define the reference name of the target image | string | no   |

Example:

```js
{ "image_resize": { _ref: 'emblem_img', h: 30 } } // resize the height of emblem_img to 30
```

- `image_brightness`

| property | description                                   | values                | eval |
| -------- | --------------------------------------------- | --------------------- | ---- |
| value    | brightness value                              | -1 to 1 (float-point) | no   |
| \_ref    | define the reference name of the target image | string                | no   |

Example:

```js
{ "image_brightness": { _ref: 'emblem_img', value: 0.15 } } // increase the brightness of the image
```

- `image_contrast`

| property | description                                   | values                | eval |
| -------- | --------------------------------------------- | --------------------- | ---- |
| value    | contrast value                                | -1 to 1 (float-point) | no   |
| \_ref    | define the reference name of the target image | string                | no   |

Example:

```js
{ "image_contrast": { _ref: 'emblem_img', h: 0.15 } } // increase the image_contrast of the image
```

- `image_flip`

| property | description                                   | values  | eval |
| -------- | --------------------------------------------- | ------- | ---- |
| h        | flip the image horizontally                   | boolean | no   |
| v        | flip the image vertically                     | boolean | no   |
| \_ref    | define the reference name of the target image | string  | no   |

Example:

```js
{ "image_flip": { _ref: 'emblem_img', h: true } } // increase the image_contrast of the image
```

- `image_to_buffer`

Get buffer from image

| property     | description                                  | values           | eval |
| ------------ | -------------------------------------------- | ---------------- | ---- |
| format       | image format                                 | `"png"`, `"jpg"` | no   |
| \_ref_output | define the reference name of the composition | string           | no   |
| \_ref        | define the reference name of the base image  | string           | no   |

Example:

```js
{ image_to_buffer: { format: 'png', _ref_output: 'buffer', _ref: 'image_composition' } }
```

### Text

- `font_load`

Load a font file. It uses bitmap fonts.

Convert TTF to bitmap font:

- https://ttf2fnt.com/
- http://kvazars.com/littera/
- https://github.com/libgdx/libgdx/wiki/Hiero
- https://www.angelcode.com/products/bmfont/
- https://github.com/vladimirgamalyan/fontbm
- [use fontbm](./utils/fonts/README.md)

| property | description                                  | values | eval |
| -------- | -------------------------------------------- | ------ | ---- |
| file     | path to the image file to load               | string | yes  |
| \_ref    | define the reference name of the target font | string | no   |

Example:

```js
{"font_load": {file: 'path("../fonts/open-sans-32-brown/open-sans-32-black.fnt")',_ref: 'font'}}
```

- `text_write`

Load a font file. It uses bitmap fonts.

| property   | description                                         | values | eval |
| ---------- | --------------------------------------------------- | ------ | ---- |
| text       | text                                                | string | yes  |
| x          | horizontal position                                 | number | yes  |
| y          | vertical position                                   | number | yes  |
| xm         | maximum horizontal position                         | number | yes  |
| ym         | maximum vertical position                           | number | yes  |
| align_x    | horizontal align                                    | number | yes  |
| align_y    | vertical align                                      | number | yes  |
| \_ref      | define the reference name of the text               | string | no   |
| \_ref_font | define the reference name of the loaded font to use | string | no   |

> New lines can be added with the `\n` character. If you want to add an empty new line, use `\n \n`.

Example:

```js
{"text_write": {text: 'data.cost',_ref: 'text_cost',_ref_font: 'font',x: 'ctx.calcPos("cost_img", ctx._self, {cx: {}}).x',y: 'ctx.calcPos("cost_img", ctx._self, {cy: {}}).y'}}
```

### Move

- `move`

Move a pre-loaded image to another position.

| property | description                        | values | eval |
| -------- | ---------------------------------- | ------ | ---- |
| x        | horizontal position value          | number | yes  |
| y        | vertical position value            | number | yes  |
| \_ref    | reference name of the target image | string | no   |

Utils:

| method  | description                                                  |
| ------- | ------------------------------------------------------------ |
| calcPos | calculate the position taking into account another reference |

Example:

```js
{"move": {"x": 50, y: 100, "_ref": "loaded_image"}} // move to glboal position x=50, y=100
{"move": {"x": 'ctx.calcPos("ref_image", ctx._self, {cx: {}}).x', y: 'ctx.calcPos("ref_image", ctx._self, {cy: {}}).y', "_ref": "loaded_image"}} // center the loaded_image taking into account the ref_image
```

### Compose

The `compose` processor composes the final image.

| property      | description                                   | values   | eval |
| ------------- | --------------------------------------------- | -------- | ---- |
| \_ref_output  | define the reference name of the composition  | string   | no   |
| \_ref_base    | define the reference name of the base image   | string   | no   |
| \_ref_compose | define the reference names to add to the base | string[] | no   |

Example:

```js
{ compose: { _ref_base_: 'base', _ref_output: 'card', _ref_compose: ['image_1', 'text_1', 'image_2'] } }
```

### Export

The `export` processor exports the composition to an image file from a buffer.

| property  | description                                       | values           | eval |
| --------- | ------------------------------------------------- | ---------------- | ---- |
| format    | image format                                      | `"png"`, `"jpg"` | no   |
| file      | path to the output image file                     | string           | yes  |
| from_data | path to the output image file                     | `"binary"`       | no   |
| \_ref     | define the reference name to export to image file | string           | no   |

Example:

```js
{export: {format: 'png',_ref: 'card',file: 'path("../output/"+data.id+".png")',from_data: 'binary'}}
```

### Script

The `script` processor lets script and access to all methods and properties.

| property | description  | values           | eval |
| -------- | ------------ | ---------------- | ---- |
| script   | image format | `"png"`, `"jpg"` | no   |

Example:

```js
{
  sript: {
    script: 'console.log("Hello")';
  }
}
```

## Conditional processor

The `if` field of a processor can be used to define if this should run if this returns some truthy value.

Example:

```
{"<processor>": {"if": "data.attack > 0", <other_properties>} }
```

The `if` expression is evaluated, if returns a truthy value, then the processor will be run, else it is skipped.

## Global methods

| method | description        |
| ------ | ------------------ |
| path   | get path to a file |

Example:

```js
{"<processor>": {"file": 'path("custom_directory/file.png")'}}
```
