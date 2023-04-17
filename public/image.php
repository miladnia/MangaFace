<?php

/**
 * This file is part of MangaFace.
 *
 * (c) Milad Nia <milad@miladnia.ir>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

require_once dirname(__DIR__) . "/vendor/autoload.php";

use MangaFace\FaceDesigner\Designer;

// Execute Configs.
MangaFace\config();
// Get input.
$input = json_decode(file_get_contents("php://input"), true);
$designer = new Designer(__DIR__ . "/assets/graphics", 180, 187);

$designer->drawHead(
        @$input["head"]["shape"]["i"],
        @$input["head"]["shape"]["c"])
    ->setHair(
        @$input["head"]["hair"]["i"],
        @$input["head"]["hair"]["c"])
    ->setEars(
        @$input["head"]["ears"]["i"])
    ->setEyebrows(
        @$input["head"]["eyebrows"]["i"],
        @$input["head"]["eyebrows"]["c"],
        @$input["head"]["eyebrows"]["d"])
    ->setEyes(
        @$input["head"]["eyes"]["i"],
        @$input["head"]["eyes"]["c"])
    ->setNose(
        @$input["head"]["nose"]["i"],
        @$input["head"]["nose"]["d"])
    ->setMouth(
        @$input["head"]["mouth"]["i"],
        @$input["head"]["mouth"]["d"])
    ->setBeard(
        @$input["head"]["beard"]["i"],
        @$input["head"]["beard"]["c"])
    ->setMustache(
        @$input["head"]["mustache"]["i"],
        @$input["head"]["mustache"]["c"],
        @$input["head"]["mustache"]["d"]);

$designer->drawBody(
        @$input["head"]["shape"]["i"],
        @$input["head"]["shape"]["c"])
    ->wearShirt(
        @$input["wearable"]["shirt"]["i"],
        @$input["wearable"]["shirt"]["c"])
    ->wearJacket(
        @$input["wearable"]["jacket"]["i"],
        @$input["wearable"]["jacket"]["c"])
    ->wearScarf(
        @$input["wearable"]["scarf"]["i"],
        @$input["wearable"]["scarf"]["c"])
    ->wearHat(
        @$input["wearable"]["hat"]["i"],
        @$input["wearable"]["hat"]["c"],
        @$input["wearable"]["hat"]["d"])
    ->wearGlasses(
        @$input["wearable"]["glasses"]["i"],
        @$input["wearable"]["glasses"]["d"]);

$designer->setBackground(
        @$input["background"]["filled"]["i"],
        @$input["background"]["pattern"]["i"],
        @$input["background"]["pattern"]["c"],
        @$input["background"]["theme"]["i"])
    ->setEffects(
        @$input["effect"]["weather"]["i"]);

// Generate a gif encoded image.
echo $designer->preview(Designer::FORMAT_GIF);
