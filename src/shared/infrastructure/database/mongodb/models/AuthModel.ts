import mongoose, { Document, Schema } from "mongoose";

// Contrato del modelo
export interface IAuth extends Document {
    _id: string,
    access_token: string,
    refresh_token: string,
    discord_access_token: string,
    discord_refresh_token: string,
    expires: number,
    last_activity: number
}

// Esquema del modelo
const AuthSchema: Schema = new Schema({
    _id: { type: String, required: true },
    access_token: { type: String },
    refresh_token: { type: String },
    discord_access_token: { type: String, required: true },
    discord_refresh_token: { type: String, required: true },
    expires: { type: Number },
    last_activity: { type: Number }
})

// Modelo
export const AuthModel = mongoose.model<IAuth>("Auth", AuthSchema);
