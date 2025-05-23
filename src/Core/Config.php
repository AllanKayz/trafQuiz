<?php
$_CONFIG = parse_ini_file('config.ini');
if(!defined('DB_SERVER')) define('DB_SERVER', $_CONFIG['host']);
if(!defined('DB_USERNAME')) define('DB_USERNAME', $_CONFIG['username']);
if(!defined('DB_PASSWORD')) define('DB_PASSWORD', $_CONFIG['password']);
if(!defined('DB_NAME')) define('DB_NAME',$_CONFIG['database_name']);