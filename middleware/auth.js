const authMiddleware = async (req, res, next) => {
    try {
        const auth = req.headers['auth'];
        if(auth != 'ZjVGZPUtYW1hX2FuZHJvaWRfMjAyMzY0MjU='){
            res.status(403).json({message: "Authentication Failed"});
        }
        return next(); // Use return statement to ensure function exits
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({message: "Internal Server Error"});
    }
};
module.exports = authMiddleware;