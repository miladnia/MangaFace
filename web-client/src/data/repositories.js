/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class ScreenSectionRepository {
    constructor(screenSectionDao) {
        
    }

    // this._records = screenSectionDao.getAsDomainModel();
    
    findAll() {
        return this._records;
    }
}

export class CommandRepository {
    constructor(commandDao) {
        
    }

    // this._records = commandDao.getAsDomainModel();
    
    findAll() {
        return this._records;
    }
    
    findByName(commandName) {
        if (!this._records.hasProperty(commandName))
            return null;
        
        return this._records[commandName];
    }
}

export function ResourceRepository(resourceDao)
{
    this._resList = resourceDao.getAsDomainModel();
    
    this.findAll = function () {
        return this._resList;
    };
    
    this.findById = function (id) {
        // TODO optimize
        for (var i = 0; i < this._resList.length; i++) {
            if (id === this._resList[i].id) {
                return this._resList[i];
            }
        }

        return null;
    };
}
