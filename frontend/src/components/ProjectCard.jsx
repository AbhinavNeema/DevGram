import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/timeAgo';
import { renderMentions } from '../utils/renderMentions.jsx';
import MentionInput from './MentionInput';
import ImageLightbox from './ImageLightbox';
import toast from 'react-hot-toast';
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
  Check,
  Send,
} from 'lucide-react';

const truncate = (text, limit = 140) =>
  text.length > limit ? text.slice(0, limit).trim() + '...' : text;

const ProjectCard = ({ project, showOwnerActions = false, onDelete }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id || null;

  const isOwner =
    currentUserId &&
    (String(project.owner?._id) === String(currentUserId) ||
      String(project.owner) === String(currentUserId));

  const description = project.description || '';

  const [likesCount, setLikesCount] = useState(project.likes?.length || 0);
  const [liked, setLiked] = useState(
    currentUserId ? project.likes?.includes(currentUserId) : false
  );
  const [comments, setComments] = useState(project.comments || []);
  const [text, setText] = useState('');
  const [views, setViews] = useState(project.views || 0);
  const [expanded, setExpanded] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [viewed, setViewed] = useState(false);
  const [commentMentions, setCommentMentions] = useState([]);
  const [copied, setCopied] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/project/${project._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Project link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const addView = async () => {
    if (viewed) return;
    try {
      const res = await api.post(`/projects/${project._id}/view`);
      if (res.data?.views !== undefined) {
        setViews(res.data.views);
      }
      setViewed(true);
    } catch {}
  };

  const handleLike = async () => {
    addView();
    // Optimistic update
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await api.put(`/projects/${project._id}/like`);
      if (res.data) {
        setLiked(res.data.liked);
        setLikesCount(res.data.likesCount);
      }
    } catch (e) {
      // Revert on error
      setLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error('Could not update like status');
    }
  };

  const addComment = async () => {
    if (!text.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await api.post(`/projects/${project._id}/comments`, {
        text: text.trim(),
        mentions: commentMentions.map((u) => u._id),
      });

      // Append new comment to local state (no page reload!)
      setComments((prev) => [...prev, res.data]);
      setText('');
      setCommentMentions([]);
      toast.success('Comment added');
    } catch (e) {
      console.warn('Add comment failed', e);
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/projects/${project._id}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (e) {
      console.warn('Delete comment failed', e);
      toast.error('Failed to delete comment');
    }
  };

  const deleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${project._id}`);
      toast.success('Project deleted');
      if (onDelete) {
        onDelete(project._id);
      } else {
        navigate('/');
      }
    } catch (e) {
      console.warn('Delete project failed', e);
      toast.error('Failed to delete project');
    }
  };

  const images = project.images || [];

  return (
    <>
      <article className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 mb-6 shadow-xl relative overflow-hidden group">
        {/* HEADER */}
        <header className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3.5">
            {/* Avatar */}
            <Link
              to={`/user/${project.owner?._id || project.owner}`}
              className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-base shadow-md shadow-indigo-500/20 hover:scale-105 transition-transform shrink-0"
            >
              {project.owner?.name?.[0]?.toUpperCase() ||
                project.owner?.username?.[0]?.toUpperCase() ||
                'U'}
            </Link>

            <div>
              <Link
                to={`/user/${project.owner?._id || project.owner}`}
                className="text-sm font-bold text-white hover:text-indigo-400 transition-colors tracking-tight flex items-center gap-1.5"
              >
                <span>{project.owner?.name || project.owner?.username || 'Anonymous'}</span>
              </Link>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Deployed · {timeAgo(project.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              aria-label="Share project link"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] text-xs font-medium transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Share</span>
                </>
              )}
            </button>

            {isOwner && showOwnerActions && (
              <div className="flex items-center gap-1 ml-1">
                <button
                  onClick={() => navigate(`/projects/${project._id}/edit`)}
                  aria-label="Edit project"
                  className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-white/[0.05] rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={deleteProject}
                  aria-label="Delete project"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* CONTENT BODY */}
        <div className="pt-4">
          <Link to={`/project/${project._id}`}>
            <h3 className="text-xl sm:text-2xl font-bold text-white hover:text-indigo-300 transition-colors mb-2.5 tracking-tight leading-snug">
              {project.title}
            </h3>
          </Link>

          <div className="text-sm text-slate-300 font-normal leading-relaxed mb-4">
            {expanded || description.length <= 180
              ? renderMentions(description, project.mentions)
              : renderMentions(description.slice(0, 180) + '...', project.mentions)}

            {description.length > 180 && (
              <button
                onClick={() => {
                  setExpanded(!expanded);
                  addView();
                }}
                className="ml-2 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors underline-offset-4"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>

          {/* DEPLOYMENT LINKS */}
          {(project.githubLink || project.liveDemoLink) && (
            <div className="flex flex-wrap items-center gap-2.5 mb-5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              {project.githubLink && (
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Github className="w-3.5 h-3.5 text-slate-400" />
                  <span>Source Code</span>
                </a>
              )}
              {project.liveDemoLink && (
                <a
                  href={project.liveDemoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-95"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Live Demo</span>
                </a>
              )}
            </div>
          )}

          {/* IMAGE GRID */}
          {images.length > 0 && (
            <div
              className={`grid gap-3 mb-5 ${
                images.length === 1
                  ? 'grid-cols-1'
                  : images.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-2 md:grid-cols-3'
              }`}
            >
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-video overflow-hidden rounded-xl border border-white/[0.08] cursor-zoom-in group/img bg-black/40"
                  onClick={() => {
                    addView();
                    setLightboxIndex(i);
                  }}
                >
                  <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover/img:opacity-100 transition-opacity z-10 flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-white drop-shadow" />
                  </div>
                  <img
                    src={img.url}
                    alt={`${project.title} - Preview ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                  />
                </div>
              ))}
            </div>
          )}

          {/* TECH STACK TAGS */}
          {project.techStack?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-5">
              {project.techStack.map((tag) => (
                <Link
                  key={tag}
                  to={`/?tag=${encodeURIComponent(tag)}`}
                  className="flex items-center gap-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-3 py-1 text-xs font-medium hover:bg-indigo-500/20 transition-colors"
                >
                  <Code2 className="w-3 h-3" />
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* INTERACTION BAR */}
          <div className="flex items-center gap-6 pt-3.5 border-t border-white/[0.06] text-slate-400">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 text-sm font-semibold transition-all ${
                liked
                  ? 'text-rose-500 hover:text-rose-400'
                  : 'hover:text-rose-400 text-slate-400'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform duration-200 ${
                  liked
                    ? 'fill-rose-500 scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                    : 'hover:scale-110'
                }`}
              />
              <span>{likesCount}</span>
            </button>

            <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <MessageCircle className="w-4 h-4 text-slate-500" />
              <span>{comments.length}</span>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 ml-auto">
              <Eye className="w-4 h-4 text-slate-500" />
              <span>{views}</span>
            </div>
          </div>
        </div>

        {/* COMMENTS SECTION */}
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          {/* Comment list preview */}
          {comments.length > 0 && (
            <div className="space-y-2.5 mb-3.5 max-h-56 overflow-y-auto pr-1">
              {(showAllComments ? comments : comments.slice(0, 2)).map((comment) => (
                <div key={comment._id} className="flex gap-2.5 items-start">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">
                    {comment.author?.name?.[0]?.toUpperCase() ||
                      comment.author?.username?.[0]?.toUpperCase() ||
                      'U'}
                  </div>

                  <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/user/${comment.author?._id}`}
                          className="font-semibold text-xs text-white hover:text-indigo-400 transition-colors"
                        >
                          {comment.author?.name || comment.author?.username || 'User'}
                        </Link>
                        <span className="text-[10px] text-slate-500">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>

                      {currentUserId &&
                        String(comment.author?._id) === String(currentUserId) && (
                          <button
                            onClick={() => deleteComment(comment._id)}
                            className="text-[10px] text-slate-500 hover:text-red-400 transition-colors"
                          >
                            delete
                          </button>
                        )}
                    </div>

                    <p className="text-xs text-slate-300 mt-1 leading-snug">
                      {renderMentions(comment.text, comment.mentions)}
                    </p>
                  </div>
                </div>
              ))}

              {comments.length > 2 && (
                <button
                  onClick={() => setShowAllComments(!showAllComments)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors mt-1 block"
                >
                  {showAllComments ? 'Collapse comments' : `View all ${comments.length} comments`}
                </button>
              )}
            </div>
          )}

          {/* Comment input with CURRENT USER'S initial */}
          <div className="flex items-center gap-2.5 mt-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {currentUser?.name?.[0]?.toUpperCase() ||
                currentUser?.username?.[0]?.toUpperCase() ||
                'U'}
            </div>

            <div className="flex-1">
              <MentionInput
                value={text}
                onChange={setText}
                onMentionsChange={setCommentMentions}
                placeholder="Share your thoughts... use @ to mention"
                rows={1}
              />
            </div>

            <button
              onClick={addComment}
              disabled={!text.trim() || submittingComment}
              className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-500/20"
              aria-label="Post comment"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </article>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() => setLightboxIndex((prev) => (prev + 1) % images.length)}
          onPrev={() =>
            setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)
          }
        />
      )}
    </>
  );
};

export default ProjectCard;
