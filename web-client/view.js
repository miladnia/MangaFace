/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DesignerScreenTemplate } from "./src/ui/templates.js";
import TabCom from "./src/ui/components/tab_com.js";
import GridCom from "./src/ui/components/grid_com.js";
import PinboardCom from "./src/ui/components/pinboard_com.js";

export default function DesignerScreen(viewModel)
{
    this._tpl = new DesignerScreenTemplate;
    this._model = viewModel;
}

DesignerScreen.prototype.render = function () {
    console.log("[RENDERING] DesignerScreen");
    var resList = this._model.resourceRepository.findAll();
    var selectedRes = null;
    var pinboard = this._buildPinboard();

    var shapesGrid = this._buildShapesGrid(resList, (function (shapeName) {
        this._pinResource(pinboard, selectedRes, shapeName);
    }).bind(this));

    var colorsGrid = this._buildColorsGrid(resList);

    this._buildResTabs(resList, function (res) {
        selectedRes = res;
        shapesGrid.switchToLayer(res.id);
        colorsGrid.switchToLayer(res.id);
    });

    return this._tpl.getView();
};

DesignerScreen.prototype._buildResTabs = function (resourceList, onResourceSelected) {
    var catMap = {}; // <catLabel, tabPosition>
    var catTabs = (new TabCom).setListener({
        onTabSelected: function (tab) {
            var resTabs = tab.getTag();
            resTabs.enable();
        },
        onTabDeselected: function (tab) {
            var resTabs = tab.getTag();
            resTabs.disable();
        }
    });

    resourceList.forEach((function (res) {
        var exTabPosition = catMap.hasOwnProperty(res.catLabel) ? catMap[res.catLabel] : -1;

        // A tab component was already created for
        // the resources with current cat label.
        if (exTabPosition >= 0) {
            var resTabs = catTabs.getTabAt(exTabPosition).getTag();
            resTabs.addTab( resTabs.newTab().setText(res.label).setTag(res) );
            return;
        }

        var resTabs = (new TabCom).setListener({
            onTabSelected: function (tab) {
                var res = tab.getTag();
                onResourceSelected(res);
            }
        }).disable();

        resTabs.addTab( resTabs.newTab().setText(res.label).setTag(res) );
        catMap[res.catLabel] = catTabs.addTab( catTabs.newTab().setTag(resTabs) );
        this._tpl.resSection.appendView( resTabs.getView() );
    }).bind(this));

    this._tpl.catSection.appendView( catTabs.getView() );
};

DesignerScreen.prototype._buildShapesGrid = function (resourceList, onShapeSelected) {
    var grid = (new GridCom(6, 6)).setListener({
        onItemSelected: function (position, layer) {
            console.log("Selected", position, layer);
            onShapeSelected(position + 1);
        },
        onItemDeselected: function (position, layer) {
            console.log("Deselected", position, layer);
        },
        onItemReselected: function (position, layer) {
            console.log("Reselected", position, layer);
        }
    });

    resourceList.forEach(function (res) {
        var layer = grid.newLayer(res.id);

        for (var name = res.shapesRange.min; name <= res.shapesRange.max; name++)
            layer.addImageItem( res.getShapeIconUrl(name) );

        grid.addLayer(layer);
    });

    this._tpl.shapesSection.getElement().appendChild( grid.render() );

    return grid;
};

DesignerScreen.prototype._buildColorsGrid = function (resourceList) {
    var grid = new GridCom(6, 2);

    grid.setListener({
        onItemSelected: function (position, layer) {
        },
        onItemDeselected: function (position, layer) {
        }
    });

    resourceList.forEach(function (res) {
        var layer = grid.newLayer(res.id);

        res.colors.forEach(function (color) {
            layer.addColorItem(color.code);
        });

        grid.addLayer(layer);
    });

    this._tpl.colorsSection.getElement().appendChild( grid.render() );

    return grid;
};

DesignerScreen.prototype._buildPinboard = function () {
    var pinboard = new PinboardCom;
    this._tpl.previewSection.appendView(pinboard.getView());
    return pinboard;
};

DesignerScreen.prototype._pinResource = function (pinboard, res, shapeName) {
    res.fragments.forEach(function (frag, fi) {
        console.log(frag.getUrl(shapeName));

        var itemKey = res.id + '_' + fi;
        var item = pinboard.getItem(itemKey);

        if (item) {
            item.setImageUrl(frag.getUrl(shapeName));
            return;
        }

        pinboard.pinItem(
            itemKey,
            pinboard.newItem()
                .setImageUrl(frag.getUrl(shapeName))
                .setPosition(frag.position.top + "px", frag.position.left + "px")
                .setPriority(frag.priority));
    });
};
