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

    useEffect(() => {
        if (data?.PersonalEffects) {
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

    return (
        <div className={styles.editWrap}>
            <div>
                <h2>{title}</h2>
                {data?.PersonalEffects.map((effect, index) => {
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
                })}
            </div>
            <button className={styles.editBtn}>
                <HiOutlinePencil color="#929292" />
            </button>
        </div>
    );
}
