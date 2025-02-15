'use client';
import { useState, useEffect } from 'react';
import styles from '@styles/appStyles/profile/profile.module.scss';
import Footer from '@/components/Footer';
import { RiCalendarScheduleLine } from 'react-icons/ri';
import Image from 'next/image';
import apiClient from '@/lib/axios';
import ScheduleView from '@/components/profile/ScheduleView';
import { useRouter } from 'next/navigation';

export default function Profile() {
    const router = useRouter();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewAll, setViewAll] = useState(false);
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUsername(user.fullName || 'ユーザー');
            setAvatar(user.avatar);
        }
    }, []);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const response = await apiClient.get('/schedules/list');
                if (response.data.success) {
                    setSchedules(response.data.data.schedules);
                }
            } catch (error) {
                console.error('Error fetching schedules:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

        router.push('/');
        router.refresh();
    };

    if (loading) {
        return;
    }
    const truncateTitle = (title: string, maxLength: number = 15) => {
        return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
    };

    const handleProfileEditClick = () => {
        router.push('/profile/edit');
    };

    const handleSurveyClick = () => {
        router.push('/survey');
    };

    return (
        <>
            <div className={styles.container}>
                <h2 className={styles.pageTitle}>マイページ</h2>

                <div className={styles.profileSection}>
                    <div className={styles.avatarWrapper}>
                        <div className={styles.avatarContainer}>
                            <Image
                                className={styles.avatarImg}
                                src={avatar || '/sample-avatar.png'}
                                alt="Avatar"
                                width={150}
                                height={150}
                            />
                        </div>
                        <p className={styles.userName}>{truncateTitle(username)}</p>
                    </div>
                    <div className={styles.profileInfo}>
                        <div className={styles.buttons}>
                            <button className={styles.editBtn} onClick={handleProfileEditClick}>
                                プロフィールを変更
                            </button>
                            <button onClick={handleSurveyClick} className={styles.surveyButton}>
                                アンケートの回答を変更
                            </button>
                            <button className={styles.logoutBtn} onClick={handleLogout}>
                                ログアウト
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.scheduleSection}>
                    <div className={styles.scheduleHeader}>
                        <RiCalendarScheduleLine size={20} />
                        <span className={styles.scheduleTitle}>作成したスケジュール</span>
                        <p className={styles.viewAllLink} onClick={() => setViewAll(!viewAll)}>
                            {viewAll ? '戻る' : 'すべてを見る'}
                        </p>
                    </div>
                    <div className={styles.scheduleList}>
                        <ScheduleView schedules={schedules} viewAll={viewAll} />
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
