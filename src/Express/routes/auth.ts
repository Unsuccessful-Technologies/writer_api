import {sign, verify} from 'jsonwebtoken'
import {NextFunction, Request, Response, Router} from "express";
import {commonCollectionHandlers, CreateBook} from "../../Database";
import config from "../../config";
import {
    WriterUser,
    TokenPayload, LoginResult, NewWriterUser,
} from "../../interfaces";
import {
    CustomUserDoc,
    CustomUserInternalDoc
} from "@unsuccessful-technologies/mongodbcollectionhandlers/dist/interfaces";
import {ObjectId} from 'bson'
import {GetPayloadHeader, isAuthentic} from "./middlewares";

type NewUser = CustomUserDoc<NewWriterUser>
type User = CustomUserDoc<WriterUser>
type UserInternal = CustomUserInternalDoc<WriterUser>


const router = Router()

const profile_pipeline = [
    {
        $lookup: {
            from: "Books",
            let: {bookIds:"$book_ids"},
            pipeline: [
                {
                    $match: {
                        $expr: { $in: ["$_id","$$bookIds"] }
                    }
                },
                {
                    $project: {
                        title: 1,
                        number_of_chapters: { $cond: { if: { $isArray: "$chapters"}, then: { $size: "$chapters"}, else: 0} }
                    }
                }
            ],
            as: "books"
        }
    }
]

const Login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    const controllers = await commonCollectionHandlers
    const pipeline = [
        {
            $match: { email }
        }, ...profile_pipeline
    ]

    const user: UserInternal = await controllers.Users.GetUserByEmail<WriterUser>(email, pipeline)
    console.log(user)
    try {
        if(user){
            ComparePasswords(user, password)
            const result = await CreateSuccessfulLoginResult(user)
            res.status(200).json(result)
        } else {
            throw new Error('User was not found')
        }
    } catch (e) {
        console.log(e.message)
        res.status(400).json({
            message: "Unauthorized"
        })
    }
}

const Join = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: NewWriterUser = req.body
        const { email } = user
        const controllers = await commonCollectionHandlers
        const userExists = await controllers.Users.UserExists(email)
        if(userExists){
            res.status(200).json({success: false, message: "User already exists."})
        } else {
            const newBook = await CreateBook();
            user.book_ids = [<ObjectId>newBook._id]
            user.last_book_id_open = newBook._id.toString()
            const controllers = await commonCollectionHandlers
            const userDoc: NewUser = await controllers.Users.CreateUser(user)
            const {_id} = userDoc
            if(_id){
                // TODO Need to verify user through email
                res.status(200).json({success: true, message: "Please login. User was successfully created."})
            }
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: e.message
        })
    }
}

const GetProfileHandler = async (req: Request, res: Response, next: NextFunction) => {
    const payload = GetPayloadHeader<TokenPayload>(req)
    const {user_id} = payload
    const pipeline = [
        {
            $match: { _id: new ObjectId(user_id) }
        }, ...profile_pipeline
    ]
    try {
        const controllers = await commonCollectionHandlers
        const user = await controllers.Users.GetUserById<WriterUser>(user_id,pipeline)
        const result = await CreateSuccessfulLoginResult(user)
        res.status(200).json(result)
    } catch (e) {
        console.log(e.message)
        res.status(500).json({
            message: e.message
        })
    }
}

// const GetToken = async (req: Request, res: Response, next: NextFunction) => {
//     let { payload } = req.headers
//     const payloadJSON: TokenPayload = JSON.parse(<string>payload)
//     const {user_id} = payloadJSON
//     const { event_id } = req.params
//     try {
//         const token = sign({user_id, event_id}, config.secret)
//         res.status(200).json({token})
//     } catch (e) {
//         console.log(e.message)
//         res.status(500).json({
//             message: e.message
//         })
//     }
// }

// const Token = async (req: Request, res: Response, next: NextFunction) => {
//     let { payload } = req.headers
//     const payloadJSON = JSON.parse(<string>payload)
//     const {user_id, event_id} = payloadJSON
//     const {event_id: event_id_param} = req.params
//     try {
//         if(event_id === event_id_param){
//             // TODO Also check if the user is allowed to authorize access to event_id
//             res.status(200).json({allowed:true})
//         } else {
//             res.status(200).json({allowed:false})
//         }
//     } catch (e) {
//         console.log(e.message)
//         res.status(500).json({
//             message: "Server Error"
//         })
//     }
// }

router.post("/login", Login)

router.post("/join", Join)

router.use(isAuthentic)

router.get("/profile", GetProfileHandler)

// router.get("/token/:event_id", GetToken)
//
// router.get("/token/valid/:event_id", Token)

export default router

const ComparePasswords = (user: UserInternal, password: string): void => {
    const result = user.password === password
    if(!result){
        throw new Error("Passwords Did Not Match")
    }
}

const CreateSuccessfulLoginResult = async (user: UserInternal): Promise<LoginResult> => {
    const clean_user = {...user}
    delete clean_user.password

    const payload: TokenPayload = {user_id: <string>user._id}
    const token = sign(payload, config.secret)

    const result = {
        user: clean_user,
        token
    }
    return result
}
