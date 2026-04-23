'use client'

import { useRef, useState } from 'react'
import { CheckCircle, FileText, Upload, X } from 'lucide-react'
import {
  normalizeSyllabusResultPayload,
  persistSyllabusResult,
  type SyllabusIntelligenceResult,
} from './utils'

interface SyllabusUploadModalProps {
  onClose: () => void
  onSuccess: (result: SyllabusIntelligenceResult) => void
}

export default function SyllabusUploadModal({ onClose, onSuccess }: SyllabusUploadModalProps) {
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file')
  const [files, setFiles] = useState<File[]>([])
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [semesterWeeks, setSemesterWeeks] = useState('16')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || [])
    const valid = selected.filter((file) => file.size <= 20 * 1024 * 1024)
    setFiles(valid)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const dropped = Array.from(event.dataTransfer.files || [])
    const valid = dropped.filter((file) => file.size <= 20 * 1024 * 1024)
    setFiles(valid)
  }

  const canSubmit =
    !isLoading &&
    ((inputMode === 'file' && files.length > 0) || (inputMode === 'text' && text.trim().length > 0))

  const handleAnalyze = async () => {
    if (!canSubmit) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', title || 'Untitled Syllabus')
      formData.append('semesterWeeks', semesterWeeks || '16')

      if (inputMode === 'file') {
        files.forEach((file) => formData.append('files', file))
      } else {
        formData.append('text', text)
      }

      const response = await fetch('/api/syllabus-intelligence/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}))
        throw new Error(errorPayload?.error || 'Failed to analyze syllabus')
      }

      const payload = await response.json()
      const normalized = normalizeSyllabusResultPayload(payload?.result ?? payload, title)

      if (!normalized) {
        throw new Error('Unexpected response from syllabus analysis')
      }

      persistSyllabusResult(normalized)
      onSuccess(normalized)
    } catch (error) {
      console.error('Error analyzing syllabus:', error)
      alert(error instanceof Error ? error.message : 'Failed to analyze syllabus')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
      <div className="w-full max-w-3xl max-h-screen overflow-y-auto rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Syllabus Intelligence</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-border">
          <button
            onClick={() => setInputMode('file')}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              inputMode === 'file'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Upload Syllabus
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              inputMode === 'text'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Paste Course Outline
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Course Title</label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g., Data Structures and Algorithms"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Semester Length (weeks)</label>
              <input
                type="number"
                min={8}
                max={24}
                value={semesterWeeks}
                onChange={(event) => setSemesterWeeks(event.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {inputMode === 'file' ? (
            <>
              <p className="text-sm text-muted-foreground">
                Upload syllabus files, course outlines, assignment sheets, or instructor notes.
              </p>
              <div
                onDrop={handleDrop}
                onDragOver={(event) => event.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-secondary/30 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
                <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, TXT up to 20MB</p>
              </div>

              {files.length > 0 && (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="rounded-lg bg-secondary/40 p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Paste your complete syllabus or weekly course outline for deeper AI planning.
              </p>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste full syllabus, weekly schedule, grading breakdown, and assignment details..."
                className="w-full h-64 px-3 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              <p className="text-xs text-muted-foreground">{text.length} characters</p>
            </>
          )}
        </div>

        <div className="p-6 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!canSubmit}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
          >
            {isLoading ? (
              'Analyzing...'
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate Intelligence
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
