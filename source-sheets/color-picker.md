---
title: Color Picker
intro: The Color Picker  cheat sheet provides you basic color info and  choices
tags:
  - html
  - color
---

## Getting Started 


### Color Basics


| **Category**                     | **Description**                                                                                                                                                                                                                                                                                |
|:---------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Color Models**                 | **RGB**: Red, Green, Blue – additive model used in screens.   
 **HEX**: Hexadecimal color codes, e.g., #FFFFFF.   
 **HSL**: Hue, Saturation, Lightness – intuitive for color adjustments.   
 **HSV**: Hue, Saturation, Value – similar to HSL but with different brightness handling.    |
| **Color Terminology**            | **Saturation**: Intensity or purity of a color.   
 **Hue**: The color type (e.g., red, blue).   
 **Lightness**: Brightness or darkness of a color.   
 **Opacity**: Transparency level of a color, often defined as alpha in RGBA.                                                        |
| **Color Representation Formats** | **HEX**: `#RRGGBB` or `#RRGGBBAA` (with alpha).   
 **RGB**: `rgb(255, 255, 255)`   
 **RGBA**: `rgba(255, 255, 255, 0.5)`   
 **HSL**: `hsl(120, 100%, 50%)`   
 **HSLA**: `hsla(120, 100%, 50%, 0.5)`                                                                                    |



### Main Frameworks

| **Framework**    | **Color Notation / Syntax**                                                                                                                                                     | **Description**                                             | **Documentation Link**                                                                     |
|:-----------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------|:-------------------------------------------------------------------------------------------|
| **CSS**          | `color: red;`   
 `color: #ff0000;`   
 `color: rgb(255, 0, 0);`   
 `color: rgba(255, 0, 0, 0.5);`   
 `color: hsl(0, 100%, 50%);`   
 `color: hsla(0, 100%, 50%, 0.5);`  | Standard CSS color properties and formats.                  | [CSS Color Documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/color)          |
| **SASS/SCSS**    | `$color: #ff0000;`   
 `color: $color;`                                                                                                                                        | Variables for colors, can use same formats as CSS.          | [SASS Color Documentation](https://sass-lang.com/documentation/values/colors)              |
| **Tailwind CSS** | `class="bg-red-500"`   
 `class="text-green-300"`                                                                                                                              | Utility classes with predefined color shades.               | [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)                     |
| **Bootstrap**    | `class="text-primary"`   
 `class="bg-success"`                                                                                                                                | Named color classes for quick styling.                      | [Bootstrap Colors](https://getbootstrap.com/docs/5.0/getting-started/introduction/#colors) |
| **Material UI**  | `style={{ color: 'primary' }}` or theme palette                                                                                                                                 | Uses theme palette, can override with specific color codes. | [Material UI Color](https://mui.com/customization/color/)                                  |


## Color Palette

### Tailwind Palette



## Gradient CSS 

### Gradient Maker



| Parameter     | Description                       | Example                                        |
|:--------------|:----------------------------------|:-----------------------------------------------|
| **to right**  | Gradient goes from left to right  | `linear-gradient(to right, #ff7e5f, #feb47b)`  |
| **to left**   | Gradient goes from right to left  | `linear-gradient(to left, #ff7e5f, #feb47b)`   |
| **to bottom** | Gradient goes from top to bottom  | `linear-gradient(to bottom, #ff7e5f, #feb47b)` |
| **to top**    | Gradient goes from bottom to top  | `linear-gradient(to top, #ff7e5f, #feb47b)`    |
| **deg**       | Specify an angle in degrees       | `linear-gradient(45deg, ...)`                  |

