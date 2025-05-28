/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Resource, Fragment, Range, Color, Position } from "../../src/domain/models.js";

var res01 = new Resource("_id_01", "Foo A", "A");
res01
var res02 = new Resource("_id_02", "Bar A", "A");
var res03 = new Resource("_id_03", "Baz A", "A");

var res11 = new Resource("_id_11", "Foo B", "B");
var res12 = new Resource("_id_12", "Bar B", "B");
var res13 = new Resource("_id_13", "Baz B", "B");

var res21 = new Resource("_id_21", "Foo C", "C");
var res22 = new Resource("_id_22", "Bar C", "C");
var res23 = new Resource("_id_23", "Baz C", "C");

export default [
    res01,
    res02,
    res03,
    res11,
    res12,
    res13,
    res21,
    res22,
    res23
];
