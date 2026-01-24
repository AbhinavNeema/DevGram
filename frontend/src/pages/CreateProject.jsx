import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import TAGS from "../constants/tags";
import MentionInput from "../components/MentionInput";

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

  const addTag = tag => {
    if (techStack.includes(tag)) return;
    if (techStack.length >= 8) return;
    setTechStack([...techStack, tag]);
    setTagSearch("");
  };

  const removeTag = tag => {
    setTechStack(techStack.filter(t => t !== tag));
  };

  const filteredTags = TAGS.filter(
    tag =>
      tag.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !techStack.includes(tag)
  );

  const handleImages = e => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const submit = async () => {
    if (!title || !content) return;

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("mentions", JSON.stringify(mentions.map(m => m._id)));
      formData.append("techStack", JSON.stringify(techStack));

      if (mode === "project") {
        formData.append("description", content);
        if (github) formData.append("githubLink", github);
        if (demo) formData.append("liveDemoLink", demo);
      } else {
        formData.append("content", content);
      }

      images.forEach(img => formData.append("images", img));

      await api.post(
        mode === "project" ? "/projects" : "/blogs",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (

  <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
    
    {/* HEADER */}
    <h2 className="text-xl font-bold text-slate-900 mb-5">
      {mode === "project" ? "Create a project" : "Write a blog"}
    </h2>

    {/* MODE TOGGLE */}
    <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-full w-fit">
      <button
        onClick={() => setMode("project")}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
          mode === "project"
            ? "bg-[#0a66c2] text-white shadow"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        Project
      </button>

      <button
        onClick={() => setMode("blog")}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
          mode === "blog"
            ? "bg-[#0a66c2] text-white shadow"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        Blog
      </button>
    </div>

    {/* TITLE */}
    <input
      value={title}
      onChange={e => setTitle(e.target.value)}
      placeholder={mode === "project" ? "Project title" : "Blog title"}
      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 mb-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
    />

    {/* CONTENT */}
    <div className="mb-5">
      <MentionInput
        value={content}
        onChange={setContent}
        onMentionsChange={setMentions}
        placeholder={
          mode === "project"
            ? "Describe your project, approach, and learnings"
            : "Share your experience, bug, or learning"
        }
        rows={mode === "project" ? 4 : 6}
        className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition resize-none"
      />
    </div>

    {/* TECH STACK */}
    <div className="mb-5 relative">
      <label className="text-sm font-semibold text-slate-700">
        Tech Stack <span className="text-slate-400">(max 8)</span>
      </label>

      <div className="flex flex-wrap gap-2 mt-2">
        {techStack.map(tag => (
          <span
            key={tag}
            className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:text-red-500 transition"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <input
        value={tagSearch}
        onChange={e => setTagSearch(e.target.value)}
        placeholder="Search tech (React, MongoDB, Python...)"
        className="w-full border border-slate-300 rounded-lg px-4 py-2 mt-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
      />

      {tagSearch && filteredTags.length > 0 && (
        <div className="absolute z-20 bg-white border border-slate-200 rounded-lg mt-1 w-full shadow-lg max-h-48 overflow-y-auto">
          {filteredTags.map(tag => (
            <div
              key={tag}
              onClick={() => addTag(tag)}
              className="px-4 py-2 text-sm hover:bg-slate-100 cursor-pointer"
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* IMAGES */}
    <div className="mb-5">
      <label className="text-sm font-semibold text-slate-700 block mb-1">
        Images
      </label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImages}
        className="text-sm"
      />

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {previews.map((src, i) => (
            <img
              key={i}
              src={src}
              className="h-24 w-full object-cover rounded-lg border"
            />
          ))}
        </div>
      )}
    </div>

    {/* PROJECT LINKS */}
    {mode === "project" && (
      <div className="space-y-3 mb-4">
        <input
          value={github}
          onChange={e => setGithub(e.target.value)}
          placeholder="GitHub repository link (optional)"
          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
        />

        <input
          value={demo}
          onChange={e => setDemo(e.target.value)}
          placeholder="Live demo link (optional)"
          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
        />
      </div>
    )}

    {/* SUBMIT */}
    <button
      onClick={submit}
      disabled={loading}
      className="w-full bg-[#0a66c2] text-white py-2.5 rounded-lg mt-4 font-semibold transition-all hover:bg-[#004182] active:scale-[0.98] disabled:opacity-60"
    >
      {loading
        ? mode === "project"
          ? "Posting…"
          : "Publishing…"
        : mode === "project"
        ? "Post project"
        : "Publish blog"}
    </button>
  </div>
);

};

export default CreateProject;