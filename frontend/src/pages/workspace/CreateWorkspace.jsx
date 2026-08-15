import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { Rocket, Info, ArrowLeft, Loader2, Sparkles } from "lucide-react";

const CreateWorkspace = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Workspace name is required";
    } else if (name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    } else if (name.length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }
    if (description.length > 200) {
      newErrors.description = "Description must be less than 200 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await api.post("/workspaces", {
        name: name.trim(),
        description: description.trim(),
      });
      toast.success("Workspace created successfully!");
      navigate(`/workspaces/${res.data._id}`);
    } catch (err) {
      console.error("Create workspace failed:", err);
      const message = err.response?.data?.message || "Failed to create workspace";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-card border border-border rounded-3xl p-10 shadow-xl"
      >
        {/* Header */}
        <div className="mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg">
            <Rocket className="w-7 h-7 text-primary-foreground" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create Workspace
          </h1>
          <p className="text-muted-foreground">
            Set up a collaborative workspace for your team.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Workspace Name <span className="text-destructive">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: null });
              }}
              className={`w-full border rounded-xl px-4 py-3 bg-background text-foreground transition focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
                  : "border-border focus:ring-primary/20 focus:border-primary"
              }`}
              placeholder="Alpha Design Lab"
              maxLength={50}
            />
            {errors.name && (
              <p className="text-destructive text-xs mt-1">{errors.name}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {name.length}/50
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-primary" />
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: null });
              }}
              rows={4}
              maxLength={200}
              className={`w-full border rounded-xl px-4 py-3 bg-background text-foreground transition focus:outline-none focus:ring-2 ${
                errors.description
                  ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
                  : "border-border focus:ring-primary/20 focus:border-primary"
              }`}
              placeholder="Describe the purpose of this workspace"
            />
            {errors.description && (
              <p className="text-destructive text-xs mt-1">{errors.description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {description.length}/200
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground px-6 py-3 rounded-xl font-semibold transition shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Create Workspace
                <Rocket className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateWorkspace;