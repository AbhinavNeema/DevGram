import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProjectCard from '../components/ProjectCard';
import { Flame, Loader2, TrendingUp, Trophy, Sparkles, Award } from 'lucide-react';

const Trending = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const res = await api.get('/projects/trending');
        setProjects(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Trending fetch failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const getRankBadge = (index) => {
    if (index === 0) {
      return {
        icon: '🥇',
        label: '1st',
        gradient: 'from-amber-400 to-yellow-600 text-black shadow-amber-500/30',
        ring: 'ring-amber-400/40',
      };
    }
    if (index === 1) {
      return {
        icon: '🥈',
        label: '2nd',
        gradient: 'from-slate-200 to-slate-400 text-black shadow-slate-300/30',
        ring: 'ring-slate-300/40',
      };
    }
    if (index === 2) {
      return {
        icon: '🥉',
        label: '3rd',
        gradient: 'from-amber-700 to-orange-800 text-white shadow-orange-600/30',
        ring: 'ring-orange-500/40',
      };
    }
    return {
      icon: null,
      label: `#${index + 1}`,
      gradient: 'from-white/[0.08] to-white/[0.04] text-slate-300',
      ring: 'ring-white/[0.08]',
    };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
            <Flame className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Trending Projects</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Top developer builds ranked by engagement, views, and peer discussions
            </p>
          </div>
        </div>

        {/* Live status badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Live Leaderboard</span>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-9 h-9 animate-spin text-amber-400 mb-3" />
          <span className="text-slate-400 text-sm font-medium">
            Crunching leaderboard statistics...
          </span>
        </div>
      )}

      {/* EMPTY */}
      {!loading && projects.length === 0 && (
        <div className="text-center py-20 px-6 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl">
          <Trophy className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Trending Projects Yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Check back soon as developers share and upvote builds across the network.
          </p>
        </div>
      )}

      {/* LEADERBOARD LIST */}
      {!loading && projects.length > 0 && (
        <div className="space-y-8">
          {projects.map((project, index) => {
            const rank = getRankBadge(index);
            return (
              <div
                key={project._id}
                className="relative animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* RANK BADGE */}
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r ${rank.gradient} text-xs font-extrabold shadow-md ring-1 ${rank.ring}`}
                  >
                    {rank.icon && <span>{rank.icon}</span>}
                    <span>{rank.label}</span>
                    {index < 3 && <span className="uppercase tracking-wider text-[10px] ml-1">Place</span>}
                  </div>
                </div>

                {/* PROJECT CARD */}
                <ProjectCard project={project} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Trending;