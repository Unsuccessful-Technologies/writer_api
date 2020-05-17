import {ObjectId} from 'bson'
import {User} from "@unsuccessful-technologies/mongodbcollectionhandlers/dist/interfaces";

export interface NewWriterUser extends User {
    password: string;
    last_book_id_open: string;
    book_ids: ObjectId[];
}

export interface WriterUser extends NewWriterUser {
    books: BookPreview [];
}

export interface TokenPayload {
    user_id: string;
}

export interface Book {
    _id: ObjectId | string;
    title: string;
    chapter_ids: ObjectId [];
}

export interface Chapter {
    _id: ObjectId;
    index: number;
    title: string;
    text: string;
}

export interface LoginResult {
    user: WriterUser;
    token: string;
}

interface BookPreview {
    title: string;
    number_of_chapters: number;
}