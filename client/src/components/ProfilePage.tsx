import React, { useState } from "react";
import "../CSS/App.css";
import "../CSS/ProfilePage.css";
import "../CSS/react-datepicker.css";
import avatarpic from "../resources/EmptyProfileAvatar_200px.png";
import DatePickerInput from "./DatePicker";
import PopupButton from "../interfaces/PopupButtonInterface";

import { registerLocale, setDefaultLocale } from "react-datepicker";
import { ru } from "date-fns/locale/ru";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import Button from "./Button";
import { set } from "date-fns";
import Popup from "./Popup";
import { useNavigate } from "react-router-dom";
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
  // Запрос данных из бд
  const [name, setName] = useState<string | null>(null);
  const [town, setTown] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  const handleNameChange = (event: {
    target: { value: React.SetStateAction<null | string> };
  }) => {
    if (event.target.value === "") setName(null);
    else setName(event.target.value);
  };
  const handleTownChange = (event: {
    target: { value: React.SetStateAction<null | string> };
  }) => {
    setTown(event.target.value);
  };
  const handleBirthDateChange = (value: React.SetStateAction<null | Date>) => {
    setBirthDate(value);
  };

  const navigate = useNavigate();

  const deleteProfile = () => {
    navigate("/");
    console.log("Ох НЕТ! Профиль был удален");
    // Добавить удаление профиля
  };
  const [modalShow, setModalShow] = useState(false);

  const DeleteProfileButtons = [
    {
      text: "Удалить",
      action: () => {
        console.log("Профиль удален.");
        deleteProfile();
      },
      variant: "danger",
    } as PopupButton,

    {
      text: "Отмена",
      action: () => {
        console.log("Удаление отменено.");
      },
      variant: "primary",
    } as PopupButton,
  ];

  return (
    <div className="d-flex flex-column content">
      <div className="bg-white row">
        <div className="col pic-col">
          <img
            id="profile_pic"
            className="profile_image"
            alt="Profile avatar"
            src={avatarpic}
          />
        </div>

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
                disabled={!isEditing}
                name="name"
                type="text"
                placeholder={nickname}
                value={name ? name : ""}
                onChange={handleNameChange}
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
                disabled={!isEditing}
                name="town"
                type="text"
                placeholder="Город"
                value={town ? town : "Город (не выбран)"}
                onChange={handleTownChange}
              ></input>
              {/* <DropdownList></DropdownList> */}

              <div className="row">
                <div className="col">
                  <DatePickerInput
                    disabled={!isEditing}
                    startDate={birthDate}
                    onChangeListener={handleBirthDateChange}
                  ></DatePickerInput>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          галочки
          {/* <TooltipComponent message="Возраст"></TooltipComponent> */}
        </div>
        <div className="row mb-2">
          {isEditing ? (
            <Button
              key={"doneRedactingButton"}
              color="primary"
              children="Закончить редактирование"
              onClick={() => setIsEditing(false)}
            ></Button>
          ) : (
            <Button
              key={"startRedactingButton"}
              color="secondary"
              children="Редактировать профиль"
              onClick={() => setIsEditing(true)}
            ></Button>
          )}
        </div>
        <div className="row">
          <Popup
            popupButtonText="Удалить профиль"
            popupButtonVariant="danger"
            show={modalShow}
            onHide={() => setModalShow(false)}
            disabled={false}
            title="Удаление профиля"
            message={
              'Вы уверены, что хотите удалить профиль "' +
              nickname +
              '"? \nОтменить это действие будет невозможно!'
            }
            buttons={DeleteProfileButtons}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
