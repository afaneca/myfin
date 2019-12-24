<?php
require_once 'consts.php';
require_once dirname(__FILE__) . '/../../Notifications/VacReqsListingNotification.php';
class VacationModel extends Entity
{
    protected static $table = "vacations";
    protected static $view = "vac_days_requested_view";
    protected static $table_daysRequested = "days_requested";

    protected static $columns = [
        "id_vac",
        "created_timestamp",
        "replied_timestamp",
        "req_status",
        "req_by_id",
        "decided_by",
        "date",
        "id_vac_type",
        "comments",
    ];

    public static function getWhereFromFuture($filters, $attributes = null, $range = null)
    {
        $list = self::getListWhere($filters, $attributes, $range);
        $filteredList = array();

        foreach ($list as $req) {

            if (($req['dates'][0]['date']) > (EnsoShared::now())) {
                array_push($filteredList, $req);
            }

        }

        return $filteredList;
    }

    public static function getPendingCounter($transactional = false)
    {
        $sql = "SELECT count(*) " .
        "FROM \"" . static::$table . "\" " .
        " WHERE \"" . static::$table . "\".req_status = 'Pendente' ";

        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute();

            return $db->fetchAll(PDO::FETCH_COLUMN);
        } catch (PDOException $e) {
            return false;
        }
    }

    //The function returns the no. of business days between two dates and it skips the holidays
    public static function getWorkingDays($startDate, $endDate, $holidays)
    {
        // do strtotime calculations just once
        $endDate = strtotime($endDate);
        $startDate = strtotime($startDate);

        //The total number of days between the two dates. We compute the no. of seconds and divide it to 60*60*24
        //We add one to inlude both dates in the interval.
        $days = ($endDate - $startDate) / 86400 + 1;

        $no_full_weeks = floor($days / 7);
        $no_remaining_days = fmod($days, 7);

        //It will return 1 if it's Monday,.. ,7 for Sunday
        $the_first_day_of_week = date("N", $startDate);
        $the_last_day_of_week = date("N", $endDate);

        //---->The two can be equal in leap years when february has 29 days, the equal sign is added here
        //In the first case the whole interval is within a week, in the second case the interval falls in two weeks.
        if ($the_first_day_of_week <= $the_last_day_of_week) {
            if ($the_first_day_of_week <= 6 && 6 <= $the_last_day_of_week) {
                $no_remaining_days--;
            }

            if ($the_first_day_of_week <= 7 && 7 <= $the_last_day_of_week) {
                $no_remaining_days--;
            }

        } else {
            // (edit by Tokes to fix an edge case where the start day was a Sunday
            // and the end day was NOT a Saturday)

            // the day of the week for start is later than the day of the week for end
            if ($the_first_day_of_week == 7) {
                // if the start date is a Sunday, then we definitely subtract 1 day
                $no_remaining_days--;

                if ($the_last_day_of_week == 6) {
                    // if the end date is a Saturday, then we subtract another day
                    $no_remaining_days--;
                }
            } else {
                // the start date was a Saturday (or earlier), and the end date was (Mon..Fri)
                // so we skip an entire weekend and subtract 2 days
                $no_remaining_days -= 2;
            }
        }

        //The no. of business days is: (number of weeks between the two dates) * (5 working days) + the remainder
        //---->february in none leap years gave a remainder of 0 but still calculated weekends between first and last day, this is one way to fix it
        $workingDays = $no_full_weeks * 5;
        if ($no_remaining_days > 0) {
            $workingDays += $no_remaining_days;
        }

        //We subtract the holidays
        foreach ($holidays as $holiday) {
            $time_stamp = strtotime($holiday);
            //If the holiday doesn't fall in weekend
            if ($startDate <= $time_stamp && $time_stamp <= $endDate && date("N", $time_stamp) != 6 && date("N", $time_stamp) != 7) {
                $workingDays--;
            }

        }

        return $workingDays;
    }

    public static function getAllVacationsByStatus($reqStatus, $transactional = false)
    {
        $lista = array();
        $listaTemp = array();
        $values = array();

        if ($reqStatus == DEFAULT_REQ_STATUS_PENDING) {
            $sql = "SELECT id_vac, created_timestamp, req_status, users.username, comments " .
            "FROM \"" . static::$table . "\" " .
            "LEFT JOIN users ON req_by_id = id_user " .
            " WHERE \"" . static::$table . "\".req_status = :reqStatus " .
            " OR \"" . static::$table . "\".req_status = :reqStatus2" . 
            " ORDER BY id_vac DESC";

            
            $values[':reqStatus'] = $reqStatus;
            $values[':reqStatus2'] = DEFAULT_REQ_STATUS_PENDING_CANCELATION;

        } else {
            $sql = "SELECT id_vac, created_timestamp, req_status, users.username, comments " .
            "FROM \"" . static::$table . "\" " .
            "LEFT JOIN users ON req_by_id = id_user " .
            " WHERE \"" . static::$table . "\".req_status = :reqStatus " . 
            " ORDER BY id_vac DESC";


            $values[':reqStatus'] = $reqStatus;
        }

        try {

            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            $lista = $db->fetchAll();
            foreach ($lista as $key => $req) {
                $listaTemp = self::getWhere(['id_vac' => $req['id_vac']], ['date']);
                $lista[$key]['dates'] = $listaTemp;
            }

            return $lista;
        } catch (PDOException $e) {
            return false;
        }

        $lista = getAllVacations($transactional);

    }

    public static function getAllVacationsByStatusByUser($reqStatus, $username, $transactional = false)
    {
        $lista = array();
        $listaTemp = array();
        $values = array();

        if ($reqStatus == DEFAULT_REQ_STATUS_PENDING) {
            $sql = "SELECT id_vac, created_timestamp, req_status, users.username, comments " .
            "FROM \"" . static::$table . "\" " .
            "LEFT JOIN users ON req_by_id = id_user " .
            " WHERE (\"" . static::$table . "\".req_status = :reqStatus " .
            " OR \"" . static::$table . "\".req_status = :reqStatus2) " .
                " AND username = :username" . 
                " ORDER BY id_vac DESC";


            $values[':reqStatus'] = $reqStatus;
            $values[':reqStatus2'] = DEFAULT_REQ_STATUS_PENDING_CANCELATION;
            $values[':username'] = $username;

        } else {
            $sql = "SELECT id_vac, created_timestamp, req_status, users.username, comments " .
            "FROM \"" . static::$table . "\" " .
            "LEFT JOIN users ON req_by_id = id_user " .
            " WHERE \"" . static::$table . "\".req_status = :reqStatus " .
                " AND username = :username" . 
                " ORDER BY id_vac DESC";

            $values[':reqStatus'] = $reqStatus;
            $values[':username'] = $username;

        }

        try {

            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            $lista = $db->fetchAll();
            foreach ($lista as $key => $req) {
                $listaTemp = self::getWhere(['id_vac' => $req['id_vac']], ['date']);
                $lista[$key]['dates'] = $listaTemp;
            }

            return $lista;
        } catch (PDOException $e) {
            return false;
        }

        $lista = getAllVacations($transactional);

    }

    public static function getAllVacationsFromFuture($transactional = false)
    {
        if (!$lista = self::getAllVacations($transactional)) {
            return false;
        }

        $filteredList = array();

        foreach ($lista as $req) {
            if (($req['dates'][0]['date']) > (EnsoShared::now())) {
                array_push($filteredList, $req);
            }

        }

        return $filteredList;
    }

    public static function getAllVacationsFromFutureByUser($transactional = false)
    {
        if (!$lista = self::getAllVacationsByUser($transactional)) {
            return false;
        }

        $filteredList = array();

        foreach ($lista as $req) {
            if (($req['dates'][0]['date']) > (EnsoShared::now())) {
                array_push($filteredList, $req);
            }

        }

        return $filteredList;
    }

    public static function getAllVacationsFromFutureByStatus($reqStatus, $transactional = false)
    {
        $sql = "SELECT id_vac, created_timestamp, req_status, users.username, comments " .
        "FROM \"" . static::$table . "\" " .
        "LEFT JOIN users ON req_by_id = id_user " .
        " WHERE \"" . static::$table . "\".req_status = :reqStatus " .
        " ORDER BY id_vac DESC";


        try {

            $values = array();
            $values[':reqStatus'] = $reqStatus;
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            $list = $db->fetchAll();

            $filteredList = array();

            foreach ($list as $key => $req) {
                $listaTemp = self::getWhere(['id_vac' => $req['id_vac']], ['date']);
                $list[$key]['dates'] = $listaTemp;
            }

            foreach ($list as $req) {

                if (($req['dates'][0]['date']) > (EnsoShared::now())) {
                    array_push($filteredList, $req);
                }

            }

            return $filteredList;
        } catch (PDOException $e) {
            return false;
        }
    }

    public static function getAllVacationsFromFutureByStatusByUser($reqStatus, $username, $transactional = false)
    {
        $sql = "SELECT id_vac, created_timestamp, req_status, users.username, comments " .
        "FROM \"" . static::$table . "\" " .
        "LEFT JOIN users ON req_by_id = id_user " .
        " WHERE \"" . static::$table . "\".req_status = :reqStatus " .
            " AND username = :username" .
            " ORDER BY id_vac DESC";


        try {

            $values = array();
            $values[':reqStatus'] = $reqStatus;
            $values[':username'] = $username;
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            $list = $db->fetchAll();

            $filteredList = array();

            foreach ($list as $key => $req) {
                $listaTemp = self::getWhere(['id_vac' => $req['id_vac']], ['date']);
                $list[$key]['dates'] = $listaTemp;
            }

            foreach ($list as $req) {

                if (($req['dates'][0]['date']) > (EnsoShared::now())) {
                    array_push($filteredList, $req);
                }

            }

            return $filteredList;
        } catch (PDOException $e) {
            return false;
        }
    }

    /* Structure of the response:
    EXAMPLE:
    {
    "id_vac": 1,
    "created_timestamp": 1545911094,
    "req_status": "1545911094",
    "username": "Teste",
    "id_vac_type": null,
    "dates": [
    {
    "date": 1545911094
    },
    {
    "date": 1545911104
    }
    ]
    }
     */
    public static function getAllVacations($transactional = false)
    {
        $lista = array();
        $listaTemp = array();

        $sql = "SELECT id_vac, created_timestamp, req_status, users.username, id_vac_type, comments " .
        "FROM \"" . static::$table . "\" " .
            " LEFT JOIN users ON req_by_id = id_user " . 
            " ORDER BY id_vac DESC";

        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute();

            $lista = $db->fetchAll();
            //if(count($lista) > 0) $lista = $lista[0];
            foreach ($lista as $key => $req) {
                $listaTemp = self::getWhere(['id_vac' => $req['id_vac']], ['date']);
                $lista[$key]['dates'] = $listaTemp;
            }
            /* Add to each item in the array a sub-array containing all the specific days associated with a vac request */

            return $lista;
        } catch (PDOException $e) {
            return false;
        }
    }

    public static function getAllVacationsByUser($username, $transactional = false)
    {
        $lista = array();
        $listaTemp = array();

        $sql = " SELECT id_vac, created_timestamp, req_status, users.username, id_vac_type, comments " .
        " FROM \"" . static::$table . "\" " .
            " LEFT JOIN users ON req_by_id = id_user " .
            " WHERE username = :username" .
            " ORDER BY id_vac DESC";


        try {
            $values = array();
            $values[':username'] = $username;

            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            $lista = $db->fetchAll();
            //if(count($lista) > 0) $lista = $lista[0];
            foreach ($lista as $key => $req) {
                $listaTemp = self::getWhere(['id_vac' => $req['id_vac']], ['date']);
                $lista[$key]['dates'] = $listaTemp;
            }
            /* Add to each item in the array a sub-array containing all the specific days associated with a vac request */

            return $lista;
        } catch (PDOException $e) {
            return false;
        }
    }

    public static function getAllApprovedVacationsForUser($id_user, $transactional = false)
    {
        $lista = array();
        $listaTemp = array();

        $sql = "SELECT id_vac, created_timestamp, req_status, users.username, id_vac_type, comments " .
        " FROM \"" . static::$table . "\" " .
            " LEFT JOIN users ON req_by_id = id_user " .
            " WHERE req_by_id = :idUser" .
            " AND req_status = 'Aprovado'" .
            " ORDER BY id_vac DESC";

        $values = array();
        $values[':idUser'] = $id_user;

        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            $lista = $db->fetchAll();
            //if(count($lista) > 0) $lista = $lista[0];
            foreach ($lista as $key => $req) {
                $listaTemp = self::getWhere(['id_vac' => $req['id_vac']], ['date']);
                $lista[$key]['dates'] = $listaTemp;
            }
            /* Add to each item in the array a sub-array containing all the specific days associated with a vac request */

            return $lista;
        } catch (PDOException $e) {
            return false;
        }
    }

    public static function getAllApprovedVacationDaysForUserWithRanges($id_user, $rangeStart, $rangeEnd, $transactional = false)
    {
        $lista = array();
        $listaTemp = array();

        $sql = "SELECT id_vac" .
        " FROM \"" . static::$table . "\" " .
            " LEFT JOIN users ON req_by_id = id_user " .
            " WHERE req_by_id = :idUser" .
            " AND req_status = 'Aprovado'" .
            " AND id_vac_type ISNULL" . 
            " ORDER BY id_vac DESC";


        $values = array();
        $values[':idUser'] = $id_user;

        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            /* Add to each item in the array a sub-array containing all the specific days associated with a vac request */
            $lista = $db->fetchAll();
            //if(count($lista) > 0) $lista = $lista[0];
            foreach ($lista as $key => $req) {
                $vacsArr = static::getVacDaysForVac($req['id_vac'], $rangeStart, $rangeEnd, $transactional);
                //$vacsArr = self::getWhere(['id_vac' => $req['id_vac'], 'date' => ["<=", $rangeEnd], 'date' => [">=", $rangeStart]],['date']);
                array_push($listaTemp, $vacsArr);
                //$listaTemp = self::getWhere(['id_vac' => $req['id_vac'], 'date' => ["<", $rangeEnd], 'date' => [">", $rangeStart]],['date']);
                //$lista[$key]['dates'] = $listaTemp;
            }

            return $listaTemp;
        } catch (PDOException $e) {
            return false;
        }
    }

    public static function getVacDaysForVac($id_vac, $rangeStart, $rangeEnd, $transactional = false)
    {
        $sql = "SELECT date" .
        " FROM " . self::$view .
            " WHERE date <= :dateEnd" .
            " AND date >= :dateStart" .
            " AND id_vac = :idVac" .
            " ORDER BY date ASC";

        $values = array();
        $values[':dateEnd'] = $rangeEnd;
        $values[':dateStart'] = $rangeStart;
        $values[':idVac'] = $id_vac;

        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            return $db->fetchAll();
        } catch (PDOException $e) {
            return false;
        }
    }

    public static function getUserVacDays($id_user, $transactional = false)
    {
        $sql = "SELECT days, days_remaining, year FROM VAC_DAYS " .
            "WHERE id_user = :idUser";

        try {
            $values = array();
            $values[':idUser'] = $id_user;
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            return $db->fetchAll();
        } catch (PDOException $e) {
            return false;
        }
    }

    public static function getListWhere($filters, $attributes = null, $range = null)
    {
        $list = self::getWhereFromTable($filters, $attributes, $range);

        foreach ($list as $key => $req) {
            $listaTemp = static::getWhere(['id_vac' => $req['id_vac']], ['date']);
            $list[$key]['dates'] = $listaTemp;
        }

        return $list;
    }

    /* Inserts vac days in association with a specific vac_id */
    public static function insertVacDays($vac_id, $vacDays, $transactional = false)
    {
        //$vac_id = $vac_id["id_vac"];

        $sql = "INSERT INTO " . static::$table_daysRequested . "(id_vac, date) VALUES";

        foreach ($vacDays as $day) {
            $sql .= " ($vac_id, $day) ,";
        }

        // remove last comma
        $sql = rtrim($sql, ",");

        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute();

            return true;
        } catch (PDOException $e) {
            print_r($e);
            return false;
        }
    }

    public static function deleteAllVacDays($vac_id, $transactional = false)
    {
        $sql = "DELETE FROM " . static::$table_daysRequested .
            " WHERE id_vac = :id_vac";

        $values = array();
        $values[':id_vac'] = $vac_id;

        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            return true;
        } catch (PDOException $e) {
            print_r($e);
            return false;
        }
    }

    public static function getPendingVacsAndDays($userId, $transactional = false)
    {
        $sql = "SELECT count(*), count(DISTINCT id_vac)" .
        " FROM " . self::$view .
            " WHERE req_by_id = :userId
                  AND req_status = 'Pendente'";

        $values = array();
        $values[':userId'] = $userId;

        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            $queryResult = $db->fetch(PDO::FETCH_BOTH);
            /* Ex:
            Array
            (
            [count] => 11
            [0] => 25  // Days Requested
            [1] => 11 //  Vac Requests
            )
             */
            $list['daysRequested'] = $queryResult[0];
            $list['vacRequests'] = $queryResult[1];

            return $list;
        } catch (PDOException $e) {
            print_r($e);
            return false;
        }

    }

    public static function getApprovedVacsAndDays($userId, $transactional = false)
    {
        $sql = "SELECT count(*), count(DISTINCT id_vac)" .
        " FROM " . self::$view .
            " WHERE req_by_id = :userId
                  AND req_status = 'Aprovado'";

        $values = array();
        $values[':userId'] = $userId;

        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            $queryResult = $db->fetch(PDO::FETCH_BOTH);
            /* Ex:
            Array
            (
            [count] => 11
            [0] => 25  // Days Requested
            [1] => 11 //  Vac Requests
            )
             */
            $list['daysRequested'] = $queryResult[0];
            $list['vacRequests'] = $queryResult[1];

            return $list;
        } catch (PDOException $e) {
            print_r($e);
            return false;
        }

    }

    public static function getCountVacReqsForMonth($userId, $month, $year, $transactional = false)
    {
        $begginingOfMonth = mktime(0, 0, 0, $month, 1, $year);

        $endOfMonth = mktime(23, 59, 59, $month, cal_days_in_month(CAL_GREGORIAN, $month, $year), $year);

        $sql = "SELECT req_status" .
        " FROM " . self::$view .
            " WHERE date > :monthStart
                      AND date < :monthEnd
                      AND req_status NOT LIKE 'Cancelado'";

        $values = array();
        $values[':monthStart'] = $begginingOfMonth;
        $values[':monthEnd'] = $endOfMonth;

        try {
            $db = new EnsoDB($transactional);
            $db->prepare($sql);
            $db->execute($values);

            $queryResult = $db->fetchAll();

            foreach ($queryResult as $i => $item) {

            }
            print_r($queryResult);
            die();
            $list['Aprovado'] = $queryResult[0];
            $list['vacRequests'] = $queryResult[1];

            return $list;
        } catch (PDOException $e) {
            print_r($e);
            return false;
        }

    }

    public static function getWhere($filters, $attributes = null, $range = null)
    {
        $db = new EnsoDB();
        $values = array();

        $sql = "SELECT ";

        if ($attributes === null) {
            $sql .= "* ";
        } else {
            foreach ($attributes as $dbName) {
                if (!in_array($dbName, static::$columns)) {
                    throw new InexistentAttributeProvidedException();
                } else {
                    $sql .= $dbName . ", ";
                }
            }

            $sql = substr($sql, 0, -2);
        }

        if (static::$view === null) {
            $sql .= " FROM \"" . static::$table . "\" ";
        } else {
            $sql .= " FROM \"" . static::$view . "\" ";
        }

        $sql .= self::formulateWhere($filters, $values);

        if (!empty($range)) {
            $sql .= " LIMIT " . $range[0] . ", " . $range[1];
        }

        $sql .= " ORDER BY date ASC ";
        $db->prepare($sql);

        $db->execute($values);

        return $db->fetchAll();

    }

    public static function formulateWhere($filters, &$values)
    {
        $sql = "";

        if (!empty($filters)) {
            $sql .= " WHERE ";

            foreach ($filters as $dbName => $value) {
                if (!in_array($dbName, static::$columns)) {
                    throw new InexistentAttributeProvidedException();
                } else {

                    $operator = '';

                    if (is_array($value)) {
                        if (count($value) > 1) {
                            $operator = $value[0];
                            $value = $value[1];
                        } else {
                            $value = $value[0];
                            if ($value === null) {
                                $operator = "IS";
                            } else {
                                $operator = "=";
                            }

                        }
                    } else {
                        if ($value === null) {
                            $operator = "IS";
                        } else {
                            $operator = "=";
                        }

                    }

                    $sql .= " \"$dbName\" $operator :WHERE$dbName AND ";
                    $values[':WHERE' . $dbName] = $value;
                }
            }

            $sql = substr($sql, 0, -4);
        }

        return $sql;
    }

    public static function fillExportVacEntriesMailBody($month, $year, $users)
    {
        $html = "";
        $vacsList = "";
        foreach ($users as $i => $user) {
            $hasVacs = false;
            $vacsList = "";
            $vacsList .= "<p class='username'>" . $users[$i]['username'] . "</p>";
            

            foreach ($users[$i]['vacs'] as $v => $vac) {
                $vacsList .= "<ul>";
                foreach ($users[$i]['vacs'][$v] as $v1 => $vac1) {
                    if ($users[$i]['vacs'][$v][$v1]) {
                        $vacsList .= "<li>" . gmdate("d-m-Y", $users[$i]['vacs'][$v][$v1]['date']) . "</li>";
                        $hasVacs = true;
                    }

                }
                $vacsList .= "</ul>";
            }
            if ($hasVacs) {
                $html .= $vacsList;
            }

        }

        return $html;
    }

    public static function exportVacEntries($month, $year, $email, $transactional = false)
    {
        $rangeStart = strtotime($year . "/" . $month . "/1"); // first day of the month
        $rangeEnd = strtotime($year . "/" . $month . "/" . cal_days_in_month(CAL_GREGORIAN, $month, $year)); // last day of the month

        // Get list of all users
        $users = UserModel::getAll(['id_user', 'username']);
        // For each user, append a list of approved dates for the specified range
        foreach ($users as $i => $user) {
            $users[$i]['vacs'] = array();
            $users[$i]['vacs'] = static::getAllApprovedVacationDaysForUserWithRanges($users[$i]['id_user'], $rangeStart, $rangeEnd, $transactional);
        }

        $emailTxt = static::fillExportVacEntriesMailBody($month, $year, $users);
        $template = new VacReqsListingNotification();

        $HTMLMessage = $template->getBodyForHTMLMail(['VACS_LIST' => $emailTxt]);

        Ensomail::sendHTMLMail('noreply@enso-origins.com', $email, 'Listagem de Férias - ' . $month . '/' . $year, $HTMLMessage);

    }

}
