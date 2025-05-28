/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ScreenSection, Designer, Command, Resource, ShapeType, Fragment, Range, Color, Position } from "../domain/models.js";

export class ScreenSectionDao {
    getAsDomainModel() {
        this.resources = require("../../data/mangaface/manifest.json");
        let sectionsData = this.resources["interface"]["sections"];
        let sections = [];

        for (var i = 0; i < sectionsData.length; i++) {
            let s = new ScreenSection;
            s.label = sectionsData[i]["label"];
            s.cover_url = sectionsData[i]["cover_url"];

            let designersData = sectionsData[i]["designers"];

            for (let j = 0; j < designersData.length; j++) {
                let d = new Designer;
                d.label = designersData[j]["label"];
                d.command_name = designersData[j]["command_name"];
                d.preview_url = designersData[j]["preview_url"];
                s.designers.push(d);
            }
            
            sections.push(s);
        }

        return sections;
    }
}

export class CommandDao {
    getAsDomainModel() {
        this.resources = require("../../data/mangaface/manifest.json");
        let commandsData = this.resources["commands"];
        let commands = [];

        for (let cmdName in commandsData) {
            let cmd = new Command;
            cmd.name = cmdName;
            cmd.limit = commandsData[cmdName]["limit"];

            let colorPaletteData = commandsData[cmdName]["color_palette"];

            if ("undefined" !== typeof colorPaletteData) {
                for (let i = 0; i < colorPaletteData.length; i++) {
                    let color = new Color;
                    color.colorCode = colorPaletteData[i];
                    cmd.colorPalette.push(color);
                }
            }

            commands[cmdName] = cmd;
        }

        return commands;
    }
}

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
                    res.colors.push(
                        new Color(color["dir"], color["dir"], color["code"])
                    );
                });
            }

            // Fragments
            data["fragments"].forEach(function (fragment) {
                res.fragments.push(
                    new Fragment(
                        res,
                        new Position(
                            fragment["position"]["top"],
                            fragment["position"]["left"]),
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
