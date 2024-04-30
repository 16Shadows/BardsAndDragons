import { useState } from "react";
import DatePicker from "react-datepicker";

const DatePickerInput = (props: {
  startDate: Date | null;
  onChangeListener: any;
}) => {
  const [startDate, setStartDate] = useState(props.startDate);
  // Подписываем обработчик события смены даты
  document.addEventListener("OnDateChange", props.onChangeListener);

  return (
    <DatePicker
      locale="ru"
      showIcon
      dateFormat="dd/MM/yyyy"
      selected={startDate}
      onChange={(date: Date | null) => {
        date && setStartDate(date);
        props.onChangeListener(date);
      }}
      // При некорректном,неполном или пустом вводе дата = null
      onChangeRaw={() => setStartDate(null)}
    />
  );
};
export default DatePickerInput;
