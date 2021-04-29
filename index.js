const express = require('express') //on importe express
const path = require('path') //on importe path qui est inclu avec node
const exphbs = require('express-handlebars')
const fetch = require('node-fetch')
const helpers = require('handlebars-helpers')(['string']) //on veut juste charger les trucs des strings => plus léger
const bodyParser = require('body-parser')

const PORT = process.env.PORT || 5003 //on choisi le port de notre serveur, soit un port défini dans une variable environnement, soit le port 5003

const app = express() //on crée notre appli

// on passe à catchErrors une fonction async. Elle retourne une fonction prend tous les arguments. (...args) prends en compte tous les arguments des fonctions async que j'ai mis dans mon code. Ensuite ca re retourne notre fonction avec les memes arguments mais on ajoute un .catch qui permettra de cacher l'erreur et de la voir.
//En résumé Je passe une fonction, je recup les params, je retourne la fonction avec les memes params sauf qu'on chache l'erreur et on console log pour la voir. En faisant ca on retirer tous les try catch et à la place mettre nos fonctions async dans catchErrors().

// const catchErrors = asyncFunction => (...args) => asyncFunction(...args).catch(console.error)

const getAllPokemon = async() => {

    //on verifie que ca marche grâce au try catch
    try {
        // On appelle notre api
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151') //await signifie "tu ne passe pas à la suite si tu n'as pas terminé cette ligne. Si on ne la met pas, une erreur arrive à la ligne suivante car il essaira de crée un objet alors qu'il n'a pas fini d'appeler l'API". Utiliser await necessite d'avoir une fonction asynchrone d'ou le async ligne 17

        //on transforme en objet
        const json = await res.json()

        // Pour vérifier dans la console que le tableau de poke existe
        // console.table(json.results) //results vient de l'api. Voir l'api poke pour voir ce qui est dispo

        return json

    } catch (err) {
        console.log(err)
    }
}

const getPokemon = async(pokemon = '1') => {

    //on verifie que ca marche grâce au try catch
    try {
        // On appelle notre api
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`) //await signifie "tu ne passe pas à la suite si tu n'as pas terminé cette ligne. Si on ne la met pas, une erreur arrive à la ligne suivante car il essaira de crée un objet alors qu'il n'a pas fini d'appeler l'API". Utiliser await necessite d'avoir une fonction asynchrone d'ou le async ligne 10

        //on transforme en objet
        const json = await res.json()

        return json


    } catch (err) {
        console.log(err)
    }
}


//Middleware pour permettre à express de lire notre dossier public. Utiliser path permet à coup sur d'avoir le chemin absolue
app.use(express.static(path.join(__dirname, 'public')))
app.engine('.hbs', exphbs({ extname: '.hbs' })) //engine = service de template. On charge handlebars
app.set('view engine', '.hbs') //on charge le view engine, c'est à dire le handlebars de la ligne 11. Ici on configure l'extension. Au lieu d'écrire handlebars comme nom de fichier on écrit hbs

app.use(bodyParser.urlencoded({ extented: false })) //on dit à notre appli qu'on utilise bodyParser, on lui parametre comment on va gerer la transmission d'information (sois librairi externe sois natif de base). Permet de recup les données POST pour les envoyer sur le serveur. La on lui dit qu'on ne veut pas de librairi externe et qu'on utilise le truc par défaut

//get permet de récupérer la page, donc ici on récupère la page à la racine par défault, ensuite on lui demande d'afficher quelque chose. On fait une fonction. Req c'est si on recupère des données de cette page , res c'est ce quon envoie comme réponse à la page (render = renvoyer). Ici on envoie à notre page par default la page handlebars nommée home.
app.get('/', async(req, res) => {

    try {
        // on récupère la fonction qui a crée notre tableau de poke
        const pokemons = await getAllPokemon()

        res.render('home', { pokemons })

    } catch (err) {
        console.log(err)
    }

})

// On récupère les posts de la page /search.hbs
app.post('/search', (req, res) => {

    // on récupère le champs avec le name search
    const search = req.body.search

    // on renvoie vers la page du pokemon chercher
    res.redirect(`/${search}`)
})


// on récupère la page about, on lui renvoie le handlebars about avec les params qui suivent
// app.get('/about', (req, res) => res.render('about', { title: 'About', subtitle: 'Ma about page' }))


// Ici on ne connait pas le nom de la page à l'avance. Donc on récupère dans une variable grâce à :title le nom de la page. Donc la ligne au dessus ne sert plus à rien.

app.get('/notFound', (req, res) => res.render('notFound'))

app.get('/:pokemon', async(req, res) => {

    try {
        // on récupère le titre de la page entrée.
        const search = req.params.pokemon
        const pokemon = await getPokemon(search)

        if (pokemon) {
            // on renvoie comme résultat dans la page about, le titre récupèrer dans l'url
            res.render('pokemon', { pokemon })
        } else {
            res.redirect('notFound')
        }
    } catch (err) {
        console.log(err)
    }
})



app.listen(PORT, () => console.log(`Serveur ouvert sur le port ${PORT}`)) // on ouvre le serveur