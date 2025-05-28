# MangaFace
Create your own custom avatar with **MangaFace**. This project is inspired by [FaceYourManga](https://www.faceyourmanga.com/).

![MangaFace](docs/preview.jpg "Demo Preview")

## Getting Started

### Requirements

- PHP >= 8.1
- Node.js >= 6.11.5
- [Composer](https://getcomposer.org/download/)

### Installation

First, please go to project root directory and run the installer:

```shell
composer run installer
```

*By running the installer all of the required packages for PHP and Node.js will be installed and build processes will be done.*

Now run a http server and enter the URL `127.0.0.1:8000` in your web browser to use the app:

```shell
composer run server
```

## Commands

Command | Description
------- | -----------
`composer run installer` | Install packages and build.
`composer run server` | Run a http server.
`composer run build` | Generate configs for client.
`npm run build` | Bundle scripts using [webpack](https://webpack.js.org/).

## License
The MangaFace is open-source project licensed under the [MIT license](https://opensource.org/licenses/MIT). For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
