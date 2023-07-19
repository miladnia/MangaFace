/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { UIComponent, View } from "../ui.js";

export default function TabCom () {
    this._view = new View("ul", "tab-layout");
    this._tabs = [];
    this._selectedTab = null;
    this._enabled = true;
    this._listener = {
        // Called when a tab enters the selected state.
        onTabSelected: function (tab) {},
        // Called when a tab exits the selected state.
        onTabDeselected: function (tab) {}
    };
}

TabCom.prototype.newTab = function () {
    return new Tab(this);
};

TabCom.prototype.addTab = function (tab) {
    var len = this._tabs.push(tab);
    tab._position = len - 1;
    this._view.appendView( tab.getView() );

    if (0 === tab._position) {
        this._selectTab(tab);
    }

    return tab._position;
};

TabCom.prototype.getTabAt = function (index) {
    return (index < 0 || index >= this._tabs.length) ? null : this._tabs[index];
};

TabCom.prototype.getSelectedTabPosition = function () {
    return null !== this._selectedTab ?
        this._selectedTab.getPosition() : -1;
};

TabCom.prototype.setListener = function (listener) {
    if (listener.hasOwnProperty("onTabSelected"))
        this._listener.onTabSelected = listener.onTabSelected;

    if (listener.hasOwnProperty("onTabDeselected"))
        this._listener.onTabDeselected = listener.onTabDeselected;
    
    return this;
};

TabCom.prototype.disable = function () {
    if (this._enabled) {
        this._enabled = false;
        this._view.hide();
    }
    
    return this;
};

TabCom.prototype.enable = function () {
    if (! this._enabled ) {
        this._enabled = true;
        this._view.show();
        this._refresh() || this._init();
    }

    return this;
};

TabCom.prototype._refresh = function () {
    if (this._enabled && null !== this._selectedTab) {
        this._listener.onTabSelected(this._selectedTab);
        return true;
    }

    return false;
};

TabCom.prototype._init = function () {
    return this._selectTab( this.getTabAt(0) );
};

TabCom.prototype._selectTab = function (tab) {
    if (! this._enabled )
        return false;
    
    if (null === tab || tab.isSelected() )
        return false;

    if (null !== this._selectedTab) {
        this._selectedTab.getView().setSelected(false);
        this._listener.onTabDeselected(this._selectedTab);
    }

    this._selectedTab = tab;
    tab.getView().setSelected(true);
    this._listener.onTabSelected(tab);

    return true;
};

function Tab (parent) {
    this._view = new View("li", "tab");
    this._parent = parent;
    this._text = null;
    this._INVALID_POSITION = -1;
    this._position = this._INVALID_POSITION;
    this._tag = null;

    this._view.getElement().addEventListener(
        "click",
        (function () { this.select(); }).bind(this)
    );
}

Tab.prototype.setText = function (text) {
    this._text = text;
    this._view.setText(text);
    return this;
};

Tab.prototype.setTag = function (tag) {
    this._tag = tag;
    return this;
};

Tab.prototype.getTag = function () {
    return this._tag;
};

Tab.prototype.getPosition = function () {
    return this._position;
};

Tab.prototype.isSelected = function () {
    return this._INVALID_POSITION !== this._position &&
        this._parent.getSelectedTabPosition() === this._position;
};

Tab.prototype.select = function () {
    this._parent._selectTab(this);
};

Tab.prototype.getView = function () {
    return this._view;
};

// TabCom extends UIComponent
Object.setPrototypeOf(TabCom.prototype, UIComponent.prototype);
