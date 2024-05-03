import React, { useState } from "react";
import "../css/App.css";
import "../css/ProfilePage.css";
import "../css/react-datepicker.css";
import avatarpic from "../resources/EmptyProfileAvatar_200px.png";
// Datepicker - https://reactdatepicker.com/
import DatePickerInput from "./DatePicker";
// Select - https://react-select.com/home
import Select from "react-select";
import PopupButton from "../interfaces/PopupButtonInterface";
import Popup from "./Popup";
import Button from "./Button";

import { registerLocale, setDefaultLocale } from "react-datepicker";
import ru from "date-fns/locale/ru";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import { set } from "date-fns";
import { useNavigate } from "react-router-dom";
import TooltipComponent from "./TooltipComponent";

registerLocale("ru", ru);

const ProfilePage = () => {
  // Изменение режима редактирования по кнопке
  const [isEditing, setIsEditing] = useState(true);
  // TODO Запрос данных из бд
  const nickname = "Тестовый_Ник";
  const email = "Тест@ya.ru";
  const townList = ["Москва", "Пермь", "Верхняя Колва"];
  // TODO Запрос данных из бд
  const [name, setName] = useState<string | null>(null);
  const [town, setTown] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [isShowingAge, setIsShowingAge] = useState<boolean>(false);
  const [profileDescription, setProfileDescription] = useState<string | null>(
    null
  );
  const [profileContacts, setProfileContacts] = useState<string | null>(null);

  const handleNameChange = (event: {
    target: { value: React.SetStateAction<null | string> };
  }) => {
    if (event.target.value === "") setName(null);
    else setName(event.target.value);
    // запрос на изменение бд идет при сохранении изменений
  };
  const handleTownChange = (event: {
    target: { value: React.SetStateAction<null | string> };
  }) => {
    setTown(event.target.value);
    // запрос на изменение бд идет при сохранении изменений
  };
  const handleBirthDateChange = (value: React.SetStateAction<null | Date>) => {
    setBirthDate(value);
    // запрос на изменение бд идет при сохранении изменений
  };
  const hangleIsShowingAgeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) setIsShowingAge(true);
    else setIsShowingAge(false);
    // запрос на изменение бд идет при сохранении изменений
  };
  const handleDescriptionChange = (event: {
    target: { value: React.SetStateAction<null | string> };
  }) => {
    if (event.target.value === "") setProfileDescription(null);
    else setProfileDescription(event.target.value);
    // запрос на изменение бд идет при сохранении изменений
  };
  const handleContactsChange = (event: {
    target: { value: React.SetStateAction<null | string> };
  }) => {
    if (event.target.value === "") setProfileContacts(null);
    else setProfileContacts(event.target.value);
    // запрос на изменение бд идет при сохранении изменений
  };

  const SaveChangesToDB = () => {
    console.log("Все изменения были сохранены в БД.");
    // TODO запрос на изменение бд этого конкретного пользователя
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
                placeholder="Не выбран"
                value={town ? town : ""}
                onChange={handleTownChange}
              ></input>
              {/* <DropdownList></DropdownList> */}

              <div className="row">
                <div className="col DatePicker">
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
          <div className="col">
            <div className="form-check col">
              <input
                disabled={!isEditing}
                type="checkbox"
                className="form-check-input"
                id="isShowingAgeCheckbox"
                checked={isShowingAge}
                onChange={hangleIsShowingAgeChange}
              />
              <label className="form-check-label">Показывать мой возраст</label>
              <TooltipComponent message='Если выбрано "Не показывать" - ваш Возраст не будет виден другим пользователям, но продолжит использоваться в алгоритме подбора игроков'></TooltipComponent>
            </div>
          </div>
        </div>

        <hr style={{ marginTop: 15 }} />

        <div className="row">
          <div className="col">
            <label htmlFor="ProfileDescription">Описание профиля</label>
            <textarea
              rows={4}
              maxLength={300}
              className="form-control"
              id="ProfileDescription"
              disabled={!isEditing}
              value={profileDescription ? profileDescription : ""}
              onChange={handleDescriptionChange}
              placeholder="Опишите ваши интересы, предпочтения в играх и т.п."
            ></textarea>
            <small id="DescriptionHelpText" className="form-text text-red">
              Описание профиля видно всем пользователям
            </small>
          </div>
        </div>

        <hr style={{ marginTop: 15 }} />
        <div className="row">
          <div className="col">
            <label htmlFor="ProfileContacts">Контакты</label>
            <textarea
              rows={4}
              maxLength={300}
              className="form-control"
              id="ProfileContacts"
              disabled={!isEditing}
              value={profileContacts ? profileContacts : ""}
              onChange={handleContactsChange}
              placeholder="Например, ссылка на аккаунт в Телеграме, ВКонтакте, адрес электронной почты..."
            ></textarea>
            <small id="DescriptionHelpText" className="form-text text-red">
              <>
                Пожалуйста, оставьте актуальные контакты, по которым другие
                игроки смогут с вами связаться и позвать поиграть!
              </>
              <>Контакты видны только вашим друзьям</>
            </small>
          </div>
        </div>
        <hr style={{ marginTop: 15 }} />

        <div className="row mb-2">
          {/* TODO сдвинуть кнопки в центр строки хоть как нибудь */}
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
              color="primary"
              outline={true}
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
