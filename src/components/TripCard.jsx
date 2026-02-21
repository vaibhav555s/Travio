import './TripCard.css'

const TripCard = ({ destination, dates, budget, badge = 'owner', teamName, onOpen, onEdit }) => {
    return (
        <div className="trip-card">
            {/* amber accent bar lives as ::before pseudo-element */}
            <div className="trip-card-inner">
                <div className="trip-card-top">
                    <h3 className="trip-card-destination">{destination}</h3>
                    <span className={`trip-badge ${badge}`}>
                        {badge === 'owner' ? '🟢 Owner' : '🔵 Team'}
                    </span>
                </div>

                <div className="trip-card-meta">
                    <p className="trip-card-dates">📅 {dates}</p>
                    {budget && <p className="trip-card-budget">₹{budget}</p>}
                    {teamName && <p className="trip-card-dates">👥 {teamName}</p>}
                </div>

                <div className="trip-card-actions">
                    <button className="trip-card-btn primary" onClick={onOpen}>Open</button>
                    {onEdit && <button className="trip-card-btn outline" onClick={onEdit}>Edit</button>}
                </div>
            </div>
        </div>
    )
}

export default TripCard
