import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Filter, Calendar, User, Music } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getParentSession } from '../utils/auth';
import styles from './ParentHistory.module.css';

interface HistoryEntry {
  id: string;
  child_name: string;
  track_name: string;
  artist_name: string;
  album_name: string;
  played_at: string;
  duration_ms: number;
  explicit: boolean;
}

interface FilterOptions {
  child_id: string;
  date_from: string;
  date_to: string;
  explicit_only: boolean;
}

const ParentHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    child_id: '',
    date_from: '',
    date_to: '',
    explicit_only: false
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      const session = await getParentSession();
      if (!session) {
        navigate('/auth/parent');
        return;
      }

      // Load children
      const { data: childrenData } = await supabase
        .from('children')
        .select('id, name')
        .eq('parent_id', session.user.id);
      
      setChildren(childrenData || []);

      // Load history with filters
      let query = supabase
        .from('listening_history')
        .select(`
          id,
          played_at,
          track_name,
          artist_name,
          album_name,
          duration_ms,
          explicit,
          children!inner(name)
        `)
        .in('child_id', (childrenData || []).map(c => c.id))
        .order('played_at', { ascending: false })
        .limit(1000);

      if (filters.child_id) {
        query = query.eq('child_id', filters.child_id);
      }

      if (filters.date_from) {
        query = query.gte('played_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('played_at', filters.date_to + 'T23:59:59');
      }

      if (filters.explicit_only) {
        query = query.eq('explicit', true);
      }

      const { data: historyData } = await query;

      const formattedHistory = (historyData || []).map(entry => ({
        id: entry.id,
        child_name: entry.children.name,
        track_name: entry.track_name,
        artist_name: entry.artist_name,
        album_name: entry.album_name,
        played_at: entry.played_at,
        duration_ms: entry.duration_ms,
        explicit: entry.explicit
      }));

      setHistory(formattedHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Heure', 'Enfant', 'Titre', 'Artiste', 'Album', 'Durée', 'Explicite'];
    const csvContent = [
      headers.join(','),
      ...history.map(entry => [
        new Date(entry.played_at).toLocaleDateString('fr-FR'),
        new Date(entry.played_at).toLocaleTimeString('fr-FR'),
        entry.child_name,
        `"${entry.track_name}"`,
        `"${entry.artist_name}"`,
        `"${entry.album_name}"`,
        Math.round(entry.duration_ms / 1000) + 's',
        entry.explicit ? 'Oui' : 'Non'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historique-patou-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Chargement de l'historique...</p>
      </div>
    );
  }

  return (
    <div className={styles.history}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button 
            onClick={() => navigate('/parent/dashboard')}
            className={styles.backButton}
          >
            <ArrowLeft size={20} />
            Retour au tableau de bord
          </button>
          <h1>Historique d'écoute</h1>
          <div className={styles.headerActions}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={styles.filterButton}
            >
              <Filter size={16} />
              Filtres
            </button>
            <button
              onClick={handleExportCSV}
              className={styles.exportButton}
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      {showFilters && (
        <div className={styles.filters}>
          <div className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label>Enfant</label>
              <select
                value={filters.child_id}
                onChange={(e) => setFilters({ ...filters, child_id: e.target.value })}
              >
                <option value="">Tous les enfants</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Date de début</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              />
            </div>
            <div className={styles.filterGroup}>
              <label>Date de fin</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={filters.explicit_only}
                  onChange={(e) => setFilters({ ...filters, explicit_only: e.target.checked })}
                />
                Contenu explicite uniquement
              </label>
            </div>
          </div>
        </div>
      )}

      <main className={styles.content}>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <h3>Total des écoutes</h3>
            <div className={styles.statValue}>{history.length}</div>
          </div>
          <div className={styles.statCard}>
            <h3>Temps total</h3>
            <div className={styles.statValue}>
              {Math.round(history.reduce((acc, entry) => acc + entry.duration_ms, 0) / 60000)}min
            </div>
          </div>
          <div className={styles.statCard}>
            <h3>Contenu explicite</h3>
            <div className={styles.statValue}>
              {history.filter(entry => entry.explicit).length}
            </div>
          </div>
        </div>

        <div className={styles.historyTable}>
          <div className={styles.tableHeader}>
            <div className={styles.tableCell}>Date/Heure</div>
            <div className={styles.tableCell}>Enfant</div>
            <div className={styles.tableCell}>Titre</div>
            <div className={styles.tableCell}>Artiste</div>
            <div className={styles.tableCell}>Durée</div>
            <div className={styles.tableCell}>Statut</div>
          </div>
          
          {history.map(entry => (
            <div key={entry.id} className={styles.tableRow}>
              <div className={styles.tableCell}>
                <div className={styles.dateTime}>
                  <div className={styles.date}>
                    {new Date(entry.played_at).toLocaleDateString('fr-FR')}
                  </div>
                  <div className={styles.time}>
                    {new Date(entry.played_at).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
              <div className={styles.tableCell}>
                <div className={styles.childName}>
                  <User size={14} />
                  {entry.child_name}
                </div>
              </div>
              <div className={styles.tableCell}>
                <div className={styles.trackInfo}>
                  <div className={styles.trackName}>{entry.track_name}</div>
                  <div className={styles.albumName}>{entry.album_name}</div>
                </div>
              </div>
              <div className={styles.tableCell}>
                <div className={styles.artistName}>{entry.artist_name}</div>
              </div>
              <div className={styles.tableCell}>
                <div className={styles.duration}>{formatDuration(entry.duration_ms)}</div>
              </div>
              <div className={styles.tableCell}>
                {entry.explicit && (
                  <span className={styles.explicitBadge}>Explicite</span>
                )}
              </div>
            </div>
          ))}
          
          {history.length === 0 && (
            <div className={styles.emptyState}>
              <Music size={48} />
              <h3>Aucun historique trouvé</h3>
              <p>Aucune écoute ne correspond aux filtres sélectionnés.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ParentHistory;