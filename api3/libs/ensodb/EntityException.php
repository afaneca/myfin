<?php

class EntityException extends Exception
{
    // Redefine the exception so message isn't optional
    public function __construct($code = 0, Exception $previous = null)
    {
        // make sure everything is assigned properly
        if ($code)
            parent::__construct("An entity method has failed to run.", $code, $previous);
    }

    // custom string representation of object
    public function __toString()
    {
        return __class__ . $this->message . "\nCAUSE: " . self::$causes[$this->code] . "\n";
    }
}

class ColumnMissingException extends Exception
{
    // Redefine the exception so message isn't optional
    public function __construct($message = "Not all columns necessary are present.", $code = 0, Exception $previous = null)
    {   
        // make sure everything is assigned properly
        if ($code)
            parent::__construct($message, $code, $previous);
    }

    // custom string representation of object
    public function __toString()
    {
        return __class__ . $this->message . "\nCAUSE: " . self::$causes[$this->code] . "\n";
    }
}

class InexistentAttributeProvidedException extends Exception
{
    // Redefine the exception so message isn't optional
    public function __construct($message = "An attribute was provided but it did not match any belonging to this entity.", $code = 0, Exception $previous = null)
    {
        // make sure everything is assigned properly
        if ($code)
            parent::__construct($message, $code, $previous);
    }

    // custom string representation of object
    public function __toString()
    {
        return __class__ . $this->message . "\nCAUSE: " . self::$causes[$this->code] . "\n";
    }
}