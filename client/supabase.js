// =========================================================
// 🪄 Minimal Supabase Client — pakai fetch langsung
// =========================================================
// Gak perlu CDN, ~5KB, works in all browsers
;(function() {
  var URL = 'https://ifozejithwettwcayzqb.supabase.co';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlmb3plaml0aHdldHR3Y2F5enFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODI4NTksImV4cCI6MjA5ODA1ODg1OX0.iV6BBTNKIZ7knXYi0-5B_CYgsote-Mg1BpAvlbJjPHM';
  var SK = 'sb-mid-auth-token';

  function gs() { try { var r = localStorage.getItem(SK); return r ? JSON.parse(r) : null; } catch(e) { return null; } }
  function ss(d) {
    if (!d) { localStorage.removeItem(SK); return; }
    localStorage.setItem(SK, JSON.stringify({ access_token: d.access_token, refresh_token: d.refresh_token, expires_at: d.expires_at, user: d.user }));
  }
  function hd(j) { var h = { apikey: KEY, 'Content-Type': 'application/json' }; if (j) h.Authorization = 'Bearer ' + j; return h; }
  function ap(m, p, b, j) { return fetch(URL + p, { method: m, headers: hd(j), body: b ? JSON.stringify(b) : void 0 }).then(function(r) { return r.json().then(function(d) { if (!r.ok) throw new Error(d.msg || d.error_description || d.message || 'Err ' + r.status); return d; }); }); }

  // ── Query Builder ──
  function QB(t) {
    this.t = t;
    this.p = []; // [ [key,val], ... ]
    this.sg = false;
    this.m = 'GET';
    this.b = null;
    this.rr = false; // return representation
  }
  QB.prototype = {
    select: function(c) { if (c) this.p.push(['select', c]); return this; },
    eq: function(c, v) { this.p.push([c, 'eq.' + v]); return this; },
    single: function() { this.sg = true; return this; },
    order: function(c, o) { this.p.push(['order', c + '.' + (o && o.ascending === false ? 'desc' : 'asc')]); return this; },
    limit: function(n) { this.p.push(['limit', String(n)]); return this; },
    insert: function(d) { this.m = 'POST'; this.b = Array.isArray(d) ? d : [d]; this.rr = true; return this; },
    update: function(d) { this.m = 'PATCH'; this.b = d; this.rr = true; return this; },
    'delete': function() { this.m = 'DELETE'; return this; },
    then: function(ok, fail) { return this._go().then(ok, fail); },
    _go: function() {
      var self = this;
      var sess = gs();
      var jwt = sess ? sess.access_token : null;
      var q = URL + '/rest/v1/' + this.t;
      var sep = '?';
      for (var i = 0; i < this.p.length; i++) { q += sep + encodeURIComponent(this.p[i][0]) + '=' + encodeURIComponent(this.p[i][1]); sep = '&'; }
      var h = hd(jwt);
      if (this.rr) h['Prefer'] = 'return=representation';
      return fetch(q, { method: this.m, headers: h, body: this.b ? JSON.stringify(this.b) : void 0 }).then(function(r) {
        if (self.m === 'DELETE') return { data: null, error: null };
        return r.json().then(function(d) {
          if (!r.ok) throw new Error(d && d.message || 'HTTP ' + r.status);
          if (self.sg && Array.isArray(d)) d = d[0] || null;
          return { data: d, error: null };
        });
      });
    }
  };

  window.__supa = {
    auth: {
      signInWithPassword: function(o) {
        return ap('POST', '/auth/v1/token?grant_type=password', { email: o.email, password: o.password }).then(function(data) {
          ss(data);
          if (window.__supa._cb) window.__supa._cb('SIGNED_IN', { user: data.user, access_token: data.access_token, refresh_token: data.refresh_token, expires_at: data.expires_at });
          return { data: { user: data.user, session: data }, error: null };
        });
      },
      getSession: function() { return Promise.resolve({ data: { session: gs() }, error: null }); },
      onAuthStateChange: function(fn) {
        var sess = gs();
        setTimeout(function() { fn(sess ? 'SIGNED_IN' : 'INITIAL_SESSION', sess); }, 0);
        window.__supa._cb = fn;
        return { data: { subscription: { unsubscribe: function() {} } } };
      },
      signOut: function() {
        var sess = gs();
        var p = sess ? ap('POST', '/auth/v1/logout', null, sess.access_token).catch(function(){}) : Promise.resolve();
        return p.then(function() {
          ss(null);
          if (window.__supa._cb) window.__supa._cb('SIGNED_OUT', null);
        });
      }
    },
    from: function(t) { return new QB(t); },
    rpc: function(fn, params) {
      var exec = function() {
        var sess = gs();
        return fetch(URL + '/rest/v1/rpc/' + fn, { method: 'POST', headers: hd(sess ? sess.access_token : null), body: JSON.stringify(params || {}) }).then(function(r) { return r.json().then(function(d) { if (!r.ok) throw new Error(d.message || 'RPC error'); return { data: d, error: null }; }); });
      };
      exec.select = exec;
      exec.then = function(ok, fail) { return exec().then(ok, fail); };
      return exec;
    }
  };
})();
