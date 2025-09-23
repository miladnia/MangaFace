import type { Task } from "./models";

export class TaskPool {
    #tasks: Record<string, Task> = {};

    addTask(task: Task) {
        this.#tasks[task.commandName] = task;
    }

    getLatestTaskOfCommand(commandName: string) {
        return this.#tasks[commandName] || null;
    }
}


export class CommandMapper {
    #mappings: Map<string, Set<string>> = new Map();

    mapCommand(primaryCommand: string, relatedCommand: string) {
        if (! this.#mappings.has(primaryCommand)) {
            this.#mappings.set(primaryCommand, new Set());
        }
        this.#mappings.get(primaryCommand)?.add(relatedCommand);
    }

    getMappedCommands(primaryCommand: string) {
        return Array.from(this.#mappings.get(primaryCommand) || []);
    }
}
