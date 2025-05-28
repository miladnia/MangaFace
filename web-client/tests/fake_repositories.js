/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import resources from "./fixtures/resources.js";

export function FakeResourceRepository() {
    this.findAll = function () {
        return resources;
    };
}
