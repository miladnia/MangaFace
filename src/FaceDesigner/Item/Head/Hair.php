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

class Hair extends AbstractHair {

    /**
     * @var string
     */
    static protected $graphicsDir = "hair";

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
    static protected $position = [0, 0];

    /**
     * @var bool
     */
    static protected $optional =  true;

    /**
     * Covered Hairs.
     * @var int[]
     */
    static protected $coveredHairs = [];

    /**
     * Short Hairs.
     * @var int[] 
     */
    static protected $shortHairs = [];

    /**
     * Medium Hairs.
     * @var int[]
     */
    static protected $mediumHairs = [];

    /**
     * Long Hairs.
     * @var int[]
     */
    static protected $longHairs = [];

    /**
     * Very Long Hairs.
     * @var int[]
     */
    static protected $veryLongHairs = [];

    /**
     * Bald Style Hair.
     * @var int
     */
    static protected $baldStyleHair = 0;

    /**
     * @var string[]
     */
    static protected $slices = [];

    /**
     * @var HairBack
     */
    private $hairBack = null;

    /**
     * @param int $id
     * @param int $colorId
     */
    public function __construct($id, $colorId) {
        parent::__construct($id, $colorId);
        if ($this->hasHairBack()) {
            $this->hairBack = new HairBack($id, $colorId);
        } else {
            $this->hairBack = new HairBack(0, 0);
        }
    }

    /**
     * @param int $maxId Maximum Id
     * @param int $x Position X
     * @param int $y Position Y
     * @param int $baldStyleHair
     * @param array $coveredHairs
     * @param array $shortHairs
     * @param array $mediumHairs
     * @param array $longHairs
     * @param array $veryLongHairs
     * @param array $slices
     */
    static public function config($maxId, $x=0, $y=0, $baldStyleHair=0,
                                  $coveredHairs=[], $shortHairs=[], $mediumHairs=[],
                                  $longHairs=[], $veryLongHairs=[], $slices=[]) {
        parent::config($maxId, $x, $y);
        self::$baldStyleHair = intval($baldStyleHair);
        self::$coveredHairs = $coveredHairs;
        self::$shortHairs = $shortHairs;
        self::$mediumHairs = $mediumHairs;
        self::$longHairs = $longHairs;
        self::$veryLongHairs = $veryLongHairs;
        self::$slices = $slices;
    }

    /**
     * @return bool
     */
    private function hasHairBack() {
        return $this->id >= HairBack::getMinId();
    }

    /**
     * @return HairBack
     */
    public function getHairBack() {
        return $this->hairBack;
    }

    /**
     * Make the hair and the hair back hidden.
     */
    public function hide() {
        parent::hide();
        if ($this->hasHairBack()) {
            $this->hairBack->hide();
        }
    }

    /**
     * Make the hair and the hair back visible.
     */
    public function show() {
        parent::show();
        if ($this->hasHairBack()) {
            $this->hairBack->show();
        }
    }

    /**
     * @return bool
     */
    public function isCoveredHair() {
        return in_array($this->id, static::$coveredHairs);
    }

    /**
     * @return bool
     */
    public function isShortHair() {
        return in_array($this->id, static::$shortHairs);
    }

    /**
     * @return bool
     */
    public function isMediumHair() {
        return in_array($this->id, static::$mediumHairs);
    }

    /**
     * @return bool
     */
    public function isLongHair() {
        return in_array($this->id, static::$longHairs);
    }

    /**
     * @return bool
     */
    public function isVeryLongHair() {
        return in_array($this->id, static::$veryLongHairs);
    }

    /**
     * @return int[]
     */
    static public function getCoveredHairs() {
        return static::$coveredHairs;
    }

    /**
     * @return int[]
     */
    static public function getShortHairs() {
        return static::$shortHairs;
    }

    /**
     * @return int[]
     */
    static public function getMediumHairs() {
        return static::$mediumHairs;
    }

    /**
     * @return int[]
     */
    static public function getLongHairs() {
        return static::$longHairs;
    }

    /**
     * @return int[]
     */
    static public function getVeryLongHairs() {
        return static::$veryLongHairs;
    }

    /**
     * @return int
     */
    static public function getBaldStyle() {
        return static::$baldStyleHair;
    }

    /**
     * Switch hair style to bald.
     */
    public function baldStyle() {
        $this->id = static::$baldStyleHair;
    }
}