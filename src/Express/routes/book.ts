import {NextFunction, Request, Response, Router} from "express";
import {AddChapter, commonCollectionHandlers, CreateBook, GetBookById} from "../../Database";
import {GetPayloadHeader, HandleErrorResponse, isAuthentic} from "./middlewares";
import {Book, Chapter, TokenPayload, WriterUser} from "../../interfaces";
import {ObjectId} from 'bson'

const router = Router()

router.use(isAuthentic)

const HandleCreateBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = GetPayloadHeader<TokenPayload>(req)
        const {user_id} = payload
        const { title } = req.body
        if(!title || title.length < 1){
            throw new Error("Handled:Title Required")
        }
        const book: Book = await CreateBook(user_id, title)
        console.log(book)
        const message = `New Book, ${book.title}, successfully created`
        res.status(200).json({message})
    } catch (e) {
        HandleErrorResponse(e, res)
    }
}

const HandleGetBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const payload = GetPayloadHeader<TokenPayload>(req)
        const {user_id} = payload
        await CanUserAccessBook(user_id, id)
        const book: Book = await GetBookById(id)
        res.status(200).json(book)
    } catch (e) {
        console.log(e)
        res.status(500).json(e.message)
    }
}

const HandleCreateChapter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = GetPayloadHeader<TokenPayload>(req)
        const {user_id} = payload
        const {id} = req.params
        await CanUserAccessBook(user_id,id)
        const newChapter = CreateNewChapter(req.body)
        const chapterId = await AddChapter(id,newChapter)
        console.log("Created chapter id: " + chapterId)
        const message = `Successfully created new chapter`
        res.status(200).json({message, id:chapterId})
    } catch (e) {
        HandleErrorResponse(e, res)
    }
}


router.post("/", HandleCreateBook)

router.get("/:id", HandleGetBook)

router.post("/:id/chapter", HandleCreateChapter)

export default router

const CanUserAccessBook = async (user_id:string, book_id:string) => {
    const controllers = await commonCollectionHandlers
    const user = await controllers.Users.GetUserById<WriterUser>(user_id)
    const {book_ids} = user
    const bookIdStrings = book_ids.map(x => x.toString())
    const allowed = bookIdStrings.includes(book_id)
    if(!allowed){
        throw new Error("Handled:Not Allowed to Access Book")
    }
}

const CreateNewChapter = (data: any): Chapter => {
    const { index } = data
    let error = null
    if(!index || index.length < 1){
        error = new Error("Handled:Index Required")
    }
    if(error){
        throw error
    }
    const result = {
        _id: new ObjectId(),
        index: parseInt(index),
        title: "",
        text: ""
    }
    return result
}