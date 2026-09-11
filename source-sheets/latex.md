---
title: LaTeX
intro: This cheat sheet summarizes a reference list of [LaTeX](https://www.latex-project.org/) commonly used display math notation and some application examples of [KaTeX](https://katex.org/).
---

## Getting Started

### Introduction

[LaTeX](https://www.latex-project.org/) A TEX-based typesetting system suitable for producing scientific, mathematical,
and physical documents of high print quality.

- [LaTeX official website](https://www.latex-project.org/) _(latex-project.org)_
- [KaTeX official website](https://katex.org/) _(katex.org)_

And [KaTeX](https://katex.org/) handles only a smaller subset of LaTeX's mathematical notation for display on the web

### Example

```KaTeX
% \f is defined as #1f(#2) using the macro
f\relax(x) = \int_{-\infty}^\infty
    f\hat\xi\,e^{2 \pi i \xi x}
    \,d\xi
```

---

```LaTeX
% \f is defined as #1f(#2) using the macro
f\relax(x) = \int_{-\infty}^\infty
    f\hat\xi\,e^{2 \pi i \xi x}
    \,d\xi
```

### Inline

```markdown
Based on KaTeX in one lineExample  
Example： `KaTeX:\int_0^\infty x^2 dx`
```

Example based on KaTeX showing on one line: `KaTeX:\int_0^\infty x^2 dx`

## Supported Functions

### Accents

| :-                                             | :-                                                                     | :-                                                               |
| :--------------------------------------------- | :--------------------------------------------------------------------- | :--------------------------------------------------------------- |
| `KaTeX:a'` `a'`                     | `KaTeX:\tilde{a}` `\tilde{a}`                               | `KaTeX:\mathring{g}` `\mathring{g}`                   |
| `KaTeX:a''` `a''`                   | `KaTeX:\widetilde{ac}` `\widetilde{ac}`                     | `KaTeX:\overgroup{AB}` `\overgroup{AB}`               |
| `KaTeX:a^{\prime}` `a^{\prime}`     | `KaTeX:\utilde{AB}` `\utilde{AB}`                           | `KaTeX:\undergroup{AB}` `\undergroup{AB}`             |
| `KaTeX:\acute{a}` `\acute{a}`       | `KaTeX:\vec{F}` `\vec{F}`                                   | `KaTeX:\Overrightarrow{AB}` `\Overrightarrow{AB}`     |
| `KaTeX:\bar{y}` `\bar{y}`           | `KaTeX:\overleftarrow{AB}` `\overleftarrow{AB}`             | `KaTeX:\overrightarrow{AB}` `\overrightarrow{AB}`     |
| `KaTeX:\breve{a}` `\breve{a}`       | `KaTeX:\underleftarrow{AB}` `\underleftarrow{AB}`           | `KaTeX:\underrightarrow{AB}` `\underrightarrow{AB}`   |
| `KaTeX:\check{a}` `\check{a}`       | `KaTeX:\overleftharpoon{ac}` `\overleftharpoon{ac}`         | `KaTeX:\overrightharpoon{ac}` `\overrightharpoon{ac}` |
| `KaTeX:\dot{a}` `\dot{a}`           | `KaTeX:\overleftrightarrow{AB}` `\overleftrightarrow{AB}`   | `KaTeX:\overbrace{AB}` `\overbrace{AB}`               |
| `KaTeX:\ddot{a}` `\ddot{a}`         | `KaTeX:\underleftrightarrow{AB}` `\underleftrightarrow{AB}` | `KaTeX:\underbrace{AB}` `\underbrace{AB}`             |
| `KaTeX:\grave{a}` `\grave{a}`       | `KaTeX:\overline{AB}` `\overline{AB}`                       | `KaTeX:\overlinesegment{AB}` `\overlinesegment{AB}`   |
| `KaTeX:\hat{\theta}` `\hat{\theta}` | `KaTeX:\underline{AB}` `\underline{AB}`                     | `KaTeX:\underlinesegment{AB}` `\underlinesegment{AB}` |
| `KaTeX:\widehat{ac}` `\widehat{ac}` | `KaTeX:\widecheck{ac}` `\widecheck{ac}`                     | `KaTeX:\underbar{X}` `\underbar{X}`                   |

### Emphasis in \text&lcub;...&rcub;

| :-                                                   | :-                               |
| :--------------------------------------------------- | :------------------------------- |
| `KaTeX:\'{a}` `\'{a}`                     | `KaTeX:\~{a}` `\~{a}` |
| `KaTeX:\.{a}` `\.{a}`                     | `KaTeX:\H{a}` `\H{a}` |
| ``KaTeX:\\\`{a}`` <code>\\&#96;{a}</code> | `KaTeX:\={a}` `\={a}` |
| `KaTeX:\"{a}` `\"{a}`                     | `KaTeX:\v{a}` `\v{a}` |
| `KaTeX:\^{a}` `\^{a}`                     | `KaTeX:\u{a}` `\u{a}` |
| `KaTeX:\r{a}` `\r{a}`                     |

### Delimiter Sizing

| :-                                  | :-                                       |
| :---------------------------------- | :--------------------------------------- |
| `KaTeX:\left(\LARGE{AB}\right)`     | `\left(\LARGE{AB}\right)`     |
| `KaTeX:( \big( \Big( \bigg( \Bigg(` | `( \big( \Big( \bigg( \Bigg(` |

---

| :-        | :-      | :-       | :-       | :-       |
| :-------- | :------ | :------- | :------- | :------- |
| `\left`   | `\big`  | `\bigl`  | `\bigm`  | `\bigr`  |
| `\middle` | `\Big`  | `\Bigl`  | `\Bigm`  | `\Bigr`  |
| `\right`  | `\bigg` | `\biggl` | `\biggm` | `\biggr` |
| `\`       | `\Bigg` | `\Biggl` | `\Biggm` | `\Biggr` |

### Greek and Hebrew letters

| preview          | method                | preview         | method               | preview          | method                | preview             | method                   | preview         | method               | preview          | method                |
| :--------------- | :-------------------- | :-------------- | :------------------- | :--------------- | :-------------------- | :------------------ | :----------------------- | :-------------- | :------------------- | :--------------- | :-------------------- |
| `KaTeX:\alpha`   | `\alpha`   | `KaTeX:\kappa`  | `\kappa`  | `KaTeX:\psi`     | `\psi`     | `KaTeX:\digamma`    | `\digamma`    | `KaTeX:\Delta`  | `\Delta`  | `KaTeX:\Theta`   | `\Theta`   |
| `KaTeX:\beta`    | `\beta`    | `KaTeX:\lambda` | `\lambda` | `KaTeX:\rho`     | `\rho`     | `KaTeX:\varepsilon` | `\varepsilon` | `KaTeX:\Gamma`  | `\Gamma`  | `KaTeX:\Upsilon` | `\Upsilon` |
| `KaTeX:\chi`     | `\chi`     | `KaTeX:\mu`     | `\mu`     | `KaTeX:\sigma`   | `\sigma`   | `KaTeX:\varkappa`   | `\varkappa`   | `KaTeX:\Lambda` | `\Lambda` | `KaTeX:\Xi`      | `\Xi`      |
| `KaTeX:\delta`   | `\delta`   | `KaTeX:\nu`     | `\nu`     | `KaTeX:\tau`     | `\tau`     | `KaTeX:\varphi`     | `\varphi`     | `KaTeX:\Omega`  | `\Omega`  |                  |                       |
| `KaTeX:\epsilon` | `\epsilon` | `KaTeX:o`       | `o`       | `KaTeX:\theta`   | `\theta`   | `KaTeX:\varpi`      | `\varpi`      | `KaTeX:\Phi`    | `\Phi`    | `KaTeX:\aleph`   | `\aleph`   |
| `KaTeX:\eta`     | `\eta`     | `KaTeX:\omega`  | `\omega`  | `KaTeX:\upsilon` | `\upsilon` | `KaTeX:\varrho`     | `\varrho`     | `KaTeX:\Pi`     | `\Pi`     | `KaTeX:\beth`    | `\beth`    |
| `KaTeX:\gamma`   | `\gamma`   | `KaTeX:\phi`    | `\phi`    | `KaTeX:\xi`      | `\xi`      | `KaTeX:\varsigma`   | `\varsigma`   | `KaTeX:\Psi`    | `\Psi`    | `KaTeX:\daleth`  | `\daleth`  |
| `KaTeX:\iota`    | `\iota`    | `KaTeX:\pi`     | `\pi`     | `KaTeX:\zeta`    | `\zeta`    | `KaTeX:\vartheta`   | `\vartheta`   | `KaTeX:\Sigma`  | `\Sigma`  | `KaTeX:\gimel`   | `\gimel`   |


#### Other letters

| :-               | :-                    | :-               | :-                    | :-               | :-                    | :-                 | :-                      | :-                 | :-                      |
| :--------------- | :-------------------- | :--------------- | :-------------------- | :--------------- | :-------------------- | :----------------- | :---------------------- | :----------------- | :---------------------- |
| `KaTeX:\imath`   | `\imath`   | `KaTeX:\nabla`   | `\nabla`   | `KaTeX:\Im`      | `\Im`      | `KaTeX:\Reals`     | `\Reals`     | `KaTeX:\text{\OE}` | `\text{\OE}` |
| `KaTeX:\jmath`   | `\jmath`   | `KaTeX:\partial` | `\partial` | `KaTeX:\image`   | `\image`   | `KaTeX:\wp`        | `\wp`        | `KaTeX:\text{\o}`  | `\text{\o}`  |
| `KaTeX:\aleph`   | `\aleph`   | `KaTeX:\Game`    | `\Game`    | `KaTeX:\Bbbk`    | `\Bbbk`    | `KaTeX:\weierp`    | `\weierp`    | `KaTeX:\text{\O}`  | `\text{\O}`  |
| `KaTeX:\alef`    | `\alef`    | `KaTeX:\Finv`    | `\Finv`    | `KaTeX:\N`       | `\N`       | `KaTeX:\Z`         | `\Z`         | `KaTeX:\text{\ss}` | `\text{\ss}` |
| `KaTeX:\alefsym` | `\alefsym` | `KaTeX:\cnums`   | `\cnums`   | `KaTeX:\natnums` | `\natnums` | `KaTeX:\text{\aa}` | `\text{\aa}` | `KaTeX:\text{\i}`  | `\text{\i}`  |
| `KaTeX:\beth`    | `\beth`    | `KaTeX:\Complex` | `\Complex` | `KaTeX:\R`       | `\R`       | `KaTeX:\text{\AA}` | `\text{\AA}` | `KaTeX:\text{\j}`  | `\text{\j}`  |
| `KaTeX:\gimel`   | `\gimel`   | `KaTeX:\ell`     | `\ell`     | `KaTeX:\Re`      | `\Re`      | `KaTeX:\text{\ae}` | `\text{\ae}` |                    |                         |
| `KaTeX:\daleth`  | `\daleth`  | `KaTeX:\hbar`    | `\hbar`    | `KaTeX:\real`    | `\real`    | `KaTeX:\text{\AE}` | `\text{\AE}` |                    |                         |
| `KaTeX:\eth`     | `\eth`     | `KaTeX:\hslash`  | `\hslash`  | `KaTeX:\reals`   | `\reals`   | `KaTeX:\text{\oe}` | `\text{\oe}` |                    |                         |


### Alphabets and Unicode

| preview             | method                   | preview           | method                 | preview           | method                 | preview             | method                   |
| :------------------ | :----------------------- | :---------------- | :--------------------- | :---------------- | :--------------------- | :------------------ | :----------------------- |
| `KaTeX:\Alpha`      | `\Alpha`      | `KaTeX:\Beta`     | `\Beta`     | `KaTeX:\Gamma`    | `\Gamma`    | `KaTeX:\Delta`      | `\Delta`      |
| `KaTeX:\Epsilon`    | `\Epsilon`    | `KaTeX:\Zeta`     | `\Zeta`     | `KaTeX:\Eta`      | `\Eta`      | `KaTeX:\Theta`      | `\Theta`      |
| `KaTeX:\Iota`       | `\Iota`       | `KaTeX:\Kappa`    | `\Kappa`    | `KaTeX:\Lambda`   | `\Lambda`   | `KaTeX:\Mu`         | `\Mu`         |
| `KaTeX:\Nu`         | `\Nu`         | `KaTeX:\Xi`       | `\Xi`       | `KaTeX:\Omicron`  | `\Omicron`  | `KaTeX:\Pi`         | `\Pi`         |
| `KaTeX:\Rho`        | `\Rho`        | `KaTeX:\Sigma`    | `\Sigma`    | `KaTeX:\Tau`      | `\Tau`      | `KaTeX:\Upsilon`    | `\Upsilon`    |
| `KaTeX:\Phi`        | `\Phi`        | `KaTeX:\Chi`      | `\Chi`      | `KaTeX:\Psi`      | `\Psi`      | `KaTeX:\Omega`      | `\Omega`      |
| `KaTeX:\varGamma`   | `\varGamma`   | `KaTeX:\varDelta` | `\varDelta` | `KaTeX:\varTheta` | `\varTheta` | `KaTeX:\varLambda`  | `\varLambda`  |
| `KaTeX:\varXi`      | `\varXi`      | `KaTeX:\varPi`    | `\varPi`    | `KaTeX:\varSigma` | `\varSigma` | `KaTeX:\varUpsilon` | `\varUpsilon` |
| `KaTeX:\varPhi`     | `\varPhi`     | `KaTeX:\varPsi`   | `\varPsi`   | `KaTeX:\varOmega` | `\varOmega` |                     |                          |
| `KaTeX:\alpha`      | `\alpha`      | `KaTeX:\beta`     | `\beta`     | `KaTeX:\gamma`    | `\gamma`    | `KaTeX:\delta`      | `\delta`      |
| `KaTeX:\epsilon`    | `\epsilon`    | `KaTeX:\zeta`     | `\zeta`     | `KaTeX:\eta`      | `\eta`      | `KaTeX:\theta`      | `\theta`      |
| `KaTeX:\iota`       | `\iota`       | `KaTeX:\kappa`    | `\kappa`    | `KaTeX:\lambda`   | `\lambda`   | `KaTeX:\mu`         | `\mu`         |
| `KaTeX:\nu`         | `\nu`         | `KaTeX:\xi`       | `\xi`       | `KaTeX:\omicron`  | `\omicron`  | `KaTeX:\pi`         | `\pi`         |
| `KaTeX:\rho`        | `\rho`        | `KaTeX:\sigma`    | `\sigma`    | `KaTeX:\tau`      | `\tau`      | `KaTeX:\upsilon`    | `\upsilon`    |
| `KaTeX:\phi`        | `\phi`        | `KaTeX:\chi`      | `\chi`      | `KaTeX:\psi`      | `\psi`      | `KaTeX:\omega`      | `\omega`      |
| `KaTeX:\varepsilon` | `\varepsilon` | `KaTeX:\varkappa` | `\varkappa` | `KaTeX:\vartheta` | `\vartheta` | `KaTeX:\thetasym`   | `\thetasym`   |
| `KaTeX:\varpi`      | `\varpi`      | `KaTeX:\varrho`   | `\varrho`   | `KaTeX:\varsigma` | `\varsigma` | `KaTeX:\varphi`     | `\varphi`     |
| `KaTeX:\digamma`    | `\digamma`    |


### Annotation

| :-                                                    | :-                             | :-                                       | :-                                            |
| :---------------------------------------------------- | :----------------------------- | :--------------------------------------- | :-------------------------------------------- |
| `KaTeX:\cancel{5}`                                    | `\cancel{5}`        | `KaTeX:\overbrace{a+b+c}^{\text{note}}`  | `\overbrace{a+b+c}^{\text{note}}`  |
| `KaTeX:\bcancel{5}`                                   | `\bcancel{5}`       | `KaTeX:\underbrace{a+b+c}_{\text{note}}` | `\underbrace{a+b+c}_{\text{note}}` |
| `KaTeX:\xcancel{ABC}`                                 | `\xcancel{ABC}`     | `KaTeX:\not =`                           | `\not =`                           |
| `KaTeX:\sout{abc}`                                    | `\sout{abc}`        | `KaTeX:\boxed{\pi=\frac c d}`            | `\boxed{\pi=\frac c d}`            |
| `KaTeX:\$a_{\angl n}` _MD syntax conflict_ | `$a_{\angl n}`      | `KaTeX:a_\angln`                         | `a_\angln`                         |
| `KaTeX:\phase{-78^\circ}`                             | `\phase{-78^\circ}` |

\tag{hi} x+y^{2x}

```KaTex
\tag{hi} x+y^{2x}
```

\tag\*{hi} x+y^{2x}

```KaTex
\tag*{hi} x+y^{2x}
```

### Vertical layout

| :-                                     | :-                                          | :-                      | :-                           | :-                                                          | :-                                                    |
| :------------------------------------- | :------------------------------------------ | :---------------------- | :--------------------------- | :---------------------------------------------------------- | :---------------------------------------------------- |
| `KaTeX:x_n`                            | `x_n`                            | `KaTeX:\stackrel{!}{=}` | `\stackrel{!}{=}` | `KaTeX:a \atop b`                                           | `a \atop b`                                           |
| `KaTeX:e^x`                            | `e^x`                            | `KaTeX:\overset{!}{=}`  | `\overset{!}{=}`  | `KaTeX:a\raisebox{0.25em}{$b$}c`                            | `a\raisebox{0.25em}{$b$}c`                            |
| `KaTeX:_u^o`                           | `_u^o`                           | `KaTeX:\underset{!}{=}` | `\underset{!}{=}` | `KaTeX:a+\left(\vcenter{\hbox{$\frac{\frac a b}c$}}\right)` | `a+\left(\vcenter{\hbox{$\frac{\frac a b}c$}}\right)` |
| `KaTeX:\sum_{\substack{0<i<m\\0<j<n}}` | `\sum_{\substack{0<i<m\\0<j<n}}` |                         |                              |                                                             |                                                       |

### Overlap and Spacing

| :-                                                     | :-                                 | :-                                    |
| :----------------------------------------------------- | :--------------------------------- | :------------------------------------ |
| `KaTeX:{=}\mathllap{/\,}` {=}\mathllap{/\,} | `KaTeX:\left(x^{\smash{2}}\right)` | \left(x^{\smash{2}}\right) |
| `KaTeX:\mathrlap{\,/}{=}` \mathrlap{\,/}{=} | `KaTeX:\sqrt{\smash[b]{y}}`        | \sqrt{\smash[b]{y}}        |

`\sum_{\mathclap{1\le i\le j\le n}} x_{ij}`

```KaTex
\sum_{\mathclap{1\le i\le j\le n}} x_{ij}
```

### `KaTeX:\LaTeX` math constructs

| Preview                 | Method                       | Preview                 | Method                       | Preview                      | Method                            |
| :---------------------- | :--------------------------- | :---------------------- | :--------------------------- | :--------------------------- | :-------------------------------- |
| `KaTeX:\frac{abc}{xyz}` | `\frac{abc}{xyz}` | `KaTeX:\overline{abc}`  | `\overline{abc}`  | `KaTeX:\overrightarrow{abc}` | `\overrightarrow{abc}` |
| `KaTeX:f'`              | `f'`              | `KaTeX:\underline{abc}` | `\underline{abc}` | `KaTeX:\overleftarrow{abc}`  | `\overleftarrow{abc}`  |
| `KaTeX:\sqrt{abc}`      | `\sqrt{abc}`      | `KaTeX:\widehat{abc}`   | `\widehat{abc}`   | `KaTeX:\overbrace{abc}`      | `\overbrace{abc}`      |
| `KaTeX:\sqrt[n]{abc}`   | `\sqrt[n]{abc}`   | `KaTeX:\widetilde{abc}` | `\widetilde{abc}` | `KaTeX:\underbrace{abc}`     | `\underbrace{abc}`     |

### Delimiters

| preview                                      | method                           | preview                 | method                         | preview     | method              | preview                          | method                                 | preview                 | method                       |
| :------------------------------------------- | :------------------------------- | :---------------------- | :----------------------------- | :---------- | :------------------ | :------------------------------- | :------------------------------------- | :---------------------- | :--------------------------- |
| `KaTeX:()`                                   | `()`                  | `KaTeX:\lparen \rparen` | `\lparen` `\rparen` | `KaTeX:⌈ ⌉` | `⌈ ⌉`    | `KaTeX:\lceil \rceil`            | `\lceil` `\rceil`           | `KaTeX:\uparrow`        | `\uparrow`        |
| `KaTeX:[]`                                   | `[]`                  | `KaTeX:\lbrack \rbrack` | `\lbrack` `\rbrack` | `KaTeX:⌊ ⌋` | `⌊ ⌋`    | `KaTeX:\lfloor \rfloor`          | `\lfloor` `\rfloor`         | `KaTeX:\downarrow`      | `\downarrow`      |
| `KaTeX:\{ \}`                                | `{}`                  | `KaTeX:\lbrace \rbrace` | `\lbrace` `\rbrace` | `KaTeX:⎰⎱`  | `⎰⎱`     | `KaTeX:\lmoustache  \rmoustache` | `\lmoustache` `\rmoustache` | `KaTeX:\updownarrow`    | `\updownarrow`    |
| `KaTeX:⟨ ⟩`                                  | `⟨⟩`                  | `KaTeX:\langle \rangle` | `\langle` `\rangle` | `KaTeX:⟮ ⟯` | `⟮ ⟯`    | `KaTeX:\lgroup \rgroup`          | `\lgroup` `\rgroup`         | `KaTeX:\Uparrow`        | `\Uparrow`        |
| `KaTeX:∣`                                    | `\|`                  | `KaTeX:\vert`           | `\vert`             | `KaTeX:┌ ┐` | `┌ ┐`    | `KaTeX:\ulcorner \urcorner`      | `\ulcorner` `\urcorner`     | `KaTeX:\Downarrow`      | `\Downarrow`      |
| `KaTeX:\|` _(MD syntax conflict)_ | <code>\\&#124;</code> | `KaTeX:\Vert`           | `\Vert`             | `KaTeX:└ ┘` | `└ ┘`    | `KaTeX:\llcorner \lrcorner`      | `\llcorner` `\lrcorner`     | `KaTeX:\Updownarrow`    | `\Updownarrow`    |
| `KaTeX:∣ ∣`                                  | `\lvert` `\rvert`     | `KaTeX:\lVert \rVert`   | `\lVert` `\rVert`   |             | `\left.` |                                  | `\right.`                   | `KaTeX:\backslash`      | `\backslash`      |
| `KaTeX:\lang` `KaTeX:\rang`                  | `\lang` `\rang`        | `KaTeX:\lt \gt`         | `\lt \gt`           | `KaTeX:⟦ ⟧` | `⟦ ⟧`    | `KaTeX:\llbracket \rrbracket`    | `\llbracket` `\rrbracket`   | `KaTeX:\lBrace \rBrace` | `\lBrace \rBrace` |


The pair of expressions `\left` `KaTeX:s_1` and `\right` `KaTeX:s_2` can be used to match the height of the separators
`KaTeX:s_1` and `KaTeX:s_2` to the height of their content, e.g. :

| :-              | :-           | :-               | :-              | :-           | :-               | :-                 | :-           | :-              |
| :-------------- | :----------- | :--------------- | :-------------- | :----------- | :--------------- | :----------------- | :----------- | :-------------- |
| `KaTeX:\left\|` | `KaTeX:expr` | `KaTeX:\right\|` | `KaTeX:\left\{` | `KaTeX:expr` | `KaTeX:\right\}` | `KaTeX:\left\Vert` | `KaTeX:expr` | `KaTeX:\right.` |

### Variable Size Symbols

| preview         | method               | preview       | method             | preview           | method                 | preview            | method                  | preview           | method                 |
| :-------------- | :------------------- | :------------ | :----------------- | :---------------- | :--------------------- | :----------------- | :---------------------- | :---------------- | :--------------------- |
| `KaTeX:\sum`    | `\sum`    | `KaTeX:\int`  | `\int`  | `KaTeX:\biguplus` | `\biguplus` | `KaTeX:\bigoplus`  | `\bigoplus`  | `KaTeX:\bigvee`   | `\bigvee`   |
| `KaTeX:\prod`   | `\prod`   | `KaTeX:\oint` | `\oint` | `KaTeX:\bigcap`   | `\bigcap`   | `KaTeX:\bigotimes` | `\bigotimes` | `KaTeX:\bigwedge` | `\bigwedge` |
| `KaTeX:\coprod` | `\coprod` | `KaTeX:\iint` | `\iint` | `KaTeX:\bigcup`   | `\bigcup`   | `KaTeX:\bigodot`   | `\bigodot`   | `KaTeX:\bigodot`  | `\bigodot`  |


### standard function name{.col-span-3}

| preview         | method               | preview         | method               | preview         | method               | preview         | method               |
| :-------------- | :------------------- | :-------------- | :------------------- | :-------------- | :------------------- | :-------------- | :------------------- |
| `KaTeX:\arccos` | `\arccos` | `KaTeX:\arcsin` | `\arcsin` | `KaTeX:\arcsin` | `\arcsin` | `KaTeX:\arg`    | `\arg`    |
| `KaTeX:\cos`    | `\cos`    | `KaTeX:\cosh`   | `\cosh`   | `KaTeX:\cot`    | `\cot`    | `KaTeX:\coth`   | `\coth`   |
| `KaTeX:\csc`    | `\csc`    | `KaTeX:\deg`    | `\deg`    | `KaTeX:\det`    | `\det`    | `KaTeX:\dim`    | `\dim`    |
| `KaTeX:\exp`    | `\exp`    | `KaTeX:\gcd`    | `\gcd`    | `KaTeX:\hom`    | `\hom`    | `KaTeX:\inf`    | `\inf`    |
| `KaTeX:\ker`    | `\ker`    | `KaTeX:\lg`     | `\lg`     | `KaTeX:\lim`    | `\lim`    | `KaTeX:\liminf` | `\liminf` |
| `KaTeX:\limsup` | `\limsup` | `KaTeX:\ln`     | `\ln`     | `KaTeX:\log`    | `\log`    | `KaTeX:\max`    | `\max`    |
| `KaTeX:\min`    | `\min`    | `KaTeX:\Pr`     | `\Pr`     | `KaTeX:\sec`    | `\sec`    | `KaTeX:\sin`    | `\sin`    |
| `KaTeX:\sinh`   | `\sinh`   | `KaTeX:\sup`    | `\sup`    | `KaTeX:\tan`    | `\tan`    | `KaTeX:\tanh`   | `\tanh`   |


#### Function names should be in roman font, not italics, for example:

| :-         | :-                         | :-                  | :-                    |
| :--------- | :------------------------- | :------------------ | :-------------------- |
| Correct:   | `\tan(at-n\pi)` | `KaTeX:\rightarrow` | `KaTeX:\tan(at-n\pi)` |
| Incorrect: | `tan(at-n\pi)`  | `KaTeX:\rightarrow` | `KaTeX:tan(at-n\pi)`  |


### Logic and Set Theory{.col-span-3}

| :-               | :-                    | :-                  | :-                       | :-                      | :-                           | :-                         | :-                                      |
| :--------------- | :-------------------- | :------------------ | :----------------------- | :---------------------- | :--------------------------- | :------------------------- | :-------------------------------------- |
| `KaTeX:\forall`  | `\forall`  | `KaTeX:\complement` | `\complement` | `KaTeX:\therefore`      | `\therefore`      | `KaTeX:\emptyset`          | `\emptyset`                  |
| `KaTeX:\exists`  | `\exists`  | `KaTeX:\subset`     | `\subset`     | `KaTeX:\because`        | `\because`        | `KaTeX:\empty`             | `\empty`                     |
| `KaTeX:\exist`   | `\exist`   | `KaTeX:\supset`     | `\supset`     | `KaTeX:\mapsto`         | `\mapsto`         | `KaTeX:\varnothing`        | `\varnothing`                |
| `KaTeX:\nexists` | `\nexists` | `KaTeX:\mid`        | `\mid`        | `KaTeX:\to`             | `\to`             | `KaTeX:\implies`           | `\implies`                   |
| `KaTeX:\in`      | `\in`      | `KaTeX:\land`       | `\land`       | `KaTeX:\gets`           | `\gets`           | `KaTeX:\impliedby`         | `\impliedby`                 |
| `KaTeX:\isin`    | `\isin`    | `KaTeX:\lor`        | `\lor`        | `KaTeX:\leftrightarrow` | `\leftrightarrow` | `KaTeX:\iff`               | `\iff`                       |
| `KaTeX:\notin`   | `\notin`   | `KaTeX:\ni`         | `\ni`         | `KaTeX:\notni`          | `\notni`          | `KaTeX:\neg` `KaTeX:\lnot` | `\neg` or `\lnot` |


---

| :-                               | :-                                  | :-                   | :-                      |
| :------------------------------- | :---------------------------------- | :------------------- | :---------------------- |
| `KaTeX:\Set{ x \| x<\frac 1 2 }` | \Set{ x \| x<\frac 1 2 } | `KaTeX:\set{x\|x<5}` | \set{x\|x<5} |

### special symbols{.col-span-3}

| :-                 | :-                    | :-                 | :-                    | :-                                             | :-                                                  |
| :----------------- | :-------------------- | :----------------- | :-------------------- | :--------------------------------------------- | :-------------------------------------------------- |
| `KaTeX:\bra{\phi}` | \bra{\phi} | `KaTeX:\ket{\psi}` | \ket{\psi} | `KaTeX:\braket{\phi\|\psi}`                    | `\braket{\phi\|\psi}`                    |
| `KaTeX:\Bra{\phi}` | \Bra{\phi} | `KaTeX:\Ket{\psi}` | \Ket{\psi} | `KaTeX:\Braket{ ϕ \| \frac{∂^2}{∂ t^2} \| ψ }` | `\Braket{ ϕ \| \frac{∂^2}{∂ t^2} \| ψ }` |


## Operator

### Mathematical operator

| :-                                 | :-                                      | :-              | :-                   | :-               | :-                    | :-                        | :-                             |
| :--------------------------------- | :-------------------------------------- | :-------------- | :------------------- | :--------------- | :-------------------- | :------------------------ | :----------------------------- |
| `KaTeX:\arcsin`                    | `\arcsin`                    | `KaTeX:\cosec`  | `\cosec`  | `KaTeX:\deg`     | `\deg`     | `KaTeX:\sec`              | `\sec`              |
| `KaTeX:\arccos`                    | `\arccos`                    | `KaTeX:\cosh`   | `\cosh`   | `KaTeX:\dim`     | `\dim`     | `KaTeX:\sin`              | `\sin`              |
| `KaTeX:\arctan`                    | `\arctan`                    | `KaTeX:\cot`    | `\cot`    | `KaTeX:\exp`     | `\exp`     | `KaTeX:\sinh`             | `\sinh`             |
| `KaTeX:\arctg`                     | `\arctg`                     | `KaTeX:\cotg`   | `\cotg`   | `KaTeX:\hom`     | `\hom`     | `KaTeX:\sh`               | `\sh`               |
| `KaTeX:\arcctg`                    | `\arcctg`                    | `KaTeX:\coth`   | `\coth`   | `KaTeX:\ker`     | `\ker`     | `KaTeX:\tan`              | `\tan`              |
| `KaTeX:\arg`                       | `\arg`                       | `KaTeX:\csc`    | `\csc`    | `KaTeX:\lg`      | `\lg`      | `KaTeX:\tanh`             | `\tanh`             |
| `KaTeX:\ch`                        | `\ch`                        | `KaTeX:\ctg`    | `\ctg`    | `KaTeX:\ln`      | `\ln`      | `KaTeX:\tg`               | `\tg`               |
| `KaTeX:\cos`                       | `\cos`                       | `KaTeX:\cth`    | `\cth`    | `KaTeX:\log`     | `\log`     | `KaTeX:\th`               | `\th`               |
| `KaTeX:\operatorname{f}`           | `\operatorname{f}`           |                 |                      |                  |                       |                           |                                |
| `KaTeX:\argmax`                    | `\argmax`                    | `KaTeX:\injlim` | `\injlim` | `KaTeX:\min`     | `\min`     | `KaTeX:\varinjlim`        | `\varinjlim`        |
| `KaTeX:\argmin`                    | `\argmin`                    | `KaTeX:\lim`    | `\lim`    | `KaTeX:\plim`    | `\plim`    | `KaTeX:\varliminf`        | `\varliminf`        |
| `KaTeX:\det`                       | `\det`                       | `KaTeX:\liminf` | `\liminf` | `KaTeX:\Pr`      | `\Pr`      | `KaTeX:\varlimsup`        | `\varlimsup`        |
| `KaTeX:\gcd`                       | `\gcd`                       | `KaTeX:\limsup` | `\limsup` | `KaTeX:\projlim` | `\projlim` | `KaTeX:\varprojlim`       | `\varprojlim`       |
| `KaTeX:\inf`                       | `\inf`                       | `KaTeX:\max`    | `\max`    | `KaTeX:\sup`     | `\sup`     | `KaTeX:\operatorname*{f}` | `\operatorname*{f}` |
| `KaTeX:\operatornamewithlimits{f}` | `\operatornamewithlimits{f}` |


### Big operator

| :-             | :-                  | :-                | :-                     | :-                 | :-                      | :-                | :-                     |
| :------------- | :------------------ | :---------------- | :--------------------- | :----------------- | :---------------------- | :---------------- | :--------------------- |
| `KaTeX:\sum`   | `\sum`   | `KaTeX:\prod`     | `\prod`     | `KaTeX:\bigotimes` | `\bigotimes` | `KaTeX:\bigvee`   | `\bigvee`   |
| `KaTeX:\int`   | `\int`   | `KaTeX:\coprod`   | `\coprod`   | `KaTeX:\bigoplus`  | `\bigoplus`  | `KaTeX:\bigwedge` | `\bigwedge` |
| `KaTeX:\iint`  | `\iint`  | `KaTeX:\intop`    | `\intop`    | `KaTeX:\bigodot`   | `\bigodot`   | `KaTeX:\bigcap`   | `\bigcap`   |
| `KaTeX:\iiint` | `\iiint` | `KaTeX:\smallint` | `\smallint` | `KaTeX:\biguplus`  | `\biguplus`  | `KaTeX:\bigcup`   | `\bigcup`   |
| `KaTeX:\oint`  | `\oint`  | `KaTeX:\oiint`    | `\oiint`    | `KaTeX:\oiiint`    | `\oiiint`    | `KaTeX:\bigsqcup` | `\bigsqcup` |


### Fractions and binomials

| :-                                  | :-                                       | :-                                  | :-                                       |
| :---------------------------------- | :--------------------------------------- | :---------------------------------- | :--------------------------------------- |
| `KaTeX:\frac{a}{b}`                 | `\frac{a}{b}`                 | `KaTeX:\tfrac{a}{b}`                | `\tfrac{a}{b}`                |
| `KaTeX:{a \over b}`                 | `{a \over b}`                 | `KaTeX:\dfrac{a}{b}`                | `\dfrac{a}{b}`                |
| `KaTeX:\genfrac ( ] {2pt}{1}a{a+1}` | `\genfrac ( ] {2pt}{1}a{a+1}` | `KaTeX:{a \above{2pt} b+1}`         | `{a \above{2pt} b+1}`         |
| `KaTeX:a/b`                         | `a/b`                         | `KaTeX:\cfrac{a}{1 + \cfrac{1}{b}}` | `\cfrac{a}{1 + \cfrac{1}{b}}` |


| :-                    | :-                         | :-                    | :-                         |
| :-------------------- | :------------------------- | :-------------------- | :------------------------- |
| `KaTeX:\binom{n}{k}`  | `\binom{n}{k}`  | `KaTeX:\dbinom{n}{k}` | `\dbinom{n}{k}` |
| `KaTeX:{n\brace k}`   | `{n\brace k}`   | `KaTeX:{n \choose k}` | `{n \choose k}` |
| `KaTeX:\tbinom{n}{k}` | `\tbinom{n}{k}` | `KaTeX:{n\brack k}`   | `{n\brack k}`   |


### \sqrt

| :-               | :-                    | :-                  | :-                       |
| :--------------- | :-------------------- | :------------------ | :----------------------- |
| `KaTeX:\sqrt{x}` | `\sqrt{x}` | `KaTeX:\sqrt[3]{x}` | `\sqrt[3]{x}` |


### Binary operator

| :-                | :-                     | :-                      | :-                           | :-                      | :-                           | :-                       | :-                            |
| :---------------- | :--------------------- | :---------------------- | :--------------------------- | :---------------------- | :--------------------------- | :----------------------- | :---------------------------- |
| `KaTeX:+`         | `+`         | `KaTeX:\cdot`           | `\cdot`           | `KaTeX:\gtrdot`         | `\gtrdot`         | `KaTeX:x \pmod a`        | `x \pmod a`        |
| `KaTeX:-`         | `-`         | `KaTeX:\cdotp`          | `\cdotp`          | `KaTeX:\intercal`       | `\intercal`       | `KaTeX:x \pod a`         | `x \pod a`         |
| `KaTeX:/`         | `/`         | `KaTeX:\centerdot`      | `\centerdot`      | `KaTeX:\land`           | `\land`           | `KaTeX:\rhd`             | `\rhd`             |
| `KaTeX:*`         | `*`         | `KaTeX:\circ`           | `\circ`           | `KaTeX:\leftthreetimes` | `\leftthreetimes` | `KaTeX:\rightthreetimes` | `\rightthreetimes` |
| `KaTeX:\amalg`    | `\amalg`    | `KaTeX:\circledast`     | `\circledast`     | `KaTeX:\ldotp`          | `\ldotp`          | `KaTeX:\rtimes`          | `\rtimes`          |
| `KaTeX:\And`      | `\And`      | `KaTeX:\circledcirc`    | `\circledcirc`    | `KaTeX:\lor`            | `\lor`            | `KaTeX:\setminus`        | `\setminus`        |
| `KaTeX:\ast`      | `\ast`      | `KaTeX:\circleddash`    | `\circleddash`    | `KaTeX:\lessdot`        | `\lessdot`        | `KaTeX:\smallsetminus`   | `\smallsetminus`   |
| `KaTeX:\barwedge` | `\barwedge` | `KaTeX:\Cup`            | `\Cup`            | `KaTeX:\lhd`            | `\lhd`            | `KaTeX:\sqcap`           | `\sqcap`           |
| `KaTeX:\bigcirc`  | `\bigcirc`  | `KaTeX:\cup`            | `\cup`            | `KaTeX:\ltimes`         | `\ltimes`         | `KaTeX:\sqcup`           | `\sqcup`           |
| `KaTeX:\bmod`     | `\bmod`     | `KaTeX:\curlyvee`       | `\curlyvee`       | `KaTeX:x\mod a`         | `x\mod a`         | `KaTeX:\times`           | `\times`           |
| `KaTeX:\boxdot`   | `\boxdot`   | `KaTeX:\curlywedge`     | `\curlywedge`     | `KaTeX:\mp`             | `\mp`             | `KaTeX:\unlhd`           | `\unlhd`           |
| `KaTeX:\boxminus` | `\boxminus` | `KaTeX:\div`            | `\div`            | `KaTeX:\odot`           | `\odot`           | `KaTeX:\unrhd`           | `\unrhd`           |
| `KaTeX:\boxplus`  | `\boxplus`  | `KaTeX:\divideontimes`  | `\divideontimes`  | `KaTeX:\ominus`         | `\ominus`         | `KaTeX:\uplus`           | `\uplus`           |
| `KaTeX:\boxtimes` | `\boxtimes` | `KaTeX:\dotplus`        | `\dotplus`        | `KaTeX:\oplus`          | `\oplus`          | `KaTeX:\vee`             | `\vee`             |
| `KaTeX:\bullet`   | `\bullet`   | `KaTeX:\doublebarwedge` | `\doublebarwedge` | `KaTeX:\otimes`         | `\otimes`         | `KaTeX:\veebar`          | `\veebar`          |
| `KaTeX:\Cap`      | `\Cap`      | `KaTeX:\doublecap`      | `\doublecap`      | `KaTeX:\oslash`         | `\oslash`         | `KaTeX:\wedge`           | `\wedge`           |
| `KaTeX:\cap`      | `\cap`      | `KaTeX:\doublecup`      | `\doublecup`      | `KaTeX:\pm`             | `\pm`             | `KaTeX:\plusmn`          | `\plusmn`          |
| `KaTeX:\wr`       | `\wr``      |


## Relation

### Relation

| :-                        | :-                                                          | :-                     | :-                                                       | :-                     | :-                          | :-                        | :-                                              |
| :------------------------ | :---------------------------------------------------------- | :--------------------- | :------------------------------------------------------- | :--------------------- | :-------------------------- | :------------------------ | :---------------------------------------------- |
| `KaTeX:=`                 | `=`                                              | `KaTeX:\doteqdot`      | `\doteqdot`                                   | `KaTeX:\lessapprox`    | `\lessapprox`    | `KaTeX:\smile`            | `\smile`                             |
| `KaTeX:<`                 | `<`                                              | `KaTeX:\eqcirc`        | `\eqcirc`                                     | `KaTeX:\lesseqgtr`     | `\lesseqgtr`     | `KaTeX:\sqsubset`         | `\sqsubset`                          |
| `KaTeX:>`                 | `>`                                              | `KaTeX:\eqcolon`       | `\eqcolon` or `\minuscolon`        | `KaTeX:\lesseqqgtr`    | `\lesseqqgtr`    | `KaTeX:\sqsubseteq`       | `\sqsubseteq`                        |
| `KaTeX::`                 | `:`                                              | `KaTeX:\Eqcolon`       | `\Eqcolon` or `\minuscoloncolon`   | `KaTeX:\lessgtr`       | `\lessgtr`       | `KaTeX:\sqsupset`         | `\sqsupset`                          |
| `KaTeX:\approx`           | `\approx`                                        | `KaTeX:\eqqcolon`      | `\eqqcolon` or `\equalscolon`      | `KaTeX:\lesssim`       | `\lesssim`       | `KaTeX:\sqsupseteq`       | `\sqsupseteq`                        |
| `KaTeX:\approxcolon`      | `\approxcolon`                                   | `KaTeX:\Eqqcolon`      | `\Eqqcolon` or `\equalscoloncolon` | `KaTeX:\ll`            | `\ll`            | `KaTeX:\Subset`           | `\Subset`                            |
| `KaTeX:\approxcoloncolon` | `\approxcoloncolon`                              | `KaTeX:\eqsim`         | `\eqsim`                                      | `KaTeX:\lll`           | `\lll`           | `KaTeX:\subset`           | `\subset` or `\sub`       |
| `KaTeX:\approxeq`         | `\approxeq`                                      | `KaTeX:\eqslantgtr`    | `\eqslantgtr`                                 | `KaTeX:\llless`        | `\llless`        | `KaTeX:\subseteq`         | `\subseteq` or `\sube`    |
| `KaTeX:\asymp`            | `\asymp`                                         | `KaTeX:\eqslantless`   | `\eqslantless`                                | `KaTeX:\lt`            | `\lt`            | `KaTeX:\subseteqq`        | `\subseteqq`                         |
| `KaTeX:\backepsilon`      | `\backepsilon`                                   | `KaTeX:\equiv`         | `\equiv`                                      | `KaTeX:\mid`           | `\mid`           | `KaTeX:\succ`             | `\succ`                              |
| `KaTeX:\backsim`          | `\backsim`                                       | `KaTeX:\fallingdotseq` | `\fallingdotseq`                              | `KaTeX:\models`        | `\models`        | `KaTeX:\succapprox`       | `\succapprox`                        |
| `KaTeX:\backsimeq`        | `\backsimeq`                                     | `KaTeX:\frown`         | `\frown`                                      | `KaTeX:\multimap`      | `\multimap`      | `KaTeX:\succcurlyeq`      | `\succcurlyeq`                       |
| `KaTeX:\between`          | `\between`                                       | `KaTeX:\ge`            | `\ge`                                         | `KaTeX:\origof`        | `\origof`        | `KaTeX:\succeq`           | `\succeq`                            |
| `KaTeX:\bowtie`           | `\bowtie`                                        | `KaTeX:\geq`           | `\geq`                                        | `KaTeX:\owns`          | `\owns`          | `KaTeX:\succsim`          | `\succsim`                           |
| `KaTeX:\bumpeq`           | `\bumpeq`                                        | `KaTeX:\geqq`          | `\geqq`                                       | `KaTeX:\parallel`      | `\parallel`      | `KaTeX:\Supset`           | `\Supset`                            |
| `KaTeX:\Bumpeq`           | `\Bumpeq`                                        | `KaTeX:\geqslant`      | `\geqslant`                                   | `KaTeX:\perp`          | `\perp`          | `KaTeX:\supset`           | `\supset`                            |
| `KaTeX:\circeq`           | `\circeq`                                        | `KaTeX:\gg`            | `\gg`                                         | `KaTeX:\pitchfork`     | `\pitchfork`     | `KaTeX:\supseteq`         | `\supseteq` or `\supe`    |
| `KaTeX:\colonapprox`      | `\colonapprox`                                   | `KaTeX:\ggg`           | `\ggg`                                        | `KaTeX:\prec`          | `\prec`          | `KaTeX:\supseteqq`        | `\supseteqq`                         |
| `KaTeX:\Colonapprox`      | `\Colonapprox` or `\coloncolonapprox` | `KaTeX:\gggtr`         | `\gggtr`                                      | `KaTeX:\precapprox`    | `\precapprox`    | `KaTeX:\thickapprox`      | `\thickapprox`                       |
| `KaTeX:\coloneq`          | `\coloneq` or `\colonminus`           | `KaTeX:\gt`            | `\gt`                                         | `KaTeX:\preccurlyeq`   | `\preccurlyeq`   | `KaTeX:\thicksim`         | `\thicksim`                          |
| `KaTeX:\Coloneq`          | `\Coloneq` or `\coloncolonminus`      | `KaTeX:\gtrapprox`     | `\gtrapprox`                                  | `KaTeX:\preceq`        | `\preceq`        | `KaTeX:\trianglelefteq`   | `\trianglelefteq`                    |
| `KaTeX:\coloneqq`         | `\coloneqq` or `\colonequals`         | `KaTeX:\gtreqless`     | `\gtreqless`                                  | `KaTeX:\precsim`       | `\precsim`       | `KaTeX:\triangleq`        | `\triangleq`                         |
| `KaTeX:\Coloneqq`         | `\Coloneqq` or `\coloncolonequals`    | `KaTeX:\gtreqqless`    | `\gtreqqless`                                 | `KaTeX:\propto`        | `\propto`        | `KaTeX:\trianglerighteq`  | `\trianglerighteq`                   |
| `KaTeX:\colonsim`         | `\colonsim`                                      | `KaTeX:\gtrless`       | `\gtrless`                                    | `KaTeX:\risingdotseq`  | `\risingdotseq`  | `KaTeX:\varpropto`        | `\varpropto`                         |
| `KaTeX:\Colonsim`         | `\Colonsim` or `\coloncolonsim`       | `KaTeX:\gtrsim`        | `\gtrsim`                                     | `KaTeX:\shortmid`      | `\shortmid`      | `KaTeX:\vartriangle`      | `\vartriangle`                       |
| `KaTeX:\cong`             | `\cong`                                          | `KaTeX:\imageof`       | `\imageof`                                    | `KaTeX:\shortparallel` | `\shortparallel` | `KaTeX:\vartriangleleft`  | `\vartriangleleft`                   |
| `KaTeX:\curlyeqprec`      | `\curlyeqprec`                                   | `KaTeX:\in`            | `\in` or `\isin`                   | `KaTeX:\sim`           | `\sim`           | `KaTeX:\vartriangleright` | `\vartriangleright`                  |
| `KaTeX:\curlyeqsucc`      | `\curlyeqsucc`                                   | `KaTeX:\Join`          | `\Join`                                       | `KaTeX:\simcolon`      | `\simcolon`      | `KaTeX:\vcentcolon`       | `\vcentcolon` or `\ratio` |
| `KaTeX:\dashv`            | `\dashv`                                         | `KaTeX:\le`            | `\le`                                         | `KaTeX:\simcoloncolon` | `\simcoloncolon` | `KaTeX:\vdash`            | `\vdash`                             |
| `KaTeX:\dblcolon`         | `\dblcolon` or `\coloncolon`          | `KaTeX:\leq`           | `\leq`                                        | `KaTeX:\simeq`         | `\simeq`         | `KaTeX:\vDash`            | `\vDash`                             |
| `KaTeX:\doteq`            | `\doteq`                                         | `KaTeX:\leqq`          | `\leqq`                                       | `KaTeX:\smallfrown`    | `\smallfrown`    | `KaTeX:\Vdash`            | `\Vdash`                             |
| `KaTeX:\Doteq`            | `\Doteq`                                         | `KaTeX:\leqslant`      | `\leqslant`                                   | `KaTeX:\smallsmile`    | `\smallsmile`    | `KaTeX:\Vvdash`           | `\Vvdash`                            |


### Negative relationship

| :-                 | :-                      | :-                      | :-                           | :-                        | :-                             | :-                     | :-                          |
| :----------------- | :---------------------- | :---------------------- | :--------------------------- | :------------------------ | :----------------------------- | :--------------------- | :-------------------------- |
| `KaTeX:\gnapprox`  | `\gnapprox`  | `KaTeX:\ngeqslant`      | `\ngeqslant`      | `KaTeX:\nsubseteq`        | `\nsubseteq`        | `KaTeX:\precneqq`      | `\precneqq`      |
| `KaTeX:\gneq`      | `\gneq`      | `KaTeX:\ngtr`           | `\ngtr`           | `KaTeX:\nsubseteqq`       | `\nsubseteqq`       | `KaTeX:\precnsim`      | `\precnsim`      |
| `KaTeX:\gneqq`     | `\gneqq`     | `KaTeX:\nleq`           | `\nleq`           | `KaTeX:\nsucc`            | `\nsucc`            | `KaTeX:\subsetneq`     | `\subsetneq`     |
| `KaTeX:\gnsim`     | `\gnsim`     | `KaTeX:\nleqq`          | `\nleqq`          | `KaTeX:\nsucceq`          | `\nsucceq`          | `KaTeX:\subsetneqq`    | `\subsetneqq`    |
| `KaTeX:\gvertneqq` | `\gvertneqq` | `KaTeX:\nleqslant`      | `\nleqslant`      | `KaTeX:\nsupseteq`        | `\nsupseteq`        | `KaTeX:\succnapprox`   | `\succnapprox`   |
| `KaTeX:\lnapprox`  | `\lnapprox`  | `KaTeX:\nless`          | `\nless`          | `KaTeX:\nsupseteqq`       | `\nsupseteqq`       | `KaTeX:\succneqq`      | `\succneqq`      |
| `KaTeX:\lneq`      | `\lneq`      | `KaTeX:\nmid`           | `\nmid`           | `KaTeX:\ntriangleleft`    | `\ntriangleleft`    | `KaTeX:\succnsim`      | `\succnsim`      |
| `KaTeX:\lneqq`     | `\lneqq`     | `KaTeX:\notin`          | `\notin`          | `KaTeX:\ntrianglelefteq`  | `\ntrianglelefteq`  | `KaTeX:\supsetneq`     | `\supsetneq`     |
| `KaTeX:\lnsim`     | `\lnsim`     | `KaTeX:\notni`          | `\notni`          | `KaTeX:\ntriangleright`   | `\ntriangleright`   | `KaTeX:\supsetneqq`    | `\supsetneqq`    |
| `KaTeX:\lvertneqq` | `\lvertneqq` | `KaTeX:\nparallel`      | `\nparallel`      | `KaTeX:\ntrianglerighteq` | `\ntrianglerighteq` | `KaTeX:\varsubsetneq`  | `\varsubsetneq`  |
| `KaTeX:\ncong`     | `\ncong`     | `KaTeX:\nprec`          | `\nprec`          | `KaTeX:\nvdash`           | `\nvdash`           | `KaTeX:\varsubsetneqq` | `\varsubsetneqq` |
| `KaTeX:\ne`        | `\ne`        | `KaTeX:\npreceq`        | `\npreceq`        | `KaTeX:\nvDash`           | `\nvDash`           | `KaTeX:\varsupsetneq`  | `\varsupsetneq`  |
| `KaTeX:\neq`       | `\neq`       | `KaTeX:\nshortmid`      | `\nshortmid`      | `KaTeX:\nVDash`           | `\nVDash`           | `KaTeX:\varsupsetneqq` | `\varsupsetneqq` |
| `KaTeX:\ngeq`      | `\ngeq`      | `KaTeX:\nshortparallel` | `\nshortparallel` | `KaTeX:\nVdash`           | `\nVdash`           |                        |                             |
| `KaTeX:\ngeqq`     | `\ngeqq`     | `KaTeX:\nsim`           | `\nsim`           | `KaTeX:\precnapprox`      | `\precnapprox`      |                        |                             |

`KaTeX:\not =` `\not =`

### Arrow

| :-                        | :-                             | :-                           | :-                                | :-                         | :-                              |
| :------------------------ | :----------------------------- | :--------------------------- | :-------------------------------- | :------------------------- | :------------------------------ |
| `KaTeX:\circlearrowleft`  | `\circlearrowleft`  | `KaTeX:\leftharpoonup`       | `\leftharpoonup`       | `KaTeX:\rArr`              | `\rArr`              |
| `KaTeX:\circlearrowright` | `\circlearrowright` | `KaTeX:\leftleftarrows`      | `\leftleftarrows`      | `KaTeX:\rarr`              | `\rarr`              |
| `KaTeX:\curvearrowleft`   | `\curvearrowleft`   | `KaTeX:\leftrightarrow`      | `\leftrightarrow`      | `KaTeX:\restriction`       | `\restriction`       |
| `KaTeX:\curvearrowright`  | `\curvearrowright`  | `KaTeX:\Leftrightarrow`      | `\Leftrightarrow`      | `KaTeX:\rightarrow`        | `\rightarrow`        |
| `KaTeX:\Darr`             | `\Darr`             | `KaTeX:\leftrightarrows`     | `\leftrightarrows`     | `KaTeX:\Rightarrow`        | `\Rightarrow`        |
| `KaTeX:\dArr`             | `\dArr`             | `KaTeX:\leftrightharpoons`   | `\leftrightharpoons`   | `KaTeX:\rightarrowtail`    | `\rightarrowtail`    |
| `KaTeX:\darr`             | `\darr`             | `KaTeX:\leftrightsquigarrow` | `\leftrightsquigarrow` | `KaTeX:\rightharpoondown`  | `\rightharpoondown`  |
| `KaTeX:\dashleftarrow`    | `\dashleftarrow`    | `KaTeX:\Lleftarrow`          | `\Lleftarrow`          | `KaTeX:\rightharpoonup`    | `\rightharpoonup`    |
| `KaTeX:\dashrightarrow`   | `\dashrightarrow`   | `KaTeX:\longleftarrow`       | `\longleftarrow`       | `KaTeX:\rightleftarrows`   | `\rightleftarrows`   |
| `KaTeX:\downarrow`        | `\downarrow`        | `KaTeX:\Longleftarrow`       | `\Longleftarrow`       | `KaTeX:\rightleftharpoons` | `\rightleftharpoons` |
| `KaTeX:\Downarrow`        | `\Downarrow`        | `KaTeX:\longleftrightarrow`  | `\longleftrightarrow`  | `KaTeX:\rightrightarrows`  | `\rightrightarrows`  |
| `KaTeX:\downdownarrows`   | `\downdownarrows`   | `KaTeX:\Longleftrightarrow`  | `\Longleftrightarrow`  | `KaTeX:\rightsquigarrow`   | `\rightsquigarrow`   |
| `KaTeX:\downharpoonleft`  | `\downharpoonleft`  | `KaTeX:\longmapsto`          | `\longmapsto`          | `KaTeX:\Rrightarrow`       | `\Rrightarrow`       |
| `KaTeX:\downharpoonright` | `\downharpoonright` | `KaTeX:\longrightarrow`      | `\longrightarrow`      | `KaTeX:\Rsh`               | `\Rsh`               |
| `KaTeX:\gets`             | `\gets`             | `KaTeX:\Longrightarrow`      | `\Longrightarrow`      | `KaTeX:\searrow`           | `\searrow`           |
| `KaTeX:\Harr`             | `\Harr`             | `KaTeX:\looparrowleft`       | `\looparrowleft`       | `KaTeX:\swarrow`           | `\swarrow`           |
| `KaTeX:\hArr`             | `\hArr`             | `KaTeX:\looparrowright`      | `\looparrowright`      | `KaTeX:\to`                | `\to`                |
| `KaTeX:\harr`             | `\harr`             | `KaTeX:\Lrarr`               | `\Lrarr`               | `KaTeX:\twoheadleftarrow`  | `\twoheadleftarrow`  |
| `KaTeX:\hookleftarrow`    | `\hookleftarrow`    | `KaTeX:\lrArr`               | `\lrArr`               | `KaTeX:\twoheadrightarrow` | `\twoheadrightarrow` |
| `KaTeX:\hookrightarrow`   | `\hookrightarrow`   | `KaTeX:\lrarr`               | `\lrarr`               | `KaTeX:\Uarr`              | `\Uarr`              |
| `KaTeX:\iff`              | `\iff`              | `KaTeX:\Lsh`                 | `\Lsh`                 | `KaTeX:\uArr`              | `\uArr`              |
| `KaTeX:\impliedby`        | `\impliedby`        | `KaTeX:\mapsto`              | `\mapsto`              | `KaTeX:\uarr`              | `\uarr`              |
| `KaTeX:\implies`          | `\implies`          | `KaTeX:\nearrow`             | `\nearrow`             | `KaTeX:\uparrow`           | `\uparrow`           |
| `KaTeX:\Larr`             | `\Larr`             | `KaTeX:\nleftarrow`          | `\nleftarrow`          | `KaTeX:\Uparrow`           | `\Uparrow`           |
| `KaTeX:\lArr`             | `\lArr`             | `KaTeX:\nLeftarrow`          | `\nLeftarrow`          | `KaTeX:\updownarrow`       | `\updownarrow`       |
| `KaTeX:\larr`             | `\larr`             | `KaTeX:\nleftrightarrow`     | `\nleftrightarrow`     | `KaTeX:\Updownarrow`       | `\Updownarrow`       |
| `KaTeX:\leadsto`          | `\leadsto`          | `KaTeX:\nLeftrightarrow`     | `\nLeftrightarrow`     | `KaTeX:\upharpoonleft`     | `\upharpoonleft`     |
| `KaTeX:\leftarrow`        | `\leftarrow`        | `KaTeX:\nrightarrow`         | `\nrightarrow`         | `KaTeX:\upharpoonright`    | `\upharpoonright`    |
| `KaTeX:\Leftarrow`        | `\Leftarrow`        | `KaTeX:\nRightarrow`         | `\nRightarrow`         | `KaTeX:\upuparrows`        | `\upuparrows`        |
| `KaTeX:\leftarrowtail`    | `\leftarrowtail`    | `KaTeX:\nwarrow`             | `\nwarrow`             |                            |                                 |
| `KaTeX:\leftharpoondown`  | `\leftharpoondown`  | `KaTeX:\Rarr`                | `\Rarr`                |                            |                                 |


### Extensible arrows

| :-                               | :-                                    | :-                                | :-                                     |
| :------------------------------- | :------------------------------------ | :-------------------------------- | :------------------------------------- |
| `KaTeX:\xleftarrow{abc}`         | `\xleftarrow{abc}`         | `KaTeX:\xrightarrow[under]{over}` | `\xrightarrow[under]{over}` |
| `KaTeX:\xLeftarrow{abc}`         | `\xLeftarrow{abc}`         | `KaTeX:\xRightarrow{abc}`         | `\xRightarrow{abc}`         |
| `KaTeX:\xleftrightarrow{abc}`    | `\xleftrightarrow{abc}`    | `KaTeX:\xLeftrightarrow{abc}`     | `\xLeftrightarrow{abc}`     |
| `KaTeX:\xhookleftarrow{abc}`     | `\xhookleftarrow{abc}`     | `KaTeX:\xhookrightarrow{abc}`     | `\xhookrightarrow{abc}`     |
| `KaTeX:\xtwoheadleftarrow{abc}`  | `\xtwoheadleftarrow{abc}`  | `KaTeX:\xtwoheadrightarrow{abc}`  | `\xtwoheadrightarrow{abc}`  |
| `KaTeX:\xleftharpoonup{abc}`     | `\xleftharpoonup{abc}`     | `KaTeX:\xrightharpoonup{abc}`     | `\xrightharpoonup{abc}`     |
| `KaTeX:\xleftharpoondown{abc}`   | `\xleftharpoondown{abc}`   | `KaTeX:\xrightharpoondown{abc}`   | `\xrightharpoondown{abc}`   |
| `KaTeX:\xleftrightharpoons{abc}` | `\xleftrightharpoons{abc}` | `KaTeX:\xrightleftharpoons{abc}`  | `\xrightleftharpoons{abc}`  |
| `KaTeX:\xtofrom{abc}`            | `\xtofrom{abc}`            | `KaTeX:\xmapsto{abc}`             | `\xmapsto{abc}`             |
| `KaTeX:\xlongequal{abc}`         | `\xlongequal{abc}`         |                                   |                                        |

## Symbols and Punctuation

### Symbols and Punctuation

| :-                                | :-                                        | :-                           | :-                                | :-                            | :-                                 |
| :-------------------------------- | :---------------------------------------- | :--------------------------- | :-------------------------------- | :---------------------------- | :--------------------------------- |
| `KaTeX:% comment`                 | `% comment`                    | `KaTeX:\dots`                | `\dots`                | `KaTeX:\KaTeX`                | `\KaTeX`                |
| `KaTeX:\%`                        | `\%`                           | `KaTeX:\cdots`               | `\cdots`               | `KaTeX:\LaTeX`                | `\LaTeX`                |
| `KaTeX:\#`                        | `\#`                           | `KaTeX:\ddots`               | `\ddots`               | `KaTeX:\TeX`                  | `\TeX`                  |
| `KaTeX:\&`                        | `\&`                           | `KaTeX:\ldots`               | `\ldots`               | `KaTeX:\nabla`                | `\nabla`                |
| `KaTeX:\_`                        | `\_`                           | `KaTeX:\vdots`               | `\vdots`               | `KaTeX:\infty`                | `\infty`                |
| `KaTeX:\text{\textunderscore}`    | `\text{\textunderscore}`       | `KaTeX:\dotsb`               | `\dotsb`               | `KaTeX:\infin`                | `\infin`                |
| `KaTeX:\text{--}`                 | `\text{--}`                    | `KaTeX:\dotsc`               | `\dotsc`               | `KaTeX:\checkmark`            | `\checkmark`            |
| `KaTeX:\text{\textendash}`        | `\text{\textendash}`           | `KaTeX:\dotsi`               | `\dotsi`               | `KaTeX:\dag`                  | `\dag`                  |
| `KaTeX:\text{---}`                | `\text{---}`                   | `KaTeX:\dotsm`               | `\dotsm`               | `KaTeX:\dagger`               | `\dagger`               |
| `KaTeX:\text{\textemdash}`        | `\text{\textemdash}`           | `KaTeX:\dotso`               | `\dotso`               | `KaTeX:\text{\textdagger}`    | `\text{\textdagger}`    |
| `KaTeX:\text{\textasciitilde}`    | `\text{\textasciitilde}`       | `KaTeX:\sdot`                | `\sdot`                | `KaTeX:\ddag`                 | `\ddag`                 |
| `KaTeX:\text{\textasciicircum}`   | `\text{\textasciicircum}`      | `KaTeX:\mathellipsis`        | `\mathellipsis`        | `KaTeX:\ddagger`              | `\ddagger`              |
| <code>KaTeX:\`</code>             | \`                             | `KaTeX:\text{\textellipsis}` | `\text{\textellipsis}` | `KaTeX:\text{\textdaggerdbl}` | `\text{\textdaggerdbl}` |
| `KaTeX:\text{\textquoteleft}`     | `text{\textquoteleft}`         | `KaTeX:\Box`                 | `\Box`                 | `KaTeX:\Dagger`               | `\Dagger`               |
| `KaTeX:\lq`                       | `\lq`                          | `KaTeX:\square`              | `\square`              | `KaTeX:\angle`                | `\angle`                |
| `KaTeX:\text{\textquoteright}`    | `\text{\textquoteright}`       | `KaTeX:\blacksquare`         | `\blacksquare`         | `KaTeX:\measuredangle`        | `\measuredangle`        |
| `KaTeX:\rq`                       | `\rq`                          | `KaTeX:\triangle`            | `\triangle`            | `KaTeX:\sphericalangle`       | `\sphericalangle`       |
| `KaTeX:\text{\textquotedblleft}`  | `\text{\textquotedblleft}`     | `KaTeX:\triangledown`        | `\triangledown`        | `KaTeX:\top`                  | `\top`                  |
| `KaTeX:"`                         | `"`                            | `KaTeX:\triangleleft`        | `\triangleleft`        | `KaTeX:\bot`                  | `\bot`                  |
| `KaTeX:\text{\textquotedblright}` | `\text{\textquotedblright}`    | `KaTeX:\triangleright`       | `\triangleright`       | `KaTeX:\$`                    | `\$`                    |
| `KaTeX:\colon`                    | `\colon`                       | `KaTeX:\bigtriangledown`     | `\bigtriangledown`     | `KaTeX:\text{\textdollar}`    | `\text{\textdollar}`    |
| `KaTeX:\backprime`                | `\backprime`                   | `KaTeX:\bigtriangleup`       | `\bigtriangleup`       | `KaTeX:\pounds`               | `\pounds`               |
| `KaTeX:\prime`                    | `\prime`                       | `KaTeX:\blacktriangle`       | `\blacktriangle`       | `KaTeX:\mathsterling`         | `\mathsterling`         |
| `KaTeX:\text{\textless}`          | `\text{\textless}`             | `KaTeX:\blacktriangledown`   | `\blacktriangledown`   | `KaTeX:\text{\textsterling}`  | `\text{\textsterling}`  |
| `KaTeX:\text{\textgreater}`       | `\text{\textgreater}`          | `KaTeX:\blacktriangleleft`   | `\blacktriangleleft`   | `KaTeX:\yen`                  | `\yen`                  |
| `KaTeX:\text{\textbar}`           | `\text{\textbar}`              | `KaTeX:\blacktriangleright`  | `\blacktriangleright`  | `KaTeX:\surd`                 | `\surd`                 |
| `KaTeX:\text{\textbardbl}`        | `\text{\textbardbl}`           | `KaTeX:\diamond`             | `\diamond`             | `KaTeX:\degree`               | `\degree`               |
| `KaTeX:\text{\textbraceleft}`     | `\text{\textbraceleft}`        | `KaTeX:\Diamond`             | `\Diamond`             | `KaTeX:\text{\textdegree}`    | `\text{\textdegree}`    |
| `KaTeX:\text{\textbraceright}`    | `\text{\textbraceright}`       | `KaTeX:\lozenge`             | `\lozenge`             | `KaTeX:\mho`                  | `\mho`                  |
| `KaTeX:\text{\textbackslash}`     | `\text{\textbackslash}`        | `KaTeX:\blacklozenge`        | `\blacklozenge`        | `KaTeX:\diagdown`             | `\diagdown`             |
| `KaTeX:\text{\P}`                 | `\text{\P}` or `\P` | `KaTeX:\star`                | `\star`                | `KaTeX:\diagup`               | `\diagup`               |
| `KaTeX:\text{\S}`                 | `\text{\S}` or `\S` | `KaTeX:\bigstar`             | `\bigstar`             | `KaTeX:\flat`                 | `\flat`                 |
| `KaTeX:\text{\sect}`              | `\text{\sect}`                 | `KaTeX:\clubsuit`            | `\clubsuit`            | `KaTeX:\natural`              | `\natural`              |
| `KaTeX:\copyright`                | `\copyright`                   | `KaTeX:\clubs`               | `\clubs`               | `KaTeX:\sharp`                | `\sharp`                |
| `KaTeX:\circledR`                 | `\circledR`                    | `KaTeX:\diamondsuit`         | `\diamondsuit`         | `KaTeX:\heartsuit`            | `\heartsuit`            |
| `KaTeX:\text{\textregistered}`    | `\text{\textregistered}`       | `KaTeX:\diamonds`            | `\diamonds`            | `KaTeX:\hearts`               | `\hearts`               |
| `KaTeX:\circledS`                 | `\circledS`                    | `KaTeX:\spadesuit`           | `\spadesuit`           | `KaTeX:\spades`               | `\spades`               |
| `KaTeX:\text{\textcircled a}`     | `\text{\textcircled a}`        | `KaTeX:\maltese`             | `\maltese`             | `KaTeX:\minuso`               | `\minuso`               |

## Environments

### Environments 1

<!--rehype:body-style=display: flex;flex-direction: row;justify-content: flex-start;-->

```KaTeX
\begin{matrix}
   a & b \\
   c & d
\end{matrix}
```

<!--rehype:style=flex:1;-->

```LaTeX
\begin{matrix}
   a & b \\
   c & d
\end{matrix}
```

<!--rehype:style=flex:1;-->

### Environments 2

<!--rehype:body-style=display: flex;flex-direction: row;justify-content: flex-start;-->

```KaTeX
\begin{array}{cc}
   a & b \\
   c & d
\end{array}
```

<!--rehype:style=flex:1;-->

```LaTeX
\begin{array}{cc}
   a & b \\
   c & d
\end{array}
```

### Environments 3

<!--rehype:body-style=display: flex;flex-direction: row;justify-content: flex-start;-->

```KaTeX
\begin{pmatrix}
   a & b \\
   c & d
\end{pmatrix}
```

<!--rehype:style=flex:1;-->

```LaTeX
\begin{pmatrix}
   a & b \\
   c & d
\end{pmatrix}
```

<!--rehype:style=flex:1;-->

### Environments 4

<!--rehype:body-style=display: flex;flex-direction: row;justify-content: flex-start;-->

```KaTeX
\begin{bmatrix}
   a & b \\
   c & d
\end{bmatrix}
```

```LaTeX
\begin{bmatrix}
   a & b \\
   c & d
\end{bmatrix}
```

### Environments 5

<!--rehype:body-style=display: flex;flex-direction: row;justify-content: flex-start;-->

```KaTeX
\begin{vmatrix}
   a & b \\
   c & d
\end{vmatrix}
```

<!--rehype:style=flex:1;-->

```LaTeX
\begin{vmatrix}
   a & b \\
   c & d
\end{vmatrix}
```

<!--rehype:style=flex:1;-->

### Environments 6

<!--rehype:body-style=display: flex;flex-direction: row;justify-content: flex-start;-->

```KaTeX
\begin{Vmatrix}
   a & b \\
   c & d
\end{Vmatrix}
```

<!--rehype:style=flex:1;-->

```LaTeX
\begin{Vmatrix}
   a & b \\
   c & d
\end{Vmatrix}
```

<!--rehype:style=flex:1;-->

### Environments 7

<!--rehype:body-style=display: flex;flex-direction: row;justify-content: flex-start;-->

```KaTeX
\begin{Bmatrix}
   a & b \\
   c & d
\end{Bmatrix}
```

```LaTeX
\begin{Bmatrix}
   a & b \\
   c & d
\end{Bmatrix}
```

### Environments 8

<!--rehype:body-style=display: flex;flex-direction: row;justify-content: flex-start;-->

```KaTeX
\def\arraystretch{1.5}
   \begin{array}{c:c:c}
   a & b & c \\ \hline
   d & e & f \\
   \hdashline
   g & h & i
\end{array}
```

<!--rehype:style=flex:1;-->

```LaTeX
\def\arraystretch{1.5}
   \begin{array}{c:c:c}
   a & b & c \\ \hline
   d & e & f \\
   \hdashline
   g & h & i
\end{array}
```

### Environments 9

<!--rehype:body-style=display: flex;flex-direction: row;justify-content: flex-start;-->

```KaTeX
x = \begin{cases}
   a &\text{if } b \\
   c &\text{if } d
\end{cases}
```

```LaTeX
x = \begin{cases}
   a &\text{if } b \\
   c &\text{if } d
\end{cases}
```

### Environments 10

<!--rehype:body-style=display: flex;flex-direction: row;justify-content: flex-start;-->

```KaTeX
\begin{rcases}
   a &\text{if } b \\
   c &\text{if } d
\end{rcases}⇒…
```

```LaTeX
\begin{rcases}
   a &\text{if } b \\
   c &\text{if } d
\end{rcases}⇒…
```

### Environments 11

<!--rehype:body-style=display: flex;flex-direction: row;justify-content: flex-start;-->

```KaTeX
\begin{smallmatrix}
   a & b \\
   c & d
\end{smallmatrix}
```

<!--rehype:style=flex:1;-->

```LaTeX
\begin{smallmatrix}
   a & b \\
   c & d
\end{smallmatrix}
```

### Environments 12

<!--rehype:body-style=display: flex;flex-direction: row;justify-content: flex-start;-->

```KaTeX
\sum_{
\begin{subarray}{l}
   i\in\Lambda\\
   0<j<n
\end{subarray}}
```

<!--rehype:style=flex:1;-->

```LaTeX
\sum_{
\begin{subarray}{l}
   i\in\Lambda\\
   0<j<n
\end{subarray}}
```

### Environments 13

<!--rehype:body-style=display: flex;flex-direction: row;justify-content: flex-start;-->

```KaTeX
\begin{equation}
\begin{split}  a &=b+c\\
      &=e+f
\end{split}
\end{equation}
```

<!--rehype:style=flex:1;-->

```LaTeX
\begin{equation}
\begin{split}  a &=b+c\\
      &=e+f
\end{split}
\end{equation}
```

### Environments 14

<!--rehype:body-style=display: flex;flex-direction: row;justify-content: flex-start;-->

```KaTeX
\begin{align}
   a&=b+c \\
   d+e&=f
\end{align}
```

<!--rehype:style=flex:1;-->

```LaTeX
\begin{align}
   a&=b+c \\
   d+e&=f
\end{align}
```

### Environments 15

<!--rehype:body-style=display: flex;flex-direction: row;justify-content: flex-start;-->

```KaTeX
\begin{gather}
   a=b \\
   e=b+c
\end{gather}
```

<!--rehype:style=flex:1;-->

```LaTeX
\begin{gather}
   a=b \\
   e=b+c
\end{gather}
```

### Environments 16

<!--rehype:body-style=display: flex;flex-direction: row;justify-content: flex-start;-->

```KaTeX
\begin{alignat}{2}
   10&x+&3&y=2\\
   3&x+&13&y=4
\end{alignat}
```

<!--rehype:style=flex:1;-->

```LaTeX
\begin{alignat}{2}
   10&x+&3&y=2\\
   3&x+&13&y=4
\end{alignat}
```

### Environments 17

<!--rehype:body-style=display: flex;flex-direction: row;justify-content: flex-start;-->

```KaTeX
\begin{CD}
   A @>a>> B \\
@VbVV @AAcA \\
   C @= D
\end{CD}
```

<!--rehype:style=flex:1;-->

```LaTeX
\begin{CD}
   A @>a>> B \\
@VbVV @AAcA \\
   C @= D
\end{CD}
```

## Lists

### Unordered List

<!--rehype:style=flex:1;-->

```LaTeX
\begin{itemize}
   \item item1
   \item item2
   \item item3
\end{itemize}
```

### Ordered List

<!--rehype:style=flex:1;-->

```LaTeX
\begin{enumerate}
   \item item1
   \item item2
   \item item3
\begin{enumerate}
```

## Style, Color, Size and Font

### Color

| :-                                    | :-                                         |
| :------------------------------------ | :----------------------------------------- |
| `KaTeX:\color{blue} F=ma`             | `\color{blue} F=ma`             |
| `KaTeX:\textcolor{blue}{F=ma}`        | `\textcolor{blue}{F=ma}`        |
| `KaTeX:\textcolor{#228B22}{F=ma}`     | `\textcolor{#228B22}{F=ma}`     |
| `KaTeX:\colorbox{aqua}{$F=ma$}`       | `\colorbox{aqua}{$F=ma$}`       |
| `KaTeX:\fcolorbox{red}{aqua}{$F=ma$}` | `\fcolorbox{red}{aqua}{$F=ma$}` |

### Font

| :-                | :-                     | :-                     | :-                          | :-                       | :-                          |
| :---------------- | :--------------------- | :--------------------- | :-------------------------- | :----------------------- | :-------------------------- |
| `KaTeX:\Huge AB`  | `\Huge AB`  | `KaTeX:\normalsize AB` | `\normalsize AB` | `KaTeX:\normalsize AB`   | \normalsize AB   |
| `KaTeX:\huge AB`  | `\huge AB`  | `KaTeX:\huge AB`       | `\huge AB`       | `KaTeX:\small AB`        | \small AB        |
| `KaTeX:\LARGE AB` | `\LARGE AB` | `KaTeX:\LARGE AB`      | `\LARGE AB`      | `KaTeX:\footnotesize AB` | \footnotesize AB |
| `KaTeX:\Large AB` | `\Large AB` | `KaTeX:\Large AB`      | `\Large AB`      | `KaTeX:\scriptsize AB`   | \scriptsize AB   |
| `KaTeX:\large AB` | `\large AB` | `KaTeX:\large AB`      | `\large AB`      | `KaTeX:\tiny AB`         | \tiny AB         |

### Style

| :-                                | :-                                    | :-                             | :-                                 |
| :-------------------------------- | :------------------------------------ | :----------------------------- | :--------------------------------- |
| `KaTeX:\displaystyle\sum_{i=1}^n` | \displaystyle\sum\_{i=1}^n | `KaTeX:\textstyle\sum_{i=1}^n` | \textstyle\sum\_{i=1}^n |
| `KaTeX:\scriptstyle x`            | \scriptstyle x             | `KaTeX:\scriptscriptstyle x`   | \scriptscriptstyle x    |
| `KaTeX:\lim\limits_x`             | \lim\limits_x              | `KaTeX:\lim\nolimits_x`        | \lim\nolimits_x         |
| `KaTeX:\verb!x^2!`                | \verb!x^2!                 |

## Also See

- [LaTeX official website](https://www.latex-project.org/) _(latex-project.org)_
- [KaTeX official website](https://katex.org/) _(katex.org)_
- [symbols.pdf](https://www.cmor-faculty.rice.edu/~heinken/latex/symbols.pdf) _(cmor-faculty.rice.edu)_
