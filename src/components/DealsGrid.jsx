import './DealsGrid.css';
import games from '../../data/games.json';

const formatPrice = (value) =>
  typeof value === 'number' ? `£${value.toFixed(2)}` : value;

export default function DealsGrid({ data = games }) {
  const now = new Date();
  const parseExpiry = (expiry) => {
    if (!expiry) return '未知';
    const end = new Date(expiry);
    const diff = end - now;
    if (diff <= 0) return '结束';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;  
  };

  return (
    <section className="deals-shell">
      <header className="deals-header">
        <div>
          <p className="tagline">限时特惠</p>
          <h2>任天堂 Switch 折扣精选</h2>
        </div>
        <button className="deals-filter">按地区 / 排序</button>
      </header>
      <div className="deals-grid">
        {data.map((game) => (
          <article key={game.slug} className="deal-card">
            <div className="cover" style={{ backgroundImage: `url(${game.cover})` }}>
              <span className="corner-badge">{game.discount}%</span>
              {game.lowest && <span className="lowest-badge">史低价</span>}
            </div>
            <div className="deal-body">
              <div className="title-row">
                <h3>{game.title}</h3>
                <span className="platform">{game.platform}</span>
              </div>
              <p className="genre">{game.genre}</p>
              <div className="price-row">
                <span className="original">{formatPrice(game.list_price)}</span>
                <span className="sale">{formatPrice(game.sale_price)}</span>
              </div>
              <div className="meta-row">
                <span className="lang">{game.languages.join(' · ') || '未知语言'}</span>
                <span className="countdown">{parseExpiry(game.expiry)} 剩余</span>
              </div>
              <button className="cta">立即购买</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
