<?php

namespace TrafQuiz\Middleware;

/**
 * Simple rate limiting middleware to prevent API abuse
 */
class RateLimiter
{
    private static $requests = [];
    private static $maxRequests = 100; // Max requests per window
    private static $windowSeconds = 60; // Time window in seconds

    /**
     * Check if the request should be allowed based on rate limiting
     * @param string $identifier Unique identifier (IP address, user ID, etc.)
     * @return bool True if request is allowed, false if rate limit exceeded
     */
    public static function check(string $identifier): bool
    {
        $now = time();

        // Initialize tracking for this identifier if not exists
        if (!isset(self::$requests[$identifier])) {
            self::$requests[$identifier] = [];
        }

        // Remove expired entries
        self::$requests[$identifier] = array_filter(
            self::$requests[$identifier],
            function ($timestamp) use ($now) {
                return ($now - $timestamp) < self::$windowSeconds;
            }
        );

        // Check if limit exceeded
        if (count(self::$requests[$identifier]) >= self::$maxRequests) {
            return false;
        }

        // Add current request
        self::$requests[$identifier][] = $now;

        return true;
    }

    /**
     * Get the client identifier (IP address)
     * @return string
     */
    public static function getClientIdentifier(): string
    {
        // Try to get the real IP if behind proxy
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } elseif (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        }

        return $ip;
    }

    /**
     * Send rate limit error response
     */
    public static function sendRateLimitResponse(): void
    {
        http_response_code(429);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Too many requests. Please try again later.',
            'retryAfter' => self::$windowSeconds
        ]);
        exit;
    }

    /**
     * Middleware function to apply rate limiting
     * Usage: RateLimiter::apply() at the start of your API endpoints
     */
    public static function apply(): void
    {
        $identifier = self::getClientIdentifier();

        if (!self::check($identifier)) {
            self::sendRateLimitResponse();
        }
    }
}
