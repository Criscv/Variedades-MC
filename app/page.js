"use client";
import { useEffect, useState } from "react";
import Papa from "papaparse";

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [cargando, setCargando] = useState(true);

  // LINK CSV
  const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTqBVT871UGcuG5K47CeNvLXOuN-ykDxzXdnmsYM4CKjOtM71k7zdMGbscRMjPYjRikjYScRDd7AkVC/pub?gid=0&single=true&output=csv";

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const respuesta = await fetch(SHEET_URL);
        const texto = await respuesta.text();
        
        Papa.parse(texto, {
          header: true,
          complete: (resultados) => {
            const datosLimpios = resultados.data;
            setProductos(datosLimpios);
            
            const categoriasUnicas = ["Todos", ...new Set(datosLimpios.map(item => item.categoria).filter(Boolean))];
            setCategorias(categoriasUnicas);
            
            setCargando(false);
          },
        });
      } catch (error) {
        console.error("Error cargando inventario:", error);
        setCargando(false);
      }
    };
    obtenerDatos();
  }, []);

  const productosVisibles = categoriaSeleccionada === "Todos" 
    ? productos 
    : productos.filter(item => item.categoria === categoriaSeleccionada);

  if (cargando) return <div className="loading">Cargando catálogo...</div>;

  return (
    <main className="contenedor">
      <header className="cabecera">
        <h1>Variedades Martin</h1>
        
        <div className="filtros">
          {categorias.map(cat => (
            <button 
              key={cat}
              className={`btn-filtro ${categoriaSeleccionada === cat ? "activo" : ""}`}
              onClick={() => setCategoriaSeleccionada(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="grilla-productos">
        {productosVisibles.map((item, index) => {
          if (!item.nombre) return null;

          const stock = parseInt(item.cantidad) || 0;
          const estaAgotado = stock <= 0;

          return (
            <div key={index} className={`tarjeta ${estaAgotado ? "agotada" : ""}`}>
              
              <div className="imagen-wrapper">
                {item.imagen ? (
                  <img src={item.imagen} alt={item.nombre} />
                ) : (
                  <div className="sin-foto">Sin foto</div>
                )}
                {estaAgotado && <span className="etiqueta-estado">AGOTADO</span>}
              </div>

              <div className="info">
                <div className="info-top">
                    <h3>{item.nombre}</h3>
                    <p className="categoria">{item.categoria}</p>
                </div>
                
                <div className="info-bottom">
                    <p className="precio">${item.precio}</p>
                    <p className={`stock-texto ${estaAgotado ? "rojo" : "verde"}`}>
                        {estaAgotado ? "Próximamente" : "Disponible"}
                    </p>
                </div>

                <a 
                  href={`https://wa.me/523314690290?text=${estaAgotado 
                    ? `Hola, vi que se agotó "${item.nombre}", quisiera encargarlo.` 
                    : `Hola, me interesa comprar "${item.nombre}"`}`} 
                  target="_blank" 
                  className={`boton-ws ${estaAgotado ? "btn-encargar" : ""}`}
                >
                  {/* 1. ICONO PRIMERO*/}
                  {!estaAgotado && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  )}
                  
                  {/* 2. TEXTO DESPUÉS */}
                  {estaAgotado ? "Encargar Pedido" : "Pedir por WhatsApp"}
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  );
}