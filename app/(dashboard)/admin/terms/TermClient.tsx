"use client";

import { useState, useEffect } from "react";
import { 
  CalendarDays, Plus, CheckCircle2, Users, Search, Filter, X, 
  Trash2, Edit, ImageIcon, Loader2, LayoutGrid, List, MoreVertical 
} from "lucide-react";
import { 
  createTermWithOfficers, setActiveTerm, assignOfficer, 
  removeOfficer, updateTermCover, getTermsAndOfficers, deleteTerm 
} from "@/lib/actions/admin-management";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TermsClient({ initialTerms, availablePMs }: { initialTerms: any[], availablePMs: any[] }) {
  const [terms, setTerms] = useState(initialTerms);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "archived">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list"); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [officers, setOfficers] = useState([{ profile_id: "", position: "" }]);

  const [editingTerm, setEditingTerm] = useState<any>(null);
  const [newOfficerProfile, setNewOfficerProfile] = useState("");
  const [newOfficerPosition, setNewOfficerPosition] = useState("");

  useEffect(() => {
    const supabase = createClient();
    
    const fetchFreshData = async () => {
      const freshTerms = await getTermsAndOfficers();
      setTerms(freshTerms);
      setEditingTerm((prev: any) => prev ? freshTerms.find((t: any) => t.id === prev.id) || null : null);
    };

    const channel = supabase.channel('admin-terms-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'terms' }, fetchFreshData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'officers' }, fetchFreshData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredTerms = terms.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || (filterStatus === "active" ? t.is_current : !t.is_current);
    return matchesSearch && matchesFilter;
  });

  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const selectedIds = officers.map(o => o.profile_id).filter(Boolean);
    const uniqueIds = new Set(selectedIds);
    if (selectedIds.length !== uniqueIds.size) {
      toast.error("You cannot assign the same officer multiple times. Please remove duplicates.");
      setIsProcessing(false);
      return;
    }

    const result = await createTermWithOfficers({ name, start_date: startDate, end_date: endDate }, officers);
    setIsProcessing(false);
    
    if (result.success) {
      toast.success("New academic term created!");
      setIsModalOpen(false);
      setName(""); setStartDate(""); setEndDate(""); setOfficers([{ profile_id: "", position: "" }]);
    } else { 
      toast.error(`Error: ${result.error}`); 
    }
  };

  const handleActivateTerm = async (id: string) => {
    if(!confirm("Warning: Activating a new term will archive current projects. Continue?")) return;
    setIsProcessing(true);
    const result = await setActiveTerm(id);
    setIsProcessing(false);
    if (!result.success) {
      toast.error(`Error: ${result.error}`);
    } else {
      toast.success("New academic term set as active!");
    }
  };

  const handleDeleteTerm = async (id: string, termName: string) => {
    if(!confirm(`Are you absolutely sure you want to delete "${termName}"? All associated data will be removed.`)) return;
    setIsProcessing(true);
    const result = await deleteTerm(id);
    setIsProcessing(false);
    if (!result.success) {
      toast.error(`Error: ${result.error}`);
    } else {
      toast.success("Term deleted successfully");
    }
  };

  const handleAddSingleOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTerm || !newOfficerProfile || !newOfficerPosition) return;

    const isDuplicate = editingTerm.officers?.some((o: any) => o.profiles?.id === newOfficerProfile);
    if (isDuplicate) {
      toast.error("This user is already an officer for this term!");
      return;
    }

    setIsProcessing(true);
    const result = await assignOfficer(editingTerm.id, newOfficerProfile, newOfficerPosition);
    setIsProcessing(false);
    
    if (result.success) {
      toast.success("Officer assigned successfully");
      setNewOfficerProfile("");
      setNewOfficerPosition("");
    } else { 
      toast.error(`Error: ${result.error}`); 
    }
  };

  const handleRemoveOfficer = async (officerId: string) => {
    if(!confirm("Remove this officer?")) return;
    setIsProcessing(true);
    const result = await removeOfficer(officerId);
    setIsProcessing(false);
    if (!result.success) {
      toast.error(`Error: ${result.error}`);
    } else {
      toast.success("Officer removed");
    }
  };

  const handleCoverPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTerm) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please select an image smaller than 5MB");
      return;
    }

    setIsUploadingCover(true);
    const supabase = createClient();
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `terms/${editingTerm.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("project-images").getPublicUrl(fileName);

      const result = await updateTermCover(editingTerm.id, publicUrl);
      if (!result.success) throw new Error(result.error);
      
      toast.success("Term cover updated");
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const addOfficerRow = () => setOfficers([...officers, { profile_id: "", position: "" }]);
  const removeOfficerRow = (idx: number) => setOfficers(officers.filter((_, i) => i !== idx));
  const updateOfficer = (idx: number, field: string, value: string) => {
    const newOfficers = [...officers];
    newOfficers[idx] = { ...newOfficers[idx], [field]: value };
    setOfficers(newOfficers);
  };

  return (
   <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 lg:gap-8">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#153B44] flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[#1B4332]" /> Term Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage academic years and council hierarchies.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search terms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1B4332] shadow-sm bg-white" />
          </div>
          <div className="relative w-full sm:w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1B4332] shadow-sm bg-white appearance-none cursor-pointer">
              <option value="all">All Terms</option>
              <option value="active">Active Only</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div className="hidden sm:flex bg-gray-200/50 p-1 rounded-xl shrink-0">
            <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-lg transition-all", viewMode === "list" ? "bg-white text-[#1B4332] shadow-sm font-bold" : "text-gray-500 hover:text-gray-700")} title="Table View"><List className="w-4 h-4"/></button>
            <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-lg transition-all", viewMode === "grid" ? "bg-white text-[#1B4332] shadow-sm font-bold" : "text-gray-500 hover:text-gray-700")} title="Grid View"><LayoutGrid className="w-4 h-4"/></button>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="hidden md:flex items-center justify-center gap-2 px-4 py-2 bg-[#1B4332] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-green-900 shrink-0">
            <Plus className="w-4 h-4" /> Add Term
          </button>
        </div>
      </div>

      <button onClick={() => setIsModalOpen(true)} className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-[#1B4332] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-green-900 z-40 transition-transform active:scale-95">
        <Plus className="w-6 h-6" />
      </button>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTerms.map((term) => (
            <div key={term.id} className={cn("bg-white rounded-2xl p-5 border shadow-sm flex flex-col transition-all relative group", term.is_current ? "border-green-300 ring-4 ring-green-50" : "border-gray-200 hover:border-gray-300")}>
              
              <div className="absolute top-4 right-4 flex gap-2 z-20">
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingTerm(term); }} 
                  className="p-2 bg-white shadow-md hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg transition-all border border-gray-200 hover:border-blue-200" 
                  title="Manage Term"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {!term.is_current && (
                  <button 
                    disabled={isProcessing}
                    onClick={(e) => { e.stopPropagation(); handleDeleteTerm(term.id, term.name); }} 
                    className="p-2 bg-white shadow-md hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-all border border-gray-200 hover:border-red-200 disabled:opacity-50" 
                    title="Delete Term"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {term.cover_url && (
                <div className="absolute top-0 left-0 w-full h-16 bg-gray-100 rounded-t-2xl overflow-hidden opacity-30 pointer-events-none z-0">
                  <img src={term.cover_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex justify-between items-start mb-3 pr-20 relative z-10 pt-2">
                <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{term.name}</h3>
                {term.is_current ? (
                  <span className="flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shrink-0"><CheckCircle2 className="w-3 h-3" /> Active</span>
                ) : (
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shrink-0">Archived</span>
                )}
              </div>
              
              <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-4 font-medium relative z-10">
                <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                {new Date(term.start_date).toLocaleDateString()} to {new Date(term.end_date).toLocaleDateString()}
              </p>

              <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100 relative z-10">
                <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Council Officers</h4>
                {term.officers?.length > 0 ? (
                  <div className="space-y-2">
                    {term.officers.slice(0, 3).map((off: any) => (
                      <div key={off.id} className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-gray-900 truncate pr-2">{off.profiles?.full_name}</span>
                        <span className="text-gray-500 shrink-0 bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">{off.position}</span>
                      </div>
                    ))}
                    {term.officers.length > 3 && <p className="text-[10px] text-center text-gray-400 font-bold pt-1">+ {term.officers.length - 3} more officers</p>}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No officers assigned.</p>
                )}
              </div>

              {!term.is_current && (
                <button disabled={isProcessing} onClick={() => handleActivateTerm(term.id)} className="mt-4 w-full py-2 bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-700 border border-gray-200 hover:border-green-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 relative z-10">
                  Set as Active Term
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Term Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4 text-center">Officers</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTerms.length > 0 ? filteredTerms.map((term) => (
                  <tr key={term.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        {term.cover_url ? (
                          <img src={term.cover_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon className="w-3 h-3" /></div>
                        )}
                      </div>
                      {term.name}
                    </td>
                    <td className="px-6 py-4">
                      {term.is_current ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider"><CheckCircle2 className="w-3 h-3" /> Active</span>
                      ) : (
                        <span className="inline-flex items-center bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Archived</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                      {new Date(term.start_date).toLocaleDateString()} - {new Date(term.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 font-bold">
                      {term.officers?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 rounded-xl shadow-lg p-1">
                          <DropdownMenuItem onClick={() => setEditingTerm(term)} className="py-2.5 px-3 cursor-pointer rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <Edit className="w-4 h-4" /> Manage Term
                          </DropdownMenuItem>
                          {!term.is_current && (
                            <>
                              <DropdownMenuItem disabled={isProcessing} onClick={() => handleActivateTerm(term.id)} className="py-2.5 px-3 cursor-pointer rounded-lg text-sm font-semibold text-green-600 hover:bg-green-50 transition-colors flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Set as Active
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled={isProcessing} onClick={() => handleDeleteTerm(term.id, term.name)} className="py-2.5 px-3 cursor-pointer rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> Delete Term
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No terms found matching your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingTerm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#153B44]">Manage Term</h2>
                <p className="text-sm text-gray-500">{editingTerm.name}</p>
              </div>
              <button onClick={() => setEditingTerm(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-6">
              
              <div className="relative w-full h-32 md:h-40 bg-gray-200 rounded-xl overflow-hidden group shadow-inner">
                <img 
                  src={editingTerm.cover_url || "/hero-section-place.jpg"} 
                  alt="Term Cover" 
                  className={`w-full h-full object-cover transition-transform ${isUploadingCover ? 'scale-105 opacity-50' : ''}`}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer px-4 py-2 bg-white rounded-lg text-sm font-bold shadow-md hover:bg-gray-50 text-gray-900 flex items-center gap-2">
                    {isUploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    {isUploadingCover ? "Uploading..." : "Change Cover Photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverPhotoChange} disabled={isUploadingCover} />
                  </label>
                </div>
              </div>

              <form onSubmit={handleAddSingleOfficer} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-3 items-end">
                <div className="w-full md:w-1/2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Select Project Manager</label>
                  <select required value={newOfficerProfile} onChange={e => setNewOfficerProfile(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="">Select user...</option>
                    {availablePMs
                      .filter(pm => !editingTerm.officers?.some((o: any) => o.profiles?.id === pm.id))
                      .map(pm => <option key={pm.id} value={pm.id}>{pm.full_name} {pm.email ? `(${pm.email})` : ''}</option>)}
                  </select>
                </div>
                <div className="w-full md:w-[40%]">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Position</label>
                  <input required type="text" placeholder="e.g. Secretary" value={newOfficerPosition} onChange={e => setNewOfficerPosition(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <button disabled={isProcessing} type="submit" className="w-full md:w-auto px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm font-bold hover:bg-green-900 shrink-0">
                  {isProcessing ? "..." : "Add"}
                </button>
              </form>

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-[#1B4332]" /> Current Roster</h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      <tr><th className="px-4 py-3">Officer</th><th className="px-4 py-3">Position</th><th className="px-4 py-3 text-right">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {editingTerm.officers?.length > 0 ? editingTerm.officers.map((off: any) => (
                        <tr key={off.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-bold text-gray-900">{off.profiles?.full_name}</td>
                          <td className="px-4 py-3 text-gray-600">{off.position}</td>
                          <td className="px-4 py-3 text-right">
                            <button disabled={isProcessing} onClick={() => handleRemoveOfficer(off.id)} className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      )) : <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No officers found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-[#153B44]">Create New Academic Term</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleCreateTerm} className="overflow-y-auto flex-1 p-5 space-y-8">
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-[#1B4332]" /> Term Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Term Name</label>
                    <input required type="text" placeholder="e.g. AY 2025-2026" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#1B4332]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Start Date</label>
                    <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#1B4332]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">End Date</label>
                    <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#1B4332]" />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Users className="w-4 h-4 text-[#1B4332]" /> Assign Officers (Optional)</h3>
                  <button type="button" onClick={addOfficerRow} className="text-xs font-bold text-[#1B4332] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add Row</button>
                </div>
                
                <div className="space-y-3">
                  {officers.map((officer, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 items-start md:items-center">
                      <div className="w-full md:w-[50%]">
                        <select value={officer.profile_id} onChange={e => updateOfficer(idx, 'profile_id', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                          <option value="">Select Project Manager...</option>
                          {availablePMs.map(pm => {
                            const isSelectedElsewhere = officers.some((o, i) => i !== idx && o.profile_id === pm.id);
                            return (
                              <option key={pm.id} value={pm.id} disabled={isSelectedElsewhere}>
                                {pm.full_name} {pm.email ? `(${pm.email})` : ''}
                                {isSelectedElsewhere ? " (Already Selected)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="w-full md:w-[40%]">
                        <input type="text" placeholder="Position (e.g. President)" value={officer.position} onChange={e => updateOfficer(idx, 'position', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </div>
                      <div className="w-full md:w-[10%] flex justify-end">
                        <button type="button" onClick={() => removeOfficerRow(idx)} className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg shrink-0"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </form>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50 rounded-b-2xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl">Cancel</button>
              <button disabled={isProcessing} onClick={handleCreateTerm} className="px-5 py-2 text-sm font-bold bg-[#1B4332] text-white hover:bg-green-900 rounded-xl disabled:opacity-50">
                {isProcessing ? "Saving..." : "Create Term & Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}