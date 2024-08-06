import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Editor } from '@tinymce/tinymce-react';
import '../styles/Write.css';

function Write() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleEditorChange = (content, editor) => {
    setContent(content);
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const createExcerpt = (htmlContent) => {
    const div = document.createElement('div');
    div.innerHTML = htmlContent;
    const text = div.textContent || div.innerText;
    return text.slice(0, 150) + '...';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    console.log('Submitting post...'); // Log submission
    console.log('Title:', title);
    console.log('Content:', content);
    console.log('Draft:', isDraft);
    console.log('Category:', category);
    console.log('Tags:', tags);

    setLoading(true);
    try {
      let coverImageUrl = '';
      if (coverImage) {
        const imageRef = ref(storage, `covers/${Date.now()}-${coverImage.name}`);
        await uploadBytes(imageRef, coverImage);
        coverImageUrl = await getDownloadURL(imageRef);
        console.log('Cover Image URL:', coverImageUrl); // Log image URL
      }

      const docRef = await addDoc(collection(db, 'posts'), {
        title,
        content,
        excerpt: createExcerpt(content),
        coverImage: coverImageUrl,
        author: {
          name: currentUser.displayName || 'Anonymous',
          uid: currentUser.uid,
          photoURL: currentUser.photoURL
        },
        category: category || 'Uncategorized',
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: serverTimestamp(),
        status: isDraft ? 'draft' : 'published',
        likes: 0,
        views: 0,
        readTime: Math.ceil(content.split(' ').length / 200) // Assuming 200 words per minute
      });
      
      console.log('Post created with ID:', docRef.id); // Log post ID
      navigate(`/blogs/${docRef.id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.'); // Alert user on error
    }
    setLoading(false);
  };

  const categories = [
    'Technology',
    'Lifestyle',
    'Travel',
    'Food',
    'Health',
    'Business',
    'Entertainment',
    'Other'
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Creating your story...</p>
      </div>
    );
  }

  return (
    <div className="write-container">
      <div className="write-wrapper">
        <div className="write-header">
          <h1>Create Your Story</h1>
          <p>Share your thoughts with the world</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="cover-image-section">
            <div 
              className="image-upload-area"
              onClick={() => fileInputRef.current?.click()}
            >
              {coverImagePreview ? (
                <div className="image-preview">
                  <img src={coverImagePreview} alt="Cover preview" />
                  <button 
                    type="button" 
                    className="remove-image"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCoverImage();
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/>
                    <line x1="16" y1="5" x2="22" y2="5"/>
                    <line x1="19" y1="2" x2="19" y2="8"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                  <p>Click to add a cover image</p>
                  <span>Recommended: 1600×900px</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="title-section">
            <input
              type="text"
              placeholder="Enter your title here..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="title-input"
            />
          </div>

          <div className="post-meta">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="category-select"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Add tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="tags-input"
            />
          </div>
          
          <div className="editor-section">
            <Editor
              apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
              init={{
                height: 600,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                  'codesample', 'emoticons', 'hr', 'pagebreak', 'quickbars',
                  'save', 'directionality', 'nonbreaking', 'contextmenu', 'paste'
                ],
                toolbar: 'undo redo | blocks fontfamily fontsize | ' +
                  'bold italic underline strikethrough forecolor backcolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help | image media codesample emoticons',
                content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; max-width: 100%; padding: 0 1rem; }',
                block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Quote=blockquote; Code=pre',
                quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
                quickbars_insert_toolbar: 'image media codesample',
                contextmenu: 'link image table',
                images_upload_url: '/api/upload',
                automatic_uploads: true,
                paste_data_images: true,
                image_advtab: true,
                image_caption: true,
                media_live_embeds: true,
                codesample_languages: [
                  { text: 'HTML/XML', value: 'markup' },
                  { text: 'JavaScript', value: 'javascript' },
                  { text: 'CSS', value: 'css' },
                  { text: 'PHP', value: 'php' },
                  { text: 'Python', value: 'python' },
                  { text: 'Java', value: 'java' },
                  { text: 'C', value: 'c' },
                  { text: 'C++', value: 'cpp' }
                ]
              }}
              onEditorChange={handleEditorChange}
            />
          </div>
          
          <div className="button-section">
            <button 
              type="button" 
              className="draft-button"
              onClick={() => {
                setIsDraft(true);
                handleSubmit();
              }}
            >
              Save as Draft
            </button>
            <button type="submit" className="publish-button">
              Publish Story
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Write;
