import React, { useState, useRef, useMemo, useEffect } from 'react';
import { PORTFOLIO_USER, EXPERIENCES, EDUCATION, SKILL_CATEGORIES } from '../../data/portfolioData';
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
  Check,
  Loader2,
  Maximize2,
  Search,
  CheckCircle2,
  MapPin,
  Mail,
  Globe,
  Briefcase,
  GraduationCap,
  Sparkles,
  Edit3,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Phone,
  RefreshCw,
  Eye,
  Upload,
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { downloadElementAsPdf } from '../../utils/fileDownloader';

interface ResumeData {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  summary: string;
  experiences: Array<{
    role: string;
    company: string;
    period: string;
    description: string[];
  }>;
  skills: Array<{
    category: string;
    items: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    period: string;
  }>;
}

const DEFAULT_RESUME_DATA: ResumeData = {
  name: PORTFOLIO_USER.name,
  title: PORTFOLIO_USER.title,
  location: PORTFOLIO_USER.location,
  email: PORTFOLIO_USER.email,
  phone: '+91 98765 43210',
  website: PORTFOLIO_USER.website,
  summary: PORTFOLIO_USER.bio,
  experiences: EXPERIENCES.map((e) => ({
    role: e.role,
    company: e.company,
    period: e.period,
    description: e.description,
  })),
  skills: SKILL_CATEGORIES.map((cat) => ({
    category: cat.title,
    items: cat.skills.map((s) => s.name).join(', '),
  })),
  education: EDUCATION.map((edu) => ({
    degree: edu.degree,
    institution: edu.institution,
    period: edu.period,
  })),
};

