const prisma = require('../../../config/prisma');
const {
    findUserByEnrollmentId,
    hashPassword,
    comparePassword,
    createStudentUser,
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    generateOtp,
    storeOtp,
    verifyOtpCode,
    setAuthCookies,
    clearAuthCookies,
    sanitizeUser,
} = require('./helper');

const register = async (req, res) => {
    try {
        const { enrollmentId, name, password, college, department, year, email } = req.body;

        const existingUser = await findUserByEnrollmentId(enrollmentId);
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this enrollment ID already exists.' });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await createStudentUser({
            enrollmentId,
            name,
            password: hashedPassword,
            college,
            department,
            year,
            email,
        });

        const otp = generateOtp();
        await storeOtp(enrollmentId, otp);

        res.status(201).json({
            message: 'Student registered successfully. Please verify with the OTP sent to your college email.',
            user: sanitizeUser(newUser),
            requiresVerification: true,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { enrollmentId, password } = req.body;

        const user = await findUserByEnrollmentId(enrollmentId);
        if (!user || user.role !== 'STUDENT') {
            return res.status(400).json({ error: 'Invalid enrollment ID or password.' });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid enrollment ID or password.' });
        }

        if (!user.isVerified) {
            const otp = generateOtp();
            await storeOtp(enrollmentId, otp);
            return res.status(403).json({
                error: 'Account not verified. Please complete OTP verification.',
                requiresVerification: true,
                enrollmentId: user.enrollmentId,
            });
        }

        const accessToken = signAccessToken(user);
        const refreshToken = signRefreshToken(user);
        setAuthCookies(res, accessToken, refreshToken);

        res.status(200).json({
            message: 'Login successful.',
            token: accessToken,
            refreshToken,
            user: sanitizeUser(user),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { enrollmentId, otp } = req.body;

        if (!enrollmentId || !otp) {
            return res.status(400).json({ error: 'Enrollment ID and OTP are required.' });
        }

        const user = await findUserByEnrollmentId(enrollmentId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const valid = await verifyOtpCode(enrollmentId, otp);
        if (!valid) {
            return res.status(400).json({ error: 'Invalid or expired OTP.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true },
        });

        const accessToken = signAccessToken(updatedUser);
        const refreshToken = signRefreshToken(updatedUser);
        setAuthCookies(res, accessToken, refreshToken);

        res.status(200).json({
            message: 'Account verified successfully.',
            token: accessToken,
            refreshToken,
            user: sanitizeUser(updatedUser),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const refreshTokenHandler = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!token) {
            return res.status(401).json({ error: 'Refresh token required.' });
        }

        const decoded = verifyRefreshToken(token);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) {
            return res.status(401).json({ error: 'User not found.' });
        }

        const accessToken = signAccessToken(user);
        const newRefreshToken = signRefreshToken(user);
        setAuthCookies(res, accessToken, newRefreshToken);

        res.status(200).json({
            message: 'Token refreshed.',
            token: accessToken,
            refreshToken: newRefreshToken,
            user: sanitizeUser(user),
        });
    } catch {
        return res.status(403).json({ error: 'Invalid or expired refresh token.' });
    }
};

const logout = async (req, res) => {
    clearAuthCookies(res);
    res.status(200).json({ message: 'Logged out successfully.' });
};

module.exports = {
    register,
    login,
    verifyOtp,
    refreshToken: refreshTokenHandler,
    logout,
};
