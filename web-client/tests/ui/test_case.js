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

export function testTabCom ()
{
    var catTabs = (new TabCom).setListener({
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

export function testGrid ()
{
    var images = [
        ["emoji_1F454", 32],
        ["emoji_1F97E", 22],
        ["emoji_1F452", 8],
        ["emoji_1F45B", 2]
    ];

    var container = document.createElement("div");

    var grid = (new GridCom(8, 4)).setListener({
        onItemSelected: function (position, layer) {
            console.log("Item selected", position, layer);
        },
        onItemDeselected: function (position, layer) {
            console.log("Item deselected", position, layer);
        },
        onItemReselected: function (position, layer) {
            console.log("Item reselected", position, layer);
        }
    });

    images.forEach(function (img) {
        var svg = "data:image/svg+xml,"
            + encodeURIComponent(openmoji[img[0]]);
        var layer = grid.newLayer(img[0]);

        for (var i = 0; i < img[1]; i++)
            layer.addImageItem(svg);

        grid.addLayer(layer);

        // Buttons to navigate between pages
        var btn = document.createElement("button");
        btn.textContent = img[0];
        btn.addEventListener("click", function () {
            grid.switchToLayer(img[0]);
        });
        container.appendChild(btn);
    });

    container.appendChild( grid.render() );
    // Copyright text for openmoji
    var copyrightTextBox = document.createElement("p");
    copyrightTextBox.textContent = openmoji.license;
    container.appendChild(copyrightTextBox);

    return container;
}

export function testGridColors ()
{
    var colors = [
        ["#ff0000", 77],
        ["#00ff00", 52],
        ["#0000ff", 18],
        ["#000000", 2]
    ];

    var container = document.createElement("div");

    var grid = (new GridCom(15, 5)).setListener({
        onItemSelected: function (position, layer) {
            console.log("Item selected", position, layer);
        },
        onItemDeselected: function (position, layer) {
            console.log("Item deselected", position, layer);
        },
        onItemReselected: function (position, layer) {
            console.log("Item reselected", position, layer);
        }
    });

    colors.forEach(function (color) {
        var layer = grid.newLayer(color[0]);

        for (var i = 0; i < color[1]; i++)
            layer.addColorItem(color[0]);

        grid.addLayer(layer);

        // Buttons to navigate between pages
        var btn = document.createElement("button");
        btn.textContent = color[0];
        btn.addEventListener("click", function () {
            grid.switchToLayer(color[0]);
        });
        container.appendChild(btn);
    });

    container.appendChild( grid.render() );

    return container;
}
