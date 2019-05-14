import { CronJob } from "cron"
import { pubsub } from "./pubsub"
import { Task, User, IUser, IUserModel, ITaskModel, ITask } from './models'
import { eachLimit as asyncEachLimit } from 'async'
import { logger } from './logger'

const dayLength = 24 * 3600 * 1000
const resetHour = 7

export const resetTasks = async () => {
    logger.info("Starting reset...")
    const d = new Date()
    d.setHours(resetHour)
    d.setMinutes(0)
    d.setSeconds(0)
    const todayResetTime = d.getTime()
    const users: IUser[] = await User.find()

    asyncEachLimit(users, 5, async (user) => {
        await Task.find({
            userID: user._id,
            isRecurring: true,
            $or: [{ progress: { $gt: 0 } }, { state: "completed" }]
        }).exec()
        .then((tasks: ITaskModel[]) => {
            // if (err) return logger.error(err)
            return tasks.reduce((acc: object[], task: ITaskModel, index?: number, array?: ITaskModel[]) => {
                let isChanged = false    
                if (task.state === "completed") {
                    if (task.resetMode === "inDays") {
                        const nDays = task.resetTime
                        if (task.completedAt.getTime() < todayResetTime - (nDays - 1) * dayLength) {
                            task.state = "active"
                            task.completedAt = null
                            isChanged = true
                        }
                    }
                }
                if (task.progress > 0){
                    task.progress = 0
                    isChanged = true
                }


                // -------------------- Remove this
                if (task.isRecurring)
                    isChanged = true

                if (isChanged) {
                    task.save()
                    acc.push(task.toObject())
                }
                return acc
            }, [])
        })
        .catch(err => logger.error(err) )
        .then((changedTasks) => {
            if (changedTasks.length > 0 ) {
                logger.debug(`Publishing TASKS_UPDATE ${user._id}`) 
                pubsub.publish("TASKS_UPDATE", { targetUserID: user._id, tasks: changedTasks })
            }
        })
    })           
}

export const scheduleDailyResets = () => {
    // Run this cron job every day at 7:00:00
    return new CronJob(
        `00 00 ${resetHour} * * *`,
        resetTasks,
        null,
        true,
        "Asia/Novosibirsk"
    )
}
