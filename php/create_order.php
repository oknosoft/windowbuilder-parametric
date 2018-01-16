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

$doc = array(
  'ref' => '2ef79292-99de-4b85-a3b5-196fd3d9b926',
  'class_name' => 'doc.calc_order',
  'data' => '{
	  "ref": "2ef79292-99de-4b85-a3b5-196fd3d9b926",
	  "number_doc": "990",
	  "date": "2017-10-06T13:37:15",
	  "delivery_date": "0001-01-01T00:00:00",
	  "partner": "",
	  "production": [
	  {
		  "nom": "165b1b66-417e-11e7-aafb-c92f892df045",
		  "clr": "5cecb63c-8dff-4062-b56c-75928c1ff0bf",
		  "len": 2100,
		  "height": 350,
		  "quantity": 1,
		  "note": "5609904"
	  },
	  {
		  "nom": "0c015881-fda5-11e2-b083-000c2911ac50",
		  "clr": "5cecb63c-8dff-4062-b56c-75928c1ff0bf",
		  "len": 0,
		  "height": 0,
		  "quantity": 2,
		  "note": ""
	  },
	  {
		  "nom": "884d0cce-7b2e-11e7-956f-9cb654bba81d",
		  "clr": "a583bf9b-cc9f-4e83-8a2d-d739e16b5393",
		  "len": 1700,
		  "height": 400,
		  "quantity": 2,
		  "note": "5973610"
	  }
	  ],
	  "obj_delivery_state": "Черновик"
	  }'
);

if ( $curl = curl_init () ) {

	curl_setopt($curl, CURLOPT_URL, $auth['url'] . $doc['class_name'] . '/' . $doc['ref']);
	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($curl, CURLOPT_USERPWD, $auth['login'] . ':' . $auth['passwd'] );
	curl_setopt($curl, CURLOPT_HTTPHEADER, array("Content-Type: application/json","suffix: " . $auth['suffix']));
	curl_setopt($curl, CURLOPT_POST, true);
	curl_setopt($curl, CURLOPT_POSTFIELDS, $doc['data']);

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
