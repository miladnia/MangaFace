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

class LeftEyeShadow extends AbstractEyeShadow  implements LeftItemInterface {
    
    static protected $graphicsDir = "left_eyeshadow";

    /**
     * @var int[]
     */
    static protected $position = [91, 55];
}