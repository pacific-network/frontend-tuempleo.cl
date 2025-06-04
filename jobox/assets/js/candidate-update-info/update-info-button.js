// Función para mostrar notificación
        function showAlert(message, type = 'success') {
            const alert = document.getElementById('custom-alert');
            alert.textContent = message;
            alert.className = `alert alert-${type}`;
            alert.style.display = 'block';
            
            setTimeout(() => {
                alert.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    alert.style.display = 'none';
                    alert.style.animation = 'fadeIn 0.3s ease-out';
                }, 300);
            }, 3000);
        }

        // Función para manejar la actualización
        function handleUpdate(buttonId, textId, loadingId) {
            const button = document.getElementById(buttonId);
            const textElement = document.getElementById(textId);
            const loadingElement = document.getElementById(loadingId);
            
            if (textElement && loadingElement) {
                textElement.style.display = 'none';
                loadingElement.style.display = 'inline';
            }
            
            button.disabled = true;
            button.classList.add('loading');
            
            // Simular operación de actualización
            setTimeout(() => {
                if (textElement && loadingElement) {
                    textElement.style.display = 'inline';
                    loadingElement.style.display = 'none';
                }
                button.disabled = false;
                button.classList.remove('loading');
                showAlert('¡Actualización exitosa!');
            }, 2000);
        }

        // Configuración del botón estático
        document.addEventListener('DOMContentLoaded', function() {
            // Elementos del botón estático
            const staticButton = document.getElementById('btn-actualizar');
            const staticConfirmationBox = document.getElementById('confirmacion-box');
            const staticConfirmBtn = document.getElementById('btn-confirmar-actualizacion');
            const staticCancelBtn = document.getElementById('btn-cancelar-actualizacion');
            
            // Mostrar/ocultar confirmación al hacer clic en el botón estático
            if (staticButton && staticConfirmationBox) {
                staticButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Alternar la visualización del cuadro de confirmación
                    staticConfirmationBox.style.display = 
                        staticConfirmationBox.style.display === 'block' ? 'none' : 'block';
                });
            }
            
            // Confirmar actualización desde el botón estático
            if (staticConfirmBtn) {
                staticConfirmBtn.addEventListener('click', async function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                
                    staticConfirmBtn.disabled = true;
                    document.getElementById('btn-text-estatico').style.display = 'none';
                    document.getElementById('btn-loading-estatico').style.display = 'inline';
                
                    try {
                        await actualizarPostulante();
                        showAlert('¡Actualización exitosa!');
                        window.location.href = 'candidate-profile.html'; // Asegúrate que este path exista
                    } catch (error) {
                        showAlert('Error al actualizar: ' + error.message, 'danger');
                    } finally {
                        staticConfirmBtn.disabled = false;
                        document.getElementById('btn-text-estatico').style.display = 'inline';
                        document.getElementById('btn-loading-estatico').style.display = 'none';
                    }
                
                    if (staticConfirmationBox) {
                        staticConfirmationBox.style.display = 'none';
                    }
                });
            }
            
            // Cancelar actualización desde el botón estático
            if (staticCancelBtn) {
                staticCancelBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (staticConfirmationBox) {
                        staticConfirmationBox.style.display = 'none';
                    }
                });
            }
            
            // Cerrar el cuadro de confirmación al hacer clic fuera de él
            document.addEventListener('click', function(e) {
                if (staticConfirmationBox && staticConfirmationBox.style.display === 'block') {
                    const isClickInside = staticButton.contains(e.target) || 
                                         staticConfirmationBox.contains(e.target);
                    
                    if (!isClickInside) {
                        staticConfirmationBox.style.display = 'none';
                    }
                }
            });
            
            // Configuración similar para el botón flotante (si es necesario)
            const floatingButton = document.getElementById('btn-actualizar-flotante');
            const floatingConfirmationBox = document.getElementById('confirmacion-box-flotante');
            const floatingConfirmBtn = document.getElementById('btn-confirmar-actualizacion-flotante');
            const floatingCancelBtn = document.getElementById('btn-cancelar-actualizacion-flotante');
            
            if (floatingButton && floatingConfirmationBox) {
                floatingButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    floatingConfirmationBox.style.display = 
                        floatingConfirmationBox.style.display === 'block' ? 'none' : 'block';
                });
            }
            
            if (floatingConfirmBtn) {
                floatingConfirmBtn.addEventListener('click', async function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                
                    floatingConfirmBtn.disabled = true;
                    document.getElementById('btn-text-floating').style.display = 'none';
                    document.getElementById('btn-loading-floating').style.display = 'inline';
                
                    try {
                        await actualizarPostulante();
                        showAlert('¡Actualización exitosa!');
                        window.location.href = 'candidate-profile.html'; // o la ruta que corresponda
                    } catch (error) {
                        showAlert('Error al actualizar: ' + error.message, 'danger');
                    } finally {
                        floatingConfirmBtn.disabled = false;
                        document.getElementById('btn-text-floating').style.display = 'inline';
                        document.getElementById('btn-loading-floating').style.display = 'none';
                    }
                
                    if (floatingConfirmationBox) {
                        floatingConfirmationBox.style.display = 'none';
                    }
                });
            }

            
            if (floatingCancelBtn) {
                floatingCancelBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (floatingConfirmationBox) {
                        floatingConfirmationBox.style.display = 'none';
                    }
                });
            }
            
            // Mostrar el botón flotante cuando se hace scroll
            window.addEventListener('scroll', function() {
                const floatingContainer = document.getElementById('floating-btn-container');
                if (floatingContainer) {
                    if (window.scrollY > 300) {
                        floatingContainer.style.display = 'block';
                    } else {
                        floatingContainer.style.display = 'none';
                    }
                }
            });
        });