import type { Container } from '@ui/ui';
import { Tabs, Tab } from '@ui/components';
import type { Manifest } from '@domain/models';

export default class CommandNavigator {
  #tabs = new Tabs();
  #handleCommandSelect: ((commandName: string) => void) | null = null;
  #manifest: Manifest;

  constructor(manifest: Manifest) {
    this.#manifest = manifest;
  }

  async render(tabsContainer: Container, innerTabsContainer: Container) {
    for (const navigator of this.#manifest.navigators) {
      // Create a new 'Tabs' component for 'inner tabs'.
      const innerTabs = new Tabs()
        .setListener({
          onTabSelected: (tab: Tab) => {
            if (!this.#handleCommandSelect) {
              return;
            }
            const commandName = tab.getTag() as string;
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

      innerTabsContainer.append(innerTabs.getElement());
    }

    tabsContainer.append(this.getElement());
  }

  onCommandSelect(handleCommandSelect: (commandName: string) => void) {
    this.#handleCommandSelect = handleCommandSelect;
  }

  getElement() {
    return this.#tabs.getView().getElement();
  }
}
