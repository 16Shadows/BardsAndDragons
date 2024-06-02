import { SetStateAction, useState } from "react";
import DatePicker from "react-datepicker";

const DatePickerInput = (props: {
  date: string | null;
  onChangeListener: any;
  disabled: boolean;
}) => {
  const [date, setDate] = useState(props.date);
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
      value={date ? date : null}
      onChange={(date: SetStateAction<string | null>) => {
        date && setDate(date);
        props.onChangeListener(date);
      }}
      // При некорректном,неполном или пустом вводе дата = null
      onChangeRaw={() => {
        setDate(null);
        props.onChangeListener(null);
      }}
    />
  );
};
export default DatePickerInput;
