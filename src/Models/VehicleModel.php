<?php

namespace TrafQuiz\Models;

class VehicleModel {
    private static $file = __DIR__ . '/../data/vehicles.json';

    private static function readData() {
        if (!file_exists(self::$file)) return [];
        $json = file_get_contents(self::$file);
        $data = json_decode($json, true);
        return is_array($data) ? $data : [];
    }

    private static function writeData(array $data) {
        $dir = dirname(self::$file);
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        file_put_contents(self::$file, json_encode(array_values($data), JSON_PRETTY_PRINT));
    }

    public static function all() {
        return self::readData();
    }

    public static function find($id) {
        $items = self::readData();
        foreach ($items as $it) {
            if ((int)$it['id'] === (int)$id) return $it;
        }
        return null;
    }

    public static function add(array $payload) {
        $items = self::readData();
        $max = 0;
        foreach ($items as $it) $max = max($max, (int)$it['id']);
        $payload['id'] = $max + 1;
        $payload['createdAt'] = date('c');
        $items[] = $payload;
        self::writeData($items);
        return $payload;
    }

    public static function update($id, array $payload) {
        $items = self::readData();
        $found = false;
        foreach ($items as &$it) {
            if ((int)$it['id'] === (int)$id) {
                $it = array_merge($it, $payload);
                $it['updatedAt'] = date('c');
                $found = true;
                break;
            }
        }
        if ($found) self::writeData($items);
        return $found;
    }

    public static function delete($id) {
        $items = self::readData();
        $before = count($items);
        $items = array_values(array_filter($items, function($it) use ($id) { return (int)$it['id'] !== (int)$id; }));
        if (count($items) !== $before) {
            self::writeData($items);
            return true;
        }
        return false;
    }
}
