<?php

class InputException extends Exception
{
    // Redefine the exception so message isn't optional
    public function __construct($code = 0, Exception $previous = null)
    {
        if ($code)
            // make sure everything is assigned properly
            parent::__construct("An input validation has failed.", $code, $previous);
    }

    // custom string representation of object
    public function __toString()
    {
        return __class__ . $this->message . "\n";
    }
}

class BadInputValidationException extends InputException
{
    // Redefine the exception so message isn't optional
    public function __construct($code = 0, Exception $previous = null)
    {
        // make sure everything is assigned properly
        if ($code)
            parent::__construct($code, $previous);
    }

    // custom string representation of object
    public function __toString()
    {
        return __class__ . $this->message . "\n";
    }
}

class BadValidationTypeException extends InputException
{
    // Redefine the exception so message isn't optional
    public function __construct($message = "Input type was invalid.", $code = 0, Exception $previous = null)
    {
        // make sure everything is assigned properly
        if ($code)
            parent::__construct($code, $previous);
    }

    // custom string representation of object
    public function __toString()
    {
        return __class__ . $this->message . "\n";
    }
}

class EntityCheckFailureException extends InputException
{
    // Redefine the exception so message isn't optional
    public function __construct($code = 0, Exception $previous = null)
    {
        // make sure everything is assigned properly
        if ($code)
            parent::__construct($code, $previous);
    }

    // custom string representation of object
    public function __toString()
    {
        return __class__ . $this->message . "\n";
    }
}

class EntityNonConformantException extends InputException
{
    // Redefine the exception so message isn't optional
    public function __construct($code = 0, Exception $previous = null)
    {
        // make sure everything is assigned properly
        if ($code)
            parent::__construct($code, $previous);
    }

    // custom string representation of object
    public function __toString()
    {
        return __class__ . $this->message . "\n";
    }
}
