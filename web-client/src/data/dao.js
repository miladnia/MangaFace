/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { NavigatorMapper, CommandMapper, LayerMapper, ScriptMapper } from './mappers.js';


class Manifest {
    static #manifestData = null;

    static async getData() {
        if (!this.#manifestData) {
            const response = await fetch('/data/mangaface/manifest.json?v=' + Date.now());

            if (!response.ok) {
                throw new Error(`[manifest] HTTP status: ${response.status}`);
            }

            this.#manifestData = await response.json();
        }

        return this.#manifestData;
    }

    static async getCollection(packName, collectionName) {
        const manifestData = await this.getData();

        if (!manifestData[packName]) {
            throw new Error(`[manifest] Invalid manifest structure: The pack "${packName}" does not exist.`);
        }

        if (!manifestData[packName][collectionName]) {
            throw new Error(`[manifest] Invalid manifest structure: The collection "${collectionName}" does not exist in the pack label "${this.packLabel}".`);
        }

        return manifestData[packName][collectionName];
    }
}


class Dao {
    constructor(packName) {
        this.packName = packName;
    }

    async getCollection(collectionName) {
        return await Manifest.getCollection(this.packName, collectionName);
    }
}


export class NavigatorDao extends Dao {
    async getAsDomainModel() {
        const navigatorRecords = await this.getCollection('navigators');
        const navigators = [];

        navigatorRecords.forEach((record) => {
            const navigator = NavigatorMapper.toDomain(record);    
            navigators.push(navigator);
        });

        return navigators;
    }
}


export class CommandDao extends Dao {
    async getAsDomainModel() {
        const commandRecords = await this.getCollection('commands');
        const commands = {};

        commandRecords.forEach(record => {
            const command = CommandMapper.toDomain(record);
            commands[command.name] = command;
        });

        return commands;
    }
}


export class LayerDao extends Dao {
    async getAsDomainModel() {
        const layerRecords = await this.getCollection('layers');
        const layers = {};

        layerRecords.forEach((record, priority) => {
            const layer = LayerMapper.toDomain(record, priority);
            layers[layer.name] = layer;
        });
        
        return layers;
    }
}


export class ScriptDao extends Dao {
    async getAsDomainModel() {
        const scriptRecords = await this.getCollection('scripts');
        const scripts = {};

        scriptRecords.forEach(record => {
            const script = ScriptMapper.toDomain(record);
            scripts[script.name] = script;
        });

        return scripts;
    }
}
