import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import BlogCard from "../components/BlogCard";
import { Loader2, FileText } from "lucide-react";

const SingleBlog = () => {
  const { id } = useParams();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/blogs/${id}`);
        setBlog(res.data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-sm text-slate-500">Loading blog...</span>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="text-center py-32">
        <FileText className="mx-auto w-10 h-10 text-slate-400 mb-4" />
        <h2 className="text-lg font-semibold text-slate-700">
          Blog not found
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          The blog may have been deleted or does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-in fade-in duration-500">
      <BlogCard blog={blog} />
    </div>
  );
};

export default SingleBlog;