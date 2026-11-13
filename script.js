// 1. Formato de precio argentino: $11.500
const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0
});

// Helper para crear elementos de forma segura (textContent evita inyectar HTML)
function el(tag, clase, texto) {
  const nodo = document.createElement(tag);
  if (clase) nodo.className = clase;
  if (texto) nodo.textContent = texto;
  return nodo;
}

function crearPlato(plato) {
  const caja = el("article", "plato");

  const linea = el("div", "plato-linea");
  linea.append(
    el("span", "plato-nombre", plato.nombre),
    el("span", "plato-relleno"),
    el("span", "plato-precio", formatoPrecio.format(plato.precio))
  );
  caja.append(linea);

  if (plato.descripcion) caja.append(el("p", "plato-desc", plato.descripcion));
  (plato.tags || []).forEach(t => caja.append(el("span", "tag", t)));

  return caja;
}

function dibujarMenu(menu) {
  document.title = "Menú · " + menu.local;
  document.getElementById("local").textContent = menu.local;
  document.getElementById("subtitulo").textContent = menu.subtitulo || "";
  document.getElementById("actualizado").textContent = "Precios actualizados el " + menu.actualizado;

  const nav = document.getElementById("categorias");
  const main = document.getElementById("menu");

  menu.categorias.forEach((cat, i) => {
    const id = "cat-" + i;

    const enlace = el("a", "", cat.nombre);
    enlace.href = "#" + id;
    nav.append(enlace);

    const seccion = el("section", "seccion");
    seccion.id = id;
    seccion.append(el("h2", "", cat.nombre));
    cat.platos.forEach(p => seccion.append(crearPlato(p)));
    main.append(seccion);
  });

  resaltarCategoriaActiva();
}

// Marca la categoría activa sin interferir con el scroll vertical de la página
function resaltarCategoriaActiva() {
  const nav = document.getElementById("categorias");
  const enlaces = Array.from(document.querySelectorAll(".categorias a"));
  const secciones = Array.from(document.querySelectorAll(".seccion"));
  let bloqueadoPorClic = false;
  let temporizador;
  let idActivo = "";

  function activar(id) {
    if (id === idActivo) return;
    idActivo = id;

    enlaces.forEach(a => a.classList.toggle("activa", a.hash === "#" + id));
    const activo = document.querySelector(".categorias a.activa");
    if (activo && nav) {
      const centro = activo.offsetLeft - (nav.clientWidth / 2) + (activo.offsetWidth / 2);
      nav.scrollTo({ left: centro, behavior: "smooth" });
    }
  }

  enlaces.forEach(enlace => {
    enlace.addEventListener("click", () => {
      bloqueadoPorClic = true;
      activar(enlace.hash.slice(1));
      clearTimeout(temporizador);
      temporizador = setTimeout(() => { bloqueadoPorClic = false; }, 800);
    });
  });

  window.addEventListener("scroll", () => {
    if (bloqueadoPorClic || secciones.length === 0) return;

    const alFinal = window.innerHeight + Math.round(window.scrollY) >= document.documentElement.scrollHeight - 10;
    if (alFinal) {
      activar(secciones[secciones.length - 1].id);
      return;
    }

    let actual = secciones[0].id;
    for (const seccion of secciones) {
      if (seccion.getBoundingClientRect().top <= 130) {
        actual = seccion.id;
      }
    }
    activar(actual);
  }, { passive: true });

  if (secciones.length > 0) activar(secciones[0].id);
}

// 2. Cargar los datos. Para cambiar el menú se edita SOLO menu.json
fetch("menu.json")
  .then(r => r.json())
  .then(dibujarMenu)
  .catch(() => {
    const aviso = el("p", "error", "No se pudo cargar el menú. Si abriste index.html con doble clic, probá con la extensión Live Server de VS Code o subilo a GitHub Pages.");
    document.body.prepend(aviso);
  });
