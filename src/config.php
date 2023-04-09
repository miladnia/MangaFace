<?php

/**
 * This file is part of MangaFace.
 *
 * (c) Milad Nia <milad@miladnia.ir>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MangaFace;

use MangaFace\FaceDesigner\Item\Background\Filled;
use MangaFace\FaceDesigner\Item\Background\Pattern;
use MangaFace\FaceDesigner\Item\Background\Theme;
use MangaFace\FaceDesigner\Item\Body;
use MangaFace\FaceDesigner\Item\Effect\Weather;
use MangaFace\FaceDesigner\Item\Head;
use MangaFace\FaceDesigner\Item\Head\Beard;
use MangaFace\FaceDesigner\Item\Head\Hair;
use MangaFace\FaceDesigner\Item\Head\HairBack;
use MangaFace\FaceDesigner\Item\Head\LeftEar;
use MangaFace\FaceDesigner\Item\Head\LeftEye;
use MangaFace\FaceDesigner\Item\Head\LeftEyebrow;
use MangaFace\FaceDesigner\Item\Head\LeftEyeShadow;
use MangaFace\FaceDesigner\Item\Head\Mouth;
use MangaFace\FaceDesigner\Item\Head\Mustache;
use MangaFace\FaceDesigner\Item\Head\Nose;
use MangaFace\FaceDesigner\Item\Head\RightEar;
use MangaFace\FaceDesigner\Item\Head\RightEye;
use MangaFace\FaceDesigner\Item\Head\RightEyebrow;
use MangaFace\FaceDesigner\Item\Head\RightEyeShadow;
use MangaFace\FaceDesigner\Item\Wearable\Glasses;
use MangaFace\FaceDesigner\Item\Wearable\Hat;
use MangaFace\FaceDesigner\Item\Wearable\Jacket;
use MangaFace\FaceDesigner\Item\Wearable\Scarf;
use MangaFace\FaceDesigner\Item\Wearable\Shirt;

function config() {
    // Items:
    Head::config(30, 30, 0);
    Body::config(1, 26, 134);
    // Background:
    Filled::config(24);
    Pattern::config(32);
    Theme::config(18);
    // Effect:
    Weather::config(1);
    // Head:
    Beard::config(2, 30, 75);
    Hair::config(
        62, 0, 0, 22,
        [33, 37, 38, 39, 41, 43, 44, 60, 62],
        [0, 1, 2, 3, 9, 28, 35, 55],
        [17, 19, 21, 22, 23, 26, 27],
        [
            10, 11, 18, 30, 32, 33, 34, 36,
            37, 38, 39, 40, 41, 42, 43, 45, 46, 47, 48,
            49, 50, 51, 52, 53, 54, 58, 59, 60, 61, 62
        ],
        [
            4, 5, 6, 7, 8, 12, 13, 14, 15,
            16, 20, 24, 25, 29, 31, 44, 56, 57, 60
        ],
        [
            1 => "Short Hair",
            31 => "Long Hair"
        ]);
    HairBack::config(62, 0, 23, 31);
    Mouth::config(23, 52, 107);
    Mustache::config(29, 49, 104);
    Nose::config(34, 65, 68);
    LeftEar::config(6, 137, 64);
    RightEar::config(6, 12, 64);
    LeftEye::config(28, 97, 68);
    RightEye::config(28, 41, 68);
    LeftEyebrow::config(27, 93, 52);
    RightEyebrow::config(27, 39, 52);
    LeftEyeShadow::config(27, 91, 55);
    RightEyeShadow::config(27, 38, 55);
    // Wearable:
    Glasses::config(34, 27, 57);
    Hat::config(11, 0, -20, [4, 6], [2]);
    Jacket::config(19, 24, 122);
    Scarf::config(2, 30, 126);
    Shirt::config(25, 26, 124);
}
