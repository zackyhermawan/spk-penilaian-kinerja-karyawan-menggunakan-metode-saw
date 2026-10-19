export const getToken = () => {
    return localStorage.getItem("token")
}

export const setToken = (token: string) => {
    localStorage.setItem("token", token)
}

export const removeToken = () => {
    localStorage.removeItem("token")
}

export const getUser = () => {
    const user = localStorage.getItem("user")

    if(!user) {
        return null
    }

    return JSON.parse(user)
}

export const setUser = (user: unknown) => {
    localStorage.setItem("user", JSON.stringify(user))
}

export const removeUser = () => {
    localStorage.removeItem("user")
}