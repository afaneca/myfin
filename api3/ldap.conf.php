<?php
    
    /* LDAP Settings */
    $ldapConfig["host"] = "localhost";
    $ldapConfig["port"] = "389";
    $ldapConfig["mainDn"] = "ou=Enso,dc=localhost,dc=localdomain";
    $ldapConfig["timeout"] = "";
    $ldapConfig["query"] = "(uid=%s)";