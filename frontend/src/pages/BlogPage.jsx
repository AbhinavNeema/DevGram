import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import BlogCard from '../components/BlogCard';
import { Loader2, ArrowLeft, FileQuestion } from 'lucide-react';

const BlogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get(`/blogs/${id}`);
        setBlog(res.data);
      } catch (err) {
        console.error('Failed to fetch blog', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-violet-400 mb-3" />
        <span className="text-slate-400 text-sm font-medium">Loading article...</span>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-slate-400 mx-auto mb-4">
            <FileQuestion className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Article Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">
            The article you are looking for may have been deleted or does not exist.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium rounded-xl px-5 py-2.5 text-sm transition-all shadow-lg shadow-indigo-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-3xl mx-auto px-4">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] text-xs font-semibold transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>
      </div>

      {/* Blog Card with showOwnerActions={true} */}
      <BlogCard
        blog={blog}
        showOwnerActions={true}
        onDelete={() => navigate('/')}
      />
    </div>
  );
};

export default BlogPage;