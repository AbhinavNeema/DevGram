import React, { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";
import { renderMentions } from "../utils/renderMentions.jsx";
import MentionInput from "./MentionInput";
import {
  Heart,
  MessageCircle,
  Eye,
  Share2,
  Edit3,
  Trash2,
  ExternalLink,
  FileText,
  MessageSquare,
  BookOpen,
} from "lucide-react";

const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.sub || payload?.id || null;
  } catch {
    return null;
  }
};

const truncate = (text, limit = 140) =>
  text.length > limit ? text.slice(0, limit).trim() + "..." : text;

const BlogCard = ({ blog, showOwnerActions = false }) => {
  const navigate = useNavigate();
  const userId = getCurrentUserId();

  const isOwner = blog.author?._id === userId || blog.author === userId;

  const [likesCount, setLikesCount] = useState(blog.likes?.length || 0);
  const [liked, setLiked] = useState(blog.likes?.includes(userId) || false);
  const [comments, setComments] = useState(blog.comments || []);
  const [text, setText] = useState("");
  const [views, setViews] = useState(blog.views || 0);
  const [expanded, setExpanded] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [viewed, setViewed] = useState(false);
  const [commentMentions, setCommentMentions] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const handleShare = () => {
    const url = `${window.location.origin}/blog/${blog._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addView = async () => {
    if (viewed) return;
    try {
      const res = await api.post(`/blogs/${blog._id}/view`);
      setViews(res.data.views);
      setViewed(true);
    } catch {}
  };

  const handleLike = async () => {
    addView();
    if (!liked) {
      setIsLikeAnimating(true);
      setTimeout(() => setIsLikeAnimating(false), 300);
    }
    try {
      const res = await api.put(`/blogs/${blog._id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (e) {
      console.warn("Like failed", e);
    }
  };

  const addComment = async () => {
    if (!text.trim()) return;
    try {
      const res = await api.post(`/blogs/${blog._id}/comments`, {
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
      await api.delete(`/blogs/${blog._id}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (e) {
      console.warn("Delete comment failed", e);
    }
  };

  const deleteBlog = async () => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await api.delete(`/blogs/${blog._id}`);
      window.location.reload();
    } catch (e) {
      console.warn("Delete blog failed", e);
    }
  };

  const readingTime = Math.ceil((blog.content?.length || 0) / 1000);

  return (
    <article className="group relative bg-gradient-to-br from-white via-indigo-50/30 to-cyan-50/30 dark:from-slate-900 dark:via-indigo-950/30 dark:to-cyan-950/30 backdrop-blur-2xl rounded-3xl border border-indigo-200/30 dark:border-indigo-800/30 shadow-xl shadow-indigo-500/10 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 overflow-hidden animate-slide-up hover:-translate-y-2">
      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-r from-indigo-500 via-cyan-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-teal-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Glowing orb effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* HEADER */}
      <header className="flex items-center justify-between p-5 sm:p-6 pb-4 relative z-10">
        <div className="flex items-center gap-4">
          {/* Animated avatar */}
          <div
            className="relative cursor-pointer"
            onClick={() => navigate(`/user/${blog.author?._id}`)}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
              {blog.author?.name?.[0]?.toUpperCase() || "U"}
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-800 shadow-lg" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-bold text-slate-800 dark:text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-indigo-600 hover:to-cyan-600 cursor-pointer transition-all duration-300"
                onClick={() => navigate(`/user/${blog.author?._id}`)}
              >
                {blog.author?.name}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-medium">{timeAgo(blog.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-900/50 dark:to-cyan-900/50 text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
                Blog
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <BookOpen className="w-3 h-3" />
                {readingTime} min read
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 backdrop-blur-sm
              ${copied
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
                : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 border border-indigo-200/30 dark:border-indigo-700/30 hover:border-indigo-400/50 hover:text-indigo-600"
              }
            `}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share
              </>
            )}
          </button>

          {isOwner && showOwnerActions && (
            <div className="flex gap-1 ml-2">
              <button
                onClick={() => navigate(`/blogs/${blog._id}/edit`)}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all duration-300 hover:scale-110"
                title="Edit blog"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={deleteBlog}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all duration-300 hover:scale-110"
                title="Delete blog"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* CONTENT BODY */}
      <div className="px-5 sm:px-6 pb-5 relative z-10">
        <h3
          className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3 cursor-pointer group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-cyan-600 transition-all duration-300"
          onClick={() => navigate(`/blog/${blog._id}`)}
        >
          {blog.title}
        </h3>

        <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
          {expanded || (blog.content?.length || 0) <= 180
            ? renderMentions(blog.content || "", blog.mentions)
            : renderMentions(blog.content?.slice(0, 180) + "...", blog.mentions)}

          {(blog.content?.length || 0) > 180 && (
            <button
              onClick={() => {
                setExpanded(!expanded);
                addView();
              }}
              className="ml-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-cyan-600 hover:to-teal-600 transition-all"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        {/* TAGS */}
        {blog.tags?.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-5">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-900/50 dark:to-cyan-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 hover:from-indigo-200 hover:to-cyan-200 dark:hover:from-indigo-800 dark:hover:to-cyan-800 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/?tag=${encodeURIComponent(tag)}`)}
              >
                <FileText className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* INTERACTION BAR */}
        <div className="flex items-center gap-6 pt-4 border-t border-indigo-100/50 dark:border-indigo-800/50">
          <button
            onClick={handleLike}
            className={`
              flex items-center gap-2 text-sm font-bold transition-all duration-300
              ${liked ? "text-rose-500" : "text-slate-500 hover:text-rose-500"}
            `}
          >
            <Heart className={`w-5 h-5 transition-all duration-300 ${liked ? "fill-current scale-110" : ""} ${isLikeAnimating ? "scale-125" : ""}`} />
            <span>{likesCount}</span>
          </button>

          <button
            onClick={() => setShowAllComments(!showAllComments)}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors duration-300"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{comments.length}</span>
          </button>

          <div className="flex items-center gap-2 text-sm font-bold text-slate-500 ml-auto">
            <Eye className="w-5 h-5" />
            <span>{views}</span>
          </div>
        </div>
      </div>

      {/* COMMENTS SECTION */}
      {comments.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50/50 to-cyan-50/50 dark:from-slate-800/50 dark:to-indigo-950/30 border-t border-indigo-100/50 dark:border-indigo-800/50 px-5 sm:px-6 py-4 relative z-10">
          <div className="space-y-3">
            {(showAllComments ? comments : comments.slice(0, 2)).map((comment) => (
              <div key={comment._id} className="flex gap-3 animate-fade-in">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 dark:from-indigo-600/30 dark:to-cyan-600/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                  {comment.author?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl px-4 py-3 border border-indigo-100/50 dark:border-indigo-800/50 shadow-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      {comment.author?.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {renderMentions(truncate(comment.text, 120), comment.mentions)}
                  </p>
                </div>
                {comment.author?._id === userId && (
                  <button
                    onClick={() => deleteComment(comment._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all self-start hover:scale-110"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {comments.length > 2 && !showAllComments && (
            <button
              onClick={() => setShowAllComments(true)}
              className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 mt-3 hover:from-cyan-600 hover:to-teal-600 transition-all"
            >
              View all {comments.length} comments
            </button>
          )}
        </div>
      )}

      {/* COMMENT INPUT */}
      <div className="px-5 sm:px-6 py-4 border-t border-indigo-100/50 dark:border-indigo-800/50 bg-white/50 dark:bg-slate-900/50 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg">
            {userId ? (blog.author?.name?.[0]?.toUpperCase() || "U") : "?"}
          </div>
          <div className="flex-1 flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl px-4 py-2.5 border border-indigo-200/30 dark:border-indigo-700/30 focus-within:border-indigo-500/50 dark:focus-within:border-indigo-500/50 transition-all duration-300">
            <MentionInput
              value={text}
              onChange={setText}
              onMentionsChange={setCommentMentions}
              placeholder="Write a comment..."
              rows={1}
              className="text-sm py-1 flex-1"
            />
          </div>
          <button
            onClick={addComment}
            disabled={!text.trim()}
            className="p-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 active:scale-95 shadow-md"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image Modal */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-950/95 to-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in cursor-zoom-out"
          onClick={() => setActiveImage(null)}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px]" />
          </div>
          <img
            src={activeImage}
            alt="Full size"
            className="relative max-w-full max-h-[90vh] rounded-3xl shadow-2xl shadow-indigo-500/20 border border-white/10 animate-scale-in"
          />
        </div>
      )}
    </article>
  );
};

export default BlogCard;