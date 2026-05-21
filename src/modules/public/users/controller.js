const prisma = require('../../../config/prisma');
const { avatarUrl } = require('../../../utils/avatar');
const { sanitizeUser } = require('../auth/helper');

const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json({ user: sanitizeUser(user) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateMe = async (req, res) => {
    try {
        const { name, bio, phone, department, year, college, email } = req.body;
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(name && { name }),
                ...(bio !== undefined && { bio }),
                ...(phone !== undefined && { phone }),
                ...(department !== undefined && { department }),
                ...(year !== undefined && { year: parseInt(year, 10) }),
                ...(college !== undefined && { college }),
                ...(email !== undefined && { email }),
            },
        });
        res.json({ message: 'Profile updated.', user: sanitizeUser(user) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateAvatar = async (req, res) => {
    try {
        const { avatar } = req.body;
        if (!avatar) {
            return res.status(400).json({ error: 'Avatar URL is required.' });
        }
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { avatar },
        });
        res.json({ message: 'Avatar updated.', user: sanitizeUser(user) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const searchStudents = async (req, res) => {
    try {
        const userId = req.user.id;
        const q = (req.query.q || '').trim();

        if (!q || q.length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters.' });
        }

        const users = await prisma.user.findMany({
            where: {
                id: { not: userId },
                role: 'STUDENT',
                isVerified: true,
                OR: [
                    { name: { contains: q } },
                    { enrollmentId: { contains: q } },
                    { college: { contains: q } },
                    { department: { contains: q } },
                ],
            },
            select: {
                id: true,
                name: true,
                enrollmentId: true,
                avatar: true,
                college: true,
                department: true,
            },
            take: 20,
        });

        res.json({
            users: users.map((u) => ({
                id: u.id,
                name: u.name,
                enrollmentId: u.enrollmentId,
                avatar: u.avatar || avatarUrl(u.enrollmentId),
                college: u.college,
                department: u.department,
            })),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getMe, updateMe, updateAvatar, searchStudents };
