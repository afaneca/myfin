<?php
    class VacTypeModel extends Entity{
        protected static $table = "vacation_types";
        //protected static $view = "vac_days_requested_view";
        
        protected static $columns = [
            "id_type",
            "created_timestamp",
            "name",
        ];

    }