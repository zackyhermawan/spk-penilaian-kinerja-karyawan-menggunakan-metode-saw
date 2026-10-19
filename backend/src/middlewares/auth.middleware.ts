import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

export interface JwtPayload {
    id: string,
    role: string,
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        const token = authHeader.split(" ")[1]
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
        req.user = payload
        next()
    } catch (error: any) {
        return res.status(401).json({
            message: "Unauthorized"
        })
    }
}