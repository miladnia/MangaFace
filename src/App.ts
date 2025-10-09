import AppContainer from "@data/AppContainer";
import DesignerScreen from "@view/DesignerScreen";

const App = {
  render: async (containerElement: HTMLElement) => {
    const defaultPackName = "manga_male_pack";
    const designerScreen = new DesignerScreen({
      manifest: await AppContainer.manifestRepository.getByPackName(defaultPackName),
    });
    designerScreen.render().then((view) => {
      const viewElement = view.getElement();
      containerElement.appendChild(viewElement);
    });
  },
};

export default App;
