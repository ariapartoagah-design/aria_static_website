"use strict";

const form = document.querySelector("#request-form");
const options = [...form.querySelectorAll('input[name="service"]')];
const choiceError = document.querySelector("#service-error");
const status = document.querySelector("#status");
const originatingService = new URLSearchParams(location.search).get("service");
const preselected = options.find(option => option.value !== "guidance" && option.value === originatingService);

if (preselected) {
  preselected.checked = true;
}

form.elements["city-unknown"].addEventListener("change", event => {
  const city = form.elements.city;
  city.disabled = event.target.checked;
  city.required = !event.target.checked;
});

form.addEventListener("change", () => {
  if (options.some(option => option.checked)) {
    choiceError.hidden = true;
  }
  status.textContent = "";
});

const requestEndpoint = "https://script.google.com/macros/s/AKfycbx5sf14ujxI0r3B3JuhIic-ifJI7g7QT-IuyZffihdJ4CKVehPrS4osBjle0F8cU5Fm/exec";
const submitButton = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (submitButton.disabled) return;

  const hasService = options.some(option => option.checked);
  choiceError.hidden = hasService;
  if (!hasService) {
    options[0].focus();
    return;
  }

  const fields = new URLSearchParams(new FormData(form));
  submitButton.disabled = true;
  status.textContent = "در حال ارسال درخواست…";

  try {
    const response = await fetch(requestEndpoint, {
      method: "POST",
      credentials: "omit",
      body: fields,
    });
    if (!response.ok) throw new Error("Request failed");

    const result = await response.json();
    if (result.ok !== true) {
      status.textContent = result.message || "ثبت درخواست انجام نشد. لطفاً دوباره تلاش کنید.";
      return;
    }

    form.reset();
    form.elements.city.disabled = false;
    form.elements.city.required = true;
    if (preselected) preselected.checked = true;
    status.textContent = "درخواست شما دریافت شد.";
  } catch {
    status.textContent = "تأیید ثبت دریافت نشد. پیش از ارسال دوباره، با شرکت پیگیری کنید.";
  } finally {
    submitButton.disabled = false;
  }
});

submitButton.disabled = false;
