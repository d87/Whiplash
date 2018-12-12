import React from "react"
import ReactDOM from "react-dom"
import Modal from "react-modal"
import styles from './Modal.scss'
import { TaskEditor } from './Task'

const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)"
    }
}

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#root")

export class AddButton extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            modalIsOpen: false
        }

        this.openModal = this.openModal.bind(this)
        this.afterOpenModal = this.afterOpenModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
    }

    openModal() {
        this.setState({ modalIsOpen: true })
    }

    afterOpenModal() {
        // references are now sync'd and can be accessed.
        this.subtitle.style.color = "#f00"
    }

    closeModal() {
        this.setState({ modalIsOpen: false })
    }

    render() {
        return (
            <div>
                <button onClick={this.openModal}>Open Modal</button>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    styleName="modal"
                    overlayClassName={styles.overlay}
                    // style={customStyles}
                    contentLabel="Example Modal"
                >
                    <TaskEditor />
                </Modal>
            </div>
        )
    }
}
