import {ObjectId} from 'bson'
import {CustomUserDoc, User} from "@unsuccessful-technologies/mongodbcollectionhandlers/dist/interfaces";

export interface WriterUser extends User {
    last_book_id_open: string;
    books?: ObjectId[] | string []
}

export interface TokenPayload {
    user_id: string;
}

export interface Book {
    _id: ObjectId | string;
    title: string;
    chapters: Chapter [];
}

export interface Chapter {
    index: number;
    title?: string | null;
    text: string | null;
}

export interface LoginResult {
    user: CustomUserDoc<WriterUser>;
    token: string;
}