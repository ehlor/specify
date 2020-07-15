const key = '9d2a387bd70e41c3ab060624c0bdb172'
const redirectUri = encodeURI('http://localhost:5500') // http://ehlor.github.io/specify, http://localhost:5500
const authEndpoint = 'https://accounts.spotify.com/authorize'
const scopes = decodeURIComponent('playlist-modify-public playlist-modify-private')
const hash = window.location.hash
    .substring(1)
    .split('&')
    .reduce((res, item) => {
        if (item) {
            let parts = item.split('=')
            res[parts[0]] = decodeURIComponent(parts[1])
        }
        return res
    }, {})

export default function authorize(){
    window.location.hash = ''
    if (hash.access_token) {
        window.localStorage.setItem('access_token', hash.access_token)
        window.localStorage.setItem('expires_in', hash.expires_in)
        window.localStorage.setItem('auth_date', Date.now())
    }
    if (!window.localStorage.access_token || 
        Math.floor((Date.now() - window.localStorage.auth_date)/1000) > window.localStorage.expires_in) {
        window.location = `${authEndpoint}?client_id=${key}&response_type=token&scope=${scopes}&redirect_uri=${redirectUri}`
    }
}