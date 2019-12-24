<?php

class EnsoRBACModel {
	
	private static $ENSO_RBAC_VERSION = "5.0.0";
	
	/**
	 * Obter listas de Roles de um determinado utilizador
	 *
	 * @param $userId - Id do utilizador do qual vamos obter a lista de Roles
	 *
	 * @return FALSE - Caso não existam quaisquer roles associadas ao utilizador especificado
	 * @return Lista de Roles - array(array('rolename'=>rolename,'id_role'=>id_role))
	 *
	 * */
	private static $rolesTable = 'roles';
	private static $actionsTable = 'actions';
	private static $joinUserTable = 'user_has_roles';
	private static $joinActionTable = 'role_has_actions';
	
	public static function getUserRoles($userId){
		
		$sql = "SELECT \"" . self::$rolesTable . "\".name " .
				"FROM \"" . self::$rolesTable . "\", \"" . self::$joinUserTable . "\" " .
				"WHERE \"" . self::$joinUserTable . "\".\"id_user\" = :userid " .
				"AND \"" . self::$joinUserTable . "\".\"id_role\" = \"" . self::$rolesTable . "\".\"id_role\"";
		
		$values = array(
			':userid' => $userId
		);
		
		try{
			$db = new EnsoDB();
			$db->prepare($sql);
			$db->execute($values);
			 
			$row = $db->fetchAll();
			
			//caso exista construir o array com os valores a retornar;
			$ret = array();
			foreach ($row as $role){
				array_push($ret, $role['name']); //name
			}
			
			
			//retorno do valor
			return $ret;
		}catch (PDOException $e){
			return false;
		}
	}

	/**
	 * Função para adicionar uma role a um user
	 * 
	 * @param int $userId
	 * @param int $roleId
	 * @return boolean false se não conseguiu adicionar role ao utilizador, true se conseguiu.
	 * */
	public static function addRoleToUser($userId, $roleId){
	
	
		$sql = "INSERT INTO \"" . self::$joinUserTable . "\" (\"id_user\", \"id_role\") " .
				" VALUES (:id_user, :id_role);";



		$values = array();
		//$values[':inserted_timestamp'] = EnsoShared::now(); // save the placeholder
		$values[':id_role'] = $roleId; // save the placeholder
		$values[':id_user'] = $userId; // save the placeholder

		try{
			$db = new EnsoDB();
			$db->prepare($sql);
			$db->execute($values);
		
			return true;
		}catch (PDOException $e){
			return false;
		}
	}


	/**
	 * Verificar se um determinado user pode executar uma determinada action
	 *
	 * @param $userId - Id do User
	 * @param $action_name - Nome da Action
	 *
	 * @return FALSE se o userid não existe ou se o mesmo existe e não detem nenhuma role que permita executar a action
	 * TRUE caso a action possa ser executada pelo user;
	 *
	 * */
	public static function checkUserHasAction($userId, $action_name){
		$user_roles=self::getUserRoles($userId); // RETURN NAME
		foreach ($user_roles as $role){
			if (self::checkRoleHasAction($role, $action_name))
				return TRUE;
		}
		return FALSE;
	}
	
	
	/**
	 * Verificar se um determinado role pode executar uma determinada action
	 *
	 * @param $roleName - Nome do role
	 * @param $action_name - Nome da Action
	 *
	 * @return FALSE se o role não detem permissões sobre a action pedida
	 * TRUE caso a action possa ser executada pelo role;
	 *
	 * */
	 static function checkRoleHasAction($role, $action_name){
		$roleId = self::getRoleIdByName($role); 

		$sql = "SELECT \"id_role\" " .
				"FROM \"" . self::$joinActionTable . "\" " .
				"WHERE \"id_role\" = :role " .
				"AND  \"action_name\" = '" . $action_name . "'";

		$values = array();
		$values['role'] = $roleId;
		//$values['action_name'] = $action_name;

		try{
			$db = new EnsoDB();
			$db->prepare($sql);
			$db->execute($values);
		
			$row = $db->fetchAll();
			
			if (sizeof($row) != 1)
				return false;
			
			return true;
		}catch (PDOException $e){
			return false;
		}
	}
	

	/**
	 * Função para retornar o nome associado a um Role ID
	 *
	 * @param int $Role Id
	 * @return false se a operação não foi executada com sucesso;
	 * @return Nome do Row se foi
	 * */
	public static function getRoleById($id){
		$sql = "SELECT name" . 
				"FROM \"" . self::$rolesTables . "\" " .
				"WHERE \"" . self::$rolesTables . "\".id_role = :id_userRole";
				
		$values = array();
		$values['id_userRole'] = $id;


		try{
			$db = new EnsoDB();
			$db->prepare($sql);
			$db->execute($values);

			return $db->fetchAll();
		}catch (PDOException $e){
			return false;
		}
	}

