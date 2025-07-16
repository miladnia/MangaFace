/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Navigator, NavigatorOption, Command, Layer, Position, Color, Script, Job } from './models.js';


export class NavigatorMapper {
    static toDomain(record) {
        return new Navigator({
            coverUrl: record['cover_url'],
            options: record['options'].map(
                r => new NavigatorOption({
                    title: r['title'],
                    commandLabel: r['command']
                })
            ),
        });
    }
}


export class CommandMapper {
    static toDomain(record) {
        return new Command({
            label: record['label'],
            itemsCount: record['items_count'],
            itemPreviewUrl: record['item_preview_url'],
            subscribedLayers: record['subscribed_layers'],
            colors: (record['colors'] || []).map(
                r => new Color({
                    value: r['value'],
                    colorCode: r['preview_color_code']
                })
            ),
        });
    }
}


export class LayerMapper {
    static toDomain(record, priority) {
        return new Layer({
            label: record['label'],
            priority: priority,
            assetUrl: record['asset_url'],
            position: new Position({
                top: record['position']['top'],
                left: record['position']['left'],
            }),
        });
    }
}


export class ScriptMapper {
    static toDomain(record) {
        return new Script({
            label: record['label'],
            description: record['description'],
            jobs: (record['jobs'] || []).map(
                job => new Job({
                    commandLabel: job['command'],
                    itemNumber: job['item'],
                    colorValue: job['color'] || null,
                })
            ),
        });
    }
}
