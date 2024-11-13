# Documentation Technique : `MedicamentDetail` 

## Introduction

Le composant `MedicamentDetail` est une page React qui permet d'afficher les détails d'un médicament spécifique. Ce composant est interactif, il récupère des informations sur le médicament, l'utilisateur, les notifications, la météo et les pharmacies à proximité en fonction de la géolocalisation. Il offre également des fonctionnalités pour afficher des images en plein écran et télécharger des fichiers PDF associés au médicament.

## Structure du Code

Le composant se compose de plusieurs parties importantes : 

1. **State Management** : La gestion des états dans React.
2. **Effets de bord (useEffect)** : Pour récupérer les données depuis les API au moment du montage du composant.
3. **Affichage de l'interface utilisateur (UI)** : Composants visuels qui affichent les informations du médicament, les notifications, etc.
4. **Gestion des événements** : Manipulation des événements pour interagir avec l'interface utilisateur (ex : clic sur les images, notifications, etc.).

### 1. Importations

Le fichier commence par l'importation des modules nécessaires :

```javascript
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import UserIcon from '../../../assets/SVG/user-icon.svg';
import BellIcon from '../../../assets/SVG/bell-icon.svg';
import PDF from '../../../assets/SVG/PDF.svg';
import './MedicamentDetail.css';
import Footer from '../../Footer';
```

- **React** : Pour la création des composants.
- **axios** : Pour effectuer des requêtes HTTP.
- **useNavigate, useParams** : Pour la gestion de la navigation et des paramètres d'URL.
- **Cookies** : Pour gérer les cookies d'authentification.
- **Images** : Importation des icônes SVG pour l'utilisateur et les notifications.
- **CSS** : Importation du fichier de styles.
- **Footer** : Composant de pied de page.

### 2. Fonction `timeSince`

Cette fonction convertit une date donnée en une période relative :

```javascript
const timeSince = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) {
    return `il y a ${Math.floor(interval)} an${Math.floor(interval) > 1 ? 's' : ''}`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return `il y a ${Math.floor(interval)} mois`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return `il y a ${Math.floor(interval)} jour${Math.floor(interval) > 1 ? 's' : ''}`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return `il y a ${Math.floor(interval)} heure${Math.floor(interval) > 1 ? 's' : ''}`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    return `il y a ${Math.floor(interval)} minute${Math.floor(interval) > 1 ? 's' : ''}`;
  }
  return `il y a ${Math.floor(seconds)} seconde${Math.floor(seconds) > 1 ? 's' : ''}`;
};
```

Cette fonction calcule combien de temps s'est écoulé depuis une date donnée et retourne une chaîne de caractères en français. Elle est utilisée pour afficher l'heure relative des notifications.

### 3. Fonction `MedicamentDetail`

Cette fonction est le composant principal de la page, qui utilise plusieurs hooks (`useState`, `useEffect`) pour gérer l'état et les effets de bord. Elle récupère les informations du médicament, de l'utilisateur, des notifications, des pharmacies et de la météo.

#### États

Le composant utilise plusieurs états pour stocker les données récupérées :

```javascript
const [user, setUser] = useState(null);
const [notifications, setNotifications] = useState([]);
const [weatherData, setWeatherData] = useState({ temperature: null, condition: null });
const [notificationVisible, setNotificationVisible] = useState(false);
const [userMenuVisible, setUserMenuVisible] = useState(false);
const [medicament, setMedicament] = useState(null);
const [pharmacies, setPharmacies] = useState([]);
const [userCity, setUserCity] = useState('');
const [selectedImage, setSelectedImage] = useState('');
const [isImageFullscreen, setIsImageFullscreen] = useState(false);
```

#### useEffect

Les effets de bord sont gérés via `useEffect`, qui récupère les données à chaque changement de l'ID du médicament ou lors du montage du composant :

```javascript
useEffect(() => {
  const fetchMedicament = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/Medicament/${id}`);
      setMedicament(response.data);
      setSelectedImage(response.data.Image1_Medicament);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du médicament :', error);
    }
  };

  const userId = Cookies.get('userId');
  if (userId) {
    fetchUser(userId);
    fetchNotifications(userId);
  }

  fetchMedicament();
  getGeolocation();
}, [id]);
```

Ce `useEffect` effectue les actions suivantes :
- Récupère les détails du médicament à l'aide de l'ID récupéré via `useParams`.
- Récupère les informations de l'utilisateur et les notifications à l'aide de l'ID utilisateur stocké dans les cookies.
- Récupère les informations météo et la géolocalisation.

### 4. Gestion des événements

#### Clic sur les images

Le code suivant permet de gérer l'événement de clic sur les images pour changer l'image sélectionnée et afficher l'image en plein écran :

```javascript
const handleImageClick = (image) => {
  setSelectedImage(image);
};

