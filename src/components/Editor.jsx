import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../Actions";

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);

    // Initialize CodeMirror ONCE
    useEffect(() => {
        editorRef.current = CodeMirror.fromTextArea(
            document.getElementById("realtimeEditor"),
            {
                mode: { name: "javascript", json: true },
                theme: "dracula",
                autoCloseTags: true,
                autoCloseBrackets: true,
                lineNumbers: true,
            }
        );

        editorRef.current.on("change", (instance, changes) => {
            const code = instance.getValue();
            onCodeChange(code);

            if (
                changes.origin !== "setValue" &&
                socketRef.current
            ) {
                socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                    roomId,
                    code,
                });
            }
        });

        return () => {
            editorRef.current?.toTextArea();
        };
    }, []);

    // Listen for remote code changes
    useEffect(() => {
        if (!socketRef.current || !editorRef.current) return;

        const handleCodeChange = ({ code }) => {
            if (code !== null) {
                const currentCode = editorRef.current.getValue();

                // Prevent unnecessary re-renders
                if (code !== currentCode) {
                    editorRef.current.setValue(code);
                }
            }
        };

        socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
        };
    }, [socketRef.current]);

    return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;
