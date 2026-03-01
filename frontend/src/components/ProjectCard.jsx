import React from "react";
import api from "../api/axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";
import { renderMentions } from "../utils/renderMentions.jsx";
import MentionInput from "../components/MentionInput";
import {
  Heart,
  MessageCircle,
  Eye,
  Share2,
  Edit3,
  Trash2,
  ExternalLink,
  Code2,
  Github,
  Globe,
} from "lucide-react";

const safeGetUserId = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id || null;
  } catch {
    return null;
  }
};

const truncate = (text, limit = 140) =>
  text.length > limit ? text.slice(0, limit).trim() + "..." : text;

const ProjectCard = ({ project, showOwnerActions = false }) => {
  const navigate = useNavigate();
  const userId = safeGetUserId();

  const isOwner = project.owner?._id === userId || project.owner === userId;
  const description = project.description || "";

  const [likesCount, setLikesCount] = useState(project.likes?.length || 0);
  const [liked, setLiked] = useState(project.likes?.includes(userId) || false);
  const [comments, setComments] = useState(project.comments || []);
  const [text, setText] = useState("");
  const [views, setViews] = useState(project.views || 0);
  const [expanded, setExpanded] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [viewed, setViewed] = useState(false);
  const [commentMentions, setCommentMentions] = useState([]);
  const [copied, setCopied] = useState(false);
  // compact comment expansion tracking
  const [expandedComments, setExpandedComments] = useState({});

  /* Same Logic Functions */
  const handleShare = () => {
    const url = `${window.location.origin}/project/${project._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const addView = async () => {
    if (viewed) return;
    try {
      const res = await api.post(`/projects/${project._id}/view`);
      setViews(res.data.views);
      setViewed(true);
    } catch {}
  };

  const handleLike = async () => {
    addView();
    try {
      const res = await api.put(`/projects/${project._id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (e) {
      console.warn("Like failed", e);
    }
  };

  const addComment = async () => {
    if (!text.trim()) return;
    try {
      const res = await api.post(`/projects/${project._id}/comments`, {
        text,
        mentions: commentMentions.map((u) => u._id),
      });
      setComments((prev) => [...prev, res.data]);
      setText("");
      setCommentMentions([]);
    } catch (e) {
      console.warn("Add comment failed", e);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/projects/${project._id}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (e) {
      console.warn("Delete comment failed", e);
    }
  };

  const deleteProject = async () => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/projects/${project._id}`);
      window.location.reload();
    } catch (e) {
      console.warn("Delete project failed", e);
    }
  };

  const toggleExpandComment = (id) => {
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <article className="group bg-white rounded-3xl mb-8 overflow-hidden transition-shadow duration-500 border border-gray-100 shadow-sm hover:shadow-2xl">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50 to-pink-50 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center font-extrabold text-white text-lg shadow-md ring-4 ring-indigo-50">
            {project.owner?.name?.[0] || "U"}
          </div>

          <div>
            <Link to={`/user/${project.owner?._id}`} className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors tracking-tight">
              {project.owner?.name}
            </Link>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Deployed · {timeAgo(project.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            aria-label="Share project link"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none ${copied ? "bg-emerald-500 text-white" : "bg-white text-slate-700 hover:bg-gray-50 border"}`}
          >
            {copied ? "Link Copied" : <><Share2 className="w-4 h-4" /> Share</>}
          </button>

          {isOwner && showOwnerActions && (
            <div className="flex gap-1 ml-2">
              <button onClick={() => navigate(`/projects/${project._id}/edit`)} className="p-2 text-slate-600 hover:text-indigo-600 transition-colors rounded-md">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={deleteProject} className="p-2 text-slate-600 hover:text-rose-600 transition-colors rounded-md">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* CONTENT BODY */}
      <div className="px-6 py-6">
        <h3 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight leading-tight">
          {project.title}
        </h3>

        <div className="text-[15px] text-slate-700 font-medium leading-relaxed mb-4">
          {expanded || description.length <= 180
            ? renderMentions(description, project.mentions)
            : renderMentions(description.slice(0, 180) + "...", project.mentions)}

          {description.length > 180 && (
            <button
              onClick={() => {
                setExpanded(!expanded);
                addView();
              }}
              className="ml-2 text-indigo-600 font-semibold hover:underline underline-offset-4"
            >
              {expanded ? "Collapse" : "Expand Brief"}
            </button>
          )}
        </div>

        {/* DEPLOYMENT LINKS */}
        {(project.githubLink || project.liveDemoLink) && (
          <div className="flex flex-wrap gap-3 mb-6 p-3 rounded-xl bg-gradient-to-r from-white to-indigo-50 border border-gray-100">
            {project.githubLink && (
              <a
                href={project.githubLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-white/80 hover:bg-gray-100 text-slate-800 rounded-lg text-xs font-semibold border border-gray-100 transition-all active:scale-95"
              >
                <Github className="w-4 h-4" />
                Source
              </a>
            )}
            {project.liveDemoLink && (
              <a
                href={project.liveDemoLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-pink-500 text-white rounded-lg text-xs font-semibold shadow transition-all active:scale-95"
              >
                <Globe className="w-4 h-4" />
                Live
              </a>
            )}
          </div>
        )}

        {/* IMAGE GRID */}
        {project.images?.length > 0 && (
          <div className={`grid gap-4 mb-6 ${project.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {project.images.map((img, i) => (
              <div
                key={i}
                className="relative aspect-video overflow-hidden rounded-xl border border-gray-100 cursor-zoom-in hover:shadow-lg"
                onClick={() => {
                  addView();
                  setActiveImage(img.url);
                }}
              >
                <div className="absolute inset-0 bg-indigo-600/10 opacity-0 hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                  <ExternalLink className="w-8 h-8 text-indigo-700" />
                </div>
                <img src={img.url} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              </div>
            ))}
          </div>
        )}

        {/* TAGS */}
        <div className="flex gap-2 flex-wrap mb-6">
          {(project.techStack || []).map((tag) => (
            <Link
              key={tag}
              to={`/?tag=${encodeURIComponent(tag)}`}
              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-all"
            >
              <Code2 className="w-3 h-3" />
              {tag}
            </Link>
          ))}
        </div>

        {/* INTERACTION BAR */}
        <div className="flex gap-6 items-center pt-4 border-t border-gray-100 text-slate-600">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 font-semibold text-sm transition-colors ${liked ? "text-rose-600" : "hover:text-rose-500"}`}
          >
            <Heart className={`w-5 h-5 transition-transform ${liked ? "scale-110 drop-shadow-[0_4px_12px_rgba(244,63,94,0.25)]" : "hover:scale-110"}`} />
            <span className="text-sm">{likesCount}</span>
          </button>

          <div className="flex items-center gap-2 font-semibold text-sm">
            <MessageCircle className="w-5 h-5 text-slate-500" />
            <span className="text-sm">{comments.length}</span>
          </div>

          <div className="flex items-center gap-2 font-semibold text-sm">
            <Eye className="w-5 h-5 text-slate-500" />
            <span className="text-sm">{views}</span>
          </div>
        </div>
      </div>

      {/* COMMENTS SECTION (COMPACT & ALIGNED) */}
      {/* COMMENTS */}
<div className="bg-gray-50 border-t border-gray-100 px-5 py-3">

  {/* preview comment */}
  <div className="max-h-24 overflow-y-auto mb-2">
    {(showAllComments ? comments : comments.slice(0,1)).map((comment)=>(
      <div key={comment._id} className="flex gap-2 items-start">

        {/* avatar */}
        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 flex-shrink-0">
          {comment.author?.name?.[0] || "U"}
        </div>

        {/* bubble */}
        <div className="flex-1 bg-white border border-gray-100 rounded-xl px-3 py-2">

          <div className="flex items-center gap-2 text-[12px]">
            <span className="font-semibold text-slate-900">
              {comment.author?.name}
            </span>

            <span className="text-slate-400 text-[10px]">
              {timeAgo(comment.createdAt)}
            </span>

            {comment.author?._id === userId && (
              <button
                onClick={() => deleteComment(comment._id)}
                className="ml-auto text-[10px] text-rose-500 hover:underline"
              >
                delete
              </button>
            )}
          </div>

          <p className="text-[13px] text-slate-700 mt-0.5 leading-snug">
            {renderMentions(truncate(comment.text,140),comment.mentions)}
          </p>

        </div>
      </div>
    ))}
  </div>

  {/* view all */}
  {comments.length > 1 && (
    <button
      onClick={()=>setShowAllComments(!showAllComments)}
      className="text-[12px] text-indigo-600 font-semibold mb-2"
    >
      {showAllComments ? "Hide comments" : `View all ${comments.length}`}
    </button>
  )}

  {/* input */}
  <div className="flex items-center gap-2">

    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
      {project.owner?.name?.[0] || "U"}
    </div>

    <div className="flex-1 border border-gray-200 rounded-full px-3 py-1.5 bg-white focus-within:border-indigo-400 transition">
      <MentionInput
        value={text}
        onChange={setText}
        onMentionsChange={setCommentMentions}
        placeholder="Write comment..."
        rows={1}
        className="text-[13px] py-1 placeholder:text-slate-400"
      />
    </div>

    <button
      onClick={addComment}
      className="text-indigo-600 text-[13px] font-semibold hover:text-indigo-500"
    >
      Post
    </button>

  </div>

</div>
    </article>
    );
  };

  export default ProjectCard;
