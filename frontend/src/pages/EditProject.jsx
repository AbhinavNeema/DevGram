import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TAGS from '../constants/tags';
import MentionInput from '../components/MentionInput';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Save,
  Github,
  Globe,
  X,
  Loader2,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mentions, setMentions] = useState([]);
  const [techStack, setTechStack] = useState([]);
  const [tagSearch, setTagSearch] = useState('');
  const [github, setGithub] = useState('');
  const [demo, setDemo] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setFetching(true);
        const res = await api.get(`/projects/${id}`);
        const p = res.data;

        setTitle(p.title || '');
        setDescription(p.description || '');
        setMentions(p.mentions || []);
        setTechStack(p.techStack || []);
        setGithub(p.githubLink || '');
        setDemo(p.liveDemoLink || '');
        setExistingImages(p.images || []);
      } catch (err) {
        console.error('Failed to load project for editing', err);
        toast.error('Failed to load project details');
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchProject();
  }, [id]);

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

  const saveChanges = async () => {
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (!trimmedTitle || !trimmedDesc) {
      toast.error('Title and description are required');
      return;
    }

    setLoading(true);

    try {
      await api.put(`/projects/${id}`, {
        title: trimmedTitle,
        description: trimmedDesc,
        mentions: mentions.map((m) => m._id),
        techStack,
        githubLink: github.trim(),
        liveDemoLink: demo.trim(),
      });

      toast.success('Project updated successfully!');
      navigate(`/project/${id}`);
    } catch (err) {
      console.error('Update project failed', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save changes. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mb-3" />
        <span className="text-slate-400 text-sm font-medium">Loading project for editing...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Main Glass Form Card */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 sm:p-10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/[0.06]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Edit Project
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Update project details, technical overview, and links
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] text-xs font-semibold transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Cancel</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* TITLE */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Project Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project title..."
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Description & Brief *
              </label>
              <span className="text-[11px] text-slate-500">
                Type @ to mention developers
              </span>
            </div>

            <MentionInput
              value={description}
              onChange={setDescription}
              onMentionsChange={setMentions}
              placeholder="Update project description..."
              rows={6}
            />
          </div>

          {/* TECH STACK */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Tech Stack
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
                    className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-3 py-1 text-xs font-semibold"
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

            {/* Search tag */}
            <div className="relative">
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Search technologies to add..."
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

          {/* PROJECT LINKS */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Links
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
                  placeholder="GitHub URL"
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
                  placeholder="Live Demo URL"
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* EXISTING IMAGES DISPLAY */}
          {existingImages.length > 0 && (
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                <ImageIcon className="w-3.5 h-3.5" />
                Current Images ({existingImages.length})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {existingImages.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-video rounded-xl overflow-hidden border border-white/[0.1] bg-black/40"
                  >
                    <img
                      src={img.url}
                      alt={`Project screenshot ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="button"
            onClick={saveChanges}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium rounded-xl px-6 py-3.5 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-4 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProject;