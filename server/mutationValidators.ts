import * as yup from "yup"
// docs: https://github.com/jquense/yup
// positive = moreThan(0)
export const taskInputValidationSchema = yup.object().shape({
    _id: yup.string(),
    title: yup.string().trim().required(),
    description: yup.string(),
    isRecurring: yup.boolean(),
    priority: yup
        .number()
        .required()
        .positive()
        .integer()
        .min(1)
        .max(4),
    state: yup.string().matches(/(active|completed|archived)/),
    color: yup.string().matches(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i),
    duration: yup.number().moreThan(-1).integer(),
    segmentDuration: yup.number().moreThan(-1).integer(),
    resetMode: yup.string().matches(/(atDays|inDays)/),
    resetTime: yup.number().positive().integer(),
})


export const taskAddProgressValidationSchema = yup.object().shape({
    id: yup.string().required(),
    time: yup.number().integer().positive().required(),
})