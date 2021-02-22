let db = firebase.firestore()
firebase.auth().onAuthStateChanged(async function(user) {
    if (user){
         // Signed in
        console.log('signed in')
        console.log(user.uid)

        
        db.collection('users2').doc(user.uid).set({
        name: user.displayName,
        email: user.email
        })

        // Sign-out button
        document.querySelector('.sign-in-or-sign-out').innerHTML = `
            <button class="text-pink-500 underline sign-out">Sign Out</button>  
        `
        document.querySelector('.sign-in-or-sign-out').insertAdjacentHTML(`beforeend`,`
        <a class="block text-white text-2xl text-bottom"> Signed in as ${user.displayName}</a>
         `)

        document.querySelector('.sign-out').addEventListener('click', function(event) {
            console.log('sign out clicked')
            firebase.auth().signOut()
            document.location.href = 'movies.html'
        })

  
        let apiKey = '94ba867a0abf4afb5488edc0c120064e'
        let response = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US`)
        let json = await response.json()
        let movies = json.results
        console.log(movies)

     
        document.querySelector('.movies').insertAdjacentHTML('beforeend',`
            <div class="w-full text-4xl font-bold text-white p-8 text-center"> 
                Movies playing 
            </div>
        `) 
    
        for (let i=0; i<movies.length; i++) {
            let movie = movies[i]
            let userId = user.uid
            let docRef = await db.collection('users2').doc(`${movie.id}-${user.uid}`).get()
            console.log(docRef)
            let watchedMovie = docRef.data()
            let opacityClass = ''
            if (watchedMovie) {
                opacityClass = 'opacity-20'
            }
    
            document.querySelector('.movies').insertAdjacentHTML('beforeend', `
                <div class="w-1/5 p-4 movie-${movie.id}-${userId} ${opacityClass}">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="w-full">
                <a href="#" class="watched-button block text-center text-white bg-green-500 mt-4 px-4 py-2 rounded">I've watched this!</a>
                </div>
            `)
    
            document.querySelector(`.movie-${movie.id}-${userId}`).addEventListener('click', async function(event) {
                event.preventDefault()
                let movieElement = document.querySelector(`.movie-${movie.id}-${user.uid}`)
                movieElement.classList.add('opacity-20')
                await db.collection('users2').doc(`${movie.id}-${user.uid}`).set({})
            }) 

        
            let movieOpacity = document.querySelector(`.movie-${movie.id}-${user.uid}`)
            if (movieOpacity.classList.contains('opacity-20')){
                document.querySelector(`.movie-${movie.id}-${user.uid}`).addEventListener('click', async function(event) {
                event.preventDefault()
                    movieOpacity.classList.remove('opacity-20')
                    await db.collection('users2').doc(`${movie.id}-${user.uid}`).delete()
                }) 
            }   
        }

    } else {
        // Signed out
        console.log('signed out')

       
        document.querySelector('.movies').classList.add('hidden')

        // Initializes FirebaseUI Auth
        let ui = new firebaseui.auth.AuthUI(firebase.auth())

        // FirebaseUI configuration
        let authUIConfig = {
            signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID
            ],
            signInSuccessUrl: 'movies.html'
        }

        // Starts FirebaseUI Auth
        ui.start('.sign-in-or-sign-out', authUIConfig)
    } 



})
  
  // Goal:   Refactor the movies application from last week, so that it supports
  //         user login and each user can have their own watchlist.
  
  // Start:  Your starting point is one possible solution for last week's homework.
  
  // Step 1: Add your Firebase configuration to movies.html, along with the
  //         (provided) script tags for all necessary Firebase services – i.e. Firebase
  //         Auth, Firebase Cloud Firestore, and Firebase UI for Auth; also
  //         add the CSS file for FirebaseUI for Auth.
  // Step 2: Change the main event listener from DOMContentLoaded to 
  //         firebase.auth().onAuthStateChanged and include conditional logic 
  //         shows a login UI when signed, and the list of movies when signed
  //         in. Use the provided .sign-in-or-sign-out element to show the
  //         login UI. If a user is signed-in, display a message like "Signed 
  //         in as <name>" along with a link to "Sign out". Ensure that a document
  //         is set in the "users" collection for each user that signs in to 
  //         your application.
  // Step 3: Setting the TMDB movie ID as the document ID on your "watched" collection
  //         will no longer work. The document ID should now be a combination of the
  //         TMDB movie ID and the user ID indicating which user has watched. 
  //         This "composite" ID could simply be `${movieId}-${userId}`. This should 
  //         be set when the "I've watched" button on each movie is clicked. Likewise, 
  //         when the list of movies loads and is shown on the page, only the movies 
  //         watched by the currently logged-in user should be opaque.