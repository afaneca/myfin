<?php

class Notifications
{
    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)
    /**
     *   EXPECTED BEHAVIOUR: Returns a list with all the unsent notifications present in the stack which are destined for a specific user
     *   ARGUMENTS: - 'sessionkey'
     *              - 'authusername' - username of the user making the request
     *   REQUIRED ACTION(S): 'canReceiveNotifications'
     **/
    public static function getNotifications($request, $response, $args)
    {
        error_log("Fetching Notifications...");
        try {
            $key = Input::validate($request->getParam('sessionkey'), Input::$STRING);
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request

            $id_user = UserModel::getUserIdByName($authusername);
            /* 1. autenticação - validação do token */
            if (!self::DEBUG_MODE) {
                AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, false, true);
            }

            /* 2. autorização - validação de permissões */
            if (!EnsoRBACModel::checkUserHasAction($id_user, 'canReceiveNotifications')) {
                throw new RBACDeniedException();
            }

            /* 3. Recuperação dos Dados - todas as notificações destinadas para um user específico e que ainda não tenham sido enviadas */
            $list = NotificationModel::getWhere(["id_user" => $id_user, "has_been_sent" => 0]);

            /* Mark all of them as sent */
            NotificationModel::editWhere([
                "id_user" => $id_user,
            ],
                [
                    "has_been_sent" => 1,
                ]);
            error_log("$authusername fetched " . count($list) . " notification(s).");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, $list);
        } catch (RBACDeniedException $e) {
            error_log("ERRO: $e");
            //EnsoLogsModel::addEnsoLog($authusername, "Tried to get Notifications for user $authusername, authorization failed.", EnsoLogsModel::$ERROR, "Notifications");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        } catch (Exception $e) {
            error_log("ERRO: $e");
            //EnsoLogsModel::addEnsoLog($authusername, "Tried to get Notifications for user $authusername, operation failed.", EnsoLogsModel::$ERROR, "Notifications");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "" . $e);
        }
    }

    public static function sendSampleMailNotification($request, $response, $args)
    {
        if (!self::DEBUG_MODE) {
            return;
        }

        try {
            $authusername = Input::validate($request->getParam('authusername'), Input::$STRING); // User that made the request
            $message = $request->getParam('message'); // message to send
            $id_user = UserModel::getUserIdByName($authusername);

            NotificationModel::sendMailNotification($id_user, $message);
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_OK, "Mensagem Enviada");
        } catch (RBACDeniedException $e) {
            error_log("ERRO: $e");
            //EnsoLogsModel::addEnsoLog($authusername, "Tried to get Notifications for user $authusername, authorization failed.", EnsoLogsModel::$ERROR, "Notifications");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_NOT_AUTHORIZED, "Error: " . $e);
        } catch (Exception $e) {
            error_log("ERRO: $e");
            //EnsoLogsModel::addEnsoLog($authusername, "Tried to get Notifications for user $authusername, operation failed.", EnsoLogsModel::$ERROR, "Notifications");
            return ensoSendResponse($response, EnsoShared::$ENSO_REST_INTERNAL_SERVER_ERROR, "" . $e);
        }
    }

}
$app->get('/notifs/', 'Notifications::getNotifications');
$app->post('/notifs/sendSampleMail/', 'Notifications::sendSampleMailNotification');
