import styles from '@styles/componentStyles/edit/Content.module.scss';
import { HiOutlinePencil } from 'react-icons/hi2';
import { MdClose } from 'react-icons/md';
import { useState, useEffect } from 'react';

type EditFieldPEProps = {
    title: string;
    data: { PersonalEffects: { Name: string }[] } | undefined;
};

export default function EditFieldPE({ title, data }: EditFieldPEProps) {
    const [visibleEffects, setVisibleEffects] = useState<boolean[]>([]);
    const [personalEffects, setPersonalEffects] = useState(data?.PersonalEffects || []);
    const [newItem, setNewItem] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (data?.PersonalEffects) {
            setPersonalEffects(data.PersonalEffects);
            setVisibleEffects(data.PersonalEffects.map(() => true));
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
            <button className={styles.EditBtn} onClick={() => setIsAdding((prev) => !prev)}>
                {isAdding ? 'キャンセル' : <HiOutlinePencil color="#929292" />}
            </button>
        </div>
    );
}
