'use client';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import ja from 'date-fns/locale/ja';

export default function Calender() {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
            <DateCalendar
                views={['day']}
                readOnly
                onChange={() => {}}
                sx={{
                    marginTop: '12px',
                    width: '100%',
                    boxShadow: '0 0 4px 1px rgba(150,150,150,0.11)',
                    border: '1px solid #000',
                    borderRadius: '16px',
                    padding: '24px',
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
                        borderBottom: '2px solid #E4E5E7',
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
    );
}
