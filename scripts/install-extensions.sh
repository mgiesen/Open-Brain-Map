#!/bin/bash

echo
echo "Folgende Erweiterungen sind bereits installiert:"
echo

# Aufzählung der bereits installierten Erweiterungen
extensions=($(code --list-extensions))

for extension in "${extensions[@]}"
do
  echo "- $extension"
done
echo
echo "Moechtest du folgende Erweiterungen installieren?"
echo

# Liste der gewünschten Erweiterungen
extensions=(
  "SimonSiefke.svg-preview" 
  "ritwickdey.LiveServer" 
  "shd101wyy.markdown-preview-enhanced"
  "rangav.vscode-thunder-client"
  "PKief.material-icon-theme"
  "hediet.vscode-drawio"
  "esbenp.prettier-vscode"
  "bierner.markdown-mermaid"
  "EditorConfig.EditorConfig"
)

for extension in "${extensions[@]}"
do
  echo "- $extension"
done

echo
echo "Fortfahren mit 'Enter'"
read -r

echo

# Erweiterungen installieren
for extension in "${extensions[@]}"
do
  echo "Installiere Erweiterung: $extension"
  code --install-extension "$extension"
  if [ $? -ne 0 ]; then
    echo "Fehler beim Installieren der Erweiterung: $extension"
  else
    echo "Erweiterung erfolgreich installiert: $extension"
  fi
done

echo
echo "Die Installation ist abgeschlossen"

