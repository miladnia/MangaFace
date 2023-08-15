<?php

/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

require_once dirname(__DIR__) . '/vendor/autoload.php';

use Symfony\Component\Dotenv\Dotenv;
use Symfony\Component\Yaml\Yaml;
use MangaFace\Util\StorageUtil;

define('APP_DIR', dirname(__DIR__));
// Load environment variables.
(new Dotenv)->loadEnv(APP_DIR.'/.env');

function createApiResources(&$manifest, $baseUrl)
{
    $api_resources = [];

    foreach ($manifest['resources'] as $catLabel => &$cat) {
        foreach ($cat as $resLabel => &$res) {
            $res['label'] = $resLabel;
            $res['cat_label'] = $catLabel;
            $res['icon_url'] = str_replace(
                '<resourse::dir>', $res['dir'],
                $baseUrl.'/'.$manifest['icon_path_format']);

            foreach ($res['fragments'] as &$frag) {
                $frag['url'] = str_replace(
                    ['<resourse::dir>', '<fragment::dir>'],
                    [$res['dir'], $frag['dir']],
                    $baseUrl.'/'.$manifest['fragment_path_format']);

                if (!isset($res['colors'])) {
                    $frag['url'] = str_replace('<color::dir>', $manifest['default_color_dir'], $frag['url']);
                }

                unset($frag['dir']);
            }

            unset($res['dir']);
            $api_resources[] = $res;
        }
    }

    return $api_resources;
}

try {
    // Parse yaml configs.
    $appConfig = Yaml::parseFile(APP_DIR.'/config/app.yaml')['app'];
    $manifest = Yaml::parseFile(APP_DIR.'/config/resource_manifest/mangaface.yaml')['mangaface'];
} catch (ParseException $e) {
    echo 'Unable to parse the YAML string: ', $e->getMessage();
    die;
}

$api_resources = createApiResources($manifest, $_ENV['APP_CDN'].'/'.$_ENV['APP_RESOURCES_BASE_DIR']);
$api_resources_path = APP_DIR.'/'.$appConfig['api_resources_path'];
$result = StorageUtil::saveAsJSON($api_resources, $api_resources_path, true);

echo $result ? 'API resources file created: ' : 'Could not create file: ',
    PHP_EOL . $api_resources_path . PHP_EOL.PHP_EOL;

// $api_data_format = [];
// $api_data_format_path = APP_DIR.'/'.$appConfig['api_data_format_path'];
// $result = StorageUtil::saveAsJSON($api_data_format, $api_data_format_path, true);

// echo $result ? 'API data format file created: ' : 'Could not create file: ',
//     PHP_EOL . $api_data_format_path . PHP_EOL.PHP_EOL;
