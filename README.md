## Pyodide Console: run your scientific codes

Desktop app for Serverless Python Environment for scientific computing with WebAssembly

Pyodide-based stand-alone console.

[Pyodide](https://github.com/iodide-project/pyodide) console to run Python scientific stack with WASM technology.

For more information, refer these materials:

 * [Slides for PyCon KR 2020](https://speakerdeck.com/inureyes/creating-a-serverless-python-environment-for-scientific-computing-with-webassembly-for-data-scientists-and-python-lovers)
 * PyCon KR 2020 Talk (Youtube) - Will add after conference talk

## Changelog

View [changelog](https://github.com/inureyes/pyodide-console/blob/main/CHANGELOG.md)

## Development Guide

Pyodide console is built with
 * `lit-element` as webcomponent framework
 * `npm` as package manager
 * `rollup` as bundler
 * `electron` as app shell

### Initializing

```
$ npm i
```

If this is not your first-time compilation, please clean the temporary directories with this command:

```
$ make clean
```

You must perform first-time compilation for testing, including downloading Pyodide release binary from the repository Some additional mandatory packages should be copied to proper location.

```
$ npm run init
```

Some necessary libraries will be copied to `src/lib`. Now you are ready to test.

### Developing / testing without bundling

```
$ npm run server:d # To run dev. web server
$ npm run build:d # To watch source changes and TypeScript autocompilation
```

### Electron (app mode) development / testing

```
$ make test_electron
```

## App Building Guide
### Building Electron App

Electron building is automated using `Makefile`.

```
$ make clean  # clean prebuilt codes
$ make mac # build macOS app
$ make win # build win64 app
$ make linux # build linux app
```

## Credits

 * [Iodide: Seamless scientific computing with web technologies](https://github.com/iodide-project)
 * [Pyodide: The Python scientific stack, compiled to WebAssembly](https://github.com/iodide-project/pyodide)
 * [Backend.AI Console](https://github.com/lablup/backend.ai-console)