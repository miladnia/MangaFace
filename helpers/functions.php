<?php
/**
 * Project: Negarang FaceApp
 * This file is part of Negarang.
 *
 * (c) Milad Abdollahnia
 * http://milad-ab.ir
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

use Negarang\FaceDesigner\Items\Background\Filled;
use Negarang\FaceDesigner\Items\Background\Pattern;
use Negarang\FaceDesigner\Items\Background\Theme;
use Negarang\FaceDesigner\Items\Body;
use Negarang\FaceDesigner\Items\Effect\Weather;
use Negarang\FaceDesigner\Items\Head;
use Negarang\FaceDesigner\Items\Head\Beard;
use Negarang\FaceDesigner\Items\Head\Hair;
use Negarang\FaceDesigner\Items\Head\HairBack;
use Negarang\FaceDesigner\Items\Head\LeftEar;
use Negarang\FaceDesigner\Items\Head\LeftEye;
use Negarang\FaceDesigner\Items\Head\LeftEyebrow;
use Negarang\FaceDesigner\Items\Head\LeftEyeShadow;
use Negarang\FaceDesigner\Items\Head\Mouth;
use Negarang\FaceDesigner\Items\Head\Mustache;
use Negarang\FaceDesigner\Items\Head\Nose;
use Negarang\FaceDesigner\Items\Head\RightEar;
use Negarang\FaceDesigner\Items\Head\RightEye;
use Negarang\FaceDesigner\Items\Head\RightEyebrow;
use Negarang\FaceDesigner\Items\Head\RightEyeShadow;
use Negarang\FaceDesigner\Items\Wearable\Glasses;
use Negarang\FaceDesigner\Items\Wearable\Hat;
use Negarang\FaceDesigner\Items\Wearable\Jacket;
use Negarang\FaceDesigner\Items\Wearable\Scarf;
use Negarang\FaceDesigner\Items\Wearable\Shirt;

function faceAppConfig() {
    // Items.
    Head::config(30, 30, 0);
    Body::config(1, 26, 134);
    // Background.
    Filled::config(24);
    Pattern::config(32);
    Theme::config(18);
    // Effect.
    Weather::config(1);
    // Head.
    Beard::config(2, 30, 75);
    Hair::config(62, 0, 0, 22,
        [33, 37, 38, 39, 41, 43, 44, 60, 62],
        [0, 1, 2, 3, 9, 28, 35, 55],
        [17, 19, 21, 22, 23, 26, 27],
        [10, 11, 18, 30, 32, 33, 34, 36,
            37, 38, 39, 40, 41, 42, 43, 45, 46, 47, 48,
            49, 50, 51, 52, 53, 54, 58, 59, 60, 61, 62],
        [4, 5, 6, 7, 8, 12, 13, 14, 15,
            16, 20, 24, 25, 29, 31, 44, 56, 57, 60],
        [1 => "Short Hair", 31 => "Long Hair"]);
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
    // Wearable.
    Glasses::config(34, 27, 57);
    Hat::config(11, 0, -20,
        [4, 6], [2]);
    Jacket::config(19, 24, 122);
    Scarf::config(2, 30, 126);
    Shirt::config(25, 26, 124);
}
