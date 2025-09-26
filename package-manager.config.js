// This file is used to explicitly specify the package manager for deployment
// This project should be built with npm, not yarn or bun

module.exports = {
  packageManager: 'npm',
  buildCommand: 'npm run build',
  installCommand: 'npm install'
};