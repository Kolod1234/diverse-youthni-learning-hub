import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { Box, Button, ButtonGroup, Divider, TextField, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo,
  Image as ImageIcon, Link as LinkIcon, Table as TableIcon,
  Sparkles, AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react';
import { toast } from 'sonner';

export default function AIRichTextEditor({ content, onChange, placeholder }) {
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Underline
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] max-w-none p-4'
      }
    }
  });

  const handleAIAssist = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setAiGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional educational content writer. Create engaging, well-structured content for: ${aiPrompt}

Generate content in HTML format suitable for an e-learning platform. Include:
- Clear headings and subheadings
- Bullet points or numbered lists where appropriate
- Bold and italic text for emphasis
- Short, digestible paragraphs

Make it educational, engaging, and easy to understand.`,
        response_json_schema: null
      });

      if (response.data) {
        // Insert AI-generated content at cursor position
        editor?.commands.insertContent(response.data);
        toast.success('AI content inserted!');
        setShowAIDialog(false);
        setAiPrompt('');
      }
    } catch (error) {
      toast.error('Failed to generate content');
      console.error(error);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleImproveText = async () => {
    const selectedText = editor?.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );

    if (!selectedText) {
      toast.error('Please select text to improve');
      return;
    }

    setAiGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Improve this educational content for better clarity, engagement, and learning outcomes. Keep the same meaning but make it more professional and pedagogically sound:\n\n${selectedText}`,
        response_json_schema: null
      });

      if (response.data) {
        editor?.commands.insertContent(response.data);
        toast.success('Text improved!');
      }
    } catch (error) {
      toast.error('Failed to improve text');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleInsertImage = () => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      setShowImageDialog(false);
      setImageUrl('');
    }
  };

  const handleInsertLink = () => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
      setShowLinkDialog(false);
      setLinkUrl('');
    }
  };

  if (!editor) return null;

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ 
        border: 1, 
        borderColor: 'divider', 
        borderBottom: 0,
        p: 1, 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 1,
        bgcolor: 'grey.50',
        borderRadius: '8px 8px 0 0'
      }}>
        {/* AI Assistance */}
        <ButtonGroup size="small" variant="outlined">
          <Button
            onClick={() => setShowAIDialog(true)}
            sx={{ gap: 0.5 }}
          >
            <Sparkles className="w-4 h-4" />
            AI Generate
          </Button>
          <Button onClick={handleImproveText} disabled={aiGenerating}>
            {aiGenerating ? <CircularProgress size={16} /> : 'Improve'}
          </Button>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Text Formatting */}
        <ButtonGroup size="small" variant="outlined">
          <Button
            onClick={() => editor.chain().focus().toggleBold().run()}
            sx={{ minWidth: 40, bgcolor: editor.isActive('bold') ? 'action.selected' : 'transparent' }}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            sx={{ minWidth: 40, bgcolor: editor.isActive('italic') ? 'action.selected' : 'transparent' }}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            sx={{ minWidth: 40, bgcolor: editor.isActive('underline') ? 'action.selected' : 'transparent' }}
          >
            <UnderlineIcon className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            sx={{ minWidth: 40, bgcolor: editor.isActive('strike') ? 'action.selected' : 'transparent' }}
          >
            <Strikethrough className="w-4 h-4" />
          </Button>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Headings */}
        <ButtonGroup size="small" variant="outlined">
          <Button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            sx={{ bgcolor: editor.isActive('heading', { level: 1 }) ? 'action.selected' : 'transparent' }}
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            sx={{ bgcolor: editor.isActive('heading', { level: 2 }) ? 'action.selected' : 'transparent' }}
          >
            <Heading2 className="w-4 h-4" />
          </Button>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Lists */}
        <ButtonGroup size="small" variant="outlined">
          <Button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            sx={{ bgcolor: editor.isActive('bulletList') ? 'action.selected' : 'transparent' }}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            sx={{ bgcolor: editor.isActive('orderedList') ? 'action.selected' : 'transparent' }}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Alignment */}
        <ButtonGroup size="small" variant="outlined">
          <Button onClick={() => editor.chain().focus().setTextAlign('left').run()}>
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button onClick={() => editor.chain().focus().setTextAlign('center').run()}>
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button onClick={() => editor.chain().focus().setTextAlign('right').run()}>
            <AlignRight className="w-4 h-4" />
          </Button>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Insert Elements */}
        <ButtonGroup size="small" variant="outlined">
          <Button onClick={() => setShowImageDialog(true)}>
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowLinkDialog(true)}>
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}>
            <TableIcon className="w-4 h-4" />
          </Button>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Undo/Redo */}
        <ButtonGroup size="small" variant="outlined">
          <Button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <Redo className="w-4 h-4" />
          </Button>
        </ButtonGroup>
      </Box>

      {/* Editor Content */}
      <Box sx={{ 
        border: 1, 
        borderColor: 'divider', 
        borderRadius: '0 0 8px 8px',
        minHeight: 300,
        bgcolor: 'background.paper'
      }}>
        <EditorContent editor={editor} />
      </Box>

      {/* AI Generate Dialog */}
      <Dialog open={showAIDialog} onClose={() => setShowAIDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI Content Generator</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Describe the content you want to create"
            multiline
            rows={4}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            placeholder="e.g., Explain photosynthesis for GCSE biology students"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAIDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAIAssist}
            disabled={aiGenerating}
            startIcon={aiGenerating ? <CircularProgress size={16} /> : <Sparkles className="w-4 h-4" />}
          >
            {aiGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onClose={() => setShowImageDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Insert Image</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImageDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleInsertImage}>Insert</Button>
        </DialogActions>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onClose={() => setShowLinkDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Insert Link</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLinkDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleInsertLink}>Insert</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}