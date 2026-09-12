import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { FileText, Folder, HardDrive, Info, ShieldCheck, Check, X, Lock, Key, UserCheck, ShieldAlert, Edit3 } from 'lucide-react';

type UserGroup = 'SYSTEM' | 'Administrators' | 'Users';

interface PermissionEntry {
  id: string;
  name: string;
  allow: boolean;
  deny: boolean;
}

const DEFAULT_PERMISSIONS: Record<UserGroup, PermissionEntry[]> = {
  SYSTEM: [
    { id: 'full', name: 'Full control', allow: true, deny: false },
    { id: 'modify', name: 'Modify', allow: true, deny: false },
    { id: 'readExec', name: 'Read & execute', allow: true, deny: false },
    { id: 'list', name: 'List folder contents', allow: true, deny: false },
    { id: 'read', name: 'Read', allow: true, deny: false },
    { id: 'write', name: 'Write', allow: true, deny: false },
    { id: 'special', name: 'Special permissions', allow: false, deny: false },
  ],
  Administrators: [
    { id: 'full', name: 'Full control', allow: true, deny: false },
    { id: 'modify', name: 'Modify', allow: true, deny: false },
    { id: 'readExec', name: 'Read & execute', allow: true, deny: false },
    { id: 'list', name: 'List folder contents', allow: true, deny: false },
    { id: 'read', name: 'Read', allow: true, deny: false },
    { id: 'write', name: 'Write', allow: true, deny: false },
    { id: 'special', name: 'Special permissions', allow: false, deny: false },
  ],
  Users: [
    { id: 'full', name: 'Full control', allow: false, deny: false },
    { id: 'modify', name: 'Modify', allow: false, deny: false },
    { id: 'readExec', name: 'Read & execute', allow: true, deny: false },
    { id: 'list', name: 'List folder contents', allow: true, deny: false },
    { id: 'read', name: 'Read', allow: true, deny: false },
    { id: 'write', name: 'Write', allow: false, deny: true },
    { id: 'special', name: 'Special permissions', allow: false, deny: false },
  ],
};

