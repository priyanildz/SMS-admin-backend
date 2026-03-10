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
        // Frontend should send these headers
        const username = req.headers['username']; 
        const userRole = req.headers['role']; 

        if (auth !== 'ZjVGZPUtYW1hX2FuZHJvaWRfMjAyMzY0MjU=') {
            return res.status(403).json({ message: "Authentication Failed" });
        }

        // List of allowed roles you provided
        const validRoles = ["admin", "teacher", "student", "principal", "librarian", "accountant", "clerk"];
        
        // Attach identity to the request object
        req.user = {
            username: username || "System_User",
            role: validRoles.includes(userRole?.toLowerCase()) ? userRole.toLowerCase() : "staff"
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
module.exports = authMiddleware;