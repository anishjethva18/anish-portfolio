import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { PORTFOLIO_USER } from '../../data/portfolioData';
import { ContactSubmissionResponse } from '../../types';
import {
  Send,
  Mail,
  CheckCircle2,
  Paperclip,
  Github,
  Linkedin,
  Instagram,
  AlertCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  Server,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Inbox,
  Info,
  File,
  X,
  Plus,
  Trash2,
} from 'lucide-react';

interface HealthStatus {
  status: string;
  provider: string;
  receiverEmail: string;
  totalMessagesStored: number;
  diagnostics?: {
    hasGoogleOAuth: boolean;
    googleEmail?: string;
    hasGoogleClientId?: boolean;
    hasGoogleClientSecret?: boolean;
    hasGoogleRefreshToken?: boolean;
    googleRefreshTokenIsUrl?: boolean;
    googleOAuthIssue?: string;
    hasSmtpConfig: boolean;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    hasSmtpPass?: boolean;
    isSecure?: boolean;
    isGmail?: boolean;
    detectedProvider: string;
    reason: string;
  };
}

export interface ContactAttachment {
  name: string;
  path?: string;
  size?: string;
  type?: string;
  content?: string;
}

interface ContactAppProps {
  initialMessage?: string;
  initialSubject?: string;
  initialAttachments?: ContactAttachment[];
}

