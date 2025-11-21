const helpToggle = document.getElementById('helpToggle');
    const helpPanel = document.getElementById('helpPanel');

    helpToggle.addEventListener('click', () => {
      helpPanel.classList.toggle('show');
    });