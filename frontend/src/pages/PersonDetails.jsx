import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import MovieCard from "../components/MovieCard";
import "../css/PersonDetails.css";
import { getPersonDetails } from "../services/api";

/*
Program Flow — Person Details
1. useParams reads the personId from /people/:personId.
2. TMDB returns the profile plus appended movie credits in one request.
3. Helper functions format birth information, calculate age, and deduplicate notable credits.
4. Credits are sorted by popularity and reused as linked MovieCard components.
5. Loading, request failure, missing biography, and missing profile-image states have fallbacks.
*/

function formatDate(dateString) {
    if (!dateString) return null;
    const [year, month, day] = dateString.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" })
        .format(new Date(year, month - 1, day));
}

function calculateAge(birthday, deathday) {
    //Use the death date for historical profiles and today's date for living people.
    if (!birthday) return null;
    const [birthYear, birthMonth, birthDay] = birthday.split("-").map(Number);
    const endDate = deathday ? new Date(`${deathday}T00:00:00`) : new Date();
    let age = endDate.getFullYear() - birthYear;
    if (endDate.getMonth() + 1 < birthMonth
        || (endDate.getMonth() + 1 === birthMonth && endDate.getDate() < birthDay)) age -= 1;
    return age;
}

function getNotableCredits(person) {
    const cast = person.movie_credits?.cast ?? [];
    const crew = person.movie_credits?.crew ?? [];
    const relevantCredits = person.known_for_department === "Acting"
        ? cast
        : [...crew.filter((credit) => credit.department === person.known_for_department), ...cast];
    //A Map removes duplicate movies when a person has more than one crew credit on the same film.
    const uniqueCredits = new Map();

    relevantCredits.forEach((credit) => {
        const existing = uniqueCredits.get(credit.id);
        if (!existing || (credit.popularity ?? 0) > (existing.popularity ?? 0)) uniqueCredits.set(credit.id, credit);
    });

    return [...uniqueCredits.values()]
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
        .slice(0, 12);
}

function PersonDetails() {
    const { personId } = useParams();
    const [person, setPerson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profileFailed, setProfileFailed] = useState(false);

    useEffect(() => {
        let requestIsCurrent = true;

        //Ignore an outdated response if the user opens a different person before this request finishes.
        async function loadPerson() {
            setLoading(true);
            setError(null);
            setProfileFailed(false);

            try {
                const details = await getPersonDetails(personId);
                if (requestIsCurrent) setPerson(details);
            } catch (err) {
                console.error(err);
                if (requestIsCurrent) setError("Unable to load this person's information. Please try again later.");
            } finally {
                if (requestIsCurrent) setLoading(false);
            }
        }

        loadPerson();
        return () => { requestIsCurrent = false; };
    }, [personId]);

    if (loading) return <EmptyState title="Loading person..." message="Profile information is coming soon." />;
    if (error) return <EmptyState title="An error occurred" message={error} />;
    if (!person) return <EmptyState title="Person not found" message="Profile information is unavailable." />;

    const birthday = formatDate(person.birthday);
    const deathday = formatDate(person.deathday);
    const age = calculateAge(person.birthday, person.deathday);
    const credits = getNotableCredits(person);

    return (
        <article className="people-page">
            <section className="people-hero">
                <div className="people-profile-wrap">
                    {person.profile_path && !profileFailed ? (
                        <img className="people-profile-image"
                            src={`https://image.tmdb.org/t/p/h632${person.profile_path}`}
                            alt={`${person.name} profile`} onError={() => setProfileFailed(true)} />
                    ) : (
                        <div className="people-profile-image people-profile-fallback">No profile image</div>
                    )}
                </div>

                <div className="people-summary">
                    <p className="people-kicker">Person</p>
                    <h1>{person.name}</h1>
                    <span className="people-department">{person.known_for_department || "Department unavailable"}</span>

                    <dl className="people-facts">
                        <div><dt>Born</dt><dd>{birthday || "Unavailable"}{age !== null && !person.deathday ? ` (age ${age})` : ""}</dd></div>
                        {person.place_of_birth && <div><dt>Birthplace</dt><dd>{person.place_of_birth}</dd></div>}
                        {deathday && <div><dt>Died</dt><dd>{deathday}{age !== null ? ` (age ${age})` : ""}</dd></div>}
                    </dl>
                </div>
            </section>

            <div className="people-sections">
                <section className="people-section">
                    <p className="people-section-label">About</p>
                    <h2>Biography</h2>
                    <p className="people-biography">{person.biography || "No biography is available for this person."}</p>
                </section>

                <section className="people-section">
                    <p className="people-section-label">Selected work</p>
                    <h2>Movie Credits</h2>
                    {credits.length > 0 ? (
                        <div className="movies-grid people-credits-grid">
                            {credits.map((movie) => <MovieCard movie={movie} key={movie.id} />)}
                        </div>
                    ) : <p className="people-empty">No movie credits are available.</p>}
                </section>
            </div>
        </article>
    );
}

export default PersonDetails;
