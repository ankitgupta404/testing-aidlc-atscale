import { useState } from "react";
import { Plus, Edit2, Trash2, Search, Loader2 } from "lucide-react";
import type { Announcement, AwsService } from "@aws-news-hub/shared";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from "../api/client";
import { useDebounce } from "../hooks/useDebounce";
import { useToast } from "../hooks/useToast";
import { AnnouncementForm } from "../components/AnnouncementForm";
import { DeleteConfirmation } from "../components/DeleteConfirmation";
import { ToastContainer } from "../components/Toast";
import { ServiceBadge } from "../components/ServiceBadge";
import { shortDate } from "../utils/formatDate";

export function AdminPage() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useAnnouncements({
    search: debouncedSearch || undefined,
    limit: 100,
  });

  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const allAnnouncements = data?.pages.flatMap((page) => page.announcements) || [];

  const handleCreate = (input: {
    title: string;
    summary: string;
    service: AwsService;
    date: string;
    url?: string;
  }) => {
    createMutation.mutate(input, {
      onSuccess: () => {
        setFormOpen(false);
        addToast("Announcement created successfully", "success");
      },
      onError: (err) => {
        addToast(err.message || "Failed to create announcement", "error");
      },
    });
  };

  const handleUpdate = (input: {
    title: string;
    summary: string;
    service: AwsService;
    date: string;
    url?: string;
  }) => {
    if (!editingAnnouncement) return;
    updateMutation.mutate(
      { id: editingAnnouncement.id, ...input },
      {
        onSuccess: () => {
          setEditingAnnouncement(null);
          addToast("Announcement updated successfully", "success");
        },
        onError: (err) => {
          addToast(err.message || "Failed to update announcement", "error");
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        addToast("Announcement deleted", "success");
      },
      onError: (err) => {
        addToast(err.message || "Failed to delete announcement", "error");
      },
    });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in-up">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Manage Announcements
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Create, edit, and delete AWS service announcements.
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-aws-orange text-white text-sm font-medium rounded-lg hover:bg-aws-orange-dark transition-all shadow-sm shadow-aws-orange/20"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 animate-fade-in-up stagger-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aws-orange/30 focus:border-aws-orange transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-bg-surface rounded-xl border border-border overflow-hidden animate-fade-in-up stagger-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-aws-orange" />
          </div>
        ) : allAnnouncements.length === 0 ? (
          <div className="text-center py-16 text-text-secondary text-sm">
            No announcements found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-primary/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider hidden sm:table-cell">
                    Service
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allAnnouncements.map((announcement) => (
                  <tr
                    key={announcement.id}
                    className="hover:bg-bg-primary/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-text-primary max-w-[300px] truncate">
                        {announcement.title}
                      </div>
                      <div className="sm:hidden mt-1">
                        <ServiceBadge service={announcement.service} size="sm" />
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <ServiceBadge service={announcement.service} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-text-secondary font-mono">
                        {shortDate(announcement.date)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingAnnouncement(announcement)}
                          className="p-2 text-text-secondary hover:text-aws-orange hover:bg-aws-orange/5 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(announcement)}
                          className="p-2 text-text-secondary hover:text-error hover:bg-error/5 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Form */}
      <AnnouncementForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      {/* Edit Form */}
      <AnnouncementForm
        isOpen={!!editingAnnouncement}
        onClose={() => setEditingAnnouncement(null)}
        onSubmit={handleUpdate}
        initialData={editingAnnouncement}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        isOpen={!!deleteTarget}
        title={deleteTarget?.title || ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
