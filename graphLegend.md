# Légende actualisée du graphe

## Classe
* **Sans surcharge de méthodes et/ou constructeurs**
<p align="center">
    <img src="./readme_files/class.png"/>
</p>

* **Avec surcharge de méthodes**
<p align="center">
    <img src="./readme_files/class_method_overload.png"/>
</p>

PS: La taille du noeud varie en fonction du nombre de méthodes surchargées. 

* **Avec surcharge de constructeurs**
<p align="center">
    <img src="./readme_files/class_constructor_overloads.png"/>
</p>

* **Avec un nombre de variantes**
<p align="center">
    <img src="./readme_files/class_variants.png"/>
</p>

* **Abstraite et non publique**
<p align="center">
    <img src="./readme_files/class_abstract.png"/>
</p>

* **Abstraite et publique**
<p align="center">
    <img src="./readme_files/abstract_public.png"/>
</p>

* **Publique avec un nombre faible de méthodes publiques et un faible pourcentage de méthodes publiques dans la classe**
<p align="center">
    <img src="./readme_files/class_public_green_light.png"/>
</p>

* **Publique avec un nombre élevé de méthodes publiques et un pourcentage élevé de méthodes publiques dans la classe**
<p align="center">
    <img src="./readme_files/class_public_green.png"/>
</p>
<p align="center">
    <img src="./readme_files/class_public_green_more.png"/>
</p>

PS: La visibilité publique s'illustre par la couleur Turquoise qui garde sa saturation de base lorsque le pourcentage de méthodes publiques dans la classe est faible.
Mais qusnd ce pourcentage est élevé, la saturation passe de la turquoise au vert.
Plus ce pourcentage est élevé, plus le vert devient foncé et ceci, quelque soit la nature de la classe ou même d'une interface (Abstract, ...), du moment qu'elle est publique et contient des méthodes publiques.

* **de l'API**
<p align="center">
    <img src="./readme_files/class_api.png"/>
</p> 

PS: Une classe de l'API est représentée par un noeud dont le pourtour est de couleur bleu clair pâle pour la distinguer des autres classes.
Sur l'image ci-dessus, le noeud au centre est une classe de l'API. 

## Interface
* **Non publique**
<p align="center">
    <img src="./readme_files/interface.png"/>
</p>

* **Publique**
<p align="center">
    <img src="./readme_files/interface_public.png"/>
</p>

## Autres noeuds (ni des points de variation, ni des classes de l'API)
* **Non publiques**
<p align="center">
    <img src="./readme_files/variant_non_public.png"/>
</p>

* **Publiques**
<p align="center">
    <img src="./readme_files/variant_public.png"/>
</p>
       
## Pattern
* **Stratey**
<p align="center">
    <img src="./readme_files/strategy.png"/>
</p>

* **Factory**
<p align="center">
    <img src="./readme_files/factory.png"/>
</p>

## Héritage
* **Symbole**
<p align="center">
    <img src="./readme_files/inheritance.png"/>
</p>
PS: La classe représentée par le noeud rouge foncé hérite la classe représentée par le noeud rouge clair.

## Usage
* **Symbole**
<p align="center">
    <img src="./readme_files/usage.png"/>
</p>
PS: La classe représentée par le noeud gris utilise la classe représentée par le noeud rouge. 