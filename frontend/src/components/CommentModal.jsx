import axios from "axios";

const CommentModal = ({ project, comments, setComments, onClose, userId }) => {
  const token = localStorage.getItem("token");

  const deleteComment = async (commentId) => {
    await axios.delete(
      `http://localhost:5001/api/projects/${project._id}/comments/${commentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setComments(comments.filter(c => c._id !== commentId));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-lg rounded-xl p-5 z-10">
        <h3 className="text-lg font-semibold mb-4">
          Comments ({comments.length})
        </h3>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {comments.map(c => (
            <div key={c._id} className="flex justify-between text-sm">
              <div>
                <span className="font-medium">{c.author?.name}</span>
                <span className="text-[#666]"> — {c.text}</span>
              </div>

              {String(c.author?._id) === String(userId) && (
                <button
                  onClick={() => deleteComment(c._id)}
                  className="text-xs text-red-500"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-sm text-[#0a66c2] hover:underline"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CommentModal;