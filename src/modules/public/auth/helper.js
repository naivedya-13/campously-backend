const prisma = require('../../../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtRefreshSecret } = require('../../../config/env');

const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

const findUserByEnrollmentId = (enrollmentId) =>
    prisma.user.findUnique({ where: { enrollmentId: enrollmentId.trim() } });

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const comparePassword = (password, hashed) => bcrypt.compare(password, hashed);

const createStudentUser = async (data) => {
    const user = await prisma.user.create({
        data: {
            enrollmentId: data.enrollmentId.trim(),
            name: data.name,
            email: data.email || null,
            password: data.password,
            college: data.college,
            department: data.department,
            year: parseInt(data.year, 10),
            role: 'STUDENT',
            isVerified: false,
        },
    });

    await prisma.cart.create({ data: { userId: user.id } });
    await prisma.wishlist.create({ data: { userId: user.id } });

    return user;
};

const signAccessToken = (user) =>
    jwt.sign(
        { id: user.id, role: user.role, enrollmentId: user.enrollmentId },
        jwtSecret,
        { expiresIn: ACCESS_EXPIRES }
    );

const signRefreshToken = (user) =>
    jwt.sign(
        { id: user.id, role: user.role, enrollmentId: user.enrollmentId },
        jwtRefreshSecret,
        { expiresIn: REFRESH_EXPIRES }
    );

const verifyRefreshToken = (token) => jwt.verify(token, jwtRefreshSecret);

const generateOtp = () => '555555';

const storeOtp = async (enrollmentId, code) => {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.otpVerification.deleteMany({
        where: { enrollmentId: enrollmentId.trim() },
    });
    await prisma.otpVerification.create({
        data: { enrollmentId: enrollmentId.trim(), code, expiresAt },
    });
};

const verifyOtpCode = async (enrollmentId, code) => {
    const record = await prisma.otpVerification.findFirst({
        where: { enrollmentId: enrollmentId.trim() },
        orderBy: { createdAt: 'desc' },
    });
    if (!record) return false;
    if (new Date() > record.expiresAt) {
        await prisma.otpVerification.delete({ where: { id: record.id } });
        return false;
    }
    if (record.code !== code.trim()) return false;
    await prisma.otpVerification.delete({ where: { id: record.id } });
    return true;
};

const setAuthCookies = (res, accessToken, refreshToken) => {
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        path: '/',
    };

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

const clearAuthCookies = (res) => {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
};

const sanitizeUser = (user) => ({
    id: user.id,
    enrollmentId: user.enrollmentId,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    college: user.college,
    department: user.department,
    year: user.year,
    phone: user.phone,
    isVerified: user.isVerified,
    role: user.role,
    createdAt: user.createdAt,
});

module.exports = {
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
};
