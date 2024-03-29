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

MangaFace\config();

$api = new MangaFace\ApiProvider("assets/graphics");
$api->make(dirname(__DIR__) . "/web-client/autoconfig", "manifest", "data_format");
