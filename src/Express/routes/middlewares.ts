import {NextFunction, Request, Response} from "express";
import {verify} from "jsonwebtoken";
import config from "../../config";

export const isAuthentic = (req: Request, res: Response, next: NextFunction) => {
    const token: string = req.headers['token'] as string
    try {
        if(!token){
            throw new Error('Not Authorized')
        } else {
            const payload = verify(token,config.secret)
            if(payload){
                req.headers.payload = JSON.stringify(payload)
                next()
            } else {
                throw new Error('Not Authorized')
            }
        }
    } catch(e){
        console.log(e.message)
        res.status(401).json({message:e.message})
    }
}

export function GetPayloadHeader<T> (req: Request): T {
    const { payload } = req.headers
    const payloadJSON: T = JSON.parse(<string>payload)
    return payloadJSON
}

export function HandleErrorResponse(e: Error, res: Response) {
    console.log(e)
    if(e.message.includes("Handled:")){
        let message = e.message.split(":")[1]
        res.status(400).json({
            message
        })
    } else {
        res.status(500).json({
            message: e.message
        })
    }
}