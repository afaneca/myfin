<?php

class Input
{

    public static $STRING = 0,
        $INT = 1,
        $FLOAT = 2,
        $URL = 3,
        $IP = 4,
        $STRICT_STRING = 5,
        $STRICT_URL = 6,
        $EMAIL = 7,
        $MAC = 8,
        $BOOLEAN = 9,
        $REGEXP = 10,
        $ARRAY = 11;


    public static function convertFloatToInteger($floatVal)
    {
        return $floatVal * 100;
    }

    public static function convertIntegerToFloat($intVal)
    {
        return $intVal / 100;
    }

    public static function validate($var, $type = 0, $errorCode = 0, $entityCheck = null, $columnName = null)
    {
        $result = null;

        switch ($type) {
            case self::$STRING:
                $result = filter_var($var, FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);
                break;
            case self::$STRICT_STRING:
                $result = filter_var($var, FILTER_SANITIZE_STRING);
                $result = $result === "" ? false : trim($result);
                break;
            case self::$INT:
                $result = filter_var($var, FILTER_VALIDATE_INT);
                break;
            case self::$FLOAT:
                $result = filter_var($var, FILTER_VALIDATE_FLOAT);
                break;
            case self::$URL:
                $result = filter_var($var, FILTER_VALIDATE_URL);
                break;
            case self::$STRICT_URL:
                $result = filter_var($var, FILTER_VALIDATE_URL, FILTER_FLAG_SCHEME_REQUIRED | FILTER_FLAG_HOST_REQUIRED);
                break;
            case self::$IP:
                $result = filter_var($var, FILTER_VALIDATE_IP);
                break;
            case self::$EMAIL:
                $result = filter_var($var, FILTER_VALIDATE_EMAIL);
                break;
            case self::$MAC:
                $result = filter_var($var, FILTER_VALIDATE_MAC);
                break;
            case self::$REGEXP:
                $result = filter_var($var, FILTER_VALIDATE_REGEXP);
                break;
            case self::$BOOLEAN:
                $result = filter_var($var, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                break;
            case self::$ARRAY:
                $result = $var;
                break;
            default:
                throw new BadValidationTypeException();
        }

        if (($result === false && $type !== self::$BOOLEAN) || $result === NULL)
            throw new BadInputValidationException($errorCode);
        else {
            if ($entityCheck !== null) {

                if (is_subclass_of($entityCheck, 'iEntity')) {
                    if ($exists = call_user_func_array(array($entityCheck, 'exists'), [[$columnName => $result]])) {
                        return $result;
                    } else
                        throw new EntityCheckFailureException($errorCode);
                } else
                    throw new EntityNonConformantException($errorCode);
            } else {
                return $result;
            }
        }
    }
}
