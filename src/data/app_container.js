/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { NavigatorDao, CommandDao, LayerDao, ScriptDao } from "./dao.js";
import { NavigatorRepository, CommandRepository, LayerRepository, ScriptRepository } from "../domain/repositories.js";


export default class AppContainer {
    constructor(packName) {
        this.navigatorRepository = new NavigatorRepository(new NavigatorDao(packName));
        this.commandRepository = new CommandRepository(new CommandDao(packName));
        this.layerRepository = new LayerRepository(new LayerDao(packName));
        this.scriptRepository = new ScriptRepository(new ScriptDao(packName));
    }
}
