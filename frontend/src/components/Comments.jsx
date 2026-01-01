import { useEffect, useState } from "react";
import api from "../api/axios";

const Comments = ({ projectId }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const fetchComments = async () => {
    const res = await api.get(`/projects/${projectId}/comments`);
    setComments(res.data);
  };

  const addComment = async () => {
    if (!text.trim()) return;
    await api.post(`/projects/${projectId}/comments`, { text });
    setText("");
    fetchComments();
  };

  useEffect(() => {
    fetchComments();
  }, [projectId]);

  return (
    <div>
      <h5>Comments</h5>
      {comments.map(c => (
        <div key={c._id}>
          <b>{c.author.name}</b>: {c.text}
        </div>
      ))}

      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write a comment"
      />
      <button onClick={addComment}>Post</button>
    </div>
  );
};

export default Comments;
