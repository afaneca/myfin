<?php   
    
    abstract class NotificationTemplate {
        protected $title;
        protected $bodyForMobile;
        protected $bodyForHTMLMail;

        abstract public function getBodyForMobile($args);
        abstract public function getBodyForHTMLMail($args);
    }