'use client';

import { useState } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  BookOpen,
  Database,
  Brain,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  status: 'processing' | 'completed' | 'failed';
}

// Mock uploaded files
const INITIAL_FILES: UploadedFile[] = [
  {
    id: '1',
    name: 'MCD_Garbage_Collection_Rules_2024.pdf',
    size: '2.4 MB',
    uploadedAt: '2026-01-05',
    status: 'completed',
  },
  {
    id: '2',
    name: 'Water_Supply_Guidelines_Delhi.pdf',
    size: '1.8 MB',
    uploadedAt: '2026-01-03',
    status: 'completed',
  },
  {
    id: '3',
    name: 'Street_Light_Maintenance_Protocol.pdf',
    size: '856 KB',
    uploadedAt: '2026-01-02',
    status: 'completed',
  },
];

export default function SchemesPage() {
  const [files, setFiles] = useState<UploadedFile[]>(INITIAL_FILES);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: '❌ Invalid File Type',
          description: 'Please upload a PDF file',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const tempId = Date.now().toString();

    // 1. Optimistic UI: Show "Processing" immediately
    const newFile: UploadedFile = {
      id: tempId,
      name: selectedFile.name,
      size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'processing',
    };
    setFiles((prev) => [newFile, ...prev]);

    try {
      // 2. Prepare FormData for multipart upload
      const formData = new FormData();
      formData.append('file', selectedFile);

      // 3. Send to God Mode Backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/admin/ingest-pdf`, {
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header; fetch handles multipart/form-data automatically
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Upload failed');
      }

      // 4. Success! Update status to completed
      setFiles((prev) =>
        prev.map((f) => (f.id === tempId ? { ...f, status: 'completed' as const } : f))
      );

      toast({
        title: '🧠 Knowledge Base Updated!',
        description: `Ingested ${data.chunks} chunks from "${selectedFile.name}" into vector database.`,
        variant: 'success',
      });

    } catch (error) {
      console.error('PDF Upload Error:', error);

      // 5. Fail! Update status to failed
      setFiles((prev) =>
        prev.map((f) => (f.id === tempId ? { ...f, status: 'failed' as const } : f))
      );

      toast({
        title: '❌ Ingestion Failed',
        description: error instanceof Error ? error.message : 'Could not process PDF. Check backend logs.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast({
      title: '🗑️ File Removed',
      description: 'Document removed from knowledge base',
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Schemes & Knowledge Base
        </h1>
        <p className="text-slate-500 mt-1">
          Upload documents to enhance the AI agent&apos;s knowledge
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{files.length}</p>
                <p className="text-sm text-slate-500">Documents Indexed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Brain className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">15,420</p>
                <p className="text-sm text-slate-500">Knowledge Chunks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">98.5%</p>
                <p className="text-sm text-slate-500">Query Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload New Document
            </CardTitle>
            <CardDescription>
              Upload PDF documents containing MCD schemes, rules, and guidelines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${selectedFile
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="w-12 h-12 text-blue-600 mx-auto" />
                    <p className="text-sm font-medium text-slate-900">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-blue-600">Click to upload</span> or drag
                      and drop
                    </p>
                    <p className="text-xs text-slate-500">PDF files only (max 50MB)</p>
                  </div>
                )}
              </label>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Process Document
                </>
              )}
            </Button>

            {/* Help Text */}
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Processing Time</p>
                  <p className="text-amber-700 mt-1">
                    Documents are processed using RAG (Retrieval-Augmented Generation).
                    Large documents may take 2-5 minutes to index completely.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Indexed Documents
            </CardTitle>
            <CardDescription>
              Documents currently in the AI knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{file.uploadedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === 'completed' ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Indexed
                      </span>
                    ) : file.status === 'processing' ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Processing
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        Failed
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Base Info */}
      <Card>
        <CardHeader>
          <CardTitle>How RAG Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-slate-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">1. Upload</h3>
              <p className="text-sm text-slate-600">
                Upload PDF documents containing official MCD guidelines and schemes
              </p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-xl">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">2. Index</h3>
              <p className="text-sm text-slate-600">
                Documents are chunked and embedded into a vector database
              </p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">3. Retrieve</h3>
              <p className="text-sm text-slate-600">
                AI agent retrieves relevant context to answer citizen queries accurately
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
