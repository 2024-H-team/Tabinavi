import styles from '@styles/componentStyles/edit/Content.module.scss';
import { MdClose } from 'react-icons/md';
import { HiOutlinePencil } from 'react-icons/hi2';
import EditField from './EditField';

type ScheduleData = {
    id: number;
    Location: string;
    Time: string;
    PersonalEffects: { Name: string }[];
    Memo: string;
};

type ContentProps = {
    data: ScheduleData | undefined;
};

export default function Content({ data }: ContentProps) {
    return (
        <div className={styles.contentWrap}>
            <EditField title="旅行先" value={data?.Location || '未設定'} />
            <EditField title="滞在時間" value={data?.Time + '時間' || '未設定'} />

            <div className={styles.editWrap}>
                <div>
                    <h2>持ち物</h2>
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
            <div className={styles.editWrap}>
                <h2>メモ</h2>
                <p></p>
            </div>
        </div>
    );
}
