import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { PROJECTS_DATA } from '../../data/portfolioData';
import { ProjectData } from '../../types';
import {
  Search,
  ExternalLink,
  Github,
  Star,
  Sparkles,
  Filter,
  X,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  LayoutGrid,
  List,
  Check,
  FolderGit2,
  Layers,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';

const STORAGE_KEY = 'win11_custom_projects';

export const ProjectsApp: React.FC = () => {
  const { openApp, addNotification } = useOS();
  const [projects, setProjects] = useState<ProjectData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return PROJECTS_DATA;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProject, setActiveProject] = useState<ProjectData | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Management Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formCategory, setFormCategory] = useState<ProjectData['category']>('Full Stack');
  const [formTechInput, setFormTechInput] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFeaturesInput, setFormFeaturesInput] = useState('');
  const [formGithubUrl, setFormGithubUrl] = useState('');
  const [formLiveUrl, setFormLiveUrl] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStars, setFormStars] = useState<number>(45);

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch {
      // Ignore
    }
  }, [projects]);

  const categories: ('All' | ProjectData['category'])[] = ['All', 'Full Stack', 'AI / ML', 'Frontend', 'Open Source', 'Mobile'];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies.some((tech) => tech.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormTitle('');
    setFormTagline('');
    setFormCategory('Full Stack');
    setFormTechInput('');
    setFormDescription('');
    setFormFeaturesInput('');
    setFormGithubUrl('');
    setFormLiveUrl('');
    setFormImageUrl('');
    setFormStars(50);
    setEditingProjectId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setFormImageUrl('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (project: ProjectData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setFormTitle(project.title);
    setFormTagline(project.tagline);
    setFormCategory(project.category);
    setFormTechInput(project.technologies.join(', '));
    setFormDescription(project.description);
    setFormFeaturesInput(project.features.join('\n'));
    setFormGithubUrl(project.githubUrl || '');
    setFormLiveUrl(project.liveUrl || '');
    setFormImageUrl(project.image || '');
    setFormStars(project.stars || 0);
    setIsAddModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const technologies = formTechInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const features = formFeaturesInput
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const fallbackImage =
      formImageUrl.trim() ||
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80';

    if (editingProjectId) {
      // Edit existing
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProjectId
            ? {
                ...p,
                title: formTitle.trim(),
                tagline: formTagline.trim(),
                category: formCategory,
                technologies: technologies.length > 0 ? technologies : ['TypeScript', 'React'],
                description: formDescription.trim(),
                features: features.length > 0 ? features : ['High performance architecture'],
                githubUrl: formGithubUrl.trim() || 'https://github.com',
                liveUrl: formLiveUrl.trim() || undefined,
                image: fallbackImage,
                stars: formStars,
                featured: p.featured ?? true,
              }
            : p
        )
      );

      addNotification({
        title: 'Project Updated',
        message: `Successfully updated "${formTitle}".`,
        type: 'success',
      });
    } else {
      // Add new
      const newProj: ProjectData = {
        id: `project-${Date.now()}`,
        title: formTitle.trim(),
        tagline: formTagline.trim() || 'Modern scalable software architecture',
        category: formCategory,
        technologies: technologies.length > 0 ? technologies : ['TypeScript', 'React', 'Node.js'],
        description: formDescription.trim() || 'Engineered with clean architectural patterns.',
        features: features.length > 0 ? features : ['Scalable microservices', 'High-throughput caching', 'Responsive design'],
        githubUrl: formGithubUrl.trim() || 'https://github.com',
        liveUrl: formLiveUrl.trim() || undefined,
        image: fallbackImage,
        stars: formStars,
        featured: true,
      };

      setProjects((prev) => [newProj, ...prev]);

      addNotification({
        title: 'Project Added',
        message: `Created new project "${formTitle}".`,
        type: 'success',
      });
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleDeleteProject = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProject?.id === id) {
      setActiveProject(null);
    }
    setDeleteConfirmId(null);
    addNotification({
      title: 'Project Deleted',
      message: `Deleted "${title}" from portfolio.`,
      type: 'warning',
    });
  };

  const handleRestoreDefaults = () => {
    setProjects(PROJECTS_DATA);
    localStorage.removeItem(STORAGE_KEY);
    addNotification({
      title: 'Portfolio Reset',
      message: 'Projects restored to default verified showcase.',
      type: 'info',
    });
  };

  return (
    <div className="h-full w-full overflow-y-auto p-4 sm:p-6 pb-20 max-w-6xl mx-auto space-y-6 select-text">
      {/* Top Banner & Management Toolbar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-lg">
            <FolderGit2 className="w-6 h-6 text-cyan-300" />
            <span>Portfolio Project Management</span>
          </div>
          <p className="text-xs text-blue-100 max-w-xl">
            Explore live production builds, inspect repositories, or interactively add, edit, and organize projects.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={handleRestoreDefaults}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
            title="Restore original project showcase"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Search, Filter & View Mode Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects or technologies..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* Category Pills & View Switcher */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 w-full md:w-auto">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10">
            <button
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400'
              }`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400'
              }`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display (Grid or List) */}
      {filteredProjects.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 mx-auto flex items-center justify-center">
            <FolderGit2 className="w-8 h-8 text-slate-400" />
          </div>
          <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No projects found</p>
          <p className="text-xs text-slate-500">Try changing your search keywords or category filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-200 cursor-pointer"
              onClick={() => setActiveProject(project)}
            >
              {/* Image Banner */}
              <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={project.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80'}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> {project.category}
                </div>

                {/* Edit & Delete Action Buttons on Hover */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleOpenEditModal(project, e)}
                    className="p-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md hover:bg-blue-600 text-white transition-colors cursor-pointer"
                    title="Edit Project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(project.id);
                    }}
                    className="p-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md hover:bg-red-600 text-white transition-colors cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors truncate">
                      {project.title}
                    </h3>
                    {project.stars && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400" /> {project.stars}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {project.tagline}
                  </p>
                </div>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 4 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">
                      +{project.technologies.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-blue-500/50 shadow-sm cursor-pointer transition-all"
              onClick={() => setActiveProject(project)}
            >
              <div className="flex items-center gap-4">
                <img
                  src={project.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80'}
                  alt={project.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{project.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-semibold">
                      {project.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{project.tagline}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 5).map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={(e) => handleOpenEditModal(project, e)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmId(project.id);
                  }}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-[2100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-500">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Delete Project?</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to remove this project from your portfolio showcase? You can restore default projects anytime.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white cursor-pointer"
                onClick={(e) => {
                  const target = projects.find((p) => p.id === deleteConfirmId);
                  if (target) {
                    handleDeleteProject(target.id, target.title, e);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-[2050] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
                <FolderGit2 className="w-5 h-5 text-blue-500" />
                <span>{editingProjectId ? 'Edit Portfolio Project' : 'Create New Project'}</span>
              </div>
              <button
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. AI Workflow Orchestrator"
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProjectData['category'])}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Full Stack">Full Stack</option>
                    <option value="AI / ML">AI / ML</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Open Source">Open Source</option>
                    <option value="Mobile">Mobile</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tagline / Subtitle</label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="Short, punchy summary of what the project does"
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Technologies / Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formTechInput}
                  onChange={(e) => setFormTechInput(e.target.value)}
                  placeholder="TypeScript, React, Tailwind CSS, Node.js, PostgreSQL"
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="In-depth explanation of problem statement, architecture, performance, and outcomes..."
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Key Features (one per line)
                </label>
                <textarea
                  rows={3}
                  value={formFeaturesInput}
                  onChange={(e) => setFormFeaturesInput(e.target.value)}
                  placeholder="Real-time multi-agent execution pipeline&#10;Sub-millisecond Redis caching&#10;Containerized microservices"
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={formGithubUrl}
                    onChange={(e) => setFormGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={formLiveUrl}
                    onChange={(e) => setFormLiveUrl(e.target.value)}
                    placeholder="https://demo.example.com"
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Stars Count</label>
                  <input
                    type="number"
                    value={formStars}
                    onChange={(e) => setFormStars(Number(e.target.value))}
                    min={0}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer"
                >
                  {editingProjectId ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Detail Viewer Modal */}
      {activeProject && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveProject(null)}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-5 sm:p-7 space-y-5 select-text"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer flex items-center justify-center"
              onClick={() => setActiveProject(null)}
            >
              <X className="w-4 h-4" />
            </button>

            <img
              src={activeProject.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80'}
              alt={activeProject.title}
              className="w-full h-48 sm:h-60 rounded-2xl object-cover shadow-md"
              referrerPolicy="no-referrer"
            />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500">
                  {activeProject.category}
                </span>
                {activeProject.stars && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" /> {activeProject.stars} stars
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {activeProject.title}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">{activeProject.tagline}</p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeProject.description}
            </p>

            {/* Key Features */}
            {activeProject.features && activeProject.features.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">Key Features</h4>
                <ul className="space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                  {activeProject.features.map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tech Stack */}
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">Tech Stack</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeProject.technologies.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Action Links */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {activeProject.githubUrl && (
                <a
                  href={activeProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  <Github className="w-4 h-4" /> GitHub Repository
                </a>
              )}

              {activeProject.liveUrl && (
                <button
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                  onClick={() => {
                    openApp('browser', { initialUrl: activeProject.liveUrl });
                    setActiveProject(null);
                  }}
                >
                  <ExternalLink className="w-4 h-4" /> Open Live Demo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
