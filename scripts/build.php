<?php

define('APP_DIR', dirname(__DIR__));
define('CONFIG_FILE', APP_DIR . '/config/mangaface/app.yaml');

require_once APP_DIR . '/vendor/autoload.php';

use Symfony\Component\Dotenv\Dotenv;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Yaml\Exception\ParseException;

// Load environment variables.
(new Dotenv)->loadEnv(APP_DIR . '/.env');

try {
    $config = Yaml::parseFile(CONFIG_FILE);
} catch (ParseException $e) {
    echo '✘ [ERROR] Could not parse the config file: ' . PHP_EOL . '  ',
        CONFIG_FILE . PHP_EOL . '  ',
        $e->getMessage() . PHP_EOL;
    exit(1);
}

$manifestDir = APP_DIR . '/' . ($config['manifest_dir'] ?? '');
$dirList = scandir($manifestDir);
$manifestFiles = array_filter(
    $dirList,
    fn($name) => !is_dir($name) && str_ends_with($name, '.yaml')
);

$parsedManifest = [];

foreach ($manifestFiles as $f) {
    $filename = $manifestDir . '/' . $f;
    $manifest = file_get_contents($filename);
    // Replace tags with values.
    $baseUrl = $_ENV['STATIC_BASE_URL'] . '/' . $config['assets_dir'] ?? '';
    $manifest = str_replace('<BASE_URL>', $baseUrl, $manifest);

    try {
        $parsedManifest = Yaml::parse($manifest);
    } catch (ParseException $e) {
        echo '✘ [ERROR] Could not parse the manifest: ' . PHP_EOL . '  ',
            $filename . PHP_EOL . '  ',
            $e->getMessage() . PHP_EOL;
        exit(1);
    }

    $packName = $parsedManifest['pack_name'];
}

$apiManifestDir = APP_DIR . '/' .
    ($config['api']['public_dir'] ?? 'public') . '/' .
    ($config['api']['manifest_dir'] ?? '');

is_dir($apiManifestDir) or mkdir($apiManifestDir, 0777, true);

$prettyManifest = $_ENV['API_PRETTY_MANIFEST'] ?? $config['api']['pretty_manifest'] ?? true;

$jsonData = json_encode(
    $parsedManifest,
    true === $prettyManifest || 'true' === $prettyManifest ? JSON_PRETTY_PRINT : 0
);

$apiManifestFile = "{$apiManifestDir}/{$packName}.json";
file_put_contents($apiManifestFile, $jsonData) !== false
    or exit('✘ [ERROR] Could not write to the file: ' . $apiManifestDir . PHP_EOL);

echo 'File created: ' . $apiManifestFile . PHP_EOL;
