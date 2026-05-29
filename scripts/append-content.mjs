// One-off content expansion: append verified destinations + guides.
// Existing entries are preserved; new ones are skipped if the id/slug already exists.
import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const landmarksPath = join(root, "data", "landmarks.json")
const guidesPath = join(root, "data", "guides.json")

const newLandmarks = [
  { id: "musee-des-beaux-arts", name: "Montreal Museum of Fine Arts", nameFr: "Musee des beaux-arts de Montreal", nearestStation: "guy-concordia", category: "culture", description: "Quebec's largest art museum, with a free permanent collection", descriptionFr: "Le plus grand musee d'art du Quebec, avec une collection permanente gratuite" },
  { id: "la-ronde", name: "La Ronde", nameFr: "La Ronde", nearestStation: "jean-drapeau", category: "tourism", description: "Quebec's largest amusement park, on Sainte-Helene Island", descriptionFr: "Le plus grand parc d'attractions du Quebec, sur l'ile Sainte-Helene", walkNote: "About a 20-minute walk or seasonal shuttle from Jean-Drapeau station, on Sainte-Helene Island.", walkNoteFr: "Environ 20 minutes de marche ou navette saisonniere depuis la station Jean-Drapeau, sur l'ile Sainte-Helene." },
  { id: "casino-de-montreal", name: "Casino de Montreal", nameFr: "Casino de Montreal", nearestStation: "jean-drapeau", category: "tourism", description: "Large 24-hour casino on Notre-Dame Island", descriptionFr: "Grand casino ouvert 24 heures sur l'ile Notre-Dame", walkNote: "Reached from Jean-Drapeau station by the 777 shuttle bus or a walk across Notre-Dame Island.", walkNoteFr: "Accessible depuis la station Jean-Drapeau par la navette 777 ou une marche jusqu'a l'ile Notre-Dame." },
  { id: "parc-jean-drapeau", name: "Parc Jean-Drapeau", nameFr: "Parc Jean-Drapeau", nearestStation: "jean-drapeau", category: "parks", description: "Island park with a beach, festivals, and green space", descriptionFr: "Parc insulaire avec plage, festivals et espaces verts" },
  { id: "concordia-university", name: "Concordia University", nameFr: "Universite Concordia", nearestStation: "guy-concordia", category: "education", description: "Major downtown university, Sir George Williams campus", descriptionFr: "Grande universite du centre-ville, campus Sir-George-Williams" },
  { id: "uqam", name: "UQAM", nameFr: "UQAM", nearestStation: "berri-uqam", category: "education", description: "Universite du Quebec a Montreal, connected to Berri-UQAM station", descriptionFr: "Universite du Quebec a Montreal, reliee a la station Berri-UQAM" },
  { id: "chinatown", name: "Montreal Chinatown", nameFr: "Quartier chinois de Montreal", nearestStation: "place-d-armes", category: "tourism", description: "Historic district with restaurants, shops, and ceremonial gates", descriptionFr: "Quartier historique avec restaurants, boutiques et portes ceremoniales" },
  { id: "the-village", name: "The Village", nameFr: "Le Village", nearestStation: "beaudry", category: "tourism", description: "Montreal's Gay Village along Sainte-Catherine East", descriptionFr: "Le Village gai de Montreal le long de la rue Sainte-Catherine Est" },
  { id: "atwater-market", name: "Atwater Market", nameFr: "Marche Atwater", nearestStation: "charlevoix", category: "shopping", description: "Indoor and outdoor public market by the Lachine Canal", descriptionFr: "Marche public interieur et exterieur au bord du canal de Lachine" },
  { id: "sainte-catherine-shopping", name: "Sainte-Catherine Street Shopping", nameFr: "Magasinage rue Sainte-Catherine", nearestStation: "mcgill", category: "shopping", description: "Montreal's main shopping street and the Eaton Centre", descriptionFr: "La principale rue commercante de Montreal et le Centre Eaton" },
  { id: "palais-des-congres", name: "Palais des congres", nameFr: "Palais des congres", nearestStation: "place-d-armes", category: "culture", description: "Montreal's convention centre with its colourful glass wall", descriptionFr: "Le centre des congres de Montreal et son mur de verre colore" },
  { id: "pointe-a-calliere", name: "Pointe-a-Calliere Museum", nameFr: "Musee Pointe-a-Calliere", nearestStation: "place-d-armes", category: "culture", description: "Archaeology and history museum in Old Montreal", descriptionFr: "Musee d'archeologie et d'histoire dans le Vieux-Montreal" },
  { id: "marche-bonsecours", name: "Bonsecours Market", nameFr: "Marche Bonsecours", nearestStation: "champ-de-mars", category: "culture", description: "Historic domed market building in Old Montreal", descriptionFr: "Edifice historique a dome dans le Vieux-Montreal" },
  { id: "city-hall", name: "Montreal City Hall", nameFr: "Hotel de ville de Montreal", nearestStation: "champ-de-mars", category: "tourism", description: "Historic seat of the city government in Old Montreal", descriptionFr: "Siege historique de l'administration municipale dans le Vieux-Montreal" },
  { id: "place-jacques-cartier", name: "Place Jacques-Cartier", nameFr: "Place Jacques-Cartier", nearestStation: "champ-de-mars", category: "tourism", description: "Lively cobblestone square in the heart of Old Montreal", descriptionFr: "Place pavee animee au coeur du Vieux-Montreal" },
  { id: "saputo-stadium", name: "Saputo Stadium", nameFr: "Stade Saputo", nearestStation: "viau", category: "sports", description: "Home of CF Montreal soccer, next to Olympic Park", descriptionFr: "Domicile du CF Montreal, voisin du Parc olympique" },
  { id: "parc-la-fontaine", name: "La Fontaine Park", nameFr: "Parc La Fontaine", nearestStation: "sherbrooke", category: "parks", description: "Large Plateau park with ponds and walking paths", descriptionFr: "Grand parc du Plateau avec etangs et sentiers", walkNote: "About a 10-minute walk from Sherbrooke station.", walkNoteFr: "Environ 10 minutes de marche depuis la station Sherbrooke." },
  { id: "little-italy", name: "Little Italy", nameFr: "Petite Italie", nearestStation: "de-castelnau", category: "tourism", description: "Italian neighbourhood around the Jean-Talon Market", descriptionFr: "Quartier italien autour du marche Jean-Talon" },
  { id: "insectarium", name: "Montreal Insectarium", nameFr: "Insectarium de Montreal", nearestStation: "viau", category: "tourism", description: "Large insect museum next to the Botanical Garden", descriptionFr: "Grand musee d'insectes voisin du Jardin botanique" },
  { id: "place-ville-marie", name: "Place Ville Marie", nameFr: "Place Ville Marie", nearestStation: "mcgill", category: "shopping", description: "Landmark downtown tower with shops and an observation deck", descriptionFr: "Tour emblematique du centre-ville avec boutiques et observatoire" },
  { id: "plateau-mont-royal", name: "Plateau Mont-Royal", nameFr: "Plateau Mont-Royal", nearestStation: "mont-royal", category: "tourism", description: "Trendy neighbourhood known for murals, cafes, and shops", descriptionFr: "Quartier branche connu pour ses murales, cafes et boutiques" },
  { id: "montreal-forum", name: "Montreal Forum", nameFr: "Forum de Montreal", nearestStation: "atwater", category: "culture", description: "Former home of the Canadiens, now an entertainment centre", descriptionFr: "Ancien domicile des Canadiens, aujourd'hui centre de divertissement" },
  { id: "maisonneuve-park", name: "Maisonneuve Park", nameFr: "Parc Maisonneuve", nearestStation: "viau", category: "parks", description: "Large east-end park next to the Botanical Garden", descriptionFr: "Grand parc de l'est, voisin du Jardin botanique" },
  { id: "jacques-cartier-bridge", name: "Jacques Cartier Bridge", nameFr: "Pont Jacques-Cartier", nearestStation: "papineau", category: "tourism", description: "Iconic bridge with seasonal interactive lighting", descriptionFr: "Pont emblematique avec eclairage interactif saisonnier" },
  { id: "mary-queen-of-the-world", name: "Mary Queen of the World Cathedral", nameFr: "Cathedrale Marie-Reine-du-Monde", nearestStation: "bonaventure", category: "culture", description: "Downtown cathedral modelled on St Peter's Basilica in Rome", descriptionFr: "Cathedrale du centre-ville inspiree de la basilique Saint-Pierre de Rome" },
  { id: "complexe-desjardins", name: "Complexe Desjardins", nameFr: "Complexe Desjardins", nearestStation: "place-des-arts", category: "shopping", description: "Downtown shopping and office complex with an indoor plaza", descriptionFr: "Complexe commercial et de bureaux du centre-ville avec place interieure" },
  { id: "mile-end", name: "Mile End", nameFr: "Mile End", nearestStation: "laurier", category: "tourism", description: "Bohemian neighbourhood famous for bagels, cafes, and music", descriptionFr: "Quartier boheme celebre pour ses bagels, cafes et sa musique", walkNote: "About a 10-minute walk from Laurier station.", walkNoteFr: "Environ 10 minutes de marche depuis la station Laurier." },
  { id: "montreal-science-centre", name: "Montreal Science Centre", nameFr: "Centre des sciences de Montreal", nearestStation: "place-d-armes", category: "tourism", description: "Interactive science museum on a pier in the Old Port", descriptionFr: "Musee de sciences interactif sur un quai du Vieux-Port", walkNote: "About a 12-minute walk from Place-d'Armes station through the Old Port.", walkNoteFr: "Environ 12 minutes de marche depuis la station Place-d'Armes a travers le Vieux-Port." },
]

