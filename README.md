# Low-Level Academy

This repository hosts front-end code for [Low-Level Academy](https://lowlvl.org), an interactive systems programming course.

Related repositories:

- [WebAssembly modules](https://github.com/LowLevelAcademy/wasm-modules)
- [Backend code](https://github.com/LowLevelAcademy/server)

## Project structure

The project structure follows the Next.js conventions.

- `pages` - this directory contains all static pages.
- `public` - static content.
- `components` - all React components used in the lessons.
- `playground` - code that is based on the [Rust playground UI](https://github.com/integer32llc/rust-playground/tree/master/ui/frontend).

## Building the website

Before building the website, you might need to setup the environment variables.

Create a file named `.env.local` and add the following contents:

```
GITHUB_TOKEN=<your GitHub personal access token>
```

This token is required for accessing the GitHub GraphQL API. You can [create a new token](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token) in "Settings".

Run in the development mode:

```
npm run dev
```

Build for production:

```
npm run build
```

### Dependencies

This website depends on WebAssembly modules.

You can find them in the [wasm-modules](https://github.com/LowLevelAcademy/wasm-modules) repository, and you will need to build
the `virtualnet` module using the following command:

```
cargo build --release --target wasm32-unknown-unknown
```

Then, you will need to place the resulting `target/wasm32-unknown-unknown/release/virtualnet.wasm` file into the `public/` directory to make it work.

## Code style

We use the default [Prettier](https://prettier.io/) code format.

## License

Code in this repository is licensed under either of

- Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
- MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option.

The courses text is licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/).

You are free to:

- Share — copy and redistribute the material in any medium or format.
- Adapt — remix, transform, and build upon the material.

Under the following terms:

- Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

- NonCommercial — You may not use the material for commercial purposes.

- ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

- No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.