export const ContactApp: React.FC<ContactAppProps> = ({
  initialMessage = '',
  initialSubject = '',
  initialAttachments = [],
}) => {
  const { addNotification, sendContactMessage } = useOS();

  const [activeTab, setActiveTab] = useState<'compose' | 'history' | 'diagnostics'>('compose');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: initialSubject,
    message: initialMessage,
    _honeypot: '',
  });

  const [attachments, setAttachments] = useState<ContactAttachment[]>(initialAttachments);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialSubject) {
      setFormData((prev) => ({ ...prev, subject: initialSubject }));
    }
    if (initialMessage) {
      setFormData((prev) => ({ ...prev, message: initialMessage }));
    }
    if (initialAttachments && initialAttachments.length > 0) {
      setAttachments(initialAttachments);
    }
  }, [initialSubject, initialMessage, initialAttachments]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<ContactSubmissionResponse | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [serverHealth, setServerHealth] = useState<HealthStatus | null>(null);
  const [messageHistory, setMessageHistory] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('portfolio_contact_history');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const lastFetchedHistoryTimeRef = React.useRef<number>(0);

  // Fetch server health on load
  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/contact/health');
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          const data = await res.json();
          setServerHealth(data);
        }
      }
    } catch {
      // Backend not yet ready or running offline
    }
  };

  const fetchHistory = async (showSpinner = false) => {
    if (showSpinner || messageHistory.length === 0) {
      setIsLoadingHistory(true);
    }
    try {
      const res = await fetch('/api/contact/history');
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          const data = await res.json();
          const msgs = data.messages || [];
          setMessageHistory(msgs);
          lastFetchedHistoryTimeRef.current = Date.now();
          try {
            localStorage.setItem('portfolio_contact_history', JSON.stringify(msgs));
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Failed to load contact history:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Immediately prefetch history in background on component mount so the tab opens in 0ms
    fetchHistory(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      const elapsed = Date.now() - lastFetchedHistoryTimeRef.current;
      // If we haven't fetched in the last 15 seconds, refresh quietly in background
      if (elapsed > 15000 || messageHistory.length === 0) {
        fetchHistory(messageHistory.length === 0);
      }
    }
  }, [activeTab]);

  const validateClientSide = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Please provide your full name (at least 2 characters).';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address (e.g. name@company.com).';
    }
    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      errs.subject = 'Subject line is required (at least 3 characters).';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = 'Message body must be at least 10 characters long.';
    } else if (formData.message.trim().length > 5000) {
      errs.message = 'Message exceeds the 5000 character limit.';
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    const clientErrs = validateClientSide();
    if (Object.keys(clientErrs).length > 0) {
      setErrors(clientErrs);
      return;
    }

    setErrors({});
    setIsSending(true);

    try {
      const result = await sendContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        _honeypot: formData._honeypot,
        attachments: attachments,
      });

      setLastSubmission(result);
      fetchHealth();

      // Optimistically add to messageHistory and cache immediately for 0ms lag
      const optimisticRecord = {
        id: result.messageId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        status: result.status,
        timestamp: result.timestamp || new Date().toISOString(),
        attachments: [...attachments],
        ipAddress: 'Current Session',
      };
      setMessageHistory((prev) => {
        const updated = [optimisticRecord, ...prev.filter((m) => m.id !== result.messageId)];
        try {
          localStorage.setItem('portfolio_contact_history', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      // Synchronize in background with server
      fetchHistory(false);

      if (result.status === 'failed' || !result.emailSent) {
        addNotification({
          title: 'Message Saved to Database',
          message: `Saved in portfolio records, but email relay encountered an issue.`,
          type: 'warning',
        });
      } else {
        addNotification({
          title: 'Message Delivered',
          message: `Your message "${formData.subject}" was successfully delivered to ${PORTFOLIO_USER.email}`,
          type: 'success',
        });
      }
    } catch (err: any) {
      console.error('[ContactApp] Submission error:', err);
      setGlobalError(err.message || 'Failed to submit contact message. Please try again.');
      addNotification({
        title: 'Contact Delivery Issue',
        message: err.message || 'Could not connect to contact API endpoint.',
        type: 'error',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PORTFOLIO_USER.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
    addNotification({
      title: 'Email Copied',
      message: `${PORTFOLIO_USER.email} copied to clipboard.`,
      type: 'info',
    });
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50/60 dark:bg-[#18181b] p-4 sm:p-6 select-text custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-5 pb-16">
        {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Windows Mail — Contact</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live API Endpoint
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Direct communication gateway to <strong className="text-slate-800 dark:text-slate-200">{PORTFOLIO_USER.name}</strong> ({PORTFOLIO_USER.email})
            </p>
          </div>
        </div>

        {/* Quick Contact & Socials */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyEmail}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Copy email address"
          >
            {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedEmail ? 'Copied' : 'Copy Email'}
          </button>

          <a
            href={`mailto:${PORTFOLIO_USER.email}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors cursor-pointer"
            title="Open default email client"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Direct Mailto
          </a>

          <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-white/10">
            <a
              href={PORTFOLIO_USER.github}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
              title="GitHub"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
            <a
              href={PORTFOLIO_USER.linkedin}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
            {PORTFOLIO_USER.instagram && (
              <a
                href={PORTFOLIO_USER.instagram}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-white/10 pb-1 overflow-x-auto scrollbar-none whitespace-nowrap min-w-0">
        <button
          onClick={() => setActiveTab('compose')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'compose'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          Compose Message
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          Message Log & Receipts
          {serverHealth?.totalMessagesStored ? (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
              {serverHealth.totalMessagesStored}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'diagnostics'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          Backend API Diagnostics
        </button>
      </div>

      {/* ================= TAB 1: COMPOSE ================= */}
      {activeTab === 'compose' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
          {lastSubmission ? (
            (() => {
              const isFailed = lastSubmission.status === 'failed' || (!lastSubmission.emailSent && lastSubmission.status !== 'simulated');
              const isSimulated = lastSubmission.status === 'simulated';

              return (
                <div className="py-8 text-center space-y-4 animate-in fade-in duration-300">
                  {isFailed ? (
                    <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                  ) : isSimulated ? (
                    <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                      <Info className="w-7 h-7" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {isFailed
                        ? 'Message Saved to Database'
                        : isSimulated
                        ? 'Message Stored (Local Database)'
                        : 'Message Successfully Delivered!'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      {isFailed ? (
                        <>
                          Your inquiry was safely saved into Anish&apos;s portfolio database, but external email transmission encountered an issue.
                        </>
                      ) : (
                        <>
                          Your inquiry has been received by the portfolio contact backend service and routed to{' '}
                          <strong className="text-slate-800 dark:text-slate-200">{lastSubmission.receiver || PORTFOLIO_USER.email}</strong>.
                        </>
                      )}
                    </p>
                  </div>

                  {/* Delivery Receipt Card */}
                  <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-left space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Tracking ID:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{lastSubmission.messageId}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Timestamp:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {lastSubmission.timestamp ? new Date(lastSubmission.timestamp).toLocaleTimeString() : 'Just now'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Service Provider:</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{lastSubmission.provider || 'Portfolio Backend'}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Delivery Status:</span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold uppercase text-[10px] ${
                          isFailed
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                            : isSimulated
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {lastSubmission.status || (isFailed ? 'FAILED' : 'DELIVERED')}
                      </span>
                    </div>
                    {attachments.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                        <span className="text-slate-500 block mb-1">Attached Files ({attachments.length}):</span>
                        <div className="flex flex-wrap gap-1.5">
                          {attachments.map((att, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-medium">
                              <Paperclip className="w-2.5 h-2.5" />
                              {att.name} ({att.size || '1 KB'})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {lastSubmission.note && (
                      <p className="pt-2 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400 italic">
                        {lastSubmission.note}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {isFailed && (
                      <a
                        href={`mailto:${lastSubmission.receiver || PORTFOLIO_USER.email}?subject=${encodeURIComponent(formData.subject || 'Portfolio Inquiry')}&body=${encodeURIComponent(formData.message || '')}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer transition-colors shadow"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Send via Default Email App
                      </a>
                    )}
                    <button
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer transition-colors shadow"
                      onClick={() => {
                        setLastSubmission(null);
                        setFormData({ name: '', email: '', subject: '', message: '', _honeypot: '' });
                      }}
                    >
                      Send Another Message
                    </button>
                    <button
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer transition-colors"
                      onClick={() => setActiveTab('history')}
                    >
                      View in Message Log
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Anti-Bot Honeypot */}
              <input
                type="text"
                name="_honeypot"
                value={formData._honeypot}
                onChange={(e) => setFormData({ ...formData, _honeypot: e.target.value })}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              {globalError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Submission Failed:</strong> {globalError}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Your Full Name <span className="text-red-500">*</span></span>
                    <span className="text-[10px] text-slate-400 font-normal">{formData.name.length}/100</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    maxLength={100}
                    disabled={isSending}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                      errors.name
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-slate-200 dark:border-white/10 focus:ring-blue-500/50'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Your Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. sarah@example.com"
                    maxLength={254}
                    disabled={isSending}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                      errors.email
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-slate-200 dark:border-white/10 focus:ring-blue-500/50'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Subject <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">{formData.subject.length}/200</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. AI Engineering Collaboration / Opportunity"
                  maxLength={200}
                  disabled={isSending}
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                    errors.subject
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-slate-200 dark:border-white/10 focus:ring-blue-500/50'
                  }`}
                />
                {errors.subject && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Message Body */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Message Body <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-[10px] ${
                      formData.message.length < 10
                        ? 'text-amber-500'
                        : formData.message.length > 5000
                        ? 'text-red-500 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {formData.message.length} / 5000 chars (min 10)
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Hi Anish, I came across your portfolio OS and would love to discuss a project..."
                  disabled={isSending}
                  className={`w-full p-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                    errors.message
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-slate-200 dark:border-white/10 focus:ring-blue-500/50'
                  }`}
                />
                {errors.message && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Attachments Section */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Attachments {attachments.length > 0 && `(${attachments.length})`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200/60 dark:border-blue-800/40 font-semibold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Upload File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setAttachments((prev) => [
                              ...prev,
                              {
                                name: file.name,
                                size: `${(file.size / 1024).toFixed(1)} KB`,
                                type: file.type || 'file',
                                content: typeof reader.result === 'string' ? reader.result : undefined,
                              },
                            ]);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>

                {attachments.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs text-xs"
                      >
                        <File className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <div className="min-w-0 max-w-[180px]">
                          <p className="font-semibold truncate text-slate-800 dark:text-slate-200 text-[11px]">{att.name}</p>
                          <p className="text-[10px] text-slate-400">{att.size || '1 KB'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Remove attachment"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No files attached yet. You can upload documents or images as attachments.</p>
                )}
              </div>

              {/* Submit Bar */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Server-Validated & Rate-Limited • Destination: {PORTFOLIO_USER.email}</span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        name: 'Recruiter / Hiring Lead',
                        email: 'talent@innovatech.io',
                        subject: 'Excited about your Full Stack & AI Experience!',
                        message: 'Hello Anish,\n\nWe were really impressed by your interactive Windows OS portfolio and AI engineering capabilities. Would you be open to a 20-minute chat this week?\n\nBest regards,\nTalent Acquisition Team',
                        _honeypot: '',
                      });
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    Load Sample
                  </button>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ================= TAB 2: MESSAGE HISTORY / LOGS ================= */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Inbox className="w-4 h-4 text-blue-500" />
                Portfolio Contact Message Logs
              </h2>
              <p className="text-xs text-slate-500">
                In-memory database records stored on the Express backend
              </p>
            </div>
            <button
              onClick={() => fetchHistory(true)}
              disabled={isLoadingHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin text-blue-500' : ''}`} />
              Refresh
            </button>
          </div>

          {isLoadingHistory && messageHistory.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-7 h-7 mx-auto animate-spin text-blue-500" />
              <div className="text-xs text-slate-500 font-medium">Syncing message logs...</div>
            </div>
          ) : messageHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto opacity-40" />
              <div className="text-xs font-medium">No messages recorded in this server session yet.</div>
              <p className="text-[11px] max-w-xs mx-auto text-slate-500">
                Send a message through the Compose tab to see real-time tracking here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messageHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{item.subject}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase ${
                          item.status === 'delivered'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : item.status === 'simulated'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    From: <strong>{item.name}</strong> (<span className="text-blue-500">{item.email}</span>)
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-white/5 whitespace-pre-wrap">
                    {item.message}
                  </p>

                  {item.attachments && item.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.attachments.map((att: any, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-medium border border-blue-500/20"
                        >
                          <Paperclip className="w-2.5 h-2.5" />
                          {att.name} ({att.size || '1 KB'})
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>ID: {item.id}</span>
                    <span>IP: {item.ipAddress}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: DIAGNOSTICS ================= */}
      {activeTab === 'diagnostics' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Mail Dispatcher Diagnostics</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Google OAuth 2.0 (Gmail API) delivery status and transport health
              </p>
            </div>
            <button
              onClick={fetchHealth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {/* Active Status Overview Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 to-blue-50/80 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Active Dispatch Transport
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${
                    serverHealth?.diagnostics?.hasGoogleOAuth || serverHealth?.diagnostics?.hasSmtpConfig
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-500'
                  }`} />
                  {serverHealth?.diagnostics?.detectedProvider || serverHealth?.provider || 'Google OAuth 2.0 (Gmail API)'}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Destination Inbox
                </div>
                <div className="text-xs font-mono font-semibold text-indigo-700 dark:text-indigo-300 mt-0.5">
                  {serverHealth?.receiverEmail || PORTFOLIO_USER.email}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Transport: Google OAuth 2.0 Configuration */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Google OAuth 2.0 Parameters (Primary Transport)
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                serverHealth?.diagnostics?.hasGoogleOAuth
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}>
                {serverHealth?.diagnostics?.hasGoogleOAuth ? 'OAUTH 2.0 READY' : 'CONFIG NEEDED'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5">
                <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px]">GOOGLE_CLIENT_ID</span>
                <span className={`px-2 py-0.5 rounded font-mono font-semibold text-[10px] ${
                  serverHealth?.diagnostics?.hasGoogleClientId
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {serverHealth?.diagnostics?.hasGoogleClientId ? 'CONFIGURED' : 'NOT SET'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5">
                <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px]">GOOGLE_CLIENT_SECRET</span>
                <span className={`px-2 py-0.5 rounded font-mono font-semibold text-[10px] ${
                  serverHealth?.diagnostics?.hasGoogleClientSecret
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {serverHealth?.diagnostics?.hasGoogleClientSecret ? 'CONFIGURED' : 'NOT SET'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5">
                <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px]">GOOGLE_EMAIL</span>
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-slate-700 dark:text-slate-300 text-[10px]">
                  {serverHealth?.diagnostics?.googleEmail || PORTFOLIO_USER.email}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5">
                <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px]">GOOGLE_REFRESH_TOKEN</span>
                <span className={`px-2 py-0.5 rounded font-mono font-semibold text-[10px] ${
                  serverHealth?.diagnostics?.googleRefreshTokenIsUrl
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
                    : serverHealth?.diagnostics?.hasGoogleRefreshToken
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {serverHealth?.diagnostics?.googleRefreshTokenIsUrl
                    ? 'INVALID (URL DETECTED)'
                    : serverHealth?.diagnostics?.hasGoogleRefreshToken
                    ? 'SET (1//0...)'
                    : 'NOT SET'}
                </span>
              </div>
            </div>

            {serverHealth?.diagnostics?.googleOAuthIssue && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">OAuth Attention: </span>
                  {serverHealth.diagnostics.googleOAuthIssue}
                </div>
              </div>
            )}
          </div>

          {/* Setup Instructions for Google OAuth 2.0 (Only shown if setup needed, or collapsible) */}
          {!serverHealth?.diagnostics?.hasGoogleOAuth ? (
            <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 text-xs space-y-2">
              <div className="font-semibold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                How to obtain your Google OAuth 2.0 Refresh Token:
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed space-y-1.5 pl-1">
                <p>
                  1. In Google Cloud Console (&rarr; APIs &amp; Services &rarr; Credentials), open your OAuth 2.0 Client ID and add <code className="font-mono font-bold bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">https://developers.google.com/oauthplayground</code> to <strong>Authorized redirect URIs</strong>.
                </p>
                <p>
                  2. Open <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-bold">Google OAuth 2.0 Playground</a>. Click the ⚙️ gear icon (top right), check <strong>&quot;Use your own OAuth credentials&quot;</strong>, and enter your Client ID &amp; Secret.
                </p>
                <p>
                  3. Under <em>Step 1</em> on the left, expand <strong>Gmail API v1</strong>, select <code className="font-mono bg-white dark:bg-slate-900 px-1 rounded text-slate-800 dark:text-slate-200">https://mail.google.com/</code>, and click <strong>Authorize APIs</strong>. Sign in with <code className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{PORTFOLIO_USER.email}</code>.
                </p>
                <p>
                  4. Under <em>Step 2</em>, click <strong>&quot;Exchange authorization code for tokens&quot;</strong>. Copy the value shown in the <strong>Refresh token</strong> field (starts with <code className="font-mono font-bold bg-white dark:bg-slate-900 px-1 py-0.5 rounded text-emerald-600 dark:text-emerald-400">1//0...</code>) into your <code className="font-mono font-bold text-slate-900 dark:text-white">GOOGLE_REFRESH_TOKEN</code> environment variable.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Google OAuth 2.0 is fully verified and actively delivering messages via Gmail API.</span>
              </div>
            </div>
          )}

          {/* Secondary Fallback: Gmail SMTP info */}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                SMTP Backup Transport Status
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                serverHealth?.diagnostics?.hasSmtpConfig
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {serverHealth?.diagnostics?.hasSmtpConfig ? 'BACKUP READY' : 'OPTIONAL'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              If Google OAuth 2.0 experiences token expiration or downtime, the server will automatically fall back to SMTP ({serverHealth?.diagnostics?.smtpHost || 'smtp.gmail.com'}) if configured.
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
