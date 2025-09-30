// @ts-nocheck

import { UIComponent, View } from "../ui";


export default class Tabs extends UIComponent {
    _tabs = [];
    _selectedTab = null;
    _enabled = true;
    _listener = {
        // Called when a tab enters the selected state.
        onTabSelected: (tab) => {},
        // Called when a tab exits the selected state.
        onTabDeselected: (tab) => {},
    };

    constructor() {
        super("ul", "tab-layout");
    }

    newTab() {
        return new Tab(this);
    }

    addTab(tab) {
        var len = this._tabs.push(tab);
        tab._position = len - 1;
        this._view.appendView( tab.getView() );

        if (0 === tab._position) {
            this._selectTab(tab);
        }

        return this;
    }

    getTabAt(index) {
        return (index < 0 || index >= this._tabs.length) ? null : this._tabs[index];
    }

    getSelectedTabPosition() {
        return null !== this._selectedTab ?
            this._selectedTab.getPosition() : -1;
    }

    setListener(listener) {
        if (listener.hasOwnProperty("onTabSelected"))
            this._listener.onTabSelected = listener.onTabSelected;

        if (listener.hasOwnProperty("onTabDeselected"))
            this._listener.onTabDeselected = listener.onTabDeselected;
        
        return this;
    }

    disable() {
        if (this._enabled) {
            this._enabled = false;
            this._view.hide();
        }
        
        return this;
    }

    enable() {
        if (! this._enabled ) {
            this._enabled = true;
            this._view.show();
            this._refresh() || this._init();
        }

        return this;
    }

    _refresh() {
        if (this._enabled && null !== this._selectedTab) {
            this._listener.onTabSelected(this._selectedTab);
            return true;
        }

        return false;
    }

    _init() {
        return this._selectTab( this.getTabAt(0) );
    }

    _selectTab(tab) {
        if (! this._enabled )
            return false;
        
        if (null === tab || tab.isSelected() )
            return false;

        if (null !== this._selectedTab) {
            this._selectedTab.getView().setSelected(false);
            this._listener.onTabDeselected(this._selectedTab);

            if (null !== this._selectedTab._innerTabs)
                this._selectedTab._innerTabs.disable();
        }

        this._selectedTab = tab;
        tab.getView().setSelected(true);
        this._listener.onTabSelected(tab);

        if (null !== tab._innerTabs)
            tab._innerTabs.enable();

        return true;
    }
}


class Tab {
    constructor(parent) {
        this._view = new View("li", "tab");
        this._parent = parent;
        this._text = null;
        this._INVALID_POSITION = -1;
        this._position = this._INVALID_POSITION;
        this._innerTabs = null;
        this._tag = null;

        this._view.getElement().addEventListener(
            "click", () => this.select()
        );
    }

    setText(text) {
        this._text = text;
        this._view.setText(text);
        return this;
    }

    setImage(imageUrl) {
        this._view.getElement().style.setProperty('background-image', 'url("' + imageUrl + '")');
        this._view.getElement().style.setProperty('background-size', '50%');
        return this;
    }

    setInnerTabs(innerTabs) {
        this._innerTabs = innerTabs;
        return this;
    }

    setTag(tag) {
        this._tag = tag;
        return this;
    }

    getTag() {
        return this._tag;
    }

    getPosition() {
        return this._position;
    }

    isSelected() {
        return this._INVALID_POSITION !== this._position &&
            this._parent.getSelectedTabPosition() === this._position;
    }

    select() {
        this._parent._selectTab(this);
    }

    getView() {
        return this._view;
    }
}
