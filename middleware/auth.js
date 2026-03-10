// const authMiddleware = async (req, res, next) => {
//     try {
//         const auth = req.headers['auth'];
//         if(auth != 'ZjVGZPUtYW1hX2FuZHJvaWRfMjAyMzY0MjU='){
//             res.status(403).json({message: "Authentication Failed"});
//         }
//         return next(); // Use return statement to ensure function exits
//     } catch (error) {
//         console.error('Auth middleware error:', error);
//         res.status(500).json({message: "Internal Server Error"});
//     }
// };
// module.exports = authMiddleware;


const authMiddleware = async (req, res, next) => {
    try {
        const auth = req.headers['auth'];
        const username = req.headers['username']; // Expecting the frontend to send this

        if (auth !== 'ZjVGZPUtYW1hX2FuZHJvaWRfMjAyMzY0MjU=') {
            return res.status(403).json({ message: "Authentication Failed" });
        }

        // Attach user info to the request object for the logger to use
        req.user = {
            username: username || "Unknown_User",
            role: req.path.includes('admin') ? 'Admin' : 'Staff'
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
module.exports = authMiddleware;