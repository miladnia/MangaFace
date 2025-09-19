<?php

/**
 * This file is part of MangaFace.
 *
 * (c) Milad Nia <milad@miladnia.ir>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MangaFace\FaceDesigner\Item\Wearable;

use MangaFace\FaceDesigner\AbstractItem;

abstract class AbstractWearable extends AbstractItem {

    /**
     * @var string
     */
    static protected $graphicsParentDir = "wearable";

    /**
     * @var string[]
     */
    static protected $colors = ["white", "black", "brown", "yellow", "blue", "violet", "red", "green"];

    /**
     * @var bool
     */
    static protected $optional =  true;

}