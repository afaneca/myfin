<?php

class Utils
{

    public static function createDir($newDirName)
    {
        try {
            mkdir($newDirName, 0700);
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    public static function removeDir($removeDirName)
    {
        if (file_exists($removeDirName)) {
            self::removeDirFiles($removeDirName);
            rmdir($removeDirName);
        }
    }

    public static function removeDirFiles($removeDirName)
    {
        $files = scandir($removeDirName);
        foreach ($files as $key => $value) {
            if ($value != "." && $value != "..") {
                $path = realpath($removeDirName . DIRECTORY_SEPARATOR . $value);
                if (!is_dir($path)) {
                    $results[] = $path;
                    unlink($path);
                } else if ($value != "." && $value != "..") {
                    self::removeDirFiles($path);
                    rmdir($path);
                }
            }
        }
    }

    public static function getDirContents($dir, $parentIcObject)
    {
        $files = scandir($dir);
        foreach ($files as $key => $value) {
            if ($value != "." && $value != "..") {
                $path = realpath($dir . DIRECTORY_SEPARATOR . $value);
                if (!is_dir($path)) {
                    $child = new ICObject(basename($path), ICObject::$ICOBJECT_TYPE_FSPOINT, 0, file_get_contents($path));
                } else if ($value != "." && $value != "..") {
                    $child = new ICObject(basename($path), ICObject::$ICOBJECT_TYPE_NAKED);
                    self::getDirContents($path, $child);
                }
                $parentIcObject->addChild($child);
            }
        }
        return $parentIcObject;
    }

    public static function setPublicFileChecker()
    {
        file_put_contents(UPDATE_CHECK_TEMP_FILE, "");
    }

    public static function getRandomIcon()
    {
        $arr = ["🍎", "🎁", "🏡", "🛒", "🛍️", "🦮", "🍿", "🎉"];

        return $arr[array_rand($arr, 1)];
    }

    public static function getRandomColorGradient()
    {
        $arr = ["red-gradient", "blue-gradient", "green-gradient",
            "orange-gradient", "dark-gray-gradient", "purple-gradient",
            "pink-gradient", "dark-blue-gradient", "brown-gradient",
            "light-green-gradient", "dark-red-gradient", "yellow-gradient",
            "roseanna-gradient", "mauve-gradient", "lush-gradient",
            "pale-wood-gradient", "aubergine-gradient", "orange-coral-gradient",
            "decent-gradient", "dusk-gradient"];

        return $arr[array_rand($arr, 1)];
    }

    public static function checkWithProbability($probability = 0.1, $length = 10000)
    {
        $test = mt_rand(1, $length);
        return $test <= $probability * $length;
    }

    public static function getRandomDateTimestamp($startTimestamp = 0, $endTimestamp = PHP_INT_MAX)
    {
        return rand($startTimestamp, $endTimestamp);
    }
}
