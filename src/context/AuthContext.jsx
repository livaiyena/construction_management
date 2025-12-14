import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sayfa yenilendiğinde LocalStorage'dan bilgileri geri yükle
        const initAuth = () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            // Backend'e istek at
            const response = await api.post('/auth/login', { email, password });
            
            // Backend'den dönen veriyi al (Backend şu formatta dönüyor: { token, user: {...} })
            const { token: newToken, user: userData } = response.data;

            // State'leri güncelle
            setToken(newToken);
            setUser(userData);
            setIsAuthenticated(true);

            // Tarayıcı hafızasına kaydet (Sayfa yenilenince gitmesin diye)
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));

            return { success: true };

        } catch (error) {
            console.error("Giriş Hatası:", error);
            
            // Backend'den gelen hata mesajını döndür
            return { 
                success: false, 
                message: error.response?.data?.message || 'Sunucuya bağlanılamadı veya bilgiler hatalı.' 
            };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};