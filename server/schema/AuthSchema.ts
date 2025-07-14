import Joi from "joi";

export const authSchema = Joi.object<{
    totp:string,
    password:string,
}>({
    totp: Joi.string().required(),
    password: Joi.string().required(),
})
