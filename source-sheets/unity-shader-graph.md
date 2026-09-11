---
title: Unity Shader Graph
intro: This is a visual cheat-sheet for the Unity Shader Graph. This tool is used to create custom shaders material in Unity, a popular game engine.
tags:
  - unity
  - shader
  - computer graphics
  - visual effects
---

## Shader Graph Nodes

<code>We are using **SAIT** to indicate the output type is "same as the input type".</code> {.col-span-2}

## 1. Attributes

### Positioning

**Position** - provides vertex position

- **Inputs**

  - | -   | -         |
    | --- | --------- |
    | /   | No inputs |


- **Outputs**

  - | -         | -                        |
    | --------- | ------------------------ |
    | `Vector3` | Provides vertex position |



**Normal** - supplies surface normal direction

- **Inputs**

  - | -   | -         |
    | --- | --------- |
    | /   | No inputs |


- **Outputs**

  - | -         | -                       |
    | --------- | ----------------------- |
    | `Vector3` | Provides surface normal |



**World Position** - returns the object's world space position

- **Inputs**

  - | -   | -         |
    | --- | --------- |
    | /   | No inputs |


- **Outputs**

  - | -         | -                    |
    | --------- | -------------------- |
    | `Vector3` | World space position |



**Object Position** - returns the object's local space position

- **Inputs**

  - | -   | -         |
    | --- | --------- |
    | /   | No inputs |


- **Outputs**

  - | -         | -                    |
    | --------- | -------------------- |
    | `Vector3` | Local space position |



**Screen Position** - returns the object's screen space position

- **Inputs**

  - | -   | -         |
    | --- | --------- |
    | /   | No inputs |


- **Outputs**

  - | -         | -                     |
    | --------- | --------------------- |
    | `Vector4` | Screen space position |



**Camera Position** - returns the camera's world space position

- **Inputs**

  - | -   | -         |
    | --- | --------- |
    | /   | No inputs |


- **Outputs**

  - | -         | -                           |
    | --------- | --------------------------- |
    | `Vector3` | Camera world space position |



### Timing

**Time** - outputs various time-related values

- **Inputs**

  - | -   | -         |
    | --- | --------- |
    | /   | No inputs |


- **Outputs**

  - | -       | -                                                                         |
    | ------- | ------------------------------------------------------------------------- |
    | `Float` | Time (T) - The total elapsed time since the start of the shader           |
    | `Float` | Sin Time (T/8π) - A sine wave based on time                               |
    | `Float` | Cos Time (T/8π) - A cosine wave based on time                             |
    | `Float` | Delta Time - Time passed between the previous frame and the current frame |



## 2. Math Operations

### Basic Math

**Add** - adds two values

- **Inputs**

  - | -                     | -            |
    | --------------------- | ------------ |
    | `Float`   
 `Vector` | First value  |
    | `Float`   
 `Vector` | Second value |


- **Outputs**

  - | -    | -                     |
    | ---- | --------------------- |
    | SAIT | Sum of the two inputs |



**Subtract** - subtracts one value from another

- **Inputs**

  - | -                     | -          |
    | --------------------- | ---------- |
    | `Float`   
 `Vector` | Minuend    |
    | `Float`   
 `Vector` | Subtrahend |


- **Outputs**

  - | -    | -                            |
    | ---- | ---------------------------- |
    | SAIT | Difference of the two inputs |



**Multiply** - multiplies two values

- **Inputs**

  - | -                                   | -            |
    | ----------------------------------- | ------------ |
    | `Float`   
 `Vector`   
 `Matrix` | First value  |
    | `Float`   
 `Vector`   
 `Matrix` | Second value |


- **Outputs**

  - | -    | -                             |
    | ---- | ----------------------------- |
    | SAIT | The product of the two inputs |



### Advanced Math

**Power** - raises input to a power

- **Inputs**

  - | -       | -        |
    | ------- | -------- |
    | `Float` | Base     |
    | `Float` | Exponent |


- **Outputs**

  - | -       | -                                                  |
    | ------- | -------------------------------------------------- |
    | `Float` | Result of base raised to the power of the exponent |



**Sqrt** - square root of input

