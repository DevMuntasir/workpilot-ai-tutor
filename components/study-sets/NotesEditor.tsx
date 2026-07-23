import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import { TableKit } from '@tiptap/extension-table'
import type { JSONContent } from '@tiptap/core'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Code2,
    Highlighter,
    Italic,
    Link2,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo2,
    Strikethrough,
    Underline,
    Undo2,
} from 'lucide-react'

export type RichNotesEditorRef = {
    getHTML: () => string
    getMarkdown: () => string
    getJSON: () => JSONContent | null
    setHTML: (html: string) => void
    setMarkdown: (markdown: string) => void
    focus: () => void
    clear: () => void
}

type RichNotesEditorProps = {
    /**
     * Markdown received from the backend.
     * When this prop is defined, Markdown becomes the component's source format.
     */
    notesMarkdown?: string

    /**
     * Prevents editing and safely refreshes the rendered Markdown while streaming.
     */
    isStreaming?: boolean

    /**
     * Controlled HTML source. Use this only when notesMarkdown is undefined.
     */
    value?: string

    /**
     * Initial HTML for uncontrolled HTML mode.
     */
    defaultValue?: string

    /**
     * Fires on editor updates with HTML.
     */
    onChange?: (html: string) => void

    /**
     * Fires on editor updates with Markdown, ready to save to notesMarkdown.
     */
    onMarkdownChange?: (markdown: string) => void

    /**
     * Fires on editor updates with TipTap JSON.
     */
    onJSONChange?: (json: JSONContent) => void

    /**
     * Fires after the editor is ready.
     */
    onReady?: (payload: {
        getHTML: () => string
        getMarkdown: () => string
        getJSON: () => JSONContent | null
        focus: () => void
    }) => void

    editable?: boolean
    placeholder?: string
    className?: string
    contentClassName?: string
    showToolbar?: boolean
    showBubbleMenu?: boolean

    /**
     * Delay used only while streaming Markdown into the editor.
     */
    streamingUpdateDelay?: number
}

function normalizeMarkdown(markdown: string): string {
    return markdown
        .replace(/\r\n?/g, '\n')
        .replace(/\u00a0/g, ' ')
        .replace(/[ \t]+$/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}

function markdownToHtml(markdown: string): string {
    const normalized = normalizeMarkdown(markdown)

    if (!normalized) {
        return ''
    }

    return unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeSanitize)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .processSync(normalized)
        .toString()
}

function createTurndownService(): TurndownService {
    const service = new TurndownService({
        headingStyle: 'atx',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced',
        emDelimiter: '*',
        strongDelimiter: '**',
    })

    service.use(gfm)

    // Plain Markdown has no standard highlight syntax. Preserve the text content
    // instead of producing syntax that would render incorrectly after reloading.
    service.addRule('removeHighlightMarkup', {
        filter: ['mark'],
        replacement: (content) => content,
    })

    return service
}

function ToolbarDivider() {
    return <span className="mx-1 h-5 w-px shrink-0 bg-[#dfe3ea]" />
}

function ToolbarButton({
    active = false,
    disabled = false,
    label,
    onClick,
    children,
}: {
    active?: boolean
    disabled?: boolean
    label: string
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            onClick={onClick}
            className={[
                'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                'transition-colors disabled:pointer-events-none disabled:opacity-30',
                active
                    ? 'bg-[#e8ebff] text-[#4f5bd5]'
                    : 'text-[#5b6472] hover:bg-[#f0f2f5] hover:text-[#111827]',
            ].join(' ')}
        >
            {children}
        </button>
    )
}

