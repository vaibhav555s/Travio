import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

/** Decode JWT payload without a library */
function decodeToken(token) {
    try {
        const payload = token.split('.')[1]
        const decoded = JSON.parse(atob(payload))
        return decoded
    } catch {
        return null
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)

    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            const storedName = localStorage.getItem('userName') || ''
            const storedEmail = localStorage.getItem('userEmail') || ''
            // Try JWT decode as fallback (for backwards compat / other fields)
            const payload = decodeToken(token) || {}
            const id = payload.id || payload._id || payload.sub || ''
            setUser({
                name: storedName || payload.name || payload.username || 'Traveler',
                email: storedEmail || payload.email || '',
                id,
            })
        }
    }, [])

    const logout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('userName')
        localStorage.removeItem('userEmail')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
