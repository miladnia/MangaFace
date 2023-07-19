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

    /**
     * @return int
     */
    public function getPositionX() {
        $position = parent::getPositionX();
        if (is_subclass_of(static::class, RightItemInterface::class)) {
            return $position - $this->standardWidthDiff();
        }

        return $position;
    }
}