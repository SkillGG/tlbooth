import { cssDef } from "@/utils/utils";
import React, {
  type CSSProperties,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type EditFieldCustomization<T> = {
  main?: T;
  header?: {
    main?: T;
    noEdit?: T;
    edit?: {
      main?: T;
      save?: T;
      cancel?: T;
    };
  };
  staticField?: {
    div?: T;
    span?: T;
  };
  editField?: {
    div?: T;
    span?: T;
  };
};

type EditFieldProps = {
  lock: boolean;
  fieldName: string;
  defaultValue?: string;
  onSave?: (s: string) => Promise<void> | void;
  onCancel?: (s: string) => Promise<void> | void;
  showRestore?: boolean;
  onReset?: () => Promise<void> | void;
  className?: EditFieldCustomization<string>;
  style?: EditFieldCustomization<CSSProperties>;
  ref: {
    hide(): void;
    show(): void;
  } | null;
};

type EditFieldRef = { show: () => void; hide: () => void };

export const useEditRef = () => {
  return useRef<EditFieldRef>(null);
};

export const EditField = React.forwardRef<
  EditFieldRef,
  EditFieldProps
>(function EditField(
  {
    onSave,
    onCancel,
    showRestore,
    defaultValue,
    lock,
    fieldName,
    className,
    style,
    onReset,
  },
  ref,
) {
  const [edit, setEdit] = useState(false);

  const textRef = useRef<HTMLSpanElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => {
    return {
      show: () => setEdit(true),
      hide: () => setEdit(false),
    };
  });

  useEffect(() => {
    if (textRef.current)
      textRef.current.innerText = defaultValue ?? "";
  }, [defaultValue, edit]);

  console.log(textRef.current?.innerText, defaultValue);

  return (
    <>
      <div
        className={`${cssDef(className?.main)} h-min text-sm`}
        style={style?.main}
      >
        <small
          className={`${cssDef(className?.header?.main)}`}
          style={style?.header?.main}
        >
          {fieldName}:
          {!lock &&
            (!edit ?
              <>
                <button
                  className={`${cssDef(className?.header?.noEdit)} ml-1`}
                  style={style?.header?.noEdit}
                  onClick={() => setEdit((p) => !p)}
                >
                  Edit
                </button>
                {showRestore && (
                  <button
                    className={`${cssDef(className?.header?.noEdit)} ml-1`}
                    style={style?.header?.noEdit}
                    onClick={() => {
                      console.log("clicking restore");
                      void onReset?.();
                      setEdit(false);
                    }}
                  >
                    Restore
                  </button>
                )}
              </>
            : <div
                className={`${cssDef(className?.header?.edit?.main)} inline-grid grid-flow-col gap-x-1`}
                style={style?.header?.edit?.main}
              >
                <button
                  ref={saveRef}
                  className={`${cssDef(className?.header?.edit?.save)} text-green-300`}
                  style={style?.header?.edit?.save}
                  onClick={() => {
                    if (textRef.current) {
                      const value =
                        textRef.current.innerText.trim();
                      void onSave?.(value.trim());
                      setEdit(false);
                    }
                  }}
                >
                  Save
                </button>
                <button
                  className={`${cssDef(className?.header?.edit?.cancel)} text-red-400`}
                  style={style?.header?.edit?.cancel}
                  onClick={() => {
                    setEdit((p) => !p);
                    if (textRef.current)
                      void onCancel?.(
                        textRef.current.innerText,
                      );
                  }}
                >
                  Cancel
                </button>
              </div>)}
        </small>
        {edit ?
          <div
            key="editfield"
            className={`${cssDef(className?.editField?.div)} grid grid-flow-col gap-x-2`}
            style={{
              ...style?.editField?.div,
              gridTemplateColumns: "auto min-content",
            }}
          >
            <span
              contentEditable
              className={`${className?.editField?.span} block min-w-4 border-b-2 text-center`}
              style={style?.editField?.span}
              onKeyDown={(e) => {
                if (e.code === "Enter") {
                  saveRef.current?.click();
                }
              }}
              ref={textRef}
            ></span>
          </div>
        : <div
            key="nonEditField"
            className={`${cssDef(className?.staticField?.div)} min-h-5 text-center`}
            style={style?.staticField?.div}
          >
            <span
              className={`${cssDef(className?.staticField?.span)}`}
              style={style?.staticField?.span}
            >
              {defaultValue}
            </span>
          </div>
        }
      </div>
    </>
  );
});
