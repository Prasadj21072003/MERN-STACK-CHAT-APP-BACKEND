import jwt from "jsonwebtoken";
import prisma from "./db/prisma.js";
const Verify = async (req, res, next) => {
    const authtoken = req?.headers?.token;
    try {
        if (authtoken) {
            const decoded = jwt.verify(authtoken, process.env.JWT_KEY);
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, username: true, fullName: true, profilepic: true },
            });
            req.user = user;
            next();
        }
    }
    catch (error) {
        console.log(error);
        res.json({ error: "Verify Error" });
    }
};
export default Verify;
