'use client'

import { useState, useRef } from 'react'
import { X, Upload, Trash2, CheckCircle } from 'lucide-react'

interface GraderUploadModalProps {
  onClose: () => void
  onSuccess: (result: any) => void
}

export default function GraderUploadModal({
  onClose,
  onSuccess,
}: GraderUploadModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [content, setContent] = useState('')
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const validFiles = selectedFiles.filter(
      (file) =>
        file.size <= 50 * 1024 * 1024 && // 50MB limit
        ['application/pdf', 'text/plain'].includes(file.type)
    )
    setFiles(validFiles)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files || [])
    const validFiles = droppedFiles.filter(
      (file) =>
        file.size <= 50 * 1024 * 1024 &&
        ['application/pdf', 'text/plain'].includes(file.type)
    )
    setFiles(validFiles)
  }

  const handleGrade = async () => {
    if ((inputMode === 'file' && files.length === 0) || (inputMode === 'text' && !content.trim()))
      return

    setIsLoading(true)
    try {
      const formData = new FormData()

      if (inputMode === 'file') {
        files.forEach((file) => {
          formData.append('files', file)
        })
      } else {
        formData.append('text', content)
      }

      const response = await fetch('/api/paper-grader/grade', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to grade paper')

      const data = await response.json()
      onSuccess(data.result)
    } catch (error) {
      console.error('Error grading paper:', error)
      alert('Failed to grade paper. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Grade Your Paper</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Mode Selector */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setInputMode('file')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              inputMode === 'file'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Upload PDF/File
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              inputMode === 'text'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Paste Text
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {inputMode === 'file' ? (
            <>
              <p className="text-muted-foreground">
                Upload a PDF or text file of your paper or essay
              </p>

              {/* File Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,text/plain"
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
                <p className="font-semibold text-foreground mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF or TXT files (Max 50MB)
                </p>
              </div>

              {/* File Display */}
              {files.length > 0 && (
                <div className="p-3 bg-secondary/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {files[0].name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(files[0].size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFiles([])}
                    className="p-1 hover:bg-background rounded transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                Paste your essay or paper text to get AI-powered feedback
              </p>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your paper, essay, or assignment text here..."
                className="w-full h-64 px-3 py-3 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {content.length} characters
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleGrade}
            disabled={
              (inputMode === 'file' && files.length === 0) ||
              (inputMode === 'text' && !content.trim()) ||
              isLoading
            }
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-medium"
          >
            {isLoading ? 'Grading...' : 'Grade Paper'}
          </button>
        </div>
      </div>
    </div>
  )
}
