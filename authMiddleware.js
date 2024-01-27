// authMiddleware.js

// Example authentication middleware
const authMiddleware = {
    authenticate(req, res, next) {
        // Check if user is authenticated
        if (req.isAuthenticated()) {
            return next(); // User is authenticated, continue to the next middleware or route handler
        } else {
            return res.status(401).json({ message: 'Unauthorized' }); // User is not authenticated, send 401 Unauthorized response
        }
    }
};

module.exports = authMiddleware;
