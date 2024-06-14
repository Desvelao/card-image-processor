# Description

The goal of this repository is building card images using a process pipeline. Optionally, the generated card images can be exported to a PDF to be printed.

> But the image processor can be used to compose images using the process pipeline

## History

I wanted to build custom cards for have a reference of Dungeons and Dragons items. So, my first approach was to build them using an image editor.

My card design was:

- mark (different color depending on the rarity of the item)
- item image
- card name
- card type
- card description
- cost: icon image and text. optional.
- weight: icon image and text. optional.
- damage: icon image and text. optional.

While I was building the card design I had some ideas that I wanted to add to the final design or I wanted to change the text of some card so I had to redo the cards again. Soo, I concluded this approach did not scale.

Sooo... I decided to try to build programatically the card images. I was searching some existent tool but I did not find anything that covered my requirements, so I built this.

## Utilities

- Image builder: generate the card images from a defined pipeline of processors that composes the final card image.
- PDF builder: using the pre-generated image files, generates a PDF with the cards and copies you need to print.

# Getting started

> If you prefer to using Docker, read [here](#usage-with-docker).

## Install dependencies

- NodeJS: 12.22.0
- Yarn 1.19.0

```console
yarn
```

## Image builder

The composition of images is done though the `bin/image_builder.js` script and use a configuration file and a dataset.

### Configuration file

You can define the configuration file as a `.js` or `.json` file:

```js
module.exports = {
  build: {
    import: {
      file: 'cards.csv', // define the file that contains the data set of the cards in csv
      options: {
        // csv parser options
        delimiter: ';',
        columns: true,
      },
    },
    pipeline: {
      root: 'images', // define the root path to apply in the pipeline. Optional.
      processors: [], // see the image_builder processors
    },
  },
};
```

You can see the image processors [here](./src/image_builder/README.md)

### Dataset

Define a `.csv` file with the data properties that will be used in the pipeline to generate the images.

Note: Define an `id` column that is used with debugging purpose. This is not required but gives information when using the debug mode.

```csv
id;image;name;type;rarity;weight;cost;damage;description
dagger_common;dagger.png;Dagger;Weapon;common;1;2;1d4;20/60 range.
```

This example defines:

- `id`: identifier
- `name`: card name
- `type`: card type
- `rarity`: card rarity
- `weight`: weight
- `cost`: card cost
- `damage`: card damage
- `description`: description

These values are accesibles from the processor pipeline of image builder through the `ctx` (context) field.

You can customize the properties and adapt the processor pipeline to your use case.

### Generate the card images

- Script

```
node bin/image_builder.js -c <path/to/configuration-file>
```

- Binary

```
image-builder -c <path/to/configuration-file>
```

> `-c` flags accept globs.

If you have multiple sets of cards, you can define a directory structure such as:

```
cards
  sets
    set01
      images
        torch.png
      build.js
      cards.csv
    set02
      images
        dagger.png
      build.js
      cards.csv
```

and you can build all sets with a command as:

```console
node bin/image_builder.js -c "cards/sets/*/build.js"
```

> Note to include the quotes

## Export to PDF

If you want to print the cards, you can generate a PDF file with the cards you want.

### Configuration file

```js
module.exports = {
  print: {
    // define the properties to print
    page: {
      // define the page configuration
      size: 'A4', // page size
      margin: 24, // page margin size
      images_per_row: 3, // images per row
      images_per_column: 3, // immages per colum
      gutter_size: 1, // gutter size
    },
    file: 'output.pdf', // output file
    // define the content [path to image file, copies]
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
```

### Generate the PDF

- Script

```console
node bin/compose_pdf.js -c <path/to/configuration-file>
```

- Binary

```
image-builder-compose-pdf -c <path/to/configuration-file>
```

### Measure PDF

```
docker run -itd --rm --measure_pdf -v "path/to/pdf_file.pdf:/tmp/pdf.pdf" -u root <image-builder-container> bash -c 'apt update -y && apt install -y imagemagick && echo "$(units -t "$(identify -verbose /tmp/output.pdf | grep 'Print size' | sed -e 's/ Print size: //' -e 's/x[0-9.]\+//') inch" "mm") x $(units -t "$(identify -verbose /tmp/output.pdf | grep 'Print size' | sed -e 's/ Print size: //' -e 's/[0-9.]\+x//') inch" "mm") mm"
```

Size on inches:

> identify -verbose /tmp/output.pdf | grep 'Print size' | sed -e 's/ Print size: //' -e 's/x[0-9.]\+//'
> identify -verbose /tmp/output.pdf | grep 'Print size' | sed -e 's/ Print size: //' -e 's/[0-9.]\+x//'

Size on mm:

> units -t "$(identify -verbose /tmp/output.pdf | grep 'Print size' | sed -e 's/  Print size: //' -e 's/x[0-9.]\+//') inch" "mm"
> units -t "$(identify -verbose /tmp/output.pdf | grep 'Print size' | sed -e 's/ Print size: //' -e 's/[0-9.]\+x//') inch" "mm"

Composed size on mm:

> echo "$(units -t "$(identify -verbose /tmp/output.pdf | grep 'Print size' | sed -e 's/ Print size: //' -e 's/x[0-9.]\+//') inch" "mm") x $(units -t "$(identify -verbose /tmp/output.pdf | grep 'Print size' | sed -e 's/ Print size: //' -e 's/[0-9.]\+x//') inch" "mm") mm"

References:

- https://unix.stackexchange.com/questions/39464/how-to-query-pdf-page-size-from-the-command-line
- https://stackoverflow.com/questions/52998331/imagemagick-security-policy-pdf-blocking-conversion

# Usage with Docker

- Build card image sets using the default distribution of sets cards/sets/\*/build.js

```
docker run -itd --rm --name image-builder -v "$(pwd):/home/node/app" -w "/home/node/app" -u node node:12.22.0-stretch-slim bash -c "yarn && yarn build:sets"
```

- Build card image sets using a custom distribution of sets

```
docker run -itd --rm --name image-builder -v "$(pwd):/home/node/app" -w "/home/node/app" -u node node:12.22.0-stretch-slim bash -c "yarn && yarn build:sets -c '<path_to_image_builder_manifest>'"
```

> Note the work directory of the container is `/home/node/app` that is the root of this repository.

- Develop

Docker compose:

Up, install dependencies and enter to container:

```
docker-compose up -d && && docker-compose exec image-builder yarn && docker-compose exec image-builder bash
```

Down:

```
docker-compose down
```
