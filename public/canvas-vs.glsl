#version 300 es
precision highp int;
precision highp float;

in vec2 a_vert_data;

void main() {
   gl_Position = vec4(a_vert_data, 0.0, 1.0);
}
