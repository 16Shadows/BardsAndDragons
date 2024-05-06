import { useState } from "react";
import DatePicker from "react-datepicker";

const DatePickerInput = (props: {
  startDate: Date | null;
  onChangeListener: any;
  disabled: boolean;
}) => {
  const [startDate, setStartDate] = useState(props.startDate);
  // Подписываем обработчик события смены даты
  document.addEventListener("OnDateChange", props.onChangeListener);

  return (
    <DatePicker
      // привязка стилей через wrapperClassName
      wrapperClassName="datePicker"
      disabled={props.disabled}
      locale="ru"
      showIcon
      dateFormat="dd/MM/yyyy"
      selected={startDate}
      onChange={(date: Date | null) => {
        date && setStartDate(date);
        props.onChangeListener(date);
      }}
      // При некорректном,неполном или пустом вводе дата = null
      onChangeRaw={() => {
        setStartDate(null);
        props.onChangeListener(null);
      }}
    />
  );
};
export default DatePickerInput;
