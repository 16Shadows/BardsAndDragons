import React, { ChangeEvent, useEffect, useState } from "react";
import "../css/App.css";
import "../css/ProfilePage.css";
import "../css/react-datepicker.css";
import defaultAvatarPic from "../resources/EmptyProfileAvatar_200px.png";

// Select - https://react-select.com/home
import Select, { OptionsOrGroups, SingleValue } from "react-select";
// Datepicker - https://reactdatepicker.com/
// import DatePickerInput from "../components/DatePicker";
import DatePicker from "react-datepicker";
import PopupButton from "../interfaces/PopupButtonInterface";
import Popup from "../components/Popup";
import Button from "../components/Button";

import { useNavigate } from "react-router-dom";
import TooltipComponent from "../components/TooltipComponent";
import useApi from "../http-common";

import { registerLocale } from "react-datepicker";
import ru from "date-fns/locale/ru";
registerLocale("ru", ru);

interface TownForSelect {
  value: string;
  label: string;
}

const ProfilePage = () => {
  // Изменение режима редактирования по кнопке
  const [isEditing, setIsEditing] = useState(false);
  // setUsername setEmail используются при запросе данных из бд, они не меняют данные в бд
  // TODO сохранить на клиенте почту и никнейм, сделать константами и не запрашивать их
  // TODO поля город и аватар нельзя поставить null, контакты должны быть заполнены
  const [avatarPic, setAvatarPic] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [townList, setTownList] = useState<
    OptionsOrGroups<TownForSelect, any> | undefined
  >([]);
  const [name, setName] = useState<string | null>(null);
  const [town, setTown] = useState<TownForSelect>({ value: "", label: "" });
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
  const handleTownChange = (
    newValue: SingleValue<{ value: string; label: string } | null>,
    action: any
  ) => {
    if (newValue != null) setTown(newValue);
    else return;
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

  const navigate = useNavigate();
  const api = useApi();

  const getCitiesQuery = async () => {
    // GET запрос списка городов к серверу
    api
      .get("cities", {})
      .then((response) => {
        const a = response.data.map((x: string) => {
          // TODO добавить локализацию городов, значение из бд и label локализован
          return { value: x, label: x };
        });
        setTownList(a);
      })
      .catch((error) => {
        console.error(error);
        alert(error.message);
      });
  };

  const getProfileInfoQuery = async () => {
    api
      .get("user/@current", {})
      .then(async (response) => {
        // TODO заменить на хранение на клиенте, не запрашивать
        setUsername(response.data.username);
        setEmail(response.data.email);
        //
        response.data.displayName && setName(response.data.displayName);
        response.data.description &&
          setProfileDescription(response.data.description);
        response.data.contactInfo &&
          setProfileContacts(response.data.contactInfo);
        // Создаем объект города, TODO добавить локализацию  label
        response.data.city &&
          setTown({ value: response.data.city, label: response.data.city });
        // TODO обработка установки картинки
        response.data.avatar && setAvatarPic(response.data.avatar);
        response.data.birthday && setBirthDate(response.data.birthday);
        response.data.shouldDisplayAge &&
          setIsShowingAge(response.data.shouldDisplayAge);
      })
      .catch((error) => {
        console.error(error);
        alert(error.message);
      });
  };

  const UploadImageToDB = async (blob: URL | string) => {
    if (avatarPic) {
      let blobImage = await fetch(blob).then((res) => res.blob());
      console.log(blobImage);

      const path = await api
        .post("images/upload", blobImage, {
          headers: { "Content-Type": blobImage.type },
        })
        .then((response) => {
          return response.data.path;
        })
        .catch((error) => {
          console.error(error);
          alert(error.message);
        });

      return path;
    }
  };

  const SaveChangesToDB = async () => {
    let imagePath = null;

    // Проверка, уже ли картинка из бд. Да, если перед / userimages, нет, если "blob:http:
    if (avatarPic) {
      let res = avatarPic.split("/");
      if (res[0] !== "userimages") {
        imagePath = await UploadImageToDB(avatarPic);
        setAvatarPic(imagePath);
      }
    }

    api
      .post("user/@current", {
        avatar: imagePath,
        displayName: name,
        city: town.value,
        birthday: birthDate,
        shouldDisplayAge: isShowingAge,
        description: profileDescription,
        contactInfo: profileContacts,
      })
      .then((response) => {})
      .catch((error) => {
        console.error(error);
        alert(error.message);
      });
  };

  const deleteProfile = () => {
    navigate("/");
    console.log("Ох НЕТ! Профиль был удален");
    // TODO Добавить запрос на удаление профиля
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

  useEffect(() => {
    getCitiesQuery();
    getProfileInfoQuery();
  }, []); // [] - Запросы идут только при первом рендере страницы

  // Превью загруженной аватарки
  async function onAvatarUpload(event: any) {
    // Временный юрл, после обновления страницы сотрет данные о картинке
    let st = URL.createObjectURL(event.target.files[0]);
    setAvatarPic(st);
  }

  return (
    <div className="d-flex flex-column content">
      <div className="bg-white row">
        <div className="col pic-col">
          <img
            id="profile_pic"
            className="profile_image mb-2"
            alt="Profile avatar"
            src={avatarPic ? "/" + avatarPic : defaultAvatarPic}
          />
          <div className="row">
            {isEditing && (
              <div className="col">
                <input
                  type="file"
                  accept=".jpeg,.png"
                  onChange={onAvatarUpload}
                ></input>
              </div>
            )}
          </div>
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

        <div className="col value-column">
          <div className="row">
            <div className="col col-form-label">
              <label className="">{username}</label>
            </div>
          </div>

          <div className="row">
            <div className="col col-form-label">
              <input
                required={true}
                disabled={!isEditing}
                name="name"
                type="text"
                placeholder={username}
                value={name ? name : ""}
                onChange={handleNameChange}
                style={{ width: "inherit" }}
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
              <Select
                options={townList}
                onChange={handleTownChange}
                isDisabled={!isEditing}
                placeholder={"Не выбран"}
                value={town ? town : null}
              />

              <div className="row">
                <div className="col DatePicker">
                  <DatePicker
                    wrapperClassName="datePicker"
                    disabled={!isEditing}
                    minDate={new Date(1900, 0)}
                    maxDate={new Date()}
                    locale="ru"
                    showIcon
                    dateFormat="dd/MM/yyyy"
                    selected={birthDate ? birthDate : null}
                    onChange={handleBirthDateChange}
                    // При некорректном, неполном или пустом вводе дата = null
                    onChangeRaw={() => {
                      handleBirthDateChange(null);
                    }}
                  />
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
              <TooltipComponent message='Если выбрано "Не показывать" - ваш возраст не будет виден другим пользователям, но продолжит использоваться в алгоритме подбора игроков'></TooltipComponent>
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
          {isEditing ? (
            <Button
              key={"doneRedactingButton"}
              color="primary"
              children="Сохранить изменения"
              onClick={() => {
                setIsEditing(false);
                SaveChangesToDB();
              }}
            ></Button>
          ) : (
            // TODO добавить отключение кнопки, если есть незаполненные необходимые поля (town, contacts), подсвечивать поля
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
              username +
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
