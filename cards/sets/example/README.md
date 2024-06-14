# Example

Directory structure:

- fonts: fonts on bitmap format
- frames: card frames
- images: card image
- props: card property images: cost, weight, damage
- build.js: configuration file that contains
  - build: processors pipeline to compose the image card using the cards.csv dataset
  - print: define the PDF pritable
- cards.csv: dataset of cards

# Build the card images

- From root of the repository:

```console
yarn build:images -c cards/sets/example/build.js
```

# Build the PDF printable from the card images

Ensure you created the cards images previously and define the images you want to print:

- From root of the repository:

```console
yarn build:pdf -c cards/sets/example/build.js
```
