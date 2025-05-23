<?php

namespace TrafQuiz\Core;

class License {

    public static function getComputerID() {
        $macAddress = shell_exec('getmac');
        $hostname = gethostname();
        $computerId = $macAddress . php_uname('n') . php_uname('s') . $hostname;
        return hash('sha256', $computerId);
    }

    public static function generateLicenseFile($licenseKey) {
        $licenseKey = hash('sha256', $licenseKey);
        $computerId = getComputerID();
        $licenseData = [
            'licenseKey' => $licenseKey,
            'computerId' => $computerId,
            'issuedAt' => date('Y-m-d H:i:s')
        ];
        
        $licenseJson = json_encode($licenseData);
        file_put_contents('license.json', $licenseJson);
        echo 'License File Generated Successfully';
    }

    //public function storeLicenseInDB($key, $compID, $date) {}
}