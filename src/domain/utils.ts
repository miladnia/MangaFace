export class TaskPool {
    #tasks = {};

    addTask(task) {
        this.#tasks[task.commandName] = task;
    }

    getLatestTaskOfCommand(commandName) {
        return this.#tasks[commandName] || null;
    }
}


export class CommandMapper {
    #mappings = new Map();

    mapCommand(primaryCommand, relatedCommand) {
        if (!this.#mappings.has(primaryCommand)) {
            this.#mappings.set(primaryCommand, new Set());
        }
        this.#mappings.get(primaryCommand).add(relatedCommand);
    }

    getMappedCommands(primaryCommand) {
        return Array.from(this.#mappings.get(primaryCommand) || []);
    }
}
