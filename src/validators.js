import * as yup from "yup"

// generic
export const boolValidator = yup.bool()
export const stringValidator = yup.string()

export const idValidator = yup.number().integer().min(1)

// pages
export const titleValidator = yup.string().min(1).max(300)

export const contentValidator = yup.string().min(1)

// users
export const firstNameValidator = yup.string().min(1)

export const lastNameValidator = yup.string().min(1)

export const emailValidator = yup.string().email()

export const passwordValidator = yup.string().min(8)

//navigationMenu
export const nameValidator = yup.string().min(1)

// collection (pagination, order, etc.)
export const limitValidator = yup.number().integer().min(1).max(100).default(5)

export const pageValidator = yup.number().integer().min(1).default(1)

export const orderFieldValidator = (fields) => yup.string().oneOf(fields)

export const orderValidator = yup.string().lowercase().oneOf(["asc", "desc"])

export const filterValidator = (fields) => yup.string().lowercase().oneOf(fields)

export const jsonValidator = yup.mixed()