const newGuides = [
  {
    slug: "airport-by-rem",
    title: "Getting to the Airport by REM",
    titleFr: "Se rendre a l'aeroport en REM",
    excerpt: "How to reach Montreal-Trudeau (YUL) airport on the REM light rail.",
    excerptFr: "Comment rejoindre l'aeroport Montreal-Trudeau (YUL) avec le REM.",
    sections: [
      { heading: "The REM Airport Connection", headingFr: "La liaison aeroport du REM", content: "The REM automated light rail links the airport station to downtown Montreal, with a transfer to the Metro at Gare Centrale and McGill. The airport station is indoors and connected to the terminal, so you stay sheltered the whole way.", contentFr: "Le REM relie la station de l'aeroport au centre-ville de Montreal, avec correspondance vers le metro a Gare Centrale et McGill. La station de l'aeroport est interieure et reliee a l'aerogare, ce qui vous garde a l'abri tout le trajet." },
      { heading: "Fares and Payment", headingFr: "Tarifs et paiement", content: "The REM uses the regional ARTM fare system. Your OPUS card works, and you can also tap a credit or debit card at the gates. The airport station has its own fare, so check the current ARTM price before you travel.", contentFr: "Le REM utilise le systeme tarifaire regional ARTM. Votre carte OPUS fonctionne, et vous pouvez aussi payer en approchant une carte de credit ou debit aux barrieres. La station de l'aeroport a son propre tarif, verifiez donc le prix actuel de l'ARTM avant de partir." },
      { heading: "Tips for Travelers", headingFr: "Conseils pour les voyageurs", content: "All REM stations are fully accessible with elevators and level boarding, which helps if you have luggage. Allow extra time during morning and evening peaks, and keep your fare card handy for the transfer at Gare Centrale.", contentFr: "Toutes les stations du REM sont entierement accessibles avec ascenseurs et embarquement de plain-pied, ce qui aide avec les bagages. Prevoyez du temps supplementaire aux heures de pointe et gardez votre titre de transport a portee pour la correspondance a Gare Centrale." },
    ],
  },
  {
    slug: "night-transport",
    title: "Night Transport When the Metro Closes",
    titleFr: "Le transport de nuit quand le metro ferme",
    excerpt: "How to get around Montreal after the Metro stops running for the night.",
    excerptFr: "Comment se deplacer a Montreal apres l'arret du metro pour la nuit.",
    sections: [
      { heading: "Metro Closing Times", headingFr: "Heures de fermeture du metro", content: "The Metro runs from roughly 5:30 AM to around 1:00 AM, with slightly later service on Friday and Saturday nights. Plan to be at your station before the last train, which leaves the terminus earlier than it reaches stations down the line.", contentFr: "Le metro circule d'environ 5h30 a environ 1h00, avec un service un peu plus tard les vendredis et samedis soirs. Prevoyez d'etre a votre station avant le dernier train, qui quitte le terminus plus tot qu'il n'atteint les stations plus loin sur la ligne." },
      { heading: "The Night Bus Network", headingFr: "Le reseau de bus de nuit", content: "After the Metro closes, the STM night bus network takes over on major corridors. Night routes are numbered in the 300s and run through the overnight hours. Your OPUS card or contactless payment works the same way as during the day.", contentFr: "Apres la fermeture du metro, le reseau de bus de nuit de la STM prend le relais sur les grands axes. Les lignes de nuit portent des numeros dans la serie 300 et circulent durant la nuit. Votre carte OPUS ou le paiement sans contact fonctionne comme le jour." },
      { heading: "Planning Ahead", headingFr: "Bien planifier", content: "Night buses run less frequently than daytime service, so check the schedule for your route before heading out. Major hubs like Berri-UQAM connect several night lines, making them useful transfer points late at night.", contentFr: "Les bus de nuit passent moins souvent que le service de jour, verifiez donc l'horaire de votre ligne avant de partir. Les grands points d'echange comme Berri-UQAM relient plusieurs lignes de nuit, ce qui en fait des points de correspondance utiles tard le soir." },
    ],
  },
  {
    slug: "accessibility-and-elevators",
    title: "Metro Accessibility and Elevators",
    titleFr: "Accessibilite et ascenseurs du metro",
    excerpt: "What to know about wheelchair access, elevators, and step-free travel.",
    excerptFr: "Ce qu'il faut savoir sur l'acces en fauteuil roulant, les ascenseurs et les trajets sans marches.",
    sections: [
      { heading: "Which Stations Are Accessible", headingFr: "Quelles stations sont accessibles", content: "Not every Metro station has an elevator, so step-free access varies across the network. Check a station's accessibility status on its page before you travel, especially if you use a wheelchair, a stroller, or have heavy luggage.", contentFr: "Toutes les stations de metro n'ont pas d'ascenseur, l'acces sans marches varie donc sur le reseau. Verifiez le statut d'accessibilite d'une station sur sa page avant de voyager, surtout si vous utilisez un fauteuil roulant, une poussette ou avez des bagages lourds." },
      { heading: "The REM Advantage", headingFr: "L'avantage du REM", content: "All REM stations are fully accessible, with elevators and level boarding between the platform and the train. For step-free trips, building your route around REM and accessible Metro stations is often the smoothest option.", contentFr: "Toutes les stations du REM sont entierement accessibles, avec ascenseurs et embarquement de plain-pied entre le quai et le train. Pour des trajets sans marches, batir votre itineraire autour du REM et des stations de metro accessibles est souvent le plus simple." },
      { heading: "Planning a Step-Free Trip", headingFr: "Planifier un trajet sans marches", content: "When a transfer involves a station without an elevator, look for an alternative interchange that does. Allow extra time, since elevators can occasionally be out of service, and confirm accessibility for both your start and end stations.", contentFr: "Quand une correspondance passe par une station sans ascenseur, cherchez un autre point de correspondance qui en a un. Prevoyez du temps supplementaire, car les ascenseurs peuvent parfois etre hors service, et confirmez l'accessibilite de vos stations de depart et d'arrivee." },
    ],
  },
  {
    slug: "fares-for-visitors",
    title: "Fares and Passes for Visitors",
    titleFr: "Tarifs et passes pour les visiteurs",
    excerpt: "Choosing the right fare for a short trip to Montreal.",
    excerptFr: "Choisir le bon tarif pour un court sejour a Montreal.",
    sections: [
      { heading: "Single Fares and Contactless", headingFr: "Passages simples et sans contact", content: "A single Zone A trip costs $3.75 and is valid for 120 minutes, including transfers. For occasional rides, tapping a credit or debit card at the turnstile is the easiest option and costs the same as a single OPUS trip.", contentFr: "Un passage simple en Zone A coute 3,75$ et est valide 120 minutes, correspondances incluses. Pour des trajets occasionnels, approcher une carte de credit ou debit au tourniquet est le plus simple et coute le meme prix qu'un passage OPUS simple." },
      { heading: "Multi-Trip and Pass Options", headingFr: "Options de carnets et de passes", content: "If you plan several rides, a 10-trip pack or a weekly pass loaded on an OPUS card can save money. The OPUS card itself costs $6 and is reusable, so it pays off over a multi-day visit with frequent travel.", contentFr: "Si vous prevoyez plusieurs trajets, un carnet de 10 passages ou une passe hebdomadaire chargee sur une carte OPUS peut faire economiser. La carte OPUS coute 6$ et est reutilisable, elle devient donc avantageuse lors d'un sejour de plusieurs jours avec deplacements frequents." },
      { heading: "One Fare, Three Networks", headingFr: "Un tarif, trois reseaux", content: "The same ARTM fare covers the STM Metro, the REM, and Exo commuter trains within your zone, and transfers between them are included in the 120-minute window. Most visitor trips stay within Zone A on the island of Montreal.", contentFr: "Le meme tarif ARTM couvre le metro STM, le REM et les trains de banlieue Exo dans votre zone, et les correspondances entre eux sont incluses dans la fenetre de 120 minutes. La plupart des trajets touristiques restent en Zone A sur l'ile de Montreal." },
    ],
  },
  {
    slug: "three-days-by-metro",
    title: "Montreal in 3 Days by Metro",
    titleFr: "Montreal en 3 jours en metro",
    excerpt: "A simple three-day sightseeing route built entirely around the Metro.",
    excerptFr: "Un itineraire touristique simple de trois jours entierement base sur le metro.",
    sections: [
      { heading: "Day 1: Old Montreal", headingFr: "Jour 1 : le Vieux-Montreal", content: "Start in Old Montreal using Place-d'Armes and Champ-de-Mars stations. See Notre-Dame Basilica, Place Jacques-Cartier, the Bonsecours Market, and walk down to the Old Port and the Montreal Science Centre. Pointe-a-Calliere covers the city's archaeology and history.", contentFr: "Commencez dans le Vieux-Montreal avec les stations Place-d'Armes et Champ-de-Mars. Voyez la basilique Notre-Dame, la place Jacques-Cartier, le marche Bonsecours, puis descendez vers le Vieux-Port et le Centre des sciences. Pointe-a-Calliere raconte l'archeologie et l'histoire de la ville." },
      { heading: "Day 2: Downtown and the Mountain", headingFr: "Jour 2 : centre-ville et la montagne", content: "Use Peel and McGill stations for downtown shopping on Sainte-Catherine Street, Place Ville Marie, and the Museum of Fine Arts. Then ride to Mont-Royal station and walk up to Mount Royal Park for the lookout over the city.", contentFr: "Utilisez les stations Peel et McGill pour le magasinage au centre-ville rue Sainte-Catherine, la Place Ville Marie et le Musee des beaux-arts. Rejoignez ensuite la station Mont-Royal et montez au parc du Mont-Royal pour le belvedere sur la ville." },
      { heading: "Day 3: Olympic Park and the East", headingFr: "Jour 3 : le Parc olympique et l'est", content: "Take the Green Line to Pie-IX and Viau for the Olympic Stadium, the Biodome, the Insectarium, and the Botanical Garden, all close together. Maisonneuve Park next door is a good place to finish the day.", contentFr: "Prenez la ligne verte jusqu'a Pie-IX et Viau pour le Stade olympique, le Biodome, l'Insectarium et le Jardin botanique, tous proches les uns des autres. Le parc Maisonneuve voisin est un bon endroit pour terminer la journee." },
    ],
  },
  {
    slug: "canadiens-game",
    title: "Getting to a Canadiens Game at the Bell Centre",
    titleFr: "Se rendre a un match des Canadiens au Centre Bell",
    excerpt: "How to reach the Bell Centre by Metro on game night.",
    excerptFr: "Comment rejoindre le Centre Bell en metro les soirs de match.",
    sections: [
      { heading: "Which Station to Use", headingFr: "Quelle station utiliser", content: "The Bell Centre sits right next to Lucien-L'Allier station on the Orange Line, with Bonaventure station also a short walk away. Both are connected to the downtown pedestrian network, so you can reach the arena without going outside.", contentFr: "Le Centre Bell se trouve juste a cote de la station Lucien-L'Allier sur la ligne orange, et la station Bonaventure est aussi a courte distance. Les deux sont reliees au reseau pieton du centre-ville, ce qui permet d'atteindre l'amphitheatre sans sortir dehors." },
      { heading: "Game Night Crowds", headingFr: "L'affluence les soirs de match", content: "Stations near the Bell Centre get very busy before and after games. Arrive early, and on the way out consider walking one station over to avoid the heaviest crowds at the turnstiles.", contentFr: "Les stations pres du Centre Bell sont tres achalandees avant et apres les matchs. Arrivez tot, et au retour, envisagez de marcher jusqu'a la station voisine pour eviter la cohue aux tourniquets." },
      { heading: "Paying Your Fare", headingFr: "Payer votre passage", content: "Use your OPUS card or tap a credit or debit card at the turnstile. A single fare is valid for 120 minutes, which usually covers your trip to the arena, though it will not cover the ride home after a full game.", contentFr: "Utilisez votre carte OPUS ou approchez une carte de credit ou debit au tourniquet. Un passage simple est valide 120 minutes, ce qui couvre habituellement le trajet vers l'amphitheatre, mais pas le retour apres un match complet." },
    ],
  },
]

function appendUnique(path, incoming, keyFn) {
  const data = JSON.parse(readFileSync(path, "utf8"))
  const existing = new Set(data.map(keyFn))
  let added = 0
  const skipped = []
  for (const item of incoming) {
    const key = keyFn(item)
    if (existing.has(key)) {
      skipped.push(key)
      continue
    }
    data.push(item)
    existing.add(key)
    added++
  }
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n")
  return { total: data.length, added, skipped }
}

const lm = appendUnique(landmarksPath, newLandmarks, (x) => x.id)
const gd = appendUnique(guidesPath, newGuides, (x) => x.slug)
console.log("landmarks:", JSON.stringify(lm))
console.log("guides:", JSON.stringify(gd))
