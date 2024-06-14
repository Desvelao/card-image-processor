# Description

Convert TTF fonts to BMFont using the [fontbm](https://github.com/vladimirgamalyan/fontbm).

Files:

- `fontbm`: binary to convert TTF font to bmfont
- `Dockerfile`: Docker image definition file
- `chars.file`: file with characters in UTF-8 to extract from the TTF font

# Build Docker image

```console
docker build -f Dockerfile -t ttf2bmfont:0.6.1 .
```

The included `fontbm` binary is [v0.6.1](https://github.com/vladimirgamalyan/fontbm/releases/tag/v0.6.1).

# Usage

See the help:

```console
docker run --rm ttf2bmfont:0.6.1 --help
```

- Convert the font:

```console
docker run --rm -v '/path/to/font/:/tmp/font' ttf2bmfont:0.6.1 --font-file /tmp/font/font.ttf --font-size 32 --color 30,24,15 --chars-file /tmp/font/chars --output /tmp/font/noto_sans_semi_32
```

See options on https://github.com/vladimirgamalyan/fontbm

- Generate different font sizes:

```console
fontbm --font-file /tmp/font/font.ttf --font-size 16 --color 30,24,15 --chars-file /tmp/font/chars --output /tmp/font/noto_sans_semi_16
fontbm --font-file /tmp/font/font.ttf --font-size 32 --color 30,24,15 --chars-file /tmp/font/chars --output /tmp/font/noto_sans_semi_32
fontbm --font-file /tmp/font/font.ttf --font-size 64 --color 30,24,15 --chars-file /tmp/font/chars --output /tmp/font/noto_sans_semi_64
fontbm --font-file /tmp/font/font.ttf --font-size 128 --color 30,24,15 --chars-file /tmp/font/chars --output /tmp/font/noto_sans_semi_128
```

# Fix the .fnt dile

Fix the `size` property that sets a negative value instead of a positive.

Example:

A font size of 32 has `size=-32` that should be replaced to `size=32`, else, it could cause the text is rendered in an unexpected position.

From:

```
info face="Noto Sans" size=-32 bold=0 italic=0 charset="" unicode=1 stretchH=100 smooth=0 aa=1 padding=0,0,0,0 spacing=0,0 outline=0
```

To:

```
info face="Noto Sans" size=32 bold=0 italic=0 charset="" unicode=1 stretchH=100 smooth=0 aa=1 padding=0,0,0,0 spacing=0,0 outline=0
```
