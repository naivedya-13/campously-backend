const prisma = require('../../../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const findUserByEnrollmentId = (enrollmentId) =>
    prisma.user.findUnique({ where: { enrollmentId: enrollmentId.trim() } });

const findUserByEmail = (email) =>
    prisma.user.findUnique({ where: { email } });

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const comparePassword = (password, hashed) => bcrypt.compare(password, hashed);

const createAdminUser = (data) =>
    prisma.user.create({
        data: {
            ...data,
            enrollmentId: data.enrollmentId.trim(),
            role: 'ADMIN',
            isVerified: true,
        },
    });

const signToken = (user) =>
    jwt.sign(
        { id: user.id, role: user.role, enrollmentId: user.enrollmentId },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1d' }
    );

const sanitizeUser = (user) => ({
    id: user.id,
    enrollmentId: user.enrollmentId,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
});

module.exports = {
    findUserByEnrollmentId,
    findUserByEmail,
    hashPassword,
    comparePassword,
    createAdminUser,
    signToken,
    sanitizeUser,
};
