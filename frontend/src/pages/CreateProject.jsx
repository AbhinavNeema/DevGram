import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import TAGS from "../constants/tags";
import MentionInput from "../components/MentionInput";
const CreateProject = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [techStack, setTechStack] = useState([]);
  const [tagSearch, setTagSearch] = useState("");

  const [github, setGithub] = useState("");
  const [demo, setDemo] = useState("");

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(false);

  const addTag = (tag) => {
    if (techStack.includes(tag)) return;
    if (techStack.length >= 8) return; // limit
    setTechStack([...techStack, tag]);
    setTagSearch("");
  };

  const removeTag = (tag) => {
    setTechStack(techStack.filter(t => t !== tag));
  };

  const filteredTags = TAGS.filter(tag =>
    tag.toLowerCase().includes(tagSearch.toLowerCase()) &&
    !techStack.includes(tag)
  );

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const submit = async () => {
  if (!title || !description) return alert("Title & description required");

  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("mentions", JSON.stringify(mentions));
    formData.append("techStack", JSON.stringify(techStack));
    if (github) formData.append("githubLink", github);
    if (demo) formData.append("liveDemoLink", demo);

    images.forEach(img => formData.append("images", img));

    await api.post("/projects", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    navigate("/");
  } catch (err) {
    console.error("Create project failed", err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-xl mx-auto bg-white border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Create a project</h2>

      
      <input
        className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
        placeholder="Project title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <MentionInput
        value={description}
        onChange={setDescription}
        onMentionsChange={setMentions}
        placeholder="Describe your project"
        rows={4}
      />

      
      <div className="mb-4 relative">
        <label className="text-sm font-medium text-gray-700">
          Tech Stack (select up to 8)
        </label>

        <div className="flex flex-wrap gap-2 mt-2">
          {techStack.map(tag => (
            <span
              key={tag}
              className="bg-[#eef3f8] px-3 py-1 rounded-full text-xs flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <input
          value={tagSearch}
          onChange={e => setTagSearch(e.target.value)}
          placeholder="Search tech (React, Node, ML...)"
          className="w-full border rounded-md px-3 py-2 mt-2 text-sm"
        />

        {tagSearch && filteredTags.length > 0 && (
          <div className="absolute z-10 bg-white border rounded-md mt-1 w-full max-h-40 overflow-y-auto shadow">
            {filteredTags.map(tag => (
              <div
                key={tag}
                onClick={() => addTag(tag)}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
              >
                {tag}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="text-sm text-gray-600">Project images</label>
        <input type="file" multiple accept="image/*" onChange={handleImages} />

        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="preview"
                className="h-24 w-full object-cover rounded border"
              />
            ))}
          </div>
        )}
      </div>

      <input
        className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
        placeholder="GitHub link (optional)"
        value={github}
        onChange={e => setGithub(e.target.value)}
      />

      <input
        className="w-full border rounded-md px-3 py-2 mb-4 text-sm"
        placeholder="Live demo link (optional)"
        value={demo}
        onChange={e => setDemo(e.target.value)}
      />

      <button
        onClick={submit}
        disabled={loading}
        className="w-full bg-[#0a66c2] text-white py-2 rounded-md"
      >
        {loading ? "Posting…" : "Post project"}
      </button>
    </div>
  );
};

export default CreateProject;