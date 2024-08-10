const errorMessage = document.getElementById('error')!;

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
