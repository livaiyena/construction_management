import { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    // LocalStorage'dan logları başlat, yoksa boş dizi
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('site_logs');
        return saved ? JSON.parse(saved) : [];
    });

    const [unreadCount, setUnreadCount] = useState(0);

    // Notifications değiştiğinde unread sayısını güncelle ve localStorage'a kaydet
    useEffect(() => {
        localStorage.setItem('site_logs', JSON.stringify(notifications));
        const unread = notifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
    }, [notifications]);

    const [settings, setSettings] = useState(() => {
        const savedSettings = localStorage.getItem('site_settings')
        return savedSettings ? JSON.parse(savedSettings) : { maxLogs: 500, maxPopupHeight: 400 }
    })

    useEffect(() => {
        localStorage.setItem('site_settings', JSON.stringify(settings))
    }, [settings])

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }))
    }

    /**
     * Yeni bir bildirim/log ekler
     * @param {string} type - 'success', 'error', 'warning', 'info'
     * @param {string} message - Bildirim mesajı
     * @param {string} category - 'AUTH', 'PROJECT', 'EMPLOYEE', 'EXPENSE', 'REPORT', 'SYSTEM'
     */
    const addNotification = (type, message, category = 'SYSTEM') => {
        const newNotification = {
            id: Date.now(),
            type,
            message,
            category,
            timestamp: new Date().toISOString(),
            isRead: false
        };
        // En yeni en üstte olacak şekilde ekle ve limiti uygula
        setNotifications(prev => {
            const updated = [newNotification, ...prev]
            if (settings.maxLogs && updated.length > settings.maxLogs) {
                return updated.slice(0, settings.maxLogs)
            }
            return updated
        });
    };

    /**
     * Tüm bildirimleri okundu olarak işaretler
     */
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    /**
     * Bildirim geçmişini temizler
     */
    const clearNotifications = () => {
        setNotifications([]);
    };

    const value = {
        notifications,
        unreadCount,
        addNotification,
        markAllAsRead,
        clearNotifications,
        settings,
        updateSettings
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
