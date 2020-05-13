import {ObjectId} from 'bson'
import {User} from "@unsuccessful-technologies/mongodbcollectionhandlers/dist/interfaces";

export interface NewWriterUser extends User {
    last_book_id_open: string;
    book_ids: ObjectId[] | string [];
}

export interface WriterUser extends NewWriterUser {
    book_previews: BookPreview [];
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
    user: WriterUser;
    token: string;
}

interface BookPreview {
    title: string;
    number_of_chapters: number;
}