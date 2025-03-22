import { Photo } from "./photo"

export interface Member {
    introduction: any
    id: number
    username: string
    age: number
    photoUrl: string
    knownAs: string
    created: Date
    lastActive: Date
    gender: string
    production: any
    interests: string
    lookingFor: string
    city: string
    country: string
    photos: Photo[]
  }
  
