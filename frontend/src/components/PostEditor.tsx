import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Typography from '@tiptap/extension-typography'
import TextAlign from '@tiptap/extension-text-align'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { useEffect, useCallback } from 'react'

const lowlight = createLowlight(common)

interface PostEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function PostEditor({ content, onChange, placeholder = "Start writing..." }: PostEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800',
        },
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'not-prose',
        },
      }),
      TaskItem.configure({
        nested: true,
      }),
      Typography,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL:', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) {
    return <div className="border border-gray-300 rounded-lg p-4 min-h-[400px] bg-gray-50">Loading editor...</div>
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            editor.isActive('bold') ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
          type="button"
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded text-sm transition italic ${
            editor.isActive('italic') ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
          type="button"
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-3 py-1.5 rounded text-sm transition underline ${
            editor.isActive('underline') ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
          type="button"
        >
          U
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-3 py-1.5 rounded text-sm transition line-through ${
            editor.isActive('strike') ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
          type="button"
        >
          S
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`px-3 py-1.5 rounded text-sm transition ${
            editor.isActive('highlight') ? 'bg-yellow-400 text-gray-900' : 'bg-yellow-100 hover:bg-yellow-200 text-gray-700'
          }`}
          type="button"
        >
          H
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1.5 rounded text-sm font-bold transition ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
          type="button"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1.5 rounded text-sm font-bold transition ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
          type="button"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1.5 rounded text-sm font-bold transition ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
          type="button"
        >
          H3
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 rounded text-sm transition ${
            editor.isActive('bulletList') ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
          type="button"
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 rounded text-sm transition ${
            editor.isActive('orderedList') ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
          type="button"
        >
          1. List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`px-3 py-1.5 rounded text-sm transition ${
            editor.isActive('taskList') ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
          type="button"
        >
          ☑ Tasks
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1.5 rounded text-sm transition ${
            editor.isActive('blockquote') ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
          type="button"
        >
          " Quote
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-3 py-1.5 rounded text-sm font-mono transition ${
            editor.isActive('codeBlock') ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
          type="button"
        >
          {'</>'}
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <button
          onClick={setLink}
          className={`px-3 py-1.5 rounded text-sm transition ${
            editor.isActive('link') ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
          type="button"
        >
          Link
        </button>
        <button
          onClick={addImage}
          className="px-3 py-1.5 rounded text-sm bg-white hover:bg-gray-100 text-gray-700 transition"
          type="button"
        >
          Image
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-3 py-1.5 rounded text-sm bg-white hover:bg-gray-100 text-gray-700 transition"
          type="button"
        >
          ―
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="px-3 py-1.5 rounded text-sm bg-white hover:bg-gray-100 text-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          type="button"
        >
          Undo
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="px-3 py-1.5 rounded text-sm bg-white hover:bg-gray-100 text-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          type="button"
        >
          Redo
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      <style>{`
        .ProseMirror {
          min-height: 400px;
          padding: 1rem;
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror h1 { font-size: 2rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        .ProseMirror p { margin-bottom: 0.75rem; line-height: 1.7; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; margin-bottom: 0.75rem; }
        .ProseMirror blockquote { border-left: 3px solid #e5e7eb; padding-left: 1rem; color: #6b7280; font-style: italic; margin: 1rem 0; }
        .ProseMirror pre { background: #1e1e1e; color: #d4d4d4; border-radius: 8px; padding: 1rem; overflow-x: auto; margin: 1rem 0; }
        .ProseMirror code { background: #f3f4f6; color: #ef4444; padding: 0.125rem 0.375rem; border-radius: 4px; font-size: 0.875em; }
        .ProseMirror pre code { background: none; color: inherit; padding: 0; }
        .ProseMirror mark { background-color: #fef08a; padding: 0.125rem 0; }
        .ProseMirror hr { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
        .ProseMirror img { max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; }
        .ProseMirror a { color: #2563eb; text-decoration: underline; }
        .ProseMirror ul[data-type="taskList"] { list-style: none; padding-left: 0; }
        .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5rem; }
        .ProseMirror ul[data-type="taskList"] li > label { margin-top: 0.25rem; }
        .ProseMirror ul[data-type="taskList"] li > label input { cursor: pointer; }
      `}</style>
    </div>
  )
}
