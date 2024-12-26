'use client';

import styles from '@styles/componentStyles/Calendar.module.scss';
import { FaCalendarAlt } from 'react-icons/fa';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

type CalendarData = {
    id: number;
    startDate: string;
    endDate: string;
    period: string;
};

type SpecialDate = {
    date: Dayjs;
    period: string;
};

const CustomDay = (props: PickersDayProps<Dayjs> & { specialDates: SpecialDate[] }) => {
    const { day, selected, specialDates, ...other } = props;

    const specialDate = specialDates.find((special) => day.isSame(special.date, 'day'));
    const isSpecialDate = !!specialDate;

    const isMultiple = isSpecialDate && specialDate?.period === 'multiple';

    return (
        <PickersDay
            {...other}
            day={day}
            selected={selected}
            sx={{
                position: 'relative',

                '&::after': {
                    content: isSpecialDate && !isMultiple ? '"・"' : '""',
                    color: '#7BC3FF',
                    fontSize: '30px',
                    position: 'absolute',
                    top: 0,
                    left: -3,
                },
            }}
        />
    );
};

export default function Calendar() {
    const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);

    useEffect(() => {
        const fetchSpecialDates = async () => {
            const response = await fetch('/CalendarData.json');
            const data: CalendarData[] = await response.json();

            const dates = data.flatMap((entry) => {
                const start = dayjs(entry.startDate);
                const end = dayjs(entry.endDate);

                const days: SpecialDate[] = [];
                let current = start;

                while (current.isSameOrBefore(end, 'day')) {
                    days.push({ date: current, period: entry.period });
                    current = current.add(1, 'day');
                }
                return days;
            });

            setSpecialDates(dates);
        };

        fetchSpecialDates();
    }, []);

    return (
        <div>
            <button className={styles.CalendarButton}>
                <FaCalendarAlt color="#FFD643" size="24px" />
            </button>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                    views={['day']}
                    readOnly
                    onChange={() => {}}
                    slots={{
                        day: (props) => <CustomDay {...props} specialDates={specialDates} />,
                    }}
                    sx={{
                        backgroundColor: '#FFF',
                        marginTop: '12px',
                        width: '100%',
                        maxHeight: '352px',
                        height: '352px',
                        boxShadow: '0 0 4px 1px rgba(150,150,150,0.11)',
                        borderRadius: '16px 0 16px 16px',
                        padding: '24px 48px 24px 24px',
                        svg: {
                            width: '16px',
                            height: '16px',
                        },
                        '.MuiPickersCalendarHeader-label': {
                            fontSize: '1.4rem',
                        },
                        '.MuiDayCalendar-monthContainer': {
                            height: '230px',
                        },
                        '.MuiDayCalendar-header': {
                            padding: '0',
                            margin: '0',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                        },
                        '.MuiPickersCalendarHeader-root': {
                            margin: '0 12px 4px 12px',
                            padding: '0',
                            borderBottom: '1px solid #E4E5E7',
                        },
                        '.MuiDayCalendar-weekContainer': {
                            padding: '0',
                            margin: '16px auto',
                            display: 'flex',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                            '&:first-child': {
                                marginTop: '0',
                            },
                            '&:last-child': {
                                marginBottom: '0',
                            },
                        },
                        '.MuiDayCalendar-weekDayLabel': {
                            fontSize: '1rem',
                            color: '#436EEE',
                        },
                        '.MuiPickersDay-root': {
                            fontSize: '1.4rem',
                            border: 'none !important',
                            width: '24px',
                            height: '24px',
                            borderRadius: '8px',
                            '&:focus': {
                                backgroundColor: 'inherit',
                            },
                            '&.Mui-selected': {
                                backgroundColor: 'inherit',
                                color: 'inherit',
                            },
                        },
                        '.MuiPickersDay-today': {
                            backgroundColor: '#FFD333',
                            '&:focus': {
                                backgroundColor: '#FFD333',
                            },
                            '&.Mui-selected': {
                                backgroundColor: '#FFD333',
                                color: '#FFF',
                            },
                        },
                    }}
                />
            </LocalizationProvider>
        </div>
    );
}
