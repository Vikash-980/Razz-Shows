import axios from "axios"
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";


// Api to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
    try {
        const { data } = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
        })
        const movies = data.results;
        res.json({ success: true, movies: movies })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Api to add a new show to the database
export const addShow = async (req, res) => {
    try {
        const { movieId, showInput, showPrice } = req.body

        let movie = await Movie.findById(movieId)

        if (!movie) {
            // Fetch movie details and credits from TMDB API
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
                }),
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
                })
            ]);
            // const movieApiData = movieDetailsResponse.data;
            // const movieCreditsData = movieCreditsResponse.data;

            // adminController.js (addShow function ke andar)

            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = movieCreditsResponse.data; // Iska use karna hai

            const movieDetails = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                genres: movieApiData.genres,

                // ✅ FIX: movieCreditsData se cast uthayein aur unka name + profile path store karein
                casts: movieCreditsData.cast.slice(0, 12).map(actor => ({
                    name: actor.name,
                    profile_path: actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : null
                })),

                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime,
            }

            // const movieDetails = {
            //     _id: movieId,
            //     title: movieApiData.title,
            //     overview: movieApiData.overview,
            //     poster_path: movieApiData.poster_path,
            //     backdrop_path: movieApiData.backdrop_path,
            //     genres: movieApiData.genres,
            //     casts: movieApiData.cast,  // doubt
            //     release_date: movieApiData.release_date,
            //     original_language: movieApiData.original_language,
            //     tagline: movieApiData.tagline || "",
            //     vote_average: movieApiData.vote_average,
            //     runtime: movieApiData.runtime,
            // }

            // Add movie to the database
            movie = await Movie.create(movieDetails);

        }

        const showsToCreate = [];

        // 1. Check karein ki showInput exist karta hai
        if (showInput && Array.isArray(showInput)) {
            showInput.forEach(show => {
                const showDate = show.date;

                // 2. Check karein ki show.time exist karta hai aur loop chalne layak hai
                // ?. use karne se agar time undefined hoga toh error nahi aayega
                show.time?.forEach((time) => {
                    const dateTimeString = `${showDate}T${time}`;
                    showsToCreate.push({
                        movie: movieId,
                        showDateTime: new Date(dateTimeString),
                        showPrice,
                        occupiedSeats: {}
                    });
                });
            });
        }

        // const showsToCreate = [];
        // showInput.forEach(show => {
        //     const showDate = show.date;
        //     show.time.forEach((time)=>{
        //         const dateTimeString = `${showDate}T${time}`;
        //         showsToCreate.push({
        //             movie: movieId,
        //             showDateTime: new Date(dateTimeString),
        //             showPrice,
        //             occupiedSeats: {}
        //         })
        //     })
        // });

        if (showsToCreate.length > 0) {
            await Show.insertMany(showsToCreate);
        }

        res.json({ success: true, message: 'Show Added successfully.' })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Api to get all shows from the database
export const getShows = async (req, res) => {
    try {
        const shows = await Show.find({ showDateTime: { $gte: new Date() } }).populate('movie').sort({ showDateTime: 1 });

        // filter unique shows
        const uniqueShows = new Set(shows.map(show => show.movie))
        res.json({ success: true, shows: Array.from(uniqueShows) })

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

// Api to get a single show from the database
export const getShow = async (req, res) => {
    try {
        const { movieId } = req.params;
        // get all upcoming shows for the movie
        const shows = await Show.find({ movie: movieId, showDateTime: { $gte: new Date() } })
        const movie = await Movie.findById(movieId);
        const dateTime = {};

        shows.forEach((show) => {
            const date = show.showDateTime.toISOString().split("T")[0];
            if (!dateTime[date]) {
                dateTime[date] = []
            }
            dateTime[date].push({ time: show.showDateTime, showId: show._id })
        })
        res.json({ success: true, movie, dateTime })
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}