<?php

use App\Application\Actions\User\ListUsersAction;
use App\Application\Actions\User\ViewUserAction;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Slim\Interfaces\RouteCollectorProxyInterface as Group;

require_once 'consts.php';

class Categories
{
    const DEBUG_MODE = false; // USE ONLY WHEN DEBUGGING THIS SPECIFIC CONTROLLER (this skips sessionkey validation)

    public static function getAllCategoriesForUser(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN);
            } else {
                $mobile = false;
            }

            if (array_key_exists('type', $request->getQueryParams())) {
                $type = Input::validate($request->getQueryParams()['type'], Input::$STRICT_STRING);
            }


            /* Auth - token validation */
            if (!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* Execute Operations */
            /* $db = new EnsoDB(true);
            
            $db->getDB()->beginTransaction(); */

            /* echo "1";
            die(); */
            $userID = UserModel::getUserIdByName($authusername, false);

            if (isset($type)) {
                $catsArr = CategoryModel::getWhere(
                    ["users_user_id" => $userID, "type" => $type],
                    ["category_id", "name", "type", "description", "color_gradient", "status"]
                );
            } else {
                $catsArr = CategoryModel::getWhere(
                    ["users_user_id" => $userID],
                    ["category_id", "name", "type", "description", "color_gradient", "status"]
                );
            }


            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, $catsArr);
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function addCategory(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN);
            } else {
                $mobile = false;
            }


            $name = Input::validate($request->getParsedBody()['name'], Input::$STRING);
            $description = Input::validate($request->getParsedBody()['description'], Input::$STRING);

            $colorGradient = Input::validate($request->getParsedBody()['color_gradient'], Input::$STRICT_STRING);

            if (array_key_exists('type', $request->getParsedBody())) {
                $type = Input::validate($request->getParsedBody()['type'], Input::$STRICT_STRING);
            } else {
                $type = "M"; // MIXED
            }

            if (array_key_exists('status', $request->getParsedBody())) {
                $status = Input::validate($request->getParsedBody()['status'], Input::$STRICT_STRING);
                if ($status != DEFAULT_CATEGORY_ACTIVE_STATUS && $status != DEFAULT_CATEGORY_INACTIVE_STATUS) {
                    $status = DEFAULT_CATEGORY_ACTIVE_STATUS;
                }
            } else {
                $status = DEFAULT_CATEGORY_ACTIVE_STATUS;
            }


            /* Auth - token validation */
            if (!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* Execute Operations */
            /* $db = new EnsoDB(true);
            
            $db->getDB()->beginTransaction(); */

            /* echo "1";
            die(); */
            $userID = UserModel::getUserIdByName($authusername, false);

            CategoryModel::insert([
                "name" => $name,
                "type" => $type,
                "description" => $description,
                "users_user_id" => $userID,
                "color_gradient" => $colorGradient,
                "status" => $status
            ], false);


            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, "New category added!");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function removeCategory(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 2);
            } else {
                $mobile = false;
            }


            $categoryID = Input::validate($request->getParsedBody()['category_id'], Input::$INT, 3);

            /* Auth - token validation */
            if (!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* Execute Operations */
            /* $db = new EnsoDB(true);
            
            $db->getDB()->beginTransaction(); */

            /* echo "1";
            die(); */
            $userID = UserModel::getUserIdByName($authusername, false);


            BudgetHasCategoriesModel::delete([
                "categories_category_id" => $categoryID,
            ], false);

            CategoryModel::delete([
                "category_id" => $categoryID,
                "users_user_id" => $userID
            ], false);


            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, "Category Removed!");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }

    public static function editCategory(Request $request, Response $response, $args)
    {
        try {
            $key = Input::validate($request->getHeaderLine('sessionkey'), Input::$STRING, 0);
            $authusername = Input::validate($request->getHeaderLine('authusername'), Input::$STRING, 1);

            if ($request->getHeaderLine('mobile') != null) {
                $mobile = (int)Input::validate($request->getHeaderLine('mobile'), Input::$BOOLEAN, 2);
            } else {
                $mobile = false;
            }


            $categoryID = Input::validate($request->getParsedBody()['category_id'], Input::$INT, 3);
            $newName = Input::validate($request->getParsedBody()['new_name'], Input::$STRING, 4);
            $newDescription = Input::validate($request->getParsedBody()['new_description'], Input::$STRING, 5);

            $newColorGradient = Input::validate($request->getParsedBody()["new_color_gradient"], Input::$STRICT_STRING, 6);
            //$newType = Input::validate($request->getParsedBody()['new_type'], Input::$STRING, 5);

            if (array_key_exists('new_type', $request->getParsedBody())) {
                $newType = Input::validate($request->getParsedBody()['new_type'], Input::$STRING);
            } else {
                $newType = "M"; // MIXED
            }

            if (array_key_exists('new_status', $request->getParsedBody())) {
                $status = Input::validate($request->getParsedBody()['new_status'], Input::$STRING);
                if ($status != DEFAULT_CATEGORY_ACTIVE_STATUS && $status != DEFAULT_CATEGORY_INACTIVE_STATUS) {
                    $status = DEFAULT_CATEGORY_ACTIVE_STATUS;
                }
            } else {
                $status = DEFAULT_CATEGORY_ACTIVE_STATUS;
            }

            /* Auth - token validation */
            if (!self::DEBUG_MODE) AuthenticationModel::checkIfsessionkeyIsValid($key, $authusername, true, $mobile);

            /* Execute Operations */
            /* $db = new EnsoDB(true);
            
            $db->getDB()->beginTransaction(); */

            /* echo "1";
            die(); */
            $userID = UserModel::getUserIdByName($authusername, false);

            CategoryModel::editWhere(
                [
                    "category_id" => $categoryID,
                    "users_user_id" => $userID
                ],
                [
                    "name" => $newName,
                    "description" => $newDescription,
                    "type" => $newType,
                    "color_gradient" => $newColorGradient,
                    "status" => $status
                ],
                false
            );


            /* $db->getDB()->commit(); */

            return sendResponse($response, EnsoShared::$REST_OK, "Category Updated!");
        } catch (BadInputValidationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_ACCEPTABLE, $e->getCode());
        } catch (AuthenticationException $e) {
            return sendResponse($response, EnsoShared::$REST_NOT_AUTHORIZED, $e->getCode());
        } catch (Exception $e) {
            return sendResponse($response, EnsoShared::$REST_INTERNAL_SERVER_ERROR, $e);
        }
    }
}

$app->get('/cats/', 'Categories::getAllCategoriesForUser');
$app->post('/cats/', 'Categories::addCategory');
$app->delete('/cats/', 'Categories::removeCategory');
$app->put('/cats/', 'Categories::editCategory');
