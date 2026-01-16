import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import BlogCard from "../components/BlogCard";

const SingleBlog = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    api.get(`/blogs/${id}`).then(res => {
      setBlog(res.data);
    });
  }, [id]);

  if (!blog) {
    return <div className="text-center mt-10">Loading…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 mt-6">
      <BlogCard blog={blog} />
    </div>
  );
};

export default SingleBlog;