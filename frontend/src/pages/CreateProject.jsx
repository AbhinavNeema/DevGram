import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import TAGS from '../constants/tags';
import MentionInput from '../components/MentionInput';
import toast from 'react-hot-toast';
import {
  Rocket,
  BookOpen,
  Code2,
  Image as ImageIcon,
  Github,
  Globe,
  X,
  Plus,
  Loader2,
  UploadCloud,
  Trash2,
} from 'lucide-react';

const CreateProject = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState('project'); // 'project' | 'blog'
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [techStack, setTechStack] = useState([]);
  const [tagSearch, setTagSearch] = useState('');
  const [github, setGithub] = useState('');
  const [demo, setDemo] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(false);

  const addTag = (tag) => {
    if (techStack.includes(tag)) return;
    if (techStack.length >= 8) {
      toast.error('Maximum 8 tags allowed');
      return;
    }
    setTechStack([...techStack, tag]);
    setTagSearch('');
  };

  const removeTag = (tag) => {
    setTechStack(techStack.filter((t) => t !== tag));
  };

  const filteredTags = TAGS.filter(
    (tag) =>
      tag.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !techStack.includes(tag)
  );

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    // Check size < 10MB per image
    const validFiles = files.filter((f) => {
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`Image ${f.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    const newImages = [...images, ...validFiles].slice(0, 5);
    setImages(newImages);
    setPreviews(newImages.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newImages.map((f) => URL.createObjectURL(f)));
  };

  const submit = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      toast.error('Please enter a title');
      return;
    }
    if (!trimmedContent) {
      toast.error(
        mode === 'project'
          ? 'Please enter a description for your project'
          : 'Please write content for your article'
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append('title', trimmedTitle);
      formData.append('mentions', JSON.stringify(mentions.map((m) => m._id)));
      formData.append('techStack', JSON.stringify(techStack));

      if (mode === 'project') {
        formData.append('description', trimmedContent);
        if (github.trim()) formData.append('githubLink', github.trim());
        if (demo.trim()) formData.append('liveDemoLink', demo.trim());
      } else {
        formData.append('content', trimmedContent);
      }

      images.forEach((img) => formData.append('images', img));

      const endpoint = mode === 'project' ? '/projects' : '/blogs';
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(
        mode === 'project'
          ? 'Project published successfully!'
          : 'Article published successfully!'
      );

      if (res.data?._id) {
        navigate(mode === 'project' ? `/project/${res.data._id}` : `/blog/${res.data._id}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to create post', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        `Failed to publish ${mode}. Please check your inputs.`;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Main Glass Form Card */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 sm:p-10 shadow-2xl">
        {/* Header with Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.06]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {mode === 'project' ? 'Launch a Project' : 'Publish an Article'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {mode === 'project'
                ? 'Showcase your build, architecture, and deployment'
                : 'Share insights, tutorials, and engineering lessons'}
            </p>
          </div>

          {/* Mode Pill Toggle */}
          <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMode('project')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'project'
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              Project
            </button>

            <button
              type="button"
              onClick={() => setMode('blog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'blog'
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Article
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* TITLE */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              {mode === 'project' ? 'Project Title' : 'Article Title'} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                mode === 'project'
                  ? 'e.g. Distributed Task Queue in Rust'
                  : 'e.g. Understanding Consensus Protocols in Distributed Systems'
              }
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
            />
          </div>

          {/* CONTENT / DESCRIPTION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {mode === 'project' ? 'Project Brief & Overview' : 'Article Body'} *
              </label>
              <span className="text-[11px] text-slate-500">
                Type @ to mention developers
              </span>
            </div>

            <MentionInput
              value={content}
              onChange={setContent}
              onMentionsChange={setMentions}
              placeholder={
                mode === 'project'
                  ? 'Describe what you built, architecture highlights, challenges overcome...'
                  : 'Write your thoughts, code explanations, engineering trade-offs...'
              }
              rows={mode === 'project' ? 6 : 10}
            />
          </div>

          {/* TECH STACK */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Technologies & Topics
              </label>
              <span className="text-[11px] text-slate-500">
                {techStack.length} / 8 tags
              </span>
            </div>

            {/* Selected tags */}
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {techStack.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-3 py-1 text-xs font-semibold animate-in zoom-in-95 duration-150"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-400 transition-colors"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag search input */}
            <div className="relative">
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Search technologies (e.g. react, docker, rust, redis)..."
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />

              {tagSearch && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-white/[0.1] bg-[#0E1528]/95 backdrop-blur-xl p-1.5 shadow-2xl">
                  {filteredTags.length > 0 ? (
                    filteredTags.slice(0, 8).map((tag) => (
                      <div
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="px-3 py-1.5 rounded-lg hover:bg-indigo-500/15 cursor-pointer text-xs font-medium text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                      >
                        <span>#{tag}</span>
                        <Plus className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                    ))
                  ) : (
                    <div
                      onClick={() => addTag(tagSearch.toLowerCase().trim())}
                      className="px-3 py-2 rounded-lg hover:bg-indigo-500/15 cursor-pointer text-xs font-medium text-indigo-300 flex items-center justify-between"
                    >
                      <span>Add custom tag "#{tagSearch.toLowerCase().trim()}"</span>
                      <Plus className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* PROJECT LINKS (Project mode only) */}
          {mode === 'project' && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                Deployment & Repository Links
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Github className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={demo}
                    onChange={(e) => setDemo(e.target.value)}
                    placeholder="https://yourdemo.app"
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* IMAGE UPLOAD DROPZONE */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Screenshots / Media (up to 5 images)
            </label>

            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/[0.1] hover:border-indigo-500/50 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-all duration-300 group">
              <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 group-hover:scale-110 transition-all mb-2" />
              <span className="text-xs font-medium text-slate-300">
                Click to browse or drop screenshots here
              </span>
              <span className="text-[10px] text-slate-500 mt-1">
                PNG, JPG, WebP up to 10MB each
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImages}
                className="hidden"
              />
            </label>

            {/* Previews grid */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-video rounded-xl overflow-hidden border border-white/[0.1] group bg-black/40"
                  >
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/70 hover:bg-red-600 text-white transition-colors"
                      aria-label="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium rounded-xl px-6 py-3.5 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-4 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing to DevGram...</span>
              </>
            ) : (
              <>
                <span>{mode === 'project' ? 'Publish Project' : 'Publish Article'}</span>
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;