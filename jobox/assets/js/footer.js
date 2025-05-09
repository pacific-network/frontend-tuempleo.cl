// footer.js
export const footerHTML = `
<footer class="footer-area">
    <div class="footer-widget">
        <div class="container">
            <div class="row footer-widget-wrapper pt-100 pb-70">
                <div class="col-md-6 col-lg-4 col-xl-3">
                    <div class="footer-widget-box about-us">
                        <a href="#" class="footer-logo">
                            <img src="assets/img/logo/logo.png" alt="">
                        </a>
                        <p class="mb-4">
                            Únete a nuestra comunidad y accede a cientos de ofertas laborales cada día. 
                            Crece profesionalmente y conecta con empresas que valoran tu talento. 
                            ¡Tu próximo empleo te está esperando!
                        </p>
                        <ul class="footer-contact">
                            <li><a href="tel:+56993297091"><i class="far fa-phone"></i>+56 9 9329 7091</a></li>
                            <li><i class="far fa-map-marker-alt"></i>Av. del Valle Su 662, Huechuraba</li>
                            <li><a href="mailto:jjorquera@pacificnetwork.cl"><i
                                        class="far fa-envelope"></i>jjorquera@pacificnetwork.cl</a></li>
                        </ul>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4 col-xl-2">
                    <div class="footer-widget-box list">
                        <h4 class="footer-widget-title">Compañia</h4>
                        <ul class="footer-list">
                            <li><a href="about.html">Sobre Nosotros</a></li>
                            <li><a href="pricing.html">Planes y Precios</a></li>
                            <li><a href="team.html">Nuestro Equipo</a></li>
                        </ul>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4 col-xl-2">
                    <div class="footer-widget-box list">
                        <h4 class="footer-widget-title">Enlaces rápidos</h4>
                        <ul class="footer-list">
                            <li><a href="job-list-2.html">Encuentra tu Trabajo</a></li>
                            <li><a href="employer-dashboard.html">Empresa</a></li>
                            <li><a href="candidate-dashboard.html">Candidatos</a></li>
                            <li><a href="employer-post-job.html">Publica un Aviso</a></li>
                            <li><a href="login.html">Ingresar</a></li>
                            <li><a href="register.html">Registrarse</a></li>
                        </ul>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4 col-xl-2">
                    <div class="footer-widget-box list">
                        <h4 class="footer-widget-title">Soporte</h4>
                        <ul class="footer-list">
                            <li><a href="contact.html">Contáctanos</a></li>
                            <li><a href="faq.html">Preguntas Frecuentas</a></li>
                            <li><a href="privacy.html">Política de Privacidad</a></li>
                            <li><a href="terms.html">Términos de Servicio</a></li>
                            <li><a href="#">Chat en línea</a></li>
                        </ul>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4 col-xl-3">
                    <div class="footer-widget-box list">
                        <h4 class="footer-widget-title">Noticias</h4>
                        <div class="footer-newsletter">
                            <p>Subscribete para mantener al día con nuestras actualizaciones y noticias</p>
                            <div class="subscribe-form">
                                <form action="#">
                                    <div class="form-group">
                                        <div class="form-group-icon">
                                            <i class="fe-mail"></i>
                                            <input type="email" class="form-control" placeholder="Ingresa Email">
                                            <button class="theme-btn" type="submit"><span
                                                    class="fe-send"></span></button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div class="footer-download">
                            <h5>Descarga</h5>
                            <div class="footer-download-content">
                                <a href="#"><img src="assets/img/download/google-play.png" alt=""></a>
                                <a href="#"><img src="assets/img/download/app-store.png" alt=""></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="copyright">
        <div class="container">
            <div class="row">
                <div class="col-md-6 align-self-center">
                    <p class="copyright-text">
                        &copy; Copyright <span id="date"></span> <a href="index.html"> tuempleo.cl </a> Todos los derechos reservados.
                    </p>
                </div>
                <div class="col-md-6 align-self-center">
                    <ul class="footer-social">
                        <li><a href="#"><i class="fab fa-facebook-f"></i></a></li>
                        <li><a href="#"><i class="fab fa-twitter"></i></a></li>
                        <li><a href="#"><i class="fab fa-linkedin-in"></i></a></li>
                        <li><a href="#"><i class="fab fa-youtube"></i></a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</footer>
`;

export const footerScripts = `
<script src="assets/js/jquery-3.6.0.min.js"></script>
<script src="assets/js/modernizr.min.js"></script>
<script src="assets/js/bootstrap.bundle.min.js"></script>
<script src="assets/js/imagesloaded.pkgd.min.js"></script>
<script src="assets/js/jquery.magnific-popup.min.js"></script>
<script src="assets/js/isotope.pkgd.min.js"></script>
<script src="assets/js/jquery.appear.min.js"></script>
<script src="assets/js/jquery.easing.min.js"></script>
<script src="assets/js/owl.carousel.min.js"></script>
<script src="assets/js/counter-up.js"></script>
<script src="assets/js/masonry.pkgd.min.js"></script>
<script src="assets/js/wow.min.js"></script>
<script src="assets/js/nice-select.min.js"></script>
<script src="assets/js/main.js"></script>
`;

// Función para cargar el footer
export function loadFooter() {
    document.body.insertAdjacentHTML('beforeend', footerHTML);
    document.body.insertAdjacentHTML('beforeend', footerScripts);
    
    // Actualizar el año del copyright
    document.getElementById('date').textContent = new Date().getFullYear();
}