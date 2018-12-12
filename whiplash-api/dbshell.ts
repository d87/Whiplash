import * as models from './models'
import awaitRepl from 'await-repl'

// Node 10+ has --experimental-repl-await option

const repl = awaitRepl({
  rejectionHandler: (err) => 'Promise rejection: ' + err,
  awaitTimeout: 2000
});

for (const [k,v] of Object.entries(models)) {
    repl.context[k] = v
}