# [Mirror Mirror](https://mirrormirror.florianporada.com/)

![Build](https://github.com/florianporada/mirrormirror/workflows/Build%20And%20Deploy/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A VR experience to get more in touch with your digital avatar.

## Development

### Installation

Install the dependencies

```sh
yarn install
```

### Serve

To serve in the browser - Runs webpack-dev-server

```sh
yarn start
```

### Build

Compile and build

```sh
yarn run build
```

## Deployment

The standard behavior of the action is to create a docker image and push it to the docker registry.

- GitHub Actions Environment Secrets

  ```txt
  DOCKER_USERNAME
  DOCKER_PASSWORD
  ```

- Skip CI:

  If the commit message contains `skip ci` the GitHub Action will not be triggered.

## Authors

Laurin Stecher
[]

Florian Porada
[Web](http://florianporada.com)

### License

This project is licensed under the MIT License
