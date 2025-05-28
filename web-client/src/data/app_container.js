/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ScreenSectionDao, CommandDao } from "./dao.js";
import { ScreenSectionRepository, CommandRepository } from "./repositories.js";

export default class AppContainer {
    constructor() {
        this.screenSectionRepository = new ScreenSectionRepository(new ScreenSectionDao());
        this.commandRepository = new CommandRepository(new CommandDao());
    }
}
