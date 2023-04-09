<?php

/**
 * This file is part of MangaFace.
 *
 * (c) Milad Nia <milad@miladnia.ir>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MangaFace\FaceDesigner\Item\Effect;

use MangaFace\FaceDesigner\AbstractItem;

abstract class AbstractEffect extends AbstractItem {

    /**
     * @var string
     */
    static protected $graphicsParentDir = "effects";

    /**
     * @var int[] X,Y
     */
    static protected $position = [0, 0];

    /**
     * @var bool
     */
    static protected $optional = true;
}