import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Github, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectData } from '@/lib/settingsApi';

interface ProjectSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectData) => Promise<void>;
  project?: any; // For editing existing project
  loading?: boolean;
}

export function ProjectSubmissionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  project, 
  loading = false 
}: ProjectSubmissionModalProps) {
  const [formData, setFormData] = useState<ProjectData>({
    title: '',
    description: '',
    images: [],
    gitRepositoryUrl: '',
    demoUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const isEditing = !!project;

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        images: project.images || [],
        gitRepositoryUrl: project.gitRepositoryUrl || '',
        demoUrl: project.demoUrl || '',
      });
      setImageUrls(project.images || []);
    } else {
      setFormData({
        title: '',
        description: '',
        images: [],
        gitRepositoryUrl: '',
        demoUrl: '',
      });
      setImageUrls([]);
    }
    setErrors({});
  }, [project, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!formData.gitRepositoryUrl.trim()) {
      newErrors.gitRepositoryUrl = 'GitHub repository URL is required';
    } else if (!formData.gitRepositoryUrl.includes('github.com')) {
      newErrors.gitRepositoryUrl = 'Please enter a valid GitHub repository URL';
    }

    if (!formData.demoUrl.trim()) {
      newErrors.demoUrl = 'Demo URL is required';
    } else if (!formData.demoUrl.startsWith('http')) {
      newErrors.demoUrl = 'Please enter a valid URL starting with http:// or https://';
    }

    if (imageUrls.length > 3) {
      newErrors.images = 'Maximum 3 images allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        ...formData,
        images: imageUrls,
      });
      onClose();
    } catch (error) {
      console.error('Error submitting project:', error);
    }
  };

  const addImageUrl = () => {
    if (newImageUrl.trim() && imageUrls.length < 3) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleImageUrlKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addImageUrl();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-base-100 rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] min-h-[400px] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-base-200">
            <div>
              <h2 className="text-xl font-bold text-base-content">
                {isEditing ? 'Edit Project' : 'Submit New Project'}
              </h2>
              <p className="text-sm text-base-content/60 mt-1">
                {isEditing ? 'Update your project details' : 'Share your project with the community'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-base-200"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto min-h-0">
            {/* Project Title */}
            <div>
              <label className="block font-semibold mb-2 text-base-content">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/30 transition-all ${
                  errors.title ? 'border-red-500' : 'border-base-200'
                }`}
                placeholder="Enter your project title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Project Description */}
            <div>
              <label className="block font-semibold mb-2 text-base-content">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-base-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/30 transition-all min-h-[100px]"
                placeholder="Describe your project, technologies used, and key features..."
              />
            </div>

            {/* GitHub Repository */}
            <div>
              <label className="font-semibold mb-2 text-base-content items-center gap-2">
                <Github size={16} />
                GitHub Repository URL *
              </label>
              <input
                type="url"
                value={formData.gitRepositoryUrl}
                onChange={(e) => setFormData({ ...formData, gitRepositoryUrl: e.target.value })}
                className={`w-full border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/30 transition-all ${
                  errors.gitRepositoryUrl ? 'border-red-500' : 'border-base-200'
                }`}
                placeholder="https://github.com/username/repository"
              />
              {errors.gitRepositoryUrl && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.gitRepositoryUrl}
                </p>
              )}
            </div>

            {/* Demo URL */}
            <div>
              <label className="font-semibold mb-2 text-base-content items-center gap-2">
                <ExternalLink size={16} />
                Demo URL *
              </label>
              <input
                type="url"
                value={formData.demoUrl}
                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                className={`w-full border rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/30 transition-all ${
                  errors.demoUrl ? 'border-red-500' : 'border-base-200'
                }`}
                placeholder="https://your-demo-site.com"
              />
              {errors.demoUrl && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.demoUrl}
                </p>
              )}
            </div>

            {/* Project Images */}
            <div>
              <label className="font-semibold mb-2 text-base-content flex items-center gap-2">
                <Upload size={16} />
                Project Images (Max 3)
              </label>
              <div className="space-y-3">
                {/* Add new image URL */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyPress={handleImageUrlKeyPress}
                    className="flex-1 border border-base-200 rounded-lg px-4 py-2 text-base focus:ring-2 focus:ring-primary/30 transition-all"
                    placeholder="https://example.com/image.jpg"
                    disabled={imageUrls.length >= 3}
                  />
                  <Button
                    type="button"
                    onClick={addImageUrl}
                    disabled={!newImageUrl.trim() || imageUrls.length >= 3}
                    size="sm"
                    className="bg-primary text-primary-content hover:bg-primary/90"
                  >
                    Add
                  </Button>
                </div>

                {/* Display current images */}
                {imageUrls.length > 0 && (
                  <div className="space-y-2">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-base-200 rounded-lg">
                        <img
                          src={url}
                          alt={`Project image ${index + 1}`}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.png';
                          }}
                        />
                        <span className="flex-1 text-sm truncate">{url}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImageUrl(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {errors.images && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.images}
                  </p>
                )}
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-base-200/50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-base-content mb-2 flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                Submission Guidelines
              </h4>
              <ul className="text-sm text-base-content/70 space-y-1">
                <li>• Ensure your project is original and functional</li>
                <li>• Provide clear documentation and setup instructions</li>
                <li>• Include high-quality screenshots or demo images</li>
                <li>• Projects will be reviewed before approval</li>
              </ul>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-base-200 flex-shrink-0 bg-base-100">
            <Button variant="outline" onClick={onClose} disabled={loading} className="min-w-[80px]">
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-primary text-primary-content hover:bg-primary/90 min-w-[120px]"
            >
              {loading ? 'Submitting...' : isEditing ? 'Update Project' : 'Submit Project'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
