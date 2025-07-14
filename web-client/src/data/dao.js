/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ScreenSection, Designer, Command, Resource, ShapeType, Fragment, Range, Color, Position } from "./models.js";

let _resources = null;

async function fetchResources(pack) {
    if (!_resources) {
        const response = await fetch('/manifest.json');

        if (!response.ok) {
            throw new Error(`[HTTP] status: ${response.status}`);
        }
        
        _resources = await response.json();
        
        if (!_resources[pack]) {
            throw new Error(`Invalid resource structure.`);
        }
    }

    return _resources[pack];
}

export class ScreenSectionDao {
    async getAsDomainModel(pack) {
        const resources = await fetchResources(pack);
        const sectionsData = resources["interface"]["sections"];
        const sections = [];

        sectionsData.forEach((sectionData) => {
            const screenSection = new ScreenSection({
                label: sectionData["label"],
                coverUrl: sectionData["cover_url"],
            });

            const designersData = sectionData["designers"];
            designersData.forEach((designerData) => {
                screenSection.designers.push(
                    new Designer({
                        label: designerData["label"],
                        commandName: designerData["command_name"],
                        previewUrl: designerData["preview_url"],
                    })
                )
            });
            
            sections.push(screenSection);
        });

        return sections;
    }
}

export class CommandDao {
    async getAsDomainModel(pack) {
        const resources = await fetchResources(pack);
        const commandsData = resources["commands"];
        const commands = {};

        for (let command_name in commandsData) {
             const command = new Command({
                name: command_name,
                items: commandsData[command_name]["items"],
            });

            const colorPaletteData = commandsData[command_name]["color_palette"];
            if ("undefined" !== typeof colorPaletteData) {
                colorPaletteData.forEach((paletteData) => {
                    command.colorPalette.push(
                        new Color({
                            colorCode: paletteData["code"],
                        })
                    );
                });
            }

            commands[command_name] = command;
        }

        return commands;
    }
}
