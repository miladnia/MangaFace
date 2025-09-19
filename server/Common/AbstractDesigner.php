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

abstract class AbstractDesigner {

    const FORMAT_GIF = 101;

    /**
     * @var resource
     */
    protected $image;

    /**
     * @param LayerInterface[] ...$layers
     */
    protected function dropLayer(LayerInterface ...$layers) {
        foreach ($layers as $l) {
            if ($l === null) {
                continue;
            }
            imagecopy($this->image, $l->getImage(),
                $l->getPositionX(), $l->getPositionY(), 0, 0,
                $l->getImageWidth(), $l->getImageHeight());
            $l->destroyImage();
        }
    }

    /**
     * @param int $format
     * @param int $size
     * @return string
     */
    abstract public function preview($format, $size);

    /**
     * @param string $directory
     * @param string $name
     * @param int $quality
     * @return File|null
     */
    abstract public function saveAs($directory, $name, $quality);

    /**
     * Destroy the image.
     */
    public function erase() {
        if (is_resource($this->image)) {
            imagedestroy($this->image);
        }
    }

    /**
     * Destructor.
     */
    public function __destruct() {
        $this->erase();
    }
}
