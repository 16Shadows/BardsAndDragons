import React, { useCallback, useEffect, useState } from "react";
import "../css/App.css";
import "../css/ProfilePage.css";
import "../css/react-datepicker.css";
import defaultAvatarPic from "../resources/EmptyProfileAvatar_200px.png";
// Select - https://react-select.com/home
import Select, { OptionsOrGroups, SingleValue } from "react-select";
import DatePicker from "react-datepicker";
import Popup, { PopupButton } from "../components/Popup";
import Button from "../components/Button";
import useSignOut from "../utils/useSignOut";

import TooltipComponent from "../components/TooltipComponent";
import useApi from "../http-common";

import { registerLocale } from "react-datepicker";
import { ru } from "date-fns/locale/ru";
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
  // TODO - сделать state sharing для username и displayName, передавать стейты и в навбар и в профиль, чтобы при обновлении информации профиля имя в навбаре тоже менялось
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [avatarPic, setAvatarPic] = useState<string | null>(null);
  const [townList, setTownList] = useState<OptionsOrGroups<TownForSelect, any>>(
    []
  );
  const [name, setName] = useState<string | null>(null);
  const [town, setTown] = useState<TownForSelect>({ value: "", label: "" });
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [isShowingAge, setIsShowingAge] = useState<boolean>(false);
  const [profileDescription, setProfileDescription] = useState<string | null>(
    null
  );
  const [profileContacts, setProfileContacts] = useState<string | null>(null);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.value === "") setName(null);
    else setName(event.currentTarget.value);
  };
  const handleTownChange = (
    newValue: SingleValue<{ value: string; label: string } | null>
  ) => {
    if (newValue != null) setTown(newValue);
    else return;
  };
  const handleBirthDateChange = (value: React.SetStateAction<null | Date>) => {
    setBirthDate(value);
  };
  const hangleIsShowingAgeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.currentTarget.checked) setIsShowingAge(true);
    else setIsShowingAge(false);
  };
  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (event.currentTarget.value === "") setProfileDescription(null);
    else setProfileDescription(event.currentTarget.value);
  };
  const handleContactsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (event.currentTarget.value === "") setProfileContacts(null);
    else setProfileContacts(event.currentTarget.value);
  };

  const api = useApi();

  const UploadImageToDB = useCallback(
    async (blob: URL | string) => {
      try {
        let blobImage = await fetch(blob).then((res) => res.blob());
        const response = await api.post("images/upload", blobImage, {
          headers: { "Content-Type": blobImage.type },
        });
        return response.data.path;
      } catch (e) {
        alert("Не удалось загрузить изображение на сервер.\n" + e);
      }
      return null;
    },
    [api]
  );

  const SaveChangesToDB = useCallback(async () => {
    try {
      let imagePath = null;

      // Проверка, уже ли картинка из бд. Да, если начало /userimages, нет, если blob:http:
      if (avatarPic) {
        if (avatarPic.startsWith("blob")) {
          imagePath = await UploadImageToDB(avatarPic);
          if (imagePath !== undefined) {
            setAvatarPic(imagePath);
          }
        }
      }

      await api.post("user/@current", {
        avatar: imagePath,
        displayName: name,
        city: town.value === "" ? null : town.value,
        birthday: birthDate,
        shouldDisplayAge: isShowingAge,
        description: profileDescription,
        contactInfo: profileContacts,
      });
    } catch (e) {
      alert("Не удалось сохранить изменения профиля на сервере.\n" + e);
    }
  }, [
    UploadImageToDB,
    api,
    avatarPic,
    birthDate,
    isShowingAge,
    name,
    profileContacts,
    profileDescription,
    town.value,
  ]);

  const DeleteProfile = useSignOut(
    useCallback(async () => {
      try {
        await api.post("user/@current/delete", {});
        return true;
      } catch (e) {
        alert("Не удалось удалить профиль.\n" + e);
        return false;
      }
    }, [api])
  );

  const DeleteProfileButtons = [
    {
      text: "Удалить",
      action: () => {
        DeleteProfile();
      },
      variant: "danger",
    },

    {
      text: "Отмена",
      action: () => {},
      variant: "primary",
    },
  ] as PopupButton[];

  const SaveProfileButtons = [
    {
      text: "Сохранить",
      action: () => {
        setIsEditing(false);
        SaveChangesToDB();
      },
      variant: "primary",
    },

    {
      text: "Отмена",
      action: () => {},
      variant: "primary",
      outline: true,
    },
  ] as PopupButton[];

  useEffect(() => {
    async function getCitiesQuery() {
      try {
        const response = await api.get("cities", {});

        const list = response.data.map((x: string) => {
          // TODO добавить локализацию городов, значение value из бд и label локализован
          return { value: x, label: x };
        });
        setTownList(list);
      } catch (e) {
        alert("Не удалось загрузить список городов.\n" + e);
      }
    }
    getCitiesQuery();
    async function getProfileInfoQuery() {
      try {
        const response = await api.get("user/@current", {});

        // TODO заменить на хранение на клиенте, не запрашивать
        setUsername(response.data.username);
        setEmail(response.data.email);
        response.data.displayName && setName(response.data.displayName);
        response.data.description &&
          setProfileDescription(response.data.description);
        response.data.contactInfo &&
          setProfileContacts(response.data.contactInfo);
        // Создаем объект города, TODO добавить локализацию  label
        response.data.city &&
          setTown({ value: response.data.city, label: response.data.city });
        response.data.avatar && setAvatarPic("/" + response.data.avatar);
        response.data.birthday && setBirthDate(response.data.birthday);
        response.data.shouldDisplayAge &&
          setIsShowingAge(response.data.shouldDisplayAge);
      } catch (e) {
        alert("Не удалось загрузить данные профиля.\n" + e);
      }
    }
    getProfileInfoQuery();
  }, [api]);

  // Превью загруженной аватарки
  function onAvatarUpload(event: any) {
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
            alt="Ошибка загрузки аватара"
            src={avatarPic ?? defaultAvatarPic}
          />
          {!avatarPic && (
            <div>
              <small className="form-text text-red">
                Необходимо добавить изображение
              </small>
            </div>
          )}
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
              <label
                className={name ? "col-form-label" : "col-form-label text-red"}
              >
                Отображаемое имя:
              </label>
            </div>

            <div className="row">
              <label className="col-form-label">Почта:</label>
            </div>

            <div className="row">
              <label
                className={
                  town.value !== ""
                    ? "col-form-label"
                    : "col-form-label text-red"
                }
              >
                Город:
              </label>
            </div>

            <div className="row">
              <label
                className={
                  birthDate ? "col-form-label" : "col-form-label text-red"
                }
              >
                Дата рождения:
              </label>
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
                className=" form-conrol"
                required={true}
                disabled={!isEditing}
                name="name"
                maxLength={32}
                type="text"
                placeholder={username}
                value={name ?? ""}
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
                value={town}
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
                    selected={birthDate}
                    onChange={handleBirthDateChange}
                    // При некорректном, неполном или пустом вводе дата = null
                    onChangeRaw={() => {
                      handleBirthDateChange(null);
                    }}
                  />
                </div>
              </div>{" "}
            </div>
          </div>
          {(!birthDate || !name || town.value === "") && (
            <div>
              <small className="form-text text-red">
                Необходимо заполнить все поля профиля
              </small>
            </div>
          )}
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
              <TooltipComponent
                mainText={"(?)"}
                delayHide={450}
                delayShow={300}
                placement="top"
              >
                Если выбрано "Не показывать" - ваш возраст не будет виден другим
                пользователям, но продолжит использоваться в алгоритме подбора
                игроков
              </TooltipComponent>
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
              value={profileDescription ?? ""}
              onChange={handleDescriptionChange}
              placeholder="Опишите ваши интересы, предпочтения в играх и т.п."
            ></textarea>
            <small id="DescriptionHelpText" className="form-text">
              Описание профиля видно всем пользователям
            </small>
            {!profileDescription && (
              <div>
                <small className="form-text text-red">
                  Необходимо заполнить описание профиля
                </small>
              </div>
            )}
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
              value={profileContacts ?? ""}
              onChange={handleContactsChange}
              placeholder="Например, ссылка на аккаунт в Телеграме, ВКонтакте, адрес электронной почты..."
            ></textarea>
            <small className="form-text">
              Контакты видны только вашим друзьям <br />
            </small>
            <small className="form-text text-red">
              Пожалуйста, оставьте{" "}
              <strong className="text-red">актуальные</strong> контакты, по
              которым другие игроки смогут с вами связаться и позвать поиграть!
            </small>
            {!profileContacts && (
              <div>
                <small className="form-text text-red">
                  Необходимо заполнить контакты
                </small>
              </div>
            )}
          </div>
        </div>
        <hr style={{ marginTop: 15 }} />

        <div className="row mb-2">
          {isEditing ? (
            avatarPic !== null &&
            name !== null &&
            town.value !== "" &&
            birthDate !== null &&
            profileDescription !== null &&
            profileContacts !== null ? (
              <Button
                key={"doneRedactingButton"}
                color="primary"
                children="Сохранить изменения"
                onClick={() => {
                  // Такие же действия у кнопки в SaveProfileButtons, при изменении учитывать
                  setIsEditing(false);
                  SaveChangesToDB();
                }}
              ></Button>
            ) : (
              <Popup
                popupButtonText="Сохранить изменения"
                popupButtonVariant="primary"
                show={false}
                title="Сохранение изменений профиля"
                message={
                  <div>
                    Внимание, вы не заполнили поля:
                    <ul>
                      {[
                        avatarPic ? null : "Изображение профиля",
                        name ? null : "Отображаемое имя",
                        town.value !== "" ? null : "Город",
                        birthDate ? null : "Дата рождения",
                        profileDescription ? null : "Описание профиля",
                        profileContacts ? null : "Контакты",
                      ]
                        .filter(function (e) {
                          return e;
                        })
                        .map((obj) => (
                          <li>{obj}</li>
                        ))}
                    </ul>
                    Вы <strong>не сможете</strong> участвовать в поиске друзей и
                    другие не смогут вас найти через него.
                    <br />
                    Вы уверены, что хотите сохранить изменения профиля?
                  </div>
                }
                buttons={SaveProfileButtons}
              />
            )
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

        <div className="row mb-2">
          <Popup
            popupButtonText="Удалить профиль"
            popupButtonVariant="danger"
            show={false}
            title="Удаление профиля"
            message={
              <div>
                {" "}
                Вы уверены, что хотите удалить профиль{" "}
                <strong>{username}</strong>?
                <br /> Отменить это действие будет невозможно!
              </div>
            }
            buttons={DeleteProfileButtons}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
