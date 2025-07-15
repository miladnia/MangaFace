/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { NavigatorMapper, CommandMapper, LayerMapper } from './mappers.js';


class Dao {
    constructor(packLabel) {
        this.packLabel = packLabel;
        this._manifest = null;
    }

    async fetchManifestCollection(collectionName) {
        if (!this._manifest) {
            const response = await fetch('/manifest.json');

            if (!response.ok) {
                throw new Error(`[HTTP] status: ${response.status}`);
            }
            
            this._manifest = await response.json();
            
            if (!this._manifest[this.packLabel] || !this._manifest[this.packLabel][collectionName]) {
                throw new Error(`Invalid manifest structure!`);
            }
        }

        return this._manifest[this.packLabel][collectionName];
    }
}


export class NavigatorDao extends Dao {
    async getAsDomainModel() {
        const navigatorRecords = await this.fetchManifestCollection('navigators');
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
        const commandRecords = await this.fetchManifestCollection('commands');
        const commands = {};

        commandRecords.forEach(record => {
            const command = CommandMapper.toDomain(record);
            commands[command.label] = command;
        });

        return commands;
    }
}


export class LayerDao extends Dao {
    async getAsDomainModel() {
        const layerRecords = await this.fetchManifestCollection('layers');
        const layers = {};

        layerRecords.forEach((record, priority) => {
            const layer = LayerMapper.toDomain(record, priority);
            layers[layer.label] = layer;
        });
        
        return layers;
    }
}
