import styles from '@styles/componentStyles/edit/Content.module.scss';
import { HiOutlinePencil } from 'react-icons/hi2';

import { useState, useRef, useEffect } from 'react';

type EditFieldMemoProps = {
    title: string;
    value: string | undefined;
};

export default function EditFieldMemo({ title, value }: EditFieldMemoProps) {
    const [isEditable, setIsEditable] = useState(false);
    const [inputValue, setInputValue] = useState(value || '');
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (value !== undefined) {
            setInputValue(value);
        }
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

    return (
        <div className={styles.EditWrap}>
            <div>
                <h2>{title}</h2>
                <textarea
                    ref={inputRef}
                    rows={5}
                    cols={45}
                    className={styles.EditMemo}
                    value={inputValue}
                    placeholder="お店の情報やURLを記入するのがおすすめ"
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