export const PropertiesModal: React.FC = () => {
  const { propertiesTarget, closeProperties, updateDriveLabel, renameFile, renameDesktopIcon, updateFileAttributes, files, addNotification } = useOS();
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'details'>('general');
  const [readOnly, setReadOnly] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<UserGroup>('SYSTEM');
  const [permissions, setPermissions] = useState<Record<UserGroup, PermissionEntry[]>>(DEFAULT_PERMISSIONS);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [hasChangedPermissions, setHasChangedPermissions] = useState(false);

  useEffect(() => {
    if (propertiesTarget) {
      setEditedName(propertiesTarget.name || '');
      setActiveTab('general');

      // Check matching file to retrieve current hidden and readOnly flags
      const matchingFile = propertiesTarget.file || (propertiesTarget.location ? files.find((f) => f.path === propertiesTarget.location || f.name === propertiesTarget.name) : undefined);
      setHidden(Boolean(propertiesTarget.hidden ?? matchingFile?.hidden));
      setReadOnly(Boolean(propertiesTarget.readOnly ?? matchingFile?.readOnly));

      // Load any saved custom permissions for this target
      try {
        const saved = localStorage.getItem(`win11_perms_${propertiesTarget.location || propertiesTarget.name}`);
        if (saved) {
          setPermissions(JSON.parse(saved));
        } else {
          setPermissions(DEFAULT_PERMISSIONS);
        }
      } catch {
        setPermissions(DEFAULT_PERMISSIONS);
      }
      setHasChangedPermissions(false);
    }
  }, [propertiesTarget, files]);

  if (!propertiesTarget) return null;

  const isDrive = Boolean(propertiesTarget.drivePath || propertiesTarget.type.includes('Local Disk') || propertiesTarget.type.includes('Drive'));

  const handleTogglePermission = (group: UserGroup, permId: string, type: 'allow' | 'deny') => {
    setPermissions((prev) => {
      const groupPerms = prev[group].map((p) => {
        if (p.id === permId) {
          if (type === 'allow') {
            const nextAllow = !p.allow;
            return { ...p, allow: nextAllow, deny: nextAllow ? false : p.deny };
          } else {
            const nextDeny = !p.deny;
            return { ...p, deny: nextDeny, allow: nextDeny ? false : p.allow };
          }
        }
        // If Full control is granted/denied, propagate to others
        if (permId === 'full') {
          if (type === 'allow') {
            return { ...p, allow: !p.allow, deny: false };
          }
        }
        return p;
      });
      return { ...prev, [group]: groupPerms };
    });
    setHasChangedPermissions(true);
  };

  const handleSave = () => {
    if (editedName.trim() && editedName !== propertiesTarget.name) {
      if (isDrive && propertiesTarget.drivePath) {
        updateDriveLabel(propertiesTarget.drivePath, editedName);
      } else if (propertiesTarget.location) {
        renameFile(propertiesTarget.location, editedName);
      }
    }

    // Save hidden and readOnly attributes
    const targetPathOrId = propertiesTarget.location || propertiesTarget.name;
    if (targetPathOrId) {
      updateFileAttributes(targetPathOrId, {
        hidden,
        readOnly,
      });
    }

    if (hasChangedPermissions) {
      try {
        localStorage.setItem(
          `win11_perms_${propertiesTarget.location || propertiesTarget.name}`,
          JSON.stringify(permissions)
        );
      } catch {}
      addNotification({
        title: 'Permissions Updated',
        message: `Security Access Control List saved for ${propertiesTarget.name}.`,
        type: 'success',
      });
    }

    closeProperties();
  };

  const handleApplyPermissions = () => {
    try {
      localStorage.setItem(
        `win11_perms_${propertiesTarget.location || propertiesTarget.name}`,
        JSON.stringify(permissions)
      );
    } catch {}
    setHasChangedPermissions(false);
    addNotification({
      title: 'Security Permissions Applied',
      message: `Permissions for ${selectedGroup} successfully updated.`,
      type: 'success',
    });
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-[420px] bg-slate-900/95 border border-white/20 rounded-2xl shadow-2xl text-slate-100 text-xs overflow-hidden select-none animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/90 border-b border-white/10">
          <div className="flex items-center gap-2 font-medium">
            <Info className="w-4 h-4 text-blue-400" />
            <span className="truncate max-w-[300px]">{propertiesTarget.name} Properties</span>
          </div>
          <button
            onClick={closeProperties}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Tabs Header */}
        <div className="flex border-b border-white/10 bg-slate-800/40 text-[11px] font-medium px-2 pt-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3 py-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Details
          </button>
        </div>

        {/* TAB 1: GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="p-4 space-y-3.5">
            {/* Header row with Icon and Editable Name */}
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0 overflow-hidden flex items-center justify-center">
                {isDrive ? (
                  <HardDrive className="w-8 h-8 text-blue-400" />
                ) : propertiesTarget.type.includes('Folder') ? (
                  <Folder className="w-8 h-8 text-amber-400" />
                ) : propertiesTarget.name.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i) ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-black/40">
                    <img
                      src={
                        propertiesTarget.location?.includes('Downloads') && propertiesTarget.name === 'Windows11.jpg'
                          ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
                          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
                      }
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <FileText className="w-8 h-8 text-blue-400" />
                )}
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 mb-0.5 block">Item Name / Drive Label:</label>
                <input
                  type="text"
                  value={editedName || ''}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full bg-slate-800/90 border border-blue-500/40 rounded-lg px-2.5 py-1 font-semibold text-slate-100 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                />
              </div>
            </div>

            {/* General Info / Drive Storage Info */}
            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400">Type:</span>
                <span className="col-span-2 font-medium text-slate-200">{propertiesTarget.type}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400">File System:</span>
                <span className="col-span-2 text-slate-200">{propertiesTarget.fileSystem || 'NTFS'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400">Location:</span>
                <span className="col-span-2 font-mono text-xs text-slate-300 truncate">
                  {propertiesTarget.location}
                </span>
              </div>

              {isDrive ? (
                <>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <span className="text-slate-400">Used space:</span>
                    <span className="col-span-2 text-blue-400 font-semibold">{propertiesTarget.usedGB || '43.5 GB'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400">Free space:</span>
                    <span className="col-span-2 text-emerald-400 font-semibold">{propertiesTarget.freeGB || '256.5 GB'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400">Capacity:</span>
                    <span className="col-span-2 text-slate-100 font-bold">{propertiesTarget.totalGB || '300 GB'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400">Size:</span>
                    <span className="col-span-2 text-slate-200">{propertiesTarget.size || '4.0 KB'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400">Created:</span>
                    <span className="col-span-2 text-slate-300">
                      {propertiesTarget.created || 'August 10, 2026, 12:00:00 PM'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400">Modified:</span>
                    <span className="col-span-2 text-slate-300">
                      {propertiesTarget.modified || 'August 10, 2026, 12:00:00 PM'}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-white/10 pt-3 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Attributes
              </div>
              <div className="flex items-center gap-6 text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={readOnly}
                    onChange={(e) => setReadOnly(e.target.checked)}
                    className="rounded border-white/20 bg-slate-800 text-blue-500 focus:ring-0"
                  />
                  <span>Read-only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hidden}
                    onChange={(e) => setHidden(e.target.checked)}
                    className="rounded border-white/20 bg-slate-800 text-blue-500 focus:ring-0"
                  />
                  <span>Hidden</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="p-4 space-y-3">
            <div className="text-[11px] text-slate-400">
              <span className="font-semibold text-slate-200">Object name:</span> {propertiesTarget.location}
            </div>

            {/* User / Group Selector */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span>Group or user names:</span>
                <span className="text-[10px] text-blue-400 font-normal">Select group to configure</span>
              </div>
              <div className="border border-white/10 rounded-xl bg-slate-800/80 p-1.5 space-y-1">
                {(['SYSTEM', 'Administrators', 'Users'] as const).map((group) => (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                      selectedGroup === group ? 'bg-blue-600/30 border border-blue-500/50 text-white font-medium' : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>{group} (DESKTOP-WIN11\{group})</span>
                    </div>
                    {selectedGroup === group && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Permissions Grid */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span>Permissions for {selectedGroup}:</span>
                <span className="text-[10px] text-slate-400 font-normal">Click boxes to edit</span>
              </div>
              <div className="border border-white/10 rounded-xl bg-slate-800/60 p-2 text-[11px]">
                {/* Table Header */}
                <div className="flex items-center justify-between px-2 pb-1.5 mb-1 border-b border-white/10 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  <span>Permission</span>
                  <div className="flex items-center gap-6 pr-1">
                    <span className="text-emerald-400">Allow</span>
                    <span className="text-rose-400">Deny</span>
                  </div>
                </div>

                {/* Table Rows */}
                <div className="space-y-1">
                  {(permissions[selectedGroup] || []).map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between px-2 py-1 rounded hover:bg-white/5 transition-colors"
                    >
                      <span className="text-slate-200">{perm.name}</span>
                      <div className="flex items-center gap-7 pr-2">
                        {/* Allow Checkbox */}
                        <label className="cursor-pointer flex items-center justify-center p-0.5" title={`Allow ${perm.name}`}>
                          <input
                            type="checkbox"
                            checked={perm.allow}
                            onChange={() => handleTogglePermission(selectedGroup, perm.id, 'allow')}
                            className="w-3.5 h-3.5 rounded border-white/30 bg-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                        </label>

                        {/* Deny Checkbox */}
                        <label className="cursor-pointer flex items-center justify-center p-0.5" title={`Deny ${perm.name}`}>
                          <input
                            type="checkbox"
                            checked={perm.deny}
                            onChange={() => handleTogglePermission(selectedGroup, perm.id, 'deny')}
                            className="w-3.5 h-3.5 rounded border-white/30 bg-slate-800 text-rose-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DETAILS TAB */}
        {activeTab === 'details' && (
          <div className="p-4 space-y-3">
            <div className="text-[11px] font-semibold text-slate-300 pb-1 border-b border-white/10">
              Property Details
            </div>
            <div className="border border-white/10 rounded-xl bg-slate-800/60 divide-y divide-white/5 text-[11px]">
              <div className="flex items-center justify-between p-2">
                <span className="text-slate-400">Property Name</span>
                <span className="font-semibold text-slate-100">{propertiesTarget.name}</span>
              </div>
              <div className="flex items-center justify-between p-2">
                <span className="text-slate-400">Type</span>
                <span className="text-slate-200">{propertiesTarget.type}</span>
              </div>
              <div className="flex items-center justify-between p-2">
                <span className="text-slate-400">Path / Location</span>
                <span className="font-mono text-[10px] text-slate-300">{propertiesTarget.location}</span>
              </div>
              <div className="flex items-center justify-between p-2">
                <span className="text-slate-400">File System</span>
                <span className="text-slate-200">{propertiesTarget.fileSystem || 'NTFS'}</span>
              </div>
              {isDrive && (
                <>
                  <div className="flex items-center justify-between p-2">
                    <span className="text-slate-400">Capacity</span>
                    <span className="text-slate-100 font-bold">{propertiesTarget.totalGB || '300 GB'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2">
                    <span className="text-slate-400">Free Space</span>
                    <span className="text-emerald-400 font-semibold">{propertiesTarget.freeGB || '256.5 GB'}</span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between p-2">
                <span className="text-slate-400">Owner</span>
                <span className="text-slate-200">SYSTEM / Administrator</span>
              </div>
              <div className="flex items-center justify-between p-2">
                <span className="text-slate-400">Computer</span>
                <span className="text-slate-200">DESKTOP-WIN11</span>
              </div>
              <div className="flex items-center justify-between p-2">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-400 font-medium">Healthy (Active)</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 bg-slate-800/90 border-t border-white/10">
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors cursor-pointer"
          >
            OK
          </button>
          <button
            onClick={closeProperties}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          {hasChangedPermissions && (
            <button
              onClick={handleApplyPermissions}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors cursor-pointer shadow-md"
            >
              Apply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
