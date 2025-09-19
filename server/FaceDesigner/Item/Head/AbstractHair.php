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

abstract class AbstractHair extends AbstractHeadItem {

    /**
     * @var string[]
     */
    static protected $colors = ["black", "brown", "red", "blondd"];

    /**
     * @var string Color of All Hair Items. [COLOR SYNC]
     */
    static private $hairColor;

    /**
     * @param int $id
     * @param int $colorId
     * @param int $distance
     */
    public function __construct($id, $colorId, $distance=0) {
        parent::__construct($id, $colorId, $distance);
        // Is it accepted?
        if (strcmp($colorId, $this->colorId) === 0) {
            // We want to keep only color of
            // the last Hair Item that created.
            // It is required for color sync.
            self::$hairColor = $colorId;
        }
    }

    /**
     * @return resource
     */
    public function getImage() {
        if (self::$hairColor !== null) {
            // Sync Color.
            $this->setColor(self::$hairColor);
        }
        return parent::getImage();
    }
}