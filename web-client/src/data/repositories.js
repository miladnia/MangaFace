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
    
    async findAll(pack) {
        return await this._dao.getAsDomainModel(pack);
    }
}

export class ScreenSectionRepository extends Repository {
    // ScreenSectionRepository
}

export class CommandRepository extends Repository {    
    async findByName(pack, name) {
        if (!name) {
            throw new Error("Illegal Argument Exception: 'name' should not be empty.");
        }

        const commands = await this._dao.getAsDomainModel(pack);

        if (!commands[name]) {
            return null;
        }
        
        return commands[name];
    }
}
