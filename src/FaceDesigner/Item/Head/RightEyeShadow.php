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

class RightEyeShadow extends AbstractEyeShadow  implements RightItemInterface {
    
    static protected $graphicsDir = "right_eyeshadow";

    /**
     * @var int[]
     */
    static protected $position = [38, 55];
}