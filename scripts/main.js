import authorize from './auth.js'
import AudioPlayer from './audioPlayer.js'
import Tracks from './tracks.js'
import Toast from './toastMessages.js'


let trackSearchList = document.querySelector('.trackSearchList')
const tBox = document.querySelector('#transitionBox')
const similarTrackList = document.querySelector('#similarTrackList')

const config = { newTopMargin: 20 }
const states = { featuresOn: false, deselectOn: false, page: 0 }
let audio = new AudioPlayer(0.25)
export let tracks = new Tracks(5, 10)
export let toast = new Toast()




// ------------------------------ EVENTS ------------------------------

// Close track list
document.addEventListener('click', event => {
    if (!event.target.closest('.trackSearchList') &&
        !event.target.closest('.searchBar')) {
        trackSearchList.classList.remove('active')
    }
})

document.querySelectorAll('.searchBar').forEach(element => {

    // Open track list
    element.addEventListener('click', () => {
        trackSearchList.classList.add('active')
    })

    // Get track list
    element.addEventListener('input', async event => {
        const query = event.target.value
        const response = await tracks.getSearchResults(query)
        tracks.suggested = []
        try {
            tracks.suggested.push(...response.tracks.items)
            tracks.showSearchResults()
        } catch {
            trackSearchList.innerHTML = ''
        }
    })
})

// Select track
document.querySelectorAll('.trackSearchList').forEach(element => {
    element.addEventListener('click', async event => {
        const item = event.target.closest('li')
        const list = [...trackSearchList.childNodes]
        const index = list.indexOf(item)
        const mainTrackResponse = tracks.suggested[index]
        try {
            tracks.mainTrack = mainTrackResponse
            tracks.show(false, true)
        } catch(err) {
            console.log(err)
        }

        trackSearchList.classList.remove('active')
        if (states.page === 0) transition()
        tracks.showMainTrack()
    })
})

// Transition to page 2
tBox.addEventListener('transitionend', event => {
    document.querySelector('#main2').classList.add('active')
    document.querySelector('#main').classList.remove('active')
})

// Select track
similarTrackList.addEventListener('click', event => {
    if (event.target.className === 'selectTrack') {
        const li = event.target.closest('li')
        const list = [...similarTrackList.childNodes]
        const index = list.indexOf(li)
        if (li.classList.contains('selectedTrack')) {
            li.classList.remove('selectedTrack')
            tracks.selected = tracks.selected.filter(e => e != tracks.recommended[index].uri)
        } else {
            li.classList.add('selectedTrack')
            tracks.selected.push(tracks.recommended[index].uri)
        }
    } else if (event.target.closest('.playTrack')) {
        const context = event.target.closest('li > div')
        if (context.isEqualNode(audio.srcElement)) {
            if (audio.isPlaying) audio.stop()
            else audio.play()
        } else {
            if (audio.isPlaying) audio.stop()
            const li = context.closest('li')
            const nodes = [...similarTrackList.childNodes]
            const index = nodes.indexOf(li)
            audio.setSources(tracks.recommended[index].preview_url, context)
            audio.play()
        }
    }
})

// Load more tracks
document.querySelector('#loadButton').addEventListener('click', async event => {
    tracks.show(true, false)
})

// Apply features
document.querySelector('#selectFeaturesButton').addEventListener('click', async event =>{
    const featureConfig = {
        acousticness: [],
        danceability: [],
        energy: [],
        instrumentalness: [],
        liveness: [],
        speechiness: [],
        valence: []
    }
    document.querySelectorAll('.slider').forEach((element, index) => featureConfig[Object.keys(featureConfig)[index]] = element.noUiSlider.get())
    tracks.show(false, false, featureConfig)
})

audio.player.addEventListener('ended', event => {
    audio.stop()
})

// Deselect all tracks
document.querySelector('#deselectAll').addEventListener('click', event => {
    document.querySelectorAll('#similarTrackList > li').forEach(element => {
        element.classList.remove('selectedTrack')
    })
    tracks.selected = []
})

// Toggle feature section on tracks
document.querySelector('#toggleFeatures').addEventListener('click', () => {
    if (states.featuresOn === false) {
        document.querySelectorAll('.trackFeatures').forEach(element => {
            element.style = 'min-width: 90px;'
        })
        states.featuresOn = true
    } else {
        document.querySelectorAll('.trackFeatures').forEach(element => {
            element.style = ''
        })
        states.featuresOn = false
    }
    document.querySelectorAll('.trackFeatures')
})

// create sliders
document.querySelectorAll('.slider').forEach(element => {
    noUiSlider.create(element, {
        start: [0, 1],
        connect: true,
        range: {
            'min': 0,
            'max': 1
        }
    })
})





// ------------------------------ FUNCTIONS ------------------------------

function transition(){
    const pos = tBox.getBoundingClientRect()
    const topMargin = config.newTopMargin - pos.top
    const searchBars = document.querySelectorAll('.searchBar')
    const searchLists = document.querySelectorAll('.trackSearchList')
    states.page = 1
    trackSearchList = searchLists[1]
    trackSearchList.append(...searchLists[0].childNodes)
    searchBars[1].value = searchBars[0].value
    tBox.style = `
        margin-top: ${topMargin}px;
        padding-bottom: ${topMargin*(-1)}px;
    `
}

authorize()