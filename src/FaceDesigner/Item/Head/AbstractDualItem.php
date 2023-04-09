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

abstract class AbstractDualItem extends AbstractHeadItem {

    const LEFT_ITEM_DIR = "left";
    const RIGHT_ITEM_DIR = "right";

    /**
     * @return string
     */
    static public function getDirectoryPattern() {
        $newPattern = is_subclass_of(static::class, LeftItemInterface::class) ?
            self::LEFT_ITEM_DIR : self::RIGHT_ITEM_DIR;
        return self::beforeDirectoryPlaceholder(self::PATH_PLACEHOLDER_COLOR, $newPattern);
    }

    /**
     * @return int
     */
    public function getPositionX() {
        $position = parent::getPositionX();
        if (is_subclass_of(static::class, RightItem::class)) {
            return $position - $this->standardWidthDiff();
        }

        return $position;
    }
}