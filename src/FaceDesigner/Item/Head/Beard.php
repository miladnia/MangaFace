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

class Beard extends AbstractHair {

    const PATH_PLACEHOLDER_FACE_SHAPE = "[shape]";

    /**
     * @var string
     */
    static protected $graphicsDir = "beard";

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
    static protected $position = [30, 75];

    /**
     * @var bool
     */
    static protected $optional = true;

    /**
     * @var int
     */
    private $shapeTypeId;

    /**
     * @param int $id
     * @param int $shapeTypeId
     * @param int $colorId
     */
    public function __construct($shapeTypeId, $id, $colorId) {
        parent::__construct($id, $colorId);
        $this->shapeTypeId = $shapeTypeId;
    }

    /**
     * @return string
     */
    protected function getFilePath() {
        return str_replace(self::PATH_PLACEHOLDER_FACE_SHAPE,
            $this->shapeTypeId, parent::getFilePath());
    }

    /**
     * @return string
     */
    static public function getDirectoryPattern() {
        return self::addDirectoryPlaceholder(self::PATH_PLACEHOLDER_FACE_SHAPE);
    }
}