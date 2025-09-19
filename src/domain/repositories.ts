class Repository {
    constructor(dao) {
        this._dao = dao;
    }
    
    async findAll() {
        return await this._dao.getAsDomainModel();
    }
}


export class NavigatorRepository extends Repository {
    // ScreenSectionRepository
}


export class CommandRepository extends Repository {
    async findByName(name) {

        if (!name) {
            throw new Error("Illegal Argument Exception: 'name' should not be empty.");
        }

        const commands = await this._dao.getAsDomainModel();

        if (!commands[name]) {
            return null;
        }
        
        return commands[name];
    }
}


export class LayerRepository extends Repository {
    async findByName(name) {
        if (!name) {
            throw new Error("Illegal Argument Exception: 'name' should not be empty.");
        }

        const layers = await this._dao.getAsDomainModel();

        if (!layers[name]) {
            return null;
        }
        
        return layers[name];
    }
}


export class ScriptRepository extends Repository {
    async findByName(name) {
        if (!name) {
            throw new Error("Illegal Argument Exception: 'name' should not be empty.");
        }

        const scripts = await this._dao.getAsDomainModel();

        if (!scripts[name]) {
            return null;
        }
        
        return scripts[name];
    }
}


export class MetadataRepository extends Repository {
    async findByKey(key) {
        return null;
    }
}
