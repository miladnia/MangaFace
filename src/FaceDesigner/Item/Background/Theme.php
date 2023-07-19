<?php

/**
 * This file is part of MangaFace.
 *
 * (c) Milad Nia <milad@miladnia.ir>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MangaFace\FaceDesigner\Item\Background;

class Theme extends AbstractBackground {

    /**
     * @var string
     */
    static protected $graphicsDir = "background_theme";

    /**
     * @var int
     */
    static protected $minId = self::ID_RST_ITEM;

    /**
     * @var int
     */
    static protected $maxId = self::ID_RST_ITEM;

    /**
     * @var array
     */
    static protected $colors = [];

    /**
     * Filled Theme.
     * @param int $id
     */
    public function __construct($id) {
        parent::__construct($id);
    }

    /**
     * @return string
     */
    static public function getDirectoryPattern() {
        return self::removeDirectoryPlaceholder(self::PATH_PLACEHOLDER_COLOR);
    }
}