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
}
