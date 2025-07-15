/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import AppContainer from "./src/data/app_container.js";
import ViewModel from "./src/ui/view_model.js";
import DesignerScreen from "./view.js";


class App {
    constructor() {
        const DEFAULT_PACK_LABEL = "manga_male_pack";
        this.container = new AppContainer(DEFAULT_PACK_LABEL);
    }

    run(containerElement) {
        const designerScreen = new DesignerScreen(
            new ViewModel(
                null,
                this.container.navigatorRepository,
                this.container.commandRepository,
                this.container.layerRepository,
            )
        );
        designerScreen.render().then((view) => {
            containerElement.appendChild(view.getElement());
        });
    };
}

window.onload = function () {
    (new App).run( document.getElementById("MF_APP_CONTAINER") );
};
