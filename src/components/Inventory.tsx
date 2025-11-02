import { InventoryRow, analyseInventory, Alert } from '../utils.js';

interface InventoryDraft {
  stock: number;
  defective_stock: number;
  min_threshold: number;
  location: string;
  avg_daily_outflow: number | null;
}

interface InventoryProps {
  rows: Array<InventoryRow & { id: number; defective_stock?: number }>;
  alerts: Alert[];
  loading: boolean;
  savingId: number | null;
  onRefresh(): void;
  onUpdate(id: number, draft: InventoryDraft): Promise<void>;
}

function formatUpdatedAt(value?: string): string {
  if (!value) return '—';
  try {
    const dt = new Date(value);
    if (Number.isNaN(dt.valueOf())) return value;
    return dt.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (err) {
    return value;
  }
}

export function Inventory({
  rows,
  alerts,
  loading,
  savingId,
  onRefresh,
  onUpdate,
}: InventoryProps) {
  const analysis = React.useMemo(() => analyseInventory(rows), [rows]);
  const [drafts, setDrafts] = React.useState<Record<number, InventoryDraft>>({});
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const next: Record<number, InventoryDraft> = {};
    rows.forEach(row => {
      next[row.id] = {
        stock: row.stock ?? 0,
        defective_stock: row.defective_stock ?? 0,
        min_threshold: row.min_threshold ?? 0,
        location: row.location || '',
        avg_daily_outflow:
          row.avg_daily_outflow !== undefined && row.avg_daily_outflow !== null
            ? Number(row.avg_daily_outflow)
            : null,
      };
    });
    setDrafts(next);
  }, [rows]);

  function updateDraft(id: number, key: keyof InventoryDraft, value: string) {
    setDrafts(prev => {
      const current = prev[id] || {
        stock: 0,
        defective_stock: 0,
        min_threshold: 0,
        location: '',
        avg_daily_outflow: null,
      };
      let nextValue: InventoryDraft[keyof InventoryDraft];
      if (key === 'location') {
        nextValue = value;
      } else if (key === 'avg_daily_outflow') {
        nextValue = value === '' ? null : Number(value);
      } else {
        nextValue = Number(value) as any;
      }
      return {
        ...prev,
        [id]: {
          ...current,
          [key]: nextValue,
        },
      };
    });
  }

  async function handleSubmit(id: number) {
    const draft = drafts[id];
    if (!draft) return;
    setError(null);
    try {
      await onUpdate(id, {
        stock: Number.isFinite(draft.stock) ? draft.stock : 0,
        defective_stock: Number.isFinite(draft.defective_stock)
          ? draft.defective_stock
          : 0,
        min_threshold: Number.isFinite(draft.min_threshold) ? draft.min_threshold : 0,
        location: draft.location || '',
        avg_daily_outflow:
          draft.avg_daily_outflow !== null && Number.isFinite(draft.avg_daily_outflow)
            ? draft.avg_daily_outflow
            : null,
      });
    } catch (err: any) {
      setError(err?.message || 'Не удалось сохранить изменения');
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="box">
          <div className="level is-align-items-center">
            <div className="level-left">
              <div>
                <h2 className="title is-4 mb-1">Склад инструмента</h2>
                <p className="has-text-grey">
                  Позиции: {rows.length} · Критически низкий остаток: {analysis.lowStock.length}
                </p>
              </div>
            </div>
            <div className="level-right">
              <button
                className={`button is-link ${loading ? 'is-loading' : ''}`}
                type="button"
                onClick={onRefresh}
              >
                Обновить данные
              </button>
            </div>
          </div>
        </div>

        {error && (
          <article className="message is-danger">
            <div className="message-body">{error}</div>
          </article>
        )}

        <div className="columns">
          <div className="column is-two-thirds">
            <div className="table-container box">
              <table className="table is-fullwidth is-hoverable">
                <thead>
                  <tr>
                    <th>Инструмент</th>
                    <th className="has-text-right">Остаток</th>
                    <th className="has-text-right">Брак</th>
                    <th className="has-text-right">Мин. порог</th>
                    <th>Местоположение</th>
                    <th>Ср. расход/день</th>
                    <th>Обновлено</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => {
                    const draft = drafts[row.id] || {
                      stock: row.stock ?? 0,
                      defective_stock: row.defective_stock ?? 0,
                      min_threshold: row.min_threshold ?? 0,
                      location: row.location || '',
                      avg_daily_outflow:
                        row.avg_daily_outflow !== undefined && row.avg_daily_outflow !== null
                          ? Number(row.avg_daily_outflow)
                          : null,
                    };
                    const isLow = row.stock <= row.min_threshold;
                    return (
                      <tr
                        key={row.id}
                        className={isLow ? 'has-background-warning-light' : undefined}
                      >
                        <td>
                          <strong>{row.tool_name}</strong>
                        </td>
                        <td className="has-text-right" style={{ width: '130px' }}>
                          <input
                            className="input is-small"
                            type="number"
                            value={draft.stock}
                            min={0}
                            onChange={e => updateDraft(row.id, 'stock', e.target.value)}
                          />
                        </td>
                        <td className="has-text-right" style={{ width: '180px' }}>
                          <input
                            className="input is-small"
                            type="number"
                            value={draft.defective_stock}
                            min={0}
                            onChange={e => updateDraft(row.id, 'defective_stock', e.target.value)}
                          />
                        </td>
                        <td className="has-text-right" style={{ width: '160px' }}>
                          <input
                            className="input is-small"
                            type="number"
                            value={draft.min_threshold}
                            min={0}
                            onChange={e => updateDraft(row.id, 'min_threshold', e.target.value)}
                          />
                        </td>
                        <td style={{ minWidth: '160px' }}>
                          <input
                            className="input is-small"
                            value={draft.location}
                            onChange={e => updateDraft(row.id, 'location', e.target.value)}
                          />
                        </td>
                        <td style={{ width: '130px' }}>
                          <input
                            className="input is-small"
                            type="number"
                            step="0.1"
                            value={draft.avg_daily_outflow ?? ''}
                            onChange={e => updateDraft(row.id, 'avg_daily_outflow', e.target.value)}
                          />
                        </td>
                        <td className="is-size-7">{formatUpdatedAt(row.updated_at)}</td>
                        <td className="has-text-right">
                          <button
                            className={`button is-primary is-small ${
                              savingId === row.id ? 'is-loading' : ''
                            }`}
                            type="button"
                            onClick={() => handleSubmit(row.id)}
                          >
                            Сохранить
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!rows.length && (
                    <tr>
                      <td colSpan={8} className="has-text-centered has-text-grey">
                        Нет данных склада
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="column">
            <div className="box">
              <h3 className="title is-6">Низкий остаток</h3>
              {analysis.lowStock.length === 0 && (
                <p className="has-text-grey">Критичных позиций нет</p>
              )}
              {analysis.lowStock.length > 0 && (
                <ul>
                  {analysis.lowStock.map(item => {
                    const days =
                      item.avg_daily_outflow && item.avg_daily_outflow > 0
                        ? (item.stock / item.avg_daily_outflow).toFixed(1)
                        : null;
                    return (
                      <li key={item.tool_name} className="mb-3">
                        <strong>{item.tool_name}</strong>
                        <br />
                        Остаток: {item.stock} (мин {item.min_threshold})
                        {days ? ` · ~${days} дн. до нуля` : ''}
                        {item.location ? ` · ${item.location}` : ''}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="box">
              <h3 className="title is-6">Последние тревоги</h3>
              {alerts.length === 0 && (
                <p className="has-text-grey">Тревог по складу нет</p>
              )}
              {alerts.length > 0 && (
                <ul>
                  {alerts.map((alert, idx) => (
                    <li key={idx} className="mb-2">
                      {alert.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
