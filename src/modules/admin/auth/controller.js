const {
    findUserByEmail,
    hashPassword,
    comparePassword,
    createAdminUser,
    signToken,
    sanitizeUser,
} = require('./helper');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email.' });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await createAdminUser({ name, email, password: hashedPassword });

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
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await findUserByEmail(email);
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
