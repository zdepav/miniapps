# 2d3's Mini-apps

A collection of small in-browser games and applications, all distributable as a single JavaScript
file (and for some of them a directory with assets) with no external dependencies (other than a
reasonably modern web browser).

## Apps

- **ANSI escape code cheatsheet** (`ansi`)
  - Interactive guide to ANSI escape codes for unix-style terminals

- **ASCII Table** (`ascii`)
  - Just an easily embeddable ASCII table

- **Bézier curve visualizer** (`bezier`)
  - Visualizer for how Bézier curves are constructed

- **Chart plotter** (`chart-plot`)
  - Tool that plots mathematical formulas

- **Color picker** (`color-picker`)
  - Color picker app with a color wheel, RGB, HSL, HSV and CMYK sliders and 8-color memory

- **Date and time formatting reference** (`datetime`)
  - Interactive date and time formatting string reference for multiple languages

- **Palette editor** (`theme-edit`)
  - Extremely primitive dark color palette editor

- **Random JSON generator** (`json-gen`)
  - Tool that generates random (nonsensical but valid) JSON data

- **Rolling circles** (`gears`)
  - [Hypotrochoid](https://en.wikipedia.org/wiki/Hypotrochoid) generator

- **Variant sudoku utilities** (`sudoku`)
  - Digits by sum calculator for killer, sandwich and x-sums sudoku variants

## Games

- **Gameee** (`gameee`)
  - JS port of side-scrolling game where everything is drawn using horizontal and vertical lines.
  - Original C# version from 2020 can be found on [GitHub](https://github.com/zdepav/gameee)

- **Hungry Snail** (`snail`)
  - A small game I made in high school, now (about 12 years later) rewritten into TypeScript
  - You play as a snail and eat mushrooms and flowers (and eventually trees) to grow as large as
      possible (note: there is currently no win condition)

- **Smoker** (`smoker`)
  - A slightly updated version of my 2021 entry for [lame jam](https://itch.io/jam/lame-jam)
  - A primitive bullet-hell-style game where you avoid smoke from a cigarette
  - Original (game jam) version can be found on [itch.io](https://itch.io/jam/lame-jam/rate/965142)

- **Tile Connect** (`connect`)
  - Rotate tiles to connect all of them
  - All visuals are done with CSS

## Development and usage

In a terminal with bash (other shells are not supported) use `. api.sh` to install dependencies and
make the `ma` command (which is used to manage and build miniapps) available in your terminal.
Usage information can be printed by running `ma --help`.

Each miniapp has a directory under `apps/` containing `app.json` with information about it (see
`app.schema.json` for format) and subdirectory with source code. Assets (images, audio, ...) are
all stored in `assets/` and may be shared between miniapps.

Built miniapps are stored in `dist/` as `{id}.min.js` (optionally accompanied by a directory with
assets named by the same id) and can be embedded in a web page using a single `<script>` tag - the
initialized app/game will be placed in the same location as the script tag. Some miniapps can also
be configured using `data-*` attributes on the script tag.

Apps are designed for dark theme by default, but most can be switched to light theme by adding
`data-theme="light"` to the script tag (note: apps watch for changes to the `data-theme` attribute
and will automatically switch to the new theme).

## Licensing

- [LICENSE.md](LICENSE.md) contains license for the source code
- [assets/LICENSE.md](assets/LICENSE.md) contains licenses for all assets
- [assets/ATTRIBUTIONS.md](assets/ATTRIBUTIONS.md) contains attributions for non-original assets

