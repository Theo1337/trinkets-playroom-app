import isHotkey from "is-hotkey";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  Editor,
  Element as SlateElement,
  Transforms,
  createEditor,
} from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, useSlate, withReact } from "slate-react";
import { Button, Icon } from "./slate";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";

import { format } from "date-fns";

import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Lock,
  Calendar,
  Save,
  Trash2,
} from "lucide-react";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
};
const LIST_TYPES = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];

const TextEditor = ({
  date,
  togglePasswordDialog,
  pickDate,
  saveData,
  deleteItem,
  currentPage,
  currentPageValues,
}) => {
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const [configs, setConfigs] = useState({
    id: currentPage,
    title: "",
    passwordProtected: false,
    password: "",
    date: date,
    value: [],
    saved: false,
  });

  useEffect(() => {
    if (currentPageValues) {
      setConfigs({
        ...configs,
        id: currentPageValues.id,
        title: currentPageValues.title,
        passwordProtected: currentPageValues.passwordProtected,
        password: currentPageValues.password,
        value: JSON.parse(currentPageValues.text),
        saved: currentPageValues.title ? true : false,
      });
    }
  }, [currentPageValues]);

  return (
    <Slate
      onValueChange={(e) => {
        setConfigs({ ...configs, value: e });
      }}
      editor={editor}
      initialValue={JSON.parse(currentPageValues.text)}
    >
      <div
        className={`sticky top-0 px-4 right-0 z-50 md:top-0 flex items-center justify-center w-full`}
      >
        <div className="flex-wrap flex-grow max-w-screen md:flex-nowrap md:flex-grow-0 rounded-lg flex w-min items-center my-4 p-4 justify-center gap-4 bg-gray-100 shadow-lg">
          <MarkButton format="bold" icon={<Bold />} />
          <MarkButton format="italic" icon={<Italic />} />
          <MarkButton format="underline" icon={<Underline />} />
          <div className="hidden md:w-2 md:h-8 md:flex items-center justify-center">
            <Separator
              className="bg-black/30 hidden md:block"
              orientation="vertical"
            />
          </div>
          <div className="w-full flex items-center justify-center gap-4">
            <BlockButton format="left" icon={<AlignLeft />} />
            <BlockButton format="center" icon={<AlignCenter />} />
            <BlockButton format="right" icon={<AlignRight />} />
            <BlockButton format="justify" icon={<AlignJustify />} />
          </div>
          <div className="hidden md:w-2 md:h-8 md:flex items-center justify-center">
            <Separator
              className="bg-black/30 hidden md:block"
              orientation="vertical"
            />
          </div>
          <div className="w-full flex items-center justify-center gap-4">
            <div
              aria-selected={configs.passwordProtected}
              onClick={togglePasswordDialog}
              className="aria-selected:bg-red-500/20 cursor-pointer transition hover:bg-red-500/20 flex items-center justify-center bg-white p-1 rounded-lg"
            >
              <Lock />
            </div>
            <div
              onClick={pickDate}
              className="cursor-pointer transition hover:bg-red-500/20 flex items-center justify-center bg-white p-1 rounded-lg"
            >
              <Calendar />
            </div>
            <div
              onClick={() => {
                saveData(configs);

                setTimeout(() => {
                  setConfigs({ ...configs, saved: true });
                }, 100);
              }}
              className="cursor-pointer transition hover:bg-red-500/20 flex items-center justify-center bg-white p-1 rounded-lg"
            >
              <Save />
            </div>
            <div
              onClick={() => {
                deleteItem(configs);
              }}
              className="cursor-pointer transition hover:bg-red-500 hover:text-white flex items-center justify-center bg-white p-1 rounded-lg"
            >
              <Trash2 />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white w-full p-2 my-3 py-4 rounded-lg flex flex-col gap-2 px-12 items-center justify-center">
        <div className="w-full">
          <Input
            value={configs.title}
            onChange={(e) => {
              setConfigs({ ...configs, title: e.target.value });
            }}
            placeholder="Título"
            className="w-full text-center"
            style={{ fontSize: "1.25rem" }}
            variant="standard"
          />
        </div>
        <div className="font-bold w-full text-center text-xl uppercase">
          {format(configs.date, "PPP")}
        </div>
      </div>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        spellCheck
        className="outline-none bg-white rounded-lg p-6 min-h-screen transition  max-w-screen"
        autoFocus
        onKeyDown={(event) => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event)) {
              event.preventDefault();
              const mark = HOTKEYS[hotkey];
              toggleMark(editor, mark);
            }
          }
        }}
      />
    </Slate>
  );
};
const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(
    editor,
    format,
    isAlignType(format) ? "align" : "type"
  );
  const isList = isListType(format);
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      isListType(n.type) &&
      !isAlignType(format),
    split: true,
  });
  let newProperties;
  if (isAlignType(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }
  Transforms.setNodes(editor, newProperties);
  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};
const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};
const isBlockActive = (editor, format, blockType = "type") => {
  const { selection } = editor;
  if (!selection) return false;
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => {
        if (!Editor.isEditor(n) && SlateElement.isElement(n)) {
          if (blockType === "align" && isAlignElement(n)) {
            return n.align === format;
          }
          return n.type === format;
        }
        return false;
      },
    })
  );
  return !!match;
};
const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};
const Element = ({ attributes, children, element }) => {
  const style = {};
  if (isAlignElement(element)) {
    style.textAlign = element.align;
  }
  switch (element.type) {
    case "block-quote":
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};
const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  return <span {...attributes}>{children}</span>;
};
const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        isAlignType(format) ? "align" : "type"
      )}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
      className="hover:bg-red-500/20 transition  p-1 rounded-lg"
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};
const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      className="hover:bg-red-500/20 transition  p-1 rounded-lg"
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};
const isAlignType = (format) => {
  return TEXT_ALIGN_TYPES.includes(format);
};
const isListType = (format) => {
  return LIST_TYPES.includes(format);
};
const isAlignElement = (element) => {
  return "align" in element;
};
export default TextEditor;
