'use client';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { ja } from 'date-fns/locale';

export default function Calender() {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
            <DateCalendar views={['day']} readOnly />
        </LocalizationProvider>
    );
}
