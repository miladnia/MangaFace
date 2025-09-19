import TabCom from '../../ui/components/tab_com.js';


export default class CommandNavigator {
    #tabs = new TabCom();
    #navigatorRepository = null;
    #handleCommandSelect = null;

    constructor(navigatorRepository) {
        this.#navigatorRepository = navigatorRepository;
    }

    async render(tabsViewContainer, innerTabsViewContainer) {
        const navigators = await this.#navigatorRepository.findAll();

        for (let i = 0; i < navigators.length; i++) {
            const navigator = navigators[i];

            // Create a new tab component for inner tabs.
            const innerTabs = (new TabCom).setListener({
                onTabSelected: tab => {
                    const commandName = tab.getTag();
                    this.#handleCommandSelect(commandName);
                }
            }).disable();

            // Create an inner tab for each option in the current page.
            for (let j = 0; j < navigator.options.length; j++) {
                const navigatorOption = navigator.options[j];
                const tab = innerTabs.newTab()
                    .setText(navigatorOption.title)
                    .setTag(navigatorOption.commandName);
                innerTabs.addTab(tab);
            }

            // Create a new tab for the current page and assign the created inner tabs to it.
            this.#tabs.addTab(
                this.#tabs.newTab().setImage(navigator.coverUrl).setInnerTabs(innerTabs)
            );

            innerTabsViewContainer.append(innerTabs.getElement());
        }

        tabsViewContainer.appendView(this);
    }

    onCommandSelect(handleCommandSelect) {
        this.#handleCommandSelect = handleCommandSelect;
    }

    getElement() {
        return this.#tabs.getView().getElement();
    }
}
