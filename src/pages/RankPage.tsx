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
      <h1 className="title">User Ranking</h1>

      <div className="filters-card">
        <div className="filter-row">
          <label>Sort by:</label>
          <select
            value={filters.sort}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="rank">Rank</option>
            <option value="age">Age</option>
            <option value="createdAt">Created At</option>
          </select>
        </div>

        <div className="filter-row">
          <label>Order:</label>
          <select
            value={filters.order}
            onChange={(e) => update("order", e.target.value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <div className="filter-row">
          <label>Min Rank:</label>
          <input
            type="number"
            onChange={(e) => update("minRank", Number(e.target.value))}
          />
        </div>

        <div className="filter-row">
          <label>Max Rank:</label>
          <input
            type="number"
            onChange={(e) => update("maxRank", Number(e.target.value))}
          />
        </div>

        <div className="filter-row">
          <label>Limit:</label>
          <input
            type="number"
            defaultValue={20}
            onChange={(e) => update("limit", Number(e.target.value))}
          />
        </div>

        <button className="apply-btn" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Apply"}
        </button>
      </div>

      <div className="list-card">
        {users.map((u) => (
          <div key={u.id} className="user-item">
            <div className="user-info">
              <div className="user-name">{u.username}</div>
              <div className="user-meta">
                Rank: {u.rank} • Age: {u.age}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default RankPage;