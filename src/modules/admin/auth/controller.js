const {
    findUserByEnrollmentId,
    hashPassword,
    comparePassword,
    createAdminUser,
    signToken,
    sanitizeUser,
} = require('./helper');

const register = async (req, res) => {
    try {
        const { name, enrollmentId, email, password } = req.body;

        if (!name || !enrollmentId || !password) {
            return res.status(400).json({ error: 'Name, enrollment ID, and password are required.' });
        }

        const existingUser = await findUserByEnrollmentId(enrollmentId);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this enrollment ID.' });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await createAdminUser({
            name,
            enrollmentId,
            email: email || null,
            password: hashedPassword,
        });

        res.status(201).json({
            message: 'Admin registered successfully.',
            user: sanitizeUser(newUser),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { enrollmentId, password } = req.body;

        if (!enrollmentId || !password) {
            return res.status(400).json({ error: 'Enrollment ID and password are required.' });
        }

        const user = await findUserByEnrollmentId(enrollmentId);
        if (!user || user.role !== 'ADMIN') {
            return res.status(400).json({ error: 'Invalid admin credentials.' });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid admin credentials.' });
        }

        const token = signToken(user);

        res.status(200).json({
            message: 'Admin login successful.',
            token,
            user: sanitizeUser(user),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login };
