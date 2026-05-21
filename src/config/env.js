const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

function validateEnv() {
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}. Check your .env file.`
        );
    }
}

module.exports = {
    validateEnv,
    get jwtSecret() {
        return process.env.JWT_SECRET;
    },
    get jwtRefreshSecret() {
        return process.env.JWT_REFRESH_SECRET;
    },
    get frontendUrl() {
        return process.env.FRONTEND_URL || 'http://localhost:3000';
    },
    get port() {
        return process.env.PORT || 5000;
    },
};
