#!/bin/bash
set -e

if [ ! -f index.html ]; then
  echo "Erro: index.html não encontrado."
  exit 1
fi

if [ -d css ] || [ -d js ]; then
  echo "Erro: já existe pasta css/ ou js/. Abortando para não sobrescrever."
  exit 1
fi

echo "Criando diretórios..."
mkdir -p css js

echo "Extraindo CSS..."
awk '/<style>/{flag=1;next}/<\/style>/{flag=0}flag' index.html > css/app.css

echo "Extraindo JS..."
awk '/<script>/{flag=1;next}/<\/script>/{flag=0}flag' index.html > js/app.js

echo ""
echo "Arquivos gerados:"
echo "  css/app.css ($(wc -l < css/app.css) linhas)"
echo "  js/app.js  ($(wc -l < js/app.js) linhas)"
echo ""
echo "Agora substitua index.html pelo shell novo."