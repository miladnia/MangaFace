/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

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
    async findByLabel(label) {
        if (!label) {
            throw new Error("Illegal Argument Exception: 'label' should not be empty.");
        }

        const commands = await this._dao.getAsDomainModel();

        if (!commands[label]) {
            return null;
        }
        
        return commands[label];
    }
}


export class LayerRepository extends Repository {    
    async findByLabel(label) {
        if (!label) {
            throw new Error("Illegal Argument Exception: 'label' should not be empty.");
        }

        const layers = await this._dao.getAsDomainModel();

        if (!layers[label]) {
            return null;
        }
        
        return layers[label];
    }
}
