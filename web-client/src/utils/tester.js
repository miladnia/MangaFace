/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export default function Tester () {}

Tester.prototype._TAG = "Tester";
Tester.prototype._testCases = {};

export function UITester () {
    this._TAG = "UITester";
    this._tpl = new UITesterTemplate();

    this.runUITests = function () {
        this._tpl.draw(this._TAG, this.getTestKeys());
        
        window.onhashchange = (function () {
            var testKey = location.hash.slice(1);
            this._reset();
            this._tpl.testPlayground.appendChild(
                this.runTest(testKey)
            );
        }).bind(this);

        if (window.location.hash) {
            window.onhashchange();
        }
    };
    
    this._reset = function () {
        this._tpl.testPlayground.textContent = "";
        console.clear();
    };
}

function UITesterTemplate () {
    this.testPlayground = _createPlayground();
    this.testNav = _createNav();

    this.draw = function (title, testKeys) {
        this.testNav.appendChild( _createTitleBar(title) );
        this.testNav.appendChild( _createHashLink(testKeys) );
        document.body.appendChild(this.testNav);
        document.body.appendChild(this.testPlayground);
    };
    
    function _createPlayground() {
        var playground = document.createElement("main");
        playground.style.float = "left";
        playground.style.width = "70%";
        playground.style.paddingTop = "1%";
        return playground;
    };
    
    function _createNav() {
        var nav = document.createElement("nav");
        nav.style.float = "left";
        nav.style.minHeight = "400px";
        nav.style.width = "25%";
        nav.style.minWidth = "160px";
        nav.style.boxSizing = "border-box";
        nav.style.background = "#ebebeb";
        nav.style.borderColor = "gray";
        nav.style.borderRightStyle = "solid";
        nav.style.borderRightWidth = "3px";
        nav.style.marginRight = "1%";
        nav.style.marginBottom = "1%";
        nav.style.color = "gray";
        nav.style.fontWeight = "bold";
        return nav;
    };
    
    function _createHashLink(hashList) {
        var list = document.createElement("ul");
        hashList.forEach(function (hash) {
            var link = document.createElement("a");
            link.setAttribute("href", "#" + hash);
            link.textContent = hash;
            link.style.color = "inherit";
            var item = document.createElement("li");
            list.appendChild(item)
                .appendChild(link);
        });
    
        return list;
    };

    function _createTitleBar(title) {
        var bar = document.createElement("h1");
        bar.textContent = title;
        bar.style.textAlign = "center";
        return bar;
    };
}
    
Tester.prototype.addTestCase = function (testCase) {
    for (var testKey in testCase) {
        this._testCases[testKey] = testCase[testKey];
    }

    return this;
};

Tester.prototype.runTest = function (testKey) {
    if (! this._testCases.hasOwnProperty(testKey) ) {
        console.warn(this._TAG, "SOMETHING WENT WRONG: There isn't any test case with <" + testKey + "> test key.");
        return;
    }

    console.log(this._TAG, "[RUNNING TEST] <" + testKey + ">...");
    return this._testCases[testKey]();
};

Tester.prototype.runAll = function () {
    for (var testKey in this._testCases) {
        this.runTest(testKey);
    }
};

Tester.prototype.getTestKeys = function () {
    return Object.keys(this._testCases);
};

// UITester extends Tester
Object.setPrototypeOf(UITester.prototype, Tester.prototype);
