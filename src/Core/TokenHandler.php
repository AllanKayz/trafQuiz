<?php

namespace TrafQuiz\Core;

class TokenHandler {
    private $secretKey;

    public function __construct() {
        //Define a secret key
        $this->secretKey = "123456";
    }

    //Generate a token
    public function generateToken($payload) {
        $header = base64_encode(json_encode(["alg"=>"HS256", "typ"=>"JWT"]));
        $payload = base64_encode(json_encode($payload));
        $signature = hash_hmac('sha256', "$header.$payload", $this->secretKey, true);

        return "$header.$payload." . base64_encode($signature);
    }

    //Validate Token
    public function validateToken($token) {
        $parts = explode('.', $token);

        if(count($parts) !== 3) {
            return null; //Invalid token structure
        }

        [$header, $payload, $signature] = $parts;
        $expectedSignature = base64_encode(hash_hmac('sha256', "$header.$payload", $this->secretKey, true));

        //Compare signatures to validate the token
        if(!hash_equals($expectedSignature, $signature)) {
            return null; // Signature mismatch
        }

        
        $decodedPayload = json_decode(base64_decode($payload), true); //Return Payload if valid
        if ($decodedPayload['exp'] < time()) {
            return null; // Token expired
        }

        return $decodedPayload; 
    }    
}