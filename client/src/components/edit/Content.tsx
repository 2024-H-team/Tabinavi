import styles from '@styles/componentStyles/edit/Content.module.scss';
import EditField from './EditField';
import EditFieldPE from './EditFieldPE';
import EditFieldMemo from './EditFieldMemo';
import DeleteSchedule from '@/components/edit/DeleteSchedule';

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
    if (!data) return null;
    return (
        <div className={styles.ContentWrap}>
            <EditField title="旅行先" value={data?.Location || '未設定'} />
            <EditField title="滞在時間" value={data?.Time + '時間' || '未設定'} />
            <EditFieldPE title="持ち物" data={data?.PersonalEffects || undefined} />
            <EditFieldMemo title="メモ" value={data?.Memo || ''} />
            <DeleteSchedule />
        </div>
    );
}
