import styles from '@styles/componentStyles/edit/Content.module.scss';
import EditField, { EditFieldPE } from './EditField';

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
            <EditFieldPE title="持ち物" data={data} />
            <div className={styles.editWrap}>
                <h2>メモ</h2>
                <p></p>
            </div>
        </div>
    );
}
