import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { Upload, X, FileText, Loader2, Download, FileType } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const FileUpload = ({ 
  files = [], 
  onFilesChange, 
  bucketName = 'property-images', 
  folderPath = 'plans',
  maxSizeMB = 10,
  acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  // 🔥 Compressão inteligente
  const processFile = async (file) => {
    if (file.type.includes('image')) {
      return await imageCompression(file, {
        maxSizeMB: 0.7,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      });
    }
    return file; // PDF passa direto
  };

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    // 🔍 Validação
    const validFiles = selectedFiles.filter(file => {
      const isValidType = acceptedTypes.includes(file.type);
      const isValidSize = file.size <= maxSizeMB * 1024 * 1024;

      if (!isValidType) {
        toast({
          title: "Tipo inválido",
          description: `${file.name} não é suportado`,
          variant: "destructive"
        });
      }

      if (!isValidSize) {
        toast({
          title: "Arquivo grande demais",
          description: `${file.name} excede ${maxSizeMB}MB`,
          variant: "destructive"
        });
      }

      return isValidType && isValidSize;
    });

    if (!validFiles.length) return;

    setUploading(true);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const processedFile = await processFile(file);

        const fileExt = file.name.split('.').pop();
        const fileName = `${folderPath}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        const { error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, processedFile);

        if (error) {
          console.error("Erro Supabase:", error);
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        return {
          name: file.name,
          size: processedFile.size,
          type: file.type,
          url: publicUrl,
          uploadedAt: new Date().toISOString()
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      onFilesChange([...files, ...uploadedFiles]);

      toast({
        title: "Upload concluído",
        description: `${uploadedFiles.length} arquivo(s) enviado(s)`,
        className: "bg-green-50 border-green-200"
      });

    } catch (error) {
      console.error(error);

      toast({
        title: "Erro no upload",
        description: error.message || "Falha ao enviar",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (type?.includes('image')) return <FileType className="w-8 h-8 text-blue-500" />;
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="space-y-4">

      {/* DROP AREA */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition",
          uploading ? "bg-gray-50" : "hover:bg-gray-50 hover:border-[#1a3a52]"
        )}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept={acceptedTypes.join(',')}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Enviando arquivos...</p>
          </>
        ) : (
          <>
            <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
            <p>Clique ou arraste arquivos</p>
            <p className="text-xs text-gray-500">PDF, JPG, PNG (até {maxSizeMB}MB)</p>
          </>
        )}
      </div>

      {/* LISTA */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {files.map((file, index) => (
            <div key={index} className="flex items-center p-3 border rounded-lg">
              <div className="mr-3">{getFileIcon(file.type)}</div>

              <div className="flex-1">
                <p className="text-sm truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>

              <a href={file.url} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mx-2" />
              </a>

              <button onClick={() => removeFile(index)}>
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
