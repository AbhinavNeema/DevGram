import api from "../api/axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";
import { renderMentions } from "../utils/renderMentions.jsx";
import MentionInput from "../components/MentionInput";

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = JSON.parse(atob(token.split(".")[1])).id;

  const isOwner =
    project.owner?._id === userId || project.owner === userId;

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
  const res = await api.put(`/projects/${project._id}/like`);
  setLiked(res.data.liked);
  setLikesCount(res.data.likesCount);
};

  const addComment = async () => {
  if (!text.trim()) return;

  const res = await api.post(`/projects/${project._id}/comments`, {
    text,
    mentions: commentMentions.map(u => u._id)
  });

  setComments([...comments, res.data]);
  setText("");
  setCommentMentions([]);
};

  const deleteComment = async (commentId) => {
  await api.delete(`/projects/${project._id}/comments/${commentId}`);
  setComments(comments.filter(c => c._id !== commentId));
};

  const deleteProject = async () => {
  if (!window.confirm("Delete this project?")) return;
  await api.delete(`/projects/${project._id}`);
  window.location.reload();
};

  return (
    <div className="bg-white border rounded-lg mb-5">
      <div className="flex gap-3 px-4 pt-4">
        <div className="w-10 h-10 rounded-full bg-[#e7f3ff] flex items-center justify-center font-semibold text-[#0a66c2]">
          {project.owner?.name?.[0] || "U"}
        </div>

        <div className="flex-1">
          <Link
            to={`/user/${project.owner?._id}`}
            className="text-sm font-semibold hover:underline"
          >
            {project.owner?.name}
          </Link>
          <p className="text-xs text-gray-500">
            Posted · {timeAgo(project.createdAt)}
          </p>
        </div>

        {isOwner && (
          <div className="text-xs flex gap-3">
            <button onClick={() => navigate(`/projects/${project._id}/edit`)}>
              Edit
            </button>
            <button onClick={deleteProject} className="text-red-500">
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="px-4 mt-3">
        <h3 className="font-semibold">{project.title}</h3>

        <p className="text-sm text-gray-700 mt-1">
          {expanded || description.length <= 180
            ? renderMentions(description, project.mentions)
            : renderMentions(description.slice(0, 180) + "...", project.mentions)}

          {description.length > 180 && (
            <button
              onClick={() => {
                setExpanded(!expanded);
                addView();
              }}
              className="ml-1 text-blue-600 font-medium"
            >
              {expanded ? "Read less" : "Read more"}
            </button>
          )}
        </p>
      </div>

      {project.images?.length > 0 && (
        <div className="px-4 mt-3 grid grid-cols-2 gap-2">
          {project.images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              className="h-48 w-full object-cover rounded cursor-pointer"
              onClick={() => {
                addView();
                setActiveImage(img.url);
              }}
            />
          ))}
        </div>
      )}

      <div className="px-4 mt-3 flex gap-2 flex-wrap">
        {(project.techStack || []).map(tag => (
          <Link
            key={tag}
            to={`/?tag=${encodeURIComponent(tag)}`}
            className="text-xs text-blue-600 hover:underline"
          >
            #{tag}
          </Link>
        ))}
      </div>

      <div className="px-4 mt-4 flex gap-6 text-sm text-gray-600">
        <button onClick={handleLike}>❤️ {likesCount}</button>
        <span>💬 {comments.length}</span>
        <span>👀 {views}</span>
      </div>

      <div className="border-t px-4 py-3 text-sm">
        {!showAllComments && comments.length > 0 && (
          <>
            <div>
              <b>{comments[0].author?.name}</b>{" "}
              {renderMentions(comments[0].text, comments[0].mentions)}
            </div>
            {comments.length > 1 && (
              <button
                onClick={() => setShowAllComments(true)}
                className="text-xs text-blue-600"
              >
                View all {comments.length} comments
              </button>
            )}
          </>
        )}

        {showAllComments &&
          comments.map(c => (
            <div key={c._id} className="flex justify-between">
              <span>
                <b>{c.author?.name}</b>{" "}
                {renderMentions(c.text, c.mentions)}
              </span>
              {String(c.author?._id) === String(userId) && (
                <button
                  onClick={() => deleteComment(c._id)}
                  className="text-red-500 text-xs"
                >
                  Delete
                </button>
              )}
            </div>
          ))}

        <div className="flex gap-2 mt-3">
          <MentionInput
            value={text}
            onChange={setText}
            onMentionsChange={setCommentMentions}
            placeholder="Add a comment… @username"
            rows={2}
          />
          <button onClick={addComment} className="text-blue-600 font-medium">
            Post
          </button>
        </div>
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center"
          onClick={() => setActiveImage(null)}
        >
          <img src={activeImage} className="max-w-[90%] max-h-[90%] rounded" />
        </div>
      )}
    </div>
  );
};

export default ProjectCard;