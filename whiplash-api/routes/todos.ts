import express from 'express'
import mongoose from 'mongoose'
import { Todo } from '../models'
const router = express.Router()


router.get('/', async (req, res, next) => {
  const q = Todo.find()
  try{
    let tasks = await q.lean()
    return res.jsend.success(tasks)
  }
  catch (err) {
    return res.jsend.error(err.errors)
  }
})
// TODO: POST/CREATE

router.get('/:todo_id', async (req, res, next) => {
  const q = Todo.find({ _id: req.params.todo_id})
  try{
    let task = await q.lean()
    return res.jsend.success(task)
  }
  catch (err) {
    return res.jsend.error(err.errors)
  }
})
// TODO: PUT
// TODO: DELETE

export default router
