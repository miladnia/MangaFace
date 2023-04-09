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

class HairBack extends AbstractHair {

    /**
     * @var string
     */
    static protected $graphicsDir = "hair_back";

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
    static protected $position = [0, 23];

    /**
     * @var bool
     */
    static protected $optional =  true;

    /**
     * @param int $id
     * @param int $colorId
     */
    public function __construct($id, $colorId) {
        parent::__construct($id, $colorId);
    }

    /**
     * @param int $maxId Maximum Id
     * @param int $x Position X
     * @param int $y Position Y
     * @param int $minId Minimum Id
     */
    static public function config($maxId, $x=0, $y=0, $minId=0) {
        parent::config($maxId, $x, $y);
        self::$minId = $minId;
    }
}