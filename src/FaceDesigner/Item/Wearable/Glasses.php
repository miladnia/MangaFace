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

class Glasses extends AbstractWearable {

    /**
     * @var string
     */
    static protected $graphicsDir = "glasses";

    /**
     * @var int
     */
    static protected $minId = self::ID_RST_ITEM;

    /**
     * @var int
     */
    static protected $maxId = self::ID_RST_ITEM;

    /**
     * @var array
     */
    static protected $colors = [];

    /**
     * @var int[] X,Y
     */
    static protected $position = [27, 57];

    /**
     * @var int[]
     */
    static protected $distancesRange = [2, 2];

    /**
     * @param int $id
     * @param int $distance
     */
    public function __construct($id, $distance) {
        parent::__construct($id, 0, $distance);
    }

    /**
     * @return string
     */
    static public function getDirectoryPattern() {
        return self::removeDirectoryPlaceholder(self::PATH_PLACEHOLDER_COLOR);
    }
}