	/**
	 * Função para retornar o nome associado a um Role ID
	 *
	 * @param int $Role Id
	 * @return false se a operação não foi executada com sucesso;
	 * @return Nome do Row se foi
	 * */
	public static function getRoleIdByName($name){
		$sql = "SELECT \"id_role\" " . 
				"FROM \"" . self::$rolesTable . "\" " .
				"WHERE \"" . self::$rolesTable . "\".\"name\" = :name";
			
		$values = array();
		$values[':name'] = $name;
		


		try{
			$db = new EnsoDB();
			$db->prepare($sql);
			$db->execute($values);
			
			return intval($db->fetchAll(PDO::FETCH_ASSOC)[0]['id_role']); // O resultado tem que ser convertido em int antes de retornar (por default, é String)
		}catch (PDOException $e){
			return false;
		}
	}
	
	
	/**
	 * Função para remover uma role a um user
	 *
	 * @param int $userId
	 * @param int $roleId
	 * @return boolean false se não conseguiu remover role ao utilizador, true se conseguiu.
	 * */
	public static function removeRoleFromUser($userId, $roleName) {
		$roleId = self::getRoleIdByName($roleName);
		//$roleId = 1;
		$sql = "DELETE FROM \"" . self::$joinUserTable ."\" " .
				"WHERE \"id_user\" = :id_user AND \"id_role\" = :id_userRole";
	
		$values = array();
		$values[':id_userRole'] = $roleId; // save the placeholder
		$values[':id_user'] = $userId; // save the placeholder
	
		
		try{
			$db = new EnsoDB();
			$db->prepare($sql);
			$db->execute($values);

			return true;
		}catch (PDOException $e){
			return false;
		}
	}
	

	/**
	 * Função para obter todas as ações possiveis ao utilizador
	 *
	 * @param int $userId
	 * @return array com ações possiveis ou false se houver falha na execução, FALSE se não foi possivel executar a query
	 * */
	public static function getAvailableRoleActions($roleName) {
		//$userId = UserModel::getUserIdByName($username);



		$sql =  "SELECT \"action_name\" FROM \"" . self::$rolesTable . "\" " .
				"LEFT JOIN \"" . self::$joinActionTable . "\" on \"" . self::$rolesTable . "\".\"id_role\" = \"" . self::$joinActionTable . "\".\"id_role\" " .
				"WHERE \"" . self::$rolesTable . "\".\"name\" = :name";
	
		$values = array();
		$values[':name'] = $roleName; // save the placeholder
	
		try{
			$db = new EnsoDB();
			$db->prepare($sql);
			$db->execute($values);
		
			return $db->fetchAll(PDO::FETCH_COLUMN);
		}catch (PDOException $e){
			return false;
		}
	}


	/**
	 * Função para obter todas as ações possiveis ao utilizador
	 *
	 * @param int $userId
	 * @return array com ações possiveis ou false se houver falha na execução, FALSE se não foi possivel executar a query
	 * */
	public static function getAvailableUserActions($username) {
		$userId = UserModel::getUserIdByName($username);
		
		$sql = "SELECT \"" . self::$actionsTable . "\".\"action_name\" FROM \"" . self::$joinUserTable . "\" " .
				"INNER JOIN \"" . self::$joinActionTable . "\" on \"" . self::$joinActionTable . "\".\"id_role\" = \"" . self::$joinUserTable . "\".\"id_role\" " .
				"INNER JOIN \"" . self::$actionsTable . "\" on \"" . self::$joinActionTable . "\".\"action_name\" = \"" . self::$actionsTable . "\".\"action_name\" " .
				"WHERE \"" . self::$joinUserTable . "\".\"id_user\" = :id_user";
	
		$values = array();
		$values[':id_user'] = $userId; // save the placeholder
	
		try{
			$db = new EnsoDB();
			$db->prepare($sql);
			$db->execute($values);
		
			return $db->fetchAll(PDO::FETCH_COLUMN);
		}catch (PDOException $e){
			return false;
		}
	}
	
	/**
	 * Função para remover todas as roles ao utilizador
	 *
	 * @param int $userId
	 * @return true se a operação foi executada com sucesso;
	 * */
	public static function removeAllUserRoles($userId) {
	
		$sql = "DELETE FROM \"" . self::$joinUserTable . "\" " .
				"WHERE id_user = :id_user";
	
		$values = array();
		$values[':id_user'] = $userId; // save the placeholder
	
		try{
			$db = new EnsoDB();
			$db->prepare($sql);
			$db->execute($values);
		
			return true;
		}catch (PDOException $e){
			return false;
		}
	}
}
?>