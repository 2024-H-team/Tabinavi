import styles from '@styles/componentStyles/edit/Content.module.scss';
import { MdClose } from 'react-icons/md';
import { HiOutlinePencil } from 'react-icons/hi2';

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
    console.log(data?.PersonalEffects);
    return (
        <div className={styles.contentWrap}>
            <div className={styles.editWrap}>
                <div>
                    <h2>旅行先</h2>
                    <p>{data ? data.Location : 'データがありません'}</p>
                </div>
                <button className={styles.editBtn}>
                    <HiOutlinePencil color="#929292" />
                </button>
            </div>
            <div className={styles.editWrap}>
                <div>
                    <h2>滞在時間</h2>
                    <p>{data ? data.Time + '時間' : 'データがありません'}</p>
                </div>
                <button className={styles.editBtn}>
                    <HiOutlinePencil color="#929292" />
                </button>
            </div>
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
