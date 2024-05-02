import React, { useState } from "react";
import "../CSS/App.css";
import "../CSS/ProfilePage.css";
import "../CSS/react-datepicker.css";
import avatarpic from "../resources/EmptyProfileAvatar_200px.png";
import DatePickerInput from "./DatePicker";

import { registerLocale, setDefaultLocale } from "react-datepicker";
import { ru } from "date-fns/locale/ru";
// import DropdownList from "./DropdownList";
registerLocale("ru", ru);

// Datepicker - https://reactdatepicker.com/

const ProfilePage = () => {
  // Изменение режима редактирования по кнопке
  const [isEditing, setIsEditing] = useState(false);
  // Запрос данных из бд
  const nickname = "Тестовый_Ник";
  const email = "Тест@ya.ru";
  const townList = ["Москва", "Пермь", "Верхняя Колва"];

  const [name, setName] = useState(null);
  const [town, setTown] = useState(null);
  const [birthDate, setBirthDate] = useState(null);

  return (
    <div className="d-flex flex-column content">
      <div className="bg-white row">
        <img
          id="profile_pic"
          className="profile_image"
          alt="Profile avatar"
          src={avatarpic}
        />

        <div className="label-col">
          <div className="col ">
            <div className="row">
              <label className="col-form-label">Никнейм:</label>
            </div>

            <div className="row">
              <label className="col-form-label">Отображаемое имя:</label>
            </div>

            <div className="row">
              <label className="col-form-label">Почта:</label>
            </div>

            <div className="row">
              <label className="col-form-label">Город:</label>
            </div>

            <div className="row">
              <label className="col-form-label">Дата рождения:</label>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="row">
            <div className="col col-form-label">
              <label className="">{nickname}</label>
            </div>
          </div>

          <div className="row">
            <div className="col col-form-label">
              <input
                disabled
                name="name"
                type="text"
                placeholder="Имя (не выбрано)"
              ></input>
            </div>
          </div>

          <div className="row">
            <div className="col col-form-label">
              <label className="">{email}</label>
            </div>
          </div>

          <div className="row">
            <div className="col">
              <input
                disabled
                name="town"
                type="text"
                placeholder="Город (не выбран)"
              ></input>
              {/* <DropdownList></DropdownList> */}

              <div className="row">
                <div className="col">
                  <DatePickerInput></DatePickerInput>
                </div>
              </div>
            </div>
          </div>

          <div>
            галочки
            {/* <TooltipComponent message="Возраст"></TooltipComponent> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
