/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Resource, ShapeType, Fragment, Range, Color, Position } from "../domain/models.js";

export function ResourceDao()
{
    this._resourceRecords = require("../../data/mangaface/resources.json");

    this.getAsDomainModel = function () {
        var resList = [];

        this._resourceRecords.forEach(function (data) {
            var res = new Resource(data["id"], data["label"], data["cat_label"]);
            res.shapesRange = new Range(
                data["filename_range"]["min"],
                data["filename_range"]["max"]);
            res.shapeIconUrl = data["icon_url"];

            // Movability
            if (data.hasOwnProperty("movement_limit")) {
                res.movementLimit = new Range(
                    data["movement_limit"] * -1,
                    data["movement_limit"]);
            }

            // Colors
            if (data.hasOwnProperty("colors")) {
                data["colors"].forEach(function (color) {
                    res.colors.push( new Color(color["dir"], color["code"]) );
                });
            }

            // Fragments
            data["fragments"].forEach(function (fragment) {
                res.fragments.push(
                    new Fragment(
                        res,
                        new Position(
                            fragment["position"]["left"],
                            fragment["position"]["top"]),
                        fragment["color_group"],
                        fragment["priority"],
                        fragment["url"])
                );
            });
        
            resList.push( Object.freeze(res) );
        });

        return resList;
    };
}
