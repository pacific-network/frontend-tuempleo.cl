document.getElementById('logoutButton').addEventListener('click', function (e) {
    e.preventDefault();
    const modal = new bootstrap.Modal(document.getElementById('logoutModal'));
    modal.show();
})
document.getElementById('confirmLogout').addEventListener('click', function () {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});