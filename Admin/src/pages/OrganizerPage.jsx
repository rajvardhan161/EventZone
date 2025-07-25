// src/Pages/OrganizerPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaSpinner, FaCalendarAlt, FaUpload, FaEdit } from 'react-icons/fa';
import { AdminContext } from '../context/AdminContext';

// --- ADAPTIVE ORGANIZER FORM (for Create & Edit) ---
const OrganizerForm = ({ onSubmit, onCancel, isSubmitting, initialData = null }) => {
    const [form, setForm] = useState({
        name: '', tagline: '', description: '', website: '', contactEmail: '',
        events: [{ title: '', date: '' }],
    });

    const [logoFile, setLogoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    // Pre-fill form if initialData is provided (for editing)
    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name || '',
                tagline: initialData.tagline || '',
                description: initialData.description || '',
                website: initialData.website || '',
                contactEmail: initialData.contactEmail || '',
                events: initialData.events?.length > 0 ? initialData.events : [{ title: '', date: '' }],
            });
            setPreviewUrl(initialData.logoUrl); // Show existing logo
        }
    }, [initialData]);

    useEffect(() => {
        return () => previewUrl && !previewUrl.startsWith('http') && URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            if (previewUrl && !previewUrl.startsWith('http')) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleEventChange = (index, e) => {
        const updatedEvents = [...form.events];
        updatedEvents[index][e.target.name] = e.target.value;
        setForm((prev) => ({ ...prev, events: updatedEvents }));
    };

    const addEventField = () => setForm((prev) => ({ ...prev, events: [...prev.events, { title: '', date: '' }] }));
    const removeEventField = (index) => {
        if (form.events.length > 1) {
            setForm((prev) => ({ ...prev, events: prev.events.filter((_, i) => i !== index) }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // If creating, a logo is required. If editing, it's optional.
        if (!initialData && !logoFile) return alert('Please upload a logo image.');
        const nonEmptyEvents = form.events.filter((e) => e.title.trim() && e.date.trim());
        if (nonEmptyEvents.length === 0) return alert('Please add at least one valid event.');
        onSubmit({ ...form, events: nonEmptyEvents, logoFile });
    };

    const inputStyle = 'w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition';
    const isEditing = !!initialData;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{isEditing ? 'Edit Organizer' : 'Create New Organizer'}</h2>
            <div>
                <label className="block text-sm font-medium mb-1">Logo Image{isEditing ? ' (Optional)' : '*'}</label>
                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-gray-100 overflow-hidden ring-2 ring-offset-2 ring-gray-200">
                        {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><FaUpload size={28} /></div>}
                    </div>
                    <label htmlFor="file-upload" className="cursor-pointer bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50">Change file<input id="file-upload" name="image" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" required={!isEditing}/></label>
                </div>
            </div>
            <input name="name" value={form.name} onChange={handleChange} className={inputStyle} placeholder="Organization Name*" required />
            <input name="tagline" value={form.tagline} onChange={handleChange} className={inputStyle} placeholder="Tagline*" required />
            <textarea name="description" rows="3" value={form.description} onChange={handleChange} className={inputStyle} placeholder="Description*" required />
            <div className="grid md:grid-cols-2 gap-4">
                <input name="website" value={form.website} onChange={handleChange} className={inputStyle} placeholder="Website URL*" required />
                <input name="contactEmail" value={form.contactEmail} onChange={handleChange} className={inputStyle} placeholder="Contact Email*" required />
            </div>
            <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-2">Events*</h3>
                {form.events.map((event, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                        <input name="title" value={event.title} onChange={(e) => handleEventChange(idx, e)} className={inputStyle} placeholder="Event Title" required />
                        <input name="date" value={event.date} onChange={(e) => handleEventChange(idx, e)} className={inputStyle} placeholder="e.g. July 2025" required />
                        <button type="button" onClick={() => removeEventField(idx)} disabled={form.events.length <= 1} className="p-2 text-red-500 hover:bg-red-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"><FaTrash /></button>
                    </div>
                ))}
                <button type="button" onClick={addEventField} className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"><FaPlus /> Add Another Event</button>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2">{isSubmitting && <FaSpinner className="animate-spin" />}{isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create')}</button>
            </div>
        </form>
    );
};


const OrganizerPage = () => {
    const { backendUrl, token } = useContext(AdminContext);

    const [organizers, setOrganizers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [error, setError] = useState(null);

    // State for Edit and Delete
    const [editingOrganizer, setEditingOrganizer] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [organizerToDelete, setOrganizerToDelete] = useState(null);

    useEffect(() => {
        if (token) fetchOrganizers();
        else setIsLoading(false);
    }, [token]);

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchOrganizers = async () => {
        setIsLoading(true);
        try {
           const res = await axios.get(`${backendUrl}/api/event/organizers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
            setOrganizers(res.data);
        } catch {
            setError('Failed to fetch organizers. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (formData) => {
        if (editingOrganizer) {
            handleUpdate(formData);
        } else {
            handleCreate(formData);
        }
    };

    const handleCreate = async ({ logoFile, ...fields }) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('image', logoFile);
        for (const [key, value] of Object.entries(fields)) {
            formData.append(key, key === 'events' ? JSON.stringify(value) : value);
        }

        try {
            const res = await axios.post(`${backendUrl}/api/event/organizers`, formData, { headers: { Authorization: `Bearer ${token}` } });
            setOrganizers((prev) => [res.data.organizer, ...prev]);
            showNotification('Organizer created successfully!');
            closeFormModal();
        } catch (err) {
            showNotification(err.response?.data?.message || 'Error creating organizer.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async ({ logoFile, ...fields }) => {
        setIsSubmitting(true);
        const formData = new FormData();
        // Only append the image if a new one was selected
        if (logoFile) {
            formData.append('image', logoFile);
        }
        for (const [key, value] of Object.entries(fields)) {
            formData.append(key, key === 'events' ? JSON.stringify(value) : value);
        }

        try {
            const res = await axios.put(`${backendUrl}/api/event/organizers/${editingOrganizer._id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
            setOrganizers(prev => prev.map(org => org._id === editingOrganizer._id ? res.data.organizer : org));
            showNotification('Organizer updated successfully!');
            closeFormModal();
        } catch (err) {
            showNotification(err.response?.data?.message || 'Error updating organizer.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!organizerToDelete) return;
        setIsSubmitting(true);
        try {
            await axios.delete(`${backendUrl}/api/event/organizers/${organizerToDelete._id}`, { headers: { Authorization: `Bearer ${token}` } });
            setOrganizers(prev => prev.filter(org => org._id !== organizerToDelete._id));
            showNotification('Organizer deleted successfully!');
        } catch (err) {
            showNotification(err.response?.data?.message || 'Error deleting organizer.', 'error');
        } finally {
            setIsSubmitting(false);
            closeConfirmModal();
        }
    };

    // --- MODAL CONTROL ---
    const openFormModal = (organizer = null) => {
        setEditingOrganizer(organizer);
        setIsFormOpen(true);
    };
    const closeFormModal = () => {
        setIsFormOpen(false);
        setEditingOrganizer(null);
    };
    const openConfirmModal = (organizer) => {
        setOrganizerToDelete(organizer);
        setIsConfirmOpen(true);
    };
    const closeConfirmModal = () => {
        setIsConfirmOpen(false);
        setOrganizerToDelete(null);
    };
    
    if (!token) return <div className="p-6 text-center text-gray-500">Please log in to manage organizers.</div>;

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Organizers</h1>
                    <button onClick={() => openFormModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors">
                        <FaPlus /> Create Organizer
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>
                ) : error ? (
                    <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
                ) : organizers.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm"><h3 className="text-xl font-semibold text-gray-700">No Organizers Found</h3><p className="text-gray-500 mt-1">Get started by creating a new one.</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {organizers.map((org) => (
                            <div key={org._id} className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col">
                                <div className="flex items-start gap-4 mb-4">
                                    <img src={org.logoUrl} alt={org.name} className="w-16 h-16 rounded-full object-cover mt-1 flex-shrink-0" />
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-xl text-gray-900">{org.name}</h3>
                                        <p className="text-sm italic text-gray-600">{org.tagline}</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm mb-4 flex-grow">{org.description}</p>
                                
                                <div className="mt-auto">
                                    {org.events?.length > 0 && (
                                        <div className="border-t pt-3">
                                            <h4 className="font-semibold text-xs text-gray-500 uppercase mb-2">Events</h4>
                                            <ul className="space-y-1.5 text-sm text-gray-600">
                                                {org.events.map((e, idx) => (
                                                    <li key={idx} className="flex items-center">
                                                        <FaCalendarAlt className="mr-2.5 text-gray-400 flex-shrink-0" />
                                                        <span>{e.title} - <strong>{e.date}</strong></span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex justify-end items-center gap-2 mt-4 border-t pt-3">
                                        <button title="Edit Organizer" onClick={() => openFormModal(org)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                                            <FaEdit />
                                        </button>
                                        <button title="Delete Organizer" onClick={() => openConfirmModal(org)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {/* Reusable Form Modal */}
                {isFormOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
                        <motion.div initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
                            <OrganizerForm onSubmit={handleFormSubmit} onCancel={closeFormModal} isSubmitting={isSubmitting} initialData={editingOrganizer}/>
                        </motion.div>
                    </motion.div>
                )}

                {/* Delete Confirmation Modal */}
                {isConfirmOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
                            <p className="my-4 text-gray-600">Are you sure you want to delete <strong className="text-gray-800">"{organizerToDelete?.name}"</strong>? This cannot be undone.</p>
                            <div className="flex justify-end gap-4 mt-6">
                                <button onClick={closeConfirmModal} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
                                <button onClick={handleDelete} disabled={isSubmitting} className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 flex items-center gap-2">{isSubmitting && <FaSpinner className="animate-spin" />} Delete</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Notification Toast */}
                {notification.show && (
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className={`fixed bottom-5 right-5 px-5 py-3 rounded-lg shadow-lg text-white font-semibold ${notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default OrganizerPage;