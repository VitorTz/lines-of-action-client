import { useEffect, useState } from "react";
import type { UserRankQuery } from "../api/metricsApi";
import type { User } from "../types/user";
import { linesApi } from "../api/linesApi";
import "./RankPage.css";
import type { PageType } from "../types/general";


interface RankPageProps {
    
    navigate: (page: PageType, data?: any) => void

}

const RankPage = ( { navigate }: RankPageProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<UserRankQuery>({
    sort: "rank",
    order: "desc",
    limit: 20,
  });

  async function load() {
    setLoading(true);
    try {
      const res = await linesApi.metrics.getUserRank(filters);
      setUsers(res.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function update<K extends keyof UserRankQuery>(key: K, value: any) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="metrics-container">
      <h1 className="title">Ranking de usuários</h1>

      <div className="filters-card">
        <div className="filter-row">
          <label>Ordenar por:</label>
          <select
            value={filters.sort}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="rank">Rank</option>
            <option value="age">Idade</option>
            <option value="createdAt">Criado em</option>
          </select>
        </div>

        <div className="filter-row">
          <label>Ordem:</label>
          <select
            value={filters.order}
            onChange={(e) => update("order", e.target.value)}
          >
            <option value="desc">Decrescente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>

        <div className="filter-row">
          <label>Rank mínimo:</label>
          <input
            type="number"
            onChange={(e) => update("minRank", Number(e.target.value))}
          />
        </div>

        <div className="filter-row">
          <label>Rank máximo:</label>
          <input
            type="number"
            onChange={(e) => update("maxRank", Number(e.target.value))}
          />
        </div>

        <div className="filter-row">
          <label>Limite:</label>
          <input
            type="number"
            defaultValue={20}
            onChange={(e) => update("limit", Number(e.target.value))}
          />
        </div>

        <button className="apply-btn" onClick={load} disabled={loading}>
          {loading ? "Carregando..." : "Aplicar"}
        </button>
      </div>

      <div className="list-card">
        {users.map((u) => (
          <div key={u.id} className="user-item">
            <div className="user-info">
              <div className="user-name">{u.username}</div>
              <div className="user-meta">
                {
                  u.perfilImageUrl &&
                  <img src={u.perfilImageUrl} width={64} height={64} style={{borderRadius: '64px'}} />
                }                
                Rank: {u.rank}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default RankPage;