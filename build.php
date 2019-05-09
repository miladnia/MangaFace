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

require_once __DIR__ . "/vendor/autoload.php";

use Negarang\FaceDesigner\ApiProvider;

// Execute Configs.
faceAppConfig();

$api = new ApiProvider("resource/graphics/facedesigner");
$api->make(__DIR__ . "/public/resource/json/");
