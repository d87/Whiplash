import React from "react"

import './FilterBar.scss'

class FilterBar extends React.Component {
    // constructor(props) {
        // super(props)
    // }

    render() {
        return (
            <section className="filterBar" >
                <a className={`material-icons iconOn`} >history</a>
                <a className={`material-icons iconOn`} >autorenew</a>
                <a className={`material-icons iconOn`} >highlight_off</a>
                <a className={`material-icons iconOn`} >done_all</a>
            </section>
        )
    }
}


export default FilterBar