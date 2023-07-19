<?php

/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MangaFace\Util;

final class StorageUtil
{
    public static function saveAsJSON(array &$values, string $filePath, bool $pretty = false): string
    {
        $dstDir = dirname($filePath);
    
        if (!is_dir($dstDir))
            mkdir($dstDir, 0777, true);
        
        $filePath = $dstDir . DIRECTORY_SEPARATOR . basename($filePath, '.json') . '.json';
        
        return false !== file_put_contents(
            $filePath,
            json_encode($values, $pretty ? JSON_PRETTY_PRINT : 0) );
    }
}