const openFullscreenImage = () => {
  setIsImageFullscreen(true);
};

const closeFullscreenImage = () => {
  setIsImageFullscreen(false);
};
```

#### Affichage en plein écran

Le bloc HTML suivant affiche l'image sélectionnée en plein écran si `isImageFullscreen` est vrai :

```javascript
{isImageFullscreen && (
  <div className="fullscreen-overlay" onClick={closeFullscreenImage}>
    <div className="fullscreen-image-container">
      <img 
        className="fullscreen-image" 
        src={`http://localhost:3001/${selectedImage}`} 
        alt="Fullscreen Medicament" 
      />
      <button className="close-button" onClick={closeFullscreenImage}>Fermer</button>
    </div>
  </div>
)}
```

### 5. Rendu de l'interface

Le JSX ci-dessous affiche les informations du médicament, les notifications, les images, la météo, etc.

```javascript
<div className="dashboard-container">
  <div className="main-content">
    <div className="section1 top-section">
      <div className="sidebar-item"> INFOPHARMA</div>
      <div className='right-section1'>
        {user && (
          <>
            <div className='Notification' onClick={toggleNotification}>
              <img src={BellIcon} alt="Notification"/>
            </div>
            {notificationVisible && (
              <div className="notification-container visible">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.Id_Notifications} className='Notification_contenu'>
                      <div>{notification.Notification}</div>
                      <div>{timeSince(notification.Date)}</div>
                      <button onClick={() => deleteNotification(notification.Id_Notifications)}>Supprimer</button>
                    </div>
                  ))
                ) : (
                  <p>Aucune notification pour le moment</p>
                )}
              </div>
            )}
          </>
        )}
        <div className='user-icon' onClick={toggleUserMenu}>
          <img src={UserIcon} alt="User" />
        </div>
        {userMenuVisible && (
          <div className="user-menu visible">
            {user ? (
              <>
                <button onClick={() => navigate('/profil')}>Mon profil</button>
                <button onClick={handleLogout}>Déconnexion</button>
              </>
            ) : (
              <button onClick={() => navigate('/connexion')}>Connexion</button>
            )}
          </div>
        )}
        <div className='MeteoHeure'>
          <div className='Meteo'>
            {weatherData.temperature !== null ? `${weatherData.temperature}°C ${weatherData.condition}` : 'Chargement...'}
          </div>
        </div>
      </div>
    </div>
    <div className="case-container-medicament">
      <div className='case1-medicament'>
        <img 
          className='IMG1-medicament' 
          src={`http://localhost:3001/${selectedImage}`} 
          alt={medicament.Nom_Medicament} 
          onClick={openFullscreenImage}
        />
        <div className='contenair-image-medicament'>
          <img
            className={`IMG2-medicament ${selectedImage === medicament.Image1_Medicament ? 'selected' : ''}`}
            src={`http://localhost:3001/${med

icament.Image1_Medicament}`}
            alt={medicament.Nom_Medicament}
            onClick={() => handleImageClick(medicament.Image1_Medicament)}
          />
          <img
            className={`IMG2-medicament ${selectedImage === medicament.Image2_Medicament ? 'selected' : ''}`}
            src={`http://localhost:3001/${medicament.Image2_Medicament}`}
            alt={medicament.Nom_Medicament}
            onClick={() => handleImageClick(medicament.Image2_Medicament)}
          />
          <img
            className={`IMG2-medicament ${selectedImage === medicament.Image3_Medicament ? 'selected' : ''}`}
            src={`http://localhost:3001/${medicament.Image3_Medicament}`}
            alt={medicament.Nom_Medicament}
            onClick={() => handleImageClick(medicament.Image3_Medicament)}
          />
        </div>
      </div>
      <div className="TextCase">
        <h3>{medicament.Nom_Medicament}</h3>
        <div>{medicament.Description_Medicament}</div>
      </div>
    </div>
  </div>
</div>
```

## Conclusion

Le composant `MedicamentDetail` est un exemple complet d'utilisation de React pour gérer l'affichage des informations détaillées sur un médicament, avec des fonctionnalités d'interaction telles que la sélection d'images, la gestion des notifications et la récupération des données via des API.