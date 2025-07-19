/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import AppContainer from "./data/app_container.js";
import ViewModel from "./view/ViewModel.js";
import DesignerScreen from "./view/DesignerScreen.js";


export default class App {
    constructor() {
        const DEFAULT_PACK_NAME = "manga_male_pack";
        this.container = new AppContainer(DEFAULT_PACK_NAME);
    }

    run(containerElement) {
        const designerScreen = new DesignerScreen(
            new ViewModel(
                null,
                this.container.navigatorRepository,
                this.container.commandRepository,
                this.container.layerRepository,
                this.container.scriptRepository,
            )
        );
        designerScreen.render().then((view) => {
            const viewElement = view.getElement();
            containerElement.appendChild(viewElement);
        });
    };
}
