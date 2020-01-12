<?php

class AuthenticationException extends Exception
{
    // Redefine the exception so message isn't optional
    public function __construct($who, $code = 0, Exception $previous = null)
    {
        if ($code)
            // make sure everything is assigned properly
            parent::__construct("$who's authentication has expired.", $code, $previous);
    }

    // custom string representation of object
    public function __toString()
    {
        return __class__ . $this->message . "\n";
    }
}
