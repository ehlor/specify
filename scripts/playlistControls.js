import {tracks} from './main.js'
import Playlists from './playlists.js'

const toNewPlaylist = document.querySelector('#toNewPlaylist > div')
const toExistingPlaylist = document.querySelector('#toExistingPlaylist > div')
const playlistList = document.querySelector('#playlistList')
const isOpen = { toNewPlaylist: false, toExistingPlaylist: false }
let playlists = new Playlists()




// ------------------------------ EVENTS ------------------------------

document.addEventListener('click', event => {
    if (!event.target.closest('.simpleBlock')) {
        closePlaylists()
    }
})

// Open/close "Add to new playlist" menu
document.querySelector('#toNewPlaylist button').addEventListener('click', event => {
    if (isOpen.toNewPlaylist) {
        toNewPlaylist.style = ''
        clearErrorAddToPlaylist('#playlistName')
    } else {
        // close other menu
        toExistingPlaylist.style = ''
        document.querySelector('#toExistingPlaylist').style = ''
        document.querySelector('#sideControls').style = ''
        clearErrorAddToPlaylist('#selectPlaylist')
        isOpen.toExistingPlaylist = false

        toNewPlaylist.style = `height: ${toNewPlaylist.scrollHeight}px;`
    }
    isOpen.toNewPlaylist = !isOpen.toNewPlaylist
})

// Open/close "Add to existing playlist" menu
document.querySelector('#toExistingPlaylist button').addEventListener('click', event => {
    if (isOpen.toExistingPlaylist) {
        toExistingPlaylist.style = ''
        document.querySelector('#toExistingPlaylist').style = ''
        document.querySelector('#sideControls').style = ''
        clearErrorAddToPlaylist('#selectPlaylist')
    } else {
        // close other menu
        toNewPlaylist.style = ''
        clearErrorAddToPlaylist('#playlistName')
        isOpen.toNewPlaylist = false

        const top = parseInt(getComputedStyle(document.querySelector('#sideControls')).top, 10)
        const height = parseInt(getComputedStyle(toExistingPlaylist).height, 10)
        document.querySelector('#sideControls').style = `top: ${top - (toExistingPlaylist.scrollHeight - height)}px;`
        document.querySelector('#toExistingPlaylist').style = `height: ${toExistingPlaylist.scrollHeight}px;`
        toExistingPlaylist.style = `height: ${toExistingPlaylist.scrollHeight}px;`
    }
    isOpen.toExistingPlaylist = !isOpen.toExistingPlaylist
})

document.querySelector('#sideControls').addEventListener('transitionend', event => {
    if (isOpen.toExistingPlaylist) {
        toExistingPlaylist.style.setProperty('overflow', 'visible', '')
    }
})

// Create new playlist
document.querySelector('#newPlaylistConfirm').addEventListener('click', async event => {
    if (playlists.userId === undefined) return
    clearErrorAddToPlaylist('#playlistName', true)
    const isPrivate = document.querySelector('#privateToggle').checked
    const isOnlySelected = document.querySelector('#selectedToggle2').checked
    const name = document.querySelector('#playlistName').value
    if (name.length === 0) {
        showErrorAddToPlaylist('#playlistName')
        return
    }
    try {
        const playlist = await playlists.createPlaylist(name, isPrivate)
        await playlists.addToPlaylist(tracks, isOnlySelected, playlist.id)
    } catch(err) {
        console.log(err)
    }
})

// Add songs to existing playlist
document.querySelector('#existingPlaylistConfirm').addEventListener('click', async event => {
    clearErrorAddToPlaylist('#selectPlaylist', true)
    const isOnlySelected = document.querySelector('#selectedToggle1').checked
    if (playlists.selected === undefined) {
        showErrorAddToPlaylist('#selectPlaylist')
        return
    }
    try {
        await playlists.addToPlaylist(tracks, isOnlySelected, playlists.selected.id)
    } catch(err) {
        console.log(err)
    }
})

// open playlist dropdown menu
document.querySelector('#selectPlaylist').addEventListener('click', event => {
    playlistList.classList.add('active')
    const selectPlaylist = document.querySelector('#selectPlaylist')
    selectPlaylist.style.setProperty('border-bottom-left-radius', '0', '')
    selectPlaylist.style.setProperty('border-bottom-right-radius', '0', '')
    document.querySelector('#selectPlaylist > img').src = 'images/chevron-up.svg'
})

// select playlist
playlistList.addEventListener('click', event => {
    const item = event.target.closest('li')
    const list = [...playlistList.childNodes]
    const index = list.indexOf(item)
    playlists.selected = playlists.data[index]
    document.querySelector('#selectPlaylist > p').textContent = playlists.selected.name
    document.querySelector('#selectPlaylist').style = 'font-weight: 600; background-color: #9C6ADA;'
    closePlaylists()
})





// ------------------------------ FUNCTIONS ------------------------------

function closePlaylists() {
    playlistList.classList.remove('active')
    document.querySelector('#selectPlaylist > img').src = 'images/chevron-down.svg'
    document.querySelector('#selectPlaylist').style.removeProperty('border-bottom-left-radius')
    document.querySelector('#selectPlaylist').style.removeProperty('border-bottom-right-radius')
}

function clearErrorAddToPlaylist(elementId, isFromConfirm = false) {
    const msg = document.querySelector(`${elementId}`).previousSibling
    if (msg != null) msg.remove()
    if (elementId === '#playlistName') {
        toNewPlaylist.style.removeProperty('transition')
        if (isFromConfirm) {
            toNewPlaylist.style = `height: auto;`
            toNewPlaylist.style = `height: ${toNewPlaylist.scrollHeight}px;`
        }
    } else if (elementId === '#selectPlaylist') {
        toExistingPlaylist.style.removeProperty('transition')
        document.querySelector('#sideControls').style.removeProperty('transition')
        document.querySelector('#toExistingPlaylist').style.removeProperty('transition')
        if (isFromConfirm) {
            const height = parseInt(getComputedStyle(toExistingPlaylist).height, 10)
            const top = parseInt(getComputedStyle(document.querySelector('#sideControls')).top, 10)
            toExistingPlaylist.style.setProperty('height', 'auto', '')
            toExistingPlaylist.style.setProperty('height', `${toExistingPlaylist.scrollHeight}px`, '')
            document.querySelector('#toExistingPlaylist').style.setProperty('height', `${toExistingPlaylist.scrollHeight}px`, '')
            document.querySelector('#sideControls').style.setProperty('top', `${top + (height - toExistingPlaylist.scrollHeight)}px`, '')
        }
    }
}

function showErrorAddToPlaylist(elementId) {
    const parent = document.querySelector(`${elementId}`).parentNode
    const p = document.createElement('p')
    let msg
    if (elementId = '#playlistName') {
        msg = document.createTextNode('Please enter a playlist name')
    } else if (elementId === '#selectPlaylist') {
        msg = document.createTextNode('Please select a playlist')
    }
    p.appendChild(msg)
    p.className = 'inputError'
    parent.prepend(p)

    if (elementId === '#playlistName') {
        toNewPlaylist.style.setProperty('transition', 'unset', '')
        toNewPlaylist.style.setProperty('height', `${toNewPlaylist.scrollHeight}px`, '')
    } else if (elementId === '#selectPlaylist') {
        toExistingPlaylist.style.setProperty('transition', 'unset', '')
        document.querySelector('#sideControls').style.setProperty('transition', 'unset', '')
        document.querySelector('#toExistingPlaylist').style.setProperty('transition', 'unset', '')
        const top = parseInt(getComputedStyle(document.querySelector('#sideControls')).top, 10)
        const height = parseInt(getComputedStyle(toExistingPlaylist).height, 10)
        document.querySelector('#sideControls').style.setProperty('top', `${top - (toExistingPlaylist.scrollHeight - height)}px`, '')
        document.querySelector('#toExistingPlaylist').style.setProperty('height', `${toExistingPlaylist.scrollHeight}px`, '')
        toExistingPlaylist.style.setProperty('height', `${toExistingPlaylist.scrollHeight}px`, '')
    }
}




playlists.init()