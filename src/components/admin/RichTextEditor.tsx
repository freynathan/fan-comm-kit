import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube,
  AtSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

function youtubeIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/");
    const i = parts.indexOf("embed");
    if (i >= 0) return parts[i + 1] ?? null;
    return null;
  } catch {
    return null;
  }
}

export function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm md:prose max-w-none min-h-[320px] p-4 focus:outline-none [&_iframe]:my-4 [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-md [&_p]:text-base [&_p]:leading-[1.75] [&_li]:text-base [&_li]:leading-[1.75] [&_h1]:text-[2.25rem] [&_h1]:leading-[1.2] [&_h1]:font-bold [&_h1]:mt-10 [&_h1]:mb-4 [&_h2]:text-[1.75rem] [&_h2]:leading-[1.25] [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-[1.375rem] [&_h3]:leading-[1.3] [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const insertLink = () => {
    const url = prompt("Enter URL");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  const insertImage = () => {
    const url = prompt("Image URL");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };
  const insertYoutube = () => {
    const url = prompt("YouTube URL");
    if (!url) return;
    const id = youtubeIdFromUrl(url);
    if (!id) {
      alert("Could not parse YouTube URL");
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent(
        `<iframe src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe><p></p>`,
      )
      .run();
  };
  const insertSocial = () => {
    const url = prompt("Tweet / X / Instagram post URL");
    if (!url) return;
    let html = "";
    if (/twitter\.com|x\.com/.test(url)) {
      html = `<blockquote class="twitter-tweet"><a href="${url}">${url}</a></blockquote><p></p>`;
    } else if (/instagram\.com/.test(url)) {
      html = `<blockquote class="instagram-media" data-instgrm-permalink="${url}"><a href="${url}">${url}</a></blockquote><p></p>`;
    } else {
      html = `<p><a href="${url}">${url}</a></p>`;
    }
    editor.chain().focus().insertContent(html).run();
  };

  const Btn = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "ghost"}
      onClick={onClick}
      title={title}
      className="h-8 px-2"
    >
      {children}
    </Button>
  );

  return (
    <div className="rounded-md border bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b p-1">
        <Btn
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Btn>
        <Btn
          title="H1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Btn>
        <Btn
          title="H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Btn>
        <Btn
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Btn>
        <Btn title="Link" onClick={insertLink} active={editor.isActive("link")}>
          <LinkIcon className="h-4 w-4" />
        </Btn>
        <Btn title="Image by URL" onClick={insertImage}>
          <ImageIcon className="h-4 w-4" />
        </Btn>
        <Btn title="Embed YouTube" onClick={insertYoutube}>
          <Youtube className="h-4 w-4" />
        </Btn>
        <Btn title="Embed social post" onClick={insertSocial}>
          <AtSign className="h-4 w-4" />
        </Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
