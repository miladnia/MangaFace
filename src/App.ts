import AppContainer from "./data/AppContainer.ts";
import ViewModel from "./view/ViewModel.ts";
import DesignerScreen from "./view/DesignerScreen.ts";

export default class App {
    container: AppContainer;

    constructor() {
        const DEFAULT_PACK_NAME = "manga_male_pack";
        this.container = new AppContainer(DEFAULT_PACK_NAME);
    }

    run(containerElement: HTMLElement) {
        const designerScreen = new DesignerScreen(
            new ViewModel(
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
