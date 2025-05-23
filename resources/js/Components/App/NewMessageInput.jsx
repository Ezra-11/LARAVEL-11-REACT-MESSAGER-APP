import { useEffect, useRef } from "react";

export default function NewMessageInput({ value, onChange, onSend }) {
    const input = useRef();

    function onInputKeyDown(ev) {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            onSend();
        }
    }

    function onChangeEvent(ev) {
        setTimeout(() => {
            adjustHeight();
        }, 10);
        onChange(ev);
    }

    function adjustHeight() {
        setTimeout(() => {
            input.current.style.height = "auto";
            input.current.style.height = input.current.scrollHeight + 1 + "px";
        }, 100);
    }

    useEffect(() => {
        adjustHeight();
    }, [value]);

    return (
        <textarea
            ref={input}
            value={value}
            rows="1"
            placeholder="Type a message"
            onKeyDown={onInputKeyDown}
            onChange={(ev) => onChangeEvent(ev)}
            className="input input-bordered w-full rounded-r-none resize-none overflow-y-auto max-h-40"
        ></textarea>
    );
}
