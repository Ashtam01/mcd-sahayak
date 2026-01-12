'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search, Plus, ExternalLink, Zap, Users, Coins, ShieldCheck, Upload, Loader2, FileText, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/useTranslation';
import { useToast } from "@/components/ui/use-toast";
import { API_BASE } from '@/lib/api';

// --- Types ---
interface Scheme {
  id: string;
  name: string;
  category: string;
  beneficiaries: string;
  grant: string;
  status: 'active' | 'paused';
  tags: string[];
  description?: string;
  url?: string;
  created_at?: string;
}

// --- Mock Data ---
const MOCK_SCHEMES: Scheme[] = [
  {
    id: 's1', name: 'MCD Green Waste Initiative', category: 'Sanitation',
    beneficiaries: '24,000+', grant: '₹5,000 / mo', status: 'active', tags: ['Composting', 'Eco-Friendly']
  },
  {
    id: 's2', name: 'PM Awas Yojana (Urban)', category: 'Housing',
    beneficiaries: '1.2 Lakh', grant: 'Subsidized Housing', status: 'active', tags: ['Housing', 'Central Govt']
  },
  {
    id: 's3', name: 'Street Vendor Support', category: 'Welfare',
    beneficiaries: '45,000', grant: 'Micro-Loans', status: 'paused', tags: ['Loans', 'Small Business']
  },
  {
    id: 's4', name: 'Delhi Solar Policy 2025', category: 'Energy',
    beneficiaries: 'New Launch', grant: 'Installation Subsidy', status: 'active', tags: ['Solar', 'Sustainability']
  }
];

export default function SchemesPage() {
  // Merged Hooks: Translation + Toast + State
  const t = useTranslation();
  const { toast } = useToast();
  
  const [isUploading, setIsUploading] = useState(false);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch schemes from backend (Main Branch Logic)
  const fetchSchemes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/documents/schemes`);
      if (res.ok) {
        const data = await res.json();
        // Map backend schemes to frontend interface
        const backendSchemes = data.schemes.map((s: any) => ({
          id: s.id,
          name: s.name,
          category: s.category || 'General',
          beneficiaries: 'General Public', // Default
          grant: 'View Document', // Default
          status: s.status || 'active',
          tags: ['Uploaded', 'PDF'],
          description: s.description,
          url: s.url,
          created_at: s.created_at
        }));

        // Merge: Backend schemes first, then mock
        setSchemes([...backendSchemes, ...MOCK_SCHEMES]);
      } else {
        setSchemes(MOCK_SCHEMES);
      }
    } catch (e) {
      console.error("Failed to fetch schemes", e);
      setSchemes(MOCK_SCHEMES);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({ title: "Invalid file", description: "Only PDF files allowed", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', description);

    try {
      const response = await fetch(`${API_BASE}/api/documents/upload-scheme`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();

      toast({
        title: "Upload Successful",
        description: `Uploaded ${result.filename}`,
      });

      setSelectedFile(null);
      setDescription('');
      setShowUpload(false);
      fetchSchemes(); // Refresh list

    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Error uploading scheme",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col space-y-6 max-w-[1600px] mx-auto p-2 min-h-[calc(100vh-2rem)]">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            {t.schemes.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t.schemes.subtitle}</p>
        </div>
      </div>

      {/* Upload Form (From Main Branch) */}
      {showUpload && (
        <Card className="bg-blue-50/50 border-blue-100">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-blue-900">Upload New Scheme Document</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Brief Description (e.g. 'Policy document for solar rebate')"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white"
                />
                <div className="flex gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <Button onClick={handleUpload} disabled={isUploading || !selectedFile} className="bg-blue-600">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowUpload(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CONTENT */}
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Search Bar & Actions */}
        {!showUpload && (
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input placeholder={t.schemes.searchPlaceholder} className="pl-9 bg-white" />
            </div>
            <Button
              onClick={() => setShowUpload(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.schemes.registerNew}
            </Button>
          </div>
        )}

        {/* Scheme Grid - Merged Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <Card key={scheme.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-blue-200 flex flex-col">
              <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {scheme.url ? <FileText className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${scheme.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                  {scheme.status === 'active' ? t.schemes.active : t.schemes.paused}
                </span>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-2" title={scheme.name}>{scheme.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{scheme.category}</p>

                {scheme.description && (
                  <p className="text-xs text-slate-600 mb-4 line-clamp-3 bg-slate-50 p-2 rounded">
                    {scheme.description}
                  </p>
                )}

                <div className="flex-1"></div>

                {!scheme.description && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-slate-50 p-2 rounded-md">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{t.schemes.beneficiaries}</p>
                      <p className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {scheme.beneficiaries}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-md">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{t.schemes.grantBenefit}</p>
                      <p className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                        <Coins className="w-3 h-3" /> {scheme.grant}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {scheme.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>

                {scheme.url ? (
                  <Button variant="outline" className="w-full gap-2 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200" onClick={() => window.open(scheme.url, '_blank')}>
                    <Download className="w-4 h-4" /> Download PDF
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200">
                    {t.schemes.viewDetails} <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}