const errorMessage = document.createElement("div");
errorMessage.style.position = "fixed";
errorMessage.style.inset = "0";
errorMessage.style.background = "#fffc";
errorMessage.style.zIndex = "1";
errorMessage.style.visibility = "collapse";
document.body.appendChild(errorMessage);

export function setError(err: unknown) {
  if (!err) {
    errorMessage.style.visibility = "collapse";
    return;
  }
  let errorText = "";
  if (typeof err === "string") errorText = err;
  else if (err instanceof Error) errorText = err.message;
  errorMessage.style.visibility = "visible";
  errorMessage.innerText = errorText;
}
