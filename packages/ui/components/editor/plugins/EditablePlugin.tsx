import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

export default function EditablePlugin({ editable }: { editable: boolean }) {
  const [editor] = useLexicalComposerContext();
  // setEditable notifies other editor components, so it must run after render, not during it.
  useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);
  return null;
}
