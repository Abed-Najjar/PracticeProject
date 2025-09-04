export interface User{
    username: string;
    knownAs?: string;
    gender?: string;
    token?: string;
    photoUrl?: string;
    roles: string[];
    isOnline?: boolean;
    created?: Date;
    lastActive?: Date;
    id?: number;
}