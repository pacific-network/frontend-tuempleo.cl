document.addEventListener('DOMContentLoaded', () => {
    const herramientas = [
      'Excel',
      'Word',
      'PowerPoint',
      'Correo electrónico',
      'Navegador Web',
      'Impresora',
      'Zoom',
      'Google Drive',
      'Canva',
      'Trello'
    ];
  
    const contenedor = document.getElementById('checkbox-container');
  
    herramientas.forEach((herramienta, index) => {
      const col = document.createElement('div');
      col.className = 'col-6 form-check';
  
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'form-check-input';
      checkbox.id = `herramienta-${index}`;
      checkbox.value = herramienta;
  
      const label = document.createElement('label');
      label.className = 'form-check-label';
      label.setAttribute('for', `herramienta-${index}`);
      label.textContent = herramienta;
  
      col.appendChild(checkbox);
      col.appendChild(label);
      contenedor.appendChild(col);
    });
  });
  