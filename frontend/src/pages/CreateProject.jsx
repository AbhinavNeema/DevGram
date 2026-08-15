import { useState, useRef } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import TAGS from "../constants/tags";
import MentionInput from "../components/MentionInput";
import {
  Rocket,
  BookOpen,
  Image as ImageIcon,
  Github,
  ExternalLink,
  X,
  Plus,
  Loader2,
  Upload,
  Sparkles,
  Wand2,
  Code2,
} from "lucide-react";

const CreateProject = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState("project");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [techStack, setTechStack] = useState([]);
  const [tagSearch, setTagSearch] = useState("");
  const [github, setGithub] = useState("");
  const [demo, setDemo] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  /* Add tag to tech stack */
  const addTag = (tag) => {
    if (techStack.includes(tag)) {
      toast.error("Tag already added");
      return;
    }
    if (techStack.length >= 8) {
      toast.error("Maximum 8 tags allowed");
      return;
    }
    setTechStack([...techStack, tag]);
    setTagSearch("");
  };

  /* Remove tag */
  const removeTag = (tag) => {
    setTechStack(techStack.filter((t) => t !== tag));
  };

  /* Filter available tags */
  const filteredTags = TAGS.filter(
    (tag) =>
      tag.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !techStack.includes(tag)
  ).slice(0, 8);

  /* Handle image selection */
  const handleImages = (files) => {
    const fileArray = Array.from(files).slice(0, 5 - images.length);
    if (fileArray.length === 0) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Validate files
    const validFiles = fileArray.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setImages((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [
      ...prev,
      ...validFiles.map((f) => URL.createObjectURL(f)),
    ]);
  };

  /* Handle file input change */
  const onFileChange = (e) => {
    if (e.target.files) {
      handleImages(e.target.files);
      e.target.value = "";
    }
  };

  /* Remove image */
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* Drag and drop handlers */
  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => {
    setDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleImages(e.dataTransfer.files);
    }
  };

  /* Validate form */
  const isValid = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (!content.trim()) {
      toast.error(mode === "project" ? "Description is required" : "Content is required");
      return false;
    }
    if (title.length > 100) {
      toast.error("Title must be less than 100 characters");
      return false;
    }
    return true;
  };

  /* Submit form */
  const submit = async () => {
    if (!isValid()) return;

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("title", title.trim());

      if (mode === "project") {
        formData.append("description", content.trim());
        if (github.trim()) formData.append("githubLink", github.trim());
        if (demo.trim()) formData.append("liveDemoLink", demo.trim());
      } else {
        formData.append("content", content.trim());
      }

      formData.append("techStack", JSON.stringify(techStack));
      formData.append("mentions", JSON.stringify(mentions.map((m) => m._id)));

      images.forEach((img) => formData.append("images", img));

      const endpoint = mode === "project" ? "/projects" : "/blogs";
      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        mode === "project"
          ? "Project created successfully!"
          : "Blog published successfully!"
      );

      if (mode === "project") {
        navigate(`/project/${res.data._id}`);
      } else {
        navigate(`/blog/${res.data._id}`);
      }
    } catch (err) {
      console.error("Submit error:", err);
      const message = err.response?.data?.message || "Failed to create project. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
        {/* Header gradient */}
        <div className="absolute inset-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

        {/* Floating decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-accent/10 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-primary/10 rounded-full blur-2xl animate-float" style={{ animationDelay: "1s" }} />

        {/* Header */}
        <div className="relative p-6 sm:p-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {mode === "project" ? (
                  <Rocket className="w-5 h-5 text-primary" />
                ) : (
                  <Sparkles className="w-5 h-5 text-accent" />
                )}
                <span className="text-xs font-semibold text-primary/70 uppercase tracking-wider">
                  {mode === "project" ? "New Project" : "New Blog"}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {mode === "project" ? "Create Project" : "Write Blog"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {mode === "project"
                  ? "Share your latest build with the community"
                  : "Share knowledge and insights with developers"}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="relative flex bg-slate-100/80 dark:bg-slate-800/80 rounded-xl p-1.5 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
              <div
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-primary to-accent rounded-lg shadow-lg transition-all duration-300 ${
                  mode === "blog" ? "left-[calc(50%+3px)]" : "left-1.5"
                }`}
              />
              <button
                onClick={() => setMode("project")}
                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  mode === "project" ? "text-white" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Rocket className="w-4 h-4" />
                <span className="hidden sm:inline">Project</span>
              </button>

              <button
                onClick={() => setMode("blog")}
                className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  mode === "blog" ? "text-white" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Wand2 className="w-4 h-4" />
                <span className="hidden sm:inline">Blog</span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative px-6 sm:px-8 pb-8 space-y-6">
          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary/70" />
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={mode === "project" ? "My Awesome Project" : "How I Built This"}
              maxLength={100}
              className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <p className="text-xs text-slate-400 mt-1.5 text-right">
              {title.length}/100
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
              {mode === "project" ? (
                <>
                  <Sparkles className="w-4 h-4 text-primary/70" />
                  Description
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 text-accent/70" />
                  Content
                </>
              )}
              <span className="text-rose-500">*</span>
            </label>
            <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
              <MentionInput
                value={content}
                onChange={setContent}
                onMentionsChange={setMentions}
                placeholder={
                  mode === "project"
                    ? "Describe your project, what it does, and how you built it..."
                    : "Write your blog post content here... Use @ to mention users"
                }
                rows={mode === "project" ? 6 : 10}
              />
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary/70" />
              Tech Stack
              <span className="text-xs text-slate-400 font-normal">
                ({techStack.length}/8)
              </span>
            </label>

            {/* Selected tags */}
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {techStack.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-primary/10 to-accent/10 text-primary dark:from-primary/20 dark:to-accent/20 dark:text-primary px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/20"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:bg-primary/10 rounded-full p-0.5 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <input
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              placeholder="Search technologies (e.g., React, Node.js)..."
              className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />

            {/* Tag suggestions */}
            {tagSearch && filteredTags.length > 0 && (
              <div className="border border-slate-200/50 dark:border-slate-700/50 rounded-xl mt-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl max-h-48 overflow-y-auto">
                {filteredTags.map((tag) => (
                  <div
                    key={tag}
                    onClick={() => addTag(tag)}
                    className="px-4 py-2.5 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 cursor-pointer text-sm flex items-center gap-3 transition"
                  >
                    <span className="w-2 h-2 bg-gradient-to-r from-primary to-accent rounded-full" />
                    {tag}
                  </div>
                ))}
              </div>
            )}

            {!tagSearch && techStack.length === 0 && (
              <p className="text-xs text-slate-400 mt-2">
                Add up to 8 technologies to help others discover your {mode}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary/70" />
              Images
              <span className="text-xs text-slate-400 font-normal">
                ({images.length}/5)
              </span>
            </label>

            {/* Drop zone */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 overflow-hidden ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-slate-200/50 dark:border-slate-700/50 hover:border-primary/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
              }`}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                  backgroundSize: "20px 20px"
                }} />
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                multiple
                accept="image/*"
                className="hidden"
              />

              <div className="relative">
                <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center transition-transform ${dragOver ? "scale-110" : ""}`}>
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Drag & drop images or click to browse
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </div>
            </div>

            {/* Image previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="rounded-xl object-cover w-full h-20 border border-slate-200/50 dark:border-slate-700/50"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project Links (only for projects) */}
          {mode === "project" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                  <Github className="w-4 h-4 text-slate-400" />
                  GitHub Link
                </label>
                <input
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  Live Demo
                </label>
                <input
                  value={demo}
                  onChange={(e) => setDemo(e.target.value)}
                  placeholder="https://your-project.vercel.app"
                  className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading || !title.trim() || !content.trim()}
            className="w-full relative overflow-hidden group bg-gradient-to-r from-primary via-accent to-accent-2 disabled:from-slate-300 disabled:to-slate-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 disabled:shadow-none"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-accent via-accent-2 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                <span className="relative z-10">Creating...</span>
              </>
            ) : (
              <>
                {mode === "project" ? (
                  <>
                    <Rocket className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Create Project</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Publish Blog</span>
                  </>
                )}
                <Plus className="w-5 h-5 relative z-10" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;