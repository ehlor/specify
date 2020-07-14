import { toast } from "./main.js"

export default class Playlists{
    constructor() {
        this.data = []
        this.selected = null
        this.userId = null
    }

    async init() {
        try {
            await this.setUserId()
            await this.getPlaylists()
            this.showPlaylists()
        } catch(err) {
            console.log(err)
        }
    }

    createPlaylist(name, isPrivate) {
        return fetch(`https://api.spotify.com/v1/users/${this.userId}/playlists`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + window.localStorage.access_token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'name': name,
                'public': !isPrivate
            })
        })
        .then(res => {
            if (res.ok) {
                toast.showMessage('Playlist has been created', 'success')
                return res.json()
            }
        })
        .catch(err => {
            toast.showMessage('Request failed', 'error')
            console.log(err)
        })
    }

    addToPlaylist(tracks, isOnlySelected, playlistId) {
        let uris
        const loops = isOnlySelected ? Math.floor(tracks.selected.length / 100) + 1 : Math.floor(tracks.recommended.length / 100) + 1
        for (let i = 0; i < loops; i++) {
            if (isOnlySelected) {
                uris = tracks.selected.slice(i*100,(i+1)*100)
            } else {
                uris = []
                tracks.recommended.slice(i*100,(i+1)*100).forEach(e => uris.push(e.uri))
            }
            return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + window.localStorage.access_token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'uris': uris
                })
            })
            .then(res => {
                if (res.ok) toast.showMessage('Tracks have been added to your playlist', 'success')
            })
            .catch(err => {
                toast.showMessage('Request failed', 'error')
                console.log(err)
            })
        }
    }



    async getPlaylists() {
        this.data = []
        const limit = 50
        let offset = 0
        let response, data
        do {
            response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + window.localStorage.access_token
                }
            })
            data = await response.json()
            data.items.forEach(item => {
                if (item.collaborative || item.owner.id === this.userId) {
                    this.data.push(item)
                }
            })
            offset += limit
        } while (data.total === limit)
    }
    
    showPlaylists() {
        let li, text
        const playlistList = document.querySelector('#playlistList')
        this.data.forEach(item => {
            li = document.createElement('li')
            text = document.createTextNode(item.name)
            li.appendChild(text)
            playlistList.appendChild(li)
        })
    }

    setUserId() {
        return fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': 'Bearer ' + window.localStorage.access_token
            }
        })
        .then(res => res.json())
        .then(data => this.userId = data.id)
        .catch(err => console.log(err))
    }
}