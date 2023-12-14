# climate

This package has some bootstrapping for CLI tools.

Primarily these APIs are:

`configurate` - [code](https://github.com/brekk/monoculture/blob/main/packages/climate/src/builder.js#L24) -
 This takes:
 - `yargs-config` style configuration
 - A default configuration
 - A dictionary of help text
 - A raw argv array

And produces a configuration object wrapped in a Future (which includes help text and some automatic in-build guardrails)

`configFileWithCancel` - [code](https://github.com/brekk/monoculture/blob/main/packages/climate/src/builder.js#L68)
This is based on `cosmiconfig` but is designed to be less opinionated and more easily used in mixed ESM environments. It can walk upwards in a directory while searching for a specific or a generically named config file, and then optionally parse it with a custom parser. It is designed to work with JSON by default but see [climate-toml](https://github.com/brekk/monoculture/tree/main/packages/climate-toml) and [climate-yaml](https://github.com/brekk/monoculture/tree/main/packages/climate-yaml) packages for [examples of usage](https://github.com/brekk/monoculture/blob/main/packages/climate-toml/src/index.spec.js) with `transformer`. 

