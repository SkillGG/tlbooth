import { useAdmin } from "@/hooks/admin";
import { cssIf } from "@/utils/utils";
import React, {
  type CSSProperties,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type EditFieldProps = {
  lock: boolean;
  fieldName: string;
  defaultValue?: string;
  onSave: (s: string) => Promise<void> | void;
  onCancel?: (s: string) => Promise<void> | void;
  classNames?: {
    main?: string;
    header?: {
      main?: string;
      noEdit?: string;
      edit?: {
        main?: string;
        save?: string;
        cancel?: string;
      };
    };
    staticField?: {
      div?: string;
      span?: string;
    };
    editField?: {
      div?: string;
      span?: string;
    };
  };
  ref: {
    hide(): void;
    show(): void;
  } | null;
};

type EditFieldRef = { show: () => void; hide: () => void };

export const useEditRef = () => {
  return useRef<EditFieldRef>(null);
};

export const EditField = React.forwardRef<EditFieldRef, EditFieldProps>(
  function EditField(
    { onSave, onCancel, defaultValue, lock, fieldName, classNames },
    ref,
  ) {
    const isAdmin = useAdmin();

    const [edit, setEdit] = useState(false);

    const textRef = useRef<HTMLSpanElement>(null);
    const saveRef = useRef<HTMLButtonElement>(null);

    useImperativeHandle(ref, () => {
      return { show: () => setEdit(true), hide: () => setEdit(false) };
    });

    useEffect(() => {
      if (textRef.current) textRef.current.innerText = defaultValue ?? "";
    }, [defaultValue, edit]);

    return (
      <>
        <div
          className={`${cssIf(classNames?.main, classNames?.main)} h-min text-sm`}
        >
          <small
            className={`${cssIf(classNames?.header?.main, classNames?.header?.main)}`}
          >
            {fieldName}:
            {isAdmin &&
              !lock &&
              (!edit ? (
                <button
                  className={`${cssIf(classNames?.header?.noEdit)} ml-1`}
                  onClick={() => setEdit((p) => !p)}
                >
                  Edit
                </button>
              ) : (
                <div
                  className={`${cssIf(classNames?.header?.edit?.main)} inline-grid grid-flow-col gap-x-1`}
                >
                  <button
                    ref={saveRef}
                    className="text-green-300"
                    onClick={() => {
                      if (textRef.current) {
                        const value = textRef.current.innerText.trim();
                        void onSave(value);
                        setEdit(false);
                      }
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="text-red-400"
                    onClick={() => {
                      setEdit((p) => !p);
                      if (textRef.current)
                        void onCancel?.(textRef.current.innerText);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ))}
          </small>
          {edit ? (
            <div
              key="editfield"
              className="grid grid-flow-col gap-x-2"
              style={{ gridTemplateColumns: "auto min-content" }}
            >
              <span
                contentEditable
                className="block min-w-4 border-b-2 text-center"
                onKeyDown={(e) => {
                  if (e.code === "Enter") {
                    saveRef.current?.click();
                  }
                }}
                ref={textRef}
              ></span>
            </div>
          ) : (
            <div key="nonEditField" className={`min-h-5 text-center`}>
              <span>{defaultValue}</span>
            </div>
          )}
        </div>
      </>
    );
  },
);
