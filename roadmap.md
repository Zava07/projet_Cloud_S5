# dossier a creer:
  New-Item -ItemType Directory -Path "D:\\Etude\\S5\\Mr_Rojo\\Projet\\projet_Cloud_S5\\data\\database" -Force
  New-Item -ItemType Directory -Path "D:\\Etude\\S5\\Mr_Rojo\\Projet\\projet_Cloud_S5\\data\\tiles" -Force
  New-Item -ItemType Directory -Path "D:\\Etude\\S5\\Mr_Rojo\\Projet\\projet_Cloud_S5\\data\\style" -Force

# fichier a placer dans data : antananarivo.osm.pbf
   
# renommer le nom du fichier :
 - Move-Item "D:\\Etude\\S5\\Mr_Rojo\\Projet\\projet_Cloud_S5\\data\\Antananarivo.osm.pbf" `
  "D:\\Etude\\S5\\Mr_Rojo\\Projet\\projet_Cloud_S5\\data\\region.osm.pbf" -Force

# installer le image officielle dans docker:
  docker pull overv/openstreetmap-tile-server

# importer les donner dans docker
- docker run --rm -e THREADS=4 -v "D:\\Etude\\S5\\Mr_Rojo\\Projet\\projet_Cloud_S5\\data:/data" --entrypoint /run.sh overv/openstreetmap-tile-server import

# lancer le server
- docker run -v "D:\\Etude\\S5\\Mr_Rojo\\Projet\\projet_Cloud_S5\\data:/data" -p 8080:80 overv/openstreetmap-tile-server run