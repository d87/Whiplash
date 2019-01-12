import express from 'express'
import mongoose from 'mongoose'
import { Task } from '../models'
const router = express.Router()


router.get('/', async (req, res, next) => {
  const q = Task.find()
  // q.then((task) => {
  //   res.render('index', { title: task.title });
  // }).catch((err) =>{
  //   // logger.error(err);
  //   res.status(422).send(err.errors);
  // })
  try{
    let tasks = await q.lean()
    return res.jsend.success(tasks)
  }
  catch (err) {
    return res.jsend.error(err.errors)
  }
})

router.get('/:task_id', async (req, res, next) => {
  const q = Task.find({ _id: req.params.task_id})

  try{
    let task = await q.lean()
    return res.jsend.success(task)
  }
  catch (err) {
    return res.jsend.error(err.errors)
  }
})

router.get('/:task_id', async (req, res, next) => {
  const q = Task.find({ _id: req.params.task_id})

  try{
    let task = await q.lean()
    return res.jsend.success(task)
  }
  catch (err) {
    return res.jsend.error(err.errors)
  }
})


router.post('/:task_id/sync', async (req, res, next) => {
  const newTime = parseInt(req.body.newTime,10)

  const q = Task.find({ _id: req.params.task_id})
  try{
    let task = await q
    task.task_time = newTime
    if (task.task_time >= task.task_length){
      task.task_time = task.task_length
      task.task_state = "COMPLETED"
    }
    task.save()
    return res.jsend.success(task.lean())
  }
  catch (err) {
    return res.jsend.error(err.errors)
  }
})

export default router
