import { CronJob } from "cron"
import { pubsub } from "./subscriptionServer"
import { Task, User, IUserModel, ITaskModel } from './models'
import { eachLimit as asyncEachLimit } from 'async'

const dayLength = 24 * 3600 * 1000

export const startDailyResetJob = () => {
    // Run this cron job every day at 7:00:00
    return new CronJob(
        "00 00 7 * * *",
        async () => {
            const now = Date.now()
            console.log("Starting reset...")

            const users: IUserModel[] = await User.find()

            asyncEachLimit(users, 5, async (user) => {
                await Task.find({
                    userID: user._id,
                    isRecurring: true,
                    $or: [{ progress: { $gt: 0 } }, { state: "completed" }]
                }).exec((err, tasks: ITaskModel[]) => {
                    if (err) return console.error(err)
                    tasks.map(task => {
                        task.progress = 0
    
                        if (task.state === "completed") {
                            if (task.resetMode === "inDays") {
                                const nDays = task.resetTime
                                if (task.completedAt.getTime() < now - (nDays - 1) * dayLength) {
                                    task.state = "active"
                                }
                            }
                        }
    
                        task.save()
                    })
                })

                pubsub.publish("TASKS_UPDATE", { channelID: user._id })
            })        
            
            
        },
        null,
        true,
        "Asia/Novosibirsk"
    )
}
