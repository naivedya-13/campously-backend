const prisma = require('../../../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const findUserByEmail = (email) =>
    prisma.user.findUnique({ where: { email } });

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const comparePassword = (password, hashed) =>
    bcrypt.compare(password, hashed);

const createAdminUser = (data) =>
    prisma.user.create({ data: { ...data, role: 'ADMIN' } });

const signToken = (user) =>
    jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1d' }
    );

const sanitizeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
});

module.exports = {
    findUserByEmail,
    hashPassword,
    comparePassword,
    createAdminUser,
    signToken,
    sanitizeUser,
};
