'use client';

import styles from '@styles/componentStyles/Calendar.module.scss';
import { FaCalendarAlt } from 'react-icons/fa';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

const CustomDay = (props: PickersDayProps<Dayjs>) => {
    const { day, selected, ...other } = props;

    const specialDates = [
        dayjs('2024-12-25'),
        dayjs('2024-12-2'),
        dayjs('2024-12-25'),
        dayjs('2025-01-01'),
        dayjs('2025-02-14'),
    ];

    const isSpecialDate = specialDates.some((specialDate) => day.isSame(specialDate, 'day'));

    return (
        <PickersDay
            {...other}
            day={day}
            selected={selected}
            sx={{
                position: 'relative',
                '&::after': {
                    content: isSpecialDate ? '"・"' : '""',
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
                        day: CustomDay, // カスタムコンポーネントを指定
                    }}
                    sx={{
                        backgroundColor: '#FFF',
                        marginTop: '12px',
                        width: '100%',
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
