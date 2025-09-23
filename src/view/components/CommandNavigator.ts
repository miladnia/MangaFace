// @ts-nocheck

import type { Manifest } from "../../domain/models.js";
import TabCom from "../../ui/components/tab_com.js";

export default class CommandNavigator {
  #tabs = new TabCom();
  #navigatorRepository = null;
  #handleCommandSelect = null;
  #manifest: Manifest;

  constructor(manifest: Manifest) {
    this.#manifest = manifest;
  }

  async render(tabsViewContainer, innerTabsViewContainer) {
    for (const navigator of this.#manifest.navigators) {
      // Create a new tab component for inner tabs.
      const innerTabs = new TabCom()
        .setListener({
          onTabSelected: (tab) => {
            const commandName = tab.getTag();
            this.#handleCommandSelect(commandName);
          },
        })
        .disable();

      // Create an inner tab for each option in the current page.
      for (const navOption of navigator.options) {
        const tab = innerTabs
          .newTab()
          .setText(navOption.title)
          .setTag(navOption.command.name);
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

  onCommandSelect(handleCommandSelect: (commandName: string) => void) {
    this.#handleCommandSelect = handleCommandSelect;
  }

  getElement() {
    return this.#tabs.getView().getElement();
  }
}
