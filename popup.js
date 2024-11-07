document.getElementById("saveUrl").addEventListener("click", async function () {
  const urlInput = document.getElementById("urlInput").value;

  // Validate URL
  if (!isValidUrl(urlInput)) {
    document.getElementById("status").textContent = "Please enter a valid URL!";
    return;
  }

  // Check if the URL allows embedding in an iframe
  const canEmbed = await canEmbedInIframe(urlInput);
  if (!canEmbed) {
    document.getElementById("status").textContent =
      "This website does not support this feature!";
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

// Check if the requested website allows embedding
async function canEmbedInIframe(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const xFrameOptions = response.headers.get("X-Frame-Options");
    const contentSecurityPolicy = response.headers.get(
      "Content-Security-Policy"
    );

    if (
      xFrameOptions &&
      (xFrameOptions.includes("DENY") || xFrameOptions.includes("SAMEORIGIN"))
    ) {
      return false;
    }

    if (
      contentSecurityPolicy &&
      contentSecurityPolicy.includes("frame-ancestors")
    ) {
      const frameAncestors = contentSecurityPolicy.match(
        /frame-ancestors\s*([^;]*)/
      );
      if (frameAncestors && frameAncestors[1].includes("none")) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error checking iframe embedding:", error);
    return false;
  }
}

// Floating window injection function
function injectFloatingWindow(url) {
  // Create a container div for the iframe and buttons
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.width = "400px";
  container.style.height = "300px";
  container.style.top = "10px";
  container.style.right = "10px";
  container.style.zIndex = "10000";
  container.style.border = "1px solid black";
  container.style.borderRadius = "5px";
  container.style.backgroundColor = "white";

  // Create an iframe for the floating window
  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";

  // Append iframe to the container
  container.appendChild(iframe);

  // Append container to the body
  document.body.appendChild(container);

  // Close button for the container
  const closeButton = document.createElement("button");
  closeButton.style.backgroundColor = "solid white";
  closeButton.style.border = "0px";
  closeButton.style.cursor = "pointer";
  closeButton.style.position = "absolute";
  closeButton.style.top = "12px";
  closeButton.style.left = "0px";
  closeButton.style.zIndex = "10001";
  closeButton.innerHTML = `
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 122.88 122.88" style="enable-background:new 0 0 122.88 122.88; width: 20px; height: 20px;" xml:space="preserve">
      <style type="text/css">.st0{fill-rule:evenodd;clip-rule:evenodd;}</style>
      <g><path class="st0" d="M1.63,97.99l36.55-36.55L1.63,24.89c-2.17-2.17-2.17-5.73,0-7.9L16.99,1.63c2.17-2.17,5.73-2.17,7.9,0
        l36.55,36.55L97.99,1.63c2.17-2.17,5.73-2.17,7.9,0l15.36,15.36c2.17,2.17,2.17,5.73,0,7.9L84.7,61.44l36.55,36.55
        c2.17,2.17,2.17,5.73,0,7.9l-15.36,15.36c-2.17,2.17-5.73,2.17-7.9,0L61.44,84.7l-36.55,36.55c-2.17,2.17-5.73,2.17-7.9,0
        L1.63,105.89C-0.54,103.72-0.54,100.16,1.63,97.99L1.63,97.99z"/>
      </g>
    </svg>
  `;
  closeButton.addEventListener("click", () => {
    container.remove();
  });

  container.appendChild(closeButton);

  // Open in new tab button
  const openInTabButton = document.createElement("button");
  openInTabButton.style.backgroundColor = "solid white";
  openInTabButton.style.border = "0px";
  openInTabButton.style.cursor = "pointer";
  openInTabButton.style.position = "absolute";
  openInTabButton.style.top = "32px";
  openInTabButton.style.left = "0px";
  openInTabButton.style.zIndex = "10001";
  openInTabButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 122.88 100.06" xmlns="http://www.w3.org/2000/svg">
      <style>.cls-1{fill-rule:evenodd;}</style>
      <path class="cls-1" d="M50.34,34.25h5.39a2.49,2.49,0,0,1,2.48,2.48v8h8a2.51,2.51,0,0,1,2.48,2.48v5.4a2.52,2.52,0,0,1-2.48,2.48h-8v8a2.51,2.51,0,0,1-2.48,2.48H50.34a2.51,2.51,0,0,1-2.49-2.48v-8h-8a2.5,2.5,0,0,1-2.48-2.48v-5.4a2.48,2.48,0,0,1,2.48-2.48h8v-8a2.49,2.49,0,0,1,2.49-2.48ZM7.67,0H98.35A7.69,7.69,0,0,1,106,7.67v68a7.7,7.7,0,0,1-7.67,7.67H7.67A7.69,7.69,0,0,1,0,75.69v-68A7.69,7.69,0,0,1,7.67,0ZM99.05,23.92H7.31V74a2.09,2.09,0,0,0,.62,1.5,2.13,2.13,0,0,0,1.51.62H96.89a2.11,2.11,0,0,0,1.51-.62A2.09,2.09,0,0,0,99,74V23.92ZM91,8.62a3.79,3.79,0,1,1-3.79,3.79A3.79,3.79,0,0,1,91,8.62Zm-25.68,0a3.79,3.79,0,1,1-3.79,3.79,3.79,3.79,0,0,1,3.79-3.79Zm12.84,0a3.79,3.79,0,1,1-3.79,3.79A3.79,3.79,0,0,1,78.2,8.62Zm37,8.07.36,23.92V90.69a2.12,2.12,0,0,1-2.13,2.13H26a2.12,2.12,0,0,1-2.12-2.13h-7v1.68a7.7,7.7,0,0,0,7.67,7.68h90.68a7.7,7.7,0,0,0,7.67-7.68v-68a7.7,7.7,0,0,0-7.67-7.68Z"/>
    </svg>
  `;

  openInTabButton.addEventListener("click", () => {
    window.open(url, "_blank");
    container.remove();
  });
  container.appendChild(openInTabButton);

  // Pin button for the container
  const pinButton = document.createElement("button");
  pinButton.style.backgroundColor = "solid white";
  pinButton.style.border = "0px";
  pinButton.style.cursor = "pointer";
  pinButton.style.position = "absolute";
  pinButton.style.top = "52px";
  pinButton.style.left = "0px";
  pinButton.style.zIndex = "10001";
  pinButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C10.895 0 10 0.895 10 2V14.585L7.707 12.293C7.316 11.902 6.684 11.902 6.293 12.293C5.902 12.684 5.902 13.316 6.293 13.707L11.293 18.707C11.488 18.902 11.744 19 12 19C12.256 19 12.512 18.902 12.707 18.707L17.707 13.707C18.098 13.316 18.098 12.684 17.707 12.293C17.316 11.902 16.684 11.902 16.293 12.293L14 14.585V2C14 0.895 13.105 0 12 0zM2 20C0.895 20 0 20.895 0 22C0 23.105 0.895 24 2 24H22C23.105 24 24 23.105 24 22C24 20.895 23.105 20 22 20H2z"/>
    </svg>
  `;

  let isPinned = false;
  let initialTop = container.style.top;
  let initialRight = container.style.right;

  pinButton.addEventListener("click", () => {
    if (isPinned) {
      container.style.position = "fixed";
      container.style.top = initialTop;
      container.style.right = initialRight;
      isPinned = false;
    } else {
      container.style.position = "absolute";
      container.style.top = `${
        window.scrollY + container.getBoundingClientRect().top
      }px`;
      container.style.right = `${
        document.documentElement.clientWidth -
        container.getBoundingClientRect().right
      }px`;
      isPinned = true;
    }
  });

  container.appendChild(pinButton);

  // Drag handle for moving the container
  const dragHandle = document.createElement("div");
  dragHandle.style.width = "10px";
  dragHandle.style.height = "10px";
  dragHandle.style.background = "gray";
  dragHandle.style.position = "absolute";
  dragHandle.style.top = "0";
  dragHandle.style.left = "0";
  dragHandle.style.cursor = "move";
  container.appendChild(dragHandle);

  let isDragging = false;
  let offsetX, offsetY;

  // Enable dragging with the drag handle
  dragHandle.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - container.getBoundingClientRect().left;
    offsetY = e.clientY - container.getBoundingClientRect().top;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      container.style.left = `${e.clientX - offsetX}px`;
      container.style.top = `${e.clientY - offsetY}px`;
      container.style.right = "";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Resize handle for resizing the container
  const resizeHandle = document.createElement("div");
  resizeHandle.style.width = "10px";
  resizeHandle.style.height = "10px";
  resizeHandle.style.background = "gray";
  resizeHandle.style.position = "absolute";
  resizeHandle.style.right = "0";
  resizeHandle.style.bottom = "0";
  resizeHandle.style.cursor = "se-resize";
  container.appendChild(resizeHandle);

  let isResizing = false;

  resizeHandle.addEventListener("mousedown", (e) => {
    isResizing = true;
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener("mousemove", (e) => {
    if (isResizing) {
      const newWidth = e.clientX - container.getBoundingClientRect().left;
      const newHeight = e.clientY - container.getBoundingClientRect().top;
      container.style.width = `${newWidth}px`;
      container.style.height = `${newHeight}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    isResizing = false;
  });
}

document.getElementById("postIt").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: injectStickyNote,
    });
  });
});

// Sticky Note injection function
function injectStickyNote() {
  // Create a container div for the sticky note
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.width = "300px";
  container.style.height = "200px";
  container.style.top = "10px";
  container.style.right = "10px";
  container.style.zIndex = "10000";
  container.style.border = "1px solid black";
  container.style.borderRadius = "5px";
  container.style.backgroundColor = "yellow";
  container.style.padding = "10px";
  container.style.boxSizing = "border-box";

  // Create a textarea for typing notes
  const textarea = document.createElement("textarea");
  textarea.style.position = "absolute";
  textarea.style.left = "0px";
  textarea.style.bottom = "5px";
  textarea.style.width = "100%";
  textarea.style.height = "calc(100% - 40px)";
  textarea.style.border = "none";
  textarea.style.resize = "none";
  textarea.style.outline = "none";
  textarea.style.backgroundColor = "yellow";
  textarea.style.fontSize = "14px";
  textarea.style.boxSizing = "border-box";

  // Append textarea to the container
  container.appendChild(textarea);

  // Append container to the body
  document.body.appendChild(container);

  // Close button for the container
  const closeButton = document.createElement("button");
  closeButton.style.background = "transparent";
  closeButton.style.border = "0px";
  closeButton.style.cursor = "pointer";
  closeButton.style.position = "absolute";
  closeButton.style.top = "10px";
  closeButton.style.right = "10px";
  closeButton.style.zIndex = "10001";
  closeButton.innerHTML = `
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 122.88 122.88" style="enable-background:new 0 0 122.88 122.88; width: 20px; height: 20px;" xml:space="preserve">
      <style type="text/css">.st0{fill-rule:evenodd;clip-rule:evenodd;}</style>
      <g><path class="st0" d="M1.63,97.99l36.55-36.55L1.63,24.89c-2.17-2.17-2.17-5.73,0-7.9L16.99,1.63c2.17-2.17,5.73-2.17,7.9,0
        l36.55,36.55L97.99,1.63c2.17-2.17,5.73-2.17,7.9,0l15.36,15.36c2.17,2.17,2.17,5.73,0,7.9L84.7,61.44l36.55,36.55
        c2.17,2.17,2.17,5.73,0,7.9l-15.36,15.36c-2.17,2.17-5.73,2.17-7.9,0L61.44,84.7l-36.55,36.55c-2.17,2.17-5.73,2.17-7.9,0
        L1.63,105.89C-0.54,103.72-0.54,100.16,1.63,97.99L1.63,97.99z"/>
      </g>
    </svg>
  `;
  closeButton.addEventListener("click", () => {
    container.remove();
  });

  container.appendChild(closeButton);

  // Pin button for the container
  const pinButton = document.createElement("button");
  pinButton.style.background = "transparent";
  pinButton.style.border = "0px";
  pinButton.style.cursor = "pointer";
  pinButton.style.position = "absolute";
  pinButton.style.top = "10px";
  pinButton.style.left = "10px";
  pinButton.style.zIndex = "10001";
  pinButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C10.895 0 10 0.895 10 2V14.585L7.707 12.293C7.316 11.902 6.684 11.902 6.293 12.293C5.902 12.684 5.902 13.316 6.293 13.707L11.293 18.707C11.488 18.902 11.744 19 12 19C12.256 19 12.512 18.902 12.707 18.707L17.707 13.707C18.098 13.316 18.098 12.684 17.707 12.293C17.316 11.902 16.684 11.902 16.293 12.293L14 14.585V2C14 0.895 13.105 0 12 0zM2 20C0.895 20 0 20.895 0 22C0 23.105 0.895 24 2 24H22C23.105 24 24 23.105 24 22C24 20.895 23.105 20 22 20H2z"/>
    </svg>
  `;

  let isPinned = false;
  let initialTop = container.style.top;
  let initialRight = container.style.right;

  pinButton.addEventListener("click", () => {
    if (isPinned) {
      container.style.position = "fixed";
      container.style.top = initialTop;
      container.style.right = initialRight;
      isPinned = false;
    } else {
      container.style.position = "absolute";
      container.style.top = `${
        window.scrollY + container.getBoundingClientRect().top
      }px`;
      container.style.right = `${
        document.documentElement.clientWidth -
        container.getBoundingClientRect().right
      }px`;
      isPinned = true;
    }
  });

  container.appendChild(pinButton);

  // Copy button for the container
  const copyButton = document.createElement("button");
  copyButton.style.background = "transparent";
  copyButton.style.border = "0px";
  copyButton.style.cursor = "pointer";
  copyButton.style.position = "absolute";
  copyButton.style.top = "10px";
  copyButton.style.left = "40px";
  copyButton.style.zIndex = "10001";
  copyButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 115.77 122.88" xmlns="http://www.w3.org/2000/svg">
      <style>.st0{fill-rule:evenodd;clip-rule:evenodd;}</style>
      <path class="st0" d="M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02
      v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02
      c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1
      c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7
      h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02
      c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01
      c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65
      v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z M105.18,108.92V35.65v-0.02
      h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01
      c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02
      v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z"/>
    </svg>
  `;
  copyButton.addEventListener("click", () => {
    textarea.select();
    document.execCommand("copy");
  });

  container.appendChild(copyButton);
  // Drag handle for moving the container
  const dragHandle = document.createElement("div");
  dragHandle.style.width = "20px";
  dragHandle.style.height = "20px";
  dragHandle.style.background = "gray";
  dragHandle.style.position = "absolute";
  dragHandle.style.top = "0";
  dragHandle.style.left = "0";
  dragHandle.style.cursor = "move";
  container.appendChild(dragHandle);

  let isDragging = false;
  let offsetX, offsetY;

  // Enable dragging with the drag handle
  dragHandle.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - container.getBoundingClientRect().left;
    offsetY = e.clientY - container.getBoundingClientRect().top;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      container.style.left = `${e.clientX - offsetX}px`;
      container.style.top = `${e.clientY - offsetY}px`;
      container.style.right = "";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Resize handle for resizing the container
  const resizeHandle = document.createElement("div");
  resizeHandle.style.width = "10px";
  resizeHandle.style.height = "10px";
  resizeHandle.style.background = "gray";
  resizeHandle.style.position = "absolute";
  resizeHandle.style.right = "0";
  resizeHandle.style.bottom = "0";
  resizeHandle.style.cursor = "se-resize";
  container.appendChild(resizeHandle);

  let isResizing = false;

  resizeHandle.addEventListener("mousedown", (e) => {
    isResizing = true;
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener("mousemove", (e) => {
    if (isResizing) {
      const newWidth = e.clientX - container.getBoundingClientRect().left;
      const newHeight = e.clientY - container.getBoundingClientRect().top;
      container.style.width = `${newWidth}px`;
      container.style.height = `${newHeight}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    isResizing = false;
  });
}
