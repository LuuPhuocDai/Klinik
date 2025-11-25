document.addEventListener("DOMContentLoaded", function () {
    const dateElement = document.getElementById("current-date");
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    if (dateElement) {
        dateElement.textContent = `${day}/${month}/${year}`;
    }
});
