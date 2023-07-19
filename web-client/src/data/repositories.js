/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

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
