import { useState } from 'react';
import { Settings, Layout, Activity } from '../components/icons';
import { useProjectContext } from '../context/ProjectContext';
import { STATUS_LABELS, SEED_USERS } from '../utils/constants';
import { cn, getUserInitials, getAvatarColor, formatDate } from '../utils/helpers';

type Tab = 'general' | 'board' | 'members';

const BOARD_COLUMNS = [
  { status: 'backlog', label: 'Backlog' },
  { status: 'todo', label: 'To Do' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'in_review', label: 'In Review' },
  { status: 'done', label: 'Done' },
  { status: 'cancelled', label: 'Cancelled' },
];

export function SettingsPage() {
  const { currentProject } = useProjectContext();
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
    { key: 'board', label: 'Board', icon: <Layout className="w-4 h-4" /> },
    { key: 'members', label: 'Members', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-bark-900">Settings</h1>
        <p className="text-sm text-bark-500 mt-1">Manage project configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-bark-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === tab.key
                ? 'border-canopy-600 text-canopy-700'
                : 'border-transparent text-bark-500 hover:text-bark-700 hover:border-bark-300'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-bark-200 shadow-sm p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-semibold text-bark-900 mb-4">Project Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-bark-600 mb-1">Project Name</label>
                  <input
                    type="text"
                    readOnly
                    value={currentProject?.name || 'No project selected'}
                    className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm bg-bark-50 text-bark-700 cursor-default"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark-600 mb-1">Project Key</label>
                  <input
                    type="text"
                    readOnly
                    value={currentProject?.key || '-'}
                    className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm bg-bark-50 text-bark-700 font-mono cursor-default"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark-600 mb-1">Description</label>
                  <textarea
                    readOnly
                    value={currentProject?.description || 'No description'}
                    rows={3}
                    className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm bg-bark-50 text-bark-700 resize-none cursor-default"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-bark-600 mb-1">Created</label>
                    <input
                      type="text"
                      readOnly
                      value={currentProject?.createdAt ? formatDate(currentProject.createdAt) : '-'}
                      className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm bg-bark-50 text-bark-700 cursor-default"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark-600 mb-1">Last Updated</label>
                    <input
                      type="text"
                      readOnly
                      value={currentProject?.updatedAt ? formatDate(currentProject.updatedAt) : '-'}
                      className="w-full px-3 py-2 border border-bark-200 rounded-lg text-sm bg-bark-50 text-bark-700 cursor-default"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-bark-200" />

            <div>
              <h2 className="font-display font-semibold text-bark-900 mb-2">Application Info</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="px-4 py-3 bg-bark-50 rounded-lg">
                  <span className="text-bark-500 block text-xs mb-0.5">Version</span>
                  <span className="text-bark-800 font-medium">v1.0.0</span>
                </div>
                <div className="px-4 py-3 bg-bark-50 rounded-lg">
                  <span className="text-bark-500 block text-xs mb-0.5">Backend</span>
                  <span className="text-bark-800 font-medium">AWS Lambda + DynamoDB</span>
                </div>
                <div className="px-4 py-3 bg-bark-50 rounded-lg">
                  <span className="text-bark-500 block text-xs mb-0.5">Frontend</span>
                  <span className="text-bark-800 font-medium">React + Vite + Tailwind</span>
                </div>
                <div className="px-4 py-3 bg-bark-50 rounded-lg">
                  <span className="text-bark-500 block text-xs mb-0.5">Database</span>
                  <span className="text-bark-800 font-medium">Single-table DynamoDB</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'board' && (
          <div>
            <h2 className="font-display font-semibold text-bark-900 mb-4">Board Columns</h2>
            <p className="text-sm text-bark-500 mb-4">
              Status mappings for board columns. Each status corresponds to a column on the Kanban board.
            </p>
            <div className="border border-bark-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bark-50 border-b border-bark-200">
                    <th className="text-left px-4 py-2.5 font-medium text-bark-700">Column</th>
                    <th className="text-left px-4 py-2.5 font-medium text-bark-700">Status Key</th>
                    <th className="text-left px-4 py-2.5 font-medium text-bark-700">Display Label</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bark-100">
                  {BOARD_COLUMNS.map((col, index) => (
                    <tr key={col.status} className="hover:bg-bark-50 transition-colors">
                      <td className="px-4 py-3 text-bark-800 font-medium">{index + 1}. {col.label}</td>
                      <td className="px-4 py-3">
                        <code className="font-mono text-xs bg-bark-100 text-bark-700 px-2 py-0.5 rounded">{col.status}</code>
                      </td>
                      <td className="px-4 py-3 text-bark-600">{STATUS_LABELS[col.status] || col.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <h2 className="font-display font-semibold text-bark-900 mb-4">Team Members</h2>
            <p className="text-sm text-bark-500 mb-4">
              People who have access to this project.
            </p>
            <div className="space-y-3">
              {SEED_USERS.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-bark-200 hover:border-bark-300 transition-colors"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium',
                    getAvatarColor(user.name)
                  )}>
                    {getUserInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-bark-800">{user.name}</p>
                    <p className="text-xs text-bark-500">{user.email}</p>
                  </div>
                  <span className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium',
                    user.role === 'admin' ? 'bg-canopy-100 text-canopy-700' : 'bg-bark-100 text-bark-600'
                  )}>
                    {user.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
