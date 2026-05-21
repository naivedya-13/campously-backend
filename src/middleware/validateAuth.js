const validateEnrollmentId = (enrollmentId) => {
    if (!enrollmentId || typeof enrollmentId !== 'string') return false;
    return /^\d{5,10}$/.test(enrollmentId.trim());
};

const validatePassword = (password) => {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 8;
};

const validateRegisterBody = (req, res, next) => {
    const { enrollmentId, name, password, college, department, year } = req.body;

    if (!enrollmentId || !name || !password || !college || !department || !year) {
        return res.status(400).json({
            error: 'Enrollment ID, name, college, department, year, and password are required.',
        });
    }

    if (!validateEnrollmentId(enrollmentId)) {
        return res.status(400).json({ error: 'Invalid enrollment ID format.' });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    next();
};

const validateLoginBody = (req, res, next) => {
    const { enrollmentId, password } = req.body;

    if (!enrollmentId || !password) {
        return res.status(400).json({ error: 'Enrollment ID and password are required.' });
    }

    if (!validateEnrollmentId(enrollmentId)) {
        return res.status(400).json({ error: 'Invalid enrollment ID format.' });
    }

    next();
};

module.exports = {
    validateEnrollmentId,
    validatePassword,
    validateRegisterBody,
    validateLoginBody,
};
