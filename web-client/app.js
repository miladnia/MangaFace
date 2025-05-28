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

function App()
{
    this.container = new AppContainer;

    this.run = function (containerElement) {
        console.log("App started");
        
        console.log("container", this.container);
        // console.log("ResourceRepository", this.container.resourceRepository);

        var viewModel = new ViewModel(null, this.container.screenSectionRepository);
        // var viewModel = new ViewModel(null, this.container.resourceRepository);
        var view = new DesignerScreen(viewModel);
        containerElement.appendChild( view.render().getElement() );
    };
}

window.onload = function () {
    (new App).run( document.getElementById("MF_APP_CONTAINER") );
};
