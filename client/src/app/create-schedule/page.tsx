'use client';
import React, { useState } from 'react';
import WheelPicker from 'react-simple-wheel-picker';

const hours = Array.from({ length: 24 }, (_, i) => ({
    id: i.toString(),
    value: i.toString().padStart(2, '0'),
}));

const minutes = Array.from({ length: 12 }, (_, i) => ({
    id: (i * 5).toString(),
    value: (i * 5).toString().padStart(2, '0'),
}));

export default function Page() {
    const [selectedStartHour, setSelectedStartHour] = useState<string>(hours[0].id);
    const [selectedStartMinute, setSelectedStartMinute] = useState<string>(minutes[0].id);
    const [selectedEndHour, setSelectedEndHour] = useState<string>(hours[0].id);
    const [selectedEndMinute, setSelectedEndMinute] = useState<string>(minutes[0].id);

    const handleStartHourChange = (target: { id: string; value: string | number }) => {
        setSelectedStartHour(target.id);
    };

    const handleStartMinuteChange = (target: { id: string; value: string | number }) => {
        setSelectedStartMinute(target.id);
    };

    const handleEndHourChange = (target: { id: string; value: string | number }) => {
        setSelectedEndHour(target.id);
    };

    const handleEndMinuteChange = (target: { id: string; value: string | number }) => {
        setSelectedEndMinute(target.id);
    };

    const handleSubmit = () => {
        const startTime = `${hours.find((h) => h.id === selectedStartHour)?.value}:${
            minutes.find((m) => m.id === selectedStartMinute)?.value
        }`;
        const endTime = `${hours.find((h) => h.id === selectedEndHour)?.value}:${
            minutes.find((m) => m.id === selectedEndMinute)?.value
        }`;
        alert(`開始時間: ${startTime}\n終了時間: ${endTime}`);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>設定情報</h2>

            <div style={{ marginBottom: '20px' }}>
                <h3>開始時間</h3>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <WheelPicker
                        data={hours}
                        onChange={handleStartHourChange}
                        height={150}
                        width={100}
                        itemHeight={30}
                        selectedID={selectedStartHour}
                    />
                    <WheelPicker
                        data={minutes}
                        onChange={handleStartMinuteChange}
                        height={150}
                        width={100}
                        itemHeight={30}
                        selectedID={selectedStartMinute}
                        color="#ccc"
                    />
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3>終了時間</h3>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <WheelPicker
                        data={hours}
                        onChange={handleEndHourChange}
                        height={150}
                        width={100}
                        itemHeight={30}
                        selectedID={selectedEndHour}
                        color="#ccc"
                    />
                    <WheelPicker
                        data={minutes}
                        onChange={handleEndMinuteChange}
                        height={150}
                        width={100}
                        itemHeight={30}
                        selectedID={selectedEndMinute}
                        color="#ccc"
                    />
                </div>
            </div>

            <button
                onClick={handleSubmit}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                }}
            >
                確認
            </button>
        </div>
    );
}
