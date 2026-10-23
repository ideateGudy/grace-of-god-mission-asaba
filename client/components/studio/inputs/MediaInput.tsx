"use client";

import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from "react";
import { SafeMediaImage } from "@/components/studio/SafeMediaImage";
import {
  UploadCloud,
  Plus,
  Trash2,
  Download,
  Upload,
  Loader2,
  Check,
  Eye,
  FolderPlus,
  Folder,
  Layers,
  Edit2,
  X,
  GripVertical,
} from "lucide-react";
import {
  type BroadcastStudioState,
  type StudioMediaItem,
  type StudioPlaylist,
} from "@ggm/types";
import {
  loadSavedPlaylists,
  saveSavedPlaylists,
  uploadMediaToCloudinary,
  exportDeckToJson,
  importDeckFromJson,
} from "@/lib/studio/media-service";
import { toast } from "sonner";

interface MediaInputProps {
  state: BroadcastStudioState;
  onChange: (updater: (prev: BroadcastStudioState) => BroadcastStudioState) => void;
  onTakeLive?: () => void;
}

export function MediaInput({ state, onChange }: MediaInputProps) {
  const [playlists, setPlaylists] = useState<StudioPlaylist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("all"); // "all" | "unassigned" | playlist.id
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [newSlideTitle, setNewSlideTitle] = useState<string>("");
  const [newSlideUrl, setNewSlideUrl] = useState<string>("");
  const [newSlideCategory, setNewSlideCategory] = useState<StudioMediaItem["category"]>("flyer");
  const [targetUploadPlaylist, setTargetUploadPlaylist] = useState<string>("");

  // Playlist CRUD modal / inline state
  const [showNewPlaylistModal, setShowNewPlaylistModal] = useState<boolean>(false);
  const [newPlaylistName, setNewPlaylistName] = useState<string>("");
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [editingPlaylistName, setEditingPlaylistName] = useState<string>("");

  // Drag and drop state
  const [draggedMediaId, setDraggedMediaId] = useState<string | null>(null);
  const [dragOverPlaylistId, setDragOverPlaylistId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load playlists on mount
  useEffect(() => {
    const loaded = loadSavedPlaylists();
    setPlaylists(loaded);
  }, []);

  const savePlaylistsAndUpdate = (updated: StudioPlaylist[]) => {
    setPlaylists(updated);
    saveSavedPlaylists(updated);
  };

  const mediaList = state.mediaList || [];
  // Staged item is specifically previewMediaId (or activeMediaId as fallback)
  const stagedPreviewId = state.previewMediaId || state.activeMediaId || mediaList[0]?.id;

  // Filter media based on selected playlist
  const filteredMedia = mediaList.filter((item) => {
    if (selectedPlaylistId === "all") return true;
    if (selectedPlaylistId === "unassigned") return !item.playlistId;
    return item.playlistId === selectedPlaylistId;
  });

  // Stage slide strictly into PREVIEW card (Left monitor) - Never touches live program!
  const handleStageSlide = (slide: StudioMediaItem) => {
    onChange((prev) => ({
      ...prev,
      previewType: "media",
      previewMediaId: slide.id,
      // Do NOT modify activeMediaId or activeType!
    }));
  };

  // Create new Playlist
  const handleCreatePlaylist = () => {
    const trimmed = newPlaylistName.trim();
    if (!trimmed) {
      toast.error("Please enter a playlist name.");
      return;
    }
    const newPl: StudioPlaylist = {
      id: `pl_${Date.now()}`,
      name: trimmed,
      createdAt: new Date().toISOString(),
    };
    const updated = [...playlists, newPl];
    savePlaylistsAndUpdate(updated);
    setSelectedPlaylistId(newPl.id);
    setNewPlaylistName("");
    setShowNewPlaylistModal(false);
    toast.success(`Created playlist "${trimmed}"!`);
  };

  // Rename playlist
  const handleRenamePlaylist = (id: string) => {
    const trimmed = editingPlaylistName.trim();
    if (!trimmed) return;
    const updated = playlists.map((p) => (p.id === id ? { ...p, name: trimmed } : p));
    savePlaylistsAndUpdate(updated);
    setEditingPlaylistId(null);
    setEditingPlaylistName("");
    toast.success("Playlist renamed.");
  };

  // Delete playlist
  const handleDeletePlaylist = (id: string, name: string) => {
    if (!window.confirm(`Delete playlist "${name}"? Media inside will be moved to General Media.`)) {
      return;
    }
    const updated = playlists.filter((p) => p.id !== id);
    savePlaylistsAndUpdate(updated);

    // Unassign media that was in this playlist
    onChange((prev) => ({
      ...prev,
      mediaList: prev.mediaList.map((m) =>
        m.playlistId === id ? { ...m, playlistId: undefined } : m
      ),
    }));

    if (selectedPlaylistId === id) {
      setSelectedPlaylistId("all");
    }
    toast.info(`Deleted playlist "${name}".`);
  };

  // Upload file (Cloudinary signed or local data-URL fallback)
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading slide to Media Deck...");

    const resolvedPlaylistId =
      targetUploadPlaylist ||
      (selectedPlaylistId !== "all" && selectedPlaylistId !== "unassigned"
        ? selectedPlaylistId
        : undefined);

    try {
      const secureUrl = await uploadMediaToCloudinary(file, "gallery");
      const newItem: StudioMediaItem = {
        id: `slide_${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, "").toUpperCase(),
        url: secureUrl,
        category: "flyer",
        playlistId: resolvedPlaylistId,
        uploadedAt: new Date().toISOString(),
      };

      onChange((prev) => ({
        ...prev,
        previewType: "media",
        previewMediaId: newItem.id, // Only preview!
        mediaList: [newItem, ...prev.mediaList],
      }));

      toast.success("Image uploaded & staged in Preview!", { id: toastId });
    } catch {
      // Local DataURL Fallback
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const newItem: StudioMediaItem = {
            id: `slide_${Date.now()}`,
            title: file.name.replace(/\.[^/.]+$/, "").toUpperCase(),
            url: dataUrl,
            category: "flyer",
            playlistId: resolvedPlaylistId,
            uploadedAt: new Date().toISOString(),
          };
          onChange((prev) => ({
            ...prev,
            previewType: "media",
            previewMediaId: newItem.id, // Only preview!
            mediaList: [newItem, ...prev.mediaList],
          }));
          toast.success("Image staged in Preview (local storage mode)!", { id: toastId });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddDirectUrl = () => {
    if (!newSlideUrl.trim()) return;

    const resolvedPlaylistId =
      targetUploadPlaylist ||
      (selectedPlaylistId !== "all" && selectedPlaylistId !== "unassigned"
        ? selectedPlaylistId
        : undefined);

    const newItem: StudioMediaItem = {
      id: `slide_${Date.now()}`,
      title: (newSlideTitle.trim() || "MEDIA SLIDE").toUpperCase(),
      url: newSlideUrl.trim(),
      category: newSlideCategory,
      playlistId: resolvedPlaylistId,
      uploadedAt: new Date().toISOString(),
    };

    onChange((prev) => ({
      ...prev,
      previewType: "media",
      previewMediaId: newItem.id, // Only preview!
      mediaList: [newItem, ...prev.mediaList],
    }));

    setNewSlideTitle("");
    setNewSlideUrl("");
    toast.success("Slide added & staged in Preview!");
  };

  const handleDeleteSlide = (id: string) => {
    onChange((prev) => ({
      ...prev,
      mediaList: prev.mediaList.filter((m) => m.id !== id),
      previewMediaId: prev.previewMediaId === id ? undefined : prev.previewMediaId,
    }));
    toast.info("Slide removed.");
  };

  // Reassign item to a playlist via dropdown
  const handleAssignPlaylist = (slideId: string, newPlId: string) => {
    const destId = newPlId === "unassigned" ? undefined : newPlId;
    onChange((prev) => ({
      ...prev,
      mediaList: prev.mediaList.map((m) =>
        m.id === slideId ? { ...m, playlistId: destId } : m
      ),
    }));
    const targetName = playlists.find((p) => p.id === destId)?.name || "General Media";
    toast.success(`Moved to "${targetName}".`);
  };

  // Drag and drop handlers
  const handleDragStart = (e: DragEvent, id: string) => {
    setDraggedMediaId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverPlaylist = (e: DragEvent, playlistId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverPlaylistId !== playlistId) {
      setDragOverPlaylistId(playlistId);
    }
  };

  const handleDropOnPlaylist = (e: DragEvent, playlistId: string) => {
    e.preventDefault();
    setDragOverPlaylistId(null);
    const mediaId = draggedMediaId || e.dataTransfer.getData("text/plain");
    if (!mediaId) return;

    const destId = playlistId === "unassigned" ? undefined : playlistId;
    onChange((prev) => ({
      ...prev,
      mediaList: prev.mediaList.map((m) =>
        m.id === mediaId ? { ...m, playlistId: destId } : m
      ),
    }));

    const plName = playlists.find((p) => p.id === destId)?.name || "General Media";
    toast.success(`Dropped into "${plName}"!`);
    setDraggedMediaId(null);
  };

  const handleExportDeck = () => {
    const json = exportDeckToJson({
      id: `deck_${Date.now()}`,
      name: "GGM Media Presentation Deck",
      date: new Date().toISOString().split("T")[0],
      items: mediaList,
    });

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ggm_media_deck_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Media deck exported as JSON!");
  };

  const handleImportDeck = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const imported = importDeckFromJson(content);
      if (imported && imported.items.length > 0) {
        onChange((prev) => ({
          ...prev,
          previewType: "media",
          previewMediaId: imported.items[0]?.id,
          mediaList: imported.items,
        }));
        toast.success(`Imported ${imported.items.length} slides from "${imported.name}"!`);
      } else {
        toast.error("Invalid project file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 text-white">
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-900/60 rounded-xl border border-white/5">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Media Deck &amp; Playlists</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300">
              {mediaList.length} Items Total
            </span>
          </h4>
          <p className="text-[11px] text-zinc-400">
            Click any media to stage in Preview. Organize into playlists (Church Service, Announcements, Birthdays).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Target Playlist for Next Upload */}
          <select
            value={targetUploadPlaylist}
            onChange={(e) => setTargetUploadPlaylist(e.target.value)}
            className="px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-amber-400"
            title="Choose playlist for new uploads"
          >
            <option value="">Upload to: Current Selected Playlist</option>
            <option value="unassigned">Upload to: General (No Playlist)</option>
            {playlists.map((pl) => (
              <option key={pl.id} value={pl.id}>
                Upload to: {pl.name}
              </option>
            ))}
          </select>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow"
          >
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
            Upload Image
          </button>

          <button
            type="button"
            onClick={handleExportDeck}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs"
            title="Export media deck JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <label
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs cursor-pointer"
            title="Import media deck JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <input type="file" accept=".json" onChange={handleImportDeck} className="hidden" />
          </label>
        </div>
      </div>

      {/* 2. Playlist Tabs / Folders with Drag Target & CRUD */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            Playlists / Folders (Drag media onto any tab)
          </span>

          <button
            type="button"
            onClick={() => setShowNewPlaylistModal(true)}
            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
          >
            <FolderPlus className="w-3 h-3" />
            New Playlist
          </button>
        </div>

        {/* Create Playlist Modal / Bar */}
        {showNewPlaylistModal && (
          <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <input
              type="text"
              autoFocus
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
              placeholder="e.g. Sunday Service, Announcements, Birthday Pictures..."
              className="flex-1 px-3 py-1.5 bg-black/80 border border-amber-400/40 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleCreatePlaylist}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-lg"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewPlaylistModal(false);
                setNewPlaylistName("");
              }}
              className="p-1.5 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Playlist Filter Chips / Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* All Media */}
          <button
            type="button"
            onClick={() => setSelectedPlaylistId("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedPlaylistId === "all"
                ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Media</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
              {mediaList.length}
            </span>
          </button>

          {/* User Playlists */}
          {playlists.map((pl) => {
            const count = mediaList.filter((m) => m.playlistId === pl.id).length;
            const isSelected = selectedPlaylistId === pl.id;
            const isDragOver = dragOverPlaylistId === pl.id;

            return (
              <div
                key={pl.id}
                onDragOver={(e) => handleDragOverPlaylist(e, pl.id)}
                onDragLeave={() => setDragOverPlaylistId(null)}
                onDrop={(e) => handleDropOnPlaylist(e, pl.id)}
                className={`group relative flex items-center rounded-lg border transition-all ${
                  isDragOver
                    ? "ring-2 ring-amber-400 bg-amber-500/20 border-amber-400 scale-105"
                    : isSelected
                    ? "bg-zinc-800 border-amber-400 text-amber-300 shadow-md"
                    : "bg-zinc-900/80 border-white/5 text-zinc-300 hover:border-white/20"
                }`}
              >
                {editingPlaylistId === pl.id ? (
                  <div className="flex items-center gap-1 p-1">
                    <input
                      type="text"
                      autoFocus
                      value={editingPlaylistName}
                      onChange={(e) => setEditingPlaylistName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRenamePlaylist(pl.id)}
                      className="px-2 py-0.5 bg-black text-xs text-white rounded border border-amber-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRenamePlaylist(pl.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPlaylistId(null)}
                      className="p-1 text-zinc-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedPlaylistId(pl.id)}
                      className="px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Folder className={`w-3.5 h-3.5 ${isSelected ? "text-amber-400" : "text-zinc-400"}`} />
                      <span>{pl.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 font-mono text-zinc-400">
                        {count}
                      </span>
                    </button>

                    {/* Rename & Delete Actions */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center pr-1.5 gap-0.5 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPlaylistId(pl.id);
                          setEditingPlaylistName(pl.name);
                        }}
                        className="p-1 text-zinc-400 hover:text-amber-300 transition-colors"
                        title="Rename playlist"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlaylist(pl.id, pl.name);
                        }}
                        className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                        title="Delete playlist"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* General / Unassigned */}
          <div
            onDragOver={(e) => handleDragOverPlaylist(e, "unassigned")}
            onDragLeave={() => setDragOverPlaylistId(null)}
            onDrop={(e) => handleDropOnPlaylist(e, "unassigned")}
            className={`flex items-center rounded-lg border transition-all ${
              dragOverPlaylistId === "unassigned"
                ? "ring-2 ring-amber-400 bg-amber-500/20 border-amber-400 scale-105"
                : selectedPlaylistId === "unassigned"
                ? "bg-zinc-800 border-amber-400 text-amber-300 shadow-md"
                : "bg-zinc-900/60 border-white/5 text-zinc-400 hover:border-white/20"
            }`}
          >
            <button
              type="button"
              onClick={() => setSelectedPlaylistId("unassigned")}
              className="px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
            >
              <span>General (No Playlist)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 font-mono text-zinc-400">
                {mediaList.filter((m) => !m.playlistId).length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Add Slide via Direct URL */}
      <div className="flex flex-col sm:flex-row gap-2 p-3 bg-zinc-900/40 rounded-xl border border-white/5">
        <input
          type="text"
          value={newSlideUrl}
          onChange={(e) => setNewSlideUrl(e.target.value)}
          placeholder="Paste image URL (https://res.cloudinary.com/...)..."
          className="flex-1 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
        />
        <input
          type="text"
          value={newSlideTitle}
          onChange={(e) => setNewSlideTitle(e.target.value)}
          placeholder="Slide title (e.g. Welcome Flyer)..."
          className="w-full sm:w-48 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
        />
        <button
          type="button"
          onClick={handleAddDirectUrl}
          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* 4. Filtered Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-zinc-900/30 border border-dashed border-white/10 space-y-2">
          <p className="text-xs text-zinc-400">
            {selectedPlaylistId === "all"
              ? "No media uploaded yet. Use 'Upload Image' above or paste an image URL to add slides."
              : `This playlist has no media items. Drag items here or upload an image while this playlist is active.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredMedia.map((slide) => {
            const isStaged = stagedPreviewId === slide.id;
            const isLive = state.activeType === "media" && state.activeMediaId === slide.id;
            const currentPl = playlists.find((p) => p.id === slide.playlistId);

            return (
              <div
                key={slide.id}
                draggable
                onDragStart={(e) => handleDragStart(e, slide.id)}
                className={`relative group rounded-xl overflow-hidden border transition-all ${
                  isStaged
                    ? "border-emerald-400 ring-2 ring-emerald-400/40 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                    : "border-white/10 bg-zinc-900/60 hover:border-white/30"
                }`}
              >
                {/* Thumbnail Container: Clicking ONLY stages to preview! */}
                <div
                  onClick={() => handleStageSlide(slide)}
                  className="relative aspect-video w-full bg-black/80 cursor-pointer overflow-hidden"
                  title="Click to stage in Preview monitor"
                >
                  <SafeMediaImage
                    src={slide.url}
                    alt={slide.title}
                    fill
                    className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Drag Handle Indicator */}
                  <div className="absolute top-2 left-2 p-1 rounded bg-black/60 text-zinc-400 opacity-60 group-hover:opacity-100 cursor-grab">
                    <GripVertical className="w-3 h-3" />
                  </div>

                  {/* Badges: Staged in Preview vs Live on Air */}
                  <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                    {isLive && (
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase tracking-wider shadow animate-pulse">
                        LIVE ON AIR
                      </span>
                    )}
                    {isStaged && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
                        <Check className="w-3 h-3" /> STAGED [PREVIEW]
                      </span>
                    )}
                  </div>

                  {/* Playlist badge overlay */}
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-amber-300 text-[9px] font-bold backdrop-blur-sm flex items-center gap-1">
                    <Folder className="w-2.5 h-2.5" />
                    <span>{currentPl?.name || "General Media"}</span>
                  </div>
                </div>

                {/* Title & Actions Bar */}
                <div className="p-2.5 bg-zinc-900/90 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate" title={slide.title}>
                      {slide.title}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStageSlide(slide)}
                        className="p-1 rounded bg-zinc-800 hover:bg-emerald-600 text-zinc-300 hover:text-white transition-colors"
                        title="Stage in Preview"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="p-1 rounded bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white transition-colors"
                        title="Delete slide"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Playlist Reassignment Dropdown */}
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/5">
                    <span className="text-[10px] text-zinc-400">Playlist:</span>
                    <select
                      value={slide.playlistId || "unassigned"}
                      onChange={(e) => handleAssignPlaylist(slide.id, e.target.value)}
                      className="px-2 py-0.5 bg-black/60 border border-white/10 rounded text-[10px] text-zinc-300 focus:outline-none focus:border-amber-400"
                    >
                      <option value="unassigned">General (No Playlist)</option>
                      {playlists.map((pl) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
