import React from "react"
import ReactDOM from "react-dom"
import App from "./components/App/App"
// import { store, reducers } from "./store"
import { initStore } from "./store"
import { BrowserRouter, Router } from "react-router-dom"
// import registerServiceWorker from './registerServiceWorker';
import { history } from "./history"
// import './index.css';
// import './style.css';

// const store = initStore({})

if (typeof window !== "undefined") {
    ReactDOM.render(
        // <BrowserRouter>
        // using universal history instead
        <Router history={history}>
            <App />
        </Router>,
        document.getElementById("root")
    )
}
// registerServiceWorker();

export default App
export { App }
