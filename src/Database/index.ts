import { MongoClient, Db, ObjectId} from "mongodb";
import config from "../config";
import CollectionHandlers from '@unsuccessful-technologies/mongodbcollectionhandlers'
import {Book} from "../interfaces";

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

export const CreateBook = async (title?: string): Promise<Book> => {
    const Books = db.collection("Books")
    const newBook: Book = {
        _id: new ObjectId(),
        title: title ? title : "Working Title",
        chapters: [
            {
                index: 1,
                title: null,
                text: null
            }
        ]
    }
    const result = await Books.insertOne(newBook)
    if(result.result.ok){
        return newBook
    } else {
        throw new Error('Book not saved to database')
    }
}

export const GetBook = async (id: string): Promise<Book> => {
    const _id = new ObjectId(id)
    const query = { _id }
    const Books = db.collection("Books")
    const result = await Books.findOne<Book>(query)
    console.log("Database:GetBook:\n",result)
    return result
}

