export default class Toast {
    constructor() {
        const element = document.createElement('div')
        const type = document.createElement('p')
        const msg = document.createElement('p')
        element.className = 'toast'
        type.className = 'toastType'
        msg.className = 'toastMsg'
        element.appendChild(type)
        element.appendChild(msg)
        document.querySelector('body').appendChild(element)
        this.element = document.querySelector('.toast')
        this.type = document.querySelector('.toastType')
        this.msg = document.querySelector('.toastMsg')
    }

    showMessage(msg, type) {
        this.clear()
        this.setType(type)
        this.msg.textContent = msg
        this.element.style = 'bottom: 50px;'
        setTimeout(() => this.element.style = '', 5000)
    }

    clear() {
        this.element.classList.remove('success')
        this.element.classList.remove('error')
    }

    setType(type) {
        if (type === 'success') {
            this.element.classList.add('success')
            this.type.textContent = 'Success'
        } else {
            this.element.classList.add('error')
            this.type.textContent = 'Error'
        }
    }
}