import "../css/FeedbackStates.css";

//Use one consistent message layout for empty, loading, and error states.
function EmptyState({ title, message }) {
    return (
        <div className="empty-state" role="status">
            <h2>{title}</h2>
            <p>{message}</p>
        </div>
    );
}

export default EmptyState;
