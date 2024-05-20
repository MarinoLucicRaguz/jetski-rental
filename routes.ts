/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */

export const publicRoutes = [
    "/"
]

/**
 * An array of routes that are used for the authentication
 * These routes will redirect logged users to settings
 * @type {string[]}
 */

export const authRoutes =[
    "/auth/login",
    "/auth/register"
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */

export const apiAuthPrefix = "/api/auth";

/**
 * Default redirect path after logging in
 */

export const DEFAULT_LOGIN_REDIRECT = "/guestpage"