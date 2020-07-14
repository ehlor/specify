export default class AudioPlayer {
    constructor(volume) {
        this.player = new Audio()
        this.player.volume = volume
        this.srcElement = null
        this.isPlaying = false
    }

    stop() {
        this.srcElement.querySelector('img').src = 'images/play.svg'
        this.player.pause()
        this.player.currentTime = 0
        this.isPlaying = false
    }

    play() {
        this.srcElement.querySelector('img').src = 'images/stop.svg'
        this.player.play()
        this.isPlaying = true
    }

    setSources(url, context) {
        this.player.src = url
        this.srcElement = context
    }
}