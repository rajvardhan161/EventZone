import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import {
  FaEdit, FaTrash, FaLock, FaLockOpen, FaExclamationTriangle, FaSearch, FaTimes,
  FaSort, FaSortUp, FaSortDown, FaSpinner, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

// ===================================================================================
//  HELPER & MODAL COMPONENTS
// ===================================================================================

const OrganizerAvatar = ({ organizer, backendUrl }) => {
    // ... (This component is already correct and does not need changes)
    const getInitialSrc = () => {
        if (organizer.photoUrl && organizer.photoUrl.startsWith('http')) { return organizer.photoUrl; }
        // --- NOTE: Your backend saves the new path to 'photoUrl', but your schema might have an 'image' field.
        // This logic correctly handles both cases, checking photoUrl first.
        if (organizer.image) { return `${backendUrl}/${organizer.image}`.replace(/\\/g, '/'); }
        return null;
    };
    const [imgSrc, setImgSrc] = useState(getInitialSrc());
    useEffect(() => { setImgSrc(getInitialSrc()); }, [organizer, backendUrl]);
    const handleError = () => setImgSrc(null);

    if (imgSrc) { return <img className="h-10 w-10 rounded-full object-cover flex-shrink-0 bg-gray-200 dark:bg-gray-700" src={imgSrc} alt={organizer.name} onError={handleError} />; }
    const initials = organizer.name?.charAt(0).toUpperCase() || '?';
    const colorIndex = (organizer.name?.charCodeAt(0) || 0) % 5;
    const colors = ['bg-blue-200 text-blue-800', 'bg-green-200 text-green-800', 'bg-purple-200 text-purple-800', 'bg-yellow-200 text-yellow-800', 'bg-red-200 text-red-800' ];
    return <div className={`h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold ${colors[colorIndex]}`}>{initials}</div>;
};

const LoadingSpinner = () => ( <div className="flex justify-center items-center h-full p-16"><div className="flex flex-col items-center gap-4 text-gray-500 dark:text-gray-400"><FaSpinner className="animate-spin text-4xl text-blue-500" /><p className="text-lg">Loading Organizers...</p></div></div> );
const ErrorState = ({ error, onRetry }) => ( <div className="text-center p-8 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg"><FaExclamationTriangle className="mx-auto text-4xl mb-4" /><h3 className="text-xl font-semibold">An Error Occurred</h3><p className="mb-6">{error}</p><button onClick={onRetry} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">Try Again</button></div>);
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => { /* ... (No changes needed) ... */  const { isDarkMode } = useTheme(); useEffect(() => { const handleEsc = (event) => { if (event.key === 'Escape') onClose(); }; window.addEventListener('keydown', handleEsc); return () => window.removeEventListener('keydown', handleEsc); }, [onClose]); return ( <div className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ${isOpen ? 'bg-opacity-60' : 'bg-opacity-0 pointer-events-none'}`}> <div className={`relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-lg shadow-xl transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}> <div className="flex items-start"> <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"> <FaExclamationTriangle className="h-6 w-6 text-red-600" /> </div><div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left"> <h3 className="text-lg leading-6 font-medium">{title}</h3> <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{message}</p></div></div><div className="mt-5 sm:mt-4 flex flex-row-reverse gap-3"> <button onClick={onConfirm} className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700">Confirm</button> <button onClick={onClose} className="w-full sm:w-auto mt-3 sm:mt-0 inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button> </div></div></div>);};

const EditOrganizerModal = ({ isOpen, onClose, onUpdate, organizer, backendUrl }) => {
    const { isDarkMode } = useTheme();
    const { register, handleSubmit, formState: { isSubmitting }, watch, reset } = useForm();
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (organizer) {
            reset(organizer);
            // This logic correctly gets the initial preview image from either a full URL or a relative path
            let previewSrc = organizer.photoUrl || (organizer.image ? `${backendUrl}/${organizer.image}`.replace(/\\/g, '/') : null);
            setImagePreview(previewSrc);
        }
    }, [organizer, reset, backendUrl]);
    
    const postType = watch('post');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) setImagePreview(URL.createObjectURL(file));
    };

    // --- FIX: This is the core of the solution. ---
    const onSubmit = (data) => {
        // 1. Create a new FormData object. This is essential for file uploads.
        const submissionFormData = new FormData();

        // 2. Loop through all the data collected by react-hook-form.
        for (const key in data) {
            // 3. IMPORTANT: We skip the 'image' and 'photoUrl' fields in this loop.
            // 'photoUrl' is the old URL and we don't want to send it back.
            // 'image' is the file object and needs special handling.
            if (key === 'image' || key === 'photoUrl') {
                continue;
            }
            // 4. Append all other text-based fields to our FormData object.
            submissionFormData.append(key, data[key]);
        }

        // 5. After handling text fields, we specifically check if a NEW image file was selected.
        // `data.image` is a FileList, so we check for its existence and if it has a file at index 0.
        if (data.image && data.image[0]) {
            // 6. If yes, we append the actual file. The key 'image' MUST match the one
            // expected by your backend's multer middleware (`upload.single('image')`).
            submissionFormData.append('image', data.image[0]);
        }
        
        // 7. Finally, we pass the perfectly constructed FormData object to the parent's update handler.
        onUpdate(submissionFormData);
    };

    const inputClass = `w-full p-2.5 rounded-lg border transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`;
    const labelClass = "block mb-1 text-sm font-medium text-gray-600 dark:text-gray-300";

    return (
        <div className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${isOpen ? 'bg-opacity-60' : 'bg-opacity-0 pointer-events-none'}`}>
            <div className={`relative mx-auto my-4 w-full max-w-3xl max-h-[95vh] overflow-y-auto p-6 rounded-lg shadow-xl transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><FaTimes size={20} /></button>
                <h3 className="text-2xl font-bold mb-6">Edit {organizer?.name}</h3>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Name</label><input className={inputClass} {...register("name", { required: true })} /></div>
                        <div><label className={labelClass}>Email</label><input type="email" className={inputClass} {...register("email", { required: true })} /></div>
                        <div><label className={labelClass}>Reg. No</label><input className={inputClass} {...register("registrationNo", { required: true })} /></div>
                        <div><label className={labelClass}>Phone</label><input type="tel" className={inputClass} {...register("phone", { required: true })} /></div>
                        <div><label className={labelClass}>Age</label><input type="number" className={inputClass} {...register("age", { required: true, valueAsNumber: true })} /></div>
                        <div><label className={labelClass}>Department</label><input className={inputClass} {...register("department")} /></div>
                        <div><label className={labelClass}>Post</label><select className={inputClass} {...register("post")}><option value="student">Student</option><option value="staff">Staff</option></select></div>
                        <div><label className={labelClass}>Gender</label><select className={inputClass} {...register("gender")}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                        {postType === 'student' && <>
                            <div><label className={labelClass}>Course</label><input className={inputClass} {...register("course")} /></div>
                            <div><label className={labelClass}>Year</label><input className={inputClass} {...register("year")} /></div>
                        </>}
                        {postType === 'staff' && <div className="md:col-span-2"><label className={labelClass}>Staff Position</label><input className={inputClass} {...register("staffPosition")} /></div>}
                        <div className="md:col-span-2"><label className={labelClass}>Address</label><input className={inputClass} {...register("address")} /></div>
                        <div className="md:col-span-2"><label className={labelClass}>Skills (comma-separated)</label><input className={inputClass} {...register("skills")} /></div>
                        <div className="md:col-span-2"><label className={labelClass}>Bio</label><textarea rows="3" className={inputClass} {...register("bio")}></textarea></div>
                        <div className="md:col-span-2">
                          <label className={labelClass}>Profile Image</label>
                          <div className="mt-1 flex items-center gap-4">
                              {imagePreview && <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover"/>}
                              <label htmlFor="image-update" className="cursor-pointer bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600">Change Image</label>
                              <input id="image-update" type="file" className="hidden" accept="image/*" {...register("image")} onChange={handleImageChange} />
                          </div>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600">Cancel</button><button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2">{isSubmitting && <FaSpinner className="animate-spin" />}Save Changes</button></div>
                </form>
            </div>
        </div>
    );
};

