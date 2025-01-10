'use client';
import { useEffect, useState } from 'react';
import styles from '@styles/appStyles/schedule/transferPage.module.scss';
import { BestRoute } from '@/types/TransferData';

export default function Page() {
    const [transferData, setTransferData] = useState<BestRoute | null>(null);

    useEffect(() => {
        const data = sessionStorage.getItem('transferData');
        if (data) {
            setTransferData(JSON.parse(data));
        }
    }, []);

    if (!transferData) {
        return <p className={styles.error}>データが見つかりません。</p>;
    }

    const { route, transfers } = transferData;
    let currentLine: string | null = null;

    const renderRoute = () => {
        return route.map((segment, index) => {
            const elements = [];

            if (index === 0) {
                // First station
                elements.push(
                    <div key={`from-${index}`} className={styles.routeItem}>
                        {segment.from_name}
                    </div>,
                );
                elements.push(
                    <div key={`line-${index}`} className={styles.routeLine}>
                        ({segment.line})
                    </div>,
                );
                currentLine = segment.line;
                elements.push(
                    <div key={`arrow-${index}`} className={styles.routeArrow}>
                        ↓
                    </div>,
                );
                elements.push(
                    <div key={`to-${index}`} className={styles.routeItem}>
                        {segment.to_name}
                    </div>,
                );
            } else {
                if (segment.line !== currentLine) {
                    // Find transfer information
                    const transfer = transfers.find((t) => t.from_line === currentLine && t.to_line === segment.line);
                    if (transfer) {
                        elements.push(
                            <div key={`transfer-${index}`} className={styles.routeItemTransfer}>
                                <strong>{transfer.to_line}に乗り換え</strong>
                            </div>,
                        );
                        elements.push(
                            <div key={`from-${index}`} className={styles.routeItem}>
                                {segment.from_name}
                            </div>,
                        );
                        elements.push(
                            <div key={`line-${index}`} className={styles.routeLine}>
                                ({segment.line})
                            </div>,
                        );
                    }
                    currentLine = segment.line;
                }

                // Show arrow and next station
                elements.push(
                    <div key={`arrow-${index}`} className={styles.routeArrow}>
                        ↓
                    </div>,
                );
                elements.push(
                    <div key={`to-${index}`} className={styles.routeItem}>
                        {segment.to_name}
                    </div>,
                );
            }

            return elements;
        });
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>乗り換え情報</h1>
            <div className={styles.result}>{renderRoute()}</div>
        </div>
    );
}
