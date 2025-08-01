/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Navigator, NavigatorOption, Command, Layer, Position, Color, Script, Task } from '../domain/models.js';


export class NavigatorMapper {
    static toDomain(record) {
        return new Navigator({
            coverUrl: record['cover_url'] || '',
            options: (record['options'] || []).map(
                r => new NavigatorOption({
                    title: r['title'] || '',
                    commandName: r['command_name'] || '',
                })
            ),
        });
    }
}


export class CommandMapper {
    static toDomain(record) {
        return new Command({
            name: record['name'] || '',
            itemCount: record['item_count'] || 0,
            itemPreviewUrl: record['item_preview_url'] || '',
            subscribedLayers: record['subscribed_layers'] || [],
            colorDependency: record['color_dependency'] || '',
            defaultColor: record['default_color'] || '',
            colors: (record['colors'] || []).map(
                r => new Color({
                    color: r['color'],
                    previewColorCode: r['preview_color_code']
                })
            ),
        });
    }
}


export class LayerMapper {
    static toDomain(record, priority) {
        return new Layer({
            name: record['name'] || '',
            priority: priority || 0,
            assetUrl: record['asset_url'] || '',
            position: new Position({
                top: record['position']['top'] || 0,
                left: record['position']['left'] || 0,
            }),
        });
    }
}


export class ScriptMapper {
    static toDomain(record) {
        return new Script({
            name: record['name'] || '',
            description: record['description'] || '',
            tasks: (record['tasks'] || []).map(
                job => new Task({
                    commandName: job['command_name'],
                    itemIndex: job['item_index'],
                    color: job['color'] || '',
                })
            ),
        });
    }
}
