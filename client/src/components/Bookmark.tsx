'use client';

import { useEffect, useState } from 'react';
import styles from '@styles/componentStyles/Bookmark.module.scss';

type Bookmark = {
    id: number;
    title: string;
    address: string;
};

export default function Bookmark() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

    useEffect(() => {
        const fetchBookmarks = async () => {
            try {
                const response = await fetch('/Bookmarks.json');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data: Bookmark[] = await response.json();
                setBookmarks(data);
            } catch (error) {
                console.error('Error fetching bookmarks:', error);
            }
        };

        fetchBookmarks();
    }, []);

    return (
        <>
            <h1 className={styles.title}>ブックマークした場所</h1>
            <div className={styles.BookmarkWrap}>
                {bookmarks.length > 0 ? (
                    bookmarks.map((bookmark) => (
                        <button key={bookmark.id} className={styles.Bookmark}>
                            <p className={styles.BookmarkImg}></p>
                            <div className={styles.BookmarkInfo}>
                                <p>{bookmark.address}</p>
                                <h2>{bookmark.title}</h2>
                            </div>
                        </button>
                    ))
                ) : (
                    <p>ブックマークがありません。</p>
                )}
            </div>
        </>
    );
}
