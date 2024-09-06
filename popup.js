document.getElementById("saveUrl").addEventListener("click", function () {
  const urlInput = document.getElementById("urlInput").value;

  // Validate URL
  if (!isValidUrl(urlInput)) {
    document.getElementById("status").textContent = "Please enter a valid URL!";
    return;
  }

  // Inject a content script into the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: injectFloatingWindow,
      args: [urlInput],
    });
  });
});

// Validate if the entered string is a valid URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// The function that will be injected into the tab
function injectFloatingWindow(url) {
  // Create an iframe for the floating window
  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.position = "fixed";
  iframe.style.width = "400px";
  iframe.style.height = "300px";
  iframe.style.top = "10px";
  iframe.style.right = "10px";
  iframe.style.zIndex = "10000";
  iframe.style.border = "1px solid black";
  iframe.style.borderRadius = "5px";
  iframe.style.backgroundColor = "white";

  // Append iframe to the body
  document.body.appendChild(iframe);

  // Close button for the iframe
  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.style.position = "fixed";
  closeButton.style.top = "10px";
  closeButton.style.right = "420px";
  closeButton.style.zIndex = "10001";
  closeButton.addEventListener("click", () => {
    iframe.remove();
    closeButton.remove();
    openInTabButton.remove();
  });

  document.body.appendChild(closeButton);

  const openInTabButton = document.createElement("button");
  openInTabButton.textContent = "Open in New Tab";
  openInTabButton.style.position = "fixed";
  openInTabButton.style.top = "50px"; // Position it below the Close button
  openInTabButton.style.right = "420px";
  openInTabButton.style.zIndex = "10001";
  openInTabButton.addEventListener("click", () => {
    // Open the URL in a new tab
    window.open(url, "_blank");

    // Remove the iframe and buttons
    iframe.remove();
    closeButton.remove();
    openInTabButton.remove();
  });

  document.body.appendChild(openInTabButton);
}
