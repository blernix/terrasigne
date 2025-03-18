export default function applyFloatingLights() {
    if (typeof window === "undefined") return;
  
    // Vérifier si le conteneur existe déjà
    if (document.querySelector(".light-container")) return;
  
    const lightContainer = document.createElement("div");
    lightContainer.classList.add("light-container");
    document.body.appendChild(lightContainer);
  
    for (let i = 0; i < 15; i++) {
      const light = document.createElement("div");
      light.classList.add("light");
  
      const size = Math.random() * 150 + 50; // Taille aléatoire entre 50px et 200px
      light.style.width = `${size}px`;
      light.style.height = `${size}px`;
      light.style.left = `${Math.random() * 100}vw`;
      light.style.top = `${Math.random() * 100}vh`;
      light.style.animationDuration = `${Math.random() * 10 + 5}s`; // Durée entre 5s et 15s
      light.style.animationDelay = `${Math.random() * 10}s`; // Début aléatoire
  
      lightContainer.appendChild(light);
    }
  }