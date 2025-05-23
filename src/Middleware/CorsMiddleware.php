<?php

namespace TrafQuiz\Middleware;

class CorsMiddleware {
	public function __invoke($request, $handler) {
		//Process the request
		$response = $handler->handle($request);
		
		//Add CORS headers to the responses
		return $response
			->withHeader('Access-Control-Allow-Origin', '*') //Allow all origins
			->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS') //HTTP Methods
			->withHeader('Access-Control-Allow-Headers','Content-Type, Authorization') //Allowed headers
			->withHeader("Content-Type: application/json");
	}
}