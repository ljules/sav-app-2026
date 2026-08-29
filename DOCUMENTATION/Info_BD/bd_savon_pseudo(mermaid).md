classDiagram
direction BT
class caracteristique {
   varchar(255) nom
   bigint(20) id
}
class ingredient {
   float douceur
   float durete
   bit(1) est_corps_gras
   float ins
   float iode
   float lavant
   float sapo
   float sechage
   float solubilite
   float tenue_mousse
   float vol_mousse
   datetime(6) date_creation
   varchar(255) nom
   bigint(20) id
}
class ligne_ingredient {
   float pourcentage
   float quantite
   bigint(20) ingredient_id
   bigint(20) recette_id
}
class mention {
   float note_max
   float note_min
   bigint(20) caracteristique_id
   varchar(255) label
   bigint(20) id
}
class recette {
   float apport_en_eau
   bit(1) avec_soude
   float concentration_alcalin
   float qte_alcalin
   float surgraissage
   datetime(6) date_creation
   bigint(20) utilisateur_id
   varchar(255) description
   varchar(255) titre
   bigint(20) id
}
class resultat {
   float score
   bigint(20) mention_id
   bigint(20) caracteristique_id
   bigint(20) recette_id
}
class role {
   varchar(255) nom
   varchar(255) nom_logic
   bigint(20) id
}
class utilisateur {
   bit(1) est_banned
   datetime(6) date_creation
   bigint(20) role_id
   varchar(255) email
   varchar(255) password
   varchar(255) username
   bigint(20) id
}

ligne_ingredient  -->  ingredient : ingredient_id:id
ligne_ingredient  -->  recette : recette_id:id
mention  -->  caracteristique : caracteristique_id:id
recette  -->  utilisateur : utilisateur_id:id
resultat  -->  caracteristique : caracteristique_id:id
resultat  -->  mention : mention_id:id
resultat  -->  recette : recette_id:id
utilisateur  -->  role : role_id:id
