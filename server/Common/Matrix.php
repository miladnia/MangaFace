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

class Matrix {

    /**
     * @var int Width
     */
    private $width = 0;

    /**
     * @var int Height
     */
    private $height = 0;

    /**
     * @var int Coordinate Ratio X
     */
    private $x = 0;

    /**
     * @var int Coordinate Ratio Y
     */
    private $y = 0;

    /**
     * @var float
     */
    private $scale = 1.0;

    /**
     * @var float Rotate angle (Degree).
     */
    private $angle = 0.0;

    /**
     * @var bool Coordinate Must be Center.
     */
    private $centerCoordinate = false;

    /**
     * @param int $width
     * @param int $height
     */
    public function __construct($width, $height=0) {
        $this->width = (int) $width;
        $this->height = (int) $height;
    }

    /**
     * Set Coordinate Ratio.
     * @param float $x
     * @param float $y
     * @return Matrix
     */
    public function setCoordinate($x, $y) {
        if (($x >= 0) && ($x <= 1)) {
            $this->x = (float)$x;
        }
        if (($y >= 0) && ($y <= 1)) {
            $this->y = (float)$y;
        }
        return $this;
    }

    /**
     * Set as Center Coordinate.
     * @return $this
     */
    public function setCenterCoordinate() {
        $this->centerCoordinate = true;
        return $this;
    }

    /**
     * @param float $angle
     * @return $this
     */
    public function setRotate($angle) {
        if (($angle >= 0) && ($angle <= 360)) {
            $this->angle = (float) $angle;
        }
        return $this;
    }

    /**
     * @param float $scale
     * @return Matrix
     */
    public function setZoom($scale) {
        if ($scale > 1) {
            $this->scale = (float) $scale;
        }
        return $this;
    }

    /**
     * @return int
     */
    public function getWidth() {
        return $this->width;
    }

    /**
     * @return int
     */
    public function getHeight() {
        return $this->height;
    }

    /**
     * @return float
     */
    public function getX() {
        return $this->x;
    }

    /**
     * @return float
     */
    public function getY() {
        return $this->y;
    }

    /**
     * @return float
     */
    public function getAngle() {
        return $this->angle;
    }

    /**
     * @return bool
     */
    public function isHeightAuto() {
        return $this->height == 0;
    }

    /**
     * @return float|int
     */
    public function getRatio() {
        return $this->width / $this->height;
    }

    /**
     * @return float
     */
    public function getScale() {
        return $this->scale;
    }

    /**
     * @return bool
     */
    public function isCenterCoordinate() {
        return $this->centerCoordinate;
    }
}
