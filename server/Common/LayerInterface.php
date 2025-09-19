<?php

/**
 * This file is part of MangaFace.
 *
 * (c) Milad Nia <milad@miladnia.ir>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MangaFace\Common;

interface LayerInterface {
    
    /**
     * @return resource
     */
    public function getImage();

    /**
     * @return int
     */
    public function getImageWidth();

    /**
     * @return int
     */
    public function getImageHeight();

    /**
     * @return int
     */
    public function getPositionX();

    /**
     * @return int
     */
    public function getPositionY();

    /**
     * @return bool
     */
    public function destroyImage();
}