- **Inputs**

  - | -       | -           |
    | ------- | ----------- |
    | `Float` | Input value |


- **Outputs**

  - | -       | -                        |
    | ------- | ------------------------ |
    | `Float` | Square root of the input |



**Abs** - outputs absolute value

- **Inputs**

  - | -                     | -           |
    | --------------------- | ----------- |
    | `Float`   
 `Vector` | Input value |


- **Outputs**

  - | -    | -                           |
    | ---- | --------------------------- |
    | SAIT | Absolute value of the input |



**Dot Product** - calculates dot product between two vectors

- **Inputs**

  - | -                        | -             |
    | ------------------------ | ------------- |
    | `Vector3`   
 `Vector4` | First vector  |
    | `Vector3`   
 `Vector4` | Second vector |


- **Outputs**

  - | -       | -                  |
    | ------- | ------------------ |
    | `Float` | Dot product result |



**Cross Product** - calculates cross product between two vectors

- **Inputs**

  - | -         | -             |
    | --------- | ------------- |
    | `Vector3` | First vector  |
    | `Vector3` | Second vector |


- **Outputs**

  - | -         | -                    |
    | --------- | -------------------- |
    | `Vector3` | Cross product result |



### Trigonometry

**Sin** - outputs sine of input

- **Inputs**

  - | -       | -                |
    | ------- | ---------------- |
    | `Float` | Input in radians |


- **Outputs**

  - | -       | -                 |
    | ------- | ----------------- |
    | `Float` | Sine of the input |



**Cos** - outputs cosine of input

- **Inputs**

  - | -       | -                |
    | ------- | ---------------- |
    | `Float` | Input in radians |


- **Outputs**

  - | -       | -                   |
    | ------- | ------------------- |
    | `Float` | Cosine of the input |



### Interpolation

**Lerp** - linear interpolation between two values

- **Inputs**

  - | -                     | -                        |
    | --------------------- | ------------------------ |
    | `Float`   
 `Vector` | Start value              |
    | `Float`   
 `Vector` | End value                |
    | `Float`   
 `Vector` | Interpolation factor (T) |


- **Outputs**

  - | -    | -                   |
    | ---- | ------------------- |
    | SAIT | Interpolated result |



**Step** - creates a step between two thresholds

- **Inputs**

  - | -                     | -         |
    | --------------------- | --------- |
    | `Float`   
 `Vector` | Threshold |
    | `Float`   
 `Vector` | Input     |


- **Outputs**

  - | -    | -           |
    | ---- | ----------- |
    | SAIT | Step result |



## 3. Color Processing

### Basic Color Manipulation

**Color** - provides a constant color value

- **Inputs**

  - | -   | -         |
    | --- | --------- |
    | /   | No inputs |


- **Outputs**

  - | -         | -                |
    | --------- | ---------------- |
    | `Vector4` | RGBA color value |



**Add Color** - adds two color values

- **Inputs**

  - | -         | -            |
    | --------- | ------------ |
    | `Vector4` | First color  |
    | `Vector4` | Second color |


- **Outputs**

  - | -         | -                     |
    | --------- | --------------------- |
    | `Vector4` | Sum of the two colors |



**Multiply Color** - multiplies two color values

- **Inputs**

  - | -         | -            |
    | --------- | ------------ |
    | `Vector4` | First color  |
    | `Vector4` | Second color |


- **Outputs**

  - | -         | -                         |
    | --------- | ------------------------- |
    | `Vector4` | Product of the two colors |



**Lerp Color** - interpolates between two colors

- **Inputs**

  - | -         | -                        |
    | --------- | ------------------------ |
    | `Vector4` | Start color              |
    | `Vector4` | End color                |
    | `Float`   | Interpolation factor (T) |


- **Outputs**

  - | -         | -                  |
    | --------- | ------------------ |
    | `Vector4` | Interpolated color |



### Color Adjustment

**Saturation** - adjusts the saturation of input color

- **Inputs**

  - | -         | -                 |
    | --------- | ----------------- |
    | `Vector4` | Input color       |
    | `Float`   | Saturation factor |


- **Outputs**

  - | -         | -              |
    | --------- | -------------- |
    | `Vector4` | Adjusted color |



