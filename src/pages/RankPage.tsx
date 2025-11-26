import { useEffect, useState } from "react";
import type { UserRankQuery } from "../api/metricsApi";
import type { User } from "../types/user";
import { linesApi } from "../api/linesApi";
import "./RankPage.css";
import type { PageType } from "../types/general";
import {
  MapPin,
  Calendar,
  Mail,
  Trophy,
  User as UserIcon,
  Filter,
} from "lucide-react";

interface RankPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const RankPage = ({ navigate }: RankPageProps) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="metrics-page">
      <div className="metrics-container">
        <header className="page-header">
          <h1 className="title">Ranking Global</h1>
        </header>

        <div className="filters-card">
          <div className="filters-header">
            <Filter size={18} />
            <span>Filtros de Busca</span>
          </div>

          <div className="filters-grid">
            <div className="filter-group">
              <label>Ordenar por</label>
              <select
                value={filters.sort}
                onChange={(e) => update("sort", e.target.value)}
              >
                <option value="rank">Rank (Pontuação)</option>
                <option value="age">Idade</option>
                <option value="createdAt">Data de Cadastro</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Ordem</label>
              <select
                value={filters.order}
                onChange={(e) => update("order", e.target.value)}
              >
                <option value="desc">Maior para Menor</option>
                <option value="asc">Menor para Maior</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Rank Mínimo</label>
              <input
                type="number"
                placeholder="0"
                onChange={(e) => update("minRank", Number(e.target.value))}
              />
            </div>

            <div className="filter-group">
              <label>Limite</label>
              <input
                type="number"
                defaultValue={20}
                onChange={(e) => update("limit", Number(e.target.value))}
              />
            </div>
          </div>

          <button className="apply-btn" onClick={load} disabled={loading}>
            {loading ? "Buscando..." : "Aplicar Filtros"}
          </button>
        </div>

        <div className="rank-list">
          {users.map((u, index) => (
            <div key={u.id} className="rank-card">
              <div className="rank-position">#{index + 1}</div>

              <div className="user-avatar-container">
                {u.perfilImageUrl ? (
                  <img
                    src={u.perfilImageUrl}
                    alt={u.username}
                    className="user-avatar"
                  />
                ) : (
                  <div className="user-avatar-placeholder">
                    {u.username.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="user-main-info">
                <div className="user-header">
                  <span className="username">{u.username}</span>
                  <span className="rank-badge">
                    <Trophy size={14} /> {u.rank} pts
                  </span>
                </div>

                <div className="user-details-grid">
                  <div className="detail-item" title="Email">
                    <Mail size={14} />
                    <span>{u.email}</span>
                  </div>

                  <div className="detail-item" title="Idade">
                    <UserIcon size={14} />
                    <span>{u.age} anos</span>
                  </div>

                  <div className="detail-item" title="Localização">
                    <MapPin size={14} />
                    <span>
                      {u.address.city}, {u.address.state} - {u.address.country}
                    </span>
                  </div>

                  <div className="detail-item" title="Membro desde">
                    <Calendar size={14} />
                    <span>Membro desde {formatDate(u.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {users.length === 0 && !loading && (
            <div className="empty-state">
              Nenhum usuário encontrado com estes filtros.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankPage;
