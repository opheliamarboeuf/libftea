import { postsApi } from "../api";
import { useUser } from "../../context/UserContext";

export function CreatePostButton({ onPostCreated }: { onPostCreated: () => void }) {

	const { refreshUser } = useUser();
	const handleCreatePost = async (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		try {
			await postsApi.createPost();
			await refreshUser();
			onPostCreated();
		}
		catch (error) {
			console.error('Error:', error);
			// {message} a creer plus tard
		}
	}
	return <button onClick={handleCreatePost}>Post an outfit</button>
}


// Dans le catch, récupérer l’erreur :

// Extraire le message de l’erreur.

// L’afficher à l’utilisateur via un toast, un state errorMessage, ou un petit <div> d’erreur dans le composant.

// Optionnel : désactiver le bouton pendant l’envoi pour éviter les doubles clics, et éventuellement montrer un indicateur de chargement.

// Dans le try, appeler postsApi.createPost avec les valeurs de ton formulaire ou temporaires pour tester.

// Si l’appel réussit, tu peux mettre à jour l’état local pour ajouter le post créé ou rafraîchir les posts existants.

// Dans le catch, récupérer l’erreur :

// Extraire le message de l’erreur.

// L’afficher à l’utilisateur via un toast, un state errorMessage, ou un petit <div> d’erreur dans le composant.

// Optionnel : désactiver le bouton pendant l’envoi pour éviter les doubles clics, et éventuellement montrer un indicateur de chargement.

// En résumé : bouton → fonction async → try/catch → mise à jour du state ou affichage d’erreur.