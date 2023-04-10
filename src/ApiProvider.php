<?php

/**
 * This file is part of MangaFace.
 *
 * (c) Milad Nia <milad@miladnia.ir>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace MangaFace;

use MangaFace\FaceDesigner\AbstractItem;
use MangaFace\FaceDesigner\Item\Head\Hair;
use MangaFace\FaceDesigner\Item\Wearable\Hat;

class ApiProvider {

    private $map = [
        "head" => [
            "shape" => [
                "class" => FaceDesigner\Item\Head::class,
                "priority" => 410
            ],
            "hair" => [
                [
                    "class" => FaceDesigner\Item\Head\Hair::class,
                    "priority" => 600,
                    "dependency" => [
                        "class" => FaceDesigner\Item\Head\HairBack::class,
                        "priority" => 200
                    ]
                ]
            ],
            "ears" => [
                [
                    "class" => FaceDesigner\Item\Head\LeftEar::class,
                    "priority" => 400
                ],
                [
                    "class" => FaceDesigner\Item\Head\RightEar::class,
                    "priority" => 400
                ]
            ],
            "eyebrows" => [
                [
                    "class" => FaceDesigner\Item\Head\LeftEyebrow::class,
                    "priority" => 480,
                    "dependency" => [
                        "class" => FaceDesigner\Item\Head\LeftEyeShadow::class,
                        "priority" => 460,
                    ]
                ],
                [
                    "class" => FaceDesigner\Item\Head\RightEyebrow::class,
                    "priority" => 480,
                    "dependency" => [
                        "class" => FaceDesigner\Item\Head\RightEyeShadow::class,
                        "priority" => 460,
                    ]
                ]
            ],
            "eyes" => [
                [
                    "class" => FaceDesigner\Item\Head\LeftEye::class,
                    "priority" => 470
                ],
                [
                    "class" => FaceDesigner\Item\Head\RightEye::class,
                    "priority" => 470
                ]
            ],
            "nose" => [
                "class" => FaceDesigner\Item\Head\Nose::class,
                "priority" => 450
            ],
            "mouth" => [
                "class" => FaceDesigner\Item\Head\Mouth::class,
                "priority" => 430
            ],
            "mustache" => [
                "class" => FaceDesigner\Item\Head\Mustache::class,
                "priority" => 440
            ],
            "beard" => [
                "class" => FaceDesigner\Item\Head\Beard::class,
                "priority" => 420
            ]
        ],
        "body" => [
            "shape" => [
                "class" => FaceDesigner\Item\Body::class,
                "priority" => 210
            ]
        ],
        "wearable" => [
            "shirt" => [
                "class" => FaceDesigner\Item\Wearable\Shirt::class,
                "priority" => 300
            ],
            "jacket" => [
                "class" => FaceDesigner\Item\Wearable\Jacket::class,
                "priority" => 310
            ],
            "scarf" => [
                "class" => FaceDesigner\Item\Wearable\Scarf::class,
                "priority" => 320
            ],
            "hat" => [
                "class" => FaceDesigner\Item\Wearable\Hat::class,
                "priority" => 700
            ],
            "glasses" => [
                "class" => FaceDesigner\Item\Wearable\Glasses::class,
                "priority" => 500
            ]
        ],
        "background" => [
            "filled" => [
                "class" => FaceDesigner\Item\Background\Filled::class,
                "priority" => 100
            ],
            "pattern" => [
                "class" => FaceDesigner\Item\Background\Pattern::class,
                "priority" => 110
            ],
            "theme" => [
                "class" => FaceDesigner\Item\Background\Theme::class,
                "priority" => 120
            ]
        ],
        "effect" => [
            "weather" => [
                "class" => FaceDesigner\Item\Effect\Weather::class,
                "priority" => 800
            ]
        ]
    ];

    private $manifest = [
        "resource_prefix" => [],
        "resource_postfix" => [],
        "color_set" => [],
        "items" => [],
        "relations" => [],
        "initial_values" => [],
        "view_config" => []
    ];

    private $colorCodes = [];

    /**
     * @param string $resourceDir
     */
    public function __construct($resourceDir) {
        $this->manifest["resource_prefix"] = $resourceDir . '/';
        $this->manifest["resource_postfix"] = AbstractItem::getFileNamePattern();
        $this->manifest["relations"] = $this->getRelationsMap();
        $this->manifest["initial_values"] = [
            "i" => AbstractItem::getInitialId(),
            "c" => AbstractItem::getInitialColorId(),
            "d" => AbstractItem::getInitialDistance()
        ];
    }

    /**
     * @return array
     */
    private function getRelationsMap() {
        $map = [
            "hairs_hat" => []
        ];
        foreach (Hair::getShortHairs() as $id) {
            $map["hairs_hat"][$id] = Hat::SIZE_MODE_SMALL;
        }
        foreach (Hair::getMediumHairs() as $id) {
            $map["hairs_hat"][$id] = Hat::SIZE_MODE_MEDIUM;
        }
        foreach (Hair::getLongHairs() as $id) {
            $map["hairs_hat"][$id] = Hat::SIZE_MODE_LARGE;
        }
        foreach (Hair::getVeryLongHairs() as $id) {
            $map["hairs_hat"][$id] = Hat::SIZE_MODE_MEDIUM;
        }

        return $map;
    }

    /**
     * @param callable $callback
     */
    private function getItemsRules(callable $callback) {
        // TODO Define a constant value for each item class and pass its name.
        // TODO If rule is repetitive only point to the first one. Just run callback and remove the loops.
        foreach (Hat::getSwimCaps() as $id) {
            $callback("wearable", "hat", $id, [
                "head" => [
                    "hair" => $this->formatRule(AbstractItem::ID_RST_ITEM),
                    "ears" => $this->formatRule(AbstractItem::ID_RST_ITEM)
                ]
            ]);
        }
        foreach (Hat::getCoveredHats() as $id) {
            $callback("wearable", "hat", $id, [
                "head" => [
                    "hair" => $this->formatRule(Hair::getBaldStyle(),
                        Hair::getVeryLongHairs())
                ]
            ]);
        }
        foreach (Hair::getCoveredHairs() as $id) {
            $callback("head", "hair", $id, [
                "head" => [
                    "ears" => $this->formatRule(AbstractItem::ID_RST_ITEM)
                ]
            ]);
        }
    }

    /**
     * @param int $itemId
     * @param array $conditions
     * @return array
     */
    private function formatRule($itemId, $conditions=[]) {
        $rule = [
            "i" => $itemId
        ];
        if (!empty($conditions)) {
            $rule["conditions"] = $conditions;
        }

        return $rule;
    }

    /**
     * @param AbstractItem $class
     * @return array
     */
    private function buildFormat($class) {
        $format = [
            // i: Item ID.
            "i" => $class::getDefaultId(),
        ];
        if ($class::isColorful()) {
            // c: Color ID.
            $format["c"] = $class::getDefaultColorId();
        }
        if ($class::isMovable()) {
            // d: Distance.
            $format["d"] = $class::getDefaultDistance();
        }

        return $format;
    }

    /**
     * @param AbstractItem $class
     * @param int $priority
     * @param AbstractItem $depClass Dependency Class.
     * @param int $depPriority Dependency Priority.
     * @return array
     */
    private function bindItem($class, $priority, $depClass=null, $depPriority=-1) {
        // Color-Set configurations for the item.
        $colorSet = $colorGroup = 0;
        if (!empty($class::getColors())) {
            $cCode = md5(implode(",", $class::getColors()));
            if (!array_key_exists($cCode, $this->colorCodes)) {
                $this->colorCodes[$cCode] = count($this->manifest["color_set"]) + 1;
                $this->manifest["color_set"][$this->colorCodes[$cCode]] = $class::getColors();
            }
            $colorSet = $this->colorCodes[$cCode];
            if (is_subclass_of($class, FaceDesigner\Item\Head\AbstractHeadItem::class)
                || is_a($class, FaceDesigner\Item\Head::class, true)) {
                $colorGroup = $colorSet;
            }
        }
        // Bind all properties of the item.
        $item = [
            "id_max" => $class::getMaxId(),
            "resource" => $class::getDirectoryPattern(),
            "position" => $class::getPosition(),
            "priority" => $priority
        ];
        // If Minimum ID is specified.
        if ($class::getMinId() > AbstractItem::getMinId()) {
            $item["id_min"] = $class::getMinId();
        }
        if ($class::isMovable()) {
            $item["distance_range"] = $class::getDistancesRange();
        }
        if ($colorSet > 0) {
            $item["color_set"] = $colorSet;
            if ($colorGroup > 0) {
                $item["color_group"] = $colorGroup;
            }
        }
        // If item has dependency.
        if ($depClass !== null && $depPriority > -1) {
            $item["dependency"] = $this->bindItem($depClass, $depPriority);
        }

        return $item;
    }

    /**
     * @return null|string
     */
    private function storeJSON($dstDir, $fileName, &$values) {
        if (!is_dir($dstDir)
            && (false === mkdir($dstDir, 0777, true))) {
            return null;
        }

        $path = rtrim($dstDir, "\/")
            . DIRECTORY_SEPARATOR . $fileName . ".json";
        $result = file_put_contents($path, json_encode($values));

        return ($result !== false) ? $path : null;
    }

    /**
     * @return bool
     */
    public function make($dstDir, $manifestFileName, $dataFormatFileName) {
        // The format which client must return to the server.
        $dataFormat = [];

        foreach ($this->map as $iKey => $i) {
            foreach ($i as $jKey => $j) {
                if (array_key_exists("class", $j)) {
                    $j = [$j];
                }
                foreach ($j as $k) {
                    /** @var AbstractItem $class */
                    $class = $k["class"];
                    $priority = $k["priority"];
                    $this->manifest["items"][$iKey][$jKey][] = array_key_exists("dependency", $k) ?
                        $this->bindItem($class, $priority, $k["dependency"]["class"],
                            $k["dependency"]["priority"]) :
                        $this->bindItem($class, $priority);
                    // Config: Define Sections.
                    foreach ($class::getSlices() as $sId => $sName) {
                        $this->manifest["view_config"][$iKey][$jKey]["sections"][] = [
                            "name" => $sName,
                            "first_id" => $sId
                        ];
                    }
                    $dataFormat[$iKey][$jKey] = $this->buildFormat($class);
                }
            }
        }

        self::getItemsRules(function ($parent, $item, $id, $rule) {
            $this->manifest["items"][$parent][$item][0]["rules"][$id] = $rule;
        });
        $dataFormatPath = $this->storeJSON($dstDir, $dataFormatFileName, $dataFormat);
        $manifestPath = $this->storeJSON($dstDir, $manifestFileName, $this->manifest);

        foreach ([$dataFormatPath, $manifestPath] as $path) {
            if ($path !== null)
                echo "File is ready: {$path}\r\n";
            else
                echo "Creating file {$dataFormatFileName} failed!\r\n";
        }

        return true;
    }
}
