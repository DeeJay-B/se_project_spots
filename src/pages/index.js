import {
  enableValidation,
  validationConfig,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import "../pages/index.css";
import Api from "../utils/Api.js";
import { setButtonText } from "../utils/helpers.js";

// Declare cardTemplate before using it
const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "54273f74-b0c9-4977-a451-bfc48ef2742e",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, userData]) => {
    if (Array.isArray(cards) && userData) {
      profileName.textContent = userData.name;
      profileDescription.textContent = userData.about;
      profileAvatar.src = userData.avatar;

      cards.forEach((item) => {
        const cardElement = getCardElement(item);
        cardsList.append(cardElement);
      });
    } else {
      throw new Error("Invalid data format");
    }
  })
  .catch((error) => {
    console.error("Failed to fetch app info:", error);
  });

// profile elements
const profileEditButton = document.querySelector(".profile__edit-button");
const cardModalButton = document.querySelector(".profile__add-button");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__avatar");
const avatarEditButton = document.querySelector(".profile__avatar-btn"); // Declare avatarEditButton only once

// Edit form elements
const editModal = document.querySelector("#edit-profile-modal");
const editFormElement = editModal.querySelector(".modal__form");
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);
const editSubmitBtn = editModal.querySelector(".modal__submit-btn");

// Card form elements
const cardModal = document.querySelector("#add-card-modal");
const cardForm = cardModal.querySelector(".modal__form");
const cardSubmitBtn = cardModal.querySelector(".modal__submit-btn");
const cardModalCloseButton = cardModal.querySelector(".modal__close-btn");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");

// Delete form elements
const deleteModal = document.querySelector("#delete-modal");
const deleteModalCloseButton = deleteModal.querySelector(".modal__close-btn");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteModalSubmitBtn = deleteModal.querySelector(
  ".modal__submit-btn-delete"
);
const cancelModalButton = deleteModal.querySelector(".modal__cancel-btn");

// Avatar form elements
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarModalCloseButton = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

// Preview image popup
const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const previewModalCloseButton = previewModal.querySelector(".modal__close-btn");

let selectedCard, selectedCardID;

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-button");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-button");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  // Retrieve like state from local storage
  const isLiked = localStorage.getItem(`liked_${data._id}`) === "true";
  if (isLiked) {
    cardLikeBtn.classList.add("card__like-button_liked");
  }

  cardLikeBtn.addEventListener("click", () => {
    if (cardLikeBtn.classList.contains("card__like-button_liked")) {
      api
        .dislikeCard(data._id)
        .then(() => {
          cardLikeBtn.classList.remove("card__like-button_liked");
          localStorage.setItem(`liked_${data._id}`, "false");
        })
        .catch((error) => {
          console.error("Failed to unlike card:", error);
        });
    } else {
      api
        .likeCard(data._id)
        .then(() => {
          cardLikeBtn.classList.add("card__like-button_liked");
          localStorage.setItem(`liked_${data._id}`, "true");
        })
        .catch((error) => {
          console.error("Failed to like card:", error);
        });
    }
  });

  cardDeleteBtn.addEventListener("click", () => {
    handleDeleteCard(cardElement, data._id); // Pass the card element and its ID
  });

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
    previewModalCaptionEl.textContent = data.name;
  });

  return cardElement;
}

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(editFormElement, validationConfig); // Call resetValidation when opening the profile modal
  openModal(editModal);
});

editModalCloseBtn.addEventListener("click", () => {
  closeModal(editModal);
});

cardModalButton.addEventListener("click", () => {
  openModal(cardModal);
  disableButton(cardSubmitBtn, validationConfig.inactiveButtonClass);
});

cardModalCloseButton.addEventListener("click", () => {
  closeModal(cardModal);
});

// Open avatar modal

avatarModalCloseButton.addEventListener("click", () => {
  closeModal(avatarModal);
});

deleteModalCloseButton.addEventListener("click", () => {
  closeModal(deleteModal);
});

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardID = cardId;
  openModal(deleteModal);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  setButtonText(deleteModalSubmitBtn, true, "Yes, delete", "Deleting...");
  api
    .deleteCard(selectedCardID)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch((error) => {
      console.error("Failed to delete card:", error);
    })
    .finally(() => {
      setButtonText(deleteModalSubmitBtn, false, "Yes, delete");
    });
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  modal.addEventListener("mousedown", handleOverlayClick);
  document.addEventListener("keydown", handleEscClose);
}

