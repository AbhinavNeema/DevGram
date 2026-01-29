import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import TAGS from "../constants/tags";
import MentionInput from "../components/MentionInput";
import { 
  Rocket, 
  BookOpen, 
  Code2, 
  Image as ImageIcon, 
  Github, 
  ExternalLink, 
  X, 
  Plus, 
  Loader2,
  Cpu
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
      await api.post(mode === "project" ? "/projects" : "/blogs", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#0F111A] border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl mb-12 animate-in fade-in zoom-in duration-500">
      
      {/* HEADER & TOGGLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">
            {mode === "project" ? "Launch Project" : "Publish Insight"}
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            {mode === "project" ? "Deploy your creation" : "Share your knowledge"}
          </p>
        </div>

        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 w-full sm:w-fit">
          <button
            onClick={() => setMode("project")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              mode === "project" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Rocket className="w-4 h-4" /> Project
          </button>
          <button
            onClick={() => setMode("blog")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              mode === "blog" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Blog
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* TITLE INPUT */}
        <div className="space-y-2 group">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={mode === "project" ? "Enter project name..." : "Enter blog heading..."}
            className="w-full bg-[#161925] border-2 border-white/5 rounded-2xl px-5 py-4 text-white font-bold placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
          />
        </div>

        {/* CONTENT INPUT */}
        <div className="space-y-2 group">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Content Brief</label>
          <div className="rounded-2xl border-2 border-white/5 bg-[#161925] focus-within:border-indigo-500/50 transition-all overflow-hidden">
            <MentionInput
              value={content}
              onChange={setContent}
              onMentionsChange={setMentions}
              placeholder={mode === "project" ? "Technical details, learnings, and goals..." : "Share your story or tutorial..."}
              rows={mode === "project" ? 5 : 8}
              className="w-full bg-transparent px-5 py-4 text-white font-medium placeholder:text-slate-700 outline-none"
            />
          </div>
        </div>

        {/* TECH STACK */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Architecture <span className="text-indigo-500 opacity-60">({techStack.length}/8)</span></label>
            <Cpu className="w-4 h-4 text-slate-700" />
          </div>

          <div className="flex flex-wrap gap-2 min-h-[20px]">
            {techStack.map(tag => (
              <span key={tag} className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-in zoom-in duration-300">
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-300 transition-colors"><X className="w-3 h-3 stroke-[4px]" /></button>
              </span>
            ))}
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
              <Code2 className="w-4 h-4" />
            </div>
            <input
              value={tagSearch}
              onChange={e => setTagSearch(e.target.value)}
              placeholder="Search technologies (e.g. React, Docker...)"
              className="w-full bg-[#161925] border-2 border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm text-white font-bold placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
            {tagSearch && filteredTags.length > 0 && (
              <div className="absolute z-50 bg-[#1A1D26] border border-white/10 rounded-2xl mt-2 w-full shadow-2xl max-h-48 overflow-y-auto p-2 backdrop-blur-xl">
                {filteredTags.map(tag => (
                  <div key={tag} onClick={() => addTag(tag)} className="px-4 py-3 text-sm text-slate-300 hover:bg-indigo-600 hover:text-white rounded-xl cursor-pointer transition-all font-bold">
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* IMAGES */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Visual Assets
          </label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-[2rem] bg-black/20 hover:bg-black/40 hover:border-indigo-500/40 transition-all cursor-pointer group/upload">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Plus className="w-8 h-8 text-slate-600 group-hover/upload:scale-110 group-hover/upload:text-indigo-500 transition-all duration-300" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Upload Media</p>
            </div>
            <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
          </label>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group/img">
                  <img src={src} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" alt="Preview" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PROJECT LINKS */}
        {mode === "project" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"><Github className="w-4 h-4" /></div>
              <input value={github} onChange={e => setGithub(e.target.value)} placeholder="Repository link" className="w-full bg-[#161925] border-2 border-white/5 rounded-2xl pl-12 pr-5 py-4 text-xs text-white font-bold focus:border-indigo-500/50 outline-none" />
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"><ExternalLink className="w-4 h-4" /></div>
              <input value={demo} onChange={e => setDemo(e.target.value)} placeholder="Live demo link" className="w-full bg-[#161925] border-2 border-white/5 rounded-2xl pl-12 pr-5 py-4 text-xs text-white font-bold focus:border-indigo-500/50 outline-none" />
            </div>
          </div>
        )}

        {/* SUBMIT */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] transition-all active:scale-[0.98] mt-6 flex items-center justify-center gap-3"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {mode === "project" ? "Finalize Deployment" : "Publish to Feed"}
              <Plus className="w-5 h-5 stroke-[3px]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateProject;