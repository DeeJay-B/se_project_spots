export function setButtontext(
  btn,
  isLoading,
  defaultText = "Save",
  loadingText = "Saving..."
) {
  if (isLoading) {
    btn.innerHTML = "Loading...";
  } else {
    btn.innerHTML = "Submit";
  }
}
