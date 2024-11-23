export const validationConfig = {
  formSelector: ".modal__form",
  inputSelector: ".modal__input",
  submitButtonSelector: ".modal__submit-btn",
  inactiveButtonClass: "modal__button_disabled",
  inputErrorClass: "modal__input_type_error",
  errorClass: "modal__error_visible",
};

function disableButton(buttonElement, inactiveButtonClass) {
  buttonElement.classList.add(inactiveButtonClass);
  buttonElement.disabled = true;
}

const setEventListeners = (formEl, config) => {
  const inputList = Array.from(formEl.querySelectorAll(config.inputSelector));
  const buttonElement = formEl.querySelector(config.submitButtonSelector);

  toggleButtonState(inputList, buttonElement, config.inactiveButtonClass);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formEl, inputElement, config);
      toggleButtonState(inputList, buttonElement, config.inactiveButtonClass);
    });
  });
};

const resetValidation = (formEl, config) => {
  const inputList = Array.from(formEl.querySelectorAll(config.inputSelector));
  const submitButton = formEl.querySelector(config.submitButtonSelector);
  inputList.forEach((inputElement) => {
    hideInputError(formEl, inputElement, config);
  });

  toggleButtonState(inputList, submitButton, config.inactiveButtonClass);
};

const checkInputValidity = (formEl, inputElement, config) => {
  if (!inputElement.validity.valid) {
    showInputError(
      formEl,
      inputElement,
      inputElement.validationMessage,
      config
    );
  } else {
    hideInputError(formEl, inputElement, config);
  }
};

const showInputError = (formEl, inputElement, errorMsg, config) => {
  const errorMsgEl = formEl.querySelector(`#${inputElement.id}-error`);
  errorMsgEl.textContent = errorMsg;
  inputElement.classList.add(config.inputErrorClass);
};

const hideInputError = (formEl, inputElement, config) => {
  const errorMsgEl = formEl.querySelector(`#${inputElement.id}-error`);
  errorMsgEl.textContent = "";
  inputElement.classList.remove(config.inputErrorClass);
};

const hasInvalidInput = (inputList) => {
  return inputList.some((input) => !input.validity.valid);
};

const toggleButtonState = (inputList, buttonElement, inactiveButtonClass) => {
  if (hasInvalidInput(inputList)) {
    disableButton(buttonElement, inactiveButtonClass);
  } else {
    buttonElement.classList.remove(inactiveButtonClass);
    buttonElement.disabled = false;
  }
};

const resetFormAndButton = (formEl, config) => {
  formEl.reset();
  const inputList = Array.from(formEl.querySelectorAll(config.inputSelector));
  const submitButton = formEl.querySelector(config.submitButtonSelector);

  inputList.forEach((inputElement) =>
    hideInputError(formEl, inputElement, config)
  );
  disableButton(submitButton, config.inactiveButtonClass);
};

export const enableValidation = (config) => {
  const formList = Array.from(document.querySelectorAll(config.formSelector));
  formList.forEach((formEl) => {
    setEventListeners(formEl, config);
  });
};
