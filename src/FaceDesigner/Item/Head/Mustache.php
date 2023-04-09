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

class Mustache extends AbstractHair {

    /**
     * @var string
     */
    static protected $graphicsDir = "mustache";

    /**
     * @var int
     */
    static protected $minId = self::ID_RST_ITEM;

    /**
     * @var int
     */
    static protected $maxId = self::ID_RST_ITEM;

    /**
     * @var int[] X,Y
     */
    static protected $position = [49, 104];

    /**
     * @var int[]
     */
    static protected $distancesRange = [2, 2];

    /**
     * @var bool
     */
    static protected $optional =  true;

    /**
     * @param int $id
     * @param int $colorId
     * @param int $distance
     */
    public function __construct($id, $colorId, $distance) {
        parent::__construct($id, $colorId, $distance);
    }
}