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

class Scarf extends AbstractWearable {

    /**
     * @var string
     */
    static protected $graphicsDir = "scarf";

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
    static protected $position = [30, 126];

    /**
     * @param int $id
     * @param int $colorId
     */
    public function __construct($id, $colorId) {
        parent::__construct($id, $colorId);
    }
}