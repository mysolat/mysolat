//https://www.jorgemanrubia.com/2019/02/16/form-validations-with-html5-and-modern-rails/
import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    this.element.setAttribute("novalidate", true);
    this.element.addEventListener("blur", this.onBlur, true);
    this.element.addEventListener("submit", this.onSubmit);
    this.element.addEventListener("ajax:beforeSend", this.onSubmit);
  }

  disconnect() {
    this.element.removeEventListener("blur", this.onBlur);
    this.element.removeEventListener("submit", this.onSubmit);
    this.element.removeEventListener("ajax:beforeSend", this.onSubmit);
  }

  onBlur = (event) => {
    this.validateField(event.target);
  };

  onSubmit = (event) => {
    if (!this.validateForm()) {
      event.preventDefault();
      this.firstInvalidField.focus();
    }
  };

  validateForm() {
    let isValid = true;
    // Not using `find` because we want to validate all the fields
    this.formFields.forEach((field) => {
      if (this.shouldValidateField(field) && !this.validateField(field))
        isValid = false;
    });
    return isValid;
  }

  validateField(field) {
    if (!this.shouldValidateField(field)) return true;
    const isValid = field.checkValidity();
    field.classList.toggle("is-invalid", !isValid);
    this.refreshErrorForInvalidField(field, isValid);
    return isValid;
  }

  shouldValidateField(field) {
    return (
      !field.disabled &&
      !["file", "reset", "submit", "button"].includes(field.type)
    );
  }

  refreshErrorForInvalidField(field, isValid) {
    this.removeExistingErrorMessage(field);
    if (!isValid) {
      this.showErrorForInvalidField(field);
    } else {
      field.classList.toggle("is-valid", true);
    }
  }

  removeExistingErrorMessage(field) {
    const fieldContainer = field.closest(".form-group");
    if (!fieldContainer) return;
    const existingErrorMessageElement = fieldContainer.querySelector(
      ".invalid-feedback"
    );
    if (existingErrorMessageElement)
      existingErrorMessageElement.parentNode.removeChild(
        existingErrorMessageElement
      );
  }

  showErrorForInvalidField(field) {
    field.insertAdjacentHTML("afterend", this.buildFieldErrorHtml(field));
  }

  buildFieldErrorHtml(field) {
    return `<div class="invalid-feedback">${field.validationMessage}</div>`;
  }

  get formFields() {
    return Array.from(this.element.elements);
  }

  get firstInvalidField() {
    return this.formFields.find((field) => !field.checkValidity());
  }
}
