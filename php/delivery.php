<?php
/**
* @package		windowbuilder-parametric
* @url			https://github.com/oknosoft/windowbuilder-parametric
* @copyright	(C) 2014-2018 http://www.oknosoft.ru All rights reserved.
*/

$auth = array(
  'url' => 'https://crystallit.oknosoft.ru/prm/',
  'login' => 'login',
  'passwd' => 'passwd',
  'suffix' => '0000'
);

$doc = '[{"ref": "2ef79292-99de-4b85-a3b5-196fd3d9b926", "date": "2018-01-01", "time": "11:00", "order": "r7"}]';

if ( $curl = curl_init () ) {

  curl_setopt($curl, CURLOPT_URL, $auth['url'] . 'delivery/delivery');
  curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($curl, CURLOPT_USERPWD, $auth['login'] . ':' . $auth['passwd'] );
  curl_setopt($curl, CURLOPT_HTTPHEADER, array("Content-Type: application/json","suffix: " . $auth['suffix']));
  curl_setopt($curl, CURLOPT_POST, true);
  curl_setopt($curl, CURLOPT_POSTFIELDS, $doc);

	$result = curl_exec($curl);

	if(!curl_errno($curl)){
	  echo $result;
	}
	else {
	  echo 'curl error: ' . curl_error($curl);
	}

	curl_close ($curl);

}
else {
	echo 'curl error';
}
