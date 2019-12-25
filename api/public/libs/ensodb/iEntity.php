<?php 

interface iEntity{
    public static function exists($filters);
    
    public static function insert($attributes, bool $transactional = false);
    
    public static function editWhere($filters, $newAttributes, bool $transactional = false);

    public static function delete($filters, bool $transactional = false);
    
    public static function getWhere($filters, $attributes = null, $range = null);
    
    public static function getAll($attributes = null, $range = null);
}
