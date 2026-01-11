'use client';

import { useState, useRef } from 'react';
import {
  Search, Plus, ExternalLink, Zap, Users, Coins, ShieldCheck, Upload, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";

// --- Types ---
interface Scheme {
  id: string;
  name: string;
  category: string;
  beneficiaries: string;
  grant: string;
  status: 'active' | 'paused';
  tags: string[];
}

// --- Mock Data ---
const ACTIVE_SCHEMES: Scheme[] = [
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
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Assuming backend is running on localhost:8000
      const response = await fetch('http://localhost:8000/api/documents/upload-scheme', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const result = await response.json();

      toast({
        title: "Upload Successful",
        description: `Processed ${result.chunks_processed} chunks from ${result.filename}`,
      });

      // Optionally refresh schemes list here if backend returned new data
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "There was an error uploading the scheme.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col space-y-6 max-w-[1600px] mx-auto p-2 min-h-[calc(100vh-2rem)]">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Active Schemes Registry
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage public welfare schemes available to citizens</p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Search Bar & Actions */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <Input placeholder="Search schemes by name or category..." className="pl-9 bg-white" />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {isUploading ? "Uploading..." : "Upload New Scheme PDF"}
          </Button>
        </div>

        {/* Scheme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACTIVE_SCHEMES.map((scheme) => (
            <Card key={scheme.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-blue-200">
              <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Zap className="w-5 h-5" />
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${scheme.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                  {scheme.status}
                </span>
              </CardHeader>
              <CardContent className="pt-4">
                <h3 className="font-bold text-lg text-slate-900 mb-1">{scheme.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{scheme.category}</p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-50 p-2 rounded-md">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Beneficiaries</p>
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {scheme.beneficiaries}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-md">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Grant/Benefit</p>
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                      <Coins className="w-3 h-3" /> {scheme.grant}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {scheme.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>

                <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200">
                  View Details <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}