export const ResumeViewerApp: React.FC = () => {
  const { addNotification } = useOS();
  const [zoom, setZoom] = useState(100);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [fitWidth, setFitWidth] = useState(false);

  // Resume Data State (Persisted in LocalStorage)
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem('win11_custom_resume');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return DEFAULT_RESUME_DATA;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ResumeData>(resumeData);

  // Uploaded Direct PDF State
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('win11_custom_resume_pdf');
    } catch {
      return null;
    }
  });
  const [uploadedPdfName, setUploadedPdfName] = useState<string>(() => {
    try {
      return localStorage.getItem('win11_custom_resume_pdf_name') || 'My_Resume.pdf';
    } catch {
      return 'My_Resume.pdf';
    }
  });
  const [viewSource, setViewSource] = useState<'template' | 'pdf'>(() => {
    try {
      return localStorage.getItem('win11_custom_resume_pdf') ? 'pdf' : 'template';
    } catch {
      return 'template';
    }
  });
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      addNotification({
        title: 'Invalid File',
        message: 'Please select a valid PDF file (.pdf).',
        type: 'warning',
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setUploadedPdfUrl(dataUrl);
        setUploadedPdfName(file.name);
        setViewSource('pdf');
        try {
          localStorage.setItem('win11_custom_resume_pdf', dataUrl);
          localStorage.setItem('win11_custom_resume_pdf_name', file.name);
        } catch {}
        addNotification({
          title: 'PDF CV Uploaded',
          message: `Loaded "${file.name}". You can preview or export it directly.`,
          type: 'success',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePdf = () => {
    setUploadedPdfUrl(null);
    setViewSource('template');
    try {
      localStorage.removeItem('win11_custom_resume_pdf');
      localStorage.removeItem('win11_custom_resume_pdf_name');
    } catch {}
    addNotification({
      title: 'Uploaded PDF Removed',
      message: 'Switched back to editable resume template.',
      type: 'info',
    });
  };

  // Search & Find in Resume State
  const [searchQuery, setSearchQuery] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Sync edit form with current resume data when opening edit modal
  useEffect(() => {
    if (isEditing) {
      setEditForm(resumeData);
    }
  }, [isEditing, resumeData]);

  // Compute text matches for Search / Find
  useEffect(() => {
    if (!searchQuery.trim() || !resumeRef.current) {
      setMatchCount(0);
      setCurrentMatchIndex(0);
      return;
    }
    const fullText = resumeRef.current.innerText.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    let count = 0;
    let pos = fullText.indexOf(query);
    while (pos !== -1) {
      count++;
      pos = fullText.indexOf(query, pos + query.length);
    }
    setMatchCount(count);
    setCurrentMatchIndex(count > 0 ? 1 : 0);
  }, [searchQuery, resumeData]);

  const handleNextMatch = () => {
    if (matchCount <= 0) return;
    setCurrentMatchIndex((prev) => (prev >= matchCount ? 1 : prev + 1));
  };

  const handlePrevMatch = () => {
    if (matchCount <= 0) return;
    setCurrentMatchIndex((prev) => (prev <= 1 ? matchCount : prev - 1));
  };

  const handleSaveResume = () => {
    setResumeData(editForm);
    try {
      localStorage.setItem('win11_custom_resume', JSON.stringify(editForm));
    } catch {}
    setIsEditing(false);
    addNotification({
      title: 'Resume CV Updated',
      message: 'Your CV details have been saved and updated successfully.',
      type: 'success',
    });
  };

  const handleResetResume = () => {
    setResumeData(DEFAULT_RESUME_DATA);
    setEditForm(DEFAULT_RESUME_DATA);
    try {
      localStorage.removeItem('win11_custom_resume');
    } catch {}
    setIsEditing(false);
    addNotification({
      title: 'Resume Reset',
      message: 'Restored default resume content.',
      type: 'info',
    });
  };

  const handleDownload = async () => {
    if (viewSource === 'pdf' && uploadedPdfUrl) {
      const link = document.createElement('a');
      link.href = uploadedPdfUrl;
      link.download = uploadedPdfName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloaded(true);
      addNotification({
        title: 'Resume Downloaded',
        message: `Saved "${uploadedPdfName}" to your device.`,
        type: 'success',
      });
      setTimeout(() => setDownloaded(false), 3000);
      return;
    }

    if (!resumeRef.current || downloading) return;
    setDownloading(true);
    try {
      const filename = `${resumeData.name.replace(/\s+/g, '_')}_Resume_2026.pdf`;
      const success = await downloadElementAsPdf(resumeRef.current, filename);
      if (success) {
        setDownloaded(true);
        addNotification({
          title: 'Resume Downloaded',
          message: `Saved "${filename}" to your device.`,
          type: 'success',
        });
        setTimeout(() => setDownloaded(false), 3000);
      }
    } catch {
      addNotification({
        title: 'Download Failed',
        message: 'Could not generate PDF download.',
        type: 'error',
      });
    } finally {
      setDownloading(false);
    }
  };

  // Helper to highlight search terms safely inside rendered text
  const renderHighlighted = (text: string) => {
    if (!searchQuery.trim()) return text;
    const q = searchQuery.trim();
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <mark key={i} className="bg-yellow-300 text-slate-900 font-bold px-0.5 rounded-xs">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 select-text overflow-y-auto overflow-x-hidden font-sans">
      {/* Top PDF Toolbar - Non-sticky (scrolls naturally with document), responsive with no button overflow */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-2.5 sm:px-5 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 text-xs shadow-xs max-w-full">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-slate-900 dark:text-white tracking-tight text-xs sm:text-sm truncate block max-w-[140px] xs:max-w-[200px] sm:max-w-xs">
              {resumeData.name.replace(/\s+/g, '_')}_Resume.pdf
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-mono">
                1 / 1
              </span>
              <span>• A4 Document</span>
            </div>
          </div>
        </div>

        {/* Working Search / Find in Resume Bar */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-white/15 rounded-xl px-2 py-1 text-xs shadow-inner shrink max-w-full">
          <Search className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNextMatch();
            }}
            placeholder="Search..."
            className="w-16 xs:w-24 sm:w-36 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-xs"
          />
          {searchQuery && (
            <div className="flex items-center gap-0.5 pl-1 border-l border-slate-300 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400 font-mono shrink-0">
              <span className="text-cyan-600 dark:text-cyan-300 font-bold whitespace-nowrap text-[10px]">
                {matchCount > 0 ? `${currentMatchIndex}/${matchCount}` : '0'}
              </span>
              <button
                className="p-0.5 hover:text-slate-900 dark:hover:text-white rounded cursor-pointer text-slate-600 dark:text-slate-400"
                onClick={handlePrevMatch}
                title="Previous Match"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                className="p-0.5 hover:text-slate-900 dark:hover:text-white rounded cursor-pointer text-slate-600 dark:text-slate-400"
                onClick={handleNextMatch}
                title="Next Match"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              <button
                className="p-0.5 hover:text-rose-500 rounded cursor-pointer text-slate-600 dark:text-slate-400"
                onClick={() => setSearchQuery('')}
                title="Clear Search"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
            onClick={() => {
              setFitWidth(false);
              setZoom((z) => Math.max(40, z - 10));
            }}
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] sm:text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400 w-8 sm:w-9 text-center">
            {fitWidth ? 'Fit' : `${zoom}%`}
          </span>
          <button
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
            onClick={() => {
              setFitWidth(false);
              setZoom((z) => Math.min(180, z + 10));
            }}
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Reset Zoom & Fit button */}
          <button
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
            onClick={() => {
              setFitWidth(false);
              setZoom(100);
            }}
            title="Reset Zoom to 100%"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <button
            className={`p-1 rounded-lg cursor-pointer transition-colors ${
              fitWidth
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
            }`}
            onClick={() => setFitWidth(!fitWidth)}
            title="Toggle Fit to Width"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        {/* Hidden PDF Upload Input */}
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handlePdfUpload}
          className="hidden"
        />

        {/* Action Buttons: Responsive, Never Overflowing */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap max-w-full">
          {/* Direct PDF Upload Button */}
          <button
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer shadow-xs text-xs"
            onClick={() => pdfInputRef.current?.click()}
            title="Upload your direct PDF CV file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{uploadedPdfUrl ? 'Replace PDF' : 'Upload PDF'}</span>
            <span className="sm:hidden">Upload</span>
          </button>

          {uploadedPdfUrl && (
            <div className="flex items-center bg-slate-200 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-300 dark:border-white/10">
              <button
                onClick={() => setViewSource('pdf')}
                className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  viewSource === 'pdf' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                PDF
              </button>
              <button
                onClick={() => setViewSource('template')}
                className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  viewSource === 'template' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                Template
              </button>
              <button
                onClick={handleRemovePdf}
                className="p-0.5 text-slate-500 hover:text-rose-500 rounded cursor-pointer"
                title="Remove uploaded PDF"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {viewSource === 'template' && (
            <button
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-800 dark:text-cyan-300 font-semibold border border-cyan-500/30 cursor-pointer transition-colors shadow-xs text-xs"
              onClick={() => setIsEditing(true)}
              title="Edit and customize your CV details"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
              <span className="hidden sm:inline">Edit CV</span>
              <span className="sm:hidden">Edit</span>
            </button>
          )}

          <button
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-cyan-900/30 text-xs shrink-0"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : downloaded ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span className="hidden xs:inline">{downloading ? 'Exporting...' : downloaded ? 'Saved!' : 'Download PDF'}</span>
            <span className="xs:hidden">{downloading ? '...' : downloaded ? 'Saved' : 'PDF'}</span>
          </button>
        </div>
      </div>

      {/* PDF Document Canvas Viewport - Scrolls naturally with toolbar */}
      <div className={`flex-1 flex justify-center items-start bg-slate-200/90 dark:bg-[#060911] transition-all ${
        fitWidth ? 'p-2 sm:p-4' : 'p-3 sm:p-6 md:p-8'
      }`}>
        {viewSource === 'pdf' && uploadedPdfUrl ? (
          <div className="w-full max-w-5xl h-full flex flex-col items-center justify-start space-y-3">
            <div className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-900/90 rounded-xl border border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white truncate max-w-md">{uploadedPdfName}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">Uploaded Direct PDF</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => pdfInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium cursor-pointer transition-colors"
                >
                  Upload New
                </button>
                <button
                  onClick={handleRemovePdf}
                  className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium cursor-pointer transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="w-full flex-1 min-h-[650px] bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
              <object
                data={uploadedPdfUrl}
                type="application/pdf"
                className="w-full h-full min-h-[650px]"
              >
                <iframe
                  src={uploadedPdfUrl}
                  title={uploadedPdfName}
                  className="w-full h-full min-h-[650px] border-0 bg-white"
                />
              </object>
            </div>
          </div>
        ) : (
          <div
            ref={resumeRef}
            className={`bg-white text-slate-900 shadow-2xl p-6 sm:p-10 rounded-sm border border-slate-300 space-y-6 transition-all duration-150 ${
              fitWidth ? 'w-full max-w-full' : 'w-full max-w-3xl'
            }`}
            style={{
              zoom: fitWidth ? '1' : `${zoom}%`,
            }}
          >
          {/* Header Section */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {renderHighlighted(resumeData.name)}
              </h1>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wide">
                {renderHighlighted(resumeData.title)}
              </p>
            </div>
            <div className="flex flex-col sm:items-end text-xs text-slate-600 space-y-1 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{renderHighlighted(resumeData.location)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-blue-600">{renderHighlighted(resumeData.email)}</span>
              </div>
              {resumeData.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{renderHighlighted(resumeData.phone)}</span>
                </div>
              )}
              {resumeData.website && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-700">{renderHighlighted(resumeData.website)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Professional Summary
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
              {renderHighlighted(resumeData.summary)}
            </p>
          </div>

          {/* Work Experience */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              Work Experience
            </h2>
            <div className="space-y-4">
              {resumeData.experiences.map((exp, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline text-xs font-bold">
                    <span className="text-slate-900">
                      {renderHighlighted(exp.role)} — <span className="text-blue-600">{renderHighlighted(exp.company)}</span>
                    </span>
                    <span className="text-slate-500 font-normal text-[11px]">{renderHighlighted(exp.period)}</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pl-1">
                    {exp.description.map((d, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {renderHighlighted(d)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Expertise Matrix */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Technical Expertise
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {resumeData.skills.map((cat, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-0.5">
                  <p className="font-bold text-slate-900">{renderHighlighted(cat.category)}:</p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {renderHighlighted(cat.items)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              Education
            </h2>
            {resumeData.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-baseline text-xs font-semibold">
                <div>
                  <p className="text-slate-900 font-bold">{renderHighlighted(edu.degree)}</p>
                  <p className="text-slate-600 font-normal text-[11px]">{renderHighlighted(edu.institution)}</p>
                </div>
                <span className="text-slate-500 font-normal text-[11px]">{renderHighlighted(edu.period)}</span>
              </div>
            ))}
          </div>

          {/* Key Portfolio Highlights */}
          <div className="pt-2 border-t border-slate-200 text-center text-[10px] text-slate-500">
            <span>Portfolio Web OS Edition • Verified Online Resume • Contact: {resumeData.email}</span>
          </div>
        </div>
        )}
      </div>

      {/* Edit Resume Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/15 shadow-2xl text-xs overflow-hidden text-slate-900 dark:text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Customize & Update Resume CV</h2>
              </div>
              <button
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                onClick={() => setIsEditing(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Personal Info */}
              <div className="space-y-3">
                <h3 className="font-bold text-cyan-600 dark:text-cyan-400 text-xs tracking-wider uppercase">1. Personal & Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Professional Title</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Location / City</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Portfolio Website</label>
                    <input
                      type="text"
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <h3 className="font-bold text-cyan-600 dark:text-cyan-400 text-xs tracking-wider uppercase">2. Professional Summary</h3>
                <textarea
                  rows={3}
                  value={editForm.summary}
                  onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Work Experience */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-cyan-400 text-xs tracking-wider uppercase">3. Work Experience</h3>
                  <button
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    onClick={() => {
                      setEditForm({
                        ...editForm,
                        experiences: [
                          ...editForm.experiences,
                          {
                            role: 'Software Engineer',
                            company: 'Tech Corp',
                            period: '2024 - Present',
                            description: ['Built scalable microservices and cloud architectures.'],
                          },
                        ],
                      });
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Experience
                  </button>
                </div>

                {editForm.experiences.map((exp, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-800/70 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="Role / Title"
                          value={exp.role}
                          onChange={(e) => {
                            const newExp = [...editForm.experiences];
                            newExp[idx].role = e.target.value;
                            setEditForm({ ...editForm, experiences: newExp });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Company"
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...editForm.experiences];
                            newExp[idx].company = e.target.value;
                            setEditForm({ ...editForm, experiences: newExp });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Period (e.g. 2024 - Present)"
                          value={exp.period}
                          onChange={(e) => {
                            const newExp = [...editForm.experiences];
                            newExp[idx].period = e.target.value;
                            setEditForm({ ...editForm, experiences: newExp });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white"
                        />
                      </div>
                      <button
                        className="p-1.5 text-red-400 hover:text-red-300 rounded cursor-pointer"
                        onClick={() => {
                          setEditForm({
                            ...editForm,
                            experiences: editForm.experiences.filter((_, i) => i !== idx),
                          });
                        }}
                        title="Delete Experience"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Bullet points (one per line)"
                      value={exp.description.join('\n')}
                      onChange={(e) => {
                        const newExp = [...editForm.experiences];
                        newExp[idx].description = e.target.value.split('\n');
                        setEditForm({ ...editForm, experiences: newExp });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-[11px]"
                    />
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <h3 className="font-bold text-cyan-400 text-xs tracking-wider uppercase">4. Technical Skills</h3>
                <div className="space-y-2">
                  {editForm.skills.map((skill, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                      <input
                        type="text"
                        value={skill.category}
                        onChange={(e) => {
                          const newSkills = [...editForm.skills];
                          newSkills[idx].category = e.target.value;
                          setEditForm({ ...editForm, skills: newSkills });
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white font-bold"
                      />
                      <input
                        type="text"
                        value={skill.items}
                        onChange={(e) => {
                          const newSkills = [...editForm.skills];
                          newSkills[idx].items = e.target.value;
                          setEditForm({ ...editForm, skills: newSkills });
                        }}
                        className="sm:col-span-2 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/10 bg-slate-900/90">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold cursor-pointer"
                onClick={handleResetResume}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset to Default
              </button>

              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold cursor-pointer"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer transition-all shadow-md shadow-cyan-500/20"
                  onClick={handleSaveResume}
                >
                  Save & Update CV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
