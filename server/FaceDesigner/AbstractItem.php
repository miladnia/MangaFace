<?php

/**
 * This file is part of MangaFace.
 *
 * (c) Milad Nia <milad@miladnia.ir>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MangaFace\FaceDesigner;

use MangaFace\Common\LayerInterface;

abstract class AbstractItem implements LayerInterface {

    const GRAPHICS_FILE_EXTENSION = "png";
    const GRAPHICS_DEFAULT_IMAGE_NAME = "blank";

    const PATH_PLACEHOLDER_COLOR = "[color]";
    const PATH_PLACEHOLDER_FILE_NAME = "[item]";

    const ID_RST_ITEM = 0;
    const ID_MIN_ITEM = 1;
    const ID_RST_COLOR = 0;
    const ID_MIN_COLOR = 1;
    const DIST_MIN = 0;

    /**
     * @var string
     */
    static private $graphicsRootDir = "";

    /**
     * @var string
     */
    static protected $graphicsParentDir = "";

    /**
     * @var string
     */
    static protected $graphicsDir = "";

    /**
     * @var int
     */
    static protected $minId = self::ID_RST_ITEM;

    /**
     * @var int
     */
    static protected $maxId = self::ID_RST_ITEM;

    /**
     * @var string[]
     */
    static protected $colors = [];

    /**
     * @var int[] X,Y
     */
    static protected $position = [0, 0];

    /**
     * @var int[] Top,Bottom
     */
    static protected $distancesRange = [0, 0];

    /**
     * @var int Standard Width, In PX
     */
    static protected $standardWidth = 0;

    /**
     * @var int Standard Height, In PX
     */
    static protected $standardHeight = 0;

    /**
     * @var bool Is Optional?
     */
    static protected $optional = false;

    /**
     * @var string[] Breakpoints!
     */
    static protected $slices = [];

    /**
     * @var int
     */
    protected $id;

    /**
     * @var string
     */
    private $colorName;

    /**
     * @var int In PX
     */
    private $distance = 0;

    /**
     * @var resource
     */
    private $image;

    /**
     * @var int
     */
    private $imageWidth = 0;

    /**
     * @var int
     */
    private $imageHeight = 0;

    /**
     * @var int
     */
    protected $colorId = 0;

    /**
     * @var bool Is Hidden?
     */
    private $hidden = false;

    /**
     * @param int $id
     * @param int $colorId
     * @param int $distance In PX
     */
    public function __construct($id=1, $colorId=0, $distance=0) {
        $this->id = $this->validateId($id);
        $this->distance = $this->validateDistance($distance);
        $this->setColor($colorId);
    }

    /**
     * @param int $maxId Maximum Id
     * @param int $x Position X
     * @param int $y Position Y
     */
    static public function config($maxId, $x=0, $y=0) {
        static::$maxId = intval($maxId);
        if (static::$maxId > self::ID_RST_ITEM)
            static::$minId = self::ID_MIN_ITEM;
        static::$position = [
            0 => intval($x),
            1 => intval($y)
        ];
    }

    /**
     * @param $id
     * @return int
     */
    private function validateId($id) {
        $id = abs(intval($id));
        if ($id < static::$minId || $id > static::$maxId) {
            return self::getDefaultId();
        }

        return $id;
    }

    /**
     * @return bool
     */
    public function isVisible() {
        return ($this->id > self::ID_RST_ITEM) && !$this->hidden;
    }

    /**
     * @param $colorId
     * @return int
     */
    private function validateColorId($colorId) {
        if (empty(static::$colors)) {
            return self::ID_RST_COLOR;
        }
        $colorId = abs(intval($colorId));
        $lastColorId = count(static::$colors);
        if ($colorId < self::ID_MIN_COLOR || $colorId > $lastColorId) {
            return self::ID_MIN_COLOR;
        }

        return $colorId;
    }

    /**
     * @param $colorId
     * @return string
     */
    private function convertColorId($colorId) {
        return ($colorId > 0) ? static::$colors[$colorId - 1] : '';
    }

    /**
     * @param $colorId
     */
    protected function setColor($colorId) {
        $this->colorId = $this->validateColorId($colorId);
        $this->colorName = $this->convertColorId($this->colorId);
    }

    /**
     * @param $distance
     * @return float|int
     */
    private function validateDistance($distance) {
        $distance = intval($distance);
        if (($distance < 0)
            && (abs($distance) > static::$distancesRange[0])) {
            return 0;
        }
        if (($distance > 0)
            && (abs($distance) > static::$distancesRange[1])) {
            return 0;
        }

        return $distance;
    }

    /**
     * @return string[]
     */
    static public function getSlices() {
        return static::$slices;
    }

    /**
     * Make the item hidden.
     */
    public function hide() {
        $this->hidden = true;
    }

    /**
     * Make the item visible.
     */
    public function show() {
        $this->hidden = false;
    }

    /**
     * @return string
     */
    protected function getFilePath() {
        $path = self::$graphicsRootDir;
        $pattern = static::getDirectoryPattern();
        // If item has color option.
        $colorDir = ($this->colorId > 0) ? $this->colorName : '';
        $path .= str_replace(self::PATH_PLACEHOLDER_COLOR . '/',
            $colorDir . '/', $pattern);
        // Add name of the file and file extension.
        $path .= str_replace(self::PATH_PLACEHOLDER_FILE_NAME,
            $this->getFileName(), self::getFileNamePattern());

        return $path;
    }

    /**
     * @return string
     */
    private function getFileName() {
        return (string) $this->id;
    }

    /**
     * @return string
     */
    protected function getDefaultImagePath() {
        return self::$graphicsRootDir
            . self::GRAPHICS_DEFAULT_IMAGE_NAME . '.'
            . self::GRAPHICS_FILE_EXTENSION;
    }

    /**
     * Open and Cache The Image.
     */
    private function openImage() {
        if (!empty($this->image)) {
            return;
        }
        // Item is visible and file exists in the storage.
        $path = $this->isVisible() && file_exists($path = $this->getFilePath()) ?
            $path : self::getDefaultImagePath();
        // Convert file to image resource.
        $this->image = imagecreatefrompng($path);
        // If there is an error.
        if ($this->image === false) {
            $this->image = null;
            return;
        }
        $this->imageWidth = imagesx($this->image);
        $this->imageHeight = imagesy($this->image);
    }

    /**
     * @return resource
     */
    public function getImage() {
        $this->openImage();
        return $this->image;
    }

    /**
     * @return int
     */
    public function getImageWidth() {
        $this->openImage();
        return $this->imageWidth;
    }

    /**
     * @return int
     */
    public function getImageHeight() {
        $this->openImage();
        return $this->imageHeight;
    }

    /**
     * @return bool
     */
    public function destroyImage() {
        if (empty($this->image)) {
            return false;
        }
        return imagedestroy($this->image);
    }

    /**
     * @return int
     */
    protected function standardWidthDiff() {
        if (static::$standardWidth == 0) {
            return 0;
        }

        return $this->getImageWidth() - static::$standardWidth;
    }

    /**
     * @return int
     */
    protected function standardHeightDiff() {
        if (static::$standardHeight == 0) {
            return 0;
        }

        return $this->getImageHeight() - static::$standardHeight;
    }

    /**
     * @return int
     */
    public function getPositionX() {
        return static::$position[0];
    }

    /**
     * @return int
     */
    public function getPositionY() {
        return static::$position[1]
            - $this->standardHeightDiff()
            + $this->distance;
    }

    /**
     * @return int[] Keys: x,y
     */
    static public function getPosition() {
        return [
            "x" => static::$position[0],
            "y" => static::$position[1]
        ];
    }

    /**
     * @return int[] Keys: top,bottom
     */
    static public function getDistancesRange() {
        return [
            "top" => static::$distancesRange[0],
            "bottom" => static::$distancesRange[1]
        ];
    }

    /**
     * @param $dir
     */
    static public function setGraphicsDirectory($dir) {
        self::$graphicsRootDir = $dir . '/';
    }

    /**
     * @return string
     */
    static public function getDirectoryPattern() {
        return static::$graphicsDir . '/'
            . self::PATH_PLACEHOLDER_COLOR . '/';
    }

    /**
     * @return string
     */
    static public function getGraphicsDir() {
        return static::$graphicsDir;
    }

    /**
     * @param $placeholder
     * @return string
     */
    static protected function addDirectoryPlaceholder($placeholder) {
        return self::getDirectoryPattern() . $placeholder . '/';
    }

    /**
     * @param $placeholder
     * @param $newPlaceholder
     * @return string
     */
    static protected function replaceDirectoryPlaceholder($placeholder, $newPlaceholder) {
        return str_replace($placeholder, $newPlaceholder, self::getDirectoryPattern());
    }

    /**
     * Add A New Placeholder Before The Given Placeholder.
     * @param $placeholder
     * @param $newPlaceholder
     * @return string
     */
    static protected function beforeDirectoryPlaceholder($placeholder, $newPlaceholder) {
        return self::replaceDirectoryPlaceholder($placeholder,
            $newPlaceholder . '/' . $placeholder);
    }

    /**
     * @param $placeholder
     * @return string
     */
    static protected function removeDirectoryPlaceholder($placeholder) {
        return self::replaceDirectoryPlaceholder($placeholder . '/', '');
    }

    /**
     * @return string
     */
    static public function getFileNamePattern() {
        return self::PATH_PLACEHOLDER_FILE_NAME . '.'
            . self::GRAPHICS_FILE_EXTENSION;
    }

    /**
     * @return string[]
     */
    static public function getColors() {
        return static::$colors;
    }

    /**
     * @return bool
     */
    static public function isColorful() {
        return !empty(static::$colors);
    }

    /**
     * @return int
     */
    static public function getDefaultColorId() {
        return static::$optional ? self::ID_RST_COLOR : self::ID_MIN_COLOR;
    }

    /**
     * @return int
     */
    static public function getInitialColorId() {
        return self::ID_MIN_COLOR;
    }

    /**
     * @return int
     */
    static public function getMinId() {
        return static::$minId;
    }

    /**
     * @return int
     */
    static public function getMaxId() {
        return static::$maxId;
    }

    /**
     * @return int
     */
    static public function getDefaultId() {
        return static::$optional ? self::ID_RST_ITEM : static::$minId;
    }

    /**
     * @return int
     */
    static public function getInitialId() {
        return self::$minId;
    }

    /**
     * @return bool
     */
    static public function isMovable() {
        return static::$distancesRange[0] > self::DIST_MIN
            || static::$distancesRange[1] > self::DIST_MIN;
    }

    /**
     * @return int
     */
    static public function getDefaultDistance() {
        return self::DIST_MIN;
    }

    /**
     * @return int
     */
    static public function getInitialDistance() {
        return self::DIST_MIN;
    }
}
