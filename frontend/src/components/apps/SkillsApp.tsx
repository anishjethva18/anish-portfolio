import React, { useState, useEffect } from 'react';
import { SKILL_CATEGORIES } from '../../data/portfolioData';
import { AppIcon } from '../common/AppIcon';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Save,
  Check,
  X,
  TrendingUp,
} from 'lucide-react';
import { useOS } from '../../context/OSContext';

const SKILLS_STORAGE_KEY = 'win11_custom_skills_matrix';

interface SkillItem {
  name: string;
  level: number;
  icon?: string;
  description?: string;
}

interface SkillCategory {
  title: string;
  icon: string;
  skills: SkillItem[];
}

export const SkillsApp: React.FC = () => {
  const { addNotification } = useOS();

  // Load from local storage or defaults
  const [categories, setCategories] = useState<SkillCategory[]>(() => {
    try {
      const saved = localStorage.getItem(SKILLS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return SKILL_CATEGORIES;
  });

  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [isAdjustMode, setIsAdjustMode] = useState<boolean>(false);

  // New Skill Modal
  const [isAddSkillModal, setIsAddSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(90);
  const [newSkillDesc, setNewSkillDesc] = useState('');

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(categories));
    } catch {
      // Ignore
    }
  }, [categories]);

  const handleUpdateSkillLevel = (skillName: string, newLevel: number) => {
    setCategories((prev) =>
      prev.map((cat, idx) =>
        idx === activeCategory
          ? {
              ...cat,
              skills: cat.skills.map((s) =>
                s.name === skillName ? { ...s, level: Math.max(0, Math.min(100, newLevel)) } : s
              ),
            }
          : cat
      )
    );
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setCategories((prev) =>
      prev.map((cat, idx) =>
        idx === activeCategory
          ? {
              ...cat,
              skills: [
                ...cat.skills,
                {
                  name: newSkillName.trim(),
                  level: newSkillLevel,
                  description: newSkillDesc.trim() || 'Applied in production microservices and full-stack systems.',
                },
              ],
            }
          : cat
      )
    );

    addNotification({
      title: 'Skill Added',
      message: `Added "${newSkillName}" (${newSkillLevel}%) to ${categories[activeCategory].title}.`,
      type: 'success',
    });

    setNewSkillName('');
    setNewSkillLevel(90);
    setNewSkillDesc('');
    setIsAddSkillModal(false);
  };

  const handleDeleteSkill = (skillName: string) => {
    setCategories((prev) =>
      prev.map((cat, idx) =>
        idx === activeCategory
          ? {
              ...cat,
              skills: cat.skills.filter((s) => s.name !== skillName),
            }
          : cat
      )
    );

    addNotification({
      title: 'Skill Removed',
      message: `Removed "${skillName}" from matrix.`,
      type: 'warning',
    });
  };

  const handleResetDefaults = () => {
    setCategories(SKILL_CATEGORIES);
    localStorage.removeItem(SKILLS_STORAGE_KEY);
    addNotification({
      title: 'Skills Reset',
      message: 'Skills matrix restored to default engineering profile.',
      type: 'info',
    });
  };

  const currentCategory = categories[activeCategory] || categories[0];

  return (
    <div className="h-full w-full overflow-y-auto p-3.5 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-5 select-text">
      {/* Top Banner with Interactive Adjust Mode Controls */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-base sm:text-lg md:text-xl font-extrabold flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-200" />
            <span>Technical Skills & Proficiency Matrix</span>
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 max-w-xl leading-relaxed">
            Proficiency scores across full-stack development, AI engineering, and cloud systems. Click "Adjust Skills" to customize proficiency levels or add technologies.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={handleResetDefaults}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-colors"
            title="Reset to default skills"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={() => setIsAdjustMode(!isAdjustMode)}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
              isAdjustMode
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{isAdjustMode ? 'Exit Adjust Mode' : 'Adjust Skills'}</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat, index) => (
          <button
            key={cat.title}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === index
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            onClick={() => setActiveCategory(index)}
          >
            <AppIcon name={cat.icon} className="w-4 h-4" />
            <span>{cat.title}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white/90">
              {cat.skills.length}
            </span>
          </button>
        ))}
      </div>

      {/* Skills Matrix Display & Adjust Section */}
      <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              {currentCategory.title} Proficiency
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAdjustMode
                ? 'Drag slider or enter values to adjust mastery percentage.'
                : 'Verified engineering competency benchmarks.'}
            </p>
          </div>

          {isAdjustMode && (
            <button
              onClick={() => setIsAddSkillModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          )}
        </div>

        {/* Skills List with Live Adjust Sliders */}
        <div className="space-y-5">
          {currentCategory.skills.map((skill) => (
            <div
              key={skill.name}
              className={`space-y-2 p-3 rounded-xl transition-colors ${
                isAdjustMode ? 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5' : ''
              }`}
            >
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{skill.name}</span>
                </span>

                <div className="flex items-center gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-mono font-bold text-sm">
                    {skill.level}%
                  </span>

                  {isAdjustMode && (
                    <button
                      onClick={() => handleDeleteSkill(skill.name)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                      title="Delete skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar or Range Slider depending on mode */}
              {isAdjustMode ? (
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skill.level}
                    onChange={(e) => handleUpdateSkillLevel(skill.name, Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={skill.level}
                    onChange={(e) => handleUpdateSkillLevel(skill.name, Number(e.target.value))}
                    className="w-16 p-1 text-center rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-xs font-mono font-bold text-blue-600 dark:text-blue-400"
                  />
                </div>
              ) : (
                <div
                  className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer"
                  onClick={() => setIsAdjustMode(true)}
                  title="Click to adjust"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 transition-all duration-300 shadow-sm"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              )}

              {skill.description && (
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 pl-6 leading-relaxed">
                  {skill.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add New Skill Modal */}
      {isAddSkillModal && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsAddSkillModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-4 select-text"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                <span>Add Skill to {currentCategory.title}</span>
              </h3>
              <button
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                onClick={() => setIsAddSkillModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Technology / Skill Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Next.js, Kubernetes, PyTorch..."
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Proficiency Level</label>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {newSkillLevel}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Engineering Context / Description
                </label>
                <textarea
                  rows={3}
                  value={newSkillDesc}
                  onChange={(e) => setNewSkillDesc(e.target.value)}
                  placeholder="e.g. Used for building scalable server-side rendered architectures..."
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  onClick={() => setIsAddSkillModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Add to Matrix
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
