<?php

/**
 * This file is part of MangaFace.
 *
 * (c) Milad Nia <milad@miladnia.ir>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MangaFace\Util;

class PhotoUtil {

    /**
     * Calculate Aspect Ratio Using Euclid's Algorithm.
     * @param int $width
     * @param int $height
     * @return bool|string
     */
    public static function calculateAspectRatio($width, $height) {
        // If entered values is not valid.
        if (($width <= 0) || ($height <= 0)) {
            return null;
        }

        // Take care of the simple case.
        if ($width == $height) {
            return "1:1";
        }

        // Calculate Greatest Common Divisor (gcd).
        $gmpGcd = gmp_gcd((string) $width, (string) $height);
        $gcd = gmp_intval($gmpGcd);
        // Calculate Aspect Ratio.
        $ratio = ($width / $gcd) . ":" . ($height / $gcd);

        return $ratio;
    }
}
