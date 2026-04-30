'use client'

import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Bot, LoaderCircle, Pencil, Plus, RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  createAdminModelConfig,
  fetchAdminModelConfigs,
  getApiClientErrorMessage,
  updateAdminModelConfig,
  type AdminModelConfig,
  type CreateAdminModelConfigPayload,
  type ModelProvider,
} from '@/lib/api'

const PROVIDERS: ModelProvider[] = ['anthropic', 'cloudflare', 'elevenlabs']

type ModelConfigFormValues = {
  model_name: string
  provider: ModelProvider
  task_type: string
  token_multiplier: string
  fallback_model_name: string
  fallback_provider: 'none' | ModelProvider
  is_active: boolean
  model_version: string
  rollout_percentage: string
}

function createDefaultFormValues(): ModelConfigFormValues {
  return {
    model_name: '',
    provider: 'anthropic',
    task_type: '',
    token_multiplier: '1',
    fallback_model_name: '',
    fallback_provider: 'none',
    is_active: true,
    model_version: '',
    rollout_percentage: '0',
  }
}

function getFormValuesFromConfig(config: AdminModelConfig): ModelConfigFormValues {
  return {
    model_name: config.model_name,
    provider: config.provider,
    task_type: config.task_type,
    token_multiplier: String(config.token_multiplier),
    fallback_model_name: config.fallback_model_name ?? '',
    fallback_provider: config.fallback_provider ?? 'none',
    is_active: config.is_active,
    model_version: config.model_version ?? '',
    rollout_percentage: String(config.rollout_percentage),
  }
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'N/A'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function buildPayload(values: ModelConfigFormValues): CreateAdminModelConfigPayload {
  const tokenMultiplier = Number(values.token_multiplier)
  const rolloutPercentage = Number(values.rollout_percentage)
  const fallbackModelName = values.fallback_model_name.trim()
  const modelVersion = values.model_version.trim()

  if (!values.model_name.trim()) {
    throw new Error('Model name is required.')
  }

  if (!values.task_type.trim()) {
    throw new Error('Task type is required.')
  }

  if (!Number.isFinite(tokenMultiplier)) {
    throw new Error('Token multiplier must be a valid number.')
  }

  if (!Number.isFinite(rolloutPercentage) || rolloutPercentage < 0 || rolloutPercentage > 100) {
    throw new Error('Rollout percentage must be between 0 and 100.')
  }

  return {
    model_name: values.model_name.trim(),
    provider: values.provider,
    task_type: values.task_type.trim(),
    token_multiplier: tokenMultiplier,
    fallback_model_name: fallbackModelName || null,
    fallback_provider: values.fallback_provider === 'none' ? null : values.fallback_provider,
    is_active: values.is_active,
    model_version: modelVersion || null,
    rollout_percentage: rolloutPercentage,
  }
}

function ModelConfigForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}: {
  values: ModelConfigFormValues
  onChange: (nextValues: ModelConfigFormValues) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel?: () => void
  isSubmitting: boolean
  submitLabel: string
}) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="model-name">Model Name</Label>
          <Input
            id="model-name"
            value={values.model_name}
            onChange={(event) => onChange({ ...values, model_name: event.target.value })}
            placeholder="eleven_flash_v2_5"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-type">Task Type</Label>
          <Input
            id="task-type"
            value={values.task_type}
            onChange={(event) => onChange({ ...values, task_type: event.target.value })}
            placeholder="audio_voice"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label>Provider</Label>
          <Select
            value={values.provider}
            onValueChange={(value) => onChange({ ...values, provider: value as ModelProvider })}
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model-version">Model Version</Label>
          <Input
            id="model-version"
            value={values.model_version}
            onChange={(event) => onChange({ ...values, model_version: event.target.value })}
            placeholder="Optional"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="token-multiplier">Token Multiplier</Label>
          <Input
            id="token-multiplier"
            type="number"
            step="0.01"
            value={values.token_multiplier}
            onChange={(event) => onChange({ ...values, token_multiplier: event.target.value })}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rollout-percentage">Rollout Percentage</Label>
          <Input
            id="rollout-percentage"
            type="number"
            min="0"
            max="100"
            step="1"
            value={values.rollout_percentage}
            onChange={(event) => onChange({ ...values, rollout_percentage: event.target.value })}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fallback-model-name">Fallback Model Name</Label>
          <Input
            id="fallback-model-name"
            value={values.fallback_model_name}
            onChange={(event) => onChange({ ...values, fallback_model_name: event.target.value })}
            placeholder="Optional"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label>Fallback Provider</Label>
          <Select
            value={values.fallback_provider}
            onValueChange={(value) =>
              onChange({ ...values, fallback_provider: value as ModelConfigFormValues['fallback_provider'] })
            }
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select fallback provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {PROVIDERS.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Active</p>
          <p className="text-xs text-muted-foreground">Inactive configs remain saved but are not used.</p>
        </div>
        <Switch
          checked={values.is_active}
          onCheckedChange={(checked) => onChange({ ...values, is_active: checked })}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}

