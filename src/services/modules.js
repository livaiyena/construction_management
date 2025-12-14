import api from './api';

export const siteDiaryService = {
    getAll: async (filters) => {
        const response = await api.get('/site-diary', { params: filters });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/site-diary', data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/site-diary/${id}`);
        return response.data;
    }
};

export const taskService = {
    getAll: async (projectId) => {
        const response = await api.get('/tasks', { params: { projectId } });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/tasks', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/tasks/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/tasks/${id}`);
        return response.data;
    }
};

export const docService = {
    getAll: async (projectId) => {
        const response = await api.get('/documents', { params: { projectId } });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/documents', data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/documents/${id}`);
        return response.data;
    }
};

export const materialService = {
    getAll: async () => {
        const response = await api.get('/materials');
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/materials', data);
        return response.data;
    },
    getTransactions: async (id) => {
        const response = await api.get(`/materials/${id}/transactions`);
        return response.data;
    },
    addTransaction: async (id, data) => {
        const response = await api.post(`/materials/${id}/transactions`, data);
        return response.data;
    }
};
