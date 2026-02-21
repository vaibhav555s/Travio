import { useNavigate } from 'react-router-dom'
import './TeamCard.css'

const TeamCard = ({ id, name, memberCount, tripCount, onView }) => {
    const navigate = useNavigate()
    return (
        <div className="team-card">
            <h3 className="team-card-name">🤝 {name}</h3>
            <div className="team-card-stats">
                <span className="team-stat">👥 {memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                <span className="team-stat">🗺️ {tripCount} trip{tripCount !== 1 ? 's' : ''}</span>
            </div>
            <button className="team-card-btn" onClick={() => onView ? onView() : navigate(`/teams/${id}`)}>
                View Team
            </button>
        </div>
    )
}

export default TeamCard
