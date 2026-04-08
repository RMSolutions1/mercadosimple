/**
 * Entrada serverless de Vercel: usa el bundle compilado por Nest (`nest build`).
 * No renombrar sin actualizar vercel.json → includeFiles dist/**
 */
require('reflect-metadata');

const { default: handler } = require('../dist/serverless.js');

module.exports = handler;
