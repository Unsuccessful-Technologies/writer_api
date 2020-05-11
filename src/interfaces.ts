import {ObjectId} from 'bson'

export interface User {
    fName: string;
    lName: string;
    email: string;
    phone: string;
}

export interface UserDocInternal extends User {
    _id: string;
    password: string;
}

export interface SuccessfulLoginResult {
    user: User;
    token: string;
}

export interface CreateUserPayload extends User {
    _id?: ObjectId;
    password: string;
}

export interface UserSpaceHolder {
    email: string;
    _id: string | ObjectId;
    notJoined: true;
}

export interface TokenPayload {
    user_id: string;
}

