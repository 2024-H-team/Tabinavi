import styles from '@styles/componentStyles/edit/Content.module.scss';
import { HiOutlinePencil } from 'react-icons/hi2';
import { MdClose } from 'react-icons/md';

type EditFieldPEProps = {
    title: string;
    data: { PersonalEffects: { Name: string }[] } | undefined;
};

export default function EditFieldPE({ title, data }: EditFieldPEProps) {
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
