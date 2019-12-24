<?php
class Ensomail {
	
	private static $ENSO_MAIL_VERSION = "2.0.1";
	
	public static function sendMail($fromMail, $toMail, $subject, $message){
		
		global $ensoMailConfig;

		if(empty($ensoMailConfig))
			return false;

		foreach($ensoMailConfig as $name =>$param)
			if(empty($param) && $name != "encryption")
				return false;

		
		// Create the Transport
		$transport = (new Swift_SmtpTransport($ensoMailConfig['host'], $ensoMailConfig['port'], $ensoMailConfig['encryption']))
						->setUsername($ensoMailConfig['user'])
						->setPassword($ensoMailConfig['pass']);
		
		// Create the Mailer using your created Transport
		$mailer = new Swift_Mailer($transport);
		
		// Create a message
		$message = (new Swift_Message($subject))
					  ->setFrom($fromMail)
					  ->setTo($toMail)
					  ->setBody($message);
		
		// Send the message
		$result = $mailer->send($message);
		if($result == 0)
			return false;
		
		return true;
	}

	public static function sendHTMLMail($fromMail, $toMail, $subject, $message){
		
		global $ensoMailConfig;

		if(empty($ensoMailConfig))
			return false;

		foreach($ensoMailConfig as $name =>$param)
			if(empty($param) && $name != "encryption")
				return false;

		
		// Create the Transport
		$transport = (new Swift_SmtpTransport($ensoMailConfig['host'], $ensoMailConfig['port'], $ensoMailConfig['encryption']))
						->setUsername($ensoMailConfig['user'])
						->setPassword($ensoMailConfig['pass']);
		
		// Create the Mailer using your created Transport
		$mailer = new Swift_Mailer($transport);
		
		// Create a message
		$message = (new Swift_Message($subject))
					  ->setContentType("text/html")
					  ->setFrom($fromMail)
					  ->setTo($toMail)
					  ->setBody($message, 'text/html');
		
		// Send the message
		$result = $mailer->send($message);
		if($result == 0)
			return false;
		
		return true;
	}

	
}
?>