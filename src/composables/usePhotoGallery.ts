// Utilise Capacitor pour accéder aux fonctionnalités natives (caméra, stockage)
import { ref, watch, onMounted } from 'vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import type { Photo } from '@capacitor/camera'; // Pour prendre des photos
import { Filesystem, Directory } from '@capacitor/filesystem'; // Pour sauvegarder les images localement
import  { Preferences } from '@capacitor/preferences'; // Pour stocker les métadonnées des photos

export interface UserPhoto {
  filepath: string; // Chemin du fichier dans le Filesystem
  webviewPath?: string; // URL base64 pour afficher l'image
}


// Déclaration du composable de galerie photo
export const usePhotoGallery = () => {
   // Référence réactive contenant le tableau de photos
  const photos = ref<UserPhoto[]>([]);

  // Clé de stockage pour les préférences
  const PHOTO_STORAGE = 'photos';

 // Fonction pour prendre une nouvelle photo et l'ajouter à la galerie
  const addNewToGallery = async () => {
     // Utilisation de l'API Camera de Capacitor pour capturer une photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri, // Retourne une URI de l'image
      source: CameraSource.Camera, // Utilise la caméra arrière
      quality: 100
    });
    // Génération d'un nom de fichier unique basé sur le timestamp
    const fileName = new Date().getTime() + '.jpeg';

    // Sauvegarde de la photo capturée dans le système de fichiers
    const savedImageFile = await savePicture(capturedPhoto, fileName);

    // Ajout de la nouvelle photo au début du tableau réactif
    photos.value = [savedImageFile, ...photos.value];
  };

  // Fonction pour sauvegarder une photo dans le système de fichiers
  const savePicture = async (photo: Photo, fileName: string): Promise<UserPhoto> => {
    // Récupération de l'image depuis l'URI web
    const response = await fetch(photo.webPath!); //ex: "blob:http://localhost:8100/abc123..."
    // Conversion de la réponse en blob
    const blob = await response.blob();
    const base64Data = await convertBlobToBase64(blob) as string; //"data:image/jpeg;base64,/9j/4AAQSkZJRg..."

    // Écriture du fichier dans le système de fichiers local
    await Filesystem.writeFile({
      path: fileName, //ex"1627891234567.jpeg"
      data: base64Data,
      directory: Directory.Data //Ce répertoire est spécifique à votre application et persiste : les données ne sont pas supprimées lors de la désinstallation
    });
    // Retourne l'objet UserPhoto avec les informations de la photo
    return {
      filepath: fileName, // ex: "1627891234567.jpeg"
      webviewPath: photo.webPath //ex: "blob:http://localhost:8100/abc123..."
    };
  };

  // Convertir un blob en base64
  const convertBlobToBase64 = (blob: Blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  // Sauvegarder l'array de photos dans Preferences
  const cachePhotos = () => {
    Preferences.set({
      key: PHOTO_STORAGE,
      value: JSON.stringify(photos.value)
    });
  };

  // Charger les photos sauvegardées
  const loadSaved = async () => {
    const photoList = await Preferences.get({ key: PHOTO_STORAGE });
    const photosInPreferences: UserPhoto[] = photoList.value ? JSON.parse(photoList.value) : [];

    for (const photo of photosInPreferences) {
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data 
      });
      photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
    }

    photos.value = photosInPreferences;
  };

  // Charger les photos au démarrage et sauvegarder à chaque modification
  onMounted(loadSaved);
  watch(photos, cachePhotos);

  return {
    photos,
    addNewToGallery
  };
};
