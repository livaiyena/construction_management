import React from 'react';
import Portal from '../Portal';

const LogDetailModal = ({ log, onClose }) => {
    if (!log) return null;

    // JSON formatında changes verisi varsa parse et
    let parsedChanges = null;
    try {
        if (log.changes && typeof log.changes === 'string') {
            parsedChanges = JSON.parse(log.changes);
        } else if (log.changes && typeof log.changes === 'object') {
            parsedChanges = log.changes;
        }
    } catch (e) {
        console.error('Changes parse hatası:', e);
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getActionBadgeColor = (action) => {
        const colors = {
            'CREATE': 'bg-green-100 text-green-800',
            'UPDATE': 'bg-blue-100 text-blue-800',
            'DELETE': 'bg-red-100 text-red-800',
            'LOGIN': 'bg-purple-100 text-purple-800',
            'LOGOUT': 'bg-gray-100 text-gray-800'
        };
        return colors[action] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Portal>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Log Detayları
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                        <div className="space-y-4">
                            {/* Temel Bilgiler */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Temel Bilgiler</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Log ID</p>
                                        <p className="text-sm font-medium text-gray-900">{log.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">İşlem Zamanı</p>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(log.timestamp)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Kullanıcı</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {log.userName || 'Bilinmeyen Kullanıcı'} (ID: {log.userId || 'N/A'})
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">İşlem Tipi</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </div>
                                    {log.tableName && (
                                        <div>
                                            <p className="text-xs text-gray-500">Tablo Adı</p>
                                            <p className="text-sm font-medium text-gray-900">{log.tableName}</p>
                                        </div>
                                    )}
                                    {log.recordId && (
                                        <div>
                                            <p className="text-xs text-gray-500">Kayıt ID</p>
                                            <p className="text-sm font-medium text-gray-900">{log.recordId}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Ağ Bilgileri */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Ağ Bilgileri</h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs text-gray-500">IP Adresi</p>
                                        <p className="text-sm font-medium text-gray-900">{log.ipAddress || 'N/A'}</p>
                                    </div>
                                    {log.userAgent && (
                                        <div>
                                            <p className="text-xs text-gray-500">User Agent</p>
                                            <p className="text-sm font-medium text-gray-900 break-all">{log.userAgent}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Değişiklikler */}
                            {parsedChanges && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Değişiklikler</h3>
                                    <div className="bg-white rounded border border-gray-200 p-3">
                                        <pre className="text-xs text-gray-800 overflow-x-auto whitespace-pre-wrap">
                                            {JSON.stringify(parsedChanges, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* Ham Changes Verisi (JSON parse edilemezse) */}
                            {log.changes && !parsedChanges && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Ham Veri</h3>
                                    <div className="bg-white rounded border border-gray-200 p-3">
                                        <pre className="text-xs text-gray-800 overflow-x-auto whitespace-pre-wrap">
                                            {log.changes}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default LogDetailModal;
