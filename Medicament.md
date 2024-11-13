Voici une documentation technique en markdown du composant `Medicament`. Ce composant React affiche une interface utilisateur pour la recherche, le filtrage, et la navigation de médicaments.

---

# Documentation Technique - Composant `Medicament`

## Description

Le composant `Medicament` est une page React dédiée à l'affichage d'une base de données de médicaments. Il permet à l'utilisateur d'effectuer des recherches par nom, de filtrer par catégorie et lettre de l'alphabet, de naviguer entre les pages de résultats, et de visualiser des notifications et les informations météo.

---

## Code Source

### Importations et Configuration Initiale

```javascript
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import UserIcon from '../../../assets/SVG/user-icon.svg';
import BellIcon from '../../../assets/SVG/bell-icon.svg';
import './Medicament.css';
import { getGeolocation } from '../../../outils/weather';
import Footer from '../../Footer';
```

Le composant utilise plusieurs bibliothèques externes :

- **React** pour gérer les états et les effets.
- **Axios** pour les appels HTTP vers l'API backend.
- **React Router** (`useNavigate` et `useSearchParams`) pour la navigation et la gestion des paramètres d'URL.
- **Cookies** pour la gestion des informations d'authentification utilisateur.
- Des icônes SVG (icône utilisateur et cloche pour les notifications) et un fichier CSS pour le style.

### Calcul de Temps Écoulé

La fonction `timeSince` calcule le temps écoulé en fonction d'une date, avec une sortie en français.

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

### Gestion des États et des Effets

```javascript
function Medicament() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [weatherData, setWeatherData] = useState({ temperature: null, condition: null });
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const [medicaments, setMedicaments] = useState([]);
  const [filteredMedicaments, setFilteredMedicaments] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageGroup, setPageGroup] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(''); 
  const medicamentsPerPage = 18;
  const pagesPerGroup = 10;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
```

Les états principaux incluent :

- **user** : informations sur l'utilisateur connecté.
- **notifications** : liste des notifications de l'utilisateur.
- **weatherData** : données météo actuelles de l'utilisateur.
- **notificationVisible** et **userMenuVisible** : états de visibilité pour les notifications et le menu utilisateur.
- **medicaments** et **filteredMedicaments** : liste des médicaments et liste filtrée.
- **selectedLetter** et **selectedCategory** : lettre et catégorie sélectionnées pour le filtrage.
- **searchTerm** : terme de recherche.
- **currentPage** et **pageGroup** : gestion de la pagination.

### Chargement des Données et Navigation

```javascript
  useEffect(() => {
    const userId = Cookies.get('userId');
    const userRole = Cookies.get('userRole');
    const page = parseInt(searchParams.get('page')) || 1;
    const term = searchParams.get('term') || '';
    const filter = searchParams.get('filter') || ''; 
    const letter = searchParams.get('letter') || '';

    setCurrentPage(page);
    setPageGroup(Math.floor((page - 1) / pagesPerGroup));
    setSearchTerm(term);
    setSelectedCategory(filter); 
    setSelectedLetter(letter);

    if (userId) {
      fetchUser(userId);
      fetchNotifications(userId);
      fetchMedicaments(term, page, filter, letter);
      if (userRole === 'admin') {
        navigate('/tableau-de-bord-administrator');
      }
    } else {
      fetchMedicaments(term, page, filter);
    }

    getGeolocation(setWeatherData);
  }, [navigate, searchParams]);
```

L'effet `useEffect` gère les actions initiales au chargement du composant :

- Récupération des cookies `userId` et `userRole` pour obtenir les informations d'utilisateur.
- Mise à jour de la page courante, du terme de recherche, de la catégorie et de la lettre à partir des paramètres de recherche dans l'URL.
- Appels aux fonctions `fetchUser`, `fetchNotifications`, `fetchMedicaments`, et `getGeolocation` pour charger les données utilisateur, notifications, médicaments, et météo.

### Chargement des Médicaments

La fonction `fetchMedicaments` utilise Axios pour récupérer la liste des médicaments avec un terme de recherche, une catégorie et une lettre. Les données sont stockées dans les états `medicaments` et `filteredMedicaments`.

```javascript
const fetchMedicaments = async (term, page, filter = '', letter = '') => {
  try {
    const response = await axios.get(`http://localhost:3001/medicaments/search`, {
      params: { term, page, category: filter, letter }, 
    });
    setMedicaments(response.data);
    setFilteredMedicaments(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération des médicaments :', error);
  }
};
```

### Gestion de la Navigation et des Filtrages

La recherche, le filtrage par lettre et catégorie, et la navigation sont gérés par des fonctions déclenchées lors de l'interaction utilisateur.

#### Recherche

```javascript
const handleSearchClick = () => {
  const term = searchTerm.trim();
  const filter = selectedCategory;

  setSearchParams({ page: 1, term, filter });
  fetchMedicaments(term, 1, filter);
};
```

#### Réinitialisation

```javascript
const handleResetClick = () => {
  setSearchTerm('');
  setSelectedCategory('');
  navigate('/medicament');
};
```

#### Filtrage par Lettre

```javascript
const handleLetterClick = (letter) => {
  setSelectedLetter(letter);
  setSearchParams({ page: 1, term: searchTerm, filter: selectedCategory, letter });
};
```

### Interface Utilisateur

L'interface utilisateur utilise du HTML avec des balises JSX et des classes CSS pour organiser les composants visuels.

```javascript
return (
  <div className="dashboard-container">
    <div className="main-content">
      <div className="section1 top-section">
        <div className="sidebar-item"> INFOPHARMA</div>
        <div className='right-section1'>
          {user && (
            <div className='Notification' onClick={toggleNotification}>
              <img src={BellIcon} alt="Notification"/>
            </div>
          )}
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
                <button onClick={() => navigate('/login')}>Se connecter</button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="section2">Contenu Principal</div>
    </div>
    <Footer />
  </div>
);
```

### Conclusion

Le composant `Medicament` fournit une interface complète pour rechercher, filtrer et afficher des médicaments. Il est conçu pour être extensible et facilement intégrable à une application backend pour gérer les médicaments, les utilisateurs et les notifications.

