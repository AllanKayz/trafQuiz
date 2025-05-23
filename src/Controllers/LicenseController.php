<?php

namespace TrafQuiz\Controllers;

class LicenseController {

    function validateLicense() {
        if(!file_exists('license.json')) {
            die('License file not found. Please contact support.');
        }

        $licenseData = json_decode(file_get_contents('./Core/license.json'), true);
        $currentComputerId = hash('sha256', shell_exec('getmac') . php_uname('n') . php_uname('s') . gethostname());

        if($licenseData['computerId'] !== $currentComputerId) {
            die('License validation failed. This license is not tied to this machine.');
        }

        echo json_encode('License validation successfull');
    }
}