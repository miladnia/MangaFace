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

class Hat extends AbstractWearable {

    const PATH_PLACEHOLDER_HAT_SIZE = "[hat.size]";

    const SIZE_MODE_SMALL = 1;
    const SIZE_MODE_MEDIUM = 2;
    const SIZE_MODE_LARGE = 3;

    /**
     * @var string
     */
    static protected $graphicsDir = "hat";

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
    static protected $position = [0, -20];

    /**
     * @var int[]
     */
    static protected $distancesRange = [3, 3];

    /**
     * Swim Caps.
     * @var int[]
     */
    static protected $swimCaps = [];

    /**
     * Open-Top Hats.
     * @var int[]
     */
    static protected $openTopHats = [];

    /**
     * @var string
     */
    private $sizeMode;

    /**
     * @param int $id
     * @param int $colorId
     * @param int $distance
     */
    public function __construct($id, $colorId, $distance) {
        parent::__construct($id, $colorId, $distance);
        $this->sizeMode = (string) self::SIZE_MODE_SMALL;
    }

    /**
     * @param int $maxId Maximum Id
     * @param int $x Position X
     * @param int $y Position Y
     * @param int[] $swimCaps
     * @param int[] $openTopHats
     */
    static public function config($maxId, $x=0, $y=0, $swimCaps=[], $openTopHats=[]) {
        parent::config($maxId, $x, $y);
        self::$swimCaps = $swimCaps;
        self::$openTopHats = $openTopHats;
    }

    /**
     * @return string
     */
    protected function getFilePath() {
        return str_replace(self::PATH_PLACEHOLDER_HAT_SIZE,
            $this->sizeMode, parent::getFilePath());
    }

    /**
     * @return string
     */
    static public function getDirectoryPattern() {
        return self::addDirectoryPlaceholder(self::PATH_PLACEHOLDER_HAT_SIZE);
    }

    /**
     * @param $mode
     */
    public function setSizeMode($mode) {
        switch ($mode) {
            case self::SIZE_MODE_SMALL:
            case self::SIZE_MODE_MEDIUM:
            case self::SIZE_MODE_LARGE:
                $this->sizeMode = (string) $mode;
                break;
            default:
                $this->sizeMode = (string) self::SIZE_MODE_SMALL;
        }
    }

    /**
     * @return bool
     */
    public function isSwimCap() {
        return in_array($this->id, static::$swimCaps);
    }

    /**
     * @return int[]
     */
    static public function getSwimCaps() {
        return static::$swimCaps;
    }

    /**
     * @return bool
     */
    public function isOpenTop() {
        return in_array($this->id, static::$openTopHats);
    }

    /**
     * @return int[]
     */
    static public function getCoveredHats() {
        $array = [];
        for ($id = static::$minId; $id <= static::$maxId; $id++) {
            if (in_array($id, static::$openTopHats)
                || in_array($id, static::$swimCaps)) {
                continue;
            }
            $array[] = $id;
        }

        return $array;
    }
}