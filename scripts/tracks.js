export default class Tracks {
    constructor(sLimit, rLimit) {
        this.suggested = []
        this.recommended = []
        this.selected = []
        this.cfg = { sLimit, rLimit } // suggestion and recommendation amount
        this.seed = { artists: null, genres: null, tracks: null }
        this.mainTrack = null
    }

    async show(toAppend, isNew, featuresOn, featureConfig = null) {
        if (isNew) await this.setSeeds()
        if (!toAppend) this.clear()
        const tracks = await this.getRecommendedTracks(toAppend, featureConfig)
        this.recommended.push(...tracks)
        const features = await this.getFeatures(tracks, this.cfg.rLimit)
        this.showRecommendedTracks(tracks, features, toAppend, featuresOn)
    }

    clear() {
        this.recommended = [],
        this.selected = []
    }




    getArtistInfo() {
        return fetch(this.mainTrack.artists[0].href, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + window.localStorage.access_token
            }
        })
        .then(res => res.json())
        .catch(err => console.log(err))
    }

    async setSeeds() {
        const artistInfo = await this.getArtistInfo()
        let genres = artistInfo.genres.slice(0,3)
        this.seed.artists = this.mainTrack.artists[0].id
        this.seed.genres = encodeURIComponent(genres.join(','))
        this.seed.tracks = this.mainTrack.id
    }

    getFeatures(tracks, count) {
        const ids = encodeURIComponent(tracks.slice(-count).map(x => x.id).join(','))
        return fetch(`https://api.spotify.com/v1/audio-features?ids=${ids}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + window.localStorage.access_token
            }
        })
        .then(res => res.json())
        .then(data => data.audio_features)
        .catch(err => console.log(err))
    }

    async getRecommendedTracks(toAppend, features) {
        let response, data, tracks, result = [],
            url = `https://api.spotify.com/v1/recommendations?` +
                `seed_artists=${this.seed.artists}&seed_genres=${this.seed.genres}&seed_tracks=${this.seed.tracks}` +
                `&limit=${toAppend ? this.cfg.rLimit*2 : this.cfg.rLimit}`
        if (features != null) {
            for (const property in features) {
                url += `&min_${property}=${features[property][0]}&max_${property}=${features[property][1]}`
            }
        }
        do {
            try {
                response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + window.localStorage.access_token
                    }
                })
                data = await response.json()
            } catch(err) {
                console.log(err)
            }
            tracks = data.tracks
            if (!toAppend) return tracks
            tracks = tracks.filter(item => !this.recommended.some(track => track.id === item.id))
            result.push(...tracks)
        } while (tracks.length < this.cfg.rLimit)
        return result.slice(0, this.cfg.rLimit)
    }

    showRecommendedTracks(trackList, features, toAppend, featuresOn) {
        const fragment = new DocumentFragment()
        let trackCard, previewBlock, fIndex, fValues, fStyle = ''
        if (!toAppend) {
            document.querySelector('#similarTrackList').innerHTML = ''
            this.selected = []
        }
        if (featuresOn) {
            fStyle = ' style="min-width: 90px;"'
            console.log('a')
        }
        trackList.forEach((item, index) => {
            fIndex = features.length - this.cfg.rLimit + index
            fValues = [
                Math.round(features[fIndex].acousticness*100),
                Math.round(features[fIndex].danceability*100),
                Math.round(features[fIndex].energy*100),
                Math.round(features[fIndex].instrumentalness*100),
                Math.round(features[fIndex].liveness*100),
                Math.round(features[fIndex].speechiness*100),
                Math.round(features[fIndex].valence*100)
            ]
            if (item.preview_url != null) {
                previewBlock = 
                    `<button class="playTrack">
                        <img src="images/play.svg">PLAY` +
                    `</button>`
            } else {
                previewBlock = ''
            }
            trackCard = `
                <a href="${item.external_urls.spotify}" target="_blank">
                    <img src="${item.album.images[0].url}">
                </a>
                <div>
                    <p class="trackName">${item.name}</p>
                    <p class="artistName">${item.artists[0].name}</p>
                    ${previewBlock}
                    <button class="selectTrack">SELECT</button>
                </div>
                <div class="trackFeatures"${fStyle}>
                    <div class="acousticness" style="width: ${fValues[0]}%;">${fValues[0]}</div>
                    <div class="danceability" style="width: ${fValues[1]}%;">${fValues[1]}</div>
                    <div class="energy" style="width: ${fValues[2]}%;">${fValues[2]}</div>
                    <div class="instrumentalness" style="width: ${fValues[3]}%;">${fValues[3]}</div>
                    <div class="liveness" style="width: ${fValues[4]}%;">${fValues[4]}</div>
                    <div class="speechiness" style="width: ${fValues[5]}%;">${fValues[5]}</div>
                    <div class="valence" style="width: ${fValues[6]}%;">${fValues[6]}</div>
                </div>`
            const li = document.createElement('li')
            li.innerHTML = trackCard
            li.className = 'track'
            fragment.appendChild(li)
        })
        document.querySelector('#similarTrackList').appendChild(fragment)
    }

    getSearchResults(query) {
        return fetch(`https://api.spotify.com/v1/search?q=${query}&limit=${this.cfg.sLimit}&type=track`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + window.localStorage.access_token
            }
        })
        .then(res => res.json())
        .then(data => this.suggested = data.tracks.items)
        .catch(err => console.log(err))
    }

    showSearchResults(list) {
        let li, p, img, name, a
        list.innerHTML = ''
        this.suggested.forEach(track => {
            li = document.createElement('li')
            p = document.createElement('p')
            img = document.createElement('img')
            a = document.createElement('a')
            name = document.createTextNode(`${track.artists[0].name} - ${track.name}`)
    
            a.href = '#'
            img.src = track.album.images[2].url // 64px image
            a.appendChild(img)
            p.appendChild(name)
            a.appendChild(p)
            li.appendChild(a)
            list.appendChild(li)
        })
    }

    showMainTrack() {
        document.querySelector('.track img').src = this.mainTrack.album.images[0].url // 640px image
        document.querySelector('.trackName').textContent = this.mainTrack.name
        document.querySelector('.artistName').textContent = this.mainTrack.artists[0].name
    }
}