// ===================================================================================
//  MAIN COMPONENT
// ===================================================================================

const AllOrganizers = () => {
    const { backendUrl, token } = useContext(AdminContext);
    const { isDarkMode } = useTheme();

    const [organizers, setOrganizers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;
    const [editingOrganizer, setEditingOrganizer] = useState(null);
    const [confirmAction, setConfirmAction] = useState({ isOpen: false });

    // Centralized API logic
    const api = useMemo(() => {
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
        return {
            getAll: () => axios.get(`${backendUrl}/api/organizer/all`, authHeaders),
            delete: (id) => axios.delete(`${backendUrl}/api/organizer/delete/${id}`, authHeaders),
            toggleBlock: (id) => axios.put(`${backendUrl}/api/organizer/block/${id}`, {}, authHeaders),
            // --- FIX: This function now correctly sends the pre-built FormData.
            // Axios automatically handles FormData and sets the right headers.
            update: (id, formData) => {
                return axios.put(`${backendUrl}/api/organizer/update/${id}`, formData, {
                    headers: { ...authHeaders.headers, 'Content-Type': 'multipart/form-data' }
                });
            }
        };
    }, [token, backendUrl]);

    const fetchOrganizers = useCallback(async () => { /* ... (No changes needed) ... */  if (!token) return setError("Authentication token is missing."); setLoading(true); try { const res = await api.getAll(); setOrganizers(res.data); setError(null); } catch (err) { setError(err.response?.data?.message || 'Failed to fetch organizers.'); } finally { setLoading(false); } }, [api, token]);
    useEffect(() => { fetchOrganizers(); }, [fetchOrganizers]);
    
    // ... (Memoized data processing remains the same) ...
     const filteredOrganizers = useMemo(() => organizers.filter(o => (o.name && o.name.toLowerCase().includes(searchTerm.toLowerCase())) || (o.email && o.email.toLowerCase().includes(searchTerm.toLowerCase()))), [organizers, searchTerm]);
     const sortedOrganizers = useMemo(() => { let sortableItems = [...filteredOrganizers]; sortableItems.sort((a, b) => { if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1; if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1; return 0; }); return sortableItems; }, [filteredOrganizers, sortConfig]);
     const paginatedOrganizers = useMemo(() => { const startIndex = (currentPage - 1) * ITEMS_PER_PAGE; return sortedOrganizers.slice(startIndex, startIndex + ITEMS_PER_PAGE); }, [sortedOrganizers, currentPage]);
     const totalPages = Math.ceil(sortedOrganizers.length / ITEMS_PER_PAGE);

    // --- FIX: handleUpdate now receives the pre-built FormData from the modal.
    // No changes are needed here, as it just passes the data along to the api.
    const handleUpdate = async (formData) => {
        if (!editingOrganizer) return;
        try {
            const res = await api.update(editingOrganizer._id, formData);
            toast.success(`${res.data.updated.name} was updated successfully.`);
            setOrganizers(prev => prev.map(o => o._id === res.data.updated._id ? res.data.updated : o));
            setEditingOrganizer(null); // Close modal on success
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed.');
        }
    };
    
    // ... (Other handlers like handleDelete, handleBlockToggle remain the same) ...
     const handleDelete = (id, name) => setConfirmAction({ isOpen: true, title: `Delete ${name}`, message: 'This action is permanent. Are you sure?', onConfirm: async () => { try { await api.delete(id); toast.success(`${name} was deleted successfully.`); setOrganizers(prev => prev.filter(o => o._id !== id)); } catch (err) { toast.error(err.response?.data?.message || 'Deletion failed.'); } finally { setConfirmAction({ isOpen: false }); } }});
     const handleSort = (key) => { let direction = 'ascending'; if (sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; } setSortConfig({ key, direction }); };
     const handleBlockToggle = (organizer) => setConfirmAction({ isOpen: true, title: `${organizer.isBlocked ? 'Unblock' : 'Block'} Organizer`, message: `Confirm to ${organizer.isBlocked ? 'unblock' : 'block'} ${organizer.name}?`, onConfirm: async () => { try { const res = await api.toggleBlock(organizer._id); toast.success(`${organizer.name}'s status was updated.`); setOrganizers(prev => prev.map(o => o._id === organizer._id ? { ...o, isBlocked: res.data.isBlocked } : o)); } catch (err) { toast.error(err.response?.data?.message || 'Update failed.'); } finally { setConfirmAction({ isOpen: false }); } }});


    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState error={error} onRetry={fetchOrganizers} />;
     const SortIcon = ({ columnKey }) => { if (sortConfig.key !== columnKey) return <FaSort className="text-gray-400" />; return sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />; };

    return (
        <>
            <div className={`p-4 sm:p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-900/50'}`}>
                {/* ... (UI and Table rendering remains the same) ... */}
                 <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4"> <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Manage Organizers</h2> <div className="relative w-full sm:w-auto"> <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" /> <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className={`w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} /> </div></div> {organizers.length === 0 ? ( <div className="text-center py-16"> <h3 className="text-xl font-semibold text-gray-500">No Organizers Yet</h3> <p className="text-gray-400 mt-2">Create an organizer to see them here.</p> </div>) : paginatedOrganizers.length === 0 && searchTerm ? ( <div className="text-center py-16"> <h3 className="text-xl font-semibold text-gray-500">No Organizers Found</h3> <p className="text-gray-400 mt-2">Your search for "{searchTerm}" did not match any records.</p> </div>) : ( <div className="overflow-x-auto"> <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"> <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}> <tr> <th onClick={() => handleSort('name')} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"><div className="flex items-center gap-2">Organizer <SortIcon columnKey="name"/></div></th> <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role / Dept</th> <th onClick={() => handleSort('isBlocked')} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"><div className="flex items-center gap-2">Status <SortIcon columnKey="isBlocked"/></div></th> <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th> </tr> </thead> <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}> {paginatedOrganizers.map(o => ( <tr key={o._id} className={isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}> <td className="px-6 py-4 whitespace-nowrap"> <div className="flex items-center gap-4"> <OrganizerAvatar organizer={o} backendUrl={backendUrl} /> <div className="min-w-0"> <div className="font-medium truncate">{o.name}</div><div className="text-sm text-gray-500 truncate">{o.email}</div></div></div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"> <div>{o.post === 'student' ? o.course : o.staffPosition}</div><div>{o.department}</div></td><td className="px-6 py-4 whitespace-nowrap"> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${o.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{o.isBlocked ? 'Blocked' : 'Active'}</span> </td><td className="px-6 py-4 whitespace-nowrap text-right"> <div className="flex justify-end items-center gap-1"> <button onClick={() => setEditingOrganizer(o)} title={`Edit ${o.name}`} className="p-2 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700"><FaEdit/></button> <button onClick={() => handleBlockToggle(o)} title={o.isBlocked ? `Unblock ${o.name}` : `Block ${o.name}`} className="p-2 rounded-full hover:bg-yellow-100 dark:hover:bg-gray-700">{o.isBlocked ? <FaLockOpen className="text-green-500" /> : <FaLock className="text-yellow-500" />}</button> <button onClick={() => handleDelete(o._id, o.name)} title={`Delete ${o.name}`} className="p-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-gray-700"><FaTrash/></button> </div></td></tr>))} </tbody> </table> </div>)}
                 <div className="flex justify-between items-center mt-4 px-2"> <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span> <div className="flex gap-2"> <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700"><FaChevronLeft /></button> <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700"><FaChevronRight /></button> </div></div>
            </div>

            <ConfirmationModal {...confirmAction} onClose={() => setConfirmAction({ isOpen: false })} />
            {editingOrganizer && <EditOrganizerModal isOpen={!!editingOrganizer} onClose={() => setEditingOrganizer(null)} onUpdate={handleUpdate} organizer={editingOrganizer} backendUrl={backendUrl} />}
        </>
    );
};

export default AllOrganizers;