export function logOut() {
    document.cookie = "access_token=; max-age=0; path=/";
    window.location.replace('/login')
}
