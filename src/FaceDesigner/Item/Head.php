<?php

/**
 * This file is part of MangaFace.
 *
 * (c) Milad Nia <milad@miladnia.ir>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MangaFace\FaceDesigner\Item;

use MangaFace\FaceDesigner\AbstractItem;
use MangaFace\FaceDesigner\Item\Head\Beard;
use MangaFace\FaceDesigner\Item\Head\AbstractEyebrow;
use MangaFace\FaceDesigner\Item\Head\AbstractEyeShadow;
use MangaFace\FaceDesigner\Item\Head\Hair;
use MangaFace\FaceDesigner\Item\Head\AbstractEar;
use MangaFace\FaceDesigner\Item\Head\AbstractEye;
use MangaFace\FaceDesigner\Item\Head\LeftEar;
use MangaFace\FaceDesigner\Item\Head\LeftEye;
use MangaFace\FaceDesigner\Item\Head\LeftEyebrow;
use MangaFace\FaceDesigner\Item\Head\LeftEyeShadow;
use MangaFace\FaceDesigner\Item\Head\Mustache;
use MangaFace\FaceDesigner\Item\Head\Nose;
use MangaFace\FaceDesigner\Item\Head\Mouth;
use MangaFace\FaceDesigner\Item\Head\RightEar;
use MangaFace\FaceDesigner\Item\Head\RightEye;
use MangaFace\FaceDesigner\Item\Head\RightEyebrow;
use MangaFace\FaceDesigner\Item\Head\RightEyeShadow;

class Head extends AbstractItem {

    /**
     * @var string
     */
    static protected $graphicsParentDir = "head";

    /**
     * @var string
     */
    static protected $graphicsDir = "shape";

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
    static protected $position = [30, 0];

    /**
     * @var string[]
     */
    static protected $colors = ["plain", "dark", "light"];

    /**
     * @var Hair
     */
    private $hair;

    /**
     * @var Ear
     */
    private $leftEar;

    /**
     * @var Ear
     */
    private $rightEar;

    /**
     * @var AbstractEyebrow
     */
    private $leftEyebrow;

    /**
     * @var AbstractEyebrow
     */
    private $rightEyebrow;

    /**
     * @var EyeShadow
     */
    private $leftEyeShadow;

    /**
     * @var EyeShadow
     */
    private $rightEyeShadow;

    /**
     * @var Eye
     */
    private $leftEye;

    /**
     * @var Eye
     */
    private $rightEye;

    /**
     * @var Nose
     */
    private $nose;

    /**
     * @var Mouth
     */
    private $mouth;

    /**
     * @var Mustache
     */
    private $mustache;

    /**
     * @var Beard
     */
    private $beard;

    /**
     * @param int $shapeId
     * @param int $skinColorId
     */
    public function __construct($shapeId, $skinColorId) {
        parent::__construct($shapeId, $skinColorId);
    }

    /**
     * @param int $id
     * @param int $colorId
     * @return $this
     */
    public function setHair($id, $colorId) {
        $this->hair = new Hair($id, $colorId);
        $this->hairEarsRelations();
        return $this;
    }

    /**
     * @return Hair
     */
    public function getHair() {
        return $this->hair;
    }

    /**
     * @param int $id
     * @return $this
     */
    public function setEars($id) {
        $this->leftEar = new LeftEar($id, $this->colorId);
        $this->rightEar = new RightEar($id, $this->colorId);
        $this->hairEarsRelations();
        return $this;
    }

    /**
     * @return AbstractEar
     */
    public function getRightEar() {
        return $this->rightEar;
    }

    /**
     * @return AbstractEar
     */
    public function getLeftEar() {
        return $this->leftEar;
    }

    /**
     * @param int $id
     * @param int $colorId
     * @param int $distance In PX
     * @return $this
     */
    public function setEyebrows($id, $colorId, $distance) {
        $this->leftEyebrow = new LeftEyebrow($id, $colorId, $distance);
        $this->rightEyebrow = new RightEyebrow($id, $colorId, $distance);
        $this->leftEyeShadow = new LeftEyeShadow($id, $this->colorId, $distance);
        $this->rightEyeShadow = new RightEyeShadow($id, $this->colorId, $distance);
        return $this;
    }

    /**
     * @return AbstractEyebrow
     */
    public function getRightEyebrow() {
        return $this->rightEyebrow;
    }

    /**
     * @return AbstractEyebrow
     */
    public function getLeftEyebrow() {
        return $this->leftEyebrow;
    }

    /**
     * @return AbstractEyeShadow
     */
    public function getRightEyeShadow() {
        return $this->rightEyeShadow;
    }

    /**
     * @return AbstractEyeShadow
     */
    public function getLeftEyeShadow() {
        return $this->leftEyeShadow;
    }

    /**
     * @param int $id
     * @param $colorId
     * @return $this
     */
    public function setEyes($id, $colorId) {
        $this->leftEye = new LeftEye($id, $colorId);
        $this->rightEye = new RightEye($id, $colorId);
        return $this;
    }

    /**
     * @return AbstractEye
     */
    public function getRightEye() {
        return $this->rightEye;
    }

    /**
     * @return AbstractEye
     */
    public function getLeftEye() {
        return $this->leftEye;
    }

    /**
     * @param int $id
     * @param int $distance In PX
     * @return $this
     */
    public function setNose($id, $distance) {
        $this->nose = new Nose($id, $this->colorId, $distance);
        return $this;
    }

    /**
     * @return Nose
     */
    public function getNose() {
        return $this->nose;
    }

    /**
     * @param int $id
     * @param int $distance In PX
     * @return $this
     */
    public function setMouth($id, $distance) {
        $this->mouth = new Mouth($id, $this->colorId, $distance);
        return $this;
    }

    /**
     * @return Mouth
     */
    public function getMouth() {
        return $this->mouth;
    }

    /**
     * @param int $id
     * @param int $colorId
     * @param int $distance In PX
     * @return $this
     */
    public function setMustache($id, $colorId, $distance) {
        $this->mustache = new Mustache($id, $colorId, $distance);
        return $this;
    }

    public function getMustache() {
        return $this->mustache;
    }

    /**
     * @param int $id
     * @param int $colorId
     * @return $this
     */
    public function setBeard($id, $colorId) {
        $this->beard = new Beard($this->id, $id, $colorId);
        return $this;
    }

    /**
     * @return Beard
     */
    public function getBeard() {
        return $this->beard;
    }

    /**
     * Check The Relationships Between Hair and Ears.
     */
    private function hairEarsRelations() {
        // If the hair or the ears is not drawn yet.
        if (($this->hair === null)
            || ($this->leftEar === null)) {
            return;
        }
        // If the hair is kind of covered hair.
        if ($this->hair->isCoveredHair()) {
            $this->leftEar->hide();
            $this->rightEar->hide();
        } else {
            $this->leftEar->show();
            $this->rightEar->show();
        }
    }
}