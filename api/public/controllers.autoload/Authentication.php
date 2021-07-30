<?php
require_once 'consts.php';

class Authentication
{
    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)


    /**
     *   EXPECTED BEHAVIOUR: Attempts to perform login (returns Cod. 202 if it was successfull)
     *   ARGUMENTS: - 'username'
     *              - 'password'
     *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
     *   REQUIRED ACTION(S): none
     **/
    public static function attemptLogin($request, $response, $args)
    {
        try {
            $username = Input::validate($request->getParsedBody()["username"], Input::$STRING);
            $password = Input::validate($request->getParsedBody()["password"], Input::$STRING);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN);
            } else {
                $mobile = false;
            }

            AuthenticationModel::performCredentialCheck($username, $password);

            //Generate Session Key
            $auth_key = AuthenticationModel::generateNewsessionkeyForUser($username, $mobile);


            $db = new EnsoDB(true);
            $db->getDB()->beginTransaction();
            // Check if user already has default role   

            $trustlimit = UserModel::getWhere(["username" => $username], ["trustlimit"])[0]["trustlimit"];

            $userID = UserModel::getUserIdByName($username, true);
            $accountsArr = AccountModel::getAllAccountsForUserWithAmounts($userID); //AccountModel::getWhere(["users_user_id" => $userID]);


            $db->getDB()->commit();


            return sendResponse($response, EnsoShared::$REST_OK, ["sessionkey" => $auth_key, "username" => $username, "trustlimit" => $trustlimit, "accounts" => $accountsArr]);
        } catch (InputException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, "");
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, "");
        } catch (Exception $e) {
            //EnsoDebug::var_error_log($e);
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, "");
        }
    }

    /**
     *   EXPECTED BEHAVIOUR: Checks if sessionkey is valid. (Returns cod. 202 if so, plus an array of user data (sessionkey, username and all of its actions)).
     *   ARGUMENTS: - 'sessionkey'
     *              - 'authusername' - username of the user making the request
     *              - 'mobile' (OPTIONAL) - does the request come from a mobile device?
     *   REQUIRED ACTION(S): none
     **/
    public static function checkValidity($request, $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN);
            } else {
                $mobile = false;
            }


            if ($request->getParsedBody() != null && array_key_exists('renewValidity', $request->getParsedBody())) {
                $renewValidity = (int)Input::validate($request->getParsedBody()['renewValidity'], Input::$BOOLEAN);
            } else {
                $renewValidity = true;
            }


            if (!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, $renewValidity, $mobile);

            $trustlimit = UserModel::getWhere(["username" => $authusername], ["trustlimit"])[0]["trustlimit"];

            return sendResponse($response, EnsoShared::$REST_OK, ["sessionkey" => $key, "username" => $authusername, "trustlimit" => $trustlimit]);
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, "3");
        }
    }
}

$app->post('/auth/', 'Authentication::attemptLogin');
$app->post('/validity/', 'Authentication::checkValidity');
