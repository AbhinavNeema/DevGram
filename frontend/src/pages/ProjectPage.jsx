import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";

const ProjectPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    api.get(`/projects/${id}`).then(res => setProject(res.data));
  }, [id]);

  if (!project) return null;
  return <ProjectCard project={project} />;
};

export default ProjectPage;