function closeModal(modal) {
  if (modal && modal.classList) {
    modal.classList.remove("modal_opened");
    document.removeEventListener("keydown", handleEscClose);
    modal.removeEventListener("mousedown", handleOverlayClick);
  } else {
    console.error(
      "Modal element is undefined or does not have classList property"
    );
  }
}

function handleEscClose(evt) {
  if (evt.key === "Escape") {
    const openModal = document.querySelector(".modal_opened");
    if (openModal) {
      closeModal(openModal);
    }
  }
}

function handleOverlayClick(evt) {
  if (evt.target.classList.contains("modal_opened")) {
    closeModal(evt.target);
  }
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  setButtonText(editSubmitBtn, true);
  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
      disableButton(
        editFormElement.querySelector(validationConfig.submitButtonSelector),
        validationConfig.inactiveButtonClass
      ); // Disable button after successful submission
    })
    .catch((error) => {
      console.error("Failed to edit user info:", error);
    })
    .finally(() => {
      setButtonText(editSubmitBtn, false);
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  setButtonText(cardSubmitBtn, true);
  const inputValues = { name: cardNameInput.value, link: cardLinkInput.value };
  api
    .addCard(inputValues)
    .then((data) => {
      const cardElement = getCardElement(data);
      cardsList.prepend(cardElement);
      closeModal(cardModal);
      cardForm.reset(); // Clear inputs after successful submission
      disableButton(cardSubmitBtn, validationConfig.inactiveButtonClass); // Disable button after successful submission
    })
    .catch((error) => {
      console.error("Failed to add card:", error);
    })
    .finally(() => {
      setButtonText(cardSubmitBtn, false);
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  setButtonText(avatarSubmitBtn, true);
  api
    .editUserAvatar(avatarInput.value)
    .then((data) => {
      profileAvatar.src = data.avatar;
      closeModal(avatarModal);
      disableButton(avatarSubmitBtn, validationConfig.inactiveButtonClass); // Disable button after successful submission
    })
    .catch((error) => {
      console.error("Failed to edit user avatar:", error);
    })
    .finally(() => {
      setButtonText(avatarSubmitBtn, false);
    });
}

// function disableButton(button, inactiveButtonClass) {
//   button.classList.add(inactiveButtonClass);
//   button.disabled = true;
// }

// function hideInputError(formElement, inputElement, validationConfig) {
//   const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
//   if (errorElement) {
//     inputElement.classList.remove(validationConfig.inputErrorClass);
//     errorElement.classList.remove(validationConfig.errorClass);
//     errorElement.textContent = "";
//   }
// }

// function toggleButtonState(inputList, buttonElement, validationConfig) {
//   if (hasInvalidInput(inputList)) {
//     buttonElement.classList.add(validationConfig.inactiveButtonClass);
//     buttonElement.disabled = true;
//   } else {
//     buttonElement.classList.remove(validationConfig.inactiveButtonClass);
//     buttonElement.disabled = false;
//   }
// }

// function hasInvalidInput(inputList) {
//   return inputList.some((inputElement) => {
//     return !inputElement.validity.valid;
//   });
// }

previewModalCloseButton.addEventListener("click", () => {
  closeModal(previewModal);
});

// Open avatar modal
avatarEditButton.addEventListener("click", () => {
  openModal(avatarModal);
  avatarForm.reset();
  disableButton(avatarSubmitBtn, validationConfig.inactiveButtonClass);
});

// Handle avatar form submit
avatarForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  setButtonText(avatarSubmitBtn, true);
  api
    .editUserAvatar(avatarInput.value)
    .then((data) => {
      profileAvatar.src = data.avatar;
      closeModal(avatarModal);
      disableButton(avatarSubmitBtn, validationConfig.inactiveButtonClass); // Disable button after successful submission
    })
    .catch((error) => {
      console.error("Failed to edit user avatar:", error);
    })
    .finally(() => {
      setButtonText(avatarSubmitBtn, false);
    });
});

deleteForm.addEventListener("submit", handleDeleteSubmit);

cancelModalButton.addEventListener("click", () => {
  closeModal(deleteModal);
});

editFormElement.addEventListener("submit", handleEditFormSubmit);

cardForm.addEventListener("submit", handleAddCardSubmit);

enableValidation(validationConfig);
