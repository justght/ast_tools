

## isCreateIFNode3
### (合并前)
```javascript
switch ($) {
  case 1:
    var t, r, s, h, o, a, g, c, p, y, w, C, b, m, x, O, S, j, k, q, z, A, B, D, E, F, G, H, I, J, K, L, M, N, P, Q, R, T, U, V, W, X, Y, Z, _, nn, en, ln, un, dn, fn, $n, tn, rn, sn, hn, on, an, gn, cn, vn;

    t = 7;
    r = l;
    s = t == r;
    $ = s ? 3 : 6;
    break;

  case 3:
    h = e;
    o = v;
    a = h[o];
    g = 1;
    c = a[g];
    p = e;
    y = v;
    w = p[y];
    C = 0;
    b = w[C];
    m = e;
    x = v;
    O = m[x];
    S = 3;
    j = O[S];
    k = u;
    q = d;
    z = f;
    A = i;
    vn = c[b](j, k, q, z, A);
    $ = 4;
    break;

  case 4:
    return vn;
    break;

  case 6:
    B = 2;
    D = l;
    E = B == D;

    if (E) {
      F = e;
      G = v;
      H = F[G];
      I = 1;
      J = H[I];
      K = e;
      L = v;
      M = K[L];
      N = 0;
      P = M[N];
      Q = e;
      R = v;
      T = Q[R];
      U = l;
      V = T[U];
      W = u;
      X = d;
      Y = f;
      vn = J[P](V, W, X, Y);
    } else {
      Z = e;
      _ = v;
      nn = Z[_];
      en = 1;
      ln = nn[en];
      un = e;
      dn = v;
      fn = un[dn];
      $n = 0;
      tn = fn[$n];
      rn = e;
      sn = v;
      hn = rn[sn];
      on = l;
      an = hn[on];
      gn = u;
      cn = d;
      vn = ln[tn](an, gn, cn);
    }

    $ = 4;
    break;
}

```

### 合并后
```javascript
switch ($) {
  case 1:
    var t, r, s, h, o, a, g, c, p, y, w, C, b, m, x, O, S, j, k, q, z, A, B, D, E, F, G, H, I, J, K, L, M, N, P, Q, R, T, U, V, W, X, Y, Z, _, nn, en, ln, un, dn, fn, $n, tn, rn, sn, hn, on, an, gn, cn, vn;

    t = 7;
    r = l;
    s = t == r;

    if (s) {
      h = e;
      o = v;
      a = h[o];
      g = 1;
      c = a[g];
      p = e;
      y = v;
      w = p[y];
      C = 0;
      b = w[C];
      m = e;
      x = v;
      O = m[x];
      S = 3;
      j = O[S];
      k = u;
      q = d;
      z = f;
      A = i;
      vn = c[b](j, k, q, z, A);
    } else {
      B = 2;
      D = l;
      E = B == D;

      if (E) {
        F = e;
        G = v;
        H = F[G];
        I = 1;
        J = H[I];
        K = e;
        L = v;
        M = K[L];
        N = 0;
        P = M[N];
        Q = e;
        R = v;
        T = Q[R];
        U = l;
        V = T[U];
        W = u;
        X = d;
        Y = f;
        vn = J[P](V, W, X, Y);
      } else {
        Z = e;
        _ = v;
        nn = Z[_];
        en = 1;
        ln = nn[en];
        un = e;
        dn = v;
        fn = un[dn];
        $n = 0;
        tn = fn[$n];
        rn = e;
        sn = v;
        hn = rn[sn];
        on = l;
        an = hn[on];
        gn = u;
        cn = d;
        vn = ln[tn](an, gn, cn);
      }
    }

    $ = 4;
    break;

  case 4:
    return vn;
    break;
}

```