// const jwt = require('jsonwebtoken');

// module.exports = function authenticate(req, res, next) {
//     const authHeader = req.headers.authorization || req.headers.Authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         return res.status(401).json({ error: 'No token provided' });
//     }

//     const token = authHeader.split(' ')[1];

//     try {
//         console.log('Token:', token);
//         // const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         // const decoded = jwt.verify(token, "process.env.JWT_SECRET");
//         const decoded = jwt.decode(token, { complete: true });
//         console.log('Hello world!');
//         req.user = decoded;
//         next();
//     } catch (err) {
//         console.error('JWT Verification Error:', err.message);
//         return res.status(401).json({ error: 'Invalid token' });
//     }
// };

const jwt = require('jsonwebtoken');

const verifyJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);

        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: "Token is invalid or expired" });

            // ✅ Assign the decoded payload to request object
            req.user = decoded;

            next(); // ✅ Call next INSIDE the verify callback
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = verifyJWT;