const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, 'your_jwt_secret', async (err, decoded) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = await User.findByPk(decoded.id);
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

exports.isAdmin = (req, res, next) => {
    authenticate(req, res, () => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.sendStatus(403);
        }
    });
};

exports.isUser = (req, res, next) => {
    authenticate(req, res, () => {
        if (req.user) {
            next();
        } else {
            res.sendStatus(401);
        }
    });
};