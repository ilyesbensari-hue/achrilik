"use client";

import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    htmlContent: string;
    variables?: string;
    enabled: boolean;
}

export default function AdminEmailsPage() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
    const [editedSubject, setEditedSubject] = useState('');
    const [editedContent, setEditedContent] = useState('');
    const [editedEnabled, setEditedEnabled] = useState(true);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/admin/emails');
            const data = await res.json();
            setTemplates(data);
        } catch (error) {
            logger.error('Error fetching templates:', { error });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTemplate = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setEditedSubject(template.subject);
        setEditedContent(template.htmlContent);
        setEditedEnabled(template.enabled);
    };

    const handleSave = async () => {
        if (!selectedTemplate) return;

        try {
            const res = await fetch('/api/admin/emails', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: selectedTemplate.name,
                    subject: editedSubject,
                    htmlContent: editedContent,
                    enabled: editedEnabled
                })
            });

            if (res.ok) {
                alert('Template mis à jour avec succès!');
                fetchTemplates();
                setSelectedTemplate(null);
            } else {
                alert('Erreur lors de la mise à jour');
            }
        } catch (error) {
            logger.error('Error updating template:', { error });
            alert('Erreur lors de la mise à jour');
        }
    };

    const getTemplateName = (name: string) => {
        const names: Record<string, string> = {
            welcome: 'Email de Bienvenue',
            order_confirmation: 'Confirmation de Commande',
            product_approved: 'Produit Approuvé',
            product_rejected: 'Produit Rejeté',
            order_status_update: 'Mise à Jour de Commande'
        };
        return names[name] || name;
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestion des Emails</h1>

            {loading ? (
                <div className="text-center py-12">Chargement...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Template List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-900">Modèles d'email</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {templates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => handleSelectTemplate(template)}
                                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedTemplate?.id === template.id ? 'bg-indigo-50' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {getTemplateName(template.name)}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {template.subject}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${template.enabled
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {template.enabled ? 'Actif' : 'Inactif'}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Template Editor */}
                    <div className="lg:col-span-2">
                        {selectedTemplate ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        {getTemplateName(selectedTemplate.name)}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Variables disponibles: {selectedTemplate.variables ? JSON.parse(selectedTemplate.variables).join(', ') : 'Aucune'}
                                    </p>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sujet de l'email
                                        </label>
                                        <input
                                            type="text"
                                            value={editedSubject}
                                            onChange={(e) => setEditedSubject(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contenu HTML
                                        </label>
                                        <textarea
                                            value={editedContent}
                                            onChange={(e) => setEditedContent(e.target.value)}
                                            rows={15}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="enabled"
                                            checked={editedEnabled}
                                            onChange={(e) => setEditedEnabled(e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
                                            Template activé
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSave}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                    >
                                        Sauvegarder
                                    </button>
                                    <button
                                        onClick={() => setSelectedTemplate(null)}
                                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                <p className="text-gray-500">Sélectionnez un template pour le modifier</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
