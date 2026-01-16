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
    <div className="max-w-xl mx-auto bg-white border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">
        {mode === "project" ? "Create a project" : "Write a blog"}
      </h2>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setMode("project")}
          className={`px-4 py-1.5 rounded-full text-sm border ${
            mode === "project"
              ? "bg-[#0a66c2] text-white border-[#0a66c2]"
              : "text-gray-600 border-gray-300"
          }`}
        >
          Project
        </button>

        <button
          onClick={() => setMode("blog")}
          className={`px-4 py-1.5 rounded-full text-sm border ${
            mode === "blog"
              ? "bg-[#0a66c2] text-white border-[#0a66c2]"
              : "text-gray-600 border-gray-300"
          }`}
        >
          Blog
        </button>
      </div>

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder={mode === "project" ? "Project title" : "Blog title"}
        className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
      />

      <MentionInput
        value={content}
        onChange={setContent}
        onMentionsChange={setMentions}
        placeholder={
          mode === "project"
            ? "Describe your project"
            : "Share your experience, bug, or learning"
        }
        rows={mode === "project" ? 4 : 6}
      />

      <div className="mb-4 relative">
        <label className="text-sm font-medium text-gray-700">
          Tech Stack (max 8)
        </label>

        <div className="flex flex-wrap gap-2 mt-2">
          {techStack.map(tag => (
            <span
              key={tag}
              className="bg-[#eef3f8] px-3 py-1 rounded-full text-xs flex gap-1"
            >
              {tag}
              <button onClick={() => removeTag(tag)}>×</button>
            </span>
          ))}
        </div>

        <input
          value={tagSearch}
          onChange={e => setTagSearch(e.target.value)}
          placeholder="Search tech"
          className="w-full border rounded-md px-3 py-2 mt-2 text-sm"
        />

        {tagSearch && filteredTags.length > 0 && (
          <div className="absolute z-10 bg-white border rounded-md mt-1 w-full shadow">
            {filteredTags.map(tag => (
              <div
                key={tag}
                onClick={() => addTag(tag)}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              >
                {tag}
              </div>
            ))}
          </div>
        )}
      </div>

      <input type="file" multiple accept="image/*" onChange={handleImages} />

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {previews.map((src, i) => (
            <img
              key={i}
              src={src}
              className="h-24 w-full object-cover rounded"
            />
          ))}
        </div>
      )}

      {mode === "project" && (
        <>
          <input
            value={github}
            onChange={e => setGithub(e.target.value)}
            placeholder="GitHub link (optional)"
            className="w-full border rounded-md px-3 py-2 mt-4 text-sm"
          />

          <input
            value={demo}
            onChange={e => setDemo(e.target.value)}
            placeholder="Live demo link (optional)"
            className="w-full border rounded-md px-3 py-2 mt-3 text-sm"
          />
        </>
      )}

      <button
        onClick={submit}
        disabled={loading}
        className="w-full bg-[#0a66c2] text-white py-2 rounded-md mt-5"
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