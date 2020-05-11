import { MongoClient, Db, ObjectId} from "mongodb";
import config from "../config";
import CollectionHandlers from '@unsuccessful-technologies/mongodbcollectionhandlers'

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
