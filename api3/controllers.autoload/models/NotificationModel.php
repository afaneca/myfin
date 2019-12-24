<?php
require_once 'consts.php';
require_once dirname(__FILE__) . '/../../Notifications/NewVacRequestNotification.php';
require_once dirname(__FILE__) . '/../../Notifications/VacReqStatusUpdatedNotification.php';
require_once dirname(__FILE__) . '/../../Notifications/NewTaskNotification.php';
require_once dirname(__FILE__) . '/../../Notifications/NewVacReqCancelationRequestNotification.php';

class NotificationModel extends Entity
{
    protected static $table = "notifications";
    // protected static $view = 'UserInfo';

    protected static $columns = [
        "id_notif",
        "id_user",
        "has_been_sent",
        "inserted_timestamp",
        "message",
    ];

    public static function sendMailNotification($id_user, $message)
    {

        $from = "noreply@enso-origins.com";
        $to = UserModel::getWhere(['id_user' => $id_user], ['email'])[0]['email'];

        $currDate = date("d/m/Y");
        $subject = "ENSO LIFE - tem uma nova notificação :) ($currDate)";

        error_log("Sending email $from -> $to ...");
        if (Ensomail::sendHTMLMail($from, $to, $subject, $message)) {
            error_log("Message sent.");
        } else {
            error_log("Message NOT sent.");
        }

    }

    private static function getNotificationTemplate($message)
    {
        switch ($message) {
            case NOTIF_NEW_VAC_REQ_ADDED:
                return new NewVacRequestNotification();
            case NOTIF_VAC_REQ_STATUS_UPDATED:
                return new VacReqStatusUpdatedNotification();
            case NOTIF_NEW_TASK_ADDED:
                return new NewTaskNotification();
            case NOTIF_VAC_REQ_CANCELATION_REQUEST:
                return new NewVacReqCancelationRequestNotification();
            default:
                return null;
        }
    }

    public static function addNewNotification($id_user, $message, $args, $transactional = false)
    {
        $template = self::getNotificationTemplate($message);
        if (!$template) {
            return;
        }

        $HTMLMessage = $template->getBodyForHTMLMail($args);
        $MobileMessage = $template->getBodyForMobile($args);

        self::sendMailNotification($id_user, $HTMLMessage);

        $db = new EnsoDB($transactional);

        $sql = "INSERT INTO \"" . static::$table . "\" ("
            . "\"id_user\", \"message\", \"inserted_timestamp\")"
            . " VALUES (:user, :message, :inserted_timestamp)";

        $values = array();
        $values[':user'] = $id_user;
        $values[':message'] = $MobileMessage;
        $values['inserted_timestamp'] = time();

        try {
            $db->prepare($sql);
            $db->execute($values);
            return true;
        } catch (Exception $e) {
            return $e;
        }
    }

}
