import { useState, useEffect, useRef, useCallback } from 'react';
import styles from '@styles/appStyles/schedule/InfoSetup.module.scss';

interface WheelPickerProps {
    data: string[];
    height?: number;
    itemHeight?: number;
    defaultSelection?: number;
    onChange: (value: string, index: number) => void;
}

const WheelPicker: React.FC<WheelPickerProps> = ({
    data,
    height = 200,
    itemHeight = 40,
    defaultSelection = 0,
    onChange,
}) => {
    const [selectedIndex, setSelectedIndex] = useState<number>(defaultSelection);
    const containerRef = useRef<HTMLDivElement>(null);

    const scrollToIndex = useCallback(
        (index: number) => {
            if (containerRef.current) {
                const scrollPosition = index * itemHeight;
                containerRef.current.scrollTo({
                    top: scrollPosition,
                    behavior: 'smooth',
                });
            }
        },
        [itemHeight],
    );
    useEffect(() => {
        scrollToIndex(selectedIndex);
    }, [selectedIndex, scrollToIndex]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop;
        const index = Math.round(scrollTop / itemHeight);
        if (index !== selectedIndex && index >= 0 && index < data.length) {
            setSelectedIndex(index);
            onChange(data[index], index);
        }
    };

    const handleClick = (index: number) => {
        setSelectedIndex(index);
        onChange(data[index], index);
        scrollToIndex(index);
    };

    return (
        <div ref={containerRef} className={styles.wheelPickerContainer} style={{ height }} onScroll={handleScroll}>
            <div style={{ height: `${(height - itemHeight) / 2}px` }} />
            {data.map((item, index) => (
                <div
                    key={index}
                    className={`${styles.wheelPickerItem} ${index === selectedIndex ? styles.active : ''}`}
                    style={{
                        height: itemHeight,
                        lineHeight: `${itemHeight}px`,
                    }}
                    onClick={() => handleClick(index)}
                >
                    {item}
                </div>
            ))}
            <div style={{ height: `${(height - itemHeight) / 2}px` }} />
        </div>
    );
};

export default WheelPicker;
