@lime.it/blip-core
=============
[![Version](https://img.shields.io/npm/v/@lime.it/blip-core.svg)](https://npmjs.org/package/@lime.it/blip-core)
[![CircleCI](https://circleci.com/gh/lime-it/blip-core/tree/master.svg?style=shield)](https://circleci.com/gh/lime-it/blip-core/tree/master)
[![Downloads/week](https://img.shields.io/npm/dw/@lime.it/blip-core.svg)](https://npmjs.org/package/@lime.it/blip-core)
[![License](https://img.shields.io/npm/l/@lime.it/blip-core.svg)](https://github.com/lime-it/blip-core/blob/master/package.json)

Core abstractions and fuctionalities of blip cli tool

The package contains basi utility classes and types used by the **blip** command and its plugins and extensions.
Every blip plugin (driver or template) must depend on it in order to be able to interact with a blip workspace.

## BlipConf

This class implements basi functions to check, read and store a *blip.yml* file and workspace.

## Docker

This class allows to perform managed docker commands invoking the *docker* cli tool.

## DockerMachine

This class allows to perform managed docker-machine commands invoking the *docker-machine* cli tool.

## Openssl

This class allows to create self signed certificate for TLS.

## EtcHosts

This class allows to manage a local machine *hosts* file.

