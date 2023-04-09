<?php

/**
 * This file is part of MangaFace.
 *
 * (c) Milad Nia <milad@miladnia.ir>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

require_once __DIR__ . "/../vendor/autoload.php";

$list = [
//    \MangaFace\FaceDesigner\Head\RightEyebrow::class => [42, 0],
//    \MangaFace\FaceDesigner\Head\LeftEyebrow::class => [42, 0],
//    \MangaFace\FaceDesigner\Head\RightEyeShadow::class => [44, 0],
//    \MangaFace\FaceDesigner\Head\LeftEyeShadow::class => [44, 0],
//    \MangaFace\FaceDesigner\Head\RightEye::class => [38, 0],
//    \MangaFace\FaceDesigner\Head\LeftEye::class => [38, 0],
//    \MangaFace\FaceDesigner\Head\RightEar::class => [28, 49],
//    \MangaFace\FaceDesigner\Head\LeftEar::class => [28, 49],
//    \MangaFace\FaceDesigner\Head\HairBack::class => [0, 165],
//    \MangaFace\FaceDesigner\Wearable\Shirt::class => [0, 63],
//    \MangaFace\FaceDesigner\Wearable\Jacket::class => [0, 65],
];

/**
 * @var MangaFace\FaceDesigner\Item $class
 * @var int[] $sDim Standard Dimensions.
 */
foreach ($list as $class => $sDim) {
    foreach ($class::getColors() as $colorKey => $colorName) {
        for ($id = $class::getMinId(); $id <= $class::getMaxId(); $id++) {
            /** @var MangaFace\FaceDesigner\Item $obj */
            $obj = new $class($id, $colorKey + 1, 0);
            $image = $obj->getImage();
            $createWidth = ($sDim[0] > 0) ? $sDim[0] : $obj->getImageWidth();
            $createHeight = ($sDim[1] > 0) ? $sDim[1] : $obj->getImageHeight();
            $croppedImage = imagecreatetruecolor($createWidth, $createHeight);
            imagesavealpha($croppedImage, true);
            $imgColor = imagecolorallocatealpha($croppedImage, 0, 0, 0, 127);
            imagefill($croppedImage, 0, 0, $imgColor);
            $cropX = 0;
            if ($sDim[0] > 0
                && is_subclass_of($obj, \MangaFace\FaceDesigner\Item\Head\RightItem::class)) {
                $cropX = $sDim[0] - $obj->getImageWidth();
            }
            $cropY = ($sDim[1] > 0) ? $sDim[1] - $obj->getImageHeight() : 0;
            imagecopy($croppedImage, $image, $cropX, $cropY, 0, 0,
                $obj->getImageWidth(), $obj->getImageHeight());
            $obj->destroyImage();
//            $path = str_replace("resource", "res_new", $obj->getFilePath()); FIXME
            $dir = substr($path, 0, strrpos($path, '/'));
            echo $path . "\r\n";
            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
            }
            imagepng($croppedImage, $path);
            imagedestroy($croppedImage);
        }
    }
}
