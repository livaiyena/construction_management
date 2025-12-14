import api from './api';

export const settingsService = {
    getAllSettings: async () => {
        const response = await api.get('/settings');
        return response.data;
    },

    updateSetting: async (key, value) => {
        const response = await api.put(`/settings/${key}`, { value });
        return response.data;
    },

    getSecurityLogs: async () => {
        const response = await api.get('/settings/logs');
        return response.data;
    }
};

export const usersService = {
    getAllUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    createUser: async (userData) => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    }
};
