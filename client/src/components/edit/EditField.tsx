import styles from '@styles/componentStyles/edit/Content.module.scss';
import { HiOutlinePencil } from 'react-icons/hi2';
import { MdClose } from 'react-icons/md';
import { useState, useRef, useEffect } from 'react';

type EditFieldProps = {
    title: string;
    value: string;
};

export default function EditField({ title, value }: EditFieldProps) {
    const [isEditable, setIsEditable] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleEnableEdit = () => {
        setIsEditable(true);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleBlur = () => {
        setIsEditable(false);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    return (
        <div className={styles.editWrap}>
            <div>
                <h2>{title}</h2>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    readOnly={!isEditable}
                    onBlur={handleBlur}
                    onChange={handleChange}
                />
            </div>
            <button className={styles.editBtn} onClick={handleEnableEdit}>
                <HiOutlinePencil color="#929292" />
            </button>
        </div>
    );
}

type EditFieldPEProps = {
    title: string;
    data: { PersonalEffects: { Name: string }[] } | undefined;
};

export function EditFieldPE({ title, data }: EditFieldPEProps) {
    return (
        <div className={styles.editWrap}>
            <div>
                <h2>{title}</h2>
                {data?.PersonalEffects.map((effect, index) => {
                    return (
                        <div key={index} className={styles.PersonalEffects}>
                            <p>
                                {effect.Name}
                                <button>
                                    <MdClose size="12" />
                                </button>
                            </p>
                        </div>
                    );
                })}
            </div>
            <button className={styles.editBtn}>
                <HiOutlinePencil color="#929292" />
            </button>
        </div>
    );
}
