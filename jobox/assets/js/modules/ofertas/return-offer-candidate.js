(function(){
  try {
    var sp = new URLSearchParams(location.search);
    var cid = sp.get('id') || sp.get('userId');
    if (cid) {
      sessionStorage.setItem('sel_cand_id', cid);
      sp.delete('id'); sp.delete('userId');
      var newQs = sp.toString();
      var newUrl = location.pathname + (newQs ? '?' + newQs : '') + location.hash;
      // Reemplaza la URL inmediatamente (sin el id)
      history.replaceState(null, '', newUrl);
    }
  } catch(e) {}
})();