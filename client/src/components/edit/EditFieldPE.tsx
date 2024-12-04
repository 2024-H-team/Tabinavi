import styles from '@styles/componentStyles/edit/Content.module.scss';
import { HiOutlinePencil } from 'react-icons/hi2';
import { MdClose } from 'react-icons/md';
import { useState, useEffect, useRef } from 'react';

type EditFieldPEProps = {
    title: string;
    data: { Name: string }[] | undefined;
};

export default function EditFieldPE({ title, data }: EditFieldPEProps) {
    const [visibleEffects, setVisibleEffects] = useState<boolean[]>([]);
    const [personalEffects, setPersonalEffects] = useState(data || []);
    const [newItem, setNewItem] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isAdding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAdding]);

    useEffect(() => {
        if (data) {
            setPersonalEffects(data);
            setVisibleEffects(data.map(() => true));
        }
    }, [data]);

    const handleDelete = (index: number) => {
        setVisibleEffects((prev) => {
            const newVisibility = [...prev];
            newVisibility[index] = false;
            return newVisibility;
        });
    };

    const handleAdd = () => {
        if (newItem.trim()) {
            setPersonalEffects((prev) => [...prev, { Name: newItem }]);
            setVisibleEffects((prev) => [...prev, true]);
            setNewItem('');
        }
    };

    const handleEditClick = () => {
        setIsAdding((prev) => !prev);
    };

    const hasVisibleItems = visibleEffects.some((isVisible) => isVisible);

    return (
        <div className={styles.EditWrap}>
            <div>
                <h2>{title}</h2>
                {hasVisibleItems ? (
                    personalEffects.map((effect, index) => {
                        if (!visibleEffects[index]) return null;
                        return (
                            <div key={index} className={styles.PersonalEffects}>
                                <p>
                                    {effect.Name}
                                    <button onClick={() => handleDelete(index)}>
                                        <MdClose size="12" />
                                    </button>
                                </p>
                            </div>
                        );
                    })
                ) : (
                    <p className={styles.NoItems}>持ち物がありません</p>
                )}

                {isAdding && (
                    <div className={styles.AddItemForm}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={newItem}
                            placeholder="持ち物を入力"
                            onChange={(e) => setNewItem(e.target.value)}
                            className={styles.AddItemInput}
                        />
                        <button onClick={handleAdd} className={styles.AddButton}>
                            追加
                        </button>
                    </div>
                )}
            </div>
            <button className={styles.EditBtn} onClick={handleEditClick}>
                {isAdding ? 'キャンセル' : <HiOutlinePencil color="#929292" />}
            </button>
        </div>
    );
}
