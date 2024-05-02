import { useState } from "react";
import DatePicker from "react-datepicker";

const DatePickerInput = () => {
  const [startDate, setStartDate] = useState(new Date());
  return (
    <DatePicker
      locale="ru"
      showIcon
      dateFormat="dd/MM/yyyy"
      selected={startDate}
      onChange={(date: Date) => date && setStartDate(date)}
    />
  );
};
export default DatePickerInput;
