import styles from '@styles/componentStyles/edit/Content.module.scss';
import { HiOutlinePencil } from 'react-icons/hi2';
import { useState, useRef, useEffect } from 'react';

type EditFieldProps = {
    title: string;
    value: string;
};

export default function EditField({ title, value }: EditFieldProps) {
    const [isEditable, setIsEditable] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleEnableEdit = () => {
        setIsEditable(true);
        if (inputRef.current) {
            inputRef.current.focus();
            const length = inputRef.current.value.length;
            inputRef.current.setSelectionRange(length, length);
        }
    };

    const handleBlur = () => {
        setIsEditable(false);
    };

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(event.target.value);
    };

    const handleAutoResize = () => {
        if (inputRef.current) {
            inputRef.current.style.height = '16px';
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        handleAutoResize();
    }, [inputValue]);

    return (
        <div className={styles.EditWrap}>
            <div>
                <h2>{title}</h2>
                <textarea
                    className={styles.EditField}
                    ref={inputRef}
                    value={inputValue}
                    readOnly={!isEditable}
                    onBlur={handleBlur}
                    onChange={handleChange}
                />
            </div>
            <button className={styles.EditBtn} onClick={handleEnableEdit}>
                <HiOutlinePencil color="#929292" />
            </button>
        </div>
    );
}
