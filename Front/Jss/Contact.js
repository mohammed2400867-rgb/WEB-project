document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;

    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const name = document.getElementById("contactName").value;
        const email = document.getElementById("contactEmail").value;
        const subject = document.getElementById("contactSubject").value;
        const message = document.getElementById("contactMessage").value;

        const newContact = {
            id: "MSG-" + Math.floor(Math.random() * 10000),
            name,
            email,
            subject,
            message,
            timestamp: new Date().toLocaleTimeString()
        };

        const messages = JSON.parse(localStorage.getItem("messages")) || [];
        messages.push(newContact);
        localStorage.setItem("messages", JSON.stringify(messages));

        alert(`Thank you, ${name}! Your message has been sent. We will get back to you at ${email} shortly.`);
        contactForm.reset();
    });