**Contrast** - adjusts contrast of input color

- **Inputs**

  - | -         | -               |
    | --------- | --------------- |
    | `Vector4` | Input color     |
    | `Float`   | Contrast factor |


- **Outputs**

  - | -         | -              |
    | --------- | -------------- |
    | `Vector4` | Adjusted color |



**Hue** - shifts the hue of the input color

- **Inputs**

  - | -         | -                |
    | --------- | ---------------- |
    | `Vector4` | Input color      |
    | `Float`   | Hue shift amount |


- **Outputs**

  - | -         | -                      |
    | --------- | ---------------------- |
    | `Vector4` | Color with shifted hue |



**Invert Colors** - inverts the input color

- **Inputs**

  - | -         | -           |
    | --------- | ----------- |
    | `Vector4` | Input color |


- **Outputs**

  - | -         | -              |
    | --------- | -------------- |
    | `Vector4` | Inverted color |



**Replace Color** - replaces a specific color in the input with a new color

- **Inputs**

  - | -         | -                 |
    | --------- | ----------------- |
    | `Vector4` | Input color       |
    | `Vector4` | Target color      |
    | `Vector4` | Replacement color |


- **Outputs**

  - | -         | -                          |
    | --------- | -------------------------- |
    | `Vector4` | Color with replaced values |



**White Balance** - adjusts the white balance of input color

- **Inputs**

  - | -         | -                 |
    | --------- | ----------------- |
    | `Vector4` | Input color       |
    | `Float`   | Temperature value |
    | `Float`   | Tint value        |


- **Outputs**

  - | -         | -              |
    | --------- | -------------- |
    | `Vector4` | Adjusted color |



### Channel Operations

**Channel Mixer** - modifies color channels independently

- **Inputs**

  - | -         | -                        |
    | --------- | ------------------------ |
    | `Vector4` | Input color              |
    | `Float`   | Red channel multiplier   |
    | `Float`   | Green channel multiplier |
    | `Float`   | Blue channel multiplier  |


- **Outputs**

  - | -         | -              |
    | --------- | -------------- |
    | `Vector4` | Modified color |



## 4. Texture Processing

### Sampling

**Sample Texture** - retrieves color data from texture

- **Inputs**

  - | -                   | -              |
    | ------------------- | -------------- |
    | `Texture (sampler)` | Texture input  |
    | `Vector2`           | UV coordinates |


- **Outputs**

  - | -         | -                           |
    | --------- | --------------------------- |
    | `Vector4` | Color data from the texture |



**UV** - provides UV coordinates for texture mapping

- **Inputs**

  - | -   | -         |
    | --- | --------- |
    | /   | No inputs |


- **Outputs**

  - | -         | -              |
    | --------- | -------------- |
    | `Vector2` | UV coordinates |



### Manipulation

**Tiling Offset** - adjusts tiling and offset of texture

- **Inputs**

  - | -         | -             |
    | --------- | ------------- |
    | `Vector2` | Tiling values |
    | `Vector2` | Offset values |


- **Outputs**

  - | -         | -                       |
    | --------- | ----------------------- |
    | `Vector2` | Modified UV coordinates |



**Distortion** - warps the surface of the object

- **Inputs**

  - | -         | -                   |
    | --------- | ------------------- |
    | `Float`   | Distortion strength |
    | `Vector2` | UV coordinates      |


- **Outputs**

  - | -         | -                     |
    | --------- | --------------------- |
    | `Vector2` | Warped UV coordinates |



**Parallax** - simulates depth using parallax mapping

- **Inputs**

  - | -                 | -              |
    | ----------------- | -------------- |
    | Texture (sampler) | Input texture  |
    | `Vector2`         | UV coordinates |
    | `Float`           | Depth value    |


- **Outputs**

  - | -         | -                       |
    | --------- | ----------------------- |
    | `Vector2` | Adjusted UV coordinates |



## 5. Effects

### Visual Effects

**Fresnel Effect** - creates a glow effect on object edges

- **Inputs**

  - | -         | -                   |
    | --------- | ------------------- |
    | `Vector3` | View direction      |
    | `Float`   | Power of the effect |


