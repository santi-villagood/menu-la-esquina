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

// Marca en la barra la categoría que se está viendo mientras scrolleás
function resaltarCategoriaActiva() {
  const enlaces = document.querySelectorAll(".categorias a");
  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (e.isIntersecting) {
        enlaces.forEach(a => a.classList.toggle("activa", a.hash === "#" + e.target.id));
        const activo = document.querySelector(".categorias a.activa");
        if (activo) activo.scrollIntoView({ inline: "center", block: "nearest" });
      }
    });
  }, { rootMargin: "-20% 0px -70% 0px" });

  document.querySelectorAll(".seccion").forEach(s => observador.observe(s));
}

// 2. Cargar los datos. Para cambiar el menú se edita SOLO menu.json
fetch("menu.json")
  .then(r => r.json())
  .then(dibujarMenu)
  .catch(() => {
    const aviso = el("p", "error", "No se pudo cargar el menú. Si abriste index.html con doble clic, probá con la extensión Live Server de VS Code o subilo a GitHub Pages.");
    document.body.prepend(aviso);
  });
