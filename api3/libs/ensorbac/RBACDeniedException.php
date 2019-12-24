<?php

class RBACDeniedException extends Exception
{
    // Redefine the exception so message isn't optional
    public function __construct($code = 0, Exception $previous = null)
    {
        if ($code)
        // make sure everything is assigned properly
        parent::__construct("RBAC has denied access to this action.", $code, $previous);
    }

    // custom string representation of object
    public function __toString()
    {
        return __class__ . $this->message . "\n";
    }
}