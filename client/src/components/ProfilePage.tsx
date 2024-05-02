import React, { useState } from "react";
import "../CSS/App.css";
import "../CSS/ProfilePage.css";
import "../CSS/react-datepicker.css";
import avatarpic from "../resources/EmptyProfileAvatar_200px.png";
// Datepicker - https://reactdatepicker.com/
import DatePickerInput from "./DatePicker";
// Select - https://react-select.com/home
import Select from "react-select";
import PopupButton from "../interfaces/PopupButtonInterface";
import Popup from "./Popup";
import Button from "./Button";

import { registerLocale, setDefaultLocale } from "react-datepicker";
import { ru } from "date-fns/locale/ru";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import { set } from "date-fns";
import { useNavigate } from "react-router-dom";
import TooltipComponent from "./TooltipComponent";

registerLocale("ru", ru);

const ProfilePage = () => {
  // Изменение режима редактирования по кнопке
  const [isEditing, setIsEditing] = useState(false);
  // TODO Запрос данных из бд
  const nickname = "Тестовый_Ник";
  const email = "Тест@ya.ru";
  const townList = ["Москва", "Пермь", "Верхняя Колва"];
  // TODO Запрос данных из бд
  const [name, setName] = useState<string | null>(null);
  const [town, setTown] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [isShowingAge, setIsShowingAge] = useState<boolean>(false);

  const handleNameChange = (event: {
    target: { value: React.SetStateAction<null | string> };
  }) => {
    if (event.target.value === "") setName(null);
    else setName(event.target.value);
    // TODO запрос на изменение бд
  };
  const handleTownChange = (event: {
    target: { value: React.SetStateAction<null | string> };
  }) => {
    setTown(event.target.value);
    // TODO запрос на изменение бд
  };
  const handleBirthDateChange = (value: React.SetStateAction<null | Date>) => {
    setBirthDate(value);
    // TODO запрос на изменение бд
  };
  const hangleIsShowingAgeChange = (event: {
    target: { value: React.SetStateAction<Boolean> };
  }) => {
    if (event.target.value === true) setIsShowingAge(true);
    else setIsShowingAge(false);
    // TODO запрос на изменение бд
  };

  const navigate = useNavigate();

  const deleteProfile = () => {
    navigate("/");
    console.log("Ох НЕТ! Профиль был удален");
    // TODO Добавить удаление профиля
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

        <hr style={{ marginTop: 15 }} />

        <div className="row">
          <div className="form-check col">
            <input
              type="checkbox"
              className="form-check-input"
              id="isShowingAgeCheckbox"
              checked={isShowingAge}
            />
            <label className="form-check-label" htmlFor="isShowingAgeCheckbox">
              Показывать мой возраст
            </label>
            <TooltipComponent message='Если выбрано "Не показывать" - ваш Возраст не будет виден другим пользователям, но продолжит использоваться в алгоритме подбора игроков'></TooltipComponent>
          </div>
        </div>

        <hr style={{ marginTop: 15 }} />

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
