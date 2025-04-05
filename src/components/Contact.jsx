import React from "react";

function Contact() {
  return (
    <section id="contacto" className="contact">
      <h2>Contáctanos</h2>
      <form action="https://formspree.io/f/tu-codigo" method="POST">
        <input type="text" name="nombre" placeholder="Nombre" required />
        <input type="email" name="email" placeholder="Correo" required />
        <textarea name="mensaje" placeholder="Mensaje..." required />
        <button type="submit">Enviar</button>
      </form>
    </section>
  );
}

export default Contact;
