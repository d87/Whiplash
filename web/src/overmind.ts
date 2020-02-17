import { createOvermind, IConfiguration } from "overmind"
import { createHook, Provider } from "overmind-react"

import { namespaced } from 'overmind/config'
import * as tasks from './components/Tasks'
// import * as admin from './admin'

export const config = namespaced({
    tasks,
})


export const overmind = createOvermind(config)

export const useOvermind = createHook<typeof config>();