export default function AdminModelsPage() {
  const [configs, setConfigs] = useState<AdminModelConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createValues, setCreateValues] = useState<ModelConfigFormValues>(createDefaultFormValues)
  const [isCreating, setIsCreating] = useState(false)
  const [editingConfig, setEditingConfig] = useState<AdminModelConfig | null>(null)
  const [editValues, setEditValues] = useState<ModelConfigFormValues>(createDefaultFormValues)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const abortController = new AbortController()

    async function loadConfigs() {
      setErrorMessage('')
      setIsLoading(true)

      try {
        const result = await fetchAdminModelConfigs(abortController.signal)
        setConfigs(result)
      } catch (error) {
        if (abortController.signal.aborted) {
          return
        }

        setConfigs([])
        setErrorMessage(getApiClientErrorMessage(error, 'Failed to load model configs.'))
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    }

    void loadConfigs()

    return () => {
      abortController.abort()
    }
  }, [reloadKey])

  const activeCount = useMemo(
    () => configs.filter((config) => config.is_active).length,
    [configs],
  )

  const handleRefresh = () => {
    setSuccessMessage('')
    setIsRefreshing(true)
    setReloadKey((current) => current + 1)
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isCreating) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')

    let payload: CreateAdminModelConfigPayload

    try {
      payload = buildPayload(createValues)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Invalid form values.')
      return
    }

    setIsCreating(true)

    try {
      await createAdminModelConfig(payload)
      setSuccessMessage(`Created model config for ${payload.model_name}.`)
      setCreateValues(createDefaultFormValues())
      setIsCreateDialogOpen(false)
      setReloadKey((current) => current + 1)
    } catch (error) {
      setErrorMessage(getApiClientErrorMessage(error, 'Failed to create model config.'))
    } finally {
      setIsCreating(false)
    }
  }

  const openEditDialog = (config: AdminModelConfig) => {
    setErrorMessage('')
    setSuccessMessage('')
    setEditingConfig(config)
    setEditValues(getFormValuesFromConfig(config))
  }

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!editingConfig || isUpdating) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')

    let payload: CreateAdminModelConfigPayload

    try {
      payload = buildPayload(editValues)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Invalid form values.')
      return
    }

    setIsUpdating(true)

    try {
      await updateAdminModelConfig(editingConfig.id, payload)
      setSuccessMessage(`Updated model config for ${payload.model_name}.`)
      setEditingConfig(null)
      setReloadKey((current) => current + 1)
    } catch (error) {
      setErrorMessage(getApiClientErrorMessage(error, 'Failed to update model config.'))
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <section className="p-4 md:p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Models
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {configs.length} total configs, {activeCount} active.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={() => {
                setErrorMessage('')
                setSuccessMessage('')
                setCreateValues(createDefaultFormValues())
                setIsCreateDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Create Config
            </Button>
            <Button type="button" variant="outline" onClick={handleRefresh} disabled={isLoading || isRefreshing}>
              {isRefreshing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-300/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <div className="rounded-3xl border border-border bg-card shadow-sm">
          <div className="p-5">
            {isLoading ? (
              <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Loading model configs...
              </div>
            ) : configs.length === 0 ? (
              <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
                No model configs found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Type</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Fallback</TableHead>
                    <TableHead>Token Multiplier</TableHead>
                    <TableHead>Rollout</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rolled Out At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">{config.task_type}</TableCell>
                      <TableCell className="uppercase">{config.provider}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{config.model_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {config.model_version ?? 'No version'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {config.fallback_model_name ? (
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{config.fallback_model_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {config.fallback_provider ?? 'No provider'}
                            </p>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>{config.token_multiplier}</TableCell>
                      <TableCell>{config.rollout_percentage}%</TableCell>
                      <TableCell>
                        <Badge variant={config.is_active ? 'default' : 'secondary'}>
                          {config.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(config.rolled_out_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(config)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Model Config</DialogTitle>
            <DialogDescription>
              Add a new model configuration for admin-controlled rollout.
            </DialogDescription>
          </DialogHeader>
          <ModelConfigForm
            values={createValues}
            onChange={setCreateValues}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={isCreating}
            submitLabel="Create Config"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingConfig)} onOpenChange={(open) => !open && setEditingConfig(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Model Config</DialogTitle>
            <DialogDescription>
              Update the selected model configuration and save the changes.
            </DialogDescription>
          </DialogHeader>
          <ModelConfigForm
            values={editValues}
            onChange={setEditValues}
            onSubmit={handleUpdate}
            onCancel={() => setEditingConfig(null)}
            isSubmitting={isUpdating}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>
    </section>
  )
}
