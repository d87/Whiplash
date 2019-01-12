import { createBrowserHistory, createMemoryHistory } from 'history';

const isBrowser = typeof window !== "undefined"

export const history = isBrowser ? createBrowserHistory() : createMemoryHistory()