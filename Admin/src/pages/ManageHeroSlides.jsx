import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AdminContext } from '../context/AdminContext'; // Adjust the import path

// --- Helper Components & Icons (for a cleaner main component) ---

const Spinner = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="white"
  >
    <path
      d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
      opacity=".25"
    />
    <path
      d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 12 12"
        to="360 12 12"
        dur="0.75s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

const Alert = ({ message, type, onClose }) => (
  <div style={{ ...styles.message, ...styles[`${type}Message`] }}>
    <span>{message}</span>
    <button onClick={onClose} style={styles.closeButton}>×</button>
  </div>
);

const SkeletonCard = () => (
  <div style={styles.slideItem}>
    <div style={{ ...styles.slideImage, ...styles.skeleton }} />
    <div style={styles.slideContent}>
      <div style={{ ...styles.skeleton, height: '28px', width: '70%', marginBottom: '1rem' }} />
      <div style={{ ...styles.skeleton, height: '20px', width: '90%' }} />
      <div style={{ ...styles.skeleton, height: '20px', width: '50%', marginTop: '1rem' }} />
    </div>
  </div>
);


// --- Main Component ---

const ManageHeroSlides = () => {
  const { backendUrl, token } = useContext(AdminContext);

  // Form state
  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [altText, setAltText] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // UI state
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true); // Start true to show initial loading
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSlides();
  }, [token]); // Re-fetch if token changes

  const fetchSlides = async () => {
    if (!token) {
      setLoading(false);
      setError("Authentication token not found. Please log in again.");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/event/get/hero`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSlides(response.data.slides || []);
    } catch (err) {
      console.error('Error fetching slides:', err);
      setError('Failed to fetch hero slides. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const resetForm = () => {
    setHeading('');
    setSubheading('');
    setAltText('');
    setButtonText('');
    setButtonLink('');
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (!heading || !subheading || !altText || !buttonText || !buttonLink || !image) {
      setError('All fields, including the image, are required.');
      return;
    }
    setSubmitting(true);

    const formData = new FormData();
    formData.append('heading', heading);
    formData.append('subheading', subheading);
    formData.append('altText', altText);
    formData.append('buttonText', buttonText);
    formData.append('buttonLink', buttonLink);
    formData.append('image', image);

    try {
      const response = await axios.post(`${backendUrl}/api/event/hero/create`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' is set automatically by axios
        },
      });
      setSuccessMessage(response.data.message || 'Slide created successfully!');
      resetForm();
      fetchSlides(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while creating the slide.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (slideId) => {
    if (!window.confirm("Are you sure you want to delete this slide? This action cannot be undone.")) {
      return;
    }
    setDeletingId(slideId);
    setError(null);
    setSuccessMessage('');

    try {
      // NOTE: Adjust the API endpoint if it's different for deletion
      const response = await axios.delete(`${backendUrl}/api/event/hero/${slideId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSuccessMessage(response.data.message || 'Slide deleted successfully!');
      setSlides(slides.filter(slide => slide._id !== slideId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the slide.');
    } finally {
      setDeletingId(null);
    }
  };


  return (
    <div style={styles.container}>
      <h1 style={styles.mainHeading}>Manage Hero Slides</h1>

      {error && <Alert message={error} type="error" onClose={() => setError(null)} />}
      {successMessage && <Alert message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />}

      <div style={styles.card}>
        <h2 style={styles.cardHeading}>Create New Slide</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="heading">Heading</label>
              <input id="heading" type="text" value={heading} onChange={(e) => setHeading(e.target.value)} style={styles.input} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="subheading">Subheading</label>
              <input id="subheading" type="text" value={subheading} onChange={(e) => setSubheading(e.target.value)} style={styles.input} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="buttonText">Button Text</label>
              <input id="buttonText" type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} style={styles.input} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="buttonLink">Button Link (URL)</label>
              <input id="buttonLink" type="url" value={buttonLink} onChange={(e) => setButtonLink(e.target.value)} style={styles.input} placeholder="https://example.com" required />
            </div>
            <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
              <label style={styles.label} htmlFor="altText">Image Alt Text</label>
              <input id="altText" type="text" value={altText} onChange={(e) => setAltText(e.target.value)} style={styles.input} placeholder="Describes the image for accessibility" required />
            </div>
            <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label style={styles.label}>Image</label>
                <div style={styles.imageUploadContainer}>
                    <input id="image-input" type="file" onChange={handleFileChange} accept="image/*" style={styles.fileInput} ref={fileInputRef} required />
                    <label htmlFor="image-input" style={styles.fileInputLabel}>
                        {image ? 'Change Image' : 'Choose Image'}
                    </label>
                    {imagePreview && (
                        <div style={styles.imagePreviewContainer}>
                            <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
                        </div>
                    )}
                </div>
            </div>
          </div>
          <button type="submit" disabled={submitting} style={{...styles.button, ...(submitting && styles.buttonDisabled)}}>
            {submitting ? <Spinner /> : 'Create Slide'}
          </button>
        </form>
      </div>

      <div style={styles.slidesContainer}>
        <h2 style={styles.cardHeading}>Existing Slides</h2>
        {loading && (
          <div style={styles.slideList}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}
        {!loading && slides.length === 0 && <p style={styles.noSlidesText}>No hero slides have been created yet.</p>}
        
        {!loading && slides.length > 0 && (
          <div style={styles.slideList}>
            {slides.map((slide) => (
              <div key={slide._id} style={styles.slideItem}>
                <img src={slide.image} alt={slide.altText} style={styles.slideImage} />
                <div style={styles.slideContent}>
                  <h3 style={styles.slideHeading}>{slide.heading}</h3>
                  <p style={styles.slideSubheading}>{slide.subheading}</p>
                  <a href={slide.button.link} target="_blank" rel="noopener noreferrer" style={styles.slideButton}>
                    {slide.button.text}
                  </a>
                </div>
                <div style={styles.slideActions}>
                  <button onClick={() => handleDelete(slide._id)} disabled={deletingId === slide._id} style={styles.deleteButton}>
                    {deletingId === slide._id ? <Spinner /> : 'Delete'}
                  </button>
                  {/* <button style={styles.editButton}>Edit</button> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Styles (CSS-in-JS) ---
const theme = {
  primary: '#4a90e2',
  primaryHover: '#357abd',
  danger: '#d0021b',
  dangerHover: '#a30215',
  lightGray: '#f7f7f7',
  mediumGray: '#e0e0e0',
  darkGray: '#333',
  text: '#4a4a4a',
  white: '#ffffff',
  success: '#28a745',
  error: '#dc3545',
};

const styles = {
  container: {
    padding: '2rem',
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
    backgroundColor: theme.lightGray,
    minHeight: '100vh',
  },
  mainHeading: {
    fontSize: '2.5rem',
    color: theme.darkGray,
    marginBottom: '2rem',
    fontWeight: '300',
  },
  card: {
    backgroundColor: theme.white,
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    marginBottom: '2.5rem',
  },
  cardHeading: {
    fontSize: '1.75rem',
    color: theme.darkGray,
    fontWeight: '500',
    marginBottom: '1.5rem',
    borderBottom: `2px solid ${theme.lightGray}`,
    paddingBottom: '1rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  formGroup: {},
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: theme.text,
    fontSize: '0.9rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    boxSizing: 'border-box',
    borderRadius: '8px',
    border: `1px solid ${theme.mediumGray}`,
    fontSize: '1rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  imageUploadContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  fileInput: {
    width: 0,
    height: 0,
    overflow: 'hidden',
  },
  fileInputLabel: {
    padding: '0.75rem 1.5rem',
    backgroundColor: theme.white,
    color: theme.primary,
    border: `2px solid ${theme.primary}`,
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s, color 0.2s',
  },
  imagePreviewContainer: {
    width: '150px',
    height: '80px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: `1px solid ${theme.mediumGray}`,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.8rem 2rem',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: theme.primary,
    color: theme.white,
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.2s, transform 0.1s',
    marginTop: '1rem',
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
    cursor: 'not-allowed',
  },
  slidesContainer: {},
  slideList: {
    display: 'grid',
    gridTemplateColumns: '1fr', // Stacks on mobile
    gap: '1.5rem',
  },
  slideItem: {
    display: 'flex',
    gap: '1.5rem',
    padding: '1.5rem',
    borderRadius: '12px',
    backgroundColor: theme.white,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    alignItems: 'center',
    position: 'relative',
    transition: 'box-shadow 0.2s',
  },
  slideImage: {
    width: '200px',
    height: '112px',
    borderRadius: '8px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  slideContent: {
    flex: 1,
  },
  slideHeading: {
    fontSize: '1.4rem',
    margin: '0 0 0.5rem 0',
    color: theme.darkGray,
  },
  slideSubheading: {
    fontSize: '1rem',
    margin: '0 0 1rem 0',
    color: theme.text,
  },
  slideButton: {
    display: 'inline-block',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    backgroundColor: theme.lightGray,
    color: theme.darkGray,
    borderRadius: '6px',
    fontWeight: '500',
    border: `1px solid ${theme.mediumGray}`,
  },
  slideActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  deleteButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 1rem',
    backgroundColor: theme.danger,
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    minWidth: '80px',
  },
  editButton: {
    padding: '0.5rem 1rem',
    backgroundColor: theme.white,
    color: theme.text,
    border: `1px solid ${theme.mediumGray}`,
    borderRadius: '6px',
    cursor: 'pointer',
  },
  message: {
    padding: '1rem 1.5rem',
    margin: '0 0 1.5rem 0',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: `1px solid #f5c6cb`,
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: `1px solid #c3e6cb`,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'inherit',
    lineHeight: '1',
  },
  noSlidesText: {
    textAlign: 'center',
    padding: '3rem',
    color: '#666',
    backgroundColor: theme.white,
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  },
  skeleton: {
    backgroundColor: '#e0e0e0',
    borderRadius: '8px',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
};

// Add responsive styles and keyframes
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @media (max-width: 768px) {
    .formGrid {
      grid-template-columns: 1fr;
    }
    .slideItem {
      flex-direction: column;
      align-items: flex-start;
    }
    .slideImage {
      width: 100%;
      height: 180px;
    }
    .slideActions {
        position: absolute;
        top: 1rem;
        right: 1rem;
        flex-direction: row;
    }
  }
  
  @keyframes pulse {
    0% { background-color: #e0e0e0; }
    50% { background-color: #f0f0f0; }
    100% { background-color: #e0e0e0; }
  }

  /* Hover Effects */
  .button:hover:not(:disabled) {
    background-color: ${theme.primaryHover};
    transform: translateY(-2px);
  }
  .fileInputLabel:hover {
      background-color: ${theme.primary};
      color: ${theme.white};
  }
  .deleteButton:hover:not(:disabled) {
    background-color: ${theme.dangerHover};
  }
  .slideItem:hover {
      box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  }
  input:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
  }
`;
document.head.appendChild(styleSheet);


export default ManageHeroSlides;