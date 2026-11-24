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
  Trash2,
  Hash,
  BookOpen,
  Check,
  Send,
  ExternalLink,
} from 'lucide-react';

const BlogCard = ({ blog, showOwnerActions = false, onDelete }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id || null;

  const isOwner =
    currentUserId &&
    (String(blog.author?._id) === String(currentUserId) ||
      String(blog.author) === String(currentUserId));

  const content = blog.content || '';

  const [likesCount, setLikesCount] = useState(blog.likes?.length || 0);
  const [liked, setLiked] = useState(
    currentUserId ? blog.likes?.includes(currentUserId) : false
  );
  const [comments, setComments] = useState(blog.comments || []);
  const [text, setText] = useState('');
  const [views, setViews] = useState(blog.views || 0);
  const [expanded, setExpanded] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [viewed, setViewed] = useState(false);
  const [commentMentions, setCommentMentions] = useState([]);
  const [copied, setCopied] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const images = blog.images || [];

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/blog/${blog._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Article link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const addView = async () => {
    if (viewed) return;
    try {
      const res = await api.post(`/blogs/${blog._id}/view`);
      if (res.data?.views !== undefined) {
        setViews(res.data.views);
      }
      setViewed(true);
    } catch {}
  };

  const handleLike = async () => {
    addView();
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await api.put(`/blogs/${blog._id}/like`);
      if (res.data) {
        setLiked(res.data.liked);
        setLikesCount(res.data.likesCount);
      }
    } catch (e) {
      setLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error('Could not update like status');
    }
  };

  const addComment = async () => {
    if (!text.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await api.post(`/blogs/${blog._id}/comments`, {
        text: text.trim(),
        mentions: commentMentions.map((u) => u._id),
      });

      // Local state update without page reload
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
      await api.delete(`/blogs/${blog._id}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (e) {
      console.warn('Delete comment failed', e);
      toast.error('Failed to delete comment');
    }
  };

  const deleteBlog = async () => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.delete(`/blogs/${blog._id}`);
      toast.success('Article deleted');
      if (onDelete) {
        onDelete(blog._id);
      } else {
        navigate('/');
      }
    } catch (e) {
      console.warn('Delete blog failed', e);
      toast.error('Failed to delete article');
    }
  };

  // Approximate reading time
  const readingTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

  return (
    <>
      <article className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 mb-6 shadow-xl relative overflow-hidden group">
        {/* HEADER */}
        <header className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3.5">
            <Link
              to={`/user/${blog.author?._id || blog.author}`}
              className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-md shadow-violet-500/20 hover:scale-105 transition-transform shrink-0"
            >
              {blog.author?.name?.[0]?.toUpperCase() ||
                blog.author?.username?.[0]?.toUpperCase() ||
                'U'}
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/user/${blog.author?._id || blog.author}`}
                  className="text-sm font-bold text-white hover:text-indigo-400 transition-colors tracking-tight"
                >
                  {blog.author?.name || blog.author?.username || 'Anonymous'}
                </Link>
                <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1">
                  <BookOpen className="w-2.5 h-2.5" />
                  Article · {readingTime} min read
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Published {timeAgo(blog.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              aria-label="Share article"
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
              <button
                onClick={deleteBlog}
                aria-label="Delete article"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* CONTENT */}
        <div className="pt-4">
          <Link to={`/blog/${blog._id}`}>
            <h3 className="text-xl sm:text-2xl font-bold text-white hover:text-indigo-300 transition-colors mb-2.5 tracking-tight leading-snug">
              {blog.title}
            </h3>
          </Link>

          <div className="text-sm text-slate-300 font-normal leading-relaxed mb-4">
            {expanded || content.length <= 220
              ? renderMentions(content, blog.mentions)
              : renderMentions(content.slice(0, 220) + '...', blog.mentions)}

            {content.length > 220 && (
              <button
                onClick={() => {
                  setExpanded(!expanded);
                  addView();
                }}
                className="ml-2 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors underline-offset-4"
              >
                {expanded ? 'Show less' : 'Read full article'}
              </button>
            )}
          </div>

          {/* Optional Images */}
          {images.length > 0 && (
            <div
              className={`grid gap-3 mb-5 ${
                images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
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
                  <div className="absolute inset-0 bg-violet-600/20 opacity-0 group-hover/img:opacity-100 transition-opacity z-10 flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-white drop-shadow" />
                  </div>
                  <img
                    src={img.url}
                    alt={`${blog.title} image ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                  />
                </div>
              ))}
            </div>
          )}

          {/* TAGS */}
          {blog.techStack?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-5">
              {blog.techStack.map((tag) => (
                <Link
                  key={tag}
                  to={`/?tag=${encodeURIComponent(tag)}`}
                  className="flex items-center gap-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full px-3 py-1 text-xs font-medium hover:bg-violet-500/20 transition-colors"
                >
                  <Hash className="w-3 h-3" />
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* ACTION BAR */}
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

        {/* COMMENTS */}
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          {comments.length > 0 && (
            <div className="space-y-2.5 mb-3.5 max-h-56 overflow-y-auto pr-1">
              {(showAllComments ? comments : comments.slice(0, 2)).map((c) => (
                <div key={c._id} className="flex gap-2.5 items-start">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">
                    {c.author?.name?.[0]?.toUpperCase() ||
                      c.author?.username?.[0]?.toUpperCase() ||
                      'U'}
                  </div>

                  <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/user/${c.author?._id}`}
                          className="font-semibold text-xs text-white hover:text-indigo-400 transition-colors"
                        >
                          {c.author?.name || c.author?.username || 'User'}
                        </Link>
                        <span className="text-[10px] text-slate-500">
                          {timeAgo(c.createdAt)}
                        </span>
                      </div>

                      {currentUserId &&
                        String(c.author?._id) === String(currentUserId) && (
                          <button
                            onClick={() => deleteComment(c._id)}
                            className="text-[10px] text-slate-500 hover:text-red-400 transition-colors"
                          >
                            delete
                          </button>
                        )}
                    </div>

                    <p className="text-xs text-slate-300 mt-1 leading-snug">
                      {renderMentions(c.text, c.mentions)}
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

          {/* Comment input with current user avatar initial */}
          <div className="flex items-center gap-2.5 mt-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {currentUser?.name?.[0]?.toUpperCase() ||
                currentUser?.username?.[0]?.toUpperCase() ||
                'U'}
            </div>

            <div className="flex-1">
              <MentionInput
                value={text}
                onChange={setText}
                onMentionsChange={setCommentMentions}
                placeholder="Share your perspective... use @ to mention"
                rows={1}
              />
            </div>

            <button
              onClick={addComment}
              disabled={!text.trim() || submittingComment}
              className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-violet-500/20"
              aria-label="Post comment"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </article>

      {/* Lightbox */}
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

export default BlogCard;