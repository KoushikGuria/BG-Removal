import jwt from 'jsonwebtoken';

// Middleware function to decode jwt token to get clerkId
const authUser = async (req, res, next) => {
    try {
        const { token } = req.headers;

        if (!token) {
            return res.json({ success: false, message: "Not Authorized, Login Again!" });
        }

        const token_decode = jwt.decode(token);
        req.user = { clerkId: token_decode.clerkId };  // Use a dedicated object for auth info
        next(); 

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

export default authUser;