const {
    findUserByEmail,
    hashPassword,
    comparePassword,
    createStudentUser,
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
        const newUser = await createStudentUser({ name, email, password: hashedPassword });

        res.status(201).json({
            message: 'Student registered successfully.',
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
        if (!user || user.role !== 'STUDENT') {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const token = signToken(user);

        res.status(200).json({
            message: 'Login successful.',
            token,
            user: sanitizeUser(user),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login };
