import { MongoClient, Db, ObjectId} from "mongodb";
import config from "../config";
import CollectionHandlers from '@unsuccessful-technologies/mongodbcollectionhandlers'
import {Book, Chapter} from "../interfaces";

let db: Db

const StartDB = async (): Promise<Db> => {
    try {
        const client: MongoClient = await MongoClient.connect(config.mongodb.url, {useUnifiedTopology: true})
        db = await client.db(config.mongodb.database_name)
        return db
    } catch (err) {
        console.log(err)
    }
}

const dbPromise = StartDB()

export default dbPromise

export const commonCollectionHandlers = CollectionHandlers(dbPromise)

export const CreateBook = async (userId: string, title: string): Promise<Book> => {
    const Books = db.collection("Books")
    const book_id = new ObjectId()
    const newBook: Book = {
        _id: book_id,
        title: title,
        chapter_ids: []
    }
    const result = await Books.insertOne(newBook)
    if(result.result.ok){
        const Users = db.collection("Users")
        const user_id = new ObjectId(userId)
        const query = {_id: user_id}
        const update = {$addToSet: { book_ids: book_id }}
        const userUpdate = await Users.updateOne(query,update)
        if(userUpdate.result.ok){
            return newBook
        } else {
            throw new Error('Book not added to users book_ids')
        }
    } else {
        throw new Error('Book Creation Failed.')
    }
}

export const GetBookById = async (id: string): Promise<Book> => {
    const _id = new ObjectId(id)
    const query = { _id }
    const pipeline = [
        {
            $match: query
        },
        {
            $lookup: {
                from: "Chapters",
                let: {chapterIds:"$chapter_ids"},
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$_id","$$chapterIds"] }
                        }
                    },
                    {
                        $project: {
                            text: 0
                        }
                    }
                ],
                as: "chapters"
            }
        }
    ]
    const Books = db.collection("Books")
    const result = await Books.aggregate<Book>(pipeline).toArray()
    console.log("Database:GetBook:\n",result)
    return result[0]
}

export const UpdateBook = async (id:string, update:Object): Promise<boolean> => {
    const Books = db.collection("Books")
    const query = {_id: new ObjectId(id)}
    const updateBook = await Books.updateOne(query,update)
    return !!updateBook.result.ok
}

export const AddChapter = async (book_id: string, chapter: Chapter): Promise<string> => {
    const Chapters = db.collection("Chapters")
    const result = await Promise.all([
        Chapters.insertOne(chapter),
        UpdateBook(book_id,{$addToSet:{chapter_ids: chapter._id}})
    ])
    const chapterResult = result[0]
    const bookResult = result[1]
    if(chapterResult.result.ok && bookResult){
        const chapterId: string = chapterResult.insertedId.toString()
        return chapterId
    } else {
        throw new Error('Chapter Creation Failed.')
    }
}


