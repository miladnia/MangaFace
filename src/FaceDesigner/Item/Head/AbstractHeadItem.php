<?php

/**
 * This file is part of MangaFace.
 *
 * (c) Milad Nia <milad@miladnia.ir>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MangaFace\FaceDesigner\Item\Head;

use MangaFace\FaceDesigner\AbstractItem;

abstract class AbstractHeadItem extends AbstractItem {

    /**
     * @var string
     */
    static protected $graphicsParentDir = "head";

    /**
     * @var string[]
     */
    static protected $colors = ["plain", "dark", "light"];

}