import {NextFunction, Request, Response, Router} from "express";
import {GetBook} from "../../Database";
import {isAuthentic} from "./middlewares";
import {Book} from "../../interfaces";

const router = Router()

router.use(isAuthentic)

const GetBookById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params

    try {
        const book: Book = await GetBook(id)
        res.status(200).json(book)
    } catch (e) {
        console.log(e)
        res.status(500).json(e.message)
    }
}


router.get("/:id", GetBookById)

export default router