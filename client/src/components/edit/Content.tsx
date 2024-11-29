import styles from '@styles/componentStyles/edit/Content.module.scss';

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
            <div className={styles.editWrap}>
                <h2>旅行先</h2>
                <p>{data ? data.Location : 'データがありません'}</p>
            </div>
            <div className={styles.editWrap}>
                <h2>滞在時間</h2>
                <p>{data ? data.Time + '時間' : 'データがありません'}</p>
            </div>
            <div className={styles.editWrap}>
                <h2>持ち物</h2>
                <p>{data ? data.Time + '時間' : 'データがありません'}</p>
            </div>
        </div>
    );
}