export const NotesEditor = forwardRef<RichNotesEditorRef, RichNotesEditorProps>(
    function NotesEditor(
        {
            notesMarkdown,
            isStreaming = false,
            value,
            defaultValue,
            onChange,
            onMarkdownChange,
            onJSONChange,
            onReady,
            editable = true,
            placeholder = 'Start writing your notes...',
            className = '',
            contentClassName = '',
            showToolbar = true,
            showBubbleMenu = true,
            streamingUpdateDelay = 80,
        },
        ref,
    ) {
        const turndownService = useMemo(() => createTurndownService(), [])
        const usesMarkdownSource = notesMarkdown !== undefined

        const generatedHtml = useMemo(
            () => markdownToHtml(notesMarkdown ?? ''),
            [notesMarkdown],
        )

        const initialContent = usesMarkdownSource
            ? generatedHtml
            : value ?? defaultValue ?? ''

        const isEditorEditable = editable && !isStreaming

        const onChangeRef = useRef(onChange)
        const onMarkdownChangeRef = useRef(onMarkdownChange)
        const onJSONChangeRef = useRef(onJSONChange)
        const onReadyRef = useRef(onReady)
        const streamingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
        const lastEmittedHtmlRef = useRef('')
        const lastEmittedMarkdownRef = useRef('')

        useEffect(() => {
            onChangeRef.current = onChange
            onMarkdownChangeRef.current = onMarkdownChange
            onJSONChangeRef.current = onJSONChange
            onReadyRef.current = onReady
        }, [onChange, onJSONChange, onMarkdownChange, onReady])

        const editor = useEditor({
            extensions: [
                StarterKit.configure({
                    heading: {
                        levels: [1, 2, 3, 4, 5],
                    },
                    link: {
                        openOnClick: false,
                        autolink: true,
                        HTMLAttributes: {
                            rel: 'noopener noreferrer nofollow',
                            target: '_blank',
                        },
                    },
                }),
                Highlight.configure({
                    multicolor: false,
                }),
                Placeholder.configure({
                    placeholder,
                }),
                TextAlign.configure({
                    types: ['heading', 'paragraph'],
                    alignments: ['left', 'center', 'right'],
                }),
                TableKit.configure({
                    table: {
                        resizable: true,
                    },
                }),
            ],
            content: initialContent,
            editable: isEditorEditable,
            immediatelyRender: false,
            editorProps: {
                attributes: {
                    spellcheck: 'true',
                    class: [
                        'mx-auto min-h-[680px] w-full max-w-[880px] px-1 py-6',
                        'font-sans text-[14px] leading-[1.68] text-[#263244] caret-primary focus:outline-none',
                        'sm:px-4 sm:py-8',

                        '[&>*:first-child]:mt-0',
                        '[&>*:last-child]:mb-0',

                        '[&_h1]:mb-3 [&_h1]:mt-0 [&_h1]:text-[24px] [&_h1]:font-bold',
                        '[&_h1]:leading-[1.18] [&_h1]:tracking-[-0.025em] [&_h1]:text-[#0b1220]',

                        '[&_h2]:mb-2 [&_h2]:mt-7 [&_h2]:border-b [&_h2]:border-[#e7eaf0]',
                        '[&_h2]:pb-2 [&_h2]:text-[17px] [&_h2]:font-semibold [&_h2]:leading-[1.3]',
                        '[&_h2]:tracking-[-0.015em] [&_h2]:text-[#111827]',

                        '[&_h3]:mb-1.5 [&_h3]:mt-5 [&_h3]:text-[15px] [&_h3]:font-semibold',
                        '[&_h3]:leading-[1.35] [&_h3]:text-[#182235]',

                        '[&_h4]:mb-1.5 [&_h4]:mt-4 [&_h4]:text-[14px] [&_h4]:font-semibold',
                        '[&_h4]:leading-[1.4] [&_h4]:text-[#1f2937]',

                        '[&_h5]:mb-1 [&_h5]:mt-4 [&_h5]:text-[13px] [&_h5]:font-semibold',
                        '[&_h5]:uppercase [&_h5]:tracking-[0.04em] [&_h5]:text-[#364152]',

                        '[&_p]:my-0 [&_p]:mb-3 [&_p]:text-[#354052]',
                        '[&_h1+p]:mt-0 [&_h2+p]:mt-0 [&_h3+p]:mt-0',

                        '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6',
                        '[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6',
                        '[&_li]:mb-1.5 [&_li]:pl-0.5 [&_li]:leading-[1.65] [&_li]:text-[#354052]',
                        '[&_li::marker]:font-semibold [&_li::marker]:text-[#6670d8]',
                        '[&_li_p]:mb-1',

                        '[&_strong]:font-semibold [&_strong]:text-[#182235]',
                        '[&_em]:text-[#354052]',

                        '[&_a]:font-medium [&_a]:text-[#4f5bd5] [&_a]:underline',
                        '[&_a]:decoration-[#b7bdf2] [&_a]:underline-offset-2',

                        '[&_blockquote]:my-4 [&_blockquote]:border-l-[3px] [&_blockquote]:border-[#6670d8]',
                        '[&_blockquote]:bg-[#f7f8ff] [&_blockquote]:px-4 [&_blockquote]:py-2.5',
                        '[&_blockquote]:text-[#3b4660]',
                        '[&_blockquote_p]:m-0 [&_blockquote_p]:text-[#3b4660]',

                        '[&_hr]:my-5 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-[#dfe3ea]',

                        '[&_mark]:rounded-sm [&_mark]:bg-[#fff0a8] [&_mark]:px-0.5 [&_mark]:text-inherit',

                        '[&_code]:rounded [&_code]:bg-[#f2f4f7] [&_code]:px-1.5 [&_code]:py-0.5',
                        '[&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-[#b42318]',

                        '[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg',
                        '[&_pre]:bg-[#111827] [&_pre]:p-4 [&_pre]:text-[#e5e7eb]',
                        '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[#e5e7eb]',

                        '[&_table]:my-5 [&_table]:w-full [&_table]:table-fixed [&_table]:border-collapse',
                        '[&_table]:overflow-hidden [&_table]:rounded-md [&_table]:border [&_table]:border-[#dfe3ea]',
                        '[&_th]:border [&_th]:border-[#dfe3ea] [&_th]:bg-[#f7f8fa] [&_th]:px-3',
                        '[&_th]:py-2 [&_th]:text-left [&_th]:text-[13px] [&_th]:font-semibold [&_th]:text-[#263244]',
                        '[&_td]:border [&_td]:border-[#e4e7ec] [&_td]:px-3 [&_td]:py-2',
                        '[&_td]:align-top [&_td]:text-[13px] [&_td]:text-[#354052]',
                        '[&_.selectedCell]:relative [&_.selectedCell]:bg-[#eef0ff]',

                        '[&_.is-editor-empty:first-child::before]:pointer-events-none',
                        '[&_.is-editor-empty:first-child::before]:float-left',
                        '[&_.is-editor-empty:first-child::before]:h-0',
                        '[&_.is-editor-empty:first-child::before]:text-[#98a2b3]',
                        '[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',

                        contentClassName,
                    ].join(' '),
                },
            },
            onUpdate: ({ editor: currentEditor }) => {
                const html = currentEditor.getHTML()
                const markdown = normalizeMarkdown(
                    turndownService.turndown(html),
                )
                const json = currentEditor.getJSON()

                lastEmittedHtmlRef.current = html
                lastEmittedMarkdownRef.current = markdown

                onChangeRef.current?.(html)
                onMarkdownChangeRef.current?.(markdown)
                onJSONChangeRef.current?.(json)
            },
        })

        useEffect(() => {
            if (!editor) return
            editor.setEditable(isEditorEditable)
        }, [editor, isEditorEditable])

        // Markdown mode: synchronize backend Markdown without resetting the cursor
        // after changes that originated from this same editor.
        useEffect(() => {
            if (!editor || !usesMarkdownSource) return

            const incomingMarkdown = normalizeMarkdown(notesMarkdown ?? '')

            if (
                !isStreaming &&
                incomingMarkdown === lastEmittedMarkdownRef.current
            ) {
                return
            }

            const applyMarkdown = () => {
                const currentHtml = editor.getHTML()

                if (currentHtml !== generatedHtml) {
                    editor.commands.setContent(generatedHtml, {
                        emitUpdate: false,
                    })
                }
            }

            if (isStreaming) {
                if (streamingTimerRef.current) {
                    clearTimeout(streamingTimerRef.current)
                }

                streamingTimerRef.current = setTimeout(
                    applyMarkdown,
                    Math.max(0, streamingUpdateDelay),
                )

                return
            }

            if (streamingTimerRef.current) {
                clearTimeout(streamingTimerRef.current)
                streamingTimerRef.current = null
            }

            applyMarkdown()
        }, [
            editor,
            generatedHtml,
            isStreaming,
            notesMarkdown,
            streamingUpdateDelay,
            usesMarkdownSource,
        ])

        // HTML mode: synchronize a controlled HTML value.
        useEffect(() => {
            if (
                !editor ||
                usesMarkdownSource ||
                isStreaming ||
                value === undefined
            ) {
                return
            }

            if (value === lastEmittedHtmlRef.current) {
                return
            }

            if (editor.getHTML() !== value) {
                editor.commands.setContent(value, {
                    emitUpdate: false,
                })
            }
        }, [editor, isStreaming, usesMarkdownSource, value])

        useEffect(() => {
            if (!editor) return

            const ready = onReadyRef.current
            if (!ready) return

            ready({
                getHTML: () => editor.getHTML(),
                getMarkdown: () =>
                    normalizeMarkdown(
                        turndownService.turndown(editor.getHTML()),
                    ),
                getJSON: () => editor.getJSON(),
                focus: () => editor.chain().focus().run(),
            })
        }, [editor, onReady, turndownService])

        useEffect(() => {
            return () => {
                if (streamingTimerRef.current) {
                    clearTimeout(streamingTimerRef.current)
                }
            }
        }, [])

        useImperativeHandle(
            ref,
            () => ({
                getHTML: () => editor?.getHTML() ?? '',
                getMarkdown: () => {
                    if (!editor) return ''

                    return normalizeMarkdown(
                        turndownService.turndown(editor.getHTML()),
                    )
                },
                getJSON: () => editor?.getJSON() ?? null,
                setHTML: (html: string) => {
                    editor?.commands.setContent(html, {
                        emitUpdate: false,
                    })
                },
                setMarkdown: (markdown: string) => {
                    editor?.commands.setContent(markdownToHtml(markdown), {
                        emitUpdate: false,
                    })
                },
                focus: () => {
                    editor?.chain().focus().run()
                },
                clear: () => {
                    editor?.commands.clearContent()
                },
            }),
            [editor, turndownService],
        )

        if (!editor) {
            return (
                <div
                    className={[
                        'min-h-[680px] w-full max-w-[1000px] overflow-hidden rounded-md',
                        'border border-[#dfe3ea] bg-white',
                        className,
                    ].join(' ')}
                >
                    {showToolbar && (
                        <div className="h-10 border-b border-[#e4e7ec] bg-[#fafbfc]" />
                    )}
                </div>
            )
        }

        const activeHeading = ([1, 2, 3, 4, 5] as const).find((level) =>
            editor.isActive('heading', { level }),
        )

        const updateLink = () => {
            const previousUrl = editor.getAttributes('link').href as
                | string
                | undefined
            const url = window.prompt(
                'Paste a link',
                previousUrl ?? 'https://',
            )

            if (url === null) return

            if (!url.trim()) {
                editor
                    .chain()
                    .focus()
                    .extendMarkRange('link')
                    .unsetLink()
                    .run()
                return
            }

            editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: url.trim() })
                .run()
        }

        return (
            <div
                className={[
                    'rich-notes-editor-root w-full max-w-[1000px] overflow-hidden',
                    'rounded-md border border-[#dfe3ea] bg-white',
                    className,
                ].join(' ')}
            >
                {showToolbar && !isStreaming && (
                    <div className="sticky top-0 z-20 border-b border-[#e4e7ec] bg-white/95 px-2 py-1.5 backdrop-blur">
                        <div className="flex items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <ToolbarButton
                                label="Undo"
                                disabled={
                                    !editor.can().chain().focus().undo().run()
                                }
                                onClick={() =>
                                    editor.chain().focus().undo().run()
                                }
                            >
                                <Undo2 className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarButton
                                label="Redo"
                                disabled={
                                    !editor.can().chain().focus().redo().run()
                                }
                                onClick={() =>
                                    editor.chain().focus().redo().run()
                                }
                            >
                                <Redo2 className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarDivider />

                            <select
                                aria-label="Text style"
                                value={
                                    activeHeading
                                        ? `h${activeHeading}`
                                        : 'paragraph'
                                }
                                onChange={(event) => {
                                    const block = event.target.value

                                    if (block === 'paragraph') {
                                        editor
                                            .chain()
                                            .focus()
                                            .setParagraph()
                                            .run()
                                        return
                                    }

                                    editor
                                        .chain()
                                        .focus()
                                        .setHeading({
                                            level: Number(
                                                block.slice(1),
                                            ) as 1 | 2 | 3 | 4 | 5,
                                        })
                                        .run()
                                }}
                                className="h-7 min-w-[104px] cursor-pointer rounded-md border-0 bg-transparent px-2 text-xs font-medium text-[#344054] outline-none hover:bg-[#f2f4f7]"
                            >
                                <option value="paragraph">Normal text</option>
                                <option value="h1">Title</option>
                                <option value="h2">Heading 1</option>
                                <option value="h3">Heading 2</option>
                                <option value="h4">Heading 3</option>
                                <option value="h5">Small heading</option>
                            </select>

                            <ToolbarDivider />

                            <ToolbarButton
                                label="Bold"
                                active={editor.isActive('bold')}
                                onClick={() =>
                                    editor.chain().focus().toggleBold().run()
                                }
                            >
                                <Bold className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarButton
                                label="Italic"
                                active={editor.isActive('italic')}
                                onClick={() =>
                                    editor.chain().focus().toggleItalic().run()
                                }
                            >
                                <Italic className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarButton
                                label="Underline"
                                active={editor.isActive('underline')}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleUnderline()
                                        .run()
                                }
                            >
                                <Underline className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarButton
                                label="Strikethrough"
                                active={editor.isActive('strike')}
                                onClick={() =>
                                    editor.chain().focus().toggleStrike().run()
                                }
                            >
                                <Strikethrough className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarDivider />

                            <ToolbarButton
                                label="Bullet list"
                                active={editor.isActive('bulletList')}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleBulletList()
                                        .run()
                                }
                            >
                                <List className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarButton
                                label="Numbered list"
                                active={editor.isActive('orderedList')}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleOrderedList()
                                        .run()
                                }
                            >
                                <ListOrdered className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarButton
                                label="Quote"
                                active={editor.isActive('blockquote')}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleBlockquote()
                                        .run()
                                }
                            >
                                <Quote className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarDivider />

                            <ToolbarButton
                                label="Align left"
                                active={editor.isActive({
                                    textAlign: 'left',
                                })}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setTextAlign('left')
                                        .run()
                                }
                            >
                                <AlignLeft className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarButton
                                label="Align center"
                                active={editor.isActive({
                                    textAlign: 'center',
                                })}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setTextAlign('center')
                                        .run()
                                }
                            >
                                <AlignCenter className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarButton
                                label="Align right"
                                active={editor.isActive({
                                    textAlign: 'right',
                                })}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setTextAlign('right')
                                        .run()
                                }
                            >
                                <AlignRight className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarDivider />

                            <ToolbarButton
                                label="Highlight"
                                active={editor.isActive('highlight')}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleHighlight()
                                        .run()
                                }
                            >
                                <Highlighter className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarButton
                                label="Inline code"
                                active={editor.isActive('code')}
                                onClick={() =>
                                    editor.chain().focus().toggleCode().run()
                                }
                            >
                                <Code2 className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarButton
                                label={
                                    editor.isActive('link')
                                        ? 'Edit link'
                                        : 'Add link'
                                }
                                active={editor.isActive('link')}
                                onClick={updateLink}
                            >
                                <Link2 className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarButton
                                label="Divider"
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setHorizontalRule()
                                        .run()
                                }
                            >
                                <Minus className="h-3.5 w-3.5" />
                            </ToolbarButton>
                        </div>
                    </div>
                )}

                {showBubbleMenu && isEditorEditable && (
                    <BubbleMenu editor={editor}>
                        <div className="flex items-center gap-0.5 rounded-lg border border-[#dfe3ea] bg-white p-1 shadow-lg">
                            <ToolbarButton
                                label="Bold"
                                active={editor.isActive('bold')}
                                onClick={() =>
                                    editor.chain().focus().toggleBold().run()
                                }
                            >
                                <Bold className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarButton
                                label="Italic"
                                active={editor.isActive('italic')}
                                onClick={() =>
                                    editor.chain().focus().toggleItalic().run()
                                }
                            >
                                <Italic className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarButton
                                label="Highlight"
                                active={editor.isActive('highlight')}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleHighlight()
                                        .run()
                                }
                            >
                                <Highlighter className="h-3.5 w-3.5" />
                            </ToolbarButton>

                            <ToolbarButton
                                label={
                                    editor.isActive('link')
                                        ? 'Edit link'
                                        : 'Add link'
                                }
                                active={editor.isActive('link')}
                                onClick={updateLink}
                            >
                                <Link2 className="h-3.5 w-3.5" />
                            </ToolbarButton>
                        </div>
                    </BubbleMenu>
                )}

                <div
                    data-note-scroll-container
                    className="px-4 pb-20 sm:px-6"
                >
                    <EditorContent editor={editor} />
                </div>
            </div>
        )
    },
)