/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { UITester } from "../../src/utils/tester.js";
import * as testCase from "./test_case.js";

window.onload = function () {
    (new UITester()).addTestCase(testCase).runUITests();
};
