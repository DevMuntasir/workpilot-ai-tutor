'use client'

import { useState, useRef } from 'react'
import {
  X,
  Upload,
  Trash2,
  CheckCircle,
  FileText,
  ListChecks,
  Layers,
  Headphones,
  GraduationCap,
  PenSquare,
  Edit3,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import axios from 'axios'
import { normalizeStudySetPayload, persistStudySet, type StudySet } from './utils'

type OutputType =
  | 'notes'
  | 'multipleChoice'
  | 'flashcards'
  | 'podcast'
  | 'tutorLesson'
  | 'writtenTests'
  | 'fillInTheBlanks'

const outputOptions: Array<{
  id: OutputType
  label: string
  description: string
  icon: LucideIcon
}> = [
  {
    id: 'notes',
    label: 'Notes',
    description: 'Organized study notes that capture the main ideas.',
    icon: FileText,
  },
  {
    id: 'multipleChoice',
    label: 'Multiple Choice',
    description: 'Auto-graded MCQs with explanations.',
    icon: ListChecks,
  },
  {
    id: 'flashcards',
    label: 'Flashcards',
    description: 'Front/back cards for rapid recall.',
    icon: Layers,
  },
  {
    id: 'podcast',
    label: 'Podcast',
    description: 'Audio-style talking points for listening practice.',
    icon: Headphones,
  },
  {
    id: 'tutorLesson',
    label: 'Tutor Lesson',
    description: 'Dialogue prompts for AI tutor mode.',
    icon: GraduationCap,
  },
  {
    id: 'writtenTests',
    label: 'Written Tests',
    description: 'Open-ended questions to mimic exams.',
    icon: PenSquare,
  },
  {
    id: 'fillInTheBlanks',
    label: 'Fill in the Blanks',
    description: 'Cloze statements that reinforce context clues.',
    icon: Edit3,
  },
]

const totalSteps = 2

interface UploadModalProps {
  onClose: () => void
  onSuccess: (studySet: StudySet) => void
}

export default function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [selectedOutputs, setSelectedOutputs] = useState<OutputType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [studySetName, setStudySetName] = useState('')
  const [step, setStep] = useState<1 | 2>(1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const progressPercent = (step / totalSteps) * 100
  const hasFiles = files.length > 0
  const hasSelections = selectedOutputs.length > 0
  const selectedLabels = outputOptions
    .filter((option) => selectedOutputs.includes(option.id))
    .map((option) => option.label)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const validFiles = selectedFiles.filter(
      (file) =>
        file.size <= 10 * 1024 * 1024 &&
        [
          'image/jpeg',
          'image/png',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'audio/mpeg',
          'audio/wav',
          'video/mp4',
          'video/webm',
        ].includes(file.type)
    )
    setFiles((prev) => [...prev, ...validFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files || [])
    const validFiles = droppedFiles.filter(
      (file) =>
        file.size <= 10 * 1024 * 1024 &&
        [
          'image/jpeg',
          'image/png',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'audio/mpeg',
          'audio/wav',
          'video/mp4',
          'video/webm',
        ].includes(file.type)
    )
    setFiles((prev) => [...prev, ...validFiles])
  }

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index))
  }

  const toggleOutput = (id: OutputType) => {
    setSelectedOutputs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleGenerate = async () => {
    if (!hasFiles || !hasSelections) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))
      formData.append('title', studySetName || 'Untitled Study Set')
      formData.append('studyMethods', JSON.stringify(selectedOutputs))

      const response = await axios.post('/api/study-sets/post', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const data = response.data
      const normalizedSet = normalizeStudySetPayload(
        data?.studySet ?? data?.result ?? data,
        studySetName
      )

      if (!normalizedSet) {
        throw new Error('Failed to create study set: invalid response payload')
      }

      if (typeof data?.warning === 'string' && data.warning.trim()) {
        console.warn('Study set saved locally with warning:', data.warning)
      }

      persistStudySet(normalizedSet)
      onSuccess(normalizedSet)
    } catch (error) {
      console.error('Error creating study set:', error)
      const message = axios.isAxiosError(error)
        ? error.response?.data?.details || error.response?.data?.error || error.message
        : error instanceof Error
          ? error.message
          : 'Failed to create study set. Please try again.'
      alert(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrimaryAction = () => {
    if (step === 1) {
      if (hasFiles) {
        setStep(2)
      }
      return
    }
    handleGenerate()
  }

  const handleSecondaryAction = () => {
    if (step === 2) {
      setStep(1)
      return
    }
    onClose()
  }

  const renderUploadStep = () => (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Upload your materials. We'll auto-convert PDFs, slides, docs, or media into study-ready text.
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/60 transition-colors bg-secondary/30"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,audio/*,video/*"
          className="hidden"
        />
        <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
        <p className="font-semibold text-foreground mb-1">
          Click to upload or drag and drop (max 10 files, 10MB each)
        </p>
        <p className="text-xs text-muted-foreground">
          Supported: PDF, Word, PowerPoint, images, audio, and video
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Uploaded Files ({files.length})
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    handleRemoveFile(idx)
                  }}
                  className="p-1 hover:bg-background rounded transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Study Set Name (optional)
        </label>
        <input
          type="text"
          value={studySetName}
          onChange={(e) => setStudySetName(e.target.value)}
          placeholder="e.g., Biology Chapter 3"
          className="w-full px-3 py-2 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
    </div>
  )

  const renderSelectionStep = () => (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-background/60 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Uploaded files</p>
          <p className="text-xs text-muted-foreground">{files.length} file{files.length > 1 ? 's' : ''} ready</p>
        </div>
        <button
          onClick={() => setStep(1)}
          className="text-xs text-primary font-medium hover:underline"
        >
          Edit uploads
        </button>
      </div>

      <div>
        <p className="text-lg font-semibold text-foreground mb-2">What would you like to include?</p>
        <p className="text-sm text-muted-foreground">
          Choose all the study methods you want in this set. Tutora AI will only generate the experiences you pick.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {outputOptions.map((option) => {
          const Icon = option.icon
          const isSelected = selectedOutputs.includes(option.id)
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleOutput(option.id)}
              className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/40 hover:bg-secondary/30'
              }`}
            >
              <span
                className={`p-3 rounded-xl ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground/80'
                }`}
              >
                <Icon className="w-5 h-5" />
              </span>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl border border-border bg-secondary/30 p-4">
        <p className="text-sm font-semibold text-foreground">
          Selected ({selectedOutputs.length})
        </p>
        {selectedOutputs.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedLabels.map((label) => (
              <span
                key={label}
                className="px-3 py-1 rounded-full bg-background border border-border text-xs text-foreground"
              >
                {label}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-2">
            Pick at least one method to continue.
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-3">
          You can adjust or regenerate any section later from the Study Set dashboard.
        </p>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-3xl w-full max-h-screen overflow-y-auto shadow-2xl">
        <div className="flex items-start justify-between p-6 border-b border-border gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
              Step {step} of {totalSteps}
            </p>
            <h2 className="text-2xl font-bold text-foreground">
              {step === 1 ? 'Please upload your file' : 'Choose your study experiences'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {step === 1
                ? 'We will turn your files into insane study material.'
                : 'Select formats like flashcards, notes, MCQs, and more before generating.'}
            </p>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">{step === 1 ? renderUploadStep() : renderSelectionStep()}</div>

        <div className="flex gap-3 p-6 border-t border-border">
          <button
            onClick={handleSecondaryAction}
            className="flex-1 px-4 py-2.5 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors font-medium"
          >
            {step === 2 ? 'Back' : 'Cancel'}
          </button>
          <button
            onClick={handlePrimaryAction}
            disabled={step === 1 ? !hasFiles : !hasSelections || isLoading}
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-medium"
          >
            {step === 1 ? 'Next' : isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  )
}

