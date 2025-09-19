import { LayerAsset } from './models.js';
import { TaskPool, CommandMapper } from './utils.js';
import type { CommandRepository, LayerRepository } from './repositories.ts';
import type { Script, Task } from './models.ts';
import type { AssetObserver, ScriptObserver } from '../view/observers.ts';

export default class Canvas {
    #taskPool = new TaskPool();
    #colorDependencyMapper = new CommandMapper();
    #assetObservers: AssetObserver[] = [];
    #scriptObserver: ScriptObserver[] = [];

    constructor(
        private commandRepository: CommandRepository,
        private layerRepository: LayerRepository
    ) {
    }

    async runScript(script: Script) {
        script.tasks.forEach(async task => {
            await this.runTask(task);
            this.#notifyScriptObserver(task);
        });
    }

    async runTask(task: Task) {
        console.log("task", task);
        this.#taskPool.addTask(task);

        const command = await this.commandRepository.findByName(task.commandName);
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
            const layer = await this.layerRepository.findByName(layerName);
            if (!layer) {
                console.warn(`InvalidTask: layer '${layerName}' not found!`, task);
                return;
            }

            layerAssets.push(
                new LayerAsset({
                    layer: layer,
                    itemIndex: task.itemIndex,
                    color: task.color,
                    position: layer.position,
                })
            );  
        }

        this.#notifyAssetObservers(layerAssets);
    }

    registerAssetObserver(observer: AssetObserver) {
        this.#assetObservers.push(observer);
    }

    #notifyAssetObservers(layerAssets: LayerAsset[]) {
        this.#assetObservers.forEach(observer => {
            observer.update(layerAssets);
        });
    }

    registerScriptObserver(observer: ScriptObserver) {
        this.#scriptObserver.push(observer);
    }

    #notifyScriptObserver(task: Task) {
        this.#scriptObserver.forEach(observer => {
            observer.update(task);
        });
    }
}