- **Outputs**

  - | -       | -                    |
    | ------- | -------------------- |
    | `Float` | Fresnel effect value |



**Dissolve** - generates a dissolve transition effect

- **Inputs**

  - | -                   | -                  |
    | ------------------- | ------------------ |
    | `Texture (sampler)` | Input texture      |
    | `Float`             | Dissolve threshold |


- **Outputs**

  - | -         | -                      |
    | --------- | ---------------------- |
    | `Vector4` | Dissolve effect output |



### Reflection

**Reflection** - reflects based on surface normal direction

- **Inputs**

  - | -         | -                  |
    | --------- | ------------------ |
    | `Vector3` | Incident direction |
    | `Vector3` | Surface normal     |


- **Outputs**

  - | -         | -                   |
    | --------- | ------------------- |
    | `Vector3` | Reflected direction |



## Custom Function Node

### Steps to Create a Custom Function Node

- **Step 1: Add Custom Function Node in Shader Graph**

  - Right-click in Shader Graph and choose **"Create Node"** > **"Custom Function"**.
  - Choose between **"String"** (for inline HLSL code) or **"File"** (for an external HLSL file).

- **Step 2: Configure the Node in Shader Graph**

  - Set the name of the node.
  - If using **"File"**, ensure the external HLSL file name exactly matches the function name defined in the HLSL file.
    This ensures the function is correctly referenced in the Shader Graph pipeline.

    **Example**: If the file is named `CustomFunction.hlsl`, the function inside it should also be named
    `CustomFunction`.

- **Step 3: Add Inputs/Outputs in Shader Graph**

  - Define the required `Inputs` and `Outputs` for the custom function in Shader Graph. These will automatically
    generate ports for you to connect other nodes.

    **Example**:

    - **Inputs**: `Float` (time), `Vector3` (position)
    - **Outputs**: `Vector3` (new position)

    In the custom HLSL code, the `in` and `out` parameters correspond to these inputs and outputs:

    - `in` represents the data coming into the function (e.g., `time`, `position`).
    - `out` defines the return value (e.g., modified `position`).

- **Step 4: Write HLSL Code**

  - If using the **"String"** option:

    - Directly write the HLSL code inside the custom function node editor in Shader Graph.
    - Ensure that the `in` and `out` parameters match the inputs and outputs you defined in Shader Graph.

    - **Example of inline code** (using **"String"** mode):

```cpp
      float3 CustomPosition(in float time, in float3 position, out float3 newPosition) {
        newPosition = position + float3(sin(time), cos(time), 0.0);
        return newPosition;
      }
      ```

  - If using the **"File"** option:

    - Write the HLSL code in an external `.hlsl` file and reference the file in Shader Graph.

    - **Example of an external HLSL file** (using **"File"** mode):

      1. **1. Create an HLSL file** named `CustomPosition.hlsl`.

      2. **2. Write the custom function** inside the file. The `in` and `out` parameters should match the Shader Graph
         inputs and outputs.

```cpp
      float3 CustomPosition(in float time, in float3 position, out float3 newPosition) {
        newPosition = position + float3(sin(time), cos(time), 0.0);
        return newPosition;
      }
      ```

      3. **3. Save the file** in your project directory, for example, `Assets/Shaders/CustomPosition.hlsl`.

      4. **4. Link the file** in Shader Graph:

      - In the Custom Function Node, switch to **"File"** mode and reference `CustomPosition.hlsl`.

- **Step 5: Use the Node in Shader Graph**

  - Connect the custom function node’s input ports to other nodes, such as `Time` and `Position`, to feed data into the
    custom function.
  - Connect the output port to apply the function result in the Shader Graph pipeline.

  - **Example Pipeline**:

    - **Inputs**: `Time` (as a float) and `Position` (as a vector)
    - **Outputs**: `Modified Position` (vector with new position)

    This would make the custom node update an object's position based on time in the shader.


## Also see

- [Unity Shader Graph documentation](https://docs.unity3d.com/Manual/shader-graph-overview.html) _(docs.unity3d.com)_
- [Tianle Yuan's Unity Visual Effect notes](https://yuantianle.github.io/11_Game_Development/Unity/) _(yuantianle.com)_
