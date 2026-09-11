// title + description for a card, actions go on the right
export default function CardHeader({ title, description, actions }) {
  return (
    <div className="card-header">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions}
    </div>
  );
}
