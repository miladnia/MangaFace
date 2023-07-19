/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ResourceDao } from "./dao.js";
import { ResourceRepository } from "./repositories.js";

export default function AppContainer() {
    this.resourceRepository = new ResourceRepository(new ResourceDao());
}
