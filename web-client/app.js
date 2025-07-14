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
        this.container = new AppContainer();
    }

    run(containerElement) {
        const designerScreen = new DesignerScreen(
            new ViewModel(
                null,
                this.container.screenSectionRepository,
                this.container.commandRepository,
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
