/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { LayerAsset } from "./models.js";
import { TaskPool, CommandMapper } from "./utils.js";


export default class Canvas {
    #taskPool = new TaskPool();
    #colorDependencyMapper = new CommandMapper();
    #commandRepository = null;
    #layerRepository = null;
    #observers = [];

    constructor(commandRepository, layerRepository) {
        this.#commandRepository = commandRepository;
        this.#layerRepository = layerRepository;
    }

    async runScript(script) {        
        script.tasks.forEach(task => {
            this.runTask(task);
        });
    }

    async runTask(task) {
        console.log("task", task);
        this.#taskPool.addTask(task);

        const command = await this.#commandRepository.findByName(task.commandName);
        if (!command) {
            console.warn(`InvalidTask: command '${task.commandName}' not found!`);
            return;
        }

        // Handle color dependency
        if (command.hasColorDependency()) {
            const latestTaskOfDependencyCommand = this.#taskPool.getLatestTaskOfCommand(
                command.colorDependency);
            // Override the color if the command has a color dependency
            task.color = latestTaskOfDependencyCommand?.color || command.defaultColor;
            this.#colorDependencyMapper.mapCommand(command.colorDependency, command.name);
        }

        // Handle listeners of color dependency
        this.#colorDependencyMapper.getMappedCommands(command.name)
            .forEach(dependentCommandName => {
                const latestTaskOfDependentCommand = this.#taskPool.getLatestTaskOfCommand(dependentCommandName);
                if (latestTaskOfDependentCommand.color === task.color) {
                    return;
                }
                latestTaskOfDependentCommand.color = task.color;
                this.runTask(latestTaskOfDependentCommand);
        });

        if (!task.color && command.isColorRequired()) {
            console.warn('InvalidTask: color is required!', task);
            return;
        }

        const layerAssets = [];

        for (const layerName of command.subscribedLayers) {
            const layer = await this.#layerRepository.findByName(layerName);
            if (!layer) {
                console.warn(`InvalidTask: layer '${layerName}' not found!`, task);
                return;
            }

            const assetUrl = layer.getAssetUrl(task.itemIndex, task.color);
            layerAssets.push(
                new LayerAsset({
                    layerName: layer.name,
                    position: layer.position,
                    priority: layer.priority,
                    assetUrl: assetUrl,
                })
            );  
        }

        this.#notifyObservers(layerAssets, task);
    }

    registerObserver(observer) {
        this.#observers.push(observer);
    }

    #notifyObservers(layerAssets, task) {
        this.#observers.forEach(observer => {
            observer.update(layerAssets, task);
        });
    }
}
