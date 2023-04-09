<?php

/**
 * This file is part of MangaFace.
 *
 * (c) Milad Nia <milad@miladnia.ir>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MangaFace\Util;

use MangaFace\Common\AbstractDesigner;
use MangaFace\Common\File;
use MangaFace\Common\Matrix;

class PhotoCrop extends AbstractDesigner {

    /**
     * @var File Source Image File.
     */
    private $sourceFile;

    /**
     * @var resource Source Image.
     */
    private $source;

    /**
     * @var Matrix
     */
    private $matrix;

    /**
     */
    private function __construct(FIle $source, Matrix $matrix) {
        $this->sourceFile = $source;
        $this->source = imagecreatefromjpeg(
            $this->sourceFile->getPath());
        $this->matrix = $matrix;
    }

    /**
     * @return $this
     */
    public static function cropImage(File $source, Matrix $matrix) {
        return (new self($source, $matrix))->rotate()->scale();
    }

    /**
     * @return $this
     */
    private function scale() {
        // calculating width and height of source image
        $source_width = imagesx($this->source);
        $source_height = imagesy($this->source);
        $x = 0;
        $y = 0;

        if ($this->matrix->isHeightAuto()) {
            // just width of image is important
            $newWidth = $this->matrix->getWidth();
            // calculating height of new image
            $newHeight = $newWidth * ($source_height / $source_width);
            // creating a new image
            $this->image = imagecreatetruecolor($this->matrix->getWidth(), $newHeight);
        } else {
            // creating a new image
            $this->image = imagecreatetruecolor($this->matrix->getWidth(), $this->matrix->getHeight());
            // Set width and height of photo.
            if (($source_width / $source_height) > $this->matrix->getRatio()) {
                $newHeight = $this->matrix->getHeight();
                // calculating width of new image
                $newWidth = $newHeight * ($source_width / $source_height);
            } else {
                // set width and height of new image
                $newWidth = $this->matrix->getWidth();
                // calculating height of new image
                $newHeight = $newWidth * ($source_height / $source_width);
            }

            // Scale width and height.
            $newWidth = round($newWidth * $this->matrix->getScale());
            $newHeight = round($newHeight * $this->matrix->getScale());

            // If Coordinate Must be Center.
            if ($this->matrix->isCenterCoordinate()) {
                // Move Coordinate to Center.
                $x = ($newWidth - $this->matrix->getWidth()) / 2;
                $y = ($newHeight - $this->matrix->getHeight()) / 2;
            } else {
                $x = round($this->matrix->getX() * $newWidth);
                $y = round($this->matrix->getY() * $newHeight);
            }
        }

        // Resize and Cut The Image.
        imagecopyresampled($this->image, $this->source,
            $x * -1, $y * -1, 0, 0,
            $newWidth, $newHeight, $source_width, $source_height);

        return $this;
    }

    /**
     * @return $this
     */
    private function rotate() {
        if ($this->matrix->getAngle() > 0) {
            $this->source = imagerotate($this->source,
                $this->matrix->getAngle() * -1, 0);
        }
        return $this;
    }

    /**
     * @return string
     */
    public function preview($format, $size) {
        // TODO: Implement preview() method.
        return "NONE";
    }

    /**
     * @param string $directory
     * @return File|null
     */
    public function saveAs($directory, $name, $quality) {
        $path = $directory . $name . ".jpg";
        $result = imagejpeg($this->image, $path, $quality);
        return $result ? File::fromPath($path) : null;
    }

    /**
     * Destructor.
     */
    public function __destruct() {
        parent::__destruct();
        if ($this->source) {
            imagedestroy($this->source);
        }
    }
}
