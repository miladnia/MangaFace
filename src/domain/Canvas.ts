import { LayerAsset } from './models.js';
import { TaskPool, CommandMapper } from './utils.js';
import type { Manifest, Script, Task } from './models';
import type { AssetObserver, ScriptObserver } from '../view/observers';

export default class Canvas {
    #taskPool = new TaskPool();
    #colorDependencyMapper = new CommandMapper();
    #assetObservers: AssetObserver[] = [];
    #scriptObserver: ScriptObserver[] = [];

    constructor(
        private manifest: Manifest,
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

        const command = this.manifest.commands[task.commandName];
        if (!command) {
            console.warn(`Invalid command '${task.commandName}' in task:`, task);
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

        for (const layer of command.subscribedLayers) {
            layerAssets.push(
                new LayerAsset(
                    layer,
                    task.itemIndex,
                    task.color,
                    layer.position,
                )
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
