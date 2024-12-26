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
            <h1>ブックマークした場所</h1>
            <div className={styles.BookmarkWrap}>
                {bookmarks.length > 0 ? (
                    bookmarks.map((bookmark) => (
                        <div key={bookmark.id} className={styles.BookmarkInfo}>
                            <h2>{bookmark.title}</h2>
                            <p>{bookmark.address}</p>
                        </div>
                    ))
                ) : (
                    <p>ブックマークがありません。</p>
                )}
            </div>
        </>
    );
}
