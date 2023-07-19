/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import TabCom from "../../src/ui/components/tab_com.js";
import GridCom from "../../src/ui/components/grid_com.js";
import * as openmoji from "../fixtures/sample_images/openmoji.js"; 

export function testTabCom () {
    var catTabs = new TabCom();
    catTabs.setListener({
        onTabSelected: function (tab) {
            console.log("Tab selected", tab);
            tab.getTag().enable();
        },
        onTabDeselected: function (tab) {
            console.log("Tab deselected", tab);
            tab.getTag().disable();
        }
    });

    var container = document.createElement("div");
    var line = document.createElement("hr");
    container.appendChild(
        catTabs.getView().getElement()
    );
    container.appendChild(line);

    for (var i = 1; i <= 3; i++) {
        var resTabs = (new TabCom).setListener({
            onTabSelected: function (tab) {
                console.log("Tab selected", tab);
            },
            onTabDeselected: function (tab) {
                console.log("Tab deselected", tab);
            }
        }).disable();

        catTabs.addTab(
            catTabs.newTab().setText("cat " + i).setTag(resTabs)
        );

        for (var j = 1; j <= 5; j++) {
            resTabs.addTab(resTabs.newTab().setText("[cat " + i + "] res " + j));
        }

        container.appendChild( resTabs.getView().getElement() );
    }

    return container;
}

export function testGridCom () {
    var grid = new GridCom(8, 4);
    grid.setListener({
        onCellSelected: function (cell) {
            console.log("Cell selected", cell);
        },
        onCellDeselected: function (cell) {
            console.log("Cell deselected", cell);
        }
    });
    
    var container = document.createElement("div");
    container.appendChild( grid.getView().getElement() );

    [
        ["emoji_1F454", 32],
        ["emoji_1F97E", 22],
        ["emoji_1F452", 8],
        ["emoji_1F45B", 2]
    ]
    .forEach(function (img) {
        var imageUrlList = [];
        var svg = "data:image/svg+xml," + encodeURIComponent(openmoji[img[0]]);

        for (var i = 1; i <= img[1]; i++) {
            imageUrlList.push(svg);
        }

        grid.createPage(img[0], imageUrlList);

        var btn = document.createElement("button");
        btn.textContent = img[0];
        btn.addEventListener("click", function () {
            grid.gotoPage(img[0]);
        });
        container.appendChild(btn);
    });

    var copyrightTextBox = document.createElement("p");
    copyrightTextBox.textContent = openmoji.license;
    container.appendChild(copyrightTextBox);

    var grid2 = new GridCom(25, 5);
    container.appendChild( grid2.getView().getElement() );

    return container;
}
