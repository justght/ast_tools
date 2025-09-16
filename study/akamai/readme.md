
# 操作记录
1.用js_tools 不环境报错
```shell


E:\ast_tools\study\akamai\source\OWtdMHoB_format.js:8037
                            if (BOF[sr()[Im(E3)](Xg, UP)]) pHF = BOF[Bz(BOF[sr()[Im(E3)](Xg, UP)], P8)];
                                   ^

TypeError: Cannot read properties of null (reading 'length')


```
2. 由结果推ast的过程
```shell
MlV = {}
MlV = Sw(AG, [Os()[CM(OL)](ECV, NM, Rh, j5), vnV, Os()[CM(GD)](lZ, DP, PR(PR(bS)), fM), kAV[Os()[CM(GM)].call(null, SR, zM, PR(PR(bS)), xL)], Y2()[VZ(XZ)].call(null, Kf, NM, QB, M8), R7V, f2()[zb(Sb)].call(null, SZ, UZV, hh, mn), LSV, Os()[CM(lR)](ww, JHV, WT, Sb), ZbV, f2()[zb(DT)].call(null, PR(PR(Kh)), Vs, xL, PR({})), SzV, T5()[lT(QB)](CQV, Tw, ED, q5), RE, Os()[CM(CmV)](Kg, NR, vs, CL), nj, fS()[zf(OL)](JlV, F2, PP), nnV, fS()[zf(GD)].apply(null, [YCV, DP, G3]), XpV, Nb(typeof Y2()[VZ(OL)], B8('', [][[]])) ? Y2()[VZ(PP)](dmV, S5, PR(bS), dM) : Y2()[VZ(Rh)].apply(null, [mh, CmV, PR([]), pb]), B9V, G6()[Is(GD)](GS, PD), gPV, BZ()[FZ(tP)].call(null, E8, qM, dZ), bAV, f2()[zb(OL)](vs, FP, Qd, DD), P8V, T5()[lT(VD)](pg, S6, Hn, q5), FE, fS()[zf(lR)].apply(null, [fX, Qh, H8]), C9V, Y2()[VZ(NM)].apply(null, [zl, sT, Kh, A6]), gtV, m2()[Us(JZ)].call(null, vf, ph, DD, O0, pb), bSV, fS()[zf(CmV)](bg, w5, QT), JE, Os()[CM(qw)](HP, DT, Ah, PR([])), PrV, fS()[zf(qw)].call(null, UZV, PP, XL), g8V, rn(typeof f2()[zb(ds)], B8('', [][[]])) ? f2()[zb(GD)](w5, kU, gb, Ah) : f2()[zb(ss)](Gb, cE, Bs, ph), tfV, Nb(typeof BZ()[FZ(DS)], B8([], [][[]])) ? BZ()[FZ(wt)](jL, PR(PR(Kh)), zg) : BZ()[FZ(M8)](AT, JP, H4), MSV, UP()[xh(JZ)](pg, H8, rZ, q5), SPV, fS()[zf(s8)].apply(null, [fJ, PR(PR({})), mn]), w8V, f2()[zb(lR)].call(null, PR(bS), lg, HR, PR({})), JrV, rn(typeof G6()[Is(wS)], B8('', [][[]])) ? G6()[Is(lR)].apply(null, [Qh, Y6]) : G6()[Is(pb)](J2V, A3), hhV, Os()[CM(s8)].apply(null, [rSV, Ds, dM, Db]), XfV, T5()[lT(Gb)].call(null, O0, YJV, TD, q5), nCV, fS()[zf(jL)](bKV, PR(Kh), M4), TzV]);//MlV sensor_data

q9V = jK[UP()[xh(F2)].call(null, AP, Qh, gb, ss)][f2()[zb(O8)].call(null, K6, gVV, M4, pP)](MlV);//MLV sensor_data 经过的地方
var FbV = Yq();
q9V = RL(TV, [q9V, CSV[Kh]]);//MLV sensor_data 经过的地方
FbV = kb(Yq(), FbV);
var qZV = Yq();
q9V = bh(q9V, CSV[l5[bZ]]);//MLV sensor_data 经过的地方
......
q9V = f2()[zb(Z5)](Z5, IN, ss, ss)[m2()[Us(pb)].call(null, F8, SZ, CP, U9V, bZ)](sMV, WS()[t8(CZ)](rZ, Kh, bP, DD, qBV, PR(PR(Kh))))[m2()[Us(pb)](PR({}), FT, CP, U9V, bZ)](n8V, rn(typeof WS()[t8(Gb)], B8(f2()[zb(Z5)].call(null, nR, IN, ss, PR(PR(bS))), [][[]])) ? WS()[t8(CZ)].call(null, WT, Kh, bP, F2, qBV, NM) : WS()[t8(bZ)].apply(null, [PR({}), dg, mVV, O8, Tv, PR({})]))[m2()[Us(pb)](PR(PR([])), NR, CP, U9V, bZ)](q9V);

var zQV = jK[UP()[xh(F2)](g1V, M8, gb, ss)][f2()[zb(O8)](PR(PR({})), mE, M4, PR(Kh))](q9V);
var cQV = (rn(typeof WS()[t8(Qh)], B8([], [][[]])) ? WS()[t8(GM)](DS, dR, jX, ss, nT, F8) : WS()[t8(bZ)](XL, LX, Pd, XL, CpV, JB))[m2()[Us(pb)](pb, F2, CP, OI, bZ)](zQV, jb()[LD(GM)](V1V, CL, Ij, XL, Kh, HB));
FlV[f2()[zb(fD)].call(null, lM, xZ, YX, Kh)](cQV); //cQV sensor_data 
```


3. ast还原过程
```shell
混淆1:
Object['\x63\x72\x65\x61\x74\x65']

混淆2：
zb(fD)

混淆3：
打印fd变量的值,替换为字符串
```