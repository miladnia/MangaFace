/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { NavigatorDao, CommandDao, LayerDao, ScriptDao } from "./dao.js";
import { NavigatorRepository, CommandRepository, LayerRepository, ScriptRepository } from "./repositories.js";


export default class AppContainer {
    constructor(packLabel) {
        this.navigatorRepository = new NavigatorRepository(new NavigatorDao(packLabel));
        this.commandRepository = new CommandRepository(new CommandDao(packLabel));
        this.layerRepository = new LayerRepository(new LayerDao(packLabel));
        this.scriptRepository = new ScriptRepository(new ScriptDao(packLabel));
    }
}
