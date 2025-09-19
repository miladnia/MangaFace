<?php

/**
 * This file is part of MangaFace.
 *
 * (c) Milad Nia <milad@miladnia.ir>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MangaFace\FaceDesigner\Item\Background;

use MangaFace\FaceDesigner\AbstractItem;

abstract class AbstractBackground extends AbstractItem {

    /**
     * @var string
     */
    static protected $graphicsParentDir = "backgrounds";

    /**
     * @var int[] [X,Y]
     */
    static protected $position = [0, 0];

    /**
     * @var bool
     */
    static protected $optional = true;
}